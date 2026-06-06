// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Deploy target detection:
// - DEPLOY_TARGET=vercel or VERCEL=1  → Nitro vercel preset (.vercel/output)
// - DEPLOY_TARGET=netlify or NETLIFY=true → Nitro netlify preset (.netlify/functions-internal + dist)
// - otherwise → Lovable default (Cloudflare)
const isVercel =
  process.env.DEPLOY_TARGET === "vercel" || process.env.VERCEL === "1";
const isNetlify =
  process.env.DEPLOY_TARGET === "netlify" || process.env.NETLIFY === "true";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  ...(isVercel
    ? { nitro: { preset: "vercel" } }
    : isNetlify
    ? { nitro: { preset: "netlify" } }
    : {}),
});
