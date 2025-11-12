"""
Workflow DAG Orchestrator

Celery task for executing workflows as DAGs with parallel node execution.
"""
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models import Workflow, WorkflowNode, WorkflowEdge, WorkflowRun, WorkflowRunStatus
from app.models.node_execution import NodeExecution, NodeExecutionStatus
from app.core.dag_engine import DAGEngine
from app.core.node_registry import node_registry
from app.core.log_streaming import stream_workflow_status, stream_node_status
from datetime import datetime
from typing import Dict, Set
import asyncio


@celery_app.task(bind=True)
def run_workflow_orchestrator(self, workflow_run_id: int):
    """
    Main orchestrator task for executing a workflow DAG.
    Executes nodes in topological order with parallel execution where possible.
    """
    db = SessionLocal()
    try:
        # Get workflow run
        workflow_run = db.query(WorkflowRun).filter(WorkflowRun.id == workflow_run_id).first()
        if not workflow_run:
            raise Exception(f"WorkflowRun {workflow_run_id} not found")

        # Update status
        workflow_run.status = WorkflowRunStatus.RUNNING
        workflow_run.started_at = datetime.utcnow()
        db.commit()

        stream_workflow_status(workflow_run_id, "running", "Workflow execution started")

        # Get workflow and graph
        workflow = db.query(Workflow).filter(Workflow.id == workflow_run.workflow_id).first()
        nodes = db.query(WorkflowNode).filter(WorkflowNode.workflow_id == workflow.id).all()
        edges = db.query(WorkflowEdge).filter(WorkflowEdge.workflow_id == workflow.id).all()

        # Build DAG
        node_dicts = [{"node_id": n.node_id} for n in nodes]
        edge_dicts = [{"source_node_id": e.source_node_id, "target_node_id": e.target_node_id} for e in edges]
        dag = DAGEngine(node_dicts, edge_dicts)

        # Create node execution records
        node_exec_map: Dict[str, NodeExecution] = {}
        for node in nodes:
            node_exec = NodeExecution(
                workflow_run_id=workflow_run_id,
                node_id=node.node_id,
                status=NodeExecutionStatus.PENDING
            )
            db.add(node_exec)
            node_exec_map[node.node_id] = node_exec
        db.commit()

        # Execute workflow using DAG engine
        completed_nodes: Set[str] = set()
        running_nodes: Set[str] = set()
        failed = False

        # Build context
        context = {
            "workflow_id": workflow.id,
            "workflow_name": workflow.name,
            "run_id": workflow_run_id,
            "project_id": workflow.project_id,
            "node_outputs": {}  # Store outputs from completed nodes
        }

        # Execute nodes level by level (enables parallelism)
        execution_levels = dag.get_execution_levels()

        for level_idx, level_nodes in enumerate(execution_levels):
            stream_workflow_status(
                workflow_run_id,
                "running",
                f"Executing level {level_idx + 1}/{len(execution_levels)} ({len(level_nodes)} nodes)"
            )

            # Execute all nodes in this level in parallel
            level_tasks = []
            for node_id in level_nodes:
                node_exec = node_exec_map[node_id]
                node_data = next(n for n in nodes if n.node_id == node_id)

                # Create async task for this node
                task = execute_node_async.apply_async(
                    args=[node_exec.id, node_data.node_type, node_data.config, context]
                )
                level_tasks.append((node_id, node_exec, task))
                running_nodes.add(node_id)

            # Wait for all nodes in this level to complete
            for node_id, node_exec, task in level_tasks:
                try:
                    # Wait for task result
                    result = task.get(timeout=1800)  # 30 minute timeout per node

                    # Refresh node execution from DB
                    db.refresh(node_exec)

                    if node_exec.status == NodeExecutionStatus.SUCCESS:
                        completed_nodes.add(node_id)
                        # Store output for downstream nodes
                        if node_exec.output_data:
                            context["node_outputs"][node_id] = node_exec.output_data
                    elif node_exec.status == NodeExecutionStatus.FAILED:
                        failed = True
                        stream_workflow_status(
                            workflow_run_id,
                            "failed",
                            f"Node {node_id} failed: {node_exec.error_message}"
                        )
                        break
                except Exception as e:
                    failed = True
                    node_exec.status = NodeExecutionStatus.FAILED
                    node_exec.error_message = str(e)
                    node_exec.completed_at = datetime.utcnow()
                    db.commit()
                    stream_workflow_status(
                        workflow_run_id,
                        "failed",
                        f"Node {node_id} exception: {str(e)}"
                    )
                    break
                finally:
                    running_nodes.discard(node_id)

            # Stop execution if any node failed
            if failed:
                break

        # Update workflow run status
        if failed:
            workflow_run.status = WorkflowRunStatus.FAILED
            workflow_run.error_message = "One or more nodes failed"
        else:
            workflow_run.status = WorkflowRunStatus.SUCCESS

        workflow_run.completed_at = datetime.utcnow()
        db.commit()

        stream_workflow_status(
            workflow_run_id,
            workflow_run.status,
            f"Workflow execution {workflow_run.status}"
        )

    except Exception as e:
        # Handle orchestrator-level errors
        workflow_run.status = WorkflowRunStatus.FAILED
        workflow_run.error_message = f"Orchestrator error: {str(e)}"
        workflow_run.completed_at = datetime.utcnow()
        db.commit()

        stream_workflow_status(workflow_run_id, "failed", str(e))

    finally:
        db.close()


@celery_app.task(bind=True)
def execute_node_async(self, node_execution_id: int, node_type: str, config: dict, context: dict):
    """
    Execute a single workflow node asynchronously.
    """
    db = SessionLocal()
    try:
        # Get node execution
        node_exec = db.query(NodeExecution).filter(NodeExecution.id == node_execution_id).first()
        if not node_exec:
            raise Exception(f"NodeExecution {node_execution_id} not found")

        # Update status
        node_exec.status = NodeExecutionStatus.RUNNING
        node_exec.started_at = datetime.utcnow()
        db.commit()

        stream_node_status(context["run_id"], node_execution_id, "running")

        # Get node type definition
        node_type_def = node_registry.get(node_type)
        if not node_type_def:
            raise Exception(f"Unknown node type: {node_type}")

        # Execute node
        if node_type_def.executor:
            # Run executor function
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                output_data = loop.run_until_complete(
                    node_type_def.executor(node_execution_id, config, context)
                )
            finally:
                loop.close()

            # Update node execution
            node_exec.output_data = output_data
            node_exec.status = NodeExecutionStatus.SUCCESS
        else:
            raise Exception(f"Node type {node_type} has no executor")

        # Calculate duration
        node_exec.completed_at = datetime.utcnow()
        if node_exec.started_at:
            duration = (node_exec.completed_at - node_exec.started_at).total_seconds()
            node_exec.duration_seconds = duration

        db.commit()

        stream_node_status(context["run_id"], node_execution_id, "success")

        return {"status": "success", "output": output_data}

    except Exception as e:
        # Handle node execution errors
        node_exec.status = NodeExecutionStatus.FAILED
        node_exec.error_message = str(e)
        node_exec.completed_at = datetime.utcnow()

        if node_exec.started_at:
            duration = (node_exec.completed_at - node_exec.started_at).total_seconds()
            node_exec.duration_seconds = duration

        db.commit()

        stream_node_status(context["run_id"], node_execution_id, "failed")

        raise

    finally:
        db.close()
