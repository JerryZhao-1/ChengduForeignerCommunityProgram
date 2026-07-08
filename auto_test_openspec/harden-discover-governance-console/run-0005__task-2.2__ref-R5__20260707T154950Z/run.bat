@echo off
setlocal
cd /d %~dp0\..\..\..\apps\admin
echo Admin URL: http://127.0.0.1:5173/
call ..\..\node_modules\.bin\vite --host 127.0.0.1 --port 5173
