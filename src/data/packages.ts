// Packages and prices, in one place. Every page that shows a price reads it from here.
// Prices come from Suhen (2026-11). Never change a number here without asking.
export interface Tier { id: string; name: string; rm: number; usd: number; /** price from 1 February 2027 (Suhen picked the moderate rise, 2026-11-12) */ rmNew: number; usdNew: number; for: string; rows: string[]; short: string; free?: string; hot?: boolean }


/** Launch offer: 1 year of free hosting and free XpertRank with every build, until this date (inclusive). Suhen 2026-11-13. */
export const offer = { ends: '2027-01-31', endsText: '31 January 2027', title: '1 year of free high speed cloud hosting, plus free XpertRank, with every website.', text: 'Every website gets 1 year of free high speed cloud hosting. Starter also gets the 14 day XpertRank Trial, Business 2 months of XpertRank Basic and Growth 4 months of XpertRank Plus.' };
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
  key: 'build', label: 'XpertForge website build', unit: '', allTitle: 'In every XpertForge build',
  all: ['Your own blog, with posts written for you', 'Highly rankable content, written for you', 'Google SEO + AI search optimisation', 'Full keyword research with XpertCore', 'WhatsApp button + contact'],
  tiers: [
    { id: 'starter', name: 'XpertForge Starter', rm: 499, usd: 129, rmNew: 799, usdNew: 199, for: 'For a first website', short: 'Up to 5 pages, plus a blog with 2 posts', rows: ['Up to <b>5 pages</b>', 'Plus a blog with <b>2 posts</b> at launch', '<b>2</b> revision rounds'], free: '14 day XpertRank Trial free, plus 1 year of free hosting' },
    { id: 'business', name: 'XpertForge Business', rm: 999, usd: 249, rmNew: 1499, usdNew: 379, for: 'For a growing business', hot: true, short: 'Up to 10 pages, plus a blog with 5 posts', rows: ['Up to <b>10 pages</b>', 'Plus a blog with <b>5 posts</b> at launch', '<b>3</b> revision rounds'], free: '2 months of XpertRank Basic free, plus 1 year of free hosting' },
    { id: 'growth', name: 'XpertForge Growth', rm: 1799, usd: 449, rmNew: 2499, usdNew: 629, for: 'For a bigger website', short: 'Up to 20 pages, plus a blog with 10 posts', rows: ['Up to <b>20 pages</b>', 'Plus a blog with <b>10 posts</b> at launch', '<b>3</b> revision rounds'], free: '4 months of XpertRank Plus free, plus 1 year of free hosting' },
  ] as Tier[],
};

/** XpertRank paid yearly: 12 months for the price of 10 (Suhen, 2026-11-11). */
export const yearly = { pay: 10, free: 2, text: '2 months free' };
export const fmtYear = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money((cur === 'RM' ? now(t).rm : now(t).usd) * yearly.pay, cur);
export const fmtYearNew = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money((cur === 'RM' ? t.rmNew : t.usdNew) * yearly.pay, cur);

