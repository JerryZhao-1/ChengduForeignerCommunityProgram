# GUI Runbook: Admin Hosting To Dev API

## Verified context

- Hosted Admin URL: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/`
- Hosted Admin direct route: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/places`
- Intended API base: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Build command used before deployment:
  `VITE_API_MODE=http VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api pnpm --filter @community-map/admin build`
- Deployment target: existing CloudBase shared hosting domain for `cloud1-d7gxdk8t43bd639c0`.
- Hosting document config: `index.html` plus 404 fallback to `index.html`.

## Evidence captured

`run.sh` records HTTP evidence for root, `/places`, and API health. The Admin bundle also contains the intended CloudBase dev API base and no local API base.
