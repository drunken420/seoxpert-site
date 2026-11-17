// Online payments (Cloudflare Pages Function, runs at /api/checkout). Suhen asked 2026-11-15; Stripe picked 2026-11-16.
// The browser says WHAT to buy (an id, RM or USD, monthly or yearly); the price always comes from src/data/packages.ts
// here on the server, so nobody can change it in their browser. We open a Stripe Checkout page and send the visitor there.
// Stripe shows the card, FPX online banking and GrabPay choices, takes the payment and emails the receipt.
//
// Settings live in the Cloudflare Pages project (Settings > Variables and Secrets), never in this repo:
//   STRIPE_SECRET_KEY      required, from dashboard.stripe.com (sk_test_... while testing, sk_live_... when live)
//   STRIPE_WEBHOOK_SECRET  required for the payment emails (functions/api/stripe-webhook.js)
// While STRIPE_SECRET_KEY is missing this answers "not set up" and the pay buttons stay hidden (see ready() below).
//
// What can be paid online (Suhen 2026-11-16):
//   trial                 XpertRank Trial, once
//   basic/plus/pro/elite  XpertRank for a website built elsewhere ("I already have a website"), every month or year.
//                         Websites we build start XpertRank after launch, through a payment link our team sends.
//   starter/business/growth  XpertForge builds, the full price before we start (Suhen 2026-11-16)
import { build, care, trial, yearly, offerOn } from '../../src/data/packages.ts';

const STRIPE = 'https://api.stripe.com/v1';
/** How builds are paid online: 'off' (contact form only) or 'full' (the whole price before we start). */
export const BUILD_PAY = 'full'; // Suhen 2026-11-16: "make it 100% pay before we start"

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** Stripe wants form fields, with nested names like line_items[0][price_data][currency]. */
export function form(obj, pre = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const name = pre ? `${pre}[${k}]` : k;
    if (typeof v === 'object') form(v, name, out); else out.append(name, String(v));
  }
  return out;
}

/** The thing being bought, with its price in sen or cents, worked out on the server only. */
export function item(id, cur, bill) {
  const usd = cur === 'USD', live = offerOn();
  const now = (t) => (usd ? (live ? t.usd : t.usdNew) : (live ? t.rm : t.rmNew));
  if (id === 'trial') return { kind: 'trial', pid: 'seoxpert-trial', name: trial.name, text: `${trial.days} days of XpertRank with your own XpertInsight dashboard`, amount: now(trial) * 100, mode: 'payment' };
  const c = care.tiers.find((t) => t.id === id);
  if (c) {
    const month = usd ? c.usdOther : c.rmOther; // online = a website built elsewhere (no launch price, no hosting, no money-back promise)
    const yr = bill === 'year';
    return { kind: 'xpertrank', pid: `seoxpert-xpertrank-${c.id}`, name: `${c.name} (${c.for})`, text: `For a website built elsewhere, paid ${yr ? `yearly (12 months for the price of ${yearly.pay})` : 'monthly'}. No free hosting or money-back promise.`, amount: month * (yr ? yearly.pay : 1) * 100, mode: 'subscription', interval: yr ? 'year' : 'month' };
  }
  const b = build.tiers.find((t) => t.id === id);
  if (b && BUILD_PAY === 'full') return { kind: 'build', pid: `seoxpert-build-${b.id}`, name: b.name, text: `${b.short}. Paid in full before we start.`, amount: now(b) * 100, mode: 'payment' };
  return null;
}

/** The boxes Stripe Checkout shows under the email: name, company and website. Keys stay the same for the payment email. */
export function fields(kind) {
  const box = (key, label, optional) => ({ key, type: 'text', optional: String(optional), label: { type: 'custom', custom: label } });
  return {
    0: box('name', 'Your full name', false),
    1: box('company', 'Company or business name', false),
    2: kind === 'build' ? box('website', 'Current website, if you have one', true) : box('website', 'Your website address', false),
  };
}

/** Are the pay buttons on? On seoxpert.my only with a live key (sk_live_...), so real visitors never meet Stripe's test
 *  mode; on previews (*.pages.dev) a test key is enough, so we can try a payment with Stripe's test card first.
 *  PAYMENTS=off in the Cloudflare settings turns them off everywhere. Nothing needs rebuilding when the keys change. */
export function ready(env, url) {
  const key = keyOf(env);
  if (!key || env.PAYMENTS === 'off') return false;
  const live = /(^|\.)seoxpert\.my$/.test(new URL(url).hostname);
  return !live || key.startsWith('sk_live_') || key.startsWith('rk_live_');
}

