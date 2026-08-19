"""Main entrypoint alias for SmartContractum backend."""

import sys
from pathlib import Path

# Add project root and backend dir to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent

for p in (str(PROJECT_ROOT), str(BACKEND_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app import app
except ModuleNotFoundError:
    from app import app  # type: ignore  # noqa: F401

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
