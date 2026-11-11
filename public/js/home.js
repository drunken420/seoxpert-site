/* Concept A: Prompt to Petals. Type a name, the logo's petals rebuild themselves into a website. */
(function () {
  var X = SX, TAU = X.TAU, hero = document.getElementById('top'), cv = document.getElementById('gl');
  var form = document.getElementById('prompt'), input = document.getElementById('biz'), steps = [].slice.call(document.querySelectorAll('#steps li'));
  var name = 'Your Business', demo = true, demoNames = ['Sunny Bakery', 'Corner Cafe', 'Bright Smile Dental', 'Green Leaf Florist', 'Swift Movers', 'Paws Pet Shop', 'Maple Yoga Studio', 'Blue Wave Laundry', 'Peak Fitness Gym', 'Happy Kids Tuition', 'Urban Hair Studio', 'Fresh Bites Catering'], di = Math.floor(Math.random() * 12), timers = [];
  function later(f, ms) { timers.push(setTimeout(f, ms)); }
  function stopDemo() { demo = false; timers.forEach(clearTimeout); timers = []; }
  function setSteps(p, on) { steps.forEach(function (li, i) { var a = i * 0.21 + 0.04; li.className = !on ? '' : p >= a + 0.2 ? 'ok' : p > a ? 'go' : ''; }); }
  function announce() { window.dispatchEvent(new CustomEvent('bizname', { detail: name })); }
  var R = X.renderer(cv), api = null;
  if (R) api = scene3d(); else document.documentElement.classList.add('no3d');
  function build(n) {
    name = (n || '').trim() || 'Your Business'; announce();
    if (api) api.build(name); else { var p = 0, iv = setInterval(function () { p += 0.04; setSteps(p, true); if (p >= 1) clearInterval(iv); }, 80); }
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); stopDemo(); build(input.value); });
  input.addEventListener('focus', stopDemo);
  function typeName(n, done) { input.value = ''; var k = 0; (function step() { if (!demo) return; input.value = n.slice(0, ++k); if (k < n.length) later(step, 70); else later(done, 380); })(); }
  function cycle() {
    if (!demo) return; var n = demoNames[di++ % demoNames.length];
    typeName(n, function () { if (!demo) return; build(n); later(function () { if (!demo) return; if (api) api.reset(); setSteps(0, false); later(cycle, 2400); }, 7200); });
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { later(cycle, X.reduce ? 600 : 1500); });

  function scene3d() {
    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 2, 1, 200);
    X.lights(scene);
    var phone = false, W = 1, H = 1, far = 1;
    var N = window.innerWidth < 900 ? 1400 : 2300, G = 240, SPAN = 9.4, TN = Math.round(N * 0.47);
    var mesh = new THREE.InstancedMesh(X.petalGeo(), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), N); mesh.frustumCulled = false; var stage = new THREE.Group(); scene.add(stage); stage.add(mesh);
    var logo = X.logo(); stage.add(logo);
    var MAIN = [0x7b18c1, 0x7b18c1, 0x8f2be0, 0x6a12ad, 0x5b0f96], LITE = [0xb06cff, 0xc79bff, 0xd9b8ff], col = new THREE.Color(), dummy = new THREE.Object3D();
    var r = X.rng(99), seed = [];
    for (var i = 0; i < N; i++) seed.push({ ph: r() * TAU, d: r(), r: r(), k: Math.floor(r() * 5), k2: Math.floor(r() * 3), sz: 0.75 + r() * 0.6, rs: 0.3 + r() * 0.9, rot: Math.floor(r() * 4) * Math.PI / 2 });
    /* the resting cloud around the logo */
    var IDL = []; var r2 = X.rng(31);
    for (i = 0; i < N; i++) { var a = r2() * TAU, rad = 3.8 + Math.pow(r2(), 1.7) * 1.9; IDL.push({ a: a, r: rad, z: (r2() - 0.5) * 3.4, lite: r2() < 0.3 }); }
    function layout(nm) {
      var txt = X.sample(function (g) { var fs = 44; do { g.font = '800 ' + fs + 'px "Sora Variable", "Inter Variable", sans-serif'; fs--; } while (g.measureText(nm).width > 184 && fs > 12); g.textBaseline = 'alphabetic'; g.fillText(nm, 30, 112); }, TN, G, SPAN, 7);
      var rest = X.sample(function (g) {
        g.strokeStyle = '#00ffff'; g.fillStyle = '#00ffff'; g.lineWidth = 8; X.rr(g, 12, 22, 216, 196, 18); g.stroke();
        g.lineWidth = 4; g.beginPath(); g.moveTo(12, 46); g.lineTo(228, 46); g.stroke();
        [28, 42, 56].forEach(function (x) { g.beginPath(); g.arc(x, 34, 4.5, 0, TAU); g.fill(); });
        g.lineWidth = 5; [[150, 164], [172, 188], [196, 212]].forEach(function (s) { g.beginPath(); g.moveTo(s[0], 66); g.lineTo(s[1], 66); g.stroke(); });
        g.lineWidth = 8; g.beginPath(); g.moveTo(30, 132); g.lineTo(196, 132); g.stroke(); g.beginPath(); g.moveTo(30, 146); g.lineTo(150, 146); g.stroke();
        g.fillStyle = '#fff'; X.rr(g, 30, 160, 72, 24, 11); g.fill();
        g.fillStyle = '#00ffff'; [30, 92, 154].forEach(function (x) { X.rr(g, x, 194, 54, 14, 6); g.fill(); });
      }, N - TN, G, SPAN, 19);
      var L = txt.concat(rest); return L;
    }
    var L = layout(name), SLOT = { x: (34 / G - 0.5) * SPAN, y: (0.5 - 66 / G) * SPAN };
    var fx = new Float32Array(N), fy = new Float32Array(N), fz = new Float32Array(N), cx = new Float32Array(N), cy = new Float32Array(N), cz = new Float32Array(N), ox = new Float32Array(N), oy = new Float32Array(N), oz = new Float32Array(N), built = new Uint8Array(N).fill(2);
    var mode = 'I', p = 1, lf = { x: 0, y: 0, s: 1 }, lc = { x: 0, y: 0, s: 1 };
    function snap() { fx.set(cx); fy.set(cy); fz.set(cz); lf = { x: lc.x, y: lc.y, s: lc.s }; p = 0; }
    var api = {
      build: function (nm) { L = layout(nm); snap(); mode = 'L'; for (var i = 0; i < N; i++) built[i] = 2; },
      reset: function () { snap(); mode = 'I'; }
    };
    function fit() {
      W = hero.clientWidth; H = hero.clientHeight; phone = window.innerWidth < 900;
      R.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2)); R.setSize(W, H, false);
      camera.aspect = W / H; far = Math.max(1, Math.min(2.1, 0.84 / camera.aspect)); camera.position.set(0, 0, 24 * far); camera.lookAt(0, 0, 0);
      if (phone) camera.setViewOffset(W, H, 0, Math.round(H * 0.25), W, H); else camera.setViewOffset(W, H, -Math.round(W * 0.215), 0, W, H);
      stage.scale.setScalar(phone ? 0.8 : 1); camera.updateProjectionMatrix();
    }
    fit(); window.addEventListener('resize', fit);
    var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), hx = 999, hy = 999, mx = -1e4, my = -1e4, px = 0, py = 0;
    var drag = 0, dragV = 0, dragging = false, lastX = 0;
    cv.style.touchAction = 'pan-y';
    hero.addEventListener('pointermove', function (e) { var b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; px = (e.clientX / window.innerWidth - 0.5) * 2; py = (e.clientY / window.innerHeight - 0.5) * 2; if (dragging) { dragV = (e.clientX - lastX) * 0.01; drag += dragV; lastX = e.clientX; } });
    hero.addEventListener('pointerleave', function () { mx = my = -1e4; hx = hy = 999; });
    cv.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; });
    window.addEventListener('pointerup', function () { dragging = false; });
    var run = true; if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { run = es[0].isIntersecting; }).observe(hero);
    var t0 = performance.now(), last = t0, motion = X.reduce ? 0 : 1;
    function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function frame(now) {
      requestAnimationFrame(frame); if (!run) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000), t = (now - t0) / 1000; last = now;
      p = Math.min(1, p + dt / (mode === 'L' ? 2.9 : 1.6));
      if (mode === 'L') setSteps(p, true);
      if (mx > -1e3) { ndc.set(mx / W * 2 - 1, -(my / H) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) { hx = hit.x / stage.scale.x; hy = hit.y / stage.scale.x; } }
      if (!dragging) { dragV *= 0.94; drag += dragV; drag *= 0.985; }
      var spin = t * 0.08 * motion, intro = X.backOut(X.clamp01((t - 0.2) / 1.2));
      for (var i = 0; i < N; i++) {
        var s = seed[i], I = IDL[i], ang = I.a + spin, fl = Math.sin(t * 0.9 + s.ph) * 0.18 * motion;
        var ix = Math.cos(ang) * I.r * intro, iy = Math.sin(ang) * I.r * 0.92 * intro + fl, iz = I.z + Math.sin(t * 0.6 + s.ph) * 0.3 * motion;
        var Lp = L[i], dl = mode === 'L' ? ((Lp.x / SPAN + 0.5) * 0.42 + s.d * 0.08) : s.d * 0.3, q = X.clamp01((p - dl) / 0.5), e = ease(q);
        var tx = mode === 'L' ? Lp.x : ix, ty = mode === 'L' ? Lp.y + Math.sin(t * 1.4 + Lp.x * 0.8) * 0.03 * motion : iy, tz = mode === 'L' ? Lp.z : iz;
        cx[i] = X.lerp(fx[i], tx, e); cy[i] = X.lerp(fy[i], ty, e); cz[i] = X.lerp(fz[i], tz, e) + Math.sin(Math.PI * e) * 2.6 * (s.r - 0.35);
        if (p === 1 && mode === 'I') { fx[i] = cx[i]; fy[i] = cy[i]; fz[i] = cz[i]; }
        /* the pointer pushes petals aside */
        var dx = cx[i] + ox[i] - hx, dy = cy[i] + oy[i] - hy, d2 = dx * dx + dy * dy, push = 0;
        if (d2 < 2.2) { var dd = Math.sqrt(d2) || 1; push = (1 - dd / 1.48) * (mode === 'L' ? 0.5 : 1.1); ox[i] += dx / dd * push * 0.25; oy[i] += dy / dd * push * 0.25; oz[i] += push * 0.2; }
        ox[i] *= 0.9; oy[i] *= 0.9; oz[i] *= 0.9;
        var inL = mode === 'L' && q > 0.55 ? 1 : 0, b = inL ? 1 : 0;
        if (built[i] !== b) { built[i] = b; col.setHex(b ? (Lp.c ? LITE[s.k2] : MAIN[s.k % 3 === 0 ? 4 : s.k]) : (I.lite ? LITE[s.k2] : MAIN[s.k])); mesh.setColorAt(i, col); mesh.instanceColor.needsUpdate = true; }
        var we = mode === 'L' ? e : 1 - e, rt = t * s.rs * motion + s.ph;
        dummy.position.set(cx[i] + ox[i], cy[i] + oy[i], cz[i] + oz[i]);
        dummy.rotation.set(X.lerp(rt, 0, we) + push * 2, X.lerp(rt * 0.7, 0, we), X.lerp(rt * 0.5, s.rot, we));
        var sc = X.lerp(s.sz * 0.15 * intro, Lp.c ? 0.075 : 0.088, we); dummy.scale.set(sc, sc, sc);
        dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      /* logo: centre of the cloud when resting, the site's own logo when built */
      var le = ease(X.clamp01(p / 0.5)), lt = mode === 'L' ? { x: SLOT.x, y: SLOT.y, s: 0.17 } : { x: 0, y: 0, s: 1 };
      lc.x = X.lerp(lf.x, lt.x, le); lc.y = X.lerp(lf.y, lt.y, le); lc.s = X.lerp(lf.s, lt.s, le);
      var ud = logo.userData, a0 = X.backOut(X.clamp01((t - 0.5) / 1.1)), b0 = X.clamp01((t - 1.3) / 0.6), be = 1 - Math.pow(1 - b0, 3);
      ud.tree.scale.setScalar(ud.K * Math.max(0.001, a0)); ud.arrow.position.set((1 - be) * 6, -(1 - be) * 6, (1 - be) * 5); ud.arrow.visible = t > 1.2;
      logo.position.set(lc.x, lc.y + (mode === 'I' ? Math.sin(t * 0.8) * 0.1 * motion : 0), mode === 'L' ? 0.3 : 0);
      logo.scale.setScalar(lc.s);
      var settle = mode === 'L' ? le : 0;
      logo.rotation.y = X.lerp(X.lerp(-1.4, 0, a0) + drag + (px * 0.45 + Math.sin(t * 0.5) * 0.2) * motion, Math.sin(t * 0.7) * 0.15 * motion, settle) + (mode === 'L' ? (1 - le) * TAU : 0);
      logo.rotation.x = X.lerp((py * 0.25) * motion, 0, settle);
      R.render(scene, camera);
    }
    requestAnimationFrame(frame);
    return api;
  }
})();
/* the builder window types out what the AI builder produces */
(function () {
  var body = document.getElementById('bbody'), tabs = [].slice.call(document.querySelectorAll('#btabs u')), stages = [].slice.call(document.querySelectorAll('#stages li')), bname = document.getElementById('bname'), bstat = document.getElementById('bstat');
  var nm = 'Your Business', cur = 0, chars = 0, docs, live = false, hold = 0;
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'yourbusiness'; }
  function make() {
    var u = 'https://' + slug(nm) + '.com';
    docs = [
      [['c', '# site plan for ' + nm + '\n\n'], ['k', '/                  '], ['', 'Home\n'], ['k', '/website-building  '], ['', 'Website building\n'], ['k', '/monthly-care      '], ['', 'Monthly care\n'], ['k', '/packages          '], ['', 'Packages\n'], ['k', '/blog              '], ['', 'Blog\n'], ['k', '/faq               '], ['', 'FAQ\n'], ['k', '/contact           '], ['', 'Contact\n\n'], ['v', '✓ one topic per page\n✓ one H1, headings in order\n✓ unique title and description']],
      [['k', '<h1>'], ['h', nm + ': [what you do]'], ['k', '</h1>\n\n'], ['k', '<p class="answer">\n'], ['', '  ' + nm + ' helps [who] with [what].\n  Open [hours]. WhatsApp [number].\n'], ['k', '</p>\n\n'], ['c', '<!-- the first answer is the one AI tools quote -->\n\n'], ['k', '<h2>'], ['h', 'Services'], ['k', '</h2>\n'], ['k', '<h2>'], ['h', 'Questions people ask'], ['k', '</h2>']],
      [['', '{\n'], ['k', '  "@context"'], ['', ': '], ['v', '"https://schema.org"'], ['', ',\n'], ['k', '  "@type"'], ['', ': '], ['v', '"LocalBusiness"'], ['', ',\n'], ['k', '  "name"'], ['', ': '], ['v', '"' + nm + '"'], ['', ',\n'], ['k', '  "url"'], ['', ': '], ['v', '"' + u + '"'], ['', ',\n'], ['k', '  "openingHours"'], ['', ': '], ['v', '"[hours]"'], ['', ',\n'], ['k', '  "telephone"'], ['', ': '], ['v', '"[number]"'], ['', '\n}']],
      [['h', '# ' + nm + '\n\n'], ['', '> ' + nm + ' is a [type of business].\n> This file tells AI tools what we do.\n\n'], ['h', '## Pages\n'], ['', '- Services: '], ['k', u + '/services\n'], ['', '- FAQ: '], ['k', u + '/faq\n'], ['', '- Contact: '], ['k', u + '/contact']]
    ];
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function paint() {
    var left = chars, h = '', doc = docs[cur], total = 0;
    for (var i = 0; i < doc.length; i++) { total += doc[i][1].length; if (left <= 0) continue; var piece = doc[i][1].slice(0, left); left -= piece.length; h += doc[i][0] ? '<span class="' + doc[i][0] + '">' + esc(piece) + '</span>' : esc(piece); }
    body.innerHTML = h + '<span class="cur"></span>'; return total;
  }
  function go(k) { cur = k; chars = 0; hold = 0; tabs.forEach(function (t, i) { t.classList.toggle('on', i === k); }); stages.forEach(function (s, i) { s.classList.toggle('on', i === k); }); bstat.textContent = 'building'; }
  stages.forEach(function (s, i) { s.addEventListener('click', function () { go(i); }); });
  window.addEventListener('bizname', function (e) { nm = e.detail; bname.textContent = nm; make(); paint(); });
  make();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { live = es[0].isIntersecting; }, { threshold: 0.3 }).observe(body); else live = true;
  setInterval(function () {
    if (!live) return; var total = paint();
    if (chars < total) chars += SX.reduce ? 999 : 3; else { bstat.textContent = '✓ ready'; if (++hold > 70) go((cur + 1) % docs.length); }
  }, 30);
  paint();
})();
