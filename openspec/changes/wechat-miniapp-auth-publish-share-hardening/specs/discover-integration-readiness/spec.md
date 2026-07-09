## ADDED Requirements

### Requirement: Discover post creation SHALL use the resolved Mini Program actor
Discover post creation in CloudBase live mode SHALL use the durable user resolved from Mini Program WeChat identity as `author_user_id`.

#### Scenario: WeChat user creates a post
- **WHEN** a Mini Program user creates a Discover post through CloudBase function mode
- **THEN** the created post uses the resolved project user id and author display instead of a fixed mock actor

### Requirement: Discover tag creation SHALL recover from existing tag races
Discover tag creation UI SHALL select an existing active tag when creation fails because another request or previous data already created that tag.

#### Scenario: Existing tag is typed during post creation
- **WHEN** the user types a tag that already exists as active
- **THEN** the UI selects the existing tag instead of blocking post submission with a generic creation error

#### Scenario: Hidden or unauthorized tag creation fails
- **WHEN** tag creation fails because the tag is hidden, the actor is not authenticated, or moderation rejects it
- **THEN** the UI shows a recoverable validation message and does not create a partial post
