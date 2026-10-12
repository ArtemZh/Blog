/* Збирає статтю «Планувальник і асистент: як тече інформація»: мова, три схеми
   на спільному рушії (потік планувальника, потік асистента, «що де лежить»),
   сценарії, розділи, перевірка геометрії й даних. */
(function () {
  const I = window.I18N;
  const t = (k) => I.t(k);
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
  function mount(boxId, rootId, data, flowData, popHtml, opts) {
    const box = document.getElementById(boxId);
    const root = document.getElementById(rootId);
    const maxH = () => {
      const fit = root.querySelector('.fit');
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      return innerHeight - pad - (box.offsetHeight - fit.offsetHeight) - 12;
    };
    const main = Diagram.create(root, data, Object.assign({ expanded: [], maxH, onPop: (id) => extra(root, popHtml(id)) }, opts));
    const flows = Scenarios.mount(box, main, flowData, {
      bands: [],
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
    const b = { box, root, main, flows, data, flowData };
    boxes.push(b);
    return b;
  }

  /* 01 — планувальник. У хмарці — модуль коду, що це рахує. */
  const planner = mount('flowBoxP', 'pmap', window.PLANNER, window.PLANNER_FLOWS, (id) => {
    const inf = window.PLANNER_INFO[id];
    return inf && inf.ref ? line('pop.code', inf.ref) : '';
  });
  /* 02 — асистент. У хмарці — хто це робить: людина, асистент, застосунок чи база. */
  const flow = mount('flowBox', 'fmap', window.FLOW, window.FLOW_FLOWS, (id) => {
    const inf = window.FLOW_INFO[id];
    return inf && inf.who ? line('pop.who', t('pop.who.' + inf.who)) : '';
  });
  /* 07 — що де лежить. Нижня смуга — тихий контекст: того, що в ній названо, в системі немає. */
  const store = mount('flowBoxS', 'smap', window.STORE, window.STORE_FLOWS, () => '', { context: ['none'] });

  FlowSections.render();
  I.onChange(() => { boxes.forEach((b) => { b.main.render(); b.flows.refresh(); }); FlowSections.render(); });

  // Стан з адреси — для знімків і посилань: ?flow=meeting&step=3, ?flow=offer&step=2
  const q = new URLSearchParams(location.search);
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
     точками вздовж кожного шляху (правило 11 скіла схем, «Verification», п. 4).
     Ті самі точки дають ще дві перевірки, яких у рушії немає:
       overlap — два дроти без спільної картки йдуть один по одному (а не перетинаються);
       tees    — бік картки, у який дроти і входять, і з якого виходять (довідка, не помилка). */
  function sample(d) {
    const rects = JSON.parse(d.main.snapshot()), ids = Object.keys(rects);
    const near = (p, r) => p.x >= r.x - 1 && p.x <= r.x + r.w + 1 && p.y >= r.y - 1 && p.y <= r.y + r.h + 1;
    const wires = [], through = [];
    d.root.querySelectorAll('svg.wires path.wire').forEach((p) => {
      const len = p.getTotalLength();
      if (!(len > 8)) { through.push(p.id + ':len'); return; }
      const a = p.getPointAtLength(0), b = p.getPointAtLength(len);
      const own = ids.filter((id) => near(a, rects[id]) || near(b, rects[id]));
      if (own.length !== 2) through.push(p.id + ':ends=' + own.length);
      const pts = [];
      for (let i = 4; i < len - 4; i += 3) pts.push(p.getPointAtLength(i));
      const hit = pts.map((pt) => ids.find((id) => { const r = rects[id];
        return !own.includes(id) && pt.x > r.x + 1 && pt.x < r.x + r.w - 1 && pt.y > r.y + 1 && pt.y < r.y + r.h - 1; })).find(Boolean);
      if (hit) through.push(p.id + '→' + hit);
      const side = (pt, id) => { const r = rects[id]; return Math.abs(pt.x - r.x) < 1.5 ? 'L' : Math.abs(pt.x - r.x - r.w) < 1.5 ? 'R' : pt.y < r.y + r.h / 2 ? 'T' : 'B'; };
      const from = ids.find((id) => near(a, rects[id])), to = ids.find((id) => near(b, rects[id]));
      wires.push({ id: p.id, own, pts, from, to, out: from && side(a, from), into: to && side(b, to) });
    });
    return { wires, through, rects };
  }
  function overlaps(wires, rects) {
    const out = [];
    const key = (p) => Math.round(p.x / 2) + ':' + Math.round(p.y / 2);
    for (let i = 0; i < wires.length; i++) {
      const grid = new Set(wires[i].pts.map(key));
      for (let j = i + 1; j < wires.length; j++) {
        // спільна картка — спільний підхід до неї: точки на її рівні й ближче 100 px до неї не рахуємо
        const shared = wires[i].own.filter((id) => wires[j].own.includes(id)).map((id) => rects[id]);
        const nearShared = (p) => shared.some((r) => p.y >= r.y - 1 && p.y <= r.y + r.h + 1 && p.x >= r.x - 100 && p.x <= r.x + r.w + 100);
        const n = wires[j].pts.filter((p) => grid.has(key(p)) && !nearShared(p)).length;
        if (n > 8) out.push(wires[i].id + '≈' + wires[j].id + ':' + n);
      }
    }
    return out;
  }
  function tees(wires) {
    const sides = {};
    wires.forEach((w) => {
      if (w.from) (sides[w.from + ':' + w.out] = sides[w.from + ':' + w.out] || { i: 0, o: 0 }).o++;
      if (w.to) (sides[w.to + ':' + w.into] = sides[w.to + ':' + w.into] || { i: 0, o: 0 }).i++;
    });
    return Object.keys(sides).filter((k) => sides[k].i && sides[k].o);
  }

  /* Дані: кожен вузол має текст, кожен дріт і крок сценарію — наявні вузли.
     Вузли без дротів дозволені лише ті, що названі в allowLoners (смуга «немає»). */
  function dataCheck(D, flowData, info, allowLoners) {
    const bad = [], loners = [];
    const nodes = D.bands.flatMap((b) => b.groups.flatMap((g) => g.nodes));
    const edges = new Set(D.edges.map((e) => e.id));
    if (new Set(nodes).size !== nodes.length) bad.push('duplicate node');
    if (edges.size !== D.edges.length) bad.push('duplicate edge');
    D.key.forEach((id) => { if (!nodes.includes(id)) bad.push(`key: no node ${id}`); });
    D.bands.forEach((b) => { if (t('band.' + b.id) === 'band.' + b.id) bad.push(`band ${b.id}: no label`);
      b.groups.forEach((g) => { if (g.label !== false && g.nodes.length && t('grp.' + g.id) === 'grp.' + g.id) bad.push(`group ${g.id}: no label`); }); });
    D.edges.forEach((e) => { [e.from, e.to].forEach((id) => { if (!nodes.includes(id)) bad.push(`edge ${e.id}: no node ${id}`); });
      if (t('api.' + e.api) === 'api.' + e.api) bad.push(`edge ${e.id}: no label`); });
    nodes.forEach((id) => {
      if (!D.edges.some((e) => e.from === id || e.to === id)) (allowLoners.includes(id) ? loners : bad).push(allowLoners.includes(id) ? id : `node ${id}: no wires`);
      ['t', 's', 'b'].forEach((k) => { if (t(`node.${id}.${k}`) === `node.${id}.${k}`) bad.push(`node ${id}: no copy .${k}`); });
    });
    Object.keys(info).forEach((id) => { if (!nodes.includes(id)) bad.push(`info: no node ${id}`); });
    const used = new Set();
    flowData.forEach((f) => {
      if (t(`flow.${f.id}.name`) === `flow.${f.id}.name`) bad.push(`flow ${f.id}: no name`);
      f.steps.forEach((s, i) => {
        if (!s.nodes.length) bad.push(`flow ${f.id}.${i + 1}: empty step`);
        s.nodes.forEach((id) => { used.add(id); if (!nodes.includes(id)) bad.push(`flow ${f.id}.${i + 1}: no node ${id}`); });
        (s.human || []).forEach((id) => { if (!s.nodes.includes(id)) bad.push(`flow ${f.id}.${i + 1}: human ${id} outside the step`); });
        s.edges.forEach((id) => { if (!edges.has(id)) bad.push(`flow ${f.id}.${i + 1}: no edge ${id}`);
          const e = D.edges.find((x) => x.id === id);
          if (e && !(s.nodes.includes(e.from) && s.nodes.includes(e.to))) bad.push(`flow ${f.id}.${i + 1}: edge ${id} leaves the step`); });
        if (t(`flow.${f.id}.${i + 1}`) === `flow.${f.id}.${i + 1}`) bad.push(`flow ${f.id}.${i + 1}: no copy`);
      });
      if (t(`flow.${f.id}.${f.steps.length + 1}`) !== `flow.${f.id}.${f.steps.length + 1}`) bad.push(`flow ${f.id}: copy for a step that does not exist`);
    });
    return { bad, loners, unvisited: nodes.filter((id) => !used.has(id) && !allowLoners.includes(id)) };
  }

  /* Схема з одним станом: геометрія, дані, знімок до й після перемальовування. */
  function checkOne(d, info, allowLoners) {
    const before = d.main.snapshot();
    const g = d.main.check(), s = sample(d);
    g.through = s.through; g.overlap = overlaps(s.wires, s.rects);
    const clean = !(g.overlaps.length || g.loose.length || g.gutter.length || g.through.length || g.overlap.length);
    const res = dataCheck(d.data, d.flowData, info, allowLoners);
    d.main.render();
    return { nodes: Object.keys(JSON.parse(before)).length, wires: s.wires.length, bad: clean ? {} : g, data: res.bad,
      loners: res.loners, unvisited: res.unvisited, tees: tees(s.wires), roundtrip: d.main.snapshot() === before };
  }

  /* З консолі: AF.check() — усі три схеми. Порожні bad і data, roundtrip: true —
     геометрія й дані в порядку. tees і unvisited — довідка: де дроти входять і виходять
     з одного боку картки та які вузли не зачепив жоден сценарій. Запускати на широкому
     екрані: на вузькому полотно сховане, і довжини дротів не рахуються. */
  const LONERS = ['n-cloud', 'n-ai', 'n-net', 'n-direct'];
  window.AF = {
    planner: planner.main, flow: flow.main, store: store.main,
    check() {
      return {
        planner: checkOne(planner, window.PLANNER_INFO, []),
        flow: checkOne(flow, window.FLOW_INFO, []),
        store: checkOne(store, window.STORE_INFO, LONERS),
        sections: FlowSections.check(),
      };
    },
  };
})();
