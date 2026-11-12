// The first ten questions and answers live in src/fragments/home-lower.html (the homepage FAQ); more live in
// src/data/faq-more.ts. This reads them out so the Questions page, the chat helper and the structured data all say the same thing.
import lower from '../fragments/home-lower.html?raw';
import { more, homeTopics, topics, type Topic } from '../data/faq-more';

const strip = (t: string) => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const qs = [...lower.matchAll(/<button[^>]*data-q="\d+"><b>\d+<\/b>([^<]+)<\/button>/g)].map((m) => m[1]);
const as = [...lower.split('id="faqsrc"')[1].matchAll(/<p( class="ph")?>([\s\S]*?)<\/p>/g)];

export interface Faq { q: string; html: string; text: string; ready: boolean; topic: Topic; home: boolean }
const isReady = (html: string) => !/\[(DRAFT|PLACEHOLDER)\]/.test(html);
const home: Faq[] = qs.map((q, i) => {
  const html = as[i] ? as[i][2] : '';
  return { q, html, text: strip(html), ready: !!as[i] && !as[i][1] && isReady(html), topic: homeTopics[i] || 'Your website', home: true };
});
const today = new Date();
const extra: Faq[] = more
  .filter((m) => !m.until || today < new Date(m.until + 'T23:59:59+08:00'))
  .map((m) => ({ q: m.q, html: m.a, text: strip(m.a), ready: isReady(m.a), topic: m.topic, home: false }));

/** Every question: the homepage ten first, then the rest. */
export const faqs: Faq[] = [...home, ...extra];
export { topics };
/** Questions grouped by topic, in topic order (for the Questions page). */
export const byTopic = topics.map((t) => ({ topic: t, items: faqs.filter((f) => f.topic === t) })).filter((g) => g.items.length);

const ld = (list: Faq[]) => ({ '@type': 'FAQPage', mainEntity: list.filter((f) => f.ready).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.text } })) });
/** Finished answers only: safe to show to Google and AI tools. All questions, for the Questions page. */
export const faqLd = ld(faqs);
/** The homepage shows only its own ten, so its structured data does too. */
export const homeFaqLd = ld(home);
export const readyFaqs = faqs.filter((f) => f.ready);
