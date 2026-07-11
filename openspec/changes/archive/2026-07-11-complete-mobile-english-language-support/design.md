## Context

The mobile app already has a lightweight reactive locale store, a large bilingual catalog for Discover/Me/Profile, a separate Places catalog, and bilingual formal-content fields for Places, Events, and Announcements. The implementation is fragmented: Events and several More/Home pages retain Chinese literals, native titles are static, the selector is unlabeled and memory-only, login forces Chinese, notification and event-address contracts are single-language, and `pickLocalized` returns an empty preferred-language value without fallback.

The change crosses mobile UI, shared contracts, API/provider behavior, admin publication workflows, existing content, and launch evidence. It must preserve the single-community architecture, mock/HTTP/CloudBase modes, public payload boundaries, UGC original-language behavior, and TDesign MiniProgram as the preferred Mini Program UI system.

## Goals / Non-Goals

**Goals:**

- Make every launch-scope user journey usable in either Chinese or English without fixed-language controls, blank formal content, or a relaunch reset.
- Establish one typed locale catalog and one localized-value helper with deterministic fallback behavior.
- Persist and synchronize language preference without coupling rendering to network availability.
- Require publication-ready Places and Events to contain complete, non-placeholder bilingual formal content while preserving incomplete drafts.
- Migrate event addresses and system notifications to locale-aware data without breaking existing records during rollout.
- Make bilingual completeness testable through shared/API/mobile tests, static catalog checks, production-candidate content audits, H5 GUI checks, and WeChat Mini Program evidence.

**Non-Goals:**

- Automatically translate UGC posts, comments, profile names, user-entered locations, or moderation evidence.
- Add languages beyond `zh` and `en`.
- Introduce a multi-community or tenant-specific translation platform.
- Replace TDesign MiniProgram, Element Plus, or the existing API envelope/provider architecture.
- Translate admin-console UI into English; the admin changes are publication-readiness controls for bilingual public content.

## Decisions

### 1. Keep a lightweight typed catalog instead of adding a general i18n dependency

Create a single mobile catalog organized by shared navigation and business modules (`common`, `navigation`, `home`, `events`, `discover`, `places`, `me`, `auth`, and `notifications`). Define the Chinese catalog shape as the canonical type and require the English catalog to satisfy the same recursive key structure. Existing Discover and Places copy moves into this catalog without changing its user-facing meaning.

This approach matches the current two-locale, single-app scope and avoids adding runtime/plugin configuration across uni-app H5 and mp-weixin. A full i18n library was considered, but its routing, pluralization, and lazy-loading features are not currently needed; catalog parity and interpolation helpers provide the required safety with less migration risk.

Dynamic values use small named interpolation functions rather than string concatenation in pages. Dates use explicit locale selection (`zh-CN` or `en`) while preserving the project timezone expectations. Route code and domain state helpers return stable codes; pages translate codes through the catalog instead of storing Chinese labels in business logic.

### 2. Resolve locale through an offline-first precedence model

Locale initialization uses this precedence:

1. A valid locally stored explicit choice.
2. The authenticated user's `preferred_language` when no explicit local choice exists.
3. The device/system language when neither stored nor authenticated preference exists.
4. `zh` as the final fallback.

Selecting a language updates reactive state and local storage immediately. When authenticated, the client asynchronously synchronizes the same value through the auth/profile contract; a network failure does not roll back the local UI and is retried on the next session or preference change. Login and WeChat session initialization stop sending a hard-coded Chinese value. If a stored explicit choice and server preference differ, the stored explicit choice wins on that device and is synchronized to the server.

The alternative of treating the server preference as always authoritative was rejected because it would cause a visible language jump after authentication and make offline selection unreliable.

### 3. Localize native navigation surfaces at runtime

`pages.json` remains the static build manifest with safe fallback labels. Each route derives its title key from centralized route metadata and calls `uni.setNavigationBarTitle` when shown or when the locale changes. The five tab items are updated through `uni.setTabBarItem` from the same catalog. Custom-navigation pages consume the identical route title metadata.

This avoids duplicating bilingual titles across page files and ensures H5 and mp-weixin share one source of truth. Static manifest text alone cannot respond to runtime locale changes.

### 4. Use deterministic content fallback and preserve UGC language

Formal content uses `pickLocalized(locale, { zh, en }, options)` with the following behavior:

- Return the trimmed preferred-language value when present.
- Otherwise return the trimmed counterpart value and expose `usedFallback=true` to callers that need a language indicator.
- Otherwise return an explicit localized unavailable label for action-critical surfaces, or an empty optional value when the section is intentionally omitted.

Formal public content should normally never reach fallback after publication gates are enabled, but the fallback protects legacy and partially migrated records. Current `pickLocalized(locale, zh, en)` call sites are migrated centrally rather than inventing page-specific fallback rules.

UGC posts/comments remain one original-language `title/content` plus `language`. They are never passed through formal-content fallback or machine-translated. Feed/detail/search surfaces show the original content and a localized Chinese/English language badge.

