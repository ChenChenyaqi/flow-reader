import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import manifest from "./src/manifest.json";

export default defineConfig({
  plugins: [vue(), crx({ manifest }), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174,
    },
  },
});
