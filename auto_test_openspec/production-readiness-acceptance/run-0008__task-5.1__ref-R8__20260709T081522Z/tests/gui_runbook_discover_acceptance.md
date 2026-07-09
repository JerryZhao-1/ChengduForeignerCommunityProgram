# GUI Runbook - Discover Content, Interaction, Report, And Governance

Evidence owner: Supervisor / manual GUI runner

Mini Program project: `apps/mobile/dist/build/mp-weixin`

Admin Web: `https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/`

API target: `https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api`

Save evidence under:

`auto_test_openspec/production-readiness-acceptance/run-0008__task-5.1__ref-R8__20260709T081522Z/outputs/`

## Required Files

- `discover-feed.png`
- `discover-create-post.png`
- `discover-detail-comment.png`
- `discover-interactions.png`
- `discover-share-or-copy-fallback.png`
- `discover-report-submitted.png`
- `admin-discover-governance.png`
- `discover-console.log`
- `discover-acceptance-result.json`

## Steps

1. Open the Mini Program Discover tab.
2. Create a post with text content and tags.
3. Open the created post detail.
4. Add a comment.
5. Like, favorite, and use share or the accepted copy-link fallback.
6. Submit a report for the post.
7. Open Admin Web and confirm the post/report/governance metadata is visible.
8. Record post id, comment id, report id, interaction state, screenshots, and console/API errors.

## Result JSON Template

```json
{
  "surface": "wechat-devtools-or-true-device-plus-admin-web",
  "post_id": "<post-id>",
  "comment_id": "<comment-id>",
  "report_id": "<report-id>",
  "post_created": true,
  "comment_created": true,
  "liked": true,
  "favorited": true,
  "share_or_copy_fallback_ok": true,
  "report_submitted": true,
  "admin_governance_visible": true,
  "screenshots": [
    "discover-feed.png",
    "discover-create-post.png",
    "discover-detail-comment.png",
    "discover-interactions.png",
    "discover-share-or-copy-fallback.png",
    "discover-report-submitted.png",
    "admin-discover-governance.png"
  ],
  "console_log": "discover-console.log",
  "notes": ""
}
```

