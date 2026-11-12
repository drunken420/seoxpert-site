// The chat helper's questions and answers, fetched by public/js/ui.js only when someone opens the chat,
// so pages stay light. Same source as the Questions page: src/lib/faq.ts.
import { faqs, topics } from '../lib/faq';
import { site, whatsappLink } from '../config';

export function GET() {
  const data = {
    whatsapp: site.whatsapp ? whatsappLink : '',
    email: site.email ? `mailto:${site.email}` : '',
    topics,
    faqs: faqs.map((f) => ({ q: f.q, a: f.html, t: f.text, ready: f.ready, topic: f.topic, home: f.home })),
  };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
