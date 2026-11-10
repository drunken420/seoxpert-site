window.SX = (function () {
  var D1 = "M571.46,207.27c-1.21,4.19-7.38,3.31-7.38-1.06V0s0,0,0,0C435.58,0,327.19,85.96,293.18,203.51c-1.21,4.19-7.38,3.31-7.38-1.06v-75.02c0-68.3-55.37-123.67-123.67-123.67H3.76v158.38c0,68.3,55.37,123.67,123.67,123.67h75.02c4.37,0,5.25,6.16,1.06,7.38C85.96,327.19,0,435.58,0,564.08h0s206.21,0,206.21,0c4.37,0,5.25,6.16,1.06,7.38C89.72,605.47,3.76,713.86,3.76,842.36h0s282.04,0,282.04,0v-282.04h0s274.52-274.52,274.52-274.52h0s282.04,0,282.04,0V3.76s0,0,0,0c-128.51,0-236.89,85.96-270.9,203.51Z",
      D2 = "M500.31,480.16l-10.06-10.06-20.12,20.12,10.06,10.06c88.04,98.09,87.99,247.16-.05,345.26v.59s366.01,0,366.01,0l-.05-365.96h-.59c-98.09,88.03-247.11,88.03-345.21,0Z";
  var TAU = Math.PI * 2;
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function backOut(a) { var c = 1.5, b = a - 1; return a <= 0 ? 0 : a >= 1 ? 1 : 1 + (c + 1) * b * b * b + c * b * b; }
  function rng(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function canGL() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } }
  function renderer(canvas) {
    if (!window.THREE || !canGL()) return null;
    try { var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); r.setClearColor(0, 0); return r; } catch (e) { return null; }
  }
  function parse(d, H) {
    var re = /([MmLlHhVvCcSsZz])|(-?\d*\.?\d+(?:e-?\d+)?)/g, m, tk = [];
    while ((m = re.exec(d))) tk.push(m[1] || parseFloat(m[2]));
    var i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, qx = 0, qy = 0, curve = false, out = [], s = null, rel, a, b, c, e, g, h;
    var n = function () { return tk[i++]; };
    while (i < tk.length) {
      if (typeof tk[i] === 'string') cmd = tk[i++];
      rel = cmd === cmd.toLowerCase();
      switch (cmd.toUpperCase()) {
        case 'M': a = n(); b = n(); if (rel) { a += x; b += y; } x = sx = a; y = sy = b; s = new THREE.Shape(); out.push(s); s.moveTo(x, H - y); cmd = rel ? 'l' : 'L'; curve = false; break;
        case 'L': a = n(); b = n(); if (rel) { a += x; b += y; } x = a; y = b; s.lineTo(x, H - y); curve = false; break;
        case 'H': a = n(); x = rel ? x + a : a; s.lineTo(x, H - y); curve = false; break;
        case 'V': a = n(); y = rel ? y + a : a; s.lineTo(x, H - y); curve = false; break;
        case 'C': a = n(); b = n(); c = n(); e = n(); g = n(); h = n(); if (rel) { a += x; b += y; c += x; e += y; g += x; h += y; } s.bezierCurveTo(a, H - b, c, H - e, g, H - h); qx = c; qy = e; x = g; y = h; curve = true; break;
        case 'S': c = n(); e = n(); g = n(); h = n(); if (rel) { c += x; e += y; g += x; h += y; } a = curve ? 2 * x - qx : x; b = curve ? 2 * y - qy : y; s.bezierCurveTo(a, H - b, c, H - e, g, H - h); qx = c; qy = e; x = g; y = h; curve = true; break;
        case 'Z': x = sx; y = sy; curve = false; break;
        default: i++;
      }
    }
    return out;
  }
  /* the real tree + arrow mark as a solid 3D object */
  function logo(opt) {
    opt = opt || {};
    var K = opt.k || 0.0064, EX = { depth: 90, bevelEnabled: true, bevelThickness: 14, bevelSize: 9, bevelSegments: 5, curveSegments: 28 };
    function solid(d, mat) { var g = new THREE.ExtrudeGeometry(parse(d, 846.12), EX); g.translate(-423, -423, -45); var m = new THREE.Mesh(g, mat); m.scale.setScalar(K); return m; }
    var treeMat = new THREE.MeshStandardMaterial({ color: opt.tree || 0x8322d0, metalness: 0.2, roughness: 0.34, emissive: opt.treeE || 0x3a0a6e, emissiveIntensity: 0.5 });
    var arrowMat = new THREE.MeshStandardMaterial({ color: opt.arrow || 0xbd86ff, metalness: 0.15, roughness: 0.3, emissive: opt.arrowE || 0x8a3df0, emissiveIntensity: 0.3 });
    var G = new THREE.Group(), tree = solid(D1, treeMat), arrow = solid(D2, arrowMat); G.add(tree); G.add(arrow);
    G.userData = { tree: tree, arrow: arrow, K: K, mats: [treeMat, arrowMat] };
    return G;
  }
  function lights(scene, rimCol) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    var key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(5, 8, 12); scene.add(key);
    var rim = new THREE.DirectionalLight(rimCol || 0xff9ae0, 0.4); rim.position.set(-9, -3, 5); scene.add(rim);
  }
  /* the leaf from the logo, used as a petal */
  function petalGeo() { var p = new THREE.Shape(); p.moveTo(0, 0); p.lineTo(1, 0); p.absarc(0, 0, 1, 0, Math.PI / 2, false); p.lineTo(0, 0); var g = new THREE.ShapeGeometry(p, 8); g.translate(-0.42, -0.42, 0); return g; }
  /* turn a 2D drawing into a list of points for petals to fly to */
  function sample(draw, N, G, span, seed) {
    var c = document.createElement('canvas'); c.width = c.height = G; var g = c.getContext('2d'); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round';
    draw(g); var d = g.getImageData(0, 0, G, G).data, pts = [], x, y;
    for (y = 0; y < G; y++) for (x = 0; x < G; x++) { if (d[(y * G + x) * 4 + 3] > 128) pts.push(x, y, d[(y * G + x) * 4] > 200 ? 0 : 1); }
    var r = rng(seed || 13), out = [], n = pts.length / 3;
    for (var i = 0; i < N; i++) { var k = Math.floor(r() * n) * 3; out.push({ x: ((pts[k] + r()) / G - 0.5) * span, y: (0.5 - (pts[k + 1] + r()) / G) * span, z: (r() - 0.5) * 0.4, c: pts[k + 2] }); }
    return out;
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function star(g, x, y, r) { g.beginPath(); for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4, q = k % 2 ? r * 0.34 : r; g.lineTo(x + Math.sin(a) * q, y - Math.cos(a) * q); } g.closePath(); g.fill(); }
  function textSprite(txt, opt) {
    opt = opt || {}; var c = document.createElement('canvas'), g = c.getContext('2d'), fs = 64, pad = 30;
    g.font = '600 ' + fs + 'px "Sora Variable", "Inter Variable", sans-serif'; var w = Math.ceil(g.measureText(txt).width) + pad * 2, h = fs + pad * 1.3;
    c.width = w; c.height = h; g = c.getContext('2d'); g.font = '600 ' + fs + 'px "Sora Variable", "Inter Variable", sans-serif';
    g.fillStyle = opt.bg || 'rgba(255,255,255,.1)'; rr(g, 2, 2, w - 4, h - 4, h / 2 - 2); g.fill(); g.strokeStyle = opt.line || 'rgba(217,184,255,.55)'; g.lineWidth = 3; g.stroke();
    g.fillStyle = opt.ink || '#fff'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(txt, w / 2, h / 2 + 3);
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    var sc = opt.size || 0.5; s.scale.set(sc * w / h, sc, 1); return s;
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { TAU: TAU, clamp01: clamp01, smooth: smooth, lerp: lerp, backOut: backOut, rng: rng, renderer: renderer, logo: logo, lights: lights, petalGeo: petalGeo, sample: sample, rr: rr, star: star, textSprite: textSprite, reduce: reduce };
})();
