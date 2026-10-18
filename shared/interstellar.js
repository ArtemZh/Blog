/* Стаття 34: інтерактиви без WebGL.
   1) Обертання діри → найближча стійка колова орбіта (ISCO) → у скільки разів повільніше там іде час.
      Формули Бардіна, Прес і Тьюколскі (1972) для діри Керра, одиниці GM/c² = 1, орбіта прямого обертання.
   2) Два годинники: година на планеті й роки на Землі.
   3) Приплив біля горизонту залежно від маси діри.
   4) Лінії життя Купера й Мерф. */
(function () {
  const $ = (id) => document.getElementById(id);
  const fmt = (x, d = 0) => x.toLocaleString('uk', { maximumFractionDigits: d, minimumFractionDigits: 0 });

  /* ── 1–2: сповільнення часу ── */
  // δ = 1 − a; рахуємо через δ, щоб не губити точність при a, близькому до 1
  function isco(d) { const a = 1 - d, z1 = 1 + Math.cbrt(d * (2 - d)) * (Math.cbrt(1 + a) + Math.cbrt(d)), z2 = Math.sqrt(3 * a * a + z1 * z1);
    return 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2)); }
  // dt/dτ для колової орбіти в площині екватора: (r^1,5 + a) / (r^¾ · √(r^1,5 − 3√r + 2a))
  function slow(r, d) { const a = 1 - d; return (Math.pow(r, 1.5) + a) / (Math.pow(r, .75) * Math.sqrt(Math.pow(r, 1.5) - 3 * Math.sqrt(r) + 2 * a)); }
  function horizon(d) { const a = 1 - d; return 1 + Math.sqrt(d * (2 - d)); }
  const sl = $('spinSl');
  const GARG = 1.3e-14;
  const dOf = (v) => Math.pow(10, -15 * v / 1000);                    // повзунок 0…1000 → δ від 1 до 10⁻¹⁵
  function human(hours) {
    if (hours < 1 / 60) return fmt(hours * 3600, 1) + ' с';
    if (hours < 1) return fmt(hours * 60, 1) + ' хв';
    if (hours < 48) return fmt(hours, 1) + ' год';
    if (hours < 24 * 365.25) return fmt(hours / 24, 1) + ' доби';
    return fmt(hours / 24 / 365.25, 1) + ' років';
  }
  let K = 1, D = 1;
  const dpr = Math.min(2, devicePixelRatio || 1);
  function fit(c) { const w = c.clientWidth, h = c.clientHeight; if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return { x, w, h }; }
  function upd() {
    const d = dOf(+sl.value), a = 1 - d, r = isco(d), k = slow(r, d), rh = horizon(d); K = k; D = d;
    $('spinA').textContent = d >= 1e-3 ? 'a = ' + a.toFixed(3) : 'a = 1 − ' + d.toExponential(1).replace('e', '·10^');
    $('spinR').textContent = fmt(r, r < 1.01 ? 5 : 2) + ' GM/c²' + ' (горизонт — ' + fmt(rh, rh < 1.01 ? 5 : 2) + ')';
    $('spinK').textContent = '×' + fmt(k, k < 10 ? 2 : 0);
    $('spinH').textContent = human(k);
    $('spinNote').textContent = Math.abs(Math.log10(d / GARG)) < .15 ? 'Це Гаргантюа: година на орбіті ≈ 7 рокам на Землі, як у фільмі.'
      : d > .5 ? 'Діра без обертання: навіть на найближчій стійкій орбіті час іде лише в ≈1,4 раза повільніше.' : '';
    orbit();
    // множник для інших візуалізацій розділу (is-time-3d.js): window.IS_SPIN і подія 'is-spin'
    window.IS_SPIN = { K: k, d, a, r, rh }; dispatchEvent(new CustomEvent('is-spin', { detail: window.IS_SPIN }));
  }

  /* ── схема згори: горизонт, ISCO, планета. Шкала радіуса — корінь, щоб і 6, і 1,00004 було видно ── */
  const oc = $('orbitCv');
  function orbit(t = performance.now() / 1000) {
    if (!oc) return; const { x, w, h } = fit(oc), cx = w / 2, cy = h / 2, R = Math.min(w, h) * .44;
    const sc = (r) => R * Math.sqrt(r / 7);                                   // r = 7 GM/c² — край схеми
    x.clearRect(0, 0, w, h);
    const r = isco(D), rh = horizon(D), k = slow(r, D);
    // ергосфера в площині екватора — 2 GM/c²: тут простір тягне все за обертанням діри
    x.fillStyle = 'rgba(70,120,220,' + (.08 + .12 * (1 - Math.min(1, D))) + ')'; x.beginPath(); x.arc(cx, cy, sc(2), 0, 7); x.fill();
    // «вихор» захоплення простору: дуги, що крутяться швидше, коли обертання більше
    x.strokeStyle = 'rgba(140,170,255,.25)'; x.lineWidth = 1;
    for (let n = 0; n < 6; n++) { const a0 = t * (1 - D) * 1.5 + n * Math.PI / 3; x.beginPath(); x.arc(cx, cy, sc(2) * (.75 + .04 * n), a0, a0 + .9); x.stroke(); }
    x.setLineDash([4, 5]); x.strokeStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(cx, cy, sc(6), 0, 7); x.stroke(); x.setLineDash([]);
    x.strokeStyle = 'rgba(255,214,160,.85)'; x.lineWidth = 1.6; x.beginPath(); x.arc(cx, cy, sc(r), 0, 7); x.stroke();
    x.fillStyle = '#000'; x.beginPath(); x.arc(cx, cy, sc(rh), 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1; x.stroke();
    // планета: колір від білого до червоного за глибиною ями (lg множника)
    const f = Math.min(1, Math.log10(k) / 5), ang = t * .6;
    const px = cx + Math.cos(ang) * sc(r), py = cy + Math.sin(ang) * sc(r);
    const g = x.createRadialGradient(px, py, 0, px, py, 14); g.addColorStop(0, `rgba(255,${220 - 170 * f},${200 - 180 * f},.9)`); g.addColorStop(1, 'rgba(255,80,40,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, 14, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 3.2, 0, 7); x.fill();
    x.font = '500 11px "Roboto Mono", monospace'; x.fillStyle = 'rgba(255,255,255,.6)'; x.textAlign = 'left';
    x.fillText('6 GM/c² — без обертання', cx + sc(6) * .72 + 4, cy - sc(6) * .72);
    x.fillStyle = 'rgba(255,214,160,.9)'; x.fillText('ISCO ' + fmt(r, r < 1.01 ? 5 : 2), 10, h - 26);
    x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText('горизонт ' + fmt(rh, rh < 1.01 ? 5 : 2), 10, h - 10);
  }

  if (sl) { sl.addEventListener('input', upd);
    $('spinGarg').addEventListener('click', () => { sl.value = Math.round(-Math.log10(GARG) / 15 * 1000); upd(); });
    // за замовчуванням — Гаргантюа: у цьому розділі головне — її множник
    sl.value = Math.round(-Math.log10(GARG) / 15 * 1000); upd();
    let last = performance.now(), vis = false;
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: .05 }).observe($('time'));
    addEventListener('resize', () => orbit());
    (function tick(now) { const dt = Math.min(.1, (now - last) / 1000); last = now;
      if (vis) orbit(now / 1000);
      requestAnimationFrame(tick); })(last);
  }

  /* ── 3: приплив біля горизонту ── */
  const tl = $('tideSl');
  if (tl) {
    const G = 6.674e-11, Ms = 1.989e30, c = 2.998e8;
    const upT = () => {
      const lg = +tl.value / 10, M = Math.pow(10, lg) * Ms, rs = 2 * G * M / (c * c), da = 2 * G * M * 2 / (rs * rs * rs);   // людина 2 м на горизонті
      $('tideM').textContent = lg < 4 ? fmt(Math.pow(10, lg), 0) + ' мас Сонця' : '10^' + fmt(lg, 1) + ' мас Сонця';
      $('tideR').textContent = rs < 1e6 ? fmt(rs / 1e3, 0) + ' км' : rs < 1.496e11 / 5 ? fmt(rs / 1e9, 2) + ' млн км' : fmt(rs / 1.496e11, 2) + ' а. о.';
      const g = da / 9.81;
      $('tideG').textContent = g >= 1e3 ? g.toExponential(1).replace('e+', '·10^') + ' g' : g >= .01 ? fmt(g, 2) + ' g' : g.toExponential(1).replace('e-', '·10^-') + ' g';
      $('tideV').textContent = g > 1e3 ? 'розірве на шматки задовго до горизонту' : g > 3 ? 'смертельно' : g > .1 ? 'відчутно, але переживе' : 'не помітить';
      $('tideV').className = g > 3 ? 'bad' : 'ok';
    };
    tl.addEventListener('input', upT); upT();
  }

})();
