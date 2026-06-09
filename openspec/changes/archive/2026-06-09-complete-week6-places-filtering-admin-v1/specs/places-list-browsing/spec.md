## MODIFIED Requirements

### Requirement: Support v1 search and entry-style filtering on the list page

The system SHALL let users refine the public places list through keyword search and entry-style filters.

#### Scenario: Enter a keyword

- **WHEN** the user enters a keyword on the list page
- **THEN** the system refreshes the list using the backend keyword query
- **AND** the updated results remain on the same list page

#### Scenario: Switch category entry

- **WHEN** the user switches the category entry on the list page
- **THEN** the system refreshes the list using the selected category filter
- **AND** the category control uses query values derived from the shared top-level places taxonomy

#### Scenario: Select a tag entry

- **WHEN** the user selects a tag from a place card or filter entry
- **THEN** the system refreshes the list using the selected tag filter
- **AND** the page shows a clear way back to the unfiltered list

#### Scenario: Open the recommended entry

- **WHEN** the user opens the recommended places entry
- **THEN** the system navigates to the places list page with recommended browsing filters applied
- **AND** the recommended flow does not establish a separate v1 browsing truth from the list page
