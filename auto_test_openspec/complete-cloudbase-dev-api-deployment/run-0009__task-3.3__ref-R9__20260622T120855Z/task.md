# Validation Bundle: Places smoke proves live provider configuration

- change-id: complete-cloudbase-dev-api-deployment
- run: 9
- task-id: 3.3
- ref-id: R9
- scope: MIXED

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
grep -q 'API_PROVIDER=cloudbase' docs/cloudbase-dev-api-deployment.md
grep -q 'CLOUDBASE_PROVIDER_MODE=live' docs/cloudbase-dev-api-deployment.md
grep -q 'Live `places` collection query returned `total=0`' docs/cloudbase-dev-api-deployment.md
grep -q 'mock provider currently returns two places locally' docs/cloudbase-dev-api-deployment.md
```

## MCP Runbook

Use MCP queryFunctions(getFunctionDetail) and readNoSqlDatabaseContent(places) to re-check live env vars and live collection count.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
