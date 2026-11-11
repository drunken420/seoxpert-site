// Demos page. Each demo starts only when it scrolls near the screen and rests when it leaves.
// The 3D demos share one copy of three.js, loaded on demand from /vendor/.
// Demos that move by themselves stop as soon as a visitor takes over, and stay still for people who ask for less motion.
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = function (id) { return document.querySelector('.dmstage[data-demo="' + id + '"]'); };
  var now = function () { return performance.now(); };
  var threeP = null;
  function three() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!threeP) threeP = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/vendor/three-r128.min.js'; s.onload = function () { ok(window.THREE); }; s.onerror = no; document.head.appendChild(s); });
    return threeP;
  }
  var sxP = null;
  function sx() { return three().then(function () { if (window.SX) return window.SX; if (!sxP) sxP = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/js/sx.js'; s.onload = function () { ok(window.SX); }; s.onerror = no; document.head.appendChild(s); }); return sxP; }); }
  // Run `make(el)` once when the stage comes near; it returns { frame(t), resize(w, h) }. Frames run only while visible.
  function demo(id, make) {
    var el = stage(id); if (!el) return;
    var api = null, started = false, visible = false, raf = 0;
    function loop(t) { raf = 0; if (!visible || !api) return; api.frame(t / 1000); if (!still || api.dirty) raf = requestAnimationFrame(loop); }
    function kick() { if (!raf && visible && api) raf = requestAnimationFrame(loop); }
    function size() { if (api && api.resize) { var r = el.getBoundingClientRect(); if (r.width) api.resize(r.width, r.height); } kick(); }
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting; el.classList.toggle('vis', visible);
      if (visible && !started) { started = true; Promise.resolve(make(el, kick)).then(function (a) { api = a || { frame: function () {} }; el.classList.add('live'); size(); if (window.ResizeObserver) new ResizeObserver(size).observe(el); }).catch(function () { el.classList.add('nogl'); }); }
      kick();
    }, { rootMargin: '200px 0px' }).observe(el);
  }
  function pointer(el, fn) { // normalised pointer position inside el: x, y from 0 to 1
    function h(e) { var r = el.getBoundingClientRect(); fn((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, e); }
    el.addEventListener('pointermove', h); el.addEventListener('pointerdown', h);
  }
  // one pressed button per group: the buttons that share the same data-* name
  function press(b, key) { [].forEach.call(b.parentNode.querySelectorAll('button[data-' + key + ']'), function (o) { o.setAttribute('aria-pressed', String(o === b)); }); }
  function backOut(a) { var c = 1.7, b = a - 1; return a >= 1 ? 1 : 1 + (c + 1) * b * b * b + c * b * b; }

  // 01 Products you can spin: a paper cup, a bottle, a can, a box and a candle jar
  demo('spin', function (el, kick) {
    return three().then(function (T) {
      var cv = el.querySelector('canvas');
      var r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1.6, 0.1, 50); cam.position.set(0, 0.55, 7.2); cam.lookAt(0, 0.1, 0);
      sc.add(new T.HemisphereLight(0xffffff, 0xcdb6ea, 0.95));
      var sun = new T.DirectionalLight(0xffffff, 0.85); sun.position.set(3, 5, 4); sc.add(sun);
      var rim = new T.DirectionalLight(0xb06cff, 0.5); rim.position.set(-4, 2, -3); sc.add(rim);
      var holder = new T.Group(); sc.add(holder);
      // the printed label: a long strip for round products, and a tall face for the box
      var tc = document.createElement('canvas'); tc.width = 1024; tc.height = 256; var tx = new T.CanvasTexture(tc); tx.wrapS = T.RepeatWrapping; tx.repeat.x = 2; tx.anisotropy = 4;
      var bc = document.createElement('canvas'); bc.width = 512; bc.height = 704; var bx = new T.CanvasTexture(bc); bx.anisotropy = 4;
      var d1 = new Path2D(el.dataset.d1), d2 = new Path2D(el.dataset.d2), bandCol = '#7b18c1', font = '"Sora Variable", Sora, system-ui, sans-serif';
      var side = new T.MeshStandardMaterial({ color: 0x7b18c1, roughness: 0.6 });
      function paint() {
        var g = tc.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = bandCol; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#fff';
        g.save(); g.translate(250, 68); g.scale(0.142, 0.142); g.fill(d1); g.globalAlpha = 0.8; g.fill(d2); g.restore();
        g.font = '700 104px ' + font; g.textBaseline = 'middle'; g.fillText('SEOxpert', 400, 134);
        var h = bc.getContext('2d'); h.setTransform(1, 0, 0, 1, 0, 0); h.fillStyle = bandCol; h.fillRect(0, 0, 512, 704); h.fillStyle = '#fff';
        h.save(); h.translate(146, 150); h.scale(0.26, 0.26); h.fill(d1); h.globalAlpha = 0.8; h.fill(d2); h.restore();
        h.font = '700 84px ' + font; h.textAlign = 'center'; h.textBaseline = 'middle'; h.fillText('SEOxpert', 256, 480);
        h.globalAlpha = 0.75; h.font = '600 34px ' + font; h.fillText('XpertForge', 256, 560); h.globalAlpha = 1; h.fillRect(196, 610, 120, 6);
        tx.needsUpdate = bx.needsUpdate = true; side.color.set(bandCol);
      }
      var api = { dirty: true };
      paint(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { paint(); api.dirty = true; kick(); });
      var white = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
      var plum = new T.MeshStandardMaterial({ color: 0x2a0d47, roughness: 0.4 });
      var band = new T.MeshStandardMaterial({ map: tx, roughness: 0.75, side: T.DoubleSide });
      var shiny = new T.MeshStandardMaterial({ map: tx, roughness: 0.32, metalness: 0.3 });
      var glass = new T.MeshStandardMaterial({ color: 0xeadcff, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.5, side: T.DoubleSide, depthWrite: false });
      var metal = new T.MeshStandardMaterial({ color: 0xe4e0ea, roughness: 0.26, metalness: 0.55 });
      var lath = function (pts, m) { return new T.Mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), 64), m); };
      var P = {};
      function prod(k, tilt, s) { var g = new T.Group(); g.rotation.x = tilt; g.scale.setScalar(s || 1); g.visible = false; holder.add(g); P[k] = g; return g; }
      var cup = prod('cup', 0.12);
      cup.add(lath([[0, -1.25], [0.66, -1.25], [0.7, -1.2], [0.95, 1.1], [0.99, 1.13], [0.95, 1.16], [0.9, 1.12], [0.66, -1.16], [0, -1.16]], white));
      cup.add(lath([[0.79, -0.52], [0.905, 0.52]], band));
      cup.add(lath([[0, 1.33], [0.55, 1.33], [0.62, 1.3], [0.66, 1.2], [0.98, 1.2], [1.03, 1.16], [1.03, 1.08], [0.98, 1.06], [0.98, 1.1]], plum));
      var bot = prod('bottle', 0.1);
      bot.add(lath([[0, -1.24], [0.54, -1.24], [0.54, 0.25], [0, 0.25]], new T.MeshStandardMaterial({ color: 0xb06cff, roughness: 0.2, transparent: true, opacity: 0.35 })));
      bot.add(lath([[0, -1.3], [0.52, -1.3], [0.6, -1.22], [0.6, 0.5], [0.52, 0.8], [0.27, 1.02], [0.25, 1.14]], glass));
      bot.add(lath([[0.612, -0.62], [0.612, 0.36]], band));
      var cap = new T.Mesh(new T.CylinderGeometry(0.29, 0.29, 0.34, 40), plum); cap.position.y = 1.28; bot.add(cap);
      var can = prod('can', 0.12);
      can.add(lath([[0, -1.12], [0.5, -1.12], [0.6, -1.04], [0.62, -0.96], [0.62, 0.9], [0.52, 1.08], [0.5, 1.12], [0, 1.12]], metal));
      can.add(lath([[0.626, -0.86], [0.626, 0.8]], shiny));
      var lip = new T.Mesh(new T.TorusGeometry(0.5, 0.03, 8, 48), metal); lip.rotation.x = Math.PI / 2; lip.position.y = 1.12; can.add(lip);
      var tab = new T.Mesh(new T.BoxGeometry(0.22, 0.02, 0.12), metal); tab.position.set(0, 1.13, 0.18); can.add(tab);
      var box = prod('box', 0.08);
      box.add(new T.Mesh(new T.BoxGeometry(1.5, 2.1, 0.75), [side, side, white, white, new T.MeshStandardMaterial({ map: bx, roughness: 0.6 }), new T.MeshStandardMaterial({ map: bx, roughness: 0.6 })]));
      var jar = prod('jar', 0.16, 1.15);
      jar.add(lath([[0, -0.9], [0.85, -0.9], [0.85, 0.08], [0, 0.08]], new T.MeshStandardMaterial({ color: 0xfff4e6, roughness: 0.9 })));
      jar.add(lath([[0, -0.95], [0.86, -0.95], [0.93, -0.88], [0.95, 0.58], [0.9, 0.62]], glass));
      jar.add(lath([[0.958, -0.62], [0.958, 0.02]], band));
      var wick = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.16, 6), plum); wick.position.y = 0.16; jar.add(wick);
      var flame = new T.Mesh(new T.ConeGeometry(0.07, 0.26, 16), new T.MeshBasicMaterial({ color: 0xffb347 })); flame.position.y = 0.36; jar.add(flame);
      var cur = cup, pop = 1; cup.visible = true;
      var ry = -1.9, vy = 0, down = false, lx = 0;
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('.dmsw,.dmprod')) return; down = true; lx = e.clientX; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (e) { if (!down) return; vy = (e.clientX - lx) * 0.012; ry += vy; lx = e.clientX; api.dirty = true; kick(); });
      var up = function () { down = false; el.classList.remove('drag'); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      [].forEach.call(el.querySelectorAll('.dmsw button'), function (b) { b.addEventListener('click', function () { press(b, 'c'); bandCol = b.dataset.c; paint(); el.style.setProperty('--cupc', b.dataset.c); api.dirty = true; kick(); }); });
      [].forEach.call(el.querySelectorAll('.dmprod button'), function (b) { b.addEventListener('click', function () { press(b, 'p'); cur.visible = false; cur = P[b.dataset.p] || cup; cur.visible = true; pop = still ? 1 : 0; if (!still) vy = 0.22; api.dirty = true; kick(); }); });
      api.frame = function (t) {
        if (!down) { if (!still) ry += 0.006 + vy; vy *= 0.94; }
        if (pop < 1) pop = Math.min(1, pop + 0.05);
        holder.scale.setScalar(0.001 + backOut(pop)); holder.rotation.y = ry; holder.position.y = still ? 0 : Math.sin(t * 1.4) * 0.05;
        if (cur === jar && !still) { flame.scale.set(1 + Math.sin(t * 23) * 0.08, 1 + Math.sin(t * 17) * 0.14 + Math.sin(t * 7) * 0.08, 1); flame.rotation.z = Math.sin(t * 5) * 0.08; }
        r.render(sc, cam); api.dirty = Math.abs(vy) > 0.0005 || pop < 1;
      };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < 1.45 ? 8.4 : 7.2; cam.updateProjectionMatrix(); api.dirty = true; };
      return api;
    });
  });

  // 02 A living background: a field of dots that rolls like water
  demo('wave', function (el, kick) {
    return three().then(function (T) {
      var cv = el.querySelector('canvas'), NX = 90, NZ = 44, n = NX * NZ;
      var r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(42, 1.6, 0.1, 100); cam.position.set(0, 3.1, 8.6); cam.lookAt(1.5, 0, 0);
      var pos = new Float32Array(n * 3), i = 0;
      for (var z = 0; z < NZ; z++) for (var x = 0; x < NX; x++) { pos[i++] = (x / (NX - 1) - 0.5) * 26; pos[i++] = 0; pos[i++] = (z / (NZ - 1) - 0.5) * 14; }
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
      var pts = new T.Points(g, new T.PointsMaterial({ color: 0xc79bff, size: 0.075, transparent: true, opacity: 0.9 })); sc.add(pts);
      var mx = 0.7, mz = 0.4, tx = 0.7, tz = 0.4, api = { dirty: true };
      pointer(el, function (x, y) { tx = x; tz = y; api.dirty = true; kick(); });
      api.frame = function (t) {
        mx += (tx - mx) * 0.08; mz += (tz - mz) * 0.08;
        var px = (mx - 0.5) * 26, pz = (mz - 0.5) * 14, tt = still ? 2 : t;
        for (var k = 0; k < n; k++) { var X = pos[k * 3], Z = pos[k * 3 + 2], d = Math.hypot(X - px, Z - pz); pos[k * 3 + 1] = Math.sin(X * 0.55 + tt * 0.9) * 0.34 + Math.cos(Z * 0.7 + tt * 0.7) * 0.3 + Math.exp(-d * d * 0.09) * 1.5 * Math.cos(d * 1.4 - tt * 2.4); }
        g.attributes.position.needsUpdate = true; r.render(sc, cam); api.dirty = Math.abs(tx - mx) + Math.abs(tz - mz) > 0.002;
      };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); api.dirty = true; };
      return api;
    });
  });

  // 03 Your name in particles (plain 2D canvas, no 3D library needed). It cycles through our names until someone types.
  demo('name', function (el, kick) {
    var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), inp = el.querySelector('input');
    var W = 0, H = 0, dpr = 1, P = [], mx = -9, my = -9, api = { dirty: true };
    var names = ['SEOXpert', 'XpertForge', 'XpertCore', 'XpertCare', 'XpertLab', 'Your brand'], ni = 0, mine = false, next = 0;
    function targets() {
      var o = document.createElement('canvas'); o.width = W; o.height = H; var c = o.getContext('2d');
      var word = (inp.value || '').trim() || 'Hello', fs = Math.min(H * 0.42, (W * 0.86) / Math.max(word.length, 3) * 1.55);
      c.font = '800 ' + fs + 'px Sora Variable, Sora, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, W / 2, H * 0.44);
      var d = c.getImageData(0, 0, W, H).data, step = Math.max(3, Math.round(Math.sqrt((W * H) / 9000))), out = [];
      for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 128) out.push([x, y]);
      for (var i = 0; i < out.length; i++) { var p = P[i] || (P[i] = { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0 }); p.tx = out[i][0]; p.ty = out[i][1]; p.s = step * 0.42; }
      P.length = out.length; api.dirty = true; kick();
    }
    pointer(el, function (x, y) { mx = x * W; my = y * H; api.dirty = true; kick(); });
    el.addEventListener('pointerleave', function () { mx = my = -999; });
    inp.addEventListener('input', function () { mine = true; targets(); });
    inp.addEventListener('focus', function () { mine = true; });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (W) targets(); });
    api.frame = function (t) {
      if (!mine && !still && W) { if (!next) next = t + 3.4; else if (t > next) { next = t + 3.4; ni = (ni + 1) % names.length; inp.value = names[ni]; P.forEach(function (p) { p.vx += (Math.random() - 0.5) * 22; p.vy += (Math.random() - 0.5) * 22; }); targets(); } }
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var moving = 0, R = Math.min(W, H) * 0.22;
      for (var i = 0; i < P.length; i++) { var p = P[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < R * R) { var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 6; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        if (still) { p.x = p.tx; p.y = p.ty; } else { p.vx = (p.vx + (p.tx - p.x) * 0.05) * 0.84; p.vy = (p.vy + (p.ty - p.y) * 0.05) * 0.84; p.x += p.vx; p.y += p.vy; moving += Math.abs(p.vx) + Math.abs(p.vy); }
        cx.fillStyle = i % 5 ? '#d9b8ff' : '#ffffff'; cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 6.283); cx.fill(); }
      api.dirty = moving > 1;
    };
    api.resize = function (w, h) { dpr = Math.min(devicePixelRatio || 1, 2); W = Math.round(w); H = Math.round(h); cv.width = W * dpr; cv.height = H * dpr; targets(); };
    return api;
  });

  // 04 Cards that tilt, shine and turn over. Left alone, a slow wave runs across them and one peeks at its back now and then.
  demo('tilt', function (el) {
    var cs = [].slice.call(el.querySelectorAll('.tcard')), last = -1e9, peekAt = 0, pk = 0, api = { dirty: true };
    function put(c, x, y, glow) {
      c.style.setProperty('--ry', ((x - 0.5) * 32).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((0.5 - y) * 32).toFixed(2) + 'deg');
      c.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); c.style.setProperty('--go', glow);
    }
    cs.forEach(function (c) {
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); last = now(); cs.forEach(function (o) { if (o !== c) { o.classList.remove('on'); put(o, 0.5, 0.5, 0); } }); c.classList.add('on', 'hand'); put(c, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 1); });
      var off = function () { c.classList.remove('on', 'hand'); put(c, 0.5, 0.5, 0); };
      c.addEventListener('pointerleave', off); c.addEventListener('pointercancel', off);
      c.addEventListener('click', function () { last = now(); c.classList.remove('peek'); c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); });
    });
    api.frame = function (t) {
      if (still || now() - last < 2600) return;
      cs.forEach(function (c, i) { c.classList.add('on'); put(c, 0.5 + Math.sin(t * 0.9 + i * 1.2) * 0.34, 0.5 + Math.cos(t * 0.7 + i * 0.9) * 0.3, 0.6); });
      if (!peekAt) peekAt = t + 3; else if (t > peekAt) { peekAt = t + 5; var c = cs[pk++ % cs.length]; if (c.getAttribute('aria-pressed') !== 'true') { c.classList.add('peek'); setTimeout(function () { c.classList.remove('peek'); }, 1700); } }
    };
    return api;
  });

  // 05 Before and after slider: it sweeps by itself until someone grabs the handle
  demo('slide', function (el) {
    var s = el.querySelector('.dmslide'), i = s.querySelector('input'), last = -1e9, ph = -0.41, lt = 0, api = { dirty: true };
    function put(v) { s.style.setProperty('--p', v + '%'); }
    i.addEventListener('input', function () { last = now(); put(i.value); });
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { i.addEventListener(ev, function () { last = now(); }, { passive: true }); });
    api.frame = function (t) { var dt = Math.min(0.05, t - lt); lt = t; if (still || now() - last < 4000 || document.activeElement === i) return; ph += dt * 0.75; var v = 50 + Math.sin(ph) * 38; i.value = Math.round(v); put(v.toFixed(2)); };
    return api;
  });

  // 06 Charts that draw themselves, and draw again every few seconds while on screen
  var ch = stage('draw');
  if (ch) {
    var go = function () { ch.classList.add('reset'); ch.classList.remove('go'); void ch.offsetWidth; ch.classList.remove('reset'); requestAnimationFrame(function () { ch.classList.add('go'); }); };
    var chT = 0, chSeen = false, chLoop = function () { clearInterval(chT); if (chSeen && !still) chT = setInterval(go, 6500); };
    new IntersectionObserver(function (es) { chSeen = es[0].isIntersecting; if (chSeen) ch.classList.add('go'); chLoop(); }, { threshold: 0.45 }).observe(ch);
    ch.querySelector('.dmreplay').addEventListener('click', function () { go(); chLoop(); });
  }

  // Light and dark switch: it flips by itself every few seconds; a tap takes over for a while
  [].forEach.call(document.querySelectorAll('.dmtheme'), function (t) {
    var b = t.querySelector('.tsw'), hold = 0, tm = 0;
    function set(on) { t.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Light mode' : 'Dark mode'); }
    b.addEventListener('click', function () { hold = Date.now() + 12000; set(!t.classList.contains('on')); });
    new IntersectionObserver(function (es) { clearInterval(tm); if (es[0].isIntersecting && !still) tm = setInterval(function () { if (Date.now() > hold && !document.hidden) set(!t.classList.contains('on')); }, 3200); }, { threshold: 0.4 }).observe(t);
  });

  // 05 Spotlight reveal: the light wanders by itself until someone takes over
  demo('spot', function (el, kick) {
    var box = el.querySelector('.dmspot'), x = 0.5, y = 0.5, tx = 0.5, ty = 0.5, mine = false, api = { dirty: true };
    pointer(el, function (px, py) { mine = true; tx = px; ty = py; api.dirty = true; kick(); });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') mine = false; });
    // a mouse keeps steering the light after it leaves the box, for as long as the box is on screen
    window.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var r = el.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > window.innerHeight) return;
      mine = true; tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; api.dirty = true; kick(); }, { passive: true });
    api.frame = function (t) { if (!mine && !still) { tx = 0.5 + Math.sin(t * 0.7) * 0.3; ty = 0.5 + Math.sin(t * 1.1) * 0.24; }
      x += (tx - x) * 0.14; y += (ty - y) * 0.14; box.style.setProperty('--x', (x * 100).toFixed(2) + '%'); box.style.setProperty('--y', (y * 100).toFixed(2) + '%'); api.dirty = Math.abs(tx - x) + Math.abs(ty - y) > 0.001; };
    return api;
  });

  // Weather for the 3D logo: rain, snow, petals or a storm, drawn on a flat canvas over the stage,
  // or over the whole page when "Whole page" is on. A small chip lets visitors turn it off from anywhere.
  function weather(el, ctl, onFlash) {
    var cv = document.createElement('canvas'), cx = cv.getContext('2d'), kind = 'clear', page = false, near = false, W = 0, H = 0, P = [], raf = 0, flash = 0, nextBolt = 0, bolt = null;
    var PC = ['#7b18c1', '#9a35e8', '#b06cff', '#d9b8ff'], names = { rain: 'Rain', snow: 'Snow', petals: 'Petals', storm: 'Storm' };
    cv.className = 'wx'; cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv);
    var chip = document.createElement('div'); chip.className = 'wxchip'; chip.hidden = true; chip.innerHTML = '<span></span><button type="button">Turn off</button>'; document.body.appendChild(chip);
    var whole = ctl.querySelector('[data-whole]');
    function dark() { return !page && /dark|space|aurora|purple|sunset/.test(el.dataset.bg || ''); }
    function run() { return kind !== 'clear' && !still && !document.hidden && (page || near); }
    function fit() { var d = Math.min(devicePixelRatio || 1, page ? 1.25 : 2), w = page ? innerWidth : el.clientWidth, h = page ? innerHeight : el.clientHeight; if (w === W && h === H) return; W = w; H = h; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
    function count() { var a = W * H, k = { rain: [240, 1900], storm: [340, 1300], snow: [170, 3400], petals: [60, 9500] }[kind]; return Math.round(Math.min(k[0], a / k[1])); }
    function spawn(p, top) {
      p.x = Math.random() * (W + 160) - 40; p.y = top ? -30 - Math.random() * 60 : Math.random() * H;
      if (kind === 'snow') { p.r = 1.4 + Math.random() * 3; p.vy = 0.5 + Math.random() * 1.1; p.ph = Math.random() * 6.3; }
      else if (kind === 'petals') { p.r = 6 + Math.random() * 8; p.vy = 0.7 + Math.random() * 1.1; p.ph = Math.random() * 6.3; p.a = Math.random() * 6.3; p.c = PC[Math.floor(Math.random() * PC.length)]; }
      else { p.l = 10 + Math.random() * 16; p.vy = (kind === 'storm' ? 14 : 9) + Math.random() * 5; }
      return p;
    }
    function strike() { var x = W * (0.2 + Math.random() * 0.6), y = 0, pts = [[x, 0]]; while (y < H * 0.7) { y += 16 + Math.random() * 30; x += (Math.random() - 0.5) * 60; pts.push([x, y]); } bolt = pts; flash = 1; onFlash(1); setTimeout(function () { flash = 0.75; onFlash(0.7); }, 150); }
    function frame(ts) {
      raf = 0; if (!run()) { cx.clearRect(0, 0, W, H); return; }
      fit(); var t = ts / 1000, n = count(), wind = kind === 'storm' ? -3.4 : kind === 'rain' ? -1.4 : Math.sin(t * 0.3) * 0.6;
      while (P.length < n) P.push(spawn({}, false)); P.length = n; cx.clearRect(0, 0, W, H);
      if (kind === 'storm') { cx.fillStyle = page ? 'rgba(20,8,31,.14)' : 'rgba(20,8,31,.18)'; cx.fillRect(0, 0, W, H); }
      if (kind === 'rain' || kind === 'storm') {
        cx.strokeStyle = dark() || kind === 'storm' ? 'rgba(217,184,255,.6)' : 'rgba(123,24,193,.34)'; cx.lineWidth = 1.3; cx.beginPath();
        P.forEach(function (p) { p.y += p.vy; p.x += wind; if (p.y > H + 20 || p.x < -60) spawn(p, true); cx.moveTo(p.x, p.y); cx.lineTo(p.x - wind * p.l / p.vy, p.y - p.l); }); cx.stroke();
      } else if (kind === 'snow') {
        cx.fillStyle = dark() ? 'rgba(255,255,255,.92)' : 'rgba(176,108,255,.6)'; cx.beginPath();
        P.forEach(function (p) { p.y += p.vy; p.x += wind + Math.sin(t * 1.2 + p.ph) * 0.6; if (p.y > H + 10) spawn(p, true); cx.moveTo(p.x + p.r, p.y); cx.arc(p.x, p.y, p.r, 0, 6.283); }); cx.fill();
      } else {
        P.forEach(function (p) { p.y += p.vy; p.x += wind + Math.sin(t * 1.3 + p.ph) * 0.9; p.a += 0.025; if (p.y > H + 20) spawn(p, true);
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(1, Math.cos(p.a * 1.6 + p.ph)); cx.globalAlpha = 0.85; cx.fillStyle = p.c; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(p.r, 0); cx.arc(0, 0, p.r, 0, Math.PI / 2); cx.closePath(); cx.fill(); cx.restore(); });
      }
      if (kind === 'storm') {
        if (!nextBolt) nextBolt = t + 1.5; else if (t > nextBolt) { nextBolt = t + 3.5 + Math.random() * 4; strike(); }
        if (flash > 0.02) {
          cx.fillStyle = 'rgba(255,255,255,' + (flash * (page ? 0.22 : 0.38)).toFixed(3) + ')'; cx.fillRect(0, 0, W, H);
          if (bolt) { cx.save(); cx.strokeStyle = 'rgba(255,255,255,' + flash.toFixed(3) + ')'; cx.shadowColor = '#d9b8ff'; cx.shadowBlur = 18; cx.lineWidth = 2.6; cx.beginPath(); bolt.forEach(function (q, k) { if (k) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); cx.stroke(); cx.restore(); }
          flash *= 0.88;
        }
      }
      raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf && run()) raf = requestAnimationFrame(frame); }
    function sync() { chip.hidden = !(page && kind !== 'clear'); chip.firstChild.textContent = 'Weather: ' + (names[kind] || ''); whole.setAttribute('aria-pressed', String(page)); }
    function set(k) { kind = k; P = []; nextBolt = 0; flash = 0; [].forEach.call(ctl.querySelectorAll('button[data-wx]'), function (o) { o.setAttribute('aria-pressed', String(o.dataset.wx === k)); }); sync(); if (!run()) cx.clearRect(0, 0, W, H); wake(); }
    function setPage(on) { page = on; cx.clearRect(0, 0, W, H); W = H = 0; P = []; if (on) { cv.classList.add('page'); document.body.appendChild(cv); if (kind === 'clear') set('petals'); } else { cv.classList.remove('page'); el.appendChild(cv); } sync(); wake(); }
    [].forEach.call(ctl.querySelectorAll('button[data-wx]'), function (b) { b.addEventListener('click', function () { set(b.dataset.wx); }); });
    whole.addEventListener('click', function () { setPage(!page); });
    chip.querySelector('button').addEventListener('click', function () { setPage(false); set('clear'); });
    document.addEventListener('visibilitychange', wake);
    new IntersectionObserver(function (es) { near = es[0].isIntersecting; wake(); }).observe(el);
  }

  // 07 The logo as a 3D object (uses the same logo builder as the homepage): finishes, lights, backgrounds and weather
  demo('logo3d', function (el, kick) {
    var ctl = el.parentNode.querySelector('.dmctl'), flashTo = function () {};
    if (ctl) weather(el, ctl, function (f) { flashTo(f); });
    return sx().then(function (SX) {
      var T = window.THREE, r = SX.renderer(el.querySelector('canvas')); if (!r) throw new Error('no 3D');
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1.6, 0.1, 100); cam.position.set(0, 0, 10); SX.lights(sc, 0xb06cff);
      var L = sc.children.filter(function (o) { return o.isLight; }), amb = L[0], key = L[1], rim = L[2], ambBase = amb.intensity, flash = 0, anim = '', bg = 'light', fin = 'purple';
      // each look: ambient, key colour, key strength, key position, rim colour, rim strength, and an optional moving light
      var looks = { soft: [0.78, 0xffffff, 0.85, [5, 8, 12], 0xb06cff, 0.4], studio: [0.22, 0xffffff, 1.6, [-7, 9, 9], 0xffffff, 0.9], neon: [0.25, 0xff4fd0, 1.25, [8, 2, 8], 0x2fd6ff, 1.6],
        sunset: [0.34, 0xff8a3c, 1.55, [-9, 1.5, 7], 0xff3d7f, 1.1], moon: [0.16, 0x9fc4ff, 0.95, [6, 9, 6], 0x4f6bff, 0.9], gold: [0.4, 0xffd27a, 1.5, [4, 7, 10], 0xffa51f, 0.8],
        disco: [0.2, 0xff4fd0, 1.4, [6, 4, 8], 0x2fd6ff, 1.4, 'disco'], aurora: [0.22, 0x2fd6a0, 1.35, [-6, 7, 7], 0x9a35e8, 1.4, 'aurora'], fire: [0.18, 0xff7a2a, 1.5, [3, -5, 8], 0xffd27a, 1.1, 'fire'] };
      // the colours a shiny finish reflects: sky, middle and floor of each background
      var skies = { light: ['#ffffff', '#efe3fb', '#b99ae0'], dark: ['#2a2233', '#0c0811', '#000000'], purple: ['#ead6ff', '#7b18c1', '#2a0d47'], sunset: ['#2b1a5e', '#ff7a45', '#ffd27a'],
        grid: ['#ffffff', '#f3e9fd', '#9a35e8'], space: ['#1a1240', '#06040c', '#000000'], aurora: ['#2fd6a0', '#2a1660', '#06040c'] };
      var G = SX.logo({}), U = G.userData, pm = null, envRT = null;
      var fins = {
        purple: U.mats,
        chrome: [new T.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.06 }), new T.MeshStandardMaterial({ color: 0xece2ff, metalness: 1, roughness: 0.12 })],
        gold: [new T.MeshStandardMaterial({ color: 0xffbf52, metalness: 1, roughness: 0.18, envMapIntensity: 1.7 }), new T.MeshStandardMaterial({ color: 0xffe09a, metalness: 1, roughness: 0.24, envMapIntensity: 1.7 })],
        glass: [new T.MeshStandardMaterial({ color: 0xe2ccff, metalness: 0.25, roughness: 0.03, transparent: true, opacity: 0.42, envMapIntensity: 1.8 }), new T.MeshStandardMaterial({ color: 0xffffff, metalness: 0.25, roughness: 0.03, transparent: true, opacity: 0.55, envMapIntensity: 1.8 })],
        holo: [new T.MeshStandardMaterial({ metalness: 0.7, roughness: 0.15, envMapIntensity: 1.4 }), new T.MeshStandardMaterial({ metalness: 0.7, roughness: 0.15, envMapIntensity: 1.4 })]
      };
      var shiny = function () { return fin !== 'purple'; };
      function env() { // paint a small studio around the logo for shiny finishes to reflect
        var c = document.createElement('canvas'); c.width = 512; c.height = 256; var g = c.getContext('2d'), s = skies[bg] || skies.light, gr = g.createLinearGradient(0, 0, 0, 256);
        gr.addColorStop(0, s[0]); gr.addColorStop(0.52, s[1]); gr.addColorStop(1, s[2]); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
        var dk = g.createLinearGradient(0, 120, 0, 256); dk.addColorStop(0, 'rgba(18,10,28,0)'); dk.addColorStop(0.15, 'rgba(18,10,28,.82)'); dk.addColorStop(1, 'rgba(18,10,28,.55)'); g.fillStyle = dk; g.fillRect(0, 120, 512, 136);
        g.fillStyle = 'rgba(30,18,44,.55)'; [[0, 30, 22, 90], [120, 20, 40, 100], [320, 10, 26, 110], [420, 30, 20, 80]].forEach(function (b) { g.fillRect(b[0], b[1], b[2], b[3]); });
        g.fillStyle = '#ffffff'; g.fillRect(0, 122, 512, 3); [[30, 60, 70, 30], [190, 40, 120, 20], [350, 70, 44, 70], [450, 100, 48, 16]].forEach(function (b) { g.fillRect(b[0], b[1], b[2], b[3]); });
        g.globalAlpha = 0.8; g.fillStyle = '#' + key.color.getHexString(); g.fillRect(110, 118, 110, 12); g.fillStyle = '#' + rim.color.getHexString(); g.fillRect(290, 150, 140, 10); g.globalAlpha = 1;
        var t = new T.CanvasTexture(c); pm = pm || new T.PMREMGenerator(r); var rt = pm.fromEquirectangular(t); t.dispose(); if (envRT) envRT.dispose(); envRT = rt;
        ['chrome', 'gold', 'glass', 'holo'].forEach(function (k) { fins[k].forEach(function (m) { m.envMap = rt.texture; m.needsUpdate = true; }); });
      }
      function look(name) { var k = looks[name] || looks.soft; amb.intensity = ambBase = k[0]; key.color.setHex(k[1]); key.intensity = k[2]; key.position.set(k[3][0], k[3][1], k[3][2]); rim.color.setHex(k[4]); rim.intensity = k[5]; anim = k[6] || ''; }
      if (ctl) [].forEach.call(ctl.querySelectorAll('button[data-fin],button[data-light],button[data-bg]'), function (b) { b.addEventListener('click', function () {
        var d = b.dataset;
        if (d.fin) { press(b, 'fin'); fin = d.fin; U.tree.material = fins[fin][0]; U.arrow.material = fins[fin][1]; if (shiny()) env(); }
        if (d.bg) { press(b, 'bg'); bg = d.bg; el.dataset.bg = bg; if (shiny()) env(); }
        if (d.light) { press(b, 'light'); look(d.light); if (shiny()) env(); }
        api.dirty = true; kick(); }); });
      flashTo = function (f) { flash = Math.max(flash, f * 1.4); api.dirty = true; kick(); };
      var box = new T.Box3().setFromObject(G), sz = box.getSize(new T.Vector3()), piv = new T.Group(); G.position.sub(box.getCenter(new T.Vector3())); piv.add(G); piv.scale.setScalar(3.0 / Math.max(sz.x, sz.y)); sc.add(piv);
      // drag turns it all the way round (and up and down with a mouse); it keeps the angle you leave it at
      var tx = 0, ty = 0, rx = 0, ry = 0, spin = 0, tilt = 0, vs = 0, vt = 0, down = false, lx = 0, ly = 0, api = { dirty: true };
      pointer(el, function (x, y) { tx = (x - 0.5) * 0.5; ty = (y - 0.5) * 0.4; api.dirty = true; kick(); });
      el.addEventListener('pointerdown', function (e) { down = true; lx = e.clientX; ly = e.clientY; vs = vt = 0; if (e.pointerType !== 'touch' && el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (x) {} } });
      el.addEventListener('pointermove', function (e) { if (!down) return; vs = (e.clientX - lx) * 0.012; spin += vs; lx = e.clientX;
        if (e.pointerType !== 'touch') { vt = (e.clientY - ly) * 0.012; tilt += vt; } ly = e.clientY; api.dirty = true; kick(); });
      var up = function () { down = false; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', function () { tx = ty = 0; if (!el.hasPointerCapture) down = false; api.dirty = true; kick(); });
      api.frame = function (t) {
        rx += (ty - rx) * 0.08; ry += (tx - ry) * 0.08; if (!down) { spin += vs; tilt += vt; vs *= 0.95; vt *= 0.95; }
        if (!still) {
          if (anim === 'disco') { key.color.setHSL((t * 0.12) % 1, 0.9, 0.6); rim.color.setHSL((t * 0.12 + 0.5) % 1, 0.9, 0.55); key.position.set(Math.sin(t * 1.3) * 9, 4 + Math.cos(t * 0.9) * 4, 8); }
          else if (anim === 'aurora') { var s = 0.5 + 0.5 * Math.sin(t * 0.7); key.color.setRGB(0.18 + 0.42 * s, 0.84 - 0.6 * s, 0.63 + 0.3 * s); key.position.set(Math.sin(t * 0.5) * 8, 7, 7); rim.position.set(-9, Math.cos(t * 0.6) * 5, 5); }
          else if (anim === 'fire') key.intensity = 1.4 + Math.sin(t * 13) * 0.18 + Math.sin(t * 29) * 0.12;
        }
        if (fin === 'holo') { var hu = still ? 0.8 : t * 0.08; fins.holo[0].color.setHSL(hu % 1, 0.85, 0.6); fins.holo[1].color.setHSL((hu + 0.33) % 1, 0.85, 0.65); }
        amb.intensity = ambBase + flash; flash *= 0.86;
        piv.rotation.set(tilt + rx + (still ? 0 : Math.sin(t * 0.9) * 0.05), ry + spin + (still ? -0.35 : Math.sin(t * 0.6) * 0.3), 0); piv.position.y = 0.2 + (still ? 0 : Math.sin(t * 1.2) * 0.12); r.render(sc, cam);
        api.dirty = Math.abs(tx - ry) + Math.abs(ty - rx) + Math.abs(vs) + Math.abs(vt) + flash > 0.004; };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < 1.1 ? 12 : 10; cam.updateProjectionMatrix(); api.dirty = true; };
      return api;
    });
  });

  // 08 A carousel that turns in 3D, and folds flat into a gallery at the press of a button
  (function () {
    var el = stage('ring'); if (!el) return; var ring = el.querySelector('.ringin'), cards = [].slice.call(el.querySelectorAll('.rc')), mode = el.querySelector('.ringmode');
    var a = 0, down = false, lx = 0, auto = null, seen = false, flat = false;
    function size() { var w = ring.getBoundingClientRect().width || ring.offsetWidth; if (w) ring.style.setProperty('--r', (w * 0.5 / Math.tan(Math.PI / 6) + w * 0.12) / 16 + 'rem'); }
    function set(v, snap) { a = snap ? Math.round(v / 60) * 60 : v; ring.style.setProperty('--a', a + 'deg'); }
    function rest() { clearInterval(auto); auto = null; } function play() { if (!auto && seen && !still && !flat) auto = setInterval(function () { set(a - 60, true); }, 2600); }
    function fold(on) {
      rest(); flat = on;
      if (on) { // start from the same angle less a few full turns, so every card takes the shortest way to the front
        var n = ((a % 360) + 360) % 360; if (n > 180) n -= 360;
        ring.style.transition = 'none'; set(n); void ring.offsetWidth; ring.style.transition = '';
        cards.forEach(function (c, i) { c.style.setProperty('--fr', Math.round((a + i * 60) / 360) * 360 + 'deg'); });
      }
      el.classList.toggle('flat', on); mode.setAttribute('aria-pressed', String(on)); mode.textContent = on ? 'Back to the ring' : 'Fold into a gallery';
      if (!on) play();
    }
    size(); if (window.ResizeObserver) new ResizeObserver(size).observe(el);
    el.addEventListener('pointerdown', function (e) { if (flat || e.target.closest('.ringnav,.ringmode')) return; down = true; lx = e.clientX; rest(); el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - lx; lx = e.clientX; set(a + d * 0.45); });
    var up = function () { if (!down) return; down = false; el.classList.remove('drag'); set(a, true); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    [].forEach.call(el.querySelectorAll('.ringnav button'), function (b) { b.addEventListener('click', function () { rest(); set(a - 60 * +b.dataset.dir, true); }); });
    mode.addEventListener('click', function () { fold(!flat); });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { if (!flat) return; fold(false); set(-i * 60); }); });
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) play(); else rest(); }, { threshold: 0.4 }).observe(el);
  })();

  // 09 Magnetic buttons. With no mouse around (on phones, or when the mouse is away), a glowing "finger" visits each button by itself.
  demo('magnet', function (el) {
    var bs = [].slice.call(el.querySelectorAll('.mg')), ghost = document.createElement('i'), last = -1e9, gx = -1, gy = 0, k = -1, next = 0, api = { dirty: true };
    ghost.className = 'mgghost'; ghost.setAttribute('aria-hidden', 'true'); el.querySelector('.dmmag').appendChild(ghost);
    function pull(e) { var best = null, bd = 1e9, pos = bs.map(function (b) { var r = b.getBoundingClientRect(), cx = r.left + r.width / 2 - (parseFloat(b.dataset.x) || 0), cy = r.top + r.height / 2 - (parseFloat(b.dataset.y) || 0), dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) - r.width / 2; if (d < bd) { bd = d; best = b; } return [dx, dy, d]; });
      bs.forEach(function (b, i) { var on = b === best && pos[i][2] < 90, x = on ? pos[i][0] * 0.3 : 0, y = on ? pos[i][1] * 0.3 : 0; b.dataset.x = x; b.dataset.y = y; b.classList.toggle('near', on); b.style.setProperty('--mx', x.toFixed(1) + 'px'); b.style.setProperty('--my', y.toFixed(1) + 'px'); }); }
    function free() { bs.forEach(function (b) { b.dataset.x = b.dataset.y = 0; b.classList.remove('near'); b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); }); }
    var hand = function (e) { last = now(); el.classList.remove('auto'); pull(e); };
    el.addEventListener('pointermove', hand); el.addEventListener('pointerdown', hand);
    el.addEventListener('pointerleave', function () { last = now(); free(); }); el.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') free(); }); el.addEventListener('pointercancel', free);
    api.frame = function (t) {
      if (still || now() - last < 2200) return;
      var s = el.getBoundingClientRect(); if (!s.width) return; el.classList.add('auto');
      if (t > next) { next = t + 1.8; k = (k + 1) % bs.length; }
      var b = bs[k], r = b.getBoundingClientRect(), cx = r.left + r.width / 2 - (parseFloat(b.dataset.x) || 0) - s.left, cy = r.top + r.height / 2 - (parseFloat(b.dataset.y) || 0) - s.top;
      var tx = cx + Math.cos(t * 2.1) * (r.width / 2 + 26), ty = cy + Math.sin(t * 2.1) * (r.height / 2 + 22);
      if (gx < 0) { gx = s.width / 2; gy = s.height / 2; }
      gx += (tx - gx) * 0.08; gy += (ty - gy) * 0.08; ghost.style.transform = 'translate(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px)';
      pull({ clientX: s.left + gx, clientY: s.top + gy });
    };
    return api;
  });

  // 10 A button that celebrates: petals, confetti, fireworks, stars or hearts
  (function () {
    var el = stage('burst'); if (!el) return; var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), btn = el.querySelector('.dmburst .btn'), P = [], raf = 0, W = 0, H = 0, back = 0, fx = 'petals';
    var cols = ['#7b18c1', '#9a35e8', '#b06cff', '#d9b8ff', '#2a0d47'], warm = ['#7b18c1', '#b06cff', '#d9b8ff', '#f08a24', '#ffd27a', '#ff7ab8'], R = Math.random;
    function fit() { var r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
    function star(r) { cx.beginPath(); for (var k = 0; k < 10; k++) { var an = k * Math.PI / 5, q = k % 2 ? r * 0.45 : r; cx.lineTo(Math.sin(an) * q, -Math.cos(an) * q); } cx.closePath(); cx.fill(); }
    function heart(r) { cx.beginPath(); cx.moveTo(0, r * 0.35); cx.bezierCurveTo(-r * 1.1, -r * 0.4, -r * 0.45, -r * 1.05, 0, -r * 0.45); cx.bezierCurveTo(r * 0.45, -r * 1.05, r * 1.1, -r * 0.4, 0, r * 0.35); cx.fill(); }
    function boom(x, y, c) { for (var i = 0; i < 64; i++) { var an = i / 64 * 6.283, sp = 2 + R() * 4.5; P.push({ k: 's', x: x, y: y, px: x, py: y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, c: R() < 0.25 ? '#fff' : c, life: 0.9 + R() * 0.4 }); } }
    function tick() {
      raf = 0; cx.clearRect(0, 0, W, H); var add = [];
      P = P.filter(function (p) {
        cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, p.life * 2.5));
        if (p.k === 'w') { p.r += 7; p.life -= 0.04; cx.strokeStyle = '#b06cff'; cx.lineWidth = 3; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.stroke(); }
        else if (p.k === 'r') { if (p.wait > 0) { p.wait--; cx.restore(); return true; } p.vy += 0.16; p.x += p.vx; p.y += p.vy; cx.fillStyle = '#ffd27a'; cx.beginPath(); cx.arc(p.x, p.y, 3, 0, 6.283); cx.fill(); cx.globalAlpha = 0.4; cx.fillRect(p.x - 1, p.y, 2, 16); if (p.vy > -1) { add.push(p); p.life = 0; } }
        else if (p.k === 's') { p.px = p.x; p.py = p.y; p.vy += 0.05; p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx; p.y += p.vy; p.life -= 0.014; cx.strokeStyle = p.c; cx.lineWidth = 2.4; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(p.px - p.vx * 2, p.py - p.vy * 2); cx.lineTo(p.x, p.y); cx.stroke(); }
        else if (p.k === 'c') { p.vy += 0.04; p.vx *= 0.99; p.x += p.vx + Math.sin(p.life * 12 + p.ph) * 0.8; p.y += p.vy; p.a += p.va; p.life -= 0.006; cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(1, Math.cos(p.a * 2 + p.ph)); cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
        else if (p.k === 't') { p.vy += 0.06; p.vx *= 0.96; p.vy *= 0.96; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 0.012; cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(0.6 + 0.4 * Math.abs(Math.sin(p.life * 9)), 0.6 + 0.4 * Math.abs(Math.sin(p.life * 9))); cx.fillStyle = p.c; star(p.s); }
        else if (p.k === 'h') { p.vy -= 0.015; p.x += p.vx + Math.sin(p.life * 6 + p.ph) * 0.7; p.y += p.vy; p.life -= 0.008; cx.translate(p.x, p.y); cx.rotate(Math.sin(p.life * 4 + p.ph) * 0.3); cx.fillStyle = p.c; heart(p.s); }
        else { p.vy += 0.16; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 0.008; cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(1, Math.cos(p.a * 1.7)); cx.fillStyle = p.c; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(p.s, 0); cx.arc(0, 0, p.s, 0, Math.PI / 2); cx.closePath(); cx.fill(); }
        cx.restore(); return p.life > 0 && p.y < H + 60 && p.y > -H;
      });
      add.forEach(function (p) { boom(p.x, p.y, p.c); }); if (P.length) raf = requestAnimationFrame(tick);
    }
    function fire() {
      fit(); var b = btn.getBoundingClientRect(), s = el.getBoundingClientRect(), ox = b.left - s.left + b.width / 2, oy = b.top - s.top + b.height / 2, i, an, sp;
      btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
      btn.textContent = btn.dataset.b; clearTimeout(back); back = setTimeout(function () { btn.textContent = btn.dataset.a; }, 2200);
      if (still) return;
      P.push({ k: 'w', x: ox, y: oy, r: b.width * 0.3, life: 0.6 });
      if (fx === 'confetti') for (i = 0; i < 150; i++) P.push({ k: 'c', x: R() * W, y: -10 - R() * H * 0.5, vx: (R() - 0.5) * 2, vy: 1 + R() * 2.5, a: R() * 6.3, va: (R() - 0.5) * 0.2, w: 6 + R() * 5, h: 10 + R() * 8, ph: R() * 6.3, c: warm[i % warm.length], life: 1.3 });
      else if (fx === 'fireworks') for (i = 0; i < 5; i++) P.push({ k: 'r', x: W * (0.14 + i * 0.18 + (R() - 0.5) * 0.06), y: H + 6, vx: (R() - 0.5) * 1.2, vy: -Math.sqrt(2 * 0.16 * H * (0.55 + R() * 0.25)), wait: i * 9 + Math.floor(R() * 6), c: warm[i % warm.length], life: 1 });
      else if (fx === 'stars') for (i = 0; i < 40; i++) { an = R() * 6.283; sp = 3 + R() * 7; P.push({ k: 't', x: ox, y: oy, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 1.5, a: R() * 6.3, va: (R() - 0.5) * 0.3, s: 6 + R() * 8, c: ['#ffd27a', '#b06cff', '#7b18c1', '#f08a24'][i % 4], life: 1 }); }
      else if (fx === 'hearts') for (i = 0; i < 30; i++) P.push({ k: 'h', x: ox + (R() - 0.5) * b.width, y: oy - 10, vx: (R() - 0.5) * 1.6, vy: -(1.5 + R() * 3), s: 8 + R() * 10, ph: R() * 6.3, c: ['#7b18c1', '#b06cff', '#ff7ab8', '#e04fb0'][i % 4], life: 1.1 + R() * 0.5 });
      else for (i = 0; i < 90; i++) { an = -Math.PI / 2 + (R() - 0.5) * 2.6; sp = 3 + R() * 8; P.push({ x: ox, y: oy, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 2, a: R() * 6.3, va: (R() - 0.5) * 0.3, s: 7 + R() * 12, c: cols[i % cols.length], life: 0.8 + R() * 0.5 }); }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    btn.addEventListener('click', fire);
    [].forEach.call(el.querySelectorAll('.dmfx button'), function (b) { b.addEventListener('click', function () { press(b, 'fx'); fx = b.dataset.fx; fire(); }); });
  })();

  // 13 A globe you can spin: the real shapes of the land as dots, with Malaysia marked and routes flying out from it.
  // LAND is a 256 x 128 map of the world (1 = land), MYS the squares that are Malaysia; both made once from Natural Earth data (world-atlas).
  var LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2P8Ptv8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHB6/vz///8/AAAAAADIIwABHAAAAAAAAAAAAAAAAAAA8PcH/P///wMAAJ8DAAAAAAB4AAAAAAAAAAAAAAAAAAIL+PP/////BQAAnAAAAAAAAAAAAAAAAAAAAAAAAAAcBDjfAP////8EAAAAAAAAgAEAAG8AAAAAAAAAAAAAAPA/0n8AgP///wEAAAAAAAAHAID//wEAXgcAAAAAAAAAHwD1BAAA////AwAAAAAAwAEA4P9fAAAQAAAAAAAAAID3Hxc/BwD+//8AAAAAAABgAK78////D/gAAAABAAEAAPA/OPk/APD/nwEAAAAMAMAAf/v////f/88AgADw/x+/4z80GP0A9v9/AAAAgH8AABj//////////5s+A/z///8/MOQd9gD4/wcAAADw/4/x/+////////////8/8P///////z/wD/z/AAAAAPx/H///9f///////////zj+////////C/oE+A8APwAAfvzw////////////////AMD//////9988AP4BwAPAIB//vv//////////////38A+P//////fxCAAfADAAAA8J/////////////////v/wD8//////8fAB4AwAMAAAD4j///////////////f/QHAOAX4P///x8AfgIAAAAAAPAf8P////////////8/CAAAAAsA////PwB+BwAAAAA4MA/+////////////DwAGAACAAAD8////APwPAAAAADgAjv////////////8HgA8AACAAAPb///8H/h8AAAAAYMCD/////////////wGABwAAAAAA8v///x//PwAAAADOwPv/////////////K4ADAAAAAADw////P///AAAAAO75//////////////8vgAEAAAAAAOD//////38AAAAAwP3//////////////y+AAAAAAAAAwP//////gAEAAAAA/v//////////////LwAAAAAAAAAA//////+DAwAAAOD///////////////8vAAAAAAAAAAD//////wMBAAAAgP////f//////////ycAAAAAAAAAAP//////FwAAAACA//0f+cP/////////AwQAAAAAAAAA/////38CAAAAAIC/+Q/w8f////////8hAAAAAAAAAID/////PwAAAAAA/gPzD+Dj////////XzAAAAAAAAAAAP////8fAAAAAAD8Q8aP4+f///////8PAAAAAAAAAAAA/////wcAAAAAAPxAyPj/x///////nwcQAAAAAAAAAAD/////BwAAAAAA/gCI+P/H//////8PBhgAAAAAAAAAAP7///8DAAAAAAB8AITw/8///////38MDgAAAAAAAAAA/P///wMAAAAAAAD/AAD+////////HwwOAAAAAAAAAAD4////AQAAAAAA+H8AAP7///////8fYAEAAAAAAAAAAOD///8AAAAAAAD8/wAA/v///////z9wAAAAAAAAAAAAoP//PwAAAAAAAP7/xwP+////////PwAAAAAAAAAAAAAA//84AAAAAAAA/v////////////8/AAAAAAAAAAAAAAD/D2AAAAAAAAD///9///P//////38AAAAAAAAAAAAAgP4DYAAAAAAAgP/////+5///////PwAAAAAAAAAAAAAA/QdAAAAAAADA//////wf/v////8fAAAAAAAAAAAAAAD5BwABAAAAAOD/////+Y8A/////08AAAAAAAAAAAAAAPADAAAAAAAA4P/////x/wP+////JwAAAAAAAAAAAAAA4AeAAQAAAADw//////P/A/b//v8AAAAAAAAAAAAAAADgBwMGAAAAAPD/////8/8D8D/8TwAAAAAAAAAAAAAAAMCPA3AAAAAA8P/////n/wHwD/hnAAAAAAAAAAAAAAAAAP8BAAAAAADg/////89/APAH+A9AAAAAAAAAAAAAAAAA7AEAAAAAAPD/////zx8A8APoH0AAAAAAAAAAAAAAAADAHwAQAAAA8P////+fBwDgAcA/QAAAAAAAAAAAAAAAAAAeAAAAAADg/////78BAOABQD8AAAAAAAAAAAAAAAAAAAwAAAAAAPD/////fwAAwAFAPgAAAAAAAAAAAAAAAAAAGHwRAAAAwP////9/DwDAAUAMgAAAAAAAAAAAAAAAAACw/R8AAACA//////8PAMAAQACAAgAAAAAAAAAAAAAAAED/PwAAAID//////wcAAAJAAIADAAAAAAAAAAAAAAAAAP5/AAAAAP/7////BwAAAoABCAEAAAAAAAAAAAAAAAAA/v8HAAAATPD///8DAAAAsAMMAAAAAAAAAAAAAAAAAAD+/w8AAAAAgP///wEAAABgAwYAAAAAAAAAAAAAAAAAAP//DwAAAACA////AAAAAMCCDwAAAAAAAAAAAAAAAACA//8PAAAAAID//38AAAAA4OHvAQAAAAAAAAAAAAAAAIH//x8AAAAAwP//PwAAAACAw49EAAAAAAAAAAAAAAAAgP///wAAAACA//8fAAAAAADPJ0AGAQAAAAAAAAAAAACA////DwAAAAD//w8AAAAAAAZiwD8AAAAAAAAAAAAAAMD///8/AAAAAP//DwAAAAAABCAA/gAAAAAAAAAAAAAAgP///38AAAAA/v8PAAAAAAAYAID8QQAAAAAAAAAAAAAA////fwAAAAD+/w8AAAAAAMABIPyBAAAAAAAAAAAAAAD///9/AAAAAP7/DwAAAAAAAAAAMAMEAAAAAAAAAAAAAP7//z8AAAAA/P8fAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v//HwAAAAD8/x8AAAAAAAAAQCEAAAAAAAAAAAAAAAD8//8PAAAAAP7/HwgAAAAAAADgIQAAAAAAAAAAAAAAAPz//w8AAAAA/v8fDAAAAAAAAPZgAEAAAAAAAAAAAAAA8P//DwAAAAD//w8HAAAAAAAA/2MAAAAAAAAAAAAAAADg//8PAAAAAP//hwcAAAAAAID/9wAAQAAAAAAAAAAAAMD//w8AAAAA/v+DBwAAAAAAwP//AAAAAAAAAAAAAAAAwP//BwAAAAD+/4EHAAAAAADw//8DAAAAAAAAAAAAAADA//8HAAAAAPz/gQMAAAAAAPz//wMAAAAAAAAAAAAAAMD//wEAAAAA/P+BAwAAAAAA/v//BwAAAAAAAAAAAAAAwP8/AAAAAAD8/4EDAAAAAAD+//8PAAAAAAAAAAAAAADA/x8AAAAAAPh/AAAAAAAAAP7//x8AAAAAAAAAAAAAAMD/HwAAAAAA+H8AAAAAAAAA/v//HwAAAAAAAAAAAAAA4P8fAAAAAADwfwAAAAAAAAD8//8fAAAAAAAAAAAAAADg/w8AAAAAAPA/AAAAAAAAAPz//x8AAAAAAAAAAAAAAOD/BwAAAAAA4B8AAAAAAAAA/M//HwAAAAAAAAAAAAAA4P8HAAAAAADgDwAAAAAAAAD8gP8PAAAAAAAAAAAAAADgvwMAAAAAAEAAAAAAAAAAABwA/QcAAAAAAAAAAAAAAPB/AAAAAAAAAAAAAAAAAAAAAAD6BwAAAAAAAAAAAAAA8H8AAAAAAAAAAAAAAAAAAAAAAPgHABAAAAAAAAAAAADwPwAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAPAPAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAA+AMAAAAAAAAAAAAAAAAAAAAAAIABAAwAAAAAAAAAAAD4AwAAAAAAAAAAAAAAAAAAAAAAgAEABgAAAAAAAAAAAPgDAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAwAEAAAAAAAAAAAD4AQAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAPwBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAYAAAAAAAAAAADwAAAA/9+D8w8AAAAAAAAAAAAAAAAAAwAAAAAAAAAAwP//A////////wAAAAAAAAAAAAAAAPAPAAAAAAAAAIDx///B/////////wMAAAAAAAAAAAAAZA8AAAAADP7/+/////n/////////fwAAAAAAAAAADgBwHwAAAAD//////////v//////////AQAAAADAA4D/3/8fAAAA4P///////////////////x8AAAAA4P//5/z//wMAAAD4////////////////////BwAAAID///////85AAAA+P////////////////////8PAAAA////////bwwA4ID//////////////////////x8AAHDg//////+/owDwAfj/////////////////////AwAAAID///////8/EALA//////////////////////8DAAAA+P////////8Zfv7//////////////////////w8AAP///////////////////////////////////////wf/f/7//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==', MYS = [15303,15315,15559,15560,15561,15570,15571,15816,15817,15825,16073,16079,16080,16081];
  demo('globe', function (el, kick) {
    return three().then(function (T) {
      var cv = el.querySelector('canvas'), r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(36, 1.6, 0.1, 50); cam.position.set(0, 0, 7.2);
      var tiltG = new T.Group(), g = new T.Group(); tiltG.rotation.set(0.32, 0, 0.18); tiltG.add(g); sc.add(tiltG);
      var bits = atob(LAND), MW = 256, MH = 128, my = {}, D = Math.PI / 180, R0 = 2; MYS.forEach(function (i) { my[i] = 1; });
      function cell(lat, lon) { return Math.min(MH - 1, Math.floor((90 - lat) / 180 * MH)) * MW + Math.min(MW - 1, Math.floor((lon + 180) / 360 * MW)); }
      function at(lat, lon, rad) { var c = Math.cos(lat * D); return new T.Vector3(c * Math.sin(lon * D) * rad, Math.sin(lat * D) * rad, c * Math.cos(lon * D) * rad); }
      var land = [], sea = [], mys = [], landPts = [], row = 0;
      for (var lat = -82; lat <= 82; lat += 1.55, row++) { var n = Math.max(1, Math.round(232 * Math.cos(lat * D))); for (var k = 0; k < n; k++) { var lon = -180 + (k + 0.5) * 360 / n, c = cell(lat, lon), v = at(lat, lon, R0);
        if (my[c]) mys.push(v.x, v.y, v.z); else if (bits.charCodeAt(c >> 3) & (1 << (c & 7))) { land.push(v.x, v.y, v.z); landPts.push([lat, lon]); } else if (row % 2 === 0 && k % 3 === 0) sea.push(v.x, v.y, v.z); } }
      function dots(a, col, size, op) { var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(a, 3)); g.add(new T.Points(geo, new T.PointsMaterial({ color: col, size: size, transparent: true, opacity: op }))); }
      g.add(new T.Mesh(new T.SphereGeometry(1.97, 48, 32), new T.MeshBasicMaterial({ color: 0xf6efff })));
      dots(sea, 0xc9a8f0, 0.022, 0.55); dots(land, 0x7b18c1, 0.042, 0.95); dots(mys, 0xf08a24, 0.07, 1);
      // a soft glow around the edge
      var gc = document.createElement('canvas'); gc.width = gc.height = 128; var gg = gc.getContext('2d'), rg = gg.createRadialGradient(64, 64, 40, 64, 64, 64); rg.addColorStop(0, 'rgba(176,108,255,.45)'); rg.addColorStop(1, 'rgba(176,108,255,0)'); gg.fillStyle = rg; gg.fillRect(0, 0, 128, 128);
      var glow = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(gc), depthWrite: false })); glow.scale.set(6.4, 6.4, 1); glow.renderOrder = -1; sc.add(glow);
      // the Malaysia pin, a pulse ring, and routes that fly out from it
      var home = at(3.14, 101.69, R0), up = new T.Vector3(0, 1, 0), pin = new T.Group(); pin.position.copy(home); pin.quaternion.setFromUnitVectors(up, home.clone().normalize()); g.add(pin);
      var orange = new T.MeshBasicMaterial({ color: 0xf08a24 }), plum = new T.MeshBasicMaterial({ color: 0x2a0d47 });
      var stem = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.36, 8), plum); stem.position.y = 0.18; pin.add(stem);
      var head = new T.Mesh(new T.SphereGeometry(0.07, 16, 12), orange); head.position.y = 0.38; pin.add(head);
      var pulse = new T.Mesh(new T.RingGeometry(0.06, 0.09, 40), new T.MeshBasicMaterial({ color: 0xf08a24, transparent: true, side: T.DoubleSide, depthWrite: false })); pulse.rotation.x = -Math.PI / 2; pulse.position.y = 0.01; pin.add(pulse);
      var arcs = [], NS = 60, pick = [0.12, 0.3, 0.47, 0.63, 0.8, 0.93];
      pick.forEach(function (f, j) { var q = landPts[Math.floor(landPts.length * f)], end = at(q[0], q[1], R0), mid = home.clone().add(end).multiplyScalar(0.5), len = home.distanceTo(end); mid.normalize().multiplyScalar(R0 + 0.25 + len * 0.28);
        var curve = new T.QuadraticBezierCurve3(home.clone(), mid, end), pts = curve.getPoints(NS), geo = new T.BufferGeometry().setFromPoints(pts);
        var line = new T.Line(geo, new T.LineBasicMaterial({ color: 0xb06cff, transparent: true, opacity: 0.9 })); g.add(line);
        var dot = new T.Mesh(new T.SphereGeometry(0.035, 10, 8), orange); g.add(dot); arcs.push({ geo: geo, pts: pts, dot: dot, off: j * 0.37 }); });
      var rings = [2.55, 2.9].map(function (Rr, j) { var ring = new T.Mesh(new T.TorusGeometry(Rr, 0.01, 8, 120), new T.MeshBasicMaterial({ color: j ? 0xb06cff : 0x7b18c1, transparent: true, opacity: 0.35 })); ring.rotation.x = 1.25 + j * 0.45; ring.rotation.y = j * 0.7; sc.add(ring); return ring; });
      var label = el.querySelector('.gpin'), wp = new T.Vector3(), cp = new T.Vector3();
      g.rotation.y = -101.69 * D - 0.7;
      var vy = 0.0035, vx = 0, down = false, lx = 0, ly = 0, api = { dirty: true };
      el.addEventListener('pointerdown', function (e) { down = true; lx = e.clientX; ly = e.clientY; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (e) { if (!down) return; vy = (e.clientX - lx) * 0.006; vx = (e.clientY - ly) * 0.004; lx = e.clientX; ly = e.clientY; api.dirty = true; kick(); });
      var up2 = function () { down = false; el.classList.remove('drag'); }; el.addEventListener('pointerup', up2); el.addEventListener('pointercancel', up2);
      api.frame = function (t) {
        g.rotation.y += vy; tiltG.rotation.x = Math.max(-0.5, Math.min(1, tiltG.rotation.x + vx)); vx *= 0.9; if (!down) vy += (0.0035 - vy) * 0.03;
        var ph = (t * 0.7) % 1; pulse.scale.setScalar(1 + ph * 3.5); pulse.material.opacity = still ? 0.6 : 1 - ph; head.scale.setScalar(1 + 0.25 * Math.sin(t * 3));
        arcs.forEach(function (a) { var p = still ? 1 : ((t * 0.32 + a.off) % 1.5), hd = Math.min(1, p), tl = Math.max(0, p - 0.55), i0 = Math.floor(tl * NS), i1 = Math.ceil(hd * NS);
          a.geo.setDrawRange(i0, Math.max(0, i1 - i0 + 1)); a.dot.position.copy(a.pts[Math.min(NS, i1)]); a.dot.visible = p < 1.02; });
        rings[0].rotation.z = t * 0.2; rings[1].rotation.z = -t * 0.15;
        r.render(sc, cam);
        if (label) { head.getWorldPosition(wp); cp.copy(wp).normalize(); var face = cp.dot(cam.position.clone().sub(wp).normalize()); wp.project(cam);
          label.style.left = ((wp.x * 0.5 + 0.5) * 100).toFixed(2) + '%'; label.style.top = ((0.5 - wp.y * 0.5) * 100).toFixed(2) + '%'; label.style.opacity = face > 0.15 ? '1' : '0'; }
        api.dirty = Math.abs(vy) > 0.0005 && still;
      };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < 1.3 ? 9 : 7.2; cam.updateProjectionMatrix(); api.dirty = true; };
      return api;
    });
  });

  // 14 A headline that decodes
  (function () {
    var el = stage('scramble'); if (!el) return; var out = el.querySelector('strong'), btn = el.querySelector('button'), lines = out.dataset.lines.split('|'), n = 0, raf = 0, tmr = 0, seen = false;
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>';
    function show(text) {
      cancelAnimationFrame(raf); if (still) { out.textContent = text; return; }
      var f = 0, total = text.length * 3 + 14;
      (function step() {
        var done = Math.floor((f - 10) / 3), h = '';
        for (var i = 0; i < text.length; i++) h += i < done || text[i] === ' ' ? text[i] : '<i>' + chars[Math.floor(Math.random() * chars.length)] + '</i>';
        out.innerHTML = h; f++; if (f <= total) raf = requestAnimationFrame(step); else out.textContent = text;
      })();
    }
    function next() { n = (n + 1) % lines.length; show(lines[n]); clearInterval(tmr); if (seen && !still) tmr = setInterval(next, 4200); }
    btn.addEventListener('click', next);
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; clearInterval(tmr); if (seen) { show(lines[n]); if (!still) tmr = setInterval(next, 4200); } }, { threshold: 0.4 }).observe(el);
  })();

  // The cube in the banner: it follows the pointer, and a tap pops it open and changes its colour
  (function () {
    var art = document.querySelector('.hart[data-art="demos"]'), cube = art && art.querySelector('.hcube'); if (!cube || still) return;
    var cols = [['#b06cff', '#7b18c1'], ['#e58cff', '#9a35e8'], ['#8f7bff', '#3d0a66'], ['#d9b8ff', '#6a12ad']], c = 0, rx = -24, ry = 0, tx = -24, vy = 0.5, on = false, raf = 0, back = 0;
    cube.classList.add('js');
    function boom(turn) { cube.classList.add('boom'); if (turn) { c = (c + 1) % cols.length; cube.style.setProperty('--c1', cols[c][0]); cube.style.setProperty('--c2', cols[c][1]); vy = 9; } clearTimeout(back); back = setTimeout(function () { cube.classList.remove('boom'); }, 900); }
    function frame() { raf = 0; if (!on) return; rx += (tx - rx) * 0.08; vy += ((vy < 0 ? -0.5 : 0.5) - vy) * 0.03; ry += vy; cube.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; raf = requestAnimationFrame(frame); }
    art.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = art.getBoundingClientRect(); tx = -24 - ((e.clientY - r.top) / r.height - 0.5) * 60; vy = ((e.clientX - r.left) / r.width - 0.5) * 5; });
    art.addEventListener('pointerleave', function () { tx = -24; });
    art.addEventListener('click', function () { boom(true); });
    setInterval(function () { if (on && !document.hidden) boom(false); }, 6500);
    new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(frame); }).observe(art);
  })();
})();
