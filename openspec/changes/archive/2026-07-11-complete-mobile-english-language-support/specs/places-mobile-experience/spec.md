## ADDED Requirements

### Requirement: Places browsing SHALL honor the active locale on every surface

Places list, recommended results, map markers and summaries, detail content, category labels, tags, navigation targets, share text, interactions, loading, empty, error, and feedback states SHALL use the active locale and the common formal-content fallback policy.

#### Scenario: User browses Places in English
- **WHEN** the active locale is `en` and the user moves from map or list to a Place detail
- **THEN** system-owned copy, top-level and supported second-level category labels, name, address, intro, business hours, recommendation reason, navigation target, and share text are English
- **AND** internal category codes are not exposed as the primary user-facing label

#### Scenario: Legacy Place lacks an English optional value
- **WHEN** a legacy public Place lacks an English optional presentation value but contains Chinese
- **THEN** the surface applies the shared fallback behavior instead of rendering a blank section
- **AND** the content audit reports required-field gaps separately from optional omissions

## MODIFIED Requirements

### Requirement: View a complete place detail page

The system SHALL show decision-useful, locale-correct information on the place detail page.

#### Scenario: Open place detail

- **WHEN** the user opens a place detail page
- **THEN** the system shows available gallery, business hours, address, intro, recommendation information, category labels, and tags in the active locale using deterministic fallback
- **AND** provides a navigation action whose target name and address use the same locale policy
- **AND** provides localized favorite and share actions according to existing capability flags

