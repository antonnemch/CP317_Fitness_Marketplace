# run_dev.py
# Cross-platform one-command dev launcher for CP317 Fitness Marketplace.
# Usage: python launch_app.py
# Requirements:
# - Python 3.10+ installed
# - Node.js + npm installed (for frontend)

import os
import sys
import subprocess
import shutil
from pathlib import Path
import time
import signal

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend_react"
BACKEND_VENV = BACKEND / ".venv"

def is_windows() -> bool:
    return os.name == "nt"

def venv_python(venv_dir: Path) -> str:
    """Return path to the venv's python executable."""
    if is_windows():
        return str(venv_dir / "Scripts" / "python.exe")
    else:
        return str(venv_dir / "bin" / "python")

def ensure_backend_venv_and_deps():
    """Create backend/.venv if missing and install requirements."""
    if not BACKEND_VENV.exists():
        print("[backend] Creating virtual environment...")
        subprocess.check_call([sys.executable, "-m", "venv", str(BACKEND_VENV)])

    py = venv_python(BACKEND_VENV)

    # Upgrade pip (quietly, best-effort)
    try:
        subprocess.check_call([py, "-m", "pip", "install", "--upgrade", "pip", "wheel", "setuptools"])
    except subprocess.CalledProcessError:
        pass

    req = BACKEND / "requirements.txt"
    if req.exists():
        print("[backend] Installing Python dependencies from requirements.txt...")
        subprocess.check_call([py, "-m", "pip", "install", "-r", str(req)])
    else:
        print("[backend] WARNING: requirements.txt not found; continuing without installs.")

def ensure_frontend_deps():
    """Run npm install in frontend_react if node_modules is missing."""
    node_modules = FRONTEND / "node_modules"
    if not FRONTEND.exists():
        print(f"[frontend] ERROR: {FRONTEND} not found.")
        return
    if not shutil.which("npm"):
        print("[frontend] ERROR: npm not found. Install Node.js LTS from https://nodejs.org/ and retry.")
        return

    if not node_modules.exists():
        print("[frontend] Installing npm dependencies (npm install)...")
        subprocess.check_call(["npm", "install"], cwd=str(FRONTEND), shell=is_windows())

    # Ensure .env exists with API URL; create a default if missing
    env_file = FRONTEND / ".env"
    if not env_file.exists():
        print("[frontend] Creating default .env with VITE_API_URL...")
        env_file.write_text("VITE_API_URL=http://127.0.0.1:5000/api\n", encoding="utf-8")

def start_backend():
    """Start Flask backend via the venv python, running backend.app as a module."""
    py = venv_python(BACKEND_VENV)
    env = os.environ.copy()
    # Ensure repo root is on PYTHONPATH so 'from backend...' works
    env["PYTHONPATH"] = str(ROOT)
    # Run from repo root so package imports resolve
    print("[backend] Starting Flask API at http://127.0.0.1:5000 ...")
    return subprocess.Popen(
        [py, "-m", "backend.app"],
        cwd=str(ROOT),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

def start_frontend():
    """Start Vite dev server (npm run dev)."""
    if not shutil.which("npm"):
        print("[frontend] Skipping start: npm not found.")
        return None
    print("[frontend] Starting Vite dev server at http://localhost:5173 ...")
    # On Windows, npm is a .cmd; using shell=True resolves it
    return subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(FRONTEND),
        shell=is_windows(),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

def stream_output(prefix, proc):
    """Non-blocking line-by-line stream of a child process' stdout."""
    if proc is None or proc.stdout is None:
        return
    try:
        for line in proc.stdout:
            print(f"[{prefix}] {line.rstrip()}")
    except Exception:
        pass

def main():
    print("== CP317 Fitness Marketplace – Dev Launcher ==")
    print(f"Repo root: {ROOT}\n")

    ensure_backend_venv_and_deps()
    ensure_frontend_deps()

    backend_proc = start_backend()
    # Give backend a moment to bind port so frontend calls won't race
    time.sleep(1.5)
    frontend_proc = start_frontend()

    print("\nOpen these in your browser when ready:")
    print("  API:      http://127.0.0.1:5000/api/health")
    print("  Frontend: http://localhost:5173/")
    print("\nPress Ctrl+C to stop both servers.\n")

    try:
        # Stream outputs until user interrupts
        while True:
            if backend_proc and backend_proc.poll() is not None:
                print("[backend] Process exited.")
                break
            if frontend_proc and frontend_proc.poll() is not None:
                print("[frontend] Process exited.")
                break
            # Stream a few lines from each without blocking everything
            stream_output("backend", backend_proc)
            stream_output("frontend", frontend_proc)
            time.sleep(0.2)
    except KeyboardInterrupt:
        print("\nStopping servers...")

    # Graceful shutdown
    for proc, name in [(frontend_proc, "frontend"), (backend_proc, "backend")]:
        if proc and proc.poll() is None:
            try:
                if is_windows():
                    proc.send_signal(signal.CTRL_BREAK_EVENT if hasattr(signal, "CTRL_BREAK_EVENT") else signal.SIGTERM)
                else:
                    proc.terminate()
                try:
                    proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    proc.kill()
            except Exception:
                pass
            print(f"[{name}] Stopped.")

if __name__ == "__main__":
    main()
