# Supervisor verdict

- Decision: **FAIL**
- Run: `0029`
- Task / Ref: `11.1` / `R11`
- Evidence: `logs/run.log`, `logs/vitest.json`, `outputs/result.json`

The verifier failed closed because the required bundle-local evidence assertion was absent from the Vitest report. Repository test globs include only `packages/**`, `apps/**`, and `scripts/**`, so the evidence spec under this run folder was not collected. `expectedMatches` was therefore `false`. No PASS claim is made; run-0031 is the corrected retry.
