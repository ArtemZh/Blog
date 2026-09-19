/* Розділи статті 5 без полотна. Рендери ідемпотентні — їх викликають знову
   при зміні мови. */
(function () {
  const t = (k) => window.I18N.t(k);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const btn = (cls, html, on, click) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls + (on ? ' on' : '');
    b.innerHTML = html; b.addEventListener('click', click);
    return b;
  };
  const dl = (keys, pre) => `<dl>${keys.map((k) => `<dt>${esc(t(pre.dt + k))}</dt><dd>${t(pre.dd + k)}</dd>`).join('')}</dl>`;

  /* 01 — розгорнуто ≠ випущено: дві доріжки, перемикач стану */
  const rvd = { sel: 'deployed' };
  function renderRvd() {
    const bar = $('#rvdBar');
    bar.innerHTML = '';
    ['before', 'deployed', 'released'].forEach((s) =>
      bar.appendChild(btn('', esc(t('rvd.' + s + '.name')), rvd.sel === s, () => { rvd.sel = s; renderRvd(); })));
    const env = rvd.sel !== 'before', users = rvd.sel === 'released';
    $('#rvd').innerHTML = `
      <div class="rvd__lane"><span class="rvd__k">${esc(t('rvd.lane.env'))}</span>
        <div class="rvd__cells"><span class="rvd__c is-on">v1.4</span><span class="rvd__c ${env ? 'is-on is-new' : ''}">${env ? 'v1.5' : '—'}</span></div>
        <span class="rvd__who">${esc(t('rvd.who.env'))}</span></div>
      <div class="rvd__flag"><span class="rvd__sw ${users ? 'on' : ''}"><i></i></span>${esc(t(users ? 'rvd.flag.on' : 'rvd.flag.off'))}</div>
      <div class="rvd__lane"><span class="rvd__k">${esc(t('rvd.lane.users'))}</span>
        <div class="rvd__cells"><span class="rvd__c is-on">v1.4</span><span class="rvd__c ${users ? 'is-on is-new' : ''}">${users ? 'v1.5' : '—'}</span></div>
        <span class="rvd__who">${esc(t('rvd.who.users'))}</span></div>`;
    const d = $('#rvdCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><p></p>`;
    d.querySelector('.kicker').textContent = t('rvd.kicker');
    d.querySelector('h3').textContent = t('rvd.' + rvd.sel + '.name');
    d.querySelector('p').innerHTML = t('rvd.' + rvd.sel + '.b');
  }

  /* 02 — життєві цикли: чотири окремі схеми, кожна з описом кроків.
     Наведення або клік на вузол чи крок підсвічує пару «вузол ↔ опис». */
  const W = (s) => Math.round(s.length * 6.9 + 18); // ширина плашки під текст 12px
  const pill = (id, x, y, label, cls) =>
    `<g class="lcd__pill${cls ? ' ' + cls : ''}" data-step="${id}"><rect x="${x - W(label) / 2}" y="${y - 12}" width="${W(label)}" height="24" rx="12"/><text x="${x}" y="${y + 4}">${esc(label)}</text></g>`;
  const split = (s) => {
    if (s.length < 11 || s.indexOf(' ') < 0) return [s];
    const m = s.length / 2;
    let best = -1;
    for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (best < 0 || Math.abs(i - m) < Math.abs(best - m))) best = i;
    return [s.slice(0, best), s.slice(best + 1)];
  };
  const node = (id, x, y, r, label, cls) => {
    const ls = split(label);
    return `<g class="lcd__node${cls ? ' ' + cls : ''}" data-step="${id}"><circle cx="${x}" cy="${y}" r="${r}"/>` +
      ls.map((l, i) => `<text x="${x}" y="${y + 4 + (i - (ls.length - 1) / 2) * 14}">${esc(l)}</text>`).join('') + '</g>';
  };
  const edge = (d, mk) => `<path class="lcd__edge" d="${d}" marker-end="url(#${mk})"/>`;
  const lab = (x, y, s, anchor) => `<text class="lcd__lab" x="${x}" y="${y}" text-anchor="${anchor || 'middle'}">${esc(s)}</text>`;
  const marker = (mk) => `<defs><marker id="${mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="lcd__tip"/></marker></defs>`;

  const FORMS = {
    line(c) {
      const mk = 'lcm-' + c.id, xs = c.steps.map((_, i) => 60 + i * 130), y = 46;
      let g = '';
      xs.slice(1).forEach((x, i) => { g += edge(`M${xs[i] + 27},${y} H${x - 29}`, mk); });
      c.steps.forEach((p, i) => {
        g += `<g class="lcd__node" data-step="${p}"><circle cx="${xs[i]}" cy="${y}" r="24"/><text x="${xs[i]}" y="${y + 4}">${String(i + 1).padStart(2, '0')}</text>` +
          `<text class="lcd__under" x="${xs[i]}" y="${y + 50}">${esc(t(`lc.${c.id}.${p}.t`))}</text></g>`;
      });
      return `<svg viewBox="0 0 640 118" class="lcd__svg">${marker(mk)}${g}</svg>`;
    },
    explore(c) {
      const mk = 'lcm-' + c.id, T = (p) => t(`lc.da.${p}.t`), E = (k) => t(`lc.da.e.${k}`);
      const g =
        lab(22, 90, E('idea'), 'start') + edge('M52,100 Q52,150 80,150', mk) +
        edge('M158,150 H280', mk) + lab(219, 140, E('hyp')) +
        edge('M320,112 Q320,52 410,52', mk) + lab(314, 72, E('mvp'), 'end') +
        edge('M490,52 Q580,52 580,110', mk) +
        edge('M542,150 H360', mk) + lab(451, 140, E('keep')) +
        edge('M618,150 H700', mk) + lab(659, 140, E('proven')) +
        edge('M566,188 V234 H120 V190', mk) + lab(343, 252, E('pivot')) +
        edge('M596,188 V252', mk) + lab(604, 226, E('disproven'), 'start') +
        node('envision', 120, 150, 36, T('envision')) + node('build', 320, 150, 36, T('build')) +
        node('deploy', 450, 52, 36, T('deploy')) + node('observe', 580, 150, 36, T('observe')) +
        node('productize', 738, 150, 36, T('productize')) + node('drop', 596, 276, 22, E('drop'), 'lcd__node--drop');
      return `<svg viewBox="0 0 800 306" class="lcd__svg">${marker(mk)}${g}</svg>`;
    },
    infinity(c) {
      // Лемніската Бернуллі: t ∈ (π/2, 3π/2) — ліва петля (Dev), решта — права (Ops).
      const cx = 360, cy = 150, a = 250, P = (tt) => {
        const s = Math.sin(tt), k = 1 + s * s;
        return [cx + a * Math.cos(tt) / k, cy + a * s * Math.cos(tt) / k];
      };
      const arc = (t0, t1) => {
        let d = '';
        for (let i = 0; i <= 60; i++) { const [x, y] = P(t0 + (t1 - t0) * i / 60); d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); }
        return d;
      };
      const PI = Math.PI, at = { plan: .6, design: .8, code: 1.04, test: 1.28, deploy: 1.5, operate: 1.72, support: 2, monitor: 2.28 };
      let g = `<path class="lcd__loop" d="${arc(PI / 2, 3 * PI / 2)}"/><path class="lcd__loop lcd__loop--ops" d="${arc(-PI / 2, PI / 2)}"/>` +
        `<text class="lcd__side" x="232" y="154">DEV</text><text class="lcd__side" x="488" y="154">OPS</text>`;
      // Стрілки напрямку — посередині між сусідніми кроками.
      const ts = c.steps.map((p) => at[p] * PI);
      ts.forEach((t0, i) => {
        let t1 = ts[(i + 1) % ts.length]; if (t1 <= t0) t1 += 2 * PI;
        const m = (t0 + t1) / 2, [x, y] = P(m), [x2, y2] = P(m + .01);
        const ang = Math.atan2(y2 - y, x2 - x) * 180 / PI;
        g += `<path class="lcd__tip" d="M-5,-5 L5,0 L-5,5 z" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)})"/>`;
      });
      c.steps.forEach((p, i) => { const [x, y] = P(ts[i]); g += pill(p, x, y, t(`lc.devops.${p}.t`), p === 'deploy' ? 'lcd__pill--key' : ''); });
      return `<svg viewBox="80 40 560 220" class="lcd__svg">${g}</svg>`;
    },
    wheel(c) {
      const mk = 'lcm-' + c.id, cx = 200, cy = 200, T = (p) => t(`lc.itil.${p}.t`);
      const pt = (r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
      const arcD = (r, d0, d1) => { const [x0, y0] = pt(r, d0), [x1, y1] = pt(r, d1); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };
      let g = '';
      [[-60, 20], [60, 140], [180, 260]].forEach(([a, b]) => { g += `<path class="lcd__edge lcd__edge--dash" d="${arcD(172, a, b)}" marker-end="url(#${mk})"/>`; });
      [['design', -90], ['transition', 30], ['operation', 150]].forEach(([p, m]) => {
        g += `<path class="lcd__band" data-step="${p}" d="${arcD(118, m - 52, m + 52)}"/>`;
        g += `<path class="lcd__edge" d="${arcD(118, m - 40, m + 52)}" marker-end="url(#${mk})"/>`;
      });
      [['design', -90], ['transition', 30], ['operation', 150]].forEach(([p, m]) => { const [x, y] = pt(118, m); g += pill(p, x, y, T(p), p === 'transition' ? 'lcd__pill--key' : ''); });
      g += node('strategy', cx, cy, 62, T('strategy'), 'lcd__node--core') + pill('csi', cx, 28, T('csi'));
      return `<svg viewBox="0 0 400 400" class="lcd__svg lcd__svg--sq">${marker(mk)}${g}</svg>`;
    },
  };

  function renderLifecycles() {
    const root = $('#lc');
    root.innerHTML = window.LIFECYCLES.map((c) => `
      <article class="lcd lcd--${c.form}" data-lc="${c.id}">
        <header class="lcd__head"><span class="kicker">${esc(t(`lc.${c.id}.trait`))}</span><h3>${esc(t(`lc.${c.id}.name`))}</h3><p>${t(`lc.${c.id}.lead`)}</p></header>
        <div class="lcd__body">
          <div class="lcd__fig">${FORMS[c.form](c)}</div>
          <ol class="lcd__steps">${c.steps.map((p) => `<li data-step="${p}"><b>${esc(t(`lc.${c.id}.${p}.t`))}</b> ${t(`lc.${c.id}.${p}.s`)}</li>`).join('')}</ol>
        </div>
        <div class="note">${t(`lc.${c.id}.note`)}</div>
      </article>`).join('');
    root.querySelectorAll('.lcd').forEach((card) => {
      const hl = (id) => card.querySelectorAll('[data-step]').forEach((el) => el.classList.toggle('is-hl', el.dataset.step === id));
      card.querySelectorAll('[data-step]').forEach((el) => {
        el.addEventListener('mouseenter', () => hl(el.dataset.step));
        el.addEventListener('click', () => hl(el.dataset.step));
      });
      card.addEventListener('mouseleave', () => hl(null));
    });
  }

  function renderApproaches() {
    const root = $('#appr');
    root.innerHTML = `<div class="appr__h"><span>${esc(t('appr.h.name'))}</span><span>${esc(t('appr.h.what'))}</span><span>${esc(t('appr.h.rel'))}</span><span>${esc(t('appr.h.where'))}</span></div>` +
      window.APPROACHES.map((id) => `<div class="appr__r"><b>${esc(t(`appr.${id}.t`))}<i>${esc(t(`appr.${id}.focus`))}</i></b><span>${t(`appr.${id}.what`)}</span><span>${t(`appr.${id}.rel`)}</span><span>${t(`appr.${id}.where`)}</span></div>`).join('');
  }

  /* 03 — ролі */
  const role = { sel: 'safe' };
  function renderRoles() {
    const bar = $('#roleBar');
    bar.innerHTML = '';
    window.ROLE_METHODS.forEach((m) =>
      bar.appendChild(btn('rm__b', `<b>${esc(t(`role.${m}.name`))}</b><span>${esc(t(`role.${m}.short`))}</span>`, role.sel === m, () => { role.sel = m; renderRoles(); })));
    const d = $('#roleCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3>` + dl(['who', 'does', 'note'], { dt: 'role.dt.', dd: `role.${role.sel}.` });
    d.querySelector('.kicker').textContent = t('role.kicker');
    d.querySelector('h3').textContent = t(`role.${role.sel}.name`);
  }

  /* 04 — календар */
  const cal = { sel: 'rrr' };
  function renderCalendar() {
    const W = window.CAL_WEEKS, root = $('#cal');
    root.style.setProperty('--w', W);
    let html = '<div class="cal__head"><span></span>' + Array.from({ length: W }, (_, i) => `<span>${esc(t('cal.week'))} ${i + 1}</span>`).join('') + '</div>';
    [0, 1, 2].forEach((lane) => {
      html += `<div class="cal__lane"><span class="cal__k">${esc(t('cal.lane.' + lane))}</span>`;
      window.CALENDAR.filter((x) => x.lane === lane).forEach((x) => {
        html += `<button type="button" class="cal__it${cal.sel === x.id ? ' on' : ''}" data-id="${x.id}" data-kind="${x.id}" style="grid-column:${x.from + 1}/${x.to + 1}">${esc(t(`cal.${x.id}.t`))}</button>`;
      });
      html += '</div>';
    });
    root.innerHTML = html;
    root.querySelectorAll('.cal__it').forEach((b) => b.addEventListener('click', () => { cal.sel = b.dataset.id; renderCalendar(); }));
    const d = $('#calCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><p></p>`;
    d.querySelector('.kicker').textContent = t('cal.lane.' + window.CALENDAR.find((x) => x.id === cal.sel).lane);
    d.querySelector('h3').textContent = t(`cal.${cal.sel}.t`);
    d.querySelector('p').innerHTML = t(`cal.${cal.sel}.b`);
  }

  /* 05 — SemVer: вгадати цифру */
  const sv = {};
  function renderSemver() {
    const root = $('#semver');
    root.innerHTML = '';
    window.SEMVER.forEach((q) => {
      const row = document.createElement('div');
      row.className = 'sv__r' + (sv[q.id] ? (sv[q.id] === q.ans ? ' is-ok' : ' is-no') : '');
      row.innerHTML = `<span class="sv__q">${esc(t(`sv.${q.id}.q`))}</span><span class="sv__opts"></span><span class="sv__a"></span>`;
      ['major', 'minor', 'patch'].forEach((o) =>
        row.querySelector('.sv__opts').appendChild(btn('sv__o' + (sv[q.id] && o === q.ans ? ' is-ans' : ''), o.toUpperCase(), sv[q.id] === o, () => { sv[q.id] = o; renderSemver(); })));
      if (sv[q.id]) row.querySelector('.sv__a').innerHTML = `<b>${esc(t(sv[q.id] === q.ans ? 'sv.ok' : 'sv.no'))}</b> ${t(`sv.${q.id}.a`)}`;
      root.appendChild(row);
    });
  }

  /* 05 — стратегії: схема трафіку «користувачі → v1 / v2» */
  const st = { sel: 'canary', v: {} };
  const STEPS = [1, 5, 25, 50, 100];
  function renderStrategies() {
    const bar = $('#stBar');
    bar.innerHTML = '';
    window.STRATEGIES.forEach((s) =>
      bar.appendChild(btn('', esc(t(`st.${s.id}.name`)), st.sel === s.id, () => { st.sel = s.id; renderStrategies(); })));
    const s = window.STRATEGIES.find((x) => x.id === st.sel);
    const idx = st.v[s.id] != null ? st.v[s.id] : (s.def || 0);
    const bg = st.v.bluegreen || 0;
    let share = s.slider ? STEPS[idx] : s.id === 'ab' ? 50 : bg ? 100 : 0;
    const viz = $('#stViz');
    const servers = s.id === 'rolling'
      ? `<div class="st__srv">${Array.from({ length: 8 }, (_, i) => `<span class="${i < Math.round(share / 100 * 8) ? 'is-new' : ''}">${i < Math.round(share / 100 * 8) ? 'v2' : 'v1'}</span>`).join('')}</div>` : '';
    if (s.id === 'rolling') share = Math.round(share / 100 * 8) / 8 * 100;
    const v1 = 100 - share;
    viz.innerHTML = `
      <div class="st__users">${esc(t('st.users'))}</div>
      <div class="st__split">
        <div class="st__lane"><span class="st__k">${esc(t(s.id === 'ab' ? 'st.a' : s.id === 'flags' ? 'st.off' : s.id === 'bluegreen' ? 'st.blue' : 'st.v1'))}</span>
          <div class="st__bar"><i style="width:${v1}%"></i></div><b>${Math.round(v1)}%</b></div>
        <div class="st__lane st__lane--new"><span class="st__k">${esc(t(s.id === 'ab' ? 'st.b' : s.id === 'flags' ? 'st.on' : s.id === 'bluegreen' ? 'st.green' : 'st.v2'))}</span>
          <div class="st__bar"><i style="width:${share}%"></i></div><b>${Math.round(share)}%</b></div>
      </div>
      ${servers}
      <div class="st__ctl"></div>`;
    const ctl = viz.querySelector('.st__ctl');
    if (s.slider) {
      ctl.innerHTML = `<span class="st__k">${esc(t(`st.${s.id}.slider`))}</span>`;
      STEPS.forEach((p, i) => ctl.appendChild(btn('st__step', p + '%', i === idx, () => { st.v[s.id] = i; renderStrategies(); })));
    } else if (s.id === 'bluegreen') {
      ctl.appendChild(btn('st__step', esc(t(bg ? 'st.bluegreen.back' : 'st.bluegreen.switch')), false, () => { st.v.bluegreen = bg ? 0 : 1; renderStrategies(); }));
    } else {
      ctl.innerHTML = `<span class="st__k">${esc(t('st.ab.hint'))}</span>`;
    }
    const d = $('#stCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3><p></p>` + dl(['when', 'risk'], { dt: 'st.dt.', dd: `st.${s.id}.` });
    d.querySelector('.kicker').textContent = t('st.kicker');
    d.querySelector('h3').textContent = t(`st.${s.id}.name`);
    d.querySelector('p').innerHTML = t(`st.${s.id}.b`);
  }

  /* 06 — тестування й шлях до Go/No-Go */
  const ready = { sel: 'rrr' };
  function renderReady() {
    $('#levels').innerHTML = window.TEST_LEVELS.map((id) => `<li><b>${esc(t(`tl.${id}.t`))}</b> ${t(`tl.${id}.b`)}</li>`).join('');
    $('#types').innerHTML = window.TEST_TYPES.map((id) => `<li><b>${esc(t(`tt.${id}.t`))}</b> ${t(`tt.${id}.b`)}</li>`).join('');
    const bar = $('#readyBar');
    bar.innerHTML = '';
    const R = window.READY;
    R.forEach((id, i) => {
      const b = btn('ro' + (i < R.indexOf(ready.sel) ? ' is-done' : ''), `<i>${String(i + 1).padStart(2, '0')}</i><b></b>`, ready.sel === id, () => { ready.sel = id; renderReady(); });
      b.querySelector('b').textContent = t(`ready.${id}.t`);
      bar.appendChild(b);
    });
    const d = $('#readyCard');
    d.innerHTML = `<span class="kicker"></span><h3></h3>` + dl(['do', 'gate'], { dt: 'ready.dt.', dd: `ready.${ready.sel}.` });
    d.querySelector('.kicker').textContent = `${t('ready.kicker')} ${R.indexOf(ready.sel) + 1} / ${R.length}`;
    d.querySelector('h3').textContent = t(`ready.${ready.sel}.t`);
  }

  /* 08 — карта документів за етапом */
  const docs = { sel: 'before' };
  function renderDocs() {
    const bar = $('#docBar');
    bar.innerHTML = '';
    Object.keys(window.DOCS).forEach((k) =>
      bar.appendChild(btn('', esc(t('doc.stage.' + k)), docs.sel === k, () => { docs.sel = k; renderDocs(); })));
    $('#docList').innerHTML = window.DOCS[docs.sel].map((id) =>
      `<div class="card doc"><span class="kicker">${esc(t('doc.' + id + '.who'))}</span><h3>${esc(t('doc.' + id + '.t'))}</h3><p>${t('doc.' + id + '.b')}</p></div>`).join('');
  }

  /* 09 — DORA */
  function renderDora() {
    const card = (id) => `<div class="card metric"><h3>${esc(t(`dora.${id}.t`))}</h3><p class="m__what">${t(`dora.${id}.b`)}</p><p class="m__trap"><b>${esc(t('dora.trap'))}</b> ${t(`dora.${id}.trap`)}</p></div>`;
    $('#doraT').innerHTML = window.DORA.throughput.map(card).join('');
    $('#doraI').innerHTML = window.DORA.instability.map(card).join('');
  }

  /* 10 — кейси */
  function renderCases() {
    $('#caseList').innerHTML = window.CASES.map((id) => `<div class="card case">
      <div class="case__top"><span class="mode" data-mode="${t(`case.${id}.mode`) === t('case.mode.fail') ? 'act' : 'recommend'}">${esc(t(`case.${id}.mode`))}</span><span class="single">${esc(t(`case.${id}.year`))}</span></div>
      <h3>${esc(t(`case.${id}.t`))}</h3><p class="case__b">${t(`case.${id}.b`)}</p>
      <p class="case__l"><b>${esc(t('case.lesson'))}</b> ${t(`case.${id}.l`)}</p></div>`).join('');
  }

  /* 11 — діяльність і інструменти */
  function renderWork() {
    $('#activity').innerHTML = window.ACTIVITY.map((id) => `<div class="card card--soft"><h3>${esc(t(`act.${id}.t`))}</h3><p>${t(`act.${id}.b`)}</p></div>`).join('');
    $('#tools').innerHTML = window.TOOLS.map((id) => `<div class="tools__r"><b>${esc(t(`tool.${id}.t`))}</b><span>${t(`tool.${id}.b`)}</span><span class="tools__ex">${esc(t(`tool.${id}.ex`))}</span></div>`).join('');
  }

  /* 12 — глосарій */
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

  window.ReleaseSections = {
    mount() {
      $('#glossSearch').addEventListener('input', (e) => { gloss.q = e.target.value; renderGloss(); });
    },
    render() {
      renderRvd(); renderLifecycles(); renderApproaches(); renderRoles(); renderCalendar(); renderSemver();
      renderStrategies(); renderReady(); renderDocs(); renderDora(); renderCases(); renderWork(); renderGloss();
    },
  };
})();
