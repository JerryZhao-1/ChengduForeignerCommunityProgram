## ADDED Requirements

### Requirement: Browse places through a complete mobile module

The system SHALL provide a non-placeholder mobile `places` module for community users.

#### Scenario: Open places list

- **WHEN** the user opens the places list page
- **THEN** the system shows a real browsable place list instead of placeholder-only content
- **AND** supports loading, empty, and error states for the page

### Requirement: Filter and explore places from mobile entry points

The system SHALL allow users to refine place discovery from mobile entry points.

#### Scenario: Apply a place filter

- **WHEN** the user applies a category, tag, or keyword filter
- **THEN** the system updates the place results using the filtered backend query
- **AND** preserves a clear path back to the unfiltered list

#### Scenario: Open recommended places

- **WHEN** the user enters a recommended places entry point
- **THEN** the system shows a dedicated list of recommended places
- **AND** each result can open the corresponding place detail page

### Requirement: View a complete place detail page

The system SHALL show decision-useful information on the place detail page.

#### Scenario: Open place detail

- **WHEN** the user opens a place detail page
- **THEN** the system shows available gallery, business hours, address, bilingual intro, and tags for that place
- **AND** provides a navigation action for the place location

### Requirement: Browse places on a real map

The system SHALL allow users to inspect published places from a real map view.

#### Scenario: Open places map

- **WHEN** the user enters the places map page
- **THEN** the system loads published place markers for the current community
- **AND** renders them on a real map centered on the community area

#### Scenario: Tap marker

- **WHEN** the user taps a place marker
- **THEN** the system highlights the selected place
- **AND** provides a direct path to the corresponding place detail page

### Requirement: Support favorite/share-ready places interactions

The system SHALL expose stable places interaction entry points for favorites and sharing.

#### Scenario: Use a place interaction action

- **WHEN** the user taps a favorite or share action on a place surface
- **THEN** the system responds with the configured v1 interaction behavior
- **AND** the page structure does not require redesign to support a later persisted implementation
