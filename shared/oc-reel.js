/* Стаття 39: ролик «43 мілісекунди» — один імпульс світла з Гданська до Нью-Йорка, розтягнутий у середньому ≈1400 разів. Вісь одна: справа наліво, як на карті.
   18 планів без цифрової склейки «наплив»: стики — на дії, по лінії, по колу, через спалах і мул. Кадр залежить лише від часу t, випадковість — лише hh(n).
   Лічильник мс і км рахується з OC.phys: суходіл, море, місто. Темп на відрізках різний, але кінцеве число те саме, що в тексті. Усе намальовано кодом.
   Звук: власний трек через OC_SND.reel(on, t), якщо звук статті ввімкнено. */
(function () {
  const slot = document.getElementById('oc-reel'), D = window.OC, G = window.OC_GEO; if (!slot || !D || !G) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.OC_SND) OC_SND.fx(k, a); }, TRK = (on, tt) => { if (window.OC_SND) OC_SND.reel(on, tt); };
  const MONO = '"Roboto Mono", ui-monospace, monospace', SANS = 'Inter, system-ui, sans-serif';
  const P = D.phys, V = P.c / P.n, MS = (km) => km / V * 1000, LAND = MS(P.land), SEA = MS(P.sea), CITY = MS(P.city), END = LAND + SEA + CITY;
  // план: початок, кінець, підпис
  const SH = [
    [0, 4, 'Гданськ. Палець торкається екрана, і годинник стартує.'],
    [4, 7.2, 'Імпульс виходить із будинку в міську мережу.'],
    [7.2, 10.2, 'Усередині скла світло відбивається від стінок і йде на третину повільніше, ніж у вакуумі.'],
    [10.2, 12.8, 'Суходіл і дно Балтики до Данії: ≈750 км.'],
    [12.8, 15.8, 'Блобʼєрг. Кабель заходить у Північне море.'],
    [15.8, 19, 'На дні він завтовшки зі шланг: сталь, мідь і кілька волокон усередині.'],
    [19, 21.4, 'Кожні 70 км світло слабшає, і підсилювач повертає йому силу.'],
    [21.4, 24.4, 'Під ним лежить історія. 1858 рік: 98 слів королеви, і сигнал розпливається дорогою.'],
    [24.4, 26.4, 'Напругу піднімають, ізоляція не витримує. 20 жовтня лінія замовкає.'],
    [26.4, 29.4, '1866 рік: кінець кабелю 1865 року виловлюють гаком із глибини понад 3 км.'],
    [29.4, 33, '«Грейт Істерн», 211 метрів: єдиний корабель, який вмістив увесь кабель.'],
    [33, 36, '1956 рік, TAT-1: 36 розмов в одному кабелі, 51 підсилювач.'],
    [36, 38.2, 'Сьогодні одне волокно несе десятки кольорів, і кожен колір — окремий канал.'],
    [38.2, 40.2, 'Хребет посеред Атлантики. Спалах — кожні 70 км.'],
    [40.2, 46.2, '18 листопада 1929 року: зсув рве кабелі один за одним, 28 обривів.'],
    [46.2, 50.6, 'Від одного дроту 1851 року — до мережі, яка оплітає планету.'],
    [50.6, 54, 'Волл, Нью-Джерсі. Світло виходить із води.'],
    [54, 59.4, 'Нью-Йорк: 42,6 мс. Це теоретична межа, насправді трохи довше.']
  ];
  const CH = [['Гданськ', 0, 12.8], ['Дно', 12.8, 21.4], ['1858–1866', 21.4, 33], ['Світло', 33, 40.2], ['1929', 40.2, 46.2], ['Світ', 46.2, 50.6], ['Нью-Йорк', 50.6, 59.4]];
  const TOTAL = 59.4;
  const box = document.createElement('div'); box.className = 'rc-reel oc-reel';
  box.innerHTML = `<div class="rc-reel__scr"><canvas aria-label="Ролик: імпульс світла з Гданська до Нью-Йорка"></canvas><div class="rc-reel__cap" aria-live="polite"></div>
      <button type="button" class="rc-reel__cover" data-play><span class="pl">▶</span><b>43 мілісекунди</b><small>ролик · 1 хв · уся стаття коротко</small></button></div>
    <div class="rc-reel__bar"><button type="button" class="rc-btn" data-pp>▶</button><div class="rc-reel__trk">${CH.map((s) => `<i style="left:${s[1] / TOTAL * 100}%;width:${(s[2] - s[1]) / TOTAL * 100}%" title="${s[0]}"><u>${s[0]}</u></i>`).join('')}<em></em></div><span class="rc-reel__tm">0:00 / 0:59</span></div>`;
  slot.appendChild(box);
  const cv = box.querySelector('canvas'), cap = box.querySelector('.rc-reel__cap'), cover = box.querySelector('.rc-reel__cover'), pp = box.querySelector('[data-pp]'),
    trk = box.querySelector('.rc-reel__trk'), head = trk.querySelector('em'), tm = box.querySelector('.rc-reel__tm'), segs = [...trk.querySelectorAll('i')];
  const x = cv.getContext('2d'); let SC = 1, CW = 1280;
  const cl = (v) => Math.max(0, Math.min(1, v)), ez = (v) => { v = cl(v); return v * v * (3 - 2 * v); }, eo = (v) => 1 - Math.pow(1 - cl(v), 3), ei = (v) => Math.pow(cl(v), 3);
  const mix = (a, b, k) => a + (b - a) * k, f = (v, d = 1) => v.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
  const hh = (n) => { const v = Math.sin(n * 91.7 + 17.3) * 43758.5453; return v - Math.floor(v); };
  function size() { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); CW = Math.max(1, r.width); cv.width = Math.round(CW * d); cv.height = Math.round(CW * d * 9 / 16); SC = cv.width / 1280; }
  const FS = (n) => n * Math.max(1, 620 / CW);
  function txt(s, X, Y, n, c, al = 'left', w = 600, fm = MONO) { x.font = `${w} ${FS(n)}px ${fm}`; x.textAlign = al; x.textBaseline = 'alphabetic'; x.fillStyle = c; x.fillText(s, X, Y); }
  function tag(s, X, Y, a = 1, al = 'left', c = '205,232,240') { txt(s, X, Y, 19, `rgba(${c},${a})`, al, 600); }
  function lab(y, sub, a = 1, c = '235,240,240', top = 34) { if (a <= 0) return; x.font = `600 ${FS(19)}px ${MONO}`; const sw = x.measureText(sub).width + FS(y ? 112 : 28); rrect(32, top, sw, FS(52), 8); x.fillStyle = `rgba(2,6,10,${.62 * a})`; x.fill(); if (y) txt(y, 46, top + FS(38), 34, `rgba(${c},${a})`, 'left', 700); txt(sub, y ? 46 + FS(96) : 46, top + FS(34), 19, `rgba(${c},${a * .92})`); }
  function rect(c, X = 0, Y = 0, w = 1280, h = 720) { x.fillStyle = c; x.fillRect(X, Y, w, h); }
  function vgrad(y0, y1, ...st) { const g = x.createLinearGradient(0, y0, 0, y1); st.forEach((c, i) => g.addColorStop(i / (st.length - 1), c)); return g; }
  function cam(z, cx, cy, sx = 640, sy = 360) { x.translate(sx, sy); x.scale(z, z); x.translate(-cx, -cy); }
  function disc(X, Y, r, c) { x.fillStyle = c; x.beginPath(); x.arc(X, Y, Math.max(.1, r), 0, 6.2832); x.fill(); }
  function line(pts, c, w = 2, cap2 = 'round') { if (pts.length < 2) return; x.strokeStyle = c; x.lineWidth = w; x.lineCap = cap2; x.lineJoin = 'round'; x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke(); }
  function rrect(X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
  function glow(X, Y, r, c = '120,235,255', a = 1) { const g = x.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(.35, `rgba(${c},${a * .3})`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(X - r, Y - r, r * 2, r * 2); }
  // герой усього ролику: біла точка, блакитне сяйво, хвіст праворуч (рух наліво)
  function pulse(X, Y, r = 8, tail = 130, ang = 0) {
    x.save(); x.globalCompositeOperation = 'lighter'; x.translate(X, Y); x.rotate(ang);
    const g = x.createLinearGradient(0, 0, tail, 0); g.addColorStop(0, 'rgba(150,240,255,.75)'); g.addColorStop(1, 'rgba(90,210,255,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(0, -r * .55); x.lineTo(tail, 0); x.lineTo(0, r * .55); x.fill();
    glow(0, 0, r * 7); disc(0, 0, r, '#fff'); x.restore();
  }
  // положення на ламаній за часткою довжини
  function len(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  function at(pts, p) { let d = len(pts) * cl(p); for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d <= l || i === pts.length - 1) { const k = l ? cl(d / l) : 0; return [mix(a[0], b[0], k), mix(a[1], b[1], k), Math.atan2(a[1] - b[1], a[0] - b[0])]; } d -= l; } return pts[0]; }
  function upto(pts, p) { const q = at(pts, p); let d = len(pts) * cl(p); const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= l) break; o.push(pts[i]); d -= l; } o.push([q[0], q[1]]); return o; }
  // обрис: сума синусів; чим менше k, тим повільніше пливе план (паралакс)
  function ridge(base, amp, seed, off, c, bottom = 720) { x.fillStyle = c; x.beginPath(); x.moveTo(-20, bottom); for (let X = -20; X <= 1300; X += 12) { const w = X + off; x.lineTo(X, base - amp * (Math.sin(w * .006 + seed) * .55 + Math.sin(w * .017 + seed * 2.1) * .3 + Math.sin(w * .051 + seed * 3.3) * .15)); } x.lineTo(1300, bottom); x.fill(); }
  // морський сніг: частинки пливуть назустріч руху камери
  function snow(t, n, seed, sp, a = .5, big = 1) { for (let i = 0; i < n; i++) { const d = .3 + hh(i + seed) * .7, X = ((hh(i * 2 + seed) * 1400 + t * sp * d) % 1400 + 1400) % 1400 - 60, Y = hh(i * 3 + seed) * 720 + Math.sin(t * .7 + i) * 8; disc(X, Y, (.8 + d * 1.8) * big, `rgba(190,225,230,${a * d})`); } }
  // телефон, спільний для першого й останнього плану
  function phone(X, Y, w, h, o) {
    x.save(); x.translate(X, Y); x.rotate(o.rot || 0);
    rrect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 52); x.fillStyle = '#0b0e13'; x.fill(); x.strokeStyle = 'rgba(160,175,190,.5)'; x.lineWidth = 2; x.stroke();
    rrect(-w / 2, -h / 2, w, h, 42); x.fillStyle = vgrad(-h / 2, h / 2, '#17202c', '#0e141c'); x.fill();
    x.save(); rrect(-w / 2, -h / 2, w, h, 42); x.clip();
    rect('rgba(255,255,255,.04)', -w / 2, -h / 2, w, 96);
    disc(-w / 2 + 52, -h / 2 + 52, 22, o.ava); txt(o.who, -w / 2 + 88, -h / 2 + 60, 22, '#eef6f8', 'left', 700, SANS);
    const by = o.by === undefined ? 30 : o.by;
    if (o.bub > 0) { x.globalAlpha = cl(o.bub); const bw = w * .56, bx = o.mine ? w / 2 - bw - 26 : -w / 2 + 26; rrect(bx, by, bw, 76, 24); x.fillStyle = o.mine ? '#2a7f94' : '#2c3644'; x.fill(); txt('Привіт!', bx + 26, by + 49, 28, '#fff', 'left', 600, SANS); x.globalAlpha = 1; }
    if (o.status) txt(o.status, o.mine ? w / 2 - 26 : -w / 2 + 26, by + 104, 17, 'rgba(160,235,245,.9)', o.mine ? 'right' : 'left', 600);
    if (o.btn) { const q = o.press || 0; rrect(-w * .3, h / 2 - 170, w * .6, 76, 38); x.fillStyle = q ? `rgb(${mix(42, 170, q)},${mix(127, 240, q)},${mix(148, 255, q)})` : '#2a7f94'; x.fill(); txt('Надіслати', 0, h / 2 - 122, 25, '#fff', 'center', 700, SANS); }
    x.restore(); x.restore();
  }
  function bokeh(t, seed, c1, c2, n = 30, a = .5) { x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const X = hh(i + seed) * 1280 + Math.sin(t * .2 + i) * 6, Y = 180 + hh(i * 2 + seed) * 460, r = 18 + hh(i * 3 + seed) * 48, c = hh(i * 5 + seed) > .5 ? c1 : c2; disc(X, Y, r, `rgba(${c},${a * (.15 + hh(i * 7 + seed) * .35) * (.8 + .2 * Math.sin(t * 1.2 + i))})`); } x.restore(); }

  /* 1. Наддеталь: палець, «Надіслати» */
  function s1(u) {
    const g = x.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, '#0c1320'); g.addColorStop(1, '#17110f'); rect(g); bokeh(u, 3, '255,190,110', '120,170,230', 34, .55);
    const z = mix(1, 1.62, ez(u / 2.8)); x.save(); cam(z, 640, mix(360, 590, ez(u / 2.8)));
    const press = u > 2.7 ? ez((u - 2.7) / .12) * (1 - ez((u - 3.1) / .5)) : 0;
    phone(640, 340, 480, 900, { rot: -.035, ava: '#d98d4b', who: 'Нью-Йорк', bub: ez((u - .15) / .4), mine: true, by: 0, status: '', btn: true, press });
    // палець заходить знизу справа
    const k = ez((u - .35) / 2.35), back = u > 2.85 ? ez((u - 2.85) / .9) : 0, fx = mix(1000, 670, k) + back * 280, fy = mix(1050, 688, k) + back * 240;
    x.save(); x.translate(fx, fy); x.rotate(-.52);
    const sk = x.createLinearGradient(-60, 0, 60, 0); sk.addColorStop(0, '#6b4436'); sk.addColorStop(.45, '#cf9a7f'); sk.addColorStop(1, '#7a4f3e'); x.fillStyle = sk;
    rrect(-52, -28, 104, 460, 52); x.fill(); rrect(-48, -14, 96, 96, 40); x.fillStyle = 'rgba(248,216,200,.42)'; x.fill(); line([[-44, 138], [44, 138]], 'rgba(90,55,42,.5)', 3); line([[-46, 230], [46, 230]], 'rgba(90,55,42,.4)', 3); x.restore();
    if (u > 2.7) { const q = u - 2.7; x.strokeStyle = `rgba(170,240,255,${.8 * (1 - cl(q / .6))})`; x.lineWidth = 4; x.beginPath(); x.arc(640, 652, 40 + q * 300, 0, 6.3); x.stroke(); }
    if (u > 2.95) { const q = ei((u - 2.95) / 1.05), X = mix(640, -180, q); pulse(X, 652, 10, 80 + q * 220); }
    x.restore();
    tag('Гданськ', 44, 92, ez((u - .2) / .5));
  }
  /* 2. Вікно під дощем: імпульс біжить волокном по підвіконню, краплі ловлять відблиск */
  function s2(u) {
    const p = u / 3.2, px = mix(1120, 90, ez(p)), z = mix(1, 1.32, ez(p));
    rect(vgrad(0, 720, '#0a1020', '#1a1a26', '#2b2118')); x.save(); cam(z, mix(760, 520, ez(p)), 400);
    // Гданськ за склом: кран Журав, гостроверхі фасади, вогні на Мотлаві
    x.save(); x.globalAlpha = .75; ridge(410, 0, 1, 0, '#0a0f18', 520);
    let X0 = 60; for (let i = 0; i < 26; i++) { const w = 34 + hh(i) * 34, h = 90 + hh(i + 40) * 110; x.fillStyle = i % 2 ? '#0c1220' : '#10182a'; x.beginPath(); x.moveTo(X0, 430); x.lineTo(X0, 430 - h); x.lineTo(X0 + w / 2, 430 - h - 26); x.lineTo(X0 + w, 430 - h); x.lineTo(X0 + w, 430); x.fill(); for (let k = 0; k < 4; k++) if (hh(i * 7 + k) > .4) rect(`rgba(255,${180 + hh(k) * 50},110,.8)`, X0 + 6 + hh(k * 3 + i) * (w - 16), 430 - 18 - k * 24, 6, 9); X0 += w + 3; }
    x.fillStyle = '#080c15'; x.fillRect(560, 230, 150, 200); x.fillRect(585, 170, 100, 64); x.beginPath(); x.moveTo(585, 170); x.lineTo(635, 120); x.lineTo(685, 170); x.fill(); x.restore();
    rect(vgrad(430, 560, '#1a1d2c', '#07090f'), -100, 430, 1500, 130); for (let i = 0; i < 40; i++) { const X = hh(i + 80) * 1400 - 60, Y = 436 + hh(i * 3) * 90; rect(`rgba(255,190,110,${.1 + hh(i * 9) * .22 * (.7 + .3 * Math.sin(u * 3 + i))})`, X, Y, 14 + hh(i) * 40, 2); }
    // відбиття кімнати: сяйво екрана на склі
    glow(980, 330, 300, '120,200,220', .13); rrect(910, 180, 150, 290, 20); x.strokeStyle = 'rgba(180,225,235,.12)'; x.lineWidth = 2; x.stroke();
    // краплі: яскравіші там, де щойно пройшов імпульс
    for (let i = 0; i < 120; i++) { const X = hh(i + 11) * 1560 - 140, sp = hh(i + 5) > .8 ? 90 : 7, Y = ((hh(i + 23) * 620 + u * sp) % 620), r = 3 + hh(i + 31) * 8, dd = Math.abs(X - px), lit = Math.exp(-dd * dd / 26000); x.fillStyle = `rgba(${mix(130, 190, lit)},${mix(150, 245, lit)},${mix(170, 255, lit)},${.12 + lit * .75})`; x.beginPath(); x.ellipse(X, Y, r * .78, r, 0, 0, 6.3); x.fill(); disc(X - r * .25, Y - r * .3, r * .22, `rgba(255,255,255,${.3 + lit * .5})`); }
    // підвіконня й волокно
    rect(vgrad(555, 720, '#3b3028', '#14100d'), -200, 555, 1800, 300); rect('rgba(255,255,255,.08)', -200, 555, 1800, 3); line([[-400, 544], [1700, 544]], 'rgba(170,220,235,.65)', 3);
    for (let X = -300; X < 1600; X += 240) { rect('#a39a8b', X, 537, 13, 14); }
    pulse(px, 544, 8, 240); x.restore();
    // рама вікна пливе швидше за вид: передній план
    const fr = mix(120, -80, ez(p)); rect('#0a0806', 920 + fr * 1.4, 0, 56, 720); rect('rgba(255,255,255,.04)', 920 + fr * 1.4, 0, 4, 720);
  }
  /* 3. Усередині скла: зигзаг повного внутрішнього відбиття */
  function s3(u) {
    const p = u / 3, flat = ez((u - 2.3) / .7), hw = mix(205, 2, flat), lo = 360 - hw, hi = 360 + hw;
    rect(vgrad(0, 720, '#031018', '#06222e', '#031018'));
    rect(vgrad(lo - 8, hi + 8, 'rgba(70,190,220,.1)', 'rgba(110,225,250,.2)', 'rgba(70,190,220,.1)'), 0, lo, 1280, hi - lo);
    for (let i = 0; i < 70; i++) { const X = ((hh(i) * 1400 + u * (40 + hh(i + 2) * 140)) % 1400) - 60, Y = lo + hh(i + 5) * (hi - lo); disc(X, Y, .8 + hh(i + 9) * 2.2, `rgba(200,240,250,${.1 + hh(i + 3) * .25})`); }
    [lo, hi].forEach((Y) => { rect('rgba(160,235,255,.65)', 0, Y - 1.5, 1280, 3); for (let X = 0; X < 1280; X += 16) rect('rgba(160,235,255,.06)', X, Y < 360 ? Y - 70 : Y, 8, 70); });
    // промінь: рівні кути, рух наліво
    const per = 250, head = mix(1240, 90, ez(p * .96)), pts = []; for (let X = head; X < 1500; X += 8) { const q = (X + u * 20) / per, tri = 2 * Math.abs(2 * (q - Math.floor(q + .5))) - 1; pts.push([X, 360 + tri * hw]); }
    x.save(); x.globalCompositeOperation = 'lighter'; line(pts, 'rgba(90,220,255,.28)', 12); line(pts, 'rgba(180,245,255,.92)', 3); x.restore(); if (pts[0]) pulse(pts[0][0], pts[0][1], 9, 0);
    // кут падіння біля найближчого відбиття
    const a = ez((u - .9) / .3) * (1 - flat); if (a > 0) { tag('n = 1,468', 54, 94, a); tag(f(V, 0).replace(/\s/g, ' ') + ' км/с', 54, 124, a, 'left', '150,235,255'); x.setLineDash([6, 8]); line([[640, lo - 46], [640, lo + 130]], `rgba(255,255,255,${.35 * a})`, 2); x.setLineDash([]); }
  }
  /* 4. Згори: суходіл до узбережжя */
  const LL = (lo, la) => [(lo - 3.4) * 72, (57.7 - la) * 123];
  const ROUTE4 = [[18.65, 54.35], [18.3, 54.75], [16.2, 55.1], [14, 55.2], [12.7, 55.5], [11, 55.55], [9.6, 55.5], [8.22, 55.72]].map((a) => LL(a[0], a[1]));
  function landpath(pr) { x.beginPath(); G.land.forEach((r) => { r.forEach((c, i) => { const q = pr(c[0], c[1]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath(); }); }
  function s4(u) {
    const p = u / 2.6; rect('#040b14'); x.save(); cam(mix(1.1, 1.34, ez(p)), mix(960, 400, ez(p)), mix(370, 300, ez(p)));
    x.strokeStyle = 'rgba(130,190,215,.07)'; x.lineWidth = 1; for (let lo = 0; lo < 24; lo += 2) { const a = LL(lo, 60), b = LL(lo, 48); line([a, b], 'rgba(130,190,215,.07)', 1); } for (let la = 48; la < 61; la++) line([LL(0, la), LL(24, la)], 'rgba(130,190,215,.07)', 1);
    landpath(LL); x.fillStyle = '#16232c'; x.fill(); x.strokeStyle = 'rgba(150,215,230,.42)'; x.lineWidth = 1.6; x.stroke();
    [[18.6, 54.4, 3], [17, 54.45, 1], [14.55, 53.42, 2], [13.4, 52.5, 4], [12.1, 54.08, 1.5], [12.57, 55.68, 3.5], [10, 53.55, 3], [9.9, 57, 1.5], [10.2, 56.15, 2], [10.4, 55.4, 1.5], [8.45, 55.47, 1.6], [16.9, 52.4, 2.5], [21, 52.2, 4]].forEach((c, i) => { const q = LL(c[0], c[1]); x.save(); x.globalCompositeOperation = 'lighter'; glow(q[0], q[1], c[2] * 9, '255,190,110', .7); x.restore(); disc(q[0], q[1], 1.6, '#ffdca8'); });
    const k = ez(p * 1.04), done = upto(ROUTE4, k), q = at(ROUTE4, k); line(ROUTE4, 'rgba(120,225,255,.18)', 2); x.save(); x.globalCompositeOperation = 'lighter'; line(done, 'rgba(120,225,255,.35)', 8); line(done, 'rgba(190,245,255,.95)', 2.4); x.restore(); pulse(q[0], q[1], 6, 0);
    const a = LL(18.65, 54.35), b = LL(8.22, 55.72); disc(a[0], a[1], 5, '#fff'); disc(b[0], b[1], 5, '#fff'); x.textBaseline = 'alphabetic'; tag('Гданськ', a[0] + 14, a[1] + 7, 1); tag('Блобʼєрг', b[0] - 12, b[1] - 16, ez(p * 2.2), 'right'); txt('≈750 км', mix(a[0], b[0], .48), a[1] + 74, 17, 'rgba(150,235,255,.85)', 'center');
    x.restore();
  }
  /* 5. Широкий, кран униз: дюна в Блобʼєргу, кабель іде під воду */
  function s5(u) {
    const p = u / 3, cy = mix(0, 610, ez((u - .35) / 2.35)), W = 430;
    rect('#02070d'); x.save(); x.translate(0, -cy);
    rect(vgrad(-40, W, '#0b1a36', '#31465e', '#d48a55'), 0, -40, 1280, W + 40);
    for (let i = 0; i < 70; i++) disc(hh(i) * 1280, hh(i + 3) * 240, .6 + hh(i + 6), `rgba(255,255,255,${.25 + hh(i + 8) * .5})`);
    // вітряки на обрії: реальний морський парк поруч із Блобʼєргом
    for (let i = 0; i < 9; i++) { const X = 60 + i * 56, Y = W - 2, h = 38 + (i % 2) * 6; line([[X, Y], [X, Y - h]], 'rgba(20,28,40,.9)', 1.6); for (let b = 0; b < 3; b++) { const an = u * 1.1 + i + b * 2.094; line([[X, Y - h], [X + Math.cos(an) * 16, Y - h + Math.sin(an) * 16]], 'rgba(20,28,40,.9)', 1.2); } }
    // вода
    rect(vgrad(W, 1500, '#135a72', '#07344a', '#020e18'), 0, W, 1280, 1100);
    for (let k = 0; k < 8; k++) { const q = []; for (let X = 0; X <= 700; X += 18) q.push([X, W + k * 4 + Math.sin(X * .03 + u * 2 + k) * 2.2]); line(q, `rgba(255,${200 - k * 8},${170 - k * 10},${.34 - k * .03})`, 1.4); }
    // промені згори
    x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const X = 40 + i * 95 + Math.sin(u * .6 + i) * 12; x.fillStyle = 'rgba(120,200,220,.05)'; x.beginPath(); x.moveTo(X, W); x.lineTo(X + 30, W); x.lineTo(X - 70, W + 520); x.lineTo(X - 170, W + 520); x.fill(); } x.restore();
    // дно: суходіл праворуч, схил наліво
    const bed = [[1300, W - 62], [840, W - 56], [700, W - 8], [560, W + 62], [380, W + 280], [220, W + 590], [40, W + 770], [-60, W + 800]];
    x.fillStyle = vgrad(W - 60, W + 900, '#8e7a57', '#3a2f22', '#0d0a08'); x.beginPath(); x.moveTo(1300, 1700); bed.forEach((c) => x.lineTo(c[0], c[1])); x.lineTo(-60, 1700); x.fill();
    [70, 170, 300, 460, 640].forEach((o, i) => { const q = bed.map((c) => [c[0] + o * .5, c[1] + o + Math.sin(c[0] * .02 + i) * 8]); line(q, 'rgba(0,0,0,.2)', 5 + i); });
    for (let i = 0; i < 130; i++) { const X = 300 + hh(i) * 980, Y = W - 40 + hh(i + 4) * 860, m = Y - (W - 56 + cl((840 - X) / 700) * 860); if (m > 6) disc(X, Y, 1 + hh(i + 7) * 2.6, 'rgba(0,0,0,.2)'); }
    // станція на дюні, трава
    rect('#232a31', 980, W - 112, 170, 56); x.fillStyle = '#161b21'; x.beginPath(); x.moveTo(968, W - 112); x.lineTo(1065, W - 150); x.lineTo(1162, W - 112); x.fill(); rect('#ffcf8a', 1006, W - 94, 34, 20); rect('#ffcf8a', 1096, W - 94, 24, 20);
    for (let i = 0; i < 130; i++) { const X = 690 + hh(i + 50) * 600, Y = W - 54 - cl((X - 700) / 150) * 3, h = 12 + hh(i + 51) * 20, s = Math.sin(u * 2 + X * .03) * 5; line([[X, Y], [X + s, Y - h]], 'rgba(40,55,35,.95)', 1.5); }
    const c5 = [[1065, W - 56], [1065, W - 8], [900, W + 22], [700, W + 12], [560, W + 76], [380, W + 294], [220, W + 604], [40, W + 784], [-80, W + 810]];
    line(c5, '#0a1014', 8); line(c5, 'rgba(80,190,215,.5)', 2);
    const q = at(c5, ez(u / 3) * 1.02); pulse(q[0], q[1], 7, 90, q[2]);
    x.restore(); tag('Блобʼєрг, Данія', 1236, 74, ez((u - .1) / .4) * (1 - ez((u - 1.6) / .4)), 'right'); if (u > 1.7) { const a = ez((u - 1.8) / .4); tag('Північне море', 40, 74, a); }
  }
  /* 6. Рух уздовж дна: кабель у розрізі */
  function s6(u) {
    const off = -u * 85, Z = mix(1, 1.28, ez(u / 3.2));
    rect(vgrad(0, 720, '#031a28', '#021019', '#010609')); snow(u, 60, 7, 40, .32, .9);
    ridge(380, 60, 2, off * .25, '#04141d'); ridge(450, 42, 4, off * .5, '#051a24'); x.save(); cam(Z, 640, 390);
    // дно й дрібниці на ньому
    ridge(545, 16, 6, off, '#1a2e31'); for (let i = 0; i < 26; i++) { const X = ((hh(i) * 1500 - off) % 1500 + 1500) % 1500 - 100, Y = 548 + hh(i + 1) * 110; x.fillStyle = `rgba(${40 + hh(i + 2) * 30},${70 + hh(i) * 30},${70},.75)`; x.beginPath(); x.ellipse(X, Y, 6 + hh(i + 3) * 26, 3 + hh(i + 4) * 8, 0, 0, 6.3); x.fill(); }
    // трубка кабелю
    const y0 = 500, r0 = 36; rect(vgrad(y0 - r0, y0 + r0, '#2a3a40', '#0d1417', '#050809'), -100, y0 - r0, 1500, r0 * 2);
    for (let X = -60 + (u * 85) % 70; X < 1400; X += 70) line([[X - 8, y0 - r0], [X + 8, y0 + r0]], 'rgba(255,255,255,.04)', 3);
    // вирізане вікно: шари
    const a = 320, b = 1020; const bands = [['#343f43', 36], ['#8d969c', 28], ['#a86b3c', 18], ['#c8c07a', 11], ['#071018', 6]];
    x.save(); x.beginPath(); x.rect(a, y0 - r0, b - a, r0 * 2); x.clip(); bands.forEach((q) => { rect(q[0], a, y0 - q[1], b - a, q[1] * 2); }); for (let X = a + (u * 85) % 18; X < b; X += 18) { line([[X - 5, y0 - 28], [X + 5, y0 - 18]], 'rgba(30,35,38,.55)', 2); line([[X - 5, y0 + 18], [X + 5, y0 + 28]], 'rgba(30,35,38,.55)', 2); } [-3, 0, 3].forEach((o) => rect(o ? 'rgba(90,190,210,.6)' : 'rgba(140,235,255,.95)', a, y0 + o - .6, b - a, 1.4)); x.restore();
    x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = 1.5; x.strokeRect(a, y0 - r0, b - a, r0 * 2);
    x.restore();
    // лупа: кабель у перерізі, справжні шари
    const cx = 210, cy = 200, R = 128 * ez((u - .15) / .5); if (R > 2) { x.save(); line([[cx - 56, cy + 110], [640, 500]], 'rgba(200,235,245,.25)', 1.5); [[1, '#20282b'], [.82, '#8d969c'], [.56, '#a86b3c'], [.38, '#c8c07a'], [.2, '#0a1820']].forEach((q) => disc(cx, cy, R * q[0], q[1])); for (let i = 0; i < 24; i++) { const an = i / 24 * 6.283, q = R * .69; disc(cx + Math.cos(an) * q, cy + Math.sin(an) * q, R * .055, '#5c666c'); } for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283 + .3, q = R * .1; disc(cx + Math.cos(an) * q, cy + Math.sin(an) * q, R * .022, i === 2 ? '#c8f8ff' : '#6ec6d8'); } x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, R, 0, 6.3); x.stroke();
      const la = ez((u - .7) / .4); [['полієтилен', -.82, .9], ['сталь', -.45, .72], ['мідь', 0, .47], ['волокна', .4, .1]].forEach((q, i) => { const Y = cy + q[1] * R * .95, X = cx + R + 22; line([[cx + R * q[2] * .9, Y], [X - 4, Y]], `rgba(255,255,255,${.3 * la})`, 1); tag(q[0], X, Y + 6, la * .95); }); x.restore(); }
    const k = cl((u - .2) / 2.9), Xp = mix(1380, -130, k); pulse(Xp, mix(500, 500 - (Xp - 640) * .0, 0), 7, 220);
  }
  /* 7. Наддеталь: підсилювач, ерб у кільці */
  function s7(u) {
    const z = mix(1, 1.26, ez(u / 2.4)), hit = 1.15, b = u > hit ? Math.exp(-(u - hit) * 2.4) : 0;
    rect('#04090d'); x.save(); cam(z, 640, 360);
    rect(vgrad(90, 630, '#3a464b', '#151c1f', '#080c0e'), -100, 90, 1500, 540); for (let i = 0; i < 10; i++) { const X = 60 + i * 130; rect('rgba(0,0,0,.35)', X, 90, 16, 540); rect('rgba(255,255,255,.06)', X + 16, 90, 3, 540); }
    for (let i = 0; i < 36; i++) { const an = i / 36 * 6.283; disc(640 + Math.cos(an) * 248, 360 + Math.sin(an) * 248, 7, '#1c2529'); disc(640 + Math.cos(an) * 248 - 1.5, 360 + Math.sin(an) * 248 - 1.5, 2.2, 'rgba(255,255,255,.3)'); }
    disc(640, 360, 226, '#0a1013');
    // котушка ербієвого волокна
    for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(${mix(120, 255, b)},${mix(70, 170, b)},${mix(70, 90, b)},${.3 + b * .6})`; x.lineWidth = 2.4; x.beginPath(); x.arc(640, 360, 112 + i * 3.5, u * .3 + i, u * .3 + i + 5.9); x.stroke(); }
    x.save(); x.globalCompositeOperation = 'lighter'; glow(640, 360, 240 + b * 280, '255,150,70', .1 + b * .9); glow(640, 360, 120, '140,235,255', .1 + b * .6); x.restore(); disc(640, 360, 84, '#091015'); x.strokeStyle = 'rgba(180,225,235,.55)'; x.lineWidth = 2; x.beginPath(); x.arc(640, 360, 84, 0, 6.3); x.stroke();
    x.restore();
    // хвиля: слабка праворуч, сильна ліворуч
    const q = []; for (let X = 0; X <= 1280; X += 5) { const A = X > 640 ? 7 : mix(7, 62, ez((640 - X) / 150) * cl((u - hit) * 2.5)); q.push([X, 360 + Math.sin(X * .045 + u * 20) * A]); } x.save(); x.globalCompositeOperation = 'lighter'; line(q, 'rgba(120,230,255,.65)', 2.4); x.restore();
    const Xp = mix(1380, -110, cl(u / 2.3)); pulse(Xp, 360, Xp < 640 ? 11 : 4.5, Xp < 640 ? 240 : 80);
    tag('кожні 70 км', 44, 74, ez((u - .3) / .4));
  }
  /* 8. Макро: мідь 1858 року, морзе розпливається */
  const MOR = [0, 14, 28, 62, 96, 130, 144, 158];
  function s8(u) {
    const k = ez((u - .25) / .75), cR = mix(226, 120, k), cX = mix(640, 1180, k), cY = mix(360, 450, k);
    rect(vgrad(0, 720, '#1b120a', '#0a0705')); snow(u, 30, 9, 30, .18);
    // кабель лежить уздовж, кінець показує переріз
    if (k > 0) { rect(vgrad(cY - cR, cY + cR, '#26180f', '#0c0805'), -40, cY - cR, cX + 40, cR * 2); for (let X = (u * 40) % 44; X < cX; X += 44) line([[X, cY - cR], [X + 18, cY + cR]], 'rgba(160,120,80,.13)', 5); }
    disc(cX, cY, cR, '#2a1b10'); disc(cX, cY, cR * .78, '#14100c'); disc(cX, cY, cR * .45, '#6e4a26');
    [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047 + .3), Math.sin(i * 1.047 + .3)])].forEach((c) => { const X = cX + c[0] * cR * .29, Y = cY + c[1] * cR * .29; disc(X, Y, cR * .142, '#c4803e'); disc(X - cR * .04, Y - cR * .04, cR * .05, '#f0c27c'); });
    // морзе: чітке праворуч, що лівіше, то ширше й нижче (затримка кабелю)
    const q = [], front = u * 340 - 80; for (let X = 0; X <= cX - cR * .2; X += 4) { const dist = (cX - X) / cX, w = 3 + dist * dist * 44; let v = 0; MOR.forEach((m, i) => { for (let r = 0; r < 4; r++) { const c0 = cX - cR - (front - m * 2.2 - r * 410); const d = (X - c0) / w; v += Math.exp(-d * d) * (i === 3 || i === 4 ? 1.4 : 1) / (1 + dist * 5 * (w / 47)); } }); q.push([X, 214 - Math.min(1.5, v) * 100]); }
    x.save(); x.globalCompositeOperation = 'lighter'; line(q, 'rgba(255,190,110,.32)', 7); line(q, 'rgba(255,220,160,.95)', 2.2); x.restore(); line([[0, 216], [cX, 216]], 'rgba(255,220,160,.16)', 1);
    // сучасний імпульс іде над ним
    const Xp = mix(1420, -120, cl(u / 3)); line([[-20, 56], [1300, 56]], 'rgba(120,225,255,.16)', 2); pulse(Xp, 56, 6, 170);
    lab('1858', '98 слів', ez((u - .35) / .35), '255,214,160', 84);
  }
  /* 9. Наддеталь: пробій ізоляції */
  function bolt(sd, X0, Y0, X1, Y1, n, c, w) { const q = [[X0, Y0]]; for (let i = 1; i < n; i++) { const k = i / n; q.push([mix(X0, X1, k) + (hh(sd + i) - .5) * 70, mix(Y0, Y1, k) + (hh(sd + i * 3) - .5) * 44]); } q.push([X1, Y1]); line(q, c, w); }
  function s9(u) {
    const hit = 1.12, g = cl(u / hit); rect(u < hit ? vgrad(0, 720, '#23160c', '#0d0805') : '#030203'); x.save(); const sh = u > hit - .3 && u < hit + .28 ? 9 : 0; x.translate((hh(Math.floor(u * 40)) - .5) * sh, (hh(Math.floor(u * 40) + 3) - .5) * sh);
    // стінка гутаперчі й мідна жила за нею
    rect(vgrad(120, 600, '#4a3119', '#2b1b0d', '#1a1008'), 0, 120, 1280, 480); rect('#b8743a', 0, 330, 1280, 60); rect('rgba(255,225,170,.5)', 0, 337, 1280, 6);
    // тріщини ростуть із напругою
    const nc = Math.floor(g * 14); for (let i = 0; i < nc; i++) { const X = 100 + hh(i + 2) * 1080, up = i % 2 ? 1 : -1; bolt(i * 5, X, up > 0 ? 330 : 390, X + (hh(i) - .5) * 180, up > 0 ? 120 + hh(i) * 110 : 600 - hh(i) * 110, 6, `rgba(10,6,3,${.9})`, 2 + hh(i + 8) * 2.5); }
    if (g > .5) { const fl = Math.floor(u * 22); x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3 + g * 5; i++) { const X = 150 + hh(fl + i) * 980; bolt(fl * 3 + i, X, 330, X + (hh(i + fl) - .5) * 180, 130 + hh(i * 3) * 100, 7, 'rgba(160,190,255,.85)', 2.2); glow(X, 330, 70, '150,180,255', .5); } x.restore(); }
    x.restore();
    // стрілка приладу йде в червоне
    const dx = 1100, dy = 600; x.fillStyle = '#100b08'; x.beginPath(); x.arc(dx, dy, 96, Math.PI, 0); x.fill(); x.strokeStyle = 'rgba(255,230,190,.65)'; x.lineWidth = 2; x.beginPath(); x.arc(dx, dy, 96, Math.PI, 0); x.stroke(); for (let i = 0; i <= 10; i++) { const an = Math.PI + i / 10 * Math.PI; line([[dx + Math.cos(an) * 80, dy + Math.sin(an) * 80], [dx + Math.cos(an) * 94, dy + Math.sin(an) * 94]], i > 7 ? '#ff5236' : 'rgba(255,230,190,.7)', 2); } const na = Math.PI + (u < hit ? g * g * .98 : Math.max(0, .98 - (u - hit) * 2.4)) * Math.PI; line([[dx, dy], [dx + Math.cos(na) * 86, dy + Math.sin(na) * 86]], '#ff7a52', 3);
    if (u >= hit) { const q = u - hit; rect(`rgba(240,245,255,${Math.max(0, 1 - q / .22)})`); for (let i = 0; i < 36; i++) { const X = 640 + (hh(i) - .5) * 900 * eo(q / .7), Y = 360 + (hh(i + 3) - .3) * 180 + q * q * 500; disc(X, Y, 1.6, `rgba(255,190,110,${Math.max(0, 1 - q / .85)})`); } if (q > .22) tag('20 жовтня 1858', 640, 365, ez((q - .22) / .2), 'center', '255,214,160'); }
  }
  /* 10. Дно, 1866: гак ловить кінець кабелю 1865 року */
  function s10(u) {
    const off = u * 30, lift = ez((u - 1.75) / 1.25), gx = mix(1050, 590, ez(u / 1.72)), gy = u < .85 ? mix(-60, 520, ez(u / .85)) : mix(520, 70, lift);
    rect(vgrad(0, 720, '#05283b', '#03161f', '#020b10')); snow(u, 50, 13, -30, .34); ridge(460, 32, 8, off * .4, '#062431');
    x.save(); x.translate(0, lift * 90); ridge(560, 12, 2, off, '#2b3e3e', 1000); for (let i = 0; i < 24; i++) { x.fillStyle = 'rgba(70,92,90,.55)'; x.beginPath(); x.ellipse(hh(i) * 1320 + off - 20, 575 + hh(i + 2) * 100, 8 + hh(i + 3) * 26, 2 + hh(i + 4) * 7, 0, 0, 6.3); x.fill(); } x.restore();
    // кабель: лежить, коли гак чіпляє — підіймається дугою
    const q = [], hookX = gx, up = 548 - gy; for (let X = -40; X <= 900; X += 12) { const d = X - hookX, sag = lift > 0 ? Math.exp(-d * d / (82000 + lift * 240000)) : 0, Y = 548 + lift * 90 - sag * (548 + lift * 90 - gy - 56); q.push([X, Y]); }
    line(q, '#2c2a24', 16); line(q, 'rgba(190,180,150,.75)', 3); const e = q[q.length - 1];
    for (let i = 0; i < 8; i++) { const an = -1 + i * .3 + Math.sin(u + i) * .05; line([e, [e[0] + Math.cos(an) * (18 + hh(i) * 16), e[1] + Math.sin(an) * (18 + hh(i) * 16)]], '#a06c3a', 2); }
    // трос і гак на п'ять лап
    const px = gx + 10; line([[px + 200 * (1 - lift), -20], [px, gy]], 'rgba(205,205,190,.8)', 3); x.save(); x.translate(gx, gy + 12); rect('#3c4144', -5, -28, 10, 60); [-1, -.55, 0, .55, 1].forEach((k) => { x.strokeStyle = '#4b5255'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, 28); x.quadraticCurveTo(k * 58, 44, k * 52, 12); x.stroke(); }); x.restore();
    // каламуть там, де гак волочиться
    if (u > .75 && u < 2.1) for (let i = 0; i < 26; i++) { const q0 = (u * 2 + hh(i)) % 1, X = gx + 30 + q0 * 170 * (hh(i + 2) + .3), Y = 556 - q0 * 40 * hh(i + 5); disc(X, Y, 8 + q0 * 22, `rgba(120,135,120,${.17 * (1 - q0)})`); }
    lab('1866', 'понад 3 км', ez(u / .35));
    const Xp = mix(1450, -180, cl(u / 3)); line([[-20, 300], [1300, 300]], 'rgba(120,225,255,.1)', 1.5); pulse(Xp, 300, 5.5, 160);
  }
  /* 11. Знизу: «Грейт Істерн» кладе кабель */
  function s11(u) {
    const z0 = mix(1.42, 1, ez(u / 2.8)), last = ez((u - 3.2) / .4), z = z0 * mix(1, 8.5, last * last), cy = mix(mix(230, 310, ez(u / 2.8)), 210, last), cxx = mix(640, 700, last);
    rect(vgrad(0, 720, '#6fb4bd', '#14495a', '#04141d', '#010609')); x.save(); cam(z, cxx, cy, 640, 360);
    const W = 150, sh = u * 10;
    // небо крізь поверхню й щогли, тремтять
    rect(vgrad(-200, W, '#e5c6a0', '#a6c8c5'), -200, -200, 1700, W + 200);
    const wob = (Y) => Math.sin(Y * .15 + u * 5) * 2;
    const by = W; for (let i = 0; i < 6; i++) { const X = 280 + i * 158; line([[X + wob(30), by - 10], [X + wob(0), by - 140]], 'rgba(35,50,60,.55)', 4); line([[X - 28, by - 108], [X + 28, by - 108]], 'rgba(35,50,60,.45)', 2); }
    for (let i = 0; i < 5; i++) { const X = 430 + i * 110; rect('rgba(30,38,45,.6)', X - 8, by - 66, 16, 58); }
    // поверхня: срібна знизу
    rect(vgrad(W - 2, W + 26, 'rgba(240,250,250,.85)', 'rgba(170,220,225,0)'), -200, W - 2, 1700, 30);
    // промені
    x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const X = -60 + i * 110 + Math.sin(u * .5 + i * 2) * 26, w = 30 + hh(i) * 80; x.fillStyle = vgrad(W, 720, `rgba(190,240,240,${.1 + hh(i + 5) * .1})`, 'rgba(150,220,230,0)'); x.beginPath(); x.moveTo(X, W); x.lineTo(X + w, W); x.lineTo(X + w - 200, 780); x.lineTo(X - 200, 780); x.fill(); } x.restore();
    // корпус рухається наліво, заклепки дають масштаб
    x.save(); x.translate(-u * 7, 0); x.fillStyle = vgrad(W, W + 120, '#10222a', '#040b10'); x.beginPath(); x.moveTo(150, W + 2); x.quadraticCurveTo(210, W + 70, 330, W + 96); x.lineTo(1060, W + 100); x.quadraticCurveTo(1150, W + 92, 1200, W + 2); x.fill();
    for (let X = 230; X < 1140; X += 46) line([[X, W + 4], [X, W + 96]], 'rgba(150,190,200,.05)', 1.4); for (let Y = W + 18; Y < W + 96; Y += 22) line([[210, Y], [1160, Y]], 'rgba(150,190,200,.05)', 1.2);
    // гребне колесо
    const wx = 700, wy = W + 18, wr = 74; x.strokeStyle = '#0a1319'; x.lineWidth = 8; x.beginPath(); x.arc(wx, wy, wr, 0, 6.3); x.stroke(); for (let i = 0; i < 18; i++) { const an = i / 18 * 6.283 - u * 1.4, cn = Math.cos(an), sn = Math.sin(an); if (wy + sn * wr > W) { line([[wx, wy], [wx + cn * wr, wy + sn * wr]], '#0a1319', 3); line([[wx + cn * (wr - 14), wy + sn * (wr - 14)], [wx + cn * (wr + 16), wy + sn * (wr + 16)]], '#0a1319', 9, 'butt'); } }
    // гвинт і кермо
    line([[1180, W + 30], [1192, W + 92]], '#071016', 12); for (let i = 0; i < 4; i++) { const an = u * 3 + i * 1.57; line([[1148, W + 58], [1148 + Math.cos(an) * 8, W + 58 + Math.sin(an) * 40]], '#071016', 10); }
    // кабель іде з корми вниз
    const cb = [[1170, W + 80]]; for (let i = 1; i <= 16; i++) cb.push([1170 + i * 12 + Math.sin(u + i * .4) * 4 + u * 7, W + 80 + i * i * 2.1]); line(cb, '#050a0e', 7); line(cb, 'rgba(120,120,105,.4)', 1.6);
    for (let i = 0; i < 26; i++) { const q = (u * .6 + hh(i)) % 1, X = 700 + (hh(i + 3) - .5) * 120, Y = W + 90 + q * 110; disc(X, Y, 1.4 + hh(i) * 3, `rgba(235,250,250,${.5 * (1 - q) * (1 - last)})`); }
    x.restore();
    // зграя риб дає масштаб
    for (let i = 0; i < 46; i++) { const X = 150 + (hh(i) * 340) + ((u * 22) % 60) - Math.sin(u + i) * 6, Y = 420 + hh(i + 1) * 110 + Math.sin(u * 1.5 + i) * 5; x.fillStyle = 'rgba(6,18,24,.7)'; x.beginPath(); x.ellipse(X, Y, 6, 2.2, 0, 0, 6.3); x.fill(); }
    x.restore(); const a = ez((u - .3) / .4) * (1 - last); lab('', CW < 620 ? 'Great Eastern · 211 м' : 'Great Eastern · 211 м · 6 щогл · 5 труб', a);
    const Xp = mix(1450, -140, cl(u / 3.3)); line([[-20, 640], [1300, 640]], `rgba(120,225,255,${.14 * (1 - last)})`, 2); if (!last) pulse(Xp, 640, 6, 180);
  }
  /* 12. TAT-1, 36 розмов; круг гребного колеса відкривається в кадр */
  function s12(u) {
    const R = eo(u / .5) * 780; rect('#071016'); x.save(); x.beginPath(); x.arc(640, 360, Math.max(1, R), 0, 6.3); x.clip();
    rect(vgrad(0, 720, '#071f2c', '#04121a', '#02070b')); const off = u * 110; ridge(620, 22, 5, off * .5, '#0a1d24'); ridge(654, 12, 2, off, '#18282a');
    const hue = ez((u - 2.3) / .7);
    for (let i = 0; i < 36; i++) { const Y = 74 + i * 12.5, fr = .012 + i * .0012, q = []; for (let X = 0; X <= 1280; X += 7) { const env = .55 + .45 * Math.sin(X * .004 + i * 1.7 - u * 1.5), A = 4.6 * env; q.push([X, Y + Math.sin(X * fr + u * (3 + i * .2)) * A]); } const h = 300 - i * 8; line(q, hue ? `hsla(${h},${mix(10, 90, hue)}%,${mix(78, 62, hue)}%,.78)` : 'rgba(210,225,225,.72)', 1.3); }
    // кабель 1956 року з гнучкими підсилювачами
    const y0 = 588; rect(vgrad(y0 - 14, y0 + 14, '#3b4042', '#090b0c'), -40, y0 - 14, 1400, 28); for (let k = 0; k < 4; k++) { const X = ((k * 420 + off) % 1680) - 200; x.fillStyle = vgrad(y0 - 24, y0 + 24, '#4e5759', '#101415'); x.beginPath(); x.roundRect(X - 88, y0 - 24, 176, 48, 24); x.fill(); line([[X - 88, y0 - 24], [X - 88, y0 + 24]], 'rgba(255,255,255,.14)', 2); }
    lab('1956', '36 каналів · 51 підсилювач', ez((u - .2) / .4));
    const Xp = mix(1450, -160, cl(u / 2.9)); x.save(); x.globalCompositeOperation = 'lighter'; rect('rgba(120,225,255,.06)', Xp, 74, 1500, 450); x.restore(); pulse(Xp, 298, 10, 360); x.restore();
  }
  /* 13. Волокно й десятки кольорів */
  function s13(u) {
    const z = mix(1, 1.22, ez(u / 2.2)); rect('#020509'); x.save(); cam(z, 640, 360);
    rect(vgrad(90, 630, '#071822', '#0b2a38', '#071822'), -100, 90, 1500, 540); rect('rgba(170,235,255,.5)', -100, 90, 1500, 2); rect('rgba(170,235,255,.5)', -100, 628, 1500, 2);
    x.save(); x.globalCompositeOperation = 'lighter'; const n = 40; for (let i = 0; i < n; i++) { const Y = 112 + i * (496 / (n - 1)), h = 280 - i / (n - 1) * 280, c = `hsl(${h},95%,62%)`; rect(`hsla(${h},95%,58%,.1)`, -100, Y - 3, 1500, 6); const sp = 360 + hh(i) * 230, per = 90 + hh(i + 3) * 170; for (let X = -((u * sp + hh(i + 7) * 400) % per) - per; X < 1400 + per; X += per) { const w = per * (.25 + hh(i * 3 + Math.floor((X + 9000) / per)) * .5); x.fillStyle = c; x.fillRect(X, Y - 1.5, w, 3); } } x.restore();
    x.restore();
    // призма-роздільник у правій третині: один білий промінь стає кольорами
    const k = ez(u / .7); x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = `rgba(255,255,255,${.5 * (1 - k)})`; x.fillRect(0, 352, 1280, 16); x.restore();
    const Xp = mix(1450, -160, cl(u / 2.1)); pulse(Xp, 360, 11, 300);
    const a = ez((u - .25) / .3); rrect(36, 34, 356, 42, 8); x.fillStyle = `rgba(2,6,10,${.72 * a})`; x.fill(); tag('сьогодні: понад 100 Тбіт/с', 50, 62, a);
  }
  /* 14. Широкий, найшвидший: безодня, спалах кожні 70 км */
  function s14(u) {
    const off = -u * 2200; rect(vgrad(0, 720, '#020b13', '#01060b', '#000204'));
    ridge(390, 150, 6, off * .08, '#061823'); ridge(470, 110, 2, off * .2, '#08202a'); ridge(585, 60, 9, off * .55, '#0d2830');
    x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { const d = .3 + hh(i) * .7, X = ((hh(i * 2) * 1500 + u * 3200 * d) % 1500) - 110, Y = hh(i * 3) * 600 + 30; rect(`rgba(170,225,235,${.1 + d * .18})`, X, Y, 40 + d * 180, 1 + d); } x.restore();
    ridge(655, 18, 4, off, '#16282b');
    const y0 = 634; line([[-20, y0], [1300, y0]], '#091214', 8); line([[-20, y0], [1300, y0]], 'rgba(120,225,255,.36)', 1.6);
    const per = 300, ph = (u * 2200) % per; for (let k = -1; k < 6; k++) { const X = ph + k * per, dd = Math.abs(X - 380), b = Math.exp(-dd * dd / 9000); x.fillStyle = vgrad(y0 - 18, y0 + 18, '#576368', '#0d1416'); rrect(X - 44, y0 - 18, 88, 36, 18); x.fill(); x.save(); x.globalCompositeOperation = 'lighter'; glow(X, y0, 80 + b * 420, '255,170,90', .12 + b * .85); glow(X, y0, 60 + b * 230, '130,235,255', b * .7); x.restore(); }
    pulse(380, y0, 10, 620); tag('70 км', 44, 74, ez(u / .25)); txt('× ' + Math.round(P.sea / P.spacing), 44, 122, 34, 'rgba(205,232,240,.95)', 'left', 700);
  }
  /* 15. Банка Ньюфаундленд, 1929: каламутний потік рве кабелі за реальним графіком */
  const GB = D.gb.seq, GX = (d) => 1090 - d / 294 * 930;
  const BED = (X) => mix(250, 560, ez((1190 - X) / 1120)) + Math.sin(X * .03) * 4 + Math.sin(X * .11) * 1.6;
  function s15(u) {
    const clk = ez((u - .35) / 4.2), mins = 797 * Math.pow(clk, 1.7); let idx = 0; while (idx < GB.length - 1 && GB[idx + 1].m <= mins) idx++;
    // положення фронту між датованими обривами
    const a = GB[idx], b = GB[Math.min(idx + 1, GB.length - 1)], fd = mins < a.m ? a.d * 0 : mix(a.d, b.d, b.m > a.m ? cl((mins - a.m) / (b.m - a.m)) : 0), fx = mins < GB[0].m ? mix(1230, GX(0), mins / GB[0].m) : GX(fd);
    const zm = ez((u - 4.8) / 1.2), z = mix(1, 3.8, zm * zm); rect(vgrad(0, 720, '#072130', '#031019', '#010508')); snow(u, 44, 15, 12, .25); x.save(); cam(z, mix(640, GX(294) + 40, zm), mix(360, BED(GX(294)) - 40, zm));
    // шари глибини
    x.fillStyle = vgrad(100, 720, '#2f3b37', '#141a18', '#0a0d0c'); x.beginPath(); x.moveTo(-100, 800); for (let X = -100; X <= 1400; X += 10) x.lineTo(X, BED(X)); x.lineTo(1400, 800); x.fill();
    [28, 62, 106].forEach((o, i) => { const q = []; for (let X = -100; X <= 1400; X += 18) q.push([X, BED(X) + o + Math.sin(X * .02 + i) * 6]); line(q, 'rgba(255,255,255,.04)', 2); });
    // кабелі в перерізі: кільця на схилі
    GB.forEach((g, i) => { const X = GX(g.d), Y = BED(X) - 8, cut = mins >= g.m, s = cut ? u - (.35 + 4.2 * Math.pow(g.m / 797, 1 / 1.7) * 1) : 0; if (!cut) { disc(X, Y, 8, '#0e1214'); disc(X, Y, 3.4, '#d0955a'); } else { const o = Math.min(26, 4 + s * 60); disc(X - o, Y + 2, 7, '#0e1214'); disc(X - o, Y + 2, 2.8, '#d0955a'); disc(X + o * .7, Y + 2, 7, '#0e1214'); disc(X + o * .7, Y + 2, 2.8, '#d0955a'); if (s < .45) { x.save(); x.globalCompositeOperation = 'lighter'; glow(X, Y, 90 * (1 - s * 2), '255,190,100', 1 - s * 2); x.restore(); } } });
    // мул: хмара йде за фронтом
    for (let i = 0; i < 210; i++) { const fr = hh(i + 9), X = fx + fr * fr * 980 + (hh(i + 2) - .5) * 26, base = BED(Math.min(1250, X)), hb = (28 + hh(i + 4) * 74) * (1 - fr * .45), Y = base - hh(i + 5) * hb + Math.sin(u * 2 + i) * 3, r = (12 + hh(i + 6) * 32) * (1 - fr * .5); if (X < 1320) { x.fillStyle = `rgba(${140 + hh(i) * 30},${118 + hh(i) * 22},${88},${(.09 + hh(i + 7) * .11) * (1 - fr * .7)})`; x.beginPath(); x.arc(X, Y, r, 0, 6.3); x.fill(); } }
    // сьогоднішній кабель лежить поруч
    const lp = []; for (let X = -100; X <= 1400; X += 16) lp.push([X, BED(X) - 26]); line(lp, 'rgba(120,225,255,.25)', 1.8); const Xp = mix(1380, -40, cl(u / 5.4)); pulse(Xp, BED(Xp) - 26, 6, 150, Math.atan2(BED(Xp) - BED(Xp + 30), -30) + Math.PI);
    // епіцентр: тремтіння і спалах ліворуч від шельфу
    if (u < .9) { x.save(); x.globalCompositeOperation = 'lighter'; glow(1190, 255, 170, '255,170,110', .85 * (1 - u / .9)); x.restore(); }
    GB.forEach((g, i) => { if (mins < g.m) return; const X = GX(g.d), Y = BED(X) - 54 - (i === 3 ? 56 : 0) - (i === 4 ? 0 : 0), a2 = ez((mins - g.m) / 45) * (1 - zm); line([[X, BED(X) - 18], [X, Y + 6]], `rgba(255,214,160,${.5 * a2})`, 1); txt(g.m + ' хв', X, Y - 19, 17, `rgba(255,226,180,${a2})`, 'center', 700); txt(g.v + ' вузлів', X, Y, 14, `rgba(255,226,180,${a2 * .8})`, 'center', 500); });
    x.restore();
    // мул заливає кадр на стику
    if (zm > .55) rect(`rgba(110,92,70,${ez((zm - .55) / .45)})`);
    // годинник
    const ca = 1 - zm; x.save(); x.globalAlpha = ca; x.translate(102, 118); disc(0, 0, 58, 'rgba(4,12,18,.8)'); x.strokeStyle = 'rgba(220,235,235,.75)'; x.lineWidth = 2.5; x.beginPath(); x.arc(0, 0, 58, 0, 6.3); x.stroke(); for (let i = 0; i < 12; i++) { const an = i * .5236; line([[Math.cos(an) * 48, Math.sin(an) * 48], [Math.cos(an) * 55, Math.sin(an) * 55]], 'rgba(220,235,235,.6)', 2); } const mh = mins / 60 * 6.2832 - 1.5708, hd = mins / 720 * 6.2832 - 1.5708; line([[0, 0], [Math.cos(hd) * 30, Math.sin(hd) * 30]], '#fff', 4); line([[0, 0], [Math.cos(mh) * 46, Math.sin(mh) * 46]], '#ffd9a8', 2.4); x.restore();
    if (ca > .01) { const H = Math.floor(mins / 60), M = Math.floor(mins % 60); tag(`${H} год ${M} хв`, 178, 112, ca); tag('після поштовху', 178, 140, ca * .75); }
    lab('1929', '12 кабелів', ez((u - .1) / .3) * ca, '255,226,180', 190);
  }
  /* 16. Від'їзд: увесь світ, кабелі ростуть за роками */
  const WX = (lo) => (lo + 180) * 3.5556, WY = (la) => (80 - la) * 3.5556 + 66, WP = (lo, la) => [WX(lo), WY(la)];
  const ALLC = D.history.map((h) => [h.y, h.l]).concat(G.cables.filter((c) => !c[1]).map((c) => [c[0], c[4]])).sort((a, b) => a[0] - b[0]);
  const HAV = G.cables.find((c) => /Havfrue/.test(c[3]));
  const HAVP = HAV ? HAV[4][1].map((c) => WP(c[0], c[1])).reverse() : [WP(8, 56), WP(-74, 40)];
  function s16(u) {
    const out = ez((u - .15) / 1.5), inn = ez((u - 3.45) / .95), year = Math.round(mix(1851, 2026, ez((u - .15) / 3.2)));
    const NJ = WP(-74, 40.2), ST = WP(-30, 50);
    const z0 = mix(5.2, 1, out), z = z0 * mix(1, 11, inn * inn), cxx = mix(mix(ST[0], 640, out), NJ[0], inn), cyy = mix(mix(ST[1], 340, out), NJ[1], inn);
    rect('#030a12'); x.save(); cam(z, cxx, cyy); const lw = 1 / z;
    landpath(WP); x.fillStyle = '#16232c'; x.fill(); x.strokeStyle = 'rgba(150,215,230,.32)'; x.lineWidth = lw * 1; x.stroke();
    x.save(); x.globalCompositeOperation = 'lighter';
    [[0, 'rgba(100,215,245,.32)'], [1, 'rgba(255,225,160,.95)']].forEach((b) => { x.beginPath(); ALLC.forEach((c) => { const fresh = year - c[0] <= 5; if (c[0] > year || (b[0] ? !fresh : fresh)) return; c[1].forEach((seg) => seg.forEach((q, i) => { const X = WX(q[0]), Y = WY(q[1]); i ? x.lineTo(X, Y) : x.moveTo(X, Y); })); }); x.strokeStyle = b[1]; x.lineWidth = lw * (b[0] ? 1.5 : 1); x.stroke(); });
    x.restore();
    // наш кабель і наш імпульс
    line(HAVP.slice().reverse(), 'rgba(190,245,255,.75)', lw * 1.8); const q = at(HAVP, 1 - mix(.42, 0, ez(u / 4.3))); x.save(); x.scale(1, 1); pulse(q[0], q[1], 6 * lw, 0); x.restore();
    x.restore();
    txt(String(year), 44, 116, 74, `rgba(235,246,248,${.95 * (1 - inn)})`, 'left', 700);
    // мул розчиняється в карту
    if (u < .55) rect(`rgba(110,92,70,${1 - ez(u / .55)})`);
  }
  /* 17. З води на берег: Волл, каналізаційний люк, стійка */
  function s17(u) {
    const p = u / 3.4, camx = mix(1750, 450, ez(p)), W = 340; rect('#02060c'); x.save(); x.translate(640 - camx, 0);
    // небо, Мангеттен далеко
    rect(vgrad(0, W, '#0a1224', '#1a2a4a', '#3c3752'), camx - 700, 0, 1400, W); for (let i = 0; i < 70; i++) disc(camx - 700 + hh(i) * 1400, hh(i + 2) * 220, .7, `rgba(255,255,255,${.2 + hh(i + 5) * .5})`);
    x.save(); x.translate(camx * .72 - 260, 0); for (let i = 0; i < 44; i++) { const X = -60 + i * 17, h = 22 + hh(i + 2) * 74; rect('#0f1626', X, W - 26 - h, 14, h); for (let k = 0; k < 7; k++) if (hh(i + k * 9) > .5) rect('rgba(255,210,140,.85)', X + 2 + hh(k + i) * 9, W - 30 - hh(i * k + 2) * (h - 8), 2, 2); } x.restore();
    // вода праворуч, суша ліворуч
    rect(vgrad(W, 720, '#0d4254', '#04202d', '#010a11'), 1320, W, 2000, 400);
    for (let k = 0; k < 7; k++) { const q = []; for (let X = 1320; X <= 3000; X += 20) q.push([X, W + k * 3 + Math.sin(X * .025 + u * 2.6 + k) * 2.4]); line(q, `rgba(180,215,235,${.36 - k * .04})`, 1.4); }
    // прибій
    for (let i = 0; i < 22; i++) { const X = 1300 + hh(i) * 120 + Math.sin(u * 1.4 + i) * 16; disc(X, W + 2 + hh(i + 3) * 8, 3 + hh(i + 2) * 7, 'rgba(235,245,250,.5)'); }
    // пісок/ґрунт, профіль берега
    const prof = [[-200, W - 34], [1160, W - 34], [1320, W + 4], [1560, W + 84], [1900, W + 210], [2400, W + 340], [3000, W + 380]];
    x.fillStyle = vgrad(W - 34, 720, '#6d5f49', '#2a221a', '#0d0a07'); x.beginPath(); x.moveTo(-200, 800); prof.forEach((c) => x.lineTo(c[0], c[1])); x.lineTo(3000, 800); x.fill();
    for (let i = 0; i < 200; i++) { const X = -200 + hh(i) * 2600, Y = W + hh(i + 2) * 380; disc(X, Y, 1 + hh(i + 3) * 2, 'rgba(0,0,0,.16)'); }
    // дощатий настил, люк
    rect('#3b2e22', 1090, W - 48, 210, 8); for (let X = 1100; X < 1300; X += 42) rect('#231a13', X, W - 40, 6, 12);
    rect('#2a2d31', 960, W - 38, 92, 6); rect('#14171a', 985, W - 34, 42, 170); rect('#23272b', 985, W + 130, 42, 8); line([[1006, W - 36], [1006, W + 130]], 'rgba(255,255,255,.07)', 1);
    tag('люк', 1006, W - 56, ez((p - .3) * 7) * (1 - ez((p - .62) * 8)), 'center');
    // будівля станції, вирізана стіна, стійки
    x.fillStyle = '#0f151b'; x.fillRect(120, W - 214, 700, 180); x.fillStyle = '#080c10'; x.fillRect(150, W - 190, 640, 150);
    for (let r = 0; r < 7; r++) { const X = 170 + r * 88; rect('#14191f', X, W - 184, 74, 138); for (let i = 0; i < 16; i++) { const Y = W - 176 + i * 8, on = Math.floor(hh(r * 3 + i) * 9 + u * (5 + hh(i) * 8)) % 3 !== 0; rect(on ? (hh(i + r) > .75 ? '#ffb26a' : '#6de9ff') : '#1c2a30', X + 8 + (i % 3) * 6, Y, 4, 3); rect('rgba(255,255,255,.05)', X + 30, Y, 36, 3); } }
    x.save(); x.globalCompositeOperation = 'lighter'; glow(470, W - 110, 330, '110,220,255', .13); x.restore();
    tag('станція у Воллі', 470, W - 228, ez((p - .5) * 8), 'center');
    // кабель
    const path = [[2250, W + 300], [1900, W + 222], [1560, W + 96], [1320, W + 24], [1160, W + 70], [1006, W + 96], [1006, W + 30], [980, W - 8], [800, W - 12], [650, W - 40], [650, W - 100], [430, W - 100]];
    line(path, '#090e11', 7); line(path, 'rgba(90,205,230,.6)', 2);
    const q = at(path, ez(p * .96) * .998); pulse(q[0], q[1], 7, 100, q[2]);
    x.restore();
    tag('Волл, Нью-Джерсі', 44, 74, ez(u / .4) * (1 - ez((u - 2.5) / .4)));
  }
  /* 18. Нью-Йорк: екран спалахує, фінальне число, назва */
  function s18(u) {
    rect(vgrad(0, 720, '#0a1120', '#14151f', '#191311')); bokeh(u, 22, '255,205,130', '120,190,255', 40, .42);
    // вікна Мангеттена за кадром: стіна дрібних вогнів
    for (let i = 0; i < 120; i++) rect(`rgba(255,215,150,${.08 + hh(i) * .22})`, hh(i + 3) * 1280, hh(i + 5) * 420 + 10, 3, 5);
    const lit = ez((u - .35) / .35), Xp = mix(1380, 912, cl(u / .42));
    if (u < .48) { line([[1300, 416], [1090, 416]], 'rgba(120,225,255,.4)', 2); pulse(Xp, 416, 8, 170); }
    x.save(); x.globalAlpha = 1; const nar = CW < 620; phone(nar ? 1030 : 900, 370, 330, 620, { rot: .03, ava: '#4ba0d9', who: 'Гданськ', bub: ez((u - .42) / .25), mine: false, by: -60, status: u > 1.05 ? 'доставлено' : '' }); x.restore();
    x.save(); x.globalCompositeOperation = 'lighter'; glow(nar ? 1030 : 900, 370, 460, '120,215,245', .28 * lit + .16 * lit * Math.exp(-Math.max(0, u - .42) * 2.8) * 2); x.restore();
    const k = ez((u - 1.2) / .55), v = mix(END - .9, END, eo((u - 1.1) / .6));
    const yN = nar ? 226 : 330, yS = yN + FS(20) + 22;
    x.font = `800 ${nar ? 112 : 92}px ${SANS}`; x.textAlign = 'left'; x.fillStyle = `rgba(255,255,255,${k})`; x.fillText(f(u > 1.1 ? v : END - .9) + ' мс', 64, yN);
    txt('Гданськ → Нью-Йорк, теоретично', 66, yS, 20, `rgba(160,235,250,${k})`);
    txt(`${P.land + P.sea + P.city} км · ${f(V, 0)} км/с`, 66, yS + FS(18) + 12, 18, `rgba(210,225,230,${k * .85})`);
    const a2 = ez((u - 2.5) / .6); x.font = `800 ${nar ? 66 : 56}px ${SANS}`; x.fillStyle = `rgba(255,255,255,${a2})`; x.fillText('43 мілісекунди', 64, nar ? 104 : 192);
    if (!nar) tag('гортайте нижче: кожен відрізок можна розібрати', 66, 462, ez((u - 3.4) / .5) * .9);
  }
  const FN = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18];
  // скільки мс і км пролетів імпульс до моменту t
  function clock(t) { if (t < 3) return 0; if (t < 12.8) return mix(0, LAND, (t - 3) / 9.8); if (t < 50.6) return mix(LAND, LAND + SEA, (t - 12.8) / 37.8); return mix(LAND + SEA, END, cl((t - 50.6) / 3.6)); }
  let capNow = null, segNow = -1;
  function draw(t) {
    x.setTransform(SC, 0, 0, SC, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    let i = SH.findIndex((s) => t < s[1]); if (i < 0) i = SH.length - 1; const s = SH[i], u = t - s[0];
    x.save(); FN[i](u); x.restore(); x.setLineDash([]);
    // виньєтка й полоси
    const g = x.createRadialGradient(640, 360, 300, 640, 360, 820); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); rect(g); rect('#000', 0, 0, 1280, 22); rect('#000', 0, 698, 1280, 22);
    // лічильник: у кожному кадрі, поки не стане головним числом
    if (t >= 2.9 && i < 17) { const ms = clock(t), km = ms / 1000 * V; const bw = Math.max(236, FS(13) * 13.5); rrect(1248 - bw, 34, bw, FS(32) + FS(13) + 40, 10); x.fillStyle = 'rgba(2,8,12,.62)'; x.fill(); txt(f(ms) + ' мс', 1234, 42 + FS(32), 32, '#fff', 'right', 700); txt(`${Math.round(km)} км · теоретично`, 1234, 52 + FS(32) + FS(13), 13, 'rgba(170,230,245,.9)', 'right', 500); }
    if (capNow !== s[2]) { capNow = s[2]; cap.textContent = s[2]; }
    head.style.left = (t / TOTAL * 100) + '%'; tm.textContent = `0:${String(Math.floor(t)).padStart(2, '0')} / 0:59`;
    let c = CH.findIndex((q) => t < q[2]); if (c < 0) c = CH.length - 1; if (c !== segNow) { segNow = c; segs.forEach((e, q) => e.classList.toggle('on', q === c)); }
  }
  // звукові події плану (лише якщо звук статті ввімкнено)
  const CUES = [[2.7, 'send'], [12.8, 'whoosh'], [20.15, 'blip'], [21.4, 'morse'], [25.52, 'zap'], [28.15, 'thud'], [41, 'snap'], [42.3, 'snap'], [43.5, 'snap'], [44, 'snap'], [44.8, 'snap'], [54.45, 'chord']];
  let t = 0, playing = false, raf = 0, last = 0;
  function loop(now) { const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; const t0 = t; t += dt;
    if (t >= TOTAL) { t = TOTAL; pause(); draw(t - .001); return; }
    CUES.forEach((c) => { if (t0 < c[0] && t >= c[0]) SND(c[1]); });
    draw(t); raf = playing ? requestAnimationFrame(loop) : 0; }
  function play() { if (t >= TOTAL - .01) t = 0; playing = true; cover.hidden = true; pp.textContent = '❚❚'; pp.classList.add('on'); last = 0; TRK(true, t); if (!raf) raf = requestAnimationFrame(loop); }
  function pause() { playing = false; cancelAnimationFrame(raf); raf = 0; pp.textContent = '▶'; pp.classList.remove('on'); TRK(false); }
  cover.addEventListener('click', play);
  pp.addEventListener('click', () => { playing ? pause() : play(); });
  trk.addEventListener('click', (e) => { const r = trk.getBoundingClientRect(); t = Math.max(0, Math.min(TOTAL - .01, (e.clientX - r.left) / r.width * TOTAL)); cover.hidden = true; if (playing) TRK(true, t); draw(t); });
  cv.addEventListener('click', () => { if (!cover.hidden) return; playing ? pause() : play(); });
  addEventListener('oc-sound', (e) => { if (playing) TRK(e.detail.on, t); });
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && playing) pause(); }, { threshold: .2 }).observe(box);
  new ResizeObserver(() => { size(); draw(t); }).observe(cv);
  size(); draw(REDUCE ? 58 : 17.4); t = 0;
  window.__ocReel = { total: TOTAL, end: END, seek: (tt) => new Promise((ok) => { t = tt; draw(t); requestAnimationFrame(() => ok()); }) };
})();
