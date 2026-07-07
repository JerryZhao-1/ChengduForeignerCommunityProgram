## ADDED Requirements

### Requirement: Post media uploads SHALL follow controlled file rules
The file system SHALL allow user-facing post media uploads under the existing `public/posts/` path while enforcing ownership and binding rules.

#### Scenario: Complete post media upload
- **WHEN** an authenticated user creates an upload request with `biz_type=post_image` or an approved post media biz type and `target_prefix=public/posts/`
- **THEN** the system returns a controlled upload path
- **AND** completion records the file asset with the actor as uploader

#### Scenario: Prevent protected path misuse
- **WHEN** a non-admin user attempts to upload post media into a protected path or bind another user's file asset to their post
- **THEN** the API returns a forbidden or validation error envelope
- **AND** the file asset is not bound to the post
