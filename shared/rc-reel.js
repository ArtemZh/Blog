/* Стаття 35, розділ 07: ролик «Економіка на одній нозі» — пояснення за 48 с, як трейлер у Ганті:
   сцени з таймінгом, титри, шкала з розділами (клік — перейти), пауза, перемотування. Кадр залежить лише від часу t
   (draw(t) нічого не пам'ятає), тож перемотка й пауза працюють точно. Звук — через RC_SND, якщо звук статті увімкнено.
   Числа ті самі, що в тексті й на графіках розділу: ВВП II кв. 2026 +2,2 %; внесок ШІ-інвестицій — 50 % (ING, широко) / 36 % (мінус імпорт);
   рівень ШІ-інвестицій ~0,8 % ВВП (Epoch AI); капекс чотирьох компаній ≈ 150 → 230 → 410 → 690 млрд $ (2026 — середина прогнозу 650–730). */
(function () {
  const slot = document.getElementById('rc-reel'); if (!slot) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.RC_SND) RC_SND.fx(k, a); };
  const MONO = '"Roboto Mono", ui-monospace, monospace', SANS = 'Inter, system-ui, sans-serif';
  const SC = [
    { t: 'Звідки зростання', a: 0, b: 8, cap: ['ВВП США в II кварталі 2026 року виріс на 2,2 % річних.', 'Половину цього зростання дали інвестиції в обладнання, програми й дата-центри — переважно під ШІ.'] },
    { t: 'Скільки витрачають', a: 8, b: 16, cap: ['Чотири найбільші хмарні компанії щороку майже подвоюють капітальні витрати.', '2026 рік — близько $690 млрд: у 4,6 раза більше, ніж у 2023-му.'] },
    { t: 'Куди йдуть гроші', a: 16, b: 25, cap: ['Будівлі, енергетика й монтаж — це внутрішнє виробництво: вони в ВВП.', 'Чипи й сервери здебільшого імпортні: імпорт з ВВП віднімається. Внесок ШІ падає з 50 % до 36 %.'] },
    { t: 'Мала частка — велика вага', a: 25, b: 33, cap: ['Сам рівень ШІ-інвестицій — лише ~0,8 % економіки.', 'Але він дає близько третини її зростання: економіка стоїть на одній нозі.'] },
    { t: 'Якщо віддача розчарує', a: 33, b: 42, cap: ['Скорочення капексу б’є одразу втричі: інвестиції, акції найдорожчих компаній і приватний кредит.', 'Так починалася рецесія 2001 року — інвестиційна, а не споживча.'] },
    { t: 'Що дивитися', a: 42, b: 48, cap: ['Прогнози капексу в квартальних звітах, замовлення техніки, спреди приватного кредиту.', 'Нижче — вежа витрат і діаграма внеску: можна погратися самому.'] }];
  const TOTAL = SC[SC.length - 1].b;

  const box = document.createElement('div'); box.className = 'rc-reel';
  box.innerHTML = `<div class="rc-reel__scr"><canvas aria-label="Ролик: економіка на одній нозі"></canvas><div class="rc-reel__cap" aria-live="polite"></div>
      <button type="button" class="rc-reel__cover" data-play><span class="pl">▶</span><b>Економіка на одній нозі</b><small>ролик · 48 с · пояснення розділу</small></button></div>
    <div class="rc-reel__bar"><button type="button" class="rc-btn" data-pp>▶</button><div class="rc-reel__trk">${SC.map((s) => `<i style="left:${s.a / TOTAL * 100}%;width:${(s.b - s.a) / TOTAL * 100}%" title="${s.t}"><u>${s.t}</u></i>`).join('')}<em></em></div><span class="rc-reel__tm">0:00</span></div>`;
  slot.appendChild(box);
  const cv = box.querySelector('canvas'), cap = box.querySelector('.rc-reel__cap'), cover = box.querySelector('.rc-reel__cover'), pp = box.querySelector('[data-pp]'),
    trk = box.querySelector('.rc-reel__trk'), head = trk.querySelector('em'), tm = box.querySelector('.rc-reel__tm'), segs = [...trk.querySelectorAll('i')];

  const cl = (x) => Math.max(0, Math.min(1, x)), ez = (x) => { x = cl(x); return x * x * (3 - 2 * x); }, eo = (x) => 1 - Math.pow(1 - cl(x), 3);
  const fmt = (v, d = 1) => v.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
  let W = 1, H = 1, x = cv.getContext('2d');
  function size() { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = Math.round(W * d); cv.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0); }
  const txt = (s, X, Y, sz, col, al = 'left', w = 600, f = SANS) => { x.font = `${w} ${sz}px ${f}`; x.fillStyle = col; x.textAlign = al; x.fillText(s, X, Y); };
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); };

  // ── сцени: кожна — функція від локального часу u (с від початку сцени) і прозорості входу/виходу ──
  function s1(u, k) {   // стовпець ВВП 2,2 % розщеплюється: ШІ-інвестиції (половина) і все інше
    const s = Math.min(W, H * 1.8) / 900, cx = W * .5, base = H * .78, hMax = H * .42, g = eo(u / 1.6), sp = ez((u - 2.4) / 1.6);
    txt('ЗРОСТАННЯ ВВП · II КВ. 2026', cx, H * .11, 13 * s + 4, `rgba(233,237,245,${.6 * k})`, 'center', 600, MONO);
    const bw = 120 * s + 40, h = hMax * g, gap = 26 * sp;
    // нижня половина — ШІ (помаранчева), верхня — решта економіки (сіра); при розщепленні розходяться
    const hA = h * .5, hB = h * .5;
    x.globalAlpha = k; x.fillStyle = '#E0532A'; rr(cx - bw / 2 - gap * 3, base - hA, bw, hA, 6); x.fill();
    x.fillStyle = '#5b6578'; rr(cx - bw / 2 + gap * 3, base - hA - hB - gap, bw, hB, 6); x.fill(); x.globalAlpha = 1;
    txt('+' + fmt(2.2 * g) + ' %', cx, base - h - 20 - gap, 34 * s + 10, `rgba(255,255,255,${k})`, 'center', 700, MONO);
    if (sp > .05) { txt('ШІ-інвестиції', cx - bw / 2 - gap * 3 - 14, base - hA / 2, 15 * s + 4, `rgba(255,178,122,${k * sp})`, 'right');
      txt('≈ половина', cx - bw / 2 - gap * 3 - 14, base - hA / 2 + 22 * s + 4, 14 * s + 3, `rgba(255,178,122,${.75 * k * sp})`, 'right', 500, MONO);
      txt('уся решта економіки', cx + bw / 2 + gap * 3 + 14, base - hA - hB / 2 - gap, 15 * s + 4, `rgba(200,210,228,${k * sp})`, 'left'); }
    x.strokeStyle = `rgba(255,255,255,${.25 * k})`; x.beginPath(); x.moveTo(cx - 260 * s - 60, base); x.lineTo(cx + 260 * s + 60, base); x.stroke();
  }
  function s2(u, k) {   // стовпці капексу 2023→2026 виростають по черзі, лічильник
    const s = Math.min(W, H * 1.8) / 900, Y = [[2023, 150], [2024, 230], [2025, 410], [2026, 690]], base = H * .8, hMax = H * .56, n = Y.length, span = Math.min(W * .7, 640 * s + 160), x0 = W / 2 - span / 2, bw = span / n * .58;
    txt('КАПЕКС 4 НАЙБІЛЬШИХ ХМАРНИХ КОМПАНІЙ, $ МЛРД', W / 2, H * .14, 13 * s + 4, `rgba(233,237,245,${.6 * k})`, 'center', 600, MONO);
    let cur = 0;
    Y.forEach(([y, v], i) => { const g = eo((u - .4 - i * 1.4) / 1.2), h = hMax * v / 690 * g, X = x0 + span / n * (i + .5) - bw / 2;
      if (g > 0) cur = v * g;
      x.globalAlpha = k; const gr = x.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, i === 3 ? '#ffb27a' : '#9fb3d6'); gr.addColorStop(1, i === 3 ? '#E0532A' : '#4a5a78');
      x.fillStyle = gr; rr(X, base - h, bw, h, 5); x.fill(); x.globalAlpha = 1;
      txt(String(y), X + bw / 2, base + 22 * s + 6, 13 * s + 4, `rgba(233,237,245,${.7 * k})`, 'center', 600, MONO);
      if (g > .3) txt('$' + Math.round(v * g), X + bw / 2, base - h - 10, 15 * s + 5, `rgba(255,255,255,${k * cl((g - .3) * 2)})`, 'center', 700, MONO); });
    if (u > 6) txt(i18x2(u), W / 2, H * .24, 14 * s + 4, `rgba(255,178,122,${k * ez((u - 6) / .8)})`, 'center', 600);
  }
  const i18x2 = () => '×4,6 за три роки';
  function s3(u, k) {   // гроші: ліва колона «будівлі й енергетика» лишається в ВВП, права «чипи» тече за кордон; кільце 50 % → 36 %
    const s = Math.min(W, H * 1.8) / 900, cx = W * .3, cy = H * .52, R = Math.min(W * .14, H * .26), f = ez((u - 3.2) / 2.4), v = 50 - 14 * f;
    txt('ВНЕСОК ШІ У ЗРОСТАННЯ ВВП', cx, H * .14, 13 * s + 4, `rgba(233,237,245,${.6 * k})`, 'center', 600, MONO);
    x.lineWidth = R * .22; x.strokeStyle = `rgba(255,255,255,${.12 * k})`; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    x.strokeStyle = f > .5 ? `rgba(70,120,220,${k})` : `rgba(224,83,42,${k})`; x.beginPath(); x.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + v / 100 * 6.283 * eo(u / 1.2)); x.stroke();
    txt(Math.round(v) + ' %', cx, cy + 12 * s + 4, 36 * s + 10, `rgba(255,255,255,${k})`, 'center', 700, MONO);
    txt(f > .5 ? 'мінус імпорт чипів' : 'усі інвестиції', cx, cy + R + 34 * s + 8, 13 * s + 4, `rgba(233,237,245,${.7 * k})`, 'center', 500);
    // потік «монет»: з джерела праворуч частина йде вниз (в економіку США), частина — вправо за край (імпорт)
    const sx = W * .58, sy = H * .3, N = 26;
    txt('$ капекс', sx, sy - 18, 14 * s + 4, `rgba(255,255,255,${.85 * k})`, 'center', 700, MONO);
    txt('будівлі, енергетика, монтаж → ВВП', W * .62, H * .86, 13 * s + 3, `rgba(159,227,184,${k})`, 'center', 600);
    txt('чипи й сервери → імпорт', W * .9, H * .44, 13 * s + 3, `rgba(255,140,120,${k * cl(u - 1)})`, 'right', 600);
    for (let i = 0; i < N; i++) { const ph = ((u * .45 + i / N) % 1), imp = i % 7 < 2 || (f > .3 && i % 7 < 3);
      const px = imp ? sx + (W * .95 - sx) * ph : sx + Math.sin(i * 1.7) * 30 * s * ph, py = imp ? sy + (H * .4 - sy) * ph * 1.2 : sy + (H * .8 - sy) * ph;
      x.globalAlpha = k * Math.sin(ph * Math.PI); x.fillStyle = imp ? '#ff8c78' : '#9fe3b8'; x.beginPath(); x.arc(px, py, 4 * s + 2, 0, 7); x.fill(); }
    x.globalAlpha = 1;
  }
  function s4(u, k) {   // пиріг економіки: крихітний сектор 0,8 %; поруч стовпчик зростання, де той самий колір — третина
    const s = Math.min(W, H * 1.8) / 900, cx = W * .32, cy = H * .53, R = Math.min(W * .17, H * .3), g = eo(u / 1.4), z = ez((u - 1.6) / 1.4);
    txt('РІВЕНЬ: ЧАСТКА ЕКОНОМІКИ', cx, H * .14, 13 * s + 4, `rgba(233,237,245,${.6 * k})`, 'center', 600, MONO);
    x.globalAlpha = k; x.fillStyle = '#3a4458'; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R * g, 0, 6.283); x.fill();
    const a0 = -Math.PI / 2, a1 = a0 + .008 * 6.283, pop = 18 * z * s;
    x.fillStyle = '#E0532A'; x.beginPath(); x.moveTo(cx + Math.cos(a0 + .025) * pop, cy + Math.sin(a0 + .025) * pop); x.arc(cx + Math.cos(a0 + .025) * pop, cy + Math.sin(a0 + .025) * pop, R * g * (1 + .05 * z), a0, a1); x.fill(); x.globalAlpha = 1;
    if (z > .1) txt('ШІ-інвестиції ≈ 0,8 %', cx + 14 * s, cy - R - 16, 15 * s + 4, `rgba(255,178,122,${k * z})`, 'left', 700);
    const bx = W * .7, base = H * .82, hMax = H * .56, bw = 110 * s + 30, q = ez((u - 3) / 1.6);
    txt('ЗРОСТАННЯ', bx, H * .14, 13 * s + 4, `rgba(233,237,245,${.6 * k * q})`, 'center', 600, MONO);
    x.globalAlpha = k * q; x.fillStyle = '#5b6578'; rr(bx - bw / 2, base - hMax, bw, hMax, 6); x.fill(); x.fillStyle = '#E0532A'; rr(bx - bw / 2, base - hMax * .36 * eo((u - 3.5) / 1.2), bw, hMax * .36 * eo((u - 3.5) / 1.2), 6); x.fill(); x.globalAlpha = 1;
    if (u > 4.5) txt('≈ ⅓', bx + bw / 2 + 14, base - hMax * .18, 30 * s + 8, `rgba(255,178,122,${k * ez(u - 4.5)})`, 'left', 700, MONO);
  }
  function s5(u, k) {   // доміно: капекс ↓ → три удари; позначка 2001
    const s = Math.min(W, H * 1.8) / 900, src = [W * .18, H * .5], T = [['інвестиції ↓', H * .26], ['акції техгігантів ↓ → витрати заможних ↓', H * .5], ['приватний кредит: збитки', H * .74]];
    txt('ЯКЩО ВІДДАЧА РОЗЧАРУЄ', W / 2, H * .12, 13 * s + 4, `rgba(233,237,245,${.6 * k})`, 'center', 600, MONO);
    const fall = ez(u / 1.2); x.save(); x.translate(src[0], src[1] + 40 * s); x.rotate(-.5 * fall * Math.PI / 2 * .6);
    x.globalAlpha = k; x.fillStyle = '#E0532A'; rr(-28 * s - 8, -110 * s - 30, 56 * s + 16, 110 * s + 30, 6); x.fill(); x.restore(); x.globalAlpha = 1;
    txt('капекс ШІ ↓', src[0], src[1] + 74 * s + 16, 15 * s + 4, `rgba(255,178,122,${k})`, 'center', 700);
    T.forEach(([t, y], i) => { const g = ez((u - 1.4 - i * 1) / .9); if (g <= 0) return;
      x.strokeStyle = `rgba(255,140,120,${.6 * k * g})`; x.lineWidth = 2; x.beginPath(); x.moveTo(src[0] + 50 * s, src[1]); x.bezierCurveTo(W * .36, src[1], W * .36, y, W * .44 * g + W * .3 * (1 - g), y); x.stroke();
      x.globalAlpha = k * g; x.fillStyle = 'rgba(255,255,255,.06)'; rr(W * .45, y - 22 * s - 6, W * .48, 44 * s + 12, 8); x.fill(); x.globalAlpha = 1;
      txt(t, W * .47, y + 6 * s, 16 * s + 4, `rgba(255,255,255,${k * g})`, 'left', 600); });
    if (u > 5.4) { const g = ez((u - 5.4) / 1); x.globalAlpha = k * g; x.strokeStyle = '#ffb27a'; x.setLineDash([5, 6]); rr(W * .05, H * .86 - 22 * s, W * .9, 44 * s + 6, 8); x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
      txt('2001: інвестиційна рецесія — бізнес урізав витрати після буму доткомів', W / 2, H * .86 + 8 * s, 14 * s + 3, `rgba(255,214,170,${k * g})`, 'center', 600); }
  }
  function s6(u, k) {   // три «прилади», за якими стежити
    const s = Math.min(W, H * 1.8) / 900, L = [['прогнози капексу', 'квартальні звіти компаній'], ['замовлення техніки', 'ISM, дані про виробництво'], ['спреди приватного кредиту', 'обмеження викупу у фондах']];
    txt('ЩО ДИВИТИСЯ', W / 2, H * .14, 13 * s + 4, `rgba(233,237,245,${.6 * k})`, 'center', 600, MONO);
    L.forEach(([a, b], i) => { const g = eo((u - .3 - i * .5) / .8), X = W * (.18 + i * .32), Y = H * .5 + (1 - g) * 30;
      x.globalAlpha = k * g; x.fillStyle = 'rgba(255,255,255,.06)'; rr(X - W * .15, Y - 60 * s - 10, W * .3, 120 * s + 20, 12); x.fill();
      x.strokeStyle = '#D9A21B'; x.lineWidth = 3; x.beginPath(); x.arc(X, Y - 18 * s, 20 * s + 6, Math.PI, Math.PI * (1 + .3 + .5 * Math.sin(u * 2 + i))); x.stroke(); x.globalAlpha = 1;
      txt(a, X, Y + 26 * s + 6, 14 * s + 4, `rgba(255,255,255,${k * g})`, 'center', 700); txt(b, X, Y + 48 * s + 8, 12 * s + 3, `rgba(233,237,245,${.6 * k * g})`, 'center', 500); });
  }
  const DRAW = [s1, s2, s3, s4, s5, s6];

  function draw(t) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1020'); g.addColorStop(1, '#070a12'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // тонка сітка-фон, повільно пливе
    x.strokeStyle = 'rgba(255,255,255,.035)'; x.lineWidth = 1; const o = (t * 6) % 40; for (let X = -o; X < W; X += 40) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, H); x.stroke(); }
    const i = Math.max(0, SC.findIndex((s) => t < s.b)), sc = SC[i < 0 ? SC.length - 1 : i], u = t - sc.a, len = sc.b - sc.a;
    const k = Math.min(ez(u / .5), ez((len - u) / .5) + (i === SC.length - 1 ? 1 : 0));
    DRAW[SC.indexOf(sc)](u, Math.min(1, k));
    // номер розділу
    x.font = `600 11px ${MONO}`; x.fillStyle = 'rgba(233,237,245,.45)'; x.textAlign = 'left'; x.fillText(`${SC.indexOf(sc) + 1}/${SC.length} · ${sc.t}`, 14, 22);
    const c = sc.cap[u < len / 2 ? 0 : 1]; if (cap.textContent !== c) cap.textContent = c;
    head.style.left = (t / TOTAL * 100) + '%'; tm.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} / 0:${TOTAL}`;
    segs.forEach((e, j) => e.classList.toggle('on', j === SC.indexOf(sc)));
  }
  let t = 0, playing = false, raf = 0, last = 0, lastSc = -1, lastSec = -1;
  function loop(now) { const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; t += dt;
    if (t >= TOTAL) { t = TOTAL; pause(); draw(t - .001); return; }
    const si = SC.findIndex((s) => t < s.b); if (si !== lastSc) { lastSc = si; SND('event', si); }
    draw(t); raf = playing ? requestAnimationFrame(loop) : 0; }
  function play() { if (t >= TOTAL - .01) t = 0; playing = true; cover.hidden = true; pp.textContent = '❚❚'; pp.classList.add('on'); last = 0; lastSc = -1; if (!raf) raf = requestAnimationFrame(loop); }
  function pause() { playing = false; cancelAnimationFrame(raf); raf = 0; pp.textContent = '▶'; pp.classList.remove('on'); }
  cover.addEventListener('click', () => { SND('whoosh'); play(); });
  pp.addEventListener('click', () => { playing ? pause() : play(); });
  trk.addEventListener('click', (e) => { const r = trk.getBoundingClientRect(); t = Math.max(0, Math.min(TOTAL - .01, (e.clientX - r.left) / r.width * TOTAL)); cover.hidden = true; SND('click'); draw(t); });
  box.querySelector('.rc-reel__scr canvas').addEventListener('click', () => { if (!cover.hidden) return; playing ? pause() : play(); });
  // ролик зупиняється, коли зникає з екрана
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && playing) pause(); }, { threshold: .2 }).observe(box);
  new ResizeObserver(() => { size(); draw(t); }).observe(cv);
  size(); draw(REDUCE ? 2 : 6.5);
  // постер: перший кадр зі сцени 1 після розщеплення
  t = 0;
})();
