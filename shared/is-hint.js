/* Стаття 34: підказка «цим можна керувати». Коли бігунок уперше повністю з'являється на екрані, він ненадовго підсвічується,
   а сам бігунок плавно гойдається туди-сюди (значення справді змінюється, сцена реагує) і повертається на місце;
   кожен бігунок підказує лише раз. Повага до reduced-motion: тільки підсвітка, без руху. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = `
    .rng-hint{outline:2px solid color-mix(in srgb,var(--act) 55%,transparent);outline-offset:4px;border-radius:999px;transition:outline-color .6s}
`;
  css.textContent += `
    /* кнопки-дії: коли піднялись на третину екрана — дві хвилі обведення, легкий «підскок» і відблиск, що пробігає по кнопці */
    .btn-hint{animation:btnBounce 1.6s ease-in-out 1}
    .btn-hint::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
      background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);background-size:250% 100%;animation:btnShine 1.6s ease-in-out 1}
    @keyframes btnBounce{0%,100%{transform:none;box-shadow:0 0 0 0 color-mix(in srgb,var(--act) 0%,transparent)}
      15%{transform:translateY(-3px) scale(1.04);box-shadow:0 0 0 6px color-mix(in srgb,var(--act) 35%,transparent)}
      35%{transform:none;box-shadow:0 0 0 12px color-mix(in srgb,var(--act) 0%,transparent)}
      55%{transform:translateY(-2px) scale(1.02);box-shadow:0 0 0 6px color-mix(in srgb,var(--act) 30%,transparent)}
      75%{transform:none;box-shadow:0 0 0 12px color-mix(in srgb,var(--act) 0%,transparent)}}
    @keyframes btnShine{from{background-position:120% 0}to{background-position:-30% 0}}
    /* мікроанімації для всіх кнопок статті: м'який підйом під курсором, «натискання», хвилька від місця кліку */
    .mb{transition:transform .18s cubic-bezier(.3,.7,.4,1.4),box-shadow .2s,filter .2s}
    .mb:hover:not(:disabled){transform:translateY(-1px)}
    .mb:active:not(:disabled){transform:translateY(1px) scale(.97)}
    .mb-rel{position:relative}
    .mb{overflow:hidden}
    .mb-rip{position:absolute;border-radius:50%;pointer-events:none;background:currentColor;opacity:.25;transform:scale(0);animation:mbRip .55s ease-out forwards}
    @keyframes mbRip{to{transform:scale(1);opacity:0}}
    .play-glow{animation:playGlow 2.6s ease-in-out infinite}
    @keyframes playGlow{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--act) 45%,transparent)}50%{box-shadow:0 0 0 7px color-mix(in srgb,var(--act) 0%,transparent),0 0 18px color-mix(in srgb,var(--act) 45%,transparent)}}
    .play-glow.btn-hint{animation:btnBounce 1.6s ease-in-out 1}
    @media (prefers-reduced-motion: reduce){.btn-hint,.btn-hint::after,.mb-rip,.play-glow{animation:none}.mb:hover,.mb:active{transform:none}.play-glow{box-shadow:0 0 0 3px color-mix(in srgb,var(--act) 40%,transparent)}}`;
  document.head.appendChild(css);
  const done = new WeakSet();
  function hint(r) {
    if (done.has(r) || r.disabled || r.offsetParent === null || r.hasAttribute('data-nohint')) return; done.add(r);   // data-nohint — бігунок, що й так рухається сам
    r.classList.add('rng-hint'); setTimeout(() => r.classList.remove('rng-hint'), 4400);
    if (reduce) return;
    // сам бігунок плавно ходить туди-сюди (значення справді змінюється — сцена реагує), потім повертається туди, де був
    const mn = +r.min || 0, mx = +r.max || 100, st = r.step === 'any' ? 0 : (+r.step || 1), v0 = +r.value, A = Math.max(st, (mx - mn) * .08);
    const span = Math.min(mx - v0, v0 - mn) >= A ? A : Math.max(st, Math.min(A, Math.max(mx - v0, v0 - mn)));
    const dir = mx - v0 >= v0 - mn ? 1 : -1, T = 3800, t0 = performance.now(); let stop = false;
    const cancel = () => { stop = true; }; r.addEventListener('pointerdown', cancel, { once: true }); r.addEventListener('keydown', cancel, { once: true });
    const set = (v) => { r.value = String(st ? Math.round(v / st) * st : v); r.dispatchEvent(new Event('input', { bubbles: true })); };
    (function f(now) { if (stop) return; const u = Math.min(1, (now - t0) / T);
      const k = Math.sin(u * Math.PI * 3) * (1 - u) * (1 - u * .3);              // три гойдання, що згасають
      set(v0 + dir * span * k); if (u < 1) requestAnimationFrame(f); else set(v0); })(t0);
  }
  /* кнопки-дії, які варто «показати»: пуск таймлапсу, Аномалія, Передати, ролик, звук, дрейф, бутерброд, розміри, цокання */
  const ACT = '.itm-play,.dst-go,.tss-go,.tss-film-play,.snd-all,.bh-snd,.rr-btn,.tss-sw,.vz-btn,[data-play]';
  // кнопки «плей» (запускають анімацію) — світяться постійно м'якою пульсацією, доки їх уперше не натиснуть
  const PLAY = '.itm-play,.tss-film-play,[data-act="play"],[data-play]';
  const bdone = new WeakSet();
  function bhint(b) { if (bdone.has(b) || b.disabled || b.offsetParent === null) return; bdone.add(b);
    if (getComputedStyle(b).position === 'static') b.classList.add('mb-rel');
    b.classList.add('btn-hint'); setTimeout(() => b.classList.remove('btn-hint'), 1700); }
  const bio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { bio.unobserve(e.target); setTimeout(() => bhint(e.target), 450); } }), { threshold: 1, rootMargin: '0px 0px -33% 0px' });
  // мікроанімації: усі кнопки в статті (крім меню й верхньої панелі)
  function micro(b) { if (b.dataset.mb) return; b.dataset.mb = 1; b.classList.add('mb'); if (getComputedStyle(b).position === 'static') b.classList.add('mb-rel');
    b.addEventListener('pointerdown', (e) => { if (reduce || b.disabled) return; const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s2 = document.createElement('span');
      s2.className = 'mb-rip'; s2.style.width = s2.style.height = d + 'px'; s2.style.left = (e.clientX - r.left - d / 2) + 'px'; s2.style.top = (e.clientY - r.top - d / 2) + 'px';
      b.appendChild(s2); setTimeout(() => s2.remove(), 600); });
    if (b.matches(PLAY)) { b.classList.add('play-glow'); b.addEventListener('click', () => b.classList.remove('play-glow'), { once: true }); } }
  const scanB = () => { document.querySelectorAll('.page section button, .page .hero3 button, .page .vz button').forEach((b) => { micro(b); if (b.matches(ACT) && !b.dataset.bh) { b.dataset.bh = 1; bio.observe(b); } }); };

  // спрацьовує, коли бігунок піднявся щонайменше на третину екрана від низу (а не щойно з'явився внизу) — так його точно помітять
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const r = e.target; io.unobserve(r); setTimeout(() => hint(r), 300); } }), { threshold: 1, rootMargin: '0px 0px -33% 0px' });
  // бігунки з'являються й пізніше (сцени будують свої панелі після завантаження) — тож шукаємо їх кілька разів
  const scan = () => document.querySelectorAll('.page input[type=range]').forEach((r) => { if (!r.dataset.hintWatch) { r.dataset.hintWatch = 1; io.observe(r); } });
  const scanAll = () => { scan(); scanB(); };
  scanAll(); setTimeout(scanAll, 1500); setTimeout(scanAll, 5000); let mt = 0; new MutationObserver(() => { if (!mt) mt = setTimeout(() => { mt = 0; scanAll(); }, 800); }).observe(document.body, { childList: true, subtree: true });   // не частіше ніж раз на 0,8 с
})();
