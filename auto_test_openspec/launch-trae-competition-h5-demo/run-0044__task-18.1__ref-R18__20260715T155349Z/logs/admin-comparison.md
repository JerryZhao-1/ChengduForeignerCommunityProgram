# Admin Static Hosting comparison

Pre-deployment reference:

- HTTP 200
- ETag `"7d165666343cd07c52d03f25c6a7caff"`
- Body SHA-256
  `098244bcd9220b4b223b8d043468f254847c8304aa35c57d47fb58fc68eb3a5e`
- Entry assets: `/assets/index-Bd1K6-49.js`,
  `/assets/index-CVzScoi3.css`

Post-Vercel results for both `/` and `/places`:

- HTTP 200
- Same ETag
- Same body SHA-256
- Same entry assets

Result: **UNCHANGED**. No CloudBase Hosting/App write was used by the Vercel
deployment.
