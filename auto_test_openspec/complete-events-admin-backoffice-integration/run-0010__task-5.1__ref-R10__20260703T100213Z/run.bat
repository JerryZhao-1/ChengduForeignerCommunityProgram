@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set REPO_ROOT=%cd%\..\..\..
set DOC_API=%REPO_ROOT%\docs\API接口使用手册.md
set DOC_LIST=%REPO_ROOT%\docs\已实现API接口清单.md
if not exist logs mkdir logs
findstr /c:"GET /admin/events" "%DOC_LIST%" > logs\run.log
if errorlevel 1 exit /b 1
findstr /c:"/admin/events/:id/registrations" "%DOC_LIST%" >> logs\run.log
if errorlevel 1 exit /b 1
findstr /c:"报名导出当前明确延后" "%DOC_LIST%" >> logs\run.log
if errorlevel 1 exit /b 1
findstr /c:"GET `/admin/events`" "%DOC_API%" >> logs\run.log
if errorlevel 1 exit /b 1
findstr /c:"GET `/admin/events/:id/registrations`" "%DOC_API%" >> logs\run.log
if errorlevel 1 exit /b 1
findstr /c:"x-mock-user-id: user_001" "%DOC_API%" >> logs\run.log
if errorlevel 1 exit /b 1
findstr /c:"报名导出当前延后" "%DOC_API%" >> logs\run.log
if errorlevel 1 exit /b 1
findstr /c:"Admin `/events`" "%DOC_API%" >> logs\run.log
if errorlevel 1 exit /b 1
type logs\run.log
