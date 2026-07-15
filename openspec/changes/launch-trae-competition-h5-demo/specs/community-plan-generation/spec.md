## ADDED Requirements

### Requirement: Shared SHALL define a strict finite singular preference schema

`NewResidentPreferenceSchema` SHALL use Zod `.strict()` and accept only required `preferred_language`, `primary_interest`, `arrival_context`, `household_type`, and `accessibility_need`. `primary_interest` SHALL use one of eight predefined interests. `accessibility_need` SHALL be `none` or one of five predefined needs. The request SHALL reject arrays, unknown keys, free text, identity/contact fields, and `community_id`.

#### Scenario: Valid singular preferences are accepted

- **WHEN** a guest supplies one valid value for each required field
- **THEN** the strict schema accepts the request
- **AND** the API injects fixed community `tongzilin` only after validation

#### Scenario: Legacy or extra fields are rejected

- **WHEN** a request contains `interests`, `accessibility_needs`, `community_id`, identity/contact data, notes, or another unknown key
- **THEN** validation fails with `400 VALIDATION_ERROR`
- **AND** no field is silently stripped into an accepted request

### Requirement: Shared SHALL enumerate exactly 576 logical scenarios

The shared layer SHALL enumerate the Cartesian product of 8 interests, 3 arrival contexts, 4 household types, and 6 accessibility choices. Display language SHALL NOT multiply logical identity or affect selection. Every profile SHALL receive a stable key formatted `v1:{primary_interest}:{arrival_context}:{household_type}:{accessibility_need}`.

#### Scenario: Exhaustive enumeration is complete and unique

- **WHEN** the scenario enumerator runs
- **THEN** it returns exactly 576 logical profiles and 576 unique scenario keys
- **AND** rendering both languages yields exactly 1,152 complete render cases

#### Scenario: Language does not alter scenario identity

- **WHEN** otherwise identical zh and en preferences are matched
- **THEN** scenario key, route references, explanation content pairs, summaries, and tips are identical

### Requirement: Community Plan SHALL expose a strict four-dimension explanation

`CommunityPlanSchema` SHALL include literal catalog version `tongzilin-curated-v1`, a valid scenario key, and `selection_explanation` with bilingual summary and exactly four bilingual reasons. Reason dimensions SHALL be unique and ordered `primary_interest`, `arrival_context`, `household_type`, `accessibility_need`.

#### Scenario: Complete explanation is accepted

- **WHEN** a plan contains the four required ordered reason dimensions with non-empty zh/en text
- **THEN** strict validation succeeds

#### Scenario: Missing, repeated, extra, or unordered reasons are rejected

- **WHEN** a reason is missing, duplicated, added, or appears out of order
- **THEN** strict plan validation fails

### Requirement: Shared SHALL define an invariant-checked two-item plan without model fields

Each plan SHALL contain exactly one `place_visit` and one `event_attend`, each with type/ref consistency, unique item/ref IDs, positive durations, bilingual title/summary/tips, and initial status `pending`. Items SHALL be ordered, non-overlapping, end by minute 120, and total exactly 120 minutes. The response SHALL NOT contain `generation_source`, `ai_status`, `usage`, or `generated_by`.

#### Scenario: Canonical plan passes every invariant

- **WHEN** a plan has one 60-minute place item at offset 0 and one 60-minute event item at offset 60
- **THEN** the plan parses and totals 120 minutes

#### Scenario: Legacy model-result fields are rejected

- **WHEN** a plan adds `generation_source`, `ai_status`, `usage`, or `generated_by`
- **THEN** strict plan validation fails

#### Scenario: Invalid structure is rejected

- **WHEN** IDs repeat, type/ref mismatch, items overlap or reorder, an item ends after minute 120, totals disagree, or an `activity` item is used
- **THEN** strict plan validation fails

### Requirement: Shared SHALL provide one versioned bilingual curated catalog

The shared catalog SHALL contain complete zh/en modules for all 8 interests, 3 arrival contexts, 4 household types, and 6 accessibility choices plus place-category and fixed-event narration. The matcher SHALL compose one summary and exactly four choice-specific reasons from this catalog and SHALL use stable score ordering with `_id` tie-breaking.

#### Scenario: Every catalog dimension has bilingual coverage

- **WHEN** catalog coverage is evaluated
- **THEN** every allowed enum has non-empty zh/en copy
- **AND** no raw enum is required as user-visible fallback text

#### Scenario: Identical profile produces identical semantics

- **WHEN** the same profile and catalog bundle are matched repeatedly
- **THEN** scenario key, selected refs, explanation, summaries, and tips remain identical

### Requirement: Accessibility feedback SHALL be advisory and verifiable

`accessibility_need` SHALL influence only safe explanatory and preparation copy unless verified venue metadata is later added. The current catalog SHALL NOT assert step-free access, accessible toilets, hearing equipment, verified quietness, or other facility facts absent from the safe place projection.

#### Scenario: Accessibility preference adds a confirmation tip

- **WHEN** a guest selects an accessibility need other than `none`
- **THEN** the fourth explanation gives a practical confirmation or pacing suggestion
- **AND** it makes no unverified venue-facility claim

#### Scenario: No additional need still has an explanation

- **WHEN** `accessibility_need` is `none`
- **THEN** the fourth reason explains that standard route guidance is used

### Requirement: Shared SHALL define strict public-safe catalog projections

Place snapshots SHALL contain only `_id`, `name_zh`, `name_en`, `cover_url`, `category_level_1`, `is_recommended`, and `location`. Event snapshots SHALL contain only `_id`, `title_zh`, `title_en`, `summary_zh`, `summary_en`, `start_time`, `end_time`, and `cover_url`. The versioned catalog bundle SHALL contain only its version, feedback catalog, curated event ID, safe places, and safe events.

#### Scenario: Detail and operational fields cannot enter the bundle

- **WHEN** source data includes addresses, galleries, navigation, contact, capacity, registration, moderation, import-review, or audit fields
- **THEN** none is serialized into the strict plan or catalog bundle

### Requirement: API and local delivery SHALL use the same matcher

The API provider, mock client, and H5 local fallback SHALL import the same shared catalog bundle and matcher. Mock mode and transport/DNS/timeout/5xx SHALL match locally. HTTP 400/403/404/409/429 SHALL remain errors. Delivery mode SHALL remain client state rather than a plan field.

#### Scenario: Online and local semantics match exhaustively

- **WHEN** all 576 profiles are matched through provider and local paths
- **THEN** scenario key, catalog version, item refs, explanation, summaries, and tips match 576/576

### Requirement: Shared SHALL expose only the generation POST contract

`apiPaths.communityPlan.generate` SHALL remain `/community-plan/generate` with method POST, the strict singular request, and strict Community Plan response. No plan detail, persistence, preference-save, registration, or completion-write API SHALL be added.

#### Scenario: Client surface remains minimal

- **WHEN** paths, contracts, and clients are inspected
- **THEN** they expose only `communityPlan.generate(input)` for Community Plans

### Requirement: Competition Community Plan runtime SHALL not use a model service

The Community Plan runtime SHALL have no model provider call, model secret/configuration, model response schema, or model status field. The public H5 SHALL not claim AI generation. Generic competition-name text and historical superseded evidence MAY retain the term AI when clearly not describing runtime capability.

#### Scenario: Runtime and build are model-free

- **WHEN** API source, environment configuration, browser network traffic, public contracts, and frontend artifacts are inspected
- **THEN** no Community Plan model endpoint, model credential, or AI result field is present
