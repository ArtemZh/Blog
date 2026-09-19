/* Дві схеми розділу 15. Спільний конструктор SVG, різні кадри:
     A — процес feature request у продукті (з домашки Busy Bar, як є);
     B — життєвий цикл продукту, проєкти всередині нього і той із них,
         що віддається вендору: звідти й починається аутсорсова доставка.
   Геометрія рахується з даних, тому текст можна міняти й перекладати. */
(function () {
  var B = window.BRIDGE;
  if (!B) return;
  var NS = 'http://www.w3.org/2000/svg';
  var EN = window.PMP_LANG === 'en';

  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function svgFor(host, vb, label) {
    var s = el('svg', { viewBox: vb, role: 'img', 'aria-label': label });
    var defs = el('defs', {});
    var mk = el('marker', { id: 'bh' + host.id, viewBox: '0 0 10 10', refX: 9, refY: 5,
                            markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
    mk.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'currentColor' }));
    defs.appendChild(mk); s.appendChild(defs);
    var g = el('g', { fill: 'currentColor' });
    s.appendChild(g); host.appendChild(s);
    return { g: g, head: 'url(#bh' + host.id + ')' };
  }
  /* плашка: назва, що там відбувається, хто власник */
  function box(g, x, y, w, h, p, cls) {
    g.appendChild(el('rect', { class: 'bx' + (cls ? ' ' + cls : ''), x: x, y: y, width: w, height: h, rx: 8, 'stroke-width': 1 }));
    g.appendChild(el('text', { x: x + w / 2, y: y + 21, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600 }, p.t));
    if (p.s) g.appendChild(el('text', { class: 'mu', x: x + w / 2, y: y + 39, 'text-anchor': 'middle', 'font-size': 10 }, p.s));
    if (p.o) g.appendChild(el('text', { class: 'mu', x: x + w / 2, y: y + 57, 'text-anchor': 'middle', 'font-size': 10.5 }, p.o));
  }
  function bandLine(g, y, w, label) {
    g.appendChild(el('line', { class: 'rl', x1: 0, y1: y, x2: w, y2: y, 'stroke-width': 1, 'stroke-dasharray': '2 6' }));
    if (label) g.appendChild(el('text', { class: 'mu lane', x: 0, y: y + 24, 'font-size': 9.5 }, label));
  }

  /* ── A. процес feature request ─────────────────────────────────── */
  var hostA = document.getElementById('flow');
  if (hostA) {
    var F = B.flow, W = 124, GAP = 8, X0 = 54, TOTAL = X0 + F.stages.length * (W + GAP);
    var A = svgFor(hostA, '-34 -30 ' + (TOTAL + 30) + ' 451',
      EN ? 'Feature request process: stages, three gates, three returns'
         : 'Процес feature request: етапи, три гейти, три повернення');
    var g = A.g, idxA = {};
    F.stages.forEach(function (s, i) { idxA[s.id] = i; });
    function xA(id) { return X0 + idxA[id] * (W + GAP); }
    function cA(id) { return xA(id) + W / 2; }

    bandLine(g, 108, TOTAL - 20, F.bands.gt);
    bandLine(g, 192, TOTAL - 20, F.bands.rt);
    g.appendChild(el('text', { class: 'mu lane', x: 0, y: 52, 'font-size': 9.5 }, F.bands.st));

    F.stages.forEach(function (p, i) {
      box(g, xA(p.id), 24, W, 70, p);
      if (i < F.stages.length - 1) {
        var x1 = xA(p.id) + W, x2 = xA(F.stages[i + 1].id);
        g.appendChild(el('line', { x1: x1 + 2, y1: 59, x2: x2 - 4, y2: 59, stroke: 'currentColor',
                                   'stroke-width': 1.5, 'marker-end': A.head }));
      }
    });
    F.gates.forEach(function (gt) {
      var x = cA(gt.under);
      g.appendChild(el('line', { class: 'am', x1: x, y1: 94, x2: x, y2: 118, 'stroke-width': 1.5, 'marker-end': A.head }));
      g.appendChild(el('rect', { class: 'gt', x: x - 90, y: 122, width: 180, height: 52, rx: 26,
                                 'stroke-width': 1, 'stroke-opacity': .55 }));
      g.appendChild(el('text', { class: 'amf', x: x, y: 143, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600 }, gt.t));
      g.appendChild(el('text', { class: 'mu', x: x, y: 161, 'text-anchor': 'middle', 'font-size': 10.5 }, gt.s));
    });
    /* повернення: три доріжки різної глибини, щоб лінії не злипались */
    var RET_Y = [232, 286, 352];
    F.returns.forEach(function (r) {
      var x1 = cA(r.from), x2 = cA(r.to), y = RET_Y[r.lane];
      var toGate = F.gates.some(function (gt) { return gt.under === r.to; });
      /* Якщо під етапом стоїть гейт, повернення виходить із гейта, а не з
         плашки: баг на прийманні знаходять саме на гейті. Так було в оригіналі. */
      var fromGate = F.gates.some(function (gt) { return gt.under === r.from; });
      var yStart = fromGate ? 174 : 94;
      var yEnd = toGate ? 180 : 100;
      g.appendChild(el('path', { class: r.kind, 'stroke-width': 1.4, fill: 'none', 'stroke-dasharray': '5 4',
                                 'marker-end': A.head,
                                 d: 'M' + x1 + ' ' + yStart + ' V' + y + ' H' + x2 + ' V' + yEnd }));
      var mid = (x1 + x2) / 2;
      g.appendChild(el('text', { class: 'mu halo', x: mid, y: y + 18, 'text-anchor': 'middle', 'font-size': 10.5 }, r.t1));
      g.appendChild(el('text', { class: 'mu halo', x: mid, y: y + 31, 'text-anchor': 'middle', 'font-size': 10.5 }, r.t2));
    });
  }

  /* ── B. життєвий цикл продукту на часовій осі ───────────────────
     Вісь X — час, тому смуги мають різну довжину: проєкт триває стільки,
     скільки триває, а не одну клітинку. Вендорська доріжка стоїть на тій
     самій осі: видно, що пресейл починається ще до старту проєкту, а
     гарантія тягнеться після приймання. */
  var hostB = document.getElementById('plc');
  if (hostB) {
    var P = B.plc;
    var X0 = 96, XW = 880;                        /* поле часової осі */
    var Y_AX = 16;                                 /* підписи кварталів */
    var Y_PH = 40,  H_PH = 46;
    var Y_PR = 132, H_PR = 44, H_PLC = 84, PR_GAP = 12;        /* кожен проєкт своїм рядком */
    var Y_VN, H_VN = 44;
    var rows = P.projects.length;
    function hOf(pr) { return pr.plc ? H_PLC : H_PR; }
    var yOf = [], acc = Y_PR;
    P.projects.forEach(function (pr) { yOf.push(acc); acc += hOf(pr) + PR_GAP; });
    Y_VN = acc + 54;
    var HEIGHT = Y_VN + H_VN + 74;

    function X(t) { return X0 + (t / P.span) * XW; }

    var S = svgFor(hostB, '-34 -14 ' + (X0 + XW + 60) + ' ' + (HEIGHT + 20),
      EN ? 'Product life cycle on a time axis, projects of different length and the vendor lane'
         : 'Життєвий цикл продукту на часовій осі, проєкти різної тривалості і доріжка вендора');
    var q = S.g;

    /* сітка кварталів */
    P.axis.forEach(function (a) {
      q.appendChild(el('line', { class: 'rl', x1: X(a.at), y1: Y_AX + 6, x2: X(a.at), y2: HEIGHT - 46,
                                 'stroke-width': 1, 'stroke-dasharray': '2 6' }));
      q.appendChild(el('text', { class: 'mu', x: X(a.at) + 4, y: Y_AX, 'font-size': 9.5 }, a.t));
    });

    function band(y, label) {
      q.appendChild(el('text', { class: 'mu lane', x: 0, y: y + 16, 'font-size': 9.5 }, label));
    }
    band(Y_PH, P.bands.plc);
    band(Y_PR, P.bands.prj);
    band(Y_VN, P.bands.ven);

    /* смуга: заголовок усередині, підзаголовок — якщо вміщується */
    var narrowIdx = 0;
    function bar(x, y, w, h, p, cls, small) {
      q.appendChild(el('rect', { class: 'bx ' + cls, x: x, y: y, width: w, height: h, rx: 7, 'stroke-width': 1 }));
      var cx = x + w / 2;
      if (w < 66) {
        /* короткі етапи підписуємо під смугою, через рядок: інакше «Приймання»
           і «Гарантія» налазять одне на одне */
        var dy = (narrowIdx++ % 2) ? 26 : 13;
        q.appendChild(el('text', { class: 'mu', x: cx, y: y + h + dy, 'text-anchor': 'middle', 'font-size': 9.5 }, p.t));
        return;
      }
      q.appendChild(el('text', { x: cx, y: y + (p.s && w > 150 ? 19 : (cls === 'prj' || cls === 'vend' ? 18 : h / 2 + 4)),
                                 'text-anchor': 'middle', 'font-size': small ? 11.5 : 12.5, 'font-weight': 600 }, p.t));
      if (p.s && w > 150) {
        q.appendChild(el('text', { class: 'mu', x: cx, y: y + 34, 'text-anchor': 'middle', 'font-size': 10 }, p.s));
      }
    }

    P.phases.forEach(function (ph) {
      bar(X(ph.from), Y_PH, X(ph.to) - X(ph.from) - 3, H_PH, ph, 'ph');
    });

    var vendProj = null, vendY = 0;
    P.projects.forEach(function (pr, i) {
      var y = yOf[i], h = hOf(pr);
      var x = X(pr.from), w = X(pr.to) - X(pr.from) - 3;
      bar(x, y, w, h, pr.plc ? { t: pr.t } : pr, pr.vendor ? 'vend' : 'prj');
      /* один проєкт розкритий: усередині його власні фази, лише сірими плашками */
      if (pr.plc) {
        q.appendChild(el('text', { class: 'mu', x: X(pr.to) + 14, y: y + h / 2 + 4, 'font-size': 9.5 }, '↑ ' + P.plcNote));
        var top = y + 28, ih = h - 36, gap = 4;
        pr.plc.forEach(function (ph, k) {
          var px = X(ph.from) + (k ? gap / 2 : 6), pw = X(ph.to) - X(ph.from) - (k ? gap : 6 + gap / 2);
          if (k === pr.plc.length - 1) pw = x + w - 6 - px;
          var rows = ph.t2 ? [ph.t, ph.t2] : [ph.t], rh = ph.t2 ? (ih - 3) / 2 : ih;
          rows.forEach(function (label, r) {
            var ry = top + r * (rh + 3);
            q.appendChild(el('rect', { class: 'pl', x: px, y: ry, width: pw, height: rh, rx: 5, 'stroke-width': 1 }));
            q.appendChild(el('text', { class: 'plt', x: px + pw / 2, y: ry + rh / 2 + 3.5, 'text-anchor': 'middle',
                                       'font-size': 8.5, 'font-weight': 600 }, label));
          });
        });
      }
      if (pr.vendor) { vendProj = pr; vendY = y; }
    });

    if (vendProj) {
      var vy = Y_VN;
      P.vendor.forEach(function (v) {
        bar(X(v.from), vy, X(v.to) - X(v.from) - 3, H_VN, v, 'ven', true);
      });
      /* передача обсягу: вниз у момент старту проєкту */
      var xd = X(vendProj.from) + 12;
      q.appendChild(el('path', { class: 'am', 'stroke-width': 1.6, fill: 'none', 'marker-end': S.head,
                                 d: 'M' + xd + ' ' + (vendY + hOf(vendProj)) + ' V' + (vy - 4) }));
      q.appendChild(el('text', { class: 'amf halo', x: xd + 8, y: (vendY + hOf(vendProj) + vy) / 2 + 4,
                                 'font-size': 10.5, 'font-weight': 600 }, P.down));
      /* інкремент назад у продукт: після приймання */
      var xu = X(P.vendor[3].to) - 6;
      q.appendChild(el('path', { class: 'am', 'stroke-width': 1.6, fill: 'none', 'marker-end': S.head,
                                 d: 'M' + xu + ' ' + vy + ' V' + (vendY + hOf(vendProj) + 4) }));
      q.appendChild(el('text', { class: 'amf halo', x: xu + 8, y: vy - 14, 'font-size': 10.5, 'font-weight': 600 }, P.up));
      q.appendChild(el('text', { class: 'mu', x: 0, y: vy + H_VN + 26, 'font-size': 10 }, P.note13));
    }
  }

  /* таблиця PMI і блок вимог */
  var t = document.getElementById('pmi');
  if (t) {
    t.innerHTML = '<tr><th>' + (EN ? 'PMI area' : 'Область PMI') + '</th><th>' +
      (EN ? 'Enterprise form' : 'Ентерпрайз-форма') + '</th><th>' + (EN ? 'Our form' : 'Наша форма') + '</th></tr>' +
      B.pmi.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('');
  }
  var rq = document.getElementById('reqs');
  if (rq) {
    rq.innerHTML = B.reqs.items.map(function (r) {
      return '<div class="req"><h4>' + r[0] + '</h4><p>' + r[1] + '</p></div>';
    }).join('');
  }
  var rn = document.getElementById('reqs-note');
  if (rn) rn.textContent = B.reqs.note;
})();
