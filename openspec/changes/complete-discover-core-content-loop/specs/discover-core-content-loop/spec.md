## ADDED Requirements

### Requirement: Discover posts SHALL expose durable content metadata
The system SHALL include durable post metadata needed by public list/detail, owner views, comments, and later social features.

#### Scenario: Read public post metadata
- **WHEN** a client reads a visible discover post through list or detail
- **THEN** the response includes `created_at`, `updated_at`, `comment_count`, `like_count`, `favorite_count`, `share_count`, nullable `place_id`, nullable `event_id`, and an author display summary
- **AND** numeric counters are non-negative integers
- **AND** public `comment_count` uses the same visible-comment filter as the public comment list so hidden, deleted, or otherwise unavailable comments are not counted on public surfaces

#### Scenario: Create post metadata
- **WHEN** an authenticated actor creates a valid post
- **THEN** the system stores the actor as author, writes timestamps, initializes counters to zero, and returns the created post in the standard success envelope

### Requirement: Discover comments SHALL be readable
The system SHALL expose visible comments for a visible post through a paged read API.

#### Scenario: Read visible comments
- **WHEN** a client requests comments for a visible post
- **THEN** the response returns visible comments for that post in a paged envelope
- **AND** each comment includes author, content, language, status, and `created_at`
- **AND** the visible result count matches public `comment_count` semantics for the same visibility scope

#### Scenario: Hide comments for unavailable posts
- **WHEN** a client requests comments for a missing, hidden, deleted, reported, or otherwise unavailable post
- **THEN** the API returns a not-found error envelope
- **AND** no comments for that post are exposed

### Requirement: Discover owner posts SHALL be queryable
The system SHALL let an authenticated user read their own discover posts without relying on public feed filters.

#### Scenario: User reads own posts
- **WHEN** an authenticated user requests their discover posts
- **THEN** the response includes posts authored by that actor in the active community
- **AND** owner-visible status fields are included so the user can understand whether a post is visible, reported, hidden, deleted, or pending future review

#### Scenario: Public feed remains visible-only
- **WHEN** a user-owned post is not publicly visible
- **THEN** the public discover list and public detail endpoints still hide that post
- **AND** the owner endpoint can return it only to its author or an authorized admin

### Requirement: Discover post media SHALL use file-backed upload and binding
The system SHALL support creating posts with user-selected image or video media uploaded through the controlled file API.

#### Scenario: Create post with uploaded media
- **WHEN** a user selects media, completes upload under `public/posts/`, and submits a post with returned file ids
- **THEN** the created post binds those file assets to the post
- **AND** public list/detail render provider-resolved media URLs without requiring pasted external URLs

#### Scenario: Reject unbound or unauthorized media
- **WHEN** a user submits media file ids that do not exist, are not owned by the actor, or are outside the allowed post media path
- **THEN** the API returns a validation or forbidden error envelope
- **AND** no partial post is created

### Requirement: Discover CloudBase live provider SHALL persist core content
The system SHALL persist core discover posts, comments, and post media bindings in CloudBase live provider when live mode is configured.

#### Scenario: Live discover persistence is verified
- **WHEN** live CloudBase provider is configured with required collections and indexes
- **THEN** create, list, detail, comment read/write, owner post list, and post media binding operate against CloudBase collections
- **AND** validation evidence records collection names, indexes, and API responses

#### Scenario: Live discover persistence is blocked
- **WHEN** CloudBase auth, collection, index, or route verification fails
- **THEN** the implementation records the blocker
- **AND** documentation does not claim discover live provider completion
