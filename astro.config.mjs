import { defineConfig } from "astro/config";
import {
  blogMedia,
  rehypeCallouts,
  rehypeFigures,
  remarkEmbeds,
  remarkLocalMedia,
} from "./src/lib/blog-markdown.js";

export default defineConfig({
  site: "https://claudiaroussel2.github.io",
  integrations: [blogMedia()],
  markdown: {
    remarkPlugins: [remarkLocalMedia, remarkEmbeds],
    rehypePlugins: [rehypeFigures, rehypeCallouts],
    shikiConfig: {
      theme: "github-light",
    },
  },
});
