## ADDED Requirements

### Requirement: Production acceptance evidence SHALL be classified by environment
The release gate SHALL classify every acceptance artifact as local, CloudBase dev, staging, production-like, or production, and SHALL NOT treat local-only or mock-only evidence as production acceptance.

#### Scenario: Local-only evidence is submitted for production acceptance
- **WHEN** the evidence bundle only uses `127.0.0.1`, LAN IPs, mock providers, local H5, or Mini Program simulator runs
- **THEN** the release gate records the flow as local/dev evidence and keeps production acceptance blocked

#### Scenario: Production-like evidence is submitted
- **WHEN** the evidence bundle uses a WeChat-reachable CloudBase function or approved HTTPS API target and includes true-device screenshots, command summaries, API IDs, and console/API error capture
- **THEN** the release gate may classify the covered flow as production-like evidence

### Requirement: Production acceptance SHALL require clean quality gates
The release gate SHALL require `pnpm typecheck`, `pnpm test`, and `pnpm lint` to pass before production acceptance, unless a failing item is explicitly classified as an external blocker that prevents release.

#### Scenario: Quality commands pass
- **WHEN** `pnpm typecheck`, `pnpm test`, and `pnpm lint` all complete successfully
- **THEN** the release gate records quality validation as passed for the acceptance bundle

#### Scenario: Quality commands fail
- **WHEN** any required quality command fails
- **THEN** the release gate records the command, failing file or test, impact, owner, and blocker status, and production acceptance remains blocked for affected release scope

### Requirement: Production handoff SHALL classify blockers, known limits, and account dependencies
The release handoff SHALL include pass/blocker/known-limit classifications for core modules, platform permissions, CloudBase/API readiness, map/domain configuration, and true-device coverage.

#### Scenario: Handoff bundle is complete
- **WHEN** the handoff lists module status, evidence paths, device matrix, API target, account dependencies, and remaining blockers
- **THEN** release stakeholders can decide whether upload, review, or public launch is permitted

#### Scenario: Blocking production issue remains
- **WHEN** native share, legal domains, API reachability, auth, map/navigation, media, or quality gates remain unresolved
- **THEN** the handoff marks the issue as a production blocker unless an explicit product/account owner accepts a narrower launch scope
