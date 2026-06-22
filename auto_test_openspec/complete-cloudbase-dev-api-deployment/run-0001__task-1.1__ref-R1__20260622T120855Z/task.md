# Validation Bundle: CloudBase MCP auth and target env evidence

- change-id: complete-cloudbase-dev-api-deployment
- run: 1
- task-id: 1.1
- ref-id: R1
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
grep -q 'Auth: `READY`' docs/cloudbase-dev-api-deployment.md
grep -q 'Bound env: `cloud1-d7gxdk8t43bd639c0`' docs/cloudbase-dev-api-deployment.md
grep -q 'Region: `ap-shanghai`' docs/cloudbase-dev-api-deployment.md
```

## MCP Runbook

Use MCP auth(status) to re-check READY and current_env_id when supervising.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
