/* Стаття 34, розділ 03: «Година = 7 рокам» — одна three.js-сцена навпіл.
   Ліворуч — мілке море планети Міллер, на небі Гаргантюа, хвиля-гора за розкладом фільму, годинник планети.
   Праворуч — ферма на Землі в таймлапсі: дерево росте за логістичною кривою, пори року, Сонце й Місяць,
   що злипаються в смуги, коли роки летять, пилова імла густішає.
   Час на Землі = час на планеті × K, де K — множник Керра з повзунка розділу (window.IS_SPIN, подія 'is-spin'). */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GRADE_GLSL } from './is-post.js?v=20261018235830';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const slot = document.getElementById('viz-time');
if (slot) init(slot);

function init(slot) {
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'shared/is-time-3d.css?v=1'; document.head.appendChild(css);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Q = new URLSearchParams(location.search);              // ?itm=3.3 — початковий час у годинах (для перевірки скрінами)

  /* ── константи ── */
  const T_MAX = 4 * 3600;                 // шкала: 0…4 год на планеті, у секундах
  const T_WAVE = 70 * 60;                 // хвиля-гора — ≈1 год 10 хв після висадки (за фільмом)
  const T_BACK = 3 * 3600 + 18 * 60;      // повернення на корабель — 3 год 18 хв (за фільмом)
  const FILM_H = 204700;                  // 23 р. 4 міс. 8 дн. на Землі ≈ 204 700 год
  const PLAY = 300;                       // відтворення: 1 год на планеті — 12 с
  const HY = 8766;                        // годин у році (365,25 доби)
  const F0 = 0.12;                        // відліт — кінець квітня (частка року від весняного рівнодення)
  const LAT = 38 * Math.PI / 180;         // широта ферми (рівнини США)
  const treeH = (y) => 11 / (1 + 6.333 * Math.exp(-0.1476 * y));   // 1,5 м → 9,5 м за 25 р., межа 11 м

  let K = (window.IS_SPIN && window.IS_SPIN.K) || 62000;
  if (Q.has('itmk')) K = +Q.get('itmk');
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
    </div>
    <div class="itm-stage" role="img" aria-label="Ліворуч мілке море планети Міллер і Гаргантюа в небі, праворуч ферма на Землі, де за той самий час минають роки"></div>
    <p class="chint itm-note"></p>
    <p class="chint">Пораховано: час на Землі = час на планеті × множник сповільнення з повзунка вище (орбіта Керра); Мерф — 10 років у день відльоту; Сонце й Місяць — за широтою 38° і порою року, тож за довгої «витримки» Сонце малює смугу, яскравішу по краях: біля сонцестоянь воно затримується. Дерево росте за логістичною кривою 1,5 м → ≈9,5 м за 25 років (межа 11 м) — типово для листяного дерева, наближення. Умовно: хвиля-гора (висота ≈1,2 км і момент — за фільмом, швидкість підібрана), вигляд неба й Гаргантюа (спрощений шейдер, не трасування променів), падіння листя стиснуте в часі. Відтворення: 1 год на планеті — 12 с.</p>
  </div>`;
  const $ = (s) => slot.querySelector(s);
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
  const watU = { uT: { value: 0 }, uWz: { value: -9000 }, uWH: { value: 1200 }, uSig: { value: 380 }, uG: { value: GDIR } };
  const wgeo = new THREE.PlaneGeometry(18000, 18000, 260, 520); wgeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(wgeo, new THREE.ShaderMaterial({
    uniforms: watU, fog: false,
    vertexShader: `uniform float uT, uWz, uWH, uSig; varying vec3 vW; varying vec3 vN; varying float vH; varying float vCrest;
      // одна хвиля Герстнера: напрям, довжина, крутизна, амплітуда; повертає зсув і накопичує нормаль
      vec3 gw(vec2 x, vec2 D, float L, float Q, float A, inout vec3 nrm){
        float k = 6.2832/L, c = sqrt(9.81/k), f = k*(dot(D, x) - c*uT);
        float co = cos(f), si = sin(f);
        nrm.x -= D.x*k*A*co; nrm.z -= D.y*k*A*co; nrm.y -= Q*k*A*si;
        return vec3(Q*A*D.x*co, A*si, Q*A*D.y*co); }
      void main(){ vec3 p = position; vec2 x = p.xz; vec3 n = vec3(0., 1., 0.);
        vec3 d = gw(x, normalize(vec2(.2, 1.)), 9., .6, .09, n) + gw(x, normalize(vec2(-.6, .8)), 5.3, .5, .05, n)
               + gw(x, normalize(vec2(.9, .4)), 3.1, .4, .03, n) + gw(x, normalize(vec2(-.3, -1.)), 17., .5, .12, n)
               + gw(x, normalize(vec2(.7, -.7)), 1.9, .3, .015, n);
        p += d;
        float dz = (p.z - uWz) / uSig;
        float s = dz > 0. ? 1.0 : 1.6; float e = exp(-dz*dz/(s*s)); float w = uWH * e;
        float dwdz = w * (-2. * dz / (s*s)) / uSig;
        p.y += w;
        n.z -= dwdz; vN = normalize(n);
        vH = e; vCrest = clamp(d.y / .2, 0., 1.);
        vW = (modelMatrix * vec4(p, 1.)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }`,
    fragmentShader: `uniform float uT; uniform vec3 uG; varying vec3 vW; varying vec3 vN; varying float vH; varying float vCrest; ${NOISE}
      vec3 skyc(vec3 d){ float h = max(d.y, 0.);
        vec3 c = mix(vec3(${HOR_A.join(',')}), vec3(.36,.46,.57), smoothstep(0., .55, h));
        vec2 q = d.xz / max(h + .08, .03) * 1.4 + vec2(uT*.006, uT*.002);
        c = mix(c, vec3(.80,.82,.83), smoothstep(.42, .78, fbm(q)) * smoothstep(-.02, .12, h) * .55);
        float g = max(dot(d, uG), 0.); c += vec3(1.,.78,.55) * (pow(g, 14.)*.25 + pow(g, 900.)*3.);
        return c; }
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
        vec2 rp = ripple(vW.xz*1.6);
        vec3 N = normalize(vN + vec3(rp.x, 0., rp.y) * .22 * att);
        float cosv = max(dot(N, V), 0.);
        float fr = .02 + .98 * pow(1. - cosv, 5.);
        vec3 refl = skyc(reflect(-V, N));
        // заломлення: дно на глибині ~0,4 м, промінь іде навскіс — довший шлях у воді, темніше й бірюзовіше
        float depth = .4 + max(vW.y, 0.) * .9;
        float path = depth / max(cosv, .08);
        vec2 bp = vW.xz - (V.xz / max(V.y, .08)) * depth * .75;
        vec3 sand = vec3(.40,.38,.31) * (.8 + .4*vn(bp*.6));
        sand += vec3(1.,.93,.8) * caust(bp*1.4) * .45 * att;
        vec3 absorb = exp(-vec3(2.2, .95, .8) * path);
        vec3 deep = vec3(.05,.14,.16);
        vec3 refr = mix(deep, sand, absorb);
        // стіна хвилі-гори: товща води темна, світло Гаргантюа просвічує гребінь (підповерхневе розсіювання)
        float face = smoothstep(.03, .45, vH);
        float sss = pow(max(dot(-V, uG), 0.), 3.) * smoothstep(.3, .95, vH);
        refr = mix(refr, vec3(.08,.2,.22), face);
        refr += vec3(.25,.55,.5) * sss * .8;
        vec3 c = mix(refr, refl, fr);
        // піна: гребені дрібних хвиль, верх хвилі-гори, патьоки на стіні
        float foam = smoothstep(.75, 1., vCrest) * smoothstep(.55, .8, fbm(vW.xz*.6 + uT*.1)) * .5;
        foam += smoothstep(.86, .99, vH) * smoothstep(.45, .75, fbm(vW.xz*.02 + uT*.02));
        foam += smoothstep(.55, .85, fbm(vec2(vW.x*.012, vW.y*.0035 - uT*.04))) * face * .35;
        c = mix(c, vec3(.88,.9,.9), clamp(foam, 0., 1.) * .8);
        c = mix(c, vec3(${HOR_A.join(',')}), (1. - exp(-dist * .00018)) * (1. - .45*face));
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
  const waveZ = (t) => (t - T_WAVE) * 4.5;                       // м: хвиля йде з горизонту до глядача, ≈4,5 м/с
  const waveH = (z, wz) => { const dz = (z - wz) / 380, s = dz > 0 ? 1 : 1.6; return 1200 * Math.exp(-dz * dz / (s * s)); };

  /* ════════════ ПРАВОРУЧ: ФЕРМА НА ЗЕМЛІ ════════════ */
  const sB = new THREE.Scene(), camB = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);
  sB.fog = new THREE.FogExp2(0xbcc4cc, 0.004);
  const camB0 = new THREE.Vector3(-13, 6.5, -18), camBT = new THREE.Vector3(1, 2.8, 2);         // згори навскіс — ферма як макет
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
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 260 }); sun.shadow.camera.updateProjectionMatrix();
  sB.add(sun, sun.target, moon, moon.target, hemi);

  // земля: шум кольору, сніг і пори року — через колір матеріалу
  function noiseTex(n, lo, hi) {
    const d = new Uint8Array(n * n * 4); for (let i = 0; i < n * n; i++) { const v = lo + (hi - lo) * Math.random() * Math.random() + (hi - lo) * .3 * Math.random(); d.set([v, v, v, 255], i * 4); }
    const t = new THREE.DataTexture(d, n, n); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
  }
  const grTex = noiseTex(128, 150, 255); grTex.repeat.set(220, 220);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshLambertMaterial({ map: grTex, color: 0x7a8a4a }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; sB.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 120), new THREE.MeshLambertMaterial({ map: grTex, color: 0x9a8a6c }));
  road.rotation.x = -Math.PI / 2; road.rotation.z = -0.32; road.position.set(9, 0.02, -30); sB.add(road);

  // будинок ферми, комора, пікап біля дороги, трактор на краю поля — GLB-моделі; ґанок/ворота/капот — на камеру
  const winM = new THREE.MeshLambertMaterial({ color: 0x2b3238, emissive: 0x000000 }), roofM = new THREE.MeshLambertMaterial({ color: 0x4d4e55 });
  // сніг на дахах: у шейдері моделі біліють грані, повернуті вгору (дах — частина текстури GLB, окремого матеріалу немає)
  const snowU = { value: 0 };
  const snowy = (mt) => { mt.onBeforeCompile = (sh) => { sh.uniforms.uSnow = snowU;
      sh.fragmentShader = 'uniform float uSnow;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float upN = dot(normalize(vNormal), normalize((viewMatrix * vec4(0., 1., 0., 0.)).xyz));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.93, .95, .97), uSnow * smoothstep(.3, .65, upN));`); };
    mt.needsUpdate = true; };
  const house = new THREE.Group(); house.position.set(17, 0, 9); sB.add(house); model('farmhouse', house, { rotY: -2.3, fix: snowy });
  const barn = new THREE.Group(); barn.position.set(34, 0, 46); sB.add(barn); model('barn', barn, { rotY: -2.45, fix: snowy });
  // вночі в будинку світло: тепла лампа біля ґанку й м'яке сяйво на фасаді
  const porch = new THREE.PointLight(0xffc27a, 0, 18, 1.6); porch.position.set(-2.2, 2.4, -2.6); house.add(porch);
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 64; { const x = glowC.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,200,130,1)'); g.addColorStop(1, 'rgba(255,170,90,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
  const porchGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  porchGlow.scale.setScalar(3.2); porchGlow.position.copy(porch.position); house.add(porchGlow);
  const pickup = new THREE.Group(); pickup.position.set(7.5, 0, -1.5); sB.add(pickup); model('pickup', pickup, { rotY: 2.55 });
  const tractor = new THREE.Group(); tractor.position.set(-3.5, 0, 13); sB.add(tractor); model('tractor', tractor, { rotY: .9 });
  // огорожа вздовж дороги
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, 1.1, .12), new THREE.MeshLambertMaterial({ color: 0x6d5a45 }), 40);
  { const m = new THREE.Matrix4(); for (let i = 0; i < 40; i++) { m.makeTranslation(5.2 + i * 0.95 * Math.sin(.32) - 3, .55, -16 + i * 2.6 * Math.cos(.32) * 1.1); posts.setMatrixAt(i, m); } }
  sB.add(posts);

  // кукурудзяне поле: стебло + листя, інстанси; висота й колір — за порою року
  const cg = [];
  { const st = new THREE.CylinderGeometry(.018, .028, 1, 4, 1); st.translate(0, .5, 0); cg.push(st);
    for (let k = 0; k < 4; k++) { const lf = new THREE.PlaneGeometry(.55, .07); lf.translate(.27, 0, 0); lf.rotateZ(-.5); lf.rotateY(k * 1.9); lf.translate(0, .3 + k * .16, 0); cg.push(lf); }
    const tas = new THREE.ConeGeometry(.05, .18, 4); tas.translate(0, 1.04, 0); cg.push(tas); }
  const cornGeo = mergeGeometries(cg.map((g) => g.toNonIndexed()));
  const cornM = new THREE.MeshLambertMaterial({ color: 0x5f8a2c, side: THREE.DoubleSide });
  const NC = 4200, corn = new THREE.InstancedMesh(cornGeo, cornM, NC);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color(); let i = 0;
    for (let r = 0; r < 42 && i < NC; r++) for (let k = 0; k < 100 && i < NC; k++, i++) {
      p.set(-6 - r * 1.05 + (Math.random() - .5) * .15, 0, 2 + k * .62 + (Math.random() - .5) * .2);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 6.28); const h = 2.4 * (.85 + Math.random() * .3); s.set(1, h, 1);
      m.compose(p, q, s); corn.setMatrixAt(i, m); c.setScalar(.82 + Math.random() * .3); corn.setColorAt(i, c);
    } }
  corn.frustumCulled = false; corn.receiveShadow = true; sB.add(corn);

  // пилова імла: частинки, що повільно дрейфують; густішає з роками
  const NDU = 700, dPos = new Float32Array(NDU * 3);
  for (let i = 0; i < NDU; i++) dPos.set([(Math.random() - .5) * 80, Math.random() * 18, (Math.random() - .3) * 70], i * 3);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ map: glowTex([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]), color: 0xc8b28a, size: .22, transparent: true, opacity: 0, depthWrite: false }));
  sB.add(dust);

  /* дерево: рекурсивні гілки (InstancedMesh циліндрів), листя — кластери з канвасу (InstancedMesh площин) */
  let seed = 7; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const nodes = [], UP = new THREE.Vector3(0, 1, 0);
  function tilt(dir, ang, az) {
    const a = Math.abs(dir.y) < .95 ? UP : new THREE.Vector3(1, 0, 0);
    const u = new THREE.Vector3().crossVectors(dir, a).normalize(), w = new THREE.Vector3().crossVectors(dir, u);
    return dir.clone().multiplyScalar(Math.cos(ang)).addScaledVector(u, Math.sin(ang) * Math.cos(az)).addScaledVector(w, Math.sin(ang) * Math.sin(az)).normalize();
  }
  function branch(parent, level, t, dir, len, rad, birth) {
    const n = { parent, level, t, dir, len, rad, birth, p0: new THREE.Vector3(), Le: 0, Re: 0 }; nodes.push(n);
    if (level >= 4) return;
    const nk = [6, 4, 3, 2][level];
    for (let i = 0; i < nk; i++) {
      const tt = level === 0 ? .32 + .6 * (i + rnd() * .7) / nk : .3 + .7 * (i + rnd()) / nk;
      let d = tilt(dir, (level === 0 ? .9 : .62) + rnd() * .3, i * 2.4 + rnd() * .9); d.y += .28; d.normalize();
      const L = len * (level === 0 ? .75 - .3 * tt : .66 + rnd() * .14);
      const b = level === 0 ? -1.6 + tt * 4.5 + rnd() : birth + 1.4 + rnd() * 2.6;
      branch(n, level + 1, tt, d, L, rad * .52 * (1.05 - .35 * tt), b);
    }
    // лідер: продовження вгору з кінця гілки
    if (level <= 1) { const d = tilt(dir, .08 + rnd() * .12, rnd() * 6.28); branch(n, level + 1, 1, d, len * (level === 0 ? .62 : .58), rad * .66, level === 0 ? birth + 1.2 : birth + 1.6); }
  }
  branch(null, 0, 0, new THREE.Vector3(.03, 1, .02).normalize(), 4.2, .3, -3);
  const NB = nodes.length;
  const brGeo = new THREE.CylinderGeometry(.68, 1, 1, 7, 1); brGeo.translate(0, .5, 0);
  const bark = new THREE.InstancedMesh(brGeo, new THREE.MeshLambertMaterial({ color: 0x5a4636 }), NB); bark.frustumCulled = false; bark.castShadow = true; sB.add(bark);
  // листя
  const leafTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fff';
    for (let k = 0; k < 9; k++) { x.save(); x.translate(64 + (Math.random() - .5) * 60, 64 + (Math.random() - .5) * 60); x.rotate(Math.random() * 6.28);
      x.beginPath(); x.ellipse(0, 0, 18 + Math.random() * 8, 9 + Math.random() * 4, 0, 0, 7); x.fill(); x.restore(); }
    const t = new THREE.CanvasTexture(c); return t; })();
  const leafs = [];
  nodes.forEach((n) => {
    const cnt = n.level === 0 ? 12 : [0, 4, 4, 5, 6][n.level];
    for (let k = 0; k < cnt; k++) {
      const off = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize();
      leafs.push({ n, t: n.level === 0 ? .55 + .45 * rnd() : .3 + .7 * rnd(), off, dist: .15 + rnd() * .5, size: .55 + rnd() * .4,
        q: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28)),
        ft: .58 + rnd() * .2, drift: new THREE.Vector3((rnd() - .5) * 5, 0, (rnd() - .5) * 5), ph: rnd() * 6.28, v: .85 + rnd() * .3,
        retire: n.level === 0 ? 4 : n.level === 1 ? 10 : n.level === 2 ? 18 : 1e9 });
    }
  });
  const NL = leafs.length;
  const leafGeo = new THREE.PlaneGeometry(1, 1);
  const leaves = new THREE.InstancedMesh(leafGeo, new THREE.MeshLambertMaterial({ map: leafTex, alphaTest: .5, side: THREE.DoubleSide }), NL);
  leaves.setColorAt(0, new THREE.Color()); leaves.frustumCulled = false; leaves.castShadow = true; leaves.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafTex, alphaTest: .5 }); sB.add(leaves);
  const blob = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ map: glowTex([[0, 'rgba(20,24,10,.55)'], [1, 'rgba(20,24,10,0)']]), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = .03; sB.add(blob);

  const M = new THREE.Matrix4(), QQ = new THREE.Quaternion(), V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), SC = new THREE.Vector3(), CC = new THREE.Color();
  const C = (h) => new THREE.Color(h);
  const COL = { bloom: C(0xf4dde6), spring: C(0x8db84a), summer: C(0x3f7a2a), yellow: C(0xe0b42a), orange: C(0xc8621e), brown: C(0x8a6a3c) };
  let lastTree = { h: 0, age: -1 };
  function tree(age, f, T) {
    const thick = .22 + .73 * (1 - Math.exp(-age / 12));
    let maxY = 0, ext = 0;
    for (const n of nodes) {
      const m = sm(n.birth, n.birth + 4, age);
      if (n.parent) { const P = n.parent; n.p0.copy(P.p0).addScaledVector(P.dir, P.Le * n.t); } else n.p0.set(0, 0, 0);
      n.Le = n.len * m * (n.parent && n.parent.Le === 0 ? 0 : 1); n.Re = n.rad * thick * (.35 + .65 * m);
      const top = n.p0.y + n.dir.y * n.Le; if (top > maxY) maxY = top;
    }
    const G = treeH(age) / maxY;
    for (let i = 0; i < NB; i++) {
      const n = nodes[i];
      if (n.Le <= 1e-4) { M.makeScale(0, 0, 0); bark.setMatrixAt(i, M); continue; }
      QQ.setFromUnitVectors(UP, n.dir); V1.copy(n.p0).multiplyScalar(G); SC.set(n.Re * G, n.Le * G, n.Re * G);
      M.compose(V1, QQ, SC); bark.setMatrixAt(i, M);
      const e = Math.hypot(V1.x, V1.z) + n.Le * G * Math.hypot(n.dir.x, n.dir.z); if (e > ext) ext = e;
    }
    bark.instanceMatrix.needsUpdate = true;
    // листя за порою року
    const bloom = sm(.02, .08, f) * (1 - sm(.11, .18, f));
    const grow = sm(.02, .08, f) * .55 + sm(.1, .22, f) * .45;
    const youth = 1 + .7 * (1 - sm(0, 5, age));
    const turn = sm(.5, .6, f), late = sm(.6, .7, f);
    for (let i = 0; i < NL; i++) {
      const L = leafs[i], n = L.n;
      const vis = n.Le > 1e-4 ? sm(n.birth + .5, n.birth + 2, age) * (1 - sm(L.retire, L.retire + 3, age)) : 0;
      let s = L.size * youth * grow * vis;
      V1.copy(n.p0).addScaledVector(n.dir, n.Le * L.t).multiplyScalar(G).addScaledVector(L.off, L.dist * Math.min(1, G * 1.4));
      let q = L.q, fallen = 0;
      if (f > L.ft) {                                   // відірвався: падає, потім лежить на землі до снігу
        const k = Math.min(1, (f - L.ft) / .025); fallen = k;
        V2.set(V1.x + L.drift.x, .04, V1.z + L.drift.z); const y0 = V1.y;
        V1.lerp(V2, k); V1.y = y0 + (.04 - y0) * k; V1.x += Math.sin(k * 9 + L.ph) * .5 * (1 - k);
        if (k >= 1) { q = QQ.setFromAxisAngle(V2.set(1, 0, 0), -Math.PI / 2); s *= .8; }
        s *= 1 - sm(.84, .9, f);
      } else if (!RM) V1.x += Math.sin(T * 1.7 + L.ph) * .03;
      if (f > .8 && f > L.ft + .03) s *= 1 - sm(.84, .9, f);
      SC.setScalar(Math.max(s, 0)); M.compose(V1, q, SC); leaves.setMatrixAt(i, M);
      CC.copy(COL.spring).lerp(COL.summer, sm(.18, .32, f)).lerp(COL.yellow, turn * (.6 + .4 * L.v)).lerp(COL.orange, late * (L.v > 1 ? .7 : .25));
      CC.lerp(COL.bloom, bloom); if (fallen > 0) CC.lerp(COL.brown, fallen * .7);
      CC.multiplyScalar(L.v); leaves.setColorAt(i, CC);
    }
    leaves.instanceMatrix.needsUpdate = true; leaves.instanceColor.needsUpdate = true;
    blob.scale.setScalar(Math.max(.6, ext * 1.1));
    lastTree = { h: treeH(age), age };
  }

  /* стан Землі на момент tP */
  const sd = new THREE.Vector3(), md = new THREE.Vector3(), avgDir = new THREE.Vector3(), tmp3 = new THREE.Color();
  const lerp3 = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
  let fast = 0;
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
    sB.fog.density = .005 + .0009 * Math.min(30, years);
    // світло
    avgDir.set(0, Math.sin(52 * Math.PI / 180), Math.cos(52 * Math.PI / 180));
    V1.copy(sd).lerp(avgDir, fast).normalize();
    sun.position.copy(V1).multiplyScalar(100); sun.intensity = (2.7 * dI * (1 - fast) + 1.7 * fast) * (1 - .35 * dustA);
    tmp3.setRGB(1, .8 + .2 * sm(.05, .4, sd.y), .6 + .38 * sm(.05, .4, sd.y)); sun.color.copy(tmp3).lerp(C(0xfff2dc), fast);
    moon.position.copy(md).multiplyScalar(100); moon.intensity = .5 * mI * (1 - fast);
    hemi.intensity = .18 + .95 * day1; hemi.color.setRGB(...lerp3([.35, .42, .7], [.75, .82, 1], day1), THREE.SRGBColorSpace);
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
    corn.scale.y = ch * (1 - .25 * dustA);
    CC.copy(C(0x7aa83a)).lerp(C(0x507f28), sm(.2, .32, f)).lerp(C(0xc9a85a), sm(.5, .64, f)).lerp(C(0xb7a07a), f > .72 ? 1 : 0).lerp(C(0xe8eaec), snow * .8);
    cornM.color.copy(CC);
    dust.material.opacity = .05 + .5 * dustA;
    if (!RM) { const p = dGeo.attributes.position.array; for (let i = 0; i < NDU; i++) { p[i * 3] += .02 + .01 * Math.sin(T + i); if (p[i * 3] > 40) p[i * 3] = -40; } dGeo.attributes.position.needsUpdate = true; }
    tree(years, f, T);
    return { years, f, hE };
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

  function overlay(st) {
    const x = ox; x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, W, H);
    const vw = mob ? W : W / 2, vh = mob ? H / 2 : H, bx = mob ? 0 : vw, by = mob ? vh : 0;
    x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 2; x.beginPath(); if (mob) { x.moveTo(0, vh); x.lineTo(W, vh); } else { x.moveTo(vw, 0); x.lineTo(vw, H); } x.stroke();
    const label = (px, py, a, b) => { x.font = '600 10.5px ' + getComputedStyle(document.body).getPropertyValue('--mono'); x.fillStyle = 'rgba(255,255,255,.92)';
      x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 6; x.fillText(a, px, py); x.font = '500 12px ' + getComputedStyle(document.body).getPropertyValue('--sans'); x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText(b, px, py + 16); x.shadowBlur = 0; };
    label(14, 22, 'ПЛАНЕТА МІЛЛЕР', '1 год тут = ' + earthSpan(K) + ' на Землі');
    label(bx + 14, by + 22, 'ЗЕМЛЯ · ФЕРМА', 'дерево ' + fmt(lastTree.h, 1) + ' м');
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
  const FOCUS = [.3, .38];                                          // смуга різкості: модуль у воді; дерево й будинок
  function tiltShift(scene, cam, k, x, y, w, h) {
    tsU.uFocus.value = FOCUS[k]; tsU.uAmt.value = k ? 1.9 : 1.1; tsU.uRes.value.set(Math.round(w * DPR), Math.round(h * DPR)); tsU.uTime.value = T;
    tsU.uTint.value.set(...(k ? [1.04, 1., .94] : [.96, 1., 1.04]));          // ферма — тепла, Міллер — холодна
    const pw = Math.max(4, Math.round(w * DPR)), ph = Math.max(4, Math.round(h * DPR)), [a, b] = RT[k];
    if (a.width !== pw || a.height !== ph) { a.setSize(pw, ph); b.setSize(pw, ph); }
    R.setScissorTest(false);
    R.setRenderTarget(a); R.render(scene, cam);
    tsU.tD.value = a.texture; tsU.uDir.value.set(1 / pw, 0); tsU.uLast.value = 0; R.setRenderTarget(b); R.render(tsS, tsC);
    R.setRenderTarget(null); R.setScissorTest(true); R.setViewport(x, y, w, h); R.setScissor(x, y, w, h);
    tsU.tD.value = b.texture; tsU.uDir.value.set(0, 1 / ph); tsU.uLast.value = 1; R.render(tsS, tsC);
  }

  let need = true, playing = false, vis = false, last = 0, prevT = tP, T = 0;
  function render(now) {
    const dt = Math.min(.1, last ? (now - last) / 1000 : 0); last = now;
    if (playing) { tP += dt * PLAY; if (tP >= T_MAX) { tP = T_MAX; setPlay(false); } sl.value = String(Math.round(tP)); counters(); }
    if (!RM) T += dt;
    const dps = dt > 0 ? Math.abs(tP - prevT) / 3600 * K / 24 / dt : 0; prevT = tP;
    const ft = sm(.4, 5, dps); fast += (ft - fast) * Math.min(1, dt * (ft > fast ? 6 : 2.5));
    if (fast < .002) fast = 0;
    // ліворуч
    const wz = waveZ(tP); watU.uWz.value = wz; watU.uT.value = T; skyAU.uT.value = T;
    const ride = waveH(0, wz);
    // ракурс згори, як на макет: камера на висоті ~34 м дивиться навскіс на модуль і людей у воді
    camA.position.set(mx * 4, 34 + ride, 26 + my * 2);
    camA.lookAt(mx * 4, ride * .85, -260);
    shipA.position.y = waveH(-38, wz) * .98; people.forEach((g, i) => { g.position.y = waveH(g.position.z, wz) * .98;
      if (!RM) { g.rotation.z = Math.sin(T * .9 + i * 2.1) * .025; g.rotation.y = Math.sin(T * .23 + i) * .25; } });   // переступають, озираються
    skyA.position.copy(camA.position); garg.position.copy(camA.position).addScaledVector(GDIR, 9000); garg.lookAt(camA.position);
    // праворуч
    const st = earth(T);
    camB.position.set(camB0.x + mx * .8, camB0.y + my * -.25, camB0.z); camB.lookAt(camBT);
    skyB.position.copy(camB.position);
    const vw = mob ? W : W / 2, vh = mob ? H / 2 : H;
    tiltShift(sA, camA, 0, 0, mob ? vh : 0, vw, vh);
    tiltShift(sB, camB, 1, mob ? 0 : vw, 0, vw, vh);
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
    addEventListener('is-spin', (e) => { K = e.detail.K; counters(); filmNote(); refresh && refresh(); });
  }
  window.IS_TIME = { R, tsU, render };
  resize();
  render(performance.now());   // перший кадр одразу, щоб сцена не була порожньою
}
