// Packages: RM or USD switch, Build / XpertCare switch and the "build your plan" picker.
// The page is complete without this file: every price is already in the HTML in RM.
(function () {
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var cur = 'RM';
  try { cur = localStorage.getItem('sx-cur') || (/^Asia\/(Kuala_Lumpur|Kuching)$/.test(Intl.DateTimeFormat().resolvedOptions().timeZone) ? 'RM' : 'USD'); } catch (e) {}
  if (cur !== 'USD') cur = 'RM';
  var key = function () { return cur === 'USD' ? 'usd' : 'rm'; };
  var bill = 'month'; // XpertCare: pay monthly, or yearly with 2 months free

  // Launch offer: hide it by itself once the last day has passed.
  // After the offer, the new price (kept under the launch price) takes its place, until the site is next rebuilt.
  all('.pkwas[data-pk-offer]').forEach(function (el) { var end = new Date(el.getAttribute('data-pk-offer') + 'T00:00:00+08:00').getTime() + 864e5; if (Date.now() < end) return;
    var n = el.querySelector('span[data-rm]'), p = el.parentNode.querySelector('.pkprice span[data-rm]'); if (!n || !p) return;
    ['data-rm', 'data-usd', 'data-rm-y', 'data-usd-y'].forEach(function (a) { if (n.hasAttribute(a)) p.setAttribute(a, n.getAttribute(a)); }); p.textContent = n.textContent; n.removeAttribute('data-rm'); });
  all('[data-pk-offer]').forEach(function (el) { var end = new Date(el.getAttribute('data-pk-offer') + 'T00:00:00+08:00').getTime() + 864e5, left = Math.ceil((end - Date.now()) / 864e5); if (left <= 0) { el.hidden = true; return; }
    var tag = el.querySelector('[data-pk-left]'); if (tag) { tag.textContent = left === 1 ? 'Last day' : left + ' days left'; tag.hidden = false; } });

  // Build / XpertCare switch (cards)
  all('[data-pk]').forEach(function (pk) {
    var kind = pk.querySelector('[data-pk-kind]'); if (!kind) return;
    var sets = all('.pkset', pk), btns = all('button', kind);
    function show(k) { btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); }); sets.forEach(function (s) { s.hidden = s.dataset.set !== k; }); }
    kind.hidden = false; pk.classList.add('switched');
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.k); }); });
    show(location.hash === '#xpertcare' ? 'care' : 'build');
    pk.showKind = show;
  });

  // Plan picker
  var box = document.getElementById('planpicker'), sel = { build: 1, care: 1 };
  if (box && box.dataset.offerEnds && Date.now() >= new Date(box.dataset.offerEnds + 'T00:00:00+08:00').getTime() + 864e5) {
    all('.pkpick button[data-rm-n]', box).forEach(function (b) { ['rm', 'usd', 'rm-y', 'usd-y'].forEach(function (a) { var v = b.getAttribute('data-' + a + '-n'); if (!v) return; b.setAttribute('data-' + a, v); var sp = b.querySelector(':scope > span[data-rm]'); if (sp) sp.setAttribute('data-' + a, v); }); var sp = b.querySelector(':scope > span[data-rm]'); if (sp) sp.textContent = sp.getAttribute('data-rm'); });
    all('.pkn', box).forEach(function (el) { el.remove(); });
  }
  // The biggest care plan a website size can take: the same position, and the biggest website (Growth) takes every plan.
  function capFor(i) { var last = all('[data-pick-set="build"] button', box).length - 1; return i >= last ? 99 : i; }
  function sum(k) { return box.querySelector('[data-sum="' + k + '"]'); }
  function chosen(set) { return box.querySelector('[data-pick-set="' + set + '"] button[data-i="' + sel[set] + '"]'); }
  function plain(h) { return h.replace(/<[^>]+>/g, ''); }
  function draw() {
    if (!box) return;
    /* a care plan can be as big as the website, not bigger: Starter takes Basic, Business takes Basic or Plus, Growth takes any (Pro or Elite too) */
    var cap = capFor(sel.build);
    if (sel.care > cap) sel.care = cap;
    all('[data-pick-set="care"] button', box).forEach(function (b) { var off = +b.dataset.i > cap; b.classList.toggle('off', off); b.setAttribute('aria-disabled', String(off)); if (off) b.setAttribute('tabindex', '-1'); else b.removeAttribute('tabindex'); var n = b.querySelector('em'); if (n) n.hidden = !off; });
    ['build', 'care'].forEach(function (set) { all('[data-pick-set="' + set + '"] button', box).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === sel[set])); }); });
    var b = chosen('build'), c = sel.care < 0 ? null : chosen('care'), k = key();
    var yr = bill === 'year', per = yr ? 'a year' : 'a month';
    var bp = b.dataset[k], cp = c ? c.dataset[yr ? k + 'Y' : k] : '';
    sum('bn').textContent = b.dataset.name + ' website'; sum('bp').innerHTML = bp + ' <small>once</small>';
    var ends = box.dataset.offerEnds, live = ends && Date.now() < new Date(ends + 'T00:00:00+08:00').getTime() + 864e5, lt = sum('later');
    if (lt) { lt.hidden = !live; if (live) lt.innerHTML = 'Launch prices until ' + box.dataset.offerText + '. From 1 February 2027: <s>' + b.dataset[k + 'N'] + '</s> once' + (c ? ' and <s>' + c.dataset[(yr ? k + 'YN' : k + 'N')] + '</s> ' + per : '') + '.'; }
    sum('cn').textContent = c ? c.dataset.name : 'No monthly care'; sum('cp').innerHTML = c ? cp + ' <small>' + per + '</small>' : (cur === 'USD' ? '$0' : 'RM0');
    var rows = (b.dataset.free ? ['<b>Launch offer:</b> ' + b.dataset.free] : []).concat(JSON.parse(b.dataset.rows)).concat(c ? JSON.parse(c.dataset.rows) : []).concat(JSON.parse(box.dataset.all)).concat(c ? ['Monthly Google + AI visibility report'] : []).concat(c && yr ? ['<b>Paid yearly:</b> 2 months free'] : []);
    sum('list').innerHTML = rows.map(function (r) { return '<li>' + r + '</li>'; }).join('');
    var msg = 'Hello SEOXpert, I would like this plan: ' + b.dataset.name + ' website (' + bp + ' once)' + (c ? ' with ' + c.dataset.name + ' (' + cp + ' ' + per + (yr ? ', paid yearly' : '') + ').' : ', no monthly care.');
    var a = sum('send');
    if (box.dataset.wa) { a.href = 'https://wa.me/' + box.dataset.wa + '?text=' + encodeURIComponent(msg); a.textContent = 'Send this plan on WhatsApp'; }
    else if (box.dataset.mail) { a.href = 'mailto:' + box.dataset.mail + '?subject=' + encodeURIComponent('My SEOXpert plan') + '&body=' + encodeURIComponent(msg); a.textContent = 'Send this plan by email'; }
  }
  if (box) {
    box.hidden = false;
    var sec = box.closest('section'); if (sec) sec.hidden = false;
    box.addEventListener('click', function (e) { var b = e.target.closest('.pkpick button'); if (!b || b.classList.contains('off')) return; sel[b.parentNode.getAttribute('data-pick-set')] = +b.dataset.i; draw(); });
  }
  // "Choose ..." buttons on the cards fill in the picker
  function pick(v) { var p = (v || '').split(':'); if (!box || !(p[0] in sel) || isNaN(+p[1])) return false; sel[p[0]] = +p[1]; if (p[0] === 'care' && sel.care > capFor(sel.build)) sel.build = Math.min(sel.care, all('[data-pick-set="build"] button', box).length - 1); draw(); return true; }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-pick]'); if (!a || !box) return;
    if (pick(a.dataset.pick)) { e.preventDefault(); box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  });
  // Arriving from another page: /packages/?plan=care:2#plan
  var m = /[?&]plan=(build|care):(\d)/.exec(location.search); if (m) pick(m[1] + ':' + m[2]);

  // Currency
  var curBtns = all('[data-pk-cur] button');
  function setCur(c, save) {
    cur = c;
    curBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === c)); });
    all('span[data-rm][data-usd]').forEach(function (el) { el.textContent = el.getAttribute('data-' + key() + (bill === 'year' && el.hasAttribute('data-rm-y') ? '-y' : '')); });
    all('[data-unit]').forEach(function (el) { el.textContent = bill === 'year' ? 'a year' : 'a month'; });
    draw();
    if (save) try { localStorage.setItem('sx-cur', c); } catch (e) {}
  }
  all('[data-pk-curbar]').forEach(function (el) { el.hidden = false; });
  // Pay monthly or yearly (XpertCare)
  var billBtns = all('[data-pk-bill] button');
  all('[data-pk-bill]').forEach(function (el) { el.hidden = false; });
  billBtns.forEach(function (b) { b.addEventListener('click', function () { bill = b.dataset.b; billBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.b === bill)); }); document.documentElement.classList.toggle('pk-yearly', bill === 'year'); setCur(cur); }); });
  curBtns.forEach(function (b) { b.addEventListener('click', function () { setCur(b.dataset.c, true); }); });
  setCur(cur, false);
})();