### 5. Add bilingual event addresses and locale-aware notifications compatibly

Events add canonical `address_zh` and `address_en`. The legacy `address_text` remains readable during migration and is populated from the Chinese address for compatibility until all consumers and stored records are migrated. Public/admin projections expose the canonical pair; mobile selects it through the common helper.

Notifications add optional bilingual presentation fields (`title_zh`, `title_en`, `body_zh`, `body_en`) while retaining legacy `title` and `body` during rollout. New system-generated notifications must provide both localized variants. Reads normalize legacy records into the response shape and mobile falls back to the legacy value when the localized pair is unavailable. Ownership and mark-read semantics do not change.

A template-key-plus-parameters notification system was considered. It is more scalable for many languages but would expand this change into notification-template versioning and historical rendering; bilingual stored presentation fields are sufficient for the current two-language launch.

### 6. Enforce bilingual completeness at publication transitions, not draft validation

Shared schemas continue to accept incomplete draft authoring where operationally necessary. A shared publication-readiness validator evaluates the resulting full entity whenever:

- an Event is approved/published or an already published Event is edited;
- a Place changes to `published` or an already published Place is edited.

Required Event fields are non-placeholder `title_zh`, `title_en`, `summary_zh`, `summary_en`, `content_zh`, `content_en`, `address_zh`, and `address_en`. Required Place fields are `name_zh`, `name_en`, `address_zh`, `address_en`, `business_hours_zh`, `business_hours_en`, `intro_zh`, and `intro_en`; both recommendation reasons are also required when `is_recommended=true`.

Validation trims whitespace and rejects known placeholder values used by current draft defaults. The API/provider is the enforcement boundary; Admin mirrors the same shared validator for immediate field-level feedback and disables/blocks publication. Draft saves remain allowed.

Making every bilingual field globally `.min(1)` was rejected because it would prevent gradual volunteer import and draft completion.

### 7. Separate fixture checks from production-candidate content evidence

The content audit accepts an exported JSON artifact with provenance (`environment`, export timestamp, source collections/query, and record counts). It checks every public candidate for required bilingual fields, placeholders, draft leakage, forbidden URLs, and media attribution. Places, Events, and Announcements use formal bilingual rules; Discover UGC is checked for a valid original-language code rather than a translated duplicate.

Fixture mode remains available for automated regression tests but its output is explicitly labeled `fixture` and cannot satisfy the production readiness gate. A real export is required for release evidence. Blocking issues and editorial review items remain separate.

## Risks / Trade-offs

- [Risk] Existing CloudBase Events and notifications lack the new fields. → Mitigation: deploy additive schemas/read normalization first, backfill records, audit, and only then enable strict publication gates.
- [Risk] Persisted locale and server preference can race during startup. → Mitigation: use the documented precedence, initialize once before page rendering where possible, and make server synchronization idempotent.
- [Risk] Pages may retain hidden Chinese literals after catalog migration. → Mitigation: add a scoped static scan allowlist plus English-mode GUI coverage for every route group; do not treat user/UGC data as UI copy.
- [Risk] Runtime tab/title APIs may behave differently between H5 and mp-weixin. → Mitigation: test both builds and include WeChat DevTools evidence; retain safe manifest fallbacks.
- [Risk] Publication guards can block edits to currently published incomplete records. → Mitigation: report affected ids before rollout, backfill first, and return field-specific validation details so operators can repair them.
- [Risk] Falling back to Chinese can make the English experience mixed for legacy data. → Mitigation: show a language indicator when fallback occurs and treat any fallback on launch-critical formal content as a content-audit blocker until backfilled.
- [Trade-off] Storing two notification renderings duplicates text. → This is accepted for the current `zh`/`en` scope to avoid introducing template-version infrastructure.

## Migration Plan

1. Introduce catalog types, locale resolution/persistence, fallback helpers, and additive shared fields without enabling publication blocking.
2. Migrate mobile routes and domain helpers to catalog keys; localize runtime navigation/tab surfaces and all launch-scope pages.
3. Update mock and CloudBase providers plus admin forms for bilingual event addresses, localized notifications, and shared readiness diagnostics.
4. Export current production candidates, backfill Event addresses, notification variants where operationally relevant, and incomplete Places/Events formal content.
5. Run the expanded audit and resolve all blocking bilingual issues.
6. Enable provider-level publication guards for Places and Events and verify Admin field-level feedback.
7. Complete H5, mp-weixin build, WeChat DevTools, and real-device Chinese/English acceptance evidence before release.

Rollback keeps additive bilingual fields in storage, disables the new publication guard, and restores the previous mobile bundle. Readers continue supporting legacy `address_text` and notification `title/body`, so data rollback is not required.

## Open Questions

- Editorial owners must confirm final English copy for existing production records; implementation can proceed with the field list and validation rules, but release cannot pass with placeholders.
- Real-device evidence should include at least one device whose system language is English to verify first-launch device-locale initialization; if unavailable, the blocker and owner must be recorded.
