# Validation Bundle: CloudBase /api route created or confirmed

- change-id: complete-cloudbase-dev-api-deployment
- run: 7
- task-id: 3.1
- ref-id: R7
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
grep -q 'Access path: `/api`' docs/cloudbase-dev-api-deployment.md
grep -q 'APIId: `083b66e0-c43a-4af4-864f-f3a297353828`' docs/cloudbase-dev-api-deployment.md
grep -q 'EnableAuth: `false`' docs/cloudbase-dev-api-deployment.md
```

## MCP Runbook

Use MCP queryGateway(getAccess) to re-check route target and URL when supervising.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
