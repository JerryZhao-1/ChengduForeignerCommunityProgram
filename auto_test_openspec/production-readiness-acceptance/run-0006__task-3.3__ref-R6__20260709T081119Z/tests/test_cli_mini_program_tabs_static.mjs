import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(runDir, "../../..");
const outputsDir = path.join(runDir, "outputs");
fs.mkdirSync(outputsDir, { recursive: true });

const buildRoot = path.join(repoRoot, "apps/mobile/dist/build/mp-weixin");
const appJsonPath = path.join(buildRoot, "app.json");
const projectConfigPath = path.join(buildRoot, "project.config.json");
const envPath = path.join(buildRoot, "config/env.js");
const clientPath = path.join(buildRoot, "api/client.js");

const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, "utf8"));
const envJs = fs.readFileSync(envPath, "utf8");
const clientJs = fs.readFileSync(clientPath, "utf8");

const expectedTabs = [
  ["Home", "pages/home/index"],
  ["Events", "pages/events/index"],
  ["Discover", "pages/discover/index"],
  ["Places", "pages/places/map"],
  ["Me", "pages/more/index"]
];
const actualTabs = appJson.tabBar?.list?.map((item) => [item.text, item.pagePath]);
const assertions = {
  projectConfigExists: fs.existsSync(projectConfigPath),
  projectConfigHasAppId: typeof projectConfig.appid === "string",
  tabBarHasFiveTabs: Array.isArray(actualTabs) && actualTabs.length === 5,
  tabBarMatchesRequiredTabs: expectedTabs.every(([text, pagePath], index) => {
    const actual = actualTabs?.[index];
    return actual?.[0] === text && actual?.[1] === pagePath;
  }),
  pagesExistForTabs: expectedTabs.every(([, pagePath]) =>
    appJson.pages.includes(pagePath)
  ),
  cloudbaseFunctionModeConfigured:
    envJs.includes("https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api") &&
    envJs.includes("cloud1-d7gxdk8t43bd639c0") &&
    envJs.includes("community-map-api") &&
    clientJs.includes("callHTTPFunction"),
  cloudbaseClientUsesCallHTTPFunction: clientJs.includes("callHTTPFunction"),
  noLocalhostApiInMpArtifacts:
    !envJs.includes("127.0.0.1") &&
    !envJs.includes("localhost") &&
    !clientJs.includes("127.0.0.1") &&
    !clientJs.includes("localhost")
};

const failed = Object.entries(assertions)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);
const result = {
  ok: failed.length === 0,
  assertions,
  failed,
  canonicalImportPath: path.relative(repoRoot, buildRoot),
  tabBar: actualTabs,
  inspected: {
    appJson: path.relative(repoRoot, appJsonPath),
    projectConfig: path.relative(repoRoot, projectConfigPath),
    env: path.relative(repoRoot, envPath),
    client: path.relative(repoRoot, clientPath)
  }
};

fs.writeFileSync(
  path.join(outputsDir, "static-tabs-check.json"),
  `${JSON.stringify(result, null, 2)}\n`
);

if (failed.length > 0) {
  throw new Error(`Mini Program tabs static checks failed: ${failed.join(", ")}`);
}

console.log(JSON.stringify(result, null, 2));
