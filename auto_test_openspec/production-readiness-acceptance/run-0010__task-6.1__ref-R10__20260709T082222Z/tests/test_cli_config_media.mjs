import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(runDir, "../../..");
const outputsDir = path.join(runDir, "outputs");
const expected = JSON.parse(
  fs.readFileSync(path.join(runDir, "expected", "assertions.json"), "utf8")
);
fs.mkdirSync(outputsDir, { recursive: true });

const buildRoot = path.join(repoRoot, "apps/mobile/dist/build/mp-weixin");
const configDocPath = path.join(repoRoot, "docs/production-preview-config.md");
const identityDocPath = path.join(repoRoot, "docs/production-acceptance-identity.md");
const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else {
      files.push(full);
    }
  }
};
walk(buildRoot);

const artifactText = files
  .filter((file) => /\.(js|json|wxml|wxss|svg|txt)$/.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
const configDoc = fs.readFileSync(configDocPath, "utf8");
const identityDoc = fs.readFileSync(identityDocPath, "utf8");

const forbiddenFixtureMedia = "https://example.com/public/events/";
const localPatterns = [
  "http://localhost",
  "https://localhost",
  "http://127.0.0.1",
  "https://127.0.0.1",
  "http://192.168.",
  "http://10."
];
const assertions = [];
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
  assertions.push(message);
};

assert(
  !artifactText.includes(forbiddenFixtureMedia),
  "mp_build_has_no_forbidden_fixture_event_media"
);
assert(
  !localPatterns.some((pattern) => artifactText.includes(pattern)),
  "mp_build_has_no_localhost_or_lan_api"
);
assert(
  artifactText.includes("https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api") &&
    artifactText.includes("community-map-api"),
  "mp_build_has_cloudbase_target"
);
assert(
  configDoc.includes("apps/mobile/dist/build/mp-weixin"),
  "devtools_import_path_documented"
);
assert(
  configDoc.includes("TENCENT_MAP_KEY") &&
    configDoc.includes("TENCENT_MAP_SECRET_KEY") &&
    configDoc.includes("AMAP_WEB_SERVICE_KEY") &&
    configDoc.includes("must not be exposed as frontend `VITE_` variables"),
  "map_keys_documented_as_server_side"
);
assert(
  configDoc.includes("WeChat Mini Program legal domains") &&
    configDoc.includes("Blocker for public launch"),
  "legal_domains_blocker_documented"
);
assert(
  configDoc.includes("Remaining Platform Dependencies") &&
    identityDoc.includes("Public launch remains blocked"),
  "platform_dependencies_listed"
);

for (const required of expected.required) {
  assert(assertions.includes(required), `expected_assertion_recorded:${required}`);
}

const result = {
  ok: true,
  assertions,
  scannedFileCount: files.length,
  forbiddenFixtureMedia,
  localPatterns,
  docs: {
    config: path.relative(repoRoot, configDocPath),
    identity: path.relative(repoRoot, identityDocPath)
  }
};
fs.writeFileSync(
  path.join(outputsDir, "config-media-scan.json"),
  `${JSON.stringify(result, null, 2)}\n`
);
console.log(JSON.stringify(result, null, 2));
