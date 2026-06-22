# Validation Bundle: Direct/access-domain health and log traceability

- change-id: complete-cloudbase-dev-api-deployment
- run: 6
- task-id: 2.3
- ref-id: R6
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
grep -q '| `GET /health` | 200 |' docs/cloudbase-dev-api-deployment.md
grep -q 'bc257000-fcda-4822-a4e4-8f1c323ce523' docs/cloudbase-dev-api-deployment.md
curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health | grep -q '"ok":true'
```

## MCP Runbook

No MCP step required for rerun; MCP log detail is recorded in docs.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
