# Validation Bundle: Final deployment evidence and remaining plan items synced

- change-id: complete-cloudbase-dev-api-deployment
- run: 10
- task-id: 4.1
- ref-id: R10
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
grep -q 'Remaining Work' docs/cloudbase-dev-api-deployment.md
grep -q '导入或创建最小 live places 数据' docs/plan.md
grep -q '完整 places live acceptance' docs/Postman调试与OpenAPI导入指南.md
```

## MCP Runbook

No MCP step required.

For MCP checks, use CloudBase MCP tools in the current Codex session and compare returned env id, function metadata, route metadata, request IDs, and logs with `docs/cloudbase-dev-api-deployment.md`.
