"""Security and cost analysis endpoints for Terraform configurations"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import subprocess
import json
import os

from app.core.database import get_db
from app.core.config import settings
from app.api.endpoints.auth import get_current_user
from app.api.endpoints.terraform import ensure_terraform_files
from app.models import User, Project

router = APIRouter()


@router.post("/tfsec/{project_id}")
def run_tfsec_scan(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run tfsec security scan on Terraform configuration"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    project_dir = ensure_terraform_files(project, project_id, db)

    try:
        tfsec_result = subprocess.run(
            ['tfsec', '--format=json', project_dir],
            capture_output=True,
            text=True,
            timeout=120
        )

        try:
            scan_output = json.loads(tfsec_result.stdout) if tfsec_result.stdout else {"results": []}
        except json.JSONDecodeError:
            scan_output = {"raw_output": tfsec_result.stdout, "results": []}

        has_issues = tfsec_result.returncode == 1

        return {
            "success": True,
            "scan_tool": "tfsec",
            "has_issues": has_issues,
            "issues_count": len(scan_output.get("results", [])),
            "scan_output": scan_output,
            "message": "Security scan completed" + (" - issues found" if has_issues else " - no issues found")
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Tfsec scan timed out")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Tfsec is not installed on the server")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tfsec scan failed: {str(e)}")


@router.post("/terrascan/{project_id}")
def run_terrascan_scan(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run terrascan security scan on Terraform configuration"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dir = ensure_terraform_files(project, project_id, db)

    try:
        terrascan_result = subprocess.run(
            ['terrascan', 'scan', '-t', 'terraform', '-i', 'terraform', '-d', project_dir, '-o', 'json'],
            capture_output=True,
            text=True,
            timeout=120
        )

        try:
            scan_output = json.loads(terrascan_result.stdout) if terrascan_result.stdout else {}
        except json.JSONDecodeError:
            scan_output = {"raw_output": terrascan_result.stdout}

        results = scan_output.get("results", {})
        violations = results.get("violations", [])

        return {
            "success": True,
            "scan_tool": "terrascan",
            "has_issues": len(violations) > 0,
            "issues_count": len(violations),
            "scan_output": scan_output,
            "message": f"Security scan completed - {len(violations)} violations found"
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Terrascan scan timed out")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Terrascan is not installed on the server")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terrascan scan failed: {str(e)}")


@router.post("/infracost/{project_id}")
def run_infracost_estimate(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run infracost cost estimation on Terraform configuration"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dir = ensure_terraform_files(project, project_id, db)

    infracost_api_key = settings.INFRACOST_API_KEY
    if not infracost_api_key:
        raise HTTPException(status_code=500, detail="Infracost API key not configured")

    env = os.environ.copy()
    env['INFRACOST_API_KEY'] = infracost_api_key

    try:
        infracost_result = subprocess.run(
            ['infracost', 'breakdown', '--path', project_dir, '--format', 'json'],
            env=env,
            capture_output=True,
            text=True,
            timeout=180
        )

        try:
            cost_output = json.loads(infracost_result.stdout) if infracost_result.stdout else {}
        except json.JSONDecodeError:
            cost_output = {"raw_output": infracost_result.stdout}

        if infracost_result.returncode != 0:
            return {
                "success": False,
                "scan_tool": "infracost",
                "error": infracost_result.stderr,
                "output": infracost_result.stdout
            }

        total_monthly_cost = cost_output.get("totalMonthlyCost", "0")
        projects_data = cost_output.get("projects", [])

        return {
            "success": True,
            "scan_tool": "infracost",
            "total_monthly_cost": total_monthly_cost,
            "currency": cost_output.get("currency", "USD"),
            "projects_count": len(projects_data),
            "cost_output": cost_output,
            "message": f"Cost estimate completed - ${total_monthly_cost}/month"
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Infracost estimation timed out")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Infracost is not installed on the server")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Infracost estimation failed: {str(e)}")
