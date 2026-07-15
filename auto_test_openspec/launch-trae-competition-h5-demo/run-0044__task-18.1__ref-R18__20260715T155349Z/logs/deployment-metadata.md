# Deployment metadata

## Vercel

- Team: `jerryzhaoranjie-5014s-projects`
- Team ID: `team_jGFJF6hOi801k7FVjyhrXG6t`
- Project: `trae-h5-demo`
- Project ID: `prj_5eUyqv8CDrX1lUceCZF61sJKJGiX`
- H5 artifact source: `b28b7fbc5ebf75d787536e3770af864c6ce2aa80`
- Preview ID: `dpl_A3ZCGQzuYYKHksnjN8qZMBcocqFt`
- Preview URL: `https://trae-h5-demo-orc4nqh4x-jerryzhaoranjie-5014s-projects.vercel.app`
- Preview created: `2026-07-15T15:40:42.262Z` / `2026-07-15 23:40:42 CST`
- Preview status: `READY`
- Production promotion ID: `dpl_3dr58TxFu6Y2URu9AbZnMWB2S95d`
- Production URL: `https://trae-h5-demo.vercel.app`
- Production created: `2026-07-15T15:52:35.773Z` / `2026-07-15 23:52:35 CST`
- Production ready: `2026-07-15T15:52:40.900Z` / `2026-07-15 23:52:40 CST`
- Production status: `READY`
- Promotion metadata: `action=promote`,
  `originalDeploymentId=dpl_A3ZCGQzuYYKHksnjN8qZMBcocqFt`
- Region: `iad1`

Vercel reports the promotion as a separate Production deployment that points
back to the validated Preview through `originalDeploymentId`. Both platform
logs say `Using prebuilt build artifacts from .vercel/output`; the repository
H5 build was not rerun during promotion.

## API

- URL: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Function: `community-map-api`
- API CORS source: `9ae10bd0ad332fe33c9ece4cd4a57e158f7ed025`
- Code-only update request ID:
  `4b4d3d71-b279-4b6e-b8cd-a8805a50428d`
- Health: HTTP 200 with body `{"ok":true}`
- Vercel Production preflight: HTTP 204 with exact Production origin
- Canonical guest generation: HTTP 200

The code-only update did not pass or change function environment variables,
permissions, runtime, or gateway configuration. The CloudBase detail query
unexpectedly displayed server environment values in transient MCP output.
Those values are not copied into this run; rotate the affected server
credentials as a precaution.

## Rollback

- First Production rollback: remove the two Production aliases, then delete
  `dpl_3dr58TxFu6Y2URu9AbZnMWB2S95d`; retain the project and Preview.
- Once a prior Production exists, prefer
  `vercel rollback <deployment-id-or-url> --yes`.
- API rollback: after explicit authorization, apply the pre-update function ZIP
  with SHA-256
  `e1ac5122cc4cab3b7f8cf84e74e6a11c4eb7d012b223116419e4ce3602fde5dd`
  using code-only `updateFunctionCode`.
- No rollback was executed because the public API and Production online checks
  passed.
