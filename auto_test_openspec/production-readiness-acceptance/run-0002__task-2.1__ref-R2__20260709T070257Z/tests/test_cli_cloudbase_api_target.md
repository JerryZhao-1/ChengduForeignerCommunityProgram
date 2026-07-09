# CloudBase API Target Smoke Assertions

This bundle validates task 2.1 through `run.sh` or `run.bat`.

Assertions:

- The Mini Program build command uses `cloudbase-function` mode and the explicit CloudBase HTTPS fallback base URL.
- Generated Mini Program config/client artifacts contain `cloud1-d7gxdk8t43bd639c0`, `community-map-api`, the CloudBase HTTPS API base, and the `callHTTPFunction` requester path.
- Generated Mini Program config/client artifacts do not contain localhost, loopback, or LAN API endpoints.
- Live CloudBase API responses use the success envelope for Places, Events, Discover, and Admin governance smoke checks.
- Created event, registration, ticket, post, and comment ids are recorded in `outputs/summary.json`.
