## Context

The repository already has shared contracts, Koa routes, CloudBase handler dispatch, mock provider behavior, mobile pages, and thin admin pages for `events`, `discover`, files, and notifications. The remaining 6.19-6.21 gap is not broad product invention; it is integration readiness: the happy paths exist, but business guards, public visibility, ownership checks, and negative-path evidence are too weak for a full-module smoke window.

The current CloudBase live provider only replaces `places`; non-places capabilities fall back to mock behavior even when `API_PROVIDER=cloudbase` and `CLOUDBASE_PROVIDER_MODE=live`. This change can harden local/API semantics without claiming CloudBase live persistence for `events`, `discover`, files, or notifications.

## Goals / Non-Goals

**Goals:**

- Make events list/detail/registration/ticket/check-in/admin behavior stable enough for local HTTP and CloudBase handler integration smoke.
- Make discover feed/detail/post/comment/report/moderation behavior stable enough for end-to-end local integration without leaking hidden or deleted content.
- Make files, notifications, auth, and role boundaries predictable for public/private access, ownership, invalid actor, validation, permission, and not-found cases.
- Keep shared schemas/contracts as the source of truth and cover route/provider behavior with focused Vitest tests.
- Update sprint status only from evidence after implementation.

**Non-Goals:**

- Full CloudBase live persistence for events, posts, comments, files, notifications, operation logs, or production auth.
- A complete production moderation console, export system, payment flow, SMS/email notification system, or push notification provider.
- A full mobile UI redesign; UI changes should be limited to removing blockers from the minimum launch paths.
- Production data migration or production environment write strategy.

## Decisions

### Decision 1: Harden business semantics at the provider/API boundary first

The existing public clients already consume shared contracts, and the API layer centralizes envelope and error behavior. The implementation should first tighten provider and route semantics, then adjust mobile/admin only where a missing client method or unusable state blocks the minimum flow.

Alternatives considered:

- Build UI flows first. This would make pages appear more complete while leaving API behavior inconsistent.
- Add new standalone services. This would increase architecture surface area without solving the immediate integration risk.

### Decision 2: Treat public visibility as a first-class rule for events and discover

Events public list/detail should expose only publishable records, and discover public feed/detail should expose only visible content. Admin routes remain the place for draft, rejected, hidden, deleted, or review-only states.

Alternatives considered:

- Let public routes return all records and hide states in the frontend. This would leak moderation and draft content through the BFF and conflict with the places visibility model.
- Add new public DTOs immediately. That may be useful later, but the current schema can first enforce visibility with existing fields.

### Decision 3: Use stable error codes for launch blockers

Validation problems should remain `VALIDATION_ERROR`; missing resources should return `NOT_FOUND`; protected actions should return `FORBIDDEN`; duplicates, capacity limits, closed signup, used tickets, or ownership conflicts should return `CONFLICT` when no more specific existing code applies.

Alternatives considered:

- Return `400` for all business failures. This would make repeated registration, full events, and already-used tickets hard for clients to distinguish.
- Add many new error codes. That would increase contract churn before launch.

### Decision 4: Keep CloudBase non-places live status explicit

Unless this change implements live providers and live acceptance evidence for non-places modules, docs and plan updates must keep those providers as not live-accepted. Local HTTP and CloudBase handler parity can be accepted separately from live persistence.

Alternatives considered:

- Treat CloudBase handler tests as live provider acceptance. That would be misleading because handler tests can still exercise fallback mock state.
- Require all non-places live providers in this change. That is likely larger than the 6.19-6.21 readiness gate and risks delaying the business guardrails.

### Decision 5: Validation bundles should be CLI-first

The 6.19-6.21 gates are mostly API and provider semantics. Each task should produce a CLI validation bundle that runs targeted Vitest/API checks and captures machine-decidable outputs. GUI or Mini Program evidence can remain a later full-module smoke activity unless a task explicitly touches UI.

Alternatives considered:

- Make every task MIXED with GUI evidence. This adds overhead while the most important risk is backend semantics.
- Rely on manual Postman checks only. That would not satisfy the repository's evidence model.

## Risks / Trade-offs

- [Risk] Existing mock clients may assume optimistic data and need small adjustments if mock service starts rejecting invalid operations. -> Mitigation: keep API route tests authoritative and update shared mock client only where required by existing app flows.
- [Risk] Event dates in seed data are historical relative to the current sprint date. -> Mitigation: avoid making seed event success depend on current wall-clock time unless tests create fresh future events for registration scenarios.
- [Risk] File private URL behavior can be over-tightened and break admin gallery attachment tests. -> Mitigation: distinguish public gallery resolution from private URL issuance and cover both in API tests.
- [Risk] Notification "trigger" is underspecified. -> Mitigation: define minimum trigger evidence as system-created notifications from critical actions only if implemented; otherwise mark provider-triggered push/outbound delivery as P1 and retain list/read ownership checks as P0.
- [Risk] CloudBase live provider expectations may be interpreted as part of this change. -> Mitigation: update CloudBase/deployment docs and `docs/plan.md` with exact status and remaining live-provider work.
