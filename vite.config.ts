import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index",
        autoSubfolderIndex: false,
      },
    },
  },
  vite: {
    build: {
      outDir: "dist",
    },
    environments: {
      client: {
        build: {
          outDir: "dist",
        },
      },
      ssr: {
        build: {
          outDir: "dist/server",
        },
      },
    },
  },
});
