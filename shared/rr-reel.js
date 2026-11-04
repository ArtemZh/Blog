/* Стаття 41, ролик «Одна доба магазину за півтори хвилини». 21 план, 96 с, 120 BPM (такт 2 с); межі розділів — на змінах треку Suno «Store Day Reel»: 4 удар, 16 бас, 32 повний грув, 56–64 спад і брейк, 64 підйом, 88 аутро.
   Кадр детермінований: frame(t) малює все лише з t — перегляд і запис у MP4 дають те саме. Плани 15–16 — справжня карта (rr-reel-city.js). Кадри Blender: банер, ранок (85 мм), робот по блоках (20 кадрів розльоту), фінал.
   Числа на кадрах = числа в статті: модель розділу 01 (w = 34,9 €), розділ 02 (111 / 66 / 34 год), розділ 10 (RaaS, перетин 40 міс.), IFR, Kroger, GXO. */
(function () {
  const box = document.getElementById('rr-reel'); if (!box) return;
  const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk);
  const DUR = 96, MONO = '"Roboto Mono", monospace', SANS = 'Inter, system-ui, sans-serif';
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = (v) => { v = cl(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k, seg = (t, a, b) => cl((t - a) / (b - a));
  const num = (v) => Math.round(v).toLocaleString(EN ? 'en-GB' : 'uk-UA');
  const C = { bg: '#07111b', ink: '#e9f1f3', dim: 'rgba(233,241,243,.55)', teal: '#2fe0d0', warm: '#ffcf8a', org: '#ff8a3c', go: '#2fa36b', try: '#3d8fc0', back: '#c8573f', line: 'rgba(233,241,243,.14)' };

  /* ── плани: початок, кінець, підпис ── */
  const SH = [
    [0, 4, L('00:00 · ніч', '00:00 · night'), L('Хто працює в магазині вночі?', 'Who works in a store at night?')],
    [4, 7, L('склад', 'warehouse'), L('Роботи бігають по сітці з ящиками — автомат любить обсяг', 'Robots run across a grid of crates: automation loves volume')],
    [7, 10, L('вартість одного замовлення · модель розділу 01', 'cost of one order · model of section 01'), L('Великий центр виграє лише від тисяч замовлень на день', 'A large centre wins only at thousands of orders a day')],
    [10, 13, 'Kroger · 2025', L('Закрито три з восьми центрів Ocado, списання 2,6 млрд $', 'Three of eight Ocado centres closed, a $2.6bn impairment')],
    [13, 16, L('гуманоїди · GXO', 'humanoids · GXO'), L('Поки що працюють на складах, не в залі', 'For now they work in warehouses, not on the floor')],
    [16, 19, L('06:00 · ранок', '06:00 · morning'), L('Сканер їде проходом, поки магазин спить', 'The scanner drives the aisle while the store sleeps')],
    [19, 21.5, L('порожнє місце', 'empty slot'), L('Камери бачать дірку раніше за людину', 'The cameras see the gap before a person does')],
    [21.5, 24.5, L('робот по блоках', 'the robot block by block'), L('Камери, лідар, комп’ютер, батарея — звичайні блоки', 'Cameras, lidar, computer, battery: ordinary blocks')],
    [24.5, 27, L('годин порожньої полиці за день · модель розділу 02', 'hours of empty shelf a day · model of section 02'), L('Цінність — у частоті обходів', 'The value is in how often it passes')],
    [27, 32, L('від камери до полиці · приклад', 'from camera to shelf · example'), L('Робот → система → людина', 'Robot → system → person')],
    [32, 37, L('09:00 · день', '09:00 · day'), L('У залі виграв робот-мийник', 'On the floor the scrubber won')],
    [37, 40, L('магазин без кас', 'checkout-free store'), L('Amazon прибрав Just Walk Out із Fresh, 2024', 'Amazon removed Just Walk Out from Fresh, 2024')],
    [40, 48, L('зал за статусом', 'the floor by status'), L('Де робот заробляє, де пілот, де згорнули', 'Where robots earn, where they pilot, where they were rolled back')],
    [48, 56, L('від пілота до мережі', 'from pilot to chain'), L('На сотні магазинів ламається не робот, а процес', 'At a hundred stores it is the process that breaks, not the robot')],
    [56, 64, L('18:00 · вечір', '18:00 · evening'), L('Робот-кур’єр: короткі часті маршрути в колі 2 км', 'Delivery robot: short frequent trips within 2 km')],
    [64, 69, L('та сама машина в Європі · модель розділу 07', 'the same machine in Europe · model of section 07'), L('Окупається там, де година праці дорога', 'It pays off where a labour hour is dear')],
    [69, 76, L('купити чи сервіс · модель розділу 10', 'buy or service · model of section 10'), L('Сервіс (RaaS) дешевший перші ≈ 40 місяців', 'Service (RaaS) is cheaper for the first ≈ 40 months')],
    [76, 81, L('23:00 · підсумок року', '23:00 · the year'), L('IFR: майже 250 тис. сервісних роботів, +24 %', 'IFR: almost 250,000 service robots, +24%')],
    [81, 88, L('перша зустріч із клієнтом', 'first meeting with a client'), L('Три питання до будь-якого робота', 'Three questions for any robot')],
    [88, 93, L('висновок', 'takeaway'), ''],
    [93, 96, L('00:00 · нова доба', '00:00 · a new day'), L('Робот окупається там, де робота повторюється, вимірюється й має обсяг', 'A robot pays off where work repeats, can be measured and has volume')]];
  const MAP0 = 56, MAP1 = 64;
  const HOURS = [[0, 0], [16, 6], [32, 9], [56, 18], [76, 23], [96, 24]];
  const hourAt = (t) => { for (let i = 1; i < HOURS.length; i++) if (t <= HOURS[i][0]) { const a = HOURS[i - 1], b = HOURS[i]; return lerp(a[1], b[1], (t - a[0]) / (b[0] - a[0])); } return 24; };

  /* ── DOM ── */
  box.innerHTML = `<div class="rr-reel__stage"><div class="rr-reel__map" data-map></div><div class="rr-reel__lbls" data-lbls></div><canvas></canvas>
    <button type="button" class="rr-reel__cover" data-cover><span class="rr-reel__play">▶</span><b>${L('Одна доба магазину за півтори хвилини', 'A store’s day in a minute and a half')}</b><small>${L('96 с · спершу подивіться, потім грайтеся зі сценами', '96 s · watch first, then play with the scenes')}</small></button></div>
    <div class="rr-reel__ctl"><button type="button" data-pp>▶</button><div class="rr-reel__bar"><input type="range" data-t min="0" max="${DUR}" step="0.02" value="0"><div class="rr-reel__ch">${[[0, L('ніч', 'night')], [16, L('ранок', 'morning')], [32, L('день', 'day')], [56, L('вечір', 'evening')], [76, L('рік', 'year')], [88, L('висновок', 'takeaway')]].map((c) => `<span style="left:${c[0] / DUR * 100}%">${c[1]}</span>`).join('')}</div></div><output data-o>0:00</output></div>
    <p class="oc-note">${L('Маршрути роботів на карті — справжні пішохідні маршрути OpenStreetMap у Таллінні, але умовні й прискорені: це ілюстрація, не дані Starship. Карта © OpenStreetMap, OpenFreeMap.', 'Robot routes on the map are real OpenStreetMap walking routes in Tallinn, but illustrative and sped up, not Starship data. Map © OpenStreetMap, OpenFreeMap.')}</p>`;
  const cv = box.querySelector('canvas'), x = cv.getContext('2d'), mapEl = box.querySelector('[data-map]'), lblEl = box.querySelector('[data-lbls]');
  const sl = box.querySelector('[data-t]'), out = box.querySelector('[data-o]'), pp = box.querySelector('[data-pp]'), cover = box.querySelector('[data-cover]');
  const img = (src) => { const i = new Image(); i.src = src; i.onload = () => paint(); return i; };
  const IM = { hero: img('assets/retail-robots/banner.jpg?v=4'), morn: img('assets/retail-robots/aisle.jpg?v=3'), fin: img('assets/retail-robots/aisle-final.jpg?v=3') };
  const EXF = Array.from({ length: 20 }, (_, i) => img(`assets/retail-robots/explode/f${String(i).padStart(2, '0')}.jpg?v=1`));
  let W = 1, H = 1, city = null, cityReady = false;

  /* ── карта: вантажимо, лише коли ролик близько до екрана ── */
  function loadCity() { if (city || !window.maplibregl || !window.RR_CITY) return; city = RR_CITY.mount(box.querySelector('.rr-reel__stage'), { EN, onReady: () => { cityReady = true; paint(); } }); }
  const libs = ['https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js', 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js', 'shared/rr-tln.js?v=20261102a', 'shared/rr-reel-city.js?v=20261104a'];
  let libsP = null;
  const needLibs = () => libsP || (libsP = (async () => { const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.css'; document.head.appendChild(css);
    for (const u of libs) await new Promise((ok, no) => { const s = document.createElement('script'); s.src = u; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); loadCity(); })().catch((e) => console.warn('карта ролика не завантажилась', e)));
  new IntersectionObserver((e) => { if (e[0].isIntersecting) needLibs(); }, { rootMargin: '600px' }).observe(box);

  /* ── малювання ── */
  const txt = (s, X, Y, o = {}) => { x.font = `${o.w || 500} ${o.n || 14}px ${o.f || MONO}`; x.textAlign = o.a || 'left'; x.fillStyle = o.c || C.ink; x.globalAlpha *= o.al ?? 1; x.fillText(s, X, Y); x.globalAlpha /= o.al ?? 1; };
  const U = () => Math.min(W / 1280, H / 720);   // одиниця масштабу: кадр задумано на 1280×720
  // план магазину в одиничних координатах (0…1 по ширині й висоті області плану)
  const PLAN = [
    { id: 'wh', x: .03, y: .04, w: .94, h: .24, t: L('склад', 'warehouse'), s: 'go' },
    { id: 'sh', x: .03, y: .33, w: .56, h: .40, t: L('полиці', 'shelves'), s: 'try' },
    { id: 'fl', x: .62, y: .33, w: .35, h: .40, t: L('зал', 'floor'), s: 'go' },
    { id: 'ck', x: .03, y: .78, w: .40, h: .18, t: L('каса', 'checkout'), s: 'back' },
    { id: 'kt', x: .46, y: .78, w: .20, h: .18, t: L('кухня', 'kitchen'), s: 'try' },
    { id: 'dr', x: .69, y: .78, w: .28, h: .18, t: L('двері', 'door'), s: 'go' }];
  const planRect = (z) => { const pw = W * .62 * z, ph = H * .7 * z; return { X: (W - pw) / 2, Y: (H - ph) / 2 - H * .02, w: pw, h: ph }; };
  function drawPlan(z, fillFn, lit) { const r = planRect(z), u = U();
    PLAN.forEach((p) => { const X = r.X + p.x * r.w, Y = r.Y + p.y * r.h, w = p.w * r.w, h = p.h * r.h; const f = fillFn ? fillFn(p) : null;
      x.fillStyle = f || 'rgba(255,255,255,.035)'; x.fillRect(X, Y, w, h); x.strokeStyle = lit === p.id ? C.warm : C.line; x.lineWidth = lit === p.id ? 2 : 1; x.strokeRect(X, Y, w, h);
      if (p.id === 'sh') { x.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 5; i++) x.fillRect(X + w * .06, Y + h * (.12 + i * .17), w * .88, h * .06); }
      txt(p.t, X + 10 * u, Y + 20 * u, { n: 12 * u, c: C.dim, w: 600 }); });
    return r; }
  function clock(t) { const u = U(), R = 34 * u, cx = W - R - 26 * u, cy = R + 26 * u, h = hourAt(t), a = h / 24 * Math.PI * 2 - Math.PI / 2;
    x.fillStyle = 'rgba(7,17,27,.7)'; x.beginPath(); x.arc(cx, cy, R + 6 * u, 0, 7); x.fill(); x.strokeStyle = C.warm; x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    for (let i = 0; i < 24; i++) { const b = i / 24 * Math.PI * 2 - Math.PI / 2, r0 = i % 6 ? R * .86 : R * .74; x.beginPath(); x.moveTo(cx + Math.cos(b) * r0, cy + Math.sin(b) * r0); x.lineTo(cx + Math.cos(b) * R, cy + Math.sin(b) * R); x.strokeStyle = i % 6 ? 'rgba(255,207,138,.35)' : C.warm; x.stroke(); }
    x.strokeStyle = C.ink; x.lineWidth = 2.5 * u; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R * .78, cy + Math.sin(a) * R * .78); x.stroke(); x.lineCap = 'butt';
    const hh = Math.floor(h) % 24, mm = Math.floor((h % 1) * 60 / 15) * 15; txt(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, cx, cy + R + 22 * u, { a: 'center', n: 13 * u, w: 700, c: C.warm }); }
  function caption(i, al) { const u = U(), s = SH[i]; x.globalAlpha = al; const g = x.createLinearGradient(0, H * .62, 0, H); g.addColorStop(0, 'rgba(7,17,27,0)'); g.addColorStop(1, 'rgba(7,17,27,.85)'); x.fillStyle = g; x.fillRect(0, H * .62, W, H * .38);
    txt(s[2].toUpperCase(), 34 * u, H - 64 * u, { n: 12 * u, w: 700, c: C.warm }); txt(s[3], 34 * u, H - 34 * u, { n: 26 * u, w: 700, f: SANS }); x.globalAlpha = 1; }
  function kenburns(im, k, z0, z1, dx) { if (!im.complete || !im.naturalWidth) { x.fillStyle = '#111c26'; x.fillRect(0, 0, W, H); return; }
    const z = lerp(z0, z1, k), s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * z, w = im.naturalWidth * s, h = im.naturalHeight * s; x.drawImage(im, (W - w) / 2 + dx * W * (k - .5), (H - h) / 2, w, h); }
  // модель розділу 01 при годині 34,9 €
  const MF = [{ min: 40, fix: 0, cap: 400, c: '#e8a33f', t: L('руками', 'by hand') }, { min: 15, fix: 6e5, cap: 1500, c: '#7fe3e0', t: L('мікроцентр', 'micro-fulfilment') }, { min: 6, fix: 1e7, cap: 12000, c: '#b48cff', t: L('великий центр', 'large centre') }];
  const costOf = (m, n) => m.min / 60 * 34.9 + m.fix * Math.ceil(n / m.cap) / (n * 365);
  let BE = 0; for (let n = 400; n < 20000; n += 1) if (costOf(MF[2], n) < costOf(MF[1], n)) { BE = n; break; }

  const O = [   // плани першої версії (62 с); нова розкладка — S нижче
    (k, t) => { drawPlan(lerp(1, 1.08, k), null, null); const r = planRect(lerp(1, 1.08, k)); x.fillStyle = `rgba(47,224,208,${.25 + .25 * Math.sin(t * 3)})`; x.fillRect(r.X + .03 * r.w, r.Y + .04 * r.h, .94 * r.w, .24 * r.h); },
    (k, t) => { const u = U(), cols = 16, rows = 9, cw = W * .9 / cols, ch = H * .78 / rows, ox = W * .05 - k * cw * 2, oy = H * .1;
      for (let i = 0; i < cols + 3; i++) for (let j = 0; j < rows; j++) { const X = ox + i * cw, Y = oy + j * ch; x.fillStyle = (i + j) % 3 ? '#0e2232' : '#11293b'; x.fillRect(X + 2, Y + 2, cw - 4, ch - 4); }
      for (let r = 0; r < 9; r++) { const ph = t * (.7 + r * .13) + r * 1.7, along = (Math.sin(ph) * .5 + .5) * (cols - 1), X = ox + (r % 2 ? along : (r * 3 % cols)) * cw, Y = oy + (r % 2 ? (r % rows) : ((Math.cos(ph) * .5 + .5) * (rows - 1))) * ch;
        x.fillStyle = C.teal; x.fillRect(X + cw * .2, Y + ch * .2, cw * .6, ch * .6); x.fillStyle = 'rgba(47,224,208,.25)'; x.fillRect(X, Y, cw, ch); } },
    (k, t) => { const u = U(), cx = W * .36, by = H * .62, lift = sm(seg(k, .1, .6)) * 120 * u;
      x.fillStyle = '#0e2232'; x.fillRect(cx - 160 * u, by, 320 * u, 30 * u); for (let i = -2; i <= 2; i++) x.fillRect(cx + i * 64 * u - 28 * u, by + 34 * u, 56 * u, 60 * u);
      x.fillStyle = '#e9f1f3'; x.fillRect(cx - 52 * u, by - 80 * u - lift * .3, 104 * u, 70 * u); x.fillStyle = C.teal; x.fillRect(cx - 52 * u, by - 14 * u - lift * .3, 104 * u, 5 * u);
      x.fillStyle = '#e8a33f'; x.fillRect(cx - 40 * u, by - 10 * u - lift, 80 * u, 50 * u);
      const n = Math.round(lerp(30, 12000, sm(k)) / 10) * 10; txt(num(n), W * .62, H * .48, { n: 64 * u, w: 700, c: C.teal }); txt(L('замовлень на день', 'orders a day'), W * .62, H * .48 + 30 * u, { n: 15 * u, c: C.dim }); },
    (k, t) => { const u = U(), l = W * .1, r = W * .9, tp = H * .14, bt = H * .66, YM = 40, N = (p) => 30 * Math.pow(20000 / 30, p), X = (v) => l + (r - l) * Math.log(v / 30) / Math.log(20000 / 30), Y = (v) => bt - (bt - tp) * Math.min(v, YM) / YM;
      x.strokeStyle = C.line; for (let v = 0; v <= YM; v += 10) { x.beginPath(); x.moveTo(l, Y(v)); x.lineTo(r, Y(v)); x.stroke(); txt(v + ' €', l - 8 * u, Y(v) + 4 * u, { a: 'right', n: 11 * u, c: C.dim }); }
      [100, 1000, 10000].forEach((v) => txt(num(v), X(v), bt + 18 * u, { a: 'center', n: 11 * u, c: C.dim }));
      const pr = sm(seg(k, 0, .7)); MF.forEach((m, i) => { x.strokeStyle = m.c; x.lineWidth = 3 * u; x.beginPath(); let on = false; for (let p = 0; p <= pr; p += .004) { const v = N(p), c = costOf(m, v); if (c > YM) { on = false; continue; } on ? x.lineTo(X(v), Y(c)) : x.moveTo(X(v), Y(c)); on = true; } x.stroke(); txt(m.t, l + 8 * u, tp + (14 + i * 18) * u, { n: 12 * u, w: 600, c: m.c }); });
      const a = sm(seg(k, .65, .85)); if (a > 0 && BE) { const X0 = X(BE); x.globalAlpha = a; x.strokeStyle = C.ink; x.setLineDash([5, 5]); x.beginPath(); x.moveTo(X0, tp); x.lineTo(X0, bt); x.stroke(); x.setLineDash([]); txt('≈ ' + num(Math.round(BE / 100) * 100) + L(' на день', ' a day'), X0 + 8 * u, tp + 12 * u, { n: 14 * u, w: 700 }); x.globalAlpha = 1; } },
    (k, t) => { const u = U(), cw = 150 * u; for (let i = 0; i < 3; i++) { const X = W / 2 + (i - 1) * cw * 1.4 - cw / 2, Y = H * .3, off = sm(seg(k, .15 + i * .2, .3 + i * .2));
      x.fillStyle = `rgba(${Math.round(lerp(47, 40, off))},${Math.round(lerp(224, 48, off))},${Math.round(lerp(208, 60, off))},1)`; x.fillRect(X, Y + cw * .25, cw, cw * .8);
      x.fillStyle = `rgba(${Math.round(lerp(127, 30, off))},${Math.round(lerp(240, 38, off))},${Math.round(lerp(230, 48, off))},1)`; x.beginPath(); x.moveTo(X, Y + cw * .25); x.lineTo(X + cw * .25, Y); x.lineTo(X + cw * 1.25, Y); x.lineTo(X + cw, Y + cw * .25); x.fill(); } },
    (k) => kenburns(IM.hero, k, 1.05, 1.15, -.04),
    (k, t) => { const u = U(), rows = 4, cols = 12, z = lerp(1, 1.35, sm(k)), sw = W * .8 * z, sh = H * .62 * z, ox = W / 2 - sw * lerp(.5, .62, sm(k)), oy = H * .42 - sh / 2, fw = sw / cols, fh = sh / rows, PAL = ['#c8573f', '#e8a33f', '#3d8fc0', '#2fa36b', '#8a5bb0', '#e9e3d0'];
      for (let j = 0; j < rows; j++) { x.fillStyle = '#2a3440'; x.fillRect(ox, oy + (j + 1) * fh - 6 * u, sw, 6 * u);
        for (let i = 0; i < cols; i++) { if (j === 2 && (i === 7 || i === 8) && k > .25) continue; x.fillStyle = PAL[(i * 7 + j * 3) % PAL.length]; x.fillRect(ox + i * fw + 3 * u, oy + j * fh + fh * .18, fw - 6 * u, fh * .74); } }
      if (k > .25) { const p = (Math.sin((k - .25) * 30) * .5 + .5), X = ox + 7 * fw, Y = oy + 2 * fh; x.strokeStyle = C.org; x.lineWidth = 3 * u; x.globalAlpha = .5 + p * .5; x.strokeRect(X, Y + fh * .1, fw * 2, fh * .82); x.fillStyle = 'rgba(255,138,60,.18)'; x.fillRect(X, Y + fh * .1, fw * 2, fh * .82); x.globalAlpha = 1;
        txt(L('06:12 · порожньо', '06:12 · empty'), X + fw, Y - 6 * u, { a: 'center', n: 14 * u, w: 700, c: C.org }); } },
    (k) => { const u = U(), B = [[L('людина, обхід раз на день', 'person, one walk a day'), 111.3, '#e8a33f'], [L('робот, два обходи', 'robot, two passes'), 66.3, '#7fe3e0'], [L('робот кожні 2 години', 'robot every 2 hours'), 34.3, C.teal]], l = W * .1, w = W * .62;
      B.forEach((b, i) => { const Y = H * .24 + i * 70 * u, p = sm(seg(k, i * .15, .4 + i * .15)); txt(b[0], l, Y, { n: 15 * u, c: C.dim, f: SANS }); x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(l, Y + 10 * u, w, 18 * u); x.fillStyle = b[2]; x.fillRect(l, Y + 10 * u, w * b[1] / 120 * p, 18 * u); txt(num(b[1] * p) + L(' год', ' h'), l + w + 14 * u, Y + 25 * u, { n: 18 * u, w: 700, c: b[2] }); }); },
    (k, t) => { const r = drawPlan(1.06, null, 'fl'), u = U(), f = PLAN[2], X = r.X + f.x * r.w, Y = r.Y + f.y * r.h, w = f.w * r.w, h = f.h * r.h, lanes = 6, done = k * lanes;
      x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); for (let i = 0; i < lanes; i++) { const p = cl(done - i); if (p <= 0) break; x.fillStyle = 'rgba(47,224,208,.22)'; const ly = Y + h * (i + .5) / lanes; x.fillRect(i % 2 ? X + w * (1 - p) : X, ly - h / lanes * .42, w * p, h / lanes * .84); } x.restore();
      const i = Math.min(lanes - 1, Math.floor(done)), p = done - i, rx = i % 2 ? X + w * (1 - p) : X + w * p, ry = Y + h * (i + .5) / lanes; x.fillStyle = C.ink; x.beginPath(); x.arc(rx, ry, 9 * u, 0, 7); x.fill();
      for (let n = 0; n < 14; n++) { const ph = cl(k * 1.4 - n * .06), d = PLAN[5], sx = r.X + (d.x + d.w * .5) * r.w, sy = r.Y + (d.y + .05) * r.h, tx = r.X + (.08 + (n * .37 % .9) * .88) * r.w, ty = r.Y + (.36 + (n * .53 % .34)) * r.h;
        if (ph > 0) { x.fillStyle = C.warm; x.beginPath(); x.arc(lerp(sx, tx, sm(ph)), lerp(sy, ty, sm(ph)), 4 * u, 0, 7); x.fill(); } } },
    (k) => { const r = drawPlan(lerp(1.15, 1.35, k), null, 'ck'), u = U(), f = PLAN[3], X = r.X + f.x * r.w, Y = r.Y + f.y * r.h, w = f.w * r.w, h = f.h * r.h, off = sm(seg(k, .3, .7));
      for (let i = 0; i < 4; i++) { x.fillStyle = `rgba(47,224,208,${.7 * (1 - off) + .08})`; x.fillRect(X + w * (.1 + i * .22), Y + h * .3, w * .1, h * .5); }
      x.fillStyle = `rgba(7,17,27,${off * .6})`; x.fillRect(0, 0, W, H); if (off > .3) { x.save(); x.translate(W / 2, H * .42); x.rotate(-.12); x.strokeStyle = C.back; x.lineWidth = 4 * u; x.globalAlpha = sm(seg(k, .45, .65)); x.strokeRect(-150 * u, -36 * u, 300 * u, 72 * u); txt(L('ЗГОРНУТО · 2024', 'ROLLED BACK · 2024'), 0, 10 * u, { a: 'center', n: 26 * u, w: 800, c: C.back }); x.restore(); x.globalAlpha = 1; } },
    (k) => { const u = U(), col = { go: C.go, try: C.try, back: C.back }; drawPlan(1, (p) => { const i = PLAN.indexOf(p), a = sm(seg(k, i * .1, i * .1 + .3)); return a ? col[p.s] + Math.round(a * 200).toString(16).padStart(2, '0') : null; }, null);
      [[C.go, L('заробляє', 'earns')], [C.try, L('пілот', 'pilot')], [C.back, L('згорнуто', 'rolled back')]].forEach((g, i) => { x.fillStyle = g[0]; x.fillRect(W * .2 + i * 170 * u, H * .9, 14 * u, 14 * u); txt(g[1], W * .2 + i * 170 * u + 22 * u, H * .9 + 12 * u, { n: 14 * u, c: C.ink }); }); },
    null, null, null,
    (k) => { const u = U(), Bs = [['2024', 200, C.dim], ['2025', 250, C.teal]], l = W * .2, bw = W * .16, base = H * .66;
      Bs.forEach((b, i) => { const p = sm(seg(k, i * .2, .5 + i * .2)), h = H * .44 * b[1] / 250 * p, X = l + i * bw * 1.6; x.fillStyle = b[2]; x.fillRect(X, base - h, bw, h); txt(b[0], X + bw / 2, base + 22 * u, { a: 'center', n: 14 * u, c: C.dim }); txt(`≈${num(b[1] * p)}` + L(' тис.', 'k'), X + bw / 2, base - h - 10 * u, { a: 'center', n: 18 * u, w: 700, c: b[2] }); });
      const a = sm(seg(k, .6, .9)); txt('+24 %', W * .7, H * .4, { n: 72 * u, w: 800, c: C.teal, al: a }); txt(L('логістика: 117 500', 'logistics: 117,500'), W * .7, H * .4 + 34 * u, { n: 15 * u, c: C.dim, al: a }); },
    (k) => kenburns(IM.fin, k, 1.12, 1.0, 0)];


  const panel = (X, Y, w, h, a = 1) => { x.globalAlpha *= a; x.fillStyle = 'rgba(7,17,27,.78)'; x.fillRect(X, Y, w, h); x.strokeStyle = C.line; x.strokeRect(X, Y, w, h); x.globalAlpha /= a; };
  const wrapTxt = (s, X, Y, maxW, lh, o) => { x.font = `${o.w || 700} ${o.n}px ${o.f || SANS}`; const ws = s.split(' '), ln = []; let cur = ''; ws.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur) { ln.push(cur); cur = w; } else cur = t; }); ln.push(cur); ln.forEach((l, i) => txt(l, X, Y + i * lh, o)); return ln.length; };
  // склад + лічильник замовлень поверх (злиті плани 2–3)
  const sWare = (k, t) => { O[1](k, t); const u = U(), a = sm(seg(k, .25, .45)), n = Math.round(lerp(30, 12000, sm(seg(k, .3, 1))) / 10) * 10; panel(W * .58, H * .2, W * .34, H * .26, a);
    txt(num(n), W * .61, H * .2 + 70 * u, { n: 54 * u, w: 700, c: C.teal, al: a }); txt(L('замовлень на день', 'orders a day'), W * .61, H * .2 + 100 * u, { n: 15 * u, c: C.dim, al: a }); };
  const sCost = (k, t) => { O[3](k, t); txt(L('модель розділу 01 · година 34,9 €', 'model of section 01 · hour €34.9'), W * .9, H * .1, { a: 'right', n: 12 * U(), c: C.dim }); };
  // Kroger: вісім центрів, три гаснуть
  const sKroger = (k) => { const u = U(), cw = 92 * u, gap = 22 * u, X0 = W / 2 - (8 * cw + 7 * gap) / 2, Y = H * .32;
    for (let i = 0; i < 8; i++) { const X = X0 + i * (cw + gap), off = i < 3 ? sm(seg(k, .2 + i * .14, .36 + i * .14)) : 0;
      x.fillStyle = `rgb(${Math.round(lerp(47, 40, off))},${Math.round(lerp(224, 48, off))},${Math.round(lerp(208, 60, off))})`; x.fillRect(X, Y + cw * .25, cw, cw * .8);
      x.fillStyle = `rgb(${Math.round(lerp(127, 30, off))},${Math.round(lerp(240, 38, off))},${Math.round(lerp(230, 48, off))})`; x.beginPath(); x.moveTo(X, Y + cw * .25); x.lineTo(X + cw * .2, Y); x.lineTo(X + cw * 1.0, Y); x.lineTo(X + cw, Y + cw * .25); x.fill();
      if (off > .5) { x.strokeStyle = C.back; x.lineWidth = 3 * u; x.beginPath(); x.moveTo(X + 10 * u, Y + 20 * u); x.lineTo(X + cw - 10 * u, Y + cw); x.stroke(); } }
    const a = sm(seg(k, .7, .9)); txt(L('3 з 8', '3 of 8'), W / 2, Y + cw * 1.6, { a: 'center', n: 54 * u, w: 800, c: C.back, al: a }); };
  // гуманоїди: склад, однакові ящики, лічильник GXO
  const sHuman = (k, t) => { const u = U(), fy = H * .7;
    x.fillStyle = '#0e2232'; for (let i = 0; i < 6; i++) { const X = W * (.06 + i * .155); x.fillRect(X, H * .16, W * .02, fy - H * .16); for (let j = 0; j < 4; j++) x.fillRect(X, H * (.22 + j * .12), W * .14, 5 * u); for (let j = 0; j < 4; j++) for (let q = 0; q < 3; q++) { x.fillStyle = '#163548'; x.fillRect(X + W * (.025 + q * .04), H * (.22 + j * .12) - 22 * u, W * .032, 22 * u); x.fillStyle = '#0e2232'; } }
    const px = lerp(W * .12, W * .7, sm(k)), sw = Math.sin(t * 9) * 8 * u; x.strokeStyle = C.ink; x.lineWidth = 7 * u; x.lineCap = 'round';
    x.beginPath(); x.moveTo(px, fy - 70 * u); x.lineTo(px - 10 * u + sw, fy); x.moveTo(px, fy - 70 * u); x.lineTo(px + 10 * u - sw, fy); x.moveTo(px, fy - 70 * u); x.lineTo(px, fy - 135 * u); x.stroke(); x.lineCap = 'butt';
    x.fillStyle = C.ink; x.beginPath(); x.arc(px, fy - 150 * u, 13 * u, 0, 7); x.fill(); x.fillStyle = C.org; x.fillRect(px + 6 * u, fy - 125 * u, 40 * u, 28 * u);
    const a = sm(seg(k, .2, .45)); panel(W * .62, H * .14, W * .32, H * .24, a); txt('100 000+', W * .65, H * .14 + 62 * u, { n: 46 * u, w: 800, c: C.teal, al: a }); txt(L('ящиків переніс Digit у GXO', 'totes moved by Digit at GXO'), W * .65, H * .14 + 90 * u, { n: 14 * u, c: C.dim, al: a }); };
  const sHero = (k) => kenburns(IM.hero, k, 1.0, 1.12, -.05);
  // ранок: перевід фокусу з розмитого на різке
  const sMorning = (k) => { x.filter = `blur(${lerp(9, 0, sm(seg(k, .05, .55))).toFixed(1)}px)`; kenburns(IM.morn, k, 1.04, 1.1, .03); x.filter = 'none'; };
  const sExplode = (k) => { const i = Math.round(sm(seg(k, .05, .8)) * 19), im = EXF[i]; if (im && im.complete && im.naturalWidth) kenburns(im, k, 1.02, 1.0, 0); else { x.fillStyle = '#0b1622'; x.fillRect(0, 0, W, H); } };
  // ланцюжок: одна порожня комірка проходить робот → система → людина → полиця
  const sChain = (k) => { const u = U(), N = [[L('камера', 'camera'), L('06:12 · порожньо, ряд 4', '06:12 · empty, row 4')], [L('система', 'system'), L('у підсобці: 6 шт.', 'back room: 6 pcs')], [L('телефон працівника', 'staff phone'), L('«Поклади 6 шт., ряд 4»', '“Put 6 pcs, row 4”')], [L('полиця', 'shelf'), L('06:31 · повно', '06:31 · full')]];
    const bw = W * .19, gp = (W * .86 - 4 * bw) / 3, Y = H * .3, bh = H * .22, p = sm(seg(k, .05, .85)) * 3;
    N.forEach((n, i) => { const X = W * .07 + i * (bw + gp), on = p >= i - .02; x.fillStyle = on ? (i === 3 && p > 2.95 ? 'rgba(47,163,107,.35)' : 'rgba(47,224,208,.14)') : 'rgba(255,255,255,.04)'; x.fillRect(X, Y, bw, bh); x.strokeStyle = on ? C.teal : C.line; x.lineWidth = on ? 2 : 1; x.strokeRect(X, Y, bw, bh);
      txt(n[0].toUpperCase(), X + 14 * u, Y + 28 * u, { n: 12 * u, w: 700, c: on ? C.warm : C.dim }); wrapTxt(n[1], X + 14 * u, Y + 62 * u, bw - 28 * u, 24 * u, { n: 18 * u, w: 700, f: SANS, c: on ? C.ink : C.dim });
      if (i < 3) { x.strokeStyle = C.line; x.lineWidth = 2; x.beginPath(); x.moveTo(X + bw + 6 * u, Y + bh / 2); x.lineTo(X + bw + gp - 6 * u, Y + bh / 2); x.stroke(); } });
    const seg_ = Math.min(2.999, p), j = Math.floor(seg_), f = seg_ - j, X0 = W * .07 + j * (bw + gp) + bw, X1 = X0 + gp, dx = lerp(X0, X1, sm(f)); x.fillStyle = p > 2.95 ? C.go : C.org; x.beginPath(); x.arc(p > 2.95 ? W * .07 + 3 * (bw + gp) + bw / 2 : dx, Y + bh / 2 + (p > 2.95 ? bh * .32 : 0), 10 * u, 0, 7); x.fill(); };
  // зал: камера перелітає по зонах, кожна спалахує своїм статусом
  const sFly = (k) => { const u = U(), col = { go: C.go, try: C.try, back: C.back }, ord = [0, 1, 2, 3, 4, 5], q = sm(k) * 5.2, i = Math.min(5, Math.floor(q)), f = q - i, z = lerp(1.45, 1.0, sm(seg(k, .82, 1)));
    const zc = (p) => [p.x + p.w / 2, p.y + p.h / 2], A = zc(PLAN[ord[i]]), B = zc(PLAN[ord[Math.min(5, i + 1)]]), cx = lerp(A[0], B[0], sm(f)), cy = lerp(A[1], B[1], sm(f)), r = planRect(1);
    x.save(); x.translate(W / 2, H / 2); x.scale(z, z); x.translate(-(r.X + cx * r.w) * (1 - sm(seg(k, .82, 1))) - (W / 2) * sm(seg(k, .82, 1)), -(r.Y + cy * r.h) * (1 - sm(seg(k, .82, 1))) - (H / 2) * sm(seg(k, .82, 1)));
    drawPlan(1, (p) => { const j = PLAN.indexOf(p), a = cl(q - j + .6); return a > 0 ? col[p.s] + Math.round(a * 210).toString(16).padStart(2, '0') : null; }, PLAN[ord[i]].id); x.restore();
    [[C.go, L('заробляє', 'earns')], [C.try, L('пілот', 'pilot')], [C.back, L('згорнуто', 'rolled back')]].forEach((g, j) => { x.fillStyle = g[0]; x.fillRect(W * .2 + j * 170 * u, H * .9, 14 * u, 14 * u); txt(g[1], W * .2 + j * 170 * u + 22 * u, H * .9 + 12 * u, { n: 14 * u, c: C.ink }); }); };
  // від пілота до мережі: 1 → 10 → 100 магазинів, і що ламається на кожному кроці
  const sPilot = (k) => { const u = U(), P = [[1, L('пілот: усе вручну', 'pilot: all by hand')], [10, L('10: інтеграція з ERP і WMS', '10: ERP and WMS integration')], [100, L('100: процес, люди, сервіс', '100: process, people, service')]], cw = W * .26;
    P.forEach((pp, i) => { const a = sm(seg(k, i * .25, i * .25 + .2)); if (a <= 0) return; const X = W * .07 + i * (cw + W * .04), Y = H * .14, n = pp[0], cols = n === 1 ? 1 : 10, s_ = n === 1 ? 70 * u : cw / 10 * .7;
      x.globalAlpha = a; for (let j = 0; j < n; j++) { const cx = X + (n === 1 ? cw / 2 - s_ / 2 : (j % cols) * cw / 10), cy = Y + 30 * u + (n === 1 ? 40 * u : Math.floor(j / cols) * cw / 10); x.fillStyle = C.teal; x.fillRect(cx, cy + s_ * .3, s_, s_ * .7); x.beginPath(); x.moveTo(cx, cy + s_ * .3); x.lineTo(cx + s_ / 2, cy); x.lineTo(cx + s_, cy + s_ * .3); x.fill(); }
      txt(num(n), X, Y + 10 * u, { n: 22 * u, w: 800, c: C.warm }); wrapTxt(pp[1], X, H * .6, cw, 22 * u, { n: 17 * u, w: 600, f: SANS, c: C.ink }); x.globalAlpha = 1; }); };
  // купити чи сервіс: модель розділу 10 з типовими значеннями (10 роботів, 40 тис. €, 15 %/рік, 1 500 €/міс, інтеграція 60 тис.)
  const sRaas = (k) => { const u = U(), l = W * .1, r = W * .9, tp = H * .14, bt = H * .64, MO = 60, buy = (m) => 460000 + 5000 * m, raas = (m) => 60000 + 15000 * m, mx = 960000, X = (m) => l + (r - l) * m / MO, Y = (v) => bt - (bt - tp) * v / mx, pr = sm(seg(k, 0, .7)) * MO;
    x.strokeStyle = C.line; x.lineWidth = 1; for (let v = 0; v <= 900000; v += 300000) { x.beginPath(); x.moveTo(l, Y(v)); x.lineTo(r, Y(v)); x.stroke(); txt(num(v / 1000) + 'k €', l - 8 * u, Y(v) + 4 * u, { a: 'right', n: 11 * u, c: C.dim }); }
    for (let y = 0; y <= 5; y++) txt(y ? L(`${y} р.`, `yr ${y}`) : '0', X(y * 12), bt + 18 * u, { a: 'center', n: 11 * u, c: C.dim });
    [[buy, '#e8a33f', L('купівля', 'purchase')], [raas, '#7fe3e0', L('сервіс (RaaS)', 'service (RaaS)')]].forEach((c, i) => { x.strokeStyle = c[1]; x.lineWidth = 3 * u; x.beginPath(); for (let m = 0; m <= pr; m += .5) (m ? x.lineTo(X(m), Y(c[0](m))) : x.moveTo(X(m), Y(c[0](m)))); x.stroke(); txt(c[2], l + 8 * u, tp + (14 + i * 18) * u, { n: 12 * u, w: 600, c: c[1] }); });
    const a = sm(seg(k, .62, .82)); if (a > 0) { x.globalAlpha = a; x.strokeStyle = C.ink; x.setLineDash([5, 5]); x.beginPath(); x.moveTo(X(40), tp); x.lineTo(X(40), bt); x.stroke(); x.setLineDash([]); txt(L('≈ 40 міс.', '≈ 40 mo'), X(40) + 8 * u, tp + 12 * u, { n: 15 * u, w: 700 }); x.globalAlpha = 1; }
    txt(L('10 роботів · модель розділу 10', '10 robots · model of section 10'), r, tp - 14 * u, { a: 'right', n: 12 * u, c: C.dim }); };
  // три питання першої зустрічі
  const sQ = (k) => { const u = U(), Q = [L('Робота повторюється?', 'Does the work repeat?'), L('Її можна виміряти?', 'Can it be measured?'), L('Є обсяг?', 'Is there volume?')];
    Q.forEach((q, i) => { const a = sm(seg(k, i * .2, i * .2 + .15)), ck = sm(seg(k, i * .2 + .12, i * .2 + .22)), Y = H * (.22 + i * .15), X = W * .2; x.globalAlpha = a; x.strokeStyle = C.teal; x.lineWidth = 3 * u; x.strokeRect(X, Y - 26 * u, 34 * u, 34 * u);
      if (ck > 0) { x.beginPath(); x.moveTo(X + 7 * u, Y - 9 * u); x.lineTo(X + 15 * u, Y); x.lineTo(X + 15 * u + 14 * u * ck, Y - 18 * u * ck); x.stroke(); } txt(q, X + 54 * u, Y, { n: 34 * u, w: 700, f: SANS }); x.globalAlpha = 1; });
    txt(L('→ тоді рахуємо робота', '→ then we cost the robot'), W * .2 + 54 * U(), H * .7, { n: 20 * u, w: 600, c: C.warm, f: SANS, al: sm(seg(k, .72, .9)) }); };
  // висновок
  const sThesis = (k) => { const u = U(), a = sm(seg(k, .05, .3)); x.globalAlpha = a; x.textAlign = 'center';
    const lines = EN ? ['It is not the robot that earns,', 'but a properly automated process'] : ['Заробляє не робот,', 'а правильно автоматизований процес']; lines.forEach((l, i) => txt(l, W / 2, H * .38 + i * 64 * u, { a: 'center', n: 50 * u, w: 800, f: SANS, c: i ? C.teal : C.ink }));
    txt(L('повторюється · вимірюється · має обсяг', 'repeats · measurable · has volume'), W / 2, H * .38 + 140 * u, { a: 'center', n: 16 * u, w: 600, c: C.dim, al: sm(seg(k, .35, .55)) }); x.globalAlpha = 1; };
  const S = [O[0], sWare, sCost, sKroger, sHuman, sHero, sMorning, sExplode, O[7], sChain, O[8], O[9], sFly, sPilot, null, null, sRaas, O[14], sQ, sThesis, O[15]];

  function drawShot(i, t) { const s = SH[i], k = (t - s[0]) / (s[1] - s[0]); if (S[i]) S[i](cl(k), t); }
  function frame(t) { t = cl(t, 0, DUR); x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, W, H);
    const i = Math.max(0, SH.findIndex((s) => t < s[1])), onMap = t >= MAP0 && t < MAP1, F = .4;
    // карта: прозорість на краях, щоб плани перетікали
    const mapA = sm(seg(t, MAP0 - F, MAP0)) * (1 - sm(seg(t, MAP1 - F, MAP1)));
    mapEl.style.opacity = lblEl.style.opacity = mapA; mapEl.style.visibility = lblEl.style.visibility = mapA > 0 ? 'visible' : 'hidden';
    if (city && cityReady && mapA > 0) city.render(cl((t - MAP0) * RR_CITY.T_END / (MAP1 - MAP0), 0, RR_CITY.T_END));
    if (!onMap) { x.fillStyle = C.bg; x.globalAlpha = 1 - mapA; x.fillRect(0, 0, W, H); x.globalAlpha = 1 - mapA; drawShot(i, t);
      const s = SH[i]; if (i > 0 && t - s[0] < F && SH[i - 1] && S[i - 1]) { x.globalAlpha = (1 - (t - s[0]) / F) * (1 - mapA); drawShot(i - 1, t); } x.globalAlpha = 1; }
    if (onMap && !cityReady) { x.fillStyle = C.bg; x.fillRect(0, 0, W, H); txt(L('карта вантажиться…', 'loading the map…'), W / 2, H / 2, { a: 'center', c: C.dim }); }
    caption(i, sm(seg(t - SH[i][0], 0, .35))); clock(t);
    out.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; sl.value = t;
    (window.__rr = window.__rr || {}).reel = { t: +t.toFixed(2), shot: i + 1, map: +mapA.toFixed(2), be: BE }; }
  window.RR_REEL = { frame, DUR, ready: () => !city || cityReady };

  /* ── плеєр ── */
  let DPR = 1, playing = false, t0 = 0, s0 = 0, cur = 0;
  function size() { DPR = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 640; H = cv.clientHeight || 360; cv.width = W * DPR; cv.height = H * DPR; if (city) city.resize(); frame(cur); }
  const paint = () => frame(cur);
  function tick(now) { if (!playing) return; cur = s0 + (now - t0) / 1000; if (cur >= DUR) { cur = DUR; stop(); } frame(cur); if (playing) requestAnimationFrame(tick); }
  function play() { needLibs(); cover.hidden = true; if (cur >= DUR) cur = 0; playing = true; pp.textContent = '❚❚'; s0 = cur; t0 = performance.now(); requestAnimationFrame(tick); if (window.RR_SND && RR_SND.reel) RR_SND.reel(true, cur); }
  function stop() { playing = false; pp.textContent = '▶'; if (window.RR_SND && RR_SND.reel) RR_SND.reel(false); }
  cover.addEventListener('click', play); pp.addEventListener('click', () => (playing ? stop() : play()));
  sl.addEventListener('input', () => { cover.hidden = true; stop(); cur = +sl.value; needLibs(); frame(cur); });
  new ResizeObserver(size).observe(cv); size();

  /* ── режим рендеру ?reel=render: лише кадр 16:9 на весь вьюпорт, window.__reel для ship-pipeline/render-reel-41.mjs ── */
  if (/[?&]reel=render/.test(location.search)) {
    const st = document.createElement('style'); st.textContent = 'body>*:not(.rr-render){display:none!important}html,body{margin:0;background:#07111b;overflow:hidden}.rr-render .rr-reel__stage{position:fixed;inset:0;border-radius:0;aspect-ratio:auto}.rr-render .rr-reel__ctl,.rr-render .oc-note,.rr-render [data-cover]{display:none!important}';
    document.head.appendChild(st); const wrap = document.createElement('div'); wrap.className = 'rr-render'; document.body.appendChild(wrap); wrap.appendChild(box); cover.hidden = true; size();
    const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const idle = () => new Promise((r) => { const m = city.map; if (m.loaded() && m.areTilesLoaded()) return r(); const to = setTimeout(r, 4000); m.once('idle', () => { clearTimeout(to); r(); }); });
    const imgs = () => Promise.all(Object.values(IM).concat(EXF).map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
    const ready = (async () => { await imgs(); await needLibs(); for (let i = 0; i < 100 && !cityReady; i++) await new Promise((r) => setTimeout(r, 200)); })();
    window.__reel = { total: DUR, ready, seek: async (t) => { cur = t; frame(t); if (cityReady && t > MAP0 - .5 && t < MAP1 + .5) { await idle(); frame(t); } await raf2(); } };
  }
})();
