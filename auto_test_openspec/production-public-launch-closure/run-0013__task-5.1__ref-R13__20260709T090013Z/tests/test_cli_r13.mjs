#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(here, "../../../..");
const outputs = path.resolve(here, "../outputs");
const result = spawnSync("node", ["scripts/public_launch_verify.mjs","final-gate"], {
  cwd: repoRoot,
  env: { ...process.env, PUBLIC_LAUNCH_OUTPUT_DIR: outputs },
  stdio: "inherit"
});
process.exit(result.status ?? 1);
