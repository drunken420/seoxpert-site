// Packages and prices, in one place. Every page that shows a price reads it from here.
// Prices come from Suhen (2026-11). Never change a number here without asking.
export interface Tier { id: string; name: string; rm: number; usd: number; for: string; rows: string[]; short: string; free?: string; hot?: boolean }

export const fmt = (t: Tier, cur: 'RM' | 'USD' = 'RM') => (cur === 'RM' ? 'RM' + t.rm.toLocaleString('en-US') : '$' + t.usd.toLocaleString('en-US'));

/** Launch offer: free hosting and XpertCare with every build, until this date (inclusive). */
export const offer = { ends: '2027-04-30', endsText: '30 April 2027', title: 'Free high speed hosting and XpertCare with every website.', text: '1 month with Starter, 2 with Business, 4 with Growth.' };
export const offerOn = () => new Date() < new Date('2027-05-01T00:00:00+08:00');

export const build = {
  key: 'build', label: 'XpertForge website build', unit: 'once', allTitle: 'In every XpertForge build',
  all: ['A blog, on top of your pages', 'Copywriting included', 'Google SEO + AI search optimisation', 'Full keyword research with XpertCore', 'WhatsApp button + contact'],
  tiers: [
    { id: 'starter', name: 'XpertForge Starter', rm: 499, usd: 129, for: 'For a first website', short: 'Up to 5 pages, plus a blog with 2 posts', rows: ['Up to <b>5 pages</b>', 'Plus a blog with <b>2 posts</b> at launch', '<b>2</b> revision rounds'], free: '1 month of XpertCare Basic free' },
    { id: 'business', name: 'XpertForge Business', rm: 999, usd: 249, for: 'For a growing business', hot: true, short: 'Up to 10 pages, plus a blog with 5 posts', rows: ['Up to <b>10 pages</b>', 'Plus a blog with <b>5 posts</b> at launch', '<b>3</b> revision rounds'], free: '2 months of XpertCare Plus free' },
    { id: 'growth', name: 'XpertForge Growth', rm: 1799, usd: 449, for: 'For a bigger website', short: 'Up to 20 pages, plus a blog with 10 posts', rows: ['Up to <b>20 pages</b>', 'Plus a blog with <b>10 posts</b> at launch', '<b>3</b> revision rounds'], free: '4 months of XpertCare Pro free' },
  ] as Tier[],
};

/** XpertCare paid yearly: 12 months for the price of 10 (Suhen, 2026-11-11). */
export const yearly = { pay: 10, free: 2, text: '2 months free' };
export const fmtYear = (t: Tier, cur: 'RM' | 'USD' = 'RM') => (cur === 'RM' ? 'RM' + (t.rm * yearly.pay).toLocaleString('en-US') : '$' + (t.usd * yearly.pay).toLocaleString('en-US'));

export const care = {
  key: 'care', label: 'XpertCare monthly', unit: 'a month', allTitle: 'In every XpertCare plan',
  all: ['High speed hosting included', 'Pay yearly, get 2 months free', 'Backups', 'Uptime watch', 'Security', 'Issue checks every few days, with fixes', 'Pages optimised for keywords not ranking yet', 'Google + AI visibility report every month'],
  tiers: [
    { id: 'basic', name: 'XpertCare Basic', rm: 55, usd: 15, for: 'Keep it healthy', short: '3 text or photo changes, 1 new blog post a month, 5 keywords tracked weekly', rows: ['<b>3</b> text or photo changes', '<b>1</b> new blog post a month', '<b>5</b> keywords tracked weekly'] },
    { id: 'plus', name: 'XpertCare Plus', rm: 99, usd: 25, for: 'Keep it growing', hot: true, short: '10 text or photo changes, 2 new blog posts a month, 10 keywords tracked weekly', rows: ['<b>10</b> text or photo changes', '<b>2</b> new blog posts a month', '<b>10</b> keywords tracked weekly'] },
    { id: 'pro', name: 'XpertCare Pro', rm: 150, usd: 39, for: 'Grow faster', short: 'Up to 20 small changes, 4 new blog posts a month, 20 keywords tracked weekly', rows: ['Up to <b>20</b> small changes', '<b>4</b> new blog posts a month', '<b>20</b> keywords tracked weekly'] },
  ] as Tier[],
};

/** Structured data: the same names and RM prices people see on the page. */
export const offersLd = (set: typeof build | typeof care) =>
  set.tiers.map((t) => ({ '@type': 'Offer', name: t.name, price: t.rm, priceCurrency: 'MYR', description: t.short }));
