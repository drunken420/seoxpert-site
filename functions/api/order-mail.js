// The email a buyer gets from us after a checkout (Suhen 2026-11-16: "different email replies and images to the client for
// free codes and paid codes for all packages and all combos"). Sent by stripe-webhook.js, next to Stripe's own receipt.
// One template; the header picture (public/img/mail/<package>[-free].jpg, made by scripts/make-mail.cjs), the steps and the
// list of what is included change with the order:
//   trial      XpertRank Trial                         paid | free test code
//   xpertrank  XpertRank Basic..Elite, website built elsewhere, monthly | yearly, paid | free
//   build      XpertForge Starter/Business/Growth, paid in full (launch offer while it runs) | free
//   upgrade    a bigger XpertRank plan from the XpertInsight dashboard, website built by us | elsewhere, paid | free
// Rules (CLAUDE.md): free high speed cloud hosting only for websites we build; no money-back promise in these emails
// (it covers only a first paid month on websites we build, which is never bought here); never promise rankings.
import { build, care, trial, yearly, offerOn } from '../../src/data/packages.ts';

const SITE = 'https://seoxpert.my', INSIGHT = 'https://insight.seoxpert.my';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = (s) => String(s).replace(/<[^>]+>/g, '');
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
  return { kind, id, t, free, email, first: name.split(/\s+/)[0] || 'there', site: box.website || '', company: box.company || '', bill: m.bill || 'once', built: m.built === 'us' ? 'us' : 'other', paid: money(o.amount_total || 0, o.currency), full: money(o.amount_subtotal || o.amount_total || 0, o.currency), invited: invited !== false };
}

/** Subject, header picture, words and lists for one order. */
export function content(d) {
  const { kind, t, free } = d, kw = t.kw;
  const dash = `<a href="${INSIGHT}/welcome/" style="color:#7b18c1">XpertInsight dashboard</a>`;
  const invite = d.invited ? 'Open the XpertInsight invite we just emailed you and set up your dashboard. It takes about 5 minutes.' : 'Our team sends your XpertInsight dashboard invite shortly. Setting it up takes about 5 minutes.';
  const work = 'We check your website every few days, fix what we find, and make SEO and AI search (LLM) optimisations when needed.';
  const subFree = 'You used a free test code, so nothing was charged. Your plan runs for one month and then stops by itself, so you will never be charged for it.';
  if (kind === 'trial') return {
    pic: 'trial', subject: free ? 'Your free XpertRank Trial has started' : 'Your XpertRank Trial has started',
    lead: `Thank you for trying XpertRank${d.site ? ` for ${esc(d.site)}` : ''}. For the next ${trial.days} days you have your own XpertInsight dashboard with real numbers from your website.`,
    freeNote: free ? `You used a free test code, so nothing was charged. Your trial runs for ${trial.days} days and then stops by itself.` : '',
    steps: [invite, 'In the setup, add our robot email to your Google Search Console and Google Analytics, as the page shows you. Nothing else to install.', `Your dashboard fills in with your visitors, Google searches, site health, speed and your ${kw} keywords.`, free ? 'Like it? Choose a paid XpertRank plan on seoxpert.my at any time.' : `Choose a paid XpertRank plan before your trial ends and the ${d.paid} you paid comes off your first month.`],
    incTitle: 'Your trial includes', inc: trial.rows,
  };
  if (kind === 'build') return {
    pic: t.id, subject: free ? `Your free test order: ${t.name}` : `Your ${t.name} website is booked`, head: free ? 'thank you for testing our checkout' : '',
    lead: free ? `Thank you for testing our checkout with ${t.name}.` : `Thank you${d.company ? `, ${esc(d.company)}` : ''}! Your ${t.name} website is paid in full, so we can start.`,
    freeNote: free ? 'You used a free test code, so nothing was charged. This is a test order: our team will contact you before any work starts.' : '',
    steps: free ? ['Our team will email you to check what you would like to do next.'] : ['Our team emails you shortly to plan your pages, words and pictures with you.', 'XpertCore, our own AI SEO advisor, guides our team on what to plan, write and mark up on every page, then our experts check it.', `You see your design and words before launch, with ${plain(t.rows[2] || '').replace(/\s*revision rounds?/, '')} revision rounds.`, 'We launch your website, ready for Google and AI search, and set up the extras below.'],
    offer: !free && offerOn() && t.free ? `Launch offer included: ${t.free}.` : '',
    incTitle: `Your ${t.name} includes`, inc: [...t.rows, ...build.all],
  };
  const yr = d.bill === 'year';
  const billing = free ? '' : yr ? `You paid ${d.paid} for 12 months (12 months for the price of ${yearly.pay}).` : `You pay ${d.paid} a month.`;
  const manage = free ? '' : 'Change your card, see invoices or cancel at any time from Your plan, Manage billing, in your dashboard.';
  if (kind === 'upgrade') return {
    pic: t.id, subject: free ? `Your free month of ${t.name}` : `You are now on ${t.name}`, head: free ? `enjoy a free month of ${t.name}` : '',
    lead: `Your XpertInsight dashboard has switched to ${t.name}, ${t.for.toLowerCase()} for your website.`,
    freeNote: free ? subFree : '',
    steps: [`Open your ${dash}. Your plan shows everything that is new.`, `We add your extra target keywords with you: ${kw} in total, optimised for Google and AI search (LLM) and tracked weekly.`, work],
    billing, manage, hosting: d.built === 'us' ? 'High speed cloud hosting included, as we built your website.' : '',
    incTitle: `${t.name} includes`, inc: t.rows,
  };
  return { // xpertrank, a website built elsewhere
    pic: t.id, subject: free ? `Your free month of ${t.name}` : `Welcome to ${t.name}`, head: free ? `enjoy a free month of ${t.name}` : '',
    lead: `Thank you for choosing ${t.name}, our expert SEO service${d.site ? `, for ${esc(d.site)}` : ''}.`,
    freeNote: free ? subFree : '',
    steps: [invite, `We choose your ${kw} target keywords with you. We optimise them for Google and AI search (LLM) and track them weekly.`, work, 'Every month you get your XpertRecap, a short PDF report of what changed and what we did.'],
    billing, manage, incTitle: `${t.name} includes`, inc: t.rows,
  };
}

