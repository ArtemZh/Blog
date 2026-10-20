/* Стаття 36 «Скіл „інтерактивна стаття“»: конвеєр (покроковий прохід), анатомія розділу з живою сценою (тяжіння двох зір; клік — третє тіло),
   ролі, картки «помилка → правило», чекліст перевірки. Без WebGL і без даних ззовні. */
(function () {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  /* ═════ 02: конвеєр ═════ */
  (function () {
    const s = $('sk-line'); if (!s) return;
    const ST = [
      ['Тема і «22»', 'Власник', 'Тема одним реченням і команда «22» — лише план.', 'PLAN-NN.md з нумерованими питаннями', '«Рецесія в США за 5 років… зроби розширений ресерч 22»'],
      ['Попередня стаття', 'Claude', 'Вивчити будову, модулі й стилі останньої сторінки — нова має бути її сестрою.', 'список блоків, які перевикористати', 'Для 35 взято каркас, підказки й карту з 34.'],
      ['Дослідження', 'Claude', 'Розширений пошук кількома запитами одночасно. Кожне число — значення, дата, першоджерело.', 'таблиця індикаторів зі статусом джерела', 'Substack-цифри позначено «звірити», у текст не пішли без перевірки.'],
      ['План і «11»', 'Власник', 'Розділи, по одній сцені на розділ, відкриті питання. Без «11» код не чіпаємо.', 'затверджений план', 'Відповіді «1 так 2 так 11» — і робота йде до кінця без смикання.'],
      ['Дані', 'Claude', 'Знімок рядів у файл із датою (FRED CSV) або справжні формули для фізики.', 'shared/&lt;p&gt;-data.js', 'Перегляди BEA прибрали дві «технічні рецесії» — це стало сюжетом.'],
      ['Картинки', 'ChatGPT', 'Банер 21:9 з тихою лівою частиною під заголовок і 2–3 вставки. Без тексту, логотипів і облич.', 'assets/&lt;p&gt;/*.jpg', 'Підпис «згенеровано ChatGPT» власник попросив прибрати.'],
      ['Збірка', 'Claude', 'Банер, легенда, розділи «текст → сцена → примітка», карта, джерела. Кожна сцена відповідає на клік.', 'NN-page.html + shared/&lt;p&gt;-*.js', '«Не очевидно» → до розділу 07 додано ролик.'],
      ['Ролик і звук', 'Claude · Suno', 'Ролик із розділами пояснює неочевидне; звук — один перемикач, вимкнений за замовчуванням.', 'плеєр + тема + ефекти', 'Клацання в петлі звуку діри — переписано на безшовне коло.'],
      ['Правка текстів', 'Gemini', 'Тексти блоками з мітками; правки беремо вибірково, факти звіряємо.', 'відредаговані абзаци', 'Gemini «виправив» ставку ФРС — помилково; зауваження відхилено з поясненням.'],
      ['Перевірка і «пуш»', 'Claude · Власник', 'Синтаксис, консоль, карта, знімки в Chrome і на 375 px. Публікація — лише за словом «пуш».', 'посилання на GitHub Pages', 'Сторінка спершу схована: її немає в меню, лише пряме посилання.']];
    const box = el('div', 'sk-line');
    box.innerHTML = `<div class="sk-line__rail">${ST.map((x, i) => `<button type="button" class="sk-st" data-i="${i}"><i>${i + 1}</i><span>${x[0]}</span><small>${x[1]}</small></button>`).join('')}<b class="sk-tok"></b></div>
      <div class="sk-line__card"></div><div class="sk-line__bar"><button type="button" class="rc-btn" data-play>▶ провести статтю</button></div>`;
    s.appendChild(box);
    const btns = [...box.querySelectorAll('.sk-st')], card = box.querySelector('.sk-line__card'), tok = box.querySelector('.sk-tok'), play = box.querySelector('[data-play]');
    let cur = 0, timer = 0;
    function show(i) { cur = i; btns.forEach((b, j) => { b.classList.toggle('on', j === i); b.classList.toggle('done', j < i); });
      const [t, who, what, out, ex] = ST[i], b = btns[i], r = b.getBoundingClientRect(), pr = box.querySelector('.sk-line__rail').getBoundingClientRect();
      tok.style.left = (r.left - pr.left + r.width / 2) + 'px'; tok.style.top = (r.top - pr.top + 16) + 'px';
      card.innerHTML = `<div class="h"><i>${i + 1}</i><b>${t}</b><span>${who}</span></div><p>${what}</p><div class="kv"><span>на виході</span><b>${out}</b></div><div class="kv ex"><span>з попередніх статей</span><b>${ex}</b></div>`;
      card.classList.remove('in'); void card.offsetWidth; card.classList.add('in'); }
    btns.forEach((b) => b.addEventListener('click', () => { stop(); show(+b.dataset.i); }));
    function stop() { clearInterval(timer); timer = 0; play.classList.remove('on'); play.textContent = '▶ провести статтю'; }
    play.addEventListener('click', () => { if (timer) { stop(); return; } play.classList.add('on'); play.textContent = '❚❚ пауза'; let i = cur >= ST.length - 1 ? 0 : cur; show(i);
      timer = setInterval(() => { i++; if (i >= ST.length) { stop(); return; } show(i); }, REDUCE ? 900 : 2600); });
    addEventListener('resize', () => show(cur)); requestAnimationFrame(() => show(0));
  })();

  /* ═════ 03: анатомія розділу — макет розділу з живою сценою ═════ */
  (function () {
    const s = $('sk-anatomy'); if (!s) return;
    const box = el('div', 'sk-an');
    box.innerHTML = `<div class="sk-an__mock">
        <div class="sk-an__part" data-k="t"><em>текст</em><h4>02 · Дві зорі</h4><p>Дві зорі обертаються навколо спільного центру мас. Додайте третє тіло — і порядок зникає.</p></div>
        <div class="sk-an__part" data-k="s"><em>сцена</em><canvas aria-label="Дві зорі й тіла, що додаються кліком"></canvas><div class="sk-an__hud">тіл: <b>2</b> · клік — додати</div></div>
        <div class="sk-an__part" data-k="n"><em>примітка</em><p><b>Насправді.</b> Загального розв'язку задачі трьох тіл у формулах немає — лише окремі випадки й чисельний розрахунок.</p></div></div>
      <div class="sk-an__why"><p data-k="t"><b>Текст</b> — 2–4 речення: що відбувається і що спробувати. Деталі — у примітці або картці по кліку.</p>
        <p data-k="s"><b>Сцена</b> — модель, а не картинка: тут кожен крок рахується за законом тяжіння (інтегрування leapfrog). Клік додає тіло — сцена відповідає дією.</p>
        <p data-k="n"><b>Примітка</b> — одне з п'яти уточнень: «Насправді», «Важливо», «Висновок», «Не плутати», «Цікавий факт».</p></div>`;
    s.appendChild(box);
    const parts = [...box.querySelectorAll('.sk-an__part')], whys = [...box.querySelectorAll('.sk-an__why p')];
    const hl = (k) => { parts.forEach((p) => p.classList.toggle('on', p.dataset.k === k)); whys.forEach((p) => p.classList.toggle('on', p.dataset.k === k)); };
    parts.forEach((p) => p.addEventListener('mouseenter', () => hl(p.dataset.k))); whys.forEach((p) => p.addEventListener('mouseenter', () => hl(p.dataset.k)));
    const cv = box.querySelector('canvas'), hud = box.querySelector('.sk-an__hud b'), x = cv.getContext('2d');
    let W = 1, H = 1; const B = [];
    function reset() { B.length = 0; B.push({ x: -.5, y: 0, vx: 0, vy: -.62, m: 1, c: '#ffb27a', tr: [] }, { x: .5, y: 0, vx: 0, vy: .62, m: 1, c: '#9fc3ff', tr: [] }); }
    reset();
    function size() { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = Math.round(W * d); cv.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0); }
    function step(h) { const a = B.map(() => [0, 0]);
      for (let i = 0; i < B.length; i++) for (let j = 0; j < B.length; j++) { if (i === j) continue; const dx = B[j].x - B[i].x, dy = B[j].y - B[i].y, r2 = dx * dx + dy * dy + .02, r = Math.sqrt(r2), f = B[j].m / (r2 * r) * .8; a[i][0] += dx * f; a[i][1] += dy * f; }
      B.forEach((b, i) => { b.vx += a[i][0] * h; b.vy += a[i][1] * h; }); B.forEach((b) => { b.x += b.vx * h; b.y += b.vy * h; }); }
    function draw() { x.fillStyle = 'rgba(7,10,18,.32)'; x.fillRect(0, 0, W, H); const sc = Math.min(W, H) * .32, cx = W / 2, cy = H / 2;
      B.forEach((b) => { const px = cx + b.x * sc, py = cy + b.y * sc; const g = x.createRadialGradient(px, py, 0, px, py, 10 + 6 * b.m); g.addColorStop(0, '#fff'); g.addColorStop(.3, b.c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, 10 + 6 * b.m, 0, 7); x.fill(); }); }
    let vis = false, raf = 0;
    function loop() { for (let k = 0; k < 6; k++) step(.004); if (B.some((b) => Math.hypot(b.x, b.y) > 6)) { B.splice(0, B.length, ...B.filter((b) => Math.hypot(b.x, b.y) < 6)); if (B.length < 2) reset(); hud.textContent = B.length; }
      draw(); raf = vis && !REDUCE ? requestAnimationFrame(loop) : 0; }
    cv.addEventListener('click', (e) => { const r = cv.getBoundingClientRect(), sc = Math.min(W, H) * .32; if (B.length >= 6) reset();
      B.push({ x: (e.clientX - r.left - W / 2) / sc, y: (e.clientY - r.top - H / 2) / sc, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, m: .5, c: '#9fe3b8', tr: [] }); hud.textContent = B.length; hl('s'); });
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); }, { threshold: .1 }).observe(cv);
    new ResizeObserver(() => { size(); x.fillStyle = '#070a12'; x.fillRect(0, 0, W, H); draw(); }).observe(cv);
  })();

  /* ═════ 04: ролі ═════ */
  (function () {
    const s = $('sk-roles'); if (!s) return;
    const R = [['Власник', 'команди 22 · 11 · пуш', 'Вирішує тему, затверджує план, приймає або відхиляє результат. Скіл не дає Claude діяти без цих слів.'],
      ['Claude', 'дослідження · код · перевірка', 'Пише план, збирає дані, будує сторінку, звіряє факти, перевіряє. Не публікує без «пуш» і не запускає субагентів без команди.'],
      ['ChatGPT', 'банер і вставки', 'Малює ілюстрації за промптом зі скіла. Картинки — атмосфера, не дані: графіки й сцени малює код.'],
      ['Gemini', 'стиль текстів', 'Править мову блоками з мітками. Його «зауваження до фактів» — лише сигнал: кожне перевіряється, хибні відхиляються.'],
      ['Tripo · Blender', '3D-моделі', 'Чотири види з ChatGPT → модель у Tripo (лише за командою) → чистка в Blender → GLB для сторінки.'],
      ['Suno', 'музика', 'Тема статті: мінор, фортепіано, струнні — як просив власник. Ефекти синтезуються в браузері.'],
      ['Першоджерела', 'цифри', 'FRED, BLS, BEA, ФРС, наукові статті. Агрегатори й блоги — лише підказка, куди дивитися.']];
    const box = el('div', 'sk-roles'); box.innerHTML = R.map(([n, s2, d], i) => `<button type="button" class="sk-role" data-i="${i}"><b>${n}</b><span>${s2}</span><p>${d}</p></button>`).join('');
    s.appendChild(box); box.addEventListener('click', (e) => { const b = e.target.closest('.sk-role'); if (!b) return; const o = b.classList.contains('open'); box.querySelectorAll('.sk-role').forEach((z) => z.classList.remove('open')); if (!o) b.classList.add('open'); });
  })();

  /* ═════ 05: помилка → правило (картки-перевертні) ═════ */
  (function () {
    const s = $('sk-rules'); if (!s) return;
    const C = [['«Не бачу, що бігунки щось роблять»', 'Бігунок сам гойдається один раз, коли піднявся на третину екрана; кнопки «▶» світяться до першого кліку.'],
      ['«Ролик вішає сторінку»', 'Один цикл анімації на сцену; новий кадр — лише якщо попередній не запланований.'],
      ['«Пастка» в кожному розділі', 'П\'ять назв приміток: Насправді, Важливо, Висновок, Не плутати, Цікавий факт.'],
      ['Підпис «згенеровано ChatGPT»', 'Ілюстрації без підпису; в джерелах — «власні згенеровані ілюстрації».'],
      ['Gemini загубив факти', 'Тексти — блоками з мітками; правки вибірково; рядок «факти звірено».'],
      ['Звук клацає в петлі', 'Кінець треку перетікає в початок за кілька секунд; синтез — без меж буфера.'],
      ['Старий код у браузері', 'Мітка ?v= оновлюється при кожній правці файлу.'],
      ['Скріншот у застосунку порожній', 'Стан — скриптом, вигляд — у Chrome; перед знімком — миттєвий скрол.']];
    const box = el('div', 'sk-rules'); box.innerHTML = C.map(([a, b]) => `<button type="button" class="sk-flip"><span class="f"><em>помилка</em>${a}</span><span class="b"><em>правило</em>${b}</span></button>`).join('');
    s.appendChild(box); box.addEventListener('click', (e) => { const b = e.target.closest('.sk-flip'); if (b) b.classList.toggle('on'); });
  })();

  /* ═════ 06: чекліст перевірки ═════ */
  (function () {
    const s = $('sk-check'); if (!s) return;
    const K = [['node --check', 'синтаксис кожного зміненого JS', 'коментар, що «з\'їв» рядок; апостроф у лапках'], ['консоль без помилок', 'read_console_messages', 'забуту змінну, мертвий модуль'],
      ['COMP.check()', 'карта: накладання, лінії під картками', 'картку, що наїхала на іншу'], ['стан сцени скриптом', 'пікселі канваса, лічильники модуля', 'анімацію, яка «не стартувала»'],
      ['знімок у Chrome', 'десктопна ширина', 'перекриття, обрізані підписи'], ['375 px', 'scrollWidth = ширина вікна', 'горизонтальний скрол на телефоні']];
    const box = el('div', 'sk-check'); box.innerHTML = K.map(([a, b, c], i) => `<label class="sk-ck"><input type="checkbox"><b>${i + 1}. ${a}</b><span>${b}</span><em>ловить: ${c}</em></label>`).join('') + '<div class="sk-ck__sum"></div>';
    s.appendChild(box); const sum = box.querySelector('.sk-ck__sum');
    const upd = () => { const n = box.querySelectorAll('input:checked').length; sum.textContent = n === K.length ? 'Готово до «пуш» — але публікує лише власник.' : `${n} з ${K.length}`; };
    box.addEventListener('change', upd); upd();
  })();
})();
