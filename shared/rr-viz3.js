/* Стаття 41, третя частина: ідеї форм із добірки Maptive (03.11.2026) — тиждень магазину точками, потік «100 порожніх місць», хвилі запусків і згортань, розподіл країн ЄС.
   Дані: TimeForge 2022 (години за відділами, вибірка клієнтів TimeForge у США), Eurostat lc_lci_lev 2025, звіти компаній — усе з джерелами в «Що відомо». Частки, які бере робот, і втрати в потоці — припущення, підписані на сценах. Стан — window.__rr. */
(function () {
  const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk);
  const $ = (id) => document.getElementById(id), SND = (k) => { if (window.RR_SND) RR_SND.fx(k); };
  const num = (v, d = 0) => Number(v).toLocaleString(EN ? 'en-GB' : 'uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d }), T = window.__rr = window.__rr || {};
  const sc = (s, html) => { const b = document.createElement('div'); b.className = 'oc-sc rr-sc'; b.innerHTML = html; s.appendChild(b); return b; };
  const slider = (lab, id, min, max, step, val) => `<label class="oc-r">${lab} <b data-o="${id}"></b><input type="range" data-i="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
  const used = (e) => e && e.classList.add('used'), REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MONO = '"Roboto Mono", monospace', SANS = 'Inter, system-ui, sans-serif', NS = 'http://www.w3.org/2000/svg';
  const io = (el, f, th = .34) => new IntersectionObserver((e, o) => { if (e[0].intersectionRatio >= th) { o.disconnect(); f(); } }, { threshold: [0, th] }).observe(el);

  /* ═════ тиждень одного магазину: 1 086 годин праці точками, частина переходить до роботів ═════ */
  (function () { const s = $('rr-hours'); if (!s) return;
    // TimeForge 2022: середні відпрацьовані години на тиждень на магазин; «інше» = 1 086 − сума п'яти відділів
    const D = [[L('Бакалія', 'Grocery'), 310, '#2fb7c4'], [L('Каса й зал', 'Front end'), 226, '#e8a33f'], [L('Пекарня й кулінарія', 'Bakery and deli'), 162, '#c98bd8'], [L('М’ясо й риба', 'Meat and seafood'), 108, '#e0735d'], [L('Овочі й фрукти', 'Produce'), 80, '#7cc46b'], [L('Інше', 'Other'), 200, '#8fa3b0']];
    const PER = 5, TOT = 1086;
    const b = sc(s, `<canvas class="rr-cv" aria-label="${L('1 086 годин праці магазину за тиждень, кожна точка — 5 годин', '1,086 store labour hours a week, each dot is 5 hours')}"></canvas>
      <div class="rr-ctl"><button type="button" class="rc-btn oc-glow" data-go>${L('Що з цього беруть роботи', 'What robots take from this')}</button>${slider(L('Частка годин бакалії на перевірку полиць і цін, %', 'Share of grocery hours spent checking shelves and prices, %'), 'a', 0, 20, 1, 8)}${slider(L('Годин миття підлоги на тиждень', 'Floor scrubbing hours a week'), 'c', 0, 60, 2, 28)}</div>
      <div class="oc-card" data-c></div>
      <p class="oc-note">${L('Години за відділами — TimeForge, 2022: середнє серед клієнтів сервісу (незалежні й середні мережі США, переважно сільські магазини), не вся галузь. «Інше» — напої, побутова хімія, прибирання тощо, окремо не розписано. Скільки з цього бере робот — наші припущення: робот-сканер забирає обхід, але не викладку; мийка — 80 % миття підлоги.', 'Hours by department: TimeForge 2022, an average across the service’s customers (independent and mid-sized US chains, mostly rural stores), not the whole industry. ‘Other’ covers beer and wine, health and beauty, cleaning and so on, not broken out. How much of it a robot takes is our assumption: a scanning robot takes the walk, not the restocking; a scrubber takes 80% of floor scrubbing.')}</p>`);
    const cv = b.querySelector('canvas'), x = cv.getContext('2d'), I = {}, O = {}; b.querySelectorAll('[data-i]').forEach((e) => { I[e.dataset.i] = e; }); b.querySelectorAll('[data-o]').forEach((e) => { O[e.dataset.o] = e; });
    const dots = []; let k = 0; D.forEach((d, di) => { const n = Math.round(d[1] / PER); for (let j = 0; j < n; j++) dots.push({ d: di, j, x: Math.random(), y: Math.random(), tx: 0, ty: 0, r: false, k: k++ }); });
    let W = 1, H = 1, DG = 8, robotOn = false, t = 0, raf = 0, phase = 0;
    function size() { const dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = Math.max(300, Math.min(420, W * .5)); cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); layout(); draw(); }
    function robotCount() { const a = +I.a.value / 100, c = +I.c.value; return { scan: Math.round(310 * a / PER), clean: Math.round(c * .8 / PER) }; }
    function layout() { const cols = D.length + 1, cw = (W - 24) / cols, rows = W < 520 ? 4 : 6, gap = Math.min(cw / (rows + .6), (H - 100) / Math.ceil(64 / rows)), base = H - 50, rc = robotCount(); DG = gap;
      let sScan = rc.scan, sClean = rc.clean; dots.forEach((p) => { p.r = false; });
      if (robotOn) { dots.filter((p) => p.d === 0).slice(0, sScan).forEach((p) => { p.r = true; }); dots.filter((p) => p.d === 5).slice(0, sClean).forEach((p) => { p.r = true; }); }
      const cnt = new Array(cols).fill(0);
      dots.forEach((p) => { const c = p.r ? D.length : p.d, i = cnt[c]++; p.tx = 12 + c * cw + cw / 2 - (rows - 1) * gap / 2 + (i % rows) * gap; p.ty = base - Math.floor(i / rows) * gap; });
      T.hours = { robotDots: rc.scan + rc.clean, robotHours: (rc.scan + rc.clean) * PER, share: +((rc.scan + rc.clean) * PER / TOT * 100).toFixed(1), on: robotOn };
      const rh = (rc.scan + rc.clean) * PER;
      b.querySelector('[data-c]').innerHTML = robotOn ? `<b>${L(`Роботи беруть ≈ ${num(rh)} год із ${num(TOT)} — ${num(rh / TOT * 100, 1)} %`, `Robots take ≈ ${num(rh)} h of ${num(TOT)}: ${num(rh / TOT * 100, 1)}%`)}</b>${L('Обхід полиць і миття підлоги — повторювані, вимірювані й нічні. Решту — викладку, касу, свіжі відділи — робить людина. Тому робот у магазині не «замінює персонал», а звільняє кілька годин, які ще треба кудись спрямувати.', 'Shelf walks and floor scrubbing are repetitive, measurable and done at night. The rest (restocking, checkout, fresh counters) is done by people. So a store robot does not ‘replace staff’; it frees a few hours that still have to be put to use.')}` : `<b>${L('Тиждень одного магазину — 1 086 годин праці', 'One store’s week: 1,086 labour hours')}</b>${L('Кожна точка — 5 годин. Найбільше часу йде на бакалію (викладка, замовлення) і касу. Натисніть кнопку й подивіться, яку частину можуть забрати роботи.', 'Each dot is 5 hours. Most time goes to grocery (restocking, ordering) and the checkout. Press the button to see which part robots can take.')}`; }
    function draw() { x.clearRect(0, 0, W, H); x.fillStyle = '#0b1622'; x.fillRect(0, 0, W, H);
      const cols = D.length + 1, cw = (W - 24) / cols, e = phase < 1 ? phase * phase * (3 - 2 * phase) : 1, rr = Math.max(1.6, DG * .36);
      dots.forEach((p) => { const sx = 12 + p.x * (W - 24), sy = 16 + p.y * (H - 80), px = sx + (p.tx - sx) * e, py = sy + (p.ty - sy) * e; x.fillStyle = p.r ? '#5fe8dc' : D[p.d][2]; x.globalAlpha = p.r ? 1 : .85; x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill(); });
      x.globalAlpha = 1; x.textAlign = 'center';
      D.concat([[L('Роботи', 'Robots'), 0, '#5fe8dc']]).forEach((d, i) => { if (i === D.length && !robotOn) return; const cx = 12 + i * cw + cw / 2; x.font = `600 ${W < 520 ? 9 : 11}px ${SANS}`; x.fillStyle = i === D.length ? '#5fe8dc' : '#cfdde3'; const words = d[0].split(' '); x.globalAlpha = e;
        if (W < 620 && words.length > 1) { x.fillText(words[0], cx, H - 26); x.fillText(words.slice(1).join(' '), cx, H - 13); } else x.fillText(d[0], cx, H - 22);
        x.font = `500 ${W < 520 ? 9 : 10}px ${MONO}`; x.fillStyle = 'rgba(207,221,227,.6)'; const h = i === D.length ? T.hours.robotHours : d[1] - (robotOn ? dots.filter((p) => p.d === i && p.r).length * PER : 0); if (!(W < 620 && words.length > 1)) x.fillText(num(h) + L(' год', ' h'), cx, H - 8); x.globalAlpha = 1; });
      x.textAlign = 'left'; }
    function run() { if (raf) return; const t0 = performance.now(), from = phase; const step = (now) => { phase = Math.min(1, from + (now - t0) / 1600); draw(); raf = phase < 1 ? requestAnimationFrame(step) : 0; }; if (REDUCE) { phase = 1; draw(); } else raf = requestAnimationFrame(step); }
    function relayout() { const prev = dots.map((p) => [p.tx, p.ty]); layout(); if (REDUCE || phase < 1) { draw(); return; } dots.forEach((p, i) => { p.x = (prev[i][0] - 12) / (W - 24); p.y = (prev[i][1] - 16) / (H - 80); }); phase = 0; run(); }
    b.querySelector('[data-go]').addEventListener('click', (e) => { used(e.currentTarget); robotOn = !robotOn; e.currentTarget.textContent = robotOn ? L('Сховати роботів', 'Hide robots') : L('Що з цього беруть роботи', 'What robots take from this'); SND('click'); relayout(); });
    Object.values(I).forEach((e) => e.addEventListener('input', () => { used(e); O[e.dataset.i].textContent = num(+e.value); if (robotOn) { layout(); draw(); } else layout(); }));
    Object.values(I).forEach((e) => { O[e.dataset.i].textContent = num(+e.value); });
    new ResizeObserver(size).observe(cv); io(cv, run); })();

  /* ═════ 08 · під капотом: 100 порожніх місць за ніч — скільки з них стане повною полицею ═════ */
  (function () { const s = $('rr-flow'); if (!s) return;
    const b = sc(s, `<div class="rr-ctl">${slider(L('Робот знаходить порожніх місць, %', 'Robot finds empty slots, %'), 'f', 50, 99, 1, 90)}${slider(L('Хибних тривог на 100 знайдених', 'False alarms per 100 found'), 'p', 0, 60, 1, 15)}${slider(L('Подія доходить до застосунку працівника, %', 'Event reaches the staff app, %'), 'i', 0, 100, 5, 60)}${slider(L('Працівник встигає до відкриття, %', 'Worker gets there before opening, %'), 'w', 20, 100, 5, 70)}</div>
      <div class="rr-flow" data-svg></div><div class="oc-card" data-c></div>
      <p class="oc-note">${L('Модель із припущеннями, не дані конкретного робота. Типові значення — для пілота, де інтеграцію ще не доробили: подія часто лишається в порталі постачальника.', 'A model with assumptions, not data from any specific robot. The defaults describe a pilot where integration is unfinished: the event often stays in the vendor’s portal.')}</p>`);
    const I = {}, O = {}; b.querySelectorAll('[data-i]').forEach((e) => { I[e.dataset.i] = e; }); b.querySelectorAll('[data-o]').forEach((e) => { O[e.dataset.o] = e; });
    const host = b.querySelector('[data-svg]');
    function upd() { const f = +I.f.value / 100, p = +I.p.value / 100, ii = +I.i.value / 100, w = +I.w.value / 100; Object.keys(I).forEach((k) => { O[k].textContent = num(+I[k].value); });
      const N0 = 100, N1 = N0 * f, N2 = N1 * ii, N3 = N2 * w, FA = N1 * p, FAs = FA * ii;
      const loss = [[L('пропустив робот', 'missed by the robot'), N0 - N1], [L('застрягли в порталі', 'stuck in the portal'), N1 - N2], [L('не встигли до відкриття', 'not done before opening'), N2 - N3]].sort((a, b2) => b2[1] - a[1]);
      const VW = 1000, VH = 300, sc_ = 2.1, cx = [40, 330, 620, 900], top = 30;
      const node = (c, y, h, cl, t, v) => `<rect x="${cx[c]}" y="${y}" width="16" height="${Math.max(1, h)}" rx="3" fill="${cl}"/><text x="${c === 3 ? cx[c] - 8 : cx[c] + 24}" y="${y + Math.max(h, 12) / 2 + 4}" text-anchor="${c === 3 ? 'end' : 'start'}" class="rr-flow__t">${t} · ${num(v)}</text>`;
      const band = (c, y0, y1, h, cl, op = .35) => { const xa = cx[c] + 16, xb = cx[c + 1], m = (xa + xb) / 2; return `<path d="M${xa} ${y0} C${m} ${y0} ${m} ${y1} ${xb} ${y1} L${xb} ${y1 + h} C${m} ${y1 + h} ${m} ${y0 + h} ${xa} ${y0 + h} Z" fill="${cl}" opacity="${op}"/>`; };
      const h0 = N0 * sc_, h1 = N1 * sc_, h2 = N2 * sc_, h3 = N3 * sc_, hm1 = h0 - h1, hm2 = h1 - h2, hm3 = h2 - h3;
      const yMiss = top + h1 + 14, yStuck = top + h2 + 14, yLate = top + h3 + 14;
      host.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${L('Потік 100 порожніх місць від камери до полиці', 'Flow of 100 empty slots from camera to shelf')}">
        ${band(0, top, top, h1, '#2fb7c4')}${band(0, top + h1, yMiss, hm1, '#c8573f', .28)}
        ${band(1, top, top, h2, '#2fb7c4')}${band(1, top + h2, yStuck, hm2, '#c8573f', .28)}
        ${band(2, top, top, h3, '#5fe8dc', .5)}${band(2, top + h3, yLate, hm3, '#c8573f', .28)}
        ${node(0, top, h0, '#cfdde3', L('Порожніх місць за ніч', 'Empty slots overnight'), N0)}
        ${node(1, top, h1, '#2fb7c4', L('Знайшов робот', 'Found by robot'), N1)}${node(1, yMiss, hm1, '#c8573f', L('Пропустив', 'Missed'), N0 - N1)}
        ${node(2, top, h2, '#2fb7c4', L('Дійшло до людини', 'Reached a person'), N2)}${node(2, yStuck, hm2, '#c8573f', L('Застрягло', 'Stuck'), N1 - N2)}
        ${node(3, top, h3, '#5fe8dc', L('Полиця повна', 'Shelf full'), N3)}${node(3, yLate, hm3, '#c8573f', L('Не встигли', 'Too late'), N2 - N3)}
      </svg>`;
      b.querySelector('[data-c]').innerHTML = `<b>${L(`Поповнено ${num(N3)} зі 100`, `${num(N3)} of 100 refilled`)}</b>${L(`Найбільша втрата — ${loss[0][0]} (${num(loss[0][1])}). Крім того, працівники ходять на ${num(FAs)} хибних тривог. Точність камери тут не головне: дані мають дійти до людини, а людина — встигнути.`, `The biggest loss: ${loss[0][0]} (${num(loss[0][1])}). On top of that, staff walk to ${num(FAs)} false alarms. Camera accuracy is not the main thing here: data must reach a person, and the person must get there in time.`)}`;
      T.flow = { found: Math.round(N1), reached: Math.round(N2), refilled: Math.round(N3), falseAlarms: Math.round(FAs), worst: loss[0][0] }; }
    Object.values(I).forEach((e) => e.addEventListener('input', () => { used(e); upd(); })); upd();
    // повзунок інтеграції раз гойдається, коли сцена на третині екрана
    io(host, () => { if (REDUCE) return; const e = I.i, a = +e.value; let t0 = 0; const st = (now) => { if (!t0) t0 = now; const k = Math.min(1, (now - t0) / 1600); e.value = Math.round((a + (100 - a) * Math.sin(k * Math.PI)) / 5) * 5; upd(); if (k < 1 && !e.classList.contains('used')) requestAnimationFrame(st); else { e.value = a; upd(); } }; requestAnimationFrame(st); }); })();

  /* ═════ 05 · завтра: хвилі запусків і згортань 2016–2026 ═════ */
  (function () { const s = $('rr-time'); if (!s) return;
    const E = [
      [2016, 'up', 'LoweBot', L('Lowe’s ставить 22 роботи LoweBot в 11 магазинів біля Сан-Франциско: підказують, де товар, і сканують залишки. Згодом Lowe’s називає його прототипом.', 'Lowe’s puts 22 LoweBots in 11 stores near San Francisco: they show where items are and scan stock. Later Lowe’s calls it a prototype.')],
      [2017, 'up', 'Walmart × Bossa Nova', L('Walmart починає ставити роботів-сканерів Bossa Nova; до 2020 року їх близько 500.', 'Walmart starts deploying Bossa Nova scanning robots; about 500 by 2020.')],
      [2018, 'up', 'Decathlon · RFID', L('Decathlon USA ставить робота Simbe з RFID у магазин у Сан-Франциско: рахує одяг і взуття на ходу.', 'Decathlon USA puts a Simbe robot with RFID in a San Francisco store: it counts apparel and footwear on the move.')],
      [2020.85, 'down', L('Walmart згортає', 'Walmart rolls back'), L('Листопад 2020: Walmart розриває контракт із Bossa Nova. За WSJ, люди простішими засобами давали схожий результат.', 'November 2020: Walmart ends the Bossa Nova contract. Per the WSJ, people with simpler tools got similar results.')],
      [2024.3, 'down', 'Amazon Fresh', L('Квітень 2024: Amazon прибирає Just Walk Out із великих магазинів Fresh у США й ставить розумні візки.', 'April 2024: Amazon removes Just Walk Out from large Fresh stores in the US and switches to smart carts.')],
      [2024.6, 'up', L('Simbe ≈1 000', 'Simbe ≈1,000'), L('Роботи Tally працюють приблизно в 1 000 магазинів (2024).', 'Tally robots work in about 1,000 stores (2024).')],
      [2025.85, 'down', 'Kroger × Ocado', L('Листопад 2025: Kroger закриває три з восьми автоматизованих центрів Ocado й списує 2,6 млрд $.', 'November 2025: Kroger closes three of eight Ocado automated centres and writes off $2.6bn.')],
      [2026.04, 'up', 'Tally 4.0', L('Січень 2026: Simbe показує Tally 4.0 — до 12 годин роботи, обробка на борту.', 'January 2026: Simbe unveils Tally 4.0: up to 12 hours of operation, on-board processing.')],
      [2026.3, 'up', L('Starship 10 млн', 'Starship 10m'), L('Весна 2026: роботи Starship перетинають 10 млн доставок, парк — понад 3 000 машин.', 'Spring 2026: Starship robots pass 10 million deliveries, with a fleet of over 3,000.')]];
    // усі події відкриті списком під лінією; клік по точці чи рядку лише підсвічує пару
    const b = sc(s, `<div class="rr-time" data-svg></div>
      <ol class="rr-log">${E.map((e, i) => `<li data-i="${i}"><div class="rr-log__h"><span class="rr-log__k">${Math.floor(e[0])}</span><b>${e[2]}</b><span class="rr-st ${e[1] === 'up' ? 'go' : 'back'}">${e[1] === 'up' ? L('запуск, ріст', 'launch, growth') : L('згорнули', 'rolled back')}</span></div><p>${e[3]}</p></li>`).join('')}</ol>
      <p class="oc-note">${L('Згортали не технологію, а сценарій: де не було обсягу або дані не доходили до людини.', 'What was rolled back was the use case, not the technology: no volume, or data that never reached a person.')}</p>`);
    const host = b.querySelector('[data-svg]'), VW = 1000, VH = 250, LV = [0, 1, 2, 0, 0, 0, 1, 1, 2], X = (y) => 40 + (y - 2016) / (2026.6 - 2016) * (VW - 80), AX = 118;
    let sel = -1;
    function draw() { const lv = LV;
      host.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${L('Запуски й згортання роботів у рітейлі, 2016–2026', 'Retail robot launches and rollbacks, 2016–2026')}">
        <line x1="30" x2="${VW - 30}" y1="${AX}" y2="${AX}" class="rr-time__ax"/>
        ${Array.from({ length: 11 }, (_, i) => 2016 + i).map((y) => `<text x="${X(y)}" y="${AX + 22}" class="rr-time__y" text-anchor="middle">${y}</text>`).join('')}
        ${E.map((e, i) => { const x = X(e[0]), u = e[1] === 'up', y = u ? AX - 30 - lv[i] * 26 : AX + 52 + lv[i] * 26, an = x > VW - 120 ? 'end' : x < 110 ? 'start' : 'middle';
          return `<g class="rr-time__e ${u ? 'up' : 'dn'}${i === sel ? ' on' : ''}" data-i="${i}" tabindex="0" role="button"><line x1="${x}" x2="${x}" y1="${AX + (u ? -8 : 8)}" y2="${y + (u ? 6 : -6)}"/><circle cx="${x}" cy="${AX}" r="6"/><text x="${x}" y="${y}" text-anchor="${an}">${e[2]}</text></g>`; }).join('')}
        <text x="34" y="18" class="rr-time__k up">▲ ${L('запуск, ріст', 'launch, growth')}</text><text x="34" y="${VH - 6}" class="rr-time__k dn">▼ ${L('згорнули', 'rolled back')}</text></svg>`;
      host.querySelectorAll('[data-i]').forEach((g) => { const go = () => { sel = +g.dataset.i; draw(); SND('tick'); used(host); }; g.addEventListener('click', go); g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } }); });
      b.querySelectorAll('.rr-log [data-i]').forEach((r) => r.classList.toggle('on', +r.dataset.i === sel));
      T.time = { sel, n: E.length }; }
    b.querySelectorAll('.rr-log [data-i]').forEach((r) => r.addEventListener('click', () => { sel = +r.dataset.i; draw(); SND('tick'); }));
    draw(); })();

  /* ═════ 06 · світ і Європа: кожна країна ЄС — точка; поріг окупності береться зі сцени вище ═════ */
  (function () { const s = $('rr-swarm'); if (!s) return;
    // Eurostat lc_lci_lev, 2025, €/год, уся економіка (B–S без O), підприємства від 10 працівників; Бельгії в наборі за 2025 немає
    const V = { AT: 46.3, BG: 12, CY: 21.7, CZ: 19.8, DE: 45, DK: 51.7, EE: 21.1, EL: 18.2, ES: 26.4, FI: 39.4, FR: 44.3, HR: 18.4, HU: 15.2, IE: 44.2, IT: 32, LT: 17.8, LU: 56.8, LV: 16.3, MT: 19, NL: 47.9, PL: 19.1, PT: 19.4, RO: 13.6, SE: 43.1, SI: 29.7, SK: 19.8 };
    const b = sc(s, `<div class="rr-swarm" data-svg></div><div class="oc-card" data-c></div><p class="oc-note">${L('Eurostat, 2025: вартість години, уся економіка, підприємства від 10 працівників. Бельгії в наборі за 2025 рік немає. Поріг рухається разом із повзунками сцени вище.', 'Eurostat 2025: hourly labour cost, whole economy, enterprises with 10+ employees. Belgium is not in the 2025 dataset. The threshold moves with the sliders of the scene above.')}</p>`);
    const host = b.querySelector('[data-svg]'), VW = 1000, VH = 230, X = (v) => 40 + (v - 10) / 50 * (VW - 80);
    const pts = Object.entries(V).sort((a, b2) => a[1] - b2[1]).map(([c, v]) => ({ c, v, x: X(v), y: 0 }));
    pts.forEach((p, i) => { let lvl = 0; const near = pts.slice(0, i).filter((q) => Math.abs(q.x - p.x) < 30); while (near.some((q) => q.y === lvl)) lvl = lvl <= 0 ? -lvl + 1 : -lvl; p.y = lvl; });
    function upd() { const be = (T.eu && T.eu.breakEven) || 25, ok = pts.filter((p) => p.v >= be);
      host.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${L('Країни ЄС за вартістю години праці', 'EU countries by hourly labour cost')}">
        <line x1="40" x2="${VW - 40}" y1="${VH - 30}" y2="${VH - 30}" class="rr-time__ax"/>
        ${[10, 20, 30, 40, 50, 60].map((v) => `<text x="${X(v)}" y="${VH - 10}" text-anchor="middle" class="rr-time__y">${v} €</text>`).join('')}
        <rect x="${X(Math.min(60, be))}" y="10" width="${Math.max(0, VW - 40 - X(Math.min(60, be)))}" height="${VH - 42}" class="rr-swarm__ok"/>
        <line x1="${X(Math.min(60, be))}" x2="${X(Math.min(60, be))}" y1="8" y2="${VH - 30}" class="rr-swarm__be"/>
        <text x="${X(Math.min(60, be)) + 6}" y="22" class="rr-swarm__bt">${L('окупається від', 'pays off from')} ${num(be, 1)} €</text>
        ${pts.map((p) => { const y = 104 - p.y * 23; return `<g class="rr-swarm__p ${p.v >= be ? 'pos' : 'neg'}"><circle cx="${p.x}" cy="${y}" r="11"/><text x="${p.x}" y="${y + 3.5}" text-anchor="middle">${p.c}</text></g>`; }).join('')}</svg>`;
      b.querySelector('[data-c]').innerHTML = `<b>${L(`Окупається в ${ok.length} із ${pts.length} країн`, `Pays off in ${ok.length} of ${pts.length} countries`)}</b>${L('Країни не розтягнуті рівно: велика група зі Східної та Південної Європи скупчилася між 12 і 22 €, а захід — між 39 і 57 €. Тому поріг окупності зазвичай ділить ЄС не навпіл, а на два табори.', 'Countries are not spread evenly: a large Eastern and Southern group bunches between €12 and €22, the West between €39 and €57. So the break-even line usually splits the EU not in half but into two camps.')}`;
      T.swarm = { breakEven: be, ok: ok.length, n: pts.length }; }
    upd(); const eu = $('rr-eu'); if (eu) eu.addEventListener('input', () => setTimeout(upd, 0)); })();
})();
