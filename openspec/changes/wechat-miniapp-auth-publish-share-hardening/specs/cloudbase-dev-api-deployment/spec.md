## ADDED Requirements

### Requirement: CloudBase live Mini Program callers SHALL resolve to durable project users
CloudBase live API routes invoked by WeChat Mini Program CloudBase function mode SHALL resolve authenticated callers from WeChat-injected identity headers and map them to durable project user records before performing user-owned writes.

#### Scenario: Mini Program caller has WeChat identity headers
- **WHEN** a CloudBase live request includes `x-wx-openid` and `x-wx-appid`
- **THEN** the API creates or refreshes a project user mapped to that identity and uses that user as the request actor

#### Scenario: Live request has no production identity
- **WHEN** a CloudBase live request has no WeChat identity and mock actor fallback is not explicitly enabled for dev smoke
- **THEN** the API rejects protected actor resolution with `401`

#### Scenario: Dev mock actor fallback is explicitly enabled
- **WHEN** `API_ALLOW_MOCK_ACTOR_HEADER=true` and a request includes `x-mock-user-id`
- **THEN** the API may resolve that actor for dev/admin smoke checks without treating it as production authentication
