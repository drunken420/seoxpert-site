// Makes the header pictures for the order emails (functions/api/order-mail.js): public/img/mail/<package>.jpg (paid)
// and <package>-free.jpg (founder's invite = a free code). Suhen 2026-11-16: "different email replies and images ... for free codes and
// paid codes for all packages". Run: node scripts/make-mail.cjs   (1200 x 480, shown at 600 x 240 in the email)
// Emails need JPG or PNG (many email apps cannot show webp). No prices in pictures.
const { chromium } = require('playwright');
const fs = require('node:fs');
const icon = fs.readFileSync('src/fragments/icon.svg', 'utf8');
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(f).toString('base64');

// colours follow the XpertInsight plan cards (TIERS in xpertinsight lib/invite.js); builds are brand purples
const P = {
  trial:    { fam: 'XpertRank', name: 'Trial', tag: 'Try XpertRank first', stat: '14 days', sub: 'with your own XpertInsight dashboard', grad: ['#2b1d45', '#6a4f9a'], ink: '#fff', soft: '#d9c9f5', art: 'ring', n: 14 },
  basic:    { fam: 'XpertRank', name: 'Basic', tag: 'Essential SEO', stat: '10', sub: 'target keywords for Google and AI search', grad: ['#4b0d80', '#8a2fd6'], ink: '#fff', soft: '#e6d2ff', art: 'bars', n: 1 },
  plus:     { fam: 'XpertRank', name: 'Plus', tag: 'Growth SEO', stat: '20', sub: 'target keywords for Google and AI search', grad: ['#3a0f86', '#a046f0'], ink: '#fff', soft: '#ecdcff', art: 'bars', n: 2 },
  pro:      { fam: 'XpertRank', name: 'Pro', tag: 'Competitive SEO', stat: '30', sub: 'target keywords for Google and AI search', grad: ['#141045', '#4b2bb8'], ink: '#fff', soft: '#d6d0ff', art: 'bars', n: 3 },
  elite:    { fam: 'XpertRank', name: 'Elite', tag: 'Market-leading SEO', stat: '50', sub: 'target keywords for Google and AI search', grad: ['#12051f', '#45157a'], ink: '#f6e2a8', soft: '#d8c38f', art: 'bars', n: 4, gold: true },
  starter:  { fam: 'XpertForge', name: 'Starter', tag: 'For a first website', stat: '7', sub: 'pages in total, built to rank on Google and AI', grad: ['#6a12ad', '#b06cff'], ink: '#fff', soft: '#f1e6ff', art: 'site', n: 1 },
  business: { fam: 'XpertForge', name: 'Business', tag: 'For a growing business', stat: '15', sub: 'pages in total, built to rank on Google and AI', grad: ['#4b0d80', '#9a35e8'], ink: '#fff', soft: '#ecdcff', art: 'site', n: 2 },
  growth:   { fam: 'XpertForge', name: 'Growth', tag: 'For a bigger website', stat: '30', sub: 'pages in total, built to rank on Google and AI', grad: ['#24063f', '#6a12ad'], ink: '#fff', soft: '#e6d2ff', art: 'site', n: 3 },
};

const art = (p) => {
  const acc = p.gold ? '#e9c46a' : '#ffffff';
  if (p.art === 'bars') { // rising rank bars, more bars on bigger plans, the brand mark on a glass disc
    const bars = [0, 1, 2, 3, 4].map((i) => `<i style="left:${i * 46}px;height:${40 + i * 34}px;opacity:${i <= p.n ? 1 : .22};background:${i <= p.n ? acc : '#fff'}"></i>`).join('');
    return `<div class="bars">${bars}</div><div class="disc">${icon}</div>`;
  }
  if (p.art === 'site') { // a website window with page tiles, more tiles on bigger builds
    const tiles = Array.from({ length: [6, 9, 12][p.n - 1] }, (_, i) => `<b style="opacity:${.55 + (i % 3) * .15}"></b>`).join('');
    return `<div class="win"><div class="wbar"><u></u><u></u><u></u><span>yourbusiness.my</span></div><div class="whero"><div class="wl"></div><div class="wl s"></div><div class="wbtn"></div></div><div class="tiles n${p.n}">${tiles}</div></div><div class="disc sm">${icon}</div>`;
  }
  return `<div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="14"/><circle cx="100" cy="100" r="84" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="528" stroke-dashoffset="132" transform="rotate(-90 100 100)"/></svg><div class="rin"><b>14</b><span>days</span></div></div><div class="disc sm">${icon}</div>`;
};

