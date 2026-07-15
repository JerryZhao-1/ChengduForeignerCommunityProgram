# Rollback

- Content: delete only the 22 `demo_*` IDs in `content-rollout.md`; restore the three legacy states from `prewrite-redacted-snapshot.json`.
- Vercel: restore Production deployment `dpl_3dr58TxFu6Y2URu9AbZnMWB2S95d`; keep project `trae-h5-demo`.
- Admin: re-upload `/tmp/community-map-admin-before-20260716` after verifying aggregate SHA-256 `1de1c03c44a1d7c3216fa47233152fe8b3a3280de5652ee3fe0c08f5671f11cb`.

No rollback was executed because scoped rollout checks passed.
