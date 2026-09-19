/* Покрокові сценарії поверх схеми. Кнопка — програвач: запускає потік і сама
   гортає кроки (механіка з проєкту DWH: одна кнопка «play/stop», кроки йдуть
   по таймеру). Стрілками й доріжкою кроків можна перехопити керування вручну.
   Пройдене лишається чорнилом — читається послідовність, а не спалах. */
(function () {
  const t = (k) => window.I18N.t(k);
  /* Бейдж рівня автономії (L1–L4). Лише якщо сценарій має поле level —
     інші статті, що ділять цей файл, його не отримують. */
  function badge(f) {
    const s = document.createElement('span');
    // сценарій-напрям (future) — позначка «майбутнє», щоб не плутати з тим, що працює зараз
    s.className = 'lvl' + (f.future ? ' lvl--future' : '');
    s.textContent = f.future ? f.level + ' · ' + t('ui.future') : f.level;
    s.title = t('flow.lvl.' + f.level);
    return s;
  }
  const STEP_MS = 2600;   // час на крок: стільки треба, щоб прочитати підпис
  const ICONS =
    '<svg class="ico ico--play" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.6 2.3 L9.7 6 L3.6 9.7 Z"/></svg>' +
    '<svg class="ico ico--stop" viewBox="0 0 12 12" aria-hidden="true"><rect x="3" y="3" width="6" height="6" rx="1"/></svg>';
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  function mount(el, diagram, flows, opts) {
    // смуги, які сценарій розкриває і якими керують кнопки «усе»
    const bands = (opts && opts.bands) || ['bss', 'oss'];
    const bar = el.querySelector('.flows');
    const box = el.querySelector('.steps');
    let flow = null, idx = 0, timer = null, playing = false;

    /* Керування кроками в одному рядку перед номерами: ▶/❚❚, ←, →, далі клітинки кроків. */
    const tr0 = box.querySelector('.steps__track');
    const nav = box.querySelector('.steps__nav');
    const playBtn = document.createElement('button');
    playBtn.type = 'button'; playBtn.className = 'steps__play';
    const cells = document.createElement('span'); cells.className = 'steps__cells';
    if (tr0) {
      const ctrl = document.createElement('span'); ctrl.className = 'steps__ctrl';
      ctrl.appendChild(playBtn); if (nav) ctrl.appendChild(nav);
      tr0.appendChild(ctrl); tr0.appendChild(cells);
      box.classList.add('has-ctrl');
    }
    const PAUSE_ICO = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.8" y="2.5" width="2.2" height="7" rx=".6"/><rect x="7" y="2.5" width="2.2" height="7" rx=".6"/></svg>';
    const PLAY_ICO = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.6 2.3 L9.7 6 L3.6 9.7 Z"/></svg>';
    function updPlay() {
      playBtn.innerHTML = playing ? PAUSE_ICO : PLAY_ICO;
      playBtn.setAttribute('aria-label', playing ? t('ui.stop') : t('ui.play'));
      playBtn.disabled = !flow;
    }
    playBtn.addEventListener('click', () => {
      if (!flow) return;
      if (playing) { pause(); return; }
      if (idx >= flow.steps.length - 1) idx = 0;
      playing = true; show(); tick(); updPlay();
    });

    function buttons() {
      bar.innerHTML = '';
      const sp = document.createElement('span'); sp.className = 'toggles__sp';
      flows.forEach((f) => {
        const b = document.createElement('button');
        b.type = 'button'; b.dataset.flow = f.id;
        b.className = 'play';
        // підпис у власному span, поруч з іконками play/stop — як у DWH
        b.innerHTML = ICONS + '<span></span>';
        b.querySelector('span').textContent = t('flow.' + f.id + '.name');
        b.classList.toggle('on', !!flow && flow.id === f.id);
        b.setAttribute('aria-label', (flow && flow.id === f.id ? t('ui.stop') : t('ui.play')) +
          ' · ' + t('flow.' + f.id + '.name'));
        b.addEventListener('click', () => (flow && flow.id === f.id ? stop() : start(f)));
        if (f.level) b.appendChild(badge(f));
        bar.appendChild(b);
      });
      bar.appendChild(sp);
      [['expand', '＋'], ['collapse', '－']].forEach(([act]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'ghost';
        b.textContent = t('ui.' + act + '-all');
        b.addEventListener('click', () => {
          if (act === 'collapse' && flow) stop();
          diagram[act](bands);
        });
        bar.appendChild(b);
      });
    }

    /* Програвання: крок сам змінюється на наступний, поки не дійде кінця.
       За prefers-reduced-motion автоходу немає — сценарій гортається вручну. */
    function tick() {
      clearTimeout(timer); timer = null;
      if (!playing || !flow) return;
      if (idx >= flow.steps.length - 1) { playing = false; buttons(); updPlay(); return; }
      timer = setTimeout(() => { idx += 1; show(); tick(); }, STEP_MS);
    }
    /* Будь-яке ручне гортання зупиняє автохід — керування переходить людині. */
    function pause() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = null; buttons(); updPlay();
    }

    function start(f) {
      clearTimeout(timer); timer = null;
      flow = f; idx = 0; playing = !reduced();
      // сценарій потребує деталей — розкриваємо обидві смуги
      diagram.expand(bands);
      buttons(); show(); tick();
      if (opts && opts.onChange) opts.onChange(true);
    }
    function stop() {
      clearTimeout(timer); timer = null; playing = false;
      flow = null; diagram.highlight(null); buttons(); show();
      if (opts && opts.onChange) opts.onChange(false);
    }

    /* Доріжка кроків: по клітинці на крок. Видно, скільки кроків усього,
       який зараз і що вже пройдено; крок зі згодою клієнта чи рішенням
       людини помічений крапкою — позначення з даних не губиться. */
    function track() {
      const tr = cells;
      tr.innerHTML = '';
      box.classList.toggle('is-idle', !flow);
      updPlay();
      if (!flow) return;
      flow.steps.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'steps__cell' + (i < idx ? ' is-done' : i === idx ? ' is-now' : '');
        if (s.client) b.classList.add('has-client');
        else if (s.human) b.classList.add('has-human');
        b.textContent = String(i + 1);
        b.setAttribute('aria-label', `${t('ui.step')} ${i + 1} / ${flow.steps.length}`);
        b.setAttribute('aria-current', i === idx ? 'step' : 'false');
        b.addEventListener('click', () => { pause(); idx = i; show(); });
        tr.appendChild(b);
      });
    }

    function show() {
      const n = box.querySelector('.steps__n'), tx = box.querySelector('.steps__t');
      const prev = box.querySelector('[data-dir="-1"]'), next = box.querySelector('[data-dir="1"]');
      if (!flow) {
        n.textContent = '—';
        tx.innerHTML = t('flow.idle');
        prev.disabled = next.disabled = true;
        track();
        return;
      }
      const step = flow.steps[idx];
      const past = flow.steps.slice(0, idx);
      const future = flow.steps.slice(idx + 1);
      diagram.highlight({
        nodes: step.nodes, edges: step.edges, human: step.human || [], client: step.client || [], future: !!flow.future,
        pastNodes: past.flatMap((s) => s.nodes), pastEdges: past.flatMap((s) => s.edges),
        // решта шляху лишається видимою блідою лінією — видно, куди все йде далі
        futureNodes: future.flatMap((s) => s.nodes), futureEdges: future.flatMap((s) => s.edges),
      });
      track();
      n.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(flow.steps.length).padStart(2, '0')}`;
      if (flow.level) n.appendChild(badge(flow));
      tx.innerHTML = t(`flow.${flow.id}.${idx + 1}`);
      prev.disabled = idx === 0;
      next.disabled = idx === flow.steps.length - 1;
    }

    box.querySelectorAll('[data-dir]').forEach((b) => b.addEventListener('click', () => {
      if (!flow) return;
      pause();
      idx = Math.max(0, Math.min(flow.steps.length - 1, idx + Number(b.dataset.dir)));
      show();
    }));
    /* Клік поза самою схемою (зокрема в полях ліворуч і праворуч від неї), кнопками сценаріїв і панеллю кроків вимикає сценарій
       (як у ДВХ). Підказка картки й елементи керування — «свої» зони. */
    document.addEventListener('click', (e) => {
      if (!flow) return;
      /* шлях події фіксується в момент кліку: кнопки сценаріїв перемальовуються
         в обробнику, і target уже відірваний від DOM — closest() його б не знайшов */
      const path = e.composedPath ? e.composedPath() : [e.target];
      const inside = path.some((n) => n && n.matches && n.matches('.flows, .steps, .stage, .pop'));
      if (!inside) stop();
    });
    el.addEventListener('keydown', (e) => {
      if (!flow) return;
      if (e.key === 'ArrowRight') box.querySelector('[data-dir="1"]').click();
      if (e.key === 'ArrowLeft') box.querySelector('[data-dir="-1"]').click();
    });

    buttons(); show();
    return {
      refresh() { buttons(); show(); },
    };
  }

  window.Scenarios = { mount };
})();
