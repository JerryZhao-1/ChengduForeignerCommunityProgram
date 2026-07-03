# places-mobile-skeleton Specification

## Purpose
TBD - created by archiving change freeze-places-v1-browsing-baseline. Update Purpose after archive.
## Requirements
### Requirement: The system SHALL provide a three-page places browsing skeleton for v1

The system SHALL expose the `places` browsing experience through `list`, `map`, and `detail` pages that bind directly to the frozen v1 contracts.

#### Scenario: User browses places from list to detail

- **WHEN** the user opens the list page and selects a place
- **THEN** the page shows contract-backed card information for the current filters
- **AND** the user can navigate into the corresponding detail page

#### Scenario: User browses places from map to detail

- **WHEN** the user opens the map page and taps a marker
- **THEN** the page shows the selected marker information
- **AND** the user can navigate into the corresponding detail page

### Requirement: The system SHALL centralize loading, empty, error, and locale display treatment for places browsing pages

The system SHALL avoid page-local duplication for browsing-state presentation and locale copy on the places v1 skeleton.

#### Scenario: Shared state treatment is used across places pages

- **WHEN** the list, map, or detail page is loading, empty, or errors
- **THEN** the page uses a shared state presentation approach
- **AND** localized status copy comes from a centralized places browsing copy source

### Requirement: The system SHALL treat recommended browsing as a list filter rather than a dedicated v1 page

The system SHALL route recommended-place browsing through the list page with a recommended filter instead of maintaining a distinct recommended-page experience as the v1 truth.

#### Scenario: Recommended entry resolves to filtered list browsing

- **WHEN** the user enters the recommended places flow
- **THEN** the system opens the list page with recommended browsing filters applied
- **AND** any legacy recommended route acts only as a compatibility redirect
