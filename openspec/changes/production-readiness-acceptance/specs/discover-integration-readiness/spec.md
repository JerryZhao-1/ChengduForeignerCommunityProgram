## ADDED Requirements

### Requirement: Discover production acceptance SHALL cover true-device content and governance flows
The Discover module SHALL be validated on true Mini Program devices for feed, detail, post creation, comments, like, favorite, share, report, personal/profile entry points, and Admin governance against the production-like API target.

#### Scenario: User completes Discover content flow
- **WHEN** a true-device user opens Discover, creates a post, opens its detail, comments, likes, favorites, shares or uses the accepted share fallback, and submits a report
- **THEN** the UI reflects each action, the API state is consistent, and the evidence bundle records created post/comment/report identifiers

#### Scenario: Admin reviews Discover governance state
- **WHEN** an Admin operator opens the Posts governance surface after true-device Discover actions
- **THEN** the post, report, moderation controls, labels, and operational metadata are visible according to role permissions

#### Scenario: Discover true-device flow fails
- **WHEN** feed, detail, create, comment, interaction, report, or governance visibility fails on the production-like target
- **THEN** production acceptance for Discover remains blocked for the affected flow

### Requirement: Discover interaction updates SHALL preserve independent state
Discover interaction writes SHALL preserve independent like, favorite, and share state under sequential calls and near-concurrent user actions.

#### Scenario: Sequential interaction writes occur
- **WHEN** a user likes, favorites, and records a share for the same Discover post in sequence
- **THEN** the final interaction state retains all three actions without one write clearing another

#### Scenario: Near-concurrent interaction writes occur
- **WHEN** like and favorite actions are triggered close together for the same actor and post
- **THEN** the final state remains deterministic, or the API returns a recoverable conflict/retry response that preserves user intent
