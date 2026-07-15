# Deployment metadata (observed)

- API function update request: success; code only.
- Function after update: `community-map-api`, `Nodejs18.15`, HTTP, Active, modified `2026-07-15 23:06:18 CST`.
- Environment variable values recorded: no.
- App service: `trae-h5-demo`.
- Version: `trae-h5-demo-001`.
- Build ID: `2601340810`.
- Build terminal status: `SUCCESS`.
- Platform create time: `2026-07-15 23:07:06 CST`.
- Public domain returned by platform: `https://trae-h5-demo-cloud1-d7gxdk8t43bd639c0.webapps.tcloudbase.com`.
- H5 was observed online at `2026-07-15T15:07:57Z` / `2026-07-15 23:07:57 CST`.
- Online H5 root SHA-256: `9c3eededcf2bbfe80b64d5a6f8f3e38eed8c6c5e6098ffa05b7f9926fd23d5c4` (identical to local production build).
- Declared source: HEAD `775ede097bc3c65cd1772749cbc5d2f228e3fd35` plus the single-file deploy-adapter correction fingerprinted by R17 run 0043.

## Rollback records

- Function: `/tmp/community-map-api-pre-r18-775ede09.zip`, SHA-256 `e1ac5122cc4cab3b7f8cf84e74e6a11c4eb7d012b223116419e4ce3602fde5dd`; recovery is code-only `updateFunctionCode` after explicit authorization. Not executed because API validation passed.
- First app deployment: intended rollback is `deleteApp` for `trae-h5-demo`. Not executed because the platform unexpectedly shared the Admin Hosting root and deletion could remove shared files.
- Compensating restoration actually executed: upload only the captured original Admin `index.html` back to `index.html`. Root and `/places` then matched the original body SHA, ETag, and entry resources.
- After restoration the Web App domain serves the Admin entry, not the competition H5. It is therefore not an accepted public R18 URL.
