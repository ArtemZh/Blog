/* Стаття 35 «Рецесія в США»: усі 2D-візуалізації (канвас і DOM). Дані — window.RC_DATA (shared/rc-data.js, знімок FRED на 20.10.2026).
   Банер-барометр · 01 «шість разів» · 02 комітет NBER · 03 пʼять років на графіку · 04 сигнали, що зламалися · 05 панель приладів ·
   06 нафта · 07 частка ШІ у зростанні · 08 K-споживач · 10 сценарії · 11 календар. 3D-вежа ШІ — окремо, rc-ai3d.js. */
(function () {
  const RD = window.RC_DATA; if (!RD) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const nf = (v, d = 1) => v == null ? '—' : v.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sgn = (v, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + nf(Math.abs(v), d);
  const DPR = () => Math.min(2, devicePixelRatio || 1);
  const MONO = '"Roboto Mono", ui-monospace, monospace', SANS = 'Inter, system-ui, sans-serif';
  const MN = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
  const mLabel = (m) => MN[+m.slice(5) - 1] + ' ' + m.slice(0, 4);
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function fit(c) { const d = DPR(), w = c.clientWidth || 1, h = c.clientHeight || 1;
    if (c.width !== Math.round(w * d) || c.height !== Math.round(h * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
    const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h); return { x, w, h }; }
  function seen(el, cb, th = .25) { const io = new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), { threshold: th }); io.observe(el); }
  function once(el, cb, th = .25) { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); cb(); } }, { threshold: th }); io.observe(el); }
  // текст-результат під міні-графіками 04 змінюється ASCII-змітанням (rc-fx.js), перший раз — без ефекту
  const rsSet = (e, t) => { if (e.textContent === t) return; if (window.RC_SWEEP && e.dataset.init) RC_SWEEP(e, t, { dur: 700 }); else { e.textContent = t; e.dataset.init = 1; } };
  const SND = (k, a) => { if (window.RC_SND) RC_SND.fx(k, a); };   // звук сторінки (rc-sound.js), якщо увімкнено
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  // ряди: кожен стовпець — масив за місяцями
  const C = {}; RD.cols.forEach((k, i) => { C[k] = RD.rows.map((r) => r[i]); });
  const M = C.m, N = M.length, idx = (m) => M.indexOf(m);
  const last = (k) => { for (let i = N - 1; i >= 0; i--) if (C[k][i] != null) return [C[k][i], M[i]]; return [null, null]; };

  /* ═════ банер: барометр оцінок ймовірності рецесії ═════ */
  (function () {
    const b = $('rcBaro'); if (!b) return;
    const R = [['Polymarket', 6.5, 'до кінця 2026'], ['Kalshi', 8, 'до кінця 2026, серпень'], ['U.S. Bank', 25, '12 міс., жовтень'], ['Goldman Sachs', 30, '12 міс., березень'], ['J.P. Morgan', 35, 'на 2026, прогноз року']];
    b.innerHTML = '<h4>Ймовірність рецесії — оцінки</h4>' + R.map(([n, v, s]) => `<div class="row" title="${s}"><span>${n}</span><div class="bar"><i style="left:0;width:0"></i></div><b>${nf(v, v % 1 ? 1 : 0)} %</b></div>`).join('') +
      '<small>ринки прогнозів — «технічне» правило; банки — власні моделі. Шкала 0–50 %</small>';
    const bars = [...b.querySelectorAll('.bar i')];
    setTimeout(() => bars.forEach((i, k) => setTimeout(() => { i.style.width = (R[k][1] / 50 * 100) + '%'; }, k * 160)), 600);
  })();

  /* ═════ 01: шість разів «майже» ═════ */
  (function () {
    const s = $('rc-almost'); if (!s) return;
    const E = [
      ['2022-06', '2022', 'Інфляція 9,1 %', 'Найвища інфляція з 1981 року, реальні зарплати падають.', 'ФРС почала найрізкіше за 40 років підвищення ставки — з нуля до 5,25–5,50 % за 16 місяців.', 'Найм тримався: понад 350 тис. нових робочих місць щомісяця.'],
      ['2022-06', 'I–II кв. 2022', '«Технічна рецесія»', 'ВВП у перших оцінках упав два квартали поспіль: −1,6 % і −0,9 %.', 'NBER рецесії не визнав; після переглядів II квартал став плюсовим (+0,6 %).', 'Падали запаси й торгівля, а зайнятість і доходи росли.'],
      ['2023-03', '2022–2024', 'Крива й банки', 'Крива 10р−2р перевернулася в липні 2022-го й трималася так понад два роки — рекорд. У березні 2023-го впав SVB.', 'Рецесії не сталося. ФРС і Мінфін за вихідні гарантували вклади.', 'Інверсію роздули очікування інфляції й рекордне підвищення ставок, а не очікування кризи.'],
      ['2024-08', 'серпень 2024', 'Правило Сам', 'Безробіття 4,3 %, показник 0,53–0,57 — правило, яке з 1970-х не помилялося.', 'Безробіття відступило, правило відкотилося до нуля.', 'Росла пропозиція праці (імміграція), а не звільнення. Сама Клаудія Сам погодилася.'],
      ['2025-04', '2025', 'Мита, спад, шатдаун', 'ВВП у I кварталі −0,3 %; перегляд: на 911 тис. робочих місць менше; шатдаун 43 дні.', 'Далі +4,0 % і +3,9 % у II і III кварталах; сьогоднішня редакція I кварталу — +0,1 %.', 'Імпорт перед митами «зʼїв» ~4,7 п.п. ВВП — бухгалтерія, а не падіння попиту.'],
      ['2026-03', '2026', 'Нафтовий шок', 'Удари по Ірану, блокада Ормузу, нафта понад $100, настрої — рекордний мінімум.', 'ВВП +2,5 % і +2,2 %; ФРС підвищує ставку.', 'Шок бʼє по цінах, а не по зайнятості. Поки що.']];
    const box = el('div', 'rc-al');
    box.innerHTML = E.map((e) => `<div class="rc-al__r" data-m="${e[0]}" tabindex="0" role="button" aria-label="${e[2]}: перейти на графік">
      <div class="d"><b>${e[2]}</b>${e[1]}</div><div class="c cry"><span>що кричало</span>${e[3]}</div><div class="c"><span>що сталося</span>${e[4]}</div>
      <div class="c why"><span>чому не рецесія</span>${e[5]}<br><em class="v">рецесії не було</em></div></div>`).join('');
    s.appendChild(box);
    const rows = [...box.children];
    once(box, () => rows.forEach((r, k) => setTimeout(() => r.classList.add('in'), REDUCE ? 0 : k * 220)), .1);
    rows.forEach((r) => { const go = () => { SND('whoosh'); dispatchEvent(new CustomEvent('rc-goto', { detail: r.dataset.m })); $('years').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' }); };
      r.addEventListener('click', go); r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
  })();

  /* ═════ 02: хто вирішує — комітет NBER проти правила «двох кварталів» ═════ */
  (function () {
    const s = $('rc-who'); if (!s) return;
    const EP = RD.ep, keys = Object.keys(EP);
    const NOTE = { '2001': 'Офіційна рецесія без двох кварталів спаду ВВП поспіль: падали промисловість і продажі, зайнятість — 8 місяців поспіль.',
      '2008': 'Усі чотири ряди падали глибоко й довго — 18 місяців. Класична рецесія за будь-яким правилом.',
      '2020': 'Найглибший і найкоротший спад в історії: 2 місяці. Комітет визнав рецесію, бо падіння було надто глибоким і широким.',
      '2022': 'ВВП падав (у перших оцінках — два квартали), а зайнятість і доходи росли. NBER рецесії не визнав. Сьогоднішні дані BEA показують II квартал у плюсі.',
      '2025': 'Перша оцінка I кварталу — −0,3 % через стрибок імпорту перед митами. Усі місячні ряди трималися; квартал згодом переглянули до +0,1 %.' };
    const IND = [['payems', 'зайнятість'], ['income', 'реальні доходи'], ['indpro', 'промисловість'], ['sales', 'реальні продажі']];
    const box = el('div', 'rc-who');
    box.innerHTML = `<div class="rc-who__bar seg" role="group" aria-label="Епізод">${keys.map((k) => `<button type="button" data-k="${k}">${EP[k].t}</button>`).join('')}</div>
      <div class="rc-who__g"><div><div class="rc-who__ind">${IND.map(([k, n]) => `<div class="it" data-i="${k}"><span>${n}</span><div class="tr"><i></i></div><b></b></div>`).join('')}</div>
        <p class="chint" style="margin-top:8px">Найбільше падіння від початку епізоду, %. Шкала до −17 %. Дані FRED: PAYEMS, W875RX1, INDPRO, CMRMTSPL.</p>
        <div class="rc-who__v"><div><span>Правило «два квартали спаду ВВП»</span><b data-v="t"></b></div><div><span>Комітет NBER</span><b data-v="n"></b></div></div>
        <p class="rc-who__note"></p></div>
        <div class="rc-who__qw"><div class="ttl">Реальний ВВП, % річних, поквартально <button type="button" class="rc-btn" data-first hidden style="margin-left:8px;padding:5px 8px;font-size:11px">перші оцінки</button></div><div class="rc-who__q"></div></div></div>`;
    s.appendChild(box);
    const q = box.querySelector('.rc-who__q'), fb = box.querySelector('[data-first]'); let cur = '2008', first = false;
    function show(k) {
      cur = k; const e = EP[k];
      box.querySelectorAll('.rc-who__bar button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      IND.forEach(([i]) => { const v = e[i], it = box.querySelector(`[data-i="${i}"]`); it.querySelector('i').style.width = Math.min(100, Math.max(0, -v) / 17 * 100) + '%'; it.querySelector('b').textContent = v < 0 ? sgn(v, 1) + ' %' : 'не падала'; });
      fb.hidden = !e.first; if (!e.first) first = false; fb.classList.toggle('on', first);
      let g = e.gdp.map((r) => r.slice());
      if (first && e.first) e.first.forEach(([p, v]) => { const r = g.find((x) => x[0] === p); if (r) r[1] = v; });
      const mx = 10, H = 58;
      q.innerHTML = g.map(([p, v]) => { const h = Math.min(H, Math.abs(v) / mx * H); return `<div class="q ${v < 0 ? 'neg' : ''}" style="height:50%"><i style="height:${h}px"></i>${v < 0 ? '' : `<em>${sgn(v, 1)}</em>`}<small>${p}</small>${v < 0 ? `<em style="bottom:auto;top:calc(100% + ${h + 16}px)">${sgn(v, 1)}</em>` : ''}</div>`; }).join('');
      let two = false; for (let i = 1; i < g.length; i++) if (g[i][1] < 0 && g[i - 1][1] < 0) two = true;
      const t = box.querySelector('[data-v=t]'), n = box.querySelector('[data-v=n]');
      t.textContent = two ? 'рецесія' : 'ні'; t.className = two ? 'y' : 'n';
      n.textContent = e.nber ? `рецесія, ${e.months} міс.` : 'ні'; n.className = e.nber ? 'y' : 'n';
      box.querySelector('.rc-who__note').textContent = NOTE[k] + (first ? ' Зараз показано перші оцінки BEA.' : '');
    }
    box.querySelectorAll('.rc-who__bar button').forEach((b) => b.addEventListener('click', () => { first = false; show(b.dataset.k); SND(EP[b.dataset.k].nber ? 'thud' : 'click'); }));
    fb.addEventListener('click', () => { first = !first; show(cur); SND('click'); });
    // нульова лінія графіка ВВП — посередині: стовпчики вгору й униз від неї
    show('2008');
  })();

  /* ═════ 03: пʼять років на одному графіку ═════ */
  const EVENTS = [
    ['2020-03', 'Пандемія', 'Найглибший і найкоротший спад в історії: за два місяці зникли 22 млн робочих місць. Офіційна рецесія — лютий–квітень 2020.'],
    ['2022-03', 'ФРС починає', 'Перше підвищення ставки з 2018 року. Далі — найрізкіший цикл за 40 років.'],
    ['2022-06', 'Інфляція 9,1 %', 'Пік інфляції з 1981 року. Настрої споживачів — тодішній рекордний мінімум 50,0.'],
    ['2022-07', 'Крива перевернулася', 'Спред 10р−2р нижче нуля — і так понад два роки.'],
    ['2023-03', 'Крах SVB', 'Банкрутство Silicon Valley Bank і кількох регіональних банків. Вклади гарантовано за вихідні.'],
    ['2023-07', 'Пік ставки', '5,25–5,50 % — найвище з 2001 року.'],
    ['2024-08', 'Правило Сам', 'Показник 0,57 — вище порогу 0,50. Рецесії не сталося.'],
    ['2024-09', 'ФРС знижує', 'Перше зниження ставки, одразу на 0,5 п.п.'],
    ['2025-04', '«День звільнення»', 'Мита 2 квітня 2025 року; перед ними — стрибок імпорту й «спад» ВВП у I кварталі.'],
    ['2025-10', 'Шатдаун', '43 дні без уряду — найдовший в історії. Частину статистики за жовтень так і не опублікували.'],
    ['2026-03', 'Нафтовий шок', 'Удари по Ірану (28 лютого), блокада Ормузу, нафта з $65 до $90+.'],
    ['2026-05', 'Мінімум настроїв', 'Індекс Мічигану 44,8 — найнижчий за всю історію спостережень. 22 травня ФРС очолив Кевін Ворш.'],
    ['2026-09', 'ФРС підвищує', 'Перше підвищення з 2023 року: 3,75–4,00 %. Інфляція 3,7 %, найм +29 тис.']];
  (function () {
    const s = $('rc-years'); if (!s) return;
    const box = el('div', 'rc-yr');
    box.innerHTML = `<canvas aria-label="Шість показників економіки США, 2019–2026"></canvas><div class="rc-yr__ev"></div><div class="rc-yr__card"></div>
      <div class="rc-yr__bar"><button type="button" class="rc-btn" data-play>▶ прожити 2019–2026</button><input type="range" min="0" max="${N - 1}" value="${N - 1}" step="1" aria-label="Місяць"><span class="rc-yr__m"></span></div>`;
    s.appendChild(box);
    const cv = box.querySelector('canvas'), sl = box.querySelector('input'), mo = box.querySelector('.rc-yr__m'), ev = box.querySelector('.rc-yr__ev'), card = box.querySelector('.rc-yr__card'), play = box.querySelector('[data-play]');
    // панелі: [ключ(і), назва, мін, макс, поріг, підпис порогу, колір, формат]
    const P = [
      { k: ['unrate'], t: 'Безробіття, %', lo: 3, hi: 7.5, col: ['#7fb2ff'], f: 1, note: 'квітень 2020: 14,8 % — за межами шкали' },
      { k: ['sahm'], t: 'Правило Сам', lo: -.3, hi: 1.1, th: .5, thT: 'поріг 0,50', col: ['#ffb27a'], f: 2, note: '2020: до 9,3 — за межами шкали' },
      { k: ['cpi', 'core'], t: 'Інфляція р/р, % · базова', lo: -.5, hi: 9.5, th: 2, thT: 'ціль ФРС 2 %', col: ['#ff7a6b', '#ffd28a'], f: 1 },
      { k: ['ffr'], t: 'Ставка ФРС, %', lo: 0, hi: 5.8, col: ['#9fe3b8'], f: 2 },
      { k: ['t10y2y'], t: 'Спред 10р−2р, п.п.', lo: -1.2, hi: 1.6, th: 0, thT: 'нижче нуля — інверсія', col: ['#c7a8ff'], f: 2, inv: 1 },
      { k: ['wti'], t: 'Нафта WTI, $/бар.', lo: 15, hi: 125, col: ['#e7c05a'], f: 0, note: 'квітень 2020: ф\'ючерс ішов у мінус, середня за місяць — $17' },
      { k: ['umcs'], t: 'Настрої споживачів (Мічиган)', lo: 40, hi: 105, col: ['#8fd6ff'], f: 1 }];
    const NAME = { unrate: 'безробіття', sahm: 'правило Сам', cpi: 'інфляція', core: 'базова', ffr: 'ставка ФРС', t10y2y: '10р−2р', wti: 'нафта', umcs: 'настрої', claims: 'заявки, тис.', mort: 'іпотека', payroll: 'нові роб. місця, тис.' };
    let cur = N - 1, reveal = N - 1, hover = -1, playing = false, evT = 0, raf = 0;
    const L = { l: 14, r: 70, t: 30, b: 26 };
    function geo(w, h) { const ph = (h - L.t - L.b) / P.length; const X = (i) => L.l + (w - L.l - L.r) * i / (N - 1); return { ph, X }; }
    function draw() {
      const { x, w, h } = fit(cv), { ph, X } = geo(w, h);
      // офіційна рецесія 2020 (лютий–квітень)
      x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(X(idx('2020-02')), L.t - 6, X(idx('2020-04')) - X(idx('2020-02')) + 2, h - L.t - L.b + 6);
      // роки
      x.font = `500 10px ${MONO}`; x.fillStyle = 'rgba(233,237,245,.45)'; x.textAlign = 'center';
      for (let y = 2019; y <= 2026; y++) { const i = idx(y + '-01'); if (i < 0) continue; x.strokeStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.moveTo(X(i), L.t - 4); x.lineTo(X(i), h - L.b); x.stroke(); x.fillText(y, X(i) + 18, h - 8); }
      // події — маленькі мітки вгорі
      EVENTS.forEach(([m]) => { const i = idx(m); if (i < 0) return; x.fillStyle = i <= reveal ? '#ffb27a' : 'rgba(255,178,122,.3)'; x.beginPath(); x.moveTo(X(i), L.t - 6); x.lineTo(X(i) - 4, L.t - 14); x.lineTo(X(i) + 4, L.t - 14); x.fill(); });
      P.forEach((p, pi) => {
        const y0 = L.t + pi * ph, Y = (v) => y0 + ph - 6 - (Math.max(p.lo, Math.min(p.hi, v)) - p.lo) / (p.hi - p.lo) * (ph - 16);
        x.strokeStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.moveTo(L.l, y0 + ph); x.lineTo(w - L.r, y0 + ph); x.stroke();
        x.font = `600 10.5px ${SANS}`; x.fillStyle = 'rgba(233,237,245,.7)'; x.textAlign = 'left'; x.fillText(p.t, L.l + 4, y0 + 12);
        if (p.note && w > 640) { const tw = x.measureText(p.t).width; x.font = `500 9.5px ${MONO}`; x.fillStyle = 'rgba(233,237,245,.38)'; x.fillText(p.note, L.l + 18 + tw, y0 + 12); }
        if (p.th != null) { x.setLineDash([3, 4]); x.strokeStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.moveTo(L.l, Y(p.th)); x.lineTo(w - L.r, Y(p.th)); x.stroke(); x.setLineDash([]);
          x.font = `500 9.5px ${MONO}`; x.fillStyle = 'rgba(233,237,245,.42)'; x.textAlign = 'right'; x.fillText(p.thT, w - L.r - 4, Y(p.th) - 3); }
        p.k.forEach((k, ki) => {
          const a = C[k];
          // інверсія кривої — заливка нижче нуля
          if (p.inv && k === 't10y2y') { x.fillStyle = 'rgba(255,90,70,.28)'; for (let i = 0; i < Math.min(N, reveal + 1); i++) { const v = a[i]; if (v != null && v < 0) { x.fillRect(X(i) - 1.5, Y(0), 3.2, Y(v) - Y(0)); } } }
          for (let pass = 0; pass < 2; pass++) {
            x.strokeStyle = p.col[ki]; x.globalAlpha = pass ? 1 : .18; x.lineWidth = ki ? 1.4 : 2; x.beginPath(); let on = false;
            for (let i = 0; i < N; i++) { if (pass && i > reveal) break; const v = a[i]; if (v == null) { on = false; continue; } const px = X(i), py = Y(v); on ? x.lineTo(px, py) : x.moveTo(px, py); on = true; }
            x.stroke();
          }
          x.globalAlpha = 1;
          // значення в позиції курсора
          let j = Math.min(cur, reveal); while (j > 0 && a[j] == null) j--;
          if (a[j] != null) { x.fillStyle = p.col[ki]; x.beginPath(); x.arc(X(j), Y(a[j]), 3.4, 0, 7); x.fill();
            x.font = `600 11px ${MONO}`; x.textAlign = 'left'; x.fillText(nf(a[j], p.f), w - L.r + 6, y0 + 22 + ki * 14); }
        });
      });
      // курсор
      const cx = X(cur); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx, L.t - 4); x.lineTo(cx, h - L.b); x.stroke();
      if (hover >= 0 && hover !== cur) { x.strokeStyle = 'rgba(255,255,255,.2)'; x.beginPath(); x.moveTo(X(hover), L.t - 4); x.lineTo(X(hover), h - L.b); x.stroke(); }
      mo.textContent = mLabel(M[cur]);
    }
    function showEv(i) { const e = EVENTS.find((z) => idx(z[0]) === i); if (!e) return false; SND('event', EVENTS.indexOf(e)); ev.innerHTML = `<b>${mLabel(e[0])} · ${e[1]}</b>${e[2]}`; ev.classList.add('on'); clearTimeout(evT); evT = setTimeout(() => ev.classList.remove('on'), playing ? 2600 : 5000); return true; }
    function showCard(i) { const rows = ['unrate', 'sahm', 'cpi', 'core', 'ffr', 't10y2y', 'wti', 'umcs', 'claims', 'mort', 'payroll'];
      card.innerHTML = `<h5>${mLabel(M[i])}</h5>` + rows.map((k) => `<div><span>${NAME[k]}</span><b>${C[k][i] == null ? 'немає даних' : nf(C[k][i], k === 'claims' || k === 'payroll' || k === 'wti' ? 0 : k === 'sahm' || k === 't10y2y' ? 2 : 1)}</b></div>`).join('');
      card.classList.add('on'); clearTimeout(card.t); card.t = setTimeout(() => card.classList.remove('on'), 6000); }
    const set = (i, card2) => { cur = Math.max(0, Math.min(N - 1, i)); sl.value = cur; if (!playing) reveal = N - 1; draw(); if (card2) { showCard(cur); showEv(cur); } };
    sl.addEventListener('input', () => { stop(); set(+sl.value); showEv(cur); });
    const iAt = (e) => { const r = cv.getBoundingClientRect(), { X } = geo(r.width, r.height); return Math.round((e.clientX - r.left - L.l) / (r.width - L.l - L.r) * (N - 1)); };
    cv.addEventListener('pointermove', (e) => { hover = iAt(e); if (!playing) draw(); });
    cv.addEventListener('pointerleave', () => { hover = -1; if (!playing) draw(); });
    cv.addEventListener('click', (e) => { stop(); SND('blip'); set(iAt(e), true); });
    function stop() { playing = false; cancelAnimationFrame(raf); play.classList.remove('on'); play.textContent = '▶ прожити 2019–2026'; reveal = N - 1; }
    play.addEventListener('click', () => {
      if (playing) { stop(); draw(); return; }
      playing = true; play.classList.add('on'); play.textContent = '❚❚ пауза'; let i = cur >= N - 1 ? 0 : cur, t0 = performance.now(), hold = 0;
      const step = (now) => { if (!playing) return;
        const dt = now - t0; t0 = now; if (hold > 0) { hold -= dt; raf = requestAnimationFrame(step); return; }
        i += dt / 1000 * (REDUCE ? 40 : 7); const ii = Math.min(N - 1, Math.floor(i));
        if (ii !== cur) { cur = ii; reveal = ii; sl.value = ii; SND('tick'); if (showEv(ii)) hold = 1500; draw(); }
        if (ii >= N - 1) { stop(); draw(); return; } raf = requestAnimationFrame(step); };
      reveal = Math.floor(i); raf = requestAnimationFrame(step); });
    addEventListener('rc-goto', (e) => { stop(); set(idx(e.detail), true); });
    new ResizeObserver(() => draw()).observe(cv); draw();
  })();

  /* ═════ 04: сигнали, що зламалися ═════ */
  (function () {
    const s = $('rc-broken'); if (!s) return;
    const box = el('div', 'rc-br'); s.appendChild(box);
    function fig(t, k) { const f = el('figure'); f.innerHTML = `<h4>${t}</h4><p class="k">${k}</p><canvas></canvas><div class="bt"></div><div class="rs"></div>`; box.appendChild(f);
      return { f, cv: f.querySelector('canvas'), bt: f.querySelector('.bt'), rs: f.querySelector('.rs') }; }
    const btn = (p, t, on) => { const b = el('button', 'rc-btn' + (on ? ' on' : ''), t); b.type = 'button'; p.bt.appendChild(b); b.addEventListener('click', () => SND('click')); return b; };
    // спільний лінійний графік за діапазоном місяців
    function lines(c, from, to, sers, lo, hi, opt = {}) {
      const { x, w, h } = fit(c), a = idx(from), b = idx(to), n = b - a, X = (i) => 30 + (w - 40) * (i - a) / n, Y = (v) => 10 + (h - 30) * (1 - (v - lo) / (hi - lo));
      x.font = `500 9.5px ${MONO}`; x.fillStyle = css('--ink-3') || '#889'; x.textAlign = 'center';
      for (let i = a; i <= b; i++) if (M[i].endsWith('-01')) { x.strokeStyle = 'rgba(128,128,128,.15)'; x.beginPath(); x.moveTo(X(i), 8); x.lineTo(X(i), h - 20); x.stroke(); x.fillText(M[i].slice(0, 4), X(i) + 14, h - 6); }
      x.textAlign = 'right'; [lo, (lo + hi) / 2, hi].forEach((v) => x.fillText(nf(v, opt.f ?? 1), 26, Y(v) + 3));
      (opt.th || []).forEach(([v, t]) => { x.setLineDash([3, 4]); x.strokeStyle = 'rgba(128,128,128,.6)'; x.beginPath(); x.moveTo(30, Y(v)); x.lineTo(w - 10, Y(v)); x.stroke(); x.setLineDash([]); x.textAlign = 'right'; x.fillText(t, w - 12, Y(v) - 4); });
      sers.forEach(({ k, col, fill, data }) => { const arr = data || C[k];
        if (fill) { x.fillStyle = fill; for (let i = a; i <= b; i++) { const v = arr[i]; if (v != null && v < 0) x.fillRect(X(i) - 2, Y(0), (w - 40) / n + .5, Y(v) - Y(0)); } }
        x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); let on = false; for (let i = a; i <= b; i++) { const v = arr[i]; if (v == null) { on = false; continue; } on ? x.lineTo(X(i), Y(v)) : x.moveTo(X(i), Y(v)); on = true; } x.stroke(); });
      return { X, Y };
    }
    // а) крива дохідності
    { const p = fig('Крива дохідності', 'Коли короткі ставки вищі за довгі (спред нижче нуля), рецесія з 1970-х приходила в середньому за рік. 2022–2024: найдовша інверсія в історії — і жодної рецесії.');
      let m3 = false; const inv = C.t10y2y.filter((v, i) => v != null && v < 0 && M[i] >= '2022-01').length;
      const d = () => { lines(p.cv, '2019-01', M[N - 1], [{ k: 't10y2y', col: '#8a63d2', fill: 'rgba(224,83,42,.22)' }].concat(m3 ? [{ k: 't10y3m', col: '#1E968C' }] : []), -2, 2, { th: [[0, 'інверсія нижче']] });
        rsSet(p.rs, m3 ? 'Спред 10р−3міс (бірюзовий) — улюблений індикатор ФРС — теж був нижче нуля понад два роки.' : `Спред 10р−2р нижче нуля ${inv} місяців поспіль (середні за місяць). Попередній рекорд — 1978 рік.`); };
      const b = btn(p, 'додати 10р−3міс'); b.addEventListener('click', () => { m3 = !m3; b.classList.toggle('on', m3); d(); }); new ResizeObserver(d).observe(p.cv); }
    // б) правило Сам
    { const p = fig('Правило Сам', 'Якщо середнє безробіття за 3 місяці на 0,5 п.п. вище за мінімум попередніх 12 місяців — рецесія вже почалася. Улітку 2024-го правило спрацювало.');
      let cl = false; const d = () => { const sers = [{ k: 'sahm', col: '#E0532A' }];
        if (cl) { const a = C.claims.map((v) => v == null ? null : (v - 100) / 400); sers.push({ data: a, col: '#4678DC' }); }
        lines(p.cv, '2023-01', M[N - 1], sers, -.2, 1, { th: [[.5, 'поріг 0,50']], f: 2 });
        rsSet(p.rs, cl ? 'Сині — первинні заявки на допомогу (шкала умовна: 0,25 ≈ 200 тис., 0,5 ≈ 300 тис. на тиждень): трималися близько 200–260 тис., звільнень не побільшало. Безробіття росло, бо швидко росла робоча сила — переважно через імміграцію.' : 'Пік — 0,57 у серпні 2024. Рецесії не було; показник відкотився до нуля.'); };
      const b = btn(p, 'накласти звільнення'); b.addEventListener('click', () => { cl = !cl; b.classList.toggle('on', cl); d(); }); new ResizeObserver(d).observe(p.cv); }
    // в) ВВП I кв. 2025 — бухгалтерія імпорту
    { const p = fig('«Спад» ВВП на початку 2025-го', 'Імпорт віднімається з ВВП. Перед митами компанії скуповували товари за кордоном, імпорт злетів на 38 % — і перша оцінка показала мінус.');
      const V = { a: [['перша оцінка', -.3]], b: [['перша оцінка', -.3], ['внесок імпорту', -4.7], ['без стрибка імпорту', 4.4]], c: [['перша оцінка', -.3], ['сьогодні (BEA)', .1]] };
      let st = 'a'; const T = { a: 'Перша оцінка BEA, квітень 2025: −0,3 % річних.', b: 'Без імпортного стрибка зростання було б близько +4,4 %: попит усередині країни не падав.', c: 'Після переглядів BEA I квартал 2025-го — +0,1 %: «спаду» вже немає навіть на папері.' };
      const d = () => { const { x, w, h } = fit(p.cv), r = V[st], z = h * .55, sc = (h * .4) / 5, bw = Math.min(90, (w - 40) / r.length - 18);
        x.strokeStyle = 'rgba(128,128,128,.5)'; x.beginPath(); x.moveTo(10, z); x.lineTo(w - 10, z); x.stroke();
        r.forEach(([t, v], i) => { const cx = 20 + (w - 40) * (i + .5) / r.length; x.fillStyle = v < 0 ? '#E0532A' : '#1E968C'; x.fillRect(cx - bw / 2, v < 0 ? z : z - v * sc, bw, Math.abs(v) * sc);
          x.font = `600 12px ${MONO}`; x.fillStyle = css('--ink') || '#111'; x.textAlign = 'center'; x.fillText(sgn(v, 1) + (t === 'внесок імпорту' ? ' п.п.' : ' %'), cx, v < 0 ? z + Math.abs(v) * sc + 14 : z - v * sc - 6);
          x.font = `500 11px ${SANS}`; x.fillStyle = css('--ink-3') || '#667'; x.fillText(t, cx, 14); });
        rsSet(p.rs, T[st]); };
      const bs = [['a', 'перша оцінка'], ['b', 'прибрати імпорт'], ['c', 'сьогоднішні дані']].map(([k, t]) => { const b = btn(p, t, k === 'a'); b.addEventListener('click', () => { st = k; bs.forEach((z) => z.classList.toggle('on', z === b)); d(); }); return b; });
      new ResizeObserver(d).observe(p.cv); }
    // г) настрої проти витрат
    { const p = fig('Опитування кричать, гаманці — ні', 'Індекс настроїв Мічигану у 2022 і 2026 роках опускався нижче, ніж у 2008-му. Але реальні витрати споживачів (з поправкою на ціни) за ці роки майже не падали.');
      let pce = false; const pc = M.map((m) => RD.pce[m] ?? null), pcS = pc.map((v) => v == null ? null : 40 + v * 6);
      const d = () => { lines(p.cv, '2022-01', M[N - 1], [{ k: 'umcs', col: '#4678DC' }].concat(pce ? [{ data: pcS, col: '#1E968C' }] : []), 40, 100, { f: 0, th: pce ? [[40, 'витрати: 0 % р/р']] : [] });
        rsSet(p.rs, pce ? 'Бірюзова — реальні витрати споживачів, % за рік (0 % — на нижній межі, крок шкали ≈ 1,7 п.п.): увесь час вище нуля.' : 'Рекордний мінімум — 44,8 у травні 2026 року. Люди скаржаться на ціни, але купують.'); };
      const b = btn(p, 'накласти реальні витрати'); b.addEventListener('click', () => { pce = !pce; b.classList.toggle('on', pce); d(); }); new ResizeObserver(d).observe(p.cv); }
  })();

  /* ═════ 05: панель приладів ═════ */
  (function () {
    const s = $('rc-now'); if (!s) return;
    const G = { g: '#1E968C', y: '#D9A21B', r: '#E0532A' };
    const T = [
      ['ВВП, II кв. 2026', '+2,2 %', 'річних · BEA, 3-тя оцінка', 'g', null, 'Реальний ВВП. I квартал — +2,5 %. Модель GDPNow Атланти дає III кварталу ~3,5 %. Перша офіційна оцінка III кварталу — 29 жовтня.'],
      ['Безробіття', nf(last('unrate')[0], 1) + ' %', 'вересень · у серпні 4,1 %', 'g', 'unrate', 'BLS. 7,1 млн безробітних. Для спрацювання правила Сам потрібно приблизно 4,7–4,8 %.'],
      ['Правило Сам', nf(last('sahm')[0], 2), 'поріг 0,50', 'g', 'sahm', 'FRED SAHMREALTIME. Різниця між середнім безробіттям за 3 місяці та мінімумом за рік.'],
      ['Нові робочі місця', '+29 тис.', 'вересень · липень −10 тис.', 'y', 'payroll', 'BLS, з переглядом липня й серпня (−60 тис. разом). Охорона здоров\'я +17 тис., фінанси −7 тис. Зарплати +3,0 % за рік.'],
      ['Заявки на допомогу', '199 тис.', 'тиждень до 10.10 · поріг ~300', 'g', 'claims', 'Мінтруд США. Нижче 200 тис. четвертий тиждень: звільнень мало.'],
      ['Інфляція (ІСЦ)', '3,7 %', 'вересень, р/р · базова 2,6 %', 'r', 'cpi', 'BLS. За місяць +0,6 %, бензин +9,1 % за місяць і +34,2 % за рік — понад половина зростання.'],
      ['Ставка ФРС', '3,75–4,00 %', '16.09 — перше підвищення з 2023', 'y', 'ffr', 'Рішення одностайне. Медіана прогнозів учасників — ще +0,25 п.п. до кінця 2026.'],
      ['Крива 10р−2р', '+' + nf(last('t10y2y')[0], 2), 'п.п. · жовтень · не інвертована', 'g', 't10y2y', 'FRED T10Y2Y, середнє за жовтень. Інверсія закінчилася восени 2024-го.'],
      ['Нафта WTI', '~$' + Math.round(last('wti')[0]), 'середня за жовтень · 20.10 ~$109', 'r', 'wti', 'EIA через FRED, плюс біржові котирування 20.10.2026. До лютого 2026-го — близько $65.'],
      ['Настрої (Мічиган)', '46,3', 'жовтень, попередня · мінімум 44,8', 'r', 'umcs', 'Поточні умови — 44,7, рекорд. Очікувана інфляція на рік — 4,7 %.'],
      ['Іпотека 30 р.', nf(last('mort')[0], 2) + ' %', 'Freddie Mac · найвища з 2023', 'r', 'mort', 'Продажі на вторинному ринку — 3,98 млн річним темпом (серпень).'],
      ['ISM, промисловість', '54,5', 'вересень · ціни 77,9', 'g', null, 'Дев\'ятий місяць зростання. Але індекс цін на вході — найвищий від початку війни з Іраном.'],
      ['LEI Conference Board', '99,5', 'серпень · 6 міс. −0,1 %', 'y', null, 'Сигнал «рецесії» — падіння понад 4 % річних кілька місяців поспіль. Далеко, але індекс тривалий час слабкий.'],
      ['Борги домогосподарств', '$18,8 трлн', 'II кв. 2026 · картки $1,26 трлн', 'y', null, 'NY Fed. Автокредити $1,71 трлн — рекорд. Нові прострочки по картках і авто — на підвищеному рівні.']];
    const box = el('div', 'rc-dash'); s.appendChild(box);
    box.innerHTML = T.map(([n, v, sub, c, k, more], i) => `<div class="rc-g" style="--c:${G[c]}" data-i="${i}" tabindex="0" role="button"><i class="dot"></i><span>${n}</span><b>${v}</b><small>${sub}</small>${k ? '<canvas></canvas>' : ''}<div class="more">${more}</div></div>`).join('');
    s.appendChild(el('div', 'rc-dash__leg', `<span><i style="background:${G.g}"></i>далеко від порогу</span><span><i style="background:${G.y}"></i>стежити</span><span><i style="background:${G.r}"></i>тиск</span><span>лінія — останні 24 місяці</span>`));
    const spark = () => box.querySelectorAll('.rc-g').forEach((g) => { const c = g.querySelector('canvas'); if (!c) return; const k = T[+g.dataset.i][4], a = C[k].slice(-25).filter((v) => v != null);
      const { x, w, h } = fit(c), lo = Math.min(...a), hi = Math.max(...a), X = (i) => i / (a.length - 1) * w, Y = (v) => h - 3 - (v - lo) / ((hi - lo) || 1) * (h - 6);
      x.strokeStyle = G[T[+g.dataset.i][3]]; x.lineWidth = 1.6; x.beginPath(); a.forEach((v, i) => i ? x.lineTo(X(i), Y(v)) : x.moveTo(X(i), Y(v))); x.stroke();
      x.fillStyle = x.strokeStyle; x.beginPath(); x.arc(X(a.length - 1), Y(a[a.length - 1]), 2.6, 0, 7); x.fill(); });
    box.addEventListener('click', (e) => { const g = e.target.closest('.rc-g'); if (!g) return; const o = g.classList.contains('open'); box.querySelectorAll('.rc-g.open').forEach((z) => z.classList.remove('open')); if (!o) { g.classList.add('open'); SND('gauge', T[+g.dataset.i][3]); } requestAnimationFrame(spark); });
    new ResizeObserver(spark).observe(box);
  })();

  /* ═════ 06: нафта — схема протоки з танкерами + калькулятор ═════ */
  (function () {
    const s = $('rc-oil'); if (!s) return;
    const box = el('div', 'rc-oil');
    box.innerHTML = `<canvas aria-label="Схема протоки з танкерами"></canvas><div><div class="rc-ink" id="rcInk" role="button" aria-label="Бочка нафти: клік — підкинути"><span class="rc-ink__lab">1 барель = 159 л = 42 галони</span><small>клік — підкинути</small></div><div class="ctl"><label>Нафта WTI <input type="range" min="55" max="160" value="100" step="1" aria-label="Ціна нафти"> <b data-p></b></label>
      <span class="seg" role="group" aria-label="Протока"><button type="button" data-s="open">прохід відкрито</button><button type="button" data-s="block" class="on">блокада</button></span></div>
      <div class="calc calc--col"><div><span>бензин, приріст на заправці</span><b data-k="g"></b></div><div><span>домогосподарство за рік, лише бензин</span><b data-k="h"></b></div>
      <div><span>прямий внесок в інфляцію</span><b data-k="c"></b></div><div><span>оцінка Chicago Fed для 2026 року</span><b>−0,8…−1,7 п.п. ВВП</b></div></div>
      <p class="chint">Порівняння з довоєнними $65. 1 барель = 42 галони: кожен +$1 за барель ≈ +2,4 ¢ за галон. Домогосподарство в США споживає близько 1 000 галонів бензину на рік; вага бензину в ІСЦ ≈ 3,3 %. Грубі оцінки «першого кроку», без впливу на інші ціни.</p></div>`;
    s.appendChild(box);
    const cv = box.querySelector('canvas'), sl = box.querySelector('input'), segB = [...box.querySelectorAll('.seg button')], K = (k) => box.querySelector(`[data-k=${k}]`);
    let blocked = true, vis = false, raf = 0, t = 0, last = 0, tip = null;
    const BASE = 65, PUMP0 = 3.1;
    function calc() { const p = +sl.value, d = p - BASE, gal = d / 42, pump = PUMP0 + gal;
      box.querySelector('[data-p]').textContent = '$' + p;
      K('g').textContent = (gal >= 0 ? '+' : '−') + Math.round(Math.abs(gal) * 100) + ' ¢/гал';
      K('h').textContent = (gal >= 0 ? '+$' : '−$') + Math.round(Math.abs(gal) * 1000);
      K('c').textContent = sgn((pump / PUMP0 - 1) * 3.3, 1) + ' п.п.'; K('c').className = d > 20 ? 'bad' : ''; }
    // танкери: кожен рухається вздовж шляху через протоку (t від 0 до 1); у блокаді черга стоїть перед вузьким місцем
    const SH = Array.from({ length: 26 }, (_, i) => ({ u: i / 26, lane: (i % 2 ? 1 : -1) * (.3 + .4 * ((i * 37) % 10) / 10), q: 0 }));
    function path(u, w, h) { // крива з відкритого моря праворуч унизу через вузьку протоку вліво вгору
      const p = [[w * 1.05, h * .92], [w * .72, h * .78], [w * .52, h * .55], [w * .42, h * .44], [w * .2, h * .3], [-w * .05, h * .18]];
      const n = p.length - 1, f = Math.min(n - 1e-6, u * n), k = Math.floor(f), r = f - k; return [p[k][0] + (p[k + 1][0] - p[k][0]) * r, p[k][1] + (p[k + 1][1] - p[k][1]) * r, Math.atan2(p[k + 1][1] - p[k][1], p[k + 1][0] - p[k][0])]; }
    function draw() {
      const { x, w, h } = fit(cv);
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1626'); g.addColorStop(1, '#091019'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // береги (схема): дві суші з вузьким проходом посередині
      x.fillStyle = '#1a1f2a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w, h * .42); x.bezierCurveTo(w * .8, h * .5, w * .62, h * .36, w * .5, h * .42); x.bezierCurveTo(w * .42, h * .3, w * .25, h * .12, 0, h * .05); x.fill();
      x.beginPath(); x.moveTo(0, h); x.lineTo(0, h * .38); x.bezierCurveTo(w * .2, h * .46, w * .33, h * .58, w * .42, h * .58); x.bezierCurveTo(w * .55, h * .62, w * .6, h * .95, w * .7, h); x.fill();
      x.strokeStyle = 'rgba(231,192,90,.25)'; x.setLineDash([2, 6]); x.beginPath(); for (let u = 0; u <= 1; u += .02) { const [px, py] = path(u, w, h); u ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.setLineDash([]);
      x.font = `600 10.5px ${MONO}`; x.fillStyle = 'rgba(233,237,245,.5)'; x.textAlign = 'left'; x.fillText('схема · не в масштабі', 10, h - 10);
      x.fillStyle = blocked ? '#ff7a6b' : '#9fe3b8'; x.fillText(blocked ? 'БЛОКАДА · ~1/5 світової нафти стоїть' : 'ПРОХІД ВІДКРИТО', 10, 18);
      // вузьке місце
      const [bx, by] = path(.47, w, h); if (blocked) { x.strokeStyle = 'rgba(255,90,70,.75)'; x.lineWidth = 2; x.beginPath(); x.arc(bx, by, 16 + 3 * Math.sin(t * 3), 0, 7); x.stroke(); }
      SH.forEach((s2, i) => { const [px, py, a] = path(s2.u, w, h), nx = -Math.sin(a), ny = Math.cos(a), ox = px + nx * s2.lane * 12, oy = py + ny * s2.lane * 12;
        x.save(); x.translate(ox, oy); x.rotate(a); x.fillStyle = '#d9c08a'; x.fillRect(-9, -2.6, 18, 5.2); x.fillStyle = '#fff4d6'; x.fillRect(5, -2, 3, 4);
        x.fillStyle = 'rgba(255,214,150,.2)'; x.fillRect(-26, -1, 16, 2); x.restore(); s2.px = ox; s2.py = oy; });
      if (tip) { x.font = `500 11px ${SANS}`; const tw = x.measureText(tip.t).width + 16; x.fillStyle = 'rgba(10,14,24,.9)'; x.fillRect(Math.min(w - tw - 6, tip.x + 10), tip.y - 26, tw, 22); x.fillStyle = '#fff'; x.fillText(tip.t, Math.min(w - tw - 6, tip.x + 10) + 8, tip.y - 11); }
    }
    function loop(now) { const dt = Math.min(.05, last ? (now - last) / 1000 : 0); last = now; t += dt;
      SH.forEach((s2, i) => { const stopAt = .44 - (SH.filter((z, j) => j < i && z.u < .45 && z.u > s2.u).length) * .0; let v = .018;
        if (blocked && s2.u < .45) { const ahead = SH.filter((z) => z !== s2 && z.u > s2.u && z.u < .45).length; const lim = .44 - ahead * .03; if (s2.u >= lim) v = 0; }
        s2.u += v * dt; if (s2.u > 1) s2.u -= 1; });
      draw(); raf = vis && !REDUCE ? requestAnimationFrame(loop) : 0; }
    seen(cv, (v) => { vis = v; if (v && !raf) { last = 0; raf = requestAnimationFrame(loop); } }, .1);
    cv.addEventListener('click', (e) => { const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; let best = null, bd = 400;
      SH.forEach((s2) => { const d = (s2.px - mx) ** 2 + (s2.py - my) ** 2; if (d < bd) { bd = d; best = s2; } });
      if (best) SND('horn'); tip = best ? { x: best.px, y: best.py, t: 'Супертанкер (VLCC): ~2 млн барелів ≈ $' + Math.round(+sl.value * 2) + ' млн за сьогоднішньою ціною' } : null; setTimeout(() => { tip = null; if (REDUCE) draw(); }, 3500); if (REDUCE) draw(); });
    sl.addEventListener('input', calc);
    segB.forEach((b) => b.addEventListener('click', () => { blocked = b.dataset.s === 'block'; SND(blocked ? 'alarm' : 'click'); segB.forEach((z) => z.classList.toggle('on', z === b)); if (REDUCE) draw(); }));
    calc(); draw(); new ResizeObserver(() => draw()).observe(cv);
  })();

  /* ═════ 07: частка ШІ у зростанні ВВП (2D-панель праворуч від 3D-вежі) ═════ */
  (function () {
    const s = $('rc-ai'); if (!s) return;
    const box = el('div', 'rc-ai');
    box.innerHTML = `<div class="rc-ai__3d" id="rcAi3d"><div class="rc-ai__hud">капітальні витрати 4 найбільших хмарних компаній<b data-v>—</b><span data-n></span></div><div class="rc-ai__yrs"></div></div>
      <div class="rc-ai__sh"><h4>Скільки зростання ВВП дав ШІ у II кв. 2026</h4><span class="seg" role="group" aria-label="Метод"><button type="button" data-m="gross" class="on">усі інвестиції</button><button type="button" data-m="net">мінус імпорт чипів</button></span>
      <canvas></canvas><p data-t></p></div>`;
    s.appendChild(box);
    const cv = box.querySelector('canvas'), tx = box.querySelector('[data-t]'); let m = 'gross', k = 0, raf = 0;
    const V = { gross: [50.2, 'ING, найширша оцінка: інвестиції в обладнання, ПЗ і дата-центри дали половину зростання ВВП у II кварталі.'], net: [36, 'Якщо відняти імпорт комп\'ютерів, периферії й напівпровідників (вони не створені в США), лишається близько третини.'] };
    function draw(f) { const { x, w, h } = fit(cv), v = V[m][0] * f, cx = w / 2, cy = h / 2 + 4, R = Math.min(w, h) * .38;
      x.lineWidth = 26; x.strokeStyle = 'rgba(128,128,128,.18)'; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
      x.strokeStyle = m === 'gross' ? '#E0532A' : '#4678DC'; x.beginPath(); x.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + v / 100 * 2 * Math.PI); x.stroke();
      x.font = `700 34px ${MONO}`; x.fillStyle = css('--ink') || '#111'; x.textAlign = 'center'; x.fillText(Math.round(v) + ' %', cx, cy + 8);
      x.font = `500 11px ${SANS}`; x.fillStyle = css('--ink-3') || '#667'; x.fillText('зростання ВВП', cx, cy + 28); }
    function anim() { cancelAnimationFrame(raf); const t0 = performance.now(); const st = (now) => { const f = REDUCE ? 1 : Math.min(1, (now - t0) / 900); draw(1 - (1 - f) ** 3); if (f < 1) raf = requestAnimationFrame(st); }; raf = requestAnimationFrame(st); tx.textContent = V[m][1] + ' Для порівняння: сам рівень ШІ-інвестицій — лише ~0,8 % ВВП (Epoch AI): мала частка економіки дає велику частку зростання.'; }
    box.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => { m = b.dataset.m; SND('click'); box.querySelectorAll('.seg button').forEach((z) => z.classList.toggle('on', z === b)); anim(); }));
    once(cv, anim, .3); new ResizeObserver(() => draw(1)).observe(cv);
  })();

  /* ═════ 08: K-споживач ═════ */
  (function () {
    const s = $('rc-k'); if (!s) return;
    const E = [['Moody\'s, 2025', 49.2, 'Найгучніша цифра: «половина витрат — верхні 10 %». Пропрієтарна модель, опублікована здебільшого через медіа й соцмережі (Minneapolis Fed).'],
      ['Moody\'s, нова методика', 45.8, 'Після врахування податків Moody\'s сама знизила оцінку до 45,8 %.'],
      ['Bank of America', 23, 'За даними карткових транзакцій клієнтів банку — близько чверті витрат.'],
      ['Dallas Fed, інший ряд', 20, 'Офіційне обстеження споживчих витрат дає близько 20 %. Dallas Fed: концентрація справді зросла, але оцінка Moody\'s «значно вища».']];
    const box = el('div', 'rc-k');
    box.innerHTML = `<div class="rc-k__est"><h4>Яку частку всіх витрат дають верхні 10 % за доходом?</h4>${E.map(([n, v], i) => `<div class="rc-k__e" data-i="${i}" role="button" tabindex="0"><span>${n}</span><div class="tr"><i style="width:0"></i><u title="10 % людей"></u></div><b>${nf(v, v % 1 ? 1 : 0)} %</b></div>`).join('')}
      <p class="chint">Чорна риска — 10 %: якби всі витрачали порівну. Шкала 0–60 %.</p><p class="rc-k__why">Натисніть на оцінку, щоб побачити, звідки вона.</p></div>
      <div class="rc-k__img"><img src="assets/recession/street.jpg" alt="Вулиця на заході сонця: ліворуч яскраві крамниці, праворуч зачинені" loading="lazy"><canvas></canvas></div>`;
    s.appendChild(box);
    const es = [...box.querySelectorAll('.rc-k__e')], why = box.querySelector('.rc-k__why');
    once(box, () => es.forEach((e, i) => setTimeout(() => { e.querySelector('i').style.width = (E[i][1] / 60 * 100) + '%'; }, i * 200)), .3);
    es.forEach((e) => e.addEventListener('click', () => { SND('blip', +e.dataset.i * 3); es.forEach((z) => z.classList.toggle('on', z === e)); why.textContent = E[+e.dataset.i][2]; }));
    // поверх ілюстрації — «K»: дві гілки реальних витрат за доходом (умовно: верхня гілка росте, нижня стоїть), малюються при появі
    const cv = box.querySelector('canvas');
    function k(f) { const { x, w, h } = fit(cv), x0 = w * .08, y0 = h * .62, x1 = w * .92;
      x.lineWidth = 3; x.lineCap = 'round';
      x.strokeStyle = 'rgba(255,200,120,.95)'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + (x1 - x0) * f, y0 - h * .38 * f); x.stroke();
      x.strokeStyle = 'rgba(140,170,220,.9)'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + (x1 - x0) * f, y0 + h * .1 * f); x.stroke();
      x.font = `600 12px ${SANS}`; x.fillStyle = `rgba(255,255,255,${f})`; x.textAlign = 'right'; x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 6;
      x.fillText('заможні: акції, житло', x1, y0 - h * .38 * f - 10); x.fillText('решта: ціни, борги', x1, y0 + h * .1 * f + 20); x.shadowBlur = 0; }
    once(cv, () => { const t0 = performance.now(); const st = (n) => { const f = REDUCE ? 1 : Math.min(1, (n - t0) / 1600); k(1 - (1 - f) ** 3); if (f < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); }, .4);
    new ResizeObserver(() => k(1)).observe(cv);
  })();

  /* ═════ 10: три дороги на рік уперед (ілюстрація) ═════ */
  (function () {
    const s = $('rc-ahead'); if (!s) return;
    const SC = { soft: ['М\'яка посадка', '60–70 %', { unrate: 4.4, cpi: 2.8, ffr: 3.9 }, 'Нафта стабілізується біля $80–90, інфляція повільно спадає, ФРС робить ще одне підвищення й зупиняється. Найм слабкий, але без хвилі звільнень.'],
      stag: ['Стагфляційне сповільнення', '20–25 %', { unrate: 4.9, cpi: 4.4, ffr: 4.4 }, 'Ормуз закритий довго, нафта понад $110. ФРС підвищує ще двічі, найм іде в мінус, безробіття доходить до ~4,9 % — правило Сам спрацьовує.'],
      ai: ['ШІ-корекція', '10–15 %', { unrate: 5.3, cpi: 2.4, ffr: 3.1 }, 'Розчарування у віддачі від ШІ: техакції падають на третину, будівництво дата-центрів згортають, приватний кредит фіксує збитки. Інвестиційна рецесія, як 2001-го; ФРС знижує ставку.']};
    const box = el('div', 'rc-sc');
    box.innerHTML = `<div class="rc-sc__bar">${Object.entries(SC).map(([k, v]) => `<button type="button" class="rc-btn${k === 'soft' ? ' on' : ''}" data-k="${k}">${v[0]}<em>${v[1]}</em></button>`).join('')}</div>
      <div class="rc-sc__g">${[['unrate', 'Безробіття, %'], ['cpi', 'Інфляція р/р, %'], ['ffr', 'Ставка ФРС, %']].map(([k, t]) => `<figure><canvas data-k="${k}"></canvas><figcaption>${t}</figcaption></figure>`).join('')}</div>
      <p class="rc-sc__t"></p><p class="chint">Ілюстрація, не прогноз: відсотки — орієнтир за оцінками банків і ринків прогнозів, траєкторії — умовні. Ліворуч від пунктиру — факти (FRED), праворуч — сценарій.</p>`;
    s.appendChild(box);
    let cur = 'soft', raf = 0;
    const RNG = { unrate: [3.5, 6], cpi: [1.5, 5.5], ffr: [2.5, 5.6] };
    function draw(f) { box.querySelectorAll('canvas').forEach((c) => { const k = c.dataset.k, { x, w, h } = fit(c), hist = C[k].slice(-25).filter((v) => v != null).slice(-18), n0 = hist.length, n = n0 + 12;
      const [lo, hi] = RNG[k], X = (i) => 26 + (w - 34) * i / (n - 1), Y = (v) => 8 + (h - 24) * (1 - (v - lo) / (hi - lo));
      x.font = `500 9.5px ${MONO}`; x.fillStyle = css('--ink-3') || '#667'; x.textAlign = 'right'; [lo, hi].forEach((v) => x.fillText(nf(v, 1), 22, Y(v) + 3));
      x.setLineDash([3, 4]); x.strokeStyle = 'rgba(128,128,128,.5)'; x.beginPath(); x.moveTo(X(n0 - 1), 4); x.lineTo(X(n0 - 1), h - 14); x.stroke(); x.setLineDash([]);
      x.textAlign = 'center'; x.fillText('сьогодні', X(n0 - 1), h - 3);
      x.strokeStyle = css('--ink-2') || '#444'; x.lineWidth = 2; x.beginPath(); hist.forEach((v, i) => i ? x.lineTo(X(i), Y(v)) : x.moveTo(X(i), Y(v))); x.stroke();
      const v0 = hist[n0 - 1], v1 = SC[cur][2][k];
      x.strokeStyle = cur === 'soft' ? '#1E968C' : cur === 'stag' ? '#D9A21B' : '#E0532A'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(X(n0 - 1), Y(v0));
      for (let j = 1; j <= 12 * f; j++) { const u = j / 12, e = 1 - (1 - u) ** 2; x.lineTo(X(n0 - 1 + j), Y(v0 + (v1 - v0) * e)); } x.stroke();
      if (f >= 1) { x.fillStyle = x.strokeStyle; x.font = `600 11px ${MONO}`; x.textAlign = 'right'; x.fillText(nf(v1, 1), w - 4, Y(v1) - 6); } });
      box.querySelector('.rc-sc__t').textContent = SC[cur][3]; }
    function anim() { cancelAnimationFrame(raf); const t0 = performance.now(); const st = (n) => { const f = REDUCE ? 1 : Math.min(1, (n - t0) / 1100); draw(f); if (f < 1) raf = requestAnimationFrame(st); }; raf = requestAnimationFrame(st); }
    box.querySelectorAll('.rc-sc__bar button').forEach((b) => b.addEventListener('click', () => { cur = b.dataset.k; SND('chord', cur); box.querySelectorAll('.rc-sc__bar button').forEach((z) => z.classList.toggle('on', z === b)); anim(); }));
    once(box, anim, .3); new ResizeObserver(() => draw(1)).observe(box);
  })();

  /* ═════ 11: календар наступних даних ═════ */
  (function () {
    const s = $('rc-cal'); if (!s) return;
    const L2 = [['22.10', 'Заявки на допомогу', 'щочетверга · Мінтруд', 1], ['23.10', 'Настрої Мічигану, остаточні', 'жовтень', 1], ['29.10', 'ВВП III кварталу, перша оцінка', 'BEA · GDPNow ~3,5 %', 1],
      ['6.11', 'Зайнятість за жовтень', 'BLS · правило Сам', 0], ['листопад', 'Інфляція за жовтень', 'BLS', 0], ['грудень', 'Засідання ФРС', 'медіана: ще +0,25 п.п.', 0]];
    const box = el('div', 'rc-cal'); box.innerHTML = L2.map(([d, t, n, soon]) => `<div class="${soon ? 'soon' : ''}"><b>${d}</b><span>${t}</span><small>${n}</small></div>`).join('');
    s.appendChild(box);
  })();
})();
