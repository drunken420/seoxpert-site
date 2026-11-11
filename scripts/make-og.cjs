// Makes public/og.png (the picture shown when the site is shared). Run: node scripts/make-og.cjs
const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  const icon = fs.readFileSync('src/fragments/icon.svg', 'utf8');
  const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(f).toString('base64');
  const html = `<style>
  @font-face{font-family:S;src:url(${font('node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2')});font-weight:100 800}
  @font-face{font-family:I;src:url(${font('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')});font-weight:100 900}
  body{margin:0;width:1200px;height:630px;background:radial-gradient(600px 500px at 82% 50%,rgba(176,108,255,.38),transparent 70%),#f7f2fc;font-family:I;color:#1a1026;position:relative;overflow:hidden}
  .t{position:absolute;left:72px;top:150px;width:640px}
  .k{font:600 24px I;color:#7b18c1;letter-spacing:.02em}
  h1{font:700 76px/1 S;letter-spacing:-.04em;margin:22px 0 26px}h1 em{font-style:normal;color:#7b18c1}
  p{font:500 28px I;color:#51465f;margin:0}
  .b{position:absolute;left:72px;top:60px;font:700 34px S;letter-spacing:-.03em}
  svg{position:absolute;right:110px;top:150px;width:330px;height:330px;filter:drop-shadow(0 30px 40px rgba(90,20,160,.3))}
  i{position:absolute;border-radius:0 100% 0 0;background:#b06cff;opacity:.85}
  </style><div class="b">SEOXpert</div><div class="t"><div class="k">Website design and monthly care</div><h1>Websites built to rank on <em>Google</em> and <em>AI</em>.</h1><p>seoxpert.my</p></div>${icon}
  <i style="right:470px;top:120px;width:34px;height:34px;rotate:20deg"></i><i style="right:60px;top:110px;width:26px;height:26px;rotate:110deg;background:#7b18c1"></i><i style="right:500px;top:470px;width:22px;height:22px;rotate:200deg;background:#7b18c1"></i><i style="right:50px;top:440px;width:44px;height:44px;rotate:290deg"></i><i style="right:270px;top:60px;width:18px;height:18px;rotate:60deg;background:#d9b8ff"></i><i style="right:250px;top:530px;width:28px;height:28px;rotate:150deg;background:#d9b8ff"></i>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: 'public/og.png' }); await b.close();
})();
