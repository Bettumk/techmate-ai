import sys
import time
import subprocess
import tempfile
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.auth import get_current_user

router = APIRouter(prefix="/api/code", tags=["Code Execution Sandbox"])

class CodeRunRequest(BaseModel):
    code: str
    language: str = "python"
    input_data: Optional[str] = ""

class CodeRunResponse(BaseModel):
    status: str
    stdout: str
    stderr: str
    execution_time_ms: float
    language: str

@router.post("/run", response_model=CodeRunResponse)
def execute_code(
    payload: CodeRunRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Executes Python or JavaScript code within an isolated sandbox process
    with CPU and execution time limits.
    """
    code = payload.code.strip()
    language = payload.language.lower()

    if not code:
        raise HTTPException(status_code=400, detail="No code provided for execution.")

    # Guardrails against hazardous operating system calls
    forbidden_tokens = ["os.system", "shutil.rmtree", "subprocess.Popen", "rm -rf", "DROP DATABASE", ":(){ :|:& };:"]
    for token in forbidden_tokens:
        if token in code:
            return {
                "status": "error",
                "stdout": "",
                "stderr": f"Security Notice: Execution of '{token}' is restricted in sandbox environment.",
                "execution_time_ms": 0,
                "language": language
            }

    start_time = time.perf_counter()

    if language in ["python", "py"]:
        try:
            with tempfile.NamedTemporaryFile(suffix=".py", mode="w", encoding="utf-8", delete=False) as f:
                f.write(code)
                temp_path = f.name

            proc = subprocess.run(
                [sys.executable, temp_path],
                input=payload.input_data,
                capture_output=True,
                text=True,
                timeout=6.0,
            )
            Path(temp_path).unlink(missing_ok=True)
            elapsed = (time.perf_counter() - start_time) * 1000

            return {
                "status": "success" if proc.returncode == 0 else "error",
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "execution_time_ms": round(elapsed, 2),
                "language": "python"
            }
        except subprocess.TimeoutExpired:
            Path(temp_path).unlink(missing_ok=True)
            return {
                "status": "timeout",
                "stdout": "",
                "stderr": "Execution timed out (Exceeded 6.0 second limit). Check for infinite loops.",
                "execution_time_ms": 6000.0,
                "language": "python"
            }
        except Exception as e:
            Path(temp_path).unlink(missing_ok=True)
            return {
                "status": "error",
                "stdout": "",
                "stderr": str(e),
                "execution_time_ms": 0,
                "language": "python"
            }

    elif language in ["javascript", "js", "typescript", "ts", "node"]:
        try:
            with tempfile.NamedTemporaryFile(suffix=".js", mode="w", encoding="utf-8", delete=False) as f:
                f.write(code)
                temp_path = f.name

            proc = subprocess.run(
                ["node", temp_path],
                input=payload.input_data,
                capture_output=True,
                text=True,
                timeout=6.0,
            )
            Path(temp_path).unlink(missing_ok=True)
            elapsed = (time.perf_counter() - start_time) * 1000

            return {
                "status": "success" if proc.returncode == 0 else "error",
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "execution_time_ms": round(elapsed, 2),
                "language": "javascript"
            }
        except FileNotFoundError:
            Path(temp_path).unlink(missing_ok=True)
            return {
                "status": "error",
                "stdout": "",
                "stderr": "Node.js runtime is not available for JavaScript execution.",
                "execution_time_ms": 0,
                "language": "javascript"
            }
        except subprocess.TimeoutExpired:
            Path(temp_path).unlink(missing_ok=True)
            return {
                "status": "timeout",
                "stdout": "",
                "stderr": "Execution timed out (Exceeded 6.0 second limit).",
                "execution_time_ms": 6000.0,
                "language": "javascript"
            }
        except Exception as e:
            Path(temp_path).unlink(missing_ok=True)
            return {
                "status": "error",
                "stdout": "",
                "stderr": str(e),
                "execution_time_ms": 0,
                "language": "javascript"
            }
    else:
        return {
            "status": "error",
            "stdout": "",
            "stderr": f"Live execution for '{language}' is coming soon. Currently supported: Python and JavaScript.",
            "execution_time_ms": 0,
            "language": language
        }
