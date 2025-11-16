from __future__ import annotations

import json
import os

from app.core.celery_app import celery_app
from app.core.config import settings
from app.tasks.terraform import create_stage_run, update_stage_run, get_terraform_dir
from app.utils import run_cli_command, stream_log


def run_infracost_analysis(run_id: int) -> dict:
    """Run Infracost breakdown and capture output."""
    stream_log(run_id, None, "Starting Infracost cost analysis...")

    stage_run_id = create_stage_run(run_id, "infracost")
    terraform_dir = get_terraform_dir(run_id)

    try:
        stream_log(run_id, stage_run_id, "Running infracost breakdown...")
        api_key = settings.infracost_api_key or os.getenv("INFRACOST_API_KEY")
        env_vars = {"INFRACOST_API_KEY": api_key} if api_key else None
        result = run_cli_command(
            ["infracost", "breakdown", "--path", terraform_dir, "--format", "json"],
            env=env_vars,
            log_callback=lambda log: stream_log(run_id, stage_run_id, log),
        )

        if result.success:
            try:
                output_data = json.loads(result.stdout) if result.stdout else {}
                total = output_data.get("totalMonthlyCost", "0")
                stream_log(run_id, stage_run_id, f"Estimated monthly cost: ${total}")
            except json.JSONDecodeError:
                output_data = {"error": "Failed to parse infracost output"}

            update_stage_run(stage_run_id, "success", result.stdout, output_data)
            stream_log(run_id, stage_run_id, "Infracost analysis completed")
            return {"success": True}

        update_stage_run(stage_run_id, "failed", result.stderr)
        stream_log(run_id, stage_run_id, "Infracost analysis failed")
        return {"success": False, "error": result.stderr}

    except Exception as exc:
        error_msg = f"Infracost analysis failed: {exc}"
        update_stage_run(stage_run_id, "failed", error_msg)
        stream_log(run_id, stage_run_id, error_msg)
        return {"success": False, "error": error_msg}


@celery_app.task(bind=True)
def infracost_analysis_task(self, run_id: int):
    """Celery wrapper for infracost analysis."""
    return run_infracost_analysis(run_id)
