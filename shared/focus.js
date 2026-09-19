/* 14d — фази колонками зліва направо: Initiating · Planning · Executing ·
 * Monitoring and Controlling · Closing. Домени в колонці — групи одна під
 * одною, картки в групі стовпчиком.
 *
 * Два режими фокуса:
 *   картка — клік по картці: все незв'язане гасне, джерела збираються ЛІВОРУЧ
 *            від неї, цілі ПРАВОРУЧ, а сама картка не рушає з місця;
 *   домен  — клік по кнопці домену зліва: чужі домени гаснуть, картки домену
 *            вишиковуються в одну смугу зліва направо по фазах.
 *
 * Анімація: спершу гасне зайве (350 мс), потім їде решта (700 мс). Дроти на
 * час переїзду ховаються і малюються один раз наприкінці.
 */
(function () {
  var M = window.PMBOK;
  var host = document.getElementById('ov');
  var svg = document.getElementById('ovwires');
  if (!M || !host) return;

  var CW = 250, PADX = 14, CAP = 72, COLGAP = 44, TOP = 12, ROWPAD = 14, GRPGAP = 10;
  var PANW = 118, PANGAP = 28, EMGAP = 28;   /* колонка доменів, її відступ, зазор E↔MC */
  var FADE = 350, MOVE = 700;          /* мс, збігається з CSS */
  var GAP_MIN = 14, GAP_SIDE = 56;     /* між зібраними картками / до вибраної */
  var domains = M.dom8, faNo = { I: 4, P: 5, E: 6, MC: 7, C: 8 };
  var FAS = ['I', 'P', 'E', 'MC', 'C'];
  var FAT = { I: 'Initiating', P: 'Planning', E: 'Executing',
              MC: 'Monitoring and Controlling', C: 'Closing' };
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  var list = [], counter = {}, byId = {};
  FAS.forEach(function (f) {
    domains.forEach(function (d) {
      M.p8.filter(function (p) { return p[1] === d.id && p[2] === f; }).forEach(function (p) {
        counter[f] = (counter[f] || 0) + 1;
        var o = { id: slug(p[0]), name: p[0], dom: d, fa: f, num: faNo[f] + '.' + counter[f] };
        list.push(o); byId[o.id] = o;
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

  /* ── побудова ─────────────────────────────────────────────────────── */
  var groups = {}, cards = {};
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
      /* Підпис домену над карткою: у повній розкладці його дає підпис групи,
         у фокусі картка від групи від'їжджає — тоді працює цей. */
      d.innerHTML = '<span class="fgl" style="color:' + dom.c + '">' + dom.t + '</span>' +
        '<button type="button" class="iobtn" tabindex="0" aria-expanded="false" ' +
        'aria-label="Inputs and outputs of ' + p.name + '">+</button>' +
        '<span class="num">' + p.num + '</span><span class="nm">' + p.name + '</span>' + ioHtml(p.id);
      d.tabIndex = 0; d.setAttribute('role', 'button');
      d.setAttribute('aria-label', p.num + ' ' + p.name);
      d.onclick = function (e) { e.stopPropagation(); hitCard(p); };
      d.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); hitCard(p); }
        if (e.key === 'Escape') { reset(); }
      };
      /* Клік по картці — тільки фокус. Входи/виходи має власна кнопка «+»:
         інакше одна дія означала б дві різні речі. */
      var b = d.querySelector('.iobtn');
      b.onclick = function (e) { e.stopPropagation(); toggleIO(d); };
      b.onkeydown = function (e) { e.stopPropagation(); if (e.key === 'Escape') reset(); };
      g.appendChild(d);
      cards[p.id] = d;
    });
    host.appendChild(g);
    groups[dom.id + fa] = g;
  }
  FAS.forEach(function (f) { domsIn(f).forEach(function (d) { group(d, f, items(d.id, f)); }); });

  var regions = {}, pcaps = {}, dpanels = {};
  /* Колонка «Performance Domain» ліворуч: кольорова плашка на кожен домен,
     заввишки з рядок цього домену — як на карті 14a. */
  domains.forEach(function (d) {
    var b = document.createElement('div'); b.className = 'dpanel';
    b.style.background = d.c; b.textContent = d.t; b.dataset.dom = d.id;
    b.onclick = function (e) {
      e.stopPropagation();
      if (busy) return;
      if (mode === 'domain' && curId === d.id) reset(); else focusDomain(d.id);
    };
    host.appendChild(b); dpanels[d.id] = b;
  });
  var emcap = document.createElement('div'); emcap.className = 'pcap pcap-em';
  emcap.innerHTML = 'Executing&nbsp;&nbsp;·&nbsp;&nbsp;Monitoring and Controlling<small>run in parallel</small>';
  host.appendChild(emcap);
  var pancap = document.createElement('div'); pancap.className = 'pcap pcap-pan'; pancap.textContent = 'Performance Domain';
  host.appendChild(pancap);
  FAS.forEach(function (f) {
    var r = document.createElement('div'); r.className = 'region';
    r.innerHTML = '<div class="cap">' + FAT[f] +
      (f === 'E' ? '<small>in parallel with M&amp;C</small>' :
       f === 'MC' ? '<small>in parallel with Executing</small>' : '') + '</div>';
    host.appendChild(r); regions[f] = r;
    /* Підпис фази живе окремо від плашки-області: у фокусі плашки гаснуть, а
       рядок назв фаз лишається віссю читання в усіх режимах. */
    var c = document.createElement('div'); c.className = 'pcap'; c.textContent = FAT[f];
    host.appendChild(c); pcaps[f] = c;
  });

  /* ── повна розкладка ──────────────────────────────────────────────── */
  function H(g) { return g ? g.offsetHeight : 0; }
  var colX = {}, STAGE_W = 0, STAGE_H = 0;
  /* Сітка: рядок — домен (спільна висота в усіх фазах), колонка — фаза.
     Executing і M&C стоять поруч під одним заголовком. Так зв'язки між фазами
     одного домену йдуть по прямій, і згорнута схема читається як таблиця. */
  var rowY = {}, rowH = {};
  function relayout() {
    var x = TOP + PANW + PANGAP;
    FAS.forEach(function (f) { colX[f] = x; x += CW + PADX * 2 + (f === 'E' ? EMGAP : COLGAP); });
    STAGE_W = x - COLGAP + TOP;
    var y = TOP + CAP + 16;
    domains.forEach(function (d) {
      var h = 0;
      FAS.forEach(function (f) { h = Math.max(h, H(groups[d.id + f])); });
      rowY[d.id] = y; rowH[d.id] = h;
      FAS.forEach(function (f) {
        var g = groups[d.id + f]; if (!g) return;
        g.style.left = (colX[f] + PADX) + 'px'; g.style.top = y + 'px';
      });
      var pnl = dpanels[d.id];
      pnl.style.cssText = 'left:' + TOP + 'px;top:' + y + 'px;width:' + PANW + 'px;height:' + h + 'px;background:' + d.c;
      y += h + GRPGAP;
    });
    STAGE_H = y - GRPGAP + TOP + ROWPAD;
    FAS.forEach(function (f) {
      regions[f].style.cssText = 'left:' + colX[f] + 'px;top:' + TOP + 'px;width:' + (CW + PADX * 2) + 'px;height:' + (STAGE_H - TOP * 2) + 'px';
    });
    host.style.width = STAGE_W + 'px';
    host.style.height = STAGE_H + 'px';
    [].forEach.call(host.querySelectorAll('.region'), function (r) { host.insertBefore(r, svg); });
    showCaps();
  }

  /* ── геометрія ────────────────────────────────────────────────────── */
  function cardBoxes(only) {
    var out = [];
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) {
      if (only && !only(n)) return;
      var b = { x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight, el: n };
      var par = n.offsetParent;
      while (par && par !== host) { b.x += par.offsetLeft; b.y += par.offsetTop; par = par.offsetParent; }
      out.push(b);
    });
    return out;
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

  /* ── роутер ───────────────────────────────────────────────────────── */
  function clearPts(pts, obst, own) {
    for (var i = 1; i < pts.length; i++) {
      var edge = (i === 1 || i === pts.length - 1);
      if (hits(pts[i - 1], pts[i], edge ? obst : obst.concat(own || []))) return false;
    }
    return true;
  }
  function route(A, B, obst, xl, yl) {
    var ac = { x: A.x + A.w / 2, y: A.y + A.h / 2 }, bc = { x: B.x + B.w / 2, y: B.y + B.h / 2 };
    function ok(pts) { return clearPts(pts, obst, [A, B]) ? pts : null; }
    if (Math.abs(ac.y - bc.y) < 3) {
      var hgo = ok([{ x: bc.x > ac.x ? A.x + A.w : A.x, y: ac.y },
                    { x: bc.x > ac.x ? B.x - 9 : B.x + B.w + 9, y: ac.y }]);
      if (hgo) return hgo;
    }
    if (Math.abs(ac.x - bc.x) < 3) {
      var v = ok([{ x: ac.x, y: bc.y > ac.y ? A.y + A.h : A.y },
                  { x: ac.x, y: bc.y > ac.y ? B.y - 9 : B.y + B.h + 9 }]);
      if (v) return v;
    }
    var mid = { x: (ac.x + bc.x) / 2, y: (ac.y + bc.y) / 2 };
    var byX = xl.slice().sort(function (u, v2) { return Math.abs(u - mid.x) - Math.abs(v2 - mid.x); });
    var byY = yl.slice().sort(function (u, v2) { return Math.abs(u - mid.y) - Math.abs(v2 - mid.y); });
    for (var i = 0; i < byX.length; i++) {
      var cx2 = byX[i];
      var x1 = cx2 > ac.x ? A.x + A.w : A.x, x2 = cx2 > bc.x ? B.x + B.w + 9 : B.x - 9;
      var c2 = ok([{ x: x1, y: ac.y }, { x: cx2, y: ac.y }, { x: cx2, y: bc.y }, { x: x2, y: bc.y }]);
      if (c2) return c2;
    }
    for (var j = 0; j < byY.length; j++) {
      var r = byY[j];
      var y1 = r > ac.y ? A.y + A.h : A.y, y2 = r > bc.y ? B.y + B.h + 9 : B.y - 9;
      var c = ok([{ x: ac.x, y: y1 }, { x: ac.x, y: r }, { x: bc.x, y: r }, { x: bc.x, y: y2 }]);
      if (c) return c;
    }
    for (var e1 = 0; e1 < byX.length; e1++) {
      for (var e3 = 0; e3 < byY.length; e3++) {
        for (var e2 = 0; e2 < byX.length; e2++) {
          var g1 = byX[e1], g2 = byX[e2], gy3 = byY[e3];
          var sx = g1 > ac.x ? A.x + A.w : A.x;
          var tx = g2 > bc.x ? B.x + B.w + 9 : B.x - 9;
          var c5 = ok([{ x: sx, y: ac.y }, { x: g1, y: ac.y }, { x: g1, y: gy3 },
                       { x: g2, y: gy3 }, { x: g2, y: bc.y }, { x: tx, y: bc.y }]);
          if (c5) return c5;
        }
      }
    }
    for (var m = 0; m < byX.length; m++) {
      for (var k = 0; k < byY.length; k++) {
        var gx = byX[m], gy = byY[k];
        var y0 = gy > ac.y ? A.y + A.h : A.y, y3 = gy > bc.y ? B.y + B.h + 9 : B.y - 9;
        var c3 = ok([{ x: ac.x, y: y0 }, { x: ac.x, y: gy }, { x: gx, y: gy },
                     { x: bc.x, y: gy }, { x: bc.x, y: y3 }]);
        if (c3) return c3;
      }
    }
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
    return null;
  }

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
  function onEdge(p, b) {
    if (!b) return true;
    var m = 3;
    return p.x >= b.x - 12 && p.x <= b.x + b.w + 12 && p.y >= b.y + m && p.y <= b.y + b.h - m ||
           p.y >= b.y - 12 && p.y <= b.y + b.h + 12 && p.x >= b.x + m && p.x <= b.x + b.w - m;
  }
  function separate(pts, obst, own) {
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
          /* зсув не має відривати кінець лінії від картки: початок і кінець
             лишаються в межах свого боку блоку — інакше лінія «висить у повітрі» */
          if (own && !onEdge(trial[0], own[0]) || own && !onEdge(trial[trial.length - 1], own[1])) continue;
          if (conflict(horiz ? 'h' : 'v', c + d,
                horiz ? trial[i - 1].x : trial[i - 1].y,
                horiz ? trial[i].x : trial[i].y)) continue;
          pts = trial; k = 99; break;
        }
      }
    }
    return pts;
  }

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

  /* ── стан ─────────────────────────────────────────────────────────── */
  var mode = null, curId = null, busy = false, homeBox = {};

  function visible(n) { return !n.classList.contains('gone'); }
  function linksFor() {
    var all = M.links8 || [];
    if (mode === 'card') return all.filter(function (L) { return slug(L[0]) === curId || slug(L[1]) === curId; });
    if (mode === 'domain') {
      return all.filter(function (L) {
        var a = byId[slug(L[0])], b = byId[slug(L[1])];
        return a && b && a.dom.id === curId && b.dom.id === curId;
      });
    }
    return all;
  }
  /* Згорнута схема: не всі 248 зв'язків, а один дріт на пару груп —
     у межах домену між сусідніми фазами, плюс виходи з Initiating (там лише
     дві картки, і обидві відкривають планування). Повний перелік по картках
     показує фокус. */
  function groupLinks() {
    var seen = {}, out = [], ord = { I: 0, P: 1, E: 2, MC: 3, C: 4 };
    (M.links8 || []).forEach(function (L) {
      var a = byId[slug(L[0])], b = byId[slug(L[1])];
      if (!a || !b) return;
      var sameDom = a.dom.id === b.dom.id, fromInit = a.fa === 'I';
      if (!(sameDom || fromInit)) return;
      if (ord[b.fa] <= ord[a.fa] && !(a.fa === 'E' && b.fa === 'MC')) return;
      if (sameDom && ord[b.fa] - ord[a.fa] > 1 && !(a.fa === 'P' && b.fa === 'MC')) return;
      var ka = a.dom.id + a.fa, kb = b.dom.id + b.fa, key = ka + '>' + kb;
      if (ka === kb || seen[key]) return;
      seen[key] = 1; out.push({ a: ka, b: kb, dom: a.dom.id });
    });
    return out;
  }
  function groupBoxes() {
    return Object.keys(groups).map(function (k) {
      var g = groups[k];
      return { x: g.offsetLeft, y: g.offsetTop, w: g.offsetWidth, h: g.offsetHeight, el: g, key: k };
    });
  }
  function drawCollapsed() {
    var all = groupBoxes(), byKey = {};
    all.forEach(function (b) { byKey[b.key] = b; });
    var xl = lanes(all, 'x'), yl = lanes(all, 'y'), missed = [], drawn = 0;
    xl.push(10); xl.push(host.offsetWidth - 10); yl.push(10); yl.push(host.offsetHeight - 10);
    var links = groupLinks();
    links.forEach(function (L) {
      var A = byKey[L.a], B = byKey[L.b];
      if (!A || !B) { missed.push(L.a + ' → ' + L.b); return; }
      var obst = all.filter(function (x) { return x !== A && x !== B; });
      var pts = route(A, B, obst, xl, yl);
      if (!pts) { missed.push(L.a + ' → ' + L.b + ' (no clear route)'); return; }
      pts = separate(pts, obst, [A, B]);
      remember(pts); drawn++;
      wire(pts, L.dom, false, 'g:' + L.a, 'g:' + L.b);
    });
    if (missed.length) console.warn('14d: group links not drawn', missed);
    window.FOCUS_REPORT = { mode: 'full', total: links.length, drawn: drawn, missed: missed };
    return window.FOCUS_REPORT;
  }
  function draw() {
    segs = [];
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 ' + host.offsetWidth + ' ' + host.offsetHeight);
    if (!mode) return drawCollapsed();
    var all = cardBoxes(mode ? visible : null), byCard = {};
    all.forEach(function (b) { byCard[b.el.id.replace(/^p-/, '')] = b; });
    var xl = lanes(all, 'x'), yl = lanes(all, 'y'), missed = [], drawn = 0;
    xl.push(10); xl.push(host.offsetWidth - 10);
    yl.push(10); yl.push(host.offsetHeight - 10);
    var links = linksFor();
    links.forEach(function (L) {
      var ai = slug(L[0]), bi = slug(L[1]);
      var A = byCard[ai], B = byCard[bi];
      if (!A || !B) { missed.push(L[0] + ' → ' + L[1] + ' (no card)'); return; }
      var obst = all.filter(function (x) { return x !== A && x !== B; });
      var pts = route(A, B, obst, xl, yl);
      if (!pts) { missed.push(L[0] + ' → ' + L[1] + ' (no clear route)'); return; }
      var moved = separate(pts, obst, [A, B]);
      var shrunk = [A, B].map(function (b) { return { x: b.x + 2, y: b.y + 2, w: b.w - 4, h: b.h - 4 }; });
      var bad = false;
      for (var q2 = 1; q2 < moved.length; q2++) if (hits(moved[q2 - 1], moved[q2], shrunk)) { bad = true; break; }
      pts = bad ? pts : moved;
      remember(pts); drawn++;
      var o = byId[ai];
      wire(pts, o ? o.dom.id : 'gov', L[2] === 'back', ai, bi);
    });
    if (missed.length) console.warn('14d: links not drawn', missed);
    window.FOCUS_REPORT = { mode: mode ? mode + ':' + curId : 'full',
      total: links.length, drawn: drawn, missed: missed };
    return window.FOCUS_REPORT;
  }

  /* check(): семплимо кожен шлях і дивимось, чи не проходить він крізь видиму
     картку. І шляхи, і картки — у координатах полотна, тому масштаб зуму сюди
     не входить; там, де беремо екранні прямокутники, ділимо на нього. */
  function zoomK() {
    var m = (host.style.transform || '').match(/scale\(([\d.]+)\)/); return m ? +m[1] : 1;
  }
  function check() {
    var k = zoomK(), hb = host.getBoundingClientRect();
    var boxes = cardBoxes(mode ? visible : null).map(function (b) {
      var r = b.el.getBoundingClientRect();
      /* Контроль: та сама коробка, порахована з екрана й поділена на зум,
         має збігтися з розкладковою — інакше зсув зумом лишився б непоміченим. */
      b.sx = (r.left - hb.left) / k; b.sy = (r.top - hb.top) / k;
      return b;
    });
    var bad = [], off = 0;
    boxes.forEach(function (b) { off = Math.max(off, Math.abs(b.sx - b.x), Math.abs(b.sy - b.y)); });
    [].forEach.call(svg.querySelectorAll('path'), function (p) {
      var pts = (p.getAttribute('d') || '').trim().split(/(?=[ML])/).map(function (s) {
        var m = s.trim().slice(1).trim().split(/\s+/); return { x: +m[0], y: +m[1] };
      });
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(L / 4);
        for (var s2 = 0; s2 <= n; s2++) {
          var x = a.x + (b.x - a.x) * s2 / n, y = a.y + (b.y - a.y) * s2 / n;
          var inside = boxes.some(function (bx) {
            return x > bx.x + 2 && x < bx.x + bx.w - 2 && y > bx.y + 2 && y < bx.y + bx.h - 2;
          });
          if (inside) { bad.push({ a: p.dataset.a, b: p.dataset.b, x: x, y: y }); return; }
        }
      }
    });
    return { wires: svg.querySelectorAll('path').length, under: bad.length,
      drift: Math.round(off * 10) / 10, bad: bad.slice(0, 10) };
  }

  /* ── підсвітка ────────────────────────────────────────────────────── */
  function neighbours(id) {
    var src = {}, dst = {};
    (M.links8 || []).forEach(function (L) {
      var a = slug(L[0]), b = slug(L[1]);
      if (a === id) dst[b] = 1;
      if (b === id) src[a] = 1;
    });
    return { src: src, dst: dst };
  }
  function highlight(id) {
    var nb = neighbours(id);
    host.classList.add('is-hot');
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) {
      var i = n.id.replace(/^p-/, '');
      n.classList.toggle('hot', i === id);
      n.classList.toggle('near', !!(nb.src[i] || nb.dst[i]));
      n.classList.toggle('in', !!nb.src[i]);
      n.classList.toggle('out', !!nb.dst[i] && !nb.src[i]);
      /* Двосторонній зв'язок: контур teal, а праворуч — clay-крапка. */
      n.classList.toggle('both', !!(nb.src[i] && nb.dst[i]));
    });
    [].forEach.call(svg.querySelectorAll('path,polygon'), function (w) {
      var isIn = w.dataset.b === id, isOut = w.dataset.a === id;
      w.classList.toggle('hot', isIn || isOut);
      w.classList.toggle('in', isIn);
      w.classList.toggle('out', isOut && !isIn);
    });
  }
  function unhighlight() {
    host.classList.remove('is-hot');
    [].forEach.call(host.querySelectorAll('.hot, .near, .both'), function (n) {
      n.classList.remove('hot', 'near', 'in', 'out', 'both');
    });
    [].forEach.call(svg.querySelectorAll('.hot'), function (n) { n.classList.remove('hot', 'in', 'out'); });
  }

  /* ── статус ───────────────────────────────────────────────────────── */
  var statusEl = document.getElementById('fstatus');
  function status() {
    if (!statusEl) return;
    if (mode === 'card') {
      var nb = neighbours(curId), p = byId[curId];
      statusEl.textContent = 'Focus: ' + p.name + ' — ' + Object.keys(nb.src).length + ' in · ' +
        Object.keys(nb.dst).length + ' out · Esc to reset';
    } else if (mode === 'domain') {
      var d = domains.filter(function (x) { return x.id === curId; })[0];
      var n = list.filter(function (p2) { return p2.dom.id === curId; }).length;
      statusEl.textContent = 'Domain: ' + d.t + ' — ' + n + ' process' + (n === 1 ? '' : 'es') + ' · Esc to reset';
    } else statusEl.textContent = '';
    [].forEach.call(document.querySelectorAll('.dombtn'), function (b) {
      b.setAttribute('aria-pressed', String(mode === 'domain' && b.dataset.dom === curId));
    });
    domains.forEach(function (d) {
      dpanels[d.id].classList.toggle('on', mode === 'domain' && d.id === curId);
    });
  }

  /* ── винесення карток у полотно і повернення назад ────────────────── */
  function absorb() {
    if (Object.keys(homeBox).length) return;
    cardBoxes().forEach(function (b) {
      homeBox[b.el.id] = { x: b.x, y: b.y, w: b.w, h: b.h };
    });
    list.forEach(function (p) {
      var n = cards[p.id], h = homeBox[n.id];
      n.style.position = 'absolute';
      n.style.left = h.x + 'px'; n.style.top = h.y + 'px';
      n.style.width = h.w + 'px'; n.style.margin = '0';
      host.appendChild(n);
    });
  }
  function release() {
    /* Повертаємо картки в групи в порядку list: збережений сусід на цей момент
       теж винесений у полотно, і insertBefore по ньому кинув би NotFoundError. */
    list.forEach(function (p) {
      var n = cards[p.id];
      n.style.cssText = ''; n.style.borderLeftColor = p.dom.c;
      n.classList.remove('gone');
      groups[p.dom.id + p.fa].appendChild(n);
    });
    homeBox = {};
  }
  function cur(el) {
    return { x: parseFloat(el.style.left) || 0, y: parseFloat(el.style.top) || 0 };
  }

  /* ── розкладка фокуса на картці ───────────────────────────────────── */
  /* Вибрана картка НЕ рушає: кластер будується навколо її поточних координат,
     джерела ліворуч, цілі праворуч, полотно росте вправо і вниз. */
  function planCard(id) {
    var nb = neighbours(id), sel = cards[id], a = cur(sel);
    var selW = sel.offsetWidth, selH = sel.offsetHeight;
    var src = list.filter(function (p) { return nb.src[p.id]; });
    var dst = list.filter(function (p) { return nb.dst[p.id] && !nb.src[p.id]; });
    var pos = {}; pos[id] = { x: a.x, y: a.y };

    function column(arr, side) {
      if (!arr.length) return;
      var w = Math.max.apply(null, arr.map(function (p) { return cards[p.id].offsetWidth; }));
      var tot = arr.reduce(function (m, p) { return m + cards[p.id].offsetHeight + GAP_MIN; }, -GAP_MIN);
      var x = side < 0 ? a.x - GAP_SIDE - w : a.x + selW + GAP_SIDE;
      var y = a.y + selH / 2 - tot / 2;
      var stacked = false, minY = TOP + CAP + 30;
      if (side < 0 && x < 8) {
        /* Ліворуч від картки місця немає (колонка Initiating стоїть одразу за
           панеллю доменів), а зрушити картку не можна. Тоді джерела стають
           стовпчиком НАД карткою, вирівняні по її лівому краю; якщо й угорі
           тісно — під нею. */
        stacked = true; x = a.x;
        if (a.y - tot - 48 >= minY) y = a.y - 48 - tot;
        else y = a.y + selH + 48;
      }
      if (!stacked) y = Math.max(minY, y);
      arr.forEach(function (p) {
        pos[p.id] = { x: x, y: y }; y += cards[p.id].offsetHeight + GAP_MIN;
      });
    }
    column(src, -1); column(dst, 1);

    var maxx = 0, maxy = 0;
    Object.keys(pos).forEach(function (k) {
      maxx = Math.max(maxx, pos[k].x + cards[k].offsetWidth);
      maxy = Math.max(maxy, pos[k].y + cards[k].offsetHeight);
    });
    return { pos: pos, w: maxx + 60, h: maxy + 60 };
  }

  /* ── розкладка фокуса на домені ───────────────────────────────────── */
  /* Картки домену — одна смуга зліва направо по фазах, кожна фаза на своєму
     стовпчику повної розкладки, тож підписи фаз стоять там, де й були. */
  var BANDY = 132;
  function planDomain(domId) {
    var pos = {}, maxx = 0, maxy = 0, used = {};
    FAS.forEach(function (f) {
      var arr = list.filter(function (p) { return p.dom.id === domId && p.fa === f; });
      if (!arr.length) return;
      used[f] = true;
      var x = colX[f] + PADX, y = BANDY;
      arr.forEach(function (p) {
        pos[p.id] = { x: x, y: y }; y += cards[p.id].offsetHeight + GAP_MIN;
        maxx = Math.max(maxx, x + cards[p.id].offsetWidth); maxy = Math.max(maxy, y);
      });
    });
    return { pos: pos, used: used, w: Math.max(maxx + 60, STAGE_W), h: maxy + 60 };
  }
  /* Рядок назв фаз стоїть угорі полотна і не залежить від режиму. */
  function showCaps() {
    var w = CW + PADX * 2;
    FAS.forEach(function (f) {
      pcaps[f].style.left = colX[f] + 'px';
      pcaps[f].style.top = (TOP + 12) + 'px';
      pcaps[f].style.width = w + 'px';
      pcaps[f].classList.toggle('sub', f === 'E' || f === 'MC');
      if (f === 'E' || f === 'MC') pcaps[f].style.top = (TOP + 62) + 'px';
      pcaps[f].hidden = false;
    });
    emcap.style.cssText = 'left:' + colX.E + 'px;top:' + (TOP + 4) + 'px;width:' + (colX.MC + w - colX.E) + 'px';
    pancap.style.cssText = 'left:' + TOP + 'px;top:' + (TOP + 12) + 'px;width:' + PANW + 'px';
  }

  /* ── переходи ─────────────────────────────────────────────────────── */
  function apply(L, keep) {
    Object.keys(homeBox).forEach(function (k) {
      var id = k.replace(/^p-/, ''), n = cards[id], p = L.pos[id];
      if (p) { n.style.left = p.x + 'px'; n.style.top = p.y + 'px'; }
    });
    host.style.width = Math.max(L.w, STAGE_W) + 'px';
    host.style.height = Math.max(L.h, 400) + 'px';
    showCaps();
    void keep;
  }
  function fadeOut(keepSet, then) {
    host.classList.add('focus-mode', 'fading');
    Object.keys(homeBox).forEach(function (k) {
      var id = k.replace(/^p-/, ''), n = cards[id];
      n.classList.toggle('gone', !keepSet[id]);
    });
    setTimeout(then, FADE + 20);
  }
  function move(L, then) {
    host.classList.remove('fading');
    host.classList.add('moving');
    requestAnimationFrame(function () {
      apply(L);
      if (window.__fvZoom) window.__fvZoom(true);
      setTimeout(function () {
        host.classList.remove('moving');
        requestAnimationFrame(function () { requestAnimationFrame(then); });
      }, MOVE + 30);
    });
  }
  function hideWires() { while (svg.firstChild) svg.removeChild(svg.firstChild); }

  function focusCard(id) {
    if (busy) return; busy = true;
    hideWires(); unhighlight();
    absorb();
    var nb = neighbours(id), keep = { }; keep[id] = 1;
    Object.keys(nb.src).forEach(function (k) { keep[k] = 1; });
    Object.keys(nb.dst).forEach(function (k) { keep[k] = 1; });
    showCaps();
    mode = 'card'; curId = id;
    fadeOut(keep, function () {
      var L = planCard(id);
      move(L, function () {
        draw(); highlight(id); status();
        if (window.__fvZoom) window.__fvZoom(true);
        busy = false;
      });
    });
  }

  function focusDomain(domId) {
    if (busy) return; busy = true;
    hideWires(); unhighlight();
    absorb();
    var keep = {};
    list.forEach(function (p) { if (p.dom.id === domId) keep[p.id] = 1; });
    mode = 'domain'; curId = domId;
    fadeOut(keep, function () {
      var L = planDomain(domId);
      showCaps();
      move(L, function () {
        draw(); status();
        if (window.__fvZoom) window.__fvZoom(true);
        busy = false;
      });
    });
  }

  function reset(then) {
    if (!mode) { if (then) then(); return; }
    if (busy) return;
    busy = true;
    hideWires(); unhighlight(); showCaps();
    mode = null; curId = null; status();
    host.classList.add('moving');
    host.style.width = STAGE_W + 'px';
    host.style.height = STAGE_H + 'px';
    requestAnimationFrame(function () {
      Object.keys(homeBox).forEach(function (k) {
        var h = homeBox[k], n = document.getElementById(k);
        n.style.left = h.x + 'px'; n.style.top = h.y + 'px'; n.style.width = h.w + 'px';
      });
      if (window.__fvZoom) window.__fvZoom(true);
      setTimeout(function () {
        /* Спершу все повернулось на місце — тепер проявляємо погашене. */
        host.classList.remove('moving'); host.classList.add('fading');
        [].forEach.call(host.querySelectorAll('.pnode.gone'), function (n) { n.classList.remove('gone'); });
        setTimeout(function () {
          host.classList.remove('fading', 'focus-mode');
          release(); relayout();
          requestAnimationFrame(function () { requestAnimationFrame(function () {
            draw();
            if (window.__fvZoom) window.__fvZoom(true);
            busy = false;
            if (then) then();
          }); });
        }, FADE + 20);
      }, MOVE + 30);
    });
  }

  function hitCard(p) {
    if (busy) return;
    if (mode === 'card' && curId === p.id) { reset(); return; }
    /* З доменного фокуса переходимо прямо, від поточних позицій, без
       повернення до повної розкладки. */
    focusCard(p.id);
  }

  /* ── панель доменів ───────────────────────────────────────────────── */
  var panel = document.getElementById('dompanel');
  if (panel) {
    domains.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dombtn'; b.dataset.dom = d.id;
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', d.t + ' domain');
      b.title = d.t;
      b.style.setProperty('--dc', d.c);
      b.innerHTML = '<span class="bar"></span><span class="t">' + d.t + '</span>';
      b.onclick = function (e) {
        e.stopPropagation();
        if (busy) return;
        if (mode === 'domain' && curId === d.id) reset();
        else focusDomain(d.id);
      };
      panel.appendChild(b);
    });
  }

  /* ── входи/виходи ─────────────────────────────────────────────────── */
  function mark(n) {
    var open = n.classList.contains('open'), b = n.querySelector('.iobtn');
    if (b) { b.textContent = open ? '–' : '+'; b.setAttribute('aria-expanded', String(open)); }
  }
  function toggleIO(n) {
    n.classList.toggle('open'); mark(n);
    replan();
  }
  function setOpen(on) {
    [].forEach.call(host.querySelectorAll('.pnode'), function (n) { n.classList.toggle('open', on); mark(n); });
    replan();
  }
  function replan() {
    if (!mode) {
      relayout();
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        draw(); if (window.__fvZoom) window.__fvZoom(true);
      }); });
      return;
    }
    /* У фокусі висоти змінились — перескладаємо кластер на місці. */
    hideWires();
    var L = mode === 'card' ? planCard(curId) : planDomain(curId);
    if (mode === 'domain') showCaps();
    apply(L);
    if (window.__fvZoom) window.__fvZoom(true);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      draw(); if (mode === 'card') highlight(curId);
      if (window.__fvZoom) window.__fvZoom(true);
    }); });
  }

  document.addEventListener('click', function () { if (mode) reset(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') reset(); });

  var xa = document.getElementById('btn-expand'), xc = document.getElementById('btn-collapse');
  if (xa) xa.onclick = function (e) { e.stopPropagation(); setOpen(true); };
  if (xc) xc.onclick = function (e) { e.stopPropagation(); setOpen(false); };

  relayout();
  draw();
  status();
  var fit = document.getElementById('fit');
  /* Зум як на картах: полотно рухається transform-ом усередині рамки фіксованого
     розміру; колесо з ⌘/Ctrl масштабує відносно курсора, перетягування — панорама.
     Рамка свого розміру не міняє — ні від зуму, ні від фокусу. */
  var Z = (function (wrap, stage) {
    var k = 1, tx = 0, ty = 0, MIN = 0.15, MAX = 3;
    wrap.style.overflow = 'hidden'; wrap.style.position = 'relative';
    stage.style.transformOrigin = '0 0';
    function put() { stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')'; }
    function at(next, cx, cy) {
      next = Math.min(MAX, Math.max(MIN, next));
      var r = wrap.getBoundingClientRect(), x = cx - r.left, y = cy - r.top;
      tx = x - (x - tx) * next / k; ty = y - (y - ty) * next / k; k = next; put();
    }
    function fitIn() {
      var w = stage.scrollWidth || 1, h = stage.scrollHeight || 1;
      k = Math.min(1, (wrap.clientWidth - 24) / w, (wrap.clientHeight - 24) / h);
      tx = (wrap.clientWidth - w * k) / 2; ty = 12; put();
    }
    /* Трекпад: щипок двома пальцями приходить як wheel з ctrlKey — це зум
       відносно курсора; звичайний свайп двома пальцями — панорама всередині
       рамки (як у Figma). Колесо миші з ⌘/Ctrl — теж зум. */
    wrap.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // щипок дає дрібні дельти, коліщатко миші — великі кроки: швидкість різна
        var sp = Math.abs(e.deltaY) > 40 ? 0.0022 : 0.012;
        at(k * Math.exp(-e.deltaY * sp), e.clientX, e.clientY); return;
      }
      tx -= e.deltaX; ty -= e.deltaY; put();
    }, { passive: false });
    var drag = null, moved = false;
    wrap.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button')) return;
      drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, on: false }; moved = false;
    });
    wrap.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.hypot(dx, dy) < 4) return;
        drag.on = true; moved = true; wrap.setPointerCapture(e.pointerId); wrap.style.cursor = 'grabbing';
      }
      tx = drag.tx + dx; ty = drag.ty + dy; put();
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      wrap.addEventListener(ev, function () { drag = null; wrap.style.cursor = ''; });
    });
    wrap.addEventListener('click', function (e) {
      if (!moved) return; moved = false; e.stopPropagation(); e.preventDefault();
    }, true);
    return { fit: fitIn, get: function () { return k; },
      set: function (v) { var r = wrap.getBoundingClientRect(); at(v, r.left + r.width / 2, r.top + r.height / 2); } };
  })(fit, host);

  /* Висота рамки: вписана за шириною повна схема, не більше 90% вікна; у повному
     екрані — усе, що лишилось під панеллю. Рахується лише при зміні розміру вікна. */
  var frameH = 0;
  function sizeFrame() {
    var fr = document.getElementById('fvFrame');
    if (document.fullscreenElement === fr) {
      var top = fit.getBoundingClientRect().top - fr.getBoundingClientRect().top;
      frameH = fr.clientHeight - top - 18;
    } else {
      var kw = Math.min(1, (fit.clientWidth - 24) / (host.scrollWidth || 1));
      frameH = Math.min(host.scrollHeight * kw + 24, innerHeight * 0.9);
    }
    fit.style.height = Math.round(frameH) + 'px';
  }
  window.__fvZoom = function (refit, resized) {
    if (fit.clientWidth < 60) { setTimeout(function () { window.__fvZoom(refit, resized); }, 60); return; }
    if (resized || !frameH) sizeFrame();
    if (refit) Z.fit(); else Z.set(Z.get());
  };
  window.__fvZoom(true, true);
  addEventListener('resize', function () { window.__fvZoom(true, true); });
  document.addEventListener('fullscreenchange', function () { setTimeout(function () { window.__fvZoom(true, true); }, 80); });

  window.FOCUS = {
    list: list, cards: cards, groups: groups, host: host, svg: svg,
    check: check, draw: draw, focusCard: focusCard, focusDomain: focusDomain, reset: reset,
    at: function (id) { var b = cardBoxes().filter(function (x) { return x.el.id === 'p-' + id; })[0];
      return b ? { x: b.x, y: b.y } : null; },
    state: function () { return { mode: mode, id: curId }; }
  };
})();
