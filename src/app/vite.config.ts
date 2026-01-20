import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@itsme/design-system": resolve(
        __dirname,
        "../packages/design-system/src",
      ),
      "@itsme/shared-utils": resolve(__dirname, "../packages/shared-utils/src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    middlewareMode: false,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
  },
});
