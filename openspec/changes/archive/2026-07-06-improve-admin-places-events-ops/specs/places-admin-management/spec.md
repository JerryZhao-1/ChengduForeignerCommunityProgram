## MODIFIED Requirements

### Requirement: Maintain map-driving place metadata from the admin console

The system SHALL allow administrators to maintain the place metadata required by public map, list, and detail browsing surfaces.

#### Scenario: Create or edit place map metadata

- **WHEN** an authorized administrator creates or edits a place
- **THEN** the system persists bilingual names, bilingual intro, coordinates, Tencent POI reference, top-level category, second-level category, tags, recommendation state, recommendation reason, recommendation rank, and publish state through the backend
- **AND** downstream public browsing surfaces can consume those values according to public visibility rules

#### Scenario: Select a fixed second-level category

- **WHEN** an authorized administrator selects a place top-level category in the admin editor
- **THEN** the editor offers a fixed set of second-level category options for that top-level category
- **AND** selecting an option stores the selected value in `category_level_2`
- **AND** the shared schema continues to treat `category_level_2` as a string so existing imported or legacy values remain valid

#### Scenario: Preserve a legacy second-level category while editing

- **WHEN** an authorized administrator edits a place whose current `category_level_2` is not in the fixed option set for its top-level category
- **THEN** the editor shows the current value as a selectable current-value option
- **AND** the administrator can keep it or replace it with a fixed option
