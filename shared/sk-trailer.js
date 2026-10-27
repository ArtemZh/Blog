/* Стаття 36: трейлер v7 «Проліт крізь піксель». 152 с, 76 тактів по 2 с (120 уд/хв): основна частина 124 с + пост-кредит 28 с
   (план: PLAN-36-trailer-v7.md; база — сценарій ship-pipeline/trailer-v6-script.md). Правило таймінгу v7: сцена отримує стільки цілих
   тактів, скільки треба на її інформацію, решта зсувається. Сторінка завантажується у вікні браузера (загальний план) → наїзд на банер →
   макрозйомка LCD: один піксель #AB3D11 → код → стек виростає згори вниз, кран уздовж колони (фронтенд → протоколи → сервери → дані) →
   рукавиця: Claude і вісім каменів-агентів → наїзд у кожен камінь → панель агента → розщеплений екран → збирання сторінки → конфлікт →
   «Пуш.» → git push → крапковий глобус (Гдиня → п'ять міст) → телефон у руці → титр → пост-кредит у стилі Marvel: перешкоди глушать
   Джарвіса, ефір перехоплює голос «темного володаря», голограма в каптурі, голостіл із флотами (справжні 3D-моделі SW_TopDown, CC BY 4.0,
   three.js — shared/sk-trailer-sw.js), міна, вибух. До натискання ▶ — окремий кадр-постер drawPoster().
   Кадр — функція draw(t) без стану (випадковість — hash()). Склейки — на долях: м'який перехід 0,3 с або whip-pan; розмиття — лише як
   подія (rack focus у макро); стрибок яскравості між кадрами ≤ 6 %.
   Музика синтезується в SK_SND.trailer за партитурою AUD нижче; голос — jarvis-0N.m4a, jarvis-07c.m4a, emperor-07.m4a
   (англійською, субтитри українською; v7: ship-pipeline/trailer-v7-voice/make.mjs). */
