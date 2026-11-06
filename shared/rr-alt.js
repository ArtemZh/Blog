/* Стаття 41: варіанти сцен за ідеями ChatGPT (06.11.2026, друга версія — дашборди). Під кожною нашою сценою з бігунками —
   блок у вигляді картинки ChatGPT: свої бігунки (синхронні з нашими), керування на самому графіку, висновок, що рахується з чисел.
   Формули повторюють наші сцени (rr-viz*.js), тож числа збігаються. Наші сцени не змінено. */
(function () {
  const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk);
  const $ = (id) => document.getElementById(id);
  const num = (v, d = 0) => Number(v).toLocaleString(EN ? 'en-GB' : 'uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const TEAL = '#5fe8dc', ORG = '#e8a33f', BLUE = '#7fb2ff', INK = '#e9f1f3', DIM = 'rgba(233,241,243,.55)', FAINT = 'rgba(233,241,243,.3)', GREEN = '#3fcf86', RED = '#e0634d';
  const MONO = '"Roboto Mono", monospace', SANS = 'Inter, system-ui, sans-serif';
  const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.c || INK}" font-family="${o.m ? MONO : SANS}" font-size="${o.n || 13}" font-weight="${o.w || 500}" text-anchor="${o.a || 'start'}"${o.op != null ? ` opacity="${o.op}"` : ''}${o.cl ? ` class="${o.cl}"` : ''}>${esc(s)}</text>`;
  const now = () => (performance.now() / 1000);
  const run = (dur) => `style="animation-delay:-${(now() % dur).toFixed(2)}s"`;   // рух частинок не стрибає при перемальовуванні

  /* іконки (власні, лінійні, 24×24) */
  const IC = {
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    cart: '<path d="M3 4h2l2.5 11h11L21 7H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    till: '<rect x="3" y="11" width="18" height="9" rx="1.5"/><path d="M6 11V6h8v5M14 8h4v3M7 15h2M11 15h2M15 15h2"/>',
    bread: '<path d="M4 14c0-5 4-8 8-8s8 3 8 8v4H4z"/><path d="M9 10l1 3M13 9.5l1 3"/>',
    fish: '<path d="M3 12c3-4 8-5 12-3l4-3v12l-4-3c-4 2-9 1-12-3z"/><circle cx="8" cy="11" r=".8"/>',
    apple: '<path d="M12 7c-3-2-8-1-8 5 0 5 3 9 5 9 1.2 0 2-.6 3-.6s1.8.6 3 .6c2 0 5-4 5-9 0-6-5-7-8-5z"/><path d="M12 7c0-2 1-4 3-4"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    robot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16.5h6"/><circle cx="12" cy="4" r="1"/>',
    scan: '<path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M7 12h10"/>',
    mop: '<path d="M14 3l-4 11M6 14h8l2 6H4z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/>',
    moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
    person: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/>',
    people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5"/>',
    belt: '<rect x="4" y="5" width="7" height="6" rx="1"/><rect x="13" y="5" width="7" height="6" rx="1"/><path d="M3 15h18"/><circle cx="6" cy="18" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/>',
    arm: '<path d="M5 21h8M9 21v-4l-3-6 6-4 5 3M17 10l2 3"/><circle cx="9" cy="17" r="1"/><circle cx="12" cy="7" r="1"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
    store: '<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM9 20v-5h6v5"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l3 7M13 6h3"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 7h6zM19 7l-3 7h6z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13" r="3.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    shelf: '<path d="M3 4v17M21 4v17M3 9h18M3 15h18M3 21h18"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    puzzle: '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z"/>',
    repeat: '<path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M20 4v5h-5M4 20v-5h5"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    pct: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    euro: '<path d="M17 6a7 7 0 1 0 0 12M4 10h9M4 14h9"/>',
  };
  const ic = (n, s = 20) => `<svg class="rr-ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
  const icAt = (n, x, y, s, c) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
  const pill = (x, y, s, c = TEAL, o = {}) => { const w = Math.max(30, String(s).length * 7.2 + 18); return `<g${o.cl ? ` class="${o.cl}"` : ''}><rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="22" rx="11" fill="#0b1c26" stroke="${c}" stroke-width="1.3"/>${tx(x, y + 3.5, s, { a: 'middle', n: 11.5, w: 700, m: 1, c: o.tc || INK })}</g>`; };
  const svgEl = (name, w, h, body, lab, cls = '') => `<svg class="rr-cv ${cls}" data-cv="${name}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(lab)}">${body}</svg>`;
  const GLOW = '<defs><filter id="rrg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Блок-дашборд під нашою сценою. o: title, icon, ctl [[ключ, іконка, підпис] або [«_ключ», іконка, підпис, min, max, step, val, fmt]], take (іконка), build(ctx) → () => {body, take} */
  function mount(id, o) {
    const s = $(id); if (!s) return; const own = s.querySelector('.oc-sc'); if (!own) return;
    const lab = (t) => { const p = document.createElement('p'); p.className = 'rr-vs'; p.textContent = t; return p; };
    s.insertBefore(lab(L('Наш варіант', 'Our version')), own);
    s.appendChild(lab(L('Варіант за ідеєю ChatGPT · бігунки зв’язані з нашими', 'Version after a ChatGPT idea · sliders linked to ours')));
    const I = {}, O = {}; own.querySelectorAll('input[data-i]').forEach((e) => { I[e.dataset.i] = e; }); own.querySelectorAll('[data-o]').forEach((e) => { O[e.dataset.o] = e; });
    const S = { used: false, h: null };
    const b = document.createElement('div'); b.className = 'oc-sc rr-sc rr-alt rr-dash'; s.appendChild(b);
    const row = (c) => { const loc = c[0][0] === '_', e = loc ? null : I[c[0]];
      if (loc) S[c[0]] = c[6];
      const a = loc ? { min: c[3], max: c[4], step: c[5], value: c[6] } : { min: e.min, max: e.max, step: e.step, value: e.value };
      return `<label class="rr-ct">${ic(c[1])}<span>${c[2]}</span><input type="range" data-k="${c[0]}" min="${a.min}" max="${a.max}" step="${a.step}" value="${a.value}"><b data-v="${c[0]}"></b></label>`; };
    b.innerHTML = `<div class="rr-dash__top"><h4 class="rr-dash__t"><span class="rr-dash__ti">${ic(o.icon, 24)}</span><span>${o.title}</span></h4><div class="rr-gl rr-dash__ctl">${o.ctl.map(row).join('')}</div></div><div class="rr-dash__main${o.one ? ' one' : ''}" data-body></div><div class="rr-take"><span class="rr-take__i">${ic(o.take || 'scale', 28)}</span><p data-take></p></div>`;
    const body = b.querySelector('[data-body]'), take = b.querySelector('[data-take]'), A = {}; b.querySelectorAll('.rr-dash__ctl input').forEach((e) => { A[e.dataset.k] = e; });
    const V = {}; b.querySelectorAll('[data-v]').forEach((e) => { V[e.dataset.v] = e; });
    const v = (k) => (k[0] === '_' ? S[k] : +I[k].value);
    const used = () => { if (!S.used) { S.used = true; b.classList.add('used'); } };
    const set = (k, val) => { if (k[0] === '_') { S[k] = val; later(); return; }
      const e = I[k], st = +e.step || 1, mn = +e.min, mx = +e.max; val = Math.min(mx, Math.max(mn, mn + Math.round((val - mn) / st) * st)); val = +val.toFixed(4);
      if (+e.value === val) return; e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); };
    Object.values(A).forEach((e) => e.addEventListener('input', () => { used(); set(e.dataset.k, +e.value); }));
    const P = (ev, name) => { const sv = body.querySelector(`svg[data-cv="${name}"]`); if (!sv) return null; const m = sv.getScreenCTM(); if (!m) return null; return new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse()); };
    const ctx = { v, set, S, P, used, redraw: () => later() };
    const draw = o.build(ctx);
    const fmtLoc = {}; o.ctl.forEach((c) => { if (c[0][0] === '_') fmtLoc[c[0]] = c[7]; });
    const render = () => {
      const r = draw(); body.innerHTML = r.body; take.innerHTML = r.take;
      Object.keys(A).forEach((k) => { const e = A[k], val = v(k); if (+e.value !== val) e.value = val;
        e.style.setProperty('--p', ((val - e.min) / (e.max - e.min) * 100) + '%'); V[k].textContent = k[0] === '_' ? fmtLoc[k](val) : (O[k] ? O[k].textContent : val); }); };
    let q = 0; const later = () => { if (!q) q = requestAnimationFrame(() => { q = 0; render(); }); };
    Object.values(I).forEach((e) => { e.addEventListener('input', later); e.addEventListener('rr-swing', later); });
    // наведення / дотик на [data-h]; перетягування на [data-drag]
    const hov = (ev) => { const t = ev.target.closest('[data-h]'), h = t ? t.dataset.h : null; if (h !== S.h) { S.h = h; later(); } };
    body.addEventListener('pointermove', hov); body.addEventListener('pointerdown', hov); body.addEventListener('pointerleave', () => { if (S.h !== null && !S.drag) { S.h = null; later(); } });
    if (o.drag) body.addEventListener('pointerdown', (ev) => { const t = ev.target.closest('[data-drag]'); if (!t) return; const kind = t.dataset.drag; S.drag = kind; used();
      try { body.setPointerCapture(ev.pointerId); } catch (e) { /* без захоплення теж працює */ }
      o.drag(kind, ev, ctx); const mv = (e2) => o.drag(kind, e2, ctx); const up = () => { S.drag = null; body.removeEventListener('pointermove', mv); body.removeEventListener('pointerup', up); body.removeEventListener('pointercancel', up); if (o.dragEnd) o.dragEnd(ctx); later(); };
      body.addEventListener('pointermove', mv); body.addEventListener('pointerup', up); body.addEventListener('pointercancel', up); });
    if (o.move) body.addEventListener('pointermove', (ev) => { if (!S.drag) o.move(ev, ctx); });
    render();
    if (!RM && 'IntersectionObserver' in window) { b.classList.add('pre'); const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { b.classList.add('in'); io.disconnect(); } }, { threshold: .15 }); io.observe(b); }
  }
  window.__rr = window.__rr || {};

  /* 1 · тиждень магазину */
  mount('rr-hours', {
    title: L('Тиждень одного магазину', 'One store, one week'), icon: 'cal', take: 'people',
    ctl: [['a', 'scan', L('Перевірка полиць (бакалія), %', 'Shelf checks (grocery), %')], ['c', 'mop', L('Миття підлоги, год/тиждень', 'Floor scrubbing, h/week')]],
    build: ({ v, S }) => {
      const D = [[L('Бакалія', 'Grocery'), 310, 'cart'], [L('Каса й зал', 'Front end'), 226, 'till'], [L('Пекарня й кулінарія', 'Bakery and deli'), 162, 'bread'], [L('М’ясо й риба', 'Meat and seafood'), 108, 'fish'], [L('Овочі й фрукти', 'Produce'), 80, 'apple'], [L('Інше', 'Other'), 200, 'box']];
      const PER = 5, TOT = 1086, CW = 82, X0 = 8, BASE = 262, G = 10.4, R = 3.7;
      return () => {
        const scan = Math.round(310 * v('a') / 100 / PER), clean = Math.round(v('c') * .8 / PER), rob = scan + clean, rh = rob * PER, share = rh / TOT, take = [scan, 0, 0, 0, 0, clean];
        const h = S.h, hi = h != null && /^\d$/.test(h) ? +h : null, ri = D.length;
        const cx = (i) => X0 + i * CW + CW / 2, top = (n) => BASE - (Math.ceil(n / 4) - 1) * G;
        let o = GLOW;
        const ped = (i, col) => `<ellipse cx="${cx(i)}" cy="${BASE + 12}" rx="30" ry="6" fill="${col}" opacity=".18"/><rect x="${cx(i) - 30}" y="${BASE + 8}" width="60" height="6" rx="3" fill="#13293a" stroke="${col}" stroke-opacity=".5"/>`;
        D.forEach((d, i) => { const n = Math.round(d[1] / PER), k = take[i], dim = hi != null && hi !== i ? ' opacity=".35"' : '';
          o += `<g data-h="${i}" class="rr-hit"${dim}><rect x="${cx(i) - CW / 2 + 2}" y="20" width="${CW - 4}" height="${BASE + 72}" fill="transparent"/>` + ped(i, ORG);
          for (let j = 0; j < n; j++) { const x = cx(i) - 1.5 * G + (j % 4) * G, y = BASE - Math.floor(j / 4) * G, gone = j >= n - k;
            o += gone ? `<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${TEAL}" stroke-opacity=".6" stroke-width="1.2"/>` : `<circle cx="${x}" cy="${y}" r="${R}" fill="${ORG}"/>`; }
          o += tx(cx(i), top(n) - 12, num(d[1] - k * PER), { a: 'middle', w: 700, n: 15 }) + icAt(d[2], cx(i) - 10, BASE + 22, 20, DIM);
          const w = d[0].split(/ (?=й |and )/); o += tx(cx(i), BASE + 58, w[0], { a: 'middle', n: 11, c: DIM }); if (w[1]) o += tx(cx(i), BASE + 72, w[1], { a: 'middle', n: 11, c: DIM }) + '</g>'; else o += '</g>'; });
        const rdim = hi != null && hi !== ri ? ' opacity=".35"' : '';
        o += `<g data-h="${ri}" class="rr-hit"${rdim}><rect x="${cx(ri) - CW / 2 + 2}" y="20" width="${CW - 4}" height="${BASE + 72}" fill="transparent"/>` + ped(ri, TEAL) + `<g filter="url(#rrg)">`;
        for (let j = 0; j < rob; j++) o += `<circle cx="${cx(ri) - 1.5 * G + (j % 4) * G}" cy="${BASE - Math.floor(j / 4) * G}" r="${R}" fill="${TEAL}"/>`;
        o += '</g>' + tx(cx(ri), (rob ? top(rob) : BASE) - 12, '≈ ' + num(rh), { a: 'middle', w: 700, n: 15, c: TEAL }) + icAt('robot', cx(ri) - 10, BASE + 22, 20, TEAL) + tx(cx(ri), BASE + 58, L('Роботи', 'Robots'), { a: 'middle', n: 11, c: TEAL, w: 700 }) + '</g>';
        [[0, scan], [5, clean]].forEach(([i, k]) => { if (!k) return; const n = Math.round(D[i][1] / PER), x1 = cx(i), y1 = top(n) - 30, x2 = cx(ri) - 6, y2 = (rob ? top(rob) : BASE) - 34, my = Math.min(y1, y2) - (i ? 34 : 60);
          const d = `M${x1} ${y1} Q${(x1 + x2) / 2} ${my} ${x2} ${y2}`;
          o += `<path d="${d}" fill="none" stroke="${TEAL}" stroke-opacity=".18" stroke-width="2"/><path class="rr-run" ${run(1.4)} d="${d}" fill="none" stroke="${TEAL}" stroke-width="5" stroke-dasharray="0.1 11" stroke-linecap="round" filter="url(#rrg)"/>`;
          o += `<path d="M${x2 - 7} ${y2 - 8} L${x2} ${y2} L${x2 - 10} ${y2 + 2}" fill="none" stroke="${TEAL}" stroke-width="2"/>`; });
        const info = hi == null ? L('Наведи або торкнись стовпчика — покажу, що з нього забирають роботи.', 'Hover or tap a column to see what robots take from it.')
          : hi === ri ? L(`Роботи: ≈ ${num(rh)} год на тиждень = перевірка полиць ${num(scan * PER)} + миття підлоги ${num(clean * PER)}.`, `Robots: ≈ ${num(rh)} h a week = shelf checks ${num(scan * PER)} + floor scrubbing ${num(clean * PER)}.`)
          : take[hi] ? L(`${D[hi][0]}: ${num(D[hi][1])} год, з них роботи забирають ${num(take[hi] * PER)} (${hi ? 'миття підлоги' : 'перевірка полиць і цін'}).`, `${D[hi][0]}: ${num(D[hi][1])} h, robots take ${num(take[hi] * PER)} (${hi ? 'floor scrubbing' : 'shelf and price checks'}).`)
          : L(`${D[hi][0]}: ${num(D[hi][1])} год — тут роботи поки нічого не забирають.`, `${D[hi][0]}: ${num(D[hi][1])} h — robots take nothing here yet.`);
        const C = 2 * Math.PI * 64, lh = h === 'rob' || h === 'ppl' ? h : null;
        const donut = `<svg class="rr-cv" viewBox="0 0 200 200" aria-hidden="true">${GLOW}<circle cx="100" cy="100" r="64" fill="none" stroke="${ORG}" stroke-opacity="${lh === 'rob' ? .15 : .55}" stroke-width="18"/><circle cx="100" cy="100" r="64" fill="none" stroke="${TEAL}" stroke-width="18" stroke-dasharray="${C * share} ${C}" transform="rotate(-90 100 100)" filter="url(#rrg)" opacity="${lh === 'ppl' ? .3 : 1}"/>${tx(100, 104, '≈ ' + num(share * 100, 1) + ' %', { a: 'middle', w: 700, n: 26 })}${tx(100, 126, L('годин у роботів', 'of hours to robots'), { a: 'middle', n: 12, c: DIM })}</svg>`;
        window.__rr.altHours = { robotHours: rh, share: +(share * 100).toFixed(1) };
        return {
          body: `<div class="rr-gl rr-pn"><div class="rr-big">1 086 <small>${L('год праці за тиждень · точка = 5 год', 'labour hours a week · dot = 5 h')}</small></div><div class="rr-ch">${svgEl('h', 590, 340, o, L('Години праці магазину: люди і роботи', 'Store labour hours: people and robots'))}</div><p class="rr-info">${info}</p></div>
            <div class="rr-gl rr-pn rr-pn--c"><div class="rr-donut">${donut}</div><div class="rr-dleg"><span data-h="rob" class="rr-hit${lh === 'rob' ? ' on' : ''}"><i style="background:${TEAL}"></i>${L('Роботи', 'Robots')} ≈ ${num(rh)} ${L('год', 'h')}</span><span data-h="ppl" class="rr-hit${lh === 'ppl' ? ' on' : ''}"><i style="background:${ORG}"></i>${L('Люди', 'People')} ≈ ${num(TOT - rh)} ${L('год', 'h')}</span></div></div>`,
          take: L(`Роботи забирають <b>≈ ${num(share * 100, 1)} %</b> годин праці. Решту ${num(TOT - rh)} год, як і раніше, роблять люди.`, `Robots take <b>≈ ${num(share * 100, 1)} %</b> of labour hours. The other ${num(TOT - rh)} h are still done by people.`) };
      };
    },
  });

  /* 2 · ніч: склад */
  const MFC = [{ t: L('Ручне збирання в магазині', 'Hand picking in store'), sh: L('Руками', 'By hand'), min: 40, fix: 0, cap: 400, c: ORG, i: 'cart' }, { t: L('Мікроцентр у магазині', 'Micro-fulfilment in store'), sh: L('Мікроцентр', 'Micro-centre'), min: 15, fix: 600000, cap: 1500, c: BLUE, i: 'belt' }, { t: L('Великий автоматизований центр', 'Large automated centre'), sh: L('Великий центр', 'Large centre'), min: 6, fix: 10000000, cap: 12000, c: TEAL, i: 'arm' }];
  const mN = (p) => Math.round(30 * Math.pow(20000 / 30, p / 1000)), mCost = (m, n, w) => { const k = Math.ceil(n / m.cap), lab = m.min / 60 * w, fx = m.fix * k / (n * 365); return { lab, fx, tot: lab + fx, k }; };
  const M2 = { L: 46, R: 548, T: 22, B: 262, MAX: 40 };
  mount('rr-mfc', {
    title: L('Ніч: склад вирішує обсяг', 'Night: the warehouse is decided by volume'), icon: 'moon', take: 'box',
    ctl: [['n', 'box', L('Замовлень на день', 'Orders a day')], ['w', 'coins', L('Вартість години праці', 'Labour hour cost')]],
    drag: (k, ev, { P, set }) => { const p = P(ev, 'm'); if (p) set('n', 1000 * (p.x - M2.L) / (M2.R - M2.L)); },
    build: ({ v, S }) => () => {
      const n = mN(v('n')), w = v('w'), parts = MFC.map((m) => mCost(m, n, w)), best = parts.reduce((bi, p, i, A) => (p.tot < A[bi].tot ? i : bi), 0);
      const { L: l, R: r, T: t, B: bt, MAX } = M2, X = (nn) => l + (r - l) * Math.log(nn / 30) / Math.log(20000 / 30), Y = (e) => bt - (bt - t) * Math.min(e, MAX * 1.2) / MAX;
      const hi = S.h != null && /^m\d$/.test(S.h) ? +S.h[1] : null;
      let th = -1; for (let p = 0; p <= 1000; p += 2) { const nn = mN(p), c = MFC.map((m) => mCost(m, nn, w).tot); if (c[2] <= c[0] && c[2] <= c[1]) { th = nn; break; } }
      let o = GLOW + `<clipPath id="rrmc"><rect x="${l}" y="${t - 4}" width="${r - l}" height="${bt - t + 4}"/></clipPath>`;
      for (let e = 0; e <= MAX; e += 10) o += `<line x1="${l}" y1="${Y(e)}" x2="${r}" y2="${Y(e)}" stroke="rgba(255,255,255,.07)"/>` + tx(l - 8, Y(e) + 4, e + ' €', { a: 'end', n: 10.5, c: DIM, m: 1 });
      const xm0 = Math.min(r - 26, Math.max(l + 26, X(n))); [30, 100, 300, 1000, 3000, 10000, 20000].forEach((k) => { o += `<line x1="${X(k)}" y1="${bt}" x2="${X(k)}" y2="${bt + 5}" stroke="${FAINT}"/>` + (Math.abs(X(k) - xm0) < 46 ? '' : tx(X(k), bt + 20, num(k), { a: 'middle', n: 10.5, c: DIM, m: 1 })); });
      o += `<line x1="${l}" y1="${bt}" x2="${r}" y2="${bt}" stroke="${FAINT}"/>` + tx(r, bt + 40, L('замовлень на день (лог. шкала)', 'orders a day (log scale)'), { a: 'end', n: 10.5, c: DIM });
      o += tx(l, t - 6, L('€ за одне замовлення', '€ per order'), { n: 11.5, c: DIM, w: 600 });
      if (th > 0) o += `<rect x="${X(th)}" y="${t}" width="${r - X(th)}" height="${bt - t}" fill="${TEAL}" opacity=".05"/>` + tx(X(th) - 6, t + 14, L(`великий центр найдешевший від ≈ ${num(th)} →`, `large centre cheapest from ≈ ${num(th)} →`), { a: 'end', n: 10.5, c: TEAL, w: 600 });
      o += `<g clip-path="url(#rrmc)">`; MFC.forEach((m, i) => { let d = ''; for (let p = 0; p <= 1000; p += 4) { const nn = mN(p); d += (p ? 'L' : 'M') + X(nn).toFixed(1) + ' ' + Y(mCost(m, nn, w).tot).toFixed(1); }
        o += `<path d="${d}" fill="none" stroke="${m.c}" stroke-width="${hi === i ? 4 : 2.6}" opacity="${hi != null && hi !== i ? .25 : 1}"${hi === i || (hi == null && i === best) ? ' filter="url(#rrg)"' : ''}/>`; }); o += '</g>';
      const xm = X(n); o += `<line x1="${xm}" y1="${t}" x2="${xm}" y2="${bt}" stroke="${INK}" stroke-opacity=".7" stroke-dasharray="4 4"/>`;
      MFC.forEach((m, i) => { const yy = Y(parts[i].tot); if (parts[i].tot <= MAX * 1.2) o += `<circle cx="${xm}" cy="${yy}" r="${i === best ? 6 : 4.5}" fill="#0b1c26" stroke="${m.c}" stroke-width="2.5"/>`; });
      const xp = Math.min(r - 26, Math.max(l + 26, xm)), xh = Math.min(r - 40, Math.max(l + 40, xm)); o += pill(xp, bt + 20, num(n), INK) + (S.used ? '' : pill(xh, t + 36, L('↔ тягни', '↔ drag'), TEAL, { cl: 'rr-hint', tc: TEAL }));
      o += `<rect data-drag="n" x="${l}" y="${t}" width="${r - l}" height="${bt - t + 32}" fill="transparent" style="cursor:ew-resize"/>`;
      const cards = MFC.map((m, i) => { const p = parts[i], wl = Math.min(p.lab, MAX) / MAX * 100, wf = Math.max(0, Math.min(p.tot, MAX) - Math.min(p.lab, MAX)) / MAX * 100;
        return `<div class="rr-mc rr-hit${i === best ? ' win' : ''}${hi === i ? ' on' : ''}" data-h="m${i}" style="--c:${m.c}"><div class="rr-mc__h">${ic(m.i, 22)}<b>${m.t}</b>${i === best ? `<em>${L('найдешевше', 'cheapest')}</em>` : ''}</div>
          <div class="rr-mc__r"><span>${ic('clock', 15)} ${m.min} ${L('хв', 'min')}</span><span>${ic('coins', 15)} ${m.fix ? `${num(m.fix / 1e6, 1)} ${L('млн € / рік', '€m / yr')} × ${p.k}` : '—'}</span><strong>${p.tot > 99 ? '> 99' : num(p.tot, 2)} €</strong></div>
          <div class="rr-mc__bar"><i style="width:${wl}%;background:${ORG}"></i><i style="width:${wf}%;background:${m.c}"></i></div></div>`; }).join('');
      window.__rr.altMfc = parts.map((p) => +p.tot.toFixed(2));
      return { body: `<div class="rr-side">${cards}<p class="rr-mini"><i style="background:${ORG}"></i>${L('праця', 'labour')} <i style="background:linear-gradient(90deg,${BLUE},${TEAL})"></i>${L('площадка й техніка', 'site and machines')}</p></div><div class="rr-gl rr-pn"><div class="rr-ch">${svgEl('m', 570, 312, o, L('Вартість замовлення від обсягу', 'Cost per order by volume'), 'dr')}</div></div>`,
        take: best === 2 ? L(`При ${num(n)} замовленнях на день великий центр <b>уже найдешевший</b>: є чим його завантажити.`, `At ${num(n)} orders a day the large centre <b>is already cheapest</b>: there is enough to keep it busy.`)
          : L(`Великий центр найдешевший лише тоді, коли його є чим завантажити${th > 0 ? ` — від <b>≈ ${num(th)}</b> замовлень на день` : ''}. Зараз виграє «${MFC[best].sh}».`, `The large centre is cheapest only when there is enough to keep it busy${th > 0 ? ` — from <b>≈ ${num(th)}</b> orders a day` : ''}. Right now «${MFC[best].sh}» wins.`) };
    },
  });

  /* 3 · вечір: доставка */
  const lastF = (d, w, r) => { const trip = 2 * d / 6 + 5 / 60, n = Math.floor(12 / trip); return { trip, n, rb: r / Math.max(1, n), c: (2 * d / 15 + 5 / 60) * w }; };
  const D3 = { L: 50, R: 552, T: 30, B: 250 }, RT = { x0: 34, x1: 300 }, rtY = (f) => 112 - 46 * f + 14 * Math.sin(f * Math.PI * 2);
  mount('rr-last', {
    title: L('Вечір: доставка на шести колесах', 'Evening: delivery on six wheels'), icon: 'robot', take: 'route',
    ctl: [['d', 'route', L('Відстань в один бік', 'One-way distance')], ['w', 'coins', L('Година кур’єра', 'Courier hour')], ['r', 'robot', L('Робот на день (оренда й нагляд)', 'Robot per day (lease, supervision)')]],
    drag: (k, ev, { P, set }) => { const el = document.querySelector('#rr-last input[data-i="d"]'), mn = +el.min, mx = +el.max;
      if (k === 'd') { const p = P(ev, 'l'); if (p) set('d', mn + (mx - mn) * (p.x - D3.L) / (D3.R - D3.L)); }
      else { const p = P(ev, 'rt'); if (p) set('d', mn + (mx - mn) * (p.x - RT.x0) / (RT.x1 - RT.x0)); } },
    build: ({ v, S }) => { const el = document.querySelector('#rr-last input[data-i="d"]'), mn = +el.min, mx = +el.max;
      return () => {
        const d = v('d'), w = v('w'), r = v('r'), F = lastF(d, w, r), top = Math.max(lastF(mx, w, r).c, lastF(mx, w, r).rb) * 1.12;
        const { L: l, R: rr, T: t, B: bt } = D3, X = (k) => l + (rr - l) * (k - mn) / (mx - mn), Y = (e) => bt - (bt - t) * e / top;
        let cross = null; for (let k = mn; k <= mx + 1e-9; k += .05) { const f = lastF(k, w, r); if (f.c <= f.rb) { cross = k; break; } }
        let o = GLOW; const stp = top > 40 ? 10 : top > 16 ? 5 : 2;
        for (let e = 0; e <= top; e += stp) o += `<line x1="${l}" y1="${Y(e)}" x2="${rr}" y2="${Y(e)}" stroke="rgba(255,255,255,.07)"/>` + tx(l - 8, Y(e) + 4, e + ' €', { a: 'end', n: 10.5, c: DIM, m: 1 });
        for (let k = Math.ceil(mn); k <= mx; k++) if (Math.abs(X(k) - Math.min(rr - 30, Math.max(l + 30, X(d)))) >= 46) o += tx(X(k), bt + 20, num(k) + L(' км', ' km'), { a: 'middle', n: 10.5, c: DIM, m: 1 });
        o += `<line x1="${l}" y1="${bt}" x2="${rr}" y2="${bt}" stroke="${FAINT}"/>` + tx(l, t - 12, L('€ за одну доставку', '€ per delivery'), { n: 11.5, c: DIM, w: 600 });
        let pc = '', pr = ''; for (let k = mn; k <= mx + 1e-9; k += .02) { const f = lastF(k, w, r); pc += (pc ? 'L' : 'M') + X(k).toFixed(1) + ' ' + Y(f.c).toFixed(1); pr += (pr ? 'L' : 'M') + X(k).toFixed(1) + ' ' + Y(f.rb).toFixed(1); }
        o += `<path d="${pc}" fill="none" stroke="${ORG}" stroke-width="2.8" filter="url(#rrg)"/><path d="${pr}" fill="none" stroke="${TEAL}" stroke-width="2.8" filter="url(#rrg)"/>`;
        if (cross != null) o += `<line x1="${X(cross)}" y1="${t}" x2="${X(cross)}" y2="${bt}" stroke="${ORG}" stroke-opacity=".5" stroke-dasharray="2 4"/>` + tx(X(cross) > rr - 190 ? X(cross) - 5 : X(cross) + 5, X(cross) < l + 175 ? t + 104 : t + 12, L(`кур’єр дешевший від ≈ ${num(cross, 1)} км`, `courier cheaper from ≈ ${num(cross, 1)} km`), { n: 10.5, c: ORG, w: 600, a: X(cross) > rr - 190 ? 'end' : 'start' });
        const xm = X(d); o += `<line x1="${xm}" y1="${t}" x2="${xm}" y2="${bt}" stroke="${INK}" stroke-opacity=".7" stroke-dasharray="4 4"/>`;
        const yc = Y(F.c), yr = Y(F.rb), up = yc <= yr;
        o += `<circle cx="${xm}" cy="${yc}" r="5.5" fill="#0b1c26" stroke="${ORG}" stroke-width="2.5"/><circle cx="${xm}" cy="${yr}" r="5.5" fill="#0b1c26" stroke="${TEAL}" stroke-width="2.5"/>`;
        const lx = xm > (l + rr) / 2 ? xm - 10 : xm + 10, la = xm > (l + rr) / 2 ? 'end' : 'start';
        o += tx(lx, yc + (up ? -10 : 18), num(F.c, 2) + ' €', { a: la, n: 13, w: 700, m: 1, c: ORG }) + tx(lx, yr + (up ? 18 : -10), num(F.rb, 2) + ' €', { a: la, n: 13, w: 700, m: 1, c: TEAL });
        const xp = Math.min(rr - 30, Math.max(l + 30, xm)), xh = Math.min(rr - 40, Math.max(l + 40, xm)); o += pill(xp, bt + 20, num(d, 1) + L(' км', ' km'), INK) + (S.used ? '' : pill(xh, t + 76, L('↔ тягни', '↔ drag'), TEAL, { cl: 'rr-hint', tc: TEAL }));
        o += `<rect data-drag="d" x="${l}" y="${t}" width="${rr - l}" height="${bt - t + 32}" fill="transparent" style="cursor:ew-resize"/>`;
        o += `<g transform="translate(${l + 12} ${t + 4})"><rect width="150" height="54" rx="10" fill="#0b1c26" stroke="rgba(95,232,220,.3)"/>${icAt('bike', 10, 6, 18, ORG)}${tx(34, 20, L('Кур’єр', 'Courier'), { n: 12 })}${icAt('robot', 10, 29, 18, TEAL)}${tx(34, 43, L('Робот', 'Robot'), { n: 12 })}</g>`;
        // маршрут
        const f = (d - mn) / (mx - mn); let rp = '', dn = ''; for (let k = 0; k <= 1.0001; k += .02) { const x = RT.x0 + (RT.x1 - RT.x0) * k, y = rtY(k); rp += (rp ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); if (k <= f + 1e-6) dn += (dn ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
        const hx = RT.x0 + (RT.x1 - RT.x0) * f, hy = rtY(f);
        let q = GLOW + `<path d="${rp}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="5" stroke-linecap="round"/><path d="${dn}" fill="none" stroke="${TEAL}" stroke-width="4" stroke-linecap="round" filter="url(#rrg)"/><path class="rr-run" ${run(1.2)} d="${dn}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="0.1 14" stroke-linecap="round"/>`;
        q += `<circle cx="${RT.x0}" cy="${rtY(0)}" r="15" fill="#0b1c26" stroke="${TEAL}"/>${icAt('store', RT.x0 - 9, rtY(0) - 9, 18, TEAL)}`;
        q += `<g data-drag="h" style="cursor:grab"><circle cx="${hx}" cy="${hy}" r="22" fill="transparent"/><path d="M${hx} ${hy + 2} l-12 -16 a14 14 0 1 1 24 0z" fill="${ORG}" filter="url(#rrg)"/>${icAt('home', hx - 8, hy - 30, 16, '#1a1206')}</g>`;
        q += pill(Math.min(Math.max(hx, 40), 296), hy + 24, num(d, 1) + L(' км', ' km'), ORG, { tc: ORG });
        const sw = 100 / Math.max(1, F.n), bars = Array.from({ length: F.n }, (_, k) => `<i style="left:${k * sw}%;width:calc(${sw}% - 2px)"></i>`).join('');
        window.__rr.altLast = { courier: +F.c.toFixed(2), robot: +F.rb.toFixed(2), trips: F.n };
        const win = F.rb < F.c;
        return { body: `<div class="rr-gl rr-pn"><div class="rr-ch">${svgEl('l', 580, 290, o, L('Ціна однієї доставки від відстані', 'Price per delivery by distance'), 'dr')}</div></div>
          <div class="rr-side"><div class="rr-gl rr-stat">${ic('cal', 30)}<div><span>${L('Доставок робота на день', 'Robot deliveries a day')}</span><b>≈ ${F.n}</b><small>${L(`рейс туди й назад ≈ ${num(F.trip * 60)} хв · день 12 год`, `round trip ≈ ${num(F.trip * 60)} min · 12 h day`)}</small><div class="rr-trips">${bars}</div></div></div>
          <div class="rr-gl rr-pn rr-pn--rt"><div class="rr-ch">${svgEl('rt', 330, 150, q, L('Маршрут: магазин і будинок', 'Route: store and home'), 'dr')}</div><p class="rr-info">${S.used ? L(`Робот ${num(F.rb, 2)} € проти кур’єра ${num(F.c, 2)} € за доставку.`, `Robot €${num(F.rb, 2)} vs courier €${num(F.c, 2)} per delivery.`) : L('Тягни будиночок або маркер на графіку.', 'Drag the house or the marker on the chart.')}</p></div></div>`,
          take: win ? L(`На ${num(d, 1)} км робот дешевший: <b>${num(F.rb, 2)} €</b> проти ${num(F.c, 2)} € за доставку. ${cross != null ? `Від ≈ ${num(cross, 1)} км виграє кур’єр.` : 'До 6 км кур’єр його не наздоганяє.'}`, `At ${num(d, 1)} km the robot is cheaper: <b>€${num(F.rb, 2)}</b> vs €${num(F.c, 2)} per delivery. ${cross != null ? `From ≈ ${num(cross, 1)} km the courier wins.` : 'Within 6 km the courier never catches up.'}`)
            : L(`На ${num(d, 1)} км кур’єр дешевший: <b>${num(F.c, 2)} €</b> проти ${num(F.rb, 2)} € — у робота замало рейсів за день.`, `At ${num(d, 1)} km the courier is cheaper: <b>€${num(F.c, 2)}</b> vs €${num(F.rb, 2)} — the robot makes too few trips a day.`) };
      };
    },
  });

  /* 4 · Європа */
  mount('rr-eu', {
    title: L('Європа: той самий робот, різні рішення', 'Europe: the same robot, different answers'), icon: 'globe', take: 'scale',
    ctl: [['h', 'mop', L('Годин прибирання на день', 'Cleaning hours a day')], ['r', 'coins', L('Оренда робота на місяць', 'Robot lease a month')], ['a', 'people', L('Частка часу без людини', 'Share of time without a person')], ['_own', 'euro', L('Своя ціна години праці', 'Your own labour hour cost'), 5, 70, .5, 25, (x) => num(x, 1) + ' €']],
    build: ({ v, S }) => {
      const C = [['LU', L('Люксембург', 'Luxembourg'), 56.8], ['DK', L('Данія', 'Denmark'), 51.7], ['NL', L('Нідерланди', 'Netherlands'), 47.9], ['EZ', L('Єврозона', 'Euro area'), 38.2], ['EU', L('Середнє ЄС', 'EU average'), 34.9], ['HU', L('Угорщина', 'Hungary'), 15.2], ['RO', L('Румунія', 'Romania'), 13.6], ['BG', L('Болгарія', 'Bulgaria'), 12.0]];
      const T = [['SE', 5, 0], ['FI', 6, 0], ['EE', 7, 0], ['IE', 1, 1], ['DK', 4, 1], ['LV', 7, 1], ['BE', 2, 2], ['NL', 3, 2], ['DE', 4, 2], ['PL', 5, 2], ['LT', 6, 2], ['FR', 2, 3], ['LU', 3, 3], ['CZ', 4, 3], ['SK', 5, 3], ['PT', 0, 4], ['ES', 1, 4], ['AT', 4, 4], ['HU', 5, 4], ['RO', 6, 4], ['IT', 3, 5], ['SI', 4, 5], ['HR', 5, 5], ['BG', 6, 5], ['MT', 3, 6], ['GR', 6, 6], ['CY', 7, 6]];
      return () => {
        const h = v('h'), r = v('r'), a = v('a') / 100, k = h * 30.4 * a, be = r / k, net = (c) => k * c - r, own = v('_own');
        const rows = C.concat([['ME', L('Своя ціна', 'Your cost'), own]]).sort((p, q) => q[2] - p[2]), mxa = Math.max(...rows.map((x) => Math.abs(net(x[2]))), 1);
        let tbl = '', put = false; const hi = S.h;
        rows.forEach((x) => { if (!put && x[2] < be) { put = true; tbl += `<div class="rr-eu__be"><span>${L('поріг', 'break-even')} ≈ ${num(be, 1)} € / ${L('год', 'h')}</span></div>`; }
          const nv = net(x[2]), wd = Math.abs(nv) / mxa * 50, col = nv >= 0 ? GREEN : RED;
          tbl += `<div class="rr-eu__r rr-hit${hi === x[0] ? ' on' : ''}${x[0] === 'ME' ? ' me' : ''}" data-h="${x[0]}"><code>${x[0] === 'ME' ? '★' : x[0]}</code><span>${x[1]}</span><b>${num(x[2], 1)} €</b><div class="rr-eu__bar"><i style="${nv >= 0 ? 'left:50%' : `left:${50 - wd}%`};width:${wd}%;background:${col}"></i></div><em style="color:${col}">${nv >= 0 ? '+' : '−'}${num(Math.abs(nv))} €</em></div>`; });
        if (!put) tbl += `<div class="rr-eu__be"><span>${L('поріг', 'break-even')} ≈ ${num(be, 1)} € / ${L('год', 'h')}</span></div>`;
        const sel = rows.find((x) => x[0] === hi), det = sel ? L(`${sel[1]}: ${num(h, 1)} год × 30,4 дня × ${num(a * 100)} % = ${num(k)} год на місяць × ${num(sel[2], 1)} € = ${num(k * sel[2])} € − ${num(r)} € оренди = ${net(sel[2]) >= 0 ? '+' : '−'}${num(Math.abs(net(sel[2])))} €.`, `${sel[1]}: ${num(h, 1)} h × 30.4 days × ${num(a * 100)} % = ${num(k)} h a month × €${num(sel[2], 1)} = €${num(k * sel[2])} − €${num(r)} lease = ${net(sel[2]) >= 0 ? '+' : '−'}€${num(Math.abs(net(sel[2])))}.`)
          : L('Наведи на країну — покажу розрахунок. Зірочка — своя ціна години (бігунок угорі).', 'Hover a country to see the maths. The star is your own hour cost (slider above).');
        const S2 = 26, GP = 4; let mp = '';
        T.forEach(([cc, c, rw]) => { const x = c * (S2 + GP), y = rw * (S2 + GP), d = C.find((q) => q[0] === cc);
          if (!d) { mp += `<rect x="${x}" y="${y}" width="${S2}" height="${S2}" rx="5" fill="rgba(255,255,255,.06)"/>` + tx(x + S2 / 2, y + S2 / 2 + 3.5, cc, { a: 'middle', n: 8.5, c: FAINT, m: 1 }); return; }
          const col = net(d[2]) >= 0 ? GREEN : RED; mp += `<g class="rr-hit" data-h="${cc}"><rect x="${x}" y="${y}" width="${S2}" height="${S2}" rx="5" fill="${col}" fill-opacity="${hi === cc ? 1 : .8}" stroke="${hi === cc ? '#fff' : 'none'}" stroke-width="1.5"/>${tx(x + S2 / 2, y + S2 / 2 + 3.5, cc, { a: 'middle', n: 9, w: 700, c: '#07111b', m: 1 })}</g>`; });
        window.__rr.altEu = { breakEven: +be.toFixed(1) };
        return { body: `<div class="rr-gl rr-pn"><div class="rr-eu__hd"><span></span><span>${L('Країна', 'Country')}</span><span>${L('€ / год', '€ / h')}</span><span>${L('ефект на місяць', 'effect a month')}</span></div>${tbl}<p class="rr-info">${det}</p></div>
          <div class="rr-side"><div class="rr-gl rr-stat rr-stat--be">${ic('target', 34)}<div><span>${L('Поріг окупності', 'Break-even')}</span><b>≈ ${num(be, 1)} € <small>/ ${L('год', 'h')}</small></b><small>${L(`оренда ${num(r)} € ÷ ${num(k)} год роботи на місяць`, `lease €${num(r)} ÷ ${num(k)} robot hours a month`)}</small></div></div>
          <div class="rr-gl rr-pn rr-pn--map"><div class="rr-ch">${svgEl('eu', 236, 206, mp, L('Плиткова карта ЄС', 'Tile map of the EU'))}</div><p class="rr-mini"><i style="background:${GREEN}"></i>${L('окупається', 'pays off')} <i style="background:${RED}"></i>${L('не окупається', 'does not')} <i style="background:rgba(255,255,255,.12)"></i>${L('немає даних у сцені', 'not in the scene')}</p></div></div>`,
          take: L(`Окупність визначає <b>ціна години</b>, а не технологія: той самий робот окупається там, де година праці дорожча за ≈ ${num(be, 1)} €.`, `Payback is decided by <b>the price of an hour</b>, not by the technology: the same robot pays off where an hour of work costs more than ≈ €${num(be, 1)}.`) };
      };
    },
  });

  /* 5 · під капотом */
  mount('rr-flow', {
    title: L('Під капотом: від камери до завдання людині', 'Under the hood: from camera to a person’s task'), icon: 'link', take: 'gear', one: true,
    ctl: [['f', 'scan', L('Робот знаходить порожніх місць', 'Robot finds empty slots')], ['p', 'bell', L('Хибних тривог на 100 знайдених', 'False alarms per 100 found')], ['i', 'link', L('Подія доходить до застосунку', 'Event reaches the staff app')], ['w', 'person', L('Працівник встигає до відкриття', 'Worker makes it before opening')]],
    build: ({ v, S }) => () => {
      const f = v('f') / 100, p = v('p') / 100, ii = v('i') / 100, w = v('w') / 100, N1 = 100 * f, N2 = N1 * ii, N3 = N2 * w, FA = N1 * p * ii;
      const miss = 100 - N1, stuck = N1 - N2, late = N2 - N3, R = (x) => num(Math.round(x)), hi = S.h, K = 1.05;
      const CX = [16, 246, 476, 706], CW = 178, MID = 150;
      const rib = (x1, y1, x2, y2, wd, col, op = .28) => { if (wd < .5) return ''; const mx = (x1 + x2) / 2, a = wd / 2, d = `M${x1} ${y1 - a} C${mx} ${y1 - a} ${mx} ${y2 - a} ${x2} ${y2 - a} L${x2} ${y2 + a} C${mx} ${y2 + a} ${mx} ${y1 + a} ${x1} ${y1 + a}Z`;
        return `<path d="${d}" fill="${col}" fill-opacity="${op}"/><path class="rr-run" ${run(1.1)} d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="${Math.max(2, Math.min(5, wd / 8))}" stroke-dasharray="0.1 13" stroke-linecap="round" filter="url(#rrg)"/>`; };
      const card = (key, x, y, wd, ht, col, icn, title, big, sub, extra = '') => { const on = hi === key, dim = hi && !on ? ' opacity=".45"' : '';
        return `<g class="rr-hit" data-h="${key}"${dim}><rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="14" fill="#0b1c26" fill-opacity=".92" stroke="${col}" stroke-opacity="${on ? 1 : .55}" stroke-width="${on ? 2.2 : 1.3}"${on ? ' filter="url(#rrg)"' : ''}/>${icAt(icn, x + 14, y + 12, 20, col)}${tx(x + 42, y + 27, title, { n: 12.5, w: 600 })}${tx(x + wd / 2, y + ht / 2 + (extra ? 8 : 18), big, { a: 'middle', n: 32, w: 700, m: 1 })}${sub ? tx(x + wd / 2, y + ht - 14, sub, { a: 'middle', n: 11.5, c: DIM }) : ''}${extra}</g>`; };
      const yA = MID - 52, yB = MID + 76;
      let o = GLOW;
      o += rib(CX[0] + CW, MID + 8, CX[1], MID + 8, N1 * K, TEAL);
      o += rib(CX[1] + CW, MID + 8 - (N1 - N2) * K / 2, CX[2], yA, N2 * K, TEAL) + rib(CX[1] + CW, MID + 8 + N2 * K / 2, CX[2], yB, stuck * K, ORG, .32);
      o += rib(CX[2] + CW, yA, CX[3], MID + 8, N3 * K, TEAL);
      o += card('real', CX[0], 40, CW, 220, TEAL, 'shelf', L('Реальність на полицях', 'Reality on shelves'), '100', L('порожніх місць', 'empty slots'));
      o += card('found', CX[1], 40, CW, 220, TEAL, 'camera', L('Робот знаходить', 'Robot finds'), R(N1), L(`пропущено ${R(miss)}`, `missed ${R(miss)}`));
      const fa = FA >= .5 ? `${icAt('bell', CX[2] + 14, yA + 32, 14, RED)}${tx(CX[2] + 32, yA + 43, L(`+${R(FA)} хибних`, `+${R(FA)} false`), { n: 11, c: RED, w: 600 })}` : '';
      o += card('app', CX[2], yA - 58, CW, 116, TEAL, 'link', L('У застосунку', 'In the staff app'), R(N2), '', fa);
      o += card('stuck', CX[2], yB - 36, CW, 100, ORG, 'warn', L('Застрягло в порталі', 'Stuck in the portal'), R(stuck), '');
      o += card('done', CX[3], 40, CW, 220, TEAL, 'person', L('До відкриття', 'Before opening'), '≈ ' + R(N3), L(`не встигли ${R(late)}`, `too late ${R(late)}`));
      const INF = { real: L('100 порожніх місць — точка відліку: стільки бачив би ідеальний обхід.', '100 empty slots: the starting point, what a perfect walk would see.'),
        found: L(`Камера знаходить ${R(f * 100)} % — ${R(miss)} місць робот пропускає.`, `The camera finds ${R(f * 100)} % — the robot misses ${R(miss)} slots.`),
        app: L(`До застосунку працівника доходить ${R(ii * 100)} % подій — ${R(N2)}. Разом з ними приходять ще ${R(FA)} хибних завдань: це теж час людей.`, `${R(ii * 100)} % of events reach the staff app — ${R(N2)}. Another ${R(FA)} false tasks arrive with them: staff time too.`),
        stuck: L(`${R(stuck)} подій застрягли в порталі постачальника: робот бачив, магазин — ні.`, `${R(stuck)} events got stuck in the vendor portal: the robot saw them, the store did not.`),
        done: L(`Працівник встигає ${R(w * 100)} % до відкриття: ${R(N3)} полиць заповнено, ${R(late)} — пізніше.`, `Staff get to ${R(w * 100)} % before opening: ${R(N3)} shelves refilled, ${R(late)} later.`) };
      const big = Math.max(miss, stuck, late);
      window.__rr.altFlow = { found: Math.round(N1), reached: Math.round(N2), refilled: Math.round(N3) };
      return { body: `<div class="rr-gl rr-pn"><div class="rr-ch">${svgEl('f', 900, 290, o, L('Ланцюжок: камера, інтеграція, людина', 'Chain: camera, integration, person'))}</div><p class="rr-info">${hi && INF[hi] ? INF[hi] : L('Наведи або торкнись картки — поясню етап. Товщина стрічки — скільки подій іде далі.', 'Hover or tap a card to explain the step. Ribbon width is how many events go on.')}</p></div>`,
        take: big === stuck ? L(`Найбільша втрата — не в роботі (${R(miss)}), а <b>в інтеграції з процесами магазину (${R(stuck)})</b>.`, `The biggest loss is not the robot (${R(miss)}) but <b>the integration with store processes (${R(stuck)})</b>.`)
          : big === miss ? L(`Найбільша втрата — <b>у камері робота (${R(miss)})</b>; інтеграція губить ${R(stuck)}.`, `The biggest loss is <b>the robot’s camera (${R(miss)})</b>; integration loses ${R(stuck)}.`)
            : L(`Найбільша втрата — <b>у людей до відкриття (${R(late)})</b>: робот і інтеграція свою частину зробили.`, `The biggest loss is <b>people before opening (${R(late)})</b>: the robot and integration did their part.`) };
    },
  });

  /* 6 · гроші */
  const T6 = { L: 62, R: 560, T: 34, B: 262 };
  mount('rr-tco', {
    title: L('Гроші: купити чи взяти як сервіс', 'Money: buy or take as a service'), icon: 'coins', take: 'cal',
    ctl: [['n', 'robot', L('Кількість роботів', 'Number of robots')], ['p', 'coins', L('Ціна робота, тис. €', 'Robot price, €k')], ['m', 'gear', L('Сервіс і ліцензії (при купівлі)', 'Service and licences (bought)')], ['r', 'repeat', L('RaaS за робота на місяць', 'RaaS per robot a month')], ['i', 'puzzle', L('Інтеграція (разово)', 'Integration (one-off)')]],
    move: (ev, c) => { if (ev.pointerType === 'mouse' && ev.target.closest('[data-drag="t"]')) { c.used(); const p = c.P(ev, 't'); if (p) { c.S.t = Math.max(0, Math.min(60, Math.round(60 * (p.x - T6.L) / (T6.R - T6.L)))); c.redraw(); } } },
    drag: (k, ev, { P, S, redraw }) => { const p = P(ev, 't'); if (!p) return; S.t = Math.max(0, Math.min(60, Math.round(60 * (p.x - T6.L) / (T6.R - T6.L)))); redraw(); },
    build: ({ v, S }) => () => {
      const n = v('n'), p = v('p') * 1000, m = v('m') / 100, r = v('r'), ig = v('i') * 1000, MO = 60;
      const buy = [], raas = []; for (let t = 0; t <= MO; t++) { buy.push(ig + n * p + n * p * m * t / 12); raas.push(ig + n * r * t); }
      let cross = -1; for (let t = 1; t <= MO; t++) if (raas[t] >= buy[t]) { cross = t; break; }
      const mxv = Math.max(buy[MO], raas[MO]), stp = [50e3, 100e3, 200e3, 250e3, 500e3, 1e6, 2e6].find((s) => mxv / s <= 6) || 5e6, top = Math.ceil(mxv * 1.08 / stp) * stp;
      const { L: l, R: rt, T: t0, B: bt } = T6, X = (t) => l + (rt - l) * t / MO, Y = (e) => bt - (bt - t0) * e / top, K = (e) => num(e / 1000);
      let o = GLOW;
      for (let e = 0; e <= top; e += stp) o += `<line x1="${l}" y1="${Y(e)}" x2="${rt}" y2="${Y(e)}" stroke="rgba(255,255,255,.07)"/>` + tx(l - 8, Y(e) + 4, num(e / 1000), { a: 'end', n: 10.5, c: DIM, m: 1 });
      for (let t = 0; t <= MO; t += 6) if (!(cross > 1 && Math.abs(t - cross) < 3.5)) o += tx(X(t), bt + 18, t, { a: 'middle', n: 10.5, c: DIM, m: 1 });
      o += tx(rt, bt + 34, L('місяці', 'months'), { a: 'end', n: 10.5, c: DIM }) + tx(l - 40, t0 - 14, L('Накопичені витрати, тис. €', 'Cumulative cost, €k'), { n: 11.5, c: DIM, w: 600 }) + `<line x1="${l}" y1="${bt}" x2="${rt}" y2="${bt}" stroke="${FAINT}"/>`;
      for (let t = 0; t < MO; t++) { const low = raas[t] + raas[t + 1] < buy[t] + buy[t + 1] ? TEAL : ORG; o += `<path d="M${X(t)} ${Y(buy[t])} L${X(t + 1)} ${Y(buy[t + 1])} L${X(t + 1)} ${Y(raas[t + 1])} L${X(t)} ${Y(raas[t])}Z" fill="${low}" fill-opacity=".13"/>`; }
      const line = (A, c) => `<path d="M${X(0)} ${Y(0)} L${A.map((e, t) => X(t) + ' ' + Y(e)).join(' L')}" fill="none" stroke="${c}" stroke-width="2.8" filter="url(#rrg)"/>`;
      o += line(buy, ORG) + line(raas, TEAL);
      const call = (x, y, col, icn, a, b2) => `<g transform="translate(${x} ${y})"><rect width="178" height="44" rx="9" fill="#0b1c26" fill-opacity=".92" stroke="${col}" stroke-opacity=".7"/>${icAt(icn, 9, 12, 20, col)}${tx(36, 19, a, { n: 11.5, w: 700, c: col })}${tx(36, 34, b2, { n: 10.5, c: DIM })}</g>`;
      const by = Y(buy[8]) - 78 > t0 ? Y(buy[8]) - 78 : Y(buy[8]) + 14, ry = Math.min(bt - 50, Y(raas[14]) + 16);
      o += call(X(3), by, ORG, 'cart', L('Купівля', 'Purchase'), L('великий старт, далі дешевше', 'big start, cheaper later'));
      if (Math.abs(ry - by) > 48) o += call(X(15), ry, TEAL, 'repeat', L('Сервіс (RaaS)', 'Service (RaaS)'), L('низький старт, плата щомісяця', 'low start, monthly fee'));
      if (cross > 1) { const cy = Y(raas[cross]); o += `<line x1="${X(cross)}" y1="${cy}" x2="${X(cross)}" y2="${bt}" stroke="${INK}" stroke-opacity=".6" stroke-dasharray="4 4"/><circle cx="${X(cross)}" cy="${cy}" r="6" fill="#0b1c26" stroke="${INK}" stroke-width="2.5" filter="url(#rrg)"/>` + pill(X(cross), bt + 18, cross, INK) + tx(X(cross), cy - 14, L(`перетин: ${cross}-й місяць`, `crossover: month ${cross}`), { a: 'middle', n: 11.5, w: 700 }); }
      o += pill(rt - 6, Y(buy[MO]) + (buy[MO] > raas[MO] ? -16 : 18), '≈ ' + K(buy[MO]), ORG, { tc: ORG }) + pill(rt - 6, Y(raas[MO]) + (raas[MO] >= buy[MO] ? -16 : 18), '≈ ' + K(raas[MO]), TEAL, { tc: TEAL });
      const ct = S.t; let rd = L('Проведи пальцем або мишкою по графіку — покажу будь-який місяць.', 'Move across the chart to read any month.');
      if (ct != null) { const xb = X(ct), d = buy[ct] - raas[ct]; o += `<line x1="${xb}" y1="${t0}" x2="${xb}" y2="${bt}" stroke="#fff" stroke-opacity=".5"/><circle cx="${xb}" cy="${Y(buy[ct])}" r="5" fill="${ORG}"/><circle cx="${xb}" cy="${Y(raas[ct])}" r="5" fill="${TEAL}"/>` + pill(xb, t0 + 14, L(`міс. ${ct}`, `mo ${ct}`), '#fff');
        rd = L(`Місяць ${ct}: купівля ≈ ${K(buy[ct])} тис. €, сервіс ≈ ${K(raas[ct])} тис. € — ${Math.abs(d) < 500 ? 'майже порівну' : (d > 0 ? 'сервіс' : 'купівля') + ' дешевший на ≈ ' + K(Math.abs(d)) + ' тис. €'}.`, `Month ${ct}: purchase ≈ €${K(buy[ct])}k, service ≈ €${K(raas[ct])}k — ${Math.abs(d) < 500 ? 'about even' : (d > 0 ? 'service' : 'purchase') + ' cheaper by ≈ €' + K(Math.abs(d)) + 'k'}.`); }
      else if (!S.used) o += pill((l + rt) / 2, t0 + 16, L('↔ проведи', '↔ move'), TEAL, { cl: 'rr-hint', tc: TEAL });
      o += `<rect data-drag="t" x="${l}" y="${t0}" width="${rt - l}" height="${bt - t0}" fill="transparent" style="cursor:crosshair"/>`;
      const bw = buy[MO] <= raas[MO];
      window.__rr.altTco = { cross, buy60: Math.round(buy[MO]), raas60: Math.round(raas[MO]) };
      return { body: `<div class="rr-gl rr-pn"><div class="rr-ch">${svgEl('t', 600, 304, o, L('Купити чи взяти як сервіс: накопичені витрати', 'Buy or service: cumulative cost'), 'dr')}</div><p class="rr-info">${rd}</p></div>
        <div class="rr-side"><div class="rr-gl rr-stat${bw ? ' win' : ''}" style="--c:${ORG}">${ic('cart', 30)}<div><span>${L('Купівля, 5 років', 'Purchase, 5 years')}</span><b>≈ ${K(buy[MO])} ${L('тис. €', '€k')}</b></div></div>
          <div class="rr-gl rr-stat${bw ? '' : ' win'}" style="--c:${TEAL}">${ic('repeat', 30)}<div><span>${L('Сервіс (RaaS), 5 років', 'Service (RaaS), 5 years')}</span><b>≈ ${K(raas[MO])} ${L('тис. €', '€k')}</b></div></div>
          <p class="rr-mini"><i style="background:${TEAL};opacity:.6"></i>${L('дешевший сервіс', 'service cheaper')} <i style="background:${ORG};opacity:.6"></i>${L('дешевша купівля', 'purchase cheaper')}</p></div>`,
        take: cross > 1 ? L(`До ${cross}-го місяця дешевший сервіс, далі — купівля. Питання не «що дешевше», а <b>на який строк клієнт упевнений</b>.`, `Until month ${cross} the service is cheaper, then the purchase. The question is not “which is cheaper” but <b>how long the client is sure</b>.`)
          : cross === 1 ? L('Купівля дешевша <b>з першого ж місяця</b> — сервіс тут не дає гнучкості, лише переплату.', 'The purchase is cheaper <b>from month one</b>: the service buys no flexibility here, only extra cost.')
            : L('За 5 років сервіс <b>так і лишається дешевшим</b>: купівля не встигає окупитися.', 'Over 5 years the service <b>stays cheaper</b>: the purchase never pays back.') };
    },
  });
})();
