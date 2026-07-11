## Why

The mobile H5 and WeChat Mini Program currently expose only partial English support: Places and Discover localize most content, while Events, home shortcuts, notifications, registration, login, language settings, native navigation titles, and several feedback states remain fixed in Chinese. Language choice is memory-only, published bilingual fields can be empty, and the existing launch audit proves only a sample and only a subset of required bilingual fields, so the product cannot yet promise a complete or durable English experience for foreign residents.

## What Changes

- Provide one centralized `zh`/`en` mobile copy model that covers every launch-scope route, component, validation message, empty/loading/error state, share label, native navigation title, and tab item.
- Replace the ambiguous language switch with an explicit Chinese/English selector that updates the current UI immediately, persists locally, initializes from the authenticated user's preference or device language when appropriate, and synchronizes `preferred_language` without forcing Chinese during login.
- Define deterministic localized-content fallback behavior so a missing preferred-language value never renders a blank title, address, summary, or action-critical label.
- Complete English support across Home, Events list/detail/registration/ticket states, Places categories and details, Discover governance flows, Me/Profile, notifications, registrations, login, and language settings while preserving UGC in its original language with a visible language label.
- Add bilingual event address fields and locale-aware notification presentation while preserving compatibility for existing records during migration.
- Allow incomplete formal content to remain draft, but prevent Places and Events from becoming publicly visible until all required bilingual launch fields are non-empty and non-placeholder.
- Strengthen the reproducible content audit to inspect real exported production candidates and all required bilingual fields, separately reporting blocking data gaps and editorial review items.
- Add shared, mobile, API, admin, and release acceptance coverage for locale initialization, persistence, switching, fallback, publication guards, and full English user journeys.

## Capabilities

### New Capabilities

- `mobile-language-experience`: Defines complete mobile UI localization, explicit language selection, preference initialization and persistence, localized fallback, and original-language treatment for UGC.

### Modified Capabilities

- `events-integration-readiness`: Requires bilingual event address/content readiness, locale-complete mobile event browsing and registration, and publication guards for required English fields.
- `places-mobile-experience`: Requires locale-correct place labels, category display, content fallback, navigation/share text, and non-blank English browsing behavior.
- `places-admin-management`: Allows incomplete bilingual drafts but blocks publication or published updates when required bilingual place fields are missing or placeholder values.
- `files-auth-notifications-readiness`: Makes authenticated language preference authoritative and notifications locale-aware without weakening ownership boundaries.
- `mini-program-release-readiness`: Adds Chinese-to-English switching, relaunch persistence, navigation/tab copy, and complete English core-flow acceptance to Mini Program release evidence.

## Impact

- Mobile: `apps/mobile/src/i18n`, app store/bootstrap, `pages.json` runtime title handling, and all launch-scope pages under Home, Events, Discover, Places, and More.
- Shared contracts: event address representation, notification localization representation, non-empty bilingual publication validation, and migration-compatible schemas/types.
- API/providers: auth preference updates, public projection fallback/compatibility, notification payloads, and Places/Events publication guards in mock and CloudBase providers.
- Admin: bilingual readiness indicators and blocking validation at Places/Event publication actions while retaining draft saves.
- Operations: production content export/audit inputs, launch documentation, and GUI/MIXED validation bundles for H5, WeChat DevTools, and real-device checks.
- No additional UI component library is introduced; Mini Program controls continue to follow TDesign MiniProgram guidance.
