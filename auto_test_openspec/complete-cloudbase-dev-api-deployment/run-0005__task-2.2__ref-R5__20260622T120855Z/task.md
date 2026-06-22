# Validation Bundle: CloudBase HTTP function deployed or repaired

- change-id: complete-cloudbase-dev-api-deployment
- run: 5
- task-id: 2.2
- ref-id: R5
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
grep -q 'Type: `HTTP`' docs/cloudbase-dev-api-deployment.md
grep -q 'Runtime: `Nodejs18.15`' docs/cloudbase-dev-api-deployment.md
grep -q 'Latest code update RequestId: `70783676-7336-48f1-a9cd-926b68e396cf`' docs/cloudbase-dev-api-deployment.md
grep -q 'Function ID: `lam-igyxxjph`' docs/cloudbase-dev-api-deployment.md
```

## MCP Runbook

Use MCP queryFunctions(getFunctionDetail), queryPermissions, and listFunctionLogs to re-check live function state.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
