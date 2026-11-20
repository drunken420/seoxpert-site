// Packages and prices, in one place. Every page that shows a price reads it from here.
// Prices come from Suhen (2026-11). Never change a number here without asking.
export interface Tier { id: string; name: string; rm: number; usd: number; /** price from 1 February 2027 (Suhen picked the moderate rise, 2026-11-12) */ rmNew: number; usdNew: number; for: string; rows: string[]; short: string; free?: string; /** why this one is worth it over the package below */ up?: string; /** what only bigger plans have, shown greyed with a lock (Suhen 2026-11-15) */ locked?: string[]; /** the smallest care plan says what every plan starts with, in the same slot (2026-11-16) */ start?: string; hot?: boolean; /** XpertRank target keywords, the main difference between the plans (Suhen 2026-11-16); keep matching lib/plans.js in xpertinsight */ kw?: number; /** XpertRank for a website built elsewhere: monthly price, no launch price (Suhen 2026-11-15) */ rmOther?: number; usdOther?: number; /** how long a build usually takes (Suhen 2026-11-19, usual times, not a promise) */ time?: string }


/** Launch offer: free months of XpertRank (Starter 1, Business 2, Growth 4; Suhen 2026-11-15) and 1 year of free hosting with every build, until this date (inclusive). */
export const offer = { ends: '2027-01-31', endsText: '31 January 2027', title: 'Free months of XpertRank with every website we build.', text: 'Every website we build gets 1 year of free high speed cloud hosting. Starter also gets 1 month of XpertRank Basic free, Business 2 months of XpertRank Basic and Growth 4 months of XpertRank Plus.' };
export const offerOn = () => new Date() < new Date('2027-02-01T00:00:00+08:00');

/** Prices: today's launch prices until the offer ends, then the new prices (both from Suhen; never change without asking).
    The site is built before it goes up, so the new prices appear at the first site update from 1 February 2027. */
const now = (t: Tier) => (offerOn() ? { rm: t.rm, usd: t.usd } : { rm: t.rmNew, usd: t.usdNew });
const money = (n: number, cur: 'RM' | 'USD') => (cur === 'RM' ? 'RM' : 'US$') + n.toLocaleString('en-US'); // US$, never a bare $ (2026-11-19 review)
export const fmt = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money(cur === 'RM' ? now(t).rm : now(t).usd, cur);
/** The price after the launch offer, shown crossed out while the offer runs. */
export const fmtNew = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money(cur === 'RM' ? t.rmNew : t.usdNew, cur);
export const rmNow = (t: Tier) => now(t).rm;
/** XpertRank for a website built elsewhere (Suhen 2026-11-15: one standard XpertRank, a higher price, no free hosting, no launch price).
    The money-back promise covers every paid XpertRank plan on websites we build; never websites built elsewhere, never the Trial (Suhen 2026-11-15). */
export const fmtOther = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money(cur === 'RM' ? t.rmOther ?? 0 : t.usdOther ?? 0, cur);
export const fmtYearOther = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money((cur === 'RM' ? t.rmOther ?? 0 : t.usdOther ?? 0) * yearly.pay, cur);
/** Step 1 of the plan picker for people who keep the website they have. */
export const own = { name: 'I already have a website', short: 'Keep your website. Add XpertRank to it.', rows: ['<b>Your own website</b>, built elsewhere', 'We check it, suggest improvements and make the fixes'] };

