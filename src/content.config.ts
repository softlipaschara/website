import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Media keys are relative to PUBLIC_MEDIA_BASE, for example
// projects/<slug>/<media-id>/<media-id>-720.mp4.
const mediaItem = z.object({
  id: z.string(),
  type: z.enum(['video', 'image']),
  src: z.string(),
  poster: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  controls: z.boolean().default(false),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
  muted: z.boolean().default(false),
  playsinline: z.boolean().default(true),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  aspectRatio: z.string().optional(),
  renditions: z
    .object({
      '480': z.string().optional(),
      '720': z.string().optional(),
    })
    .optional(),
});

const cover = z.object({
  src: z.string(),
  alt: z.string(),
  type: z.enum(['image', 'video']).default('image'),
  poster: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  aspectRatio: z.string().optional(),
});

const thumbnail = z.object({
  src: z.string(),
  alt: z.string(),
  type: z.enum(['image', 'video']).default('image'),
  poster: z.string().optional(),
  class: z.string().optional(),
  id: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    tools: z.array(z.string()).default([]),
    cover: cover.optional(),
    thumbnail: thumbnail.optional(),
    media: z.array(mediaItem).default([]),
    draft: z.boolean().default(false),
    homeSection: z.enum(['selectedWorks', 'prototype', 'whatsMore']).optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { projects };
