/* Розділи статті 2 без полотна: складові агента, рівні L0–L5, протоколи,
   вендори й кейси, матриця повноважень, глосарій. Рендери ідемпотентні —
   їх викликають знову при зміні мови. */
(function () {
  const t = (k) => window.I18N.t(k);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 01 — модель + інструменти + контекст + межі. Вимкнення складової
     показує, у що перетворюється «агент» без неї. */
  const parts = { off: null };
  function renderParts() {
    const eq = $('#parts');
    eq.innerHTML = '';
    window.PARTS.forEach((id, i) => {
      if (i) { const plus = document.createElement('span'); plus.className = 'eq__op'; plus.textContent = '+'; eq.appendChild(plus); }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'eq__part' + (parts.off === id ? ' is-off' : '');
      b.setAttribute('aria-pressed', parts.off === id ? 'true' : 'false');
      b.innerHTML = '<b></b><span></span>';
      b.querySelector('b').textContent = t(`part.${id}.t`);
      b.querySelector('span').textContent = t(`part.${id}.s`);
      b.addEventListener('click', () => { parts.off = parts.off === id ? null : id; renderParts(); });
      eq.appendChild(b);
    });
    const res = document.createElement('span'); res.className = 'eq__op'; res.textContent = '=';
    const out = document.createElement('div'); out.className = 'eq__res' + (parts.off ? ' is-broken' : '');
    out.textContent = parts.off ? t(`part.${parts.off}.without`) : t('part.result');
    eq.append(res, out);
    $('#partsNote').innerHTML = parts.off ? t(`part.${parts.off}.note`) : t('part.hint');
  }

  /* 02 — шкала автономності */
  const lv = { sel: 'l3' };
  function renderLevels() {
    const scale = $('#levels-scale');
    scale.innerHTML = '';
    window.LEVELS.forEach((id, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lv' + (lv.sel === id ? ' on' : '') + (i <= window.LEVELS.indexOf(lv.sel) ? ' is-reached' : '');
      b.style.setProperty('--h', `${34 + i * 14}px`);
      b.innerHTML = '<i></i><b></b><span></span>';
      b.querySelector('i').textContent = id.toUpperCase();
      b.querySelector('b').textContent = t(`level.${id}.name`);
      b.addEventListener('click', () => { lv.sel = id; renderLevels(); });
      scale.appendChild(b);
    });
    const d = $('#levelCard');
    const rows = ['decides', 'does', 'example', 'next'];
    d.innerHTML = `<span class="kicker"></span><h3></h3><p class="lv__lead"></p><dl>${rows.map((r) =>
      `<dt>${esc(t('level.dt.' + r))}</dt><dd>${t(`level.${lv.sel}.${r}`)}</dd>`).join('')}</dl>`;
    d.querySelector('.kicker').textContent = lv.sel.toUpperCase();
    d.querySelector('h3').textContent = t(`level.${lv.sel}.name`);
    d.querySelector('.lv__lead').textContent = t(`level.${lv.sel}.b`);
  }

  /* 04 — протоколи */
  function renderProtocols() {
    const root = $('#protocols');
    root.innerHTML = '';
    window.PROTOCOLS.forEach((id) => {
      const c = document.createElement('div');
      c.className = 'card proto';
      c.innerHTML = `<span class="kicker"></span><h3></h3><p class="proto__what"></p><dl>
        <dt></dt><dd class="who"></dd><dt></dt><dd class="where"></dd></dl>`;
      c.querySelector('.kicker').textContent = t(`proto.${id}.k`);
      c.querySelector('h3').textContent = t(`proto.${id}.t`);
      c.querySelector('.proto__what').innerHTML = t(`proto.${id}.b`);
      const dts = c.querySelectorAll('dt');
      dts[0].textContent = t('proto.dt.who'); dts[1].textContent = t('proto.dt.where');
      c.querySelector('.who').innerHTML = t(`proto.${id}.who`);
      c.querySelector('.where').innerHTML = t(`proto.${id}.where`);
      root.appendChild(c);
    });
  }

  /* 05 — вендори (підсвітка стеку) і кейси операторів */
  const vend = { sel: 'ericsson', diagram: null };
  function renderVendors() {
    const bar = $('#vendorBar');
    bar.innerHTML = '';
    window.AGENT_VENDORS.forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = t(`vendor.${v.id}.name`);
      b.classList.toggle('on', vend.sel === v.id);
      b.addEventListener('click', () => { vend.sel = v.id; renderVendors(); });
      bar.appendChild(b);
    });
    const v = window.AGENT_VENDORS.find((x) => x.id === vend.sel);
    if (vend.diagram) vend.diagram.cover({ full: v.full, part: v.part });
    const card = $('#vendorCard');
    card.innerHTML = `<span class="kicker"></span><h3></h3><p class="focus"></p><dl></dl>`;
    card.querySelector('.kicker').textContent = t('vendor.kicker');
    card.querySelector('h3').textContent = t(`vendor.${v.id}.name`);
    card.querySelector('.focus').textContent = t(`vendor.${v.id}.focus`);
    card.querySelector('dl').innerHTML = ['platform', 'agents', 'open'].map((k) =>
      `<dt>${esc(t('vendor.dt.' + k))}</dt><dd>${t(`vendor.${v.id}.${k}`)}</dd>`).join('');
  }

  function renderCases() {
    const root = $('#cases');
    root.innerHTML = '';
    window.CASES.forEach((c) => {
      const el = document.createElement('div');
      el.className = 'card case';
      el.innerHTML = `<div class="case__top"><span class="mode"></span>${c.single ? '<span class="single"></span>' : ''}</div>
        <h3></h3><p class="case__b"></p><p class="case__r"></p>`;
      const mode = el.querySelector('.mode');
      mode.textContent = t('case.mode.' + c.mode);
      mode.dataset.mode = c.mode;
      if (c.single) el.querySelector('.single').textContent = t('case.single');
      el.querySelector('h3').textContent = t(`case.${c.id}.t`);
      el.querySelector('.case__b').innerHTML = t(`case.${c.id}.b`);
      el.querySelector('.case__r').innerHTML = t(`case.${c.id}.r`);
      root.appendChild(el);
    });
  }

  /* 06 — матриця повноважень */
  const auth = { sel: 'tune' };
  function renderAuthority() {
    const grid = $('#authority');
    const L = window.AUTHORITY_LEVELS;
    grid.innerHTML = `<div class="au__h"></div>${L.map((l) => `<div class="au__h" data-level="${l}">${esc(t('auth.level.' + l))}</div>`).join('')}`;
    window.AUTHORITY.forEach((row) => {
      const name = document.createElement('button');
      name.type = 'button';
      name.className = 'au__row' + (auth.sel === row.id ? ' on' : '');
      name.textContent = t(`auth.${row.id}.t`);
      name.addEventListener('click', () => { auth.sel = row.id; renderAuthority(); });
      grid.appendChild(name);
      L.forEach((l) => {
        const cell = document.createElement('div');
        cell.className = 'au__c' + (row.level === l ? ' is-set' : '') + (auth.sel === row.id ? ' on' : '');
        cell.dataset.level = l;
        if (row.level === l) cell.innerHTML = `<span class="dot"></span><span class="lbl">${esc(t('auth.level.' + l))}</span>`;
        cell.addEventListener('click', () => { auth.sel = row.id; renderAuthority(); });
        grid.appendChild(cell);
      });
    });
    const row = window.AUTHORITY.find((r) => r.id === auth.sel);
    const d = $('#authCard');
    d.innerHTML = '<span class="kicker"></span><h3></h3><p></p>';
    d.querySelector('.kicker').textContent = t('auth.level.' + row.level);
    d.querySelector('h3').textContent = t(`auth.${row.id}.t`);
    d.querySelector('p').innerHTML = t(`auth.${row.id}.why`);
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

  window.AgentSections = {
    mount() {
      $('#glossSearch').addEventListener('input', (e) => { gloss.q = e.target.value; renderGloss(); });
    },
    setVendorDiagram(d) { vend.diagram = d; },
    selectVendor(id) { vend.sel = id; renderVendors(); },
    render() { renderParts(); renderLevels(); renderProtocols(); renderVendors(); renderCases(); renderAuthority(); renderGloss(); },
  };
})();