export const build = {
  key: 'build', label: 'XpertForge website build', unit: '', allTitle: 'In every XpertForge build',
  all: ['Your own blog, with posts written for you', 'Highly rankable content, written for you', 'Google SEO + AI search optimisation', 'Secure by design: no database or admin login to break into while we manage it with XpertRank, HTTPS on every page', 'Full keyword research with XpertCore, with a keyword plan for you', 'WhatsApp button + contact', 'Google Business Profile set up, so you show on Google Maps', 'Google Search Console and Analytics set up', 'A business email address on your domain, forwarded to your inbox', '30 days of free fixes after launch', 'Live help with your setup'],
  // Build prices raised and six extras added by Suhen 2026-11-15: RM799/1,499/2,499 now, RM1,199/1,999/2,999 from 1 Feb 2027 (Growth lowered from 3,499 by Suhen the same day). USD prices picked by Suhen 2026-11-15 (about RM4.45 to US$1, clean numbers).
  // `up` is the "why take the next package" line on each card (Suhen 2026-11-15). It must stay true for the launch and the later prices, in RM and USD.
  tiers: [
    // `time` = how long the build usually takes, counted from the day we have the client's details (Suhen 2026-11-19: "give realistic ones").
    { id: 'starter', name: 'XpertForge Starter', rm: 799, usd: 199, rmNew: 1199, usdNew: 279, time: '1 to 2 weeks', for: 'For a first website', start: 'A complete website with the six extras every build gets', short: '7 pages in total: up to 5 website pages and 2 blog posts', rows: ['<b>7 pages in total</b>', 'Up to <b>5</b> website pages and <b>2</b> blog posts at launch', '<b>2</b> revision rounds'], free: '1 month of XpertRank Basic free, plus 1 year of free high speed cloud hosting' },
    { id: 'business', name: 'XpertForge Business', rm: 1499, usd: 349, rmNew: 1999, usdNew: 449, time: '2 to 3 weeks', for: 'For a growing business', hot: true, up: 'Double the pages of Starter, at a lower price per page', short: '15 pages in total: up to 10 website pages and 5 blog posts', rows: ['<b>15 pages in total</b>', 'Up to <b>10</b> website pages and <b>5</b> blog posts at launch', '<b>3</b> revision rounds'], free: '2 months of XpertRank Basic free, plus 1 year of free high speed cloud hosting' },
    { id: 'growth', name: 'XpertForge Growth', rm: 2499, usd: 549, rmNew: 2999, usdNew: 699, time: '4 to 6 weeks', for: 'For a bigger website', up: 'Double the pages and blog posts of Business, at our lowest price per page', short: '30 pages in total: up to 20 website pages and 10 blog posts', rows: ['<b>30 pages in total</b>', 'Up to <b>20</b> website pages and <b>10</b> blog posts at launch', '<b>3</b> revision rounds'], free: '4 months of XpertRank Plus free, plus 1 year of free high speed cloud hosting' },
  ] as Tier[],
};

/** Buyer answers (Suhen 2026-11-19, after the customer review): build times, the domain name, hosting after year one, changes after launch,
    who owns what, and what happens after paying. One place, used by the FAQ (faq-more.ts), the package cards, /packages/, /website-design/,
    /paid/, llms.txt and the chat facts (chat-ai.js). Times are usual times, never a promise. "No admin login" is only ever about websites we
    build AND manage with XpertRank; a website we hand over gets a simple editing dashboard (with a login). */
const shortName = (t: Tier) => t.name.replace('XpertForge ', '');
const roundsOf = (t: Tier) => t.rows.join(' ').match(/<b>(\d+)<\/b> revision/)?.[1] ?? '';
const [bStarter, bBusiness, bGrowth] = build.tiers;
export const buyer = {
  /** "Starter usually takes 1 to 2 weeks, Business 2 to 3 weeks and Growth 4 to 6 weeks" */
  times: `${shortName(bStarter)} usually takes ${bStarter.time}, ${shortName(bBusiness)} ${bBusiness.time} and ${shortName(bGrowth)} ${bGrowth.time}`,
  from: 'counted from the day we have your details: your business information, your logo and photos (or we use good stock photos)',
  revision: 'Each revision round usually takes 2 to 3 working days once we have your feedback.',
  rounds: `${roundsOf(bStarter)} with ${shortName(bStarter)}, ${roundsOf(bBusiness)} with ${shortName(bBusiness)} and Growth`,
  bigger: 'For bigger websites, online shops, bookings and web apps, we agree the plan and the dates with you before we start.',
  domain: 'The domain name (your website address) is not included: you pay for it and you own it. Prices differ by name and ending, so we guide you to buy it in your own name, or we can buy it for you and transfer it to you.',
  hosting: offerOn() ? 'Free high speed cloud hosting comes with XpertRank, and with the launch offer for the first year.' : 'Free high speed cloud hosting comes with XpertRank.',
  handover: 'If you do not continue XpertRank, we hand your website over to the hosting of your choice, with a simple editing dashboard, and guide you through the move. The new hosting is at your own cost.',
  edits: 'With XpertRank, our team makes the changes for you. Without XpertRank, we hand your website over with a simple editing dashboard, so you can change your own content, on the hosting you prefer.',
  owner: 'Your content, your data and your domain name are yours. If you stop working with us, we hand over your website or web app so you can host it wherever you like.',
  /** What happens after paying for a website build, in order (the /packages/ list, /paid/ and the FAQ). */
  steps: [] as { t: string; d: string }[],
};
buyer.steps = [
  { t: 'We email you within one working day', d: 'Stripe emails your receipt straight away, and our team emails you within one working day to plan your website with you.' },
  { t: 'A short call or a simple form', d: 'You give us your details: your business information, your logo and your photos. No photos yet? We use good stock photos.' },
  { t: 'Your first draft', d: 'XpertCore, our own AI SEO advisor, guides the page plan and the words, and we design every page by hand.' },
  { t: 'Your revision rounds', d: `You check the design and the words, and we refine them in your revision rounds (${buyer.rounds}). ${buyer.revision}` },
  { t: 'Launch', d: 'Your website goes live with the Google and AI setup in place, and we set up the extras every build includes, like your Google Business Profile and your business email.' },
  { t: '30 days of free fixes', d: 'If anything needs fixing in the first 30 days after launch, we fix it for free.' },
];