/** The key as pasted into Cloudflare, without stray spaces or line breaks around it. */
const keyOf = (env) => String(env.STRIPE_SECRET_KEY || '').trim();
/** Which kind of key is set (never the key itself), so a wrong paste is easy to spot: live, test, publishable, other or none. */
const kindOf = (k) => (!k ? 'none' : /^[sr]k_live_/.test(k) ? 'live' : /^[sr]k_test_/.test(k) ? 'test' : /^pk_/.test(k) ? 'publishable' : 'other');

/** The pay buttons ask this once per visit (pay.js) and show themselves only when it says on. */
export function onRequestGet({ request, env }) {
  return json({ on: ready(env, request.url), key: kindOf(keyOf(env)) });
}

/** Same website only (Suhen 2026-11-17, like the contact form and the chat): the pay buttons on our own pages, never
    another website starting checkouts in our Stripe account. A request with no Origin (not from a browser page) is
    still answered, because the prices are always worked out here and nothing is charged until Stripe's page is paid. */
function sameSite(request) {
  const o = request.headers.get('origin');
  if (!o) return true;
  try { return new URL(o).host === new URL(request.url).host; } catch { return false; }
}

export async function onRequestPost({ request, env }) {
  if (!sameSite(request)) return json({ ok: false, error: 'origin' }, 403);
  if (!ready(env, request.url)) return json({ ok: false, error: 'not_set_up' }, 503);
  let body = {};
  try { body = await request.json(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
  const cur = body.cur === 'USD' ? 'USD' : 'RM', it = item(String(body.item || ''), cur, body.bill === 'year' ? 'year' : 'month');
  if (!it) return json({ ok: false, error: 'unknown_item' }, 400);

  const origin = new URL(request.url).origin; // previews send people back to the preview, the live site to seoxpert.my
  const back = it.kind === 'build' ? '/packages/#plan' : '/packages/#xpertrank';
  const meta = { item: String(body.item), kind: it.kind, cur, bill: it.interval || 'once' };
  const session = {
    mode: it.mode,
    line_items: { 0: { quantity: 1, price_data: { currency: cur === 'USD' ? 'usd' : 'myr', unit_amount: it.amount, product: it.pid, ...(it.interval ? { recurring: { interval: it.interval } } : {}) } } },
    success_url: `${origin}/paid/?item=${encodeURIComponent(meta.item)}&kind=${it.kind}`,
    cancel_url: origin + back,
    // Stripe always asks for the email. We also ask for the name, the company and the website (Suhen 2026-11-16);
    // a new build may not have a website yet, so there it is optional. Stripe allows 3 custom fields, labels up to 50 letters.
    custom_fields: fields(it.kind),
    phone_number_collection: { enabled: 'true' },
    // codes (e.g. the Trial price off a first month, or a free test code) only for XpertRank and the Trial: website builds
    // are always paid in full, so Stripe shows no code box for them (Suhen 2026-11-17: "no trial for website builds")
    ...(it.kind === 'build' ? {} : { allow_promotion_codes: 'true' }),
    metadata: meta,
    // A free test code (made on the XpertInsight team home) takes 100% off the first payment: then Stripe asks for no card,
    // and XpertInsight stops that plan after its first month, so nobody is charged later.
    ...(it.mode === 'payment' ? { customer_creation: 'always', payment_intent_data: { metadata: meta } } : { subscription_data: { metadata: meta }, payment_method_collection: 'if_required' }),
  };
  // Each package is a fixed Stripe product (it.pid), so a free test code made for one package (XpertInsight team home)
  // only works on that package. The XpertInsight dashboard makes these products, with the same name, when the first
  // code for a package is made. Until then (or if this key may not use them) we send the name and text ourselves.
  const send = (body) => fetch(`${env.STRIPE_API || STRIPE}/checkout/sessions`, { method: 'POST', headers: { Authorization: `Bearer ${keyOf(env)}`, 'content-type': 'application/x-www-form-urlencoded' }, body: form(body) });
  let r = await send(session);
  if (!r.ok && r.status < 500) {
    const pd = session.line_items[0].price_data;
    delete pd.product; pd.product_data = { name: it.name, description: it.text };
    r = await send(session);
  }
  const s = await r.json().catch(() => ({}));
  if (!r.ok || !s.url) return json({ ok: false, error: 'stripe', detail: s.error && s.error.message }, 502);
  return json({ ok: true, url: s.url });
}
