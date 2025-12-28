from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
import json
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models import User, Project, Resource, CostEstimate

router = APIRouter()


@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated dashboard statistics for the current user.
    Returns:
    - total_projects: Number of projects owned by user
    - total_resources: Total count of resources across all projects
    - total_cost: Sum of monthly costs across all projects
    - currency: Currency for cost display (default USD)
    """
    # Get all projects owned by user
    user_projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    project_ids = [p.id for p in user_projects]

    # Total projects
    total_projects = len(user_projects)

    # Total resources across all projects
    total_resources = db.query(func.count(Resource.id)).filter(
        Resource.project_id.in_(project_ids)
    ).scalar() or 0

    # Total cost from cost estimates
    cost_estimates = db.query(CostEstimate).filter(
        CostEstimate.project_id.in_(project_ids)
    ).all()

    total_cost = 0.0
    currency = "USD"
    for estimate in cost_estimates:
        try:
            total_cost += float(estimate.monthly_cost or 0)
            if estimate.currency:
                currency = estimate.currency
        except (ValueError, TypeError):
            pass

    # Round to 2 decimal places
    total_cost = round(total_cost, 2)

    return {
        "total_projects": total_projects,
        "total_resources": total_resources,
        "total_cost": total_cost,
        "currency": currency,
        "team_members": 1,  # For now, just the current user
    }


@router.get("/analytics", response_model=Dict[str, Any])
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed analytics data for the Analytics page.
    Returns:
    - summary: Overall cost summary
    - projects: Per-project cost breakdown
    - by_provider: Cost aggregated by cloud provider
    - resources: Detailed resource-level costs
    """
    # Get all projects owned by user
    user_projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    project_ids = [p.id for p in user_projects]

    # Get cost estimates for all projects
    cost_estimates = db.query(CostEstimate).filter(
        CostEstimate.project_id.in_(project_ids)
    ).all()

    # Build cost estimate lookup
    cost_by_project = {ce.project_id: ce for ce in cost_estimates}

    # Per-project breakdown
    projects_data = []
    total_cost = 0.0
    currency = "USD"

    # Cost by provider
    provider_costs = {"aws": 0.0, "azure": 0.0, "gcp": 0.0}

    # All resources with costs
    all_resources = []

    for project in user_projects:
        cost_estimate = cost_by_project.get(project.id)
        project_cost = 0.0

        # Always get resource count from database (not from Infracost which only counts paid resources)
        resource_count = db.query(func.count(Resource.id)).filter(
            Resource.project_id == project.id
        ).scalar() or 0

        if cost_estimate:
            try:
                project_cost = float(cost_estimate.monthly_cost or 0)
                currency = cost_estimate.currency or "USD"

                # Parse cost breakdown for detailed resource info
                if cost_estimate.cost_breakdown:
                    try:
                        breakdown = json.loads(cost_estimate.cost_breakdown)
                        projects_in_breakdown = breakdown.get("projects", [])
                        for proj in projects_in_breakdown:
                            proj_breakdown = proj.get("breakdown", {})
                            resources = proj_breakdown.get("resources", [])
                            for res in resources:
                                res_cost = float(res.get("monthlyCost") or 0)
                                if res_cost > 0:
                                    all_resources.append({
                                        "project_id": project.id,
                                        "project_name": project.name,
                                        "name": res.get("name", "Unknown"),
                                        "resource_type": res.get("resourceType", "Unknown"),
                                        "monthly_cost": round(res_cost, 2),
                                        "hourly_cost": round(float(res.get("hourlyCost") or 0), 4),
                                    })
                    except (json.JSONDecodeError, TypeError):
                        pass
            except (ValueError, TypeError):
                pass

        total_cost += project_cost
        provider_costs[project.cloud_provider.value] += project_cost

        projects_data.append({
            "id": project.id,
            "name": project.name,
            "cloud_provider": project.cloud_provider.value,
            "monthly_cost": round(project_cost, 2),
            "resource_count": resource_count,
            "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        })

    # Sort projects by cost (highest first)
    projects_data.sort(key=lambda x: x["monthly_cost"], reverse=True)

    # Sort resources by cost (highest first)
    all_resources.sort(key=lambda x: x["monthly_cost"], reverse=True)

    # Provider breakdown for chart
    by_provider = [
        {"provider": "AWS", "cost": round(provider_costs["aws"], 2), "color": "#FF9900"},
        {"provider": "Azure", "cost": round(provider_costs["azure"], 2), "color": "#0078D4"},
        {"provider": "GCP", "cost": round(provider_costs["gcp"], 2), "color": "#4285F4"},
    ]

    return {
        "summary": {
            "total_cost": round(total_cost, 2),
            "currency": currency,
            "total_projects": len(user_projects),
            "total_resources": sum(p["resource_count"] for p in projects_data),
        },
        "projects": projects_data,
        "by_provider": by_provider,
        "resources": all_resources[:50],  # Limit to top 50 resources
    }
