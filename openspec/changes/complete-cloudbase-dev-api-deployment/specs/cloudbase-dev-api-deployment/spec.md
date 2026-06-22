## ADDED Requirements

### Requirement: CloudBase dev connection state SHALL be verified or blocked explicitly
The system SHALL establish the current CloudBase MCP connection state for `cloud1-d7gxdk8t43bd639c0` before marking dev resources as verified.

#### Scenario: CloudBase MCP session is authenticated
- **WHEN** CloudBase MCP authentication succeeds for the active session
- **THEN** the implementation records the authenticated state and the targeted environment id `cloud1-d7gxdk8t43bd639c0`
- **AND** subsequent resource queries explicitly target that environment

#### Scenario: CloudBase MCP session is not authenticated
- **WHEN** CloudBase MCP returns `AUTH_REQUIRED` or another authentication/authorization failure
- **THEN** the implementation records the exact blocker, tool response, and required next action
- **AND** dev resources are not marked as live verified

### Requirement: CloudBase dev resource inventory SHALL be recorded from live queries
The system SHALL record live CloudBase `dev` inventory for environment identity, database collections, places indexes, function status, gateway route status, hosting status, and relevant logs.

#### Scenario: Resource queries succeed
- **WHEN** live CloudBase resource queries complete for `cloud1-d7gxdk8t43bd639c0`
- **THEN** deployment registration docs record the observed env, collections, indexes, `community-map-api`, gateway, hosting, and log status
- **AND** any difference from previous Week 4 or Week 8 documentation is called out explicitly

#### Scenario: Resource queries are blocked
- **WHEN** any live inventory query fails because of auth, permission, missing resource, or platform error
- **THEN** deployment registration docs record the failing resource category, error code/message, and follow-up action
- **AND** the blocked category is not treated as confirmed

### Requirement: community-map-api SHALL be verified as the dev HTTP API entry
The system SHALL deploy or repair `community-map-api` so it is verified as the CloudBase `dev` HTTP API entry for this repository.

#### Scenario: HTTP function entry is valid
- **WHEN** `community-map-api` is deployed or confirmed as the dev HTTP API entry
- **THEN** its runtime, entry behavior, environment variables, permission boundary, and recent logs are recorded
- **AND** the function can serve the repository API health route without relying on an Event placeholder claim

#### Scenario: HTTP function deployment fails
- **WHEN** deployment or verification of `community-map-api` fails
- **THEN** the implementation captures CloudBase logs or the missing-log blocker plus requestId when available
- **AND** `/api` route creation remains deferred

### Requirement: CloudBase /api route SHALL be gated on function verification
The system SHALL create or confirm the CloudBase HTTP access `/api` route only after `community-map-api` is verified as a working dev HTTP API entry.

#### Scenario: Function verification has passed
- **WHEN** `community-map-api` health behavior and logs are verified
- **THEN** the `/api` route can be created or confirmed against the dev access domain
- **AND** deployment registration docs record the route target and final public URL shape

#### Scenario: Function verification has not passed
- **WHEN** `community-map-api` is missing, still an Event placeholder, lacks required env vars, lacks logs, or fails health
- **THEN** `/api` route creation remains blocked
- **AND** the blocker is recorded as the route status

### Requirement: Dev access domain smoke checks SHALL prove health and places reads
The system SHALL smoke test the CloudBase dev access domain for API health and public places reads after function and route verification.

#### Scenario: Smoke checks succeed
- **WHEN** the dev access domain is called for `/api/health` and public places read endpoints
- **THEN** responses use the expected API envelope or documented health shape
- **AND** smoke evidence records status, response body summary, requestId when present, and matching CloudBase log evidence

#### Scenario: Smoke checks fail
- **WHEN** `/api/health` or places read smoke checks fail through the dev access domain
- **THEN** evidence records the URL, status, response body summary, requestId when present, and CloudBase log output or log-access blocker
- **AND** the API is not marked callable until the failure is resolved

### Requirement: Project plan and deployment docs SHALL reflect evidence-based status
The system SHALL update `docs/plan.md` and deployment registration docs so CloudBase progress is based on completed verification rather than calendar dates.

#### Scenario: Verification evidence exists
- **WHEN** CloudBase auth, inventory, function, route, and smoke checks complete or fail with documented blockers
- **THEN** `docs/plan.md` and deployment registration docs reflect the actual status, blockers, and next development tasks
- **AND** they do not claim production or live provider completion outside the verified scope
