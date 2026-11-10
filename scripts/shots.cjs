// Screenshots of the built site. Usage: node scripts/shots.cjs (needs `npm run preview` running on 4321)
const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
const out = process.env.OUT || 'shots'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp });
  p.on('console', (m) => { if (m.type() === 'error') console.log(name, 'ERROR', m.text().slice(0, 300)); });
  p.on('pageerror', (e) => console.log(name, 'PAGEERROR', String(e).slice(0, 300)));
  await p.goto('http://localhost:4321/', { waitUntil: 'load' });
  await p.waitForTimeout(9000);
  await p.screenshot({ path: `${out}/${name}-0.png` });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 1;
  for (let y = vp.height * 0.9; y < H - 10; y += vp.height * 0.9) {
    await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${out}/${name}-${i++}.png` });
  }
  console.log(name, 'height', H, 'shots', i, 'overflowX', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await p.close();
}
await b.close();
})();
