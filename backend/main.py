"""Main entrypoint alias for SmartContractum backend."""

from backend.app import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
