// The emails our CLIENTS get after an order (Suhen 2026-11-17: "separate email designs for clients for those who paid /
// trial / free coupon / upgrade / free upgrade from team"). functions/api/order-mail.js works out WHAT to say (content());
// this file decides HOW it looks. Four looks, one per kind of order:
//   member     a paid XpertRank plan or a paid XpertForge build: package picture, a dark membership card, receipt
//   countdown  a paid XpertRank Trial: a 14-day ring and a day-by-day timeline
//   letter     any free test code (founder's invite): cream paper, a personal letter and an invite ticket
//   levelup    a paid upgrade in the XpertInsight dashboard: old plan -> new plan and what is new
// (The fifth, "upgraded for you by our team, no charge", is sent by XpertInsight itself: lib/giftmail.js in that repo,
// in the same family look.)
//
// Email-safe on purpose: tables, inline styles, web-safe fonts, a plain colour behind every gradient (Outlook on Windows
// drops gradients), no SVG (Gmail drops it), and every value from the order escaped (esc). Never promise rankings here,
// never the money-back promise (it is never bought online), hosting only for websites we build (order-mail.js decides).
const SITE = 'https://seoxpert.my';
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SANS = "font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif";
const SERIF = "font-family:Georgia,'Times New Roman',serif";

/* ---------- shared pieces ---------- */
function page(inner, { bg = '#f4eefb', card = '#ffffff', border = '#eadcf7', title = 'SEOXpert' } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${bg}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${bg}" style="background:${bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${card};border-radius:22px;border:1px solid ${border};overflow:hidden">
${inner}
</table></td></tr></table></body></html>`;
}
const pad = (inner, p = '0 32px') => `<tr><td style="padding:${p}">${inner}</td></tr>`;
const P = (t, extra = '') => `<p style="${SANS};margin:0 0 14px;font-size:15.5px;line-height:1.65;color:#3a2f48;${extra}">${t}</p>`;
const H2 = (t, color = '#7b18c1') => `<p style="${SANS};margin:26px 0 12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:${color}">${esc(t)}</p>`;
const button = (cta, bg = '#7b18c1', color = '#ffffff') => cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px"><tr><td bgcolor="${bg}" style="border-radius:14px;background:${bg}"><a href="${esc(cta[1])}" style="${SANS};display:inline-block;padding:15px 28px;font-size:15.5px;font-weight:700;color:${color};text-decoration:none">${esc(cta[0])} &rarr;</a></td></tr></table>` : '';
/** big number tiles: [[value, label], ...] */
const tiles = (list, { ink = '#7b18c1', line = '#e8dcf5', bg = '#ffffff' } = {}) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${list.map((x, i) => `<td width="${Math.floor(100 / list.length)}%" style="padding:0 ${i < list.length - 1 ? 8 : 0}px 0 0;vertical-align:top"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${line};border-radius:16px;background:${bg}"><tr><td align="center" style="padding:16px 6px">
<div style="${SANS};font-size:30px;line-height:1;font-weight:800;color:${ink}">${esc(x[0])}</div><div style="${SANS};margin-top:6px;font-size:12.5px;line-height:1.3;color:#786c88">${esc(x[1])}</div></td></tr></table></td>`).join('')}</tr></table>`;
/** numbered steps (the text may hold simple tags from order-mail.js) */
const steps = (list, dot = '#7b18c1') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${list.map((s, i) => `<tr><td valign="top" style="width:38px;padding:0 0 14px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${dot}" align="center" style="width:26px;height:26px;border-radius:50%;background:${dot};${SANS};font-size:13px;font-weight:800;color:#ffffff">${i + 1}</td></tr></table></td><td style="${SANS};padding:3px 0 14px;font-size:15px;line-height:1.55;color:#3a2f48">${s}</td></tr>`).join('')}</table>`;
const ticks = (list, tick = '#7b18c1') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${list.map((r) => `<tr><td valign="top" style="width:26px;padding:0 0 9px;${SANS};color:${tick};font-weight:800;font-size:15px">&#10003;</td><td style="${SANS};padding:0 0 9px;font-size:14.5px;line-height:1.5;color:#3a2f48">${r}</td></tr>`).join('')}</table>`;
const note = (t, bg = '#f7f2fc', color = '#3a2f48') => t ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0"><tr><td bgcolor="${bg}" style="background:${bg};border-radius:14px;padding:16px 18px;${SANS};font-size:14.5px;line-height:1.6;color:${color}">${esc(t)}</td></tr></table>` : '';
function signoff(text, who = 'The Founder, SEOXpert', serif = false) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px"><tr><td valign="middle" style="padding-right:12px"><img src="${SITE}/apple-touch-icon.png" width="46" height="46" alt="SEOXpert" style="display:block;width:46px;height:46px;border-radius:50%;border:0"></td>
<td style="${serif ? SERIF : SANS};font-size:15px;line-height:1.45;color:#3a2f48">${esc(text)}<br><b style="${serif ? `${SERIF};font-style:italic;font-size:17px` : ''};color:#1a1026">${esc(who)}</b></td></tr></table>`;
}
function footer(d, extra = '') {
  return `<tr><td style="${SANS};padding:20px 32px 26px;border-top:1px solid #efe6f8;font-size:12.5px;line-height:1.6;color:#786c88">SEOXpert · Websites built to rank on Google and AI · <a href="${SITE}" style="color:#7b18c1;text-decoration:none">seoxpert.my</a>${d.kind === 'build' ? '' : ` · <a href="https://insight.seoxpert.my/welcome/" style="color:#7b18c1;text-decoration:none">XpertInsight</a>`}${d.ref ? `<br>Order reference ${esc(d.ref)}` : ''}${extra}</td></tr>`;
}
const glance = (d) => (d.kind === 'build' ? 'Your website at a glance' : 'Your plan at a glance');

/* ---------- 1. member: a paid plan or build ---------- */
function member(d, c, pic) {
  const isBuild = d.kind === 'build';
  // the plan name is the card's big title already, so the rows start with the payment
  const rows = [['Paid', d.paid], ...(isBuild ? [['Payment', 'One-time']] : [['Billing', d.bill === 'year' ? 'Yearly subscription' : 'Monthly subscription']]), [isBuild ? 'Ordered' : 'Member since', d.date], ...(d.site ? [['Website', d.site]] : [])];
  const cardHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 6px"><tr><td bgcolor="#2a0d47" style="border-radius:20px;background:#2a0d47;background-image:linear-gradient(125deg,#1a0830 0%,#4b0f86 55%,#7b18c1 100%);padding:22px 22px 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="${SANS};font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#d9b8ff">${isBuild ? 'XpertForge order' : 'XpertRank member'}</td>
<td align="right"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#e8c46a" style="width:38px;height:28px;border-radius:7px;background:#e8c46a;background-image:linear-gradient(135deg,#f6dc8f,#c99a2e)"></td></tr></table></td></tr></table>
<p style="${SANS};margin:16px 0 14px;font-size:26px;line-height:1.15;font-weight:800;color:#ffffff">${esc(d.t.name)}</p>
<table role="presentation" cellpadding="0" cellspacing="0">${rows.map((r) => `<tr><td style="${SANS};padding:3px 18px 3px 0;font-size:13px;color:#cdb3ef">${esc(r[0])}</td><td style="${SANS};padding:3px 0;font-size:14px;font-weight:700;color:#ffffff">${esc(r[1])}</td></tr>`).join('')}</table>
<p style="${SANS};margin:16px 0 0;font-size:12.5px;color:#cdb3ef">&#10003; Payment received${d.ref ? ` · Ref ${esc(d.ref)}` : ''}</p>
</td></tr></table>`;
  const inner = `<tr><td><img src="${pic}" width="600" alt="${esc(d.t.name)}, paid, thank you" style="display:block;width:100%;height:auto;border:0"></td></tr>
${pad(`<p style="${SANS};margin:30px 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#7b18c1">${isBuild ? 'Your website is booked' : 'Welcome aboard'}</p>
<h1 style="${SANS};margin:0 0 14px;font-size:27px;line-height:1.2;font-weight:800;color:#1a1026">Hi ${esc(d.first)}, ${esc(c.head)}.</h1>
${P(c.lead)}
${cardHtml}
${c.billing ? P(`${esc(c.billing)} ${esc(c.manage || '')}`, 'font-size:13.5px;color:#786c88;margin-top:10px') : ''}
${c.offer ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0"><tr><td bgcolor="#fff6dd" style="background:#fff6dd;border:1px solid #f1d58a;border-radius:14px;padding:14px 16px;${SANS};font-size:14.5px;line-height:1.55;color:#5a3d00"><b>&#9733; ${esc(c.offer)}</b></td></tr></table>` : ''}
${H2(glance(d))}${tiles(c.tiles)}
${H2('What happens next')}${steps(c.steps)}
${button(c.cta)}
${H2(c.incTitle)}${ticks(c.inc)}
${c.hosting ? P(esc(c.hosting), 'margin-top:8px') : ''}
${note(c.reach)}
${signoff('Thank you for choosing SEOXpert,')}`, '0 32px 8px')}
${footer(d, '<br>Stripe emails your receipt separately.')}`;
  return page(inner, { title: c.subject });
}

/* ---------- 2. countdown: a paid Trial ---------- */
function countdown(d, c) {
  const days = c.tiles[0][0];
  const plan = [
    ['Today', 'Your trial starts', c.steps[0]],
    ['Day 1', 'Connect Google', c.steps[1]],
    ['Week 1', 'Your numbers arrive', c.steps[2]],
    [`Day ${days}`, `Ends ${d.ends}`, c.steps[3] || ''],
  ];
  const timeline = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${plan.map((p, i) => `<tr>
<td valign="top" style="width:86px;padding:0 0 ${i < plan.length - 1 ? 0 : 6}px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${i === 0 ? '#7b18c1' : '#f1e6ff'}" align="center" style="border-radius:999px;background:${i === 0 ? '#7b18c1' : '#f1e6ff'};padding:6px 10px;${SANS};font-size:12px;font-weight:800;color:${i === 0 ? '#ffffff' : '#6a12ad'};white-space:nowrap">${esc(p[0])}</td></tr></table></td>
<td valign="top" style="border-left:2px solid ${i < plan.length - 1 ? '#e2cff7' : '#ffffff'};padding:2px 0 22px 18px">
<p style="${SANS};margin:0 0 4px;font-size:15.5px;font-weight:800;color:#1a1026">${esc(p[1])}</p><p style="${SANS};margin:0;font-size:14.5px;line-height:1.55;color:#51465f">${p[2]}</p></td></tr>`).join('')}</table>`;
  const inner = `<tr><td bgcolor="#efe3fd" align="center" style="background:#efe3fd;background-image:linear-gradient(160deg,#f7f0ff 0%,#e6d3fb 100%);padding:34px 24px 30px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="width:150px;height:150px;border-radius:50%;border:10px solid #7b18c1;background:#ffffff">
<div style="${SANS};font-size:56px;line-height:1;font-weight:800;color:#7b18c1">${esc(days)}</div><div style="${SANS};margin-top:4px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:#51465f">days</div></td></tr></table>
<p style="${SANS};margin:18px 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#7b18c1">XpertRank Trial</p>
<p style="${SANS};margin:0;font-size:15px;color:#51465f">Starts today · ends ${esc(d.ends)}</p></td></tr>
${pad(`<h1 style="${SANS};margin:30px 0 14px;font-size:27px;line-height:1.2;font-weight:800;color:#1a1026">Hi ${esc(d.first)}, ${esc(c.head)}.</h1>
${P(c.lead)}
${tiles(c.tiles)}
${H2('Your next 14 days')}${timeline}
${button(c.cta)}
${H2(c.incTitle)}${ticks(c.inc)}
${note(`You paid ${d.paid} once. The trial does not renew, so nothing more is charged. Choose a paid XpertRank plan before ${d.ends} and it comes off your first month.`, '#fff6dd', '#5a3d00')}
${note(c.reach)}
${signoff('Enjoy your trial,')}`, '0 32px 8px')}
${footer(d, '<br>Stripe emails your receipt separately.')}`;
  return page(inner, { title: c.subject });
}

/* ---------- 3. letter: any free test code (founder's invite) ---------- */
// Redone 2026-11-17 (Suhen: "work on the personal invite one, make it all look professional"): a formal, premium
// invitation instead of a paper letter. White page in the brand purple with a thin gold accent: a deep purple
// invitation band, an invitation card with the details, the founder's note as a quote, the next steps and a clean sign-off.
function letter(d, c) {
  const guest = d.kind !== 'build', days = d.guestDays || 14; // GUEST_DAYS from order-mail.js
  const GOLD = '#c99a2e', GOLD_SOFT = '#f6e7c1';
  const plan = d.t.name;
  const who = [d.first !== 'there' ? d.first : '', d.company].filter(Boolean).join(', ');
  const rows = [
    ...(who ? [['Invitation for', who]] : []),
    [guest ? 'Plan' : 'Package', plan],
    ...(guest ? [['Duration', `${days} days`], ['Valid until', d.ends]] : []),
    ['Price', `Complimentary · worth ${d.full}`],
    ...(d.site ? [['Website', d.site]] : []),
  ];
  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;background:#ffffff;border:1px solid #eadcf7;border-radius:18px"><tr><td style="border-top:4px solid ${GOLD};border-radius:18px 18px 0 0;padding:22px 24px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="${SANS};font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#7b18c1">Your invitation</td>
<td align="right" style="${SANS};font-size:12px;color:#786c88">${d.ref ? `No. ${esc(d.ref)}` : ''}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${rows.map((r, i) => `<tr>
<td style="${SANS};padding:11px 0;${i ? 'border-top:1px solid #f1eaf8;' : ''}width:132px;vertical-align:top;font-size:13px;color:#786c88">${esc(r[0])}</td>
<td style="${SANS};padding:11px 0;${i ? 'border-top:1px solid #f1eaf8;' : ''}vertical-align:top;font-size:15px;font-weight:700;color:#1a1026">${r[0] === 'Price' ? `<span style="color:#157a4a">Complimentary</span><span style="font-weight:500;color:#786c88"> · worth <s>${esc(d.full)}</s></span>` : esc(r[1])}</td></tr>`).join('')}</table>
</td></tr></table>`;
  const inner = `<tr><td style="padding:22px 32px 18px;border-bottom:1px solid #f1eaf8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><img src="${SITE}/apple-touch-icon.png" width="34" height="34" alt="" style="display:inline-block;vertical-align:middle;width:34px;height:34px;border-radius:9px;border:0"><span style="${SANS};display:inline-block;vertical-align:middle;margin-left:10px;font-size:17px;font-weight:800;color:#1a1026">SEOXpert</span></td>
<td align="right" valign="middle"><span style="${SANS};display:inline-block;border:1px solid ${GOLD};color:#a3741a;border-radius:999px;padding:6px 12px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800">Private invitation</span></td>
</tr></table></td></tr>
<tr><td bgcolor="#3d1170" align="center" style="background:#3d1170;background-image:linear-gradient(155deg,#1a0830 0%,#4b0f86 60%,#7b18c1 100%);padding:40px 28px 40px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:46px;height:2px;background:${GOLD};font-size:0;line-height:0">&nbsp;</td></tr></table>
<p style="${SANS};margin:16px 0 12px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:800;color:${GOLD_SOFT}">The founder's invitation</p>
<p style="${SANS};margin:0;font-size:31px;line-height:1.2;font-weight:800;color:#ffffff">${guest ? `You're invited to ${esc(plan)}` : `Your ${esc(plan)} invitation`}</p>
<p style="${SANS};margin:14px 0 0;font-size:15.5px;line-height:1.5;color:#e2cff7">${guest ? `${days} days, on us · until ${esc(d.ends)}` : 'An invitation order · nothing is charged'}</p>
</td></tr>
${pad(`${card}
${H2('What happens next')}${steps(c.steps)}
${button(c.cta)}
${c.reach ? note(c.reach) : ''}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr>
<td valign="middle" style="padding-right:14px"><img src="${SITE}/apple-touch-icon.png" width="48" height="48" alt="SEOXpert" style="display:block;width:48px;height:48px;border-radius:12px;border:0"></td>
<td valign="middle" style="${SANS};font-size:15px;line-height:1.5;color:#51465f">Warm regards,<br><b style="color:#1a1026;font-size:16px">The Founder</b><span style="color:#786c88">, SEOXpert</span></td></tr></table>`, '0 32px 10px')}
<tr><td style="${SANS};padding:20px 32px 26px;border-top:1px solid #f1eaf8;font-size:12.5px;line-height:1.65;color:#786c88">
<span style="color:#a3741a;font-weight:700">Complimentary invitation.</span> Nothing was charged and no card is on file${guest ? `. It ends by itself on ${esc(d.ends)}` : ''}.<br>
SEOXpert · Websites built to rank on Google and AI · <a href="${SITE}" style="color:#7b18c1;text-decoration:none">seoxpert.my</a>${d.kind === 'build' ? '' : ` · <a href="https://insight.seoxpert.my/welcome/" style="color:#7b18c1;text-decoration:none">XpertInsight</a>`}</td></tr>`;
  return page(inner, { bg: '#f4eefb', title: c.subject });
}

/* ---------- 4. levelup: a paid upgrade in the dashboard ---------- */
function levelup(d, c) {
  const from = d.from ? String(d.from).replace(/^XpertRank /, '') : '';
  const to = d.t.name.replace(/^XpertRank /, '');
  const arrow = from ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto 0"><tr>
<td bgcolor="#3d1170" style="border-radius:999px;background:#3d1170;padding:9px 18px;${SANS};font-size:15px;font-weight:700;color:#cdb3ef;text-decoration:line-through">${esc(from)}</td>
<td style="padding:0 12px;${SANS};font-size:22px;font-weight:800;color:#e8c46a">&rarr;</td>
<td bgcolor="#ffffff" style="border-radius:999px;background:#ffffff;padding:9px 18px;${SANS};font-size:15px;font-weight:800;color:#6a12ad">${esc(to)}</td></tr></table>` : '';
  const inner = `<tr><td bgcolor="#3d1170" align="center" style="background:#3d1170;background-image:linear-gradient(150deg,#1a0830 0%,#5a12a0 60%,#9a35e8 100%);padding:38px 24px 34px">
<p style="${SANS};margin:0 0 10px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:800;color:#e8c46a">&#9650; Level up</p>
<p style="${SANS};margin:0;font-size:32px;line-height:1.15;font-weight:800;color:#ffffff">You are now on ${esc(to)}</p>
${arrow}
<p style="${SANS};margin:16px 0 0;font-size:14.5px;color:#d9c2f5">Your XpertInsight dashboard has already switched.</p></td></tr>
${pad(`<h1 style="${SANS};margin:30px 0 14px;font-size:24px;line-height:1.25;font-weight:800;color:#1a1026">Hi ${esc(d.first)}, welcome to ${esc(to)}.</h1>
${P(c.lead)}
${H2('What you have now')}${tiles(c.tiles, { ink: '#5a12a0', bg: '#faf6ff' })}
${H2('What happens next')}${steps(c.steps)}
${button(c.cta)}
${H2(c.incTitle)}${ticks(c.inc)}
${c.hosting ? P(esc(c.hosting), 'margin-top:8px') : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0"><tr><td bgcolor="#f7f2fc" style="background:#f7f2fc;border-radius:14px;padding:16px 18px">
<p style="${SANS};margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:#7b18c1">&#10003; Payment received</p>
<p style="${SANS};margin:0;font-size:14.5px;line-height:1.6;color:#3a2f48">${esc(c.billing || `Paid ${d.paid}.`)} ${esc(c.manage || '')}</p></td></tr></table>
${note(c.reach)}
${signoff('Thank you for growing with us,')}`, '0 32px 8px')}
${footer(d, '<br>Stripe emails your receipt separately.')}`;
  return page(inner, { title: c.subject });
}

/** The right look for this order. d and c come from order-mail.js (orderOf, content); pic is the package picture. */
export function clientMail(d, c, pic) {
  if (d.free) return letter(d, c);
  if (d.kind === 'trial') return countdown(d, c);
  if (d.kind === 'upgrade') return levelup(d, c);
  return member(d, c, pic);
}
