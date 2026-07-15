## MODIFIED Requirements

### Requirement: Mobile UI SHALL provide complete Chinese and English copy

The central mobile catalog SHALL provide recursively identical zh/en keys for every onboarding title, singular option, validation state, matching step, explanation dimension, action, route state, delivery badge, API error, completion result, and Mini Program boundary. Templates SHALL NOT contain raw user-facing strings, API messages, raw enum values, or locale ternaries.

#### Scenario: Judge completes onboarding in either locale

- **WHEN** the active locale is zh or en and the judge follows the canonical H5 path
- **THEN** every system-owned string resolves from the active catalog
- **AND** both locales expose identical actions and state meanings

#### Scenario: Catalog parity is broken

- **WHEN** a key exists in only one locale
- **THEN** typechecking or catalog parity tests fail

## ADDED Requirements

### Requirement: Preference controls SHALL be required single choices

Interest SHALL use one selected `primary_interest`. Accessibility SHALL use one selected `accessibility_need`, including explicit `none` copy “无额外需求 / No additional need”. Selecting a new option SHALL replace the previous option.

#### Scenario: Interest selection is singular

- **WHEN** the judge selects one interest and then another
- **THEN** only the latest interest remains selected

#### Scenario: No additional accessibility need is explicit

- **WHEN** the judge chooses `none`
- **THEN** the localized no-additional-need label is visibly selected

### Requirement: Matching and explanation copy SHALL cover all localized cases

The catalog SHALL include localized copy for “核对你的时间偏好”, “匹配社区地点”, “整理参与提示”, “准备两小时路线”, a “为什么这样匹配” section, the four reason dimension labels, and the transparent statement that matching uses Tongzilin community editorial information. All 576 logical scenarios SHALL provide paired content for 1,152 zh/en render cases.

#### Scenario: Explainable plan renders without raw enums

- **WHEN** any supported scenario is rendered in either locale
- **THEN** summary and all four reasons use localized editorial copy
- **AND** no raw enum value is visible

### Requirement: Delivery state SHALL be distinct from plan content

Normal online plans SHALL not require a source badge. Local mock/fallback mode SHALL show “离线演示 · 使用同版本本地社区目录” and its English equivalent. Delivery state SHALL NOT expose model/provider status or alter explanation content.

#### Scenario: Offline delivery is clearly labelled

- **WHEN** local matching is used
- **THEN** the offline badge appears in the active locale
- **AND** the plan content matches the online semantic result for the same profile

### Requirement: Stable API errors SHALL map to catalog keys

`VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, and `RATE_LIMITED` SHALL map to localized errors. Transport/5xx local selection SHALL map to the offline badge. Raw API messages, stack traces, SDK text, and upstream bodies SHALL NOT be rendered.

#### Scenario: HTTP 4xx remains a localized error

- **WHEN** generation returns 400, 403, 404, 409, or 429
- **THEN** the mapped localized error renders
- **AND** offline mode is not activated

### Requirement: Mini Program H5-only boundary SHALL be localized

The Mini Program deep-link placeholder SHALL have complete zh/en entries and SHALL not expose Generate, map, visit, or Demo Confirm actions.

#### Scenario: Mini Program onboarding page is opened directly

- **WHEN** an onboarding route is loaded in mp-weixin
- **THEN** the active locale displays the H5-only explanation
- **AND** no functional onboarding action is shown
