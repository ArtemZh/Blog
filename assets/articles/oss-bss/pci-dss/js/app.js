/* Збирає статтю «PCI DSS очима PM»: мова, шлях сертифікації, сценарії, розділи. */
(function () {
  const I = window.I18N;
  const BANDS = ['gap', 'fix', 'proof', 'ready', 'audit'];

  I.apply();
  document.title = I.t('ui.title');

  // Перемикачі + крок + схема завжди влазять у висоту вікна — і під час сценарію, і в спокої.
  const box = document.getElementById('flowBox');
  const maxH = () => {
    const fit = box.querySelector('#path .fit');
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return innerHeight - pad - (box.offsetHeight - fit.offsetHeight) - 12;
  };

  // Схема згорнута за замовчуванням: спершу етапи, потім деталі.
  const main = Diagram.create(document.getElementById('path'), window.PATH, { context: ['scope', 'run'], maxH });
  const flows = Scenarios.mount(box, main, window.PCI_FLOWS, {
    bands: BANDS,
    onChange(on) {
      box.classList.toggle('is-run', on);
      main.fit();
      if (on) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
  });
  // Текст кроку міняє висоту панелі — перераховуємо масштаб схеми.
  if (window.ResizeObserver) new ResizeObserver(() => main.fit()).observe(box.querySelector('.steps'));

  PciSections.mount();
  PciSections.render();

  I.onChange(() => { main.render(); flows.refresh(); PciSections.render(); });

  // Стан з адреси — для знімків і посилань: ?open=1&flow=annual&step=3
  const q = new URLSearchParams(location.search);
  if (q.get('open')) main.expand(BANDS);
  if (q.get('flow')) {
    const btn = document.querySelector(`#flowBox [data-flow="${q.get('flow')}"]`);
    if (btn) btn.click();
    for (let i = 1; i < Number(q.get('step') || 1); i++) document.querySelector('#flowBox [data-dir="1"]').click();
  }

  // Перевірка геометрії з консолі: PCI.check() — усі 32 стани смуг.
  window.PCI = {
    main,
    check() {
      const was = BANDS.filter((b) => main.isOpen(b));
      const base = main.snapshot(), bad = {};
      for (let mask = 0; mask < 1 << BANDS.length; mask++) {
        const on = BANDS.filter((_, i) => mask & (1 << i));
        main.collapse(BANDS); main.expand(on);
        const r = main.check();
        if (r.overlaps.length || r.loose.length || r.gutter.length) bad[on.join('+') || 'collapsed'] = r;
      }
      main.collapse(BANDS); main.expand(was);
      return { bad, roundtrip: main.snapshot() === base };
    },
  };
})();
