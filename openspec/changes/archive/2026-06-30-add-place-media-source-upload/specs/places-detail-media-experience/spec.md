## ADDED Requirements

### Requirement: Render external place media with attribution
The mobile place detail page SHALL render externally sourced media as images while clearly labeling the source provider.

#### Scenario: Render external gallery media
- **WHEN** the detail payload includes external gallery media entries
- **THEN** the mobile detail page renders each external image through image components
- **AND** each external image or gallery group displays provider/source attribution
- **AND** the page does not display provider metadata as raw JSON or raw URL text

#### Scenario: Render mixed owned and external gallery media
- **WHEN** the detail payload includes both owned `gallery_media` and external gallery media
- **THEN** the mobile detail page renders both media types in a coherent gallery experience
- **AND** externally sourced images remain visually attributable as external provider media
- **AND** owned images are not mislabeled as external provider images

#### Scenario: External image fails to load
- **WHEN** an externally sourced image URL fails to load or is blocked by the runtime
- **THEN** the mobile detail page shows a TDesign-aligned fallback state for that media item
- **AND** the rest of the detail page remains usable

### Requirement: Attribute externally sourced covers on detail
The mobile place detail page SHALL display source attribution when a visible cover image is externally sourced.

#### Scenario: Render external cover attribution
- **WHEN** the detail payload identifies the `cover_url` as externally sourced
- **THEN** the mobile detail page renders the cover image normally
- **AND** the detail page displays the configured provider/source attribution near the cover or media section

#### Scenario: Render cover without external source
- **WHEN** the detail payload does not mark the cover image as externally sourced
- **THEN** the mobile detail page renders the cover without external provider attribution
- **AND** no empty attribution placeholder is shown
