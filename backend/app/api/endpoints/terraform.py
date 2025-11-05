from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, AsyncGenerator, List, Tuple, Optional
from pydantic import BaseModel
import os
import io
import zipfile
import subprocess
import asyncio
import json
from app.core.database import get_db
from app.core.config import settings
from app.api.endpoints.auth import get_current_user
from app.models import User, Project, Resource, TerraformOutput as TerraformOutputModel, CloudProvider
from app.schemas import TerraformOutput
from app.services.terraform.generator import TerraformGenerator

router = APIRouter()


class TerraformCredentials(BaseModel):
    aws_region: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    azure_subscription_id: Optional[str] = None
    azure_tenant_id: Optional[str] = None
    azure_client_id: Optional[str] = None
    azure_client_secret: Optional[str] = None
    azure_location: Optional[str] = None
    gcp_project_id: Optional[str] = None
    gcp_region: Optional[str] = None
    gcp_credentials_json: Optional[str] = None


def build_terraform_env(
    project: Project,
    credentials: TerraformCredentials,
    project_dir: str
) -> Tuple[Dict[str, str], List[str]]:
    """
    Build environment variables for Terraform commands based on provider credentials.

    Returns the environment dict and a list of temporary files to cleanup after use.
    """
    env = os.environ.copy()
    cleanup_files: List[str] = []

    if project.cloud_provider == CloudProvider.AWS:
        required_fields = ['aws_region', 'aws_access_key_id', 'aws_secret_access_key']
        missing = [field for field in required_fields if not getattr(credentials, field)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing AWS credentials: {', '.join(missing)}"
            )

        env['AWS_REGION'] = credentials.aws_region  # type: ignore[arg-type]
        env['AWS_DEFAULT_REGION'] = credentials.aws_region  # type: ignore[arg-type]
        env['AWS_ACCESS_KEY_ID'] = credentials.aws_access_key_id  # type: ignore[arg-type]
        env['AWS_SECRET_ACCESS_KEY'] = credentials.aws_secret_access_key  # type: ignore[arg-type]
        env['TF_VAR_aws_region'] = credentials.aws_region  # type: ignore[arg-type]

    elif project.cloud_provider == CloudProvider.AZURE:
        required_fields = [
            'azure_subscription_id',
            'azure_tenant_id',
            'azure_client_id',
            'azure_client_secret',
        ]
        missing = [field for field in required_fields if not getattr(credentials, field)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing Azure credentials: {', '.join(missing)}"
            )

        env['ARM_SUBSCRIPTION_ID'] = credentials.azure_subscription_id  # type: ignore[arg-type]
        env['ARM_TENANT_ID'] = credentials.azure_tenant_id  # type: ignore[arg-type]
        env['ARM_CLIENT_ID'] = credentials.azure_client_id  # type: ignore[arg-type]
        env['ARM_CLIENT_SECRET'] = credentials.azure_client_secret  # type: ignore[arg-type]
        env['ARM_USE_OIDC'] = 'false'
        env['ARM_SKIP_PROVIDER_REGISTRATION'] = 'true'
        if credentials.azure_location:
            env['AZURE_DEFAULT_LOCATION'] = credentials.azure_location
            env['TF_VAR_azure_location'] = credentials.azure_location

    elif project.cloud_provider == CloudProvider.GCP:
        required_fields = ['gcp_project_id', 'gcp_credentials_json']
        missing = [field for field in required_fields if not getattr(credentials, field)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing GCP credentials: {', '.join(missing)}"
            )

        # Validate and persist credentials JSON to a temporary file
        credentials_path = os.path.join(project_dir, 'gcp_credentials.json')
        try:
            json.loads(credentials.gcp_credentials_json or '')
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid GCP credentials JSON provided"
            )

        with open(credentials_path, 'w', encoding='utf-8') as creds_file:
            creds_file.write(credentials.gcp_credentials_json or '')

        cleanup_files.append(credentials_path)

        env['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        env['GOOGLE_PROJECT'] = credentials.gcp_project_id  # type: ignore[arg-type]
        env['GOOGLE_CLOUD_PROJECT'] = credentials.gcp_project_id  # type: ignore[arg-type]
        env['TF_VAR_gcp_project'] = credentials.gcp_project_id  # type: ignore[arg-type]
        if credentials.gcp_region:
            env['GOOGLE_REGION'] = credentials.gcp_region
            env['GOOGLE_DEFAULT_REGION'] = credentials.gcp_region
            env['TF_VAR_gcp_region'] = credentials.gcp_region

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported cloud provider: {project.cloud_provider}"
        )

    return env, cleanup_files


