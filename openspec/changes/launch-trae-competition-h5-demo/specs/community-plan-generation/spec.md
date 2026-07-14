## ADDED Requirements

### Requirement: Shared SHALL define a strict guest preference schema without community or PII input

`NewResidentPreferenceSchema` SHALL use Zod `.strict()` and accept only `preferred_language`, predefined `interests`, `arrival_context`, `household_type`, and predefined `accessibility_needs`. It SHALL reject unknown keys, free-text values, identity/contact fields, and `community_id`. After validation, the API SHALL inject the literal `community_id: "tongzilin"`; clients SHALL NOT choose a community. `accessibility_needs` MAY influence deterministic selection but SHALL NOT be sent to AI.

#### Scenario: Valid preference input is accepted

- **WHEN** a guest submits valid enum values and arrays for all five preference fields
- **THEN** the strict schema accepts the input
- **AND** the API adds `community_id: "tongzilin"` only after validation

#### Scenario: Unknown, PII, free-text, or community fields are rejected

- **WHEN** a request includes `community_id`, `name`, `phone`, `email`, `address`, a notes field, or any other unknown key
- **THEN** validation fails with `400 VALIDATION_ERROR`
- **AND** no unknown field is silently stripped into accepted input

### Requirement: Shared SHALL define an invariant-checked two-item Community Plan

`CommunityPlanItemSchema` SHALL be a discriminated union in which `place_visit` requires `ref_type: "place"` and `event_attend` requires `ref_type: "event"`; `activity` SHALL NOT be valid. The July 15 MVP plan SHALL contain exactly one item of each type. Every item SHALL have a unique `item_id`, unique `ref_id`, integer `start_offset_minutes`, positive integer `duration_minutes`, bilingual title/summary/tips, and initial server status `pending`.

`CommunityPlanSchema` SHALL include an opaque ephemeral `plan_id`, literal `community_id: "tongzilin"`, `generated_at`, and the two items. It SHALL require chronologically ordered, non-overlapping items; every item end SHALL be at most minute 120; `total_duration_minutes` SHALL equal the sum of item durations and SHALL equal 120 for the canonical plan. It SHALL include `generation_source` (`rule_based` | `ai_enhanced` | `rule_based_fallback`), `ai_status` (`ok` | `not_configured` | `timeout` | `validation_failed` | `upstream_error` | `unavailable`), and optional `usage` with non-negative `prompt_tokens`, `completion_tokens`, and `total_tokens`. `usage` SHALL be present only for successful AI output and its `total_tokens` SHALL be greater than zero; the opaque plan ID SHALL NOT imply persistence or a detail endpoint.

#### Scenario: Canonical plan passes every invariant

- **WHEN** a plan contains one 60-minute place item at offset 0 and one 60-minute event item at offset 60 with unique IDs
- **THEN** the plan parses successfully
- **AND** `total_duration_minutes` is 120

#### Scenario: Type and reference mismatch is rejected

- **WHEN** a `place_visit` uses `ref_type: "event"` or an `event_attend` uses `ref_type: "place"`
- **THEN** schema validation fails

#### Scenario: Duplicate, unordered, overlapping, overtime, or inconsistent totals are rejected

- **WHEN** item IDs or reference IDs repeat, items are out of order or overlap, an item ends after minute 120, or the declared total differs from the duration sum
- **THEN** schema validation fails

#### Scenario: Unsupported activity item is rejected

- **WHEN** an item has `type: "activity"`
- **THEN** schema validation fails

### Requirement: Shared SHALL define strict public-safe Community Plan projections

The shared layer SHALL define explicit allowlist schemas for data consumed by the engine, AI adapter, route page, and offline bundle. A place projection SHALL contain only `_id`, `name_zh`, `name_en`, `cover_url`, `category_level_1`, `is_recommended`, and `location`. An event projection SHALL contain only `_id`, `title_zh`, `title_en`, `summary_zh`, `summary_en`, `start_time`, `end_time`, and `cover_url`. The offline bundle SHALL contain only a version, validated plan, marker-safe markers, place projections, and event projections.

