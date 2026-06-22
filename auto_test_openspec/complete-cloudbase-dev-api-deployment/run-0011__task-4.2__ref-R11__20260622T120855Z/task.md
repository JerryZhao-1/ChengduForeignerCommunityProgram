# Validation Bundle: Final OpenSpec and project validation

- change-id: complete-cloudbase-dev-api-deployment
- run: 11
- task-id: 4.2
- ref-id: R11
- scope: CLI

## How To Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

## Expected Results

The script exits with code 0. Key command output is captured in `logs/run.log`.

## Commands

```bash
openspec validate complete-cloudbase-dev-api-deployment --strict --no-interactive
pnpm --filter @community-map/api typecheck
pnpm exec vitest run apps/api/test/app.spec.ts apps/api/test/cloudbase.spec.ts
test -d auto_test_openspec/complete-cloudbase-dev-api-deployment
```

## MCP Runbook

No MCP step required.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
