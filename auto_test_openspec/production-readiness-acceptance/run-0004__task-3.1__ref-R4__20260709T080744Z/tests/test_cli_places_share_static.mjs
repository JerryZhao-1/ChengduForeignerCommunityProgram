import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(runDir, "../../..");
const outputsDir = path.join(runDir, "outputs");
fs.mkdirSync(outputsDir, { recursive: true });

const sourcePath = path.join(repoRoot, "apps/mobile/src/pages/places/detail.vue");
const copyPath = path.join(repoRoot, "apps/mobile/src/pages/places/copy.ts");
const wxmlPath = path.join(
  repoRoot,
  "apps/mobile/dist/build/mp-weixin/pages/places/detail.wxml"
);
const jsPath = path.join(
  repoRoot,
  "apps/mobile/dist/build/mp-weixin/pages/places/detail.js"
);

const source = fs.readFileSync(sourcePath, "utf8");
const copy = fs.readFileSync(copyPath, "utf8");
const wxml = fs.readFileSync(wxmlPath, "utf8");
const compiledJs = fs.readFileSync(jsPath, "utf8");
const shareHandler = source.slice(
  source.indexOf("const shareCurrentPlace"),
  source.indexOf("const copyCurrentPlaceLink")
);

const assertions = {
  sourceRegistersNativeShare:
    source.includes("onShareAppMessage") && source.includes("onShareTimeline"),
  sourceSplitsMpAndCopyFallback:
    source.includes("<!-- #ifdef MP-WEIXIN -->") &&
    source.includes("open-type=\"share\"") &&
    source.includes("copyCurrentPlaceLink"),
  shareHandlerDoesNotCopyClipboard: !shareHandler.includes("setClipboardData"),
  copyFallbackIsExplicitlyLabelled:
    copy.includes("shareCopyEntry: \"复制链接\"") &&
    copy.includes("shareCopyEntry: \"Copy link\""),
  mpBuildHasNativeShareButton: wxml.includes("open-type=\"share\""),
  mpBuildRegistersShareHooks:
    compiledJs.includes("onShareAppMessage") &&
    compiledJs.includes("onShareTimeline"),
  mpBuildDoesNotCopyClipboardOnPlacesDetail:
    !compiledJs.includes("setClipboardData")
};

const failed = Object.entries(assertions)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const result = {
  ok: failed.length === 0,
  assertions,
  failed,
  inspected: {
    source: path.relative(repoRoot, sourcePath),
    copy: path.relative(repoRoot, copyPath),
    wxml: path.relative(repoRoot, wxmlPath),
    compiledJs: path.relative(repoRoot, jsPath)
  }
};

fs.writeFileSync(
  path.join(outputsDir, "static-share-check.json"),
  `${JSON.stringify(result, null, 2)}\n`
);

if (failed.length > 0) {
  throw new Error(`Places share static checks failed: ${failed.join(", ")}`);
}

console.log(JSON.stringify(result, null, 2));
