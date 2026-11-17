/* "Secure by design" in 3D (Suhen 2026-11-17: "very nice can that layer be animated with threejs?").
   Four glass plates guard the website slab on top: 4 global cloud network, 3 HTTPS, 2 safety headers,
   1 nothing to break into. A shield with a padlock floats above. When the picture comes into view the plates
   open up from a tight stack; then a bright frame keeps sweeping down through the layers (every visit passes
   through all of them) and each plate lights up as it passes. Pointing at a layer in the list slides its plate
   out and lights it. The scene leans a little towards the mouse.
   three.js loads only when the section is near the screen, drawing stops when it scrolls away or the tab is
   hidden, and people who ask for less motion keep the still SVG picture that is already in the page.
   Without WebGL the SVG stays too. Markup: src/components/Secure.astro; styles `.sec*` in site.css. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].forEach.call(document.querySelectorAll('.secfig'), function (fig) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      three().then(function (T) { start(T, fig); }).catch(function (e) { if (window.console) console.warn('secure3d', e); });
    }, { rootMargin: '300px 0px' });
    io.observe(fig);
  });

  function three() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (window.__pm3dThree) return window.__pm3dThree; // shared with the other scenes: one download per page
    return (window.__pm3dThree = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = '/vendor/three-r128.min.js';
      s.onload = function () { ok(window.THREE); }; s.onerror = no; document.head.appendChild(s);
    }));
  }

  function start(T, fig) {
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true }); } catch (e) { return; }
    if (!renderer.getContext()) return;
    var phone = Math.min(screen.width, screen.height) < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.75 : 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    var cv = renderer.domElement; cv.className = 'seccv'; cv.setAttribute('aria-hidden', 'true');
    fig.appendChild(cv);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(26, 1, 0.1, 100);
    var aniso = renderer.capabilities.getMaxAnisotropy();
    var canvas = function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; };
    var texOf = function (c) { var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = aniso; return t; };
    var glow = function (m) { m.transparent = true; m.depthWrite = false; m.blending = T.AdditiveBlending; return m; };

    // light: a white key from the front right, lilac from below, and a soft purple room for the glass to reflect
    scene.add(new T.AmbientLight(0xffffff, 0.5));
    var key = new T.DirectionalLight(0xffffff, 1.2); key.position.set(4, 9, 6); scene.add(key);
    var under = new T.PointLight(0xb06cff, 2.2, 14); under.position.set(0, -1.5, 2); scene.add(under);
    var rc = canvas(256, 128), rg = rc.getContext('2d'), sky = rg.createLinearGradient(0, 0, 0, 128);
    sky.addColorStop(0, '#ffffff'); sky.addColorStop(0.4, '#e7d4ff'); sky.addColorStop(0.62, '#7b18c1'); sky.addColorStop(1, '#14081f');
    rg.fillStyle = sky; rg.fillRect(0, 0, 256, 128);
    var room = texOf(rc); room.mapping = T.EquirectangularReflectionMapping;
    var pmg = new T.PMREMGenerator(renderer); scene.environment = pmg.fromEquirectangular(room).texture; pmg.dispose(); room.dispose();

    var world = new T.Group(); scene.add(world);            // leans towards the mouse
    var stack = new T.Group(); stack.rotation.y = Math.PI / 4; world.add(stack);

    // ---- shapes ---------------------------------------------------------------------------------------------
    var S = 3.1, R = 0.34; // plate size and corner radius
    function rounded(s, r) {
      var h = s / 2, p = new T.Shape();
      p.moveTo(-h + r, -h); p.lineTo(h - r, -h); p.quadraticCurveTo(h, -h, h, -h + r); p.lineTo(h, h - r); p.quadraticCurveTo(h, h, h - r, h);
      p.lineTo(-h + r, h); p.quadraticCurveTo(-h, h, -h, h - r); p.lineTo(-h, -h + r); p.quadraticCurveTo(-h, -h, -h + r, -h); return p;
    }
    function slab(depth) {
      var g = new T.ExtrudeGeometry(rounded(S, R), { depth: depth, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 3, curveSegments: 10 });
      g.rotateX(-Math.PI / 2); g.translate(0, -depth / 2, 0); return g;
    }
    // the face drawn on top of a plate: glowing rim, a pattern of its own and a soft inner light
    function face(kind) {
      var n = 512, c = canvas(n), g = c.getContext('2d'), m = 26, r = R / S * n;
      function rr(x, y, w, h, q) { g.beginPath(); g.moveTo(x + q, y); g.arcTo(x + w, y, x + w, y + h, q); g.arcTo(x + w, y + h, x, y + h, q); g.arcTo(x, y + h, x, y, q); g.arcTo(x, y, x + w, y, q); g.closePath(); }
      var inner = g.createRadialGradient(n / 2, n / 2, 20, n / 2, n / 2, n * 0.62);
      inner.addColorStop(0, 'rgba(176,108,255,.38)'); inner.addColorStop(1, 'rgba(176,108,255,.04)');
      rr(m, m, n - 2 * m, n - 2 * m, r); g.fillStyle = inner; g.fill();
      g.save(); rr(m, m, n - 2 * m, n - 2 * m, r); g.clip();
      g.strokeStyle = 'rgba(217,184,255,.42)'; g.fillStyle = 'rgba(217,184,255,.55)'; g.lineWidth = 2;
      if (kind === 4) { // network: nodes and links
        var pts = []; for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) pts.push([60 + i * 65 + (j % 2) * 20, 60 + j * 65 + (i % 3) * 8]);
        pts.forEach(function (p, k) { var q = pts[k + 1], s2 = pts[k + 7]; g.beginPath(); if (q && k % 7 !== 6) { g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } if (s2) { g.moveTo(p[0], p[1]); g.lineTo(s2[0], s2[1]); } g.stroke(); g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.fill(); });
      } else if (kind === 3) { // HTTPS: rings of light going out from the middle
        for (var k = 1; k < 7; k++) { g.lineWidth = 2.4; g.strokeStyle = 'rgba(217,184,255,' + (0.6 - k * 0.07) + ')'; rr(n / 2 - k * 36, n / 2 - k * 36, k * 72, k * 72, 14 + k * 4); g.stroke(); }
      } else if (kind === 2) { // safety headers: a hexagon net
        var hr = 30, hw = Math.sqrt(3) * hr;
        for (var row = -1; row * hr * 1.5 < n + hr; row++) for (var col = -1; col * hw < n + hw; col++) {
          var cx = col * hw + (row % 2 ? hw / 2 : 0), cy = row * hr * 1.5; g.beginPath();
          for (var a = 0; a < 6; a++) { var t = Math.PI / 6 + a * Math.PI / 3; g[a ? 'lineTo' : 'moveTo'](cx + Math.cos(t) * hr * 0.9, cy + Math.sin(t) * hr * 0.9); }
          g.closePath(); g.stroke();
        }
      } else { // nothing to break into: a solid, closed floor of fine lines
        g.lineWidth = 2; for (var d = -n; d < n * 2; d += 26) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d - n, n); g.stroke(); }
      }
      g.restore();
      g.shadowColor = '#d9b8ff'; g.shadowBlur = 18; g.lineWidth = 5; g.strokeStyle = 'rgba(240,226,255,.95)';
      rr(m, m, n - 2 * m, n - 2 * m, r); g.stroke();
      return texOf(c);
    }
    function badge(num) {
      var c = canvas(128), g = c.getContext('2d');
      g.fillStyle = '#7b18c1'; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.fill();
      g.lineWidth = 7; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke();
      g.fillStyle = '#fff'; g.font = "700 60px 'Sora Variable', Sora, 'Sora Fallback', Arial, sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(num), 64, 68);
      var sp = new T.Sprite(new T.SpriteMaterial({ map: texOf(c), transparent: true, depthTest: false }));
      sp.scale.set(0.46, 0.46, 1); sp.renderOrder = 20; return sp;
    }

    // ---- the four glass plates, from the bottom up ------------------------------------------------------------
    var glassGeo = slab(0.07), faceGeo = new T.PlaneGeometry(S + 0.02, S + 0.02); faceGeo.rotateX(-Math.PI / 2);
    var plates = [];
    [4, 3, 2, 1].forEach(function (num, i) {
      var p = new T.Group();
      var glass = new T.Mesh(glassGeo, new T.MeshPhysicalMaterial({ color: 0x9a35e8, metalness: 0.1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true, opacity: 0.32, depthWrite: false, envMapIntensity: 1.2 }));
      glass.renderOrder = i * 2;
      var top = new T.Mesh(faceGeo, glow(new T.MeshBasicMaterial({ map: face(num), opacity: 0.75 })));
      top.position.y = 0.075; top.renderOrder = i * 2 + 1;
      var b = badge(num); b.position.set(S / 2 + 0.05, 0.12, S / 2 + 0.05);
      p.add(glass, top, b); stack.add(p);
      plates.push({ g: p, top: top, glass: glass, badge: b, num: num, lit: 0, hover: 0 });
    });

    // ---- the website on top ---------------------------------------------------------------------------------
    var web = new T.Group(); stack.add(web);
    var webBody = new T.Mesh(slab(0.16), new T.MeshStandardMaterial({ color: 0xf6efff, roughness: 0.35, metalness: 0.05, envMapIntensity: 0.9 }));
    var pc = canvas(512), pg = pc.getContext('2d');
    pg.fillStyle = '#ffffff'; pg.fillRect(0, 0, 512, 512);
    function bar(x, y, w, h, c, r) { pg.fillStyle = c; pg.beginPath(); pg.moveTo(x + r, y); pg.arcTo(x + w, y, x + w, y + h, r); pg.arcTo(x + w, y + h, x, y + h, r); pg.arcTo(x, y + h, x, y, r); pg.arcTo(x, y, x + w, y, r); pg.fill(); }
    bar(60, 64, 392, 54, '#7b18c1', 16);
    bar(60, 150, 250, 26, '#d6c1f0', 13); bar(60, 192, 340, 26, '#d6c1f0', 13); bar(60, 234, 300, 26, '#d6c1f0', 13);
    bar(60, 300, 180, 140, '#efe3ff', 22); bar(268, 300, 184, 140, '#efe3ff', 22);
    pg.lineWidth = 4; pg.strokeStyle = '#c9a6f2'; pg.strokeRect(62, 302, 176, 136); pg.strokeRect(270, 302, 180, 136);
    var webTop = new T.Mesh(new T.PlaneGeometry(S * 0.96, S * 0.96).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: texOf(pc), transparent: true }));
    webTop.position.y = 0.12; web.add(webBody, webTop);

    // ---- the shield with its padlock, floating above ----------------------------------------------------------
    var shield = new T.Group(); world.add(shield);
    var ss = new T.Shape(); ss.moveTo(0, 1); ss.quadraticCurveTo(0.45, 0.86, 0.86, 0.8); ss.lineTo(0.86, 0.1);
    ss.bezierCurveTo(0.86, -0.5, 0.45, -0.88, 0, -1.08); ss.bezierCurveTo(-0.45, -0.88, -0.86, -0.5, -0.86, 0.1); ss.lineTo(-0.86, 0.8); ss.quadraticCurveTo(-0.45, 0.86, 0, 1);
    var shGeo = new T.ExtrudeGeometry(ss, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 5, curveSegments: 24 }); shGeo.center();
    shield.add(new T.Mesh(shGeo, new T.MeshPhysicalMaterial({ color: 0x430b75, metalness: 0.5, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.9 })));
    var rim = new T.Mesh(new T.ExtrudeGeometry(ss, { depth: 0.02, bevelEnabled: false, curveSegments: 24 }), glow(new T.MeshBasicMaterial({ color: 0xd9b8ff, opacity: 0.18 })));
    rim.geometry.center(); rim.scale.set(1.14, 1.12, 1); rim.position.z = -0.05; shield.add(rim);
    var white = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
    var lockBody = new T.Mesh(new T.ExtrudeGeometry(rounded(0.62, 0.12), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }), white);
    lockBody.geometry.center(); lockBody.scale.set(1, 0.78, 1); lockBody.position.set(0, -0.2, 0.2);
    var shackle = new T.Mesh(new T.TorusGeometry(0.2, 0.055, 12, 32, Math.PI), white); shackle.position.set(0, 0.08, 0.2);
    var legs = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.14, 12), white), legs2 = legs.clone();
    legs.position.set(0.2, 0.02, 0.2); legs2.position.set(-0.2, 0.02, 0.2);
    var hole = new T.Mesh(new T.CircleGeometry(0.06, 20), new T.MeshBasicMaterial({ color: 0x7b18c1 })); hole.position.set(0, -0.18, 0.33);
    shield.add(lockBody, shackle, legs, legs2, hole);
    shield.scale.setScalar(0.62);

    // ---- the sweeping frame and the rising sparks ---------------------------------------------------------------
    var sc = canvas(512), sg = sc.getContext('2d');
    sg.shadowColor = '#fff'; sg.shadowBlur = 26; sg.lineWidth = 10; sg.strokeStyle = '#ffffff';
    (function () { var m = 30, r = R / S * 512, x = m, y = m, w = 512 - 2 * m; sg.beginPath(); sg.moveTo(x + r, y); sg.arcTo(x + w, y, x + w, y + w, r); sg.arcTo(x + w, y + w, x, y + w, r); sg.arcTo(x, y + w, x, y, r); sg.arcTo(x, y, x + w, y, r); sg.closePath(); sg.stroke(); })();
    var sweep = new T.Mesh(faceGeo.clone().scale(1.04, 1, 1.04), glow(new T.MeshBasicMaterial({ map: texOf(sc), color: 0xe9d8ff, opacity: 0 })));
    sweep.renderOrder = 15; stack.add(sweep);

    var N = phone ? 40 : 70, sp = new Float32Array(N * 3), seeds = [];
    for (var i = 0; i < N; i++) { seeds.push([Math.random() * 6.28, 1.9 + Math.random() * 1.4, Math.random(), 0.25 + Math.random() * 0.5]); }
    var dc = canvas(64), dg = dc.getContext('2d'), dr = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
    dr.addColorStop(0, 'rgba(255,255,255,1)'); dr.addColorStop(0.3, 'rgba(217,184,255,.8)'); dr.addColorStop(1, 'rgba(176,108,255,0)'); dg.fillStyle = dr; dg.fillRect(0, 0, 64, 64);
    var dots = new T.BufferGeometry(); dots.setAttribute('position', new T.BufferAttribute(sp, 3));
    var sparks = new T.Points(dots, glow(new T.PointsMaterial({ size: 0.14, map: texOf(dc), opacity: 0.85 })));
    world.add(sparks);

    // ---- size, layout and pointer --------------------------------------------------------------------------
    var GAP = 0.92, BASE = -1.9, open = 0, openStart = 0;
    function size() {
      var w = fig.clientWidth, h = fig.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); cam.aspect = w / h;
      var dist = 17 / Math.min(1, cam.aspect / 0.84);
      cam.position.set(0, dist * 0.52, dist * 0.86); cam.lookAt(0, 0.75, 0); cam.updateProjectionMatrix();
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(fig); else addEventListener('resize', size);

    var tx = 0, ty = 0, mx = 0, my = 0;
    fig.parentNode.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = fig.getBoundingClientRect(); tx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)); ty = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
    });
    fig.parentNode.addEventListener('pointerleave', function () { tx = ty = 0; });
    // pointing at (or tabbing to) a layer in the list slides its plate out
    var want = 0;
    [].forEach.call(fig.parentNode.querySelectorAll('.seclist li[data-l]'), function (li) {
      var n = +li.getAttribute('data-l');
      li.addEventListener('mouseenter', function () { want = n; });
      li.addEventListener('mouseleave', function () { if (want === n) want = 0; });
      li.addEventListener('focus', function () { want = n; });
      li.addEventListener('blur', function () { if (want === n) want = 0; });
    });

    // ---- drawing ------------------------------------------------------------------------------------------
    var ease = function (x) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3); };
    var running = false, raf = 0, t0 = performance.now(), ready = false;
    function frame(now) {
      raf = 0; if (!running) return;
      var t = (now - t0) / 1000;
      open = ease((t - 0.2) / 1.8);
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      world.rotation.y = mx * 0.22 + Math.sin(t * 0.25) * 0.06;
      world.rotation.x = my * 0.08;

      var gap = 0.16 + (GAP - 0.16) * open;
      // the sweep runs from the website down past the bottom plate, then rests a moment
      var cyc = (t - 2) % 4.2, sweepY = cyc < 0 ? 99 : BASE + 4 * gap + 0.5 - (cyc / 2.6) * (4 * gap + 1.1);
      sweep.position.y = sweepY; sweep.material.opacity = cyc < 0 || cyc > 2.6 ? 0 : Math.sin(Math.min(1, cyc / 2.6) * Math.PI) * 0.9;

      plates.forEach(function (p, i) {
        var y = BASE + i * gap + Math.sin(t * 0.9 + i * 0.8) * 0.03 * open;
        p.hover += ((want === p.num ? 1 : 0) - p.hover) * 0.12;
        var near = sweep.material.opacity > 0 ? Math.exp(-Math.pow((sweepY - y) * 3.2, 2)) : 0;
        p.lit += (near - p.lit) * 0.25;
        p.g.position.set(p.hover * 0.42, y, p.hover * 0.42);
        p.top.material.opacity = 0.6 + 0.4 * Math.max(p.lit, p.hover);
        p.glass.material.opacity = 0.28 + 0.22 * Math.max(p.lit, p.hover);
        p.glass.material.emissive.setHex(0x7b18c1); p.glass.material.emissiveIntensity = 0.25 * Math.max(p.lit, p.hover);
        var bs = 0.46 * (1 + 0.25 * p.hover) * (0.4 + 0.6 * open); p.badge.scale.set(bs, bs, 1);
      });
      web.position.y = BASE + 4 * gap + 0.12 + 0.18 * open + Math.sin(t * 0.9 + 3.4) * 0.03 * open;
      shield.position.set(0, web.position.y + 1.25 + Math.sin(t * 1.2) * 0.08, 0);
      shield.rotation.y = Math.sin(t * 0.6) * 0.32 - mx * 0.25;
      shield.scale.setScalar(0.62 * (0.6 + 0.4 * open));
      under.intensity = 2 + Math.sin(t * 1.4) * 0.4;

      for (var i = 0; i < N; i++) {
        var s = seeds[i], life = (s[2] + t * s[3] * 0.18) % 1, a = s[0] + t * 0.08;
        sp[i * 3] = Math.cos(a) * s[1]; sp[i * 3 + 1] = BASE - 0.4 + life * 5.6; sp[i * 3 + 2] = Math.sin(a) * s[1];
      }
      dots.attributes.position.needsUpdate = true;
      sparks.material.opacity = 0.75 * open;

      renderer.render(scene, cam);
      if (!ready) { ready = true; fig.classList.add('on'); }
      raf = requestAnimationFrame(frame);
    }
    function play(on) {
      if (on === running) return; running = on;
      if (on && !raf) raf = requestAnimationFrame(frame);
    }
    var seen = false;
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; play(seen && !document.hidden); }).observe(fig);
    document.addEventListener('visibilitychange', function () { play(seen && !document.hidden); });
  }
})();
