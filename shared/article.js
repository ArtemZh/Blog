/* Стаття OSS/BSS як окремий розділ портфоліо, на всю ширину.
   Стаття живе своєю копією в assets/articles/oss-bss і не знає про портфоліо:
   фрейм займає весь екран праворуч від рейки й прокручується сам, тож липка
   шапка статті, якорі й панелі деталей працюють як у оригіналі. Скролу в скролі
   немає — сама сторінка-обгортка не прокручується.
   Скрипт лише зшиває краї: мова портфоліо → ?lang= статті, посилання між
   статтями → сторінки 19–23, зовнішні посилання → нова вкладка. */
(function () {
  var ROOT = 'assets/articles/oss-bss/';
  var MAP = {
    'index.html': '19-oss-bss.html',
    'agentic/index.html': '20-agentic-ai.html',
    'support-chat/index.html': '21-support-chat.html',
    'support-voice/index.html': '22-support-voice.html',
    'release/index.html': '23-release.html'
  };
  var f = document.querySelector('.article-frame');
  if (!f) return;

  var lang = null; try { lang = localStorage.getItem('pmp-lang'); } catch (e) {}
  var q = new URLSearchParams(location.search);
  if (!q.get('lang') && lang) q.set('lang', lang);
  var s = q.toString();
  f.src = ROOT + f.dataset.article + (s ? '?' + s : '') + location.hash;

  function wrapperFor(url) {
    var i = url.pathname.indexOf('/' + ROOT);
    if (i < 0) return null;
    var rel = url.pathname.slice(i + ROOT.length + 1) || 'index.html';
    if (rel.slice(-1) === '/') rel += 'index.html';
    return MAP[rel] ? MAP[rel] + url.search + url.hash : null;
  }

  f.addEventListener('load', function () {
    var d;
    try { d = f.contentDocument; } catch (e) { return; }
    if (!d) return;
    /* Назва вкладки — зі статті; позначку «Draft» зі сторінки-обгортки не губимо. */
    if (d.title) {
      var draft = / · Draft$/.test(document.title) && !/Draft/.test(d.title) ? ' · Draft' : '';
      document.title = d.title + draft; f.title = d.title;
    }
    d.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href]');
      if (!a || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
      var url = new URL(a.href, d.baseURI);
      if (url.origin !== location.origin) { a.target = '_blank'; a.rel = 'noopener'; return; }
      if (url.pathname === f.contentWindow.location.pathname && url.hash) return;
      var w = wrapperFor(url);
      if (w) { ev.preventDefault(); location.href = w; }
    });
  });
})();
