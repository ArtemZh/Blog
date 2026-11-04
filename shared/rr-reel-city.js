/* Стаття 41, ролик, плани 12–14: один рух камери від дверей магазину до Європи.
   Кадр детермінований: render(t) ставить камеру й дані лише з t, тож запис у MP4 дасть те саме, що й перегляд.
   Підкладка — OpenFreeMap (OpenStreetMap), свій вечірній стиль; маршрути — shared/rr-tln.js. */
(function () {
  const T_END = 14, D = window.RR_TLN, S = D.s;
  const $ = (id) => document.getElementById(id);
  const cl = (v, a, b) => Math.max(a, Math.min(b, v)), sm = (v) => v * v * (3 - 2 * v), lerp = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => cl((t - a) / (b - a), 0, 1);

  /* ── маршрути: накопичена довжина, щоб робот їхав рівно ── */
  const R = Math.PI / 180, hav = (p, q) => { const dy = (q[1] - p[1]) * R, dx = (q[0] - p[0]) * R * Math.cos(p[1] * R); return 6371000 * Math.hypot(dx, dy); };
  const routes = D.r.map((r) => { const cum = [0]; for (let i = 1; i < r.c.length; i++) cum.push(cum[i - 1] + hav(r.c[i - 1], r.c[i])); return { c: r.c, cum, len: cum[cum.length - 1] }; });
  function cut(r, m) { // частина маршруту до m метрів і точка голови
    if (m <= 0) return { line: [r.c[0], r.c[0]], head: r.c[0] };
    if (m >= r.len) return { line: r.c, head: r.c[r.c.length - 1] };
    let i = 1; while (r.cum[i] < m) i++;
    const k = (m - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1]), p = r.c[i - 1], q = r.c[i], h = [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    return { line: r.c.slice(0, i).concat([h]), head: h };
  }
  // робот 0 виїжджає першим і повільно (план 12), решта — віялом з 4-ї секунди; прискорено
  const metres = (i, t) => i === 0 ? (t < 4 ? 260 * sm(seg(t, .4, 4)) : 260 + 520 * (t - 4)) : 520 * Math.max(0, t - 4 - i * .1);

  /* ── камера: ключі + зум «за масштабом», щоб віддалення не смикало центр ── */
  const head0 = (t) => cut(routes[0], metres(0, t)).head;
  function cam(t) {
    if (t <= 4) { const k = sm(seg(t, 0, 4)), h = head0(t); return { c: h, z: lerp(17.9, 16.9, k), p: lerp(62, 58, k), b: lerp(12, 42, k) }; }
    if (t <= 8) { const k = sm(seg(t, 4, 8)), a = head0(4);
      return { c: [lerp(a[0], S[0], k), lerp(a[1], S[1] - .004, k)], z: lerp(16.9, 13.7, k), p: lerp(58, 52, k), b: lerp(42, 78, k) }; }
    const k = sm(seg(t, 8, 13)), z = lerp(13.7, 3.55, k), u = (2 ** -z - 2 ** -13.7) / (2 ** -3.55 - 2 ** -13.7), E = [15.5, 51.7];
    return { c: [lerp(S[0], E[0], u), lerp(S[1] - .004, E[1], u)], z, p: lerp(52, 0, sm(seg(t, 8, 11.5))), b: lerp(78, 0, sm(seg(t, 8.5, 12.5))) };
  }

  /* ── Європа: та сама формула, що в розділі 07, при стандартних повзунках (3 год, 1500 €, 80 %) ── */
  const EU = ['040', '056', '100', '191', '196', '203', '208', '233', '246', '250', '276', '300', '348', '372', '380', '428', '440', '442', '470', '528', '616', '620', '642', '703', '705', '724', '752'];
  const K = 3 * 30.4 * .8, LEASE = 1500;
  const PICK = { '100': ['Болгарія', 12.0, [25.3, 42.7]], '642': ['Румунія', 13.6, [24.9, 45.9]], '348': ['Угорщина', 15.2, [19.3, 47.1]], '528': ['Нідерланди', 47.9, [5.4, 52.4]], '208': ['Данія', 51.7, [9.4, 56.1]], '442': ['Люксембург', 56.8, [5.2, 48.7]] };
  const fmt = (v) => Math.round(Math.abs(v)).toLocaleString('uk').replace(/\s/g, ' ');

  /* ── вечірній стиль на векторних тайлах OpenFreeMap (схема OpenMapTiles) ── */
  const STYLE = { version: 8, sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
    sky: { 'sky-color': '#1b2c44', 'horizon-color': '#d9875a', 'fog-color': '#2a2f3e', 'sky-horizon-blend': .55, 'horizon-fog-blend': .6, 'fog-ground-blend': .35, 'atmosphere-blend': 0 },
    light: { anchor: 'map', color: '#ffd7a8', intensity: .2, position: [1.5, 230, 35] },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#0f1820' } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'landcover', paint: { 'fill-color': '#13241d', 'fill-opacity': .9 } },
      { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse', filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'retail']]], paint: { 'fill-color': '#121d27' } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': '#0a2433' } },
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'path', 'track']]], layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#2b3d4d', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, .4, 18, 6] } },
      { id: 'road-glow', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]], layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffb25c', 'line-opacity': .22, 'line-blur': 6, 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 6, 1, 18, 34] } },
      { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]], layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#f0b46e', 'line-opacity': .85, 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 6, .3, 18, 9] } },
      { id: 'bld', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 13,
        paint: { 'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'render_height'], 0, '#17212c', 15, '#253a4e', 40, '#3d5c78'],
          'fill-extrusion-height': ['get', 'render_height'], 'fill-extrusion-base': ['get', 'render_min_height'], 'fill-extrusion-opacity': .92, 'fill-extrusion-vertical-gradient': true } }
    ] };

  const NAMES_EN = { '100': 'Bulgaria', '642': 'Romania', '348': 'Hungary', '528': 'Netherlands', '208': 'Denmark', '442': 'Luxembourg' };
  function mount(box, o = {}) { const EN = !!o.EN, L = (u, e) => (EN ? e : u), mapEl = box.querySelector('[data-map]'), lbls = box.querySelector('[data-lbls]');
  const map = new maplibregl.Map({ container: mapEl, style: STYLE, interactive: false, attributionControl: false, center: S, zoom: 17, pitch: 70, maxPitch: 80, fadeDuration: 0, canvasContextAttributes: { preserveDrawingBuffer: true } });
  const fc = (f) => ({ type: 'FeatureCollection', features: f });
  let ready = false, countries = null, LB = [];

  map.on('load', async () => {
    const under = 'bld';
    map.addSource('ctry', { type: 'geojson', data: fc([]) });
    map.addLayer({ id: 'ctry-fill', type: 'fill', source: 'ctry', paint: { 'fill-color': ['get', 'col'], 'fill-opacity': 0 } }, 'road-minor');
    map.addLayer({ id: 'ctry-line', type: 'line', source: 'ctry', paint: { 'line-color': '#8fa6b8', 'line-width': .6, 'line-opacity': 0 } }, 'road-minor');
    map.addSource('ring', { type: 'geojson', data: fc([circle(S, 2000)]) });
    map.addLayer({ id: 'ring', type: 'line', source: 'ring', paint: { 'line-color': '#2fe0d0', 'line-width': 2, 'line-dasharray': [2, 2], 'line-opacity': 0 } });
    map.addLayer({ id: 'ring-fill', type: 'fill', source: 'ring', paint: { 'fill-color': '#2fe0d0', 'fill-opacity': 0 } }, under);
    map.addSource('trail', { type: 'geojson', data: fc([]) });
    map.addLayer({ id: 'trail-glow', type: 'line', source: 'trail', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#2fe0d0', 'line-opacity': .35, 'line-blur': 4, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 4, 18, 16] } });
    map.addLayer({ id: 'trail', type: 'line', source: 'trail', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#b9fff6', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.2, 18, 4] } });
    map.addSource('pts', { type: 'geojson', data: fc([]) });
    map.addLayer({ id: 'pts-glow', type: 'circle', source: 'pts', paint: { 'circle-color': ['get', 'col'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 6, 18, 26], 'circle-blur': 1, 'circle-opacity': .7 } });
    map.addLayer({ id: 'pts', type: 'circle', source: 'pts', paint: { 'circle-color': '#ffffff', 'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 2.5, 18, 7], 'circle-stroke-color': ['get', 'col'], 'circle-stroke-width': 2 } });
    try { const topo = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json').then((r) => r.json());
      const all = topojson.feature(topo, topo.objects.countries).features.filter((f) => EU.includes(f.id) || ['804', '826', '756', '578', '688', '070', '499', '807', '008', '112', '498', '792'].includes(f.id));
      countries = all.map((f) => { const p = PICK[f.id], net = p ? K * p[1] - LEASE : null; f.properties = { col: p ? (net >= 0 ? '#2fa36b' : '#c8573f') : EU.includes(f.id) ? '#2a3a4a' : '#1a242e' }; return f; });
      map.getSource('ctry').setData(fc(countries));
      LB = Object.entries(PICK).map(([id, p]) => { const net = K * p[1] - LEASE, e = document.createElement('div'); e.className = 'rc__lbl ' + (net >= 0 ? 'pos' : 'neg');
        e.innerHTML = `${EN ? NAMES_EN[id] : p[0]}<em>${net >= 0 ? '+' : '−'}${fmt(net)} ${L('€/міс', '€/mo')}</em>`; lbls.appendChild(e); return { e, ll: p[2] }; });
      const e = document.createElement('div'); e.className = 'rc__lbl'; e.style.color = '#b9fff6'; e.textContent = L('Таллінн', 'Tallinn'); lbls.appendChild(e); e.style.transform = 'translate(10px,-50%)'; LB.push({ e, ll: [S[0] + .9, S[1]], tln: true });
    } catch (err) { console.warn('країни не завантажились', err); }
    ready = true; if (o.onReady) o.onReady();
  });

  function circle(c, m) { const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * 2 * Math.PI; pts.push([c[0] + m * Math.cos(a) / (111320 * Math.cos(c[1] * R)), c[1] + m * Math.sin(a) / 110540]); }
    return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [pts] } }; }

  function render(t) {
    if (!ready) return;
    const c = cam(t); map.jumpTo({ center: c.c, zoom: c.z, pitch: c.p, bearing: c.b });
    // маршрути: віддалені кадри показують усі сліди тонко, поруч — голова й світний хвіст
    const tr = [], pts = [];
    routes.forEach((r, i) => { const m = metres(i, t); if (m <= 0) return; const q = cut(r, m); tr.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: q.line } });
      if (m < r.len) pts.push({ type: 'Feature', properties: { col: '#2fe0d0' }, geometry: { type: 'Point', coordinates: q.head } }); });
    pts.push({ type: 'Feature', properties: { col: '#ffcf8a' }, geometry: { type: 'Point', coordinates: S } }); // магазин
    map.getSource('trail').setData(fc(tr)); map.getSource('pts').setData(fc(pts));
    const ring = sm(seg(t, 5, 6.5)) * (1 - sm(seg(t, 9.5, 10.5)));
    map.setPaintProperty('ring', 'line-opacity', ring); map.setPaintProperty('ring-fill', 'fill-opacity', ring * .06);
    const eu = sm(seg(t, 10, 12));
    map.setPaintProperty('ctry-fill', 'fill-opacity', eu * .85); map.setPaintProperty('ctry-line', 'line-opacity', eu * .7);
    map.setPaintProperty('trail-glow', 'line-opacity', .35 * (1 - sm(seg(t, 9.5, 11))));
    LB.forEach((l) => { const p = map.project(l.ll); l.e.style.left = p.x + 'px'; l.e.style.top = p.y + 'px'; l.e.style.opacity = l.tln ? sm(seg(t, 10.5, 11.5)) : sm(seg(t, 11.2 + (l.e.className.includes('pos') ? .5 : 0), 12.2 + (l.e.className.includes('pos') ? .5 : 0))); });
    window.__rc = { t: +t.toFixed(2), z: +c.z.toFixed(2), trails: tr.length, heads: pts.length - 1 };
  }
  return { render, map, ready: () => ready, resize: () => map.resize() }; }
  window.RR_CITY = { mount, T_END };

  /* ── тестова сторінка: свій плеєр, підписи й годинник ── */
  const rc = $('rc'); if (!rc) return;
  const cap = $('cap'), clk = $('clk'), sl = $('t'), out = $('to'), btn = $('play');
  const CAP = [[0, '18:00 · вечір', 'Робот-кур’єр виїжджає з магазину'], [4, 'коло 2 км навколо магазину', 'Вечір доставок: короткі часті маршрути'], [10, 'той самий робот у Європі', 'Окупається там, де година праці дорога']];
  const city = mount(rc, { onReady: () => show(+sl.value) });
  window.RC_RENDER = (t) => show(t); window.RC_MAP = city.map;
  let playing = false, t0 = 0, s0 = 0;
  function show(t) { sl.value = t; out.textContent = t.toFixed(1).replace('.', ',') + ' с'; city.render(t);
    const ci = CAP.reduce((a, x, i) => (t >= x[0] ? i : a), 0); cap.querySelector('small').textContent = CAP[ci][1]; cap.querySelector('b').textContent = CAP[ci][2];
    const mins = Math.round(lerp(0, 90, t / T_END)); clk.textContent = `${18 + Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`; }
  function tick(now) { if (!playing) return; const t = s0 + (now - t0) / 1000; if (t >= T_END) { playing = false; btn.textContent = '▶ Грати'; show(T_END); return; } show(t); requestAnimationFrame(tick); }
  btn.addEventListener('click', () => { playing = !playing; btn.textContent = playing ? '❚❚ Пауза' : '▶ Грати'; if (playing) { s0 = +sl.value >= T_END ? 0 : +sl.value; t0 = performance.now(); requestAnimationFrame(tick); } });
  sl.addEventListener('input', () => { playing = false; btn.textContent = '▶ Грати'; show(+sl.value); });
  new ResizeObserver(() => { city.resize(); show(+sl.value); }).observe(rc);
})();
