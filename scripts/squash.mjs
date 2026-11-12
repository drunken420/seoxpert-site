// After the build: squash the code people see in "view source", without changing a single word Google or AI tools read.
// - our scripts in dist/js: minified (short names, no notes, no spacing)
// - inline scripts in every page: minified; structured data (JSON-LD): same data, no spacing
// - page HTML: notes (comments) removed and line breaks collapsed. Text, tags, links and attributes stay exactly the same.
//   <pre>, <textarea>, <script> and <style> keep their insides untouched, and Cloudflare's email_off markers are kept.
import fs from 'node:fs';
import path from 'node:path';
import { minifySync } from 'rolldown/utils';

const dist = 'dist';
const opts = { compress: true, mangle: { toplevel: false }, codegen: { removeWhitespace: true } };
function js(name, code) {
  const r = minifySync(name, code, opts);
  if (r.errors && r.errors.length) throw new Error(`squash: could not minify ${name}: ${r.errors.map((e) => e.message).join('; ')}`);
  return r.code.trim();
}

let before = 0, after = 0, files = 0;
const jsDir = path.join(dist, 'js');
for (const f of fs.readdirSync(jsDir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(jsDir, f), a = fs.readFileSync(p, 'utf8'), b = js(f, a);
  before += a.length; after += b.length; files++; fs.writeFileSync(p, b + '\n');
}

const keep = /(<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\2>)/gi;
function page(file, html) {
  // 1. inline scripts and structured data
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, body) => {
    if (/\bsrc=/.test(attrs) || !body.trim()) return m;
    const type = (attrs.match(/type="([^"]+)"/) || [])[1];
    if (type === 'application/ld+json') return `<script${attrs}>${JSON.stringify(JSON.parse(body)).replace(/</g, '\\u003c')}</script>`;
    if (type && type !== 'text/javascript' && type !== 'module') return m;
    return `<script${attrs}>${js(file, body)}</script>`;
  });
  // 2. the rest of the page: drop comments (not email_off), fold line breaks into one space
  return html.split(keep).map((part, i, all) => {
    if (i % 3 === 1) return part;          // a kept block
    if (i % 3 === 2) return '';            // the tag name captured by the group
    return part.replace(/<!--(?!\/?email_off)[\s\S]*?-->/g, '').replace(/[ \t]*\r?\n\s*/g, ' ');
  }).join('').trim() + '\n';
}
let pages = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) { const a = fs.readFileSync(p, 'utf8'), b = page(p, a); before += a.length; after += b.length; fs.writeFileSync(p, b); pages++; }
  }
})(dist);
console.log(`squash: ${files} script(s) and ${pages} page(s), ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`);
