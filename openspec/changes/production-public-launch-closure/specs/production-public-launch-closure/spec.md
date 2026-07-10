## ADDED Requirements

### Requirement: Public launch closure SHALL classify remaining work by ownership
The system SHALL maintain a launch-closure classification that separates Codex-owned, human-owned, and mixed-ownership work before any public launch decision is made.

#### Scenario: Classify launch prerequisites
- **WHEN** the public launch closure artifacts are generated
- **THEN** each remaining prerequisite is classified as Codex-owned, human-owned, or mixed-ownership
- **AND** each human-owned or mixed prerequisite names the responsible role, required evidence, and blocker severity

#### Scenario: Human work remains incomplete
- **WHEN** a human-owned prerequisite such as WeChat certification, legal-domain configuration, true-device execution, or review submission is not complete
- **THEN** the final launch state MUST remain blocked or limited to the highest safe state supported by evidence
- **AND** Codex-owned checks MUST NOT mark that human prerequisite complete on behalf of the account owner

### Requirement: Human launch manual SHALL be complete and actionable
The system SHALL provide a detailed human operations manual under `docs/` for the account owner and release operator to complete public Mini Program launch tasks.

#### Scenario: Generate human operations manual
- **WHEN** the launch manual is produced
- **THEN** it MUST include WeChat account preparation, certification/filing checks, service category checks, privacy disclosure setup, server domain setup, storage/media domain review, CloudBase console checks, map key checks, true-device validation, review upload/submission, phased/full release, rollback, and post-release monitoring
- **AND** every manual step MUST include expected evidence such as screenshot names, console paths, URLs, device notes, or decision records

#### Scenario: Manual step is not directly verifiable by Codex
- **WHEN** a step requires console ownership, true-device interaction, or business approval
- **THEN** the manual MUST state that a human must perform it
- **AND** the validation bundle MUST collect evidence pointers rather than pretending to execute the step automatically

### Requirement: Public launch evidence SHALL be append-only and decision-oriented
The system SHALL store public-launch evidence in append-only validation bundles and produce a final handoff with a clear launch decision state.

#### Scenario: Create public launch validation evidence
- **WHEN** Codex or a human operator performs a public-launch validation attempt
- **THEN** the attempt MUST create a new run folder under `auto_test_openspec/production-public-launch-closure/`
- **AND** the run folder MUST include task instructions, command outputs or evidence pointers, and expected results
- **AND** the Supervisor evidence record MUST provide the final PASS/FAIL result and evidence pointers after executing the bundle

#### Scenario: Produce final launch handoff
- **WHEN** all launch closure tasks have current evidence
- **THEN** the handoff MUST declare exactly one state: blocked, ready for WeChat review upload, ready for review submission, ready for phased release, or ready for full public release
- **AND** the handoff MUST link to evidence for code gates, production artifact scans, Admin auth, CloudBase target checks, domain/account checks, true-device checks, content/media audit, and rollback readiness

### Requirement: Production content and media SHALL be audited before public launch
The system SHALL audit public production content and media references so published records do not depend on mock fixtures, unsupported domains, or unreviewed external media.

#### Scenario: Audit published records
- **WHEN** production content audit runs against the selected API or exported data
- **THEN** it MUST check published places, events, discover posts, and visible media references for fixture domains, local endpoints, missing required bilingual launch fields, draft leakage, and unreviewed external media attribution
- **AND** it MUST produce a machine-readable report that distinguishes blocking issues from human editorial review items

#### Scenario: Audit finds launch-blocking content
- **WHEN** the audit finds mock fixture media, local URLs, unpublished draft leakage, missing required media attribution, or other blocking content in public surfaces
- **THEN** the public launch closure state MUST remain blocked
- **AND** the report MUST identify affected record ids, fields, and recommended owner action

### Requirement: Post-release monitoring and rollback SHALL be prepared before publish
The system SHALL document and verify the monitoring and rollback plan before a phased or full public release.

#### Scenario: Prepare monitoring
- **WHEN** the final launch handoff is generated
- **THEN** it MUST list CloudBase function logs, API health checks, Admin access checks, Mini Program smoke paths, requestId capture steps, and owner contacts for launch-day monitoring
- **AND** it MUST state which metrics or incidents require rollback, pause, or hotfix

#### Scenario: Prepare rollback
- **WHEN** the release operator is ready to publish
- **THEN** the rollback section MUST explain how to withdraw, pause, roll back, or supersede the Mini Program version using WeChat version management
- **AND** it MUST include the previous known-good version or state that no previous public version exists
