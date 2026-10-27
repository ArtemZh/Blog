/* Стаття 36, банер: «довга витримка правок» (ідея Hero 32 з React Bits Pro — шкала витримки розтягує рух у світлові
   сліди; переписано з нуля на Canvas 2D). Нічна дорога в справжній перспективі: смуги лежать на площині дороги й
   проєктуються на екран — унизу широко, до горизонту сходяться, тоншають і тонуть в імлі; дорога плавно в’ється,
   вигини постійно змінюються; червоні задні вогні біжать від глядача до горизонту, світлі фари — на глядача.
   Шкала «Правки» праворуч (1 · 11 · 22 · 50 · 150) — це витримка: що більше правок, то довші й густіші сліди.
   Курсор ледь відштовхує потоки, як рука над нічною дорогою. prefers-reduced-motion — один нерухомий кадр. */
(function () {
  const hero = document.querySelector('.hero3'); if (!hero) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STOPS = [1, 11, 22, 50, 150];
  const cv = document.createElement('canvas'); cv.className = 'sk-hero__cv'; hero.insertBefore(cv, hero.firstChild.nextSibling);
  const x = cv.getContext('2d');
  // шкала: мітки й повзунок (range — для клавіатури й зчитувачів екрана)
  const dial = document.createElement('div'); dial.className = 'sk-dial';
  const ticks = Array.from({ length: 21 }, (_, i) => `<i style="left:${i * 5}%"${i % 5 === 0 ? ' class="big"' : ''}></i>`).join('');
  dial.innerHTML = `<div class="sk-dial__top"><span>Правки</span><b>22</b></div><div class="sk-dial__track">${ticks}<em></em></div>
    <div class="sk-dial__lbl">${STOPS.map((v, i) => `<span style="left:${i * 25}%">${v}</span>`).join('')}</div>
    <input type="range" min="0" max="4" step="0.01" value="2" autocomplete="off" aria-label="Правки: довжина світлових слідів">`;
  hero.appendChild(dial); hero.classList.add('sk-hero-live');
  const inp = dial.querySelector('input'), out = dial.querySelector('b'), mark = dial.querySelector('em');

  let W = 1, H = 1, lanes = [], pos = 2, goal = 2, mx = -1e4, my = -1e4, pull = 0;
  // значення шкали між мітками: логарифмічно, як витримка камери
  const valAt = (p) => { const i = Math.min(3, Math.floor(p)), f = p - i; return Math.exp(Math.log(STOPS[i]) + (Math.log(STOPS[i + 1]) - Math.log(STOPS[i])) * f); };
  function setPos(p, snd) { goal = Math.max(0, Math.min(4, Math.abs(p - Math.round(p)) < 0.06 ? Math.round(p) : p)); inp.value = goal; const v = Math.round(valAt(goal)); out.textContent = v; mark.style.left = `${goal * 25}%`;
    if (snd && window.SK_SND) SK_SND.fx('click'); }
  inp.addEventListener('input', () => setPos(+inp.value, false));
  inp.addEventListener('change', () => { setPos(Math.round(+inp.value), true); });
  hero.addEventListener('wheel', (e) => { if (!e.target.closest('.sk-dial')) return; e.preventDefault(); setPos(goal + Math.sign(e.deltaY) * -0.25, true); }, { passive: false });

  // дорога в перспективі (як у Hero 32): смуги лежать у 3D на площині дороги й проєктуються на екран —
  // біля глядача (знизу) широко, до горизонту сходяться й тоншають, удалині розчиняються в імлі;
  // дорога плавно в’ється — вигин змінюється з часом і з глибиною, тож траєкторії постійно рухаються
  const ZN = 1.2, ZF = 60, NS = 90;
  // глибина z для частки шляху s (0 — біля глядача, 1 — горизонт): рівномірно в 1/z, як бачить око
  const zOf = (s) => 1 / (1 / ZN + (1 / ZF - 1 / ZN) * s);
  let HX = 0, HY = 0, F = 0, CAMH = 1.6;
  function build() {
    const d = Math.min(2, devicePixelRatio || 1); W = hero.clientWidth; H = hero.clientHeight; cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0);
    // горизонт — трохи вище середини, точка сходу — праворуч від заголовка, ліворуч від шкали
    HX = W * 0.66; HY = H * 0.3; F = H * 0.62;
    lanes = [];
    // 12 світлих смуг ліворуч (фари, рух на нас), 9 червоних праворуч (задні вогні, рух від нас); поперечне зміщення — метри
    for (let i = 0; i < 12; i++) lanes.push({ off: -8.6 + i * 0.7, warm: false, k: i, sp: 0.06 + ((i * 37) % 10) / 260, ph: ((i * 53) % 100) / 100 });
    for (let j = 0; j < 9; j++) lanes.push({ off: 0.6 + j * 0.7, warm: true, k: 12 + j, sp: 0.05 + ((j * 29) % 10) / 300, ph: ((j * 71) % 100) / 100 });
  }
  new ResizeObserver(build).observe(hero); build();
  hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { mx = my = -1e4; });

  // вигин дороги на глибині z у мить T: повільні хвилі, що біжать уздовж дороги (поворот ліворуч–праворуч)
  let T = 0;
  const bend = (z) => 0.012 * z * z * Math.sin(T * 0.11 + 0.6) + 2.4 * Math.sin(z * 0.07 - T * 0.23) * Math.min(1, z / 12);
  const P = [0, 0, 0];
  // точка смуги l на частці шляху s → екран; P[2] — масштаб (1/z), від нього ширина й прозорість
  function at(l, s) { const z = zOf(s), k = F / z;
    let px = HX + (l.off + bend(z)) * k, py = HY + CAMH * k;
    if (pull > 0.01 && s < 0.5) { const dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy, r = 120, q = pull * 22 * (1 - 2 * s) * Math.exp(-d2 / (r * r)); if (q > 0.1) { const dd = Math.sqrt(d2) || 1; px += dx / dd * q; py += dy / dd * q; } }
    P[0] = px; P[1] = py; P[2] = ZN / z; return P; }
  function path(l, s0, s1) { const n = Math.max(2, Math.ceil((s1 - s0) * NS)); x.beginPath();
    for (let q = 0; q <= n; q++) { at(l, s0 + (s1 - s0) * q / n); q ? x.lineTo(P[0], P[1]) : x.moveTo(P[0], P[1]); } }

  let raf = 0, vis = true, t0 = performance.now(), last = t0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = REDUCE ? 4 : (now - t0) / 1000; T = t;
    pos += (goal - pos) * Math.min(1, dt * 6);
    pull += ((mx > -1e3 ? 1 : 0) - pull) * Math.min(1, dt * 4);
    // витримка: довжина сліду в частках шляху (1 правка — вогники фар, 150 — лінії аж до горизонту)
    const L = 0.04 + 0.9 * Math.pow(pos / 4, 1.5);
    x.globalCompositeOperation = 'source-over'; x.fillStyle = '#050407'; x.fillRect(0, 0, W, H);
    // імла на горизонті — ледь тепла смуга світла
    const hz = x.createLinearGradient(0, HY - H * 0.12, 0, HY + H * 0.1); hz.addColorStop(0, 'rgba(255,140,80,0)'); hz.addColorStop(0.55, 'rgba(255,140,80,.06)'); hz.addColorStop(1, 'rgba(255,140,80,0)');
    x.fillStyle = hz; x.fillRect(0, HY - H * 0.12, W, H * 0.22);
    x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
    for (const l of lanes) {
      // ледь видима «розмітка» всієї смуги: до горизонту гасне
      path(l, 0, 0.97); const fade = x.createLinearGradient(0, H, 0, HY);
      fade.addColorStop(0, l.warm ? 'rgba(200,50,40,.12)' : 'rgba(240,215,180,.10)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
      x.strokeStyle = fade; x.lineWidth = 1; x.stroke();
      // червоні (задні вогні) їдуть від глядача до горизонту — голова (s1) далі;
      // світлі (фари) їдуть на глядача — голова (s0) ближче, хвіст тягнеться до горизонту
      const f = (t * l.sp + l.ph) % 1;
      let s0, s1, hd;
      if (l.warm) { const u = f * (1 + L); s1 = Math.min(0.985, u); s0 = Math.max(0, u - L); hd = s1; }
      else { const h = (1 - f) * (1 + L) - L; s0 = Math.max(0, h); s1 = Math.min(0.985, h + L); hd = s0; }
      if (s1 - s0 < 0.004) continue;
      path(l, s0, s1);
      const tl = hd === s1 ? s0 : s1;
      at(l, hd); const hx = P[0], hy = P[1]; at(l, s0); const ts = P[2]; at(l, tl);
      // туман: удалині світло слабшає
      const fog = Math.min(1, 0.25 + 0.75 * Math.pow(1 - hd, 0.6));
      const g = x.createLinearGradient(hx, hy, P[0], P[1]);
      if (l.warm) { g.addColorStop(0, `rgba(255,120,90,${fog})`); g.addColorStop(0.5, `rgba(235,70,55,${0.75 * fog})`); g.addColorStop(1, 'rgba(200,40,40,0)'); }
      else { g.addColorStop(0, `rgba(255,248,232,${fog})`); g.addColorStop(0.5, `rgba(240,215,170,${0.7 * fog})`); g.addColorStop(1, 'rgba(220,190,150,0)'); }
      // ширина — від масштабу хвоста (близька частина сліду товща), не менше півпікселя вдалині
      const w = Math.max(0.5, 3.4 * Math.sqrt(ts));
      x.strokeStyle = g;
      x.globalAlpha = 0.07; x.lineWidth = w * 9; x.stroke();
      x.globalAlpha = 0.22; x.lineWidth = w * 3.2; x.stroke();
      x.globalAlpha = 1; x.lineWidth = w; x.stroke();
    }
    x.globalCompositeOperation = 'source-over';
    raf = vis && !REDUCE ? requestAnimationFrame(frame) : 0;
  }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }, { threshold: 0 }).observe(hero);
  setPos(2, false);
  raf = requestAnimationFrame(frame);
})();
