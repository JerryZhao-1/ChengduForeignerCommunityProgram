## ADDED Requirements

### Requirement: Browse places on a real map

The system SHALL allow mobile users to open a real map view for published community places.

#### Scenario: Open places map

- **WHEN** the user enters the places map page
- **THEN** the system loads published place markers for community `tongzilin`
- **AND** renders them on a real map centered on the community area

### Requirement: Inspect a place from its marker

The system SHALL allow users to inspect a place by tapping its marker.

#### Scenario: Tap marker

- **WHEN** the user taps a place marker
- **THEN** the system shows the selected place name
- **AND** allows the user to open the corresponding place detail page

### Requirement: Launch navigation from place detail

The system SHALL allow users to launch native map navigation from a place detail page.

#### Scenario: Open navigation

- **WHEN** the user taps the navigation action on a place detail page
- **THEN** the system opens native location/navigation for that place's coordinates and name
