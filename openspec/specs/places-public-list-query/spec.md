# places-public-list-query Specification

## Purpose
TBD - created by archiving change add-places-list-v1-and-query-enhancements. Update Purpose after archive.
## Requirements
### Requirement: `GET /places` SHALL provide a stable v1 public list query

The system SHALL treat `GET /places` as the stable v1 public list query for place browsing.

#### Scenario: Request the list with supported inputs

- **WHEN** a client requests `GET /places`
- **THEN** the supported public inputs are `page`, `pageSize`, `communityId`, `keyword`, `category`, `tag`, `recommended`, and `sort`
- **AND** `sort` only accepts `recommended` or `name`

### Requirement: Public places list reads SHALL enforce `published` visibility

The system SHALL only expose published places through the public list endpoint.

#### Scenario: Request a public places list

- **WHEN** a client requests the public places list
- **THEN** the system returns only places where `status=published`
- **AND** the returned items belong to the target `communityId`
- **AND** draft or otherwise unpublished content is not exposed through the public list response

### Requirement: Public places list queries SHALL keep filtering, sorting, and pagination aligned across provider paths

The system SHALL apply the same list query semantics across mock provider, Koa routes, CloudBase handler execution, and CloudBase provider execution.

#### Scenario: Apply public list query inputs

- **WHEN** a client provides keyword, category, tag, recommended, sort, page, or pageSize inputs
- **THEN** mock provider, Koa route, CloudBase handler, and CloudBase provider behavior remain aligned
- **AND** the response returns `items`, `page`, `pageSize`, and `total`

#### Scenario: Filter by tag

- **WHEN** a client requests `GET /places?tag=<tag-id>`
- **THEN** the system returns only published places whose `tag_ids` contain the requested tag
- **AND** list responses still exclude detail-only fields such as `gallery_media`, `gallery_urls`, and `navigation`

### Requirement: Public places list responses SHALL remain card-oriented

The system SHALL keep public places list responses limited to card browsing data.

#### Scenario: Return a list item

- **WHEN** the system returns a public places list item
- **THEN** the payload only contains fields needed for the list card browsing surface
- **AND** the payload does not include detail-only fields such as `gallery_media`, `gallery_urls`, or `navigation`
