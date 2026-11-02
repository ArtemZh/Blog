/* Стаття 39, розділ 02: «Грейт Істерн» у поздовжньому розрізі, кодом. Довжина й висота в одному масштабі (211 м, 5,3 пікселя на метр); щогли й труби — силует.
   За джерелом (W. H. Russell, The Atlantic Telegraph, 1865): три резервуари, їхні розміри й місткість, шлях кабелю, вантаж. За популярними описами: колесо, гвинт, 0,86 м, 19 відсіків.
   Положення машин і котлів уздовж корпусу — реконструкція, намальована пунктиром. Кадр залежить лише від стану: вибраний елемент і частка прокладеного кабелю. */
(function () {
  const slot = document.getElementById('oc-shipcut'); if (!slot) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches, MONO = '"Roboto Mono", ui-monospace, monospace';
  const VW = 1280, VH = 426, M = 5.3, XB = 82, DK = 190, KEEL = DK + 17.7 * M, WL = DK + 8.6 * M;   // один масштаб: глибина корпусу 17,7 м, осадка з вантажем 9,1 м
  const X = (m) => XB + m * M, Y1 = (m) => m * M;
  const G = [['cable', 'Кабель'], ['drive', 'Хід'], ['hull', 'Корпус']];
  // id, група, номер, підпис, x0, x1 (м від носа), y0, y1 (пікселі), реконструкція, текст
  const TK = [
    { id: 'tF', a: 28, ft: '51 фут 6 дюймів', mi: 693, w: 15.7 }, { id: 'tM', a: 96, ft: '58 футів 6 дюймів', mi: 899, w: 17.8 }, { id: 'tA', a: 174, ft: '58 футів', mi: 898, w: 17.7 }
  ];
  const TY1 = KEEL - Y1(1.7), TY0 = TY1 - Y1(6.25);
  const EL = [
    { id: 'tF', g: 'cable', t: 'Носовий резервуар', r: [28, 43.7, TY0, TY1], lab: 1, d: '51 фут 6 дюймів у діаметрі, 20 футів 6 дюймів заввишки: 693 милі кабелю. Кабель лежав витками під водою, а щодня його перевіряли струмом.' },
    { id: 'tM', g: 'cable', t: 'Середній резервуар', r: [96, 113.8, TY0, TY1], lab: 1, d: '58 футів 6 дюймів упоперек, 899 миль. Стояв майже посередині корабля.' },
    { id: 'tA', g: 'cable', t: 'Кормовий резервуар', r: [174, 191.7, TY0, TY1], lab: 1, d: '58 футів упоперек, 898 миль. Разом три резервуари вміщували 2490 миль кабелю 1865 року.' },
    { id: 'tr', g: 'cable', t: 'Жолоб на палубі', r: [40, 196, DK - 8, DK + 2], d: 'Із трюму кабель піднімався на легке колесо й ішов залізним жолобом по палубі до корми, через напрямні колеса.' },
    { id: 'pay', g: 'cable', t: 'Механізм витравлювання', r: [191, 205, DK - 18, DK - 3], lab: 1, d: 'Шість V-подібних коліс і притискні колеса тримали кабель натягнутим. Далі барабан діаметром 6 футів із гальмами Еппольда, вони працювали у воді. Занадто слабке гальмо — кабель тікає, занадто сильне — рветься.' },
    { id: 'dyn', g: 'cable', t: 'Динамометр', r: [205, 210, DK - 18, DK - 3], d: 'Стояв між барабаном і кормовим колесом та показував натяг кабелю. За цим числом стежили цілодобово: кабель 1865 року рвався приблизно від 7 тонн.' },
    { id: 'pick', g: 'cable', t: 'Механізм підйому на носі', r: [3, 15, DK - 18, DK - 3], lab: 1, d: 'Ним кабель піднімали назад на борт, коли знаходили несправність, а 1866 року тягнули гак із кінцем кабелю 1865-го.' },
    { id: 'wh', g: 'drive', t: 'Гребне колесо', r: [78.5, 95.5, DK - Y1(6), DK - 4], lab: 1, d: '17 метрів у діаметрі, по одному з кожного борту. Колеса дають змогу майже зупинитися й розвернутися, що важливо, коли за кормою кабель.' },
    { id: 'pe', g: 'drive', t: 'Машини коліс', re: 1, r: [80, 94, KEEL - 96, KEEL - 18], d: 'Чотири парові циліндри гребних коліс. Положення намальоване приблизно, це реконструкція.' },
    { id: 'bo', g: 'drive', t: 'Котли', re: 1, r: [52, 78, KEEL - 96, KEEL - 18], r2: [116, 156, KEEL - 96, KEEL - 18], lab: 1, d: 'Десять котлів і 112 топок. Положення намальоване приблизно, це реконструкція.' },
    { id: 'co', g: 'drive', t: 'Вугілля', re: 1, r: [48, 52, KEEL - 96, KEEL - 18], r2: [156, 160, KEEL - 96, KEEL - 18], d: 'Лежало навколо й над котлами. На початку експедиції 1865 року на борту було 8500 тонн вугілля.' },
    { id: 'se', g: 'drive', t: 'Машина гвинта', re: 1, r: [160, 172, KEEL - 96, KEEL - 18], d: 'Окрема машина для гвинта. Її циліндри мали 7 футів у діаметрі. Положення намальоване приблизно.' },
    { id: 'sc', g: 'drive', t: 'Гвинт', r: [199, 211, KEEL - Y1(8.2), KEEL - Y1(.8)], lab: 1, d: 'Чотири лопаті, 7,3 метра в діаметрі. Працював разом із гребними колесами.' },
    { id: 'dh', g: 'hull', t: 'Подвійний корпус', r: [18, 186, KEEL - 6, KEEL + 1], lab: 1, d: 'Дві залізні обшивки з проміжком 0,86 метра. Наступні кораблі з таким рішенням зʼявилися через сто років.' },
    { id: 'bh', g: 'hull', t: 'Перебірки', re: 1, r: [46, 47.5, DK + 3, KEEL - 6], d: 'Перебірки ділили корпус на 19 відсіків. Лінії на схемі показують принцип, а не кожну перебірку.' },
    { id: 'sca', g: 'hull', t: 'Людина і шлюпка', r: [120, 133, DK - 18, DK], d: 'Для масштабу. Людина й шлюпка намальовані в тому самому масштабі, що й корабель.' }
  ];
  // підписи на полотні: де стоїть текст; на вузькому екрані лишаються номери, а назви — у кнопках
  const LB = { pick: [14, 118, 'left'], wh: [87, 112, 'center'], pay: [205, 118, 'right'], tF: [36, 318, 'center'], bo: [65, 342, 'center'], pe: [87, 318, 'center'], tM: [105, 366, 'center'], dh: [136, 318, 'center'], co: [158, 366, 'center'], se: [166, 342, 'center'], tA: [183, 318, 'center'], sc: [205, 366, 'right'] };
  EL.forEach((e, i) => { e.n = i + 1; });
  const box = document.createElement('div'); box.className = 'oc-cut';
  box.innerHTML = `<canvas aria-label="Поздовжній розріз корабля «Грейт Істерн»"></canvas>
    <div class="oc-cut__bar"><button type="button" class="rc-btn oc-glow" data-go>▶ Прокласти</button><button type="button" class="rc-btn" data-re>↺</button>${G.map((g) => `<button type="button" class="rc-btn" data-g="${g[0]}">${g[1]}</button>`).join('')}</div>
    <div class="oc-cut__nums">${EL.map((e) => `<button type="button" data-e="${e.id}" title="${e.t}">${e.n}<span>${e.t}</span></button>`).join('')}</div>
    <p class="oc-cut__card" aria-live="polite"></p>
    <p class="oc-cut__leg"><i class="s"></i>за джерелами<i class="d"></i>положення приблизне<span>довжина й висота в одному масштабі, щогли й труби — силует</span></p>`;
  slot.appendChild(box);
  const cv = box.querySelector('canvas'), x = cv.getContext('2d'), card = box.querySelector('.oc-cut__card'), go = box.querySelector('[data-go]'), nums = [...box.querySelectorAll('[data-e]')], gbtn = [...box.querySelectorAll('[data-g]')];
  let CW = 1, SC = 1, sel = null, grp = null, p = 0, playing = false, raf = 0, last = 0, seen = false;
  const hh = (n) => { const v = Math.sin(n * 91.7 + 17.3) * 43758.5453; return v - Math.floor(v); }, cl = (v) => Math.max(0, Math.min(1, v));
  const fmt = (v) => Math.round(v).toLocaleString('uk-UA');
  function size() { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); CW = r.width || 1; cv.width = Math.round(CW * d); cv.height = Math.round(CW * d * VH / VW); SC = cv.width / VW; }
  const FS = (n) => n * Math.max(1, 640 / CW);
  function txt(s, X0, Y0, n, c, al = 'left', w = 600) { x.font = `${w} ${FS(n)}px ${MONO}`; x.textAlign = al; x.fillStyle = c; x.fillText(s, X0, Y0); }
  // частка кабелю, що лишилась у резервуарі: першим порожніє кормовий, далі середній, носовий
  const left = () => { const mi = p * 2490, a = cl(1 - mi / 898), m = cl(1 - (mi - 898) / 899), f = cl(1 - (mi - 1797) / 693); return { tA: a, tM: m, tF: f }; };
  const on = (e) => (!sel && !grp) || sel === e.id || (!sel && grp === e.g);
  const alpha = (e) => (on(e) ? 1 : .34);
  function hullPath(dy) { x.beginPath(); x.moveTo(X(0), DK + dy); x.lineTo(X(211), DK + dy); x.quadraticCurveTo(X(212), DK + 35 + dy, X(198), KEEL - 28 + dy); x.lineTo(X(190), KEEL + dy); x.lineTo(X(24), KEEL + dy); x.quadraticCurveTo(X(5), KEEL - 8 + dy, X(0), DK + dy); x.closePath(); }
  function box2(e, r, fill, stroke) { const X0 = X(r[0]), w = X(r[1]) - X0, h = r[3] - r[2]; x.fillStyle = fill; x.fillRect(X0, r[2], w, h); x.strokeStyle = stroke; x.lineWidth = 2; if (e.re) x.setLineDash([7, 5]); x.strokeRect(X0, r[2], w, h); x.setLineDash([]); }
  function draw(t) {
    x.setTransform(SC, 0, 0, SC, 0, 0);
    const L = left(), rise = -p * 4;   // скільки піднімається корпус: умовно, не вимір
    let g = x.createLinearGradient(0, 0, 0, WL); g.addColorStop(0, '#0d2036'); g.addColorStop(1, '#6b7f8f'); x.fillStyle = g; x.fillRect(0, 0, VW, WL);
    g = x.createLinearGradient(0, WL, 0, VH); g.addColorStop(0, '#0e5166'); g.addColorStop(1, '#021019'); x.fillStyle = g; x.fillRect(0, WL, VW, VH - WL);
    x.save(); x.translate(0, rise);
    // щогли й труби: лише силует
    x.globalAlpha = .55; for (let i = 0; i < 6; i++) { const X0 = X(22 + i * 33); x.strokeStyle = '#0a141d'; x.lineWidth = 3; x.beginPath(); x.moveTo(X0, DK); x.lineTo(X0, DK - Y1(28)); x.moveTo(X0 - 24, DK - Y1(23)); x.lineTo(X0 + 24, DK - Y1(23)); x.stroke(); }
    [58, 72, 124, 138, 152].forEach((m) => { x.fillStyle = '#0a141d'; x.fillRect(X(m) - 7, DK - Y1(15), 14, Y1(15)); }); x.globalAlpha = 1;
    // корпус
    hullPath(0); x.fillStyle = '#16222b'; x.fill();
    x.save(); hullPath(0); x.clip();
    // подвійне дно
    let e = EL.find((q) => q.id === 'dh'); x.globalAlpha = alpha(e); x.fillStyle = '#2d414d'; x.fillRect(X(0), KEEL - 5, X(211) - X(0), 5); for (let m = 2; m < 211; m += 2) { x.fillStyle = '#121c23'; x.fillRect(X(m), KEEL - 5, 1.4, 5); } x.globalAlpha = 1;
    // палуби й перебірки
    x.strokeStyle = 'rgba(190,215,225,.16)'; x.lineWidth = 1.4; [DK + 17, DK + 35].forEach((Y) => { x.beginPath(); x.moveTo(X(0), Y); x.lineTo(X(211), Y); x.stroke(); });
    e = EL.find((q) => q.id === 'bh'); x.globalAlpha = alpha(e); x.setLineDash([5, 6]); x.strokeStyle = 'rgba(190,215,225,.42)'; [13, 26, 46, 80, 96, 115, 136, 158, 173, 193].forEach((m) => { x.beginPath(); x.moveTo(X(m), DK + 2); x.lineTo(X(m), KEEL - 5); x.stroke(); }); x.setLineDash([]); x.globalAlpha = 1;
    x.restore();
    // машини й котли
    const dr = (id, f, s) => { const q = EL.find((a) => a.id === id); x.globalAlpha = alpha(q); box2(q, q.r, f, s); if (q.r2) box2(q, q.r2, f, s); x.globalAlpha = 1; return q; };
    dr('co', '#1b1a18', '#7c7464'); const bo = dr('bo', '#3a2a22', '#c98b5a'); x.globalAlpha = alpha(bo); [[52, 78, 4], [116, 156, 6]].forEach((b) => { for (let i = 0; i < b[2]; i++) { const m = b[0] + (i + .5) * (b[1] - b[0]) / b[2], Y = (KEEL - 48 + KEEL - 9) / 2; x.fillStyle = '#6d4630'; x.beginPath(); x.arc(X(m), Y, Math.min(15, (b[1] - b[0]) / b[2] * M * .42), 0, 6.3); x.fill(); } }); x.globalAlpha = 1;
    const pe = dr('pe', '#28343c', '#a5b8c2'), se = dr('se', '#28343c', '#a5b8c2');
    [pe, se].forEach((q, i) => { x.globalAlpha = alpha(q); for (let k = 0; k < (i ? 2 : 4); k++) { const X0 = X(q.r[0]) + 10 + k * (i ? 24 : 18), up = Math.sin(t * 5 * (playing ? 1 : 0) + k * 1.6) * 4; x.fillStyle = '#7a8f9b'; x.fillRect(X0, KEEL - 42 + up, 11, 22); x.fillStyle = '#b8c7cf'; x.fillRect(X0 - 2, KEEL - 31 + up, 15, 4); } x.globalAlpha = 1; });
    // резервуари: розмір за джерелом, рівень кабелю падає
    TK.forEach((k) => { const q = EL.find((a) => a.id === k.id), r = q.r, X0 = X(r[0]), w = X(r[1]) - X0, H = r[3] - r[2]; x.globalAlpha = alpha(q);
      x.fillStyle = '#0c3d52'; x.fillRect(X0, r[2], w, H);
      const lv = L[k.id] * (H - 5), top = r[3] - lv; x.fillStyle = '#1b2428'; x.fillRect(X0 + 3, top, w - 6, lv);
      for (let Y = r[3] - 4; Y > top; Y -= 5) { x.strokeStyle = 'rgba(170,150,110,.55)'; x.lineWidth = 2; x.beginPath(); for (let X1 = X0 + 5; X1 < X0 + w - 5; X1 += 7) x.arc(X1, Y, 2.5, Math.PI, 0); x.stroke(); }
      x.fillStyle = 'rgba(70,175,205,.2)'; x.fillRect(X0, r[2] + 3, w, H - 3);
      x.strokeStyle = '#e4eef2'; x.lineWidth = 2.4; x.strokeRect(X0, r[2], w, H); x.globalAlpha = 1;
      txt(Math.round(k.mi * L[k.id]) + ' миль', X0 + w / 2, r[2] - 7, 12, `rgba(235,245,248,${alpha(q)})`, 'center'); });
    // палуба
    x.fillStyle = '#7a6245'; x.fillRect(X(0), DK - 3, X(211) - X(0), 6);
    // шлюпка й людина: той самий масштаб
    const sca = EL.find((a) => a.id === 'sca'); x.globalAlpha = alpha(sca); x.fillStyle = '#c6b28c'; x.beginPath(); x.moveTo(X(122), DK - 13); x.lineTo(X(130), DK - 13); x.lineTo(X(129), DK - 5); x.lineTo(X(123), DK - 5); x.fill(); x.strokeStyle = '#d7e3e8'; x.lineWidth = 2; x.beginPath(); x.moveTo(X(121.6), DK - 3); x.lineTo(X(121.6), DK - 16); x.moveTo(X(130.4), DK - 3); x.lineTo(X(130.4), DK - 16); x.stroke(); x.fillStyle = '#ffe2a8'; x.fillRect(X(133) - 1, DK - 3 - Y1(1.8) + 2, 2, Y1(1.8) - 2); x.beginPath(); x.arc(X(133), DK - 3 - Y1(1.8) + 1.5, 1.6, 0, 6.3); x.fill(); x.globalAlpha = 1;
    // механізми на палубі
    const wheels = (q, n, c) => { x.globalAlpha = alpha(q); const X0 = X(q.r[0]), w = X(q.r[1]) - X0; x.fillStyle = '#23303a'; x.fillRect(X0, DK - 8, w, 6); for (let i = 0; i < n; i++) { const X1 = X0 + (i + .5) * w / n, a = t * (playing ? 4 : 0) + i; x.strokeStyle = c; x.lineWidth = 2; x.beginPath(); x.arc(X1, DK - 12, Math.min(5, w / n * .42), 0, 6.3); x.moveTo(X1, DK - 12); x.lineTo(X1 + Math.cos(a) * 4.5, DK - 12 + Math.sin(a) * 4.5); x.stroke(); } x.globalAlpha = 1; };
    wheels(EL.find((a) => a.id === 'pick'), 3, '#ffd29a'); wheels(EL.find((a) => a.id === 'pay'), 4, '#8ee8ff'); wheels(EL.find((a) => a.id === 'dyn'), 1, '#ffe08a');
    // гребне колесо: 17 м, низ коліс на 2,4 м у воді
    const wh = EL.find((a) => a.id === 'wh'); x.globalAlpha = alpha(wh); const wx = X(87), wy = DK + Y1(2.5), wr = Y1(8.5), wrx = wr; x.strokeStyle = '#d7e3e8'; x.lineWidth = 3; x.beginPath(); x.ellipse(wx, wy, wrx, wr, 0, 0, 6.3); x.stroke(); for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283 + (playing ? t * .9 : 0); x.lineWidth = 1.3; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + Math.cos(a) * wrx, wy + Math.sin(a) * wr); x.stroke(); } x.globalAlpha = 1;
    // гвинт
    const sc = EL.find((a) => a.id === 'sc'); x.globalAlpha = alpha(sc); const sx = X(205), sy = KEEL - Y1(4.5); for (let i = 0; i < 4; i++) { const a = i * 1.5708 + (playing ? t * 4 : .5), hh2 = Math.sin(a) * Y1(3.65); x.fillStyle = '#cdb27c'; x.beginPath(); x.ellipse(sx, sy + hh2 / 2, 3.5, Math.abs(hh2) / 2 + 1, 0, 0, 6.3); x.fill(); } x.globalAlpha = 1;
    // кабель: із резервуара, що зараз порожніє, палубою на корму й у воду
    const tr = EL.find((a) => a.id === 'tr'), srcM = L.tA > 0 ? 183 : L.tM > 0 ? 105 : 36;
    x.globalAlpha = alpha(tr); x.strokeStyle = '#d8b878'; x.lineWidth = 3; x.beginPath(); x.moveTo(X(srcM), TY0 + 4); x.lineTo(X(srcM), DK - 5); x.lineTo(X(211), DK - 5); x.stroke();
    if (playing) { x.fillStyle = '#fff2c8'; for (let m = 0; m < 240; m += 9) { const q = (m + t * 30) % 240, X1 = srcM + q; if (X1 < 211) x.fillRect(X(X1), DK - 6, 4, 2); } }
    x.globalAlpha = 1; x.restore();
    // кабель за кормою лягає на дно
    const q0 = EL.find((a) => a.id === 'pay'); x.globalAlpha = alpha(q0); const sX = X(211), sY = DK - 5 + rise; x.strokeStyle = '#d8b878'; x.lineWidth = 3; x.beginPath(); x.moveTo(sX, sY); x.quadraticCurveTo(sX + 40, WL + 10, sX + 40 + 60 * p, VH + 10); x.stroke(); x.globalAlpha = 1;
    // хвилі
    x.strokeStyle = 'rgba(210,235,240,.55)'; x.lineWidth = 2; x.beginPath(); for (let X1 = 0; X1 <= VW; X1 += 10) { const Y = WL + Math.sin(X1 * .025 + t * (playing ? 2.4 : 0)) * 2; X1 ? x.lineTo(X1, Y) : x.moveTo(X1, Y); } x.stroke();
    // лінійка
    const RY = VH - 28; x.strokeStyle = 'rgba(235,245,248,.7)'; x.lineWidth = 2; x.beginPath(); x.moveTo(X(0), RY); x.lineTo(X(211), RY); x.stroke(); for (let m = 0; m <= (CW < 620 ? 150 : 200); m += 50) { x.beginPath(); x.moveTo(X(m), RY - 6); x.lineTo(X(m), RY + 6); x.stroke(); txt(m + ' м', X(m), RY - 10, 12, 'rgba(235,245,248,.85)', 'center'); }
    x.beginPath(); x.moveTo(X(211), RY - 6); x.lineTo(X(211), RY + 6); x.stroke(); txt('211 м', X(211), RY - 10, 12, 'rgba(235,245,248,.85)', 'center');
    // номери й підписи: підпис лише там, де вистачає місця
    EL.forEach((a) => { const r = a.r, cx = (X(r[0]) + X(r[1])) / 2, cy = (r[2] + r[3]) / 2 + rise, big = sel === a.id; x.globalAlpha = on(a) ? 1 : .35; x.fillStyle = big ? '#ffd29a' : 'rgba(4,14,20,.88)'; x.beginPath(); x.arc(cx, cy, FS(11), 0, 6.3); x.fill(); x.strokeStyle = '#ffe9c4'; x.lineWidth = 1.5; x.stroke(); x.textBaseline = 'middle'; txt(String(a.n), cx, cy + 1, 12, big ? '#10181d' : '#fff', 'center', 700); x.textBaseline = 'alphabetic'; x.globalAlpha = 1; });
    if (CW >= 620) EL.forEach((a) => { const q = LB[a.id]; if (!q) return; const r = a.r, ax = (X(r[0]) + X(r[1])) / 2, top = q[1] < DK, ay = (top ? r[2] : r[3]) + rise, lx = X(q[0]), ly = q[1], ca = on(a) ? 1 : .4; x.strokeStyle = `rgba(255,233,196,${.55 * ca})`; x.lineWidth = 1.2; x.beginPath(); x.moveTo(ax, ay); x.lineTo(lx, top ? ly + 5 : ly - 15); x.stroke(); x.font = `600 ${FS(13)}px ${MONO}`; const w = x.measureText(a.t).width, bx = q[2] === 'center' ? lx - w / 2 : q[2] === 'right' ? lx - w : lx; x.fillStyle = `rgba(2,10,15,${.74 * ca})`; x.fillRect(bx - 6, ly - 15, w + 12, 20); txt(a.t, bx, ly, 13, sel === a.id ? '#ffd29a' : `rgba(255,255,255,${ca})`); });
    // показники
    x.fillStyle = 'rgba(2,8,12,.66)'; x.beginPath(); x.roundRect(30, 22, FS(330), FS(66), 8); x.fill();
    txt(`кабель у трюмах: ${fmt(2490 * (1 - p))} миль`, 44, 22 + FS(26), 15, '#fff'); txt(`вантаж: ${fmt(21000 - 7000 * p)} т із 21 000 т`, 44, 22 + FS(52), 15, '#ffe2a8');
    if (p > 0) txt('підйом корпусу умовний', 1250, 40, 12, 'rgba(235,245,248,.8)', 'right');
  }
  function say(id) { const e = EL.find((a) => a.id === id); sel = id; nums.forEach((b) => b.classList.toggle('on', b.dataset.e === id)); card.innerHTML = e ? `<b>${e.n}. ${e.t}.</b> ${e.d}` : 'Натисніть на номер або кнопку «Прокласти».'; draw(performance.now() / 1000); }
  function setG(g) { grp = grp === g ? null : g; sel = null; gbtn.forEach((b) => b.classList.toggle('on', b.dataset.g === grp)); say(null); }
  function loop(now) { const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; p = cl(p + dt / 14); draw(now / 1000); if (p >= 1) { stop(); go.textContent = '↺ Ще раз'; return; } raf = playing ? requestAnimationFrame(loop) : 0; }
  function stop() { playing = false; cancelAnimationFrame(raf); raf = 0; go.textContent = p >= 1 ? '↺ Ще раз' : '▶ Прокласти'; draw(0); }
  function start() { if (p >= 1) p = 0; if (REDUCE) { p = 1; stop(); return; } playing = true; last = 0; go.textContent = '❚❚ Пауза'; go.classList.remove('oc-glow'); if (!raf) raf = requestAnimationFrame(loop); }
  go.addEventListener('click', () => { playing ? stop() : start(); if (window.OC_SND) OC_SND.fx('click'); });
  box.querySelector('[data-re]').addEventListener('click', () => { stop(); p = 0; go.textContent = '▶ Прокласти'; draw(0); });
  gbtn.forEach((b) => b.addEventListener('click', () => setG(b.dataset.g)));
  nums.forEach((b) => b.addEventListener('click', () => { say(sel === b.dataset.e ? null : b.dataset.e); if (window.OC_SND) OC_SND.fx('click'); }));
  function at(ev) { const r = cv.getBoundingClientRect(), mx = (ev.clientX - r.left) / r.width * VW, my = (ev.clientY - r.top) / r.height * VH, pad = 640 / CW * 6; let best = null, bd = 1e9;
    EL.forEach((a) => { [a.r, a.r2].filter(Boolean).forEach((q) => { const X0 = X(q[0]), X1 = X(q[1]); if (mx >= X0 - pad && mx <= X1 + pad && my >= q[2] - pad && my <= q[3] + pad) { const ar = (X1 - X0) * (q[3] - q[2]); if (ar < bd) { bd = ar; best = a; } } }); }); return best; }
  cv.addEventListener('click', (ev) => { const a = at(ev); say(a ? (sel === a.id ? null : a.id) : null); });
  cv.addEventListener('mousemove', (ev) => { cv.style.cursor = at(ev) ? 'pointer' : 'default'; });
  new ResizeObserver(() => { size(); draw(0); }).observe(cv);
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && playing) stop(); }, { threshold: .15 }).observe(box);
  size(); say(null); seen = true;
  window.__ocShip = { set: (v, id) => { p = v; sel = id || null; say(sel); return EL.length; } };
})();
