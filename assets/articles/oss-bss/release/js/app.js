/* Збирає статтю 5: мова, шлях релізу, сценарії, розділи. */
(function () {
  const I = window.I18N;
  const BANDS = ['build', 'test', 'ready', 'deploy'];

  I.apply();
  document.title = I.t('ui.title');

  // Схема згорнута за замовчуванням: спершу етапи, потім деталі.
  const main = Diagram.create(document.getElementById('path'), window.PATH, { context: ['plan', 'run'] });
  const flows = Scenarios.mount(document.getElementById('flowBox'), main, window.RELEASE_FLOWS, { bands: BANDS });

  ReleaseSections.mount();
  ReleaseSections.render();

  document.querySelectorAll('.langs button').forEach((b) => {
    b.classList.toggle('on', b.dataset.lang === I.lang);
    b.addEventListener('click', () => I.set(b.dataset.lang));
  });
  I.onChange((lang) => {
    document.querySelectorAll('.langs button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
    main.render(); flows.refresh(); ReleaseSections.render();
  });

  // Стан з адреси — для знімків і посилань: ?open=1&flow=hotfix&step=3
  const q = new URLSearchParams(location.search);
  if (q.get('open')) main.expand(BANDS);
  if (q.get('flow')) {
    const btn = document.querySelector(`#flowBox [data-flow="${q.get('flow')}"]`);
    if (btn) btn.click();
    for (let i = 1; i < Number(q.get('step') || 1); i++) document.querySelector('#flowBox [data-dir="1"]').click();
  }

  // Перевірка геометрії з консолі: RELEASE.check() — усі 16 станів смуг.
  window.RELEASE = {
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
