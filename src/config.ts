// One place for the facts the whole site uses.
export const site = {
  name: 'SEOXpert',
  url: 'https://seoxpert.my',
  tagline: 'Websites built to rank on Google and AI',
  description:
    'SEOXpert builds websites with its own AI website builder, finished by hand, and looks after them every month so they can be found on Google and AI search.',
  // WhatsApp number in international format, digits only (for example 60123456789). While it is empty the site
  // hides WhatsApp and its buttons say "Contact us"; add the number and WhatsApp comes back everywhere.
  whatsapp: '',
  // Contact email address (forwarded to Suhen's inbox with Cloudflare Email Routing).
  email: 'contact@seoxpert.my',
};
export const whatsappLink = site.whatsapp ? `https://wa.me/${site.whatsapp}` : '/contact/';
/** Words for the main contact button and for lists of ways to reach us. */
export const talkLabel = site.whatsapp ? 'WhatsApp us' : 'Contact us';
export const ways = site.whatsapp ? 'WhatsApp, email or chat' : 'Email or chat';
export const emailLink = site.email ? `mailto:${site.email}` : '';
