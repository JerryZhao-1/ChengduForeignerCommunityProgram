@echo off
setlocal
pushd %~dp0
cd ../../..
echo Starting Mobile H5 for Task 3.1 GUI verification
echo URL: http://127.0.0.1:5174/
pnpm --filter @community-map/mobile dev:h5 --host 127.0.0.1 --port 5174
popd
