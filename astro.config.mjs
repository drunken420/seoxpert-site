import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fluidPx from './scripts/fluid-px.mjs';
import { posts } from './src/data/blog.ts';
import pictures from './src/data/pictures.json' with { type: 'json' };

// Sitemap extras for Google: each guide's date, and the picture shown on each page.
const SITE = 'https://seoxpert.my';
const extras = {};
for (const p of posts) extras[`${SITE}/blog/${p.slug}/`] = { lastmod: p.date, img: [{ url: `${SITE}/img/guide-${p.slug}.webp` }] };
for (const [page, pic] of Object.entries(pictures)) extras[`${SITE}/${page}/`] = { ...extras[`${SITE}/${page}/`], img: [{ url: `${SITE}/img/${pic.file}.webp` }] };

export default defineConfig({
  site: SITE,
  integrations: [sitemap({ filter: (page) => !page.includes('/404'), serialize: (item) => ({ ...item, ...extras[item.url] }) })],
  build: { inlineStylesheets: 'always' },
  // px sizes become rem so the pages can grow on screens wider than 1920px (see scripts/fluid-px.mjs)
  vite: { css: { postcss: { plugins: [fluidPx()] } } },
});
