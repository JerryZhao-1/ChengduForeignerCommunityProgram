#!/usr/bin/env node
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const changeId = "production-public-launch-closure";
const root = path.join(repoRoot, "auto_test_openspec", changeId);
const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\.\d{3}Z$/, "Z");

const tasks = [
  {
    run: "0001",
    taskId: "1.1",
    ref: "R1",
    scope: "CLI",
    title: "Create the public launch ownership matrix and closure status model",
    command: "node scripts/public_launch_verify.mjs ownership"
  },
  {
    run: "0002",
    taskId: "1.2",
    ref: "R2",
    scope: "CLI",
    title:
      "Produce the detailed human Mini Program public launch manual under docs",
    command: "node scripts/public_launch_verify.mjs manual"
  },
  {
    run: "0003",
    taskId: "1.3",
    ref: "R3",
    scope: "CLI",
    title: "Add public launch decision-state handoff template",
    command: "node scripts/public_launch_verify.mjs handoff-template"
  },
  {
    run: "0004",
    taskId: "2.1",
    ref: "R4",
    scope: "CLI",
    title: "Harden Mini Program public-review build configuration",
    command: "node scripts/public_launch_verify.mjs public-review-config"
  },
  {
    run: "0005",
    taskId: "2.2",
    ref: "R5",
    scope: "CLI",
    title:
      "Add production artifact scan for forbidden endpoints fixtures and mock headers",
    command: "node scripts/public_launch_verify.mjs artifact-scan --build"
  },
  {
    run: "0006",
    taskId: "2.3",
    ref: "R6",
    scope: "CLI",
    title:
      "Resolve canonical DevTools or miniprogram-ci public-review upload path",
    command: "node scripts/public_launch_verify.mjs upload-paths"
  },
  {
    run: "0007",
    taskId: "3.1",
    ref: "R7",
    scope: "CLI",
    title: "Verify Admin production auth without mock actor headers",
    command: "node scripts/public_launch_verify.mjs admin-auth",
    inputs: true
  },
  {
    run: "0008",
    taskId: "3.2",
    ref: "R8",
    scope: "CLI",
    title:
      "Add CloudBase public-launch target and environment readiness checks",
    command: "node scripts/public_launch_verify.mjs cloudbase-readiness",
    inputs: true
  },
  {
    run: "0009",
    taskId: "3.3",
    ref: "R9",
    scope: "MIXED",
    title: "Verify hosted Admin targets the selected launch API",
    command:
      "node scripts/public_launch_verify.mjs hosted-admin-target --build",
    mixed: true
  },
  {
    run: "0010",
    taskId: "4.1",
    ref: "R10",
    scope: "CLI",
    title: "Add production content and media audit",
    command:
      "node scripts/public_launch_verify.mjs content-media-audit --input=docs/public-launch-content-audit-sample.json",
    inputs: true
  },
  {
    run: "0011",
    taskId: "4.2",
    ref: "R11",
    scope: "GUI",
    title:
      "Create iOS Android true-device public package runbooks and evidence index",
    command: "node scripts/public_launch_verify.mjs true-device-runbook",
    gui: true
  },
  {
    run: "0012",
    taskId: "4.3",
    ref: "R12",
    scope: "CLI",
    title:
      "Add manual evidence collector for WeChat account domains privacy and review settings",
    command: "node scripts/public_launch_verify.mjs evidence-collector",
    inputs: true
  },
  {
    run: "0013",
    taskId: "5.1",
    ref: "R13",
    scope: "CLI",
    title: "Run full source build spec validation gate for launch closure",
    command: "node scripts/public_launch_verify.mjs final-gate"
  },
  {
    run: "0014",
    taskId: "5.2",
    ref: "R14",
    scope: "CLI",
    title: "Produce final public launch closure handoff",
    command: "node scripts/public_launch_verify.mjs final-handoff",
    inputs: true
  }
];

mkdirSync(root, { recursive: true });

const existingRunNumbers = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => /^run-(\d{4})__/.exec(entry.name)?.[1])
  .filter(Boolean)
  .map(Number);
const firstRunNumber = Math.max(0, ...existingRunNumbers) + 1;
const requestedRefs = process.argv
  .find((arg) => arg.startsWith("--refs="))
  ?.slice("--refs=".length)
  .split(",")
  .map((ref) => ref.trim())
  .filter(Boolean);
