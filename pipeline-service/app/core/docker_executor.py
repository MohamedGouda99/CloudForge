"""
Docker Container Executor

Provides functionality to execute workflow nodes in isolated Docker containers.
Handles container lifecycle, log streaming, and volume mounting.
"""
import asyncio
import docker
from docker.errors import DockerException, ImageNotFound
from typing import Dict, Any, Optional, List
import os
import tempfile
import shutil

from app.core.config import settings


class DockerExecutor:
    """
    Manages Docker container execution for workflow nodes.
    """

    def __init__(self):
        try:
            self.client = docker.from_env()
        except DockerException as e:
            self.client = None
            self.init_error = str(e)

    async def run_container(
        self,
        image: str,
        command: List[str],
        working_dir: str = "/workspace",
        volumes: Optional[Dict[str, Dict[str, str]]] = None,
        environment: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None,
        log_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Run a command in a Docker container.

        Args:
            image: Docker image to use
            command: Command to execute (list of strings)
            working_dir: Working directory inside container
            volumes: Volume mounts {host_path: {'bind': container_path, 'mode': 'rw'}}
            environment: Environment variables dict
            timeout: Execution timeout in seconds
            log_callback: Optional callback function for streaming logs (takes str)

        Returns:
            Dict with 'exit_code', 'stdout', 'stderr', 'container_id'
        """
        container = None
        container_id = None

        try:
            # Pull image if not available
            await self._ensure_image_available(image)

            # Prepare volumes
            if volumes is None:
                volumes = {}

            # Run container
            container = await asyncio.to_thread(
                self.client.containers.run,
                image=image,
                command=command,
                working_dir=working_dir,
                volumes=volumes,
                environment=environment or {},
                detach=True,
                remove=False,  # Don't auto-remove so we can get logs
                network_mode="bridge"
            )
            container_id = container.id

            # Stream logs
            stdout = ""
            stderr = ""

            if log_callback:
                # Stream logs in real-time
                for log_line in container.logs(stream=True, follow=True):
                    log_str = log_line.decode('utf-8', errors='replace')
                    stdout += log_str
                    await asyncio.to_thread(log_callback, log_str)
            else:
                # Wait for container to finish and get all logs
                result = await asyncio.to_thread(container.wait, timeout=timeout)
                exit_code = result['StatusCode']

                # Get logs after completion
                logs = await asyncio.to_thread(container.logs, stdout=True, stderr=True)
                stdout = logs.decode('utf-8', errors='replace')

            # Get exit code
            await asyncio.to_thread(container.reload)
            exit_code = container.attrs['State']['ExitCode']

            return {
                'exit_code': exit_code,
                'stdout': stdout,
                'stderr': stderr,
                'container_id': container_id
            }

        except Exception as e:
            return {
                'exit_code': -1,
                'stdout': '',
                'stderr': str(e),
                'container_id': container_id
            }

        finally:
            # Clean up container
            if container:
                try:
                    await asyncio.to_thread(container.remove, force=True)
                except Exception:
                    pass

    async def _ensure_image_available(self, image: str):
        """Pull Docker image if not available locally"""
        if not self.client:
            return
        try:
            await asyncio.to_thread(self.client.images.get, image)
        except ImageNotFound:
            # Pull image
            await asyncio.to_thread(self.client.images.pull, image)

    def stop_container(self, container_id: str, timeout: int = 10):
        """Stop a running container"""
        if not self.client:
            return
        try:
            container = self.client.containers.get(container_id)
            container.stop(timeout=timeout)
            container.remove(force=True)
        except Exception as e:
            print(f"Failed to stop container {container_id}: {str(e)}")


# Global executor instance
docker_executor = DockerExecutor()


async def run_in_container(
    node_execution_id: int,
    image: str,
    command: List[str],
    working_dir: str = ".",
    context: Optional[Dict[str, Any]] = None,
    environment: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Execute a command in a Docker container for a workflow node.

    Args:
        node_execution_id: ID of the node execution
        image: Docker image to use
        command: Command to execute
        working_dir: Working directory (relative to project Terraform files)
        context: Workflow execution context
        environment: Environment variables

    Returns:
        Dict with execution results
    """
    from app.models.node_execution import NodeExecution
    from app.core.database import SessionLocal
    from app.core.log_streaming import stream_node_log
    from app.utils.cli_runner import run_cli_command

    db = SessionLocal()
    try:
        # Get node execution
        node_exec = db.query(NodeExecution).filter(NodeExecution.id == node_execution_id).first()
        if not node_exec:
            raise Exception(f"NodeExecution {node_execution_id} not found")

        # Prepare workspace directory
        # Mount the project's Terraform files into container
        project_id = context.get("project_id") if context else None
        workspace_root = settings.terraform_workspace_dir
        terraform_workspace = os.path.join(workspace_root, f"project_{project_id}") if project_id else "/tmp/terraform"

        # Ensure workspace exists
        os.makedirs(terraform_workspace, exist_ok=True)

        # Prepare volume mounts
        volumes = {
            terraform_workspace: {
                'bind': '/workspace',
                'mode': 'rw'
            }
        }

        # Log callback to stream logs to Redis
        def log_callback(log_line: str):
            # Update database
            node_exec.logs += log_line
            db.commit()

            # Stream to Redis for SSE
            if context and context.get("run_id"):
                stream_node_log(
                    context["run_id"],
                    node_execution_id,
                    log_line
                )

        use_docker = bool(getattr(docker_executor, "client", None))
        if use_docker:
            result = await docker_executor.run_container(
                image=image,
                command=command,
                working_dir=working_dir if working_dir != "." else "/workspace",
                volumes=volumes,
                environment=environment,
                log_callback=log_callback,
                timeout=1800  # 30 minute timeout
            )
        else:
            # Fallback to executing the CLI directly inside the worker
            normalized_dir = working_dir or "."
            if normalized_dir.startswith("/workspace"):
                normalized_dir = normalized_dir[len("/workspace") :]
            normalized_dir = normalized_dir.lstrip("./")
            host_working_dir = (
                os.path.join(terraform_workspace, normalized_dir)
                if normalized_dir
                else terraform_workspace
            )

            cli_result = await asyncio.to_thread(
                run_cli_command,
                command,
                host_working_dir,
                environment,
                log_callback,
            )
            result = {
                "exit_code": cli_result.returncode,
                "stdout": cli_result.stdout,
                "stderr": cli_result.stderr,
                "container_id": None,
            }

        # Update container ID
        node_exec.container_id = result.get('container_id')
        db.commit()

        return result

    finally:
        db.close()
