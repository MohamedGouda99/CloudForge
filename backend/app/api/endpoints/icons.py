"""
Icons API endpoint for serving cloud provider icons
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import os

router = APIRouter()

# Base path to Cloud_Services folder (mounted via Docker volume)
CONTAINER_ICONS_PATH = Path('/app/Cloud_Services')
PROJECT_ROOT = Path(__file__).resolve().parents[4]
LOCAL_ICONS_PATH = PROJECT_ROOT / 'Cloud_Services'

if CONTAINER_ICONS_PATH.exists():
    ICONS_BASE_PATH = CONTAINER_ICONS_PATH
else:
    ICONS_BASE_PATH = LOCAL_ICONS_PATH



@router.get("/icons/{provider}/{path:path}")
async def get_icon(provider: str, path: str):
    """
    Serve cloud provider icons from the Cloud_Services folder

    Args:
        provider: Cloud provider (aws, azure, gcp)
        path: Relative path to the icon file

    Returns:
        FileResponse with the icon file
    """
    # Normalize provider name
    provider = provider.lower()

    # Map provider to base folder
    provider_base = {
        'aws': 'AWS',
        'azure': 'Azure/Azure_Public_Service_Icons/Icons',
        'gcp': 'GCP'
    }

    if provider not in provider_base:
        raise HTTPException(status_code=404, detail=f"Unknown provider: {provider}")

    # For AWS, support both Architecture-Service-Icons and Architecture-Group-Icons folders
    base_path = ICONS_BASE_PATH / provider_base[provider]

    if provider == 'aws':
        # Many generated icon paths omit the Architecture-Service-Icons_*/Resource folders.
        # Try the direct path first, then fall back to the well-known AWS icon packs.
        candidates = [base_path / path]

        aws_folders = [
            'Architecture-Service-Icons_07312025',
            'Architecture-Group-Icons_07312025',
            'Resource-Icons_07312025',
            'Category-Icons_07312025',
        ]
        for folder in aws_folders:
            candidates.append(base_path / folder / path)

        # Pick the first existing candidate
        full_path = next((p for p in candidates if p.exists()), candidates[0])
    else:
        full_path = base_path / path

    # Security check: prevent directory traversal
    try:
        full_path = full_path.resolve()
        if not str(full_path).startswith(str(ICONS_BASE_PATH.resolve())):
            raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid path")

    # Check if file exists
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail=f"Icon not found: {path}")

    # Determine media type
    media_type = "image/svg+xml" if full_path.suffix == ".svg" else "image/png"

    return FileResponse(
        path=str(full_path),
        media_type=media_type,
        headers={
            "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
            "Access-Control-Allow-Origin": "*"
        }
    )


@router.get("/icons/catalog")
async def get_icons_catalog():
    """
    Get a catalog of all available icons
    """
    catalog = {
        "aws": [],
        "azure": [],
        "gcp": []
    }

    # Scan AWS icons
    aws_path = ICONS_BASE_PATH / "AWS" / "Architecture-Service-Icons_07312025"
    if aws_path.exists():
        for category_dir in aws_path.iterdir():
            if category_dir.is_dir():
                size_64 = category_dir / "64"
                if size_64.exists():
                    for icon_file in size_64.iterdir():
                        if icon_file.suffix == ".svg":
                            catalog["aws"].append({
                                "name": icon_file.stem,
                                "path": f"/api/icons/aws/{category_dir.name}/64/{icon_file.name}",
                                "category": category_dir.name
                            })

    # Scan Azure icons
    azure_path = ICONS_BASE_PATH / "Azure" / "Azure_Public_Service_Icons" / "Icons"
    if azure_path.exists():
        for category_dir in azure_path.iterdir():
            if category_dir.is_dir():
                for icon_file in category_dir.iterdir():
                    if icon_file.suffix == ".svg":
                        catalog["azure"].append({
                            "name": icon_file.stem,
                            "path": f"/api/icons/azure/{category_dir.name}/{icon_file.name}",
                            "category": category_dir.name
                        })

    # Scan GCP icons
    gcp_path = ICONS_BASE_PATH / "GCP"
    if gcp_path.exists():
        for root, dirs, files in os.walk(gcp_path):
            for file in files:
                if file.endswith('.svg'):
                    rel_path = os.path.relpath(os.path.join(root, file), gcp_path)
                    catalog["gcp"].append({
                        "name": Path(file).stem,
                        "path": f"/api/icons/gcp/{rel_path.replace(os.sep, '/')}",
                        "category": Path(root).name
                    })

    return catalog
