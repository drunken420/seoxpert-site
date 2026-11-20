// The email a buyer gets from us after a checkout (Suhen 2026-11-16: "different email replies and images to the client for
// free codes and paid codes for all packages and all combos"). Sent by stripe-webhook.js, next to Stripe's own receipt.
// One template; the header picture (public/img/mail/<package>[-free].jpg, made by scripts/make-mail.cjs), the steps and the
// list of what is included change with the order:
// Two voices (Suhen 2026-11-16): a PAID order gets the fuller, premium email (payment card, plan at a glance, button);
// a FREE CODE order is a personal invite from our founder, 14 days only (XpertInsight stops the plan and the dashboard
// after 14 days), and says to reach out for extra refreshes, bugs or ideas. A paid Trial is 14 days too and gets that line.
//   trial      XpertRank Trial                         paid | free test code
//   xpertrank  XpertRank Basic..Elite, website built elsewhere, monthly | yearly, paid | free
//   build      XpertForge Starter/Business/Growth, paid in full (launch offer while it runs) | free
//   upgrade    a bigger XpertRank plan from the XpertInsight dashboard, website built by us | elsewhere, paid | free
// Rules (CLAUDE.md): free high speed cloud hosting only for websites we build (6 months with the launch offer, then while a paid
// XpertRank plan runs; Suhen 2026-11-20); 14 days of free fixes after launch; no money-back promise in these emails
// (it covers only a first paid month on websites we build, which is never bought here); never promise rankings.
import { build, care, trial, yearly, offer, offerOn, terms, fixDays, buyer } from '../../src/data/packages.ts';
import { clientMail } from '../../src/lib/client-mail.js';

/** A founder's invite (free code) and the Trial both run this long. Keep matching GUEST_DAYS in xpertinsight lib/stripe.js. */
export const GUEST_DAYS = 14;
// Suhen 2026-11-16: "dont put my name just founder". The emails never carry a person's name.
export const FOUNDER = 'The founder of SEOXpert';
const SITE = 'https://seoxpert.my', INSIGHT = 'https://insight.seoxpert.my';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// the text-only copy of the email: tags out, and codes like &amp; back to real characters ("A & B", not "A &amp; B")
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const money = (n, c) => (String(c).toLowerCase() === 'usd' ? 'US$' : 'RM') + (n / 100).toLocaleString('en-US', { minimumFractionDigits: n % 100 ? 2 : 0 });

/** Everything the email needs, worked out from a completed Checkout Session. null = not one of our orders. */
export function orderOf(o, { invited } = {}) {
  const m = o.metadata || {}, kind = m.kind, id = String(m.item || '');
  const box = {}; (o.custom_fields || []).forEach((f) => { if (f.text && f.text.value) box[f.key] = f.text.value; });
  const email = (o.customer_details && o.customer_details.email) || o.customer_email;
  if (!email || !['trial', 'xpertrank', 'build', 'upgrade'].includes(kind)) return null;
  const free = (o.amount_total || 0) === 0 && (o.amount_subtotal || 0) > 0;
  const name = String(box.name || (o.customer_details && o.customer_details.name) || '').trim();
  const t = kind === 'trial' ? trial : kind === 'build' ? build.tiers.find((x) => x.id === id) : care.tiers.find((x) => x.id === id);
  if (!t) return null;
  const at = (o.created ? o.created * 1000 : Date.now()), day = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
  return { date: day(at), ends: day(at + GUEST_DAYS * 864e5), ref: String(o.id || '').slice(-8).toUpperCase(), kind, id, t, free, email, first: name.split(/\s+/)[0] || 'there', site: box.website || '', company: box.company || '', bill: m.bill || 'once', built: m.built === 'us' ? 'us' : 'other', from: m.from || '', guestDays: GUEST_DAYS, paid: money(o.amount_total || 0, o.currency), full: money(o.amount_subtotal || o.amount_total || 0, o.currency), invited: invited !== false };
}

