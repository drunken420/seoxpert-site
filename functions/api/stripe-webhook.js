// Stripe tells us here when something happens to a payment (Cloudflare Pages Function, runs at /api/stripe-webhook).
// We check the message really came from Stripe (its signature), then email contact@seoxpert.my so our team can start:
//   checkout.session.completed     someone paid (Trial, XpertRank, a build, or an upgrade in the XpertInsight dashboard)
//   invoice.payment_failed         a monthly XpertRank payment failed (Stripe retries and emails the client itself)
//   customer.subscription.deleted  an XpertRank plan was cancelled
// Stripe sends the client their own receipt, so nothing goes to the client from here.
//
// Settings (Cloudflare Pages > Settings > Variables and Secrets): STRIPE_WEBHOOK_SECRET (whsec_..., from the webhook
// you add in Stripe for https://seoxpert.my/api/stripe-webhook) and RESEND_API_KEY (already there for the contact form).
import { orderMail } from './order-mail.js';
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
    // The boxes from checkout.js fields(): name, company, website (older payments had one box, website or business name).
    const box = {}; (o.custom_fields || []).forEach((f) => { if (f.text && f.text.value) box[f.key] = f.text.value; });
    const site = box.website || (m.slug ? `insight.seoxpert.my/${m.slug}/` : m.kind === 'build' ? 'None yet' : 'Not given');
    const what = { foresight: m.plan || 'XpertForesight', trial: 'XpertRank Trial', xpertrank: 'XpertRank (website built elsewhere)', build: 'XpertForge website build', upgrade: 'XpertRank upgrade from the XpertInsight dashboard' }[m.kind] || 'A payment';
    const rows = [['Paid', money(o.amount_total || 0, o.currency)], ['For', `${what}: ${m.item || ''}${m.bill && m.bill !== 'once' ? `, every ${m.bill}` : ''}`], ['Name', box.name || who.name], ['Company', box.company], ['Email', who.email], ['Phone', who.phone], ['Website', site]];
    const next = { trial: 'Next: set up their XpertInsight Trial (setup page, "Let the client set it up") and email them.', xpertrank: 'Next: add them in XpertInsight with "Who built the website?" set to elsewhere, and email them.', build: 'Next: email them to start planning their website. It is paid in full.', upgrade: `Their dashboard (${m.slug || 'their link'}) switches to the new plan by itself. Nothing to change; maybe say thank you.` }[m.kind] || '';
    // A free test code (XpertInsight team home "Free test codes"): 100% off, so nothing was paid.
    const free = (o.amount_total || 0) === 0 && (o.amount_subtotal || 0) > 0;
    if (free) { rows[0] = ['Paid', `Nothing: a free test code took off ${money(o.amount_subtotal, o.currency)}`]; }
    const why = free ? (m.kind === 'build' ? 'A free test code was used, so nothing was paid. Check with them before starting any work.' : next) : next;
    return { free, subject: `${free ? 'Free test order' : 'New payment'}: ${what}, ${money(o.amount_total || 0, o.currency)}${ev.livemode ? '' : ' (TEST)'}`, reply: who.email, rows, next: why, link: dash(o.payment_intent ? `payments/${o.payment_intent}` : o.subscription ? `subscriptions/${o.subscription}` : 'payments') };
  }
  if (ev.type === 'invoice.payment_failed') return { subject: `XpertRank payment failed${ev.livemode ? '' : ' (TEST)'}`, reply: o.customer_email, rows: [['Amount', money(o.amount_due || 0, o.currency)], ['Email', o.customer_email], ['Attempt', o.attempt_count]], next: 'Stripe tries again and emails the client. You may want to check in with them.', link: dash(`invoices/${o.id}`) };
  if (ev.type === 'customer.subscription.deleted' && (o.metadata || {}).kind === 'foresight') return { subject: `XpertForesight plan cancelled${ev.livemode ? '' : ' (TEST)'}`, rows: [['Plan', (o.metadata || {}).plan], ['Customer', o.customer]], next: 'Their XpertForesight account stops by itself at the end of the paid time. Nothing to change.', link: dash(`subscriptions/${o.id}`) };
  if (ev.type === 'customer.subscription.deleted') return { subject: `XpertRank plan cancelled${ev.livemode ? '' : ' (TEST)'}`, rows: [['Plan', (o.metadata || {}).item], ['Customer', o.customer]], next: 'Change their plan or end their account on the XpertInsight setup page.', link: dash(`subscriptions/${o.id}`) };
  return null;
}

/** Asks XpertInsight to invite the payer (insight.seoxpert.my/hooks/paid). Never throws: the payment email still goes out. */
export async function invite(env, session, f = fetch) {
  try {
    const r = await f(`${env.INSIGHT_URL || 'https://insight.seoxpert.my'}/hooks/paid`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session }), redirect: 'manual' });
    const j = await r.json().catch(() => ({}));
    const t = { test: !!j.test, testError: j.testError || '' };
    if (r.ok && j.ok) return { ok: true, invited: j.invited, plan: j.plan, ...t };
    if (j.already) return { already: true, ...t };
    return { ...t, why: j.skip || j.error || (j.notes && j.notes[0]) || (r.status >= 300 && r.status < 400 ? 'the dashboard asked for a login: the /hooks Bypass is not set up yet' : `error ${r.status}`), plan: j.plan };
  } catch (e) { return { why: e.message }; }
}

