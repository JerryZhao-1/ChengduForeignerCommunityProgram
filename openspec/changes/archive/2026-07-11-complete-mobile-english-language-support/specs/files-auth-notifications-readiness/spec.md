## ADDED Requirements

### Requirement: Auth language preference SHALL initialize and synchronize mobile locale

The authentication flow SHALL expose a valid `preferred_language` and allow an authenticated user to update it, while mobile locale rendering remains available offline and login SHALL NOT force a hard-coded language.

#### Scenario: Authenticated user has a saved preference
- **WHEN** a session resolves a user with `preferred_language="en"` and no explicit local choice exists
- **THEN** the mobile app initializes English
- **AND** does not submit an unrelated Chinese override during login or session creation

#### Scenario: Authenticated user changes language
- **WHEN** an authenticated user explicitly changes the mobile language
- **THEN** the app persists the choice locally immediately
- **AND** sends an authenticated preference update using the shared auth contract
- **AND** subsequent authenticated sessions can return the updated preference

#### Scenario: Unauthenticated user changes language
- **WHEN** an unauthenticated user explicitly changes the mobile language
- **THEN** the app persists and uses the local choice without requiring authentication
- **AND** can synchronize that choice after a later successful login

## MODIFIED Requirements

### Requirement: Notifications SHALL support list and read-state ownership
The system SHALL expose notifications only to their owning actor, provide locale-aware presentation for new system notifications, and support read-state updates without leaking other users' notifications.

#### Scenario: User lists own notifications
- **WHEN** a user requests `GET /notifications`
- **THEN** the API returns only notifications belonging to that user
- **AND** each item includes its current read state
- **AND** each new system-generated item includes non-empty Chinese and English title/body presentation values

#### Scenario: English user views notifications
- **WHEN** the active locale is `en` and the user opens notification center
- **THEN** the mobile app displays the English title and body for bilingual notifications
- **AND** system-owned notification actions, loading, empty, error, and read-state copy are English

#### Scenario: Legacy notification has only single-language fields
- **WHEN** a stored notification predates bilingual notification fields
- **THEN** the API/client compatibility path preserves the legacy title and body
- **AND** the mobile app uses deterministic fallback without rendering blank notification content

#### Scenario: User marks own notification as read
- **WHEN** a user marks their own unread notification as read
- **THEN** the API updates the notification status to `read`
- **AND** subsequent list reads reflect the updated status

#### Scenario: User cannot mark another user's notification
- **WHEN** a user attempts to mark another user's notification as read
- **THEN** the API returns a not-found or forbidden error envelope
- **AND** the other user's notification state is not changed
