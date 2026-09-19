/* Отрисовка схемы: слой процессов строится из EDITIONS, пресейл из PRESALE,
 * цикл из ITERATION. Разметка нигде не дублирует данные — иначе переключение
 * изданий пришлось бы поддерживать в двух местах. */
(function () {
  var E = window.EDITIONS, P = window.PRESALE, I = window.ITERATION;
  var fw = document.getElementById('fw');
  var state = { ed: '8', fw: 'universal', discovery: 'on', grade: '' };

  function el(tag, cls, txt) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (txt != null) d.textContent = txt;
    return d;
  }
  function cell(cls, txt, id, sub) {
    var d = el('div', 'cell ' + cls, sub ? null : txt);
    if (sub) { d.appendChild(el('b', null, txt)); d.appendChild(el('small', null, sub)); }
    if (id) d.id = id;
    d.dataset.h = txt;
    d.tabIndex = 0;
    return d;
  }
  /* Отрезок шкалы → проценты. Координаты взяты из исходного фрейма Miro:
     ширина и смещение и есть смысл, а не декорация. */
  var SC = window.SCALE, SP = window.SPANS;
  function span(node, seg, top, h) {
    var w = SC.max - SC.min;
    node.style.left = ((seg[0] - SC.min) / w * 100) + '%';
    node.style.width = ((seg[1] - seg[0]) / w * 100) + '%';
    if (top != null) node.style.top = top + 'px';
    if (h != null) node.style.height = h + 'px';
    return node;
  }
  /* gap — відступ під доріжкою. За замовчуванням це коридор для стрілок (--track-gap);
     там, де стрілок немає (смуги доменів, артефакти), доріжки стоять щільніше. */
  function track(host, h, gap) {
    var t = el('div', 'track');
    t.style.height = h + 'px';
    if (gap != null) t.style.marginBottom = gap + 'px';
    host.appendChild(t);
    return t;
  }


  function place(node, col, row, colSpan, rowSpan) {
    node.style.gridColumn = col + (colSpan ? ' / span ' + colSpan : '');
    node.style.gridRow = row + (rowSpan ? ' / span ' + rowSpan : '');
    return node;
  }

  /* ── пресейл ───────────────────────────────────────────────── */
  function renderPresale() {
    var host = document.getElementById('pre');
    host.innerHTML = '';

    var stages = el('div', 'pre-stages');
    P.stages.forEach(function (s) { stages.appendChild(el('div', 'stage-head', s.t)); });
    P.stages.forEach(function (s) {
      var col = el('div', 'pre-col');
      s.steps.forEach(function (st) { col.appendChild(cell(st.grade, st.t, st.id)); });
      stages.appendChild(col);
    });
    host.appendChild(stages);

    var g = el('div', 'gate');
    g.id = P.gate.id;
    g.dataset.h = P.gate.t; g.tabIndex = 0;
    g.innerHTML = P.gate.t + '<span class="q">Is the estimate solid enough to sell?</span>';
    host.appendChild(g);

    /* Discovery живёт в собственной колонке между пресейлом и проектом:
       это возможная следующая фаза, а не часть пресейла. */
    var D = P.discovery;
    var box = document.getElementById('disc');
    box.innerHTML = '';
    box.id = 'disc';
    var head = el('div', 'disc-head');
    head.innerHTML = '<span>Inserted only when the gate fails</span><em>' + D.cadence + '</em>';
    box.appendChild(head);
    D.steps.forEach(function (s) { box.appendChild(cell(s.grade, s.t, s.id)); });
    var out = el('div', 'disc-out');
    out.appendChild(el('b', null, 'Three ways out'));
    D.outcomes.forEach(function (o) { out.appendChild(el('span', null, '→ ' + o)); });
    box.appendChild(out);
  }

  /* ── слой процессов ────────────────────────────────────────── */
  var ROW = 42, BIG = 46;
  var BAND_GAP = 10, ART_GAP = 8;
  var GAP = 26;   /* однаковий відступ між усіма доріжками; збігається з --track-gap */

  function renderProc() {
    var ed = E[state.ed];
    var host = document.getElementById('proc');
    host.innerHTML = '';

    /* полоса фаз: Executing и M&C — две тонкие полосы на одном отрезке,
       потому что они параллельны, а не идут друг за другом */
    var t = track(host, 52, BAND_GAP);
    t.appendChild(span(cell('plc', 'Initiating'), SP.init, 0, 52));
    t.appendChild(span(cell('plc', 'Planning'), SP.plan, 0, 52));
    t.appendChild(span(cell('plc sm', 'Executing'), SP.exec, 0, 24));
    t.appendChild(span(cell('plc sm', 'Monitoring and Controlling'), SP.exec, 28, 24));
    t.appendChild(span(cell('plc', 'Closing'), SP.close, 0, 52));

    /* сквозные дисциплины: тянутся от своей фазы до конца E/MC */
    ed.bands.forEach(function (b, i) {
      /* між смугами стрілок немає — щільно; під останньою лишається коридор */
      var tr = track(host, ROW, i < ed.bands.length - 1 ? BAND_GAP : null);
      var seg = b.to === 5 ? SP.crossGov : b.from === 1 ? SP.crossAll : SP.crossPlan;
      tr.appendChild(span(cell(b.grade, b.t, b.id), seg, 0, ROW));
    });

    /* уровень проекта */
    /* Отрезок Executing / M&C на уровне проекта держат только два процесса:
       изменения приходят не по такту, релиз охватывает несколько итераций.
       Всё остальное исполнение и контроль — внутри цикла, и повторять их
       отдельными плашками значит говорить одно и то же трижды. */
    /* Вимоги — робота PO, тож стоять у колонці беклогу над ним. Дисципліни й
       контроль змін займають висоту обох рядків: вимоги → беклог — один міст. */
    var n = ed.disciplines.length;
    var bigH = n * BIG + (n - 1) * 8;
    var bridgeH = ROW + GAP + bigH;
    var dStep = (bridgeH - n * BIG) / (n - 1);
    var t2 = track(host, ROW);
    t2.appendChild(span(cell('g-po', ed.requirements.t, 'n-req'), SP.requirements, 0, ROW));
    ed.disciplines.forEach(function (d, i) {
      t2.appendChild(span(cell(d.grade, d.t, d.id), SP.disciplines, Math.round(i * (BIG + dStep)), BIG));
    });
    t2.appendChild(span(cell('g-senior', ed.changes.t, 'n-picc'), SP.picc, 0, bridgeH));

    var t3 = track(host, bigH);
    t3.appendChild(span(cell('g-po', 'Product Backlog', 'n-backlog'), SP.backlog, 0, bigH));

    /* Управління релізами — під контролем змін, у тій самій колонці. */
    var t4 = track(host, ROW);
    t4.appendChild(span(cell('g-po', 'Release Backlog', 'n-relb'), SP.relBacklog, 0, ROW));
    t4.appendChild(span(cell('g-senior', 'Release management', 'n-relm'), SP.relMgmt, 0, ROW));

    /* блок цикла — содержимое не трогаем, меняется только его отрезок на шкале */
    var t5 = track(host, 10);
    var iter = el('div', 'iter');
    iter.id = 'n-iter';
    iter.dataset.fw = state.fw;
    iter.innerHTML =
      '<div class="iter-head"><span>Delivery cycle</span><span id="iter-cadence"></span></div>' +
      '<div class="iter-tabs" id="iter-tabs" role="group" aria-label="Iteration approach"></div>' +
      '<svg class="cwires" id="cwires" aria-hidden="true"></svg>' +
      '<div class="iter-grid" id="iter-grid"></div>';
    t5.appendChild(span(iter, SP.iteration, 0));
    renderIteration();
    t5.style.height = iter.offsetHeight + 'px';

    /* Передача результату тягнеться від першої смуги, що закінчується до Closing,
       до низу циклу: смуги, які доходять до кінця Closing, лежать над нею. */
    var firstShort = ed.bands.filter(function (b) { return b.to !== 5; })[0];
    var fsEl = firstShort && document.getElementById(firstShort.id);
    var top3 = fsEl ? fsEl.parentNode.offsetTop : t3.offsetTop;
    var bottom = t5.offsetTop + t5.offsetHeight;
    var trans = span(cell('g-any', 'Final product, service, or result transition', 'n-trans'),
                     SP.transition, top3 - t3.offsetTop, bottom - top3);
    trans.style.position = 'absolute';
    t3.appendChild(trans);
  }

  function approach() {
    return I.approaches.filter(function (x) { return x.id === state.fw; })[0] || I.approaches[0];
  }

  /* Кожен підхід має власну сітку всередині блоку: колонки, рядки-доріжки й
     вузли з позиціями з даних. Однакових десяти плашок із різними підписами
     більше немає — форма циклу теж частина змісту. */
  /* Перемикач підходу живе в самому блоці циклу: він змінює лише те, що всередині
     рамки, і стоїть там, де видно результат. */
  function renderTabs() {
    var host = document.getElementById('iter-tabs');
    if (!host) return;
    host.innerHTML = '';
    I.approaches.forEach(function (x) {
      var b = el('button', x.id === state.fw ? 'on' : '', x.title);
      b.type = 'button';
      b.setAttribute('aria-pressed', x.id === state.fw ? 'true' : 'false');
      b.onclick = function (e) {
        e.stopPropagation();
        state.fw = x.id;
        /* повна перебудова: висота циклу різна в різних підходах, а від неї
           залежать доріжка під ним, передача результату й шар артефактів */
        redraw();
        var sg = document.getElementById('fw-seg');
        if (sg) [].forEach.call(sg.children, function (c, i) { c.classList.toggle('on', I.approaches[i].id === x.id); });
        document.dispatchEvent(new CustomEvent('fw:approach'));
      };
      host.appendChild(b);
    });
  }

  function renderIteration() {
    var a = approach();
    renderTabs();
    document.getElementById('iter-cadence').textContent = a.cadence;
    document.getElementById('n-iter').dataset.fw = a.id;
    var grid = document.getElementById('iter-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = '76px repeat(' + a.cols + ', minmax(0, 1fr))';
    grid.style.gridTemplateRows = 'repeat(' + a.lanes.length + ', auto)';
    a.lanes.forEach(function (l, i) {
      grid.appendChild(place(el('span', 'lane-label', l), 1, i + 1));
    });
    a.nodes.forEach(function (n) {
      grid.appendChild(place(cell(n.grade, n.t, n.id, n.s), n.c + 1, n.r, n.cs));
    });
    requestAnimationFrame(drawCycle);
  }

  /* Стрілки циклу з даних. Маршрути:
       h     — по горизонталі між гранями одного рядка;
       v     — по вертикалі (fb задає x, якщо колонки перекриваються);
       dn/up — униз/угору через проміжок між рядками;
       dside — униз із низу джерела і збоку в ліву грань цілі;
       over  — поверх усіх вузлів (повернення на початок циклу);
       gap   — через проміжок над рядком джерела (мала петля);
       floor — під усіма вузлами, у ціль знизу. */
  function drawCycle() {
    var iter = document.getElementById('n-iter');
    var svg = document.getElementById('cwires');
    if (!iter || !svg) return;
    var a = approach();
    var k = scaleOf();
    var base = iter.getBoundingClientRect();
    var B = {};
    a.nodes.forEach(function (n) {
      var node = document.getElementById(n.id);
      if (node) B[n.id] = boxOf(node, base, k);
    });
    if (Object.keys(B).length < a.nodes.length) return;
    svg.setAttribute('viewBox', '0 0 ' + iter.offsetWidth + ' ' + iter.offsetHeight);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var tops = [], bottoms = [];
    Object.keys(B).forEach(function (id) { tops.push(B[id].y); bottoms.push(B[id].y + B[id].h); });
    var TOP = Math.min.apply(null, tops) - 14, FLOOR = Math.max.apply(null, bottoms) + 16;

    a.edges.forEach(function (e) {
      var s = B[e[0]], t = B[e[1]], kind = e[2];
      var fa = e[3] == null ? 0.5 : e[3], fb = e[4] == null ? fa : e[4];
      var sx = s.x + s.w * fa, tx = t.x + t.w * fb, pts;
      if (kind === 'h') {
        var y = (Math.max(s.y, t.y) + Math.min(s.y + s.h, t.y + t.h)) / 2;
        pts = t.x > s.x ? [{ x: s.x + s.w, y: y }, { x: t.x, y: y }] : [{ x: s.x, y: y }, { x: t.x + t.w, y: y }];
      } else if (kind === 'v') {
        var l = Math.max(s.x, t.x), r = Math.min(s.x + s.w, t.x + t.w);
        var x = e[3] == null ? (l + r) / 2 : Math.min(r - 6, Math.max(l + 6, tx));
        pts = t.y > s.y ? [{ x: x, y: s.y + s.h }, { x: x, y: t.y }] : [{ x: x, y: s.y }, { x: x, y: t.y + t.h }];
      } else if (kind === 'dn') {
        var my = (s.y + s.h + t.y) / 2;
        pts = [{ x: sx, y: s.y + s.h }, { x: sx, y: my }, { x: tx, y: my }, { x: tx, y: t.y }];
      } else if (kind === 'up') {
        var my2 = (t.y + t.h + s.y) / 2 + 5;
        pts = [{ x: sx, y: s.y }, { x: sx, y: my2 }, { x: tx, y: my2 }, { x: tx, y: t.y + t.h }];
      } else if (kind === 'dside') {
        var yy = t.y + t.h / 2;
        pts = [{ x: sx, y: s.y + s.h }, { x: sx, y: yy }, { x: t.x, y: yy }];
      } else if (kind === 'over') {
        pts = [{ x: sx, y: s.y }, { x: sx, y: TOP }, { x: tx, y: TOP }, { x: tx, y: t.y }];
      } else if (kind === 'gap') {
        var gy = s.y - 22;
        pts = [{ x: sx, y: s.y }, { x: sx, y: gy }, { x: tx, y: gy }, { x: tx, y: t.y }];
      } else {
        pts = [{ x: sx, y: s.y + s.h }, { x: sx, y: FLOOR }, { x: tx, y: FLOOR }, { x: tx, y: t.y + t.h }];
      }
      var tt = trimEnd(pts, 13);
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('class', 'cwire');
      p.setAttribute('d', pathFrom(tt));
      p.dataset.a = e[0]; p.dataset.b = e[1];
      svg.appendChild(p);
      head(svg, tt, '#5C6675', e[0], e[1]);
    });
  }

  /* ── артефакты ─────────────────────────────────────────────── */
  function fillStack(host, list) {
    host.innerHTML = '';
    var two = el('div', 'row2');
    var a = el('div', 'stack'), b = el('div', 'stack');
    list.forEach(function (x, i) { (i % 2 ? b : a).appendChild(cell(x.grade, x.t)); });
    two.appendChild(a); two.appendChild(b);
    host.appendChild(two);
  }

  function renderArtefactLayer() {
    var A = window.ARTEFACTS;
    var host = document.getElementById('art-proc');
    host.innerHTML = '';

    /* Шапка фаз — така сама, як над процесами: артефакти читаються під тими самими фазами. */
    var t0 = track(host, 52, ART_GAP);
    t0.appendChild(span(cell('plc', 'Initiating'), SP.init, 0, 52));
    t0.appendChild(span(cell('plc', 'Planning'), SP.plan, 0, 52));
    t0.appendChild(span(cell('plc sm', 'Executing'), SP.exec, 0, 24));
    t0.appendChild(span(cell('plc sm', 'Monitoring and Controlling'), SP.exec, 28, 24));
    t0.appendChild(span(cell('plc', 'Closing'), SP.close, 0, 52));

    var rows = Math.max.apply(null, A.cols.map(function (c) { return c.items.length; }));
    var H = 34, G = ART_GAP;
    var t1 = track(host, rows * H + (rows - 1) * G, G);
    A.cols.forEach(function (c) {
      c.items.forEach(function (it, i) {
        t1.appendChild(span(cell(it[1], it[0]), SP[c.seg], i * (H + G), H));
      });
    });

    A.rows.forEach(function (r) {
      var tr = track(host, H, G);
      tr.appendChild(span(cell(r.grade, r.t), SP[r.seg], 0, H));
    });
  }

  function renderArtefacts() {
    renderArtefactLayer();
    fillStack(document.getElementById('art-pre'), P.artefacts);
    var d = document.getElementById('art-disc');
    if (state.discovery === 'on') {
      d.style.display = '';
      d.innerHTML = '';
      var st = el('div', 'stack');
      P.discovery.artefacts.forEach(function (x) { st.appendChild(cell(x.grade, x.t)); });
      d.appendChild(st);
    } else {
      d.style.display = 'none';
    }
    document.querySelector('#fw-art .side.disco').style.display =
      state.discovery === 'on' ? '' : 'none';
  }

  /* ── провода ───────────────────────────────────────────────── */
  /* Связи. Осталось девять: положение на шкале уже говорит, что дисциплины —
     мост между бэклогом и контролем изменений, поэтому веер «в каждую плашку»
     был повтором и давал гребёнку. Каждой связи задан маршрут, а не «как выйдет»:
       h     — вбок через вертикальный коридор (пустой зазор шкалы),
       v     — по вертикали через горизонтальный коридор (зазор между дорожками),
       over  — вверх над обоими блоками, поверху и вниз (обратные связи). */
  /* Связи уровня проекта. Стрелка приходит в каждую плашку — так в оригинале,
     и так видно, что каждая дисциплина и планируется от бэклога, и подчиняется
     контролю изменений. Вход в цикл — сбоку в первый шаг менеджмента, выход —
     из последнего шага разработки в управление релизами. */
  var FAN = ['d-scope', 'd-sched', 'd-cost', 'd-qual', 'd-proc'];

  var LINKS = [
    ['n-req',     'n-backlog',  'v',    ''],
    ['n-backlog', 'n-relb',     'v',    ''],
    ['n-relb',    'it-select',  'side', ''],
    ['it-release','n-relm',     'outside', ''],
    ['n-relm',    'n-relb',     'h',    ''],
    ['n-relm',    'n-picc',     'v',    ''],
    ['n-relm',    'n-trans',    'h',    ''],

    ['p-hand',  'p-gate',  'v', ''],
    ['p-gate',  'dc-sow',  'h', 'disco'],
    /* Возврат из дискавери — к гейту, а не в оценку: путь в столбец пресейла
       пришлось бы вести сквозь три плашки, а решение принимается на гейте. */
    ['dc-rep',  'p-gate',  'h', '']
  ];

  /* Вхід і вихід циклу залежать від підходу: у Kanban це Options і Delivered,
     у SAFe — PI Planning і Release on Demand. */
  function links() {
    var a = approach();
    return LINKS.map(function (L) {
      return [L[0] === 'it-release' ? a.exit : L[0], L[1] === 'it-select' ? a.entry : L[1], L[2], L[3]];
    });
  }

  /* Шина. Потік іде Assess and Implement Changes → чотири дисципліни → Product
     Backlog. Один стовбур виходить із джерела, вертикальна шина, гілки в кожну
     плашку; з іншого боку гілки сходяться в шину і одним стовбуром входять у ціль.
     Наконечники — тільки там, де потік справді входить: у дисципліни і в Backlog. */
  function drawBus(svg, base, k) {
    var picc = document.getElementById('n-picc'), back = document.getElementById('n-backlog');
    var ds = FAN.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!picc || !back || !ds.length) return;
    var P = boxOf(picc, base, k), Bk = boxOf(back, base, k);
    var D = ds.map(function (d) { return boxOf(d, base, k); });
    var color = '#5C6675';

    function line(pts, cls) {
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'wire ' + (cls || ''));
      path.setAttribute('d', pathFrom(pts));
      path.dataset.a = 'bus'; path.dataset.b = 'bus';
      svg.appendChild(path);
    }

    /* права шина: Assess → дисципліни */
    var dR = Math.max.apply(null, D.map(function (d) { return d.x + d.w; }));
    var xR = (dR + P.x) / 2;
    var yTop = D[0].y + D[0].h / 2, yBot = D[D.length - 1].y + D[D.length - 1].h / 2;
    var yP = P.y + P.h / 2;
    line([{ x: P.x, y: yP }, { x: xR, y: yP }]);                       /* стовбур */
    line([{ x: xR, y: Math.min(yTop, yP) }, { x: xR, y: Math.max(yBot, yP) }]); /* шина */
    D.forEach(function (d) {
      var y = d.y + d.h / 2;
      var pts = trimEnd([{ x: xR, y: y }, { x: d.x + d.w, y: y }], 13);
      line(pts); head(svg, pts, color);
    });

    /* ліва шина: дисципліни → Backlog */
    var dL = Math.min.apply(null, D.map(function (d) { return d.x; }));
    var xL = (Bk.x + Bk.w + dL) / 2;
    var yB = Bk.y + Bk.h / 2;
    D.forEach(function (d) {
      var y = d.y + d.h / 2;
      line([{ x: d.x, y: y }, { x: xL, y: y }]);                      /* гілка без наконечника */
    });
    line([{ x: xL, y: Math.min(yTop, yB) }, { x: xL, y: Math.max(yBot, yB) }]);
    var trunk = trimEnd([{ x: xL, y: yB }, { x: Bk.x + Bk.w, y: yB }], 13);
    line(trunk); head(svg, trunk, color);
  }

  var R = 9;

  function pathFrom(pts) {
    var d = 'M' + pts[0].x + ',' + pts[0].y;
    for (var i = 1; i < pts.length - 1; i++) {
      var p = pts[i], a = pts[i - 1], b = pts[i + 1];
      var v1 = { x: Math.sign(p.x - a.x), y: Math.sign(p.y - a.y) };
      var v2 = { x: Math.sign(b.x - p.x), y: Math.sign(b.y - p.y) };
      var r = Math.min(R, (Math.abs(p.x - a.x) + Math.abs(p.y - a.y)) / 2,
                          (Math.abs(b.x - p.x) + Math.abs(b.y - p.y)) / 2);
      d += ' L' + (p.x - v1.x * r) + ',' + (p.y - v1.y * r) +
           ' Q' + p.x + ',' + p.y + ' ' + (p.x + v2.x * r) + ',' + (p.y + v2.y * r);
    }
    var e = pts[pts.length - 1];
    return d + ' L' + e.x + ',' + e.y;
  }

  /* Наконечник рисуется в конце пути, поэтому путь укорачивается на его длину:
     иначе остриё уезжает под рамку плашки и стрелка читается как линия.
     Срез не больше половины длины — короткая связь иначе исчезает вовсе. */
  /* Наконечник рисуем сами треугольником, а не marker-end: у маркеров размер
     зависит от толщины линии и от единиц, и на части связей остриё пропадало.
     Свой треугольник виден всегда и одинаков у всех стрелок. */
  function head(svg, pts, color, from, to) {
    var n = pts.length, a = pts[n - 2], b = pts[n - 1];
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len, px = -uy, py = ux;
    var L = 13, W = 5;
    var tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    tri.setAttribute('points',
      (b.x + ux * L) + ',' + (b.y + uy * L) + ' ' +
      (b.x + px * W) + ',' + (b.y + py * W) + ' ' +
      (b.x - px * W) + ',' + (b.y - py * W));
    tri.setAttribute('fill', color);
    tri.dataset.a = from || 'bus'; tri.dataset.b = to || 'bus';
    svg.appendChild(tri);
  }

  function trimEnd(pts, by) {
    var n = pts.length;
    var a = pts[n - 2], b = pts[n - 1];
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    if (len <= by * 2) by = Math.max(2, len / 2);
    pts[n - 1] = { x: b.x - dx / len * by, y: b.y - dy / len * by };
    return pts;
  }

  /* Прямоугольники приходят с учётом зума, а viewBox задан в исходных пикселях:
     без деления на масштаб стрелки уезжают на всех зумах, кроме 100%. */
  function scaleOf() {
    var st = document.getElementById('zoomstage');
    var m = st && st.style.transform.match(/scale\(([\d.]+)\)/);
    return m ? parseFloat(m[1]) : 1;
  }

  function boxOf(node, base, k) {
    var r = node.getBoundingClientRect();
    return { x: (r.left - base.left) / k, y: (r.top - base.top) / k,
             w: r.width / k, h: r.height / k };
  }

  /* GAP визначено вгорі */

  /* Коридор над дорожкой источника: это её верхний отступ, он пуст по
     построению. Раньше я брал «16px над плашкой» — и попадал прямо в соседний
     ряд, отчего обратные связи шли сквозь Requirements и Product Backlog. */
  function corridorAbove(node) {
    var tr = node.closest('.track');
    return tr ? tr.offsetTop - GAP / 2 : null;
  }

  function route(a, b, kind, lane, aEl) {
    /* 'side' — вход строго в боковую грань: спускаемся до высоты цели и
       заходим горизонтально. Обычный вертикальный маршрут протыкал бы
       верхнюю грань, а просили сбоку. */
    /* 'outside' — обойти справа: прямая вертикаль вверх шла бы сквозь шаг,
       стоящий над источником. Уходим за правый край блока и поднимаемся там. */
    if (kind === 'outside') {
      /* за правою межею блоку циклу, а не одразу за карткою: вихід може стояти
         не в крайній колонці, і вертикаль тоді йшла б крізь сусідні вузли */
      var it = document.getElementById('n-iter');
      var X = it ? boxOf(it, fw.getBoundingClientRect(), scaleOf()).x + it.offsetWidth + 16 : a.x + a.w + 28;
      return [{ x: a.x + a.w, y: a.y + a.h / 2 }, { x: X, y: a.y + a.h / 2 },
              { x: X, y: b.y + b.h }];
    }

    /* 'around' — обойти слева: между источником и целью лежит блок во всю
       ширину дорожки, и любой прямой маршрут проходил бы сквозь него. */
    if (kind === 'around') {
      var Xl = Math.max(8, Math.min(a.x, b.x) - 30);
      return [{ x: a.x, y: a.y + a.h / 2 }, { x: Xl, y: a.y + a.h / 2 },
              { x: Xl, y: b.y + b.h / 2 }, { x: b.x, y: b.y + b.h / 2 }];
    }

    if (kind === 'side') {
      /* Входим ближе к верхней трети грани: по центру идёт подпись дорожки
         в левом жёлобе, и линия проходила бы прямо через неё. */
      var y = b.y + 9;   /* вище за підпис доріжки, що стоїть по центру рядка */
      var x0 = a.x + a.w / 2;
      var enterLeft = b.x + b.w / 2 > x0;
      var ex = enterLeft ? b.x : b.x + b.w;
      return [{ x: x0, y: a.y + a.h }, { x: x0, y: y }, { x: ex, y: y }];
    }

    var ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    var bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    var off = (lane % 3 - 1) * 7;

    if (kind === 'over') {
      var cy = corridorAbove(aEl);
      if (cy == null) cy = Math.min(a.y, b.y) - GAP / 2;
      cy += off;
      /* Входим в цель с той стороны, с которой пришли: если коридор ниже
         цели — снизу, если выше — сверху. */
      var below = cy > b.y + b.h;
      /* Входимо не по центру цілі, а зі свого боку (правіше, якщо прийшли справа):
         по центру вже входить інший зв'язок, і дві стрілки зливались в одну точку. */
      var ex = bc.x < ac.x ? b.x + b.w * 0.74 : b.x + b.w * 0.26;
      return [{ x: ac.x, y: cy < a.y ? a.y : a.y + a.h },
              { x: ac.x, y: cy },
              { x: ex, y: cy },
              { x: ex, y: below ? b.y + b.h : b.y }];
    }

    if (kind === 'v') {
      var down = bc.y > ac.y;
      var sy = down ? a.y + a.h : a.y;
      var ey = down ? b.y : b.y + b.h;
      /* Если блоки стоят друг под другом и перекрываются по горизонтали —
         прямая вертикаль. Зигзаг в узком зазоре читается как дефект. */
      var l = Math.max(a.x, b.x), r = Math.min(a.x + a.w, b.x + b.w);
      if (r - l > 24) {
        var x = (l + r) / 2 + off;
        return [{ x: x, y: sy }, { x: x, y: ey }];
      }
      var my = (sy + ey) / 2 + off;
      return [{ x: ac.x, y: sy }, { x: ac.x, y: my }, { x: bc.x, y: my }, { x: bc.x, y: ey }];
    }

    var right = bc.x > ac.x;
    var sx = right ? a.x + a.w : a.x;
    var ex = right ? b.x : b.x + b.w;
    /* Почти на одной высоте — ведём строго горизонтально по средней линии. */
    if (Math.abs(ac.y - bc.y) < 40) {
      var y = (ac.y + bc.y) / 2;
      return [{ x: sx, y: y }, { x: ex, y: y }];
    }
    var mx = (sx + ex) / 2 + off;
    return [{ x: sx, y: ac.y }, { x: mx, y: ac.y }, { x: mx, y: bc.y }, { x: ex, y: bc.y }];
  }

  function drawWires() {
    var svg = document.getElementById('wires');
    [].forEach.call(svg.querySelectorAll('path,polygon'), function (p) { p.remove(); });
    var base = fw.getBoundingClientRect();
    var k = scaleOf();
    svg.setAttribute('viewBox', '0 0 ' + fw.offsetWidth + ' ' + fw.offsetHeight);

    /* Веер з одного джерела йде однією шиною (lane 1 → зсув 0): рознесення на
       ±7 px давало три вертикалі, що перетинали одна одну і читались як три
       різні потоки. Різні коридори потрібні лише парі зустрічних зв'язків між
       гейтом і discovery — вони ділять один і той самий проміжок. */
    drawBus(svg, base, k);
    var lanes = {};
    links().forEach(function (L) {
      var a = document.getElementById(L[0]), b = document.getElementById(L[1]);
      if (!a || !b || !a.offsetParent || !b.offsetParent) return;
      var key = [L[0], L[1]].sort().join('|');
      lanes[key] = (lanes[key] || 0) + 1;
      lanes[L[0]] = L[0] === 'p-gate' ? 0 : L[0] === 'dc-rep' ? 2 : 1;
      var pts = trimEnd(route(boxOf(a, base, k), boxOf(b, base, k), L[2], lanes[L[0]], a), 13);
      var d = pathFrom(pts);
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'wire ' + L[3]);
      path.setAttribute('d', d);
      /* Кінці зв'язку в атрибутах — для скриптових перевірок перетинів:
         пари зі спільним джерелом чи ціллю (веер, шина) — не перетин, а T-вузол. */
      path.dataset.a = L[0]; path.dataset.b = L[1];
      svg.appendChild(path);
      head(svg, pts, L[3] === 'hand' || L[3] === 'disco' ? '#2E4460'
                   : L[3] === 'back' ? '#8A93A2' : '#5C6675', L[0], L[1]);
    });
  }

  /* ── фильтр по грейду ──────────────────────────────────────── */
  var FAMILY = { 'g-any': ['g-any', 'a-any'], 'g-senior': ['g-senior', 'a-senior'],
                 'g-po': ['g-po'], 'r-sales': ['r-sales'], 'r-tech': ['r-tech'] };

  function refilter() {
    var wrap = document.getElementById('fw-wrap');
    wrap.classList.toggle('filtered', !!state.grade);
    var fam = FAMILY[state.grade] || [];
    [].forEach.call(wrap.querySelectorAll('.cell'), function (c) {
      var exempt = c.classList.contains('plc');
      var hit = fam.some(function (g) { return c.classList.contains(g); });
      c.classList.toggle('match', !state.grade || exempt || hit);
    });
  }

  function redraw() {
    fw.dataset.discovery = state.discovery;
    renderProc();
    renderArtefacts();
    document.getElementById('ed-note').textContent = E[state.ed].note;
    refilter();
    /* Два кадра: в первом ещё не применён масштаб и не устоялись размеры,
       координаты стрелок брать рано — на первой отрисовке они выходили пустыми. */
    requestAnimationFrame(function () { requestAnimationFrame(function () { drawWires(); drawCycle(); }); });
  }

  /* ── управление ────────────────────────────────────────────── */
  function seg(id, items, key, after) {
    var host = document.getElementById(id);
    host.innerHTML = '';
    items.forEach(function (it) {
      var b = el('button', state[key] === it.id ? 'on' : '', it.t);
      b.type = 'button';
      b.onclick = function () {
        state[key] = it.id;
        [].forEach.call(host.children, function (x) { x.classList.toggle('on', x === b); });
        (after || redraw)();
      };
      host.appendChild(b);
    });
  }

  seg('ed-seg', [{ id: '6', t: 'PMBOK 6' }, { id: '8', t: 'PMBOK 8' }], 'ed');
  seg('fw-seg', I.approaches.map(function (a) { return { id: a.id, t: a.title }; }), 'fw',
      function () { redraw(); document.dispatchEvent(new CustomEvent('fw:approach')); });
  /* Перемикачі лише два: редакція PMBOK тут і підхід у самому блоці циклу.
     Discovery показано завжди, фільтра за власником немає — колір і так його показує. */

  /* ── вписування ────────────────────────────────────────────────
     Схема стоїть на сторінці без власного скролу й без зуму: полотно
     масштабується до ширини колонки, а висота обгортки дорівнює
     масштабованій висоті — прокручується лише сама сторінка. */
  var zoomStage = document.getElementById('zoomstage');
  var zoomWrap = document.getElementById('zoomwrap');
  function fit() {
    if (window.FW_NOFIT) return;   /* для перевірки: полотно 1:1, без вписування */
    zoomStage.style.transform = 'none';
    zoomWrap.scrollLeft = 0; zoomWrap.scrollTop = 0;   /* scrollIntoView зсуває навіть обрізану обгортку */
    var natural = zoomStage.scrollWidth, h = zoomStage.scrollHeight;
    var avail = zoomWrap.clientWidth;
    var k = Math.min(1, avail / natural);
    zoomStage.style.transform = 'scale(' + k + ')';
    zoomWrap.style.height = Math.ceil(h * k) + 'px';
  }
  function refit() {
    fit();
    requestAnimationFrame(function () { drawWires(); drawCycle(); });
  }

  renderPresale();
  redraw();
  var _redraw = redraw;
  redraw = function () { _redraw(); requestAnimationFrame(refit); };
  requestAnimationFrame(refit);
  addEventListener('resize', refit);
  addEventListener('load', refit);
  setTimeout(refit, 400);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);

  window.FW_INTERNAL = { state: state, redraw: function () { redraw(); }, renderIteration: renderIteration,
    drawWires: drawWires, drawCycle: drawCycle, refit: refit, scaleOf: scaleOf, approach: approach };
})();