def cleanup_temp_files(file_paths: List[str]) -> None:
    """Remove temporary files generated during Terraform operations."""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except OSError:
            pass


def ensure_terraform_files(project: Project, project_id: int, db: Session) -> str:
    """
    Ensure Terraform files exist for a project, generating them if necessary.
    Returns the project directory path.
    """
    project_dir = os.path.join(settings.TERRAFORM_WORKSPACE_DIR, f"project_{project_id}")

    # Check if Terraform files exist
    if not os.path.exists(project_dir) or not os.path.exists(os.path.join(project_dir, "main.tf")):
        # Get resources from database
        resources = db.query(Resource).filter(Resource.project_id == project_id).all()

        if not resources:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project has no resources. Add resources to the canvas and save first."
            )

        # Generate Terraform code
        generator = TerraformGenerator()
        terraform_files = generator.generate_terraform(project, resources)

        # Create project directory
        os.makedirs(project_dir, exist_ok=True)

        # Clean up old terraform files (especially old providers.tf)
        old_files = ['providers.tf']  # Files that were renamed
        for old_file in old_files:
            old_path = os.path.join(project_dir, old_file)
            if os.path.exists(old_path):
                os.remove(old_path)

        # Write Terraform files
        for filename, content in terraform_files.items():
            file_path = os.path.join(project_dir, filename)
            with open(file_path, 'w') as f:
                f.write(content)

    return project_dir


@router.post("/generate/{project_id}", response_model=Dict[str, str])
def generate_terraform(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate Terraform code for a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Get all resources for the project
    resources = db.query(Resource).filter(Resource.project_id == project_id).all()

    if not resources:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project has no resources to generate Terraform code"
        )

    # Generate Terraform code
    generator = TerraformGenerator()
    terraform_files = generator.generate_terraform(project, resources)

    # Save to database
    latest_output = db.query(TerraformOutputModel).filter(
        TerraformOutputModel.project_id == project_id
    ).order_by(TerraformOutputModel.version.desc()).first()

    version = 1 if not latest_output else latest_output.version + 1

    terraform_output = TerraformOutputModel(
        project_id=project_id,
        main_tf=terraform_files.get("main.tf", ""),
        variables_tf=terraform_files.get("variables.tf", ""),
        outputs_tf=terraform_files.get("outputs.tf", ""),
        providers_tf=terraform_files.get("providers.tf", ""),
        version=version
    )

    db.add(terraform_output)
    db.commit()
    db.refresh(terraform_output)

    # Save files to disk
    project_dir = os.path.join(settings.TERRAFORM_WORKSPACE_DIR, f"project_{project_id}")
    os.makedirs(project_dir, exist_ok=True)

    for filename, content in terraform_files.items():
        filepath = os.path.join(project_dir, filename)
        with open(filepath, 'w') as f:
            f.write(content)

    return terraform_files


@router.get("/latest/{project_id}", response_model=TerraformOutput)
def get_latest_terraform(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the latest generated Terraform code for a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Get latest Terraform output
    terraform_output = db.query(TerraformOutputModel).filter(
        TerraformOutputModel.project_id == project_id
    ).order_by(TerraformOutputModel.version.desc()).first()

    if not terraform_output:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Terraform code generated for this project"
        )

    return terraform_output


