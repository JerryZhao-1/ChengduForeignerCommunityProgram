@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"

if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"

set "DOC=docs\release-readiness-handoff-2026-06-24.md"

(
  echo Checking frozen integration configuration...
  findstr /C:"cloud1-d7gxdk8t43bd639c0" "%DOC%"
  findstr /C:"community-map-api" "%DOC%"
  findstr /C:"https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api" "%DOC%"
  findstr /C:"https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/" "%DOC%"
  findstr /C:"wx7518a3c1fcdd39a5" "%DOC%"
  findstr /C:"public/places/{place_id}/" "%DOC%"
  echo.
  echo Checking data classification...
  findstr /C:"19 dev records" "%DOC%"
  findstr /C:"place_0dc2aece-6aa6-46c5-8971-57646636a22a" "%DOC%"
  findstr /C:"place_d6af35be-acea-41b8-92ed-cfd0fa909072" "%DOC%"
  findstr /C:"gallery_file_ids: []" "%DOC%"
  findstr /C:"placeholder out-of-range coordinates" "%DOC%"
  findstr /C:"No deletion performed" "%DOC%"
  echo.
  echo Checking production exclusions...
  findstr /C:"does not claim production readiness" "%DOC%"
  findstr /C:"No production data was mutated" "%DOC%"
  findstr /C:"production release cannot" "%DOC%"
) > "%SCRIPT_DIR%logs\assertions.log" 2>&1
if errorlevel 1 exit /b 1

echo Task 4.1 config/data classification assertions passed.> "%SCRIPT_DIR%outputs\summary.txt"
type "%SCRIPT_DIR%outputs\summary.txt"
