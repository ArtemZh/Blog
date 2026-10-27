/* Стаття 38: ролик «Від гена до чашки» — уся стаття за 60 с, перед тим як гратися зі сценами (як ролик 35 і трейлер Ганта).
   v2: 18 планів по ~3,3 с у шести розділах — нова композиція що три секунди; камера постійно рухається (наїзд, панорама, тряска на тріску),
   фон живий: летять зерна з паралаксом, пара; між планами — швидкі склейки зі спалахом. Кадр залежить лише від часу t (draw(t) нічого не пам'ятає).
   Звук: власний трек ролика через CF_SND.reel(on, t) (Suno, assets/coffee/audio/reel.m4a), якщо звук статті ввімкнено.
   Числа ті самі, що в тексті й сценах (shared/cf-data.js). */
(function () {
  const slot = document.getElementById('cf-reel'), D = window.CF; if (!slot || !D) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.CF_SND) CF_SND.fx(k, a); }, TRK = (on, t) => { if (window.CF_SND) CF_SND.reel(on, t); };
  const MONO = '"Roboto Mono", ui-monospace, monospace', SANS = 'Inter, system-ui, sans-serif';
  const lb = 0.45359237, ROB = D.price.canUsdT / 1000 * lb, ARA = D.price.araCentsLb / 100, GES = D.price.gesha * lb;
  const SC = [
    { t: 'Рід кави', a: 0, b: 10, cap: ['Науці відомо 130 видів кави.', 'Половина — на Мадагаскарі, 48 — в Африці.', 'А в чашку потрапляють два: арабіка й робуста.'] },
    { t: 'Арабіка — гібрид', a: 10, b: 20, cap: ['Арабіка — дитина двох видів, по 22 хромосоми.', 'Схрестилися один раз — і отримали 44.', 'Одна подія — тому генів у арабіки мало.'] },
    { t: 'Що всередині', a: 20, b: 30, cap: ['У робусті кофеїну вдвічі більше: 2,54 % проти 1,22 %.', 'Зате в арабіці більше цукру: 7,3 % проти 4,5 %.', 'Хлорогенові кислоти — гіркота й терпкість — теж у робусти.'] },
    { t: 'Клімат', a: 30, b: 40, cap: ['Кава росте в тропічному поясі.', 'Арабіка — у горах, за 18–21 °C. Робуста — до 20,5 °C, а не до 30.', 'Стенофіла живе за 24,9 °C — кава на теплий світ.'] },
    { t: 'Від ягоди до зерна', a: 40, b: 50, cap: ['Зерно — кісточка червоної ягоди.', 'Шкірку, м’якоть і слиз знімають по-різному — це обробка.', 'Смак народжується в ростері: Маяр від ~140 °C, тріск — близько 200 °C.'] },
    { t: 'Ціна', a: 50, b: 60, cap: ['Біржа: робуста 1,46 $, арабіка 3,07 $ за фунт.', 'Рекордна гейша — понад 13 тисяч доларів за фунт.', 'Від гена до чашки — ось звідки різниця.'] }];
  const TOTAL = SC[SC.length - 1].b, SH = 10 / 3;   // три плани на розділ
  const box = document.createElement('div'); box.className = 'rc-reel cf-reel';
  box.innerHTML = `<div class="rc-reel__scr"><canvas aria-label="Ролик: від гена до чашки"></canvas><div class="rc-reel__cap" aria-live="polite"></div>
      <button type="button" class="rc-reel__cover" data-play><span class="pl">▶</span><b>Від гена до чашки</b><small>ролик · 1 хв · уся стаття коротко</small></button></div>
    <div class="rc-reel__bar"><button type="button" class="rc-btn" data-pp>▶</button><div class="rc-reel__trk">${SC.map((s) => `<i style="left:${s.a / TOTAL * 100}%;width:${(s.b - s.a) / TOTAL * 100}%" title="${s.t}"><u>${s.t}</u></i>`).join('')}<em></em></div><span class="rc-reel__tm"></span></div>`;
  slot.appendChild(box);
  const cv = box.querySelector('canvas'), cap = box.querySelector('.rc-reel__cap'), cover = box.querySelector('.rc-reel__cover'), pp = box.querySelector('[data-pp]'),
    trk = box.querySelector('.rc-reel__trk'), head = trk.querySelector('em'), tm = box.querySelector('.rc-reel__tm'), segs = [...trk.querySelectorAll('i')];
  const cl = (v) => Math.max(0, Math.min(1, v)), ez = (v) => { v = cl(v); return v * v * (3 - 2 * v); }, eo = (v) => 1 - Math.pow(1 - cl(v), 3), eb = (v) => { v = cl(v); const c = 1.7; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };
  const f = (v, d = 1) => v.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
  const hh = (n) => { const v = Math.sin(n * 91.7 + 17.3) * 43758.5453; return v - Math.floor(v); };
  let W = 1, H = 1; const x = cv.getContext('2d');
  function size() { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = Math.round(W * d); cv.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0); }
  const txt = (s, X, Y, sz, col, al = 'left', w = 600, fo = SANS) => { x.font = `${w} ${sz}px ${fo}`; x.fillStyle = col; x.textAlign = al; x.fillText(s, X, Y); };
  const S = () => Math.min(W, H * 1.8) / 900;
  const A = (a) => `rgba(255,236,214,${a})`, CR = '#e0532a', AR = '#c98b5a', RB = '#6e4428';
  // зерно 2D: овал із борозною
  function bean(cx, cy, r, col, ang = 0, sC = .5, a = 1) { if (a <= 0) return; x.save(); x.globalAlpha *= a; x.translate(cx, cy); x.rotate(ang);
    const g = x.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r * 1.1); g.addColorStop(0, '#fff3'); g.addColorStop(.25, col); g.addColorStop(1, '#0008');
    x.fillStyle = col; x.beginPath(); x.ellipse(0, 0, r, r * .72, 0, 0, 7); x.fill(); x.fillStyle = g; x.fill();
    x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = Math.max(1, r * .1); x.beginPath(); x.moveTo(-r * .8, 0); x.bezierCurveTo(-r * .3, -r * .3 * sC, r * .3, r * .3 * sC, r * .8, 0); x.stroke(); x.restore(); }
  const big = (s, X, Y, sz, col, al = 'center') => txt(s, X, Y, sz, col, al, 800, SANS);
  const label = (s, X, Y, k) => { x.font = `600 ${12 * S() + 5}px ${MONO}`; const w = x.measureText(s).width + 18; x.globalAlpha = k; x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(X - w / 2, Y - 16, w, 24); x.globalAlpha = 1; txt(s, X, Y, 12 * S() + 5, A(k * .95), 'center', 600, MONO); };
  const counter = (v0, v1, p, d = 0) => f(v0 + (v1 - v0) * eo(p), d);

  /* ── розділ 1: рід кави ── */
  function p1a(u, k) {   // вибух зерен із центру + лічильник 0→130
    const s = S(), g = eo(u / 2.2);
    for (let i = 0; i < 130; i++) { const an = hh(i) * 6.283, d = (60 + hh(i + 7) * Math.max(W, H) * .55) * g, px = W / 2 + Math.cos(an) * d, py = H / 2 + Math.sin(an) * d * .7;
      bean(px, py, (5 + hh(i + 3) * 9) * s + 2, ['#9b1c1c', CR, '#d9a21b', '#3f8f5a', '#9aa3b2'][i % 5], an + u * (hh(i) - .5) * 3, .5, k * (.5 + .5 * hh(i + 9))); }
    big(counter(0, 130, u / 2.2), W / 2, H * .55, 120 * s + 30, A(k));
    txt('ВИДІВ КАВИ', W / 2, H * .55 + 44 * s + 14, 16 * s + 6, A(.7 * k), 'center', 600, MONO);
  }
  function p1b(u, k) {   // три острови: Мадагаскар 65 · Африка 48 · інші 17 — стовпці-колони із зерен
    const s = S(), G = [['Мадагаскар', 65, W * .25], ['Африка', 48, W * .5], ['Азія й Австралія', 17, W * .75]];
    G.forEach(([n, v, X], j) => { const p = eo((u - j * .35) / 1.6), cols = 5;
      for (let i = 0; i < Math.round(v * p); i++) bean(X + ((i % cols) - 2) * 15 * s - 2, H * .78 - Math.floor(i / cols) * 13 * s, 6 * s + 2, j === 0 ? '#3f8f5a' : j === 1 ? '#d9a21b' : '#9aa3b2', .2, .4, k);
      big(String(Math.round(v * p)), X, H * .78 - Math.ceil(v / cols) * 13 * s - 26, 40 * s + 12, A(k)); label(n, X, H * .9, k); });
  }
  function p1c(u, k) {   // світло-стрічка і два великі зерна
    const s = S(), z = eb(u / 1.2), sw = (u * .5) % 1;
    const g = x.createLinearGradient(W * (sw - .3), 0, W * (sw + .3), H); g.addColorStop(0, 'rgba(255,200,140,0)'); g.addColorStop(.5, `rgba(255,200,140,${.12 * k})`); g.addColorStop(1, 'rgba(255,200,140,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    bean(W * .34, H * .48, 80 * s * z + 4, '#7a4423', -.35 + Math.sin(u) * .08, .9, k); bean(W * .66, H * .5, 70 * s * z + 4, '#4e2b17', .45 - Math.sin(u) * .06, .1, k);
    label('арабіка · S-борозна', W * .34, H * .8, k * ez(u - .6)); label('робуста · пряма борозна', W * .66, H * .8, k * ez(u - .9));
  }
  /* ── розділ 2: гібрид ── */
  const chromo = (cx, cy, r, n, col, rot, a) => { for (let i = 0; i < n; i++) { const an = hh(i + n) * 6.283 + rot * (hh(i) - .5), q = r * .8 * Math.sqrt(hh(i * 3 + 1)); x.save(); x.globalAlpha = a; x.translate(cx + Math.cos(an) * q, cy + Math.sin(an) * q); x.rotate(hh(i * 7) * 3 + rot); x.fillStyle = col; x.fillRect(-2.2, -8, 4.4, 16); x.restore(); } x.globalAlpha = 1; };
  const cellC = (cx, cy, r, col, a) => { x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); x.fillStyle = 'rgba(255,255,255,.03)'; x.fill(); x.globalAlpha = 1; };
  function p2a(u, k) {   // дві клітини влітають з боків, хромосоми крутяться
    const s = S(), r = Math.min(W * .14, H * .27), L = W * (-.1 + .35 * eo(u / 1.4)), R = W * (1.1 - .35 * eo(u / 1.4)), y = H * .48;
    cellC(L, y, r, AR, k); chromo(L, y, r, 22, AR, u * .8, k); cellC(R, y, r, '#8fb2d9', k); chromo(R, y, r, 22, '#8fb2d9', -u * .8, k);
    big('22', L, y - r - 22, 40 * s + 12, A(k)); big('22', R, y - r - 22, 40 * s + 12, A(k)); label('робуста', L, y + r + 34, k); label('еугеніоїдес', R, y + r + 34, k);
  }
  function p2b(u, k) {   // зіткнення: спалах, одна клітина, 22+22=44
    const s = S(), m = eo(u / .9), r = Math.min(W * .14, H * .27), y = H * .48, fl = Math.max(0, 1 - Math.abs(u - .9) * 3);
    if (m < 1) { cellC(W * (.25 + .25 * m), y, r, AR, k * (1 - m)); cellC(W * (.75 - .25 * m), y, r, '#8fb2d9', k * (1 - m)); }
    const R2 = r * 1.3 * eb((u - .7) / .8); if (R2 > 0) { cellC(W / 2, y, R2, '#e8b27a', k); chromo(W / 2, y, R2, 22, AR, u * .4, k); chromo(W / 2, y, R2 * .95, 22, '#8fb2d9', -u * .4, k); }
    x.fillStyle = `rgba(255,240,220,${fl * .8 * k})`; x.fillRect(0, 0, W, H);
    if (u > 1.2) big('44', W / 2, y + 22 * s, 110 * s + 30, A(k * ez((u - 1.2) / .5)));
  }
  function p2c(u, k) {   // ДНК-спіраль + «вузьке горло»
    const s = S(), n = 34, y0 = H * .32;
    for (let i = 0; i < 60; i++) { const X = W * .08 + W * .84 * i / 59, ph = i * .35 + u * 2.4, a1 = Math.sin(ph), a2 = Math.sin(ph + Math.PI);
      x.strokeStyle = `rgba(255,255,255,${.12 * k})`; x.beginPath(); x.moveTo(X, y0 + a1 * 34 * s); x.lineTo(X, y0 + a2 * 34 * s); x.stroke();
      x.fillStyle = i % 2 ? AR : '#8fb2d9'; x.globalAlpha = k * (.6 + .4 * a1); x.beginPath(); x.arc(X, y0 + a1 * 34 * s, 4 * s + 1, 0, 7); x.fill(); x.globalAlpha = 1; }
    const p = ez((u - .6) / 1.8), fy = H * .72;
    for (let i = 0; i < n; i++) { const keep = i % 9 === 0, X0 = W * .08 + i * (W * .4 / n), X1 = W * .62 + (i / 9) * 30 * s, px = keep ? X0 + (X1 - X0) * p : X0 + (W * .5 - X0) * p * .9, a = keep ? 1 : 1 - p;
      x.globalAlpha = k * a; x.fillStyle = `hsl(${hh(i) * 360},60%,62%)`; x.fillRect(px, fy, 9 * s + 3, 22 * s + 6); x.globalAlpha = 1; }
    x.strokeStyle = A(.4 * k); x.beginPath(); x.moveTo(W * .5, fy - 30 * s); x.lineTo(W * .55, fy + 10 * s); x.lineTo(W * .5, fy + 50 * s); x.stroke();
    label('різноманіття генів: 34 → 4', W / 2, H * .92, k * ez(u - .5));
  }
  /* ── розділ 3: хімія ── */
  function hexRing(cx, cy, r, rot, col, a) { x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 6; i++) { const an = rot + i * Math.PI / 3; i ? x.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r) : x.moveTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); } x.stroke(); x.globalAlpha = 1; }
  function p3a(u, k) {   // молекула кофеїну (два кільця) + два лічильники
    const s = S(), r = 46 * s + 14, cx = W * .5, cy = H * .38, d = eo(u / 1);
    hexRing(cx - r * .9, cy, r * d, u * .3, '#e8b27a', k); hexRing(cx + r * .8, cy, r * .82 * d, -u * .3 + .5, '#e8b27a', k);
    [[-r * .9, -r], [r * 1.6, 0], [-r * 2, r * .5]].forEach(([dx, dy], i) => { x.fillStyle = i ? '#8fb2d9' : CR; x.globalAlpha = k * d; x.beginPath(); x.arc(cx + dx, cy + dy, 7 * s + 3, 0, 7); x.fill(); x.globalAlpha = 1; });
    big(counter(0, D.chem.caf.ara, (u - .6) / 1.4, 2) + ' %', W * .3, H * .8, 50 * s + 14, A(k)); big(counter(0, D.chem.caf.can, (u - .6) / 1.4, 2) + ' %', W * .7, H * .8, 50 * s + 14, `rgba(255,170,120,${k})`);
    label('кофеїн · арабіка', W * .3, H * .9, k); label('кофеїн · робуста', W * .7, H * .9, k);
  }
  function p3b(u, k) {   // кубики цукру падають у дві чашки (73 і 45 мг/г)
    const s = S(), cups = [[W * .32, D.chem.suc.ara, 'арабіка'], [W * .68, D.chem.suc.can, 'робуста']], cw = 120 * s + 30, top = H * .52, bot = H * .84;
    cups.forEach(([X, v, n], j) => { x.globalAlpha = k; x.strokeStyle = A(.7); x.lineWidth = 3; x.beginPath(); x.moveTo(X - cw / 2, top); x.lineTo(X - cw * .4, bot); x.lineTo(X + cw * .4, bot); x.lineTo(X + cw / 2, top); x.stroke();
      const N = Math.round(v * 2); for (let i = 0; i < N; i++) { const t0 = i * .08 + j * .05, fy = Math.min(1, eo((u - t0) / .5)), col = i % 5, row = Math.floor(i / 5);
        const ty = bot - 14 * s - row * 13 * s, sy = -20, py = sy + (ty - sy) * fy; if (u < t0) continue; x.fillStyle = '#fff6e8'; x.fillRect(X - 2.5 * 13 * s + col * 13 * s, py, 11 * s + 1, 11 * s + 1); }
      x.globalAlpha = 1; big(f(v) + ' %', X, top - 18, 40 * s + 12, A(k)); label('сахароза · ' + n, X, top - 70 * s - 20, k); });
  }
  function p3c(u, k) {   // розділений екран: гіркота ліворуч, солодкість праворуч, хвилі
    const s = S(), sp = W * (.5 + .04 * Math.sin(u * 2));
    x.fillStyle = `rgba(110,68,40,${.35 * k})`; x.fillRect(0, 0, sp, H); x.fillStyle = `rgba(232,178,122,${.18 * k})`; x.fillRect(sp, 0, W - sp, H);
    for (let j = 0; j < 6; j++) { x.strokeStyle = j % 2 ? A(.15 * k) : `rgba(255,160,110,${.25 * k})`; x.beginPath(); for (let X = 0; X <= W; X += 10) { const Y = H * (.2 + j * .12) + Math.sin(X * .02 + u * 3 + j) * 12 * (X < sp ? 1.8 : .6); X ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }
    big('гірко · терпко', sp / 2, H * .45, 34 * s + 10, A(k * ez(u / .5))); big('солодко · кисло', sp + (W - sp) / 2, H * .45, 34 * s + 10, A(k * ez((u - .4) / .5)));
    label('ХГК 7–9 г/100 г · робуста', sp / 2, H * .62, k); label('ХГК 5–6 г/100 г · арабіка', sp + (W - sp) / 2, H * .62, k);
  }
  /* ── розділ 4: клімат ── */
  function p4a(u, k) {   // тропічний пояс на «глобусі», що крутиться
    const s = S(), R = Math.min(W, H) * .36, cx = W * .5, cy = H * .55, rot = u * .6;
    x.globalAlpha = k; x.fillStyle = '#16241c'; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill(); x.save(); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.clip();
    for (let i = -6; i <= 6; i++) { x.strokeStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.ellipse(cx + ((i * .3 + rot) % 2 - 1) * R, cy, Math.abs(R * Math.cos((i * .3 + rot) % 2 - 1)), R, 0, 0, 7); x.stroke(); }
    x.fillStyle = 'rgba(224,83,42,.35)'; x.fillRect(cx - R, cy - R * .4, R * 2, R * .8);
    for (let i = 0; i < 40; i++) { const px = cx - R + ((hh(i) * 2 * R + u * 60 * s) % (2 * R)), py = cy - R * .35 + hh(i + 4) * R * .7; bean(px, py, 4 * s + 2, '#7a4423', hh(i) * 3, .5, .9); }
    x.restore(); x.globalAlpha = 1; label('кавовий пояс · тропіки', cx, H * .1, k);
  }
  function p4b(u, k) {   // гори й низини, термометр
    const s = S(), base = H * .86;
    x.fillStyle = `rgba(60,80,70,${k})`; x.beginPath(); x.moveTo(0, base); for (let X = 0; X <= W; X += 8) x.lineTo(X, base - (Math.sin(X * .008 + 1) * .5 + .5) * H * .5 * Math.exp(-Math.pow((X - W * .3) / (W * .25), 2)) - 20); x.lineTo(W, base); x.fill();
    x.fillStyle = `rgba(255,255,255,${.85 * k})`; x.beginPath(); x.moveTo(W * .3 - 30 * s, H * .36 + 20 * s); x.lineTo(W * .3, H * .33); x.lineTo(W * .3 + 30 * s, H * .36 + 20 * s); x.fill();
    bean(W * .3, H * .44, 22 * s + 6, '#7a4423', -.3, .9, k * eb(u / .8)); label('арабіка · гори · 18–21 °C', W * .3, H * .26, k * ez(u - .3));
    bean(W * .75, base - 40 * s, 22 * s + 6, '#4e2b17', .3, .1, k * eb((u - .5) / .8)); label('робуста · низини · до 20,5 °C', W * .75, base - 80 * s, k * ez(u - .8));
    for (let i = 0; i < 4; i++) { x.strokeStyle = `rgba(255,140,90,${.3 * k})`; x.beginPath(); for (let X = W * .6; X < W * .95; X += 6) { const Y = base - 120 * s - i * 14 + Math.sin(X * .05 + u * 5 + i) * 4; X === W * .6 ? x.moveTo(X, Y) : x.lineTo(X, Y); } x.stroke(); }
  }
  function p4c(u, k) {   // стенофіла: росток і світле число
    const s = S(), g = eo(u / 1.6), cx = W * .5, base = H * .82;
    x.strokeStyle = `rgba(110,170,90,${k})`; x.lineWidth = 5 * s + 2; x.beginPath(); x.moveTo(cx, base); x.quadraticCurveTo(cx + 20 * s, base - 120 * s * g, cx, base - 220 * s * g); x.stroke();
    [[-1, .45], [1, .65], [-1, .85]].forEach(([d, p]) => { if (g < p) return; const yy = base - 220 * s * p, ll = 50 * s * ez((g - p) / .2); x.fillStyle = `rgba(110,170,90,${k})`; x.beginPath(); x.ellipse(cx + d * ll * .7, yy, ll, ll * .4, d * .5, 0, 7); x.fill(); });
    const gl = x.createRadialGradient(W * .78, H * .35, 0, W * .78, H * .35, 140 * s); gl.addColorStop(0, `rgba(255,140,60,${.35 * k})`); gl.addColorStop(1, 'rgba(255,140,60,0)'); x.fillStyle = gl; x.fillRect(0, 0, W, H);
    big(counter(14, D.clim.ste, u / 1.6, 1) + ' °C', W * .78, H * .4, 56 * s + 16, A(k)); label('стенофіла · +6,8 °C до арабіки', W * .78, H * .52, k * ez(u - 1)); label('смак — як у доброї арабіки', W * .22, H * .3, k * ez(u - 1.4));
  }
  /* ── розділ 5: від ягоди до зерна ── */
  function p5a(u, k) {   // гілка з ягодами, що червоніють
    const s = S(), y0 = H * .45;
    x.strokeStyle = `rgba(90,70,50,${k})`; x.lineWidth = 8 * s + 2; x.beginPath(); x.moveTo(-10, y0 + 40 * s); x.bezierCurveTo(W * .3, y0 - 30 * s, W * .6, y0 + 60 * s, W + 10, y0); x.stroke();
    for (let i = 0; i < 16; i++) { const tt = (i + .5) / 16, X = W * tt, Y = y0 + 40 * s * (1 - tt) + Math.sin(tt * 6) * 22 * s + 26 * s, r = (12 + hh(i) * 6) * s + 3, rp = eo((u - i * .07) / .8);
      x.fillStyle = `hsl(${120 - 118 * rp},${50 + 20 * rp}%,${38 + 10 * rp}%)`; x.globalAlpha = k; x.beginPath(); x.arc(X, Y + (hh(i + 2) - .5) * 30 * s, r * eb(rp + .2), 0, 7); x.fill(); x.globalAlpha = 1;
      if (i % 4 === 0) { x.fillStyle = `rgba(80,130,70,${k})`; x.beginPath(); x.ellipse(X + 18 * s, Y - 30 * s, 26 * s, 9 * s, -.6, 0, 7); x.fill(); } }
    label('ягода дозріває · зерно всередині', W / 2, H * .88, k * ez(u - .5));
  }
  function p5b(u, k) {   // розріз ягоди, шари злітають
    const s = S(), cx = W * .38, cy = H * .5, R = Math.min(W * .17, H * .32), L = [['#b3261e', 'шкірка'], ['#e0533e', 'м’якоть'], ['#f2b48a', 'слиз'], ['#e9d8b4', 'пергамент']];
    L.forEach(([c, n], i) => { const gone = eo((u - .3 - i * .55) / .5); x.globalAlpha = k * (1 - gone); x.fillStyle = c; x.beginPath(); x.ellipse(cx + gone * W * .4 * (i % 2 ? 1 : -1) * .5, cy - gone * H * .4, R * (1 - i * .14), R * .9 * (1 - i * .14), gone * 2, 0, 7); x.fill(); x.globalAlpha = 1;
      if (gone > .02 && gone < .98) label('– ' + n, W * .74, H * (.3 + i * .12), k * (1 - Math.abs(gone - .5) * 1.6)); });
    bean(cx, cy, R * .5, '#9fb07a', -.4, .7, k);
  }
  function p5c(u, k) {   // барабан ростера крутиться, зерна буріють, тріск — іскри й тряска
    const s = S(), cx = W * .4, cy = H * .5, R = Math.min(W * .2, H * .34), T = 25 + 190 * ez(u / 3), cr = T > 196;
    const jx = cr ? (hh(Math.floor(u * 30)) - .5) * 8 : 0, jy = cr ? (hh(Math.floor(u * 30) + 5) - .5) * 8 : 0;
    x.save(); x.translate(jx, jy);
    x.globalAlpha = k; x.strokeStyle = '#8a8f99'; x.lineWidth = 10 * s + 3; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    for (let i = 0; i < 6; i++) { const an = u * 3 + i * Math.PI / 3; x.strokeStyle = 'rgba(160,165,175,.6)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(an) * R, cy + Math.sin(an) * R); x.stroke(); }
    const c = T < 140 ? `hsl(${80 - (T - 25) / 115 * 30},40%,55%)` : T < 196 ? `hsl(${48 - (T - 140) / 56 * 20},50%,${50 - (T - 140) / 56 * 20}%)` : 'hsl(26,45%,26%)';
    for (let i = 0; i < 24; i++) { const an = -u * 4 + i * .26, rr = R * (.4 + .45 * hh(i)), py = cy + Math.abs(Math.sin(an)) * rr * .9; bean(cx + Math.cos(an) * rr * .9, py, 9 * s + 3, c, an, .6, 1); }
    if (cr) for (let i = 0; i < 18; i++) { const an = hh(i + Math.floor(u * 8)) * 6.283, d = R * (1 + hh(i) * .5); x.fillStyle = `rgba(255,200,120,${hh(i * 3 + Math.floor(u * 10))})`; x.fillRect(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 3, 3); }
    x.globalAlpha = 1; x.restore();
    big(Math.round(T) + ' °C', W * .78, H * .42, 54 * s + 14, A(k)); label(T < 140 ? 'сушіння' : T < 196 ? 'Маяр · зерно буріє' : 'перший тріск!', W * .78, H * .54, k);
  }
  /* ── розділ 6: ціна ── */
  function p6a(u, k) {   // біржова стрічка
    const s = S(), row = (y, items, sp) => { x.font = `700 ${22 * s + 8}px ${MONO}`; let X = -((u * sp) % 600); for (let r = 0; r < 6; r++) items.forEach(([n, v, c]) => { txt(n, X, y, 22 * s + 8, A(.6 * k), 'left', 600, MONO); X += x.measureText(n).width + 12; txt(v, X, y, 22 * s + 8, c, 'left', 700, MONO); X += x.measureText(v).width + 50; }); };
    x.fillStyle = `rgba(0,0,0,${.4 * k})`; x.fillRect(0, H * .3, W, H * .14); x.fillRect(0, H * .56, W, H * .14);
    row(H * .39, [['ICE KC', f(ARA, 2) + ' $/lb', `rgba(255,190,130,${k})`], ['RC', f(D.price.canUsdT, 0) + ' $/t', `rgba(200,160,120,${k})`]], 160);
    row(H * .65, [['ROBUSTA', f(ROB, 2) + ' $/lb', `rgba(200,160,120,${k})`], ['ARABICA', f(ARA, 2) + ' $/lb', `rgba(255,190,130,${k})`]], 230);
    label('біржа ICE · ' + D.price.priceDate, W / 2, H * .18, k);
  }
  function p6b(u, k) {   // сходи: зростають, монети сиплються
    const s = S(), Q = [['робуста', ROB, RB], ['арабіка', ARA, AR], ['гейша', GES, CR]], base = H * .84, hMax = H * .64, lmax = Math.log10(30000);
    Q.forEach(([n, v, c], i) => { const g = eb((u - .2 - i * .6) / .9), h = hMax * Math.max(.05, Math.log10(v + 1) / lmax) * cl(g), X = W * (.25 + i * .25), bw = 100 * s + 30;
      x.globalAlpha = k; x.fillStyle = c; x.fillRect(X - bw / 2, base - h, bw, h); x.globalAlpha = 1;
      for (let j = 0; j < 6 && g > .2; j++) { const ph = (u * 1.4 + j / 6 + i * .3) % 1; x.fillStyle = `rgba(255,214,120,${(1 - ph) * k})`; x.beginPath(); x.ellipse(X + (hh(j + i) - .5) * bw, base - h - 40 + ph * 40, 6 * s + 2, 2.5 * s + 1, 0, 0, 7); x.fill(); }
      label(n, X, base + 26, k); if (g > .5) big('$' + (v < 100 ? f(v, 2) : Math.round(v).toLocaleString('uk-UA')), X, base - h - 18, 26 * s + 8, A(k)); });
  }
  function p6c(u, k) {   // фінал: чашка з парою і назва
    const s = S(), cx = W / 2, cy = H * .58, g = eo(u / 1.2);
    x.globalAlpha = k; x.fillStyle = '#f2ece4'; x.beginPath(); x.moveTo(cx - 90 * s, cy - 40 * s); x.lineTo(cx - 70 * s, cy + 70 * s); x.lineTo(cx + 70 * s, cy + 70 * s); x.lineTo(cx + 90 * s, cy - 40 * s); x.fill();
    x.fillStyle = '#3a2214'; x.beginPath(); x.ellipse(cx, cy - 40 * s, 90 * s, 16 * s, 0, 0, 7); x.fill();
    x.strokeStyle = '#f2ece4'; x.lineWidth = 9 * s; x.beginPath(); x.arc(cx + 98 * s, cy + 6 * s, 28 * s, -1.2, 1.2); x.stroke();
    for (let j = 0; j < 3; j++) { x.strokeStyle = `rgba(255,236,214,${.35 * k * g})`; x.lineWidth = 3; x.beginPath(); for (let Y = 0; Y < 120 * s; Y += 4) { const X = cx - 30 * s + j * 30 * s + Math.sin(Y * .06 + u * 3 + j) * 10 * s; Y ? x.lineTo(X, cy - 60 * s - Y) : x.moveTo(X, cy - 60 * s); } x.stroke(); }
    x.globalAlpha = 1; big('Від гена до чашки', W / 2, H * .2, 46 * s + 14, A(k * g)); label('гортайте нижче — кожен крок можна покрутити', W / 2, H * .92, k * ez(u - 1));
  }
  const SHOTS = [[p1a, p1b, p1c], [p2a, p2b, p2c], [p3a, p3b, p3c], [p4a, p4b, p4c], [p5a, p5b, p5c], [p6a, p6b, p6c]];
  // фон: зерна з паралаксом і пара
  function bg(t) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#22140c'); g.addColorStop(1, '#0d0806'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 28; i++) { const d = .3 + hh(i) * .7, px = ((hh(i + 1) * W * 1.2 - t * 18 * d) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * .1, py = hh(i + 2) * H + Math.sin(t * .5 + i) * 10;
      bean(px, py, (3 + d * 6) * S() + 1, '#5a3420', t * d * .6 + i, .5, .12 + .18 * d); }
    x.strokeStyle = 'rgba(255,220,180,.035)'; x.lineWidth = 2; for (let j = 0; j < 4; j++) { x.beginPath(); for (let X = 0; X <= W; X += 12) { const Y = H * (.2 + j * .2) + Math.sin(X * .012 + t * .8 + j) * 12; X ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }
  }
  function draw(t) {
    bg(t);
    const i = Math.min(SC.length - 1, Math.max(0, SC.findIndex((s) => t < s.b))), sc = SC[i], u0 = t - sc.a, j = Math.min(2, Math.floor(u0 / SH)), u = u0 - j * SH;
    const k = Math.min(1, ez(u / .22), ez((SH - u) / .22) + (i === SC.length - 1 && j === 2 ? 1 : 0));
    // камера: повільний наїзд у кожному плані, легка панорама
    const z = 1 + .06 * (u / SH), px = Math.sin(t * .3) * 8;
    x.save(); x.translate(W / 2 + px, H / 2); x.scale(z, z); x.translate(-W / 2, -H / 2);
    SHOTS[i][j](u, k); x.restore();
    // склейка: короткий спалах на початку плану
    const fl = Math.max(0, 1 - u / .14); if (fl > 0 && t > .2) { x.fillStyle = `rgba(255,236,214,${fl * .5})`; x.fillRect(0, 0, W, H); }
    // кашетування
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H * .035); x.fillRect(0, H * .965, W, H * .035);
    x.font = `600 11px ${MONO}`; x.fillStyle = 'rgba(240,225,205,.55)'; x.textAlign = 'left'; x.fillText(`${i + 1}/${SC.length} · ${sc.t}`, 14, H * .035 + 18);
    const c = sc.cap[j]; if (cap.textContent !== c) cap.textContent = c;
    head.style.left = (t / TOTAL * 100) + '%'; tm.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} / 1:00`;
    segs.forEach((e, q) => e.classList.toggle('on', q === i));
  }
  let t = 0, playing = false, raf = 0, last = 0, lastSh = -1;
  function loop(now) { const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; t += dt;
    if (t >= TOTAL) { t = TOTAL; pause(); draw(t - .001); return; }
    const sh = Math.floor(t / SH); if (sh !== lastSh) { lastSh = sh; if (sh > 0) SND(sh === 14 ? 'crack' : 'step', sh); }
    draw(t); raf = playing ? requestAnimationFrame(loop) : 0; }
  function play() { if (t >= TOTAL - .01) t = 0; playing = true; cover.hidden = true; pp.textContent = '❚❚'; pp.classList.add('on'); last = 0; lastSh = Math.floor(t / SH); TRK(true, t); if (!raf) raf = requestAnimationFrame(loop); }
  function pause() { playing = false; cancelAnimationFrame(raf); raf = 0; pp.textContent = '▶'; pp.classList.remove('on'); TRK(false); }
  cover.addEventListener('click', play);
  pp.addEventListener('click', () => { playing ? pause() : play(); });
  trk.addEventListener('click', (e) => { const r = trk.getBoundingClientRect(); t = Math.max(0, Math.min(TOTAL - .01, (e.clientX - r.left) / r.width * TOTAL)); cover.hidden = true; if (playing) TRK(true, t); draw(t); });
  cv.addEventListener('click', () => { if (!cover.hidden) return; playing ? pause() : play(); });
  addEventListener('cf-sound', (e) => { if (playing) TRK(e.detail.on, t); });
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && playing) pause(); }, { threshold: .2 }).observe(box);
  new ResizeObserver(() => { size(); draw(t); }).observe(cv);
  size(); draw(REDUCE ? 15 : 8.5); t = 0;
  window.__cfReel = { total: TOTAL, seek: (tt) => new Promise((ok) => { t = tt; draw(t); requestAnimationFrame(() => ok()); }) };
})();
