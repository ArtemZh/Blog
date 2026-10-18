/* Стаття 34: чотири незалежні візуалізації.
   #viz-intro — матриця «розтин фільму» (HTML/CSS)
   #viz-twins — дві стрічки життя Купера й Мерф (SVG)
   #viz-tides — 3D-планета і приплив (three.js)
   #viz-blue  — спектрометр блакитного зсуву (canvas 2D)
   Кожен блок стартує сам; якщо слоту немає — пропускається. */

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

(function css() {
  if (document.querySelector('link[data-vz]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = new URL('./is-viz.css?v=1', import.meta.url).href; l.dataset.vz = '1';
  document.head.appendChild(l);
})();

/* Невеликі помічники форматування */
const nf = (v, d = 0) => v.toLocaleString('uk-UA', { maximumFractionDigits: d, minimumFractionDigits: d });
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sci(v, d = 1) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e < 5) return nf(v, e >= 2 ? 0 : (e >= 0 ? d : d - e));
  const m = v / 10 ** e;
  const ms = nf(m, d);
  return (ms === '1' || ms === nf(1, d) ? '' : ms + '·') + '10' + String(e).split('').map((c) => SUP[c]).join('');
}
function visible(node, cb) {
  const io = new IntersectionObserver((es) => cb(es[0].isIntersecting), { threshold: 0.02 });
  io.observe(node);
}