@router.get("/download/{project_id}")
def download_terraform_files(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download Terraform files as a zip archive"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if files exist
    project_dir = os.path.join(settings.TERRAFORM_WORKSPACE_DIR, f"project_{project_id}")
    if not os.path.exists(project_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terraform files not found. Please generate them first."
        )

    # Create zip file in memory with only the main Terraform files
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Only include the main Terraform configuration files
        terraform_files = ['main.tf', 'provider.tf', 'variables.tf', 'outputs.tf', 'terraform.tfvars']

        for filename in terraform_files:
            file_path = os.path.join(project_dir, filename)
            if os.path.exists(file_path):
                zipf.write(file_path, filename)

    memory_file.seek(0)

    return StreamingResponse(
        memory_file,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=terraform-project-{project_id}.zip"
        }
    )


@router.post("/deploy/{project_id}")
def deploy_infrastructure(
    project_id: int,
    credentials: TerraformCredentials,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deploy infrastructure using Terraform apply"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    project_dir = os.path.join(settings.TERRAFORM_WORKSPACE_DIR, f"project_{project_id}")
    if not os.path.exists(project_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terraform files not found. Please generate them first."
        )

    cleanup: List[str] = []

    try:
        env, cleanup = build_terraform_env(project, credentials, project_dir)

        init_result = subprocess.run(
            ['terraform', 'init'],
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=300
        )

        if init_result.returncode != 0:
            return {
                "success": False,
                "stage": "init",
                "error": init_result.stderr,
                "output": init_result.stdout
            }

        plan_result = subprocess.run(
            ['terraform', 'plan', '-out=tfplan'],
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=300
        )

        if plan_result.returncode != 0:
            return {
                "success": False,
                "stage": "plan",
                "error": plan_result.stderr,
                "output": plan_result.stdout
            }

        apply_result = subprocess.run(
            ['terraform', 'apply', '-auto-approve', 'tfplan'],
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=600
        )

        if apply_result.returncode != 0:
            return {
                "success": False,
                "stage": "apply",
                "error": apply_result.stderr,
                "output": apply_result.stdout
            }

        return {
            "success": True,
            "message": "Infrastructure deployed successfully",
            "init_output": init_result.stdout,
            "plan_output": plan_result.stdout,
            "apply_output": apply_result.stdout
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Terraform operation timed out"
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Terraform is not installed on the server"
        )
    except HTTPException:
        # Re-raise validation errors
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Deployment failed: {str(e)}"
        )
    finally:
        cleanup_temp_files(cleanup)


