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
    { g: 3, n: '26', f: '26-competencies.html',        t: t('Компетенції PM: PMBOK 7 і 8', 'PM competencies: PMBOK 7 vs 8') },
    { g: 3, n: '27', f: '27-risk-lecture.html',        t: t('Лекція: управління ризиками', 'Lecture: risk management') },
    { g: 3, n: '14d', f: '14d-pmbok8-focus.html',       t: 'PMBOK 8 Focus View' },
    { g: 4, n: '24', f: '24-dwh.html',                 t: t('Дані та керування ними', 'Data and its governance') },
    { g: 4, n: '19', f: '19-oss-bss.html',             t: t('OSS і BSS', 'OSS and BSS') },
    { g: 4, n: '20', f: '20-agentic-ai.html',          t: t('Агентний AI поверх OSS/BSS', 'Agentic AI on OSS/BSS') },
    { g: 4, n: '21', f: '21-support-chat.html',        t: t('Чат-бот підтримки', 'Support chatbot') },
    { g: 4, n: '22', f: '22-support-voice.html',       t: t('Голосовий бот', 'Voice bot') },
    { g: 4, n: '23', f: '23-release.html',             t: t('Робота з релізом', 'Working with releases') },
    { g: 4, n: '28', f: '28-pci-dss.html',             t: t('PCI DSS очима PM', 'PCI DSS through a PM’s eyes') },
    { g: 4, n: '31', f: '31-collatz.html',             t: t('Задача 3n+1', 'The 3n+1 problem') },
    { g: 4, n: '32', f: '32-french-past.html',         t: t('Минулий час у французькій', 'Past tenses in French') },
    { g: 4, n: '33', f: '33-three-body.html',          t: t('Задача трьох тіл', 'The three-body problem') },
    // 34 тимчасово приховано з меню
    // { g: 4, n: '34', f: '34-interstellar.html',        t: t('Фізика «Інтерстеллара»', 'The physics of Interstellar') },
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

  /* Широка бічна панель (як у каталогах компонентів): групи з підзаголовками, повні назви,
     крапка «нове» біля трьох останніх статей. Поки що — на сторінках трьох останніх статей. */
  var NEWEST = ['32-french-past.html', '33-three-body.html', '34-interstellar.html'];
  var WIDE = NEWEST.indexOf(here) >= 0;
  var GROUPS = { 1: t('Профіль', 'Profile'), 2: t('Як я веду доставку', 'How I run delivery'), 3: t('На чому це стоїть', 'Foundations'), 4: t('Статті й приклади', 'Articles and examples') };
  if (WIDE) document.body.classList.add('rail-wide');

  var rail = document.createElement('nav');
  rail.className = 'railnav' + (WIDE ? ' wide' : '');
  rail.setAttribute('aria-label', t('Модулі портфоліо', 'Portfolio sections'));

  function item(href, label, inner, cls) {
    var a = document.createElement('a');
    a.href = href; a.className = cls || '';
    a.setAttribute('aria-label', label);
    a.innerHTML = inner + '<span class="tip">' + label + '</span>';
    if (href === here) { a.classList.add('on'); a.setAttribute('aria-current', 'page'); }
    return a;
  }

  if (WIDE) { var brand = document.createElement('a'); brand.href = 'index.html'; brand.className = 'rw-brand';
    brand.innerHTML = '<span class="rw-mark"></span>' + t('Портфоліо', 'Portfolio'); rail.appendChild(brand); }
  rail.appendChild(item('index.html', t('Усі розділи', 'All sections'),
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<rect x="2.5" y="2.5" width="6" height="6" rx="1.4"/><rect x="11.5" y="2.5" width="6" height="6" rx="1.4"/>' +
    '<rect x="2.5" y="11.5" width="6" height="6" rx="1.4"/><rect x="11.5" y="11.5" width="6" height="6" rx="1.4"/></svg>',
    'home'));

  var prev = 0, prev2 = 0;
  MODULES.forEach(function (m) {
    if (prev && m.g !== prev && !WIDE) {
      var hr = document.createElement('span'); hr.className = 'sep'; rail.appendChild(hr);
    }
    prev = m.g;
    if (WIDE && m.g !== prev2) { var gh = document.createElement('span'); gh.className = 'rw-group'; gh.textContent = GROUPS[m.g] || ''; rail.appendChild(gh); }
    prev2 = m.g;
    var a = item(m.f, m.t, '<span class="nm">' + m.n + '</span>' + (WIDE ? '<span class="rw-t">' + m.t + '</span>' + (NEWEST.indexOf(m.f) >= 0 ? '<i class="rw-new" aria-label="' + t('нове', 'new') + '"></i>' : '') : ''));
    if (m.ext) { a.target = '_blank'; a.rel = 'noopener'; }
    rail.appendChild(a);
  });

  /* Попап із назвою: один плаваючий елемент поверх сторінки. Підказка всередині
     рейки обрізалась її власною прокруткою (overflow), тому виносимо назовні. */
  var pop = document.createElement('div');
  pop.className = 'railpop';
  document.body.appendChild(pop);
  function showPop(a) {
    if (WIDE && innerWidth > 1080) return;
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

  /* «Відгортання» (peel): широке меню лежить ПІД сторінкою. Курсор біля лівого краю —
     сторінка відгортається, як наклейка, і відкриває меню; відвели курсор — лягає назад.
     Клавіатура: фокус у меню теж відгортає. На вузьких екранах — звичайна нижня смуга. */
  if (WIDE) {
    /* Згин не рівна лінія: край сторінки вигинається хвилею навколо курсора, ніби простір
       прогинається біля маленької чорної діри. x(y) = база + A·exp(−((y−yc)/σ)²)·(1 + хвилька). */
    var NS = 'http://www.w3.org/2000/svg', page = document.querySelector('.page');
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'peel-svg'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<defs><linearGradient id="pgF" x1="0" x2="1"><stop offset="0" stop-color="#cfd2d8"/><stop offset=".45" stop-color="#f4f5f7"/><stop offset=".8" stop-color="#fbfbfc"/><stop offset="1" stop-color="#e2e4e8"/></linearGradient>' +
      '<filter id="pgS" x="-50%" y="-5%" width="200%" height="110%"><feDropShadow dx="-8" dy="0" stdDeviation="9" flood-color="#14181d" flood-opacity=".22"/></filter></defs>' +
      '<path class="pf" fill="url(#pgF)" filter="url(#pgS)"/>';
    var flapP = svg.querySelector('path'), tab = document.createElement('div');
    tab.className = 'peel-tab'; tab.setAttribute('aria-hidden', 'true'); tab.innerHTML = '<span>' + t('меню', 'menu') + '</span>';
    document.body.appendChild(svg); document.body.appendChild(tab);
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, MENU = 272;
    var open = false, base = 0, amp = 0, cy = innerHeight / 2, ty = cy, t0 = performance.now(), raf = 0, timer = 0;
    function edge(y, tt) { var d = (y - cy) / 150, g = Math.exp(-d * d); return base + amp * g * (1 + .18 * Math.sin(d * 5 - tt * 3)); }
    function draw(now) {
      var tt = (now - t0) / 1000, tgtB = open ? MENU : 0, tgtA = open ? 46 : 0, k = reduce ? 1 : .16;
      base += (tgtB - base) * k; amp += (tgtA - amp) * k * .8; cy += (ty - cy) * .2;
      var H = innerHeight, pts = [], y;
      for (y = -20; y <= H + 20; y += 12) pts.push([edge(y, tt), y]);
      // сторінка: відрізаємо зліва по кривій (координати path — від верху .page)
      var top = page.getBoundingClientRect().top, ph = page.scrollHeight;
      var d = 'M ' + Math.max(0, pts[0][0]).toFixed(1) + ' 0 L ' + pts[0][0].toFixed(1) + ' ' + (pts[0][1] - top).toFixed(1);
      pts.forEach(function (p) { d += ' L ' + p[0].toFixed(1) + ' ' + (p[1] - top).toFixed(1); });
      d += ' L ' + base.toFixed(1) + ' ' + ph + ' L 99999 ' + ph + ' L 99999 0 Z';
      page.style.clipPath = base < .5 ? '' : 'path("' + d + '")';
      // загнутий край — зворотний бік паперу вздовж тієї ж кривої, ширший там, де вигин
      if (base < .5) flapP.setAttribute('d', ''); else {
        var f = 'M ' + pts[0][0] + ' ' + pts[0][1], back = [];
        pts.forEach(function (p) { f += ' L ' + p[0].toFixed(1) + ' ' + p[1]; var w = 14 + (p[0] - base) * .45; back.push([p[0] - w, p[1]]); });
        back.reverse().forEach(function (p) { f += ' L ' + p[0].toFixed(1) + ' ' + p[1]; });
        flapP.setAttribute('d', f + ' Z'); }
      var moving = Math.abs(tgtB - base) > .3 || Math.abs(tgtA - amp) > .3 || (open && !reduce);
      raf = moving ? requestAnimationFrame(draw) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    function set(v) { if (innerWidth <= 1080) v = false; if (v === open) return; open = v; document.body.classList.toggle('peeled', v); kick(); }
    document.addEventListener('pointermove', function (e) {
      if (innerWidth <= 1080) return; ty = e.clientY;
      if (e.clientX < 22) { clearTimeout(timer); set(true); }
      else if (open && e.clientX > MENU + 70) { clearTimeout(timer); timer = setTimeout(function () { set(false); }, 220); }
      if (open) kick();
    });
    document.addEventListener('pointerleave', function () { set(false); });
    rail.addEventListener('focusin', function () { set(true); });
    rail.addEventListener('focusout', function (e) { if (!rail.contains(e.relatedTarget)) set(false); });
    tab.addEventListener('pointerenter', function () { set(true); });
    addEventListener('scroll', function () { if (open) kick(); }, { passive: true });
  }
})();
