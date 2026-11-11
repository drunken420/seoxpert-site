(function () {
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }); rv.forEach(function (el) { io.observe(el); }); } else rv.forEach(function (el) { el.classList.add('in'); });
  var head = document.querySelector('.site-head');
  function hh() { document.documentElement.style.setProperty('--head-h', head.offsetHeight + 'px'); }
  hh(); window.addEventListener('resize', hh);
  /* cards: a soft light follows the pointer */
  document.addEventListener('pointermove', function (e) { var c = e.target.closest && e.target.closest('.fcard,.rcard,.way'); if (!c) return; var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });
  /* FAQ chat */
  var log = document.getElementById('chatlog'), src = [].slice.call(document.querySelectorAll('#faqsrc p')), btns = [].slice.call(document.querySelectorAll('.qlist button')), tmr = 0;
  function ask(i, instant) {
    btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
    /* phones: the answer opens right under the question, and a second tap closes it */
    var old = document.querySelector('.qlist .qa'), was = old && old.previousElementSibling === btns[i]; if (old) old.remove();
    if (was && !instant) { btns[i].setAttribute('aria-pressed', 'false'); return; }
    var qa = document.createElement('div'); qa.className = 'qa'; qa.innerHTML = src[i].classList.contains('ph') ? '<span class="ph">' + src[i].innerHTML + '</span>' : src[i].innerHTML; btns[i].after(qa);
    clearTimeout(tmr); log.innerHTML = '';
    var me = document.createElement('div'); me.className = 'bub me'; me.textContent = btns[i].textContent.replace(/^\d+/, ''); log.appendChild(me);
    var ai = document.createElement('div'); ai.className = 'bub ai'; ai.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>'; log.appendChild(ai);
    tmr = setTimeout(function () { ai.innerHTML = src[i].classList.contains('ph') ? '<span class="ph">' + src[i].innerHTML + '</span>' : src[i].innerHTML; }, instant ? 0 : 750);
  }
  btns.forEach(function (b, i) { b.addEventListener('click', function () { ask(i); }); });
  if (btns.length) ask(0, true);
})();

