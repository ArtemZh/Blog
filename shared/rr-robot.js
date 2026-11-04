/* Стаття 41, розділ «Робот по блоках»: той самий робот (Tripo → Blender), корпус розрізано на 4 обичайки, всередині — блоки узагальненого сканера.
   Повзунок розбирає робота; ▶ «потік даних» веде одну подію (порожня полиця) блоками робота й далі хмарними системами (хмара постачальника → інтеграція → ERP / WMS → застосунок працівника). Хмарні системи — нерухомі плашки біля сцени, лінії зв'язків домальовуються. Під сценою відкриті списки: шлях події і блоки (що роблять · дані · у магазині · якщо відмовлять) — нічого не сховано за кліком.
   Числа на картках — лише з джерел у «Що відомо» (Simbe, Badger, Brain Corp). Зміщення частин = EXPLODE у ship-pipeline/retail/robot_parts.py (Blender Z-up → three Y-up). Стан — window.__rr.parts. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk);
const host = document.getElementById('rr-parts');
const T = window.__rr = window.__rr || {};
const SND = (k) => { if (window.RR_SND) RR_SND.fx(k); };
if (host) {
  // Blender (x, y, z) → three (x, z, −y)
  const EXB = { shell_base: [0, 0, 0], drive: [.75, 0, 0], shell_body: [0, 0, .25], battery: [.75, 0, .05], compute: [.75, 0, .22], comms: [.75, 0, .38],
    shell_column: [0, 0, .55], cameras: [-.7, 0, .4], rfid: [.75, 0, .35], estop: [.75, 0, .55], shell_top: [0, 0, .8], lidar: [0, 0, 1.05] };
  const EX = Object.fromEntries(Object.entries(EXB).map(([k, v]) => [k, new THREE.Vector3(v[0], v[2], -v[1])]));
  const SHELL = L('Корпус', 'Shell');
  const P = {
    lidar: { t: L('Лідар і камери глибини', 'Lidar and depth cameras'), d: L('Навігація: робот будує карту залу й об’їжджає людей, візки й піддони. Badger ставить обертовий лідар, Simbe в Tally 4.0 — камери глибини RealSense.', 'Navigation: the robot maps the floor and steers around people, trolleys and pallets. Badger fits a rotating lidar; Simbe’s Tally 4.0 uses RealSense depth cameras.'), data: L('карта, перешкоди, власна позиція', 'map, obstacles, own position'), to: L('керування парком: маршрути й розклад', 'fleet management: routes and schedules'), shop: L('Переставили стелажі — карта застаріла, робот стоїть у глухому куті.', 'Shelving moved: the map is stale and the robot is stuck in a dead end.') },
    cameras: { t: L('Колона камер із підсвіткою', 'Camera mast with lighting'), d: L('Знімає полиці з кількох висот за один прохід. Simbe про Tally 4.0: «більше дюжини» камер високої роздільності, спеціальні камери й два «риб’ячі ока» на 360°.', 'Photographs shelves at several heights in one pass. Simbe on Tally 4.0: “more than a dozen” high-resolution cameras, specialty cameras and two fisheye cameras for 360°.'), data: L('знімки полиць і цінників', 'images of shelves and price labels'), to: L('бортовий комп’ютер', 'the on-board computer'), shop: L('Відблиски на глянцевій упаковці, брудні лінзи, темні кути вночі — пропуски.', 'Glare on glossy packs, dirty lenses, dark corners at night: misses.') },
    rfid: { t: L('RFID-антена (опційно)', 'RFID antenna (optional)'), d: L('Рахує мітки на одязі, взутті й електроніці на ходу, без прямої видимості. У Simbe це окремий Tally RFID; Decathlon USA поставив такого робота 2018 року.', 'Counts tags on apparel, footwear and electronics on the move, without line of sight. Simbe sells it as a separate Tally RFID; Decathlon USA deployed one in 2018.'), data: L('які мітки й де', 'which tags, and where'), to: L('система залишків', 'the stock system'), shop: L('Метал і рідини глушать сигнал: у продуктах RFID майже не працює.', 'Metal and liquids block the signal: in grocery RFID barely works.') },
    compute: { t: L('Бортовий комп’ютер', 'On-board computer'), d: L('Розпізнає товар і цінник, розмиває обличчя ще на роботі, а в хмару шле лише події. Tally 4.0 обробляє дані на борту на платформі NVIDIA (CUDA, TensorRT).', 'Recognises products and labels and blurs faces on the robot, sending only events to the cloud. Tally 4.0 processes on board on NVIDIA’s platform (CUDA, TensorRT).'), data: L('події: «порожньо», «не та ціна», «не на місці»', 'events: “empty”, “wrong price”, “misplaced”'), to: L('модуль зв’язку', 'the comms module'), shop: L('Хто й коли оновлює ПЗ та моделі розпізнавання під новий асортимент?', 'Who updates the software and recognition models for the new range, and when?') },
    comms: { t: L('Зв’язок: Wi‑Fi і LTE', 'Comms: Wi‑Fi and LTE'), d: L('Віддає події в хмару постачальника й далі в системи мережі. Dane AIR від Brain Corp має і Wi‑Fi, і LTE.', 'Sends events to the vendor’s cloud and on to the chain’s systems. Brain Corp’s Dane AIR has both Wi‑Fi and LTE.'), data: L('події й знімки для перевірки', 'events and images for review'), to: L('хмара → ERP, WMS → застосунок працівника', 'cloud → ERP, WMS → staff app'), shop: L('Мертві зони Wi‑Fi біля холодильників і в кутах: дані доходять уже після відкриття.', 'Wi‑Fi dead spots by the fridges and in corners: data arrives after opening.') },
    battery: { t: L('Батарея й док', 'Battery and dock'), d: L('За даними виробників: Tally 4.0 — до 12 годин, Badger — до 16 годин; робот сам повертається на зарядку.', 'Per the makers: Tally 4.0 up to 12 hours, Badger up to 16 hours; the robot returns to charge on its own.'), data: L('заряд, цикли, стан', 'charge, cycles, health'), to: L('керування парком', 'fleet management'), shop: L('Потрібні розетка й місце для дока, де його не заставлять піддонами.', 'It needs a socket and a dock spot that nobody blocks with pallets.') },
    drive: { t: L('Привід і бампер', 'Drive and bumper'), d: L('Два мотор-колеса, опорні колеса, гумовий бампер і датчики відстані. Швидкість — пішохідна.', 'Two drive wheels, casters, a rubber bumper and distance sensors. Walking speed.'), data: L('пробіг, зупинки, зіткнення', 'distance, stops, bumps'), to: L('керування парком', 'fleet management'), shop: L('Мокра підлога, пороги, піддони в проході.', 'Wet floors, thresholds, pallets in the aisle.') },
    estop: { t: L('Аварійна кнопка й індикатор', 'Emergency stop and status light'), d: L('Людина в залі має змогу зупинити машину однією кнопкою. З 2027 року в ЄС діє Регламент про машини, і мобільні роботи підпадають під нього.', 'A person on the floor can stop the machine with one button. From 2027 the EU Machinery Regulation applies, and mobile robots fall under it.'), data: L('натискання, помилки', 'presses, faults'), to: L('журнал безпеки', 'the safety log'), shop: L('Персонал має знати, що робити, коли робот стоїть і блимає червоним.', 'Staff must know what to do when the robot stops and blinks red.') }
  };
  // режим «що як зламається»: симптом → наслідок для магазину → що робити; core — без блоку базовий обхід не відбудеться
  const FAIL = {
    lidar: [1, L('Робот не бачить перешкод або губить себе на карті.', 'The robot cannot see obstacles or loses itself on the map.'), L('Обхід зупиняється посеред проходу або не починається; зранку звіту немає.', 'The pass stops mid-aisle or never starts; there is no report in the morning.'), L('Перезапуск і нова карта після перестановки залу; виклик сервісу постачальника.', 'Restart and remap after a floor reset; call the vendor’s service.')],
    cameras: [1, L('Знімки темні, розмиті або з відблисками.', 'Images are dark, blurred or full of glare.'), L('Робот їде, але порожні місця пропускає — гірше, ніж зупинка, бо звіт виглядає чистим.', 'The robot drives but misses gaps — worse than stopping, because the report looks clean.'), L('Чистка лінз у чеклисті магазину; вибіркова звірка звіту з полицею.', 'Lens cleaning on the store checklist; spot-check the report against the shelf.')],
    rfid: [0, L('Антена не читає мітки.', 'The antenna does not read tags.'), L('Камери працюють далі, губиться лише підрахунок одягу й взуття за мітками.', 'Cameras keep working; only the tag count of apparel and footwear is lost.'), L('Не критично для обходу; перевірка в наступному візиті сервісу.', 'Not critical for the pass; check at the next service visit.')],
    compute: [1, L('Комп’ютер не розпізнає або зависає.', 'The computer does not recognise or hangs.'), L('Знімки є, подій немає; або після оновлення асортименту розпізнавання гіршає.', 'Images exist but no events; or recognition drops after a range update.'), L('Хто відповідає за оновлення моделей — записати в договір і SLA.', 'Put who updates the models into the contract and the SLA.')],
    comms: [0, L('Немає Wi‑Fi або LTE у частині залу.', 'No Wi‑Fi or LTE in part of the store.'), L('Події лежать на роботі й доходять уже після відкриття — завдання запізнюються.', 'Events sit on the robot and arrive after opening — tasks are late.'), L('Обстеження мережі до пілота; запасний канал зв’язку.', 'Survey the network before the pilot; a backup channel.')],
    battery: [1, L('Батарея тримає менше або док заставлений.', 'The battery holds less, or the dock is blocked.'), L('Обхід не закінчується, частина проходів без даних.', 'The pass does not finish; some aisles have no data.'), L('Вільне місце біля дока в правилах магазину; заміна батареї — у сервісному контракті.', 'Keep the dock clear by store rule; battery replacement in the service contract.')],
    drive: [1, L('Робот застрягає на порогах, мокрій підлозі, піддонах.', 'The robot gets stuck on thresholds, wet floors, pallets.'), L('Нічний обхід уривається; вранці робот стоїть у проході.', 'The night pass breaks off; in the morning the robot stands in the aisle.'), L('Нічна розвантажка не в проходах, якими їде робот; маршрут погодити з магазином.', 'Night unloading away from the robot’s aisles; agree the route with the store.')],
    estop: [1, L('Кнопку натиснули або індикатор горить червоним.', 'The button is pressed or the light shows red.'), L('Робот стоїть, поки людина не зніме зупинку, — це правильно, так працює безпека.', 'The robot waits until a person releases the stop — this is safety working as intended.'), L('Персонал знає, як оглянути й перезапустити; хто телефонує в сервіс.', 'Staff know how to check and restart, and who calls the service.')]
  };
  // шлях однієї події «порожня полиця» — кроки від кадру до завдання людині; JSON умовний
  const EVT = [
    [['cameras'], L('1 · Камера', '1 · Camera'), L('Уночі робот проїжджає прохід, колона камер знімає полицю з кількох висот.', 'At night the robot drives the aisle; the camera mast photographs the shelf at several heights.'), ''],
    [['compute'], L('2 · Розпізнавання на борту', '2 · Recognition on board'), L('Комп’ютер знаходить порожнє місце, звіряє його з планограмою й визначає товар. Обличчя в кадрі розмиваються ще тут.', 'The computer finds the gap, matches it to the planogram and identifies the product. Faces in the frame are blurred right here.'), ''],
    [['compute'], L('3 · Подія', '3 · Event'), L('З кадру лишається коротка подія, а не відео:', 'What remains of the frame is a short event, not video:'), '{ "event": "shelf_gap", "store": "S‑024", "aisle": "07", "sku": "SKU‑1234", "seen": "night pass" }'],
    [['comms'], L('4 · Зв’язок', '4 · Comms'), L('Модуль зв’язку відправляє подію в хмару постачальника або на сервер магазину. Знімок лишається для перевірки, якщо так домовились.', 'The comms module sends the event to the vendor’s cloud or a store server. The image stays for review only if that was agreed.'), ''],
    [[], L('5 · Хмара й системи мережі', '5 · Cloud and chain systems'), L('Хмара постачальника передає подію в інтеграційний шар мережі. Той питає ERP і WMS: товар є на складі магазину? Якщо так — створюється завдання поповнити; якщо ні — замовлення.', 'The vendor’s cloud passes the event to the chain’s integration layer, which asks ERP and WMS: is the product in the back room? If yes, a replenish task is created; if not, an order.'), ''],
    [[], L('6 · Людина', '6 · A person'), L('Вранці працівник бачить завдання в застосунку, викладає товар і підтверджує. Наступний обхід перевіряє, що місце заповнене.', 'In the morning a worker sees the task in the app, fills the gap and confirms. The next pass checks that it is filled.'), '']
  ];
  // ▶ «потік даних»: кроки EVT по черзі; світна точка йде блоками робота, далі домальовуються лінії до хмарних систем; [ключі точок шляху]
  const STEP = 2.2, PATH = [['cameras'], ['cameras', 'compute'], ['compute'], ['compute', 'comms', 'comms'], [], []];
  // лінії зв'язків: [звідки, куди, крок EVT, початок і кінець у частці кроку]; 'r' — блок «Зв'язок» робота (рухається разом із камерою)
  const LN = [['r', 0, 3, .45, 1], [0, 1, 4, 0, .4], [1, 2, 4, .4, 1], [1, 3, 4, .4, 1], [2, 4, 5, 0, .7], [3, 4, 5, 0, .7]];
  const SYS = [[L('Хмара постачальника', 'Vendor cloud'), L('події, знімки, керування парком', 'events, images, fleet management')],
    [L('Інтеграційний шар', 'Integration layer'), L('API, черга подій, відповідність SKU', 'API, event queue, SKU matching')],
    ['ERP', L('залишки й замовлення', 'stock and orders')], ['WMS', L('склад магазину → «поповнити»', 'back room → “replenish”')],
    [L('Застосунок працівника', 'Staff app'), L('завдання → «виконано»', 'task → “done”')]];
  const CORE = L('без нього обходу немає', 'no pass without it'), OPT = L('опційно', 'optional');
  host.innerHTML = `<div class="oc-sc rr-sc rr-parts"><div class="rr-parts__top"><div class="rr-parts__main"><div class="rr-parts__stage" data-g><div class="rr-parts__view" data-v><div class="rr-parts__lbls" data-l></div>
      <div class="rr-parts__load" data-load>${L('робот завантажується…', 'loading the robot…')}</div></div>
      <svg class="rr-sysw" data-w aria-hidden="true">${LN.map(() => '<path class="rr-sysw__b"/><path class="rr-sysw__d" pathLength="1"/>').join('')}</svg>
      <ol class="rr-sys">${SYS.map((s, i) => `<li class="rr-sys__c" style="grid-area:${'ciewa'[i]}"><b>${s[0]}</b><small>${s[1]}</small></li>`).join('')}</ol></div>
    <div class="rr-ctl"><button type="button" class="rc-btn oc-glow" data-play>▶ ${L('Потік даних: одна порожня полиця', 'Data flow: one empty shelf')}</button>
      <label class="oc-r">${L('Зібрано → розібрано', 'Assembled → exploded')} <b data-o></b><input type="range" data-x min="0" max="1" step=".01" value="0"></label></div>
    </div><div class="rr-parts__side"><h3 class="rr-parts__h">${L('Шлях однієї події', 'The path of one event')}</h3>
    <ol class="rr-log rr-flowlog">${EVT.map((q, i) => `<li data-st="${i}"><div class="rr-log__h"><b>${q[1]}</b></div><p>${q[2]}${q[3] ? `<pre class="rr-evt">${q[3]}</pre><small>${L('Умовний приклад, не формат конкретного виробника.', 'An illustrative example, not a specific vendor’s format.')}</small>` : ''}</p></li>`).join('')}</ol></div></div>
    <h3 class="rr-parts__h">${L('Блоки: що роблять і що буде, якщо відмовлять', 'Blocks: what they do and what happens if they fail')}</h3>
    <ol class="rr-log">${Object.keys(P).map((k) => { const p = P[k], f = FAIL[k]; return `<li data-i="${k}"><div class="rr-log__h"><b>${p.t}</b><span class="rr-st ${f[0] ? 'back' : 'try'}">${f[0] ? CORE : OPT}</span></div><p>${p.d}<small>${L('Дані', 'Data')}: ${p.data} → ${p.to}</small><small>${L('У магазині', 'In the store')}: ${p.shop}</small><span class="rr-risk">${L('Якщо відмовить', 'If it fails')}: ${f[2]} ${L('Що робити', 'What to do')}: ${f[3]}</span></p></li>`; }).join('')}
      <li data-i="shell"><div class="rr-log__h"><b>${SHELL}</b></div><p>${L('Білий корпус розрізано на чотири частини лише для показу. У справжньому роботі він захищає блоки від пилу й ударів і робить машину непомітною для покупців. Блоки — узагальнений робот-сканер, не конкретна модель.', 'The white shell is cut into four parts only for display. In a real robot it protects the blocks from dust and knocks and keeps the machine unobtrusive for shoppers. The blocks are a generic scanning robot, not a specific model.')}</p></li></ol></div>`;
  const $ = (q) => host.querySelector(q), view = $('[data-v]'), lbls = $('[data-l]'), xs = $('[data-x]'), out = $('[data-o]'), btn = $('[data-play]');
  const stEl = [...host.querySelectorAll('[data-st]')];
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  view.prepend(R.domElement);
  const S = new THREE.Scene(), C = new THREE.PerspectiveCamera(28, 1, .1, 50);
  C.position.set(.9, 1.6, 5.8);
  const ctl = new OrbitControls(C, R.domElement); ctl.target.set(.05, 1.34, 0); ctl.enableZoom = false; ctl.enablePan = false; ctl.minPolarAngle = 1.1; ctl.maxPolarAngle = 1.75; ctl.minAzimuthAngle = -.9; ctl.maxAzimuthAngle = .9; ctl.enableDamping = true;
  S.add(new THREE.HemisphereLight(0xdfe9f2, 0x0b1218, 1.1));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.4); key.position.set(-3, 5, 4); S.add(key);
  const rim = new THREE.DirectionalLight(0x5fe8dc, 1.6); rim.position.set(3, 3, -4); S.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshBasicMaterial({ color: 0x0d1820, transparent: true, opacity: .7 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.003; S.add(floor); // дно корпусу лежить на y = 0 — підлогу трохи нижче, інакше z-fighting
  // хмарні системи — нерухомі плашки поруч зі сценою (праворуч; на телефоні рядком під нею); лінії зв'язків блідим пунктиром, на ▶ домальовуються й лишаються
  const stage = $('[data-g]'), cards = [...host.querySelectorAll('.rr-sys__c')], wire = $('[data-w]'), wb = [...wire.querySelectorAll('.rr-sysw__b')], wd = [...wire.querySelectorAll('.rr-sysw__d')];
  const lp = LN.map(() => 0); // частка домальованої лінії
  function setLines() { wd.forEach((p, i) => { p.style.strokeDashoffset = 1 - lp[i]; p.style.opacity = lp[i] > 0 ? 1 : 0; });
    cards.forEach((c, k) => c.classList.toggle('on', LN.some((l, i) => l[1] === k && lp[i] >= 1))); }
  // крива між двома прямокутниками: від краю до краю по головній осі
  function link(a, b) { const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
    if (Math.abs(by - ay) > Math.abs(bx - ax) * .6) { const s = by > ay ? 1 : -1, y1 = ay + s * a.h / 2, y2 = by - s * b.h / 2, m = (y1 + y2) / 2; return `M${ax} ${y1}C${ax} ${m} ${bx} ${m} ${bx} ${y2}`; }
    const s = bx > ax ? 1 : -1, x1 = ax + s * a.w / 2, x2 = bx - s * b.w / 2, m = (x1 + x2) / 2; return `M${x1} ${ay}C${m} ${ay} ${m} ${by} ${x2} ${by}`; }
  // світна точка потоку даних — у сцені, лише блоками робота
  const pulse = new THREE.Group(); pulse.add(new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd29a })));
  pulse.add(new THREE.Mesh(new THREE.SphereGeometry(.11, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd29a, transparent: true, opacity: .28, depthWrite: false }))); pulse.visible = false; S.add(pulse);
  const parts = {}; let ex = 0, sel = '', step = -1, lit = null, ready = false, need = true;
  const tag = {};
  new GLTFLoader().load('assets/retail-robots/robot-parts.glb', (g) => {
    // текстура Tripo на зворотному боці корпусу дає чорно-білий шум → зовні FrontSide, всередині окрема темна оболонка без текстури
    const inner = [];
    g.scene.traverse((o) => { if (!o.isMesh) return; o.material = o.material.clone(); o.material.transparent = false;
      let p = o; while (p && !(p.name in EXB)) p = p.parent;
      if (p && p.name.startsWith('shell')) { o.material.side = THREE.FrontSide; inner.push(o); } });
    inner.forEach((o) => { const b = new THREE.Mesh(o.geometry, new THREE.MeshStandardMaterial({ color: 0x1a2630, roughness: .9, side: THREE.BackSide })); b.userData.inner = true; o.add(b); });
    g.scene.children.slice().forEach((o) => { const n = o.name; if (!(n in EX)) return; parts[n] = { o, base: o.position.clone() }; });
    S.add(g.scene); $('[data-load]').hidden = true; ready = true;
    Object.keys(P).forEach((k) => { const e = document.createElement('button'); e.type = 'button'; e.className = 'rr-parts__lbl'; e.style.visibility = 'hidden'; e.textContent = P[k].t; e.onclick = () => pick(k); lbls.appendChild(e); tag[k] = e; });
    need = true; Object.assign(T.parts, { ready: true, n: Object.keys(parts).length });
  }, undefined, () => { $('[data-load]').textContent = L('модель не завантажилась', 'model failed to load'); });
  function setEx(v) { ex = v; xs.value = v; out.textContent = Math.round(v * 100) + ' %'; need = true; if (T.parts) T.parts.explode = v; }
  // клік по блоку лише підсвічує пару «блок — рядок»; нічого не ховається
  function pick(k) { sel = P[k] ? k : ''; Object.entries(tag).forEach(([n, e]) => e.classList.toggle('on', n === sel));
    host.querySelectorAll('.rr-log [data-i]').forEach((r) => r.classList.toggle('on', r.dataset.i === (P[k] ? k : 'shell'))); if (ex < .5) anim(.85); need = true; SND('tick'); if (T.parts) T.parts.sel = sel; }
  let an = null; function anim(to, ms = 900) { const from = ex, t0 = performance.now(); an = (now) => { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; setEx(from + (to - from) * e); if (k >= 1) an = null; }; }
  xs.addEventListener('input', () => { an = null; setEx(+xs.value); xs.classList.add('used'); });
  function showStep(i) { step = i; lit = i < 0 ? null : EVT[i][0]; sel = '';
    stEl.forEach((e, k) => { e.classList.toggle('on', k === i); e.classList.toggle('done', i >= 0 && k < i); });
    if (i <= 0) { lp.fill(0); setLines(); } Object.values(tag).forEach((e) => e.classList.remove('on')); // пройдені системи лишаються підсвіченими
    need = true; if (T.parts) T.parts.step = i; if (i >= 0) SND('tick'); }
  let play = null; // { t0 } — час старту відтворення
  function start() { btn.classList.add('used'); if (ex < 1) anim(1, 700); play = { t0: performance.now() + 700 }; showStep(0); btn.textContent = '❚❚ ' + L('Пауза', 'Pause'); pulse.visible = true; }
  function stop(done) { play = null; pulse.visible = false; btn.textContent = '▶ ' + (done ? L('Ще раз', 'Again') : L('Потік даних: одна порожня полиця', 'Data flow: one empty shelf')); if (!done) showStep(-1); else { lit = null; lp.fill(1); setLines(); } need = true; } // після показу робот знову видно повністю, лінії лишаються
  btn.addEventListener('click', () => (play ? stop(false) : start()));
  // точка шляху: центр блока робота
  const BX = new THREE.Box3();
  function pt(key) { BX.setFromObject(parts[key].o); return BX.getCenter(new THREE.Vector3()); }
  function flow(now) { const el = (now - play.t0) / 1000; if (el < 0) return; const i = Math.min(EVT.length - 1, Math.floor(el / STEP)), u = Math.min(1, (el - i * STEP) / (STEP * .75));
    if (i !== step) showStep(i);
    const ks = PATH[i].map(pt), n = ks.length - 1; pulse.visible = n >= 0;
    if (n >= 0) { const f = n ? (u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2) * n : 0, j = Math.min(n - 1, Math.floor(f)), a = ks[Math.max(0, j)], b = ks[Math.min(n, j + 1)], k = n ? f - j : 0;
      pulse.position.copy(a).lerp(b, k); pulse.children[1].scale.setScalar(1 + .25 * Math.sin(now / 120)); }
    LN.forEach((l, q) => { lp[q] = i > l[2] ? 1 : i < l[2] ? 0 : Math.max(0, Math.min(1, (u - l[3]) / (l[4] - l[3]))); }); setLines();
    if (el >= EVT.length * STEP) stop(true); }
  host.querySelectorAll('.rr-log [data-i]').forEach((r) => r.addEventListener('click', () => pick(r.dataset.i)));
  const ray = new THREE.Raycaster(), m = new THREE.Vector2(); let down = null;
  R.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  R.domElement.addEventListener('pointerup', (e) => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return; const r = R.domElement.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(m, C);
    const hit = ray.intersectObjects(Object.values(parts).map((p) => p.o), true)[0]; if (!hit) return; let o = hit.object; while (o && !(o.name in EX)) o = o.parent; if (o) pick(o.name); });
  ctl.addEventListener('change', () => { need = true; });
  const v3 = new THREE.Vector3();
  function size() { const w = view.clientWidth, h = Math.round(Math.min(560, Math.max(360, w * .72))); view.style.height = h + 'px'; R.setSize(w, h, false); R.domElement.style.width = w + 'px'; R.domElement.style.height = h + 'px'; C.aspect = w / h; C.fov = w < 520 ? 36 : 31; C.updateProjectionMatrix();
    // на широкій сцені праворуч стоять плашки систем (інакше — рядком під сценою) — зсуваємо робота вліво (ціль і камеру разом, кут не змінюється); на телефоні плашки під сценою
    const off = getComputedStyle(host.querySelector('.rr-sys')).position === 'absolute' ? .8 : 0, d = off - shift; shift = off; ctl.target.x += d; C.position.x += d; ctl.update(); need = true; }
  let shift = 0;
  const ro = new ResizeObserver(size); ro.observe(view); ro.observe(stage); size();
  let vis = false, swung = false;
  new IntersectionObserver((e) => { vis = e[0].isIntersecting; if (vis && e[0].intersectionRatio > .33 && !swung && ready) { swung = true; anim(1, 1100); setTimeout(() => anim(.6, 700), 1300); } }, { threshold: [0, .34] }).observe(view);
  function frame(now) {
    requestAnimationFrame(frame); if (!vis) return; if (an) an(now); ctl.update();
    if (!need && !an && !play) return; need = false;
    const e = ex * ex * (3 - 2 * ex);
    Object.entries(parts).forEach(([n, p]) => { p.o.position.copy(p.base).addScaledVector(EX[n], e);
      const on = !lit || lit.includes(n), hi = sel === n;
      p.o.traverse((q) => { if (q.isMesh) { if (q.material.transparent === on) { q.material.transparent = !on; q.material.needsUpdate = true; } q.material.opacity = on ? 1 : .12; q.material.depthWrite = on; if (q.material.emissive) q.material.emissive.setHex(hi || (lit && on && lit.length) ? 0x0d4a45 : 0x000000); } }); });
    if (play) flow(now); R.render(S, C);
    const r = view.clientWidth, h = view.clientHeight;
    Object.entries(tag).forEach(([n, el]) => { const p = parts[n]; if (!p) return; p.o.getWorldPosition(v3); v3.project(C); const sx = (v3.x + 1) / 2 * r, sy = (1 - v3.y) / 2 * h, show = e > .55 && (!lit || lit.includes(n));
      const right = EX[n].x > 0, w = el.offsetWidth; el.style.left = (right ? Math.min(r - w - 4, sx + 26) : Math.max(w + 4, sx - 26)) + 'px'; el.style.top = sy + 'px'; el.classList.toggle('l', !right); el.style.opacity = show ? 1 : 0; el.style.pointerEvents = show ? 'auto' : 'none'; el.style.visibility = show ? 'visible' : 'hidden'; });
    wires(r, h);
  }
  // геометрія ліній — у пікселях сцени; початок першої — блок «Зв'язок» робота на екрані
  function wires(r, h) { const g = stage.getBoundingClientRect(), vr = view.getBoundingClientRect(); wire.setAttribute('width', g.width); wire.setAttribute('height', g.height);
    const box = (e) => { const q = e.getBoundingClientRect(); return { x: q.left - g.left, y: q.top - g.top, w: q.width, h: q.height }; }, B = cards.map(box);
    let R0 = null; if (tag.comms && tag.comms.style.visibility === 'visible') R0 = box(tag.comms); else if (parts.comms) { BX.setFromObject(parts.comms.o); BX.getCenter(v3).project(C); R0 = { x: (v3.x + 1) / 2 * r + vr.left - g.left, y: (1 - v3.y) / 2 * h + vr.top - g.top, w: 0, h: 0 }; }
    LN.forEach((l, i) => { const a = l[0] === 'r' ? R0 : B[l[0]], d = a ? link(a, B[l[1]]) : ''; wb[i].setAttribute('d', d); wd[i].setAttribute('d', d); }); }
  requestAnimationFrame(frame);
  T.parts = { ready: false, explode: 0, sel: '', step: -1, pick, setEx, showStep, play: () => (play ? null : start()), playing: () => !!play, cam: C, ctl, redraw: () => { need = true; } };
}
