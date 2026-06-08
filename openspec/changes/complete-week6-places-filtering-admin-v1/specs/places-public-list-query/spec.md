## MODIFIED Requirements

### Requirement: `GET /places` SHALL provide a stable v1 public list query

The system SHALL treat `GET /places` as the stable v1 public list query for place browsing.

#### Scenario: Request the list with supported inputs

- **WHEN** a client requests `GET /places`
- **THEN** the supported public inputs are `page`, `pageSize`, `communityId`, `keyword`, `category`, `tag`, `recommended`, and `sort`
- **AND** `sort` only accepts `recommended` or `name`

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
