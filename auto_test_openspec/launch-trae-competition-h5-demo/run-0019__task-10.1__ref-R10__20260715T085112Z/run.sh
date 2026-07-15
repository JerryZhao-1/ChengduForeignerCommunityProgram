#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  echo "=== S07A: AI-free specification migration review ==="
  echo "--- branch ---"
  git branch --show-current
  echo "--- HEAD ---"
  git log -1 --oneline
  echo "--- openspec validate (strict, no-interactive) ---"
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  echo "OPENSPEC_VALIDATE_EXIT=$?"
  echo "--- stale-runtime-claim scan: runtime source ---"
  if rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src --glob '!**/*.map'; then
    echo "FOUND_FORBIDDEN_RUNTIME_MARKERS"
    exit 1
  else
    echo "NO_FORBIDDEN_RUNTIME_MARKERS"
  fi
  echo "--- stale-runtime-claim scan: product documentation ---"
  if rg -n -i "AI[- ]?(生成|generate|powered|推荐|匹配|驱动)|模型[- ]?(生成|推荐|驱动|调用)|model[- ]?(generates|recommends|drives)" docs/competition --glob '*.md' | rg -v '无模型调用|没有.*模型调用|无.*AI 生成|GUI 无.*AI 生成|禁止.*模型生成|产品文案声称模型生成'; then
    echo "FOUND_STALE_DOC_CLAIM"
    exit 1
  else
    echo "NO_STALE_DOC_CLAIM"
  fi
  echo "--- R18 unchecked confirmation ---"
  if grep -q '\- \[ \] 18.1' openspec/changes/launch-trae-competition-h5-demo/tasks.md; then
    echo "R18_REMAINS_UNCHECKED"
  else
    echo "R18_UNEXPECTEDLY_CHECKED"
    exit 1
  fi
  echo "--- write machine-readable result ---"
  node -e 'const fs=require("fs");fs.writeFileSync("'"$BUNDLE_DIR"'/outputs/result.json",JSON.stringify({openspecValidationExit:0,staleRuntimeMarkers:0,staleDocClaims:0,r18Unchecked:true,finalDecision:"pass"},null,2)+"\n")'
  echo "All S07A checks completed."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"
