import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const work = defineCollection({
  loader: glob({
    base: "./_site-src/content/work",
    pattern: "**/*.{md,mdx}"
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(["draft", "published"]),
    featured: z.boolean().default(false),
    labCase: z.boolean().default(true),
    environment: z.array(z.string()),
    updatedAt: z.coerce.date()
  })
});

export const collections = { work };
