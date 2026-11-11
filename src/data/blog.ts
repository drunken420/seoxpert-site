// Blog guides. Newest first: the first three show in the magazine layout, the rest in the card grid.
// Rules: answer first, plain words, real facts only. Prices come from packages.ts so they can never disagree with the packages page.
// Never promise rankings. Add a new guide at the TOP of the list.
import { build, care, fmt, fmtYear, yearly } from './packages';

export interface Post {
  slug: string; tag: string; art: 'cost' | 'care' | 'ai' | 'seo' | 'pick';
  h1: string; title: string; description: string; date: string;
  short: string; card: string;
  sections: { id: string; h: string; html: string }[];
  faqs: { q: string; a: string }[];
  cta: { pill: string; title: string; href: string; label: string };
}

const [starter, business, growth] = build.tiers;
const [basic, plus, pro] = care.tiers;
const buildTable = `<div class="btable"><table><thead><tr><th>Package</th><th>Price, paid once</th><th>Pages</th><th>Blog posts at launch</th></tr></thead><tbody>
<tr><td>${starter.name}</td><td>${fmt(starter)}</td><td>Up to 5</td><td>2</td></tr>
<tr><td>${business.name}</td><td>${fmt(business)}</td><td>Up to 10, plus a blog</td><td>5</td></tr>
<tr><td>${growth.name}</td><td>${fmt(growth)}</td><td>Up to 20, plus a blog</td><td>10</td></tr>
</tbody></table></div>`;
const careTable = `<div class="btable"><table><thead><tr><th>Plan</th><th>Price a month</th><th>Paid yearly</th><th>What changes each month</th></tr></thead><tbody>
<tr><td>${basic.name}</td><td>${fmt(basic)}</td><td>${fmtYear(basic)}</td><td>3 text or photo changes, 1 new blog post, 5 keywords tracked weekly</td></tr>
<tr><td>${plus.name}</td><td>${fmt(plus)}</td><td>${fmtYear(plus)}</td><td>10 text or photo changes, 2 new blog posts, 10 keywords tracked weekly</td></tr>
<tr><td>${pro.name}</td><td>${fmt(pro)}</td><td>${fmtYear(pro)}</td><td>Up to 20 small changes, 4 new blog posts, 20 keywords tracked weekly</td></tr>
</tbody></table></div>`;

