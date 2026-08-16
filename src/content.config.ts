import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "**/*.mdx", "!README.md"],
    base: "./blog",
  }),
  schema: z.object({
    title: z.string().optional(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = { blog };
