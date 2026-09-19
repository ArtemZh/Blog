/* Розділи статті 3 без полотна: теми, межі, безпека, етапи, метрики,
   глосарій. Рендери ідемпотентні — їх викликають знову при зміні мови. */
(function () {
  const t = (k) => window.I18N.t(k);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 01 — теми: чотири колонки «що робить бот», тема — картка в колонці */
  const topics = { sel: 'charges' };
  function renderTopics() {
    const root = $('#topics');
    root.innerHTML = '';
    window.TOPIC_MODES.forEach((m, i) => {
      const col = document.createElement('div');
      col.className = 'tp__col';
      col.dataset.mode = m;
      col.innerHTML = `<div class="tp__h"><i>${String(i + 1).padStart(2, '0')}</i><b></b><span></span></div>`;
      col.querySelector('b').textContent = t(`topic.mode.${m}`);
      col.querySelector('span').textContent = t(`topic.mode.${m}.s`);
      window.TOPICS.filter((x) => x.mode === m).forEach((x) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tp' + (topics.sel === x.id ? ' on' : '');
        b.textContent = t(`topic.${x.id}.t`);
        b.addEventListener('click', () => { topics.sel = x.id; renderTopics(); });
        col.appendChild(b);
      });
      root.appendChild(col);
    });
    const x = window.TOPICS.find((y) => y.id === topics.sel);
    const d = $('#topicCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><dl>${['does', 'why', 'needs'].map((k) =>
      `<dt>${esc(t('topic.dt.' + k))}</dt><dd>${t(`topic.${x.id}.${k}`)}</dd>`).join('')}</dl>`;
    d.querySelector('.kicker').textContent = t(`topic.mode.${x.mode}`);
    d.querySelector('h3').textContent = t(`topic.${x.id}.t`);
  }

  /* 04 — межі (та сама матриця, що в статті 2) */
  const auth = { sel: 'tariff' };
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

  /* 04 — картки безпеки */
  function renderSafety() {
    const root = $('#safety');
    root.innerHTML = '';
    window.SAFETY.forEach((id) => {
      const c = document.createElement('div');
      c.className = 'card safe';
      c.innerHTML = '<span class="kicker"></span><h3></h3><p></p><ul></ul>';
      c.querySelector('.kicker').textContent = t(`safety.${id}.k`);
      c.querySelector('h3').textContent = t(`safety.${id}.t`);
      c.querySelector('p').innerHTML = t(`safety.${id}.b`);
      c.querySelector('ul').innerHTML = t(`safety.${id}.list`).split(' | ').map((s) => `<li>${s}</li>`).join('');
      root.appendChild(c);
    });
  }

  /* 05 — етапи впровадження: стрічка + картка */
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

  /* 06 — метрики */
  function renderMetrics() {
    const root = $('#metrics');
    root.innerHTML = '';
    window.METRICS.forEach((id) => {
      const c = document.createElement('div');
      c.className = 'card metric';
      c.innerHTML = '<h3></h3><p class="m__what"></p><p class="m__trap"></p>';
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

  window.ChatSections = {
    mount() {
      $('#glossSearch').addEventListener('input', (e) => { gloss.q = e.target.value; renderGloss(); });
    },
    render() { renderTopics(); renderAuthority(); renderSafety(); renderRollout(); renderMetrics(); renderGloss(); },
  };
})();
