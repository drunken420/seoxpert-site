// Blog guides. Newest first: the first three show in the magazine layout, the rest in the card grid.
// Rules: answer first, plain words, real facts only. Prices come from packages.ts so they can never disagree with the packages page.
// Never promise rankings. No invented numbers, clients or results: examples are clearly marked as examples.
// Add a new guide at the TOP of the list. Headings use single quotes and no apostrophes (scripts/make-pics.cjs reads them).
// Styling helpers inside html: <h3>, <ol>, <div class="btip"><b>Tip</b>...</div>, <ul class="bcheck"> (tick list).
import { build, care, fmt, fmtYear, yearly } from './packages';

export interface Post {
  slug: string; tag: string; art: 'cost' | 'care' | 'ai' | 'seo' | 'pick' | 'map' | 'city' | 'stack';
  h1: string; title: string; description: string; date: string;
  short: string; card: string;
  sections: { id: string; h: string; html: string }[];
  faqs: { q: string; a: string }[];
  cta: { pill: string; title: string; href: string; label: string };
}

const [starter, business, growth] = build.tiers;
const [basic, plus, pro] = care.tiers;
const buildTable = `<div class="btable" tabindex="0" role="region" aria-label="XpertForge packages table"><table><thead><tr><th>Package</th><th>Price, paid once</th><th>Pages</th><th>Blog posts at launch, on top</th></tr></thead><tbody>
<tr><td>${starter.name}</td><td>${fmt(starter)}</td><td>Up to 5</td><td>2</td></tr>
<tr><td>${business.name}</td><td>${fmt(business)}</td><td>Up to 10</td><td>5</td></tr>
<tr><td>${growth.name}</td><td>${fmt(growth)}</td><td>Up to 20</td><td>10</td></tr>
</tbody></table></div>`;
const careTable = `<div class="btable" tabindex="0" role="region" aria-label="XpertCare plans table"><table><thead><tr><th>Plan</th><th>Price a month</th><th>Paid yearly</th><th>What changes each month</th></tr></thead><tbody>
<tr><td>${basic.name}</td><td>${fmt(basic)}</td><td>${fmtYear(basic)}</td><td>3 text or photo changes, 1 new blog post, 5 keywords tracked weekly</td></tr>
<tr><td>${plus.name}</td><td>${fmt(plus)}</td><td>${fmtYear(plus)}</td><td>10 text or photo changes, 2 new blog posts, 10 keywords tracked weekly</td></tr>
<tr><td>${pro.name}</td><td>${fmt(pro)}</td><td>${fmtYear(pro)}</td><td>Up to 20 small changes, 4 new blog posts, 20 keywords tracked weekly</td></tr>
</tbody></table></div>`;
const inEvery = `<ul class="bcheck"><li>Highly rankable content: answer first copy for every page, checked by our experts</li>
<li>Full keyword research with XpertCore, before anything is designed</li>
<li>Google SEO and AI search optimisation, including structured data and an llms.txt file</li>
<li>A blog on top of your pages, with posts written at launch</li>
<li>A WhatsApp button and a contact page</li>
<li>${starter.name}: 2 revision rounds. ${business.name} and ${growth.name}: 3</li></ul>`;

