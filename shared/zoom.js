/* Живой зум полотна: колесо масштабирует относительно курсора, перетаскивание
 * двигает. Как на планшете — но мышью. Кнопки-пресеты остаются: попасть точно
 * в «вписать» или «100%» колесом неудобно.
 *
 * Zoom(wrap, stage, onChange) — wrap скроллится, stage масштабируется. */
window.Zoom = function (wrap, stage, onChange) {
  var k = 1, MIN = 0.15, MAX = 3;

  /* transform:scale не меняет размер элемента в раскладке: полотно ужимается
     визуально, а область прокрутки остаётся исходной — и три четверти
     прокрутки ведут в пустоту, схема «исчезает». Поэтому вокруг полотна
     ставится распорка, которой руками задаётся масштабированный размер. */
  var sizer = stage.parentNode.classList && stage.parentNode.classList.contains('zoomsizer')
    ? stage.parentNode
    : (function () {
        var d = document.createElement('div');
        d.className = 'zoomsizer';
        stage.parentNode.insertBefore(d, stage);
        d.appendChild(stage);
        return d;
      })();

  function resize() {
    sizer.style.width = Math.round(stage.scrollWidth * k) + 'px';
    sizer.style.height = Math.round(stage.scrollHeight * k) + 'px';
  }

  function apply(next, cx, cy) {
    next = Math.min(MAX, Math.max(MIN, next));
    if (next === k) return;
    /* Точка под курсором должна остаться на месте: пересчитываем прокрутку
       по её координате внутри полотна, а не по экрану. */
    var r = wrap.getBoundingClientRect();
    var px = (wrap.scrollLeft + (cx - r.left)) / k;
    var py = (wrap.scrollTop + (cy - r.top)) / k;
    k = next;
    stage.style.transform = 'scale(' + k + ')';
    resize();
    wrap.scrollLeft = px * k - (cx - r.left);
    wrap.scrollTop = py * k - (cy - r.top);
    if (onChange) onChange(k);
  }

  function fit() {
    var w = stage.scrollWidth || 1;
    k = Math.min(1, (wrap.clientWidth - 24) / w);
    stage.style.transform = 'scale(' + k + ')';
    resize();
    if (onChange) onChange(k);
  }

  wrap.addEventListener('wheel', function (e) {
    /* Трекпад-пинч приходит как wheel с ctrlKey. Обычное колесо оставляем
       странице, иначе страницу нельзя будет прокрутить мимо схемы. */
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    apply(k * Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY);
  }, { passive: false });

  /* Захоплення вказівника беремо не одразу, а тільки коли рука справді поїхала.
     Раніше setPointerCapture стояв на pointerdown — і тоді pointerup приходив
     обгортці, а не картці: браузер вважав спільним предком wrap і клік по
     блоку не спрацьовував узагалі. Тягнути схему це не заважало, тому баг
     жив непоміченим: програмний .click() його не відтворює. */
  var DRAG_MIN = 4;          /* px до того, як рух вважається перетягуванням */
  var drag = null, moved = false;

  wrap.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a,button')) return;
    drag = { x: e.clientX, y: e.clientY, l: wrap.scrollLeft, t: wrap.scrollTop, on: false };
    moved = false;
  });
  wrap.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.hypot(dx, dy) < DRAG_MIN) return;
      drag.on = true; moved = true;
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = 'grabbing';
    }
    wrap.scrollLeft = drag.l - dx;
    wrap.scrollTop = drag.t - dy;
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    wrap.addEventListener(ev, function () { drag = null; wrap.style.cursor = ''; });
  });
  /* Після справжнього перетягування клік не потрібен: інакше відпускання руки
     над карткою відкривало б її. Гасимо тільки цей один клік. */
  wrap.addEventListener('click', function (e) {
    if (!moved) return;
    moved = false;
    e.stopPropagation(); e.preventDefault();
  }, true);

  return {
    fit: fit,
    set: function (v) {
      var r = wrap.getBoundingClientRect();
      if (v === k) { stage.style.transform = 'scale(' + k + ')'; resize(); if (onChange) onChange(k); return; }
      apply(v, r.left + r.width / 2, r.top + r.height / 2);
    },
    get: function () { return k; }
  };
};