No projection or bundle SHALL serialize full address, detail intro/body, gallery, navigation, share data, organizer/contact data, capacity/registration internals, moderation/import-review fields, draft/deleted state, audit metadata, or any admin-only field.

#### Scenario: Place detail and admin fields cannot enter a plan projection

- **WHEN** a source place contains address, gallery, navigation, share, import-review, moderation, or audit fields
- **THEN** the serialized Community Plan place projection contains only the allowlisted marker-safe fields

#### Scenario: Event operational fields cannot enter a plan projection

- **WHEN** a source event contains organizer, contact, capacity, remaining-capacity, registration, moderation, or audit data
- **THEN** the serialized event projection contains only the allowlisted public display fields

#### Scenario: Offline bundle is rejected when it contains detail data

- **WHEN** an offline bundle adds a full address, gallery, capacity, admin status, or another unknown field
- **THEN** strict bundle validation fails

### Requirement: Shared SHALL expose only the plan generation POST contract

`apiPaths.communityPlan.generate` SHALL equal `/community-plan/generate`, and the shared contract SHALL use `POST` with the strict preference request and Community Plan response. `CommunityMapApiClient`, the mock client, and the HTTP client SHALL expose `communityPlan.generate(input)`. No Community Plan detail path, GET contract, persistence API, preference-save API, or completion-write API SHALL be added.

#### Scenario: Generate contract is correctly wired

- **WHEN** the shared paths, contract, and clients are inspected
- **THEN** they expose one `POST /community-plan/generate` operation with the shared request and response schemas

#### Scenario: Plan detail API is absent

- **WHEN** the paths and client surface are inspected
- **THEN** no `communityPlan.detail`, plan GET, plan-save, or completion-write operation exists

### Requirement: Implementation SHALL follow shared to API/provider to client to mobile dependency order

Community Plan implementation SHALL be accepted in this sequence: shared schemas/contracts/paths/fixtures, API route/provider and security, shared HTTP/mock clients plus mobile adapter, then H5 pages/store. Downstream layers SHALL import shared definitions rather than recreating DTOs or enums.

#### Scenario: Dependency direction is reviewed

- **WHEN** the implementation diff is inspected
- **THEN** Community Plan DTOs and stable enums originate in `packages/shared`
- **AND** API/provider code precedes client usage and mobile UI usage in task completion

### Requirement: Deterministic engine SHALL produce the canonical place and curated-event plan

The provider SHALL select exactly one published Tongzilin place from the public-safe candidate projection according to deterministic preference weights and append exactly one event identified by configured `COMMUNITY_PLAN_DEMO_EVENT_ID`. The plan SHALL total 120 minutes, use stable ordering, and return identical structure for identical input and fixture data. The event SHALL be a release-validated curated demo fixture; the engine SHALL NOT query or claim real-time remaining capacity, create a registration, or substitute an arbitrary event when the configured fixture is missing.

#### Scenario: Identical input generates identical structure

- **WHEN** the same validated preferences and candidate fixtures are supplied twice
- **THEN** both plans contain the same ordered place and curated-event references, offsets, and durations

#### Scenario: Draft or cross-community place is excluded

- **WHEN** candidate data contains draft, deleted, or non-Tongzilin places
- **THEN** none of those places can be selected

#### Scenario: Curated event configuration is missing

- **WHEN** `COMMUNITY_PLAN_DEMO_EVENT_ID` does not resolve to the release-approved public event projection
- **THEN** the release/configuration check fails
- **AND** the engine does not invent another event or claim a real registration state

### Requirement: Server SHALL use the direct DeepSeek API for strict narration-only enhancement

When AI is enabled, the server SHALL call `POST https://api.deepseek.com/chat/completions` with a server-only `DEEPSEEK_API_KEY` bearer token and model `deepseek-v4-flash`. It SHALL use non-streaming JSON Output with `thinking: { "type": "disabled" }`, `response_format: { "type": "json_object" }`, and `max_tokens: 1024`. The prompt SHALL explicitly request JSON and include the expected JSON shape. The implementation SHALL use Node 20 `fetch` plus `AbortController`; it SHALL NOT require CloudBase Token Credits, CloudBase managed AI groups/models, or client-side DeepSeek access.

