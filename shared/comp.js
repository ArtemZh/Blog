/* Рушій схем сторінки 26 «Компетенції PM».
 *
 * Правила (SCHEMA-PRINCIPLES / skill DWH):
 *  — геометрія рахується з даних: колонка (lane) × рядок (row), жодних ручних x/y;
 *  — дроти будуються з id вузлів після розкладки, ортогонально, повз чужі картки;
 *  — на полотні лише назва й короткий тег, решта — у спливаючому вікні;
 *  — одна змінна = один сенс: колір дроту = вид зв'язку, а не «краса»;
 *  — усе перевіряється скриптом: COMP.check() шукає накладання карток і лінії під картками.
 *
 * Дані: window.COMP_DATA = { id: { lanes, nodes, links, note } }.
 */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var LANE_W = 200, LANE_GAP = 40, ROW_H = 96, TOP = 34, PAD = 16;
  var NODE_H = 68;

  function el(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function build(host, data) {
    var lanes = data.lanes, nodes = data.nodes, links = data.links || [];
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });

    var laneX = {}, x = PAD;
    lanes.forEach(function (l) { laneX[l.id] = x; x += (l.w || LANE_W) + LANE_GAP; });
    /* запас праворуч: петлі повертаються коридором поза останньою колонкою */
    var W = x - LANE_GAP + PAD + 28;
    var maxRow = Math.max.apply(null, nodes.map(function (n) { return n.row; }));
    var H = TOP + (maxRow + 1) * ROW_H + PAD;

    var stage = document.createElement('div');
    stage.className = 'cstage';
    stage.style.width = W + 'px';
    stage.style.height = H + 'px';

    var svg = el('svg', { class: 'cwires', viewBox: '0 0 ' + W + ' ' + H });
    stage.appendChild(svg);

    /* підписи колонок — рядком над сіткою, а не всередині карток */
    lanes.forEach(function (l) {
      var c = document.createElement('div');
      c.className = 'clane';
      c.style.left = laneX[l.id] + 'px';
      c.style.width = (l.w || LANE_W) + 'px';
      c.textContent = l.t;
      stage.appendChild(c);
    });

    var box = {};
    nodes.forEach(function (n) {
      var w = n.w || (lanes.filter(function (l) { return l.id === n.lane; })[0] || {}).w || LANE_W;
      var b = { x: laneX[n.lane], y: TOP + n.row * ROW_H, w: w, h: n.h || NODE_H };
      box[n.id] = b;
      var d = document.createElement('div');
      d.className = 'cnode' + (n.kind ? ' k-' + n.kind : '');
      d.id = 'c-' + n.id;
      d.style.cssText = 'left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px';
      d.innerHTML = '<b>' + esc(n.t) + '</b>' + (n.s ? '<i>' + esc(n.s) + '</i>' : '');
      d.tabIndex = 0;
      d.setAttribute('role', 'button');
      stage.appendChild(d);
    });

    host.innerHTML = '';
    var fit = document.createElement('div');
    fit.className = 'cfit';
    fit.appendChild(stage);
    host.appendChild(fit);

    /* ── дроти ─────────────────────────────────────────────────────────
       Вихід з боку, що дивиться на ціль; якщо колонки сусідні — пряма,
       інакше через коридор між колонками. Лінія не перетинає чужу картку:
       перевіряємо семплінгом і, якщо треба, опускаємо коридор на вільний рівень. */
    function obstacles(a, b) {
      return nodes.filter(function (n) { return n.id !== a && n.id !== b; }).map(function (n) { return box[n.id]; });
    }
    function hit(p1, p2, boxes) {
      var x0 = Math.min(p1.x, p2.x) - 1, x1 = Math.max(p1.x, p2.x) + 1;
      var y0 = Math.min(p1.y, p2.y) - 1, y1 = Math.max(p1.y, p2.y) + 1;
      return boxes.some(function (r) {
        return x1 > r.x + 2 && x0 < r.x + r.w - 2 && y1 > r.y + 2 && y0 < r.y + r.h - 2;
      });
    }
    function clear(pts, boxes) {
      for (var i = 1; i < pts.length; i++) if (hit(pts[i - 1], pts[i], boxes)) return false;
      return true;
    }
    /* коридори: вертикальні між колонками, горизонтальні між рядами */
    var XL = [], YL = [];
    lanes.forEach(function (l, i) {
      var lx = laneX[l.id], lw = l.w || LANE_W;
      if (i === 0) XL.push(lx - PAD / 2);
      XL.push(lx + lw + LANE_GAP / 2);
    });
    for (var r = 0; r <= maxRow + 1; r++) YL.push(TOP + r * ROW_H - (ROW_H - NODE_H) / 2);

    function route(A, B, boxes) {
      var ac = { x: A.x + A.w / 2, y: A.y + A.h / 2 }, bc = { x: B.x + B.w / 2, y: B.y + B.h / 2 };
      function ok(pts) { return clear(pts, boxes) ? pts : null; }
      var right = bc.x > ac.x + 4, left = bc.x < ac.x - 4, down = bc.y > ac.y;
      var sx = right ? A.x + A.w : A.x, tx = right ? B.x - 8 : B.x + B.w + 8;
      var sy = down ? A.y + A.h : A.y, ty = down ? B.y - 8 : B.y + B.h + 8;

      if (!right && !left) {                       /* одна колонка */
        var v = ok([{ x: ac.x, y: sy }, { x: ac.x, y: ty }]);
        if (v) return v;
        /* сусід заважає — обходимо збоку колонки */
        var side = [A.x + A.w + LANE_GAP / 2, A.x - LANE_GAP / 2];
        for (var i = 0; i < side.length; i++) {
          var cx = side[i];
          var pts = ok([{ x: ac.x, y: sy }, { x: cx, y: sy }, { x: cx, y: ty }, { x: bc.x, y: ty }]);
          if (pts) return pts;
        }
        return null;
      }
      if (Math.abs(ac.y - bc.y) < 3) {
        var h = ok([{ x: sx, y: ac.y }, { x: tx, y: ac.y }]);
        if (h) return h;
      }
      /* один вертикальний коридор між колонками */
      var xs = XL.slice().sort(function (u, v2) {
        return Math.abs(u - (ac.x + bc.x) / 2) - Math.abs(v2 - (ac.x + bc.x) / 2);
      });
      for (var j = 0; j < xs.length; j++) {
        var c = xs[j];
        var p1 = ok([{ x: sx, y: ac.y }, { x: c, y: ac.y }, { x: c, y: bc.y }, { x: tx, y: bc.y }]);
        if (p1) return p1;
      }
      /* горизонтальний коридор між рядами */
      var ys = YL.slice().sort(function (u, v2) {
        return Math.abs(u - (ac.y + bc.y) / 2) - Math.abs(v2 - (ac.y + bc.y) / 2);
      });
      for (var k = 0; k < ys.length; k++) {
        var cy = ys[k];
        var p2 = ok([{ x: ac.x, y: cy > ac.y ? A.y + A.h : A.y }, { x: ac.x, y: cy },
                     { x: bc.x, y: cy }, { x: bc.x, y: cy > bc.y ? B.y + B.h + 8 : B.y - 8 }]);
        if (p2) return p2;
      }
      /* комбінація: вийти вгору/вниз, пройти коридором між рядами, зайти збоку */
      for (var m = 0; m < ys.length; m++) {
        for (var n2 = 0; n2 < xs.length; n2++) {
          var gy = ys[m], gx = xs[n2];
          var p3 = ok([{ x: ac.x, y: gy > ac.y ? A.y + A.h : A.y }, { x: ac.x, y: gy },
                       { x: gx, y: gy }, { x: gx, y: bc.y }, { x: tx, y: bc.y }]);
          if (p3) return p3;
        }
      }
      return null;
    }

    var missed = [], wireEl = {};
    links.forEach(function (L) {
      var A = box[L.from], B = box[L.to];
      if (!A || !B) { missed.push(L.from + ' → ' + L.to + ' (немає вузла)'); return; }
      var pts = route(A, B, obstacles(L.from, L.to));
      if (!pts) { missed.push(L.from + ' → ' + L.to + ' (немає чистого шляху)'); return; }
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x + ' ' + p.y; }).join(' ');
      var p = el('path', { class: 'cw' + (L.kind ? ' w-' + L.kind : ''), d: d });
      p.dataset.a = L.from; p.dataset.b = L.to;
      svg.appendChild(p);
      wireEl[L.from + '>' + L.to] = p;
      /* наконечник малюємо самі: marker-end масштабується зі stroke і зникає */
      var n1 = pts[pts.length - 2], n2 = pts[pts.length - 1];
      var dx = n2.x - n1.x, dy = n2.y - n1.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      var head = el('polygon', {
        class: 'chead' + (L.kind ? ' w-' + L.kind : ''),
        points: (n2.x + ux * 7) + ',' + (n2.y + uy * 7) + ' ' +
                (n2.x - uy * 3.4) + ',' + (n2.y + ux * 3.4) + ' ' +
                (n2.x + uy * 3.4) + ',' + (n2.y - ux * 3.4)
      });
      head.dataset.a = L.from; head.dataset.b = L.to;
      svg.appendChild(head);
      if (L.t) {
        var mx = (pts[Math.floor(pts.length / 2) - 1].x + pts[Math.floor(pts.length / 2)].x) / 2;
        var my = (pts[Math.floor(pts.length / 2) - 1].y + pts[Math.floor(pts.length / 2)].y) / 2;
        var tx2 = el('text', { class: 'cwt', x: mx, y: my - 5, 'text-anchor': 'middle' }, L.t);
        tx2.dataset.a = L.from; tx2.dataset.b = L.to;
        svg.appendChild(tx2);
      }
    });
    if (missed.length) console.warn('26: дроти не намальовані', missed);

    /* ── підсвітка ланцюга й спливаюче вікно ──────────────────────────── */
    var pinned = null;
    function chain(id) {
      var seen = {}, queue = [id];
      while (queue.length) {
        var cur = queue.shift();
        if (seen[cur]) continue;
        seen[cur] = 1;
        links.forEach(function (L) {
          if (L.from === cur && !seen[L.to]) queue.push(L.to);
          if (L.to === cur && !seen[L.from]) queue.push(L.from);
        });
      }
      return seen;
    }
    function mark(id) {
      if (!id) {
        stage.classList.remove('is-hot');
        [].forEach.call(stage.querySelectorAll('.is-hot,.is-dim'), function (n) { n.classList.remove('is-hot', 'is-dim'); });
        return;
      }
      var set = chain(id);
      stage.classList.add('is-hot');
      nodes.forEach(function (n) {
        var d = document.getElementById('c-' + n.id);
        d.classList.toggle('is-hot', !!set[n.id]);
        d.classList.toggle('is-dim', !set[n.id]);
      });
      [].forEach.call(svg.children, function (p) {
        var on = set[p.dataset.a] && set[p.dataset.b];
        p.classList.toggle('is-hot', !!on);
        p.classList.toggle('is-dim', !on);
      });
    }

    stage.addEventListener('mouseover', function (e) {
      var d = e.target.closest('.cnode'); if (!d || pinned) return;
      mark(d.id.slice(2));
    });
    stage.addEventListener('mouseout', function (e) {
      var d = e.target.closest('.cnode'); if (!d || pinned) return;
      if (d.contains(e.relatedTarget)) return;
      mark(null);
    });
    stage.addEventListener('click', function (e) {
      var d = e.target.closest('.cnode');
      if (!d) { pinned = null; mark(null); return; }
      e.stopPropagation();
      var id = d.id.slice(2);
      if (pinned === id) { pinned = null; mark(null); return; }
      pinned = id; mark(id);
    });
    stage.addEventListener('keydown', function (e) {
      var d = e.target.closest('.cnode'); if (!d) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.click(); }
      if (e.key === 'Escape') { pinned = null; mark(null); }
    });


    /* Пояснення блоків — текстом під схемою, а не у спливаючому вікні. */
    var list = document.createElement('dl');
    list.className = 'clist';
    nodes.forEach(function (n) {
      list.innerHTML += '<dt>' + esc(n.t) + (n.s ? ' <span>' + esc(n.s) + '</span>' : '') + '</dt>' +
                        '<dd>' + n.b + '</dd>';
    });

    /* ── сценарій (механіка DWH): крок = дріт + підпис, решта гасне ──── */
    var sc = data.scenario;
    if (sc && sc.steps && sc.steps.length) {
      var bar = document.createElement('div');
      bar.className = 'cscen';
      var nums = sc.steps.map(function (_, i) {
        return '<button type="button" class="cs-n" data-i="' + i + '">' + (i + 1) + '</button>';
      }).join('');
      bar.innerHTML =
        '<button type="button" class="cs-b cs-play" aria-label="Програти">▶</button>' +
        '<button type="button" class="cs-b cs-prev" aria-label="Попередній крок">←</button>' +
        '<button type="button" class="cs-b cs-next" aria-label="Наступний крок">→</button>' +
        '<span class="cs-nums">' + nums + '</span>' +
        '<span class="cs-cap"></span>';
      host.appendChild(bar);

      var cur = -1, timer = null, playing = false;
      var playB = bar.querySelector('.cs-play'), cap = bar.querySelector('.cs-cap');

      function clearScen() {
        stage.classList.remove('is-flow');
        [].forEach.call(stage.querySelectorAll('.is-lit'), function (n) { n.classList.remove('is-lit'); });
        [].forEach.call(svg.querySelectorAll('.is-lit'), function (n) { n.classList.remove('is-lit'); });
        svg.querySelectorAll('path').forEach(function (p) {
          p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.transition = '';
        });
      }
      function litNode(id) { var d = document.getElementById('c-' + id); if (d) d.classList.add('is-lit'); }
      function litWire(a, b, animate) {
        var p = wireEl[a + '>' + b]; if (!p) return;
        p.classList.add('is-lit');
        var h = [].filter.call(svg.querySelectorAll('polygon'), function (t) {
          return t.dataset.a === a && t.dataset.b === b;
        })[0];
        if (h) h.classList.add('is-lit');
        var off = false;
        try { off = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
        if (animate && !off) {
          var len = p.getTotalLength();
          p.style.transition = 'none';
          p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
          p.getBoundingClientRect();
          p.style.transition = 'stroke-dashoffset .38s linear';
          p.style.strokeDashoffset = 0;
        }
      }
      function draw(i, animate) {
        clearScen();
        stage.classList.add('is-flow');
        cur = i;
        for (var k = 0; k <= i; k++) {
          var st = sc.steps[k];
          (st.n || []).forEach(litNode);
          if (st.w) {
            var ws = Array.isArray(st.w[0]) ? st.w : [st.w];
            ws.forEach(function (pair) {
              litNode(pair[0]); litNode(pair[1]);
              litWire(pair[0], pair[1], animate && k === i);
            });
          }
        }
        cap.textContent = sc.steps[i].d;
        [].forEach.call(bar.querySelectorAll('.cs-n'), function (b) {
          b.classList.toggle('on', +b.dataset.i === i);
        });
      }
      function stop() {
        playing = false; clearTimeout(timer); timer = null;
        playB.textContent = '▶'; playB.classList.remove('on');
      }
      function reset() { stop(); cur = -1; clearScen(); cap.textContent = ''; 
        [].forEach.call(bar.querySelectorAll('.cs-n'), function (b) { b.classList.remove('on'); }); }
      function tick() {
        timer = setTimeout(function () {
          if (cur >= sc.steps.length - 1) { stop(); return; }
          draw(cur + 1, true); tick();
        }, 1700);
      }
      function play() {
        playing = true; playB.textContent = '❙❙'; playB.classList.add('on');
        draw(cur >= sc.steps.length - 1 ? 0 : cur + 1, true); tick();
      }
      playB.addEventListener('click', function (e) { e.stopPropagation(); playing ? stop() : play(); });
      bar.querySelector('.cs-prev').addEventListener('click', function (e) {
        e.stopPropagation(); stop(); draw(Math.max(0, cur - 1), false);
      });
      bar.querySelector('.cs-next').addEventListener('click', function (e) {
        e.stopPropagation(); stop(); draw(Math.min(sc.steps.length - 1, cur + 1), true);
      });
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('.cs-n'); if (!b) return;
        e.stopPropagation(); stop(); draw(+b.dataset.i, true);
      });
      stage.addEventListener('click', function (e) { e.stopPropagation(); });
      document.addEventListener('click', function (e) {
        if (bar.contains(e.target) || stage.contains(e.target)) return;
        reset();
      });
      window.addEventListener('keydown', function (e) {
        if (!stage.classList.contains('is-flow')) return;
        if (e.key === 'ArrowRight') { stop(); draw(Math.min(sc.steps.length - 1, cur + 1), true); }
        if (e.key === 'ArrowLeft') { stop(); draw(Math.max(0, cur - 1), false); }
        if (e.key === 'Escape') reset();
      });
    }

    /* Порядок: схема → керування сценарієм → підпис → пояснення блоків. */
    var after = host.nextElementSibling;
    if (after && after.classList.contains('chint')) after.parentNode.insertBefore(list, after.nextSibling);
    else host.appendChild(list);

    return { stage: stage, svg: svg, box: box, nodes: nodes, links: links, missed: missed };
  }

  var made = {};
  document.querySelectorAll('[data-comp]').forEach(function (host) {
    var d = (window.COMP_DATA || {})[host.dataset.comp];
    if (!d) return;
    made[host.dataset.comp] = build(host, d);
  });
  document.addEventListener('click', function () {
    Object.keys(made).forEach(function (k) {
      var s = made[k].stage;
      s.classList.remove('is-hot');
      [].forEach.call(s.querySelectorAll('.is-hot,.is-dim'), function (n) { n.classList.remove('is-hot', 'is-dim'); });
    });
  });

  /* Перевірка геометрії: накладання карток і лінії під чужими картками. */
  window.COMP = {
    made: made,
    check: function () {
      var out = {};
      Object.keys(made).forEach(function (k) {
        var m = made[k], bad = [], under = [], noHead = [];
        var ids = Object.keys(m.box);
        for (var i = 0; i < ids.length; i++) for (var j = i + 1; j < ids.length; j++) {
          var a = m.box[ids[i]], b = m.box[ids[j]];
          if (a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1)
            bad.push(ids[i] + ' × ' + ids[j]);
        }
        m.svg.querySelectorAll('path').forEach(function (p) {
          var L = p.getTotalLength(), name = p.dataset.a + ' → ' + p.dataset.b;
          for (var d = 3; d < L - 3; d += 3) {
            var pt = p.getPointAtLength(d);
            ids.forEach(function (id) {
              if (id === p.dataset.a || id === p.dataset.b) return;
              var r = m.box[id];
              if (pt.x > r.x + 2 && pt.x < r.x + r.w - 2 && pt.y > r.y + 2 && pt.y < r.y + r.h - 2)
                under.push(name + ' під ' + id);
            });
          }
          var end = p.getPointAtLength(L);
          var has = [].some.call(m.svg.querySelectorAll('polygon'), function (t) {
            var q = t.points[0];
            return Math.hypot(q.x - end.x, q.y - end.y) <= 12;
          });
          if (!has) noHead.push(name);
        });
        out[k] = { overlaps: bad, under: [...new Set(under)], noHead: noHead, missed: m.missed };
      });
      return out;
    }
  };
})();
