#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
BUNDLE_DIR="$PWD"
REPO_DIR="$(cd ../../.. && pwd)"
mkdir -p logs outputs

{
  cd "$REPO_DIR"
  echo "=== S07A: corrected AI-free specification migration review ==="
  echo "--- branch ---"
  git branch --show-current
  echo "--- HEAD ---"
  git log -1 --oneline
  echo "--- openspec validate (strict, no-interactive) ---"
  openspec validate launch-trae-competition-h5-demo --strict --no-interactive
  echo "OPENSPEC_VALIDATE_EXIT=0"

  echo "--- stale-runtime-claim scan: runtime source ---"
  set +e
  runtime_matches="$(rg -n -i "deepseek|generated_by|ai_status|generation_source|createModel|generateText|model[_ -]?(endpoint|credential|status)|AI[- ]generated|AI 生成|模型生成" apps/api/src packages/shared/src apps/mobile/src --glob '!**/*.map' 2>&1)"
  runtime_scan_exit=$?
  set -e
  if [ "$runtime_scan_exit" -eq 0 ]; then
    printf '%s\n' "$runtime_matches"
    echo "FOUND_FORBIDDEN_RUNTIME_MARKERS"
    exit 1
  elif [ "$runtime_scan_exit" -eq 1 ]; then
    echo "NO_FORBIDDEN_RUNTIME_MARKERS"
  else
    printf '%s\n' "$runtime_matches"
    echo "RUNTIME_SCAN_FAILED=$runtime_scan_exit"
    exit "$runtime_scan_exit"
  fi

  echo "--- stale-runtime-claim scan: product documentation ---"
  set +e
  doc_candidates="$(rg -n -i "AI[- ]?(生成|generate|powered|推荐|匹配|驱动)|模型[- ]?(生成|推荐|驱动|调用)|model[- ]?(generates|recommends|drives)" docs/competition --glob '*.md' 2>&1)"
  doc_scan_exit=$?
  set -e
  if [ "$doc_scan_exit" -gt 1 ]; then
    printf '%s\n' "$doc_candidates"
    echo "DOC_SCAN_FAILED=$doc_scan_exit"
    exit "$doc_scan_exit"
  fi
  set +e
  stale_doc_matches="$(printf '%s\n' "$doc_candidates" | rg -v '无模型调用|没有.*模型调用|无.*AI 生成|GUI 无.*AI 生成|禁止.*模型生成|产品文案声称模型生成')"
  stale_doc_exit=$?
  set -e
  if [ "$stale_doc_exit" -eq 0 ]; then
    printf '%s\n' "$stale_doc_matches"
    echo "FOUND_STALE_DOC_CLAIM"
    exit 1
  elif [ "$stale_doc_exit" -eq 1 ]; then
    echo "NO_STALE_DOC_CLAIM"
  else
    echo "DOC_FILTER_FAILED=$stale_doc_exit"
    exit "$stale_doc_exit"
  fi

  echo "--- R18 unchecked confirmation ---"
  if rg -q '^- \[ \] 18\.1 ' openspec/changes/launch-trae-competition-h5-demo/tasks.md; then
    echo "R18_REMAINS_UNCHECKED"
  else
    echo "R18_UNEXPECTEDLY_CHECKED"
    exit 1
  fi

  echo "--- write machine-readable result ---"
  node -e 'const fs=require("fs");fs.writeFileSync(process.argv[1],JSON.stringify({openspecValidationExit:0,staleRuntimeMarkers:0,staleDocClaims:0,r18Unchecked:true,finalDecision:"pass"},null,2)+"\n")' "$BUNDLE_DIR/outputs/result.json"
  echo "All corrected S07A checks completed."
} 2>&1 | tee "$BUNDLE_DIR/logs/run.log"
