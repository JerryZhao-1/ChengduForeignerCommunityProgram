# Design: Complete places frontend and backend foundation

## Context

The repository already contains:

- placeholder `places` mobile pages (`index`, `detail`, `map`)
- shared contract and schema scaffolding in `packages/shared`
- Koa routes and CloudBase handler support for core modules
- thin admin pages for places, events, posts, announcements, files, and logs

The main design problem is sequencing, not greenfield architecture. The implementation must prevent repeated churn between shared contracts, backend providers, and frontend pages.

## Sequencing Strategy

Use a strict three-layer flow for user-facing capability work:

1. `packages/shared`
2. `apps/api`
3. `apps/mobile` / `apps/admin`

Backend work should stay roughly half a step ahead of frontend work. This allows mobile/admin development to proceed continuously without building against unstable response shapes.

## Capability Breakdown

### Places mobile experience

The mobile `places` module should be treated as incomplete and expanded to support:

- list browsing
- real map browsing
- place detail rendering
- category/tag/keyword filtering
- recommendation entry points
- navigation launching
- favorite/share-ready UX

The first release does not require a fully persisted favorite backend if that would delay the main browsing flows; however, the mobile UX and interface seam should be prepared so the behavior can be upgraded later without page restructuring.

### Places admin management

The admin layer must support the minimum content operations necessary to feed the mobile `places` experience:

- create/edit places
- manage bilingual intro fields
- maintain category/tag/recommendation state
- upload and attach place galleries
- manage map-related fields such as coordinates and optional POI references

### Backend integration foundation

The backend foundation work is broader than `places` because the project depends on one BFF for all three modules. This change therefore also hardens:

- provider parity between mock and CloudBase-backed execution
- route-level validation and permission behavior
- minimum admin-facing support for events and posts moderation workflows
- files/media support used by places and other modules

## Data Shape Guidance

Keep places data split by consumer surface:

- list payload: card-oriented and filterable
- marker payload: minimal map-safe payload
- detail payload: gallery, tags, bilingual intro, hours, address, and navigation-ready fields

Avoid reusing the full detail shape for map markers.

## Testing Strategy

Prioritize tests at the contract and route boundary:

- shared schema/contract tests for places query and response shapes
- route tests for places public and admin flows
- parity tests between mock and HTTP/CloudBase behavior
- manual verification for map, detail, navigation, and admin content updates

Frontend-specific validation remains primarily manual for this change, with emphasis on loading/error/empty states and full-chain checks after admin updates.
