/* Перемикач мови. Українська живе в самій розмітці, англійська — в атрибуті data-en
   на тому ж елементі. Скрипт лише міняє їх місцями, тому переклад стоїть поруч
   із оригіналом і не роз'їжджається з ним при правках.

   Розмітка всередині перекладу дозволена: підставляється через innerHTML, а українська
   версія запам'ятовується в data-uk при першому перемиканні.
   Сторінки 13, 14 і 14a — методологічні схеми з термінами PMI; вони лишаються
   англійськими й перемикача не мають. */
(function () {
  var KEY = 'pmp-lang';
  var q = new URLSearchParams(location.search).get('lang');
  /* Сторінка може задати мову за замовчуванням (<html data-lang-default="en"> — хаб).
     Вона діє при першому відкритті в сесії браузера; щойно людина сама перемкнула
     мову (SKEY у sessionStorage), шануємо її вибір до кінця сесії. */
  var SKEY = 'pmp-lang-picked';
  var def = document.documentElement.getAttribute('data-lang-default');
  var picked = false; try { picked = sessionStorage.getItem(SKEY) === '1'; } catch (e) {}
  var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  var lang = q === 'en' || q === 'uk' ? q : (def && !picked ? def : (saved || 'uk'));
  /* Сторінки зі схемами, які малюються з даних один раз, перемальовуються перезавантаженням:
     дешевше, ніж тримати в кожному рендерері окремий шлях оновлення. */
  window.PMP_LANG = lang;

  function apply(l) {
    var nodes = document.querySelectorAll('[data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.dataset.uk === undefined) n.dataset.uk = n.innerHTML;
      n.innerHTML = l === 'en' ? n.dataset.en : n.dataset.uk;
    }
    var t = document.querySelector('title');
    if (t && t.dataset.en) {
      if (t.dataset.uk === undefined) t.dataset.uk = t.textContent;
      t.textContent = l === 'en' ? t.dataset.en : t.dataset.uk;
    }
    document.documentElement.lang = l;
    var btns = document.querySelectorAll('.langsw button');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('on', btns[j].dataset.l === l);
      btns[j].setAttribute('aria-pressed', btns[j].dataset.l === l ? 'true' : 'false');
    }
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }

  function mount() {
    var rail = document.querySelector('.railnav');
    /* Без шапки (сторінки-статті 19–24) ставимо в body: nav.js потім переносить перемикач у рейку. */
    var bar = rail || document.querySelector('.topbar') || document.body;
    var sw = document.createElement('div');
    sw.className = 'langsw';
    sw.setAttribute('role', 'group');
    sw.setAttribute('aria-label', 'Мова / Language');
    ['uk', 'en'].forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.l = l; b.textContent = l.toUpperCase();
      b.addEventListener('click', function () {
        try { sessionStorage.setItem(SKEY, '1'); } catch (e) {}
        if (document.body.hasAttribute('data-lang-reload')) {
          try { localStorage.setItem(KEY, l); } catch (e) {}
          var u = new URL(location.href); u.searchParams.set('lang', l); location.href = u.toString();
          return;
        }
        apply(l);
      });
      sw.appendChild(b);
    });
    /* Ставимо перед приміткою, щоб перемикач не роз'їжджався з рядком прогресу. */
    var note = bar.querySelector('.note');
    if (rail) { var sp = document.createElement('span'); sp.className = 'sep'; rail.appendChild(sp); rail.appendChild(sw); }
    else if (note) bar.insertBefore(sw, note); else bar.appendChild(sw);
  }

  mount();
  apply(lang);
})();
