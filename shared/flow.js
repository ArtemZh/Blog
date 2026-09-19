/* 14b — плакат «Processes Flow» для PMBOK 8.
 *
 * Геометрія рахується з даних: картка вимірюється після рендера, колонки
 * пакуються за висотою, регіони підганяються під вміст, полотно — під регіони.
 * Руками не проставлено жодного x/y і жодного path.
 *
 * Дані: PMBOK.p8 (40 процесів), PMBOK_IO (ITTO), PMBOK.links8 (зв'язки). */
(function () {
  var M = window.PMBOK;
  var stage = document.getElementById('stage');
  var wrap = document.getElementById('fit');
  if (!M || !stage) return;

  var CARD_W = 250, GAPX = 74, GAPY = 22, PAD = 20, HEAD = 52, GUT = 90, MARG = 36, GRP = 10;
  /* Скільки колонок дати регіону — від кількості процесів у ньому:
     Planning тримає половину карти, Closing — одну картку. */
  var COLS = { I: 2, P: 4, E: 2, MC: 3, C: 1 };

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  var domOf = {};
  M.dom8.forEach(function (d) { domOf[d.id] = d; });

  var nodes = M.p8.map(function (p) {
    return { id: slug(p[0]), name: p[0], dom: p[1], fa: p[2] };
  });
  var byId = {};
  nodes.forEach(function (n) { byId[n.id] = n; });

  /* ── картки ─────────────────────────────────────────────────────
     Компактна картка, як на аркуші-схемі: номер, область, назва. Входів і
     виходів тут немає — вони живуть на 14a, а тут читається сама схема. */
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'fwires');
  stage.appendChild(svg);

  /* Нумерація за схемою практичного гіда: 4 — Initiating, 5 — Planning,
     6 — Executing, 7 — Monitoring & Controlling, 8 — Closing. У самому
     стандарті процеси не пронумеровані; це наша нумерація для читання схеми. */
  var FANUM = { I: 4, P: 5, E: 6, MC: 7, C: 8 }, seq = {};
  nodes.forEach(function (n) {
    seq[n.fa] = (seq[n.fa] || 0) + 1;
    n.num = FANUM[n.fa] + '.' + seq[n.fa];
    var d = document.createElement('div');
    d.className = 'fcard';
    d.style.width = CARD_W + 'px';
    d.style.borderColor = domOf[n.dom].c;
    d.tabIndex = 0;
    d.innerHTML =
      '<div class="fcard-bar" style="background:' + domOf[n.dom].c + '">' +
      '<span class="no">' + n.num + '</span><span class="ar">' + domOf[n.dom].t + '</span></div>' +
      '<div class="fcard-hd"><span class="nm">' + n.name + '</span></div>';
    d.onclick = function (e) { e.stopPropagation(); select(n.id); };
    d.onkeydown = function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id); }
    };
    n.el = d;
    stage.appendChild(d);
  });

  /* ── розкладка ──────────────────────────────────────────────────── */
  /* Референс кладе процеси однієї області суцільним кластером: чотири й
     більше карток стоять у дві колонки (Scope, Schedule, Risk), менші — в
     одну. Кластери викладаються рядками зліва направо і переносяться, коли
     не влазять у ширину регіону. */
  var regions = {}, hulls = [];

  function blocks(items) {
    var out = [];
    M.dom8.forEach(function (dm) {
      var g = items.filter(function (n) { return n.dom === dm.id; });
      if (!g.length) return;
      var gc = g.length >= 4 ? 2 : 1;
      var rows = Math.ceil(g.length / gc);
      var cols = [];
      for (var i = 0; i < gc; i++) cols.push(g.slice(i * rows, (i + 1) * rows));
      cols = cols.filter(function (c) { return c.length; });
      var h = cols.reduce(function (m, c) {
        return Math.max(m, c.reduce(function (s, n) { return s + n.h + GAPY; }, 0) - GAPY);
      }, 0);
      out.push({ dom: dm.id, cols: cols,
        w: cols.length * CARD_W + (cols.length - 1) * GAPX, h: h });
    });
    return out;
  }

  function layout() {
    nodes.forEach(function (n) { n.h = n.el.offsetHeight; });

    M.fa.forEach(function (f) {
      var items = nodes.filter(function (n) { return n.fa === f.id; });
      var bl = blocks(items);
      var inner = COLS[f.id] * CARD_W + (COLS[f.id] - 1) * GAPX;
      /* Розкладка кластерів рядками — рахуємо висоту наперед. */
      var x = 0, y = 0, rowH = 0;
      bl.forEach(function (g) {
        if (x && x + g.w > inner + 1) { y += rowH + GRP * 2 + GAPY * 2; x = 0; rowH = 0; }
        g.ox = x; g.oy = y;
        rowH = Math.max(rowH, g.h);
        x += g.w + GAPX;
      });
      regions[f.id] = { t: f.t, bl: bl, n: items.length,
        w: inner + PAD * 2, h: HEAD + y + rowH + PAD + GRP };
    });

    /* Композиція як на аркуші: ліворуч вертикаль Initiating → Executing →
       Closing, праворуч Planning над Monitoring & Controlling. */
    var leftW = Math.max(regions.I.w, regions.E.w, regions.C.w);

    regions.I.x = MARG; regions.I.y = MARG + 44;
    regions.E.x = MARG; regions.E.y = regions.I.y + regions.I.h + GUT;
    regions.C.x = MARG; regions.C.y = regions.E.y + regions.E.h + GUT;
    regions.P.x = MARG + leftW + GUT; regions.P.y = MARG + 44;
    regions.MC.x = regions.P.x; regions.MC.y = regions.P.y + regions.P.h + GUT;

    Object.keys(regions).forEach(function (id) {
      var r = regions[id];
      r.bl.forEach(function (g) {
        var bx = r.x + PAD + g.ox, by = r.y + HEAD + g.oy;
        var x = bx;
        g.cols.forEach(function (c) {
          var y = by;
          c.forEach(function (n) {
            n.x = x; n.y = y;
            n.el.style.left = x + 'px';
            n.el.style.top = y + 'px';
            y += n.h + GAPY;
          });
          x += CARD_W + GAPX;
        });
        hulls.push({ dom: g.dom, x: bx - GRP, y: by - GRP,
          w: g.w + GRP * 2, h: g.h + GRP * 2 });
      });
    });

    var right = 0, bottom = 0;
    Object.keys(regions).forEach(function (id) {
      var r = regions[id];
      right = Math.max(right, r.x + r.w);
      bottom = Math.max(bottom, r.y + r.h);
      var box = document.createElement('div');
      box.className = 'fregion';
      box.style.cssText = 'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px';
      /* Шапка регіону — суцільна плашка на всю ширину, як на референсі. */
      var lab = document.createElement('div');
      lab.className = 'fregion-hd';
      lab.style.cssText = 'left:' + r.x + 'px;top:' + (r.y - 34) + 'px;width:' + r.w + 'px';
      lab.innerHTML = r.t + ' <b>' + r.n + '</b>';
      stage.insertBefore(box, stage.firstChild);
      stage.appendChild(lab);
    });

    hulls.forEach(function (g) {
      var d = document.createElement('div');
      d.className = 'fhull';
      d.style.cssText = 'left:' + g.x + 'px;top:' + g.y + 'px;width:' + g.w + 'px;height:' +
        g.h + 'px;border-color:' + domOf[g.dom].c;
      stage.insertBefore(d, stage.firstChild.nextSibling);
    });

    stage.style.width = (right + MARG) + 'px';
    stage.style.height = (bottom + MARG) + 'px';
    svg.setAttribute('width', right + MARG);
    svg.setAttribute('height', bottom + MARG);
    svg.setAttribute('viewBox', '0 0 ' + (right + MARG) + ' ' + (bottom + MARG));
  }

  /* ── дроти ──────────────────────────────────────────────────────── */
  function path(pts, cls) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', 'fwire' + (cls ? ' ' + cls : ''));
    p.setAttribute('d', pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0] + ' ' + q[1]; }).join(' '));
    svg.appendChild(p);
    return p;
  }
  /* Наконечник малюємо полігоном: marker-end росте разом із товщиною лінії
     і при зумі або зникає, або роздувається. */
  function head(a, b, cls) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    var ux = dx / L, uy = dy / L, s = 7;
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    g.setAttribute('points', [
      b[0] + ',' + b[1],
      (b[0] - ux * s - uy * s * .45) + ',' + (b[1] - uy * s + ux * s * .45),
      (b[0] - ux * s + uy * s * .45) + ',' + (b[1] - uy * s - ux * s * .45)
    ].join(' '));
    if (cls) g.setAttribute('class', cls);
    svg.appendChild(g);
    return g;
  }

  /* Референс малює ВСІ зв'язки постійно і фарбує їх за областю джерела.
     Робимо так само; маршрути кладуться в коридори між колонками, а щоб
     дроти в одному коридорі не зливались, кожен зсувається на свою доріжку. */
  var lanes = {};
  function laneShift(x) {
    var k = Math.round(x);
    lanes[k] = (lanes[k] || 0) + 1;
    var i = lanes[k] - 1;
    return ((i % 2 ? 1 : -1) * Math.ceil(i / 2)) * 11;
  }
  function drawFlow() {
    BOX = boxes(); XS = corridors();
    M.links8.forEach(function (l) {
      var a = byId[slug(l[0])], b = byId[slug(l[1])];
      if (!a || !b) return;
      var pts = anchors(a, b, true);
      var col = domOf[a.dom].c;
      var p = path(pts, l[2] === 'back' ? 'back' : '');
      p.setAttribute('stroke', col);
      var h = head(pts[pts.length - 2], pts[pts.length - 1]);
      h.setAttribute('fill', col);
      /* Точка на початку — як у референсі: видно, звідки виходить зв'язок. */
      var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', pts[0][0]); dot.setAttribute('cy', pts[0][1]);
      dot.setAttribute('r', 3.2); dot.setAttribute('fill', col);
      dot.setAttribute('class', 'fdot');
      svg.appendChild(dot);
      a.wires = (a.wires || []).concat([p, h, dot]);
      b.wires = (b.wires || []).concat([p, h, dot]);
    });
  }

  /* Сірі шеврони між регіонами — послідовність фокус-областей, як на референсі. */
  function drawChevrons() {
    [['I', 'P'], ['P', 'E'], ['E', 'MC'], ['MC', 'C']].forEach(function (pair) {
      var a = regions[pair[0]], b = regions[pair[1]];
      var horiz = Math.abs(a.y - b.y) < Math.abs(a.x - b.x);
      var cx, cy, dir;
      if (horiz) { dir = b.x > a.x ? 1 : -1; cx = (a.x + a.w + b.x) / 2; cy = a.y + Math.min(a.h, b.h) / 2; }
      else { dir = b.y > a.y ? 1 : -1; cy = (a.y + a.h + b.y) / 2; cx = a.x + Math.min(a.w, b.w) / 2; }
      if (!horiz && b.x !== a.x) { cx = Math.min(a.x + a.w, b.x + b.w) - 60; }
      var s = 26, g = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      g.setAttribute('class', 'fchev');
      g.setAttribute('points', horiz
        ? [cx - s * dir, cy - s, cx - s * dir, cy + s, cx + s * dir, cy].join(' ')
        : [cx - s, cy - s * dir, cx + s, cy - s * dir, cx, cy + s * dir].join(' '));
      svg.appendChild(g);
    });
  }

  /* ── виділення ──────────────────────────────────────────────────── */
  var hot = null;
  function clearTmp() {
    Array.prototype.slice.call(svg.querySelectorAll('.tmp')).forEach(function (e) { e.remove(); });
  }
  /* Маршрутизація тимчасових дротів. Горизонтальні й вертикальні ділянки
     кладуться тільки в коридори — проміжки між колонками і смуги, вільні від
     карток. Кожен кандидат перевіряється на перетин з усіма картками, тому
     дріт ніколи не проходить крізь чужий процес. */
  function boxes() {
    return nodes.map(function (n) { return { x: n.x, y: n.y, w: CARD_W, h: n.h }; });
  }
  var BOX = null;
  function hitsH(y, x1, x2) {
    var lo = Math.min(x1, x2), hi = Math.max(x1, x2);
    return BOX.some(function (b) {
      return y > b.y - 6 && y < b.y + b.h + 6 && lo < b.x + b.w + 6 && hi > b.x - 6;
    });
  }
  function hitsV(x, y1, y2) {
    var lo = Math.min(y1, y2), hi = Math.max(y1, y2);
    return BOX.some(function (b) {
      return x > b.x - 6 && x < b.x + b.w + 6 && lo < b.y + b.h + 6 && hi > b.y - 6;
    });
  }
  function corridors() {
    /* Центри всіх вертикальних проміжків: між колонками і по краях регіонів. */
    var xs = {};
    nodes.forEach(function (n) {
      xs[n.x - GAPX / 2] = 1;
      xs[n.x + CARD_W + GAPX / 2] = 1;
    });
    Object.keys(regions).forEach(function (id) {
      var r = regions[id];
      xs[r.x - GUT / 2] = 1;
      xs[r.x + r.w + GUT / 2] = 1;
    });
    return Object.keys(xs).map(Number).sort(function (a, b) { return a - b; });
  }
  var XS = null;
  function pickX(from, toward, y1, y2) {
    var side = toward > from ? 1 : -1;
    var best = null;
    XS.forEach(function (x) {
      if ((x - from) * side <= 0) return;
      if (hitsV(x, y1, y2)) return;
      if (best === null || Math.abs(x - from) < Math.abs(best - from)) best = x;
    });
    return best;
  }
  function pickY(a, b, x1, x2) {
    var cand = [a.y - GAPY / 2, a.y + a.h + GAPY / 2, b.y - GAPY / 2, b.y + b.h + GAPY / 2];
    Object.keys(regions).forEach(function (id) {
      var r = regions[id];
      cand.push(r.y + HEAD - 12);
      cand.push(r.y + r.h + GUT / 2);
      cand.push(r.y - GUT / 2);
    });
    cand.push(MARG / 2);                       /* небо над плакатом — завжди вільне */
    var mid = (a.y + a.h / 2 + b.y + b.h / 2) / 2, best = null;
    cand.forEach(function (y) {
      if (hitsH(y, x1, x2)) return;
      if (best === null || Math.abs(y - mid) < Math.abs(best - mid)) best = y;
    });
    return best === null ? MARG / 2 : best;
  }
  function hyGuess(a, b) { return (a.y + a.h / 2 + b.y + b.h / 2) / 2; }
  function anchors(a, b, stagger) {
    BOX = BOX || boxes();
    XS = XS || corridors();
    var ay = a.y + a.h / 2, by = b.y + b.h / 2;
    var right = b.x + CARD_W / 2 > a.x + CARD_W / 2;

    /* Одна колонка: коротка пряма у проміжку між картками. */
    if (Math.abs(a.x - b.x) < 4) {
      var down = by > ay, x = a.x + CARD_W / 2;
      var s0 = [x, down ? a.y + a.h : a.y], e0 = [x, down ? b.y - 4 : b.y + b.h + 4];
      if (!hitsV(x, s0[1] + 6, e0[1] - 6) || Math.abs(e0[1] - s0[1]) < GAPY * 2.5) return [s0, e0];
    }

    var s = [right ? a.x + CARD_W : a.x, ay];
    var e = [right ? b.x - 4 : b.x + CARD_W + 4, by];
    var xa = pickX(s[0], right ? s[0] + 1e6 : -1e6, ay, ay);
    var xb = right ? pickX(e[0], -1e6, by, by) : pickX(e[0], 1e6, by, by);
    if (xa === null) xa = s[0] + (right ? GAPX / 2 : -GAPX / 2);
    if (xb === null) xb = e[0] + (right ? -GAPX / 2 : GAPX / 2);
    if (Math.abs(xa - xb) < 2) return [s, [xa, ay], [xa, by], e];
    /* Зсув доріжки не має заводити дріт у картку: якщо заводить — лишаємо
       коридор по центру. */
    if (stagger) {
      var sa = laneShift(xa), sb = laneShift(xb);
      if (!hitsV(xa + sa, ay, hyGuess(a, b))) xa += sa;
      if (!hitsV(xb + sb, by, hyGuess(a, b))) xb += sb;
    }
    var hy = pickY(a, b, xa, xb);
    return [s, [xa, ay], [xa, hy], [xb, hy], [xb, by], e];
  }

  function select(id) {
    if (hot === id) { hot = null; }
    else hot = id;
    clearTmp();
    stage.classList.toggle('is-hot', !!hot);
    nodes.forEach(function (n) { n.el.classList.remove('hot', 'near'); });
    if (!hot) return;
    var n = byId[hot];
    n.el.classList.add('hot');
    M.links8.forEach(function (l) {
      var a = byId[slug(l[0])], b = byId[slug(l[1])];
      if (!a || !b) return;
      if (a.id !== hot && b.id !== hot) return;
      (a.id === hot ? b : a).el.classList.add('near');
      var pts = anchors(a, b);
      path(pts, 'tmp');
      head(pts[pts.length - 2], pts[pts.length - 1], 'tmp');
    });
  }
  stage.addEventListener('click', function () { if (hot) select(hot); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hot) select(hot); });

  /* ── легенда, зум ───────────────────────────────────────────────── */
  var leg = document.getElementById('legend');
  if (leg) {
    leg.innerHTML = M.dom8.map(function (d) {
      var n = nodes.filter(function (x) { return x.dom === d.id; }).length;
      return '<span><i style="background:' + d.c + '"></i>' + d.t + ' · ' + n + '</span>';
    }).join('');
  }

  layout();
  drawChevrons();
  drawFlow();

  var z = window.Zoom ? window.Zoom(wrap, stage) : null;
  if (z) requestAnimationFrame(function () { requestAnimationFrame(function () { z.fit(); }); });
  window.FLOW = { nodes: nodes, regions: regions, svg: svg, CARD_W: CARD_W, select: select };
})();
