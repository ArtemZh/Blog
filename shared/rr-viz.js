/* Стаття 41 «Доба супермаркету»: сцени розділів. Мова — з PMP_LANG (сторінка перезавантажується при перемиканні), тексти сцен — парами L(uk, en).
   Факти (IFR, BLS, Eurostat, звіти компаній) — у статті з джерелами. Калькулятори — навчальні припущення, кожне підписане на сцені й змінюване. Стан сцен — window.__rr. */
(function () {
  const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk);
  const $ = (id) => document.getElementById(id), SND = (k) => { if (window.RR_SND) RR_SND.fx(k); };
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), MONO = '"Roboto Mono", monospace', SANS = 'Inter, system-ui, sans-serif', REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const num = (v, d = 0) => Number(v).toLocaleString(EN ? 'en-GB' : 'uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d }), T = window.__rr = {};
  const sc = (s, html) => { const b = document.createElement('div'); b.className = 'oc-sc rr-sc'; b.innerHTML = html; s.appendChild(b); return b; };
  const used = (e) => e && e.classList.add('used');
  // полотно: DPR, висота від ширини, анімація лише на екрані
  function stage(cv, hFn, draw) { const x = cv.getContext('2d'), s = { W: 1, H: 1, vis: false, anim: false, raf: 0, last: 0, x };
    s.size = () => { const d = Math.min(2, devicePixelRatio || 1); s.W = cv.clientWidth || 1; s.H = hFn(s.W); cv.style.height = s.H + 'px'; cv.width = s.W * d; cv.height = s.H * d; x.setTransform(d, 0, 0, d, 0, 0); draw(x, s.W, s.H, 0); };
    s.paint = () => draw(x, s.W, s.H, 0);
    const loop = (now) => { const dt = Math.min(.05, (now - s.last) / 1000); s.last = now; draw(x, s.W, s.H, dt); s.raf = s.vis && s.anim ? requestAnimationFrame(loop) : 0; };
    s.go = () => { s.anim = true; if (s.vis && !s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(loop); } };
    s.stop = () => { s.anim = false; };
    new ResizeObserver(s.size).observe(cv); new IntersectionObserver((e) => { s.vis = e[0].isIntersecting; if (s.vis && s.anim && !s.raf) s.go(); }).observe(cv); return s; }
  const txt = (x, s, X, Y, o = {}) => { x.font = `${o.w || 500} ${o.n || 11}px ${o.f || MONO}`; x.textAlign = o.a || 'left'; x.fillStyle = o.c || 'rgba(235,245,248,.8)'; x.fillText(s, X, Y); };
  const slider = (lab, id, min, max, step, val) => `<label class="oc-r">${lab} <b data-o="${id}"></b><input type="range" data-i="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;

  /* ═════ 01 · ніч: склад. Вартість замовлення від обсягу: руками в магазині, мікроцентр у магазині, великий автоматизований центр ═════ */
  (function () { const s = $('rr-mfc'); if (!s) return;
    // припущення (підписані на сцені): хвилин праці на замовлення ~50 позицій, фіксовані витрати на рік на одну площадку, місткість площадки
    const M = [
      { id: 'man', t: L('Руками в магазині', 'Picked in store'), min: 40, fix: 0, cap: 400, c: '#e8a33f' },
      { id: 'mfc', t: L('Мікроцентр у магазині', 'Micro-fulfilment in store'), min: 15, fix: 600000, cap: 1500, c: '#7fe3e0' },
      { id: 'cfc', t: L('Великий автоматизований центр', 'Large automated centre'), min: 6, fix: 10000000, cap: 12000, c: '#b48cff' }];
    const b = sc(s, `<canvas aria-label="${L('Вартість одного замовлення залежно від кількості замовлень на день', 'Cost of one order versus orders per day')}"></canvas>
      <div class="rr-ctl">${slider(L('Замовлень на день', 'Orders per day'), 'n', 0, 1000, 1, 380)}${slider(L('Година праці, €', 'Labour hour, €'), 'w', 12, 57, .5, 34.9)}</div>
      <div class="oc-ro" data-ro></div><div class="oc-card" data-c></div>
      <p class="oc-note">${L('Припущення, не дані клієнта: замовлення ≈ 50 позицій; руками 40 хв, мікроцентр 15 хв, великий центр 6 хв праці; фіксовані витрати на рік 0 / 0,6 млн / 10 млн €; місткість площадки 400 / 1 500 / 12 000 замовлень на день. Коли обсяг більший — додається ще площадка. 34,9 € — середня година праці в ЄС 2025 (Eurostat).', 'Assumptions, not client data: an order ≈ 50 items; 40 min of labour by hand, 15 min in a micro-fulfilment centre, 6 min in a large centre; fixed cost per year 0 / €0.6m / €10m; site capacity 400 / 1,500 / 12,000 orders a day. Above capacity another site is added. €34.9 is the average EU labour hour in 2025 (Eurostat).')}</p>`);
    const cv = b.querySelector('canvas'), I = {}, O = {}; b.querySelectorAll('[data-i]').forEach((e) => { I[e.dataset.i] = e; }); b.querySelectorAll('[data-o]').forEach((e) => { O[e.dataset.o] = e; });
    const N = (p) => Math.round(30 * Math.pow(20000 / 30, p / 1000)), P = (n) => 1000 * Math.log(n / 30) / Math.log(20000 / 30);   // логарифмічна шкала 30…20 000
    const cost = (m, n, w) => m.min / 60 * w + m.fix * Math.ceil(n / m.cap) / (n * 365);
    const st = stage(cv, (W) => Math.max(260, Math.min(360, W * .42)), draw);
    function draw(x, W, H) { const n = N(+I.n.value), w = +I.w.value, l = 46, r = W - 14, t = 18, bt = H - 30, YM = 40, X = (v) => l + (r - l) * P(v) / 1000, Y = (v) => bt - (bt - t) * Math.min(v, YM) / YM;
      x.fillStyle = '#04101c'; x.fillRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 1; for (let v = 0; v <= YM; v += 10) { x.beginPath(); x.moveTo(l, Y(v)); x.lineTo(r, Y(v)); x.stroke(); txt(x, v + ' €', l - 6, Y(v) + 4, { a: 'right' }); }
      [30, 100, 300, 1000, 3000, 10000, 20000].forEach((v, i, A) => txt(x, v >= 1000 ? v / 1000 + (EN ? 'k' : ' тис.') : String(v), X(v), H - 12, { a: i ? (i === A.length - 1 ? 'right' : 'center') : 'left' }));
      let lx = r; [...M].reverse().forEach((m) => { x.font = `600 11px ${MONO}`; const w = x.measureText(m.t).width; lx -= w; txt(x, m.t, lx, 12, { c: m.c, w: 600 }); lx -= 16; });
      M.forEach((m) => { x.strokeStyle = m.c; x.lineWidth = 2.4; x.beginPath(); for (let p = 0; p <= 1000; p += 4) { const v = N(p), y = Y(cost(m, v, w)); p ? x.lineTo(X(v), y) : x.moveTo(X(v), y); } x.stroke(); });
      const X0 = X(n); x.strokeStyle = 'rgba(255,255,255,.55)'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X0, t); x.lineTo(X0, bt); x.stroke(); x.setLineDash([]);
      M.forEach((m) => { const y = Y(cost(m, n, w)); x.fillStyle = m.c; x.beginPath(); x.arc(X0, y, 5, 0, 6.3); x.fill(); });
      txt(x, L('€ за замовлення', '€ per order'), l, 12, { c: 'rgba(235,245,248,.6)' }); }
    function upd() { const n = N(+I.n.value), w = +I.w.value, cs = M.map((m) => cost(m, n, w)), best = cs.indexOf(Math.min(...cs)); O.n.textContent = num(n); O.w.textContent = num(w, 1);
      b.querySelector('[data-ro]').innerHTML = M.map((m, i) => `<div${i === best ? ' class="rr-best"' : ''}><small>${m.t}</small><b style="color:${m.c}">${num(cs[i], 2)} €</b></div>`).join('');
      // точка, з якої великий центр дешевший за мікроцентр
      let be = null; for (let p = 0; p <= 1000; p++) { const v = N(p); if (cost(M[2], v, w) < cost(M[1], v, w)) { be = v; break; } }
      b.querySelector('[data-c]').innerHTML = `<b>${L('Найдешевше зараз', 'Cheapest now')}: ${M[best].t}</b>${be ? L(`Великий центр стає дешевшим за мікроцентр десь від ${num(be)} замовлень на день. Поки обсягу немає, його 10 млн € на рік ділиться на мало замовлень. Саме так Kroger недовантажив центри Ocado.`, `The large centre beats micro-fulfilment from about ${num(be)} orders a day. Until the volume is there, its €10m a year is shared by too few orders. That is how Kroger ended up with under-used Ocado centres.`) : L('За цих припущень великий центр не стає найдешевшим на жодному обсягу.', 'Under these assumptions the large centre is never the cheapest.')}`;
      st.paint(); T.mfc = { n, w, cost: cs.map((v) => +v.toFixed(2)), best: M[best].id, breakEven: be }; }
    Object.values(I).forEach((e) => e.addEventListener('input', () => { used(e); upd(); }));
    st.size(); upd(); })();

  /* ═════ 02 · ранок: полиця. Порожні місця за день і як швидко їх знаходять ═════ */
  (function () { const s = $('rr-shelf'); if (!s) return;
    const R = 4, C = 14, DAY = 16;   // 4 полиці × 14 позицій, торговий день 16 годин
    const MODES = [
      { id: 'hum', t: L('Людина, обхід раз на день', 'Person, one walk a day'), scans: [4] },
      { id: 'r2', t: L('Робот, два обходи', 'Robot, two passes'), scans: [3, 9] },
      { id: 'r8', t: L('Робот, кожні дві години', 'Robot, every two hours'), scans: [0, 2, 4, 6, 8, 10, 12, 14] }];
    // детерміновані «покупки»: коли позиція порожніє (година від відкриття) або ніколи
    const rnd = (i) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    const base = Array.from({ length: R * C }, (_, i) => (rnd(i) < .28 ? 1 + rnd(i + 99) * 13 : null));
    let mode = 0, t = 0, play = false, empt = base.slice(), seen = [];
    const fillAt = (i, m) => { const e = empt[i]; if (e == null) return null; const nx = MODES[m].scans.find((h) => h >= e); return nx == null ? DAY : Math.min(DAY, nx + 1); };   // через годину після обходу полицю заповнюють
    const lost = (m) => empt.reduce((a, e, i) => a + (e == null ? 0 : fillAt(i, m) - e), 0);
    const b = sc(s, `<canvas aria-label="${L('Полиця магазину: клік робить позицію порожньою', 'Store shelf: click a slot to empty it')}" style="cursor:pointer"></canvas>
      <div class="fg-bar">${MODES.map((m, i) => `<button type="button" class="rc-btn${i === mode ? ' on' : ''}" data-m="${i}">${m.t}</button>`).join('')}<button type="button" class="rc-btn oc-glow" data-p>▶ ${L('Прожити день', 'Run the day')}</button><button type="button" class="rc-btn" data-r>↺</button></div>
      <div class="rr-bars" data-bars></div><div class="oc-card" data-c></div>
      <p class="oc-note">${L('Модель: 56 позицій, торговий день 16 годин, порожнє місце заповнюють за годину після того, як його знайшли. Клікніть позицію, щоб покупець забрав останню пачку. Частка порожніх місць — припущення сцени, не дані Simbe.', 'Model: 56 slots, a 16-hour trading day, a gap is refilled an hour after it is found. Click a slot to have a shopper take the last pack. The share of gaps is a scene assumption, not Simbe data.')}</p>`);
    const cv = b.querySelector('canvas'), btnP = b.querySelector('[data-p]'); let hits = [];
    const st = stage(cv, (W) => Math.max(230, Math.min(320, W * .36)), draw);
    function draw(x, W, H, dt) { if (play) { t += dt * 2.2; if (t >= DAY) { t = DAY; play = false; st.stop(); btnP.textContent = '↺ ' + L('Ще раз', 'Again'); } upd(false); }
      x.fillStyle = '#0b1622'; x.fillRect(0, 0, W, H); hits = [];
      const pad = 16, top = 30, sh = (H - top - 34) / R, cw = (W - pad * 2) / C, m = MODES[mode];
      const pal = ['#e46f4f', '#e8c23f', '#58c27d', '#5aa7e8', '#c78ae8', '#f09a5b'];
      for (let r = 0; r < R; r++) { const y = top + r * sh; x.fillStyle = '#2a3642'; x.fillRect(pad - 4, y + sh - 5, W - pad * 2 + 8, 5);
        for (let c = 0; c < C; c++) { const i = r * C + c, e = empt[i], f = fillAt(i, mode), gone = e != null && t >= e && t < f, X0 = pad + c * cw;
          hits.push({ i, X: X0, Y: y, w: cw, h: sh });
          if (!gone) { x.fillStyle = pal[(i * 7 + r) % pal.length]; for (let k = 0; k < 3; k++) x.fillRect(X0 + 3 + k * (cw - 6) / 3, y + 6, (cw - 6) / 3 - 2, sh - 13); }
          else { const found = m.scans.some((h) => h >= e && h <= t); x.strokeStyle = found ? '#ffd29a' : 'rgba(255,90,70,.75)'; x.lineWidth = 2; x.setLineDash(found ? [] : [4, 3]); x.strokeRect(X0 + 3, y + 6, cw - 6, sh - 13); x.setLineDash([]);
            if (found) txt(x, '!', X0 + cw / 2, y + sh / 2 + 4, { a: 'center', w: 700, n: 13, c: '#ffd29a' }); } } }
      // робот або людина, що йде вздовж полиці в години обходу
      m.scans.forEach((h) => { if (t >= h && t < h + 1) { const X1 = pad + (t - h) * (W - pad * 2); x.fillStyle = mode ? '#7fe3e0' : '#ffd29a'; x.fillRect(X1 - 4, top - 6, 8, H - top - 22); x.globalAlpha = .18; x.fillRect(X1 - 16, top - 6, 32, H - top - 22); x.globalAlpha = 1; } });
      const hh = Math.floor(t), mm = Math.floor((t - hh) * 60); txt(x, `${String(7 + hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, pad, 18, { w: 700, n: 13, c: '#fff' });
      txt(x, m.t, W - pad, 18, { a: 'right' }); }
    function upd(paint = true) { const ls = MODES.map((_, i) => lost(i)), mx = Math.max(...ls, 1);
      b.querySelector('[data-bars]').innerHTML = MODES.map((m, i) => `<div${i === mode ? ' class="on"' : ''}><span>${m.t}</span><i><b style="width:${ls[i] / mx * 100}%"></b></i><em>${num(ls[i], 1)} ${L('год', 'h')}</em></div>`).join('');
      const tot = R * C * DAY, av = 100 * (1 - ls[mode] / tot);
      b.querySelector('[data-c]').innerHTML = `<b>${L('Години порожньої полиці за день', 'Hours of empty shelf per day')}: ${num(ls[mode], 1)}</b>${L(`Наявність товару ${num(av, 1)} %. Робот не продає більше сам по собі: він раніше бачить дірку. Виграш дає частота обходів і те, чи хтось встигає заповнити полицю. Walmart 2020 року вирішив, що люди роблять це майже так само, і зупинив 500 роботів Bossa Nova.`, `On-shelf availability ${num(av, 1)}%. A robot doesn't sell more by itself: it sees the gap sooner. The gain comes from how often it passes and whether someone refills in time. In 2020 Walmart decided people do roughly the same job and stopped 500 Bossa Nova robots.`)}`;
      if (paint) st.paint(); T.shelf = { mode: MODES[mode].id, lost: ls.map((v) => +v.toFixed(1)), t: +t.toFixed(2) }; }
    b.querySelectorAll('[data-m]').forEach((e) => e.addEventListener('click', () => { mode = +e.dataset.m; b.querySelectorAll('[data-m]').forEach((q) => q.classList.toggle('on', q === e)); SND('click'); upd(); }));
    btnP.addEventListener('click', () => { used(btnP); if (t >= DAY) t = 0; if (REDUCE) { t = DAY; upd(); return; } play = !play; btnP.textContent = play ? '❚❚ ' + L('Пауза', 'Pause') : '▶ ' + L('Далі', 'Continue'); play ? st.go() : st.stop(); SND('click'); });
    b.querySelector('[data-r]').addEventListener('click', () => { play = false; st.stop(); t = 0; empt = base.slice(); btnP.textContent = '▶ ' + L('Прожити день', 'Run the day'); upd(); });
    cv.addEventListener('click', (ev) => { const r = cv.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top, h = hits.find((q) => mx >= q.X && mx < q.X + q.w && my >= q.Y && my < q.Y + q.h); if (!h) return;
      empt[h.i] = empt[h.i] != null && empt[h.i] <= t + .01 && empt[h.i] >= t - .01 ? null : Math.min(DAY - .01, Math.max(t, .01)); SND('click'); upd(); });
    t = 9; st.size(); upd(); })();

  /* ═════ 03 · день: зал. Зони магазину і статус технологій ═════ */
  (function () { const s = $('rr-floor'); if (!s) return;
    const ST = { go: L('працює за гроші', 'paid at scale'), try: L('пілоти', 'pilots'), back: L('згорнуто або звужено', 'rolled back'), early: L('рано', 'early') };
    const Z = [
      { id: 'back', x: 0, y: 0, w: 100, h: 26, t: L('Склад і збирання', 'Back room and picking'), s: 'go', d: L('AutoStore: близько 1 850 систем у 63 країнах (кінець 2025, з беклогом). Walmart і Symbotic — автоматизовані розподільчі центри та 400 мікроцентрів у магазинах за умови, що система виправдає себе. Kroger 2025 року закрив три центри Ocado.', 'AutoStore: about 1,850 systems in 63 countries (end of 2025, incl. backlog). Walmart and Symbotic: automated distribution centres and 400 in-store micro-fulfilment systems, if performance targets are met. In 2025 Kroger closed three Ocado centres.') },
      { id: 'shelf', x: 0, y: 26, w: 62, h: 44, t: L('Полиці', 'Shelves'), s: 'try', d: L('Simbe Tally — близько 1 000 магазинів (2024), Tesco тестує в Британії. Brain Corp сканує полиці в чеській мережі Albert (Ahold Delhaize). Walmart 2020 року зупинив 500 роботів Bossa Nova. Масштаб є, але це ще не стандарт.', 'Simbe Tally: about 1,000 stores (2024), Tesco is testing it in the UK. Brain Corp scans shelves at Albert in Czechia (Ahold Delhaize). Walmart stopped 500 Bossa Nova robots in 2020. There is scale, but it is not yet the norm.') },
      { id: 'floor', x: 62, y: 26, w: 38, h: 44, t: L('Підлога', 'Floor'), s: 'go', d: L('Найтихіша перемога: автономні мийки. Brain Corp — понад 50 000 роботів на BrainOS у всіх галузях, рітейл серед найбільших. Робот миє, поки людина розкладає товар.', 'The quietest win: autonomous scrubbers. Brain Corp has over 50,000 BrainOS robots across industries, with retail among the largest. The robot cleans while people stock shelves.') },
      { id: 'kitchen', x: 0, y: 70, w: 34, h: 30, t: L('Кухня й кава', 'Kitchen and coffee'), s: 'try', d: L('Роботи-кухарі й баристи — у пілотах і окремих мережах. Żabka в Польщі поставила робота, що готує хот-доги, в один магазин Nano. Окупність залежить від потоку замовлень у годину пік.', 'Robot cooks and baristas are in pilots and a few chains. Żabka in Poland put a hot-dog robot into one Nano store. Payback depends on order flow at peak hour.') },
      { id: 'till', x: 34, y: 70, w: 33, h: 30, t: L('Каса', 'Checkout'), s: 'back', d: L('Магазин без кас виявився дорожчим, ніж обіцяли. Amazon у квітні 2024 прибрав Just Walk Out із великих магазинів Fresh у США й поставив розумні візки. У малих форматах він живе: Żabka Nano — близько 50 магазинів, технологія AiFi.', 'The checkout-free store proved costlier than promised. In April 2024 Amazon removed Just Walk Out from its large US Fresh stores and installed smart carts. It survives in small formats: Żabka Nano has about 50 stores on AiFi technology.') },
      { id: 'door', x: 67, y: 70, w: 33, h: 30, t: L('Двері й доставка', 'Door and delivery'), s: 'go', d: L('Starship — понад 10 млн доставок і понад 3 000 роботів (весна 2026), переважно кампуси й міста Європи. В Україні Bolt обіцяє пілоти після війни.', 'Starship: over 10 million deliveries and more than 3,000 robots (spring 2026), mostly campuses and European towns. In Ukraine Bolt promises pilots after the war.') }];
    const b = sc(s, `<div class="rr-plan" role="group" aria-label="${L('План магазину', 'Store plan')}">${Z.map((z) => `<button type="button" data-z="${z.id}" class="rr-z ${z.s}" style="left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%"><b>${z.t}</b><small>${ST[z.s]}</small></button>`).join('')}</div>
      <p class="rr-leg">${Object.keys(ST).filter((k) => Z.some((z) => z.s === k)).map((k) => `<span class="${k}">${ST[k]}</span>`).join('')}</p>
      <ol class="rr-log">${Z.map((z) => `<li data-i="${z.id}"><div class="rr-log__h"><b>${z.t}</b><span class="rr-st ${z.s}">${ST[z.s]}</span></div><p>${z.d}</p></li>`).join('')}</ol>`);
    // усі описи відкриті списком; клік по зоні чи рядку лише підсвічує пару «зона — рядок»
    const pick = (id) => { b.querySelectorAll('[data-z]').forEach((e) => e.classList.toggle('on', e.dataset.z === id)); b.querySelectorAll('.rr-log [data-i]').forEach((e) => e.classList.toggle('on', e.dataset.i === id)); T.floor = id; };
    b.querySelectorAll('[data-z], .rr-log [data-i]').forEach((e) => e.addEventListener('click', () => { pick(e.dataset.z || e.dataset.i); SND('click'); })); T.floor = null; })();

  /* ═════ 04 · вечір: доставка. Вартість однієї доставки кур'єром і роботом ═════ */
  (function () { const s = $('rr-last'); if (!s) return;
    const b = sc(s, `<canvas aria-label="${L('Вартість доставки кур’єром і роботом залежно від відстані', 'Delivery cost by courier and robot versus distance')}"></canvas>
      <div class="rr-ctl">${slider(L('Відстань в один бік, км', 'One-way distance, km'), 'd', .5, 6, .1, 1.5)}${slider(L('Година кур’єра, €', 'Courier hour, €'), 'w', 8, 40, .5, 20)}${slider(L('Робот на день (оренда, нагляд), €', 'Robot per day (lease, supervision), €'), 'r', 20, 120, 1, 60)}</div>
      <div class="oc-ro" data-ro></div><div class="oc-card" data-c></div>
      <p class="oc-note">${L('Модель: кур’єр 15 км/год, робот 6 км/год (обидва повертаються порожніми), передача замовлення 5 хв; робот працює 12 годин на день; один оператор наглядає за кількома роботами — це входить у денну вартість. Числа — припущення сцени.', 'Model: courier 15 km/h, robot 6 km/h (both return empty), handover 5 min; the robot works 12 hours a day; one operator supervises several robots, included in the daily cost. Numbers are scene assumptions.')}</p>`);
    const cv = b.querySelector('canvas'), I = {}, O = {}; b.querySelectorAll('[data-i]').forEach((e) => { I[e.dataset.i] = e; }); b.querySelectorAll('[data-o]').forEach((e) => { O[e.dataset.o] = e; });
    const cour = (d, w) => (2 * d / 15 + 5 / 60) * w, trips = (d) => Math.floor(12 / (2 * d / 6 + 5 / 60)), robot = (d, r) => r / Math.max(1, trips(d));
    const st = stage(cv, (W) => Math.max(240, Math.min(320, W * .38)), draw);
    function draw(x, W, H) { const d0 = +I.d.value, w = +I.w.value, r = +I.r.value, l = 44, rt = W - 14, t = 16, bt = H - 30, YM = 25, X = (d) => l + (rt - l) * (d - .5) / 5.5, Y = (v) => bt - (bt - t) * Math.min(v, YM) / YM;
      x.fillStyle = '#04101c'; x.fillRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.08)'; for (let v = 0; v <= YM; v += 5) { x.beginPath(); x.moveTo(l, Y(v)); x.lineTo(rt, Y(v)); x.stroke(); txt(x, v + ' €', l - 6, Y(v) + 4, { a: 'right' }); }
      for (let d = 1; d <= 6; d++) txt(x, d + ' km', X(d), H - 12, { a: 'center' });
      [[(d) => cour(d, w), '#e8a33f'], [(d) => robot(d, r), '#7fe3e0']].forEach(([f, c]) => { x.strokeStyle = c; x.lineWidth = 2.4; x.beginPath(); for (let d = .5; d <= 6.001; d += .05) { const y = Y(f(d)); d === .5 ? x.moveTo(X(d), y) : x.lineTo(X(d), y); } x.stroke(); });
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X(d0), t); x.lineTo(X(d0), bt); x.stroke(); x.setLineDash([]);
      txt(x, L('кур’єр', 'courier'), rt, Y(cour(6, w)) - 6, { a: 'right', c: '#e8a33f', w: 700 }); txt(x, L('робот', 'robot'), rt, Y(robot(6, r)) + 14, { a: 'right', c: '#7fe3e0', w: 700 }); }
    function upd() { const d = +I.d.value, w = +I.w.value, r = +I.r.value, c = cour(d, w), rb = robot(d, r), n = trips(d); O.d.textContent = num(d, 1); O.w.textContent = num(w, 1); O.r.textContent = num(r);
      b.querySelector('[data-ro]').innerHTML = `<div${c <= rb ? ' class="rr-best"' : ''}><small>${L('Кур’єр', 'Courier')}</small><b>${num(c, 2)} €</b></div><div${rb < c ? ' class="rr-best"' : ''}><small>${L('Робот', 'Robot')}</small><b>${num(rb, 2)} €</b></div><div><small>${L('Доставок робота на день', 'Robot deliveries a day')}</small><b>${n}</b></div>`;
      b.querySelector('[data-c]').innerHTML = `<b>${rb < c ? L('Робот дешевший', 'The robot is cheaper') : L('Кур’єр дешевший', 'The courier is cheaper')}</b>${L('Робот повільний, тож що далі, то менше він встигає за день і то дорожча кожна доставка. Його поле — короткі маршрути з густим попитом: кампус, спальний район біля магазину. Там, де година кур’єра дешева, робот програє і на коротких.', 'The robot is slow, so the farther it goes, the fewer trips it makes and the more each one costs. Its field is short routes with dense demand: a campus, a neighbourhood next to the store. Where a courier hour is cheap, the robot loses even on short runs.')}`;
      st.paint(); T.last = { d, courier: +c.toFixed(2), robot: +rb.toFixed(2), trips: n }; }
    Object.values(I).forEach((e) => e.addEventListener('input', () => { used(e); upd(); }));
    st.size(); upd(); })();

  /* ═════ 05 · завтра: ринок за IFR і що вже працює ═════ */
  (function () { const s = $('rr-ifr'); if (!s) return;
    // IFR World Robotics, Service Robots 2024/2025/2026: продажі професійних сервісних роботів, тис. шт.; null — немає опублікованого числа
    const Y = [2023, 2024, 2025], D = [
      { t: L('Усі професійні', 'All professional'), v: [null, 199, 250], c: '#d8dee4' },
      { t: L('Транспорт і логістика', 'Transport and logistics'), v: [null, 102.9, 117.5], c: '#b48cff' },
      { t: L('Гостинність', 'Hospitality'), v: [54, 42, null], c: '#e8a33f' },
      { t: L('Професійне прибирання', 'Professional cleaning'), v: [null, 25, null], c: '#7fe3e0' }];
    const TR = [
      { t: L('Склади й розподільчі центри', 'Warehouses and DCs'), s: 'go', d: L('Найбільший сегмент IFR і найбільші чеки: Symbotic у Walmart — близько 6 млрд $ на 25 регіональних центрів (жовтень 2026).', 'The largest IFR segment and the largest cheques: Symbotic at Walmart, about $6bn for 25 regional centres (October 2026).') },
      { t: L('Прибирання й сканування', 'Cleaning and scanning'), s: 'go', d: L('Перейшло від пілотів до парків: Brain Corp +68 % розгортань за пів року 2026.', 'Moved from pilots to fleets: Brain Corp +68% deployments in H1 2026.') },
      { t: L('Доставка тротуаром', 'Sidewalk delivery'), s: 'go', d: L('Starship — понад 10 млн доставок (весна 2026). Масштаб є, але в межах кампусів і окремих міст.', 'Starship: over 10 million deliveries (spring 2026). Real scale, but within campuses and certain towns.') },
      { t: L('Гуманоїди', 'Humanoids'), s: 'try', d: L('На складах, не в магазинах: Agility Digit у GXO переніс понад 100 000 ящиків і їде ще на два майданчики з 2027. GXO каже про 45 пілотів гуманоїдів.', 'In warehouses, not stores: Agility Digit at GXO has moved over 100,000 totes and goes to two more sites from 2027. GXO speaks of 45 humanoid pilots.') },
      { t: L('Магазин без кас', 'Checkout-free store'), s: 'back', d: L('Звузився до малих форматів: Amazon прибрав Just Walk Out із великих Fresh у 2024.', 'Shrunk to small formats: Amazon removed Just Walk Out from large Fresh stores in 2024.') }];
    const ST = { go: L('працює за гроші', 'paid at scale'), try: L('пілоти', 'pilots'), back: L('звужено', 'rolled back') };
    const b = sc(s, `<canvas aria-label="${L('Продажі професійних сервісних роботів за IFR', 'Professional service robot sales, IFR')}"></canvas><p class="oc-note">${L('Тисячі штук на рік, усі галузі, не лише рітейл. Порожньо — IFR не публікував число в доступних звітах.', 'Thousands of units a year, all industries, not only retail. Blank: IFR did not publish the figure in the reports we could access.')}</p>
      <ol class="rr-log">${TR.map((q) => `<li><div class="rr-log__h"><b>${q.t}</b><span class="rr-st ${q.s}">${ST[q.s]}</span></div><p>${q.d}</p></li>`).join('')}</ol>`);
    const cv = b.querySelector('canvas'), st = stage(cv, (W) => Math.max(230, Math.min(300, W * .34)), draw);
    function draw(x, W, H) { x.fillStyle = '#04101c'; x.fillRect(0, 0, W, H); const l = 14, r = W - 14, top = 22, bt = H - 40, gw = (r - l) / D.length, MX = 260;
      D.forEach((g, i) => { const X0 = l + i * gw, bw = Math.min(34, (gw - 26) / 3);
        g.v.forEach((v, k) => { const X1 = X0 + 10 + k * (bw + 4); if (v == null) { x.strokeStyle = 'rgba(255,255,255,.2)'; x.setLineDash([3, 3]); x.strokeRect(X1, bt - 18, bw, 18); x.setLineDash([]); txt(x, '—', X1 + bw / 2, bt - 5, { a: 'center' }); }
          else { const h = (bt - top) * v / MX; x.fillStyle = g.c; x.globalAlpha = .45 + k * .27; x.fillRect(X1, bt - h, bw, h); x.globalAlpha = 1; txt(x, num(v, v % 1 ? 1 : 0), X1 + bw / 2, bt - h - 4, { a: 'center', n: 10 }); }
          txt(x, String(Y[k]).slice(2), X1 + bw / 2, bt + 12, { a: 'center', n: 10, c: 'rgba(235,245,248,.55)' }); });
        txt(x, g.t, X0 + 10, bt + 28, { n: 10.5, w: 600, c: g.c }); });
      txt(x, L('тис. шт.', 'thousand units'), l, 12, { c: 'rgba(235,245,248,.6)' }); }
    st.size(); })();

  /* ═════ 06 · світ і Європа: один робот-мийник, різна вартість години ═════ */
  (function () { const s = $('rr-eu'); if (!s) return;
    // Eurostat 2025, уся економіка (€/год): не рітейл окремо — це підписано на сцені
    const C = [['BG', L('Болгарія', 'Bulgaria'), 12.0], ['RO', L('Румунія', 'Romania'), 13.6], ['HU', L('Угорщина', 'Hungary'), 15.2], ['EU', L('Середнє ЄС', 'EU average'), 34.9], ['EA', L('Єврозона', 'Euro area'), 38.2], ['NL', L('Нідерланди', 'Netherlands'), 47.9], ['DK', L('Данія', 'Denmark'), 51.7], ['LU', L('Люксембург', 'Luxembourg'), 56.8]];
    const b = sc(s, `<div class="rr-ctl">${slider(L('Годин прибирання на день, які бере робот', 'Cleaning hours a day the robot takes'), 'h', 1, 8, .5, 3)}${slider(L('Оренда робота на місяць, €', 'Robot lease per month, €'), 'r', 500, 3000, 50, 1500)}${slider(L('Частка часу без людини, %', 'Share of time without a person, %'), 'a', 50, 100, 5, 80)}</div>
      <div class="rr-bars rr-eu" data-bars></div><div class="oc-card" data-c></div>
      <p class="oc-note">${L('Вартість години — Eurostat, 2025, уся економіка, бо окремого рівня для рітейлу в доступних таблицях немає; у рітейлі вона нижча. Оренда робота й години — припущення, змінюйте їх. Для порівняння: у рітейлі США година коштує роботодавцю 26,41 $ (BLS, грудень 2025).', 'Hourly cost: Eurostat 2025, whole economy, as no retail-only level is in the tables we could access; retail is lower. Robot lease and hours are assumptions; change them. For comparison, a retail hour costs a US employer $26.41 (BLS, December 2025).')}</p>`);
    const I = {}, O = {}; b.querySelectorAll('[data-i]').forEach((e) => { I[e.dataset.i] = e; }); b.querySelectorAll('[data-o]').forEach((e) => { O[e.dataset.o] = e; });
    function upd() { const h = +I.h.value, r = +I.r.value, a = +I.a.value / 100; O.h.textContent = num(h, 1); O.r.textContent = num(r); O.a.textContent = num(a * 100);
      const net = C.map((c) => h * 30.4 * a * c[2] - r), mx = Math.max(...net.map(Math.abs), 1), be = r / (h * 30.4 * a);
      b.querySelector('[data-bars]').innerHTML = C.map((c, i) => `<div class="${net[i] >= 0 ? 'pos' : 'neg'}"><span>${c[1]} · ${num(c[2], 1)} €</span><i><b style="width:${Math.abs(net[i]) / mx * 100}%"></b></i><em>${net[i] >= 0 ? '+' : '−'}${num(Math.abs(net[i]))} €</em></div>`).join('');
      const pos = C.filter((_, i) => net[i] >= 0).map((c) => c[1]);
      b.querySelector('[data-c]').innerHTML = `<b>${L('Робот окупається, якщо година дорожча за', 'The robot pays off if an hour costs more than')} ${num(be, 1)} €</b>${pos.length ? L(`Зараз у плюсі: ${pos.join(', ')}. `, `In profit now: ${pos.join(', ')}. `) : L('Зараз не окупається ніде. ', 'Right now it pays off nowhere. ')}${L('Та сама машина, той самий договір, а рішення протилежні. Тому в Західній Європі роботи йдуть у зал раніше, ніж у Східній, а в США рішення приймають на рівні тисяч магазинів одразу.', 'Same machine, same contract, opposite decisions. That is why robots reach the shop floor earlier in Western than in Eastern Europe, and in the US the decision is taken for thousands of stores at once.')}`;
      T.eu = { breakEven: +be.toFixed(1), net: net.map((v) => Math.round(v)) }; }
    Object.values(I).forEach((e) => e.addEventListener('input', () => { used(e); upd(); })); upd(); })();

  /* ═════ 07 · для пресейлу: з чого почати з клієнтом (авторська рамка) ═════ */
  (function () { const s = $('rr-pick'); if (!s) return;
    const F = [['hyper', L('Гіпермаркет', 'Hypermarket')], ['super', L('Супермаркет', 'Supermarket')], ['conv', L('Магазин біля дому', 'Convenience store')], ['egro', L('Онлайн-продукти', 'Online grocery')], ['dc', L('Розподільчий центр', 'Distribution centre')]];
    const RG = [['us', L('США', 'US')], ['we', L('Західна Європа', 'Western Europe')], ['ee', L('Центральна й Східна Європа', 'Central and Eastern Europe')], ['ua', L('Україна', 'Ukraine')]];
    const V = [['lo', L('мало онлайн-замовлень', 'few online orders')], ['mid', L('середньо', 'medium')], ['hi', L('багато', 'many')]];
    // бали: формат × регіон × обсяг. Регіон множить сценарії, де головне — вартість праці; обсяг — сценарії збирання замовлень.
    const U = [
      { id: 'clean', t: L('Автономне прибирання', 'Autonomous cleaning'), f: { hyper: 5, super: 4, conv: 1, egro: 1, dc: 3 }, lab: 1, q: L('Скільки годин на день миють підлогу і хто це робить: свій персонал чи підрядник?', 'How many hours a day is the floor cleaned, and by whom: own staff or a contractor?') },
      { id: 'scan', t: L('Сканування полиць', 'Shelf scanning'), f: { hyper: 5, super: 4, conv: 1, egro: 0, dc: 1 }, lab: .5, q: L('Яка зараз наявність товару і хто встигає заповнити полицю, коли робот знайде дірку?', 'What is on-shelf availability today, and who will refill when the robot finds a gap?') },
      { id: 'mfc', t: L('Мікроцентр у магазині', 'In-store micro-fulfilment'), f: { hyper: 4, super: 3, conv: 0, egro: 3, dc: 1 }, vol: 1, lab: .5, q: L('Скільки онлайн-замовлень на день з одного магазину і як вони ростуть?', 'How many online orders a day per store, and how fast are they growing?') },
      { id: 'cfc', t: L('Великий автоматизований центр', 'Large automated centre'), f: { hyper: 1, super: 1, conv: 0, egro: 5, dc: 4 }, vol: 2, lab: .5, q: L('Чи є обсяг, щоб завантажити центр із першого року, і де він стоїть відносно клієнтів?', 'Is there volume to fill the centre from year one, and where is it relative to customers?') },
      { id: 'dc', t: L('Автоматизація розподільчого центру', 'Distribution-centre automation'), f: { hyper: 2, super: 2, conv: 2, egro: 2, dc: 5 }, lab: 1, q: L('Скільки магазинів обслуговує центр і яка частка ручного комплектування?', 'How many stores does the centre serve, and what share of picking is manual?') },
      { id: 'walk', t: L('Магазин без кас', 'Checkout-free store'), f: { hyper: 0, super: 1, conv: 4, egro: 0, dc: 0 }, lab: .5, reg: { ua: -2 }, q: L('Чи готові покупці до камер і як це узгоджено з GDPR чи місцевим законом?', 'Are shoppers ready for cameras, and how does it fit GDPR or local law?') },
      { id: 'deliv', t: L('Роботи-кур’єри', 'Delivery robots'), f: { hyper: 1, super: 2, conv: 3, egro: 3, dc: 0 }, lab: 1, reg: { ua: -3 }, q: L('Чи дозволяє місто роботів на тротуарах і наскільки густий попит у радіусі 2 км?', 'Does the city allow sidewalk robots, and how dense is demand within 2 km?') },
      { id: 'hum', t: L('Гуманоїди', 'Humanoids'), f: { hyper: 0, super: 0, conv: 0, egro: 1, dc: 2 }, lab: .3, q: L('Яке завдання не можна вирішити звичайним мобільним роботом? Якщо такого немає — гуманоїд не потрібен.', 'Which task cannot be done by an ordinary mobile robot? If none, a humanoid is not needed.') }];
    const LAB = { us: 1, we: 1.2, ee: .55, ua: .45 }, VOL = { lo: 0, mid: 1, hi: 2 };
    let f = 'super', rg = 'we', v = 'mid';
    const seg = (k, arr, cur, lab) => `<div class="rr-seg" data-k="${k}"><small>${lab}</small>${arr.map((a) => `<button type="button" data-v="${a[0]}"${a[0] === cur ? ' class="on"' : ''}>${a[1]}</button>`).join('')}</div>`;
    const b = sc(s, `${seg('f', F, f, L('Формат', 'Format'))}${seg('rg', RG, rg, L('Регіон', 'Region'))}${seg('v', V, v, L('Обсяг', 'Volume'))}<div class="rr-rank" data-out></div><p class="oc-note">${L('Авторська рамка для першої розмови з клієнтом, не дані: формат дає базу, регіон множить сценарії, де головне — економія праці, обсяг онлайн-замовлень вирішує для збирання. Україна — з поправкою на війну й правила для тротуарів.', 'Our own framework for a first client conversation, not data: format sets the base, region scales the cases driven by labour savings, online volume decides for order picking. Ukraine is adjusted for the war and sidewalk rules.')}</p>`);
    function upd() { const sc2 = U.map((u) => { let p = u.f[f] * (1 + (LAB[rg] - 1) * (u.lab || 0)); if (u.vol) p *= VOL[v] >= u.vol ? 1.2 : VOL[v] === u.vol - 1 ? .6 : .2; p += (u.reg && u.reg[rg]) || 0; return { u, p: Math.max(0, p) }; }).sort((a, c) => c.p - a.p);
      const mx = Math.max(sc2[0].p, 1); b.querySelector('[data-out]').innerHTML = sc2.map((q, i) => `<div${i < 3 && q.p > 0 ? ' class="top"' : ''}><b>${i + 1}. ${q.u.t}</b><i><u style="width:${q.p / mx * 100}%"></u></i><span>${q.p > 0 ? q.u.q : L('Для цього профілю не варто починати з цього.', 'Not a place to start for this profile.')}</span></div>`).join('');
      T.pick = { f, rg, v, order: sc2.map((q) => q.u.id) }; }
    b.querySelectorAll('[data-k]').forEach((g) => g.querySelectorAll('button').forEach((e) => e.addEventListener('click', () => { g.querySelectorAll('button').forEach((q) => q.classList.toggle('on', q === e)); const k = g.dataset.k; if (k === 'f') f = e.dataset.v; else if (k === 'rg') rg = e.dataset.v; else v = e.dataset.v; SND('click'); upd(); })));
    upd(); })();
})();
