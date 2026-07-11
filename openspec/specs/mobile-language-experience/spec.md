# mobile-language-experience Specification

## Purpose
TBD - created by archiving change complete-mobile-english-language-support. Update Purpose after archive.
## Requirements
### Requirement: Mobile UI SHALL provide complete Chinese and English copy

The mobile H5 and WeChat Mini Program SHALL render every launch-scope system-owned label, control, validation message, status, loading state, empty state, error state, share action, navigation title, and tab item in the active `zh` or `en` locale from a centralized catalog with compile-time locale-key parity.

#### Scenario: User browses the complete app in English
- **WHEN** the active locale is `en` and the user visits Home, Events, Discover, Places, Me, authentication, notifications, registrations, profile, reporting, and language settings flows
- **THEN** all system-owned visible copy on those routes is English
- **AND** raw Chinese status labels or validation messages are not displayed
- **AND** user-generated Chinese content may remain Chinese with a localized original-language indicator

#### Scenario: User browses the complete app in Chinese
- **WHEN** the active locale is `zh` and the user visits the same launch-scope routes
- **THEN** all system-owned visible copy is Chinese
- **AND** user-generated English content may remain English with a localized original-language indicator

#### Scenario: Locale catalogs lose key parity
- **WHEN** a system-owned copy key exists in one locale but not the other
- **THEN** typechecking or the locale catalog parity test fails
- **AND** the incomplete catalog cannot satisfy release validation

### Requirement: Users SHALL select language explicitly and retain the choice

The mobile app SHALL provide an explicit Chinese/English language selector, update reactive UI immediately, persist the selection locally, and retain it across route changes and application relaunches.

#### Scenario: User switches from Chinese to English
- **WHEN** a user selects `English` from language settings
- **THEN** the current page copy changes to English immediately
- **AND** subsequent pages, native titles, and tab labels use English
- **AND** the explicit choice is stored locally

#### Scenario: App relaunches after explicit selection
- **WHEN** the app relaunches after the user explicitly selected a supported locale
- **THEN** the stored locale is restored before launch-scope content is presented
- **AND** the app does not reset to Chinese merely because the process restarted

#### Scenario: Stored locale is invalid
- **WHEN** local storage contains a value other than `zh` or `en`
- **THEN** the app ignores that value safely
- **AND** resolves locale from the next valid initialization source

### Requirement: Locale initialization SHALL be deterministic and offline-first

The mobile app SHALL resolve locale in the order explicit local selection, authenticated `preferred_language`, device language, then Chinese fallback, and SHALL render without requiring a successful network request.

#### Scenario: Explicit local choice differs from authenticated preference
- **WHEN** a valid explicit local choice exists and differs from the authenticated user's stored preference
- **THEN** the local explicit choice remains active on that device
- **AND** the client asynchronously synchronizes it to the authenticated preference

#### Scenario: New user has an English device
- **WHEN** no local choice and no authenticated preference exist and the device language resolves to English
- **THEN** the initial locale is `en`

#### Scenario: Locale synchronization fails
- **WHEN** the active explicit locale cannot be synchronized because the network or API is unavailable
- **THEN** the local UI remains in the selected locale
- **AND** synchronization can be retried without changing the user's selection

### Requirement: Formal localized content SHALL use deterministic fallback

The mobile app SHALL select trimmed formal content in the active locale, fall back to the counterpart language when the preferred value is absent, and never silently render a blank action-critical title, address, or label.

#### Scenario: Preferred formal content exists
- **WHEN** both language values exist for formal content
- **THEN** the app displays the value matching the active locale
- **AND** does not combine both languages in the same field by default

#### Scenario: Preferred formal content is missing on a legacy record
- **WHEN** the active-locale value is empty but the counterpart value is non-empty
- **THEN** the app displays the counterpart value
- **AND** exposes fallback metadata so the surface can indicate the displayed language where necessary

#### Scenario: Both formal values are missing
- **WHEN** both language values are empty for action-critical content
- **THEN** the app displays a localized unavailable label rather than a blank control or heading
- **AND** the record is reported by bilingual content validation

### Requirement: UGC SHALL remain in its original language

Discover posts, comments, user names, user-entered locations, and moderation evidence SHALL remain in their submitted language and SHALL NOT require synthesized bilingual duplicates for English UI completeness.

#### Scenario: English UI displays a Chinese post
- **WHEN** the active locale is English and a visible post has `language="zh"`
- **THEN** the original Chinese title and content are displayed unchanged
- **AND** the language badge is rendered with English UI copy

#### Scenario: User creates content after changing locale
- **WHEN** a user opens a post or comment composer after selecting a locale
- **THEN** the composer UI uses the active locale
- **AND** the submitted `language` defaults to the active locale but remains explicitly selectable where the flow supports it

