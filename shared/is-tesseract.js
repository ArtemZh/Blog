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
import { gradePass } from './is-post.js?v=20261018235830';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const root = document.getElementById('viz-tess');
if (root) init(root);

function init(root) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('./is-tesseract.css?v=2', import.meta.url).href;
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
    watch: { x: -0.3, y: 1.3, z: -0.42, dot: 0.06, dash: 0.18, gi: 0.03, gl: 0.09 },
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
    </div>
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
    <p class="chint">Буквально змодельовано кодування азбукою Морзе (міжнародний код) і граф причин. За сюжетом фільму: знак STAY із книжок у день від'їзду Купера і дані через секундну стрілку годинника; роки зрізів умовні, а «дані» — лише слово-замінник, справжніх чисел фільм не показує. Принцип самоузгодженості Новікова й захист хронології Гокінга — гіпотези фізиків, жодну не доведено. Тесеракт тут — абстрактна схема, не кадр із фільму.</p>
  </div>`;

  const $ = s => root.querySelector(s);
  const stage = $('.tss-stage'), hudY = $('.tss-y'), hudN = $('.tss-n'), tick = $('.tss-tick');
  const range = $('.tss-yr input'), out = $('.tss-yr output'), goBtn = $('.tss-go'), sw = $('.tss-sw');
  const moBox = $('.tss-mo'), codeP = $('.tss-code'), verdict = $('.tss-v'), svg = $('.tss-g');
  const msgBtns = [...root.querySelectorAll('.tss-msg button')];

  let msgKey = 'STAY', guard = false, target = 0, cur = 0;
  let tx = null;          // поточна передача
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
    const ringGeo = new THREE.RingGeometry(0.155, 0.185, 48);
    const faceGeo = new THREE.CircleGeometry(0.155, 40);
    const handGeo = new THREE.PlaneGeometry(0.018, 0.15); handGeo.translate(0, 0.068, 0);
    const CLK = new THREE.Vector3(0.02, 0.86, -0.42);     // годинник стоїть на столі з моделі кімнати

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
      const face = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ color: 0x0b0e18, ...tr }));
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: ROOM, ...tr }));
      const hand = new THREE.Mesh(handGeo, new THREE.MeshBasicMaterial({ color: WHITE, ...tr }));
      face.position.copy(CLK); ring.position.copy(CLK); hand.position.copy(CLK); hand.position.z += 0.005;
      const lbl = label(`+${i}`); lbl.position.set(-1.75, 3.05, 0);
      g.add(fill, frame, room, face, ring, hand, lbl);
      scene.add(g);
      slices.push({ g, frame, fill, room, ring, face, hand, lbl, off: 0, flash: 0, flashC: ACT });
    }
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
        const m = new THREE.Mesh(new THREE.BoxGeometry(e.len, 0.05, 0.04), mat);
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
        s.ring.material.opacity = 0.1 * fade + 0.85 * w; s.face.material.opacity = 0.9 * w;
        s.hand.material.opacity = 0.1 * fade + 0.9 * w;
        s.hand.material.color.copy(WHITE).lerp(ACT, s.off > 0.05 ? 1 : 0);
        s.lbl.material.opacity = 0.2 * fade + 0.8 * w; s.lbl.material.color.copy(WHITE).lerp(ACT, sel * fade);
        if (s.model) { s.model.material.opacity = Math.min(1, (0.08 * fade + 0.92 * w) * vis); s.model.visible = s.model.material.opacity > 0.02; }
        const base = RM ? 0 : -Math.floor(tSec) * Math.PI / 30;     // секундна стрілка: 6° щосекунди
        s.hand.rotation.z = base - s.off;
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
      return moved;
    }

    window.IS_TESS = { renderer, composer, bloom, grade, frame };
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
    lockUI(true); kick();
  }
  function stepTx(dt) {
    if (!tx) return;
    tx.t += dt;
    const { m, enc } = tx, s = three && three.slices[m.slice];
    let on = false, k = -1;
    enc.els.forEach((e, i) => {
      if (tx.t >= e.t0 && i > tx.k) {           // новий елемент коду
        tx.k = i;
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
      tx.done = true; markMorse(enc.els.length - 1, enc.els[enc.els.length - 1].li, true);
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
  stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, v: target, id: e.pointerId, h: null }; });
  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (drag.h === null && Math.hypot(dx, dy) > 6) { drag.h = Math.abs(dx) > Math.abs(dy); if (drag.h) stage.setPointerCapture(e.pointerId); }
    if (drag.h) setYear(drag.v - dx / 45);
  });
  const end = () => { if (drag && drag.h) setYear(Math.round(target)); drag = null; };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') setYear(Math.round(target) + 1); if (e.key === 'ArrowLeft') setYear(Math.round(target) - 1); });

  /* ── цикл: лише коли блок видно ── */
  let visible = false, raf = 0, last = 0;
  function loop(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    stepTx(dt);
    const moving = three ? three.frame(dt) : false;
    const busy = tx || Math.abs(target - cur) > 0.002 || moving || !RM;
    if (visible && busy) raf = requestAnimationFrame(loop); else last = 0;
  }
  function kick() { if (visible && !raf) raf = requestAnimationFrame(loop); }
  new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; last = 0; } }, { rootMargin: '80px' }).observe(stage);

  buildMorse(); markMorse(-1, -1, false); setGraph('idle'); setVerdict('idle'); setYear(0, true);
}
