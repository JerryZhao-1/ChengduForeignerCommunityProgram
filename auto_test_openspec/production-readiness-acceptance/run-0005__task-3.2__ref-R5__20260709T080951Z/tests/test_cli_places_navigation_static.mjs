import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(runDir, "../../..");
const outputsDir = path.join(runDir, "outputs");
fs.mkdirSync(outputsDir, { recursive: true });

const navigationPath = path.join(repoRoot, "apps/mobile/src/pages/places/navigation.ts");
const detailPath = path.join(repoRoot, "apps/mobile/src/pages/places/detail.vue");
const mapPath = path.join(repoRoot, "apps/mobile/src/pages/places/map.vue");
const specPath = path.join(repoRoot, "apps/mobile/src/pages/places/navigation.spec.ts");

const navigation = fs.readFileSync(navigationPath, "utf8");
const detail = fs.readFileSync(detailPath, "utf8");
const map = fs.readFileSync(mapPath, "utf8");
const spec = fs.readFileSync(specPath, "utf8");

const assertions = {
  validatesCoordinates: navigation.includes("hasValidPlaceNavigationTarget"),
  usesNativeOpenLocation: navigation.includes("uni.openLocation"),
  showsFailureToast: navigation.includes("fail: () =>") && navigation.includes("feedback.failed"),
  detailUsesNavigationHelper:
    detail.includes("buildPlaceDetailNavigationTarget") &&
    detail.includes("openPlaceNativeNavigation"),
  mapUsesNavigationHelper:
    map.includes("buildPlaceMarkerNavigationTarget") &&
    map.includes("openPlaceNativeNavigation"),
  mapFocusesDetailSelection:
    detail.includes("PLACE_MAP_FOCUS_STORAGE_KEY") &&
    map.includes("consumePendingFocusPlace"),
  testsFailureFallback:
    spec.includes("shows recoverable feedback when native navigation fails") &&
    spec.includes("does not open native navigation for invalid targets")
};

const failed = Object.entries(assertions)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);
const result = {
  ok: failed.length === 0,
  assertions,
  failed,
  inspected: {
    navigation: path.relative(repoRoot, navigationPath),
    detail: path.relative(repoRoot, detailPath),
    map: path.relative(repoRoot, mapPath),
    spec: path.relative(repoRoot, specPath)
  }
};

fs.writeFileSync(
  path.join(outputsDir, "static-navigation-check.json"),
  `${JSON.stringify(result, null, 2)}\n`
);

if (failed.length > 0) {
  throw new Error(`Places navigation static checks failed: ${failed.join(", ")}`);
}

console.log(JSON.stringify(result, null, 2));
