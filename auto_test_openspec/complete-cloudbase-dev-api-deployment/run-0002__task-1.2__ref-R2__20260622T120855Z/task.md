# Validation Bundle: CloudBase dev inventory evidence

- change-id: complete-cloudbase-dev-api-deployment
- run: 2
- task-id: 1.2
- ref-id: R2
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
grep -q '| `places` | 0 | 7 |' docs/cloudbase-dev-api-deployment.md
grep -q 'idx_places_community_status' docs/cloudbase-dev-api-deployment.md
grep -q 'Static hosting:' docs/cloudbase-dev-api-deployment.md
grep -q 'Function ID: `lam-igyxxjph`' docs/cloudbase-dev-api-deployment.md
grep -q 'APIId: `083b66e0-c43a-4af4-864f-f3a297353828`' docs/cloudbase-dev-api-deployment.md
```

## MCP Runbook

Use MCP env, NoSQL structure, function, gateway, hosting, and log tools to re-check live inventory when supervising.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
