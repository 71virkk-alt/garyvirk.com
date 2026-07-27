import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://garyvirk.com",
  srcDir: "./_site-src",
  publicDir: "./_site-public",
  outDir: "./.site-dist",
  output: "static",
  build: {
    format: "file",
    assets: "assets/build",
    inlineStylesheets: "auto"
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
