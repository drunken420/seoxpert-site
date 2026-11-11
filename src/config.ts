// One place for the facts the whole site uses.
export const site = {
  name: 'SEOXpert',
  url: 'https://seoxpert.my',
  tagline: 'Websites built to rank on Google and AI',
  description:
    'SEOXpert builds websites with its own AI website builder, finished by hand, and looks after them every month so they can be found on Google and AI search.',
  // [PLACEHOLDER] WhatsApp number in international format, digits only. Empty = button scrolls to the contact section.
  whatsapp: '',
  // Contact email address (forwarded to Suhen's inbox with Cloudflare Email Routing).
  email: 'contact@seoxpert.my',
};
export const whatsappLink = site.whatsapp ? `https://wa.me/${site.whatsapp}` : '#talk';
export const emailLink = site.email ? `mailto:${site.email}` : '';
