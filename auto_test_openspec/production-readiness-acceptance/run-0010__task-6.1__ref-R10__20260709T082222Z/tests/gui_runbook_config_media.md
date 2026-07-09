# GUI Runbook - Config, Media, Domains

Evidence owner: Supervisor / manual GUI runner

Mini Program project: `apps/mobile/dist/build/mp-weixin`

Save evidence under:

`auto_test_openspec/production-readiness-acceptance/run-0010__task-6.1__ref-R10__20260709T082222Z/outputs/`

## Required Files

- `config-media-network.png`
- `config-media-console.log`
- `config-media-result.json`

## Steps

1. Import `apps/mobile/dist/build/mp-weixin` in WeChat DevTools or true-device preview.
2. Open Home, Events, Discover, Places, and Me.
3. Inspect network logs for local endpoints and fixture media.
4. Confirm API requests go through CloudBase function/gateway.
5. Confirm event/place media does not request `https://example.com/public/events/...`.
6. Record map/media/domain errors and classify whether they are platform configuration blockers.

## Result JSON Template

```json
{
  "surface": "wechat-devtools-or-true-device",
  "cloudbase_api_target_used": true,
  "localhost_or_lan_requests_seen": false,
  "example_event_media_requests_seen": false,
  "map_domain_or_permission_issue": null,
  "storage_or_media_domain_issue": null,
  "screenshots": ["config-media-network.png"],
  "console_log": "config-media-console.log",
  "notes": ""
}
```

