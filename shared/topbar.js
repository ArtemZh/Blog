/* Шапка с полосой прочитанного.
 *
 * Полоса — не украшение, а показание: сколько документа пройдено. Засечки на
 * ней — разделы страницы; наведение показывает название, нажатие переносит.
 * Разметку страниц скрипт не трогает: и полосу, и засечки строит сам.
 *
 * Механика взята из busy-hub: считаем по прокручиваемой длине, а не по высоте
 * документа, иначе край заливки не совпадёт с засечкой в момент, когда раздел
 * действительно достигнут. */
(function () {
  var MIN = 400;                 /* короче — полоса бессмысленна */
  var GAP = 22;                  /* минимальный зазор между центрами засечек */
  var HEAD = 84;                 /* высота шапки: раздел «достигнут» под ней */

  var bar = document.querySelector('.topbar');
  if (!bar) return;

  function maxScroll() {
    var d = document.documentElement;
    return Math.max(d.scrollHeight, document.body ? document.body.scrollHeight : 0) - d.clientHeight;
  }

  var trk = bar.querySelector('.trk');
  var fil = bar.querySelector('.fil');
  if (!trk) return;

  var secs = [].slice.call(document.querySelectorAll('main section[id]'))
    .filter(function (s) { return s.querySelector('h2'); });

  var ticks = secs.map(function (s) {
    var a = document.createElement('a');
    a.className = 'tk';
    a.href = '#' + s.id;
    var name = s.querySelector('h2').textContent;
    a.setAttribute('aria-label', 'To section: ' + name);
    var tt = document.createElement('span');
    tt.className = 'tt';
    tt.textContent = name;
    a.appendChild(tt);
    trk.appendChild(a);
    return { el: a, sec: s };
  });

  /* Засечки разводятся так, чтобы соседи не слипались: сначала честные
     проценты, потом проход в пикселях с минимальным зазором. Порядок
     разделов сохраняется, крайние прижимаются к границам полосы. */
  function place(max) {
    var w = trk.clientWidth;
    var pos = ticks.map(function (t) {
      var top = t.sec.getBoundingClientRect().top + window.pageYOffset - HEAD;
      return Math.min(1, Math.max(0, top / max)) * w;
    });
    if (w > GAP * ticks.length) {
      for (var i = 1; i < pos.length; i++)
        if (pos[i] - pos[i - 1] < GAP) pos[i] = pos[i - 1] + GAP;
      for (var j = pos.length - 1; j > 0; j--) {
        if (pos[j] > w) pos[j] = w;
        if (pos[j] - pos[j - 1] < GAP) pos[j - 1] = pos[j] - GAP;
      }
      if (pos[0] < 0) pos[0] = 0;
    }
    ticks.forEach(function (t, i) { t.el.style.left = (w ? (pos[i] / w) * 100 : 0) + '%'; });
  }

  var ticking = false, last = -1;

  function paint() {
    ticking = false;
    var max = maxScroll();
    if (max < MIN) { trk.style.visibility = 'hidden'; return; }
    trk.style.visibility = '';
    place(max);

    var cur = -1;
    ticks.forEach(function (t, i) {
      var passed = t.sec.getBoundingClientRect().top <= HEAD;
      t.el.setAttribute('data-passed', passed ? '1' : '0');
      if (passed) cur = i;
    });
    ticks.forEach(function (t, i) {
      if (i === cur) t.el.setAttribute('data-cur', '1'); else t.el.removeAttribute('data-cur');
    });

    var pct = Math.min(100, Math.max(0, (window.pageYOffset / max) * 100));
    var r = Math.round(pct);
    if (r === last) return;
    last = r;
    fil.style.width = pct.toFixed(2) + '%';
    trk.setAttribute('aria-valuenow', r);
  }

  /* rAF в скрытой вкладке не вызывается вовсе — полоса застыла бы на нуле. */
  function tick() {
    if (ticking) return;
    ticking = true;
    if (document.visibilityState === 'hidden') setTimeout(paint, 0);
    else requestAnimationFrame(paint);
  }

  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  addEventListener('load', tick);
  document.addEventListener('visibilitychange', tick);
  setTimeout(tick, 600);
  paint();
})();
