/* Рушій шаруватих схем.
 *
 * Схема — це смуги (шари) згори донизу. Усі смуги ділять одну сітку колонок,
 * тому проміжки між колонками («жолоби») вільні від карток на всю висоту
 * полотна. Дроти ходять лише жолобами й проміжками між смугами — так жоден
 * дріт не проходить крізь чужу картку (SCHEMA-PRINCIPLES §7).
 *
 * Координати рахуються з даних щоразу, коли смуга розкривається чи
 * згортається, — геометрію ніхто не малює руками.
 */
(function () {
  const t = (k) => window.I18N.t(k);
  // підпис дроту: слово з copy.csv (api.<id>), а номер API лишається як є
  const apiLabel = (k) => { const v = t('api.' + k); return v === 'api.' + k ? k : v; };
  const SVG = 'http://www.w3.org/2000/svg';
  // рух даних вимикаємо, коли система просить менше анімації
  const reducedMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  const G = {
    left: 176,     // місце під назви смуг
    right: 84,     // праворуч теж жолоб: туди виходять дроти правої колонки
    gap: 100,      // ширина жолоба: тут розходяться паралельні дроти
    top: 18,
    bandGap: 46,   // проміжок між смугами — тут ходять горизонтальні траси
    nodeH: 44,
    keyH: 56,
    stack: 12,
    head: 40,      // рядок заголовків усередині смуги
    pad: 14,
    lane: 9,       // крок розводу вертикальних дротів у жолобі
    hlane: 5,      // крок розводу горизонтальних трас між смугами
  };

  function el(tag, attrs, parent) {
    const n = document.createElementNS(SVG, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* Ламана → шлях зі скругленими кутами. */
  function rounded(pts, r) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
      const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      if (rr < 0.5) { d += ` L${x},${y}`; continue; }
      const ax = x - ((x - px) / l1) * rr, ay = y - ((y - py) / l1) * rr;
      const bx = x + ((nx - x) / l2) * rr, by = y + ((ny - y) / l2) * rr;
      d += ` L${ax},${ay} Q${x},${y} ${bx},${by}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${last[0]},${last[1]}`;
  }

  /* Прибираємо точки, що лежать на одній прямій, і дублікати. */
  function simplify(pts) {
    const out = [];
    for (const p of pts) {
      const q = out[out.length - 1];
      if (q && q[0] === p[0] && q[1] === p[1]) continue;
      out.push(p);
    }
    for (let i = out.length - 2; i > 0; i--) {
      const a = out[i - 1], b = out[i], c = out[i + 1];
      if ((a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1])) out.splice(i, 1);
    }
    return out;
  }

  function create(root, data, opts) {
    opts = Object.assign({ expandable: true, edges: true, expanded: [], context: [], path: null, onPop: null }, opts);
    const W = data.width || 1120;
    const cols = data.cols;
    const colW = (W - G.left - G.right - G.gap * (cols - 1)) / cols;
    const colX = (i) => G.left + i * (colW + G.gap);
    // жолоб g лежить ліворуч від колонки g (g = cols — праворуч від останньої)
    const gutterX = (g) => (g < cols ? colX(g) - G.gap / 2 : colX(cols - 1) + colW + (G.right - 8) / 2);

    const open = new Set(opts.expanded);
    const nodeInfo = {};  // id → {band, col, key}
    data.bands.forEach((b, bi) => {
      (b.groups || []).forEach((g, gi) => {
        g.nodes.forEach((id) => { nodeInfo[id] = { band: bi, col: g.col != null ? g.col : gi, group: g.id }; });
      });
    });

    root.innerHTML = '';
    const fit = document.createElement('div'); fit.className = 'fit';
    const stage = document.createElement('div'); stage.className = 'stage';
    const svg = el('svg', { class: 'wires' });
    const pop = document.createElement('div'); pop.className = 'pop';
    stage.append(svg, pop); fit.append(stage);
    const list = document.createElement('div'); list.className = 'list';
    root.append(fit, list);

    let rects = {}, bandsY = [], H = 0, wires = {}, hot = null, cover = null, pinned = null;
    /* Альтернативні шляхи (data.paths: вузол → шлях, edge.path): вузли іншого
       шляху лишаються на місці тихим контекстом, їхні дроти не малюються —
       геометрія не стрибає (SCHEMA-PRINCIPLES §2). */
    let curPath = opts.path;
    const nodePath = data.paths || {};
    const offNode = (id) => !!curPath && !!nodePath[id] && nodePath[id] !== curPath;

    const isOpen = (bi) => {
      const b = data.bands[bi];
      return !b.expandable || !opts.expandable || open.has(b.id);
    };
    /* Схований вузол представляє підсумкова картка його смуги. */
    const visible = (id) => {
      const inf = nodeInfo[id];
      return isOpen(inf.band) ? id : data.bands[inf.band].id + ':sum';
    };

    /* ── розкладка ─────────────────────────────────────────── */
    function layout() {
      rects = {}; bandsY = [];
      let y = G.top;
      data.bands.forEach((b, bi) => {
        const h = b.strip ? 30 : bandHeight(b);
        bandsY.push({ y, h });
        if (b.strip) { y += h + G.bandGap; return; }

        if (!isOpen(bi)) {
          const sh = 62;
          rects[b.id + ':sum'] = { x: G.left, y: y + (h - sh) / 2, w: W - G.left - G.right, h: sh, band: bi, col: null, sum: true };
        } else {
          const top = y + (hasHeads(b) ? G.head : G.pad), bottom = y + h - G.pad;
          b.groups.forEach((g, gi) => {
            const col = g.col != null ? g.col : gi;
            const hs = g.nodes.map((id) => (data.key.includes(id) ? G.keyH : G.nodeH));
            const total = hs.reduce((a, c) => a + c, 0) + G.stack * (hs.length - 1);
            // вміст центрується, габарит смуги не змінюється (§2)
            let ny = top + (bottom - top - total) / 2;
            g.nodes.forEach((id, i) => {
              rects[id] = { x: colX(col), y: ny, w: colW, h: hs[i], band: bi, col };
              ny += hs[i] + G.stack;
            });
          });
        }
        y += h + G.bandGap;
      });
      H = y - G.bandGap + G.top;
    }
    function hasHeads(b) { return (b.groups || []).some((g) => g.label !== false); }
    function bandHeight(b) {
      const max = Math.max(...b.groups.map((g) =>
        g.nodes.reduce((a, id) => a + (data.key.includes(id) ? G.keyH : G.nodeH), 0) + G.stack * (g.nodes.length - 1)));
      return max + (hasHeads(b) ? G.head : G.pad) + G.pad;
    }

    /* ── траси ─────────────────────────────────────────────── */
    function route(a, b, tracks) {
      const A = rects[a], B = rects[b];
      const cy = (r) => r.y + r.h / 2;
      const off = (key) => {
        const n = (tracks[key] = (tracks[key] || 0) + 1) - 1;
        // дев'ять доріжок по колу: зсув ніколи не виходить за межі жолоба
        const slot = [0, -1, 1, -2, 2, -3, 3, -4, 4][n % 9];
        return slot * (key[0] === 'g' || key[0] === 's' ? G.lane : G.hlane);
      };
      // смуги між двома кінцями, не рахуючи тонкої смуги інтеграції
      const between = (i, j) => {
        for (let k = Math.min(i, j) + 1; k < Math.max(i, j); k++) if (!data.bands[k].strip) return true;
        return false;
      };

      // підсумкова картка на всю ширину: заходимо вертикально навпроти
      // другого кінця — у сусідній смузі між ними нічого немає
      if (A.sum || B.sum) {
        const other = A.sum ? B : A, sum = A.sum ? A : B;
        const down = A.band < B.band;
        if (other.sum || !between(A.band, B.band)) {
          const x = other.sum ? W / 2 + off('sx' + sum.band) : other.x + other.w / 2 + off('sx' + (other.x | 0));
          return [[x, down ? A.y + A.h : A.y], [x, down ? B.y : B.y + B.h]];
        }
        // між ними розкрита смуга: вертикаль ведемо жолобом, а не крізь картки
        // крайній правий жолоб лежить поза підсумковою карткою — тоді беремо лівий
        const right = other.col < cols - 1;
        const g = right ? other.col + 1 : other.col, gx = gutterX(g) + off('g' + g);
        const side = right ? other.x + other.w : other.x;
        const edgeY = sum.band > other.band ? sum.y : sum.y + sum.h;
        return A.sum
          ? [[gx, edgeY], [gx, cy(B)], [side, cy(B)]]
          : [[side, cy(A)], [gx, cy(A)], [gx, edgeY]];
      }

      if (A.band === B.band && A.col === B.col) {
        const g = A.col + 1, gx = gutterX(g) + off('g' + g);
        return [[A.x + A.w, cy(A)], [gx, cy(A)], [gx, cy(B)], [B.x + B.w, cy(B)]];
      }

      if (A.band === B.band) {
        const right = B.col > A.col;
        const gA = right ? A.col + 1 : A.col, gB = right ? B.col : B.col + 1;
        const x0 = right ? A.x + A.w : A.x, x1 = right ? B.x : B.x + B.w;
        const gxA = gutterX(gA) + off('g' + gA);
        if (gA === gB) return [[x0, cy(A)], [gxA, cy(A)], [gxA, cy(B)], [x1, cy(B)]];
        const band = bandsY[A.band], ly = band.y + band.h - 5 - Math.abs(off('bl' + A.band));
        const gxB = gutterX(gB) + off('g' + gB);
        return [[x0, cy(A)], [gxA, cy(A)], [gxA, ly], [gxB, ly], [gxB, cy(B)], [x1, cy(B)]];
      }

      const down = A.band < B.band;
      const outRight = B.col >= A.col;
      const inLeft = A.col < B.col;
      const gA = outRight ? A.col + 1 : A.col;
      const gB = inLeft ? B.col : B.col + 1;
      const x0 = outRight ? A.x + A.w : A.x;
      const x1 = inLeft ? B.x : B.x + B.w;
      const gxA = gutterX(gA) + off('g' + gA);
      if (gA === gB) return [[x0, cy(A)], [gxA, cy(A)], [gxA, cy(B)], [x1, cy(B)]];
      const band = bandsY[A.band];
      const laneKey = 'l' + (down ? A.band : A.band - 1);
      const ly = (down ? band.y + band.h + G.bandGap / 2 : band.y - G.bandGap / 2) + off(laneKey);
      const gxB = gutterX(gB) + off('g' + gB);
      return [[x0, cy(A)], [gxA, cy(A)], [gxA, ly], [gxB, ly], [gxB, cy(B)], [x1, cy(B)]];
    }

    /* ── малювання ─────────────────────────────────────────── */
    function draw() {
      layout();
      stage.style.width = W + 'px';
      stage.style.height = H + 'px';
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = '';
      stage.querySelectorAll('.node').forEach((n) => n.remove());

      const defs = el('defs', {}, svg);
      ['', 'hot', 'past'].forEach((k) => {
        const m = el('marker', { id: mid(k), viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
        el('path', { d: 'M0,0 L8,4 L0,8 z', class: 'arrow' + (k ? ' arrow--' + k : '') }, m);
      });

      // смуги
      data.bands.forEach((b, bi) => {
        const { y, h } = bandsY[bi];
        if (b.strip) {
          el('rect', { x: 10, y, width: W - 20, height: h, rx: 8, class: 'band band--strip' }, svg);
          const tx = el('text', { x: W / 2, y: y + h / 2 + 3.5, 'text-anchor': 'middle', class: 'strip-label' }, svg);
          tx.textContent = t('band.' + b.id);
          return;
        }
        el('rect', { x: 10, y, width: W - 20, height: h, rx: 12, class: 'band' }, svg);
        const canToggle = b.expandable && opts.expandable;
        const holder = canToggle ? el('g', { class: 'band-toggle', tabindex: 0, role: 'button' }, svg) : svg;
        const lab = el('text', { x: 28, y: y + 25, class: 'band-label' }, holder);
        lab.textContent = t('band.' + b.id);
        if (canToggle) {
          const plus = el('text', { x: 28 + lab.getComputedTextLength() + 10, y: y + 25, class: 'band-plus' }, holder);
          plus.textContent = open.has(b.id) ? '–' : '+';
          el('rect', { x: 20, y: y + 8, width: G.left - 30, height: 26, fill: 'transparent' }, holder);
          const toggle = () => api.toggle(b.id);
          holder.addEventListener('click', toggle);
          holder.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        }
        if (isOpen(bi)) {
          b.groups.forEach((g, gi) => {
            if (g.label === false) return;
            const col = g.col != null ? g.col : gi;
            const tx = el('text', { x: colX(col), y: y + 25, class: 'grp-label' }, svg);
            tx.textContent = t('grp.' + g.id);
          });
        }
      });

      // дроти
      wires = {};
      if (opts.edges) {
        const tracks = {}, seen = {};
        data.edges.forEach((e) => {
          if (curPath && e.path && e.path !== curPath) return;
          const a = visible(e.from), b = visible(e.to);
          if (a === b) return;
          const lo = Math.min(rects[a].band, rects[b].band), hi = Math.max(rects[a].band, rects[b].band);
          for (let i = lo + 1; i < hi; i++) if (!data.bands[i].strip && !isOpen(i)) return; // крізь згорнуту смугу не ведемо
          const pair = a + '>' + b;
          if (seen[pair]) { seen[pair].ids.push(e.id); wires[e.id] = seen[pair]; return; }
          const pts = simplify(route(a, b, tracks));
          // id потрібен точкам руху даних: вони йдуть по <mpath>, тобто по цій
          // самій геометрії — жодного другого набору координат
          const path = el('path', { id: root.id + "-w-" + e.id, d: rounded(pts, 9), class: 'wire', 'marker-end': `url(#${mid('')})` }, svg);
          const w = { path, pts, from: a, to: b, ids: [e.id], api: e.api };
          seen[pair] = w; wires[e.id] = w;
        });
      }
      svg.appendChild(el('g', { class: 'labels' }));

      // картки
      Object.entries(rects).forEach(([id, r]) => {
        const n = document.createElement('button');
        n.type = 'button';
        n.className = 'node' + (r.sum ? ' node--sum' : '') + (data.key.includes(id) ? ' node--key' : '') +
          (opts.context.includes(data.bands[r.band].id) ? ' node--ctx' : '') + (offNode(id) ? ' is-off' : '');
        n.dataset.id = id;
        Object.assign(n.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
        const tk = r.sum ? 'band.' + id.split(':')[0] + '.sum' : 'node.' + id;
        n.innerHTML = `<b></b><i></i>`;
        n.querySelector('b').textContent = t(tk + '.t');
        n.querySelector('i').textContent = t(tk + '.s');
        n.addEventListener('mouseenter', () => { chain(id, true); if (!pinned) showPop(id); });
        n.addEventListener('mouseleave', () => { chain(id, false); if (!pinned) hidePop(); });
        n.addEventListener('focus', () => { if (!pinned) showPop(id); });
        n.addEventListener('blur', () => { if (!pinned) hidePop(); });
        n.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (r.sum && opts.expandable) { api.toggle(id.split(':')[0]); return; }
          if (pinned === id) { pinned = null; hidePop(); return; }
          pinned = id; showPop(id, true);
        });
        stage.appendChild(n);
      });

      paint();
      drawList();
      fitScale();
    }

    function mid(k) { return root.id + '-arrow' + (k ? '-' + k : ''); }

    /* Наведення: дроти вузла — сигналом, щоб було видно «звідки й куди». */
    function chain(id, on) {
      if (hot) return;
      Object.values(wires).forEach((w) => {
        if (w.from !== id && w.to !== id) return;
        w.path.classList.toggle('is-chain', on);
        w.path.setAttribute('marker-end', `url(#${mid(on ? 'hot' : '')})`);
      });
      paintLabels(on ? Object.values(wires).filter((w) => w.from === id || w.to === id) : []);
    }

    /* ── хмарка ────────────────────────────────────────────── */
    function showPop(id, pin) {
      const r = rects[id];
      const sum = r.sum;
      const tk = sum ? 'band.' + id.split(':')[0] + '.sum' : 'node.' + id;
      const apis = sum ? [] : [...new Set(data.edges.filter((e) => e.from === id || e.to === id).map((e) => e.api))];
      pop.innerHTML = `<span class="pop__k"></span><span class="pop__t"></span><span class="pop__b"></span>` +
        (apis.length ? `<span class="pop__apis">${apis.map((a) => `<span class="chip">${apiLabel(a)}</span>`).join('')}</span>` : '');
      pop.querySelector('.pop__k').textContent = t(sum ? 'ui.click-expand' : 'band.' + data.bands[r.band].id);
      pop.querySelector('.pop__t').textContent = t(tk + '.t');
      pop.querySelector('.pop__b').textContent = t(tk + '.b');
      stage.querySelectorAll('.node.is-open').forEach((n) => n.classList.remove('is-open'));
      if (pin) stage.querySelector(`.node[data-id="${CSS.escape(id)}"]`).classList.add('is-open');
      pop.classList.toggle('is-pin', !!pin);

      const pw = 290;
      let x = r.x + r.w + 12, y = r.y;
      if (x + pw > W - 8) x = r.x - pw - 12;
      if (x < 8 || sum) { x = Math.min(Math.max(8, r.x + r.w / 2 - pw / 2), W - pw - 8); y = r.y + r.h + 10; }
      pop.style.left = x + 'px';
      pop.style.top = y + 'px';
      pop.classList.add('is-on');
      requestAnimationFrame(() => {
        const ph = pop.offsetHeight;
        if (y + ph > H - 8) pop.style.top = Math.max(8, H - ph - 8) + 'px';
      });
      if (opts.onPop) opts.onPop(id);
    }
    function hidePop() {
      pop.classList.remove('is-on', 'is-pin');
      stage.querySelectorAll('.node.is-open').forEach((n) => n.classList.remove('is-open'));
    }
    document.addEventListener('click', (e) => {
      if (pinned && !pop.contains(e.target)) { pinned = null; hidePop(); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pinned) { pinned = null; hidePop(); } });

    /* ── підсвітка ─────────────────────────────────────────── */
    function paint() {
      stage.classList.toggle('is-flow', !!hot);
      // сценарій-напрям (L4, майбутнє): позначка «майбутнє» на полотні
      stage.classList.toggle('is-future', !!hot && hot.future);
      stage.dataset.future = hot && hot.future ? (hot.level || 'L4') + ' · ' + window.I18N.t('ui.future') : '';
      stage.classList.toggle('is-cover', !!cover);
      stage.querySelectorAll('.node').forEach((n) => {
        const id = n.dataset.id;
        const on = !offNode(id);
        n.classList.toggle('is-hot', on && !!hot && hot.nodes.has(id));
        n.classList.toggle('is-past', on && !!hot && hot.pastNodes.has(id));
        // те, що попереду: не гасимо повністю, інакше не видно, куди шлях веде
        n.classList.toggle('is-next', on && !!hot && !hot.nodes.has(id) &&
          !hot.pastNodes.has(id) && hot.futureNodes.has(id));
        // крок, де рішення за людиною: позначка словом, а не ще одним кольором
        n.classList.toggle('is-human', !!hot && hot.human.has(id));
        // крок, де згоду дає сам клієнт — інше слово, та сама мова позначок
        const isClient = !!hot && hot.client.has(id);
        n.classList.toggle('is-client', isClient);
        n.dataset.badge = t(isClient ? 'ui.client' : 'ui.human');
        n.classList.toggle('is-cover', !!cover && cover.full.includes(id));
        n.classList.toggle('is-part', !!cover && (cover.part || []).includes(id));
      });
      const labelled = [];
      Object.values(wires).forEach((w) => {
        const isHot = !!hot && w.ids.some((i) => hot.edges.has(i));
        const isPast = !!hot && !isHot && w.ids.some((i) => hot.pastEdges.has(i));
        const isNext = !!hot && !isHot && !isPast && w.ids.some((i) => hot.futureEdges.has(i));
        w.path.classList.toggle('is-hot', isHot);
        w.path.classList.toggle('is-past', isPast);
        w.path.classList.toggle('is-next', isNext);
        w.path.setAttribute('marker-end', `url(#${mid(isHot ? 'hot' : isPast ? 'past' : '')})`);
        if (isHot) labelled.push(w);
      });
      paintLabels(labelled);
      paintDots(Object.values(wires).filter((w) => w.path.classList.contains('is-hot')));
      list.querySelectorAll('.list__node').forEach((n) => {
        const id = n.dataset.id;
        n.classList.toggle('is-hot', !!hot && hot.nodes.has(id));
        n.classList.toggle('is-dim', (!!hot && !hot.nodes.has(id) && !hot.pastNodes.has(id)) ||
          (!!cover && !cover.full.includes(id) && !(cover.part || []).includes(id)));
      });
    }

    /* Рух даних дротом: точка їде по <mpath> того самого <path>, що вже
       намальовано, — від вузла-джерела до вузла-приймача (напрямок задає
       сама геометрія). Кілька дротів одного кроку стартують по черзі, тому
       видно послідовність. За prefers-reduced-motion CSS ховає точки. */
    function paintDots(ws) {
      let g = svg.querySelector('.dots');
      if (!g) g = el('g', { class: 'dots' }, svg);
      else svg.appendChild(g);           // тримаємо шар поверх дротів і підписів
      g.innerHTML = '';
      const off = reducedMotion();
      // дроти, які вже не в кроці, повертаються до звичайного вигляду
      Object.values(wires).forEach((w) => {
        if (ws.includes(w)) return;
        w.path.style.transition = ''; w.path.style.strokeDasharray = ''; w.path.style.strokeDashoffset = '';
      });
      if (!hot) return;
      ws.forEach((w, i) => {
        let len = 0;
        try { len = w.path.getTotalLength(); } catch (e) { len = 0; }
        // дріт кроку промальовується від джерела до приймача (механіка DWH)
        if (len > 4 && !off) {
          const p = w.path;
          p.style.transition = 'none';
          p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
          p.getBoundingClientRect();     // примусовий reflow перед стартом
          p.style.transition = `stroke-dashoffset .42s linear ${(i * 0.3).toFixed(2)}s`;
          p.style.strokeDashoffset = 0;
        } else {
          w.path.style.transition = ''; w.path.style.strokeDasharray = ''; w.path.style.strokeDashoffset = '';
        }
        if (len < 12 || off) return;
        const dur = Math.min(2.4, Math.max(0.9, len / 260));
        const c = el('circle', { r: 3.5, class: 'dot dot--hot' }, g);
        const m = el('animateMotion', {
          dur: dur.toFixed(2) + 's', begin: (i * 0.35).toFixed(2) + 's',
          repeatCount: 'indefinite', rotate: 'auto',
        }, c);
        const mp = el('mpath', { href: '#' + w.path.id }, m);
        mp.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + w.path.id);
      });
    }

    /* Номер API — на найдовшому відрізку дроту, щоб не сідав на кут. */
    function paintLabels(ws) {
      const g = svg.querySelector('g.labels');
      if (!g) return;
      g.innerHTML = '';
      ws.forEach((w) => {
        let best = null;
        for (let i = 0; i < w.pts.length - 1; i++) {
          const [x1, y1] = w.pts[i], [x2, y2] = w.pts[i + 1];
          const len = Math.hypot(x2 - x1, y2 - y1);
          if (!best || len > best.len) best = { len, x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
        }
        const tx = el('text', { x: best.x, y: best.y + 3.5, 'text-anchor': 'middle', class: 'api' });
        tx.textContent = apiLabel(w.api);
        g.appendChild(tx);
        const bb = tx.getBBox();
        el('rect', { x: bb.x - 4, y: bb.y - 2, width: bb.width + 8, height: bb.height + 4, rx: 4, class: 'api-bg' }, g);
        g.appendChild(tx);
      });
    }

    /* ── вузька розкладка: стрічка з тих самих даних ───────── */
    function drawList() {
      list.innerHTML = '';
      data.bands.forEach((b) => {
        if (b.strip) {
          const s = document.createElement('div'); s.className = 'list__strip';
          s.textContent = '↕ ' + t('band.' + b.id); list.appendChild(s); return;
        }
        const box = document.createElement('div'); box.className = 'list__band';
        box.innerHTML = `<span class="kicker"></span>`;
        box.firstChild.textContent = t('band.' + b.id);
        b.groups.forEach((g) => {
          const gb = document.createElement('div'); gb.className = 'list__grp';
          if (g.label !== false) { gb.innerHTML = `<span class="kicker"></span>`; gb.firstChild.textContent = t('grp.' + g.id); }
          g.nodes.forEach((id) => {
            const n = document.createElement('button');
            n.type = 'button'; n.className = 'list__node'; n.dataset.id = id;
            n.innerHTML = '<b></b><p></p>';
            n.querySelector('b').textContent = t('node.' + id + '.t');
            n.querySelector('p').textContent = t('node.' + id + '.b');
            n.addEventListener('click', () => n.classList.toggle('on'));
            gb.appendChild(n);
          });
          box.appendChild(gb);
        });
        list.appendChild(box);
      });
    }

    function fitScale() {
      const fw = fit.clientWidth || W;
      // opts.maxH() — необов'язкова межа висоти (px), напр. щоб схема влізла в екран разом зі сценарієм
      const cap = opts.maxH ? opts.maxH() : 0;
      const s = Math.min(1, fw / (W + 2), cap > 0 ? cap / (H + 2) : 1);
      const dx = cap > 0 ? Math.max(0, (fw - W * s) / 2) : 0; // центруємо лише стиснуту схему
      stage.style.transform = `translateX(${dx}px) scale(${s})`;
      fit.style.height = Math.ceil(H * s + 2) + 'px';
    }
    window.addEventListener('resize', fitScale);

    const api = {
      data, stage,
      render: draw,
      fit: fitScale,
      toggle(id) {
        open.has(id) ? open.delete(id) : open.add(id);
        pinned = null; hidePop(); draw();
      },
      collapse(ids) {
        let changed = false;
        ids.forEach((id) => { if (open.has(id)) { open.delete(id); changed = true; } });
        if (changed) { pinned = null; hidePop(); draw(); }
      },
      isOpen(id) { return open.has(id); },
      expand(ids) {
        let changed = false;
        ids.forEach((id) => { if (!open.has(id)) { open.add(id); changed = true; } });
        if (changed) draw();
      },
      /* Крок сценарію: поточні вузли/дроти — сигнал, попередні — чорнило. */
      highlight(step) {
        if (!step) { hot = null; paint(); return; }
        hot = {
          nodes: new Set(step.nodes), edges: new Set(step.edges),
          pastNodes: new Set(step.pastNodes || []), pastEdges: new Set(step.pastEdges || []),
          // те, що попереду в цьому ж сценарії — щоб шлях було видно цілком
          futureNodes: new Set(step.futureNodes || []), futureEdges: new Set(step.futureEdges || []),
          human: new Set(step.human || []),
          future: !!step.future,
          client: new Set(step.client || []),
        };
        paint();
      },
      cover(c) { cover = c; paint(); },
      setPath(p) { if (p === curPath) return; curPath = p; pinned = null; hidePop(); draw(); },
      get path() { return curPath; },

      /* Перевірки геометрії (SCHEMA-PRINCIPLES §11): накладання карток,
         кінці дротів на межах своїх карток, вільні жолоби. */
      check() {
        const out = { overlaps: [], loose: [], gutter: [] };
        const ids = Object.keys(rects);
        for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
          const a = rects[ids[i]], b = rects[ids[j]];
          if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) out.overlaps.push(ids[i] + '×' + ids[j]);
        }
        const onEdge = ([x, y], r) => {
          const inX = x >= r.x - 0.5 && x <= r.x + r.w + 0.5, inY = y >= r.y - 0.5 && y <= r.y + r.h + 0.5;
          const onV = Math.abs(x - r.x) < 0.5 || Math.abs(x - r.x - r.w) < 0.5;
          const onH = Math.abs(y - r.y) < 0.5 || Math.abs(y - r.y - r.h) < 0.5;
          return inX && inY && (onV || onH);
        };
        new Set(Object.values(wires)).forEach((w) => {
          if (!onEdge(w.pts[0], rects[w.from]) || !onEdge(w.pts[w.pts.length - 1], rects[w.to])) out.loose.push(w.ids.join(','));
          // проміжні відрізки не мають перетинати жодну картку
          for (let i = 1; i < w.pts.length - 2; i++) {
            const [x1, y1] = w.pts[i], [x2, y2] = w.pts[i + 1];
            ids.forEach((id) => {
              const r = rects[id];
              const minx = Math.min(x1, x2), maxx = Math.max(x1, x2), miny = Math.min(y1, y2), maxy = Math.max(y1, y2);
              if (maxx > r.x + 1 && minx < r.x + r.w - 1 && maxy > r.y + 1 && miny < r.y + r.h - 1) out.gutter.push(w.ids.join(',') + '→' + id);
            });
          }
        });
        return out;
      },
      snapshot() { return JSON.stringify(rects); },
    };

    draw();
    return api;
  }

  window.Diagram = { create };
})();
