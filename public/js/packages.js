// Packages: RM or USD switch, Build / XpertCare switch and the "build your plan" picker.
// The page is complete without this file: every price is already in the HTML in RM.
(function () {
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var cur = 'RM';
  try { cur = localStorage.getItem('sx-cur') || (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kuala_Lumpur' ? 'RM' : 'USD'); } catch (e) {}
  if (cur !== 'USD') cur = 'RM';
  var key = function () { return cur === 'USD' ? 'usd' : 'rm'; };

  // Launch offer: hide it by itself once the last day has passed.
  all('[data-pk-offer]').forEach(function (el) { if (new Date() >= new Date(new Date(el.getAttribute('data-pk-offer') + 'T00:00:00+08:00').getTime() + 864e5)) el.hidden = true; });

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
  function sum(k) { return box.querySelector('[data-sum="' + k + '"]'); }
  function chosen(set) { return box.querySelector('[data-pick-set="' + set + '"] button[data-i="' + sel[set] + '"]'); }
  function plain(h) { return h.replace(/<[^>]+>/g, ''); }
  function draw() {
    if (!box) return;
    ['build', 'care'].forEach(function (set) { all('[data-pick-set="' + set + '"] button', box).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === sel[set])); }); });
    var b = chosen('build'), c = sel.care < 0 ? null : chosen('care'), k = key();
    var bp = b.dataset[k], cp = c ? c.dataset[k] : '';
    sum('bn').textContent = b.dataset.name + ' website'; sum('bp').innerHTML = bp + ' <small>once</small>';
    sum('cn').textContent = c ? c.dataset.name : 'No monthly care'; sum('cp').innerHTML = c ? cp + ' <small>a month</small>' : (cur === 'USD' ? '$0' : 'RM0');
    var rows = (b.dataset.free ? ['<b>Launch offer:</b> ' + b.dataset.free] : []).concat(JSON.parse(b.dataset.rows)).concat(c ? JSON.parse(c.dataset.rows) : []).concat(JSON.parse(box.dataset.all)).concat(c ? ['Monthly Google + AI visibility report'] : []);
    sum('list').innerHTML = rows.map(function (r) { return '<li>' + r + '</li>'; }).join('');
    var msg = 'Hello SEOXpert, I would like this plan: ' + b.dataset.name + ' website (' + bp + ' once)' + (c ? ' with ' + c.dataset.name + ' (' + cp + ' a month).' : ', no monthly care.');
    var a = sum('send');
    if (box.dataset.wa) { a.href = 'https://wa.me/' + box.dataset.wa + '?text=' + encodeURIComponent(msg); a.textContent = 'Send this plan on WhatsApp'; }
    else if (box.dataset.mail) { a.href = 'mailto:' + box.dataset.mail + '?subject=' + encodeURIComponent('My SEOXpert plan') + '&body=' + encodeURIComponent(msg); a.textContent = 'Send this plan by email'; }
  }
  if (box) {
    box.hidden = false;
    var sec = box.closest('section'); if (sec) sec.hidden = false;
    box.addEventListener('click', function (e) { var b = e.target.closest('.pkpick button'); if (!b) return; sel[b.parentNode.getAttribute('data-pick-set')] = +b.dataset.i; draw(); });
  }
  // "Choose ..." buttons on the cards fill in the picker
  function pick(v) { var p = (v || '').split(':'); if (!box || !(p[0] in sel) || isNaN(+p[1])) return false; sel[p[0]] = +p[1]; draw(); return true; }
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
    all('span[data-rm][data-usd]').forEach(function (el) { el.textContent = el.getAttribute('data-' + key()); });
    draw();
    if (save) try { localStorage.setItem('sx-cur', c); } catch (e) {}
  }
  all('[data-pk-curbar]').forEach(function (el) { el.hidden = false; });
  curBtns.forEach(function (b) { b.addEventListener('click', function () { setCur(b.dataset.c, true); }); });
  setCur(cur, false);
})();
