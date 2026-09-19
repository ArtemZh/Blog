/* Розділи без полотна: продукт/сервіс/ресурс, шари ODA, матриця eTOM,
   вендори, глосарій. Кожен рендер ідемпотентний — його викликають знову
   при зміні мови. */
(function () {
  const t = (k) => window.I18N.t(k);
  const $ = (s, r) => (r || document).querySelector(s);
  const chips = (arr) => arr.map((a) => `<span class="chip">${a}</span>`).join('');

  /* 01 — продукт → сервіс → ресурс */
  const pyr = { sel: 'product' };
  function renderPyr() {
    const root = $('#pyr');
    root.innerHTML = '';
    ['product', 'service', 'resource'].forEach((id) => {
      const c = document.createElement('div');
      c.className = 'card' + (pyr.sel === id ? ' on' : '');
      c.tabIndex = 0;
      c.innerHTML = `<span class="kicker"></span><h3></h3><p></p><div class="ex"></div>`;
      c.querySelector('.kicker').textContent = t(`pyr.${id}.k`);
      c.querySelector('h3').textContent = t(`pyr.${id}.t`);
      c.querySelector('p').textContent = t(`pyr.${id}.b`);
      c.querySelector('.ex').textContent = t(`pyr.${id}.ex`);
      const pick = () => { pyr.sel = id; renderPyr(); };
      c.addEventListener('click', pick);
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
      root.appendChild(c);
    });
    const b1 = document.createElement('div'); b1.className = 'pyr__brace'; b1.textContent = 'BSS';
    const b2 = document.createElement('div'); b2.className = 'pyr__brace pyr__brace--wide'; b2.textContent = 'OSS';
    root.append(b1, b2);
    $('#pyrNote').innerHTML = t(`pyr.${pyr.sel}.note`);
  }

  /* 02 — шари ODA */
  const oda = { sel: 'etom' };
  function renderOda() {
    const stack = $('#odaStack');
    stack.innerHTML = '';
    window.ODA.forEach((id) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'oda__row' + (oda.sel === id ? ' on' : '');
      b.innerHTML = '<b></b><span></span><i></i>';
      b.querySelector('b').textContent = t(`oda.${id}.name`);
      b.querySelector('span').textContent = t(`oda.${id}.what`);
      b.querySelector('i').textContent = t(`oda.${id}.q`);
      b.addEventListener('click', () => { oda.sel = id; renderOda(); });
      b.addEventListener('mouseenter', () => { if (oda.sel !== id) { oda.sel = id; renderOda(); $('#odaStack').children[window.ODA.indexOf(id)].focus({ preventScroll: true }); } });
      stack.appendChild(b);
    });
    const d = $('#odaDetail');
    d.innerHTML = `<span class="kicker"></span><h3></h3><p></p><p></p>`;
    d.querySelector('.kicker').textContent = t(`oda.${oda.sel}.q`);
    d.querySelector('h3').textContent = t(`oda.${oda.sel}.full`);
    d.querySelectorAll('p')[0].innerHTML = t(`oda.${oda.sel}.b`);
    d.querySelectorAll('p')[1].innerHTML = t(`oda.${oda.sel}.ex`);
  }

  /* 03 — матриця eTOM */
  const etom = { sel: 'crm.f', hl: '' };
  function renderEtom() {
    const E = window.ETOM, grid = $('#etomGrid');
    grid.innerHTML = '<div class="etom__corner"></div>';
    E.cols.forEach((c) => {
      const h = document.createElement('div'); h.className = 'etom__h';
      h.innerHTML = `<span></span><small></small>`;
      h.firstChild.textContent = t(`etom.col.${c}`);
      h.lastChild.textContent = t(`etom.col.${c}.s`);
      grid.appendChild(h);
    });
    E.rows.forEach((r) => {
      const rh = document.createElement('div'); rh.className = 'etom__r';
      rh.innerHTML = `<span></span><small></small>`;
      rh.firstChild.textContent = t(`etom.row.${r.id}`);
      rh.lastChild.textContent = t(`etom.row.${r.id}.s`);
      grid.appendChild(rh);
      E.cols.forEach((c) => {
        const cell = r.cells[c], key = `${r.id}.${c}`;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'etom__c' + (etom.sel === key ? ' on' : '');
        b.dataset.sys = cell.sys;
        b.dataset.col = t(`etom.col.${c}`);
        b.innerHTML = `<span></span><span class="sys"></span>`;
        b.firstChild.textContent = t(`etom.${key}.short`);
        b.lastChild.textContent = cell.sys.toUpperCase().replace(' ', ' · ');
        b.addEventListener('click', () => { etom.sel = key; renderEtom(); });
        grid.appendChild(b);
      });
    });
    const root = $('#etom');
    root.classList.toggle('is-bss', etom.hl === 'bss');
    root.classList.toggle('is-oss', etom.hl === 'oss');
    document.querySelectorAll('#etomToggles button').forEach((b) => b.classList.toggle('on', b.dataset.hl === etom.hl));

    const [rid, cid] = etom.sel.split('.');
    const cell = E.rows.find((r) => r.id === rid).cells[cid];
    const side = $('#etomSide');
    side.innerHTML = `<span class="kicker"></span><h3></h3><ul></ul><p></p><div class="pop__apis">${chips(cell.api)}</div>`;
    side.querySelector('.kicker').textContent = `${t('etom.row.' + rid)} × ${t('etom.col.' + cid)}`;
    side.querySelector('h3').textContent = t(`etom.${etom.sel}.short`);
    side.querySelector('ul').innerHTML = t(`etom.${etom.sel}.l2`).split(' | ').map((s) => `<li>${s}</li>`).join('');
    side.querySelector('p').innerHTML = t(`etom.${etom.sel}.b`);
  }
  function mountEtomToggles() {
    document.querySelectorAll('#etomToggles button').forEach((b) => b.addEventListener('click', () => {
      etom.hl = etom.hl === b.dataset.hl ? '' : b.dataset.hl;
      renderEtom();
    }));
  }

  /* 05 — вендори */
  const vend = { sel: 'ericsson', diagram: null };
  function renderVendors() {
    const bar = $('#vendorBar');
    bar.innerHTML = '';
    window.VENDORS.forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = t(`vendor.${v.id}.name`);
      b.classList.toggle('on', vend.sel === v.id);
      b.addEventListener('click', () => { vend.sel = v.id; renderVendors(); });
      bar.appendChild(b);
    });
    const v = window.VENDORS.find((x) => x.id === vend.sel);
    if (vend.diagram) vend.diagram.cover({ full: v.full, part: v.part });
    const card = $('#vendorCard');
    card.innerHTML = `<span class="kicker"></span><h3></h3><p class="focus"></p><dl></dl><p class="note"></p>`;
    card.querySelector('.kicker').textContent = t('vendor.kicker');
    card.querySelector('h3').textContent = t(`vendor.${v.id}.name`);
    card.querySelector('.focus').textContent = t(`vendor.${v.id}.focus`);
    card.querySelector('dl').innerHTML = ['bss', 'oss', 'net', 'ai'].map((k) =>
      `<dt>${t('vendor.dt.' + k)}</dt><dd>${t(`vendor.${v.id}.${k}`)}</dd>`).join('');
    card.querySelector('.note').innerHTML = t(`vendor.${v.id}.note`);
  }

  /* 07 — глосарій */
  const gloss = { q: '' };
  function renderGloss() {
    const root = $('#gloss');
    const items = t('gloss.items').split(' || ').map((s) => s.split(' :: '));
    const q = gloss.q.trim().toLowerCase();
    root.innerHTML = '';
    items.filter(([k, v]) => !q || (k + ' ' + v).toLowerCase().includes(q)).forEach(([k, v]) => {
      const d = document.createElement('div');
      d.innerHTML = '<b></b><span></span>';
      d.firstChild.textContent = k; d.lastChild.textContent = v;
      root.appendChild(d);
    });
  }

  window.Sections = {
    mount() {
      mountEtomToggles();
      $('#glossSearch').addEventListener('input', (e) => { gloss.q = e.target.value; renderGloss(); });
    },
    setVendorDiagram(d) { vend.diagram = d; },
    render() { renderPyr(); renderOda(); renderEtom(); renderVendors(); renderGloss(); },
  };
})();
