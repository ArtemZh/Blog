/* Стаття 33, розділ 02: три тіла на three.js. Фізика — window.TB (shared/threebody.js).
   Два режими:
   — «Креслення»: світле тло, сітка, тіла трьома сталими кольорами — лише щоб їх розрізнити;
   — «Космос»: темне тло, зоряне небо, тіла як зорі зі світінням (колір за масою, як у справжніх зір:
     важча — біло-блакитна, легша — червона), сліди світяться й згасають, bloom, камера під кутом.
   Помаранчевий сигнальний колір — тільки для похибки енергії, коли їй уже не можна вірити. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeSky } from './space-bg.js?v=20261018210821';

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
  const STAR_HOT = new THREE.Color('#cfe0ff'), STAR_SUN = new THREE.Color('#ffd9a0'), STAR_RED = new THREE.Color('#ff7a45');
  const starColor = (rank) => [STAR_HOT, STAR_SUN, STAR_RED][rank];

  const grid = new THREE.GridHelper(8, 16, new THREE.Color(css('--rule-2') || '#C6CAD3'), new THREE.Color(css('--rule') || '#E3E5EA'));
  grid.rotation.x = Math.PI / 2; scene.add(grid);

  // небо з туманностями й зорями — спільне для обох 3D-сцен статті
  const sky = makeSky(THREE, { spikes: 12, spikeSize: .45 }); scene.add(sky);   // у симуляції яскраві зорі менші — щоб не плутати з тілами

  // м'яке сяйво навколо зорі — спрайт із радіальним градієнтом
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, 'rgba(255,255,255,.55)');
    g.addColorStop(.45, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c); })();

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .8, .45, .45);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  let meshes = [], glows = [], trails = [], hist = [], R0 = 2;

  function paint() {      // застосувати режим до всіх об'єктів
    const sp = S.space;
    scene.background = sp ? new THREE.Color('#04050a') : new THREE.Color(css('--paper') || '#FAFAFB');
    grid.visible = !sp; sky.visible = sp;
    const ms = S.bodies.map((b) => b.m), order = ms.map((m, i) => i).sort((a, b) => ms[b] - ms[a]);
    S.bodies.forEach((b, i) => {
      const rank = Math.min(2, order.indexOf(i)), col = sp ? starColor(rank) : DRAW[i];
      meshes[i].material.color.copy(col); if (sp) meshes[i].material.color.multiplyScalar(1.6);
      glows[i].visible = sp; glows[i].material.color.copy(col);
      trails[i].material.blending = sp ? THREE.AdditiveBlending : THREE.NormalBlending; trails[i].userData.col = col.clone();
      trails[i].material.needsUpdate = true;
    });
    box.classList.toggle('is-space', sp);
    document.querySelectorAll('#simMode button').forEach((x) => x.classList.toggle('on', (x.dataset.m === 'space') === sp));
  }
  function load(preset) {
    S.preset = preset; S.bodies = TB.PRESETS[preset](S.seed); S.t = 0; S.steps = 0; S.E0 = TB.energy(S.bodies);
    [...meshes, ...glows].forEach((m) => scene.remove(m)); trails.forEach((l) => { scene.remove(l); l.geometry.dispose(); });
    const mmax = Math.max(...S.bodies.map((x) => x.m));
    meshes = S.bodies.map((b) => { const r = .045 * Math.cbrt(b.m / mmax) + .03;
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.userData.r = r; scene.add(m); return m; });
    glows = S.bodies.map((b, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.scale.setScalar(meshes[i].userData.r * 5); scene.add(s); return s; });
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
      meshes[i].position.set(b.p[0], b.p[1], b.p[2]); glows[i].position.copy(meshes[i].position);
      const g = trails[i].geometry, P = g.attributes.position, C = g.attributes.color, h = hist[i], n = Math.min(h.length / 3, MAXTR);
      P.array.set(h.slice(h.length - n * 3)); const col = trails[i].userData.col;
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
    if (visible) { tick(dt); controls.autoRotate = S.space && S.dim3 && !reduce; controls.update();
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
  window.TB3 = { ok: true, S, load, tick, paint };
}
