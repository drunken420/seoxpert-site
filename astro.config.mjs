import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fluidPx from './scripts/fluid-px.mjs';

export default defineConfig({
  site: 'https://seoxpert.my',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { inlineStylesheets: 'always' },
  // px sizes become rem so the pages can grow on screens wider than 1920px (see scripts/fluid-px.mjs)
  vite: { css: { postcss: { plugins: [fluidPx()] } } },
});
