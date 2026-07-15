# R18 Vercel independent deployment run 0044

- Scope: MIXED (CLI, CloudBase/Vercel control plane, and Browser MCP)
- H5 artifact source commit: `b28b7fbc5ebf75d787536e3770af864c6ce2aa80`
- Production API CORS source commit: `9ae10bd0ad332fe33c9ece4cd4a57e158f7ed025`
- Vercel project: `trae-h5-demo` / `prj_5eUyqv8CDrX1lUceCZF61sJKJGiX`
- Production URL: `https://trae-h5-demo.vercel.app`
- Production promotion deployment: `dpl_3dr58TxFu6Y2URu9AbZnMWB2S95d`
- Original validated Preview: `dpl_A3ZCGQzuYYKHksnjN8qZMBcocqFt`
- Production API: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`
- Decision: **NOT COMPLETE**

This run records the independent Vercel deployment without changing CloudBase
Admin Static Hosting. Preview and Production online checks passed. The required
API-only blocked-network offline flow could not be executed because the
available in-app Browser MCP exposes no request interception capability, and no
specialized interception-capable browser MCP is installed. S14 also still lacks
the user-copied raw TRAE Session evidence. Neither result is invented.

The Vercel CLI promotion creates a Production promotion deployment whose
metadata records `originalDeploymentId=dpl_A3ZCGQzuYYKHksnjN8qZMBcocqFt`.
Vercel logs show that it reused prebuilt artifacts; it did not rerun the
repository H5 build.
