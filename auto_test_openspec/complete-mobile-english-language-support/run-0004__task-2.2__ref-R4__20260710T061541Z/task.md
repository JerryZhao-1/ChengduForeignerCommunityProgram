# Task 2.2 atomic publication gate validation

- Change: `complete-mobile-english-language-support`
- Run: `#4`
- Task: `2.2`
- Ref: `R4`
- Scope: `CLI`

Run `./run.sh` or `run.bat` from any directory. The bundle executes shared readiness, mock/CloudBase provider, API-route, and Places payload-boundary tests, then API and Shared typechecks. Logs and machine-readable command/mutation assertions are written under `logs/` and `outputs/`.

`inputs/mutation-matrix.json` covers incomplete draft creation, Event review-and-publish, Place quick publish, complete publication, whitespace, placeholders, conditional recommendation reasons, and edits to public entities. Expected rules are in `expected/result.rules.json`, derived from R4 ACCEPT.

Machine criteria: 65 focused tests pass; both typechecks exit zero; every incomplete public mutation returns `VALIDATION_ERROR`/400 with field details; tests compare before/after state and require equality; incomplete drafts remain non-public; valid bilingual records publish; list/marker/detail boundaries remain unchanged.

No external services or credentials are required.
