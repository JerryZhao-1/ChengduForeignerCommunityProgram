## ADDED Requirements

### Requirement: Discover visibility SHALL govern cross-module surfaces
The discover visibility rules SHALL apply consistently to public feed, post detail, comments, and related place/event content surfaces.

#### Scenario: Moderated post is hidden from related place
- **WHEN** a post associated with a place becomes reported, hidden, or deleted
- **THEN** the place related-post surface no longer returns that post
- **AND** the public post detail endpoint does not expose it

#### Scenario: Associated event becomes unavailable
- **WHEN** an event associated with a post is no longer public
- **THEN** event detail does not show that post as related discussion
- **AND** post detail renders a safe unavailable association state or omits the event card
