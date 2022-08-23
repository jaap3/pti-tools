import { defineConfig, splitVendorChunkPlugin } from "vite"
import { resolve } from "path"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), splitVendorChunkPlugin()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
})
