// More questions and answers, for the Questions page (/faq/) and the chat helper.
// The first ten live on the homepage (src/fragments/home-lower.html); these come after them.
// Only write what the site already says is true. Prices and numbers come from packages.ts, never typed in by hand.
// An entry with `until` (a date) disappears after that day, like the launch offer.
import { build, care, offer, yearly, fmt } from './packages';

const [starter, business, growth] = build.tiers;
const [basic, plus, pro] = care.tiers;
const pages = (t: typeof starter) => t.short.match(/Up to (\d+)/)?.[1];
const posts = (t: typeof starter) => t.short.match(/(\d+) posts/)?.[1];
const rounds = (t: typeof starter) => t.rows.join(' ').match(/<b>(\d+)<\/b> revision/)?.[1];

export type Topic = 'Prices and packages' | 'Your website' | 'Google and AI search' | 'XpertCare' | 'About us';
export const topics: Topic[] = ['Prices and packages', 'Your website', 'Google and AI search', 'XpertCare', 'About us'];

/** Topics for the ten homepage questions, in their order. */
export const homeTopics: Topic[] = ['Your website', 'Google and AI search', 'Google and AI search', 'Google and AI search', 'Google and AI search', 'XpertCare', 'Your website', 'XpertCare', 'Prices and packages', 'About us'];

