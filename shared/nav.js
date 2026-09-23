/* Рейка модулей. Список живёт здесь одним массивом: добавляется страница —
   правится одна строка, а не разметка в каждом файле. */
(function () {
  /* Схеми 13/14/14a англійські й перемикача не мають, але рейка на них спільна:
     мову беремо з вибору користувача, збереженого lang.js. */
  var stored = null; try { stored = localStorage.getItem('pmp-lang'); } catch (e) {}
  var EN = (window.PMP_LANG || stored) === 'en';
  function t(uk, en) { return EN ? en : uk; }

  /* Чотири групи: профіль → як я веду доставку → на чому це стоїть → приклади.
     У рейці — номер розділу, повна назва в підказці. */
  var MODULES = [
    { g: 1, n: '18', f: '18-cv.html',                  t: 'CV' },
    { g: 2, n: '13', f: '13-delivery-framework.html',  t: 'Delivery Framework' },
    { g: 2, n: '16a', f: '16a-portfolio-accounts.html', t: t('Портфель і акаунти', 'Portfolio and accounts') },
    { g: 2, n: '16', f: '16-jira-dashboard.html',      t: t('Jira-дашборд', 'Jira dashboard') },
    { g: 2, n: '15', f: '15-outsourcing-product.html', t: t('Аутсорс і продукт', 'Outsourcing and product') },
    { g: 3, n: '26', f: '26-competencies.html',        t: t('Компетенції PM', 'PM competencies') },
    { g: 3, n: '26b', f: '26b-competencies-pmbok8.html', t: t('Компетенції PM: PMBOK 7 і 8', 'PM competencies: PMBOK 7 vs 8') },
    { g: 3, n: '27', f: '27-risk-lecture.html',        t: t('Лекція: управління ризиками', 'Lecture: risk management') },
    { g: 3, n: '14d', f: '14d-pmbok8-focus.html',       t: 'PMBOK 8 Focus View' },
    { g: 4, n: '24', f: '24-dwh.html',                 t: t('Дані та керування ними', 'Data and its governance') },
    { g: 4, n: '19', f: '19-oss-bss.html',             t: t('OSS і BSS', 'OSS and BSS') },
    { g: 4, n: '20', f: '20-agentic-ai.html',          t: t('Агентний AI поверх OSS/BSS', 'Agentic AI on OSS/BSS') },
    { g: 4, n: '21', f: '21-support-chat.html',        t: t('Чат-бот підтримки', 'Support chatbot') },
    { g: 4, n: '22', f: '22-support-voice.html',       t: t('Голосовий бот', 'Voice bot') },
    { g: 4, n: '23', f: '23-release.html',             t: t('Робота з релізом', 'Working with releases') },
    { g: 4, n: '17', f: '17-ai.html',                  t: 'AI slop helper' },
    { g: 4, n: '25', f: 'https://artemzh.github.io/Be_like_Sheldon/', t: t('Be like Sheldon · відкриті дані', 'Be like Sheldon · open data'), ext: true }
  ];
  /* 14a/14b/14c у рейці немає — це розрізи Process Map; на них світиться PM. */
  var PARENT = { '14a-pmbok8-overview.html': '14d-pmbok8-focus.html',
                 '14b-pmbok8-flow.html': '14d-pmbok8-focus.html',
                 '14c-pmbok8-stack.html': '14d-pmbok8-focus.html',
                 '14-pmbok8-map.html': '14d-pmbok8-focus.html' };

  var here = location.pathname.split('/').pop() || 'index.html';
  if (PARENT[here]) here = PARENT[here];

  var rail = document.createElement('nav');
  rail.className = 'railnav';
  rail.setAttribute('aria-label', t('Модулі портфоліо', 'Portfolio sections'));

  function item(href, label, inner, cls) {
    var a = document.createElement('a');
    a.href = href; a.className = cls || '';
    a.setAttribute('aria-label', label);
    a.innerHTML = inner + '<span class="tip">' + label + '</span>';
    if (href === here) { a.classList.add('on'); a.setAttribute('aria-current', 'page'); }
    return a;
  }

  rail.appendChild(item('index.html', t('Усі розділи', 'All sections'),
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<rect x="2.5" y="2.5" width="6" height="6" rx="1.4"/><rect x="11.5" y="2.5" width="6" height="6" rx="1.4"/>' +
    '<rect x="2.5" y="11.5" width="6" height="6" rx="1.4"/><rect x="11.5" y="11.5" width="6" height="6" rx="1.4"/></svg>',
    'home'));

  var prev = 0;
  MODULES.forEach(function (m) {
    if (prev && m.g !== prev) {
      var hr = document.createElement('span'); hr.className = 'sep'; rail.appendChild(hr);
    }
    prev = m.g;
    var a = item(m.f, m.t, '<span class="nm">' + m.n + '</span>');
    if (m.ext) { a.target = '_blank'; a.rel = 'noopener'; }
    rail.appendChild(a);
  });

  /* Попап із назвою: один плаваючий елемент поверх сторінки. Підказка всередині
     рейки обрізалась її власною прокруткою (overflow), тому виносимо назовні. */
  var pop = document.createElement('div');
  pop.className = 'railpop';
  document.body.appendChild(pop);
  function showPop(a) {
    var tip = a.querySelector('.tip'); if (!tip) return;
    pop.textContent = tip.textContent;
    var r = a.getBoundingClientRect(), bottom = getComputedStyle(rail).flexDirection === 'row';
    pop.classList.add('on');
    if (bottom) {
      pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.left + r.width / 2 - pop.offsetWidth / 2)) + 'px';
      pop.style.top = (r.top - pop.offsetHeight - 8) + 'px';
    } else {
      pop.style.left = (r.right + 10) + 'px';
      pop.style.top = (r.top + r.height / 2 - pop.offsetHeight / 2) + 'px';
    }
  }
  function hidePop() { pop.classList.remove('on'); }
  rail.addEventListener('mouseover', function (e) { var a = e.target.closest('a'); if (a) showPop(a); });
  rail.addEventListener('mouseout', function (e) { var a = e.target.closest('a'); if (a && !a.contains(e.relatedTarget)) hidePop(); });
  rail.addEventListener('focusin', function (e) { var a = e.target.closest('a'); if (a) showPop(a); });
  rail.addEventListener('focusout', hidePop);
  rail.addEventListener('scroll', hidePop);

  /* Перемикач мови живе внизу рейки; lang.js міг створити його раніше в шапці. */
  var sw = document.querySelector('.langsw');
  /* Сторінка одномовна: перемикач лишається на місці, але сірий і неактивний. */
  if (!sw) {
    var cur = (document.documentElement.lang || 'en').slice(0, 2);
    sw = document.createElement('div');
    sw.className = 'langsw off';
    sw.setAttribute('aria-disabled', 'true');
    sw.title = t('Ця сторінка лише однією мовою', 'This page is available in one language only');
    ['uk', 'en'].forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.disabled = true; b.textContent = l.toUpperCase();
      if (l === cur) b.className = 'on';
      sw.appendChild(b);
    });
  }
  if (sw) { var s2 = document.createElement('span'); s2.className = 'sep'; rail.appendChild(s2); rail.appendChild(sw); }

  document.body.appendChild(rail);
})();
