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
// Rules (CLAUDE.md): free high speed cloud hosting only for websites we build; no money-back promise in these emails
// (it covers only a first paid month on websites we build, which is never bought here); never promise rankings.
import { build, care, trial, yearly, offerOn } from '../../src/data/packages.ts';

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
  return { date: day(at), ends: day(at + GUEST_DAYS * 864e5), ref: String(o.id || '').slice(-8).toUpperCase(), kind, id, t, free, email, first: name.split(/\s+/)[0] || 'there', site: box.website || '', company: box.company || '', bill: m.bill || 'once', built: m.built === 'us' ? 'us' : 'other', paid: money(o.amount_total || 0, o.currency), full: money(o.amount_subtotal || o.amount_total || 0, o.currency), invited: invited !== false };
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
    tiles: [[(t.short.match(/^\d+/) || [''])[0], 'pages in total'], [num(t.rows[2]), 'revision rounds'], ['30', 'days of free fixes']],
    steps: free ? ['I will email you to ask what you would like to do next.'] : ['Our team emails you shortly to plan your pages, words and pictures with you.', 'XpertCore, our own AI SEO advisor, guides our team on what to plan, write and mark up on every page, then our experts check it.', `You see your design and words before launch, with ${num(t.rows[2])} revision rounds.`, 'We launch your website, ready for Google and AI search, and set up the extras below.'],
    offer: !free && offerOn() && t.free ? `Launch offer included: ${t.free}.` : '',
    incTitle: `Your ${t.name} includes`, inc: [...t.rows, ...build.all], cta: free ? null : ['See what we build', `${SITE}/website-design/`],
  };
  const yr = d.bill === 'year';
  const billing = free ? '' : yr ? `You paid ${d.paid} for 12 months (12 months for the price of ${yearly.pay}).` : `You pay ${d.paid} a month.`;
  const manage = free ? '' : 'Change your card, see invoices or cancel at any time from Your plan, Manage billing, in your dashboard.';
  const open = ['Open your dashboard', `${INSIGHT}/welcome/`];
  if (kind === 'upgrade') return {
    pic: t.id, subject: free ? `A personal invite from our founder: ${t.name}, free for ${GUEST_DAYS} days` : `You are now on ${t.name}`,
    head: free ? 'you are personally invited' : `you are now on ${t.name}`,
    lead: free ? guest(`use ${t.name}`) + ' Your XpertInsight dashboard has already switched to it.' : `Thank you for upgrading. Your XpertInsight dashboard has switched to ${t.name}: ${t.for} for your website.`,
    pass: free ? pass : '', reach: free ? reach : member, tiles: careTiles,
    steps: ['Open your XpertInsight dashboard. Your plan shows everything that is new.', `We add your extra target keywords with you: ${kw} in total, optimised for Google and AI search (LLM) and tracked weekly.`, work],
    billing, manage, hosting: d.built === 'us' ? 'High speed cloud hosting included, as we built your website.' : '',
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
    : [['Package', d.t.name], ['Paid', d.paid], ...(sub ? [['Billing', d.bill === 'year' ? 'Yearly' : 'Monthly']] : []), ['Date', d.date], ...(d.site ? [['Website', d.site]] : [])];
  const P = 'margin:0 0 14px;font-size:15px;line-height:1.6;color:#3a2f48', H2 = 'margin:24px 0 10px;font:700 17px Arial,sans-serif;color:#7b18c1';
  const gold = 'background:#fdf3dc;background:linear-gradient(120deg,#fff3d1,#f8dc97)';
  const tiles = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:6px 0 4px"><tr>${c.tiles.map((x, i) => `<td width="33%" style="padding:0 ${i < 2 ? 8 : 0}px 0 0"><div style="border:1px solid #e8dcf5;border-radius:14px;padding:14px 8px;text-align:center"><div style="font:700 26px Arial,sans-serif;color:#7b18c1">${esc(x[0])}</div><div style="font-size:12.5px;color:#786c88;line-height:1.35">${esc(x[1])}</div></div></td>`).join('')}</tr></table>`;
  const card = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0 6px;border-radius:16px;${d.free ? gold : 'background:#2a0d47;background:linear-gradient(120deg,#2a0d47,#6a12ad)'}"><tr><td style="padding:18px 20px">
<div style="font:700 12px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${d.free ? '#7a5200' : '#d9c2f5'};margin-bottom:10px">${d.free ? "Founder's invite" : '&#10003; Payment received'}</div>
<table role="presentation" cellpadding="0" cellspacing="0">${summary.map((r) => `<tr><td style="padding:3px 18px 3px 0;color:${d.free ? '#7a5200' : '#d9c2f5'};font-size:14px">${esc(r[0])}</td><td style="padding:3px 0;font-size:14px;font-weight:700;color:${d.free ? '#3a2400' : '#ffffff'}">${esc(r[1])}</td></tr>`).join('')}</table>
${c.pass ? `<p style="margin:10px 0 0;font-size:13.5px;line-height:1.5;color:#5a3a00">${esc(c.pass)}</p>` : ''}${c.billing ? `<p style="margin:10px 0 0;font-size:13.5px;line-height:1.5;color:#e6d6f8">${esc(c.billing)} ${esc(c.manage)}</p>` : ''}
</td></tr></table>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4eefb;padding:24px 12px;font-family:Inter,Arial,sans-serif;color:#1a1026">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px -30px rgba(90,20,160,.45)">
<tr><td><img src="${pic}" width="600" alt="${esc(d.t.name)}${d.free ? ", founder's invite" : ', paid, thank you'}" style="display:block;width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding:30px 32px 8px">
${d.free ? `<div style="font:700 12px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#a36b00;margin:0 0 8px">A personal invite from our founder</div>` : ''}
<h1 style="margin:0 0 14px;font:700 24px/1.25 Arial,sans-serif;color:#1a1026">Hi ${esc(d.first)}, ${esc(c.head)}.</h1>
<p style="${P}">${c.lead}</p>
${d.free ? card : ''}
${c.offer ? `<p style="margin:0 0 6px;padding:14px 16px;border-radius:12px;background:#f1e6ff;color:#4b0d80;font-size:14.5px;line-height:1.55"><b>${esc(c.offer)}</b></p>` : ''}
${d.free && d.kind === 'build' ? '' : `<h2 style="${H2}">${d.free ? 'Your invite at a glance' : d.kind === 'build' ? 'Your website at a glance' : 'Your plan at a glance'}</h2>${tiles}`}
<h2 style="${H2}">What happens next</h2>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${c.steps.map((s, i) => `<tr><td valign="top" style="width:34px;padding:0 0 12px"><div style="width:24px;height:24px;border-radius:50%;background:#7b18c1;color:#fff;font:700 13px/24px Arial,sans-serif;text-align:center">${i + 1}</div></td><td style="padding:2px 0 12px;font-size:15px;line-height:1.55;color:#3a2f48">${s}</td></tr>`).join('')}</table>
${c.cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px"><tr><td style="border-radius:999px;background:#7b18c1"><a href="${c.cta[1]}" style="display:inline-block;padding:13px 26px;font:700 15px Arial,sans-serif;color:#fff;text-decoration:none">${esc(c.cta[0])}</a></td></tr></table>` : ''}
<h2 style="${H2}">${esc(c.incTitle)}</h2>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${c.inc.map((r) => `<tr><td valign="top" style="width:26px;padding:0 0 8px;color:#7b18c1;font-weight:700">&#10003;</td><td style="padding:0 0 8px;font-size:14.5px;line-height:1.5;color:#3a2f48">${r}</td></tr>`).join('')}</table>
${c.hosting ? `<p style="${P};margin-top:8px">${esc(c.hosting)}</p>` : ''}
${d.free ? '' : card}
${c.reach ? `<p style="margin:18px 0 0;padding:14px 16px;border-radius:12px;background:#f7f2fc;font-size:14.5px;line-height:1.55;color:#3a2f48">${esc(c.reach)}</p>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px"><tr><td valign="middle" style="padding-right:12px"><img src="${SITE}/apple-touch-icon.png" width="44" height="44" alt="SEOXpert" style="display:block;width:44px;height:44px;border-radius:50%"></td><td style="font-size:14.5px;line-height:1.45;color:#3a2f48">${d.free ? 'Glad to have you as my guest,' : 'Thank you for your trust,'}<br><b>The Founder</b>, SEOXpert<br><span style="color:#786c88;font-size:13px">Just reply to this email to reach me.</span></td></tr></table>
</td></tr>
<tr><td style="padding:18px 32px 26px;border-top:1px solid #efe6f8;font-size:13px;color:#786c88">SEOXpert · Websites built to rank on Google and AI · <a href="${SITE}" style="color:#7b18c1">seoxpert.my</a>${d.kind === 'build' ? '' : ` · <a href="${INSIGHT}/welcome/" style="color:#7b18c1">XpertInsight</a>`}${d.free ? '' : '<br>Stripe emails your receipt separately.'}</td></tr>
</table></td></tr></table></body></html>`
    // mail apps do not pass the font down into table cells, so every cell names it (without this the text shows in a serif font)
    .replace(/<td([^>]*?) style="/g, '<td$1 style="font-family:Arial,Helvetica,sans-serif;');
  const text = [`Hi ${d.first}, ${c.head}.`, '', plain(c.lead), '', ...summary.map((r) => `${r[0]}: ${r[1]}`), ...(c.pass ? [c.pass] : []), ...(c.billing ? [`${c.billing} ${c.manage}`] : []), ...(c.offer ? ['', c.offer] : []), '', 'What happens next', ...c.steps.map((s, i) => `${i + 1}. ${plain(s)}`), ...(c.cta ? ['', `${c.cta[0]}: ${c.cta[1]}`] : []), '', c.incTitle, ...c.inc.map((r) => `- ${plain(r)}`), ...(c.hosting ? ['', c.hosting] : []), ...(c.reach ? ['', c.reach] : []), '', d.free ? 'Glad to have you as my guest,' : 'Thank you for your trust,', 'The Founder, SEOXpert', SITE].join('\n');
  return { to: d.email, subject: c.subject, html, text };
}
