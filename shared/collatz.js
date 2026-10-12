/* Стаття 29 «Задача 3n+1»: усе, крім 3D. Геометрія схем рахується з даних
   (SCHEMA-PRINCIPLES §4), дерево перевіряється скриптом COLLATZ.check() (§11).
   Спільне число сторінки: COLLATZ.n (BigInt), подія document 'collatz:n'. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const SVG = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent, text) => {
    const n = document.createElementNS(SVG, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  const fmt = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const seg = (root, cb) => {
    $$('button', root).forEach((b) => b.addEventListener('click', () => {
      $$('button', root).forEach((x) => x.classList.toggle('on', x === b)); cb(b.dataset.v);
    }));
  };

  /* ── ядро ─────────────────────────────────────────────────── */
  const MAX_STEPS = 20000;
  function orbit(n, mul) {               // BigInt-траєкторія до 1 (або до ліміту)
    const m = BigInt(mul || 3), out = [n];
    const seen = mul && mul !== 3 ? new Set([n]) : null;
    while (n !== 1n && out.length <= MAX_STEPS) {
      n = n % 2n === 0n ? n / 2n : m * n + 1n;
      out.push(n);
      if (seen) { if (seen.has(n) || out.length > 400) break; seen.add(n); }
    }
    return out;
  }
  const log2 = (b) => { const s = b.toString(2); return s.length - 1 + Math.log2(Number('0b' + s.slice(0, 52)) / 2 ** (Math.min(52, s.length) - 1)); };
  const big10 = (b) => { const s = b.toString(); return s.length <= 15 ? fmt(s) : s[0] + ',' + s.slice(1, 3) + ' × 10^' + (s.length - 1); };

  // Кроки й піки для всіх чисел до N — з пам'яттю, звичайними числами (пік < 2^53 для N ≤ 10^5).
  const tableCache = {};
  function table(N) {
    if (tableCache[N]) return tableCache[N];
    const steps = new Int32Array(N + 1), peak = new Float64Array(N + 1);
    peak[1] = 1;
    for (let s = 2; s <= N; s++) {
      let n = s, c = 0, p = s;
      while (n >= s && n !== 1) { n = n % 2 ? 3 * n + 1 : n / 2; c++; if (n > p) p = n; }
      steps[s] = c + steps[n]; peak[s] = Math.max(p, peak[n]);
    }
    return (tableCache[N] = { steps, peak });
  }

  /* ── спільне число ────────────────────────────────────────── */
  const state = { n: 27n };
  function parseN(v) { v = String(v).replace(/[\s _,.]/g, ''); if (!/^\d{1,40}$/.test(v)) return null; const b = BigInt(v); return b >= 1n ? b : null; }
  function setN(b, from) {
    state.n = b;
    $$('.n-in').forEach((i) => { if (i !== from) i.value = b.toString(); i.style.borderColor = ''; });
    document.dispatchEvent(new CustomEvent('collatz:n', { detail: b }));
  }
  $$('.n-in').forEach((i) => i.addEventListener('input', () => {
    const b = parseN(i.value);
    if (b) setN(b, i); else i.style.borderColor = 'var(--signal-ink)';
  }));

  /* ── 01 «град» ────────────────────────────────────────────── */
  const hail = { scale: 'lin', orb: [] };
  [6, 7, 26, 27, 97, 871, 6171].forEach((v) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chipbtn'; b.textContent = v; b.dataset.n = v;
    b.addEventListener('click', () => setN(BigInt(v))); $('#quick').appendChild(b); $('#quick').append(' ');
  });
  $('#rnd').addEventListener('click', () => setN(BigInt(2 + Math.floor(Math.random() * 99998))));
  seg($('#scale'), (v) => { hail.scale = v; drawHail(); });

  function drawHail() {
    const o = (hail.orb = orbit(state.n)), svg = $('#hail');
    svg.innerHTML = '';
    const W = 960, H = 320, L = 64, R = 18, T = 22, B = 34;
    const lg = o.map(log2), mxL = Math.max(...lg, 1);
    const pk = lg.indexOf(mxL), mxB = o[pk];
    const big = mxB > BigInt(Number.MAX_SAFE_INTEGER);
    const useLog = hail.scale === 'log' || big;
    const val = (i) => (useLog ? lg[i] : Number(o[i])), mx = useLog ? mxL : Number(mxB);
    const X = (i) => L + (o.length > 1 ? i / (o.length - 1) : 0) * (W - L - R);
    const Y = (v) => H - B - (v / (mx || 1)) * (H - T - B);
    for (let k = 0; k <= 4; k++) {                       // сітка
      const v = mx * k / 4, y = Y(v);
      el('line', { x1: L, x2: W - R, y1: y, y2: y, stroke: css('--rule'), 'stroke-width': 1 }, svg);
      const lab = useLog ? (k === 0 ? '1' : '2^' + Math.round(v)) : fmt(Math.round(v));
      el('text', { x: L - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: css('--ink-3'), 'font-family': 'Roboto Mono, monospace' }, svg, lab);
    }
    [0, Math.round((o.length - 1) / 2), o.length - 1].filter((v, i, a) => a.indexOf(v) === i).forEach((i) =>
      el('text', { x: X(i), y: H - 10, 'text-anchor': 'middle', 'font-size': 11, fill: css('--ink-3'), 'font-family': 'Roboto Mono, monospace' }, svg, i));
    let d = '';
    o.forEach((_, i) => { d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(val(i)).toFixed(1); });
    el('path', { d, fill: 'none', stroke: css('--ink'), 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, svg);
    if (o.length <= 130) o.forEach((v, i) => {
      const odd = v % 2n === 1n;
      el('circle', { cx: X(i), cy: Y(val(i)), r: 3.2, fill: odd ? css('--ink') : css('--ground'), stroke: css('--ink'), 'stroke-width': 1.2 }, svg);
    });
    el('circle', { cx: X(pk), cy: Y(val(pk)), r: 6, fill: 'none', stroke: css('--act'), 'stroke-width': 2.5 }, svg);
    el('text', { x: Math.min(W - R - 4, X(pk) + 10), y: Math.max(T - 6, Y(val(pk)) - 9), 'font-size': 12, 'font-weight': 600, fill: css('--act'),
      'text-anchor': X(pk) > W - 160 ? 'end' : 'start', 'font-family': 'Roboto Mono, monospace' }, svg, big10(mxB));
    hail.geom = { X, Y, val, L, R, W, H, T, B };
    el('line', { id: 'hailCur', x1: 0, x2: 0, y1: T, y2: H - B, stroke: css('--act'), 'stroke-width': 1, opacity: 0 }, svg);

    const oddN = o.filter((v) => v % 2n === 1n && v !== 1n).length, done = o[o.length - 1] === 1n;
    $('#tryStats').innerHTML = [
      [done ? fmt(o.length - 1) : '> ' + fmt(MAX_STEPS), 'кроків до одиниці'],
      [fmt(oddN), 'з них кроків «3n + 1»'],
      [big10(mxB), 'найвища точка, крок ' + pk],
      ['× ' + (mxB / state.n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), 'у стільки разів пік більший за старт'],
    ].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('');
    const sq = $('#seq'); sq.innerHTML = '';
    const lim = 140;
    o.slice(0, lim).forEach((v, i) => { const s = document.createElement('span'); s.textContent = v.toString().length > 18 ? big10(v) : fmt(v); if (v % 2n === 1n) s.className = 'o'; if (i === pk) s.classList.add('pk'); sq.appendChild(s); });
    if (o.length > lim) { const e = document.createElement('em'); e.textContent = '… ще ' + fmt(o.length - lim) + ' чисел до одиниці'; sq.appendChild(e); }
  }
  (function hailHover() {
    const svg = $('#hail'), tip = $('#hailTip');
    svg.addEventListener('mousemove', (e) => {
      const g = hail.geom, o = hail.orb; if (!g) return;
      const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * g.W;
      const i = Math.max(0, Math.min(o.length - 1, Math.round((x - g.L) / (g.W - g.L - g.R) * (o.length - 1))));
      const c = $('#hailCur'); c.setAttribute('x1', g.X(i)); c.setAttribute('x2', g.X(i)); c.setAttribute('opacity', .6);
      tip.style.display = 'block'; tip.innerHTML = `крок ${i}: <b>${o[i].toString().length > 24 ? big10(o[i]) : fmt(o[i])}</b>`;
      const fr = svg.parentNode.getBoundingClientRect();
      tip.style.left = Math.max(70, Math.min(fr.width - 70, g.X(i) / g.W * r.width + r.left - fr.left)) + 'px';
      tip.style.top = (g.Y(g.val(i)) / g.H * r.height + r.top - fr.top) + 'px';
    });
    svg.addEventListener('mouseleave', () => { tip.style.display = 'none'; const c = $('#hailCur'); if (c) c.setAttribute('opacity', 0); });
  })();

  /* ── 02 хронологія ────────────────────────────────────────── */
  const KINDS = { name: 'люди й назви', proof: 'доведено', calc: 'обчислення', prize: 'призи' };
  const TL = [
    ['1932', 'name', 'Зошит Коллатца', 'Студент Лотар Коллатц цікавиться функціями на цілих числах. Перший запис про цю функцію в його зошиті датовано 1 липня 1932 року.'],
    ['1937', 'name', 'Рік, який зазвичай називають датою задачі', 'Через два роки після захисту дисертації. Сам Коллатц тоді нічого про задачу не надрукував.'],
    ['1950', 'name', 'Конгрес у Кембриджі', 'Коллатц розповідає про задачу на Міжнародному конгресі математиків у Кембриджі, штат Массачусетс. Далі вона поширюється усно.'],
    ['1952', 'name', 'Браян Туейтс', 'Англійський математик незалежно натрапляє на ту саму задачу. Згодом він призначить за розв\'язок 1000 фунтів.'],
    ['1950-ті', 'name', 'Гассе і Сиракузи', 'Гельмут Гассе обговорює узагальнення з багатьма колегами — звідси «алгоритм Гассе». Після візиту до Сиракузького університету він пропонує назву «сиракузька задача».'],
    ['≈1960', 'name', 'Какутані в Єлі', 'Сідзуо Какутані чує задачу й поширює її далі. Він згадував: <q>Близько місяця всі в Єлі працювали над нею — без результату</q>. Тоді ж народився жарт, що задача є частиною змови, аби загальмувати математичні дослідження у США.'],
    ['1960-ті', 'name', 'Улам у Лос-Аламосі', 'Станіслав Улам розповідає про задачу в Лос-Аламосі та інших місцях; у деяких колах її називають «задачею Улама».'],
    ['1970', 'prize', '50 доларів від Коксетера', 'Гарольд Коксетер призначає перший відомий приз за розв\'язок.'],
    ['1972', 'proof', 'Конвей: узагальнення нерозв\'язне', 'Джон Конвей доводить, що для природного узагальнення задачі не існує алгоритму, який завжди визначає, чи дійде число до одиниці.'],
    ['1976', 'proof', 'Террас: майже всі числа спускаються', 'Ріхо Террас доводить, що майже кожне натуральне число колись стає меншим за стартове: частка таких чисел дорівнює 1.'],
    ['1977', 'proof', 'Штайнер: найпростіших циклів немає', 'Р. П. Штайнер доводить, що не існує циклу з одним «підйомом і спуском», крім відомого 1 → 4 → 2 → 1.'],
    ['1984', 'name', '«Числа-градини» в Scientific American', 'Браян Гейз публікує популярну статтю про злети й падіння чисел-градин; назва закріплюється поза математичною спільнотою.'],
    ['1985', 'name', 'Огляд Лагаріаса', 'Джеффрі Лагаріас збирає історію задачі та всі відомі результати в одній статті. Більшість історичних відомостей на цій сторінці — звідти.'],
    ['до 1985', 'prize', '500 доларів від Ердеша', 'Пал Ердеш призначає власний приз і каже: <q>Математика, можливо, ще не готова до таких задач</q>.'],
    ['1993', 'proof', 'Еліаху: цикл був би величезним', 'Шалом Еліаху доводить, що довжина будь-якого іншого циклу — щонайменше 17 087 915.'],
    ['2003', 'proof', 'Красіков і Лагаріас', 'Серед чисел від 1 до x щонайменше x<sup>0,84</sup> доходять до одиниці. Доказ зроблено з допомогою комп\'ютера.'],
    ['2005', 'proof', 'Сімонс і де Вегер', 'Немає циклів, що складаються з 68 або менше «підйомів і спусків».'],
    ['2007', 'proof', 'Курц і Саймон', 'Посилюють результат Конвея: нерозв\'язним є й питання «чи кожне число доходить до одиниці» для узагальнених правил.'],
    ['2009', 'calc', 'Розподілені обчислення', 'На платформі BOINC стартує проєкт Collatz Conjecture: добровольці перевіряють числа на власних комп\'ютерах.'],
    ['2019', 'proof', 'Теренс Тао', 'Майже всі траєкторії опускаються нижче будь-якої функції від стартового числа, що росте до нескінченності. Найсильніший результат за десятиліття; опубліковано 2022 року.'],
    ['2020', 'calc', 'Перевірено до 2<sup>68</sup>', 'Давид Барина з Технічного університету в Брно перевіряє всі числа до 2<sup>68</sup>.'],
    ['2023', 'proof', 'Герхер', 'Немає циклів, що складаються з 91 або менше «підйомів і спусків».'],
    ['2025', 'calc', 'Перевірено до 2<sup>71</sup>', 'Барина піднімає межу до 2<sup>71</sup> ≈ 2,36 × 10<sup>21</sup>. Обчислення розподілено між тисячами процесів на кількох європейських суперкомп\'ютерах.'],
  ];
  (function timeline() {
    const ol = $('#tl'), bar = $('#tlFilter'); let cur = null;
    TL.forEach(([y, k, t, b]) => { const li = document.createElement('li'); li.dataset.k = k;
      li.innerHTML = `<span class="y">${y}</span><span class="dot"></span><span class="tx"><b>${t}</b><p>${b}</p></span>`; ol.appendChild(li); });
    const paint = () => { $$('li', ol).forEach((li) => li.classList.toggle('off', !!cur && li.dataset.k !== cur));
      $$('button', bar).forEach((b) => b.classList.toggle('on', (b.dataset.k || null) === cur)); };
    [['', 'усі події']].concat(Object.entries(KINDS)).forEach(([k, t]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chipbtn';
      b.dataset.k = k; b.textContent = t + (k ? ' · ' + TL.filter((x) => x[1] === k).length : ''); b.addEventListener('click', () => { cur = k || null; paint(); }); bar.appendChild(b); });
    paint();
  })();

  /* ── 03 дерево ────────────────────────────────────────────── */
  const G = { dx: 92, dy: 30, h: 22, padL: 34, padT: 30, padB: 16 };
  const kids = (n) => { const k = [2 * n]; if (n > 4 && n % 6 === 4) k.push((n - 1) / 3); return k; };
  const nextN = (n) => (n % 2 ? 3 * n + 1 : n / 2);
  const nodeW = (n) => Math.max(30, String(n).length * 7.4 + 14);
  const FLOWS = [6, 7, 9, 18, 25];
  const tree = { depth: 11, open: new Set(), flow: null, idx: 0, timer: null, sel: null, model: null };

  function buildTree() {
    const path = tree.flow ? orbit(BigInt(tree.flow)).map(Number) : [];
    const force = new Set(path), nodes = new Map(), edges = [];
    let row = 0;
    (function walk(n, depth) {
      const all = kids(n);
      const shown = all.filter((k) => depth + 1 <= tree.depth || tree.open.has(n) || force.has(k));
      const node = { n, depth, more: all.length > shown.length, w: nodeW(n) };
      nodes.set(n, node);
      const ys = shown.map((k) => { edges.push({ from: k, to: n, odd: k % 2 === 1 }); return walk(k, depth + 1); });
      node.row = ys.length ? (ys[0] + ys[ys.length - 1]) / 2 : row++;
      return node.row;
    })(1, 0);
    let maxD = 0;
    nodes.forEach((v) => { v.x = G.padL + v.depth * G.dx; v.y = G.padT + v.row * G.dy + G.h / 2; if (v.depth > maxD) maxD = v.depth; });
    // дріт: від лівого краю «дитини» ліворуч до жолоба між колонками, далі до правого краю «батька»
    edges.forEach((e) => { const a = nodes.get(e.from), b = nodes.get(e.to);
      const x1 = a.x - a.w / 2, x2 = b.x + b.w / 2 + 7, mid = Math.round((b.x + b.w / 2 + a.x - a.w / 2) / 2);
      e.pts = a.y === b.y ? [[x1, a.y], [x2, b.y]] : [[x1, a.y], [mid, a.y], [mid, b.y], [x2, b.y]]; e.tip = [b.x + b.w / 2, b.y]; });
    const W = G.padL + maxD * G.dx + 80, H = G.padT + row * G.dy + G.padB;
    return (tree.model = { nodes, edges, W, H, maxD, path });
  }

  function drawTree() {
    const m = buildTree(), svg = $('#tree');
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${m.W} ${m.H}`); svg.setAttribute('width', m.W); svg.setAttribute('height', m.H);
    for (let d = 0; d <= m.maxD; d++) el('text', { x: G.padL + d * G.dx, y: 14, class: 'depth' }, svg, d);
    m.edges.forEach((e) => {
      el('path', { d: e.pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '), class: 'e' + (e.odd ? ' odd' : ''), 'data-e': e.from }, svg);
      const [x, y] = e.tip; el('polygon', { points: `${x},${y} ${x + 7},${y - 4} ${x + 7},${y + 4}`, class: 'eh', 'data-e': e.from }, svg);
    });
    m.nodes.forEach((v) => {
      const g = el('g', { class: 'nd' + (v.n % 2 ? ' o' : '') + (tree.sel === v.n ? ' sel' : ''), 'data-n': v.n, tabindex: 0 }, svg);
      el('rect', { x: v.x - v.w / 2, y: v.y - G.h / 2, width: v.w, height: G.h, rx: 11 }, g);
      el('text', { x: v.x, y: v.y + .5 }, g, v.n);
      if (v.more) el('text', { x: v.x + v.w / 2 + 8, y: v.y + .5, class: 'more' }, g, '+');
      g.addEventListener('click', (ev) => { ev.stopPropagation(); popNode(v.n); });
    });
    paintFlow();
  }

  function popNode(n) {
    const m = tree.model, v = m.nodes.get(n), pop = $('#treePop');
    tree.sel = n; $$('#tree .nd').forEach((g) => g.classList.toggle('sel', +g.dataset.n === n));
    const all = kids(n), st = orbit(BigInt(n)).length - 1, r6 = n % 6;
    const why = n === 1 ? 'Корінь дерева: сюди сходяться всі відомі шляхи.' :
      n === 4 ? 'Остача від ділення на 6 дорівнює 4, але (4 − 1) / 3 = 1 — це вже коло 1 → 4 → 2 → 1, а не нова гілка.' :
      all.length === 2 ? `Остача від ділення на 6 дорівнює 4, тому сюди ведуть дві дороги: з ${fmt(2 * n)} діленням і з ${fmt((n - 1) / 3)} правилом 3n + 1.` :
      n % 3 === 0 ? 'Число ділиться на 3, тому з непарного сюди потрапити не можна. Те саме буде з усіма його подвоєннями — це «лист» дерева.' :
      `Остача від ділення на 6 дорівнює ${r6}, а не 4, тому з непарного сюди не потрапити. Єдиний попередник — ${fmt(2 * n)}.`;
    pop.innerHTML = `<button class="x" type="button" aria-label="Закрити">×</button><h4>${fmt(n)}</h4><dl>
      <dt>кроків до 1</dt><dd>${st}</dd><dt>двійковий запис</dt><dd>${n.toString(2)}</dd>
      <dt>наступне</dt><dd>${n === 1 ? '4 → 2 → 1' : fmt(nextN(n)) + (n % 2 ? ' (3n + 1)' : ' (÷ 2)')}</dd>
      <dt>попередники</dt><dd>${all.map(fmt).join(', ')}</dd></dl><p>${why}</p>
      <div class="row">${v.more ? '<button type="button" class="chipbtn" data-a="open">показати попередників</button>' : ''}
      <button type="button" class="chipbtn" data-a="use">зробити числом сторінки</button></div>`;
    const box = $('#treeBox');
    pop.style.display = 'block';
    pop.style.left = Math.max(8, Math.min(v.x + 18, box.scrollLeft + box.clientWidth - 290)) + 'px';
    pop.style.top = (v.y + 16) + 'px';
    if (v.y + 16 + pop.offsetHeight > Math.max(m.H, box.clientHeight) - 4) pop.style.top = Math.max(4, v.y - 16 - pop.offsetHeight) + 'px';
    $('.x', pop).onclick = closePop;
    const o = $('[data-a=open]', pop); if (o) o.onclick = () => { tree.open.add(n); closePop(); drawTree(); };
    $('[data-a=use]', pop).onclick = () => { setN(BigInt(n)); closePop(); };
  }
  function closePop() { $('#treePop').style.display = 'none'; tree.sel = null; $$('#tree .nd.sel').forEach((g) => g.classList.remove('sel')); }
  $('#treeBox').addEventListener('click', closePop);
  $('#treePop').addEventListener('click', (e) => e.stopPropagation());

  function paintFlow() {
    const svg = $('#tree'), box = $('#treeSteps'), m = tree.model, p = m.path;
    $$('#treeFlows button').forEach((b) => b.classList.toggle('on', +b.dataset.f === tree.flow));
    svg.classList.toggle('run', !!tree.flow);
    const cells = $('.cells', box); cells.innerHTML = '';
    $$('[data-a]', box).forEach((b) => (b.disabled = !tree.flow));
    $('[data-a=play]', box).textContent = tree.timer ? '❚❚' : '▶';
    if (!tree.flow) { $('.n', box).textContent = '—'; $('.t', box).innerHTML = 'Оберіть число вгорі — його шлях до одиниці пройде по дереву крок за кроком. Або клікайте числа й розгортайте гілки самі.'; return; }
    const i = tree.idx, cur = p[i];
    $$('.nd', svg).forEach((g) => { const k = p.indexOf(+g.dataset.n); g.classList.toggle('hot', k >= 0 && k <= i); g.classList.toggle('cur', +g.dataset.n === cur); });
    $$('[data-e]', svg).forEach((g) => { const k = p.indexOf(+g.dataset.e); g.classList.toggle('hot', k >= 0 && k < i); g.classList.toggle('now', k === i - 1 && i > 0); });
    $('.n', box).textContent = `${String(i).padStart(2, '0')} / ${String(p.length - 1).padStart(2, '0')}`;
    const prev = p[i - 1];
    $('.t', box).innerHTML = i === 0 ? `Починаємо з <b>${fmt(cur)}</b>: ${cur % 2 ? 'непарне, далі 3n + 1' : 'парне, далі ділимо на 2'}.` :
      (prev % 2 ? `<b>${fmt(prev)}</b> непарне: 3 · ${fmt(prev)} + 1 = <b>${fmt(cur)}</b>.` : `<b>${fmt(prev)}</b> парне: ${fmt(prev)} / 2 = <b>${fmt(cur)}</b>.`) +
      (cur === 1 ? ` Одиниця — за ${p.length - 1} кроків.` : '');
    p.forEach((_, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = k < i ? 'done' : k === i ? 'cur' : '';
      b.setAttribute('aria-label', 'Крок ' + k); b.addEventListener('click', () => { stopPlay(); tree.idx = k; paintFlow(); }); cells.appendChild(b); });
    const v = m.nodes.get(cur), bx = $('#treeBox');
    if (v && (v.x < bx.scrollLeft + 60 || v.x > bx.scrollLeft + bx.clientWidth - 60)) bx.scrollTo({ left: Math.max(0, v.x - bx.clientWidth / 2), behavior: 'smooth' });
  }
  function stopPlay() { clearInterval(tree.timer); tree.timer = null; }
  function setFlow(f) {
    stopPlay(); closePop();
    tree.flow = tree.flow === f ? null : f; tree.idx = 0; drawTree();
    if (tree.flow) { const bx = $('#treeBox'); bx.scrollLeft = bx.scrollWidth; play(); }
  }
  function play() {
    stopPlay();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { paintFlow(); return; }
    tree.timer = setInterval(() => { if (tree.idx >= tree.model.path.length - 1) { stopPlay(); paintFlow(); return; } tree.idx++; paintFlow(); }, 1100);
    paintFlow();
  }
  FLOWS.forEach((f) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chipbtn'; b.dataset.f = f;
    b.textContent = '▶ ' + f; b.title = 'Шлях числа ' + f; b.addEventListener('click', () => setFlow(f)); $('#treeFlows').appendChild(b); $('#treeFlows').append(' '); });
  $('#treeSteps').addEventListener('click', (e) => { const a = e.target.dataset && e.target.dataset.a; if (!a || !tree.flow) return;
    if (a === 'play') { if (tree.timer) { stopPlay(); paintFlow(); } else { if (tree.idx >= tree.model.path.length - 1) tree.idx = 0; play(); } return; }
    stopPlay(); tree.idx = Math.max(0, Math.min(tree.model.path.length - 1, tree.idx + (a === 'next' ? 1 : -1))); paintFlow(); });
  seg($('#treeDepth'), (v) => { tree.depth = +v; closePop(); drawTree(); });
  $('#treeReset').addEventListener('click', () => { stopPlay(); tree.open.clear(); tree.flow = null; tree.depth = 11; closePop();
    $$('#treeDepth button').forEach((b) => b.classList.toggle('on', b.dataset.v === '11')); drawTree(); });

  // Перевірка геометрії дерева в усіх станах: читаємо те, що реально намальовано.
  function checkTree() {
    const svg = $('#tree'), out = { overlaps: [], loose: [], through: [], badRule: [] };
    const boxes = $$('.nd', svg).map((g) => { const r = g.querySelector('rect'); return { n: +g.dataset.n, x: +r.getAttribute('x'), y: +r.getAttribute('y'), w: +r.getAttribute('width'), h: +r.getAttribute('height') }; });
    const by = new Map(boxes.map((b) => [b.n, b]));
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], b = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) out.overlaps.push([a.n, b.n]); }
    $$('path.e', svg).forEach((p) => {
      const from = +p.dataset.e, to = nextN(from), a = by.get(from), b = by.get(to), L = p.getTotalLength();
      if (!a || !b) { out.badRule.push(from); return; }
      const s = p.getPointAtLength(0), t = p.getPointAtLength(L);
      const near = (pt, bx, pad) => pt.x >= bx.x - pad && pt.x <= bx.x + bx.w + pad && pt.y >= bx.y - 1 && pt.y <= bx.y + bx.h + 1;
      if (!near(s, a, 1) || !near(t, b, 8)) out.loose.push(from);
      for (let d = 3; d < L - 3; d += 3) { const pt = p.getPointAtLength(d);
        const hit = boxes.find((bx) => bx.n !== from && bx.n !== to && pt.x > bx.x && pt.x < bx.x + bx.w && pt.y > bx.y && pt.y < bx.y + bx.h);
        if (hit) { out.through.push([from, hit.n]); break; } }
    });
    return out;
  }
  function check() {
    const keep = { depth: tree.depth, open: new Set(tree.open), flow: tree.flow, idx: tree.idx };
    stopPlay(); const bad = {}; let states = 0;
    const snap = () => $('#tree').innerHTML.replace(/ class="[^"]*"/g, '');
    tree.open.clear(); tree.flow = null; tree.depth = 11; drawTree(); const base = snap();
    [8, 11, 14, 16].forEach((d) => [null].concat(FLOWS).forEach((f) => [[], [16], [40, 52], [16, 40, 64, 106]].forEach((op) => {
      tree.depth = d; tree.flow = f; tree.open = new Set(op); drawTree(); states++;
      const r = checkTree();
      if (r.overlaps.length || r.loose.length || r.through.length || r.badRule.length) bad[`d${d} f${f} open[${op}]`] = r;
    })));
    tree.open.clear(); tree.flow = null; tree.depth = 11; drawTree(); const roundtrip = snap() === base;
    Object.assign(tree, keep); drawTree();
    return { states, bad, roundtrip };
  }

  /* ── 04 хмара точок ───────────────────────────────────────── */
  const sc = { N: 10000, m: 'steps', geom: null };
  function fitCanvas(c, h) { const dpr = Math.min(2, window.devicePixelRatio || 1), w = c.clientWidth || 960;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.height = h + 'px';
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return { x, w, h }; }
  function recordsUpTo(N) { const t = table(N), out = []; let best = -1; for (let n = 1; n <= N; n++) if (t.steps[n] > best) { best = t.steps[n]; out.push(n); } return out; }
  function drawScatter() {
    const c = $('#scat'), { x, w, h } = fitCanvas(c, Math.max(300, Math.min(440, (c.clientWidth || 960) * .44)));
    const t = table(sc.N), L = 54, R = 14, T = 14, B = 30, N = sc.N, peakM = sc.m === 'peak';
    const val = (n) => (peakM ? Math.log10(t.peak[n]) : t.steps[n]);
    let mx = 0; for (let n = 1; n <= N; n++) if (val(n) > mx) mx = val(n);
    const X = (n) => L + n / N * (w - L - R), Y = (v) => h - B - v / mx * (h - T - B);
    x.clearRect(0, 0, w, h);
    x.font = '11px "Roboto Mono", monospace'; x.fillStyle = css('--ink-3'); x.strokeStyle = css('--rule'); x.lineWidth = 1;
    for (let k = 0; k <= 4; k++) { const v = mx * k / 4, y = Math.round(Y(v)) + .5; x.beginPath(); x.moveTo(L, y); x.lineTo(w - R, y); x.stroke();
      x.textAlign = 'right'; x.fillText(peakM ? '10^' + v.toFixed(1) : Math.round(v), L - 8, y + 4); }
    x.textAlign = 'center'; for (let k = 0; k <= 4; k++) x.fillText(fmt(Math.round(N * k / 4)), Math.min(w - R - 20, Math.max(L + 8, X(N * k / 4))), h - 9);
    x.fillStyle = css('--ink'); x.globalAlpha = N > 20000 ? .28 : N > 2000 ? .5 : .8;
    const s = N > 20000 ? 1.1 : N > 2000 ? 1.5 : 2.4;
    for (let n = 1; n <= N; n++) x.fillRect(X(n) - s / 2, Y(val(n)) - s / 2, s, s);
    x.globalAlpha = 1;
    if (!peakM) { const rec = recordsUpTo(N).filter((n) => n > N / 60); x.strokeStyle = css('--act'); x.fillStyle = css('--act'); x.lineWidth = 2; x.font = '600 11px "Roboto Mono", monospace';
      let lastX = -1e9;   // підписуємо лише тих, кому вистачає місця: кружечки стоять усі
      rec.slice().reverse().forEach((n) => { x.beginPath(); x.arc(X(n), Y(val(n)), 5, 0, 7); x.stroke();
        if (Math.abs(lastX - X(n)) < 70) return; lastX = X(n);
        x.textAlign = X(n) > w - 90 ? 'right' : 'left';
        x.fillText(fmt(n), X(n) + (X(n) > w - 90 ? -9 : 9), Math.max(T + 8, Y(val(n)) - 7)); }); }
    sc.geom = { X, Y, val, L, R, w, h, N, t };
    $('#scatCap').innerHTML = peakM ? 'По вертикалі — найбільше число на шляху, у степенях десятки. Нижня межа — пряма: число, яке одразу падає, само і є своїм піком. Наведіть на точку, щоб побачити число.'
      : 'Кожна точка — одне число: по горизонталі воно само, по вертикалі — скільки кроків йому треба до одиниці. Кружечками позначено рекордсменів. Наведіть на точку, щоб побачити число.';
  }
  (function scatHover() {
    const c = $('#scat'), tip = $('#scatTip');
    c.addEventListener('mousemove', (e) => { const g = sc.geom; if (!g) return;
      const r = c.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const n0 = Math.round((px - g.L) / (g.w - g.L - g.R) * g.N), span = Math.max(2, Math.ceil(g.N / (g.w - g.L - g.R) * 5));
      let best = 0, bd = 1e9;
      for (let n = Math.max(1, n0 - span); n <= Math.min(g.N, n0 + span); n++) { const d = Math.hypot(g.X(n) - px, g.Y(g.val(n)) - py); if (d < bd) { bd = d; best = n; } }
      if (!best || bd > 24) { tip.style.display = 'none'; return; }
      tip.style.display = 'block'; tip.innerHTML = `<b>${fmt(best)}</b>: ${g.t.steps[best]} кроків, пік ${fmt(g.t.peak[best])}`;
      const fr = c.parentNode.getBoundingClientRect();
      tip.style.left = Math.max(110, Math.min(fr.width - 110, g.X(best) + r.left - fr.left)) + 'px'; tip.style.top = (g.Y(g.val(best)) + r.top - fr.top) + 'px'; });
    c.addEventListener('mouseleave', () => (tip.style.display = 'none'));
    c.addEventListener('click', (e) => { const g = sc.geom, r = c.getBoundingClientRect(); const n = Math.round((e.clientX - r.left - g.L) / (g.w - g.L - g.R) * g.N); if (n >= 1 && n <= g.N) setN(BigInt(n)); });
  })();
  function drawHist() {
    const c = $('#hist'), { x, w, h } = fitCanvas(c, 200), t = table(sc.N);
    let mx = 0; for (let n = 1; n <= sc.N; n++) if (t.steps[n] > mx) mx = t.steps[n];
    const cnt = new Int32Array(mx + 1); for (let n = 1; n <= sc.N; n++) cnt[t.steps[n]]++;
    const top = Math.max(...cnt), L = 8, R = 8, B = 24, T = 8, bw = (w - L - R) / (mx + 1);
    x.clearRect(0, 0, w, h); x.fillStyle = css('--ink');
    for (let s = 0; s <= mx; s++) { const bh = cnt[s] / top * (h - T - B); x.fillRect(L + s * bw, h - B - bh, Math.max(1, bw - (bw > 3 ? 1 : 0)), bh); }
    x.fillStyle = css('--ink-3'); x.font = '11px "Roboto Mono", monospace'; x.textAlign = 'center';
    for (let k = 0; k <= 4; k++) { const s = Math.round(mx * k / 4); x.fillText(s, Math.min(w - 16, Math.max(12, L + s * bw)), h - 7); }
  }
  function drawRecs() {
    const t = table(100000), rec = recordsUpTo(100000).filter((n) => n >= 9 || n === 1).slice(-14);
    $('#recs').innerHTML = '<tr><th>число</th><th>кроків</th><th>пік шляху</th></tr>' +
      rec.map((n) => `<tr><td>${fmt(n)}</td><td>${t.steps[n]}</td><td>${fmt(t.peak[n])}</td></tr>`).join('');
  }
  seg($('#scatN'), (v) => { sc.N = +v; drawScatter(); drawHist(); });
  seg($('#scatM'), (v) => { sc.m = v; drawScatter(); });

  /* ── 05 біти ──────────────────────────────────────────────── */
  const bitsG = {};
  function drawBits() {
    const o = orbit(state.n), rows = Math.min(o.length, 170), c = $('#bits');
    const strs = o.slice(0, rows).map((v) => v.toString(2)), cols = Math.max(...strs.map((s) => s.length));
    const wCss = c.clientWidth || 960, cell = Math.max(2, Math.min(30, Math.floor((wCss - 30) / cols))), rh = Math.max(3, Math.min(cell, 9));
    const { x, w, h } = fitCanvas(c, rows * rh + 12);
    const x0 = Math.round((w - cols * cell) / 2) + 8;
    x.clearRect(0, 0, w, h);
    const ink = css('--ink'), off = css('--paper-2'), act = css('--act');
    strs.forEach((s, r) => { const y = 6 + r * rh;
      for (let i = 0; i < cols; i++) { const ch = i < cols - s.length ? null : s[i - (cols - s.length)];
        if (ch === null) continue; x.fillStyle = ch === '1' ? ink : off; x.fillRect(x0 + i * cell, y, cell - (cell > 4 ? 1 : 0), rh - (rh > 4 ? 1 : 0)); }
      if (s[s.length - 1] === '1') { x.fillStyle = act; x.fillRect(x0 - 10, y, 5, rh - (rh > 4 ? 1 : 0)); } });
    Object.assign(bitsG, { o, rows, rh, x0, cell, cols });
    $('#bitsCap').textContent = `Число ${big10(state.n)}: ${o.length - 1} кроків` + (o.length > rows ? `, показано перші ${rows} рядків` : '') +
      `. Найдовший запис — ${cols} біт. Рядок без позначки ліворуч завжди коротший за попередній рівно на одну клітинку праворуч: це ділення на 2.`;
  }
  (function bitsHover() { const c = $('#bits'), tip = $('#bitsTip');
    c.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(), i = Math.floor((e.clientY - r.top - 6) / bitsG.rh);
      if (i < 0 || i >= bitsG.rows) { tip.style.display = 'none'; return; }
      const v = bitsG.o[i], fr = c.parentNode.getBoundingClientRect();
      tip.style.display = 'block'; tip.innerHTML = `крок ${i}: <b>${v.toString().length > 24 ? big10(v) : fmt(v)}</b> · ${v % 2n ? 'непарне → 3n + 1' : 'парне → ÷ 2'}`;
      tip.style.left = Math.max(130, Math.min(fr.width - 130, e.clientX - fr.left)) + 'px'; tip.style.top = (e.clientY - fr.top) + 'px'; });
    c.addEventListener('mouseleave', () => (tip.style.display = 'none')); })();

  /* ── 06 дрейф ─────────────────────────────────────────────── */
  const walk = { mul: 3 };
  function drawHalvings() {
    const K = 8, all = new Float64Array(K + 2), onp = new Float64Array(K + 2); let nAll = 0, nOn = 0, lnAll = 0;
    const v2 = (m) => { let k = 0; while (m % 2 === 0) { m /= 2; k++; } return k; };
    for (let m = 1; m < 200000; m += 2) { const k = v2(3 * m + 1); all[Math.min(k, K + 1)]++; nAll++; lnAll += Math.log(3) - k * Math.log(2); }
    for (let s = 2; s <= 20000; s++) { let n = s; while (n !== 1) { if (n % 2) { const k = v2(3 * n + 1); onp[Math.min(k, K + 1)]++; nOn++; n = 3 * n + 1; } else n /= 2; } }
    let html = ''; const pc = (v) => (v * 100).toFixed(2).replace('.', ',') + '%';
    for (let k = 1; k <= K; k++) { const th = 1 / 2 ** k, a = all[k] / nAll, b = onp[k] / nOn;
      html += `<div class="r"><span>${k} ${k === 1 ? 'ділення' : k < 5 ? 'ділення' : 'ділень'}</span><span class="tr"><i style="width:${(a * 200).toFixed(2)}%"></i><u style="width:${(b * 200).toFixed(2)}%"></u><s style="left:${(th * 200).toFixed(2)}%"></s></span>` +
        `<span class="v">${pc(a)} · ${pc(b)} · ${pc(th)}</span></div>`; }
    $('#halv').innerHTML = html;
    const gm = Math.exp(lnAll / nAll);
    $('#driftCards').innerHTML = [
      ['середній множник', gm.toFixed(4).replace('.', ','), 'Геометричне середнє множника «від непарного до наступного непарного» для всіх непарних до 200 000. Теоретичне значення — 3/4 = 0,75.'],
      ['скільки ділень у середньому', '2', 'Очікувана кількість ділень після одного кроку 3n + 1: 1·½ + 2·¼ + 3·⅛ + … = 2. Множимо на 3, ділимо на 4.'],
      ['що це означає', '−0,415 біта', 'Стільки двійкових розрядів число втрачає в середньому за один «непарний» крок: log₂ 3 − 2 ≈ −0,415.'],
    ].map(([k, big, p]) => `<div class="cardx"><span class="k">${k}</span><span class="big">${big}</span><p>${p}</p></div>`).join('');
  }
  function drawWalk() {
    const o = orbit(state.n, walk.mul), svg = $('#walk'); svg.innerHTML = '';
    const W = 960, H = 280, L = 64, R = 18, T = 18, B = 34, lg = o.map(log2), mx = Math.max(...lg, 1);
    const X = (i) => L + (o.length > 1 ? i / (o.length - 1) : 0) * (W - L - R), Y = (v) => H - B - v / mx * (H - T - B);
    for (let k = 0; k <= 4; k++) { const v = mx * k / 4, y = Y(v); el('line', { x1: L, x2: W - R, y1: y, y2: y, stroke: css('--rule') }, svg);
      el('text', { x: L - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: css('--ink-3'), 'font-family': 'Roboto Mono, monospace' }, svg, Math.round(v) + ' біт'); }
    el('path', { d: o.map((_, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(lg[i]).toFixed(1)).join(''), fill: 'none', stroke: walk.mul === 3 ? css('--ink') : css('--act'), 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, svg);
    el('text', { x: W - R, y: H - 10, 'text-anchor': 'end', 'font-size': 11, fill: css('--ink-3'), 'font-family': 'Roboto Mono, monospace' }, svg, 'крок ' + (o.length - 1));
    const last = o[o.length - 1], cyc = walk.mul === 5 && last !== 1n && o.indexOf(last) < o.length - 1;
    $('#walkCap').innerHTML = walk.mul === 3
      ? `Правило 3n + 1, число ${big10(state.n)}. По вертикалі — довжина двійкового запису. Лінія смикається, але тренд униз: за ${o.length - 1} кроків число втратило всі розряди.`
      : last === 1n ? `Правило 5n + 1, число ${big10(state.n)}: цього разу шлях дійшов до одиниці за ${o.length - 1} кроків. Спробуйте 7 або 27.`
      : cyc ? `Правило 5n + 1, число ${big10(state.n)}: шлях потрапив у коло, що не проходить через 1 (повторилось число ${fmt(last)}). Для 5n + 1 такі кола є; для 3n + 1 їх не знайдено.`
      : `Правило 5n + 1, число ${big10(state.n)}: за ${o.length - 1} кроків запис виріс із ${Math.round(lg[0]) + 1} до ${Math.round(lg[lg.length - 1]) + 1} біт і продовжує рости. Вважають, що такі шляхи тікають у нескінченність, але й це не доведено.`;
  }
  seg($('#walkRule'), (v) => { walk.mul = +v; drawWalk(); });

  /* ── 08 кола серед від'ємних ──────────────────────────────── */
  (function rings() {
    const root = $('#rings');
    [[1, 'єдине відоме коло серед натуральних'], [-1, 'коло з числа −1'], [-5, 'коло з числа −5'], [-17, 'коло з числа −17']].forEach(([s, cap]) => {
      const cyc = [s]; let n = s; for (;;) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; if (n === s) break; cyc.push(n); }
      const f = document.createElement('figure'), k = cyc.length, big = k > 8, S = big ? 280 : 220, c = S / 2, r = big ? 112 : 66;
      const svg = el('svg', { viewBox: `0 0 ${S} ${S}`, role: 'img', 'aria-label': cap + ': ' + cyc.join(' → ') }, null);
      el('circle', { cx: c, cy: c, r, class: 'a' }, svg);
      cyc.forEach((v, i) => { const a = -Math.PI / 2 + i / k * 2 * Math.PI, x = c + r * Math.cos(a), y = c + r * Math.sin(a), w = Math.max(big ? 26 : 30, String(v).length * 6.6 + 10);
        // стрілка напрямку — посередині дуги до наступного числа
        const am = a + Math.PI / k, ax = c + r * Math.cos(am), ay = c + r * Math.sin(am), deg = am * 180 / Math.PI + 90;
        el('polygon', { points: '-4,-4 5,0 -4,4', transform: `translate(${ax.toFixed(1)},${ay.toFixed(1)}) rotate(${deg.toFixed(1)})`, fill: css('--ink-3') }, svg);
        el('rect', { x: x - w / 2, y: y - 10, width: w, height: 20, rx: 10, class: 'c' + (Math.abs(v) % 2 ? ' o' : '') }, svg);
        el('text', { x, y: y + .5, 'font-size': big ? 10 : 11 }, svg, String(v).replace('-', '−')); });
      el('text', { x: c, y: c, 'font-size': 12, fill: css('--ink-3') }, svg, k + (k < 5 ? ' числа' : ' чисел'));
      f.appendChild(svg); const fc = document.createElement('figcaption'); fc.textContent = cap; f.appendChild(fc); root.appendChild(f);
    });
  })();

  /* ── зміст у шапці ────────────────────────────────────────── */
  (function toc() {
    const links = $$('#toc a'), items = links.map((a) => ({ a, el: document.getElementById(a.getAttribute('href').slice(1)) }));
    let tick = false;
    const paint = () => { tick = false; let cur = items[0]; items.forEach((it) => { if (it.el.getBoundingClientRect().top <= 90) cur = it; });
      links.forEach((a) => a.classList.toggle('on', a === cur.a)); };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true }); paint();
  })();

  /* ── старт ────────────────────────────────────────────────── */
  function onN() { drawHail(); drawBits(); drawWalk(); }
  document.addEventListener('collatz:n', onN);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { drawScatter(); drawHist(); drawBits(); }, 150); });
  window.COLLATZ = { get n() { return state.n; }, setN, orbit, table, check, checkTree, tree, records: recordsUpTo };
  onN(); drawTree(); drawScatter(); drawHist(); drawRecs(); drawHalvings();
})();