@router.post("/destroy/{project_id}")
def destroy_infrastructure(
    project_id: int,
    credentials: TerraformCredentials,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Destroy infrastructure using Terraform destroy"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if Terraform files exist
    project_dir = os.path.join(settings.TERRAFORM_WORKSPACE_DIR, f"project_{project_id}")
    if not os.path.exists(project_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terraform files not found. Please generate them first."
        )

    cleanup: List[str] = []

    try:
        env, cleanup = build_terraform_env(project, credentials, project_dir)

        init_result = subprocess.run(
            ['terraform', 'init'],
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=300
        )

        if init_result.returncode != 0:
            return {
                "success": False,
                "stage": "init",
                "error": init_result.stderr,
                "output": init_result.stdout
            }

        destroy_result = subprocess.run(
            ['terraform', 'destroy', '-auto-approve'],
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=600
        )

        if destroy_result.returncode != 0:
            return {
                "success": False,
                "stage": "destroy",
                "error": destroy_result.stderr,
                "output": destroy_result.stdout
            }

        return {
            "success": True,
            "message": "Infrastructure destroyed successfully",
            "init_output": init_result.stdout,
            "destroy_output": destroy_result.stdout
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Terraform destroy operation timed out"
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Terraform is not installed on the server"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Destroy failed: {str(e)}"
        )
    finally:
        cleanup_temp_files(cleanup)


@router.post("/plan/{project_id}")
def plan_infrastructure(
    project_id: int,
    credentials: TerraformCredentials,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run Terraform plan to preview changes without applying them"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Ensure Terraform files exist (auto-generate if needed)
    project_dir = ensure_terraform_files(project, project_id, db)

    cleanup: List[str] = []

    try:
        env, cleanup = build_terraform_env(project, credentials, project_dir)

        init_result = subprocess.run(
            ['terraform', 'init'],
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=300
        )

        if init_result.returncode != 0:
            return {
                "success": False,
                "stage": "init",
                "error": init_result.stderr,
                "output": init_result.stdout
            }

        plan_result = subprocess.run(
            ['terraform', 'plan', '-detailed-exitcode'],
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=300
        )

        # Exit code 0 = no changes, 1 = error, 2 = changes present
        has_changes = plan_result.returncode == 2
        has_error = plan_result.returncode == 1

        if has_error:
            return {
                "success": False,
                "stage": "plan",
                "error": plan_result.stderr,
                "output": plan_result.stdout,
                "has_changes": False
            }

        return {
            "success": True,
            "message": "Plan completed successfully",
            "init_output": init_result.stdout,
            "plan_output": plan_result.stdout,
            "has_changes": has_changes
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Terraform plan operation timed out"
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Terraform is not installed on the server"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plan failed: {str(e)}"
        )
    finally:
        cleanup_temp_files(cleanup)


async def stream_terraform_output(process: subprocess.Popen) -> AsyncGenerator[str, None]:
    """Stream terraform output line by line"""
    try:
        while True:
            # Check if process is still running
            if process.poll() is not None:
                # Process finished, read any remaining output
                for line in process.stdout:
                    yield f"data: {line}\n\n"
                break

            # Read line from stdout
            line = process.stdout.readline()
            if line:
                yield f"data: {line}\n\n"
            else:
                await asyncio.sleep(0.1)

    except Exception as e:
        yield f"data: ERROR: {str(e)}\n\n"
    finally:
        yield "data: [DONE]\n\n"


@router.get("/deploy/stream/{project_id}")
async def deploy_infrastructure_stream(
    project_id: int,
    aws_region: Optional[str] = None,
    aws_access_key_id: Optional[str] = None,
    aws_secret_access_key: Optional[str] = None,
    azure_subscription_id: Optional[str] = None,
    azure_tenant_id: Optional[str] = None,
    azure_client_id: Optional[str] = None,
    azure_client_secret: Optional[str] = None,
    azure_location: Optional[str] = None,
    gcp_project_id: Optional[str] = None,
    gcp_region: Optional[str] = None,
    gcp_credentials_json: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deploy infrastructure with real-time streaming output using Server-Sent Events"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Ensure Terraform files exist (auto-generate if needed)
    project_dir = ensure_terraform_files(project, project_id, db)

    credentials = TerraformCredentials(
        aws_region=aws_region,
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        azure_subscription_id=azure_subscription_id,
        azure_tenant_id=azure_tenant_id,
        azure_client_id=azure_client_id,
        azure_client_secret=azure_client_secret,
        azure_location=azure_location,
        gcp_project_id=gcp_project_id,
        gcp_region=gcp_region,
        gcp_credentials_json=gcp_credentials_json,
    )

    async def event_stream():
        cleanup: List[str] = []
        try:
            try:
                env, cleanup = build_terraform_env(project, credentials, project_dir)
            except HTTPException as exc:
                yield f"data: ERROR: {exc.detail}\n\n"
                yield "data: [DONE]\n\n"
                return

            yield "data: Starting Terraform deployment...\n\n"
            yield "data: === Running terraform init ===\n\n"

            init_process = subprocess.Popen(
                ['terraform', 'init'],
                cwd=project_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            async for line in stream_terraform_output(init_process):
                yield line

            if init_process.returncode != 0:
                yield "data: ERROR: terraform init failed\n\n"
                yield "data: [DONE]\n\n"
                return

            yield "data: \n=== Running terraform plan ===\n\n"
            plan_process = subprocess.Popen(
                ['terraform', 'plan', '-out=tfplan'],
                cwd=project_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            async for line in stream_terraform_output(plan_process):
                yield line

            if plan_process.returncode != 0:
                yield "data: ERROR: terraform plan failed\n\n"
                yield "data: [DONE]\n\n"
                return

            yield "data: \n=== Running terraform apply ===\n\n"
            apply_process = subprocess.Popen(
                ['terraform', 'apply', '-auto-approve', 'tfplan'],
                cwd=project_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            async for line in stream_terraform_output(apply_process):
                yield line

            if apply_process.returncode == 0:
                yield "data: \n=== Deployment completed successfully! ===\n\n"
            else:
                yield "data: ERROR: terraform apply failed\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: FATAL ERROR: {str(e)}\n\n"
            yield "data: [DONE]\n\n"
        finally:
            cleanup_temp_files(cleanup)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/validate/{project_id}")
def validate_terraform(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate Terraform configuration files"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Ensure Terraform files exist (auto-generate if needed)
    project_dir = ensure_terraform_files(project, project_id, db)

    try:
        # Initialize Terraform first
        init_result = subprocess.run(
            ['terraform', 'init', '-backend=false'],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=120
        )

        if init_result.returncode != 0:
            return {
                "success": False,
                "stage": "init",
                "error": init_result.stderr,
                "output": init_result.stdout
            }

        # Run Terraform validate
        validate_result = subprocess.run(
            ['terraform', 'validate', '-json'],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=60
        )

        # Parse JSON output
        try:
            validation_output = json.loads(validate_result.stdout)
        except:
            validation_output = {"raw_output": validate_result.stdout}

        if validate_result.returncode != 0:
            return {
                "success": False,
                "stage": "validate",
                "valid": False,
                "error": validate_result.stderr,
                "validation_output": validation_output
            }

        return {
            "success": True,
            "message": "Configuration is valid",
            "valid": validation_output.get("valid", True),
            "validation_output": validation_output,
            "init_output": init_result.stdout
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Terraform validate operation timed out"
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Terraform is not installed on the server"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation failed: {str(e)}"
        )


@router.get("/destroy/stream/{project_id}")
async def destroy_infrastructure_stream(
    project_id: int,
    aws_region: Optional[str] = None,
    aws_access_key_id: Optional[str] = None,
    aws_secret_access_key: Optional[str] = None,
    azure_subscription_id: Optional[str] = None,
    azure_tenant_id: Optional[str] = None,
    azure_client_id: Optional[str] = None,
    azure_client_secret: Optional[str] = None,
    azure_location: Optional[str] = None,
    gcp_project_id: Optional[str] = None,
    gcp_region: Optional[str] = None,
    gcp_credentials_json: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Destroy infrastructure with real-time streaming output using Server-Sent Events"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Ensure Terraform files exist (auto-generate if needed)
    project_dir = ensure_terraform_files(project, project_id, db)

    credentials = TerraformCredentials(
        aws_region=aws_region,
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        azure_subscription_id=azure_subscription_id,
        azure_tenant_id=azure_tenant_id,
        azure_client_id=azure_client_id,
        azure_client_secret=azure_client_secret,
        azure_location=azure_location,
        gcp_project_id=gcp_project_id,
        gcp_region=gcp_region,
        gcp_credentials_json=gcp_credentials_json,
    )

    async def event_stream():
        cleanup: List[str] = []
        try:
            try:
                env, cleanup = build_terraform_env(project, credentials, project_dir)
            except HTTPException as exc:
                yield f"data: ERROR: {exc.detail}\n\n"
                yield "data: [DONE]\n\n"
                return

            yield "data: Starting Terraform destroy...\n\n"
            yield "data: === Running terraform init ===\n\n"

            init_process = subprocess.Popen(
                ['terraform', 'init'],
                cwd=project_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            async for line in stream_terraform_output(init_process):
                yield line

            if init_process.returncode != 0:
                yield "data: ERROR: terraform init failed\n\n"
                yield "data: [DONE]\n\n"
                return

            yield "data: === Running terraform destroy ===\n\n"
            destroy_process = subprocess.Popen(
                ['terraform', 'destroy', '-auto-approve'],
                cwd=project_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            async for line in stream_terraform_output(destroy_process):
                yield line

            if destroy_process.returncode == 0:
                yield "data: \n=== Infrastructure destroyed successfully! ===\n\n"
            else:
                yield "data: ERROR: terraform destroy failed\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: FATAL ERROR: {str(e)}\n\n"
            yield "data: [DONE]\n\n"
        finally:
            cleanup_temp_files(cleanup)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

