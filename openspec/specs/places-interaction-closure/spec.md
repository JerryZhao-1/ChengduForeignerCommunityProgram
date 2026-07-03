# places-interaction-closure Specification

## Purpose
Capture the Week 7 places interaction closure requirements for favorite, share, navigation, copy, visual consistency, and Mini Program validation behavior.

## Requirements

### Requirement: Provide visible v1 favorite behavior
The system SHALL expose a place favorite action with visible state in the mobile places experience without requiring a persisted backend favorite contract.

#### Scenario: Toggle place favorite state
- **WHEN** the user taps the favorite action on a place detail surface
- **THEN** the system updates the visible favorite state for that place
- **AND** the action no longer presents placeholder or future-tense copy as the primary user response

#### Scenario: Preserve favorite upgrade path
- **WHEN** a future persisted favorite backend is introduced
- **THEN** the places page structure can replace the v1 frontend state source without removing the visible favorite action or redesigning the detail page

### Requirement: Provide place sharing behavior
The system SHALL expose a page sharing entry for place detail using the available place detail share data.

#### Scenario: Share a place detail page
- **WHEN** the user invokes place sharing from a supported Mini Program surface
- **THEN** the share payload uses the localized place share title or place name
- **AND** the share path targets the corresponding place detail page

#### Scenario: Use share action in unsupported surfaces
- **WHEN** the user taps the share action where native Mini Program sharing is unavailable
- **THEN** the system responds with non-placeholder feedback that does not imply an unfinished feature

### Requirement: Centralize places navigation action handling
The system SHALL use a unified places navigation action path for launching native location navigation from places pages.

#### Scenario: Open native navigation
- **WHEN** the user taps a navigation action for a place with valid coordinates
- **THEN** the system launches native location/navigation using the localized place name and address
- **AND** failure handling uses consistent places module feedback

#### Scenario: Handle navigation failure
- **WHEN** native location/navigation cannot be opened because permission, platform, or coordinate handling fails
- **THEN** the system shows a localized failure message
- **AND** the page remains usable without losing loaded place detail state

### Requirement: Remove placeholder places interactions and copy
The system SHALL remove placeholder-quality copy and transitional interaction surfaces from the mobile places module.

#### Scenario: Review places module copy
- **WHEN** the user browses places list, map, detail, recommendation entry, favorite, share, and navigation surfaces
- **THEN** the system presents production-intent copy instead of "pending", "reserved", "placeholder", or equivalent transitional wording

#### Scenario: Open recommended places entry
- **WHEN** the user enters the recommended places flow
- **THEN** the system opens the recommended places list behavior without displaying a transitional redirect card
- **AND** each listed result can still open its place detail page

### Requirement: Unify places module visual interaction patterns
The system SHALL present list, map, detail, and recommendation places surfaces with consistent action, card, chip, loading, empty, and error patterns.

#### Scenario: Compare places surfaces
- **WHEN** the user moves between places list, map, detail, and recommended places flows
- **THEN** primary actions, secondary actions, chips, cards, and feedback states follow a consistent places module visual language
- **AND** the module does not look like a set of unrelated sample pages

### Requirement: Verify Mini Program share and location permission behavior
The system SHALL document and verify the Week 7 Mini Program share, privacy, and location/navigation behavior.

#### Scenario: Verify share and location prompts
- **WHEN** the Week 7 validation is run in the Mini Program target or WeChat DevTools
- **THEN** the evidence records share behavior, location/privacy permission expectations, navigation launch behavior, and any simulator limitations