const selectedTasks = requestedRefs?.length
  ? tasks.filter((task) => requestedRefs.includes(task.ref))
  : tasks;

const runFolderName = (task, runNumber) =>
  `run-${String(runNumber).padStart(4, "0")}__task-${task.taskId}__ref-${task.ref}__${timestamp}`;

const runSh = (task) => {
  if (task.mixed) {
    return `#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cat <<INFO
Admin GUI validation server command:
  cd "$REPO_ROOT" && VITE_API_MODE=http VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api pnpm --filter @community-map/admin dev --host 127.0.0.1 --port 5173

Admin URL:
  http://127.0.0.1:5173/

CLI static check:
  node "$SCRIPT_DIR/tests/test_cli_admin_public_launch.mjs"

GUI MCP runbook:
  $SCRIPT_DIR/tests/gui_runbook_admin_public_launch.md
INFO
`;
  }

  if (task.gui) {
    return `#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"
PUBLIC_LAUNCH_OUTPUT_DIR="$SCRIPT_DIR/outputs" ${task.command} >"$SCRIPT_DIR/logs/run.log" 2>&1

cat <<INFO
GUI-only true-device validation bundle prepared.
This script validates the runbook only; device execution is human-owned.

Runbook:
  $SCRIPT_DIR/tests/gui_runbook_true_device_public_launch.md
INFO
`;
  }

  const evidenceEnv =
    task.ref === "R12"
      ? 'PUBLIC_LAUNCH_EVIDENCE_FILE="$SCRIPT_DIR/inputs/evidence-collector.json" '
      : "";

  return `#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/outputs"
PUBLIC_LAUNCH_OUTPUT_DIR="$SCRIPT_DIR/outputs" ${evidenceEnv}${task.command} >"$SCRIPT_DIR/logs/run.log" 2>&1
cat "$SCRIPT_DIR/logs/run.log"
`;
};

const runBat = (task) => {
  if (task.mixed) {
    return `@echo off
setlocal
set SCRIPT_DIR=%~dp0
echo Admin GUI validation server command:
echo   cd /d "%SCRIPT_DIR%..\\..\\.." ^&^& set VITE_API_MODE=http ^&^& set VITE_API_BASE_URL=https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api ^&^& pnpm --filter @community-map/admin dev --host 127.0.0.1 --port 5173
echo Admin URL: http://127.0.0.1:5173/
echo CLI static check: node "%SCRIPT_DIR%tests\\test_cli_admin_public_launch.mjs"
echo GUI MCP runbook: "%SCRIPT_DIR%tests\\gui_runbook_admin_public_launch.md"
endlocal
`;
  }

  return `@echo off
setlocal
set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\\..\\..
cd /d "%REPO_ROOT%"
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"
if not exist "%SCRIPT_DIR%outputs" mkdir "%SCRIPT_DIR%outputs"
set PUBLIC_LAUNCH_OUTPUT_DIR=%SCRIPT_DIR%outputs
${task.ref === "R12" ? "set PUBLIC_LAUNCH_EVIDENCE_FILE=%SCRIPT_DIR%inputs\\evidence-collector.json" : ""}
${task.command} > "%SCRIPT_DIR%logs\\run.log" 2>&1
set COMMAND_STATUS=%ERRORLEVEL%
type "%SCRIPT_DIR%logs\\run.log"
endlocal & exit /b %COMMAND_STATUS%
`;
};

const taskMd = (task, folder, runNumber) => `# ${task.title}

change-id: \`${changeId}\`
run: \`${String(runNumber).padStart(4, "0")}\`
task-id: \`${task.taskId}\`
ref-id: \`${task.ref}\`
SCOPE: ${task.scope}

## How to run

macOS/Linux:

\`\`\`bash
./run.sh
\`\`\`

Windows:

\`\`\`bat
run.bat
\`\`\`

## Test inputs

${task.inputs ? "Inputs are documented under `inputs/` and/or the referenced docs/templates." : "No external input file is required."}

## Test outputs

- Logs: \`logs/run.log\`
- Machine-readable outputs: \`outputs/*.json\`
- Expected criteria: \`expected/result.json\`

## Expected results

- The command exits 0.
- Required docs, config, scripts, or tests exist.
- Machine-readable output has \`"status": "pass"\`.
- Human-owned work is collected as evidence pointers and is not marked complete by automation.

${task.scope.includes("GUI") ? "GUI evidence MUST be collected through the MCP/human runbook under `tests/`; no executable browser automation is included." : ""}

Folder: \`${folder}\`
`;

