# Task 4.1 bilingual content audit and backfill validation

- Change: `complete-mobile-english-language-support`
- Run: `#14`
- Task: `4.1`
- Ref: `R10`
- Scope: `CLI`

The bundle validates provenance, record counts, formal bilingual fields, placeholders, statuses, forbidden URLs, media attribution, and Discover original-language metadata. `valid-production-candidate.json` is deliberately production-shaped test data, not a real production export; only task 5.3 may use a real export to close the release gate.

Migration behavior is file-only and review-gated: dry-run emits a digest, apply requires that exact digest, actions are scoped, the input object is never mutated, a repeated plan has zero actions, and English editorial content is never generated.
