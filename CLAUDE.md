# SEOXpert website (seoxpert.my)

Website building and monthly website care. Tagline: "Websites built to rank on Google and AI".
Owner: Suhen (a beginner: explain in plain words, small steps, one question at a time).

## Hard rules
- NEVER invent clients, reviews, testimonials, results, stats or prices. Use a clearly marked `[PLACEHOLDER]` (or `[DRAFT]`) and ask Suhen.
- We do NOT sell hosting on its own. Hosting may only be mentioned as included with XpertCare plans and the launch offer (Suhen, 2026-11). Say "high speed hosting included" (Suhen, 2026-11-11).
- Packages and prices live in `src/data/packages.ts` (cards `src/components/Packages.astro`, plan picker `PlanPicker.astro`, script `public/js/packages.js`). Never change a price without asking Suhen. The HTML shows RM; the script offers a RM or USD switch. The launch offer hides itself after 30 April 2027. XpertCare paid yearly = 12 months for the price of 10 (`yearly` in packages.ts; Suhen, 2026-11-11).
- Names: XpertCore is our AI core, XpertForge is the website build (Starter, Business, Growth), XpertCare is the monthly care plan (Basic, Plus, Pro), XpertLab is the demos page (`/demos/`, name picked by Suhen 2026-11-11), XpertAdvice is the blog (menu label and breadcrumb only; the address stays `/blog/` and the page title keeps "Website design and SEO guides"; Suhen 2026-11-11). Our team uses XpertCore for the customer; customers never use it themselves (Suhen, 2026-11). XpertCare is only for websites we build (XpertForge), with hosting included; we do not maintain websites built elsewhere (Suhen, 2026-11-11). A care plan can be as big as the website, not bigger: Starter takes Basic; Business takes Basic or Plus; Growth takes any (the plan picker enforces this). Use the three product names often in copy, kickers and visuals. Never promise rankings or page 1.
- Location names (Suhen, 2026-11-11): "Malaysia" is used in titles, H1s and copy, plus Kuala Lumpur, Selangor and Petaling Jaya as the areas we work in (`country` and `areas` in `src/config.ts`). No other place names, no invented office address. Prices show RM first.
- English only.
- Show Suhen a preview and get a yes before new designs or big changes. Every change goes through a pull request; `npm test` must pass.
- Brand: purple #7B18C1, the enhanced original tree and arrow logo (`src/fragments/logo.svg`, `icon.svg`). Do not redraw the logo.

## SEO wording (from Ubersuggest research, 2026-11)
- People search "website design" and "website maintenance". Use those in titles, H1s, URLs and descriptions.
- Menu labels (Suhen, 2026-11-11): a Services dropdown (Website design, Website development, XpertCare, XpertCore), then Packages, XpertLab, XpertAdvice, About. The phone menu lists every page. FAQ is in the footer, the phone menu and the chat. Suhen did not like "Monthly care", "AI builder" or "Website building" (it is not a third service).
- Every page: one H1, title 20 to 65 characters, description 70 to 170, answer first copy, structured data that matches the visible text.

