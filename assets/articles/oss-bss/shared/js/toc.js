/* Підсвітка поточного розділу в шапці. До цього шапка перелічувала розділи,
   але ніколи не показувала, де читач зараз, — і на довгій статті ставала
   просто списком.

   Активним вважається останній розділ, чий верх уже пройшов лінію під
   шапкою: так підсвітка не «стрибає» на сусідній розділ, коли той лише
   зазирнув знизу екрана. Скрол слухаємо через rAF, щоб не рахувати
   позиції на кожен піксель. */
(function () {
  function mount() {
    var nav = document.querySelector('.top__nav');
    if (!nav) return;

    var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
    var items = links.map(function (a) {
      return { a: a, el: document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))) };
    }).filter(function (x) { return x.el; });
    if (!items.length) return;

    var top = document.querySelector('.top');
    var line = function () { return (top ? top.offsetHeight : 56) + 12; };
    var cur = null, ticking = false;

    function paint() {
      ticking = false;
      var y = line(), found = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].el.getBoundingClientRect().top <= y) found = items[i];
      }
      // низ сторінки: останній розділ може бути надто коротким, щоб дійти до лінії
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        found = items[items.length - 1];
      }
      if (found === cur) return;
      if (cur) cur.a.classList.remove('is-here');
      if (found) found.a.classList.add('is-here');
      cur = found;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