/** Subject, header picture, words and lists for one order. */
export function content(d) {
  const { kind, t, free } = d, kw = t.kw;
  const num = (row) => (String(row || '').match(/<b>([^<]+)<\/b>/) || [])[1] || '';
  const invite = d.invited ? 'Open the XpertInsight invite we just emailed you and set up your dashboard. It takes about 5 minutes.' : 'Our team sends your XpertInsight dashboard invite shortly. Setting it up takes about 5 minutes.';
  const work = 'We check your website every few days, fix what we find, and make SEO and AI search (LLM) optimisations when needed.';
  const reach = 'Feel free to reach out at any time: for an extra dashboard refresh, to report a bug, or to share an idea to make it better. Reply to this email or press Report in your dashboard. I read every message.';
  // paying customers get the same direct line, said as a member perk (Suhen 2026-11-16: "make paid customers feel special too")
  const member = 'As a paying member you have a direct line to me. Need a free extra dashboard refresh, found a bug, or have an idea to make it better? Feel free to reach out: reply to this email or press Report in your dashboard. I read every message.';
  const guest = (what) => `I am the founder of SEOXpert, and I am personally inviting you to ${what}, free for ${GUEST_DAYS} days, as my guest.`;
  const pass = `Nothing is charged and no card is needed. Your invite runs until ${d.ends} and then stops by itself.`;
  const careTiles = [[String(kw), 'target keywords'], [num(t.rows[1]), 'SEO blog posts a month'], [num(t.rows[3]), 'AI search questions']];
  if (kind === 'trial') return {
    pic: 'trial', subject: free ? `A personal invite from our founder: try XpertRank, free for ${GUEST_DAYS} days` : 'Your XpertRank Trial has started',
    head: free ? 'you are personally invited' : 'your XpertRank Trial has started',
    lead: free ? guest(`try XpertRank${d.site ? ` on ${esc(d.site)}` : ''}`) + ' You get your own XpertInsight dashboard with real numbers from your website.' : `Thank you for trying XpertRank${d.site ? ` for ${esc(d.site)}` : ''}. For the next ${trial.days} days you have your own XpertInsight dashboard with real numbers from your website.`,
    pass: free ? pass : '', reach,
    tiles: [[String(trial.days), 'days'], [String(kw), 'keywords tracked'], [num(trial.rows[3]), 'pages audited']],
    steps: [invite, 'In the setup, add our robot email to your Google Search Console and Google Analytics, as the page shows you. Nothing else to install.', `Your dashboard fills in with your visitors, Google searches, site health, speed and your ${kw} keywords.`, free ? 'Like it? Choose a paid XpertRank plan on seoxpert.my at any time.' : `Choose a paid XpertRank plan before your trial ends and the ${d.paid} you paid comes off your first month.`],
    incTitle: 'Your trial includes', inc: trial.rows.filter((r) => !/^No /i.test(plain(r))), cta: ['See XpertRank plans', `${SITE}/packages/#xpertrank`],
  };
  if (kind === 'build') return {
    pic: t.id, subject: free ? `A personal invite from our founder: ${t.name}` : `Your ${t.name} website is booked`,
    head: free ? 'you are personally invited' : `your ${t.name} website is booked`,
    lead: free ? `I am the founder of SEOXpert. Thank you for trying our ${t.name} checkout as my guest.` : `Thank you${d.company ? `, ${esc(d.company)}` : ''}! Your ${t.name} website is paid in full, so we can start. We are glad to build it with you.`,
    pass: free ? 'Nothing is charged. This is an invite order, so I will contact you myself before any work starts.' : '', reach: free ? 'Found a bug while ordering, or have an idea to make it better? Feel free to reach out: just reply to this email. I read every message.' : 'As our customer you have a direct line to me. A question, a change of mind or an idea for your website? Feel free to reach out: just reply to this email. I read every message.',
    tiles: [[(t.short.match(/^\d+/) || [''])[0], 'pages in total'], [num(t.rows[2]), 'revision rounds'], [String(fixDays), 'days of free fixes']],
    steps: free ? ['I will email you to ask what you would like to do next.'] : ['Our team emails you shortly to plan your pages, words and pictures with you.', 'XpertCore, our own AI SEO advisor, guides our team on what to plan, write and mark up on every page, then our experts check it.', `You see your design and words before launch, with ${num(t.rows[2])} revision rounds.`, 'We launch your website, ready for Google and AI search, and set up the extras below.'],
    offer: !free && offerOn() && t.free ? `Launch offer included: ${t.free}. ${offer.months}` : '',
    // Suhen 2026-11-20: say plainly that a build is paid once (XpertRank is the subscription).
    billing: free ? '' : `You paid ${d.paid} once. No monthly fee for the website.`, manage: '',
    // the hosting terms in writing (Suhen 2026-11-20): 6 months from launch with the offer, then only while a paid XpertRank plan runs
    hosting: free ? '' : `${buyer.hosting} ${buyer.handover}`,
    incTitle: `Your ${t.name} includes`, inc: [...t.rows, ...build.all], cta: free ? null : ['See what we build', `${SITE}/website-design/`],
  };
  const yr = d.bill === 'year';
  // Subscriptions (Suhen 2026-11-20, after his first test purchase): say it renews by itself, and where to cancel.
  const billing = free ? '' : yr ? `You paid ${d.paid} for 12 months (12 months for the price of ${yearly.pay}). This is a subscription: it renews automatically every year until you cancel.` : `You pay ${d.paid} a month. This is a subscription: it renews automatically every month until you cancel.`;
  const manage = free ? '' : `${terms.cancel} You can also change your card and see your invoices there (Manage billing).`;
  const open = ['Open your dashboard', `${INSIGHT}/welcome/`];
  if (kind === 'upgrade') return {
    pic: t.id, subject: free ? `A personal invite from our founder: ${t.name}, free for ${GUEST_DAYS} days` : `You are now on ${t.name}`,
    head: free ? 'you are personally invited' : `you are now on ${t.name}`,
    lead: free ? guest(`use ${t.name}`) + ' Your XpertInsight dashboard has already switched to it.' : `Thank you for upgrading. Your XpertInsight dashboard has switched to ${t.name}: ${t.for} for your website.`,
    pass: free ? pass : '', reach: free ? reach : member, tiles: careTiles,
    steps: ['Open your XpertInsight dashboard. Your plan shows everything that is new.', `We add your extra target keywords with you: ${kw} in total, optimised for Google and AI search (LLM) and tracked weekly.`, work],
    billing, manage, hosting: d.built === 'us' ? 'High speed cloud hosting included while you keep a paid XpertRank plan, as we built your website.' : '',
    incTitle: `${t.name} includes`, inc: t.rows, cta: open,
  };
  return { // xpertrank, a website built elsewhere
    pic: t.id, subject: free ? `A personal invite from our founder: ${t.name}, free for ${GUEST_DAYS} days` : `Welcome to ${t.name}`,
    head: free ? 'you are personally invited' : `welcome to ${t.name}`,
    lead: free ? guest(`use ${t.name}, our expert SEO service${d.site ? `, on ${esc(d.site)}` : ''}`) : `Thank you for choosing ${t.name}, our expert SEO service${d.site ? `, for ${esc(d.site)}` : ''}. You now have a team working on your website every month.`,
    pass: free ? pass : '', reach: free ? reach : member, tiles: careTiles,
    steps: [invite, `We choose your ${kw} target keywords with you. We optimise them for Google and AI search (LLM) and track them weekly.`, work, free ? `Like it? Choose a paid XpertRank plan on seoxpert.my before ${d.ends} to keep going.` : 'Every month you get your XpertRecap, a short PDF report of what changed and what we did.'],
    billing, manage, incTitle: `${t.name} includes`, inc: t.rows, cta: d.invited && !free ? null : ['See XpertRank plans', `${SITE}/packages/#xpertrank`],
  };
}

