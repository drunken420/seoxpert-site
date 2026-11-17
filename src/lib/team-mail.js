// The emails our own team receives (Suhen 2026-11-17: "make the emails i receive also look nice and not so plain"):
// new enquiries from the contact form, chat leads and payment alerts. One layout, so they all look like SEOXpert.
//
// Email-safe on purpose: tables, inline styles, no web fonts, no SVG (Gmail and Outlook drop them), a plain colour
// behind every gradient (Outlook on Windows ignores gradients), and every user value escaped with esc().
// Used by functions/api/contact.js, functions/api/chat.js and functions/api/stripe-webhook.js.
const SITE = 'https://seoxpert.my';
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const F = "font-family:'Segoe UI',Inter,Helvetica,Arial,sans-serif";

/** When it happened, in Malaysia time: "17 Nov 2026, 10:35 PM". */
export function myt(d = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(d).replace(' am', ' AM').replace(' pm', ' PM') + ' (MYT)';
  } catch { return d.toISOString(); }
}

// Colours for the top band and the status chip, per kind of email.
const TONE = {
  lead:   { band: '#5a12a0', a: '#2a0d47', b: '#7b18c1', chip: '#f3e8ff', ink: '#6a12ad' },
  chat:   { band: '#5a12a0', a: '#1f0a38', b: '#6a12ad', chip: '#f3e8ff', ink: '#6a12ad' },
  paid:   { band: '#3d1170', a: '#1a1026', b: '#6a12ad', chip: '#e3f6ea', ink: '#157a4a' },
  free:   { band: '#3d1170', a: '#1a1026', b: '#6a12ad', chip: '#fdf0db', ink: '#9a5b00' },
  failed: { band: '#5b1a2a', a: '#2a0d1a', b: '#8a1f3a', chip: '#fde8e6', ink: '#b3261e' },
  ended:  { band: '#3a3346', a: '#1a1026', b: '#51465f', chip: '#efedf2', ink: '#51465f' },
};

const button = (href, text, primary) => `<td style="padding:0 8px 8px 0"><a href="${esc(href)}" style="display:inline-block;${F};font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:13px 20px;${primary ? 'background:#7b18c1;color:#ffffff' : 'background:#f3e8ff;color:#6a12ad'}">${esc(text)}</a></td>`;

