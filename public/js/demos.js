// Demos page. Each demo starts only when it scrolls near the screen and rests when it leaves.
// The two 3D demos share one copy of three.js, loaded on demand from /vendor/.
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = function (id) { return document.querySelector('.dmstage[data-demo="' + id + '"]'); };
  var threeP = null;
  function three() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!threeP) threeP = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/vendor/three-r128.min.js'; s.onload = function () { ok(window.THREE); }; s.onerror = no; document.head.appendChild(s); });
    return threeP;
  }
  // Run `make(el)` once when the stage comes near; it returns { frame(t), resize(w, h) }. Frames run only while visible.
  function demo(id, make) {
    var el = stage(id); if (!el) return;
    var api = null, started = false, visible = false, raf = 0;
    function loop(t) { raf = 0; if (!visible || !api) return; api.frame(t / 1000); if (!still || api.dirty) raf = requestAnimationFrame(loop); }
    function kick() { if (!raf && visible && api) raf = requestAnimationFrame(loop); }
    function size() { if (api && api.resize) { var r = el.getBoundingClientRect(); if (r.width) api.resize(r.width, r.height); } kick(); }
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !started) { started = true; Promise.resolve(make(el, kick)).then(function (a) { api = a || { frame: function () {} }; el.classList.add('live'); size(); if (window.ResizeObserver) new ResizeObserver(size).observe(el); }).catch(function () { el.classList.add('nogl'); }); }
      kick();
    }, { rootMargin: '200px 0px' }).observe(el);
  }
  function pointer(el, fn) { // normalised pointer position inside el: x, y from 0 to 1
    function h(e) { var r = el.getBoundingClientRect(); fn((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, e); }
    el.addEventListener('pointermove', h); el.addEventListener('pointerdown', h);
  }

  // 01 A paper cup you can spin
  demo('spin', function (el, kick) {
    return three().then(function (T) {
      var cv = el.querySelector('canvas');
      var r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1.6, 0.1, 50); cam.position.set(0, 0.55, 7.2); cam.lookAt(0, 0.1, 0);
      sc.add(new T.HemisphereLight(0xffffff, 0xcdb6ea, 0.95));
      var sun = new T.DirectionalLight(0xffffff, 0.85); sun.position.set(3, 5, 4); sc.add(sun);
      var rim = new T.DirectionalLight(0xb06cff, 0.5); rim.position.set(-4, 2, -3); sc.add(rim);
      var cup = new T.Group(); sc.add(cup);
      var white = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
      var band = new T.MeshStandardMaterial({ color: 0x7b18c1, roughness: 0.75 });
      var lath = function (pts, m) { return new T.Mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), 64), m); };
      cup.add(lath([[0, -1.25], [0.66, -1.25], [0.7, -1.2], [0.95, 1.1], [0.99, 1.13], [0.95, 1.16], [0.9, 1.12], [0.66, -1.16], [0, -1.16]], white));
      cup.add(lath([[0.775, -0.5], [0.79, -0.52], [0.905, 0.52], [0.89, 0.54], [0.775, -0.5]], band));
      cup.add(lath([[0, 1.33], [0.55, 1.33], [0.62, 1.3], [0.66, 1.2], [0.98, 1.2], [1.03, 1.16], [1.03, 1.08], [0.98, 1.06], [0.98, 1.1]], new T.MeshStandardMaterial({ color: 0x2a0d47, roughness: 0.4 })));
      var petal = new T.Mesh(new T.CircleGeometry(0.22, 24, 0, Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffffff })); petal.position.set(-0.1, -0.1, 0.86); petal.rotation.x = -0.11; cup.add(petal);
      var petal2 = petal.clone(); petal2.rotation.z = Math.PI; petal2.position.set(0.1, 0.1, 0.875); cup.add(petal2);
      cup.rotation.x = 0.12;
      var ry = -0.5, vy = 0, down = false, lx = 0, api = { dirty: true };
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('.dmsw')) return; down = true; lx = e.clientX; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (e) { if (!down) return; vy = (e.clientX - lx) * 0.012; ry += vy; lx = e.clientX; api.dirty = true; kick(); });
      var up = function () { down = false; el.classList.remove('drag'); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      [].forEach.call(el.querySelectorAll('.dmsw button'), function (b) { b.addEventListener('click', function () { [].forEach.call(el.querySelectorAll('.dmsw button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); band.color.set(b.dataset.c); el.style.setProperty('--cupc', b.dataset.c); api.dirty = true; kick(); }); });
      api.frame = function (t) { if (!down) { if (!still) ry += 0.006 + vy; vy *= 0.94; } cup.rotation.y = ry; cup.position.y = still ? 0 : Math.sin(t * 1.4) * 0.05; r.render(sc, cam); api.dirty = Math.abs(vy) > 0.0005; };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < 1.45 ? 8.2 : 7.2; cam.updateProjectionMatrix(); api.dirty = true; };
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

  // 03 Your name in particles (plain 2D canvas, no 3D library needed)
  demo('name', function (el, kick) {
    var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), inp = el.querySelector('input');
    var W = 0, H = 0, dpr = 1, P = [], mx = -9, my = -9, api = { dirty: true };
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
    inp.addEventListener('input', targets);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (W) targets(); });
    api.frame = function () {
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

  // 04 Cards that tilt and shine
  [].forEach.call(document.querySelectorAll('.tcard'), function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; c.classList.add('on'); c.style.setProperty('--ry', (x - 0.5) * 22 + 'deg'); c.style.setProperty('--rx', (0.5 - y) * 22 + 'deg'); c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%'); c.style.setProperty('--go', '1'); });
    var off = function () { c.classList.remove('on'); c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); c.style.setProperty('--go', '0'); };
    c.addEventListener('pointerleave', off); c.addEventListener('pointercancel', off); c.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') off(); });
  });

  // 05 Before and after slider
  [].forEach.call(document.querySelectorAll('.dmslide'), function (s) { var i = s.querySelector('input'); i.addEventListener('input', function () { s.style.setProperty('--p', i.value + '%'); }); });

  // 06 Charts that draw themselves
  var ch = stage('draw');
  if (ch) {
    var go = function () { ch.classList.add('reset'); ch.classList.remove('go'); void ch.offsetWidth; ch.classList.remove('reset'); requestAnimationFrame(function () { ch.classList.add('go'); }); };
    new IntersectionObserver(function (es, io) { if (es[0].isIntersecting) { ch.classList.add('go'); io.disconnect(); } }, { threshold: 0.45 }).observe(ch);
    ch.querySelector('.dmreplay').addEventListener('click', go);
  }
})();
