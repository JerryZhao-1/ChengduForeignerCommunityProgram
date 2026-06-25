## MODIFIED Requirements

### Requirement: Project plan and deployment docs SHALL reflect evidence-based status
The system SHALL update `docs/plan.md`, deployment registration docs, and release handoff docs so CloudBase progress is based on completed verification rather than calendar dates.

#### Scenario: Verification evidence exists
- **WHEN** CloudBase auth, inventory, function, route, and smoke checks complete or fail with documented blockers
- **THEN** `docs/plan.md` and deployment registration docs reflect the actual status, blockers, and next development tasks
- **AND** they do not claim production or live provider completion outside the verified scope

#### Scenario: Release handoff consumes CloudBase dev evidence
- **WHEN** the 6.24 integration handoff is prepared
- **THEN** it MUST reference the verified CloudBase dev API base, function name, env id, `/api` route status, and known live/fallback boundaries
- **AND** it MUST keep production env, production security rules, and non-places live persistence marked pending unless separate evidence exists
