#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const outputDir = process.env.PUBLIC_LAUNCH_OUTPUT_DIR
  ? path.resolve(process.env.PUBLIC_LAUNCH_OUTPUT_DIR)
  : path.join(process.cwd(), "outputs");

const selectedTarget = {
  cloudbaseEnvId: "cloud1-d7gxdk8t43bd639c0",
  cloudFunctionName: "community-map-api",
  apiBaseUrl: "https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api",
  adminUrl: "https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com/",
  miniProgramBuildPath: "apps/mobile/dist/build/mp-weixin",
  appId: "wx7518a3c1fcdd39a5"
};

const decisionStates = [
  "blocked",
  "ready for WeChat review upload",
  "ready for review submission",
  "ready for phased release",
  "ready for full public release"
];

const fail = (message, details = {}) => {
  throw Object.assign(new Error(message), { details });
};

const read = (relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8");

const ensureOutputDir = () => mkdirSync(outputDir, { recursive: true });

const writeReport = (name, report) => {
  ensureOutputDir();
  const file = path.join(outputDir, `${name}.json`);
  writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ report: file, status: report.status }, null, 2));
};

const assertIncludes = (content, terms, label) => {
  const missing = terms.filter((term) => !content.includes(term));
  if (missing.length > 0) {
    fail(`${label} is missing required terms.`, { missing });
  }
};

const listFiles = (root) => {
  if (!existsSync(root)) {
    return [];
  }
  const entries = readdirSync(root);
  return entries.flatMap((entry) => {
    const absolute = path.join(root, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      return listFiles(absolute);
    }
    return [absolute];
  });
};

const isTextFile = (file) =>
  /\.(js|json|wxml|wxss|html|css|txt|map|vue|ts|md)$/i.test(file);

const expandStaticStringJoins = (content) =>
  content.replace(
    /\[((?:"(?:\\.|[^"\\])*"\s*(?:,\s*"(?:\\.|[^"\\])*"\s*)*))\]\.join\(\s*("(?:\\.|[^"\\])*")\s*\)/g,
    (match, rawValues, rawSeparator) => {
      try {
        const values = JSON.parse(`[${rawValues}]`);
        const separator = JSON.parse(rawSeparator);
        return Array.isArray(values) &&
          values.every((value) => typeof value === "string") &&
          typeof separator === "string"
          ? values.join(separator)
          : match;
      } catch {
        return match;
      }
    }
  );

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, ...options.env },
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit"
  });

  if (result.status !== 0) {
    fail(`Command failed: ${command} ${args.join(" ")}`, {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr
    });
  }

  return result;
};

const buildMiniProgram = () =>
  run("pnpm", ["--filter", "@community-map/mobile", "build:mp-weixin"], {
    env: {
      VITE_API_MODE: "cloudbase-function",
      VITE_CLOUDBASE_ENV_ID: selectedTarget.cloudbaseEnvId,
      VITE_CLOUDBASE_FUNCTION_NAME: selectedTarget.cloudFunctionName
    }
  });

const buildAdmin = () =>
  run("pnpm", ["--filter", "@community-map/admin", "build"], {
    env: {
      VITE_API_MODE: "http",
      VITE_API_BASE_URL: selectedTarget.apiBaseUrl
    }
  });