/* ═══════════════ 1. Матриця «розтин фільму» ═══════════════ */
function initIntro(slot) {
  const COLS = [
    { k: 'sci', l: 'наука', s: 'наука', c: 'var(--vz-sci)' },
    { k: 'simp', l: 'спрощення', s: 'спрощ.', c: 'var(--vz-simp)' },
    { k: 'fic', l: 'вигадка', s: 'вигадка', c: 'var(--vz-fic)' }
  ];
  const ROWS = [
    ['Тінь і лінзування', 0, '#bh-sec', '02', 'Форму тіні й диска, що «обіймає» діру, програма DNGR рахувала за рівняннями Ейнштейна, і з цього вийшла наукова стаття 2015 року. Для фільму прибрали лише частину кольорових ефектів диска.'],
    ['Година = 7 років', 0, '#time', '03', 'Множник близько 61 тисячі справді можливий біля діри, що обертається майже з граничною швидкістю. Застереження одне: таке обертання природа навряд чи дає.'],
    ['Купер і Мерф', 0, '#twins-sec', '04', 'Різниця віку — прямий наслідок сповільнення часу. Головна причина — тяжіння Гаргантюа, а не швидкість корабля.'],
    ['Хвилі-гори', 1, '#tides', '05', 'Біля надмасивної діри приплив планету не рве, але помітно витягує. Хвилі від гойдання планети правдоподібні, проте у фільмі не пораховані.'],
    ['Блакитний зсув', 1, '#blue', '06', 'Світло ззовні на планеті стискається в ту саму 61 тисячу разів і мало б випалити її ультрафіолетом і рентгеном. Фільм цей наслідок опускає.'],
    ['Червоточина', 1, '#worm', '07', 'Вигляд кулі з іншим небом розраховано й опубліковано. Але чи можуть існувати прохідні червоточини, невідомо: для них потрібна екзотична матерія.'],
    ['Тесеракт і петля', 2, '#tess', '08', 'Пʼятивимірний тесеракт і послання в минуле — найсміливіша спекуляція фільму. Торн сам відносить її до таких.']
  ];
  const box = el('div', 'vz vz-mx');
  const head = el('div', 'vz-mx__head');
  head.innerHTML = '<span class="vz-k" style="text-align:left">ефект фільму</span>' +
    COLS.map((c) => `<span><span class="badge ${c.k}"><span class="vz-l">${c.l}</span><span class="vz-s">${c.s}</span></span></span>`).join('');
  box.appendChild(head);
  ROWS.forEach(([name, col, href, num, text], i) => {
    const it = el('div', 'vz-mx__item');
    const id = 'vzmx' + i;
    const row = el('button', 'vz-mx__row');
    row.type = 'button'; row.setAttribute('aria-expanded', 'false'); row.setAttribute('aria-controls', id);
    row.innerHTML = `<span class="vz-mx__name"><i class="vz-mx__chev" aria-hidden="true"></i>${name}</span>` +
      COLS.map((c, j) => `<span class="vz-mx__cell">${j === col
        ? `<i class="vz-mx__dot" style="--c:${c.c};transition-delay:${(REDUCE ? 0 : 120 + i * 70)}ms" aria-label="${c.l}"></i>`
        : '<i class="vz-mx__ghost" aria-hidden="true"></i>'}</span>`).join('');
    const body = el('div', 'vz-mx__body');
    body.id = id; body.setAttribute('role', 'region');
    body.innerHTML = `<div><p><span class="badge ${COLS[col].k}">${COLS[col].l}</span>${text} <a href="${href}">Розділ ${num} →</a></p></div>`;
    row.addEventListener('click', () => {
      const open = it.classList.toggle('open');
      row.setAttribute('aria-expanded', String(open));
    });
    it.append(row, body); box.appendChild(it);
  });
  slot.appendChild(box);
  const hint = el('p', 'chint', 'Натисніть на рядок — короткий вердикт і посилання на розділ. Поділ — за книжкою Кіпа Торна «The Science of Interstellar».');
  slot.appendChild(hint);
  if (REDUCE) { box.classList.add('in'); return; }
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { box.classList.add('in'); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(box);
}

/* ═══════════════ 2. Дві стрічки життя ═══════════════ */
function initTwins(slot) {
  const Y = 365.25 * 24; // годин у році
  // Орієнтири сценарію (роки): [назва етапу, Земля, Купер]
  const ST = [
    ['Політ до Сатурна', 2, 2, 'Обидва старіють однаково: швидкість корабля дає мізерну поправку.'],
    ['Планета Міллер', 23 + 4 / 12 + 8 / 365.25, (3 + 18 / 60) / Y, 'Для Купера — 3 год 18 хв, на Землі — 23 р. 4 міс. 8 дн. Годинник Купера йде в ≈ 62 тисячі разів повільніше.'],
    ['Маневр біля Гаргантюа', 51, 0, 'На Землі минає 51 рік. Для Купера — лічені години: на лічильнику їх не видно.'],
    ['Повернення', 0, 0, 'Купер прокидається на станції біля Сатурна. За документами йому 124 роки.']
  ];
  const MARKS = ['Старт', 'Сатурн', 'Міллер', 'Гаргантюа', 'Фінал'];
  const EARTH_TOTAL = ST.reduce((s, x) => s + x[1], 0);
  const M0 = 10, C0 = 124 - EARTH_TOTAL; // вік Купера на старті виводимо з «124 за документами»
  const N = ST.length;

  const at = (u) => { // u ∈ [0, N]
    let e = 0, c = 0;
    for (let i = 0; i < N; i++) { const f = Math.max(0, Math.min(1, u - i)); e += f * ST[i][1]; c += f * ST[i][2]; }
    return { m: M0 + e, c: C0 + c };
  };
  const ym = (a) => { let y = Math.floor(a), mo = Math.round((a - y) * 12); if (mo === 12) { y++; mo = 0; } return `${y}<small style="display:inline;font-size:.5em;margin:0 .15em 0 .1em">р.</small>${mo ? mo + '<small style="display:inline;font-size:.5em;margin-left:.1em">міс.</small>' : ''}`; };

  const box = el('div', 'vz vz-tw');
  box.innerHTML = `
    <div class="vz-tw__ages">
      <div class="vz-tw__age" style="--who:var(--c-clay,#D28264)"><span class="vz-k">Мерф · Земля</span><b data-a="m"></b><small data-d="m"></small></div>
      <div class="vz-tw__age" style="--who:var(--c-blue,#4678DC)"><span class="vz-k">Купер · у польоті</span><b data-a="c"></b><small data-d="c"></small></div>
    </div>
    <svg viewBox="0 0 800 196" role="img" aria-label="Стрічки віку Мерф і Купера"></svg>
    <div class="vz-tw__trk">
      <input type="range" min="0" max="${N}" step="0.001" value="0" aria-label="Етап місії">
      <div class="vz-tw__marks">${MARKS.map((m, i) => `<button type="button" class="vz-tw__mk" data-u="${i}" style="left:${i / N * 100}%">${m}</button>`).join('')}</div>
    </div>
    <div class="vz-tw__bar"><button type="button" class="vz-btn" data-play>▶ Прожити місію</button><span class="vz-tw__cap"></span></div>`;
  slot.appendChild(box);
  slot.appendChild(el('p', 'chint', `Це орієнтири сценарію, а не незалежний розрахунок. Вік Купера на старті у фільмі не названо: виводимо його як 124 − ${nf(EARTH_TOTAL, 1)} ≈ ${nf(C0, 1)} року. Тривалість повернення фільм не називає, тут вона нульова. Шкала стрічок — роки життя від 0 до 130.`));

  const svg = box.querySelector('svg'), rng = box.querySelector('input'), cap = box.querySelector('.vz-tw__cap');
  const play = box.querySelector('[data-play]'), mks = [...box.querySelectorAll('.vz-tw__mk')];
  const aM = box.querySelector('[data-a=m]'), aC = box.querySelector('[data-a=c]');
  const dM = box.querySelector('[data-d=m]'), dC = box.querySelector('[data-d=c]');
  const NS = 'http://www.w3.org/2000/svg';
  const X0 = 12, AMAX = 130; let VW = 800, X1 = 788; const sx = (a) => X0 + (X1 - X0) * a / AMAX;
  const mk = (t, at, p = svg) => { const e = document.createElementNS(NS, t); for (const k in at) e.setAttribute(k, at[k]); p.appendChild(e); return e; };

  // Стрічка: доріжка, заливка «до місії» та етапи, позначки десятиліть, «кіноплівкові» перфорації
  let rows, gapT;
  function build() {
  VW = Math.max(280, Math.round(svg.clientWidth || box.clientWidth || 800)); X1 = VW - 12;
  svg.setAttribute('viewBox', `0 0 ${VW} 196`); svg.textContent = '';
  const defs = mk('defs', {});
  const pat = mk('pattern', { id: 'vzPerf', width: 12, height: 34, patternUnits: 'userSpaceOnUse' }, defs);
  mk('rect', { x: 3, y: 3, width: 6, height: 4, rx: 1.2, fill: '#fff', opacity: .55 }, pat);
  mk('rect', { x: 3, y: 27, width: 6, height: 4, rx: 1.2, fill: '#fff', opacity: .55 }, pat);
  const COL = { m: 'var(--c-clay,#D28264)', c: 'var(--c-blue,#4678DC)' };
  rows = {};
  [['m', 'Мерф', 30], ['c', 'Купер', 122]].forEach(([k, name, y]) => {
    mk('rect', { x: X0, y, width: X1 - X0, height: 34, rx: 6, fill: 'var(--paper-2,#F2F3F5)' });
    for (let a = 0; a <= AMAX; a += 10) {
      mk('line', { x1: sx(a), x2: sx(a), y1: y + 34, y2: y + 39, stroke: 'var(--rule-2)', 'stroke-width': 1 });
      if (a % 20 === 0) { const t = mk('text', { x: sx(a), y: y + 51, 'text-anchor': 'middle', style: 'font:500 10px var(--mono);fill:var(--ink-3)' }); t.textContent = a; }
    }
    const g = mk('g', {});
    const pre = mk('rect', { x: X0, y, height: 34, rx: 6, fill: COL[k], opacity: .35 }, g);
    const segs = ST.map((_, i) => mk('rect', { y, height: 34, fill: COL[k], opacity: .55 + i * .15 }, g));
    const perf = mk('rect', { x: X0, y, height: 34, fill: 'url(#vzPerf)' }, g);
    const head = mk('circle', { cy: y + 17, r: 7, fill: '#fff', stroke: COL[k], 'stroke-width': 3 });
    const lbl = mk('text', { x: X0, y: y - 8, style: 'font:600 12px var(--sans);fill:var(--ink-2)' }); lbl.textContent = name;
    rows[k] = { pre, segs, perf, head, y };
  });
  // «124 за документами» на стрічці Купера
  const docX = sx(124);
  mk('line', { x1: docX, x2: docX, y1: 118, y2: 178, stroke: 'var(--act)', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' });
  const docT = mk('text', { x: docX, y: 191, 'text-anchor': 'end', style: 'font:600 10.5px var(--mono);fill:var(--act)' }); docT.textContent = '124 за документами';
  gapT = mk('text', { y: 97, 'text-anchor': 'middle', style: 'font:600 11px var(--mono);fill:var(--ink-2)' });
  }

  function draw(u) {
    const cur = at(u);
    ['m', 'c'].forEach((k) => {
      const r = rows[k], base = k === 'm' ? M0 : C0;
      r.pre.setAttribute('width', sx(base) - X0);
      let a = base;
      ST.forEach((s, i) => {
        const f = Math.max(0, Math.min(1, u - i)), d = f * s[k === 'm' ? 1 : 2];
        r.segs[i].setAttribute('x', sx(a)); r.segs[i].setAttribute('width', Math.max(0, sx(a + d) - sx(a))); a += d;
      });
      r.perf.setAttribute('width', sx(a) - X0);
      r.head.setAttribute('cx', sx(a));
    });
    const xm = sx(cur.m), xc = sx(cur.c);
    const diff = cur.m - (cur.c - C0) - M0; // скільки Земля «випередила» Купера
    gapT.setAttribute('x', Math.max(110, Math.min(VW - 110, xm)));
    gapT.textContent = diff > 1 ? `Мерф прожила на ${nf(diff, 0)} р. більше` : '';
    aM.innerHTML = ym(cur.m); aC.innerHTML = ym(cur.c);
    const i = Math.max(0, Math.min(N - 1, Math.ceil(u - 1e-4) - 1)), done = u >= N - 0.0005;
    const s = ST[i];
    const fmtD = (yrs, who) => {
      if (who === 'c' && i === 1) return '+3 год 18 хв за етап';
      if (who === 'c' && i === 2) return '+ лічені години';
      if (yrs === 0) return 'за етап — без змін';
      if (who === 'm' && i === 1) return '+23 р. 4 міс. 8 дн. за етап';
      return `+${nf(yrs, 0)} р. за етап`;
    };
    if (u < 0.0005) { dM.textContent = 'на старті місії'; dC.textContent = `на старті (≈ ${nf(C0, 1)} р.)`; cap.textContent = 'Купер відлітає. Мерф — десять.'; }
    else if (done) { dM.textContent = `за місію: +${nf(cur.m - M0, 0)} р.`; dC.textContent = `тілом ≈ ${nf(cur.c, 1)} р., за документами — 124`; cap.textContent = s[3]; }
    else { dM.textContent = fmtD(s[1], 'm'); dC.textContent = fmtD(s[2], 'c'); cap.textContent = `${s[0]}. ${s[3]}`; }
    mks.forEach((m, j) => m.classList.toggle('on', Math.abs(u - j) < 0.02));
  }

  let u = 0, anim = 0;
  const set = (v) => { u = v; rng.value = v; draw(v); };
  const stop = () => { cancelAnimationFrame(anim); anim = 0; play.classList.remove('on'); play.textContent = '▶ Прожити місію'; };
  function tween(to, ms) {
    cancelAnimationFrame(anim);
    if (REDUCE || ms <= 0) { set(to); return; }
    const from = u, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; set(from + (to - from) * e); if (k < 1) anim = requestAnimationFrame(step); else anim = 0; };
    anim = requestAnimationFrame(step);
  }
  rng.addEventListener('input', () => { stop(); set(+rng.value); });
  mks.forEach((m) => m.addEventListener('click', () => { stop(); tween(+m.dataset.u, 700); }));
  play.addEventListener('click', () => {
    if (play.classList.contains('on')) { stop(); return; }
    if (REDUCE) { set(Math.min(N, Math.floor(u + 1e-3) + 1)); return; } // без анімації — крок на етап
    if (u >= N - 0.001) set(0);
    play.classList.add('on'); play.textContent = '❚❚ Пауза';
    // етап за етапом із паузою на позначках
    const next = () => {
      if (!play.classList.contains('on')) return;
      const to = Math.min(N, Math.floor(u + 1e-3) + 1);
      const from = u, t0 = performance.now(), ms = 1600 * (to - from);
      const step = (t) => {
        if (!play.classList.contains('on')) return;
        const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        set(from + (to - from) * e);
        if (k < 1) anim = requestAnimationFrame(step);
        else if (to >= N) stop();
        else anim = setTimeout(() => { anim = requestAnimationFrame(next); }, 650);
      };
      anim = requestAnimationFrame(step);
    };
    next();
  });
  build(); set(0);
  let lastW = 0;
  new ResizeObserver(() => { const w = Math.round(svg.clientWidth); if (w && Math.abs(w - lastW) > 4) { lastW = w; build(); draw(u); } }).observe(svg);
}

/* ═══════════════ 3. 3D-планета і приплив ═══════════════ */
async function initTides(slot) {
  const G = 6.674e-11, C = 2.998e8, MSUN = 1.989e30;
  const RP = 6.371e6, GP = 1.3 * 9.81; // планета розміру Землі; тяжіння Міллер — 130 % земного (як у фільмі)
  const MASS = { star: 10 * MSUN, garg: 1e8 * MSUN };
  const EMAX = 0.6; // далі лінійна теорія не працює; 1,6 : 0,79 — як еліпсоїд Роша біля межі (≈ 2 : 1)
  const st = { m: 'garg', lx: 0 }; // lx = log10(r / r_горизонту)

  const box = el('div', 'vz');
  box.innerHTML = `
    <div class="vz-td" aria-label="Планета біля чорної діри: деформація припливом">
      <div class="vz-td__hud"><b>—</b><span>приплив / власне тяжіння планети</span><span data-e></span></div>
      <div class="vz-td__st"></div>
    </div>
    <div class="vz-td__ctl">
      <span class="seg" role="group" aria-label="Маса діри"><button type="button" data-m="star">Зоряна діра · 10 Сонць</button><button type="button" data-m="garg" class="on">Гаргантюа · 10⁸ Сонць</button></span>
      <label>Відстань <input type="range" min="0" max="6" step="0.01" value="0" aria-label="Відстань у радіусах горизонту"><output></output></label>
    </div>`;
  slot.appendChild(box);
  slot.appendChild(el('p', 'chint', 'Оцінка за Ньютоном: приплив на поверхні 2GM·R/r³ порівнюємо з власним тяжінням планети g (планета розміру Землі, g — 130 % земного, як у фільмі). Якщо приплив більший за g, планету розриває; межа Роша точніша, але того самого порядку. Витяг рідкої однорідної планети — ε ≈ 15/8 · приплив/g (лінійна теорія, показано без перебільшення; понад 60 % вона не працює, тож форму обмежено пропорцією ≈ 2 : 1, як у еліпсоїда Роша біля межі розпаду). Хвилі на поверхні — модель для наочності, не розрахунок. Діра й планета не в масштабі. Біля горизонту діри, що обертається, ньютонівська оцінка лише порядок величини.'));
  const wrap = box.querySelector('.vz-td'), hud = box.querySelector('.vz-td__hud'), hudB = hud.querySelector('b'), hudE = hud.querySelector('[data-e]');
  const stat = box.querySelector('.vz-td__st'), rng = box.querySelector('input'), out = box.querySelector('output');
  const segB = [...box.querySelectorAll('.seg button')];

  const phys = () => {
    const M = MASS[st.m], rs = 2 * G * M / C ** 2, r = rs * 10 ** st.lx;
    const tide = 2 * G * M * RP / r ** 3, ratio = tide / GP;
    const lin = 15 / 8 * ratio;
    return { rs, r, ratio, lin, eps: Math.min(EMAX, lin), broken: ratio >= 1 };
  };
  const dist = (r) => r > 1.5e11 ? `${nf(r / 1.496e11, r > 1.5e12 ? 0 : 1)} а. о.` : `${sci(r / 1e3, 1)} км`;
  function ui() {
    const p = phys();
    hudB.textContent = sci(p.ratio, 2) + ' g';
    hud.classList.toggle('bad', p.broken);
    hudE.textContent = p.broken ? 'приплив сильніший — планету розриває' : p.lin > EMAX ? 'витяг > 60 % — біля межі розпаду' : `витяг ≈ ${p.eps < 0.001 ? '< 0,1' : nf(p.eps * 100, p.eps < 0.1 ? 1 : 0)} %`;
    out.textContent = `${sci(10 ** st.lx, 1)} r_г`;
    stat.textContent = `горизонт ${dist(p.rs)} · відстань ${dist(p.r)}`;
    segB.forEach((b) => b.classList.toggle('on', b.dataset.m === st.m));
    return p;
  }
  ui();

  let THREE, makeSky, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, gradePass;
  try {
    THREE = await import('three');
    ({ makeSky } = await import('./space-bg.js?v=20261018235830'));
    ({ EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js'));
    ({ RenderPass } = await import('three/addons/postprocessing/RenderPass.js'));
    ({ UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js'));
    ({ OutputPass } = await import('three/addons/postprocessing/OutputPass.js'));
    ({ gradePass } = await import('./is-post.js?v=20261018235830'));
  } catch (e) { wrap.appendChild(el('div', 'fail', 'Не вдалося завантажити 3D-сцену. Числа вище все одно рахуються.')); bindOnly(); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { wrap.appendChild(el('div', 'fail', 'Браузер не підтримує WebGL — 3D-сцена недоступна. Числа вище все одно рахуються.')); bindOnly(); return; }
  function bindOnly() {
    rng.addEventListener('input', () => { st.lx = +rng.value; ui(); });
    segB.forEach((b) => b.addEventListener('click', () => { st.m = b.dataset.m; ui(); }));
  }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  wrap.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 2000);
  scene.add(makeSky(THREE, { spikes: 12, spikeSize: .26 }));
  // постобробка: bloom на диску й гребенях хвиль, далі ACES і «кіноплівка»
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .45, .35, .75); composer.addPass(bloom);
  composer.addPass(new OutputPass()); const grade = gradePass({ vignette: .42, grain: .045, ca: 1.3, sat: 1.06, tint: [1, .99, .97] }); composer.addPass(grade);

  // ── діра: площина, повернута до камери, малює тінь, фотонне кільце й лінзований диск «обіймами» (той самий вигляд, що в розділі 02; умовно, не в масштабі) ──
  const bh = new THREE.Group(); scene.add(bh);
  const bhU = { uT: { value: 0 } };
  const bhM = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), new THREE.ShaderMaterial({
    transparent: true, premultipliedAlpha: true, depthWrite: false, uniforms: bhU,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec2 vU; uniform float uT;
      float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      void main(){ vec2 p = (vU - .5) * vec2(4., 2.);
        float rs = .40, r = length(p), ang = atan(p.y, p.x);
        float sh = 1. - smoothstep(rs*.97, rs*1.03, r);
        float ring = exp(-pow((r - rs*1.05)/.012, 2.));
        float up = smoothstep(-.45, .6, p.y / max(r, 1e-3));
        float halo = exp(-pow((r - rs*(1.28 + .10*up))/(rs*(.10 + .16*up)), 2.)) * (.3 + .7*up) * smoothstep(rs*1.0, rs*1.1, r);
        float th = .018 + .022*min(abs(p.x), 2.);
        float band = exp(-pow((p.y + .01*p.x)/th, 2.)) * smoothstep(2., .7, abs(p.x));
        float gas = .8 + .4*vn(vec2(ang*3. + r*6. - uT*.25, r*14.));           // струмені газу, повільно пливуть
        float glow = exp(-max(r - rs, 0.) * 3.5) * .12 * (1. - sh);
        float lum = (ring*1.6 + halo*1.1*gas + band*1.4*gas) + glow*1.2;
        vec3 col = mix(vec3(.95, .5, .18), vec3(1., .92, .78), clamp(lum*.5 - .1, 0., 1.)) * lum;
        float e = smoothstep(2., 1.55, abs(p.x)) * smoothstep(1., .78, abs(p.y));
        float a = clamp(sh*.98 + lum*.5, 0., 1.) * e;
        gl_FragColor = vec4(col * e, a); }`
  }));
  bhM.renderOrder = 1; bh.add(bhM);
  const disk = { material: bhM.material };

  // ── планета: сфера 64×64, деформація й хвилі у шейдері ──
  const uni = { uS: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uL: { value: new THREE.Vector3() } };
  const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), new THREE.ShaderMaterial({
    uniforms: uni,
    vertexShader: `
      uniform float uS, uT, uA; varying vec3 vN, vV; varying float vH;
      void main(){
        vec3 p = position;
        float phi = atan(p.z, p.x);
        float lat = 1. - p.y*p.y;
        float big = pow(.5 + .5*sin(2.*phi - uT*.55 + p.y*1.2), 14.);      // хвиля-гора, що біжить по екватору
        float rip = (.5 + .5*sin(11.*phi + 6.*p.y - uT*1.9)) * (.5 + .5*sin(7.*p.y - 5.*phi + uT*1.3));
        float h = uA*(big + .06*rip) * lat;
        vH = big*lat;
        p *= 1. + h;
        float k = 1. + uS;                                                  // витяг уздовж осі на діру, об'єм сталий
        p.x *= k; p.yz /= sqrt(k);
        vec3 n = normal; n.x /= k; n.yz *= sqrt(k);
        vN = normalize(normalMatrix * n);
        vec4 mv = modelViewMatrix * vec4(p, 1.); vV = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uL; uniform float uA; varying vec3 vN, vV; varying float vH;
      void main(){
        vec3 n = normalize(vN), v = normalize(-vV), l = normalize(uL);
        float d = max(dot(n, l), 0.);
        float crest = smoothstep(.25, .95, vH) * clamp(uA*14., 0., 1.);
        vec3 deep = vec3(.02, .09, .16), sea = vec3(.06, .30, .40);
        vec3 col = mix(deep, sea, .45 + .55*d);
        col = mix(col, vec3(.86, .94, .97), crest*.75);
        vec3 lightC = vec3(1., .78, .55);
        float spec = pow(max(dot(reflect(-l, n), v), 0.), 40.) * (1. - crest);
        vec3 c = col*(.07 + 1.15*d*lightC) + spec*lightC*.55;
        float rim = pow(1. - max(dot(n, v), 0.), 3.);
        c += rim * vec3(.25, .45, .75) * (.35 + .65*d);
        gl_FragColor = vec4(c, 1.);
      }`
  }));
  scene.add(planet);

  // ── уламки (якщо приплив сильніший за тяжіння) ──
  const NP = 6000, pos = new Float32Array(NP * 3), rnd = new Float32Array(NP), colA = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) {
    let x, y, z, q; do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; q = x * x + y * y + z * z; } while (q > 1 || q < .02);
    const s = Math.cbrt(Math.random()) / Math.sqrt(q) * (Math.random() < .55 ? 1 : .8);
    pos.set([x * s, y * s, z * s], i * 3); rnd[i] = Math.random();
    const w = Math.random() < .6; colA.set(w ? [.2, .5, .62] : [.55, .42, .32], i * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('aR', new THREE.BufferAttribute(rnd, 1));
  pg.setAttribute('aC', new THREE.BufferAttribute(colA, 3));
  const pu = { uT: { value: 0 }, uPx: { value: 1 }, uX: { value: -4 } };
  const debris = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: pu, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uT, uPx, uX; attribute float aR; attribute vec3 aC; varying vec3 vC; varying float vA;
      void main(){
        vec3 p = position; float s = uT;
        float k = 1. + 4.5*s*s*(.6 + aR);
        p.x *= k; p.yz *= 1./(1. + 1.8*s);
        p.x += uX * s*s * (.4 + aR) * .5;                                   // потік до діри
        float sw = s*s*(p.x)*.12; p.z += sw; p.y += sw*.3;
        vC = aC; vA = (1. - smoothstep(.75, 1., s)) * smoothstep(0., .05, s + .02);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = uPx * (2. + 2.*aR) * (6. / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      void main(){ vec2 q = gl_PointCoord - .5; float r = dot(q,q); if (r > .25) discard;
        gl_FragColor = vec4(vC*1.6, vA*(1. - r*4.)); }`
  }));
  debris.visible = false; scene.add(debris);

  let W = 1, H = 1, ready = false;
  function resize() {
    W = wrap.clientWidth || 1; H = wrap.clientHeight || 1;
    renderer.setSize(W, H, false); composer.setSize(W, H); cam.aspect = W / H;
    cam.fov = 40; cam.updateProjectionMatrix(); if (typeof layout === 'function' && ready) layout();
    pu.uPx.value = renderer.getPixelRatio();
  }
  new ResizeObserver(() => { resize(); if (!running) frame(performance.now()); }).observe(wrap);
  resize();

  let p = ui(), t = 0, last = performance.now(), breakT = 0, running = false, vis = false, raf = 0;
  function layout() {
    const bx = -3.4 - 1.25 * st.lx;           // дальше — менша діра на екрані (лише наочно)
    bh.position.set(bx, .35, -1.2 - .6 * st.lx);
    const sc = st.m === 'garg' ? 1.25 : .8;
    bh.scale.setScalar(sc);
    bh.lookAt(cam.position.x, bh.position.y, cam.position.z);                     // площина діри завжди до камери, диск — горизонтально
    uni.uL.value.copy(bh.position).normalize().add(new THREE.Vector3(.2, .55, .5));
    const hf = 2 * Math.atan(Math.tan(cam.fov * Math.PI / 360) * cam.aspect);
    const d = Math.max(6.2, Math.min(15, 4.4 / Math.tan(hf / 2)));
    cam.position.set(.9, .9, d);
    cam.lookAt(-1.4, .1, -.6);
    bh.lookAt(cam.position.x, bh.position.y, cam.position.z);
    pu.uX.value = bx;
  }
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!REDUCE) t += dt;
    uni.uT.value = t; disk.material.uniforms.uT.value = t;
    if (p.broken) {
      planet.visible = false; debris.visible = true;
      if (!REDUCE) breakT = (breakT + dt / 6) % 1; else breakT = .45;
      pu.uT.value = breakT;
    } else {
      planet.visible = true; debris.visible = false; breakT = 0;
      uni.uS.value = p.eps;
      uni.uA.value = Math.min(.09, .015 + p.eps * .55) * (p.eps > 1e-4 ? 1 : .3);
      planet.rotation.y = REDUCE ? 0 : Math.sin(t * .35) * Math.min(.14, p.eps * 1.4);   // гойдання відносно діри
    }
    grade.tick(t, W, H); composer.render();
  }
  const loop = (now) => { frame(now); raf = running ? requestAnimationFrame(loop) : 0; };
  const start = () => { if (running || REDUCE) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); };
  const halt = () => { running = false; cancelAnimationFrame(raf); };
  const changed = () => { p = ui(); layout(); if (!running) frame(performance.now()); };
  rng.addEventListener('input', () => { st.lx = +rng.value; changed(); });
  segB.forEach((b) => b.addEventListener('click', () => { st.m = b.dataset.m; changed(); }));
  visible(wrap, (v) => { vis = v; v ? start() : halt(); });
  window.IS_TIDES = { renderer, composer, bloom, grade, frame };
  ready = true; layout(); frame(performance.now());
}

/* ═══════════════ 4. Спектрометр блакитного зсуву ═══════════════ */
function initBlue(slot) {
  const h = 6.62607e-34, kB = 1.380649e-23, c = 2.99792458e8, b = 2.897771955e-3, T0 = 2.725;
  const LOG0 = 8.5, LOG1 = 19; // log10 ν, Гц
  const BANDS = [
    [8.5, Math.log10(3e11), 'радіо й мікрохвилі', '#3a4152', 'радіо'],
    [Math.log10(3e11), Math.log10(3.85e14), 'інфрачервоне', '#6b2a24', 'ІЧ'],
    [Math.log10(3.85e14), Math.log10(7.9e14), 'видиме', null],
    [Math.log10(7.9e14), Math.log10(3e16), 'ультрафіолет', '#4b2f8f', 'УФ'],
    [Math.log10(3e16), 19, 'рентген', '#2d6f8f', 'рентген']
  ];
  const box = el('div', 'vz');
  box.innerHTML = `
    <div class="vz-bl__ctl">
      <label>Множник B <input type="range" min="0" max="5" step="0.001" aria-label="Множник блакитного зсуву"><output></output></label>
      <button type="button" class="vz-btn" data-b="61000">Як у Гаргантюа</button>
      <button type="button" class="vz-btn" data-b="1">Наше небо</button>
      <button type="button" class="vz-btn" data-spin hidden></button>
    </div>
    <div class="vz-bl">
      <div class="vz-bl__plot"><canvas aria-label="Спектр чорного тіла"></canvas></div>
      <div class="vz-bl__sky"><span class="vz-k">небо планети</span><canvas width="300" height="300" aria-label="Колір неба"></canvas><p></p></div>
      <div class="calc">
        <div><span>температура неба T = B·2,7 К</span><b data-k="T"></b></div>
        <div><span>пік (закон Віна) λmax = b/T</span><b data-k="L"></b></div>
        <div><span>пік припадає на</span><b data-k="R"></b></div>
        <div><span>частка у видимому / УФ / рентгені</span><b data-k="F"></b></div>
        <div><span>потужність порівняно з нашим небом (∝ T⁴)</span><b data-k="P"></b></div>
      </div>
    </div>`;
  slot.appendChild(box);
  slot.appendChild(el('p', 'chint', 'Умовний розрахунок для заданого множника: реліктове випромінювання 2,7 К, підняте в B разів, лишається чорнотільним (закон Планка) з температурою B·2,7 К. Крива — спектральна яскравість на одиницю довжини хвилі, нормована на свій пік; сіра — наше небо. Реальний спектр на планеті залежить від геометрії Керра й руху планети: у напрямку руху зсув сильніший, позаду — слабший. Колір неба — інтеграл Планка з кривими чутливості ока CIE 1931 (наближення Ваймана — Слоуна — Ширлі).'));

  const cv = box.querySelector('.vz-bl__plot canvas'), sky = box.querySelector('.vz-bl__sky canvas'), skyP = box.querySelector('.vz-bl__sky p');
  const rng = box.querySelector('input'), out = box.querySelector('output'), spinB = box.querySelector('[data-spin]');
  const K = (k) => box.querySelector(`[data-k=${k}]`);

  // Спектр: B_λ на лог-шкалі частоти, нормований на пік Віна
  const Bl = (lam, T) => { const x = h * c / (lam * kB * T); return x > 700 ? 0 : 1 / (lam ** 5 * Math.expm1(x)); };
  const peakNorm = (T) => Bl(b / T, T);
  // Частка потужності в діапазоні частот: ∫ x³/(eˣ−1) dx / (π⁴/15)
  function frac(n1, n2, T) {
    const x1 = h * n1 / (kB * T), x2 = h * n2 / (kB * T); if (x1 > 700) return 0;
    const a = Math.log(x1), z = Math.log(Math.min(x2, 700)), n = 400; let s = 0;
    for (let i = 0; i <= n; i++) { const u = a + (z - a) * i / n, x = Math.exp(u), f = x ** 4 / Math.expm1(x), w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); s += w * f; }
    return Math.max(0, s * (z - a) / n / 3 / (Math.PI ** 4 / 15));
  }
  // Колір чорного тіла: CIE 1931 (Wyman, Sloan, Shirley 2013) → лінійний sRGB
  const gs = (x, m, s1, s2) => { const t = (x - m) / (x < m ? s1 : s2); return Math.exp(-.5 * t * t); };
  const cmf = (l) => [1.056 * gs(l, 599.8, 37.9, 31) + .362 * gs(l, 442, 16, 26.7) - .065 * gs(l, 501.1, 20.4, 26.2),
    .821 * gs(l, 568.8, 46.9, 40.5) + .286 * gs(l, 530.9, 16.3, 31.1), 1.217 * gs(l, 437, 11.8, 36) + .681 * gs(l, 459, 26, 13.8)];
  function bbXYZ(T) { let X = 0, Yv = 0, Z = 0; for (let l = 380; l <= 780; l += 5) { const p = Bl(l * 1e-9, T), [x, y, z] = cmf(l); X += p * x; Yv += p * y; Z += p * z; } return [X, Yv, Z]; }
  function bbRGB(T) {
    const [X, Yv, Z] = bbXYZ(T); if (!(Yv > 0)) return [0, 0, 0];
    let r = 3.2406 * X - 1.5372 * Yv - .4986 * Z, g = -.9689 * X + 1.8758 * Yv + .0415 * Z, bl = .0557 * X - .204 * Yv + 1.057 * Z;
    r = Math.max(0, r); g = Math.max(0, g); bl = Math.max(0, bl); const m = Math.max(r, g, bl) || 1;
    return [r, g, bl].map((v) => { v /= m; return v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055; });
  }
  const lY = (T) => Math.log10(bbXYZ(T)[1] || 1e-300);
  const Y800 = lY(800), Y6000 = lY(6000);
  // Веселка для видимої смуги
  const wlRGB = (l) => { const [x, y, z] = cmf(l); let r = 3.2406 * x - 1.5372 * y - .4986 * z, g = -.9689 * x + 1.8758 * y + .0415 * z, bb = .0557 * x - .204 * y + 1.057 * z;
    const m = Math.max(r, g, bb, .3); return [r, g, bb].map((v) => Math.round(255 * Math.max(0, v / m) ** .6)); };

  const fmtL = (m) => m >= 1e-3 ? `${nf(m * 1e3, m >= 1e-2 ? 0 : 2)} мм` : m >= 1e-6 ? `${nf(m * 1e6, m >= 1e-5 ? 0 : 2)} мкм` : `${nf(m * 1e9, m >= 1e-8 ? 0 : 1)} нм`;
  const bandOf = (lnu) => (BANDS.find((x) => lnu >= x[0] && lnu < x[1]) || BANDS[4])[2];

  let B = 61000, W = 1, H = 1, dpr = 1;
  const ctx = cv.getContext('2d'), sctx = sky.getContext('2d');
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }

  function plot() {
    const T = B * T0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const L = 14, R = W - 14, TOP = 30, BOT = H - 58, sx = (ln) => L + (R - L) * (ln - LOG0) / (LOG1 - LOG0);
    // сітка частот
    ctx.font = '500 10px "Roboto Mono", monospace'; ctx.textAlign = 'center';
    for (let e = 9; e <= 19; e++) {
      const x = sx(e); ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.moveTo(x, TOP); ctx.lineTo(x, BOT); ctx.stroke();
      if (e % 2 === 1 || W > 640) { ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillText('10' + String(e).split('').map((d) => SUP[d]).join(''), x, H - 8); }
    }
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillText('частота, Гц →', L, TOP - 14);
    // смуги діапазонів
    const by = BOT + 8, bh = 20;
    BANDS.forEach(([a, z, name, col, short]) => {
      const x0 = sx(Math.max(a, LOG0)), x1 = sx(Math.min(z, LOG1));
      if (col) { ctx.fillStyle = col; ctx.fillRect(x0, by, x1 - x0 - 1, bh); }
      else { const gr = ctx.createLinearGradient(x0, 0, x1, 0); for (let k = 0; k <= 10; k++) { const l = 780 - 400 * k / 10, [r, g, bb] = wlRGB(l); gr.addColorStop(k / 10, `rgb(${r},${g},${bb})`); } ctx.fillStyle = gr; ctx.fillRect(x0, by - 3, x1 - x0, bh + 6); }
      if (col) { ctx.font = '600 10.5px Inter, sans-serif'; const nm = ctx.measureText(name).width < x1 - x0 - 8 ? name : short;
        if (ctx.measureText(nm).width < x1 - x0 - 4) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center'; ctx.fillText(nm, (x0 + x1) / 2, by + 14); } }
    });
    // підпис «видиме» над смугою
    { const v0 = sx(BANDS[2][0]), v1 = sx(BANDS[2][1]);
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(v0, TOP, v1 - v0, BOT - TOP);
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(v0, TOP); ctx.lineTo(v0, BOT); ctx.moveTo(v1, TOP); ctx.lineTo(v1, BOT); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '600 10px Inter, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('видиме', v0 - 4, BOT - 6); }
    // крива
    const curve = (TT, n) => { const pk = peakNorm(TT), pts = []; for (let i = 0; i <= n; i++) { const ln = LOG0 + (LOG1 - LOG0) * i / n, lam = c / 10 ** ln; pts.push([sx(ln), BOT - (BOT - TOP) * Bl(lam, TT) / pk]); } return pts; };
    const n = Math.round(W * 1.2);
    if (B > 1.02) { const g0 = curve(T0, n); ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); g0.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.setLineDash([]); }
    const pts = curve(T, n);
    const fill = ctx.createLinearGradient(L, 0, R, 0);
    BANDS.forEach(([a, z, , col]) => { const k0 = (Math.max(a, LOG0) - LOG0) / (LOG1 - LOG0), k1 = (Math.min(z, LOG1) - LOG0) / (LOG1 - LOG0);
      if (col) { fill.addColorStop(k0, col); fill.addColorStop(k1, col); } else { for (let k = 0; k <= 6; k++) { const l = 780 - 400 * k / 6, [r, g, bb] = wlRGB(l); fill.addColorStop(k0 + (k1 - k0) * k / 6, `rgb(${r},${g},${bb})`); } } });
    ctx.globalAlpha = .55; ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(pts[0][0], BOT); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(pts[n][0], BOT); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    // пік Віна
    const lpk = Math.log10(c * T / b), xp = sx(lpk);
    ctx.strokeStyle = '#EA5212'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xp, TOP - 4); ctx.lineTo(xp, BOT); ctx.stroke();
    ctx.fillStyle = '#EA5212'; ctx.beginPath(); ctx.arc(xp, TOP, 4, 0, 7); ctx.fill();
    ctx.font = '600 11px "Roboto Mono", monospace'; const lab = `λmax ${fmtL(b / T)}`, tw = ctx.measureText(lab).width;
    ctx.textAlign = 'left'; ctx.fillStyle = '#ffd6c2'; ctx.fillText(lab, Math.min(R - tw, Math.max(L, xp + 8)) , TOP - 12 + (xp + 8 + tw > R ? 0 : 0));
  }

  function drawSky() {
    const T = B * T0, S = sky.width, g = sctx; g.clearRect(0, 0, S, S);
    const ly = lY(T), br = Math.max(0, Math.min(1, (ly - Y800) / (Y6000 - Y800)));
    const [r, gg, bb] = bbRGB(Math.min(T, 4e5));
    const cx = S / 2, R = S * .42;
    g.save(); g.beginPath(); g.arc(cx, cx, R, 0, 7); g.clip();
    g.fillStyle = '#020308'; g.fillRect(0, 0, S, S);
    // зорі видно лише в темному небі
    if (br < .5) { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; g.fillStyle = `rgba(255,255,255,${.8 * (1 - br * 2)})`; for (let i = 0; i < 70; i++) { g.beginPath(); g.arc(rnd() * S, rnd() * S, rnd() * 1.4 + .3, 0, 7); g.fill(); } }
    const col = (a) => `rgba(${Math.round(r * 255)},${Math.round(gg * 255)},${Math.round(bb * 255)},${a})`;
    const gr = g.createRadialGradient(cx, cx * .8, R * .1, cx, cx, R);
    gr.addColorStop(0, col(br)); gr.addColorStop(1, col(br * .75));
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    g.restore();
    // сяйво назовні — сильніше, коли гаряче
    const over = Math.max(0, Math.min(1, (Math.log10(T) - 3.6) / 1.6));
    if (br > .05) { const hg = g.createRadialGradient(cx, cx, R * .9, cx, cx, S * .5); hg.addColorStop(0, col(.5 * br * (.4 + over))); hg.addColorStop(1, col(0)); g.fillStyle = hg; g.beginPath(); g.arc(cx, cx, S * .5, 0, Math.PI * 2); g.arc(cx, cx, R, 0, Math.PI * 2, true); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cx, R, 0, 7); g.stroke();
    skyP.textContent = T > 1e5 ? 'Блакитно-біле й сліпуче. Здебільшого — невидимий ультрафіолет і мʼякий рентген.'
      : T > 7000 ? 'Блакитно-біле сяйво з усього неба, гарячіше за поверхню Сонця.'
      : T > 2500 ? 'Небо світиться, як розпечений метал або зоря.'
      : br > .01 ? 'Ледь помітне темно-червоне жевріння.'
      : 'Небо темне: усе випромінювання — поза видимим світлом.';
  }

  function nums() {
    const T = B * T0;
    out.textContent = '×' + nf(B, 0);
    K('T').textContent = `${nf(T, T < 100 ? 1 : 0)} К`;
    K('L').textContent = fmtL(b / T);
    K('R').textContent = bandOf(Math.log10(c * T / b));
    const pct = (v) => v < 0.0005 ? '0' : v < .01 ? '< 1' : nf(v * 100, 0);
    K('F').textContent = `${pct(frac(3.85e14, 7.9e14, T))} / ${pct(frac(7.9e14, 3e16, T))} / ${pct(frac(3e16, 1e21, T))} %`;
    K('P').textContent = '×' + sci(B ** 4, 1);
  }
  const draw = () => { plot(); drawSky(); nums(); };
  const setB = (v) => { B = Math.max(1, Math.min(1e5, v)); rng.value = Math.log10(B); draw(); };
  rng.addEventListener('input', () => { B = 10 ** +rng.value; draw(); });
  box.querySelectorAll('[data-b]').forEach((bt) => bt.addEventListener('click', () => setB(+bt.dataset.b)));
  // Множник з повзунка розділу 03 (якщо він є на сторінці)
  const spin = (s) => { if (!s || !(s.K > 1)) return; spinB.hidden = false; spinB.dataset.k = s.K; spinB.textContent = `З розділу 03: ×${nf(Math.min(1e5, s.K), 0)}`; };
  spin(window.IS_SPIN); addEventListener('is-spin', (e) => spin(e.detail));
  spinB.addEventListener('click', () => setB(+spinB.dataset.k));
  new ResizeObserver(() => { size(); plot(); }).observe(cv);
  size(); setB(B);
}

/* ═══════════════ старт ═══════════════ */
const run = (id, fn) => { const s = $(id); if (!s) return; try { const r = fn(s); if (r && r.catch) r.catch((e) => console.error(id, e)); } catch (e) { console.error(id, e); } };
run('viz-intro', initIntro);
run('viz-twins', initTwins);
run('viz-tides', initTides);
run('viz-blue', initBlue);
