import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://claudiaroussel2.github.io",
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
});
