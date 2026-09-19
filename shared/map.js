/* Карта процессов: раскладка на фиксированном полотне.
 *
 * Координаты не прописаны руками — иначе переключение изданий (49 карточек
 * против 40) требовало бы второго набора координат. Вместо этого контейнеры
 * фокус-областей заданы жёстко, а группы доменов внутри пакуются колонками.
 * Провода задаются парами названий и переживают перенумерацию. */
(function () {
  var M = window.PMBOK;
  var CARD_W = 208, CARD_H = 46, GAP = 8, PAD = 16, HEAD = 40, GRP_PAD = 12, GRP_HEAD = 26;

  var state = { ed: '8', zoom: 'compact', sel: null };
  var stage = document.getElementById('stage');
  var fit = document.getElementById('fit');
  var nodes = {};

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  /* Сборка списка процессов текущего издания с нумерацией по фокус-областям. */
  function build() {
    var rows = state.ed === '6' ? M.ka6 : M.dom8;
    var ed = state.ed === '6' ? '6' : '8';
    var faNo = { I: 4, P: 5, E: 6, MC: 7, C: 8 };
    var out = [], counter = {};
    M.fa.forEach(function (f) {
      rows.forEach(function (r) {
        var items = ed === '6'
          ? M.p6.filter(function (p) { return p[1] === r.id && p[2] === f.id; })
                .map(function (p) { return { name: p[3], row: r, fa: f.id, old: p[0] }; })
          : M.p8.filter(function (p) { return p[1] === r.id && p[2] === f.id; })
                .map(function (p) { return { name: p[0], row: r, fa: f.id, st: p[3], from: p[4] }; });
        items.forEach(function (it) {
          counter[f.id] = (counter[f.id] || 0) + 1;
          it.num = faNo[f.id] + '.' + counter[f.id];
          it.id = slug(it.name);
          out.push(it);
        });
      });
    });
    return out;
  }

  /* Раскладка. Размер контейнера считается из содержимого, а не задаётся заранее:
     иначе при 49 карточках он переполняется, а при 40 наполовину пустой.
     Контейнеры стоят в порядке жизненного цикла слева направо:
     Initiating → Planning → Executing → Monitoring & Controlling → Closing.
     Тогда поток читается как время, а провода идут преимущественно вперёд;
     обратные связи (изменения, доработка) видны именно тем, что идут назад. */
  var COLS = { I: 1, P: 2, E: 1, MC: 2, C: 1 };
  var COL_W = CARD_W + GRP_PAD * 2;

  function packFa(items) {
    var byRow = [];
    items.forEach(function (p) {
      var g = byRow.filter(function (x) { return x.row.id === p.row.id; })[0];
      if (!g) { g = { row: p.row, items: [] }; byRow.push(g); }
      g.items.push(p);
    });
    byRow.forEach(function (g) {
      g.h = GRP_HEAD + g.items.length * CARD_H + (g.items.length - 1) * GAP + GRP_PAD;
    });
    return byRow;
  }

  /* Группы раскладываются в колонки жадно по высоте: самая низкая колонка
     забирает следующую группу. Порядок доменов книжный, поэтому сортировать
     группы нельзя — только выбирать, в какую колонку положить очередную. */
  function toColumns(groups, n) {
    var cols = [];
    for (var i = 0; i < n; i++) cols.push({ h: 0, groups: [] });
    groups.forEach(function (g) {
      var best = cols[0];
      cols.forEach(function (c) { if (c.h < best.h) best = c; });
      best.groups.push(g);
      best.h += g.h + GAP * 2;
    });
    return cols;
  }

  function layout(list) {
    var placed = [], groups = [], boxes = {};

    M.fa.forEach(function (f) {
      var items = list.filter(function (p) { return p.fa === f.id; });
      var cols = toColumns(packFa(items), Math.min(COLS[f.id], Math.max(1, items.length)));
      var used = cols.filter(function (c) { return c.groups.length; });
      var w = PAD * 2 + used.length * COL_W + (used.length - 1) * GAP * 2;
      var h = HEAD + PAD + Math.max.apply(null, used.map(function (c) { return c.h; }));
      boxes[f.id] = { w: w, h: h, cols: used, t: M.boxes[f.id].t };
    });

    /* Расстановка по PLC слева направо, но Executing и Monitoring & Controlling
       занимают один и тот же горизонтальный слот друг над другом: это не две
       фазы подряд, а одно происходящее — контроль идёт параллельно исполнению. */
    var GUT = 64, x = 40;
    boxes.I.x = x; boxes.I.y = 50; x += boxes.I.w + GUT;
    boxes.P.x = x; boxes.P.y = 50; x += boxes.P.w + GUT;

    var slot = Math.max(boxes.E.w, boxes.MC.w);
    boxes.E.x = x; boxes.E.y = 50;
    boxes.MC.x = x; boxes.MC.y = 50 + boxes.E.h + GUT;
    boxes.E.w = boxes.MC.w = slot;
    x += slot + GUT;

    boxes.C.x = x; boxes.C.y = 50;

    M.canvas.w = x + boxes.C.w + 40;
    M.canvas.h = 50 + Math.max(boxes.I.h, boxes.P.h,
      boxes.E.h + GUT + boxes.MC.h, boxes.C.h) + 40;

    Object.keys(boxes).forEach(function (id) {
      var b = boxes[id], x = b.x + PAD;
      b.cols.forEach(function (c) {
        var cy = b.y + HEAD;
        c.groups.forEach(function (g) {
          groups.push({ x: x, y: cy, w: COL_W, h: g.h, row: g.row });
          g.items.forEach(function (p, i) {
            p.x = x + GRP_PAD;
            p.y = cy + GRP_HEAD + i * (CARD_H + GAP);
            p.w = CARD_W; p.h = CARD_H;
            placed.push(p);
          });
          cy += g.h + GAP * 2;
        });
        x += COL_W + GAP * 2;
      });
    });

    return { items: placed, groups: groups, boxes: boxes };
  }

  /* Матриця домен × фокус-область. Використовується для PMBOK 8 і режиму
     переходу; PMBOK 6 лишається на розкладці контейнерами. */
  function renderMatrix() {
    stage.innerHTML = '';
    stage.style.width = ''; stage.style.height = '';
    nodes = {};
    var list = build();

    var mx = document.createElement('div');
    mx.className = 'mx';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'mxwires');
    mx.appendChild(svg);
    /* Тримаємо матрицю і її полотно: по кліку на них домальовуються
       міждоменні зв'язки, яких немає в постійній схемі. */
    mxEl = mx; mxSvg = svg;

    function h(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; }

    /* шапка: Executing і Monitoring & Controlling — суміжні, під спільною позначкою */
    mx.appendChild(h('hd', 'Performance Domain'));
    mx.appendChild(h('hd', 'Initiating'));
    mx.appendChild(h('hd', 'Planning'));
    mx.appendChild(h('hd par', 'Executing &nbsp;·&nbsp; Monitoring and Controlling<small>run in parallel</small>'));
    mx.appendChild(h('hd', 'Closing'));
    /* другий рядок шапки: яка з двох паралельних колонок яка */
    ['', '', '', 'Executing', 'Monitoring and Controlling', ''].forEach(function (t) {
      mx.appendChild(h('hd sub', t));
    });

    var cells = {};
    M.dom8.forEach(function (r) {
      var rh = h('rowhd', r.t);
      rh.style.background = r.c;
      rh.tabIndex = 0; rh.setAttribute('role', 'button');
      rh.setAttribute('aria-label', 'Domain ' + r.t);
      rh.onclick = function (e) { e.stopPropagation(); selectDomain(r.id); };
      rh.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); selectDomain(r.id); }
        if (e.key === 'Escape') clear();
      };
      mx.appendChild(rh);
      M.fa.forEach(function (f) {
        var box = h('cellbox', '');
        cells[r.id + '|' + f.id] = box;
        mx.appendChild(box);
      });
    });

    list.forEach(function (p) {
      var d = document.createElement('div');
      d.className = 'pnode';
      d.id = 'p-' + p.id;
      var col = state.ed === 'delta' && p.st ? M.status[p.st].c : p.row.c;
      d.style.borderLeftColor = col;
      if (state.ed === 'delta' && p.st === 'same') d.classList.add('unchanged');
      if (state.ed === 'delta' && p.from) {
        d.title = M.status[p.st].t + ':\n' + p.from.map(function (id) {
          var o = M.p6.filter(function (q) { return q[0] === id; })[0];
          return '  ' + id + '  ' + (o ? o[3] : '—');
        }).join('\n');
      }
      d.innerHTML = '<span class="num">' + p.num + '</span><span class="nm">' + p.name + '</span>';
      d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', p.num + ' ' + p.name);
      d.onclick = function (e) { e.stopPropagation(); select(p.id); };
      d.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); select(p.id); }
        if (e.key === 'Escape') clear();
      };
      cells[p.row.id + '|' + p.fa].appendChild(d);
      nodes[p.id] = { el: d, p: p };
    });

    /* Порожня клітинка — без підкладки: інакше вертикальні шини виглядають так,
       ніби ріжуть блоки, а насправді там нічого немає. */
    Object.keys(cells).forEach(function (key) { if (!cells[key].children.length) cells[key].classList.add('void'); });
    stage.appendChild(mx);
    requestAnimationFrame(function () { requestAnimationFrame(function () { drawRowWires(mx, svg, list); fitStage(); }); });

    document.getElementById('counts').innerHTML = state.ed === '8'
      ? '<span><b>40</b> processes</span><span><b>7</b> performance domains</span><span>Eighth Edition (2025)</span>'
      : '<span><b>49 → 40</b></span><span>colour of the left edge is what happened to the process</span>' +
        '<span>hover a card to see what it was made of</span>';
    document.getElementById('dlegend').hidden = state.ed !== 'delta';
    document.getElementById('dropped').hidden = state.ed !== 'delta';
  }

  /* Дроти лише всередині рядка: послідовність процесів домену зліва направо.
     Міждоменні зв'язки не малюються постійно — вони підсвічуються за кліком. */
  function drawRowWires(mx, svg, list) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var k = (function () { var m = stage.style.transform.match(/scale\(([\d.]+)\)/); return m ? +m[1] : 1; })();
    var base = mx.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + mx.offsetWidth + ' ' + mx.offsetHeight);
    function box(el) { var r = el.getBoundingClientRect(); return { x: (r.left - base.left) / k, y: (r.top - base.top) / k, w: r.width / k, h: r.height / k }; }
    function head(pts, ia, ib, members) {
      var n = pts.length, a = pts[n - 2], b = pts[n - 1];
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      var tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      tri.setAttribute('points', (b.x + ux * 10) + ',' + (b.y + uy * 10) + ' ' + (b.x - uy * 4) + ',' + (b.y + ux * 4) + ' ' + (b.x + uy * 4) + ',' + (b.y - ux * 4));
      tri.setAttribute('fill', '#5C6675');
      if (ia) tri.dataset.a = ia; if (ib) tri.dataset.b = ib;
      if (members) tri.dataset.members = members.join(' ');
      svg.appendChild(tri);
    }
    drawCrossWires(svg, box, head);
    M.dom8.forEach(function (r) {
      var seq = list.filter(function (p) { return p.row.id === r.id; });
      if (r.id === 'gov') {
        /* Закриття випливає з контролю виконання, а зміни — бічна петля.
           Тому в Closing веде 7.1, а не 7.2; пряма горизонталь заодно не б'ється
           з шиною контролю, яка входить у 7.1 знизу-справа. */
        var close = seq.pop(), perf = seq.filter(function (p) { return /^Monitor and Control Project/.test(p.name); })[0];
        seq = seq.concat(close);
        var pairs = [];
        for (var q = 0; q < seq.length - 1; q++) pairs.push([seq[q], seq[q + 1]]);
        pairs = pairs.filter(function (pr) { return pr[1] !== close; });
        if (perf) pairs.push([perf, close]);
        pairs.forEach(function (pr) { wire(pr[0], pr[1]); });
        return;
      }
      for (var i = 0; i < seq.length - 1; i++) wire(seq[i], seq[i + 1]);
      function wire(pa, pb) {
        var a = nodes[pa.id].el, b = nodes[pb.id].el;
        var A = box(a), B = box(b);
        var pts;
        if (Math.abs(A.x - B.x) < 4) return;     /* та сама клітинка: порядок карток і є послідовність */
        {
          var sy = A.y + A.h / 2, ey = B.y + B.h / 2, mx0 = (A.x + A.w + B.x) / 2;
          pts = Math.abs(sy - ey) < 3
            ? [{ x: A.x + A.w, y: sy }, { x: B.x - 10, y: ey }]
            : [{ x: A.x + A.w, y: sy }, { x: mx0, y: sy }, { x: mx0, y: ey }, { x: B.x - 10, y: ey }];
        }
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'pwire');
        path.setAttribute('d', withHop(pts));
        path.dataset.a = pa.id; path.dataset.b = pb.id;
        svg.appendChild(path); head(pts, pa.id, pb.id);
      }
    });

    /* Горизонталь, що перетинає вертикаль шини планування, отримує стрибок дугою —
       той самий знак, що й у ланцюга базових планів: перетин є, зв'язку немає. */
    function withHop(pts) {
      if (!planBus || pts.length < 2) return pathFrom(pts);
      var out = pathFrom(pts);
      for (var i = 0; i < pts.length - 1; i++) {
        var p = pts[i], q = pts[i + 1];
        if (Math.abs(p.y - q.y) > 1) continue;                     /* не горизонталь */
        var x0 = Math.min(p.x, q.x), x1 = Math.max(p.x, q.x);
        if (planBus.x <= x0 + 3 || planBus.x >= x1 - 3) continue;  /* не перетинає */
        if (p.y < planBus.y0 - 1 || p.y > planBus.y1 + 1) continue;
        var dir = q.x > p.x ? 1 : -1, hx = planBus.x, y = p.y;
        var d = 'M' + pts[0].x + ',' + pts[0].y;
        for (var j = 1; j <= i; j++) d += ' L' + pts[j].x + ',' + pts[j].y;
        d += ' L' + (hx - 5 * dir) + ',' + y + ' A5,5 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + (hx + 5 * dir) + ',' + y;
        for (var j2 = i + 1; j2 < pts.length; j2++) d += ' L' + pts[j2].x + ',' + pts[j2].y;
        return d;
      }
      return out;
    }
  }

  /* порядок: спершу шини (щоб planBus був відомий), потім рядкові дроти */
  var _drawRowWires = drawRowWires;
  drawRowWires = function (mx, svg, list) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    _drawRowWires(mx, svg, list);
  };

  /* Міждоменні зв'язки однією схемою, без каші: дві вертикальні шини в зазорах
     між колонками і ланцюг базових планів. Усе інше між доменами — по кліку.
       • шина планування: Integrate and Align Project Plans → кожен Plan … Management,
         вниз по лівому зазору колонки Planning;
       • ланцюг базових планів у тому ж зазорі, зовні від шини:
         Develop Scope Structure → Develop Schedule → Estimate Costs → Develop Budget,
         Estimate Resources → Develop Schedule, Plan Risk Responses → Develop Budget;
         на перетині з шиною — «стрибок» дугою, як на електричних схемах;
       • шина контролю: кожен Monitor and Control … → Monitor and Control Project
         Performance, вгору по правому зазору колонки M&C, один наконечник у ціль;
       • Initiate Project or Phase → Identify Stakeholders — пряма вертикаль
         через порожні клітинки Initiating. */
  var planBus = null;   /* {x, y0, y1} — щоб рядкові дроти робили стрибок через шину */

  function drawCrossWires(svg, box, head) {
    var C = '#9AA3B2';
    planBus = null;
    function N(name) { var n = nodes[slug(name)]; return n ? box(n.el) : null; }
    /* Кінці зв'язку проставляємо і на міждоменних дротах — інакше клік по
       картці підсвічує лише рядковий дріт, а шини, які її і живлять,
       лишаються приглушеними. Стовбур шини спільний, тому в нього список
       учасників: він горить, якщо обрано будь-кого з них. */
    function line(d, a, b, members) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('class', 'pwire x');
      p.setAttribute('d', d);
      p.dataset.a = a || 'x'; p.dataset.b = b || 'x';
      if (members) p.dataset.members = members.join(' ');
      svg.appendChild(p);
    }
    function xhead(pts, ia, ib, members) {
      var n = pts.length, a = pts[n - 2], b = pts[n - 1];
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      t.setAttribute('points', (b.x + ux * 9) + ',' + (b.y + uy * 9) + ' ' + (b.x - uy * 3.5) + ',' + (b.y + ux * 3.5) + ' ' + (b.x + uy * 3.5) + ',' + (b.y - ux * 3.5));
      t.setAttribute('fill', C);
      if (ia) t.dataset.a = ia; if (ib) t.dataset.b = ib;
      if (members) t.dataset.members = members.join(' ');
      svg.appendChild(t);
    }

    /* — шина планування — */
    var src = N('Integrate and Align Project Plans');
    var plans = ['Plan Scope Management', 'Plan Schedule Management', 'Plan Financial Management',
                 'Plan Stakeholder Engagement', 'Plan Resource Management', 'Plan Risk Management']
      .map(N).filter(Boolean);
    if (src && plans.length) {
      /* Шина йде серединою зазору між колонками Initiating і Planning, а не
         на око від краю картки. Раніше стояло src.x - 16, і кожен відросток
         до Plan … Management виходив завдовжки 7 px — обрубок, а не дріт. */
      var prev = N('Initiate Project or Phase');
      var bx = prev ? (prev.x + prev.w + src.x) / 2 : src.x - 34;
      var ys = src.y + src.h * 0.3;                     /* верхня третина: по центру входить рядковий дріт 4.1 → 5.1 */
      var yEnd = Math.max.apply(null, plans.map(function (b) { return b.y + b.h / 2; }));
      planBus = { x: bx, y0: ys, y1: yEnd };
      var planIds = ['Plan Scope Management', 'Plan Schedule Management', 'Plan Financial Management',
                     'Plan Stakeholder Engagement', 'Plan Resource Management', 'Plan Risk Management']
        .map(slug).filter(function (id) { return nodes[id]; });
      var srcId = slug('Integrate and Align Project Plans');
      line(pathFrom([{ x: src.x, y: ys }, { x: bx, y: ys }, { x: bx, y: yEnd }]),
           srcId, null, [srcId].concat(planIds));
      plans.forEach(function (b, bi) {
        /* у верхню третину: по центру в ту ж картку може входити рядковий дріт
           (Identify Stakeholders → Plan Stakeholder Engagement), і вони зливалися */
        var y = b.y + b.h * 0.3, pts = [{ x: bx, y: y }, { x: b.x - 9, y: y }];
        line(pathFrom(pts), srcId, planIds[bi]); xhead(pts, srcId, planIds[bi]);
      });
    }

    /* — ланцюг базових планів, зовні від шини, зі стрибком через неї — */
    var chain = [['Develop Scope Structure', 'Develop Schedule'], ['Develop Schedule', 'Estimate Costs'],
                 ['Estimate Costs', 'Develop Budget'], ['Estimate Resources', 'Develop Schedule'],
                 ['Plan Risk Responses', 'Develop Budget']];
    chain.forEach(function (pr, i) {
      var a = N(pr[0]), b = N(pr[1]); if (!a || !b) return;
      var ida = slug(pr[0]), idb = slug(pr[1]);
      var cx = a.x - 34 - (i % 2) * 6;                 /* дві доріжки, щоб зустрічні не злипались */
      var ya = a.y + a.h / 2, yb = b.y + b.h / 2, hx = a.x - 16;
      /* горизонталь від картки до доріжки — зі стрибком дугою через шину */
      line('M' + a.x + ',' + ya + ' L' + (hx + 5) + ',' + ya + ' A5,5 0 0 0 ' + (hx - 5) + ',' + ya + ' L' + cx + ',' + ya, ida, idb);
      line('M' + cx + ',' + ya + ' L' + cx + ',' + yb, ida, idb);
      var end = [{ x: cx, y: yb }, { x: b.x - 9, y: yb }];
      line('M' + cx + ',' + yb + ' L' + (hx - 5) + ',' + yb + ' A5,5 0 0 1 ' + (hx + 5) + ',' + yb + ' L' + (b.x - 9) + ',' + yb, ida, idb);
      xhead(end, ida, idb);
    });

    /* — шина контролю — */
    var dst = N('Monitor and Control Project Performance');
    var mons = ['Monitor and Control Scope', 'Monitor and Control Schedule', 'Monitor and Control Finances',
                'Monitor Stakeholder Engagement', 'Monitor and Control Resourcing', 'Monitor Risks']
      .map(N).filter(Boolean);
    if (dst && mons.length) {
      var rx = dst.x + dst.w + 36;                     /* зовнішня доріжка: внутрішню займає рядковий дріт */
      var yd = dst.y + dst.h * 0.74;                   /* нижче за рядковий дріт, що виходить із 7.1 */
      var yLow = Math.max.apply(null, mons.map(function (b) { return b.y + b.h / 2; }));
      var monIds = ['Monitor and Control Scope', 'Monitor and Control Schedule', 'Monitor and Control Finances',
                    'Monitor Stakeholder Engagement', 'Monitor and Control Resourcing', 'Monitor Risks']
        .map(slug).filter(function (id) { return nodes[id]; });
      var dstId = slug('Monitor and Control Project Performance');
      mons.forEach(function (b, bi) {
        var y = b.y + b.h / 2;
        line('M' + (b.x + b.w) + ',' + y + ' L' + rx + ',' + y, monIds[bi], dstId);
      });
      line('M' + rx + ',' + yLow + ' L' + rx + ',' + yd, null, dstId, monIds.concat(dstId));
      var into = [{ x: rx, y: yd }, { x: dst.x + dst.w + 9, y: yd }];
      line(pathFrom(into), null, dstId, monIds.concat(dstId)); xhead(into, null, dstId, monIds.concat(dstId));
    }

    /* — Initiate Project or Phase → Identify Stakeholders — */
    var ip = N('Initiate Project or Phase'), st = N('Identify Stakeholders');
    if (ip && st) {
      var x = ip.x + 22, pts2 = [{ x: x, y: ip.y + ip.h }, { x: x, y: st.y - 9 }];
      line(pathFrom(pts2), slug('Initiate Project or Phase'), slug('Identify Stakeholders'));
      xhead(pts2, slug('Initiate Project or Phase'), slug('Identify Stakeholders'));
    }
  }

  function render() {
    if (state.ed !== '6') { renderMatrix(); return; }
    stage.innerHTML = '';
    nodes = {};
    var list = build();
    var L = layout(list);

    stage.style.width = M.canvas.w + 'px';
    stage.style.height = M.canvas.h + 'px';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'pwires');
    svg.setAttribute('viewBox', '0 0 ' + M.canvas.w + ' ' + M.canvas.h);
    svg.innerHTML = '<defs><marker id="pah" viewBox="0 0 10 10" refX="8" refY="5" ' +
      'markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M1.5,1.5 L8.5,5 L1.5,8.5 z" fill="#8E96A5"/></marker></defs>';
    stage.appendChild(svg);

    M.fa.forEach(function (f) {
      var b = L.boxes[f.id];
      var d = document.createElement('div');
      d.className = 'fa';
      d.style.cssText = 'left:' + b.x + 'px;top:' + b.y + 'px;width:' +
        b.w + 'px;height:' + b.h + 'px';
      stage.appendChild(d);
      var lab = document.createElement('div');
      lab.className = 'fa-label';
      lab.textContent = b.t;
      lab.style.cssText = 'left:' + (b.x + PAD) + 'px;top:' + (b.y + 14) + 'px';
      stage.appendChild(lab);
    });

    L.groups.forEach(function (g) {
      var d = document.createElement('div');
      d.className = 'grp';
      d.style.cssText = 'left:' + g.x + 'px;top:' + g.y + 'px;width:' + g.w + 'px;height:' + g.h + 'px;' +
        'border-color:' + g.row.c;
      stage.appendChild(d);
      var lab = document.createElement('div');
      lab.className = 'grp-label';
      lab.textContent = g.row.t;
      lab.style.cssText = 'left:' + (g.x + GRP_PAD) + 'px;top:' + (g.y + 9) + 'px;color:' + g.row.c;
      stage.appendChild(lab);
    });

    L.items.forEach(function (p) {
      var d = document.createElement('div');
      d.className = 'pnode';
      d.id = 'p-' + p.id;
      /* В режиме перехода цвет левой границы — судьба процесса, а не домен. */
      var col = state.ed === 'delta' && p.st ? M.status[p.st].c : p.row.c;
      d.style.cssText = 'left:' + p.x + 'px;top:' + p.y + 'px;width:' + p.w + 'px;' +
        'border-left-color:' + col;
      /* Приглушение неизменившихся — классом, а не инлайном: инлайновая
         прозрачность перебила бы подсветку по клику. */
      if (state.ed === 'delta' && p.st === 'same') d.classList.add('unchanged');
      if (state.ed === 'delta' && p.from) {
        d.title = M.status[p.st].t + ':\n' + p.from.map(function (id) {
          var o = M.p6.filter(function (q) { return q[0] === id; })[0];
          return '  ' + id + '  ' + (o ? o[3] : '—');
        }).join('\n');
      }
      d.innerHTML = '<span class="num">' + p.num + (p.old ? '' : '') + '</span>' +
        '<span class="nm">' + p.name + '</span>';
      /* Карточка — управляющий элемент, значит должна открываться и с клавиатуры. */
      d.tabIndex = 0;
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', p.num + ' ' + p.name);
      d.onclick = function (e) { e.stopPropagation(); select(p.id); };
      d.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); select(p.id); }
        if (e.key === 'Escape') clear();
      };
      stage.appendChild(d);
      nodes[p.id] = { el: d, p: p };
    });

    drawWires(svg);
    fitStage();
    document.getElementById('counts').innerHTML = state.ed === '6'
      ? '<span><b>49</b> processes</span><span><b>10</b> knowledge areas</span><span>Sixth Edition (2017)</span>'
      : state.ed === '8'
      ? '<span><b>40</b> processes</span><span><b>7</b> performance domains</span><span>Eighth Edition (2025)</span>'
      : '<span><b>49 → 40</b></span><span>colour of the left edge is what happened to the process</span>' +
        '<span>hover a card to see what it was made of</span>';
    document.getElementById('dlegend').hidden = state.ed !== 'delta';
    document.getElementById('dropped').hidden = state.ed !== 'delta';
  }

  /* Провода. Ортогональные с закруглением: на плотной схеме кривые Безье
     сливаются в кашу, а прямые углы читаются как маршрут. Параллельные связи
     разводятся по «полосам», чтобы не ложиться друг на друга. */
  var R = 10;

  function pathFrom(pts) {
    var d = 'M' + pts[0].x + ',' + pts[0].y;
    for (var i = 1; i < pts.length - 1; i++) {
      var p = pts[i], a = pts[i - 1], b = pts[i + 1];
      var v1 = { x: Math.sign(p.x - a.x), y: Math.sign(p.y - a.y) };
      var v2 = { x: Math.sign(b.x - p.x), y: Math.sign(b.y - p.y) };
      var r = Math.min(R, Math.abs(p.x - a.x) / 2 + Math.abs(p.y - a.y) / 2,
                          Math.abs(b.x - p.x) / 2 + Math.abs(b.y - p.y) / 2);
      d += ' L' + (p.x - v1.x * r) + ',' + (p.y - v1.y * r) +
           ' Q' + p.x + ',' + p.y + ' ' + (p.x + v2.x * r) + ',' + (p.y + v2.y * r);
    }
    var e = pts[pts.length - 1];
    return d + ' L' + e.x + ',' + e.y;
  }

  function route(a, b, lane) {
    var ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    var bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    var off = (lane % 5 - 2) * 7;

    /* Одна колонка — идём по вертикали вдоль края. */
    if (Math.abs(ac.x - bc.x) < 4) {
      var down = bc.y > ac.y;
      var s1 = { x: ac.x + off, y: down ? a.y + a.h : a.y };
      var e1 = { x: bc.x + off, y: down ? b.y : b.y + b.h };
      return [s1, e1];
    }

    var right = bc.x > ac.x;
    var sx = right ? a.x + a.w : a.x;
    var ex = right ? b.x : b.x + b.w;
    var mid = (sx + ex) / 2 + off;
    return [{ x: sx, y: ac.y }, { x: mid, y: ac.y }, { x: mid, y: bc.y }, { x: ex, y: bc.y }];
  }

  function drawWires(svg) {
    var links = state.ed === '6' ? M.links6 : M.links8;
    var lanes = {};
    links.forEach(function (L) {
      var a = nodes[slug(L[0])], b = nodes[slug(L[1])];
      if (!a || !b) return;
      /* Связи с общим источником разводим по полосам: иначе веер ложится в линию. */
      var k = slug(L[0]);
      lanes[k] = (lanes[k] || 0) + 1;
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'pwire' + (L[2] === 'back' ? ' back' : ''));
      path.setAttribute('d', pathFrom(route(a.p, b.p, lanes[k])));
      path.setAttribute('marker-end', 'url(#pah)');
      path.dataset.a = k; path.dataset.b = slug(L[1]);
      svg.appendChild(path);
    });
  }

  /* Постійно намальовані лише дві шини й ланцюг планів: решта міждоменних
     зв'язків заплуталася б у кашу. Тому на кліку вони домальовуються тимчасово —
     видно саме те, з чим пов'язаний обраний процес, і нічого зайвого. */
  var mxEl = null, mxSvg = null;

  function dropTemp() {
    if (!mxSvg) return;
    [].forEach.call(mxSvg.querySelectorAll('.tmp'), function (n) { n.parentNode.removeChild(n); });
  }

  /* Вільні коридори по осі: зайняті картками інтервали зливаємо, лишаються
     проміжки. Лінія кладеться тільки в них — тоді вона не може пройти під
     плашкою. Перша версія вела дріт серединою між картками, і на дев'яти
     процесах із сорока він ішов просто крізь чужі клітинки. */
  function lanesOf(boxes, axis) {
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
  function segHits(p1, p2, boxes) {
    var x0 = Math.min(p1.x, p2.x), x1 = Math.max(p1.x, p2.x);
    var y0 = Math.min(p1.y, p2.y), y1 = Math.max(p1.y, p2.y);
    return boxes.some(function (b) {
      return x1 > b.x + 1 && x0 < b.x + b.w - 1 && y1 > b.y + 1 && y0 < b.y + b.h - 1;
    });
  }
  function routeClear(pts, boxes) {
    for (var i = 1; i < pts.length; i++) if (segHits(pts[i - 1], pts[i], boxes)) return false;
    return true;
  }

  function drawTempLinks(id) {
    dropTemp();
    if (!mxEl || !mxSvg || state.ed === '6') return;
    var k = (function () { var m = stage.style.transform.match(/scale\(([\d.]+)\)/); return m ? +m[1] : 1; })();
    var base = mxEl.getBoundingClientRect();
    function box(el) {
      var r = el.getBoundingClientRect();
      return { x: (r.left - base.left) / k, y: (r.top - base.top) / k, w: r.width / k, h: r.height / k };
    }
    var all = [].map.call(mxEl.querySelectorAll('.pnode'), function (n) { var b = box(n); b.el = n; return b; });
    var xl = lanesOf(all, 'x'), yl = lanesOf(all, 'y');

    /* які пари вже намальовані — щоб не класти другу лінію поверх наявної */
    var drawn = {};
    [].forEach.call(mxSvg.querySelectorAll('.pwire'), function (w) {
      if (w.dataset.a && w.dataset.b) { drawn[w.dataset.a + '>' + w.dataset.b] = 1; drawn[w.dataset.b + '>' + w.dataset.a] = 1; }
      (w.dataset.members || '').split(' ').forEach(function (m) { if (m) drawn[m + '>' + w.dataset.a] = drawn[w.dataset.a + '>' + m] = 1; });
    });

    (M.links8 || []).forEach(function (L) {
      var a = slug(L[0]), b = slug(L[1]);
      if (a !== id && b !== id) return;
      if (!nodes[a] || !nodes[b]) return;
      if (drawn[a + '>' + b]) return;
      var fromEl = nodes[a].el, toEl = nodes[b].el;
      var A = box(fromEl), B = box(toEl);
      var obst = all.filter(function (o) { return o.el !== fromEl && o.el !== toEl; });
      var ac = { x: A.x + A.w / 2, y: A.y + A.h / 2 }, bc = { x: B.x + B.w / 2, y: B.y + B.h / 2 };
      var mid = { x: (ac.x + bc.x) / 2, y: (ac.y + bc.y) / 2 }, pts = null;

      var byX = xl.slice().sort(function (u, v) { return Math.abs(u - mid.x) - Math.abs(v - mid.x); });
      for (var i = 0; i < byX.length && !pts; i++) {
        var c = byX[i];
        var x1 = c > ac.x ? A.x + A.w : A.x, x2 = c > bc.x ? B.x + B.w + 9 : B.x - 9;
        var cand = [{ x: x1, y: ac.y }, { x: c, y: ac.y }, { x: c, y: bc.y }, { x: x2, y: bc.y }];
        if (routeClear(cand, obst)) pts = cand;
      }
      var byY = yl.slice().sort(function (u, v) { return Math.abs(u - mid.y) - Math.abs(v - mid.y); });
      for (var j = 0; j < byY.length && !pts; j++) {
        var r2 = byY[j];
        var y1 = r2 > ac.y ? A.y + A.h : A.y, y2 = r2 > bc.y ? B.y + B.h + 9 : B.y - 9;
        var cand2 = [{ x: ac.x, y: y1 }, { x: ac.x, y: r2 }, { x: bc.x, y: r2 }, { x: bc.x, y: y2 }];
        if (routeClear(cand2, obst)) pts = cand2;
      }
      /* вільного коридору немає — лінію не малюємо: картка-сусід і так підсвічена */
      if (!pts) return;

      var d = pts.map(function (pt, i2) { return (i2 ? 'L' : 'M') + pt.x + ' ' + pt.y; }).join(' ');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'pwire hot tmp');
      path.setAttribute('d', d);
      path.dataset.a = a; path.dataset.b = b;
      mxSvg.appendChild(path);
      var n = pts.length, u = pts[n - 2], v = pts[n - 1];
      var dx = v.x - u.x, dy = v.y - u.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      var tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      tri.setAttribute('class', 'tmp');
      tri.setAttribute('points', (v.x + ux * 10) + ',' + (v.y + uy * 10) + ' ' +
        (v.x - uy * 4) + ',' + (v.y + ux * 4) + ' ' + (v.x + uy * 4) + ',' + (v.y - ux * 4));
      mxSvg.appendChild(tri);
    });
  }

  function select(id) {
    if (state.sel === id) { clear(); return; }
    state.sel = id;
    stage.classList.add('is-hot');
    [].forEach.call(stage.querySelectorAll('.pnode'), function (n) { n.classList.remove('hot', 'near'); });
    nodes[id].el.classList.add('hot');
    [].forEach.call(stage.querySelectorAll('.pwire, .mxwires polygon'), function (w) {
      var mem = (w.dataset.members || '').split(' ');
      var on = w.dataset.a === id || w.dataset.b === id || mem.indexOf(id) >= 0;
      w.classList.toggle('hot', on);
      if (on) {
        [w.dataset.a, w.dataset.b].forEach(function (other) {
          if (other && other !== id && nodes[other]) nodes[other].el.classList.add('near');
        });
      }
    });
    /* У матриці міждоменні зв'язки не намальовані — підсвічуємо їх сусідів
       за списком links8, щоб клік показував і те, що йде через домени. */
    if (state.ed !== '6') {
      (M.links8 || []).forEach(function (L) {
        var a = slug(L[0]), b = slug(L[1]);
        if (a === id && nodes[b]) nodes[b].el.classList.add('near');
        if (b === id && nodes[a]) nodes[a].el.classList.add('near');
      });
    }
    drawTempLinks(id);
  }
  /* Клік по заголовку домену — підсвітити весь домен: його картки і всі дроти,
     що їх торкаються. Це відповідь на «з чим пов'язаний цей блок» на рівні домену. */
  function selectDomain(dom) {
    if (state.sel === 'dom:' + dom) { clear(); return; }
    state.sel = 'dom:' + dom;
    dropTemp();
    stage.classList.add('is-hot');
    var ids = {};
    Object.keys(nodes).forEach(function (k) {
      var on = nodes[k].p.row.id === dom;
      nodes[k].el.classList.toggle('hot', on);
      nodes[k].el.classList.remove('near');
      if (on) ids[k] = 1;
    });
    [].forEach.call(stage.querySelectorAll('.pwire, .mxwires polygon'), function (w) {
      var mem = (w.dataset.members || '').split(' ');
      var on = ids[w.dataset.a] || ids[w.dataset.b] || mem.some(function (m) { return ids[m]; });
      w.classList.toggle('hot', !!on);
      if (on) {
        [w.dataset.a, w.dataset.b].forEach(function (o) {
          if (o && nodes[o] && !ids[o]) nodes[o].el.classList.add('near');
        });
      }
    });
    [].forEach.call(stage.querySelectorAll('.rowhd'), function (h2) { h2.classList.remove('on'); });
  }

  function clear() {
    state.sel = null;
    dropTemp();
    stage.classList.remove('is-hot');
    [].forEach.call(stage.querySelectorAll('.pnode'), function (n) { n.classList.remove('hot', 'near'); });
    [].forEach.call(stage.querySelectorAll('.pwire, .mxwires polygon'), function (w) { w.classList.remove('hot'); });
  }
  document.addEventListener('click', clear);

  /* Полотно масштабируется целиком — плакат остаётся плакатом на любом экране.
     Плюс живой зум: колесо с Ctrl/⌘ и перетаскивание. */
  var Z = window.Zoom(fit, stage, function (k) {
    var h = state.ed === '6' ? M.canvas.h : stage.scrollHeight;
    fit.style.height = Math.min(h * k, innerHeight * 0.9) + 'px';
    var mx = stage.querySelector('.mx');
    if (mx) requestAnimationFrame(function () { drawRowWires(mx, mx.querySelector('.mxwires'), build()); });
  });
  function fitStage() {
    Z.fit();
    var h = state.ed === '6' ? M.canvas.h : stage.scrollHeight;
    fit.style.height = (h * Z.get()) + 'px';
  }
  addEventListener('resize', fitStage);

  [].forEach.call(document.querySelectorAll('#ed-seg button'), function (b) {
    b.onclick = function () {
      state.ed = b.dataset.ed;
      [].forEach.call(b.parentNode.children, function (x) { x.classList.toggle('on', x === b); });
      render();
    };
  });

  /* легенда режима перехода */
  (function () {
    var host = document.getElementById('dlegend');
    Object.keys(M.status).forEach(function (k) {
      if (k === 'gone') return;
      var sp = document.createElement('span');
      sp.innerHTML = '<i style="background:' + M.status[k].c + '"></i>' + M.status[k].t;
      host.appendChild(sp);
    });
  })();

  render();
})();