const scanArtifacts = (roots) => {
  const forbidden = [
    {
      id: "localhost",
      pattern: /https?:\/\/localhost(?::\d+)?(?=[/?#"'`\s,;)}\]]|$)/
    },
    {
      id: "127.0.0.1",
      pattern: /https?:\/\/127\.0\.0\.1(?::\d+)?(?=[/?#"'`\s,;)}\]]|$)/
    },
    {
      id: "lan-ip-endpoint",
      pattern: /https?:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/
    },
    { id: "mock-header", pattern: /x-mock-user-id/ },
    { id: "mock-actor-env", pattern: /VITE_MOCK_ACTOR_ID|mock_user_id/ },
    { id: "fixture-event-media", pattern: /example\.com\/public\/events/ }
  ];
  const matches = [];

  for (const root of roots) {
    for (const file of listFiles(path.join(repoRoot, root)).filter(
      isTextFile
    )) {
      const content = readFileSync(file, "utf8");
      const expandedContent = expandStaticStringJoins(content);
      for (const rule of forbidden) {
        if (rule.pattern.test(expandedContent)) {
          matches.push({
            rule: rule.id,
            file: path.relative(repoRoot, file)
          });
        }
      }
    }
  }

  return matches;
};

const commands = {
  ownership() {
    const doc = read("docs/public-launch-ownership-matrix.md");
    assertIncludes(
      doc,
      [
        "Codex-owned",
        "Human-owned",
        "Mixed",
        "owner role",
        "required evidence",
        "blocker severity",
        "decision state gated",
        ...decisionStates
      ],
      "ownership matrix"
    );
    if (/Human-owned[^\n|]*\|[^\n|]*(complete|done)/i.test(doc)) {
      fail(
        "Human-owned launch work cannot be marked complete without evidence."
      );
    }
    writeReport("ownership-matrix", {
      status: "pass",
      checked: "docs/public-launch-ownership-matrix.md"
    });
  },

  manual() {
    const doc = read("docs/mini-program-public-launch-manual.md");
    assertIncludes(
      doc,
      [
        "WeChat account preparation",
        "certification",
        "filing",
        "service category",
        "privacy",
        "request domain",
        "upload domain",
        "download domain",
        "media domain",
        "CloudBase console",
        "map key",
        "true-device",
        "review upload",
        "review submission",
        "phased release",
        "full release",
        "rollback",
        "post-release monitoring",
        "Evidence:"
      ],
      "manual"
    );
    writeReport("manual", {
      status: "pass",
      checked: "docs/mini-program-public-launch-manual.md"
    });
  },

  "handoff-template"() {
    const doc = read("docs/public-launch-handoff-template.md");
    assertIncludes(
      doc,
      [
        "Decision state: <select exactly one>",
        ...decisionStates,
        "evidence links",
        "blocker owner",
        "historical or production-like evidence",
        "production-readiness-acceptance"
      ],
      "handoff template"
    );
    writeReport("handoff-template", {
      status: "pass",
      checked: "docs/public-launch-handoff-template.md"
    });
  },

  "public-review-config"() {
    if (!process.argv.includes("--skip-build")) {
      buildMiniProgram();
    }
    const packageRoot = selectedTarget.miniProgramBuildPath;
    const matches = scanArtifacts([packageRoot]);
    const packageFiles = listFiles(path.join(repoRoot, packageRoot)).filter(
      isTextFile
    );
    const joined = packageFiles
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    const requiredTargetTerms = [
      selectedTarget.cloudbaseEnvId,
      selectedTarget.cloudFunctionName
    ];
    const missingTargetTerms = requiredTargetTerms.filter(
      (term) => !joined.includes(term)
    );
    if (matches.length > 0 || missingTargetTerms.length > 0) {
      fail("Public-review Mini Program build is not launch-clean.", {
        matches,
        missingTargetTerms
      });
    }
    writeReport("public-review-config", {
      status: "pass",
      buildCommand:
        "VITE_API_MODE=cloudbase-function VITE_CLOUDBASE_ENV_ID=cloud1-d7gxdk8t43bd639c0 VITE_CLOUDBASE_FUNCTION_NAME=community-map-api pnpm --filter @community-map/mobile build:mp-weixin",
      outputPath: packageRoot,
      appId: selectedTarget.appId,
      cloudbaseEnvId: selectedTarget.cloudbaseEnvId,
      functionName: selectedTarget.cloudFunctionName
    });
  },

  "artifact-scan"() {
    if (process.argv.includes("--build")) {
      buildMiniProgram();
      buildAdmin();
    }
    const roots = [
      selectedTarget.miniProgramBuildPath,
      "apps/admin/dist"
    ].filter((root) => existsSync(path.join(repoRoot, root)));
    const matches = scanArtifacts(roots);
    if (matches.length > 0) {
      fail("Forbidden production artifact matches found.", { matches });
    }
    writeReport("artifact-scan", { status: "pass", roots, matches });
  },

  "upload-paths"() {
    const projectConfig = JSON.parse(read("project.config.json"));
    const manual = read("docs/mini-program-public-launch-manual.md");
    const preview = read("docs/production-preview-config.md");
    const miniprogramRoot = projectConfig.miniprogramRoot;
    if (miniprogramRoot !== "apps/mobile/dist/dev/mp-weixin/") {
      fail("project.config.json development root changed unexpectedly.", {
        miniprogramRoot
      });
    }
    assertIncludes(
      `${manual}\n${preview}`,
      [
        selectedTarget.miniProgramBuildPath,
        "project.config.json is development-only",
        "not the public-review upload path"
      ],
      "upload path docs"
    );
    writeReport("upload-paths", {
      status: "pass",
      developmentProjectConfigRoot: miniprogramRoot,
      publicReviewPath: selectedTarget.miniProgramBuildPath
    });
  },

  "admin-auth"() {
    run("pnpm", [
      "exec",
      "vitest",
      "run",
      "apps/api/test/admin-public-launch-auth.spec.ts"
    ]);
    writeReport("admin-auth", {
      status: "pass",
      test: "apps/api/test/admin-public-launch-auth.spec.ts",
      coverage: [
        "live-mode mock-header rejection",
        "Bearer route authorization",
        "CloudBase live durable Admin role resolution"
      ]
    });
  },

  "cloudbase-readiness"() {
    const matrix = read("docs/public-launch-ownership-matrix.md");
    const manual = read("docs/mini-program-public-launch-manual.md");
    assertIncludes(
      `${matrix}\n${manual}`,
      [
        selectedTarget.cloudbaseEnvId,
        selectedTarget.cloudFunctionName,
        selectedTarget.apiBaseUrl,
        "CLOUDBASE_PROVIDER_MODE=live",
        "database collections",
        "indexes",
        "security rules",
        "storage domains",
        "Human-owned"
      ],
      "CloudBase readiness docs"
    );
    writeReport("cloudbase-readiness", {
      status: "pass",
      selectedTarget,
      humanOwnedBlockers: [
        "WeChat legal domains",
        "CloudBase console security rules",
        "storage domain approval"
      ]
    });
  },

  "hosted-admin-target"() {
    if (process.argv.includes("--build")) {
      buildAdmin();
    }
    const matches = scanArtifacts(["apps/admin/dist"]);
    if (matches.length > 0) {
      fail("Hosted Admin bundle has forbidden target matches.", { matches });
    }
    const bundleFiles = listFiles(
      path.join(repoRoot, "apps/admin/dist")
    ).filter(isTextFile);
    const joined = bundleFiles
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    if (!joined.includes(selectedTarget.apiBaseUrl)) {
      fail(
        "Hosted Admin bundle does not include the selected launch API base.",
        {
          expected: selectedTarget.apiBaseUrl
        }
      );
    }
    writeReport("hosted-admin-target", {
      status: "pass",
      adminUrl: selectedTarget.adminUrl,
      apiBaseUrl: selectedTarget.apiBaseUrl
    });
  },

  "content-media-audit"() {
    const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
    const inputPath = inputArg
      ? path.resolve(inputArg.slice("--input=".length))
      : path.join(repoRoot, "docs/public-launch-content-audit-sample.json");
    const input = JSON.parse(readFileSync(inputPath, "utf8"));
    const blockingIssues = [];
    const editorialItems = [];
    const forbiddenUrl =
      /(localhost|127\.0\.0\.1|example\.com\/public\/events|https?:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.))/;

    const auditRecord = (collection, record) => {
      for (const [field, value] of Object.entries(record)) {
        if (typeof value === "string" && forbiddenUrl.test(value)) {
          blockingIssues.push({ collection, id: record._id, field, value });
        }
        if (Array.isArray(value)) {
          value
            .filter(
              (item) => typeof item === "string" && forbiddenUrl.test(item)
            )
            .forEach((item) => {
              blockingIssues.push({
                collection,
                id: record._id,
                field,
                value: item
              });
            });
        }
      }
      if (record.status === "draft" || record.publish_status === "draft") {
        blockingIssues.push({
          collection,
          id: record._id,
          field: "status",
          value: "draft leakage"
        });
      }
      for (const field of ["name_zh", "name_en", "title_zh", "title_en"]) {
        if (field in record && !record[field]) {
          blockingIssues.push({
            collection,
            id: record._id,
            field,
            value: "missing bilingual launch field"
          });
        }
      }
      if (record.external_media_url && !record.media_attribution) {
        editorialItems.push({
          collection,
          id: record._id,
          field: "media_attribution",
          value: "missing attribution review"
        });
      }
    };

    for (const [collection, records] of Object.entries(input)) {
      if (Array.isArray(records)) {
        records.forEach((record) => auditRecord(collection, record));
      }
    }

    const report = {
      status: blockingIssues.length === 0 ? "pass" : "fail",
      input: inputPath,
      blockingIssues,
      editorialItems
    };
    writeReport("content-media-audit", report);
    if (blockingIssues.length > 0) {
      fail("Content/media audit found blocking issues.", report);
    }
  },

  "evidence-collector"() {
    const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
    const inputPath = inputArg
      ? path.resolve(inputArg.slice("--input=".length))
      : process.env.PUBLIC_LAUNCH_EVIDENCE_FILE
        ? path.resolve(process.env.PUBLIC_LAUNCH_EVIDENCE_FILE)
        : path.join(
            repoRoot,
            "docs/public-launch-evidence-collector.template.json"
          );
    const evidence = JSON.parse(readFileSync(inputPath, "utf8"));
    const required = [
      "wechatAccount",
      "privacy",
      "domains",
      "cloudbase",
      "codeUpload",
      "reviewSubmission",
      "releaseDecision"
    ];
    const missing = required.filter((field) => !(field in evidence));
    if (missing.length > 0) {
      fail("Evidence collector template is missing required sections.", {
        missing
      });
    }
    const completedWithoutEvidence = [];
    for (const field of required) {
      const section = evidence[field];
      if (!section || typeof section !== "object" || Array.isArray(section)) {
        fail("Evidence collector section must be an object.", { field });
      }
      const completedStatuses = Object.entries(section)
        .filter(([key, value]) => /status$/i.test(key) && value === "complete")
        .map(([key]) => key);
      const pointers = section.evidencePointers;
      if (
        completedStatuses.length > 0 &&
        (!Array.isArray(pointers) || pointers.length === 0)
      ) {
        completedWithoutEvidence.push({ field, completedStatuses });
      }
    }
    if (completedWithoutEvidence.length > 0) {
      fail("Evidence collector marks complete without evidence pointers.", {
        completedWithoutEvidence
      });
    }
    const serialized = JSON.stringify(evidence);
    if (
      /"status"\s*:\s*"complete"/.test(serialized) &&
      !/"evidencePointers"\s*:\s*\[[^\]]+"/.test(serialized)
    ) {
      fail("Evidence collector marks complete without evidence pointers.");
    }
    writeReport("evidence-collector", {
      status: "pass",
      checked: path.relative(repoRoot, inputPath)
    });
  },

  "true-device-runbook"() {
    const runbook = read("docs/public-launch-true-device-runbook.md");
    assertIncludes(
      runbook,
      [
        "iOS",
        "Android",
        "Home",
        "Events",
        "Discover",
        "Places",
        "Me",
        "CloudBase calls",
        "legal-domain behavior",
        "map",
        "media loading",
        "upload",
        "location permission fallback",
        "sharing",
        "ticket",
        "report",
        "Admin governance",
        "WeChat version",
        "screenshots",
        "result"
      ],
      "true-device runbook"
    );
    writeReport("true-device-runbook", {
      status: "pass",
      checked: "docs/public-launch-true-device-runbook.md"
    });
  },

  "final-gate"() {
    const commandsToRun = [
      ["pnpm", ["typecheck"]],
      ["pnpm", ["test"]],
      ["pnpm", ["lint"]],
      ["pnpm", ["--filter", "@community-map/admin", "build"]],
      ["pnpm", ["--filter", "@community-map/mobile", "build:mp-weixin"]],
      [
        "openspec",
        [
          "validate",
          "production-public-launch-closure",
          "--strict",
          "--no-interactive"
        ]
      ]
    ];
    const summaries = [];
    for (const [command, args] of commandsToRun) {
      const env = args.includes("build:mp-weixin")
        ? {
            VITE_API_MODE: "cloudbase-function",
            VITE_CLOUDBASE_ENV_ID: selectedTarget.cloudbaseEnvId,
            VITE_CLOUDBASE_FUNCTION_NAME: selectedTarget.cloudFunctionName
          }
        : args.includes("build")
          ? {
              VITE_API_MODE: "http",
              VITE_API_BASE_URL: selectedTarget.apiBaseUrl
            }
          : {};
      const result = run(command, args, { env, capture: true });
      summaries.push({
        command: `${command} ${args.join(" ")}`,
        status: result.status
      });
    }
    const matches = scanArtifacts([
      selectedTarget.miniProgramBuildPath,
      "apps/admin/dist"
    ]);
    if (matches.length > 0) {
      fail("Final gate artifact scan failed.", { matches });
    }
    writeReport("final-gate", { status: "pass", summaries });
  },

  "final-handoff"() {
    const doc = read("docs/public-launch-final-handoff-2026-07-09.md");
    const selected = decisionStates.filter((state) =>
      new RegExp(`Decision state:\\s*${state}`, "i").test(doc)
    );
    if (selected.length !== 1) {
      fail("Final handoff must declare exactly one decision state.", {
        selected
      });
    }
    assertIncludes(
      doc,
      [
        "ownership matrix",
        "Codex gates",
        "human evidence",
        "true-device",
        "Admin auth",
        "CloudBase target",
        "domain/account",
        "content/media audit",
        "rollback",
        "monitoring",
        "historical or production-like evidence",
        "production-readiness-acceptance"
      ],
      "final handoff"
    );
    writeReport("final-handoff", {
      status: "pass",
      selectedDecisionState: selected[0]
    });
  }
};

const command = process.argv[2];
if (!command || !(command in commands)) {
  console.error(
    `Usage: node scripts/public_launch_verify.mjs <${Object.keys(commands).join("|")}>`
  );
  process.exit(2);
}

try {
  commands[command]();
} catch (error) {
  ensureOutputDir();
  const report = {
    status: "fail",
    command,
    message: error instanceof Error ? error.message : String(error),
    details: error?.details ?? {}
  };
  writeFileSync(
    path.join(outputDir, `${command}.failure.json`),
    `${JSON.stringify(report, null, 2)}\n`
  );
  console.error(report.message);
  process.exit(1);
}
