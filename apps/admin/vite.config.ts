import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@community-map/shared": fileURLToPath(
        new URL("../../packages/shared/src/index.ts", import.meta.url)
      ),
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: ["@community-map/shared"]
  },
  server: {
    port: 5173
  }
});