export const care = {
  key: 'care', label: 'XpertRank monthly', unit: 'a month', allTitle: 'In every XpertRank plan',
  all: ['High speed cloud hosting included', 'Pay yearly, get 2 months free', 'Backups', 'Uptime watch', 'Security', 'Active checks every few days, with fixes', 'SEO + AI search (LLM) optimisation when needed', 'XpertInsight live report dashboard, data refreshed every day', 'Monthly XpertRecap PDF'],
  tiers: [
    { id: 'basic', name: 'XpertRank Basic', rm: 99, usd: 24, rmNew: 199, usdNew: 49, for: 'Keep it healthy', short: '2 text or photo changes, 1 new blog post a month, 10 keywords tracked weekly, 5 AI answer questions checked monthly', rows: ['<b>2</b> text or photo changes', '<b>1</b> new blog post a month', '<b>10</b> keywords tracked weekly', '<b>5</b> AI answer questions checked monthly', 'Site check of up to <b>50</b> pages weekly', 'Refresh your dashboard <b>every week</b>', 'Keyword results in <b>about 1 to 5 minutes</b>'] },
    { id: 'plus', name: 'XpertRank Plus', rm: 199, usd: 47, rmNew: 399, usdNew: 95, for: 'Keep it growing', hot: true, short: '4 text or photo changes, 2 new blog posts a month, 25 keywords tracked weekly, 10 AI answer questions checked monthly', rows: ['<b>4</b> text or photo changes', '<b>2</b> new blog posts a month', '<b>25</b> keywords tracked weekly', '<b>10</b> AI answer questions checked monthly', 'Site check of up to <b>100</b> pages weekly', 'Refresh your dashboard <b>twice a week</b>', 'Keyword results in <b>about 1 to 5 minutes</b>'] },
    { id: 'pro', name: 'XpertRank Pro', rm: 349, usd: 83, rmNew: 699, usdNew: 169, for: 'Grow faster', short: '6 text or photo changes, 4 new blog posts a month, 50 keywords tracked weekly, 20 AI answer questions checked monthly', rows: ['<b>6</b> text or photo changes', '<b>4</b> new blog posts a month', '<b>50</b> keywords tracked weekly', '<b>20</b> AI answer questions checked monthly', 'Site check of up to <b>200</b> pages weekly', 'Refresh your dashboard <b>every day</b>', 'Keyword results in <b>under a minute</b>'] },
    // Plan limits raised by Suhen 2026-11-15 (match lib/plans.js in xpertinsight). Care prices raised by Suhen 2026-11-15: RM99/199/349/599 now, about double from 1 Feb 2027: RM199/399/699/1,199. USD is Claude's draft.
    { id: 'elite', name: 'XpertRank Elite', rm: 599, usd: 143, rmNew: 1199, usdNew: 289, for: 'Our biggest plan', short: '10 text or photo changes, 8 new blog posts a month, 100 keywords tracked weekly, 30 AI answer questions checked monthly', rows: ['<b>10</b> text or photo changes', '<b>8</b> new blog posts a month', '<b>100</b> keywords tracked weekly', '<b>30</b> AI answer questions checked monthly', 'Site check of up to <b>300</b> pages weekly', 'Refresh your dashboard <b>every day</b>', 'Keyword results in <b>under a minute</b>'] },
  ] as Tier[],
};

/** XpertRank Trial: try XpertRank for 14 days (Suhen 2026-11-13: RM25 or US$5). The price after the launch offer is not decided; it stays RM25 until Suhen says otherwise. */
export const trial: Tier & { days: number } = { id: 'trial', name: 'XpertRank Trial', rm: 25, usd: 5, rmNew: 25, usdNew: 5, days: 14, for: 'Try XpertRank first', short: 'XpertRank for 14 days, with your own XpertInsight dashboard, 3 keywords tracked, a site check of up to 10 pages and 1 dashboard refresh. AI answer checks and the monthly PDF come with the paid plans', rows: ['<b>14 days</b> of XpertRank', 'Your own <b>XpertInsight</b> dashboard', '<b>3</b> keywords tracked', 'Site check of up to <b>10</b> pages', '<b>1</b> dashboard refresh', 'No AI answer checks or PDF download'] };

/** Structured data: the same names and RM prices people see on the page. */
export const offersLd = (set: typeof build | typeof care) =>
  (set.key === 'care' ? [trial, ...set.tiers] : set.tiers).map((t) => ({ '@type': 'Offer', name: t.name, price: now(t).rm, priceCurrency: 'MYR', description: t.short }));

/** Fills {{price:<tier id>}} in hand-written HTML (the homepage) with today's price, so prices are never typed twice. */
export const fillPrices = (html: string) =>
  html.replace(/\{\{price:(\w+)\}\}/g, (all, id) => { const t = [...build.tiers, ...care.tiers, trial].find((x) => x.id === id); if (!t) throw new Error('Unknown price ' + all); return fmt(t); });
