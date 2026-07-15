# run-0045: content rollout and redeploy

This append-only run records the authorized anonymous-events fix, deterministic demo-content rollout, Vercel H5 redeploy, and existing CloudBase Admin Static Hosting update. It adds no feature or public contract change and does not claim R18 complete.

## Release identity

- Branch: `competition/trae-h5-demo`
- Anonymous fix: `57bebabf`
- Deployed commit: `306aad2eeba3037627aa3a8d834cd54937b6145e`
- API: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- H5: `https://trae-h5-demo.vercel.app`
- Admin: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com`

No administrator password was read or requested. Because Browser MCP had no authenticated Admin session, authorized production mutations used CloudBase manager operations with shared Zod-validated documents, deterministic conflict-free IDs, and staged draft-to-published event transitions. Auth configuration was unchanged.

Scoped rollout result: PASS. R18 remains unchecked; see `supervisor-verdict.md`.
