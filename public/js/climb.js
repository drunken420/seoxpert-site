/* SEO services page: "How we check it", a small moving example beside the money-back promise (Suhen 2026-11-15).
   One tracked keyword steps up Google over four weeks; when it passes position 50 the bar turns gold, the line
   underneath appears and the 3D shield (promise3d.js) turns with a pulse. It plays only while on screen, waits a
   moment and starts again. People who ask for less motion see the last week, still. */
(function () {
  var box = document.getElementById('pmclimb');
  if (!box) return;
  var weeks = [].slice.call(box.querySelectorAll('[data-w]')), num = box.querySelector('[data-pos]');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pos = 100, step = -1, timer = 0, raf = 0, on = false;
  // position 100 sits at the left end of the bar and position 1 at the right
  function place(p) { box.style.setProperty('--x', ((100 - p) / 99 * 100).toFixed(2) + '%'); num.textContent = Math.round(p); }
  function show(i) {
    weeks.forEach(function (w, k) { w.classList.toggle('on', k === i); w.classList.toggle('done', k < i); });
    var to = +weeks[i].getAttribute('data-w'), from = pos, t0 = performance.now();
    cancelAnimationFrame(raf);
    (function go(t) {
      var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
      pos = from + (to - from) * e; place(pos);
      if (k < 1) raf = requestAnimationFrame(go);
      else if (to <= 50 && !box.classList.contains('won')) {
        box.classList.add('won');
        var shield = document.getElementById('pm3d'); if (shield) shield.dispatchEvent(new Event('pm3d-pulse'));
      }
    })(t0);
  }
  function tick() {
    step++;
    if (step >= weeks.length + 2) { step = 0; pos = 100; box.classList.remove('won'); }
    if (step < weeks.length) show(step);
    timer = setTimeout(tick, step === weeks.length - 1 ? 2600 : 1500);
  }
  if (still) { pos = +weeks[weeks.length - 1].getAttribute('data-w'); place(pos); weeks.forEach(function (w) { w.classList.add('done'); }); box.classList.add('won'); return; }
  place(100);
  if (!('IntersectionObserver' in window)) { tick(); return; }
  new IntersectionObserver(function (es) {
    var vis = es[0].isIntersecting;
    if (vis && !on) { on = true; timer = setTimeout(tick, 500); }
    else if (!vis && on) { on = false; clearTimeout(timer); cancelAnimationFrame(raf); }
  }, { threshold: 0.4 }).observe(box);
})();
