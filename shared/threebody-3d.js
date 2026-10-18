/* Стаття 33, розділ 02: три тіла на three.js. Фізика — window.TB (shared/threebody.js).
   Колір тіла — лише щоб розрізнити тіла (три сталі кольори); сигнальний помаранчевий
   — тільки для похибки енергії, коли їй уже не можна вірити. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const TB = window.TB;
const $ = (id) => document.getElementById(id);
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const box = $('sim');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = { preset: 'fig8', bodies: null, t: 0, E0: 0, run: !reduce, speed: 1, trail: 700, dim3: false, seed: 7, steps: 0 };

let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { renderer = null; }
if (!renderer) {
  box.insertAdjacentHTML('beforeend', '<div class="fail">Тривимірна сцена не запустилась: браузер не дав доступу до WebGL. Решта статті працює без неї.</div>');
  window.TB3 = { ok: false };
} else {
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  box.insertBefore(renderer.domElement, box.firstChild);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .08;
  const COLORS = [css('--ink') || '#15181D', css('--c-blue') || '#4678DC', css('--c-teal') || '#1E968C'];
  const grid = new THREE.GridHelper(8, 16, new THREE.Color(css('--rule-2') || '#C6CAD3'), new THREE.Color(css('--rule') || '#E3E5EA'));
  grid.rotation.x = Math.PI / 2; scene.add(grid);
  let meshes = [], trails = [], hist = [];

  function load(preset) {
    S.preset = preset; S.bodies = TB.PRESETS[preset](S.seed); S.t = 0; S.steps = 0; S.E0 = TB.energy(S.bodies);
    meshes.forEach((m) => scene.remove(m)); trails.forEach((l) => { scene.remove(l); l.geometry.dispose(); });
    meshes = S.bodies.map((b, i) => { const r = .045 * Math.cbrt(b.m / Math.max(...S.bodies.map((x) => x.m))) + .03;
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshBasicMaterial({ color: COLORS[i] })); scene.add(m); return m; });
    hist = S.bodies.map(() => []);
    trails = S.bodies.map((_, i) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 4000), 3));
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: COLORS[i], transparent: true, opacity: .7 })); scene.add(l); return l; });
    const R = Math.max(1.4, ...S.bodies.map((b) => Math.hypot(b.p[0], b.p[1], b.p[2]))) * 1.5;
    frame(R, true);
    document.querySelectorAll('#simPre button').forEach((b) => b.classList.toggle('on', b.dataset.p === preset));
    document.querySelectorAll('.simnote').forEach((n) => n.hidden = n.dataset.p !== preset);
  }
  // камера: 2D — згори, 3D — під кутом; масштаб тримає всю систему в кадрі
  function frame(R, hard) {
    const dir = S.dim3 ? new THREE.Vector3(.55, -.75, .6).normalize() : new THREE.Vector3(0, 0, 1);
    const dist = R / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (hard) { camera.position.copy(dir.multiplyScalar(dist)); controls.target.set(0, 0, 0); }
    controls.enableRotate = S.dim3; camera.up.set(0, S.dim3 ? 0 : 1, S.dim3 ? 1 : 0); camera.lookAt(0, 0, 0);
  }
  function resize() { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(box);

  function tick(dt) {
    if (S.run) {
      const r = TB.advance(S.bodies, dt * S.speed, .015, 3000); S.t += r.t; S.steps += r.n;
      S.bodies.forEach((b, i) => { const h = hist[i]; h.push(b.p[0], b.p[1], b.p[2]); while (h.length > S.trail * 3) h.splice(0, 3); });
    }
    S.bodies.forEach((b, i) => { meshes[i].position.set(b.p[0], b.p[1], b.p[2]);
      const a = trails[i].geometry.attributes.position, h = hist[i]; a.array.set(h.slice(-a.array.length)); a.needsUpdate = true; trails[i].geometry.setDrawRange(0, Math.min(h.length, a.array.length) / 3); });
    const err = Math.abs((TB.energy(S.bodies) - S.E0) / S.E0);
    const e = $('simErr'); e.textContent = err < 1e-12 ? '< 10⁻¹²' : err.toExponential(1).replace('e', '·10^'); e.classList.toggle('bad', err > 1e-3);
    $('simT').textContent = S.t.toFixed(1); $('simN').textContent = S.steps.toLocaleString('uk');
  }
  let last = performance.now(), visible = false;
  function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (visible) { tick(dt); controls.update(); renderer.render(scene, camera); } requestAnimationFrame(loop); }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: .02 }).observe(box);

  document.querySelectorAll('#simPre button').forEach((b) => b.addEventListener('click', () => { if (b.dataset.p === 'random') S.seed = 1 + Math.floor(Math.random() * 9999); load(b.dataset.p); }));
  $('simPlay').addEventListener('click', () => { S.run = !S.run; $('simPlay').textContent = S.run ? '❚❚ пауза' : '▶ рух'; });
  $('simRe').addEventListener('click', () => load(S.preset));
  $('simDim').addEventListener('click', () => { S.dim3 = !S.dim3; $('simDim').textContent = S.dim3 ? 'вид згори (2D)' : 'під кутом (3D)'; frame(Math.max(1.4, camera.position.length() * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))), true); });
  const sp = $('simSpeed'); sp.addEventListener('input', () => { S.speed = +sp.value; $('simSpeedO').textContent = '×' + S.speed; });
  const tr = $('simTrail'); tr.addEventListener('input', () => { S.trail = +tr.value; });
  $('simPlay').textContent = S.run ? '❚❚ пауза' : '▶ рух';
  resize(); load('fig8'); requestAnimationFrame(loop);
  window.TB3 = { ok: true, S, load, tick };
}
