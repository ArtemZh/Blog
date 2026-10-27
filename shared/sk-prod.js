/* Стаття 36, розділ 01 «Виробництво»: скролітелінг зйомок статті 35 «Рецесія в США».
   Ліворуч — липке вікно браузера з мініатюрою 35, що збирається шарами (знімки assets/skill/prod/stage-N.webp — реконструкція,
   ship-pipeline/prod-36/layers.mjs); праворуч — крок на екран прокрутки: хто працює, що хотіли, що пішло не так, яке правило з’явилось.
   Цифри етапів — із журналу сесії 20.10.2026 (ship-pipeline/prod-36/extract.py → data.json). Ворота «22», «11», «пуш» — справжні фрагменти сесії: повідомлення власника і рядки журналу інструментів, що пішли одразу після нього.
   Блок «під капотом» на кожному етапі — інструменти, файли, команди з того самого журналу (час київський, UTC+3; ship-pipeline/prod-36/stage-tools). */
(function () {
  const slot = document.getElementById('sk-prod'); if (!slot) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.SK_SND) SK_SND.fx(k, a); };
  const IMG = (n) => `assets/skill/prod/stage-${n}.webp`;

  // Шкала: етапи й ворота (g — шлагбаум)
  const TICKS = [['Тема'], ['22', 'g'], ['Ресерч'], ['План'], ['11', 'g'], ['Дані'], ['Кадри'], ['Збірка'], ['Тест'], ['Правки'], ['Ролик'], ['Мітки'], ['пуш', 'g'], ['Прокат']];
  const STAGE_NAMES = ['каркас', 'план', 'банер', 'текст', 'сцени й графіки', 'ролик і звук', 'помітки походження', 'готова сторінка'];

  // Кроки. t — індекс на шкалі, img — шар сторінки 35, n — цифри етапу з журналу (повідомлення · правки · час · ще одна цифра)
  const S = [
    { t: 0, img: 1, h: 'Тема одним реченням',
      tech: { tools: '1 × Bash', files: ['PLAN-34-interstellar.md — читає', '34-interstellar.html — читає'], cmd: 'grep -n "<section\\|<h2\\|<script" 34-interstellar.html', note: 'перш ніж планувати — як зроблена попередня сторінка' }, who: ['власник'],
      want: 'Нова сторінка «в такому ж вигляді», як 33 і 34. Тема — рецесія в США за п’ять років: загрози, індикатори, розширений ресерч.',
      wrong: 'Поки нічого. Головне — щоб Claude не кинувся одразу писати код.',
      fix: 'Тема й «22» прийшли одним повідомленням.', rule: 'Спершу план, код — після «11».',
      q: 'нова сторінка в такому ж вигляді… розширений великий ресерч', n: ['1 повідомлення', '0 правок', '< 1 хв'] },
    { t: 1, gate: '22', img: 1, cap: 'зелене світло',
      log: { at: '18:57:05', msg: 'тепер нова сторінка в такому ж вигляді, проаналізуй, як ми то робили, і нова тема — Рецесія в США за останні 5 років 22 … зроби розширений великий ресерч 22',
        L: [['18:57:12', 'WebSearch', 'US recession risk October 2026 economy indicators'], ['18:57:12', 'WebSearch', 'Sahm rule unemployment rate September 2026'], ['18:57:14', 'WebSearch', 'yield curve inversion 2022 2024 longest un-inversion recession signal'], ['18:57:15', 'Bash', 'head -60 PLAN-34-interstellar.md  # як зроблена 34'],['18:57–18:58', 'WebSearch × 28', 'BLS, FOMC, GDPNow, Kalshi, ISM, NY Fed…'], ['19:00:36', 'Write', 'PLAN-35-us-recession.md'], ['19:00:39', 'SendUserFile', 'план → власнику']],
        foot: 'Edit / Write у коді сторінки — 0. Далі — 13 хв тиші: власник читає план.' }, txt: '<b>Лише план.</b> Власник вирішує, чи варта тема зйомок. Claude може шукати й писати план, але код не чіпає.', n: '«22» у сесії 35 — 1 раз' },
    { t: 2, img: 1, h: 'Дослідження',
      tech: { tools: '31 × WebSearch · 1 × Write', files: ['PLAN-35-us-recession.md'], cmd: 'WebSearch «BLS benchmark revision 911,000 jobs 2025 payrolls overstated»', note: '31 запит за 80 с, пачками по 4–6 паралельно' }, who: ['Claude'],
      want: 'Зібрати свіжі цифри: ВВП, ринок праці, ставки, нафта, мита, прогнози рецесії.',
      wrong: 'Частина цифр знайшлась лише в другорядних джерелах — наприклад, CAPE близько 40 і «74 % зростання від ШІ».',
      fix: 'Такі числа позначено «звірити» і в текст без першоджерела не пущено.', rule: 'Кожне число — значення, дата, першоджерело.',
      n: ['0 повідомлень', '0 правок', '4 хв', '31 пошуковий запит'] },
    { t: 3, img: 2, h: 'План: 9 питань одним списком',
      tech: { tools: '0 викликів', files: ['PLAN-35-us-recession.md · частина D — 9 питань'], note: '13 хв — читає власник; Claude нічого не робить' }, who: ['Claude', 'власник'],
      want: 'План на 11 розділів і рішення, без яких не можна починати: назва, головна сцена, 3D, музика, тексти, чи ховати сторінку.',
      wrong: 'У 34 питання розтягувались на всю зйомку — і кожне ставало окремою правкою.',
      fix: 'Усі 9 питань — наприкінці плану, з варіантами. Власник відповів одним рядком.', rule: 'Питання — нумеровані, разом, до «11».',
      q: 'якщо треба картинки — то згенеруй у ЖПТ. 11', n: ['1 повідомлення', '1 правка · процес', '13 хв', '9 питань'] },
    { t: 4, gate: '11', img: 2, cap: 'мотор',
      log: { at: '19:14:00', msg: 'якщо треба картинки, то згенеруй в жпт 11',
        L: [['19:14:07', 'Bash', 'sed -n 1,60p 34-interstellar.html  # каркас-зразок'], ['19:14:15', 'Bash', 'curl "fredgraph.csv?id=$s&cosd=2019-01-01"  # 13 рядів'], ['19:15:21', 'Chrome', 'navigate → chatgpt.com  # банер'], ['19:15:30', 'Bash', 'pbcopy < p1.txt  # промпт у буфер'], ['19:16:04', 'Bash', 'python3 → shared/rc-data.js'], ['19:17:59', 'Write', '35-us-recession.html']],
        foot: 'Через 7 с після «11» — перший виклик; за 10 хв — 4 файли й 3 картинки паралельно.' }, txt: '<b>Виконуємо план до кінця.</b> Власник затверджує обсяг; далі — без смикання після кожного етапу. Звіт один, наприкінці.', n: '«11» у сесії 35 — 2 рази' },
    { t: 5, img: 2, h: 'Дані',
      tech: { tools: '9 × Bash', files: ['shared/rc-data.js · 7 рядків, місячні середні 2019-01…2026-10'], cmd: 'for s in UNRATE SAHMREALTIME CPIAUCSL CPILFESL FEDFUNDS DFEDTARU T10Y2Y DCOILWTICO UMCSENT ICSA MORTGAGE30US A191RL1Q225SBEA PAYEMS; do\n  curl -s -o $s.csv "https://fred.stlouisfed.org/graph/fredgraph.csv?id=$s&cosd=2019-01-01"\ndone', note: '+ T10Y3M і ряди з 1999 (PAYEMS, INDPRO, W875RX1, CMRMTSPL) для п’яти епізодів' }, who: ['Claude'],
      want: 'Знімок рядів FRED на 20.10.2026 у файл — графіки малює код, не ШІ.',
      wrong: 'Після переглядів BEA ВВП за I квартал 2022 і 2025 вже не мінусовий — «технічні рецесії» зі старих новин у даних не сходяться.',
      fix: 'Розбіжність не сховали, а зробили сюжетом розділу «Хто вирішує, що це рецесія».', rule: 'Дані — знімок із датою, не «живий» запит.',
      n: ['0 повідомлень', '0 правок', '2 хв'] },
    { t: 6, img: 3, h: 'Картинки',
      tech: { tools: '36 викликів · Claude in Chrome', files: ['assets/recession/banner.jpg', 'strait.jpg', 'street.jpg'], cmd: 'pbcopy < p1.txt  # промпт → Cmd+V → Enter у chatgpt.com\nsips -s format jpeg -s formatOptions 82 ~/Downloads/rc-banner.png --out banner.jpg', note: 'поки малюється — Write 35-us-recession.html і recession.css' }, who: ['ChatGPT', 'Claude'],
      want: 'Банер і дві вставки — протока з танкерами й вулиця. Поки ChatGPT малює, Claude пише код.',
      wrong: 'Ще в 33 під ілюстрацією з’явився підпис «згенеровано ChatGPT» — власник попросив прибрати.',
      fix: 'Ілюстрації — без підписів, логотипів, облич і тексту.', rule: 'Про генерацію — один рядок у джерелах, не під кожною картинкою.',
      n: ['0 повідомлень', '0 правок', '9 хв паралельно', '3 картинки'] },
    { t: 7, img: 4, h: 'Збірка сторінки',
      tech: { tools: 'Write × 4 · Bash × 3', files: ['35-us-recession.html · 214 рядків', 'shared/rc-viz.js · 414', 'shared/recession.css · 194', 'shared/rc-ai3d.js · 85 (three.js)'], cmd: "re.sub(r\"(?<=[А-Яа-яІіЇїЄєҐґ])'\", '’', s)  # апостроф у слові ламав JS-рядок\nnode --check rc-viz.js", note: 'синтаксис перевірено до першого перегляду' }, who: ['Claude'],
      want: 'Каркас 34: банер, вступ, розділи «текст → сцена → примітка», карта ризиків, джерела.',
      wrong: 'Квартальний графік ВВП розповзся, а в тексті були апострофи всередині слів, що ламають JS-рядки.',
      fix: 'Розкладку виправлено, апострофи замінено, синтаксис перевірено до першого перегляду.', rule: 'Типографський апостроф ’ у текстах, node --check після кожного файлу.',
      n: ['0 повідомлень', '0 правок', '8 хв', '4 файли'] },
    { t: 8, img: 5, h: 'Перевірка: сцени й графіки',
      tech: { tools: '12 × browser_batch · 7 × Bash · resize 375 · console', files: ['shared/rc-viz.js', 'shared/rc-ai3d.js'], cmd: "new THREE.Fog(0x070a12, 18, 46) → new THREE.Fog(0x070a12, 30, 80)  # вежа надто близько\nif (p.note && w > 640)  # примітки панелей ховаються на телефоні", note: 'ставку й спред розведено на дві панелі; масштаб ICSA виправлено' }, who: ['Claude', 'headless Chrome'],
      want: 'Пройти сторінку в Chrome: консоль, кожна сцена, ширина телефона.',
      wrong: 'Ставка й крива дохідності на одній панелі не читались, масштаб заявок на допомогу з’їдав графік, 3D-вежа стояла надто близько.',
      fix: 'Сім самовиправлень до того, як сторінку побачив власник.', rule: 'Перевірка — від найдешевшої: синтаксис, консоль, знімки 1440 і 375 px.',
      n: ['0 повідомлень', '0 правок', '4 хв', '7 самовиправлень'] },
    { t: 9, img: 5, flop: 1, h: 'Провальний дубль: Gemini «виправив» факти',
      tech: { tools: 'Chrome · Gemini · Bash × 4', files: ['ship-pipeline/texts/ — 33 блоки з мітками [Bxx]', '35-gemini-out.txt', '35-pre-gemini.html — копія до злиття'], cmd: 'промпт: «Ти — редактор науково-популярного журналу українською мовою…»', note: 'злиття — python-скриптом, по блоках, вибірково' }, who: ['Gemini', 'Claude'],
      want: 'Gemini переписує 33 блоки тексту живіше. Власник погодив і тексти, і звук.',
      wrong: 'Разом зі стилем Gemini приніс три «зауваження до фактів» — усі хибні:',
      list: ['ставку ФРС 3,75–4,00 % назвав зниженням, а її 16.09.2026 підняли;', 'нафту по $150–200 при блокаді — здогадка без джерела;', 'капекс ШІ $650–730 млрд — «аномалія», хоча так у звітах компаній.'],
      fix: 'Звірка з першоджерелами відхилила всі три. Правки стилю взято вибірково: «правило Сама» не пройшло, лишилось «правило Сам».', rule: 'Gemini править стиль, не факти. У джерелах — рядок «факти звірено».',
      q: '1 так, 2 так. 11', n: ['1 повідомлення', '0 правок', '6 хв', '3 хибні зауваження відсіяно'] },
    { t: 9, img: 5, takes: 1, h: 'Дублі: чому в 35 лише три правки', who: ['власник', 'Claude'],
      lead: 'Бо найдорожчі дублі вже відзняли на 34. Чотири справжні пари з журналу сесії:',
      T: [['бігунки нерухомі, «▶» — звичайна кнопка', 'я просив всі кнопки плей підсвічувати', 'бігунок сам гойдається раз при появі, «▶» світиться до першого кліку', 'читач бачить, що сцену можна чіпати'],
        ['у кожному розділі — примітка «Пастка»', 'не подобається саме слово «пастка»', 'п’ять назв: Насправді, Важливо, Висновок, Не плутати, Цікавий факт', 'читача не ловлять, а підказують'],
        ['фоновий звук чорної діри клацає на стику', 'клац прибери — ідеальний луп має бути', 'кінець треку перетікає в початок за кілька секунд', 'петля не видає себе'],
        ['під картинкою — «згенеровано ChatGPT»', 'про ілюстрації «згенеровано» не пиши', 'без підпису; у джерелах — «власні згенеровані ілюстрації»', 'картинка не відволікає від тексту']],
      n: ['повтор правок у 34 — 6', 'у 35 — 0'] },
    { t: 10, img: 6, h: 'Ролик і звук',
      tech: { tools: 'Bash × 12 · Write × 1', files: ['Gant/src/view/about/promoScript.ts — читає', 'shared/rc-reel.js · 145 рядків', 'shared/rc-sound.js · 101 рядок, Web Audio'], cmd: 'grep -l "ролик" ~/.claude/projects/*/*.jsonl  # як робили ролик Ганта', note: 'ролик Ганта знайдено в журналі сесій і перенесено як схему' }, who: ['Claude', 'власник'],
      want: 'Розділ 07 «Економіка на одній нозі: ШІ» — 3D-вежа серверних стійок і діаграма.',
      wrong: 'Сцени гарні, але сюжет із них не складався.',
      fix: 'Поруч — ролик на 48 с із шістьма розділами, як трейлер Ганта. Плюс звук сторінки: синтез у браузері, за замовчуванням вимкнений.', rule: 'Неочевидне пояснює ролик із розділами, а не ще один абзац.',
      q: '07 якось не очевидно — зроби поряд ролик', n: ['1 повідомлення', '1 правка · вигляд', '4 хв', '3 дублі ролика'] },
    { t: 10, img: 6, film: 1, h: 'Трейлер: як знято ролик нагорі', who: ['Claude', 'голос Daniel'],
      lead: 'Нового ролика не знімали — ось як зроблено той, що нагорі цієї статті. Камери немає: кожен кадр — функція часу.',
      code: '<span>// кадр не має стану: той самий t — той самий кадр</span>\nfunction draw(t) {\n  const bar = Math.floor(t / 2); <span>// такт = 2 с, 120 уд/хв</span>\n  scene(sceneAt(bar), t);       <span>// склейки — лише на долях</span>\n}',
      tail: 'Голос — системний Daniel англійською (say -v Daniel), субтитри українською. Тому ролик можна відрендерити покадрово в MP4 — і кожен кадр збігається з тим, що в браузері.',
      n: ['120 уд/хв', 'такт 2 с', 'кадри — з версії 4'] },
    { t: 11, img: 7, h: 'Помітки походження', who: ['Claude'],
      want: 'Щоб читач бачив, де факт, а де думка автора.',
      wrong: 'У 34 правка стилю непомітно переписала зміст.',
      fix: 'Шість бейджів «факт · дискусійне · міф» на розділах і рядок «Текст відредаговано з допомогою Gemini, факти звірено».', rule: 'Кожен блок має помітку походження.',
      n: ['6 бейджів', 'рядок у джерелах'] },
    { t: 12, gate: 'пуш', img: 8, cap: 'прем’єра',
      log: { at: '19:35:04', msg: '07 … зроби поряд у вигляді ролика, як ти робив для ганта, потім пуш',
        L: [['19:38:10', 'git', 'add 35-us-recession.html assets/recession shared/rc-*.js shared/recession.css'], ['19:38:10', 'git', 'commit -m "35: стаття «Рецесія в США» (прихована)…"  → 6e17428'], ['19:38:11', 'git', 'push'], ['19:38', 'gh', 'until [ "$(gh api repos/ArtemZh/Blog/pages/builds/latest --jq \'.status+.commit[:7]\')" = "built6e17428" ]; do sleep 5; done'], ['19:38', 'curl', '-w "%{http_code}" …/Blog/35-us-recession.html  → 200']],
        foot: '10 файлів, +1160 рядків. Другий «пуш» о 19:48:57 («пуш і дай лінк») → fce0232, +493 рядки.' }, txt: '<b>Публікація — лише за цим словом.</b> Нова сторінка спершу схована: її немає в меню, відкривається тільки за прямим посиланням.', n: '«пуш» у сесії 35 — 2 рази' },
    { t: 12, img: 8, h: 'Після прем’єри',
      tech: { tools: 'WebFetch × 3 · Write × 2', files: ['shared/rc-fx.js · 91 рядок', 'shared/rc-ink.js · 52 рядки, шейдер'], cmd: 'WebFetch canvasui.dev/docs/components/{ascii-sweep,laser,ink-object}', note: 'ліцензію прочитано до коду; ідею переписано своїм кодом' }, who: ['власник', 'Claude'],
      want: 'Власник кинув посилання на бібліотеку ефектів: «десь заюзай для рецесії».',
      wrong: 'Ліцензія — MIT із Commons Clause, а компоненти — React на експериментальному API браузера.',
      fix: 'Ідеї (ASCII-хвиля по тексту, бочка нафти тушшю) переписано своїм кодом, у коментарях — звідки ідея.', rule: 'Чужий ефект не копіюємо — переписуємо й підписуємо.',
      q: 'пуш і дай лінк', n: ['2 повідомлення', '1 правка · вигляд', '4 хв'] },
    { t: 13, img: 8, client: 1, h: 'Той самий метод — для клієнта', who: ['Claude', 'власник'],
      lead: 'Метод не прив’язаний до статей. Тим самим конвеєром — «22», «11», «пуш», тексти з одного джерела, перевірки — знято презентацію для клієнта, курорту в Карпатах. Головне — що клієнт отримав на виході:',
      outs: [['показ у браузері', '17 екранів однією прокруткою: живий додаток гостя, застосунок персоналу, мапа, дашборди — кожен можна натиснути'], ['PPTX для клієнта', '17 слайдів, 435 написів — кожен правиться в PowerPoint, як звичайний текст, без нас']],
      map: [['«22» → план', 'спека клієнта не редагується; план збірки — лише технічні рішення'], ['тексти', 'один файл copy.md → ~690 ключів; розмітка лише з ключів, пропущений ключ світиться червоним'], ['перевірка', 'жодного червоного ключа на сторінці; знімки екранів, а не «на око»'], ['правило з 35', 'демо-цифри не подаємо як факти — вони лише в прикладах'], ['HANDOFF', 'що працює, що змінилось, пастки, що далі — сесія може обірватися будь-коли']],
      n: ['17 слайдів', '435 написів', '~690 ключів'] },
  ];

  const esc = (s) => String(s);
  const nums = (a) => `<div class="skp-nums">${a.map((x) => { const m = String(x).match(/^([<\d«][^ ]*)(.*)$/); return m ? `<span><b>${m[1]}</b>${m[2]}</span>` : `<span>${x}</span>`; }).join('')}</div>`;
  function card(s) {
    if (s.gate) return `<div class="skp-gate"><div class="skp-log"><div class="skp-log__bar"><i></i><i></i><i></i><span>сесія Claude Code · 20.10.2026</span><b>«${s.gate}» · ${s.cap}</b></div>
      <div class="skp-log__msg"><em>власник · ${s.log.at}</em><p>${s.log.msg.replace(new RegExp('(' + s.gate + ')(?!.*' + s.gate + ')'), '<mark>$1</mark>')}</p></div>
      <ol class="skp-log__lines">${s.log.L.map(([t, k, d]) => `<li><time>${t}</time><b>${k}</b><code>${d.replace(/</g, '&lt;')}</code></li>`).join('')}</ol>
      <p class="skp-log__foot">${s.log.foot}</p></div><p>${s.txt}</p>${nums([s.n])}</div>`;
    let body = '';
    if (s.takes) body = `<p class="skp-lead">${s.lead}</p><div class="skp-takes">${s.T.map(([a, q, b, w]) => `<div class="skp-take"><div><em>до</em>${a}</div><div class="ask"><em>запит</em>«${q}»</div><div class="after"><em>після</em>${b}</div><p>${w}</p></div>`).join('')}</div>`;
    else if (s.film) body = `<p class="skp-lead">${s.lead}</p><div class="skp-film"><div class="skp-film__row">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<img src="assets/skill/prod/reel-${i}.webp" alt="" loading="lazy" width="640" height="360">`).join('')}</div></div>
      <div class="skp-beats" aria-hidden="true">${'<i></i>'.repeat(16)}</div><p class="skp-cap">16 доль по 0,5 с · тут кадр міняється що дві долі</p><pre class="skp-code">${s.code}</pre><p class="skp-lead">${s.tail}</p>`;
    else if (s.client) body = `<p class="skp-lead">${s.lead}</p><div class="skp-outs">${s.outs.map(([h, d]) => `<div><b>${h}</b><p>${d}</p></div>`).join('')}</div>
      <dl class="skp-kv skp-map">${s.map.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
    else body = `<dl class="skp-kv"><dt>що хотіли</dt><dd>${s.want}</dd><dt>що пішло не так</dt><dd>${s.wrong}${s.list ? `<ul class="skp-flop">${s.list.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}</dd>
      <dt>що змінили</dt><dd>${s.fix}</dd><dt>правило в скілі</dt><dd class="rule">${s.rule}</dd></dl>`;
    const q = s.q ? `<p class="skp-quote">«${esc(s.q)}»</p>` : (s.takes || s.film || s.client ? '' : '<p class="skp-quote skp-quote--none">реплік немає — етап пройшов без власника</p>');
    const tech = s.tech ? `<details class="skp-tech" open><summary>під капотом <span>${s.tech.tools}</span></summary>
      <ul>${s.tech.files.map((f) => `<li>${f}</li>`).join('')}</ul>${s.tech.cmd ? `<pre>${s.tech.cmd.replace(/</g, '&lt;')}</pre>` : ''}<p>${s.tech.note}</p></details>` : '';
    body += tech;
    return `<div class="skp-card${s.flop ? ' flop' : ''}"><div class="skp-card__h"><small>${TICKS[s.t][0]}${s.flop ? ' · дубль не вдався' : ''}</small><b>${s.h}</b></div>
      <div class="skp-who">${s.who.map((w) => `<span>${w}</span>`).join('')}</div>${body}${q}${nums(s.n)}</div>`;
  }

  const box = document.createElement('div'); box.className = 'skp';
  box.innerHTML = `<div class="skp-grid"><div class="skp-stick">
      <div class="skp-scale" role="tablist" aria-label="Етапи й ворота">${TICKS.map(([l, g], i) => `<button type="button" class="skp-tick${g ? ' gate' : ''}" data-t="${i}" title="${g ? 'ворота «' + l + '»' : l}"><span>${g ? '«' + l + '»' : l}</span><i></i></button>`).join('')}<b class="skp-scale__fill"></b></div>
      <div class="skp-win"><div class="skp-win__bar"><i></i><i></i><i></i><span>artemzh.github.io/Blog/35-us-recession.html</span></div>
        <div class="skp-shot">${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<img src="${IMG(n)}" alt="Сторінка 35 на етапі «${STAGE_NAMES[n - 1]}»" width="1000" height="1250"${n > 2 ? ' loading="lazy"' : ''}>`).join('')}<div class="skp-shot__tag"></div></div></div>
      <p class="skp-cap">Етапи сторінки відтворено, вимикаючи шари готової статті</p></div>
    <div class="skp-steps">${S.map((s, i) => `<section class="skp-step${s.gate ? ' gate' : ''}" data-i="${i}"><div class="skp-mini"><img src="${IMG(s.img)}" alt="" loading="lazy" width="1000" height="1250"></div>${card(s)}</section>`).join('')}</div></div>
    <p class="skp-cap">Цифри — з журналу сесії 20.10.2026: повідомлення власника, правки, час етапу. Етапи йшли внахлест — картинки малювались, поки писався код.</p>`;
  slot.appendChild(box);

  const steps = [...box.querySelectorAll('.skp-step')], ticks = [...box.querySelectorAll('.skp-tick')];
  const imgs = [...box.querySelectorAll('.skp-shot img')], tag = box.querySelector('.skp-shot__tag'), fill = box.querySelector('.skp-scale__fill');
  const scale = box.querySelector('.skp-scale');
  // Стрічка трейлера: доля — 0,5 с, кадр змінюється що дві долі; без анімації — статично
  let ft = 0, fb = 0;
  const fstep = S.findIndex((s) => s.film), fel = steps[fstep];
  const fimgs = fel ? [...fel.querySelectorAll('.skp-film__row img')] : [], beats = fel ? [...fel.querySelectorAll('.skp-beats i')] : [];
  function paintFilm() { fimgs.forEach((im, j) => im.classList.toggle('on', j === Math.floor(fb / 2) % 8)); beats.forEach((b, j) => b.classList.toggle('on', j === fb % 16)); }
  function film(on) {
    if (!fel) return;
    if (REDUCE) { fimgs.forEach((im) => im.classList.add('on')); return; }
    if (on && !ft) { ft = setInterval(() => { fb = (fb + 1) % 16; paintFilm(); }, 500); paintFilm(); }
    if (!on && ft) { clearInterval(ft); ft = 0; }
  }
  let cur = -1, curT = -1;
  function show(i) {
    if (i === cur) return; cur = i; const s = S[i];
    steps.forEach((el, j) => el.classList.toggle('on', j === i));
    imgs.forEach((im, j) => im.classList.toggle('on', j === s.img - 1));
    tag.innerHTML = `шар ${s.img}/8 · <b>${STAGE_NAMES[s.img - 1]}</b>`;
    ticks.forEach((t, j) => { t.classList.toggle('on', j === s.t); t.classList.toggle('done', j < s.t); });
    const tk = ticks[s.t], sr = scale.getBoundingClientRect(), r = tk.getBoundingClientRect();
    fill.style.width = sr.width ? ((r.left + r.width / 2 - sr.left) / sr.width * 100) + '%' : '0';
    if (s.t !== curT) { if (curT >= 0) SND(s.gate ? 'mark' : 'station', s.gate ? 'fact' : s.t); curT = s.t; }
    if (s.film) film(true); else film(false);
  }

  // Активний крок — той, що перетинає середину екрана
  const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) show(+e.target.dataset.i); }); }, { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach((el) => io.observe(el));
  show(0);

  // Клік по шкалі — до першого кроку цього етапу
  scale.addEventListener('click', (e) => { const b = e.target.closest('.skp-tick'); if (!b) return; const i = S.findIndex((s) => s.t === +b.dataset.t); if (i < 0) return;
    steps[i].scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' }); });

  document.addEventListener('visibilitychange', () => { if (document.hidden) film(false); else if (S[cur] && S[cur].film) film(true); });
})();