/** XpertRank paid yearly: 12 months for the price of 10 (Suhen, 2026-11-11). */
export const yearly = { pay: 10, free: 2, text: '2 months free' };
export const fmtYear = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money((cur === 'RM' ? now(t).rm : now(t).usd) * yearly.pay, cur);
export const fmtYearNew = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money((cur === 'RM' ? t.rmNew : t.usdNew) * yearly.pay, cur);

export const care = {
  key: 'care', label: 'XpertRank expert SEO, monthly', unit: 'a month', allTitle: 'In every XpertRank plan',
  all: ['Keyword research and an SEO plan for your website', 'On-page and technical SEO, checked every few days, with fixes', 'SEO + AI search (LLM) optimisation when needed', 'A monthly or yearly subscription (pay yearly, get 2 months free) that you can cancel any time from your dashboard', 'Backups, uptime watch and security', 'XpertInsight live report dashboard, data refreshed every day', 'Monthly XpertRecap PDF'],
  // Only for websites we build (2026-11-19 review: these sat under "In every XpertRank plan", next to the built-elsewhere prices). Never websites built elsewhere; the promise never covers the Trial.
  oursTitle: 'Only for websites we build',
  ours: ['Our money-back promise, on every paid plan', 'Free high speed cloud hosting'],
  tiers: [
    { id: 'basic', kw: 10, name: 'XpertRank Basic', rm: 99, usd: 25, rmNew: 199, usdNew: 49, rmOther: 269, usdOther: 69, for: 'Essential SEO', start: 'The full XpertRank core: dashboard, SEO blog posts, AI checks and a monthly PDF report', short: '2 on-page SEO edits (text or photos), 1 new SEO blog post a month, 10 target keywords optimised for Google and AI search (LLM) and tracked weekly, 5 AI search questions checked monthly', rows: ['<b>10</b> target keywords we optimise for Google and AI search (LLM), tracked weekly', '<b>1</b> new SEO blog post a month, written for you', '<b>2</b> on-page SEO edits a month (text or photos)', '<b>5</b> AI search questions checked monthly (ChatGPT, Gemini and more)', 'Technical SEO audit of up to <b>50</b> pages weekly', 'Backlinks checked <b>every month</b>: new and lost links', 'Refresh your dashboard <b>every week</b>', '<b>XpertRadar Priority</b> keyword results in about 1 to 5 minutes'], locked: ['Competitor tracking, from Plus', 'Daily refresh and XpertRadar Live keyword results in under a minute, from Pro'] },
    { id: 'plus', kw: 20, name: 'XpertRank Plus', rm: 199, usd: 45, rmNew: 399, usdNew: 89, rmOther: 549, usdOther: 119, for: 'Growth SEO', hot: true, up: '20 target keywords instead of 10, with double the SEO blog posts and edits of Basic', short: '4 on-page SEO edits (text or photos), 2 new SEO blog posts a month, 20 target keywords optimised for Google and AI search (LLM) and tracked weekly, 10 AI search questions checked monthly', rows: ['<b>20</b> target keywords we optimise for Google and AI search (LLM), tracked weekly', '<b>2</b> new SEO blog posts a month, written for you', '<b>4</b> on-page SEO edits a month (text or photos)', '<b>10</b> AI search questions checked monthly (ChatGPT, Gemini and more)', 'Technical SEO audit of up to <b>100</b> pages weekly', 'Backlinks checked <b>every month</b>: new and lost links', 'Refresh your dashboard <b>twice a week</b>', '<b>XpertRadar Priority</b> keyword results in about 1 to 5 minutes', '<b>Competitor tracking</b> on Google page 1'], locked: ['Daily refresh and XpertRadar Live keyword results in under a minute, from Pro'] },
    { id: 'pro', kw: 30, name: 'XpertRank Pro', rm: 349, usd: 79, rmNew: 699, usdNew: 159, rmOther: 949, usdOther: 219, for: 'Competitive SEO', up: '30 target keywords instead of 20 and double the blog posts of Plus, for less than double the price', short: '6 on-page SEO edits (text or photos), 4 new SEO blog posts a month, 30 target keywords optimised for Google and AI search (LLM) and tracked weekly, 20 AI search questions checked monthly', rows: ['<b>30</b> target keywords we optimise for Google and AI search (LLM), tracked weekly', '<b>4</b> new SEO blog posts a month, written for you', '<b>6</b> on-page SEO edits a month (text or photos)', '<b>20</b> AI search questions checked monthly (ChatGPT, Gemini and more)', 'Technical SEO audit of up to <b>200</b> pages weekly', 'Backlinks checked <b>every week</b>: new and lost links', 'Refresh your dashboard <b>every day</b>', '<b>XpertRadar Live</b> keyword results in under a minute', '<b>Competitor tracking</b> on Google page 1'] },
    // Competitor tracking is for Plus and up (Suhen 2026-11-15; `rivals` in the dashboard's lib/plans.js).
    // Plan limits raised by Suhen 2026-11-15 (match lib/plans.js in xpertinsight). Care prices raised by Suhen 2026-11-15: RM99/199/349/599 now, about double from 1 Feb 2027: RM199/399/699/1,199. USD prices picked by Suhen 2026-11-15.
    { id: 'elite', kw: 50, name: 'XpertRank Elite', rm: 599, usd: 139, rmNew: 1199, usdNew: 269, rmOther: 1599, usdOther: 359, for: 'Market-leading SEO', up: '50 target keywords instead of 30 and double the blog posts of Pro, for less than double the price', short: '10 on-page SEO edits (text or photos), 8 new SEO blog posts a month, 50 target keywords optimised for Google and AI search (LLM) and tracked weekly, 30 AI search questions checked monthly', rows: ['<b>50</b> target keywords we optimise for Google and AI search (LLM), tracked weekly', '<b>8</b> new SEO blog posts a month, written for you', '<b>10</b> on-page SEO edits a month (text or photos)', '<b>30</b> AI search questions checked monthly (ChatGPT, Gemini and more)', 'Technical SEO audit of up to <b>300</b> pages weekly', 'Backlinks checked <b>every week</b>: new and lost links', 'Refresh your dashboard <b>every day</b>', '<b>XpertRadar Live</b> keyword results in under a minute', '<b>Competitor tracking</b> on Google page 1'] },
  ] as Tier[],
};

