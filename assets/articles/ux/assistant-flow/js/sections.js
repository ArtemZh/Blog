/* Розділи статті без полотна. Рендери ідемпотентні — їх викликають знову
   при зміні мови. Розмітка в текстах (<b>) приходить лише з copy.js. */
(function () {
  const t = (k) => window.I18N.t(k);
  const has = (k) => t(k) !== k;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Усі ключі, які просили рендери: check() звіряє їх зі словником. */
  const asked = new Set();
  const k = (key) => { asked.add(key); return t(key); };

  /* Картки з copy: .k — надрядок, .t — заголовок, .b — текст. */
  const cards = (sel, p, ids) => {
    $(sel).innerHTML = ids.map((id) => '<div class="card card--soft">' +
      (has(`${p}.${id}.k`) ? `<span class="kicker">${esc(k(`${p}.${id}.k`))}</span>` : '') +
      `<h3>${esc(k(`${p}.${id}.t`))}</h3><p>${k(`${p}.${id}.b`)}</p></div>`).join('');
  };

  /* Проста таблиця: heads — підписи колонок, rows — масив рядків із готових клітинок.
     На вузькому екрані заголовок ховається, тому клітинка з data-l несе свій підпис сама. */
  const table = (sel, heads, rows) => {
    $(sel).innerHTML = `<div class="tb__h">${heads.map((h) => `<span>${esc(h)}</span>`).join('')}</div>` +
      rows.map((cells) => `<div class="tb__r">${cells.join('')}</div>`).join('');
  };
  const cell = (label, html) => `<span data-l="${esc(label)}">${html}</span>`;
  /* Позначка словом і рамкою, не кольором: темна — рішення людини, тиха — решта. */
  const tag = (text, strong) => `<em class="tag${strong ? '' : ' tag--ok'}">${esc(text)}</em>`;

  /* 04 — кроки однієї зустрічі й п'ять пропозицій із неї */
  function renderMeeting() {
    $('#meetSteps').innerHTML = Array.from({ length: window.MEETING_STEPS }, (_, i) => `<li>${k('ms.' + (i + 1))}</li>`).join('');
    table('#propTable', [k('prop.h.kind'), k('prop.h.text'), k('prop.h.meta'), k('prop.h.src'), k('prop.h.level')],
      window.PROPOSALS.map((x) => [`<i>${esc(k(`prop.${x.id}.kind`))}</i>`, `<b>${k(`prop.${x.id}.text`)}</b>`,
        cell(k('prop.h.meta'), k(`prop.${x.id}.meta`)), cell(k('prop.h.src'), k(`prop.${x.id}.src`)), tag(k('lvl.' + x.level + '.name'), false)]));
  }

  /* 05 — питання, рішення, задача, ризик */
  function renderKinds() {
    table('#qdtTable', [k('kind.h.what'), k('kind.h.is'), k('kind.h.how'), k('kind.h.next')],
      window.KINDS.map((id) => [`<b>${esc(k(`kind.${id}.what`))}</b>`, cell(k('kind.h.is'), k(`kind.${id}.is`)),
        cell(k('kind.h.how'), k(`kind.${id}.how`)), cell(k('kind.h.next'), k(`kind.${id}.next`))]));
  }

  /* 06 — хто що може */
  function renderWho() {
    table('#whoTable', [k('who.h.act'), k('who.h.note'), ''],
      window.WHO.map((x) => [`<b>${k(`who.${x.id}.act`)}</b>`, cell(k('who.h.note'), k(`who.${x.id}.note`)), tag(k('who.v.' + x.v), x.v !== 'a')]));
  }

  /* 08 — драбина рівнів, режими документів, три «ніколи» */
  function renderAccess() {
    $('#ladder').innerHTML = window.LEVELS.map((id, i) => `<div class="ladder__r" style="--i:${i}">` +
      `<code>${esc(id)}</code><b>${esc(k(`lvl.${id}.name`))}</b>` +
      `<span>${k(`lvl.${id}.who`)}</span><span>${k(`lvl.${id}.when`)}</span></div>`).join('') +
      `<p class="ladder__dir"><span>${esc(k('lvl.dir.narrow'))}</span><span>${esc(k('lvl.dir.widen'))}</span></p>`;
    table('#modeTable', [k('mode.h.name'), k('mode.h.levels'), k('mode.h.in'), k('mode.h.never')],
      window.MODES.map((id) => [`<b>${esc(k(`mode.${id}.name`))}</b>`, cell(k('mode.h.levels'), k(`mode.${id}.levels`)),
        cell(k('mode.h.in'), k(`mode.${id}.in`)), cell(k('mode.h.never'), k(`mode.${id}.never`))]));
    cards('#neverList', 'never', window.NEVER);
  }

  /* 09, 10 — чого система не робить і що ще не зроблено */
  const pairs = (sel, p, ids, heads) => table(sel, heads, ids.map((id) => [`<b>${k(`${p}.${id}.t`)}</b>`, `<span>${k(`${p}.${id}.b`)}</span>`]));

  /* 11, 12 — словник і «звідки це відомо» */
  const gloss = (sel, ids) => { $(sel).innerHTML = ids.map((id) => `<div><b>${esc(k(`gl.${id}.t`))}</b><span>${k(`gl.${id}.b`)}</span></div>`).join(''); };

  window.FlowSections = {
    render() {
      cards('#stageList', 'stage', window.STAGES);
      cards('#ruleList', 'rule', window.RULES);
      renderMeeting(); renderKinds(); renderWho(); renderAccess();
      pairs('#notTable', 'not', window.NOTS, [k('not.h.what'), k('not.h.why')]);
      pairs('#openTable', 'open', window.OPEN, [k('open.h.what'), k('open.h.now')]);
      gloss('#glossPlan', window.GLOSS_PLAN); gloss('#glossAst', window.GLOSS_AST);
      $('#srcList').innerHTML = window.REFS.map((id) => `<li><b>${esc(k(`ref.${id}.t`))}</b> — ${k(`ref.${id}.b`)}</li>`).join('');
    },
    /* Повнота словника: ключі з розмітки (data-i18n*) і ключі, які просили рендери. */
    check() {
      const missing = [];
      document.querySelectorAll('[data-i18n],[data-i18n-html]').forEach((el) => {
        const key = el.dataset.i18n || el.dataset.i18nHtml;
        if (!has(key)) missing.push(key);
      });
      asked.forEach((key) => { if (!has(key)) missing.push(key); });
      return { keys: asked.size, missing };
    },
  };
})();
