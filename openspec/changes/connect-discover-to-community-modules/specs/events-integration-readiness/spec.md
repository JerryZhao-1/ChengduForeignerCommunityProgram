## ADDED Requirements

### Requirement: Event detail SHALL show related discover discussion
The mobile event detail experience SHALL be able to show visible discover posts associated with the event for discussion, recaps, and questions.

#### Scenario: Open event with discussion
- **WHEN** a user opens a public event that has visible associated discover posts
- **THEN** the event detail page shows related discussion or recap cards
- **AND** selecting a card opens the discover detail page

#### Scenario: Create event discussion post
- **WHEN** a user starts a discussion or recap from a public event detail page
- **THEN** the create post flow is prefilled or linked with the event id
- **AND** the created post is associated with that event after successful submit