export const posts: Post[] = [
  {
    slug: 'local-seo-malaysia', tag: 'Local SEO', art: 'map', date: '2026-11-11',
    h1: 'Local SEO in Malaysia: how to be found in your area',
    title: 'Local SEO in Malaysia: How to Be Found in Your Area',
    description: 'Local SEO in Malaysia, step by step: say where you work, complete your Google Business Profile, keep your details the same, earn real reviews and make contact easy.',
    card: 'A step by step guide to help people near you find your business on Google and Google Maps.',
    short: 'Local SEO is the work of helping people near you find your business when they search with a place in mind, such as a service in Kuala Lumpur, Selangor or Petaling Jaya, or simply "near me". It comes down to six steps: say clearly where you work, complete your Google Business Profile, keep your details the same everywhere, earn real reviews, give each service something useful to say, and make it easy to get in touch.',
    sections: [
      { id: 'what-is-local-seo', h: 'What local SEO means, and who needs it', html: `<p>Some searches are about a topic, like "how to clean an air conditioner". Others are about a place: "aircon service Petaling Jaya", "tuition centre near me", "dentist open now". For the second kind, Google shows results in two places: a map with a short list of businesses, and the normal list of websites below it.</p>
<p>Local SEO is the work that helps your business appear in both. It matters most if customers come to you, or you go to them:</p>
<ul><li>Shops, restaurants, cafes and salons</li><li>Clinics, dentists and other health services</li><li>Tuition centres, schools and studios</li><li>Contractors, repair services, movers and cleaners</li><li>Professional offices such as lawyers and accountants</li></ul>
<p>If you sell only online to customers anywhere, normal SEO matters more. Start with our <a href="/blog/seo-malaysia-guide/">guide to SEO in Malaysia</a>.</p>` },
      { id: 'how-google-picks', h: 'How Google chooses local results', html: `<p>Google explains that local results are based mainly on three things. Knowing them shows you where to put your effort.</p>
<h3>Relevance</h3><p>How well your business matches what was searched. If someone searches "wedding cake" and your profile and website only say "bakery", Google has less to go on. Describe what you actually offer, in the words customers use.</p>
<h3>Distance</h3><p>How far your business is from the person searching, or from the place they named. You cannot change where you are, but you can say clearly which areas you cover.</p>
<h3>Prominence</h3><p>How well known and trusted your business looks. Reviews, mentions on other websites and a website with real, useful content all add to it.</p>
<div class="btip"><b>Good to know</b>Nobody can pay Google to rank higher in the free local results. Anyone who sells a guaranteed spot on the map is selling something they do not control.</div>` },
      { id: 'say-where-you-work', h: '1. Say clearly where you work', html: `<p>Google cannot guess your area, and neither can a customer who lands on your website. Write it in plain words, in the places people look:</p>
<ul><li><b>Your home page.</b> One clear sentence near the top: what you do and where.</li>
<li><b>Each service page.</b> Mention the areas that service covers, naturally, once or twice.</li>
<li><b>Your contact page and footer.</b> Your address if customers visit you, or your service area if you go to them.</li></ul>
<p>A sentence like "We repair and service air conditioners for homes and offices in Petaling Jaya and the rest of Selangor" tells both people and search engines exactly what they need to know. Compare that with "We provide quality solutions for all your needs", which says nothing.</p>
<div class="btip"><b>Avoid this</b>Do not copy the same page twenty times with only the town name changed. Pages like that add nothing for the reader, and search engines are built to ignore them. Only name places you really serve, and give each page something real to say.</div>` },
      { id: 'google-business-profile', h: '2. Complete your Google Business Profile', html: `<p>A Google Business Profile is the box with your name, hours, phone number, photos and reviews that shows on Google Search and Google Maps. It is free from Google, and for local searches it is often the first thing a customer sees.</p>
<h3>Setting it up</h3>
<ol><li>Sign in to Google Business Profile with the Google account you want to own it. Use a business account you will keep, not a staff member's personal one.</li>
<li>Search for your business name. If a profile already exists, claim it instead of making a second one.</li>
<li>Choose your <b>main category</b> carefully. It is one of the strongest signals of what you do. Pick the most specific one that fits, then add a few extra categories if they are true.</li>
<li>Add your address if customers visit you. If you travel to customers and do not receive them at your premises, set a service area and hide the address.</li>
<li>Verify the profile. Google offers different ways to confirm you are the owner, and you need to finish this step before the profile goes fully live.</li></ol>
<h3>Filling it in properly</h3>
<ul><li><b>Hours,</b> including special hours for public holidays and festive seasons, so nobody turns up to a closed door.</li>
<li><b>Phone number and website,</b> the same as on your website.</li>
<li><b>Services or products,</b> listed one by one with short descriptions.</li>
<li><b>Real photos</b> of your work, your team and your premises. Customers trust real pictures far more than stock images.</li>
<li><b>A short description</b> in plain words: what you do, who it is for and where.</li></ul>` },
      { id: 'same-details-everywhere', h: '3. Keep your details the same everywhere', html: `<p>Your business name, address and phone number appear in many places: your website, your Google profile, your Facebook page, map apps, directories and old listings you may have forgotten about. When they disagree, both customers and search engines become less sure which one is right.</p>
<ul class="bcheck"><li>Write your name, address and phone number once, exactly as you want them, and use that version everywhere.</li>
<li>Search for your business name and old phone numbers to find listings that need updating.</li>
<li>When you move or change numbers, update your website and Google profile first, then the rest.</li>
<li>Close duplicate listings instead of leaving two versions online.</li></ul>` },
      { id: 'real-reviews', h: '4. Earn real reviews, and reply to them', html: `<p>Reviews help people choose between businesses that look similar, and they are part of how prominent your business appears. The best reviews come from asking at the right moment.</p>
<h3>How to ask</h3>
<ul><li>Ask when the customer is happiest: right after a job well done, or when they thank you.</li>
<li>Send the direct review link from your Google profile, so it takes one tap.</li>
<li>Keep the message short and personal, for example: "Thank you for choosing us. If you have a minute, a short review on Google would help other customers find us."</li></ul>
<h3>How to reply</h3>
<p>Reply to every review, good or bad. Thank people by name for good ones. For a bad one, stay calm, say sorry for the experience, and offer to sort it out privately. Future customers read the replies as much as the reviews.</p>
<div class="btip"><b>Never do this</b>Do not buy reviews, write your own, or offer discounts or gifts in return for reviews. All of these go against Google's rules, can get reviews removed, and customers often spot them.</div>` },
      { id: 'useful-content', h: '5. Give each service something useful to say', html: `<p>A website with one short page about everything gives Google very little to match against. A page for each main service, written for the customer, gives it much more.</p>
<p>A good service page answers the questions a customer has before they call:</p>
<ul><li>What exactly do you do, and what is not included?</li><li>Which areas do you cover?</li><li>How does it work, step by step?</li><li>What do customers usually ask before they book?</li><li>How do they get in touch, and how soon will you reply?</li></ul>
<p>Add real photos of real jobs where you can. A blog helps too: short posts that answer the questions customers ask you every week keep giving Google something new and useful to find.</p>` },
      { id: 'make-contact-easy', h: '6. Make it easy to get in touch', html: `<p>A local search usually ends with a call, a message or directions. Every extra step between a search and a conversation loses customers.</p>
<ul class="bcheck"><li>A phone number people can tap to call on a phone</li><li>A WhatsApp button, since that is how many people prefer to reach a business</li><li>A short contact form for people who would rather write</li><li>Your opening hours, near the contact details</li><li>A website that loads quickly on mobile data</li></ul>
<p>Every website we build includes a WhatsApp button and a contact page. See <a href="/website-design/">website design in Malaysia</a>.</p>` },
      { id: 'is-it-working', h: 'How to tell if it is working', html: `<p>You do not need expensive tools to see whether local SEO is helping. Two free tools from Google cover most of it:</p>
<ul><li><b>Google Business Profile performance</b> shows how many people found your profile, and how many called, asked for directions or clicked through to your website.</li>
<li><b>Google Search Console</b> shows which searches your website appeared for and how often people clicked.</li></ul>
<p>The simplest check of all: ask every new customer how they found you, and keep a note. Local SEO builds slowly, so look at the trend over several months rather than week to week.</p>` },
      { id: 'mistakes', h: 'Common local SEO mistakes to avoid', html: `<ul><li><b>A half finished Google profile</b> with no hours, no photos and the wrong category.</li>
<li><b>Different phone numbers</b> on the website, Google and Facebook.</li>
<li><b>Stuffing town names</b> into every sentence, or making copies of one page for many towns.</li>
<li><b>Ignoring reviews,</b> especially the unhappy ones.</li>
<li><b>A website that is slow or hard to use on a phone,</b> which is where most local searches happen.</li>
<li><b>Never updating anything,</b> so holiday hours, prices and photos go out of date.</li></ul>` },
    ],
    faqs: [
      { q: 'Is a Google Business Profile free?', a: 'Yes. Google does not charge for a Business Profile.' },
      { q: 'Do I need a website for local SEO?', a: 'A Google Business Profile can work alone, but a clear website gives Google and customers far more to go on: what you do, where you work and how to reach you.' },
      { q: 'Should I list every town on my website?', a: 'No. Name the places you really serve, and give each page something useful to say. A long list of towns with nothing behind it does not help.' },
      { q: 'Can I show on Google Maps without a shop address?', a: 'Yes. If you travel to your customers, you can set a service area in your Google Business Profile and hide your address.' },
      { q: 'Can you promise I will show first on Google Maps?', a: 'No. Nobody controls Google. We build a clear website that says where you work and makes contact easy, which gives you the best chance.' },
    ],
    cta: { pill: 'XpertForge', title: 'A website that says clearly where you work', href: '/website-design/', label: 'Website design in Malaysia' },
  },
  {
    slug: 'website-design-kuala-lumpur-selangor', tag: 'Website design', art: 'city', date: '2026-11-11',
    h1: 'Website design in Kuala Lumpur and Selangor: a checklist',
    title: 'Website Design in Kuala Lumpur and Selangor: A Checklist',
    description: 'Getting a website designed for a business in Kuala Lumpur, Selangor or Petaling Jaya? Use this checklist before you choose a designer and before you pay.',
    card: 'A practical checklist for businesses in Kuala Lumpur, Selangor and Petaling Jaya before they pay for a website.',
    short: `Before you pay for website design in Kuala Lumpur, Selangor or Petaling Jaya, check seven things: the website will say where you work, the price is clear and in ringgit, the writing is included, it works well on a phone, it is planned for Google and AI search, you know what you will own, and someone looks after it after launch. With SEOXpert a website costs from ${fmt(starter)}, paid once.`,
    sections: [
      { id: 'before-you-start', h: 'Before you start: decide what the website is for', html: `<p>The best websites have one main job. Decide yours before you talk to any designer, because it shapes every page:</p>
<ul><li><b>Calls and WhatsApp messages,</b> for services people need soon, like repairs.</li>
<li><b>Bookings or enquiries,</b> for clinics, studios, tuition and professional services.</li>
<li><b>Trust,</b> for businesses where customers check you out before they call, like contractors and consultants.</li>
<li><b>Visits,</b> for shops, cafes and restaurants.</li></ul>
<p>Then gather what you already have: your logo, real photos, a list of your services, your prices if you show them, and the questions customers ask you most. A designer who receives this on day one can do far better work.</p>` },
      { id: 'say-where-you-work', h: '1. The website will say where you work', html: `<p>People search with a place in mind: a service in Kuala Lumpur, in Selangor or in Petaling Jaya. Your website should name the areas you serve in plain words, on the home page, the service pages and the contact page, so both customers and Google know you are a match.</p>
<p>Ask the designer how they will show your location and service area. More on this in <a href="/blog/local-seo-malaysia/">local SEO in Malaysia</a>.</p>` },
      { id: 'clear-price', h: '2. The price is clear, and in ringgit', html: `<p>You should know the full price, and what it includes, before you agree to anything. Ask for it in writing. Our website builds are called XpertForge, and each one is a single price, paid once:</p>${buildTable}
<p>Whoever you choose, ask these questions about the price:</p>
<ul class="bcheck"><li>Is this the full price, or are there extras later?</li><li>How many pages and how many rounds of changes are included?</li><li>Is anything charged every month or every year, and is it optional?</li><li>When do I pay, and how much up front?</li></ul>
<p>See what each package includes on the <a href="/packages/">website design packages</a> page, or read <a href="/blog/website-design-price-malaysia/">website design price in Malaysia</a>.</p>` },
      { id: 'writing-included', h: '3. The writing is included, and written to rank', html: `<p>Many quotes leave the words to you. Writing is usually the slowest part of a new website, and it is the part that decides whether people understand you and whether search engines can find you. A beautiful design with thin words does not bring customers.</p>
<p>Ask who writes the pages, and how. Good website writing:</p>
<ul><li>starts each page with a short, direct answer to what the visitor wants to know,</li><li>uses the words customers actually search for, found through keyword research,</li><li>sounds like your business, not like a template.</li></ul>
<p>With us, highly rankable content is included in every package. XpertCore drafts it from full keyword research, and our experts check and refine every page.</p>` },
      { id: 'works-on-phones', h: '4. It works well on a phone', html: `<p>Many of your customers will meet your business on a phone, often on mobile data. Before you choose a designer, open some of the websites they have built on your own phone and check:</p>
<ul class="bcheck"><li>Does it load quickly, even away from Wi-Fi?</li><li>Can you read the text without zooming in?</li><li>Are buttons big enough to tap easily?</li><li>Can you call or message the business in one or two taps?</li></ul>
<p>Google also offers a free tool called PageSpeed Insights that tests any page and explains what slows it down. Speed is part of <a href="/website-development/">website development</a>, and it is easiest to get right when a website is built for it from the start.</p>` },
      { id: 'planned-for-search', h: '5. It is planned for Google and AI search', html: `<p>A website nobody can find does not help your business. Ask how each page is planned: which searches it answers, what the title and headings say, and how the facts about your business are labelled for search engines and AI tools.</p>
<p>If the answer is "we can do SEO later", be careful. Adding search after the design is finished often means rewriting pages and paying twice. We plan every page for Google and AI search before it is designed, using <a href="/ai-website-builder/">XpertCore, our own AI website builder</a>.</p>` },
      { id: 'what-you-own', h: '6. You know what you will own', html: `<p>Ask these before you sign, whoever you work with:</p>
<ul><li><b>The domain name:</b> whose name is it registered in, and who pays to renew it each year?</li>
<li><b>Your content:</b> the words and photos made for your website.</li>
<li><b>Accounts:</b> who has access to things like Google Search Console and Google Analytics for your website?</li></ul>
<p>Clear answers now save a lot of trouble later, for example if you ever want to change providers.</p>` },
      { id: 'after-launch', h: '7. Someone looks after it after launch', html: `<p>A website needs updates, backups and fixes once it is live, and it needs new content to keep growing. Ask who does this work, what it costs, and how you ask for a change.</p>
<p>With us that is <a href="/website-maintenance/">XpertCare</a>, an optional monthly plan with high speed hosting included, from ${fmt(basic)} a month. We actively check your website every few days, fix what we find and make SEO and AI search improvements when they are needed.</p>` },
      { id: 'do-you-need-to-meet', h: 'Do you need to meet in person?', html: `<p>No. We work remotely, with businesses in Kuala Lumpur, Selangor, Petaling Jaya, across Malaysia and all around the world. Everything starts with a friendly conversation by email or chat: tell us a little about your business and what you would love your website to do, and we take it from there.</p>` },
      { id: 'the-checklist', h: 'The whole checklist on one screen', html: `<ul class="bcheck"><li>I know the one main job of my website</li><li>The website will say clearly where I work</li><li>I have the full price in writing, in ringgit</li><li>I know what is paid once and what is paid every month</li><li>The writing is included and planned around real searches</li><li>Their websites load quickly and work well on my phone</li><li>Every page is planned for Google and AI search before design</li><li>I know who owns the domain name, the content and the accounts</li><li>I know who looks after the website after launch</li></ul>` },
    ],
    faqs: [
      { q: 'How much does website design cost in Kuala Lumpur?', a: `With SEOXpert it costs ${fmt(starter)} to ${fmt(growth)}, paid once, wherever you are. The price depends mostly on how many pages you need.` },
      { q: 'Do you only work with businesses in Kuala Lumpur and Selangor?', a: 'No. We work remotely, so we work with businesses across Malaysia and all around the world.' },
      { q: 'Is the writing included?', a: 'Yes. Every XpertForge package includes highly rankable content, written for you from keyword research and checked by our experts.' },
      { q: 'What should I prepare before I contact a designer?', a: 'Decide the one main job of your website, then gather your logo, real photos, a list of your services and the questions customers ask you most.' },
      { q: 'How do I start?', a: 'Just send us a message. Tell us a little about your business and what you would love your website to do, and we will happily suggest the package that fits you best.' },
    ],
    cta: { pill: 'XpertForge', title: `Website design from ${fmt(starter)}, paid once`, href: '/packages/', label: 'See packages' },
  },
  {
    slug: 'website-design-packages-malaysia', tag: 'Packages', art: 'stack', date: '2026-11-11',
    h1: 'Website design packages in Malaysia: which one fits?',
    title: 'Website Design Packages in Malaysia: Which One Fits?',
    description: `Compare website design packages in Malaysia: Starter, Business and Growth, from ${fmt(starter)}. See what each includes, with examples of which one fits which business.`,
    card: 'Starter, Business or Growth? What each website design package includes, with examples of who it suits.',
    short: `Choose a website design package by counting the pages you need. ${starter.name} (${fmt(starter)}) covers up to 5 pages, ${business.name} (${fmt(business)}) up to 10 pages, and ${growth.name} (${fmt(growth)}) up to 20 pages. Every package also has a blog, counted separately from the pages. Each is paid once, and highly rankable content and keyword research are included in all three.`,
    sections: [
      { id: 'side-by-side', h: 'The three packages side by side', html: `<p>Our website builds are called XpertForge. Prices are in ringgit and paid once.</p>${buildTable}
<p>The size changes. The quality does not. Every package includes:</p>${inEvery}` },
      { id: 'what-counts-as-a-page', h: 'What counts as a page', html: `<p>A page is one address on your website with its own topic, such as your home page, your about page or one service. Most businesses need a few pages that every website has, plus one for each main thing they sell:</p>
<ul><li><b>Home:</b> what you do, for whom and where, and how to get in touch.</li>
<li><b>About:</b> who is behind the business and why customers can trust you.</li>
<li><b>One page for each main service or product.</b></li>
<li><b>Contact:</b> every way to reach you, with your hours.</li>
<li><b>Questions:</b> the answers customers ask for before they buy.</li></ul>
<p>Blog posts are not counted as pages. Every package has a blog on top, with posts written at launch: 2 with Starter, 5 with Business and 10 with Growth.</p>` },
      { id: 'count-your-pages', h: 'Three examples to help you count', html: `<p>These are made up examples, to show how the counting works.</p>
<h3>A home tuition service: ${starter.name}</h3>
<p>Home, About, Subjects, Fees and how it works, Contact. That is 5 pages, which fits ${starter.name}. The 2 blog posts at launch could answer questions parents ask, like how to choose a tutor.</p>
<h3>An air conditioning company: ${business.name}</h3>
<p>Home, About, Contact, Questions, plus a page each for installation, servicing, repair, chemical wash, gas top up and commercial work. That is 10 pages, which fits ${business.name}. One page per service means each one can answer the searches for that service.</p>
<h3>A renovation company: ${growth.name}</h3>
<p>Home, About, Contact, Questions, a page for each type of renovation, and pages showing finished projects. That can easily pass 10 pages, so ${growth.name}, with up to 20, gives room to grow.</p>
<div class="btip"><b>Tip</b>One clear topic per page is easier to find than one long page about everything. If a service matters to your business, it deserves its own page.</div>` },
      { id: 'why-a-blog', h: 'Why the blog matters', html: `<p>Your pages say what you sell. Your blog answers everything customers wonder about before they buy: how much things cost, how to choose, what to watch out for. Those questions are searched every day, and each good answer is another way for people to find you.</p>
<p>Blog posts also help with AI tools, which look for clear, direct answers to quote. The posts written at launch give your blog a start, and an XpertCare plan adds new ones every month.</p>` },
      { id: 'revision-rounds', h: 'How revision rounds work', html: `<p>A revision round is one batch of changes you ask for after seeing the design and writing. ${starter.name} includes 2 rounds, and ${business.name} and ${growth.name} include 3.</p>
<p>To get the most from each round, collect all your changes in one list before you send them, and ask anyone else who needs to approve the website to add theirs to the same list. Clear, complete feedback in one go gives a better result than many small messages.</p>` },
      { id: 'add-monthly-care', h: 'Adding monthly care', html: `<p>After launch you can add XpertCare, our optional monthly plan with high speed hosting included. With every plan we actively check your website every few days, fix what we find, and make SEO and AI search improvements when they are needed.</p>${careTable}
<p>Your care plan can be as big as your website, not bigger: ${basic.name} fits any XpertForge website, ${plus.name} needs Business or Growth, and ${pro.name} needs Growth. Pay yearly and you get ${yearly.text}.</p>
<p>The <a href="/packages/#plan">plan picker</a> on the packages page adds it up for you.</p>` },
      { id: 'still-not-sure', h: 'Between two sizes?', html: `<p>Think about the next year, not only launch day. If you plan to add services, or want a page for each type of job you do, the bigger size gives you room.</p>
<p>If you are still unsure, <a href="/contact/">tell us about your business</a> and we will say honestly which size fits. If a smaller package is enough, we will tell you.</p>` },
    ],
    faqs: [
      { q: 'What is the cheapest website design package?', a: `${starter.name} at ${fmt(starter)}, paid once, for up to 5 pages.` },
      { q: 'Is the price paid once or every month?', a: `The website build is paid once. Monthly care with XpertCare is separate and optional, from ${fmt(basic)} a month.` },
      { q: 'Do blog posts count as pages?', a: 'No. Every package has a blog on top of its pages, with 2, 5 or 10 posts written at launch depending on the package.' },
      { q: 'Do all packages include the writing?', a: 'Yes. Highly rankable content and full keyword research are included in every XpertForge package.' },
      { q: 'Can I take a small website with the biggest care plan?', a: `No. A care plan can be as big as the website, not bigger. ${starter.name} takes ${basic.name}.` },
    ],
    cta: { pill: 'XpertForge', title: 'Compare the packages and build your plan', href: '/packages/', label: 'See packages' },
  },
  {
    slug: 'website-design-price-malaysia', tag: 'Website design', art: 'cost', date: '2026-11-11',
    h1: 'Website design price in Malaysia: what does it cost?',
    title: 'Website Design Price in Malaysia: What It Costs | SEOXpert',
    description: `Website design in Malaysia costs from ${fmt(starter)} with SEOXpert, paid once. See what changes the price, the costs to ask about and what it costs each month.`,
    card: `A new business website in Malaysia costs from ${fmt(starter)}, paid once. The price depends mostly on how many pages you need.`,
    short: `Website design in Malaysia with SEOXpert costs ${fmt(starter)} to ${fmt(growth)}, paid once. The price depends mostly on how many pages you need. Highly rankable content, keyword research, and Google and AI search optimisation are included in every package. When you compare quotes, compare what is included, not only the price.`,
    sections: [
      { id: 'what-changes-the-price', h: 'What changes the price of a website', html: `<p>Website design prices in Malaysia vary widely from one company to the next, which makes quotes hard to compare. Most of the cost is the amount of work, and five things decide how much work there is.</p>
<h3>How many pages you need</h3><p>A five page website for a new business is far less work than a twenty page website with a blog. Each page needs planning, writing, design and checking.</p>
<h3>Who writes the words</h3><p>Many quotes leave the writing to you. Writing is slow, and a website with thin writing is hard to find. A quote that includes proper writing will look higher, but it saves you weeks.</p>
<h3>Whether search is planned in</h3><p>Keyword research, titles, descriptions, headings and structured data take time to do properly. Some quotes charge extra for this, and some skip it.</p>
<h3>Custom design or a template</h3><p>A ready made template is quicker and cheaper. A design made for your business takes longer, but fits your brand and your content.</p>
<h3>How many rounds of changes you get</h3><p>Every round of changes is more work, so most companies set a number. Check it before you agree.</p>` },
      { id: 'package-prices', h: 'Our website design prices in Malaysia', html: `<p>Our website builds are called XpertForge. There are three sizes, and each one is a single price, paid once.</p>${buildTable}
<p>Every package includes:</p>${inEvery}
<p>You can compare them on the <a href="/packages/">website design packages</a> page, where prices show in ringgit (RM) first, with US dollars as an option.</p>` },
      { id: 'costs-to-ask-about', h: 'Costs to ask about before you agree', html: `<p>The build price is only part of what a website costs. Whoever you work with, ask about these before you sign:</p>
<ul><li><b>Domain name.</b> Your address on the web is renewed every year with a registrar. Ask who pays, and make sure it is registered in your name.</li>
<li><b>Hosting.</b> Where the website lives, and what it costs each month or year.</li>
<li><b>Business email.</b> Email addresses on your own domain are often a separate service.</li>
<li><b>Changes after launch.</b> What it costs to update a price, a photo or a page later.</li>
<li><b>Photos and licences.</b> Whether stock photos, fonts or paid plugins are included.</li></ul>
<p>With us, high speed hosting is included with every XpertCare plan, and changes, new blog posts and active checks are part of the plan.</p>` },
      { id: 'monthly-cost', h: 'What a website costs after launch', html: `<p>A website needs looking after once it is live. With us that is optional, and it is called XpertCare. It costs ${fmt(basic)} to ${fmt(pro)} a month and includes high speed hosting, backups, security, active checks every few days with fixes, SEO and AI search optimisation when needed, new blog posts and a monthly Google and AI visibility report.</p>${careTable}
<p>If you pay yearly you get ${yearly.text}. XpertCare is only for websites we build. Read more in <a href="/blog/website-maintenance-malaysia/">website maintenance in Malaysia</a>.</p>` },
      { id: 'cheap-or-good-value', h: 'A cheap website or a good value one?', html: `<p>A very low price usually means something has been left out. It might be the writing, the search planning, the phone testing, or any help after launch. None of that shows on day one, but all of it shows over the following months, when the website brings few enquiries.</p>
<p>A good value website is one that pays for itself: people can find it, understand it quickly and get in touch easily. When you compare two quotes, line them up against the same list of what is included, and ask about anything missing.</p>` },
      { id: 'which-package', h: 'Which package fits your business', html: `<ul><li><b>${starter.name}</b> suits a first website: who you are, what you do and how to reach you, in up to 5 pages.</li>
<li><b>${business.name}</b> suits a growing business that needs a page for each service, in up to 10 pages.</li>
<li><b>${growth.name}</b> suits a bigger website with many services, products or projects to show, in up to 20 pages.</li></ul>
<p>For worked examples, read <a href="/blog/website-design-packages-malaysia/">website design packages in Malaysia</a>. Not sure? <a href="/contact/">Tell us about your business</a> and we will say honestly which size fits.</p>` },
    ],
    faqs: [
      { q: 'How much does a website cost in Malaysia?', a: `With SEOXpert a website costs ${fmt(starter)} to ${fmt(growth)}, paid once, depending mostly on how many pages you need.` },
      { q: 'Is the price paid once or every month?', a: `The website build is paid once. Monthly care with XpertCare is separate and optional, from ${fmt(basic)} a month.` },
      { q: 'Is the writing included in the price?', a: 'Yes. Highly rankable content is included in every XpertForge package. We write answer first copy for each page and our experts check it.' },
      { q: 'Do I have to take a monthly plan?', a: 'No. XpertCare is optional.' },
      { q: 'Are the prices in ringgit?', a: 'Yes. Prices are shown in RM first. The packages page also has a switch to US dollars.' },
    ],
    cta: { pill: 'XpertForge', title: `Get a website from ${fmt(starter)}`, href: '/packages/', label: 'See packages' },
  },
  {
    slug: 'seo-malaysia-guide', tag: 'SEO', art: 'seo', date: '2026-11-11',
    h1: 'SEO in Malaysia: how search engine optimisation works',
    title: 'SEO in Malaysia: How Search Engine Optimisation Works',
    description: 'SEO in Malaysia in plain words: how Google finds pages, keyword research, on page and technical SEO, content, links, local SEO and the free tools to start with.',
    card: 'How Google finds and ranks pages, and what you can do about it: keywords, pages, speed, content and links.',
    short: 'SEO (search engine optimisation) is the work of making your website easy for Google to find, understand and show to people who are searching. It has five parts: knowing what people search for (keyword research), clear and well built pages (on page and technical SEO), useful content that keeps growing, being trusted by other websites, and being visible in your area (local SEO).',
    sections: [
      { id: 'what-is-seo', h: 'What SEO means', html: `<p>When someone searches Google for something you sell, Google chooses which websites to show and in what order. SEO is everything you do to help Google choose yours: the right words, clear pages, a fast website and genuinely useful answers.</p>
<p>It is not a trick, and it is not instant. Nobody can buy a place in the normal results, and nobody can honestly promise page 1. What you can do is make your website the clearest, most useful answer you can, and keep improving it.</p>` },
      { id: 'how-google-works', h: 'How Google finds and ranks pages', html: `<p>Google works in three steps, and SEO helps with each one.</p>
<ol><li><b>Finding.</b> Google follows links and reads sitemaps to discover pages. A page nothing links to may never be found.</li>
<li><b>Understanding.</b> Google reads each page and stores what it is about. Clear titles, headings and writing make this easy. Words hidden inside pictures make it hard.</li>
<li><b>Ranking.</b> When someone searches, Google picks the pages it thinks answer best, looking at how relevant, useful and trustworthy each one seems, and whether it works well on the device being used.</li></ol>` },
      { id: 'keyword-research', h: 'Keyword research: start with what people type', html: `<p>Keyword research means finding the words people actually use when they search for what you offer. Businesses often describe themselves one way while customers search another. A company may say "climate control solutions" while customers type "aircon service".</p>
<h3>How to start</h3>
<ul><li>List your services, then write down how a customer would describe each one.</li>
<li>Type those words into Google and look at the suggestions that appear as you type.</li>
<li>Look at the "People also ask" questions on the results page.</li>
<li>Once your website is live, Google Search Console shows the real searches it appears for.</li></ul>
<p>Then give each important search its own page, and match what the searcher wants. Someone searching a price wants prices. Someone searching "how to" wants steps. With every XpertForge website, full keyword research with XpertCore is done before anything is designed.</p>` },
      { id: 'on-page-seo', h: 'On page SEO: the part inside your pages', html: `<p>On page SEO is the work done on the pages themselves. It is the part you control most.</p>
<ul><li><b>One clear topic per page</b>, chosen from what people actually search for.</li>
<li><b>A title</b> that says plainly what the page is about. It is the blue link people see in Google.</li>
<li><b>A description</b> that sums up the page in a sentence or two, often shown under the title.</li>
<li><b>Headings</b> in a sensible order that read like the questions people ask.</li>
<li><b>Answer first writing:</b> a short, plain answer at the top, then the detail.</li>
<li><b>Links between your pages</b> with words that say where the link goes.</li>
<li><b>Pictures with alt text</b> that describes them, for screen readers and search engines.</li></ul>
<div class="btip"><b>Example</b>A weak title: "Home". A strong one: "Aircon Service in Petaling Jaya | Your Business Name". The second tells people and Google exactly what they will find.</div>` },
      { id: 'technical-seo', h: 'Technical SEO: the part under the bonnet', html: `<p>Technical SEO is about how the website is built. Visitors rarely see it, but it decides how easily Google can read your pages and how well they work on a phone.</p>
<ul class="bcheck"><li>Fast pages, especially on phones and mobile data</li><li>A layout that works on every screen size</li><li>A secure address (https)</li><li>A sitemap that lists every page for search engines</li><li>Clean, readable page addresses</li><li>Structured data: labels in the code that state the facts about your business</li><li>No broken links or missing pages</li></ul>
<p>This is the heart of our <a href="/website-development/">website development</a> work: we build websites to be read easily by Google and AI tools from the first line of code.</p>` },
      { id: 'helpful-content', h: 'Content that deserves to rank', html: `<p>Google says it aims to reward content made to help people, not content made only to rank. In practice that means:</p>
<ul><li>Answer the question fully, but get to the point.</li><li>Show real experience: your own photos, your own process, what you have learned doing the work.</li><li>Keep it accurate and up to date. Old prices and old opening hours cost trust.</li><li>Write for one reader at a time, in plain words.</li></ul>
<p>A blog is the easiest way to keep adding useful content. Each post that answers a real customer question is another way to be found.</p>` },
      { id: 'links', h: 'Links from other websites', html: `<p>When other websites link to yours, it is a sign that you are worth knowing about. Quality matters far more than quantity. A few links from relevant, real websites are worth more than many from unrelated ones.</p>
<p>Good links usually come from real relationships: suppliers and partners, industry associations, local news, events you take part in, and directories your customers actually use. Buying links goes against Google's rules and can hurt your website.</p>` },
      { id: 'local-seo', h: 'Local SEO: being found in your area', html: `<p>If customers come to you, or you go to them, local SEO helps people nearby find you, including on Google Maps. The basics: say clearly where you work, complete your free Google Business Profile, keep your details the same everywhere, and earn real reviews.</p>
<p>Our <a href="/blog/local-seo-malaysia/">local SEO guide</a> goes through it step by step.</p>` },
      { id: 'starts-with-the-website', h: 'Why SEO starts with how the website is built', html: `<p>Most websites are designed first and fixed for search later. That order causes the same problems again and again: pages with no clear topic, important words placed inside pictures where machines cannot read them, heavy pages that load slowly on phones.</p>
<p>Fixing these later often means rebuilding pages, so you pay twice. Our <a href="/website-design/">website design in Malaysia</a> works the other way round: every page is planned for Google and AI search before it is designed. Planning for search does not mean a plain website. You can try live animation and 3D in <a href="/demos/">XpertLab</a>.</p>` },
      { id: 'how-long', h: 'How long SEO takes', html: `<p>SEO is slow by nature. Google needs time to find and trust new pages, and how long it takes depends on how many others compete for the same searches and how much useful content you have. Think in months, not days, and be wary of anyone who promises fast results.</p>
<p>Search visibility also builds on itself, which is why a website needs looking after once it is live. Read more in <a href="/blog/website-maintenance-malaysia/">website maintenance in Malaysia</a>. More and more people also ask AI tools instead of searching, and the same clear website helps there too. See <a href="/blog/ai-seo-malaysia/">AI SEO in Malaysia</a>.</p>` },
      { id: 'free-tools', h: 'Free tools to start with', html: `<ul><li><b>Google Search Console:</b> which searches you appear for, which pages are found, and any problems Google sees.</li>
<li><b>Google Business Profile:</b> your listing on Google Search and Maps.</li>
<li><b>PageSpeed Insights:</b> how fast a page is, and what slows it down.</li>
<li><b>Google Analytics:</b> how many people visit and what they do on your website.</li></ul>` },
    ],
    faqs: [
      { q: 'What is the difference between on page SEO and technical SEO?', a: 'On page SEO is the content of each page: topic, title, headings and writing. Technical SEO is how the website is built: speed, phone layout, security, sitemap and structured data.' },
      { q: 'What is keyword research?', a: 'Finding the words people actually type when they search for what you offer, so each page can answer a real search.' },
      { q: 'Can SEO be added to a website later?', a: 'Yes, but it is harder and usually costs more, because pages often need to be rewritten or rebuilt.' },
      { q: 'How long does SEO take to show results?', a: 'Think in months, not days. It depends on how many others compete for the same searches and how much useful content you have.' },
      { q: 'Can anyone guarantee page 1 on Google?', a: 'No. Nobody controls Google. An honest company promises the work, not the ranking.' },
    ],
    cta: { pill: 'XpertForge', title: 'A website planned for search from day one', href: '/website-design/', label: 'Website design in Malaysia' },
  },
  {
    slug: 'ai-seo-malaysia', tag: 'AI search', art: 'ai', date: '2026-11-11',
    h1: 'AI SEO in Malaysia: what it is, and does it work?',
    title: 'AI SEO in Malaysia: What It Is, and Does It Work?',
    description: 'AI SEO means making your website easy for AI tools like ChatGPT and Gemini to read, trust and quote. How it works, how to write for it, and how to check it.',
    card: 'AI SEO means making your website easy for AI tools to read, trust and quote. Here is how.',
    short: 'AI SEO means making your website easy for AI tools such as ChatGPT, Gemini, Perplexity and the AI answers in Google to read, understand and quote. It works best as an addition to normal SEO, not a replacement. Clear facts, short direct answers, good structure and the same details everywhere help with both.',
    sections: [
      { id: 'how-ai-search-is-different', h: 'How AI search is different', html: `<p>On Google, people type a few words and choose from a list of links. With an AI tool, people ask a full question, like "Which web design company should I use for a small clinic?", and get one written answer, often naming only a few sources or businesses.</p>
<p>That changes the goal. It is no longer only about being on the list. It is about being one of the sources the answer is built from. To be used, your website has to be easy to read and safe to quote.</p>` },
      { id: 'where-answers-come-from', h: 'Where AI answers get their information', html: `<p>Different tools work in different ways, but most answers come from a mix of two sources:</p>
<ul><li><b>What the tool learned in training,</b> from a very large amount of text read in the past.</li>
<li><b>A live search of the web,</b> where the tool reads current pages and often shows links to them.</li></ul>
<p>The AI answers inside Google draw on pages Google has found. So the basics still apply: if search engines cannot find and understand your pages, AI tools are less likely to use them.</p>` },
      { id: 'what-ai-tools-look-for', h: 'What makes a website easy for AI to quote', html: `<ul><li><b>Clear facts.</b> What you do, where, what it costs and how to reach you, written plainly on the page, not hidden in pictures.</li>
<li><b>Short answer blocks.</b> A direct answer at the top of the page, before the detail.</li>
<li><b>Headings that read like questions</b> people actually ask.</li>
<li><b>One topic per page.</b> A page about everything is hard to quote for anything.</li>
<li><b>Structured data.</b> Labels in the code that state the facts, such as your business name, your services and your questions and answers.</li>
<li><b>An llms.txt file.</b> A short, plain summary of your website for AI tools. It is a new idea and not every tool reads it yet, but it is quick to add.</li></ul>` },
      { id: 'write-to-be-quoted', h: 'How to write pages AI tools can quote', html: `<p>AI tools reward clear writing over clever writing. Compare these two openings for a made up bakery:</p>
<div class="btip"><b>Hard to quote</b>Welcome to our world of passion, where every creation tells a story crafted with love.</div>
<div class="btip"><b>Easy to quote</b>We bake custom birthday and wedding cakes in Petaling Jaya. Orders need three days notice, and you can order by WhatsApp or through our website.</div>
<p>The second one answers what, where and how in two sentences. A person or an AI can repeat it accurately. A few habits help every page:</p>
<ul><li>Put the answer in the first sentence or two.</li><li>Use real names for things: your services, your areas, your product names.</li><li>Use lists and tables for steps, options and prices.</li><li>Add a questions section with the questions customers really ask.</li></ul>` },
      { id: 'same-facts-everywhere', h: 'Keep your facts the same everywhere', html: `<p>AI tools compare what they find in different places. If your website, your Google Business Profile and your social media pages give different phone numbers, hours or services, the tool has to guess, and it may get it wrong or leave you out.</p>
<p>Check your main facts once and keep them the same everywhere: business name, what you do, where you work, how to contact you and your hours.</p>` },
      { id: 'check-how-ai-sees-you', h: 'How to check what AI tools say about you', html: `<p>You can test this yourself in a few minutes:</p>
<ol><li>Open two or three AI tools, such as ChatGPT, Gemini and Perplexity.</li>
<li>Ask the questions your customers would ask, for example "Who offers this service in my area?" or "What does this business do?" using your business name.</li>
<li>Note what is said, and whether any facts are wrong or missing.</li>
<li>Fix the source: make the facts clear on your website and your Google profile.</li></ol>
<p>Answers change over time and from one person to the next, so check again every month or two rather than relying on one test.</p>` },
      { id: 'does-it-work', h: 'Does AI SEO work?', html: `<p>It helps, with honest limits. Nobody can promise that an AI tool will name your business, because the companies that make those tools decide how they choose sources, and they change it often.</p>
<p>What you can control is how clear, consistent and well structured your website is. The good news is that the same work also helps on Google, so nothing is wasted. Be careful with anyone who guarantees results in AI answers.</p>` },
      { id: 'other-names', h: 'Other names you may hear', html: `<p>AI SEO goes by several names. GEO means generative engine optimisation. AEO means answer engine optimisation. Some people say LLM optimisation, after the large language models behind the AI tools. They all describe the same idea: helping AI tools understand and use your content.</p>` },
      { id: 'how-we-do-it', h: 'How we build it in', html: `<p>Every website we build is planned for Google and AI search before it is designed. <a href="/ai-website-builder/">XpertCore, our own AI website builder</a>, drafts the page plan, headings and answer first copy, and adds structured data and an llms.txt file. Then our experts check and refine every page.</p>
<p>After launch, every XpertCare plan includes active checks every few days with SEO and AI search (LLM) optimisation when needed, plus a monthly Google and AI visibility report, so you can see how you are doing in both places.</p>` },
    ],
    faqs: [
      { q: 'Is AI SEO different from normal SEO?', a: 'It builds on normal SEO. The basics are the same: clear pages, good structure and useful answers. AI SEO adds short answer blocks, consistent facts, structured data and an llms.txt file.' },
      { q: 'Does Google still matter now that people use AI tools?', a: 'Yes. People still use Google, and more and more of them also ask AI tools. A website should be easy to find in both.' },
      { q: 'What is an llms.txt file?', a: 'It is a short text file that sums up your website for AI tools: who you are, what you offer and where the key pages are.' },
      { q: 'How can I see what AI tools say about my business?', a: 'Ask a few AI tools the questions your customers would ask, note any wrong or missing facts, and fix them on your website and Google profile.' },
      { q: 'Can you guarantee an AI tool will recommend my business?', a: 'No, and nobody honestly can. We make your website clear, well structured and easy to quote, which gives it the best chance.' },
    ],
    cta: { pill: 'XpertCore', title: 'See how our AI builder plans every page', href: '/ai-website-builder/', label: 'How XpertCore works' },
  },
  {
    slug: 'website-maintenance-malaysia', tag: 'Website maintenance', art: 'care', date: '2026-11-11',
    h1: 'Website maintenance in Malaysia: what it covers and costs',
    title: 'Website Maintenance in Malaysia: Cost and What It Covers',
    description: `Website maintenance in Malaysia: the regular work that keeps a website safe, up to date and growing: what it covers, what can go wrong and the cost, from ${fmt(basic)} a month.`,
    card: 'The regular work that keeps a website safe, up to date and growing after launch, and what it costs.',
    short: `Website maintenance is the regular work that keeps a website safe, fast, up to date and growing after it goes live: hosting, backups, security, checks and fixes, changes, new content and search improvements. With SEOXpert it is called XpertCare and costs ${fmt(basic)} to ${fmt(pro)} a month, with high speed hosting included. We actively check your website every few days and make SEO and AI search improvements when they are needed.`,
    sections: [
      { id: 'what-it-covers', h: 'What website maintenance covers', html: `<ul><li><b>Hosting.</b> A fast, reliable home for your website.</li>
<li><b>Backups.</b> Regular copies are saved, so nothing is lost if something goes wrong.</li>
<li><b>Uptime watch and security.</b> Someone notices when the website is down or at risk.</li>
<li><b>Active checks.</b> We check the website every few days, fix what we find, and make SEO and AI search (LLM) improvements when they are needed.</li>
<li><b>Changes.</b> New prices, new photos, new opening hours, new offers.</li>
<li><b>New content.</b> Fresh blog posts that answer customer questions, so the website keeps growing.</li>
<li><b>Search health.</b> Keywords are tracked every week, and pages that are not ranking yet are improved.</li>
<li><b>Reporting.</b> A Google and AI visibility report every month.</li></ul>` },
      { id: 'what-goes-wrong', h: 'What goes wrong when nobody looks after a website', html: `<p>A website is not finished on launch day. Problems rarely announce themselves. They happen quietly, and visitors notice before you do:</p>
<ul><li>A contact form stops sending, and enquiries disappear without anyone knowing.</li>
<li>A page slows down after a large photo is added, and people leave before it loads.</li>
<li>A price, a phone number or opening hours go out of date.</li>
<li>A link breaks after a page is moved, and visitors hit a dead end.</li>
<li>Search visibility slips while competitors keep publishing and improving.</li></ul>
<p>Each of these costs customers. Regular checks catch them while they are small.</p>` },
      { id: 'xpertcare-rhythm', h: 'What happens every few days, every week and every month', html: `<p>With XpertCare, the work follows a steady rhythm:</p>
<h3>Every few days</h3><p>We actively check your website: that it is up, working and fast, that forms send and links work. We fix what we find, and when a page needs it, we make SEO and AI search (LLM) improvements.</p>
<h3>Every week</h3><p>Your keywords are tracked, so we can see which pages are rising and which need work.</p>
<h3>Every month</h3><p>Your text or photo changes and new blog posts, depending on your plan, plus a Google and AI visibility report so you can see where you stand.</p>` },
      { id: 'what-it-costs', h: 'What website maintenance costs', html: `<p>Website maintenance prices vary a lot, so check what is included before you compare. XpertCare has three plans, and high speed hosting is included in every one.</p>${careTable}
<p>Pay yearly and you get ${yearly.text}: 12 months for the price of ${yearly.pay}.</p>` },
      { id: 'choosing-a-plan', h: 'How to choose a plan size', html: `<p>Choose by how often your website needs to change and how fast you want it to grow:</p>
<ul><li><b>${basic.name}</b> keeps the website healthy, with a few changes and a new blog post each month. It fits any XpertForge website.</li>
<li><b>${plus.name}</b> keeps it growing, with more changes, more posts and more keywords tracked. It needs a Business or Growth website.</li>
<li><b>${pro.name}</b> grows it faster, with the most changes, posts and keywords. It needs a Growth website.</li></ul>
<p>Your care plan can be as big as your website, not bigger, because a small website does not need the biggest plan.</p>` },
      { id: 'who-it-is-for', h: 'Who XpertCare is for', html: `<p>XpertCare is only for websites we build with XpertForge, and we host them, so we know every part of what we look after. We do not maintain websites built elsewhere, but we can build you a new one first.</p>
<p>XpertCare is optional. See the plans on the <a href="/website-maintenance/">website maintenance</a> page.</p>` },
    ],
    faqs: [
      { q: 'Is hosting included?', a: 'Yes. High speed hosting is included with every XpertCare plan.' },
      { q: 'How often do you check my website?', a: 'Every few days. We fix what we find and make SEO and AI search improvements when they are needed.' },
      { q: 'Can you maintain a website that someone else built?', a: 'No. XpertCare is only for websites we build with XpertForge.' },
      { q: 'Can I pay for a year at once?', a: `Yes. Pay yearly and you get ${yearly.text}.` },
      { q: 'Does maintenance guarantee better rankings?', a: 'No. Nobody can promise rankings. Maintenance keeps your website healthy and improves the pages that are not ranking yet.' },
    ],
    cta: { pill: 'XpertCare', title: `Monthly care from ${fmt(basic)}, high speed hosting included`, href: '/website-maintenance/', label: 'See XpertCare plans' },
  },
  {
    slug: 'choose-web-design-company-malaysia', tag: 'Choosing', art: 'pick', date: '2026-11-11',
    h1: 'How to choose a web design company in Malaysia',
    title: 'How to Choose a Web Design Company in Malaysia | SEOXpert',
    description: 'Choose a web design company in Malaysia by checking real work, a clear price, a plan for search, who does the work, what you own and who looks after the website.',
    card: 'What to check, what to ask and which warning signs to watch for before you pick a web design company.',
    short: 'Choose a web design company in Malaysia by checking six things: live work you can visit, a clear price with the writing included, a plan for Google and AI search from the start, who actually does the work, what you will own, and who looks after the website after launch. Then ask the same questions to every company you talk to.',
    sections: [
      { id: 'write-a-brief', h: 'Before you start: write a short brief', html: `<p>A short brief makes every conversation faster and every quote easier to compare. Half a page is enough:</p>
<ul><li>What your business does, and what makes it different.</li><li>The one main job of the website: calls, bookings, enquiries or trust.</li><li>The pages you think you need.</li><li>What you already have: logo, photos, text.</li><li>Your budget and when you would like to launch.</li></ul>
<p>Send the same brief to every company you talk to, so you are comparing like with like.</p>` },
      { id: 'look-at-real-work', h: '1. Look at live work you can visit', html: `<p>Pictures of websites are easy to fake. Ask for links to live websites and open them on your phone:</p>
<ul class="bcheck"><li>Does it load quickly on mobile data?</li><li>Can you tell what the business does within a few seconds?</li><li>Is it easy to call, message or book?</li><li>Does it still look right a year or two after launch?</li></ul>
<p>We only show work we built ourselves. You can see it on our <a href="/website-design/#work">website design</a> page, and this website is built the same way.</p>` },
      { id: 'get-a-clear-price', h: '2. Get a clear price', html: `<p>A good web design company can tell you the price and what it includes before a long sales call. Check these points:</p>
<ul><li>Is the writing included, or do you have to supply every word?</li><li>How many pages do you get?</li><li>How many rounds of changes are included?</li><li>Is anything charged every month or year, and is it optional?</li></ul>
<p>Our prices are public on the <a href="/packages/">website design packages</a> page. Read more in <a href="/blog/website-design-price-malaysia/">website design price in Malaysia</a>.</p>` },
      { id: 'ask-about-search', h: '3. Ask how they plan for search', html: `<p>A website nobody can find does not help your business. Ask how the company plans for Google and for AI tools. A good answer mentions keyword research before design, one clear topic per page, titles and descriptions, fast pages and structured data.</p>
<p>If search is described as an extra to add later, expect to pay for it twice. Read more in our <a href="/blog/seo-malaysia-guide/">guide to SEO in Malaysia</a>.</p>` },
      { id: 'who-does-the-work', h: '4. Ask who actually does the work', html: `<p>Some companies sell the website and pass the work to someone else. That is not always bad, but you should know, because it affects quality, speed and who answers when something goes wrong.</p>
<p>Ask who will plan, write, design and build your website, and who you will talk to. At SEOXpert every website is designed and coded in house and personally planned and overseen. There is no outsourcing and no white labelling. <a href="/about/">More about us</a>.</p>` },
      { id: 'what-you-own', h: '5. Ask what you will own', html: `<ul><li><b>Domain name:</b> registered in your name, and who renews it.</li><li><b>Content:</b> the words and photos made for your website.</li><li><b>Accounts:</b> access to tools like Google Search Console and Google Analytics.</li></ul>
<p>Clear answers now prevent problems later, for example if you ever change providers.</p>` },
      { id: 'ask-what-happens-after', h: '6. Ask what happens after launch', html: `<p>Websites need hosting, updates, backups and fixes, and they need new content to keep growing. Ask who does that work, what it costs, how you ask for a change and how quickly it happens.</p>
<p>With us, that is <a href="/website-maintenance/">XpertCare</a>, an optional monthly plan with high speed hosting included. We actively check your website every few days, fix what we find and make SEO and AI search improvements when needed.</p>` },
      { id: 'questions-to-ask', h: 'Ten questions to ask any web design company', html: `<ol><li>Can I see live websites you built, and visit them on my phone?</li><li>What is the full price, and what exactly does it include?</li><li>Who writes the words, and is keyword research included?</li><li>How do you plan each page for Google and AI search?</li><li>How many pages and rounds of changes do I get?</li><li>Who will do the work, and who will I talk to?</li><li>How long will it take, and what do you need from me?</li><li>Will the domain name be in my name?</li><li>What happens after launch, and what does it cost each month?</li><li>How do I ask for a change, and how fast is it done?</li></ol>` },
      { id: 'red-flags', h: 'Warning signs to watch for', html: `<ul><li><b>Promises of page 1.</b> Nobody controls Google or AI tools. Honest companies promise the work, not the ranking.</li>
<li><b>No price until a call.</b> It can mean the price depends on what they think you can pay.</li>
<li><b>Reviews you cannot check.</b> Look for names, links and real websites.</li>
<li><b>No live examples,</b> only pictures or mockups.</li>
<li><b>Vague answers about who does the work</b> or who owns the domain name.</li>
<li><b>Pressure to decide today.</b> A good company is happy to give you time.</li></ul>` },
    ],
    faqs: [
      { q: 'Should I choose the cheapest quote?', a: 'Not by price alone. Compare what is included: the writing, the number of pages, the search setup and the care after launch.' },
      { q: 'What should I prepare before I contact a web design company?', a: 'A short brief: what your business does, the main job of the website, the pages you need, what you already have, and your budget.' },
      { q: 'Do you outsource the work?', a: 'No. Every SEOXpert website is designed and coded in house and personally planned and overseen.' },
      { q: 'Can a web design company guarantee I will rank first?', a: 'No. Nobody can promise a ranking. A good company builds a clear, fast, well structured website and looks after it over time.' },
    ],
    cta: { pill: 'XpertForge', title: 'See what we build, and what it costs', href: '/website-design/', label: 'Website design in Malaysia' },
  },
];

export const postUrl = (p: Post) => `/blog/${p.slug}/`;
export const niceDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
