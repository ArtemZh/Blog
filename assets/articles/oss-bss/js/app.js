/* Збирає сторінку: мова, схеми, сценарії, розділи. */
(function () {
  const I = window.I18N;

  I.apply();

  // За замовчуванням смуги згорнуті: спершу читається загальна картина.
  const main = Diagram.create(document.getElementById('landscape'), window.LANDSCAPE);
  const flows = Scenarios.mount(document.getElementById('flowBox'), main, window.FLOWS);

  // Міні-схема вендорів: ті самі вузли, без дротів і без розкриття —
  // одна змінна «покриває / ні» (SCHEMA-PRINCIPLES §4).
  const mini = Diagram.create(document.getElementById('vendorMap'), window.LANDSCAPE, {
    expandable: false, edges: false, context: ['channels', 'net'],
  });
  Sections.setVendorDiagram(mini);
  Sections.mount();
  Sections.render();

  document.querySelectorAll('.langs button').forEach((b) => {
    b.classList.toggle('on', b.dataset.lang === I.lang);
    b.addEventListener('click', () => I.set(b.dataset.lang));
  });
  I.onChange((lang) => {
    document.querySelectorAll('.langs button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
    main.render(); mini.render(); flows.refresh(); Sections.render();
  });

  // Стан зі адреси — для знімків і посилань: ?open=1&flow=o2a&step=3&vendor=amdocs
  const q = new URLSearchParams(location.search);
  if (q.get('open')) main.expand(['bss', 'oss']);
  if (q.get('flow')) {
    const btn = document.querySelector(`#flowBox [data-flow="${q.get('flow')}"]`);
    if (btn) btn.click();
    for (let i = 1; i < Number(q.get('step') || 1); i++) document.querySelector('#flowBox [data-dir="1"]').click();
  }
  if (q.get('vendor')) {
    const vb = [...document.querySelectorAll('#vendorBar button')].find((b) => b.textContent.toLowerCase() === q.get('vendor'));
    if (vb) vb.click();
  }

  // Для перевірок із консолі: OSSBSS.check()
  window.OSSBSS = {
    main, mini,
    /* Перевіряємо всі чотири стани смуг і повернення до вихідного. */
    check() {
      const bands = ['bss', 'oss'], was = bands.filter((b) => main.isOpen(b));
      const base = main.snapshot(), states = {};
      [[], ['bss'], ['oss'], ['bss', 'oss']].forEach((on) => {
        main.collapse(bands); main.expand(on);
        states[on.join('+') || 'collapsed'] = main.check();
      });
      main.collapse(bands); main.expand(was);
      return { states, mini: mini.check(), roundtrip: main.snapshot() === base };
    },
  };
})();
