## ADDED Requirements

### Requirement: Release validation commands SHALL pass or record scoped blockers
The system SHALL run the 6.23 release-readiness validation commands and close all source validation blockers that are in scope for the integration gate.

#### Scenario: Release validation passes
- **WHEN** `pnpm typecheck`, `pnpm test`, and `pnpm lint` are run for the repository
- **THEN** all three commands MUST exit successfully
- **AND** validation evidence MUST record command names, dates, and result summaries

#### Scenario: Generated deployment output causes lint failure
- **WHEN** lint fails only because generated CloudBase deployment output under `apps/api/.cloudbase/` is included in source lint
- **THEN** the generated output MUST be excluded from source lint or otherwise scoped out with documented rationale
- **AND** `pnpm lint` MUST be rerun and pass before the 6.23 validation task is marked complete

### Requirement: Release configuration SHALL be frozen for 6.24 integration
The system SHALL document the exact dev integration configuration used to enter the 6.24 all-module smoke window.

#### Scenario: Configuration freeze is complete
- **WHEN** release-readiness docs are updated
- **THEN** they MUST include dev API base, Admin hosted URL, Mini Program app id, CloudBase env id, CloudBase function name, API mode guidance, mock actor ids/accounts, and known production exclusions
- **AND** they MUST distinguish dev/mock/fallback readiness from production readiness

#### Scenario: Configuration value is unknown
- **WHEN** a required integration configuration value is not known or not verified
- **THEN** the docs MUST mark it as pending with owner or next action
- **AND** the configuration freeze task MUST remain incomplete if the missing value blocks 6.24 integration

### Requirement: Dev data SHALL be cleaned or classified before integration handoff
The system SHALL classify or clean dev data that could confuse all-module integration, without deleting useful acceptance evidence silently.

#### Scenario: Dev data classification is complete
- **WHEN** test data cleanup is performed
- **THEN** imported draft records, published acceptance records, incomplete media references, invalid coordinates, and duplicate test records MUST be either cleaned or explicitly classified in handoff docs
- **AND** production data MUST NOT be mutated by this change

#### Scenario: Dev data cannot be cleaned safely
- **WHEN** dev data cleanup could remove evidence or required smoke fixtures
- **THEN** the records MUST be preserved with ids, purpose, status, and cleanup recommendation documented
- **AND** the data cleanup task MUST remain incomplete only for records that still block integration

### Requirement: Integration handoff SHALL list entry points blockers and repair windows
The system SHALL produce a 6.24 integration handoff that allows all-module smoke testing to start with clear entry points and known blockers.

#### Scenario: Handoff is complete
- **WHEN** the handoff is published
- **THEN** it MUST list API URLs, Admin URL, Mini Program output/import path, account or actor guidance, data state, validation command results, P0/P1 blockers, owner/next repair window, and links to evidence docs
- **AND** `docs/plan.md` MUST only mark dated tasks complete when the handoff has supporting evidence

#### Scenario: P0 blockers remain
- **WHEN** any P0 blocker remains at handoff time
- **THEN** the handoff MUST name the blocker, owner, immediate next action, and whether 6.24 integration can proceed around it
- **AND** no blocked task MUST be marked complete
