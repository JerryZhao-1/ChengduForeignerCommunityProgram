## 1. Shared Contracts

- [x] 1.1 Add or refine dedicated places query/response schemas for list, detail, filter, and recommendation flows
- [x] 1.2 Keep map marker payload separate from place detail payload
- [x] 1.3 Add shared contract coverage for places admin maintenance flows
- [x] 1.4 Add or update shared tests for new places schemas and client signatures

## 2. Places Backend

- [x] 2.1 Update places provider types to support filterable lists, richer detail payloads, and recommendation-related queries
- [x] 2.2 Implement places route/provider behavior for public list, detail, and marker flows with published visibility rules
- [x] 2.3 Implement admin-facing places create/update flows for bilingual content, categorization, recommendation, and gallery metadata
- [x] 2.4 Keep Koa routes and CloudBase handler behavior aligned for places endpoints
- [x] 2.5 Add route tests for success, validation failure, permission failure, and unpublished visibility cases

## 3. Places Mobile

- [x] 3.1 Rebuild the places list page as a real browsing surface with loading/empty/error states
- [x] 3.2 Rebuild the places map page as a real browsing surface with marker selection and detail jump behavior
- [x] 3.3 Rebuild the places detail page with gallery, hours, address, bilingual intro, tags, and navigation action
- [x] 3.4 Add category/filter and recommendation entry flows under `apps/mobile/src/pages/places`
- [x] 3.5 Add favorite/share-ready interaction seams without blocking the main browsing release
- [x] 3.6 Replace placeholder copy and presentation across the entire places module

## 4. Places Admin

- [x] 4.1 Expand the places admin page from draft creation into real create/edit management
- [x] 4.2 Add fields and actions for coordinates, optional POI references, bilingual intro, category/tag, and recommendation state
- [x] 4.3 Connect place gallery upload/attachment flows through the existing files backend
- [x] 4.4 Verify admin place updates are reflected in mobile/API reads

## 5. Backend Foundation

- [ ] 5.1 Review provider parity gaps across auth, events, posts/discover, files, and notifications
- [ ] 5.2 Add missing route coverage for validation, permission, and not-found behavior in non-places modules
- [x] 5.3 Improve minimum admin support for events and posts workflows where backend gaps block integration
- [x] 5.4 Keep shared contracts as the only source of truth for all affected payload changes

## 6. Verification

- [x] 6.1 Run affected shared, API, and route tests
- [ ] 6.2 Run `typecheck`, `test`, and `lint` for the affected scope
- [ ] 6.3 Manually verify places list, map, detail, filtering, recommendation entry, and navigation flows
- [ ] 6.4 Manually verify admin place maintenance and frontstage data refresh behavior
