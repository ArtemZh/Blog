/* Стаття 38 «Види кави»: сцени розділів 01–08. Дані — window.CF (shared/cf-data.js). Кожна сцена відповідає на клік;
   повзунки один раз гойдаються, коли сцена піднімається на третину екрана; кнопки «▶» світяться до першого натискання.
   Звук — через window.CF_SND.fx (лише якщо звук статті увімкнено). Спрощення підписані в самих сценах. */
(function () {
  const D = window.CF; if (!D) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const SND = (k, a) => { if (window.CF_SND) CF_SND.fx(k, a); };
  const f1 = (v, d = 1) => v.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
  const cl = (v) => Math.max(0, Math.min(1, v)), ez = (v) => { v = cl(v); return v * v * (3 - 2 * v); };
  const onSeen = (node, fn, th = .33) => new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: th }).observe(node);
  // повзунок один раз гойдається до значень a → b → назад
  function swing(inp, a, b, ms = 1600) { if (REDUCE) return; const v0 = +inp.value, t0 = performance.now();
    (function f(now) { const u = (now - t0) / ms; if (u > 1) { inp.value = v0; inp.dispatchEvent(new Event('input')); return; }
      const w = Math.sin(u * Math.PI * 2) * (u < .5 ? 1 : 1); inp.value = v0 + (w > 0 ? (b - v0) * w : (v0 - a) * w); inp.dispatchEvent(new Event('input')); requestAnimationFrame(f); })(t0); }
  const ST = { CR: ['критично', '#9b1c1c'], EN: ['під загрозою', '#e0532a'], VU: ['вразливий', '#d9a21b'], LC: ['не загрожує', '#3f8f5a'], DD: ['даних немає', '#9aa3b2'], NEW: ['описано 2021', 'transparent'] };

  /* ═════ 01 · 130 видів: кожне зерно — вид, колір — статус загрози ═════ */
  (function () {
    const s = $('cf-species'); if (!s) return;
    const T = D.threat, named = Object.fromEntries(D.species.map((x) => [x.st, (x.st in ST) ? 1 : 0]));
    // порядок: CR, EN, VU, LC, DD, NEW; іменовані види стають першими у своїй групі
    const list = []; ['CR', 'EN', 'VU', 'LC', 'DD'].forEach((k) => { const sp = D.species.filter((x) => x.st === k); sp.forEach((x) => list.push({ k, sp: x })); for (let i = sp.length; i < T[k]; i++) list.push({ k }); });
    for (let i = 0; i < T.newer; i++) list.push({ k: 'NEW' });
    const box = el('div', 'cf-sp');
    box.innerHTML = `<div class="cf-sp__f">${['ALL', 'CR', 'EN', 'VU', 'LC', 'DD', 'NEW'].map((k) => `<button type="button" class="cf-chip${k === 'ALL' ? ' on' : ''}" data-k="${k}">${k === 'ALL' ? 'усі 130' : `<i style="--c:${ST[k][1]}"></i>${ST[k][0]} · ${k === 'NEW' ? T.newer : T[k]}`}</button>`).join('')}</div>
      <div class="cf-sp__grid">${list.map((o, i) => `<button type="button" class="cf-bean${o.sp ? ' named' : ''}" data-k="${o.k}" data-i="${i}" style="--c:${ST[o.k][1]}" aria-label="${o.sp ? o.sp.n : ST[o.k][0]}">${o.sp ? `<em>${o.sp.n}</em>` : ''}</button>`).join('')}</div>
      <div class="cf-sp__card" aria-live="polite"></div>`;
    s.appendChild(box);
    const card = box.querySelector('.cf-sp__card'), beans = [...box.querySelectorAll('.cf-bean')], chips = [...box.querySelectorAll('.cf-chip')];
    function show(o) { if (!o.sp) { card.innerHTML = `<b>${ST[o.k][0]}</b><p>${o.k === 'NEW' ? 'Шість видів з Мадагаскару описано 2021 року — їх ще не оцінювали за критеріями МСОП.' : o.k === 'DD' ? 'Про ці види надто мало відомо, щоб оцінити ризик: деякі не вдалося знайти в природі.' : `Один із ${T[o.k]} видів у цій категорії. Головні загрози — малий ареал і вирубування лісів.`}</p>`; return; }
      const x = o.sp; card.innerHTML = `<b>${x.n} <i>${x.lat}</i></b><div class="kv"><span>статус</span>${ST[x.st][0]}<span>хромосом</span>${x.chr}<span>частка ринку</span>${x.share}</div><p>${x.note}</p>`; }
    beans.forEach((b) => b.addEventListener('click', () => { beans.forEach((e) => e.classList.toggle('sel', e === b)); show(list[+b.dataset.i]); SND('bean', b.dataset.k); }));
    chips.forEach((c) => c.addEventListener('click', () => { chips.forEach((e) => e.classList.toggle('on', e === c)); const k = c.dataset.k;
      beans.forEach((b) => b.classList.toggle('dim', k !== 'ALL' && b.dataset.k !== k)); SND('click'); }));
    show(list[D.species.findIndex((x) => x.id === 'ara') >= 0 ? list.findIndex((o) => o.sp && o.sp.id === 'ara') : 0]);
    box.querySelector('.cf-bean.named').classList.add('sel');
    onSeen(box, () => { box.classList.add('in'); beans.forEach((b, i) => b.style.transitionDelay = (REDUCE ? 0 : i * 9) + 'ms'); });
  })();

  /* ═════ 02 · арабіка — гібрид: 22 + 22 = 44 хромосоми; «вузьке горло» різноманіття ═════ */
  (function () {
    const s = $('cf-hybrid'); if (!s) return;
    const box = el('div', 'cf-hy');
    box.innerHTML = `<canvas aria-label="Дві батьківські клітини по 22 хромосоми зливаються в арабіку з 44"></canvas>
      <div class="cf-hy__bar"><button type="button" class="rc-btn" data-play>▶ схрестити</button><span class="cf-hy__t">≈ ${f1(D.hybrid.from, 2)} млн – ${Math.round(D.hybrid.to * 1000)} тис. років тому</span></div>`;
    s.appendChild(box);
    const cv = box.querySelector('canvas'), x = cv.getContext('2d'), btn = box.querySelector('[data-play]');
    let W = 1, H = 1, t = 0, run = false, raf = 0, last = 0;
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); draw(); };
    const h = (n) => { const v = Math.sin(n * 91.7 + 17.3) * 43758.5453; return v - Math.floor(v); };
    function cell(cx, cy, r, n, col, lab, sub, a = 1) {
      x.globalAlpha = a; x.fillStyle = 'rgba(255,255,255,.04)'; x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.stroke();
      for (let i = 0; i < n; i++) { const ang = h(i + n) * 6.283, rr = r * .78 * Math.sqrt(h(i * 3 + 1)), px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr, rot = h(i * 7) * 3;
        x.save(); x.translate(px, py); x.rotate(rot); x.fillStyle = col; x.fillRect(-1.6, -6, 3.2, 12); x.restore(); }
      x.fillStyle = '#fff'; x.font = '700 14px Inter, system-ui'; x.textAlign = 'center'; x.fillText(lab, cx, cy + r + 22);
      x.fillStyle = 'rgba(255,255,255,.6)'; x.font = '500 11px "Roboto Mono", monospace'; x.fillText(sub, cx, cy + r + 38); x.globalAlpha = 1; }
    function draw() {
      x.fillStyle = '#120c08'; x.fillRect(0, 0, W, H);
      const r = Math.min(W * .13, H * .28), m = ez((t - .4) / 1.6), y = H * .42, L = W * .2 + (W * .5 - W * .2) * m, R = W * .8 - (W * .8 - W * .5) * m;
      if (m < .98) { cell(L, y, r, 22, '#c98b5a', 'C. canephora', '22 хромосоми · робуста', 1 - m * .9); cell(R, y, r, 22, '#8fb2d9', 'C. eugenioides', '22 хромосоми', 1 - m * .9); }
      if (m > .6) { const a = ez((m - .6) / .4), rr2 = r * 1.25;
        x.globalAlpha = a; x.fillStyle = 'rgba(255,255,255,.05)'; x.strokeStyle = '#e8b27a'; x.lineWidth = 2.5; x.beginPath(); x.arc(W * .5, y, rr2, 0, 7); x.fill(); x.stroke();
        for (let i = 0; i < 44; i++) { const ang = h(i + 9) * 6.283, q = rr2 * .8 * Math.sqrt(h(i * 5 + 2)); x.save(); x.translate(W * .5 + Math.cos(ang) * q, y + Math.sin(ang) * q); x.rotate(h(i * 11) * 3);
          x.fillStyle = i < 22 ? '#c98b5a' : '#8fb2d9'; x.fillRect(-1.6, -6, 3.2, 12); x.restore(); }
        x.fillStyle = '#fff'; x.font = '700 16px Inter, system-ui'; x.textAlign = 'center'; x.fillText('C. arabica · 44 хромосоми', W * .5, y + rr2 + 24);
        x.globalAlpha = 1; }
      // вузьке горло: багато різних «генів» у батьків → мало варіантів в арабіці
      const g = ez((t - 2.6) / 1.4); if (g > 0) { const yb = H * .9, n0 = 34, n1 = 4;
        x.globalAlpha = g; x.fillStyle = 'rgba(255,255,255,.55)'; x.font = '600 11px "Roboto Mono", monospace'; x.textAlign = 'left'; x.fillText('різноманіття генів', 14, yb - 14);
        for (let i = 0; i < n0; i++) { x.fillStyle = `hsl(${h(i) * 360},55%,62%)`; x.fillRect(14 + i * ((W * .42) / n0), yb, (W * .42) / n0 - 2, 10); }
        x.strokeStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.moveTo(W * .46, yb + 5); x.lineTo(W * .54, yb + 5); x.stroke();
        for (let i = 0; i < n1; i++) { x.fillStyle = `hsl(${h(i * 9) * 360},55%,62%)`; x.fillRect(W * .58 + i * 26, yb, 22, 10); }
        x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText('одна подія схрещення → мало різноманіття', W * .58, yb - 14); x.globalAlpha = 1; }
    }
    function loop(now) { const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; t += dt; draw(); if (t < 4.6) raf = requestAnimationFrame(loop); else { run = false; raf = 0; btn.textContent = '↺ ще раз'; } }
    btn.addEventListener('click', () => { btn.classList.add('used'); t = 0; last = 0; run = true; SND('merge'); if (REDUCE) { t = 5; draw(); return; } if (!raf) raf = requestAnimationFrame(loop); });
    new ResizeObserver(size).observe(cv);
  })();

  /* ═════ 03 · хімія зерна: суміш арабіка/робуста ═════ */
  (function () {
    const s = $('cf-chem'); if (!s) return;
    const C = D.chem, mid = (v) => Array.isArray(v) ? (v[0] + v[1]) / 2 : v;
    const box = el('div', 'cf-ch');
    box.innerHTML = `<div class="cf-ch__ctl"><label>частка арабіки в суміші <b class="v"></b><input type="range" min="0" max="100" value="100" aria-label="Частка арабіки"></label>
        <div class="cf-ch__pre"><button type="button" class="cf-chip" data-a="100">100 % арабіка</button><button type="button" class="cf-chip" data-a="50">50 / 50</button><button type="button" class="cf-chip" data-a="0">100 % робуста</button></div></div>
      <div class="cf-ch__rows"></div><div class="cf-ch__dose"></div>`;
    s.appendChild(box);
    const inp = box.querySelector('input'), v = box.querySelector('.v'), rows = box.querySelector('.cf-ch__rows'), dose = box.querySelector('.cf-ch__dose');
    const R = [['кофеїн', C.caf, '%', 3], ['сахароза', C.suc, '%', 9], ['хлорогенові кислоти', C.cga, 'г/100 г', 10]];
    rows.innerHTML = R.map(([n]) => `<div class="cf-ch__r"><span>${n}</span><div class="cf-ch__b"><i class="a"></i><i class="c"></i><b></b></div><em></em></div>`).join('');
    const rr = [...rows.querySelectorAll('.cf-ch__r')];
    function upd() { const a = +inp.value / 100; v.textContent = Math.round(a * 100) + ' %';
      R.forEach(([n, d, u, max], i) => { const va = mid(d.ara), vc = mid(d.can), val = va * a + vc * (1 - a), r = rr[i];
        r.querySelector('.a').style.width = (va * a / max * 100) + '%'; r.querySelector('.c').style.width = (vc * (1 - a) / max * 100) + '%';
        r.querySelector('em').textContent = `${f1(val, 1)} ${u}`; });
      const caf = (C.caf.ara * a + C.caf.can * (1 - a)) / 100 * 10000;
      dose.innerHTML = `У <b>10 г</b> зерна такої суміші — <b>${Math.round(caf)} мг</b> кофеїну. У чашку переходить більша частина, але не весь: залежить від помелу й способу заварювання.`; }
    inp.addEventListener('input', upd); inp.addEventListener('change', () => SND('pour', +inp.value));
    box.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => { inp.value = b.dataset.a; upd(); SND('pour', +b.dataset.a); }));
    upd(); onSeen(box, () => swing(inp, 30, 100));
  })();

  /* ═════ 04 · клімат: термометр ═════ */
  (function () {
    const s = $('cf-climate'); if (!s) return;
    const K = D.clim, T0 = 14, T1 = 30, X = (t) => (t - T0) / (T1 - T0) * 100;
    const box = el('div', 'cf-cl');
    box.innerHTML = `<label class="cf-cl__in">середня річна температура <b class="v"></b><input type="range" min="${T0}" max="${T1}" step=".1" value="19" aria-label="Температура"></label>
      <div class="cf-cl__rows"><div class="cf-cl__r cf-cl__ax"><span></span><div class="cf-cl__axis"><i class="now"></i>${[14, 18, 22, 26, 30].map((t) => `<span style="left:${X(t)}%">${t} °C</span>`).join('')}</div><span></span></div>
        <div class="cf-cl__r" data-s="ara"><b>Арабіка</b><div class="cf-cl__t"><i class="opt" style="left:${X(K.ara[0])}%;width:${X(K.ara[1]) - X(K.ara[0])}%"></i></div><em></em></div>
        <div class="cf-cl__r" data-s="can"><b>Робуста</b><div class="cf-cl__t"><i class="old" style="left:${X(K.canOld[0])}%;width:${X(K.canOld[1]) - X(K.canOld[0])}%"></i><i class="opt le" style="left:0;width:${X(K.can)}%"></i></div><em></em></div>
        <div class="cf-cl__r" data-s="ste"><b>Стенофіла</b><div class="cf-cl__t"><i class="pin" style="left:${X(K.ste)}%"></i></div><em></em></div></div>
      <p class="cf-note">Смуга — оптимум за дослідженнями; у робусти він «до 20,5 °C» (нижньої межі дослідження не дає), пунктир — стара оцінка 22–30 °C. Для робусти −${K.canLoss} % врожаю на кожен градус понад оптимум — спрощення: у статті це середні мінімальні й максимальні температури сезону, не середньорічна.</p>`;
    s.appendChild(box);
    const inp = box.querySelector('input'), v = box.querySelector('.v'), now = box.querySelector('.now'), em = [...box.querySelectorAll('.cf-cl__r:not(.cf-cl__ax) em')];
    let last = '';
    function upd() { const t = +inp.value; v.textContent = f1(t) + ' °C'; now.style.left = X(t) + '%';
      const a = t < K.ara[0] ? 'холодно для оптимуму' : t <= K.ara[1] ? 'в оптимумі' : `на ${f1(t - K.ara[1])} °C тепліше за оптимум`;
      const c = t <= K.can ? 'в оптимумі' : `≈ −${Math.min(100, Math.round((t - K.can) * K.canLoss))} % врожаю`;
      const st = Math.abs(t - K.ste) < .8 ? 'тут вона росте в природі' : t < K.ste ? `її дім теплий: ${f1(K.ste)} °C` : 'тепліше за її дім';
      em[0].textContent = a; em[1].textContent = c; em[2].textContent = st;
      box.querySelectorAll('.cf-cl__r:not(.cf-cl__ax)').forEach((r, i) => r.classList.toggle('ok', [t >= K.ara[0] && t <= K.ara[1], t <= K.can, Math.abs(t - K.ste) < .8][i]));
      const k = String(Math.round(t)); if (k !== last) { last = k; SND('tick', t); } }
    inp.addEventListener('input', upd); upd(); onSeen(box, () => swing(inp, 16, 26, 2200));
  })();

  /* ═════ 05 · сорти арабіки: шлях насіння й гілки ═════ */
  (function () {
    const s = $('cf-tree'); if (!s) return;
    const N = [
      ['eth', 'Ефіопія', 'дикі ліси', 60, 50, 'Батьківщина арабіки: тут — майже все генетичне різноманіття виду. У дикій природі арабіка має статус «під загрозою».'],
      ['yem', 'Ємен', 'перші плантації', 240, 50, 'Насіння вивезли з Ефіопії невеликими партіями. Кожне переселення брало лише жменю зерен — «вузьке горло» різноманіття (WCR).'],
      ['typ', 'Група Типіка', 'сорти й лінії', 420, 18, 'WCR тепер вважає Типіку й Бурбон не сортами, а генетичними групами. До групи Типіка генетично ближчі SL14 і SL34.'],
      ['bou', 'Група Бурбон', 'сорти й лінії', 420, 82, 'Друга велика гілка. До неї належить кенійський SL28 — посухостійкий, з високою якістю чашки, але вразливий до хвороб.'],
      ['sl28', 'SL28', 'Кенія', 600, 82, 'Генетичні тести підтвердили спорідненість із групою Бурбон. Добрий смак, але вразливий до основних хвороб (WCR).'],
      ['ges', 'Гейша', 'Ефіопія → Панама', 600, 18, 'Ефіопська лінія, що прославилась у Панамі: з 2004 року Hacienda La Esmeralda виставляє 100 % гейшу на Best of Panama. 2025 — лот 20 кг продано по 30 204 $/кг.'],
      ['rust', 'Іржа 1869', 'Цейлон', 240, 128, 'Гриб Hemileia vastatrix уперше описано 1869 року. Може зменшити врожай до 80 % і за століття дійшов до всіх кавових регіонів.'],
      ['tim', 'Гібрид Тимор', 'арабіка × робуста', 420, 140, 'Природне схрещення, знайдене в Тиморі в 1930-х. Стійкість до іржі — від робусти.'],
      ['cat', 'Катимор, Сарчимор', 'стійкі до іржі', 600, 140, 'Нащадків гібрида Тимор схрестили з арабікою — так з’явилися стійкі до іржі групи: Катимор, Сарчимор, Кастійо та інші.']];
    const E = [['eth', 'yem'], ['yem', 'typ'], ['yem', 'bou'], ['bou', 'sl28'], ['eth', 'ges'], ['rust', 'tim'], ['tim', 'cat'], ['bou', 'cat']];
    const box = el('div', 'cf-tr');
    const P = Object.fromEntries(N.map((n) => [n[0], n]));
    box.innerHTML = `<div class="cf-tr__wrap"><svg viewBox="0 -24 680 194" role="img" aria-label="Шлях арабіки від Ефіопії до сучасних сортів">
        ${E.map(([a, b]) => { const A = P[a], B = P[b]; const d = a === 'eth' && b === 'ges' ? `M${A[3]},${A[4] - 16} C${A[3] + 60},${-30} ${B[3] - 120},${-30} ${B[3] - 46},${B[4]}` : `M${A[3] + 46},${A[4]} C${(A[3] + B[3]) / 2 + 20},${A[4]} ${(A[3] + B[3]) / 2 - 20},${B[4]} ${B[3] - 46},${B[4]}`;
          return `<path data-e="${a}-${b}" d="${d}" class="${a === 'rust' || b === 'cat' && a === 'tim' ? 'rust' : ''}"/>`; }).join('')}
        ${N.map((n) => `<g class="cf-tr__n${n[0] === 'rust' ? ' rust' : ''}" data-id="${n[0]}" tabindex="0" role="button" transform="translate(${n[3] - 46},${n[4] - 16})"><rect width="92" height="32" rx="8"/><text x="46" y="14">${n[1]}</text><text class="s" x="46" y="26">${n[2]}</text></g>`).join('')}
      </svg></div><div class="cf-tr__bar"><button type="button" class="rc-btn" data-play>▶ пройти шлях</button><span class="cf-tr__div">генетичне різноманіття <i><b></b></i></span></div><div class="cf-tr__card" aria-live="polite"></div>`;
    s.appendChild(box);
    const nodes = [...box.querySelectorAll('.cf-tr__n')], card = box.querySelector('.cf-tr__card'), div = box.querySelector('.cf-tr__div b'), play = box.querySelector('[data-play]');
    const DIV = { eth: 100, yem: 30, typ: 12, bou: 12, sl28: 10, ges: 40, rust: 0, tim: 35, cat: 25 };
    function show(id) { const n = P[id]; nodes.forEach((g) => g.classList.toggle('on', g.dataset.id === id)); card.innerHTML = `<b>${n[1]}</b> <span>${n[2]}</span><p>${n[5]}</p>`;
      div.style.width = (id === 'rust' ? 0 : DIV[id]) + '%'; SND('step', N.indexOf(n)); }
    nodes.forEach((g) => { g.addEventListener('click', () => { stop(); show(g.dataset.id); }); g.addEventListener('keydown', (e) => { if (e.key === 'Enter') { stop(); show(g.dataset.id); } }); });
    const ROUTE = ['eth', 'yem', 'typ', 'bou', 'sl28', 'ges', 'rust', 'tim', 'cat']; let tm = 0, k = 0;
    function stop() { clearInterval(tm); tm = 0; play.textContent = '▶ пройти шлях'; }
    play.addEventListener('click', () => { play.classList.add('used'); if (tm) { stop(); return; } k = 0; show(ROUTE[0]); play.textContent = '❚❚ пауза';
      tm = setInterval(() => { k++; if (k >= ROUTE.length) { stop(); return; } show(ROUTE[k]); }, REDUCE ? 900 : 2200); });
    show('eth');
  })();

  /* ═════ 06 · обробка: ягода в розрізі ═════ */
  (function () {
    const s = $('cf-process'); if (!s) return;
    const L = [['skin', 'шкірка', '#b3261e'], ['pulp', 'м’якоть', '#e0533e'], ['muc', 'слиз', '#f2b48a'], ['parch', 'пергамент', '#e9d8b4'], ['silver', 'срібна шкірка', '#d8d3c6'], ['bean', 'зерно', '#7c9a5a']];
    const M = {
      washed: ['Мита', ['skin', 'pulp', 'muc'], 'Шкірку й м’якоть знімають машиною, слиз відходить під час бродіння у воді, зерно сушать у пергаменті.', 'чистий, яскравий смак, виразна кислотність'],
      honey: ['Хані', ['skin', 'pulp'], 'Шкірку й м’якоть знімають, а липкий солодкий слиз лишають на пергаменті й так сушать.', 'більше солодкості й тіла, ніж у митої'],
      natural: ['Натуральна', [], 'Ягоду сушать цілою — тижнями, з перемішуванням. Зерно вбирає частину речовин із плоду.', 'фруктові, винні ноти, важче тіло'],
      anaer: ['Анаеробна', [], 'Ягоди чи зерна з м’якоттю бродять у закритому баку без кисню, потім їх сушать. Процес керованіший і новіший.', 'інтенсивні, «бродильні» ноти, іноді спірні']
    };
    const box = el('div', 'cf-pr');
    box.innerHTML = `<div class="cf-pr__m">${Object.entries(M).map(([k, m]) => `<button type="button" class="cf-chip" data-m="${k}">${m[0]}</button>`).join('')}</div>
      <div class="cf-pr__g"><svg viewBox="0 0 220 220" aria-label="Ягода кави в розрізі">${L.map(([id, n, c], i) => { const rx = 100 - i * 13, ry = 92 - i * 12; return `<ellipse data-l="${id}" cx="110" cy="110" rx="${rx}" ry="${ry}" fill="${c}"/>`; }).join('')}<path d="M110 52 C 98 80, 122 140, 110 168" stroke="#4e6b38" stroke-width="3" fill="none"/></svg>
        <ol class="cf-pr__leg">${L.map(([id, n, c]) => `<li data-l="${id}"><i style="background:${c}"></i>${n}</li>`).join('')}</ol>
        <div class="cf-pr__txt" aria-live="polite"></div></div>`;
    s.appendChild(box);
    const els = (id) => box.querySelectorAll(`[data-l="${id}"]`), txt = box.querySelector('.cf-pr__txt'), btns = [...box.querySelectorAll('[data-m]')];
    function show(k) { const m = M[k]; btns.forEach((b) => b.classList.toggle('on', b.dataset.m === k));
      L.forEach(([id]) => els(id).forEach((e) => e.classList.toggle('off', m[1].includes(id))));
      txt.innerHTML = `<b>${m[0]} обробка</b><p>${m[2]}</p><p class="hyp"><span class="badge hypb">тенденція</span> ${m[3]} — загальне правило дегустаторів, а не закон: сорт і висота важать не менше.</p>`; SND('peel', btns.findIndex((b) => b.dataset.m === k)); }
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.m)));
    show('natural'); onSeen(box, () => { if (!REDUCE) setTimeout(() => show('washed'), 700); });
  })();

  /* ═════ 07 · обсмажування: крива й колір зерна ═════ */
  (function () {
    const s = $('cf-roast'); if (!s) return;
    const R = D.roast, TMAX = 12;
    const temp = (m) => 25 + 205 * (1 - Math.exp(-m / 3.1)) + (m > 9 ? (m - 9) * 6 : 0);   // умовна крива нагріву зерна, °C
    const box = el('div', 'cf-ro');
    box.innerHTML = `<canvas aria-label="Крива обсмажування: температура зерна від часу"></canvas><div class="cf-ro__side"><div class="cf-ro__bean"></div><div class="cf-ro__st"></div></div>
      <label class="cf-ro__in">хвилина обсмажування <b class="v"></b><input type="range" min="0" max="${TMAX}" step=".05" value="8" aria-label="Хвилина"></label>
      <p class="cf-note">Крива умовна — форма типова для барабанного ростера. Маяр стартує близько ${R.maillard[0]}–${R.maillard[1]} °C; перший тріск — близько ${R.crack1} °C (акустичне дослідження Wilson, 2014).</p>`;
    s.appendChild(box);
    const cv = box.querySelector('canvas'), x = cv.getContext('2d'), inp = box.querySelector('input'), v = box.querySelector('.v'), bean = box.querySelector('.cf-ro__bean'), st = box.querySelector('.cf-ro__st');
    let W = 1, H = 1, ph = '';
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); draw(); };
    const X = (m) => 40 + (W - 56) * m / TMAX, Y = (c) => H - 28 - (H - 44) * (c - 20) / 230;
    const col = (c) => c < 140 ? [`hsl(${85 - (c - 25) / 115 * 35},40%,${60 - (c - 25) / 115 * 5}%)`, 'сушіння'] : c < 185 ? [`hsl(${48 - (c - 140) / 45 * 18},55%,${55 - (c - 140) / 45 * 20}%)`, 'Маяр: побуріння'] : c < 215 ? [`hsl(28,50%,${35 - (c - 185) / 30 * 13}%)`, 'розвиток після тріску'] : ['hsl(20,35%,14%)', 'темне обсмажування'];
    function draw() {
      x.fillStyle = '#140d09'; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(224,83,42,.10)'; x.fillRect(X(0), Y(R.maillard[1] + 40), W - 56, Y(R.maillard[0]) - Y(R.maillard[1] + 40));
      [[R.maillard[0], 'Маяр ~' + R.maillard[0]], [R.crack1, 'перший тріск ~' + R.crack1]].forEach(([c, l]) => { x.strokeStyle = 'rgba(255,255,255,.28)'; x.setLineDash([4, 5]); x.beginPath(); x.moveTo(X(0), Y(c)); x.lineTo(W - 16, Y(c)); x.stroke(); x.setLineDash([]);
        x.fillStyle = 'rgba(255,255,255,.65)'; x.font = '500 10.5px "Roboto Mono", monospace'; x.textAlign = 'left'; x.fillText(l + ' °C', X(0) + 4, Y(c) - 5); });
      x.strokeStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(X(0), H - 28); x.lineTo(W - 16, H - 28); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '500 10px "Roboto Mono", monospace'; x.textAlign = 'center'; for (let m = 0; m <= TMAX; m += 2) x.fillText(m + ' хв', X(m), H - 10);
      const mm = +inp.value; x.lineWidth = 3; x.strokeStyle = '#e8b27a'; x.beginPath(); for (let m = 0; m <= mm; m += .05) { const p = [X(m), Y(temp(m))]; m ? x.lineTo(...p) : x.moveTo(...p); } x.stroke();
      x.lineWidth = 1.5; x.strokeStyle = 'rgba(232,178,122,.25)'; x.beginPath(); for (let m = mm; m <= TMAX; m += .05) { const p = [X(m), Y(temp(m))]; m === mm ? x.moveTo(...p) : x.lineTo(...p); } x.stroke();
      const c = temp(mm); x.fillStyle = '#fff'; x.beginPath(); x.arc(X(mm), Y(c), 5, 0, 7); x.fill(); }
    function upd() { const mm = +inp.value, c = temp(mm), [cc, phase] = col(c); v.textContent = `${f1(mm)} · ${Math.round(c)} °C`; bean.style.setProperty('--c', cc);
      st.innerHTML = `<b>${phase}</b><p>Кофеїн: <i>стабільний</i> · хлорогенові кислоти: <i>${c < 160 ? 'майже всі' : c < 205 ? 'розпадаються' : 'значна частина розпалась'}</i></p>`;
      if (phase !== ph) { if (ph) SND(phase.startsWith('розвиток') ? 'crack' : 'roast', c); ph = phase; } draw(); }
    inp.addEventListener('input', upd); new ResizeObserver(size).observe(cv); upd(); onSeen(box, () => swing(inp, 3, 11, 2400));
  })();

  /* ═════ 08 · ринок: сходи цін і хто вирощує ═════ */
  (function () {
    const s = $('cf-price'); if (!s) return;
    const P = D.price, lb = 0.45359237, rob = P.canUsdT / 1000 * lb, ara = P.araCentsLb / 100, ges = P.gesha * lb;
    const Q = [['Робуста', 'ICE, листопад', rob, '#8a6a4f'], ['Арабіка', 'ICE, грудень', ara, '#c98b5a'], ['Гейша', 'Best of Panama 2025, лот 20 кг', ges, '#e0532a']];
    const lo = Math.log10(1), hi = Math.log10(30000), Wd = (v) => (Math.log10(v) - lo) / (hi - lo) * 100;
    const M = D.market, rest = +(M.world - M.brazil - M.vietnam).toFixed(1);
    const box = el('div', 'cf-pc');
    box.innerHTML = `<div class="cf-pc__l"><span class="cf-k">ціна за фунт зеленого зерна, $ · логарифмічна шкала · ${P.priceDate}</span>
        ${Q.map(([n, sub, v, c], i) => `<button type="button" class="cf-pc__r" data-i="${i}"><b>${n}</b><small>${sub}</small><div class="cf-pc__b"><i style="--w:${Wd(v)}%;--c:${c}"></i></div><em>${v < 100 ? f1(v, 2) : Math.round(v).toLocaleString('uk-UA')}</em></button>`).join('')}
        <p class="cf-pc__cmp" aria-live="polite"></p></div>
      <div class="cf-pc__p"><span class="cf-k">урожай 2025/26 · ${f1(M.world)} млн мішків по 60 кг (USDA)</span><div class="cf-pc__stack">
        <i style="flex:${M.brAra}" class="ar">Бразилія · арабіка ${M.brAra}</i><i style="flex:${M.brCan}" class="ca">Бразилія · робуста ${M.brCan}</i><i style="flex:${M.vietnam}" class="ca">В’єтнам ${f1(M.vietnam)}</i><i style="flex:${rest}" class="re">решта світу ${f1(rest)}</i></div>
        <p class="cf-note">Світова частка: арабіка ≈ ${M.araShare} %, робуста ≈ ${M.canShare} % (оцінка USDA на 2025/26 за Safras & Mercado). Робуста росте: у Бразилії — рекордні ${M.brCan} млн.</p></div>`;
    s.appendChild(box);
    const rows = [...box.querySelectorAll('.cf-pc__r')], cmp = box.querySelector('.cf-pc__cmp');
    function pick(i) { rows.forEach((r, j) => r.classList.toggle('on', j === i)); const v = Q[i][2];
      cmp.innerHTML = i === 0 ? `Робуста — у <b>${f1(ara / rob, 1)} раза</b> дешевша за арабіку на біржі.` : i === 1 ? `Арабіка на біржі — <b>${f1(ara, 2)} $</b> за фунт: зерно для більшості кав у світі.` : `Рекордний лот гейші — у <b>${Math.round(ges / ara).toLocaleString('uk-UA')} разів</b> дорожчий за біржову арабіку.`;
      SND('coin', i); }
    rows.forEach((r) => r.addEventListener('click', () => pick(+r.dataset.i)));
    onSeen(box, () => { box.classList.add('in'); pick(2); });
  })();
})();
