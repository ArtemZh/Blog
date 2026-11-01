/* Стаття 39, таймлапс: справжня карта на MapLibre, механіка як у Google (інерція, щипок, подвійний клік, кнопки). Той самий підхід, що в Train: рушій і підкладка CARTO.
   Вантажиться, лише коли блок близько до екрана. Якщо рушій чи підкладка не вантажаться, лишається полотно з oc-viz.js. */
window.OC_MAPGL = (function () {
  const LIB = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl', STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', WORLD = [[-175, -58], [178, 76]];
  let libP = null;
  const lib = () => libP || (libP = new Promise((ok, no) => { const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = LIB + '.css'; document.head.appendChild(c); const s = document.createElement('script'); s.src = LIB + '.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); }));
  const lines = (a, fl) => ({ type: 'FeatureCollection', features: a.map((h) => ({ type: 'Feature', properties: { y: h.y, n: h.n, km: h.km || 0 }, geometry: fl ? { type: 'LineString', coordinates: h.l } : { type: 'MultiLineString', coordinates: h.l } })) });
  async function mount(o) {
    await lib(); const gl = window.maplibregl;
    const map = new gl.Map({ container: o.el, style: STYLE, bounds: WORLD, fitBoundsOptions: { padding: 8 }, minZoom: -1, maxZoom: 12, attributionControl: { compact: true }, cooperativeGestures: true, dragRotate: false, pitchWithRotate: false, touchPitch: false,
      locale: { 'CooperativeGesturesHandler.WindowsHelpText': 'Щоб змінити масштаб, тримайте Ctrl і прокручуйте', 'CooperativeGesturesHandler.MacHelpText': 'Щоб змінити масштаб, тримайте ⌘ і прокручуйте', 'CooperativeGesturesHandler.MobileHelpText': 'Карту рухають двома пальцями' } });
    map.touchZoomRotate.disableRotation(); map.keyboard.disableRotation();
    map.addControl(new gl.NavigationControl({ showCompass: false }), 'top-right'); map.addControl(new gl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    await new Promise((ok, no) => { const t = setTimeout(() => no(new Error('style')), 12000); map.once('load', () => { clearTimeout(t); ok(); }); });
    const under = (map.getStyle().layers.find((l) => l.type === 'symbol') || {}).id;
    map.addSource('cab', { type: 'geojson', data: 'shared/oc-cables.geojson' }); map.addSource('hist', { type: 'geojson', data: lines(o.history) }); map.addSource('land', { type: 'geojson', data: lines(o.land, true) });
    const W = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 1, a, 5, b, 10, c], add = (id, source, color, width, extra) => map.addLayer({ id, type: 'line', source, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': width, ...extra } }, under);
    add('cab-live', 'cab', '#2fb7c4', W(.7, 1.5, 2.6), { 'line-opacity': .62 }); add('cab-new', 'cab', '#c9fbff', W(1.6, 2.4, 3.4)); add('cab-plan', 'cab', '#ffffff', W(.9, 1.5, 2.2), { 'line-dasharray': [2, 2], 'line-opacity': .78 });
    add('hist', 'hist', '#e8b25a', W(1.2, 2, 3), { 'line-opacity': .85 }); add('hist-new', 'hist', '#ffe2a8', W(2.2, 3, 4)); add('land', 'land', '#6fe07f', W(2, 2.6, 3.4)); add('land-new', 'land', '#d6ffdd', W(3, 3.6, 4.4)); add('cab-sel', 'cab', '#ffffff', W(2.4, 3, 4));
    map.setFilter('cab-sel', ['==', ['get', 'n'], ''] ); map.setLayoutProperty('cab-plan', 'visibility', 'none'); map.setFilter('cab-plan', ['==', ['get', 'p'], 1]);
    const yr = ['get', 'y'], pop = new gl.Popup({ closeButton: false, maxWidth: '280px', className: 'oc-gl__pop' }); let last = '';
    const hit = (pt, r) => { const ls = ['cab-live', 'cab-new', 'cab-sel']; if (map.getLayoutProperty('cab-plan', 'visibility') !== 'none') ls.push('cab-plan'); return map.queryRenderedFeatures([[pt.x - r, pt.y - r], [pt.x + r, pt.y + r]], { layers: ls })[0]; };
    map.on('click', (e) => { const f = hit(e.point, e.originalEvent.pointerType === 'touch' ? 16 : 8), p = f && f.properties; map.setFilter('cab-sel', ['==', ['get', 'n'], p ? p.n : '']); if (p) pop.setLngLat(e.lngLat).setText(`${p.n} · ${p.y || '?'}${p.p ? ' (план)' : ''}${p.km ? ' · ' + (+p.km).toLocaleString('uk').replace(/\s/g, ' ') + ' км' : ''}`).addTo(map); else pop.remove(); o.onPick(p ? pop.getElement().textContent : ''); });
    map.on('mousemove', (e) => { map.getCanvas().style.cursor = hit(e.point, 6) ? 'pointer' : ''; });
    // на вузькому повному екрані світ не влазить по висоті: стартуємо з Атлантики, далі рукою
    let isFs = false; const home = (ms) => { if (isFs && map.getContainer().clientWidth < 620) map.easeTo({ center: [-30, 32], zoom: .9, duration: ms }); else map.fitBounds(WORLD, { padding: 8, duration: ms }); };
    return { map,
      set(y, fut, playing) { const k = `${y}|${fut}|${playing}`; if (k === last) return; last = k;
        map.setFilter('cab-live', ['all', ['==', ['get', 'p'], 0], ['<=', yr, y]]); map.setFilter('cab-new', ['all', ['==', ['get', 'p'], 0], ['<=', yr, y], ['>', yr, playing ? y - 2 : 9999]]); map.setFilter('hist', ['<=', yr, y]); map.setFilter('hist-new', ['all', ['<=', yr, y], ['>', yr, y - 4]]); map.setFilter('land', ['<=', yr, y]); map.setFilter('land-new', ['all', ['<=', yr, y], ['>', yr, y - 4]]); map.setLayoutProperty('cab-plan', 'visibility', fut ? 'visible' : 'none'); },
      fs(v) { if (v) map.cooperativeGestures.disable(); else map.cooperativeGestures.enable(); isFs = v; requestAnimationFrame(() => { map.resize(); home(0); }); },
      world() { home(900); } };
  }
  return { mount };
})();
