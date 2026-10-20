/* Стаття 34, розділ 03: «Година = 7 рокам» — одна three.js-сцена навпіл.
   Ліворуч — мілке море планети Міллер, на небі Гаргантюа, хвиля-гора за розкладом фільму, годинник планети.
   Праворуч — ферма на Землі в таймлапсі: дерево росте за логістичною кривою, пори року, Сонце й Місяць,
   що злипаються в смуги, коли роки летять, пилова імла густішає.
   Час на Землі = час на планеті × K, де K — множник Керра з повзунка розділу (window.IS_SPIN, подія 'is-spin'). */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GRADE_GLSL } from './is-post.js?v=20261019085635';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const slot = document.getElementById('viz-time');
if (slot) init(slot);

function init(slot) {
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'shared/is-time-3d.css?v=3'; document.head.appendChild(css);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Q = new URLSearchParams(location.search);              // ?itm=3.3 — початковий час у годинах (для перевірки скрінами)

  /* ── константи ── */
  const T_MAX = 4 * 3600;                 // шкала: 0…4 год на планеті, у секундах
  const T_WAVE = 70 * 60;                 // хвиля-гора — ≈1 год 10 хв після висадки (за фільмом)
  const T_BACK = 3 * 3600 + 18 * 60;      // повернення на корабель — 3 год 18 хв (за фільмом)
  const FILM_H = 204700;                  // 23 р. 4 міс. 8 дн. на Землі ≈ 204 700 год
  const PLAY0 = 300, SPD = [.25, .5, 1, 2, 4]; let PLAY = PLAY0;   // відтворення: базово 1 год на планеті — 12 с; перемикач швидкості ×0,25…×4
  const HY = 8766;                        // годин у році (365,25 доби)
  const F0 = 0.12;                        // відліт — кінець квітня (частка року від весняного рівнодення)
  const LAT = 38 * Math.PI / 180;         // широта ферми (рівнини США)
  const treeH = (y) => 11 / (1 + 6.333 * Math.exp(-0.1476 * y));   // 1,5 м → 9,5 м за 25 р., межа 11 м

  let K = (window.IS_SPIN && window.IS_SPIN.K) || 62000;
  if (Q.has('itmk')) K = +Q.get('itmk');
  // крива швидкості відтворення: три ділянки реального часу (rate = 1 с планети за 1 с екрана) — висадка, хвиля (мить, коли гребінь
  // підхоплює Дойла) і зліт; кожна ≈ 2–2,5 доби Землі (доба Землі = 86 400 / K с планети, ≈ 1,4 с). Між ними — розгін до PLAY і
  // гальмування перед наступною ділянкою: у лог-масштабі від відстані до ділянки (~2–3 с екрана) — години → дні → тижні → роки.
  // Кнопки ×0,25…×4 змінюють лише «швидку» частину: на ділянках реального часу rate лишається 1.
  const T_DOY = T_WAVE - 452 / 4.5;       // фронт підхоплює Дойла: за 420 м до гребеня, Дойл на z = −32, хвиля 4,5 м/с (див. DOY нижче)
  const RT_R = 28;                        // ширина розгону/гальмування, с планети (≈ 2,5 с екрана)
  const dayP = () => 86400 / K;           // доба Землі в секундах планети
  const rtZones = () => { const D = Math.min(dayP(), 20); return [[0, 2.5 * D], [T_DOY - D, T_DOY + D], [T_BACK - D, T_BACK + D]]; };
  function rate(t) { let d = 1e9; for (const [a, b] of rtZones()) d = Math.min(d, t < a ? a - t : t > b ? t - b : 0);
    const x = Math.min(1, d / RT_R); return Math.exp(Math.log(PLAY) * (1 - (1 - x) * (1 - x))); }   // лог-швидкість: плавно виходить на PLAY
  let tP = Q.has('itm') ? Math.min(T_MAX, Math.max(0, +Q.get('itm') * 3600)) : 0;

  const fmt = (x, d = 0) => x.toLocaleString('uk', { maximumFractionDigits: d, minimumFractionDigits: d });
  const fmt0 = (x, d = 0) => x.toLocaleString('uk', { maximumFractionDigits: d });
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return (m === 1 && h !== 11) ? a : (m >= 2 && m <= 4 && (h < 12 || h > 14)) ? b : c; };
  const hms = (s) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return h + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
  function earthSpan(hours) {
    if (hours < 48) return fmt0(hours, hours < 10 ? 1 : 0) + ' год';
    if (hours < HY) return fmt0(hours / 24, 0) + ' дн.';
    return fmt(hours / HY, 1) + ' р.';
  }
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const fr = (x) => x - Math.floor(x);

  /* ── розмітка ── */
  slot.innerHTML = `<div class="itm">
    <div class="itm-ctl">
      <button class="itm-btn itm-play" type="button">▶ пуск</button>
      <button class="itm-btn itm-film" type="button">як у фільмі: 3 год 18 хв</button>
      <span class="seg itm-spd" role="group" aria-label="Швидкість відтворення">${SPD.map((k) => `<button type="button" data-k="${k}" aria-pressed="${k === 1}">×${fmt0(k, 2)}</button>`).join('')}</span>
      <span class="itm-spd-l"></span>
      <button class="bh-snd itm-snd" type="button" aria-pressed="false">Цокання</button>
      <span class="itm-spd-l itm-snd-l"></span>
      <div class="itm-cnt" aria-live="off">
        <span>на планеті<b class="itm-tp">0:00:00</b></span>
        <span class="itm-e">на Землі минуло<b class="itm-te">0 год</b></span>
        <span>Мерф<b class="itm-mu">10 років</b></span>
      </div>
    </div>
    <div class="itm-track">
      <input class="itm-sl" type="range" min="0" max="${T_MAX}" step="1" value="${tP}" aria-label="Час на планеті Міллер, від висадки">
      <span class="itm-mk l" style="left:0"><b>0:00</b> висадка</span>
      <span class="itm-mk lo" style="left:calc(8px + (100% - 16px) * ${T_WAVE / T_MAX})"><b>1:10</b> хвиля-гора · за фільмом</span>
      <span class="itm-mk r" style="left:calc(8px + (100% - 16px) * ${T_BACK / T_MAX})"><b>3:18</b> повернення на корабель</span>
      <span class="itm-mk r" style="left:100%"><b>4:00</b></span>
      <span class="itm-rts"></span>
    </div>
    <div class="itm-stage" role="img" aria-label="Ліворуч мілке море планети Міллер і Гаргантюа в небі, праворуч ферма на Землі, де за той самий час минають роки"></div>
    <p class="chint itm-note"></p>
    <p class="chint">Пораховано: час на Землі = час на планеті × множник сповільнення з повзунка вище (орбіта Керра); Мерф — 10 років у день відльоту; Сонце й Місяць — за широтою 38° і порою року, тож за довгої «витримки» Сонце малює смугу, яскравішу по краях: біля сонцестоянь воно затримується. Дерево росте за логістичною кривою 1,5 м → ≈9,5 м за 25 років (межа 11 м) — типово для листяного дерева, наближення. Умовно: хвиля-гора (висота ≈1,2 км і момент — за фільмом, швидкість підібрана), вигляд неба й Гаргантюа (спрощений шейдер, не трасування променів). Два годинники в одному кадрі: таймлапсом ідуть лише роки — ріст дерева, пори року, день і ніч, сніг, імла; вітер (гілки, трава, кукурудза, пил) живе в реальному часі. Один листок після хвилі «вирвано» з часу ферми: він летить у часі планети Міллер — повільно, поки на фермі минають роки й сезони. Після хвилі Дойла на планеті вже немає; о 3:18 «Рейнджер» злітає. Відтворення нерівномірне: висадку, хвилю й зліт показано в реальному часі (кожну ділянку — 2–2,5 доби Землі, тонкі позначки на шкалі), між ними — розгін до таймлапсу й гальмування. <span class="itm-tickfilm"></span></p>
  </div>`;
  const $ = (s) => slot.querySelector(s);
  const spdL = $('.itm-spd-l'), spdB = [...slot.querySelectorAll('.itm-spd button')];
  const spdNote = () => { spdL.textContent = '1 год на планеті = ' + fmt0(3600 / PLAY, 0) + ' с'; };
  spdB.forEach((b) => b.addEventListener('click', () => { PLAY = PLAY0 * +b.dataset.k; spdB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); spdNote(); }));
  spdNote();
  // позначки ділянок реального часу на шкалі (залежать від K)
  const rtBox = $('.itm-rts');
  const rtMarks = () => { rtBox.innerHTML = rtZones().map(([a, b]) => `<span class="itm-rt" title="реальний час" style="left:calc(8px + (100% - 16px) * ${((a + b) / 2 / T_MAX).toFixed(5)})"></span>`).join(''); };
  rtMarks();
  // цокання: фізичний період — доба Землі на Міллер (86 400 / K с); звучить лише на повільних ділянках, синтез Web Audio, за замовчуванням вимкнено
  const bSnd = $('.itm-snd'), sndL = $('.itm-snd-l'), tickFilm = $('.itm-tickfilm');
  const sndNote = () => { sndL.textContent = 'тік = доба на Землі (≈ ' + fmt(dayP(), 2) + ' с)';
    tickFilm.textContent = 'У фільмі тік у треку Ганса Ціммера «Mountains» звучить кожні 1,25 с; за фізикою при цьому множнику доба на Землі минає за ≈ ' + fmt(dayP(), 2) + ' с планети — це й період цокання.'; };
  sndNote();
  const SND = { on: false, ctx: null, out: null, noise: null };
  function tick(at = 0, g = 1) {                                          // at — зсув у секундах від «зараз», g — гучність 0…1
    const c = SND.ctx, t0 = c.currentTime + .005 + at;
    const n = c.createBufferSource(); n.buffer = SND.noise; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 1.4;
    const gn = c.createGain(); gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(.9 * g, t0 + .0015); gn.gain.exponentialRampToValueAtTime(.001, t0 + .022);
    n.connect(bp).connect(gn).connect(SND.out); n.start(t0); n.stop(t0 + .03);
    const o = c.createOscillator(); o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(90, t0 + .05);
    const go = c.createGain(); go.gain.setValueAtTime(0, t0); go.gain.linearRampToValueAtTime(.35 * g, t0 + .002); go.gain.exponentialRampToValueAtTime(.001, t0 + .06);
    o.connect(go).connect(SND.out); o.start(t0); o.stop(t0 + .07);
    if (window.IS_SOUND) { IS_SOUND.duck('tick', true); clearTimeout(tick.t); tick.t = setTimeout(() => IS_SOUND.duck('tick', false), 2500); }   // тема стихає, поки цокає
  }
  bSnd.addEventListener('click', () => {
    SND.on = !SND.on; bSnd.classList.toggle('on', SND.on); bSnd.setAttribute('aria-pressed', String(SND.on));
    if (SND.on && !SND.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; SND.ctx = new AC(); SND.out = SND.ctx.createGain(); SND.out.gain.value = .35; SND.out.connect(SND.ctx.destination);
      const len = Math.round(SND.ctx.sampleRate * .03), b = SND.ctx.createBuffer(1, len, SND.ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; SND.noise = b; }
    if (SND.ctx) SND.on ? SND.ctx.resume() : SND.ctx.suspend();
  });
  addEventListener('is-sound', (e) => { if (e.detail.on !== SND.on) bSnd.click(); });   // загальний звук статті вмикає й цокання
  document.addEventListener('visibilitychange', () => { if (SND.ctx && SND.on) document.hidden ? SND.ctx.suspend() : SND.ctx.resume(); });
  const sl = $('.itm-sl'), bPlay = $('.itm-play'), bFilm = $('.itm-film'), stage = $('.itm-stage'), note = $('.itm-note');
  const oTP = $('.itm-tp'), oTE = $('.itm-te'), oMU = $('.itm-mu');

  function counters() {
    const hE = tP / 3600 * K, y = hE / HY, mu = Math.floor(10 + y);
    oTP.textContent = hms(tP); oTE.textContent = earthSpan(hE); oMU.textContent = mu + ' ' + plural(mu, 'рік', 'роки', 'років');
    oTE.title = hE >= HY ? fmt0(hE, 0) + ' год' : '';
  }
  function filmNote() {
    const need = FILM_H / K;
    if (K < 2) note.textContent = 'Множник ×' + fmt(K, 2) + ': на Землі минає майже стільки ж, скільки на планеті. Дерево не встигне вирости, Мерф не подорослішає.';
    else if (need > 4) note.textContent = 'При множнику ×' + fmt0(K, 0) + ' на 23 роки Землі треба ' + fmt0(need, 0) + ' год на планеті — це за межами шкали.';
    else note.textContent = '';
  }
  counters(); filmNote();

  /* ── WebGL ── */
  let R;
  const cv = document.createElement('canvas'), ov = document.createElement('canvas');
  try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); if (!R.getContext()) throw 0; }
  catch (e) { stage.innerHTML = '<div class="fail">Тут мала бути 3D-сцена, але браузер не підтримує WebGL. Лічильники вище працюють і без неї.</div>'; wireUI(null); return; }
  stage.append(cv, ov);
  const DPR = Math.min(2, devicePixelRatio || 1);
  R.setPixelRatio(DPR); R.outputColorSpace = THREE.SRGBColorSpace; R.setScissorTest(true);
  // тон-мапінг ACES застосовує лише останній прохід (тілшифт) — three.js не тонує кадри, що йдуть у текстуру
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  const ox = ov.getContext('2d');
  // моделі (ChatGPT → Tripo → Blender, GLB з Draco): перед — +Z, низ — y = 0
  const draco = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
  const gltf = new GLTFLoader().setDRACOLoader(draco);
  function model(name, parent, { scale = 1, rotY = 0, pos = [0, 0, 0], shadow = true, fix } = {}) {
    gltf.load('assets/interstellar/' + name + '.glb', (g) => {
      const m = g.scene; m.scale.setScalar(scale); m.rotation.y = rotY; m.position.set(...pos);
      m.traverse((o) => { if (o.isMesh) { o.castShadow = shadow; o.receiveShadow = shadow; if (fix) fix(o.material); } });
      parent.add(m); need = true; kick();
    }, undefined, () => {});
  }

  /* ════════════ ЛІВОРУЧ: ПЛАНЕТА МІЛЛЕР ════════════ */
  const sA = new THREE.Scene(), camA = new THREE.PerspectiveCamera(56, 1, 1, 30000);
  const GDIR = new THREE.Vector3(0.14, 0.13, -1).normalize();        // напрям на Гаргантюа: низько над обрієм, як у фільмі        // напрям на Гаргантюа
  const HOR_A = [0.62, 0.68, 0.72];
  const NOISE = `
    float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
    float fbm(vec2 p){ float s=0., a=.5; for(int k=0;k<5;k++){ s+=a*vn(p); p=p*2.03+17.1; a*=.5; } return s; }`;
  const skyAU = { uT: { value: 0 }, uG: { value: GDIR } };
  const skyA = new THREE.Mesh(new THREE.SphereGeometry(20000, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyAU,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vD; uniform float uT; uniform vec3 uG; ${NOISE}
      void main(){ vec3 d = normalize(vD); float h = d.y;
        vec3 hor = vec3(${HOR_A.join(',')}), zen = vec3(.36,.46,.57);
        vec3 c = mix(hor, zen, smoothstep(0., .55, h));
        // низька хмарна стеля: шум у проекції на площину хмар
        vec2 q = d.xz / max(h + .08, .03) * 1.4 + vec2(uT*.006, uT*.002);
        float cl = smoothstep(.42, .78, fbm(q)) * smoothstep(-.02, .12, h);
        c = mix(c, vec3(.80,.82,.83), cl*.55);
        float g = max(dot(d, uG), 0.);
        c += vec3(1.,.74,.5) * (pow(g, 18.)*.12 + pow(g, 120.)*.10);
        gl_FragColor = vec4(c, 1.); }`
  }));
  skyA.renderOrder = -2; sA.add(skyA);

  // Гаргантюа: тінь, фотонне кільце, лінзований диск «обіймами» над і під тінню, тонка смуга диска спереду
  const gargU = { uVis: { value: 1.0 } };
  const garg = new THREE.Mesh(new THREE.PlaneGeometry(13000, 6500), new THREE.ShaderMaterial({
    transparent: true, premultipliedAlpha: true, depthWrite: false, fog: false, uniforms: gargU,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec2 vU; uniform float uVis;
      void main(){ vec2 p = (vU - .5) * vec2(4., 2.);
        float cs = cos(-.07), sn = sin(-.07); p = mat2(cs, -sn, sn, cs) * p;
        float rs = .36, r = length(p);
        float sh = 1. - smoothstep(rs*.97, rs*1.03, r);
        float ring = exp(-pow((r - rs*1.05)/.012, 2.));
        // «обійми» диска: широка дуга над тінню й тонша під нею — світло з-за діри, зігнуте тяжінням
        float up = smoothstep(-.3, .7, abs(p.y) / max(r, 1e-3)), below = p.y < 0. ? .6 : 1.;
        float halo = exp(-pow((r - rs*(1.3 + .25*up))/(rs*(.12 + .35*up)), 2.)) * up * below * smoothstep(rs, rs*1.08, r);
        float th = .016 + .02*min(abs(p.x), 2.);
        float band = exp(-pow((p.y + .01*p.x)/th, 2.)) * smoothstep(2., .7, abs(p.x));
        float dop = 1. - .3 * p.x / 2.;          // левий бік диска летить на нас — яскравіший
        float glow = exp(-max(r - rs, 0.) * 3.5) * .12 * (1. - sh);
        float lum = (ring*3.2 + halo*2.6 + band*2.8) * dop + glow*2.;
        vec3 col = mix(vec3(.95, .45, .16), vec3(1., .9, .74), clamp(lum*.6 - .1, 0., 1.)) * min(lum, 1.5);
        float e = smoothstep(2., 1.55, abs(p.x)) * smoothstep(1., .78, abs(p.y));
        float dark = smoothstep(rs*2.8, rs*1.05, r) * .5;                       // навколо тіні небо темніше: там видно лінзований темний космос
        float a = clamp(sh*.95 + lum*.5 + dark, 0., 1.) * e * uVis;
        gl_FragColor = vec4(col * e * uVis, a); }`
  }));
  garg.renderOrder = -1; sA.add(garg);

  // вода: суми хвиль Герстнера (мілко, по кісточки) + хвиля-гора; у фрагментному — дрібні брижі, Френель,
  // відбиття неба з хмарами й Гаргантюа, заломлення: піщане дно з каустиками, поглинання за товщиною води,
  // підсвічування стіни хвилі світлом крізь воду, піна на гребенях. Прийоми — як у сучасних демо водних шейдерів three.js.
  const watU = { uT: { value: 0 }, uWz: { value: -9000 }, uWH: { value: 1200 }, uSig: { value: 380 }, uG: { value: GDIR }, uFeet: { value: [new THREE.Vector4(2.5, -29, .3, 1), new THREE.Vector4(5, -32, .3, 1), new THREE.Vector4(9, -38, 4.2, .7)] },
    uRip: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -99, 0)) } };
  const wgeo = new THREE.PlaneGeometry(18000, 18000, 260, 520); wgeo.rotateX(-Math.PI / 2);
  // шість хвиль Герстнера: напрям (x, z), довжина, крутизна Q, амплітуда — одна таблиця для вершинного й фрагментного шейдера.
  // Сітка має крок 35–70 м, тож дрібні хвилі вершини не «бачать»: їхні нахили, гребені й Якобіан рахує фрагментний, по пікселю
  const WAV = [[.2, 1, 9, .6, .09], [-.6, .8, 5.3, .5, .05], [.9, .4, 3.1, .4, .03], [-.3, -1, 17, .5, .12], [.7, -.7, 1.9, .3, .015], [-.15, -1, 64, .35, .22]];
  const wavN = (f, extra) => WAV.map(([dx, dz, L, Q, A]) => `${f}(x, normalize(vec2(${dx.toFixed(2)}, ${dz.toFixed(2)})), ${L.toFixed(1)}, ${Q.toFixed(2)}, ${A.toFixed(3)}${extra})`);
  const water = new THREE.Mesh(wgeo, new THREE.ShaderMaterial({
    uniforms: watU, fog: false, extensions: { derivatives: true },
    vertexShader: `uniform float uT, uWz, uWH, uSig; varying vec3 vW; varying vec3 vN; varying float vH; varying float vLip; varying float vTrough; varying float vFold;
      // кільця брижів від кліку: до 8 джерел (x, z, час старту, активне); фронт біжить ~5 м/с і гасне за ~4 с
      uniform vec4 uRip[8];
      float ripH(vec2 xz, out vec2 grad){ float h = 0.; grad = vec2(0.);
        for (int i = 0; i < 8; i++) { float age = uT - uRip[i].z; if (uRip[i].w < .5 || age < 0. || age > 4.5) continue;
          vec2 d = xz - uRip[i].xy; float r = length(d) + 1e-3;
          float env = exp(-pow((r - age*5.)/(1.2 + age*.9), 2.)) * exp(-age*.85) * smoothstep(0., .12, age);
          float ph = r*4.5 - age*22., a = .22*env;
          h += a*sin(ph); grad += (d/r) * a*4.5*cos(ph); }
        return h; }
      // одна хвиля Герстнера: напрям, довжина, крутизна, амплітуда; повертає зсув і накопичує нормаль
      vec3 gw(vec2 x, vec2 D, float L, float Q, float A, inout vec3 nrm){
        float k = 6.2832/L, c = sqrt(9.81/k), f = k*(dot(D, x) - c*uT);
        float co = cos(f), si = sin(f);
        nrm.x -= D.x*k*A*co; nrm.z -= D.y*k*A*co; nrm.y -= Q*k*A*si;
        return vec3(Q*A*D.x*co, A*si, Q*A*D.y*co); }
      ${NOISE}
      // хвиля-гора: асиметричний профіль (полога задня сторона sB, крутий передній схил sF), гребінь нерівний уздовж фронту
      // (шум по x: то вищий, то нижчий), біля гребеня передній схил загинається вперед («губа»), перед хвилею вода відступає (жолоб)
      float crestK(float x){ return .93 + .2*sin(x*.0021) + .13*sin(x*.0053 + 1.7) + .07*sin(x*.013 + .4); }
      float wallH(vec2 xz, out float e, out float lip, out float trough){
        float dz = (xz.y - uWz) / uSig; float ck = crestK(xz.x);
        float sF = .62, sB = 1.9, s = dz > 0. ? sF : sB; e = exp(-dz*dz/(s*s)) * ck;
        lip = smoothstep(.5, 1., e / ck) * smoothstep(-.35, .15, dz) * ck;
        trough = exp(-pow((dz - 2.4)/1.2, 2.));
        return uWH * e - uWH * .018 * trough; }
      void main(){ vec3 p = position; vec2 x = p.xz; vec3 n = vec3(0., 1., 0.), nG = n;
        vec3 d = ${wavN('gw', ', nG').join(' + ')};   // нахили цих хвиль (nG) тут не беремо — на рідкій сітці вони лише шум
        p += d;
        vec2 rg; p.y += ripH(x, rg); n.x -= rg.x*1.5; n.z -= rg.y*1.5;
        float e, lip, trough; float w = wallH(p.xz, e, lip, trough);
        float e2, l2, t2; float dx = 25., dzz = 12.;
        float wx = wallH(p.xz + vec2(dx, 0.), e2, l2, t2), wz = wallH(p.xz + vec2(0., dzz), e2, l2, t2);   // нормаль стіни — різницями
        p.y += w;
        p.z += lip * uSig * .42;                                                   // «губа»: верх переднього схилу нависає вперед
        n.x -= (wx - w) / dx; n.z -= (wz - w) / dzz; vN = normalize(n);
        // Якобіан зсуву «губи» вздовж z: де він < 1, поверхня стискається, а < 0 — складається сама на себе (там і народжується піна)
        vFold = 1. + (l2 - lip) / dzz * uSig * .42;
        vH = e; vLip = lip; vTrough = trough;
        vW = (modelMatrix * vec4(p, 1.)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }`,
    fragmentShader: `uniform float uT, uWz, uSig; uniform vec3 uG; uniform vec4 uFeet[3]; varying vec3 vW; varying vec3 vN; varying float vH; varying float vLip; varying float vTrough; varying float vFold; ${NOISE}
      // кільця брижів від кліку: до 8 джерел (x, z, час старту, активне); фронт біжить ~5 м/с і гасне за ~4 с
      uniform vec4 uRip[8];
      float ripH(vec2 xz, out vec2 grad){ float h = 0.; grad = vec2(0.);
        for (int i = 0; i < 8; i++) { float age = uT - uRip[i].z; if (uRip[i].w < .5 || age < 0. || age > 4.5) continue;
          vec2 d = xz - uRip[i].xy; float r = length(d) + 1e-3;
          float env = exp(-pow((r - age*5.)/(1.2 + age*.9), 2.)) * exp(-age*.85) * smoothstep(0., .12, age);
          float ph = r*4.5 - age*22., a = .22*env;
          h += a*sin(ph); grad += (d/r) * a*4.5*cos(ph); }
        return h; }
      // небо планети у відбитті: холодне, сіро-сталеве; хмари розмиваються там, де піксель усереднює багато нахилів (var — дисперсія),
      // тож далеке море відбиває рівне світле небо, а не мерехтливі клапті. Сам диск Гаргантюа у воді — окремим блиском нижче
      vec3 skyc(vec3 d, float var){ float h = max(d.y, 0.);
        vec3 c = mix(vec3(${HOR_A.join(',')}), vec3(.36,.46,.57), smoothstep(0., .55, h));
        vec2 q = d.xz / max(h + .08, .03) * 1.4 + vec2(uT*.006, uT*.002);
        float cl = mix(smoothstep(.42, .78, fbm(q)), .3, smoothstep(.004, .03, var));
        c = mix(c, vec3(.74,.78,.80), cl * smoothstep(-.02, .12, h) * .55);
        float g = max(dot(d, uG), 0.); c += vec3(1.,.8,.58) * pow(g, 14.) * .22;
        return c; }
      // Френель Шліка для води (n = 1,333, F0 ≈ 0,02)
      float fresW(float c){ float x = 1. - clamp(c, 0., 1.), x2 = x*x; return .02 + .98*x2*x2*x; }
      // маскування Сміта для гаусових нахилів: частка граней, яку не ховають сусідні гребені під кутом w (апроксимація Волтера, 2007).
      // cv — дисперсії нахилів (xx, zz, xz); беремо σ уздовж азимута напрямку
      float smithL(vec3 w, vec3 cv){ vec2 a = w.xz; float l = max(length(a), 1e-4); a /= l;
        float s2 = max(a.x*a.x*cv.x + a.y*a.y*cv.y + 2.*a.x*a.y*cv.z, 1e-7), m = max(w.y, 1e-3) / l / sqrt(2.*s2);
        return m >= 1.6 ? 0. : (1. - 1.259*m + .396*m*m) / (3.535*m + 2.181*m*m); }
      // одна хвиля Герстнера по пікселю (ідея статистики нахилів у дусі LEAN — ідея: Noniv/web-ocean (MIT), переписано аналітично):
      // fp — розмір пікселя на воді, м. Хвиля, довша за ~8 пікселів, іде в нахил s явно; коротша — лише як дисперсія cv, яку піксель
      // усереднив. Тож далеке море плавно переходить у рівний полиск без мерехтіння. J — Якобіан горизонтального зсуву, hc — висота гребеня
      // wn — два повільні шумові поля на піксель (спільні для всіх хвиль): фаза «гуляє» — гребені не як по лінійці, і групи — то вищі, то нижчі хвилі
      vec2 wn;
      void wf(vec2 x, vec2 D, float L, float Q, float A, float fp, inout vec2 s, inout vec3 cv, inout float J, inout float hc){
        float m = fract(L*.618), k = 6.2832/L, f = k*(dot(D, x) - sqrt(9.81/k)*uT) + 7.*mix(wn.x, wn.y, m), r = 1. - smoothstep(L*.12, L*.4, fp);
        float kA = k*A*(.45 + 1.1*mix(wn.y, 1. - wn.x, m));
        cv += vec3(D.x*D.x, D.y*D.y, D.x*D.y) * (kA*kA*.5*(1. - r*r));
        if (r > 0.) { float co = cos(f), si = sin(f);                        // далеко хвиля — лише дисперсія, синуси не рахуємо
          s += D * (kA*co*r); J -= Q*kA*si*r; hc += kA/k*si*r; } }
      // дрібні брижі: градієнт двох шарів шуму, що пливуть у різні боки
      vec2 ripple(vec2 q){ float e = .35;
        float a = vn(q*.9 + vec2(uT*.35, uT*.2)) + .5*vn(q*2.1 - vec2(uT*.5, -uT*.3));
        float bx = vn((q+vec2(e,0.))*.9 + vec2(uT*.35, uT*.2)) + .5*vn((q+vec2(e,0.))*2.1 - vec2(uT*.5, -uT*.3));
        float by = vn((q+vec2(0.,e))*.9 + vec2(uT*.35, uT*.2)) + .5*vn((q+vec2(0.,e))*2.1 - vec2(uT*.5, -uT*.3));
        return vec2(bx - a, by - a) / e; }
      // каустики на дні: світлі нитки там, де шум переходить через середину
      float caust(vec2 q){ float a = vn(q*1.3 + uT*.25), b = vn(q*1.7 - uT*.2 + 3.);
        return pow(1. - abs(a - b), 9.) * 1.4; }
      void main(){ vec3 V = cameraPosition - vW; float dist = length(V); V /= dist;
        float att = 1. / (1. + dist*.012);
        vec2 x = vW.xz;
        float fp = max(length(dFdx(vW.xz)), length(dFdy(vW.xz))) + 1e-3;    // скільки метрів води вміщає піксель
        // «котячі лапки»: смуги вітру з різною шорсткістю, повільно пливуть по воді
        float paws = smoothstep(.38, .72, fbm(vec2(vW.x*.006 + uT*.012, vW.z*.018 - uT*.02)));
        float rough = .35 + .65*paws;
        // статистика нахилів: середній нахил s, дисперсія cv (xx, zz, xz), Якобіан J і висота дрібних гребенів hc
        vec2 s = vec2(0.); vec3 cv = vec3(0.); float J = 1., hc = 0.;
        wn = vec2(vn(x*.045 + 7.), vn(x*.017 - 3.));
        ${wavN('wf', ', fp, s, cv, J, hc').join(';\n        ')};
        // брижі-шум (≈0,3–0,7 м): поблизу — явні, далі — лише дисперсія; плюс капілярні брижі, яких не видно ніде, і довгий хвіст
        // дисперсії з відстанню — щоб далечінь набрала шорсткість, як справжнє море з висоти (≈ Кокс–Манк при слабкому вітрі)
        float rN = 1. - smoothstep(.06, .25, fp);
        vec2 rp = vec2(0.); if (rN > 0.) rp = ripple(vW.xz*1.6) * rough * .26 * rN;
        float un = (.0015 + .004*rough) + .006*rough*(1. - rN) + .005*smoothstep(80., 1500., dist);
        cv.xy += un;
        // кільця брижів і піна навколо ніг і опор модуля
        float rings = 0., foamF = 0.;
        for (int i = 0; i < 3; i++) { vec2 dxz = vW.xz - uFeet[i].xy; float dd = length(dxz) - uFeet[i].z;
          float w = uFeet[i].w * exp(-max(dd, 0.)*.9);
          rings += sin(dd*14. - uT*5.) * w * .35;
          foamF += w * (.55 + .45*vn(vW.xz*3. + uT*.6)) * smoothstep(1.2, 0., abs(dd)); }
        vec2 rg; float rh = ripH(vW.xz, rg);
        // нормаль: стіна й кільця — з вершин, хвилі й брижі — по пікселю; нахил sN — для блиску
        vec3 N = normalize(vN + vec3(s.x + rp.x, 0., s.y + rp.y) * -1. * vN.y + vec3(rings, 0., rings*.7) * att + vec3(-rg.x, 0., -rg.y) * .9);
        vec2 sN = -N.xz / max(N.y, .1);
        // антиаліасинг блиску: як сильно нахил змінюється в межах пікселя — на стільки й ширшає пелюстка (обмежено, щоб не «замилити» все)
        vec2 dsx = dFdx(sN), dsy = dFdy(sN);
        vec3 aa = vec3(dsx.x*dsx.x + dsy.x*dsy.x, dsx.y*dsx.y + dsy.y*dsy.y, dsx.x*dsx.y + dsy.x*dsy.y) * .5;
        cv += aa * min(1., .03 / max(max(aa.x, aa.y), 1e-8));
        // ── блиск Гаргантюа: анізотропний гаусів розподіл нахилів + кутовий розмір джерела ──
        // диск акреції — широка смуга вздовж обрію (≈ ±0,4 рад), тож у нахилах джерело «розмазане» по x сильніше, ніж по z
        vec3 cvL = cv + vec3(.022, .0008, 0.);
        vec3 Hh = normalize(V + uG); vec2 dh = -Hh.xz / max(Hh.y, 1e-3) - sN;
        float det = max(cvL.x*cvL.y - cvL.z*cvL.z, 1e-9);
        float ex = (dh.x*dh.x*cvL.y + dh.y*dh.y*cvL.x - 2.*dh.x*dh.y*cvL.z) / det;
        float hy2 = Hh.y*Hh.y, Dm = exp(-.5*ex) / (6.2832*sqrt(det)) / max(hy2*hy2, 1e-4);
        float Gs = 1. / (1. + smithL(V, cvL) + smithL(uG, cvL));
        vec3 spec = vec3(1.,.84,.64) * .085 * fresW(dot(V, Hh)) * Dm * Gs / (4.*max(V.y, .02));
        spec *= 1. - smoothstep(.3, .8, vH);                                   // на крутій стіні не дзеркалить
        // ── відбиття неба під малим кутом ──
        // при погляді навскіс сховані ті грані, що відвернуті від нас, тож «середнє дзеркало» нахилене до глядача й бачить вище, світліше небо
        vec2 vh = normalize(V.xz + vec2(1e-5, 0.));
        float sv = sqrt(max(vh.x*vh.x*cv.x + vh.y*vh.y*cv.y + 2.*vh.x*vh.y*cv.z, 1e-6));
        float gv = V.y / max(length(V.xz), 1e-3) / (1.4142*sv);
        float face = smoothstep(.03, .45, vH);                                 // крута стіна хвилі-гори — там ці поправки для рівного моря не діють
        vec3 Nv = normalize(N + vec3(vh.x, 0., vh.y) * .35*sv*(1. - smoothstep(0., 2.5, gv)) * (1. - face));
        vec3 Rd = reflect(-V, Nv); Rd.y = abs(Rd.y); Rd = normalize(Rd);    // промінь униз б'ється в сусідню хвилю й іде вгору
        vec3 refl = skyc(Rd, cv.x + cv.y);
        refl = mix(refl, refl * vec3(.78,.82,.86), paws*.35);                    // шорсткі смуги темніші й матовіші
        // Френель — від частково згладженої нормалі: під малим кутом видимі грані лишаються дзеркальними
        float cosv = max(dot(Nv, V), 0.);
        float fr = fresW(dot(normalize(mix(Nv, vec3(0., 1., 0.), .4*(1. - face))), V));
        // заломлення: дно на глибині ~0,3 м, промінь іде навскіс — довший шлях у воді, темніше й сіріше
        float depth = .3 + max(vW.y, 0.) * .9;
        float path = depth / max(cosv, .08);
        vec2 bp = vW.xz - (V.xz / max(V.y, .08)) * depth * .75;
        vec3 sand = vec3(.52,.50,.45) * (.82 + .36*vn(bp*.6)) * (.9 + .2*vn(bp*.08));
        sand += vec3(1.,.95,.86) * caust(bp*1.4) * .6 * att;
        vec3 absorb = exp(-vec3(1.6, .9, .7) * path);
        vec3 refr = mix(vec3(.17,.22,.25), sand, absorb);
        // стіна хвилі-гори: внизу товща води темна, догори вода тоншає й світлішає
        refr = mix(refr, mix(vec3(.10,.15,.18), vec3(.16,.27,.28), smoothstep(.4, .95, vH)), face);
        // ── просвічений гребінь (ідея: Noniv/web-ocean (MIT)) ──
        // світло Гаргантюа йде крізь тонкий верх хвилі назустріч камері: сильно, коли дивимось майже на джерело (back),
        // коли грань відвернута від світла (thin) і що вище на гребені (crest²); вода фарбує його в зелено-блакитне
        float back = pow(max(dot(-V, uG), 0.), 2.);
        float thin = pow(clamp(.5 - .5*dot(uG, N), 0., 1.), 2.);
        float cW = smoothstep(.45, 1., vH); cW *= cW;
        float cS = clamp(hc / .14, 0., 1.); cS *= cS;
        // + слабший внесок від усього світлого неба за гребенем, щоб верх стіни світився й тоді, коли диск не за ним
        float glow = cW * (.6 + .8*vLip) * exp(-dist/7000.) * (.45 + 1.6*back*thin) + cS * .45 * exp(-dist/150.) * back * thin;
        refr += vec3(.16,.62,.55) * glow;
        // перед хвилею вода відступила — оголена мокра мілина
        float dry = smoothstep(-.22, -.5, vW.y) * smoothstep(.2, .8, vTrough);
        refr = mix(refr, vec3(.36,.33,.28) * (.85 + .3*vn(vW.xz*.4)), dry);
        vec3 c = mix(refr, refl, fr * (1. - dry*.6)) + spec * (1. - dry);
        // ── піна там, де поверхня складається ──
        // дрібні хвилі: Якобіан < ~0,92 — гребінь стискає воду; губа хвилі-гори: Якобіан її зсуву < 0,6 — вода перекидається
        float pat = fbm(vW.xz*.6 + uT*.1), fw = fwidth(pat) + .03;
        float foam = clamp((.93 - J)*9., 0., 1.) * rough * smoothstep(.45 - fw, .7 + fw, pat) * .6;
        float fold = clamp((.15 - vFold)*1.2, 0., 1.);                       // уся губа складається; піна — пасмами, щоб між ними гребінь просвічував
        foam += fold * smoothstep(.5, .72, fbm(vec2(vW.x*.012, vW.z*.02 - uT*.05))) * (.35 + .4*(1. - cW));
        foam += smoothstep(.9, .99, vH) * smoothstep(.55, .8, fbm(vW.xz*.02 + uT*.02)) * .35;   // верх лише плямами — решта просвічує
        // патьоки піни на стіні: вертикальні прожилки, що стікають униз
        foam += smoothstep(.55, .9, fbm(vec2(vW.x*.014, vW.y*.004 - uT*.05))) * face * .25 * (1. - cW);
        foam += smoothstep(.65, .92, fbm(vec2(vW.x*.05 + 9., vW.y*.012 - uT*.12))) * face * .1;
        foam += smoothstep(.6, .98, vLip) * smoothstep(.4, .75, fbm(vec2(vW.x*.004, uT*.03))) * .25;
        // бурун біля підніжжя — біжить попереду хвилі по мілині
        float bore = exp(-pow((vW.z - uWz - uSig*1.05)/(uSig*.22), 2.)) * (.55 + .45*fbm(vec2(vW.x*.02, vW.z*.02 - uT*.3)));
        foam += bore * .95;
        // пінний слід за хвилею: щойно гребінь пройшов — суцільне поле, далі старіє (вік = відстань від гребеня / 4,5 м/с)
        // і рветься на смуги вздовж вітру (вітер жене хвилю по z), поки за ~40 хв не зникає
        float age = (uWz - uSig*.25 - vW.z) / 4.5;
        if (age > 0. && age < 2600.) { float ag = 1. - exp(-age/600.);
          float st = fbm(vec2(vW.x*.03, vW.z*.0035 + 3.)) * .75 + .25*vn(vW.xz*vec2(.12, .03)), sw = fwidth(st) + .02;
          foam += smoothstep(.25 + .45*ag - sw, .5 + .35*ag + sw, st) * exp(-age/1200.) * smoothstep(0., 20., age) * smoothstep(2600., 1800., age) * (1. - .4*ag); }
        foam += foamF * att + smoothstep(.07, .13, rh) * .9;                   // піна на гребенях кілець від кліку
        // піна підсвічена знизу бульбашками й зверху всім небом; щільна — біла, тонка — напівпрозора плівка
        foam = clamp(foam, 0., 1.);
        c = mix(c, vec3(.86,.88,.89) * (.92 + .08*vn(vW.xz*2.)), foam * .8);
        // далечінь: деталі гаснуть, над водою біля обрію — імла в тон неба
        c = mix(c, vec3(${HOR_A.join(',')}), (1. - exp(-dist * .00012)) * (1. - .85*face));   // імла — для обрію, не для стіни
        gl_FragColor = vec4(c, 1.); }`
  }));
  // масштаб: посадковий модуль і двоє в скафандрах стоять у воді по кісточки
  sA.add(new THREE.HemisphereLight(0xe8eef2, 0x3d4a4c, 1.8));
  const keyA = new THREE.DirectionalLight(0xffe2c0, 2.4); keyA.position.copy(GDIR).multiplyScalar(100); sA.add(keyA);
  const shipA = new THREE.Group(); shipA.position.set(9, 0, -38); shipA.rotation.y = 2.3; sA.add(shipA);
  model('miller-lander', shipA, { shadow: false, fix: (mt) => { mt.roughness = .55; mt.metalness = .25; mt.envMapIntensity = .6; } });
  // двоє в скафандрах стоять у воді по кісточки біля модуля
  const people = [[2.5, -29, .6], [5, -32, -.4]].map(([px, pz, ry]) => { const g = new THREE.Group(); g.position.set(px, 0, pz); sA.add(g);
    model('astronaut', g, { scale: 1.15, rotY: ry, shadow: false, fix: (mt) => { mt.roughness = .7; } }); return g; });
  sA.add(water);
  // бризки з гребеня: пасма водяного пилу, що зриваються з губи й летять назад за вітром; рахується у вершинному шейдері
  const NSP = 2200, spA = new Float32Array(NSP * 3);
  for (let i = 0; i < NSP; i++) spA.set([(Math.random() - .5) * 7000, Math.random(), Math.random()], i * 3);   // x уздовж фронту, фаза, випадок
  const spG = new THREE.BufferGeometry(); spG.setAttribute('aS', new THREE.BufferAttribute(spA, 3)); spG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NSP * 3), 3));
  const spray = new THREE.Points(spG, new THREE.ShaderMaterial({ uniforms: watU, transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    vertexShader: `uniform float uT, uWz, uWH, uSig; attribute vec3 aS; varying float vA; ${NOISE}
      float crestK(float x){ return .93 + .2*sin(x*.0021) + .13*sin(x*.0053 + 1.7) + .07*sin(x*.013 + .4); }
      void main(){ float life = fract(uT*.22 + aS.y); float ck = crestK(aS.x);
        float h = uWH * ck; vec3 p = vec3(aS.x + (aS.z - .5)*60., h + 40. + 260.*life - 520.*life*life + aS.z*60., uWz + uSig*.1 - life*(420. + aS.z*300.));
        vA = smoothstep(0., .1, life) * (1. - smoothstep(.55, 1., life)) * smoothstep(.6, 1., ck) * .75;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp((18. + aS.z*26.) * 300. / -mv.z, 1., 40.); }`,
    fragmentShader: `varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float r = dot(q, q); if (r > .25) discard;
      gl_FragColor = vec4(vec3(.9, .93, .95), vA * (1. - r*4.) * .55); }` }));
  spray.frustumCulled = false; sA.add(spray);
  const waveZ = (t) => (t - T_WAVE) * 4.5;
  const DOY = { x: 5, z: -32, p: 0 };
  const camAT = new THREE.Vector3();                                     // де стояв Дойл (people[1])                       // м: хвиля йде з горизонту до глядача, ≈4,5 м/с
  // та сама функція стіни, що в шейдері (crestK, асиметрія, жолоб) — щоб камера й фігури стояли на воді, а не висіли
  const crestK = (x) => .93 + .2 * Math.sin(x * .0021) + .13 * Math.sin(x * .0053 + 1.7) + .07 * Math.sin(x * .013 + .4);
  const waveH = (z, wz, x = 0) => { const dz = (z - wz) / 380, s = dz > 0 ? .62 : 1.9; return 1200 * (Math.exp(-dz * dz / (s * s)) * crestK(x) - .018 * Math.exp(-Math.pow((dz - 2.4) / 1.2, 2))); };

  /* ════════════ ПРАВОРУЧ: ФЕРМА НА ЗЕМЛІ ════════════ */
  const sB = new THREE.Scene(), camB = new THREE.PerspectiveCamera(50, 1, 0.1, 3000);
  sB.fog = new THREE.FogExp2(0xbcc4cc, 0.004);
  // кадр: камера невисоко над узбіччям, дивиться вздовж прямої дороги (провідна лінія до будинку), дерево — на середньому плані ліворуч
  const camB0 = new THREE.Vector3(-1, 3.4, 19), camBT = new THREE.Vector3(1.8, 3.6, -14);      // дерево — герой кадру ліворуч, ферма — тлом
  const TREE = new THREE.Vector3(-5.2, 0, 3);
  // рельєф: одна функція висоти на всіх — пологі горби до ~0,6 м удалині, дрібні купини біля камери;
  // дорога — рівна, трохи врізана колія; під будинком, коморою, трактором і деревом — рівні майданчики
  const hh2 = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
  const vn2 = (x, z) => { const ix = Math.floor(x), iz = Math.floor(z); let fx = x - ix, fz = z - iz; fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
    const a = hh2(ix, iz), b = hh2(ix + 1, iz), c = hh2(ix, iz + 1), d = hh2(ix + 1, iz + 1); return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz; };
  const gBig = (x, z) => .26 * Math.sin(x * .043 + 1.1) * Math.sin(z * .031 - .6) + .17 * Math.sin(x * .021 - z * .034 + 2.3) + .3 * (vn2(x * .06 + 3.7, z * .06 - 1.2) - .5);
  const PADS = [[13, -32, 7], [25, -64, 9], [-9.5, -40, 3.5], [TREE.x, TREE.z, 1.3]].map(([x, z, r]) => [x, z, r, gBig(x, z) - .03]);
  function groundH(x, z) {
    const b = gBig(x, z);
    let h = b + .12 * (vn2(x * .32 + 7.1, z * .32 - 3.3) - .5) + .05 * (vn2(x * 1.4 - 2.2, z * 1.4 + 5.1) - .5) + .016 * (vn2(x * 4.1, z * 4.1) - .5);
    h += (b - .07 - h) * (1 - sm(2.7, 4.3, Math.abs(x - 6)));                // дорога: лише пологий рельєф, на 7 см нижче
    for (const [px, pz, r, ph] of PADS) { const d = Math.hypot(x - px, z - pz); if (d < r + 4) h += (ph - h) * (1 - sm(r, r + 4, d)); }
    return h;
  }
  TREE.y = groundH(TREE.x, TREE.z);
  // вітер: один час для кукурудзи й трави; зміщення у вершинному шейдері росте з висотою стебла; uSy — «ріст» по висоті (замість scale.y сітки,
  // бо масштаб сітки зсунув би й основи на рельєфі)
  const windU = { value: 0 };
  const windy = (amp, freq, sy) => (mt) => { mt.onBeforeCompile = (sh) => { sh.uniforms.uWind = windU; sh.uniforms.uSy = sy;
      sh.vertexShader = 'uniform float uWind, uSy;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.y *= uSy;
        { vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          float ph = ip.x*${freq} + ip.z*${(freq*.6).toFixed(3)};
          float g = sin(uWind*1.4 + ph) + .5*sin(uWind*2.7 + ph*2.3 + 1.7) + .3*sin(uWind*.6 + ip.z*.05);
          transformed.x += g * position.y*position.y * ${amp}; transformed.z += g * position.y*position.y * ${(amp*.35).toFixed(3)}; }`); }; };
  // небо Землі
  const skyBU = { uSun: { value: new THREE.Vector3(0, 1, 0) }, uHor: { value: new THREE.Vector3() }, uZen: { value: new THREE.Vector3() }, uDay: { value: 1 }, uGlow: { value: 1 } };
  const skyB = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyBU,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vD; uniform vec3 uSun, uHor, uZen; uniform float uDay, uGlow;
      void main(){ vec3 d = normalize(vD); float h = d.y;
        vec3 c = mix(uHor, uZen, smoothstep(0., .6, h));
        float g = max(dot(d, uSun), 0.);
        c += vec3(1., .82, .6) * (pow(g, 8.)*.18 + pow(g, 90.)*.4) * uGlow;
        vec3 q = floor(d * 380.); float st = fract(sin(dot(q, vec3(12.9898,78.233,37.719))) * 43758.5453);
        c += vec3(.9) * step(.9982, st) * (1. - uDay) * smoothstep(.02, .25, h) * .8;
        gl_FragColor = vec4(c, 1.); }`
  }));
  skyB.renderOrder = -2; sB.add(skyB);

  // смуги Сонця й Місяця за довгої «витримки»: поверхня між крайніми схиленнями, яскравість — щільність днів (арксинус)
  function sunDir(H, dec, out) {                                   // світ: x — схід, y — вгору, z — південь
    const e = -Math.cos(dec) * Math.sin(H), n = Math.sin(dec) * Math.cos(LAT) - Math.cos(dec) * Math.cos(H) * Math.sin(LAT),
      u = Math.sin(dec) * Math.sin(LAT) + Math.cos(dec) * Math.cos(H) * Math.cos(LAT);
    return out.set(e, u, -n);
  }
  function band(decMax, col, amp) {
    const NH = 160, ND = 28, pos = [], s = [], idx = [], v = new THREE.Vector3();
    for (let j = 0; j <= ND; j++) for (let i = 0; i <= NH; i++) {
      const sj = -1 + 2 * j / ND; sunDir(-Math.PI + 2 * Math.PI * i / NH, decMax * sj, v).multiplyScalar(1300);
      pos.push(v.x, v.y, v.z); s.push(sj);
    }
    for (let j = 0; j < ND; j++) for (let i = 0; i < NH; i++) { const a = j * (NH + 1) + i, b = a + NH + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aS', new THREE.Float32BufferAttribute(s, 1)); g.setIndex(idx);
    const u = { uAmt: { value: 0 }, uCol: { value: new THREE.Vector3(...col) } };
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, uniforms: u,
      vertexShader: 'attribute float aS; varying float vS; varying float vUp; void main(){ vS = aS; vUp = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `uniform float uAmt; uniform vec3 uCol; varying float vS; varying float vUp;
        void main(){ float a = abs(vS); float dens = min(1. / sqrt(max(1. - a*a, .015)), 4.5) * .22 * smoothstep(1., .965, a);
          float hz = smoothstep(-.01, .07, vUp);
          vec3 c = mix(vec3(1., .6, .35), uCol, smoothstep(.0, .25, vUp));
          gl_FragColor = vec4(c * dens * hz * uAmt * ${amp.toFixed(2)}, 1.); }`
    }));
    m.renderOrder = -1; m.userData.u = u; return m;
  }
  const sunBand = band(23.44 * Math.PI / 180, [1, .93, .78], 1), moonBand = band(28.5 * Math.PI / 180, [.72, .8, 1], .35);
  sB.add(sunBand, moonBand);
  function glowTex(stops) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const sunSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex([[0, 'rgba(255,255,250,1)'], [.12, 'rgba(255,246,220,1)'], [.2, 'rgba(255,220,160,.45)'], [1, 'rgba(255,190,120,0)']]), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sunSpr.scale.setScalar(260); sB.add(sunSpr);
  const moonSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex([[0, 'rgba(240,244,255,1)'], [.1, 'rgba(230,236,255,1)'], [.16, 'rgba(180,200,255,.25)'], [1, 'rgba(150,170,255,0)']]), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  moonSpr.scale.setScalar(120); sB.add(moonSpr);

  const sun = new THREE.DirectionalLight(0xfff2dc, 2.6), moon = new THREE.DirectionalLight(0x9fb4ff, 0), hemi = new THREE.HemisphereLight(0xbcd2ff, 0x6b5a40, 1);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 300 }); sun.shadow.camera.updateProjectionMatrix();
  sun.target.position.set(2, 0, -30);                                   // центр карти тіней — між деревом і будинком
  sB.add(sun, sun.target, moon, moon.target, hemi); [sun, moon, hemi].forEach((l) => l.layers.enable(1));   // шар 1 — листок-герой (окремий прохід)

  // земля: шум кольору, сніг і пори року — через колір матеріалу
  function noiseTex(n, lo, hi) {
    const d = new Uint8Array(n * n * 4); for (let i = 0; i < n * n; i++) { const v = lo + (hi - lo) * Math.random() * Math.random() + (hi - lo) * .3 * Math.random(); d.set([v, v, v, 255], i * 4); }
    const t = new THREE.DataTexture(d, n, n); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
  }
  const grTex = noiseTex(128, 150, 255); grTex.repeat.set(220, 220);
  // сітка землі: густа (крок ~0,4 м) біля камери й дерева, що далі — то рідша; висоти з groundH, нормалі — computeVertexNormals
  const gAx = (c) => { const a = [c]; for (let x = c; x < 1500;) { x = Math.min(1500, x + .4 + .06 * (x - c)); a.push(x); } for (let x = c; x > -1500;) { x = Math.max(-1500, x - .4 - .06 * (c - x)); a.unshift(x); } return a; };
  const groundGeo = (() => { const gX = gAx(-2), gZ = gAx(12), nX = gX.length, P = [], UV = [], I = [];
    gZ.forEach((z) => gX.forEach((x) => { P.push(x, groundH(x, z), z); UV.push((x + 1500) / 3000, (1500 - z) / 3000); }));
    for (let j = 0; j < gZ.length - 1; j++) for (let i = 0; i < nX - 1; i++) { const a = j * nX + i, b = a + nX; I.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    g.setIndex(I); g.computeVertexNormals(); return g; })();
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ map: grTex, color: 0x7a8a4a }));
  ground.receiveShadow = true; sB.add(ground);
  const drape = (g, dy) => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, groundH(pa.getX(i), pa.getZ(i)) + dy); g.computeVertexNormals(); return g; };
  // дорога — пряма, від переднього плану до обрію; дві темніші колії; лягає на рельєф
  const roadM = new THREE.MeshLambertMaterial({ map: grTex, color: 0x9a8a6c, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const road = new THREE.Mesh(drape(new THREE.PlaneGeometry(5.2, 260, 4, 260).rotateX(-Math.PI / 2).translate(6, 0, -70), .02), roadM); road.receiveShadow = true; sB.add(road);
  const rutM = new THREE.MeshLambertMaterial({ map: grTex, color: 0x7d6d52, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  [-.85, .85].forEach((dx) => { const r = new THREE.Mesh(drape(new THREE.PlaneGeometry(.5, 260, 1, 260).rotateX(-Math.PI / 2).translate(6 + dx, 0, -70), .03), rutM); r.receiveShadow = true; sB.add(r); });

  // будинок ферми, комора, пікап біля дороги, трактор на краю поля — GLB-моделі; ґанок/ворота/капот — на камеру
  const winM = new THREE.MeshLambertMaterial({ color: 0x2b3238, emissive: 0x000000 }), roofM = new THREE.MeshLambertMaterial({ color: 0x4d4e55 });
  // сніг на дахах: у шейдері моделі біліють грані, повернуті вгору (дах — частина текстури GLB, окремого матеріалу немає)
  const snowU = { value: 0 };
  const snowy = (mt) => { mt.onBeforeCompile = (sh) => { sh.uniforms.uSnow = snowU;
      sh.fragmentShader = 'uniform float uSnow;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float upN = dot(normalize(vNormal), normalize((viewMatrix * vec4(0., 1., 0., 0.)).xyz));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.93, .95, .97), uSnow * smoothstep(.3, .65, upN));`); };
    mt.needsUpdate = true; };
  const house = new THREE.Group(); house.position.set(13, groundH(13, -32), -32); house.rotation.y = -Math.PI / 2 + .3; sB.add(house); model('farmhouse', house, { fix: snowy });   // ґанок (+Z моделі) — до дороги й трохи на камеру
  const barn = new THREE.Group(); barn.position.set(25, groundH(25, -64), -64); barn.rotation.y = -Math.PI / 2 + .15; sB.add(barn); model('barn', barn, { fix: snowy });
  // вночі в будинку світло: тепла лампа біля ґанку й м'яке сяйво на фасаді
  const porch = new THREE.PointLight(0xffc27a, 0, 18, 1.6); porch.position.set(1.2, 2.5, 4.8); house.add(porch);     // над сходами ґанку (локальні координати моделі)
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 64; { const x = glowC.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,200,130,1)'); g.addColorStop(1, 'rgba(255,170,90,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
  const porchGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  porchGlow.scale.setScalar(3.2); porchGlow.position.copy(porch.position); house.add(porchGlow);
  const pickup = new THREE.Group(); pickup.position.set(6.9, groundH(6.9, -24), -24); sB.add(pickup); model('pickup', pickup, { rotY: .1 });      // на дорозі біля ґанку, капотом до глядача
  const tractor = new THREE.Group(); tractor.position.set(-9.5, groundH(-9.5, -40), -40); sB.add(tractor); model('tractor', tractor, { rotY: 2.3 });  // на краю поля
  // огорожа: стовпчики й дві жердини, паралельно дорозі з обох боків (ліворуч — уздовж поля, праворуч — до садиби)
  const fenceM = new THREE.MeshLambertMaterial({ color: 0x6d5a45 });
  const fence = [];                                                       // [x, z0, z1]
  fence.push([2.6, 42, -120], [9.4, 42, -24]);
  const spans = fence.flatMap(([x, z0, z1]) => { const n = Math.floor((z0 - z1) / 3); return Array.from({ length: n }, (_, i) => [x, z0 - i * 3]); });
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(.13, 1.15, .13), fenceM, spans.length + fence.length);
  const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(.06, .09, 3), fenceM, spans.length * 2);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s1 = new THREE.Vector3(1, 1, 1), Zm = new THREE.Vector3(0, 0, -1); let k = 0, r = 0;
    spans.forEach(([x, z]) => { const h0 = groundH(x, z), h1 = groundH(x, z - 3); m.makeTranslation(x, h0 + .57, z); posts.setMatrixAt(k++, m);
      q.setFromUnitVectors(Zm, v.set(0, h1 - h0, -3).normalize());          // жердина — за схилом між стовпчиками
      [.5, .95].forEach((h) => { m.compose(v.set(x, (h0 + h1) / 2 + h, z - 1.5), q, s1); rails.setMatrixAt(r++, m); }); });
    fence.forEach(([x, , z1]) => { m.makeTranslation(x, groundH(x, z1) + .57, z1); posts.setMatrixAt(k++, m); }); }
  posts.castShadow = rails.castShadow = true; sB.add(posts, rails);

  // кукурудзяне поле: стебло + листя, інстанси; висота й колір — за порою року
  const cg = [];
  { const st = new THREE.CylinderGeometry(.018, .028, 1, 4, 1); st.translate(0, .5, 0); cg.push(st);
    for (let k = 0; k < 4; k++) { const lf = new THREE.PlaneGeometry(.55, .07); lf.translate(.27, 0, 0); lf.rotateZ(-.5); lf.rotateY(k * 1.9); lf.translate(0, .3 + k * .16, 0); cg.push(lf); }
    const tas = new THREE.ConeGeometry(.05, .18, 4); tas.translate(0, 1.04, 0); cg.push(tas); }
  const cornGeo = mergeGeometries(cg.map((g) => g.toNonIndexed()));
  const cornSy = { value: 1 }, cornM = new THREE.MeshLambertMaterial({ color: 0x5f8a2c, side: THREE.DoubleSide }); windy(.09, .9, cornSy)(cornM);
  // рядами вздовж дороги (по z), ліворуч від огорожі, крок рядів .85 м
  const NC = 12000, corn = new THREE.InstancedMesh(cornGeo, cornM, NC);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color(); let i = 0;
    for (let r = 0; r < 60 && i < NC; r++) for (let k = 0; k < 200 && i < NC; k++, i++) {
      p.set(-11 - r * .85 + (Math.random() - .5) * .12, 0, -8 - k * .6 + (Math.random() - .5) * .25); p.y = groundH(p.x, p.z) - .02;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 6.28); const h = 2.4 * (.85 + Math.random() * .3); s.set(1, h, 1);
      m.compose(p, q, s); corn.setMatrixAt(i, m); c.setScalar(.82 + Math.random() * .3); corn.setColorAt(i, c);
    } }
  corn.frustumCulled = false; corn.receiveShadow = true; sB.add(corn);

  // трава — як у прогулянці «отелю»: тонкі стебла з вітром і градієнтом від кореня, але не суцільним полем, а купинами:
  // випадкові кущі різного розміру й висоти, між ними гола земля; стебла в купині розходяться назовні від центру
  const bladeGeo = (() => { const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-.009, 0, 0, .009, 0, 0, -.007, .38, .02, .007, .38, .02, -.004, .72, .06, .004, .72, .06, 0, 1, .12], 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Array(7).fill([0, .25, 1]).flat(), 3));
    g.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6]); return g; })();
  const grassM = new THREE.MeshLambertMaterial({ color: 0x6f8f3a, side: THREE.DoubleSide });
  const grassSy = { value: 1 };
  grassM.onBeforeCompile = (sh) => { sh.uniforms.uWind = windU; sh.uniforms.uSy = grassSy;
    sh.vertexShader = 'uniform float uWind, uSy; varying float vGy;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vGy = position.y; transformed.y *= uSy;
      { vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        float ph = ip.x*1.3 + ip.z*.78;
        float g = sin(uWind*1.4 + ph) + .5*sin(uWind*2.7 + ph*2.3 + 1.7) + .3*sin(uWind*.6 + ip.z*.05);
        transformed.x += g * position.y*position.y * .3; transformed.z += g * position.y*position.y * .1; }`);
    sh.fragmentShader = 'varying float vGy;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      diffuseColor.rgb *= mix(vec3(.42, .5, .3), vec3(1.08, 1.12, .92), smoothstep(0., 1., vGy));`); };
  const NG = 110000, grass = new THREE.InstancedMesh(bladeGeo, grassM, NG);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color(), Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0); let i = 0;
    while (i < NG) {
      // центр купини: густіше біля камери; не на дорозі й не в кукурудзі
      const cz = 42 - 120 * Math.pow(Math.random(), 1.6), cx = -40 + 85 * Math.random();
      if (Math.abs(cx - 6) < 3.6 || (cx < -10.4 && cz < -7)) continue;
      const dT = Math.hypot(cx - TREE.x, cz - TREE.z);
      const big = Math.pow(Math.random(), 2.2), R = .1 + .45 * big, n = Math.round(10 + 50 * big * (1 + Math.random())), H = (.45 + .75 * Math.random()) * (dT < 3.5 ? .35 + .65 * dT / 3.5 : 1);
      const dry = Math.random() < .3 ? .55 + .3 * Math.random() : 0;          // частина купин — підсохлі
      for (let k = 0; k < n && i < NG; k++, i++) {
        const r = R * Math.sqrt(Math.random()), a = Math.random() * 6.28, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        p.set(x, groundH(x, z) - .02, z); q.setFromAxisAngle(Y, -a + Math.PI / 2 + (Math.random() - .5) * .8);
        q2.setFromAxisAngle(X, .15 + .9 * r / R * Math.random()); q.multiply(q2);   // нахил назовні — тим більший, чим ближче до краю
        const h = .62 * H * (1 - .45 * r / R) * (.6 + .7 * Math.random()); s.set(.8 + Math.random() * .6, h, 1);
        m.compose(p, q, s); grass.setMatrixAt(i, m);
        c.setRGB(.82 + Math.random() * .3, .86 + Math.random() * .28, .78 + Math.random() * .3); if (dry) c.lerp(c.clone().setRGB(1.35, 1.15, .62), dry); grass.setColorAt(i, c);
      }
    } }
  grass.frustumCulled = false; grass.receiveShadow = true; sB.add(grass);

  // пилова імла: частинки, що повільно дрейфують; густішає з роками
  const NDU = 700, dPos = new Float32Array(NDU * 3);
  for (let i = 0; i < NDU; i++) dPos.set([(Math.random() - .5) * 90, Math.random() * 18, 40 - Math.random() * 110], i * 3);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ map: glowTex([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]), color: 0xc8b28a, size: .22, transparent: true, opacity: 0, depthWrite: false }));
  sB.add(dust);

  /* дерево: гілки — ланцюжки сегментів, що звужуються й вигинаються (варіація кутів, гравітропізм: молоді пагони тягнуться
     вгору, довгі гілки провисають до кінчиків), дрібні гілочки; стовбур із кореневим розширенням; кора — процедурна текстура
     з рельєфом (bump). Листя — окремі картки з альфа-формою листка (прожилки, зубчастий край), двосторонні з просвічуванням
     від Сонця, «хмарами» на кінцях гілочок із просвітами; восени кожен листок жовтіє/червоніє по-своєму. */
  let seed = 7; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const nodes = [], UP = new THREE.Vector3(0, 1, 0);
  function tilt(dir, ang, az) {
    const a = Math.abs(dir.y) < .95 ? UP : new THREE.Vector3(1, 0, 0);
    const u = new THREE.Vector3().crossVectors(dir, a).normalize(), w = new THREE.Vector3().crossVectors(dir, u);
    return dir.clone().multiplyScalar(Math.cos(ang)).addScaledVector(u, Math.sin(ang) * Math.cos(az)).addScaledVector(w, Math.sin(ang) * Math.sin(az)).normalize();
  }
  // форма дуба: короткий товстий стовбур, мало скелетних гілок, але товсті й покручені, розходяться широко → широка округла крона
  // (висота : ширина ≈ 1 : 1,1); далі — короткі гілки й тонкі пагони, на кінцях яких висить листя
  const SEGN = [4, 4, 3, 2, 1, 1];                                          // сегментів на гілку за рівнем (5 — тонкі пагони)
  function branch(parent, level, t, dir0, len, rad, birth) {
    // полілінія гілки: кожен сегмент трохи відхиляється (скелетні — помітно покручені); стовбур тягнеться вгору, гілки — майже горизонтально
    const K = SEGN[level], dirs = [], grav = level === 0 ? .14 : level === 1 ? .03 : level === 2 ? -.01 : -.05, bend = level === 0 ? .1 : level === 1 ? .34 : .22 + .06 * level;
    let d = dir0.clone();
    for (let k = 0; k < K; k++) { d = tilt(d, bend * rnd(), rnd() * 6.28); d.y += grav * (level >= 2 ? (k + 1) / K : 1); d.normalize(); dirs.push(d.clone()); }
    const n = { parent, level, t, dirs, len, rad, birth, p0: new THREE.Vector3(), Le: 0, Re: 0, pts: dirs.map(() => new THREE.Vector3()), tip: new THREE.Vector3() }; nodes.push(n);
    if (level >= 5) return n;
    const nk = [5, 3, 3, 2, 2][level];
    for (let i = 0; i < nk; i++) {
      const tt = level === 0 ? .42 + .5 * (i + rnd() * .7) / nk : .3 + .65 * (i + rnd()) / nk;
      const pd = dirs[Math.min(K - 1, Math.floor(tt * K))];
      let dd = tilt(pd, (level === 0 ? 1. : .55) + rnd() * .4, i * 2.4 + rnd() * 1.2); dd.y += level === 0 ? .12 : .15; dd.normalize();
      const L = len * (level === 0 ? (1 - .3 * tt) * (.85 + .3 * rnd()) : level === 4 ? .45 + rnd() * .15 : .55 + rnd() * .15);
      const bth = level === 0 ? -1.8 + tt * 3 + rnd() : level === 4 ? birth + .3 + rnd() * .8 : birth + .6 + rnd() * 1.4;   // крона заповнюється за ~6–8 років
      branch(n, level + 1, tt, dd, L, rad * .62 * (1.08 - .35 * tt), bth);
    }
    if (level <= 2) { const dd = tilt(dirs[K - 1], .15 + rnd() * .2, rnd() * 6.28); branch(n, level + 1, 1, dd, len * (level === 0 ? .5 : .5), rad * .62, birth + (level === 0 ? 1.2 : 1.6)); }   // лідер з кінця
    return n;
  }
  branch(null, 0, 0, new THREE.Vector3(.03, 1, .02).normalize(), 3.2, .36, -3);
  const NB = nodes.length, NSEG = nodes.reduce((a, n) => a + n.dirs.length, 0);
  // кора: процедурна текстура — звивисті вертикальні борозни, що сходяться й розходяться (пластини між ними, як у в'яза/дуба),
  // поперечні тріщини, плями лишайника; окреме полотно — карта висот для bump (борозни глибокі, пластини опуклі)
  const [barkTex, barkBump] = (() => { const W = 256, H = 512, c = document.createElement('canvas'), b = document.createElement('canvas'); c.width = b.width = W; c.height = b.height = H;
    const x = c.getContext('2d'), y = b.getContext('2d');
    x.fillStyle = '#6b5644'; x.fillRect(0, 0, W, H); y.fillStyle = '#b4b4b4'; y.fillRect(0, 0, W, H);
    for (let k = 0; k < 500; k++) { const v = Math.random(); x.fillStyle = v < .5 ? `rgba(40,30,22,${.1 + Math.random() * .15})` : `rgba(150,132,110,${.08 + Math.random() * .14})`; x.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 8, 4 + Math.random() * 20); }
    const path = (ctx, pts, dx) => { ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px + dx, py) : ctx.moveTo(px + dx, py)); ctx.stroke(); };
    for (let k = 0; k < 34; k++) {                                          // борозни
      const pts = []; let px = Math.random() * W, py = -30; while (py < H + 30) { pts.push([px, py]); py += 8 + Math.random() * 18; px += (Math.random() - .5) * 16; }
      const w = 3 + Math.random() * 6;
      [-W, 0, W].forEach((dx) => { x.strokeStyle = `rgba(26,18,12,${.6 + Math.random() * .3})`; x.lineWidth = w; path(x, pts, dx); y.strokeStyle = '#141414'; y.lineWidth = w; path(y, pts, dx);
        x.strokeStyle = 'rgba(165,145,120,.18)'; x.lineWidth = 1.5; path(x, pts.map(([a, b]) => [a + w * .9, b]), dx); });   // світлий край пластини
    }
    for (let k = 0; k < 140; k++) { const px = Math.random() * W, py = Math.random() * H, w = 4 + Math.random() * 12, t = (Math.random() - .5) * 4;   // поперечні тріщини
      x.strokeStyle = 'rgba(30,22,15,.55)'; y.strokeStyle = '#303030'; x.lineWidth = y.lineWidth = 1 + Math.random() * 1.5;
      [x, y].forEach((ctx) => { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + w, py + t); ctx.stroke(); }); }
    for (let k = 0; k < 26; k++) { x.fillStyle = `rgba(${120 + Math.random() * 30},${130 + Math.random() * 25},${100 + Math.random() * 20},${.12 + Math.random() * .16})`;   // лишайник
      x.beginPath(); x.ellipse(Math.random() * W, Math.random() * H, 4 + Math.random() * 12, 3 + Math.random() * 9, Math.random() * 3, 0, 7); x.fill(); }
    if ('filter' in y) { y.filter = 'blur(1.5px)'; y.drawImage(b, 0, 0); }
    return [c, b].map((cv, i) => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); if (!i) t.colorSpace = THREE.SRGBColorSpace; return t; }); })();
  const barkP = { map: barkTex, bumpMap: barkBump, bumpScale: 2.2, roughness: .95, metalness: 0, color: 0xc4b29c };
  const barkM = new THREE.MeshStandardMaterial(barkP), rootM = new THREE.MeshStandardMaterial(barkP);
  // гілки тоншають плавно: сегмент — циліндр, верхній радіус = нижній × aTp (aTp — співвідношення сусідніх радіусів профілю гілки)
  const taper = (sh) => { sh.vertexShader = 'attribute float aTp;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed.xz *= mix(1., aTp, position.y);'); };
  barkM.onBeforeCompile = taper;
  const brGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); brGeo.translate(0, .5, 0);
  const TPK = (n) => n.level >= 3 ? .7 : .4;                               // наскільки гілка тоншає до кінчика (скелетні — менше: з кінця росте лідер)
  const prof = (n, u) => 1 - TPK(n) * u;
  { const a = new Float32Array(NSEG); let si = 0; nodes.forEach((n) => { const K = n.dirs.length; for (let k = 0; k < K; k++) a[si++] = prof(n, (k + 1) / K) / prof(n, k / K); });
    brGeo.setAttribute('aTp', new THREE.InstancedBufferAttribute(a, 1)); }
  const bark = new THREE.InstancedMesh(brGeo, barkM, NSEG); bark.frustumCulled = false; bark.castShadow = bark.receiveShadow = true; sB.add(bark);
  bark.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }); bark.customDepthMaterial.onBeforeCompile = taper;
  // кореневе розширення: розтруб донизу з нерівними «лапами» коренів
  const rootGeo = new THREE.CylinderGeometry(1, 1, 1, 20, 6, true); rootGeo.translate(0, .5, 0);
  { const pa = rootGeo.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i), x = pa.getX(i), z = pa.getZ(i), ang = Math.atan2(z, x);
      const lobe = Math.max(0, Math.sin(ang * 5 + .7) + .4 * Math.sin(ang * 3 - 1.1)), k = 1 + Math.pow(1 - y, 2.4) * (.45 + 1.1 * lobe);
      pa.setX(i, x * k); pa.setZ(i, z * k); } rootGeo.computeVertexNormals(); }
  const root = new THREE.Mesh(rootGeo, rootM); root.castShadow = root.receiveShadow = true; sB.add(root);
  // листок: альфа-форма (овал із зубчастим краєм), прожилки, світлі плями
  const leafTex = (() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'); x.clearRect(0, 0, 128, 128);
    x.save(); x.translate(64, 120); x.beginPath();
    for (let i = 0; i <= 80; i++) { const u = i / 80, w = Math.pow(Math.sin(Math.PI * Math.pow(u, .85)), .9) * 34 * (1 + .06 * Math.sin(u * 60)); x.lineTo(w, -u * 112); }
    for (let i = 80; i >= 0; i--) { const u = i / 80, w = Math.pow(Math.sin(Math.PI * Math.pow(u, .85)), .9) * 34 * (1 + .06 * Math.sin(u * 60 + 1.3)); x.lineTo(-w, -u * 112); }
    x.closePath(); x.fillStyle = '#e8f0d8'; x.fill(); x.clip();
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(255,255,255,${.08 + Math.random() * .12})`; x.beginPath(); x.ellipse((Math.random() - .5) * 60, -Math.random() * 110, 6 + Math.random() * 10, 4 + Math.random() * 8, Math.random() * 3, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(70,90,40,.75)'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(0, 4); x.lineTo(0, -112); x.stroke();
    x.lineWidth = 1.1; x.strokeStyle = 'rgba(70,90,40,.5)';
    for (let k = 1; k < 9; k++) { const y = -k * 12; [1, -1].forEach((sg) => { x.beginPath(); x.moveTo(0, y); x.quadraticCurveTo(sg * 14, y - 6, sg * 30 * Math.sin(Math.PI * k / 9.5), y - 18); x.stroke(); }); }
    x.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  // просвічування: світло з-за листка (двосторонній Lambert) додається як м'яке жовто-зелене свічення
  const translucent = (mt) => { mt.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      #if NUM_DIR_LIGHTS > 0
      { float bl = max(-dot(normal, directionalLights[0].direction), 0.);
        totalEmissiveRadiance += diffuseColor.rgb * vec3(1., 1.05, .55) * directionalLights[0].color * bl * .45; }
      #endif`); }; };
  // пагін-гілочка: на одній картці тонке стебельце й 7 листків по 6–10 см (3 пари + верхівковий), кожен трохи іншого відтінку;
  // низ картки — точка кріплення стебельця до гілки
  // альфа картки — номер листка: стебельце 1,0, листок k — 0,55 + 0,06·k (краї жорсткі, alphaTest). Шейдер за цим номером «вимикає»
  // листки, що вже облетіли, — пагін восени рідшає по одному листку
  const sprigTex = (() => { const W = 128, H = 256, c = document.createElement('canvas'), tc = document.createElement('canvas'); c.width = tc.width = W; c.height = tc.height = H;
    const x = c.getContext('2d'), y = tc.getContext('2d', { willReadFrequently: true }), acc = x.createImageData(W, H), A = acc.data;
    const merge = (id) => { const d = y.getImageData(0, 0, W, H).data; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { A[i] = d[i]; A[i + 1] = d[i + 1]; A[i + 2] = d[i + 2]; A[i + 3] = id; } y.clearRect(0, 0, W, H); };
    const leaf = (px, py, ang, len, wid, br) => { y.save(); y.translate(px, py); y.rotate(ang); y.beginPath();
      for (let i = 0; i <= 24; i++) { const u = i / 24; y.lineTo(Math.pow(Math.sin(Math.PI * Math.pow(u, .8)), .9) * wid * (1 + .07 * Math.sin(u * 40)), -u * len); }
      for (let i = 24; i >= 0; i--) { const u = i / 24; y.lineTo(-Math.pow(Math.sin(Math.PI * Math.pow(u, .8)), .9) * wid * (1 + .07 * Math.sin(u * 40 + 1)), -u * len); }
      y.closePath(); const v = Math.round(200 + 40 * br); y.fillStyle = `rgb(${v},${v + 12},${v - 30})`; y.fill();
      y.strokeStyle = 'rgba(70,90,40,.6)'; y.lineWidth = 1.2; y.beginPath(); y.moveTo(0, 0); y.lineTo(0, -len * .95); y.stroke();
      y.lineWidth = .7; for (let k = 1; k < 5; k++) { const yy = -len * k / 5.5; [1, -1].forEach((sg) => { y.beginPath(); y.moveTo(0, yy); y.lineTo(sg * wid * .7, yy - len * .12); y.stroke(); }); }
      y.restore(); };
    const sx = (yy) => 64 + 5 * Math.sin((256 - yy) / 60);                // стебельце трохи вигнуте
    y.strokeStyle = 'rgb(120,100,75)'; y.lineWidth = 3; y.beginPath(); for (let yy = 256; yy >= 70; yy -= 8) y.lineTo(sx(yy), yy); y.stroke(); merge(255);
    [[200, 1], [165, -1], [130, 1], [100, -1], [80, 1], [72, -1]].forEach(([yy, sg], k) => { leaf(sx(yy), yy, sg * (.95 - k * .07), 58 - k * 2, 15, Math.random()); merge(Math.round((.55 + .06 * k) * 255)); });
    leaf(sx(70), 72, .05, 62, 16, Math.random()); merge(Math.round((.55 + .06 * 6) * 255));
    x.putImageData(acc, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.premultiplyAlpha = false; return t; })();
  // листя: кожна картка-пагін кріпиться стебельцем до точки на гілці (переважно на тонких пагонах рівнів 4–5), дивиться від гілки
  // назовні й угору до світла. Листя є на всіх гілках, на кожному кінчику; просвіти неба — між масами листя на окремих гілках.
  // На стовбурі й скелетних гілках (рівні 0–2) — молоді пагони, поки дерево мале; з роками вони відмирають (крона йде на периферію).
  const leafs = [], XA = new THREE.Vector3(), YA = new THREE.Vector3(), ZA = new THREE.Vector3(), MB = new THREE.Matrix4();
  function mkCard(n, t, retire) {
    const d = n.dirs[Math.min(n.dirs.length - 1, Math.floor(t * n.dirs.length))];
    YA.copy(d).multiplyScalar(.6).add(XA.set((rnd() - .5) * .9, .55, (rnd() - .5) * .9)).normalize();     // стебельце: від гілки назовні й угору
    ZA.set((rnd() - .5) * .5, 1, (rnd() - .5) * .5).addScaledVector(YA, -YA.y); if (ZA.lengthSq() < 1e-3) ZA.set(1, 0, 0);
    ZA.addScaledVector(YA, -ZA.dot(YA)).normalize(); XA.crossVectors(YA, ZA);                              // лицем — до неба
    const q = new THREE.Quaternion().setFromRotationMatrix(MB.makeBasis(XA, YA, ZA));
    const tint = new THREE.Color(1 + (rnd() - .5) * .18, 1 + (rnd() - .5) * .1, 1 + (rnd() - .5) * .4);   // варіація відтінку: жовтіші / сизіші
    return { n, t, q, size: .3 + rnd() * .1, ft: .6 + rnd() * .22, hue: rnd(), drift: new THREE.Vector3((rnd() - .5) * 5, 0, (rnd() - .5) * 5), ph: rnd() * 6.28,
      v: .82 + rnd() * .36, tint, retire, gx: 1e9, gz: 0, gh: 0 };
  }
  nodes.forEach((n) => {
    if (!n.level) { for (let k = 0; k < 12; k++) leafs.push(mkCard(n, .5 + .5 * rnd(), 3)); return; }   // саджанець: пагони просто на верхівці стовбура
    n.dens = n.level <= 2 ? .85 + .3 * rnd() : n.parent.dens * (.9 + .2 * rnd());   // густота рівна: просвіти — лише між масами листя
    const cnt = n.level === 1 ? 8 : n.level === 2 ? 6 : Math.round([0, 0, 0, 7, 16, 22][n.level] * n.dens * (.8 + .4 * rnd()));   // тонких гілочок (4–5) удвічі більше — крона дорослого дерева густа
    const retire = 1e9;                                                  // пагони на товстих гілках не відмирають — всередині крони теж листя (його притінює AO)
    for (let k = 0; k < cnt; k++) leafs.push(mkCard(n, n.level <= 3 ? .3 + .7 * rnd() : .2 + .8 * (k + rnd()) / cnt, retire));
    if (n.level >= 3) for (let k = 0; k < 2; k++) leafs.push(mkCard(n, 1, retire));   // кожен кінчик — з пагонами, голих кінців поза кроною немає
  });
  const NL = leafs.length;
  const leafGeo = new THREE.PlaneGeometry(.5, 1, 2, 2); leafGeo.translate(0, .5, 0);              // низ картки — у точці кріплення
  { const pa = leafGeo.attributes.position; for (let i = 0; i < pa.count; i++) if (Math.abs(pa.getX(i)) < .01) pa.setZ(i, -.06); leafGeo.computeVertexNormals(); }   // листки трохи розходяться «човником»
  const LF = new Float32Array(NL); leafGeo.setAttribute('aFall', new THREE.InstancedBufferAttribute(LF, 1));   // частка листків, що облетіли з пагона
  const leafM = new THREE.MeshLambertMaterial({ map: sprigTex, alphaTest: .45, side: THREE.DoubleSide }); translucent(leafM);
  { const tr = leafM.onBeforeCompile; leafM.onBeforeCompile = (sh, r) => { tr(sh, r);
      sh.vertexShader = 'attribute float aFall; varying float vFall;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vFall = aFall;');
      sh.fragmentShader = 'varying float vFall;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        { float a = sampledDiffuseColor.a; if (a < .97 && floor((a - .55) / .06 + .5) < vFall * 7. - .001) discard; }`); }; }
  const leaves = new THREE.InstancedMesh(leafGeo, leafM, NL);
  leaves.setColorAt(0, new THREE.Color()); leaves.frustumCulled = false; leaves.castShadow = leaves.receiveShadow = true; leaves.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: sprigTex, alphaTest: .45 }); sB.add(leaves);
  const LC = new Float32Array(NL * 3);                                      // колір пагона (без AO) — для його опалих листків
  // окремі листки для листопаду: по одному на кожен третій пагін, ~7,5 × 10 см
  const NS1 = Math.ceil(NL / 3), SL = [], EU = new THREE.Euler();
  for (let j = 0; j < NS1; j++) { const c = j * 3; SL.push({ c, ft: leafs[c].ft + .01 + rnd() * .04, drift: new THREE.Vector3((rnd() - .5) * 5, 0, (rnd() - .5) * 5), ph: rnd() * 6.28,
    q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, rnd() * 6.28, 0, 'YXZ')), gx: 1e9, gz: 0, gh: 0 }); }
  const singleM = new THREE.MeshLambertMaterial({ map: leafTex, alphaTest: .45, side: THREE.DoubleSide }); translucent(singleM);
  const singles = new THREE.InstancedMesh(new THREE.PlaneGeometry(.075, .1), singleM, NS1); singles.setColorAt(0, new THREE.Color());
  singles.frustumCulled = false; singles.castShadow = singles.receiveShadow = true; sB.add(singles);
  const LP = new Float32Array(NL * 3), LS = new Float32Array(NL);            // положення листків на гілках (до падіння) — для AO крони
  // тінь під кроною — диск, накинутий на рельєф (вершини перераховуються, коли крона росте)
  const blobGeo = new THREE.PlaneGeometry(2, 2, 16, 16).rotateX(-Math.PI / 2), blobXZ = blobGeo.attributes.position.array.slice();
  const blob = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ map: glowTex([[0, 'rgba(20,24,10,.55)'], [1, 'rgba(20,24,10,0)']]), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  blob.position.copy(TREE); sB.add(blob); let blobS = -1;
  function blobFit(sc) { if (Math.abs(sc - blobS) < .03) return; blobS = sc; const pa = blobGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = blobXZ[i * 3] * sc, z = blobXZ[i * 3 + 2] * sc; pa.setXYZ(i, x, groundH(TREE.x + x, TREE.z + z) - TREE.y + .03, z); }
    pa.needsUpdate = true; blobGeo.computeBoundingSphere(); }
  // «дисонанс часу»: один листок «вирвано» з потоку часу ферми й покладено на потік часу Міллер — він рухається лише з планетним часом,
  // поки на фермі мчать роки й сезони; колір фіксується в момент відриву й далі не змінюється.
  const heroM = new THREE.MeshLambertMaterial({ map: leafTex, alphaTest: .45, side: THREE.DoubleSide }); translucent(heroM);
  const hero = new THREE.Mesh(new THREE.PlaneGeometry(.42, .55), heroM); hero.visible = false; hero.layers.set(1); sB.add(hero);
  // підсвітка листка «з іншого часу»: тепле м'яке сяйво за ним (додавання, без глибини) і ледь помітна пульсація — щоб око одразу його знаходило
  const heroGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex([[0, 'rgba(255,214,150,.85)'], [.35, 'rgba(255,170,90,.32)'], [1, 'rgba(255,150,60,0)']]), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false }));
  heroGlow.scale.setScalar(1.1); heroGlow.layers.set(1); heroGlow.renderOrder = -1; hero.add(heroGlow);
  heroM.emissive = new THREE.Color(0xffb060); heroM.emissiveIntensity = .35;
  // шлях: зривається з верхівки крони рівно після хвилі (tP = T_WAVE + 40 с) і летить навскіс через кадр — з лівого верху
  // в правий низ — аж до повернення на корабель (T_BACK). Положення — функція планетного часу: u = (tP − T_WAVE − 40)/(T_BACK − T_WAVE − 40),
  // тож на паузі листок завмирає, а повзунок водить його назад і вперед; до хвилі й після T_BACK його немає.
  // (кінцеву точку задаємо в екранних координатах камери ферми, щоб діагональ була саме на екрані)
  const HL = { t: 0, dur: 1, kind: 0, a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }, HL_PH = 1.7;      // t = u; сталі фаза й зсув — політ щоразу однаковий
  const hf = new THREE.Vector3(), hr = new THREE.Vector3(), hv = new THREE.Vector3();
  function atNdc(x, y, depth, out) {                                         // точка на екрані (x, y) на глибині depth від камери
    camB.updateMatrixWorld(); camB.getWorldDirection(hf);
    out.set(x, y, .5).unproject(camB).sub(camB.position).normalize();
    return out.multiplyScalar(depth / Math.max(.05, out.dot(hf))).add(camB.position);
  }
  hero.scale.setScalar(.5);                                                  // ~0,2 м — трохи більший за справжній, щоб читався в кадрі
  function heroLeaf() {
    const u = (tP - T_WAVE - 40) / (T_BACK - T_WAVE - 40);
    HL.kind = u >= 0 && u < 1 ? 1 : 0; HL.t = Math.max(0, Math.min(1, u)); hero.visible = HL.kind === 1;
    { const pz = .85 + .15 * Math.sin(performance.now() / 420); heroGlow.material.opacity = pz; heroGlow.scale.setScalar((1 / Math.max(.2, hero.scale.x)) * .55 * (1 + .08 * Math.sin(performance.now() / 420))); }
    if (!HL.kind) return;
    const h0 = treeH((T_WAVE + 40) / 3600 * K / HY), e0 = h0 * .45;           // дерево в момент відриву — точка старту не повзе вгору, поки дерево росте
    HL.a.set(TREE.x + .12 * e0, TREE.y + h0 * .93, TREE.z + e0 * .2);        // верхівка крони, з боку камери
    const d0 = hr.copy(HL.a).sub(camB.position).dot(camB.getWorldDirection(hf));
    hv.copy(HL.a).project(camB);
    atNdc(hv.x + .6, hv.y - .02, d0 * .4, HL.c);                             // підлітає до камери (вбік, на тло неба): на екрані стає ~2,5 раза більшим
    atNdc(1.08, -1.08, d0 * .38, HL.b);                                       // далі навскіс — вихід за правий нижній край
    // спершу тріпоче на гілці, за перші ~13 % відпливає ближче до камери (сповільнюючись), далі — повільний політ навскіс
    // із розгойдуванням «листопадом» і обертанням; усе — від u
    const e = u < .03 ? 0 : (u - .03) / .97, sw = Math.sin(Math.PI * e), w = u * 30;
    hr.crossVectors(hf, camB.up).normalize();
    const o = hero;
    if (e < .13) { const x = e / .13; o.position.copy(HL.a).lerp(HL.c, 1 - (1 - x) * (1 - x)); }
    else { const x = (e - .13) / .87; o.position.copy(HL.c).lerp(HL.b, x * x * .3 + x * .7); }
    o.position
      .addScaledVector(hr, Math.sin(w * 1.3 + HL_PH) * .9 * sw).addScaledVector(camB.up, Math.sin(w * 2.6 + HL_PH) * .18 * sw);
    { const gy = groundH(o.position.x, o.position.z) + .06; if (o.position.y < gy) o.position.y = gy; }   // не під землю
    // лицем переважно до камери (щоб читався), з перекиданням «листопадом»
    hero.quaternion.copy(camB.quaternion); hero.rotateZ(w * .9 + HL_PH); hero.rotateX(Math.sin(w * 1.9) * .75 + (u < .03 ? Math.sin(u * 3000) * .1 : 0)); hero.rotateY(Math.cos(w * 1.5) * .6);
  }

  const QW = new THREE.Quaternion(), QW2 = new THREE.Quaternion(), XAX = new THREE.Vector3(1, 0, 0);
  const M = new THREE.Matrix4(), QQ = new THREE.Quaternion(), V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), SC = new THREE.Vector3(), CC = new THREE.Color();
  const C = (h) => new THREE.Color(h);
  const COL = { bloom: C(0xf4dde6), spring: C(0x8db84a), summer: C(0x3f7a2a), yellow: C(0xe0b42a), orange: C(0xc8621e), red: C(0xa8301c), brown: C(0x8a6a3c) };
  let lastTree = { h: 0, age: -1 };
  function polyAt(n, t, out) {                                              // точка на полілінії гілки n за параметром 0…1
    const K = n.dirs.length, u = Math.min(K - 1e-6, Math.max(0, t * K)), k = Math.floor(u), fr = u - k;
    const a = k ? n.pts[k - 1] : n.p0, b = n.pts[k]; return out.copy(a).lerp(b, fr);
  }
  function tree(age, f, T) {
    const thick = .3 + .65 * (1 - Math.exp(-age / 12));
    let maxY = 0, ext = 0;
    for (const n of nodes) {
      const m = sm(n.birth, n.birth + 4, age), K = n.dirs.length;
      if (n.parent) { const P = n.parent; polyAt(P, n.t, n.p0); } else n.p0.set(0, 0, 0);
      n.Le = n.len * m * (n.parent && n.parent.Le === 0 ? 0 : 1); n.Re = n.rad * thick * (.35 + .65 * m);
      // точки полілінії гілки (у масштабі «росту» до множення на G)
      let px = n.p0.x, py = n.p0.y, pz = n.p0.z; const sl = n.Le / K;
      for (let k = 0; k < K; k++) { px += n.dirs[k].x * sl; py += n.dirs[k].y * sl; pz += n.dirs[k].z * sl; n.pts[k].set(px, py, pz); }
      n.tip.copy(n.pts[K - 1]); if (py > maxY) maxY = py;
    }
    const G = treeH(age) / maxY;
    let si = 0;
    for (let i = 0; i < NB; i++) {
      const n = nodes[i], K = n.dirs.length;
      if (n.Le <= 1e-4) { M.makeScale(0, 0, 0); for (let k = 0; k < K; k++) bark.setMatrixAt(si++, M); continue; }
      const sl = n.Le / K * G;
      for (let k = 0; k < K; k++) {
        V1.copy(k ? n.pts[k - 1] : n.p0).multiplyScalar(G); QQ.setFromUnitVectors(UP, n.dirs[k]);
        const r0 = n.Re * G * prof(n, k / K);                              // плавне звуження до кінчика (верх сегмента — aTp у шейдері)
        SC.set(r0, sl * 1.03, r0);
        const e = Math.hypot(V1.x, V1.z) + sl * Math.hypot(n.dirs[k].x, n.dirs[k].z); if (e > ext) ext = e;
        V1.add(TREE); M.compose(V1, QQ, SC); bark.setMatrixAt(si++, M);
      }
    }
    bark.instanceMatrix.needsUpdate = true;
    { const n0 = nodes[0], r0 = n0.Re * G; root.position.copy(TREE).y -= .06; root.scale.set(r0 * 1.02, Math.max(.3, r0 * 2.6), r0 * 1.02); }   // кореневе розширення (трохи в землю — на схилі не висить)
    // листя за порою року
    const bloom = sm(.02, .08, f) * (1 - sm(.11, .18, f));
    const grow = sm(.02, .08, f) * .55 + sm(.1, .22, f) * .45;
    const youth = 1 + .25 * (1 - sm(0, 5, age));
    // прохід 1: де листок на гілці; середнє й розкид живих листків — центр і «радіуси» крони для AO
    let cn = 0, cx = 0, cy = 0, cz = 0, cxx = 0, cyy = 0, czz = 0;
    for (let i = 0; i < NL; i++) {
      const L = leafs[i], n = L.n;
      const vis = n.Le > 1e-4 ? sm(n.birth + .5, n.birth + 2, age) * (1 - sm(L.retire, L.retire + 3, age)) : 0;
      LS[i] = L.size * youth * grow * vis * (1 + .7 * sm(3, 20, age));   // з роками пагони густішають і довшають: картка ×1 → ×1,7
      polyAt(n, L.t, V1).multiplyScalar(G).add(TREE); LP[i * 3] = V1.x; LP[i * 3 + 1] = V1.y; LP[i * 3 + 2] = V1.z;   // стебельце — точно на гілці
      if (vis > .5 && f <= L.ft) { cn++; cx += V1.x; cy += V1.y; cz += V1.z; cxx += V1.x * V1.x; cyy += V1.y * V1.y; czz += V1.z * V1.z; }
    }
    if (cn) { cx /= cn; cy /= cn; cz /= cn; }
    const rH = cn > 20 ? Math.sqrt(2.5 * Math.max(.01, cxx / cn - cx * cx + czz / cn - cz * cz)) : 1e3, rV = cn > 20 ? Math.sqrt(5 * Math.max(.01, cyy / cn - cy * cy)) : 1e3;
    const hT = treeH(age);
    // прохід 2: падіння, вітер, колір; затінення всередині крони (AO): глибше й нижче в кроні — темніше
    for (let i = 0; i < NL; i++) {
      const L = leafs[i]; let s = LS[i];
      V1.set(LP[i * 3], LP[i * 3 + 1], LP[i * 3 + 2]);
      const ax = (V1.x - cx) / rH, ay = (V1.y - cy) / rV, az = (V1.z - cz) / rH;
      const ao = (.4 + .6 * sm(.2, 1.05, Math.sqrt(ax * ax + ay * ay + az * az))) * (.75 + .25 * sm(-1, .4, ay));
      let q = L.q; const drop = LF[i] = sm(L.ft, L.ft + .06, f);             // листки облітають з пагона по одному (маска в шейдері)
      if (drop >= 1) s = 0;
      else if (!RM) {                                  // вітер: пагін гойдається навколо точки кріплення (основа лишається на гілці), вгорі сильніше
        const hy = Math.max(0, V1.y - TREE.y) / hT; QW.setFromAxisAngle(XAX, Math.sin(T * 1.7 + L.ph) * .12 + Math.sin(T * 1.1 + V1.x * .7) * .1 * hy); q = QW2.copy(L.q).multiply(QW); }
      if (f > .8 && f > L.ft + .03) s *= 1 - sm(.84, .9, f);
      SC.setScalar(Math.max(s, 0)); M.compose(V1, q, SC); leaves.setMatrixAt(i, M);
      // осінь: кожен листок за своїм розкладом (hue): одні жовтіють рано, інші червоніють, треті довго лишаються зеленими
      const tn = sm(.46 + L.hue * .14, .56 + L.hue * .14, f), lt = sm(.58 + L.hue * .1, .68 + L.hue * .1, f);
      CC.copy(COL.spring).lerp(COL.summer, sm(.18, .32, f)).lerp(L.hue < .35 ? COL.yellow : L.hue < .7 ? COL.orange : COL.red, tn * (.75 + .25 * L.v)).lerp(COL.brown, lt * .35);
      CC.lerp(COL.bloom, bloom); CC.multiply(L.tint).multiplyScalar(L.v); LC[i * 3] = CC.r; LC[i * 3 + 1] = CC.g; LC[i * 3 + 2] = CC.b;
      CC.multiplyScalar(ao); leaves.setColorAt(i, CC);
    }
    leaves.instanceMatrix.needsUpdate = true; leaves.instanceColor.needsUpdate = true; leafGeo.attributes.aFall.needsUpdate = true;
    // опалі листки: кожен окремо відривається від свого пагона, кружляючи падає й лежить на землі (на рельєфі) до снігу
    for (let j = 0; j < NS1; j++) { const S = SL[j], c = S.c, k = (f - S.ft) / .03;
      if (k <= 0 || LS[c] <= 0) { M.makeScale(0, 0, 0); singles.setMatrixAt(j, M); continue; }
      const kk = Math.min(1, k); V1.set(LP[c * 3], LP[c * 3 + 1] + .12, LP[c * 3 + 2]); V2.set(V1.x + S.drift.x, 0, V1.z + S.drift.z);
      if (Math.abs(V2.x - S.gx) + Math.abs(V2.z - S.gz) > .25) { S.gx = V2.x; S.gz = V2.z; S.gh = groundH(V2.x, V2.z) + .02; }
      const y0 = V1.y; V1.lerp(V2, kk); V1.y = y0 + (S.gh - y0) * kk; V1.x += Math.sin(kk * 9 + S.ph) * .5 * (1 - kk);
      const q = kk < 1 ? QW2.setFromEuler(EU.set(kk * 11 + S.ph, kk * 7, kk * 5)) : S.q;
      SC.setScalar(1 - sm(.84, .9, f)); M.compose(V1, q, SC); singles.setMatrixAt(j, M);
      CC.setRGB(LC[c * 3], LC[c * 3 + 1], LC[c * 3 + 2]).lerp(COL.brown, .45 * kk); singles.setColorAt(j, CC); }
    singles.instanceMatrix.needsUpdate = true; singles.instanceColor.needsUpdate = true;
    blobFit(Math.max(.6, ext * 1.1));
    // колір героя-листка — яким було листя дерева в момент відриву (tP = T_WAVE + 40 с), далі незмінний;
    // якщо тоді листя не було (зима, юне дерево) — однаково листок, теплий осінній: він «з іншого часу»
    { const y0 = (T_WAVE + 40) / 3600 * K / HY, f0 = fr(F0 + y0), g0 = sm(.02, .08, f0) * .55 + sm(.1, .22, f0) * .45, b0 = sm(.02, .08, f0) * (1 - sm(.11, .18, f0));
      if (g0 * (1 - sm(.8, .86, f0)) > .15 && y0 > .5) CC.copy(COL.spring).lerp(COL.summer, sm(.18, .32, f0)).lerp(COL.yellow, sm(.5, .6, f0)).lerp(COL.orange, sm(.6, .7, f0) * .5).lerp(COL.bloom, b0);
      else CC.copy(COL.yellow).lerp(COL.orange, .6);
      heroM.color.copy(CC).multiplyScalar(1.3); }
    heroLeaf();                                        // лише після хвилі (до повернення на корабель) — саме ця година коштувала роки
    lastTree = { h: treeH(age), age };
  }

  /* стан Землі на момент tP */
  const sd = new THREE.Vector3(), md = new THREE.Vector3(), avgDir = new THREE.Vector3(), tmp3 = new THREE.Color();
  const lerp3 = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
  let fast = 0, dtReal = 0;
  function earth(T) {
    const hE = tP / 3600 * K, years = hE / HY, f = fr(F0 + years), day = fr(10 / 24 + hE / 24), days = hE / 24;
    const dec = 23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * f), Hs = 2 * Math.PI * (day - .5);
    sunDir(Hs, dec, sd);
    const ph = fr(days / 29.53 + .3), mdec = 28.5 * Math.PI / 180 * Math.sin(2 * Math.PI * days / 27.32);
    sunDir(Hs - 2 * Math.PI * ph, mdec, md);
    // миттєве освітлення й «усереднене» (коли дні миготять — показуємо середнє, як на довгій витримці)
    const dI = sm(-.06, .22, sd.y), mI = sm(-.02, .15, md.y) * (1 - dI) * (.3 + .7 * Math.abs(Math.cos(Math.PI * ph)));
    const day1 = dI * (1 - fast) + .62 * fast;
    const dustA = Math.min(1, years / 30);
    let hor = lerp3([.05, .06, .1], [.8, .83, .87], dI), zen = lerp3([.015, .022, .06], [.33, .52, .8], dI);
    const low = dI * (1 - sm(.05, .3, sd.y)); hor = lerp3(hor, [.96, .62, .38], low * .75); zen = lerp3(zen, [.3, .34, .52], low * .5);
    hor = lerp3(hor, [.55, .58, .62], fast); zen = lerp3(zen, [.24, .34, .5], fast);
    hor = lerp3(hor, [.72 * day1 + .06, .63 * day1 + .05, .5 * day1 + .05], dustA * .55); zen = lerp3(zen, [.5 * day1, .46 * day1, .42 * day1], dustA * .35);
    skyBU.uHor.value.set(...hor); skyBU.uZen.value.set(...zen); skyBU.uDay.value = day1; skyBU.uSun.value.copy(sd); skyBU.uGlow.value = dI * (1 - fast) * (1 - .5 * dustA);
    sB.fog.color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace);
    sB.fog.density = .0045 + .00045 * Math.min(30, years);
    // світло
    avgDir.set(0, Math.sin(52 * Math.PI / 180), Math.cos(52 * Math.PI / 180));
    V1.copy(sd).lerp(avgDir, fast).normalize();
    sun.position.copy(V1).multiplyScalar(100).add(sun.target.position); sun.intensity = (2.7 * dI * (1 - fast) + 1.7 * fast) * (1 - .35 * dustA);
    tmp3.setRGB(1, .8 + .2 * sm(.05, .4, sd.y), .6 + .38 * sm(.05, .4, sd.y)); sun.color.copy(tmp3).lerp(C(0xfff2dc), fast);
    moon.position.copy(md).multiplyScalar(100); moon.intensity = .5 * mI * (1 - fast);
    hemi.intensity = .3 + .85 * day1; hemi.color.setRGB(...lerp3([.35, .42, .7], [.75, .82, 1], day1), THREE.SRGBColorSpace);
    sunSpr.position.copy(sd).multiplyScalar(1200); sunSpr.material.opacity = (1 - fast) * sm(-.03, .02, sd.y) * (1 - .4 * dustA);
    moonSpr.position.copy(md).multiplyScalar(1200); moonSpr.material.opacity = (1 - fast) * sm(-.03, .02, md.y) * (1 - .6 * dI) * (.25 + .75 * Math.abs(Math.cos(Math.PI * ph)));
    sunBand.userData.u.uAmt.value = fast * (1 - .45 * dustA); moonBand.userData.u.uAmt.value = fast * (1 - .45 * dustA);
    winM.emissive.setRGB(.55, .4, .18).multiplyScalar(1 - day1);
    porch.intensity = 6 * (1 - day1); porchGlow.material.opacity = .55 * (1 - day1);
    // пори року: земля, поле, сніг
    const snow = sm(.82, .86, f) * (1 - sm(.99, 1, f)) + (f < .02 ? 1 - sm(0, .02, f) : 0);
    CC.copy(C(0x8a7a52)).lerp(C(0x7d9a46), sm(.04, .2, f)).lerp(C(0x66853a), sm(.2, .35, f)).lerp(C(0x9a8a58), sm(.52, .66, f)).lerp(C(0xf2f4f6), snow);
    CC.lerp(C(0xa8916a), dustA * .4 * (1 - snow)); ground.material.color.copy(CC);
    roofM.color.copy(C(0x4d4e55)).lerp(C(0xeef0f2), snow * .85); snowU.value = snow;
    const ch = f < .05 ? .06 : f < .72 ? .06 + .94 * sm(.06, .3, f) : .12;      // сходи → кукурудза → після жнив стерня
    cornSy.value = ch * (1 - .25 * dustA);
    CC.copy(C(0x7aa83a)).lerp(C(0x507f28), sm(.2, .32, f)).lerp(C(0xc9a85a), sm(.5, .64, f)).lerp(C(0xb7a07a), f > .72 ? 1 : 0).lerp(C(0xe8eaec), snow * .8);
    cornM.color.copy(CC);
    CC.copy(C(0x7c9a40)).lerp(C(0x4f7d2e), sm(.2, .35, f)).lerp(C(0xb8a058), sm(.52, .7, f)).lerp(C(0x8d7d58), f > .72 ? .6 : 0).lerp(C(0xeef0f3), snow * .92);
    CC.lerp(C(0xa8916a), dustA * .35 * (1 - snow)); grassM.color.copy(CC); grassSy.value = 1 - .7 * snow;
    windU.value = RM ? 0 : T;
    dust.material.opacity = .05 + .5 * dustA;
    if (!RM) { const p = dGeo.attributes.position.array; for (let i = 0; i < NDU; i++) { p[i * 3] += .02 + .01 * Math.sin(T + i); if (p[i * 3] > 40) p[i * 3] = -40; } dGeo.attributes.position.needsUpdate = true; }
    tree(years, f, T);
    return { years, f, hE, day1 };
  }

  /* ── розміри й рендер ── */
  let W = 0, H = 0, mob = false;
  function resize() {
    W = stage.clientWidth; mob = W < 640;
    H = mob ? Math.round(W * .72) * 2 : Math.round(Math.max(340, Math.min(580, W * .52)));
    stage.style.height = H + 'px';
    R.setSize(W, H, false);
    ov.width = Math.round(W * DPR); ov.height = Math.round(H * DPR);
    const vw = mob ? W : W / 2, vh = mob ? H / 2 : H;
    camA.aspect = camB.aspect = vw / vh; camA.updateProjectionMatrix(); camB.updateProjectionMatrix();
    need = true;
  }
  let mx = 0, my = 0;
  stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; need = true; });
  // клік/тап по воді Міллер — кільця брижів від точки (промінь з камери на площину води на рівні камери)
  let ripK = 0; const ray = new THREE.Raycaster(), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
  stage.addEventListener('pointerdown', (e) => {
    const r = stage.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const inA = mob ? py < .5 : px < .5; if (!inA) return;
    ndc.set((mob ? px : px * 2) * 2 - 1, -((mob ? py * 2 : py) * 2 - 1));
    ray.setFromCamera(ndc, camA);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -waveH(0, waveZ(tP)) * .98);
    if (!ray.ray.intersectPlane(plane, hit) || hit.distanceTo(camA.position) > 400) return;
    watU.uRip.value[ripK % 8].set(hit.x, hit.z, T, 1); ripK++; FOC.clickT = T; FOC.clickP.copy(hit); need = true; kick();
  });

  const EPOCH = Date.UTC(2067, 3, 28, 10, 0);                              // день відльоту (кінець квітня, F0), 10:00 — умовна дата
  function overlay(st) {
    const x = ox; x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, W, H);
    const vw = mob ? W : W / 2, vh = mob ? H / 2 : H, bx = mob ? 0 : vw, by = mob ? vh : 0;
    x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 2; x.beginPath(); if (mob) { x.moveTo(0, vh); x.lineTo(W, vh); } else { x.moveTo(vw, 0); x.lineTo(vw, H); } x.stroke();
    const label = (px, py, a, b) => { x.font = '600 10.5px ' + getComputedStyle(document.body).getPropertyValue('--mono'); x.fillStyle = 'rgba(255,255,255,.92)';
      x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 6; x.fillText(a, px, py); x.font = '500 12px ' + getComputedStyle(document.body).getPropertyValue('--sans'); x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText(b, px, py + 16); x.shadowBlur = 0; };
    label(14, 22, 'ПЛАНЕТА МІЛЛЕР', '1 год тут = ' + earthSpan(K) + ' на Землі');
    // мітка Дойла: над ним до хвилі; коли хвиля забрала — «Дойл — забрала хвиля» на тому місці, повільно згасає (~25 хв планетного часу)
    { const tGone = T_WAVE + (DOY.z - 420) / 4.5, fade = DOY.p < 1 ? 1 : 1 - sm(tGone, tGone + 25 * 60, tP), g = people[1];
      if (fade > .01) { const wzN = waveZ(tP);
        if (DOY.p < 1) V1.set(g.position.x, g.position.y + 2.6 * g.scale.x, g.position.z); else V1.set(DOY.x, waveH(DOY.z, wzN, DOY.x) * .98 + 2.2, DOY.z);
        V1.project(camA);
        if (V1.z < 1 && Math.abs(V1.x) < 1 && Math.abs(V1.y) < 1) { const sx = (V1.x * .5 + .5) * vw, sy = (-V1.y * .5 + .5) * vh;
          x.font = '500 10.5px ' + getComputedStyle(document.body).getPropertyValue('--mono'); x.textAlign = 'center'; x.globalAlpha = fade;
          x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 5; x.fillStyle = 'rgba(255,255,255,.92)'; x.fillText(DOY.p < 1 ? 'Дойл' : 'Дойл — забрала хвиля', sx, sy);
          x.shadowBlur = 0; x.globalAlpha = 1; x.textAlign = 'left'; } } }
    label(bx + 14, by + 22, 'ЗЕМЛЯ · ФЕРМА', 'дерево ' + fmt(lastTree.h, 1) + ' м');
    // цифрові годинники — поруч, в одній плашці на стику кадрів: ліворуч час планети, праворуч дата й час Землі (однаковий кегль) —
    // одним поглядом видно, що зліва ледь змінюються секунди, а справа летять роки.
    // Відлік дати — день відльоту, 10:00 (як у earth()); рік умовний: у фільмі його не названо, 2067 — поширена оцінка глядачів.
    { const mono = getComputedStyle(document.body).getPropertyValue('--mono'), big = Math.round(Math.max(15, Math.min(22, W * .017)));
      const d = new Date(EPOCH + tP / 3600 * K * 3600e3), p2 = (v) => String(v).padStart(2, '0');
      const A = hms(tP), B = d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate()) + ' · ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes());
      x.font = `600 ${big}px ${mono}`; const wa = x.measureText(A).width, wb = x.measureText(B).width, pad = 14, gap = 16, hh = big + 26;
      const sx = mob ? W / 2 : vw, sy = mob ? vh : H - 18 - hh / 2;          // стик кадрів: вертикальний (поруч) або горизонтальний (один над одним)
      const x0 = sx - gap - wa - pad, x1 = sx + gap + wb + pad, y0 = sy - hh / 2;
      x.fillStyle = 'rgba(8,10,16,.62)'; x.beginPath(); x.roundRect ? x.roundRect(x0, y0, x1 - x0, hh, 10) : x.rect(x0, y0, x1 - x0, hh); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 1; x.beginPath(); x.moveTo(sx, y0 + 7); x.lineTo(sx, y0 + hh - 7); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.96)'; x.textAlign = 'right'; x.fillText(A, sx - gap, y0 + big + 4);
      x.textAlign = 'left'; x.fillText(B, sx + gap, y0 + big + 4);
      x.font = '500 10.5px ' + mono; x.fillStyle = 'rgba(255,255,255,.7)'; x.textAlign = 'right'; x.fillText('на планеті', sx - gap, y0 + big + 18);
      x.textAlign = 'left'; x.fillText('на Землі', sx + gap, y0 + big + 18); }
    // годинник планети
    const r = Math.max(26, Math.min(38, vw * .07)), cx = 14 + r, cy = vh - 14 - r - 12;
    x.fillStyle = 'rgba(10,14,20,.55)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1.2; x.stroke();
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; x.lineWidth = k % 3 ? 1 : 2; x.beginPath(); x.moveTo(cx + Math.sin(a) * r * .8, cy - Math.cos(a) * r * .8); x.lineTo(cx + Math.sin(a) * r * .93, cy - Math.cos(a) * r * .93); x.stroke(); }
    const hand = (a, l, w, c) => { x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); x.stroke(); };
    const s = tP;
    hand(s / 43200 * 6.283, r * .5, 2.6, '#fff'); hand(s / 3600 * 6.283, r * .74, 1.8, '#fff');
    const sa = s / 60 * 6.283;
    if (playing) { x.fillStyle = 'rgba(234,82,18,.22)'; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, r * .86, -Math.PI / 2, 1.5 * Math.PI); x.fill(); }
    else hand(sa, r * .86, 1, '#EA5212');
    x.fillStyle = '#EA5212'; x.beginPath(); x.arc(cx, cy, 2.2, 0, 7); x.fill();
    x.font = '500 10.5px ' + getComputedStyle(document.body).getPropertyValue('--mono'); x.fillStyle = 'rgba(255,255,255,.85)'; x.textAlign = 'center';
    x.fillText(hms(tP), cx, cy + r + 13); x.textAlign = 'left';
    // маленька Земля на орбіті навколо Сонця: один оберт — рік
    const orR = Math.max(16, Math.min(24, vw * .045)), ocx = bx + vw - 16 - orR, ocy = by + 16 + orR;
    x.fillStyle = 'rgba(10,14,20,.45)'; x.beginPath(); x.arc(ocx, ocy, orR + 9, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1; x.beginPath(); x.arc(ocx, ocy, orR, 0, 7); x.stroke();
    x.fillStyle = '#FFD27A'; x.beginPath(); x.arc(ocx, ocy, 3.5, 0, 7); x.fill();
    const ea = -st.f * 6.283 - Math.PI / 2; x.fillStyle = '#6FA8FF'; x.beginPath(); x.arc(ocx + Math.cos(ea) * orR, ocy + Math.sin(ea) * orR, 3.2, 0, 7); x.fill();
    x.font = '600 11px ' + getComputedStyle(document.body).getPropertyValue('--mono'); x.fillStyle = 'rgba(255,255,255,.9)'; x.textAlign = 'right';
    x.fillText(st.years >= .1 ? fmt(st.years, 1) + ' р.' : earthSpan(st.hE), ocx + orR + 9, ocy + orR + 24); x.textAlign = 'left';
  }

  /* ── тілшифт: «мініатюра». Сцена → текстура → розмиття по x → по y; різкість лише в смузі фокуса ── */
  const RT = [0, 1].map(() => [0, 1].map(() => { const t = new THREE.WebGLRenderTarget(4, 4, { samples: 4 }); t.texture.colorSpace = THREE.SRGBColorSpace; return t; }));
  const tsU = { tD: { value: null }, uDir: { value: new THREE.Vector2() }, uFocus: { value: .42 }, uBand: { value: .2 }, uAmt: { value: 1.9 }, uSat: { value: 1.1 }, uLast: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) } };
  const tsM = new THREE.ShaderMaterial({ uniforms: tsU, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `uniform sampler2D tD; uniform vec2 uDir, uRes; uniform float uFocus, uBand, uAmt, uSat, uLast, uTime; uniform vec3 uTint; varying vec2 vU;
      ${GRADE_GLSL}
      void main(){ float k = smoothstep(uBand*.5, uBand*1.8, abs(vU.y - uFocus)) * uAmt;
        vec4 c = vec4(0.); float ws = 0.;
        for (int i = -6; i <= 6; i++) { float w = exp(-float(i*i)/18.); c += texture2D(tD, vU + uDir * float(i) * k) * w; ws += w; }
        c /= ws;
        gl_FragColor = c;
        if (uLast > .5) {
          // останній прохід: хроматична аберація по краях, ACES, віньєтка, зерно
          vec2 q = vU - .5; vec2 off = q * dot(q, q) * .007 * vec2(1., uRes.x/uRes.y);
          gl_FragColor.r = texture2D(tD, vU + off).r; gl_FragColor.b = texture2D(tD, vU - off).b;
          #include <tonemapping_fragment>
          gl_FragColor.rgb = grade(gl_FragColor.rgb, vU, uRes, uTime, .34, .04, uSat, uTint);
        }
        #include <colorspace_fragment>
      }` });
  const tsQ = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), tsM), tsS = new THREE.Scene(), tsC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); tsS.add(tsQ);
  /* фокус тілшифту — «де історія»: Міллер — на рівні астронавтів, перевід на гребінь хвилі-гори за ~3 хв до її приходу
     і назад після проходу, короткий перевід на кільця брижів після кліку; ферма — слідом за листком-героєм, між листками —
     на кроні, вночі — на лампу ґанку. Фокус переводиться плавно (≈2–3 с), як у кіно. Ширина смуги на фермі звужується,
     коли роки мчать (світ «розмивається»), на Міллер — незмінна. */
  const FOC = { a: .3, b: .5, clickT: -99, clickP: new THREE.Vector3() };
  const prj = new THREE.Vector3();
  const screenY = (cam, x, y, z) => { prj.set(x, y, z).project(cam); return Math.max(.05, Math.min(.95, .5 + prj.y * .5)); };
  const toward = (cur, to, rate) => cur + (to - cur) * (1 - Math.exp(-dtReal * rate));
  function focusTargets(wz, ride, st) {
    // Міллер
    let tA = people[0].visible ? screenY(camA, people[0].position.x, people[0].position.y + 1.2, people[0].position.z) : screenY(camA, shipA.position.x, shipA.position.y + 2, shipA.position.z);
    const dWave = T_WAVE - tP;                                            // секунд планетного часу до гребеня
    if (dWave < 190 && dWave > -150) { const crestZ = wz, crestY = waveH(crestZ, wz) * .9; tA = screenY(camA, 0, crestY, Math.max(crestZ, -400)); }
    if (T - FOC.clickT < 2.6) { const kk = sm(2.6, 1.8, T - FOC.clickT); tA = tA + (screenY(camA, FOC.clickP.x, FOC.clickP.y, FOC.clickP.z) - tA) * kk; }
    FOC.a = toward(FOC.a, tA, 1.4);
    // ферма
    let tB;
    if (st.day1 < .3 && !(HL.kind === 1 && HL.t < HL.dur)) { porchW.set(porch.position.x, porch.position.y, porch.position.z); house.localToWorld(porchW); tB = screenY(camB, porchW.x, porchW.y, porchW.z); }
    else if (HL.kind === 1 && HL.t > 0) tB = screenY(camB, hero.position.x, hero.position.y, hero.position.z);
    else tB = screenY(camB, TREE.x, TREE.y + Math.max(1, lastTree.h * .6), TREE.z);
    FOC.b = toward(FOC.b, tB, HL.kind === 1 && HL.t < HL.dur ? 6 : 1.6);
  }
  const porchW = new THREE.Vector3();
  function tiltShift(scene, cam, k, x, y, w, h) {
    tsU.uFocus.value = k ? FOC.b : FOC.a; tsU.uBand.value = k ? .2 - .13 * fast : .2;
    tsU.uAmt.value = k ? 1.5 : 1.1; tsU.uRes.value.set(Math.round(w * DPR), Math.round(h * DPR)); tsU.uTime.value = T;
    tsU.uTint.value.set(...(k ? [1.04, 1., .94] : [.96, 1., 1.04]));          // ферма — тепла, Міллер — холодна
    const pw = Math.max(4, Math.round(w * DPR)), ph = Math.max(4, Math.round(h * DPR)), [a, b] = RT[k];
    if (a.width !== pw || a.height !== ph) { a.setSize(pw, ph); b.setSize(pw, ph); }
    R.setScissorTest(false);
    R.setRenderTarget(a); R.render(scene, cam);
    tsU.tD.value = a.texture; tsU.uDir.value.set(1 / pw, 0); tsU.uLast.value = 0; R.setRenderTarget(b); R.render(tsS, tsC);
    R.setRenderTarget(null); R.setScissorTest(true); R.setViewport(x, y, w, h); R.setScissor(x, y, w, h);
    tsU.tD.value = b.texture; tsU.uDir.value.set(0, 1 / ph); tsU.uLast.value = 1; R.render(tsS, tsC);
  }

  /* ── ферма: глибина різкості як на 85 мм f/1.2 замість тілшифту. Фокус — на дереві; кружок розсіювання з глибини:
     c = f²/(N(S − f)) · |D − S| / D (f = 85 мм, N = 1,2, кадр 36 мм). Розмиття збиранням по диску (64 точки, «золотий кут»);
     дальні точки не розмиваються поверх ближчих різких — так дерево не обростає ореолом фону. ── */
  const dofRT = new THREE.WebGLRenderTarget(4, 4, { samples: 4, depthTexture: new THREE.DepthTexture(4, 4) }); dofRT.texture.colorSpace = THREE.SRGBColorSpace;
  const dofU = { tC: { value: dofRT.texture }, tZ: { value: dofRT.depthTexture }, uN: { value: camB.near }, uF: { value: camB.far }, uS: { value: 10 }, uK: { value: 20 }, uMax: { value: 24 }, uRes: { value: new THREE.Vector2(1, 1) } };
  const dofM = new THREE.ShaderMaterial({ uniforms: dofU, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `uniform sampler2D tC, tZ; uniform float uN, uF, uS, uK, uMax; uniform vec2 uRes; varying vec2 vU;
      float vz(vec2 u){ float z = texture2D(tZ, u).x * 2. - 1.; return 2. * uN * uF / (uF + uN - z * (uF - uN)); }
      float coc(float d){ return min(uMax, uK * abs(d - uS) / d); }
      void main(){
        float D0 = vz(vU), c0 = coc(D0);
        vec3 acc = texture2D(tC, vU).rgb; float ws = 1.;
        for (int i = 0; i < 64; i++) {
          float fi = float(i) + .5, r = sqrt(fi / 64.) * uMax, a = fi * 2.39996;
          vec2 u = vU + vec2(cos(a), sin(a)) * r / uRes;
          float D = vz(u), c = coc(D);
          if (D > D0) c = min(c, c0);                                     // дальнє не лізе на ближче різке
          float w = smoothstep(r - 1.5, r + .5, c);
          vec3 col = texture2D(tC, u).rgb;
          w *= 1. + 1.5 * smoothstep(.75, 1.6, dot(col, vec3(.3, .59, .11))) * step(2., c);   // яскраві точки — кружечки боке
          acc += col * w; ws += w;
        }
        gl_FragColor = vec4(acc / ws, 1.);
        #include <colorspace_fragment>
      }` });
  const dofQ = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), dofM), dofS = new THREE.Scene(); dofS.add(dofQ);
  const fV = new THREE.Vector3(), fD = new THREE.Vector3();
  function dof(scene, cam, x, y, w, h) {
    const pw = Math.max(4, Math.round(w * DPR)), ph = Math.max(4, Math.round(h * DPR)), b = RT[1][1];
    if (dofRT.width !== pw || dofRT.height !== ph) dofRT.setSize(pw, ph);
    if (b.width !== pw || b.height !== ph) { b.setSize(pw, ph); RT[1][0].setSize(pw, ph); }
    cam.getWorldDirection(fD); let S = fV.set(TREE.x, Math.max(1, lastTree.h * .5), TREE.z).sub(cam.position).dot(fD);
    dofU.uS.value = S; dofU.uK.value = 85 * 85 / (1.2 * (S * 1000 - 85)) / 36 * pw * 1.15; dofU.uMax.value = 13 * DPR; dofU.uRes.value.set(pw, ph);
    R.setScissorTest(false);
    R.setRenderTarget(dofRT); R.render(scene, cam);
    R.setRenderTarget(b); R.render(dofS, tsC);
    // фінал — той самий прохід кольору, що й ліворуч (аберація, ACES, грейд), але без тілшифту
    tsU.uFocus.value = .5; tsU.uBand.value = 1; tsU.uAmt.value = 0; tsU.uRes.value.set(pw, ph); tsU.uTime.value = T; tsU.uTint.value.set(1.04, 1., .94);
    R.setRenderTarget(null); R.setScissorTest(true); R.setViewport(x, y, w, h); R.setScissor(x, y, w, h);
    tsU.tD.value = b.texture; tsU.uDir.value.set(0, 1 / ph); tsU.uLast.value = 1; R.render(tsS, tsC);
  }

  // листок-герой — окремим проходом після DOF, поверх кадру: шар 1 (основний рендер і глибина різкості його не бачать), тож він завжди різкий;
  // світла ферми увімкнені й на шарі 1; карту тіней у цьому проході не перераховуємо
  function heroPass(x, y, w, h) {
    if (!hero.visible) return;
    const ac = R.autoClear, su = R.shadowMap.autoUpdate; R.autoClear = false; R.shadowMap.autoUpdate = false; camB.layers.set(1);
    R.setRenderTarget(null); R.setScissorTest(true); R.setViewport(x, y, w, h); R.setScissor(x, y, w, h); R.clearDepth(); R.render(sB, camB);
    camB.layers.set(0); R.autoClear = ac; R.shadowMap.autoUpdate = su;
  }
  let need = true, playing = false, vis = false, last = 0, prevT = tP, T = 0, camD = 9;
  function render(now) {
    const dt = Math.min(.1, last ? (now - last) / 1000 : 0); last = now;
    const tP0 = tP;
    if (playing) { for (let k = 0; k < 8; k++) tP += dt / 8 * rate(tP);         // крива швидкості: дрібні кроки, щоб розгін/гальмування не перескакувати
      if (tP >= T_MAX) { tP = T_MAX; setPlay(false); } sl.value = String(Math.round(tP)); counters(); }
    // тік — щоразу, коли планетний час перетинає кратне доби Землі (детерміновано від tP); лише під час відтворення, на повільних ділянках,
    // коли блок видно й вкладка не схована
    // на розгоні тіки частішають разом із добами Землі (дріб → дзижчання) і плавно стихають; на гальмуванні — навпаки.
    // Гучність — від частоти тіків: до ~1,2/с повна, до 25/с сходить нанівець (лог-шкала); тіки цього кадру рівномірно в межах dt, не більше 25/с
    if (SND.on && SND.ctx && playing && vis && !document.hidden && dt > 0) {
      const dp = dayP(), n = Math.floor(tP / dp) - Math.floor(tP0 / dp), tps = rate(tP) / dp;
      const g = 1 - sm(Math.log(1.2), Math.log(25), Math.log(Math.max(1e-3, tps)));
      if (n > 0 && g > .01) { const m = Math.min(n, Math.max(1, Math.round(25 * dt))); for (let i = 0; i < m; i++) tick(dt * i / m, g); } }
    dtReal = RM ? 0 : dt; if (!RM) T += dt;
    const dps = dt > 0 ? Math.abs(tP - prevT) / 3600 * K / 24 / dt : 0; prevT = tP;
    const ft = sm(.4, 5, dps); fast += (ft - fast) * Math.min(1, dt * (ft > fast ? 6 : 2.5));
    if (fast < .002) fast = 0;
    // ліворуч
    const wz = waveZ(tP); watU.uWz.value = wz; watU.uT.value = T; skyAU.uT.value = T; spray.visible = !RM && Math.abs(wz) < 3500;
    const ride = waveH(0, wz);
    // ракурс згори, як на макет: камера на висоті ~34 м дивиться навскіс на модуль і людей у воді
    // камера-кран: над водою 34 м; коли хвиля поруч — піднімається лише на частину її висоти й дивиться на гребінь,
    // щоб стіна з губою, люди й модуль лишались у кадрі (на самому гребені камера не їде)
    // коли стіна підходить упритул — кран від'їжджає назад (до 700 м) і вгору, щоб не опинитись усередині води
    const near = sm(1800, 500, Math.abs(wz)), back = sm(1000, 150, Math.abs(wz)), crestY = 1200 * crestK(0) * .8;
    const camZ = 26 + my * 2 + 1150 * back, rideC = waveH(camZ, wz, mx * 4);
    camA.position.set(mx * 4, 34 + rideC + 260 * back, camZ);
    V2.set(mx * 4, ride * .85, -260).lerp(V1.set(mx * 4, crestY * .5, Math.min(wz, -40)), near);
    // звичний план — ближче й нижче: камера ~9 м над водою, ліворуч позаду «Рейнджера» (модуль і люди — у правій нижній третині),
    // дивиться майже вздовж доріжки блиску на Гаргантюа; повільний дрейф убік і погойдування на хвилях, як із човна.
    // Коли хвиля-гора ближче ~2,5 км — плавно передаємо керування старому крану (він уміє відступати від стіни)
    { const crane = sm(2600, 1000, Math.abs(wz)), dr = RM ? 0 : Math.sin(T * .16) * 2.2, cx = -8 + dr + mx * 3, cz = -9 + my * 1.5;
      const cy = waveH(cz, wz, cx) + 9 + (RM ? 0 : .35 * Math.sin(T * .9)) - my * 1.2;
      V1.set(cx, cy, cz); camA.position.lerp(V1, 1 - crane);
      camAT.set(9 + GDIR.x * 220 + dr * .4, ride * .3 + 6, -38 + GDIR.z * 220); V2.lerp(camAT, 1 - crane); }
    // план «Дойл»: від −90 с до +20 с щодо моменту, коли фронт підхоплює Дойла, кран не від'їжджає — стоїть близько й низько над водою
    // (їде по її поверхні) і дивиться на модуль і Дойла з легким нахилом угору на гребінь; до +60 с плавно повертається до звичного плану
    { const tD = T_WAVE + (DOY.z - 420) / 4.5, cD = sm(tD - 120, tD - 90, tP) * (1 - sm(tD + 20, tD + 60, tP));
      if (cD > 0) { const zC = DOY.z + 52, xC = DOY.x - 8 + mx * 2;
        camA.position.lerp(V1.set(xC, waveH(zC, wz, xC) + 14 - my * 2, zC), cD);
        V1.set(7, waveH(-34, wz, 7) * .98 + 3, -34).lerp(camAT.set(7, waveH(wz, wz, 7) * .6, wz), .18); V2.lerp(V1, cD);
        camA.position.y = Math.max(camA.position.y, waveH(camA.position.z, wz, camA.position.x) + 6); } }   // не всередині води
    camA.lookAt(V2);
    // як у фільмі (усе — функція tP, повзунок назад усе відновлює): «Рейнджер» хвилю переживає; Дойла (people[1]) накриває стіна —
    // поки фронт наростає над ним, він лишається внизу, вода закриває його, після гребеня його немає; Купер і Бренд (people[0]) перед
    // T_BACK ідуть до модуля й заходять усередину; о T_BACK модуль плавно злітає й за ~1,5 хв іде вгору з кадру — далі порожній океан
    const lift = sm(T_BACK, T_BACK + 90, tP), lk = lift * lift * lift;
    shipA.position.set(9, waveH(-38, wz, 9) * .98 + 3 * sm(0, .08, lift) + 500 * lk, -38 - 160 * lk); shipA.rotation.x = -.35 * sm(.05, .4, lift);
    shipA.visible = lift < 1;
    { const g = people[0], w = sm(T_BACK - 240, T_BACK - 40, tP);                // до трапа модуля
      g.position.set(2.5 + (7.2 - 2.5) * w, 0, -29 + (-35.5 + 29) * w); g.visible = tP < T_BACK - 30; }
    people.forEach((g, i) => { g.position.y = waveH(g.position.z, wz, g.position.x) * .98;
      if (!RM) { g.rotation.z = Math.sin(T * .9 + i * 2.1) * .025; g.rotation.y = Math.sin(T * .23 + i) * .25; } });   // переступають, озираються
    // Дойл: фронт стіни підхоплює його й тягне вгору схилом (p 0→1), фігура меншає й зникає в піні; після гребеня на тому місці
    // розходиться кільце брижів, а мітка «Дойл — забрала хвиля» згасає за ~25 хв планетного часу
    { const g = people[1], p = DOY.p = sm(DOY.z - 560, DOY.z - 420, wz), pe = p * p;
      g.visible = p < 1; g.position.set(DOY.x, 0, DOY.z + 28 * pe); g.position.y = waveH(g.position.z, wz, DOY.x) * .98; g.scale.setScalar(1 - sm(.55, 1, p));
      g.rotation.x = -1.2 * pe;
      const a = Math.min(1, Math.max(0, (wz - DOY.z + 490) / (4.5 * 50)));        // кільце: розходиться ~50 с від місця, де він стояв, щойно хвиля його підхопила
      if (a > 0 && a < 1) watU.uFeet.value[1].set(DOY.x, DOY.z, .3 + 16 * a, 1.6 * (1 - a));
      else watU.uFeet.value[1].set(g.position.x, g.position.z, .3, p < 1 ? 1 + 2.5 * p : 0); }
    watU.uFeet.value[0].set(people[0].position.x, people[0].position.z, .3, people[0].visible ? 1 : 0);
    watU.uFeet.value[2].w = .7 * (1 - sm(0, .1, lift));
    skyA.position.copy(camA.position); garg.position.copy(camA.position).addScaledVector(GDIR, 9000); garg.lookAt(camA.position);
    // праворуч
    const st = earth(T);
    // кадр дерева: камера відходить, поки дерево росте (повільний від'їзд у таймлапсі), дерево — у лівій третині, крона на тлі неба
    { const h = Math.max(1.2, lastTree.h), dist = 6 + h * 1.3;
      camD += (dist - camD) * Math.min(1, dt * 1.5);
      const cxB = TREE.x + camD * .2 + mx * .6, czB = TREE.z + camD; camB.position.set(cxB, groundH(cxB, czB) + .9 + h * .28 + my * -.2, czB);   // висота — від землі під камерою
      camBT.set(TREE.x + camD * .2 + .4, TREE.y + h * .5, TREE.z - 10); camB.lookAt(camBT); }
    skyB.position.copy(camB.position);
    const vw = mob ? W : W / 2, vh = mob ? H / 2 : H;
    focusTargets(wz, ride, st);
    tiltShift(sA, camA, 0, 0, mob ? vh : 0, vw, vh);
    dof(sB, camB, mob ? 0 : vw, 0, vw, vh);
    heroPass(mob ? 0 : vw, 0, vw, vh);
    overlay(st);
    need = false;
  }
  function loop(now) {
    if (!vis) { raf = 0; return; }
    if (!RM || playing || need || fast > 0) render(now); else last = now;
    raf = requestAnimationFrame(loop);
  }
  let raf = 0;
  const kick = () => { if (!raf && vis) { last = 0; raf = requestAnimationFrame(loop); } };
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis) kick(); }, { rootMargin: '100px' }).observe(stage);
  addEventListener('resize', () => { resize(); kick(); });

  function setPlay(on) { playing = on; bPlay.textContent = on ? '❚❚ пауза' : '▶ пуск'; bPlay.classList.toggle('on', on); need = true; }
  wireUI(() => { need = true; kick(); });
  function wireUI(refresh) {
    sl.addEventListener('input', () => { tP = +sl.value; if (refresh) setPlay(false); counters(); refresh && refresh(); });
    bPlay.addEventListener('click', () => { if (!refresh) return; if (!playing && tP >= T_MAX) tP = 0; setPlay(!playing); refresh(); });
    bFilm.addEventListener('click', () => { tP = Math.min(T_MAX, FILM_H / K * 3600); sl.value = String(Math.round(tP)); if (refresh) setPlay(false); counters(); filmNote(); refresh && refresh(); });
    addEventListener('is-spin', (e) => { K = e.detail.K; counters(); filmNote(); rtMarks(); sndNote(); refresh && refresh(); });
  }
  window.IS_TIME = { R, tsU, render, hero, HL, rate, n: () => [leaves.count, bark.count, singles.count] };
  resize();
  render(performance.now());   // перший кадр одразу, щоб сцена не була порожньою
}
