## ADDED Requirements

### Requirement: Admin hosting SHALL target the intended CloudBase dev API domain
The system SHALL verify that the Admin dev hosted experience calls the intended CloudBase dev API domain for release-readiness validation.

#### Scenario: Admin hosting reaches CloudBase dev API
- **WHEN** the Admin hosted domain is opened for release-readiness validation
- **THEN** the Admin app MUST load without a blank screen
- **AND** API requests MUST target `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api` or an explicitly documented equivalent dev API base
- **AND** evidence MUST record the hosted URL, API base, request status, and actor used for protected admin checks

#### Scenario: Admin hosting uses stale or incorrect API configuration
- **WHEN** the hosted Admin app calls mock data, localhost, a missing API domain, or a stale deployment
- **THEN** the mismatch MUST be recorded as a blocker with the observed URL/config and required redeploy or configuration action
- **AND** the Admin hosting task MUST remain incomplete

### Requirement: Admin hosting SHALL support route refresh for release entry points
The system SHALL verify that Admin static hosting supports direct navigation or refresh on the release-relevant admin routes.

#### Scenario: Hosted Admin route refresh succeeds
- **WHEN** the hosted Admin places or release-relevant route is loaded directly or refreshed
- **THEN** the route MUST render the Admin app rather than a hosting 404 or blank page
- **AND** evidence MUST record the route URL and observed result

#### Scenario: Hosted Admin route refresh fails
- **WHEN** direct route access or refresh fails because hosting fallback routing is missing
- **THEN** the failure MUST be recorded with the route URL, status/visible error, and required hosting configuration action
- **AND** the Admin hosting task MUST remain incomplete
