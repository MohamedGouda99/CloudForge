from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime
from typing import Dict, List
import json
import asyncio

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.node_registry import node_registry
from app.models import (
    WorkflowRun,
    WorkflowRunStatus,
    WorkflowNodeRun,
    WorkflowNodeRunStatus,
    WorkflowNode,
    NodeType,
)
from app.utils import run_cli_command


def _append_log(record: WorkflowNodeRun, line: str):
    record.logs = (record.logs or "") + line + "\n"


def _execute_command(node: WorkflowNode, run_record: WorkflowNodeRun, command: List[str], cwd: str | None = None):
    result = run_cli_command(command, cwd=cwd, log_callback=lambda line: _append_log(run_record, line))
    return result.success, result.stderr


async def _execute_node_async(db: SessionLocal, node: WorkflowNode, node_run: WorkflowNodeRun, workflow_run: WorkflowRun) -> bool:
    """Execute a node using the node registry system"""
    node_run.status = WorkflowNodeRunStatus.RUNNING
    node_run.started_at = datetime.utcnow()
    db.commit()

    success = True
    error_message = ""

    try:
        # Get node type definition from registry
        node_type_str = node.node_type.value if hasattr(node.node_type, 'value') else str(node.node_type)
        node_type_def = node_registry.get(node_type_str)

        if not node_type_def:
            error_message = f"Unknown node type: {node_type_str}"
            success = False
        elif not node_type_def.executor:
            error_message = f"No executor defined for node type: {node_type_str}"
            success = False
        else:
            # Execute node using registered executor
            context = {
                "workflow_id": workflow_run.workflow_id,
                "workflow_run_id": workflow_run.id,
                "node_run_id": node_run.id,
                "project_id": workflow_run.workflow.project_id if hasattr(workflow_run.workflow, 'project_id') else None,
            }

            result = await node_type_def.executor(
                node_execution_id=node_run.id,
                config=node.config or {},
                context=context
            )

            # Check result
            if isinstance(result, dict):
                success = result.get("success", True)
                if not success:
                    error_message = result.get("errors", "") or result.get("error", "")

                # Append output to logs
                if result.get("output"):
                    _append_log(node_run, str(result["output"]))
            else:
                # Executor returned non-dict, assume success
                _append_log(node_run, str(result))

    except Exception as e:
        success = False
        error_message = str(e)
        _append_log(node_run, f"Error: {error_message}")

    node_run.completed_at = datetime.utcnow()
    if node_run.started_at:
        node_run.duration_seconds = int((node_run.completed_at - node_run.started_at).total_seconds())

    if success:
        node_run.status = WorkflowNodeRunStatus.SUCCESS
    else:
        node_run.status = WorkflowNodeRunStatus.FAILED
        if error_message and not node_run.logs:
            _append_log(node_run, error_message)

    db.commit()
    return success


def _execute_node(db: SessionLocal, node: WorkflowNode, node_run: WorkflowNodeRun, workflow_run: WorkflowRun) -> bool:
    """Synchronous wrapper for _execute_node_async"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_execute_node_async(db, node, node_run, workflow_run))
    finally:
        loop.close()


@celery_app.task(bind=True, name="workflow.execute")
def execute_workflow_task(self, workflow_run_id: int):
    db = SessionLocal()
    try:
        run = (
            db.query(WorkflowRun)
            .filter(WorkflowRun.id == workflow_run_id)
            .first()
        )
        if not run:
            return

        workflow = run.workflow
        nodes = {node.node_id: node for node in workflow.nodes}
        indegree: Dict[str, int] = defaultdict(int)
        adjacency: Dict[str, List[str]] = defaultdict(list)

        # Ensure every node has an indegree entry
        for node_id in nodes.keys():
            indegree[node_id] = 0

        for edge in workflow.edges:
            source = edge.source_node_id
            target = edge.target_node_id
            adjacency[source].append(target)
            indegree[target] += 1

        queue = deque([node_id for node_id in nodes if indegree[node_id] == 0])

        run.status = WorkflowRunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()

        visited = 0
        node_runs_map: Dict[str, WorkflowNodeRun] = {}

        while queue:
            node_id = queue.popleft()
            visited += 1
            node = nodes[node_id]

            node_run = WorkflowNodeRun(
                workflow_run_id=run.id,
                workflow_node_id=node.id,
            )
            db.add(node_run)
            db.commit()
            node_runs_map[node_id] = node_run

            success = _execute_node(db, node, node_run, run)
            if not success:
                run.status = WorkflowRunStatus.FAILED
                run.error_message = f"Node '{node.label}' failed"
                run.completed_at = datetime.utcnow()
                db.commit()
                return

            for neighbor in adjacency[node_id]:
                indegree[neighbor] -= 1
                if indegree[neighbor] == 0:
                    queue.append(neighbor)

        if visited != len(nodes):
            run.status = WorkflowRunStatus.FAILED
            run.error_message = "Cycle detected or disconnected graph"
        else:
            run.status = WorkflowRunStatus.SUCCESS
        run.completed_at = datetime.utcnow()
        db.commit()

    finally:
        db.close()
