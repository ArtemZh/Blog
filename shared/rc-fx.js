/* Стаття 35: два ефекти за ідеями Canvas UI (canvasui.dev, David Haz; MIT + Commons Clause) — переписано з нуля, без React і без html-in-canvas.
   1) ASCII-змітання: смуга світних ASCII-символів пробігає по рядку тексту й замінює один зміст іншим (ліворуч від смуги — новий текст, праворуч — старий).
      window.RC_SWEEP(el, html, {dur}) — для будь-якого елемента. На банері — стрічка «що кричало → що сталося».
   2) Лазер: світний промінь унизу екрана; вміст блока над променем «проявляється» з теплим сяйвом, під ним — схований. Розділ 05 (панель приладів).
   Обидва поважають prefers-reduced-motion: заміна миттєва, промінь не потрібен. */
(function () {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CH = '01#%&*+=<>/\\|$@?!ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');

  /* ── 1. ASCII-змітання ── */
  function sweep(el, html, opt = {}) {
    if (REDUCE || !el.isConnected) { el.innerHTML = html; return Promise.resolve(); }
    if (el._sw) el._sw.cancel();
    const dur = opt.dur || 900, band = opt.band || 70;
    const cs = getComputedStyle(el); if (cs.position === 'static') el.style.position = 'relative';
    const oldHTML = el.innerHTML; el.innerHTML = '';
    const mk = (h) => { const d = document.createElement('span'); d.className = 'rc-sw__l'; d.innerHTML = h; el.appendChild(d); return d; };
    const A = mk(oldHTML), B = mk(html); B.style.position = 'absolute'; B.style.left = '0'; B.style.top = '0'; B.style.right = '0';
    const cv = document.createElement('canvas'); cv.className = 'rc-sw__cv'; el.appendChild(cv);
    const x = cv.getContext('2d'), d = Math.min(2, devicePixelRatio || 1);
    const W = Math.max(el.clientWidth, B.scrollWidth, A.scrollWidth) + band, H = Math.max(A.offsetHeight, B.offsetHeight, 16);
    el.style.minHeight = H + 'px'; cv.width = Math.round(W * d); cv.height = Math.round(H * d); cv.style.width = W + 'px'; cv.style.height = H + 'px'; x.scale(d, d);
    const fs = Math.max(10, Math.min(16, parseFloat(cs.fontSize) * .85)), col = opt.color || '255,178,122';
    let raf = 0, t0 = performance.now(), done;
    const p = new Promise((ok) => { done = ok; });
    function frame(now) {
      const u = Math.min(1, (now - t0) / dur), e = u < .5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2, bx = -band + (W + band) * e;
      // новий текст видно ліворуч від смуги, старий — праворуч
      B.style.clipPath = `inset(0 ${Math.max(0, W - bx - band * .3)}px 0 0)`; A.style.clipPath = `inset(0 0 0 ${Math.max(0, bx + band * .7)}px)`;
      x.clearRect(0, 0, W, H); x.font = `600 ${fs}px "Roboto Mono", monospace`; x.textBaseline = 'middle';
      const cw = fs * .62, rows = Math.max(1, Math.round(H / (fs * 1.25)));
      for (let r = 0; r < rows; r++) for (let c = 0; c * cw < band; c++) {
        const px = bx + c * cw, f = 1 - Math.abs(c * cw / band - .5) * 2; if (px < -cw || px > W) continue;
        x.fillStyle = `rgba(${col},${(.25 + .75 * f) * (Math.random() < .85 ? 1 : .3)})`; x.shadowColor = `rgba(${col},.9)`; x.shadowBlur = 8 * f;
        x.fillText(CH[(Math.random() * CH.length) | 0], px, (r + .5) * H / rows);
      }
      x.shadowBlur = 0;
      if (u < 1) raf = requestAnimationFrame(frame); else finish();
    }
    function finish() { cancelAnimationFrame(raf); el.innerHTML = html; el.style.minHeight = ''; el._sw = null; done(); }
    el._sw = { cancel: finish };
    raf = requestAnimationFrame(frame);
    return p;
  }
  window.RC_SWEEP = sweep;

  // банер: стрічка «що кричало → що сталося», по черзі, поки банер на екрані
  const hero = document.querySelector('.rc-hero .hero3__txt');
  if (hero) {
    const L = [['2022 · ВВП падає два квартали поспіль', 'Рецесії не було: найм +350 тис. на місяць'], ['2022–2024 · крива дохідності перевернута 26 місяців', 'Рецесії не було: інверсію роздули ставки й інфляція'],
      ['2024 · спрацювало правило Сам', 'Рецесії не було: росла робоча сила, а не звільнення'], ['2025 · ВВП у мінусі через мита', 'Рецесії не було: імпорт «з’їв» ВВП лише на папері'],
      ['2026 · нафта понад $100, настрої на дні', 'Поки що рецесії немає: ВВП +2,2 %']];
    const tk = document.createElement('div'); tk.className = 'rc-tick'; tk.innerHTML = `<i>${L[0][0]}</i>`; hero.appendChild(tk);
    const line = tk.querySelector('i'); let k = 0, half = 0, vis = true, tm = 0;
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: .2 }).observe(hero);
    const next = () => { tm = setTimeout(async () => { if (vis && !document.hidden) { half = 1 - half; if (!half) k = (k + 1) % L.length;
      tk.classList.toggle('ok', !!half); await sweep(line, L[k][half], { dur: 1000, color: half ? '159,227,184' : '255,178,122' }); } next(); }, half ? 2600 : 2200); };
    if (!REDUCE) next();
  }

  /* ── 2. Лазер: розділ 05 проявляється над променем при прокрутці ── */
  const host = document.getElementById('rc-now');
  if (host && !REDUCE) {
    host.classList.add('rc-laz');
    const beam = document.createElement('div'); beam.className = 'rc-laz__beam'; beam.innerHTML = '<canvas></canvas>'; host.appendChild(beam);
    const cv = beam.querySelector('canvas'), x = cv.getContext('2d');
    let act = 0, lastY = scrollY, raf = 0, on = false, done = false, t = 0;
    const OFF = () => Math.min(180, innerHeight * .22);           // промінь — на такій висоті від низу екрана
    function place() {
      const r = host.getBoundingClientRect(), by = innerHeight - OFF() - r.top;   // позиція променя всередині блока
      const k = by / r.height;
      if (k >= 1.04) { done = true; host.style.setProperty('--laz', '120%'); beam.style.opacity = 0; return false; }
      host.style.setProperty('--laz', Math.max(-5, by) + 'px'); beam.style.top = by + 'px'; beam.style.opacity = by > 0 ? 1 : 0; return true;
    }
    function draw() {
      const d = Math.min(2, devicePixelRatio || 1), w = host.clientWidth, h = 90; if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); cv.style.width = w + 'px'; cv.style.height = h + 'px'; }
      x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h); const cy = h / 2, a = .55 + .45 * act;
      // хвиляста лінія променя: біле ядро + кольорове сяйво
      for (let pass = 0; pass < 3; pass++) {
        x.beginPath(); for (let px = 0; px <= w; px += 6) { const y = cy + Math.sin(px * .02 + t * 3) * (2 + 4 * act) + Math.sin(px * .051 - t * 5) * 1.5; px ? x.lineTo(px, y) : x.moveTo(px, y); }
        x.strokeStyle = pass === 2 ? `rgba(255,255,255,${a})` : `rgba(255,120,60,${(pass ? .5 : .22) * a})`; x.lineWidth = pass === 2 ? 2 : pass ? 7 : 18; x.shadowColor = 'rgba(255,110,50,.9)'; x.shadowBlur = pass === 2 ? 12 : 0; x.stroke();
      }
      x.shadowBlur = 0;
      for (let i = 0; i < 26 * (.4 + act); i++) { x.fillStyle = `rgba(255,${180 + Math.random() * 60 | 0},120,${Math.random() * .8 * a})`; x.fillRect(Math.random() * w, cy - 10 + Math.random() * 20 - 10, 2, 2); }
    }
    function loop(now) { t = now / 1000; const dy = Math.abs(scrollY - lastY); lastY = scrollY; act = Math.min(1, act * .93 + dy * .004);
      if (!place()) { raf = 0; return; } draw(); raf = on ? requestAnimationFrame(loop) : 0; }
    new IntersectionObserver((es) => { on = es[0].isIntersecting && !done; if (on && !raf) raf = requestAnimationFrame(loop); if (!on) place(); }, { threshold: 0, rootMargin: '0px 0px 0px 0px' }).observe(host);
    place();
  }
})();
