## ADDED Requirements

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
