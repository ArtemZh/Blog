/* Стаття 36: підказка «що натискати» — механіка Target Cursor (ідея React Bits, переписано з нуля, без React і GSAP),
   у ролі асистента: за курсором нічого не бігає. Щойно миша над тим, на що можна натиснути, чотири кутові дужки
   обводять цей елемент (кнопку, посилання, повзунок, вкладку, вузол схеми, ▶) і тримаються на ньому, поки він під мишею;
   з одного елемента на сусідній дужки перетікають, з порожнього місця — гаснуть. Працює на всій сторінці.
   Клікабельне — за селектором, а також усе, де браузер показує руку (cursor: pointer): так ловляться й активні частини canvas-сцен.
   Демо під час прокрутки: щойно на екран виїжджає новий блок, дужки переходять на його клікабельний елемент (кожен блок — один раз).
   Режим асистента: коли миша спокійна ~2,5 с (або на телефоні — завжди), дужки самі повільно переходять між клікабельними
   елементами, що зараз на екрані, — спершу тими, яких ще не чіпали; на кожному тримаються ~3 с. Навели мишу — підказка поступається.
   Звичайний курсор лишається; prefers-reduced-motion — без перетікання, одразу на місці. */
(function () {
  const FINE = matchMedia('(pointer: fine)').matches;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TARGET = 'button, a[href], input:not([type="hidden"]), select, textarea, summary, label[for], [role="button"], [role="tab"], [role="slider"], [role="link"], .node[data-id], .sk-kit__pin, [data-play], [onclick]';
  const el = document.createElement('div'); el.className = 'sk-tc'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<b class="c tl"></b><b class="c tr"></b><b class="c br"></b><b class="c bl"></b>';
  document.body.appendChild(el);
  const corners = [...el.querySelectorAll('.c')];
  const S = 11, P = 5, GROW = 10;   // відступ дужок від елемента; на появі дужки «сходяться» з відстані GROW
  let tgt = null, raf = 0, last = 0, fresh = false, hint = false, idleT = 0, hopT = 0, moved = 0;
  const used = new WeakSet();   // елементи, яких читач уже торкався — підказка їх пропускає
  const cur = corners.map(() => [0, 0]);   // поточні положення кутів (згладжено)
  // ціль: найближчий клікабельний предок, або перший предок із курсором-рукою (до 6 рівнів угору)
  function find(n) {
    const t = n.closest && n.closest(TARGET); if (t && !t.disabled) return t;
    for (let e = n, k = 0; e && e !== document.body && k < 6; e = e.parentElement, k++) if (getComputedStyle(e).cursor === 'pointer') return e;
    return null;
  }
  const box = (r, g) => [[r.left - g, r.top - g], [r.right + g, r.top - g], [r.right + g, r.bottom + g], [r.left - g, r.bottom + g]];
  function set(t) {
    if (t === tgt) return;
    // з порожнього місця — дужки з’являються трохи ширше й сходяться; з сусіднього елемента — перетікають
    if (t && !tgt) { const r = t.getBoundingClientRect(); box(r, P + GROW).forEach((p, i) => { cur[i][0] = p[0]; cur[i][1] = p[1]; }); fresh = true; }
    tgt = t; el.classList.toggle('on', !!t); el.classList.toggle('lock', !!t); el.classList.toggle('hint', !!t && hint);
    if (t && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  // підказка: кандидати — клікабельні елементи в межах статті, повністю на екрані; пропускаємо вже використані й верхнє меню
  const MAIN = document.querySelector('main') || document.body;
  function candidates() { const vh = innerHeight, vw = innerWidth;
    return [...MAIN.querySelectorAll(TARGET + ', canvas')].filter((e) => { if (used.has(e) || e.closest('.topbar, nav, .rail, .sk-tc')) return false;
      if (e.tagName === 'CANVAS' && getComputedStyle(e).cursor !== 'pointer' && getComputedStyle(e).cursor !== 'crosshair' && !e.closest('[data-k=s], .sk-sc__view')) return false;
      const r = e.getBoundingClientRect(); const hid = e.closest('.mv:not(.mv-in)'); return !hid && r.width > 8 && r.height > 8 && r.top > 70 && r.bottom < vh - 10 && r.left >= 0 && r.right <= vw && getComputedStyle(e).visibility !== 'hidden'; }); }
  function hop() { clearTimeout(hopT); if (!hint) return; const c = candidates();
    if (c.length) { const cur = c.indexOf(tgt), nx = c[(cur + 1) % c.length]; set(nx === tgt ? null : nx); } else set(null);
    hopT = setTimeout(hop, REDUCE ? 4000 : 3200); }
  function idle() { clearTimeout(idleT); idleT = setTimeout(() => { hint = true; hop(); }, FINE ? 2500 : 1500); }
  function wake() { if (hint) { hint = false; clearTimeout(hopT); el.classList.remove('hint'); set(null); } idle(); }
  addEventListener('pointerdown', (e) => { const t = e.target && e.target.nodeType === 1 ? find(e.target) : null; if (t) used.add(t); wake(); }, { passive: true });
  // демо під час прокрутки: новий блок на екрані → дужки одразу йдуть на його клікабельний елемент (кожен блок — один раз)
  const shown = new WeakSet(); let scT = 0, overT = 0;
  const groupOf = (e) => e.closest('.viz-slot, .sk-kit, .sk-minis, .cbox, section') || e;
  function demo() { if (overT > performance.now()) return; const vh = innerHeight;
    const c = candidates().filter((e) => { const r = e.getBoundingClientRect(); return r.top > vh * .15 && r.bottom < vh * .85 && !shown.has(groupOf(e)); });
    if (!c.length) return; const e = c[0]; shown.add(groupOf(e)); hint = true; set(e); clearTimeout(hopT); hopT = setTimeout(hop, REDUCE ? 4000 : 3200); }
  addEventListener('scroll', () => { clearTimeout(scT); scT = setTimeout(demo, 160);
    if (tgt && hint) { const r = tgt.getBoundingClientRect(); if (r.bottom < 60 || r.top > innerHeight) set(null); } }, { passive: true });
  idle();
  if (FINE) addEventListener('pointermove', (e) => { wake(); const t = e.target && e.target.nodeType === 1 ? find(e.target) : null; if (t) overT = performance.now() + 1500; set(t); }, { passive: true });
  document.addEventListener('pointerleave', () => set(null));
  addEventListener('blur', () => set(null));
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (tgt && !tgt.isConnected) set(null);
    if (tgt) {
      const goal = box(tgt.getBoundingClientRect(), P), k = REDUCE ? 1 : Math.min(1, dt * (hint ? 2.6 : fresh ? 14 : 18));   // підказка рухається повільно
      corners.forEach((c, i) => { cur[i][0] += (goal[i][0] - cur[i][0]) * k; cur[i][1] += (goal[i][1] - cur[i][1]) * k;
        c.style.transform = `translate(${cur[i][0] - S / 2}px,${cur[i][1] - S / 2}px) rotate(${i * 90}deg)`; });
    }
    raf = tgt ? requestAnimationFrame(frame) : 0;   // поки є ціль — стежимо й за прокруткою
  }
  // для перевірки скриптом: стан підсвітки
  window.__skTarget = () => ({ on: !!tgt, hint, tag: tgt ? tgt.tagName + (tgt.className && typeof tgt.className === 'string' ? '.' + tgt.className.split(' ')[0] : '') : null,
    corners: cur.map((p) => p.map(Math.round)) });
})();
