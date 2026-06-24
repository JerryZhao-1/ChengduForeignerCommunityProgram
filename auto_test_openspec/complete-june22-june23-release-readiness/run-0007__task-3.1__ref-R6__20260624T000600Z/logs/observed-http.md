# Observed HTTP Evidence: Admin Hosting/API Readiness

- Date: 2026-06-24
- Hosted Admin URL: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/`
- Hosted Admin places route: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/places`
- Intended API base: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Severity: P0 for Admin hosted release-readiness evidence
- Owner: release integrator with CloudBase static hosting deploy/config access
- Next action: deploy the Admin bundle to the hosting bucket with `VITE_API_MODE=http` and `VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`, then configure SPA fallback routing for direct route refresh.

## Results

| Target | Observed status | Summary |
| --- | ---: | --- |
| Hosted Admin root `/` | 404 | CloudBase/COS returned `NoSuchKey` for `index.html`. |
| Hosted Admin route `/places` | 404 | CloudBase/COS returned `NoSuchKey` for `places`. |
| Dev API `/api/health` | 200 | Returned `{"ok":true}` through `Tencent-SCF_HTTP`. |

## Conclusion

The CloudBase dev API domain is reachable, but the Admin hosted domain is not serving the Admin app and route refresh cannot be verified. Task `3.1` remains incomplete.
