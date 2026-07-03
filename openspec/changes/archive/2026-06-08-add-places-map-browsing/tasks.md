## 1. Shared Contract

- [x] 1.1 Add `PlaceMapMarkerSchema` and exported type
- [x] 1.2 Update places contract/client/mock typings for `mapMarkers`
- [x] 1.3 Add or update shared tests for marker contract shape

## 2. API

- [x] 2.1 Update places provider types and mock implementation to return marker objects
- [x] 2.2 Ensure `/places/map-markers` only returns published places for the current community
- [x] 2.3 Keep CloudBase provider interface aligned with the new marker type

## 3. Mobile

- [x] 3.1 Replace the placeholder map page with a real uni-app map view
- [x] 3.2 Render markers and selected-marker state
- [x] 3.3 Allow marker tap -> detail navigation
- [x] 3.4 Replace detail-page toast with native navigation via coordinates

## 4. Verification

- [x] 4.1 Run affected Vitest suites
- [x] 4.2 Manually verify map load, marker click, detail jump, and navigation jump in mini-program