## Where things are
- Settings (name, tagline, WhatsApp number, email, Google Analytics ID `ga4`, Search Console code `googleVerify`): `src/config.ts`. WhatsApp is hidden everywhere while the number is empty (Suhen 2026-11-11: off until ready). Analytics loads only when `ga4` is set, after the page has shown (snippet in `Base.astro`)
- Header, phone menu, footer, SEO tags, shared structured data: `src/layouts/Base.astro`
- Homepage: `src/pages/index.astro` + `src/fragments/home-top.html`, `home-lower.html`; styles `src/styles/home.css`
- Inner pages: `src/pages/*.astro` using `src/components/PageHero.astro` and `Cta.astro`; styles `src/styles/page.css`. Each banner has its own picture (`art`, in `HeroArt.astro`) and a big drifting outline word (`word`); the picture tilts towards the mouse (end of `public/js/ui.js`)
- Shared styles: `src/styles/site.css`
- Scripts: `public/js/ui.js` (menu, reveal, FAQ chat), `public/js/sx.js` + `home.js` (3D hero, loaded lazily by the inline loader in `index.astro`), three.js r128 in `public/vendor/`
- `src/pages/llms.txt.ts`, `robots.txt.ts`; sitemap from @astrojs/sitemap
- Questions and answers live once, in the homepage FAQ (`home-lower.html`); `src/lib/faq.ts` feeds the Questions page, the chat helper and the FAQ structured data. Only finished answers reach the structured data.
- Chat helper (floating button, every page): markup in `Base.astro`, logic at the end of `public/js/ui.js`. It answers from the FAQ only. It is not an AI and sends nothing anywhere.
- Contact choices are WhatsApp, email and chat: `src/components/Cta.astro`, `src/pages/contact.astro`.
- Links between pages: `src/components/Related.astro` (keyword link text) plus links inside the copy. A new page needs adding there, in the menu and footer (`Base.astro`) and in `llms.txt.ts`. The last footer line is unique per page with its keyword (`footLines` in `Base.astro`; Suhen, 2026-11-11): add a line for every new page or guide.
- Big screens: write sizes in px. The build turns px into rem (`scripts/fluid-px.mjs` for stylesheets, `scripts/fluid-html.mjs` for style attributes) and `html{font-size}` in `site.css` grows above 1920px wide. Breakpoints stay in px. The desktop menu switches to the phone menu at 1200px.
- Demos page: `src/pages/demos.astro` (list of demos and their markup), styles `src/styles/demos.css`, script `public/js/demos.js`. Each demo starts only when scrolled near and three.js loads on demand. No invented numbers in demo content. Most demos also move by themselves (Suhen asked 2026-11-11) and stop when the visitor takes over; nothing moves for people who ask for less motion. The globe's land shapes are the `LAND` map in demos.js (made once from Natural Earth data via world-atlas); it marks only Malaysia. The 3D logo's weather can cover the whole page, with a chip to turn it off.
- Website development page (`/website-development/`, Suhen asked 2026-11-11): how sites are coded for SEO and AI from the ground up. In the top menu next to Website design. Only claim what this site really does.
- Blog (`/blog/`): guides live in `src/data/blog.ts` (add a new one at the TOP; prices come from packages.ts). List page `src/pages/blog/index.astro` shows the newest three as a magazine and older ones as cards (Suhen picked this, 2026-11-11); guide layout `src/pages/blog/[slug].astro`; pictures `src/components/BlogArt.astro`; styles `src/styles/blog.css`. Guides target the Malaysia keywords in the research file; never promise rankings.
- Pictures (Suhen asked 2026-11-11): every main page has an "At a glance" picture (`src/components/Glance.astro`, words and alt text in `src/data/pictures.json`) and every guide has one made from its headings. `node scripts/make-pics.cjs` draws them into `public/img/` (webp, small webp, jpg for sharing); run it after changing pictures.json or a guide's title or headings. No prices inside pictures.
- Our work frame: `public/work/cosmolinkos.jpg` is the picture; `cosmolinkos.webm` and `.mp4` are a silent 7 second loop recorded from the real CosmolinkOS banner (Suhen asked 2026-11-11), played over the picture by the last block of `public/js/ui.js` only while on screen.
- Homepage XpertLab teaser (`#lab` in `home-lower.html`, styles at the end of `home.css`): a flat-canvas dotted globe (`public/js/lab-teaser.js`, loaded with `public/js/land.js` by the last block of `ui.js` only when near) plus two CSS-only mini demos. `land.js` is the shared world land map, also used by the XpertLab globe.
- Motion extras (Suhen picked 2026-11-11): `main h2.rv` headings reveal word by word (ui.js wraps the words), rows of `.grid3`/`.rgrid` cards fan in on computers, numbered steps (`.nsteps`) light up and join with a line, and pages fade into each other (`@view-transition` in `site.css`). Guides have a reading progress bar and a phone "In this guide" menu (`blog/[slug].astro`). The three-names block (`Trio.astro`) stays only on Home and About.
- Fresh scripts: after the build, `scripts/version-js.mjs` adds `?v=<hash>` to every `/js/*.js` link (pages and our scripts), and `public/_headers` tells browsers to check `/js/` files each time. Keep writing plain `/js/name.js` in the source.
- Share image: `node scripts/make-og.cjs` writes `public/og.png`

## Speed rule
The 3D scene is an extra. The page must be complete, fast and readable without it (Lighthouse mobile 95+). Phones load 3D only after the first touch or scroll.

## Commands
- `npm run dev` preview at http://localhost:4321
- `npm test` build and check every page
- `STRICT=1 npm test` also fails while any placeholder is left (run before going live)
