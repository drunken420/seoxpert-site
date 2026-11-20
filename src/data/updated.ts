// "Last updated" date for each main page (Suhen's website standards: AI search tools and Google like a clear, true date).
// Shown under the breadcrumbs on inner pages and sent as dateModified in the page's structured data (Base.astro).
// RULE: when you change a page's words, set its date here to the day it goes live. Never move a date without a real change.
// Guides keep their own dates in src/data/blog.ts. First filled from the Git history on 2026-11-17.
export const updated: Record<string, string> = {
  '/': '2026-11-19',
  '/about/': '2026-11-19',
  '/ai-seo-advisor/': '2026-11-19',
  '/ai-seo-services-malaysia/': '2026-11-19',
  '/case-studies/': '2026-11-19',
  '/contact/': '2026-11-19',
  '/demos/': '2026-11-19',
  '/faq/': '2026-11-19',
  '/packages/': '2026-11-19',
  '/seo-audit-malaysia/': '2026-11-19',
  '/seo-packages-malaysia/': '2026-11-19',
  '/seo-services-malaysia/': '2026-11-19',
  '/web-app-development-malaysia/': '2026-11-19',
  '/website-design/': '2026-11-19',
  '/website-development/': '2026-11-19',
  '/website-maintenance/': '2026-11-19',
  '/website-report-dashboard/': '2026-11-19',
  '/seo-tools/': '2026-11-19',
  '/blog/': '2026-11-19',
};

// What kind of page it is, for structured data (default WebPage).
export const pageType: Record<string, string> = {
  '/about/': 'AboutPage',
  '/contact/': 'ContactPage',
  '/case-studies/': 'CollectionPage',
  '/blog/': 'CollectionPage',
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const niceDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${months[m - 1]} ${y}`; };
