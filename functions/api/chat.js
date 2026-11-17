// AI chat helper (Cloudflare Pages Function, runs at /api/chat). Suhen asked 2026-11-16: "make the chatbot smarter".
// The chat window (end of public/js/ui.js) sends the conversation here; we ask Claude, grounded ONLY on our own
// website facts (src/lib/chat-ai.js: packages.ts + /llms.txt + the FAQ), and send back a short answer.
// When anything is missing or goes wrong, the browser falls back to the old instant FAQ answers, so the chat never breaks.
//
// Settings live in the Cloudflare Pages project (Settings > Variables and Secrets), never in this repo:
//   ANTHROPIC_API_KEY  required, from console.anthropic.com. Without it the chat keeps the instant FAQ answers only.
//   CHAT_MODEL         optional, default claude-haiku-5-5 (Suhen 2026-11-16). claude-opus-5-5 gives sharper answers at about 40 times the cost.
//   CHAT               optional, "off" turns the AI off (FAQ answers only) without a rebuild.
//   CHAT_DAILY         optional, most AI answers a day for the whole site (default 500); after that FAQ answers only.
//   CHAT_KV            optional KV binding: makes the limits below exact across Cloudflare's servers.
//   RESEND_API_KEY     already set for the contact form: used to email us the chat when a visitor leaves their email.
// Hard money cap: set a monthly spend limit on the API key's workspace in console.anthropic.com.
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt, replySchema, cleanHistory, findEmail, checkReply } from '../../src/lib/chat-ai.js';

const TO = 'contact@seoxpert.my';
const FROM = 'SEOXpert <hello@seoxpert.my>';
const PER_HOUR = 30; // AI answers per visitor (IP) per hour
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let brief = null, briefAt = 0; // the system prompt, kept for an hour per server
async function getBrief(env, request) {
  if (brief && Date.now() - briefAt < 3600e3) return brief;
  const get = async (path) => {
    const u = new URL(path, request.url);
    const r = env.ASSETS ? await env.ASSETS.fetch(new Request(u)) : await fetch(u);
    if (!r.ok) throw new Error('asset ' + path);
    return r;
  };
  const [llms, chat] = await Promise.all([get('/llms.txt').then((r) => r.text()), get('/chat.json').then((r) => r.json())]);
  brief = systemPrompt({ llms, faqs: chat.faqs }); briefAt = Date.now();
  return brief;
}

// Limits. With the CHAT_KV binding they hold across Cloudflare's servers; without it, per server (rougher, still useful).
const mem = new Map();
async function bump(env, key, ttl) {
  if (env.CHAT_KV) {
    const n = Number((await env.CHAT_KV.get(key)) || 0) + 1;
    await env.CHAT_KV.put(key, String(n), { expirationTtl: ttl });
    return n;
  }
  const now = Date.now(), e = mem.get(key);
  const n = e && e.until > now ? e.n + 1 : 1;
  mem.set(key, { n, until: e && e.until > now ? e.until : now + ttl * 1000 });
  if (mem.size > 5000) mem.clear();
  return n;
}

/** Same website only: seoxpert.my, our previews and local testing. */
function sameSite(request) {
  const o = request.headers.get('origin');
  if (!o) return true;
  try { return new URL(o).host === new URL(request.url).host; } catch { return false; }
}