`DEEPSEEK_API_KEY` SHALL exist only in server/deployment secret configuration. It SHALL NOT use a `VITE_` prefix and SHALL NOT appear in shared contracts, H5/Mini Program bundles, offline fixtures, logs, screenshots, validation inputs/outputs, or error messages. The release model SHALL be `deepseek-v4-flash`; deprecated aliases `deepseek-chat` and `deepseek-reasoner` SHALL NOT be used.

`CommunityPlanAIEnhancementSchema.strict()` SHALL accept exactly one entry per deterministic `item_id`, with only `item_id`, `summary_zh`, `summary_en` (maximum 240 characters each), `tips_zh`, and `tips_en` (maximum 160 characters each). The returned item-ID set SHALL exactly match the source plan. AI SHALL NOT receive or control reference IDs, types, order, offsets, durations, statuses, CTA definitions, `accessibility_needs`, or free text.

#### Scenario: Valid AI narration is merged

- **WHEN** DeepSeek returns HTTP 200, `finish_reason: "stop"`, valid JSON narration for the exact two item IDs before timeout, and positive token usage
- **THEN** only summary and tips fields are replaced
- **AND** the response uses `generation_source: "ai_enhanced"`, `ai_status: "ok"`, and `usage.total_tokens > 0`

#### Scenario: DeepSeek secret stays server-side

- **WHEN** deployment config, frontend builds, logs, fixtures, and evidence are inspected
- **THEN** `DEEPSEEK_API_KEY` is present only in the server secret store
- **AND** no Authorization value or key fragment is exposed

#### Scenario: AI attempts a structural change

- **WHEN** AI output contains ref IDs, types, ordering, durations, CTA fields, missing IDs, extra IDs, or duplicate IDs
- **THEN** strict validation rejects the enhancement
- **AND** the deterministic plan is returned unchanged

#### Scenario: Sensitive preference is excluded from AI input

- **WHEN** the guest selected accessibility needs
- **THEN** no accessibility value, complete preference object, or free-text field is present in the model input

### Requirement: AI failure and late completion SHALL return deterministic fallback

The DeepSeek call SHALL use `COMMUNITY_PLAN_AI_TIMEOUT_MS` with default 8000 ms and SHALL perform no automatic request retry inside the judge path. Timeout, network failure, HTTP 400/401/402/422/429/500/503, empty content, non-`stop` finish reason, invalid JSON, schema failure, excessive narration length, or invalid item-ID set SHALL return the unchanged deterministic plan. Timeout SHALL abort fetch, and a settled-result guard SHALL prevent late output from changing the response or emitting a second success log.

#### Scenario: Timeout ignores a late valid response

- **WHEN** the model exceeds the timeout and later returns valid JSON
- **THEN** the API has already returned the unchanged plan with `rule_based_fallback/timeout`
- **AND** the late output is ignored

#### Scenario: Invalid JSON or schema returns validation fallback

- **WHEN** the model returns invalid JSON or an enhancement that fails strict validation
- **THEN** the unchanged plan is returned with `rule_based_fallback/validation_failed`

#### Scenario: DeepSeek request or service failure returns upstream fallback

- **WHEN** the connection fails or DeepSeek returns HTTP 400, 422, 429, 500, or 503
- **THEN** the unchanged plan is returned with `rule_based_fallback/upstream_error`

#### Scenario: DeepSeek authentication or balance is unavailable

- **WHEN** `DEEPSEEK_API_KEY` is missing, DeepSeek returns HTTP 401, or DeepSeek returns HTTP 402 for insufficient balance
- **THEN** the unchanged plan is returned with `rule_based_fallback/unavailable`
- **AND** public release remains blocked

#### Scenario: Successful HTTP response is empty, truncated, or refused

- **WHEN** DeepSeek returns HTTP 200 with empty content, a finish reason other than `stop`, invalid JSON, or a schema-invalid object
- **THEN** the unchanged plan is returned with `rule_based_fallback/validation_failed`

#### Scenario: AI is deliberately disabled outside online acceptance

- **WHEN** `COMMUNITY_PLAN_AI_ENABLED` is false
- **THEN** the deterministic plan is returned with `rule_based/not_configured`
