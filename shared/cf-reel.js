/* Стаття 38: ролик «Від гена до чашки» — уся стаття за 60 с, перед тим як гратися зі сценами (як ролик 35 і трейлер Ганта).
   Шість розділів по 10 с; кадр залежить лише від часу t (draw(t) нічого не пам'ятає) — перемотка й пауза точні.
   Звук: власний трек ролика через CF_SND.reel(on, t) (Suno, assets/coffee/audio/reel.m4a), якщо звук статті ввімкнено.
   Числа ті самі, що в тексті й сценах (shared/cf-data.js). */
(function () {
  const slot = document.getElementById('cf-reel'), D = window.CF; if (!slot || !D) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.CF_SND) CF_SND.fx(k, a); }, TRK = (on, t) => { if (window.CF_SND) CF_SND.reel(on, t); };
  const MONO = '"Roboto Mono", ui-monospace, monospace', SANS = 'Inter, system-ui, sans-serif';
  const lb = 0.45359237, ROB = D.price.canUsdT / 1000 * lb, ARA = D.price.araCentsLb / 100, GES = D.price.gesha * lb;
  const SC = [
    { t: 'Рід кави', a: 0, b: 10, cap: ['Науці відомо 130 видів кави. Майже всі ростуть дико в Африці й на Мадагаскарі.', 'А в чашку потрапляють два: арабіка й робуста.'] },
    { t: 'Арабіка — гібрид', a: 10, b: 20, cap: ['Арабіка — дитина двох видів: робусти й дикої еугеніоїдес, по 22 хромосоми.', 'Схрестилися один раз, сотні тисяч років тому, — і отримали 44.'] },
    { t: 'Що всередині', a: 20, b: 30, cap: ['У зеленому зерні робусти кофеїну вдвічі більше: 2,54 % проти 1,22 %.', 'Зате в арабіці більше цукру — звідси м’якший, солодший смак.'] },
    { t: 'Клімат', a: 30, b: 40, cap: ['Арабіці добре за 18–21 °C, робусті — до 20,5 °C, хоч раніше думали, що до 30.', 'Стенофіла живе за 24,9 °C і смакує як добра арабіка — кава на теплий світ.'] },
    { t: 'Від ягоди до зерна', a: 40, b: 50, cap: ['Зерно — кісточка червоної ягоди. Шкірку, м’якоть і слиз знімають по-різному.', 'А смак народжується в ростері: Маяр від ~140 °C, перший тріск — близько 200 °C.'] },
    { t: 'Ціна', a: 50, b: 60, cap: ['Робуста на біржі — 1,46 $ за фунт, арабіка — 3,07 $.', 'Рекордна гейша — понад 13 тисяч доларів за фунт. Різниця — у виді, сорті й обробці.'] }];
  const TOTAL = SC[SC.length - 1].b;
  const box = document.createElement('div'); box.className = 'rc-reel cf-reel';
  box.innerHTML = `<div class="rc-reel__scr"><canvas aria-label="Ролик: від гена до чашки"></canvas><div class="rc-reel__cap" aria-live="polite"></div>
      <button type="button" class="rc-reel__cover" data-play><span class="pl">▶</span><b>Від гена до чашки</b><small>ролик · 1 хв · уся стаття коротко</small></button></div>
    <div class="rc-reel__bar"><button type="button" class="rc-btn" data-pp>▶</button><div class="rc-reel__trk">${SC.map((s) => `<i style="left:${s.a / TOTAL * 100}%;width:${(s.b - s.a) / TOTAL * 100}%" title="${s.t}"><u>${s.t}</u></i>`).join('')}<em></em></div><span class="rc-reel__tm"></span></div>`;
  slot.appendChild(box);
  const cv = box.querySelector('canvas'), cap = box.querySelector('.rc-reel__cap'), cover = box.querySelector('.rc-reel__cover'), pp = box.querySelector('[data-pp]'),
    trk = box.querySelector('.rc-reel__trk'), head = trk.querySelector('em'), tm = box.querySelector('.rc-reel__tm'), segs = [...trk.querySelectorAll('i')];
  const cl = (v) => Math.max(0, Math.min(1, v)), ez = (v) => { v = cl(v); return v * v * (3 - 2 * v); }, eo = (v) => 1 - Math.pow(1 - cl(v), 3);
  const f = (v, d = 1) => v.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
  const hh = (n) => { const v = Math.sin(n * 91.7 + 17.3) * 43758.5453; return v - Math.floor(v); };
  let W = 1, H = 1; const x = cv.getContext('2d');
  function size() { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = Math.round(W * d); cv.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0); }
  const txt = (s, X, Y, sz, col, al = 'left', w = 600, fo = SANS) => { x.font = `${w} ${sz}px ${fo}`; x.fillStyle = col; x.textAlign = al; x.fillText(s, X, Y); };
  const S = () => Math.min(W, H * 1.8) / 900;
  // зерно 2D: овал із борозною
  function bean(cx, cy, r, col, ang = 0, sC = .5, a = 1) { x.save(); x.globalAlpha *= a; x.translate(cx, cy); x.rotate(ang); x.fillStyle = col; x.beginPath(); x.ellipse(0, 0, r, r * .72, 0, 0, 7); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = Math.max(1, r * .1); x.beginPath(); x.moveTo(-r * .8, 0); x.bezierCurveTo(-r * .3, -r * .3 * sC, r * .3, r * .3 * sC, r * .8, 0); x.stroke(); x.restore(); }

  function s1(u, k) {   // 130 зерен збираються, потім лишаються два великих
    const s = S(), cols = ['#9b1c1c', '#e0532a', '#d9a21b', '#3f8f5a', '#9aa3b2'], n = 130, g = eo(u / 2.2), z = ez((u - 5) / 2);
    txt('130 ВИДІВ КАВИ', W / 2, H * .12, 14 * s + 4, `rgba(240,225,205,${.7 * k})`, 'center', 600, MONO);
    for (let i = 0; i < n; i++) { const cx = W * (.12 + .76 * ((i % 13) / 12)), cy = H * (.2 + .6 * (Math.floor(i / 13) / 9)), sx = W * hh(i) , sy = H * hh(i + 50);
      const px = sx + (cx - sx) * g, py = sy + (cy - sy) * g, keep = i === 20 || i === 70, c = cols[i < 13 ? 0 : i < 53 ? 1 : i < 75 ? 2 : i < 110 ? 3 : 4];
      if (!keep) bean(px, py, 9 * s + 4, c, hh(i * 3) * 3, .5, k * (1 - z)); }
    if (z > 0) { bean(W * (.35 + .0 * z), H * .5, (9 + 70 * z) * s + 4, '#6b3a1e', -.3, .8, k); bean(W * .65, H * .52, (9 + 62 * z) * s + 4, '#4e2b17', .4, .1, k);
      txt('арабіка', W * .35, H * .5 + 100 * s * z + 20, 18 * s + 6, `rgba(255,236,214,${k * z})`, 'center', 700); txt('робуста', W * .65, H * .52 + 92 * s * z + 20, 18 * s + 6, `rgba(255,236,214,${k * z})`, 'center', 700); }
  }
  function s2(u, k) {   // 22 + 22 = 44
    const s = S(), m = ez((u - 2) / 3), r = Math.min(W * .12, H * .22), y = H * .46, L = W * (.25 + .25 * m), R = W * (.75 - .25 * m);
    const cell = (cx, n, col, lab, a) => { x.globalAlpha = k * a; x.strokeStyle = col; x.lineWidth = 2.5; x.beginPath(); x.arc(cx, y, r, 0, 7); x.stroke();
      for (let i = 0; i < n; i++) { const an = hh(i + n) * 6.283, q = r * .78 * Math.sqrt(hh(i * 3 + 1)); x.save(); x.translate(cx + Math.cos(an) * q, y + Math.sin(an) * q); x.rotate(hh(i * 7) * 3); x.fillStyle = col; x.fillRect(-2, -7, 4, 14); x.restore(); }
      x.globalAlpha = 1; txt(lab, cx, y + r + 30 * s + 6, 15 * s + 5, `rgba(255,236,214,${k * a})`, 'center', 700); };
    if (m < .95) { cell(L, 22, '#c98b5a', 'робуста · 22', 1 - m); cell(R, 22, '#8fb2d9', 'еугеніоїдес · 22', 1 - m); }
    if (m > .5) { const a = ez((m - .5) / .5); x.globalAlpha = k * a; x.strokeStyle = '#e8b27a'; x.lineWidth = 3; x.beginPath(); x.arc(W / 2, y, r * 1.3, 0, 7); x.stroke();
      for (let i = 0; i < 44; i++) { const an = hh(i + 9) * 6.283, q = r * 1.05 * Math.sqrt(hh(i * 5 + 2)); x.save(); x.translate(W / 2 + Math.cos(an) * q, y + Math.sin(an) * q); x.rotate(hh(i * 11) * 3); x.fillStyle = i < 22 ? '#c98b5a' : '#8fb2d9'; x.fillRect(-2, -7, 4, 14); x.restore(); }
      x.globalAlpha = 1; txt('арабіка · 44', W / 2, y + r * 1.3 + 30 * s + 6, 18 * s + 6, `rgba(255,236,214,${k * a})`, 'center', 700); }
    txt('≈ 1,08 млн – 543 тис. років тому', W / 2, H * .12, 13 * s + 4, `rgba(240,225,205,${.65 * k})`, 'center', 600, MONO);
  }
  function s3(u, k) {   // стовпці: кофеїн і сахароза
    const s = S(), base = H * .78, hMax = H * .5, bw = 70 * s + 26, C = D.chem, g = eo((u - .5) / 1.4), g2 = eo((u - 4.5) / 1.4);
    const bar = (X, v, max, col, lab, val, gg) => { const h = hMax * v / max * gg; x.globalAlpha = k; x.fillStyle = col; x.fillRect(X - bw / 2, base - h, bw, h); x.globalAlpha = 1;
      txt(lab, X, base + 22 * s + 6, 13 * s + 4, `rgba(240,225,205,${.75 * k})`, 'center', 600, MONO); if (gg > .3) txt(val, X, base - h - 12, 18 * s + 6, `rgba(255,255,255,${k})`, 'center', 700, MONO); };
    txt('КОФЕЇН', W * .3, H * .14, 14 * s + 4, `rgba(240,225,205,${.65 * k})`, 'center', 600, MONO); txt('САХАРОЗА', W * .7, H * .14, 14 * s + 4, `rgba(240,225,205,${.65 * k * cl(g2 * 3)})`, 'center', 600, MONO);
    bar(W * .22, C.caf.ara, 3, '#c98b5a', 'арабіка', f(C.caf.ara, 2) + ' %', g); bar(W * .38, C.caf.can, 3, '#8a5a3a', 'робуста', f(C.caf.can, 2) + ' %', g);
    bar(W * .62, C.suc.ara, 8, '#e8b27a', 'арабіка', f(C.suc.ara) + ' %', g2); bar(W * .78, C.suc.can, 8, '#a87a52', 'робуста', f(C.suc.can) + ' %', g2);
  }
  function s4(u, k) {   // термометр, що росте; три мітки
    const s = S(), X = (t) => W * .12 + W * .76 * (t - 14) / 16, y = H * .55, tt = 14 + 16 * eo(u / 7);
    txt('СЕРЕДНЯ РІЧНА ТЕМПЕРАТУРА', W / 2, H * .14, 14 * s + 4, `rgba(240,225,205,${.65 * k})`, 'center', 600, MONO);
    const gr = x.createLinearGradient(X(14), 0, X(30), 0); gr.addColorStop(0, '#4a7bd0'); gr.addColorStop(.45, '#d9a21b'); gr.addColorStop(1, '#e0532a');
    x.globalAlpha = k * .25; x.fillStyle = gr; x.fillRect(X(14), y - 8, X(30) - X(14), 16); x.globalAlpha = k; x.fillRect(X(14), y - 8, X(tt) - X(14), 16); x.globalAlpha = 1;
    [[18, 21, 'арабіка 18–21', -1], [17, 20.5, 'робуста ≤ 20,5', 1], [24.9, 24.9, 'стенофіла 24,9', -1]].forEach(([a, b, l, side], i) => { const on = tt >= a, Y = y + side * (46 * s + 18) * (i === 2 ? 1.6 : 1);
      x.globalAlpha = k * (on ? 1 : .25); x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(X(a), y); x.lineTo(X(a), Y); x.stroke(); if (b > a) { x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(X(a), Y - 6, X(b) - X(a), 12); }
      x.globalAlpha = 1; txt(l, X(a), Y + side * 22 * s + (side > 0 ? 14 : -4), 15 * s + 5, `rgba(255,236,214,${k * (on ? 1 : .3)})`, 'center', 700); });
    txt(f(tt) + ' °C', X(tt), y - 26 * s - 10, 16 * s + 5, `rgba(255,255,255,${k})`, 'center', 700, MONO);
  }
  function s5(u, k) {   // ягода лущиться, потім зерно буріє
    const s = S(), cx = W * .32, cy = H * .5, R = Math.min(W * .16, H * .3), L = [['#b3261e', 'шкірка'], ['#e0533e', 'м’якоть'], ['#f2b48a', 'слиз'], ['#e9d8b4', 'пергамент']], p = u / 4;
    L.forEach(([c, n], i) => { const gone = ez((p - i * .22) / .2); x.globalAlpha = k * (1 - gone); x.fillStyle = c; x.beginPath(); x.ellipse(cx + gone * 60 * s * (i % 2 ? 1 : -1), cy - gone * 30, R * (1 - i * .14), R * .9 * (1 - i * .14), 0, 0, 7); x.fill();
      if (gone > .05 && gone < .95) txt(n, cx + R * 1.1, cy - R * .8 + i * 22 * s, 14 * s + 4, `rgba(255,236,214,${k * (1 - Math.abs(gone - .5) * 2)})`, 'left', 600); });
    x.globalAlpha = 1; const r = ez((u - 4.5) / 4.5), c = r < .4 ? `hsl(${80 - r * 80},38%,${58 - r * 20}%)` : `hsl(${48 - (r - .4) * 40},50%,${50 - (r - .4) * 55}%)`;
    bean(cx, cy, R * .5, c, -.4, .7, k);
    if (u > 4.5) { const T = Math.round(25 + 175 * r); txt(`${T} °C`, W * .7, H * .42, 34 * s + 10, `rgba(255,255,255,${k})`, 'center', 700, MONO);
      txt(T < 140 ? 'сушіння' : T < 195 ? 'Маяр: зерно буріє' : 'перший тріск!', W * .7, H * .42 + 34 * s + 12, 16 * s + 5, `rgba(255,178,122,${k})`, 'center', 700); }
  }
  function s6(u, k) {   // сходи цін, логарифмічні
    const s = S(), Q = [['робуста', ROB, '#8a5a3a'], ['арабіка', ARA, '#c98b5a'], ['гейша', GES, '#e0532a']], base = H * .82, hMax = H * .6, lmax = Math.log10(30000);
    txt('$ ЗА ФУНТ ЗЕЛЕНОГО ЗЕРНА · ЛОГ. ШКАЛА', W / 2, H * .12, 13 * s + 4, `rgba(240,225,205,${.65 * k})`, 'center', 600, MONO);
    Q.forEach(([n, v, c], i) => { const g = eo((u - .4 - i * 1.6) / 1.4), h = hMax * Math.max(.04, Math.log10(v + 1) / lmax) * g, X = W * (.25 + i * .25), bw = 90 * s + 30;
      x.globalAlpha = k; x.fillStyle = c; x.fillRect(X - bw / 2, base - h, bw, h); x.globalAlpha = 1;
      txt(n, X, base + 24 * s + 6, 15 * s + 5, `rgba(240,225,205,${.8 * k})`, 'center', 700); if (g > .4) txt('$' + (v < 100 ? f(v, 2) : Math.round(v).toLocaleString('uk-UA')), X, base - h - 14, 20 * s + 6, `rgba(255,255,255,${k})`, 'center', 700, MONO); });
  }
  const DRAW = [s1, s2, s3, s4, s5, s6];
  function draw(t) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d120b'); g.addColorStop(1, '#0d0806'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // пара над чашкою — тонкі хвилі на фоні
    x.strokeStyle = 'rgba(255,220,180,.04)'; x.lineWidth = 2; for (let j = 0; j < 5; j++) { x.beginPath(); for (let X = 0; X <= W; X += 12) { const Y = H * (.15 + j * .17) + Math.sin(X * .012 + t * .7 + j) * 10; X ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }
    const i = Math.max(0, SC.findIndex((s) => t < s.b)), sc = SC[i], u = t - sc.a, len = sc.b - sc.a, k = Math.min(1, Math.min(ez(u / .5), ez((len - u) / .5) + (i === SC.length - 1 ? 1 : 0)));
    DRAW[i](u, k);
    x.font = `600 11px ${MONO}`; x.fillStyle = 'rgba(240,225,205,.45)'; x.textAlign = 'left'; x.fillText(`${i + 1}/${SC.length} · ${sc.t}`, 14, 22);
    const c = sc.cap[u < len / 2 ? 0 : 1]; if (cap.textContent !== c) cap.textContent = c;
    head.style.left = (t / TOTAL * 100) + '%'; tm.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} / 1:00`;
    segs.forEach((e, j) => e.classList.toggle('on', j === i));
  }
  let t = 0, playing = false, raf = 0, last = 0, lastSc = -1;
  function loop(now) { const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; t += dt;
    if (t >= TOTAL) { t = TOTAL; pause(); draw(t - .001); return; }
    const si = SC.findIndex((s) => t < s.b); if (si !== lastSc) { lastSc = si; if (si > 0) SND('step', si); }
    draw(t); raf = playing ? requestAnimationFrame(loop) : 0; }
  function play() { if (t >= TOTAL - .01) t = 0; playing = true; cover.hidden = true; pp.textContent = '❚❚'; pp.classList.add('on'); last = 0; lastSc = -1; TRK(true, t); if (!raf) raf = requestAnimationFrame(loop); }
  function pause() { playing = false; cancelAnimationFrame(raf); raf = 0; pp.textContent = '▶'; pp.classList.remove('on'); TRK(false); }
  cover.addEventListener('click', play);
  pp.addEventListener('click', () => { playing ? pause() : play(); });
  trk.addEventListener('click', (e) => { const r = trk.getBoundingClientRect(); t = Math.max(0, Math.min(TOTAL - .01, (e.clientX - r.left) / r.width * TOTAL)); cover.hidden = true; if (playing) TRK(true, t); draw(t); });
  cv.addEventListener('click', () => { if (!cover.hidden) return; playing ? pause() : play(); });
  addEventListener('cf-sound', (e) => { if (playing) TRK(e.detail.on, t); });
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && playing) pause(); }, { threshold: .2 }).observe(box);
  new ResizeObserver(() => { size(); draw(t); }).observe(cv);
  size(); draw(REDUCE ? 15 : 8); t = 0;
  window.__cfReel = { total: TOTAL, seek: (tt) => new Promise((ok) => { t = tt; draw(t); requestAnimationFrame(() => ok()); }) };
})();