/** The finished email: { to, subject, html, text }. */
export function orderMail(o, opts) {
  const d = orderOf(o, opts); if (!d) return null;
  const c = content(d), pic = `${SITE}/img/mail/${c.pic}${d.free ? '-free' : ''}.jpg`, sub = d.kind === 'xpertrank' || d.kind === 'upgrade';
  const guestRun = d.free && d.kind !== 'build';
  const summary = d.free
    ? [['Invite', d.t.name], ['From', FOUNDER], ...(guestRun ? [['Runs', `${GUEST_DAYS} days, until ${d.ends}`]] : []), ['You pay', `Nothing (worth ${d.full})`], ...(d.site ? [['Website', d.site]] : [])]
    : [['Package', d.t.name], ['Paid', d.paid], ...(sub ? [['Billing', d.bill === 'year' ? 'Yearly subscription, renews until you cancel' : 'Monthly subscription, renews until you cancel']] : [['Payment', 'One-time, does not renew']]), ['Date', d.date], ...(d.site ? [['Website', d.site]] : [])];
  // the look depends on the kind of order (src/lib/client-mail.js): member, countdown (Trial), letter (free code), levelup (upgrade)
  const html = clientMail(d, c, pic);
  const text = [`Hi ${d.first}, ${c.head}.`, '', plain(c.lead), '', ...summary.map((r) => `${r[0]}: ${r[1]}`), ...(c.pass ? [c.pass] : []), ...(c.billing ? [`${c.billing} ${c.manage || ''}`.trim()] : []), ...(c.offer ? ['', c.offer] : []), '', 'What happens next', ...c.steps.map((s, i) => `${i + 1}. ${plain(s)}`), ...(c.cta ? ['', `${c.cta[0]}: ${c.cta[1]}`] : []), '', c.incTitle, ...c.inc.map((r) => `- ${plain(r)}`), ...(c.hosting ? ['', c.hosting] : []), ...(c.reach ? ['', c.reach] : []), '', d.free ? 'Glad to have you as my guest,' : 'Thank you for your trust,', 'The Founder, SEOXpert', SITE].join('\n');
  return { to: d.email, subject: c.subject, html, text };
}
