// After the build: add ?v=<short hash of the file> to every "/js/name.js" link in the pages and in our own scripts,
// so browsers always fetch a new copy after an update instead of reusing yesterday's script.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dist = 'dist', jsDir = path.join(dist, 'js');
const hash = {};
for (const f of fs.readdirSync(jsDir)) if (f.endsWith('.js')) hash[f] = crypto.createHash('sha1').update(fs.readFileSync(path.join(jsDir, f))).digest('hex').slice(0, 8);
const re = /(["'])\/js\/([\w.-]+\.js)\1/g;
const stamp = (txt) => txt.replace(re, (m, q, f) => (hash[f] ? `${q}/js/${f}?v=${hash[f]}${q}` : m));
let n = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js)$/.test(e.name)) { const a = fs.readFileSync(p, 'utf8'), b = stamp(a); if (a !== b) { fs.writeFileSync(p, b); n++; } }
  }
}
walk(dist);
console.log(`version-js: ${n} file(s) updated`);
