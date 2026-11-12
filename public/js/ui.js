(function () {
  /* headings reveal word by word: wrap each word (and each inline element, kept whole) in a span */
  [].forEach.call(document.querySelectorAll('main h2.rv'), function (h) {
    var i = 0, kids = [].slice.call(h.childNodes);
    kids.forEach(function (n) {
      if (n.nodeType === 3) { var f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; } var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = w; f.appendChild(s); }); h.replaceChild(f, n); }
      else if (n.nodeType === 1 && n.tagName !== 'BR') { var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); h.replaceChild(s, n); s.appendChild(n); }
    });
    h.classList.add('wr');
  });
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
  function set(open) { b.setAttribute('aria-expanded', String(open)); m.hidden = !open; document.documentElement.classList.toggle('menu-open', open); }
  b.addEventListener('click', function () { set(m.hidden); });
  m.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();

/* Chat helper: instant answers from our own questions and answers (fetched from /chat.json when the chat first opens).
   It is not an AI, and it sends nothing anywhere: matching happens here in the browser. */
(function () {
  var panel = document.getElementById('chatpanel'); if (!panel) return;
  var log = panel.querySelector('.cp-log'), chips = panel.querySelector('.cp-chips'), form = panel.querySelector('.cp-form'), input = form.querySelector('input'), fab = document.querySelector('.chatfab');
  var data = null, loading = null, index = [], asked = {}, started = false, dq = {}, da = {};
  function uniq(a) { return a.filter(function (w, i) { return a.indexOf(w) === i; }); }
  var STOP = 'a an and are as at be by can do does for from how i in is it me my of on or our that the this to we what when who will with you your about have has get any there much myself offer offers provide sell need want also just like'.split(' ');
  // words that mean the same thing for matching
  var SAME = { price: 'cost', prices: 'cost', costs: 'cost', pricing: 'cost', fee: 'cost', fees: 'cost', charge: 'cost', rm: 'cost', ringgit: 'cost', cheap: 'cost', expensive: 'cost', budget: 'cost',
    host: 'hosting', hosted: 'hosting', server: 'hosting', maintain: 'care', maintenance: 'care', xpertcare: 'care', support: 'care', looked: 'care', monthly: 'care', month: 'care',
    rank: 'google', ranking: 'google', rankings: 'google', seo: 'google', search: 'google', chatgpt: 'ai', gemini: 'ai', perplexity: 'ai', llm: 'ai', builder: 'xpertcore',
    redo: 'redesign', revamp: 'redesign',  revisions: 'revision', edit: 'revision', edits: 'revision', promise: 'guarantee', guaranteed: 'guarantee', mobile: 'phone', responsive: 'phone', schema: 'structured', markup: 'structured', update: 'change', updates: 'change',
    animation: '3d', animations: '3d', effects: '3d', demos: '3d', xpertlab: '3d', usd: 'dollar', discount: 'yearly', annual: 'yearly', year: 'yearly',
    portfolio: 'built', examples: 'built', site: 'website', sites: 'website', websites: 'website', webpage: 'page', pages: 'page', look: 'care', after: 'care',
    another: 'else', other: 'else', someone: 'else', elsewhere: 'else', existing: 'else', agency: 'else', previous: 'else', team: 'founder', owner: 'founder', who: 'founder', blogs: 'blog', posts: 'blog', articles: 'blog', start: 'start', begin: 'start', process: 'start', steps: 'start', area: 'areas', location: 'areas', overseas: 'areas', abroad: 'areas', international: 'areas', worldwide: 'areas', world: 'areas', global: 'areas', remote: 'areas', remotely: 'areas', countries: 'areas', country: 'areas' };
  // a few questions people ask in many ways: these phrases go straight to their answer
  var INTENT = [[/guarantee|promise|page (1|one)|first page|top of google|number one|#1/, 'Can you guarantee first page on Google?'], [/someone else|another (company|agency|developer|designer)|built elsewhere|wordpress|wix|shopify/, 'Can you look after a website built by someone else?'], [/^how much\b(?!.*(hosting|care|month|usd|dollar))|^what does (it|a website) cost|^(cost|costs|price|prices|pricing)\??$/, 'How much does a website cost?'], [/overseas|abroad|international|worldwide|outside malaysia|other countr|remote|which areas|where do you work/, 'Which areas do you work in?']];
  function words(t) { return t.toLowerCase().replace(/how much/g, 'cost').replace(/who (are|is) (you|seoxpert|behind)/g, 'founder').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1 && STOP.indexOf(w) < 0; }).map(function (w) { var b = w.length > 3 ? w.replace(/s$/, '') : w; return SAME[w] || SAME[b] || b; }); }
  function contact() {
    var parts = [];
    if (data && data.whatsapp) parts.push('<a href="' + data.whatsapp + '">WhatsApp</a>');
    if (data && data.email) parts.push('<a href="' + data.email + '">email</a>');
    parts.push('<a href="/contact/">the contact page</a>');
    return parts.join(parts.length > 2 ? ', ' : ' or ').replace(/, ([^,]*)$/, ' or $1');
  }
  function bubble(cls, html) { var d = document.createElement('div'); d.className = 'bub ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function load() {
    if (!loading) loading = fetch('/chat.json').then(function (r) { if (!r.ok) throw new Error(); return r.json(); }).then(function (d) {
      data = d; index = d.faqs.map(function (f) { return { f: f, q: words(f.q), a: words(f.t) }; });
      // rare words count for more than common ones like "website"
      index.forEach(function (it) { uniq(it.q).forEach(function (w) { dq[w] = (dq[w] || 0) + 1; }); uniq(it.a).forEach(function (w) { da[w] = (da[w] || 0) + 1; }); });
    });
    return loading;
  }
  // the chips under the chat: questions, topics, and a link to every question
  function chip(label, fn, cls) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.addEventListener('click', fn); chips.appendChild(b); }
  function show(list, withTopics) {
    chips.innerHTML = '';
    list.forEach(function (f) { chip(f.q, function () { ask(f.q, f); }); });
    if (withTopics) { var s = document.createElement('small'); s.textContent = 'Or pick a topic'; chips.appendChild(s); data.topics.forEach(function (t) { chip(t, function () { topic(t); }, 'tp'); }); }
    else { chip('Other topics', function () { show([], true); }, 'tp'); var a = document.createElement('a'); a.href = '/faq/'; a.className = 'tp'; a.textContent = 'All questions'; chips.appendChild(a); }
  }
  function topic(t) {
    bubble('me', esc(t)); var list = data.faqs.filter(function (f) { return f.topic === t; });
    bubble('ai', '<b>' + esc(t) + '</b><br>Pick a question, or type your own.'); show(list.filter(function (f) { return !asked[f.q]; }).slice(0, 5), false);
  }
  function related(f) { return data.faqs.filter(function (o) { return o !== f && o.topic === f.topic && !asked[o.q]; }).slice(0, 3); }
  function answer(text, pick) {
    var t = text.toLowerCase(), w = words(text), best = pick || null, score = pick ? 9 : 0;
    if (!pick) INTENT.some(function (it) { if (!it[0].test(t)) return false; best = data.faqs.filter(function (f) { return f.q === it[1]; })[0] || null; score = best ? 9 : 0; return !!best; });
    if (!best) index.forEach(function (it) { var s = 0; uniq(w).forEach(function (x) { if (it.q.indexOf(x) >= 0) s += 2 / Math.sqrt(dq[x]); else if (it.a.indexOf(x) >= 0) s += 1 / Math.sqrt(da[x]); }); if (s > score) { score = s; best = it.f; } });
    if (!pick && /^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t)) return ['Hello. Ask me about website design, prices, website maintenance or how we work.', null];
    if (!pick && /\b(contact|whatsapp|call|talk|speak|human|person|reach)\b/.test(t) && score < 4) return ['You can reach us on ' + contact() + '. A real person reads every message.', null];
    if (best && score >= 1.3) { asked[best.q] = 1; return [best.ready ? best.a : 'We are still finalising this answer. Message us on ' + contact() + ' and we will tell you directly.', best]; }
    return ['I do not have a ready answer for that yet. Message us on ' + contact() + ' and a real person will reply, or pick a topic below.', null];
  }
  function ask(text, pick) {
    bubble('me', esc(text)); var ai = bubble('ai', '<span class="dots"><i></i><i></i><i></i></span>'); chips.innerHTML = '';
    load().then(function () {
      setTimeout(function () { var r = answer(text, pick); ai.innerHTML = r[0]; if (r[1]) { var rel = related(r[1]); show(rel, !rel.length); } else show([], true); log.scrollTop = log.scrollHeight; }, 420);
    }).catch(function () { ai.innerHTML = 'The answers did not load. Message us on ' + contact() + ' and a real person will reply.'; });
  }
  function open() {
    panel.hidden = false; if (fab) fab.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true; var hi = bubble('ai', '<span class="dots"><i></i><i></i><i></i></span>');
      load().then(function () {
        hi.innerHTML = 'Hello. I can give you quick answers about SEOXpert, from ' + data.faqs.length + ' questions people ask us. Pick one, choose a topic, or type your own.';
        var pop = ['How much does a website cost?', 'How does a website project start?', 'Is hosting included?', 'Can you guarantee first page on Google?'];
        show(pop.map(function (q) { return data.faqs.filter(function (f) { return f.q === q; })[0]; }).filter(Boolean), true);
      }).catch(function () { hi.innerHTML = 'Hello. The quick answers did not load. Message us on ' + contact() + ' and a real person will reply.'; });
    }
    if (window.matchMedia('(min-width: 901px)').matches) input.focus();
  }
  function close() { panel.hidden = true; if (fab) { fab.setAttribute('aria-expanded', 'false'); } }
  // load the answers early when someone shows interest in the chat button
  if (fab) ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { fab.addEventListener(ev, function () { load().catch(function () {}); }, { passive: true, once: true }); });
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

