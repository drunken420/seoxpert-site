import { site } from '../config';
import { build, care, fmt } from '../data/packages';
import { posts, postUrl } from '../data/blog';
const line = (t: any, unit: string) => `- ${t.name}: ${fmt(t)} (${fmt(t, 'USD')}) ${unit}. ${t.short}.`;
// A short, plain summary of the site for AI tools (see llmstxt.org).
const body = `# ${site.name}

> ${site.tagline}. ${site.description}

XpertForge (the website build), XpertCore (our AI core), XpertCare (monthly care) and XpertLab (live demos) were all developed in house by SEOXpert.
Area: ${site.areas.join(', ')} and across ${site.country}.

## Services
- [Website design](${site.url}/website-design/): New websites planned for Google and AI search before they are designed, built as an XpertForge package with XpertCore, our own AI website builder, and finished by hand.
- [Website development](${site.url}/website-development/): How every XpertForge website is coded for Google and AI search from the ground up: clean structure, fast pages, structured data and llms.txt.
- [Website maintenance](${site.url}/website-maintenance/): Monthly care, called XpertCare, only for websites built by SEOXpert, with high speed hosting included. It keeps a website updated, backed up and growing with new content.
- [AI website builder](${site.url}/ai-website-builder/): How XpertCore, our own builder, plans pages, writes answer first copy and adds structured data and llms.txt.
- [Interactive website demos](${site.url}/demos/): Live examples of 3D and animation we can build into a website: a 3D product to spin, moving backgrounds, particle text, tilt cards, a before and after slider and animated charts.
- [Website design packages](${site.url}/packages/): Prices, what every package includes, and a plan picker.

## Website design packages (one-time price)
${build.tiers.map((t) => line(t, 'once')).join('\n')}
Every build includes: ${build.all.join(', ')}.

## XpertCare monthly website maintenance
${care.tiers.map((t) => line(t, 'a month')).join('\n')}
Every XpertCare plan includes: ${care.all.join(', ')}.

## Guides
${posts.map((p) => `- [${p.h1}](${site.url}${postUrl(p)}): ${p.card}`).join('\n')}

## Company
- [About](${site.url}/about/): Founder led, selective, white hat only. Clarity over complexity, transparency over buzzwords, strategy over shortcuts.
- [Contact](${site.url}/contact/): ${site.whatsapp ? 'WhatsApp, email or chat' : 'Email or chat'}.
- [Questions](${site.url}/faq/): Short, plain answers about websites, Google and AI search.
`;
export const GET = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
