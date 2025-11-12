from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime
from typing import Dict, List
import json

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
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


def _execute_node(db: SessionLocal, node: WorkflowNode, node_run: WorkflowNodeRun) -> bool:
    node_run.status = WorkflowNodeRunStatus.RUNNING
    node_run.started_at = datetime.utcnow()
    db.commit()

    success = True
    error_message = ""

    node_type = getattr(node, "node_type", None)

    if node_type == NodeType.TERRAFORM_VALIDATE:
        success, error_message = _execute_command(node, node_run, ["terraform", "validate"], cwd=node.config.get("path"))
    elif node_type == NodeType.TERRAFORM_PLAN:
        success, error_message = _execute_command(node, node_run, ["terraform", "plan"], cwd=node.config.get("path"))
    elif node_type == NodeType.TERRAFORM_APPLY:
        success, error_message = _execute_command(node, node_run, ["terraform", "apply", "-auto-approve"], cwd=node.config.get("path"))
    elif node_type == NodeType.TERRAFORM_DESTROY:
        success, error_message = _execute_command(node, node_run, ["terraform", "destroy", "-auto-approve"], cwd=node.config.get("path"))
    elif node_type == NodeType.INFRACOST_ESTIMATE:
        success, error_message = _execute_command(
            node,
            node_run,
            ["infracost", "breakdown", "--path", node.config.get("path", "."), "--format", "json"],
        )
    elif node_type == NodeType.TFSEC_SCAN:
        success, error_message = _execute_command(node, node_run, ["tfsec", node.config.get("path", ".")])
    elif node_type == NodeType.CHECKOV_SCAN:
        success, error_message = _execute_command(
            node,
            node_run,
            ["checkov", "-d", node.config.get("path", "."), "--framework", node.config.get("framework", "terraform")],
        )
    elif node_type == NodeType.TERRASCAN_SCAN:
        success, error_message = _execute_command(
            node,
            node_run,
            ["terrascan", "scan", "-t", "terraform", "-d", node.config.get("path", ".")],
        )
    elif node_type in (NodeType.SLACK_NOTIFICATION, NodeType.EMAIL_NOTIFICATION, NodeType.WEBHOOK_NOTIFICATION):
        payload = json.dumps(node.config or {})
        _append_log(node_run, f"Synthetic notification: {payload}")
        success = True
    else:
        command = node.config.get("command", "")
        if not command:
            success = False
            error_message = "Missing command"
        else:
            success, error_message = _execute_command(node, node_run, command.split(" "), cwd=node.config.get("path"))

    node_run.completed_at = datetime.utcnow()
    if node_run.started_at:
        node_run.duration_seconds = int((node_run.completed_at - node_run.started_at).total_seconds())

    if success:
        node_run.status = WorkflowNodeRunStatus.SUCCESS
    else:
        node_run.status = WorkflowNodeRunStatus.FAILED
        if error_message:
            _append_log(node_run, error_message)

    db.commit()
    return success


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
        nodes = {node.id: node for node in workflow.nodes}
        indegree = defaultdict(int)
        adjacency: Dict[int, List[int]] = defaultdict(list)

        for edge in workflow.edges:
            adjacency[edge.source_id].append(edge.target_id)
            indegree[edge.target_id] += 1

        queue = deque([node_id for node_id in nodes if indegree[node_id] == 0])

        run.status = WorkflowRunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()

        visited = 0
        node_runs_map: Dict[int, WorkflowNodeRun] = {}

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

            success = _execute_node(db, node, node_run)
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
