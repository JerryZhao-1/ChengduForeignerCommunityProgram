# Validation Bundle: Self-contained HTTP function package

- change-id: complete-cloudbase-dev-api-deployment
- run: 12
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
test -f apps/api/.cloudbase/community-map-api/index.cjs
test -x apps/api/.cloudbase/community-map-api/scf_bootstrap
grep -q '/var/lang/node18/bin/node index.cjs' apps/api/.cloudbase/community-map-api/scf_bootstrap
copy generated function folder to /tmp
PORT=9021 node index.cjs
curl -sS -f http://127.0.0.1:9021/api/health
```

## MCP Runbook

No MCP step required. This bundle verifies the deployable folder can start without workspace parent `node_modules`.
