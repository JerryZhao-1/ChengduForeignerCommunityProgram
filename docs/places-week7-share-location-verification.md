# Places Week 7 Share And Location Verification

This note records the expected Week 7 behavior for mobile places sharing and native location launch. It is validation guidance only; it does not add a backend contract.

## Share Behavior

- Place detail uses the loaded `place.share` payload for Mini Program page sharing.
- The share path targets the same detail route: `/pages/places/detail?id=<place_id>`.
- If native Mini Program sharing is not available, the page provides non-placeholder fallback feedback and copies the detail path where the platform supports clipboard writes.

## Location And Privacy Expectations

- Native navigation is launched through the shared places helper.
- The helper validates latitude and longitude before calling `uni.openLocation`.
- On device or WeChat DevTools, the platform may display map/location/privacy prompts controlled by the host runtime.
- If permission is denied, unsupported, or blocked by the simulator, the page shows localized failure feedback and keeps the loaded detail or selected map state visible.

## Known Simulator Limits

- H5 and some WeChat DevTools simulator configurations may not launch a native map app.
- Permission prompts can differ between simulator and real device depending on WeChat privacy settings and previously granted authorization.
- Final evidence should record the tested target, prompt behavior, and whether native map launch was available.
