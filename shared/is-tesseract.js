/* Стаття 34, розділ 08 — «Тесеракт і петля причинності».
   Коридор часу: кімната Мерф (полиця з книжками, стіл із годинником), повторена 24 зрізами — рік за роком.
   Купер «з тесеракту» передає повідомлення азбукою Морзе: стрілка смикається в такт, книжки падають
   на підлогу точками й тире. Граф причин поруч показує, чи замикається історія в узгоджену петлю.
   Буквально: міжнародний код Морзе (точка — 1 такт, тире — 3, пауза в літері — 1, між літерами — 3).
   Сюжет: STAY із книжок і дані через секундну стрілку. Гіпотези: Новіков (самоузгодженість), Гокінг (захист хронології). */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { gradePass } from './is-post.js?v=20261019083324';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const root = document.getElementById('viz-tess');
if (root) init(root);

function init(root) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('./is-tesseract.css?v=5', import.meta.url).href;
  document.head.appendChild(css);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 24, S = 2.1, NB = 12, U = 0.15;          // зрізи, крок по осі часу, книжок на полиці, такт Морзе (с)
  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
    K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
    V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  /* що Мерф бачила насправді (історія одна): у день від'їзду — STAY з книжок, через десятиліття — дані на годиннику */
  const HIST = { 0: 'STAY', [N - 1]: 'DATA' };
  const MSG = {
    STAY: { text: 'STAY', slice: 0, kind: 'books' },
    GO: { text: 'GO', slice: 0, kind: 'books' },
    DATA: { text: 'DATA', slice: N - 1, kind: 'watch' },
  };
  const LAY = {   // розкладка сліду: старт x, y, z, довжина точки, тире, пауза в літері, між літерами
    books: { x: -1.75, y: 0.05, z: 0.38, dot: 0.12, dash: 0.36, gi: 0.05, gl: 0.18 },
    watch: { x: -0.45, y: 0.9, z: 0.2, dot: 0.025, dash: 0.07, gi: 0.012, gl: 0.035 },   // смужка ≈ 53 см просто над годинником на столі (CLK)
  };

  /* ── Морзе: елементи з часом у тактах і місцем на підлозі ── */
  function encode(text, lay) {
    const els = []; let t = 0, x = lay.x;
    const letters = [...text];
    letters.forEach((L, li) => {
      const code = MORSE[L];
      [...code].forEach((c, ei) => {
        const d = c === '.' ? 1 : 3, len = c === '.' ? lay.dot : lay.dash;
        els.push({ L, li, c, t0: t * U, t1: (t + d) * U, x: x + len / 2, len });
        t += d; x += len;
        if (ei < code.length - 1) { t += 1; x += lay.gi; }
      });
      if (li < letters.length - 1) { t += 3; x += lay.gl; }
    });
    return { els, total: t * U, units: t };
  }

  /* ── розмітка ── */
  root.innerHTML = `
  <div class="tss">
    <div class="tss-stage" tabindex="0" aria-label="Коридор часу: стрілки вліво-вправо — рік">
      <div class="tss-hud"><span>зріз кімнати Мерф</span><b class="tss-y">рік +0</b><span class="tss-n"></span></div>
      <div class="tss-tick" aria-live="polite"></div>
      <span class="tss-off">тесеракт не утворився — петля не замикається</span><span class="tss-cap">тягніть уліво-вправо — рух уздовж часу</span>
      <div class="tss-film-cap" aria-live="polite"></div>
      <div class="tss-cover"><b class="tss-cover-t">Тесеракт і петля причинності</b><span class="tss-cover-s">ролик ≈ 1 хв: як Купер передає повідомлення в минуле і чому воно не змінює історію</span>
        <div class="tss-cover-b"><button type="button" class="tss-film-play">▶ Дивитися ролик</button><button type="button" class="tss-film-try">Спробувати самому</button></div></div>
    </div>
    <div class="tss-film-bar" hidden><button type="button" class="tss-film-pp" aria-label="Пауза">❚❚</button><div class="tss-film-ch" role="group" aria-label="Глави ролика"></div><button type="button" class="tss-film-skip">Пропустити ролик</button></div>
    <div class="tss-ctl">
      <div class="seg tss-msg" role="group" aria-label="Повідомлення">
        <button type="button" data-m="STAY" aria-pressed="true">STAY</button><button type="button" data-m="GO" aria-pressed="false">GO</button><button type="button" data-m="DATA" aria-pressed="false">дані</button>
      </div>
      <label class="tss-yr"><span>рік</span><input type="range" min="0" max="${N - 1}" step="1" value="0" aria-label="Рік кімнати"><output>+0</output></label>
      <button type="button" class="tss-go">Передати</button>
      <button type="button" class="tss-sw" aria-pressed="false"><i></i>Захист хронології</button>
    </div>
    <div class="tss-grid">
      <div class="tss-pan"><div class="tss-h">Азбука Морзе</div><div class="tss-mo"></div><p class="tss-code"></p><p class="tss-v"></p></div>
      <div class="tss-pan"><div class="tss-h">Граф причин</div>${graphSVG()}</div>
    </div>
    <p class="chint">Буквально змодельовано кодування азбукою Морзе (міжнародний код) і граф причин. За сюжетом фільму: знак STAY із книжок у день від'їзду Купера і дані через секундну стрілку годинника; роки зрізів умовні, а «дані» — лише слово-замінник, справжніх чисел фільм не показує. Принцип самоузгодженості Новікова й захист хронології Гокінга — гіпотези фізиків, жодну не доведено. Годинник — власна модель (не копія з фільму), стрілки показують живий час; у лупі — циферблат обраного зрізу. Тесеракт тут — абстрактна схема, не кадр із фільму.</p>
  </div>`;

  const $ = s => root.querySelector(s);
  const stage = $('.tss-stage'), hudY = $('.tss-y'), hudN = $('.tss-n'), tick = $('.tss-tick');
  const range = $('.tss-yr input'), out = $('.tss-yr output'), goBtn = $('.tss-go'), sw = $('.tss-sw');
  const moBox = $('.tss-mo'), codeP = $('.tss-code'), verdict = $('.tss-v'), svg = $('.tss-g');
  const msgBtns = [...root.querySelectorAll('.tss-msg button')];

  let msgKey = 'STAY', guard = false, target = 0, cur = 0;
  let tx = null;          // поточна передача
  let muteSnd = false;    // тиша, коли передачу «прокручують» до результату (перехід на главу ролика)
  let outcome = null;     // 'ok' | 'bad' | null — результат останньої передачі

  /* ── граф причин ── */
  function graphSVG() {
    const nd = (id, x, y) => `<g class="nd" data-n="${id}" transform="translate(${x} ${y})"><rect x="-76" y="-23" width="152" height="46" rx="10"/><text y="-3"></text><text y="13"></text></g>`;
    const mk = (id, c) => `<marker id="tss-m${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
    return `<svg class="tss-g" viewBox="0 0 400 300" role="img" aria-label="Граф причин: чотири події, з'єднані в коло">
      <defs>${mk('g', 'var(--rule-2)')}${mk('a', 'var(--act)')}${mk('r', 'var(--signal-ink,#D62839)')}</defs>
      <path class="ed" data-e="0" d="M276 42 Q322 42 322 122"/>
      <path class="ed" data-e="1" d="M322 178 Q322 258 276 258"/>
      <path class="ed" data-e="2" d="M124 258 Q78 258 78 178"/>
      <path class="ed" data-e="3" d="M78 122 Q78 42 124 42"/>
      <g class="x" data-x="1"><path d="M300 202l14 14M314 202l-14 14"/></g>
      <g class="x" data-x="3"><path d="M86 70l14 14M100 70l-14 14"/></g>
      ${nd(0, 200, 42)}${nd(1, 322, 150)}${nd(2, 200, 258)}${nd(3, 78, 150)}
      <text class="ctr" x="200" y="148">?</text><text class="sub" x="200" y="166"></text>
    </svg>`;
  }
  const NODES = {
    STAY: [['Мерф бачить', 'знак STAY'], ['Купер усе одно', 'летить'], ['Купер', 'у тесеракті'], ['Купер посилає', 'STAY']],
    GO: [['Мерф бачить', 'знак STAY'], ['Купер усе одно', 'летить'], ['Купер', 'у тесеракті'], ['Купер посилає', 'GO']],
    DATA: [['Мерф читає', 'дані з годинника'], ['люди рятуються', 'із Землі'], ['«вони» будують', 'тесеракт'], ['Купер передає', 'дані']],
  };
  const nodes = [...svg.querySelectorAll('.nd')], edges = [...svg.querySelectorAll('.ed')];
  const xs = { 1: svg.querySelector('[data-x="1"]'), 3: svg.querySelector('[data-x="3"]') };
  const ctr = svg.querySelector('.ctr'), sub = svg.querySelector('.sub');
  let graphTimers = [];

  function setGraph(state) {   // state: idle | ok | bad | guard
    graphTimers.forEach(clearTimeout); graphTimers = [];
    NODES[msgKey].forEach((t, i) => { const tt = nodes[i].querySelectorAll('text'); tt[0].textContent = t[0]; tt[1].textContent = t[1]; });
    nodes.forEach(n => n.classList.remove('on', 'dead'));
    edges.forEach(e => { e.classList.remove('on', 'brk'); e.style.stroke = ''; e.setAttribute('marker-end', 'url(#tss-mg)'); });
    Object.values(xs).forEach(x => x.classList.remove('on'));
    ctr.setAttribute('class', 'ctr');
    const brk = state === 'bad' ? 3 : state === 'guard' ? 1 : -1;
    if (state === 'idle') { ctr.textContent = '?'; sub.textContent = 'замкнеться?'; return; }
    if (brk >= 0) {
      edges[brk].classList.add('brk'); edges[brk].setAttribute('marker-end', 'url(#tss-mr)'); xs[brk].classList.add('on');
      ctr.textContent = state === 'bad' ? 'розрив' : 'обрив'; ctr.classList.add('bad');
      sub.textContent = state === 'bad' ? 'не сходиться' : 'без тесеракта';
      if (state === 'guard') { nodes[2].classList.add('dead'); nodes[3].classList.add('dead'); }
      else nodes.forEach((n, i) => i !== 3 && n.classList.add('on'));
      if (state === 'bad') [0, 1, 2].forEach(i => { edges[i].style.stroke = 'var(--act)'; edges[i].setAttribute('marker-end', 'url(#tss-ma)'); });
      return;
    }
    // ok: коло загоряється по черзі, а потім «тече»
    ctr.textContent = 'петля'; ctr.classList.add('ok'); sub.textContent = 'без початку';
    const step = RM ? 0 : 260;
    for (let i = 0; i < 4; i++) {
      const f = () => { nodes[i].classList.add('on'); edges[i].classList.add('on'); edges[i].setAttribute('marker-end', 'url(#tss-ma)'); };
      step ? graphTimers.push(setTimeout(f, i * step)) : f();
    }
  }

  const TXT = {
    idle: () => `Купер діє з тесеракту на обраний рік кімнати. Оберіть повідомлення й натисніть «Передати».`,
    play: () => `Передаю «${MSG[msgKey].text}»: ${MSG[msgKey].kind === 'books' ? 'стрілка смикається, книжки падають точками й тире' : 'секундна стрілка смикається в такт коду'}…`,
    okSTAY: () => `<b>Історія узгоджена.</b> Мерф бачила саме STAY. Це петля бутстрапа: Купер посилає знак, бо його колись побачила Мерф, — у знака немає першої причини.`,
    okDATA: () => `<b>Узгоджено.</b> Мерф прочитала саме ці дані, з них люди врятувалися й збудували тесеракт, через який дані й прийшли. У інформації в петлі теж немає автора.`,
    bad: () => `<b>Мерф бачила STAY, а не GO — така історія не сходиться.</b> Принцип самоузгодженості (Новіков, 1980-ті): у світі з петлями часу можливі лише події, узгоджені самі з собою. Тож спроба змінити минуле мусить зірватися — книжки повертаються на полицю.`,
    guard: () => `<b>Захист хронології (Гокінг, 1992).</b> За гіпотезою, квантові ефекти руйнують машину часу до того, як вона утвориться. Тесеракта немає — петля не замикається, передавати нікому. Це гіпотеза, не доведено.`,
  };
  function setVerdict(kind) {
    verdict.className = 'tss-v' + (kind.startsWith('ok') ? ' ok' : kind === 'bad' ? ' bad' : kind === 'guard' ? ' guard' : '');
    verdict.innerHTML = TXT[kind]();
  }

  /* ── рядок Морзе (панель і табло в сцені) ── */
  let moEls = [], tickSpans = [];
  function buildMorse() {
    const m = MSG[msgKey], enc = encode(m.text, LAY[m.kind]);
    moBox.innerHTML = [...m.text].map((L, li) => `<span class="tss-l"><b>${L}</b>${[...MORSE[L]].map(c => `<i class="${c === '-' ? 'h' : ''}"></i>`).join('')}</span>`).join('');
    moEls = [...moBox.querySelectorAll('i')];
    codeP.textContent = `${[...m.text].map(L => MORSE[L].replace(/\./g, '·').replace(/-/g, '−')).join('   ')}  ·  ${enc.units} тактів, ${enc.total.toFixed(1)} с`;
    tick.innerHTML = [...m.text].map(L => `<span>${MORSE[L].replace(/\./g, '·').replace(/-/g, '−')}</span>`).join(' ') + `<small>${m.text === 'DATA' ? 'дані (умовно)' : m.text}</small>`;
    tickSpans = [...tick.querySelectorAll('span')];
    return enc;
  }
  function markMorse(k, li, done) {
    moEls.forEach((e, i) => { e.classList.toggle('on', i === k && !done); e.classList.toggle('done', i < k || (done && i <= k)); });
    tickSpans.forEach((s, i) => { s.classList.toggle('on', i === li && !done); s.classList.toggle('done', i < li || (done && i <= li)); });
  }

  function setYear(v, instant) {
    target = Math.max(0, Math.min(N - 1, v));
    const r = Math.round(target);
    range.value = r; out.textContent = '+' + r;
    hudY.textContent = 'рік +' + r;
    hudN.textContent = r === 0 ? 'день від\'їзду Купера · тут Мерф бачила STAY' : r === N - 1 ? 'Мерф повертається по годинник (умовно)' : '';
    if (instant || RM) cur = target;
    kick();
  }

  /* ── 3D ── */
  let three = null;
  try { three = build3D(); } catch (e) { three = null; }
  if (!three) {
    const f = document.createElement('div'); f.className = 'fail';
    f.textContent = 'Тут мала бути 3D-сцена коридору часу, але браузер не дав WebGL. Головоломка нижче працює й без неї.';
    stage.appendChild(f);
  }

  function build3D() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x04050a, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
    stage.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x04050a, 6, 30);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
    // постобробка: світіння ліній (bloom), ACES, віньєтка й зерно
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .3, .5); composer.addPass(bloom);
    composer.addPass(new OutputPass()); const grade = gradePass({ vignette: .45, grain: .05, ca: 1.6, sat: 1.1, tint: [.98, 1, 1.04] }); composer.addPass(grade);

    const ACT = new THREE.Color(0xEA5212), BASE = new THREE.Color(0x6f86b8), ROOM = new THREE.Color(0xa9b8d8),
      RED = new THREE.Color(0xD62839), GHOST = new THREE.Color(0x8fb3ff), WHITE = new THREE.Color(0xffffff);
    const zOf = i => -i * S;

    /* геометрія кімнати: ребра полиці, стола; рамка зрізу */
    const pos = [];
    const box = (cx, cy, cz, w, h, d) => {
      const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, z0 = cz - d / 2, z1 = cz + d / 2;
      const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => pos.push(...v[a], ...v[b]));
    };
    box(-1.2, 1.28, -0.1, 1.64, 0.04, 0.36); box(-1.2, 1.9, -0.1, 1.64, 0.04, 0.36);
    box(-2.02, 1.59, -0.1, 0.04, 0.66, 0.36); box(-0.38, 1.59, -0.1, 0.04, 0.66, 0.36);
    pos.push(-2.2, 0, 0.55, 2.2, 0, 0.55);                                  // лінія підлоги
    const roomGeo = new THREE.BufferGeometry(); roomGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const frameGeo = new THREE.BufferGeometry();
    frameGeo.setAttribute('position', new THREE.Float32BufferAttribute([-2.2, 0, 0, 2.2, 0, 0, 2.2, 0, 0, 2.2, 2.8, 0, 2.2, 2.8, 0, -2.2, 2.8, 0, -2.2, 2.8, 0, -2.2, 0, 0], 3));
    const fillGeo = new THREE.PlaneGeometry(4.4, 2.8); fillGeo.translate(0, 1.4, 0);
    const CLK = new THREE.Vector3(-0.18, 0.78, 0.2);      // годинник лежить на стільниці столу з моделі кімнати (верх столу y = 0.78)

    /* ── годинник Мерф: кишеньковий годинник Poly Haven (CC0, assets/interstellar/pocket-watch.glb) ──
       Стрілки в моделі — окремі деталі з віссю в центрі циферблата, тож крутимо саме їх. Циферблат дивиться вздовж +Z моделі,
       «12» — уздовж +Y. Якщо GLB не завантажився — процедурний годинник із власними стрілками. */
    const WATCH = {
      url: 'assets/interstellar/pocket-watch.glb', scale: 1.5,               // метри моделі → одиниці сцени; майже справжній розмір (≈ 9 см), трохи крупніше, щоб читався
      center: new THREE.Vector3(0, 0, 0),                                     // центр циферблата (вісь стрілок) у координатах моделі
      normal: new THREE.Vector3(0, 0, 1),                                     // нормаль циферблата
      up12: new THREE.Vector3(0, 1, 0),                                       // напрям на «12»
      r: 0.025, lift: 0.0035,                                                 // радіус циферблата; висота стрілок процедурного годинника
      lay: -72 * Math.PI / 180,                                               // лежить на столі, циферблат трохи до камери
      hands: { hh: ['pocket_watch_hand_hours', 147.1], mh: ['pocket_watch_hand_minutes', -54.5], sh: ['pocket_watch_hand_secondes', 29.7] },  // кут стрілки в моделі, ° за годинниковою від «12»
    };
    const dialQ = (() => { const x = new THREE.Vector3().crossVectors(WATCH.up12, WATCH.normal).normalize(); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, WATCH.up12, WATCH.normal)); })();
    const handGeo = (w, l, back) => { const g = new THREE.PlaneGeometry(w, l + back); g.translate(0, (l - back) / 2, 0); return g; };
    const H_GEO = handGeo(0.0036, 0.016, 0.004), M_GEO = handGeo(0.0028, 0.025, 0.004), S_GEO = handGeo(0.0011, 0.028, 0.007);
    const DISC_GEO = new THREE.CircleGeometry(WATCH.r * 0.97, 48), HUB_GEO = new THREE.CircleGeometry(0.0022, 16);
    const watchSrc = { mesh: null };                                             // меш із GLB (спільна геометрія/текстура на всі зрізи)
    function makeWatch(fallback) {
      const g = new THREE.Group(), inner = new THREE.Group(), mats = [];
      inner.position.copy(WATCH.center).negate(); g.add(inner);            // обертаємо навколо центра циферблата
      if (watchSrc.mesh && !fallback) {
        const m = watchSrc.mesh.clone(true), cache = new Map();
        m.traverse((o) => { if (!o.isMesh) return; const one = (x) => { if (!cache.has(x)) { const c = x.clone(); c.userData.o0 = x.transparent ? x.opacity : 1; c.transparent = true; cache.set(x, c); mats.push(c); } return cache.get(x); };
          o.material = Array.isArray(o.material) ? o.material.map(one) : one(o.material); });
        inner.add(m);
        const hands = {};
        for (const [k, [name, a0]] of Object.entries(WATCH.hands)) {
          const n = m.getObjectByName(name); if (!n) continue;
          const pv = new THREE.Group(); pv.position.copy(n.position); n.parent.add(pv); n.position.set(0, 0, 0); n.rotation.z = a0 * Math.PI / 180; pv.add(n);
          hands[k] = pv;
        }
        const sn = m.getObjectByName(WATCH.hands.sh[0]), secMat = sn && sn.isMesh ? sn.material.clone() : null;
        // секундна — підсвічена кольором дії статті: власне світіння, щоб читалась і на загальному плані, і в лупі
        if (secMat) { secMat.userData.o0 = 1; secMat.map = null; secMat.color.set(0xff6a2a); if (secMat.emissive) { secMat.emissive.set(0xff5a1a); secMat.emissiveIntensity = 1.6; } secMat.needsUpdate = true; sn.material = secMat; mats.push(secMat); }
        g.scale.setScalar(WATCH.scale); g.rotation.x = WATCH.lay; g.position.copy(CLK);
        g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); g.position.y += CLK.y - bb.min.y;
        const nop = new THREE.Object3D(), disc = new THREE.Mesh(DISC_GEO, new THREE.MeshBasicMaterial({ visible: false }));
        return { g, inner, mats, hh: hands.hh || nop, mh: hands.mh || nop, sh: hands.sh || nop, disc, discA: 0, secMat, secC: secMat ? secMat.color.clone() : null };
      } else {                                                                   // процедурний: корпус, циферблат, ремінець
        const caseMat = new THREE.MeshStandardMaterial({ color: 0xd9d9d6, metalness: .8, roughness: .35, transparent: true });
        const strapMat = new THREE.MeshStandardMaterial({ color: 0x6b3f22, roughness: .9, transparent: true });
        const dialMat = new THREE.MeshStandardMaterial({ color: 0xf1e9d4, roughness: .7, transparent: true });
        mats.push(caseMat, strapMat, dialMat);
        const cs = new THREE.Mesh(new THREE.CylinderGeometry(WATCH.r + .006, WATCH.r + .006, .009, 48), caseMat);
        cs.position.copy(WATCH.center); cs.quaternion.copy(dialQ); cs.rotateX(Math.PI / 2); cs.translateY(.0045); inner.add(cs);
        const dl = new THREE.Mesh(new THREE.CircleGeometry(WATCH.r, 48), dialMat); dl.position.copy(WATCH.center); dl.quaternion.copy(dialQ); dl.translateZ(.0005); inner.add(dl);
        [1, -1].forEach(sg => { const st = new THREE.Mesh(new THREE.BoxGeometry(.11, .003, .022), strapMat); st.position.copy(WATCH.center).addScaledVector(WATCH.up12, sg * .085).addScaledVector(WATCH.normal, -.006); st.quaternion.copy(dialQ); st.rotateX(Math.PI / 2); inner.add(st); });
      }
      // диск-«скло» над намальованими стрілками + власні стрілки
      const discMat = new THREE.MeshBasicMaterial({ color: 0x9c9382, transparent: true, depthWrite: false }); mats.push(discMat);
      const disc = new THREE.Mesh(DISC_GEO, discMat); disc.position.copy(WATCH.center).addScaledVector(WATCH.normal, WATCH.lift * .6); disc.quaternion.copy(dialQ); inner.add(disc);
      const dial = new THREE.Group(); dial.position.copy(WATCH.center).addScaledVector(WATCH.normal, WATCH.lift); dial.quaternion.copy(dialQ); inner.add(dial);
      const hmMat = new THREE.MeshBasicMaterial({ color: 0x1b1b1f, transparent: true, side: THREE.DoubleSide }), secMat = new THREE.MeshBasicMaterial({ color: 0xd62839, transparent: true, side: THREE.DoubleSide });
      mats.push(hmMat, secMat);
      const hh = new THREE.Mesh(H_GEO, hmMat), mh = new THREE.Mesh(M_GEO, hmMat), sh = new THREE.Mesh(S_GEO, secMat), hub = new THREE.Mesh(HUB_GEO, secMat);
      mh.position.z = .0006; sh.position.z = .0012; hub.position.z = .0014; dial.add(hh, mh, sh, hub);
      g.scale.setScalar(WATCH.scale); g.rotation.x = WATCH.lay; g.position.copy(CLK);
      g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); g.position.y += CLK.y - bb.min.y;   // поставити на стільницю
      return { g, inner, mats, hh, mh, sh, dial, disc, discA: 0, secMat, secC: RED.clone() };
    }
    // меблі кімнати (GLB): стіл із надбудовою, стілець, ліжко — одна геометрія/текстура, 24 копії з власною прозорістю
    scene.add(new THREE.HemisphereLight(0x9fb8ff, 0x1a1626, 1.1));
    const key = new THREE.DirectionalLight(0xffe0c0, 1.6); key.position.set(3, 5, 4); scene.add(key);
    new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'))
      .load('assets/interstellar/murph-room.glb', (g) => {
        let src = null; g.scene.traverse((o) => { if (o.isMesh && !src) src = o; }); if (!src) return;
        slices.forEach((s) => { const mat = src.material.clone(); mat.transparent = true; mat.opacity = 0; mat.roughness = .85;
          const m = new THREE.Mesh(src.geometry, mat); m.scale.setScalar(.85); m.position.set(.7, 0, -.1); s.g.add(m); s.model = m; });
        kick();
      }, undefined, () => {});
    const slices = [];
    for (let i = 0; i < N; i++) {
      const g = new THREE.Group(); g.position.z = zOf(i);
      const tr = { transparent: true, depthWrite: false };
      const frame = new THREE.LineSegments(frameGeo, new THREE.LineBasicMaterial({ color: BASE, ...tr }));
      const fill = new THREE.Mesh(fillGeo, new THREE.MeshBasicMaterial({ color: BASE, side: THREE.DoubleSide, opacity: 0.03, ...tr }));
      const room = new THREE.LineSegments(roomGeo, new THREE.LineBasicMaterial({ color: ROOM, ...tr }));
      const watch = makeWatch(true); g.add(watch.g);
      const lbl = label(`+${i}`); lbl.position.set(-1.75, 3.05, 0);
      g.add(fill, frame, room, lbl);
      scene.add(g);
      slices.push({ g, frame, fill, room, watch, lbl, off: 0, flash: 0, flashC: ACT });
    }
    new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'))
      .load(WATCH.url, (gl) => {
        watchSrc.mesh = gl.scene;
        slices.forEach((s) => { s.g.remove(s.watch.g); s.watch = makeWatch(false); s.g.add(s.watch.g); });
        kick();
      }, undefined, () => {});
    function label(t) {
      const c = document.createElement('canvas'); c.width = 192; c.height = 64;
      const x = c.getContext('2d'); x.font = '600 40px "Roboto Mono", ui-monospace, monospace'; x.fillStyle = '#fff'; x.textBaseline = 'middle';
      x.fillText(t, 4, 34);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      s.scale.set(0.75, 0.25, 1); return s;
    }

    /* книжки — один InstancedMesh на всі зрізи */
    const bookGeo = new THREE.BoxGeometry(0.1, 0.42, 0.26);
    const books = new THREE.InstancedMesh(bookGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), N * NB);
    const PAL = ['#c9a87a', '#7f97c4', '#b8786a', '#76a596', '#d6cbb4', '#9884bc', '#c6926a', '#6d8fb0'].map(c => new THREE.Color(c));
    const bk = [];
    const qUp = new THREE.Quaternion(), qLie = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) for (let b = 0; b < NB; b++) {
      const h = 0.3 + rnd() * 0.16, sy = h / 0.42;
      const home = { p: new THREE.Vector3(-1.93 + b * 0.128, 1.3 + h / 2, -0.1 + (rnd() - 0.5) * 0.04), q: qUp.clone(), s: new THREE.Vector3(1, sy, 1) };
      bk.push({ i, home, p: home.p.clone(), q: home.q.clone(), s: home.s.clone(), col: PAL[Math.floor(rnd() * PAL.length)], anim: null });
    }
    const M = new THREE.Matrix4(), tmpC = new THREE.Color(), V = new THREE.Vector3();
    const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
    const pastVis = i => i < cur ? Math.max(0, 1 - (cur - i) * 1.6) : 1;   // зрізи між камерою й обраним — гаснуть, щоб не заступати
    function writeBook(k) { const o = bk[k]; if (o.hid) return; V.copy(o.p); V.z += zOf(o.i); M.compose(V, o.q, o.s); books.setMatrixAt(k, M); }
    bk.forEach((_, k) => writeBook(k));
    scene.add(books);

    /* «пам'ять» Мерф: контури того, що вона бачила (STAY на підлозі, дані над столом) */
    const ghosts = {};
    for (const [si, word] of Object.entries(HIST)) {
      const kind = word === 'STAY' ? 'books' : 'watch', lay = LAY[kind], enc = encode(word, lay);
      const gp = [];
      enc.els.forEach(e => {
        const hy = kind === 'books' ? 0.05 : 0.025, hz = kind === 'books' ? 0.13 : 0.02, x0 = e.x - e.len / 2, x1 = e.x + e.len / 2;
        const y0 = lay.y - hy, y1 = lay.y + hy, z0 = lay.z - hz, z1 = lay.z + hz;
        [[x0, y0, z1, x1, y0, z1], [x1, y0, z1, x1, y1, z1], [x1, y1, z1, x0, y1, z1], [x0, y1, z1, x0, y0, z1],
         [x0, y1, z0, x1, y1, z0], [x0, y1, z0, x0, y1, z1], [x1, y1, z0, x1, y1, z1]].forEach(s => gp.push(...s));
      });
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
      const ln = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: GHOST, transparent: true, depthWrite: false }));
      slices[si].g.add(ln);
      ghosts[si] = { ln, word, glow: 0, glowC: ACT };
    }

    /* слід даних на годиннику: світлі мітки над столом, з'являються в такт */
    const marks = [];
    {
      const enc = encode('DATA', LAY.watch), mat = new THREE.MeshBasicMaterial({ color: ACT, transparent: true, depthWrite: false });
      enc.els.forEach(e => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(e.len, 0.018, 0.018), mat);
        m.position.set(e.x, LAY.watch.y, LAY.watch.z); m.scale.setScalar(0.001);
        slices[N - 1].g.add(m); marks.push({ m, a: 0, to: 0 });
      });
    }

    /* струни часу: світні лінії крізь усі зрізи + частинки, що течуть уздовж них */
    const anchors = [[-2.2, 0], [2.2, 0], [2.2, 2.8], [-2.2, 2.8], [-2.02, 1.28], [-0.38, 1.28], [-2.02, 1.92], [-0.38, 1.92],
      [0.4, 0.745], [1.8, 0.745], [0.02, 0.86], [0, 2.8], [0, 0], [-2.2, 1.4], [2.2, 1.4]];
    for (let k = 0; k < 8; k++) anchors.push([-2 + rnd() * 4, 0.2 + rnd() * 2.5]);
    const z0 = 2.5, z1 = zOf(N - 1) - 3;
    const sp = []; anchors.forEach(([x, y]) => sp.push(x, y, z0, x, y, z1));
    const strGeo = new THREE.BufferGeometry(); strGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const strMat = new THREE.LineBasicMaterial({ color: 0x4f74c4, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.LineSegments(strGeo, strMat));
    const NP = 220, pp = new Float32Array(NP * 3), pa = [];
    for (let k = 0; k < NP; k++) { const a = anchors[k % anchors.length]; pa.push({ a, z: z0 + rnd() * (z1 - z0), v: 0.6 + rnd() * 1.4 }); }
    const ptGeo = new THREE.BufferGeometry(); ptGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const dot = document.createElement('canvas'); dot.width = dot.height = 32;
    { const x = dot.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(170,200,255,.6)'); gr.addColorStop(1, 'rgba(170,200,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); }
    const ptMat = new THREE.PointsMaterial({ size: 0.11, map: new THREE.CanvasTexture(dot), color: 0xbfd4ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.Points(ptGeo, ptMat));
    function flowPts(dt) {
      for (let k = 0; k < NP; k++) {
        const o = pa[k]; o.z -= o.v * dt; if (o.z < z1) o.z = z0;
        pp[k * 3] = o.a[0]; pp[k * 3 + 1] = o.a[1]; pp[k * 3 + 2] = o.z;
      }
      ptGeo.attributes.position.needsUpdate = true;
    }
    flowPts(0);

    /* лупа: макрокамера над циферблатом обраного зрізу → невелика текстура → круг у куті з м'яким краєм (мала глибина різкості) */
    const LUPE_PX = 320;
    const rtLupe = new THREE.WebGLRenderTarget(LUPE_PX, LUPE_PX, { samples: 0 });
    const macroCam = new THREE.PerspectiveCamera(30, 1, 0.02, 10);
    const lupeMat = new THREE.ShaderMaterial({
      uniforms: { tD: { value: rtLupe.texture }, uA: { value: 1 } }, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `uniform sampler2D tD; uniform float uA; varying vec2 vUv;
        void main(){
          vec2 q = vUv - .5; float r = length(q) * 2.;
          float k = smoothstep(.35, 1., r) * 6. / 320.;                       // різко в центрі, розмито до краю
          vec4 c = texture2D(tD, vUv) * 2.;
          c += texture2D(tD, vUv + vec2(k, 0.)) + texture2D(tD, vUv - vec2(k, 0.)) + texture2D(tD, vUv + vec2(0., k)) + texture2D(tD, vUv - vec2(0., k));
          c += texture2D(tD, vUv + vec2(k, k) * .7) + texture2D(tD, vUv - vec2(k, k) * .7) + texture2D(tD, vUv + vec2(k, -k) * .7) + texture2D(tD, vUv - vec2(k, -k) * .7);
          c /= 10.; c.rgb *= .7 * (1. - .35 * smoothstep(.6, 1., r));
          float ring = (1. - smoothstep(.965, .985, r)) * smoothstep(.93, .945, r);
          c.rgb = mix(c.rgb, vec3(.85, .88, 1.), ring * .8);
          gl_FragColor = vec4(c.rgb, uA * (1. - smoothstep(.985, 1., r)));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    const hudScene = new THREE.Scene(), hudCam = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);
    const lupe = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lupeMat); hudScene.add(lupe);
    const lupeEl = document.createElement('span'); lupeEl.className = 'tss-lupe'; stage.appendChild(lupeEl);
    const mv = new THREE.Vector3(), mn = new THREE.Vector3(), mu = new THREE.Vector3(), ms = new THREE.Vector3();
    // під час передачі даних: ореол навколо годинника на столі й тонка лінія від нього до лупи — у лупі той самий годинник
    const link = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); link.setAttribute('class', 'tss-link'); link.setAttribute('aria-hidden', 'true');
    link.innerHTML = '<circle r="14"/><line/>'; stage.appendChild(link);
    const lkC = link.querySelector('circle'), lkL = link.querySelector('line'); let lkA = 0;
    function renderLupe(w, h) {
      const si = Math.max(0, Math.min(N - 1, Math.round(cur))), wt = slices[si].watch;
      wt.inner.updateWorldMatrix(true, false);
      mv.copy(WATCH.center).applyMatrix4(wt.inner.matrixWorld);
      mn.copy(WATCH.normal).transformDirection(wt.inner.matrixWorld); mu.copy(WATCH.up12).transformDirection(wt.inner.matrixWorld);
      const dist = WATCH.r * wt.g.scale.x * 4.4;
      macroCam.position.copy(mv).addScaledVector(mn, dist); macroCam.up.copy(mu); macroCam.lookAt(mv);
      const keep = slices.map(s => s.g.visible); slices.forEach((s, i) => { s.g.visible = i === si; });   // у лупі — лише обраний зріз
      marks.forEach(mk => { mk.m.visible = false; });                    // риски Морзе висять над годинником — у лупі вони стали б між камерою й циферблатом
      renderer.setRenderTarget(rtLupe); renderer.setClearColor(0x04050a, 1); renderer.clear(); renderer.render(scene, macroCam); renderer.setRenderTarget(null);
      slices.forEach((s, i) => { s.g.visible = keep[i]; }); marks.forEach(mk => { mk.m.visible = true; });
      const d = Math.min(170, Math.round(Math.min(w, h) * 0.36)), m = 14;
      lupe.scale.set(d / w, d / h, 1); lupe.position.set(1 - (m + d / 2) / w, (m + d / 2) / h, 0);
      lupeMat.uniforms.uA.value = fade;
      renderer.autoClear = false; renderer.render(hudScene, hudCam); renderer.autoClear = true;
      lupeEl.style.right = m + 'px'; lupeEl.style.bottom = (m + d + 4) + 'px'; lupeEl.textContent = `лупа · секундна стрілка · рік +${si}`;
      lupeEl.style.opacity = fade.toFixed(2);
      lkA += ((tx && tx.m.kind === 'watch' ? 1 : 0) - lkA) * (RM ? 1 : .08);
      link.style.opacity = (lkA * fade).toFixed(3);
      if (lkA > .01) { const wt2 = slices[N - 1].watch; wt2.inner.updateWorldMatrix(true, false); ms.copy(WATCH.center).applyMatrix4(wt2.inner.matrixWorld).project(camera);
        const sx = (ms.x * .5 + .5) * w, sy = (-ms.y * .5 + .5) * h, lx = w - m - d / 2, ly = h - m - d / 2, ang = Math.atan2(sy - ly, sx - lx);
        lkC.setAttribute('cx', sx); lkC.setAttribute('cy', sy); lkC.setAttribute('r', (10 + 4 * Math.sin(performance.now() / 260)).toFixed(1));
        lkL.setAttribute('x1', sx + 14 * Math.cos(ang + Math.PI)); lkL.setAttribute('y1', sy + 14 * Math.sin(ang + Math.PI));
        lkL.setAttribute('x2', lx + d / 2 * Math.cos(ang)); lkL.setAttribute('y2', ly + d / 2 * Math.sin(ang)); }
    }

    let fade = 1, tSec = 0;
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.fov = w < h ? 62 : 48; camera.updateProjectionMatrix();
    }
    new ResizeObserver(() => { resize(); kick(); }).observe(stage);
    resize();

    function startFall(k, el, lay) {
      const o = bk[k];
      o.anim = { t: 0, dur: RM ? 0 : 0.75, from: { p: o.p.clone(), q: o.q.clone(), s: o.s.clone() },
        to: { p: new THREE.Vector3(el.x, lay.y, lay.z), q: qLie.clone(), s: new THREE.Vector3(1, el.len / 0.42, 1) }, arc: 0.12 };
    }
    function startReturn(k, delay) {
      const o = bk[k];
      o.anim = { t: RM ? 0 : -delay, dur: RM ? 0 : 0.9, from: { p: o.p.clone(), q: o.q.clone(), s: o.s.clone() },
        to: { p: o.home.p.clone(), q: o.home.q.clone(), s: o.home.s.clone() }, arc: 0.35 };
    }
    function resetSlice(si) {
      for (let b = 0; b < NB; b++) { const k = si * NB + b, o = bk[k]; o.anim = null; o.p.copy(o.home.p); o.q.copy(o.home.q); o.s.copy(o.home.s); writeBook(k); }
      books.instanceMatrix.needsUpdate = true;
      if (si === N - 1) marks.forEach(m => { m.a = 0; m.to = 0; m.m.scale.setScalar(0.001); });
    }

    const ease = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    function stepBooks(dt) {
      let moved = false;
      for (let k = 0; k < bk.length; k++) {
        const o = bk[k], a = o.anim; if (!a) continue;
        a.t += dt; if (a.t < 0) { moved = true; continue; }
        const u = a.dur ? Math.min(1, a.t / a.dur) : 1, e = ease(u);
        o.p.lerpVectors(a.from.p, a.to.p, e);
        o.p.y = a.from.p.y + (a.to.p.y - a.from.p.y) * (u * u) + Math.sin(Math.PI * u) * a.arc;
        o.q.slerpQuaternions(a.from.q, a.to.q, e);
        o.s.lerpVectors(a.from.s, a.to.s, e);
        writeBook(k); books.instanceMatrix.needsUpdate = true; moved = true;
        if (u >= 1) o.anim = null;
      }
      if (moved) books.instanceMatrix.needsUpdate = true;
      return moved;
    }

    function frame(dt) {
      tSec += dt;
      cur = RM ? target : cur + (target - cur) * (1 - Math.exp(-dt * 5));
      const fT = guard ? 0.14 : 1; fade = RM ? fT : fade + (fT - fade) * (1 - Math.exp(-dt * 3));
      const zc = zOf(cur), narrow = camera.aspect < 1;
      const sw = RM ? 0 : 1, sx = .08 * Math.sin(tSec * .23) * sw, sy = .05 * Math.sin(tSec * .17 + 1.) * sw;   // ледь помітне «дихання» камери
      if (narrow) { camera.position.set(1.5 + sx, 2.0 + sy, zc + 6.4); camera.lookAt(0, 1.25, zc - 0.6); }
      else { camera.position.set(3.1 + sx, 2.15 + sy, zc + 5.3); camera.lookAt(-0.15, 1.15, zc - 1.2); }
      // живий час: година, хвилина, секунда (крок раз на секунду); gOff — ривок Морзе з передачі
      const now = new Date(), secI = now.getSeconds(), minI = now.getMinutes(), hrI = now.getHours() % 12;
      const secA = RM ? 0 : secI * Math.PI / 30, minA = (minI + secI / 60) * Math.PI / 30, hourA = (hrI + minI / 60) * Math.PI / 6;
      let gOff = 0; for (let i = 0; i < N; i++) gOff = Math.max(gOff, slices[i].off);

      for (let i = 0; i < N; i++) {
        const s = slices[i], d = Math.abs(i - cur), sel = Math.max(0, 1 - d), vis = pastVis(i);
        s.g.visible = vis > 0.01;
        const w = (d < 0.5 ? 1 : Math.max(0.07, 0.6 * Math.exp(-(d - 0.5) / 2.6))) * fade * vis;
        s.flash = Math.max(0, s.flash - dt * 1.2);
        s.frame.material.color.copy(BASE).lerp(ACT, sel * fade).lerp(s.flashC, Math.min(1, s.flash));
        s.frame.material.opacity = Math.min(1, (0.12 * fade + s.flash) * vis + 0.88 * w);
        s.fill.material.opacity = (0.012 + 0.05 * sel) * fade + 0.08 * s.flash;
        s.room.material.color.copy(ROOM).lerp(ACT, 0.35 * sel * fade);
        s.room.material.opacity = 0.08 * fade + 0.72 * w;
        s.lbl.material.opacity = 0.2 * fade + 0.8 * w; s.lbl.material.color.copy(WHITE).lerp(ACT, sel * fade);
        if (s.model) { s.model.material.opacity = Math.min(1, (0.08 * fade + 0.92 * w) * vis); s.model.visible = s.model.material.opacity > 0.02; }
        // годинник: той самий у кожному зрізі; в обраному — крупніший; секундна стрілка крокує за живим часом,
        // а під час передачі смикається в такт Морзе в усіх зрізах одразу — повідомлення йде крізь час
        const wt = s.watch, wo = Math.min(1, (0.1 * fade + 0.9 * w) * vis);
        wt.mats.forEach(m => { m.opacity = wo * (m.userData.o0 ?? 1); }); wt.disc.material.opacity = wo * wt.discA; wt.g.visible = wo > 0.02;
        wt.g.scale.setScalar(WATCH.scale * (1 + 0.25 * sel));
        wt.hh.rotation.z = -hourA; wt.mh.rotation.z = -minA; wt.sh.rotation.z = -secA - gOff;
        if (wt.secMat) wt.secMat.color.copy(wt.secC).lerp(WHITE, gOff > 0.05 ? 0.7 : 0);
        if (ghosts[i]) {
          const gh = ghosts[i]; gh.glow = Math.max(0, gh.glow - dt * 0.35);
          gh.ln.material.color.copy(GHOST).lerp(gh.glowC, Math.min(1, gh.glow * 1.5));
          gh.ln.material.opacity = (0.22 + 0.5 * w) * (0.55 + 0.45 * Math.min(1, gh.glow * 2)) + 0.3 * gh.glow;
        }
      }
      for (let k = 0; k < bk.length; k++) {
        const o = bk[k], d = Math.abs(o.i - cur), vis = pastVis(o.i), w = (d < 0.5 ? 1 : Math.max(0.06, 0.6 * Math.exp(-(d - 0.5) / 2.6))) * fade;
        tmpC.copy(o.col).multiplyScalar((0.1 + 0.9 * w) * vis); books.setColorAt(k, tmpC);
        const hid = vis <= 0.01; if (hid !== !!o.hid) { o.hid = hid; hid ? books.setMatrixAt(k, ZERO) : writeBook(k); books.instanceMatrix.needsUpdate = true; }
      }
      books.instanceColor.needsUpdate = true;
      marks.forEach(m => { m.a += (m.to - m.a) * (RM ? 1 : 1 - Math.exp(-dt * 14)); m.m.scale.setScalar(Math.max(0.001, m.a)); });
      strMat.opacity = 0.32 * fade * fade; ptMat.opacity = 0.9 * fade * fade;
      if (!RM) flowPts(dt);
      const moved = stepBooks(dt);
      grade.tick(tSec, stage.clientWidth, stage.clientHeight); composer.render();
      renderLupe(stage.clientWidth, stage.clientHeight);
      return moved;
    }

    window.IS_TESS = { renderer, composer, bloom, grade, frame, rtLupe, macroCam, scene, slices, lupeMat };
    return { frame, startFall, startReturn, resetSlice, slices, ghosts, marks, NB, ACT, RED, ROOM };
  }

  /* ── передача ── */
  function transmit() {
    if (guard || tx) return;
    const m = MSG[msgKey], enc = buildMorse();
    setYear(m.slice);
    if (three) three.resetSlice(m.slice);
    outcome = null; setGraph('idle'); setVerdict('play');
    tx = { m, enc, t: RM ? enc.total + 1 : -0.5, k: -1, done: false, rej: 0 };
    !muteSnd && window.IS_SOUND && IS_SOUND.fx('whoosh');
    lockUI(true); kick();
  }
  function stepTx(dt) {
    if (!tx) return;
    tx.t += dt;
    const { m, enc } = tx, s = three && three.slices[m.slice];
    let on = false, k = -1;
    enc.els.forEach((e, i) => {
      if (tx.t >= e.t0 && i > tx.k) {           // новий елемент коду
        tx.k = i; !muteSnd && window.IS_SOUND && IS_SOUND.morse(e.c, i);             // Морзе звучить нотами, якщо увімкнено звук статті
        if (three) {
          if (m.kind === 'books') three.startFall(m.slice * three.NB + i, e, LAY.books);
          else three.marks[i] && (three.marks[i].to = 1);
        }
      }
      if (tx.t >= e.t0 && tx.t < e.t1) { on = true; k = i; }
    });
    if (s) s.off += ((on ? (enc.els[k].c === '-' ? 0.55 : 0.4) : 0) - s.off) * (RM ? 1 : Math.min(1, dt * 30));
    if (!tx.done) { const kk = k >= 0 ? k : tx.k; kk < 0 ? markMorse(-1, -1, false) : markMorse(kk, enc.els[kk].li, k < 0); }
    if (!tx.done && tx.t >= enc.total + 0.5) {
      tx.done = true; markMorse(enc.els.length - 1, enc.els[enc.els.length - 1].li, true); !muteSnd && window.IS_SOUND && IS_SOUND.fx('chime');
      const ok = HIST[m.slice] === m.text;
      outcome = ok ? 'ok' : 'bad';
      setGraph(outcome); setVerdict(ok ? 'ok' + m.text : 'bad');
      if (three) {
        s.flash = 1.2; s.flashC = ok ? three.ACT : three.RED;
        const gh = three.ghosts[m.slice]; if (gh) { gh.glow = 1.6; gh.glowC = ok ? three.ACT : three.RED; }
        if (!ok) enc.els.forEach((e, i) => three.startReturn(m.slice * three.NB + i, 1.0 + i * 0.06));
      }
      tx.rej = ok ? 0.3 : 2.3;
    }
    if (tx.done) { tx.rej -= dt; if (tx.rej <= 0 || RM) { if (s) s.off = 0; tx = null; lockUI(false); } }
  }
  function lockUI(v) { msgBtns.forEach(b => b.disabled = v); goBtn.disabled = v || guard; }

  function selectMsg(key) {
    if (tx) return;
    msgKey = key; msgBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === key)));
    buildMorse(); markMorse(-1, -1, false);
    outcome = null;
    if (three) { three.resetSlice(0); three.resetSlice(N - 1); }
    setGraph(guard ? 'guard' : 'idle'); setVerdict(guard ? 'guard' : 'idle');
    setYear(MSG[key].slice);
  }

  msgBtns.forEach(b => b.addEventListener('click', () => selectMsg(b.dataset.m)));
  goBtn.addEventListener('click', transmit);
  range.addEventListener('input', () => setYear(+range.value));
  sw.addEventListener('click', () => {
    guard = !guard; sw.setAttribute('aria-pressed', String(guard)); stage.classList.toggle('is-guard', guard);
    if (tx) { if (three) { three.slices[tx.m.slice].off = 0; three.resetSlice(tx.m.slice); } tx = null; lockUI(false); markMorse(-1, -1, false); }
    goBtn.disabled = guard;
    if (guard) { setGraph('guard'); setVerdict('guard'); }
    else if (outcome) { setGraph(outcome); setVerdict(outcome === 'ok' ? 'ok' + MSG[msgKey].text : 'bad'); }
    else { setGraph('idle'); setVerdict('idle'); }
    kick();
  });

  /* тягнути сцену — рух у часі */
  let drag = null;
  stage.addEventListener('pointerdown', e => { if (film.on || !cover.hidden) return; drag = { x: e.clientX, y: e.clientY, v: target, id: e.pointerId, h: null }; });
  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (drag.h === null && Math.hypot(dx, dy) > 6) { drag.h = Math.abs(dx) > Math.abs(dy); if (drag.h) stage.setPointerCapture(e.pointerId); }
    if (drag.h) setYear(drag.v - dx / 45);
  });
  const end = () => { if (drag && drag.h) setYear(Math.round(target)); drag = null; };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') setYear(Math.round(target) + 1); if (e.key === 'ArrowLeft') setYear(Math.round(target) - 1); });

  /* ── ролик: спершу пояснення по главах (≈ 1 хв, кнопкою ▶), потім пісочниця. Ролик керує тими самими діями, що й кнопки
     (вибір повідомлення, рік, «Передати», захист хронології), тож граф причин і азбука Морзе внизу йдуть синхронно. ── */
  const FILM = [
    { t: 0, n: 'Тесеракт', cap: 'Тесеракт: кожен зріз — кімната Мерф в інший рік. Час тут — ще один вимір, уздовж якого можна рухатися.',
      set: () => { selectMsg('STAY'); setYear(0, true); },
      run: (u) => setYear(u < .5 ? 0 : u < 4 ? 23 * (u - .5) / 3.5 : u < 4.6 ? 23 : 23 * (1 - Math.min(1, (u - 4.6) / 3))) },
    { t: 8, n: 'Рік відльоту', cap: 'День від\'їзду Купера. Він штовхає книжки — сила проходить крізь вимір як гравітація — і на підлозі складається STAY.',
      set: () => { selectMsg('STAY'); setYear(0); }, at: [[1, () => transmit()]] },
    { t: 17, n: 'Петля', cap: 'Купер однаково полетів: Мерф уже бачила саме цей знак. Повідомлення не змінює минуле — воно завжди було його частиною. Петля без початку.',
      set: () => { selectMsg('STAY'); ff(); } },
    { t: 25, n: 'Рік +23', cap: 'Через 23 роки Мерф повертається по годинник. Секундна стрілка смикається кодом Морзе — у лупі той самий годинник, що й на столі.',
      set: () => { selectMsg('DATA'); }, at: [[2, () => transmit()]] },
    { t: 34, n: 'Розв\'язка', cap: 'Мерф читає дані → люди рятуються із Землі → «вони» будують тесеракт → Купер передає дані. Коло замкнулося, і в нього немає автора.',
      set: () => { selectMsg('DATA'); ff(); } },
    { t: 42, n: 'Захист хронології', cap: 'А якщо природа забороняє петлі часу (гіпотеза Гокінга, 1992)? Тоді тесеракт не утвориться — і передати нічого не можна.',
      set: () => { selectMsg('DATA'); ff(); }, at: [[1.5, () => setGuard(true)]] },
    { t: 51, n: 'Тепер ви', cap: 'Спробуйте самі: оберіть повідомлення й рік і натисніть «Передати». Чи вийде змінити минуле?',
      set: () => { setGuard(false); selectMsg('STAY'); } },
  ];
  const FILM_END = 57;
  const film = { on: false, play: false, t: 0, ch: -1, fired: new Set() };
  const cover = $('.tss-cover'), fCap = $('.tss-film-cap'), fBar = $('.tss-film-bar'), fPP = $('.tss-film-pp'), fCh = $('.tss-film-ch');
  fCh.innerHTML = FILM.map((c, i) => `<button type="button" data-i="${i}"><span>${i + 1}</span>${c.n}</button>`).join('');
  const chBtns = [...fCh.querySelectorAll('button')];
  function ff() { muteSnd = true; transmit(); if (tx) stepTx(tx.enc.total + 1); muteSnd = false; }          // передачу — одразу до результату (для переходу на главу)
  function setGuard(v) { if (guard !== v) sw.click(); }
  function stopTx() { if (tx) { if (three) { three.slices[tx.m.slice].off = 0; three.resetSlice(tx.m.slice); } tx = null; lockUI(false); markMorse(-1, -1, false); } }
  function enterCh(i) {
    film.ch = i; film.fired = new Set(); stopTx(); setGuard(i === 5 && film.t - FILM[5].t > 1.5);
    FILM[i].set(); fCap.textContent = FILM[i].cap; fCap.classList.remove('in'); void fCap.offsetWidth; fCap.classList.add('in');
    chBtns.forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); });
  }
  function stepFilm(dt) {
    if (!film.on || !film.play) return;
    film.t += dt;
    if (film.t >= FILM_END) { endFilm(); return; }
    let i = 0; while (i + 1 < FILM.length && film.t >= FILM[i + 1].t) i++;
    if (i !== film.ch) enterCh(i);
    const c = FILM[i], u = film.t - c.t;
    if (c.run) c.run(u);
    (c.at || []).forEach(([tt, fn], k) => { if (u >= tt && !film.fired.has(k)) { film.fired.add(k); fn(); } });
  }
  function startFilm(at = 0) {
    film.on = true; film.play = true; film.t = at; film.ch = -1;
    window.IS_SOUND && IS_SOUND.fx('whoosh');
    root.querySelector('.tss').classList.add('is-film'); cover.hidden = true; fBar.hidden = false; fPP.textContent = '❚❚'; fPP.setAttribute('aria-label', 'Пауза');
    kick();
  }
  function endFilm() {
    film.on = false; film.play = false; stopTx(); setGuard(false); selectMsg('STAY');
    root.querySelector('.tss').classList.remove('is-film'); fBar.hidden = true; fCap.textContent = ''; fCap.classList.remove('in');
    cover.hidden = false; cover.classList.add('end'); $('.tss-film-play').textContent = '▶ Ще раз';
  }
  function trySelf() { if (film.on) endFilm(); cover.hidden = true; }
  $('.tss-film-play').addEventListener('click', () => startFilm(0));
  $('.tss-film-try').addEventListener('click', trySelf);
  $('.tss-film-skip').addEventListener('click', () => { endFilm(); cover.hidden = true; });
  fPP.addEventListener('click', () => { film.play = !film.play; fPP.textContent = film.play ? '❚❚' : '▶'; fPP.setAttribute('aria-label', film.play ? 'Пауза' : 'Далі'); kick(); });
  chBtns.forEach((b, i) => b.addEventListener('click', () => { film.t = FILM[i].t; enterCh(i); film.play = true; fPP.textContent = '❚❚'; kick(); }));
  // будь-яка дія з пісочницею — ролик ховається
  [...msgBtns, goBtn, sw, range].forEach(el => el.addEventListener('pointerdown', () => { if (!film.on) cover.hidden = true; }));

  /* ── цикл: лише коли блок видно ── */
  let visible = false, raf = 0, last = 0;
  function loop(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    stepFilm(dt); stepTx(dt);
    const moving = three ? three.frame(dt) : false;
    const busy = tx || (film.on && film.play) || Math.abs(target - cur) > 0.002 || moving || !RM;
    // наступний кадр — лише один: setYear()/kick() усередині кадру (ролик) вже міг його запланувати, інакше кадри множилися б удвічі щокадру
    if (visible && busy) { if (!raf) raf = requestAnimationFrame(loop); } else { last = 0; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  }
  function kick() { if (visible && !raf) raf = requestAnimationFrame(loop); }
  new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; last = 0; } }, { rootMargin: '80px' }).observe(stage);

  buildMorse(); markMorse(-1, -1, false); setGraph('idle'); setVerdict('idle'); setYear(0, true);
}