export interface MoreFaq { topic: Topic; q: string; a: string; until?: string }
export const more: MoreFaq[] = [
  // Prices and packages
  { topic: 'Prices and packages', q: 'What is the difference between Starter, Business and Growth?', a: `The size. XpertForge Starter has up to ${pages(starter)} pages and a blog with ${posts(starter)} posts, Business has up to ${pages(business)} pages and ${posts(business)} posts, and Growth has up to ${pages(growth)} pages and ${posts(growth)} posts. Copywriting, keyword research and the Google and AI setup are in all three. <a href="/packages/">Compare the packages</a>.` },
  { topic: 'Prices and packages', q: 'Is the website price paid once or every month?', a: `Once. An XpertForge website is a one-time price, from ${fmt(starter)}. XpertCare is a separate, optional monthly plan, from ${fmt(basic)} a month, with high speed hosting included.` },
  { topic: 'Prices and packages', q: 'Is copywriting included?', a: 'Yes. Every XpertForge package includes the writing: answer first copy drafted with XpertCore and checked by our experts, plus full keyword research before anything is designed.' },
  { topic: 'Prices and packages', q: 'How many revision rounds do I get?', a: `XpertForge Starter has ${rounds(starter)} revision rounds, and Business and Growth have ${rounds(business)} each.` },
  { topic: 'Prices and packages', q: 'Is there a discount if I pay yearly?', a: `Yes. Pay for XpertCare yearly and you get 12 months for the price of ${yearly.pay}, so ${yearly.text}.` },
  { topic: 'Prices and packages', q: 'Is there a launch offer?', until: offer.ends, a: `Yes, until ${offer.endsText}. Every new website comes with free high speed hosting and XpertCare: ${offer.text} <a href="/packages/">See the packages</a>.` },
  { topic: 'Prices and packages', q: 'Can I see the prices in US dollars?', a: 'Yes. Prices are in Malaysian ringgit (RM), and the <a href="/packages/">packages page</a> has a switch to show them in US dollars too.' },
  { topic: 'Prices and packages', q: 'Do I pay extra for website development?', a: 'No. Design and development are both included in every website design package. <a href="/website-development/">See what goes into the code</a>.' },
  // Your website
  { topic: 'Your website', q: 'How does a website project start?', a: 'With a short chat. You tell us about your business, XpertCore drafts the page plan and answer first copy, we design and refine every page by hand, and then your website goes live with the Google and AI setup in place. <a href="/website-design/">See how website design works</a>.' },
  { topic: 'Your website', q: 'Do I need to use the AI builder myself?', a: 'No. XpertCore is our own AI core, and our team uses it for you. There is no tool for you to learn.' },
  { topic: 'Your website', q: 'Does my website come with a blog?', a: `Yes. Every XpertForge website has a blog on top of its pages, with ${posts(starter)}, ${posts(business)} or ${posts(growth)} posts written at launch, depending on the package.` },
  { topic: 'Your website', q: 'Will my website work well on phones?', a: 'Yes. We keep pages light so they load quickly on phones, because most people will meet your business on a phone.' },
  { topic: 'Your website', q: 'Can customers contact me from the website?', a: 'Yes. Every package includes a contact page and a WhatsApp button, so customers can reach you.' },
  { topic: 'Your website', q: 'Can you redesign my current website?', a: 'Yes. We start by checking what your current website does well and what is missing, then build a new one with XpertForge on a solid foundation.' },
  { topic: 'Your website', q: 'Can you add 3D or animation to my website?', a: 'Yes. Any effect in <a href="/demos/">XpertLab</a> can be added to any of our website design packages. Tell us which one you liked and we will tell you honestly if it fits your business. Effects load only when needed, so the page stays fast.' },
  { topic: 'Your website', q: 'Can I see websites you have built?', a: 'Yes. See our work on the <a href="/website-design/">website design page</a>. This website is built the same way, so you are already looking at an example.' },
  // Google and AI search
  { topic: 'Google and AI search', q: 'Can you guarantee first page on Google?', a: 'No, and nobody honestly can, because nobody controls Google or AI tools. What we promise is the work: a website that is clear, fast and easy for both to read.' },
  { topic: 'Google and AI search', q: 'What is structured data?', a: 'Extra labels in the code that tell Google and AI tools the facts about your business, your services and your questions and answers, so they do not have to guess. Every website we build has it.' },
  { topic: 'Google and AI search', q: 'What is an llms.txt file?', a: 'A short, plain summary of your website for AI assistants, alongside the sitemap that search engines use. Every website we build gets one.' },
  { topic: 'Google and AI search', q: 'Do you do keyword research?', a: 'Yes. Full keyword research with XpertCore is part of every XpertForge package, before anything is designed. With XpertCare, we also track your keywords every week.' },
  // XpertCare
  { topic: 'XpertCare', q: 'Is hosting included?', a: 'Yes, high speed hosting is included with every XpertCare plan, and with the launch offer. We do not sell hosting on its own.' },
  { topic: 'XpertCare', q: 'Do I have to take XpertCare?', a: 'No. XpertCare is optional. It is there if you want us to keep your website hosted, updated, backed up and growing every month.' },
  { topic: 'XpertCare', q: 'Can you look after a website built by someone else?', a: 'No. XpertCare is only for websites we build with XpertForge, because we host them and know every part of what we look after. We can build you a new website first.' },
  { topic: 'XpertCare', q: 'Which XpertCare plan fits my website?', a: `A care plan can be as big as the website, not bigger. ${basic.name} fits any XpertForge website, ${plus.name.replace('XpertCare ', '')} needs Business or Growth, and ${pro.name.replace('XpertCare ', '')} needs Growth.` },
  { topic: 'XpertCare', q: 'How often do you check my website?', a: 'Every few days. Every XpertCare plan includes issue checks every few days with fixes, uptime watch, backups and security, plus a Google and AI visibility report every month.' },
  // About us
  { topic: 'About us', q: 'Who is behind SEOXpert?', a: 'SEOXpert is a founder led web design company in Malaysia. After more than 7 years of hands-on SEO, our founder built XpertCore so every website is ready for Google and AI from day one. <a href="/about/">More about us</a>.' },
  { topic: 'About us', q: 'Do you outsource the work?', a: 'No. Every website is designed and coded in house and personally planned and overseen. There is no outsourcing and no white labelling.' },
  { topic: 'About us', q: 'How do I contact you?', a: 'Send a message on the <a href="/contact/">contact page</a> or email us. A real person reads every message and replies by email.' },
];
