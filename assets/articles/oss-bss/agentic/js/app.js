/* Збирає статтю 2: мова, стек агента, сценарії, розділи. */
(function () {
  const I = window.I18N;
  const BANDS = ['gov', 'agents', 'tools', 'data'];

  I.apply();

  // Стек згорнутий за замовчуванням: спершу читаються шари, потім деталі.
  const main = Diagram.create(document.getElementById('stack'), window.STACK, { context: ['systems'] });
  const flows = Scenarios.mount(document.getElementById('flowBox'), main, window.AGENT_FLOWS, { bands: BANDS });

  // Міні-стек для вендорів: люди й системи — контекст, поза порівнянням.
  const mini = Diagram.create(document.getElementById('vendorMap'), window.STACK, {
    expandable: false, edges: false, context: ['people', 'systems'],
  });
  AgentSections.setVendorDiagram(mini);
  AgentSections.mount();
  AgentSections.render();

  document.querySelectorAll('.langs button').forEach((b) => {
    b.classList.toggle('on', b.dataset.lang === I.lang);
    b.addEventListener('click', () => I.set(b.dataset.lang));
  });
  I.onChange((lang) => {
    document.querySelectorAll('.langs button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
    main.render(); mini.render(); flows.refresh(); AgentSections.render();
  });

  // Стан з адреси — для знімків і посилань: ?open=1&flow=customer&step=5&vendor=amdocs
  const q = new URLSearchParams(location.search);
  if (q.get('open')) main.expand(BANDS);
  if (q.get('flow')) {
    const btn = document.querySelector(`#flowBox [data-flow="${q.get('flow')}"]`);
    if (btn) btn.click();
    for (let i = 1; i < Number(q.get('step') || 1); i++) document.querySelector('#flowBox [data-dir="1"]').click();
  }
  if (q.get('vendor')) AgentSections.selectVendor(q.get('vendor'));

  // Перевірка геометрії з консолі: AGENTIC.check() — усі 16 станів смуг.
  window.AGENTIC = {
    main, mini,
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
      return { bad, mini: mini.check(), roundtrip: main.snapshot() === base };
    },
  };
})();
