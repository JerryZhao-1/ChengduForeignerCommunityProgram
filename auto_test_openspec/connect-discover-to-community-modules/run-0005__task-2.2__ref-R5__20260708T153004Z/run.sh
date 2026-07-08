#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
REPO_ROOT="$(cd ../../.. && pwd)"
cd "$REPO_ROOT"
echo "Start Mobile H5, then use tests/gui_runbook_related_sections.md"
echo "URL: http://localhost:5174"
VITE_API_MODE=mock pnpm --filter @community-map/mobile dev:h5