/** XpertRank Trial: try XpertRank for 14 days (Suhen 2026-11-13: RM25 or US$5). The price after the launch offer is not decided; it stays RM25 until Suhen says otherwise. */
export const trial: Tier & { days: number } = { id: 'trial', kw: 5, name: 'XpertRank Trial', rm: 25, usd: 5, rmNew: 25, usdNew: 5, days: 14, for: 'Try XpertRank first', short: 'XpertRank for 14 days, with your own XpertInsight dashboard, 5 keywords tracked, a technical SEO audit of up to 20 pages and 1 dashboard refresh. Your XpertRecap PDF carries a light watermark during the trial. AI answer checks and backlink checks come with the paid plans, and so does the money-back promise on websites we build. Choose a paid XpertRank plan after your trial and the trial price comes off your first month', rows: ['<b>14 days</b> of XpertRank', 'Your own <b>XpertInsight</b> dashboard', '<b>5</b> keywords tracked', 'Technical SEO audit of up to <b>20</b> pages', '<b>1</b> dashboard refresh', 'XpertRecap PDF with a light watermark', 'No AI answer checks or backlink checks'] };

/** A monthly billing period for an Offer in structured data (P1M, UN/CEFACT unit MON). Never on a one-off price (Trials, builds). */
const monthlyLd = (rm: number) => ({ priceSpecification: { '@type': 'UnitPriceSpecification', price: rm, priceCurrency: 'MYR', billingDuration: 'P1M', unitCode: 'MON' } });
/** Structured data: the same names and RM prices people see on the page. XpertRank plans are monthly; the Trial and builds are paid once. */
export const offersLd = (set: typeof build | typeof care) =>
  (set.key === 'care' ? [trial, ...set.tiers] : set.tiers).map((t) => ({ '@type': 'Offer', name: t.name, price: now(t).rm, priceCurrency: 'MYR', description: t.short,
    ...(set.key === 'care' && t !== trial ? monthlyLd(now(t).rm) : {}),
    // a launch price (it changes on 1 February 2027, as every card says) is valid until the last day of the offer (2026-11-19)
    ...(offerOn() && t.rmNew !== t.rm ? { priceValidUntil: offer.ends } : {}) }));

