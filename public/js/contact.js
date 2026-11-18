/* Contact form: sends to /api/contact (a Cloudflare Pages Function), shows a thank-you on success. */
(function () {
  var f = document.getElementById('cform'); if (!f) return;
  var st = f.querySelector('.cstatus'), btn = f.querySelector('button[type=submit]');
  // "What do you need?": a short line under the choices says what the picked one is. A choice can also be picked from
  // the cards above the form (data-need) or from a link such as /contact/?need=trial.
  var hint = document.getElementById('chint'), radios = [].slice.call(f.querySelectorAll('input[name=need]'));
  function pick(v) { radios.forEach(function (x) { if (x.value === v) x.checked = true; }); show(); }
  function show() { var c = radios.filter(function (x) { return x.checked; })[0]; if (hint && c) hint.textContent = c.getAttribute(window.sxCur && window.sxCur.get() === 'USD' && c.hasAttribute('data-hint-usd') ? 'data-hint-usd' : 'data-hint') || ''; }
  if (window.sxCur) { window.sxCur.on(show); show(); } // the hint follows the RM / USD choice (prices by country, Suhen 2026-11-16)
  radios.forEach(function (x) { x.addEventListener('change', show); });
  [].forEach.call(document.querySelectorAll('[data-need]'), function (a) { a.addEventListener('click', function () { pick(a.getAttribute('data-need')); }); });
  var want = (/[?&]need=([a-z]+)/.exec(location.search) || [])[1];
  if (want) pick({ website: 'Website design', both: 'Website and XpertRank', seo: 'XpertRank for my website', trial: 'XpertRank Trial' }[want] || 'Not sure yet');
  function say(t, cls) { st.textContent = t; st.className = 'cstatus ' + (cls || ''); }
  // Spam check (Cloudflare Turnstile, 2026-11-19): its script loads only when the form comes near the screen (600px) or a
  // box in it is used, so the page itself stays fast. Sending waits until the check has given its token.
  var ts = f.querySelector('.cf-turnstile'), tsOn = false;
  function loadTs() {
    if (!ts || tsOn) return; tsOn = true;
    var s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'; s.async = true; s.defer = true; document.head.appendChild(s);
  }
  if (ts) {
    // the check box takes space only while it asks the visitor to click (data-before/after-interactive-callback in contact.astro)
    window.sxTsShow = function () { ts.classList.add('on'); };
    window.sxTsHide = function () { ts.classList.remove('on'); };
    f.addEventListener('focusin', loadTs);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es.some(function (x) { return x.isIntersecting; })) { o.disconnect(); loadTs(); } }, { rootMargin: '600px 0px' }).observe(f);
    else loadTs();
  }
  function token() { var t = f.querySelector('[name="cf-turnstile-response"]'); return t ? t.value : ''; }
  // waits up to 30 seconds for the token (the check may ask the visitor to tick a box), then calls go(true) or go(false)
  function ready(go) {
    if (!ts || token()) return go(true);
    loadTs(); say('Checking you are a real person…');
    var tries = 0, tm = setInterval(function () { if (token()) { clearInterval(tm); go(true); } else if (++tries > 100) { clearInterval(tm); go(false); } }, 300);
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    ['name', 'email', 'message'].forEach(function (n) {
      var el = f.elements[n], ok = el.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = el;
    });
    if (bad) { say(bad.name === 'email' && bad.value ? 'Please check your email address.' : 'Please fill in your name, email and message.', 'err'); bad.focus(); return; }
    btn.disabled = true;
    ready(function (ok) { if (ok) send(); else { btn.disabled = false; say('The spam check did not finish. Please complete it above the Send button, then press Send again.', 'err'); } });
  });
  function send() {
    say('Sending…');
    fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'fail'); }); })
      .then(function () {
        var name = f.elements.name.value.trim().split(' ')[0];
        var d = document.createElement('div'); d.className = 'cdone';
        d.innerHTML = '<i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></i><b>Thanks, ' + name.replace(/[<>&"]/g, '') + '!</b><p>Your message is on its way to us. We have also sent a copy to your email.</p>';
        f.appendChild(d); f.classList.add('sent'); f.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (window.gtag) gtag('event', 'generate_lead', { method: 'contact_form' });
      })
      .catch(function () { btn.disabled = false; if (window.turnstile && ts) try { window.turnstile.reset(ts); } catch (x) {} say('Sorry, that did not send. Please email us at contact@seoxpert.my instead.', 'err'); });
  }
})();
