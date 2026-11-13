// Packages and prices, in one place. Every page that shows a price reads it from here.
// Prices come from Suhen (2026-11). Never change a number here without asking.
export interface Tier { id: string; name: string; rm: number; usd: number; /** price from 1 February 2027 (Suhen picked the moderate rise, 2026-11-12) */ rmNew: number; usdNew: number; for: string; rows: string[]; short: string; free?: string; hot?: boolean }


/** Launch offer: free hosting and XpertCare with every build, until this date (inclusive). */
export const offer = { ends: '2027-01-31', endsText: '31 January 2027', title: 'Free high speed hosting and XpertCare with every website.', text: '1 month with Starter, 2 with Business, 4 with Growth.' };
export const offerOn = () => new Date() < new Date('2027-02-01T00:00:00+08:00');

/** Prices: today's launch prices until the offer ends, then the new prices (both from Suhen; never change without asking).
    The site is built before it goes up, so the new prices appear at the first site update from 1 February 2027. */
const now = (t: Tier) => (offerOn() ? { rm: t.rm, usd: t.usd } : { rm: t.rmNew, usd: t.usdNew });
const money = (n: number, cur: 'RM' | 'USD') => (cur === 'RM' ? 'RM' : '$') + n.toLocaleString('en-US');
export const fmt = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money(cur === 'RM' ? now(t).rm : now(t).usd, cur);
/** The price after the launch offer, shown crossed out while the offer runs. */
export const fmtNew = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money(cur === 'RM' ? t.rmNew : t.usdNew, cur);
export const rmNow = (t: Tier) => now(t).rm;

export const build = {
  key: 'build', label: 'XpertForge website build', unit: 'once', allTitle: 'In every XpertForge build',
  all: ['Your own blog, with posts written for you', 'Highly rankable content, written for you', 'Google SEO + AI search optimisation', 'Full keyword research with XpertCore', 'WhatsApp button + contact'],
  tiers: [
    { id: 'starter', name: 'XpertForge Starter', rm: 499, usd: 129, rmNew: 799, usdNew: 199, for: 'For a first website', short: 'Up to 5 pages, plus a blog with 2 posts', rows: ['Up to <b>5 pages</b>', 'Plus a blog with <b>2 posts</b> at launch', '<b>2</b> revision rounds'], free: '1 month of XpertCare Basic free' },
    { id: 'business', name: 'XpertForge Business', rm: 999, usd: 249, rmNew: 1499, usdNew: 379, for: 'For a growing business', hot: true, short: 'Up to 10 pages, plus a blog with 5 posts', rows: ['Up to <b>10 pages</b>', 'Plus a blog with <b>5 posts</b> at launch', '<b>3</b> revision rounds'], free: '2 months of XpertCare Plus free' },
    { id: 'growth', name: 'XpertForge Growth', rm: 1799, usd: 449, rmNew: 2499, usdNew: 629, for: 'For a bigger website', short: 'Up to 20 pages, plus a blog with 10 posts', rows: ['Up to <b>20 pages</b>', 'Plus a blog with <b>10 posts</b> at launch', '<b>3</b> revision rounds'], free: '4 months of XpertCare Pro free' },
  ] as Tier[],
};

/** XpertCare paid yearly: 12 months for the price of 10 (Suhen, 2026-11-11). */
export const yearly = { pay: 10, free: 2, text: '2 months free' };
export const fmtYear = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money((cur === 'RM' ? now(t).rm : now(t).usd) * yearly.pay, cur);
export const fmtYearNew = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money((cur === 'RM' ? t.rmNew : t.usdNew) * yearly.pay, cur);

export const care = {
  key: 'care', label: 'XpertCare monthly', unit: 'a month', allTitle: 'In every XpertCare plan',
  all: ['High speed hosting included', 'Pay yearly, get 2 months free', 'Backups', 'Uptime watch', 'Security', 'Active checks every few days, with fixes', 'SEO + AI search (LLM) optimisation when needed', 'XpertInsight live report dashboard + monthly XpertRecap PDF'],
  tiers: [
    { id: 'basic', name: 'XpertCare Basic', rm: 55, usd: 15, rmNew: 69, usdNew: 18, for: 'Keep it healthy', short: '2 text or photo changes, 1 new blog post a month, 5 keywords tracked weekly', rows: ['<b>2</b> text or photo changes', '<b>1</b> new blog post a month', '<b>5</b> keywords tracked weekly'] },
    { id: 'plus', name: 'XpertCare Plus', rm: 99, usd: 25, rmNew: 129, usdNew: 33, for: 'Keep it growing', hot: true, short: '4 text or photo changes, 2 new blog posts a month, 10 keywords tracked weekly', rows: ['<b>4</b> text or photo changes', '<b>2</b> new blog posts a month', '<b>10</b> keywords tracked weekly'] },
    { id: 'pro', name: 'XpertCare Pro', rm: 150, usd: 39, rmNew: 199, usdNew: 49, for: 'Grow faster', short: '6 text or photo changes, 4 new blog posts a month, 20 keywords tracked weekly', rows: ['<b>6</b> text or photo changes', '<b>4</b> new blog posts a month', '<b>20</b> keywords tracked weekly'] },
    // Elite: Suhen agreed 2026-11-13 (RM249 now, RM329 from 1 Feb 2027). USD is Claude's draft.
    { id: 'elite', name: 'XpertCare Elite', rm: 249, usd: 65, rmNew: 329, usdNew: 85, for: 'Our biggest plan', short: '10 text or photo changes, 6 new blog posts a month, 50 keywords tracked weekly', rows: ['<b>10</b> text or photo changes', '<b>6</b> new blog posts a month', '<b>50</b> keywords tracked weekly'] },
  ] as Tier[],
};

/** Structured data: the same names and RM prices people see on the page. */
export const offersLd = (set: typeof build | typeof care) =>
  set.tiers.map((t) => ({ '@type': 'Offer', name: t.name, price: now(t).rm, priceCurrency: 'MYR', description: t.short }));
