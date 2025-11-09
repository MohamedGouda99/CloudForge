import subprocess
from typing import Callable, Optional, Dict, List
from dataclasses import dataclass


@dataclass
class CommandResult:
    returncode: int
    stdout: str
    stderr: str
    success: bool


def run_cli_command(
    command: List[str],
    cwd: Optional[str] = None,
    env: Optional[Dict[str, str]] = None,
    log_callback: Optional[Callable[[str], None]] = None,
) -> CommandResult:
    """
    Execute a CLI command and stream output

    Args:
        command: Command and arguments as list
        cwd: Working directory
        env: Environment variables
        log_callback: Callback function for log streaming

    Returns:
        CommandResult with stdout, stderr, and success status
    """
    import os

    # Merge environment variables
    full_env = os.environ.copy()
    if env:
        full_env.update(env)

    try:
        # Run command with real-time output
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=cwd,
            env=full_env,
            text=True,
            bufsize=1,
        )

        stdout_lines = []
        stderr_lines = []

        # Read stdout
        if process.stdout:
            for line in iter(process.stdout.readline, ''):
                if not line:
                    break
                stdout_lines.append(line)
                if log_callback:
                    log_callback(line.rstrip())

        # Read stderr
        if process.stderr:
            for line in iter(process.stderr.readline, ''):
                if not line:
                    break
                stderr_lines.append(line)
                if log_callback:
                    log_callback(f"[ERROR] {line.rstrip()}")

        process.wait()

        stdout = ''.join(stdout_lines)
        stderr = ''.join(stderr_lines)

        return CommandResult(
            returncode=process.returncode,
            stdout=stdout,
            stderr=stderr,
            success=process.returncode == 0,
        )

    except Exception as e:
        error_msg = f"Command execution failed: {str(e)}"
        if log_callback:
            log_callback(f"[ERROR] {error_msg}")
        return CommandResult(
            returncode=-1,
            stdout="",
            stderr=error_msg,
            success=False,
        )
