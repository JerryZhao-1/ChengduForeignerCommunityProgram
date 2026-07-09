## ADDED Requirements

### Requirement: Places share action SHALL match the visible product behavior
The Places detail share action SHALL either invoke native WeChat sharing or visibly present itself as a copy-link fallback. It MUST NOT label an action as native sharing while only copying an internal route path.

#### Scenario: Native WeChat share is available
- **WHEN** a user taps the Places detail share action on a true Mini Program device
- **THEN** the Mini Program invokes the native WeChat share flow with the current place title, stable detail path, and approved share image when configured

#### Scenario: Native WeChat share is unavailable
- **WHEN** account policy, platform restrictions, or surface limitations prevent native sharing
- **THEN** the UI presents a clear copy-link fallback and the release evidence records the restriction and product decision

#### Scenario: Share button only copies an internal route
- **WHEN** a button labelled as sharing only copies a path such as `/pages/places/detail?id=place_002`
- **THEN** production acceptance for Places sharing remains blocked until the behavior is changed or the UX is relabelled as copy-link fallback

### Requirement: Places navigation SHALL be confirmed on true Mini Program devices
The Places module SHALL validate navigation launch and fallback behavior on true Mini Program devices before production acceptance.

#### Scenario: Navigation launches successfully
- **WHEN** a user taps a Places navigation action on a true Mini Program device with valid coordinates
- **THEN** the Mini Program launches the platform navigation/map flow or shows an accepted platform handoff prompt

#### Scenario: Navigation cannot launch
- **WHEN** missing coordinates, denied permissions, or platform restrictions prevent navigation
- **THEN** the Mini Program shows a recoverable fallback and the release evidence records the exact reason