/** A price people SEE on a page (Suhen 2026-11-16: prices by the visitor's country). The HTML always says RM; the browser
    swaps it to USD for visitors outside Malaysia (the inline script at the end of Base.astro, country from functions/_middleware.js).
    Only for visible HTML: titles, descriptions, structured data and llms.txt keep plain RM text (fmt and friends). */
const kinds = { now: fmt, new: fmtNew, year: fmtYear, yearNew: fmtYearNew, other: fmtOther, yearOther: fmtYearOther };
export const px = (t: Tier, kind: keyof typeof kinds = 'now') => { const f = kinds[kind]; return `<span data-rm="${f(t, 'RM')}" data-usd="${f(t, 'USD')}">${f(t, 'RM')}</span>`; };

/** Fills {{price:<tier id>}} and {{kw:<tier id>}} in hand-written HTML (the homepage) with today's price, so prices are never typed twice.
    show = true for the visible page (prices the browser can swap to USD); false for plain text (structured data, chat). */
export const fillPrices = (html: string, show = false) =>
  html.replace(/\{\{price:(\w+)\}\}/g, (all, id) => { const t = [...build.tiers, ...care.tiers, trial].find((x) => x.id === id); if (!t) throw new Error('Unknown price ' + all); return show ? px(t) : fmt(t); })
    // {{kw:<care tier id>}} = that plan's target keywords (Suhen 2026-11-16)
    .replace(/\{\{kw:(\w+)\}\}/g, (all, id) => { const t = [...care.tiers, trial].find((x) => x.id === id); if (!t || !t.kw) throw new Error('Unknown keywords ' + all); return String(t.kw); })
    // {{time:<build tier id>}} = how long that build usually takes (Suhen 2026-11-19)
    .replace(/\{\{time:(\w+)\}\}/g, (all, id) => { const t = build.tiers.find((x) => x.id === id); if (!t || !t.time) throw new Error('Unknown build time ' + all); return t.time; });

/* ---------- XpertForesight, our SEO research tool (foresight.seoxpert.my, page /seo-tools/) ----------
   COPY of FS_PLANS, FS_PRICES, FS_TRIAL_PRICE, FS_YEARLY, FS_TRIAL_DAYS and fsLines() in xpertinsight lib/fsplans.js (2026-11-19).
   That file is the truth (checkout reads it): keep this copy matching, and never change a price without asking Suhen.
   Sold on its own, NOT part of XpertRank (XpertRank clients get XpertInsight). No money-back promise on XpertForesight.
   The Xplorer tier is left out on purpose: it is never sold and never shown on the website. */
