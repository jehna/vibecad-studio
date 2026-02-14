import { defineConfig, type Plugin } from "vite";
import reactPlugin from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

import { VitePWA } from "vite-plugin-pwa";

function modelHmrPlugin(): Plugin {
  return {
    name: "model-hmr",
    handleHotUpdate(ctx) {
      if (
        ctx.file.includes("/models/") &&
        ctx.file.endsWith("model.ts")
      ) {
        const slug = ctx.file.match(/\/models\/([^/]+)\//)?.[1];
        ctx.server.ws.send({
          type: "custom",
          event: "model-update",
          data: { slug },
        });
        return [];
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    modelHmrPlugin(),
    reactPlugin(),
    tailwindcss(),
    VitePWA({
      manifest: {
        short_name: "VibeCad Studio",
        name: "VibeCad Studio - A CAD modeling workbench",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#4f46e5",
        background_color: "#ffffff",
      },
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "fonts/*",
        "textures/*",
      ],
      workbox: {
        cacheId: "vibecad-studio",
        globPatterns: [
          "assets/**.{js,css,html,jpg,wasm}",
          "*.{svg,png,jpg,ico}",
          "*.html",
          "manifest.webmanifest",
        ],
        maximumFileSizeToCacheInBytes: 2000000000,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: { exclude: ["replicad"] },
  build: {
    outDir: "dist",
  },
  server: {
    port: 5555,
  },
});
