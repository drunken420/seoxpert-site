// Checks the built site against SEOXpert's own rules. Run with: npm test
import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const banned = [/klang valley/i, /malaysia/i, /web hosting (plans?|packages?|services?)/i, /lorem ipsum/i];
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
  const n = (text.match(/\[(PLACEHOLDER|DRAFT)\]/g) || []).length; placeholders += n;
  if (n) console.log(`NOTE ${p}: ${n} placeholder(s) still to fill in`);
}
for (const f of ['robots.txt', 'sitemap-index.xml', 'favicon.svg']) if (!fs.existsSync(path.join(dist, f))) fail(f, 'missing');
console.log(`${pages.length} page(s) checked, ${errors} problem(s), ${placeholders} placeholder(s).`);
if (process.env.STRICT && placeholders) { console.log('STRICT: placeholders must be filled before going live.'); process.exit(1); }
process.exit(errors ? 1 : 0);
