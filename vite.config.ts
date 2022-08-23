import { join as pathJoin } from "path"
import * as ejs from "ejs"
import type { Plugin, ResolvedConfig } from "vite"
import { defineConfig, splitVendorChunkPlugin } from "vite"
import { resolve } from "path"
import vue from "@vitejs/plugin-vue"

const htmlPlugin = (): Plugin => {
  let config: ResolvedConfig | undefined
  return {
    name: "vite-plugin-ejs-html",
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    transformIndexHtml(html) {
      return ejs.render(html, { ...config.env, path: { join: pathJoin } })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), splitVendorChunkPlugin(), htmlPlugin()],
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
