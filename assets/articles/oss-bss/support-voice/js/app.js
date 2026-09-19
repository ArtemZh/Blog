/* Збирає статтю 4: мова, схема дзвінка з двома шляхами, сценарії, розділи. */
(function () {
  const I = window.I18N;
  const BANDS = ['tel', 'voice', 'orch', 'agents', 'tools'];
  const q = new URLSearchParams(location.search);

  I.apply();

  // Згорнута за замовчуванням; стартовий шлях — «голос у голос».
  const main = Diagram.create(document.getElementById('stack'), window.STACK, {
    context: ['systems'], path: q.get('path') === 'pipe' ? 'pipe' : 'rt',
  });
  const flows = Scenarios.mount(document.getElementById('flowBox'), main, window.VOICE_FLOWS, { bands: BANDS });

  /* Перемикач шляху над схемою. Сценарій після перемикання лишається на тому
     ж кроці — видно, як той самий крок проходить іншою архітектурою. */
  function setPath(p, scroll) {
    main.setPath(p);
    flows.refresh();
    renderPathBar();
    VoiceSections.renderArchs(p);
    if (scroll) document.getElementById('flows-sec').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderPathBar() {
    const bar = document.getElementById('pathBar');
    bar.innerHTML = `<span class="path__k"></span>`;
    bar.firstChild.textContent = I.t('path.label');
    ['rt', 'pipe'].forEach((p) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = I.t(`path.${p}`);
      b.classList.toggle('on', main.path === p);
      b.addEventListener('click', () => setPath(p));
      bar.appendChild(b);
    });
  }

  VoiceSections.mount({ onArch: setPath });
  VoiceSections.render(main.path);
  renderPathBar();

  document.querySelectorAll('.langs button').forEach((b) => {
    b.classList.toggle('on', b.dataset.lang === I.lang);
    b.addEventListener('click', () => I.set(b.dataset.lang));
  });
  I.onChange((lang) => {
    document.querySelectorAll('.langs button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
    main.render(); flows.refresh(); VoiceSections.render(main.path); renderPathBar();
  });

  // Стан з адреси: ?open=1&path=pipe&flow=internet&step=6
  if (q.get('open')) main.expand(BANDS);
  if (q.get('flow')) {
    const btn = document.querySelector(`#flowBox [data-flow="${q.get('flow')}"]`);
    if (btn) btn.click();
    for (let i = 1; i < Number(q.get('step') || 1); i++) document.querySelector('#flowBox [data-dir="1"]').click();
  }

  // Перевірка геометрії: VOICE.check() — 32 стани смуг × 2 шляхи.
  window.VOICE = {
    main,
    check() {
      const was = BANDS.filter((b) => main.isOpen(b)), wasPath = main.path;
      const base = main.snapshot(), bad = {};
      ['rt', 'pipe'].forEach((p) => {
        main.setPath(p);
        for (let mask = 0; mask < 1 << BANDS.length; mask++) {
          const on = BANDS.filter((_, i) => mask & (1 << i));
          main.collapse(BANDS); main.expand(on);
          const r = main.check();
          if (r.overlaps.length || r.loose.length || r.gutter.length) bad[p + ':' + (on.join('+') || 'collapsed')] = r;
        }
      });
      main.collapse(BANDS); main.expand(was); main.setPath(wasPath);
      return { bad, roundtrip: main.snapshot() === base };
    },
  };
})();
