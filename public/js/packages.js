// Packages: RM or USD switch, Build / XpertRank switch and the "build your plan" picker.
// The page is complete without this file: every price is already in the HTML in RM.
(function () {
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  // RM or USD: picked by the visitor's country (or their own choice) in the inline script at the end of Base.astro (window.sxCur)
  var cur = window.sxCur ? window.sxCur.get() : 'RM';
  if (cur !== 'USD') cur = 'RM';
  var key = function () { return cur === 'USD' ? 'usd' : 'rm'; };
  var bill = 'month'; // XpertRank: pay monthly, or yearly with 2 months free

  // Launch offer: hide it by itself once the last day has passed.
  // After the offer, the new price (kept under the launch price) takes its place, until the site is next rebuilt.
  all('.pkwas[data-pk-offer]').forEach(function (el) { var end = new Date(el.getAttribute('data-pk-offer') + 'T00:00:00+08:00').getTime() + 864e5; if (Date.now() < end) return;
    var n = el.querySelector('span[data-rm]'), p = el.parentNode.querySelector('.pkprice span[data-rm]'); if (!n || !p) return;
    ['data-rm', 'data-usd', 'data-rm-y', 'data-usd-y'].forEach(function (a) { if (n.hasAttribute(a)) p.setAttribute(a, n.getAttribute(a)); }); p.textContent = n.textContent; n.removeAttribute('data-rm'); });
  all('[data-pk-offer]').forEach(function (el) { var end = new Date(el.getAttribute('data-pk-offer') + 'T00:00:00+08:00').getTime() + 864e5, left = Math.ceil((end - Date.now()) / 864e5); if (left <= 0) { el.hidden = true; return; }
    var tag = el.querySelector('[data-pk-left]'); if (tag) { tag.textContent = left === 1 ? 'Last day' : left + ' days left'; tag.hidden = false; } });

  // Build / XpertRank switch (cards)
  all('[data-pk]').forEach(function (pk) {
    var kind = pk.querySelector('[data-pk-kind]'); if (!kind) return;
    var sets = all('.pkset', pk), btns = all('button', kind);
    function show(k) { btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); }); sets.forEach(function (s) { s.hidden = s.dataset.set !== k; }); }
    kind.hidden = false; pk.classList.add('switched');
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.k); }); });
    show(location.hash === '#xpertrank' ? 'care' : 'build');
    pk.showKind = show;
  });

  // Plan picker
  var box = document.getElementById('planpicker'), sel = { build: 1, care: 1 };
  if (box && box.dataset.offerEnds && Date.now() >= new Date(box.dataset.offerEnds + 'T00:00:00+08:00').getTime() + 864e5) {
    all('.pkpick button[data-rm-n]', box).forEach(function (b) { ['rm', 'usd', 'rm-y', 'usd-y'].forEach(function (a) { var v = b.getAttribute('data-' + a + '-n'); if (!v) return; b.setAttribute('data-' + a, v); var sp = b.querySelector(':scope > span[data-rm]'); if (sp) sp.setAttribute('data-' + a, v); }); var sp = b.querySelector(':scope > span[data-rm]'); if (sp) sp.textContent = sp.getAttribute('data-rm'); });
    all('.pkn', box).forEach(function (el) { el.remove(); });
    all('.pkpick button[data-free]', box).forEach(function (b) { b.removeAttribute('data-free'); }); // the summary's "Launch offer" row ends with the offer
  }
  // The biggest care plan a website size can take: the same position, and the biggest website (Growth) takes every plan.
  // "I already have a website" is the last card in step 1: any XpertRank plan, at the price for websites built elsewhere.
  function isOwn() { var b = box && box.querySelector('[data-pick-set="build"] button[data-i="' + sel.build + '"]'); return !!(b && b.dataset.own); }
  function capFor(i) { var last = all('[data-pick-set="build"] button:not([data-own])', box).length - 1; return i >= last ? 99 : i; }
  function sum(k) { return box.querySelector('[data-sum="' + k + '"]'); }
  function chosen(set) { return box.querySelector('[data-pick-set="' + set + '"] button[data-i="' + sel[set] + '"]'); }
  function plain(h) { return h.replace(/<[^>]+>/g, ''); }
  function draw() {
    if (!box) return;
    /* a care plan can be as big as the website, not bigger: Starter takes Basic, Business takes Basic or Plus, Growth takes any (Pro or Elite too) */
    var own = isOwn(), cap = capFor(sel.build);
    if (sel.care > cap) sel.care = cap;
    if (own && sel.care < 0) sel.care = 0; // keeping your own website only makes sense with an XpertRank plan
    box.classList.toggle('own', own);
    all('[data-pick-set="care"] [data-rm-o]', box).forEach(function (el) { var a = 'data-' + key() + (bill === 'year' ? '-y' : '') + (own ? '-o' : ''); if (el.tagName === 'SPAN') el.textContent = el.getAttribute(a); });
    all('[data-pick-set="care"] button', box).forEach(function (b) { var off = +b.dataset.i > cap || (own && b.dataset.i === '-1'); b.classList.toggle('off', off); b.setAttribute('aria-disabled', String(off)); if (off) b.setAttribute('tabindex', '-1'); else b.removeAttribute('tabindex'); var n = b.querySelector('em'); if (n) n.hidden = !off; });
    ['build', 'care'].forEach(function (set) { all('[data-pick-set="' + set + '"] button', box).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === sel[set])); }); });
    var b = chosen('build'), c = sel.care < 0 ? null : chosen('care'), k = key();
    var yr = bill === 'year', per = yr ? 'a year' : 'a month';
    var bp = b.dataset[k], cp = c ? c.dataset[(yr ? k + 'Y' : k) + (own ? 'O' : '')] : '';
    sum('bn').textContent = own ? 'Your own website' : b.dataset.name + ' website'; sum('bp').innerHTML = own ? '' : bp;
    var ends = box.dataset.offerEnds, live = ends && Date.now() < new Date(ends + 'T00:00:00+08:00').getTime() + 864e5, lt = sum('later');
    if (lt) { lt.hidden = !live || own; if (live && !own) lt.innerHTML = 'Launch prices until ' + box.dataset.offerText + '. From 1 February 2027: <s>' + b.dataset[k + 'N'] + '</s>' + (c ? ' and <s>' + c.dataset[(yr ? k + 'YN' : k + 'N')] + '</s> ' + per : '') + '.'; }
    sum('cn').innerHTML = c ? c.dataset.name + (c.dataset.kw ? '<em class="pksumkw">' + c.dataset.kw + ' target keywords</em>' : '') : 'No SEO plan'; // keywords = the main difference (Suhen 2026-11-16) sum('cp').innerHTML = c ? cp + ' <small>' + per + '</small>' : (cur === 'USD' ? '$0' : 'RM0');
    var rows = (b.dataset.free ? ['<b>Launch offer:</b> ' + b.dataset.free] : []).concat(JSON.parse(b.dataset.rows)).concat(c ? JSON.parse(c.dataset.rows) : []).concat(own ? [] : JSON.parse(box.dataset.all)).concat(c ? ['Monthly Google + AI visibility report'] : []).concat(c && yr ? ['<b>Paid yearly:</b> 2 months free'] : []);
    sum('list').innerHTML = rows.map(function (r) { return '<li>' + r + '</li>'; }).join('');
    var msg = own ? 'Hello SEOXpert, I already have a website and would like ' + c.dataset.name + ' (' + cp + ' ' + per + (yr ? ', paid yearly' : '') + ').'
      : 'Hello SEOXpert, I would like this plan: ' + b.dataset.name + ' website (' + bp + ')' + (c ? ' with ' + c.dataset.name + ' (' + cp + ' ' + per + (yr ? ', paid yearly' : '') + ').' : ', no SEO plan.');
    // Pay and start (only when online payments are switched on, site.payments in src/config.ts; Suhen 2026-11-16).
    // A new website is paid in full before we start; its XpertRank plan starts after launch, through a link we send.
    // Keeping your own website starts XpertRank at once, charged every month or year.
    var pay = sum('pay');
    if (pay) {
      if (own) { pay.dataset.pay = c.dataset.id; pay.dataset.bill = bill; pay.innerHTML = 'Pay ' + cp + ' and start'; }
      else { pay.dataset.pay = b.dataset.id; delete pay.dataset.bill; pay.innerHTML = 'Pay ' + bp + ' and start'; }
    }
    var a = sum('send');
    if (box.dataset.wa) { a.href = 'https://wa.me/' + box.dataset.wa + '?text=' + encodeURIComponent(msg); a.textContent = 'Talk to us'; }
    else if (box.dataset.mail) { a.href = 'mailto:' + box.dataset.mail + '?subject=' + encodeURIComponent('My SEOXpert plan') + '&body=' + encodeURIComponent(msg); a.textContent = 'Talk to us'; }
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
    cur = c; window.__sxCur = c; // pay.js pays in the currency on screen
    curBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === c)); });
    all('span[data-rm][data-usd]').forEach(function (el) { if (el.hasAttribute('data-rm-o')) return; el.textContent = el.getAttribute('data-' + key() + (bill === 'year' && el.hasAttribute('data-rm-y') ? '-y' : '')); });
    all('[data-unit]').forEach(function (el) { el.textContent = bill === 'year' ? 'a year' : 'a month'; });
    draw();
    if (save && window.sxCur) window.sxCur.set(c, true); // remembered, and the footer switch and other prices follow
  }
  if (window.sxCur) window.sxCur.on(function (c) { if (c !== cur) setCur(c, false); }); // the footer switch
  all('[data-pk-curbar]').forEach(function (el) { el.hidden = false; });
  // Pay monthly or yearly (XpertRank)
  var billBtns = all('[data-pk-bill] button');
  all('[data-pk-bill]').forEach(function (el) { el.hidden = false; });
  billBtns.forEach(function (b) { b.addEventListener('click', function () { bill = b.dataset.b; billBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.b === bill)); }); document.documentElement.classList.toggle('pk-yearly', bill === 'year'); setCur(cur); }); });
  curBtns.forEach(function (b) { b.addEventListener('click', function () { setCur(b.dataset.c, true); }); });
  setCur(cur, false);

  // Links that land in the right place (Suhen 2026-11-15): /packages/#xpertrank opens the XpertRank cards and scrolls to them,
  // and the "Backed by our money-back promise" chip shows the promise inside the plan summary. That summary is sticky on
  // computers, so the browser's own jump went past it: we scroll it into the middle of the screen and make it glow.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  var pkc = document.querySelector('[data-pk]');
  if (location.hash === '#xpertrank' && pkc) setTimeout(function () { pkc.scrollIntoView({ behavior: 'auto', block: 'start' }); }, 60);
  // Links to this same page ("See the plans" = /packages/#xpertrank, "Compare the packages" = /packages/) used to do nothing
  // or jump to the top, because the browser does not reload a page for its own address (Suhen 2026-11-16). Open the right
  // set of cards and scroll to them instead.
  if (pkc) all('a[href]').forEach(function (a) {
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }
    if (u.origin !== location.origin || u.pathname !== location.pathname || (u.hash && u.hash !== '#xpertrank') || pkc.contains(a)) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var care = u.hash === '#xpertrank';
      if (pkc.showKind) pkc.showKind(care ? 'care' : 'build');
      if (history.replaceState) history.replaceState(null, '', care ? '#xpertrank' : location.pathname);
      pkc.scrollIntoView({ behavior: reduce, block: 'start' });
    });
  });
  all('a[href="#promise"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var pm = document.getElementById('promise'); if (!pm) return;
      e.preventDefault();
      var r = pm.getBoundingClientRect(), head = (document.querySelector('header') || { offsetHeight: 70 }).offsetHeight;
      if (r.top < head + 8 || r.bottom > innerHeight - 8) {
        var sum = pm.closest('.pksum'), sticky = sum && getComputedStyle(sum).position === 'sticky';
        // a sticky summary is taller than the screen and only shows its end at the bottom of the picker, so scroll there; otherwise centre the promise itself
        if (sticky) scrollTo({ top: scrollY + box.getBoundingClientRect().bottom - innerHeight + 32, behavior: reduce }); else pm.scrollIntoView({ behavior: reduce, block: 'center' });
      }
      pm.classList.remove('glow'); void pm.offsetWidth; pm.classList.add('glow');
    });
  });
  // The "Money-back promise included" chip on every XpertRank card goes to the promise under the cards (Suhen 2026-11-15)
  all('a[href="#money-back"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var pm = document.getElementById('money-back'); if (!pm) return;
      e.preventDefault();
      pm.scrollIntoView({ behavior: reduce, block: 'center' });
      if (history.replaceState) history.replaceState(null, '', '#money-back');
      pm.classList.remove('glow'); void pm.offsetWidth; pm.classList.add('glow');
    });
  });
})();

// Phones: the swipe dots under the package cards follow the card in view, and the Recommended card is shown first (Suhen 2026-11-16).
(function () {
  if (!window.matchMedia('(max-width:700px)').matches) return;
  document.querySelectorAll('.pkcards').forEach(function (row) {
    var dots = row.nextElementSibling; if (!dots || !dots.classList.contains('pkswipe')) return;
    var cards = row.querySelectorAll('.pkcard'), hot = row.querySelector('.pkcard.hot');
    function mark() { var x = row.scrollLeft, best = 0, d = 1e9; cards.forEach(function (c, i) { var e = Math.abs(c.offsetLeft - row.offsetLeft - x - parseFloat(getComputedStyle(row).paddingLeft) + 16); if (e < d) { d = e; best = i; } }); dots.querySelectorAll('i').forEach(function (n, i) { n.classList.toggle('on', i === best); }); }
    row.addEventListener('scroll', function () { window.requestAnimationFrame(mark); }, { passive: true });
    if (hot) row.scrollLeft = hot.offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft);
    mark();
  });
})();
