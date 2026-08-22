### End-to-End Multi-Agent Development Workflow: Operating Manual

This document defines the strict, state-driven lifecycle of a feature request on the Antigravity platform. All subagents (`pm_bot`, `dev_bot`, `py_bot`, `qa_bot`, `git_bot`) operate in isolated contexts and communicate exclusively through file-based artifacts and standard operating procedures.

#### 1. The End-to-End Process
The lifecycle follows a deterministic, sequential state machine:
1. **Intake & Planning (`pm_bot`)**: The orchestrator receives the human prompt, decomposes it, and writes the formal requirements to `tasks/<issue-folder>/TASK.md`.
2. **Delegation (`pm_bot` → Developer)**: `pm_bot` spawns the specialist agent (e.g., `py_bot` for Python or `dev_bot` for Go) via `invoke_subagent`, passing the `TASK.md` path and enforcing the `flash` model.
3. **Execution & Compilation (`dev_bot`/`py_bot`)**: The developer executes TDD. They are blocked by a **Hard Compilation Gate** (linting, tests, security scans). Code is refactored locally until all exit codes are `0`.
4. **Developer Handoff**: Once tests pass, the developer writes `DEV_HANDOVER.md` and updates the state.
5. **Smoke Verification (`pm_bot`)**: The orchestrator runs a sanity compilation (e.g., `go build ./...`). If it fails, the task immediately bounces back to the developer.
6. **Independent QA (`qa_bot`)**: `pm_bot` spawns `qa_bot` to audit the code. `qa_bot` runs full isolated test suites and vulnerability scans, emitting `QA_REVIEW.md` with an explicit `APPROVED` or `REJECTED` status.
7. **Version Control (`git_bot`)**: Upon `APPROVED`, `pm_bot` spawns `git_bot`. It reads the state log, creates a branch, commits the delta, pushes to origin, opens a PR, and monitors the CI/CD pipeline.
8. **Done-Done Reporting (`pm_bot`)**: The orchestrator confirms CI/CD success, updates global state, and returns control to the human.

#### 2. State Management & Logging (`WORKLOG.md`)
`WORKLOG.md` acts as the immutable global state machine and single source of truth for agent coordination.
- **Purpose**: It prevents context degradation across isolated subagent boundaries, provides historical tracking, and governs loop limits.
- **Lifecycle**:
  - `pm_bot` initializes the cycle: `[TS] | pm_bot | PROJECT_START | <desc>`
  - Developer claims task: `[TS] | dev_bot | IMPLEMENTATION_START | <desc>`
  - Developer yields task: `[TS] | dev_bot | IMPLEMENTATION_COMPLETE | <desc>`
  - QA sets verdict: `[TS] | qa_bot | REVIEW_APPROVED` (or `REVIEW_REJECTED`)
- **Loop Prevention**: `pm_bot` continuously parses `WORKLOG.md`. If it detects the `DEV_REWORK` state more than twice for the same task, it aborts the loop, halts the state machine, and triggers a human escalation.

#### 3. Handover Documents
Subagents do not pass conversational context. Handovers are entirely payload-driven via standard Markdown schemas located in `tasks/<issue-folder>/`.

**`TASK.md` (Initial Payload)**
- **Author**: `pm_bot`
- **Contents**: Architecture specs, scope constraints, database schemas, and explicit "Do Nots".

**`DEV_HANDOVER.md` (Developer → QA Payload)**
- **Author**: `dev_bot` or `py_bot`
- **Contents**: 
  - *Files Changed*: Exact diff manifest.
  - *Test Results*: Raw `stdout` of passing coverage targets (`pytest --cov` or `go test -cover`).
  - *Linter/Security Output*: Raw `stdout` proving clean runs of `gosec`, `govulncheck`, `flake8`, `pip-audit`.
  - *Notes for QA*: Expected edge cases, concurrency models, and data validation assumptions.

**`QA_REVIEW.md` (QA → Orchestrator Payload)**
- **Author**: `qa_bot`
- **Contents**: 
  - *Verdict*: `APPROVED` or `REJECTED`.
  - *Security Findings*: List of vulnerabilities. Any `MEDIUM` or higher severity mandates a `REJECTED` verdict.
  - *Checklist*: Verification of test isolation, command injection safety, and logic validation.

#### 4. File Generation & Artifact Location Convention
**STRICT CONSTRAINT**: All task-related work files, scratchpads, PR bodies, and intermediate artifacts MUST be saved inside the designated task folder (`tasks/<issue-folder>/`). They must NOT be saved in the repository root.

During a standard feature implementation cycle, the following non-source files are generated and stored strictly in the task folder:
- `tasks/<issue-folder>/TASK.md` (Scope mapping)
- `tasks/<issue-folder>/DEV_HANDOVER.md` (Execution evidence)
- `tasks/<issue-folder>/QA_REVIEW.md` (Audit verification)
- `tasks/<issue-folder>/pr_body.txt` (or any other git/PR related drafts)

The ONLY exceptions permitted in the repository root are:
- `WORKLOG.md` (Global execution state)
- `CICD_ERRORS.md` (Generated at root only if `git_bot` detects a remote pipeline failure post-push)

#### 5. Failure & Recovery
The system leverages cascading failure recovery:
- **Local Dev Breakage (Compilation/Test Fails)**: Addressed locally by the developer subagent. Creating a handover document while tests fail is a hard constraint violation. The developer loops internally until `stdout` shows success.
- **QA Rejection**: If `qa_bot` finds logical flaws or security regressions, it halts, generates a `QA_REVIEW.md` detailing the exploit or failure trace, and flags `REVIEW_REJECTED`. 
- **Orchestrator Rerouting**: `pm_bot` reads the rejection, logs `DEV_REWORK` in `WORKLOG.md`, and respawns the developer subagent. The prompt payload now includes the `QA_REVIEW.md` stack trace, forcing the developer to address the exact failure.
- **Pipeline Failure**: If tests pass locally but fail in GitHub Actions, `git_bot` parses the failed job logs via `gh run view`, dumps the trace into `CICD_ERRORS.md`, and passes state back to `pm_bot` for another `DEV_REWORK` cycle.
