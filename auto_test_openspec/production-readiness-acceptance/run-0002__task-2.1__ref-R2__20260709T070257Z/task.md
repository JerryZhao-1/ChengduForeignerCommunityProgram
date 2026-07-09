# Production Readiness Acceptance - Task 2.1 Validation

- change-id: production-readiness-acceptance
- run: RUN #2
- task-id: 2.1
- ref-id: R2
- scope: CLI

## How To Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

Both scripts resolve the repository root from this bundle path and can be launched from any working directory.

## Inputs

- `inputs/target.json` declares the CloudBase API target, EnvId, function name, API mode, and dev actor ids used for smoke.

## Outputs

- `logs/build-mp-weixin.log`: Mini Program build log.
- `logs/smoke.log`: API smoke runner log.
- `outputs/build-config.json`: Generated Mini Program config/requester scan.
- `outputs/*.json`: Individual API response captures.
- `outputs/summary.json`: Target classification, created ids, and assertion names.

## Expected Results

- The target URL is HTTPS and not localhost, loopback, or LAN.
- The target URL uses `cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`.
- The Mini Program build is generated with `VITE_API_MODE=cloudbase-function`, `VITE_API_BASE_URL` set to the CloudBase HTTPS API target, `VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0`, and `VITE_CLOUDBASE_FUNCTION_NAME=community-map-api`.
- Generated Mini Program config/client artifacts contain the CloudBase HTTPS target and `callHTTPFunction`, and do not contain forbidden local API endpoint strings.
- Live API checks succeed for health, Places public reads, Events create/register/ticket/check-in, Discover create/comment/like/favorite/share/report, and Admin governance/report surfaces.

## Classification

This bundle proves CloudBase dev HTTPS API reachability and Mini Program CloudBase-function build configuration. It does not by itself prove WeChat account legal-domain review, production authentication, or true-device acceptance; those are covered by later tasks.

## Provenance

Expected results are derived from task 2.1 ACCEPT criteria and the existing CloudBase gateway/function configuration for `cloud1-d7gxdk8t43bd639c0`.
