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
  l.rel = 'stylesheet'; l.href = new URL('./is-viz.css?v=20261020161007', import.meta.url).href; l.dataset.vz = '1';
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
    ['Тінь і лінзування', 0, '#bh-sec', '02', 'Унікальна форма тіні та сяючого диска навколо чорної діри обчислювалася програмою DNGR на основі рівнянь Ейнштейна, з чого виросла наукова стаття 2015 року. Для фінального монтування фільму прибрали лише зайві кольорові ефекти акреційного диска.'],
    ['Година = 7 років', 0, '#time', '03', 'Коефіцієнт сповільнення часу в 61 тисячу разів цілком реальний поблизу об\'єктів із граничною швидкістю обертання. Єдиним застереженням залишається те, що подібні швидкості навряд чи створюються в реальному космосі.'],
    ['Купер і Мерф', 0, '#twins-sec', '04', 'Величезна різниця у віці між батьком і донькою є прямим наслідком гравітаційного уповільнення часу. Головну роль тут відіграє потужне поле тяжіння гіганта Гаргантюа, а не швидкісний переліт корабля.'],
    ['Хвилі-гори', 1, '#tides', '05', 'Поблизу надмасивної чорної діри припливні сили не розривають планету, проте суттєво деформують її форму. Гіпотеза про виникнення хвиль від легкого гойдання цілком життєздатна, хоча в самому фільмі вона не підкріплена розрахунками.'],
    ['Блакитний зсув', 1, '#blue', '06', 'Світло ззовні на планеті стискається в ту саму 61 тисячу разів і мало б випалити її ультрафіолетом і рентгеном. Творці фільму свідомо опустили цей наслідок.'],
    ['Червоточина', 1, '#worm', '07', 'Тривимірний вигляд червоточини як кулі з іншим зоряним небом повністю науково обґрунтований і опублікований. Проте питання реального існування прохідних тунелів залишається відкритим через потребу в екзотичній матерії.'],
    ['Тесеракт і петля', 2, '#tess', '08', 'П\'ятивимірний тесеракт і спроба передати повідомлення у минуле є найбільш сміливою та відвертою спекуляцією усього фільму, яку сам науковий консультант не намагався видавати за доведену науку.']
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
  /* вступ: таблиця спершу розгорнута, назви й вердикти «набираються» з крапок і тире Морзе (з нотами, якщо увімкнено звук статті),
     потім рядки по черзі згортаються, а стрілки ледь хитаються — видно, що кожен пункт можна розгорнути. Будь-який клік — вступ зупиняється. */
  const items = [...box.querySelectorAll('.vz-mx__item')], CODE = '·−';
  let stop = false; box.addEventListener('pointerdown', () => { stop = true; }, { once: true });
  function typeIn(node, text, speed, beep) {
    return new Promise((ok) => { let k = 0;
      const step = () => { if (stop) { node.textContent = text; return ok(); }
        node.textContent = text.slice(0, k) + [...text.slice(k)].map((ch) => (ch === ' ' ? ' ' : CODE[Math.random() < .5 ? 0 : 1])).join('');
        if (beep && k % 5 === 0 && window.IS_SOUND) IS_SOUND.morse(Math.random() < .5 ? '.' : '-', k);
        k += Math.max(1, Math.round(text.length / 60)); if (k < text.length) setTimeout(step, speed); else { node.textContent = text; ok(); } }; step(); });   // довгий текст — кількома літерами за крок, щоб рядок «падав» за ~0,5 с
  }
  const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
  // доміно: увесь текст одразу — крапки й тире; знизу вгору кожен рядок за мить «розшифровується» в літери й згортається,
  // а наступний (вищий) підхоплює ще до того, як попередній закінчив
  const morseOf = (t) => [...t].map((ch) => (ch === ' ' ? ' ' : CODE[Math.random() < .5 ? 0 : 1])).join('');
  async function intro() {
    const parts = items.map((it) => { const nm = it.querySelector('.vz-mx__name'), nTxt = [...nm.childNodes].find((n) => n.nodeType === 3), p = it.querySelector('.vz-mx__body p'), bTxt = [...p.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      const a = { nTxt, n: nTxt.textContent, bTxt, b: bTxt.textContent }; nTxt.textContent = morseOf(a.n); bTxt.textContent = morseOf(a.b); return a; });
    items.forEach((it) => { it.classList.add('open'); it.querySelector('.vz-mx__row').setAttribute('aria-expanded', 'true'); });
    await wait(1600);
    const N = items.length;
    await Promise.all(parts.map(async (q, i) => {
      const order = N - 1 - i; await wait(order * 650);                       // нижній — першим
      if (stop) { q.nTxt.textContent = q.n; q.bTxt.textContent = q.b; return; }
      if (window.IS_SOUND) IS_SOUND.morse(order % 2 ? '-' : '.', order);
      await Promise.all([typeIn(q.nTxt, q.n, 45, false), typeIn(q.bTxt, q.b, 14, false)]);
      if (stop) return; await wait(450);
      const it = items[i]; it.classList.add('fall'); it.classList.remove('open'); it.querySelector('.vz-mx__row').setAttribute('aria-expanded', 'false');
      setTimeout(() => it.classList.remove('fall'), 800);
    }));
    if (!stop) { box.classList.add('nudge'); setTimeout(() => box.classList.remove('nudge'), 1600); }
  }
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { box.classList.add('in'); io.disconnect(); intro(); } }, { threshold: 0.35 });
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
  let rows, gapT, pin;
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
  // клік по стрічці: вертикальна мітка в цьому місці й підпис «коли одному X — іншому Y»
  pin = { ln: mk('line', { y1: 22, y2: 164, stroke: 'var(--ink)', 'stroke-width': 1.2, 'stroke-dasharray': '2 3', opacity: 0 }),
    tx: mk('text', { y: 14, 'text-anchor': 'middle', style: 'font:600 11px var(--mono);fill:var(--ink);paint-order:stroke;stroke:var(--paper,#fff);stroke-width:4px', opacity: 0 }) };
  pin.ln.style.transition = pin.tx.style.transition = 'opacity .4s';
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
  /* клік по точці стрічки: знаходимо момент місії, коли в цієї людини був такий вік, і показуємо вік обох у той момент */
  const inv = (k, a) => { const base = k === 'm' ? M0 : C0, idx = k === 'm' ? 1 : 2; if (a <= base) return null; let a0 = base;
    for (let i = 0; i < N; i++) { const d = ST[i][idx]; if (d > 0 && a <= a0 + d) return i + (a - a0) / d; a0 += d; } return N; };
  svg.style.cursor = 'pointer';
  svg.addEventListener('click', (e) => {
    const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * VW / r.width, y = (e.clientY - r.top) * 196 / r.height;
    const k = y < 92 ? 'm' : 'c', a = Math.max(0, Math.min(AMAX, (x - X0) / (X1 - X0) * AMAX)), uu = inv(k, a); stop();
    let txt;
    if (uu === null) { const m = k === 'm' ? a : a - (C0 - M0), c = k === 'c' ? a : a + (C0 - M0);   // до місії обоє старіють однаково
      txt = m < 0 ? `Мерф ще не народилась — Куперу ${nf(c, 0)}` : `до місії: Мерф ${nf(m, 0)}, Куперу ${nf(c, 0)}`; tween(0, 500); }
    else { const w = at(uu); txt = `коли Мерф ${nf(w.m, 0)} — Куперу ${nf(w.c, 1)}`; tween(uu, 700);
      if (k === 'c' && a > at(N).c + .3) txt = `Купер не доживе до ${nf(a, 0)} у цій історії — у фіналі йому ${nf(at(N).c, 1)}`; }
    pin.ln.setAttribute('x1', x); pin.ln.setAttribute('x2', x); pin.tx.setAttribute('x', Math.max(120, Math.min(VW - 120, x))); pin.tx.textContent = txt;
    pin.ln.setAttribute('opacity', .8); pin.tx.setAttribute('opacity', 1); clearTimeout(pin.t);
    pin.t = setTimeout(() => { pin.ln.setAttribute('opacity', 0); pin.tx.setAttribute('opacity', 0); }, 4500);
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
      <button type="button" class="vz-btn" data-again hidden>ще раз</button>
    </div>`;
  slot.appendChild(box);
  slot.appendChild(el('p', 'chint', 'Оцінка за Ньютоном: приплив на поверхні 2GM·R/r³ порівнюємо з власним тяжінням планети g (планета розміру Землі, g — 130 % земного, як у фільмі). Якщо приплив більший за g, планету розриває; межа Роша точніша, але того самого порядку. Витяг рідкої однорідної планети — ε ≈ 15/8 · приплив/g (лінійна теорія, показано без перебільшення; понад 60 % вона не працює, тож форму обмежено пропорцією ≈ 2 : 1, як у еліпсоїда Роша біля межі розпаду). Хвилі на поверхні — модель для наочності, не розрахунок. Діра й планета не в масштабі. Біля горизонту діри, що обертається, ньютонівська оцінка лише порядок величини.'));
  const wrap = box.querySelector('.vz-td'), hud = box.querySelector('.vz-td__hud'), hudB = hud.querySelector('b'), hudE = hud.querySelector('[data-e]');
  const stat = box.querySelector('.vz-td__st'), rng = box.querySelector('input'), out = box.querySelector('output');
  const segB = [...box.querySelectorAll('.seg button')], againB = box.querySelector('[data-again]');

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
    ({ makeSky } = await import('./space-bg.js?v=20261019085437'));
    ({ EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js'));
    ({ RenderPass } = await import('three/addons/postprocessing/RenderPass.js'));
    ({ UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js'));
    ({ OutputPass } = await import('three/addons/postprocessing/OutputPass.js'));
    ({ gradePass } = await import('./is-post.js?v=20261019085437'));
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

  // ── планета Міллер шарами: океан-світ (мілини, острівці піску, шорсткість — блиск Гаргантюа), хмари, атмосфера.
  //    Приплив чесно: еліпсоїд (витяг uS) уздовж осі на діру; вісь повільно ходить (лібрація uPhi) — припливні горби
  //    пливуть по океану, а слідом біжить хвиля-гора (світла смуга піни). Світло — широке тепле джерело (диск Гаргантюа). ──
  const uni = { uS: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uPhi: { value: 0 }, uL: { value: new THREE.Vector3() }, uLay: { value: 0 } };
  const NOISE3 = `
    vec3 h3(vec3 p){ p=fract(p*vec3(.1031,.103,.0973)); p+=dot(p,p.yxz+33.33); return fract((p.xxy+p.yxx)*p.zyx)*2.-1.; }
    float n3(vec3 p){ vec3 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
      return mix(mix(mix(dot(h3(i),f),dot(h3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(h3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(h3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
                 mix(mix(dot(h3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(h3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(h3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(h3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }
    float fbm(vec3 p){ float s=0., a=.5; for(int k=0;k<5;k++){ s+=a*n3(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }`;
  // спільна деформація: витяг уздовж осі ax = (cos φ, 0, sin φ) при сталому об'ємі; хвиля-гора біжить по екватору
  const DEFORM = `
    uniform float uS, uT, uA, uPhi, uLay;
    vec3 deform(vec3 p, vec3 nIn, out vec3 nOut, out float vh){
      float phi = atan(p.z, p.x), lat = 1. - p.y*p.y;
      // хвиля-гора — здуття самої поверхні: пологий схил позаду, крутіший фронт (асиметрія), без окремого «гребеня-об'єкта»
      float sw = .5 + .5*sin(2.*phi - uT*.55 + p.y*1.2), big = pow(sw, 5.) * (.75 + .25*sin(2.*phi - uT*.55 + p.y*1.2 + 1.1));
      float rip = (.5 + .5*sin(11.*phi + 6.*p.y - uT*1.9)) * (.5 + .5*sin(7.*p.y - 5.*phi + uT*1.3));
      float h = uA*(big + .06*rip) * lat * (1. - uLay*.7);
      vh = big*lat;
      p *= 1. + h;
      vec3 ax = vec3(cos(uPhi), 0., sin(uPhi)); float k = 1. + uS;
      float d = dot(p, ax); p = (p - ax*d) / sqrt(k) + ax*d*k;
      float dn = dot(nIn, ax); nOut = normalize((nIn - ax*dn) * sqrt(k) + ax*dn / k);
      return p; }`;
  const VTX = `varying vec3 vN, vV, vP; varying float vH; ${DEFORM}
    void main(){ vec3 n; float vh; vec3 p = deform(position, normal, n, vh); vP = position; vH = vh;
      // нормаль — з реальної форми: деформуємо дві сусідні точки й беремо векторний добуток (схил хвилі ловить світло)
      { float R0 = length(position), e = .012; vec3 nn = normalize(position);
        vec3 t1 = normalize(cross(nn, abs(nn.y) > .99 ? vec3(1., 0., 0.) : vec3(0., 1., 0.))), t2 = cross(nn, t1), dn; float dv;
        vec3 p1 = deform(normalize(position + t1*e)*R0, nn, dn, dv), p2 = deform(normalize(position + t2*e)*R0, nn, dn, dv);
        vec3 nr = normalize(cross(p1 - p, p2 - p)); if (dot(nr, p) < 0.) nr = -nr; n = nr; }
      vN = normalize(normalMatrix * n); vec4 mv = modelViewMatrix * vec4(p, 1.); vV = mv.xyz; gl_Position = projectionMatrix * mv; }`;
  const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), new THREE.ShaderMaterial({
    uniforms: uni, vertexShader: VTX,
    fragmentShader: `uniform vec3 uL; uniform float uA, uT, uPhi, uS; varying vec3 vN, vV, vP; varying float vH; ${NOISE3}
      void main(){
        vec3 n = normalize(vN), v = normalize(-vV), l = normalize(uL);
        // водний світ: мілини й острівці піску з fbm; океан сіро-сталевий, мілина світліша й зеленіша
        vec3 q = normalize(vP);
        float m = fbm(q*2.6 + 3.) * .6 + fbm(q*7. + 1.) * .4;
        float shallow = smoothstep(.08, .3, m), sand = smoothstep(.3, .38, m);
        vec3 deep = vec3(.09, .15, .2), sea = vec3(.2, .33, .4), shoal = vec3(.33, .5, .52), land = vec3(.6, .56, .46) * (.85 + .3*n3(q*40.));
        vec3 col = mix(mix(deep, sea, .5 + .5*smoothstep(-.2, .1, m)), shoal, shallow); col = mix(col, land, sand);
        // припливний горб: піна-смуга на фронті хвилі-гори й біля осі припливу
        vec3 ax = vec3(cos(uPhi), 0., sin(uPhi)); float bulge = pow(abs(dot(q, ax)), 6.);
        float crest = smoothstep(.7, .98, vH) * clamp(uA*14., 0., 1.) * .45;   // піна лише на самому гребені
        float foam = crest*.8 + bulge * smoothstep(.1, .25, uS) * .35 * (.5 + .5*n3(q*25. + uT*.2));
        col = mix(col, vec3(.86, .9, .92), clamp(foam, 0., 1.) * (1. - sand));
        // широке тепле джерело (диск): «обгорнуте» освітлення, м'який термінатор
        float d = clamp(dot(n, l)*.78 + .22, 0., 1.); d = d*d;
        vec3 lightC = vec3(1., .8, .58);
        float gloss = (1. - sand) * (1. - crest*.7);
        float spec = pow(max(dot(reflect(-l, n), v), 0.), mix(60., 18., shallow)) * gloss;
        vec3 c = col*(.04 + 1.2*d*lightC) + spec*lightC*.7*d;
        float rim = pow(1. - max(dot(n, v), 0.), 2.2);
        c = mix(c, vec3(.42, .6, .9) * (.15 + 1.1*d), rim * .75);                // повітря над диском планети: ближче до краю — товща серпанку
        gl_FragColor = vec4(c, 1.);
      }`
  }));
  scene.add(planet);
  // хмари — частки, не оболонка: ~10 тис. м'яких пластівців купчастими скупченнями на висоті 2–5 % радіуса.
  //    Хвиля-гора їх не прогинає смугою, а розганяє: на гребені частки здіймаються й розлітаються вперед і в боки,
  //    за хвилею повільно стягуються назад. Деформація (приплив, витяг) — та сама, що в планети.
  const cloudsU = Object.assign({}, uni, { uLay: { value: 1 }, uH: { value: 600 } });
  const clouds = (() => {
    const NC = 7000, pos = new Float32Array(NC * 3), sz = new Float32Array(NC), sd = new Float32Array(NC);
    const g = () => { let u = 0; for (let k = 0; k < 4; k++) u += Math.random(); return (u - 2) / 1.15; };   // ≈ нормальний розподіл
    const cl = Array.from({ length: 90 }, () => { const z = Math.random() * 2 - 1, a = Math.random() * 6.283, r = Math.sqrt(1 - z * z);
      return { c: [r * Math.cos(a), z * .9, r * Math.sin(a)], s: .05 + .13 * Math.random() }; });
    for (let i = 0; i < NC; i++) {
      const C = cl[(Math.random() * cl.length) | 0], v = [C.c[0] + g() * C.s, C.c[1] + g() * C.s * .6, C.c[2] + g() * C.s], l = Math.hypot(...v), R = 1.02 + .03 * Math.random();
      pos.set([v[0] / l * R, v[1] / l * R, v[2] / l * R], i * 3); sz[i] = .05 + .07 * Math.random(); sd[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aS', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('aD', new THREE.BufferAttribute(sd, 1));
    return new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: cloudsU, transparent: true, depthWrite: false,
      vertexShader: `attribute float aS, aD; uniform float uH; varying float vA, vL; uniform vec3 uL; ${DEFORM}
        void main(){
          vec3 p = position; float cs = cos(uT*.012), sn = sin(uT*.012); p = vec3(p.x*cs - p.z*sn, p.y, p.x*sn + p.z*cs);   // дрейф з атмосферою
          // хвиля-гора в цій точці (та сама формула, що в deform): штовхає частку вперед по ходу хвилі, вгору й трохи вбік
          float phi = atan(p.z, p.x), lat = 1. - p.y*p.y;
          float sw = .5 + .5*sin(2.*phi - uT*.55 + p.y*1.2), wv = pow(sw, 5.) * lat * clamp(uA*14., 0., 1.);
          vec3 tg = normalize(vec3(-p.z, 0., p.x)), up = normalize(p), sd = normalize(cross(up, tg));
          float R0 = length(p);
          p += tg * wv * (.05 + .1*aD) + sd * wv * (aD - .5) * .12 + up * wv * (.01 + .05*aD);
          p = normalize(p) * (R0 + wv * .03 * aD);
          vec3 n; float vh; vec3 q = deform(p, normalize(p), n, vh);
          vec4 mv = modelViewMatrix * vec4(q, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = aS * (1. + .8*wv) * uH * projectionMatrix[1][1] * .5 / -mv.z;
          vL = clamp(dot(normalize(mat3(modelMatrix) * n), normalize(uL))*.8 + .2, 0., 1.);
          vA = .3 * (1. - .55*wv);                                                       // розігнані — рідшають
        }`,
      fragmentShader: `varying float vA, vL; void main(){ vec2 c = gl_PointCoord - .5; float r2 = dot(c, c)*4.; if (r2 > 1.) discard;
        float a = exp(-r2*2.2) * (1. - r2) * vA; gl_FragColor = vec4(vec3(.92, .92, .94) * (.06 + .94*vL*vec3(1., .9, .78)), a); }` }));
  })();
  scene.add(clouds);
  // атмосфера: товстий шар (до 1,2 радіуса). Яскравість — оптична товща вздовж променя: для прицільної відстані b
  //    густина ∝ exp(−(b − 1)/H) — щільна біля поверхні й м'яко сходить нанівець до зовнішньої межі, без різкого обідка
  const ATM_R = 1.2;
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(ATM_R, 96, 96), new THREE.ShaderMaterial({
    uniforms: Object.assign({}, uni, { uLay: { value: 1 } }), vertexShader: VTX, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    fragmentShader: `uniform vec3 uL; varying vec3 vN, vV; void main(){ vec3 n = normalize(vN), v = normalize(-vV);
      // c = |n·v| на оболонці: 0 на зовнішній межі, c0 — там, де промінь дотикається поверхні (для еліпсоїда пропорції ті самі)
      float c = abs(dot(n, v)), c0 = sqrt(1. - 1./(${ATM_R.toFixed(2)}*${ATM_R.toFixed(2)}));
      float dens = exp(-max(0., c0 - c) / .16) * smoothstep(0., .1, c);
      float d = clamp(dot(n, normalize(uL))*.65 + .4, 0., 1.);                                 // світиться бік, звернений до диска діри
      vec3 sky = mix(vec3(.35, .55, .95), vec3(1., .72, .45), pow(1. - d, 3.) * .6);          // на термінаторі — теплий захід
      gl_FragColor = vec4(sky * dens * d * 1.2, 1.); }`
  }));
  scene.add(atmo);

  // ── уламки (якщо приплив сильніший за тяжіння): кожна частинка летить у полі діри — псевдоньютонівський потенціал
  //    Пачинського–Вііта Φ = −GM/(r − r_s) (є ISCO = 3 r_s і падіння), стартує зі швидкістю планети на орбіті (трохи нижчою
  //    за колову) + кеплерівський зсув: ближчі до діри частинки випереджають — потік тягнеться в стрічку й закручується
  //    спіраллю, частина лягає в тимчасовий диск, решта падає; біля горизонту — гравітаційне почервоніння g = √(1 − r_s/r),
  //    зникають лише на горизонті. Інтегрування — leapfrog, 4 підкроки на кадр; масштаб часу: ~15 с реального часу. ──
  const NP = 4200, pos = new Float32Array(NP * 3), vel = new Float32Array(NP * 3), colA = new Float32Array(NP * 3), gA = new Float32Array(NP), seedP = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) {
    let x, y, z, q; do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; q = x * x + y * y + z * z; } while (q > 1 || q < .02);
    const sr = Math.cbrt(Math.random()) / Math.sqrt(q) * (Math.random() < .55 ? 1 : .85);
    seedP.set([x * sr, y * sr, z * sr], i * 3);
    const w = Math.random() < .6; colA.set(w ? [.25, .5, .6] : [.6, .5, .38], i * 3);     // океан / пісок — кольори поверхні зберігаються
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('aC', new THREE.BufferAttribute(colA, 3));
  pg.setAttribute('aG', new THREE.BufferAttribute(gA, 1));
  const pu = { uPx: { value: 1 } };
  const debris = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: pu, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uPx; attribute vec3 aC; attribute float aG; varying vec3 vC; varying float vA;
      void main(){
        // g — гравітаційне почервоніння: яскравість ∝ g³, колір зсувається до червоного; g = 0 — частинка «впала» (невидима)
        vC = mix(vec3(.9, .2, .05), aC, smoothstep(.3, .95, aG)) * (.35 + .65*aG*aG*aG);
        vA = aG > .02 ? smoothstep(.0, .3, aG) : 0.;
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_PointSize = uPx * 2.6 * (6. / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      void main(){ vec2 q = gl_PointCoord - .5; float r = dot(q,q); if (r > .25 || vA <= 0.) discard;
        gl_FragColor = vec4(vC*1.5, vA*(1. - r*4.)); }`
  }));
  debris.visible = false; scene.add(debris);
  const DB = { on: false, t: 0, rs: .8, GM: 1, c: new THREE.Vector3(), alive: 0 };
  const acc = (x, y, z, out) => {                                            // прискорення в потенціалі Пачинського–Вііта
    const dx = x - DB.c.x, dy = y - DB.c.y, dz = z - DB.c.z, r = Math.hypot(dx, dy, dz), d = Math.max(r - DB.rs, .03);
    const k = -DB.GM / (d * d * r); out[0] = dx * k; out[1] = dy * k; out[2] = dz * k; return r; };
  function debrisStart() {
    DB.on = true; DB.t = 0; DB.c.copy(bh.position); DB.rs = .8 * bh.scale.x; DB.alive = NP;
    const er = new THREE.Vector3().sub(DB.c).normalize(), n = new THREE.Vector3(.12, 1, .08).normalize(), et = new THREE.Vector3().crossVectors(n, er).normalize();
    for (let i = 0; i < NP; i++) {
      const x = seedP[i * 3], y = seedP[i * 3 + 1], z = seedP[i * 3 + 2];
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; gA[i] = 1;
      const r = Math.hypot(x - DB.c.x, y - DB.c.y, z - DB.c.z), vc = Math.sqrt(DB.GM * r) / (r - DB.rs);  // колова швидкість у PW-потенціалі
      const v = vc * .86;                                                      // трохи нижча за колову: орбіта витягнута, ближній край іде всередину ISCO
      vel[i * 3] = et.x * v + (Math.random() - .5) * .03; vel[i * 3 + 1] = et.y * v + (Math.random() - .5) * .03; vel[i * 3 + 2] = et.z * v + (Math.random() - .5) * .03;
    }
    pg.attributes.position.needsUpdate = true; pg.attributes.aG.needsUpdate = true;
  }
  const a3 = [0, 0, 0];
  function debrisStep(dt) {
    const h = dt * 2.6 / 4;                                                  // масштаб часу: оберт ≈ 12 с; 4 підкроки
    let alive = 0;
    for (let i = 0; i < NP; i++) {
      if (gA[i] <= 0) continue;
      let x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], vx = vel[i * 3], vy = vel[i * 3 + 1], vz = vel[i * 3 + 2], r = 1;
      for (let k = 0; k < 4; k++) {
        r = acc(x, y, z, a3); vx += a3[0] * h * .5; vy += a3[1] * h * .5; vz += a3[2] * h * .5;
        x += vx * h; y += vy * h; z += vz * h;
        r = acc(x, y, z, a3); vx += a3[0] * h * .5; vy += a3[1] * h * .5; vz += a3[2] * h * .5;
        if (r < DB.rs * 1.02) break;
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
      gA[i] = r < DB.rs * 1.02 ? 0 : Math.sqrt(Math.max(0, 1 - DB.rs / r));
      if (gA[i] > 0) alive++;
    }
    DB.alive = alive; DB.t += dt;
    pg.attributes.position.needsUpdate = true; pg.attributes.aG.needsUpdate = true;
  }

  /* ── клік по сцені: кидаємо шматок речовини (кульку з 360 часток). Кожна частка падає в діру сама по собі (той самий потенціал
     Пачинського–Вііта), тож ближній край тягне сильніше за дальній: кулька витягується вздовж напрямку на діру й стискається впоперек —
     «спагетифікація». Наочно: діра не в масштабі, час прискорено. ── */
  const BN = 360, BL = [], bTex = new Float32Array(BN * 3);
  for (let i = 0; i < BN; i++) { let x, y, z; do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; } while (x * x + y * y + z * z > 1); bTex.set([x, y, z], i * 3); }
  const blobM = new THREE.PointsMaterial({ color: 0xffc08a, size: .08, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true });
  const tipEl = el('span', 'vz-td__tip'); wrap.appendChild(tipEl);
  function drop(nx, ny) {
    const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(nx, ny), cam);
    const n = cam.getWorldDirection(new THREE.Vector3()), c = bh.position, rs = .8 * bh.scale.x;
    const hit = new THREE.Vector3(); if (!rc.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(n, c.clone().lerp(new THREE.Vector3(), .5)), hit)) return;
    if (hit.distanceTo(c) < rs * 2.2) hit.sub(c).setLength(rs * 2.2).add(c);           // не в саму діру — трохи осторонь
    const g = new THREE.BufferGeometry(), P = new Float32Array(BN * 3), V = new Float32Array(BN * 3), Cc = new Float32Array(BN * 3), R0 = .16;
    const er = hit.clone().sub(c), r = er.length(), et = new THREE.Vector3(0, 1, 0).cross(er).normalize(), v0 = Math.sqrt(DB.GM * r) / (r - rs) * .35;   // мала бічна швидкість — падає майже прямо, трохи закручуючись
    for (let i = 0; i < BN; i++) { P.set([hit.x + bTex[i * 3] * R0, hit.y + bTex[i * 3 + 1] * R0, hit.z + bTex[i * 3 + 2] * R0], i * 3);
      V.set([et.x * v0, et.y * v0, et.z * v0], i * 3); Cc.set([1, .75, .5], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(Cc, 3));
    const pts = new THREE.Points(g, blobM.clone()); scene.add(pts);
    BL.push({ pts, P, V, Cc, c: c.clone(), rs, t: 0, gone: new Uint8Array(BN) }); if (BL.length > 3) { const o = BL.shift(); scene.remove(o.pts); o.pts.geometry.dispose(); }
    tipEl.textContent = 'шматок падає: ближній до діри край тягне сильніше за дальній — його витягує в нитку («спагетифікація»). Наочно, час прискорено';
    tipEl.classList.add('on'); clearTimeout(tipEl.t); tipEl.t = setTimeout(() => tipEl.classList.remove('on'), 6000);
    if (!running) start();
  }
  window.IS_BLOBS = BL;
  function blobStep(dt) {
    const h = dt * 1.6 / 3, a = [0, 0, 0];
    for (let j = BL.length - 1; j >= 0; j--) { const o = BL[j]; o.t += dt; let alive = 0;
      for (let i = 0; i < BN; i++) { if (o.gone[i]) continue; let x = o.P[i * 3], y = o.P[i * 3 + 1], z = o.P[i * 3 + 2], vx = o.V[i * 3], vy = o.V[i * 3 + 1], vz = o.V[i * 3 + 2], r = 9;
        for (let k = 0; k < 3; k++) { const dx = x - o.c.x, dy = y - o.c.y, dz = z - o.c.z; r = Math.hypot(dx, dy, dz); const d = Math.max(r - o.rs, .03), q = -DB.GM / (d * d * r);
          vx += dx * q * h; vy += dy * q * h; vz += dz * q * h; x += vx * h; y += vy * h; z += vz * h; if (r < o.rs * 1.02) break; }
        o.P[i * 3] = x; o.P[i * 3 + 1] = y; o.P[i * 3 + 2] = z; o.V[i * 3] = vx; o.V[i * 3 + 1] = vy; o.V[i * 3 + 2] = vz;
        const gr = Math.sqrt(Math.max(0, 1 - o.rs / r));                                  // біля горизонту — тьмяніє й червоніє
        o.Cc[i * 3] = gr; o.Cc[i * 3 + 1] = .75 * gr * gr; o.Cc[i * 3 + 2] = .5 * gr * gr * gr;
        if (r < o.rs * 1.02) { o.gone[i] = 1; o.Cc.fill(0, i * 3, i * 3 + 3); } else alive++; }
      o.pts.geometry.attributes.position.needsUpdate = o.pts.geometry.attributes.color.needsUpdate = true;
      if (!alive || o.t > 20) { scene.remove(o.pts); o.pts.geometry.dispose(); BL.splice(j, 1); } }
  }
  renderer.domElement.style.cursor = 'crosshair';
  renderer.domElement.addEventListener('click', (e) => { const r = renderer.domElement.getBoundingClientRect();
    drop((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)); });

  let W = 1, H = 1, ready = false;
  function resize() {
    W = wrap.clientWidth || 1; H = wrap.clientHeight || 1;
    renderer.setSize(W, H, false); composer.setSize(W, H); cam.aspect = W / H;
    cam.fov = 40; cam.updateProjectionMatrix(); if (typeof layout === 'function' && ready) layout();
    pu.uPx.value = renderer.getPixelRatio(); cloudsU.uH.value = H * renderer.getPixelRatio();
  }
  new ResizeObserver(() => { resize(); if (!running) frame(performance.now()); }).observe(wrap);
  resize();

  let p = ui(), t = 0, last = performance.now(), running = false, vis = false, raf = 0;
  const camBase = new THREE.Vector3(.9, .9, 8);
  function layout() {
    const bx = -3.4 - 1.25 * st.lx;           // дальше — менша діра на екрані (лише наочно)
    bh.position.set(bx, .35, -1.2 - .6 * st.lx);
    const sc = st.m === 'garg' ? 1.25 : .8;
    bh.scale.setScalar(sc);
    bh.lookAt(cam.position.x, bh.position.y, cam.position.z);                     // площина діри завжди до камери, диск — горизонтально
    uni.uL.value.copy(bh.position).normalize().add(new THREE.Vector3(.2, .55, .5));
    const hf = 2 * Math.atan(Math.tan(cam.fov * Math.PI / 360) * cam.aspect);
    const d = Math.max(6.2, Math.min(15, 4.4 / Math.tan(hf / 2)));
    camBase.set(.9, .9, d); cam.position.copy(camBase);
    cam.lookAt(-1.4, .1, -.6);
    bh.lookAt(cam.position.x, bh.position.y, cam.position.z);
  }
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!REDUCE) t += dt;
    uni.uT.value = t; disk.material.uniforms.uT.value = t;
    if (!REDUCE && ready) { cam.position.set(camBase.x + Math.sin(t * .09) * 1.1, camBase.y + Math.sin(t * .07 + 1.) * .35, camBase.z + Math.cos(t * .09) * .6); cam.lookAt(-1.4, .1, -.6); bh.lookAt(cam.position.x, bh.position.y, cam.position.z); }   // повільний обліт
    if (p.broken) {
      planet.visible = clouds.visible = atmo.visible = false; debris.visible = true;
      if (!DB.on) { debrisStart(); if (REDUCE) for (let k = 0; k < 60; k++) debrisStep(.05); }   // без анімації — застиглий кадр стрічки
      else if (!REDUCE) { debrisStep(dt); if (DB.t > 36 || DB.alive < NP * .04) debrisStart(); }   // усе впало або минуло пів хвилини — ще раз
      againB.hidden = false;
    } else {
      DB.on = false; againB.hidden = true;
      planet.visible = clouds.visible = atmo.visible = true; debris.visible = false;
      uni.uS.value = p.eps;
      uni.uA.value = Math.min(.09, .015 + p.eps * .55) * (p.eps > 1e-4 ? 1 : .3);
      uni.uPhi.value = REDUCE ? 0 : Math.sin(t * .35) * Math.min(.14, p.eps * 1.4);     // лібрація: вісь припливу ходить, горби пливуть по океану
      if (!REDUCE) planet.rotation.y = clouds.rotation.y = atmo.rotation.y = t * .01;
    }
    if (BL.length) blobStep(REDUCE ? .05 : dt);
    grade.tick(t, W, H); composer.render();
  }
  const loop = (now) => { frame(now); raf = running ? requestAnimationFrame(loop) : 0; };
  const start = () => { if (running || REDUCE) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); };
  const halt = () => { running = false; cancelAnimationFrame(raf); };
  const changed = () => { p = ui(); layout(); if (!running) frame(performance.now()); };
  rng.addEventListener('input', () => { st.lx = +rng.value; changed(); });
  segB.forEach((b) => b.addEventListener('click', () => { st.m = b.dataset.m;
    if (st.m === 'star' && st.lx < 1) { st.lx = 1; rng.value = '1'; }     // зоряна діра: старт на 10 r_г — усередині межі Роша, але так, щоб стрічка встигла закрутитися спіраллю
    changed(); }));
  againB.addEventListener('click', () => { if (p.broken) { debrisStart(); if (!running) frame(performance.now()); } });
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
  slot.appendChild(el('p', 'chint', 'Умовний розрахунок для заданого множника: реліктове випромінювання 2,7 К, підняте в B разів, лишається чорнотільним (закон Планка) з температурою B·2,7 К. Крива — спектральна яскравість на одиницю довжини хвилі, нормована на свій пік; сіра — наше небо. Реальний спектр на планеті залежить від геометрії Керра й руху планети: у напрямку руху зсув сильніший, позаду — слабший. Колір неба — інтеграл Планка з кривими чутливості ока CIE 1931 (наближення Ваймана — Слоуна — Ширлі). Кадр «небо планети» — погляд угору з поверхні об’єктивом «риб’яче око» (180°): унизу кола — вода з відбиттям, у небі — Гаргантюа, зорі гаснуть, щойно небо світлішає; понад видимим діапазоном око вже нічого не побачить — лише прилади реєструють УФ і рентген.'));

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

  const fmtL = (m) => m >= 1e-3 ? `${nf(m * 1e3, m >= 1e-2 ? 0 : 2)} мм` : m >= 1e-6 ? `${nf(m * 1e6, m >= 1e-5 ? 0 : 2)} мкм` : m >= 1e-9 ? `${nf(m * 1e9, m >= 1e-8 ? 0 : 1)} нм` : `${nf(m * 1e12, m >= 1e-11 ? 0 : 1)} пм`;
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

  /* «небо планети» об'єктивом «риб'яче око» (WebGL): вигляд угору з поверхні Міллер, по краю кола — вода з відбиттям,
     небо — колір і яскравість чорного тіла T = B·2,7 К (той самий розрахунок CIE → sRGB), зорі гаснуть, коли небо світлішає,
     Гаргантюа в небі (тінь, кільце, «обійми») — її світло теж зсунуте; проєкція equisolid r = 2f·sin(θ/2), віньєтка й аберація по краю;
     кадр повільно дихає, вода брижиться в реальному часі. Без WebGL лишається круг кольору (канвас 2D). */
  let fish = null;
  const fcv = document.createElement('canvas'); fcv.width = fcv.height = 640; fcv.setAttribute('aria-label', 'Небо планети об’єктивом «риб’яче око»');
  (async () => {
    try {
      const THREE = await import('three');
      const R = new THREE.WebGLRenderer({ canvas: fcv, antialias: false }); R.setPixelRatio(1); R.setSize(640, 640, false);
      R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
      const U = { uT: { value: 0 }, uCol: { value: new THREE.Vector3(0, 0, 0) }, uBr: { value: 0 }, uOver: { value: 0 }, uStars: { value: 1 }, uYaw: { value: 0 } };
      const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false, depthWrite: false,
        vertexShader: 'varying vec2 vU; void main(){ vU = uv*2.-1.; gl_Position = vec4(position.xy, 0., 1.); }',
        fragmentShader: `uniform float uT, uBr, uOver, uStars, uYaw; uniform vec3 uCol; varying vec2 vU;
          float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
          float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
          float hash3(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
          const vec3 G = normalize(vec3(.35, .42, -.84));                      // Гаргантюа: ~25° над обрієм
          vec3 skyc(vec3 d){
            // небо: чорне тіло з повзунка; трохи яскравіше до зеніту; зорі — лише поки небо темне
            vec3 c = uCol * uBr * (.75 + .45*pow(max(d.y, 0.), .6));
            vec3 q = floor(d*260.); float st = hash3(q); float tw = .7 + .3*sin(uT*2. + st*60.);
            c += vec3(.9, .93, 1.) * step(.9975, st) * uStars * tw * smoothstep(.0, .2, d.y);
            c += uCol * .08 * uStars * (vn(d.xz*4. + d.y*3.)*.5);                   // слабкий реліктовий серпанок
            // Гаргантюа: координати в площині, перпендикулярній до напряму на неї
            vec3 up = normalize(vec3(0., 1., 0.) - G*G.y), rt = cross(G, up);
            float along = dot(d, G); vec2 p = vec2(dot(d, rt), dot(d, up)) / max(along, .05) * 1.7;
            if (along > .2) {
              float rs = .36, r = length(p); float sh = 1. - smoothstep(rs*.97, rs*1.03, r);
              float ring = exp(-pow((r - rs*1.05)/.012, 2.));
              float u2 = smoothstep(-.3, .7, abs(p.y)/max(r, 1e-3)), below = p.y < 0. ? .6 : 1.;
              float halo = exp(-pow((r - rs*(1.3 + .25*u2))/(rs*(.12 + .35*u2)), 2.)) * u2 * below * smoothstep(rs, rs*1.08, r);
              float th = .016 + .02*min(abs(p.x), 2.); float band = exp(-pow((p.y + .01*p.x)/th, 2.)) * smoothstep(2., .7, abs(p.x));
              float lum = ring*3.2 + halo*2.6 + band*2.8;
              vec3 gcol = mix(mix(vec3(.95,.45,.16), vec3(1.,.9,.74), clamp(lum*.6-.1, 0., 1.)), uCol, uOver*.8) * min(lum, 1.6);   // її світло теж зсунуте
              float e = smoothstep(2.6, 1.6, abs(p.x)) * smoothstep(1.3, .8, abs(p.y));
              float dark = smoothstep(rs*2.8, rs*1.05, r) * .5;
              c = mix(c, c*(1. - dark), e); c = mix(c, vec3(0.), sh*e); c += gcol * e;
            }
            c += uCol * uOver * .3;                                                  // засліплення, коли небо гаряче
            return c; }
          void main(){
            vec3 col = vec3(0.); float r0 = length(vU);
            for (int k = 0; k < 3; k++) {
              vec2 uv = vU * (1. + (float(k) - 1.) * .012 * r0*r0);               // хроматична аберація по краю
              float r = length(uv); if (r > 1.) { continue; }
              float th = 2.*asin(clamp(r*.7071, 0., 1.)); vec2 dir2 = r > 1e-4 ? uv/r : vec2(0., 1.);
              vec3 d = vec3(sin(th)*dir2.x, cos(th), sin(th)*dir2.y);
              // об'єктив нахилено: центр кадру — 30° над обрієм у бік Гаргантюа, тож нижня третина кола — вода
              const float TA = 1.05; d = vec3(d.x, d.y*cos(TA) + d.z*sin(TA), -d.y*sin(TA) + d.z*cos(TA));
              float cy = cos(uYaw), sy = sin(uYaw); d = vec3(d.x*cy - d.z*sy, d.y, d.x*sy + d.z*cy);
              vec3 c;
              if (d.y > 0.) c = skyc(d);
              else {
                // вода внизу кола: брижі в реальному часі, Френель, під ковзним кутом — дзеркало неба; серпанок біля обрію
                vec2 w = d.xz / max(-d.y, .03) * 2.;
                float e = .2, a = vn(w*1.5 + uT*.3) + .5*vn(w*3.1 - uT*.4), ax = vn((w+vec2(e,0.))*1.5 + uT*.3) + .5*vn((w+vec2(e,0.))*3.1 - uT*.4), az = vn((w+vec2(0.,e))*1.5 + uT*.3) + .5*vn((w+vec2(0.,e))*3.1 - uT*.4);
                vec3 n = normalize(vec3(-(ax-a)/e*.08, 1., -(az-a)/e*.08));
                vec3 rf = reflect(d, n); rf.y = abs(rf.y);
                float fr = .04 + .96*pow(1. - max(dot(-d, n), 0.), 4.);
                vec3 deep = (uCol*uBr*.35 + vec3(.02,.03,.04)) * (.6 + .4*vn(w*.7));
                c = mix(deep, skyc(rf), fr); }
              c = mix(c, uCol*uBr*.9 + vec3(.01), smoothstep(.12, 0., abs(d.y)) * .35);
              if (k == 0) col.r = c.r; else if (k == 1) col.g = c.g; else col.b = c.b;
            }
            col *= 1. - .55*smoothstep(.7, 1., r0);                                   // віньєтка по краю кола
            col += (h21(vU*300. + fract(uT)) - .5) * .03;
            gl_FragColor = vec4(col, 1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }` });
      const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      let t = 0, last = 0, raf = 0, vis = false;
      const render = () => { U.uYaw.value = REDUCE ? 0 : Math.sin(t * .05) * .25; U.uT.value = t; R.render(sc, cam); };
      const loop = (now) => { raf = 0; if (!vis) return; const dt = Math.min(.05, last ? (now - last) / 1000 : 0); last = now; if (!REDUCE) t += dt; render(); raf = requestAnimationFrame(loop); };
      fish = { U, render, kick: () => { if (vis && !raf) { last = 0; raf = requestAnimationFrame(loop); } } };
      sky.after(fcv); sky.style.display = 'none';
      /* клік по небу: що там — зоря (її колір до і після зсуву), Гаргантюа чи вода. Напрям рахуємо тією ж проєкцією, що й шейдер */
      const fwrap = el('div', 'vz-bl__fw'); fcv.before(fwrap); fwrap.appendChild(fcv);
      const ring = el('span', 'vz-bl__ring'), card = el('div', 'vz-bl__card'); fwrap.append(ring, card); fcv.style.cursor = 'crosshair';
      const sw = (rgb) => `<i style="background:rgb(${rgb.map((v) => Math.round(v * 255)).join(',')})"></i>`;
      fcv.addEventListener('click', (e) => {
        const r0 = fcv.getBoundingClientRect(), ux = (e.clientX - r0.left) / r0.width * 2 - 1, uy = -((e.clientY - r0.top) / r0.height * 2 - 1), rr = Math.hypot(ux, uy);
        if (rr > 1) return;
        const th = 2 * Math.asin(Math.min(1, rr * .7071)), dx = rr > 1e-4 ? ux / rr : 0, dy = rr > 1e-4 ? uy / rr : 1;
        let d = [Math.sin(th) * dx, Math.cos(th), Math.sin(th) * dy]; const TA = 1.05, cy = Math.cos(U.uYaw.value), sy = Math.sin(U.uYaw.value);
        d = [d[0], d[1] * Math.cos(TA) + d[2] * Math.sin(TA), -d[1] * Math.sin(TA) + d[2] * Math.cos(TA)]; d = [d[0] * cy - d[2] * sy, d[1], d[0] * sy + d[2] * cy];
        const G = [.35, .42, -.84], gl = Math.hypot(...G), along = (d[0] * G[0] + d[1] * G[1] + d[2] * G[2]) / gl;
        ring.style.left = (e.clientX - r0.left) + 'px'; ring.style.top = (e.clientY - r0.top) + 'px'; ring.classList.remove('on'); void ring.offsetWidth; ring.classList.add('on');
        let html;
        if (d[1] < 0) html = '<b>Вода</b> — дзеркало неба: під ковзним кутом відбиває той самий зсунутий колір.';
        else if (along > .975) html = '<b>Гаргантюа</b> — її диск теж світить зсунутим світлом, а тінь лишається чорною.';
        else { // «зоря» в цьому місці: температура — від напрямку (відтворюваний хеш), як у справжньому небі: здебільшого холодні червонуваті, зрідка гарячі блакитні
          const hs = Math.abs(Math.sin(d[0] * 127.1 + d[1] * 311.7 + d[2] * 74.7) * 43758.5453) % 1, Ts = Math.round((3000 + 27000 * hs ** 3) / 100) * 100, T2 = Ts * B;
          html = `<b>Зоря</b> ${sw(bbRGB(Ts))} ${nf(Ts, 0)} К → ×${nf(B, 0)} → ${sw(bbRGB(Math.min(T2, 4e5)))} ${sci(T2, 1)} К<br>пік ${fmtL(b / T2)} — ${bandOf(Math.log10(c * T2 / b))}${T2 > 1e5 ? '; око її вже не бачить — лише прилади' : ''}`; }
        card.innerHTML = html; card.classList.add('on'); clearTimeout(card.t); card.t = setTimeout(() => card.classList.remove('on'), 6000);
      });
      visible(fcv, (v) => { vis = v; if (v) fish.kick(); else { cancelAnimationFrame(raf); raf = 0; } });
      drawSky();
    } catch (e) { fish = null; }
  })();

  function drawSky() {
    const T = B * T0, S = sky.width, g = sctx;
    const lyF = lY(T), brF = Math.max(0, Math.min(1, (lyF - Y800) / (Y6000 - Y800)));
    if (fish) {
      const [fr, fg, fb] = bbRGB(Math.min(T, 4e5)), overF = Math.max(0, Math.min(1, (Math.log10(T) - 3.6) / 1.6));
      fish.U.uCol.value.set(fr, fg, fb); fish.U.uBr.value = brF * (1 + overF * .5); fish.U.uOver.value = overF; fish.U.uStars.value = Math.max(0, 1 - brF * 2.5);
      fish.render(); fish.kick();
      skyP.textContent = T > 1e5 ? 'Блакитно-біле й сліпуче: небо світить у рентгені й ультрафіолеті, око цього вже не бачить, лише прилади.'
        : T > 7000 ? 'Блакитно-біле сяйво з усього неба, гарячіше за поверхню Сонця.'
        : T > 2500 ? 'Небо світиться, як розпечений метал або зоря.'
        : brF > .01 ? 'Ледь помітне темно-червоне жевріння над обрієм.'
        : 'Небо темне: усе випромінювання — поза видимим світлом.';
      return;
    }
    g.clearRect(0, 0, S, S);
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
