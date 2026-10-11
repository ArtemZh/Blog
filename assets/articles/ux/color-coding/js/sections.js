/* Розділи статті без полотна. Рендери ідемпотентні — їх викликають знову
   при зміні мови. Розмітка в текстах (<b>, виноски) приходить лише з copy.js. */
(function () {
  const t = (k) => window.I18N.t(k);
  const has = (k) => t(k) !== k;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const btn = (html, on, click) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = on ? 'on' : '';
    b.innerHTML = html; b.addEventListener('click', click);
    return b;
  };
  /* Картки з copy: <p>.k — надрядок, .t — заголовок, .b — текст, .l — висновок. */
  const cards = (sel, p, ids, cls) => {
    $(sel).innerHTML = ids.map((id) => `<div class="card ${cls || 'card--soft'}">` +
      (has(`${p}.${id}.k`) ? `<span class="kicker">${esc(t(`${p}.${id}.k`))}</span>` : '') +
      (has(`${p}.${id}.n`) ? `<div class="stat"><b>${esc(t(`${p}.${id}.n`))}</b>` +
        (has(`${p}.${id}.ns`) ? `<span>${esc(t(`${p}.${id}.ns`))}</span>` : '') + '</div>' : '') +
      `<h3>${esc(t(`${p}.${id}.t`))}</h3><p>${t(`${p}.${id}.b`)}</p>` +
      (has(`${p}.${id}.l`) ? `<p class="case__l"><b>${esc(t('oth.lesson'))}</b> ${t(`${p}.${id}.l`)}</p>` : '') +
      '</div>').join('');
  };

  /* Проста таблиця: heads — підписи колонок, rows — масив рядків із готових клітинок.
     На вузькому екрані заголовок ховається, тому клітинка з data-l несе свій підпис сама. */
  const table = (sel, heads, rows) => {
    $(sel).innerHTML = `<div class="tb__h">${heads.map((h) => `<span>${esc(h)}</span>`).join('')}</div>` +
      rows.map((cells) => `<div class="tb__r">${cells.join('')}</div>`).join('');
  };
  const cell = (label, html) => `<span data-l="${esc(label)}">${html}</span>`;

  /* 04 — три оцінки частки людей */
  function renderShare() {
    $('#shareTable').innerHTML = `<div class="tb__h"><span>${esc(t('share.h.who'))}</span><span>${esc(t('share.h.what'))}</span></div>` +
      window.SHARE.map((id) => `<div class="tb__r"><b>${esc(t(`share.${id}.who`))}</b><span>${t(`share.${id}.what`)}</span></div>`).join('');
  }

  /* 05 — відстані між ролями: ті самі пари, два оформлення */
  const dist = { skin: 'calm' };
  const color = (key, skin) => (key.startsWith('p:') ? window.COLORS.people[key.slice(2)] : window.COLORS[skin][key]);
  const verdict = (n) => (n < 10 ? 'same' : n < 20 ? 'near' : n <= 40 ? 'mid' : 'far');
  function renderDist() {
    const bar = $('#distBar');
    bar.innerHTML = '';
    ['sky', 'calm'].forEach((s) => bar.appendChild(btn(esc(t('dist.skin.' + s)), dist.skin === s, () => { dist.skin = s; renderDist(); })));
    $('#dist').innerHTML = `<div class="dist__h"><span>${esc(t('dist.h.pair'))}</span><span></span><span>${esc(t('dist.h.de'))}</span><span></span></div>` +
      window.DIST.map((d) => {
        const n = d[dist.skin], v = verdict(n);
        return `<div class="dist__r" data-v="${v}"><span class="dist__p"><i class="sw" style="background:${color(d.a, dist.skin)}"></i>` +
          `<i class="sw" style="background:${color(d.b, dist.skin)}"></i>${esc(t('dist.' + d.id))}</span>` +
          `<span class="dist__bar"><i style="width:${Math.min(100, Math.round(n / 1.2))}%"></i></span>` +
          `<b>${n}</b><span class="dist__v">${esc(t('dist.v.' + v))}</span></div>`;
      }).join('');
    $('#distSum').innerHTML = t('dist.sum.' + dist.skin);
  }

  /* 05 — конфлікти й місця з єдиним носієм */
  function renderConflicts() {
    $('#confTable').innerHTML = `<div class="tb__h"><span>№</span><span>${esc(t('conf.h.what'))}</span><span>${esc(t('conf.h.why'))}</span></div>` +
      window.CONFLICTS.map((id) => `<div class="tb__r"><i>${esc(id.toUpperCase().replace('K', 'К'))}</i><b>${t(`conf.${id}.what`)}</b><span>${t(`conf.${id}.why`)}</span></div>`).join('');
    $('#soleTable').innerHTML = `<div class="tb__h"><span>${esc(t('sole.h.place'))}</span><span>${esc(t('sole.h.else'))}</span><span></span></div>` +
      window.SOLE.map((x) => `<div class="tb__r"><b>${esc(t(`sole.${x.id}.t`))}</b><span>${t(`sole.${x.id}.b`)}</span>` +
        `<em class="tag${x.ok ? ' tag--ok' : ''}">${esc(t(x.ok ? 'sole.ok' : 'sole.bad'))}</em></div>`).join('');
  }

  /* 05 і 08 — питання з варіантами: перемикач, картка «як є», таблиця варіантів
     із плюсами й мінусами. Вердикту немає — лише варіанти.
     cfg: bar, card, tbl — куди малювати; p — префікс ключів; ids — перелік питань;
     list(id) — варіанти питання; mark(id, i) — позначка варіанта в першій колонці. */
  function variants(cfg) {
    const draw = () => {
      const bar = $(cfg.bar);
      bar.innerHTML = '';
      cfg.ids.forEach((id) => bar.appendChild(btn(esc(t(`${cfg.p}.${id}.name`)), cfg.sel === id, () => { cfg.sel = id; draw(); })));
      $(cfg.card).innerHTML = `<h3>${esc(t(`${cfg.p}.${cfg.sel}.t`))}</h3><p>${t(`${cfg.p}.${cfg.sel}.b`)}</p>`;
      $(cfg.tbl).innerHTML = `<div class="tb__h"><span></span><span>${esc(t('ui.variant'))}</span><span>${esc(t('ui.plus'))}</span><span>${esc(t('ui.minus'))}</span></div>` +
        cfg.list(cfg.sel).map((v, i) => { const p = `${cfg.p}.${cfg.sel}.${v}.`;
          return `<div class="tb__r"><i>${esc(cfg.mark(cfg.sel, i))}</i><b>${t(p + 't')}</b>` +
            `<span data-l="${esc(t('ui.plus'))}">${t(p + 'plus')}</span><span data-l="${esc(t('ui.minus'))}">${t(p + 'minus')}</span></div>`; }).join('');
    };
    return draw;
  }
  const renderQuestions = variants({ bar: '#qBar', card: '#qCard', tbl: '#qTable', p: 'q', sel: 'q1',
    ids: Object.keys(window.QUESTIONS), list: (id) => window.QUESTIONS[id], mark: (id, i) => 'АБВГД'[i] });
  const renderVariants = variants({ bar: '#vBar', card: '#vCard', tbl: '#vTable', p: 'v', sel: 'hd',
    ids: Object.keys(window.VARIANTS), list: (id) => window.VARIANTS[id].list, mark: (id, i) => window.VARIANTS[id].mark + (i + 1) });

  /* 07 — порядок кнопок у діалозі за джерелами; три схожі контроли */
  function renderButtons() {
    table('#okTable', [t('ok.h.who'), t('ok.h.where'), t('ok.h.order')],
      window.OK_ORDER.map((id) => [`<b>${t(`ok.${id}.who`)}</b>`, cell(t('ok.h.where'), t(`ok.${id}.where`)), cell(t('ok.h.order'), t(`ok.${id}.order`))]));
    table('#ctlTable', [t('ctl.h.what'), t('ctl.h.for'), t('ctl.h.lim')],
      window.CONTROLS.map((id) => [`<b>${t(`ctl.${id}.what`)}</b>`, cell(t('ctl.h.for'), t(`ctl.${id}.for`)), cell(t('ctl.h.lim'), t(`ctl.${id}.lim`))]));
  }

  /* 08 — знахідки, розмір цілей, місця «скасувати / повторити» */
  function renderLayout() {
    table('#findTable', ['№', t('find.h.what'), t('find.h.why')],
      window.FINDINGS.map((id, i) => [`<i>${i + 1}</i>`, `<b>${t(`find.${id}.what`)}</b>`, `<span>${t(`find.${id}.why`)}</span>`]));
    // позначка читається словом: «проходить» і «за відстанню» — тихі, решта — темні
    table('#sizeTable', [t('sz.h.place'), t('sz.h.size'), ''],
      window.TARGETS.map((x) => [`<b>${esc(t(`sz.${x.id}.t`))}</b>`, `<span>${t(`sz.${x.id}.b`)}</span>`,
        `<em class="tag${x.v === 'ok' || x.v === 'dist' ? ' tag--ok' : ''}">${esc(t('sz.v.' + x.v))}</em>`]));
    table('#undoTable', [t('un.h.tab'), t('un.h.where')],
      window.UNDO_PLACES.map((id) => [`<b>${esc(t(`un.${id}.tab`))}</b>`, `<span>${esc(t(`un.${id}.where`))}</span>`]));
  }

  /* 10, 11 — чекліст із двох частин (номери наскрізні) і джерела */
  function renderLists() {
    $('#checkList').innerHTML = window.CHECK.map((g) => `<h3 class="sub">${esc(t('chk.g.' + g.id))}</h3>` +
      `<ol class="check" start="${g.from}" style="counter-reset:c ${g.from - 1}">` +
      Array.from({ length: g.to - g.from + 1 }, (_, i) => `<li>${t('chk.' + (g.from + i))}</li>`).join('') + '</ol>').join('');
    $('#srcList').innerHTML = window.SOURCES.map((s) => `<li id="src-${s.id}">${esc(s.by)}. ` +
      `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` +
      (s.note ? ` <span class="srcs__n">${esc(t('src.note.' + s.note))}</span>` : '') + '</li>').join('');
  }

  window.ColorSections = {
    render() {
      cards('#jobList', 'job', window.JOBS);
      cards('#countList', 'cnt', window.COUNTS);
      cards('#wcagList', 'wcag', window.WCAG);
      cards('#dupList', 'dup', window.DUP);
      cards('#prList', 'pr', window.PRINCIPLES);
      cards('#exList', 'ex', window.EXAMPLES, 'metric');
      cards('#barList', 'bar', window.BAR_COUNTS);
      cards('#sizeList', 'size', window.SIZES);
      cards('#nList', 'n', window.NUMBERS);
      cards('#dngList', 'dng', window.DANGER);
      cards('#goodList', 'good', window.GOOD, 'metric');
      cards('#othList', 'oth', window.OTHERS, 'case');
      renderShare(); renderDist(); renderConflicts(); renderQuestions();
      renderButtons(); renderLayout(); renderVariants(); renderLists();
    },
  };
})();
