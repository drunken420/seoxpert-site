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
      var tc = document.createElement('canvas'); tc.width = 1024; tc.height = 256; var tx = new T.CanvasTexture(tc); tx.wrapS = T.RepeatWrapping; tx.repeat.x = 2; tx.anisotropy = 4;
      var d1 = new Path2D(el.dataset.d1), d2 = new Path2D(el.dataset.d2), bandCol = '#7b18c1';
      function paint() { var g = tc.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = bandCol; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#fff';
        g.save(); g.translate(250, 68); g.scale(0.142, 0.142); g.fill(d1); g.globalAlpha = 0.8; g.fill(d2); g.restore();
        g.font = '700 104px "Sora Variable", Sora, system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillText('SEOxpert', 400, 134); tx.needsUpdate = true; }
      paint(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { paint(); api.dirty = true; kick(); });
      var band = new T.MeshStandardMaterial({ map: tx, roughness: 0.75, side: T.DoubleSide });
      var lath = function (pts, m) { return new T.Mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), 64), m); };
      cup.add(lath([[0, -1.25], [0.66, -1.25], [0.7, -1.2], [0.95, 1.1], [0.99, 1.13], [0.95, 1.16], [0.9, 1.12], [0.66, -1.16], [0, -1.16]], white));
      cup.add(lath([[0.79, -0.52], [0.905, 0.52]], band));
      cup.add(lath([[0, 1.33], [0.55, 1.33], [0.62, 1.3], [0.66, 1.2], [0.98, 1.2], [1.03, 1.16], [1.03, 1.08], [0.98, 1.06], [0.98, 1.1]], new T.MeshStandardMaterial({ color: 0x2a0d47, roughness: 0.4 })));
      cup.rotation.x = 0.12;
      var ry = -1.9, vy = 0, down = false, lx = 0, api = { dirty: true };
      el.addEventListener('pointerdown', function (e) { if (e.target.closest('.dmsw')) return; down = true; lx = e.clientX; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (e) { if (!down) return; vy = (e.clientX - lx) * 0.012; ry += vy; lx = e.clientX; api.dirty = true; kick(); });
      var up = function () { down = false; el.classList.remove('drag'); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      [].forEach.call(el.querySelectorAll('.dmsw button'), function (b) { b.addEventListener('click', function () { [].forEach.call(el.querySelectorAll('.dmsw button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); bandCol = b.dataset.c; paint(); el.style.setProperty('--cupc', b.dataset.c); api.dirty = true; kick(); }); });
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
  // 07 The logo as a 3D object (uses the same logo builder as the homepage)
  demo('logo3d', function (el, kick) {
    return sx().then(function (SX) {
      var T = window.THREE, r = SX.renderer(el.querySelector('canvas')); if (!r) throw new Error('no 3D');
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1.6, 0.1, 100); cam.position.set(0, 0, 10); SX.lights(sc, 0xb06cff);
      var G = SX.logo({}), box = new T.Box3().setFromObject(G), sz = box.getSize(new T.Vector3()), piv = new T.Group(); G.position.sub(box.getCenter(new T.Vector3())); piv.add(G); piv.scale.setScalar(3.5 / Math.max(sz.x, sz.y)); sc.add(piv);
      var tx = 0, ty = 0, rx = 0, ry = 0, spin = 0, vs = 0, down = false, lx = 0, api = { dirty: true };
      pointer(el, function (x, y) { tx = (x - 0.5) * 1.1; ty = (y - 0.5) * 0.8; api.dirty = true; kick(); });
      el.addEventListener('pointerdown', function (e) { down = true; lx = e.clientX; });
      el.addEventListener('pointermove', function (e) { if (!down) return; vs = (e.clientX - lx) * 0.012; spin += vs; lx = e.clientX; });
      var up = function () { down = false; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', function () { tx = ty = 0; down = false; api.dirty = true; kick(); });
      api.frame = function (t) { rx += (ty - rx) * 0.08; ry += (tx - ry) * 0.08; if (!down) { spin += vs; vs *= 0.95; spin *= 0.985; }
        piv.rotation.set(rx + (still ? 0 : Math.sin(t * 0.9) * 0.05), ry + spin + (still ? -0.35 : Math.sin(t * 0.6) * 0.38), 0); piv.position.y = still ? 0 : Math.sin(t * 1.2) * 0.12; r.render(sc, cam);
        api.dirty = Math.abs(tx - ry) + Math.abs(ty - rx) + Math.abs(vs) + Math.abs(spin) > 0.004; };
      api.resize = function (w, h) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); api.dirty = true; };
      return api;
    });
  });

  // 05 Spotlight reveal: the light wanders by itself until someone takes over
  demo('spot', function (el, kick) {
    var box = el.querySelector('.dmspot'), x = 0.5, y = 0.5, tx = 0.5, ty = 0.5, mine = false, api = { dirty: true };
    pointer(el, function (px, py) { mine = true; tx = px; ty = py; api.dirty = true; kick(); });
    el.addEventListener('pointerleave', function () { mine = false; });
    api.frame = function (t) { if (!mine && !still) { tx = 0.5 + Math.sin(t * 0.7) * 0.3; ty = 0.5 + Math.sin(t * 1.1) * 0.24; }
      x += (tx - x) * 0.14; y += (ty - y) * 0.14; box.style.setProperty('--x', (x * 100).toFixed(2) + '%'); box.style.setProperty('--y', (y * 100).toFixed(2) + '%'); api.dirty = Math.abs(tx - x) + Math.abs(ty - y) > 0.001; };
    return api;
  });

  // 06 Light and dark switch
  [].forEach.call(document.querySelectorAll('.dmtheme'), function (t) { var b = t.querySelector('.tsw'); b.addEventListener('click', function () { var on = !t.classList.contains('on'); t.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Light mode' : 'Dark mode'); }); });

  // 08 A carousel that turns in 3D
  (function () {
    var el = stage('ring'); if (!el) return; var ring = el.querySelector('.ringin'), a = 0, down = false, lx = 0, moved = 0, auto = null, seen = false;
    function size() { var w = ring.getBoundingClientRect().width || ring.offsetWidth; if (w) ring.style.setProperty('--r', (w * 0.5 / Math.tan(Math.PI / 6) + w * 0.12) / 16 + 'rem'); }
    function set(v, snap) { a = snap ? Math.round(v / 60) * 60 : v; ring.style.setProperty('--a', a + 'deg'); }
    function rest() { clearInterval(auto); auto = null; } function play() { if (!auto && seen && !still) auto = setInterval(function () { set(a - 60, true); }, 2600); }
    size(); if (window.ResizeObserver) new ResizeObserver(size).observe(el);
    el.addEventListener('pointerdown', function (e) { if (e.target.closest('.ringnav')) return; down = true; moved = 0; lx = e.clientX; rest(); el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - lx; lx = e.clientX; moved += Math.abs(d); set(a + d * 0.45); });
    var up = function () { if (!down) return; down = false; el.classList.remove('drag'); set(a, true); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    [].forEach.call(el.querySelectorAll('.ringnav button'), function (b) { b.addEventListener('click', function () { rest(); set(a - 60 * +b.dataset.dir, true); }); });
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) play(); else rest(); }, { threshold: 0.4 }).observe(el);
  })();

  // 09 Magnetic buttons
  (function () {
    var el = stage('magnet'); if (!el) return; var bs = [].slice.call(el.querySelectorAll('.mg'));
    function pull(e) { var best = null, bd = 1e9, pos = bs.map(function (b) { var r = b.getBoundingClientRect(), cx = r.left + r.width / 2 - (parseFloat(b.dataset.x) || 0), cy = r.top + r.height / 2 - (parseFloat(b.dataset.y) || 0), dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) - r.width / 2; if (d < bd) { bd = d; best = b; } return [dx, dy, d]; });
      bs.forEach(function (b, i) { var on = b === best && pos[i][2] < 90, x = on ? pos[i][0] * 0.3 : 0, y = on ? pos[i][1] * 0.3 : 0; b.dataset.x = x; b.dataset.y = y; b.classList.toggle('near', on); b.style.setProperty('--mx', x.toFixed(1) + 'px'); b.style.setProperty('--my', y.toFixed(1) + 'px'); }); }
    function free() { bs.forEach(function (b) { b.dataset.x = b.dataset.y = 0; b.classList.remove('near'); b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); }); }
    el.addEventListener('pointermove', pull); el.addEventListener('pointerdown', pull); el.addEventListener('pointerleave', free); el.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') free(); }); el.addEventListener('pointercancel', free);
  })();

  // 10 A button that celebrates with petals
  (function () {
    var el = stage('burst'); if (!el) return; var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), btn = el.querySelector('button'), P = [], raf = 0, W = 0, H = 0, back = 0;
    var cols = ['#7b18c1', '#9a35e8', '#b06cff', '#d9b8ff', '#2a0d47'];
    function fit() { var r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
    function tick() { raf = 0; cx.clearRect(0, 0, W, H);
      P = P.filter(function (p) { p.vy += 0.16; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 0.008; if (p.life <= 0 || p.y > H + 40) return false;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(1, Math.cos(p.a * 1.7)); cx.globalAlpha = Math.min(1, p.life * 2.5); cx.fillStyle = p.c; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(p.s, 0); cx.arc(0, 0, p.s, 0, Math.PI / 2); cx.closePath(); cx.fill(); cx.restore(); return true; });
      if (P.length) raf = requestAnimationFrame(tick); }
    btn.addEventListener('click', function () {
      fit(); var b = btn.getBoundingClientRect(), s = el.getBoundingClientRect(), ox = b.left - s.left + b.width / 2, oy = b.top - s.top + b.height / 2, n = still ? 0 : 90;
      for (var i = 0; i < n; i++) { var an = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, sp = 3 + Math.random() * 8; P.push({ x: ox, y: oy, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 2, a: Math.random() * 6.3, va: (Math.random() - 0.5) * 0.3, s: 7 + Math.random() * 12, c: cols[i % cols.length], life: 0.8 + Math.random() * 0.5 }); }
      btn.textContent = btn.dataset.b; clearTimeout(back); back = setTimeout(function () { btn.textContent = btn.dataset.a; }, 2200); if (!raf && P.length) raf = requestAnimationFrame(tick);
    });
  })();
})();
