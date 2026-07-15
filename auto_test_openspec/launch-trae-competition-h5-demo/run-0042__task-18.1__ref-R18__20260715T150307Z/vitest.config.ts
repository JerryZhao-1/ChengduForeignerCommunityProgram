import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "auto_test_openspec/launch-trae-competition-h5-demo/run-0042__task-18.1__ref-R18__20260715T150307Z/tests/compare-fingerprint.spec.ts"
    ]
  }
});
