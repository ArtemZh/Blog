/* Стаття 39, розділ 04: переріз кабелю кодом. Шари розсуваються повзунком; перемикач глибоководний / прибережний (з бронею). Тягніть, щоб покрутити.
   Розміри пропорційні, не креслення конкретного виробника: глибоководний ≈ 17–20 мм (TeleGeography). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const host = document.getElementById('oc-cable3d');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const box = host.querySelector('.oc-3d__v'), cap = host.querySelector('.oc-3d__cap'), btns = [...host.querySelectorAll('[data-k]')], inp = host.querySelector('input');
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.toneMapping = THREE.ACESFilmicToneMapping; box.appendChild(R.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, 1.6, .1, 200); cam.position.set(-5, 5, 34); cam.lookAt(0, 0, 0);
  scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture;
  scene.add(new THREE.HemisphereLight(0xcfeef5, 0x06202c, .9)); const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(4, 8, 8); scene.add(key);
  const pivot = new THREE.Group(); pivot.rotation.set(.18, -.55, 0); scene.add(pivot);
  const M = (c, m, r, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, ...o });
  // r — радіус у мм, len — довжина шару на схемі
  const LAY = [
    { id: 'fib', t: 'Волокна', d: 'Кілька пар скляних волокон, кожне тонше волосини. Світло йде тут.' },
    { id: 'tube', r: 1.6, c: 0xbfc8cc, m: .9, ro: .3, t: 'Трубка з гелем', d: 'Сталева трубка, усередині гель: не дає воді дістатися скла.' },
    { id: 'wire', r: 4.2, wires: 14, c: 0x8f989c, t: 'Сталеві дроти', d: 'Тримають вагу кабелю, коли його опускають на кілька кілометрів.' },
    { id: 'cu', r: 4.9, c: 0xc77b3a, m: 1, ro: .35, t: 'Мідна оболонка', d: 'Живить підсилювачі на дні постійним струмом із берега: кілька тисяч вольтів.' },
    { id: 'pe', r: 9, c: 0x20262b, m: 0, ro: .55, t: 'Поліетилен', d: 'Ізолює мідь від солоної води. Так виглядає глибоководний кабель, 17–20 мм у товщину.' },
    { id: 'arm', r: 12.5, wires: 22, c: 0x5e6569, shore: 1, t: 'Сталева броня', d: 'Лише біля берега, де є якорі й трали: один-два шари броні, глибше 1500 м її зазвичай немає.' },
    { id: 'jac', r: 14, c: 0x2c2a22, m: 0, ro: .9, shore: 1, t: 'Зовнішня оплітка', d: 'Просочена оболонка поверх броні, захист від корозії й тертя.' }
  ];
  const parts = []; const S = .28;
  function tube(r0, r1, len, mat) { const g = new THREE.Group(); const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r1, len, 64, 1, true), mat); const cp = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 64), mat.clone()); cp.material.side = THREE.DoubleSide; cp.position.y = len / 2; cp.rotation.x = -Math.PI / 2; g.add(o, cp); return g; }
  function wires(n, rr, wr, len, mat) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, pts = []; for (let k = 0; k <= 30; k++) { const v = k / 30, a = a0 + v * 1.1; pts.push(new THREE.Vector3(Math.cos(a) * rr, (v - .5) * len, Math.sin(a) * rr)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, wr, 8), mat)); } return g; }
  let prev = 0;
  LAY.forEach((l, i) => { let m; const len = 22 - i * 2.6;
    if (l.id === 'fib') { m = new THREE.Group(); const glow = new THREE.MeshStandardMaterial({ color: 0xbff, emissive: 0x38e6ee, emissiveIntensity: 1.6, roughness: .2 }); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, c = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 24, 10), glow); c.position.set(Math.cos(a) * .25, 0, Math.sin(a) * .25); m.add(c); } }
    else if (l.wires) m = wires(l.wires, (prev + l.r) / 2 * S, (l.r - prev) / 2 * S * .95, len, M(l.c, .9, .4));
    else m = tube(prev * S, l.r * S, len, M(l.c, l.m, l.ro));
    const off = (24 - len) / 2; m.userData = { l, base: off }; pivot.add(m); parts.push(m); if (l.r) prev = l.r; });
  // вісь кабелю — горизонтальна
  pivot.rotation.z = Math.PI / 2 * 1; let kind = 'deep', yaw = -.55, drag = null;
  const apply = () => { const u = +inp.value; parts.forEach((m, i) => { const sh = m.userData.l.shore; m.visible = !sh || kind === 'shore'; m.position.y = -m.userData.base * (u + .05) * 1.1; }); };
  function setK(k) { kind = k; btns.forEach((b) => b.classList.toggle('on', b.dataset.k === k)); apply(); say(k === 'deep' ? 'pe' : 'arm'); if (window.OC_SND) OC_SND.fx('click'); }
  const say = (id) => { const l = LAY.find((a) => a.id === id); if (cap && l) cap.innerHTML = `<b>${l.t}.</b> ${l.d}`; };
  btns.forEach((b) => b.addEventListener('click', () => setK(b.dataset.k)));
  inp.addEventListener('input', () => { apply(); const vis = LAY.filter((l) => !l.shore || kind === 'shore'); say(vis[Math.min(vis.length - 1, Math.floor(+inp.value * vis.length))].id); });
  const ray = new THREE.Raycaster(), pt = new THREE.Vector2();
  box.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, yaw, moved: 0 }; box.setPointerCapture(e.pointerId); });
  box.addEventListener('pointermove', (e) => { if (drag) { drag.moved = Math.abs(e.clientX - drag.x); yaw = drag.yaw + (e.clientX - drag.x) * .01; } });
  box.addEventListener('pointerup', (e) => { if (drag && drag.moved < 4) { const r = box.getBoundingClientRect(); pt.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(pt, cam); const h = ray.intersectObjects(parts.filter((p) => p.visible), true)[0]; if (h) { let o = h.object; while (o && !o.userData.l) o = o.parent; if (o) say(o.userData.l.id); } } drag = null; });
  function size() { const w = box.clientWidth || 1, h = box.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w < 560 ? 52 : 34; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(box); size(); apply(); setK('deep');
  let vis = true, raf = 0, last = performance.now();
  function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (!drag && !REDUCE) yaw += dt * .12; pivot.rotation.set(.18, 0, Math.PI / 2); scene.rotation.y = yaw; R.render(scene, cam); raf = vis ? requestAnimationFrame(frame) : 0; }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(box);
  window.__ocCable = () => ({ kind, parts: parts.filter((p) => p.visible).length });
}
