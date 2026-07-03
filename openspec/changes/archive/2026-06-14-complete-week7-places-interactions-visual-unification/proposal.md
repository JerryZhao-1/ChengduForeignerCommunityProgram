## Why

The `places` mobile module now has functional list, map, detail, filter, recommendation, and admin-fed media flows, but Week 7 still needs to turn visible interaction seams into product-quality behavior. Favorite/share/navigation should feel intentional in v1, while preserving a clean path to persisted favorites later.

## What Changes

- Add a visible v1 favorite interaction for places without introducing a blocking backend favorite contract.
- Add page-level share entry behavior for place detail using the existing detail/share payload.
- Move navigation launching into a unified places action helper so location opening, failure feedback, and future authorization handling are consistent.
- Remove placeholder-quality copy and transitional interaction surfaces from the `places` module, including favorite/share "pending" wording and recommendation redirect copy.
- Unify places module visual and interaction standards across list, map, detail, recommendation, action buttons, chips, cards, loading, empty, and error states.
- Document and verify Mini Program share behavior, location/privacy permission expectations, and map/navigation authorization prompts.

## Capabilities

### New Capabilities
- `places-interaction-closure`: Covers v1 favorite state, share entry behavior, unified navigation actions, and places module visual/interaction cleanup.

### Modified Capabilities
None. The related `places-mobile-experience` work is currently part of another active change and is referenced for context, but this proposal introduces a focused Week 7 interaction-closure capability rather than modifying an archived spec.

## Impact

- Affected code:
  - `apps/mobile/src/pages/places/**`
  - `apps/mobile/src/components/**` if existing state/action wrappers need small reuse improvements
  - `apps/mobile/src/pages.json` only if page metadata or share-related page behavior requires adjustment
- Affected docs/specs:
  - `openspec/specs/places-mobile-experience`
  - Week 7 validation evidence under `auto_test_openspec/complete-week7-places-interactions-visual-unification/`
- No backend API or database schema change is required for this v1 closure.
- No persistent favorite storage contract is added in this change.
