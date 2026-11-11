// Makes the summary picture for each page and each blog guide (public/img/<name>.webp, -640.webp, -900.webp and .jpg for sharing).
// Run after changing src/data/pictures.json or the guides in src/data/blog.ts:  node scripts/make-pics.cjs
// The words in a picture come from the page itself, so a picture never says something the page does not.
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('node:fs');
const pages = require('../src/data/pictures.json');
const list = Object.values(pages).map((p) => ({ ...p }));
// guides: the title and the section headings, read from blog.ts
const blog = fs.readFileSync('src/data/blog.ts', 'utf8').split('export const posts')[1];
for (const part of blog.split(/\n  \{\n/).slice(1)) {
  const slug = (part.match(/slug: '([^']+)'/) || [])[1]; if (!slug) continue;
  const h1 = part.match(/h1: '([^']+)'/)[1], tag = part.match(/tag: '([^']+)'/)[1];
  const items = [...part.split('faqs:')[0].matchAll(/ h: '([^']+)'/g)].map((m) => m[1].replace(/^\d+\.\s*/, '')).slice(0, 6);
  list.push({ file: 'guide-' + slug, kicker: tag, title: h1, items });
}
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
(async () => {
  const icon = fs.readFileSync('src/fragments/icon.svg', 'utf8');
  const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(f).toString('base64');
  const css = `<style>
  @font-face{font-family:S;src:url(${font('node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2')});font-weight:100 800}
  @font-face{font-family:I;src:url(${font('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')});font-weight:100 900}
  *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:radial-gradient(560px 460px at 92% 8%,rgba(176,108,255,.42),transparent 70%),radial-gradient(420px 320px at 0 100%,rgba(176,108,255,.22),transparent 70%),#f7f2fc;font-family:I;color:#1a1026;position:relative;overflow:hidden;padding:52px 64px}
  .top{display:flex;align-items:center;gap:16px}.top svg{width:44px;height:44px}.top b{font:700 30px S;letter-spacing:-.03em}
  .k{margin-left:auto;font:600 20px I;color:#e9d8ff;background:linear-gradient(120deg,#14081f,#2a0d47);padding:11px 18px;border-radius:99px}
  h1{font:700 52px/1.06 S;letter-spacing:-.04em;margin:34px 0 30px;max-width:980px;text-wrap:balance}
  .g{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
  .g div{display:flex;align-items:center;gap:16px;background:#fff;border:1.5px solid #e6dcf2;border-radius:18px;padding:14px 18px;font:600 24px/1.2 I;box-shadow:0 10px 24px rgba(74,14,120,.08)}
  .g i{flex:none;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#b06cff,#7b18c1);color:#fff;font:700 19px S;font-style:normal;display:grid;place-items:center}
  .few h1{font-size:66px;margin:44px 0 40px}.g.few div{padding:30px 26px;font-size:30px}.g.few i{width:56px;height:56px;font-size:22px}
  .u{position:absolute;left:64px;bottom:30px;font:500 19px I;color:#786c88}
  .p{position:absolute;border-radius:0 100% 0 0;background:#b06cff;opacity:.8}
  </style>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const it of list) {
    const few = it.items.length <= 4 && it.title.length <= 38;
    const html = css + `<body class="${few ? 'few' : ''}"><div class="top">${icon}<b>SEOXpert</b><span class="k">${esc(it.kicker)}</span></div><h1>${esc(it.title)}</h1>
    <div class="g ${few ? 'few' : ''}">${it.items.map((t, i) => `<div><i>${String(i + 1).padStart(2, '0')}</i>${esc(t)}</div>`).join('')}</div>
    <span class="u">seoxpert.my</span><span class="p" style="right:38px;bottom:34px;width:40px;height:40px;rotate:290deg"></span><span class="p" style="right:96px;bottom:26px;width:20px;height:20px;rotate:20deg;background:#7b18c1"></span>`;
    await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(120);
    const over = await p.evaluate(() => document.body.scrollHeight > 630 || [...document.querySelectorAll('.g div')].some((d) => d.getBoundingClientRect().bottom > 590));
    if (over) console.log('TOO TALL', it.file);
    const png = await p.screenshot();
    await sharp(png).webp({ quality: 82 }).toFile(`public/img/${it.file}.webp`);
    await sharp(png).resize(640).webp({ quality: 80 }).toFile(`public/img/${it.file}-640.webp`);
    await sharp(png).resize(900).webp({ quality: 80 }).toFile(`public/img/${it.file}-900.webp`);
    await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(`public/img/${it.file}.jpg`);
  }
  await b.close(); console.log(list.length, 'pictures written to public/img');
})();
