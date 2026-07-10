## ADDED Requirements

### Requirement: Public launch gate SHALL expose explicit decision states
The system SHALL represent final public-launch readiness using explicit decision states rather than a single ambiguous ready/not-ready flag.

#### Scenario: Decision state is selected
- **WHEN** the public launch handoff is generated
- **THEN** it MUST declare exactly one decision state from: blocked, ready for WeChat review upload, ready for review submission, ready for phased release, or ready for full public release
- **AND** the state MUST be justified by linked evidence and unresolved blockers

#### Scenario: Evidence is insufficient
- **WHEN** required evidence is missing for account setup, legal domains, Admin auth, production artifacts, true-device matrix, content/media audit, rollback, or monitoring
- **THEN** the decision state MUST be blocked or lower than the first state requiring that evidence
- **AND** the missing evidence MUST be assigned to Codex-owned, human-owned, or mixed ownership

### Requirement: Public launch gate SHALL separate upload review submission and release
The system SHALL distinguish WeChat code upload readiness, review submission readiness, phased release readiness, and full release readiness.

#### Scenario: Ready for WeChat review upload
- **WHEN** code gates, release artifact scans, canonical upload path, and package metadata are complete but human account/domain/review prerequisites are incomplete
- **THEN** the decision state MAY be ready for WeChat review upload
- **AND** the handoff MUST list remaining blockers before review submission

#### Scenario: Ready for review submission
- **WHEN** the package has been uploaded, account/legal-domain/privacy/service-category prerequisites are confirmed, and review materials are complete
- **THEN** the decision state MAY be ready for review submission
- **AND** the handoff MUST include the submitted version, review notes, test paths, and any required test account or operator instructions

#### Scenario: Ready for phased release
- **WHEN** WeChat review has passed and launch monitoring/rollback readiness is complete but broad release risk remains
- **THEN** the decision state MAY be ready for phased release
- **AND** the handoff MUST specify recommended phase percentage, monitoring window, rollback owner, and promotion criteria

#### Scenario: Ready for full public release
- **WHEN** review has passed, true-device checks pass on the reviewed package, content/media audit is clean, Admin auth is accepted, domains are verified, and phased release is either complete or intentionally skipped with rationale
- **THEN** the decision state MAY be ready for full public release
- **AND** the handoff MUST record the release operator, release time, version, and post-release monitoring checklist

### Requirement: Public launch gate SHALL require current validation commands
The system SHALL require current code validation and release-specific validation before public launch handoff states can advance.

#### Scenario: Validation commands pass
- **WHEN** public launch closure validation is performed
- **THEN** `pnpm typecheck`, `pnpm test`, `pnpm lint`, relevant package builds, production artifact scans, and OpenSpec strict validation for the change MUST pass or be recorded as scoped blockers
- **AND** command summaries MUST be linked from the final handoff

#### Scenario: Validation command fails
- **WHEN** a required validation command fails for an in-scope source, build, test, lint, or spec issue
- **THEN** the decision state MUST remain blocked
- **AND** the failure MUST include command, exit status, key error lines, owner, and next action

### Requirement: Public launch handoff SHALL preserve prior evidence classification
The system SHALL reference prior production-readiness evidence without reclassifying dev or production-like evidence as final public launch evidence.

#### Scenario: Prior evidence is reused as context
- **WHEN** the public launch handoff references `production-readiness-acceptance` or earlier run folders
- **THEN** it MUST identify them as historical or production-like evidence
- **AND** it MUST state which new public-launch evidence supersedes or complements each prior evidence class

#### Scenario: Prior evidence is not sufficient
- **WHEN** prior evidence lacks true-device public package checks, account-owner domain confirmation, production Admin auth, production content audit, or review/release proof
- **THEN** the public launch handoff MUST require new evidence for those classes
- **AND** the decision state MUST not advance based only on prior dev acceptance
