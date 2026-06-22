# Validation Bundle: Deployable HTTP function package

- change-id: complete-cloudbase-dev-api-deployment
- run: 4
- task-id: 2.1
- ref-id: R4
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
pnpm --filter @community-map/api build:cloudbase-http
test -f apps/api/.cloudbase/community-map-api/index.js
test -x apps/api/.cloudbase/community-map-api/scf_bootstrap
grep -q '/var/lang/node18/bin/node index.js' apps/api/.cloudbase/community-map-api/scf_bootstrap
grep -q 'type="HTTP"' apps/api/.cloudbase/community-map-api/README.md
```

## MCP Runbook

No MCP step required.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
