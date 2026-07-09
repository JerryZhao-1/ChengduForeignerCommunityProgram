## ADDED Requirements

### Requirement: Mini Program production-like builds SHALL avoid mock actor headers
Mini Program production-like CloudBase function builds SHALL NOT send `x-mock-user-id` and SHALL rely on CloudBase/WeChat caller identity for user-owned operations.

#### Scenario: CloudBase function requester sends API calls
- **WHEN** the Mini Program runs with `VITE_API_MODE=cloudbase-function`
- **THEN** API calls omit `x-mock-user-id` and rely on CloudBase function identity injection

### Requirement: Mini Program share SHALL provide native share or copy fallback
Mini Program share UI SHALL use native WeChat share when available and provide a copy-link fallback when platform account certification or runtime capability prevents native share.

#### Scenario: Native share is available
- **WHEN** a user shares a Discover post from MP-WEIXIN and WeChat allows native share
- **THEN** the share card uses the post title and path and the share action is recorded after the share lifecycle is invoked

#### Scenario: Native share is restricted
- **WHEN** WeChat reports account certification or platform restrictions
- **THEN** the UI keeps a copy-link fallback and release evidence records the platform blocker separately from application errors
