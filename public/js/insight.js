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
/* "A closer look at every view": 8 tabs and one big screen. Arrows, swipe and the keyboard move between views;
   while the section is on screen it tours the views by itself until the visitor clicks or swipes. */
(function () {
  var t = document.querySelector('[data-xitabs]'); if (!t) return;
  var tabs = [].slice.call(t.querySelectorAll('[role=tab]')), shots = [].slice.call(t.querySelectorAll('.xitshots img')),
    info = t.querySelector('.xitinfo'), g = t.querySelector('[data-xitg]'), h = t.querySelector('[data-xith]'), p = t.querySelector('[data-xitp]'),
    c = t.querySelector('[data-xitc]'), u = t.querySelector('[data-xitu]'), panel = t.querySelector('[role=tabpanel]'),
    cur = 0, timer = 0, auto = !matchMedia('(prefers-reduced-motion: reduce)').matches, seen = false, MS = 6000;
  var list = JSON.parse(t.getAttribute('data-xitabs') || '[]');
  function go(i, focus) {
    i = (i + tabs.length) % tabs.length; if (i === cur && !focus) return; cur = i;
    tabs.forEach(function (b, k) { var on = k === i; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    shots.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    var d = list[i]; if (d) { g.textContent = d.g; h.textContent = d.h; p.textContent = d.p; u.textContent = d.f; }
    c.textContent = i + 1; panel.setAttribute('aria-labelledby', tabs[i].id);
    [g, h, p].forEach(function (x) { x.classList.remove('swap'); void x.offsetWidth; x.classList.add('swap'); });
    var b = tabs[i], l = b.parentNode; if (l.scrollWidth > l.clientWidth) l.scrollTo({ left: b.offsetLeft - (l.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
    if (focus) b.focus();
    if (auto && seen) tick();
  }
  function tick() { clearTimeout(timer); var b = tabs[cur].querySelector('.xitbar'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; timer = setTimeout(function () { go(cur + 1); }, MS); }
  function stop() { auto = false; clearTimeout(timer); t.classList.remove('auto'); }
  t.style.setProperty('--xit', MS / 1000 + 's');
  tabs.forEach(function (b, k) {
    b.addEventListener('click', function () { stop(); go(k); });
    b.addEventListener('keydown', function (e) {
      var k2 = { ArrowRight: cur + 1, ArrowLeft: cur - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k2 === undefined) return; e.preventDefault(); stop(); go(k2, true);
    });
  });
  t.querySelector('.xitprev').addEventListener('click', function () { stop(); go(cur - 1); });
  t.querySelector('.xitnext').addEventListener('click', function () { stop(); go(cur + 1); });
  // swipe the screen on phones
  var box = t.querySelector('.xitshots'), x0 = null, y0 = 0;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  box.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { stop(); go(cur + (dx < 0 ? 1 : -1)); } }, { passive: true });
  // load every screen once the section is near; tour only while it is on screen
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { shots.forEach(function (x) { x.loading = 'eager'; }); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(t);
  new IntersectionObserver(function (es) {
    seen = es[0].isIntersecting;
    if (!auto) return;
    if (seen) { t.classList.add('auto'); tick(); } else { clearTimeout(timer); t.classList.remove('auto'); }
  }, { threshold: .35 }).observe(t);
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

/* Numbers with data-count (the stats ribbon, the plan cards) count up the first time they scroll into view */
(function () {
  var els = [].slice.call(document.querySelectorAll('[data-count]')); if (!els.length || !('IntersectionObserver' in window)) return;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches, ribbon = document.querySelector('.xistats');
  function run(b) {
    var to = +b.dataset.count; if (calm || !to) { b.textContent = to; return; }
    var t0 = performance.now(); b.textContent = '0';
    (function step(t) { var k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3); b.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target); if (e.target === ribbon) { ribbon.classList.add('in'); ribbon.querySelectorAll('[data-count]').forEach(run); } else run(e.target); }); }, { threshold: .4 });
  if (ribbon) io.observe(ribbon);
  els.forEach(function (b) { if (!ribbon || !ribbon.contains(b)) io.observe(b); });
})();
