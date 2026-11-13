// More questions and answers, for the Questions page (/faq/) and the chat helper.
// The first ten live on the homepage (src/fragments/home-lower.html); these come after them.
// Only write what the site already says is true. Prices and numbers come from packages.ts, never typed in by hand.
// An entry with `until` (a date) disappears after that day, like the launch offer.
import { build, care, trial, offer, yearly, fmt, fmtNew } from './packages';

const [starter, business, growth] = build.tiers;
const [basic, plus, pro, elite] = care.tiers;
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
  { topic: 'Prices and packages', q: 'Is copywriting included?', a: 'Yes. Every XpertForge package includes highly rankable content: answer first copy drafted with XpertCore from full keyword research, and checked by our experts before anything goes live.' },
  { topic: 'Prices and packages', q: 'How many revision rounds do I get?', a: `XpertForge Starter has ${rounds(starter)} revision rounds, and Business and Growth have ${rounds(business)} each.` },
  { topic: 'Prices and packages', q: 'Is there a discount if I pay yearly?', a: `Yes. Pay for XpertCare yearly and you get 12 months for the price of ${yearly.pay}, so ${yearly.text}.` },
  { topic: 'Prices and packages', q: 'Is there a launch offer?', until: offer.ends, a: `Yes, until ${offer.endsText}. ${offer.text} <a href="/packages/">See the packages</a>.` },
  { topic: 'XpertCare', q: 'Can I try XpertCare first?', a: `Yes. The ${trial.name} costs ${fmt(trial)} for ${trial.days} days: ${trial.short.replace('XpertCare for 14 days, with', 'you get')}. <a href="/packages/#xpertcare">See the plans</a>.` },
  { topic: 'Prices and packages', q: 'Will the prices go up?', until: offer.ends, a: `Yes. Today's prices are launch prices until ${offer.endsText}. From 1 February 2027, XpertForge websites cost ${fmtNew(starter)}, ${fmtNew(business)} and ${fmtNew(growth)}, and XpertCare costs ${fmtNew(basic)}, ${fmtNew(plus)} and ${fmtNew(pro)} a month. <a href="/packages/">See the packages</a>.` },
  { topic: 'Prices and packages', q: 'Can I see the prices in US dollars?', a: 'Yes. Prices are in Malaysian ringgit (RM), and the <a href="/packages/">packages page</a> has a switch to show them in US dollars too.' },
  { topic: 'Prices and packages', q: 'Do I pay extra for website development?', a: 'No. Design and development are both included in every website design package. <a href="/website-development/">See what goes into the code</a>.' },
  // Your website
  { topic: 'Your website', q: 'How does a website project start?', a: 'With a short chat. You tell us about your business, XpertCore drafts the page plan and answer first copy, we design and refine every page by hand, and then your website goes live with the Google and AI setup in place. <a href="/website-design/">See how website design works</a>.' },
  { topic: 'Your website', q: 'Do I need to use the AI builder myself?', a: 'No. XpertCore is our own AI core, and our team uses it for you. There is no tool for you to learn.' },
  { topic: 'Your website', q: 'Does my website come with a blog?', a: `Yes. Every XpertForge website comes with its own blog, and blog posts do not count towards your pages. It starts with ${posts(starter)}, ${posts(business)} or ${posts(growth)} posts written at launch, depending on the package.` },
  { topic: 'Your website', q: 'Will my website work well on phones?', a: 'Yes. We keep pages light so they load quickly on phones, because most people will meet your business on a phone.' },
  { topic: 'Your website', q: 'Can customers contact me from the website?', a: 'Yes. Every package includes a contact page and a WhatsApp button, so customers can reach you.' },
  { topic: 'Your website', q: 'Can you redesign my current website?', a: 'Yes. We start by checking what your current website does well and what is missing, then build a new one with XpertForge on a solid foundation.' },
  { topic: 'Your website', q: 'Can you add 3D or animation to my website?', a: 'Yes. Any effect in <a href="/demos/">XpertLab</a> can be added to any of our website design packages. Tell us which one you liked and we will tell you honestly if it fits your business. Effects load only when needed, so the page stays fast.' },
  { topic: 'Your website', q: 'Can I see websites you have built?', a: 'Yes. See our work on the <a href="/website-design/">website design page</a>. This website is built the same way, so you are already looking at an example.' },
  { topic: 'Your website', q: 'What is the difference between website design and website development?', a: 'Design is what people see: the look, the layout and the words. Development is what Google and AI read: clean code, fast pages, titles, descriptions and structured data. Both are included in every XpertForge package. <a href="/website-development/">See what goes into the code</a>.' },
  { topic: 'Your website', q: 'Does every page get its own title and description?', a: 'Yes. Every page gets its own title and description, written for what people search for, so each page has a clear job on Google.' },
  { topic: 'Your website', q: 'Is the copy checked by a person?', a: 'Yes. XpertCore does the heavy lifting, and our experts check and refine every page before it goes live.' },
  // Google and AI search
  { topic: 'Google and AI search', q: 'Can you guarantee first page on Google?', a: 'No, and nobody honestly can, because nobody controls Google or AI tools. What we promise is the work: a website that is clear, fast and easy for both to read.' },
  { topic: 'Google and AI search', q: 'What is structured data?', a: 'Extra labels in the code that tell Google and AI tools the facts about your business, your services and your questions and answers, so they do not have to guess. Every website we build has it.' },
  { topic: 'Google and AI search', q: 'What is an llms.txt file?', a: 'A short, plain summary of your website for AI assistants, alongside the sitemap that search engines use. Every website we build gets one.' },
  { topic: 'Google and AI search', q: 'Do you do keyword research?', a: 'Yes. Full keyword research with XpertCore is part of every XpertForge package, before anything is designed. With XpertCare, we also track your keywords every week.' },
  { topic: 'Google and AI search', q: 'What is answer first writing?', a: 'Short, plain answers at the top of each page, written for what people are actually asking. It helps visitors, and it gives Google and AI tools a clear answer to quote.' },
  { topic: 'Google and AI search', q: 'How do you make my website ready for AI search?', a: 'With clear facts and quotable answers on every page, structured data in the code, and an llms.txt file that sums up your business for AI tools. With XpertCare, we also make SEO and AI search (LLM) optimisations when needed.' },
  { topic: 'Google and AI search', q: 'How do I know if AI tools mention my business?', a: 'With XpertCare, each month we ask AI tools the questions your customers ask, and the AI answers view in <a href="/website-report-dashboard/">XpertInsight</a> shows whether they name your business, plus the visits AI tools send you.' },
  // XpertCare
  { topic: 'XpertCare', q: 'Is hosting included?', a: 'Yes, high speed hosting is included with every XpertCare plan, and with the launch offer. We do not sell hosting on its own.' },
  { topic: 'XpertCare', q: 'Do I have to take XpertCare?', a: 'No. XpertCare is optional. It is there if you want us to keep your website hosted, updated, backed up and growing every month.' },
  { topic: 'XpertCare', q: 'Can you look after a website built by someone else?', a: 'No. XpertCare is only for websites we build with XpertForge, because we host them and know every part of what we look after. We can build you a new website first.' },
  { topic: 'XpertCare', q: 'Which XpertCare plan fits my website?', a: `A care plan can be as big as the website, not bigger. ${basic.name} fits any XpertForge website, ${plus.name.replace('XpertCare ', '')} needs Business or Growth, and ${pro.name.replace('XpertCare ', '')} and ${elite.name.replace('XpertCare ', '')} need Growth.` },
  { topic: 'XpertCare', q: 'How often do you check my website?', a: 'Every few days. With every XpertCare plan we actively check your website every few days, fix what we find and make SEO and AI search (LLM) optimisations when needed, plus uptime watch, backups and security, plus a Google and AI visibility report every month.' },
  { topic: 'XpertCare', q: 'Can I change text or photos after launch?', a: `Yes, with XpertCare. ${basic.name} includes ${basic.short.split(',')[0]}, ${plus.name.replace('XpertCare ', '')} includes ${plus.short.split(',')[0]}, ${pro.name.replace('XpertCare ', '')} includes ${pro.short.split(',')[0]}, and ${elite.name.replace('XpertCare ', '')} includes ${elite.short.split(',')[0]}, every month. <a href="/packages/">Compare the plans</a>.` },
  { topic: 'XpertCare', q: 'Do you keep writing blog posts after launch?', a: `Yes, with XpertCare: ${basic.short.split(',')[1].trim().replace(' a month', '')} a month with ${basic.name.replace('XpertCare ', '')}, ${plus.short.split(',')[1].trim().replace(' a month', '')} with ${plus.name.replace('XpertCare ', '')}, ${pro.short.split(',')[1].trim().replace(' a month', '')} with ${pro.name.replace('XpertCare ', '')}, and ${elite.short.split(',')[1].trim().replace(' a month', '')} with ${elite.name.replace('XpertCare ', '')}.` },
  { topic: 'XpertCare', q: 'Do you back up my website?', a: 'Yes. With every XpertCare plan, regular copies of your website are saved, so nothing is lost if something goes wrong.' },
  { topic: 'XpertCare', q: 'What is XpertInsight?', a: 'XpertInsight is our own live website report dashboard, included with every XpertCare plan. You log in to see your visitors, leads, keywords, AI answers and site health in plain words. <a href="/website-report-dashboard/">Look inside XpertInsight</a>.' },
  { topic: 'XpertCare', q: 'Does XpertInsight cost extra?', a: 'No. XpertInsight is included with every XpertCare plan and is not sold on its own.' },
  { topic: 'XpertCare', q: 'How do I log in to XpertInsight?', a: 'With a secure login that needs no password: we send a fresh code to your email every time you log in. You only ever see your own website.' },
  { topic: 'XpertCare', q: 'Can I check XpertInsight on my phone?', a: 'Yes. XpertInsight works on phones too, and you can switch between the last 7 days, 28 days or 3 months.' },
  { topic: 'XpertCare', q: 'What is XpertRecap?', a: 'XpertRecap is your monthly report as a six page PDF. You download it from XpertInsight with the Download PDF button.' },
  // About us
  { topic: 'About us', q: 'Who is behind SEOXpert?', a: 'SEOXpert is a founder led web design company in Malaysia. After more than 7 years of hands-on SEO, our founder built XpertCore so every website is ready for Google and AI from day one. <a href="/about/">More about us</a>.' },
  { topic: 'About us', q: 'Do you outsource the work?', a: 'No. Every website is designed and coded in house and personally planned and overseen. There is no outsourcing and no white labelling.' },
  { topic: 'About us', q: 'How do I contact you?', a: 'Send a message on the <a href="/contact/">contact page</a> or email us. A real person reads every message and replies by email.' },
];
