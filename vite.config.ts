// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

const rev = String(Date.now());

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "prompt",
        injectRegister: null,
        manifest: false,
        filename: "sw.js",
        outDir: "dist/client",
        devOptions: { enabled: false },
        workbox: {
          globDirectory: "dist/client",
          globPatterns: ["**/*.{js,css,webp,png,svg,woff2,otf,ico,mp3}"],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          // Updates apply only when the user taps «تحديث بيانات التطبيق».
          clientsClaim: false,
          skipWaiting: false,
          // App shell HTML for offline boot of every screen.
          additionalManifestEntries: [
            { url: "/", revision: rev },
            { url: "/login", revision: rev },
            { url: "/manifest.webmanifest", revision: rev },
          ],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: {
                cacheName: "jaib-pages",
                networkTimeoutSeconds: 3,
                plugins: [
                  {
                    handlerDidError: async () =>
                      (await caches.match("/", { ignoreSearch: true })) ?? Response.error(),
                  },
                ],
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/__l5e/assets-v1/"),
              handler: "CacheFirst",
              options: { cacheName: "jaib-media", cacheableResponse: { statuses: [0, 200] } },
            },
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
              handler: "CacheFirst",
              options: { cacheName: "jaib-fonts", cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 40 } },
            },
          ],
        },
      }),
    ],
  },
});
