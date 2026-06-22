@echo off
setlocal

set SCRIPT_DIR=%~dp0
for %%I in ("%SCRIPT_DIR%..\..\..") do set REPO_ROOT=%%~fI
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

(
  echo change-id: complete-cloudbase-dev-api-deployment
  echo task: 2.1 ref: R4
  echo + pnpm --filter @community-map/api build:cloudbase-http
  cd /d "%REPO_ROOT%"
  pnpm --filter @community-map/api build:cloudbase-http
  if errorlevel 1 exit /b 1
  if not exist "apps\api\.cloudbase\community-map-api\index.cjs" exit /b 1
  if not exist "apps\api\.cloudbase\community-map-api\scf_bootstrap" exit /b 1
  findstr /C:"/var/lang/node18/bin/node index.cjs" "apps\api\.cloudbase\community-map-api\scf_bootstrap" >nul
  if errorlevel 1 exit /b 1
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $scriptDir='%SCRIPT_DIR%'; $repo='%REPO_ROOT%'; $tmp=Join-Path $env:TEMP ('community-map-function-' + [guid]::NewGuid()); New-Item -ItemType Directory -Path $tmp | Out-Null; Copy-Item -Recurse -Force (Join-Path $repo 'apps/api/.cloudbase/community-map-api/*') $tmp; if (Test-Path (Join-Path $tmp 'node_modules')) { throw 'node_modules should not be required' }; $env:PORT='9021'; $p=Start-Process node -ArgumentList 'index.cjs' -WorkingDirectory $tmp -RedirectStandardOutput (Join-Path $tmp 'server.log') -RedirectStandardError (Join-Path $tmp 'server.err') -PassThru; try { Start-Sleep -Seconds 2; $body=Invoke-RestMethod 'http://127.0.0.1:9021/api/health'; if ($body.ok -ne $true) { throw 'health failed' }; $body | ConvertTo-Json -Compress | Set-Content (Join-Path $scriptDir 'logs/health.json') } finally { Stop-Process -Id $p.Id -ErrorAction SilentlyContinue; Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }"
) > "%SCRIPT_DIR%logs\run.log" 2>&1

exit /b %ERRORLEVEL%
