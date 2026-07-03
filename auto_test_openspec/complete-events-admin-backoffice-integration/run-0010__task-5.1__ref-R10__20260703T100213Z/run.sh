#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../../.. && pwd)"
mkdir -p logs
DOC_API="$REPO_ROOT/docs/API接口使用手册.md"
DOC_LIST="$REPO_ROOT/docs/已实现API接口清单.md"
{
  grep -F "GET /admin/events" "$DOC_LIST"
  grep -F "/admin/events/:id/registrations" "$DOC_LIST"
  grep -F "报名导出当前明确延后" "$DOC_LIST"
  grep -F "### GET \`/admin/events\`" "$DOC_API"
  grep -F "### GET \`/admin/events/:id/registrations\`" "$DOC_API"
  grep -F "x-mock-user-id: user_001" "$DOC_API"
  grep -F "报名导出当前延后" "$DOC_API"
  grep -F "Admin \`/events\`" "$DOC_API"
} 2>&1 | tee logs/run.log
