# Audit command log

Production reads used the deployed API at `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`. The raw export was kept outside the repository under `/tmp`.

The audit was executed from the repository root with:

```bash
pnpm --filter @community-map/api exec tsx ../../scripts/bilingual-content-audit.ts \
  --input /tmp/complete-mobile-english-production-candidate.json \
  --output /tmp/complete-mobile-english-production-candidate-audit.json
```

Expected exit code is 1 while content issues exist. The output summary is preserved in `outputs/production-candidate-audit-summary.json` without production content bodies or media URLs.
