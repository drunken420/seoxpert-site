import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://seoxpert.my',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
});
