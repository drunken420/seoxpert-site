// One place for the facts the whole site uses.
export const site = {
  name: 'SEOXpert',
  url: 'https://seoxpert.my',
  tagline: 'Websites built to rank on Google and AI',
  description:
    'SEOXpert is a website design company in Malaysia. We build websites with our own AI builder and look after them monthly, so they can be found on Google and AI search.',
  // Where we work, shown in the footer, the Questions page and the structured data (Suhen, 2026-11-11).
  country: 'Malaysia',
  areas: ['Kuala Lumpur', 'Selangor', 'Petaling Jaya'],
  // WhatsApp number in international format, digits only (for example 60123456789). While it is empty the site
  // hides WhatsApp and its buttons say "Contact us"; add the number and WhatsApp comes back everywhere.
  whatsapp: '',
  // Contact email address (forwarded to Suhen's inbox with Cloudflare Email Routing).
  email: 'contact@seoxpert.my',
  // Google tag ID from Google Analytics (G-XXXXXXXXXX or GTM-XXXXXXXX). Empty = no analytics is loaded at all.
  // G-V9EXTT9LSP is the SEOXpert website stream (Suhen, 2026-11-13; replaced the Tag Manager code GTM-WFQMRQWL).
  ga4: 'G-V9EXTT9LSP',
  // Google Search Console check code (only needed if we verify with a tag instead of through the domain).
  googleVerify: '',
  // Cloudflare Turnstile site key (public) for the spam check on the contact form. Empty = no check box.
  // Its secret goes in the Cloudflare Pages settings as TURNSTILE_SECRET_KEY, never here.
  turnstileSiteKey: '',
};
/** "Kuala Lumpur, Selangor, Petaling Jaya, across Malaysia and around the world" (we work remotely; Suhen 2026-11-12) */
export const areaText = `${site.areas.join(', ')}, across ${site.country} and around the world`;
export const areaLd = [{ '@type': 'Country', name: site.country }, ...site.areas.map((name) => ({ '@type': 'AdministrativeArea', name }))];
export const whatsappLink = site.whatsapp ? `https://wa.me/${site.whatsapp}` : '/contact/';
/** Words for the main contact button and for lists of ways to reach us. */
export const talkLabel = site.whatsapp ? 'WhatsApp us' : 'Contact us';
export const ways = site.whatsapp ? 'WhatsApp, email or chat' : 'Email or chat';
export const emailLink = site.email ? `mailto:${site.email}` : '';
