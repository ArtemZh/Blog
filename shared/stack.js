/* 14c — ті самі дані, що на 14a, але фази стоять стосом згори вниз:
 * Initiating → Planning → (Executing поруч із Monitoring & Controlling) → Closing.
 * Домени всередині фази йдуть колонками зліва направо.
 *
 * Розкладка двопрохідна: групи рендеряться природної висоти, вимірюються,
 * потім розставляються. Дроти рахуються після — тому розкриття картки їх
 * пересуває разом із картками. */
(function () {
  var M = window.PMBOK;
  var host = document.getElementById('ov');
  var svg = document.getElementById('ovwires');
  if (!M || !host) return;

  var CW = 250, GX = 34, PADX = 18, CAP = 46, BANDGAP = 66, TOP = 12, ROWPAD = 14;
  var domains = M.dom8, faNo = { I: 4, P: 5, E: 6, MC: 7, C: 8 };
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

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
  function domsIn(fa) { return domains.filter(function (d) { return items(d.id, fa).length; }); }

  function ioHtml(id) {
    var io = (window.PMBOK_IO || {})[id];
    if (!io) return '<div class="io"><span class="none">Inputs and outputs not extracted for this process yet.</span></div>';
    function col(t, arr) {
      return '<div><h4>' + t + '</h4><ul>' + arr.map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ul></div>';
    }
    return '<div class="io">' + col('Inputs', io.in) + col('Tools &amp; techniques', io.tt) + col('Outputs', io.out) + '</div>';
  }

  var groups = {}, openCard = null;
  function toggle(el, p) {
    if (el.classList.contains('open')) { el.classList.remove('open'); openCard = null; }
    else {
      if (openCard) openCard.classList.remove('open');
      el.classList.add('open'); openCard = el;
    }
    relayout(); selectFromCard(p);
  }
  function expandAll() {
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) { n.classList.add('open'); });
    openCard = null; relayout();
  }
  function collapseAll() {
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) { n.classList.remove('open'); });
    openCard = null; relayout();
  }

  function group(dom, fa, arr) {
    var g = document.createElement('div');
    g.className = 'grp' + (dom.id === 'gov' ? ' gov' : '');
    g.style.cssText = 'left:0;top:0;width:' + CW + 'px;border-color:' + dom.c;
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

  ['I', 'P', 'E', 'MC', 'C'].forEach(function (f) {
    domsIn(f).forEach(function (d) { group(d, f, items(d.id, f)); });
  });
  function H(g) { return g ? g.offsetHeight : 0; }

  /* Ширина смуг: третій ряд — Executing і M&C поруч, тому полотно рахується
     по ньому; решта смуг тягнеться на ту саму ширину. */
  function bandW(fa) { return domsIn(fa).length * CW + (domsIn(fa).length - 1) * GX + PADX * 2; }
  var rowW = bandW('E') + BANDGAP + bandW('MC');
  var STAGE = Math.max(rowW, bandW('I'), bandW('P'), bandW('C')) + PADX * 2;

  var regions = {};
  function region(id, t, sub) {
    var r = document.createElement('div'); r.className = 'region';
    r.innerHTML = '<div class="cap">' + t + (sub ? '<small>' + sub + '</small>' : '') + '</div>';
    host.appendChild(r); regions[id] = r; return r;
  }
  region('I', 'Initiating'); region('P', 'Planning');
  region('E', 'Executing', 'in parallel with'); region('MC', 'Monitoring and Controlling');
  region('C', 'Closing');

  function place(fa, x0, y0) {
    var ds = domsIn(fa), x = x0 + PADX, h = 0;
    ds.forEach(function (d) {
      var g = groups[d.id + fa];
      g.style.left = x + 'px'; g.style.top = (y0 + CAP) + 'px';
      h = Math.max(h, H(g)); x += CW + GX;
    });
    var w = bandW(fa), hh = CAP + h + ROWPAD;
    var r = regions[fa];
    r.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;width:' + w + 'px;height:' + hh + 'px';
    return { w: w, h: hh };
  }

  function relayout() {
    var y = TOP;
    /* Смуги вирівнюємо по лівому краю, а не по центру: тоді стовпчики карток
       у різних смугах збігаються, між ними лишаються наскрізні вертикальні
       коридори — і зв'язкам є де пройти. */
    var cx = function () { return 0; };
    y += place('I', cx('I'), y).h + BANDGAP;
    y += place('P', cx('P'), y).h + BANDGAP;
    var rowX = 0;
    var e = place('E', rowX, y);
    var mc = place('MC', rowX + e.w + BANDGAP, y);
    y += Math.max(e.h, mc.h) + BANDGAP;
    y += place('C', cx('C'), y).h;

    host.style.width = STAGE + 'px';
    host.style.height = (y + TOP) + 'px';
    [].forEach.call(host.querySelectorAll('.region'), function (r) { host.insertBefore(r, svg); });
    scheduleDraw();
  }

  /* ── дроти: той самий домен із фази у фазу ──────────────────────── */
  function box(el) { return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; }
  function wire(pts, dom, back, ai, bi) {
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x + ' ' + p.y; }).join(' ');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', 'w' + (dom === 'gov' ? ' gov' : '') + (back ? ' back' : ''));
    p.setAttribute('d', d);
    p.dataset.dom = dom; p.dataset.a = ai || ''; p.dataset.b = bi || ''; svg.appendChild(p);
    var n = pts.length, a = pts[n - 2], b = pts[n - 1];
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    var t = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    t.setAttribute('points', (b.x + ux * 8) + ',' + (b.y + uy * 8) + ' ' +
      (b.x - uy * 3.8) + ',' + (b.y + ux * 3.8) + ' ' + (b.x + uy * 3.8) + ',' + (b.y - ux * 3.8));
    t.setAttribute('fill', dom === 'gov' ? '#4B5563' : '#7E8797');
    t.dataset.dom = dom; t.dataset.a = ai || ''; t.dataset.b = bi || '';
    svg.appendChild(t);
  }
  /* Вертикальні переходи ведемо в проміжку між смугами — він завжди вільний. */
  function bandBottom(fa) {
    return [].reduce.call(host.querySelectorAll('.grp'), function (m, g) {
      return g.dataset.fa === fa ? Math.max(m, g.offsetTop + g.offsetHeight) : m;
    }, 0);
  }
  function bandTop(fa) {
    return [].reduce.call(host.querySelectorAll('.grp'), function (m, g) {
      return g.dataset.fa === fa ? Math.min(m, g.offsetTop) : m;
    }, 1e9);
  }
  function allGroups() {
    return [].map.call(host.querySelectorAll('.grp'), box);
  }
  function hitH(y, xa, xb, boxes) {
    var lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    return boxes.some(function (b) {
      return y > b.y - 4 && y < b.y + b.h + 4 && hi > b.x - 4 && lo < b.x + b.w + 4;
    });
  }
  function down(a, b, dom, lane) {
    var A = box(a), B = box(b);
    var x1 = A.x + CW / 2, x2 = B.x + CW / 2;
    if (Math.abs(x1 - x2) < 2) return wire([{ x: x1, y: A.y + A.h }, { x: x2, y: B.y - 11 }], dom);
    /* Горизонталь кладемо в проміжок МІЖ СМУГАМИ — між нижнім краєм усієї
       смуги-джерела і верхнім краєм смуги-цілі. Рахувати від власних груп не
       можна: коли сусідня група в тій самій смузі вища (а з розкритими
       картками так буває завжди), лінія пройшла б крізь неї. */
    var base = (bandBottom(a.dataset.fa) + bandTop(b.dataset.fa)) / 2,
        boxes = allGroups(), my = base;
    var tries = [(lane || 0) * 7, -(lane || 0) * 7, 0];
    for (var i = 0; i < tries.length; i++) {
      if (!hitH(base + tries[i], x1, x2, boxes)) { my = base + tries[i]; break; }
    }
    wire([{ x: x1, y: A.y + A.h }, { x: x1, y: my }, { x: x2, y: my }, { x: x2, y: B.y - 11 }], dom);
  }
  function across(a, b, dom) {
    /* Executing → M&C: обидві смуги в одному ряду, лінія йде проміжком між
       ними; якщо на її рівні стоїть чужа група — опускаємось під ряд. */
    var A = box(a), B = box(b), boxes = allGroups().filter(function (x) {
      return !(x.x === A.x && x.y === A.y) && !(x.x === B.x && x.y === B.y);
    });
    var y = Math.min(A.y, B.y) + 30;
    if (!hitH(y, A.x + A.w, B.x, boxes)) {
      return wire([{ x: A.x + A.w, y: y }, { x: B.x - 11, y: y }], dom);
    }
    /* Обхід ведемо нижче за ВЕСЬ ряд, а не лише за дві свої групи: інакше
       довга горизонталь пірнала під сусідню, вищу групу. */
    var gy = 22 + [].reduce.call(host.querySelectorAll('.grp'), function (m, g) {
      var f = g.dataset.fa;
      return (f === 'E' || f === 'MC') ? Math.max(m, g.offsetTop + g.offsetHeight) : m;
    }, 0);
    wire([{ x: A.x + A.w / 2, y: A.y + A.h }, { x: A.x + A.w / 2, y: gy },
          { x: B.x + CW / 2, y: gy }, { x: B.x + CW / 2, y: B.y + B.h + 11 }], dom);
  }
  /* Постійні дроти — це ВСІ зв'язки з links8, процес до процесу, а не лише
     перехід домену між фазами. Маршрут шукається по вільних коридорах між
     картками; якщо жоден варіант не проходить чисто, зв'язок не мовчить, а
     потрапляє в консольний звіт — краще знати про нього, ніж малювати лінію
     крізь чужу картку. */
  function cardBoxes() {
    return [].map.call(host.querySelectorAll('.pnode'), function (n) {
      var b = { x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight, el: n };
      /* .pnode лежить усередині .grp, тому зводимо до координат полотна */
      var par = n.offsetParent;
      while (par && par !== host) { b.x += par.offsetLeft; b.y += par.offsetTop; par = par.offsetParent; }
      return b;
    });
  }
  function route(A, B, obst, xl, yl) {
    var ac = { x: A.x + A.w / 2, y: A.y + A.h / 2 }, bc = { x: B.x + B.w / 2, y: B.y + B.h / 2 };
    /* Середні ділянки не мають перетинати навіть власні картки: маршрут, що
       виходить збоку і вертається, інакше проходив крізь картку-джерело. */
    function ok(pts) { return clearPts(pts, obst, [A, B]) ? pts : null; }
    /* 1. один стовпчик — пряма вертикаль */
    if (Math.abs(ac.x - bc.x) < 3) {
      var v = ok([{ x: ac.x, y: bc.y > ac.y ? A.y + A.h : A.y },
                  { x: ac.x, y: bc.y > ac.y ? B.y - 9 : B.y + B.h + 9 }]);
      if (v) return v;
    }
    var mid = { x: (ac.x + bc.x) / 2, y: (ac.y + bc.y) / 2 };
    /* 2. через вільну горизонталь */
    var byY = yl.slice().sort(function (u, v2) { return Math.abs(u - mid.y) - Math.abs(v2 - mid.y); });
    for (var j = 0; j < byY.length; j++) {
      var r = byY[j];
      var y1 = r > ac.y ? A.y + A.h : A.y, y2 = r > bc.y ? B.y + B.h + 9 : B.y - 9;
      var c = ok([{ x: ac.x, y: y1 }, { x: ac.x, y: r }, { x: bc.x, y: r }, { x: bc.x, y: y2 }]);
      if (c) return c;
    }
    /* 3. через вільну вертикаль */
    var byX = xl.slice().sort(function (u, v2) { return Math.abs(u - mid.x) - Math.abs(v2 - mid.x); });
    for (var i = 0; i < byX.length; i++) {
      var cx2 = byX[i];
      var x1 = cx2 > ac.x ? A.x + A.w : A.x, x2 = cx2 > bc.x ? B.x + B.w + 9 : B.x - 9;
      var c2 = ok([{ x: x1, y: ac.y }, { x: cx2, y: ac.y }, { x: cx2, y: bc.y }, { x: x2, y: bc.y }]);
      if (c2) return c2;
    }
    /* 4. обхід: вертикаль → горизонталь → вертикаль (п'ять ділянок) */
    for (var m = 0; m < byX.length; m++) {
      for (var k = 0; k < byY.length; k++) {
        var gx = byX[m], gy = byY[k];
        var y0 = gy > ac.y ? A.y + A.h : A.y, y3 = gy > bc.y ? B.y + B.h + 9 : B.y - 9;
        var c3 = ok([{ x: ac.x, y: y0 }, { x: ac.x, y: gy }, { x: gx, y: gy },
                     { x: bc.x, y: gy }, { x: bc.x, y: y3 }]);
        if (c3) return c3;
      }
    }
    /* 5. вихід низом, обхід смуги і вхід у картку ЗБОКУ: у стовпчику під
       карткою-ціллю стоять її сусіди, тому знизу в неї не зайти. */
    for (var q = 0; q < byY.length; q++) {
      for (var w2 = 0; w2 < byX.length; w2++) {
        var gy2 = byY[q], gx2 = byX[w2];
        var yy = gy2 > ac.y ? A.y + A.h : A.y;
        var xx = gx2 > bc.x ? B.x + B.w + 9 : B.x - 9;
        var c4 = ok([{ x: ac.x, y: yy }, { x: ac.x, y: gy2 }, { x: gx2, y: gy2 },
                     { x: gx2, y: bc.y }, { x: xx, y: bc.y }]);
        if (c4) return c4;
      }
    }
    /* 6. збоку → коридором → збоку: остання спроба для карток, у яких і
       зверху, і знизу стоять сусіди по стовпчику. */
    for (var e1 = 0; e1 < byX.length; e1++) {
      for (var e2 = 0; e2 < byX.length; e2++) {
        for (var e3 = 0; e3 < byY.length; e3++) {
          var g1 = byX[e1], g2 = byX[e2], gy3 = byY[e3];
          var sx = g1 > ac.x ? A.x + A.w : A.x;
          var tx = g2 > bc.x ? B.x + B.w + 9 : B.x - 9;
          var c5 = ok([{ x: sx, y: ac.y }, { x: g1, y: ac.y }, { x: g1, y: gy3 },
                       { x: g2, y: gy3 }, { x: g2, y: bc.y }, { x: tx, y: bc.y }]);
          if (c5) return c5;
        }
      }
    }
    return null;
  }
  /* Кілька зв'язків, що виходять з однієї картки або йдуть одним коридором,
     лягають на ту саму пряму і зливаються в одну лінію — на око їх не
     розрізнити. Тому кожну середню ділянку зсуваємо на власну доріжку:
     беремо перший зсув, який і не збігається з уже зайнятими, і не заводить
     дріт у картку. */
  var segs = [];
  function conflict(ax, c, a, b) {
    return segs.some(function (s2) {
      return s2.ax === ax && Math.abs(s2.c - c) < 5 &&
             Math.max(a, b) > Math.min(s2.a, s2.b) + 4 &&
             Math.min(a, b) < Math.max(s2.a, s2.b) - 4;
    });
  }
  function remember(pts) {
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (Math.abs(a.y - b.y) < 1) segs.push({ ax: 'h', c: a.y, a: a.x, b: b.x });
      else if (Math.abs(a.x - b.x) < 1) segs.push({ ax: 'v', c: a.x, a: a.y, b: b.y });
    }
  }
  /* Крайні ділянки впираються у власні картки, тому їх перевіряємо лише на
     чужі; середні — на всі, включно зі своїми двома: після зсуву доріжки
     ділянка інакше могла перетнути власну картку-джерело. */
  function clearPts(pts, obst, own) {
    for (var i = 1; i < pts.length; i++) {
      var edge = (i === 1 || i === pts.length - 1);
      if (hits(pts[i - 1], pts[i], edge ? obst : obst.concat(own || []))) return false;
    }
    return true;
  }
  function separate(pts, obst, own) {
    /* Крайні ділянки чіпати не можна — вони впираються в картку. */
    for (var i = 1; i < pts.length - 1; i++) {
      var a = pts[i - 1], b = pts[i], horiz = Math.abs(a.y - b.y) < 1;
      var c = horiz ? a.y : a.x;
      if (!conflict(horiz ? 'h' : 'v', c, horiz ? a.x : a.y, horiz ? b.x : b.y)) continue;
      for (var k = 1; k <= 8; k++) {
        for (var sgn = 1; sgn >= -1; sgn -= 2) {
          var d = sgn * k * 6, trial = pts.map(function (q) { return { x: q.x, y: q.y }; });
          if (horiz) { trial[i - 1].y += d; trial[i].y += d; }
          else { trial[i - 1].x += d; trial[i].x += d; }
          if (!clearPts(trial, obst, own)) continue;
          if (conflict(horiz ? 'h' : 'v', c + d,
                horiz ? trial[i - 1].x : trial[i - 1].y,
                horiz ? trial[i].x : trial[i].y)) continue;
          pts = trial; k = 99; break;
        }
      }
    }
    return pts;
  }

  function draw() {
    segs = [];
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 ' + host.offsetWidth + ' ' + host.offsetHeight);
    var all = cardBoxes(), byCard = {};
    all.forEach(function (b) { byCard[b.el.id.replace(/^p-/, '')] = b; });
    /* До коридорів між картками додаємо завідомо вільні: проміжки між смугами
       і поля обабіч полотна. Саме ними йдуть зв'язки всередині однієї смуги,
       де між колонками карток вільного рядка немає. */
    var xl = lanes(all, 'x'), yl = lanes(all, 'y'), missed = [];
    ['I', 'P', 'E', 'MC', 'C'].forEach(function (f) {
      var t = bandTop(f), b = bandBottom(f);
      if (t < 1e8) { yl.push(t - BANDGAP / 2); yl.push(b + BANDGAP / 2); }
    });
    xl.push(10); xl.push(host.offsetWidth - 10);
    (M.links8 || []).forEach(function (L) {
      var ai = slug(L[0]), bi = slug(L[1]);
      var A = byCard[ai], B = byCard[bi];
      if (!A || !B) { missed.push(L[0] + ' → ' + L[1] + ' (no card)'); return; }
      var obst = all.filter(function (x) { return x !== A && x !== B; });
      var pts = route(A, B, obst, xl, yl);
      if (!pts) { missed.push(L[0] + ' → ' + L[1] + ' (no clear route)'); return; }
      /* Зсув доріжки міг завести крайню ділянку у власну картку — крайні
         ділянки під час зсуву не перевіряються, бо вони в неї впираються.
         Тому наприкінці перевіряємо весь маршрут по стиснутих на 2px власних
         картках: дотик до краю це пропускає, прохід крізь — ні. */
      var moved = separate(pts, obst, [A, B]);
      var shrunk = [A, B].map(function (b) {
        return { x: b.x + 2, y: b.y + 2, w: b.w - 4, h: b.h - 4 };
      });
      var bad = false;
      for (var q2 = 1; q2 < moved.length; q2++) {
        if (hits(moved[q2 - 1], moved[q2], shrunk)) { bad = true; break; }
      }
      pts = bad ? pts : moved;
      remember(pts);
      var dom = (list.filter(function (p) { return p.id === ai; })[0] || {}).dom;
      wire(pts, dom ? dom.id : 'gov', L[2] === 'back', ai, bi);
    });
    drawn = (M.links8 || []).length - missed.length;
    if (missed.length) console.warn('14c: links not drawn', missed);
    window.STACK_REPORT = { total: (M.links8 || []).length, drawn: drawn, missed: missed };
  }
  var drawn = 0;

  /* ── виділення: те саме, що на 14a ──────────────────────────────── */
  function absBox(el) {
    var r = el.getBoundingClientRect(), h = host.getBoundingClientRect();
    var k = (function () { var m = (host.style.transform || '').match(/scale\(([\d.]+)\)/); return m ? +m[1] : 1; })();
    return { x: (r.left - h.left) / k, y: (r.top - h.top) / k, w: r.width / k, h: r.height / k };
  }
  function dropTmp() {
    [].forEach.call(svg.querySelectorAll('.tmp'), function (n) { n.parentNode.removeChild(n); });
  }
  function hits(p1, p2, boxes) {
    var x0 = Math.min(p1.x, p2.x), x1 = Math.max(p1.x, p2.x);
    var y0 = Math.min(p1.y, p2.y), y1 = Math.max(p1.y, p2.y);
    return boxes.some(function (b) {
      return x1 > b.x + 1 && x0 < b.x + b.w - 1 && y1 > b.y + 1 && y0 < b.y + b.h - 1;
    });
  }
  function lanes(boxes, axis) {
    var iv = boxes.map(function (b) {
      return axis === 'x' ? [b.x - 7, b.x + b.w + 7] : [b.y - 6, b.y + b.h + 6];
    }).sort(function (u, v) { return u[0] - v[0]; });
    var merged = [], cur = null;
    iv.forEach(function (r) {
      if (!cur || r[0] > cur[1]) { cur = r.slice(); merged.push(cur); } else cur[1] = Math.max(cur[1], r[1]);
    });
    var out = [];
    for (var i = 1; i < merged.length; i++) out.push((merged[i - 1][1] + merged[i][0]) / 2);
    if (merged.length) { out.push(merged[0][0] - 10); out.push(merged[merged.length - 1][1] + 10); }
    return out;
  }
  var lastCard = null, sel = null;
  function selectFromCard(p) {
    sel = 'card:' + p.id; lastCard = p;
    host.classList.add('is-hot');
    /* Два кольори: що входить у картку (джерела — teal) і що з неї виходить
       (цілі — clay). Група домену більше не підсвічується цілком — лише
       картки, з якими справді є зв'язок. */
    var src = {}, dst = {};
    (M.links8 || []).forEach(function (L) {
      var a = slug(L[0]), b = slug(L[1]);
      if (a === p.id) dst[b] = 1;
      if (b === p.id) src[a] = 1;
    });
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) {
      var id = n.id.replace(/^p-/, '');
      n.classList.toggle('hot', id === p.id);
      n.classList.toggle('near', !!(src[id] || dst[id]));
      n.classList.toggle('in', !!src[id]);
      n.classList.toggle('out', !!dst[id] && !src[id]);
    });
    [].forEach.call(host.querySelectorAll('.grp'), function (g) { g.classList.remove('hot'); });
    [].forEach.call(svg.querySelectorAll('path,polygon'), function (w) {
      var isIn = w.dataset.b === p.id, isOut = w.dataset.a === p.id;
      w.classList.toggle('hot', isIn || isOut);
      w.classList.toggle('in', isIn);
      w.classList.toggle('out', isOut && !isIn);
    });
  }
  function select(id) {
    if (sel === id) { clear(); return; }
    sel = id; lastCard = null; host.classList.add('is-hot'); dropTmp();
    [].forEach.call(host.querySelectorAll('.grp'), function (g) { g.classList.toggle('hot', g.dataset.dom === id); });
    [].forEach.call(svg.querySelectorAll('path,polygon'), function (w) { w.classList.toggle('hot', w.dataset.dom === id); });
  }
  function clear() {
    sel = null; lastCard = null; host.classList.remove('is-hot'); dropTmp();
    [].forEach.call(host.querySelectorAll('.hot, .near'), function (n) { n.classList.remove('hot', 'near', 'in', 'out'); });
    [].forEach.call(svg.querySelectorAll('.hot'), function (n) { n.classList.remove('hot', 'in', 'out'); });
  }
  document.addEventListener('click', clear);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') clear(); });

  var drawTimer = null;
  function scheduleDraw() {
    clearTimeout(drawTimer);
    drawTimer = setTimeout(function () {
      draw();
      if (lastCard) selectFromCard(lastCard);
      if (window.__stZoom) window.__stZoom();
    }, 60);
  }

  var xa = document.getElementById('btn-expand'), xc = document.getElementById('btn-collapse');
  if (xa) xa.onclick = function (e) { e.stopPropagation(); expandAll(); };
  if (xc) xc.onclick = function (e) { e.stopPropagation(); collapseAll(); clear(); };

  relayout();
  draw();
  var fit = document.getElementById('fit');
  var Z = window.Zoom(fit, host, function (k) { fit.style.height = Math.min(host.offsetHeight * k, innerHeight * 0.9) + 'px'; });
  window.__stZoom = function () { Z.set(Z.get()); fit.style.height = Math.min(host.offsetHeight * Z.get(), innerHeight * 0.9) + 'px'; };
  Z.fit(); window.__stZoom();
  addEventListener('resize', function () { Z.fit(); window.__stZoom(); });
  window.STACK = { groups: groups, regions: regions, list: list, svg: svg, host: host };
})();
