import vue from "@vitejs/plugin-vue"
import * as ejs from "ejs"
import * as path from "path"
import type { Plugin, ResolvedConfig } from "vite"
import { defineConfig, splitVendorChunkPlugin } from "vite"

const htmlPlugin = (): Plugin => {
  let config: ResolvedConfig | undefined
  return {
    name: "vite-plugin-ejs-html",
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    transformIndexHtml(html) {
      return ejs.render(html, { ...config.env, path: { join: path.join } })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: "terser",
  },
  plugins: [vue(), splitVendorChunkPlugin(), htmlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
})
