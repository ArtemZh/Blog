/* Стаття 36, трейлер v6: пост-кредит у стилі Marvel — сцени three.js для shared/sk-trailer.js (рендер в окреме WebGL-полотно,
   трейлер переносить його у свій кадр через drawImage). Кадр — функція від часу без стану: усі положення, кольори й уламки
   рахуються з u (секунди сцени) і hash(), тож ?reel=render і __reel.seek дають ті самі кадри.
   1) holo(u): долоня з ручним голографічним передавачем (процедурно), над ним — постать у каптурі без обличчя (під каптуром темрява),
      синьо-біла голограма зі сканлайнами й перешкодами; наприкінці камера пірнає в голограму.
   2) fleet(u, ticks, boom): голостіл і два флоти-голограми — справжні моделі з гри SW_TopDown (assets/skill/reel/sw/*.glb,
      CC BY 4.0: Holotable — eemil; Destroyer, TIE Interceptor, TIE Bomber, A-wing, Y-wing — LarsH.; Venator — Digital Sock;
      Nebulon-B — Daniel; X-wing — Lena Katsak; Sketchfab Standard: TIE Fighter, CR90 — Heataker; CC BY-NC-SA 4.0: Mon Calamari — StarWars-Universe
      (стаття 36 внутрішня, не публікується; спрощено й стиснуто Draco, ship-pipeline/trailer-v6-models/convert.py).
      Посеред флотів — морська міна (процедурно): тремтить, індикатор блимає за цоканням, вибух — ударна хвиля кільцем, уламки, біле світло.
   Голограма — шейдер за мотивами SW/Hologram гри: френель + внутрішні ребра + сканлайни + адитивне змішування; мерехтіння ≤ 6 % яскравості. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const cl = (v) => Math.max(0, Math.min(1, v)), ez = (v) => { v = cl(v); return v * v * (3 - 2 * v); }, eo = (v) => 1 - Math.pow(1 - cl(v), 3), lerp = (a, b, k) => a + (b - a) * k;
const DIR = 'assets/skill/reel/sw/';
const RED = new THREE.Vector3(1.75, .3, .22), BLUE = new THREE.Vector3(.16, .62, 1.7), PALE = new THREE.Vector3(.55, .85, 1.6), WARM = new THREE.Vector3(1.3, 1.15, 1.0);

// ── голограма: френель (контур), внутрішні ребра, сканлайни знизу вгору, широка смуга розгортки, ледь помітне мерехтіння ──
function holoMat(col, o = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uCol: { value: col.clone() }, uT: { value: 0 }, uA: { value: 1 }, uFill: { value: o.fill ?? .06 }, uRim: { value: o.rim ?? 1.1 }, uLines: { value: o.lines ?? 90 }, uGl: { value: 0 }, uSeed: { value: o.seed ?? 0 } },
    vertexShader: `uniform float uT, uGl, uSeed; varying vec3 vW, vN;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0);
        // перешкоди: горизонтальні смуги зсуваються вбік
        float b = step(0.55, fract(sin(floor(w.y * 160.0) * 12.9898 + floor(uT * 24.0) + uSeed) * 43758.5453)); w.x += uGl * 0.012 * b * sign(sin(w.y * 400.0 + uT * 60.0));
        vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uCol; uniform float uT, uA, uFill, uRim, uLines; varying vec3 vW, vN;
      void main() { vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
        float edge = 1.0 - abs(dot(N, V)), rim = edge * edge * edge;
        vec3 dx = dFdx(N), dy = dFdy(N); float crease = clamp((length(dx) + length(dy)) * 1.6, 0.0, 1.0);
        float ph = fract(vW.y * uLines - uT * 0.06 * uLines), scan = 0.3 + 0.7 * smoothstep(0.0, 0.25, ph) * (1.0 - smoothstep(0.55, 0.8, ph));
        float sw = fract(vW.y * 2.2 - uT * 0.35), band = smoothstep(0.92, 0.985, sw) * (1.0 - smoothstep(0.985, 1.0, sw));
        float fl = 0.97 + 0.02 * sin(uT * 31.0) * sin(uT * 12.7) + 0.01 * sin(uT * 83.0);
        float k = (uFill + rim * uRim + crease * 0.35) * scan + band * 0.5;
        vec3 c = uCol * k * fl + vec3(0.6, 0.85, 1.0) * (rim * rim * uRim * 0.18 + band * 0.2) * fl;
        gl_FragColor = vec4(min(c * uA, vec3(3.0)), 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
}
// промінь проєктора: відкритий конус, згасає догори, вертикальні волокна світла
function beamMat(col, o = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uCol: { value: col.clone() }, uT: { value: 0 }, uA: { value: 1 }, uN: { value: o.n ?? 26 } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uCol; uniform float uT, uA, uN; varying vec2 vUv;
      void main() { float a = vUv.x * uN, s = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(a * 6.2832 + sin(a * 1.7) * 2.0), 3.0);
        float f = pow(1.0 - vUv.y, 1.6) * (0.75 + 0.25 * sin(vUv.y * 40.0 - uT * 3.0));
        gl_FragColor = vec4(uCol * s * f * 0.22 * uA, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
}
// м'яка кругла пляма світла (спрайт)
function glowTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

export async function create() {
  const canvas = document.createElement('canvas');
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(1); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.setClearColor(0x000000, 1);
  const draco = new DRACOLoader().setDecoderPath('assets/draco/');
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const NAMES = ['holotable', 'destroyer', 'venator', 'tieinterceptorhd', 'tiebomberhd', 'tiefighterhd', 'frigate', 'moncal', 'corvette', 'xwinghd', 'awinghd', 'ywinghd'];
  const G = {}; await Promise.all(NAMES.map((n) => loader.loadAsync(DIR + n + '.glb').then((g) => { G[n] = g.scene; })));
  draco.dispose();
  const GT = glowTex(), mats = [];
  const hm = (col, o) => { const m = holoMat(col, o); mats.push(m); return m; };

  // ═══ 1. Передавач на долоні й постать у каптурі ═══
  const S1 = new THREE.Scene(), C1 = new THREE.PerspectiveCamera(32, 16 / 9, .004, 20);
  S1.add(new THREE.AmbientLight(0x223044, .35));
  const key1 = new THREE.PointLight(0x6fb8ff, 0, 1.2, 1.6); key1.position.set(0, .07, .02); S1.add(key1);
  const rim1 = new THREE.DirectionalLight(0x5c86c0, .35); rim1.position.set(-.4, .3, -.6); S1.add(rim1);
  const skin = new THREE.MeshStandardMaterial({ color: 0x0d0f13, roughness: .9, metalness: .05 });
  const hand = new THREE.Group(); S1.add(hand);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), skin); palm.scale.set(.085, .03, .1); palm.position.set(0, -.032, .01); hand.add(palm);
  // пальці загинаються вгору довкола диска; великий палець — збоку
  [[-.062, .03, -.2], [-.03, .055, -.05], [.006, .06, .05], [.04, .052, .16]].forEach(([X, Z, rz], i) => { const L = [.07, .085, .08, .065][i];
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(.0125, L, 6, 12), skin); f.position.set(X, -.012, Z - .055); f.rotation.set(-1.05, 0, rz); hand.add(f); });
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(.014, .06, 6, 12), skin); th.position.set(.075, -.012, .035); th.rotation.set(0, 0, -.95); hand.add(th);
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(.05, .058, .2, 24), skin); wrist.position.set(.02, -.06, .17); wrist.rotation.set(1.25, 0, -.1); hand.add(wrist);
  // диск-проєктор
  const disc = new THREE.Group(); disc.position.set(0, -.002, 0); hand.add(disc);
  disc.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .055, .016, 40), new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: .45, metalness: .7 })));
  const ringM = new THREE.MeshBasicMaterial({ color: 0x5fb6ff }); const ring = new THREE.Mesh(new THREE.TorusGeometry(.04, .0022, 8, 48), ringM); ring.rotation.x = Math.PI / 2; ring.position.y = .0085; disc.add(ring);
  const lensM = new THREE.MeshBasicMaterial({ color: 0x9fd6ff }); const lens = new THREE.Mesh(new THREE.CircleGeometry(.012, 24), lensM); lens.rotation.x = -Math.PI / 2; lens.position.y = .0088; disc.add(lens);
  const lensG = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: 0x7cc4ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); lensG.scale.set(.07, .07, 1); lensG.position.y = .012; disc.add(lensG);
  const beam1M = beamMat(PALE, { n: 18 }); const beam1 = new THREE.Mesh(new THREE.CylinderGeometry(.075, .008, .1, 40, 1, true), beam1M); beam1.position.y = .058; S1.add(beam1);
  // постать у каптурі: мантія (тіло обертання), рукави, каптур із відкритим переднім боком; обличчя немає — під каптуром темрява
  const fig = new THREE.Group(); fig.position.y = .03; S1.add(fig); const figM = hm(PALE, { fill: .025, rim: 1.0, lines: 300, seed: 3 });
  const prof = [[0, 0], [.05, 0], [.052, .008], [.042, .045], [.032, .08], [.029, .096], [.024, .104], [.012, .11], [0, .111]].map(([r, y]) => new THREE.Vector2(r, y));
  fig.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), figM));
  [-1, 1].forEach((sd) => { const sl = new THREE.Mesh(new THREE.CylinderGeometry(.007, .011, .05, 16, 1, true), figM); sl.position.set(sd * .016, .068, .02); sl.rotation.set(.55, 0, sd * .65); fig.add(sl); });
  const hood = new THREE.Mesh(new THREE.SphereGeometry(.03, 32, 20, Math.PI / 2 + .75, Math.PI * 2 - 1.5, 0, 2.6), figM); hood.scale.set(1, 1.22, 1.1); hood.position.set(0, .122, -.006); fig.add(hood);
  const hoodRim = new THREE.Mesh(new THREE.TorusGeometry(.019, .0028, 8, 32, Math.PI * 1.25), figM); hoodRim.position.set(0, .122, .024); hoodRim.scale.set(1.2, 1.5, 1); hoodRim.rotation.set(-.25, 0, -Math.PI * .125 - Math.PI * .5); hoodRim.scale.set(1, 1.35, 1); fig.add(hoodRim);
  const face = new THREE.Mesh(new THREE.SphereGeometry(.019, 24, 16), new THREE.MeshBasicMaterial({ color: 0x000000 })); face.scale.set(1.15, 1.3, .9); face.position.set(0, .122, .008); fig.add(face);
  const figG = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: 0x3d7fd0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .35 })); figG.scale.set(.22, .26, 1); figG.position.set(0, .1, -.03); S1.add(figG);

  // ═══ 2. Голостіл, флоти, міна ═══
  const S2 = new THREE.Scene(), C2 = new THREE.PerspectiveCamera(34, 16 / 9, .02, 60);
  S2.add(new THREE.HemisphereLight(0x4a6a96, 0x05070a, .55));
  const key2 = new THREE.DirectionalLight(0x9db8e0, .55); key2.position.set(2, 3, 2.5); S2.add(key2);
  const tablePL = new THREE.PointLight(0x58a8ff, 3.2, 4.5, 1.4); S2.add(tablePL);
  const boomPL = new THREE.PointLight(0xfff1dc, 0, 6, 1.2); S2.add(boomPL);
  const table = G.holotable; table.traverse((o) => { if (o.isMesh && o.material) { const m = o.material; if (m.emissiveMap || /Glow/i.test(m.name)) m.emissiveIntensity = 1.6; } }); S2.add(table);
  const tb = new THREE.Box3().setFromObject(table), TOP = tb.max.y, LENS = TOP - .1; tablePL.position.set(0, TOP + .25, 0);
  const beam2M = beamMat(BLUE, { n: 30 }); const beam2 = new THREE.Mesh(new THREE.CylinderGeometry(1.05, .07, 1.25, 64, 1, true), beam2M); beam2.position.y = LENS + .625; S2.add(beam2);
  const core2M = beamMat(PALE, { n: 7 }); const core2 = new THREE.Mesh(new THREE.CylinderGeometry(.16, .03, .9, 32, 1, true), core2M); core2.position.y = LENS + .45; S2.add(core2);
  const lens2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: 0x6fbaff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .9 })); lens2.scale.set(.45, .45, 1); lens2.position.y = LENS + .03; S2.add(lens2);
  // кораблі: [модель, масштаб (довжина, м), x, y над столом, z, імперія?]
  const H0 = TOP + .62, FL = [['destroyer', .78, -.5, H0 + .04, -.12, 1], ['venator', .62, -.42, H0 - .2, .32, 1], ['tieinterceptorhd', .085, -.12, H0 + .18, -.3, 1], ['tieinterceptorhd', .085, -.05, H0 + .1, -.18, 1],
    ['tieinterceptorhd', .085, -.16, H0 + .05, -.08, 1], ['tiebomberhd', .1, -.2, H0 - .1, .2, 1], ['tiebomberhd', .1, -.1, H0 - .05, .3, 1],
    ['tiefighterhd', .075, -.06, H0 + .27, .02, 1], ['tiefighterhd', .075, .0, H0 + .22, .1, 1], ['tiefighterhd', .075, -.1, H0 + .32, .12, 1],
    ['moncal', .68, .58, H0 + .06, -.18, 0], ['frigate', .5, .5, H0 - .2, .3, 0], ['corvette', .3, .3, H0 + .3, .22, 0], ['xwinghd', .1, .2, H0 + .14, -.22, 0], ['xwinghd', .1, .14, H0 + .2, -.12, 0], ['xwinghd', .1, .24, H0 + .07, -.06, 0], ['awinghd', .08, .15, H0 - .02, .2, 0],
    ['awinghd', .08, .22, H0 - .08, .28, 0], ['ywinghd', .1, .3, H0 + .22, .12, 0], ['ywinghd', .1, .36, H0 + .12, .26, 0]];
  const ships = FL.map(([n, s, X, Y, Z, imp], i) => { const g = G[n].clone(true), m = hm(imp ? RED : BLUE, { fill: .05, rim: 1.05, lines: 150, seed: i }); g.traverse((o) => { if (o.isMesh) o.material = m; });
    const w = new THREE.Group(); w.add(g); g.scale.setScalar(s); g.rotation.y = imp ? Math.PI / 2 : -Math.PI / 2; S2.add(w); return { w, m, X, Y, Z, s, ph: hash(i * 3.3) * 6.28 }; });
  // морська міна: куля з шипами, індикатор
  const mine = new THREE.Group(); mine.position.set(.02, H0 + .02, .04); S2.add(mine); const mineM = hm(WARM, { fill: .12, rim: 1.2, lines: 260, seed: 9 });
  mine.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.055, 3), mineM));
  const SP = new THREE.ConeGeometry(.007, .03, 10), KN = new THREE.SphereGeometry(.009, 10, 8);
  for (let i = 0; i < 14; i++) { const v = new THREE.Vector3().setFromSphericalCoords(1, Math.acos(1 - 2 * (i + .5) / 14), i * 2.39996); if (v.y > .93) continue;
    const sp = new THREE.Mesh(SP, mineM); sp.position.copy(v.clone().multiplyScalar(.068)); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); mine.add(sp);
    const kn = new THREE.Mesh(KN, mineM); kn.position.copy(v.clone().multiplyScalar(.084)); mine.add(kn); }
  const indM = new THREE.MeshBasicMaterial({ color: 0x330000 }); const ind = new THREE.Mesh(new THREE.SphereGeometry(.011, 12, 10), indM); ind.position.set(0, .057, .012); mine.add(ind);
  const indG = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: 0xff2a1a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })); indG.scale.set(.12, .12, 1); indG.position.set(0, .06, .014); mine.add(indG);
  // вибух: два кільця ударної хвилі, уламки, біле світло
  const waveM = new THREE.MeshBasicMaterial({ map: null, color: 0xffe2c0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const wave = new THREE.Mesh(new THREE.RingGeometry(.92, 1, 96, 1), waveM); wave.rotation.x = -Math.PI / 2; S2.add(wave);
  const wave2M = waveM.clone(); const wave2 = new THREE.Mesh(new THREE.RingGeometry(.8, 1, 96, 1), wave2M); wave2.rotation.set(-Math.PI / 2 + .5, .3, 0); S2.add(wave2);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: 0xfff4e6, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })); S2.add(flash);
  const debM = hm(WARM, { fill: .4, rim: 1.4, lines: 300, seed: 21 }), DEB = [], DG = new THREE.TetrahedronGeometry(.012, 0);
  for (let i = 0; i < 90; i++) { const m = new THREE.Mesh(DG, debM), v = new THREE.Vector3().setFromSphericalCoords(1, Math.acos(1 - 2 * hash(i * 1.7)), hash(i * 2.9) * 6.283); m.visible = false; S2.add(m);
    DEB.push({ m, v, sp: .5 + 1.1 * hash(i * 4.1), s: .5 + hash(i * 5.3) * 1.3, r: [hash(i * 6.1) * 9, hash(i * 7.7) * 9] }); }

  const sz = (w, h) => { if (canvas.width !== w || canvas.height !== h) R.setSize(w, h, false); C1.aspect = C2.aspect = w / h; C1.updateProjectionMatrix(); C2.updateProjectionMatrix(); };

  // ── сцена 1 (u — секунди від початку, 0…7): вмикання голограми з перешкодами, голос, наїзд і пірнання в голограму ──
  function holo(u, w, h) {
    sz(w, h); const on = ez((u - .9) / .7) * (u > 1.05 && u < 1.12 ? .55 : 1) * (u > 1.3 && u < 1.36 ? .7 : 1), dive = ez((u - 5.7) / 1.3);
    const gl = (u > 1 && u < 1.16) || (u > 2.55 && u < 2.66) || (u > 4.12 && u < 4.2) || (u > 5.05 && u < 5.12) ? 1 : 0;
    mats.forEach((m) => { m.uniforms.uT.value = u; }); figM.uniforms.uA.value = on; figM.uniforms.uGl.value = gl; beam1M.uniforms.uT.value = u; beam1M.uniforms.uA.value = on * .9;
    figG.material.opacity = .22 * on * (1 - dive); key1.intensity = .15 + .35 * on; figM.uniforms.uA.value = on * .75 * (1 - .6 * dive); ringM.color.setRGB(.25 + .5 * on, .5 + .3 * on, .95); lensG.material.opacity = .4 + .5 * on;
    fig.rotation.y = Math.sin(u * .5) * .12; hand.position.y = Math.sin(u * 1.1) * .002; hand.rotation.z = Math.sin(u * .7) * .02;
    const P0 = new THREE.Vector3(.03, .17, .74), P1 = new THREE.Vector3(0, .15, .56), P2 = new THREE.Vector3(0, .1, .012), k = ez(u / 5.6);
    C1.position.copy(P0).lerp(P1, k).lerp(P2, dive); C1.lookAt(0, lerp(.085, .1, k), 0); C1.fov = lerp(32, 40, dive); C1.updateProjectionMatrix();
    R.render(S1, C1); return canvas;
  }
  // ── сцена 2 (u — секунди від початку, 0…10): ticks — секунди цокання (від початку сцени), boom — секунда вибуху ──
  function fleet(u, w, h, ticks, boom) {
    sz(w, h); mats.forEach((m) => { m.uniforms.uT.value = u; }); beam2M.uniforms.uT.value = core2M.uniforms.uT.value = u;
    const e = u - boom, die = ez((e - .15) / 1.3);
    // камера: виринає з голограми (ближче) → повільний облет; на тремтінні — легкий наїзд до міни; на вибуху — короткий згасаючий трус
    const az = lerp(-.42, .2, u / 10), r = lerp(1.55, 2.75, eo(u / 2.4)) - .35 * ez((u - 3) / 3) * (1 - ez(e / 1.5)), hh = lerp(1.05, 1.95, eo(u / 2.4)) + TOP - 1.05;
    const sh = e > 0 ? .02 * Math.exp(-e / .35) : 0; C2.position.set(Math.sin(az) * r + sh * Math.sin(e * 53), hh + sh * Math.cos(e * 41), Math.cos(az) * r); C2.lookAt(0, H0 - .05, 0);
    // флоти: повільний дрейф; ударна хвиля відкидає кораблі й гасить голограму
    ships.forEach((S, i) => { const dir = new THREE.Vector3(S.X, 0, S.Z).normalize(), push = e > 0 ? eo(e / 1.6) * (.25 + .2 * hash(i)) : 0;
      S.w.position.set(S.X + Math.sin(u * .4 + S.ph) * .015 + dir.x * push, S.Y + Math.sin(u * .55 + S.ph) * .01 + push * .1, S.Z + Math.cos(u * .35 + S.ph) * .015 + dir.z * push);
      S.w.rotation.set(push * (hash(i * 2) - .5) * 1.5, Math.sin(u * .2 + S.ph) * .05 + push * (hash(i * 3) - .5) * 2, push * (hash(i * 5) - .5) * 1.2);
      S.m.uniforms.uA.value = (1 - die) * (1 - .4 * ez((u - .2) / .4) * (1 - ez((u - .6) / .4))); S.m.uniforms.uGl.value = e > 0 && e < 1.2 ? 1 : 0; });
    // міна: тремтіння наростає, індикатор — за цоканням
    const tr = ez((u - ticks[0] + .4) / (boom - ticks[0])) * (e < 0 ? 1 : 0), last = ticks.filter((t) => t <= u).pop(), lit = last != null && u - last < .07 && e < 0 ? 1 : 0;
    mine.position.set(.02 + tr * .006 * Math.sin(u * 97), H0 + .02 + tr * .005 * Math.sin(u * 83 + 1), .04 + tr * .006 * Math.sin(u * 71 + 2)); mine.rotation.y = u * .3;
    mine.visible = e < 0; indM.color.setRGB(.2 + .8 * lit, 0, 0); indG.material.opacity = lit * .95 + .12 * tr;
    mineM.uniforms.uA.value = 1;
    // вибух: світло наростає за 0,25 с (не спалахом), кільця хвилі, уламки
    const fl = e > 0 ? ez(e / .25) * Math.exp(-Math.max(0, e - .25) / .7) : 0; flash.position.copy(mine.position); flash.scale.setScalar(.3 + 1.6 * eo(e / .8)); flash.material.opacity = .55 * fl;
    boomPL.position.copy(mine.position); boomPL.intensity = 9 * fl;
    [[wave, waveM, 2.6, 0], [wave2, wave2M, 2.0, .08]].forEach(([m, mt, rr, d]) => { const k = e - d; m.position.copy(mine.position); m.visible = k > 0 && k < 2; const s = .05 + rr * eo(k / 1.4); m.scale.set(s, s, s); mt.opacity = k > 0 ? .32 * ez(k / .12) * (1 - ez(k / 1.4)) : 0; });
    DEB.forEach((D, i) => { const k = e - .02 * hash(i * 9); D.m.visible = k > 0 && k < 3; if (!D.m.visible) return; const d = D.sp * (k - .18 * k * k) * .9;
      D.m.position.copy(mine.position).addScaledVector(D.v, Math.max(0, d)); D.m.rotation.set(D.r[0] + k * 6, D.r[1] + k * 4, 0); D.m.scale.setScalar(D.s); });
    debM.uniforms.uA.value = e > 0 ? 1 - ez((e - .5) / 1.5) : 0;
    // промінь і світло стола гаснуть разом із голограмою
    const ba = 1 - die; beam2M.uniforms.uA.value = .8 * ba; core2M.uniforms.uA.value = .9 * ba; lens2.material.opacity = .25 + .65 * ba; tablePL.intensity = 1.2 + 2 * ba;
    R.render(S2, C2); return canvas;
  }
  return { canvas, holo, fleet };
}
