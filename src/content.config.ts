import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    week: z.number().optional(),
    title: z.string().optional(),
    startDate: z.string().optional(),
    summary: z.string().optional(),
    date: z.date().or(z.string()).optional(),
  }),
});

const investigations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/investigations' }),
  schema: z.object({
    title: z.string().optional(),
    difficulty: z.string().optional(),
    category: z.string().optional(),
    date: z.date().or(z.string()).optional(),
    summary: z.string().optional(),
    tools: z.array(z.string()).optional(),
    published: z.boolean().optional(),
  }).optional(),
});

export const collections = { journal, investigations };
