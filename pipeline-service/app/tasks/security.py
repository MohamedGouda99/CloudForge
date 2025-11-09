from __future__ import annotations

import json

from app.core.celery_app import celery_app
from app.tasks.terraform import create_stage_run, update_stage_run, get_terraform_dir
from app.utils import run_cli_command, stream_log


def run_tfsec_scan(run_id: int) -> dict:
    """Run tfsec locally and persist the findings."""
    stream_log(run_id, None, "Starting tfsec security scan...")

    stage_run_id = create_stage_run(run_id, "tfsec")
    terraform_dir = get_terraform_dir(run_id)

    try:
        stream_log(run_id, stage_run_id, "Running tfsec scan...")
        result = run_cli_command(
            ["tfsec", terraform_dir, "--format", "json", "--no-color"],
            log_callback=lambda log: stream_log(run_id, stage_run_id, log),
        )

        try:
            output_data = json.loads(result.stdout) if result.stdout else {}
        except json.JSONDecodeError:
            output_data = {"error": "Failed to parse tfsec output"}

        issues_count = len(output_data.get("results", []))
        stream_log(run_id, stage_run_id, f"Found {issues_count} security issues")

        update_stage_run(stage_run_id, "success", result.stdout, output_data)
        stream_log(run_id, stage_run_id, "Tfsec scan completed")

        return {"success": True, "issues_count": issues_count}

    except Exception as exc:
        error_msg = f"Tfsec scan failed: {exc}"
        update_stage_run(stage_run_id, "failed", error_msg)
        stream_log(run_id, stage_run_id, error_msg)
        return {"success": False, "error": error_msg}


@celery_app.task(bind=True)
def tfsec_scan_task(self, run_id: int):
    """Celery wrapper for tfsec scans."""
    return run_tfsec_scan(run_id)


def run_terrascan_scan(run_id: int) -> dict:
    """Run terrascan and store violations."""
    stream_log(run_id, None, "Starting Terrascan compliance scan...")

    stage_run_id = create_stage_run(run_id, "terrascan")
    terraform_dir = get_terraform_dir(run_id)

    try:
        stream_log(run_id, stage_run_id, "Running terrascan scan...")
        result = run_cli_command(
            ["terrascan", "scan", "-t", "terraform", "-d", terraform_dir, "-o", "json"],
            log_callback=lambda log: stream_log(run_id, stage_run_id, log),
        )

        try:
            output_data = json.loads(result.stdout) if result.stdout else {}
        except json.JSONDecodeError:
            output_data = {"error": "Failed to parse terrascan output"}

        violations = output_data.get("results", {}).get("violations", [])
        violations_count = len(violations)
        stream_log(run_id, stage_run_id, f"Found {violations_count} compliance violations")

        update_stage_run(stage_run_id, "success", result.stdout, output_data)
        stream_log(run_id, stage_run_id, "Terrascan scan completed")

        return {"success": True, "violations_count": violations_count}

    except Exception as exc:
        error_msg = f"Terrascan scan failed: {exc}"
        update_stage_run(stage_run_id, "failed", error_msg)
        stream_log(run_id, stage_run_id, error_msg)
        return {"success": False, "error": error_msg}


@celery_app.task(bind=True)
def terrascan_scan_task(self, run_id: int):
    """Celery wrapper for terrascan scans."""
    return run_terrascan_scan(run_id)
