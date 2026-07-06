# places-map-browsing Specification

## Purpose
TBD - created by archiving change stabilize-places-map-v1-and-admin-metadata. Update Purpose after archive.
## Requirements
### Requirement: Show a marker-only selected place summary on the map page

The system SHALL keep the `places` map page as a marker-driven browsing surface with a selected-marker preview and summary card that depend only on marker-safe data.

#### Scenario: Tap marker and inspect selected place with cover

- **WHEN** the user taps a place marker on the map page and that marker has a non-null `cover_url`
- **THEN** the system highlights the selected place in page state
- **AND** shows the selected place cover preview near the tapped marker location
- **AND** shows a summary card with the localized place name, top-level category, recommendation state, and a direct path to place detail
- **AND** does not show coordinates, address bodies, summaries, or other detail-only content in that summary card
- **AND** does not require a detail fetch to render the selected-marker cover preview or selected-place summary

#### Scenario: Tap marker without cover

- **WHEN** the user taps a place marker on the map page and that marker has `cover_url` set to null
- **THEN** the system highlights the selected place in page state
- **AND** keeps the map interaction usable without a broken image placeholder
- **AND** shows the selected-place summary and detail navigation path from marker-safe data
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

### Requirement: Handle no-marker and invalid-marker states
The system SHALL keep the mobile map experience usable when no displayable markers are available.

#### Scenario: No markers available
- **WHEN** the marker endpoint returns an empty array
- **THEN** the mobile map page renders a stable empty or guidance state
- **AND** no selected-place summary is shown for nonexistent marker data

#### Scenario: Imported place lacks coordinates
- **WHEN** an imported or published place lacks usable coordinates
- **THEN** the marker endpoint excludes that place
- **AND** the mobile map page does not attempt a detail fetch or navigation action for the missing marker

### Requirement: Preserve map-to-detail flow for valid markers
The system SHALL keep valid marker selection connected to the corresponding detail page during Week 8 integration.

#### Scenario: Select valid marker and open detail
- **WHEN** the user selects a valid marker and opens the detail CTA
- **THEN** the mobile app navigates to the detail page for the same place id
- **AND** the detail page loads its data from the detail endpoint rather than relying on marker-only fields

