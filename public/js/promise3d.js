/* Money-back promise seal (Suhen 2026-11-15: the coin "needs to be redone completely from scratch").
   A 3D gold shield: a raised polished frame, deep purple enamel inside, a raised gold tick, and "100%" and
   "MONEY BACK" in gold. It sways gently, leans towards the mouse, a band of light sweeps across it now and then,
   and sparkles drift around it. three.js loads only when the section is near the screen, the scene pauses when it
   scrolls away, and people who ask for less motion get a still shield. Without WebGL the SVG shield stays. */
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

  // The shield outline: a softly curved top with a dip in the middle, straight sides, a pointed base.
  function shieldShape(T, k) {
    var s = new T.Shape(), p = function (x, y) { return [x * k, y * k]; }, a;
    a = p(0, 1.86); s.moveTo(a[0], a[1]);
    a = [p(0.5, 2.02), p(1.15, 2.05), p(1.62, 1.82)]; s.bezierCurveTo(a[0][0], a[0][1], a[1][0], a[1][1], a[2][0], a[2][1]);
    a = p(1.62, 0.35); s.lineTo(a[0], a[1]);
    a = [p(1.62, -0.95), p(0.85, -1.75), p(0, -2.2)]; s.bezierCurveTo(a[0][0], a[0][1], a[1][0], a[1][1], a[2][0], a[2][1]);
    a = [p(-0.85, -1.75), p(-1.62, -0.95), p(-1.62, 0.35)]; s.bezierCurveTo(a[0][0], a[0][1], a[1][0], a[1][1], a[2][0], a[2][1]);
    a = p(-1.62, 1.82); s.lineTo(a[0], a[1]);
    a = [p(-1.15, 2.05), p(-0.5, 2.02), p(0, 1.86)]; s.bezierCurveTo(a[0][0], a[0][1], a[1][0], a[1][1], a[2][0], a[2][1]);
    return s;
  }

  // Gold letters on a see-through picture, used as a thin gold plate on the enamel.
  function words(T) {
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    var g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 250px Sora, Arial Black, Arial, sans-serif'; if ('letterSpacing' in g) g.letterSpacing = '-6px';
    g.fillText('100%', 512, 190);
    g.font = '700 78px Inter, Arial, sans-serif'; if ('letterSpacing' in g) g.letterSpacing = '8px';
    g.fillText('MONEY BACK', 520, 410);
    var t = new T.CanvasTexture(c); t.anisotropy = 8; return t;
  }

  function start(T) {
    var w = box.clientWidth, h = box.clientHeight, renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    box.classList.add('on');
    box.appendChild(renderer.domElement);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(30, w / h, 0.1, 100); cam.position.set(0, 0, 13.2);

    // A small light studio, turned into reflections, so the gold and the enamel look polished.
    var studio = new T.Scene(), bright = function (c, x, y, z, sx, sy) { var q = new T.Mesh(new T.PlaneGeometry(sx, sy), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); q.position.set(x, y, z); q.lookAt(0, 0, 0); studio.add(q); };
    studio.background = new T.Color(0x140c04);
    bright(0xffffff, 0, 6, 4, 9, 1.2); bright(0xfff0cc, 6, 1, 3, 1, 7); bright(0xffe7b0, -6, 0, 2, 0.8, 5); bright(0xffd98a, 0, -6, 3, 8, 0.8); bright(0x6a3a10, 3, -3, 5, 3, 3); bright(0xffffff, -3, 3, -6, 4, 4);
    var pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(studio, 0.04).texture; pm.dispose();

    scene.add(new T.AmbientLight(0xffffff, 0.2));
    var key = new T.DirectionalLight(0xfff4dc, 1.4); key.position.set(4, 5, 8); scene.add(key);
    var sweep = new T.PointLight(0xfff2cf, 0, 9); scene.add(sweep); // the band of light that crosses the shield

    var gold = new T.MeshStandardMaterial({ color: 0xf2b032, metalness: 1, roughness: 0.16, envMapIntensity: 1.3 });
    var goldSoft = new T.MeshStandardMaterial({ color: 0xe0a531, metalness: 1, roughness: 0.34, envMapIntensity: 1.1 });
    var holder = new T.Group(); scene.add(holder);
    var ex = function (shape, depth, bevel) { var g = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 64 }); g.translate(0, 0, -depth / 2); return g; };

    // back plate, the raised frame (an outline with the inner shield cut out), and the enamel inside
    holder.add(new T.Mesh(ex(shieldShape(T, 1), 0.34, 0.1), goldSoft));
    var rimShape = shieldShape(T, 1); rimShape.holes.push(shieldShape(T, 0.84));
    var fr = new T.Mesh(ex(rimShape, 0.22, 0.07), gold); fr.position.z = 0.22; holder.add(fr);
    var enamel = new T.Mesh(ex(shieldShape(T, 0.85), 0.06, 0.01), new T.MeshPhysicalMaterial({ color: 0x1c0336, metalness: 0, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.32 }));
    enamel.position.z = 0.31; holder.add(enamel);
    // a fine gold line just inside the frame
    var line = shieldShape(T, 0.78); line.holes.push(shieldShape(T, 0.765));
    var ln = new T.Mesh(new T.ShapeGeometry(line, 64), gold); ln.position.z = 0.355; holder.add(ln);

    // the raised tick
    var tick = new T.Shape([[-0.98, 0.08], [-0.28, -0.62], [1.02, 0.68], [0.74, 0.96], [-0.28, -0.06], [-0.7, 0.36]].map(function (p) { return new T.Vector2(p[0] * 0.62, p[1] * 0.62); }));
    var tk = new T.Mesh(ex(tick, 0.1, 0.05), gold); tk.position.set(0, 0.58, 0.4); holder.add(tk);

    // "100%" and "MONEY BACK" as a thin gold layer on the enamel
    var wd = new T.Mesh(new T.PlaneGeometry(2.3, 1.15), new T.MeshStandardMaterial({ color: 0xf6c95a, metalness: 1, roughness: 0.25, envMapIntensity: 1.4, alphaMap: words(T), transparent: true }));
    wd.position.set(0, -0.42, 0.356); holder.add(wd);

    // three small gold stars along the top of the frame
    var star = new T.Shape(); for (var i = 0; i < 10; i++) { var r = i % 2 ? 0.05 : 0.12, an = Math.PI / 2 + i * Math.PI / 5; star[i ? 'lineTo' : 'moveTo'](Math.cos(an) * r, Math.sin(an) * r); }
    [[-0.6, 1.36], [0, 1.3], [0.6, 1.36]].forEach(function (p, j) { var m = new T.Mesh(ex(star, 0.03, 0.015), gold); m.position.set(p[0], p[1], 0.37); m.scale.setScalar(j === 1 ? 1.25 : 1); holder.add(m); });

    var glowTex = function (draw) { var c = document.createElement('canvas'); c.width = c.height = 512; draw(c.getContext('2d')); return new T.CanvasTexture(c); };
    var halo = new T.Mesh(new T.PlaneGeometry(6.4, 6.4), new T.MeshBasicMaterial({ map: glowTex(function (g) { var r = g.createRadialGradient(256, 256, 0, 256, 256, 256); r.addColorStop(0, 'rgba(255,214,120,.55)'); r.addColorStop(0.35, 'rgba(200,120,255,.22)'); r.addColorStop(1, 'rgba(120,40,200,0)'); g.fillStyle = r; g.fillRect(0, 0, 512, 512); }), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    halo.position.z = -1.6; scene.add(halo);
    var rays = new T.Mesh(new T.PlaneGeometry(7.6, 7.6), new T.MeshBasicMaterial({ map: glowTex(function (g) { g.translate(256, 256); for (var i = 0; i < 18; i++) { g.rotate(Math.PI * 2 / 18); var lg = g.createLinearGradient(0, 0, 0, 256); lg.addColorStop(0, 'rgba(255,225,150,.32)'); lg.addColorStop(1, 'rgba(255,225,150,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(0, 0); g.lineTo(-16 - (i % 3) * 6, 256); g.lineTo(16 + (i % 3) * 6, 256); g.fill(); } g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-in'; var f = g.createRadialGradient(256, 256, 0, 256, 256, 256); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(0.55, 'rgba(0,0,0,.6)'); f.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = f; g.fillRect(0, 0, 512, 512); }), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.55 }));
    rays.position.z = -2; scene.add(rays);
    var ring = new T.Mesh(new T.TorusGeometry(2.3, 0.025, 12, 200), gold); ring.rotation.set(1.3, 0, 0); ring.position.y = -1.75; scene.add(ring); // a gold orbit around the base, like a pedestal of light
    var bead = new T.Mesh(new T.SphereGeometry(0.09, 20, 20), new T.MeshBasicMaterial({ color: 0xfff1c4 })); ring.add(bead);

    // Sparkles: soft round dots in three groups that twinkle at different times, drifting around the shield.
    var sc = document.createElement('canvas'); sc.width = sc.height = 64; var sg = sc.getContext('2d'), sr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    sr.addColorStop(0, 'rgba(255,255,255,1)'); sr.addColorStop(0.25, 'rgba(255,230,160,.9)'); sr.addColorStop(1, 'rgba(255,200,90,0)');
    sg.fillStyle = sr; sg.fillRect(0, 0, 64, 64);
    var dotTex = new T.CanvasTexture(sc), groups = [];
    [[0xffe08a, 0.16, 80], [0xffffff, 0.11, 60], [0xc89bff, 0.13, 50]].forEach(function (c, gi) {
      var n = c[2], pos = new Float32Array(n * 3), seed = [];
      for (var j = 0; j < n; j++) seed.push([Math.random() * Math.PI * 2, 2.6 + Math.random() * 1.8, (Math.random() - 0.5) * 5, 0.06 + Math.random() * 0.2]);
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      var mat = new T.PointsMaterial({ color: c[0], size: c[1] * 2.2, map: dotTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.9 });
      scene.add(new T.Points(geo, mat)); groups.push({ pos: pos, seed: seed, geo: geo, mat: mat, ph: gi * 2.1 });
    });

    var mx = 0, my = 0, tx = 0, ty = 0;
    box.addEventListener('pointermove', function (e) { var b = box.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - 0.5; ty = (e.clientY - b.top) / b.height - 0.5; });
    box.addEventListener('pointerleave', function () { tx = ty = 0; });

    var t0 = performance.now(), run = false, raf = 0;
    function draw(t) {
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      holder.rotation.y = Math.sin(t * 0.55) * 0.32 + mx * 0.8;
      holder.rotation.x = Math.sin(t * 0.4) * 0.06 - my * 0.5;
      holder.position.y = Math.sin(t * 1.1) * 0.1;
      rays.rotation.z = t * 0.06; halo.material.opacity = 0.8 + Math.sin(t * 1.3) * 0.2;
      ring.rotation.z = t * 0.25; bead.position.set(Math.cos(t * 0.9) * 2.3, Math.sin(t * 0.9) * 2.3, 0);
      // every 6 seconds a band of light crosses the shield from left to right
      var c = (t % 6) / 1.6; sweep.intensity = c < 1 ? Math.sin(c * Math.PI) * 3 : 0; sweep.position.set(-3 + c * 6, 1.2 - c * 1.4, 2.2);
      groups.forEach(function (G) {
        for (var j = 0; j < G.seed.length; j++) { var s = G.seed[j], a = s[0] + t * s[3]; G.pos[j * 3] = Math.cos(a) * s[1]; G.pos[j * 3 + 2] = Math.sin(a) * s[1] * 0.45 - 0.8; G.pos[j * 3 + 1] = s[2] + Math.sin(t * 0.7 + j) * 0.1; }
        G.geo.attributes.position.needsUpdate = true; G.mat.opacity = 0.35 + 0.6 * Math.max(0, Math.sin(t * 1.6 + G.ph));
      });
      renderer.render(scene, cam);
    }
    function frame(now) { draw((now - t0) / 1000); if (run) raf = requestAnimationFrame(frame); }
    function play(on) {
      if (still) { draw(1.2); return; }
      if (on && !run) { run = true; raf = requestAnimationFrame(frame); }
      if (!on) { run = false; cancelAnimationFrame(raf); }
    }
    new IntersectionObserver(function (es) { play(es[0].isIntersecting); }).observe(box);
    window.addEventListener('resize', function () {
      var W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
      renderer.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix(); if (!run) renderer.render(scene, cam);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { wd.material.alphaMap = words(T); wd.material.needsUpdate = true; });
    play(true);
  }

  new IntersectionObserver(function (es, io) {
    if (!es[0].isIntersecting || started) return;
    started = true; io.disconnect();
    three().then(start).catch(function (e) { if (window.console) console.warn("promise3d", e); });
  }, { rootMargin: '300px' }).observe(box);
})();