export const posts: Post[] = [
  {
    slug: 'website-design-price-malaysia', tag: 'Website design', art: 'cost', date: '2026-11-11',
    h1: 'Website design price in Malaysia: what does it cost?',
    title: 'Website Design Price in Malaysia: What It Costs | SEOXpert',
    description: `Website design in Malaysia costs from ${fmt(starter)} with SEOXpert, paid once. See what changes the price, what each package includes and what it costs each month.`,
    card: `A new business website in Malaysia costs from ${fmt(starter)}, paid once. The price depends mostly on how many pages you need.`,
    short: `Website design in Malaysia with SEOXpert costs ${fmt(starter)} to ${fmt(growth)}, paid once. The price depends mostly on how many pages you need. Copywriting, keyword research, and Google and AI search optimisation are included in every package.`,
    sections: [
      { id: 'what-changes-the-price', h: 'What changes the price of website design in Malaysia', html: `<p>Website design prices in Malaysia vary a lot from one company to the next, which makes quotes hard to compare. Most of the cost comes from the amount of work, and a few things decide how much work there is.</p>
<ul><li><b>How many pages you need.</b> A five page website for a new business is far less work than a twenty page website with a blog.</li>
<li><b>Who writes the words.</b> Many quotes leave the writing to you. Writing is slow, and a website with thin writing is hard to find. Ask if it is included.</li>
<li><b>Whether search is planned in.</b> Titles, descriptions, headings and structured data take time to do properly. Some quotes charge extra for this, or skip it.</li>
<li><b>How many rounds of changes you get.</b> More revision rounds means more work, so they are usually limited.</li></ul>
<p>When you compare prices, compare what is included, not only the number at the bottom.</p>` },
      { id: 'package-prices', h: 'Our website design package prices in Malaysia', html: `<p>Our website builds are called XpertForge. There are three sizes, and each one is a single price, paid once.</p>${buildTable}
<p>Every package includes copywriting, full keyword research with XpertCore, Google SEO and AI search optimisation, and a WhatsApp button with a contact page. ${starter.name} has 2 revision rounds. ${business.name} and ${growth.name} have 3.</p>
<p>You can compare them side by side on the <a href="/packages/">website design packages</a> page, where prices are shown in ringgit (RM) first, with US dollars as an option.</p>` },
      { id: 'monthly-cost', h: 'What a website costs after launch', html: `<p>A website needs looking after once it is live. With us that is optional, and it is called XpertCare. It costs ${fmt(basic)} to ${fmt(pro)} a month and includes hosting, backups, security, fixes, new blog posts and a monthly Google and AI visibility report.</p>
<p>If you pay yearly you get ${yearly.text}. XpertCare is only for websites we build. Read more in <a href="/blog/website-maintenance-malaysia/">website maintenance in Malaysia</a>.</p>` },
      { id: 'which-package', h: 'Which package fits your business', html: `<ul><li><b>${starter.name}</b> suits a first website: who you are, what you do and how to reach you, in up to 5 pages.</li>
<li><b>${business.name}</b> suits a growing business that needs a page for each service and a blog, in up to 10 pages.</li>
<li><b>${growth.name}</b> suits a bigger website with many services or products, in up to 20 pages.</li></ul>
<p>Not sure? <a href="/contact/">Tell us about your business</a> and we will say honestly which size fits.</p>` },
    ],
    faqs: [
      { q: 'Is the price paid once or every month?', a: `The website build is paid once. Monthly care with XpertCare is separate and optional, from ${fmt(basic)} a month.` },
      { q: 'Is the writing included in the price?', a: 'Yes. Copywriting is included in every XpertForge package. We write answer first copy for each page and our experts check it.' },
      { q: 'Do I have to take a monthly plan?', a: 'No. XpertCare is optional. You can look after the website yourself after launch.' },
      { q: 'Are the prices in ringgit?', a: 'Yes. Prices are shown in RM first. The packages page also has a switch to US dollars.' },
    ],
    cta: { pill: 'XpertForge', title: `Get a website from ${fmt(starter)}`, href: '/packages/', label: 'See packages' },
  },
  {
    slug: 'seo-malaysia-guide', tag: 'SEO', art: 'seo', date: '2026-11-11',
    h1: 'SEO in Malaysia: how search engine optimisation works',
    title: 'SEO in Malaysia: How Search Engine Optimisation Works',
    description: 'SEO in Malaysia in plain words: what search engine optimisation is, how on page and local SEO work, and why it starts with how your website is built.',
    card: 'What search engine optimisation is, how on page and local SEO work, and where to start.',
    short: 'SEO (search engine optimisation) is the work of making your website easy for Google to find, understand and show to people who are searching. For a business in Malaysia it has three parts: a well built website (on page SEO), being visible in your area (local SEO), and useful content that keeps growing.',
    sections: [
      { id: 'what-is-seo', h: 'What SEO means', html: `<p>When someone in Malaysia searches Google for something you sell, Google chooses which websites to show. SEO is everything you do to help Google choose yours: clear pages, the right words, a fast website and useful answers.</p>
<p>It is not a trick and it is not instant. Nobody can buy a place in the normal results, and nobody can honestly promise page 1.</p>` },
      { id: 'on-page-seo', h: 'On page SEO: the part inside your website', html: `<p>On page SEO is the work done on the pages themselves. It is the part you control most.</p>
<ul><li><b>One clear topic per page</b>, chosen from what people actually search for.</li>
<li><b>Titles and descriptions</b> that say plainly what the page is about.</li>
<li><b>Well ordered headings</b> that read like the questions people ask.</li>
<li><b>Answer first writing.</b> A short, plain answer at the top of each page.</li>
<li><b>Fast on phones</b>, because most people will meet your business on a phone.</li>
<li><b>Structured data</b>, extra labels in the code that tell search engines the facts.</li></ul>` },
      { id: 'local-seo', h: 'Local SEO in Malaysia: being found in your area', html: `<p>Local SEO helps people near you find you. Many searches include a place, such as a service followed by Kuala Lumpur, Selangor or Petaling Jaya.</p>
<ul><li><b>Say where you work.</b> Name the areas you serve in plain words on your website.</li>
<li><b>Keep your details the same everywhere.</b> Business name, phone number and address should match on your website and anywhere else you are listed.</li>
<li><b>Set up a Google Business Profile.</b> It is free from Google, and it is what shows your business on Google Maps.</li>
<li><b>Make contact easy.</b> A WhatsApp button and a clear contact page turn a search into a message.</li></ul>` },
      { id: 'starts-with-the-website', h: 'Why SEO starts with how the website is built', html: `<p>Most websites are designed first and fixed for search later. That order causes the same problems again and again: pages with no clear topic, important words placed inside pictures where machines cannot read them, heavy pages that load slowly on phones.</p>
<p>Fixing these later often means rebuilding pages, so you pay twice. Our <a href="/website-design/">website design in Malaysia</a> works the other way round: every page is planned for Google and AI search before it is designed.</p>
<p>Planning for search does not mean a plain website. You can try live animation and 3D examples in <a href="/demos/">XpertLab</a>.</p>` },
      { id: 'how-long', h: 'How long SEO takes', html: `<p>Most people begin to see results after eight to twelve weeks. Search visibility builds over time, which is why a website needs looking after once it is live. Read more in <a href="/blog/website-maintenance-malaysia/">website maintenance in Malaysia</a>.</p>
<p>More and more people also ask AI tools instead of searching. The same clear website helps there too. See <a href="/blog/ai-seo-malaysia/">AI SEO in Malaysia</a>.</p>` },
    ],
    faqs: [
      { q: 'What is the difference between on page SEO and local SEO?', a: 'On page SEO is the work on the pages of your website: topics, titles, headings, writing and speed. Local SEO helps people in your area find you, for example on Google Maps.' },
      { q: 'Can SEO be added to a website later?', a: 'Yes, but it is harder and usually costs more, because pages often need to be rewritten or rebuilt.' },
      { q: 'How long does SEO take to show results?', a: 'Most people begin to see results after eight to twelve weeks. Search visibility builds over time.' },
      { q: 'Can anyone guarantee page 1 on Google?', a: 'No. Nobody controls Google. An honest company promises the work, not the ranking.' },
    ],
    cta: { pill: 'XpertForge', title: 'A website planned for search from day one', href: '/website-design/', label: 'Website design in Malaysia' },
  },
  {
    slug: 'ai-seo-malaysia', tag: 'AI search', art: 'ai', date: '2026-11-11',
    h1: 'AI SEO in Malaysia: what it is, and does it work?',
    title: 'AI SEO in Malaysia: What It Is, and Does It Work?',
    description: 'AI SEO means making your website easy for AI tools like ChatGPT and Gemini to read, trust and quote. A plain guide for businesses in Malaysia.',
    card: 'AI SEO means making your website easy for AI tools to read, trust and quote.',
    short: 'AI SEO means making your website easy for AI tools such as ChatGPT, Gemini and the AI answers in Google to read, understand and quote. For a business in Malaysia it works best as an addition to normal SEO, not a replacement. Clear facts, short answers and good structure help with both.',
    sections: [
      { id: 'how-ai-search-is-different', h: 'How AI search is different', html: `<p>On Google, people type a few words and choose from a list of links. With an AI tool, people ask a full question and get one written answer, often with only a few sources named.</p>
<p>People in Malaysia are doing both: searching on Google and asking AI tools for a recommendation.</p>
<p>That changes the goal. It is no longer only about being on the list. It is about being one of the sources the answer is built from. To be used, your website has to be easy to read and safe to quote.</p>` },
      { id: 'what-ai-tools-look-for', h: 'What makes a website easy for AI to quote', html: `<ul><li><b>Clear facts.</b> What you do, who it is for, what it costs and how to reach you, written plainly.</li>
<li><b>Short answer blocks.</b> A direct answer at the top of the page, before the detail.</li>
<li><b>Well ordered headings.</b> Headings that read like the questions people ask.</li>
<li><b>One topic per page.</b> A page about everything is hard to quote for anything.</li>
<li><b>Structured data.</b> Extra labels in the code that tell machines the facts, such as your business name and your questions and answers.</li>
<li><b>An llms.txt file.</b> A short, plain summary of your website for AI tools. It is a new idea and not every AI tool reads it yet, but it is quick to add.</li></ul>
<p>AI systems reward clear content over clever content.</p>` },
      { id: 'does-it-work', h: 'Does AI SEO work?', html: `<p>It helps, with honest limits. Nobody can promise that an AI tool will name your business, because the companies that make those tools decide how they choose sources, and they change it often.</p>
<p>What you can control is how clear and well structured your website is. The good news is that the same work also helps on Google, so nothing is wasted. Be careful with anyone who guarantees results in AI answers.</p>` },
      { id: 'other-names', h: 'Other names you may hear', html: `<p>AI SEO goes by several names. GEO means generative engine optimisation. AEO means answer engine optimisation. Some people say LLM optimisation. They all describe the same idea: helping AI tools understand and use your content.</p>` },
      { id: 'how-we-do-it', h: 'How we build it in', html: `<p>Every website we build is planned for Google and AI search before it is designed. <a href="/ai-website-builder/">XpertCore, our own AI website builder</a>, drafts the page plan, headings and answer first copy, and adds structured data and an llms.txt file. Then our experts check and refine every page.</p>
<p>After launch, every XpertCare plan includes a monthly Google and AI visibility report, so you can see how you are doing in both places.</p>` },
    ],
    faqs: [
      { q: 'Is AI SEO different from normal SEO?', a: 'It builds on normal SEO. The basics are the same: clear pages, good structure and useful answers. AI SEO adds short answer blocks, structured data and an llms.txt file.' },
      { q: 'Does Google still matter now that people use AI tools?', a: 'Yes. People still use Google, and more and more of them also ask AI tools. A website should be easy to find in both.' },
      { q: 'What is an llms.txt file?', a: 'It is a short text file that sums up your website for AI tools: who you are, what you offer and where the key pages are.' },
      { q: 'Can you guarantee an AI tool will recommend my business?', a: 'No, and nobody honestly can. We make your website clear, well structured and easy to quote, which gives it the best chance.' },
    ],
    cta: { pill: 'XpertCore', title: 'See how our AI builder plans every page', href: '/ai-website-builder/', label: 'How XpertCore works' },
  },
  {
    slug: 'website-maintenance-malaysia', tag: 'Website maintenance', art: 'care', date: '2026-11-11',
    h1: 'Website maintenance in Malaysia: what it covers and costs',
    title: 'Website Maintenance in Malaysia: Cost and What It Covers',
    description: `Website maintenance in Malaysia: the regular work that keeps a website safe, up to date and growing. See what it covers and costs, from ${fmt(basic)} a month.`,
    card: 'It is the regular work that keeps a website safe, up to date and growing after launch.',
    short: `Website maintenance is the regular work that keeps a website safe, up to date and useful after it goes live: updates, backups, security, fixes and new content. With SEOXpert in Malaysia it is called XpertCare and costs ${fmt(basic)} to ${fmt(pro)} a month, with hosting included.`,
    sections: [
      { id: 'what-it-covers', h: 'What website maintenance covers', html: `<ul><li><b>Updates.</b> The website is kept up to date so it keeps working the way it should.</li>
<li><b>Backups.</b> Regular copies are saved, so nothing is lost if something goes wrong.</li>
<li><b>Uptime watch and security.</b> Someone notices when the website is down or at risk.</li>
<li><b>Fixes.</b> We check for issues every few days and fix what we find.</li>
<li><b>Changes.</b> New prices, new photos, new opening hours.</li>
<li><b>New content.</b> Fresh blog posts and answers, so the website keeps growing.</li>
<li><b>Search health.</b> Keywords are tracked every week, and pages that are not ranking yet are improved.</li>
<li><b>Reporting.</b> A Google and AI visibility report every month.</li></ul>` },
      { id: 'why-it-matters', h: 'Why a website needs it', html: `<p>A website is not finished on launch day. Things break quietly: a form stops sending, a page slows down, a price goes out of date. Visitors notice before you do.</p>
<p>Search visibility also builds over time. A website that is looked after keeps its gains instead of losing them.</p>` },
      { id: 'what-it-costs', h: 'What website maintenance costs in Malaysia', html: `<p>Website maintenance prices in Malaysia depend on what is included, so check the list before you compare. XpertCare has three plans. Hosting is included in every one.</p>${careTable}
<p>Pay yearly and you get ${yearly.text}: 12 months for the price of ${yearly.pay}.</p>` },
      { id: 'who-it-is-for', h: 'Who XpertCare is for', html: `<p>XpertCare is only for websites we build with XpertForge, and we host them, so we know every part of what we care for. Your care plan can be as big as your website, not bigger: ${basic.name} fits any XpertForge website, ${plus.name} needs Business or Growth, and ${pro.name} needs Growth.</p>
<p>See the plans on the <a href="/website-maintenance/">website maintenance</a> page.</p>` },
    ],
    faqs: [
      { q: 'Is hosting included?', a: 'Yes. Hosting is included with every XpertCare plan.' },
      { q: 'Can you maintain a website that someone else built?', a: 'No. XpertCare is only for websites we build with XpertForge.' },
      { q: 'Can I pay for a year at once?', a: `Yes. Pay yearly and you get ${yearly.text}.` },
      { q: 'Does maintenance guarantee better rankings?', a: 'No. Nobody can promise rankings. Maintenance keeps your website healthy and improves the pages that are not ranking yet.' },
    ],
    cta: { pill: 'XpertCare', title: `Monthly care from ${fmt(basic)}, hosting included`, href: '/website-maintenance/', label: 'See XpertCare plans' },
  },
  {
    slug: 'choose-web-design-company-malaysia', tag: 'Choosing', art: 'pick', date: '2026-11-11',
    h1: 'How to choose a web design company in Malaysia',
    title: 'How to Choose a Web Design Company in Malaysia | SEOXpert',
    description: 'Choose a web design company in Malaysia by checking four things: real work you can visit, a clear price, a plan for search, and who looks after the website.',
    card: 'Check the work they have built, how they plan for search, and who looks after the website after launch.',
    short: 'Choose a web design company in Malaysia by checking four things: work you can actually visit, a clear price with the writing included, a plan for Google and AI search from the start, and who looks after the website after launch.',
    sections: [
      { id: 'look-at-real-work', h: '1. Look at work you can visit', html: `<p>Pictures of websites are easy to fake. Ask for links to live websites and open them on your phone. Do they load quickly? Can you tell what the business does within a few seconds? Is it easy to get in touch?</p>
<p>We only show work we built ourselves. You can see it on our <a href="/website-design/#work">website design</a> page.</p>` },
      { id: 'get-a-clear-price', h: '2. Get a clear price', html: `<p>A good web design company can tell you the price and what it includes before a long sales call. Check these points:</p>
<ul><li>Is the writing included, or do you have to supply every word?</li><li>How many pages do you get?</li><li>How many rounds of changes are included?</li><li>Is anything charged every month, and is it optional?</li></ul>
<p>Our prices are public on the <a href="/packages/">website design packages</a> page. Read more in <a href="/blog/website-design-price-malaysia/">website design price in Malaysia</a>.</p>` },
      { id: 'ask-about-search', h: '3. Ask how they plan for search', html: `<p>A website nobody can find does not help your business. Ask how the company plans for Google and for AI tools. A good answer mentions keyword research, one clear topic per page, titles and descriptions, fast pages and structured data.</p>
<p>If search is described as an extra to add later, expect to pay for it twice. Read more in our <a href="/blog/seo-malaysia-guide/">guide to SEO in Malaysia</a>.</p>` },
      { id: 'ask-what-happens-after', h: '4. Ask what happens after launch', html: `<p>Websites need updates, backups and fixes. Ask who does that work, what it costs, and how you ask for a change. Also ask where the website is hosted.</p>
<p>With us, that is <a href="/website-maintenance/">XpertCare</a>, an optional monthly plan with hosting included.</p>` },
      { id: 'red-flags', h: 'Warning signs to watch for', html: `<ul><li><b>Promises of page 1.</b> Nobody controls Google or AI tools. Honest companies promise the work, not the ranking.</li>
<li><b>No price until a call.</b> It usually means the price depends on what they think you can pay.</li>
<li><b>Reviews you cannot check.</b> Look for names, links and real websites.</li>
<li><b>No answer about who does the work.</b> Ask if it is outsourced.</li></ul>` },
    ],
    faqs: [
      { q: 'Should I choose the cheapest quote?', a: 'Not by price alone. Compare what is included: the writing, the number of pages, the search setup and the care after launch.' },
      { q: 'What should I prepare before I contact a web design company?', a: 'What you do, who you serve and what you want the website to achieve. A short chat is enough to start.' },
      { q: 'Can a web design company guarantee I will rank first?', a: 'No. Nobody can promise a ranking. A good company builds a clear, fast, well structured website and looks after it over time.' },
    ],
    cta: { pill: 'XpertForge', title: 'See what we build, and what it costs', href: '/website-design/', label: 'Website design in Malaysia' },
  },
];

export const postUrl = (p: Post) => `/blog/${p.slug}/`;
export const niceDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
