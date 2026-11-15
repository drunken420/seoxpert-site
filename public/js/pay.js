// Pay buttons (Suhen 2026-11-16, Stripe). Any element with data-pay="<id>" (trial, a build like starter, or an XpertRank
// plan like basic with data-bill="month|year") asks /api/checkout for a secure Stripe payment page and goes there.
// The price is never sent from here: the server takes it from packages.ts. If payments are not set up or something
// fails, a link carries on to its own address (the contact form) and a button goes to the contact page.
(function () {
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-pay]');
    if (!el || !el.dataset.pay || el.getAttribute('aria-busy') === 'true') return;
    e.preventDefault();
    var cur = window.__sxCur; if (!cur) try { cur = localStorage.getItem('sx-cur'); } catch (x) {}
    var label = el.innerHTML;
    el.setAttribute('aria-busy', 'true'); el.classList.add('busy'); el.textContent = 'Opening secure payment…';
    function fallback() { el.removeAttribute('aria-busy'); el.classList.remove('busy'); el.innerHTML = label; location.href = el.getAttribute('href') || '/contact/'; }
    fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ item: el.dataset.pay, bill: el.dataset.bill || 'month', cur: cur === 'USD' ? 'USD' : 'RM' }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.ok && d.url) location.href = d.url; else fallback(); })
      .catch(fallback);
  });
  // coming back from Stripe with the Back button: the page may be restored as it was, so wake the buttons up again
  addEventListener('pageshow', function (e) { if (!e.persisted) return; [].forEach.call(document.querySelectorAll('[data-pay][aria-busy]'), function (el) { el.removeAttribute('aria-busy'); el.classList.remove('busy'); location.reload(); }); });
})();
