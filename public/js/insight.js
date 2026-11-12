/* XpertInsight page: the sample dashboard. The side menu switches views; while it is on screen it also tours the views by itself
   until the visitor picks one. Numbers count up when a view opens. Nothing moves for people who ask for less motion. */
(function () {
  var el = document.querySelector('[data-insight]'); if (!el) return;
  var tabs = [].slice.call(el.querySelectorAll('[role="tab"]')), views = [].slice.call(el.querySelectorAll('[role="tabpanel"]'));
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches, cur = 0, mine = false, seen = false, tmr = 0;
  function count(v) {
    v.querySelectorAll('[data-n]').forEach(function (b) {
      var to = +b.dataset.n; if (calm) { b.textContent = to.toLocaleString('en-US'); return; }
      var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3); b.textContent = Math.round(to * e).toLocaleString('en-US'); if (k < 1) requestAnimationFrame(step); })(t0);
    });
    v.querySelectorAll('.xiup i').forEach(function (i, k) { i.style.setProperty('--k', k); });
  }
  function show(i, focus) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) { var on = k === cur; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    views.forEach(function (v, k) { var on = k === cur; v.hidden = !on; v.classList.remove('on'); if (on) { void v.offsetWidth; v.classList.add('on'); count(v); } });
    if (focus) tabs[cur].focus();
    var nav = tabs[cur].parentNode; if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: tabs[cur].offsetLeft - 12, behavior: calm ? 'auto' : 'smooth' });
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { mine = true; clearInterval(tmr); show(k); });
    t.addEventListener('keydown', function (e) { var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); mine = true; clearInterval(tmr); show(cur + d, true); } });
  });
  // keep the box as tall as the tallest view, so the page never jumps when the view changes
  function fit() {
    var keep = views.map(function (v) { v.style.minHeight = ''; return v.hidden; }), h = 0;
    views.forEach(function (v) { views.forEach(function (o) { o.hidden = o !== v; }); h = Math.max(h, v.offsetHeight); });
    views.forEach(function (v, k) { v.hidden = keep[k]; v.style.minHeight = h / 16 + 'rem'; });
  }
  var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fit, 150); }); fit();
  function tour() { clearInterval(tmr); if (!mine && seen && !calm) tmr = setInterval(function () { if (!document.hidden && !document.documentElement.classList.contains('dmpaused')) show(cur + 1); }, 4800); }
  new IntersectionObserver(function (es) { var was = seen; seen = es[0].isIntersecting; if (seen && !was) { show(cur); } tour(); }, { threshold: 0.35 }).observe(el);
})();
/* "A closer look at every view": the screen on the right follows the step being read (computers only) */
(function () {
  var s = document.querySelector('[data-xistory]'); if (!s) return;
  var steps = [].slice.call(s.querySelectorAll('.xistep')), shots = [].slice.call(s.querySelectorAll('.xishots img')),
    dots = [].slice.call(s.querySelectorAll('.xidots i')), url = s.querySelector('[data-xiurl]'), cur = -1;
  function go(i) {
    if (i === cur) return; cur = i;
    steps.forEach(function (x, k) { x.classList.toggle('on', k === i); });
    shots.forEach(function (x, k) { x.classList.toggle('on', k === i); });
    dots.forEach(function (x, k) { x.classList.toggle('on', k === i); });
    if (url && shots[i]) url.textContent = shots[i].dataset.f;
  }
  go(0);
  // load every screen once the story is near, so switching never shows a blank frame
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { shots.forEach(function (x) { x.loading = 'eager'; }); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(s);
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) go(steps.indexOf(e.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(function (x) { io.observe(x); });
})();
/* "Made for phones too": the side phones fan open while the section scrolls into view */
(function () {
  var p = document.querySelector('[data-xiph]'); if (!p) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var on = false, raf = 0;
  function tick() { raf = 0; var r = p.getBoundingClientRect(), h = innerHeight, k = (h - r.top) / (h * 0.75); p.style.setProperty('--sp', Math.max(0, Math.min(1, k)).toFixed(3)); }
  function ask() { if (on && !raf) raf = requestAnimationFrame(tick); }
  new IntersectionObserver(function (es) { on = es[0].isIntersecting; ask(); }).observe(p);
  addEventListener('scroll', ask, { passive: true }); tick();
})();
