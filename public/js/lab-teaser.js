// Homepage XpertLab teaser: a small dotted globe drawn on a flat canvas (no 3D library), Malaysia marked.
// ui.js loads this file (and /js/land.js) only when the teaser comes near the screen. It draws only while on screen.
(function () {
  var box = document.querySelector('.lglobe'), L = window.SXLAND; if (!box || !L) return;
  var cv = box.querySelector('canvas'), cx = cv.getContext('2d'), pin = box.querySelector('.lpin'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bits = atob(L.bits), my = {}, D = Math.PI / 180, pts = [], W = 0, H = 0, dpr = 1, on = false, raf = 0, rot = -101.69 * D - 0.9;
  L.my.forEach(function (i) { my[i] = 1; });
  for (var lat = -80; lat <= 80; lat += 2.4) { var n = Math.max(1, Math.round(150 * Math.cos(lat * D))); for (var k = 0; k < n; k++) { var lon = -180 + (k + 0.5) * 360 / n, c = Math.min(L.h - 1, Math.floor((90 - lat) / 180 * L.h)) * L.w + Math.min(L.w - 1, Math.floor((lon + 180) / 360 * L.w));
    if (my[c] || (bits.charCodeAt(c >> 3) & (1 << (c & 7)))) pts.push([lat * D, lon * D, my[c] ? 1 : 0]); } }
  var tilt = 0.38, ct = Math.cos(tilt), st = Math.sin(tilt);
  function proj(la, lo) { var cl = Math.cos(la), x = cl * Math.sin(lo + rot), y = Math.sin(la), z = cl * Math.cos(lo + rot); return [x, y * ct - z * st, y * st + z * ct]; }
  function draw(t) {
    raf = 0; if (!W) return; cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    var R = Math.min(W, H) * 0.4, ox = W / 2, oy = H / 2;
    var g = cx.createRadialGradient(ox - R * 0.3, oy - R * 0.35, R * 0.1, ox, oy, R * 1.25); g.addColorStop(0, '#ffffff'); g.addColorStop(0.75, '#f3e9fd'); g.addColorStop(1, 'rgba(176,108,255,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(ox, oy, R * 1.25, 0, 6.283); cx.fill();
    cx.strokeStyle = 'rgba(123,24,193,.25)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(ox, oy, R, 0, 6.283); cx.stroke();
    var s = Math.max(1.4, R / 70);
    for (var i = 0; i < pts.length; i++) { var p = pts[i]; if (p[2]) continue; var q = proj(p[0], p[1]); if (q[2] < 0) continue; cx.globalAlpha = 0.3 + 0.7 * q[2]; cx.fillStyle = '#7b18c1'; cx.fillRect(ox + q[0] * R - s / 2, oy - q[1] * R - s / 2, s, s); }
    cx.globalAlpha = 1; cx.fillStyle = '#f08a24';
    for (i = 0; i < pts.length; i++) { p = pts[i]; if (!p[2]) continue; q = proj(p[0], p[1]); if (q[2] < 0) continue; cx.fillRect(ox + q[0] * R - s, oy - q[1] * R - s, s * 2, s * 2); }
    var k = proj(3.14 * D, 101.69 * D), kx = ox + k[0] * R, ky = oy - k[1] * R, ph = still ? 0.5 : (t / 1400) % 1;
    if (k[2] > 0.15) { cx.strokeStyle = 'rgba(240,138,36,' + (1 - ph).toFixed(3) + ')'; cx.lineWidth = 2; cx.beginPath(); cx.arc(kx, ky, 4 + ph * 16, 0, 6.283); cx.stroke(); }
    pin.style.left = (kx / W * 100).toFixed(2) + '%'; pin.style.top = (ky / H * 100).toFixed(2) + '%'; pin.style.opacity = k[2] > 0.15 ? '1' : '0';
    if (!still) { rot += 0.004; if (on) raf = requestAnimationFrame(draw); }
  }
  function size() { var r = box.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; if (!raf) raf = requestAnimationFrame(draw); }
  size(); if (window.ResizeObserver) new ResizeObserver(size).observe(box);
  new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(draw); }).observe(box);
})();