const FS_PLANS = {
  'XpertForesight Trial': { short: 'Trial', searches: 25, blueprints: 1, sites: 1, pages: 20, keywords: 5, questions: 3, competitors: 1, csv: false, mark: true },
  'XpertForesight Basic': { short: 'Basic', searches: 100, blueprints: 3, sites: 1, pages: 50, keywords: 50, questions: 10, competitors: 3, csv: true, mark: false },
  'XpertForesight Plus': { short: 'Plus', searches: 300, blueprints: 8, sites: 3, pages: 100, keywords: 150, questions: 25, competitors: 5, csv: true, mark: false },
  'XpertForesight Pro': { short: 'Pro', searches: 800, blueprints: 15, sites: 5, pages: 200, keywords: 300, questions: 50, competitors: 10, csv: true, mark: false },
  'XpertForesight Elite': { short: 'Elite', searches: 1200, blueprints: 30, sites: 10, pages: 300, keywords: 500, questions: 100, competitors: 20, csv: true, mark: false },
};
type FsName = keyof typeof FS_PLANS;
export type FsLimits = (typeof FS_PLANS)[FsName];
/** What each plan costs, a month (Suhen 2026-11-17). Paid yearly = 12 months for the price of 10. */
const FS_PRICES: Record<string, { rm: number; usd: number }> = {
  'XpertForesight Basic': { rm: 79, usd: 19 },
  'XpertForesight Plus': { rm: 199, usd: 45 },
  'XpertForesight Pro': { rm: 499, usd: 115 },
  'XpertForesight Elite': { rm: 999, usd: 229 },
};
const FS_TRIAL = 'XpertForesight Trial';
const FS_TRIAL_PRICE = { RM: 25, USD: 5 }; // once, for 14 days, taken off the first paid month
const FS_YEARLY = 10;
const FS_TRIAL_DAYS = 14;
/** What a plan includes, in plain words: the exact wording of fsLines() in lib/fsplans.js (emails, the plan page, the join page). */
function fsLines(plan: FsName) {
  const r = FS_PLANS[plan]; if (!r) return [];
  const s = (n: number) => (n === 1 ? '' : 's');
  return [
    `${r.searches.toLocaleString('en-US')} research search${r.searches === 1 ? '' : 'es'} ${plan === FS_TRIAL ? 'during your trial' : 'a month'}: keywords, ideas, websites, keyword gap and AI questions`,
    `${r.blueprints} XpertBlueprint full scan${s(r.blueprints)} with an AI SEO plan ${plan === FS_TRIAL ? 'to try' : 'a month'}`,
    `${r.sites} website${s(r.sites)}, each with a weekly XpertCore site audit of up to ${r.pages} pages`,
    `Save up to ${r.keywords} keywords, ${r.questions} AI questions and ${r.competitors} competitor${s(r.competitors)} per website`,
    r.mark ? 'PDF reports (with a trial watermark)' : 'Branded PDF reports and CSV downloads'
  ];
}
export type FsTier = Tier & { fs: FsLimits };
// rmNew/usdNew equal today's price: XpertForesight has no launch price.
const fsTier = (plan: FsName, rm: number, usd: number): FsTier => {
  const r = FS_PLANS[plan], rows = fsLines(plan);
  return { id: 'fs-' + r.short.toLowerCase(), name: plan, rm, usd, rmNew: rm, usdNew: usd, for: r.sites === 1 ? '1 website' : `Up to ${r.sites} websites`, rows, short: rows.join('. '), fs: r };
};
export const foresight = {
  name: 'XpertForesight',
  app: 'https://foresight.seoxpert.my/',
  /** public sign-up and Stripe checkout */
  join: 'https://foresight.seoxpert.my/join/',
  days: FS_TRIAL_DAYS,
  yearly: FS_YEARLY,
  trial: { ...fsTier(FS_TRIAL, FS_TRIAL_PRICE.RM, FS_TRIAL_PRICE.USD), for: `${FS_TRIAL_DAYS} days, paid once` } as FsTier,
  tiers: (Object.keys(FS_PRICES) as FsName[]).map((p) => fsTier(p, FS_PRICES[p].rm, FS_PRICES[p].usd)),
};

/** How each thing is paid, in one place (Suhen 2026-11-20, after his first test purchase: "mention on the website and everywhere
    its a subscription not a one time payment" and "give them the option to cancel from the dashboard"). True to the checkouts:
    XpertRank and XpertForesight plans are Stripe subscriptions (mode 'subscription') that renew until cancelled, and Stripe's
    billing page cancels at the end of the period paid for (subscription_cancel at_period_end in xpertinsight lib/stripe.js).
    XpertForge builds and both Trials are one payment (mode 'payment'): they never renew. Used by the cards, the plan picker,
    the FAQ, /paid/, llms.txt, the chat facts and the order emails. */
