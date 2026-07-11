import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(repoRoot, path), "utf8");
const assertions = [];
const check = (name, passed, details = "") => {
  assertions.push({ name, passed, details });
};

const runbookPath = "docs/mobile-bilingual-operations-and-release.md";
const runbook = await read(runbookPath);
const ui = await read("docs/ui-guidelines.md");
const apiManual = await read("docs/API接口使用手册.md");
const apiInventory = await read("docs/已实现API接口清单.md");
const releaseManual = await read("docs/mini-program-public-launch-manual.md");
const openapi = await read("docs/openapi/community-map-api.openapi.yaml");
const entities = await read("packages/shared/src/schemas/entities.ts");
const eventInput = await read("packages/shared/src/schemas/events.ts");
const pages = JSON.parse(await read("apps/mobile/src/pages.json"));
const navigation = await read("apps/mobile/src/i18n/navigation.ts");

for (const topic of [
  "Locale precedence",
  "Formal content fallback",
  "UGC boundary",
  "API compatibility",
  "Admin repair flow",
  "Export provenance",
  "Dry-run-first backfill",
  "Build、验收与 release evidence",
  "Rollout 与 rollback order",
  "Security and assumptions"
]) {
  check(`runbook topic: ${topic}`, runbook.includes(topic));
}

for (const command of [
  "build:h5",
  "build:mp-weixin",
  "bilingual-content-audit.ts",
  "bilingual-content-migration.ts",
  "--approved-plan-digest"
]) {
  check(`documented command: ${command}`, runbook.includes(command));
}

check("TDesign requirement retained", ui.includes("TDesign MiniProgram"));
check("central catalog UI guidance", ui.includes("中央 Mobile catalog"));
check(
  "release manual requires real candidate audit",
  releaseManual.includes("production-candidate") &&
    releaseManual.includes("releaseEligible=true")
);
check(
  "Event canonical addresses documented",
  apiManual.includes("`address_zh` / `address_en`") &&
    apiInventory.includes("legacy read compatibility")
);
check(
  "Notification bilingual compatibility documented",
  apiManual.includes("`title_zh` / `title_en`") &&
    apiInventory.includes("legacy `title/body`")
);

for (const field of ["address_zh", "address_en"]) {
  check(`OpenAPI Event ${field}`, openapi.includes(`${field}:`));
  check(`Event input source ${field}`, eventInput.includes(`${field}: true`));
}
for (const field of ["title_zh", "title_en", "body_zh", "body_en"]) {
  check(`OpenAPI Notification ${field}`, openapi.includes(`${field}:`));
  check(`Notification source ${field}`, entities.includes(`${field}:`));
}
check(
  "address_text marked compatibility-only",
  openapi.includes("Legacy read compatibility only") &&
    runbook.includes("legacy read compatibility")
);

const pagePaths = pages.pages.map((page) => page.path);
const missingRoutes = pagePaths.filter(
  (path) => !navigation.includes(`"${path}"`)
);
check(
  "every pages.json route has centralized metadata",
  missingRoutes.length === 0,
  missingRoutes.join(", ")
);
check(
  "runbook names pages.json acceptance inventory",
  runbook.includes("apps/mobile/src/pages.json")
);

const links = [...runbook.matchAll(/\]\((\.\/[^)#]+)(?:#[^)]+)?\)/g)].map(
  (match) => match[1]
);
for (const link of links) {
  const target = resolve(repoRoot, dirname(runbookPath), link);
  let exists = true;
  try {
    await access(target);
  } catch {
    exists = false;
  }
  check(`link exists: ${link}`, exists);
}

const secretPatterns = [
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}/,
  /API_ADMIN_PASSWORD_SCRYPT\s*=\s*[^<'"\s][^\s]*/
];
check(
  "no embedded secret material",
  secretPatterns.every((pattern) => !pattern.test(runbook))
);

const failed = assertions.filter((assertion) => !assertion.passed);
const result = {
  result: failed.length === 0 ? "PASS" : "FAIL",
  assertions: assertions.length,
  failed: failed.length,
  routeCount: pagePaths.length,
  checks: assertions
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (failed.length > 0) process.exitCode = 1;
