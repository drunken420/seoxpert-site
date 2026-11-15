/* Money-back promise coin (Suhen 2026-11-15): a gold 3D coin that turns, with sparkles around it, beside the
   promise on the SEO services page. three.js loads only when the section is near the screen, the scene pauses
   when it scrolls away, and people who ask for less motion get a still coin. Without WebGL the CSS coin stays. */
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

  // The coin faces are drawn on a canvas: "100%" on the front, the SEOXpert icon on the back.
  function face(T, draw) {
    var c = document.createElement('canvas'); c.width = c.height = 512;
    var g = c.getContext('2d');
    var r = g.createRadialGradient(190, 170, 30, 256, 256, 280);
    r.addColorStop(0, '#fff3c4'); r.addColorStop(0.45, '#f2c14e'); r.addColorStop(1, '#b97a0c');
    g.fillStyle = r; g.fillRect(0, 0, 512, 512);
    g.lineWidth = 14; g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(256, 256, 236, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; g.strokeStyle = 'rgba(120,70,0,.35)'; g.beginPath(); g.arc(256, 256, 214, 0, Math.PI * 2); g.stroke();
    var tex = new T.CanvasTexture(c);
    draw(g, function () { tex.needsUpdate = true; });
    return tex;
  }

  function start(T) {
    var w = box.clientWidth, h = box.clientHeight;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.outputEncoding = T.sRGBEncoding;
    box.classList.add('on');
    box.appendChild(renderer.domElement);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(35, w / h, 0.1, 100); cam.position.set(0, 0, 9);

    scene.add(new T.AmbientLight(0xffffff, 0.55));
    var key = new T.DirectionalLight(0xfff1d0, 1.15); key.position.set(3, 4, 6); scene.add(key);
    var rim = new T.PointLight(0xb06cff, 2.2, 20); rim.position.set(-4, -2, 3); scene.add(rim);

    var front = face(T, function (g, done) {
      g.fillStyle = '#4a2400'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '800 150px Sora, Arial, sans-serif'; g.fillText('100%', 256, 236);
      g.font = '700 40px Inter, Arial, sans-serif'; g.fillText('MONEY BACK', 256, 340); done();
    });
    var back = face(T, function (g, done) {
      var img = new Image();
      img.onload = function () { g.drawImage(img, 136, 136, 240, 240); done(); };
      img.src = '/favicon.svg';
    });
    var edge = new T.MeshStandardMaterial({ color: 0xd9a227, metalness: 0.85, roughness: 0.32 });
    var mats = [edge, new T.MeshStandardMaterial({ map: front, metalness: 0.45, roughness: 0.4 }), new T.MeshStandardMaterial({ map: back, metalness: 0.45, roughness: 0.4 })];
    var coin = new T.Mesh(new T.CylinderGeometry(1.7, 1.7, 0.24, 96, 1), mats);
    coin.rotation.x = Math.PI / 2; // stand the coin up, front towards the camera
    var holder = new T.Group(); holder.add(coin); scene.add(holder);
    // The back face is mirrored on a cylinder: turn its texture so the icon reads the right way round.
    back.center.set(0.5, 0.5); back.rotation = Math.PI;

    // Sparkles: small gold and purple points drifting around the coin.
    var n = 140, pos = new Float32Array(n * 3), seed = [];
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, rr = 2.3 + Math.random() * 1.6, y = (Math.random() - 0.5) * 3.4;
      seed.push([a, rr, y, 0.15 + Math.random() * 0.35]);
      pos[i * 3] = Math.cos(a) * rr; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a) * rr * 0.5;
    }
    var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
    var dots = new T.Points(pg, new T.PointsMaterial({ color: 0xffd678, size: 0.07, transparent: true, opacity: 0.85, depthWrite: false }));
    scene.add(dots);

    var mx = 0, my = 0;
    box.addEventListener('pointermove', function (e) { var b = box.getBoundingClientRect(); mx = (e.clientX - b.left) / b.width - 0.5; my = (e.clientY - b.top) / b.height - 0.5; });
    box.addEventListener('pointerleave', function () { mx = my = 0; });

    var t0 = performance.now(), run = false, raf = 0;
    function frame(now) {
      var t = (now - t0) / 1000;
      // Turn, pause on each face, turn again: like the CSS coin, but in 3D.
      var turn = t % 7, ang = turn < 2.2 ? 0 : turn < 3.5 ? (turn - 2.2) / 1.3 : turn < 5.7 ? 1 : 1 + (turn - 5.7) / 1.3;
      ang = Math.floor(t / 7) * 2 + ang;
      var ease = function (x) { var f = x - Math.floor(x); return Math.floor(x) + f * f * (3 - 2 * f); };
      holder.rotation.y = ease(ang) * Math.PI + mx * 0.6;
      holder.rotation.x = -my * 0.4 + Math.sin(t * 0.8) * 0.05;
      holder.position.y = Math.sin(t * 1.2) * 0.12;
      for (var i = 0; i < n; i++) {
        var s = seed[i], a = s[0] + t * s[3];
        pos[i * 3] = Math.cos(a) * s[1]; pos[i * 3 + 2] = Math.sin(a) * s[1] * 0.5; pos[i * 3 + 1] = s[2] + Math.sin(t + i) * 0.08;
      }
      pg.attributes.position.needsUpdate = true;
      renderer.render(scene, cam);
      if (run) raf = requestAnimationFrame(frame);
    }
    function play(on) {
      if (still) { renderer.render(scene, cam); setTimeout(function () { renderer.render(scene, cam); }, 400); return; }
      if (on && !run) { run = true; raf = requestAnimationFrame(frame); }
      if (!on) { run = false; cancelAnimationFrame(raf); }
    }
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
