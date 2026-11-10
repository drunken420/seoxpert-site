# SEOXpert website (seoxpert.my)

Website building and monthly website care. Tagline: "Websites built to rank on Google and AI".
Owner: Suhen (a beginner: explain in plain words, small steps, one question at a time).

## Hard rules
- NEVER invent clients, reviews, testimonials, results, stats or prices. Use a clearly marked `[PLACEHOLDER]` (or `[DRAFT]`) and ask Suhen.
- We do NOT sell hosting. Never mention hosting as a service.
- No location names in site copy (no country, state or city) unless Suhen changes this rule.
- English only.
- Show Suhen a preview and get a yes before new designs or big changes. Every change goes through a pull request; `npm test` must pass.
- Brand: purple #7B18C1, the enhanced original tree and arrow logo (`src/fragments/logo.svg`, `icon.svg`). Do not redraw the logo.

## SEO wording (from Ubersuggest research, 2026-11)
- People search "website design" and "website maintenance". Use those in titles, H1s, URLs and descriptions.
- "Website building" and "Monthly care" are the friendly menu labels.
- Every page: one H1, title 20 to 65 characters, description 70 to 170, answer first copy, structured data that matches the visible text.

## Where things are
- Settings (name, tagline, WhatsApp number): `src/config.ts`
- Header, phone menu, footer, SEO tags, shared structured data: `src/layouts/Base.astro`
- Homepage: `src/pages/index.astro` + `src/fragments/home-top.html`, `home-lower.html`; styles `src/styles/home.css`
- Inner pages: `src/pages/*.astro` using `src/components/PageHero.astro` and `Cta.astro`; styles `src/styles/page.css`
- Shared styles: `src/styles/site.css`
- Scripts: `public/js/ui.js` (menu, reveal, FAQ chat), `public/js/sx.js` + `home.js` (3D hero, loaded lazily by the inline loader in `index.astro`), three.js r128 in `public/vendor/`
- `src/pages/llms.txt.ts`, `robots.txt.ts`; sitemap from @astrojs/sitemap
- Share image: `node scripts/make-og.cjs` writes `public/og.png`

## Speed rule
The 3D scene is an extra. The page must be complete, fast and readable without it (Lighthouse mobile 95+). Phones load 3D only after the first touch or scroll.

## Commands
- `npm run dev` preview at http://localhost:4321
- `npm test` build and check every page
- `STRICT=1 npm test` also fails while any placeholder is left (run before going live)
