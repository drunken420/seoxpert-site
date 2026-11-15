/* Money-back promise seal (Suhen 2026-11-15: a gold shield, "polished and premium", that people can turn,
   with a different message on the back).
   A two-sided 3D shield: a polished gold frame, deep purple enamel with a fine engraved pattern, a raised gold
   tick, and gold lettering in the site's own fonts. Front: "100% MONEY BACK". Back: the promise itself in short,
   "Google top 50 in your first month, or that month refunded in full" (exact promise terms only).
   Drag it to turn it; let go and it settles on the nearest side. Left alone it sways, leans towards the mouse and
   flips by itself now and then. three.js loads only when the section is near the screen, the scene pauses when it
   scrolls away, and people who ask for less motion get a still shield that still turns when dragged.
   Without WebGL the SVG shield stays. */
(function () {
  var box = document.getElementById('pm3d');
  if (!box || !('IntersectionObserver' in window)) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false;

  function three() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = '/vendor/three-r128.min.js';
      s.onload = function () { ok(window.THREE); }; s.onerror = no; document.head.appendChild(s);
    });
  }

  // The shield in its own units: 3.24 wide, from y = 2.0 (the small peak at the top) down to y = -2.2 (the point).
  var W = 3.24, TOP = 2.0, BOT = -2.2, H = TOP - BOT, MID = (TOP + BOT) / 2;
  // The outline, shrunk by k around its middle: a gentle peak, shoulders, straight sides, a pointed base.
  function shieldShape(T, k) {
    var s = new T.Shape(), x = function (v) { return v * k; }, y = function (v) { return (v - MID) * k + MID; };
    s.moveTo(x(0), y(2.0));
    s.quadraticCurveTo(x(0.8), y(1.74), x(1.62), y(1.7));
    s.lineTo(x(1.62), y(0.3));
    s.bezierCurveTo(x(1.62), y(-0.95), x(0.85), y(-1.75), x(0), y(-2.2));
    s.bezierCurveTo(x(-0.85), y(-1.75), x(-1.62), y(-0.95), x(-1.62), y(0.3));
    s.lineTo(x(-1.62), y(1.7));
    s.quadraticCurveTo(x(-0.8), y(1.74), x(0), y(2.0));
    return s;
  }

  // Lettering is drawn on a picture that covers the whole shield, so positions below are in shield units.
  var CW = 1024, U = CW / W, CH = Math.round(H * U);
  var X = function (v) { return (v + W / 2) * U; }, Y = function (v) { return (TOP - v) * U; };
  var SORA = "'Sora Variable', Sora, 'Sora Fallback', Arial, sans-serif", INTER = "'Inter Variable', Inter, 'Inter Fallback', Arial, sans-serif";

  // One line of gold letters, sized to be exactly `wide` shield units across, centred on (0, y).
  function goldText(g, txt, y, wide, weight, family, track) {
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if ('letterSpacing' in g) g.letterSpacing = '0px';
    g.font = weight + ' 100px ' + family;
    var px = 100 * (wide * U) / (g.measureText(txt).width + track * txt.length * 100);
    g.font = weight + ' ' + px + 'px ' + family;
    if ('letterSpacing' in g) g.letterSpacing = (track * px) + 'px';
    var m = g.measureText(txt), up = m.actualBoundingBoxAscent || px * 0.72, cy = Y(y), base = cy + up / 2, cx = X(0) + track * px / 2;
    g.fillStyle = 'rgba(10,0,24,.55)'; g.fillText(txt, cx + px * 0.012, base + px * 0.03); // a soft shadow, so the letters look pressed in gold
    var gr = g.createLinearGradient(0, base - up, 0, base);
    gr.addColorStop(0, '#fff6d2'); gr.addColorStop(0.38, '#f6c758'); gr.addColorStop(0.62, '#d79a25'); gr.addColorStop(1, '#f8d98a');
    g.fillStyle = gr; g.fillText(txt, cx, base);
    return up / U;
  }
  function star(g, x, y, r) {
    g.beginPath();
    for (var i = 0; i < 10; i++) { var q = (i % 2 ? r * 0.44 : r) * U, a = -Math.PI / 2 + i * Math.PI / 5; g[i ? 'lineTo' : 'moveTo'](X(x) + Math.cos(a) * q, Y(y) + Math.sin(a) * q); }
    g.closePath(); var gr = g.createLinearGradient(0, Y(y + r), 0, Y(y - r)); gr.addColorStop(0, '#fff3c4'); gr.addColorStop(1, '#d99c27'); g.fillStyle = gr; g.fill();
  }
  // A thin gold rule with a small diamond in the middle.
  function rule(g, y, half) {
    var gr = g.createLinearGradient(X(-half), 0, X(half), 0);
    gr.addColorStop(0, 'rgba(246,199,88,0)'); gr.addColorStop(0.25, '#f6c758'); gr.addColorStop(0.75, '#f6c758'); gr.addColorStop(1, 'rgba(246,199,88,0)');
    g.fillStyle = gr; g.fillRect(X(-half), Y(y) - 1.5, half * 2 * U, 3);
    g.save(); g.translate(X(0), Y(y)); g.rotate(Math.PI / 4); g.fillStyle = '#ffe29a'; g.fillRect(-7, -7, 14, 14); g.restore();
  }
  function stars(g) { star(g, -0.5, 1.2, 0.085); star(g, 0, 1.27, 0.12); star(g, 0.5, 1.2, 0.085); }
  function drawFront(g) {
    stars(g); // the raised tick sits between the stars and the words
    goldText(g, '100%', -0.52, 1.72, 800, SORA, -0.02);
    rule(g, -0.93, 0.62);
    goldText(g, 'MONEY BACK', -1.17, 1.3, 700, INTER, 0.14);
  }
  function drawBack(g) {
    stars(g);
    goldText(g, 'GOOGLE', 0.78, 0.86, 700, INTER, 0.3);
    goldText(g, 'TOP 50', 0.3, 1.9, 800, SORA, -0.01);
    goldText(g, 'IN YOUR FIRST MONTH', -0.14, 1.9, 700, INTER, 0.12);
    rule(g, -0.42, 0.7);
    goldText(g, 'OR THAT MONTH', -0.68, 1.38, 600, INTER, 0.14);
    goldText(g, 'REFUNDED', -1.02, 1.42, 800, SORA, 0.02);
    goldText(g, 'IN FULL', -1.33, 0.62, 700, INTER, 0.18);
  }

  function start(T) {
    var w = box.clientWidth, h = box.clientHeight, renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    box.classList.add('on');
    box.appendChild(renderer.domElement);
    var hint = document.createElement('span'); hint.className = 'pmhint'; hint.textContent = 'Drag to turn'; box.appendChild(hint);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(30, w / h, 0.1, 100); cam.position.set(0, 0, 11.8);
    var aniso = renderer.capabilities.getMaxAnisotropy();

    // The room the gold reflects, painted as one wide picture: dark, with bright soft bands of light. The dark parts
    // matter as much as the bright ones, because polished gold only looks polished when it has contrast to reflect.
    var rc = document.createElement('canvas'); rc.width = 1024; rc.height = 512; var rgx = rc.getContext('2d');
    var sky = rgx.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, '#fffaf0'); sky.addColorStop(0.14, '#ffe9bd'); sky.addColorStop(0.3, '#5a330f'); sky.addColorStop(0.42, '#b98a45'); sky.addColorStop(0.5, '#e8c887'); sky.addColorStop(0.58, '#a87a38'); sky.addColorStop(0.72, '#3a1f08'); sky.addColorStop(0.86, '#e9a94a'); sky.addColorStop(1, '#ffd27a');
    rgx.fillStyle = sky; rgx.fillRect(0, 0, 1024, 512);
    [[0.06, 26, 1], [0.2, 60, 0.9], [0.31, 16, 0.8], [0.44, 46, 1], [0.56, 22, 0.85], [0.69, 64, 0.95], [0.81, 18, 0.8], [0.93, 40, 1]].forEach(function (b) { // tall soft boxes all the way round, so both sides shine
      var x = b[0] * 1024, g2 = rgx.createLinearGradient(x - b[1], 0, x + b[1], 0);
      g2.addColorStop(0, 'rgba(255,244,214,0)'); g2.addColorStop(0.5, 'rgba(255,248,228,' + b[2] + ')'); g2.addColorStop(1, 'rgba(255,244,214,0)');
      rgx.fillStyle = g2; rgx.fillRect(x - b[1], 60, b[1] * 2, 392);
    });
    var room = new T.CanvasTexture(rc); room.encoding = T.sRGBEncoding; room.mapping = T.EquirectangularReflectionMapping;
    var pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(room).texture; pm.dispose(); room.dispose();

    scene.add(new T.AmbientLight(0xffffff, 0.12));
    var key = new T.DirectionalLight(0xfff4dc, 0.9); key.position.set(4, 5, 8); scene.add(key);
    var sweep = new T.PointLight(0xfff2cf, 0, 9); scene.add(sweep); // the band of light that crosses the shield

    // Gold whose own colour runs from pale to deep across the shield, so even its flat faces have a sheen.
    var gc = document.createElement('canvas'); gc.width = gc.height = 256; var gg = gc.getContext('2d'), gl = gg.createLinearGradient(0, 0, 256, 256);
    gl.addColorStop(0, '#fff0b8'); gl.addColorStop(0.28, '#f7bd45'); gl.addColorStop(0.5, '#ffe08a'); gl.addColorStop(0.72, '#d9941f'); gl.addColorStop(1, '#ffd166');
    gg.fillStyle = gl; gg.fillRect(0, 0, 256, 256);
    var gt = new T.CanvasTexture(gc); gt.encoding = T.sRGBEncoding; gt.repeat.set(1 / W, 1 / H); gt.offset.set(0.5, -BOT / H);
    var gold = new T.MeshStandardMaterial({ map: gt, metalness: 1, roughness: 0.16, envMapIntensity: 1.55 });
    var goldEdge = new T.MeshStandardMaterial({ color: 0xe3a52e, metalness: 1, roughness: 0.26, envMapIntensity: 1.6 });

    // The enamel: deep purple, lighter in the middle, with a fine engraved sunburst and rings under a clear coat.
    var ec = document.createElement('canvas'); ec.width = CW; ec.height = CH; var eg = ec.getContext('2d'), cx = X(0), cy = Y(0.1);
    var rg = eg.createRadialGradient(cx, cy, 0, cx, cy, CH * 0.62); rg.addColorStop(0, '#4a1186'); rg.addColorStop(0.55, '#2a0652'); rg.addColorStop(1, '#12021f');
    eg.fillStyle = rg; eg.fillRect(0, 0, CW, CH);
    eg.strokeStyle = 'rgba(214,170,255,.07)'; eg.lineWidth = 1.5;
    for (var i = 0; i < 96; i++) { var a = i * Math.PI / 48; eg.beginPath(); eg.moveTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40); eg.lineTo(cx + Math.cos(a) * CH, cy + Math.sin(a) * CH); eg.stroke(); }
    eg.strokeStyle = 'rgba(214,170,255,.05)';
    for (i = 1; i < 22; i++) { eg.beginPath(); eg.arc(cx, cy, i * 34, 0, Math.PI * 2); eg.stroke(); }
    var et = new T.CanvasTexture(ec); et.encoding = T.sRGBEncoding; et.anisotropy = aniso;
    et.repeat.set(1 / W, 1 / H); et.offset.set(0.5, -BOT / H); // flat shapes use their x and y as picture positions
    var enamelMat = new T.MeshPhysicalMaterial({ map: et, metalness: 0, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.28 });

    var holder = new T.Group(); scene.add(holder);
    var ex = function (shape, depth, bevel) { var g = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 10, curveSegments: 72 }); g.translate(0, 0, -depth / 2); return g; };

    // The body: one solid gold slab. Each side then gets its frame, enamel, a fine inner line and its lettering.
    holder.add(new T.Mesh(ex(shieldShape(T, 0.985), 0.3, 0.06), goldEdge)); // faces at z = +-0.21
    var plates = [];
    function face(draw) {
      var G = new T.Group();
      var rim = shieldShape(T, 0.945); rim.holes.push(shieldShape(T, 0.885)); // narrow, so the frame is nearly all rounded edge and catches the lights
      var r = new T.Mesh(new T.ExtrudeGeometry(rim, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.085, bevelSize: 0.042, bevelSegments: 14, curveSegments: 72 }), gold); r.position.z = 0.215; G.add(r);
      var en = new T.Mesh(new T.ShapeGeometry(shieldShape(T, 0.91), 72), enamelMat); en.position.z = 0.214; G.add(en);
      var line = shieldShape(T, 0.8); line.holes.push(shieldShape(T, 0.789));
      var ln = new T.Mesh(new T.ShapeGeometry(line, 72), gold); ln.position.z = 0.218; G.add(ln);
      var c = document.createElement('canvas'); c.width = CW; c.height = CH;
      var tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = aniso;
      var pl = new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.32, envMapIntensity: 1.2, transparent: true, depthWrite: false }));
      pl.position.set(0, MID, 0.222); G.add(pl);
      plates.push({ c: c, tex: tex, draw: draw });
      holder.add(G); return G;
    }
    var front = face(drawFront), back = face(drawBack); back.rotation.y = Math.PI;
    function letters() { plates.forEach(function (p) { var g = p.c.getContext('2d'); g.clearRect(0, 0, CW, CH); p.draw(g); p.tex.needsUpdate = true; }); }
    letters();
    // The site's own fonts may still be on their way: draw the words again once they are here.
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("800 80px 'Sora Variable'"), document.fonts.load("700 40px 'Inter Variable'"), document.fonts.load("600 40px 'Inter Variable'")]).then(function () { letters(); kick(); }, function () {});

    // the raised tick, on the front only
    var tick = new T.Shape([[-0.98, 0.08], [-0.28, -0.62], [1.02, 0.68], [0.74, 0.96], [-0.28, -0.06], [-0.7, 0.36]].map(function (p) { return new T.Vector2(p[0] * 0.56, p[1] * 0.56); }));
    var tk = new T.Mesh(ex(tick, 0.07, 0.04), gold); tk.position.set(-0.01, 0.36, 0.28); front.add(tk);

    // Behind the shield: a soft halo, slow light rays and a fine gold seal ring with tick marks.
    var glowTex = function (draw) { var c = document.createElement('canvas'); c.width = c.height = 1024; draw(c.getContext('2d')); var t = new T.CanvasTexture(c); t.anisotropy = aniso; return t; };
    var flat = function (size, z, tex, op) { var m = new T.Mesh(new T.PlaneGeometry(size, size), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: op })); m.position.z = z; scene.add(m); return m; };
    var halo = flat(6.6, -1.6, glowTex(function (g) { var r = g.createRadialGradient(512, 512, 0, 512, 512, 512); r.addColorStop(0, 'rgba(255,214,120,.5)'); r.addColorStop(0.4, 'rgba(190,110,255,.2)'); r.addColorStop(1, 'rgba(120,40,200,0)'); g.fillStyle = r; g.fillRect(0, 0, 1024, 1024); }), 1);
    var rays = flat(7.4, -2, glowTex(function (g) {
      g.translate(512, 512);
      for (var i = 0; i < 24; i++) { g.rotate(Math.PI * 2 / 24); var lg = g.createLinearGradient(0, 0, 0, 512); lg.addColorStop(0, 'rgba(255,225,150,.3)'); lg.addColorStop(1, 'rgba(255,225,150,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(0, 0); g.lineTo(-18 - (i % 3) * 10, 512); g.lineTo(18 + (i % 3) * 10, 512); g.fill(); }
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-in';
      var f = g.createRadialGradient(512, 512, 0, 512, 512, 512); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(0.5, 'rgba(0,0,0,.55)'); f.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = f; g.fillRect(0, 0, 1024, 1024);
    }), 0.5);
    var seal = flat(5.9, -0.9, glowTex(function (g) {
      g.translate(512, 512); g.strokeStyle = 'rgba(255,214,130,.85)';
      g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 496, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 462, 0, Math.PI * 2); g.stroke();
      for (var i = 0; i < 120; i++) { g.rotate(Math.PI / 60); g.lineWidth = i % 5 ? 1.5 : 3; g.beginPath(); g.moveTo(0, i % 5 ? 470 : 466); g.lineTo(0, 488); g.stroke(); }
    }), 0.5);

    // Sparkles: soft round dots in three groups that twinkle at different times, drifting around the shield.
    var sc = document.createElement('canvas'); sc.width = sc.height = 64; var sg = sc.getContext('2d'), sr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    sr.addColorStop(0, 'rgba(255,255,255,1)'); sr.addColorStop(0.25, 'rgba(255,230,160,.9)'); sr.addColorStop(1, 'rgba(255,200,90,0)');
    sg.fillStyle = sr; sg.fillRect(0, 0, 64, 64);
    var dotTex = new T.CanvasTexture(sc), groups = [];
    [[0xffe08a, 0.15, 60], [0xffffff, 0.1, 44], [0xc89bff, 0.12, 36]].forEach(function (c, gi) {
      var n = c[2], pos = new Float32Array(n * 3), seed = [];
      for (var j = 0; j < n; j++) seed.push([Math.random() * Math.PI * 2, 2.3 + Math.random() * 0.95, (Math.random() - 0.5) * 4.8, 0.06 + Math.random() * 0.2]);
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      var mat = new T.PointsMaterial({ color: c[0], size: c[1] * 2.2, map: dotTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.9 });
      scene.add(new T.Points(geo, mat)); groups.push({ pos: pos, seed: seed, geo: geo, mat: mat, ph: gi * 2.1 });
    });

    // Turning. `rot` is the shield's own turn; `goal` is the side it is settling on (a whole number of half turns).
    var mx = 0, my = 0, tx = 0, ty = 0, rot = 0, vel = 0, goal = 0, drag = false, lastX = 0, moved = 0, touched = -100, flipAt = 9, awake = 0;
    var t0 = performance.now(), now = function () { return (performance.now() - t0) / 1000; };
    box.addEventListener('pointerdown', function (e) {
      drag = true; lastX = e.clientX; moved = 0; vel = 0; box.classList.add('grab');
      try { box.setPointerCapture(e.pointerId); } catch (x) {}
      kick();
    });
    box.addEventListener('pointermove', function (e) {
      var b = box.getBoundingClientRect();
      if (drag) { var dx = e.clientX - lastX; lastX = e.clientX; rot += dx * 0.011; vel = dx * 0.011; moved += Math.abs(dx); tx = ty = 0; kick(); return; }
      tx = (e.clientX - b.left) / b.width - 0.5; ty = (e.clientY - b.top) / b.height - 0.5;
    });
    function drop() {
      if (!drag) return;
      drag = false; box.classList.remove('grab'); touched = now();
      // a tap flips it; a drag settles on the nearest side, carried a little by how fast it was moving
      goal = moved < 6 ? goal + Math.PI : Math.round((rot + vel * 9) / Math.PI) * Math.PI;
      box.classList.add('used'); kick();
    }
    box.addEventListener('pointerup', drop); box.addEventListener('pointercancel', drop);
    box.addEventListener('pointerleave', function () { tx = ty = 0; });

    var run = false, raf = 0, seen = false, live = still ? 0 : 1;
    function draw(t) {
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      if (!drag) {
        if (live && t > flipAt && t - touched > 14) { goal += Math.PI; flipAt = t + 9; } // flips by itself, unless someone just turned it
        rot += (goal - rot) * 0.07;
      }
      holder.rotation.y = rot + (drag ? 0 : Math.sin(t * 0.55) * 0.26 * live + mx * 0.35);
      holder.rotation.x = Math.sin(t * 0.4) * 0.05 * live - my * 0.3;
      holder.position.y = Math.sin(t * 1.1) * 0.07 * live;
      rays.rotation.z = t * 0.05 * live; seal.rotation.z = -t * 0.04 * live; halo.material.opacity = 0.85 + Math.sin(t * 1.3) * 0.15 * live;
      // every 6 seconds a band of light crosses the shield from left to right
      var c = (t % 6) / 1.6; sweep.intensity = live && c < 1 ? Math.sin(c * Math.PI) * 2.4 : 0; sweep.position.set(-3 + c * 6, 1.2 - c * 1.4, 2.4);
      groups.forEach(function (G) {
        for (var j = 0; j < G.seed.length; j++) { var s = G.seed[j], a = s[0] + t * s[3] * live; G.pos[j * 3] = Math.cos(a) * s[1]; G.pos[j * 3 + 2] = Math.sin(a) * s[1] * 0.45 - 0.9; G.pos[j * 3 + 1] = s[2] + Math.sin(t * 0.7 * live + j) * 0.1; }
        G.geo.attributes.position.needsUpdate = true; G.mat.opacity = live ? 0.3 + 0.6 * Math.max(0, Math.sin(t * 1.6 + G.ph)) : 0.6;
      });
      renderer.render(scene, cam);
    }
    function frame() {
      var t = now(); draw(t);
      run = seen && (!still || t < awake);
      if (run) raf = requestAnimationFrame(frame);
    }
    // Start drawing (again). With less motion asked for, it only draws for a moment after a touch, until it has settled.
    function kick() { awake = now() + 2.5; if (seen && !run) { run = true; raf = requestAnimationFrame(frame); } }
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) kick(); else { run = false; cancelAnimationFrame(raf); } }).observe(box);
    window.addEventListener('resize', function () {
      var w2 = box.clientWidth, h2 = box.clientHeight; if (!w2 || !h2) return;
      renderer.setSize(w2, h2); cam.aspect = w2 / h2; cam.updateProjectionMatrix(); if (!run) renderer.render(scene, cam);
    });
    seen = true; kick();
  }

  new IntersectionObserver(function (es, io) {
    if (!es[0].isIntersecting || started) return;
    started = true; io.disconnect();
    three().then(start).catch(function (e) { if (window.console) console.warn('promise3d', e); });
  }, { rootMargin: '300px' }).observe(box);
})();
