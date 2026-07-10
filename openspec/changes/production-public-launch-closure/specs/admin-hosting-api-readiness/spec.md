## ADDED Requirements

### Requirement: Admin public launch SHALL use production operator authentication
The system SHALL verify hosted Admin access through the self-managed Admin login and Bearer token path instead of dev mock actor headers before public launch.

#### Scenario: Admin production login succeeds
- **WHEN** the hosted Admin app targets the selected production or production-preview API
- **THEN** an authorized operator MUST be able to log in through `POST /auth/admin/login`
- **AND** the returned Bearer token MUST allow protected Admin routes only while valid
- **AND** evidence MUST record the hosted Admin URL, API target, authenticated operator user id, role flags, token TTL configuration class, and tested protected routes without storing plaintext secrets

#### Scenario: Admin production login is not configured
- **WHEN** `API_ADMIN_USERNAME`, `API_ADMIN_PASSWORD_SCRYPT`, `API_ADMIN_SESSION_SECRET`, `API_ADMIN_USER_ID`, or equivalent deployment configuration is missing or invalid
- **THEN** public Admin launch MUST remain blocked
- **AND** the blocker MUST identify the missing configuration class without exposing secret values

### Requirement: Admin APIs SHALL reject mock actors in CloudBase live public-launch mode
The system SHALL prove that public-launch Admin APIs do not depend on `x-mock-user-id` when CloudBase live mode is selected.

#### Scenario: Mock actor header is rejected
- **WHEN** CloudBase live mode is configured with mock actor headers disabled
- **THEN** protected Admin routes called with only `x-mock-user-id` MUST return an unauthorized or forbidden error
- **AND** no protected business mutation MUST occur

#### Scenario: Bearer token remains accepted
- **WHEN** the same protected Admin route is called with a valid Admin Bearer token for a durable admin user
- **THEN** the route MUST execute according to its business rules
- **AND** the evidence MUST show that success does not require `API_ALLOW_MOCK_ACTOR_HEADER=true`

### Requirement: Admin role data SHALL be durable and auditable
The system SHALL require a durable admin user record or equivalent controlled role store before public Admin launch.

#### Scenario: Durable admin role exists
- **WHEN** the Admin Bearer token resolves to an operator user id
- **THEN** the provider MUST resolve that user from durable data or a documented controlled role store
- **AND** the resolved user MUST include `community_admin` or `system_admin` role flags and `status=active`

#### Scenario: Durable admin role is missing
- **WHEN** the Admin Bearer token resolves to a user without durable admin role data or an inactive user
- **THEN** protected Admin routes MUST reject the request
- **AND** the public launch handoff MUST list Admin production auth as blocked

### Requirement: Hosted Admin SHALL target the selected public-launch API
The system SHALL verify that the hosted Admin bundle used for public launch targets the selected production or production-preview API and not local, mock, or stale endpoints.

#### Scenario: Hosted Admin target is correct
- **WHEN** the hosted Admin bundle is scanned or opened for public-launch validation
- **THEN** API requests MUST target the selected launch API base
- **AND** the bundle MUST NOT use mock mode, localhost, `127.0.0.1`, LAN IP endpoints, or undocumented CloudBase dev targets unless the final handoff explicitly classifies the dev target as the approved first-launch production target

#### Scenario: Hosted Admin target is stale
- **WHEN** the hosted Admin bundle points to a stale API domain, mock mode, localhost, or an unapproved environment
- **THEN** public launch MUST remain blocked
- **AND** the blocker MUST record the observed target, expected target, and required redeploy action
