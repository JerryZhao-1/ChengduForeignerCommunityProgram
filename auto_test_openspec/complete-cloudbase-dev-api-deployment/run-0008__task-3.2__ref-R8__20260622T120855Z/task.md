# Validation Bundle: Dev access domain health and places read smoke

- change-id: complete-cloudbase-dev-api-deployment
- run: 8
- task-id: 3.2
- ref-id: R8
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
curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/health | grep -q '"ok":true'
curl -sS -f --max-time 20 'https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/places?page=1&pageSize=5' | grep -q '"success":true'
curl -sS -f --max-time 20 https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/places/map-markers | grep -q '"success":true'
grep -q 'Detail smoke was not run because there is no published live place' docs/cloudbase-dev-api-deployment.md
```

## MCP Runbook

No MCP step required for rerun; matching log request IDs are recorded in docs.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
