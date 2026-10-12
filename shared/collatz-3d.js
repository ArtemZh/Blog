/* Стаття 29, розділ 07: «корал» Коллатца на three.js.
   Шляхи всіх чисел до N малюються від одиниці назовні у скороченому записі
   (n/2 або (3n+1)/2). Кожен відрізок повертає відносно попереднього: після парного
   числа — на кут E, після непарного — на кут O у протилежний бік і скручується
   навколо власної осі на кут T. Позиція числа залежить лише від його шляху до 1,
   тож спільні відрізки шляхів збігаються самі. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const box = document.getElementById('coral');
const $ = (id) => document.getElementById(id);
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const P = { N: 2500, E: 8.5, O: 16, T: 22, spin: true };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const step = (n) => (n % 2 ? (3 * n + 1) / 2 : n / 2);

let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { renderer = null; }

if (!renderer) {
  const d = document.createElement('div'); d.className = 'fail';
  d.textContent = 'Тривимірна сцена не запустилась: браузер не дав доступу до WebGL. Решта статті працює без неї.';
  box.appendChild(d);
  window.CORAL = { ok: false };
} else {
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  box.insertBefore(renderer.domElement, box.firstChild);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 5000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .08; controls.autoRotateSpeed = .7;
  const group = new THREE.Group(); scene.add(group);
  let lines = null, hot = null, pos = null, info = { nodes: 0, depth: 0 };

  function build() {
    // 1. батько кожного числа, що трапляється на шляхах 2..N
    const parent = new Map();
    for (let s = 2; s <= P.N; s++) { let n = s; while (n !== 1 && !parent.has(n)) { const p = step(n); parent.set(n, p); n = p; } }
    // 2. діти й обхід у ширину від одиниці
    const kids = new Map();
    parent.forEach((p, n) => { if (!kids.has(p)) kids.set(p, []); kids.get(p).push(n); });
    const eRad = THREE.MathUtils.degToRad(P.E), oRad = THREE.MathUtils.degToRad(P.O), tRad = THREE.MathUtils.degToRad(P.T);
    const qE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), eRad);
    const qO = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -oRad)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), tRad));
    pos = new Map([[1, new THREE.Vector3()]]);
    const rot = new Map([[1, new THREE.Quaternion()]]), depth = new Map([[1, 0]]);
    const queue = [1], up = new THREE.Vector3(0, 1, 0), segs = [];
    let maxD = 0;
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i], ks = kids.get(p); if (!ks) continue;
      for (const n of ks) {
        const q = rot.get(p).clone().multiply(n % 2 ? qO : qE), d = depth.get(p) + 1;
        const v = pos.get(p).clone().add(up.clone().applyQuaternion(q));
        rot.set(n, q); pos.set(n, v); depth.set(n, d); if (d > maxD) maxD = d;
        segs.push([p, n, d]); queue.push(n);
      }
    }
    // 3. геометрія: один буфер відрізків, колір — глибина (ближче до 1 темніше)
    const near = new THREE.Color(css('--ink') || '#15181D'), far = new THREE.Color(css('--ink-3') || '#838A97');
    const a = new Float32Array(segs.length * 6), c = new Float32Array(segs.length * 6), col = new THREE.Color();
    segs.forEach(([p, n, d], i) => {
      const A = pos.get(p), B = pos.get(n); a.set([A.x, A.y, A.z, B.x, B.y, B.z], i * 6);
      for (let k = 0; k < 2; k++) { col.copy(near).lerp(far, Math.min(1, (d - 1 + k) / Math.max(1, maxD) * 1.15)); c.set([col.r, col.g, col.b], i * 6 + k * 3); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    if (lines) { group.remove(lines); lines.geometry.dispose(); lines.material.dispose(); }
    lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .9 }));
    group.add(lines);
    info = { nodes: pos.size, depth: maxD, finite: a.every(Number.isFinite) };
    // 4. камера: уся фігура в кадрі
    g.computeBoundingSphere();
    const s = g.boundingSphere, dist = s.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * .74;
    controls.target.copy(s.center);
    camera.position.copy(s.center).add(new THREE.Vector3(0.25, 0.12, 1).normalize().multiplyScalar(dist));
    camera.near = dist / 200; camera.far = dist * 6; camera.updateProjectionMatrix();
    scene.fog = new THREE.Fog(css('--paper') || '#FAFAFB', dist * .9, dist + s.radius * 2.6);
    $('cInfo').textContent = `${info.nodes.toLocaleString('uk')} чисел · найдовший шлях ${maxD}`;
    highlight();
  }

  // Шлях обраного числа: якщо він є у фігурі — товста сигнальна трубка.
  function highlight() {
    if (hot) { group.remove(hot); hot.geometry.dispose(); hot.material.dispose(); hot = null; }
    const big = window.COLLATZ ? window.COLLATZ.n : 27n;
    if (big > 9007199254740991n) return;
    let n = Number(big); const pts = [];
    for (let i = 0; i < 2000; i++) { const v = pos.get(n); if (!v) return; pts.push(v); if (n === 1) break; n = step(n); }
    if (pts.length < 2) return;
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .1);
    const r = Math.max(.08, lines.geometry.boundingSphere.radius / 320);
    hot = new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length * 4, r, 6, false),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(css('--act') || '#EA5212'), fog: false }));
    group.add(hot);
  }

  function resize() {
    const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(box);

  // Малюємо лише коли сцену видно — щоб сторінка не гріла ноутбук.
  let visible = false, raf = 0;
  function loop() { raf = 0; if (!visible) return; controls.autoRotate = P.spin && !reduce; controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { threshold: .02 }).observe(box);

  const bind = (id, key, digits) => { const i = $(id), o = $(id + 'o'); const show = () => (o.textContent = Number(i.value).toFixed(digits).replace('.', ','));
    i.value = P[key]; show(); i.addEventListener('input', () => { P[key] = +i.value; show(); build(); }); return () => { i.value = P[key]; show(); }; };
  const sync = [bind('cN', 'N', 0), bind('cE', 'E', 1), bind('cO', 'O', 1), bind('cT', 'T', 0)];
  const preset = (o) => { Object.assign(P, o); sync.forEach((f) => f()); build(); };
  $('cFlat').addEventListener('click', () => preset({ E: 8.5, O: 16, T: 0 }));
  $('cVol').addEventListener('click', () => preset({ E: 8.5, O: 16, T: 22 }));
  $('cSpin').addEventListener('click', (e) => { P.spin = !P.spin; e.currentTarget.classList.toggle('on', P.spin); });
  if (reduce) { P.spin = false; $('cSpin').classList.remove('on'); }
  $('cFull').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else if (box.requestFullscreen) box.requestFullscreen(); });
  document.addEventListener('collatz:n', highlight);

  resize(); build();
  window.CORAL = { ok: true, params: P, get info() { return info; }, get highlighted() { return !!hot; }, rebuild: build };
}
