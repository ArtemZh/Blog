/* Стаття 33, розділ 02: три тіла на three.js. Фізика — window.TB (shared/threebody.js).
   Два режими:
   — «Креслення»: світле тло, сітка, тіла трьома сталими кольорами — лише щоб їх розрізнити;
   — «Космос»: темне тло, зоряне небо, тіла як справжні зорі з плямами й короною (колір за масою, як у справжніх зір:
     важча — біло-блакитна, легша — червона), сліди світяться й згасають, bloom, камера під кутом.
   Помаранчевий сигнальний колір — тільки для похибки енергії, коли їй уже не можна вірити. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeSky } from './space-bg.js?v=20261018213240';
import { makeStar, STAR_TINTS } from './sun-fx.js?v=20261018213240';

const TB = window.TB;
const $ = (id) => document.getElementById(id);
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const box = $('sim');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = { preset: 'fig8', bodies: null, t: 0, E0: 0, run: !reduce, speed: 1, trail: 700, dim3: true, space: true, seed: 7, steps: 0 };
const MAXTR = 1400;

let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { renderer = null; }
if (!renderer) {
  box.insertAdjacentHTML('beforeend', '<div class="fail">Тривимірна сцена не запустилась: браузер не дав доступу до WebGL. Решта статті працює без неї.</div>');
  window.TB3 = { ok: false };
} else {
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  box.insertBefore(renderer.domElement, box.firstChild);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, 0.01, 2000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .08; controls.autoRotateSpeed = .35;

  // кольори: креслення — розрізнення тіл; космос — температура зорі
  const DRAW = [css('--ink') || '#15181D', css('--c-blue') || '#4678DC', css('--c-teal') || '#1E968C'].map((c) => new THREE.Color(c));
  // у космосі тіла — справжні зорі: поверхня з плямами й корона; колір за масою, як у зір головної послідовності
  const TINT = [STAR_TINTS.hot, STAR_TINTS.sun, STAR_TINTS.red];
  const starColor = (rank) => new THREE.Color(...TINT[rank].c2);
  // тип зорі — за масою: однакові маси дають однакові зорі; різні — від біло-блакитної (найважча) до червоної (найлегша)
  function tintIdx(ms) { const d = [...new Set(ms)].sort((a, b) => b - a);
    return ms.map((m) => d.length === 1 ? 1 : m === d[0] ? 0 : m === d[d.length - 1] ? 2 : 1); }
  // радіус зорі головної послідовності росте приблизно як m^0,8; тут м'якше, щоб легкі не зникали
  const starR = (m, mmax) => .1 * Math.pow(m / mmax, .6) + .03;
  const MOON_K = 3;       // «Сонце — Земля — Місяць»: відстань Місяця від Землі на сцені збільшено втричі, інакше він ховається в Землі
  // «Зоря, планета, супутник» — це Сонце, Земля й Місяць: показуємо саме їх, з текстурами
  const SEM_TRAIL = ['#ffd9a0', '#6fa8ff', '#b8bcc6'].map((c) => new THREE.Color(c));
  const texL = new THREE.TextureLoader(), texCache = {};
  const tex = (n) => texCache[n] || (texCache[n] = texL.load('assets/threebody/tex/' + n + '.jpg', (t) => { t.colorSpace = THREE.SRGBColorSpace; }));
  function planet(kind, r) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshPhongMaterial(kind === 'earth'
      ? { map: tex('earth_daymap'), shininess: 12, specular: 0x223344 } : { map: tex('moon'), shininess: 2, specular: 0x000000 }));
    m.rotation.x = Math.PI / 2; g.add(m);           // полюси — поперек площини орбіт
    if (kind === 'earth') { const a = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0x6fa8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .3 }));
      a.scale.setScalar(r * 2.5); g.add(a); }
    g.userData.update = (t) => { m.rotation.y = t * (kind === 'earth' ? .5 : .05); };
    g.userData.dispose = () => g.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    return g;
  }
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const gr = x.createRadialGradient(32, 32, 10, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c); })();
  const isSEM = () => S.preset === 'hier';

  const grid = new THREE.GridHelper(8, 16, new THREE.Color(css('--rule-2') || '#C6CAD3'), new THREE.Color(css('--rule') || '#E3E5EA'));
  grid.rotation.x = Math.PI / 2; scene.add(grid);
  scene.add(new THREE.AmbientLight(0xffffff, .16));      // нічний бік планет — ледь видно

  // небо з туманностями й зорями — спільне для обох 3D-сцен статті
  const sky = makeSky(THREE, { spikes: 12, spikeSize: .45, core: 0, amount: .8 }); scene.add(sky);   // у симуляції яскраві зорі менші й без засвічених ядер туманності — щоб не відволікали від тіл


  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .4, .8);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  let meshes = [], stars = [], trails = [], hist = [], R0 = 2;

  function paint() {      // застосувати режим до всіх об'єктів
    const sp = S.space;
    scene.background = sp ? new THREE.Color('#04050a') : new THREE.Color(css('--paper') || '#FAFAFB');
    grid.visible = !sp; sky.visible = sp;
    const ms = S.bodies.map((b) => b.m), order = ms.map((m, i) => i).sort((a, b) => ms[b] - ms[a]), ti = tintIdx(ms);
    S.bodies.forEach((b, i) => {
      const rank = Math.min(2, order.indexOf(i)), col = sp ? (isSEM() ? SEM_TRAIL[rank] : starColor(ti[i])) : DRAW[i];
      meshes[i].material.color.copy(col); meshes[i].visible = !sp;
      stars[i].visible = sp;
      trails[i].material.blending = sp ? THREE.AdditiveBlending : THREE.NormalBlending; trails[i].userData.col = col.clone();
      trails[i].material.needsUpdate = true;
    });
    box.classList.toggle('is-space', sp);
    document.querySelectorAll('#simMode button').forEach((x) => x.classList.toggle('on', (x.dataset.m === 'space') === sp));
  }
  function load(preset) {
    S.preset = preset; S.bodies = TB.PRESETS[preset](S.seed); S.t = 0; S.steps = 0; S.E0 = TB.energy(S.bodies);
    meshes.forEach((m) => scene.remove(m)); stars.forEach((s) => { scene.remove(s); s.userData.dispose(); }); trails.forEach((l) => { scene.remove(l); l.geometry.dispose(); });
    const mmax = Math.max(...S.bodies.map((x) => x.m));
    meshes = S.bodies.map((b) => { const r = .045 * Math.cbrt(b.m / mmax) + .03;
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.userData.r = r; scene.add(m); return m; });
    // зорі більші за кульки креслення, щоб було видно поверхню; колір — за місцем у ряду мас
    const ms = S.bodies.map((b) => b.m), order = ms.map((m, i) => i).sort((a, b) => ms[b] - ms[a]), ti = tintIdx(ms);
    S.moonOf = isSEM() ? [order[2], order[1]] : null;        // [Місяць, Земля] — для збільшеної відстані
    stars = S.bodies.map((b, i) => { const rank = Math.min(2, order.indexOf(i));
      let s;
      if (isSEM()) {        // розміри умовні: Місяць мусить поміститися на своїй орбіті (0,06 від Землі)
        if (rank === 0) { s = makeStar(THREE, .1, STAR_TINTS.sun, 2); const l = new THREE.PointLight(0xfff1dc, 3, 0, 0); s.add(l); }
        else s = planet(rank === 1 ? 'earth' : 'moon', rank === 1 ? .07 : .024);
      } else s = makeStar(THREE, starR(b.m, mmax), TINT[ti[i]], i + 1);
      scene.add(s); return s; });
    hist = S.bodies.map(() => []);
    trails = S.bodies.map(() => { const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * MAXTR), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(3 * MAXTR), 3));
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .9, depthWrite: false })); scene.add(l); return l; });
    R0 = Math.max(1.4, ...S.bodies.map((b) => Math.hypot(b.p[0], b.p[1], b.p[2]))) * 1.5;
    frame(true); paint();
    document.querySelectorAll('#simPre button').forEach((b) => b.classList.toggle('on', b.dataset.p === preset));
    document.querySelectorAll('#sim-sec .simnote').forEach((n) => n.hidden = n.dataset.p !== preset);
  }
  // камера: 2D — згори, 3D — під кутом; масштаб тримає всю систему в кадрі
  function frame(hard) {
    const dir = S.dim3 ? new THREE.Vector3(.5, -.8, .55).normalize() : new THREE.Vector3(0, 0, 1);
    const dist = R0 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (hard) { camera.position.copy(dir.multiplyScalar(dist)); controls.target.set(0, 0, 0); }
    controls.enableRotate = S.dim3; camera.up.set(0, S.dim3 ? 0 : 1, S.dim3 ? 1 : 0); camera.lookAt(0, 0, 0);
    $('simDim').textContent = S.dim3 ? 'вид згори (2D)' : 'під кутом (3D)';
  }
  function resize() { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(box);

  function tick(dt) {
    if (S.run) {
      const r = TB.advance(S.bodies, dt * S.speed, .015, 3000); S.t += r.t; S.steps += r.n;
      S.bodies.forEach((b, i) => { const h = hist[i]; h.push(b.p[0], b.p[1], b.p[2]); if (h.length > S.trail * 3) h.splice(0, h.length - S.trail * 3); });
    }
    S.bodies.forEach((b, i) => {
      const mo = S.moonOf && S.moonOf[0] === i ? S.moonOf[1] : -1;      // Місяць: від Землі відкладаємо збільшену відстань
      const at = (src, k) => mo < 0 ? src[k] : hist[mo][k] + (src[k] - hist[mo][k]) * MOON_K;
      if (mo < 0) meshes[i].position.set(b.p[0], b.p[1], b.p[2]);
      else { const e = S.bodies[mo].p; meshes[i].position.set(e[0] + (b.p[0] - e[0]) * MOON_K, e[1] + (b.p[1] - e[1]) * MOON_K, e[2] + (b.p[2] - e[2]) * MOON_K); }
      stars[i].position.copy(meshes[i].position);
      const g = trails[i].geometry, P = g.attributes.position, C = g.attributes.color, h = hist[i], n = Math.min(h.length / 3, MAXTR);
      if (mo < 0) P.array.set(h.slice(h.length - n * 3)); else for (let k = h.length - n * 3, j = 0; k < h.length; k++, j++) P.array[j] = at(h, k); const col = trails[i].userData.col;
      // слід згасає до хвоста: у космосі — до чорного (адитивне змішування), у кресленні — до тла
      const bg = S.space ? null : scene.background;
      for (let k = 0; k < n; k++) { const f = S.space ? Math.pow(k / n, 1.6) : .25 + .75 * k / n;
        if (bg) C.array.set([bg.r + (col.r - bg.r) * f, bg.g + (col.g - bg.g) * f, bg.b + (col.b - bg.b) * f], k * 3);
        else C.array.set([col.r * f, col.g * f, col.b * f], k * 3); }
      P.needsUpdate = true; C.needsUpdate = true; g.setDrawRange(0, n);
    });
    const err = Math.abs((TB.energy(S.bodies) - S.E0) / S.E0);
    const e = $('simErr'); e.textContent = err < 1e-12 ? '< 10⁻¹²' : err.toExponential(1).replace('e', '·10^'); e.classList.toggle('bad', err > 1e-3);
    $('simT').textContent = S.t.toFixed(1); $('simN').textContent = S.steps.toLocaleString('uk');
  }
  let last = performance.now(), visible = false;
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (visible) { tick(dt); if (S.space) { const tt = now / 1000; stars.forEach((s) => s.userData.update(reduce ? 0 : tt, camera)); } controls.autoRotate = S.space && S.dim3 && !reduce; controls.update();
      if (S.space) composer.render(); else renderer.render(scene, camera); }
    requestAnimationFrame(loop);
  }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: .02 }).observe(box);

  document.querySelectorAll('#simPre button').forEach((b) => b.addEventListener('click', () => { if (b.dataset.p === 'random') S.seed = 1 + Math.floor(Math.random() * 9999); load(b.dataset.p); }));
  document.querySelectorAll('#simMode button').forEach((b) => b.addEventListener('click', () => { S.space = b.dataset.m === 'space';
    if (S.space && !S.dim3) { S.dim3 = true; frame(true); } paint(); }));
  $('simPlay').addEventListener('click', () => { S.run = !S.run; $('simPlay').textContent = S.run ? '❚❚ пауза' : '▶ рух'; });
  $('simRe').addEventListener('click', () => load(S.preset));
  $('simDim').addEventListener('click', () => { S.dim3 = !S.dim3; frame(true); });
  const sp = $('simSpeed'); sp.addEventListener('input', () => { S.speed = +sp.value; $('simSpeedO').textContent = '×' + S.speed; });
  const tr = $('simTrail'); tr.addEventListener('input', () => { S.trail = +tr.value; });
  $('simPlay').textContent = S.run ? '❚❚ пауза' : '▶ рух';
  resize(); load('fig8'); requestAnimationFrame(loop);
  window.TB3 = { ok: true, S, load, tick, paint, camera, controls, stars: () => stars };
}
