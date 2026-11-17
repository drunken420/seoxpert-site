// Prices by the visitor's country (Suhen 2026-11-16). Cloudflare already knows each visitor's country (request.cf.country,
// the same as the CF-IPCountry header), so there is no extra lookup. For a page (HTML) we leave it in a small cookie,
// sx-cc=MY for example, and the inline script at the end of src/layouts/Base.astro shows RM in Malaysia and USD
// everywhere else. The page itself is never changed: everyone, Google too, gets exactly the same HTML, with RM prices
// and RM structured data. Pictures, scripts and other files never come here (public/_routes.json), so they stay as fast.
const SAFE = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN', 'Strict-Transport-Security': 'max-age=31536000', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' };

export async function onRequest({ request, next }) {
  const res = await next();
  try {
    if (request.method !== 'GET' || !(res.headers.get('content-type') || '').includes('text/html')) return res;
    const cc = String((request.cf && request.cf.country) || request.headers.get('cf-ipcountry') || '').toUpperCase();
    const had = /(?:^|;\s*)sx-cc=([A-Z0-9]{2})/.exec(request.headers.get('cookie') || '');
    const out = new Response(res.body, res);
    // the safety headers from public/_headers, in case Cloudflare leaves them off pages that pass through here
    for (const [k, v] of Object.entries(SAFE)) if (!out.headers.has(k)) out.headers.set(k, v);
    if (/^[A-Z0-9]{2}$/.test(cc) && !(had && had[1] === cc)) out.headers.append('Set-Cookie', `sx-cc=${cc}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`);
    return out;
  } catch {
    return res;
  }
}
