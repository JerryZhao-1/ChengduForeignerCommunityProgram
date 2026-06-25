# mini-program-release-readiness Specification

## Purpose
Define release-readiness requirements for Mini Program CloudBase function builds, WeChat DevTools import, and real-device places verification.

## Requirements
### Requirement: Mini Program SHALL build in CloudBase function mode
The system SHALL produce a WeChat Mini Program package using `cloudbase-function` API mode and the documented CloudBase dev env/function settings.

#### Scenario: CloudBase function build succeeds
- **WHEN** the Mini Program build is run with `VITE_API_MODE=cloudbase-function`, `VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`, and `VITE_CLOUDBASE_FUNCTION_NAME=community-map-api`
- **THEN** the build MUST complete without errors
- **AND** the generated Mini Program output path MUST be recorded for WeChat DevTools import

#### Scenario: CloudBase function build fails
- **WHEN** the Mini Program build fails
- **THEN** the failure MUST be recorded with command, exit status, log summary, and next action
- **AND** the 6.22 Mini Program build task MUST remain incomplete

### Requirement: WeChat DevTools import SHALL verify the main Mini Program flow
The system SHALL verify that the generated Mini Program package can be imported into WeChat DevTools and can run the core entry flow against the intended CloudBase function mode.

#### Scenario: WeChat DevTools import succeeds
- **WHEN** the generated Mini Program output is imported into WeChat DevTools
- **THEN** the app MUST launch without a blank screen
- **AND** the main entries for places, events, and discover MUST be reachable or any non-reachable entry MUST be recorded as a blocker
- **AND** evidence MUST include the output path, app id, env id, function name, and observed result

#### Scenario: WeChat DevTools import is blocked
- **WHEN** WeChat DevTools is unavailable, import fails, login is blocked, or the app cannot launch
- **THEN** the blocker MUST be recorded with severity, exact missing prerequisite or error, and required next action
- **AND** the import task MUST remain incomplete

### Requirement: Real device places map navigation and share SHALL be verified or blocked explicitly
The system SHALL verify places map, native navigation, and share behavior on at least one physical WeChat-capable device, or record why real-device verification cannot be completed.

#### Scenario: Real device places verification succeeds
- **WHEN** the Mini Program runs on a physical device
- **THEN** places list/map/detail MUST be reachable
- **AND** map marker selection, detail navigation action, and place share action MUST complete or show an acceptable runtime permission fallback
- **AND** evidence MUST record device type, test date, tested place id, result, and any permission prompts

#### Scenario: Real device verification is blocked
- **WHEN** a physical device, WeChat login, trial package, location permission, or CloudBase invocation is unavailable
- **THEN** the blocker MUST be recorded as P0, P1, or P2 with owner and next repair window
- **AND** the real-device task MUST remain incomplete unless the accepted fallback is explicitly documented
