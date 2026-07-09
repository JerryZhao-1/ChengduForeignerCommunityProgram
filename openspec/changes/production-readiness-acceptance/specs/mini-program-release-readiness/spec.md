## ADDED Requirements

### Requirement: Mini Program production acceptance SHALL use a WeChat-reachable API target
The Mini Program release gate SHALL validate production-like previews against CloudBase function mode or an approved HTTPS API domain that is reachable from WeChat clients and allowed by Mini Program legal-domain configuration.

#### Scenario: Mini Program preview uses local API
- **WHEN** the preview depends on `127.0.0.1`, localhost, a LAN IP, or a developer machine tunnel not approved for release
- **THEN** the release gate records the preview as local/dev evidence and keeps production acceptance blocked

#### Scenario: Mini Program preview uses approved API target
- **WHEN** the preview uses CloudBase function mode or an approved HTTPS API domain and Home, Events, Discover, Places, and Me can fetch data on a real device
- **THEN** the release gate records API reachability as production-like evidence

### Requirement: True-device Mini Program acceptance SHALL cover all launch tabs and core module entry points
The Mini Program release gate SHALL validate Home, Events, Discover, Places, and Me on true devices without white screens, unrecoverable loading failures, or unclassified business errors.

#### Scenario: All launch tabs load on true devices
- **WHEN** the operator opens each tab and core entry point on the supported true-device matrix
- **THEN** each page shows business data or a valid empty/error state, and the evidence bundle includes screenshots and console/API findings

#### Scenario: A launch tab fails on true devices
- **WHEN** any tab or core entry point shows persistent loading failure, blank content, or unclassified API errors
- **THEN** the release gate records a production blocker for the affected module

### Requirement: Mini Program platform capabilities SHALL be validated or explicitly blocked
The Mini Program release gate SHALL verify navigation, sharing, map rendering, network domains, storage/media access, and relevant permission fallbacks on true devices.

#### Scenario: Platform capabilities pass
- **WHEN** navigation, sharing, map rendering, media loading, and network access work on true devices or show accepted fallback UI
- **THEN** the release gate records the platform capability as accepted

#### Scenario: Platform capability is restricted
- **WHEN** WeChat account policy, legal domains, certification status, or SDK behavior prevents a platform capability
- **THEN** the release gate records the exact platform message, affected UX, owner, and whether the restriction blocks production launch

### Requirement: WeChat DevTools project entry SHALL be stable for release validation
The Mini Program release gate SHALL define one canonical DevTools project path that can compile and preview reliably for release validation.

#### Scenario: Canonical generated project path works
- **WHEN** `apps/mobile/dist/dev/mp-weixin` is imported and compiles in WeChat DevTools
- **THEN** release validation may use that path if the handoff documents it as canonical

#### Scenario: Root project import fails
- **WHEN** root project import fails with a DevTools path or compile error
- **THEN** the release gate records the failure and requires either a fix or explicit documentation that the generated Mini Program directory is the release-validation entry