(function () {
  const slot = document.getElementById('sk-trailer'); if (!slot) return;
  const ME = document.currentScript && document.currentScript.src;
  const RENDER = new URLSearchParams(location.search).get('reel') === 'render';
  const RM = !RENDER && !!window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.SK_SND) SK_SND.fx(k, a); };
  const MONO = '"Roboto Mono", ui-monospace, monospace', SANS = 'Inter, system-ui, sans-serif';
  const AMB = '255,170,90', ACT = '#E0532A';
  // такт: 120 уд/хв → 2 с. Межі актів (такти): Мережа 10–19 · рукавиця 19–22 · агенти 23–39 · збирання 39–43 · конфлікт 43–50 ·
  // Пуш 50–59 · титр 59–62 · пост-кредит 62–76
  const BAR = 2, B = (k) => BAR * k, OT = B(76), OM = B(62), OH = B(65), OF = B(71), OB = B(74);
  // v8: дані нижче записано в шкалі v7 (OT, OM… і B(такт v7)); Ms(t) переводить секунду v7 у секунду v8 (PLAN-36-trailer-v8.md):
  // нова сцена «Біти» (9–11), стек ×1,5 (11–17), нове місто «Інтернет» (17–22), агенти по такту, стиснуті конфлікт і пуш, пост-кредит −9 тактів
  const MAPB = [[0, 9, 0, 9], [9, 10, 9, 11], [10, 19, 11, 17], [19, 22, 22, 25], [22, 23, 25, 26], [23, 39, 26, 34], [39, 43, 34, 38], [43, 45.5, 38, 40.5],
    [45.5, 48, 40.5, 42], [48, 50, 42, 43], [50, 51, 43, 44], [51, 53, 44, 45], [53, 57, 45, 47], [57, 59, 47, 48.5], [59, 1e9, 48.5, 1e9 - 10.5]];
  const Ms = (t) => { const k = t / BAR; for (const [a, b, c, d] of MAPB) if (k < b) return B(c + (k - a) * (d - c) / (b - a)); return t; };
  let TOTAL = Ms(OT); const MAIN = Ms(OM), HOLO = Ms(OH), FLEET = Ms(OF), BOOM = Ms(OB);
  let DUR = `${Math.floor(TOTAL / 60)}:${String(Math.round(TOTAL % 60)).padStart(2, '0')}`;
  // акти на шкалі плеєра
  let SC = [{ t: 'Сторінка', a: 0, b: B(5) }, { t: 'Код', a: B(5), b: B(10) }, { t: 'Мережа', a: B(10), b: B(19) }, { t: 'Команда', a: B(19), b: B(43) },
    { t: 'Конфлікт', a: B(43), b: B(50) }, { t: 'Пуш', a: B(50), b: OM }, { t: 'Пост-кредит', a: OM, b: OT }];
  // репліки: [секунда, файл, тривалість с (afinfo), субтитр українською, хто, зсув субтитру від початку файлу] — голос англійською
  // (ship-pipeline/trailer-v6-voice/lines.txt; 7c і «темний володар» — ship-pipeline/trailer-v7-voice/make.mjs)
  const VO = [[.6, 'jarvis-01', 2.99, 'Гарна сторінка. Подивімося, з чого вона зроблена.'], [B(19) + .9, 'jarvis-02', 1.76, 'Збираю команду.'],
    [B(23), 'jarvis-03', 4.06, 'Двадцять два — лише план. Одинадцять — виконуємо.'], [B(43) + .4, 'jarvis-04', 4.10, 'Маємо проблему. Красиво написано. Можливо, неправда.'],
    [B(57) + 1.9, 'jarvis-05', 1.02, 'Опубліковано.'], [OM + 1.1, 'jarvis-06', 1.49, 'Наступна стаття?'],
    [OM + 4.6, 'jarvis-07c', 2.97, '…або, якщо не хочеш писати статтю —', 'ДЖАРВІС', .1], [OM + 7.7, 'emperor-07', 5.14, 'Переходь на темну сторону… Зіграй у гру…', 'ІМПЕРАТОР', .2],
    [OH + 7.0, 'emperor-08', 4.24, 'Виконати наказ шістдесят шість.', 'ІМПЕРАТОР', .2]];
  // субтитри: [початок, кінець, хто, репліка]; у 7c субтитр знімається на обриві сигналу (2,35 с), у «темного володаря» — після шепоту (4,6 с)
  const SUB_END = { 'jarvis-07c': 2.3, 'emperor-07': 4.65 };
  let SUBS = VO.map(([b, f, d, s, who, o]) => [b + (o == null ? .1 : o), b + (SUB_END[f] || d + .15), who || 'ДЖАРВІС', s]).concat([[B(51) + .05, B(51) + 1.5, 'ВЛАСНИК', 'Пуш.']]).sort((p, q) => p[0] - q[0]);
  // ── партитура для SK_SND.trailer: рівні шарів за секціями (0..1), удари, райзери, «Пуш» і пост-кредит ──
  //   drone — дрон, sub — сабсинус (за замовчуванням = drone), ost — остинато (o16 — шістнадцятими), drum — низькі барабани,
  //   gl — цифровий глітч, arp — «хакерське» арпеджіо, pad — «струнний» пед, open — відкриття фільтра дрона, cut — різка зміна (за 20 мс);
  //   «Пуш» (C-мажор): pa — арп запуску, pr — його ділення (8 · 16 · 32; кульмінація — на сторінці в телефоні), shep — висхідний
  //   shepard-тон, choir — хор-пед; пост-кредит: crk — тріск передавача, hiss — шипіння, hum — гул флотів
  const SEC = [[0, { drone: .45, sub: .5, gl: .12 }], [B(2), { drone: .7, ost: .35, gl: .25, pad: .3 }], [B(4), { drone: .55, ost: .25, gl: .2, pad: .25 }],
    [B(5), { drone: .7, ost: .45, gl: .35, arp: .25, pad: .35 }], [B(9), { drone: .6, ost: .3, gl: .3, arp: .15, pad: .3 }], [B(10), { drone: .7, ost: .45, gl: .5, arp: .4, drum: .3, pad: .4 }],
    [B(14.5), { drone: .75, ost: .5, gl: .45, arp: .35, drum: .4, open: .1, pad: .45 }], [B(19), { drone: .8, ost: .6, gl: .5, arp: .35, drum: .45, pad: .5 }], [B(22), { drone: .6, ost: .3, gl: .3, pad: .3 }],
    [B(23), { drone: .7, ost: .5, o16: true, gl: .6, arp: .35, drum: .5, pad: .5 }], [B(31), { drone: .75, ost: .6, o16: true, gl: .7, arp: .45, drum: .6, open: .1, pad: .55 }],
    [B(39), { drone: .8, ost: .7, o16: true, gl: .8, arp: .5, drum: .75, open: .2, pad: .6 }],
    [B(43), { drone: .5, sub: .7, gl: .08, cut: true }], [B(45.5), { drone: .45, sub: .55, gl: .3, ost: .12, pad: .25 }], [B(48), { drone: .7, ost: .55, gl: .4, drum: .4, arp: .3, pad: .5 }],
    [B(50), { drone: .28, sub: .35, cut: true }],
    [B(51), { drone: .5, sub: .85, pa: .75, pr: 8, drum: .55, gl: .2, open: .15, cut: true }], [B(53), { drone: .6, sub: .8, pa: .85, pr: 8, drum: .7, gl: .25, choir: .75, shep: .6, open: .25 }],
    [B(55), { drone: .65, sub: .8, pa: .9, pr: 16, drum: .85, gl: .3, choir: .85, shep: .75, open: .3 }], [B(57.5), { drone: .7, sub: .85, pa: 1, pr: 32, drum: 1, gl: .35, choir: 1, shep: .9, open: .4 }],
    [B(59), { drone: .3, sub: .35, arp: .12, pad: .35, cut: true }], [B(60), { drone: .18, sub: .2, arp: .06, pad: .18 }], [B(61), { drone: .12, sub: .12, gl: .1, pad: .08 }],
    [OM, { drone: .06, sub: .06, gl: .06 }], [OM + 2.6, { drone: 0, sub: 0, cut: true }],
    // перешкоди глушать Джарвіса (обрив на OH + 0,95) → ефір перехоплює «темний володар» (OH + 1,7) → «Order 66» (OH + 7,4) → збій на «Sixty-Six»
    [OH + .1, { crk: .3, hiss: .2 }], [OH + .95, { crk: .7, hiss: .55, cut: true }], [OH + 1.6, { crk: .25, hiss: .2, sub: .22, drone: .08 }],
    [OH + 6.6, { crk: .35, hiss: .3, sub: .15 }], [OH + 7.3, { crk: .5, hiss: .4, sub: .25, drone: .1 }], [OH + 9.1, { crk: .8, hiss: .6, sub: .3, cut: true }], [OH + 10.4, { crk: .25, hiss: .2, sub: .2, drone: .1 }],
    [OF, { hum: .7, sub: .35, drone: .14, crk: .12, hiss: .1 }], [OF + 3, { hum: .85, sub: .45, drone: .2, crk: .1, hiss: .1 }],
    [OB, { cut: true }], [OB + 2.5, { hum: 0, sub: 0 }]];
  // удари: «Мережа» — на прибутті камери до кожного рівня (u 4,8 · 7,8 · 10,8 · 13,8) і на виході; агенти — на кожному камені
  const HITS = [[B(2), 1], [B(4), .55], [B(5), .5], [B(9), .6], [B(10), .55], [B(10) + 4.8, .4], [B(10) + 7.8, .45], [B(10) + 10.8, .5], [B(10) + 13.8, .45], [B(10) + 16, .5],
    [B(19.5), .85], [B(22), .7], [B(23), 1], [B(25), .45], [B(27), .45], [B(29), .45], [B(31), .6], [B(33), .45], [B(35), .45], [B(37), .45],
    [B(39), .75], [B(40), .5], [B(41), .6], [B(43), 1], [B(48), .6], [B(51), 1.2], [B(53), .6], [B(57), .55], [B(59), 1.05], [OB, 1.35]];
  const RISERS = [[B(2), 1.6, .8], [B(5), 1.2, .5], [B(10), 1, .5], [B(19.5), 1.1, .7], [B(23), 1.6, .9], [B(39), 1.6, .8], [B(43), 2, .9], [B(59), 1.5, .8], [OB, 2.2, .55]];
  // лейтмотив (A C E D C B), дзвін: удар відкриття · команда вмикається · кода на титрі. У «Пуші» — окрема тема в C-мажорі (без лейтмотиву)
  const MOTIF = [[B(2), 0, 'bell', .45], [B(23), 0, 'bell', .5], [B(59), 0, 'bell', .4]];
  // міна: цокання, що пришвидшується (інтервал 0,5 → 0,06 с); той самий список засвічує її червоний індикатор
  const TICKS = []; for (let tt = OF + 2.6; tt < OB - .05;) { TICKS.push(tt); tt += lerp0(.5, .06, Math.pow((tt - OF - 2.6) / (OB - OF - 2.6), .7)); }
  function lerp0(a, b, k) { return a + (b - a) * Math.max(0, Math.min(1, k)); }
  const AUD = { end: OT, voice: VO.map(([b, k, d]) => [b, k, d]), sec: SEC, hits: HITS, risers: RISERS, motif: MOTIF, fast: B(23), push: [B(51), B(59)], cut: B(59), ticks: TICKS, vv: 8 };
  // тихі звуки сторінки (SK_SND.fx): [секунда, звук, аргумент]
  let FX = [[B(43) + .1, 'mark', 'redo'], [B(48) + .05, 'mark', 'fact'], [B(57) + 1.85, 'chime']];
  for (let i = 0; i < 18; i++) FX.push([B(7) + (3.42 + i * .12) / 1.5, 'key']);
  for (let i = 0; i < 20; i++) FX.push([B(51) + 1.1 + i * .08, 'key']);
  // ── v8: усе вище — у шкалі v7; переводимо в шкалу v8 (репліки й субтитри зберігають тривалість) ──
  SC.forEach((s) => { s.a = Ms(s.a); s.b = Ms(s.b); });
  VO.forEach((v) => { v[0] = Ms(v[0]); }); SUBS.forEach((s) => { const d = s[1] - s[0]; s[0] = Ms(s[0]); s[1] = s[0] + d; });
  [SEC, HITS, RISERS, MOTIF, FX].forEach((A) => A.forEach((e) => { e[0] = Ms(e[0]); })); TICKS.forEach((tt, i) => { TICKS[i] = Ms(tt); });
  // місто «Інтернет» (17–22): найвищий розгін перед рукавицею; удар — коли камера відлітає й видно місто, другий — на вулиці
  // v8.1: біти — цифрове цвірінькання; місто — дощ і гул, розгін до панорами над дахами
  SEC.push([B(9), { drone: .55, sub: .5, ost: .25, gl: .5, bits: .9, pad: .3 }], [B(11), { drone: .7, ost: .45, gl: .5, arp: .4, drum: .3, pad: .4, bits: .45 }],
    [B(17), { drone: .7, ost: .5, o16: true, gl: .4, arp: .4, drum: .55, open: .2, pad: .5, rain: .8, hum: .25 }], [B(20), { drone: .85, ost: .7, o16: true, gl: .5, arp: .55, drum: .8, open: .35, pad: .6, rain: .55, hum: .2 }]);
  HITS.push([B(17) + .3, .8, 'whoosh'], [B(17) + 4.4, 1, 'whoosh'], [B(17) + 6.3, 1, 'deep']); RISERS.push([B(17) + 6.3, 1.8, .8]);
  // камені рукавиці й агенти: у кожного каменя своя нота пентатоніки
  // v8.3 (власник: «не подобаються наростаючі ноти для команди»): без дзвонів-нот; камені загоряються сухими ударами без висоти, що росте
  // типи решти ударів: глибокий — лише відкриття, конфлікт, пуш, титр і вибух; інші — короткі з висотою, цифрові в «Бітах»
  const DEEP = [B(2), B(38), B(44), B(48.5), BOOM]; let sn = 0;
  HITS.forEach((h) => { if (h[2]) return; const t = h[0]; if (DEEP.some((d) => Math.abs(d - t) < .05)) { h[2] = 'deep'; return; }
    if (t >= B(9) && t < B(11)) { h[2] = 'glitch'; h[3] = [0, 5, 7][sn++ % 3]; return; } h[2] = 'snap'; h[3] = [0, -5][sn++ % 2]; });
  // v8.3 — мова трейлера культового кіно: годинник (тік-так, як у «Інтерстелларі»), що прискорюється в нарощуваннях; барабанний дріб
  //   перед головними ударами; «стоп» — пів секунди тиші перед глибоким ударом; пульс суб-баса в пуші
  const lvOld = (t) => { let v = SEC[0][1]; for (const e of SEC) { if (e[0] <= t + 1e-6) v = e[1]; else break; } return v; };
  // v8.4: годинник прибрано (власник)
  [B(17) + 6.3, B(38), B(44), B(48.5)].forEach((T) => { const v = lvOld(T + .01); SEC.push([T - .5, { drone: .06, sub: .12, tick: 0, cut: true }], [T, { ...v, cut: true }]); });
  SEC.sort((p, q) => p[0] - q[0]);
  HITS.filter((h) => h[2] === 'deep' && h[0] > B(3)).forEach((h) => { h[4] = 1; });   // перед глибоким ударом — дріб (рушій у sk-sound)
  SEC.forEach((e) => { if (e[0] >= B(44) - .01 && e[0] < B(48.5) - .01) e[1] = { ...e[1], pulse: 1 }; });
  [SEC, HITS, RISERS].forEach((A) => A.sort((p, q) => p[0] - q[0]));
  Object.assign(AUD, { end: TOTAL, voice: VO.map(([b, k, d]) => [b, k, d]), fast: Ms(AUD.fast), push: AUD.push.map(Ms), cut: Ms(AUD.cut) });
  // v8.5: музика основної частини — трек Suno «Pixel Flythrough Trailer» (варіант 2, записаний для тесту; ship-pipeline/trailer-v8-music/suno-prompt.md).
  //   Старт на 4 с: його удари лягають на вступ стеку (22 с), місто (34 с), агентів (52 с), розщеплений екран (68 с), «готово → пуш» (86–88 с), згасання — на титрі.
  //   Синтезована музика лишається тільки в пост-кредиті; голос і звуки інтерфейсу — як були
  //   Дві версії звуку на вибір (перемикач у панелі плеєра): «трек» (за замовчуванням) і «синтез» (партитура v8.3 без годинника)
  const keepM = (A) => A.filter((e) => e[0] >= MAIN - .01);
  const AUD_TRK = { ...AUD, sec: [[0, {}], ...keepM(SEC)], hits: keepM(HITS), risers: keepM(RISERS), motif: keepM(MOTIF), track: { f: 'trailer-suno', at: 4, lv: .38 }, push: [1e9, 1e9], cut: 1e9, vv: 9 };
  let SND_V = 'synth'; const audNow = () => (CUR ? CUR.AUD : AUD);

  const box = document.createElement('div'); box.className = 'rc-reel sk-tr' + (RENDER ? ' sk-tr--render' : '');
  box.innerHTML = `<div class="rc-reel__scr"><canvas aria-label="Трейлер «Проліт крізь піксель»: від пікселя сторінки до команди агентів і назад"></canvas>
      <button type="button" class="rc-reel__cover sk-tr__cover" data-play><span class="pl">▶</span><small>трейлер · ${DUR} · зі звуком краще</small></button></div>
    <div class="rc-reel__bar"><button type="button" class="rc-btn" data-pp>▶</button><div class="rc-reel__trk">${SC.map((s) => `<i style="left:${s.a / TOTAL * 100}%;width:${(s.b - s.a) / TOTAL * 100}%" title="${s.t}"><u>${s.t}</u></i>`).join('')}<em></em></div><span class="rc-reel__tm">0:00</span><button type="button" class="rc-btn sk-tr__snd" data-snd title="Звук трейлера: трек або синтез">♪ трек</button><button type="button" class="rc-btn sk-tr__fs" data-fs aria-label="На весь екран" title="На весь екран">⛶</button></div>`;
  slot.appendChild(box);
  // v8.1: на весь екран (кнопка ⛶ і подвійний клік по кадру); полотно перемальовується через ResizeObserver
  const fsBtn = box.querySelector('[data-fs]'), fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const fsToggle = () => { if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else { const r = (box.requestFullscreen || box.webkitRequestFullscreen); if (r) { const pr = r.call(box); if (pr && pr.catch) pr.catch(() => {}); } } };
  fsBtn.addEventListener('click', fsToggle); box.addEventListener('dblclick', (e) => { if (e.target.closest('.rc-reel__scr')) fsToggle(); });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => document.addEventListener(ev, () => { const on = fsEl() === box; box.classList.toggle('sk-tr--fs', on); fsBtn.textContent = on ? '✕' : '⛶'; fsBtn.setAttribute('aria-label', on ? 'Вийти з повного екрана' : 'На весь екран'); }));
  const cv = box.querySelector('canvas'), cx0 = cv.getContext('2d'), oc = document.createElement('canvas'), ocx = oc.getContext('2d'), cover = box.querySelector('.sk-tr__cover'), pp = box.querySelector('[data-pp]'),
    trk = box.querySelector('.rc-reel__trk'), tm = box.querySelector('.rc-reel__tm'); let head = trk.querySelector('em'), segs = [...trk.querySelectorAll('i')];
  // W, H — пікселі CSS; S — масштаб віртуального кадру 960×540; hw, hh — половини кадру у віртуальних одиницях
  // x — поточний контекст малювання: основне полотно або позаекранне (для переходів між сценами)
  let W = 1, H = 1, S = 1, DPR = 1, hw = 480, hh = 270, x = cx0;
  let QD = 1;   // v10.2: якість — множник роздільності; падає, якщо кадри повільні
  function size() { DPR = RENDER ? 1 : Math.min(2, devicePixelRatio || 1) * QD; W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = oc.width = Math.round(W * DPR); cv.height = oc.height = Math.round(H * DPR); S = Math.min(W / 960, H / 540); }
  const TAU = Math.PI * 2, DEG = Math.PI / 180, LN = Math.log;
  const cl = (v) => Math.max(0, Math.min(1, v)), ez = (v) => { v = cl(v); return v * v * (3 - 2 * v); }, eo = (v) => 1 - Math.pow(1 - cl(v), 3), lerp = (a, b, k) => a + (b - a) * k;
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // базова прозорість шару (BA) і панелі агента (PA): усі абсолютні globalAlpha множаться на неї
  let BA = 1, PA = 1, ACC = AMB;
  const ga = (v) => { x.globalAlpha = BA * v; }, pa = (v) => { x.globalAlpha = PA * v; };

  // ── скріншоти сторінки «Інтерстеллара» (assets/skill/reel, ship-pipeline/trailer-v4-check/snap-page.mjs) ──
  const IMG = {};
  // англійська версія: знімки сторінки 34 англійською (ship-pipeline/trailer-v4-check/snap-page-en.mjs)
  const EN = window.PMP_LANG === 'en' ? '-en' : '';
  const IMGS = Promise.all([['page', `assets/skill/reel/page-34${EN}.webp`], ['px', `assets/skill/reel/page-34-px${EN}.webp`], ['ph', `assets/skill/shot-34-ph${EN}.jpg`], ['sh33', 'assets/skill/shot-33.jpg'], ['sh35', 'assets/skill/shot-35.jpg'], ['sh36', 'assets/skill/shot-36.jpg'], ...['interstellar', 'gantt', 'jarvis', 'japan', 'geo'].map((n) => ['bb_' + n, `assets/skill/city/bb-${n}.jpg`])].map(([k, src]) => new Promise((ok) => {
    const im = new Image(); im.decoding = 'async'; im.onload = () => { IMG[k] = im; ok(); }; im.onerror = () => ok(); im.src = src; })));
  // цільовий піксель (центр), його екранне місце на ×1 і фрагмент DPR 8 (240×135 CSS-пікселів навколо)
  const PG = [549.5, 456.5], FR = [429, 388.5, 240, 135];
  // околиця 48×28 з PNG без втрат: x0 = 525, y0 = 442; колір кожного пікселя — шістнадцятково
  const PIX = '03080e03080d02080d03080e03080f02070e02080f02070e02080f02070f02080f02070e02080f02070f03080f04090f04091004080f03080f03070e03080f04090f0409100409109637116326100d0b0f03080f04091004080f03080f02070f02070e01070e02070e01070e02070e02070f02080f03080f03081003080f03081003080f03080f02070f02080f02070f04090f03080e03080e03090f04080f03080f03080f03080f03080f03080f03080f03080f03080f03080f040910040910040a11040910040910030910040910040910040a111d11109035106f2a10180f0f03091004091003091004091003080f03080f03070e02070f02070e02070f03070e03080f03080f04091003091004091003091004080f03080f03080f03080f03080f02080f03080f03070f03080f03080f03081003080f03081003080f03080f02070f03080f03080f03081004091004091004091004091004080f03081003080f0409103317108d3411602610120d0f03070f03081003080f03080f02080f03080f02080f03080f02080f02070e02070e03080f02080f03081003080f03091003080f03080f02080f03080f02080f03080f04091004091003080f04091004091004091003091004091004091004091003080f03080f040910040910040910040910040911040a110409100409110409110408103d1b109737115f261104081003081004081004081003081003081003081003081003081003081003080f02070e03080f03080f04080f04080f04080f03080f04090f04091004091003091002080f04090f04091003070e03080f03080f03080f03080f03080f03080f03080f03070e03080f03080f03080f03080f03080f04080f0409100409100409110408110308103a19109336113e1c1103081103071002081002071002081002071003081003081003081003070f02070f01070e02080f02070f02080f02070f02080f02070f03080f03080f03081003080f040910040910040910030810040910030910040910030910040910040910040a11040910040911040910040a1103091004091003091004090f030910040811030911090b11401c109f3a114a1f1204091104091104091103081003081103081004081103081004081103081002070f03080f04091003080f03080f03080f04090f03080e03080f03080f04091003091003080f03080f03081003070f03080f03080f03081003080f03080f04080f04081004080f04080f04080f04081003080f03081003080f03081003080f030810030810090a10542211a63c1104081004081104081103081002080f03081002070f02081002080f03081002070f02080f04080f04091003080f03080f03080f03090f02070f02080f02080f03091003080f04091004090f04080f03080f03080f03080f04080f03080f04080f04080f04080f03080f04080f03080f04080f03080f04080f04080f0409100309100409100308100408106f2b11ac3e11130d1004081003081003081003081003081003081003081003081003081003080f040910040911050a1104091004080f03080f03080f03080f03080f03080f04091003091003080f02070e02080f02070e02070e02070e02070e02070e02070e02070e02070e02070e02070e02070e02070e03070e03080f03070f03080f03070e03080f03070f02080f6928108a331120110f02070e02070e02080f02070f02080f02070f02080f02070f02080f02070f03080f03080f04091003080f02080f02070f02080f02070f03080f03080f03081003080f03080e03070e03070f03070e03070e03070e03070f03070e03070e03070e03070f03070e04070e03070e03070f03070e04070f03070e04070f03070e04080f03080f03080f6b291091351132160f02070f02070e03070f03080f03080f03080f03080f03080f03080f03080f02080f03090f03090f03090f03090f03090f03090f03090f030a10030910040a1003091003070e02070e03070e02070e03060d02060d03060d02060d03060d02060d03060d02060d03070e03060e03060e03060e03060e03060e03060e03070e03080f02080f03080f5b24108932102f160f02070e02070e02070e02070e03080f02080f03080f02080f03080f02080f02080e01080e01080e02080f02080f02080f02090f02090f030a10030a1003091002090f03080f03070e03080f03070e03070e03060e03060e03060e03060e03060e03060e03060e04070f04070e04070f03070e04070f04070e04070f03070e04080f03080f03080f441d109135113a190f02080f02070e02080f02070e03080f03080f04090f04091004080f03080f02080f02090f02090f03090f02090f01080f02090f030910040a11040a11040a1103091002060d03060e03070e03070e02060d02060d02060d02060d02060d02060d02060d01050c02060d02060d02060d03060e03070e03070e03070f03070e03080f02070e080a0f401b0f9c3911471d0f02070e01070e02070e01070e02080f02070e03080f03080f03081002070e03090f02090f02081002090f02090f01070e02080f03090f040a11040a11030a10030a1003070e02060e02070e02060d02070e02060e02070e02060e02070e01060d02060d01060d02070e02060e03070e03070e03070e03070e04080f03080f02070e02070e08080f3b190fa53b112d150e02070f03080e04080f01060d04091003080f02070e04091004090f03090f04090f03090f03090f03090f03080f02080e02080f02080f030910030910030a1003091003070e02060d01060d01060d01060d01060d01060d01060d01060d01060d01060d01060d02070e02070e03080f02070f02070e02070e03070e02070f02080e02080e03080f461d10ab3d1136180f06090f02070f02070e01050d03080e02070e02080f04091003080f02070e02080f02080f03080f02070f02080f02080f03080f02070f03091003090f03091003090f02070f02070e02070e02070e02070e01070e02070e01070e02070e01070e02070e01070e03080f03080f03080f03080e02080e02070e02080f03070e04090f03091004080f4a1f109f3a11491e100c0b0f03070e03080f03090f03080f03080f04080f02070e02080f02070e03080f03080f03080f03080f03080f03080f03080f03080f02080f03080f03080f03090f02060d01060d01060d01070e02060d01060d01060d01060d01060d01060d01060d01060d02070d02070d02070d01060d01060d01060d02070e02070e03080f03070f02080e3d1a0f933610401b0f02070e01070e02070e02070e02070e02070e02070e02070f03081001070e02080f02070f02080f02070f02080f02070f02080f02070f02060d01060d02060d02070e02070e02070e02070f02070e02070e01060e02070e01060e02070e01070e02070e01060e01070e02070e02070f02070e01070e02070e03080f03090f03080f03070e02070f31160f87321156220f03080f03080f02070e03080f0a0f16080e1402070f03080f04091003070e03080f03080f03080f03080f03080f03080f03080f03080f04091004091004080f03070e01060d02070e02070e02070e02060d01060d01060d01060d01060d01060d01060d01060d03070e03080f03080f03080f03080e02080f03080f03070f03080f02080f03080f2f16108e35116e2a1003091003080f03080e0409100f141b0b101701060d02070e03080f03080f03080f02080f03080f02080f03080e02070e03070e02070e05081004080f04070e02060d02070e02070e02080f02070e02070e01070e02070e01070e02070e01070e02070e01070e02080e03080e04080f03091004080f03080f03080f03080f03080f03080f03080f1e120f792e1186321104091003091004091003070e060b1204091102070e04091004091003090f04080f03080f03080f03070e03080f03070f03070e03070d03070d04070d04070d03060c01060d02070e02070e01060d02070d01070e02070e01060d02060d01060d02060d01060d01050c01050c02060d02070e03080f02070e02070e02070e02080f02070e02080f0e0a0e632710a23a1029140e02070e03080f04080f02070e01070e03080f01070d01060d03080f03080f02070f02080f02070e02070e02060d02060d02060c02050c03070c05070d04070d01070e02060e02070e02060d02070e03070e03070f03060e03070e02060e02070e02060e10141b0a0d1503070e02060e04080f03060e02060e03070f02070e03070e03070f03090f3a1910ab3e11391d150d111704091003080e02070f03070e03080f02070e01070e03080e02070e02070d02070d02070d03070d03070d03070c03060d04070d04070d03050c01040a01060d01060d01060d02060d02060d02060d03060e03060e03060e03060e03060d02050d191c2410131b04070f02050c04080f04080f03060d03070f02060d02070e02070d02070f26120d9938104a211413121602080f01060d02060d02070e02070e02070e02070e02070d02060d02060c02060c01060c02060b02060c03060c02060c03060c02050b07091014161c02070e01070e02070e02070e02070e03060e04070f03070e04070f04070e04070f03060e0e1119090c1403070e03070e06091105091003070f03070e03070f02070e02070d02070e20110f873110762d1121121002080e01070e02070e02070e02070e02070e02070e02070e02070d02070c02070d02060c02060c02060c03070d03070c04080e01040a1719203a3c4302070e01060d01060d01060d02060d02050d02060d02060d03060e03060e03060e03060e04070f02060d02060d03070e04080f03070e03060e03070e02070e01070d01060d01070d0a0a0e65270f8131102a140d01060d01060d02060d01060d02060d01060d02060d01060c02060d02060c02060c02060c02060c01050c02060c02060c05090f01050b0e111725282d02070e02070e02070e02060e02070e03060e03060e03060e04070e03070e04070f03060e04080f03070e03070e03060e03070e03070e04070f03070e02070d02070d02070d03060d03070d491e0e8e34103a180e02070d02070d02070d02060d02060c02070d02070d02060d03070c03070c03070c03060d03070d03070d03070d03060d03070c03070c04070c06090f02070e02070e02060d02060d03060d02050d03060d02050d03060d02060d03060e03060e03060d02060d03060e03060e03060e02060d03060e02050c02060c02060c03060c02050b01050b31140ca43b1063260e03060c02060c03060c02050c02060b02050b03060c02060c02060c02060c03060c03070d03070d03070d03070d03070d03070d02050b01050a03080c02080f02070e02070e02070e03080f03070e03060e03060e03060e03060e04070f03070e03070e04070e04080f04070f03060e01050c02050d03060d02060d02060c03070d01050b02050c140c0c87310f762d0f04080d03070c03070d03070c02060c02060c03070d03070c02050c01050c02060c03070c04080d04070d04080d03070d02060b03070c03070c03070c', GW = 48, GH = 28, GX = 525, GY = 442;
  const PC = []; for (let i = 0; i < GW * GH; i++) PC.push('#' + PIX.substr(i * 6, 6).toUpperCase());
  const lum = (h) => (parseInt(h.substr(1, 2), 16) * .299 + parseInt(h.substr(3, 2), 16) * .587 + parseInt(h.substr(5, 2), 16) * .114) / 255;
  const TGT = PC[(456 - GY) * GW + (549 - GX)];

  // ── спільні помічники (віртуальні координати: центр кадру — 0,0) ──
  function T(s, X, Y, sz, col, al = 'center', w = 700, f = SANS, bl = 'middle') { x.font = `${w} ${sz}px ${f}`; x.fillStyle = col; x.textAlign = al; x.textBaseline = bl; x.fillText(s, X, Y); }
  function rr(X, Y, w, h, r) { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); }
  function glow(X, Y, r, col, a = 1) { if (r <= 0 || a <= 0) return; const g = x.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); const o = x.globalAlpha; x.globalAlpha = o * a; x.fillStyle = g; x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fill(); x.globalAlpha = o; }
  function fill(col) { x.fillStyle = col; x.fillRect(-hw - 2, -hh - 2, hw * 2 + 4, hh * 2 + 4); }
  // стрілка з наконечником (both — з обох кінців)
  function arrow(x1, y1, x2, y2, col, w = 1.2, head = 7, both = false) {
    x.strokeStyle = col; x.fillStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
    const tip = (ax, ay, bx, by) => { const an = Math.atan2(by - ay, bx - ax); x.beginPath(); x.moveTo(bx, by); x.lineTo(bx - Math.cos(an - .42) * head, by - Math.sin(an - .42) * head); x.lineTo(bx - Math.cos(an + .42) * head, by - Math.sin(an + .42) * head); x.closePath(); x.fill(); };
    tip(x1, y1, x2, y2); if (both) tip(x2, y2, x1, y1);
  }
  // мітка-пакет: заокруглена плашка з моношрифтом
  function chip(s, X, Y, col = `rgb(${AMB})`, sz = 9, bg = 'rgba(8,10,16,.92)', a = 1) {
    if (a <= 0) return; x.save(); x.globalAlpha *= a; x.font = `600 ${sz}px ${MONO}`; const w = x.measureText(s).width + sz * 1.3, h = sz * 1.9;
    rr(X - w / 2, Y - h / 2, w, h, h / 2); x.fillStyle = bg; x.fill(); x.strokeStyle = col; x.lineWidth = .8; x.stroke(); x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, X, Y + .5); x.restore();
  }
  // титр сцени: акт і назва в лівому верхньому куті
  function cap(n, s, u, len) {
    const a = Math.min(ez((u - .25) / .5), 1 - ez((u - len + .7) / .5)); if (a <= 0) return;
    x.save(); ga(a); const X = -hw + 44, Y = -hh + 46; x.font = `650 15px ${SANS}`; const w = Math.max(90, x.measureText(s).width);
    const g = x.createLinearGradient(X - 14, 0, X + w + 70, 0); g.addColorStop(0, 'rgba(5,6,10,.92)'); g.addColorStop(.7, 'rgba(5,6,10,.85)'); g.addColorStop(1, 'rgba(5,6,10,0)'); x.fillStyle = g; x.fillRect(X - 14, Y - 16, w + 84, 48);
    x.letterSpacing = '2px'; T(n, X, Y, 9, `rgba(${AMB},.95)`, 'left', 600, MONO); const lw = x.measureText(n).width; x.letterSpacing = '0px';
    x.fillStyle = `rgba(${AMB},.7)`; x.fillRect(X + lw + 10, Y - .5, 26, 1);
    T(s, X, Y + 19, 15, 'rgba(240,244,250,.96)', 'left', 650); x.restore();
  }

  // ── камера над площиною (2.5D): ціль, масштаб, поворот, нахил; перспектива F ──
  const F = 1100, CM = { tx: 0, ty: 0, z: 1, cy: 1, sy: 0, cp: 1, sp: 0 };
  function cam(c) { CM.tx = c.tx; CM.ty = c.ty; CM.z = c.z; CM.cy = Math.cos(c.ya); CM.sy = Math.sin(c.ya); CM.cp = Math.cos(c.pi); CM.sp = Math.sin(c.pi); }
  const camMix = (a, b, k) => ({ tx: lerp(a.tx, b.tx, k), ty: lerp(a.ty, b.ty, k), z: Math.exp(lerp(LN(a.z), LN(b.z), k)), ya: lerp(a.ya, b.ya, k), pi: lerp(a.pi, b.pi, k) });
  function pr(X, Y) { X -= CM.tx; Y -= CM.ty; const X1 = X * CM.cy, Z1 = X * CM.sy, Y2 = Y * CM.cp, Z2 = -Y * CM.sp + Z1 * CM.cp, k = F / (F + Z2 * CM.z); return [X1 * CM.z * k, Y2 * CM.z * k, k * CM.z]; }
  // малювання в локальних координатах прямокутника площини (0..w, 0..h) через афінне наближення трьох кутів
  function onPlane(X, Y, w, h, fn) {
    const p0 = pr(X, Y), p1 = pr(X + w, Y), p3 = pr(X, Y + h); x.save();
    x.transform((p1[0] - p0[0]) / w, (p1[1] - p0[1]) / w, (p3[0] - p0[0]) / h, (p3[1] - p0[1]) / h, p0[0], p0[1]); fn(); x.restore();
  }
  // сітка площини
  function floorGrid(x0, y0, x1, y1, st, a) {
    if (a <= 0) return; x.lineWidth = .6;
    for (let X = x0; X <= x1; X += st) { const p = pr(X, y0), q = pr(X, y1); x.strokeStyle = `rgba(150,175,215,${(X % (st * 5) ? .05 : .1) * a})`; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); }
    for (let Y = y0; Y <= y1; Y += st) { const p = pr(x0, Y), q = pr(x1, Y); x.strokeStyle = `rgba(150,175,215,${(Y % (st * 5) ? .05 : .1) * a})`; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); }
  }
  // тло столу: темний радіальний градієнт
  function bgDesk(a) { if (a <= 0) return; const g = x.createRadialGradient(0, -40, 40, 0, 0, hw * 1.3); g.addColorStop(0, `rgba(22,28,40,${a})`); g.addColorStop(1, `rgba(6,8,12,${a})`); fill(g); }

  // ══ СТОРІНКА І ПІКСЕЛЬ (v7: загальний → середній → макро) ══
  // вікно браузера навколо сторінки (координати сторінки 1920 × 1080); typed — скільки символів адреси набрано, cur — курсор
  function chrome(typed = null, cur = false) {
    for (let i = 4; i > 0; i--) { x.fillStyle = 'rgba(0,0,0,.12)'; rr(-14 - i * 8, -58 - i * 8, 1948 + i * 16, 1152 + i * 16, 18 + i * 8); x.fill(); }
    x.fillStyle = '#1b1f27'; rr(-14, -58, 1948, 1152, 16); x.fill(); x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 2; x.stroke();
    [0, 1, 2].forEach((i) => { x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(18 + i * 26, -29, 8, 0, TAU); x.fill(); });
    x.fillStyle = '#0f1218'; rr(420, -46, 1080, 34, 17); x.fill();
    x.fillStyle = 'rgba(255,255,255,.5)'; rr(446, -35, 10, 12, 2); x.fill(); x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 2; x.beginPath(); x.arc(451, -36, 4.5, Math.PI, 0); x.stroke();
    const url = 'artemzh.github.io/Blog/34-interstellar.html', us = typed == null ? url : url.slice(0, typed); T(us, 470, -28, 17, 'rgba(235,240,248,.85)', 'left', 500, MONO);
    if (cur) { x.font = `500 17px ${MONO}`; x.fillStyle = 'rgba(235,240,248,.95)'; x.fillRect(472 + x.measureText(us).width, -40, 2.4, 24); }
    x.fillStyle = 'rgba(255,255,255,.08)'; rr(90, -50, 300, 40, 9); x.fill(); T('Фізика «Інтерстеллара»', 108, -29, 15, 'rgba(235,240,248,.8)', 'left', 600);
  }
  // сторінка в браузері: Z — масштаб (1 = сторінка на весь кадр), (cxp, cyp) — точка сторінки в центрі кадру;
  // st — стадії завантаження 0..1: win (вікно), typed/cur (адреса), bar (смужка), sk (каркас), tx (текст), bn (банер)
  const FULL = { win: 1, typed: null, cur: false, bar: 1, sk: 0, tx: 1, bn: 1 };
  function browser(Z, cxp, cyp, st = FULL) {
    const k = .5 * Z; fill('#05070b'); x.save(); x.translate(-cxp * k, -cyp * k); x.scale(k, k);
    x.save(); x.globalAlpha *= st.win; chrome(st.typed, st.cur); x.fillStyle = '#ffffff'; x.fillRect(0, 0, 1920, 1080);
    if (st.bar > 0 && st.bar < 1) { x.fillStyle = `rgb(${AMB})`; x.fillRect(0, -6, 1920 * eo(st.bar), 4); } x.restore();
    // каркас: сірі плашки на білому (шапка, банер, заголовок, рядки тексту); текстові плашки гаснуть під текстом, банерна — під банером
    const skT = st.sk * (1 - st.tx), skB = st.sk * (1 - st.bn);
    if (skT > 0) { x.save(); x.globalAlpha *= skT; x.fillStyle = '#e4e7ec'; x.fillRect(30, 18, 180, 22); for (let i = 0; i < 11; i++) x.fillRect(960 + i * 84, 22, 62, 14);
      for (let i = 0; i < 15; i++) x.fillRect(370, 650 + i * 27, i % 5 === 4 ? 420 : 740 - (i % 3) * 40, 13); x.restore(); }
    if (skB > 0) { x.save(); x.globalAlpha *= skB; x.fillStyle = '#eceef2'; x.fillRect(0, 58, 1920, 560); x.fillStyle = '#dfe2e8'; x.fillRect(70, 262, 160, 12); x.fillRect(70, 296, 820, 64); x.fillRect(70, 382, 600, 24); x.restore(); }
    if (IMG.page && st.tx > 0) { x.save(); x.globalAlpha *= st.tx; x.beginPath(); x.rect(0, 0, 1920, 58); x.rect(0, 618, 1920, 462); x.clip(); x.drawImage(IMG.page, 0, 0, 1920, 1080); x.restore(); }
    if (IMG.page && st.bn > 0) { x.save(); x.globalAlpha *= st.bn; x.beginPath(); x.rect(0, 58, 1920, 560); x.clip(); x.drawImage(IMG.page, 0, 0, 1920, 1080);
      // фрагмент DPR 8 навколо пікселя — різкіше на середньому плані
      const fa = cl((Z - 1.3) / .6); if (fa > 0 && IMG.px) { x.globalAlpha *= fa; x.drawImage(IMG.px, FR[0], FR[1], FR[2], FR[3]); } x.restore(); }
    x.restore();
  }
  // 1. Загальний план (0–4 с): сторінка «Інтерстеллара» завантажується у вікні браузера на весь кадр — адреса → каркас → текст → банер.
  //    Камера стоїть, лише дуже повільний наїзд ×1,00 → ×1,04. Жодного світла без джерела.
  const W0 = [.82, 960, 518], W1 = [1.4, 688, 345];
  function c01(u, len) {
    const n = u < .35 ? 0 : Math.min(44, Math.floor((u - .35) * 60));
    browser(W0[0] * (1 + .04 * u / len), W0[1], W0[2], { win: ez(u / 1.1), typed: n, cur: u < 1.4 && (u * 2) % 1 < .55, bar: cl((u - 1.15) / 2.1), sk: ez((u - 1.3) / .45), tx: ez((u - 2.1) / .6), bn: ez((u - 2.75) / .75) });
  }
  // 2. Середній план (4–8 с): один плавний наїзд (ease in-out) на банер із чорною дірою; цільовий піксель — на перетині третин, без розмиття
  function c02(u, len) {
    const k = ez(u / len); browser(Math.exp(lerp(LN(W0[0] * 1.04), LN(W1[0]), k)), lerp(W0[1], W1[1], k), lerp(W0[2], W1[2], k));
    cap('СТОРІНКА', 'Готова сторінка', u, len);
  }
  // 3. Макро (10–14 с): субпіксельна сітка LCD (смужки R, G, B і чорні проміжки); один піксель #AB3D11 росте на весь кадр.
  //    Розмиття — одна подія: на першій секунді різкість переводиться з сітки на піксель (rack focus), далі кадр різкий.
  //    Світиться лише сам піксель (без ореолу); наприкінці око «зводить» три смужки в один колір — поле #AB3D11, як на початку «Коду».
  const PIX0 = [-150, 64], TI = 549 - GX, TJ = 456 - GY;
  const bcv = document.createElement('canvas'), bcx = bcv.getContext('2d');
  function lcdCell(X, Y, k, hex, a) {
    if (a <= 0) return; const g = .16 * k, w = (k - g) / 3, r = parseInt(hex.substr(1, 2), 16) / 255, gg = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    [[r, '255,46,32'], [gg, '60,255,90'], [b, '60,110,255']].forEach(([v, c], i) => { const e = .05 + .95 * v; x.fillStyle = `rgba(${c},${a * e})`; x.fillRect(X + g / 2 + i * w + w * .07, Y + g / 2, w * .86, k - g); });
  }
  function lcd(u, kz, P, skip) {
    const i0 = Math.max(0, Math.floor(TI + (-hw - P[0]) / kz)), i1 = Math.min(GW - 1, Math.ceil(TI + (hw - P[0]) / kz)), j0 = Math.max(0, Math.floor(TJ + (-hh - P[1]) / kz)), j1 = Math.min(GH - 1, Math.ceil(TJ + (hh - P[1]) / kz));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (skip && i === TI && j === TJ) continue; const e = Math.min(i + 1, GW - i, j + 1, GH - j);
      lcdCell(P[0] + (i - TI - .5) * kz, P[1] + (j - TJ - .5) * kz, kz, PC[j * GW + i], cl(e / 5)); }
  }
  function blurred(px, fn) {   // fn малює в поточних координатах; результат — у кадр із розмиттям px (віртуальні пікселі)
    if (px < .15) { fn(); return; } const X0 = x, m = x.getTransform(); if (bcv.width !== X0.canvas.width || bcv.height !== X0.canvas.height) { bcv.width = X0.canvas.width; bcv.height = X0.canvas.height; }
    bcx.setTransform(1, 0, 0, 1, 0, 0); bcx.clearRect(0, 0, bcv.width, bcv.height); bcx.setTransform(m); bcx.globalAlpha = 1; x = bcx; fn(); x = X0;
    lowBlur(bcv, px * Math.hypot(m.a, m.b)); x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(sm, 0, 0, bcv.width, bcv.height); x.restore(); }
  // v10.2 (продуктивність): розмиття рахується на полотні в 1/4 розміру й розтягується назад — у ~16 разів дешевше, на око те саме
  const sm = document.createElement('canvas'), smx = sm.getContext('2d'), SMK = 4;
  function lowBlur(src, px) { const w = Math.max(2, Math.round(src.width / SMK)), h = Math.max(2, Math.round(src.height / SMK)); if (sm.width !== w || sm.height !== h) { sm.width = w; sm.height = h; }
    smx.setTransform(1, 0, 0, 1, 0, 0); smx.globalCompositeOperation = 'copy'; smx.globalAlpha = 1; smx.filter = `blur(${Math.max(.3, px / SMK).toFixed(2)}px)`; smx.drawImage(src, 0, 0, w, h); smx.filter = 'none'; smx.globalCompositeOperation = 'source-over'; }
  // v8: макролінза — мала глибина різкості: різка лише горизонтальна смуга навколо sy (віртуальні координати), вище й нижче — розмиття px
  function macroDOF(sy, band, px) {
    if (px < .2) return; const cvs = x.canvas, m = x.getTransform(), py = m.transformPoint(new DOMPoint(0, sy)).y, sc = Math.hypot(m.a, m.b), b = band * sc;
    if (bcv.width !== cvs.width || bcv.height !== cvs.height) { bcv.width = cvs.width; bcv.height = cvs.height; }
    lowBlur(cvs, px * sc); const k = sm.height / cvs.height, pk = py * k, bk = b * k;
    smx.globalCompositeOperation = 'destination-out'; const g = smx.createLinearGradient(0, pk - bk * 2, 0, pk + bk * 2); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.32, 'rgba(0,0,0,1)'); g.addColorStop(.68, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    smx.fillStyle = g; smx.fillRect(0, pk - bk * 2, sm.width, bk * 4); smx.globalCompositeOperation = 'source-over';
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.imageSmoothingEnabled = true; x.drawImage(sm, 0, 0, cvs.width, cvs.height); x.restore(); }
  function pixLabel(a, z = 1) {
    if (a <= 0) return; x.save(); x.globalAlpha *= a; x.scale(z, z);
    T(TGT, 0, -18, 54, 'rgba(255,240,228,.97)', 'center', 700, MONO); T('rgb(171, 61, 17)  ·  x 549  ·  y 456', 0, 26, 13, 'rgba(255,230,210,.85)', 'center', 500, MONO);
    T('1 піксель із 2 073 600 на екрані 1920 × 1080', 0, 48, 11, 'rgba(255,230,210,.6)', 'center', 500, MONO); x.restore();
  }
  function s02(u, len) {
    fill('#000'); const m = ez((u - .5) / 2.7), kz = Math.exp(lerp(LN(26), LN(1150), m)), P = [lerp(PIX0[0], 0, m), lerp(PIX0[1], 0, m)];
    const rk = ez(u / 1), bN = 3.2 * rk * (1 - ez((u - 1.1) / .7)), bT = 4.5 * (1 - rk);
    blurred(bN, () => lcd(u, kz, P, true));
    blurred(bT, () => lcdCell(P[0] - kz / 2, P[1] - kz / 2, kz, TGT, 1));
    const sol = ez((u - 2.9) / .7); if (sol > 0) { x.save(); x.globalAlpha *= sol; fill(TGT); x.restore(); }
    pixLabel(ez((u - 3.25) / .45));
    cap('ПІКСЕЛЬ', 'Макро: один піксель', u, len);
  }

  // ══ КОД ══
  // справжні рядки: 34-interstellar.html 25–44 і shared/threebody.css 165–184
  const SRC_HTML = /*@HTML@*/["    <a href=\"#tides\">Хвилі</a><a href=\"#blue\">Зсув</a><a href=\"#worm\">Червоточина</a><a href=\"#tess\">Тесеракт</a><a href=\"#map\">Карта</a><a href=\"#refs\">Відсилки</a><a href=\"#known\">Що відомо</a>","  </nav>","</header>","","<main class=\"main\" id=\"top\">","  <header class=\"hero3\">","    <img class=\"hero3__img\" src=\"assets/interstellar/banner.jpg\" alt=\"Чорна діра з яскравим диском і маленький корабель на її тлі\" width=\"1916\" height=\"821\">","    <svg class=\"hero3__orb\" viewBox=\"0 0 1916 821\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\">","      <ellipse cx=\"1420\" cy=\"410\" rx=\"520\" ry=\"120\" transform=\"rotate(-6 1420 410)\"/>","      <ellipse cx=\"1420\" cy=\"410\" rx=\"700\" ry=\"170\" transform=\"rotate(-4 1420 410)\"/>","      <ellipse class=\"acc\" cx=\"1420\" cy=\"410\" rx=\"880\" ry=\"230\" transform=\"rotate(-8 1420 410)\"/>","    </svg>","    <div class=\"hero3__txt\">","      <div class=\"hero3__kick\">Стаття · фізика · чернетка</div>","      <h1>Фізика «Інтерстеллара»</h1>","      <p class=\"hero3__sub\">Що у фільмі пораховано, що спрощено, а що вигадано</p>","    </div>","  </header>","  <div class=\"wrap\"><p class=\"lede lede3\">«Інтерстеллар» Крістофера Нолана (2014) став чи не єдиним голлівудським блокбастером, над яким всерйоз працював справжній фізик-теоретик. Кіп Торн особисто обчислював параметри чорної діри, червоточини та гравітаційного сповільнення часу, а його розгортання на екрані переросло у фахові наукові публікації. Пройдемося ключовими головоломками кінострічки й з'ясуємо, де ховається залізна логіка, де просте вимушене спрощення, а де чиста фантазія. Кожен ефект марковано: <span class=\"badge sci\">наука</span><span class=\"badge simp\">спрощення</span><span class=\"badge fic\">вигадка</span>.</p></div>",""], SRC_CSS = /*@CSS@*/[".hist p{margin:0;font-size:14px;max-width:80ch}","","/* банер */",".hero3{position:relative;margin:calc(-1 * var(--sp-xl)) calc(-1 * var(--sp-lg)) var(--sp-md);background:#04050a;overflow:hidden;","  height:clamp(340px,40vw,560px)}",".hero3__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center}",".hero3::after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,5,10,.55) 0%,rgba(4,5,10,.15) 45%,rgba(4,5,10,0) 60%);pointer-events:none}",".hero3__orb{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}",".hero3__orb ellipse{fill:none;stroke:rgba(255,255,255,.28);stroke-width:1.4;stroke-dasharray:6 7;vector-effect:non-scaling-stroke}",".hero3__orb ellipse.acc{stroke:rgba(234,82,18,.75);stroke-dasharray:none;stroke-width:1.6}","@media (prefers-reduced-motion:no-preference){","  .hero3__orb ellipse{animation:orbIn 2.4s ease-out both}","  .hero3__orb ellipse:nth-child(2){animation-delay:.35s}.hero3__orb ellipse:nth-child(3){animation-delay:.7s}","}","@keyframes orbIn{from{opacity:0}to{opacity:1}}",".hero3__txt{position:absolute;z-index:2;left:clamp(20px,5vw,72px);top:50%;transform:translateY(-50%);max-width:46%}",".hero3__kick{font:600 11px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:16px}",".hero3 h1{color:#fff;font-size:clamp(36px,5.2vw,72px);line-height:1.02;letter-spacing:-.035em;margin:0 0 14px;text-shadow:0 2px 24px rgba(0,0,0,.5)}",".hero3__sub{color:var(--act);font-size:clamp(16px,1.6vw,22px);font-weight:600;margin:0;max-width:none}",".hero3__cap{position:absolute;z-index:2;right:14px;bottom:10px;font-size:11px;color:rgba(255,255,255,.55)}"];
  // англійська версія (i18n-en.js): рядки коду статті 34 перекладаються цілими, до розбиття на токени підсвітки
  if (window.SK_TR) [SRC_HTML, SRC_CSS].forEach((A) => A.forEach((l, i) => { A[i] = window.SK_TR(l); }));
  const L_HTML = 25, L_CSS = 165, HL_HTML = 35, HL_CSS = 174;
  const CC = { tag: '#ff7b72', attr: '#79c0ff', str: '#a5d6ff', pun: '#8b949e', txt: '#e6edf3', com: '#8b949e', sel: '#d2a8ff', at: '#ff7b72', prop: '#79c0ff', val: '#ffa657' };
  function tokHTML(s) { const out = [], re = /(<\/?)([\w-]+)|([\w-]+)(=)("[^"]*")|(\/?>)|(\s+)|([^<>\s]+)/g; let m;
    while ((m = re.exec(s))) { if (m[1]) out.push([m[1], CC.pun], [m[2], CC.tag]); else if (m[3]) out.push([m[3], CC.attr], [m[4], CC.pun], [m[5], CC.str]); else if (m[6]) out.push([m[6], CC.pun]); else out.push([m[0], CC.txt]); } return out; }
  function tokCSS(lines) { const st = []; let mode = 'prop', at = false;
    return lines.map((s) => { const out = [], re = /(\/\*.*?\*\/)|([{}])|([;:])|([^{};:]+)/g; let m;
      while ((m = re.exec(s))) { const top = st[st.length - 1];
        if (m[1]) out.push([m[1], CC.com]);
        else if (m[2] === '{') { st.push(at ? 'grp' : 'decl'); at = false; mode = 'prop'; out.push(['{', CC.pun]); }
        else if (m[2] === '}') { st.pop(); out.push(['}', CC.pun]); }
        else if (top === 'decl') { if (m[3] === ':' && mode === 'prop') { mode = 'val'; out.push([':', CC.pun]); } else if (m[3] === ';') { mode = 'prop'; out.push([';', CC.pun]); } else out.push([m[0], mode === 'prop' ? CC.prop : CC.val]); }
        else { if (m[4] && m[4].trim()[0] === '@') at = true; out.push([m[0], at ? CC.at : CC.sel]); } }
      return out; }); }
  const TK_HTML = SRC_HTML.map(tokHTML), TK_CSS = tokCSS(SRC_CSS);
  const EW = 860, EH = 470, LH = 18.4, CY = 80, GUT = 50;
  // редактор у локальних координатах (0..EW, 0..EH); st: вкладка, підсвічений рядок, надруковано символів, курсор, виноска
  function editor(st) {
    x.save(); x.fillStyle = 'rgba(0,0,0,.4)'; rr(10, 18, EW, EH, 12); x.fill();
    x.fillStyle = '#0d1117'; rr(0, 0, EW, EH, 12); x.fill(); x.save(); rr(0, 0, EW, EH, 12); x.clip();
    // заголовок вікна і вкладки
    x.fillStyle = '#161b22'; x.fillRect(0, 0, EW, 58); [0, 1, 2].forEach((i) => { x.fillStyle = '#30363d'; x.beginPath(); x.arc(18 + i * 16, 15, 5, 0, TAU); x.fill(); });
    T(`${st.tab ? 'threebody.css' : '34-interstellar.html'} — PM Portfolio`, EW / 2, 15, 10.5, 'rgba(201,209,217,.75)', 'center', 500, SANS);
    [['34-interstellar.html', '<>', '#e8915a'], ['threebody.css', '#', '#58a6ff']].forEach(([n, ic, c], i) => { const X = 8 + i * 178, on = st.tab === i;
      x.fillStyle = on ? '#0d1117' : '#161b22'; x.fillRect(X, 30, 174, 28); if (on) { x.fillStyle = ACT; x.fillRect(X, 30, 174, 2); }
      T(ic, X + 16, 44.5, 10, c, 'center', 700, MONO); T(n, X + 30, 44.5, 11, on ? '#e6edf3' : '#8b949e', 'left', 500, SANS); });
    T(st.tab ? 'PM Protfolio  ›  shared  ›  threebody.css  ›  .hero3__orb ellipse.acc' : 'PM Protfolio  ›  34-interstellar.html  ›  header.hero3  ›  svg  ›  ellipse.acc', 14, 68, 9.5, '#8b949e', 'left', 500, SANS);
    // код
    const tk = st.tab ? TK_CSS : TK_HTML, L0 = st.tab ? L_CSS : L_HTML, HL = st.tab ? HL_CSS : HL_HTML;
    x.save(); x.beginPath(); x.rect(0, CY - 4, EW - 74, EH - CY - 22); x.clip();
    tk.forEach((ln, i) => { const n = L0 + i, Y = CY + 8 + i * LH, hl = n === HL;
      if (hl && st.hl > 0) { x.fillStyle = `rgba(${AMB},${.13 * st.hl})`; x.fillRect(0, Y - LH / 2, EW, LH); x.fillStyle = `rgba(${AMB},${st.hl})`; x.fillRect(0, Y - LH / 2, 3, LH); }
      T(String(n), GUT - 12, Y, 11, hl ? '#e6edf3' : '#484f58', 'right', 500, MONO);
      x.font = `500 12px ${MONO}`; x.textAlign = 'left'; x.textBaseline = 'middle'; let X = GUT + 6, left = hl && st.typed != null ? st.typed : 1e9;
      for (const [s, c] of ln) { if (left <= 0) break; const p = s.length > left ? s.slice(0, left) : s; left -= s.length; x.fillStyle = c; x.fillText(p, X, Y); X += x.measureText(p).width; }
      if (hl && st.cur) { x.fillStyle = '#e6edf3'; x.fillRect(X + 1, Y - 7.5, 1.6, 15); } });
    // згасання довгих рядків праворуч
    const g = x.createLinearGradient(EW - 140, 0, EW - 74, 0); g.addColorStop(0, 'rgba(13,17,23,0)'); g.addColorStop(1, '#0d1117'); x.fillStyle = g; x.fillRect(EW - 140, CY, 66, EH);
    x.restore();
    // мінікарта
    x.fillStyle = 'rgba(255,255,255,.03)'; x.fillRect(EW - 70, CY - 4, 62, EH - CY - 22); x.save(); x.globalAlpha *= .45;
    tk.forEach((ln, i) => { let X = EW - 66; ln.forEach(([s, c]) => { const w = Math.min(s.length * 1.1, EW - 12 - X); if (w > 0 && s.trim()) { x.fillStyle = c; x.fillRect(X, CY + i * 5, w, 2.6); } X += s.length * 1.1; }); });
    x.restore(); x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(EW - 70, CY - 4 + (HL - L0) * 5 - 6, 62, 16);
    // рядок стану
    x.fillStyle = '#161b22'; x.fillRect(0, EH - 22, EW, 22); x.fillStyle = ACT; x.fillRect(0, EH - 22, 4, 22);
    T(st.tab ? `Рядок ${HL}, стовпчик ${st.typed == null ? 42 : Math.min(st.typed + 1, 92)}` : `Рядок ${HL}, стовпчик 7`, 14, EH - 11, 9.5, '#8b949e', 'left', 500, MONO);
    T(`UTF-8 · LF · ${st.tab ? 'CSS' : 'HTML'} · пробіли: 2`, EW - 14, EH - 11, 9.5, '#8b949e', 'right', 500, MONO);
    // виноска: колір пікселя ← значення stroke
    if (st.call > 0 && st.tab) { x.save(); x.globalAlpha *= st.call; x.font = `500 12px ${MONO}`;
      const ln = SRC_CSS[HL - L_CSS], i0 = ln.indexOf('rgba('), X0 = GUT + 6 + x.measureText(ln.slice(0, i0)).width, Xw = x.measureText('rgba(234,82,18,.75)').width, Y0 = CY + 8 + (HL - L_CSS) * LH;
      x.strokeStyle = `rgb(${AMB})`; x.lineWidth = 1.2; x.strokeRect(X0 - 3, Y0 - 9, Xw + 6, 18);
      const bx = 440, by = 300, bw = 336, bh = 92; arrow(X0 + Xw / 2, Y0 + 10, bx + 50, by - 2, `rgb(${AMB})`, 1, 6);
      x.fillStyle = 'rgba(22,27,34,.97)'; rr(bx, by, bw, bh, 8); x.fill(); x.strokeStyle = `rgba(${AMB},.8)`; x.lineWidth = 1; x.stroke();
      x.fillStyle = TGT; rr(bx + 14, by + 14, 64, 64, 4); x.fill(); x.strokeStyle = 'rgba(255,255,255,.3)'; x.stroke();
      T('піксель (549, 456)', bx + 92, by + 22, 11, '#e6edf3', 'left', 600, SANS);
      T(`= ${TGT}`, bx + 92, by + 42, 15, `rgb(${AMB})`, 'left', 700, MONO);
      T('0,75 × #EA5212 + 0,25 × темне тло', bx + 92, by + 62, 10, '#8b949e', 'left', 500, MONO);
      T('край згладжено: ≈ #B24113 → #AB3D11', bx + 92, by + 78, 9, '#6e7681', 'left', 500, MONO); x.restore(); }
    x.restore(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; rr(0, 0, EW, EH, 12); x.stroke(); x.restore();
  }
  const ED_END = { tab: 1, hl: 1, typed: null, cur: false, call: 1 }, ES = .88, EOY = 18;
  // редактор у кадрі: масштаб ES, зсув EOY униз (місце під титр сцени)
  function edAt(e, sc, st) { x.save(); x.translate(0, EOY * e); x.scale(sc * ES, sc * ES); x.translate(-EW / 2, -EH / 2); editor(st); x.restore(); }
  // проліт крізь піксель: k = 0 — піксель на весь кадр, k = 1 — редактор на своєму місці
  function throughPixel(k, edSt) {
    const e = ez(k), sc = Math.exp(lerp(LN(.035), 0, e)), bg = ez((k - .15) / .7);
    fill(TGT); fill(`rgba(6,8,12,${bg})`); bgDesk(bg);
    // крапкова сітка, що летить назустріч (зникає, коли редактор на місці)
    const da = .12 * bg * (1 - ez((k - .6) / .4)); if (da > 0) { x.fillStyle = `rgba(150,175,215,${da})`; const st = 24 * Math.max(.3, sc) * 3; for (let X = -Math.floor(hw / st) * st; X < hw; X += st) for (let Y = -Math.floor(hh / st) * st; Y < hh; Y += st) x.fillRect(X, Y, 1.2, 1.2); }
    if (sc > .02) { x.save(); x.globalAlpha *= cl(e * 2.2); edAt(e, sc, edSt); x.restore(); }
    // підпис пікселя пролітає повз камеру
    const la = 1 - ez(k / .35); if (la > 0) { x.save(); x.globalAlpha *= la; const z = 1 + 3 * k * k; x.scale(z, z);
      T(TGT, 0, -18, 54, 'rgba(255,240,228,.97)', 'center', 700, MONO); T('rgb(171, 61, 17)  ·  x 549  ·  y 456', 0, 26, 13, 'rgba(255,230,210,.85)', 'center', 500, MONO);
      T('1 піксель із 2 073 600 на екрані 1920 × 1080', 0, 48, 11, 'rgba(255,230,210,.6)', 'center', 500, MONO); x.restore(); }
  }
  // 3. Код: проліт крізь піксель → HTML (рядок 35) → CSS, курсор друкує рядок 174, виноска з кольором пікселя
  function s03(u, len) {
    let st;
    if (u < 3.3) st = { tab: 0, hl: ez((u - 1.7) / .4), typed: null, cur: u > 1.7 && Math.floor(u * 2.2) % 2 === 0, call: 0 };
    else { const n = Math.floor((u - 3.4) * 38); st = { tab: 1, hl: 1, typed: n > 90 ? null : Math.max(0, n), cur: (n < 90 || Math.floor(u * 2.2) % 2 === 0) && u < 5.6, call: ez((u - 4.4) / .5) }; }
    throughPixel(u / 1.6, st);
    // зміна вкладки — короткий наплив
    if (u > 3.3 && u < 3.55) { x.save(); x.globalAlpha *= 1 - ez((u - 3.3) / .25); edAt(1, 1, { tab: 0, hl: 1, typed: null, cur: false, call: 0 }); x.restore(); }
    cap('КОД', 'Піксель → рядок коду', u, len);
  }

  // ══ МЕРЕЖА v7: СТЕК ВИРОСТАЄ ЗГОРИ ВНИЗ, КРАН УЗДОВЖ КОЛОНИ ══
  // Світ (y — угору): сторінка-аркуш → фронтенд → протоколи → сервери → дані; рівні рознесено (крок ≈ 1,8 × v6), блоки на рівні — з кроком
  // ≥ 1,5 ширини блока. Камера — збоку (¾), без прольоту крізь центр: загальний план (стек проростає) → на кожному рівні середній план,
  // зсув убік (паралакс) і крупно одна ключова деталь → загальний план знизу. Активний рівень — повна яскравість і підписи, інші — 25 %.
  // Підписи — в одній колонці праворуч, на виносних лініях (не поверх блоків). Пакети бігають лише по активному рівню.
  // Факти звірено з відповіддю сервера 21.10.2026: HTTP/2 200, 37 857 байт, TLS 1.3, A 185.199.108.153, AAAA 2606:50c0:8000::153,
  // кеш max-age=600, CDN edge MISS (DUS). Постачальників сертифіката й CDN не називаємо.
  const HC = '110,220,255', V3 = { C: [0, 0, 0], r: [1, 0, 0], u: [0, 1, 0], f: [0, 0, -1] }, NEAR = 5;
  let F3 = 1100, SS = 1, SO = [0, 0, 0], SHX = 0;
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const crs3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  function look(P, G) { const f = nrm3(sub3(G, P)), r = nrm3(crs3(f, Math.abs(f[1]) > .9999 ? [0, 0, -1] : [0, 1, 0])); V3.C = P; V3.f = f; V3.r = r; V3.u = crs3(r, f); }
  // координати камери (x праворуч, y угору, z — глибина); SS/SO — стягування стеку до точки SO
  function cs(X, Y, Z) { const d = [SO[0] + (X - SO[0]) * SS - V3.C[0], SO[1] + (Y - SO[1]) * SS - V3.C[1], SO[2] + (Z - SO[2]) * SS - V3.C[2]]; return [dot3(d, V3.r), dot3(d, V3.u), dot3(d, V3.f)]; }
  // проєкція; SHX — зсув об'єктива (стек — у лівих двох третинах кадру, колонка підписів — праворуч)
  const prj = (c) => { const k = F3 / c[2]; return [c[0] * k + SHX, -c[1] * k, k]; };
  function p3(X, Y, Z) { const c = cs(X, Y, Z); return c[2] < NEAR ? null : prj(c); }
  const cut3 = (a, b) => { const t = (NEAR - a[2]) / (b[2] - a[2]); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), NEAR]; };
  function polyPath(P) { const C = P.map((p) => cs(p[0], p[1], p[2])), out = [];
    for (let i = 0; i < C.length; i++) { const a = C[i], b = C[(i + 1) % C.length], ia = a[2] >= NEAR, ib = b[2] >= NEAR; if (ia) out.push(a); if (ia !== ib) out.push(cut3(a, b)); }
    if (out.length < 3) return false; x.beginPath(); out.forEach((c, i) => { const p = prj(c); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); }); x.closePath(); return true; }
  function linePath(P, close) { const C = P.map((p) => cs(p[0], p[1], p[2])), n = close ? C.length : C.length - 1; let open = false, any = false; x.beginPath();
    for (let i = 0; i < n; i++) { let a = C[i], b = C[(i + 1) % C.length]; if (a[2] < NEAR && b[2] < NEAR) { open = false; continue; }
      if (a[2] < NEAR) { a = cut3(b, a); open = false; } let end = false; if (b[2] < NEAR) { b = cut3(a, b); end = true; }
      const pa = prj(a), pb = prj(b); if (!open) x.moveTo(pa[0], pa[1]); x.lineTo(pb[0], pb[1]); open = !end; any = true; } return any; }
  // голографічний контур: широке м'яке світіння + тонка лінія
  function hstroke(col, lw = 1.2, a = 1) { x.strokeStyle = `rgba(${col},${.14 * a})`; x.lineWidth = lw * 3.5; x.stroke(); x.strokeStyle = `rgba(${col},${.8 * a})`; x.lineWidth = lw; x.stroke(); }
  function poly3(P, fillC, col, lw = 1.2, a = 1) { if (fillC && polyPath(P)) { x.fillStyle = fillC; x.fill(); } if (col && linePath(P, true)) hstroke(col, lw, a); }
  function line3(A, Bp, col, lw = 1, a = 1, dash) { if (!linePath([A, Bp], false)) return; x.save(); if (dash) { x.setLineDash(dash); } x.strokeStyle = `rgba(${col},${a})`; x.lineWidth = lw; x.stroke(); x.restore(); }
  function ring3(X, Y, Z, rx, rz, col, lw, a, dash) { const P = []; for (let j = 0; j < 48; j++) { const an = j / 48 * TAU; P.push([X + Math.cos(an) * rx, Y, Z + Math.sin(an) * rz]); }
    if (!linePath(P, true)) return; x.save(); if (dash) x.setLineDash(dash); hstroke(col, lw, a); x.restore(); }
  // текстура на площині: кут O, ребра A (ширина) і Bv (висота), плитки nx × ny — кожна зі своєю афінною проєкцією
  function tex3(img, O, A, Bv, nx, ny, a) {
    if (!img || a <= 0) return; const iw = img.width, ih = img.height, sw = iw / nx, sh = ih / ny;
    // плитки малюються непрозоро в окремий шар (інакше на стиках перекриття світліші), шар — у кадр із прозорістю
    const X0 = x, m = x.getTransform(), A0 = x.globalAlpha * a; if (lay.width !== X0.canvas.width || lay.height !== X0.canvas.height) { lay.width = X0.canvas.width; lay.height = X0.canvas.height; }
    lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(0, 0, lay.width, lay.height); lx.setTransform(m); lx.globalAlpha = 1; x = lx; x.save();
    const P = (s, t) => cs(O[0] + A[0] * s + Bv[0] * t, O[1] + A[1] * s + Bv[1] * t, O[2] + A[2] * s + Bv[2] * t);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const c0 = P(i / nx, j / ny), c1 = P((i + 1) / nx, j / ny), c2 = P(i / nx, (j + 1) / ny), c3 = P((i + 1) / nx, (j + 1) / ny);
      if (Math.min(c0[2], c1[2], c2[2], c3[2]) < NEAR * 1.6) continue; const p0 = prj(c0), p1 = prj(c1), p2 = prj(c2);
      x.save(); x.transform((p1[0] - p0[0]) / sw, (p1[1] - p0[1]) / sw, (p2[0] - p0[0]) / sh, (p2[1] - p0[1]) / sh, p0[0], p0[1]); const ex = sw * .03, ey = sh * .03; x.drawImage(img, i * sw, j * sh, sw, sh, -ex, -ey, sw + 2 * ex, sh + 2 * ey); x.restore(); }
    x.restore(); x = X0; x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = A0; x.drawImage(lay, 0, 0); x.restore(); }
  const lay = document.createElement('canvas'), lx = lay.getContext('2d');
  // кубик: x0..x1 · y0..y1 · z0..z1; op — розкриття (кришка відкидається назад, передня стінка — вперед)
  function box3(X, Y0, Z, w, d, h, col, a, op = 0) { const x0 = X - w / 2, x1 = X + w / 2, z0 = Z - d / 2, z1 = Z + d / 2, y1 = Y0 + h, fc = `rgba(${col},${.06 * a})`;
    const th = op * 1.9, ph = op * 1.35, lid = (xx, zz) => [xx, y1 + (zz - z0) * Math.sin(th), z0 + (zz - z0) * Math.cos(th)], fr = (xx, yy) => [xx, Y0 + (yy - Y0) * Math.cos(ph), z1 + (yy - Y0) * Math.sin(ph)];
    poly3([[x0, Y0, z0], [x1, Y0, z0], [x1, Y0, z1], [x0, Y0, z1]], fc, col, .8, a);
    poly3([[x0, Y0, z0], [x1, Y0, z0], [x1, y1, z0], [x0, y1, z0]], fc, col, .8, a);
    poly3([[x0, Y0, z0], [x0, Y0, z1], [x0, y1, z1], [x0, y1, z0]], fc, col, .8, a); poly3([[x1, Y0, z0], [x1, Y0, z1], [x1, y1, z1], [x1, y1, z0]], fc, col, .8, a);
    poly3([fr(x0, Y0), fr(x1, Y0), fr(x1, y1), fr(x0, y1)], fc, col, .8, a);
    poly3([lid(x0, z0), lid(x1, z0), lid(x1, z1), lid(x0, z1)], `rgba(${col},${.12 * a})`, col, 1.2, a); }
  // ── полотна-текстури (кешуються; після завантаження шрифтів перебудовуються) ──
  let TEX = {};
  function mkTex(key, w, h, fn, k = 2) { if (TEX[key]) return TEX[key]; const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const X0 = x; x = c.getContext('2d'); x.scale(k, k); try { fn(w, h); } finally { x = X0; } return (TEX[key] = c); }
  // картка фронтенду: заголовок і рядки коду (справжні рядки статті 34 і shared/blackhole-3d.js)
  const JS_SRC = ["import * as THREE from 'three';", "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';", "import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';", '', "const dl = new DRACOLoader().setDecoderPath(", "  'https://cdn.jsdelivr.net/npm/three@0.160.0/…/draco/gltf/');", "new GLTFLoader().setDRACOLoader(dl)", "  .load('assets/interstellar/ship.glb', (g) => {"];
  function codeTex(key, title, sub, toks) { return mkTex(key, 240, 200, (w, h) => { x.fillStyle = 'rgba(8,14,24,.92)'; rr(0, 0, w, h, 10); x.fill(); x.strokeStyle = `rgba(${HC},.8)`; x.lineWidth = 1.5; x.stroke();
    T(title, 14, 22, 18, `rgb(${HC})`, 'left', 700, MONO); T(sub, w - 12, 23, 9, 'rgba(220,235,245,.65)', 'right', 500, MONO); x.fillStyle = `rgba(${HC},.25)`; x.fillRect(12, 38, w - 24, 1);
    x.save(); x.beginPath(); x.rect(8, 44, w - 16, h - 52); x.clip(); x.font = `500 8.6px ${MONO}`; x.textBaseline = 'middle';
    toks.slice(0, 13).forEach((ln, i) => { let X = 14; for (const [s, c] of ln) { x.fillStyle = c; x.fillText(s, X, 54 + i * 11.4); X += x.measureText(s).width; } }); x.restore();
    for (let y = 46; y < h - 6; y += 6) { x.fillStyle = `rgba(${HC},.04)`; x.fillRect(4, y, w - 8, .8); } }); }
  const TK_JS = JS_SRC.map((s) => { const out = [], re = /('[^']*')|(\b(?:import|from|const|new)\b)|([{}()=>;,.*])|([^'{}()=>;,.*]+)/g; let m; while ((m = re.exec(s))) out.push([m[0], m[1] ? CC.str : m[2] ? CC.tag : m[3] ? CC.pun : CC.txt]); return out; });

  // ── рівні й блоки ──
  const LYS = [400, 190, -40, -260, -450], PXH = 260, PZH = 150, BUSZ = 110;
  const LVN = [['СТОРІНКА', 'браузер · 1920 × 1080'], ['ФРОНТЕНД', 'HTML · CSS · JS · 62 КБ'], ['ПРОТОКОЛИ', 'DNS · TLS 1.3 · HTTP/2'], ['СЕРВЕРИ', 'GitHub Pages · CDN · CI/CD'], ['ДАНІ', 'першоджерела · FRED']];
  const CARD = [['HTML', -195, '34-interstellar.html'], ['CSS', -65, 'threebody.css'], ['JS', 65, 'blackhole-3d.js'], ['РЕНДЕР', 195]], CW = 84, CHH = 70;
  const DNSN = [[-210, -55], [-130, -55], [-50, -55], [30, -55]], LOCK = [170, 55], GHP = [-10, 0], EDGE = [[165, -105], [165, 0], [165, 105]], CICD = [-110, -30, 50, 130];
  // вікна активності рівнів (u сцени) і ключові моменти
  const ACTW = [[4, 7.2], [7.2, 10.2], [10.2, 13.2], [13.2, 16.1]], OPEN_U = 11.5;
  // пакети: [старт u, тривалість, шлях, підпис, гарячий, рівень]
  const PK = [[5.6, 1.2, [[195, LYS[1] + 6, 26], [195, LYS[1], BUSZ], [0, LYS[1], BUSZ], [0, LYS[2] + 2, BUSZ]], 'GET /Blog/34-interstellar.html', true, 1],
    [7.9, 1.1, [[0, LYS[2] + 2, BUSZ], [-210, LYS[2] + 12, -55], [-130, LYS[2] + 12, -55], [-50, LYS[2] + 12, -55], [30, LYS[2] + 12, -55]], 'DNS ? artemzh.github.io', false, 2],
    [9.0, .55, [[30, LYS[2] + 12, -55], [LOCK[0], LYS[2] + 20, LOCK[1]]], 'TLS 1.3 · ClientHello', false, 2],
    [9.55, .6, [[LOCK[0], LYS[2] + 20, LOCK[1]], [0, LYS[2] + 2, BUSZ]], 'ServerHello · сертифікат', false, 2],
    [10.5, .8, [[0, LYS[2], BUSZ], [0, LYS[3] + 2, BUSZ], [GHP[0], LYS[3] + 2, 45]], 'GET', true, 3],
    [12.2, .9, [[GHP[0], LYS[3] + 30, 0], [165, LYS[3] + 30, 0], [165, LYS[3] + 30, BUSZ], [0, LYS[3] + 30, BUSZ]], '200 OK · 37 КБ', true, 3],
    [14.6, 1.0, [[0, LYS[4] + 40, 0], [0, LYS[4] + 40, BUSZ], [0, LYS[3] - 60, BUSZ]], 'UNRATE.csv', false, 4]];
  // підписи деталей: [рівень, якір, назва, деталь]
  const DET = [[1, [-195, LYS[1] + 76, 0], 'HTML', '34-interstellar.html'], [1, [-65, LYS[1] + 76, 0], 'CSS', 'threebody.css'], [1, [65, LYS[1] + 76, 0], 'JS', 'blackhole-3d.js · three@0.160.0'],
    [1, [195, LYS[1] + 53, 0], 'РЕНДЕР', 'DOM → CSSOM → layout → paint'],
    [2, [-210, LYS[2] + 22, -55], 'DNS', 'резолвер → . → .io → github.io'], [2, [30, LYS[2] + 22, -55], 'github.io', 'A 185.199.108.153 · AAAA …::153'], [2, [LOCK[0], LYS[2] + 40, LOCK[1]], 'TLS 1.3', 'сертифікат *.github.io → CA · HSTS'],
    [3, [GHP[0], LYS[3] + 55, 0], 'GitHub Pages', 'HTTP/2 200 · 37 857 байт'], [3, [165, LYS[3] + 24, -105], 'CDN edge', 'MISS (DUS) → HIT · max-age 600'], [3, [-225, LYS[3] + 18, -110], 'CI/CD', 'push → Actions → збірка → деплой'],
    [4, [0, LYS[4] + 48, 0], 'FRED · UNRATE.csv', 'знімок у файлі · 20.10.2026']];
  // ріст (u): аркуш 0–0,6; рівень l — нитки з u = 0,3 + 0,5 · l, далі плита, далі блоки
  const gTh = (l, u) => ez((u - .3 - .5 * l) / .3), gPl = (l, u) => l ? ez((u - .5 - .5 * l) / .3) : ez(u / .6), gBk = (l, i, u) => ez((u - .75 - .5 * l - .09 * i) / .3);
  function lvW(u) { const wide = cl(1 - ez((u - 3.8) / .5) + ez((u - 16.05) / .6)), act = [0, 0, 0, 0, 0];
    ACTW.forEach(([a, b], i) => { act[i + 1] = ez((u - a + .25) / .5) * (1 - ez((u - b + .25) / .5)); });
    return { wide, act, br: act.map((v) => Math.max(wide, .25 + .75 * v)) }; }
  // запис прямокутників для перевірки накладань (віртуальні координати кадру): b — проєкції блоків, l — підписи
  let REC = null, BR = [];
  function recPts(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0; pts.forEach((p) => { if (!p) return; n++; x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); if (n) { BR.push([x0, y0, x1, y1]); if (REC) REC.b.push([x0, y0, x1, y1]); } }
  const recBox = (X, Y0, Z, w, d, h) => { const P = []; for (const dx of [-w / 2, w / 2]) for (const dz of [-d / 2, d / 2]) for (const dy of [0, h]) P.push(p3(X + dx, Y0 + dy, Z + dz)); recPts(P); };
  // ── мир стеку: список малювання DL (шари) і LB (підписи) ──
  let DL = [], LB = [];
  const add = (y, P, fn, bias = 0) => { const c = cs(P[0], P[1], P[2]); DL.push({ y, d: c[2] + bias, fn }); };
  // v8.2 (власник: «у мережі однакові кубики»): кожен вузол — свій предмет: антена резолвера, глобус кореня, шестигранна призма TLD,
  //   циліндр github.io, щит TLS, серверна стійка GitHub Pages (слоти й світлодіоди), шестигранні вузли CDN з тарілками, конвеєр CI/CD
  //   (шестерня → шеврон → стос → стрілка вгору). Розміри — у межах колишніх кубиків (перевірка накладань не змінюється).
  function hexP(X, Y0, Z, r, h, col, a) { const P = (y) => Array.from({ length: 6 }, (_, j) => { const an = j / 6 * TAU + Math.PI / 6; return [X + Math.cos(an) * r, y, Z + Math.sin(an) * r]; });
    const B0 = P(Y0), T0 = P(Y0 + h); poly3(T0, `rgba(${col},${.12 * a})`, col, 1.1, a); poly3(B0, null, col, .7, .5 * a); for (let j = 0; j < 6; j++) line3(B0[j], T0[j], col, .8, .7 * a); }
  function cyl3(X, Y0, Z, r, h, col, a) { ring3(X, Y0, Z, r, r, col, .8, .6 * a); ring3(X, Y0 + h, Z, r, r, col, 1.1, a); ring3(X, Y0 + h * .5, Z, r, r, col, .6, .35 * a); [0, 1, 2, 3].forEach((j) => { const an = j * Math.PI / 2 + .4; line3([X + Math.cos(an) * r, Y0, Z + Math.sin(an) * r], [X + Math.cos(an) * r, Y0 + h, Z + Math.sin(an) * r], col, .7, .6 * a); }); }
  function globe3(X, Y0, Z, r, col, a, t) { const cy = Y0 + r; for (let j = -2; j <= 2; j++) { const yy = cy + j * r * .38, rr2 = Math.sqrt(Math.max(0, r * r - (yy - cy) * (yy - cy))); ring3(X, yy, Z, rr2, rr2, col, j ? .7 : 1.1, (j ? .55 : 1) * a); }
    for (let j = 0; j < 3; j++) { const an = j * Math.PI / 3 + t * .6, P = []; for (let q = 0; q <= 24; q++) { const th = q / 24 * TAU; P.push([X + Math.cos(an) * Math.sin(th) * r, cy + Math.cos(th) * r, Z + Math.sin(an) * Math.sin(th) * r]); } linePath(P, false) && hstroke(col, .7, .5 * a); } }
  function antenna3(X, Y0, Z, h, col, a, t) { box3(X, Y0, Z, 18, 18, 6, col, a); line3([X, Y0 + 6, Z], [X, Y0 + h, Z], col, 1.2, a); line3([X - 7, Y0 + 6, Z], [X, Y0 + h * .7, Z], col, .7, .6 * a); line3([X + 7, Y0 + 6, Z], [X, Y0 + h * .7, Z], col, .7, .6 * a);
    for (let j = 0; j < 3; j++) { const f = (t * .9 + j / 3) % 1; ring3(X, Y0 + h, Z, 4 + 22 * f, 4 + 22 * f, col, .8, a * (1 - f)); } }
  function shield3(X, Y0, Z, w, h, col, a) { const P = [[X - w / 2, Y0 + h, Z], [X + w / 2, Y0 + h, Z], [X + w / 2, Y0 + h * .45, Z], [X, Y0, Z], [X - w / 2, Y0 + h * .45, Z]]; poly3(P, `rgba(${col},${.14 * a})`, col, 1.3, a);
    const Q = P.map(([px, py]) => [X + (px - X) * .7, Y0 + h * .12 + (py - Y0) * .78, Z]); poly3(Q, null, col, .7, .55 * a); }
  function rack3(X, Y0, Z, w, d, h, col, a, op, t) { box3(X, Y0, Z, w, d, h, col, a, op); const fz = Z + d / 2 + .5, n = 5;
    for (let j = 1; j < n; j++) { const yy = Y0 + h * j / n; line3([X - w / 2 + 6, yy, fz], [X + w / 2 - 6, yy, fz], col, .7, .55 * a * (1 - op)); }
    for (let j = 0; j < n; j++) for (let q = 0; q < 3; q++) { const on = hash(j * 7.1 + q * 3.3 + Math.floor(t * 6 + j)) > .45, p = p3(X + w / 2 - 12 - q * 7, Y0 + h * (j + .5) / n, fz); if (p && on && op < .5) { x.fillStyle = q ? `rgba(${HC},${.9 * a})` : `rgba(82,210,115,${.9 * a})`; x.fillRect(p[0] - 1.2, p[1] - 1.2, 2.4, 2.4); } } }
  function gear3(X, Y0, Z, r, col, a, t) { const P = []; for (let q = 0; q <= 32; q++) { const an = q / 32 * TAU + t * .8, rr2 = r * (q % 4 < 2 ? 1 : .78); P.push([X + Math.cos(an) * rr2, Y0 + 9, Z + Math.sin(an) * rr2]); } linePath(P, true) && hstroke(col, 1, a); ring3(X, Y0 + 9, Z, r * .35, r * .35, col, .8, .7 * a); line3([X, Y0, Z], [X, Y0 + 9, Z], col, .7, .5 * a); }
  function chev3(X, Y0, Z, s2, col, a) { [0, 1].forEach((j) => { const zz = Z - s2 * .4 + j * s2 * .5; line3([X - s2, Y0 + 9, zz - s2 * .4], [X, Y0 + 9, zz + s2 * .3], col, 1.3, a); line3([X + s2, Y0 + 9, zz - s2 * .4], [X, Y0 + 9, zz + s2 * .3], col, 1.3, a); }); }
  function stack3(X, Y0, Z, s2, col, a) { for (let j = 0; j < 3; j++) box3(X + (j - 1) * 2, Y0 + j * 7, Z, s2 - j * 4, s2 - j * 4, 6, col, a * (1 - j * .15)); }
  function arrowUp3(X, Y0, Z, h, col, a) { line3([X, Y0, Z], [X, Y0 + h, Z], col, 1.4, a); line3([X - 8, Y0 + h - 9, Z], [X, Y0 + h, Z], col, 1.4, a); line3([X + 8, Y0 + h - 9, Z], [X, Y0 + h, Z], col, 1.4, a); ring3(X, Y0, Z, 12, 12, col, .8, .6 * a); }
  function stack(u, o = {}) {
    const W = lvW(u), dim = o.dim == null ? 1 : o.dim, br = (l) => W.br[l] * dim; DL = []; LB = []; BR = [];
    // аркуш сторінки згори
    const pa = gPl(0, u) * br(0); if (pa > 0) add(LYS[0], [0, LYS[0], 0], () => { const O = [-240, LYS[0], -135], A = [480, 0, 0], Bv = [0, 0, 270];
      tex3(IMG.page, O, A, Bv, 8, 5, .9 * pa); poly3([O, [240, LYS[0], -135], [240, LYS[0], 135], [-240, LYS[0], 135]], null, HC, 1.4, pa); }, 5000);
    for (let l = 1; l < 5; l++) {
      const Y = LYS[l], Yp = LYS[l - 1], th = gTh(l, u), pl = gPl(l, u), b = br(l), y = lerp(Y + 70, Y, eo(pl));
      // нитки з кутів рівня вище витягуються вниз до плити
      if (th > 0) add((Y + Yp) / 2, [0, (Y + Yp) / 2, 0], () => { [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => line3([sx * PXH, Yp, sz * PZH], [sx * PXH, lerp(Yp, y, th), sz * PZH], HC, .9, .35 * Math.max(b, br(l - 1)) * dim * (.45 + .55 * W.wide))); });
      if (pl > 0) add(Y, [0, Y, 0], () => { const a = pl * b; poly3([[-PXH, y, -PZH], [PXH, y, -PZH], [PXH, y, PZH], [-PXH, y, PZH]], `rgba(${HC},${.05 * a})`, HC, .9, a);
        // сітка «кварталів»
        x.save(); for (let X = -PXH + 52; X < PXH; X += 52) line3([X, y, -PZH], [X, y, PZH], HC, .5, .07 * a); for (let Z = -PZH + 50; Z < PZH; Z += 50) line3([-PXH, y, Z], [PXH, y, Z], HC, .5, .07 * a); x.restore(); }, 5000);
      if (o.la !== 0) { const na = W.wide * pl * (o.la == null ? 1 : o.la); if (na > .01) LB.push({ P: [PXH, Y, PZH], t1: LVN[l][0], t2: LVN[l][1], a: na, ord: l * 10 }); }
      // провідники рівня (статичні, тьмяні) і блоки
      const bk = (i) => gBk(l, i, u) * b;
      if (l === 1) {
        add(Y, [0, Y, 30], () => { for (let i = 0; i < 3; i++) line3([CARD[i][1] + CW / 2, Y + 41, 0], [CARD[i + 1][1] - CW / 2, Y + 41, 0], HC, 1, .45 * Math.min(bk(i), bk(i + 1)));
          // світло біжить провідниками HTML → CSS → JS → рендер
          const f = (u - 4.6) / 1.1; if (f > 0 && f < 1 && W.act[1] > .3) { const X = lerp(CARD[0][1] + CW / 2, CARD[3][1] - CW / 2, f), p = p3(X, Y + 41, 0); if (p) { x.fillStyle = `rgba(255,240,225,${W.act[1]})`; x.beginPath(); x.arc(p[0], p[1], 2.4, 0, TAU); x.fill(); } } });
        CARD.forEach(([t1, X, sub], i) => { const a = bk(i); if (a <= 0) return; const rend = !sub, h = rend ? 47 : CHH;
          add(Y + 30, [X, Y + 30, 0], () => { const O = [X - CW / 2, Y + 6 + h, 0], A = [CW, 0, 0], Bv = [0, -h, 0];
            tex3(rend ? IMG.page : codeTex('c' + t1, t1, sub, t1 === 'HTML' ? TK_HTML.slice(6) : t1 === 'CSS' ? TK_CSS.slice(2) : TK_JS), O, A, Bv, 3, 3, .92 * a);
            poly3([O, [X + CW / 2, Y + 6 + h, 0], [X + CW / 2, Y + 6, 0], [X - CW / 2, Y + 6, 0]], null, rend ? AMB : HC, 1.1, a);
            if (a > .15) recPts([p3(X - CW / 2, Y + 6 + h, 0), p3(X + CW / 2, Y + 6 + h, 0), p3(X + CW / 2, Y + 6, 0), p3(X - CW / 2, Y + 6, 0)]); }); });
      } else if (l === 2) {
        add(Y, [0, Y, 0], () => { const a = Math.min(bk(0), bk(4)); for (let i = 0; i < 3; i++) line3([DNSN[i][0] + 16, Y + 12, DNSN[i][1]], [DNSN[i + 1][0] - 16, Y + 12, DNSN[i + 1][1]], HC, 1, .45 * a, [3, 4]);
          line3([DNSN[3][0], Y + 12, DNSN[3][1] + 16], [LOCK[0] - 27, Y + 20, LOCK[1]], AMB, 1, .4 * a); line3([LOCK[0], Y + 2, LOCK[1] + 27], [0, Y + 2, BUSZ], AMB, 1, .3 * a); });
        DNSN.forEach(([X, Z], i) => { const a = bk(i); if (a > 0) add(Y + 11, [X, Y + 11, Z], () => { if (i === 0) antenna3(X, Y, Z, 34, HC, a, u); else if (i === 1) globe3(X, Y, Z, 16, HC, a, u); else if (i === 2) hexP(X, Y, Z, 16, 22, HC, a); else cyl3(X, Y, Z, 15, 24, HC, a); if (a > .15) recBox(X, Y, Z, 32, 32, 22); }); });
        const la = bk(4); if (la > 0) add(Y + 20, [LOCK[0], Y + 20, LOCK[1]], () => { hexP(LOCK[0], Y, LOCK[1], 26, 6, AMB, la); shield3(LOCK[0], Y + 6, LOCK[1], 40, 38, AMB, la); if (la > .15) recBox(LOCK[0], Y, LOCK[1], 54, 54, 40);
          const s = p3(LOCK[0], Y + 40, LOCK[1]); if (s) { x.save(); const k = Math.min(2.4, s[2] * 1.1); x.translate(s[0], s[1] - 10 * k); x.scale(k, k); x.globalAlpha *= la; x.strokeStyle = `rgb(${AMB})`; x.lineWidth = 1.6; x.beginPath(); x.arc(0, -6, 5, Math.PI, 0); x.stroke(); x.fillStyle = `rgba(${AMB},.9)`; rr(-7, -6, 14, 11, 2); x.fill(); x.restore(); } });
      } else if (l === 3) {
        const op = ez((u - OPEN_U) / .7);
        add(Y, [0, Y, 0], () => { const a = bk(0); EDGE.forEach(([X, Z]) => line3([GHP[0] + 55, Y + 25, 0], [X - 17, Y + 12, Z], HC, 1, .3 * a, [4, 5]));
          for (let i = 0; i < 3; i++) line3([-225, Y + 9, CICD[i] + 14], [-225, Y + 9, CICD[i + 1] - 14], AMB, 1, .5 * a, [5, 4]); line3([-211, Y + 9, CICD[3]], [GHP[0] - 55, Y + 20, 30], AMB, 1, .4 * a, [5, 4]);
          // CI/CD: світло біжить ланцюжком push → Actions → збірка → деплой
          if (W.act[3] > .3) { const f = ((u - 10.4) / 1.4) % 1, seg = Math.min(2.999, f * 3), i = Math.floor(seg), p = p3(-225, Y + 9, lerp(CICD[i] + 14, CICD[i + 1] - 14, seg - i)); if (p && u > 10.4) { x.fillStyle = `rgba(255,236,215,${W.act[3]})`; x.beginPath(); x.arc(p[0], p[1], 2.2, 0, TAU); x.fill(); } } });
        const ga = bk(0); if (ga > 0) add(Y + 27, [GHP[0], Y + 27, 0], () => { rack3(GHP[0], Y, 0, 110, 80, 55, AMB, ga, op, u); if (ga > .15) recBox(GHP[0], Y, 0, 110, 80, 55);
          // кубик розкривається — з нього піднімається файл сторінки
          if (op > .05) { const r = eo((op - .05) / .95), O = [GHP[0] - 30, Y + 30 + 50 * r, 0], A = [60, 0, 0], Bv = [0, -34, 0]; tex3(IMG.page, O, A, Bv, 2, 2, .95 * r * ga); poly3([O, [GHP[0] + 30, O[1], 0], [GHP[0] + 30, O[1] - 34, 0], [GHP[0] - 30, O[1] - 34, 0]], null, '255,240,225', 1, r * ga); } });
        EDGE.forEach(([X, Z], i) => { const a = bk(1 + i); if (a > 0) add(Y + 12, [X, Y + 12, Z], () => { hexP(X, Y, Z, 17, 16, i === 1 ? AMB : HC, a); antenna3(X, Y + 16, Z, 14, i === 1 ? AMB : HC, .7 * a, u + i * .3); if (a > .15) recBox(X, Y, Z, 34, 34, 24); }); });
        CICD.forEach((Z, i) => { const a = bk(4 + i); if (a > 0) add(Y + 9, [-225, Y + 9, Z], () => { if (i === 0) gear3(-225, Y, Z, 14, AMB, a, u); else if (i === 1) chev3(-225, Y, Z, 12, AMB, a); else if (i === 2) stack3(-225, Y, Z, 26, AMB, a); else arrowUp3(-225, Y, Z, 26, AMB, a); if (a > .15) recBox(-225, Y, Z, 28, 28, 18); }); });
      } else {
        const a = bk(0); if (a > 0) add(Y + 20, [0, Y + 20, 0], () => { for (let i = 0; i < 4; i++) ring3(0, Y + i * 13, 0, 70, 50, AMB, 1, .75 * a); [[-70, 0], [70, 0], [0, -50], [0, 50]].forEach(([dx, dz]) => line3([dx, Y, dz], [dx, Y + 39, dz], AMB, .8, .5 * a));
          line3([0, Y + 40, 0], [0, Y + 40, BUSZ], AMB, 1, .35 * a, [4, 5]); if (a > .15) recBox(0, Y, 0, 140, 100, 40); });
      }
      // підписи деталей активного рівня
      if (o.la !== 0) DET.forEach(([lv, P, t1, t2], j) => { if (lv !== l) return; const da = W.act[l] * (1 - W.wide) * (o.la == null ? 1 : o.la); if (da > .01) LB.push({ P, t1, t2, a: da, ord: l * 10 + 1 + j * .01, det: true }); });
    }
    // шина між рівнями (центр — фронт плит)
    add(LYS[2] - 100, [0, LYS[2], BUSZ], () => { for (let l = 1; l < 4; l++) { const a = Math.min(gPl(l, u), gPl(l + 1, u)) * .3 * dim; if (a > 0) line3([0, LYS[l], BUSZ], [0, LYS[l + 1], BUSZ], HC, .8, a, [2, 5]); } }, -5000);
    // пакети — лише на активному рівні
    if (o.pk !== false) PK.forEach(([t0, d, P, s, hot, lv]) => { const k = (u - t0) / d; if (k <= 0 || k >= 1) return; const a = W.act[lv] * Math.min(cl(k * 8), cl((1 - k) * 8)); if (a <= .01) return;
      // рівномірний рух уздовж ламаної
      const L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(...sub3(P[i], P[i - 1])); L.push(l); tot += l; } let s0 = ez(k) * tot, i = 0; while (i < L.length - 1 && s0 > L[i]) { s0 -= L[i]; i++; }
      const f = cl(s0 / L[i]), Q = [lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f), lerp(P[i][2], P[i + 1][2], f)];
      add(Q[1] + 40, Q, () => { const p = p3(...Q); if (!p) return; glow(p[0], p[1], 9 * Math.min(2, p[2] * 1.3), `rgba(${AMB},.6)`, a); x.save(); x.globalAlpha *= a; x.fillStyle = 'rgb(255,240,225)'; x.beginPath(); x.arc(p[0], p[1], 2.6, 0, TAU); x.fill(); x.restore(); }, -9000);
      // підпис пакета — лише посередині шляху (на кінцях він ліг би на блок)
      const ca = a * Math.min(ez((k - .12) / .15), 1 - ez((k - .73) / .15)); if (ca > .01) LB.push({ chip: s, Q, hot, a: ca }); });
  }
  // список малювання: шари від дальнього рівня до ближнього (за висотою від камери), усередині — за глибиною
  function flush() { const cy = V3.C[1] / (SS || 1); DL.forEach((it) => { it.k = Math.round(Math.abs(it.y - cy) / 25) * 1e5 + it.d; }); DL.sort((a, b) => b.k - a.k); DL.forEach((it) => it.fn()); }
  // колонка підписів праворуч: порядок фіксований (рівень → деталь), висота — біля якоря, без накладань; виносна лінія до якоря
  const COLX = () => hw - 238;
  function labels(la = 1) {
    const L = LB.filter((l) => !l.chip && l.a * la > .01).map((l) => { const p = p3(...l.P); return p ? { ...l, p } : null; }).filter(Boolean).sort((a, b) => a.ord - b.ord);
    const X0 = COLX(), top = -hh + 84, bot = hh - 46, gap = 8;
    L.forEach((l) => { x.font = `700 10px ${MONO}`; x.letterSpacing = '1.5px'; const w1 = x.measureText(l.t1).width; x.letterSpacing = '0px'; x.font = `500 8px ${MONO}`; const w2 = l.t2 ? x.measureText(l.t2).width : 0;
      l.w = Math.max(w1, w2) + 16; l.h = l.t2 ? 32 : 20; l.y = Math.max(top + l.h / 2, Math.min(bot - l.h / 2, l.p[1])); });
    for (let i = 1; i < L.length; i++) L[i].y = Math.max(L[i].y, L[i - 1].y + L[i - 1].h / 2 + L[i].h / 2 + gap);
    for (let i = L.length - 1; i >= 0; i--) { const lim = i === L.length - 1 ? bot : L[i + 1].y - L[i + 1].h / 2 - gap; L[i].y = Math.min(L[i].y, lim - L[i].h / 2); }
    L.forEach((l) => { const a = l.a * la, Y = l.y; x.save(); x.globalAlpha *= a;
      x.strokeStyle = `rgba(${HC},.5)`; x.lineWidth = .8; x.beginPath(); x.moveTo(l.p[0], l.p[1]); x.lineTo(X0 - 18, Y); x.lineTo(X0 - 4, Y); x.stroke(); x.fillStyle = `rgba(${HC},.95)`; x.fillRect(l.p[0] - 1.6, l.p[1] - 1.6, 3.2, 3.2);
      x.fillStyle = 'rgba(5,8,14,.82)'; rr(X0, Y - l.h / 2, l.w, l.h, 5); x.fill(); x.strokeStyle = `rgba(${HC},${l.det ? .35 : .55})`; x.stroke();
      x.letterSpacing = '1.5px'; T(l.t1, X0 + 8, Y - (l.t2 ? 7 : 0), 10, l.det ? '#eaf6ff' : `rgb(${HC})`, 'left', 700, MONO); x.letterSpacing = '0px';
      if (l.t2) T(l.t2, X0 + 8, Y + 8, 8, 'rgba(220,235,245,.75)', 'left', 500, MONO); x.restore();
      if (REC && a > .05) REC.l.push([X0, Y - l.h / 2, X0 + l.w, Y + l.h / 2]); });
    // підписи пакетів — над точкою
    LB.filter((l) => l.chip).forEach((l) => { const p = p3(...l.Q); if (!p) return; x.font = `600 8.5px ${MONO}`; const cw = x.measureText(l.chip).width + 11, cr = [p[0] - cw / 2, p[1] - 22, p[0] + cw / 2, p[1] - 6];
      // підпис пакета поступається блокам: що більше він лягав би на блок, то прозоріший (плавно, без вискакування)
      let ov = 0; BR.forEach((q) => { ov = Math.max(ov, Math.max(0, Math.min(cr[2], q[2]) - Math.max(cr[0], q[0])) * Math.max(0, Math.min(cr[3], q[3]) - Math.max(cr[1], q[1])) / (cw * 16)); });
      const a = l.a * la * (1 - cl(ov * 40)); if (a <= .01) return; chip(l.chip, p[0], p[1] - 14, l.hot ? '#fff' : `rgb(${AMB})`, 8.5, l.hot ? 'rgba(120,45,20,.95)' : 'rgba(8,10,16,.92)', a);
      if (REC && a > .05) { x.font = `600 8.5px ${MONO}`; const w = x.measureText(l.chip).width + 8.5 * 1.3, h = 8.5 * 1.9; REC.l.push([p[0] - w / 2, p[1] - 14 - h / 2, p[0] + w / 2, p[1] - 14 + h / 2]); } });
  }
  // ── камера: [u, ціль G, азимут°, висота°, відстань, зсув об'єктива, зупинка] — кубічний Ерміт: у точках зупинки швидкість нуль
  //    (кожен рух починається й закінчується плавно), у проміжних (зсув убік) — неперервна. Зсув убік = рух ціллю вздовж «праворуч» камери.
  const tr = (G, az, s) => [G[0] + s * Math.cos(az * DEG), G[1], G[2] - s * Math.sin(az * DEG)];
  const CK = [[0, [0, -20, 0], 36, 20, 2250, -120, 1], [3.6, [0, -15, 0], 33, 19, 2120, -120, 1],
    [4.8, [0, LYS[1] + 10, 0], 30, 15, 1150, -135, 1], [5.6, tr([0, LYS[1] + 10, 0], 30, -110), 30, 14, 1100, -135, 0], [6.8, [120, LYS[1] + 30, 0], 24, 9, 640, -150, 1],
    [7.8, [-20, LYS[2] + 10, 0], 31, 15, 1100, -135, 1], [8.6, tr([-20, LYS[2] + 10, 0], 31, -110), 31, 14, 1050, -135, 0], [9.8, [70, LYS[2] + 15, 20], 22, 10, 600, -150, 1],
    [10.8, [0, LYS[3] + 10, 0], 31, 15, 1150, -135, 1], [11.5, tr([0, LYS[3] + 10, 0], 31, -100), 31, 14, 1100, -135, 0], [12.8, [GHP[0], LYS[3] + 50, 10], 24, 11, 560, -205, 1],
    [13.8, [0, LYS[4] + 10, 0], 31, 14, 1050, -135, 1], [14.6, tr([0, LYS[4] + 10, 0], 31, -80), 31, 12, 980, -135, 0], [15.6, [0, LYS[4] + 30, 20], 25, 9, 600, -150, 1],
    [17.2, [0, -30, 0], 34, -13, 2350, 0, 1], [18, [0, -30, 0], 34, -13, 2350, 0, 1]];
  const CV = CK.map((k) => [...k[1], k[2], k[3], LN(k[4]), k[5]]);
  function stackCam(u) { const n = CK.length - 1; u = Math.max(0, Math.min(CK[n][0], u)); let i = 0; while (i < n - 1 && u >= CK[i + 1][0]) i++;
    const t0 = CK[i][0], t1 = CK[i + 1][0], h = t1 - t0, s = (u - t0) / h, h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
    const tan = (j) => (CK[j][6] || j === 0 || j === n ? CV[j].map(() => 0) : CV[j].map((v, q) => (CV[j + 1][q] - CV[j - 1][q]) / (CK[j + 1][0] - CK[j - 1][0])));
    const m0 = tan(i), m1 = tan(i + 1), v = CV[i].map((a, q) => h00 * a + h10 * h * m0[q] + h01 * CV[i + 1][q] + h11 * h * m1[q]);
    const G = [v[0], v[1], v[2]], az = v[3] * DEG, el = v[4] * DEG, D = Math.exp(v[5]); SHX = v[6]; F3 = 1100;
    look([G[0] + D * Math.cos(el) * Math.sin(az), G[1] + D * Math.sin(el), G[2] + D * Math.cos(el) * Math.cos(az)], G); return G; }
  // підписи сцени за ділянками
  const DIVE = [[0, 4, 'Сторінка — це стек'], [4, 7.2, 'Фронтенд: HTML · CSS · JS → рендер'], [7.2, 10.2, 'Протоколи: DNS · TLS 1.3'], [10.2, 13.2, 'Сервери: GitHub Pages · CDN · CI/CD'], [13.2, 16.2, 'Дані: FRED'], [16.2, 18, 'Увесь стек знизу']];
  // 7. Мережа (18 с): стек проростає → кран уздовж колони по рівнях → загальний план знизу
  // v8 (власник: «не води камерою по бекенду — укачує; лише вперед»): один безперервний рух — камера повільно підходить і опускається
  // уздовж колони згори вниз, без бокових зсувів і без відльоту назад. На старті збігається з кінцем «Бітів» (stackCam(0))
  function stackCam2(u) { const k = ez((u - .4) / 17), Y = lerp(250, -450, k), D = Math.exp(lerp(LN(1300), LN(1150), ez(u / 18))), el = lerp(20, 12, ez(u / 18)) * DEG, az = 36 * DEG;
    SHX = -120; F3 = 1100; const G = [0, Y, 0]; look([D * Math.cos(el) * Math.sin(az), Y + D * Math.sin(el), D * Math.cos(el) * Math.cos(az)], G); return G; }
  function sDive(u, len) { bgDesk(1); REC = { b: [], l: [] }; stackCam2(u); SS = 1; SO = [0, 0, 0];
    stack(u); flush(); if (u < 10) bitsRain(3.9 + u / 1.5, 1 - ez((u - 6) / 3.5)); const c0 = p3(0, LYS[0], 60); if (c0 && u < 3) macroDOF(c0[1], 60, 5 * (1 - ez(u / 3))); labels(1);
    DIVE.forEach(([a, b, s]) => { if (u >= a - .3 && u < b + .3) cap('МЕРЕЖА', s, u - a, b - a); }); }

  // ══ v8 · БІТИ: макро на рядок коду → аркуш коду лягає площиною, камера йде вбік → з-під аркуша вниз сиплються 0 і 1 ══
  // Аркуш коду — на місці аркуша сторінки в стеку (y = LYS[0], 480 × 270), тож наприкінці кадр збігається з першим кадром стеку (stackCam(0)).
  const edTex = () => mkTex('edEnd', EW, EH, () => editor(ED_END), 1.5);
  const BK = [[0, [0, LYS[0], 0], 0, 89.5, 697, 0], [1.4, [-60, LYS[0], 10], 0, 89.5, 260, 0], [3.9, [0, 250, 0], 36, 20, 1300, -120]];
  function bitsCam(u) { const i = u < BK[1][0] ? 0 : 1, a = BK[i], b = BK[i + 1], k = ez((u - a[0]) / (b[0] - a[0])), G = a[1].map((g, j) => lerp(g, b[1][j], k));
    const az = lerp(a[2], b[2], k) * DEG, el = lerp(a[3], b[3], k) * DEG, D = Math.exp(lerp(LN(a[4]), LN(b[4]), k)); SHX = lerp(a[5], b[5], k); F3 = 1100;
    look([G[0] + D * Math.cos(el) * Math.sin(az), G[1] + D * Math.sin(el), G[2] + D * Math.cos(el) * Math.cos(az)], G); }
  // цифровий дощ: tb — секунди від початку «Бітів»; біт народжується під аркушем і падає вниз крізь рівні стеку
  function bitsRain(tb, a = 1) {
    a *= cl((.93 + V3.f[1]) / .3); if (a <= 0) return; x.save(); x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let i = 0; i < 560; i++) { const t0 = 1 + hash(i * 3.1) * 4.6, dt = tb - t0; if (dt <= 0) continue;
      const v = 240 + 380 * hash(i * 5.3), Y = LYS[0] - 6 - v * dt; if (Y < LYS[4] - 160) continue;
      const p = p3((hash(i) * 2 - 1) * 228, Y, (hash(i * 1.7) * 2 - 1) * 128); if (!p) continue; const fs = 15 * p[2]; if (fs < 2.2) continue;
      const al = a * ez(dt / .15) * (1 - ez((LYS[4] - 60 - Y) / 100)), warm = hash(i * 7.7) < .14;
      x.font = `600 ${fs.toFixed(1)}px ${MONO}`; x.fillStyle = warm ? `rgba(${AMB},${.85 * al})` : `rgba(${HC},${.8 * al})`; x.fillText(hash(i * 9.1) < .5 ? '0' : '1', p[0], p[1]); }
    x.restore();
  }
  function sBits(u, len) { bgDesk(1); bitsCam(u); SS = 1; SO = [0, 0, 0];
    const O = [-240, LYS[0], -135], A = [480, 0, 0], Bv = [0, 0, 270]; tex3(edTex(), O, A, Bv, 12, 7, 1); poly3([O, [240, LYS[0], -135], [240, LYS[0], 135], [-240, LYS[0], 135]], null, HC, 1.4, ez((u - 1.2) / .8));
    bitsRain(u, 1); const mk = ez((u - 1.9) / .8), c = p3(0, LYS[0], 60); if (mk > 0 && c) macroDOF(c[1], 55, 5 * mk);
    cap('КОД', 'Код → нулі й одиниці', u, len); }

  // ══ v8 · МІСТО «ІНТЕРНЕТ»: камера відлітає від стеку — наша сторінка лише одна вежа серед тисяч ══
  // Цифрове нічне місто в дусі «Того, що біжить по лезу»: вежі-сервери з вікнами-рядками, неон, туман, дощ, потоки даних уздовж вулиць
  // і дуги від нашої вежі до інших. Підписів-плашок немає. Земля — y = −700, квартал 1300; наш стек — у центральному кварталі.
  const CG = -700, CS = 1300, CITY = [];
  for (let gi = -8; gi <= 8; gi++) for (let gj = -10; gj <= 3; gj++) { if (Math.abs(gi) <= 1 && Math.abs(gj) <= 1) continue; const hh0 = hash(gi * 31.7 + gj * 7.3 + 100), r = Math.max(Math.abs(gi), Math.abs(gj));   // v10.5: менше веж — лише смуга міста попереду камери
    CITY.push({ gi, gj, X: gi * CS + (hash(gi * 3.3 + gj) - .5) * 220, Z: gj * CS + (hash(gj * 5.1 + gi) - .5) * 220, w: 360 + 420 * hash(gi * 9.7 - gj), d: 360 + 420 * hash(gj * 4.4 + gi * 2),
      h: (900 + 5600 * Math.pow(hh0, 2.2)) * (r === 1 ? .55 : 1), neon: hash(gi * 2.9 + gj * 8.1) > .5, nc: hash(gi + gj * 13) < .5 ? '255,80,170' : HC, txt: ['200 OK', 'GET /', 'DNS', 'TLS 1.3', 'HTTP/2', '</>', '{ }', 'git push', 'CDN'][Math.floor(hash(gi * 1.3 + gj * 2.7) * 9)] }); }
  // за сіткою — горизонт: тисячі вогнів далеких кварталів (точки на землі й на «дахах» до 60 км)
  { const H0 = CITY.find((c) => c.gi === 1 && c.gj === -2); if (H0) Object.assign(H0, { h: Math.max(H0.h, 4600), w: 820, d: 700, neon: false, hero: 1 }); }
  const SKY = []; for (let i = 0; i < 1100; i++) { const an = hash(i * 1.31) * TAU, r = 15500 + 46000 * Math.pow(hash(i * 2.17), .7); SKY.push([Math.cos(an) * r, CG + 2600 * Math.pow(hash(i * 3.7), 2.5), Math.sin(an) * r, hash(i * 5.9) < .7]); }
  // v8: політ лише вперед — з кінця стеку камера пролітає повз нашу вежу й летить уздовж вулиці (x = 650), повільно набираючи висоту;
  // погляд за 1,5 с повертає з вежі на напрямок руху
  const CP = [[661, -211, 910], [650, -60, -400], [650, 250, -2000], [650, 1900, -3000], [650, 3300, -4800]], CDL = [0];
  for (let i = 1; i < CP.length; i++) CDL.push(CDL[i - 1] + Math.hypot(...sub3(CP[i], CP[i - 1])));
  function cpAt(sd) { sd = Math.max(0, Math.min(CDL[CDL.length - 1], sd)); let i = 0; while (i < CP.length - 2 && sd > CDL[i + 1]) i++; const t = (sd - CDL[i]) / (CDL[i + 1] - CDL[i]);
    const P0 = CP[Math.max(0, i - 1)], P1 = CP[i], P2 = CP[i + 1], P3 = CP[Math.min(CP.length - 1, i + 2)];
    return [0, 1, 2].map((q) => .5 * (2 * P1[q] + (-P0[q] + P2[q]) * t + (2 * P0[q] - 5 * P1[q] + 4 * P2[q] - P3[q]) * t * t + (-P0[q] + 3 * P1[q] - 3 * P2[q] + P3[q]) * t * t * t)); }
  const sdOf = (u) => CDL[CDL.length - 1] * (u / 10 * .55 + .45 * Math.pow(u / 10, 1.6));
  function cityCam(u) { const sd = sdOf(u), P = cpAt(sd), A = cpAt(sd + 600), tw = ez(u / 1.5);
    // погляд — далеко вперед уздовж вулиці; над дахами камера дивиться вниз ~22°, горизонт із вогнями — у верхній третині кадру
    const F9 = [P[0], P[1] - lerp(150, 900, ez((u - 4.2) / 4.5)), P[2] - 9000], G = [lerp(0, F9[0], tw), lerp(-450, F9[1], tw), lerp(0, F9[2], tw)]; SHX = lerp(-120, 0, tw); F3 = 1100; look(P, G); return 2500; }
  // одна вежа: видимі грані (темні, неонові ребра), вікна-рядки, неонова панель, вогонь на даху; f — туман
  // v8.2: високі вежі — з уступами (2–3 яруси) і шпилем з вогнем, як у кіно-мегаполісах; яруси малюються тим самим towerBox
  function tower(T0, f, ct, ta) {
    if (T0.h < 2600 || T0.hero) return towerBox(T0, f, ct, ta);
    const h1 = T0.h * .6, h2 = T0.h * .26, h3 = T0.h * .1;
    towerBox({ ...T0, h: h1, base: T0 }, f, ct, ta); towerBox({ ...T0, w: T0.w * .72, d: T0.d * .72, h: h2, b: CG + h1, neon: false, top: T0.h > 3600 ? 0 : 1, base: T0 }, f, ct, ta);
    towerBox({ ...T0, w: T0.w * .42, d: T0.d * .42, h: h3, b: CG + h1 + h2, neon: false, top: 1, base: T0 }, f, ct, ta);
    const yT = CG + h1 + h2 + h3, sp = 260 + 500 * hash(T0.X * .3 + T0.Z); line3([T0.X, yT, T0.Z], [T0.X, yT + sp, T0.Z], T0.neon ? T0.nc : HC, 1, .7 * f * ta);
    const c = p3(T0.X, yT + sp, T0.Z); if (c) { const bl = .5 + .5 * Math.sin(ct * 3.1 + T0.X * .01); glow(c[0], c[1], Math.max(3, 70 * c[2]), `rgba(255,60,50,${.85 * f})`, bl * ta); }
  }
  // повітряна перспектива: що далі вежа — то ближче її колір до імли горизонту (пурпурово-бурштиновий серпанок), а не до чорного
  // v10.4: шари серпанку світліші — ближні вежі темно-сині, дальні розчиняються в пурпурово-синій імлі (глибина, як у референсі)
  const HAZE = [58, 40, 78], hazeMix = (f) => [14, 19, 30].map((v, i) => Math.round(lerp(HAZE[i], v, Math.pow(f, .6))));
  // v10 (референс — «Той, що біжить по лезу»): вежі — суцільні темні моноліти, фасад густо всипаний вікнами (процедурні текстури),
  //   без неонових ребер; на кількох вежах уздовж вулиці — екрани з іншими сайтами (наша сторінка й статті 33, 35, 36)
  const FAC = [0, 1, 2, 3].map((v) => () => mkTex('fac' + v, 256, 1024, (w, h) => { x.fillStyle = '#05070b'; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(70,85,105,.16)'; for (let X = 0; X < w; X += 16) x.fillRect(X, 0, 1.4, h);
    for (let Y = 3; Y < h; Y += 5) { const band = hash(v * 31 + Y * .37) < .08; if (band) { x.fillStyle = 'rgba(40,50,64,.5)'; x.fillRect(0, Y - 1, w, 5); continue; }
      for (let X = 2; X < w; X += 4) { const r = hash(v * 17.3 + X * 1.91 + Y * 7.17); if (r > .52 + .12 * v) continue; const k = hash(X * 3.1 + Y * .7 + v);
        x.fillStyle = k < .55 ? `rgba(255,${190 + Math.round(40 * k)},${120 + Math.round(60 * k)},${.45 + .5 * r})` : k < .85 ? `rgba(175,215,255,${.4 + .5 * r})` : `rgba(255,250,235,${.6 + .4 * r})`; x.fillRect(X, Y, 1.6, 2); } } }, 1));
  // фасад: текстура вікон на грані O + s·A + t·Bv; горизонтальними смугами (перспектива ≈ пласкими шматками), вибірка — відрізок текстури за розміром грані
  function facade(img, O, A, Bv, sw, sh, ny, a, sy = 0) { if (!img || a <= 0) return; const P = (s2, t2) => cs(O[0] + A[0] * s2 + Bv[0] * t2, O[1] + A[1] * s2 + Bv[1] * t2, O[2] + A[2] * s2 + Bv[2] * t2), hs = sh / ny;
    x.save(); x.globalAlpha *= a; for (let j = 0; j < ny; j++) { const c0 = P(0, j / ny), c1 = P(1, j / ny), c2 = P(0, (j + 1) / ny), c3 = P(1, (j + 1) / ny); if (Math.min(c0[2], c1[2], c2[2], c3[2]) < NEAR * 1.6) continue;
      const p0 = prj(c0), p1 = prj(c1), p2 = prj(c2); x.save(); x.transform((p1[0] - p0[0]) / sw, (p1[1] - p0[1]) / sw, (p2[0] - p0[0]) / hs, (p2[1] - p0[1]) / hs, p0[0], p0[1]); x.drawImage(img, 0, sy + j * hs, sw, hs, 0, 0, sw * 1.01, hs * 1.04); x.restore(); } x.restore(); }
  // екрани на південних гранях (обернені до камери, що летить на північ): [gi, gj, зображення, герой]; герой — наша сторінка на вежі (1, −3)
  let FRM = 0; const SMI = {};
  const smallImg = (k) => SMI[k] || (IMG[k] ? (SMI[k] = (() => { const im = IMG[k], sc = Math.min(1, 640 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c; })()) : null);
  // v10.4: сітілайти — згенеровані в ChatGPT неонові екрани (assets/skill/city): Gantt, Jarvis, японська вивіска, GEO, «Interstellar»
  const BB = [[1, -2, 'bb_jarvis', 1]];
  // v10.6: навісні екрани над вулицею (x ≈ 650), обернені до камери, що летить на північ: [зображення, x центру, y низу, z, ширина]
  const HANG = [['bb_gantt', 260, 330, -4000, 330], ['bb_geo', 1050, 470, -5600, 640], ['bb_japan', 250, 300, -7200, 330], ['bb_jarvis', 1050, 450, -8800, 640]];
  function hangSigns(ct, ta) { const C = V3.C;
    HANG.slice().sort((a, b) => Math.abs(b[3] - C[2]) - Math.abs(a[3] - C[2])).forEach(([k, X, Y, Z, w], i) => { if (Z > C[2] - 60) return; const im = smallImg(k); if (!im) return;
      const h = w * im.height / im.width, c = p3(X, Y + h / 2, Z); if (!c) return; const fk = .88 + .12 * Math.sin(ct * 8 + i * 2) * Math.sin(ct * 2.1 + i);
      glow(c[0], c[1], Math.max(30, w * 1.3 * c[2]), 'rgba(150,185,255,.22)', ta * fk);
      line3([X - w * .3, Y + h, Z], [X - w * .3, Y + h + 400, Z], '40,50,60', 2, .6 * ta); line3([X + w * .3, Y + h, Z], [X + w * .3, Y + h + 400, Z], '40,50,60', 2, .6 * ta);
      facade(im, [X - w / 2, Y + h, Z], [w, 0, 0], [0, -h, 0], im.width, im.height, 4, .97 * fk * ta);
      poly3([[X - w / 2, Y, Z], [X + w / 2, Y, Z], [X + w / 2, Y + h, Z], [X - w / 2, Y + h, Z]], null, '120,140,170', 1, .5 * ta); }); }   // v10.5: «Фізику «Інтерстеллара»» прибрано (власник)
  function towerBox(T0, f, ct, ta) {
    const { X, Z, w, d, h } = T0, y0 = T0.b == null ? CG : T0.b, x0 = X - w / 2, x1 = X + w / 2, z0 = Z - d / 2, z1 = Z + d / 2, y1 = y0 + h, C = V3.C, a = (.25 + .75 * f) * ta;
    const cc = cs(X, y0 + h / 2, Z); if (cc[2] < -Math.max(w, d)) return;   // за камерою
    const hm = hazeMix(f), fx = C[0] > X ? x1 : x0, fz = C[2] > Z ? z1 : z0, dark = `rgba(${hm[0]},${hm[1]},${hm[2]},${.97 * ta})`, rim = `rgba(150,170,200,${.16 * ta})`;
    const FA = [[fx, y0, z0], [fx, y0, z1], [fx, y1, z1], [fx, y1, z0]], FB = [[x0, y0, fz], [x1, y0, fz], [x1, y1, fz], [x0, y1, fz]];
    // далека або дрібна вежа — лише силует і вогні вікон крапками
    if (cc[2] > 9000 && h * F3 / cc[2] < 140) { const sil = `rgba(10,7,15,${.97 * ta})`; poly3(FA, sil, null); poly3(FB, sil, null);
      x.fillStyle = `rgba(255,205,150,${.75 * ta})`; for (let q = 1; q < 9; q++) if (hash(X * .07 + q * 2.3 + Z * .03) < .55) { const wp = p3(lerp(x0, x1, hash(q * 1.7 + X)), y0 + h * q / 9, fz); if (wp) x.fillRect(wp[0] - .7, wp[1] - .7, 1.4, 1.4); } return; }
    poly3(FA, dark, null); poly3(FB, dark, null);
    // ближні вежі — текстура вікон на обох видимих гранях (вибірка за розміром: ~1 піксель текстури на 7 одиниць світу)
    // v10.3 (власник: «прибери вікна, подумай над альтернативою»): замість текстури — розсип окремих вогників на гранях, як у референсі;
    //   точки розкладені один раз на вежу, кадр їх лише проєктує (дешево); розмір — від відстані
    if (cc[2] < 11000 && (T0._tx === FRM || (T0.base && T0.base._tx === FRM))) { const B0 = T0.base || T0, key = (T0.b || 0) + ':' + Math.round(w);
      const L = (B0._lt = B0._lt || {})[key] || (B0._lt[key] = Array.from({ length: Math.round(Math.min(70, h / 60)) }, (_, i) => { const r = hash(X * .011 + Z * .017 + i * 1.913 + w);
        return [hash(i * 3.7 + X) , hash(i * 5.3 + Z + w), r < .6 ? '255,196,130' : r < .85 ? '175,215,255' : '255,250,235', .45 + .55 * hash(i * 7.1 + h)]; }));
      const fa = (.5 + .5 * f) * ta;
      const LP = {}; L.forEach(([s1, s2, col], i) => { const onA = i % 2 === 0, P = onA ? [fx, y0 + h * s2, lerp(z0 + 20, z1 - 20, s1)] : [lerp(x0 + 20, x1 - 20, s1), y0 + h * s2, fz], q = p3(P[0], P[1], P[2]); if (!q) return;
        const r = Math.max(.8, Math.min(4, 26 * q[2])); (LP[col] = LP[col] || new Path2D()).rect(q[0] - r / 2, q[1] - r * .6, r, r * 1.2); });
      for (const col in LP) { x.fillStyle = `rgba(${col},${.8 * fa})`; x.fill(LP[col]); } }
    if (C[1] > y1) poly3([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], `rgba(14,16,22,${.96 * ta})`, null);
    linePath([[x0, y1, fz], [x1, y1, fz]], false) && (x.strokeStyle = rim, x.lineWidth = 1, x.stroke()); linePath([[fx, y0, fz], [fx, y1, fz]], false) && (x.strokeStyle = rim, x.stroke());
    // екран із сайтом на грані, що дивиться на вулицю (x ≈ 650): растр і легке мерехтіння, світло екрана на фасаді
    const bb = T0.b == null && BB.find(([gi, gj]) => T0.gi === gi && T0.gj === gj);
    if (bb && IMG[bb[2]]) { const hero = !!bb[3], gen = bb[2].startsWith('bb_'), im0 = smallImg(bb[2]), vert = gen && im0.height > im0.width, zw = w * (hero ? .92 : vert ? .55 : .95), zh = gen ? zw * im0.height / im0.width : zw * .56, ex0 = X - zw / 2 + (hero ? 0 : (T0.gi === 1 ? -w * .08 : w * .08)), yb = Math.max(y0 + 60, Math.min(y0 + h * (hero ? .5 : .38), y1 - zh - 60)), fzS = z1 + 3, im = im0;
      const fk = .86 + .14 * Math.sin(ct * 9 + X) * Math.sin(ct * 2.3), O = [ex0, yb + zh, fzS], Av = [zw, 0, 0], Bv2 = [0, -zh, 0];
      // світло екрана на фасаді й у тумані (екран — практичне джерело світла кадру)
      const c = p3(ex0 + zw / 2, yb + zh / 2, fzS); if (c) { glow(c[0], c[1], Math.max(30, zw * 1.4 * c[2]), `rgba(140,180,255,${hero ? .28 : .18})`, ta * fk); }
      if (gen) facade(im, O, Av, Bv2, im.width, im.height, vert ? 10 : 8, .95 * fk * ta); else facade(im, O, Av, Bv2, im.width, Math.round(im.height * .5), 8, .95 * fk * ta, Math.round(im.height * .055));
      x.save(); x.globalAlpha *= .2 * ta; for (let q = 1; q < 48; q++) { const yy = yb + zh * q / 48; line3([ex0, yy, fzS], [ex0 + zw, yy, fzS], '0,0,0', 1, 1); } x.restore(); }
    // червоний вогонь на даху високих веж
    if (T0.top === 0) { const c = p3(X, y1 + 20, Z); if (c) { const bl = .5 + .5 * Math.sin(ct * 3.1 + X * .01); glow(c[0], c[1], Math.max(3, 60 * c[2]), `rgba(255,60,50,${.8 * f})`, bl * ta); } }
  }
  // наш сайт — одна вежа: стек усередині, довкола скляні стіни ±1000 з перекриттями; камера починає всередині й вилітає крізь північну стіну
  const OUR = 1000;
  function ourWalls(ta) { const C = V3.C; if (Math.abs(C[0]) > OUR || Math.abs(C[2]) > OUR) return; const yT = 1300;
    [[[-OUR, CG, -OUR], [OUR, CG, -OUR], [OUR, yT, -OUR], [-OUR, yT, -OUR]], [[OUR, CG, -OUR], [OUR, CG, OUR], [OUR, yT, OUR], [OUR, yT, -OUR]], [[-OUR, CG, OUR], [-OUR, CG, -OUR], [-OUR, yT, -OUR], [-OUR, yT, OUR]]]
      .forEach((P) => poly3(P, `rgba(90,140,180,${.06 * ta})`, null));
    x.save(); for (let k = -OUR; k <= OUR; k += 250) { line3([k, CG, -OUR], [k, yT, -OUR], '170,200,230', 1, .28 * ta); line3([OUR, CG, k], [OUR, yT, k], '170,200,230', 1, .22 * ta); line3([-OUR, CG, k], [-OUR, yT, k], '170,200,230', 1, .22 * ta); }
    for (let yy = CG; yy <= yT; yy += 260) { line3([-OUR, yy, -OUR], [OUR, yy, -OUR], '170,200,230', 1.2, .32 * ta); line3([OUR, yy, -OUR], [OUR, yy, OUR], '170,200,230', 1, .25 * ta); line3([-OUR, yy, -OUR], [-OUR, yy, OUR], '170,200,230', 1, .25 * ta); } x.restore(); }
  // летючий апарат: темний корпус, задні червоні вогні, білий проблисковий вогонь, підсвітка знизу; летить попереду камери вздовж вулиці
  function spinner(u) { const v = (u - 3.4) / 6; if (v <= 0 || v >= 1) return; const sd = sdOf(u) + 700 + 2600 * ez(v), P = cpAt(sd), Q = [P[0] - 230 + 120 * Math.sin(v * 3), P[1] - 120 + 80 * Math.sin(v * 5), P[2]];
    const p = p3(...Q); if (!p) return; const k = p[2], a = ez(v / .1) * (1 - ez((v - .9) / .1)); x.save(); x.globalAlpha *= a;
    glow(p[0], p[1] + 14 * k, 120 * k, 'rgba(255,170,110,.25)'); x.fillStyle = '#07080b'; x.beginPath(); x.ellipse(p[0], p[1], 110 * k, 30 * k, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(p[0], p[1] - 22 * k, 50 * k, 18 * k, 0, Math.PI, 0); x.fill();
    [[-85, 0, '255,60,50'], [85, 0, '255,60,50'], [0, 18, '255,190,120']].forEach(([dx, dy, c]) => glow(p[0] + dx * k, p[1] + dy * k, Math.max(4, 26 * k), `rgba(${c},.95)`));
    const st = (u * 2.6) % 1 < .12; if (st) { glow(p[0], p[1] - 40 * k, Math.max(8, 90 * k), 'rgba(255,255,255,.9)'); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(p[0] - 260 * k, p[1] - 41 * k, 520 * k, 2); }
    x.restore(); }
  function cityFrame(u, ta = 1, cam = null) {
    const CD = cam ? cam() : cityCam(u); SS = 1; SO = [0, 0, 0]; const C0 = V3.C, fh = nrm3([V3.f[0], 0, V3.f[2]]), hp = p3(C0[0] + fh[0] * 2e5, C0[1] - 900, C0[2] + fh[2] * 2e5), hy = hp ? hp[1] : -hh * .2;
    // небо прив'язане до горизонту: темрява згори → світний пурпурово-бурштиновий серпанок на лінії горизонту → темна земля; силуети веж на ньому читаються
    const g = x.createLinearGradient(0, -hh, 0, hh), st = (yv) => Math.max(0, Math.min(1, (yv + hh) / (2 * hh)));
    g.addColorStop(0, '#04050a'); g.addColorStop(st(hy - 260), '#0d0918'); g.addColorStop(st(hy - 40), '#4a1e3e'); g.addColorStop(st(hy), '#7a3550'); g.addColorStop(st(hy + 60), '#2a1222'); g.addColorStop(1, '#0a0710'); fill(g);
    // нескінченність: три шари силуетів кварталів на горизонті (далекий — найсвітліший у серпанку), із крапками вікон; легкий паралакс
    if (hp) { [[0, 30, [58, 26, 52], 0], [1, 56, [34, 16, 34], 0], [2, 90, [16, 10, 20], 0], [3, 150, [11, 8, 15], 70]].forEach(([L, Hm, col, dy]) => { const par = (C0[0] * .004 + C0[2] * .002) * (L + 1); let X = -hw - 40 - ((par % 60) + 60) % 60, k = 0;
        x.fillStyle = `rgb(${col.join(',')})`; while (X < hw + 40) { const wd = 8 + 26 * hash(L * 91 + k * 1.7), ht = Hm * (.25 + .75 * Math.pow(hash(L * 37 + k * 2.3), 1.7)); x.fillRect(X, hy + dy - ht, wd + .6, ht + 60 + L * 40 + dy * 3);
          if (L !== 2) { x.save(); x.fillStyle = `rgba(255,${190 + L * 15},140,${L === 3 ? .45 : .4 - L * .12})`; for (let q = 0; q < ht / 7; q++) if (hash(k * 5.3 + q * 1.9 + L) < .3) x.fillRect(X + 2 + hash(q + k) * (wd - 4), hy + dy - ht + 3 + q * 7, 1.2, 1.2); x.restore(); x.fillStyle = `rgb(${col.join(',')})`; }
          X += wd + 1 + 6 * hash(L * 13 + k * 3.1); k++; } }); }
    const C = V3.C, fog = (d) => Math.exp(-Math.max(0, d - .55 * CD) / (16000 + 3.2 * Math.max(0, C[1]))), tin = ta * ez((u - .2) / 1.4);
    // земля: вулиці — слабкі бурштинові лінії
    x.save(); for (let q = -12; q <= 11; q++) { const v = (q + .5) * CS, a = .1 * ta; [-120, 120].forEach((o) => { line3([v + o, CG, -15000], [v + o, CG, 15000], AMB, 1, a); line3([-15000, CG, v + o], [15000, CG, v + o], AMB, 1, a); }); } x.restore();
    { const sk = [new Path2D(), new Path2D()]; for (let si = 0; si < SKY.length; si += RENDER ? 1 : 2) { const [X, Y, Z, warm] = SKY[si], q = p3(X, Y, Z); if (!q || q[1] < -hh || q[1] > hh) continue; const r = Math.max(.6, Math.min(2.2, 260 * q[2])); sk[warm ? 0 : 1].rect(q[0] - r / 2, q[1] - r / 2, r, r); }
      x.fillStyle = `rgba(255,190,120,${.55 * tin})`; x.fill(sk[0]); x.fillStyle = `rgba(${HC},${.5 * tin})`; x.fill(sk[1]); }
    // вежі від дальніх до ближніх; наш стек — серед них на своїй глибині
    const items = CITY.map((T0) => ({ T0, d: Math.hypot(T0.X - C[0], T0.Z - C[2]) })); if (cs(0, 0, 0)[2] > -1200) items.push({ T0: null, d: Math.hypot(C[0], C[2]) }); items.sort((p, q) => q.d - p.d);
    // текстуру вікон отримують лише ~24 найближчі вежі перед камерою (решта — силуети з крапками вогнів)
    FRM++; let nt = 0; for (let i = items.length - 1; i >= 0 && nt < 16; i--) { const T0 = items[i].T0; if (!T0) continue; const c2 = cs(T0.X, CG + T0.h / 2, T0.Z); if (c2[2] > -Math.max(T0.w, T0.d)) { T0._tx = FRM; nt++; } }
    items.forEach(({ T0, d }) => { const f = fog(d); if (!T0) { x.save(); x.globalAlpha *= ta; stack(18, { la: 0, pk: false }); flush(); x.restore(); return; } tower(T0, f, u, tin); });
    if (!cam) { ourWalls(ta); spinner(u); } else hangSigns2(u, tin);
    // потоки даних: світлові траси вздовж вулиць на трьох висотах (ціан — в один бік, бурштин — у другий)
    // v10.5 (продуктивність): траси лише на найближчих вулицях, усі одного кольору — одним шляхом; дуги даних прибрано
    x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; const tr = [new Path2D(), new Path2D()];
    for (let q = -8; q <= 8; q++) for (const [hY, sp] of [[CG + 90, 1500], [CG + 900, 2300], [CG + 1900, 3300]]) for (let m = 0; m < 5; m++) {
      const along = (q * 7 + m) % 2, sv = (q + .5) * CS; if (Math.abs(sv - (along ? C[0] : C[2])) > 4 * CS) continue;
      const dir = (q + m) % 2 ? 1 : -1, ph = hash(q * 17 + m * 3 + hY), L = 30000, zz = ((ph * L + dir * u * sp) % L + L) % L - 15000;
      const P0 = along ? [sv, hY, zz] : [zz, hY, sv], P1 = along ? [sv, hY, zz - dir * 260] : [zz - dir * 260, hY, sv];
      if (Math.hypot(P0[0] - C[0], P0[2] - C[2]) > 14000) continue; const a0 = p3(...P0), a1 = p3(...P1); if (!a0 || !a1) continue;
      const pth = tr[dir > 0 ? 0 : 1]; pth.moveTo(a0[0], a0[1]); pth.lineTo(a1[0], a1[1]); }
    x.lineWidth = 1.8; x.strokeStyle = `rgba(${HC},${.6 * tin})`; x.stroke(tr[0]); x.strokeStyle = `rgba(${AMB},${.6 * tin})`; x.stroke(tr[1]);
    x.restore();
    // дощ: косі риски на весь кадр
    x.save(); x.strokeStyle = `rgba(190,210,235,${.13 * tin})`; x.lineWidth = 1; x.beginPath();
    for (let i = 0; i < 140; i++) { const X = (hash(i * 1.37) * 2 - 1) * hw * 1.1, Y = ((hash(i * 2.71) + u * (1.4 + hash(i) * .6)) % 1) * 2 * hh - hh; x.moveTo(X, Y); x.lineTo(X - 4, Y + 22); } x.stroke(); x.restore();
  }
  // кінематографічна глибина різкості: різкий середній план (вежі на відстані погляду), передній і дальній — у розфокусі; посилюється над дахами
  function sCity(u, len) { cityFrame(u, 1);
    // бірюзовий туман знизу (як у референсі): світло вулиць розсіюється в імлі
    { const g = x.createLinearGradient(0, hh * .1, 0, hh); g.addColorStop(0, 'rgba(40,120,140,0)'); g.addColorStop(1, 'rgba(40,120,140,.28)'); x.fillStyle = g; x.fillRect(-hw - 2, hh * .1, hw * 2 + 4, hh * .9 + 2); }
    // прожектори: три промені з далеких веж повільно гойдаються в серпанку
    x.save(); x.globalCompositeOperation = 'lighter'; [[-9000, -12000], [7000, -14000], [-2000, -16000]].forEach(([X, Z], i) => { const b0 = p3(X, CG + 3000, Z); if (!b0) return; const an = -Math.PI / 2 + .35 * Math.sin(u * .5 + i * 2.1), L = hh * 1.6;
      const g = x.createLinearGradient(b0[0], b0[1], b0[0] + Math.cos(an) * L, b0[1] + Math.sin(an) * L); g.addColorStop(0, 'rgba(180,210,255,.16)'); g.addColorStop(1, 'rgba(180,210,255,0)'); x.fillStyle = g;
      x.beginPath(); x.moveTo(b0[0], b0[1]); x.lineTo(b0[0] + Math.cos(an - .05) * L, b0[1] + Math.sin(an - .05) * L); x.lineTo(b0[0] + Math.cos(an + .05) * L, b0[1] + Math.sin(an + .05) * L); x.closePath(); x.fill(); }); x.restore();
    const dof = 1.2 + 2.6 * ez((u - 4) / 3); macroDOF(hh * lerp(.05, -.1, ez((u - 5) / 3)), hh * .32, dof); }

  // ══ v10.1 · МІСТО ЯК 4 ПЛАНИ (правила оператора: поріг → проліт крізь вікно → загальний план із героєм → супровід) ══
  // Усі плани дивляться на північ (−z), як і вихід зі стеку: вісь не перестрибує. Рух — лише вперед або за героєм-апаратом.
  // Тривалості (с, монтаж v9, сцена 15,9 с): поріг 0–2,5 · проліт 2,5–4 · загальний 4–9 · супровід 9–15,9 (підйом над дахи з 13,4).
  const camAt = (P, G, f3 = 1100) => () => { SHX = 0; F3 = f3; look(P, G); return 2500; };
  function spin(Q, u, a = 1) { const p = p3(...Q); if (!p) return; const k = p[2]; x.save(); x.globalAlpha *= a;
    glow(p[0], p[1] + 14 * k, 150 * k, 'rgba(255,170,110,.3)'); x.fillStyle = '#06070a'; rr(p[0] - 125 * k, p[1] - 16 * k, 250 * k, 32 * k, 14 * k); x.fill(); x.beginPath(); x.ellipse(p[0] - 6 * k, p[1] - 15 * k, 62 * k, 15 * k, 0, Math.PI, 0); x.fill();
    x.strokeStyle = 'rgba(255,190,140,.5)'; x.lineWidth = Math.max(.6, 2 * k); x.beginPath(); x.moveTo(p[0] - 118 * k, p[1] + 14 * k); x.lineTo(p[0] + 118 * k, p[1] + 14 * k); x.stroke();
    [[-112, 0, '255,60,50', 26], [112, 0, '255,60,50', 26], [-60, 4, '255,90,70', 14], [60, 4, '255,90,70', 14], [0, 18, '255,200,140', 34], [-20, -26, '120,170,255', 14]].forEach(([dx, dy, cc, r]) => glow(p[0] + dx * k, p[1] + dy * k, Math.max(4, r * k), `rgba(${cc},.95)`));
    if ((u * 2.4) % 1 < .1) { glow(p[0], p[1] - 44 * k, Math.max(10, 110 * k), 'rgba(255,255,255,.95)'); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(p[0] - 320 * k, p[1] - 45 * k, 640 * k, Math.max(1, 2 * k)); }
    x.restore(); }
  // поріг: рама вікна нашої вежі (темні стійки й ригелі в 3D), скло з відблиском; краплі дощу на склі — екранні
  function windowFrame(zW, a = 1) { if (a <= 0) return; const D = '#030406'; x.save(); x.globalAlpha *= a;
    [-600, -100, 400, 900].forEach((X) => poly3([[X - 18, CG, zW], [X + 18, CG, zW], [X + 18, 1300, zW], [X - 18, 1300, zW]], D, '60,80,100', .8, .4));
    [-200, 650, 1300].forEach((Y) => poly3([[-OUR, Y - 14, zW], [OUR, Y - 14, zW], [OUR, Y + 14, zW], [-OUR, Y + 14, zW]], D, '60,80,100', .8, .4));
    x.restore(); }
  function drops(blurPx, a) { if (a <= 0) return; x.save(); x.globalAlpha *= a; if (blurPx > .2) x.filter = `blur(${blurPx.toFixed(1)}px)`;
    for (let i = 0; i < 70; i++) { const X = (hash(i * 3.7) * 2 - 1) * hw, Y = (hash(i * 5.1) * 2 - 1) * hh, r = 1.5 + 5 * Math.pow(hash(i * 9.3), 2);
      x.fillStyle = 'rgba(10,14,20,.35)'; x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fill(); x.strokeStyle = 'rgba(200,225,255,.55)'; x.lineWidth = .8; x.beginPath(); x.arc(X, Y, r, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
      if (hash(i * 7.7) < .3) { x.strokeStyle = 'rgba(180,210,240,.25)'; x.beginPath(); x.moveTo(X, Y + r); x.lineTo(X + 1, Y + r + 10 + 20 * hash(i)); x.stroke(); } }
    x.restore(); }
  function cityFx() { const g = x.createLinearGradient(0, hh * .1, 0, hh); g.addColorStop(0, 'rgba(40,120,140,0)'); g.addColorStop(1, 'rgba(40,120,140,.28)'); x.fillStyle = g; x.fillRect(-hw - 2, hh * .1, hw * 2 + 4, hh * .9 + 2); }
  // знімок кадру міста для порога: один раз на розмір полотна; розмита версія — через lowBlur (1/4 розміру)
  let SNAP = null;
  function citySnap(cam) { const cw = x.canvas.width, ch = x.canvas.height; if (SNAP && SNAP.w === cw && SNAP.h === ch) return SNAP;
    const sharp = document.createElement('canvas'); sharp.width = cw; sharp.height = ch; const X0 = x, m = x.getTransform(); x = sharp.getContext('2d'); x.setTransform(m); cityFrame(9.5, 1, cam); cityFx(); x = X0;
    lowBlur(sharp, 9 * Math.hypot(m.a, m.b)); const blur = document.createElement('canvas'); blur.width = sm.width; blur.height = sm.height; blur.getContext('2d').drawImage(sm, 0, 0);
    return (SNAP = { w: cw, h: ch, sharp, blur }); }
  // цифровий глітч: горизонтальні смуги кадру зсуваються, кольорові полоси, шум (k — сила 0..1)
  function glitch(k, u) { if (k <= .02) return; const cv2 = x.canvas, cw = cv2.width, ch = cv2.height; if (bcv.width !== cw || bcv.height !== ch) { bcv.width = cw; bcv.height = ch; }
    bcx.setTransform(1, 0, 0, 1, 0, 0); bcx.globalCompositeOperation = 'copy'; bcx.drawImage(cv2, 0, 0); bcx.globalCompositeOperation = 'source-over'; const fr = Math.floor(u * 30);
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < 14; i++) { const y = hash(fr * 3.1 + i * 7.7) * ch, h = (6 + 60 * hash(fr + i * 1.3)) * (ch / 700), off = (hash(fr * 1.7 + i) - .5) * 160 * k * (cw / 1200);
      x.drawImage(bcv, 0, y, cw, h, off, y, cw, h); if (hash(i * 9.1 + fr) < .35) { x.fillStyle = hash(i + fr) < .5 ? `rgba(255,40,120,${.35 * k})` : `rgba(40,220,255,${.35 * k})`; x.fillRect(0, y, cw, h * .4); } }
    x.globalAlpha = .18 * k; x.fillStyle = '#fff'; for (let i = 0; i < 40; i++) x.fillRect(hash(fr * 5 + i) * cw, hash(fr * 9 + i) * ch, 2 + 30 * hash(i + fr), 1); x.restore(); }
  function sCityV10(u, len) {
    const zW = -OUR;
    if (u < 2.5) {   // 1. ПОРІГ: знімок міста за склом (кешується один раз): розмита версія → різка (перевід фокуса); рама й краплі — живі
      const P = [650, 300, zW + 260], cam = camAt(P, [650, 420, -9000]), rf = ez((u - .7) / 1.2), snap = citySnap(cam), z = 1 + .02 * ez(u / 2.5);
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); const cw = x.canvas.width, ch = x.canvas.height, dx = (cw - cw * z) / 2, dy = (ch - ch * z) / 2;
      x.globalAlpha = 1; x.drawImage(snap.blur, dx, dy, cw * z, ch * z); x.globalAlpha = rf; x.drawImage(snap.sharp, dx, dy, cw * z, ch * z); x.restore();
      cam(); windowFrame(zW); drops(3.5 * rf, 1); fill(`rgba(0,0,0,${.35 * (1 - ez(u / .6))})`);
      glitch(ez((u - 2.12) / .14) * (1 - ez((u - 2.5) / .1)), u); return; }
    if (u < 4) {   // 2. ПРОЛІТ: після глітча — уже за склом, камера набирає швидкість уздовж вулиці
      const k = Math.pow((u - 2.5) / 1.5, 1.4), P = [650, 340 + 40 * k, zW - 300 - 900 * k], cam = camAt(P, [650, 420, -9000]);
      cityFrame(9.5, 1, cam); cityFx(); glitch(1 - ez((u - 2.5) / .22), u); return; }
    if (u < 9) {   // 3. ЗАГАЛЬНИЙ ПЛАН: наш екран-герой на правій третині, апарат перетинає кадр зліва направо, моноліти силуетами в серпанку
      const v = (u - 4) / 5, P = [400 + 50 * v, 1500 + 30 * v, -900 - 220 * v], cam = camAt(P, [1060, 1750, -2500], 1000);
      cityFrame(9.5, 1, cam); cam(); spin([lerp(-500, 1900, ez(v)), 1500 + 80 * Math.sin(v * 3), -1900], u); cityFx();
      macroDOF(hh * -.05, hh * .4, 1.6); return; }
    // 4. СУПРОВІД: камера за апаратом у «каньйон» (довгий фокус стискає вежі); наприкінці — підйом над дахи до горизонту
    const v = u - 9, S = [650 - 140 * Math.sin(v * .9), 520 + 60 * Math.sin(v * 1.3), -2600 - 950 * v], up = ez((u - 13.4) / 2.5);
    const P = [S[0] + 60, S[1] + 90 + 2300 * up, S[2] + 1700], cam = camAt(P, [S[0], S[1] + 110 + 900 * up, S[2] - 3200], lerp(1650, 1200, up));
    cityFrame(9.5, 1, cam); cam(); spin(S, u, 1 - .6 * up); cityFx(); macroDOF(hh * .02, hh * .35, 1.4 + 1.6 * up);
  }

  // ══ v11 · ОПЕРАТОРСЬКА ПЕРЕРОБКА МІСТА (PLAN-36-trailer-v11.md) ══
  // Поліцейський спіннер — справжня модель із граней: корпус-шестикутник у 4 перерізах, кабіна зі склом, боки-сопла, світлова балка.
  // Локальні осі: x праворуч, y угору, ніс — у −z. Поворот: крен (навколо z) → тангаж (x) → курс (y; 0 — ніс на північ, + — ніс ліворуч).
  const SPN_S = [[-150, 20, 34, 18, -6, 6, 14], [-80, 48, 62, 44, -20, 4, 22], [60, 55, 66, 50, -22, 4, 24], [150, 40, 50, 38, -14, 6, 18]];
  const SPN = (() => { const F = [], sec = SPN_S.map(([z, wb, wm, wt, yb, ym, yt]) => [[-wt, yt, z], [-wm, ym, z], [-wb, yb, z], [wb, yb, z], [wm, ym, z], [wt, yt, z]]);
    for (let s = 0; s < 3; s++) for (let j = 0; j < 6; j++) { const a = sec[s], b = sec[s + 1], j2 = (j + 1) % 6; F.push({ P: [a[j], a[j2], b[j2], b[j]], c: j === 0 || j === 5 ? 'top' : j === 2 ? 'bot' : 'hull', ref: [0, 0, 0], }); }
    F.push({ P: sec[0].slice().reverse(), c: 'hull', ref: [0, 0, 0] }, { P: sec[3], c: 'tail', ref: [0, 0, 0] });
    // кабіна: лобове скло, дах, заднє скло, бокові вікна
    const cb = [[-30, 22, -70], [30, 22, -70], [26, 50, -14], [-26, 50, -14], [-24, 46, 38], [24, 46, 38], [32, 24, 70], [-32, 24, 70]], R = [0, 30, 0];
    F.push({ P: [cb[0], cb[1], cb[2], cb[3]], c: 'glass', ref: R }, { P: [cb[3], cb[2], cb[5], cb[4]], c: 'roof', ref: R }, { P: [cb[4], cb[5], cb[6], cb[7]], c: 'glass', ref: R },
      { P: [cb[0], cb[3], cb[4], cb[7]], c: 'glass', ref: R }, { P: [cb[1], cb[6], cb[5], cb[2]], c: 'glass', ref: R });
    // бокові сопла
    [-1, 1].forEach((sx) => { const x0 = sx * 66, x1 = sx * 90, y0 = -20, y1 = 4, z0 = 20, z1 = 140, r = [sx * 78, -8, 80];
      F.push({ P: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], c: 'top', ref: r }, { P: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], c: 'hull', ref: r },
        { P: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], c: 'hull', ref: r }, { P: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], c: 'jet', ref: r },
        { P: [[x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]], c: 'bot', ref: r }); });
    // світлова балка на даху: ліва половина червона, права синя
    [[-24, 0, 'red'], [0, 24, 'blue']].forEach(([a, b, c]) => { const y0 = 49, y1 = 56, z0 = -6, z1 = 8, r = [(a + b) / 2, 52, 1];
      F.push({ P: [[a, y1, z0], [b, y1, z0], [b, y1, z1], [a, y1, z1]], c, ref: r }, { P: [[a, y0, z1], [b, y0, z1], [b, y1, z1], [a, y1, z1]], c, ref: r }, { P: [[a, y0, z0], [b, y0, z0], [b, y1, z0], [a, y1, z0]], c, ref: r }); });
    return F; })();
  const SPN_C = { hull: [52, 60, 74], top: [70, 80, 96], bot: [22, 24, 30], tail: [44, 38, 44], roof: [76, 86, 102], glass: [24, 60, 78], jet: [70, 46, 38], red: [255, 50, 60], blue: [60, 120, 255] };
  const spnTex = () => mkTex('spnTx', 256, 40, (w, h) => { x.fillStyle = 'rgba(18,40,90,.95)'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(240,245,255,.95)'; x.fillRect(0, h - 5, w, 3);
    x.letterSpacing = '6px'; T('POLICE', w / 2, h / 2 - 2, 22, '#f2f6ff', 'center', 800, SANS); x.letterSpacing = '0px'; }, 2);
  const rotL = (v, yw, bk, pt) => { let [X, Y, Z] = v; const cb = Math.cos(bk), sb = Math.sin(bk); [X, Y] = [X * cb - Y * sb, X * sb + Y * cb];
    const cp = Math.cos(pt), sp = Math.sin(pt); [Y, Z] = [Y * cp - Z * sp, Y * sp + Z * cp]; const cy = Math.cos(yw), sy = Math.sin(yw); return [X * cy + Z * sy, Y, -X * sy + Z * cy]; };
  function spinner3(Q, yw, bk, pt, sc, u, a = 1) { if (a <= 0) return; const c0 = cs(...Q); if (c0[2] < 60 * sc) return; const C = V3.C, W3 = (v) => { const r = rotL(v, yw, bk, pt); return [Q[0] + r[0] * sc, Q[1] + r[1] * sc, Q[2] + r[2] * sc]; };
    const L = nrm3([-.35, .85, .4]), st = Math.floor(u * 6) % 2, fl = (u * 2.2) % 1 < .09;
    x.save(); x.globalAlpha *= a;
    // підсвітка знизу і світло фар у дощі (до моделі, щоб корпус лягав поверх)
    const pc = p3(...W3([0, -40, 0])); if (pc) glow(pc[0], pc[1], 200 * pc[2] * sc, 'rgba(255,170,110,.22)');
    const hb = W3([0, 0, -160]), hf = W3([0, -60, -1400]), p0 = p3(...hb), p1 = p3(...hf);
    if (p0 && p1) { x.save(); x.globalCompositeOperation = 'lighter'; const g = x.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); g.addColorStop(0, 'rgba(220,235,255,.22)'); g.addColorStop(1, 'rgba(220,235,255,0)'); x.fillStyle = g;
      const s0 = 30 * p0[2] * sc, s1 = 260 * p1[2] * sc, dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      x.beginPath(); x.moveTo(p0[0] + nx * s0, p0[1] + ny * s0); x.lineTo(p1[0] + nx * s1, p1[1] + ny * s1); x.lineTo(p1[0] - nx * s1, p1[1] - ny * s1); x.lineTo(p0[0] - nx * s0, p0[1] - ny * s0); x.fill(); x.restore(); }
    const vis = []; SPN.forEach((f) => { const P = f.P.map(W3), cen = P.reduce((s, p) => [s[0] + p[0] / P.length, s[1] + p[1] / P.length, s[2] + p[2] / P.length], [0, 0, 0]);
      let n = nrm3(crs3(sub3(P[1], P[0]), sub3(P[2], P[0]))); const rf = W3(f.ref); if (dot3(n, sub3(cen, rf)) < 0) n = [-n[0], -n[1], -n[2]];
      if (dot3(n, sub3(C, cen)) <= 0) return; vis.push({ f, P, n, d: cs(...cen)[2] }); });
    vis.sort((p, q) => q.d - p.d).forEach(({ f, P, n }) => { const b = SPN_C[f.c], lit = f.c === 'jet' || f.c === 'red' || f.c === 'blue';
      let col; if (lit) { const on = f.c === 'jet' ? 1 : (f.c === 'red') === !!st ? 1 : .18; col = `rgb(${b.map((v) => Math.round(v * (.35 + .65 * on))).join(',')})`; }
      else { const df = Math.max(0, dot3(n, L)), up = Math.max(0, -n[1]), k = .55 + .9 * df; col = `rgb(${Math.round(b[0] * k + 60 * up)},${Math.round(b[1] * k + 35 * up)},${Math.round(b[2] * k + 20 * up)})`; }
      poly3(P, col, null); if (f.c === 'glass') { poly3(P, `rgba(120,200,230,${.12 + .2 * Math.max(0, dot3(n, L))})`, null); }
      if (!lit) { if (linePath(P, true)) { x.strokeStyle = 'rgba(180,205,235,.38)'; x.lineWidth = .8; x.stroke(); } } });
    // ліврея: смуга POLICE на боках (лише на видимому боці)
    [[-1, 'L'], [1, 'R']].forEach(([sx]) => { const o = W3([sx * 63, 13, sx < 0 ? -70 : 50]), A = sub3(W3([sx * 63, 13, sx < 0 ? 50 : -70]), o), Bv = sub3(W3([sx * 60, 0, 0]), W3([sx * 63, 13, 0])), n = W3([sx * 200, 0, 0]);
      if (dot3(sub3(n, Q), sub3(C, Q)) > 0) tex3(spnTex(), o, A, Bv, 4, 1, .9); });
    // вогні: фари, задні, сопла, мигалки (червоний і синій по черзі), білий проблисковий
    const L1 = (v, r, c) => { const p = p3(...W3(v)); if (p) glow(p[0], p[1], Math.max(3, r * p[2] * sc), c); };
    L1([-24, 4, -150], 26, 'rgba(235,245,255,.95)'); L1([24, 4, -150], 26, 'rgba(235,245,255,.95)');
    L1([-36, 8, 152], 22, 'rgba(255,40,50,.95)'); L1([36, 8, 152], 22, 'rgba(255,40,50,.95)'); L1([-78, -8, 142], 34, 'rgba(255,150,80,.8)'); L1([78, -8, 142], 34, 'rgba(255,150,80,.8)');
    L1([-12, 58, 1], st ? 90 : 30, `rgba(255,40,60,${st ? .95 : .4})`); L1([12, 58, 1], st ? 30 : 90, `rgba(60,120,255,${st ? .4 : .95})`);
    if (fl) L1([0, -24, 0], 140, 'rgba(255,255,255,.75)');
    x.restore(); }
  // банери на фасадах уздовж вулиці (x ≈ 400…1100): консоль від стіни, розвернута до камери (що летить на північ) під ~35°
  //   [зображення, x стіни, z центру кріплення, y низу, ширина, бік: −1 — ліва стіна (банер праворуч від неї), +1 — права]
  const HANG2 = [['bb_gantt', 397, -3950, 560, 300, -1], ['bb_japan', 1163, -6480, 540, 250, 1], ['bb_geo', 378, -7850, 620, 480, -1], ['bb_jarvis', 1021, -10400, 620, 520, 1]];
  function hangSigns2(ct, ta) { const C = V3.C, an = 35 * DEG;
    HANG2.map((s, i) => [s, i]).sort((p, q) => Math.abs(q[0][2] - C[2]) - Math.abs(p[0][2] - C[2])).forEach(([[k, xf, zf, Y, w, sd], i]) => { const im = smallImg(k); if (!im) return;
      const h = w * im.height / im.width, R = [Math.cos(an), 0, sd < 0 ? -Math.sin(an) : Math.sin(an)], E = [xf - (sd < 0 ? 0 : R[0] * w), Y + h, zf - (sd < 0 ? 0 : R[2] * w)];
      const c = cs(E[0] + R[0] * w / 2, Y + h / 2, E[2] + R[2] * w / 2); if (c[2] < 80) return; const fk = .9 + .1 * Math.sin(ct * 8 + i * 2) * Math.sin(ct * 2.1 + i);
      const P4 = [E, [E[0] + R[0] * w, E[1], E[2] + R[2] * w], [E[0] + R[0] * w, Y, E[2] + R[2] * w], [E[0], Y, E[2]]], ce = p3(E[0] + R[0] * w / 2, Y + h / 2, E[2] + R[2] * w / 2);
      // кронштейни: від зовнішнього краю банера навскіс до стіни
      const out = sd < 0 ? P4[1] : P4[0], o2 = sd < 0 ? P4[2] : P4[3]; line3(out, [xf, out[1] + 180, out[2]], '30,36,46', 3, .9 * ta); line3(o2, [xf, o2[1] - 120, o2[2]], '30,36,46', 3, .9 * ta);
      if (ce) glow(ce[0], ce[1], Math.max(30, w * 1.2 * ce[2]), 'rgba(150,185,255,.22)', ta * fk);
      poly3(P4, 'rgba(6,8,12,.95)', null); facade(im, E, [R[0] * w, 0, R[2] * w], [0, -h, 0], im.width, im.height, 6, .97 * fk * ta);
      poly3(P4, null, '120,140,170', 1, .45 * ta); }); }
  // наш сайт — вежа: сітка стін проростає від підлоги вгору тим самим ціаном, що й схема стеку (g — 0..1), потім темніє в раму (dk — 0..1)
  //   північна стіна: стійки через 500, ригелі на висоті 180 і 480 — панорамна шибка 0…500 × 180…480 перед камерою
  const WY = [CG, -400, -100, 180, 480, 780, 1080, 1300], WXN = [-1000, -500, 0, 500, 1000];
  function wallsGrow(g, dk, ta = 1) { if (g <= 0) return; const yT = 1300, col = HC, a = ta * (1 - .55 * dk), Hh = (i) => CG + (yT - CG) * ez(g * 1.7 - i * .06);
    // скло: ледь помітна заливка трьох стін
    const gl = ez((g - .5) / .5) * ta; if (gl > 0) [[[-OUR, CG, -OUR], [OUR, CG, -OUR], [OUR, yT, -OUR], [-OUR, yT, -OUR]], [[OUR, CG, -OUR], [OUR, CG, OUR], [OUR, yT, OUR], [OUR, yT, -OUR]], [[-OUR, CG, OUR], [-OUR, CG, -OUR], [-OUR, yT, -OUR], [-OUR, yT, OUR]]]
      .forEach((P) => poly3(P, `rgba(90,140,180,${.05 * gl})`, null));
    x.save(); WXN.forEach((X, i) => { const y = Hh(i); line3([X, CG, -OUR], [X, y, -OUR], col, 1.3, .7 * a); });
    for (let k = -OUR; k <= OUR; k += 250) { const i = (k + OUR) / 250, y = Hh(i * .6); line3([OUR, CG, k], [OUR, y, k], col, .9, .4 * a); line3([-OUR, CG, k], [-OUR, y, k], col, .9, .4 * a); }
    WY.forEach((Y, j) => { const e = ez((g - .25 - j * .07) / .3); if (e <= 0) return; line3([-OUR, Y, -OUR], [-OUR + 2 * OUR * e, Y, -OUR], col, 1.1, .55 * a); line3([OUR, Y, OUR], [OUR, Y, OUR - 2 * OUR * e], col, .9, .35 * a); line3([-OUR, Y, OUR], [-OUR, Y, OUR - 2 * OUR * e], col, .9, .35 * a); });
    x.restore();
    // скло північної стіни: темні стійки й перекриття проступають на місці ліній
    if (dk > 0) { const D = `rgba(4,5,8,${dk * ta})`; x.save();
      WXN.forEach((X) => poly3([[X - 22, CG, -OUR], [X + 22, CG, -OUR], [X + 22, yT, -OUR], [X - 22, yT, -OUR]], D, '70,95,120', .8, .5 * dk));
      WY.forEach((Y) => { const t2 = Y === 180 || Y === 480 ? 16 : 40; poly3([[-OUR, Y - t2, -OUR], [OUR, Y - t2, -OUR], [OUR, Y + t2, -OUR], [-OUR, Y + t2, -OUR]], D, '70,95,120', .8, .5 * dk); }); x.restore(); } }
  // лінія горизонту за склом: пурпурово-бурштиновий серпанок (як на знімку міста) — читається, куди розвертається камера
  function horizonGlow(a) { if (a <= 0) return; const p = p3(V3.C[0] + V3.f[0] * 2e5, V3.C[1] - 900, V3.C[2] + V3.f[2] * 2e5); if (!p) return; const y = p[1];
    const g = x.createLinearGradient(0, y - 140, 0, y + 120); g.addColorStop(0, 'rgba(74,30,62,0)'); g.addColorStop(.55, 'rgba(122,53,80,.55)'); g.addColorStop(.7, 'rgba(60,24,46,.4)'); g.addColorStop(1, 'rgba(10,7,16,0)');
    x.save(); x.globalAlpha *= a; x.fillStyle = g; x.fillRect(-hw - 2, y - 140, hw * 2 + 4, 260); x.restore(); }
  // вогні міста за склом поки камера всередині: розмиті «боке» на далекій сфері (проєктуються з камерою — розворот читається правильно)
  const BOKE = Array.from({ length: 160 }, (_, i) => { const az = (-70 + 120 * hash(i * 1.3)) * DEG, y = -500 + 3200 * Math.pow(hash(i * 2.9), 1.6), R = 9000 + 4000 * hash(i * 5.7); return [Math.sin(az) * R, y, -Math.cos(az) * R, hash(i * 7.1)]; });
  function boke(a) { if (a <= 0) return; x.save(); x.globalCompositeOperation = 'lighter'; BOKE.forEach(([X, Y, Z, k]) => { const p = p3(X, Y, Z); if (!p || Math.abs(p[0]) > hw + 40 || Math.abs(p[1]) > hh + 40) return;
      glow(p[0], p[1], 9 + 24 * k, k < .55 ? 'rgba(255,170,110,.32)' : k < .85 ? 'rgba(130,190,255,.3)' : 'rgba(255,90,170,.3)', a); }); x.restore(); }
  // поза камери для «порогу»: біля скла, по центру шибки
  const TH_P = [250, 330, -300], TH_G = [250, 400, -9000], EST_G = [1250, 1780, -2243];
  const camF = (P, f, f3 = 1100, shx = 0) => () => { SHX = shx; F3 = f3; look(P, [P[0] + f[0] * 1000, P[1] + f[1] * 1000, P[2] + f[2] * 1000]); return 2500; };
  const ss = (v) => ez(v);
  function sCityV11(u, len) {
    const zW = -OUR;
    if (u < 3) {   // 1. МІСТ: кінець стеку → схема стає вежею; камера вперед повз колону й розвертається до північної шибки
      const e = ez(u / 3), et = ez((u - .5) / 2.5), P0 = [661, -211, 910], f0 = nrm3(sub3([0, -450, 0], P0)), f1 = nrm3(sub3(TH_G, TH_P));
      const P = [lerp(P0[0], TH_P[0], ez((e - .62) / .38)) + 160 * Math.sin(Math.PI * cl(e / .8)), lerp(P0[1], TH_P[1], e), lerp(P0[2], TH_P[2], e)], f = nrm3([lerp(f0[0], f1[0], et), lerp(f0[1], f1[1], et), lerp(f0[2], f1[2], et)]);
      bgDesk(1 - ez(u / 1.6)); camF(P, f, 1100, lerp(-120, 0, et))(); SS = 1; SO = [0, 0, 0];
      horizonGlow(ez((u - .9) / 1.6)); boke(ez((u - .8) / 1.6)); stack(18, { dim: 1 - .55 * ez(u / 2.4) }); flush(); labels(1 - ez(u / .7));
      wallsGrow(ez(u / 2.2), ez((u - 2) / 1), 1); drops(3.5, ez((u - 2.2) / .8) * .8); return; }
    if (u < 4.4) {   // 2. ПОРІГ: знімок міста за шибкою (кеш): розмита версія → різка (перевід фокуса з крапель на місто)
      const cam = camAt(TH_P, TH_G), rf = ez((u - 3.2) / 1), snap = citySnap(cam);
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); const cw = x.canvas.width, ch = x.canvas.height; x.globalAlpha = 1; x.drawImage(snap.blur, 0, 0, cw, ch); x.globalAlpha = rf; x.drawImage(snap.sharp, 0, 0, cw, ch); x.restore();
      cam(); horizonGlow(1 - ez((u - 3) / .5)); boke(1 - ez((u - 3) / .5)); wallsGrow(1, 1, 1); drops(3.5 * rf, 1); return; }
    // 3. ВИХІД: камера рушає крізь шибку (гліч на склі), далі кран угору й панорама праворуч на героя — Джарвіса; спіннер перетинає кадр
    const s1 = ss((u - 4.4) / 2.8), z = -300 - 820 * s1 - 35 * Math.max(0, u - 7.2), y = 330 + 1170 * ss((u - 5.4) / 2.6), X = 250 + 200 * ss((u - 5.2) / 2.6);
    const P = [X, y, z], g = ss((u - 5.6) / 2.4), G = [lerp(X, EST_G[0], g), lerp(y + 70, EST_G[1], g), lerp(-9000, EST_G[2], g)], cam = () => { SHX = 0; F3 = lerp(1100, 860, g); look(P, G); return 2500; };
    if (u < 10.5) { const ct = 9.5 + (u - 4.4);
      cityFrame(ct, 1, cam); cam(); if (z > zW - 40) { wallsGrow(1, 1, 1); drops(3.5, 1 - ez((u - 4.6) / .6)); }
      const v = (u - 6.4) / 3.8; if (v > 0 && v < 1) { const sx = lerp(-700, 2100, ez(v)), sy = 1330 + 60 * Math.sin(v * 3); spinner3([sx, sy + 170, -2050], -90 * DEG + .25 * Math.sin(v * 3), .25 * Math.cos(v * 3), 0, .75, u, ez(v / .08) * (1 - ez((v - .92) / .08))); }
      cityFx(); const zc = -1000, gk = 1 - Math.min(1, Math.abs(z - zc) / 160); glitch(gk, u); if (u > 6) macroDOF(hh * -.05, hh * .4, 1.4 * ez((u - 6) / 1.5)); return; }
    // 4. СУПРОВІД: камера ззаду-зверху за спіннером із запізненням; спіннер іде S-подібно з креном, банери на фасадах по черзі; кінець — кран над дахи до горизонту
    const v = u - 10.5, Sf = (t) => [720 + 110 * Math.sin(t * .8) - 60 * Math.sin(t * 1.7), 470 + 50 * Math.sin(t * 1.1), -2350 - 1000 * t - 30 * t * t];
    const S = Sf(v), S1 = Sf(v + .05), Sl = Sf(Math.max(-.6, v - .4)), vx = S1[0] - S[0], vz = S1[2] - S[2], yw = Math.atan2(-vx, -vz), Sb = Sf(v + .15), yw2 = Math.atan2(-(Sb[0] - Sf(v + .1)[0]), -(Sb[2] - Sf(v + .1)[2]));
    const bk = Math.max(-.6, Math.min(.6, (yw2 - yw) * 9)), up = ss((v - 6.6) / 1.8);
    const CP = [Sl[0] + 110, Sl[1] + 75 + 2600 * up, Sl[2] + 300 + 300 * up], CG2 = [lerp(S[0], CP[0], up * .5), lerp(S[1] + 75, CP[1] - 700, up), lerp(S[2] - 1400, CP[2] - 7000, up)];
    const cam2 = () => { SHX = 0; F3 = lerp(1300, 1050, up); look(CP, CG2); return 2500; };
    cityFrame(9.5 + u, 1, cam2); cam2(); spinner3(S, yw, -bk, -.06, .5, u, 1 - .5 * up); cityFx(); const sp = p3(...S); macroDOF(lerp(sp ? sp[1] - 40 : 0, hh * .02, up), hh * .42, 1.1 + 1.4 * up);
  }

  // ══ КОМАНДА ══
  // [id, інструмент, тег, x, y, центр панелі x, y, потік на лінії, такт сцени, роль англійською (стандартні IT-ролі; інструмент — дрібним підписом)]
  const TM = [['own', 'Власник', 'команди 22 · 11 · пуш', 0, -280, 0, -250, '22 · 11 · пуш ↓  ·  ↑ план · сторінка', 23, 'Product Owner'],
    ['gpt', 'ChatGPT', 'банер і вставки', -440, -160, -470, -150, 'промпт → картинка', 25, 'Visual Designer'], ['gem', 'Gemini', 'стиль текстів', -440, 30, -470, 20, 'текст → правки стилю', 27, 'Copy Editor'],
    ['src', 'Першоджерела', 'цифри', -440, 220, -470, 185, 'запит → цифри', 29, 'Data Analyst'], ['tri', 'Tripo · Blender', '3D-моделі', 440, -160, 470, -150, '4 види → модель', 31, '3D Artist'],
    ['suno', 'Suno', 'музика', 440, 30, 470, 20, 'опис → музика', 33, 'Sound Designer'], ['slop', 'ai slop helper', 'походження фраз', 440, 220, 470, 175, 'текст → помітки', 35, 'QA · Fact-checker'],
    ['sub', 'Субагенти', 'великі задачі', 0, 280, 0, 235, 'задача → звіт', 37, 'Dev Team']];
  const ROLE = Object.fromEntries(TM.map((n) => [n[0], n[9]]));
  const PW = 430, PH = 250, NW = 210, NH = 84, TOV = { tx: 0, ty: 0, z: .73, ya: 0, pi: 0 }, TEND = B(41);
  const TOK = { own: 'план.md', gpt: 'banner.jpg', gem: 'правки', src: 'UNRATE', tri: 'ring.glb', suno: 'ambient.m4a', slop: 'помітки', sub: 'звіт' };
  // вузол Claude: диригент, вісім індикаторів — хто з команди вже ввімкнувся
  function claudeNode(a, lit) {
    if (a <= 0) return; const w = 220, h = 96; onPlane(-w / 2, -h / 2, w, h, () => { x.globalAlpha *= a;
      glow(w / 2, h / 2, 150, `rgba(${AMB},.16)`); x.fillStyle = 'rgba(0,0,0,.4)'; rr(8, 12, w, h, 14); x.fill();
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1c14'); g.addColorStop(1, '#170f0b'); x.fillStyle = g; rr(0, 0, w, h, 14); x.fill();
      x.strokeStyle = `rgba(${AMB},.95)`; x.lineWidth = 1.6; x.stroke(); T('Tech Lead', 18, 30, 22, '#fff', 'left', 700); T('Claude', w - 18, 31, 10, `rgba(${AMB},.95)`, 'right', 600, MONO); drawLogo('claude', w - 68, 30, 15, `rgb(${AMB})`);
      T('план · дані · код · перевірка', 18, 58, 10.5, 'rgba(255,230,210,.8)', 'left', 500, MONO);
      TM.forEach((n, i) => { x.fillStyle = lit(i) ? `rgb(${STC[n[0]]})` : 'rgba(255,255,255,.18)'; x.fillRect(18 + i * 23, 76, 17, 4); }); });
  }
  // рамка панелі агента (вузол розкривається)
  function panelFrame(nm, sub, w, h) {
    x.fillStyle = 'rgba(0,0,0,.45)'; rr(10, 14, w, h, 14); x.fill(); x.fillStyle = '#10151e'; rr(0, 0, w, h, 14); x.fill();
    x.strokeStyle = `rgba(${ACC},.85)`; x.lineWidth = 1.4; x.stroke(); x.fillStyle = `rgb(${ACC})`; x.beginPath(); x.arc(20, 24, 5, 0, TAU); x.fill();
    T(nm, 34, 24, 17, '#f2f5fa', 'left', 700); T(sub, w - 18, 25, 10, `rgb(${ACC})`, 'right', 600, MONO); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(16, 44, w - 32, 1);
  }
  // спершу переклад (англійська версія), потім обрізання друкованого рядка — інакше словник бачить лише уривки
  const TRS = (s) => (window.SK_TR ? window.SK_TR(s) : s), typed = (s, k) => TRS(s).slice(0, Math.max(0, Math.floor(k)));
  // ── панелі агентів (локальні координати 0..PW, 0..PH; lt — секунди від початку сцени) ──
  const P = {
    own(lt) { panelFrame('Product Owner', 'Власник · вирішує', PW, PH);
      const row = (Y, cmd, lb, a, act) => { if (a <= 0) return; x.save(); x.globalAlpha *= a; rr(18, Y, 62, 40, 10); x.fillStyle = act ? ACT : 'rgba(255,255,255,.06)'; x.fill(); x.strokeStyle = act ? ACT : 'rgba(255,255,255,.2)'; x.lineWidth = 1; x.stroke();
        T(cmd, 49, Y + 21, cmd.length > 2 ? 15 : 20, act ? '#fff' : 'rgba(255,255,255,.45)', 'center', 700, MONO); T(lb, 94, Y + 13, 11.5, act ? '#eef2f8' : 'rgba(255,255,255,.4)', 'left', 600); x.restore(); };
      row(58, '22', 'лише план', ez((lt - .3) / .3), true);
      if (lt > .8) { pa(ez((lt - .8) / .4)); T('Claude → план.md · 9 кроків', 94, 84, 9.5, `rgb(${AMB})`, 'left', 500, MONO);
        ['1 сценарій', '2 скріншот', '3 голос', '4 код', '5 кадри', '6 мерехтіння'].forEach((s, i) => T(s, 268 + (i % 2) * 80, 62 + Math.floor(i / 2) * 15, 9, 'rgba(220,228,240,.75)', 'left', 500, MONO)); pa(1); }
      row(120, '11', 'виконуємо', ez((lt - 2.2) / .3), true);
      if (lt > 2.4) { const p = cl((lt - 2.5) / 1.7); x.fillStyle = 'rgba(255,255,255,.08)'; rr(94, 146, 310, 6, 3); x.fill(); x.fillStyle = `rgb(${AMB})`; rr(94, 146, 310 * p, 6, 3); x.fill();
        T(`${Math.round(p * 9)} / 9 кроків`, 404, 134, 9, 'rgba(220,228,240,.75)', 'right', 500, MONO); }
      row(184, 'пуш', 'опублікувати — лише після перевірки', 1, false); T('чекає', 404, 205, 9, 'rgba(255,255,255,.35)', 'right', 500, MONO);
      T('без цих слів Claude не діє', 18, PH - 14, 9, 'rgba(220,228,240,.45)', 'left', 500, MONO); },
    gpt(lt) { panelFrame('Visual Designer', 'ChatGPT · промпт → картинка', PW, PH);
      x.fillStyle = 'rgba(255,255,255,.05)'; rr(16, 54, PW - 32, 24, 6); x.fill();
      T(typed('промпт: чорна діра з яскравим диском, маленький корабель, 21:9', (lt - .2) * 40), 24, 66.5, 9.5, '#c9d1d9', 'left', 500, MONO);
      // полотно 21:9, мазки пензлем
      const X0 = 30, Y0 = 88, w = 370, h = 128, p = cl((lt - 1.0) / 2.4); x.fillStyle = '#0a0c12'; x.fillRect(X0, Y0, w, h); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1; x.strokeRect(X0, Y0, w, h);
      x.save(); x.beginPath(); x.rect(X0, Y0, w, h); x.clip(); const A0 = x.globalAlpha;
      x.globalAlpha = A0 * cl(p / .2); const bg = x.createLinearGradient(X0, 0, X0 + w, 0); bg.addColorStop(0, '#060912'); bg.addColorStop(.6, '#101a33'); bg.addColorStop(1, '#0a0d18'); x.fillStyle = bg; x.fillRect(X0, Y0, w, h);
      for (let i = 0; i < 70; i++) if (hash(i) < p * 1.4) { x.fillStyle = `rgba(220,230,255,${.3 + .5 * hash(i + 3)})`; x.fillRect(X0 + hash(i + 1) * w, Y0 + hash(i + 2) * h, 1.2, 1.2); }
      const cx = X0 + w * .7, cy = Y0 + h * .5, arcs = [[150, 22, -.08, '#ffd29a', 6], [120, 16, -.06, '#ffb066', 4], [64, 58, 0, '#ffe2b8', 3.5], [180, 30, -.1, 'rgba(255,150,70,.6)', 2]];
      let brush = null; x.globalAlpha = A0; arcs.forEach(([rx, ry, rot, col, lw], i) => { const q = cl((p - .15 - i * .17) / .22); if (q <= 0) return; x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round';
        const a0 = Math.PI * .9, a1 = a0 + TAU * q; x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, a0, a1); x.stroke(); if (q < 1) brush = [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry]; });
      x.lineCap = 'butt'; if (p > .55) { x.globalAlpha = A0 * ez((p - .55) / .15); x.fillStyle = '#000'; x.beginPath(); x.arc(cx, cy, 34, 0, TAU); x.fill(); }
      if (p > .85) { x.globalAlpha = A0 * ez((p - .85) / .1); x.fillStyle = '#cfd6e2'; x.fillRect(X0 + w * .44, cy - 1, 12, 2); x.beginPath(); x.arc(X0 + w * .44 + 6, cy, 4, 0, TAU); x.strokeStyle = '#cfd6e2'; x.lineWidth = 1; x.stroke(); }
      x.restore();
      // пензель
      if (brush && p < 1) { const [bx, by] = brush; x.save(); x.translate(bx, by); x.rotate(-.7); x.fillStyle = '#d8b48a'; x.fillRect(-2, -34, 4, 22); x.fillStyle = '#9aa3b2'; x.fillRect(-3, -14, 6, 7); x.fillStyle = '#2a2f3a'; x.beginPath(); x.moveTo(-3, -7); x.lineTo(3, -7); x.lineTo(0, 2); x.closePath(); x.fill(); x.restore(); }
      T(p >= 1 ? 'banner.jpg · 1916 × 821 → Claude' : `малюю… ${Math.round(p * 100)} %`, 30, PH - 16, 10, p >= 1 ? `rgb(${AMB})` : '#8b949e', 'left', 600, MONO);
      T('атмосфера, не дані', PW - 18, PH - 16, 9, 'rgba(220,228,240,.45)', 'right', 500, MONO); },
    gem(lt) { panelFrame('Copy Editor', 'Gemini · текст → правки', PW, PH);
      const L = [[['«Інтерстеллар» Крістофера Нолана (2014)', 0]], [['є одним з небагатьох фільмів,', -1, 1.0], [' став чи не єдиним блокбастером,', 1, 1.5]],
        [['над яким всерйоз працював фізик-теоретик.', 0]], [['Також Кіп Торн', -1, 2.1], [' Кіп Торн', 1, 2.5], [' особисто обчислював', 0]], [['параметри чорної діри та червоточини.', 0]]];
      L.forEach((parts, i) => { const Y = 66 + i * 26; let X = 46; T(i < 3 ? 'Б1' : 'Б2', 18, Y, 8.5, 'rgba(143,182,255,.85)', 'left', 600, MONO); x.font = `500 11.5px ${SANS}`; x.textAlign = 'left';
        parts.forEach(([s, kind, at]) => { const a = kind === 1 ? ez((lt - at) / .4) : 1, w = x.measureText(s).width; if (a <= 0) return; pa(a);
          if (kind === -1) { const d = ez((lt - at) / .4); x.fillStyle = d > 0 ? `rgba(255,123,114,${.6 + .4 * d})` : '#c9d1d9'; x.fillText(s, X, Y); if (d > 0) x.fillRect(X, Y, w * d, 1.2); }
          else if (kind === 1) { x.fillStyle = 'rgba(46,160,90,.18)'; x.fillRect(X, Y - 9, w, 18); x.fillStyle = '#7ee2a0'; x.fillText(s, X, Y); }
          else { x.fillStyle = '#c9d1d9'; x.fillText(s, X, Y); } pa(1); X += w; }); });
      T('зауваження до фактів — лише сигнал: перевіряє Claude', 18, PH - 16, 9, 'rgba(220,228,240,.5)', 'left', 500, MONO); },
    src(lt) { panelFrame('Data Analyst', 'Першоджерела · запит → цифри', PW, PH);
      T(typed('GET api.stlouisfed.org/fred/series/observations?series_id=UNRATE', (lt - .1) * 50), 18, 58, 8.5, '#8b949e', 'left', 500, MONO);
      const X0 = 46, X1 = PW - 20, Y0 = 76, Y1 = PH - 48, sx = (i) => lerp(X0, X1, i / (UN.length - 1)), sy = (v) => lerp(Y1, Y0, v / 16);
      x.lineWidth = .8; [0, 5, 10, 15].forEach((v) => { x.strokeStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.moveTo(X0, sy(v)); x.lineTo(X1, sy(v)); x.stroke(); T(v + ' %', X0 - 6, sy(v), 8.5, '#8b949e', 'right', 500, MONO); });
      for (let yr = 0; yr < 8; yr++) T(String(2019 + yr), sx(yr * 12), Y1 + 12, 8.5, '#8b949e', 'center', 500, MONO);
      const p = cl((lt - .6) / 2.2), n = Math.floor(p * (UN.length - 1));
      x.strokeStyle = `rgb(${AMB})`; x.lineWidth = 1.6; x.beginPath(); let up = false; for (let i = 0; i <= n; i++) { const v = UN[i]; if (v == null) { up = false; continue; } up ? x.lineTo(sx(i), sy(v)) : x.moveTo(sx(i), sy(v)); up = true; } x.stroke();
      x.fillStyle = '#fff'; for (let i = 0; i <= n; i++) if (UN[i] != null) x.fillRect(sx(i) - 1, sy(UN[i]) - 1, 2, 2);
      if (n >= 15) { pa(ez((lt - 1.6) / .4)); x.strokeStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(sx(15) + 4, sy(14.8)); x.lineTo(sx(15) + 30, sy(14.8) + 6); x.stroke();
        T('14,8 % · квітень 2020', sx(15) + 34, sy(14.8) + 6, 10, '#fff', 'left', 600, MONO); pa(1); }
      T('FRED · UNRATE · безробіття США, % · знімок 20.10.2026', 18, PH - 14, 8.5, 'rgba(220,228,240,.55)', 'left', 500, MONO); },
    tri(lt) { panelFrame('3D Artist', 'Tripo · Blender', PW, PH);
      // чотири види кільцевої станції
      [['спереду', 0], ['збоку', 1], ['згори', 2], ['3/4', 3]].forEach(([nm, k], i) => { const X = 20 + (i % 2) * 92, Y = 56 + Math.floor(i / 2) * 92; pa(ez((lt - .2 - i * .25) / .4)); x.fillStyle = 'rgba(255,255,255,.04)'; x.fillRect(X, Y, 84, 76); x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 1; x.strokeRect(X, Y, 84, 76);
        x.strokeStyle = '#c9d1d9'; x.lineWidth = 1.4; const cx = X + 42, cy = Y + 34; x.beginPath();
        if (k === 0 || k === 2) { x.arc(cx, cy, 24, 0, TAU); x.moveTo(cx + 5, cy); x.arc(cx, cy, 5, 0, TAU); for (let j = 0; j < 4; j++) { const an = j * Math.PI / 2 + (k ? .4 : 0); x.moveTo(cx + Math.cos(an) * 5, cy + Math.sin(an) * 5); x.lineTo(cx + Math.cos(an) * 24, cy + Math.sin(an) * 24); } }
        else if (k === 1) { x.rect(cx - 28, cy - 4, 56, 8); x.rect(cx - 5, cy - 12, 10, 24); }
        else { x.ellipse(cx, cy, 28, 12, -.3, 0, TAU); x.moveTo(cx + 5, cy); x.ellipse(cx, cy, 5, 3, -.3, 0, TAU); } x.stroke(); T(nm, cx, Y + 68, 8.5, '#8b949e', 'center', 500, MONO); pa(1); });
      arrow(206, 132, 236, 132, `rgb(${AMB})`, 1.2, 6);
      // каркасна модель: 12 модулів на кільці, втулка, спиці; обертається
      const cx = 330, cy = 128, ay = lt * .9, ax = .5, P3 = (X, Y, Z) => { const c = Math.cos(ay), s = Math.sin(ay), X1 = X * c + Z * s, Z1 = -X * s + Z * c, c2 = Math.cos(ax), s2 = Math.sin(ax), Y2 = Y * c2 - Z1 * s2, Z2 = Y * s2 + Z1 * c2, k = 300 / (300 + Z2); return [cx + X1 * k, cy + Y2 * k]; };
      pa(ez((lt - 1.2) / .6)); x.strokeStyle = 'rgba(160,210,255,.85)'; x.lineWidth = .9; x.beginPath(); const seg = (a1, b1) => { x.moveTo(a1[0], a1[1]); x.lineTo(b1[0], b1[1]); };
      for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, an2 = (i + .7) / 12 * TAU, at = (an0, r1, y1) => P3(Math.cos(an0) * r1, y1, Math.sin(an0) * r1);
        for (const [r1, y1] of [[64, -6], [64, 6], [76, -6], [76, 6]]) seg(at(an, r1, y1), at(an2, r1, y1));
        for (const [r1, r2, y1, y2] of [[64, 76, -6, -6], [64, 76, 6, 6], [64, 64, -6, 6], [76, 76, -6, 6]]) seg(at(an, r1, y1), at(an, r2, y2)); }
      for (let i = 0; i < 4; i++) { const an = i / 4 * TAU + .13; seg(P3(Math.cos(an) * 10, 0, Math.sin(an) * 10), P3(Math.cos(an) * 64, 0, Math.sin(an) * 64)); }
      for (let i = 0; i < 16; i++) { const a1 = i / 16 * TAU, a2 = (i + 1) / 16 * TAU; for (const yy of [-9, 9]) seg(P3(Math.cos(a1) * 10, yy, Math.sin(a1) * 10), P3(Math.cos(a2) * 10, yy, Math.sin(a2) * 10)); }
      x.stroke(); pa(1);
      T(lt > 3 ? 'ring.glb · 12 модулів → Claude' : 'Tripo → Blender → GLB', 236, PH - 16, 10, lt > 3 ? `rgb(${AMB})` : '#8b949e', 'left', 600, MONO);
      T('лише за командою', 20, PH - 16, 9, 'rgba(220,228,240,.45)', 'left', 500, MONO); },
    suno(lt) { panelFrame('Sound Designer', 'Suno · опис → музика', PW, PH);
      x.fillStyle = 'rgba(255,255,255,.05)'; rr(16, 54, PW - 32, 24, 6); x.fill(); T(typed('опис: мінімалістична електроніка в дусі техно-трилера', (lt - .2) * 42), 24, 66.5, 9.5, '#c9d1d9', 'left', 500, MONO);
      // справжня обвідна ambient.m4a (фон статті): 180 вікон
      const X0 = 22, X1 = PW - 22, Yc = 140, p = cl((lt - .8) / 1.6), ph = cl((lt - 1.6) / 2.6);
      for (let i = 0; i < RMS.length; i++) { const X = lerp(X0, X1, i / (RMS.length - 1)), f = i / RMS.length; if (f > p) break; const v = Math.max(.6, RMS[i] / 99 * 46);
        x.fillStyle = f < ph ? `rgb(${AMB})` : 'rgba(200,214,235,.55)'; x.fillRect(X - .7, Yc - v, 1.4, v * 2); }
      if (ph > 0) { const X = lerp(X0, X1, ph); x.fillStyle = '#fff'; x.fillRect(X - .5, Yc - 54, 1, 108); }
      ['0:00', '1:10', '2:21', '3:31'].forEach((s, i) => T(s, lerp(X0, X1, i / 3), Yc + 62, 8.5, '#8b949e', i ? (i === 3 ? 'right' : 'center') : 'left', 500, MONO));
      T('ambient.m4a · «Protocol Underscore» · фон статті → Claude', 22, PH - 16, 10, lt > 2.6 ? `rgb(${AMB})` : '#8b949e', 'left', 600, MONO); },
    slop(lt) { panelFrame('QA · Fact-checker', 'ai slop helper', PW, PH);
      const fix = ez((lt - 3.2) / .5), L = [['✓', '#3fb950', 'Кіп Торн — фізик із Caltech, ідеолог LIGO.'], ['В', '#58a6ff', 'Пройдемося головоломками кінострічки.'],
        ['?', '#d29922', 'Тесеракт — найсміливіша вигадка фільму.'], ['!', '#f85149', 'Нобелівську премію Торн отримав за фільм.'], ['✓', '#3fb950', 'Чорну діру рахував алгоритм DNGR.']];
      L.forEach(([m, c, s], i) => { const Y = 64 + i * 30, a = ez((lt - .2 - i * .18) / .35); if (a <= 0) return; pa(a); let mc = c, ms = m, txt = s;
        if (i === 3) { const hot = ez((lt - 2.2) / .3) * (1 - fix); if (hot > 0) { x.fillStyle = `rgba(248,81,73,${.16 * hot})`; x.fillRect(46, Y - 11, PW - 64, 22); x.strokeStyle = `rgba(248,81,73,${.8 * hot})`; x.lineWidth = 1; x.strokeRect(46, Y - 11, PW - 64, 22); }
          if (fix > 0) { txt = 'Нобель 2017 — за LIGO, не за фільм.'; mc = '#3fb950'; ms = '✓'; pa(a * fix); } }
        x.fillStyle = mc; x.beginPath(); x.arc(28, Y, 9, 0, TAU); x.fill(); T(ms, 28, Y + .5, 10, '#0d1117', 'center', 800, SANS); T(txt, 50, Y, 12, '#c9d1d9', 'left', 500, SANS);
        if (i === 3 && lt > 2.3 && fix < 1) { pa(a * (1 - fix)); T('немає джерела', PW - 22, Y - 17, 8.5, '#f85149', 'right', 700, MONO); } pa(1); });
      [['✓', '#3fb950', 'перевірено'], ['?', '#d29922', 'гіпотеза'], ['В', '#58a6ff', 'слово власника'], ['!', '#f85149', 'вигадано']].forEach(([m, c, s], i) => { const X = 20 + i * 100; x.fillStyle = c; x.beginPath(); x.arc(X + 5, PH - 16, 5, 0, TAU); x.fill(); T(s, X + 14, PH - 16, 8.5, '#8b949e', 'left', 500, MONO); }); },
    sub(lt) { panelFrame('Dev Team', 'Субагенти · задача → звіт', PW, PH);
      // задача від Claude
      x.fillStyle = 'rgba(255,255,255,.05)'; rr(18, 60, 120, 150, 8); x.fill(); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1; x.stroke(); T('TASK-36-', 28, 78, 10, '#e6edf3', 'left', 700, MONO); T('trailer-v6.md', 28, 92, 10, '#e6edf3', 'left', 700, MONO);
      for (let i = 0; i < 7; i++) { x.fillStyle = 'rgba(200,214,235,.3)'; x.fillRect(28, 108 + i * 13, 96 - hash(i) * 40, 3); }
      const NAMES = [['кадри', 'headless Chrome'], ['голос', 'say + ffmpeg'], ['код', 'sk-trailer.js']], REP = ['STATUS', 'FILES', 'CHANGES', 'CHECKS', 'OPEN'];
      NAMES.forEach(([a1, b1], i) => { const Y = 60 + i * 52, out = ez((lt - .5 - i * .25) / .5), back = ez((lt - 2.3 - i * .2) / .5); if (out <= 0) return; const X = lerp(150, 176, out);
        pa(out); arrow(140, 135, X - 4, Y + 20, 'rgba(170,190,220,.5)', 1, 5); x.fillStyle = '#141b26'; rr(X, Y, 236, 44, 8); x.fill(); x.strokeStyle = back > 0 ? `rgba(63,185,80,${.4 + .5 * back})` : 'rgba(255,255,255,.18)'; x.lineWidth = 1; x.stroke();
        T(`субагент ${i + 1} · ${a1}`, X + 10, Y + 14, 10, '#e6edf3', 'left', 700, SANS); T(b1, X + 10, Y + 31, 8.5, '#8b949e', 'left', 500, MONO);
        if (back > 0) REP.forEach((r, j) => { pa(out * ez((lt - 2.4 - i * .2 - j * .08) / .25)); T(r, X + 124 + (j % 3) * 38, Y + 14 + Math.floor(j / 3) * 16, 7.5, j < 4 ? '#3fb950' : '#8b949e', 'left', 600, MONO); });
        pa(1); });
      const st = ez((lt - 3.4) / .3); if (st > 0) { x.save(); x.globalAlpha *= st; x.translate(78, 226); x.rotate(-.08); x.strokeStyle = '#3fb950'; x.lineWidth = 1.6; rr(-62, -12, 124, 24, 5); x.stroke(); T('ПЕРЕВІРЕНО CLAUDE', 0, .5, 9, '#3fb950', 'center', 800, MONO); x.restore(); } }
  };
  // реальні дані для панелей: безробіття США (FRED UNRATE, 2019-01…2026-09, знімок статті 35) і обвідна ambient.m4a (180 вікон)
  const UN = /*@UN@*/[4,3.8,3.8,3.7,3.6,3.6,3.7,3.6,3.5,3.6,3.6,3.6,3.6,3.5,4.4,14.8,13.2,11,10.2,8.4,7.8,6.9,6.7,6.7,6.4,6.2,6.1,6.1,5.8,5.9,5.4,5.1,4.7,4.5,4.1,3.9,4,3.9,3.7,3.7,3.6,3.6,3.5,3.6,3.5,3.6,3.6,3.5,3.5,3.6,3.5,3.4,3.6,3.6,3.5,3.7,3.7,3.9,3.7,3.8,3.7,3.9,3.9,3.9,3.9,4.1,4.2,4.2,4.1,4.1,4.2,4.1,4,4.2,4.2,4.2,4.3,4.1,4.3,4.3,4.4,null,4.5,4.4,4.3,4.4,4.3,4.3,4.3,4.2,4.1,4.1,4.2], RMS = /*@RMS@*/[15,31,36,39,59,79,62,46,25,57,75,48,47,47,87,60,37,99,30,85,59,48,40,37,84,64,33,31,49,75,45,38,48,60,45,28,39,44,87,72,55,62,43,82,73,48,72,44,89,68,48,73,69,59,48,53,42,77,92,64,58,70,87,90,58,73,70,95,88,81,85,74,94,77,84,93,67,87,57,48,60,65,86,58,68,58,89,71,60,68,77,90,78,71,73,80,85,77,69,86,67,89,57,80,78,84,81,73,83,73,72,76,65,75,76,84,81,77,75,70,80,78,77,89,83,91,82,68,67,74,43,32,33,36,64,71,54,66,55,65,67,62,72,67,80,59,75,77,74,78,61,77,72,83,66,23,25,24,18,24,31,37,38,22,72,57,68,65,77,85,69,75,72,24,81,48,21,7,2,2];
  // ══ ТРЕЙЛЕРНА МОВА: інтертитри, whip-pan ══
  // інтертитр: великий текст на чорному з розрядкою, тонка лінія, короткий «лінзовий відблиск» (з'являється за 4 кадри, гасне за 6)
  function inter(txt, sub) { return function (u, len) {
    fill('#05060a');
    const a = ez(u / .2) * (1 - ez((u - len + .22) / .22)), sc = 1.05 - .05 * eo(u / .45) + .025 * ez(u / len);
    x.save(); x.scale(sc, sc); ga(a);
    x.letterSpacing = '14px'; x.font = `700 60px ${SANS}`; const tw = x.measureText(txt).width;
    const g = x.createLinearGradient(-tw / 2, 0, tw / 2, 0); g.addColorStop(0, '#eef1f6'); g.addColorStop(.55, '#ffffff'); g.addColorStop(1, '#ffe4cc');
    T(txt, 7, -4, 60, g, 'center', 700); x.letterSpacing = '0px';
    const lw = (tw + 30) * eo((u - .08) / .6); x.fillStyle = `rgba(${AMB},.85)`; x.fillRect(-lw / 2, 40, lw, 1.2);
    if (sub) { x.letterSpacing = '5px'; T(sub, 2.5, 64, 10, 'rgba(220,228,240,.62)', 'center', 600, MONO); x.letterSpacing = '0px'; }
    // відблиск: смуга й м'яке ядро пролітають уздовж рядка
    const fl = ez((u - .1) / .13) * (1 - ez((u - .23) / .2)), fx2 = lerp(-tw * .55, tw * .55, ez((u - .05) / .55));
    if (fl > 0) { x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = a * fl;
      const s1 = x.createLinearGradient(fx2 - tw * .7, 0, fx2 + tw * .7, 0); s1.addColorStop(0, 'rgba(255,190,130,0)'); s1.addColorStop(.5, 'rgba(255,214,170,.75)'); s1.addColorStop(1, 'rgba(255,190,130,0)');
      x.fillStyle = s1; x.fillRect(fx2 - tw * .7, -5, tw * 1.4, 1.6); glow(fx2, -5, 70, 'rgba(255,200,150,.35)'); glow(-fx2 * .6, -5, 22, 'rgba(160,200,255,.25)'); x.restore(); }
    x.restore(); }; }
  // whip-pan: смуги руху поверх кадру (k — 0..1 переходу, dir — напрямок)
  function streaks(k, dir) { const p = Math.sin(Math.PI * k); if (p <= 0) return; x.save(); x.fillStyle = 'rgb(200,214,235)';
    for (let i = 0; i < 26; i++) { const Y = (hash(i * 3.1) - .5) * hh * 2, w = (.3 + .7 * hash(i + 9)) * hw * 1.6, X0 = (hash(i + 4) - .5) * hw * 2 - dir * k * 300;
      x.globalAlpha = .06 * p * (.4 + .6 * hash(i + 2)); x.fillRect(X0 - w / 2, Y, w, .8 + 1.5 * hash(i + 7)); } x.restore(); }
  // плашка з лівим краєм у X
  function chipL(s, X, Y, col, sz = 9, bg, a = 1) { x.font = `600 ${sz}px ${MONO}`; const w = x.measureText(s).width + sz * 1.3; chip(s, X + w / 2, Y, col, sz, bg, a); }

  // 4. Код: проліт крізь піксель, сценарій v4 стиснуто в 1,5 раза
  function c04(u, len) { s03(u * 1.5, len * 1.5); }

  // ══ АКТ III · РУКАВИЦЯ (v7): стек стягується у вузол Claude → вісім каменів-агентів загоряються по черзі на долі ══
  // колір каменя означає лише одне — «який агент» — і тримається скрізь у «Команді» (камінь, акцент панелі, слоти); сфера — під роллю
  const STC = { own: '242,193,78', gpt: '79,140,255', gem: '169,112,255', src: '63,208,201', tri: '255,93,93', suno: '255,154,60', slop: '82,210,115', sub: '232,107,208' };
  const SPH = { own: 'рішення', gpt: 'картинки', gem: 'стиль', src: 'цифри', tri: 'моделі', suno: 'музика', slop: 'правда', sub: 'великі задачі' };
  const GAU = TM.map((n, i) => { const an = (-67.5 + i * 45) * DEG; return [Math.cos(an) * 262, Math.sin(an) * 168]; }), STONE_U = (i) => 1.5 + i * .5;
  // v8: камені — логотипи інструментів (simple-icons, CC0; торгові марки належать власникам; сторінка внутрішня).
  //   Для ролей без продукту — свої значки: власник (людина), першоджерела (стовпчики), ai slop helper (лупа), субагенти (решітка).
  const LOGO_D = {"gpt": "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z", "gem": "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81", "tri": "M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626", "suno": "M16.5 0C20.642 0 24 5.373 24 12h-9c0 6.627-3.358 12-7.5 12C3.358 24 0 18.627 0 12h9c0-6.627 3.358-12 7.5-12Z", "claude": "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"};
  Object.assign(LOGO_D, { own: 'M12 3.2a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6zM3.6 21.2c.5-4.6 4-7.4 8.4-7.4s7.9 2.8 8.4 7.4z',
    src: 'M3.5 20.5v-8h4v8zm6.5 0v-17h4v17zm6.5 0v-11h4v11z', slop: 'M10 2.5a7.5 7.5 0 0 1 6 12l5.4 5.4-1.6 1.6-5.4-5.4A7.5 7.5 0 1 1 10 2.5zm0 2.4a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2z',
    sub: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z' });
  const LOGO = {}; const logoP = (k) => LOGO[k] || (LOGO[k] = typeof Path2D !== 'undefined' && LOGO_D[k] ? new Path2D(LOGO_D[k]) : null);
  // логотип k у центрі (X, Y), розмір sz (віртуальні px), колір col
  function drawLogo(k, X, Y, sz, col, a = 1) { const P = logoP(k); if (!P || a <= 0) return; x.save(); x.globalAlpha *= a; x.translate(X - sz / 2, Y - sz / 2); x.scale(sz / 24, sz / 24); x.fillStyle = col; x.fill(P, 'evenodd'); x.restore(); }
  // камінь: огранений шестикутник, грані, відблиск; lit — світиться (джерело світла — сам камінь); logo — знак інструмента в камені
  function gem(X, Y, r, col, lit, a = 1, logo = null) {
    if (a <= 0 || r <= 0) return;
    // v8 (власник: «логотип і є камінь»): камінь — сам знак інструмента, як огранений кристал: колір каменя, внутрішнє світло, відблиск, світний край
    const LP = logo && logoP(logo); if (LP) { x.save(); x.globalAlpha *= a; if (lit > 0) glow(X, Y, r * 2.4, `rgba(${col},.45)`, lit);
      const sz = r * 2.1; x.translate(X - sz / 2, Y - sz / 2); x.scale(sz / 24, sz / 24);
      const g = x.createRadialGradient(9, 8, 1, 12, 12, 15); g.addColorStop(0, `rgba(255,255,255,${.55 + .35 * lit})`); g.addColorStop(.35, `rgba(${col},${.75 + .25 * lit})`); g.addColorStop(1, `rgba(${col},${.35 + .25 * lit})`);
      x.fillStyle = g; x.fill(LP, 'evenodd'); x.lineWidth = .35; x.strokeStyle = `rgba(255,255,255,${.25 + .45 * lit})`; x.stroke(LP);
      x.save(); x.clip(LP, 'evenodd'); x.fillStyle = `rgba(255,255,255,${.12 + .3 * lit})`; x.beginPath(); x.ellipse(8, 6, 7, 3, -.5, 0, TAU); x.fill(); x.restore(); x.restore(); return; }
    x.save(); x.globalAlpha *= a;
    if (lit > 0) glow(X, Y, r * 2.3, `rgba(${col},.45)`, lit);
    const P = []; for (let j = 0; j < 6; j++) { const an = (j / 6) * TAU - Math.PI / 2; P.push([X + Math.cos(an) * r * .82, Y + Math.sin(an) * r]); }
    const g = x.createRadialGradient(X - r * .25, Y - r * .3, r * .1, X, Y, r * 1.05); g.addColorStop(0, `rgba(${col},${.35 + .65 * lit})`); g.addColorStop(1, `rgba(${col},${.12 + .3 * lit})`);
    x.beginPath(); P.forEach(([px, py], j) => (j ? x.lineTo(px, py) : x.moveTo(px, py))); x.closePath(); x.fillStyle = '#0b0d12'; x.fill(); x.fillStyle = g; x.fill();
    x.strokeStyle = `rgba(${col},${.5 + .5 * lit})`; x.lineWidth = Math.max(1, r / 30); x.stroke();
    // грані: внутрішній шестикутник і ребра до вершин
    const Q = P.map(([px, py]) => [X + (px - X) * .45, Y + (py - Y) * .45]); x.strokeStyle = `rgba(255,255,255,${.12 + .2 * lit})`; x.lineWidth = Math.max(.6, r / 60); x.beginPath();
    Q.forEach(([px, py], j) => (j ? x.lineTo(px, py) : x.moveTo(px, py))); x.closePath(); P.forEach(([px, py], j) => { x.moveTo(px, py); x.lineTo(Q[j][0], Q[j][1]); }); x.stroke();
    x.fillStyle = `rgba(255,255,255,${.18 + .4 * lit})`; x.beginPath(); x.ellipse(X - r * .25, Y - r * .45, r * .18, r * .09, -.5, 0, TAU); x.fill();
    // знак інструмента: темна підкладка, щоб грані не перекреслювали логотип
    x.restore();
  }
  // рукавиця: темна металева пластина з обідком, гнізда каменів на еліпсі, Claude у центрі; lit(i) — світло i-го каменя, la — підписи
  function gauntlet(a, lit, la) {
    if (a <= 0) return; x.save(); x.globalAlpha *= a;
    const g = x.createRadialGradient(0, -20, 30, 0, 0, 330); g.addColorStop(0, '#1c2029'); g.addColorStop(1, '#0c0e13'); x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, 300, 198, 0, 0, TAU); x.fill();
    x.strokeStyle = `rgba(${AMB},.55)`; x.lineWidth = 2; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 1; x.beginPath(); x.ellipse(0, 0, 286, 185, 0, 0, TAU); x.stroke();
    TM.forEach((n, i) => { const [X, Y] = GAU[i], L = lit(i), col = STC[n[0]]; x.fillStyle = '#07080b'; x.beginPath(); x.arc(X, Y, 27, 0, TAU); x.fill(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.stroke();
      gem(X, Y, 25, col, L, 1, n[0]); const ta = la * ez(L / .6); if (ta <= 0) return; const s = X < 0 ? -1 : 1, TX = X + s * 38;
      x.save(); x.globalAlpha *= ta; T(n[9], TX, Y - 6, 13, '#f2f5fa', s < 0 ? 'right' : 'left', 700); T(SPH[n[0]], TX, Y + 10, 9.5, `rgb(${col})`, s < 0 ? 'right' : 'left', 600, MONO); x.restore(); });
    x.restore();
  }
  // 8. Стек стягується в точку погляду (вузол Claude), навколо — рукавиця; камені загоряються по черзі на долі, наприкінці світяться всі разом
  function sWake(u, len) {
    // v8: з міста — наїзд і згасання, з темряви проступає рукавиця
    const c0 = ez(u / .9), sa = 1 - ez((u - .75) / .35); if (sa > 0) { x.save(); x.globalAlpha *= sa; const z = 1 + 1.2 * c0; x.scale(z, z); cityFrame(10); x.restore(); }
    bgDesk(c0); SS = 1; SO = [0, 0, 0]; SHX = 0; cam(TOV);
    const ga0 = ez((u - .8) / .5), all = ez((u - 5.05) / .35);
    gauntlet(ga0, (i) => Math.min(1, ez((u - STONE_U(i)) / .12) * (.75 + .25 * all)), 1);
    const ig = ez((u - .95) / .25), c = pr(0, 0); glow(c[0], c[1], 60 + 150 * ig, `rgba(${AMB},.28)`, ig * (1 - .5 * ez((u - 1.4) / .6)));
    claudeNode(ez((u - .8) / .4), (i) => u >= STONE_U(i));
    cap('КОМАНДА', 'Рукавиця: вісім агентів — одна команда', u, len);
  }

  // ══ АКТ IV · КОМАНДА ══
  // постери: ім'я + головна дія одним кадром; час панелі агента прискорено, щоб дія вмістилася в такт
  const PO = { own: ['22 — план · 11 — виконати', (u) => .3 + u * 2], gpt: ['малює банер', (u) => .6 + u * 1.6], gem: ['править стиль тексту', (u) => .4 + u * 1.4],
    src: ['приносить цифри з джерел', (u) => .4 + u * 1.4], tri: ['4 види → 3D-модель', (u) => .6 + u * 1.5], suno: ['пише музику', (u) => .6 + u * 1.6],
    slop: ['перевіряє походження фраз', (u) => u], sub: ['беруть великі задачі', (u) => .3 + u] };
  function panelAt(id, lt, cx, cy, s, a) { if (a <= 0) return; ACC = STC[id] || AMB; x.save(); x.translate(cx - PW * s / 2, cy - PH * s / 2); x.scale(s, s); PA = x.globalAlpha * a; x.globalAlpha = PA; P[id](lt); PA = 1; ACC = AMB; x.restore(); }
  // агент (4 с): камера наїжджає в камінь → камінь розкривається в панель агента (колір каменя — акцент панелі) → панель працює.
  // Склейка «камінь → камінь» — м'який перехід і короткий спалах кольору наступного каменя (≤ 6 % яскравості за кадр)
  const SP = [235, 4], plt = (u) => Math.max(0, u - .85) * 1.3 + .2;
  const poster = (i) => function (u, len) {
    const n = TM[i], col = STC[n[0]], act = PO[n[0]][0]; bgDesk(1); cam(TOV); floorGrid(-700, -420, 700, 420, 60, .35);
    // камінь: наїзд (радіус 46 → 120), далі розкривається — росте й гасне, під ним проступає панель
    const op = ez((u - .7) / .45), r = Math.exp(lerp(LN(46), LN(120), eo(u / .9))) * (1 + .6 * op);
    // v8.3: каменів у агентів немає (власник) — панель з'являється одразу, легким наїздом
    const ps = lerp(.82, 1, eo(u / .5)); panelAt(n[0], plt(u), SP[0], SP[1], ps, ez(u / .25));
    const a = ez((u - .25) / .3), X = -430, sl = (1 - eo((u - .25) / .45)) * 26;
    ga(a); x.letterSpacing = '3px'; T(`АГЕНТ ${String(i + 1).padStart(2, '0')} / 08`, X, -70, 9.5, `rgba(${col},.95)`, 'left', 600, MONO);
    x.letterSpacing = '-1px'; T(n[9], X - sl, -30, n[9].length > 13 ? 38 : 48, '#f6f8fb', 'left', 700); x.letterSpacing = '0px';
    T(act, X, 14, 17, `rgb(${col})`, 'left', 650); T(`${n[1]} · ${SPH[n[0]]}`, X, 38, 10.5, 'rgba(220,228,240,.6)', 'left', 500, MONO);
    chipL(`${TOK[n[0]]} → Claude`, X, 72, `rgb(${col})`, 9, 'rgba(8,10,16,.92)', ez((u - 2.6) / .3));
    // восьмеро слотів команди — кольорами каменів; засвічуються по черзі
    TM.forEach((m, j) => { const on = j < i ? 1 : j === i ? ez((u - .2) / .15) : 0; x.fillStyle = on ? `rgba(${STC[m[0]]},${.3 + .65 * on})` : 'rgba(255,255,255,.14)'; x.fillRect(X + j * 34, 118, 26, 3); });
    x.letterSpacing = '2px'; T('КОМАНДА ВМИКАЄТЬСЯ', X, 134, 8.5, 'rgba(220,228,240,.45)', 'left', 600, MONO); x.letterSpacing = '0px'; ga(1);
    // спалах кольору каменя на склейці (крім першого агента — перед ним інтертитр)
    if (i) { const fl = .12 * ez(u / .1) * (1 - ez((u - .1) / .4)); if (fl > 0) fill(`rgba(${col},${fl})`); }
  };
  // розщеплений екран: спершу дві панелі, на третій долі — чотири; потоки даних сходяться до Claude
  function sSplit(u, len) {
    bgDesk(1); cam(TOV); floorGrid(-700, -420, 700, 420, 60, .3);
    const m = ez((u - 2) / .35), sA = .98, sB = .84;
    const L = [['gpt', -222, 0, -189, -112, (v) => .5 + v * .95], ['suno', 222, 0, 189, -112, (v) => .5 + v * .95], ['tri', -189, 420, -189, 112, (v) => .3 + (v - 2) * 1.6], ['src', 189, 420, 189, 112, (v) => .3 + (v - 2) * 1.6]];
    const pos = L.map(([id, ax, ay, bx, by, lt], j) => [id, lerp(ax, bx, m), lerp(ay, by, m), j < 2 ? lerp(sA, sB, m) : sB, lt(u), j < 2 ? 1 : m]);
    // потоки до центру
    pos.forEach(([id, X, Y, s, , a], j) => { if (a <= 0) return; const ex2 = X - Math.sign(X) * PW * s * .5 * .2, ey = Y * .55; x.save(); x.globalAlpha = a * .8; x.strokeStyle = 'rgba(170,190,220,.35)'; x.setLineDash([3, 5]); x.lineWidth = 1; x.beginPath(); x.moveTo(ex2, ey); x.lineTo(0, 0); x.stroke(); x.setLineDash([]);
      for (let d = 0; d < 3; d++) { const f = (u * 1.4 + d / 3 + j * .17) % 1, X1 = lerp(ex2, 0, f), Y1 = lerp(ey, 0, f); glow(X1, Y1, 7, `rgba(${AMB},.8)`, Math.sin(Math.PI * f)); } x.restore(); });
    pos.forEach(([id, X, Y, s, lt, a]) => panelAt(id, lt, X, Y, s, a));
    // Claude у центрі
    const pu = .5 + .5 * Math.cos((u % .5) / .5 * TAU); glow(0, 0, 70, `rgba(${AMB},.25)`, .6 + .4 * pu);
    x.fillStyle = '#2a1c14'; rr(-66, -18, 132, 36, 16); x.fill(); x.strokeStyle = `rgba(${AMB},.95)`; x.lineWidth = 1.4; x.stroke(); T('Tech Lead', 0, -4, 13, '#fff', 'center', 700); T('Claude', 0, 9, 7.5, `rgba(${AMB},.95)`, 'center', 600, MONO);
    cap('КОМАНДА', 'Разом, паралельно', u, 2);
  }
  // ── дошка збирання: агенти ліворуч і праворуч, Claude угорі, у центрі — макет сторінки, що наповнюється шматками ──
  // v7: збирання зсунуто на такт 41 (сама сцена без змін); конфлікт розтягнуто: проблема 43–45,5 · перевірка 45,5–48 · перевірено 48–50
  const CFB = B(43), CKB = B(45.5), OKB = B(48), PEB = B(50);
  const BOARD0 = B(41), CLN = [0, -190], PGM = [-195, -132, 390, 300];
  const BAG = [['gpt', -350, -112], ['gem', -350, 0], ['src', -350, 112], ['tri', 350, -112], ['suno', 350, 0], ['slop', 350, 112]];
  // слоти макета: [x, y, w, h, підпис] у локальних координатах макета
  const SLOT = { gpt: [10, 24, 370, 84, 'банер'], gem: [10, 140, 370, 70, 'текст'], src: [10, 218, 176, 72, 'дані'], tri: [194, 218, 92, 72, '3D'], suno: [294, 218, 86, 72, 'звук'], slop: [10, 140, 370, 70, 'помітки'] };
  const LEDE = ['«Інтерстеллар» став чи не єдиним блокбастером,', 'над яким всерйоз працював фізик-теоретик.', 'Нобелівську премію Торн отримав за фільм.', 'Кіп Торн особисто обчислював чорну діру.'], LIE = 2, LY = (i) => 154 + i * 15;
  const TA = (j) => BOARD0 + .2 + j * .55;
  const nameOf = (id) => TM.find((n) => n[0] === id)[1];
  // шматок у слоті макета
  function piece(id, a, tm, red, ok) {
    if (a <= 0) return; const [X, Y, w, h] = SLOT[id]; x.save(); x.globalAlpha *= a;
    if (id === 'gpt') { const g = x.createLinearGradient(X, 0, X + w, 0); g.addColorStop(0, '#060912'); g.addColorStop(.6, '#101a33'); g.addColorStop(1, '#0a0d18'); x.fillStyle = g; x.fillRect(X, Y, w, h);
      for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(220,230,255,${.3 + .4 * hash(i + 3)})`; x.fillRect(X + hash(i + 1) * w, Y + hash(i + 2) * h, 1, 1); }
      x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.strokeStyle = 'rgba(234,82,18,.85)'; x.lineWidth = 1.6; x.beginPath(); x.ellipse(X + w * .72, Y + h * .5, w * .3, h * .2, -.1, 0, TAU); x.stroke();
      x.fillStyle = '#000'; x.beginPath(); x.arc(X + w * .74, Y + h * .5, h * .2, 0, TAU); x.fill(); x.strokeStyle = 'rgba(255,200,140,.8)'; x.lineWidth = 2; x.stroke(); x.restore();
      x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(X + 12, Y + h * .42, 110, 6); x.fillStyle = ACT; x.fillRect(X + 12, Y + h * .42 + 12, 80, 3); }
    else if (id === 'gem') { x.font = `500 9.5px ${SANS}`; LEDE.forEach((s, i) => { const lie = i === LIE; let col = '#c9d1d9', txt = s;
        if (lie && red > 0) { x.fillStyle = `rgba(248,81,73,${.18 * red})`; x.fillRect(X + 4, LY(i) - 7, w - 8, 14); x.strokeStyle = `rgba(248,81,73,${.85 * red})`; x.lineWidth = 1; x.strokeRect(X + 4, LY(i) - 7, w - 8, 14); col = red > .5 ? '#ff9a92' : col; }
        if (lie && ok > 0) { txt = 'Нобель 2017 — за LIGO, не за фільм.'; x.fillStyle = `rgba(46,160,90,${.2 * ok})`; x.fillRect(X + 4, LY(i) - 7, w - 8, 14); col = '#7ee2a0'; }
        T(txt, X + 22, LY(i), 9.5, col, 'left', 500); }); }
    else if (id === 'src') { x.fillStyle = 'rgba(255,255,255,.03)'; x.fillRect(X, Y, w, h); const sx = (i) => X + 8 + (w - 16) * i / (UN.length - 1), sy = (v) => Y + h - 10 - (h - 22) * v / 16;
      x.strokeStyle = `rgb(${AMB})`; x.lineWidth = 1.2; x.beginPath(); let up = false; UN.forEach((v, i) => { if (v == null) { up = false; return; } up ? x.lineTo(sx(i), sy(v)) : x.moveTo(sx(i), sy(v)); up = true; }); x.stroke();
      T('14,8 %', sx(15) + 6, sy(14.8) + 2, 8, '#fff', 'left', 600, MONO); T('UNRATE · FRED', X + 8, Y + 9, 7, '#8b949e', 'left', 500, MONO); }
    else if (id === 'tri') { x.fillStyle = 'rgba(255,255,255,.03)'; x.fillRect(X, Y, w, h); const cx = X + w / 2, cy = Y + h / 2 + 2; x.strokeStyle = 'rgba(160,210,255,.85)'; x.lineWidth = .8;
      for (let r = 0; r < 3; r++) { x.beginPath(); x.ellipse(cx, cy, 34 - r * 4, (11 - r) * (.7 + .3 * Math.cos(tm * 1.2)), Math.sin(tm * .9) * .3, 0, TAU); x.stroke(); }
      for (let i = 0; i < 4; i++) { const an = tm * 1.3 + i * Math.PI / 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(an) * 32, cy + Math.sin(an) * 10); x.stroke(); } T('ring.glb', X + 6, Y + 9, 7, '#8b949e', 'left', 500, MONO); }
    else if (id === 'suno') { x.fillStyle = 'rgba(255,255,255,.03)'; x.fillRect(X, Y, w, h); const ph = (tm * .35) % 1;
      for (let i = 0; i < 60; i++) { const v = Math.max(.6, RMS[i * 3] / 99 * 22), X1 = X + 6 + (w - 12) * i / 59; x.fillStyle = i / 60 < ph ? `rgb(${AMB})` : 'rgba(200,214,235,.55)'; x.fillRect(X1 - .6, Y + h / 2 + 4 - v, 1.2, v * 2); }
      T('ambient.m4a', X + 6, Y + 9, 7, '#8b949e', 'left', 500, MONO); }
    else if (id === 'slop') { [['✓', '#3fb950'], ['В', '#58a6ff'], ['?', '#d29922'], ['✓', '#3fb950']].forEach(([m, c], i) => { let mc = c, ms = m; if (i === LIE) { if (red > 0) { mc = '#f85149'; ms = '!'; } if (ok > 0) { mc = '#3fb950'; ms = '✓'; } }
        x.fillStyle = mc; x.beginPath(); x.arc(X + 12, LY(i), 5, 0, TAU); x.fill(); T(ms, X + 12, LY(i) + .5, 6.5, '#0d1117', 'center', 800); }); }
    x.restore();
  }
  // t — секунда ролика; рух (жетони, обертання) завмирає на час конфлікту: CFB…OKB
  function board(t) {
    const tf = t < CFB ? t : t < OKB ? CFB : t - (OKB - CFB), red = ez((t - CFB) / .2) * (1 - ez((t - OKB) / .3)), ok = ez((t - OKB) / .25), chk = t >= CKB ? t - CKB : -1;
    // камера: повільний наїзд; на конфлікті — удар до рядка з неправдою, далі назад
    const zr = ez((t - CFB) / .3) * (1 - .7 * ez((t - CKB) / .6)) * (1 - ez((t - OKB) / .7)), z = (1 + .05 * ez((t - BOARD0) / 4)) * (1 + .3 * zr), FY = PGM[1] + LY(LIE);
    bgDesk(1); x.save(); x.scale(z, z); x.translate(0, -FY * zr);
    x.save(); x.globalAlpha *= .5 * (1 - .5 * red); x.strokeStyle = 'rgba(150,175,215,.06)'; x.lineWidth = .6; for (let X = -720; X <= 720; X += 40) { x.beginPath(); x.moveTo(X, -400); x.lineTo(X, 400); x.stroke(); } for (let Y = -400; Y <= 400; Y += 40) { x.beginPath(); x.moveTo(-720, Y); x.lineTo(720, Y); x.stroke(); } x.restore();
    // дроти агент → Claude
    BAG.forEach(([id, X, Y], j) => { const s = Math.sign(X), x1 = X - s * 88, y1 = Y, x2 = CLN[0] + s * 50, y2 = CLN[1] + 20, k = (tf - TA(j)) / .4, hot = k > 0 && k < 1.9;
      x.strokeStyle = id === 'slop' && red > 0 ? `rgba(248,81,73,${.3 + .5 * red})` : hot ? `rgba(${AMB},.75)` : 'rgba(170,190,220,.28)'; x.lineWidth = hot ? 1.4 : 1; x.beginPath(); x.moveTo(x1, y1); x.quadraticCurveTo(X * .55, CLN[1] + 10, x2, y2); x.stroke(); });
    // макет сторінки
    const [PX, PY, PWm, PHm] = PGM; x.save(); x.translate(PX, PY);
    x.fillStyle = 'rgba(0,0,0,.4)'; rr(8, 12, PWm, PHm, 10); x.fill(); x.fillStyle = '#0b0f16'; rr(0, 0, PWm, PHm, 10); x.fill(); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1; x.stroke();
    x.fillStyle = '#151a23'; rr(0, 0, PWm, 18, 10); x.fill(); [0, 1, 2].forEach((i) => { x.fillStyle = 'rgba(255,255,255,.2)'; x.beginPath(); x.arc(10 + i * 9, 9, 2.6, 0, TAU); x.fill(); });
    T('artemzh.github.io/Blog/34-interstellar.html', PWm / 2, 9.5, 7, 'rgba(220,228,240,.6)', 'center', 500, MONO);
    T('Фізика «Інтерстеллара»', 10, 126, 12, 'rgba(240,244,250,.9)', 'left', 700);
    ['gpt', 'gem', 'src', 'tri', 'suno'].forEach((id) => { const j = BAG.findIndex((b) => b[0] === id), a = ez((tf - TA(j) - .75) / .3); const [X, Y, w, h, lb] = SLOT[id];
      if (a < 1) { x.save(); x.globalAlpha *= 1 - a; x.setLineDash([4, 4]); x.strokeStyle = 'rgba(200,214,235,.35)'; x.strokeRect(X + .5, Y + .5, w - 1, h - 1); x.setLineDash([]); T(lb, X + w / 2, Y + h / 2, 8.5, 'rgba(200,214,235,.45)', 'center', 600, MONO); x.restore(); }
      x.save(); const sc = 1 + .08 * (1 - eo((tf - TA(j) - .75) / .3)); x.translate(X + w / 2, Y + h / 2); x.scale(sc, sc); x.translate(-X - w / 2, -Y - h / 2); piece(id, a, tf, red, ok); x.restore(); });
    piece('slop', ez((tf - TA(5) - .75) / .3), tf, red, ok);
    x.restore();
    // Claude угорі
    x.save(); const cg = .5 + .5 * Math.cos((tf % .5) / .5 * TAU); glow(CLN[0], CLN[1], 80, `rgba(${AMB},.22)`, (.6 + .4 * cg) * (1 - .7 * red));
    x.fillStyle = '#2a1c14'; rr(CLN[0] - 70, CLN[1] - 22, 140, 44, 12); x.fill(); x.strokeStyle = red > .5 ? 'rgba(248,81,73,.9)' : `rgba(${AMB},.95)`; x.lineWidth = 1.4; x.stroke();
    T('Tech Lead', CLN[0] - 54, CLN[1] - 3, 15, '#fff', 'left', 700); T(red > .5 && ok < .5 ? 'стоп' : 'збирає', CLN[0] + 56, CLN[1] - 2, 8.5, red > .5 && ok < .5 ? '#ff7b72' : `rgba(${AMB},.95)`, 'right', 600, MONO);
    T('Claude · план · дані · код', CLN[0] - 54, CLN[1] + 12, 7.5, 'rgba(255,230,210,.75)', 'left', 500, MONO); x.restore();
    // картки агентів
    BAG.forEach(([id, X, Y], j) => { const s = id === 'slop' && red > 0, k = (tf - TA(j)) / .4, hot = k > 0 && k < 1.9; x.fillStyle = 'rgba(0,0,0,.4)'; rr(X - 88 + 6, Y - 27 + 8, 176, 54, 10); x.fill();
      x.fillStyle = s ? `rgba(${Math.round(18 + 40 * red)},18,24,1)` : '#121822'; rr(X - 88, Y - 27, 176, 54, 10); x.fill(); x.strokeStyle = s ? `rgba(248,81,73,${.5 + .45 * red})` : hot ? `rgba(${AMB},.9)` : 'rgba(255,255,255,.18)'; x.lineWidth = 1.3; x.stroke();
      T(ROLE[id], X - 74, Y - 7, 13.5, '#eef2f8', 'left', 700); T(s ? '! немає джерела' : hot ? TM.find((n) => n[0] === id)[7] : nameOf(id), X - 74, Y + 12, 8.5, s ? '#ff7b72' : hot ? `rgb(${AMB})` : '#8b949e', 'left', 500, MONO); });
    // жетони: агент → Claude → слот
    BAG.forEach(([id, X, Y], j) => { const k = (tf - TA(j)) / .4; if (k <= 0 || k >= 1.9) return; const s = Math.sign(X); let P1;
      if (k < 1) { const f = ez(k), x1 = X - s * 88, x2 = CLN[0] + s * 50, cxq = X * .55, cyq = CLN[1] + 10, y2 = CLN[1] + 20, o = 1 - f; P1 = [o * o * x1 + 2 * o * f * cxq + f * f * x2, o * o * Y + 2 * o * f * cyq + f * f * y2]; }
      else { const f = ez((k - 1) / .875), sl = SLOT[id], tx = PGM[0] + sl[0] + sl[2] / 2, ty = PGM[1] + sl[1] + sl[3] / 2; P1 = [lerp(CLN[0], tx, f), lerp(CLN[1] + 22, ty, f)]; }
      glow(P1[0], P1[1], 15, `rgba(${AMB},.6)`); chip(TOK[id], P1[0], P1[1] + 13, '#fff', 8, 'rgba(120,45,20,.95)'); });
    // конфлікт: плашка біля рядка
    if (red > 0 && ok < 1) { const Yl = PGM[1] + LY(LIE); chip('немає джерела', PGM[0] + PGM[2] - 52, Yl - 15, '#ff7b72', 8, 'rgba(40,10,12,.95)', red * (1 - ok)); }
    // субагенти перевіряють
    if (chk >= 0) { const Yl = PGM[1] + LY(LIE), R = [['джерело', 'nobelprize.org · 2017'], ['дата', '3 жовтня 2017'], ['за що', 'LIGO · гравітаційні хвилі']];
      R.forEach(([nm, res], i) => { const a = ez((chk - i * .15) / .3) * (1 - ez((t - OKB - .9) / .5)); if (a <= 0) return; const X = -240 + i * 240, Y = 200, p = cl((chk - .6 - i * .25) / 3), done = p >= 1;
        x.save(); x.globalAlpha *= a; x.strokeStyle = done ? 'rgba(63,185,80,.6)' : 'rgba(170,190,220,.45)'; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(X, Y - 17); x.lineTo(lerp(X, -40 + i * 40, .9), Yl + 8); x.stroke(); x.setLineDash([]);
        x.fillStyle = '#141b26'; rr(X - 92, Y - 17, 184, 34, 8); x.fill(); x.strokeStyle = done ? 'rgba(63,185,80,.85)' : 'rgba(255,255,255,.2)'; x.lineWidth = 1; x.stroke();
        T(`субагент ${i + 1} · ${nm}`, X - 82, Y - 6, 9.5, '#e6edf3', 'left', 700); T(done ? '✓ ' + res : TRS(res).slice(0, Math.floor(p * TRS(res).length)), X - 82, Y + 8, 8, done ? '#3fb950' : '#8b949e', 'left', 500, MONO);
        x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(X + 40, Y - 9, 44, 3); x.fillStyle = done ? '#3fb950' : `rgb(${AMB})`; x.fillRect(X + 40, Y - 9, 44 * p, 3); x.restore(); });
      // v7: фраза йде до першоджерела й повертається з відповіддю (темп сповільнено — «тиша» перед рішенням)
      const go = ez((chk - .2) / 1.2), bk = ez((chk - 3.3) / 1), fa = 1 - ez((t - OKB - .9) / .5);
      if (go > 0 && bk < 1 && fa > 0) { const A0 = [PGM[0] + PGM[2] / 2, Yl + 12], C0 = [-240, 168], f = bk > 0 ? 1 - bk : go, P1 = [lerp(A0[0], C0[0], f), lerp(A0[1], C0[1], f)];
        glow(P1[0], P1[1], 12, `rgba(${AMB},.5)`); chip(bk > 0 ? '✓ Нобель 2017 — за LIGO' : 'Нобель — за фільм?', P1[0], P1[1], bk > 0 ? '#3fb950' : `rgb(${AMB})`, 8.5, 'rgba(8,10,16,.95)', fa); } }
    // перевірено: печатка
    if (ok > 0) { const sc = 1 + .25 * (1 - eo((t - OKB) / .25)); x.save(); x.globalAlpha *= ok * (1 - ez((t - PEB + .2) / .2)); x.translate(PGM[0] + PGM[2] - 70, PGM[1] + 112); x.rotate(-.08); x.scale(sc, sc);
      x.strokeStyle = '#3fb950'; x.lineWidth = 1.8; rr(-62, -13, 124, 26, 5); x.stroke(); x.letterSpacing = '2px'; T('ПЕРЕВІРЕНО', 1, .5, 10, '#3fb950', 'center', 800, MONO); x.letterSpacing = '0px'; x.restore(); }
    // власник чекає слова
    const oa = ez((t - OKB - .8) / .4); if (oa > 0) { x.save(); x.globalAlpha *= oa; const X = 200, Y = -190; x.fillStyle = '#121822'; rr(X - 88, Y - 22, 176, 44, 10); x.fill(); x.strokeStyle = `rgba(${AMB},.9)`; x.lineWidth = 1.3; x.stroke();
      T('Product Owner', X - 74, Y - 4, 13, '#eef2f8', 'left', 700); T('Власник чекає: «пуш»?', X - 74, Y + 11, 8.5, `rgb(${AMB})`, 'left', 500, MONO); x.restore(); }
    x.restore();
    // червоний сигнал: м'яка червона віньєтка по краях (наростає за 6 кадрів)
    if (red > 0) { const g = x.createRadialGradient(0, 0, hh * .7, 0, 0, hw * 1.15); g.addColorStop(0, 'rgba(200,30,30,0)'); g.addColorStop(1, `rgba(200,30,30,${.28 * red})`); fill(g); }
  }
  function sBuild(u, len, t) { board(t); cap('КОМАНДА', 'Сторінка збирається', u, len); }
  function sConf(u, len, t) { board(t); cap('КОНФЛІКТ', 'ai slop helper: неправда', u, len); }
  function sCheck(u, len, t) { board(t); cap('КОНФЛІКТ', 'Перевірка: фраза → першоджерело', u, len); }
  // v8.1: міст «конфлікт → пуш»: зібрана сторінка на весь кадр, «перевірено · готово до публікації»; засвічується камінь Product Owner — рішення за ним
  function sReady(u, len) { const z = 1 + .35 * ez(u / len); x.save(); x.scale(z, z); board(B(49.9)); x.restore(); fill(`rgba(5,6,10,${.55 * ez(u / .5)})`);
    const a = ez((u - .25) / .3); x.save(); ga(a); x.letterSpacing = '3px'; T('✓ ПЕРЕВІРЕНО · ГОТОВО ДО ПУБЛІКАЦІЇ', 0, -40, 13, 'rgb(82,210,115)', 'center', 700, MONO); x.letterSpacing = '0px';
    gem(0, 40, 30, STC.own, ez((u - .6) / .3), ez((u - .5) / .3), 'own'); T('Рішення — за Product Owner', 0, 100, 15, '#f2f5fa', 'center', 650); x.restore(); }
  function sOk(u, len, t) { board(t); cap('КОНФЛІКТ', 'Перевірено — рух знову', u, len); }

  // ══ АКТ VI · ПУШ (v7): 18 с — інтертитр 2 · термінал 4 · глобус 8 · телефон 4 ══
  // 1. Темрява. «Пуш.» власника → git push origin main набирається читабельно → рядки виводу → вузол, з якого розгорнеться глобус
  function sTerm(u, len) {
    fill('#030406'); const X = -330, Y0 = -70, n = Math.min(20, Math.max(0, Math.floor((u - 1.1) / .08) + 1)) * (u >= 1.1), cmd = 'git push origin main'.slice(0, n), a = ez(u / .3) * (1 - ez((u - len + .25) / .25));
    x.save(); ga(a); T('~/PM Protfolio  (main)', X, Y0 - 30, 11, 'rgba(139,148,158,.7)', 'left', 500, MONO); T('$', X, Y0, 17, `rgb(${AMB})`, 'left', 700, MONO); T(cmd, X + 22, Y0, 17, '#eef2f8', 'left', 600, MONO);
    x.font = `600 17px ${MONO}`; const cw = x.measureText(cmd).width; if ((u < 2.8 && (n < 20 || (u * 2.4) % 1 < .6)) || (u >= 2.8 && u < 3.4 && (u * 2.4) % 1 < .6)) { x.fillStyle = 'rgba(235,240,248,.9)'; x.fillRect(X + 24 + cw, Y0 - 11, 9, 22); }
    [['Enumerating objects: 9, done.', 2.85], ['Writing objects: 100% (5/5), done.', 3.05], ['To https://github.com/ArtemZh/Blog.git', 3.25], ['   fce0232..HEAD  main -> main', 3.45]].forEach(([s, at], i) => {
      const b = ez((u - at) / .12); if (b > 0) T(s, X, Y0 + 30 + i * 22, 12.5, i === 3 ? `rgba(${AMB},${.95 * b})` : `rgba(201,209,217,${.75 * b})`, 'left', 500, MONO); });
    x.restore();
    // вузол (Гдиня), з якого почнеться розгортання глобуса
    const g = ez((u - 3.55) / .35), go = gpro(uv3(ORIG), 0); if (g > 0) { x.fillStyle = `rgba(255,235,215,${g})`; x.beginPath(); x.arc(go[0] * 38, go[1] * 38, 2.2, 0, TAU); x.fill(); glow(go[0] * 38, go[1] * 38, 14, `rgba(${AMB},.5)`, g); }
    cap('ПУШ', 'git push origin main', u, len);
  }
  // ── крапковий глобус: маска суходолу Natural Earth 110m (160 × 80, ship-pipeline/trailer-v6-globe/landmask.py) ──
  const LAND = '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007ff35fc000000000000000000000000000000007bf1fffff0005f000000070000000000000000204787ffffe00034000000002000000000000000f95f003fffe000000007000ffe0074000000000789efc01fffc00000000800ffff98000000020001fc6ff007ffc00001800837ffffffffdfefc0000077c4e3f800ffffe007ee20000000000002d000000001e0f00ffbffc01300000000000000000ffffffffb1e07c03800fbffffffffffffffffe03fffffffe0f003800003f3fffffffffffffff7c00f03ffffc03900000003f07fffffffffffff980003007fffe03f80000060e1ffffffffffffc0380010003ffffe7fc000002007ffffffffffff00700000001fffff7fe00000b3fffffffffffffff0400000000fffffffe0000027ffffffffffffffd00000000003fffffa3000003fffffffffffffffc00000000007fffffe0000001fffd7cfffffffff800000000007fffff80000001f5f879fffffffff180000000007fffff8000000f86733dffffffffc200000000007ffffc0000000f014ffcfffffff88200000000003ffffc0000000e0a0ffcfffffffc8600000000003ffffc00000007f802fffffffff89c00000000000ffff00000000ffc40fffffffffc2000000000000bffb00000000fff7ffffffffffc00000000000007f8100000001ffffffdfffffffc00000000000003f8000000007ffffefc7ffffff80000000000000078000000007fffff7fc3fffff4000000000000007884000000ffffff7fc1fe7f000000000000000078808000007fffffbfc0fc3e80000000000000000f800000007fffff9f00783f040000000000000001e0000000ffffffdc00701f040000000000000000600000007fffffe000700781000000000000000023f800003ffffffe00200100000000000000000007fc00003ffffffc00100803000000000000000003ff00000f3ffffc00000418000000000000000003ff8000000ffff800001430000000000000000007ffc000000ffff000000cf900000000000000000ffff000000fffe00000047630000000000000000ffffe000007ffc000000610df100000000000000fffff000007ff800000020207a000000000000007ffff800003ff8000000060074000000000000007ffff000003ffc000000004002000000000000003fffe000003ffc000000000390000000000000003fffe000007ffc400000000b10000000000000000fffe000007ff8c00000001fd80010000000000007ffc000003ff0c00000003ff80000000000000007ffc000003ff180000001fffc0400000000000007ff0000003ff180000001fffe0000000000000007fc0000001fc000000003ffff000000000000000ffc0000001fc000000001ffff000000000000000ffc0000000fc000000001ffff000000000000000ff80000000f8000000001f0ff000000000000000fd0000000000000000000807e000000000000001fe0000000000000000000003e000000000000001f000000000000000000000000006000000000001e00000000000000000000000c008000000000000e000000000000000000000000018000000000001c000000000000000000000000030000000000003c0000000000000000000000000000000000000018000000000000000000000000000000000000001c0000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000010000000000001800006601800000000000000002000000000001ffe1fffffffe000000000000000f80000003ffffffeffffffffffe00000000030807800007ffffffffffffffffffff00001ffffffffe00000ffffffffffffffffffff80003ffffffffe00003fffffffffffffffffffff800001fffffffc00781ffffffffffffffffffffe00000ffffffffff87fffffffffffffffffffffff00d803fffffffffffffffffffffffffffffffffffe00000000000000000000000000000000000000000000000000000000000000000000000000000000';
  const DOTS = []; for (let j = 0; j < 80; j++) for (let i = 0; i < 160; i++) { const v = parseInt(LAND[j * 40 + (i >> 2)], 16) >> (3 - (i & 3)) & 1, lat = 90 - (j + .5) * 2.25, lon = -180 + (i + .5) * 2.25;
    if (v && hash(j * 160 + i + .5) < Math.cos(lat * DEG) * 1.05) DOTS.push([lat * DEG, lon * DEG]); }
  // пуш іде з Гдині; дуги — до Києва, Вінниці, Львова, Бухареста й Тбілісі (рішення власника 24.10). Підписів міст немає — лише точки й дуги
  const ORIG = [54.52 * DEG, 18.53 * DEG], CITIES = [[50.45, 30.52], [49.23, 28.47], [49.84, 24.03], [44.43, 26.10], [41.72, 44.79]].map(([la, lo], i) => [la * DEG, lo * DEG, 2.6 + i * .6]);
  // v8: після заданих міст — хвиля по всьому світу (точки без назв: Європа, обидві Америки, Азія, Африка, Австралія)
  const WORLD = [[51.5, -.1], [48.9, 2.4], [40.4, -3.7], [41.9, 12.5], [59.3, 18.1], [52.5, 13.4], [40.7, -74], [43.7, -79.4], [37.8, -122.4], [19.4, -99.1], [-23.5, -46.6], [-34.6, -58.4],
    [30, 31.2], [6.5, 3.4], [-1.3, 36.8], [-26.2, 28], [25.2, 55.3], [28.6, 77.2], [1.35, 103.8], [35.7, 139.7], [37.6, 127], [31.2, 121.5], [-33.9, 151.2], [55.8, 37.6], [39.9, 32.9], [64.1, -21.9]]
    .map(([la, lo], i) => [la * DEG, lo * DEG, 5.3 + (i % 9) * .12 + Math.floor(i / 9) * .35, 1]);
  const ARCS = CITIES.concat(WORLD);
  const uv3 = ([la, lo]) => [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
  // орієнтація: до глядача — Європа (50° пн. ш., 25° сх. д.), повільний дрейф; gpro → [x, y (екран, R = 1), z (до глядача)]
  function gpro(v, tg, lift = 0) { const lon0 = (-25 + tg * .5 + 38 * ez((tg - 5.1) / 2.2)) * DEG, tau = 50 * DEG, X1 = v[0] * Math.cos(lon0) + v[2] * Math.sin(lon0), Z1 = -v[0] * Math.sin(lon0) + v[2] * Math.cos(lon0),
    Y2 = v[1] * Math.cos(tau) - Z1 * Math.sin(tau), Z2 = v[1] * Math.sin(tau) + Z1 * Math.cos(tau), k = 1 + lift; return [X1 * k, -Y2 * k, Z2]; }
  // точка дуги Гдиня → місто c (s = 0..1), піднята над поверхнею
  function arcPt(o, c, s, om, tg) { const so = Math.sin(om), A = Math.sin((1 - s) * om) / so, Bq = Math.sin(s * om) / so; return gpro([o[0] * A + c[0] * Bq, o[1] * A + c[1] * Bq, o[2] * A + c[2] * Bq], tg, .22 * om * Math.sin(Math.PI * s)); }
  // глобус у точці (cx, cy) радіуса R; tg — секунди від початку сцени глобуса (розгортання, дуги), a — видимість
  function globe(tg, cx, cy, R, a = 1) {
    if (a <= 0 || R <= 0) return; const unf = ez((tg - .1) / 2.3) * Math.PI * 1.08, o = uv3(ORIG), P = (v, lift = 0) => { const p = gpro(v, tg, lift); return [cx + p[0] * R, cy + p[1] * R, p[2]]; };
    x.save(); x.globalAlpha *= a;
    if (R < 4) { glow(cx, cy, 10 + R * 3, 'rgba(150,200,255,.7)'); x.fillStyle = '#eaf4ff'; x.fillRect(cx - .8, cy - .8, 1.6, 1.6); x.restore(); return; }
    glow(cx, cy, R * 1.25, 'rgba(70,130,220,.16)', ez(unf / 2)); x.strokeStyle = `rgba(${HC},${.25 * ez(unf / 2)})`; x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, R, 0, TAU); x.stroke();
    const ds = Math.max(.8, Math.min(2.6, R / 220));
    for (let i = 0; i < DOTS.length; i++) { const v = uv3(DOTS[i]), p = P(v); if (p[2] < -.05 || p[0] < -hw - 9 || p[0] > hw + 9 || p[1] < -hh - 9 || p[1] > hh + 9) continue; const ang = Math.acos(Math.max(-1, Math.min(1, dot3(v, o)))), al = ez((unf - ang) / .35); if (al <= 0) continue;
      x.fillStyle = `rgba(160,208,255,${al * (.35 + .65 * Math.max(0, p[2]))})`; x.fillRect(p[0] - ds / 2, p[1] - ds / 2, ds, ds); }
    // дуги по черзі; місто засвічується, коли дуга доходить
    const op = P(o); ARCS.forEach(([la, lo, t0, far]) => { const c = uv3([la, lo]), pr0 = cl((tg - t0) / (far ? .7 : .55)); if (pr0 <= 0) return; const om = Math.acos(Math.max(-1, Math.min(1, dot3(o, c))));
      // точки дуги за глобусом не малюємо (розрив лінії)
      x.beginPath(); const N = far ? 64 : 40; let pen = false; for (let k = 0; k <= N * pr0; k++) { const q = arcPt(o, c, k / N, om, tg); if (q[2] < -.02) { pen = false; continue; } pen ? x.lineTo(cx + q[0] * R, cy + q[1] * R) : x.moveTo(cx + q[0] * R, cy + q[1] * R); pen = true; }
      x.strokeStyle = `rgba(${AMB},${far ? .5 : .8})`; x.lineWidth = Math.min(2.4, 1.2 * Math.max(1, R / 400)); x.stroke();
      const pc = P(c); if (pr0 >= 1 && pc[2] > -.02) { const lt = tg - t0 - .55, rg = ez(lt / .4); glow(pc[0], pc[1], (6 + 10 * rg) * Math.max(1, R / 500), `rgba(${AMB},.7)`, 1); x.strokeStyle = `rgba(${AMB},${.6 * (1 - ez(lt / .8))})`; x.beginPath(); x.arc(pc[0], pc[1], 4 + 16 * eo(lt / .8), 0, TAU); x.stroke();
        x.fillStyle = '#fff3e6'; x.fillRect(pc[0] - 1.3, pc[1] - 1.3, 2.6, 2.6); } });
    if (op[2] > -.1) { glow(op[0], op[1], 14 * Math.max(1, R / 500), `rgba(${AMB},.7)`); x.fillStyle = '#fff'; x.beginPath(); x.arc(op[0], op[1], 2.4, 0, TAU); x.fill(); }
    x.restore();
  }
  // кадр глобуса в момент u: загальний план на Європу (R 400) → крупно одна дуга (Гдиня → Київ): масштаб ×4,2, середина дуги — у центр кадру; sc — масштаб усього кадру
  const GZ = (u) => ez((u - 7.1) / 1.3);
  function globeShot(u, cx, cy, sc, a = 1) {
    const k = GZ(u), R = 400 * Math.exp(lerp(0, LN(4.2), k)) * lerp(.5, 1, eo(u / .7)) * sc, o = uv3(ORIG), c = uv3(CITIES[0]), m = arcPt(o, c, .5, Math.acos(dot3(o, c)), u);
    globe(u, cx - m[0] * R * k, cy - m[1] * R * k, R, a);
  }
  // 2. Глобус (8 с): розгортається від Гдині; дуги до п'яти міст по черзі; крупно одна дуга
  function sGlobe(u, len) { fill('#030406'); globeShot(u, 0, 0, 1);
    cap('ПУШ', 'Реліз: до читачів по всьому світу', u, len); }
  // 3. Відліт: глобус стає пікселем опублікованої сторінки на екрані телефона в руці (силует руки, без обличчя)
  const PH_C = [40, 8], PH_R = -.08, PH_W = 176, PH_H = 381, PH_PX = [(372 - 231) * PH_W / 462, (225 - 500) * PH_W / 462], PH_S0 = 380;
  const PH_PW = [PH_C[0] + PH_PX[0] * Math.cos(PH_R) - PH_PX[1] * Math.sin(PH_R), PH_C[1] + PH_PX[0] * Math.sin(PH_R) + PH_PX[1] * Math.cos(PH_R)];
  function phone(u, s) {
    const k = 1 - LN(s) / LN(PH_S0), cxp = PH_PW[0] * k, cyp = PH_PW[1] * k;
    fill('#05060a'); x.save(); x.translate(cxp, cyp); x.scale(s, s); x.translate(-PH_PW[0], -PH_PW[1]);
    x.save(); x.translate(PH_C[0], PH_C[1]); x.rotate(PH_R);
    // рука: долоня знизу, пальці обхоплюють правий край, великий палець — лівий; темний силует із легким відсвітом екрана
    const sk = '#12161d', rim = 'rgba(130,175,240,.45)'; x.fillStyle = sk; x.strokeStyle = rim; x.lineWidth = 1.2 / Math.max(1, s * .02);
    x.beginPath(); x.ellipse(-20, PH_H / 2 + 40, 120, 95, -.25, 0, TAU); x.fill(); x.stroke(); x.fillRect(-120, PH_H / 2 + 60, 190, 400);
    [[PH_W / 2 + 2, -40], [PH_W / 2 + 4, 10], [PH_W / 2 + 4, 58], [PH_W / 2 + 2, 104]].forEach(([X, Y], i) => { rr(X - 26, Y - 17, 52 - i * 3, 34, 16); x.fill(); x.stroke(); });
    x.save(); x.translate(-PH_W / 2 - 6, 120); x.rotate(-.5); rr(-20, -60, 38, 120, 18); x.fill(); x.stroke(); x.restore();
    // телефон
    x.fillStyle = '#0a0b0e'; rr(-PH_W / 2 - 9, -PH_H / 2 - 12, PH_W + 18, PH_H + 24, 26); x.fill(); x.strokeStyle = 'rgba(160,170,190,.35)'; x.lineWidth = 1.2 / Math.max(1, s * .02); x.stroke();
    x.save(); rr(-PH_W / 2, -PH_H / 2, PH_W, PH_H, 18); x.clip(); if (IMG.ph) x.drawImage(IMG.ph, -PH_W / 2, -PH_H / 2, PH_W, PH_H); else { x.fillStyle = '#10141c'; x.fillRect(-PH_W / 2, -PH_H / 2, PH_W, PH_H); }
      // сповіщення «опубліковано»
      const ta = ez((u - 1.8) / .3); if (ta > 0) { x.save(); x.globalAlpha *= ta; x.translate(0, (1 - eo((u - 1.8) / .35)) * -30); x.fillStyle = 'rgba(30,34,42,.94)'; rr(-PH_W / 2 + 8, -PH_H / 2 + 10, PH_W - 16, 40, 10); x.fill();
        x.fillStyle = 'rgba(46,160,90,1)'; x.beginPath(); x.arc(-PH_W / 2 + 26, -PH_H / 2 + 30, 8, 0, TAU); x.fill(); T('✓', -PH_W / 2 + 26, -PH_H / 2 + 30.5, 9, '#fff', 'center', 800);
        T('Опубліковано', -PH_W / 2 + 40, -PH_H / 2 + 24, 9.5, '#fff', 'left', 700); T('GitHub Pages · 34-interstellar', -PH_W / 2 + 40, -PH_H / 2 + 37, 7.5, 'rgba(220,228,240,.75)', 'left', 500, MONO); x.restore(); }
    x.restore(); x.fillStyle = '#000'; rr(-22, -PH_H / 2 - 5, 44, 9, 4.5); x.fill();
    x.restore(); x.restore();
    // глобус — у пікселі екрана
    globeShot(8, cxp, cyp, s / PH_S0, 1 - ez((u - 1.7) / .4) * .7);
  }
  function sPhone(u, len) { const s = Math.exp(lerp(LN(PH_S0), 0, ez(u / 2.1))); phone(u, s);
    x.save(); ga(ez((u - 1.85) / .3)); x.letterSpacing = '2px'; T('RELEASE MANAGER', -340, 60, 9, `rgba(${AMB},.95)`, 'left', 600, MONO); x.letterSpacing = '0px'; T('Джарвіс: «Published.»', -340, 80, 13, 'rgba(240,244,250,.9)', 'left', 600); x.restore();
    cap('ПУШ', 'Опубліковано: піксель на чиємусь екрані', u, len); }
  // титр: чиста типографіка — назва, лінія з «лінзовим відблиском», назва скіла і один рядок ролей; музика тут обривається
  function sTitle(u, len) {
    const fade = 1 - ez((u - len + .8) / .7), a1 = ez((u - .5) / .7), a2 = ez((u - 1.1) / .6), a3 = ez((u - 1.7) / .6), z = 1 + .03 * ez(u / len);
    if (u < 1.4) { phone(3, 1); fill(`rgba(5,6,10,${ez(u / 1.2)})`); }
    x.save(); x.scale(z, z);
    const g = x.createRadialGradient(0, 0, 40, 0, 0, 420); g.addColorStop(0, 'rgba(5,6,10,.9)'); g.addColorStop(1, 'rgba(5,6,10,.4)'); ga(ez(u / 1.2)); fill(g);
    ga(fade * a1); x.letterSpacing = '6px'; T('СТАТТЯ 36 · СКІЛ', 3, -116, 10, `rgba(${AMB},.95)`, 'center', 600, MONO);
    x.letterSpacing = '2px'; T('Скіл, що перетворює', 1, -64 + (1 - a1) * 8, 48, '#f6f8fb', 'center', 700); T('текст на досвід', 1, -8 + (1 - a1) * 8, 48, '#f6f8fb', 'center', 700); x.letterSpacing = '0px';
    ga(fade * a2); const w = 320 * eo(a2); x.fillStyle = `rgba(${AMB},.9)`; x.fillRect(-w / 2, 32, w, 1.2);
    // відблиск: повільно пливе вздовж лінії, з'являється за 4 кадри
    const fl = ez((u - 1.2) / .13) * fade, fxp = lerp(-180, 180, ez((u - 1.1) / 3.5));
    if (fl > 0) { x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = .7 * fl; const s1 = x.createLinearGradient(fxp - 260, 0, fxp + 260, 0); s1.addColorStop(0, 'rgba(255,190,130,0)'); s1.addColorStop(.5, 'rgba(255,220,180,.8)'); s1.addColorStop(1, 'rgba(255,190,130,0)');
      x.fillStyle = s1; x.fillRect(fxp - 260, 31.6, 520, 2); glow(fxp, 32.5, 46, 'rgba(255,200,150,.35)'); x.restore(); }
    x.letterSpacing = '1px'; T('building-explorable-articles', .5, 58, 16, `rgb(${AMB})`, 'center', 500, MONO); x.letterSpacing = '0px';
    ga(fade * a3); T('Product Owner · Tech Lead · Visual Designer · Copy Editor · Data Analyst · 3D Artist · Sound Designer · QA · Dev Team · Release Manager', 0, 102, 9, 'rgba(235,240,248,.78)', 'center', 600, MONO);
    ga(1); x.restore();
  }
  // ══ ПОСТ-КРЕДИТ ══
  // 1. Порожня чернетка, курсор блимає. Джарвіс: «Next article?» → пауза → тихо: «…or, if you'd rather not write one —» — і перешкоди
  //    глушать його (тріск, біт-крашер, обрив; звук — jarvis-07c.m4a, у кадрі — тонкі смуги збою)
  function sPost(u, len) {
    fill('#030406'); const a = ez((u - .15) / .35) * (1 - ez((u - len + .5) / .45)), z = 1 + .14 * ez(u / len); x.save(); x.scale(z, z); x.translate(40 * ez(u / len), 0); ga(a);
    // v11: вікно редактора замість порожнечі — рамка, кнопки, номери рядків; повільний наїзд на курсор
    x.strokeStyle = 'rgba(139,148,158,.28)'; x.lineWidth = 1; rr(-170, -70, 400, 190, 8); x.stroke(); x.fillStyle = 'rgba(12,15,22,.9)'; rr(-170, -70, 400, 190, 8); x.fill(); x.stroke();
    ['255,95,86', '255,189,46', '39,201,63'].forEach((c, i) => { x.fillStyle = `rgba(${c},.55)`; x.beginPath(); x.arc(-154 + i * 13, -57, 3.4, 0, TAU); x.fill(); });
    T('article-37.md', 30, -57, 8.5, 'rgba(139,148,158,.6)', 'center', 500, MONO); for (let q = 2; q <= 6; q++) T(String(q), -140, 2 + (q - 1) * 20, 13, 'rgba(139,148,158,.22)', 'left', 500, MONO);
    x.letterSpacing = '4px'; T('СТАТТЯ 37 · ЧЕРНЕТКА', -140, -34, 9, `rgba(${AMB},.85)`, 'left', 600, MONO); x.letterSpacing = '0px';
    T('1', -140, 2, 13, 'rgba(139,148,158,.7)', 'left', 500, MONO);
    if ((u * 2) % 1 < .55) { x.fillStyle = 'rgba(235,240,248,.9)'; x.fillRect(-116, -9, 9, 22); }
    ga(1); x.restore(); jam(u - 5.45, 1);
  }
  // смуги збою сигналу: k — секунди від початку перешкод, s — сила
  function jam(k, s) { if (k <= 0 || s <= 0) return; const n = Math.floor(k * 24); x.save();
    for (let i = 0; i < 7; i++) { const h = hash(n * 13.1 + i * 7.7); if (h > .55 + .25 * (1 - cl(k * 2))) continue; const Y = (hash(n * 3.3 + i) - .5) * hh * 1.8, w = hw * (.4 + 1.2 * hash(n + i * 2.1));
      x.globalAlpha = .1 * s * (.4 + .6 * hash(i + n * .7)); x.fillStyle = i % 2 ? 'rgb(150,215,255)' : 'rgb(230,235,245)'; x.fillRect((hash(n * 5 + i) - .5) * hw * 1.4 - w / 2, Y, w, 1 + 2.5 * hash(i * 9 + n)); } x.restore(); }
  // ── сцени three.js (shared/sk-trailer-sw.js): завантажуються під час показу (або одразу в ?reel=render) ──
  const SW = { p: null, r: null, err: false };
  function swLoad() { if (!SW.p) { const v = ME ? new URL(ME).searchParams.get('v') || '6' : '6', url = ME ? new URL('sk-trailer-sw.js?v=' + v, ME).href : 'shared/sk-trailer-sw.js';
      SW.p = import(url).then((m) => m.create()).then((r) => { SW.r = r; if (!playing) paint(); }).catch(() => { SW.err = true; }); } return SW.p; }
  // кадр WebGL — у віртуальні координати поточного кадру; поки моделі вантажаться — темний кадр із крапками очікування
  function swFrame(fn) { fill('#000'); const r = SW.r; if (!r) { if (!SW.err) { swLoad(); [0, 1, 2].forEach((i) => { x.fillStyle = `rgba(110,220,255,${.25 + .25 * ((Math.floor(performance.now() / 300) + i) % 3 === 0)})`; x.fillRect(-14 + i * 12, -2, 4, 4); }); } return; }
    const w = Math.max(2, Math.round(hw * 2 * S * DPR)), h = Math.max(2, Math.round(hh * 2 * S * DPR)); fn(r, Math.min(1920, w), Math.min(1080, h)); x.drawImage(r.canvas, -hw, -hh, hw * 2, hh * 2); }
  // 2. «Order 66» (12 с, план С8; референс ship-pipeline/trailer-v7-refs/order66-hologram-projector.png). Темна кімната, голостіл,
  //    на ньому проєктор: вмикається під перешкоди → фігура в каптурі «проростає» точковими кільцями POV-LED знизу догори → повільний
  //    наїзд і нахил угору до каптура (на «Come to the dark side… Play the game…» фігура злегка нахиляється вперед) → «Execute Order
  //    Sixty-Six» — крупно каптур; на «Sixty-Six» фігура збоїть і розсипається кільцями → блакитне світло → голостіл із флотами.
  //    Фігура — маска яскравості 200 × 400 (ціле тіло; обличчя в тіні: видно лише підборіддя й рот, без очей), вибірка по концентричних
  //    кільцях точок; кільця щільніші на світлих місцях, ледь обертаються. Колір #4FD8FF → білий у найяскравіших точках.
  const HM = { w: 200, h: 400, d: null }, HOLO_C = '79,216,255', EMP = [1.7 + .3, 1.7 + 2.0, 1.7 + 3.2, 1.7 + 4.3], ORD = [7.0 + .15, 7.0 + 3.5], SIX = 7.0 + 2.15;
  function holoMask() {
    if (HM.d) return HM.d; const c = document.createElement('canvas'); c.width = HM.w; c.height = HM.h; const g = c.getContext('2d'), L = (v) => `rgb(${v},${v},${v})`;
    g.fillStyle = '#000'; g.fillRect(0, 0, HM.w, HM.h);
    // плащ: від згорблених плечей розширюється донизу й лягає колом на базу; складки — світлі й темні смуги
    g.beginPath(); g.moveTo(54, 122); g.quadraticCurveTo(100, 100, 146, 122); g.bezierCurveTo(156, 190, 172, 300, 192, 382); g.quadraticCurveTo(100, 400, 8, 382); g.bezierCurveTo(28, 300, 44, 190, 54, 122); g.closePath();
    g.fillStyle = L(140); g.fill(); g.save(); g.clip();
    for (let i = 0; i < 9; i++) { const X0 = 100 + (i - 4) * 9, X1 = 100 + (i - 4) * 23; g.strokeStyle = L(i % 2 ? 85 : 205); g.lineWidth = i % 2 ? 7 : 5; g.beginPath(); g.moveTo(X0, 200); g.quadraticCurveTo((X0 + X1) / 2 + (i - 4) * 2, 300, X1, 400); g.stroke(); }
    g.restore();
    // широкі рукави і складені кисті на рівні пояса
    [[-1], [1]].forEach(([s]) => { g.beginPath(); g.moveTo(100 + s * 30, 118); g.quadraticCurveTo(100 + s * 62, 150, 100 + s * 56, 215); g.lineTo(100 + s * 8, 222); g.quadraticCurveTo(100 + s * 24, 170, 100 + s * 30, 118); g.closePath(); g.fillStyle = L(170); g.fill();
      g.strokeStyle = L(210); g.lineWidth = 3; g.beginPath(); g.moveTo(100 + s * 56, 215); g.lineTo(100 + s * 8, 222); g.stroke(); });
    g.fillStyle = L(250); g.beginPath(); g.ellipse(100, 214, 15, 10, 0, 0, TAU); g.fill();
    // каптур: глибокий, край світлий; обличчя в тіні — лише підборіддя й рот
    g.beginPath(); g.moveTo(64, 126); g.bezierCurveTo(58, 72, 70, 24, 100, 20); g.bezierCurveTo(130, 24, 142, 72, 136, 126); g.quadraticCurveTo(100, 138, 64, 126); g.closePath(); g.fillStyle = L(150); g.fill();
    g.strokeStyle = L(235); g.lineWidth = 6; g.stroke();
    g.beginPath(); g.moveTo(76, 120); g.bezierCurveTo(72, 78, 82, 50, 100, 46); g.bezierCurveTo(118, 50, 128, 78, 124, 120); g.closePath(); g.fillStyle = L(10); g.fill();
    g.fillStyle = L(200); g.beginPath(); g.ellipse(100, 112, 13, 9, 0, 0, Math.PI); g.fill(); g.fillStyle = L(30); g.fillRect(92, 104, 16, 2.4);
    const im = g.getImageData(0, 0, HM.w, HM.h).data, d = new Float32Array(HM.w * HM.h); for (let i = 0; i < d.length; i++) d[i] = im[i * 4] / 255; return (HM.d = d);
  }
  // точки кілець (у координатах маски): центр «вентилятора» — (100, 210), крок кілець 2,9; на темних місцях — кожна друга точка
  const HR = []; for (let r = 2.9, k = 0; r < 236; r += 2.9, k++) { const n = Math.max(6, Math.round(TAU * r / 2.9)); HR.push([r, n, k]); }
  const speaking = (u) => (u > EMP[0] && u < EMP[1]) || (u > EMP[2] && u < EMP[3]) || (u > ORD[0] && u < ORD[1]);
  function figure(u, sc, grow, lean, glitch, burst, a) {
    const d = holoMask(); if (a <= 0) return; const cut = lerp(400, -10, grow), n10 = Math.floor(u * 10); x.save(); x.globalAlpha *= a;
    x.fillStyle = `rgb(${HOLO_C})`;
    HR.forEach(([r, n, k]) => { const rot = u * .12 * (k % 2 ? 1 : -1), ex = 1 + burst * (.6 + 1.6 * hash(k * 1.7)), fa = 1 - ez((burst - hash(k * 3.1) * .4) / .5); if (fa <= 0) return;
      for (let j = 0; j < n; j++) { const an = j / n * TAU + rot, mx = 100 + Math.cos(an) * r, my = 210 + Math.sin(an) * r; if (mx < 0 || mx >= HM.w || my < 0 || my >= HM.h || my < cut) continue;
        const b = d[(my | 0) * HM.w + (mx | 0)]; if (b < .05 || (b < .4 && j % 2)) continue;
        // збої сканування: горизонтальна смуга зсувається; на «Sixty-Six» — сильніше
        let ox = 0; const band = Math.floor(my / 14), gh = hash(band * 7.3 + n10 * 1.9); if (glitch > 0 && gh < .22 * glitch) ox = (hash(band + n10) - .5) * 26 * glitch;
        const lx2 = (100 + (mx - 100) * ex - 100 + ox), ly = (210 + (my - 210) * ex - 400);
        // нахил уперед: верх фігури опускається й наближається
        const up = cl((400 - my) / 400), X = lx2 * sc * (1 + lean * up * .6), Y = (ly + lean * up * up * 60) * sc;
        const edge = my - cut < 6 ? 1.6 : 1, al = Math.min(1, (.22 + .8 * b) * edge) * fa * (.93 + .07 * hash(n10 + k)); x.globalAlpha = a * al;
        const s = (.95 + 1.15 * b) * sc * .9; if (b > .85) { x.fillStyle = 'rgb(225,248,255)'; x.fillRect(X - s / 2, Y - s / 2, s, s); x.fillStyle = `rgb(${HOLO_C})`; } else x.fillRect(X - s / 2, Y - s / 2, s, s); } });
    x.restore();
  }
  // проєктор: кругла металева база з обідком і виступами, лінза; голограма підсвічує базу й стіл блакитним
  function projector(on, lit) {
    // стіл
    const tg = x.createLinearGradient(0, 30, 0, hh); tg.addColorStop(0, '#07090d'); tg.addColorStop(1, '#030405'); x.fillStyle = tg; x.fillRect(-hw - 2, 30, hw * 2 + 4, hh);
    x.strokeStyle = 'rgba(120,170,220,.05)'; x.lineWidth = .8; for (let i = -8; i <= 8; i++) { x.beginPath(); x.moveTo(i * 30, 30); x.lineTo(i * 120, hh); x.stroke(); } for (let j = 1; j < 7; j++) { const Y = 30 + Math.pow(j / 7, 1.6) * (hh - 30); x.beginPath(); x.moveTo(-hw, Y); x.lineTo(hw, Y); x.stroke(); }
    glow(0, 52, 230, `rgba(${HOLO_C},.16)`, lit);
    // база
    x.fillStyle = '#1a1e25'; x.beginPath(); x.ellipse(0, 58, 98, 25, 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(200,210,225,.25)'; x.lineWidth = 1.4; x.stroke();
    [-1, 1].forEach((s) => { x.fillStyle = '#20252e'; rr(s * 104 - 9, 44, 18, 16, 3); x.fill(); x.strokeStyle = 'rgba(200,210,225,.2)'; x.stroke(); });
    const sg = x.createLinearGradient(-72, 0, 72, 0); sg.addColorStop(0, '#2a2f38'); sg.addColorStop(.45, '#5a616d'); sg.addColorStop(1, '#22262e'); x.fillStyle = sg; x.fillRect(-72, 26, 144, 24);
    x.beginPath(); x.ellipse(0, 50, 72, 17, 0, 0, Math.PI); x.fill();
    x.fillStyle = '#3a404b'; x.beginPath(); x.ellipse(0, 26, 72, 17, 0, 0, TAU); x.fill(); x.strokeStyle = `rgba(${HOLO_C},${.15 + .5 * lit})`; x.lineWidth = 1.2; x.stroke();
    x.fillStyle = `rgba(${HOLO_C},${.12 * lit})`; x.beginPath(); x.ellipse(0, 26, 72, 17, 0, 0, TAU); x.fill();
    // лінза і конус світла до фігури
    x.fillStyle = `rgba(${HOLO_C},${.3 + .7 * on})`; x.beginPath(); x.ellipse(0, 26, 14, 4, 0, 0, TAU); x.fill(); glow(0, 26, 26, `rgba(${HOLO_C},.6)`, on);
    if (on > 0) { const cg = x.createLinearGradient(0, 26, 0, -40); cg.addColorStop(0, `rgba(${HOLO_C},${.2 * on})`); cg.addColorStop(1, `rgba(${HOLO_C},0)`); x.fillStyle = cg; x.beginPath(); x.moveTo(-12, 26); x.lineTo(12, 26); x.lineTo(80, -40); x.lineTo(-80, -40); x.closePath(); x.fill(); }
  }
  function sHolo(u, len) {
    fill('#020306');
    // вмикання під перешкоди: лінза мерехтить, на обриві Джарвіса (u ≈ 0,95) стабілізується
    const fl = u < 1.3 ? (hash(Math.floor(u * 18)) < .55 + .4 * ez((u - .2) / 1) ? 1 : .25) * ez((u - .15) / .3) : 1, on = fl * ez((u - .15) / .5);
    // v8.1: на «темний бік» — лише проєктор і перешкоди; фігура проростає з початком наказу (u = 7)
    const grow = ez((u - 6.9) / 1.1), burst = ez((u - SIX - .45) / 1.2), fig = ez((u - 6.8) / .3) * (1 - ez((u - SIX - 1.3) / .6));
    const sp = speaking(u) ? .55 : .12, glitch = Math.max(sp, ez((u - SIX) / .12) * (1 - burst));
    const lean = .05 * ez((u - 7.4) / .8) * (1 - ez((u - 8.9) / .5));
    // камера: загальний план → наїзд і нахил угору до каптура (3,5–8,6 с) → крупно каптур
    const k = ez((u - 7.0) / 2.3), z = Math.exp(lerp(LN(1.1), LN(3.1), k)), fy = lerp(-121, -268, k);
    x.save(); x.scale(z, z); x.translate(0, -fy);
    // нахил угору: перспективне стиснення по вертикалі
    x.transform(1, 0, 0, 1 - .06 * k, 0, 0);
    projector(on, on * (.35 + .65 * fig * (1 - burst)));
    // м'яке світіння навколо фігури (вона — джерело світла)
    glow(0, -170 * (1 - .3 * (1 - grow)), 250, `rgba(${HOLO_C},.1)`, fig * on * grow * (1 - burst));
    figure(u, .85, grow, lean, glitch, burst, fig * on);
    x.restore();
    jam(1.35 - u, 1.2); jam(u - SIX, .8 * (1 - burst));
    // наприкінці — голубе світло голограми заповнює кадр (вхід у голостіл із флотами)
    const b = ez((u - len + .8) / .7); if (b > 0) { const g = x.createRadialGradient(0, hh * .55, 10, 0, hh * .55, hw * 1.6 * (.3 + .7 * b)); g.addColorStop(0, `rgba(90,160,230,${b})`); g.addColorStop(.6, `rgba(40,90,150,${b})`); g.addColorStop(1, `rgba(40,90,150,${b * b})`); fill(g); }
    if (u > .9) { x.save(); x.globalAlpha *= .04 * ez((u - .9) / .7); x.fillStyle = 'rgb(160,210,255)'; for (let y = -hh; y < hh; y += 4) x.fillRect(-hw, y, hw * 2, 1); x.restore(); }
  }
  // 3. Усередині голограми — голостіл із двома флотами; посеред — морська міна: тремтить, цокання пришвидшується → вибух → чорний екран
  const TK_LOC = TICKS.map((tt) => tt - FLEET);
  function sFleet(u, len) {
    swFrame((r, w, h) => r.fleet(u, w, h, TK_LOC, BOOM - FLEET));
    const b = 1 - ez(u / .6); if (b > 0) fill(`rgba(40,90,150,${b})`);
    const e = u - (BOOM - FLEET), bk = ez((e - 1.1) / 1.9); if (bk > 0) fill(`rgba(0,0,0,${bk})`);
  }

  // сцени: [такт початку, функція, перехід ('c' — м'яка склейка 0,3 с, 'w'/'W' — whip-pan праворуч/ліворуч, 0 — без переходу), камера { push, pu — удари (с від початку сцени), pa — сила удару }]
  //   v7: у «Сторінці», макро й «Мережі» — без ударів камери (один плавний рух на план)
  // v8: шкала тактів нової драматургії (PLAN-36-trailer-v8.md); сцени зі старою тривалістю програються з коефіцієнтом k,
  // board(t) отримує час у шкалі v7 (Mi — обернене до Ms)
  const Mi = (t) => { const k = t / BAR; for (const [a, b, c, d] of MAPB) if (k < d) return B(a + (k - c) * (b - a) / (d - c)); return t; };
  const kx = (fn, k) => (u, len, t) => fn(u * k, len * k, Mi(t));
  let SCN = [[0, c01, 0], [2, c02, 0], [4, inter('ОДИН ПІКСЕЛЬ', 'ІЗ 2 073 600 НА ЕКРАНІ'), 'c'],
    [5, s02, 'c'], [7, c04, 0], [9, sBits, 0], [11, kx(sDive, 1.5), 'c'], [17, sCity, 'c'], [22, sWake, 0, { push: .03 }], [25, inter('ОДНА КОМАНДА', 'ВІСІМ РОЛЕЙ · ОДИН TECH LEAD'), 'c'],
    ...TM.map((n, i) => [26 + i, kx(poster(i), 2), 'c', { push: .025, pu: [0], pa: .035 }]),
    [34, sSplit, 'w', { push: .03, pu: [0, 2], pa: .05 }], [36, kx(sBuild, 1), 'c', { pu: [0] }], [38, kx(sConf, 1), 0], [40.5, kx(sCheck, 5 / 3), 0], [42, kx(sOk, 2), 0, { pu: [0], pa: .04 }],
    [43, sReady, 'c', { push: .02 }],
    [44, kx(sTerm, 2), 'c', { pu: [0], pa: .04 }], [45, kx(sGlobe, 2), 'c'], [47, kx(sPhone, 1), 'c', { pu: [0], pa: .03 }],
    [48.5, sTitle, 0], [51.5, sPost, 'c'], [54.5, sHolo, 'c'], [60.5, sFleet, 0, { pu: [6], pa: .03 }], [65.5, null]];

  // ══ v9 · МОНТАЖ ПІД ТРЕК SUNO ══ (власник 25.10: «нову версію ролика під цей трек»)
  // Межі сцен v8 → нові секунди v9, щоб склейки лягали на удари треку (ship-pipeline/trailer-v8-music; аналіз онсетів запису):
  // вступ 0–3,7 · удари 3,7 і 7,3 · стек з 18,1 · сплеск 28,1 → місто (довше, 16 с) · «подих» 44 → рукавиця · щільна середина 50,6–66,6 → агенти
  // · спад 76–82,6 → конфлікт · найбільші удари 82,6–84,4 → «готово» → «Пуш.» · пік 86,2 → глобус · згасання → титр 93,8–99 · далі пост-кредит.
  // Сцена програється з коефіцієнтом k = довжина v8 / довжина v9; час для board() переводиться назад у шкалу v8 (а там — у v7).
  const SCN8 = SCN, P8 = SCN8.map((e) => B(e[0]));
  const V9S = [0, 3.7, 7.3, 8.8, 12, 15, 18.1, 28.1, 44, 49.4, 50.6, 52.6, 54.6, 56.6, 58.6, 60.6, 62.6, 64.6, 66.6, 71, 76, 79, 81, 82.6, 84.4, 86.2, 89.8, 93.8, 99, 105, 117, 127];
  const pw = (X, Y) => (t) => { for (let i = 0; i < X.length - 1; i++) if (t < X[i + 1] || i === X.length - 2) return Y[i] + (t - X[i]) * (Y[i + 1] - Y[i]) / (X[i + 1] - X[i]); return t; };
  const M89 = pw(P8, V9S), M98 = pw(V9S, P8);
  const SCN9 = SCN8.map((e, i) => { if (!e[1]) return [V9S[i] / 2, null]; if (e[1] === sCity) return [V9S[i] / 2, sCityV10, e[2], e[3]]; const k = (P8[i + 1] - P8[i]) / (V9S[i + 1] - V9S[i]), fn = e[1];
    return [V9S[i] / 2, (u, len, t) => fn(u * k, len * k, M98(t)), e[2], e[3] && { ...e[3], pu: (e[3].pu || []).map((p) => p / k) }]; });
  const V8 = { SCN: SCN8, TOTAL, DUR, SC, SUBS, FX, AUD };
  const mapA = (A) => A.map((e) => [M89(e[0]), ...e.slice(1)]);
  // v10: стара партитура більше не звучить ніде. Обидві версії — монтаж v9; музика — готові доріжки:
  //   «трек» — Suno (0–99 с) + нова доріжка з нуля в пост-кредиті; «синтез» — нова доріжка з нуля на весь ролик (ship-pipeline/trailer-v10-score/score2.js)
  const SILENT = { sec: [[0, {}]], hits: [], risers: [], motif: [], ticks: [], push: [1e9, 1e9], cut: 1e9, sheps: [] };
  const AUD9 = { ...AUD_TRK, ...SILENT, end: V9S[V9S.length - 1], voice: AUD_TRK.voice.map(([b, k, d]) => [M89(b), k, d]), vv: 10,
    tracks: [{ f: 'trailer-suno', at: 0, lv: .38, until: 99 }, { f: 'trailer-synth', at: 99, off: 99, lv: 1 }] };
  const AUD10 = { ...AUD9, tracks: [{ f: 'trailer-synth', at: 0, lv: 1 }] };
  const T9 = V9S[V9S.length - 1];
  const V9 = { SCN: SCN9, TOTAL: T9, DUR: `${Math.floor(T9 / 60)}:${String(Math.round(T9 % 60)).padStart(2, '0')}`, SC: SC.map((c) => ({ t: c.t, a: M89(c.a), b: M89(c.b) })),
    SUBS: SUBS.map((x) => { const a = M89(x[0]); return [a, a + (x[1] - x[0]), x[2], x[3]]; }), FX: FX.map(([h, k, a]) => [M89(h), k, a]), AUD: AUD9 };
  const V10 = { ...V9, AUD: AUD10 };
  // v11 (PLAN-36-trailer-v11.md): місто довше на 3 с (міст «стек → вікно»); усе після міста зсувається; музика — нова доріжка «дарк-електро хакер»
  // v11: крупності агентів (сцени 10–17): загальний → крупно картка → панорама → крупно назва → нахил → крупно картка → панорама → відліт
  const FRP = (z0, z1, x0, y0, x1, y1, a0 = 0, a1 = 0) => (k) => { const e = ez(k); return [lerp(z0, z1, e), lerp(x0, x1, e), lerp(y0, y1, e), lerp(a0, a1, e) * DEG]; };
  const FR11 = { 10: FRP(1, 1.07, 0, 0, 0, 0), 11: FRP(1.6, 1.25, 290, -20, 200, -10), 12: FRP(1.28, 1.28, -110, 0, 110, 0), 13: FRP(1.5, 1.72, -290, 10, -260, 20),
    14: FRP(1.12, 1.06, 0, 0, 0, 0, 3.2, 0), 15: FRP(1.35, 1.62, 280, -20, 300, -25), 16: FRP(1.28, 1.28, 110, 0, -110, 0), 17: FRP(1.45, 1, -120, 0, 0, 0),
    19: FRP(1, 1.12, 0, 0, 0, 10), 20: FRP(1.06, 1.06, 0, 0, 0, 0, -1.6, 0) };
  const SH11 = 3, C11 = 44, m11 = (t) => (t >= C11 - 1e-6 ? t + SH11 : t);
  const SCN11 = SCN9.map((e, i) => { const st = m11(V9S[i]) / 2; if (!e[1]) return [st, null]; if (e[1] === sCityV10) return [st, sCityV11, 0, e[3]];
    const fn = e[1], sh = V9S[i] >= C11 - 1e-6 ? SH11 : 0, fr = FR11[i]; return [st, sh ? (u, len, t) => fn(u, len, t - sh) : fn, fr && i > 10 && i < 18 ? 0 : e[2], fr ? { ...(e[3] || {}), push: 0, pu: [], fr } : e[3]]; });
  const T11 = m11(T9), AUD11 = { ...AUD9, end: T11, voice: AUD9.voice.map(([b, k, d]) => [m11(b), k, d]), tracks: [{ f: 'trailer-dark', at: 0, lv: .62 }] };
  const V11 = { SCN: SCN11, TOTAL: T11, DUR: `${Math.floor(T11 / 60)}:${String(Math.round(T11 % 60)).padStart(2, '0')}`, SC: V9.SC.map((c) => ({ t: c.t, a: m11(c.a), b: m11(c.b) })),
    SUBS: V9.SUBS.map((x0) => [m11(x0[0]), m11(x0[0]) + (x0[1] - x0[0]), x0[2], x0[3]]), FX: V9.FX.map(([h, k, a]) => [m11(h), k, a]), AUD: AUD11 };
  // v11 «трек»: Suno «Glass Tower Breach» (генерація 4, записано в Chrome без втрат; брейкдаун 28–32 с лягає на міст у вежі, дроп 33 с — на рух крізь шибку) до кінця титру, далі — нова доріжка
  // v12: трек на 20 % тихіший; поверх — мій шар ефектів у сітці треку (142 уд/хв, ship-pipeline/trailer-v11-score/scorefx.js); синтез пост-кредиту — з долі 101,97 с
  const V11T = { ...V11, AUD: { ...AUD11, tracks: [{ f: 'trailer-suno11', at: 0, lv: .34, until: 101.8 }, { f: 'trailer-fx12', at: 0, lv: .6, until: 103 }, { f: 'trailer-dark', at: 101.97, off: 101.97, lv: .62 }] } };
  // версія: «трек» — монтаж v9 + трек Suno; «синтез» — монтаж v8 + синтезована партитура
  let CUR = V8;
  function useVer(v) { CUR = v === 'track' ? V11T : V11; SND_V = v; ({ SCN, TOTAL, DUR, SC, SUBS, FX } = CUR);
    trk.innerHTML = SC.map((x) => `<i style="left:${x.a / TOTAL * 100}%;width:${(x.b - x.a) / TOTAL * 100}%" title="${x.t}"><u>${x.t}</u></i>`).join('') + '<em></em>';
    head = trk.querySelector('em'); segs = [...trk.querySelectorAll('i')]; const sm = cover.querySelector('small'); if (sm) sm.textContent = `трейлер · ${DUR} · зі звуком краще`; }
  const TR = .3;
  // одна сцена в поточний контекст x; dx — зсув для whip-pan
  function scene(i, t, dx) {
    x.setTransform(DPR, 0, 0, DPR, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.imageSmoothingEnabled = true; x.lineWidth = 1; x.setLineDash([]); x.letterSpacing = '0px'; BA = 1; PA = 1; ACC = AMB;
    x.fillStyle = '#05060a'; x.fillRect(0, 0, W, H);
    const sc = SCN[i], a = B(sc[0]), len = B(SCN[i + 1][0]) - a, u = t - a, f = sc[3] || {};
    // камера: повільний наїзд + удари (punch-in за 3 кадри, частково відпускає) + згасаючий трус для ваги
    let z = 1 + (f.push || 0) * ez(u / len), sx = 0, sy = 0;
    (f.pu || []).forEach((p) => { const d = u - p; if (d < 0) return; z *= 1 + (f.pa || .06) * ez(d / .1) * (1 - .6 * ez((d - .1) / .9)); const sh = 2.6 * Math.exp(-d / .2); sx += sh * Math.sin(d * 63 + p * 7.1); sy += sh * Math.cos(d * 49 + p * 3.3); });
    x.save(); x.translate(W / 2 + dx, H / 2); x.scale(S, S); x.translate(sx, sy); x.scale(z, z);
    // v11: «операторський» кадр усередині 2D-сцени — крупність, панорама, нахил горизонту (fr(k) → [зум, центр x, центр y, кут])
    if (f.fr) { const [fz, fx, fy, fa] = f.fr(cl(u / len)), mx = hw * (1 - 1 / fz), my = hh * (1 - 1 / fz); x.scale(fz, fz); x.rotate(fa); x.translate(-Math.max(-mx, Math.min(mx, fx)), -Math.max(-my, Math.min(my, fy))); }
    sc[1](u, len, t); x.restore();
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.lineWidth = 1; x.setLineDash([]); x.letterSpacing = '0px';
  }

  function draw(t) {
    hw = W / S / 2; hh = H / S / 2; REC = null;
    let i = 0; while (i < SCN.length - 2 && t >= B(SCN[i + 1][0])) i++;
    const a = B(SCN[i][0]), b = B(SCN[i + 1][0]), tr = SCN[i][2], k = (t - a) / TR;
    if (RM) scene(i, a + (b - a) * .8, 0);
    else if (tr && i > 0 && k < 1) {
      // склейка на долі: попередня сцена (застигла) і нова поверх неї; whip — обидві летять убік
      const dir = tr === 'w' ? 1 : tr === 'W' ? -1 : 0, e = ez(k);
      scene(i - 1, a - 1e-3, -dir * e * W * .32);
      x = ocx; scene(i, t, dir * (1 - e) * W * .32); x = cx0;
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = cl(k); x.drawImage(oc, 0, 0); x.globalAlpha = 1;
      if (dir) { x.save(); x.setTransform(DPR, 0, 0, DPR, 0, 0); x.translate(W / 2, H / 2); x.scale(S, S); streaks(k, dir); x.restore(); }
    } else scene(i, t, 0);
    x.setTransform(DPR, 0, 0, DPR, 0, 0);
    // субтитри з іменем мовця
    const sub = SUBS.find((s) => t >= s[0] && t < s[1]);
    if (sub) { const al = Math.min(ez((t - sub[0]) / .2), ez((sub[1] - t) / .2)), fs = 15 * S, Y = H * .84; x.font = `600 ${fs}px ${SANS}`; const line = `${sub[2]}:  ${sub[3]}`, tw = x.measureText(line).width;
      x.fillStyle = `rgba(0,0,0,${.6 * al})`; x.beginPath(); x.roundRect ? x.roundRect(W / 2 - tw / 2 - 14 * S, Y - 16 * S, tw + 28 * S, 32 * S, 6 * S) : x.rect(W / 2 - tw / 2 - 14 * S, Y - 16 * S, tw + 28 * S, 32 * S); x.fill();
      x.textBaseline = 'middle'; x.textAlign = 'left'; x.font = `700 ${fs}px ${SANS}`; x.fillStyle = sub[2] !== 'ВЛАСНИК' ? `rgba(143,214,255,${al})` : `rgba(255,178,122,${al})`; x.fillText(sub[2] + ':', W / 2 - tw / 2, Y);
      const nw = x.measureText(sub[2] + ':  ').width; x.font = `600 ${fs}px ${SANS}`; x.fillStyle = `rgba(255,255,255,${al})`; x.fillText(sub[3], W / 2 - tw / 2 + nw, Y); }
    frameFx();
    if (!RENDER) { const ai = Math.max(0, SC.findIndex((s) => t < s.b)); head.style.left = (t / TOTAL * 100) + '%'; tm.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} / ${DUR}`; segs.forEach((e, j) => e.classList.toggle('on', j === ai)); }
  }
  // віньєтка і кашетування (статичні)
  function frameFx() { x.setTransform(DPR, 0, 0, DPR, 0, 0); const g = x.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H * .06); x.fillRect(0, H * .94, W, H * .06); }
  // ── постер (до натискання ▶): окремий кадр, не кадр із таймлайну. Одна ідея — сторінка в перспективі, з якої вниз проростає стек
  //    (тизер «Мережі»), приглушено; назва — за правилом третин ліворуч унизу. HTML-обкладинка має лише ▶ і рядок під ним.
  // v8.1: постер — уся історія одним кадром: аркуш коду збоку крізь макролінзу, з нього вниз сиплються нулі й одиниці
  // і падають у неонове місто «Інтернет», що лежить унизу до горизонту. Назва — ліворуч унизу, ▶ — у центрі (HTML)
  function drawPoster() {
    x = cx0; hw = W / S / 2; hh = H / S / 2; REC = null; x.setTransform(DPR, 0, 0, DPR, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.setLineDash([]); x.letterSpacing = '0px'; BA = 1; PA = 1;
    x.fillStyle = '#05060a'; x.fillRect(0, 0, W, H); x.save(); x.translate(W / 2, H / 2); x.scale(S, S);
    // унизу — місто з висоти
    x.save(); x.translate(0, hh * .38); x.scale(.92, .92); cityFrame(9.6, 1); x.restore();
    const g = x.createLinearGradient(0, -hh, 0, hh * .2); g.addColorStop(0, 'rgba(5,6,10,1)'); g.addColorStop(.55, 'rgba(5,6,10,.92)'); g.addColorStop(1, 'rgba(5,6,10,0)'); x.fillStyle = g; x.fillRect(-hw - 2, -hh - 2, hw * 2 + 4, hh * 1.2 + 4);
    // угорі праворуч — аркуш коду збоку, біти падають униз до міста
    x.save(); x.translate(hw * .3, -hh * .32); bitsCam(3.3); SS = 1; SO = [0, 0, 0];
    tex3(edTex(), [-240, LYS[0], -135], [480, 0, 0], [0, 0, 270], 12, 7, 1); poly3([[-240, LYS[0], -135], [240, LYS[0], -135], [240, LYS[0], 135], [-240, LYS[0], 135]], null, HC, 1.4, 1);
    bitsRain(4.6, 1); const c = p3(0, LYS[0], 60); x.restore(); if (c) macroDOF(c[1] - hh * .32, 60, 4);
    SHX = 0; const X = -hw + 58; x.letterSpacing = '4px'; T('СТАТТЯ 36 · СКІЛ', X, 96, 9.5, `rgba(${AMB},.95)`, 'left', 600, MONO); x.letterSpacing = '0px';
    T('Проліт крізь піксель', X - 2, 134, 38, '#f6f8fb', 'left', 700); x.fillStyle = `rgba(${AMB},.85)`; x.fillRect(X, 162, 120, 1.2);
    T('від одного пікселя — до всього інтернету', X, 184, 13, 'rgba(230,236,245,.75)', 'left', 500);
    x.restore(); frameFx();
  }
  let t = 0, playing = false, raf = 0, last = 0, started = false;
  const paint = () => (started || RENDER ? draw(t) : drawPoster());
    function loop(now) { const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; const t0 = t; t += dt;
    if (t >= TOTAL) { t = TOTAL; pause(); draw(TOTAL - .001); return; }
    FX.forEach(([h, k, a]) => { if (t0 < h && t >= h) SND(k, a); });
    const a0 = performance.now(); draw(t); const dtw = performance.now() - a0; DTA = DTA * .9 + dtw * .1; DTN++;
    if (DTN > 20 && DTA > 18 && QD > .5) { QD = Math.max(.5, QD * .75); DTN = 0; DTA = 10; size(); }   // повільно — знижуємо роздільність кроками, не нижче половини
    raf = playing ? requestAnimationFrame(loop) : 0; }
  let DTA = 10, DTN = 0;
  const sndOn = () => { if (window.SK_SND) SK_SND.trailer(true, t, audNow()); };
  // перемикач версій звуку: трек Suno ↔ синтез; під час показу звук перемикається з поточної секунди
  const sndBtn = box.querySelector('[data-snd]'); sndBtn.addEventListener('click', () => { const nv = SND_V === 'track' ? 'synth' : 'track'; useVer(nv);
    sndBtn.textContent = SND_V === 'track' ? '♪ трек' : '♪ синтез'; sndBtn.classList.toggle('on', SND_V === 'synth'); if (playing) sndOn(); else paint(); });
  useVer('synth'); sndBtn.textContent = '♪ синтез'; sndBtn.classList.add('on');
  function play() { started = true; swLoad(); if (t >= TOTAL - .01) t = 0; playing = true; cover.hidden = true; pp.textContent = '❚❚'; pp.classList.add('on'); last = 0; sndOn(); if (!raf) raf = requestAnimationFrame(loop); }
  function pause() { playing = false; cancelAnimationFrame(raf); raf = 0; pp.textContent = '▶'; pp.classList.remove('on'); if (window.SK_SND) SK_SND.trailer(false); }
  cover.addEventListener('click', play);
  pp.addEventListener('click', () => { playing ? pause() : play(); });
  trk.addEventListener('click', (e) => { const r = trk.getBoundingClientRect(); t = Math.max(0, Math.min(TOTAL - .01, (e.clientX - r.left) / r.width * TOTAL)); started = true; cover.hidden = true; if (playing) sndOn(); draw(t); });
  cv.addEventListener('click', () => { if (cover.hidden) playing ? pause() : play(); });
  // звук увімкнули під час показу — музика й голос підхоплюються з поточного місця
  addEventListener('sk-sound', (e) => { if (playing && e.detail && e.detail.on) sndOn(); });
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && playing) pause(); }, { threshold: .2 }).observe(box);
  new ResizeObserver(() => { size(); paint(); }).observe(cv);
  size(); paint();
  // шрифти й скріншоти довантажились — перемалювати кадр
  // у ?reel=render кадри пост-кредиту чекають на three.js і моделі (__reel.ready); у звичайному показі вони вантажаться з першим «▶»
  const READY = Promise.all([document.fonts.ready, document.fonts.load(`700 40px ${SANS}`), document.fonts.load(`500 20px ${MONO}`), document.fonts.load(`600 12px ${MONO}`), IMGS, RENDER ? swLoad() : null]).catch(() => null).then(() => { TEX = {}; paint(); });
  if (RENDER) { document.documentElement.classList.add('sk-render'); window.__reel = { ready: READY, total: TOTAL, get aud() { return audNow(); }, audSynth: AUD, audTrack: AUD_TRK, aud12: V11T.AUD, useVer: (v) => useVer(v), scenes: SCN.map((c) => B(c[0])), rec: () => REC, poster: () => new Promise((ok) => { drawPoster(); requestAnimationFrame(() => ok()); }), seek: (tt) => new Promise((ok) => { draw(tt); requestAnimationFrame(() => ok()); }), perf: (tt, n = 5) => { const a0 = performance.now(); for (let i = 0; i < n; i++) draw(tt + i / 30); return (performance.now() - a0) / n; } }; }
})();
