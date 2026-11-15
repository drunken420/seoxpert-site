// Stripe tells us here when something happens to a payment (Cloudflare Pages Function, runs at /api/stripe-webhook).
// We check the message really came from Stripe (its signature), then email contact@seoxpert.my so our team can start:
//   checkout.session.completed     someone paid (Trial, XpertRank or a build): who, what, how much, their website
//   invoice.payment_failed         a monthly XpertRank payment failed (Stripe retries and emails the client itself)
//   customer.subscription.deleted  an XpertRank plan was cancelled
// Stripe sends the client their own receipt, so nothing goes to the client from here.
//
// Settings (Cloudflare Pages > Settings > Variables and Secrets): STRIPE_WEBHOOK_SECRET (whsec_..., from the webhook
// you add in Stripe for https://seoxpert.my/api/stripe-webhook) and RESEND_API_KEY (already there for the contact form).
const FROM = 'SEOXpert <hello@seoxpert.my>';
const TO = 'contact@seoxpert.my';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n, c) => (String(c).toLowerCase() === 'usd' ? 'US$' : 'RM') + (n / 100).toLocaleString('en-US', { minimumFractionDigits: n % 100 ? 2 : 0 });

/** Stripe-Signature: t=<time>,v1=<hmac>. The HMAC-SHA256 of "<time>.<body>" with our secret must match, and be under 5 minutes old. */
export async function verify(body, header, secret, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')).filter((p) => p.length === 2 && p[0] === 't'));
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = +parts.t; if (!t || !sigs.length || Math.abs(now / 1000 - t) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${body}`)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, '0')).join('');
  return sigs.some((s) => s.length === hex.length && [...s].reduce((d, ch, i) => d | (ch.charCodeAt(0) ^ hex.charCodeAt(i)), 0) === 0);
}

/** The email for one Stripe event, or null when we don't need to hear about it. */
export function mail(ev) {
  const o = ev.data && ev.data.object || {};
  const dash = (path) => `https://dashboard.stripe.com/${ev.livemode ? '' : 'test/'}${path}`;
  if (ev.type === 'checkout.session.completed') {
    const m = o.metadata || {}, who = o.customer_details || {};
    const site = (o.custom_fields || []).map((f) => f.text && f.text.value).filter(Boolean)[0] || 'Not given';
    const what = { trial: 'XpertRank Trial', xpertrank: 'XpertRank (website built elsewhere)', build: 'XpertForge website build' }[m.kind] || 'A payment';
    const rows = [['Paid', money(o.amount_total || 0, o.currency)], ['For', `${what}: ${m.item || ''}${m.bill && m.bill !== 'once' ? `, every ${m.bill}` : ''}`], ['Name', who.name], ['Email', who.email], ['Phone', who.phone], [m.kind === 'build' ? 'Business' : 'Website', site]];
    const next = { trial: 'Next: set up their XpertInsight Trial (setup page, "Let the client set it up") and email them.', xpertrank: 'Next: add them in XpertInsight with "Who built the website?" set to elsewhere, and email them.', build: 'Next: email them to start planning their website. It is paid in full.' }[m.kind] || '';
    return { subject: `New payment: ${what}, ${money(o.amount_total || 0, o.currency)}${ev.livemode ? '' : ' (TEST)'}`, reply: who.email, rows, next, link: dash(o.payment_intent ? `payments/${o.payment_intent}` : o.subscription ? `subscriptions/${o.subscription}` : 'payments') };
  }
  if (ev.type === 'invoice.payment_failed') return { subject: `XpertRank payment failed${ev.livemode ? '' : ' (TEST)'}`, reply: o.customer_email, rows: [['Amount', money(o.amount_due || 0, o.currency)], ['Email', o.customer_email], ['Attempt', o.attempt_count]], next: 'Stripe tries again and emails the client. You may want to check in with them.', link: dash(`invoices/${o.id}`) };
  if (ev.type === 'customer.subscription.deleted') return { subject: `XpertRank plan cancelled${ev.livemode ? '' : ' (TEST)'}`, rows: [['Plan', (o.metadata || {}).item], ['Customer', o.customer]], next: 'Change their plan or end their account on the XpertInsight setup page.', link: dash(`subscriptions/${o.id}`) };
  return null;
}

export async function onRequestPost({ request, env }) {
  const body = await request.text();
  if (!(await verify(body, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET))) return new Response('bad signature', { status: 400 });
  let ev; try { ev = JSON.parse(body); } catch { return new Response('bad body', { status: 400 }); }
  const m = mail(ev);
  if (!m || !env.RESEND_API_KEY) return new Response('ok');
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1026">
    <p style="margin:0 0 6px;color:#7b18c1;font-weight:700;letter-spacing:.08em;font-size:12px">SEOXPERT PAYMENTS${ev.livemode ? '' : ' · TEST MODE'}</p>
    <h1 style="margin:0 0 16px;font-size:22px">${esc(m.subject)}</h1>
    <table role="presentation" style="border-collapse:collapse;font-size:15px;margin-bottom:16px">${m.rows.filter((r) => r[1] !== undefined && r[1] !== null && r[1] !== '').map((r) => `<tr><td style="padding:4px 16px 4px 0;color:#786c88">${esc(r[0])}</td><td style="padding:4px 0"><b>${esc(r[1])}</b></td></tr>`).join('')}</table>
    ${m.next ? `<p style="background:#f7f2fc;border-radius:12px;padding:14px 16px;font-size:15px;margin:0 0 16px">${esc(m.next)}</p>` : ''}
    <a href="${esc(m.link)}" style="display:inline-block;background:#7b18c1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Open in Stripe</a></div>`;
  // If the email fails, Stripe still has the payment; answer 500 so Stripe tries this message again later.
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: FROM, to: [env.CONTACT_TO || TO], ...(m.reply ? { reply_to: m.reply } : {}), subject: m.subject, text: m.rows.map((r) => `${r[0]}: ${r[1] ?? ''}`).join('\n') + `\n\n${m.next}\n${m.link}`, html }) });
  return new Response(r.ok ? 'ok' : 'mail failed', { status: r.ok ? 200 : 500 });
}
