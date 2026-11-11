// The questions and answers live in one place: src/fragments/home-lower.html (the homepage FAQ).
// This reads them out so the Questions page, the chat helper and the structured data all say the same thing.
import lower from '../fragments/home-lower.html?raw';

const strip = (t: string) => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const qs = [...lower.matchAll(/<button[^>]*data-q="\d+"><b>\d+<\/b>([^<]+)<\/button>/g)].map((m) => m[1]);
const as = [...lower.split('id="faqsrc"')[1].matchAll(/<p( class="ph")?>([\s\S]*?)<\/p>/g)];

export interface Faq { q: string; html: string; text: string; ready: boolean }
export const faqs: Faq[] = qs.map((q, i) => {
  const html = as[i] ? as[i][2] : '';
  return { q, html, text: strip(html), ready: !!as[i] && !as[i][1] && !/\[(DRAFT|PLACEHOLDER)\]/.test(html) };
});
/** Finished answers only: safe to show to Google and AI tools. */
export const readyFaqs = faqs.filter((f) => f.ready);
export const faqLd = { '@type': 'FAQPage', mainEntity: readyFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.text } })) };
