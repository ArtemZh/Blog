/* Стаття 34, розділ 04 — макросцена «Пил у кімнаті Мерф».
   Кадр упритул до підлоги: дошки, підвіконня, за склом — пилова буря; крізь вікно промінь, у ньому плавають пилинки.
   Фізика (чесно): пилинки дрейфують і повільно осідають (Стокс: десяті частки мм/с…см/с для 10–50 мкм; тут швидкість
   осідання пришвидшена для показу), світло розсіюється на них переважно вперед — тому промінь видно саме проти світла.
   Сюжет (вигадка): кнопка «Аномалія» — пил лягає на дошки смугами двійкового коду (широка = 1, вузька = 0); координати умовні.
   Курсор — подих: розганяє пилинки поруч. Рендер лише коли блок видно; DPR ≤ 2; reduced-motion — без дрейфу; без WebGL — заглушка. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { gradePass } from './is-post.js?v=20261019002319';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const root = document.getElementById('viz-dust');
if (root) init(root);

function init(root) {
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('./is-dust.css?v=1', import.meta.url).href;
  document.head.appendChild(css);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BITS = '100011010110';                                   // 6 + 6 біт: умовні «координати» 35 · 22
  const groups = [BITS.slice(0, 6), BITS.slice(6)];
  const dec = groups.map(g => parseInt(g, 2));

  root.innerHTML = `
  <div class="dst">
    <div class="dst-stage" aria-label="Пил у промені світла в кімнаті Мерф">
      <div class="dst-hud"><span class="badge fic">вигадка</span><b>кімната Мерф · макро</b><span class="dst-st">пилинки у промені — живий час · подих розганяє</span></div>
      <span class="dst-cap">проведіть курсором або пальцем — подих розганяє пил</span>
      <div class="dst-bits" aria-hidden="true">${[...BITS].map((b, i) => `<i class="${b === '1' ? 'w' : 'n'}"></i>${i === 5 ? '<u></u>' : ''}`).join('')}</div>
    </div>
    <div class="dst-ctl">
      <button type="button" class="dst-go" aria-pressed="false">Аномалія</button>
      <div class="dst-read" aria-live="polite"></div>
    </div>
    <p class="chint">Фізика тут — як падає пил і як на ньому розсіюється світло: дрібні пилинки осідають за Стоксом зі швидкістю від часток міліметра до сантиметрів за секунду (у сцені осідання пришвидшене), а промінь видно, бо пилинки розсіюють світло переважно вперед — проти світла він яскравіший. «Гравітаційне повідомлення» смугами на підлозі — сюжет фільму; код і координати тут умовні, не з фільму.</p>
  </div>`;

  const $ = s => root.querySelector(s);
  const stage = $('.dst-stage'), st = $('.dst-st'), goBtn = $('.dst-go'), read = $('.dst-read');
  const bitEls = [...root.querySelectorAll('.dst-bits i')];

  let anomaly = false;
  const prog = new Array(12).fill(0);              // частка пилу, що вже лягла в кожну смугу

  function readout() {
    if (!anomaly) { read.innerHTML = `широка смуга = <b>1</b>, вузька = <b>0</b> · натисніть «Аномалія» — пил ляже кодом`; return; }
    const shown = [...BITS].map((b, i) => prog[i] > 0.5 ? b : '·');
    const g = [shown.slice(0, 6).join(''), shown.slice(6).join('')];
    const done = prog.every(p => p > 0.5);
    read.innerHTML = `широка = <b>1</b>, вузька = <b>0</b> → <b>${g[0]}</b> · <b>${g[1]}</b>` +
      (done ? ` → <b class="dst-dec">${dec[0]}</b> · <b class="dst-dec">${dec[1]}</b> → <span class="q">? ${dec[0]}°, ${dec[1]}°</span> — координати умовні, не з фільму` : ' …');
    bitEls.forEach((e, i) => e.classList.toggle('on', prog[i] > 0.5));
  }

  /* ── 3D ── */
  let three = null;
  try { three = build3D(); } catch (e) { console.error('is-dust', e); three = null; }
  if (!three) {
    const f = document.createElement('div'); f.className = 'fail';
    f.textContent = 'Тут мала бути 3D-макросцена з пилом у промені світла, але браузер не дав WebGL.';
    stage.appendChild(f);
  }

  function build3D() {
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x0b0906, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    stage.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 20);

    /* геометрія кімнати (метри): вікно в задній стіні, промінь сонця крізь нього на підлогу */
    const WIN = { x0: -0.70, x1: 0.20, y0: 0.55, y1: 1.60, z: -1.40, cx: -0.25, cy: 1.075 };   // cx/cy — перехрестя рами
    const D = new THREE.Vector3(0.30, -0.62, 0.74).normalize();                                  // напрям світла
    const PERP = new THREE.Vector2(0.927, -0.376), ALONG = new THREE.Vector2(0.376, 0.927);     // осі на підлозі: поперек / уздовж променя
    const uOf = (x, z) => PERP.x * x + PERP.y * z, vOf = (x, z) => ALONG.x * x + ALONG.y * z;
    const xOf = (u, v) => PERP.x * u + ALONG.x * v, zOf = (u, v) => PERP.y * u + ALONG.y * v;
    // смуги коду: дві групи по 6 біт обабіч тіні від вертикальної планки рами (u = 0.294)
    const BIT_U = [], BIT_W = [];
    [[-0.11, 0.27], [0.32, 0.70]].forEach(([a, b], gi) => {
      const pitch = (b - a) / 6;
      for (let k = 0; k < 6; k++) { BIT_U.push(a + pitch * (k + 0.5)); BIT_W.push(BITS[gi * 6 + k] === '1' ? 0.040 : 0.014); }
    });
    const V0 = -0.62, V1 = 0.62;                                   // довжина смуг уздовж променя

    const GLSL_LIT = `
      uniform vec3 uD; uniform vec4 uWin; uniform vec3 uWinZ;    // uWinZ: z вікна, x і y перехрестя рами
      float lit(vec3 p){
        float t = (p.z - uWinZ.x) / uD.z; vec3 b = p - uD * t;    // точка, де промінь пройшов площину вікна
        float e = .035;
        float ix = smoothstep(uWin.x, uWin.x + e, b.x) * (1. - smoothstep(uWin.z - e, uWin.z, b.x));
        float iy = smoothstep(uWin.y, uWin.y + e, b.y) * (1. - smoothstep(uWin.w - e, uWin.w, b.y));
        float bx = 1. - smoothstep(.016, .03, abs(b.x - uWinZ.y));
        float by = 1. - smoothstep(.016, .03, abs(b.y - uWinZ.z));
        return ix * iy * (1. - max(bx, by)) * step(0., t);
      }`;
    const litU = () => ({ uD: { value: D }, uWin: { value: new THREE.Vector4(WIN.x0, WIN.y0, WIN.x1, WIN.y1) }, uWinZ: { value: new THREE.Vector3(WIN.z, WIN.cx, WIN.cy) } });

    /* підлога: дошки (процедурна текстура) + промінь вікна + смуги пилу */
    const wood = (() => {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const x = c.getContext('2d');
      let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const PW = 1024 / 7;
      for (let i = 0; i < 7; i++) {
        const base = 92 + r() * 30, g = base * .72, b = base * .48;
        x.fillStyle = `rgb(${base|0},${g|0},${b|0})`; x.fillRect(i * PW, 0, PW, 1024);
        for (let k = 0; k < 90; k++) {                                     // волокна
          x.strokeStyle = `rgba(${r() > .5 ? 30 : 160},${r() > .5 ? 20 : 120},${10},${.05 + r() * .12})`; x.lineWidth = .6 + r() * 1.8;
          const xx = i * PW + r() * PW; x.beginPath(); x.moveTo(xx, 0);
          for (let y = 0; y <= 1024; y += 64) x.lineTo(xx + Math.sin(y * .01 + k) * 4, y); x.stroke();
        }
        x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(i * PW - 2, 0, 4, 1024);           // щілина
        const sy = r() * 900; x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(i * PW, sy, PW, 2);  // стик дошок
      }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.6, 1.6); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    })();
    const floorMat = new THREE.ShaderMaterial({
      uniforms: { ...litU(), uWood: { value: wood }, uBit: { value: new Array(12).fill(0) }, uBitU: { value: BIT_U }, uBitW: { value: BIT_W },
        uAx: { value: new THREE.Vector4(PERP.x, PERP.y, ALONG.x, ALONG.y) }, uV: { value: new THREE.Vector2(V0, V1) } },
      vertexShader: `varying vec3 vP; varying vec2 vUv; void main(){ vP = (modelMatrix * vec4(position,1.)).xyz; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform sampler2D uWood; uniform float uBit[12], uBitU[12], uBitW[12]; uniform vec4 uAx; uniform vec2 uV; varying vec3 vP; varying vec2 vUv;
        ${GLSL_LIT}
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec3 w = texture2D(uWood, vUv * 1.6).rgb; w *= w;                      // ≈ у лінійний простір
          float L = lit(vP);
          float u = uAx.x * vP.x + uAx.y * vP.z, v = uAx.z * vP.x + uAx.w * vP.z;
          float dust = 0.; float along = smoothstep(uV.x, uV.x + .08, v) * (1. - smoothstep(uV.y - .08, uV.y, v));
          for (int k = 0; k < 12; k++) {
            float d = abs(u - uBitU[k]) - uBitW[k] * .5;
            dust += uBit[k] * (1. - smoothstep(-.004, .006, d));
          }
          float grain = .55 + .45 * h(floor(vP.xz * 900.));                          // пил — зернистий, не фарба
          dust = clamp(dust * along * grain, 0., 1.);
          vec3 amb = vec3(.16, .17, .2), sun = vec3(1., .86, .66) * 3.2;
          vec3 col = w * (amb + sun * L);
          vec3 dcol = vec3(.62, .52, .40) * (amb * 2.2 + sun * L * 1.05);
          col = mix(col, dcol, dust * .9);
          gl_FragColor = vec4(col, 1.);
        }` });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), floorMat); floor.rotation.x = -Math.PI / 2; scene.add(floor);

    /* стіна з вікном, рама, підвіконня */
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x5a4f46 });
    const wall = (x, y, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat); m.position.set(x, y, WIN.z - 0.01); scene.add(m); };
    wall((WIN.x0 - 2.5) / 2 + 0, 1.5, WIN.x0 + 2.5, 3); wall((WIN.x1 + 2.5) / 2, 1.5, 2.5 - WIN.x1, 3);
    wall((WIN.x0 + WIN.x1) / 2, WIN.y0 / 2, WIN.x1 - WIN.x0, WIN.y0); wall((WIN.x0 + WIN.x1) / 2, (WIN.y1 + 3) / 2, WIN.x1 - WIN.x0, 3 - WIN.y1);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xcfc3ae });
    const bar = (x, y, z, w, h, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat); m.position.set(x, y, z); scene.add(m); return m; };
    const FW = 0.05, FD = 0.07, mx = (WIN.x0 + WIN.x1) / 2, my = (WIN.y0 + WIN.y1) / 2;
    bar(WIN.x0 - FW / 2, my, WIN.z, FW, WIN.y1 - WIN.y0 + FW * 2, FD); bar(WIN.x1 + FW / 2, my, WIN.z, FW, WIN.y1 - WIN.y0 + FW * 2, FD);
    bar(mx, WIN.y1 + FW / 2, WIN.z, WIN.x1 - WIN.x0, FW, FD);
    bar(WIN.cx, my, WIN.z, 0.035, WIN.y1 - WIN.y0, 0.04); bar(mx, WIN.cy, WIN.z, WIN.x1 - WIN.x0, 0.035, 0.04);
    const sill = bar(mx, WIN.y0 - 0.02, WIN.z + 0.06, WIN.x1 - WIN.x0 + 0.3, 0.04, 0.22);   // підвіконня
    sill.material = new THREE.MeshLambertMaterial({ color: 0xd8ccb6 });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN.x1 - WIN.x0, WIN.y1 - WIN.y0),
      new THREE.MeshBasicMaterial({ color: 0xffe9c0, transparent: true, opacity: 0.08, depthWrite: false }));
    glass.position.set(mx, my, WIN.z); scene.add(glass);

    /* за склом — пилова буря: вохристе небо, імла, силует поля */
    const outMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform float uT; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * n(p); p *= 2.03; a *= .5; } return s; }
        void main(){
          vec2 p = vUv * vec2(3., 2.);
          float haze = fbm(p * 1.6 + vec2(uT * .05, uT * .012)) ;
          float haze2 = fbm(p * 3.1 - vec2(uT * .09, 0.));
          vec3 sky = mix(vec3(.50, .30, .11), vec3(.95, .72, .40), smoothstep(.15, .95, vUv.y + .25 * haze - .12));
          sky = mix(sky, vec3(.78, .58, .33), .45 * haze2);
          float horizon = .34 + .03 * fbm(p * 4. + 7.) + .012 * sin(vUv.x * 60.);
          float field = 1. - smoothstep(horizon - .01, horizon + .01, vUv.y);
          vec3 col = mix(sky, vec3(.26, .17, .08) * (.6 + .4 * haze), field * (1. - .55 * smoothstep(horizon - .25, horizon, vUv.y)));
          float sun = exp(-dot(vUv - vec2(.33, .78), vUv - vec2(.33, .78)) * 14.);
          col += vec3(1., .85, .6) * sun * .9;
          gl_FragColor = vec4(col * .95, 1.);
        }` });
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), outMat); outside.position.set(-0.2, 1.5, WIN.z - 1.6); scene.add(outside);

    /* об'ємний промінь: призма від вікна до підлоги, адитивна, яскравіша по краях і в «променях» */
    const beamGeo = (() => {
      const W = [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]].map(([x, y]) => new THREE.Vector3(x, y, WIN.z));
      const F = W.map(w => w.clone().addScaledVector(D, -w.y / D.y));
      const pos = [], par = [], idx = [];
      W.forEach((w, i) => { pos.push(w.x, w.y, w.z); par.push(0); }); F.forEach((f) => { pos.push(f.x, f.y, f.z); par.push(1); });
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; idx.push(i, j, j + 4, i, j + 4, i + 4); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aPar', new THREE.Float32BufferAttribute(par, 1)); g.setIndex(idx); g.computeVertexNormals(); return g;
    })();
    const beamMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `attribute float aPar; varying float vPar, vF; varying vec3 vP;
        void main(){ vPar = aPar; vP = (modelMatrix * vec4(position,1.)).xyz; vec3 n = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.);
          vF = 1. - abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uT; varying float vPar, vF; varying vec3 vP;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        void main(){
          float rays = .6 + .4 * n(vec2(vP.x * 9. - vP.y * 3., uT * .07));
          float a = (.012 + .07 * pow(vF, 2.)) * mix(1., .3, vPar) * rays;
          gl_FragColor = vec4(vec3(1., .82, .55) * a, 1.);
        }` });
    scene.add(new THREE.Mesh(beamGeo, beamMat));

    /* світло для ламбертових поверхонь (рама, стіна, меблі) */
    scene.add(new THREE.HemisphereLight(0x8a93a8, 0x201a14, 0.9));
    const sun = new THREE.DirectionalLight(0xffdcb0, 1.4); sun.position.copy(D).multiplyScalar(-4); scene.add(sun);
    const bounce = new THREE.PointLight(0xffc890, 0.9, 2.5, 2); bounce.position.set(0.35, 0.05, -0.1); scene.add(bounce);

    // меблі кімнати Мерф (GLB із розділу 08) — ліворуч за краєм кадру, як натяк на кімнату
    new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/'))
      .load('assets/interstellar/murph-room.glb', (g) => {
        g.scene.traverse((o) => { if (o.isMesh) { o.material = new THREE.MeshLambertMaterial({ map: o.material.map || null, color: o.material.map ? 0xffffff : 0x8a7a66 }); } });
        g.scene.scale.setScalar(0.62); g.scene.position.set(-1.95, 0, -0.35); g.scene.rotation.y = Math.PI / 2; scene.add(g.scene); kick();
      }, undefined, () => {});

    /* пилинки */
    const NP = 3200;
    const pos = new Float32Array(NP * 3), seed = new Float32Array(NP), rest = new Float32Array(NP), spd = new Float32Array(NP);
    const P = []; let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const BOX = { x0: -0.85, x1: 1.15, y0: 0.01, y1: 1.45, z0: -1.36, z1: 0.85 };
    // розподіл по смугах — пропорційно ширині
    const wsum = BIT_W.reduce((a, b) => a + b, 0);
    for (let i = 0; i < NP; i++) {
      let k = 0, r = rnd() * wsum; while (k < 11 && r > BIT_W[k]) { r -= BIT_W[k]; k++; }
      const tu = BIT_U[k] + (rnd() - 0.5) * BIT_W[k] * 0.92, tv = V0 + rnd() * (V1 - V0);
      P.push({ x: BOX.x0 + rnd() * (BOX.x1 - BOX.x0), y: BOX.y0 + rnd() * (BOX.y1 - BOX.y0), z: BOX.z0 + rnd() * (BOX.z1 - BOX.z0),
        vx: 0, vy: 0, vz: 0, s: rnd(), bit: k, tx: xOf(tu, tv), tz: zOf(tu, tv), vt: 0.14 + rnd() * 0.16, rest: 0 });
      seed[i] = P[i].s;
    }
    const perBit = new Array(12).fill(0); P.forEach(p => perBit[p.bit]++);
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); ptGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1)); ptGeo.setAttribute('aRest', new THREE.BufferAttribute(rest, 1)); ptGeo.setAttribute('aSpd', new THREE.BufferAttribute(spd, 1));
    const ptU = { ...litU(), uCam: { value: camera.position }, uFocus: { value: 1.6 }, uRange: { value: 0.35 }, uScale: { value: 400 } };
    const ptMat = new THREE.ShaderMaterial({
      uniforms: ptU, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSeed, aRest, aSpd; uniform vec3 uCam; uniform float uFocus, uRange, uScale; varying float vA; varying vec3 vC;
        ${GLSL_LIT}
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.); float dep = -mv.z;
          float coc = abs(dep - uFocus) / uRange;                                   // 0 — у площині різкості
          float mm = (1.6 + 1.6 * aSeed) * 1e-3 * (1. + coc * 4.5);
          gl_PointSize = clamp(mm * uScale / dep, 1., 56.);
          float L = lit(position);
          float fwd = pow(max(0., dot(uD, normalize(uCam - position))), 3.);        // розсіювання вперед
          float b = .07 + L * (.22 + 1.3 * fwd) * mix(1., .45, aRest);
          b += aSpd * (.08 + L * (.5 + 1.2 * fwd));                                  // здута пилинка спалахує — розсіювання вперед
          vA = b / (1. + coc * coc * 2.2);
          vC = mix(vec3(.55, .55, .6), vec3(1., .88, .66), L);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - .5) * 2.; float a = 1. - smoothstep(.25, 1., r); gl_FragColor = vec4(vC * vA * a, 1.); }` });
    scene.add(new THREE.Points(ptGeo, ptMat));

    /* курсор або палець — подих: кожен рух лишає «подув» (центр, напрям, сила), що діє ~1,5 с і згасає */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), prevHit = new THREE.Vector3();
    const focusPt = new THREE.Vector3(0.2, 0.85, -0.45), focusFloor = new THREE.Vector3(0.3, 0.0, -0.05);
    const plane = new THREE.Plane();
    const puffs = []; let havePrev = false;
    const BR = 0.4, BLIFE = 1.4;                                  // радіус подиху (м), час життя (с)
    const onMove = (e) => {
      const r = stage.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), anomaly ? focusFloor : focusPt);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      if (!havePrev || e.type === 'pointerdown') { prevHit.copy(hit); havePrev = true; }
      const mx = hit.x - prevHit.x, my = hit.y - prevHit.y, mz = hit.z - prevHit.z, ml = Math.hypot(mx, my, mz);
      const str = e.type === 'pointerdown' ? 0.7 : Math.min(1, ml / 0.06);
      if (str > 0.05) {
        const inv = ml > 1e-4 ? 1 / ml : 0;
        puffs.push({ x: hit.x, y: hit.y, z: hit.z, dx: mx * inv, dy: my * inv, dz: mz * inv, s: str, t: 0 });
        if (puffs.length > 24) puffs.shift();
      }
      prevHit.copy(hit); kick();
    };
    stage.addEventListener('pointermove', onMove); stage.addEventListener('pointerdown', onMove);
    stage.addEventListener('pointerleave', () => { havePrev = false; }); stage.addEventListener('pointerup', () => { havePrev = false; });

    /* постобробка: тілшифт (смуга різкості йде за точкою фокуса) → тон → плівка */
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
    const tilt = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uFocus: { value: .5 }, uBand: { value: .22 }, uAmt: { value: 5 }, uRes: { value: new THREE.Vector2(1, 1) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `uniform sampler2D tDiffuse; uniform float uFocus, uBand, uAmt; uniform vec2 uRes; varying vec2 vUv;
        void main(){
          float k = smoothstep(uBand * .5, uBand * 2.2, abs(vUv.y - uFocus)) * uAmt;
          vec4 c = texture2D(tDiffuse, vUv);
          if (k > .3) { vec2 px = k / uRes; c *= 2.;
            c += texture2D(tDiffuse, vUv + vec2(1., 0.) * px) + texture2D(tDiffuse, vUv - vec2(1., 0.) * px) + texture2D(tDiffuse, vUv + vec2(0., 1.) * px) + texture2D(tDiffuse, vUv - vec2(0., 1.) * px);
            c += texture2D(tDiffuse, vUv + vec2(.7, .7) * px) + texture2D(tDiffuse, vUv - vec2(.7, .7) * px) + texture2D(tDiffuse, vUv + vec2(.7, -.7) * px) + texture2D(tDiffuse, vUv - vec2(.7, -.7) * px);
            c += texture2D(tDiffuse, vUv + vec2(.4, 1.4) * px) + texture2D(tDiffuse, vUv - vec2(.4, 1.4) * px) + texture2D(tDiffuse, vUv + vec2(1.4, -.4) * px) + texture2D(tDiffuse, vUv - vec2(1.4, -.4) * px);
            c /= 14.; }
          gl_FragColor = c;
        }` });
    composer.addPass(tilt); composer.addPass(new OutputPass());
    const grade = gradePass({ vignette: .5, grain: .06, ca: 1.2, sat: 1.05, tint: [1.03, .99, .93] }); composer.addPass(grade);

    let W = 1, H = 1;
    function resize() {
      W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return;
      renderer.setSize(W, H, false); composer.setSize(W, H);
      camera.aspect = W / H; camera.fov = W < H ? 60 : 42; camera.updateProjectionMatrix();
      ptU.uScale.value = H * DPR / (2 * Math.tan(camera.fov * Math.PI / 360));
      tilt.uniforms.uRes.value.set(W * DPR, H * DPR); tilt.uniforms.uAmt.value = 4.5 * DPR;
    }
    new ResizeObserver(() => { resize(); kick(); }).observe(stage);
    resize();

    /* крок пилинок */
    let T = 0, focusD = 1.6, codeFade = 0;
    const tmp = new THREE.Vector3(), camDir = new THREE.Vector3();
    function stepDust(dt) {
      for (let q = puffs.length - 1; q >= 0; q--) { puffs[q].t += dt; if (puffs[q].t > BLIFE) puffs.splice(q, 1); }
      const settled = new Array(12).fill(0);
      for (let i = 0; i < NP; i++) {
        const p = P[i];
        if (p.rest) { settled[p.bit]++; continue; }
        for (let q = 0; q < puffs.length; q++) {
          const b = puffs[q], dx = p.x - b.x, dy = p.y - b.y, dz = p.z - b.z, d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > BR * BR) continue;
          const d = Math.sqrt(d2) + 1e-4, age = 1 - b.t / BLIFE, f = (1 - d / BR) * age * age * b.s * dt * 7;
          // віяло вперед за рухом, радіальний поштовх і закрут навколо осі руху (вихор)
          const cx = b.dy * dz - b.dz * dy, cy = b.dz * dx - b.dx * dz, cz = b.dx * dy - b.dy * dx;
          p.vx += (b.dx * 1.3 + dx / d * .5 + cx / d * .9) * f; p.vy += (b.dy * 1.3 + dy / d * .5 + cy / d * .9) * f; p.vz += (b.dz * 1.3 + dz / d * .5 + cz / d * .9) * f;
        }
        const k = Math.exp(-dt * 2.2); p.vx *= k; p.vy *= k; p.vz *= k;
        const vm = Math.hypot(p.vx, p.vy, p.vz); if (vm > 0.4) { const q = 0.4 / vm; p.vx *= q; p.vy *= q; p.vz *= q; }   // стеля швидкості подиху
        if (anomaly) {
          // аномалія: пилинка пливе до своєї смуги й осідає зі своєю (пришвидшеною) швидкістю
          const a = 1 - Math.exp(-dt * 1.4);
          p.x += (p.tx - p.x) * a + p.vx * dt; p.z += (p.tz - p.z) * a + p.vz * dt;
          p.y += (-p.vt + p.vy) * dt + Math.sin(T * 2.1 + p.s * 9) * 0.004 * dt;
          if (p.y <= 0.004) { p.y = 0.003; p.x = p.tx; p.z = p.tz; p.rest = 1; rest[i] = 1; p.vx = p.vy = p.vz = 0; settled[p.bit]++; }
        } else {
          const fx = .018 * Math.sin(1.7 * p.y + .37 * T + 6.28 * p.s) + .012 * Math.sin(2.9 * p.z - .23 * T);
          const fy = -.007 + .010 * Math.sin(2.3 * p.x + .29 * T + 3 * p.s);
          const fz = .014 * Math.cos(2.1 * p.x + .19 * T + 2 * p.s) + .009 * Math.sin(1.3 * p.y + .41 * T);
          p.x += (fx + p.vx) * dt; p.y += (fy + p.vy) * dt; p.z += (fz + p.vz) * dt;
          if (p.y < BOX.y0) { p.y = 0.8 + rnd() * 0.6; p.x = BOX.x0 + rnd() * (BOX.x1 - BOX.x0); p.z = BOX.z0 + rnd() * (BOX.z1 - BOX.z0); }
          if (p.y > BOX.y1) p.y = BOX.y1;
          if (p.x < BOX.x0) p.x = BOX.x1; else if (p.x > BOX.x1) p.x = BOX.x0;
          if (p.z < BOX.z0) p.z = BOX.z1; else if (p.z > BOX.z1) p.z = BOX.z0;
        }
      }
      for (let i = 0; i < NP; i++) { const p = P[i]; pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; spd[i] = Math.min(1, Math.hypot(p.vx, p.vy, p.vz) / 0.35); }
      ptGeo.attributes.position.needsUpdate = true; ptGeo.attributes.aRest.needsUpdate = true; ptGeo.attributes.aSpd.needsUpdate = true;
      for (let k = 0; k < 12; k++) prog[k] = anomaly ? settled[k] / perBit[k] : 0;
    }
    function settleAll(on) {        // reduced-motion або миттєве прибирання
      for (let i = 0; i < NP; i++) { const p = P[i];
        if (on) { p.x = p.tx; p.z = p.tz; p.y = 0.003; p.rest = 1; rest[i] = 1; }
        else if (p.rest) { p.rest = 0; rest[i] = 0; p.y = 0.05 + rnd() * 1.2; p.vy = 0.1 + rnd() * 0.25; p.vx = (rnd() - .5) * .3; p.vz = (rnd() - .5) * .3; } }
    }

    function frame(dt) {
      T += dt;
      const sw = RM ? 0 : 1;
      camera.position.set(0.46 + .012 * Math.sin(T * .21) * sw, 0.40 + .008 * Math.sin(T * .17 + 1) * sw, 1.05);
      camera.lookAt(0.05 + .01 * Math.sin(T * .13) * sw, 0.30, -0.6);
      const fp = anomaly ? focusFloor : focusPt;
      camera.getWorldDirection(camDir);
      const fd = tmp.copy(fp).sub(camera.position).dot(camDir);
      focusD = RM ? fd : focusD + (fd - focusD) * (1 - Math.exp(-dt * 1.6));
      ptU.uFocus.value = focusD; ptU.uRange.value = 0.3 + 0.1 * focusD;
      tmp.copy(camera.position).addScaledVector(camDir, focusD).project(camera);     // точка фокуса → смуга різкості на екрані
      tilt.uniforms.uFocus.value = (tmp.y + 1) / 2 + (anomaly ? 0.02 : 0.05);
      tilt.uniforms.uBand.value = anomaly ? 0.2 : 0.3;
      if (!RM) stepDust(dt); else if (needDust) { stepDust(0); needDust = false; }
      const tgt = anomaly ? 1 : 0; codeFade = RM ? tgt : codeFade + (tgt - codeFade) * (1 - Math.exp(-dt * 2));
      for (let k = 0; k < 12; k++) floorMat.uniforms.uBit.value[k] = Math.min(1, prog[k] * 1.15) * codeFade;
      outMat.uniforms.uT.value = T; beamMat.uniforms.uT.value = T;
      grade.tick(T, W, H); composer.render();
      return !RM;
    }
    let needDust = true;
    window.IS_DUST = { renderer, P, puffs, camera };
    return { frame, settleAll, markDust: () => { needDust = true; } };
  }

  /* ── аномалія ── */
  function setAnomaly(on) {
    anomaly = on; goBtn.setAttribute('aria-pressed', String(on)); goBtn.textContent = on ? 'Прибрати пил' : 'Аномалія';
    stage.classList.toggle('is-code', on);
    st.textContent = on ? 'аномалія: пил лягає смугами · кнопка «Прибрати пил» під сценою — повернути як було' : 'пилинки у промені — живий час · подих розганяє';
    if (three) { if (RM) { three.settleAll(on); three.markDust(); } else if (!on) three.settleAll(false); }
    if (RM && on) prog.fill(1);
    readout(); kick();
  }
  goBtn.addEventListener('click', () => setAnomaly(!anomaly));

  /* ── цикл: лише коли блок видно ── */
  let visible = false, raf = 0, last = 0, readT = 0;
  function loop(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    const moving = three ? three.frame(dt) : false;
    if (anomaly && !RM) { readT += dt; if (readT > 0.25) { readT = 0; readout(); } }
    if (visible && moving) raf = requestAnimationFrame(loop); else last = 0;
  }
  function kick() { if (visible && !raf) raf = requestAnimationFrame(loop); }
  new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; last = 0; } }, { rootMargin: '80px' }).observe(stage);

  readout();
}
