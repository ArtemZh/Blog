/* Розділи статті 4 без полотна: чат проти голосу, дві архітектури, межі,
   безпека, якість голосу, етапи, метрики, глосарій. Рендери ідемпотентні. */
(function () {
  const t = (k) => window.I18N.t(k);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let onArch = null;

  /* 01 — таблиця «чат / голос»; клік по рядку показує приклад обома способами */
  const cmp = { sel: 'bargein' };
  function renderCompare() {
    const root = $('#compare');
    root.innerHTML = `<div class="cmp__head"><span></span><span>${esc(t('cmp.chat'))}</span><span>${esc(t('cmp.voice'))}</span></div>`;
    window.COMPARE.forEach((id) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'cmp__row' + (cmp.sel === id ? ' on' : '');
      row.innerHTML = '<b></b><span></span><span class="v"></span>';
      row.querySelector('b').textContent = t(`cmp.${id}.t`);
      row.querySelectorAll('span')[0].textContent = t(`cmp.${id}.chat`);
      row.querySelector('.v').textContent = t(`cmp.${id}.voice`);
      row.addEventListener('click', () => { cmp.sel = id; renderCompare(); });
      root.appendChild(row);
    });
    const d = $('#compareCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3>
      <div class="say"><i></i><p class="say__chat"></p></div>
      <div class="say say--voice"><i></i><p class="say__voice"></p></div>`;
    d.querySelector('.kicker').textContent = t('cmp.example');
    d.querySelector('h3').textContent = t(`cmp.${cmp.sel}.t`);
    const is = d.querySelectorAll('i');
    is[0].textContent = t('cmp.chat'); is[1].textContent = t('cmp.voice');
    d.querySelector('.say__chat').innerHTML = t(`cmp.${cmp.sel}.exchat`);
    d.querySelector('.say__voice').innerHTML = t(`cmp.${cmp.sel}.exvoice`);
  }

  /* 02 — дві архітектури; кнопка перемикає шлях на схемі */
  function renderArchs(current) {
    const root = $('#archs');
    root.innerHTML = '';
    window.ARCHS.forEach((id) => {
      const c = document.createElement('div');
      c.className = 'card arch' + (current === id ? ' on' : '');
      c.innerHTML = `<span class="kicker"></span><h3></h3><p></p><dl><dt></dt><dd class="plus"></dd><dt></dt><dd class="minus"></dd><dt></dt><dd class="when"></dd></dl><button type="button" class="arch__go"></button>`;
      c.querySelector('.kicker').textContent = t(`arch.${id}.k`);
      c.querySelector('h3').textContent = t(`arch.${id}.t`);
      c.querySelector('p').innerHTML = t(`arch.${id}.b`);
      const dts = c.querySelectorAll('dt');
      dts[0].textContent = t('arch.dt.plus'); dts[1].textContent = t('arch.dt.minus'); dts[2].textContent = t('arch.dt.when');
      c.querySelector('.plus').innerHTML = t(`arch.${id}.plus`);
      c.querySelector('.minus').innerHTML = t(`arch.${id}.minus`);
      c.querySelector('.when').innerHTML = t(`arch.${id}.when`);
      const go = c.querySelector('.arch__go');
      go.textContent = t('arch.go');
      go.addEventListener('click', () => onArch && onArch(id, true));
      root.appendChild(c);
    });
  }

  /* 04 — межі */
  const auth = { sel: 'disclose' };
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

  /* 04 — безпека, 05 — якість: картки з пунктами */
  function renderCards(rootSel, ids, prefix, cls) {
    const root = $(rootSel);
    root.innerHTML = '';
    ids.forEach((id) => {
      const c = document.createElement('div');
      c.className = 'card ' + cls;
      c.innerHTML = '<span class="kicker"></span><h3></h3><p></p><ul></ul>';
      c.querySelector('.kicker').textContent = t(`${prefix}.${id}.k`);
      c.querySelector('h3').textContent = t(`${prefix}.${id}.t`);
      c.querySelector('p').innerHTML = t(`${prefix}.${id}.b`);
      c.querySelector('ul').innerHTML = t(`${prefix}.${id}.list`).split(' | ').map((s) => `<li>${s}</li>`).join('');
      root.appendChild(c);
    });
  }

  /* 06 — етапи */
  const roll = { sel: 'pilot' };
  function renderRollout() {
    const bar = $('#rollout');
    bar.innerHTML = '';
    window.ROLLOUT.forEach((id, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ro' + (roll.sel === id ? ' on' : '') + (i < window.ROLLOUT.indexOf(roll.sel) ? ' is-done' : '');
      b.innerHTML = `<i>${String(i + 1).padStart(2, '0')}</i><b></b>`;
      b.querySelector('b').textContent = t(`roll.${id}.t`);
      b.addEventListener('click', () => { roll.sel = id; renderRollout(); });
      bar.appendChild(b);
    });
    const d = $('#rollCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><dl>${['do', 'gate'].map((k) =>
      `<dt>${esc(t('roll.dt.' + k))}</dt><dd>${t(`roll.${roll.sel}.${k}`)}</dd>`).join('')}</dl>`;
    d.querySelector('.kicker').textContent = `${t('roll.kicker')} ${window.ROLLOUT.indexOf(roll.sel) + 1} / ${window.ROLLOUT.length}`;
    d.querySelector('h3').textContent = t(`roll.${roll.sel}.t`);
  }

  /* 06 — метрики: спільні зі статті 3 й голосові */
  function renderMetrics() {
    const root = $('#metrics');
    root.innerHTML = '';
    window.METRICS.forEach((id) => {
      const c = document.createElement('div');
      c.className = 'card metric';
      c.innerHTML = '<span class="kicker"></span><h3></h3><p class="m__what"></p><p class="m__trap"></p>';
      c.querySelector('.kicker').textContent = t(`metric.${id}.k`);
      c.querySelector('h3').textContent = t(`metric.${id}.t`);
      c.querySelector('.m__what').innerHTML = t(`metric.${id}.b`);
      c.querySelector('.m__trap').innerHTML = `<b>${esc(t('metric.trap'))}</b> ${t(`metric.${id}.trap`)}`;
      root.appendChild(c);
    });
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

  window.VoiceSections = {
    mount(opts) {
      onArch = opts.onArch;
      $('#glossSearch').addEventListener('input', (e) => { gloss.q = e.target.value; renderGloss(); });
    },
    renderArchs,
    render(path) {
      renderCompare(); renderArchs(path); renderAuthority();
      renderCards('#safety', window.SAFETY, 'safety', 'safe');
      renderCards('#quality', window.QUALITY, 'quality', 'safe');
      renderRollout(); renderMetrics(); renderGloss();
    },
  };
})();
