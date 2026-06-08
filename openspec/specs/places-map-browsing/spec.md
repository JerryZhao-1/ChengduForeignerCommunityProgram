# places-map-browsing Specification

## Purpose
TBD - created by archiving change stabilize-places-map-v1-and-admin-metadata. Update Purpose after archive.
## Requirements
### Requirement: Show a marker-only selected place summary on the map page

The system SHALL keep the `places` map page as a marker-driven browsing surface with a summary card that depends only on marker-safe data.

#### Scenario: Tap marker and inspect selected place

- **WHEN** the user taps a place marker on the map page
- **THEN** the system highlights the selected place in page state
- **AND** shows a summary card with the localized place name, top-level category, recommendation state, and a direct path to place detail
- **AND** does not show coordinates, address bodies, summaries, or other detail-only content in that summary card
- **AND** does not require a detail fetch to render the selected-place summary

### Requirement: Navigate from the map page into place detail

The system SHALL let the user move from a selected map marker into the corresponding place detail page.

#### Scenario: Open detail from selected marker

- **WHEN** the user uses the selected-place CTA on the map page
- **THEN** the system opens the detail page for the selected place
- **AND** the map page does not need to expand the marker payload into a detail-shaped response to support that navigation

### Requirement: Browse places on a real map

The system SHALL allow mobile users to open a real map view for published community places.

#### Scenario: Open places map

- **WHEN** the user enters the places map page
- **THEN** the system loads published place markers for community `tongzilin`
- **AND** renders them on a real map centered on the community area

### Requirement: Inspect a place from its marker

The system SHALL allow users to inspect a place by tapping its marker.

#### Scenario: Tap marker

- **WHEN** the user taps a place marker
- **THEN** the system shows the selected place name
- **AND** allows the user to open the corresponding place detail page

### Requirement: Launch navigation from place detail

The system SHALL allow users to launch native map navigation from a place detail page.

#### Scenario: Open navigation

- **WHEN** the user taps the navigation action on a place detail page
- **THEN** the system opens native location/navigation for that place's coordinates and name

