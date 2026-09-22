/* Сторінка 27: вкладки «Лекція / Додаток», scroll-spy лекції, матриця P×I і два графіки лекції. */
(function () {
  'use strict';
  var body = document.body;
  var sw = document.querySelector('.tabsw');

  function setTab(tab, keepScroll) {
    body.dataset.tab = tab;
    [].forEach.call(sw.querySelectorAll('button'), function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
    if (!keepScroll) window.scrollTo(0, 0);
    spy();
  }
  /* Посилання ззовні: #app / #lecture або якір усередині вкладки (#b7, #l3). */
  function fromHash() {
    var h = location.hash.slice(1);
    if (!h) return;
    if (h === 'app' || h === 'lecture') { setTab(h); return; }
    var t = document.getElementById(h);
    if (!t) return;
    setTab(t.closest('#app') ? 'app' : 'lecture', true);
    requestAnimationFrame(function () { t.scrollIntoView(); });
  }
  sw.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]'); if (!b) return;
    setTab(b.dataset.tab);
    history.replaceState(null, '', '#' + b.dataset.tab);
  });
  window.addEventListener('hashchange', fromHash);

  /* Scroll-spy лекції (додаток має свій у risk-app.js). */
  var links = [].slice.call(document.querySelectorAll('#lecToc a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function spy() {
    if (body.dataset.tab !== 'lecture') return;
    var y = 120, cur = 0;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', spy, { passive: true });

  /* Матриця P×I зі слайда: зона за score. */
  var pim = document.getElementById('pim');
  if (pim) {
    var h = '';
    for (var p = 5; p >= 1; p--) {
      h += '<div class="ax">' + p + '</div>';
      for (var i = 1; i <= 5; i++) {
        var s = p * i, k = s >= 15 ? 4 : s >= 8 ? 3 : s >= 4 ? 2 : 1;
        h += '<div class="k' + k + '">' + s + '</div>';
      }
    }
    h += '<div class="ax"></div>';
    for (var j = 1; j <= 5; j++) h += '<div class="ax">' + j + '</div>';
    pim.innerHTML = h;
    pim.insertAdjacentHTML('afterend', '<div class="pim-cap"><span>↑ ймовірність (P)</span><span>вплив (I) →</span></div>');
  }

  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(t, a, txt) { var n = document.createElementNS(NS, t); for (var k in a) n.setAttribute(k, a[k]); if (txt != null) n.textContent = txt; return n; }

  /* Monte Carlo: кількість симуляцій за тривалістю (дані діаграми зі слайда). */
  var mc = document.getElementById('mcChart');
  if (mc) {
    var W = [10, 11, 12, 13, 14, 15, 16, 17, 18], C = [2, 6, 13, 21, 22, 17, 11, 6, 2];
    var x0 = 44, y0 = 200, bw = 58, max = 22, hh = 170;
    mc.appendChild(svgEl('line', { x1: x0, y1: y0, x2: x0 + W.length * bw, y2: y0, stroke: 'var(--rule-2)' }));
    var cum = 0, tot = C.reduce(function (a, b) { return a + b; }, 0);
    W.forEach(function (w, i) {
      cum += C[i];
      var h2 = C[i] / max * hh, x = x0 + i * bw + 8;
      var col = cum / tot <= 0.5 ? 'var(--act)' : cum / tot <= 0.8 ? 'var(--c-gold)' : 'var(--rule-2)';
      mc.appendChild(svgEl('rect', { x: x, y: y0 - h2, width: bw - 16, height: h2, rx: 3, fill: col }));
      mc.appendChild(svgEl('text', { x: x + (bw - 16) / 2, y: y0 - h2 - 5, 'text-anchor': 'middle' }, C[i]));
      mc.appendChild(svgEl('text', { x: x + (bw - 16) / 2, y: y0 + 16, 'text-anchor': 'middle' }, w + (i === 0 ? ' тиж' : '')));
    });
    mc.appendChild(svgEl('text', { x: x0 + W.length * bw - 4, y: 18, 'text-anchor': 'end' }, 'до P50 · до P80 · решта'));
  }

  /* Exposure за спринтами (дані діаграми зі слайда). */
  var ex = document.getElementById('exChart');
  if (ex) {
    var S = ['С1', 'С2', 'С3', 'С4', 'С5', 'С6'], V = [34, 30, 27, 19, 12, 8];
    var ax = 50, ay = 180, sx = 104, mh = 40, ph = 150, pts = [];
    ex.appendChild(svgEl('line', { x1: ax, y1: ay, x2: ax + sx * (S.length - 1) + 20, y2: ay, stroke: 'var(--rule-2)' }));
    S.forEach(function (s, i) {
      var x = ax + i * sx, y = ay - V[i] / mh * ph;
      pts.push(x + ',' + y);
      ex.appendChild(svgEl('text', { x: x, y: ay + 16, 'text-anchor': 'middle' }, s));
    });
    ex.appendChild(svgEl('polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--act)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
    S.forEach(function (s, i) {
      var x = ax + i * sx, y = ay - V[i] / mh * ph;
      ex.appendChild(svgEl('circle', { cx: x, cy: y, r: 4, fill: 'var(--act)' }));
      ex.appendChild(svgEl('text', { x: x, y: y - 9, 'text-anchor': 'middle' }, V[i]));
    });
    ex.appendChild(svgEl('text', { x: ax - 6, y: 16 }, 'Exposure'));
  }

  fromHash();
  spy();
})();
