/* Збирає статтю «Один колір — одне значення, одна дія — одне місце»: мова,
   дві схеми на спільному рушії (ролі кольору; панель «Плану»), сценарії,
   розділи, перевірка геометрії. */
(function () {
  const I = window.I18N;
  const t = (k) => I.t(k);
  const BANDS = ['state', 'mag', 'none'];   // «Дія» несе підписи колонок, «Категорія» — один рядок: вони не згортаються
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  I.apply();
  document.title = t('ui.title');

  /* Додаток до хмарки. Рушій показує назву й текст; решту дописуємо тут. */
  function extra(root, html) {
    const pop = root.querySelector('.pop');
    if (!pop || !html) return;
    const x = document.createElement('span');
    x.className = 'pop__x'; x.innerHTML = html;
    pop.appendChild(x);
  }
  const line = (label, text) => `<span class="pop__ref"><em>${esc(t(label))}</em> ${esc(text)}</span>`;

  /* Схема зі сценаріями. Перемикачі + крок + полотно завжди влазять у висоту
     вікна — і під час сценарію, і в спокої. */
  const boxes = [];
  function mount(boxId, rootId, data, flowData, bands, popHtml) {
    const box = document.getElementById(boxId);
    const root = document.getElementById(rootId);
    const maxH = () => {
      const fit = root.querySelector('.fit');
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      return innerHeight - pad - (box.offsetHeight - fit.offsetHeight) - 12;
    };
    const main = Diagram.create(root, data, { expanded: bands, maxH, onPop: (id) => extra(root, popHtml(id)) });
    const flows = Scenarios.mount(box, main, flowData, {
      bands,
      onChange(on) {
        box.classList.toggle('is-run', on);
        main.fit();
        if (!on) return;
        // на сторінці грає один сценарій: запуск тут зупиняє сценарій сусідньої схеми
        boxes.forEach((b) => { const run = b.box !== box && b.box.querySelector('.flows button.on'); if (run) run.click(); });
        box.scrollIntoView({ block: 'start', behavior: 'smooth' });
      },
    });
    // Текст кроку міняє висоту панелі — перераховуємо масштаб схеми.
    if (window.ResizeObserver) new ResizeObserver(() => main.fit()).observe(box.querySelector('.steps'));
    const b = { box, root, main, flows };
    boxes.push(b);
    return b;
  }

  /* 05 — ролі кольору. У хмарці: зразки кольору, місце в коді; номер конфлікту —
     у плашках рушія. Вузли на полотні лишаються сірими, колір ролі видно лише
     маленьким квадратиком за кліком. Схема розкрита одразу: у ній 36 вузлів,
     і зміст — саме у зв'язках між смугами. */
  const sw = (hex) => `<i class="sw" style="background:${hex}"></i>`;
  const color = mount('flowBox', 'map', window.MAP, window.COLOR_FLOWS, BANDS, (id) => {
    const inf = window.MAP_INFO[id];
    if (!inf) return '';
    let html = '';
    if (inf.people) {
      html += `<span class="pop__sw"><em>${esc(t('pop.both'))}</em>${Object.values(window.COLORS.people).map(sw).join('')}</span>`;
    } else if (inf.sw) {
      ['sky', 'calm'].forEach((skin) => {
        html += `<span class="pop__sw"><em>${esc(t('pop.' + skin))}</em>` +
          inf.sw.map((k) => sw(window.COLORS[skin][k]) + (inf.sw.length === 1 ? `<code>${window.COLORS[skin][k]}</code>` : '')).join('') + '</span>';
      });
    }
    if (inf.ref) html += line('pop.code', inf.ref);
    return html;
  });
  const main = color.main;

  /* 08 — панель «Плану». У хмарці: розмір за стилями й місце в коді.
     Смуги не згортаються, стан у схеми один. */
  const bar = mount('flowBox2', 'bar', window.BAR, window.BAR_FLOWS, [], (id) => {
    const inf = window.BAR_INFO[id];
    if (!inf) return '';
    return (inf.size ? line('pop.size', inf.size) : '') + (inf.ref ? line('pop.code', inf.ref) : '');
  });

  ColorSections.render();
  I.onChange(() => { boxes.forEach((b) => { b.main.render(); b.flows.refresh(); }); ColorSections.render(); });

  // Стан з адреси — для знімків і посилань: ?closed=1, ?flow=conf&step=3, ?flow=view&step=2
  const q = new URLSearchParams(location.search);
  if (q.get('closed')) main.collapse(BANDS);
  if (q.get('flow')) {
    const b = document.querySelector(`.wide [data-flow="${q.get('flow')}"]`);
    if (b) {
      const next = b.closest('.wide').querySelector('[data-dir="1"]');
      b.click();
      for (let i = 1; i < Number(q.get('step') || 1); i++) next.click();
    }
  }

  /* ── перевірки ─────────────────────────────────────────────
     Рушій перевіряє накладання карток, кінці дротів і проміжні відрізки.
     Перший і останній відрізок дроту він не дивиться, тому додаємо пробу
     точками вздовж кожного шляху (SKILL.md, «Verification», п. 4). */
  function through(d) {
    const rects = JSON.parse(d.main.snapshot()), ids = Object.keys(rects), out = [];
    const near = (p, r) => p.x >= r.x - 1 && p.x <= r.x + r.w + 1 && p.y >= r.y - 1 && p.y <= r.y + r.h + 1;
    d.root.querySelectorAll('svg.wires path.wire').forEach((p) => {
      const len = p.getTotalLength();
      if (!(len > 8)) { out.push(p.id + ':len'); return; }
      const a = p.getPointAtLength(0), b = p.getPointAtLength(len);
      const own = ids.filter((id) => near(a, rects[id]) || near(b, rects[id]));
      if (own.length !== 2) out.push(p.id + ':ends=' + own.length);
      for (let i = 4; i < len - 4; i += 3) {
        const pt = p.getPointAtLength(i);
        const hit = ids.find((id) => { const r = rects[id];
          return !own.includes(id) && pt.x > r.x + 1 && pt.x < r.x + r.w - 1 && pt.y > r.y + 1 && pt.y < r.y + r.h - 1; });
        if (hit) { out.push(p.id + '→' + hit); break; }
      }
    });
    return out;
  }
  /* Дані: кожен вузол має текст, кожен дріт і крок сценарію — наявні вузли.
     wired: true — кожен вузол мусить мати дріт (схема ролей). На схемі панелі
     дріт — лише справжній зв'язок, тож вузли без дротів там дозволені; їх
     перелічено в loners, щоб було видно, а не приховано. */
  function dataCheck(D, flowData, info, wired) {
    const bad = [], loners = [];
    const nodes = D.bands.flatMap((b) => b.groups.flatMap((g) => g.nodes));
    const edges = new Set(D.edges.map((e) => e.id));
    if (new Set(nodes).size !== nodes.length) bad.push('duplicate node');
    if (edges.size !== D.edges.length) bad.push('duplicate edge');
    D.bands.forEach((b) => { if (t('band.' + b.id) === 'band.' + b.id) bad.push(`band ${b.id}: no label`);
      b.groups.forEach((g) => { if (g.label !== false && g.nodes.length && t('grp.' + g.id) === 'grp.' + g.id) bad.push(`group ${g.id}: no label`); }); });
    D.edges.forEach((e) => { [e.from, e.to].forEach((id) => { if (!nodes.includes(id)) bad.push(`edge ${e.id}: no node ${id}`); });
      if (t('api.' + e.api) === 'api.' + e.api) bad.push(`edge ${e.id}: no label`); });
    nodes.forEach((id) => {
      if (!D.edges.some((e) => e.from === id || e.to === id)) (wired ? bad : loners).push(wired ? `node ${id}: no wires` : id);
      ['t', 's', 'b'].forEach((k) => { if (t(`node.${id}.${k}`) === `node.${id}.${k}`) bad.push(`node ${id}: no copy .${k}`); });
    });
    Object.keys(info).forEach((id) => { if (!nodes.includes(id)) bad.push(`info: no node ${id}`); });
    flowData.forEach((f) => {
      if (t(`flow.${f.id}.name`) === `flow.${f.id}.name`) bad.push(`flow ${f.id}: no name`);
      f.steps.forEach((s, i) => {
        if (!s.nodes.length) bad.push(`flow ${f.id}.${i + 1}: empty step`);
        s.nodes.forEach((id) => { if (!nodes.includes(id)) bad.push(`flow ${f.id}.${i + 1}: no node ${id}`); });
        s.edges.forEach((id) => { if (!edges.has(id)) bad.push(`flow ${f.id}.${i + 1}: no edge ${id}`);
          const e = D.edges.find((x) => x.id === id);
          if (e && !(s.nodes.includes(e.from) && s.nodes.includes(e.to))) bad.push(`flow ${f.id}.${i + 1}: edge ${id} leaves the step`); });
        if (t(`flow.${f.id}.${i + 1}`) === `flow.${f.id}.${i + 1}`) bad.push(`flow ${f.id}.${i + 1}: no copy`);
      });
    });
    return wired ? bad : { bad, loners };
  }
  const geometry = (d) => { const r = d.main.check(); r.through = through(d); return r; };
  const clean = (r) => !(r.overlaps.length || r.loose.length || r.gutter.length || r.through.length);

  /* З консолі: COLOR.check() — схема ролей у всіх 8 станах смуг і схема панелі
     в її єдиному стані. Порожні bad і data, roundtrip: true — геометрія й дані
     в порядку. Запускати на широкому екрані: на вузькому полотно сховане,
     і довжини дротів не рахуються. COLOR.checkBar() — лише схема панелі. */
  window.COLOR = {
    main, bar: bar.main,
    checkBar() {
      const before = bar.main.snapshot();
      const r = geometry(bar);
      const d = dataCheck(window.BAR, window.BAR_FLOWS, window.BAR_INFO, false);
      bar.main.render();
      return { states: 1, bad: clean(r) ? {} : { open: r }, data: d.bad, loners: d.loners, roundtrip: bar.main.snapshot() === before };
    },
    check() {
      const was = BANDS.filter((b) => main.isOpen(b));
      main.collapse(BANDS); main.expand(was);
      const base = main.snapshot(), bad = {};
      let states = 0;
      for (let mask = 0; mask < 1 << BANDS.length; mask++) {
        const on = BANDS.filter((_, i) => mask & (1 << i));
        main.collapse(BANDS); main.expand(on);
        const r = geometry(color); states++;
        if (!clean(r)) bad[on.join('+') || 'collapsed'] = r;
      }
      main.collapse(BANDS); main.expand(was);
      return { states, bad, data: dataCheck(window.MAP, window.COLOR_FLOWS, window.MAP_INFO, true), roundtrip: main.snapshot() === base, bar: this.checkBar() };
    },
  };
})();
