/* Взаємодія зі схемою Delivery Framework (підходи зі схеми ДВХ):
 *  — наведення: звʼязки картки разом із наконечниками яскраві, решта тьмяніє;
 *  — клік: закріплена підказка, одна на всю схему; Esc або клік повз — закрити;
 *  — вузький екран: стрічка карток замість полотна;
 *  — FW.check() / FW.checkAll(): геометрія перевіряється кодом, а не оком. */
(function () {
  var H = window.FW_HINTS || {};
  var wrap = document.getElementById('fw-wrap');
  var frame = document.querySelector('.zoomframe');
  if (!wrap || !frame) return;

  var OWNER = {
    'g-any': 'Owner: Junior PM (PC) / Middle / Senior PM',
    'g-senior': 'Owner: Middle / Senior PM only',
    'g-po': 'Owner: Product Owner / Business Analyst',
    'r-sales': 'Owner: Sales / Account Management',
    'r-tech': 'Owner: Solution Architect',
    'a-any': 'Artefact — created by Junior PM (PC) / Middle / Senior PM',
    'a-senior': 'Artefact — created by Middle / Senior PM only'
  };
  function ownerOf(c) {
    for (var k in OWNER) if (c.classList.contains(k)) return OWNER[k];
    return '';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ── підказка ─────────────────────────────────────────────── */
  var pop = document.createElement('div');
  pop.className = 'fw-pop';
  frame.appendChild(pop);
  var pinned = null;

  function fill(c) {
    var key = c.dataset.h, h = H[key];
    pop.innerHTML = '<span class="k">' + esc(h ? h[0] : 'No description yet') + '</span>' +
      '<span class="t">' + esc(key) + '</span>' +
      (h ? '<span>' + esc(h[1]) + '</span>' : '') +
      (ownerOf(c) ? '<span class="o">' + esc(ownerOf(c)) + '</span>' : '');
  }
  function show(c, pin) {
    fill(c);
    var fr = frame.getBoundingClientRect(), r = c.getBoundingClientRect();
    var W = 320, x = r.right - fr.left + 10, y = r.top - fr.top;
    if (x + W > fr.width - 8) x = r.left - fr.left - W - 10;
    if (x < 8) { x = Math.min(Math.max(8, r.left - fr.left), fr.width - W - 8); y = r.bottom - fr.top + 8; }
    pop.style.left = x + 'px';
    pop.style.top = Math.max(8, y) + 'px';
    pop.classList.add('on');
    pop.classList.toggle('pin', !!pin);
    requestAnimationFrame(function () {
      var ph = pop.offsetHeight, top = parseFloat(pop.style.top);
      if (top + ph > fr.height - 8) pop.style.top = Math.max(8, fr.height - ph - 8) + 'px';
    });
  }
  function hide() {
    pop.classList.remove('on', 'pin');
    if (pinned) pinned.classList.remove('is-pin');
    pinned = null;
  }

  /* ── ланцюг звʼязків ──────────────────────────────────────── */
  function chain(c, on) {
    var id = c.id;
    var hits = id ? wrap.querySelectorAll('[data-a="' + id + '"],[data-b="' + id + '"]') : [];
    [].forEach.call(wrap.querySelectorAll('.is-hot'), function (n) { n.classList.remove('is-hot'); });
    if (!on || !hits.length) { wrap.classList.remove('chain'); return; }
    wrap.classList.add('chain');
    [].forEach.call(hits, function (n) { n.classList.add('is-hot'); });
  }

  function target(e) { return e.target.closest && e.target.closest('#fw-wrap .cell, #fw-wrap .gate'); }
  wrap.addEventListener('mouseover', function (e) {
    var c = target(e); if (!c) return;
    chain(c, true);
    if (!pinned) show(c, false);
  });
  wrap.addEventListener('mouseout', function (e) {
    var c = target(e); if (!c || c.contains(e.relatedTarget)) return;
    chain(pinned || c, !!pinned);
    if (!pinned) pop.classList.remove('on');
  });
  wrap.addEventListener('click', function (e) {
    var c = target(e); if (!c) return;
    e.stopPropagation();
    if (pinned === c) { hide(); chain(c, false); return; }
    if (pinned) pinned.classList.remove('is-pin');
    pinned = c; c.classList.add('is-pin');
    show(c, true); chain(c, true);
  });
  wrap.addEventListener('keydown', function (e) {
    var c = target(e);
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.click(); }
  });
  document.addEventListener('click', function (e) {
    if (pinned && !pop.contains(e.target)) { chain(pinned, false); hide(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pinned) { chain(pinned, false); hide(); }
  });
  /* перемикачі перебудовують полотно — закріплена картка зникає разом із ним */
  document.querySelector('.controls').addEventListener('click', function () { hide(); wrap.classList.remove('chain'); setTimeout(buildList, 60); });
  document.addEventListener('fw:approach', function () { hide(); wrap.classList.remove('chain'); setTimeout(buildList, 60); });

  /* ── вузький екран ────────────────────────────────────────── */
  function buildList() {
    var host = document.getElementById('fw-list');
    if (!host) return;
    host.innerHTML = '';
    var groups = [
      ['Pre-sale', '#pre .cell, #p-gate'],
      ['Discovery', '#disc .cell'],
      ['Project management process', '#proc > .track:not(:last-child) .cell'],
      ['Delivery cycle — ' + (document.getElementById('iter-cadence') || {}).textContent, '#iter-grid .cell'],
      ['Artefacts', '#fw-art .cell']
    ];
    groups.forEach(function (g) {
      var cells = wrap.querySelectorAll(g[1]);
      if (!cells.length || (g[0] === 'Discovery' && !cells[0].offsetParent && wrap.querySelector('#fw').dataset.discovery === 'off')) return;
      var h = document.createElement('h4'); h.textContent = g[0]; host.appendChild(h);
      var seen = {};
      [].forEach.call(cells, function (c) {
        var key = c.dataset.h;
        if (seen[key] || (c.classList.contains('plc') && g[0] !== 'Project management process')) return;
        seen[key] = 1;
        var d = document.createElement('div');
        d.className = c.className.replace(/\bis-pin\b|\bmatch\b/g, '') ;
        var hint = H[key];
        d.innerHTML = '<b>' + esc(key) + '</b>' + (hint ? '<p>' + esc(hint[1]) + '<br><small>' + esc(hint[0]) + '</small></p>' : '');
        d.addEventListener('click', function () { d.classList.toggle('open'); });
        host.appendChild(d);
      });
    });
  }
  setTimeout(buildList, 500);

  /* ── перевірка геометрії ──────────────────────────────────── */
  function check() {
    var I = window.FW_INTERNAL, k = I.scaleOf();
    var base = wrap.getBoundingClientRect();
    var cells = [].slice.call(wrap.querySelectorAll('.cell, .gate')).filter(function (c) { return c.offsetParent; });
    var box = function (n) {
      var r = n.getBoundingClientRect();
      return { x: (r.left - base.left) / k, y: (r.top - base.top) / k, w: r.width / k, h: r.height / k };
    };
    var B = cells.map(function (c) { return { id: c.id, key: c.dataset.h, b: box(c), el: c }; });
    var out = { overlaps: [], under: [], noHead: [], short: [] };

    for (var i = 0; i < B.length; i++) for (var j = i + 1; j < B.length; j++) {
      var a = B[i].b, b = B[j].b;
      if (a.x < b.x + b.w - 2 && b.x < a.x + a.w - 2 && a.y < b.y + b.h - 2 && b.y < a.y + a.h - 2 &&
          !B[i].el.contains(B[j].el) && !B[j].el.contains(B[i].el))
        out.overlaps.push(B[i].key + ' × ' + B[j].key);
    }

    [].forEach.call(wrap.querySelectorAll('svg path'), function (p) {
      var svg = p.ownerSVGElement, sb = box(svg);
      var vb = svg.viewBox.baseVal, sx = vb && vb.width ? sb.w / vb.width : 1, sy = vb && vb.height ? sb.h / vb.height : 1;
      var A = p.dataset.a, Bn = p.dataset.b, len = p.getTotalLength();
      var name = A + ' → ' + Bn;
      if (A === 'bus') return;
      /* стовбур коротшої стрілки ще видно разом із 13-піксельним наконечником */
      if (len < 10) out.short.push(name);
      var end = p.getPointAtLength(len);
      var hasHead = [].some.call(svg.querySelectorAll('polygon'), function (t) {
        var q = t.points[0]; return Math.hypot(q.x - end.x, q.y - end.y) <= 22;
      });
      if (!hasHead) out.noHead.push(name);
      var hit = {};
      for (var d = 4; d < len - 4; d += 3) {
        var pt = p.getPointAtLength(d), X = sb.x + pt.x * sx, Y = sb.y + pt.y * sy;
        B.forEach(function (c) {
          if (c.id === A || c.id === Bn) return;
          if (c.el.id === 'n-iter') return;
          var r = c.b;
          if (X > r.x + 1 && X < r.x + r.w - 1 && Y > r.y + 1 && Y < r.y + r.h - 1) hit[c.key] = 1;
        });
      }
      Object.keys(hit).forEach(function (h) { out.under.push(name + ' under ' + h); });
    });
    return out;
  }

  /* Усі стани: 2 редакції × 5 підходів (discovery показано завжди).
     Синхронно: getBoundingClientRect сам примушує розкладку, а таймери й rAF
     у прихованій вкладці гальмуються. */
  function checkAll() {
    var I = window.FW_INTERNAL, bad = {}, miss = {};
    var was = { ed: I.state.ed, fw: I.state.fw, discovery: I.state.discovery };
    ['6', '8'].forEach(function (ed) {
      window.ITERATION.approaches.forEach(function (ap) {
        ['on'].forEach(function (disc) {
          I.state.ed = ed; I.state.fw = ap.id; I.state.discovery = disc;
          I.redraw(); I.refit(); I.drawWires(); I.drawCycle();
          [].forEach.call(wrap.querySelectorAll('.cell, .gate'), function (c) { if (!H[c.dataset.h]) miss[c.dataset.h] = 1; });
          var r = check();
          if (r.overlaps.length || r.under.length || r.noHead.length || r.short.length) bad[ed + '/' + ap.id + '/' + disc] = r;
        });
      });
    });
    Object.assign(I.state, was); I.redraw(); I.refit(); I.drawWires(); I.drawCycle();
    return { bad: bad, missingHints: Object.keys(miss) };
  }

  window.FW = { check: check, checkAll: checkAll };
})();
