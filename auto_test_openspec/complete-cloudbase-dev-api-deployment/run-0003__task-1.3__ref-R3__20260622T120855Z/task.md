# Validation Bundle: Docs updated with inventory status

- change-id: complete-cloudbase-dev-api-deployment
- run: 3
- task-id: 1.3
- ref-id: R3
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
grep -q 'CloudBase dev API 部署闭环已完成' docs/plan.md
grep -q '2026-06-22 Dev API Update' docs/cloudbase-week4-deployment-baseline.md
grep -q 'CloudBase MCP and dev API status' docs/week8-places-cloudbase-integration.md
```

## MCP Runbook

No MCP step required.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
