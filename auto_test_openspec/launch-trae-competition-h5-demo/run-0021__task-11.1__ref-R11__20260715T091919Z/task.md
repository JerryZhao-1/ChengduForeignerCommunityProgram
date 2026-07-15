# Singular contract validation — locked deterministic community plan contracts

- Change: `launch-trae-competition-h5-demo`
- Run: `0021`
- Task: `11.1`
- Ref: `R11`
- Scope: `CLI`
- Provenance: replacement worker bundle derived from task 11.1 ACCEPT/TEST; supplements run-0010 with strengthened rejection coverage for `model`/`prompt` response fields, expanded projection leakage fields, and expanded PII fields.

## How to run

- macOS/Linux: `bash auto_test_openspec/launch-trae-competition-h5-demo/run-0021__task-11.1__ref-R11__20260715T091919Z/run.sh`
- Windows: `auto_test_openspec\launch-trae-competition-h5-demo\run-0021__task-11.1__ref-R11__20260715T091919Z\run.bat`

## Inputs and outputs

- Inputs: shared schemas, contracts, paths, client, and the request/plan cases embedded in `packages/shared/test/community-plans.spec.ts`, `packages/shared/test/community-plan-engine.spec.ts`, and `packages/shared/test/client.spec.ts`.
- Output: `logs/run.log` with typecheck and focused Vitest results.

## What this bundle validates

1. Request only accepts five strict fields (`preferred_language`, `primary_interest`, `arrival_context`, `household_type`, `accessibility_need`).
2. `primary_interest` and `accessibility_need` are required single-select enums (not arrays).
3. Request rejects legacy arrays (`interests`, `accessibility_needs`), `community_id`, PII (`phone`, `email`, `name`, `user_id`, `openid`), free text (`notes`), and unknown fields.
4. Response requires `scenario_key`, `catalog_version` (literal `tongzilin-curated-v1`), four ordered reasons (`primary_interest` → `arrival_context` → `household_type` → `accessibility_need`), and strict two-station route (one `place_visit` + one `event_attend`, 120 minutes).
5. Response rejects `generated_by`, `ai_status`, `usage`, `generation_source`, `model`, and `prompt` fields.
6. Only `POST /community-plan/generate` is exposed via `apiPaths.communityPlan`, `communityPlanContracts`, and `CommunityMapApiClient.communityPlan`.
7. Place and event projections reject detail/admin/capacity/contact/review fields (`address_zh`/`address_en`, `gallery_urls`, `navigation`, `intro_zh`, `business_hours_zh`, `community_id`, `review_status`, `import_review`, `contact_phone`, `organizer_user_id`, `publish_status`, `signup_deadline`, `address_text`, `registration_count`).

## Expected result

- Shared typecheck exits `0`.
- All three focused test files pass (54 tests total: 14 + 14 + 26).
- Any command failure makes the script exit non-zero. The Supervisor records final PASS/FAIL after execution.
