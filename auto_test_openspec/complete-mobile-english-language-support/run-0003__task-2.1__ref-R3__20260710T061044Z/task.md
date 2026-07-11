# Task 2.1 provider normalization and preference validation

- Change: `complete-mobile-english-language-support`
- Run: `#3`
- Task: `2.1`
- Ref: `R3`
- Scope: `CLI`

Run `./run.sh` on macOS/Linux or `run.bat` on Windows from any directory. The bundle runs focused API/provider/shared tests and API/Shared typechecks. Logs are written under `logs/`; `outputs/result.json` records exact exit codes.

Inputs in `inputs/provider-cases.json` cover two actors, unauthenticated and invalid preference requests, legacy Event addresses, bilingual and legacy notifications, and cross-user notification ids. Expected rules in `expected/result.rules.json` are derived from R3 ACCEPT.

Machine-decidable criteria: 51 focused tests pass; both typechecks exit zero; actor preferences remain independent; omitted login preference does not overwrite stored preference; mock and CloudBase fallback adapters normalize legacy Events consistently; new notifications contain all four bilingual presentation fields; legacy notifications remain readable; and cross-user read-state mutation is rejected without changing ownership.

No external service, production data, or secret is required.
