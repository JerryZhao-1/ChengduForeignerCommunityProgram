## ADDED Requirements

### Requirement: Discover interactions SHALL be persistent and idempotent
The system SHALL persist likes, favorites, and share count updates for discover posts with stable per-user state and aggregate counters.

#### Scenario: Toggle post like
- **WHEN** an authenticated user likes or unlikes a visible post
- **THEN** the system updates the user's interaction state idempotently
- **AND** the post `like_count` remains consistent and non-negative

#### Scenario: Toggle post favorite
- **WHEN** an authenticated user favorites or unfavorites a visible post
- **THEN** the system updates the user's favorite state idempotently
- **AND** the post `favorite_count` remains consistent and non-negative

#### Scenario: Track share count
- **WHEN** a supported share action completes or is recorded by the client
- **THEN** the system increments the post share count according to the configured counting rule
- **AND** public detail can return the updated count

### Requirement: Discover follows and profiles SHALL use real user data
The system SHALL provide follow/unfollow relationships and profile-backed public user pages for discover authors.

#### Scenario: Follow author
- **WHEN** an authenticated user follows another visible user profile
- **THEN** the follow relationship is stored
- **AND** profile follower/following counts and followed state update consistently

#### Scenario: Open profile
- **WHEN** a user opens a discover author profile
- **THEN** the profile page loads public profile data, visible posts, video posts, counts, and followed state from API-backed data
- **AND** it does not use hardcoded profile maps as persisted data

### Requirement: Admin content operations SHALL curate discover content
The system SHALL allow authorized admins to manage pinned, featured, recommended, official posts, tag taxonomy, and ranking inputs.

#### Scenario: Feature a post
- **WHEN** an authorized admin marks a visible post as featured, recommended, pinned, or official
- **THEN** discover list, home, or configured operation surfaces can prioritize or label that post
- **AND** the operation is recorded for audit

#### Scenario: Maintain tag taxonomy
- **WHEN** an authorized admin creates, edits, merges, hides, or deletes a discover tag
- **THEN** creation/search/filter UI can use the maintained taxonomy
- **AND** existing post tag relationships remain valid or are migrated according to the selected action

### Requirement: Discover operations analytics SHALL summarize activity and workload
The admin system SHALL provide discover operations metrics for content volume, engagement, reports, moderation, associations, and admin workload.

#### Scenario: Read discover analytics
- **WHEN** an authorized admin opens discover analytics
- **THEN** the system shows post count, comment count, report count, moderation processing time, popular associated places/events, active authors, and pending workload for the selected time window
- **AND** metrics are provider-backed rather than front-end approximations

### Requirement: Discover social and ops SHALL be live-provider ready
The CloudBase live provider SHALL support discover social and operations collections after this change is verified.

#### Scenario: Verify social live scope
- **WHEN** live CloudBase social and operations collections pass API smoke checks
- **THEN** deployment documentation records the accepted collections, indexes, route evidence, and remaining limitations
- **AND** social/profile/content-ops/analytics flows no longer rely on mock fallback for the verified scope