/* Top menu dropdowns (Services, Explore): click or keyboard opens one, Escape or a click elsewhere closes it. Hover works without this. */
(function () {
  var all = [].slice.call(document.querySelectorAll('.mdrop'));
  all.forEach(function (d) {
    var b = d.querySelector('button');
    function set(on) { b.setAttribute('aria-expanded', String(on)); d.classList.toggle('shut', !on && d.matches(':hover')); }
    d._set = set;
    b.addEventListener('click', function () { var on = b.getAttribute('aria-expanded') !== 'true'; all.forEach(function (o) { if (o !== d) o._set(false); }); set(on); });
    d.addEventListener('mouseleave', function () { d.classList.remove('shut'); });
    document.addEventListener('click', function (e) { if (!d.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { set(false); b.focus(); } });
  });
})();

/* Homepage XpertLab teaser: animations run only while it is on screen; the dotted globe's script loads when it comes near */
(function () {
  var labs = document.querySelector('.labs'); if (!labs || !('IntersectionObserver' in window)) return; var loaded = false;
  function load(src, done) { var s = document.createElement('script'); s.src = src; s.onload = done; document.head.appendChild(s); }
  new IntersectionObserver(function (es) { labs.classList.toggle('vis', es[0].isIntersecting); }).observe(labs);
  new IntersectionObserver(function (es, io) { if (!es[0].isIntersecting || loaded) return; loaded = true; io.disconnect(); load('/js/land.js', function () { load('/js/lab-teaser.js'); }); }, { rootMargin: '300px 0px' }).observe(labs);
})();
/* Google Analytics: every link and button press is sent as a "button_click" event with its words (button), where it sits
   on the page (place), where it goes (link) and the page it was pressed on (page). Give an element data-track="name" to
   name it yourself. Nothing is sent when analytics is not set up. */
(function () {
  function place(el) {
    var s = el.closest('header,footer,nav,.chatpanel,section[id],section[class],aside,form'); if (!s) return 'page';
    if (s.tagName === 'HEADER') return 'header'; if (s.tagName === 'FOOTER') return 'footer'; if (s.classList.contains('chatpanel')) return 'chat';
    if (s.tagName === 'NAV' && s.closest('.mmenu')) return 'phone_menu'; if (s.tagName === 'NAV') return s.getAttribute('aria-label') || 'nav';
    return s.id || (s.className.split(' ').filter(function (c) { return c && c !== 'band' && c !== 'solid' && c !== 'tint' && c !== 'rv'; })[0]) || 'section';
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a,button,summary,[data-track]'); if (!el || !window.gtag) return;
    var head = el.querySelector('h3,b,strong'), words = (el.getAttribute('data-track') || el.getAttribute('aria-label') || (head ? head.textContent : el.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    var href = el.getAttribute('href') || '';
    gtag('event', 'button_click', { button: words || el.tagName.toLowerCase(), place: place(el), link: href.slice(0, 200), page: location.pathname });
  }, true);
})();
