# Pre-deployment record

- Recorded: 2026-07-15T15:03:39Z (2026-07-15 23:03:39 CST)
- Commit: `775ede097bc3c65cd1772749cbc5d2f228e3fd35`
- API URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- API health: HTTP 200, body `{"ok":true}`
- Target app lookup: no existing `trae-h5-demo` application

## R10-R17 gate

R10-R16 have immutable PASS Supervisor evidence in their existing runs. Current-HEAD R17 is `run-0041__task-17.1__ref-R17__20260715T150145Z`, Supervisor verdict PASS for the exact deployment commit.

## Existing Admin Static Hosting fingerprint

- Root: HTTP 200, ETag `"7d165666343cd07c52d03f25c6a7caff"`, body SHA-256 `098244bcd9220b4b223b8d043468f254847c8304aa35c57d47fb58fc68eb3a5e`.
- `/places`: HTTP 200, same ETag and body SHA-256.
- Entry resources: `/assets/index-Bd1K6-49.js`, `/assets/index-CVzScoi3.css`.
- Last-Modified: `Sat, 11 Jul 2026 08:14:09 GMT`.
- Existing response behavior includes `content-disposition: attachment`; R18 records but does not alter it.

## Function safety metadata

- Function: `community-map-api`
- Runtime: `Nodejs18.15`
- Type: `HTTP`
- Status: `Active`
- Modified before deployment: `2026-07-14 14:02:37`
- Existing environment variable names were inspected; values were not recorded. Names include API admin, provider, CloudBase, Amap, and Tencent Map configuration.
- R18 authorizes code-only update. Runtime, environment values, permissions, and gateway configuration are out of mutation scope.

## Rollback backup

- Temporary local backup: `/tmp/community-map-api-pre-r18-775ede09.zip`
- SHA-256: `e1ac5122cc4cab3b7f8cf84e74e6a11c4eb7d012b223116419e4ce3602fde5dd`
- Format: valid ZIP archive.
- Signed download URL and credentials were not saved.
- Recovery: call CloudBase `updateFunctionCode` for `community-map-api` with this ZIP after explicit rollback authorization.

## Frontend configuration review

- Repository environment files found: `.env.example` only.
- Production H5 build variables are limited to `VITE_API_MODE=http` and the public `VITE_API_BASE_URL`.
- No `VITE_` variable named as a secret, password, token, Amap server key, or Tencent server key was found.
