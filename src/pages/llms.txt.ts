import { site } from '../config';
import { build, care, trial, fmt } from '../data/packages';
import { posts, postUrl } from '../data/blog';
const line = (t: any, unit: string) => `- ${t.name}: ${fmt(t)} (${fmt(t, 'USD')}) ${unit}. ${t.short}.`;
// A short, plain summary of the site for AI tools (see llmstxt.org).
const body = `# ${site.name}

> ${site.tagline}. ${site.description}

XpertForge (the website build), XpertCore (our own AI SEO advisor), XpertRank (our expert SEO service) and XpertLab (live demos) were all developed in house by SEOXpert.
Area: based in ${site.country}, working remotely with businesses in ${site.areas.join(', ')}, across ${site.country} and around the world.

## Key facts
- SEOXpert is a website design and website development company in ${site.country}. It builds websites (XpertForge) and looks after them every month (XpertRank).
- XpertRank is an expert SEO service and monthly website maintenance in one. It works on any website. Websites built by SEOXpert get the lower price, free high speed cloud hosting and the money-back promise; websites built elsewhere pay their own price and get no hosting and no money-back promise. Hosting is not sold on its own.
- Money-back promise (every paid XpertRank plan on a website built by SEOXpert, not the Trial and not websites built elsewhere): If none of your tracked keywords reaches Google's top 50 in your first month, we refund that month of XpertRank in full. SEOXpert does not promise page 1 or any ranking beyond this.
- Every XpertRank plan includes XpertInsight, a live website report dashboard, and XpertRecap, a monthly PDF report.
- Prices are in Malaysian ringgit (RM), with US dollar prices for businesses outside ${site.country}.

## Services
- [Website design](${site.url}/website-design/): New websites planned for Google and AI search before they are designed, built as an XpertForge package guided by XpertCore, our own AI SEO advisor, and finished by hand.
- [Website development](${site.url}/website-development/): How every XpertForge website is coded for Google and AI search from the ground up: clean structure, fast pages, structured data and an AI ranking file.
- [Website maintenance](${site.url}/website-maintenance/): XpertRank, our monthly SEO and website maintenance service for any website, with free high speed cloud hosting for websites built by SEOXpert. It keeps a website updated, backed up and growing with new content.
- [SEO services in Malaysia](${site.url}/seo-services-malaysia/): XpertRank as our expert SEO service: keyword research and weekly tracking, on page and technical SEO, new blog posts every month, AI search (LLM) optimisation and active checks every few days, for any website, with a money-back promise on websites built by SEOXpert.
- [SEO case studies](${site.url}/case-studies/): Live results from websites built by SEOXpert, taken from Google Search Console and Google Analytics, with the dates they cover.
- [Website report dashboard](${site.url}/website-report-dashboard/): XpertInsight, our own live dashboard included with every XpertRank plan: visitors, leads, keywords, AI answers and site health, plus a monthly XpertRecap PDF. Not sold on its own.
- [AI SEO advisor](${site.url}/ai-seo-advisor/): How XpertCore, our own AI SEO advisor, guides our team on what to plan, write and mark up on every page (answer first copy, structured data and an AI ranking file), then our experts check it.
- [Interactive website demos](${site.url}/demos/): Live examples of 3D and animation we can build into a website: a 3D product to spin, a 3D logo, weather over a page, a website on a laptop and phone, a globe with world landmarks, moving backgrounds, particle text, tilt cards, a before and after slider and animated charts.
- [Website design packages](${site.url}/packages/): Prices, what every package includes, and a plan picker.

## Website design packages (one-time price)
${build.tiers.map((t) => line(t, 'once')).join('\n')}
Every build includes: ${build.all.join(', ')}.

## XpertRank monthly website maintenance
${care.tiers.map((t) => line(t, 'a month')).join('\n')}
${line(trial, `for ${trial.days} days`)}
Every XpertRank plan includes: ${care.all.join(', ')}.

## XpertAdvice: website design and SEO guides
${posts.map((p) => `- [${p.h1}](${site.url}${postUrl(p)}): ${p.card}`).join('\n')}

## Company
- [About](${site.url}/about/): Founder led, selective, white hat only. Clarity over complexity, transparency over buzzwords, strategy over shortcuts.
- [Contact](${site.url}/contact/): ${site.whatsapp ? 'WhatsApp, email or chat' : 'Email or chat'}.
- [Questions](${site.url}/faq/): Short, plain answers about prices, websites, website maintenance, Google and AI search, grouped by topic.
`;
export const GET = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
