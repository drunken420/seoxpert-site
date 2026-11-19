// After squash, before version-js: protect OUR scripts in dist/js so they are hard to read or copy (Suhen's website standards).
// - Only dist/js/*.js. Never three.js in /vendor/, never page HTML, text, meta tags, structured data, sitemap, robots.txt or llms.txt.
// - No source maps are written.
// - Two strengths:
//     FULL  for everyday scripts (menu, chat, packages, pay, contact): names scrambled, words hidden in an encoded list,
//           and the order of the code shuffled (control-flow flattening).
//     LIGHT for 3D and animation scripts, which run 60 times a second: names scrambled and words hidden, but the code order
//           is left alone so animations stay smooth.
// - Names that other scripts or the page use (top-level names, window.*, object properties) are NOT renamed, so nothing breaks.
// - "/js/..." and "/vendor/..." addresses stay readable, because version-js.mjs stamps them with ?v=<hash> afterwards.
// - The same input always gives the same output (fixed seed), so browsers only re-download a script when it really changed.
// Turn off for a build with OBFUSCATE=off (for example to debug a problem on a preview).
import fs from 'node:fs';
import path from 'node:path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const jsDir = path.join('dist', 'js');
if (process.env.OBFUSCATE === 'off') { console.log('obfuscate: skipped (OBFUSCATE=off)'); process.exit(0); }

// 3D scenes, animation loops and big data: keep them fast.
const LIGHT = new Set(['demos.js', 'home.js', 'sx.js', 'promise3d.js', 'secure3d.js', 'lab-teaser.js', 'insight.js', 'foresight3d.js']);
// Pure data (the world map): hiding it would only make it bigger and slower to start.
const SKIP = new Set(['land.js']);

const base = {
  compact: true,
  seed: 20261117,
  sourceMap: false,
  target: 'browser',
  identifierNamesGenerator: 'mangled-shuffled',
  renameGlobals: false,       // other scripts and the page call these names
  renameProperties: false,    // DOM, three.js and JSON property names must stay
  transformObjectKeys: false,
  selfDefending: false,       // can break after minifying; not worth the risk
  debugProtection: false,
  disableConsoleOutput: false,
  numbersToExpressions: false,
  simplify: true,
  splitStrings: false,
  unicodeEscapeSequence: false,
  stringArray: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayIndexShift: true,
  reservedStrings: ['^/js/', '^/vendor/'],
};
// Tuned 2026-11-17: threshold 0.4 with wrapper functions made the every-page script 2.5x bigger (5.7 -> 14.1 KB download) and cost
// one Lighthouse point on two pages; 0.2 without wrappers keeps all three protections at 10 KB and the scores match the old build.
// The LIGHT setting was measured on the homepage hero and the demos: script time while animating is the same as before.
const full = { ...base, stringArrayThreshold: 0.8, stringArrayEncoding: ['base64'], stringArrayWrappersCount: 0,
  controlFlowFlattening: true, controlFlowFlatteningThreshold: 0.2, deadCodeInjection: false };
const light = { ...base, stringArrayThreshold: 0.5, stringArrayEncoding: [], stringArrayWrappersCount: 0,
  controlFlowFlattening: false, deadCodeInjection: false };

// Our scripts are plain (non-module) scripts that share one page, so the helper names the obfuscator adds at the top of each
// file must differ per file, or two scripts on one page overwrite each other (found by the before/after page test, 2026-11-17).
// Short prefixes (_a, _b, ...) keep the files small; they follow the alphabetical file list, so they only shift when a script is added.
const names = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js')).sort();
const prefix = (f) => '_' + names.indexOf(f).toString(36);
let before = 0, after = 0, n = 0;
for (const f of fs.readdirSync(jsDir)) {
  if (!f.endsWith('.js') || SKIP.has(f)) continue;
  // the minifier writes addresses as `/js/name.js`; plain quotes keep them out of the hidden word list (reservedStrings)
  const p = path.join(jsDir, f), a = fs.readFileSync(p, 'utf8').replace(/`(\/(?:js|vendor)\/[\w.-]+)`/g, '"$1"');
  const b = JavaScriptObfuscator.obfuscate(a, { ...(LIGHT.has(f) ? light : full), inputFileName: f, identifiersPrefix: prefix(f) }).getObfuscatedCode();
  before += a.length; after += b.length; n++;
  fs.writeFileSync(p, b + '\n');
}
console.log(`obfuscate: ${n} script(s), ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`);
