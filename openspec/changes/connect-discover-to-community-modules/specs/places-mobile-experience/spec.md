## ADDED Requirements

### Requirement: Place detail SHALL show related discover discussion
The mobile place detail experience SHALL be able to show visible discover posts associated with the place.

#### Scenario: Open place with related posts
- **WHEN** a user opens a published place that has visible associated discover posts
- **THEN** the place detail page shows a related discussion section with post cards
- **AND** selecting a post opens the discover detail page

#### Scenario: Open place without related posts
- **WHEN** a user opens a published place with no visible associated posts
- **THEN** the place detail page remains usable
- **AND** it does not show placeholder or future-tense copy as primary content
