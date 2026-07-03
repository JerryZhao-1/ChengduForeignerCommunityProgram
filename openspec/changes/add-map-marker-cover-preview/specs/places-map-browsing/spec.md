## MODIFIED Requirements

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
