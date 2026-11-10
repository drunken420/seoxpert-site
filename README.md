# SEOXpert website (seoxpert.my)

Websites built to rank on Google and AI. Built with Astro (plain HTML output, very fast).

## Commands
- `npm install` once, after downloading
- `npm run dev` to preview at http://localhost:4321
- `npm test` builds the site and checks it against our rules (no banned words, titles, one H1, placeholders counted)

## Where things are
- Settings (name, tagline, WhatsApp number): `src/config.ts`
- Header, phone menu, footer, SEO tags: `src/layouts/Base.astro`
- Homepage: `src/pages/index.astro`, content in `src/fragments/home-top.html` and `home-lower.html`
- Styles: `src/styles/site.css` (every page), `src/styles/home.css` (homepage)
- Scripts: `public/js/ui.js` (menu, reveal, FAQ), `public/js/sx.js` + `home.js` (3D hero, loaded lazily), three.js r128 in `public/vendor/`

## Rules
- Never invent clients, reviews, results or prices. Use `[PLACEHOLDER]` and ask Suhen.
- No mention of hosting as a service, and no location names in the copy.
- The 3D scene is an extra: the page must be complete and fast without it.
- `STRICT=1 npm test` fails while any `[PLACEHOLDER]` or `[DRAFT]` is left. Run it before going live.