/** The finished email: { to, subject, html, text }. */
export function orderMail(o, opts) {
  const d = orderOf(o, opts); if (!d) return null;
  const c = content(d), pic = `${SITE}/img/mail/${c.pic}${d.free ? '-free' : ''}.jpg`;
  const summary = [['Package', d.t.name], ['Paid', d.free ? `Nothing (free test code, worth ${d.full})` : d.paid], ...(d.kind === 'xpertrank' || d.kind === 'upgrade' ? [['Billing', d.free ? 'One month, then it stops' : d.bill === 'year' ? 'Yearly' : 'Monthly']] : []), ...(d.site ? [['Website', d.site]] : [])];
  const P = 'margin:0 0 14px;font-size:15px;line-height:1.6;color:#3a2f48';
  const html = `<!doctype html><html><body style="margin:0;background:#f4eefb;padding:24px 12px;font-family:Inter,Arial,sans-serif;color:#1a1026">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px -30px rgba(90,20,160,.45)">
<tr><td><img src="${pic}" width="600" alt="${esc(d.t.name)}${d.free ? ', free test order' : ', order confirmed'}" style="display:block;width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding:30px 32px 8px">
<h1 style="margin:0 0 14px;font:700 24px/1.25 Arial,sans-serif;color:#1a1026">Hi ${esc(d.first)}, ${esc(c.head || c.subject.charAt(0).toLowerCase() + c.subject.slice(1))}.</h1>
<p style="${P}">${c.lead}</p>
${c.freeNote ? `<p style="margin:0 0 18px;padding:14px 16px;border-radius:12px;background:#fdf3dc;color:#5a3a00;font-size:14.5px;line-height:1.55"><b>Free test order.</b> ${c.freeNote}</p>` : ''}
${c.offer ? `<p style="margin:0 0 18px;padding:14px 16px;border-radius:12px;background:#f1e6ff;color:#4b0d80;font-size:14.5px;line-height:1.55"><b>${esc(c.offer)}</b></p>` : ''}
<h2 style="margin:22px 0 10px;font:700 17px Arial,sans-serif;color:#7b18c1">What happens next</h2>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${c.steps.map((s, i) => `<tr><td valign="top" style="width:34px;padding:0 0 12px"><div style="width:24px;height:24px;border-radius:50%;background:#7b18c1;color:#fff;font:700 13px/24px Arial,sans-serif;text-align:center">${i + 1}</div></td><td style="padding:2px 0 12px;font-size:15px;line-height:1.55;color:#3a2f48">${s}</td></tr>`).join('')}</table>
<h2 style="margin:14px 0 10px;font:700 17px Arial,sans-serif;color:#7b18c1">${esc(c.incTitle)}</h2>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${c.inc.map((r) => `<tr><td valign="top" style="width:26px;padding:0 0 8px;color:#7b18c1;font-weight:700">&#10003;</td><td style="padding:0 0 8px;font-size:14.5px;line-height:1.5;color:#3a2f48">${r}</td></tr>`).join('')}</table>
${c.hosting ? `<p style="${P};margin-top:8px">${esc(c.hosting)}</p>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0 6px;background:#f7f2fc;border-radius:14px"><tr><td style="padding:16px 18px">
<div style="font:700 12px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#786c88;margin-bottom:8px">Your order</div>
<table role="presentation" cellpadding="0" cellspacing="0">${summary.map((r) => `<tr><td style="padding:3px 18px 3px 0;color:#786c88;font-size:14px">${esc(r[0])}</td><td style="padding:3px 0;font-size:14px;font-weight:700">${esc(r[1])}</td></tr>`).join('')}</table>
${c.billing ? `<p style="margin:10px 0 0;font-size:13.5px;color:#51465f">${esc(c.billing)} ${esc(c.manage)}</p>` : ''}
</td></tr></table>
<p style="${P};margin-top:18px">Questions? Just reply to this email and a real person at SEOXpert will answer.</p>
</td></tr>
<tr><td style="padding:18px 32px 26px;border-top:1px solid #efe6f8;font-size:13px;color:#786c88">SEOXpert · Websites built to rank on Google and AI · <a href="${SITE}" style="color:#7b18c1">seoxpert.my</a>${d.kind === 'build' ? '' : ` · <a href="${INSIGHT}/welcome/" style="color:#7b18c1">XpertInsight</a>`}<br>Stripe emails your receipt separately.</td></tr>
</table></td></tr></table></body></html>`;
  const text = [`Hi ${d.first},`, '', plain(c.lead), ...(c.freeNote ? ['', `Free test order. ${c.freeNote}`] : []), ...(c.offer ? ['', c.offer] : []), '', 'What happens next', ...c.steps.map((s, i) => `${i + 1}. ${plain(s)}`), '', c.incTitle, ...c.inc.map((r) => `- ${plain(r)}`), ...(c.hosting ? ['', c.hosting] : []), '', 'Your order', ...summary.map((r) => `${r[0]}: ${r[1]}`), ...(c.billing ? [`${c.billing} ${c.manage}`] : []), '', 'Questions? Just reply to this email.', '', 'SEOXpert', SITE].join('\n');
  return { to: d.email, subject: c.subject, html, text };
}
