/* Money-back promise: "Rank Guard" (Suhen picked it 2026-11-16, in the website's own look: brand purple, white
   glass cards, Sora; gold only for the top 50 moment).
   A glowing purple force-field shield guards a stack of Google results. One result, the example tracked keyword,
   climbs the stack week by week (88, 71, 56, 43), crosses the gold "Top 50" line, turns gold, and the shield charges
   with a gold pulse. It is an example of how the promise is checked, never a result, and the caption says so.
   The scene sways and leans towards the mouse; on phones it tilts with the phone when allowed.
   three.js loads only when the box is near the screen, drawing pauses when it scrolls away, and people who ask for
   less motion see the finished moment, still. Without WebGL the picture inside the box stays.
   Every .pm3d box gets a scene: the big one on the SEO services page, and a small one (.pmsm) in the plan picker. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  [].forEach.call(document.querySelectorAll('.pm3d'), init);

  function init(box) {
  var small = box.classList.contains('pmsm');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false;
  var cap = box.parentNode.querySelector('[data-pm-cap]');

  function three() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (window.__pm3dThree) return window.__pm3dThree; // one download, however many scenes are on the page
    return (window.__pm3dThree = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = '/vendor/three-r128.min.js';
      s.onload = function () { ok(window.THREE); }; s.onerror = no; document.head.appendChild(s);
    }));
  }

  // Brand colours (site.css): purple #7b18c1, logo purples #9a35e8 / #6a12ad, lilac #b06cff, plum #14081f.
  var SORA = "'Sora Variable', Sora, 'Sora Fallback', Arial, sans-serif", INTER = "'Inter Variable', Inter, 'Inter Fallback', Arial, sans-serif";

  // The shield in its own units: 3.24 wide, from y = 2.0 (the peak) down to y = -2.2 (the point).
  var W = 3.24, TOP = 2.0, BOT = -2.2, H = TOP - BOT, MID = (TOP + BOT) / 2;
  // The outline as a list of drawing steps, so three.js and a 2D canvas can both draw exactly the same shield.
  var OUT = [['m', 0, 2.0], ['q', 0.8, 1.74, 1.62, 1.7], ['l', 1.62, 0.3], ['b', 1.62, -0.95, 0.85, -1.75, 0, -2.2], ['b', -0.85, -1.75, -1.62, -0.95, -1.62, 0.3], ['l', -1.62, 1.7], ['q', -0.8, 1.74, 0, 2.0]];
  function trace(o, k, fx, fy) {
    var x = function (v) { return fx(v * k); }, y = function (v) { return fy((v - MID) * k + MID); };
    OUT.forEach(function (s) {
      if (s[0] === 'm') o.moveTo(x(s[1]), y(s[2]));
      else if (s[0] === 'l') o.lineTo(x(s[1]), y(s[2]));
      else if (s[0] === 'q') o.quadraticCurveTo(x(s[1]), y(s[2]), x(s[3]), y(s[4]));
      else o.bezierCurveTo(x(s[1]), y(s[2]), x(s[3]), y(s[4]), x(s[5]), y(s[6]));
    });
  }
  // how far the glass bulges towards you at (x, y): most in the middle, less at the edges
  function dome(x, y) { var nx = x / (W / 2), ny = (y - MID) / (H / 2); return 0.62 * Math.max(0, 1 - 0.5 * nx * nx - 0.4 * ny * ny) - 0.12; }

  function start(T) {
    var w = box.clientWidth, h = box.clientHeight, renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    box.classList.add('on');
    box.appendChild(renderer.domElement);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(30, w / h, 0.1, 100); cam.position.set(0, 0.15, small ? 9.6 : 11.4);
    var aniso = renderer.capabilities.getMaxAnisotropy();
    var canvas = function (cw, ch) { var c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; };
    var texOf = function (c, srgb) { var t = new T.CanvasTexture(c); if (srgb) t.encoding = T.sRGBEncoding; t.anisotropy = aniso; return t; };
    // glow materials add light, written so they also look right over the light parts of the site
    var glow = function (m) { m.transparent = true; m.depthWrite = false; m.blending = T.AdditiveBlending; m.premultipliedAlpha = true; return m; };

    // A soft studio: a cool key light, a lilac fill from below and a warm light that wakes up for the gold moment.
    scene.add(new T.AmbientLight(0xffffff, 0.55));
    var key = new T.DirectionalLight(0xffffff, 1.1); key.position.set(3, 6, 8); scene.add(key);
    var fill = new T.PointLight(0xb06cff, 1.2, 12); fill.position.set(-2, -3, 4); scene.add(fill);
    var warm = new T.PointLight(0xffc964, 0, 7); warm.position.set(0, 0.6, 2.4); scene.add(warm);
    // a little room for the glass cards to reflect: soft white above, purple below
    var rc = canvas(256, 128), rg = rc.getContext('2d'), sky = rg.createLinearGradient(0, 0, 0, 128);
    sky.addColorStop(0, '#ffffff'); sky.addColorStop(0.45, '#efe2ff'); sky.addColorStop(0.6, '#9a35e8'); sky.addColorStop(1, '#2a0d47');
    rg.fillStyle = sky; rg.fillRect(0, 0, 256, 128);
    var room = texOf(rc, true); room.mapping = T.EquirectangularReflectionMapping;
    var pmg = new T.PMREMGenerator(renderer); scene.environment = pmg.fromEquirectangular(room).texture; pmg.dispose(); room.dispose();

    var holder = new T.Group(); scene.add(holder);

    // ---- The force field --------------------------------------------------------------------------------------
    // One picture holds three things in its colour channels: red = the hexagon net, green = the glowing rim,
    // blue = inside the shield. A small shader mixes them with the moving scan line and the pulse.
    var CW = 512, U = CW / W, CH = Math.round(H * U);
    var X = function (v) { return (v + W / 2) * U; }, Y = function (v) { return (TOP - v) * U; };
    function layer(draw) { var c = canvas(CW, CH), g = c.getContext('2d'); draw(g); return g.getImageData(0, 0, CW, CH).data; }
    function path(g, k) { g.beginPath(); trace(g, k, X, Y); g.closePath(); }
    var hexL = layer(function (g) {
      path(g, 0.97); g.clip();
      var r = 0.2 * U, hw = Math.sqrt(3) * r; g.strokeStyle = '#fff'; g.lineWidth = 2.2;
      for (var row = -1; row * r * 1.5 < CH + r; row++) for (var col = -1; col * hw < CW + hw; col++) {
        var cx = col * hw + (row % 2 ? hw / 2 : 0), cy = row * r * 1.5; g.beginPath();
        for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94); }
        g.closePath(); g.stroke();
      }
    });
    var rimL = layer(function (g) {
      g.strokeStyle = '#fff'; g.shadowColor = '#fff';
      g.lineWidth = 8; g.shadowBlur = 22; path(g, 0.985); g.stroke();
      g.lineWidth = 3; g.shadowBlur = 6; path(g, 0.985); g.stroke();
    });
    var inL = layer(function (g) { g.fillStyle = '#fff'; path(g, 1); g.fill(); });
    var fc = canvas(CW, CH), fg = fc.getContext('2d'), img = fg.createImageData(CW, CH);
    for (var p = 0; p < img.data.length; p += 4) { img.data[p] = hexL[p + 3]; img.data[p + 1] = rimL[p + 3]; img.data[p + 2] = inL[p + 3]; img.data[p + 3] = 255; }
    fg.putImageData(img, 0, 0);
    var fieldTex = texOf(fc, false);

    var uni = { map: { value: fieldTex }, time: { value: 0 }, charge: { value: 0 }, pulse: { value: -1 }, side: { value: 1 } };
    var fieldMat = glow(new T.ShaderMaterial({
      uniforms: uni, side: T.DoubleSide,
      vertexShader: 'varying vec2 vUv; varying float vF; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vF = 1.0 - abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }',
      fragmentShader: [
        'uniform sampler2D map; uniform float time, charge, pulse, side; varying vec2 vUv; varying float vF;',
        'void main(){',
        '  vec3 m = texture2D(map, vUv).rgb; if (m.b < 0.02) discard;',
        '  float scan = exp(-pow((vUv.y - fract(time * 0.16) * 1.3 + 0.15) * 9.0, 2.0));',
        '  float d = length((vUv - vec2(0.5, 0.5)) * vec2(1.0, 1.3));',
        '  float ring = pulse >= 0.0 && pulse < 1.0 ? exp(-pow((d - pulse * 0.85) * 12.0, 2.0)) * (1.0 - pulse) : 0.0;',
        '  float spark = pow(max(0.0, sin(vUv.x * 61.0 + time * 1.7) * sin(vUv.y * 47.0 - time * 1.3)), 12.0);',
        '  vec3 lilac = vec3(0.69, 0.42, 1.0), purple = vec3(0.6, 0.21, 0.91), gold = vec3(1.0, 0.8, 0.4);',
        '  vec3 net = mix(lilac, gold, charge * 0.9), edge = mix(purple, gold, charge * 0.85);',
        '  float edgeOnly = 0.18 + 1.3 * pow(vF, 1.5);',
        '  float hexA = m.r * (0.1 + 0.45 * scan + 1.4 * ring + 0.4 * spark + 0.2 * charge) * edgeOnly * side;',
        '  float rimA = m.g * (0.45 + 0.1 * sin(time * 2.4) + 0.4 * charge + ring * 0.6);',
        '  float body = m.b * (0.05 + 0.18 * pow(vF, 2.0) + 0.06 * charge) * side;',
        '  vec3 col = net * hexA + edge * rimA * 1.3 + mix(purple, gold, charge * 0.4) * body;',
        '  float a = clamp(hexA + rimA + body, 0.0, 1.0);',
        '  gl_FragColor = vec4(col, a);',
        '}'].join('\n')
    }));
    // the front of the shield bulges out like glass; the back is flat and fainter
    var fgeo = new T.PlaneGeometry(W, H, 48, 64), fp = fgeo.attributes.position;
    for (var v = 0; v < fp.count; v++) fp.setZ(v, dome(fp.getX(v), fp.getY(v) + MID));
    fgeo.computeVertexNormals();
    var front = new T.Mesh(fgeo, fieldMat); front.position.y = MID; front.renderOrder = 3; holder.add(front);
    var backMat = fieldMat.clone(); backMat.uniforms = { map: uni.map, time: uni.time, charge: uni.charge, pulse: uni.pulse, side: { value: 0.55 } };
    var back = new T.Mesh(new T.PlaneGeometry(W, H), backMat); back.position.set(0, MID, -0.95); back.renderOrder = 0; holder.add(back);

    // A bright rim line on the front edge and a fainter one on the back, with two sparks running round it.
    var pts = []; var sh = new T.Shape(); trace(sh, 0.985, function (a) { return a; }, function (a) { return a; });
    sh.getSpacedPoints(220).forEach(function (q) { pts.push(new T.Vector3(q.x, q.y, dome(q.x, q.y) * 0.25)); });
    var curve = new T.CatmullRomCurve3(pts, true);
    var rimMat = glow(new T.MeshBasicMaterial({ color: 0xe9d6ff, opacity: 0.8 }));
    holder.add(new T.Mesh(new T.TubeGeometry(curve, 260, 0.014, 6, true), rimMat));
    var rimBack = new T.Mesh(new T.TubeGeometry(curve, 200, 0.016, 5, true), glow(new T.MeshBasicMaterial({ color: 0x9a35e8, opacity: 0.6 }))); rimBack.position.z = -0.95; holder.add(rimBack);

    // soft round dot used by sparks and dust
    var dc = canvas(64, 64), dg = dc.getContext('2d'), dr = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
    dr.addColorStop(0, 'rgba(255,255,255,1)'); dr.addColorStop(0.3, 'rgba(255,255,255,.55)'); dr.addColorStop(1, 'rgba(255,255,255,0)');
    dg.fillStyle = dr; dg.fillRect(0, 0, 64, 64); var dot = texOf(dc, false);
    var runners = [0, 0.5].map(function (o) {
      var s = new T.Sprite(glow(new T.SpriteMaterial({ map: dot, color: 0xe9d6ff, opacity: 0.8 }))); s.scale.setScalar(0.13); s.userData.o = o; holder.add(s); return s;
    });

    // The brand mark on a small glass disc at the top of the shield.
    var bc = canvas(256, 256), bg = bc.getContext('2d'), badgeTex = texOf(bc, true);
    function badge(lit) {
      bg.clearRect(0, 0, 256, 256);
      var gr = bg.createRadialGradient(128, 110, 10, 128, 128, 124); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, lit ? '#ffe6a8' : '#efe2ff');
      bg.fillStyle = gr; bg.beginPath(); bg.arc(128, 128, 118, 0, Math.PI * 2); bg.fill();
      bg.lineWidth = 8; bg.strokeStyle = lit ? '#f2b544' : '#b06cff'; bg.stroke();
      if (logo.complete && logo.naturalWidth) bg.drawImage(logo, 66, 66, 124, 124);
      badgeTex.needsUpdate = true;
    }
    var logo = new Image(); logo.onload = function () { badge(false); shown.num = -1; kick(); };
    // the logo file has no size of its own, which some browsers need before they draw it on a canvas: give it one
    fetch('/favicon.svg').then(function (r) { return r.text(); }).then(function (svg) {
      logo.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="256" height="256" '));
    }).catch(function () { logo.src = '/favicon.svg'; });
    var badgeM = new T.Mesh(new T.CircleGeometry(0.25, 48), new T.MeshBasicMaterial({ map: badgeTex, transparent: true }));
    badgeM.position.set(0, 1.66, 0.4); badgeM.renderOrder = 5; holder.add(badgeM);
    var badgeGlow = new T.Sprite(glow(new T.SpriteMaterial({ map: dot, color: 0xb06cff, opacity: 0.45 }))); badgeGlow.scale.setScalar(0.8); badgeGlow.position.set(0, 1.66, 0.35); holder.add(badgeGlow);
    badge(false);

    // ---- The Google results ------------------------------------------------------------------------------------
    // A list of results like a Google page, as white cards in the site's own style: a round site icon, a purple
    // title line, a grey address line and a line of text. The example keyword's card carries our mark and its position.
    var CWd = 1.9, CHt = 0.36, R = 0.07;
    var rr = new T.Shape(); (function (s, w2, d2, r) {
      s.moveTo(-w2 + r, -d2); s.lineTo(w2 - r, -d2); s.quadraticCurveTo(w2, -d2, w2, -d2 + r); s.lineTo(w2, d2 - r); s.quadraticCurveTo(w2, d2, w2 - r, d2);
      s.lineTo(-w2 + r, d2); s.quadraticCurveTo(-w2, d2, -w2, d2 - r); s.lineTo(-w2, -d2 + r); s.quadraticCurveTo(-w2, -d2, -w2 + r, -d2);
    })(rr, CWd / 2, CHt / 2, R);
    var cardGeo = new T.ExtrudeGeometry(rr, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 8 });
    cardGeo.translate(0, 0, -0.025);
    var TW = 1024, TH = Math.round(TW * CHt / CWd);
    function face(g, mine, num, lit) {
      g.clearRect(0, 0, TW, TH);
      var bgr = g.createLinearGradient(0, 0, 0, TH);
      if (lit) { bgr.addColorStop(0, '#fff8e6'); bgr.addColorStop(1, '#ffe4a3'); } else if (mine) { bgr.addColorStop(0, '#ffffff'); bgr.addColorStop(1, '#f1e4ff'); } else { bgr.addColorStop(0, '#ffffff'); bgr.addColorStop(1, '#f5f0fb'); }
      g.fillStyle = bgr; g.fillRect(0, 0, TW, TH);
      g.lineWidth = mine ? 12 : 5; g.strokeStyle = lit ? '#f2b544' : mine ? '#7b18c1' : '#e6dcf2'; g.strokeRect(0, 0, TW, TH);
      var cy = TH / 2, ix = 64;
      g.fillStyle = mine ? (lit ? '#ffffff' : '#f1e4ff') : '#ece4f6'; g.beginPath(); g.arc(ix, cy, 34, 0, Math.PI * 2); g.fill();
      if (mine && logo.complete && logo.naturalWidth) g.drawImage(logo, ix - 22, cy - 22, 44, 44);
      var lx = 122;
      g.fillStyle = '#cdbfdd'; g.fillRect(lx, cy - 52, 170, 14);
      g.fillStyle = mine ? '#7b18c1' : '#b9a3d6'; g.fillRect(lx, cy - 20, mine ? 420 : 470 - (num % 3) * 40, 26);
      g.fillStyle = '#ddd2ea'; g.fillRect(lx, cy + 26, 560, 13);
      if (mine) {
        g.textAlign = 'right'; g.textBaseline = 'middle';
        g.font = '600 26px ' + INTER; g.fillStyle = lit ? '#9a6312' : '#786c88'; g.fillText('POSITION', TW - 44, cy - 42);
        g.font = '800 96px ' + SORA; g.fillStyle = lit ? '#b27413' : '#7b18c1'; g.fillText('#' + num, TW - 40, cy + 18);
      }
    }
    var cards = [], stack = new T.Group(); holder.add(stack);
    var sideMat = new T.MeshBasicMaterial({ color: 0xd8c6f0, toneMapped: false });
    var SLOTS = 6, GAP = 0.42, Y0 = -1.05, LINE = 2; // slots 0..5 from the bottom; the top 50 line sits above slot 2
    var slotY = function (i) { return Y0 + i * GAP + (i > LINE ? 0.14 : 0); };
    for (var c = 0; c < SLOTS; c++) {
      var mine = c === 0, cc = canvas(TW, TH), tx = texOf(cc, true); face(cc.getContext('2d'), mine, 88 - c, false); tx.needsUpdate = true;
      tx.repeat.set(1 / CWd, 1 / CHt); tx.offset.set(0.5, 0.5);
      var mat = new T.MeshBasicMaterial({ map: tx, toneMapped: false, transparent: true });
      var m = new T.Mesh(cardGeo, [mat, mine ? new T.MeshBasicMaterial({ color: 0x9a35e8, toneMapped: false }) : sideMat]); m.renderOrder = 2;
      var g = new T.Group(); g.add(m); stack.add(g);
      cards.push({ g: g, mat: mat, c: cc, tex: tx, mine: mine, slot: c });
    }
    var me = cards[0];
    // the example card has a soft glow behind it, purple while it climbs and gold once it is in the top 50
    var meGlow = new T.Mesh(new T.PlaneGeometry(CWd + 0.7, CHt + 0.7), glow(new T.MeshBasicMaterial({ map: dot, color: 0x9a35e8, opacity: 0.9 })));
    meGlow.position.z = -0.06; me.g.add(meGlow);
    stack.rotation.x = -0.12; stack.position.set(0, -0.12, 0.05);

    // The gold "Top 50" line between slot 2 and slot 3, with a tab that says TOP 50.
    var lineY = (slotY(LINE) + CHt / 2 + slotY(LINE + 1) - CHt / 2) / 2;
    var frameMat = new T.MeshBasicMaterial({ color: 0xf2b544, toneMapped: false, transparent: true });
    var line50 = new T.Mesh(new T.PlaneGeometry(CWd + 0.3, 0.03), frameMat); line50.position.set(0, lineY, 0); stack.add(line50);
    var line50b = new T.Mesh(new T.PlaneGeometry(CWd + 0.5, 0.16), glow(new T.MeshBasicMaterial({ map: dot, color: 0xffc964, opacity: 0.5 }))); line50b.position.set(0, lineY, -0.01); stack.add(line50b);
    var tc = canvas(256, 80), tg = tc.getContext('2d'), tabTex = texOf(tc, true);
    function tab() {
      tg.clearRect(0, 0, 256, 80);
      var gr = tg.createLinearGradient(0, 0, 0, 80); gr.addColorStop(0, '#ffe39a'); gr.addColorStop(1, '#f2b544');
      tg.fillStyle = gr; tg.beginPath(); tg.moveTo(40, 4); tg.arcTo(252, 4, 252, 76, 36); tg.arcTo(252, 76, 4, 76, 36); tg.arcTo(4, 76, 4, 4, 36); tg.arcTo(4, 4, 252, 4, 36); tg.fill();
      tg.fillStyle = '#3d0a66'; tg.font = '800 40px ' + SORA; tg.textAlign = 'center'; tg.textBaseline = 'middle'; tg.fillText('TOP 50', 128, 43);
      tabTex.needsUpdate = true;
    }
    tab();
    var tabM = new T.Mesh(new T.PlaneGeometry(0.56, 0.175), new T.MeshBasicMaterial({ map: tabTex, transparent: true, toneMapped: false }));
    tabM.position.set(CWd / 2 - 0.08, lineY, 0.06); tabM.renderOrder = 4; stack.add(tabM);

    // ---- Dust and sparks ---------------------------------------------------------------------------------------
    var DN = small ? 26 : 60, dpos = new Float32Array(DN * 3), dseed = [];
    for (var d = 0; d < DN; d++) dseed.push([(Math.random() - 0.5) * 6.4, (Math.random() - 0.5) * 5, -1.5 - Math.random() * 1.5, Math.random() * 6, 0.1 + Math.random() * 0.2]);
    var dgeo = new T.BufferGeometry(); dgeo.setAttribute('position', new T.BufferAttribute(dpos, 3));
    var dmat = glow(new T.PointsMaterial({ color: 0xb06cff, size: 0.14, map: dot, opacity: 0.8 })); scene.add(new T.Points(dgeo, dmat));
    // gold sparks that trail under the example card while it climbs, and burst out when it reaches the top 50
    var SN = small ? 40 : 90, spos = new Float32Array(SN * 3), sp = [];
    for (var s2 = 0; s2 < SN; s2++) sp.push({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 });
    var sgeo = new T.BufferGeometry(); sgeo.setAttribute('position', new T.BufferAttribute(spos, 3));
    var smat = glow(new T.PointsMaterial({ color: 0xffd27a, size: small ? 0.12 : 0.1, map: dot, opacity: 1 })); stack.add(new T.Points(sgeo, smat));
    var nextSpark = 0;
    function spark(x, y, z, burst) {
      var q = sp[nextSpark = (nextSpark + 1) % SN];
      q.life = 1; q.x = x + (Math.random() - 0.5) * CWd * 0.9; q.y = y; q.z = z + (Math.random() - 0.5) * 0.1;
      if (burst) { var a = Math.random() * Math.PI * 2, f = 0.8 + Math.random() * 1.6; q.vx = Math.cos(a) * f; q.vy = Math.sin(a) * f * 0.8 + 0.3; q.vz = (Math.random() - 0.3) * 0.8; }
      else { q.vx = (Math.random() - 0.5) * 0.2; q.vz = (Math.random() - 0.5) * 0.2; q.vy = -0.5 - Math.random() * 0.6; }
    }

    // ---- The story ---------------------------------------------------------------------------------------------
    // Week 1 to week 4 of the first month (an example): 88, 71, 56, 43. Each week the example card swaps places with
    // the card above it; in week 4 it crosses the Top 50 line, turns gold and the shield charges.
    var WEEKS = [88, 71, 56, 43], STEP = 1.7, HOLD = 4.2, LOOP = 1.4 + STEP * 3 + HOLD + 0.8;
    var shown = { num: -1, lit: null }, week = -1, won = false;
    function drawMine(num, lit) {
      if (shown.num === num && shown.lit === lit) return; shown.num = num; shown.lit = lit;
      face(me.c.getContext('2d'), true, num, lit); me.tex.needsUpdate = true;
    }
    function caption(k, num, done) {
      if (!cap) return;
      var key2 = k + '|' + num + '|' + done; if (cap.dataset.k === key2) return; cap.dataset.k = key2;
      cap.classList.toggle('won', !!done);
      var wk = cap.querySelector('[data-pm-week]'), ps = cap.querySelector('[data-pm-pos]');
      if (wk) wk.textContent = 'Week ' + (k + 1); if (ps) ps.textContent = num;
    }
    var ease = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    function story(t) {
      var lt = still ? 1.4 + STEP * 3 + 2 : t % LOOP, k = Math.min(3, Math.max(0, Math.floor((lt - 1.4) / STEP) + 1)), into = lt < 1.4 ? 0 : (lt - 1.4 - (k - 1) * STEP) / 1.0;
      if (lt < 1.4) k = 0;
      var fade = !still && lt > LOOP - 0.8 ? (lt - (LOOP - 0.8)) / 0.8 : 0; // everything settles back before the next round
      if (fade > 0.5) { k = 0; into = 1; } // halfway through the fade the cards are back in their first places
      // where every card sits: the example card at slot k, the cards it passed one slot lower
      var mv = k > 0 ? ease(Math.min(1, into)) : 1;
      cards.forEach(function (cd) {
        var target, fromS;
        if (cd.mine) { target = k; fromS = Math.max(0, k - 1); }
        else { target = cd.slot <= k ? cd.slot - 1 : cd.slot; fromS = cd.slot <= k - 1 ? cd.slot - 1 : cd.slot; }
        var a = slotY(k > 0 ? fromS : target), b = slotY(target), y = a + (b - a) * mv;
        var arc = Math.sin(Math.PI * mv) * (k > 0 && fromS !== target ? 1 : 0);
        cd.g.position.set(0, y, cd.mine ? 0.12 + arc * 0.45 : -arc * 0.2);
        cd.g.scale.setScalar(cd.mine ? 1.03 + arc * 0.05 : 1);
      });
      // the number counts between weeks while the card moves
      var nFrom = WEEKS[Math.max(0, k - 1)], nTo = WEEKS[k], num = Math.round(nFrom + (nTo - nFrom) * mv);
      var gotIt = k === 3 && (num <= 50 || still);
      var since = gotIt ? lt - (1.4 + STEP * 2 + 0.55) : -1; // seconds since it crossed the line
      if (still) since = 3;
      var lit = gotIt && fade < 0.5;
      drawMine(num, lit);
      if (gotIt && !won) { won = true; for (var b2 = 0; b2 < (small ? 30 : 60); b2++) spark(0, me.g.position.y + 0.05, me.g.position.z, true); }
      if (!gotIt) won = false;
      if (k !== week) week = k;
      caption(k, num, gotIt);
      // the shield charges gold and sends out a ring when the line is crossed
      var ch = since >= 0 ? Math.min(1, since / 0.5) * (1 - fade) : 0;
      uni.charge.value = ch; uni.pulse.value = since >= 0 && since < 1.6 ? since / 1.6 : -1;
      warm.intensity = ch * 2.2; meGlow.material.color.setHex(ch > 0.3 ? 0xffc964 : 0x9a35e8); meGlow.material.opacity = 0.6 + 0.4 * ch;
      frameMat.opacity = 0.75 + 0.25 * Math.max(ch, Math.sin(t * 2.2));
      rimMat.color.setRGB(0.91 + 0.09 * ch, 0.84 - 0.04 * ch, 1 - 0.45 * ch);
      if (ch > 0.5 && !badge.lit) { badge.lit = true; badge(true); } else if (ch < 0.5 && badge.lit) { badge.lit = false; badge(false); }
      badgeM.scale.setScalar(1 + (since >= 0 && since < 0.6 ? Math.sin(since / 0.6 * Math.PI) * 0.25 : 0));
      badgeGlow.material.color.setHex(ch > 0.5 ? 0xffc964 : 0xb06cff);
      cards.forEach(function (cd) { cd.mat.opacity = (fade > 0 ? Math.abs(1 - fade * 2) * 0.6 + 0.4 : 1); });
      // gold sparks trail under the example card while it climbs
      if (!still && k > 0 && mv < 1 && Math.random() < 0.7) spark(0, me.g.position.y - CHt / 2, me.g.position.z, false);
    }

    // ---- Moving -----------------------------------------------------------------------------------------------
    var mx = 0, my = 0, tx2 = 0, ty2 = 0, tilt = null;
    box.addEventListener('pointermove', function (e) { var b = box.getBoundingClientRect(); tx2 = (e.clientX - b.left) / b.width - 0.5; ty2 = (e.clientY - b.top) / b.height - 0.5; });
    box.addEventListener('pointerleave', function () { tx2 = ty2 = 0; });
    // phones lean it with the phone when the browser allows it without asking
    if (!still && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      addEventListener('deviceorientation', function (e) { if (e.gamma == null) return; if (!tilt) tilt = { g: e.gamma, b: e.beta }; tx2 = Math.max(-0.5, Math.min(0.5, (e.gamma - tilt.g) / 40)); ty2 = Math.max(-0.5, Math.min(0.5, (e.beta - tilt.b) / 50)); }, { passive: true });
    }
    var t0 = performance.now(), now = function () { return (performance.now() - t0) / 1000; }, last = 0;
    function draw(t) {
      var dt = Math.min(0.05, t - last); last = t;
      var live = still ? 0 : 1;
      mx += (tx2 - mx) * 0.05; my += (ty2 - my) * 0.05;
      holder.rotation.y = Math.sin(t * 0.35) * 0.22 * live + mx * 0.5;
      holder.rotation.x = Math.sin(t * 0.27) * 0.04 * live + my * 0.25;
      holder.position.y = Math.sin(t * 0.9) * 0.06 * live;
      uni.time.value = t;
      story(t);
      runners.forEach(function (r) { var q = curve.getPointAt(((t * 0.09 * live) + r.userData.o) % 1); r.position.set(q.x, q.y, q.z + 0.02); r.material.color.setHex(uni.charge.value > 0.5 ? 0xffe2a0 : 0xf3e6ff); });
      for (var i = 0; i < DN; i++) { var q2 = dseed[i], u = ((t * q2[4] * live + q2[3]) % 6) / 6; dpos[i * 3] = q2[0] + Math.sin(t * 0.5 + i) * 0.1; dpos[i * 3 + 1] = -2.6 + u * 5.2; dpos[i * 3 + 2] = q2[2]; }
      dgeo.attributes.position.needsUpdate = true; dmat.opacity = 0.55 + 0.25 * Math.sin(t * 1.3);
      for (var j = 0; j < SN; j++) {
        var s = sp[j];
        if (s.life > 0) { s.life -= dt * 1.1; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.vy -= dt * 1.2; }
        spos[j * 3] = s.life > 0 ? s.x : 0; spos[j * 3 + 1] = s.life > 0 ? s.y : -99; spos[j * 3 + 2] = s.z;
      }
      sgeo.attributes.position.needsUpdate = true;
      renderer.render(scene, cam);
    }
    var run = false, raf = 0, seen = false;
    function frame() { draw(now()); run = seen && !still; if (run) raf = requestAnimationFrame(frame); }
    function kick() { if (still) { if (seen) draw(now()); return; } if (seen && !run) { run = true; raf = requestAnimationFrame(frame); } }
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) kick(); else { run = false; cancelAnimationFrame(raf); } }).observe(box);
    window.addEventListener('resize', function () {
      var w2 = box.clientWidth, h2 = box.clientHeight; if (!w2 || !h2) return;
      renderer.setSize(w2, h2); cam.aspect = w2 / h2; cam.updateProjectionMatrix(); if (!run) draw(now());
    });
    // the site's fonts may still be on their way: draw the words again once they are here
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("800 80px 'Sora Variable'"), document.fonts.load("600 24px 'Inter Variable'")]).then(function () { shown.num = -1; tab(); kick(); if (still) draw(now()); }, function () {});
    // for making the stand-in picture (scripts, by hand): box.__at(seconds) draws the finished moment and returns it as a PNG
    box.__at = function (t) { still = true; seen = false; run = false; cancelAnimationFrame(raf); draw(t); return renderer.domElement.toDataURL('image/png'); };
    seen = true; kick();
  }

  new IntersectionObserver(function (es, io) {
    if (!es[0].isIntersecting || started) return;
    started = true; io.disconnect();
    three().then(start).catch(function (e) { if (window.console) console.warn('promise3d', e); });
  }, { rootMargin: '300px' }).observe(box);
  }
})();
