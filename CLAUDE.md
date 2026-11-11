# SEOXpert website (seoxpert.my)

Website building and monthly website care. Tagline: "Websites built to rank on Google and AI".
Owner: Suhen (a beginner: explain in plain words, small steps, one question at a time).

## Hard rules
- NEVER invent clients, reviews, testimonials, results, stats or prices. Use a clearly marked `[PLACEHOLDER]` (or `[DRAFT]`) and ask Suhen.
- We do NOT sell hosting on its own. Hosting may only be mentioned as included with XpertCare plans and the launch offer (Suhen, 2026-11).
- Packages and prices live in `src/data/packages.ts` (cards `src/components/Packages.astro`, plan picker `PlanPicker.astro`, script `public/js/packages.js`). Never change a price without asking Suhen. The HTML shows RM; the script offers a RM or USD switch. The launch offer hides itself after 30 April 2027.
- Names: XpertCore is our AI core, XpertForge is the website build (Starter, Business, Growth), XpertCare is the monthly care plan (Basic, Plus, Pro), XpertLab is the demos page (`/demos/`, name picked by Suhen 2026-11-11). Our team uses XpertCore for the customer; customers never use it themselves (Suhen, 2026-11). XpertCare is only for websites we build (XpertForge), with hosting included; we do not maintain websites built elsewhere (Suhen, 2026-11-11). A care plan can be as big as the website, not bigger: Starter takes Basic; Business takes Basic or Plus; Growth takes any (the plan picker enforces this). Use the three product names often in copy, kickers and visuals. Never promise rankings or page 1.
- No location names in site copy (no country, state or city) unless Suhen changes this rule.
- English only.
- Show Suhen a preview and get a yes before new designs or big changes. Every change goes through a pull request; `npm test` must pass.
- Brand: purple #7B18C1, the enhanced original tree and arrow logo (`src/fragments/logo.svg`, `icon.svg`). Do not redraw the logo.

## SEO wording (from Ubersuggest research, 2026-11)
- People search "website design" and "website maintenance". Use those in titles, H1s, URLs and descriptions.
- Menu labels (Suhen, 2026-11-11): Website building, XpertCare, XpertCore, Packages, XpertLab, About, FAQ. Suhen did not like "Monthly care" and "AI builder" in the menu.
- Every page: one H1, title 20 to 65 characters, description 70 to 170, answer first copy, structured data that matches the visible text.

## Where things are
- Settings (name, tagline, WhatsApp number, email): `src/config.ts`
- Header, phone menu, footer, SEO tags, shared structured data: `src/layouts/Base.astro`
- Homepage: `src/pages/index.astro` + `src/fragments/home-top.html`, `home-lower.html`; styles `src/styles/home.css`
- Inner pages: `src/pages/*.astro` using `src/components/PageHero.astro` and `Cta.astro`; styles `src/styles/page.css`
- Shared styles: `src/styles/site.css`
- Scripts: `public/js/ui.js` (menu, reveal, FAQ chat), `public/js/sx.js` + `home.js` (3D hero, loaded lazily by the inline loader in `index.astro`), three.js r128 in `public/vendor/`
- `src/pages/llms.txt.ts`, `robots.txt.ts`; sitemap from @astrojs/sitemap
- Questions and answers live once, in the homepage FAQ (`home-lower.html`); `src/lib/faq.ts` feeds the Questions page, the chat helper and the FAQ structured data. Only finished answers reach the structured data.
- Chat helper (floating button, every page): markup in `Base.astro`, logic at the end of `public/js/ui.js`. It answers from the FAQ only. It is not an AI and sends nothing anywhere.
- Contact choices are WhatsApp, email and chat: `src/components/Cta.astro`, `src/pages/contact.astro`.
- Links between pages: `src/components/Related.astro` (keyword link text) plus links inside the copy. A new page needs adding there, in the menu and footer (`Base.astro`) and in `llms.txt.ts`.
- Big screens: write sizes in px. The build turns px into rem (`scripts/fluid-px.mjs` for stylesheets, `scripts/fluid-html.mjs` for style attributes) and `html{font-size}` in `site.css` grows above 1920px wide. Breakpoints stay in px. The desktop menu switches to the phone menu at 1080px.
- Demos page: `src/pages/demos.astro` (list of demos and their markup), styles `src/styles/demos.css`, script `public/js/demos.js`. Each demo starts only when scrolled near and three.js loads on demand. No invented numbers in demo content.
- Share image: `node scripts/make-og.cjs` writes `public/og.png`

## Speed rule
The 3D scene is an extra. The page must be complete, fast and readable without it (Lighthouse mobile 95+). Phones load 3D only after the first touch or scroll.

## Commands
- `npm run dev` preview at http://localhost:4321
- `npm test` build and check every page
- `STRICT=1 npm test` also fails while any placeholder is left (run before going live)
