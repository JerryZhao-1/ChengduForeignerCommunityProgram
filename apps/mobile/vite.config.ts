import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import uniPlugin from "@dcloudio/vite-plugin-uni";

const resolvedUniPlugin =
  typeof uniPlugin === "function"
    ? uniPlugin
    : (uniPlugin as { default: () => unknown }).default;

export default defineConfig({
  plugins: [resolvedUniPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: ["@community-map/shared"]
  },
  server: {
    port: 5174
  }
});
