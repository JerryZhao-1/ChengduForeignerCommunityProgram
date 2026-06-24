# GUI Runbook: Real-Device Places Verification

Scan `outputs/preview.png` with WeChat on a physical device that has access to app id `wx7518a3c1fcdd39a5`.

Record the following evidence in this run folder:

1. Device model, OS version, WeChat version, operator, and exact test time.
2. Whether the Mini Program opens without a blank screen.
3. Whether places list is reachable.
4. Whether places map is reachable.
5. Tested place id. Prefer `place_0dc2aece-6aa6-46c5-8971-57646636a22a` if visible.
6. Whether marker selection opens the expected summary/detail path.
7. Whether detail navigation opens native navigation or shows an accepted permission fallback.
8. Whether place share action opens the WeChat share sheet or records a platform limitation.
9. Any permission prompts, CloudBase invocation errors, screenshots, or notes.

Task `2.3` can be checked only after this real-device evidence exists.
