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
/* "A closer look at every view": the stack of screens on the right follows the group being read (computers only) */
(function () {
  var s = document.querySelector('[data-xistory]'); if (!s) return;
  var steps = [].slice.call(s.querySelectorAll('.xistep')), grps = [].slice.call(s.querySelectorAll('.xigrp')),
    dots = [].slice.call(s.querySelectorAll('.xidots i')), cur = -1;
  function go(i) {
    if (i === cur || i < 0) return; cur = i;
    [steps, grps, dots].forEach(function (l) { l.forEach(function (x, k) { x.classList.toggle('on', k === i); }); });
  }
  go(0);
  // bring one screen of a group to the front: by clicking the screen itself, or its name on the left
  function front(step, f) {
    var g = steps.indexOf(step), boxes = [step.querySelector('.xim'), grps[g]];
    boxes.forEach(function (box) {
      if (!box) return;
      var ws = [].slice.call(box.querySelectorAll('.xisw')).sort(function (a, b) { return a.style.getPropertyValue('--k') - b.style.getPropertyValue('--k'); });
      ws.sort(function (a, b) { return (b.dataset.f === f) - (a.dataset.f === f); });
      ws.forEach(function (w, k) { w.style.setProperty('--k', k); });
    });
    step.querySelectorAll('.xivl button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
  }
  steps.forEach(function (st, g) {
    st.querySelectorAll('.xivl button').forEach(function (b) { b.addEventListener('click', function () { go(g); front(st, b.dataset.f); }); });
    [st.querySelector('.xim'), grps[g]].forEach(function (box) { if (box) box.querySelectorAll('.xisw').forEach(function (w) { w.addEventListener('click', function () { front(st, w.dataset.f); }); }); });
  });
  // load every screen once the story is near, so switching never shows an empty frame
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { s.querySelectorAll('.xiscreen img').forEach(function (x) { x.loading = 'eager'; }); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(s);
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) go(steps.indexOf(e.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(function (x) { io.observe(x); });
})();
/* "Made for phones too": the range switch really changes the three phones (real screens for 7 days, 28 days and 3 months).
   The new screen fades in on top of the old one once it has loaded, so the change is smooth.
   It also steps through the ranges by itself while on screen, until the visitor picks one. */
(function () {
  var seg = document.querySelector('.xiseg'); if (!seg) return;
  var btns = [].slice.call(seg.querySelectorAll('button')), hold = [].slice.call(document.querySelectorAll('[data-xiph] .xiphn')),
    calm = matchMedia('(prefers-reduced-motion: reduce)').matches, mine = false, seen = false, tmr = 0, warm = false, n = 0;
  function set(im, v, r) { im.sizes = hold[0].querySelector('img').sizes; im.srcset = '/img/xi-phone-' + v + '-' + r + '-360.webp 360w, /img/xi-phone-' + v + '-' + r + '.webp 640w'; im.src = '/img/xi-phone-' + v + '-' + r + '.webp'; }
  function preload() { if (warm) return; warm = true; ['7', '90'].forEach(function (r) { hold.forEach(function (h) { set(new Image(), h.dataset.v, r); }); }); }
  function pick(r) {
    var id = ++n;
    seg.dataset.r = r;
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.r === String(r))); });
    hold.forEach(function (h, k) {
      var base = h.querySelector('img'), top = base.nextElementSibling;
      if (!top) { top = document.createElement('img'); top.alt = ''; top.decoding = 'async'; top.width = base.width; top.height = base.height; h.appendChild(top); }
      top.classList.remove('on'); set(top, h.dataset.v, r);
      (top.decode ? top.decode() : Promise.resolve()).catch(function () {}).then(function () {
        if (id !== n) return;
        setTimeout(function () {
          top.classList.add('on');
          setTimeout(function () { if (id !== n) return; set(base, h.dataset.v, r); (base.decode ? base.decode() : Promise.resolve()).catch(function () {}).then(function () { if (id === n) top.classList.remove('on'); }); }, 600);
        }, k * 90);
      });
    });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { mine = true; clearInterval(tmr); preload(); pick(b.dataset.r); }); });
  var order = ['7', '28', '90'];
  function tour() { clearInterval(tmr); if (!mine && seen && !calm) tmr = setInterval(function () { if (!document.hidden) pick(order[(order.indexOf(seg.dataset.r) + 1) % 3]); }, 3800); }
  new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) preload(); tour(); }, { threshold: 0.4 }).observe(seg.parentNode);
})();
/* "Made for phones too": the side phones fan open while the section scrolls into view */
(function () {
  var p = document.querySelector('[data-xiph]'); if (!p) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var on = false, raf = 0, cur = 0, want = 0;
  function aim() { var r = p.getBoundingClientRect(), h = innerHeight, k = (h - r.top) / (h * 0.75); want = Math.max(0, Math.min(1, k)); want = want * want * (3 - 2 * want); }
  function tick() { raf = 0; aim(); cur += (want - cur) * 0.12; if (Math.abs(want - cur) < 0.001) cur = want; p.style.setProperty('--sp', cur.toFixed(4)); if (cur !== want) ask(); }
  function ask() { if (on && !raf) raf = requestAnimationFrame(tick); }
  new IntersectionObserver(function (es) { on = es[0].isIntersecting; ask(); }).observe(p);
  addEventListener('scroll', ask, { passive: true }); tick();
})();
