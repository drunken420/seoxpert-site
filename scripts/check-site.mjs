// Checks the built site against SEOXpert's own rules. Run with: npm test
import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
// Old launch offer terms (Suhen 2026-11-20): hosting is 6 months (was 1 year), free fixes 14 days (was 30).
const offerOld = [/\b(1|one|a) year (of )?free (high speed )?(cloud )?hosting/i, /\byear free (cloud )?hosting/i, /\b(30|thirty) days of free fix/i];
const banned = [/klang valley/i, /web hosting (plans?|packages?|services?)/i, /lorem ipsum/i, ...offerOld];
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (p.endsWith('.html')) pages.push(p); } })(dist);

let errors = 0, placeholders = 0;
const fail = (p, msg) => { errors++; console.log(`FAIL ${p}: ${msg}`); };
for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  for (const re of banned) if (re.test(text)) fail(p, `banned wording ${re}`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (title.length < 20 || title.length > 65) fail(p, `title is ${title.length} characters (want 20 to 65)`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (desc.length < 70 || desc.length > 170) fail(p, `description is ${desc.length} characters (want 70 to 170)`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(p, 'needs exactly one h1');
  if (!/<link rel="canonical"/.test(html)) fail(p, 'no canonical link');
  if (/fonts\.googleapis|cdnjs\.cloudflare/.test(html)) fail(p, 'loads files from another website');
  // ids must be unique on a page, and every "#section" link needs its section (2026-11-17: a dead "#plan" link sat on five pages)
  const idList = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const twice = [...new Set(idList.filter((x, i) => idList.indexOf(x) !== i))];
  if (twice.length) fail(p, `the same id is used more than once: ${twice.slice(0, 5).join(', ')}`);
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!idList.includes(m[1])) fail(p, `link to #${m[1]} but nothing on the page has that id`);
  const n = (text.match(/\[(PLACEHOLDER|DRAFT)\]/g) || []).length; placeholders += n;
  if (n) console.log(`NOTE ${p}: ${n} placeholder(s) still to fill in`);
}
// llms.txt and chat.json also feed the AI chat (functions/api/chat.js)
for (const f of ['robots.txt', 'sitemap-index.xml', 'favicon.svg', 'llms.txt', 'chat.json']) if (!fs.existsSync(path.join(dist, f))) fail(f, 'missing');
for (const f of ['llms.txt', 'chat.json']) { const p = path.join(dist, f); if (fs.existsSync(p)) for (const re of offerOld) if (re.test(fs.readFileSync(p, 'utf8'))) fail(f, `old launch offer wording ${re}`); }

// The AI chat's facts and fact check (src/lib/chat-ai.js), free to run: no AI call. The paid test with real answers is scripts/chat-eval.mjs.
{
  const { priceFacts, checkReply } = await import('../src/lib/chat-ai.js');
  const { build, care } = await import('../src/data/packages.ts');
  const facts = priceFacts();
  for (const t of build.tiers) { const n = t.short.match(/(\d+) pages in total/)[1]; if (!facts.includes(`${n} pages in total`)) fail('chat-ai.js', `${t.name}: total pages missing from the chat facts`); }
  for (const t of care.tiers) if (!facts.includes(`${t.kw} target keywords`)) fail('chat-ai.js', `${t.name}: keywords missing from the chat facts`);
  const bad = 'For the rebuild: RM799 (Starter, up to 5 pages), RM1,499 (Business, up to 10 pages) or RM2,499 (Growth, up to 20 pages). Pro is RM350 a month.';
  if (checkReply(bad).length !== 4) fail('chat-ai.js', 'the fact check missed a wrong page count or price: ' + JSON.stringify(checkReply(bad)));
  const good = 'XpertForge Growth is **RM2,499** for 30 pages in total (20 website pages + 10 blog posts), then XpertRank Pro **RM349** a month (US$79). Starter is 7 pages in total: up to 5 website pages and 2 blog posts.';
  if (checkReply(good).length) fail('chat-ai.js', 'the fact check flagged a correct answer: ' + JSON.stringify(checkReply(good)));
  // XpertForesight (2026-11-19): every price in the chat facts, a correct answer passes the fact check, and /seo-tools/ has one Offer per plan.
  const { foresight } = await import('../src/data/packages.ts');
  const fsAll = [foresight.trial, ...foresight.tiers];
  for (const t of fsAll) if (!facts.includes('RM' + t.rm.toLocaleString('en-US'))) fail('chat-ai.js', `${t.name}: price missing from the chat facts`);
  const fsGood = 'XpertForesight Basic is RM79 a month (US$19), Elite RM999, yearly RM790. The Trial is RM25 for 14 days, then your first Basic month is RM54.';
  if (checkReply(fsGood).length) fail('chat-ai.js', 'the fact check flagged a correct XpertForesight answer: ' + JSON.stringify(checkReply(fsGood)));
  // Launch offer terms (Suhen 2026-11-20): the fact check catches the old 1 year of hosting and 30 days of fixes, and lets the new ones through.
  const oldTerms = 'Growth comes with 4 months of XpertRank Plus free and 1 year of free high speed cloud hosting, plus 30 days of free fixes.';
  if (checkReply(oldTerms).length !== 2) fail('chat-ai.js', 'the fact check missed the old hosting or fixes terms: ' + JSON.stringify(checkReply(oldTerms)));
  const newTerms = 'Growth comes with 4 months of XpertRank Plus free and 6 months of free high speed cloud hosting, plus 14 days of free fixes.';
  if (checkReply(newTerms).length) fail('chat-ai.js', 'the fact check flagged the new offer terms: ' + JSON.stringify(checkReply(newTerms)));
  if (!facts.includes('6 months of free high speed cloud hosting') || !facts.includes('first 20 XpertRank clients')) fail('chat-ai.js', 'the chat facts miss the 6 months of hosting or the first 20 clients limit');
  const fsPage = path.join(dist, 'seo-tools', 'index.html');
  if (!fs.existsSync(fsPage)) fail('seo-tools', 'the /seo-tools/ page is missing');
  else {
    const nodes = [];
    const walkLd = (x) => { if (Array.isArray(x)) x.forEach(walkLd); else if (x && typeof x === 'object') { nodes.push(x); Object.values(x).forEach(walkLd); } };
    for (const m of fs.readFileSync(fsPage, 'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) walkLd(JSON.parse(m[1]));
    const app = nodes.find((x) => x['@type'] === 'SoftwareApplication');
    const want = fsAll.map((t) => t.rm).join(','), got = app ? [].concat(app.offers || []).map((o) => o.price).join(',') : '';
    if (got !== want) fail(fsPage, `the SoftwareApplication Offers should be priced ${want} (got ${got || 'none'})`);
  }
}
// Code protection (scripts/obfuscate.mjs): no source maps anywhere, our scripts are obfuscated, three.js is left alone.
{
  const fs2 = await import('node:fs'), path2 = await import('node:path');
  const walk = (d) => fs2.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path2.join(d, e.name)) : [path2.join(d, e.name)]));
  for (const f of walk('dist')) {
    if (f.endsWith('.map')) fail(f, 'source map in the build: never ship source maps');
    if (/\.(js|html)$/.test(f) &&fs2.readFileSync(f, 'utf8').includes('sourceMappingURL') && !f.includes('vendor')) fail(f, 'sourceMappingURL found: never ship source maps');
  }
  if (process.env.OBFUSCATE !== 'off') for (const f of fs2.readdirSync('dist/js')) {
    if (f === 'land.js' || !f.endsWith('.js')) continue;
    const code = fs2.readFileSync(path2.join('dist/js', f), 'utf8'); // the hidden word list is rotated with push/shift at the top of every obfuscated file
    if (!(code.includes("['push']") && code.includes("['shift']"))) fail('js/' + f, 'script does not look obfuscated (did scripts/obfuscate.mjs run?)');
  }
}
console.log(`${pages.length} page(s) checked, ${errors} problem(s), ${placeholders} placeholder(s).`);
if (process.env.STRICT && placeholders) { console.log('STRICT: placeholders must be filled before going live.'); process.exit(1); }
process.exit(errors ? 1 : 0);
