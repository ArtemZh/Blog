/* Розділи статті без полотна. Рендери ідемпотентні — їх викликають знову
   при зміні мови. */
(function () {
  const t = (k) => window.I18N.t(k);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const btn = (cls, html, on, click) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls + (on ? ' on' : '');
    b.innerHTML = html; b.addEventListener('click', click);
    return b;
  };
  const dl = (rows) => `<dl>${rows.map(([dt, dd]) => `<dt>${esc(dt)}</dt><dd>${dd}</dd>`).join('')}</dl>`;
  const pad2 = (n) => String(n).padStart(2, '0');

  /* 01 — шість цілей, дванадцять вимог */
  function renderGoals() {
    $('#goals').innerHTML = window.GOALS.map((g) => `<div class="goal"><span class="kicker">${esc(t('goal.' + g.id))}</span>` +
      g.reqs.map((n) => `<div class="goal__r"><i>${pad2(n)}</i><b>${esc(t(`req.${n}.t`))}</b></div>`).join('') + '</div>').join('');
  }

  /* 02 — межі: ті самі десять систем, три варіанти */
  const scope = { sel: 'flat' };
  function renderScope() {
    const bar = $('#scopeBar');
    bar.innerHTML = '';
    window.SCOPE_STATES.forEach((s) =>
      bar.appendChild(btn('', esc(t(`scope.${s}.name`)), scope.sel === s, () => { scope.sel = s; renderScope(); })));
    const S = window.SCOPE_SYSTEMS, inScope = S.filter((x) => x[scope.sel] !== 'out').length;
    $('#scopeCount').innerHTML = `<b>${inScope}</b> ${esc(t('scope.of'))} ${S.length} <span>${esc(t('scope.count'))}</span>`;
    $('#scopeGrid').innerHTML = S.map((x) => `<div class="scp__s" data-st="${x[scope.sel]}"><b>${esc(t(`sys.${x.id}.t`))}</b>` +
      `<span>${esc(t(`sys.${x.id}.s`))}</span><i>${esc(t('scope.st.' + x[scope.sel]))}</i></div>`).join('');
    $('#scopeLegend').innerHTML = ['in', 'conn', 'out'].map((k) => `<span data-st="${k}">${esc(t('scope.st.' + k))}</span>`).join('');
    const d = $('#scopeCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><p></p><p class="m__trap"><b></b> <span></span></p>`;
    d.querySelector('.kicker').textContent = t('scope.kicker');
    d.querySelector('h3').textContent = t(`scope.${scope.sel}.name`);
    d.querySelector('p').innerHTML = t(`scope.${scope.sel}.b`);
    d.querySelector('.m__trap b').textContent = t('ui.pm');
    d.querySelector('.m__trap span').textContent = t(`scope.${scope.sel}.pm`);
  }

  /* 03 — матриця «вимога × роль» і колонка хмари */
  const mx = { role: null, req: 3 };
  function renderMatrix() {
    const bar = $('#roleBar');
    bar.innerHTML = '';
    window.ROLES.forEach((r) =>
      bar.appendChild(btn('', esc(t('role.' + r)), mx.role === r, () => { mx.role = mx.role === r ? null : r; renderMatrix(); })));
    const root = $('#mx');
    root.innerHTML = `<div class="mx__h">${esc(t('mx.h.req'))}</div>` +
      window.ROLES.map((r) => `<div class="mx__h${mx.role === r ? ' on' : ''}">${esc(t('role.' + r))}</div>`).join('') +
      `<div class="mx__h mx__h--cloud">${esc(t('role.cloud'))}</div>`;
    window.MATRIX.forEach((row) => {
      const dim = mx.role && !row[mx.role];
      const b = btn('mx__row' + (dim ? ' is-dim' : ''), `<i>${pad2(row.n)}</i><span>${esc(t(`req.${row.n}.t`))}</span>`, mx.req === row.n,
        () => { mx.req = row.n; renderMatrix(); });
      root.appendChild(b);
      window.ROLES.forEach((r) => {
        const c = document.createElement('div');
        c.className = 'mx__c' + (mx.role === r ? ' on' : '') + (dim ? ' is-dim' : '');
        if (row[r]) { c.dataset.v = row[r]; c.title = t('mx.' + row[r]); c.innerHTML = `<span class="dot"></span><span class="lbl">${esc(t('role.' + r))} · ${esc(t('mx.' + row[r]))}</span>`; }
        root.appendChild(c);
      });
      const c = document.createElement('div');
      c.className = 'mx__c mx__c--cloud' + (dim ? ' is-dim' : '');
      c.dataset.v = row.cloud; c.textContent = t('mx.' + row.cloud);
      root.appendChild(c);
    });
    const row = window.MATRIX.find((x) => x.n === mx.req);
    const lead = window.ROLES.filter((r) => row[r] === 'L').map((r) => t('role.' + r));
    const help = window.ROLES.filter((r) => row[r] === 'H').map((r) => t('role.' + r));
    const d = $('#mxCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3>` + dl([
      [t('mx.dt.what'), t(`req.${row.n}.b`)],
      [t('mx.dt.ev'), t(`req.${row.n}.ev`)],
      [t('mx.dt.who'), esc(lead.join(', ')) + (help.length ? ` · ${esc(t('mx.H'))}: ${esc(help.join(', '))}` : '') + ` · ${esc(t('role.cloud'))}: ${esc(t('mx.' + row.cloud))}`],
    ]);
    d.querySelector('.kicker').textContent = `${t('mx.kicker')} ${row.n}`;
    d.querySelector('h3').textContent = t(`req.${row.n}.t`);
  }

  /* 04 — порядок робіт: етапи × доріжки, критичний шлях */
  const ord = { sel: 'token' };
  function renderOrder() {
    const W = window.ORDER_COLS, root = $('#ord');
    root.style.setProperty('--w', W);
    let html = '<div class="cal__head"><span></span>' + Array.from({ length: W }, (_, i) => `<span>${esc(t('ord.col'))} ${i + 1}</span>`).join('') + '</div>';
    [0, 1, 2, 3].forEach((lane) => {
      html += `<div class="cal__lane"><span class="cal__k">${esc(t('ord.lane.' + lane))}</span>`;
      window.ORDER.filter((x) => x.lane === lane).forEach((x) => {
        html += `<button type="button" class="cal__it${ord.sel === x.id ? ' on' : ''}${x.crit ? ' is-crit' : ''}" data-id="${x.id}" style="grid-column:${x.from + 1}/${x.to + 2}">${esc(t(`ord.${x.id}.t`))}</button>`;
      });
      html += '</div>';
    });
    root.innerHTML = html + `<p class="cal__legend"><i></i>${esc(t('ord.crit'))}</p>`;
    root.querySelectorAll('.cal__it').forEach((b) => b.addEventListener('click', () => { ord.sel = b.dataset.id; renderOrder(); }));
    const x = window.ORDER.find((o) => o.id === ord.sel);
    const d = $('#ordCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><p></p>` + dl([[t('ord.dt.dep'), esc(t(`ord.${x.id}.dep`))], [t('ord.dt.slip'), esc(t(`ord.${x.id}.slip`))]]);
    d.querySelector('.kicker').textContent = t('ord.lane.' + x.lane) + (x.crit ? ' · ' + t('ord.crit') : '');
    d.querySelector('h3').textContent = t(`ord.${x.id}.t`);
    d.querySelector('p').textContent = t(`ord.${x.id}.b`);
  }

  /* 06 — три потоки робіт */
  const st = { sel: 'infra' };
  function renderStreams() {
    const bar = $('#stBar');
    bar.innerHTML = '';
    Object.keys(window.STREAMS).forEach((r) =>
      bar.appendChild(btn('', esc(t(`st.${r}.name`)), st.sel === r, () => { st.sel = r; renderStreams(); })));
    $('#stList').innerHTML = window.STREAMS[st.sel].map((id) => { const p = `st.${st.sel}.${id}.`; return `<div class="card metric">
      <span class="kicker">${esc(t(p + 'k'))}</span><h3>${esc(t(p + 't'))}</h3><p class="m__what">${t(p + 'b')}</p>
      <p class="m__trap"><b>${esc(t('st.ask'))}</b> ${esc(t(p + 'q'))}</p></div>`; }).join('');
    $('#stTrap').innerHTML = `<b>${esc(t('ui.trap'))}</b> ${esc(t(`st.${st.sel}.trap`))}`;
  }

  /* 07 — докази, «годинник», календар */
  const clock = { sel: 'first' };
  const rh = { sel: 'half.scope' };
  function renderEvidence() {
    $('#evList').innerHTML = window.EVIDENCE.map((id) => `<div class="card card--soft"><h3>${esc(t(`ev.${id}.t`))}</h3><p>${t(`ev.${id}.b`)}</p></div>`).join('');
    const bar = $('#clockBar');
    bar.innerHTML = '';
    ['first', 'next'].forEach((s) =>
      bar.appendChild(btn('', esc(t(`clock.${s}.name`)), clock.sel === s, () => { clock.sel = s; renderEvidence(); })));
    $('#clock').innerHTML = `<div class="clk__h"><span>${esc(t('clock.h.what'))}</span><span>${esc(t('clock.h.need'))}</span></div>` +
      window.CLOCK.map((id) => `<div class="clk__r"><b>${esc(t(`clock.${id}.t`))}</b><span>${esc(t(`clock.${id}.${clock.sel}`))}</span></div>`).join('');
    const c = $('#clockCard');
    c.innerHTML = `<span class="kicker"></span><h3></h3><p></p>`;
    c.querySelector('.kicker').textContent = t('s7.clock.h').split(':')[0];
    c.querySelector('h3').textContent = t(`clock.${clock.sel}.name`);
    c.querySelector('p').innerHTML = t(`clock.${clock.sel}.b`);

    const root = $('#rh');
    root.innerHTML = '';
    window.RHYTHM.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'rh__row';
      row.innerHTML = `<span class="rh__k">${esc(t('rh.' + g.id))}</span><span class="rh__its"></span>`;
      g.items.forEach((it) => { const id = g.id + '.' + it;
        row.lastChild.appendChild(btn('rh__it', esc(t(`rh.${id}.t`)), rh.sel === id, () => { rh.sel = id; renderEvidence(); })); });
      root.appendChild(row);
    });
    const d = $('#rhCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><p></p>` + dl([[t('rh.dt.req'), esc(t(`rh.${rh.sel}.req`))], [t('rh.dt.who'), esc(t(`rh.${rh.sel}.who`))]]);
    d.querySelector('.kicker').textContent = t('rh.' + rh.sel.split('.')[0]);
    d.querySelector('h3').textContent = t(`rh.${rh.sel}.t`);
    d.querySelector('p').textContent = t(`rh.${rh.sel}.b`);
  }

  /* 08 — аудит */
  const au = { sel: 'kickoff' };
  function renderAudit() {
    const bar = $('#auBar'), A = window.AUDIT;
    bar.innerHTML = '';
    A.forEach((id, i) => {
      const b = btn('ro' + (i < A.indexOf(au.sel) ? ' is-done' : ''), `<i>${pad2(i + 1)}</i><b></b>`, au.sel === id, () => { au.sel = id; renderAudit(); });
      b.querySelector('b').textContent = t(`au.${id}.t`);
      bar.appendChild(b);
    });
    const d = $('#auCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3>` + dl([[t('au.dt.do'), esc(t(`au.${au.sel}.do`))], [t('au.dt.pm'), esc(t(`au.${au.sel}.pm`))]]);
    d.querySelector('.kicker').textContent = `${t('au.kicker')} ${A.indexOf(au.sel) + 1} / ${A.length}`;
    d.querySelector('h3').textContent = t(`au.${au.sel}.t`);
    $('#outList').innerHTML = window.OUTCOMES.map((id) => `<div class="card card--soft"><h3>${esc(t(`out.${id}.t`))}</h3><p>${t(`out.${id}.b`)}</p></div>`).join('');
  }

  /* 09 — ризики */
  function renderRisks() {
    $('#riskList').innerHTML = window.RISKS.map((id) => `<div class="card metric"><h3>${esc(t(`risk.${id}.t`))}</h3>
      <p class="m__what">${t(`risk.${id}.b`)}</p>
      <p class="m__trap"><b>${esc(t('risk.sign'))}</b> ${esc(t(`risk.${id}.sign`))}</p>
      <p class="m__trap m__act"><b>${esc(t('risk.act'))}</b> ${esc(t(`risk.${id}.act`))}</p></div>`).join('');
  }

  /* 10 — кейси */
  function renderCases() {
    $('#caseList').innerHTML = window.CASES.map((id) => `<div class="card case">
      <div class="case__top"><span class="mode" data-mode="act">${esc(t('case.mode'))}</span><span class="single">${esc(t(`case.${id}.year`))}</span></div>
      <h3>${esc(t(`case.${id}.t`))}</h3><p class="case__b">${t(`case.${id}.b`)}</p>
      <p class="case__l"><b>${esc(t('case.lesson'))}</b> ${t(`case.${id}.l`)}</p></div>`).join('');
  }

  /* 11 — словник */
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

  window.PciSections = {
    mount() {
      $('#glossSearch').addEventListener('input', (e) => { gloss.q = e.target.value; renderGloss(); });
    },
    render() {
      renderGoals(); renderScope(); renderMatrix(); renderOrder(); renderStreams();
      renderEvidence(); renderAudit(); renderRisks(); renderCases(); renderGloss();
    },
  };
})();
