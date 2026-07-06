## Context

The events module already has public list/detail reads, user registration, ticket retrieval, and admin create/update/review/check-in APIs. The admin Events page currently reads the public event list, so it cannot show drafts or offline records, and its actions have no visible feedback when a mutation succeeds or fails. This prevents admins from validating the real operational loop: create draft, edit details, publish, observe mobile visibility, inspect registrations, and check in tickets.

The repository convention requires shared schemas/contracts first, API routes/providers second, app clients third, and documentation/tests with any API or workflow change. Public event reads must remain launch-visible only; admin reads must expose management records.

## Goals / Non-Goals

**Goals:**

- Add an authorized admin event list API that returns all event statuses needed for management.
- Make `apps/admin` Events management usable for create, edit, publish/offline/re-publish, filtering, status feedback, and loading/error states.
- Add admin registration listing and check-in support so staff can inspect signups and mark tickets used from the backoffice.
- Keep public mobile behavior bounded by existing public contracts while proving admin changes propagate to mobile when published.
- Add tests and docs for the API and admin/mobile smoke expectations.

**Non-Goals:**

- Registration export is deferred.
- CloudBase live persistence for events remains out of scope unless existing fallback/provider parity requires route coverage.
- Multi-community platform management is out of scope; this remains scoped to the current Tongzilin community model.
- A full design-system redesign of the admin app is out of scope; use existing Vue 3 + Element Plus patterns.

## Decisions

1. Add admin-specific list endpoints instead of widening public `GET /events`.
   - Decision: implement `GET /admin/events` for all management statuses and keep `GET /events` public-only.
   - Rationale: public/mobile contracts must not leak draft, rejected, offline, or ended content.
   - Alternative considered: add query flags to public `GET /events`; rejected because it mixes authorization-sensitive admin behavior into public reads.

2. Use shared schemas and client contracts for all new admin flows.
   - Decision: add paths/client methods for `admin.listEvents()` and `admin.listEventRegistrations(eventId)`, and reuse existing `admin.checkinEvent(eventId, { ticket_id })`.
   - Rationale: admin and API callers stay aligned with existing BFF and envelope conventions.
   - Alternative considered: implement admin-only ad hoc fetches in `apps/admin`; rejected because this bypasses cross-app contract rules.

3. Keep admin registration listing separate from public user registration reads.
   - Decision: add `GET /admin/events/:id/registrations` returning registration rows with enough ticket state for staff operations.
   - Rationale: `GET /events/me/registrations` is actor-scoped and cannot support staff views.
   - Alternative considered: overload `/events/me/registrations`; rejected because it would weaken ownership semantics.

4. Implement the admin page as one table plus modal/drawer workflows.
   - Decision: use an Events table with filters and row actions, a create/edit dialog, and a registration/check-in drawer.
   - Rationale: this matches current admin app conventions and avoids introducing new navigation or nested pages.
   - Alternative considered: add dedicated detail routes for every event; deferred until the admin app has broader routing needs.

5. Preserve existing registration timing semantics.
   - Decision: published events can be registered before `start_time` if `signup_deadline` has not passed.
   - Rationale: this is the current main branch behavior and avoids importing PR #3's conflicting `event_not_started` rule.
   - Alternative considered: block pre-start registration; rejected for this change.

## Risks / Trade-offs

- Admin table can grow dense as fields and actions are added -> mitigate with filters, compact column formatting, and drawer/dialog workflows.
- Mock provider and HTTP handler can drift -> mitigate with integration tests covering Koa and CloudBase compatibility where routes exist.
- Admin creates draft but expects mobile visibility immediately -> mitigate with explicit status labels and tests proving draft is admin-only until published.
- Check-in by ticket code vs ticket id can be ambiguous -> support ticket id as the canonical API input first and allow UI lookup or direct code handling only if the implementation can map code safely.

## Migration Plan

1. Add shared contracts, paths, client methods, and provider interfaces.
2. Implement mock service/provider admin event list and registration listing.
3. Add Koa routes and CloudBase handler parity for new admin endpoints.
4. Upgrade `EventsPage.vue` to use admin list, dialogs/drawers, actions, filters, and feedback.
5. Add API/shared/admin tests, then run typecheck, lint, full Vitest, and browser/manual smoke.
6. Update API docs and usage docs.

Rollback is straightforward while in mock/local development: remove the new admin routes/client methods and revert `EventsPage.vue` to public list behavior. No data migration is required.

## Open Questions

- Whether check-in UI must accept ticket code directly in v1 or only ticket id; the API remains canonical on ticket id unless implementation adds a safe code lookup.
- Resolved 2026-07-06: event cover upload is integrated as direct Admin multipart upload. The event DTO keeps `cover_file_id`, `cover_cloud_path`, and `cover_url`; the Admin form hides those technical fields and fills them from upload responses.