(function () {
  var b = document.querySelector('.burger'), m = document.getElementById('mmenu'); if (!b || !m) return;
  function set(open) { b.setAttribute('aria-expanded', String(open)); m.hidden = !open; }
  b.addEventListener('click', function () { set(m.hidden); });
  m.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();

/* Chat helper: instant answers from our own questions and answers. It is not an AI, and it sends nothing anywhere. */
(function () {
  var panel = document.getElementById('chatpanel'), dataEl = document.getElementById('chatdata'); if (!panel || !dataEl) return;
  var data = JSON.parse(dataEl.textContent), log = panel.querySelector('.cp-log'), chips = panel.querySelector('.cp-chips'), form = panel.querySelector('.cp-form'), input = form.querySelector('input'), fab = document.querySelector('.chatfab'), started = false;
  var STOP = 'a an and are as at be by can do does for from how i in is it me my of on or our that the this to we what when who will with you your about have has'.split(' ');
  var TOPICS = [[/maint|care|month|updat|backup|fix/, '/website-maintenance/', 'website maintenance'], [/pric|cost|packag|how much|fee|quot/, '/packages/', 'website design packages'], [/builder|ai\b|chatgpt|llm/, '/ai-website-builder/', 'our AI website builder'], [/design|build|new site|new website|redesign/, '/website-design/', 'website design']];
  function words(t) { return t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1 && STOP.indexOf(w) < 0; }); }
  var index = data.faqs.map(function (f) { return { f: f, q: words(f.q), a: words(f.a) }; });
  function contact() {
    var parts = [];
    if (data.whatsapp) parts.push('<a href="' + data.whatsapp + '">WhatsApp</a>');
    if (data.email) parts.push('<a href="' + data.email + '">email</a>');
    parts.push('<a href="/contact/">the contact page</a>');
    return parts.join(parts.length > 2 ? ', ' : ' or ').replace(/, ([^,]*)$/, ' or $1');
  }
  function bubble(cls, html) { var d = document.createElement('div'); d.className = 'bub ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function answer(text) {
    var t = text.toLowerCase(), w = words(text), best = null, score = 0;
    index.forEach(function (it) { var s = 0; w.forEach(function (x) { if (it.q.indexOf(x) >= 0) s += 2; else if (it.a.indexOf(x) >= 0) s += 1; }); if (s > score) { score = s; best = it.f; } });
    var more = ''; TOPICS.some(function (tp) { if (tp[0].test(t)) { more = ' <a href="' + tp[1] + '">Read more about ' + tp[2] + '</a>.'; return true; } return false; });
    if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t)) return 'Hello. Ask me about website design, website maintenance or how we work.';
    if (/contact|whatsapp|email|call|phone|talk|speak|human|person/.test(t)) return 'You can reach us on ' + contact() + '.';
    if (best && score >= 2) return (best.ready ? best.a : 'We are still finalising this answer. Message us on ' + contact() + ' and we will tell you directly.') + more;
    if (more) return 'Here is the best place to start.' + more + ' Or message us on ' + contact() + '.';
    return 'I do not have a ready answer for that. Message us on ' + contact() + ' and a real person will reply.';
  }
  function ask(text) {
    bubble('me', esc(text)); var ai = bubble('ai', '<span class="dots"><i></i><i></i><i></i></span>');
    setTimeout(function () { ai.innerHTML = answer(text); log.scrollTop = log.scrollHeight; }, 450);
  }
  function open() {
    panel.hidden = false; if (fab) fab.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true; bubble('ai', 'Hello. I can give you quick answers about SEOXpert. Pick a question or type your own.');
      data.faqs.slice(0, 5).forEach(function (f) { var b = document.createElement('button'); b.type = 'button'; b.textContent = f.q; b.addEventListener('click', function () { ask(f.q); }); chips.appendChild(b); });
    }
    if (window.matchMedia('(min-width: 901px)').matches) input.focus();
  }
  function close() { panel.hidden = true; if (fab) { fab.setAttribute('aria-expanded', 'false'); } }
  /* phones: keep the chat button out of the way while the homepage "Build it" box is on screen */
  var promptBox = document.getElementById('prompt');
  if (fab && promptBox && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { fab.classList.toggle('tuck', es[0].isIntersecting && window.matchMedia('(max-width: 900px)').matches && panel.hidden); }).observe(promptBox);
  document.addEventListener('click', function (e) { var o = e.target.closest('[data-chat-open]'); if (o) { e.preventDefault(); if (panel.hidden) open(); else if (o === fab) close(); } else if (e.target.closest('.cp-x')) { close(); if (fab) fab.focus(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { close(); if (fab) fab.focus(); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; ask(v); });
})();

/* Our work: play a short silent loop of the real website over its screenshot, only while it is on screen.
   The screenshot stays as the picture for search engines, slow connections and people who prefer no motion. */
(function () {
  var shots = document.querySelectorAll('.workshot[data-vid]'); if (!shots.length || !window.IntersectionObserver) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection && navigator.connection.saveData) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    var a = e.target, v = a.querySelector('video');
    if (e.isIntersecting && !v) { var img = a.querySelector('img'), wrap = document.createElement('span'); wrap.className = 'shot'; img.parentNode.insertBefore(wrap, img); wrap.appendChild(img);
      v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.preload = 'auto';
      ['webm', 'mp4'].forEach(function (t) { var s = document.createElement('source'); s.src = a.dataset.vid + '.' + t; s.type = 'video/' + t; v.appendChild(s); });
      v.addEventListener('playing', function () { v.classList.add('on'); }); wrap.appendChild(v); }
    if (v) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
  }); }, { rootMargin: '100px' });
  [].forEach.call(shots, function (a) { io.observe(a); });
})();

/* Inner page banners: a soft glow follows the pointer and the picture tilts towards it. Mouse only; decoration. */
(function () {
  var h = document.querySelector('[data-phero]'); if (!h || !window.matchMedia) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
  var art = h.querySelector('.hart'), raf = 0, ev = null;
  function run() { raf = 0; var r = h.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    h.style.setProperty('--mx', x + 'px'); h.style.setProperty('--my', y + 'px'); h.style.setProperty('--on', '1');
    if (art) { art.style.setProperty('--px', (x / r.width * 2 - 1).toFixed(3)); art.style.setProperty('--py', (y / r.height * 2 - 1).toFixed(3)); } }
  h.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; ev = e; if (!raf) raf = requestAnimationFrame(run); }, { passive: true });
  h.addEventListener('pointerleave', function () { h.style.setProperty('--on', '0'); if (art) { art.style.setProperty('--px', '0'); art.style.setProperty('--py', '0'); } });
})();

/* Services dropdown in the top menu: click or keyboard opens it, Escape or a click elsewhere closes it. Hover works without this. */
(function () {
  var d = document.querySelector('.mdrop'); if (!d) return; var b = d.querySelector('button');
  function set(on) { b.setAttribute('aria-expanded', String(on)); d.classList.toggle('shut', !on && d.matches(':hover')); }
  b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true'); });
  d.addEventListener('mouseleave', function () { d.classList.remove('shut'); });
  document.addEventListener('click', function (e) { if (!d.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { set(false); b.focus(); } });
})();