export async function onRequestPost({ request, env }) {
  if (!sameSite(request)) return json({ ok: false, error: 'origin' }, 403);
  if (!env.ANTHROPIC_API_KEY || env.CHAT === 'off') return json({ ok: false, error: 'off' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'bad' }, 400); }
  const messages = cleanHistory(body && body.messages);
  if (!messages) return json({ ok: false, error: 'bad' }, 400);
  const page = String((body && body.page) || '').slice(0, 120);

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const hour = new Date().toISOString().slice(0, 13), day = hour.slice(0, 10);
  if ((await bump(env, `ip:${ip}:${hour}`, 3700)) > PER_HOUR) return json({ ok: false, error: 'limit' }, 429);
  if ((await bump(env, `day:${day}`, 90000)) > Number(env.CHAT_DAILY || 500)) return json({ ok: false, error: 'busy' }, 429);

  // A visitor who types their email gets a real person: we email the chat to our inbox (once per email, per chat).
  const last = messages[messages.length - 1].content;
  const email = findEmail(last);
  let lead = false;
  if (email && env.RESEND_API_KEY && !(body.sent || []).includes(email.toLowerCase())) {
    lead = await sendLead(env, email, messages, page).catch(() => false);
  }
  // Website notes go after the visitor's message (a mid-conversation system message), so the cached brief stays the same for everyone.
  const country = String((request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || '').toUpperCase();
  const notes = [country && country !== 'MY' && country !== 'XX' && country !== 'T1'
    ? 'Website note: this visitor is outside Malaysia. Show prices in US$ first, with RM in brackets.'
    : 'Website note: show prices in RM (add US$ only if the visitor asks).'];
  if (email) notes.push(lead
    ? 'Website note: the visitor\'s email was passed to the SEOXpert team together with this chat. A real person will reply by email.'
    : 'Website note: the visitor typed an email address, but it could not be passed on automatically. Ask them to use the contact page (/contact/) so a real person can reply.');
  const extra = [{ role: 'system', content: notes.join('\n') }];

  let brief;
  try { brief = await getBrief(env, request); } catch { return json({ ok: false, error: 'brief' }, 503); }

  const model = env.CHAT_MODEL || 'claude-haiku-5-5'; // Suhen picked Haiku 5.5 (cheapest) on 2026-11-16
  const client = new Anthropic({ apiKey: String(env.ANTHROPIC_API_KEY).trim(), baseURL: env.CHAT_API || 'https://api.anthropic.com', maxRetries: 1, timeout: 25000 }) // CHAT_API: a stand-in for local tests only;
  const params = {
    model,
    max_tokens: 3000,
    system: [{ type: 'text', text: brief, cache_control: { type: 'ephemeral' } }, // the facts are the same for everyone: cached
      // the currency the visitor's page shows (picked by their country or their own switch; Suhen 2026-11-16)
      { type: 'text', text: body.cur === 'USD' ? 'This visitor sees prices in USD (they are outside Malaysia or chose USD). Give prices in US$ first, with RM after in brackets.' : 'This visitor sees prices in RM.' }],
    messages: [...messages, ...extra],
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: replySchema } },
  };
  // Opus, Sonnet and Fable can hand a declined answer to another model on the server (Haiku cannot).
  if (/opus|sonnet|fable/.test(model)) Object.assign(params, { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });

  const ask = async (p) => {
    const msg = await client.beta.messages.create(p);
    if (msg.stop_reason === 'refusal') return null;
    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    try { return JSON.parse(text); } catch { return { reply: text, suggestions: [] }; }
  };
  let out;
  try {
    out = await ask(params);
    // Fact check (2026-11-16): a price that is not in packages.ts, or a build described with the wrong page count, gets one more try with the problems named.
    const problems = out ? checkReply(out.reply) : [];
    if (problems.length) {
      console.log('chat fact check', problems.join(' | '));
      const fix = `Website note: a draft of this answer had mistakes: ${problems.join(' ')} Avoid them, and copy every number exactly from the WEBSITE FACTS.`;
      const again = await ask({ ...params, messages: [...messages, { role: 'system', content: `${extra[0].content}\n${fix}` }] });
      if (again && checkReply(again.reply).length) {
        // Still wrong: better the instant FAQ answers (the browser falls back to them) than a wrong price.
        console.log('chat fact check failed twice', checkReply(again.reply).join(' | '));
        return json({ ok: false, error: 'facts', lead }, 502);
      }
      out = again;
    }
  } catch (e) {
    const status = e instanceof Anthropic.RateLimitError ? 'busy' : e instanceof Anthropic.AuthenticationError ? 'key' : 'ai';
    console.log('chat error', status, e && e.status, e && e.message);
    return json({ ok: false, error: status, lead }, 502);
  }
  if (!out) return json({ ok: true, lead, reply: 'I can only help with questions about SEOXpert, our websites and our SEO service. What would you like to know?', suggestions: ['How much does a website cost?', 'What is XpertRank?'] });
  const reply = String(out.reply || '').trim().slice(0, 2000);
  if (!reply) return json({ ok: false, error: 'ai', lead }, 502);
  const suggestions = (Array.isArray(out.suggestions) ? out.suggestions : []).map((s) => String(s).trim().slice(0, 60)).filter(Boolean).slice(0, 3);
  return json({ ok: true, lead, reply, suggestions });
}

export const onRequest = () => json({ ok: false, error: 'post_only' }, 405);

/** Emails the chat to our inbox, with Reply-To the visitor, so pressing Reply answers them. */
async function sendLead(env, email, messages, page) {
  const rows = messages.map((m) => `<p style="margin:0 0 10px"><b style="color:${m.role === 'user' ? '#7b18c1' : '#786c88'}">${m.role === 'user' ? 'Visitor' : 'Assistant'}:</b> ${esc(m.content)}</p>`).join('');
  const r = await fetch(`${env.RESEND_API || 'https://api.resend.com'}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: FROM, to: [env.CONTACT_TO || TO], reply_to: email,
      subject: `Chat lead: ${email}`,
      text: `A visitor left their email in the website chat.\nEmail: ${email}\nPage: ${page || 'unknown'}\n\n` + messages.map((m) => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.content}`).join('\n\n'),
      html: `<div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#1a1026;max-width:600px;margin:0 auto;padding:24px 16px"><div style="background:#fff;border-radius:20px;padding:24px;border:1px solid #eadcf7">
        <h1 style="margin:0 0 12px;font-size:20px">New chat lead</h1>
        <p style="margin:0 0 4px">Email: <b>${esc(email)}</b></p><p style="margin:0 0 16px;color:#786c88">Page: ${esc(page || 'unknown')}</p>
        <div style="background:#f7f2fc;border-radius:12px;padding:16px;font-size:14px;line-height:1.55">${rows}</div>
        <p style="color:#786c88;font-size:13px;margin:16px 0 0">Press Reply to answer the visitor directly. The assistant's answers come from the website's own facts.</p></div></div>`,
    }),
  });
  return r.ok;
}
