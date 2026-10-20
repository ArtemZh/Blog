/* Стаття 35, розділ 07: «вежа» капітальних витрат на ШІ. Одна стійка серверів = $2 млрд капекса чотирьох найбільших хмарних компаній
   (Microsoft, Alphabet, Amazon, Meta). Стійки ростуть поверхами 6 × 6; перемикач років — вежа добудовується або розбирається.
   Тягніть — обертання, колесо — ближче/далі. Числа — округлені, за звітами компаній (2026 — середина прогнозу $650–730 млрд). */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const host = document.getElementById('rcAi3d');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Y = [[2023, 150, 'за звітами компаній'], [2024, 230, '+53 % до 2023'], [2025, 410, '+78 % до 2024'], [2026, 690, 'прогноз $650–730 млрд']];
  const PER = 2, SIDE = 6, FLOOR = SIDE * SIDE, MAX = Math.ceil(730 / PER);
  const hudV = host.querySelector('[data-v]'), hudN = host.querySelector('[data-n]'), yrs = host.querySelector('.rc-ai__yrs');
  yrs.innerHTML = Y.map(([y], i) => `<button type="button" data-i="${i}">${y}</button>`).join('');

  const R = new THREE.WebGLRenderer({ antialias: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; host.prepend(R.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070a12); scene.fog = new THREE.Fog(0x070a12, 30, 80);
  const cam = new THREE.PerspectiveCamera(36, 1, .1, 200);
  scene.add(new THREE.HemisphereLight(0x9fb8ff, 0x0a0c14, .55));
  const key = new THREE.DirectionalLight(0xffe0bc, 1.6); key.position.set(6, 12, 8); scene.add(key);
  // підлога — темна сітка, як план машинного залу
  const grid = new THREE.GridHelper(40, 40, 0x2a3346, 0x161c28); grid.position.y = -.01; scene.add(grid);

  // стійка: темний корпус + світлі «смужки» (індикатори) через emissive у текстурі
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const g = cv.getContext('2d');
  g.fillStyle = '#10141d'; g.fillRect(0, 0, 64, 128);
  for (let r = 0; r < 14; r++) { g.fillStyle = '#1b2230'; g.fillRect(4, 6 + r * 8.6, 56, 6.5); for (let k = 0; k < 4; k++) { g.fillStyle = Math.random() < .7 ? '#7fd7ff' : '#ffb27a'; g.fillRect(8 + k * 4, 8 + r * 8.6, 2, 2); } }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const em = new THREE.CanvasTexture(cv); em.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: .9, roughness: .55, metalness: .4 });
  const W = .62, H = 1.0, GAP = .16;
  const rack = new THREE.InstancedMesh(new THREE.BoxGeometry(W, H, W), mat, MAX); rack.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(rack);
  const slot = (i) => { const f = Math.floor(i / FLOOR), j = i % FLOOR, cx = j % SIDE, cz = Math.floor(j / SIDE), s = W + GAP;
    return new THREE.Vector3((cx - (SIDE - 1) / 2) * s, f * (H + .14) + H / 2, (cz - (SIDE - 1) / 2) * s); };
  // перекриття між поверхами — тонкі світлі плити
  const slabs = new THREE.InstancedMesh(new THREE.BoxGeometry(SIDE * (W + GAP) + .2, .05, SIDE * (W + GAP) + .2), new THREE.MeshStandardMaterial({ color: 0x1c2433, emissive: 0xE0532A, emissiveIntensity: .08, roughness: .8 }), Math.ceil(MAX / FLOOR) + 1);
  scene.add(slabs);

  const comp = new EffectComposer(R); comp.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .7, .4, .55); comp.addPass(bloom); comp.addPass(new OutputPass());

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), P = new THREE.Vector3();
  let shown = 0, target = 0, yaw = .7, pitch = .32, dist = 22, drag = null, vis = false, raf = 0, last = 0, t = 0, auto = true, sel = -1;
  function layout() {
    const n = Math.round(shown);
    for (let i = 0; i < MAX; i++) {
      const s = i < n ? 1 : i < shown + 1 && i >= n ? Math.max(0, shown - n) : 0;   // остання стійка «виростає» плавно
      const p = slot(i); sc.set(1, s, 1); P.copy(p); P.y = p.y - H / 2 * (1 - s) + (s < 1 ? (1 - s) * 1.2 : 0);
      m4.compose(P, q, sc); rack.setMatrixAt(i, m4);
    }
    rack.instanceMatrix.needsUpdate = true;
    const floors = Math.ceil(shown / FLOOR);
    for (let f = 0; f < slabs.count; f++) { m4.compose(P.set(0, f * (H + .14) - .04, 0), q, sc.set(1, f <= floors ? 1 : 0, 1)); slabs.setMatrixAt(f, m4); }
    slabs.instanceMatrix.needsUpdate = true;
  }
  function size() { const w = host.clientWidth || 1, h = host.clientHeight || 1; R.setSize(w, h, false); comp.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  function frame(now) {
    const dt = Math.min(.05, last ? (now - last) / 1000 : 0); last = now; t += dt;
    if (Math.abs(target - shown) > .01) { shown += (target - shown) * Math.min(1, dt * (REDUCE ? 60 : 2.4)); layout(); }
    if (auto && !REDUCE) yaw += dt * .12;
    const hT = Math.max(4, Math.ceil(shown / FLOOR) * (H + .14)), lookY = hT * .5;
    cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, lookY + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist); cam.lookAt(0, lookY, 0);
    mat.emissiveIntensity = .75 + .15 * Math.sin(t * 2.2);
    comp.render();
    raf = vis ? requestAnimationFrame(frame) : 0;
  }
  function pick(i) { sel = i; const [y, v, note] = Y[i]; target = v / PER;
    if (window.RC_SND) RC_SND.fx('build', i + 2);
    hudV.textContent = '$' + v + ' млрд'; hudN.textContent = y + ' · ' + note + ' · 1 стійка = $' + PER + ' млрд';
    yrs.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
    dist = 13 + Math.ceil(target / FLOOR) * 1.8; if (!raf && vis) { last = 0; raf = requestAnimationFrame(frame); } }
  yrs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pick(+b.dataset.i); });
  host.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; drag = [e.clientX, e.clientY]; auto = false; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', (e) => { if (!drag) return; yaw -= (e.clientX - drag[0]) * .006; pitch = Math.max(.05, Math.min(1.2, pitch + (e.clientY - drag[1]) * .004)); drag = [e.clientX, e.clientY]; });
  host.addEventListener('pointerup', () => { drag = null; });
  host.addEventListener('wheel', (e) => { e.preventDefault(); dist = Math.max(8, Math.min(40, dist * (1 + Math.sign(e.deltaY) * .08))); }, { passive: false });
  new ResizeObserver(size).observe(host); size(); layout();
  // при появі: вежа виростає від 2023 до 2026 по черзі
  let played = false;
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    if (vis && !played) { played = true; if (REDUCE) pick(3); else Y.forEach((_, i) => setTimeout(() => pick(i), 300 + i * 1500)); } }, { threshold: .3 }).observe(host);
}
