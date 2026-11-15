/* Money-back promise coin (Suhen 2026-11-15, redone the same day: "looks weird, redo and enhance").
   A real gold coin: a raised rim, a ridged edge, "100%" and "MONEY BACK" stamped upright on the front, the SEOXpert
   icon on the back, polished gold reflections from a small built-in light studio, a soft glow and twinkling sparkles.
   three.js loads only when the section is near the screen, the scene pauses when it scrolls away, and people who
   ask for less motion get a still coin. Without WebGL the CSS coin stays. */
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

  var S = 1024; // face drawing size
  function canvas() { var c = document.createElement('canvas'); c.width = c.height = S; return c; }

  /* One coin face, drawn twice: a colour picture and a height picture (white = raised) for the stamped look. */
  function faceMaps(T, drawStamp, ready) {
    var col = canvas(), hgt = canvas(), g = col.getContext('2d'), h = hgt.getContext('2d'), m = S / 2;
    // colour: warm gold with a soft sheen across it
    var r = g.createRadialGradient(m * 0.7, m * 0.6, 20, m, m, m);
    r.addColorStop(0, '#ffe9a8'); r.addColorStop(0.5, '#f0bd45'); r.addColorStop(1, '#c48a16');
    g.fillStyle = r; g.fillRect(0, 0, S, S);
    // fine brushed rings, like a minted coin
    for (var i = 0; i < 90; i++) { g.strokeStyle = 'rgba(' + (i % 2 ? '255,240,200' : '120,70,0') + ',0.05)'; g.lineWidth = 2; g.beginPath(); g.arc(m, m, 60 + i * 4.2, 0, Math.PI * 2); g.stroke(); }
    // height: flat field, an inner bead ring, and the stamp
    h.fillStyle = '#404040'; h.fillRect(0, 0, S, S);
    h.strokeStyle = '#d0d0d0'; h.lineWidth = 10; h.beginPath(); h.arc(m, m, m * 0.86, 0, Math.PI * 2); h.stroke();
    for (var k = 0; k < 72; k++) { var a = k / 72 * Math.PI * 2; h.fillStyle = '#e0e0e0'; h.beginPath(); h.arc(m + Math.cos(a) * m * 0.79, m + Math.sin(a) * m * 0.79, 7, 0, Math.PI * 2); h.fill(); }
    g.strokeStyle = 'rgba(255,248,220,.55)'; g.lineWidth = 8; g.beginPath(); g.arc(m, m, m * 0.86, 0, Math.PI * 2); g.stroke();
    for (k = 0; k < 72; k++) { a = k / 72 * Math.PI * 2; g.fillStyle = 'rgba(255,236,170,.75)'; g.beginPath(); g.arc(m + Math.cos(a) * m * 0.79, m + Math.sin(a) * m * 0.79, 6, 0, Math.PI * 2); g.fill(); }
    var map = new T.CanvasTexture(col), bump = new T.CanvasTexture(hgt);
    map.encoding = T.sRGBEncoding; map.anisotropy = 8;
    drawStamp(g, h, function () { map.needsUpdate = true; bump.needsUpdate = true; if (ready) ready(); });
    return { map: map, bump: bump };
  }

  // Text stamped into the face: a dark shadow, a bright top edge and the gold letters, plus white in the height map.
  function stampText(g, h, txt, font, y, spacing) {
    [g, h].forEach(function (c) { c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = font; if ('letterSpacing' in c) c.letterSpacing = spacing || '0px'; });
    var m = S / 2;
    g.fillStyle = 'rgba(90,45,0,.55)'; g.fillText(txt, m + 5, y + 7);
    g.fillStyle = 'rgba(255,250,225,.9)'; g.fillText(txt, m - 3, y - 4);
    var lg = g.createLinearGradient(0, y - 90, 0, y + 90); lg.addColorStop(0, '#fff0b8'); lg.addColorStop(0.5, '#e6a92c'); lg.addColorStop(1, '#a86a06');
    g.fillStyle = lg; g.fillText(txt, m, y);
    h.fillStyle = '#ffffff'; h.fillText(txt, m, y);
  }

  function start(T) {
    var w = box.clientWidth, h = box.clientHeight;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    box.classList.add('on');
    box.appendChild(renderer.domElement);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(30, w / h, 0.1, 100); cam.position.set(0, 0, 11);

    // A small light studio, turned into reflections, so the gold looks polished from every angle.
    var studio = new T.Scene(), bright = function (c, x, y, z, sx, sy) { var p = new T.Mesh(new T.PlaneGeometry(sx, sy), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); p.position.set(x, y, z); p.lookAt(0, 0, 0); studio.add(p); };
    studio.background = new T.Color(0x1a0b2a);
    bright(0xffffff, 0, 6, 4, 8, 3); bright(0xfff1d0, 6, 2, 2, 3, 6); bright(0x9a5ad8, -6, -1, 2, 2, 3); bright(0xffe0a0, 0, -6, 3, 8, 2); bright(0xffffff, -3, 3, -6, 4, 4);
    var pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(studio, 0.04).texture; pm.dispose();

    scene.add(new T.AmbientLight(0xffffff, 0.25));
    var key = new T.DirectionalLight(0xfff4dc, 1.6); key.position.set(4, 5, 7); scene.add(key);
    var rim = new T.PointLight(0xffc977, 1.6, 18); rim.position.set(-5, -2, 2); scene.add(rim);

    var R = 2, TH = 0.32, gold = { color: 0xe9b23a, metalness: 1, roughness: 0.3, envMapIntensity: 1.25 };
    var holder = new T.Group(); scene.add(holder);

    // The rim and ridged edge: a turned profile (lathe) around the coin, then fine ridges on the side.
    var prof = [[R * 0.86, -TH * 0.36], [R * 0.9, -TH * 0.5], [R - 0.05, -TH * 0.5], [R, -TH * 0.42], [R, TH * 0.42], [R - 0.05, TH * 0.5], [R * 0.9, TH * 0.5], [R * 0.86, TH * 0.36]].map(function (p) { return new T.Vector2(p[0], p[1]); });
    var rimGeo = new T.LatheGeometry(prof, 160); rimGeo.rotateX(Math.PI / 2);
    holder.add(new T.Mesh(rimGeo, new T.MeshStandardMaterial(gold)));
    var ridges = new T.InstancedMesh(new T.BoxGeometry(0.03, 0.05, TH * 0.78), new T.MeshStandardMaterial({ color: 0xd9a227, metalness: 1, roughness: 0.35 }), 140), dm = new T.Object3D();
    for (var i = 0; i < 140; i++) { var an = i / 140 * Math.PI * 2; dm.position.set(Math.cos(an) * (R + 0.005), Math.sin(an) * (R + 0.005), 0); dm.rotation.set(0, 0, an); dm.updateMatrix(); ridges.setMatrixAt(i, dm.matrix); }
    holder.add(ridges);

    // Front and back faces: flat discs inside the rim, each with its own upright picture.
    var faceGeo = new T.CircleGeometry(R * 0.87, 128);
    var front = faceMaps(T, function (g, hh, done) {
      stampText(g, hh, '100%', '800 290px Sora, Arial Black, Arial, sans-serif', S / 2 - 40, '-6px');
      stampText(g, hh, 'MONEY BACK', '700 78px Inter, Arial, sans-serif', S / 2 + 175, '10px');
      done();
    });
    var back = faceMaps(T, function (g, hh, done) {
      var img = new Image();
      img.onload = function () { var s = 420, o = (S - s) / 2; g.globalAlpha = 0.95; g.drawImage(img, o, o, s, s); g.globalAlpha = 1; hh.drawImage(img, o, o, s, s); done(); };
      img.src = '/favicon.svg';
    });
    var fm = function (f) { return new T.MeshStandardMaterial({ map: f.map, bumpMap: f.bump, bumpScale: 0.045, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.1 }); };
    var fFront = new T.Mesh(faceGeo, fm(front)); fFront.position.z = TH * 0.36; holder.add(fFront);
    var fBack = new T.Mesh(faceGeo, fm(back)); fBack.position.z = -TH * 0.36; fBack.rotation.y = Math.PI; holder.add(fBack);

    // The soft glow behind the coin is CSS (.pm3d.on::before in page.css), so it never shows as a square.

    // Sparkles: soft round dots in three groups that twinkle at different times, drifting around the coin.
    var sc = document.createElement('canvas'); sc.width = sc.height = 64; var sg = sc.getContext('2d'), sr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    sr.addColorStop(0, 'rgba(255,255,255,1)'); sr.addColorStop(0.25, 'rgba(255,230,160,.9)'); sr.addColorStop(1, 'rgba(255,200,90,0)');
    sg.fillStyle = sr; sg.fillRect(0, 0, 64, 64);
    var dotTex = new T.CanvasTexture(sc), groups = [];
    [[0xffe08a, 0.16, 90], [0xffffff, 0.11, 70], [0xc89bff, 0.13, 60]].forEach(function (c, gi) {
      var n = c[2], pos = new Float32Array(n * 3), seed = [];
      for (var j = 0; j < n; j++) { var a = Math.random() * Math.PI * 2, rr = 2.5 + Math.random() * 1.9, y = (Math.random() - 0.5) * 4.4; seed.push([a, rr, y, 0.08 + Math.random() * 0.22]); }
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      var mat = new T.PointsMaterial({ color: c[0], size: c[1] * 2.2, map: dotTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.9 });
      var pts = new T.Points(geo, mat); scene.add(pts); groups.push({ pos: pos, seed: seed, geo: geo, mat: mat, ph: gi * 2.1 });
    });

    var mx = 0, my = 0, tx = 0, ty = 0;
    box.addEventListener('pointermove', function (e) { var b = box.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - 0.5; ty = (e.clientY - b.top) / b.height - 0.5; });
    box.addEventListener('pointerleave', function () { tx = ty = 0; });

    var t0 = performance.now(), run = false, raf = 0;
    function frame(now) {
      var t = (now - t0) / 1000;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      // Show the front, turn once to the back and on round to the front again, then rest: 9 seconds a cycle.
      var c = t % 9, turn = c < 4 ? 0 : c < 6.2 ? (c - 4) / 2.2 : 1, e = turn * turn * (3 - 2 * turn);
      holder.rotation.y = e * Math.PI * 2 + Math.sin(t * 0.6) * 0.18 + mx * 0.7;
      holder.rotation.x = Math.sin(t * 0.5) * 0.08 - my * 0.5;
      holder.position.y = Math.sin(t * 1.1) * 0.12;
      groups.forEach(function (G) {
        for (var j = 0; j < G.seed.length; j++) { var s = G.seed[j], a = s[0] + t * s[3]; G.pos[j * 3] = Math.cos(a) * s[1]; G.pos[j * 3 + 2] = Math.sin(a) * s[1] * 0.45 - 0.6; G.pos[j * 3 + 1] = s[2] + Math.sin(t * 0.7 + j) * 0.1; }
        G.geo.attributes.position.needsUpdate = true; G.mat.opacity = 0.35 + 0.6 * Math.max(0, Math.sin(t * 1.6 + G.ph));
      });
      renderer.render(scene, cam);
      if (run) raf = requestAnimationFrame(frame);
    }
    function play(on) {
      if (still) { holder.rotation.set(-0.08, 0.25, 0); setTimeout(function () { frame(t0); }, 50); setTimeout(function () { frame(t0); }, 600); return; }
      if (on && !run) { run = true; raf = requestAnimationFrame(frame); }
      if (!on) { run = false; cancelAnimationFrame(raf); }
    }
    if (still) frame = (function (f) { return function () { renderer.render(scene, cam); }; })(frame);
    new IntersectionObserver(function (es) { play(es[0].isIntersecting); }).observe(box);
    window.addEventListener('resize', function () {
      var W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
      renderer.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix(); if (!run) renderer.render(scene, cam);
    });
    play(true);
  }

  new IntersectionObserver(function (es, io) {
    if (!es[0].isIntersecting || started) return;
    started = true; io.disconnect();
    three().then(start).catch(function () {});
  }, { rootMargin: '300px' }).observe(box);
})();