const page = (id, free) => { const p = P[id]; return `<style>
@font-face{font-family:S;src:url(${font('node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2')});font-weight:100 800}
@font-face{font-family:I;src:url(${font('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')});font-weight:100 900}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:480px;overflow:hidden;position:relative;font-family:I;color:${p.ink};background:radial-gradient(520px 420px at 82% 40%,rgba(255,255,255,.16),transparent 70%),linear-gradient(120deg,${p.grad[0]},${p.grad[1]})}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 1.6px,transparent 1.8px);background-size:28px 28px;mask-image:linear-gradient(90deg,transparent 30%,#000 75%)}
.t{position:absolute;left:72px;top:50px;width:600px}
.brand{display:flex;align-items:center;gap:12px;font:700 28px S;letter-spacing:-.02em}
.brand svg{width:40px;height:40px}
.brand .bi path:nth-of-type(1){fill:#fff}
.chip{display:inline-block;margin-top:30px;font:700 19px I;letter-spacing:.12em;text-transform:uppercase;padding:9px 18px;border-radius:999px;background:rgba(255,255,255,.14);color:${p.soft}}
.chip.free{background:linear-gradient(120deg,#f8dc97,#e7ad45);color:#3a2400}
.chip.paid{background:#fff;color:${p.grad[0]};box-shadow:0 10px 24px -12px rgba(0,0,0,.5)}
.chip em{font-style:normal;display:inline-block;width:24px;height:24px;line-height:24px;margin:-4px 6px -4px -6px;border-radius:50%;background:${p.gold ? '#c9a14e' : '#12a05c'};color:#fff;text-align:center;letter-spacing:0}
.spark i{position:absolute;width:14px;height:14px;background:${p.gold ? '#f6e2a8' : '#fff'};clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);opacity:.9}
.spark i:nth-child(1){right:560px;top:92px;width:22px;height:22px}.spark i:nth-child(2){right:60px;top:300px}.spark i:nth-child(3){right:590px;top:380px;width:10px;height:10px;opacity:.6}
.fam{font:600 30px S;color:${p.soft};margin-top:18px;letter-spacing:-.01em}
h1{font:700 92px/1 S;letter-spacing:-.045em;margin:4px 0 0;color:${p.ink}}
.tag{font:500 26px I;color:${p.soft};margin-top:10px}
.stat{position:absolute;left:72px;bottom:34px;display:flex;align-items:baseline;gap:14px;font:500 22px I;color:${p.soft}}
.stat b{font:700 46px S;color:${p.gold ? '#f6e2a8' : '#fff'};letter-spacing:-.03em}
.disc{position:absolute;right:400px;top:56px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.35);box-shadow:0 30px 60px -20px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.4);display:grid;place-items:center;backdrop-filter:blur(6px)}
.disc svg{width:78px;height:78px}
.disc svg path:nth-of-type(1){fill:#fff}
.disc.sm{width:110px;height:110px;right:470px;top:60px}.disc.sm svg{width:56px;height:56px}
.bars{position:absolute;right:110px;bottom:70px;width:220px;height:200px}
.bars i{position:absolute;bottom:0;width:34px;border-radius:10px 10px 4px 4px;box-shadow:0 14px 30px -12px rgba(0,0,0,.5)}
.win{position:absolute;right:120px;top:110px;width:390px;height:300px;border-radius:18px;background:rgba(255,255,255,.95);box-shadow:0 40px 80px -30px rgba(0,0,0,.6);overflow:hidden;transform:rotate(-3deg)}
.wbar{height:36px;background:#f1e6ff;display:flex;align-items:center;gap:7px;padding:0 14px}
.wbar u{width:11px;height:11px;border-radius:50%;background:#d6bff3}
.wbar span{margin-left:10px;font:600 13px I;color:#7b18c1;background:#fff;border-radius:999px;padding:3px 12px}
.whero{padding:18px 20px 10px}.wl{height:16px;width:70%;border-radius:8px;background:#2a0d47}.wl.s{width:48%;margin-top:9px;background:#c9b3e6}
.wbtn{width:96px;height:24px;border-radius:999px;margin-top:14px;background:linear-gradient(120deg,#9a35e8,#6a12ad)}
.tiles{display:grid;gap:8px;padding:8px 20px}.tiles.n1{grid-template-columns:repeat(3,1fr)}.tiles.n2{grid-template-columns:repeat(3,1fr)}.tiles.n3{grid-template-columns:repeat(4,1fr)}
.tiles b{height:${'30px'};border-radius:8px;background:#e9dbfb}
.tiles.n2 b{height:24px}.tiles.n3 b{height:20px}
.ring{position:absolute;right:150px;top:140px;width:240px;height:240px}
.ring svg{width:240px;height:240px;filter:drop-shadow(0 20px 40px rgba(0,0,0,.35))}
.rin{position:absolute;inset:0;display:grid;place-content:center;text-align:center}.rin b{font:700 76px/1 S;letter-spacing:-.04em}.rin span{font:600 20px I;color:${p.soft};letter-spacing:.1em;text-transform:uppercase}
.rib{position:absolute;right:-74px;top:44px;width:330px;transform:rotate(36deg);text-align:center;font:800 22px I;letter-spacing:.16em;padding:12px 0;color:#3a2400;background:linear-gradient(120deg,#f8dc97,#f2c66d 50%,#e7ad45);box-shadow:0 12px 30px -10px rgba(0,0,0,.5)}
</style><div class="dots"></div>
<div class="t"><div class="brand"><span class="bi">${icon}</span>SEOXpert</div>
<span class="chip${free ? ' free' : ' paid'}">${free ? (p.art === 'site' ? "Founder's invite" : "Founder's invite · 14 days") : '<em>✓</em> Paid · Thank you'}</span>
<div class="fam">${p.fam}</div><h1>${p.name}</h1><div class="tag">${p.tag}</div></div>
${p.art === 'ring' ? '' : `<div class="stat"><b>${p.stat}</b>${p.sub}</div>`}
${art(p)}${free ? '<div class="rib">INVITED</div>' : '<div class="spark"><i></i><i></i><i></i></div>'}`; };

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 480 } });
  for (const id of Object.keys(P)) for (const free of [false, true]) {
    await pg.setContent(page(id, free)); await pg.waitForTimeout(150);
    await pg.screenshot({ path: `public/img/mail/${id}${free ? '-free' : ''}.jpg`, type: 'jpeg', quality: 86 });
  }
  await b.close(); console.log('mail pictures written to public/img/mail/');
})();
