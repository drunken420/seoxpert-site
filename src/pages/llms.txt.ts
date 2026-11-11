import { site } from '../config';
import { build, care, fmt } from '../data/packages';
const line = (t: any, unit: string) => `- ${t.name}: ${fmt(t)} (${fmt(t, 'USD')}) ${unit}. ${t.short}.`;
// A short, plain summary of the site for AI tools (see llmstxt.org).
const body = `# ${site.name}

> ${site.tagline}. ${site.description}

## Services
- [Website design](${site.url}/website-design/): New websites planned for Google and AI search before they are designed, built with our own AI website builder and finished by hand.
- [Website maintenance](${site.url}/website-maintenance/): Monthly care, called XpertCare, that keeps a website updated, backed up and growing with new content.
- [AI website builder](${site.url}/ai-website-builder/): How our own builder plans pages, writes answer first copy and adds structured data and llms.txt.
- [Interactive website demos](${site.url}/demos/): Live examples of 3D and animation we can build into a website: a 3D product to spin, moving backgrounds, particle text, tilt cards, a before and after slider and animated charts.
- [Website design packages](${site.url}/packages/): Prices, what every package includes, and a plan picker.

## Website design packages (one-time price)
${build.tiers.map((t) => line(t, 'once')).join('\n')}
Every build includes: ${build.all.join(', ')}.

## XpertCare monthly website maintenance
${care.tiers.map((t) => line(t, 'a month')).join('\n')}
Every XpertCare plan includes: ${care.all.join(', ')}.

## Company
- [About](${site.url}/about/): Founder led, selective, white hat only. Clarity over complexity, transparency over buzzwords, strategy over shortcuts.
- [Contact](${site.url}/contact/): WhatsApp, email or chat.
- [Questions](${site.url}/faq/): Short, plain answers about websites, Google and AI search.
`;
export const GET = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
