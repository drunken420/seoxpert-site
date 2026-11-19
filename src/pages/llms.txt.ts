import { site } from '../config';
import { build, care, trial, fmt, fmtNew, fmtOther, offer, offerOn, yearly, buyer } from '../data/packages';
import { posts, postUrl } from '../data/blog';
const line = (t: any, unit: string) => `- ${t.name}: ${fmt(t)} (${fmt(t, 'USD')}) ${unit}. ${t.short}.`;
// The conditions on the prices travel with them (2026-11-19 review: AI tools quote this file on its own).
const list = (ts: any[], f: (t: any, cur?: 'RM' | 'USD') => string) => ts.map((t) => `${t.name} ${f(t)} (${f(t, 'USD')})`).join(', ');
const on = offerOn();
// A short, plain summary of the site for AI tools (see llmstxt.org).
const body = `# ${site.name}

> ${site.tagline}. ${site.description}

XpertForge (the website build), XpertCore (our own AI SEO advisor), XpertRank (our expert SEO service) and XpertLab (live demos) were all developed in house by SEOXpert.
Area: based in ${site.country}, working remotely with businesses in ${site.areas.join(', ')}, across ${site.country} and around the world.

## Key facts
- SEOXpert is a website design and website development company in ${site.country}. It builds websites (XpertForge) and looks after them every month (XpertRank).
- XpertRank is an expert SEO service and monthly website maintenance in one. It works on any website. Websites built by SEOXpert get the lower price, free high speed cloud hosting and the money-back promise; websites built elsewhere pay their own price and get no hosting and no money-back promise. Hosting is not sold on its own.
- Money-back promise (every paid XpertRank plan on a website built by SEOXpert, not the Trial and not websites built elsewhere): If none of your tracked keywords reaches Google's top 50 in your first month, we refund that month of XpertRank in full. SEOXpert does not promise page 1 or any ranking beyond this.
- Every XpertRank plan includes XpertInsight, a live website report dashboard (visitors, leads, keyword positions, AI answers, site health and backlinks), and XpertRecap, a monthly PDF report.
- Every website SEOXpert builds is SEO and LLM (AI search) optimised from day one, and every page is custom engineered and designed.
- Every XpertForge website is secure by design: every page is custom engineered and designed (no two websites are the same), then built into secure static files with no database and no admin login on the live website when SEOXpert builds and manages it with XpertRank (a website handed over to the client gets a simple editing dashboard with a login instead), HTTPS and safety headers on every page, and, on SEOXpert's high speed cloud hosting, a global cloud network with built-in DDoS protection. Every version is kept in the code history. SEOXpert does not claim any website is impossible to hack.
- SEOXpert also builds web apps: dashboards, online tools, logins and Stripe payment gateway set ups (card, FPX and GrabPay). They are browser web apps, not App Store or Play Store apps, and each one is quoted on its scope (no published price).
- Build times (usual, not a promise): XpertForge ${buyer.times}, ${buyer.from}. ${buyer.revision} ${buyer.bigger}
- After a website build is paid (in full, before work starts): ${buyer.steps.map((s) => s.t.charAt(0).toLowerCase() + s.t.slice(1)).join(', ')}.
- ${buyer.domain}
- Hosting: ${buyer.hosting} ${buyer.handover}
- Changes after launch: ${buyer.edits}
- Ownership: ${buyer.owner}
- Prices are in Malaysian ringgit (RM), with US dollar prices for businesses outside ${site.country}.${on ? `
- Launch offer (websites ordered by ${offer.endsText}): ${offer.text} These are free months of XpertRank, not a free year of XpertRank.` : ''}

## Services
- [Website design](${site.url}/website-design/): New websites planned for Google and AI search before they are designed, built as an XpertForge package guided by XpertCore, our own AI SEO advisor, and finished by hand.
- [Website development](${site.url}/website-development/): How every XpertForge website is coded for Google and AI search from the ground up: clean structure, fast pages, structured data and an AI ranking file, and secured in layers (no database or admin login while SEOXpert manages it with XpertRank, HTTPS, safety headers, DDoS protection).
- [Web app development](${site.url}/web-app-development-malaysia/): Web apps, dashboards and payment gateway integration: client dashboards, online tools, one-time-code logins and Stripe payments (card, FPX and GrabPay; one-time payments, subscriptions, payment links, receipts and a billing portal). Web apps work in the browser on any phone; SEOXpert does not build App Store or Play Store apps. Built the same way as SEOXpert's own web apps: XpertInsight (insight.seoxpert.my, the live client dashboard), XpertForesight (foresight.seoxpert.my, an SEO research tool sold on its own) and XpertStocks (xpertstocks.com, free Bursa Malaysia stock tools, tools and education only). Every web app is quoted on its scope.
- [Website maintenance](${site.url}/website-maintenance/): XpertRank, our monthly SEO and website maintenance service for any website, with free high speed cloud hosting for websites built by SEOXpert. It keeps a website updated, backed up and growing with new content.
- [SEO services in Malaysia](${site.url}/seo-services-malaysia/): XpertRank as our expert SEO service: keyword research and weekly tracking, on page and technical SEO, new blog posts every month, AI search (LLM) optimisation and active checks every few days, for any website, with a money-back promise on websites built by SEOXpert.
- [AI SEO services in Malaysia](${site.url}/ai-seo-services-malaysia/): AI SEO (generative engine optimisation) as part of every XpertRank plan: answer first content, structured data, an AI ranking file, and monthly checks of what ChatGPT, Gemini, Perplexity and Google AI Overviews say about a business. No promise that an AI tool will name it.
- [SEO packages in Malaysia](${site.url}/seo-packages-malaysia/): The four XpertRank SEO packages with their published monthly prices, a comparison of what each includes, and the prices for websites built elsewhere.
- [SEO audit in Malaysia](${site.url}/seo-audit-malaysia/): The XpertCore site audit: a technical SEO audit every week in every XpertRank plan (errors, warnings and notices), with fixes by our team, and the XpertRank Trial as a way to try it.
- [SEO case studies](${site.url}/case-studies/): Live results from a website built by SEOXpert (seoxpert.my itself so far), taken from Google Search Console and Google Analytics, with the dates they cover.
- [Website report dashboard](${site.url}/website-report-dashboard/): XpertInsight, our own live dashboard included with every XpertRank plan: visitors, leads, keywords, AI answers and site health, plus a monthly XpertRecap PDF. Not sold on its own.
- [AI SEO advisor](${site.url}/ai-seo-advisor/): How XpertCore, our own AI SEO advisor, guides our team on what to plan, write and mark up on every page (answer first copy, structured data and an AI ranking file), then our experts check it.
- [Interactive website demos](${site.url}/demos/): Live examples of 3D and animation we can build into a website: a 3D product to spin, a 3D logo, weather over a page, a website on a laptop and phone, a globe with world landmarks, moving backgrounds, particle text, tilt cards, a before and after slider and animated charts.
- [Website design packages](${site.url}/packages/): Prices, what every package includes, and a plan picker.

## Website design packages (one-time price${on ? `, launch prices until ${offer.endsText}` : ''})
${build.tiers.map((t) => line(t, 'once')).join('\n')}${on ? `
From 1 February 2027: ${list(build.tiers, fmtNew)}.` : ''}
Every build includes: ${build.all.join(', ')}.

## XpertRank monthly website maintenance
Prices for websites built by SEOXpert${on ? ' (launch prices for the first 20 XpertRank clients)' : ''}. Paid yearly: 12 months for the price of ${yearly.pay}.
${care.tiers.map((t) => line(t, 'a month')).join('\n')}${on ? `
From 1 February 2027, for websites built by SEOXpert: ${list(care.tiers, fmtNew)} a month.` : ''}
For websites built elsewhere (no launch price, no free hosting, no money-back promise): ${list(care.tiers, fmtOther)} a month.
${line(trial, `for ${trial.days} days`)}
Every XpertRank plan includes: ${care.all.join(', ')}.
${care.oursTitle} (not websites built elsewhere; the money-back promise never covers the Trial): ${care.ours.join(', ').toLowerCase()}.

## XpertAdvice: website design and SEO guides
${posts.map((p) => `- [${p.h1}](${site.url}${postUrl(p)}): ${p.card.replace(/<[^>]+>/g, "")}`).join('\n')}

## Company
- [About](${site.url}/about/): Founder led, selective, white hat only. Clarity over complexity, transparency over buzzwords, strategy over shortcuts.
- [Contact](${site.url}/contact/): ${site.whatsapp ? 'WhatsApp, email or chat' : 'Email or chat'}.
- [Questions](${site.url}/faq/): Short, plain answers about prices, websites, website maintenance, Google and AI search, grouped by topic.
`;
export const GET = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
