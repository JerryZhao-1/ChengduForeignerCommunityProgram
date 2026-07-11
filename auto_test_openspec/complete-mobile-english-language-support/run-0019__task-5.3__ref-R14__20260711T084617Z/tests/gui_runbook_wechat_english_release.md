# WeChat English release acceptance runbook

1. Import `apps/mobile/dist/build/mp-weixin` in WeChat DevTools and record DevTools/library identity.
2. Clear local state, launch, select English, relaunch, and confirm the selection persists.
3. Verify English titles/tabs and representative Home, Events, Discover, Places, and Me flows.
4. Verify location permission, native map/navigation, and share behavior on the available physical device.
5. Record the API target and any console/network errors.
6. Obtain a new real production-candidate export and require `blocking=0`, `editorial=0`, and `releaseEligible=true`.

For run #19, the product owner attested that manual acceptance completed without issue. The production-candidate audit failed the content gate, so the overall result remains blocked.