const expected = (task) => ({
  changeId,
  taskId: task.taskId,
  refId: task.ref,
  expectedStatus: "pass",
  scope: task.scope
});

const cliTest = (task) => `#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(here, "../../../..");
const outputs = path.resolve(here, "../outputs");
${task.ref === "R12" ? 'const evidenceFile = path.resolve(here, "../inputs/evidence-collector.json");' : ""}
const result = spawnSync("${task.command.split(" ")[0]}", ${JSON.stringify(task.command.split(" ").slice(1))}, {
  cwd: repoRoot,
  env: {
    ...process.env,
    PUBLIC_LAUNCH_OUTPUT_DIR: outputs,
    ${task.ref === "R12" ? "PUBLIC_LAUNCH_EVIDENCE_FILE: evidenceFile" : ""}
  },
  stdio: "inherit"
});
process.exit(result.status ?? 1);
`;

const guiRunbook = (task) => {
  if (task.taskId === "3.3") {
    return `# Admin Public Launch GUI Runbook

Use the hosted Admin URL or local start-server command printed by \`run.sh\`.

MCP steps:

1. Open the Admin URL.
2. Confirm the app does not load mock client data before login.
3. Log in with the production Admin operator account supplied outside the repository.
4. Capture evidence for Events, Places, Posts, Files, Announcements, and Logs route refresh.
5. Record API target, operator user id, role flags, screenshots, result, and blocker owner for any failure.
`;
  }

  return readTrueDeviceRunbook();
};

const readTrueDeviceRunbook = () => `# True-Device Public Launch GUI Runbook

Use \`docs/public-launch-true-device-runbook.md\`.

Human/MCP evidence collection must record iOS and Android device model, OS, WeChat version, package version, screenshots/log pointers, result, and owner notes. No browser automation script is provided because this is true-device WeChat validation.
`;

selectedTasks.forEach((task, index) => {
  const runNumber = firstRunNumber + index;
  const folder = runFolderName(task, runNumber);
  const dir = path.join(root, folder);
  mkdirSync(dir, { recursive: true });
  for (const subdir of ["logs", "outputs", "expected", "tests"]) {
    mkdirSync(path.join(dir, subdir), { recursive: true });
  }
  if (task.inputs) {
    mkdirSync(path.join(dir, "inputs"), { recursive: true });
    writeFileSync(
      path.join(dir, "inputs", "README.md"),
      `Inputs are repository docs/templates referenced by task ${task.taskId}.\n`
    );
    if (task.ref === "R12") {
      writeFileSync(
        path.join(dir, "inputs", "evidence-collector.json"),
        readFileSync(
          path.join(
            repoRoot,
            "docs/public-launch-evidence-collector.template.json"
          ),
          "utf8"
        )
      );
    }
  }
  writeFileSync(path.join(dir, "task.md"), taskMd(task, folder, runNumber));
  writeFileSync(path.join(dir, "run.sh"), runSh(task), { mode: 0o755 });
  writeFileSync(path.join(dir, "run.bat"), runBat(task));
  writeFileSync(
    path.join(dir, "expected", "result.json"),
    `${JSON.stringify(expected(task), null, 2)}\n`
  );
  writeFileSync(
    path.join(dir, "tests", `test_cli_${task.ref.toLowerCase()}.mjs`),
    cliTest(task),
    {
      mode: 0o755
    }
  );
  if (task.mixed) {
    writeFileSync(
      path.join(dir, "tests", "test_cli_admin_public_launch.mjs"),
      cliTest(task),
      {
        mode: 0o755
      }
    );
    writeFileSync(
      path.join(dir, "tests", "gui_runbook_admin_public_launch.md"),
      guiRunbook(task)
    );
  }
  if (task.gui) {
    writeFileSync(
      path.join(dir, "tests", "gui_runbook_true_device_public_launch.md"),
      guiRunbook(task)
    );
  }
});

console.log(`Created ${selectedTasks.length} validation bundles under ${root}`);
