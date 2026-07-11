import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "packages/**/*.spec.ts",
      "apps/**/*.spec.ts",
      "scripts/**/*.spec.ts"
    ]
  }
});
