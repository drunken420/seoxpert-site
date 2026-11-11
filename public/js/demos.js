// Demos page. Each demo starts only when it scrolls near the screen and rests when it leaves.
// The 3D demos share one copy of three.js, loaded on demand from /vendor/.
// Demos that move by themselves stop as soon as a visitor takes over, and stay still for people who ask for less motion.
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches, kicks = [];
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
    var api = null, started = false, visible = false, raf = 0; kicks.push(function () { if (api) api.dirty = true; kick(); });
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
      // round labels: one canvas that wraps once around the product, re-drawn to the label's own shape so the logo is never squashed
      var tc = document.createElement('canvas'), tx = new T.CanvasTexture(tc); tx.anisotropy = 4; tx.generateMipmaps = false; tx.minFilter = T.LinearFilter;
      var wrap = { cup: 5.1, bottle: 3.92, can: 2.37, jar: 9.4 }, curK = 'cup';
      var bc = document.createElement('canvas'); bc.width = 512; bc.height = 704; var bx = new T.CanvasTexture(bc); bx.anisotropy = 4;
      var d1 = new Path2D(el.dataset.d1), d2 = new Path2D(el.dataset.d2), bandCol = '#7b18c1', font = '"Sora Variable", Sora, system-ui, sans-serif';
      var side = new T.MeshStandardMaterial({ color: 0x7b18c1, roughness: 0.6 });
      function paint() {
        var BW = 2048, BH = Math.round(BW / (wrap[curK] || 5.1)), hw = BW / 2;
        if (tc.width !== BW || tc.height !== BH) { tc.width = BW; tc.height = BH; tx.dispose(); }
        var g = tc.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = bandCol; g.fillRect(0, 0, BW, BH); g.fillStyle = '#fff'; g.textBaseline = 'middle';
        function logo(x, y, m) { g.save(); g.translate(x, y); g.scale(m / 846, m / 846); g.fill(d1); g.globalAlpha = 0.8; g.fill(d2); g.restore(); }
        for (var i = 0; i < 2; i++) { // the front and the back of the label
          var mid = hw * (0.5 + i), fs, m, tw, k;
          if (BH / hw > 0.6) { // tall label (the can): the mark above the name
            m = BH * 0.36; fs = Math.min(BH * 0.15, hw * 0.13); g.font = '700 ' + fs + 'px ' + font;
            var top = (BH - (m + fs * 0.45 + fs + fs * 0.85)) / 2; logo(mid - m / 2, top, m);
            g.textAlign = 'center'; g.fillText('SEOxpert', mid, top + m + fs * 0.45 + fs / 2);
            g.globalAlpha = 0.75; g.font = '600 ' + (fs * 0.4) + 'px ' + font; g.fillText('XpertForge', mid, top + m + fs * 1.75); g.globalAlpha = 1;
          } else { // wide label: the mark beside the name, shrunk to fit if needed
            fs = BH * 0.4; m = BH * 0.5; g.font = '700 ' + fs + 'px ' + font; tw = g.measureText('SEOxpert').width;
            k = Math.min(1, hw * 0.8 / (m + fs * 0.32 + tw)); fs *= k; m *= k; tw *= k; g.font = '700 ' + fs + 'px ' + font;
            var x0 = mid - (m + fs * 0.32 + tw) / 2; logo(x0, (BH - m) / 2, m); g.textAlign = 'left'; g.fillText('SEOxpert', x0 + m + fs * 0.32, BH / 2 + fs * 0.04);
          }
        }
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
      [].forEach.call(el.querySelectorAll('.dmprod button'), function (b) { b.addEventListener('click', function () { press(b, 'p'); cur.visible = false; cur = P[b.dataset.p] || cup; if (wrap[b.dataset.p]) { curK = b.dataset.p; paint(); } cur.visible = true; pop = still ? 1 : 0; if (!still) vy = 0.22; api.dirty = true; kick(); }); });
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

  // 02 A living background: a field of dots that rolls like water. Taps send ripples across it, the colour follows
  // the height of each wave, and it wanders and ripples by itself until a visitor takes over.
  demo('wave', function (el, kick) {
    return three().then(function (T) {
      var cv = el.querySelector('canvas'), NX = 90, NZ = 44, n = NX * NZ;
      var r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(42, 1.6, 0.1, 100); cam.position.set(0, 3.1, 8.6); cam.lookAt(1.5, 0, 0);
      var pos = new Float32Array(n * 3), col = new Float32Array(n * 3), i = 0;
      for (var z = 0; z < NZ; z++) for (var x = 0; x < NX; x++) { pos[i++] = (x / (NX - 1) - 0.5) * 26; pos[i++] = 0; pos[i++] = (z / (NZ - 1) - 0.5) * 14; }
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
      var pts = new T.Points(g, new T.PointsMaterial({ size: 0.08, transparent: true, opacity: 0.95, vertexColors: true })); sc.add(pts);
      // each colour: the low dots, then the high dots
      var pal = { purple: ['#a463ee', '#ffffff'], sunset: ['#c2185b', '#ffd27a'], ocean: ['#1f5fff', '#8ff6ff'], mint: ['#0f8f6f', '#d6ffe9'] }, lo = new T.Color(), hi = new T.Color();
      function setPal(k) { var p = pal[k] || pal.purple; lo.set(p[0]); hi.set(p[1]); }
      setPal('purple');
      var mx = 0.7, mz = 0.4, tx = 0.7, tz = 0.4, last = -1e9, rip = [], nextRip = 0, api = { dirty: true };
      pointer(el, function (x, y) { tx = x; tz = y; last = now(); api.dirty = true; kick(); });
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var b = el.getBoundingClientRect(); ripple((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height); });
      function ripple(x, y) { rip.push({ x: (x - 0.5) * 26, z: (y - 0.5) * 14, t0: -1 }); if (rip.length > 4) rip.shift(); api.dirty = true; kick(); }
      [].forEach.call(el.querySelectorAll('.dmsw button'), function (b) { b.addEventListener('click', function () { press(b, 'c'); setPal(b.dataset.c); api.dirty = true; kick(); }); });
      api.frame = function (t) {
        var idle = now() - last > 3000;
        if (idle && !still) { tx = 0.5 + Math.sin(t * 0.37) * 0.32; tz = 0.45 + Math.cos(t * 0.29) * 0.28; if (!nextRip) nextRip = t + 2; else if (t > nextRip) { nextRip = t + 3.6; ripple(0.25 + Math.random() * 0.5, 0.25 + Math.random() * 0.5); } }
        mx += (tx - mx) * 0.08; mz += (tz - mz) * 0.08;
        var px = (mx - 0.5) * 26, pz = (mz - 0.5) * 14, tt = still ? 2 : t;
        rip.forEach(function (q) { if (q.t0 < 0) q.t0 = tt; }); rip = rip.filter(function (q) { return tt - q.t0 < 5; });
        for (var k = 0; k < n; k++) { var X = pos[k * 3], Z = pos[k * 3 + 2], d = Math.hypot(X - px, Z - pz), h = Math.sin(X * 0.55 + tt * 0.9) * 0.34 + Math.cos(Z * 0.7 + tt * 0.7) * 0.3 + Math.exp(-d * d * 0.09) * 1.5 * Math.cos(d * 1.4 - tt * 2.4);
          for (var j = 0; j < rip.length; j++) { var q = rip[j], age = tt - q.t0, dd = Math.hypot(X - q.x, Z - q.z) - age * 6; h += Math.exp(-dd * dd * 0.35) * Math.cos(dd * 2.2) * 1.1 * Math.exp(-age * 0.7); }
          pos[k * 3 + 1] = h; var m = Math.max(0, Math.min(1, (h + 0.7) / 2.1)); col[k * 3] = lo.r + (hi.r - lo.r) * m; col[k * 3 + 1] = lo.g + (hi.g - lo.g) * m; col[k * 3 + 2] = lo.b + (hi.b - lo.b) * m; }
        g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = true; r.render(sc, cam); api.dirty = Math.abs(tx - mx) + Math.abs(tz - mz) > 0.002 || rip.length > 0;
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
    var chT = 0, chSeen = false, chLoop = function () { clearInterval(chT); if (chSeen) chT = setInterval(function () { if (!still) go(); }, 6500); };
    new IntersectionObserver(function (es) { chSeen = es[0].isIntersecting; if (chSeen) ch.classList.add('go'); chLoop(); }, { threshold: 0.45 }).observe(ch);
    ch.querySelector('.dmreplay').addEventListener('click', function () { go(); chLoop(); });
  }

  // Light and dark switch: it flips by itself every few seconds; a tap takes over for a while
  [].forEach.call(document.querySelectorAll('.dmtheme'), function (t) {
    var b = t.querySelector('.tsw'), hold = 0, tm = 0;
    function set(on) { t.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Light mode' : 'Dark mode'); }
    b.addEventListener('click', function () { hold = Date.now() + 12000; set(!t.classList.contains('on')); });
    new IntersectionObserver(function (es) { clearInterval(tm); if (es[0].isIntersecting) tm = setInterval(function () { if (!still && Date.now() > hold && !document.hidden) set(!t.classList.contains('on')); }, 3200); }, { threshold: 0.4 }).observe(t);
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

  // 03 Weather on your website: rain, snow, petals, bubbles, fireflies or a storm on a flat canvas over a small website,
  // or over the whole page. Snow piles up on buttons and cards, rain splashes off them, petals rest on them and bubbles pop against them.
  // It changes by itself until a visitor picks one. A small chip turns whole-page weather off from anywhere.
  (function () {
    var el = stage('weather'); if (!el) return;
    var ctl = el.parentNode.querySelector('.dmctl'), cv = document.createElement('canvas'), cx = cv.getContext('2d');
    var kind = 'clear', page = false, near = false, mine = false, W = 0, H = 0, P = [], S = [], drops = [], raf = 0, flash = 0, dim = 0, nextBolt = 0, bolt = null, nextAuto = 0, ai = 0, lastT = 0;
    var piles = new Map(), dirtyRects = true, rectAt = 0, glow = null;
    var PC = ['#7b18c1', '#9a35e8', '#b06cff', '#d9b8ff'], cycle = ['snow', 'petals', 'rain', 'bubbles', 'fireflies', 'storm'], pops = [];
    var names = { rain: 'Rain', snow: 'Snow', petals: 'Petals', bubbles: 'Bubbles', fireflies: 'Fireflies', storm: 'Storm' };
    cv.className = 'wx'; cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv);
    var chip = document.createElement('div'); chip.className = 'wxchip'; chip.hidden = true; chip.innerHTML = '<span></span><button type="button">Turn off</button>'; document.body.appendChild(chip);
    function dark() { return !page && /snow|fireflies|storm/.test(kind); }
    function run() { return !still && !document.hidden && (page || near) && (kind !== 'clear' || piles.size > 0 || !mine); }
    function fit() { var d = Math.min(devicePixelRatio || 1, page ? 1.25 : 2), w = page ? innerWidth : el.clientWidth, h = page ? innerHeight : el.clientHeight; if (w === W && h === H) return; W = w; H = h; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); dirtyRects = true; }
    // the tops of buttons and cards that weather can land on, in canvas pixels
    function surfaces(t) {
      if (!dirtyRects && t - rectAt < 0.3) return; dirtyRects = false; rectAt = t;
      var o = page ? { left: 0, top: 0 } : el.getBoundingClientRect(), list = page ? document.querySelectorAll('main .btn, main .dmstage, .wxland, .dmgood li, .dmctl > div') : el.querySelectorAll('.wxland');
      S = [];
      [].forEach.call(list, function (n) { var r = n.getBoundingClientRect(), L = r.left - o.left, T = r.top - o.top; if (r.width < 24 || T < 4 || T > H + 40 || L > W || L + r.width < 0) return;
        var pile = piles.get(n), bins = Math.max(2, Math.round(r.width / 5)); if (pile && pile.length !== bins) pile = null;
        S.push({ n: n, L: L, R: L + r.width, T: T, B: T + r.height, pile: pile }); });
    }
    function pileH(s, x) { if (!s.pile) return 0; var i = Math.floor((x - s.L) / (s.R - s.L) * s.pile.length); return s.pile[Math.max(0, Math.min(s.pile.length - 1, i))] || 0; }
    function hit(p, py) { for (var k = 0; k < S.length; k++) { var s = S[k]; if (s.n === p.skip || p.x < s.L + 2 || p.x > s.R - 2) continue; var top = s.T - pileH(s, p.x); if (py < top && p.y >= top) return s; } return null; }
    function settle(s, x, a) {
      if (!s.pile) { s.pile = new Float32Array(Math.max(2, Math.round((s.R - s.L) / 5))); piles.set(s.n, s.pile); }
      var b = s.pile, n = b.length, i = Math.floor((x - s.L) / (s.R - s.L) * n), cap = page ? 8 : 12;
      for (var k = -2; k <= 2; k++) { var j = i + k; if (j < 0 || j >= n) continue; var edge = Math.min(j + 0.5, n - j - 0.5) * 1.6; b[j] = Math.min(cap, edge, b[j] + a * [0.2, 0.5, 1, 0.5, 0.2][k + 2]); }
    }
    function spawn(p, top) {
      p.x = Math.random() * (W + 160) - 40; p.y = top ? -30 - Math.random() * 60 : Math.random() * H; p.rest = 0; p.skip = null;
      if (kind === 'snow') { p.r = 1.4 + Math.random() * 3; p.vy = 0.5 + Math.random() * 1.1; p.ph = Math.random() * 6.3; }
      else if (kind === 'petals') { p.r = 6 + Math.random() * 8; p.vy = 0.7 + Math.random() * 1.1; p.ph = Math.random() * 6.3; p.a = Math.random() * 6.3; p.c = PC[Math.floor(Math.random() * 4)]; }
      else if (kind === 'bubbles') { p.r = 5 + Math.random() * 13; p.y = top ? H + 20 + Math.random() * 60 : Math.random() * H; p.vy = -(0.55 + Math.random() * 0.9) * (1.2 - p.r / 40); p.ph = Math.random() * 6.3; }
      else if (kind === 'fireflies') { p.x = Math.random() * W; p.y = H * (0.15 + Math.random() * 0.8); p.ph = Math.random() * 6.3; p.sp = 0.6 + Math.random() * 1.2; p.vx = 0; p.vy = 0; }
      else { p.l = 10 + Math.random() * 16; p.vy = (kind === 'storm' ? 14 : 9) + Math.random() * 5; }
      return p;
    }
    function count() { var a = W * H, k = { rain: [240, 1900], storm: [340, 1300], snow: [170, 3400], petals: [60, 9500], bubbles: [52, 9000], fireflies: [42, 9000] }[kind]; return k ? Math.round(Math.min(k[0], a / k[1])) : 0; }
    function strike() { var x = W * (0.2 + Math.random() * 0.6), y = 0, pts = [[x, 0]]; while (y < H * 0.7) { y += 16 + Math.random() * 30; x += (Math.random() - 0.5) * 60; pts.push([x, y]); } bolt = pts; flash = 1; setTimeout(function () { flash = 0.75; }, 150); }
    function splash(x, y) { for (var k = 0; k < 3; k++) drops.push({ x: x, y: y, vx: (Math.random() - 0.5) * 3.4, vy: -1.4 - Math.random() * 2, life: 1 }); if (drops.length > 160) drops.splice(0, drops.length - 160); }
    function leaf(p, flat) { // a petal is a quarter circle that tumbles as it falls
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(1, flat ? 0.4 : Math.cos(p.a * 1.6 + p.ph)); cx.globalAlpha = p.fade == null ? 0.88 : p.fade; cx.fillStyle = p.c; cx.beginPath();
      cx.moveTo(0, 0); cx.lineTo(p.r, 0); cx.arc(0, 0, p.r, 0, Math.PI / 2); cx.closePath(); cx.fill(); cx.restore();
    }
    // a bubble rises from below; touching the underside of a button or card pops it
    function hitUnder(p, py) { for (var k = 0; k < S.length; k++) { var s = S[k]; if (p.x < s.L + 2 || p.x > s.R - 2) continue; var b = s.B + p.r; if (py > b && p.y <= b) return s; } return null; }
    function bubble(p, wob) { var dk = dark(), g = cx.createRadialGradient(p.x - p.r * 0.35, p.y - p.r * 0.4, p.r * 0.1, p.x, p.y, p.r);
      g.addColorStop(0, dk ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.75)'); g.addColorStop(0.7, dk ? 'rgba(176,108,255,.08)' : 'rgba(176,108,255,.10)'); g.addColorStop(1, dk ? 'rgba(217,184,255,.35)' : 'rgba(123,24,193,.28)');
      cx.save(); cx.translate(p.x, p.y); cx.scale(1 + wob, 1 - wob); cx.translate(-p.x, -p.y); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      cx.strokeStyle = dk ? 'rgba(233,216,255,.55)' : 'rgba(123,24,193,.4)'; cx.lineWidth = 1.1; cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.lineWidth = Math.max(1.2, p.r * 0.14); cx.lineCap = 'round'; cx.beginPath(); cx.arc(p.x, p.y, p.r * 0.68, 3.6, 4.3); cx.stroke(); cx.restore(); }
    function frame(ts) {
      raf = 0; if (!run()) { cx.clearRect(0, 0, W, H); return; }
      fit(); var t = ts / 1000, n = count(), wind = kind === 'storm' ? -3.4 : kind === 'rain' ? -1.4 : Math.sin(t * 0.3) * 0.6;
      if (!mine && !page) { if (!nextAuto) nextAuto = t + (kind === 'clear' ? 0.6 : 7); else if (t > nextAuto) { nextAuto = t + 7; set(cycle[ai++ % cycle.length], true); n = count(); } }
      surfaces(t); lastT = t;
      while (P.length < n) P.push(spawn({}, false)); P.length = n; cx.clearRect(0, 0, W, H);
      dim += ((page && kind === 'storm' ? 0.42 : 0) - dim) * 0.04; if (dim > 0.005) { cx.fillStyle = 'rgba(16,8,28,' + dim.toFixed(3) + ')'; cx.fillRect(0, 0, W, H); } // a whole-page storm darkens the sky first
      if (kind === 'rain' || kind === 'storm') {
        cx.strokeStyle = dark() || kind === 'storm' ? 'rgba(233,216,255,.72)' : 'rgba(123,24,193,.42)'; cx.lineWidth = kind === 'storm' ? 1.5 : 1.3; cx.beginPath();
        P.forEach(function (p) { var py = p.y; p.y += p.vy; p.x += wind; var s = hit(p, py); if (s) { splash(p.x, s.T); spawn(p, true); } else if (p.y > H + 20 || p.x < -60) spawn(p, true); cx.moveTo(p.x, p.y); cx.lineTo(p.x - wind * p.l / p.vy, p.y - p.l); }); cx.stroke();
      } else if (kind === 'snow') {
        cx.fillStyle = 'rgba(255,255,255,.95)'; cx.beginPath();
        P.forEach(function (p) { var py = p.y; p.y += p.vy; p.x += wind + Math.sin(t * 1.2 + p.ph) * 0.6; var s = hit(p, py); if (s) { settle(s, p.x, p.r * 0.5); spawn(p, true); } else if (p.y > H + 10) spawn(p, true); cx.moveTo(p.x + p.r, p.y); cx.arc(p.x, p.y, p.r, 0, 6.283); }); cx.fill(); if (!dark()) { cx.strokeStyle = 'rgba(123,24,193,.4)'; cx.lineWidth = 1; cx.stroke(); }
      } else if (kind === 'bubbles') {
        P.forEach(function (p) { var py = p.y; p.y += p.vy; p.x += Math.sin(t * 1.4 + p.ph) * 0.5 + wind * 0.3; var s = hitUnder(p, py);
          if (s || p.y < -30) { if (s) pops.push({ x: p.x, y: s.B, r: p.r, life: 1 }); spawn(p, true); }
          bubble(p, Math.sin(t * 3 + p.ph) * 0.04); });
      } else if (kind === 'petals') {
        P.forEach(function (p) {
          if (p.rest > 0) { p.rest--; if (p.rest < 40) p.fade = p.rest / 40 * 0.88; if (!p.rest) { p.fade = null; p.skip = p.on; p.vy = 0.6; } leaf(p, true); return; }
          var py = p.y; p.y += p.vy; p.x += wind + Math.sin(t * 1.3 + p.ph) * 0.9; p.a += 0.025;
          var s = hit(p, py); if (s) { p.y = s.T - 2; p.on = s.n; p.rest = 120 + Math.floor(Math.random() * 120); p.a = (Math.random() - 0.5) * 0.6; }
          else if (p.y > H + 20) spawn(p, true);
          leaf(p, false);
        });
      } else if (kind === 'fireflies') {
        // at night they glow green; over a white page they are warm golden lights instead, so the page stays bright
        function sprite(c) { var cvs = document.createElement('canvas'); cvs.width = cvs.height = 64; var g = cvs.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); c.forEach(function (st) { gr.addColorStop(st[0], st[1]); }); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return cvs; }
        if (!glow) glow = { night: sprite([[0, 'rgba(250,255,190,1)'], [0.18, 'rgba(226,255,120,.9)'], [0.5, 'rgba(176,255,90,.22)'], [1, 'rgba(176,255,90,0)']]), day: sprite([[0, 'rgba(255,214,90,1)'], [0.14, 'rgba(255,170,20,.95)'], [0.42, 'rgba(255,160,40,.3)'], [1, 'rgba(255,160,40,0)']]) };
        var spr = dark() ? glow.night : glow.day;
        cx.save(); cx.globalCompositeOperation = dark() ? 'lighter' : 'source-over';
        P.forEach(function (p) { p.vx += Math.sin(t * 0.7 * p.sp + p.ph) * 0.03 + (Math.random() - 0.5) * 0.04; p.vy += Math.cos(t * 0.6 * p.sp + p.ph * 1.7) * 0.03 + (Math.random() - 0.5) * 0.04; p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx; p.y += p.vy;
          if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < H * 0.05) p.vy += 0.05; if (p.y > H) p.vy -= 0.05;
          var b = Math.max(0, Math.sin(t * p.sp * 1.6 + p.ph)), a = 0.15 + 0.85 * b * b, sz = 18 + 16 * b; cx.globalAlpha = a; cx.drawImage(spr, p.x - sz / 2, p.y - sz / 2, sz, sz); });
        cx.restore();
      }
      // popped bubbles: a quick ring and a few specks
      if (pops.length) { cx.strokeStyle = dark() ? 'rgba(233,216,255,.8)' : 'rgba(123,24,193,.5)'; pops = pops.filter(function (q) { q.life -= 0.07; if (q.life <= 0) return false; var rr = q.r * (1.6 - q.life * 0.6);
        cx.globalAlpha = q.life; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(q.x, q.y + q.r * 0.3, rr, 0, 6.283); cx.stroke();
        for (var k = 0; k < 6; k++) { var an = k * 1.047 + q.r; cx.beginPath(); cx.arc(q.x + Math.cos(an) * rr * 1.35, q.y + q.r * 0.3 + Math.sin(an) * rr * 1.35, 1.3, 0, 6.283); cx.stroke(); } return true; }); cx.globalAlpha = 1; }
      // splashes, then the snow piles (they melt away once the snow stops)
      if (drops.length) { cx.fillStyle = dark() || kind === 'storm' ? 'rgba(217,184,255,.75)' : 'rgba(123,24,193,.4)'; cx.beginPath(); drops = drops.filter(function (d) { d.vy += 0.22; d.x += d.vx; d.y += d.vy; d.life -= 0.045; if (d.life <= 0) return false; cx.moveTo(d.x + 1.4, d.y); cx.arc(d.x, d.y, 1.4, 0, 6.283); return true; }); cx.fill(); }
      var gone = [];
      S.forEach(function (s) { var b = s.pile; if (!b) return; var any = false, i, bw = (s.R - s.L) / b.length;
        if (kind !== 'snow') for (i = 0; i < b.length; i++) b[i] = Math.max(0, b[i] * 0.985 - 0.015);
        for (i = 0; i < b.length; i++) if (b[i] > 0.25) { any = true; break; }
        if (!any) { gone.push(s.n); s.pile = null; return; }
        cx.beginPath(); cx.moveTo(s.L, s.T + 1); for (i = 0; i < b.length; i++) cx.lineTo(s.L + (i + 0.5) * bw, s.T - b[i]); cx.lineTo(s.R, s.T + 1); cx.closePath();
        cx.fillStyle = 'rgba(255,255,255,.96)'; cx.fill(); if (!dark()) { cx.strokeStyle = 'rgba(123,24,193,.22)'; cx.lineWidth = 1; cx.stroke(); } });
      gone.forEach(function (n) { piles.delete(n); });
      if (kind === 'storm') {
        if (!nextBolt) nextBolt = t + 1.5; else if (t > nextBolt) { nextBolt = t + 3.5 + Math.random() * 4; strike(); }
        if (flash > 0.02) {
          cx.fillStyle = 'rgba(255,255,255,' + (flash * (page ? 0.32 : 0.38)).toFixed(3) + ')'; cx.fillRect(0, 0, W, H);
          if (bolt) { cx.save(); cx.strokeStyle = 'rgba(255,255,255,' + flash.toFixed(3) + ')'; cx.shadowColor = '#d9b8ff'; cx.shadowBlur = 18; cx.lineWidth = 2.6; cx.beginPath(); bolt.forEach(function (q, k) { if (k) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); cx.stroke(); cx.restore(); }
          flash *= 0.88;
        }
      }
      raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf && run()) raf = requestAnimationFrame(frame); }
    function sync() { chip.hidden = !(page && kind !== 'clear'); chip.firstChild.textContent = 'Weather: ' + (names[kind] || ''); [].forEach.call(ctl.querySelectorAll('button[data-whole]'), function (o) { o.setAttribute('aria-pressed', String((o.dataset.whole === '1') === page)); }); }
    function set(k, auto) { if (!auto) mine = true; kind = k; P = []; drops = []; pops = []; nextBolt = 0; flash = 0; el.dataset.sky = k; [].forEach.call(ctl.querySelectorAll('button[data-wx]'), function (o) { o.setAttribute('aria-pressed', String(o.dataset.wx === k)); }); sync(); if (!run()) cx.clearRect(0, 0, W, H); wake(); }
    function setPage(on) { mine = true; page = on; dim = 0; cx.clearRect(0, 0, W, H); W = H = 0; P = []; drops = []; piles.clear(); S = []; if (on) { cv.classList.add('page'); document.body.appendChild(cv); if (kind === 'clear') set('snow'); } else { cv.classList.remove('page'); el.appendChild(cv); } sync(); wake(); }
    [].forEach.call(ctl.querySelectorAll('button[data-wx]'), function (b) { b.addEventListener('click', function () { set(b.dataset.wx); }); });
    [].forEach.call(ctl.querySelectorAll('button[data-whole]'), function (b) { b.addEventListener('click', function () { if ((b.dataset.whole === '1') !== page) setPage(!page); }); });
    chip.querySelector('button').addEventListener('click', function () { setPage(false); set('clear'); });
    document.addEventListener('visibilitychange', wake); document.addEventListener('dmmotion', wake);
    addEventListener('scroll', function () { dirtyRects = true; }, { passive: true }); addEventListener('resize', function () { dirtyRects = true; });
    new IntersectionObserver(function (es) { near = es[0].isIntersecting; el.classList.toggle('vis', near); wake(); }).observe(el);
  })();

  // 02 The logo as a 3D object (uses the same logo builder as the homepage): finishes, and scenes that set the light and the background together
  demo('logo3d', function (el, kick) {
    var ctl = el;
    return sx().then(function (SX) {
      var T = window.THREE, r = SX.renderer(el.querySelector('canvas')); if (!r) throw new Error('no 3D');
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1.6, 0.1, 100); cam.position.set(0, 0, 10); SX.lights(sc, 0xb06cff);
      var L = sc.children.filter(function (o) { return o.isLight; }), amb = L[0], key = L[1], rim = L[2], anim = '', bg = 'light', fin = 'purple';
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
      function look(name) { var k = looks[name] || looks.soft; amb.intensity = k[0]; key.color.setHex(k[1]); key.intensity = k[2]; key.position.set(k[3][0], k[3][1], k[3][2]); rim.color.setHex(k[4]); rim.intensity = k[5]; anim = k[6] || ''; }
      [].forEach.call(ctl.querySelectorAll('button[data-fin],button[data-bg]'), function (b) { b.addEventListener('click', function () {
        var d = b.dataset;
        if (d.fin) { press(b, 'fin'); fin = d.fin; U.tree.material = fins[fin][0]; U.arrow.material = fins[fin][1]; }
        if (d.bg) { press(b, 'bg'); bg = d.bg; el.dataset.bg = bg; look(d.light); }
        if (shiny()) env(); api.dirty = true; kick(); }); });
      var box = new T.Box3().setFromObject(G), sz = box.getSize(new T.Vector3()), piv = new T.Group(); G.position.sub(box.getCenter(new T.Vector3())); piv.add(G); piv.scale.setScalar(3.0 / Math.max(sz.x, sz.y)); sc.add(piv);
      // drag turns it all the way round (and up and down with a mouse); it keeps the angle you leave it at
      var tx = 0, ty = 0, rx = 0, ry = 0, spin = 0, tilt = 0, vs = 0, vt = 0, down = false, lx = 0, ly = 0, api = { dirty: true };
      pointer(el, function (x, y) { tx = (x - 0.5) * 0.5; ty = (y - 0.5) * 0.4; api.dirty = true; kick(); });
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; down = true; lx = e.clientX; ly = e.clientY; vs = vt = 0; if (e.pointerType !== 'touch' && el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (x) {} } });
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
        piv.rotation.set(tilt + rx + (still ? 0 : Math.sin(t * 0.9) * 0.05), ry + spin + (still ? -0.35 : Math.sin(t * 0.6) * 0.3), 0); piv.position.y = 0.2 + (still ? 0 : Math.sin(t * 1.2) * 0.12); r.render(sc, cam);
        api.dirty = Math.abs(tx - ry) + Math.abs(ty - rx) + Math.abs(vs) + Math.abs(vt) > 0.004; };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < 1.1 ? 12 : 10; cam.updateProjectionMatrix(); api.dirty = true; };
      return api;
    });
  });

  // 08 Your website on a laptop and phone: the laptop opens when it comes into view, both screens scroll through a
  // drawn copy of the website, and visitors can turn them, look closer at one device, or switch the website to dark.
  demo('devices', function (el, kick) {
    var ctl = el.parentNode.querySelector('.dmctl');
    return three().then(function (T) {
      var cv = el.querySelector('canvas'), r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1.6, 0.1, 60);
      sc.add(new T.HemisphereLight(0xffffff, 0xcdb6ea, 0.9));
      var sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(-3, 6, 5); sc.add(sun);
      var rim = new T.DirectionalLight(0xb06cff, 0.55); rim.position.set(5, 3, -4); sc.add(rim);
      var d1 = new Path2D(el.dataset.d1), d2 = new Path2D(el.dataset.d2), tag = el.dataset.tag || '', font = '"Sora Variable", Sora, system-ui, sans-serif', bfont = '"Inter Variable", Inter, system-ui, sans-serif', dark = false;
      function rr(g, x, y, w, h, q) { g.beginPath(); g.moveTo(x + q, y); g.arcTo(x + w, y, x + w, y + h, q); g.arcTo(x + w, y + h, x, y + h, q); g.arcTo(x, y + h, x, y, q); g.arcTo(x, y, x + w, y, q); g.closePath(); }
      function mark(g, x, y, m, a, b) { g.save(); g.translate(x, y); g.scale(m / 846, m / 846); g.fillStyle = a; g.fill(d1); g.fillStyle = b; g.fill(d2); g.restore(); }
      function lines(g, text, x, y, maxW, lh) { var w = text.split(' '), line = '', out = []; w.forEach(function (s) { var t = line ? line + ' ' + s : s; if (g.measureText(t).width > maxW && line) { out.push(line); line = s; } else line = t; }); out.push(line); out.forEach(function (l, i) { g.fillText(l, x, y + i * lh); }); return y + out.length * lh; }
      // a tall drawing of the website; the screen shows a window of it and scrolls by moving that window
      function page(w, phone) {
        var c = document.createElement('canvas'), H = phone ? 2304 : 1700, g; c.width = w; c.height = H; g = c.getContext('2d');
        var bg = dark ? '#14081f' : '#ffffff', ink = dark ? '#ffffff' : '#1a1024', soft = dark ? '#cbbbe2' : '#5d5370', card = dark ? '#231233' : '#f6effd', line = dark ? '#3d2459' : '#e6d9f5', acc = dark ? '#b06cff' : '#7b18c1';
        var u = w / (phone ? 400 : 800), p = (phone ? 22 : 48) * u, y;
        g.fillStyle = bg; g.fillRect(0, 0, w, H); g.textBaseline = 'alphabetic';
        // menu bar
        mark(g, p, 18 * u, 26 * u, dark ? '#d9b8ff' : '#7b18c1', dark ? '#b06cff' : '#b06cff');
        g.fillStyle = ink; g.font = '700 ' + 17 * u + 'px ' + font; g.fillText('SEOxpert', p + 34 * u, 37 * u);
        if (phone) { g.fillStyle = ink; [0, 7, 14].forEach(function (k) { g.fillRect(w - p - 22 * u, 22 * u + k * u, 22 * u, 2.4 * u); }); }
        else { g.fillStyle = soft; g.font = '500 ' + 12.5 * u + 'px ' + bfont; ['Services', 'Packages', 'XpertLab', 'About'].forEach(function (s, k) { g.fillText(s, 330 * u + k * 82 * u, 36 * u); }); rr(g, w - p - 96 * u, 16 * u, 96 * u, 30 * u, 9 * u); g.fillStyle = acc; g.fill(); g.fillStyle = dark ? '#1a0b2e' : '#fff'; g.font = '600 ' + 12 * u + 'px ' + bfont; g.fillText('Contact us', w - p - 82 * u, 35.5 * u); }
        // banner
        y = (phone ? 92 : 110) * u;
        var glow = g.createRadialGradient(w * 0.78, y + 90 * u, 0, w * 0.78, y + 90 * u, 260 * u); glow.addColorStop(0, dark ? 'rgba(176,108,255,.35)' : 'rgba(176,108,255,.28)'); glow.addColorStop(1, 'rgba(176,108,255,0)'); g.fillStyle = glow; g.fillRect(0, y - 80 * u, w, 400 * u);
        rr(g, p, y, 150 * u, 26 * u, 13 * u); g.fillStyle = dark ? '#ffffff' : '#2a0d47'; g.fill(); g.fillStyle = dark ? '#3d0a66' : '#e9d8ff'; g.font = '600 ' + 11 * u + 'px ' + bfont; g.fillText('Made with XpertCore', p + 14 * u, y + 17.5 * u);
        g.fillStyle = ink; g.font = '700 ' + (phone ? 34 : 38) * u + 'px ' + font;
        y = lines(g, tag, p, y + (phone ? 72 : 78) * u, phone ? w - 2 * p : 400 * u, (phone ? 38 : 44) * u);
        g.fillStyle = soft; g.font = '400 ' + 14 * u + 'px ' + bfont; g.fillText('Website design for businesses in Malaysia.', p, y + 8 * u);
        rr(g, p, y + 30 * u, 128 * u, 40 * u, 11 * u); g.fillStyle = acc; g.fill(); g.fillStyle = dark ? '#1a0b2e' : '#fff'; g.font = '600 ' + 13.5 * u + 'px ' + bfont; g.fillText('See packages', p + 20 * u, y + 55 * u);
        if (phone) { mark(g, w / 2 - 80 * u, y + 110 * u, 160 * u, dark ? '#b06cff' : '#9a35e8', dark ? '#d9b8ff' : '#b06cff'); y += 310 * u; }
        else { mark(g, 540 * u, 120 * u, 190 * u, dark ? '#b06cff' : '#9a35e8', dark ? '#d9b8ff' : '#b06cff'); y += 120 * u; }
        // the three names
        g.fillStyle = acc; g.font = '600 ' + 11 * u + 'px ' + bfont; g.fillText('THREE NAMES, ONE WEBSITE', p, y);
        var cards = [['XpertForge', 'Website build'], ['XpertCore', 'Our AI core'], ['XpertCare', 'Monthly care']], cw = phone ? w - 2 * p : (w - 2 * p - 32 * u) / 3, ch = phone ? 82 * u : 130 * u;
        cards.forEach(function (c, k) { var cx0 = phone ? p : p + k * (cw + 16 * u), cy = y + 18 * u + (phone ? k * (ch + 12 * u) : 0), hot = k === 1;
          rr(g, cx0, cy, cw, ch, 14 * u); g.fillStyle = hot ? (dark ? '#3d0a66' : '#2a0d47') : card; g.fill(); if (!hot) { g.strokeStyle = line; g.lineWidth = 1.5 * u; g.stroke(); }
          g.fillStyle = hot ? '#ffffff' : ink; g.font = '700 ' + 17 * u + 'px ' + font; g.fillText(c[0], cx0 + 18 * u, cy + ch - (phone ? 40 : 46) * u);
          g.fillStyle = hot ? '#d9cbee' : soft; g.font = '400 ' + 12.5 * u + 'px ' + bfont; g.fillText(c[1], cx0 + 18 * u, cy + ch - (phone ? 20 : 24) * u);
          if (!phone) { rr(g, cx0 + 18 * u, cy + 18 * u, 30 * u, 30 * u, 9 * u); g.fillStyle = hot ? '#b06cff' : (dark ? '#3d2459' : '#e6d5f8'); g.fill(); } });
        y += 18 * u + (phone ? 3 * (ch + 12 * u) : ch) + 40 * u;
        // a dark band with a short line
        g.fillStyle = dark ? '#231233' : '#2a0d47'; g.fillRect(0, y, w, 170 * u);
        g.fillStyle = '#ffffff'; g.font = '700 ' + (phone ? 22 : 26) * u + 'px ' + font; lines(g, 'Fast first. Readable by Google and AI search.', p, y + 66 * u, phone ? w - 2 * p : 460 * u, 32 * u);
        y += 210 * u;
        // questions, drawn as rows
        g.fillStyle = acc; g.font = '600 ' + 11 * u + 'px ' + bfont; g.fillText('QUESTIONS', p, y);
        for (var q = 0; q < 4; q++) { var qy = y + 20 * u + q * 58 * u; rr(g, p, qy, w - 2 * p, 46 * u, 12 * u); g.fillStyle = card; g.fill(); rr(g, p + 18 * u, qy + 19 * u, (phone ? 150 : 260) * u - q * 18 * u, 8 * u, 4 * u); g.fillStyle = line; g.fill(); g.fillStyle = acc; g.fillRect(w - p - 26 * u, qy + 22 * u, 10 * u, 2.4 * u); g.fillRect(w - p - 22 * u, qy + 18 * u, 2.4 * u, 10 * u); }
        y += 20 * u + 4 * 58 * u + 30 * u;
        // footer
        g.fillStyle = dark ? '#0c0612' : '#1a0b2e'; g.fillRect(0, y, w, H - y);
        mark(g, p, y + 34 * u, 24 * u, '#d9b8ff', '#b06cff'); g.fillStyle = '#ffffff'; g.font = '700 ' + 15 * u + 'px ' + font; g.fillText('SEOxpert', p + 32 * u, y + 52 * u);
        g.fillStyle = '#9d8bb8'; g.font = '400 ' + 12 * u + 'px ' + bfont; g.fillText('Website design and website care in Malaysia.', p, y + 86 * u);
        return { c: c, H: H, end: Math.min(H, y + 130 * u) };
      }
      function screenMat(w, phone) { var t = new T.CanvasTexture(document.createElement('canvas')); t.generateMipmaps = false; t.minFilter = T.LinearFilter; t.anisotropy = 4; return { tex: t, w: w, phone: phone, end: 1600, mat: new T.MeshBasicMaterial({ map: t, toneMapped: false }) }; }
      var LS = screenMat(1024, false), PS = screenMat(512, true);
      function paint() { [LS, PS].forEach(function (s) { var pg = page(s.w, s.phone); s.tex.image = pg.c; s.end = pg.end; s.H = pg.H; s.tex.dispose(); s.tex.needsUpdate = true; }); el.classList.toggle('night', dark); }
      // a flat rounded rectangle with 0 to 1 texture coordinates, for screens
      function plate(w, h, q) { var s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + q, y); s.lineTo(x + w - q, y); s.quadraticCurveTo(x + w, y, x + w, y + q); s.lineTo(x + w, y + h - q); s.quadraticCurveTo(x + w, y + h, x + w - q, y + h); s.lineTo(x + q, y + h); s.quadraticCurveTo(x, y + h, x, y + h - q); s.lineTo(x, y + q); s.quadraticCurveTo(x, y, x + q, y);
        var g = new T.ShapeGeometry(s, 8), p = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h); return g; }
      function slab(w, h, d, q, m) { var s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + q, y); s.lineTo(x + w - q, y); s.quadraticCurveTo(x + w, y, x + w, y + q); s.lineTo(x + w, y + h - q); s.quadraticCurveTo(x + w, y + h, x + w - q, y + h); s.lineTo(x + q, y + h); s.quadraticCurveTo(x, y + h, x, y + h - q); s.lineTo(x, y + q); s.quadraticCurveTo(x, y, x + q, y);
        var g = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 3, curveSegments: 8 }); g.translate(0, 0, -d / 2); return new T.Mesh(g, m); }
      var alu = new T.MeshStandardMaterial({ color: 0xe9e3f1, roughness: 0.42, metalness: 0.25 }), bez = new T.MeshStandardMaterial({ color: 0x120b1a, roughness: 0.35 }), plumM = new T.MeshStandardMaterial({ color: 0x2a0d47, roughness: 0.32, metalness: 0.35 });
      var rig = new T.Group(); sc.add(rig);
      // laptop: a base with a keyboard, and a lid on a hinge
      var lap = new T.Group(); lap.position.set(-0.55, 0, 0); rig.add(lap);
      var base = slab(3.3, 2.15, 0.09, 0.14, alu); base.rotation.x = -Math.PI / 2; base.position.y = 0.045; lap.add(base);
      var kc = document.createElement('canvas'); kc.width = 512; kc.height = 336; var kg = kc.getContext('2d');
      kg.fillStyle = '#ddd5e8'; for (var rI = 0; rI < 5; rI++) for (var cI = 0; cI < 14; cI++) { rr(kg, 34 + cI * 31.6, 20 + rI * 30, 27, 25, 4); kg.fill(); }
      rr(kg, 130, 172, 252, 25, 4); kg.fill(); rr(kg, 176, 214, 160, 104, 10); kg.fillStyle = '#e2dbec'; kg.fill(); kg.strokeStyle = '#cfc5dd'; kg.lineWidth = 2; kg.stroke();
      var kb = new T.Mesh(new T.PlaneGeometry(3.3, 2.15), new T.MeshStandardMaterial({ map: new T.CanvasTexture(kc), transparent: true, roughness: 0.6 })); kb.rotation.x = -Math.PI / 2; kb.position.y = 0.11; lap.add(kb);
      var hinge = new T.Group(); hinge.position.set(0, 0.1, -1.04); lap.add(hinge);
      var lid = slab(3.3, 2.1, 0.06, 0.14, alu); lid.position.set(0, 1.05, 0); hinge.add(lid);
      var face = new T.Mesh(plate(3.22, 2.02, 0.11), bez); face.position.set(0, 1.05, 0.05); hinge.add(face);
      var lscr = new T.Mesh(plate(3.0, 1.82, 0.03), LS.mat); lscr.position.set(0, 1.07, 0.052); hinge.add(lscr);
      var lmark = new T.Mesh(new T.CircleGeometry(0.16, 24), new T.MeshStandardMaterial({ color: 0xb06cff, roughness: 0.3, metalness: 0.4 })); lmark.position.set(0, 1.05, -0.05); lmark.rotation.y = Math.PI; hinge.add(lmark);
      // phone: standing a little in front, turned towards the laptop
      var ph = new T.Group(); ph.position.set(2.05, 1.02, 0.55); ph.rotation.y = -0.32; rig.add(ph);
      ph.add(slab(0.98, 2.04, 0.09, 0.15, plumM));
      var pf = new T.Mesh(plate(0.94, 2.0, 0.13), bez); pf.position.z = 0.064; ph.add(pf);
      var pscr = new T.Mesh(plate(0.86, 1.9, 0.1), PS.mat); pscr.position.z = 0.066; ph.add(pscr);
      var notch = new T.Mesh(plate(0.24, 0.06, 0.03), bez); notch.position.set(0, 0.89, 0.068); ph.add(notch);
      // a soft shadow on the floor
      var shc = document.createElement('canvas'); shc.width = shc.height = 128; var sg = shc.getContext('2d'), sgr = sg.createRadialGradient(64, 64, 0, 64, 64, 64); sgr.addColorStop(0, 'rgba(60,10,110,.32)'); sgr.addColorStop(1, 'rgba(60,10,110,0)'); sg.fillStyle = sgr; sg.fillRect(0, 0, 128, 128);
      var shadow = new T.Mesh(new T.PlaneGeometry(7.4, 3.6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(shc), transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.set(0.2, 0.001, 0.1); rig.add(shadow);
      paint(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { paint(); api.dirty = true; kick(); });
      // camera framings for each view: position, then the point it looks at
      var views = { both: [[0.25, 2.3, 7.6], [0.25, 0.92, 0]], laptop: [[-0.55, 1.85, 4.7], [-0.55, 1.0, -0.5]], phone: [[2.25, 1.35, 3.3], [2.05, 1.02, 0.4]] };
      var view = 'both', cp = new T.Vector3().fromArray(views.both[0]), cl = new T.Vector3().fromArray(views.both[1]), tp = cp.clone(), tl = cl.clone(), far = 1;
      var open = still ? 1 : 0, wantOpen = 1, seenAt = 0, ry = still ? -0.12 : 0.5, vy = 0, down = false, lx = 0, last = -1e9, api = { dirty: true };
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; down = true; lx = e.clientX; last = now(); el.classList.add('drag'); if (e.pointerType !== 'touch') { try { el.setPointerCapture(e.pointerId); } catch (x) {} } });
      el.addEventListener('pointermove', function (e) { if (!down) return; vy = (e.clientX - lx) * 0.006; ry = Math.max(-0.9, Math.min(0.9, ry + vy)); lx = e.clientX; last = now(); api.dirty = true; kick(); });
      var up = function () { down = false; el.classList.remove('drag'); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      if (ctl) [].forEach.call(ctl.querySelectorAll('button'), function (b) { b.addEventListener('click', function () {
        var d = b.dataset; last = now();
        if (d.view) { press(b, 'view'); view = d.view; tp.fromArray(views[view][0]); tl.fromArray(views[view][1]); tp.z *= far; if (view === 'laptop') wantOpen = 1; }
        if (d.mode) { press(b, 'mode'); dark = d.mode === 'dark'; paint(); }
        if (b.hasAttribute('data-lid')) { wantOpen = wantOpen ? 0 : 1; b.setAttribute('aria-pressed', String(!wantOpen)); b.textContent = wantOpen ? 'Close the lid' : 'Open the lid'; }
        api.dirty = true; kick(); }); });
      function scroll(s, mesh, t, ph0) { // hold at the top, glide down, hold, glide back up
        var vis = s.phone ? 1.9 / 0.86 * s.w : 1.82 / 3.0 * s.w, rep = vis / s.H, maxOff = Math.max(0, (s.end - vis) / s.H), cyc = (t * 0.075 + ph0) % 1, k;
        if (still) k = 0; else if (cyc < 0.15) k = 0; else if (cyc < 0.5) k = (1 - Math.cos((cyc - 0.15) / 0.35 * Math.PI)) / 2; else if (cyc < 0.65) k = 1; else k = (1 + Math.cos((cyc - 0.65) / 0.35 * Math.PI)) / 2;
        s.tex.repeat.set(1, rep); s.tex.offset.set(0, 1 - rep - k * maxOff);
      }
      api.frame = function (t) {
        if (!seenAt) seenAt = t;
        if (!still && open !== wantOpen && t - seenAt > 0.35) { open += (wantOpen - open) * 0.06; if (Math.abs(open - wantOpen) < 0.002) open = wantOpen; }
        else if (still) open = wantOpen;
        hinge.rotation.x = (1 - open) * Math.PI / 2 * 0.985 - open * 0.3; lscr.material.color.setScalar(0.25 + 0.75 * open);
        if (!down) { ry = Math.max(-0.9, Math.min(0.9, ry + vy)); vy *= 0.92; if (!still && now() - last > 3500) ry += (Math.sin(t * 0.35) * 0.32 - 0.08 - ry) * 0.02; }
        rig.rotation.y = ry; rig.position.y = still ? 0 : Math.sin(t * 1.1) * 0.03;
        scroll(LS, lscr, t, 0); scroll(PS, pscr, t, 0.4);
        cp.lerp(tp, 0.07); cl.lerp(tl, 0.07); cam.position.copy(cp); cam.lookAt(cl);
        r.render(sc, cam); api.dirty = Math.abs(vy) > 0.0005 || cp.distanceTo(tp) > 0.002 || open !== wantOpen;
      };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; far = w / h < 1.45 ? (w / h < 1.1 ? 1.4 : 1.1) : 1; tp.fromArray(views[view][0]); tp.z *= far; cam.updateProjectionMatrix(); api.dirty = true; };
      return api;
    });
  });

  // 08 A carousel that turns in 3D, and folds flat into a gallery at the press of a button
  (function () {
    var el = stage('ring'); if (!el) return; var ring = el.querySelector('.ringin'), cards = [].slice.call(el.querySelectorAll('.rc')), mode = el.querySelector('.ringmode');
    var a = 0, down = false, lx = 0, auto = null, seen = false, flat = false;
    function size() { var w = ring.getBoundingClientRect().width || ring.offsetWidth; if (w) ring.style.setProperty('--r', (w * 0.5 / Math.tan(Math.PI / 6) + w * 0.12) / 16 + 'rem'); }
    function set(v, snap) { a = snap ? Math.round(v / 60) * 60 : v; ring.style.setProperty('--a', a + 'deg'); }
    function rest() { clearInterval(auto); auto = null; } function play() { if (!auto && seen && !flat) auto = setInterval(function () { if (!still) set(a - 60, true); }, 2600); }
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

  // 13 A globe you can spin: the real shapes of the land as dots, with routes flying from Kuala Lumpur to famous landmarks.
  // It tours the landmarks by itself until a visitor drags it or picks a place.
  // The land map comes from /js/land.js, loaded only when the globe is near.
  var landP = null;
  function landMap() { if (window.SXLAND) return Promise.resolve(window.SXLAND); if (!landP) landP = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/js/land.js'; s.onload = function () { ok(window.SXLAND); }; s.onerror = no; document.head.appendChild(s); }); return landP; }
  demo('globe', function (el, kick) {
    return Promise.all([three(), landMap()]).then(function (got) {
      var T = got[0], LM = got[1], LAND = LM.bits, MYS = LM.my;
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
      // famous landmarks, built from simple shapes; the first one, in Kuala Lumpur, is home
      sc.add(new T.HemisphereLight(0xffffff, 0x8a6fb0, 0.95)); var sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(-3, 5, 6); sc.add(sun); var rim = new T.DirectionalLight(0xd9b8ff, 0.45); rim.position.set(4, 2, -5); sc.add(rim);
      var places = [['Petronas Twin Towers', 'Kuala Lumpur', 3.158, 101.711, 'petronas'], ['Tokyo Tower', 'Tokyo', 35.659, 139.745, 'tokyo'], ['Opera House', 'Sydney', -33.857, 151.215, 'opera'],
        ['Burj Khalifa', 'Dubai', 25.197, 55.274, 'burj'], ['Eiffel Tower', 'Paris', 48.858, 2.294, 'eiffel'], ['Big Ben', 'London', 51.501, -0.125, 'bigben'], ['Statue of Liberty', 'New York', 40.689, -74.045, 'liberty'],
        ['Pyramids', 'Giza', 29.979, 31.134, 'pyramids'], ['Taj Mahal', 'Agra', 27.175, 78.042, 'taj'], ['Great Wall', 'Beijing', 40.432, 116.57, 'wall'], ['Christ the Redeemer', 'Rio de Janeiro', -22.952, -43.211, 'christ']];
      function M(c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.1, flatShading: true }, o || {})); }
      function add(gp, geo, m, x, y, z, ry) { var o = new T.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (ry) o.rotation.y = ry; gp.add(o); return o; }
      var C = function (a, b, h, n) { return new T.CylinderGeometry(a, b, h, n || 8); }, B = function (x, y, z) { return new T.BoxGeometry(x, y, z); }, Q = Math.PI / 4, Y = new T.Vector3(0, 1, 0);
      // a beam from one point to another, for towers built from steel
      function rod(gp, a, b, rad, m, n) { var A = new T.Vector3(a[0], a[1], a[2]), E = new T.Vector3(b[0], b[1], b[2]), d = E.clone().sub(A), o = new T.Mesh(C(rad, rad, d.length(), n || 4), m); o.position.copy(A).add(E).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(Y, d.normalize()); gp.add(o); return o; }
      function lathe(pts, n) { return new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), n || 16); }
      // four corner legs that meet level by level, with cross braces from level `from` up
      function lattice(gp, lv, mats, r, from) { var K = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
        for (var i = 0; i < lv.length - 1; i++) { var a = lv[i], b = lv[i + 1], m = mats[i % mats.length], rr = Math.max(0.006, r * (1 - i * 0.16));
          K.forEach(function (k, j) { var n = K[(j + 1) % 4]; rod(gp, [k[0] * a[1], a[0], k[1] * a[1]], [k[0] * b[1], b[0], k[1] * b[1]], rr, m);
            if (i >= from) { rod(gp, [k[0] * a[1], a[0], k[1] * a[1]], [n[0] * b[1], b[0], n[1] * b[1]], 0.0045, m); rod(gp, [n[0] * a[1], a[0], n[1] * a[1]], [k[0] * b[1], b[0], k[1] * b[1]], 0.0045, m); } }); } }
      // small textures: glass with floor lines, rows of windows, a clock face
      function tex(w, h, draw, rx, ry) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); return t; }
      function glass(c1, c2, rx, ry) { return tex(32, 32, function (x) { x.fillStyle = c1; x.fillRect(0, 0, 32, 32); x.fillStyle = c2; for (var i = 0; i < 32; i += 4) x.fillRect(0, i, 32, 1); x.fillStyle = 'rgba(255,255,255,.4)'; for (i = 0; i < 32; i += 8) x.fillRect(i, 0, 1, 32); }, rx, ry); }
      function windows(c1, c2, rx, ry) { return tex(32, 32, function (x) { x.fillStyle = c1; x.fillRect(0, 0, 32, 32); x.fillStyle = c2; for (var i = 0; i < 4; i++) for (var j = 0; j < 2; j++) x.fillRect(i * 8 + 2, j * 16 + 4, 4, 9); }, rx, ry); }
      var clock = tex(128, 128, function (x) { x.fillStyle = '#e8b84a'; x.beginPath(); x.arc(64, 64, 63, 0, 7); x.fill(); x.fillStyle = '#fff6dc'; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.fill(); x.fillStyle = '#2a2333';
        for (var i = 0; i < 12; i++) { x.save(); x.translate(64, 64); x.rotate(i * Math.PI / 6); x.fillRect(-2.5, -50, 5, 11); x.restore(); } x.lineCap = 'round'; x.strokeStyle = '#2a2333'; x.lineWidth = 7; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 28); x.stroke(); x.lineWidth = 6; x.beginPath(); x.moveTo(64, 64); x.lineTo(92, 74); x.stroke(); });
      // every landmark stands on a little round tile: the top in its own colour, the side in brand purple
      var tileSide = M(0x7b18c1, { roughness: 0.45 }), tops = {};
      function tile(q, col, r) { var t = tops[col] || (tops[col] = M(col, { roughness: 0.8 })); var o = new T.Mesh(C(r, r * 1.05, 0.05, 32), [tileSide, t, t]); o.position.y = -0.025; q.add(o); }
      var GRASS = 0x9ccf86, gold = M(0xe8b84a, { metalness: 0.25, roughness: 0.35 }), shine = M(0xffd27a, { emissive: 0xffb43c, emissiveIntensity: 0.9 });
      var build = {
        petronas: function (q) { tile(q, 0xe4dcef, 0.4); var m = M(0xffffff, { map: glass('#e3e8ef', '#9aa5b6', 8, 10), metalness: 0.2, roughness: 0.35 }), s = M(0xf4f6fa, { metalness: 0.3, roughness: 0.3 });
          add(q, B(0.6, 0.05, 0.24), M(0xd3c8e2), 0, 0.025);
          [-0.15, 0.15].forEach(function (x) { var y = 0.05;
            [[0.08, 0.3], [0.074, 0.11], [0.067, 0.09], [0.059, 0.08], [0.051, 0.07], [0.042, 0.06], [0.033, 0.05], [0.024, 0.045]].forEach(function (v) { add(q, C(v[0], v[0], v[1], 16), m, x, y + v[1] / 2); add(q, C(v[0] + 0.007, v[0] + 0.007, 0.01, 16), s, x, y + v[1]); y += v[1]; });
            add(q, C(0.012, 0.022, 0.05, 8), s, x, y + 0.025); add(q, new T.SphereGeometry(0.013, 8, 6), s, x, y + 0.09); add(q, C(0.002, 0.007, 0.24, 6), s, x, y + 0.17); });
          add(q, B(0.16, 0.03, 0.045), s, 0, 0.47); rod(q, [-0.025, 0.46, 0], [-0.075, 0.33, 0], 0.006, s); rod(q, [0.025, 0.46, 0], [0.075, 0.33, 0], 0.006, s); },
        tokyo: function (q) { tile(q, 0xe4dcef, 0.4); var r = M(0xe8503a), w = M(0xfbfbfb), gl = M(0x2f3f63, { metalness: 0.4, roughness: 0.3 });
          add(q, B(0.46, 0.07, 0.3), M(0xf2eef6), 0, 0.035, -0.02);
          lattice(q, [[0.07, 0.2], [0.2, 0.14], [0.36, 0.085], [0.5, 0.06], [0.62, 0.045], [0.72, 0.032]], [r, w, r, w, r], 0.018, 0);
          add(q, C(0.11, 0.1, 0.05, 8), w, 0, 0.39, 0, Math.PI / 8); add(q, C(0.112, 0.112, 0.022, 8), gl, 0, 0.395, 0, Math.PI / 8); add(q, C(0.09, 0.11, 0.015, 8), r, 0, 0.42, 0, Math.PI / 8);
          add(q, C(0.05, 0.05, 0.04, 8), w, 0, 0.73, 0, Math.PI / 8); add(q, C(0.052, 0.052, 0.015, 8), gl, 0, 0.73, 0, Math.PI / 8);
          for (var i = 0; i < 4; i++) add(q, C(0.016 - i * 0.003, 0.018 - i * 0.003, 0.08, 8), i % 2 ? w : r, 0, 0.79 + i * 0.08); add(q, new T.SphereGeometry(0.008, 6, 4), shine, 0, 1.11); },
        eiffel: function (q) { tile(q, GRASS, 0.4); var m = M(0x7a5c44, { roughness: 0.7 });
          lattice(q, [[0, 0.21], [0.2, 0.11], [0.42, 0.058], [0.56, 0.042], [0.7, 0.028], [0.84, 0.014]], [m], 0.022, 1);
          for (var i = 0; i < 4; i++) { var a = add(q, new T.TorusGeometry(0.15, 0.011, 4, 16, Math.PI), m, Math.sin(i * Math.PI / 2) * 0.16, 0.025, Math.cos(i * Math.PI / 2) * 0.16); a.rotation.y = i * Math.PI / 2; }
          add(q, B(0.26, 0.03, 0.26), m, 0, 0.2); add(q, B(0.13, 0.025, 0.13), m, 0, 0.42); add(q, B(0.04, 0.05, 0.04), m, 0, 0.86); add(q, C(0.003, 0.008, 0.14, 6), m, 0, 0.95); add(q, new T.SphereGeometry(0.009, 6, 4), shine, 0, 1.02); },
        opera: function (q) { tile(q, 0x84bde0, 0.44); var w = M(0xfbf8f1, { side: T.DoubleSide, roughness: 0.35 }), st = M(0xd2ad84);
          add(q, B(0.6, 0.07, 0.36), st, -0.02, 0.035); add(q, B(0.14, 0.035, 0.3), st, -0.38, 0.018);
          // a sail: half a dome, narrowed towards the top so it ends in a point
          function sail(rad) { var gm = new T.SphereGeometry(rad, 16, 10, 0, Math.PI, 0, Math.PI / 2), a = gm.attributes.position;
            for (var i = 0; i < a.count; i++) { var t = a.getY(i) / rad; a.setXYZ(i, a.getX(i) * (1 - 0.55 * t), a.getY(i) * 1.9, a.getZ(i) * (1 - 0.25 * t) * 0.9); } gm.computeVertexNormals(); return gm; }
          // each sail is a slice of a dome that opens towards the harbour and leans into it
          function shell(x, z, rad, open) { var pv = new T.Group(); pv.position.set(x, 0.07, z); pv.rotation.y = open > 0 ? -Math.PI / 2 : Math.PI / 2; q.add(pv);
            var sh = add(pv, sail(rad), w); sh.rotation.x = -0.3; }
          [[0.09, 1], [-0.09, 0.82]].forEach(function (hall) { var k = hall[1], z = hall[0]; shell(-0.25, z, 0.1 * k, -1); shell(-0.13, z, 0.2 * k, 1); shell(0.01, z, 0.17 * k, 1); shell(0.13, z, 0.125 * k, 1); });
          shell(0.26, 0.0, 0.085, 1); },
        burj: function (q) { tile(q, 0xf0dfb6, 0.4); var m = M(0xffffff, { map: glass('#dfe7f0', '#93a3b8', 3, 16), metalness: 0.2, roughness: 0.3 }), s = M(0xf4f6fa, { metalness: 0.3, roughness: 0.3 });
          add(q, C(0.045, 0.055, 0.82, 6), m, 0, 0.41);
          [0, 1, 2].forEach(function (wg) { var gp = new T.Group(); gp.rotation.y = wg * Math.PI * 2 / 3; q.add(gp);
            for (var j = 0; j < 5; j++) { var len = 0.2 - j * 0.035, top = 0.2 + j * 0.12 + wg * 0.04; add(gp, B(len, top, 0.075 - j * 0.008), m, len / 2, top / 2); } });
          add(q, C(0.03, 0.042, 0.1, 6), m, 0, 0.87); add(q, C(0.018, 0.028, 0.08, 6), s, 0, 0.96); add(q, C(0.002, 0.012, 0.22, 6), s, 0, 1.11); },
        bigben: function (q) { tile(q, GRASS, 0.42); var m = M(0xdcbd7e), dk = M(0xb39258), roof = M(0x3b3d52, { metalness: 0.3 }), face = M(0xffffff, { map: clock, emissive: 0xfff0c8, emissiveIntensity: 0.25, flatShading: false }),
            wing = M(0xffffff, { map: windows('#dcbd7e', '#8d7350', 6, 2) });
          var x0 = -0.17; add(q, B(0.14, 0.52, 0.14), m, x0, 0.26); [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (k) { add(q, B(0.025, 0.56, 0.025), dk, x0 + k[0] * 0.07, 0.28, k[1] * 0.07); add(q, C(0, 0.014, 0.08, 4), gold, x0 + k[0] * 0.08, 0.86, k[1] * 0.08); });
          add(q, B(0.17, 0.18, 0.17), m, x0, 0.61); for (var i = 0; i < 4; i++) { var f = add(q, new T.CircleGeometry(0.066, 24), face, x0 + Math.sin(i * Math.PI / 2) * 0.0855, 0.61, Math.cos(i * Math.PI / 2) * 0.0855); f.rotation.y = i * Math.PI / 2; }
          add(q, B(0.15, 0.1, 0.15), dk, x0, 0.75); add(q, B(0.155, 0.06, 0.12), roof, x0, 0.75); add(q, B(0.12, 0.06, 0.155), roof, x0, 0.75);
          add(q, new T.ConeGeometry(0.11, 0.26, 4), roof, x0, 0.93, 0, Q); add(q, C(0.003, 0.012, 0.12, 6), gold, x0, 1.12);
          add(q, B(0.4, 0.15, 0.14), wing, 0.11, 0.075, -0.02); add(q, B(0.4, 0.03, 0.1), roof, 0.11, 0.165, -0.02);
          for (var p = 0; p < 6; p++) add(q, C(0, 0.01, 0.06, 4), dk, -0.07 + p * 0.072, 0.18, 0.05); },
        liberty: function (q) { tile(q, GRASS, 0.4); var st = M(0xcbb795), st2 = M(0xb39d78), g = M(0x74c4a8, { roughness: 0.6 });
          add(q, C(0.3, 0.32, 0.05, 11), st2, 0, 0.025); add(q, B(0.22, 0.08, 0.22), st, 0, 0.09); add(q, B(0.17, 0.2, 0.17), st, 0, 0.23); add(q, B(0.2, 0.025, 0.2), st2, 0, 0.34); add(q, B(0.13, 0.06, 0.13), st, 0, 0.38);
          add(q, C(0.034, 0.075, 0.3, 12), g, 0, 0.56); add(q, C(0.03, 0.04, 0.08, 12), g, 0, 0.74); add(q, new T.SphereGeometry(0.03, 12, 8), g, 0, 0.8);
          for (var i = 0; i < 7; i++) { var a = (i - 3) * 0.42, d = new T.Vector3(Math.sin(a) * 0.9, 0.55, Math.cos(a) * 0.4).normalize(), ray = add(q, new T.ConeGeometry(0.006, 0.045, 4), g, d.x * 0.045, 0.81 + d.y * 0.045, d.z * 0.045); ray.quaternion.setFromUnitVectors(Y, d); }
          rod(q, [0.03, 0.76, 0], [0.075, 0.96, 0], 0.012, g, 6); add(q, C(0.016, 0.009, 0.03, 8), g, 0.077, 0.975); add(q, new T.ConeGeometry(0.014, 0.05, 8), shine, 0.077, 1.01);
          var tb = add(q, B(0.035, 0.06, 0.012), g, -0.045, 0.68, 0.03); tb.rotation.z = 0.3; },
        pyramids: function (q) { tile(q, 0xebd29c, 0.44); var m = M(0xdcb46a), cap = M(0xf5e6be), palm = M(0x5f9e48), trunk = M(0x8a6a4a);
          [[0.26, 0.34, -0.14, -0.06], [0.2, 0.26, 0.14, 0.09], [0.11, 0.14, 0.31, 0.22]].forEach(function (v) { add(q, new T.ConeGeometry(v[0], v[1], 4), m, v[2], v[1] / 2, v[3], Q); });
          add(q, new T.ConeGeometry(0.045, 0.06, 4), cap, -0.14, 0.31, -0.06, Q);
          add(q, B(0.1, 0.035, 0.035), m, -0.08, 0.018, 0.27); add(q, B(0.032, 0.045, 0.032), m, -0.035, 0.045, 0.27);
          [[0.3, -0.22], [-0.33, 0.17]].forEach(function (p) { add(q, C(0.006, 0.009, 0.13, 5), trunk, p[0], 0.065, p[1]); for (var i = 0; i < 5; i++) { var lf = add(q, B(0.07, 0.006, 0.02), palm, p[0] + Math.cos(i * 1.26) * 0.03, 0.125, p[1] + Math.sin(i * 1.26) * 0.03); lf.rotation.set(0, -i * 1.26, -0.4); } }); },
        taj: function (q) { tile(q, GRASS, 0.44); var m = M(0xfbf7f0, { roughness: 0.4 }), sh = M(0xece4d8), dk = M(0xcbb9a2), wa = M(0x8cc8ec, { roughness: 0.15, metalness: 0.2 });
          var dome = [[0, 0], [0.1, 0], [0.135, 0.05], [0.145, 0.11], [0.125, 0.18], [0.08, 0.24], [0.03, 0.29], [0.008, 0.32], [0, 0.33]];
          add(q, B(0.5, 0.05, 0.5), sh, 0, 0.025, -0.04); add(q, B(0.05, 0.008, 0.16), wa, 0, 0.004, 0.32);
          add(q, C(0.2, 0.2, 0.2, 8), m, 0, 0.15, -0.04, Math.PI / 8);
          for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2, fx = Math.sin(a) * 0.186, fz = Math.cos(a) * 0.186 - 0.04, b = add(q, B(0.085, 0.12, 0.012), dk, fx, 0.13, fz); b.rotation.y = a; var t = add(q, C(0.0425, 0.0425, 0.012, 14, 1), dk, fx, 0.19, fz); t.rotation.set(Math.PI / 2, 0, a); t.rotation.order = 'YXZ'; t.rotation.y = a; }
          add(q, C(0.1, 0.1, 0.06, 16), m, 0, 0.28, -0.04); add(q, lathe(dome, 18), m, 0, 0.31, -0.04); add(q, C(0.003, 0.006, 0.08, 6), gold, 0, 0.68, -0.04);
          [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (k) { var x = k[0] * 0.12, z = k[1] * 0.12 - 0.04; add(q, C(0.028, 0.028, 0.05, 8), m, x, 0.275, z); var d = add(q, lathe(dome, 10), m, x, 0.3, z); d.scale.setScalar(0.32);
            var mx = k[0] * 0.22, mz = k[1] * 0.22 - 0.04; add(q, C(0.016, 0.022, 0.36, 8), m, mx, 0.23, mz); [0.15, 0.26, 0.37].forEach(function (y) { add(q, C(0.027, 0.027, 0.01, 8), dk, mx, y, mz); }); var md = add(q, lathe(dome, 10), m, mx, 0.41, mz); md.scale.setScalar(0.2); }); },
        wall: function (q) { tile(q, 0x86bf73, 0.44); var h1 = M(0x7cb86c), h2 = M(0x6aa85d), m = M(0xe2cda6), dk = M(0x8f7458);
          var P = [[-0.36, 0.05, 0.12], [-0.2, 0.12, -0.08], [-0.02, 0.07, 0.1], [0.16, 0.17, -0.06], [0.34, 0.09, 0.08]];
          P.forEach(function (p, i) { var h = add(q, new T.SphereGeometry(0.13, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? h1 : h2, p[0] * 0.9, 0, p[2] - 0.17); h.scale.y = (p[1] + 0.07) / 0.13; });
          var curve = new T.CatmullRomCurve3(P.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); })), pts = curve.getPoints(16);
          for (var i = 0; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1], mid = a.clone().add(b).multiplyScalar(0.5), d = b.clone().sub(a), seg = add(q, B(0.045, 0.055, d.length() + 0.01), m, mid.x, mid.y + 0.025, mid.z);
            seg.lookAt(seg.position.clone().add(d)); var under = add(q, B(0.07, mid.y, d.length() + 0.01), h1, mid.x, mid.y / 2 - 0.01, mid.z); under.rotation.y = Math.atan2(d.x, d.z); }
          P.forEach(function (p, i) { if (i % 2) return; add(q, B(0.075, 0.1, 0.075), m, p[0], p[1] + 0.05, p[2]); add(q, B(0.088, 0.018, 0.088), dk, p[0], p[1] + 0.105, p[2]); add(q, B(0.02, 0.035, 0.077), dk, p[0], p[1] + 0.06, p[2]); }); },
        christ: function (q) { tile(q, 0x6fae62, 0.42); var hill = M(0x4f8f4a), rock = M(0x8f8a84), w = M(0xf1eee6, { roughness: 0.4 }), tree = M(0x3f7d3c);
          add(q, C(0.08, 0.34, 0.28, 9), hill, 0, 0.14); add(q, C(0.055, 0.085, 0.07, 9), rock, 0, 0.315); add(q, B(0.065, 0.07, 0.065), w, 0, 0.385);
          add(q, C(0.024, 0.045, 0.26, 10), w, 0, 0.55); add(q, B(0.34, 0.034, 0.038), w, 0, 0.645); add(q, new T.SphereGeometry(0.03, 10, 8), w, 0, 0.705);
          for (var i = 0; i < 7; i++) { var a = i * 0.9, rr = 0.3 + (i % 2) * 0.06; add(q, new T.ConeGeometry(0.035, 0.09, 6), tree, Math.cos(a) * rr, 0.045, Math.sin(a) * rr); } }
      };
      var yaw = { petronas: 0.25, tokyo: 0.4, opera: -0.55, burj: 0.5, eiffel: 0.3, bigben: 0.35, liberty: -0.4, pyramids: 0.6, taj: 0.25, wall: 0.1, christ: 0 };
      var up = new T.Vector3(0, 1, 0), marks = places.map(function (p, i) {
        var pos = at(p[2], p[3], R0), q = new T.Group(), holder = new T.Group(); holder.position.copy(pos); // each landmark stands upright with its front facing south, so it always faces the camera when the globe flies to it
        var nU = pos.clone().normalize(), east = new T.Vector3().crossVectors(up, nU).normalize(), south = new T.Vector3().crossVectors(east, nU); holder.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(east, nU, south)); holder.add(q); g.add(holder);
        build[p[4]](q); q.rotation.y = yaw[p[4]] || 0; var s0 = i ? 0.17 : 0.22; q.scale.setScalar(s0); return { q: q, pos: pos, s0: s0, s: s0 };
      });
      var home = marks[0].pos, orange = new T.MeshBasicMaterial({ color: 0xf08a24 });
      var pulse = new T.Mesh(new T.RingGeometry(0.06, 0.09, 40), new T.MeshBasicMaterial({ color: 0xf08a24, transparent: true, side: T.DoubleSide, depthWrite: false })); pulse.rotation.x = -Math.PI / 2; pulse.position.y = 0.01; marks[0].q.parent.add(pulse);
      // a route from Kuala Lumpur to each landmark
      var arcs = [], NS = 60;
      marks.slice(1).forEach(function (mk, j) { var end = mk.pos, mid = home.clone().add(end).multiplyScalar(0.5), len = home.distanceTo(end); mid.normalize().multiplyScalar(R0 + 0.25 + len * 0.28);
        var curve = new T.QuadraticBezierCurve3(home.clone(), mid, end), pts = curve.getPoints(NS), geo = new T.BufferGeometry().setFromPoints(pts);
        var line = new T.Line(geo, new T.LineBasicMaterial({ color: 0xb06cff, transparent: true, opacity: 0.9 })); g.add(line);
        var dot = new T.Mesh(new T.SphereGeometry(0.035, 10, 8), orange); g.add(dot); arcs.push({ geo: geo, pts: pts, dot: dot, off: j * 0.29 }); });
      var rings = [2.55, 2.9].map(function (Rr, j) { var ring = new T.Mesh(new T.TorusGeometry(Rr, 0.01, 8, 120), new T.MeshBasicMaterial({ color: j ? 0xb06cff : 0x7b18c1, transparent: true, opacity: 0.35 })); ring.rotation.x = 1.25 + j * 0.45; ring.rotation.y = j * 0.7; sc.add(ring); return ring; });
      var label = el.querySelector('.gpin'), city = el.querySelector('.gcity'), btns = [].slice.call(el.querySelectorAll('.gfly button')), wp = new T.Vector3(), cp = new T.Vector3(), tip = new T.Vector3();
      g.rotation.y = -101.69 * D - 0.7;
      // flying to a landmark turns the globe so it stands near the top edge, where it is seen from the side
      var vy = 0.0035, vx = 0, down = false, lx = 0, ly = 0, focus = -1, tY = null, tX = 0.32, mine = false, tourAt = 0, ti = 1, baseZ = 7.2, api = { dirty: true };
      function fly(i) { focus = i; var p = places[i]; tY = -p[3] * D; tX = Math.max(-1.75, Math.min(1.75, (p[2] - 60) * D)); city.textContent = p[0] + ' · ' + p[1]; btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); }); api.dirty = true; kick(); }
      btns.forEach(function (b, k) { b.addEventListener('click', function () { mine = true; fly(k); }); });
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; down = true; mine = true; tY = null; focus = -1; btns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); lx = e.clientX; ly = e.clientY; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (e) { if (!down) return; vy = (e.clientX - lx) * 0.006; vx = (e.clientY - ly) * 0.004; lx = e.clientX; ly = e.clientY; api.dirty = true; kick(); });
      var up2 = function () { down = false; el.classList.remove('drag'); }; el.addEventListener('pointerup', up2); el.addEventListener('pointercancel', up2);
      api.frame = function (t) {
        if (!mine && !still) { if (!tourAt) tourAt = t + 2.2; else if (t > tourAt) { tourAt = t + 5.2; fly(ti++ % places.length); } }
        var moving = false;
        if (tY !== null && !down) { var dy = Math.atan2(Math.sin(tY - g.rotation.y), Math.cos(tY - g.rotation.y)), dx = tX - tiltG.rotation.x; g.rotation.y += dy * (still ? 1 : 0.055); tiltG.rotation.x += dx * (still ? 1 : 0.055); vy = 0; moving = Math.abs(dy) + Math.abs(dx) > 0.002; }
        else { g.rotation.y += vy; tiltG.rotation.x = Math.max(-1.5, Math.min(1.5, tiltG.rotation.x + vx)); vx *= 0.9; if (!down) vy += ((still ? 0 : 0.0035) - vy) * 0.03; moving = Math.abs(vy) > 0.0005; }
        marks.forEach(function (mk, i) { var want = i === focus ? 0.72 : mk.s0; if (Math.abs(want - mk.s) > 0.001) { mk.s += (want - mk.s) * (still ? 1 : 0.1); mk.q.scale.setScalar(mk.s); moving = true; } });
        var ph = (t * 0.7) % 1; pulse.scale.setScalar(1 + ph * 3.5); pulse.material.opacity = still ? 0.6 : 1 - ph;
        arcs.forEach(function (a) { var p = still ? 1 : ((t * 0.32 + a.off) % 1.5), hd = Math.min(1, p), tl = Math.max(0, p - 0.55), i0 = Math.floor(tl * NS), i1 = Math.ceil(hd * NS);
          a.geo.setDrawRange(i0, Math.max(0, i1 - i0 + 1)); a.dot.position.copy(a.pts[Math.min(NS, i1)]); a.dot.visible = p < 1.02; });
        rings[0].rotation.z = t * 0.2; rings[1].rotation.z = -t * 0.15;
        // a picked landmark: the camera comes closer and the globe sinks, so the landmark stands in the middle with the horizon behind it
        var on = focus >= 0, gy = on ? -1.72 : 0, gz = on ? baseZ * 0.62 : baseZ, rz = on ? 0 : 0.18, ease = still ? 1 : 0.06;
        if (Math.abs(tiltG.position.y - gy) + Math.abs(cam.position.z - gz) + Math.abs(tiltG.rotation.z - rz) > 0.002) { tiltG.position.y += (gy - tiltG.position.y) * ease; cam.position.z += (gz - cam.position.z) * ease; tiltG.rotation.z += (rz - tiltG.rotation.z) * ease; glow.position.y = rings[0].position.y = rings[1].position.y = tiltG.position.y; moving = true; }
        r.render(sc, cam);
        function place(node, mk, lift, show) { tip.set(0, lift, 0); mk.q.localToWorld(tip); cp.copy(tip).normalize(); var face = cp.dot(cam.position.clone().sub(tip).normalize()); wp.copy(tip).project(cam);
          node.style.left = ((wp.x * 0.5 + 0.5) * 100).toFixed(2) + '%'; node.style.top = ((0.5 - wp.y * 0.5) * 100).toFixed(2) + '%'; node.style.opacity = show && face > 0.1 ? '1' : '0'; }
        if (label) place(label, marks[0], 1.2, focus !== 0);
        if (city) city.style.opacity = focus >= 0 && !moving ? '1' : '0';
        api.dirty = still && moving;
      };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; baseZ = w / h < 1.3 ? 9 : 7.2; if (focus < 0) cam.position.z = baseZ; cam.updateProjectionMatrix(); api.dirty = true; };
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
    function next() { n = (n + 1) % lines.length; show(lines[n]); clearInterval(tmr); if (seen) tmr = setInterval(auto, 4200); }
    function auto() { if (!still && !document.hidden) next(); }
    btn.addEventListener('click', next);
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; clearInterval(tmr); if (seen) { show(lines[n]); tmr = setInterval(auto, 4200); } }, { threshold: 0.4 }).observe(el);
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
    setInterval(function () { if (on && !still && !document.hidden) boom(false); }, 6500);
    new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(frame); }).observe(art);
  })();
  // Pause all motion: one switch that stills every demo (and the CSS animations on the page) until pressed again
  (function () {
    var b = document.querySelector('.dmpause'); if (!b) return;
    function show() { b.setAttribute('aria-pressed', String(still)); b.textContent = still ? 'Play motion' : 'Pause all motion'; document.documentElement.classList.toggle('dmpaused', still); }
    b.addEventListener('click', function () { still = !still; show(); kicks.forEach(function (k) { k(); }); document.dispatchEvent(new Event('dmmotion')); });
    show();
  })();
})();
