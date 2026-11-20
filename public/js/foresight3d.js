/* XpertForesight page (/seo-tools/, 2026-11-19 polish). Three small things, all extras: the page is complete without this file.
   1. The tool cards in #tools get a light ring that follows the mouse (--x / --y on each `.fsglow`), computers only.
   2. The XpertBlueprint screenshot window lies flat as it scrolls in (--t from 1 to 0 on `.fsflat`).
   3. "Rising star" in #xpertblueprint: the XpertForesight mark in three.js (two leaves and the star, from foresight.svg).
      A story loop of about 8 seconds that mirrors the copy "one click runs every scan": six glass tiles (the six scans)
      orbit the mark, fly into it one by one, the star brightens and rises, a ring of light pulses out through the shards,
      and a white plan sheet with three purple lines slides up, holds and fades. No words are drawn in the canvas.
   Speed rules (CLAUDE.md "Speed rule"): three.js loads only near the figure, after the page has loaded on computers and only
   after the first touch or scroll on phones; drawing stops off screen and when the tab is hidden; people who ask for less
   motion keep the still SVG picture (three.js never loads for them); without WebGL the SVG stays and three.js is never fetched.
   Phones arm only on real input (touch, wheel, key, pointer press), never on a 'scroll' event, so a smooth jump to /seo-tools/#plans
   that flies past the figure does not load three.js; "near" is checked again 400 ms after the observer says so, for the same reason.
   Colours: the star stays the logo's lilac #b06cff (the glow sits behind it and is tinted lilac, so it never washes the star white),
   and the plan sheet slides up beside the mark, never over a leaf.
   Markup and styles: src/pages/seo-tools.astro (.fsfig, .fsglow, .fsflat) and the XpertForesight block at the end of page.css. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 1. light ring that follows the mouse on the tool cards (fine pointers only)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tools = document.getElementById('tools');
    if (tools) tools.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.fsglow'); if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // 2. the XpertBlueprint window lies flat as it comes up the screen
  [].forEach.call(document.querySelectorAll('.fsflat'), function (w) {
    var on = false, queued = false;
    function upd() {
      queued = false; var r = w.getBoundingClientRect(), h = innerHeight || 800;
      var t = Math.max(0, Math.min(1, (r.top - h * 0.3) / (h * 0.65)));
      w.style.setProperty('--t', t.toFixed(3));
    }
    function ask() { if (on && !queued) { queued = true; requestAnimationFrame(upd); } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) ask(); }, { rootMargin: '100px 0px' }).observe(w);
    addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask);
    w.style.setProperty('--t', '1'); on = true; upd();
  });
})();

(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fig = document.querySelector('.fsfig'); if (!fig) return;
  // no WebGL (turned off or blocked): keep the SVG and never download three.js (no wasted file, no console error)
  try { var tc = document.createElement('canvas'); if (!(window.WebGLRenderingContext && (tc.getContext('webgl') || tc.getContext('experimental-webgl')))) return; } catch (e) { return; }

  // ---- when to start: near the screen, and after the page load (computers) or the first touch / scroll (phones) ----
  var desk = matchMedia('(min-width: 901px) and (pointer: fine)').matches;
  var armed = false, near = false, started = false;
  function tryStart() {
    if (started || !armed || !near) return; started = true;
    three().then(function (T) { start(T); }).catch(function (e) { if (window.console) console.warn('foresight3d', e); });
  }
  function arm() { armed = true; tryStart(); }
  function idle(f) { (window.requestIdleCallback || function (g) { setTimeout(g, 300); })(f, { timeout: 2000 }); }
  if (desk) { if (document.readyState === 'complete') idle(arm); else addEventListener('load', function () { idle(arm); }, { once: true }); }
  else ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(function (ev) { addEventListener(ev, arm, { once: true, passive: true }); });
  new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) { near = false; return; }
    setTimeout(function () { var r = fig.getBoundingClientRect(); near = r.bottom > -300 && r.top < innerHeight + 300; tryStart(); }, 400);
  }, { rootMargin: '300px 0px' }).observe(fig);

  function three() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (window.__pm3dThree) return window.__pm3dThree; // shared with the other scenes: one download per page
    return (window.__pm3dThree = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = '/vendor/three-r128.min.js';
      s.onload = function () { ok(window.THREE); }; s.onerror = no; document.head.appendChild(s);
    }));
  }

  function start(T) {
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true }); } catch (e) { return; }
    if (!renderer.getContext()) return;
    var phone = !desk || Math.min(screen.width, screen.height) < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.75 : 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
    var cv = renderer.domElement; cv.className = 'fscv'; cv.setAttribute('aria-hidden', 'true');
    fig.appendChild(cv);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 0.2, 15.5); cam.lookAt(0, 0, 0);
    var canvas = function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; };
    var texOf = function (c) { var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; };
    var add = function (m) { m.transparent = true; m.depthWrite = false; m.blending = T.AdditiveBlending; return m; };

    // light: ambient, a white key from the front right, lilac from below, and the same soft purple room as secure3d.js
    scene.add(new T.AmbientLight(0xffffff, 0.55));
    var key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(4, 8, 7); scene.add(key);
    var under = new T.PointLight(0xb06cff, 2.4, 16); under.position.set(0, -3, 3); scene.add(under);
    var rc = canvas(256, 128), rg = rc.getContext('2d'), sky = rg.createLinearGradient(0, 0, 0, 128);
    sky.addColorStop(0, '#ffffff'); sky.addColorStop(0.4, '#e7d4ff'); sky.addColorStop(0.62, '#7b18c1'); sky.addColorStop(1, '#14081f');
    rg.fillStyle = sky; rg.fillRect(0, 0, 256, 128);
    var room = texOf(rc); room.mapping = T.EquirectangularReflectionMapping;
    var pmg = new T.PMREMGenerator(renderer); scene.environment = pmg.fromEquirectangular(room).texture; pmg.dispose(); room.dispose();

    var world = new T.Group(); scene.add(world); // leans towards the mouse
    var K = 0.02; // the mark is drawn in its own 200 x 200 units (foresight.svg), scaled to about 4 units

    // ---- the mark: exact quarter-circle arcs from foresight.svg (screen angles in degrees, y down), turned into three.js units ----
    var seg = phone ? 12 : 24;
    function arc(pts, cx, cy, r, a0, a1, ox, oy) {
      for (var i = 0; i <= seg; i++) { var a = (a0 + (a1 - a0) * i / seg) * Math.PI / 180; pts.push(new T.Vector2(cx + r * Math.cos(a) - ox, -(cy + r * Math.sin(a) - oy))); }
    }
    function shapeOf(pts) { // drop the repeated point where two arcs meet (and the closing one), the triangulation dislikes them
      pts = pts.filter(function (v, i) { return !i || v.distanceTo(pts[i - 1]) > 1e-6; }); if (pts[pts.length - 1].distanceTo(pts[0]) < 1e-6) pts.pop();
      var s = new T.Shape(); s.moveTo(pts[0].x, pts[0].y); for (var i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y); return s; }
    // leaf 1: the lens between the circles centred (103,103) and (190,190), radius 87; leaf 2 is its mirror
    var l1 = []; arc(l1, 103, 103, 87, 0, 90, 100, 100); arc(l1, 190, 190, 87, 180, 270, 100, 100);
    var l2 = l1.map(function (p) { return new T.Vector2(-p.x, p.y); }).reverse();
    // the star: four concave radius-42 arcs centred (142,14), (142,98), (58,98), (58,14); built around its own centre (100,56)
    var st = []; arc(st, 142, 14, 42, 180, 90, 100, 56); arc(st, 142, 98, 42, 270, 180, 100, 56); arc(st, 58, 98, 42, 360, 270, 100, 56); arc(st, 58, 14, 42, 90, 0, 100, 56);
    var ext = { depth: 14, bevelEnabled: true, bevelThickness: 3, bevelSize: 2.2, bevelSegments: 3, curveSegments: seg };
    var leafGeo = new T.ExtrudeGeometry([shapeOf(l1), shapeOf(l2)], ext); leafGeo.translate(0, 0, -7);
    var starGeo = new T.ExtrudeGeometry(shapeOf(st), ext); starGeo.translate(0, 0, -7);
    // leaves: the brand gradient #9a35e8 -> #6a12ad from top left to bottom right (shape coordinates are the UVs, so repeat 1/200)
    var gc = canvas(256), gg = gc.getContext('2d'), lg = gg.createLinearGradient(0, 0, 256, 256);
    lg.addColorStop(0, '#9a35e8'); lg.addColorStop(1, '#6a12ad'); gg.fillStyle = lg; gg.fillRect(0, 0, 256, 256);
    var gt = texOf(gc); gt.repeat.set(1 / 200, 1 / 200); gt.offset.set(0.5, 0.5);
    var leaves = new T.Mesh(leafGeo, new T.MeshStandardMaterial({ map: gt, metalness: 0.3, roughness: 0.38, envMapIntensity: 0.75 }));
    // r128 reads hex colours as linear, so convert the logo's sRGB lilac first or the sRGB output washes it out to near white
    var starMat = new T.MeshStandardMaterial({ color: new T.Color(0xb06cff).convertSRGBToLinear(), emissive: new T.Color(0x7b18c1).convertSRGBToLinear(), emissiveIntensity: 0.3, metalness: 0.2, roughness: 0.45, envMapIntensity: 0.6 });
    var star = new T.Mesh(starGeo, starMat);
    var mark = new T.Group(); mark.scale.setScalar(K); mark.add(leaves);
    var starHold = new T.Group(); starHold.position.set(0, 44, 0); starHold.add(star); mark.add(starHold);
    mark.position.y = -0.15; world.add(mark);

    // fake bloom: an additive soft lilac light behind the star (no post-processing in three.js r128 core); kept soft so the star stays lilac
    function soft(n, stops) { var c = canvas(n), g = c.getContext('2d'), r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(function (s) { r.addColorStop(s[0], s[1]); }); g.fillStyle = r; g.fillRect(0, 0, n, n); return texOf(c); }
    var glowTex = soft(128, [[0, 'rgba(196,150,255,.6)'], [0.3, 'rgba(176,108,255,.35)'], [1, 'rgba(176,108,255,0)']]);
    var bloom = new T.Sprite(add(new T.SpriteMaterial({ map: glowTex, opacity: 0.5 }))); bloom.scale.set(2.6, 2.6, 1);
    world.add(bloom);

    // ---- shards: small tetrahedra in a tilted ring that turns slowly (join page colours) ----
    var ring = new T.Group(); ring.rotation.set(1.15, 0, -0.18); world.add(ring);
    var N = phone ? 120 : 300, COL = [0x7b18c1, 0x9a35e8, 0xb77bff, 0x5a0f96];
    var shards = new T.InstancedMesh(new T.TetrahedronGeometry(0.075), new T.MeshStandardMaterial({ metalness: 0.4, roughness: 0.3 }), N);
    var m4 = new T.Matrix4(), q = new T.Quaternion(), e3 = new T.Euler(), v3 = new T.Vector3(), s3 = new T.Vector3(), col = new T.Color();
    for (var i = 0; i < N; i++) {
      var a = Math.random() * Math.PI * 2, rr = 2.9 + Math.random() * 1.2, sc = 0.5 + Math.random() * 1.1;
      v3.set(Math.cos(a) * rr, Math.sin(a) * rr, (Math.random() - 0.5) * 0.6);
      e3.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); q.setFromEuler(e3); s3.set(sc, sc, sc);
      shards.setMatrixAt(i, m4.compose(v3, q, s3)); shards.setColorAt(i, col.setHex(COL[i % 4]));
    }
    ring.add(shards);
    // the light ring that pulses out through the shards
    var pulse = new T.Mesh(new T.RingGeometry(0.96, 1, 96), add(new T.MeshBasicMaterial({ color: 0xd9b8ff, opacity: 0, side: T.DoubleSide })));
    ring.add(pulse);

    // ---- six glass tiles, one per scan (website on Google, main keyword, ideas, gap, questions, site audit) ----
    function rounded(w, h, r) {
      var s = new T.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
    }
    function face(kind) { // a small purple sign on white glass, different per tile, no words
      var n = 128, c = canvas(n), g = c.getContext('2d');
      g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.moveTo(24, 8); g.arcTo(120, 8, 120, 120, 18); g.arcTo(120, 120, 8, 120, 18); g.arcTo(8, 120, 8, 8, 18); g.arcTo(8, 8, 120, 8, 18); g.fill();
      g.strokeStyle = '#7b18c1'; g.fillStyle = '#7b18c1'; g.lineWidth = 8; g.lineCap = 'round';
      if (kind === 0) { g.beginPath(); g.arc(64, 64, 28, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(36, 64); g.lineTo(92, 64); g.stroke(); }
      if (kind === 1) { g.beginPath(); g.arc(56, 56, 22, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(72, 72); g.lineTo(94, 94); g.stroke(); }
      if (kind === 2) { [40, 64, 88].forEach(function (y, i) { g.beginPath(); g.moveTo(34, y); g.lineTo(94 - i * 16, y); g.stroke(); }); }
      if (kind === 3) { g.beginPath(); g.arc(50, 64, 20, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(78, 64, 20, 0, Math.PI * 2); g.stroke(); }
      if (kind === 4) { g.beginPath(); g.moveTo(64, 30); g.lineTo(72, 56); g.lineTo(98, 64); g.lineTo(72, 72); g.lineTo(64, 98); g.lineTo(56, 72); g.lineTo(30, 64); g.lineTo(56, 56); g.closePath(); g.fill(); }
      if (kind === 5) { g.beginPath(); g.moveTo(28, 70); g.lineTo(48, 70); g.lineTo(58, 44); g.lineTo(72, 88); g.lineTo(82, 64); g.lineTo(100, 64); g.stroke(); }
      return texOf(c);
    }
    var tileGeo = new T.ExtrudeGeometry(rounded(0.7, 0.7, 0.14), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 6 });
    tileGeo.translate(0, 0, -0.04);
    var faceGeo = new T.PlaneGeometry(0.62, 0.62);
    var tiles = [];
    for (var k = 0; k < 6; k++) {
      var tg = new T.Group();
      tg.add(new T.Mesh(tileGeo, new T.MeshStandardMaterial({ color: 0xf3e9ff, metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.55 })));
      var fm = new T.Mesh(faceGeo, new T.MeshBasicMaterial({ map: face(k), transparent: true })); fm.position.z = 0.07; tg.add(fm);
      world.add(tg); tiles.push(tg);
    }

    // ---- the plan sheet: white, three purple lines and a small star, no words ----
    var pc = canvas(256, 320), p = pc.getContext('2d');
    p.fillStyle = '#ffffff'; p.beginPath(); p.moveTo(30, 6); p.arcTo(250, 6, 250, 314, 26); p.arcTo(250, 314, 6, 314, 26); p.arcTo(6, 314, 6, 6, 26); p.arcTo(6, 6, 250, 6, 26); p.fill();
    p.fillStyle = '#b06cff'; p.beginPath(); p.arc(52, 58, 16, 0, Math.PI * 2); p.fill();
    p.fillStyle = '#7b18c1'; [[60, 180], [130, 190], [180, 150], [230, 170]].forEach(function (r, i) { p.globalAlpha = i ? 0.85 : 1; p.fillRect(i ? 38 : 82, i ? r[0] + 10 : 48, i ? r[1] : 120, i ? 16 : 20); });
    p.globalAlpha = 1;
    var sheet = new T.Mesh(new T.PlaneGeometry(1.5, 1.875), new T.MeshBasicMaterial({ map: texOf(pc), transparent: true, opacity: 0, depthWrite: false }));
    sheet.scale.setScalar(0.72); world.add(sheet);

    // ---- size ----
    function size() { var w = fig.clientWidth || 300; renderer.setSize(w, w, false); cam.aspect = 1; cam.updateProjectionMatrix(); }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(fig); else addEventListener('resize', size);

    // the world leans towards the mouse while it is over the section
    var tx = 0, ty = 0, mx = 0, my = 0, sec = fig.closest('section') || fig;
    sec.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = fig.getBoundingClientRect(); tx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)); ty = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
    }, { passive: true });
    sec.addEventListener('pointerleave', function () { tx = ty = 0; });

    // ---- drawing ----
    var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
    var easeIn = function (x) { x = clamp(x); return x * x * x; };
    var easeOut = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
    var bump = function (x, a, b) { return x < a || x > b ? 0 : Math.sin((x - a) / (b - a) * Math.PI); };
    var LOOP = 8, STAR = new T.Vector3(0, 0.73, 0.2), from = new T.Vector3();
    var running = false, raf = 0, t0 = performance.now(), ready = false;
    function frame(now) {
      raf = 0; if (!running) return;
      var t = (now - t0) / 1000, c = t % LOOP;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      world.rotation.y = mx * 0.25 + Math.sin(t * 0.35) * 0.12;
      world.rotation.x = my * 0.25 + Math.sin(t * 0.27) * 0.04;
      mark.rotation.y = Math.sin(t * 0.5) * 0.18;
      ring.rotation.z = -0.18 + t * 0.06;

      // 1-2: tiles orbit, then fly into the star one by one (absorbed = a small flash)
      var flash = 0;
      tiles.forEach(function (tg, k) {
        var a = k / 6 * Math.PI * 2 + t * 0.5, born = clamp((c - 0.15) / 0.5); // fade back in at the start of each loop
        from.set(Math.cos(a) * 2.75, Math.sin(a) * 0.9 - 0.1, Math.sin(a) * 1.4 + 0.4);
        var go = 2 + k * 0.32, f = easeIn((c - go) / 0.65);
        tg.position.copy(from).lerp(STAR, f);
        tg.rotation.set(Math.sin(t + k) * 0.3, -world.rotation.y * 0.6 + Math.sin(t * 0.7 + k) * 0.25, 0);
        var s = (c < go ? easeOut(born) : 1 - f) * 0.9; tg.scale.setScalar(Math.max(0.001, s)); tg.visible = s > 0.01;
        flash = Math.max(flash, bump(c, go + 0.55, go + 0.95));
      });
      // 3: the star brightens and rises a little; 4: a ring of light pulses out; 5: the plan sheet slides up, holds, fades
      var rise = easeOut((c - 4.1) / 0.8) * (1 - easeOut((c - 7.2) / 0.7));
      starHold.position.y = 44 + rise * 14 + Math.sin(t * 1.3) * 2;
      starHold.rotation.z = Math.sin(t * 0.8) * 0.06;
      starMat.emissiveIntensity = 0.3 + flash * 0.15 + rise * 0.25;
      bloom.position.set(0, (44 + rise * 14) * K * 1 + mark.position.y + 0.02 + 0.06, -0.2);
      bloom.material.opacity = 0.18 + flash * 0.12 + rise * 0.15; var bs = 2.2 + rise * 1.3 + flash * 0.4; bloom.scale.set(bs, bs, 1);
      var pu = clamp((c - 4.5) / 1.5); pulse.scale.setScalar(0.6 + easeOut(pu) * 4.2); pulse.material.opacity = pu > 0 && pu < 1 ? (1 - pu) * 0.85 : 0;
      var sh = easeOut((c - 5.0) / 0.6), out = clamp((c - 6.9) / 0.6);
      sheet.position.set(2.65, -1.0 + sh * 0.85, 0.6); // beside the mark, right of the right leaf's tip (x 1.8) sheet.rotation.set(-0.06, -0.28 - world.rotation.y * 0.3, 0.04);
      sheet.material.opacity = sh * (1 - out) * 0.97;
      under.intensity = 2.2 + Math.sin(t * 1.4) * 0.4 + rise * 0.8;

      renderer.render(scene, cam);
      if (!ready) { ready = true; fig.classList.add('gl'); }
      raf = requestAnimationFrame(frame);
    }
    function play(on) { if (on === running) return; running = on; if (on && !raf) raf = requestAnimationFrame(frame); }
    var seen = false;
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; play(seen && !document.hidden); }).observe(fig);
    document.addEventListener('visibilitychange', function () { play(seen && !document.hidden); });
  }
})();