export async function onRequestPost({ request, env }) {
  const body = await request.text();
  if (!(await verify(body, request.headers.get('stripe-signature'), String(env.STRIPE_WEBHOOK_SECRET || '').trim()))) return new Response('bad signature', { status: 400 });
  let ev; try { ev = JSON.parse(body); } catch { return new Response('bad body', { status: 400 }); }
  const m = mail(ev);
  // Trial and XpertRank for a website built elsewhere: XpertInsight sends the dashboard invite by itself (Suhen 2026-11-16,
  // "Yes, automatic"). It asks Stripe about the session with its own key, so we only pass the id. Builds stay manual.
  const kind = m && ev.type === 'checkout.session.completed' ? ((ev.data.object.metadata || {}).kind || '') : '';
  let invited; // did XpertInsight send the dashboard invite? (the buyer's email says so)
  // A free test code on a dashboard upgrade: XpertInsight still has to stop that plan after its first month.
  if (['trial', 'xpertrank'].includes(kind) || (kind === 'upgrade' && m.free)) {
    const r = await invite(env, ev.data.object.id);
    invited = !!(r.ok || r.already);
    m.next = kind === 'upgrade' ? m.next : r.ok ? `Done for you: ${r.invited} got their XpertInsight invite (${r.plan}). They set up their dashboard at /start/ and you get an email when it is ready. Next: choose their target keywords on the setup page.`
      : r.already ? 'Their XpertInsight invite was already sent.'
      : `The automatic XpertInsight invite did not go out (${r.why}). Send it on the setup page: "Let the client set it up" with ${r.plan || 'their plan'}.`;
    if (m.free && ev.data.object.mode === 'subscription') m.next = (m.next ? m.next + ' ' : '') + (r.test ? 'Free code (founder\'s invite): this plan stops by itself after 14 days, so they are never charged.' : `Free code: please check in Stripe that this plan is set to cancel after 14 days${r.testError ? ` (${r.testError})` : ''}.`);
  }
  // XpertForesight (Suhen 2026-11-17, ready to sell): XpertInsight makes the account, sends the welcome email and emails
  // our team itself (finish() in its lib/fscheckout.js). We only pass the session on, in case the buyer closed the page
  // before it came back from Stripe, and send no second email.
  if (kind === 'foresight') { const r = await invite(env, ev.data.object.id); if (r.ok || r.already) return new Response('ok'); m.next = `XpertForesight did not confirm this order (${r.why || 'no answer'}). Open the XpertForesight team page and check the customer's plan.`; }
  if (!m || !env.RESEND_API_KEY) return new Response('ok');
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1026">
    <p style="margin:0 0 6px;color:#7b18c1;font-weight:700;letter-spacing:.08em;font-size:12px">SEOXPERT PAYMENTS${ev.livemode ? '' : ' · TEST MODE'}</p>
    <h1 style="margin:0 0 16px;font-size:22px">${esc(m.subject)}</h1>
    <table role="presentation" style="border-collapse:collapse;font-size:15px;margin-bottom:16px">${m.rows.filter((r) => r[1] !== undefined && r[1] !== null && r[1] !== '').map((r) => `<tr><td style="padding:4px 16px 4px 0;color:#786c88">${esc(r[0])}</td><td style="padding:4px 0"><b>${esc(r[1])}</b></td></tr>`).join('')}</table>
    ${m.next ? `<p style="background:#f7f2fc;border-radius:12px;padding:14px 16px;font-size:15px;margin:0 0 16px">${esc(m.next)}</p>` : ''}
    <a href="${esc(m.link)}" style="display:inline-block;background:#7b18c1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Open in Stripe</a></div>`;
  // If the email fails, Stripe still has the payment; answer 500 so Stripe tries this message again later.
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: FROM, to: [env.CONTACT_TO || TO], ...(m.reply ? { reply_to: m.reply } : {}), subject: m.subject, text: m.rows.map((r) => `${r[0]}: ${r[1] ?? ''}`).join('\n') + `\n\n${m.next}\n${m.link}`, html }) });
  if (!r.ok) return new Response('mail failed', { status: 500 });
  // The buyer's own email (order-mail.js), only after ours went out, so a Stripe retry never sends it twice.
  const om = ev.type === 'checkout.session.completed' ? orderMail(ev.data.object, { invited }) : null;
  if (om) { try { await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: FROM, to: [om.to], reply_to: env.CONTACT_TO || TO, subject: om.subject, text: om.text, html: om.html }) }); } catch { /* the payment and our email are safe */ } }
  return new Response('ok');
}
