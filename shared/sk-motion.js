/* Стаття 36: анімації появи. Блоки розділів (хлопавка, заголовок, абзаци, сцени) виїжджають знизу, коли доходять до екрана,
   по черзі з невеликою затримкою; хлопавка «клацає», заголовок акту розсувається, лінія над актом прокреслюється.
   Один раз на блок; prefers-reduced-motion — усе одразу видно. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sel = '.sec > .sk-slate, .sec > h2, .sec > h3, .sec > p:not(.sk-dir), .sec > .viz-slot, .sec > ul, .sk-act, .sec > .sk-minis, .sec > .sk-kit';
  // блоки, вищі за екран (липкий розділ «Виробництво»), не ховаємо: поріг частки для них недосяжний, а transform ламає sticky
  const els = [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().height < innerHeight * 0.9);
  els.forEach((e) => e.classList.add('mv'));
  const io = new IntersectionObserver((es) => {
    const vis = es.filter((x) => x.isIntersecting).map((x) => x.target);
    vis.forEach((e, i) => { e.style.transitionDelay = Math.min(i, 5) * 70 + 'ms'; e.classList.add('mv-in'); io.unobserve(e); });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
  els.forEach((e) => io.observe(e));
  document.documentElement.classList.add('mv-on');
})();
