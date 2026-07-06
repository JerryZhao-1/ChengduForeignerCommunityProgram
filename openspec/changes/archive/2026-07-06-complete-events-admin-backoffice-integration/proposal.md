## Why

Events already have public browsing, signup, ticket, and minimum admin mutation APIs, but the admin Events page still reads the public list and behaves like a skeleton. Admins cannot reliably see drafts, edit events, manage publication state, inspect registrations, or perform check-in from the backoffice, which blocks a real create-publish-register-check-in operating loop.

## What Changes

- Add a full admin event listing path so authorized admins can read draft, pending review, approved, published, offline, and ended events without relying on public `GET /events`.
- Expand shared event admin contracts, API paths, clients, providers, Koa routes, and CloudBase handler parity for admin listing and registration inspection.
- Upgrade `apps/admin` Events management from a skeleton table to a usable backoffice workflow with create/edit dialog, filters, status actions, feedback, loading states, registration drawer/detail view, and check-in form.
- Preserve public event visibility boundaries: public reads continue to expose only launch-visible events, while admin reads expose management records.
- Add regression tests for admin list visibility, draft/public separation, create-publish flow, registration listing, check-in success, and already-used ticket errors.
- Update implemented API documentation and usage guides for new admin Events management endpoints and backoffice flows.
- Defer registration export; export support is explicitly out of scope for this change.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `events-integration-readiness`: Expand event admin maintenance from minimum backend mutations to a complete backoffice-ready loop covering admin event listing, create/edit/review/publication actions, registration inspection, check-in, UI feedback, and end-to-end validation.

## Impact

- `packages/shared/src/schemas/events.ts`
- `packages/shared/src/contracts/events.ts`
- `packages/shared/src/contracts/paths.ts`
- `packages/shared/src/client.ts`
- `packages/shared/src/mock/client.ts`
- `packages/shared/src/mock/service.ts`
- `apps/api/src/routes/events.ts`
- `apps/api/src/providers/types.ts`
- `apps/api/src/providers/mock/index.ts`
- `apps/api/src/cloudbase.ts`
- `apps/admin/src/pages/EventsPage.vue`
- `apps/admin/src/api/client.ts`
- `apps/api/test/*`
- `packages/shared/test/*`
- `docs/已实现API接口清单.md`
- `docs/API接口使用手册.md`