export const terms = {
  build: 'One-time payment. No monthly fee for the website.',
  trial: `One payment for ${trial.days} days. It does not renew.`,
  fsTrial: `One payment for ${FS_TRIAL_DAYS} days. It does not renew.`,
  /** the short line on a plan card, by how it is paid */
  sub: { month: 'Subscription, renews monthly. Cancel any time.', year: 'Subscription, renews yearly. Cancel any time.' },
  /** how to cancel XpertRank (from the XpertInsight dashboard) */
  cancel: 'Cancel any time from Your plan in your XpertInsight dashboard. Your plan stays on until the end of the time you paid for.',
  /** how to cancel XpertForesight (from inside XpertForesight) */
  fsCancel: 'Cancel any time from Your plan inside XpertForesight. Your plan stays on until the end of the time you paid for.',
};
/** A visible XpertForesight price (RM in the HTML; the browser swaps it to US$ outside Malaysia, like px()). year = the yearly price (12 months for 10). */
export const fsPx = (t: Tier, bill: 'month' | 'year' = 'month') => { const k = bill === 'year' ? FS_YEARLY : 1; return `<span data-rm="${money(t.rm * k, 'RM')}" data-usd="${money(t.usd * k, 'USD')}">${money(t.rm * k, 'RM')}</span>`; };
/** The big price on an XpertForesight plan card (FsPlans.astro): the monthly price, plus the yearly price (12 months for the price of
    FS_YEARLY, the same maths as fsPx(t, 'year')) in data-rm-y / data-usd-y, so the Pay monthly / Pay yearly switch in packages.js can swap it.
    Presentation only: the numbers come from FS_PRICES above. */
export const fsPxCard = (t: Tier) => `<span data-rm="${money(t.rm, 'RM')}" data-usd="${money(t.usd, 'USD')}" data-rm-y="${money(t.rm * FS_YEARLY, 'RM')}" data-usd-y="${money(t.usd * FS_YEARLY, 'USD')}">${money(t.rm, 'RM')}</span>`;
/** The step-up line on a bigger XpertForesight card, worked out from FS_PLANS so it can never drift from the limits.
    It gives exact differences from the plan below (never a rounded ratio), so it says something the stat tiles do not.
    It only compares limits, never prices: the price per search does not fall on every step (Elite costs more per search than Pro). */
export const fsUp = (t: FsTier, prev: FsTier) => {
  const d = (a: number, b: number) => (a - b).toLocaleString('en-US');
  const s = (n: number) => (n === 1 ? '' : 's');
  const scans = t.fs.blueprints - prev.fs.blueprints, sites = t.fs.sites - prev.fs.sites;
  return `Everything in ${prev.name.replace('XpertForesight ', '')}, plus ${d(t.fs.searches, prev.fs.searches)} more searches, ${scans} more scan${s(scans)} and ${sites} more website${s(sites)}.`;
};
/** Plain RM text (titles, descriptions, structured data). */
export const fsFmt = (t: Tier, cur: 'RM' | 'USD' = 'RM') => money(cur === 'RM' ? t.rm : t.usd, cur);
/** Rows of the XpertForesight plan table (/seo-tools/ and /packages/): label, then the value for one plan. */
export const fsTable: [string, (t: FsTier) => string][] = [
  ['Price a month', (t) => fsPx(t)],
  [`Paid yearly (12 months for the price of ${FS_YEARLY})`, (t) => fsPx(t, 'year')],
  ['Research searches a month', (t) => t.fs.searches.toLocaleString('en-US')],
  ['XpertBlueprint scans with an AI SEO plan, a month', (t) => String(t.fs.blueprints)],
  ['Websites', (t) => String(t.fs.sites)],
  ['Weekly XpertCore site audit, pages per website', (t) => String(t.fs.pages)],
  ['Saved keywords per website', (t) => String(t.fs.keywords)],
  ['Saved AI questions per website', (t) => String(t.fs.questions)],
  ['Competitors per website', (t) => String(t.fs.competitors)],
  ['PDF reports and CSV downloads', (t) => (t.fs.csv ? 'Yes' : 'PDF only')],
];
/** Structured data: one Offer per plan, the same names and RM prices people see.
    Search Console may warn that the SoftwareApplication has no aggregateRating or review. That is expected: we have no real
    ratings yet, and ratings must never be made up to remove the warning. */
export const fsOffersLd = () => [foresight.trial, ...foresight.tiers].map((t) => ({
  '@type': 'Offer', name: t.name, price: t.rm, priceCurrency: 'MYR', url: foresight.join,
  ...(t === foresight.trial ? {} : monthlyLd(t.rm)),
  description: t === foresight.trial ? `${FS_TRIAL_DAYS} days, paid once, taken off the first paid month. ${t.short}` : `A month. ${t.short}`,
}));
