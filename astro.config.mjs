import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fluidPx from './scripts/fluid-px.mjs';
import { posts } from './src/data/blog.ts';
import { updated } from './src/data/updated.ts';
import pictures from './src/data/pictures.json' with { type: 'json' };

// Sitemap extras for Google: each guide's date, and the picture shown on each page.
const SITE = 'https://seoxpert.my';
const extras = {};
// a guide's last real update (or its first date), and every main page's date from src/data/updated.ts (2026-11-18: only guides had one)
for (const p of posts) extras[`${SITE}/blog/${p.slug}/`] = { lastmod: p.updated || p.date, img: [{ url: `${SITE}/img/guide-${p.slug}.webp` }] };
for (const [path, day] of Object.entries(updated)) extras[`${SITE}${path}`] = { ...extras[`${SITE}${path}`], lastmod: day };
for (const [page, pic] of Object.entries(pictures)) extras[`${SITE}/${page}/`] = { ...extras[`${SITE}/${page}/`], img: [{ url: `${SITE}/img/${pic.file}.webp` }] };

export default defineConfig({
  site: SITE,
  integrations: [sitemap({ filter: (page) => !/\/(404|paid)\//.test(page) && !page.endsWith('/404'), serialize: (item) => ({ ...item, ...extras[item.url] }) })],
  build: { inlineStylesheets: 'always', assets: 'f' },
  // px sizes become rem so the pages can grow on screens wider than 1920px (see scripts/fluid-px.mjs)
  vite: { css: { postcss: { plugins: [fluidPx()] } } },
});
