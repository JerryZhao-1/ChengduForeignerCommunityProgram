## ADDED Requirements

### Requirement: Mini Program public-review package SHALL pass production artifact scans
The system SHALL validate the generated Mini Program public-review package before upload or review submission.

#### Scenario: Production artifact scan passes
- **WHEN** the Mini Program public-review package is built for `cloudbase-function` mode
- **THEN** the generated package MUST NOT contain `localhost`, `127.0.0.1`, LAN IP endpoints, `x-mock-user-id`, mock-only actor configuration, fixture media domains such as `example.com/public/events`, or undocumented API targets
- **AND** the scan MUST record the build command, output path, app id, CloudBase env id, function name, and scan results

#### Scenario: Production artifact scan fails
- **WHEN** the generated package contains local endpoints, mock actor references, fixture media, or ambiguous target configuration
- **THEN** upload and public-review submission MUST remain blocked
- **AND** the scan report MUST identify the matching file paths and patterns

### Requirement: Mini Program public-review path SHALL use a canonical build output
The system SHALL distinguish development output from the canonical public-review Mini Program package.

#### Scenario: Public-review output is documented
- **WHEN** the public-review build is generated
- **THEN** the documented WeChat DevTools import or `miniprogram-ci` project path MUST point to `apps/mobile/dist/build/mp-weixin` or another explicitly approved build output
- **AND** root project configuration that points to a dev output MUST be documented as development-only or adjusted before public-review upload

#### Scenario: Upload path is ambiguous
- **WHEN** release documentation, scripts, or project configuration disagree about whether to upload `dist/dev/mp-weixin` or `dist/build/mp-weixin`
- **THEN** the Mini Program public-review readiness state MUST remain blocked
- **AND** the blocker MUST name the conflicting paths and the owner of the correction

### Requirement: Mini Program legal domain readiness SHALL be verified on true devices
The system SHALL require account-owner confirmation and true-device evidence for WeChat legal request, upload, download, and media domains before public launch.

#### Scenario: Legal domains are accepted
- **WHEN** the account owner configures WeChat Mini Program server domains for the selected API, storage, upload, download, and media resources
- **THEN** iOS and Android true-device checks MUST prove the Mini Program can call CloudBase functions or HTTPS APIs, load approved media, upload supported images, and download or display required private/public files without debug-mode domain bypass
- **AND** evidence MUST include console setting screenshots or exports, device names, WeChat versions, tested paths, and observed network results

#### Scenario: Domain check depends on debug bypass
- **WHEN** the app only works with "do not verify valid domain/TLS/HTTPS certificate" enabled or with mobile debug-mode bypass
- **THEN** public launch MUST remain blocked
- **AND** the evidence MUST identify the failed domain or certificate class

### Requirement: Mini Program true-device matrix SHALL cover all launch-critical tabs and platform capabilities
The system SHALL verify Home, Events, Discover, Places, and Me on both iOS and Android WeChat clients before public launch.

#### Scenario: True-device matrix passes
- **WHEN** the public-review package is tested on supported iOS and Android devices
- **THEN** Home, Events, Discover, Places, and Me MUST load without blank screens or unclassified runtime failures
- **AND** Events registration/ticket viewing, Discover create/comment/like/favorite/share-or-fallback/report, Places map/detail/navigation/share-or-fallback, media loading, upload, location permission fallback, and language/account paths MUST be covered or explicitly marked not in launch scope

#### Scenario: Platform capability fails
- **WHEN** a true-device check fails because of share policy, location permission, domain configuration, CloudBase invocation, media loading, or upload behavior
- **THEN** the failure MUST be classified as code-owned, account-owner-owned, device/platform limitation, or accepted product fallback
- **AND** public launch MUST remain blocked unless an accepted fallback is implemented and documented
