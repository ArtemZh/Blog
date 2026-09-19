/* Збирає статтю 3: мова, архітектура бота, сценарії, розділи. */
(function () {
  const I = window.I18N;
  const BANDS = ['orch', 'agents', 'tools'];

  I.apply();

  // Схема згорнута за замовчуванням: спершу шари, потім деталі.
  const box = document.getElementById('flowBox');
  // Перемикачі + крок + схема завжди влазять у висоту вікна — і під час сценарію, і в спокої.
  const maxH = () => {
    const fit = box.querySelector('#stack .fit');
    // мінус липка верхня панель (scroll-padding-top), до якої доїжджає прокрутка
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return innerHeight - pad - (box.offsetHeight - fit.offsetHeight) - 12;
  };
  const main = Diagram.create(document.getElementById('stack'), window.STACK, { context: ['systems'], maxH });
  const flows = Scenarios.mount(box, main, window.CHAT_FLOWS, {
    bands: BANDS,
    onChange(on) {
      box.classList.toggle('is-run', on);
      main.fit();
      if (on) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
  });
  // Текст кроку міняє висоту панелі — перераховуємо масштаб схеми.
  if (window.ResizeObserver) new ResizeObserver(() => main.fit()).observe(box.querySelector('.steps'));

  // Розділ 06: архітектура на AWS — той самий рушій, без сценаріїв і згортання смуг.
  const aws = Diagram.create(document.getElementById('awsStack'), window.AWS, { expandable: false, context: ['aws-ops'] });

  ChatSections.mount();
  ChatSections.render();

  document.querySelectorAll('.langs button').forEach((b) => {
    b.classList.toggle('on', b.dataset.lang === I.lang);
    b.addEventListener('click', () => I.set(b.dataset.lang));
  });
  I.onChange((lang) => {
    document.querySelectorAll('.langs button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
    main.render(); aws.render(); flows.refresh(); ChatSections.render();
  });

  // Стан з адреси — для знімків і посилань: ?open=1&flow=tariff&step=6
  const q = new URLSearchParams(location.search);
  if (q.get('open')) main.expand(BANDS);
  if (q.get('flow')) {
    const btn = document.querySelector(`#flowBox [data-flow="${q.get('flow')}"]`);
    if (btn) btn.click();
    for (let i = 1; i < Number(q.get('step') || 1); i++) document.querySelector('#flowBox [data-dir="1"]').click();
  }

  // Перевірка геометрії з консолі: CHAT.check() — усі 8 станів смуг.
  window.CHAT = {
    main, aws,
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
