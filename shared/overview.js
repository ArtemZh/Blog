/* 14a, рівень 1: фази як області, домени як групи карток процесів усередині.
   Присутність і склад груп виводяться з переліку процесів PMBOK 8 (p8).
   Рядок домену має спільну висоту в Initiating / Planning / M&C — тому зв'язки
   між фазами прямі. Executing стоїть окремим блоком над M&C у тій самій колонці. */
(function () {
  var M = window.PMBOK;
  var host = document.getElementById('ov');
  var svg = document.getElementById('ovwires');

  var COL = { I: { x: 30, w: 230 }, P: { x: 290, w: 320 }, EM: { x: 650, w: 460 }, C: { x: 1150, w: 230 } };
  var LANE = 120;                 /* права смуга в колонці E/MC для спусків виконання → контроль */
  var ROWGAP = 14, TOP = 40, CAP = 40;

  var domains = M.dom8, faNo = { I: 4, P: 5, E: 6, MC: 7, C: 8 };
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  /* процеси з нумерацією по фокус-областях — та сама, що на карті */
  var list = [], counter = {};
  ['I', 'P', 'E', 'MC', 'C'].forEach(function (f) {
    domains.forEach(function (d) {
      M.p8.filter(function (p) { return p[1] === d.id && p[2] === f; }).forEach(function (p) {
        counter[f] = (counter[f] || 0) + 1;
        list.push({ id: slug(p[0]), name: p[0], dom: d, fa: f, num: faNo[f] + '.' + counter[f] });
      });
    });
  });
  function items(dom, fa) { return list.filter(function (p) { return p.dom.id === dom && p.fa === fa; }); }
  /* Висоти не рахуємо з констант — картка з довгою назвою переноситься на два
     рядки, і будь-яка формула розходиться з фактом. Групу рендеримо з природною
     висотою, потім вимірюємо і розставляємо (двопрохідна розкладка). */

  /* ── розкладка ─────────────────────────────────────────────────── */
  var groups = {};
  function region(x, y, w, h, cap, sub) {
    var r = document.createElement('div'); r.className = 'region';
    r.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
    r.innerHTML = '<div class="cap">' + cap + (sub ? '<small>' + sub + '</small>' : '') + '</div>';
    host.appendChild(r);
    return r;
  }
  /* Рівень 2 — входи, інструменти, виходи. Показуємо лише верхній рівень:
     підпункти в первині йдуть двома стовпчиками і на частині сторінок перетікають
     між колонками, тому без ручної вичитки їх публікувати не можна. */
  function ioHtml(id) {
    var io = (window.PMBOK_IO || {})[id];
    if (!io) return '<div class="io"><span class="none">Inputs and outputs not extracted for this process yet.</span></div>';
    function col(t, arr) {
      return '<div><h4>' + t + '</h4><ul>' + arr.map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ul></div>';
    }
    return '<div class="io">' + col('Inputs', io.in) + col('Tools &amp; techniques', io.tt) + col('Outputs', io.out) + '</div>';
  }

  /* Відкрита одна картка: інакше ряди стрибають і стан не відкотити одним кліком.
     Кнопка «Expand all» — окремий режим, там відкриті всі одразу. */
  var openCard = null;
  function toggle(el, p) {
    if (el.classList.contains('open')) { el.classList.remove('open'); openCard = null; }
    else {
      if (openCard) openCard.classList.remove('open');
      el.classList.add('open'); openCard = el;
    }
    relayout();
    selectFromCard(p);
  }
  function expandAll() {
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) { n.classList.add('open'); });
    openCard = null; relayout();
  }
  function collapseAll() {
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) { n.classList.remove('open'); });
    openCard = null; relayout();
  }

  function group(dom, fa, x, y, w, arr) {
    var g = document.createElement('div');
    g.className = 'grp' + (dom.id === 'gov' ? ' gov' : '');
    g.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;border-color:' + dom.c;
    g.innerHTML = '<span class="gl" style="color:' + dom.c + '">' + dom.t + '</span>';
    g.dataset.dom = dom.id; g.dataset.fa = fa;
    arr.forEach(function (p) {
      var d = document.createElement('div');
      d.className = 'pnode'; d.id = 'p-' + p.id;
      d.style.borderLeftColor = dom.c;
      d.innerHTML = '<span class="num">' + p.num + '</span><span class="nm">' + p.name + '</span>' + ioHtml(p.id);
      d.tabIndex = 0; d.setAttribute('role', 'button');
      d.setAttribute('aria-label', p.num + ' ' + p.name);
      d.onclick = function (e) { e.stopPropagation(); toggle(d, p); };
      d.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(d, p); }
        if (e.key === 'Escape') { collapseAll(); clear(); }
      };
      g.appendChild(d);
    });
    g.onclick = function (e) { e.stopPropagation(); select(dom.id); };
    host.appendChild(g);
    groups[dom.id + fa] = g;
  }

  /* прохід 1: створюємо всі групи в (0,0), щоб виміряти їхню природну висоту */
  var eDom = domains.filter(function (d) { return items(d.id, 'E').length; });
  eDom.forEach(function (d) { group(d, 'E', COL.EM.x + 12, 0, COL.EM.w - LANE - 24, items(d.id, 'E')); });
  domains.forEach(function (d) {
    [['I', COL.I], ['P', COL.P], ['MC', COL.EM], ['C', COL.C]].forEach(function (c) {
      var arr = items(d.id, c[0]);
      if (arr.length) group(d, c[0], c[1].x + 12, 0, c[1].w - (c[0] === 'MC' ? LANE : 0) - 24, arr);
    });
  });
  function H(g) { return g ? g.offsetHeight : 0; }

  /* прохід 2 — і він же перерахунок після розкриття картки: висоти вимірюємо
     щоразу заново, бо розкрита картка змінює висоту групи й усього ряду. */
  var regions = [];
  function relayout() {
    var y = TOP + CAP, eTop = TOP;
    eDom.forEach(function (d) { var g = groups[d.id + 'E']; g.style.top = y + 'px'; y += H(g) + ROWGAP; });
    var eBottom = y - ROWGAP + 12, mcTop = eBottom + 20;
    y = mcTop + CAP;
    domains.forEach(function (d) {
      var gs = ['I', 'P', 'MC', 'C'].map(function (f) { return groups[d.id + f]; }).filter(Boolean);
      if (!gs.length) return;
      var h = Math.max.apply(null, gs.map(H));
      gs.forEach(function (g) { g.style.top = y + 'px'; });
      y += h + ROWGAP;
    });
    var bottom = y - ROWGAP + 12;
    var geo = [[COL.I, mcTop, bottom, 'Initiating'], [COL.P, mcTop, bottom, 'Planning'],
               [COL.EM, eTop, eBottom, 'Executing', 'in parallel with'],
               [COL.EM, mcTop, bottom, 'Monitoring and Controlling'], [COL.C, mcTop, bottom, 'Closing']];
    if (!regions.length) geo.forEach(function (g) { regions.push(region(g[0].x, g[1], g[0].w, g[2] - g[1], g[3], g[4])); });
    else regions.forEach(function (r, i) {
      r.style.top = geo[i][1] + 'px'; r.style.height = (geo[i][2] - geo[i][1]) + 'px';
    });
    host.style.height = (bottom + 20) + 'px';
    [].forEach.call(host.querySelectorAll('.region'), function (r) { host.insertBefore(r, svg); });
    /* Два кадри: після зняття .open висоти ще не перерахувалися, і дроти
       малюються за старою, розгорнутою геометрією — після Collapse all вони
       опинялися за межами полотна. */
    /* Перемальовуємо явно: після зміни розкладки висоти встигають перерахуватися
       не завжди в наступному кадрі, і дроти лишалися в старих координатах —
       після Collapse all вони опинялися за межами полотна. */
    scheduleDraw();
  }
  relayout();

  /* ── дроти між групами одного домену ──────────────────────────── */
  function box(el) { return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; }
  var gutterXs = [];   /* вертикалі зазору план → виконання: горизонталі через них стрибають */
  function path(pts, dom, hops) {
    var d = 'M' + pts[0].x + ',' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (hops && Math.abs(a.y - b.y) < 1) {
        /* горизонталь: стрибок через кожну вертикаль зазору, що лежить між кінцями */
        var xs = gutterXs.filter(function (x) { return x > Math.min(a.x, b.x) + 6 && x < Math.max(a.x, b.x) - 6; })
                         .sort(function (u, v) { return (u - v) * (b.x > a.x ? 1 : -1); });
        var dir = b.x > a.x ? 1 : -1;
        xs.forEach(function (x) { d += ' L' + (x - 6 * dir) + ',' + a.y + ' A6,6 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + (x + 6 * dir) + ',' + a.y; });
      }
      d += ' L' + b.x + ',' + b.y;
    }
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', 'w' + (dom === 'gov' ? ' gov' : '')); p.setAttribute('d', d); p.dataset.dom = dom;
    svg.appendChild(p);
    var n = pts.length, a = pts[n - 2], b = pts[n - 1];
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    var t = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    t.setAttribute('points', (b.x + ux * 11) + ',' + (b.y + uy * 11) + ' ' + (b.x - uy * 4.5) + ',' + (b.y + ux * 4.5) + ' ' + (b.x + uy * 4.5) + ',' + (b.y - ux * 4.5));
    t.setAttribute('fill', dom === 'gov' ? '#4B5563' : '#7E8797'); t.dataset.dom = dom;
    svg.appendChild(t);
  }
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 ' + host.offsetWidth + ' ' + host.offsetHeight);
    var gutter = (COL.P.x + COL.P.w + COL.EM.x) / 2, lane = 0, eIdx = 0;
    gutterXs = [];
    domains.forEach(function (d) { if (groups[d.id + 'P'] && groups[d.id + 'E']) { gutterXs.push(gutter - 14 + gutterXs.length * 9); } });
    domains.forEach(function (d) {
      var I = groups[d.id + 'I'], P = groups[d.id + 'P'], E = groups[d.id + 'E'], MC = groups[d.id + 'MC'], C = groups[d.id + 'C'];
      var Y = 30;   /* висота входу/виходу у групу: під підписом, на рівні першої картки */
      if (I && P) { var a = box(I), b = box(P); path([{ x: a.x + a.w, y: a.y + Y }, { x: b.x - 11, y: b.y + Y }], d.id); }
      if (P && MC) { var a2 = box(P), b2 = box(MC); path([{ x: a2.x + a2.w, y: a2.y + Y + 10 }, { x: b2.x - 11, y: b2.y + Y + 10 }], d.id, true); }
      if (P && E) {
        var a3 = box(P), b3 = box(E), gx = gutter - 14 + lane * 9; lane++;
        path([{ x: a3.x + a3.w, y: a3.y + Y - 4 }, { x: gx, y: a3.y + Y - 4 }, { x: gx, y: b3.y + Y }, { x: b3.x - 11, y: b3.y + Y }], d.id);
      }
      if (E && MC) {
        /* виконання → контроль: у правій смузі блока, входить у групу M&C з правого боку */
        var a4 = box(E), b4 = box(MC), lx = a4.x + a4.w + 24 + eIdx * 24; eIdx++;
        path([{ x: a4.x + a4.w, y: a4.y + Y }, { x: lx, y: a4.y + Y }, { x: lx, y: b4.y + Y }, { x: b4.x + b4.w + 11, y: b4.y + Y }], d.id);
      }
      if (MC && C) { var a5 = box(MC), b5 = box(C); path([{ x: a5.x + a5.w, y: a5.y + Y + 20 }, { x: b5.x - 11, y: b5.y + Y + 20 }], d.id); }
    });
  }

  /* Клік по картці підсвічує її зв'язки: сусіди з links8 і той самий домен
     в інших фазах — щоб було видно, з чим процес пов'язаний. */
  function selectFromCard(p) {
    sel = 'card:' + p.id;
    lastCard = p;
    host.classList.add('is-hot');
    var near = {};
    (M.links8 || []).forEach(function (L) {
      var a = slug(L[0]), b = slug(L[1]);
      if (a === p.id) near[b] = 1;
      if (b === p.id) near[a] = 1;
    });
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) {
      var id = n.id.replace(/^p-/, '');
      n.classList.toggle('hot', id === p.id);
      n.classList.toggle('near', !!near[id]);
    });
    [].forEach.call(host.querySelectorAll('.grp'), function (g) { g.classList.toggle('hot', g.dataset.dom === p.dom.id); });
    [].forEach.call(svg.querySelectorAll('path,polygon'), function (w) { w.classList.toggle('hot', w.dataset.dom === p.dom.id); });
    linkLines(p.id, near);
  }

  /* Постійні дроти показують шлях домену між фазами; зв'язки конкретного процесу
     з іншими доменами не намальовані — інакше полотно перетворюється на кашу.
     Тому на кліку вони домальовуються лінією до кожного сусіда: підсвічується
     не просто «схожа картка», а сам зв'язок. Знімаються разом із виділенням. */
  function dropLinkLines() {
    [].forEach.call(svg.querySelectorAll('.tmp'), function (n) { n.parentNode.removeChild(n); });
  }

  /* Вільні коридори: беремо зайняті картками інтервали по осі й лишаємо проміжки.
     Лінія кладеться тільки туди, де плашок немає — тому вона фізично не може
     пройти під карткою, а не «здебільшого не проходить». */
  function lanes(boxes, axis) {
    var iv = boxes.map(function (b) {
      return axis === 'x' ? [b.x - 7, b.x + b.w + 7] : [b.y - 6, b.y + b.h + 6];
    }).sort(function (u, v) { return u[0] - v[0]; });
    var merged = [], cur = null;
    iv.forEach(function (r) {
      if (!cur || r[0] > cur[1]) { cur = r.slice(); merged.push(cur); }
      else cur[1] = Math.max(cur[1], r[1]);
    });
    var out = [];
    for (var i = 1; i < merged.length; i++) out.push((merged[i - 1][1] + merged[i][0]) / 2);
    if (merged.length) { out.push(merged[0][0] - 10); out.push(merged[merged.length - 1][1] + 10); }
    return out;
  }

  function hits(p1, p2, boxes) {
    var x0 = Math.min(p1.x, p2.x), x1 = Math.max(p1.x, p2.x);
    var y0 = Math.min(p1.y, p2.y), y1 = Math.max(p1.y, p2.y);
    return boxes.some(function (b) {
      return x1 > b.x + 1 && x0 < b.x + b.w - 1 && y1 > b.y + 1 && y0 < b.y + b.h - 1;
    });
  }
  function clean(pts, boxes) {
    for (var i = 1; i < pts.length; i++) if (hits(pts[i - 1], pts[i], boxes)) return false;
    return true;
  }

  function linkLines(id, near) {
    dropLinkLines();
    var from = document.getElementById('p-' + id);
    if (!from) return;
    var all = [].map.call(host.querySelectorAll('.pnode'), function (n) {
      var b = absBox(n); b.el = n; return b;
    });
    var A = absBox(from);
    var xl = lanes(all, 'x'), yl = lanes(all, 'y');

    Object.keys(near).forEach(function (other) {
      var to = document.getElementById('p-' + other);
      if (!to) return;
      var B = absBox(to);
      var obst = all.filter(function (b) { return b.el !== from && b.el !== to; });
      var ac = { x: A.x + A.w / 2, y: A.y + A.h / 2 }, bc = { x: B.x + B.w / 2, y: B.y + B.h / 2 };
      var mid = { x: (ac.x + bc.x) / 2, y: (ac.y + bc.y) / 2 }, pts = null;

      /* спершу коридор по вертикалі (вихід збоку), потім по горизонталі */
      var byX = xl.slice().sort(function (u, v) { return Math.abs(u - mid.x) - Math.abs(v - mid.x); });
      for (var i = 0; i < byX.length && !pts; i++) {
        var c = byX[i];
        var x1 = c > ac.x ? A.x + A.w : A.x, x2 = c > bc.x ? B.x + B.w + 9 : B.x - 9;
        var cand = [{ x: x1, y: ac.y }, { x: c, y: ac.y }, { x: c, y: bc.y }, { x: x2, y: bc.y }];
        if (clean(cand, obst)) pts = cand;
      }
      var byY = yl.slice().sort(function (u, v) { return Math.abs(u - mid.y) - Math.abs(v - mid.y); });
      for (var j = 0; j < byY.length && !pts; j++) {
        var r = byY[j];
        var y1 = r > ac.y ? A.y + A.h : A.y, y2 = r > bc.y ? B.y + B.h + 9 : B.y - 9;
        var cand2 = [{ x: ac.x, y: y1 }, { x: ac.x, y: r }, { x: bc.x, y: r }, { x: bc.x, y: y2 }];
        if (clean(cand2, obst)) pts = cand2;
      }
      /* коридору не знайшлося — краще не малювати лінію, ніж вести її крізь плашки:
         сама картка-сусід усе одно підсвічена класом near */
      if (!pts) return;

      var d = pts.map(function (pt, i2) { return (i2 ? 'L' : 'M') + pt.x + ' ' + pt.y; }).join(' ');
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      ln.setAttribute('class', 'w tmp hot'); ln.setAttribute('d', d);
      svg.appendChild(ln);
      var n2 = pts.length, u = pts[n2 - 2], v = pts[n2 - 1];
      var dx = v.x - u.x, dy = v.y - u.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      var tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      tri.setAttribute('class', 'tmp hot');
      tri.setAttribute('points', (v.x + ux * 11) + ',' + (v.y + uy * 11) + ' ' +
        (v.x - uy * 4.5) + ',' + (v.y + ux * 4.5) + ' ' + (v.x + uy * 4.5) + ',' + (v.y - ux * 4.5));
      svg.appendChild(tri);
    });
  }

  /* Картки лежать усередині груп і колонок, тому offsetLeft рахується від
     найближчого позиціонованого предка — зводимо до системи координат полотна. */
  function absBox(el) {
    var r = el.getBoundingClientRect(), h = host.getBoundingClientRect();
    var k = (function () { var m = (host.style.transform || '').match(/scale\(([\d.]+)\)/); return m ? +m[1] : 1; })();
    return { x: (r.left - h.left) / k, y: (r.top - h.top) / k, w: r.width / k, h: r.height / k };
  }

  var drawTimer = null, lastCard = null;
  function scheduleDraw() {
    clearTimeout(drawTimer);
    drawTimer = setTimeout(function () {
      draw();
      /* draw() чистить полотно повністю, тому виділення треба покласти назад:
         інакше домальовані зв'язки зникали одразу після розкриття картки —
         клік «нічого не робив», хоча підсвітка на мить з'являлася. */
      if (lastCard) selectFromCard(lastCard);
      if (window.__ovZoom) window.__ovZoom();
    }, 60);
  }

  var sel = null;
  function select(id) {
    if (sel === id) { clear(); return; }
    sel = id; lastCard = null; host.classList.add('is-hot');
    dropLinkLines();
    [].forEach.call(host.querySelectorAll('.grp'), function (g) { g.classList.toggle('hot', g.dataset.dom === id); });
    [].forEach.call(svg.querySelectorAll('path,polygon'), function (w) { w.classList.toggle('hot', w.dataset.dom === id); });
  }
  function clear() {
    sel = null; lastCard = null; host.classList.remove('is-hot');
    dropLinkLines();
    [].forEach.call(host.querySelectorAll('.hot, .near'), function (n) { n.classList.remove('hot', 'near'); });
    [].forEach.call(svg.querySelectorAll('.hot'), function (n) { n.classList.remove('hot'); });
  }
  document.addEventListener('click', clear);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') clear(); });

  var xa = document.getElementById('btn-expand'), xc = document.getElementById('btn-collapse');
  if (xa) xa.onclick = function (e) { e.stopPropagation(); expandAll(); };
  if (xc) xc.onclick = function (e) { e.stopPropagation(); collapseAll(); clear(); };

  draw();
  window.__ovDraw = draw;
  var fit = document.getElementById('fit');
  var Z = window.Zoom(fit, host, function (k) { fit.style.height = Math.min(host.offsetHeight * k, innerHeight * 0.9) + 'px'; });
  window.__ovZoom = function () { Z.set(Z.get()); fit.style.height = (host.offsetHeight * Z.get()) + 'px'; };
  Z.fit(); fit.style.height = (host.offsetHeight * Z.get()) + 'px';
  addEventListener('resize', function () { Z.fit(); fit.style.height = (host.offsetHeight * Z.get()) + 'px'; });
})();
