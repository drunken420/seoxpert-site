(function () {
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }); rv.forEach(function (el) { io.observe(el); }); } else rv.forEach(function (el) { el.classList.add('in'); });
  var head = document.querySelector('.site-head');
  function hh() { document.documentElement.style.setProperty('--head-h', head.offsetHeight + 'px'); }
  hh(); window.addEventListener('resize', hh);
  /* FAQ chat */
  var log = document.getElementById('chatlog'), src = [].slice.call(document.querySelectorAll('#faqsrc p')), btns = [].slice.call(document.querySelectorAll('.qlist button')), tmr = 0;
  function ask(i, instant) {
    btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
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
