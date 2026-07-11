# Re-audit command

The production export was read from the deployed public API and stored only under `/tmp`. The audit ran with:

```bash
pnpm --filter @community-map/api exec tsx ../../scripts/bilingual-content-audit.ts \
  --input /tmp/complete-mobile-english-production-candidate-rerun.json \
  --output /tmp/complete-mobile-english-production-candidate-rerun-audit.json
```

Exit code 1 is expected because unresolved production content issues remain.
