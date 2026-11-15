/* Contact form: sends to /api/contact (a Cloudflare Pages Function), shows a thank-you on success. */
(function () {
  var f = document.getElementById('cform'); if (!f) return;
  var st = f.querySelector('.cstatus'), btn = f.querySelector('button[type=submit]');
  // "What do you need?": a short line under the choices says what the picked one is. A choice can also be picked from
  // the cards above the form (data-need) or from a link such as /contact/?need=trial.
  var hint = document.getElementById('chint'), radios = [].slice.call(f.querySelectorAll('input[name=need]'));
  function pick(v) { radios.forEach(function (x) { if (x.value === v) x.checked = true; }); show(); }
  function show() { var c = radios.filter(function (x) { return x.checked; })[0]; if (hint && c) hint.textContent = c.getAttribute('data-hint') || ''; }
  radios.forEach(function (x) { x.addEventListener('change', show); });
  [].forEach.call(document.querySelectorAll('[data-need]'), function (a) { a.addEventListener('click', function () { pick(a.getAttribute('data-need')); }); });
  var want = (/[?&]need=([a-z]+)/.exec(location.search) || [])[1];
  if (want) pick({ website: 'Website design', both: 'Website and XpertRank', seo: 'XpertRank for my website', trial: 'XpertRank Trial' }[want] || 'Not sure yet');
  function say(t, cls) { st.textContent = t; st.className = 'cstatus ' + (cls || ''); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    ['name', 'email', 'message'].forEach(function (n) {
      var el = f.elements[n], ok = el.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = el;
    });
    if (bad) { say(bad.name === 'email' && bad.value ? 'Please check your email address.' : 'Please fill in your name, email and message.', 'err'); bad.focus(); return; }
    btn.disabled = true; say('Sending…');
    fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'fail'); }); })
      .then(function () {
        var name = f.elements.name.value.trim().split(' ')[0];
        var d = document.createElement('div'); d.className = 'cdone';
        d.innerHTML = '<i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></i><b>Thanks, ' + name.replace(/[<>&"]/g, '') + '!</b><p>Your message is on its way to us. We have also sent a copy to your email.</p>';
        f.appendChild(d); f.classList.add('sent'); f.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (window.gtag) gtag('event', 'generate_lead', { method: 'contact_form' });
      })
      .catch(function () { btn.disabled = false; say('Sorry, that did not send. Please email us at contact@seoxpert.my instead.', 'err'); });
  });
})();
