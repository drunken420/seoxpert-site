// Contact form (Cloudflare Pages Function, runs at /api/contact).
// Sends the message to our inbox and a friendly copy to the visitor, through Resend.
// Settings live in the Cloudflare Pages project (Settings > Variables and Secrets), never in this repo:
//   RESEND_API_KEY        required, from resend.com (the seoxpert.my domain must be verified there)
//   TURNSTILE_SECRET_KEY  optional, turns on the Cloudflare spam check when set
//   CONTACT_TO            optional, where messages go (default contact@seoxpert.my, forwarded to Suhen)
const FROM = 'SEOXpert <hello@seoxpert.my>';
const TO = 'contact@seoxpert.my';
const SITE = 'https://seoxpert.my';
import { teamMail } from '../../src/lib/team-mail.js';

/** Our own "New enquiry" email (src/lib/team-mail.js layout): reply button, their details, their message. */
export function enquiryMail({ name, first, email, biz, site, need, message, page }) {
  const web = site ? (/^https?:\/\//i.test(site) ? site : `https://${site}`) : '';
  const from = (() => { try { return new URL(page).pathname; } catch { return '/contact/'; } })();
  return teamMail({
    tone: 'lead', kicker: 'New enquiry', title: biz ? `${name}, ${biz}` : name, sub: 'Wrote to us through the website contact form.', chip: need,
    actions: [[`mailto:${email}?subject=${encodeURIComponent('Re: your message to SEOXpert')}`, `Reply to ${first}`], web ? [web, 'Open their website'] : null],
    rows: [['Name', name], ['Company', biz || 'Not given'], ['Email', email, `mailto:${email}`], ['Website', site || 'None given', web || undefined], ['Needs', need]],
    message: { title: `${first}'s message`, text: message },
    foot: `Sent from seoxpert.my${from}. Pressing Reply in your email app also answers ${first} directly.`,
  });
}

const NEEDS = ['Website design', 'Website and XpertRank', 'XpertRank for my website', 'XpertRank Trial', 'Website redesign', 'XpertRank', 'Not sure yet']; // keep in step with the choices in src/pages/contact.astro

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (v, n) => String(v || '').trim().slice(0, n);
const line = (v, n) => clip(String(v || '').replace(/[\r\n\t]+/g, ' '), n); // one-line boxes: no line breaks (they end up in the email subject)

// The form is only for our own pages: other websites may not post to it (same rule as the chat).
function sameSite(request) {
  const o = request.headers.get('origin');
  if (!o) return true;
  try { return new URL(o).host === new URL(request.url).host; } catch { return false; }
}
// A simple brake per visitor: 6 messages an hour (per server; enough to stop a loop sending our "Thanks" email to strangers).
const sentBy = new Map();
function tooMany(ip) {
  const now = Date.now(), e = sentBy.get(ip);
  const n = e && e.until > now ? e.n + 1 : 1;
  sentBy.set(ip, { n, until: e && e.until > now ? e.until : now + 3600e3 });
  if (sentBy.size > 5000) sentBy.clear();
  return n > 6;
}

export async function onRequestPost({ request, env }) {
  if (!sameSite(request)) return json({ ok: false, error: 'origin' }, 403);
  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: 'bad_form' }, 400); }
  // Bots fill the hidden "sx_hold" box (2026-11-19: renamed from "company", which browsers autofilled for real people); say thanks and drop it.
  if (clip(form.get('sx_hold'), 200)) return json({ ok: true });

  const name = line(form.get('name'), 80), email = clip(form.get('email'), 120).toLowerCase();
  const site = line(form.get('site'), 200), biz = line(form.get('biz'), 120), message = clip(form.get('message'), 3000);
  const need = NEEDS.includes(form.get('need')) ? form.get('need') : 'Not sure yet';
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'missing' }, 400);

  if (env.TURNSTILE_SECRET_KEY) {
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET_KEY);
    body.append('response', String(form.get('cf-turnstile-response') || ''));
    body.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body }).then((r) => r.json()).catch(() => ({}));
    if (!check.success) return json({ ok: false, error: 'spam_check' }, 400);
  }
  if (!env.RESEND_API_KEY) return json({ ok: false, error: 'not_set_up' }, 503);
  const rawIp = request.headers.get('CF-Connecting-IP') || 'local';
  if (tooMany(rawIp.includes(':') ? rawIp.split(':').slice(0, 4).join(':') : rawIp)) return json({ ok: false, error: 'too_many' }, 429);

  // a network failure reaching the mail service answers "not ok" instead of crashing (the page then shows our email address)
  const send = (payload) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => ({ ok: false }));
  const first = name.split(/\s+/)[0];
  const rows = [['Name', name], ['Company', biz || 'Not given'], ['Email', email], ['Website', site || 'None given'], ['Needs', need]];

  // 1. To us. Reply-To is the visitor, so pressing Reply answers them.
  const inbox = await send({
    from: FROM, to: [env.CONTACT_TO || TO], reply_to: email,
    subject: `New enquiry from ${name}: ${need}`,
    text: rows.map((r) => `${r[0]}: ${r[1]}`).join('\n') + `\n\n${message}`,
    html: enquiryMail({ name, first, email, biz, site, need, message, page: request.headers.get('referer') }),
  });
  if (!inbox.ok) return json({ ok: false, error: 'send_failed' }, 502);

  // 2. A friendly copy to the visitor (if this one fails, the message still reached us).
  await send({
    from: FROM, to: [email], reply_to: env.CONTACT_TO || TO,
    subject: 'Thanks for getting in touch with SEOXpert',
    text: `Hi ${first},\n\nThanks for your message. A real person at SEOXpert reads every message and will reply to you by email.\n\nYour message:\n${message}\n\nWhile you wait, see our packages: ${SITE}/packages/\nOr read our guides: ${SITE}/blog/\n\nSEOXpert\nWebsites built to rank on Google and AI`,
    html: shell(`<img src="${SITE}/og.png" width="560" alt="SEOXpert: websites built to rank on Google and AI" style="display:block;width:100%;max-width:560px;height:auto;border-radius:16px;margin:0 0 24px">
      <h1 style="margin:0 0 12px;font-size:24px">Thanks, ${esc(first)}!</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">We got your message. A real person at SEOXpert reads every message and will reply to you by email.</p>
      <p style="margin:0 0 8px;font-size:14px;color:#786c88">Your message</p>
      <div style="white-space:pre-wrap;background:#f7f2fc;border-radius:12px;padding:16px;font-size:15px;line-height:1.6;margin-bottom:24px">${esc(message)}</div>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">While you wait, have a look around:</p>
      <a href="${SITE}/packages/" style="display:inline-block;background:#7b18c1;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px;margin:0 8px 8px 0">See our packages</a>
      <a href="${SITE}/blog/" style="display:inline-block;background:#f0e6fb;color:#7b18c1;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">Read our guides</a>`),
  }).catch(() => {});

  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'post_only' }, 405);

function shell(inner) {
  return `<!doctype html><html><body style="margin:0;background:#f7f2fc;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1a1026">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px"><div style="background:#fff;border-radius:20px;padding:28px 24px">${inner}</div>
  <p style="text-align:center;color:#786c88;font-size:12px;margin:18px 0 0">SEOXpert, website design in Malaysia. <a href="${SITE}" style="color:#7b18c1">seoxpert.my</a></p></div></body></html>`;
}
