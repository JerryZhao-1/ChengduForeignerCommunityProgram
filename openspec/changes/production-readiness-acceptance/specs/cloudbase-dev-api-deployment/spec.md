## ADDED Requirements

### Requirement: CloudBase deployment evidence SHALL distinguish dev readiness from production acceptance
CloudBase deployment evidence SHALL state whether it proves local/dev readiness, staging readiness, production-like Mini Program acceptance, or production readiness, and SHALL NOT promote dev-only evidence to production acceptance without explicit API target and account validation.

#### Scenario: Dev CloudBase evidence exists
- **WHEN** CloudBase dev function, domain, or smoke-test evidence exists but legal domains, account permissions, or true-device production-like flows are not complete
- **THEN** the release gate records CloudBase as dev-ready only

#### Scenario: Production-like CloudBase evidence exists
- **WHEN** the Mini Program uses the CloudBase function or approved HTTPS endpoint on true devices and core module reads/writes pass with account/domain validation
- **THEN** the release gate may classify the CloudBase target as production-like for the covered flows

### Requirement: CloudBase API target SHALL support launch module read/write acceptance
The CloudBase or HTTPS API target used for production acceptance SHALL support the launch-critical Places, Events, Discover, and Admin governance flows without relying on local mock-only behavior.

#### Scenario: Launch module smoke checks pass
- **WHEN** health, Places public reads, Events registration/ticket/check-in, Discover create/comment/interaction/report, and Admin governance checks pass against the target
- **THEN** the API target is eligible for production-like acceptance evidence

#### Scenario: API target falls back to local mock-only behavior
- **WHEN** the target cannot prove persistence, identity, roles, or module writes outside a local mock provider
- **THEN** production acceptance remains blocked for API readiness
