/* Дашборд усередині сторінки, а не в новому вікні — і без скролу в скролі.
   Фрейм отримує висоту свого вмісту, тому крутиться сама сторінка: миша не
   гадає, кого прокручувати, і звіт не сидить у смужці. Висота перераховується
   після завантаження, при зміні розміру вікна і при кліках усередині фрейма
   (вкладки дашборда міняють висоту). */
(function () {
  var frames = document.querySelectorAll('.embed-full iframe');
  if (!frames.length) return;

  /* Дашборд свёрстаний під ширший екран, ніж колонка статті. Тому фрейму
     даємо його природну ширину і масштабуємо цілком: нічого не обрізається
     по правому краю і не з'являється горизонтальний скрол. Висоту обгортки
     рахуємо вже після масштабу. */
  function fit(f) {
    try {
      var d = f.contentDocument;
      if (!d || !d.body) return;
      var box = f.parentNode;
      var natural = Math.max(d.body.scrollWidth, d.documentElement.scrollWidth, 1120);
      var avail = box.clientWidth;
      var k = Math.min(1, avail / natural);
      f.style.width = natural + 'px';
      f.style.transformOrigin = 'top left';
      f.style.transform = k < 1 ? 'scale(' + k + ')' : '';
      /* міряємо при мінімальній висоті фрейма: інакше 100vh усередині (бічна панель,
         min-height у body) дорівнює поточній висоті і кожне переміряння додає ще 8px */
      f.style.height = '120px';
      var h = Math.max(d.body.scrollHeight, d.documentElement.scrollHeight);
      f.style.height = (h + 8) + 'px';
      box.style.height = Math.round((h + 8) * k) + 'px';
    } catch (e) { /* інший origin — лишаємо як є */ }
  }

  /* Мова портфоліо → ?lang= дашборда, як у shared/article.js. Перемикач у рейці
     перезавантажує фрейм із новою мовою: дашборд перемальовує все сам при старті. */
  function curLang() {
    var l = window.PMP_LANG || null;
    try { l = localStorage.getItem('pmp-lang') || l; } catch (e) {}
    return l === 'en' || l === 'uk' ? l : null;
  }
  function setLang(f, l) {
    if (!l) return;
    var u = new URL(f.getAttribute('src'), location.href);
    if (u.searchParams.get('lang') === l) return;
    u.searchParams.set('lang', l);
    f.setAttribute('src', u.pathname.replace(/^.*\/assets\//, 'assets/') + u.search + u.hash);
  }
  [].forEach.call(frames, function (f) { setLang(f, curLang()); });
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest || !ev.target.closest('.langsw button')) return;
    setTimeout(function () { [].forEach.call(frames, function (f) { setLang(f, curLang()); }); }, 0);
  });

  [].forEach.call(frames, function (f) {
    var box = f.closest('.embed-full');
    function ready() {
      fit(f);
      if (box) box.classList.add('ready');
      try {
        var d = f.contentDocument;
        /* вкладки й фільтри всередині міняють висоту — переміряємо після кліку */
        d.addEventListener('click', function () { setTimeout(function () { fit(f); }, 120); });
        d.addEventListener('change', function () { setTimeout(function () { fit(f); }, 120); });
        /* rAF: зміна висоти фрейма всередині колбеку давала «ResizeObserver loop» */
        if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(function () { fit(f); }); }).observe(d.body);
      } catch (e) {}
      setTimeout(function () { fit(f); }, 600);
      setTimeout(function () { fit(f); }, 1800);
    }
    if (f.contentDocument && f.contentDocument.readyState === 'complete') ready();
    f.addEventListener('load', ready);
  });
  addEventListener('resize', function () { [].forEach.call(frames, fit); });
})();
