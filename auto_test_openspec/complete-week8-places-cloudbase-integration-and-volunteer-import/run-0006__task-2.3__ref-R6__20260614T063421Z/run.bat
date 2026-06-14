@echo off
cd /d %~dp0
echo Start Mobile H5: pnpm --filter @community-map/mobile dev:h5 > logs\run.log
echo Start Admin: pnpm --filter @community-map/admin dev >> logs\run.log
echo GUI scope: execute tests\gui_runbook.md with Browser MCP. >> logs\run.log
