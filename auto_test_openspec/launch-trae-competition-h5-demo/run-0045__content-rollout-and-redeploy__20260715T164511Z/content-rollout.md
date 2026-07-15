# Content rollout

## Preflight and results

- All 22 deterministic IDs had zero conflicts.
- Before: users 8, posts 4, places 20, events 2.
- Redacted pre-write snapshot SHA-256: `117f9990e3b9441d8dbd6a60ea2545a73c3747454729aabe0e9153378bbba355`.
- After: users 13, posts 14, places 24, events 5.
- Public API: posts 12, places 15, events 4.
- Organizer reference: `admin_001`; no credential or PII field was read.
- All four places are `published`; all three events transitioned `draft/draft` → `approved/published`.
- All ten posts resolve to one of five synthetic authors and valid inserted place/event references.

## Inserted deterministic IDs

- Users: `demo_user_lin_xiao`, `demo_user_maya_chen`, `demo_user_ajie`, `demo_user_samir_k`, `demo_user_grace_notes`.
- Places: `demo_place_newcomer_hub`, `demo_place_community_living_room`, `demo_place_family_reading_corner`, `demo_place_community_tool_station`.
- Events: `demo_event_newcomer_walk`, `demo_event_bilingual_tea`, `demo_event_map_workshop`.
- Posts: `demo_post_newcomer_checklist_zh`, `demo_post_first_week_questions_en`, `demo_post_family_reading_zh`, `demo_post_tool_sharing_en`, `demo_post_bilingual_tea_zh`, `demo_post_walk_reminder_zh`, `demo_post_everyday_phrases_en`, `demo_post_map_workshop_en`, `demo_post_borrowing_etiquette_zh`, `demo_post_weekly_roundup_zh`.

## Junk-state changes

- `event_54d6aa0a-081a-444a-9ee6-b2a9b223000c`: `approved/published` → `rejected/offline`.
- `post_81a7c3d1-225d-42d3-b44d-9b151a87153d` and `post_21cbc866-3f70-44a0-81ba-7a2431500266`: `visible/visible` → `hidden/hidden`.

No synthetic user received `_openid`, phone, login credentials, or a real-person portrait.