/** A label / value list. A value starting with "mailto:" or "http" becomes a link; empty values are left out. */
function details(rows) {
  const list = rows.filter((r) => r && r[1] !== undefined && r[1] !== null && String(r[1]).trim() !== '');
  if (!list.length) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${list.map(([k, v, href], i) => `<tr>
    <td style="${F};padding:12px 0;${i ? 'border-top:1px solid #efe6f8;' : ''}width:120px;vertical-align:top;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#786c88;font-weight:700">${esc(k)}</td>
    <td style="${F};padding:12px 0;${i ? 'border-top:1px solid #efe6f8;' : ''}vertical-align:top;font-size:15px;color:#1a1026;font-weight:600">${href ? `<a href="${esc(href)}" style="color:#7b18c1;text-decoration:none">${esc(v)}</a>` : esc(v)}</td></tr>`).join('')}</table>`;
}

const card = (inner, extra = '') => `<tr><td style="padding:0 24px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #eadcf7;border-radius:16px${extra}"><tr><td style="padding:18px 20px">${inner}</td></tr></table></td></tr>`;
const heading = (t) => `<p style="${F};margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7b18c1;font-weight:800">${esc(t)}</p>`;

/**
 * One team email.
 * tone      lead | chat | paid | free | failed | ended
 * kicker    small line in the band, e.g. "New enquiry"
 * title     the big line, e.g. the person's name
 * sub       one line under the title (what they need, or the amount)
 * chip      the status pill, e.g. "Website design" or "Paid"
 * big       optional large number in the band (payments)
 * actions   [[href, text], ...] the first one is the main button
 * rows      [[label, value, href?], ...]
 * message   optional { title, text } shown as a quote (keeps line breaks)
 * chat      optional [{ role: 'user'|'assistant', content }] shown as chat bubbles
 * note      optional "Next step" text
 * test      true shows a TEST MODE ribbon
 * foot      one small line at the bottom (where it came from)
 */
export function teamMail(o) {
  const t = TONE[o.tone] || TONE.lead;
  const band = `<tr><td bgcolor="${t.band}" style="background:${t.band};background-image:linear-gradient(135deg,${t.a} 0%,${t.b} 100%);border-radius:20px 20px 0 0;padding:26px 24px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle"><img src="${SITE}/apple-touch-icon.png" width="36" height="36" alt="SEOXpert" style="display:inline-block;vertical-align:middle;border-radius:10px;border:0"><span style="${F};display:inline-block;vertical-align:middle;margin-left:10px;color:#ffffff;font-size:15px;font-weight:800;letter-spacing:.01em">SEOXpert <span style="color:#d9b8ff;font-weight:600">Team</span></span></td>
      <td align="right" style="vertical-align:middle">${o.test ? `<span style="${F};display:inline-block;background:#ffd666;color:#5a3d00;font-size:11px;font-weight:800;letter-spacing:.08em;border-radius:999px;padding:5px 10px">TEST MODE</span>` : ''}</td>
    </tr></table>
    <p style="${F};margin:22px 0 6px;color:#d9b8ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800">${esc(o.kicker)}</p>
    <h1 style="${F};margin:0;color:#ffffff;font-size:28px;line-height:1.2;font-weight:800">${esc(o.title)}</h1>
    ${o.big ? `<p style="${F};margin:10px 0 0;color:#ffffff;font-size:34px;line-height:1.1;font-weight:800;letter-spacing:-.01em">${esc(o.big)}</p>` : ''}
    ${o.sub ? `<p style="${F};margin:8px 0 0;color:#eadcf7;font-size:15px;line-height:1.5">${esc(o.sub)}</p>` : ''}
    ${o.chip ? `<p style="margin:14px 0 0"><span style="${F};display:inline-block;background:${t.chip};color:${t.ink};font-size:13px;font-weight:800;border-radius:999px;padding:6px 12px">${esc(o.chip)}</span></p>` : ''}
  </td></tr>`;
  const actions = (o.actions || []).filter((a) => a && a[0]);
  const acts = actions.length ? `<tr><td style="padding:20px 24px 8px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${actions.map((a, i) => button(a[0], a[1], i === 0)).join('')}</tr></table></td></tr>` : '<tr><td style="height:20px"></td></tr>';
  const rows = details(o.rows || []);
  const msg = o.message && o.message.text ? card(`${heading(o.message.title || 'Their message')}<div style="${F};white-space:pre-wrap;font-size:16px;line-height:1.65;color:#1a1026;border-left:4px solid #b06cff;padding:2px 0 2px 14px">${esc(o.message.text)}</div>`) : '';
  const chat = o.chat && o.chat.length ? card(`${heading('The conversation')}${o.chat.map((m) => {
    const me = m.role === 'user';
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px"><tr><td align="${me ? 'right' : 'left'}">
      <p style="${F};margin:0 0 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#786c88;font-weight:700">${me ? 'Visitor' : 'Our assistant'}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:85%"><tr><td style="${F};white-space:pre-wrap;font-size:15px;line-height:1.55;border-radius:14px;padding:11px 14px;${me ? 'background:#7b18c1;color:#ffffff' : 'background:#f3ecfa;color:#1a1026'}">${esc(m.content)}</td></tr></table>
    </td></tr></table>`;
  }).join('')}`) : '';
  const note = o.note ? `<tr><td style="padding:0 24px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3e8ff;border-radius:16px"><tr><td style="padding:16px 18px">${heading('Next step')}<p style="${F};margin:0;font-size:15px;line-height:1.55;color:#2a0d47">${esc(o.note)}</p></td></tr></table></td></tr>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.kicker)}</title></head>
<body style="margin:0;padding:0;background:#f3ecfa">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3ecfa" style="background:#f3ecfa"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#faf7fd;border-radius:20px;border:1px solid #eadcf7">
${band}
${acts}
${rows ? card(heading('Details') + rows) : ''}
${msg}${chat}${note}
<tr><td style="${F};padding:4px 24px 22px;font-size:12px;line-height:1.6;color:#786c88">${o.foot ? `${esc(o.foot)}<br>` : ''}${esc(myt())} · <a href="${SITE}" style="color:#7b18c1;text-decoration:none">seoxpert.my</a></td></tr>
</table>
</td></tr></table></body></html>`;
}
