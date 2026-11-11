// Big-screen scaling for sizes written inside style="" attributes (the stylesheets are handled by fluid-px.mjs).
// Runs after `astro build` and turns px into rem in every built page.
import fs from 'node:fs';
import path from 'node:path';
import { pxToRem } from './fluid-px.mjs';
let n = 0;
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8');
      const out = html.replace(/ style="([^"]*)"/g, (m, v) => (v.includes('px') ? ` style="${pxToRem(v)}"` : m));
      if (out !== html) { fs.writeFileSync(p, out); n++; }
    }
  }
})('dist');
console.log(`fluid-html: ${n} page(s) updated`);
