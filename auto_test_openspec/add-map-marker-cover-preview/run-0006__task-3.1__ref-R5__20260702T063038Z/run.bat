@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "LOG_FILE=%LOG_DIR%\docs-marker-cover.log"
set "DOC_FILE=%SCRIPT_DIR%..\..\..\docs\已实现API接口清单.md"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

(
  echo Checking marker documentation in %DOC_FILE%
  findstr /C:"/places/map-markers" "%DOC_FILE%"
  findstr /C:"cover_url" "%DOC_FILE%"
  findstr /C:"string | null" "%DOC_FILE%"
  findstr /C:"轻量封面预览" "%DOC_FILE%"
  findstr /C:"gallery_media" "%DOC_FILE%"
  findstr /C:"gallery_urls" "%DOC_FILE%"
  findstr /C:"external_gallery_media" "%DOC_FILE%"
  findstr /C:"cover_source" "%DOC_FILE%"
  findstr /C:"navigation" "%DOC_FILE%"
  findstr /C:"简介正文" "%DOC_FILE%"
) > "%LOG_FILE%" 2>&1
set "EXIT_CODE=%ERRORLEVEL%"
type "%LOG_FILE%"

exit /b %EXIT_CODE%
