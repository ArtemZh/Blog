/* Стаття 39, розділ 04: кабель народжується шарами. Кожен шар наростає вздовж осі фронтом (площина відсікання) зі своїм рухом: дроти намотуються, решта виходить із головки, що їде уздовж кабелю.
   Кроки йдуть самі, коли сцену видно, далі читач керує. Перемикач глибоководний / прибережний. Порядок шарів типовий для глибоководного кабелю, розміри пропорційні, не креслення виробника: кінцеві ≈ 17–20 мм (TeleGeography). Тягніть, щоб покрутити. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const host = document.getElementById('oc-cable3d');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const box = host.querySelector('.oc-3d__v'), cap = host.querySelector('.oc-3d__cap'), btns = [...host.querySelectorAll('[data-k]')], chips = host.querySelector('.oc-3d__steps'), mm = host.querySelector('.oc-3d__mm'), bPlay = host.querySelector('[data-play]'), bPrev = host.querySelector('[data-prev]'), bNext = host.querySelector('[data-next]');
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.toneMapping = THREE.ACESFilmicToneMapping; R.localClippingEnabled = true; box.appendChild(R.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, 1.6, .1, 200); cam.position.set(-5, 5, 34); cam.lookAt(0, 0, 0);
  scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture;
  scene.add(new THREE.HemisphereLight(0xcfeef5, 0x06202c, .9)); const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(4, 8, 8); scene.add(key);
  const pivot = new THREE.Group(); pivot.rotation.set(.18, -.55, 0); scene.add(pivot);
  const M = (c, m, r, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, ...o });
  // r — радіус у мм, len — довжина шару на схемі
  const LAY = [
    { id: 'fib', dia: 1, how: 'lay', t: 'Волокна', d: 'Кілька пар скляних волокон, кожне тонше волосини. Світло йде тут.' },
    { id: 'gel', r: 1.3, c: 0xe6c26a, m: 0, ro: .35, how: 'head', op: .55, t: 'Гель', d: 'Заповнює все навколо волокон і не дає їм тертися, а воді — рухатися вздовж кабелю.' },
    { id: 'tube', r: 1.6, c: 0xbfc8cc, m: .9, ro: .3, how: 'head', t: 'Сталева трубка', d: 'Герметично зварена навколо волокон: тримає воду й тиск океану подалі від скла.' },
    { id: 'wire', r: 4.2, wires: 14, c: 0x8f989c, how: 'wind', t: 'Сталеві дроти', d: 'Намотані спіраллю. Тримають вагу кабелю, коли його опускають на кілька кілометрів.' },
    { id: 'cu', r: 4.9, c: 0xc77b3a, m: 1, ro: .35, how: 'head', t: 'Мідна оболонка', d: 'Дані йдуть світлом, а підсилювачам на дні потрібен струм: мідь несе його з берега, кілька тисяч вольтів.' },
    { id: 'pe', r: 9, c: 0x20262b, m: 0, ro: .55, how: 'head', t: 'Поліетилен', d: 'Ізолює мідь від солоної води. Так виглядає глибоководний кабель, 17–20 мм у товщину.' },
    { id: 'arm', r: 12.5, wires: 22, c: 0x5e6569, shore: 1, how: 'wind', t: 'Сталева броня', d: 'Лише біля берега, де є якорі й трали: один-два шари броні, глибше 1500 м її зазвичай немає.' },
    { id: 'jac', r: 14, c: 0x2c2a22, m: 0, ro: .9, shore: 1, how: 'head', t: 'Зовнішня оплітка', d: 'Просочена оболонка поверх броні, захист від корозії й тертя. Броньований кабель буває й до 50 мм.' }
  ];
  const parts = []; const S = .28;
  function tube(r0, r1, len, mat) { const g = new THREE.Group(); const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r1, len, 64, 1, true), mat); const cp = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 64), mat.clone()); cp.material.side = THREE.DoubleSide; cp.position.y = len / 2; cp.rotation.x = -Math.PI / 2; g.add(o, cp); return g; }
  function wires(n, rr, wr, len, mat) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, pts = []; for (let k = 0; k <= 30; k++) { const v = k / 30, a = a0 + v * 1.1; pts.push(new THREE.Vector3(Math.cos(a) * rr, (v - .5) * len, Math.sin(a) * rr)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, wr, 8), mat)); } return g; }
  let prev = 0; const AX = new THREE.Vector3(), PT = new THREE.Vector3();
  LAY.forEach((l, i) => { let m; const len = 22 - i * 2.3; l.plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0); l.len = len;
    if (l.id === 'fib') { m = new THREE.Group(); const glow = new THREE.MeshStandardMaterial({ color: 0xbff, emissive: 0x38e6ee, emissiveIntensity: 1.6, roughness: .2, clippingPlanes: [l.plane] }); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, c = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 24, 10), glow); c.position.set(Math.cos(a) * .17, 0, Math.sin(a) * .17); m.add(c); } l.len = 24; }
    else if (l.wires) m = wires(l.wires, (prev + l.r) / 2 * S, (l.r - prev) / 2 * S * .95, len, M(l.c, .9, .4, { clippingPlanes: [l.plane] }));
    else m = tube(prev * S, l.r * S, len, M(l.c, l.m, l.ro, { clippingPlanes: [l.plane], ...(l.op ? { transparent: true, opacity: l.op } : {}) }));
    const off = (24 - l.len) / 2; m.userData = { l, off }; m.position.y = -off; pivot.add(m); parts.push(m); if (l.r) { prev = l.r; l.dia = l.r * 2; } });
  // головка, що їде уздовж кабелю й лишає за собою шар
  const head = new THREE.Mesh(new THREE.TorusGeometry(1, .07, 12, 56), new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffb45e, emissiveIntensity: 1.4 })); head.rotation.x = Math.PI / 2; pivot.add(head);
  pivot.rotation.z = Math.PI / 2 * 1; let kind = 'deep', yaw = -.55, drag = null, step = 0, g = 0, auto = false, chosen = null, started = false;
  const list = () => LAY.filter((l) => !l.shore || kind === 'shore');
  function renderChips() { const L = list(); chips.innerHTML = L.map((l, i) => `<button type="button" data-s="${i}" title="${l.t}">${i + 1}</button>`).join(''); chips.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { auto = false; goTo(+b.dataset.s, 1); chosen = LAY[LAY.indexOf(L[+b.dataset.s])].id; apply(); updPlay(); })); }
  function updPlay() { bPlay.textContent = auto ? '❚❚ Пауза' : (step >= list().length - 1 && g >= 1 ? '↺ Побудувати ще раз' : '▶ Побудувати'); }
  function goTo(i, gg) { const L = list(); step = Math.max(0, Math.min(L.length - 1, i)); g = gg; chosen = null; apply(); }
  function fmtD(v) { return v.toLocaleString('uk-UA', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function apply() { const L = list(), cur = L[step]; parts.forEach((m) => { const l = m.userData.l, i = L.indexOf(l); m.visible = i >= 0 && (i < step || (i === step && g > 0)); const dim = chosen && chosen !== l.id; m.traverse((o) => { if (o.material) { o.material.transparent = !!l.op || !!dim; o.material.opacity = dim ? .13 : (l.op || 1); o.material.depthWrite = !dim; } }); });
    chips.querySelectorAll('button').forEach((b, i) => { b.classList.toggle('on', i === step); b.classList.toggle('done', i < step || (i === step && g >= 1)); });
    const shown = chosen ? LAY.find((a) => a.id === chosen) : cur; if (cap) { const k = `<b>${shown.t}.</b> ${shown.d}`; if (cap.dataset.k !== shown.id) { cap.dataset.k = shown.id; cap.innerHTML = k; } }
    const before = step ? L[step - 1].dia : 0, dNow = before + (cur.dia - before) * g; mm.textContent = 'Ø ≈ ' + fmtD(dNow) + ' мм'; updPlay(); }
  function setK(k) { kind = k; btns.forEach((b) => b.classList.toggle('on', b.dataset.k === k)); renderChips(); if (k === 'shore' && started) { goTo(list().findIndex((l) => l.id === 'arm'), 0); auto = !REDUCE; if (REDUCE) goTo(list().length - 1, 1); } else if (started) { goTo(list().length - 1, 1); auto = false; } else apply(); updPlay(); if (window.OC_SND && started) OC_SND.fx('click'); }
  btns.forEach((b) => b.addEventListener('click', () => { started = true; setK(b.dataset.k); }));
  bPlay.addEventListener('click', () => { started = true; if (auto) auto = false; else { if (step >= list().length - 1 && g >= 1) goTo(0, 0); auto = true; } chosen = null; updPlay(); if (window.OC_SND) OC_SND.fx('click'); });
  bPrev.addEventListener('click', () => { auto = false; goTo(step - 1, 1); });
  bNext.addEventListener('click', () => { auto = false; goTo(step + (g >= 1 ? 1 : 0), 1); });
  const ray = new THREE.Raycaster(), pt = new THREE.Vector2();
  box.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, yaw, moved: 0 }; box.setPointerCapture(e.pointerId); });
  box.addEventListener('pointermove', (e) => { if (drag) { drag.moved = Math.abs(e.clientX - drag.x); yaw = drag.yaw + (e.clientX - drag.x) * .01; } });
  box.addEventListener('pointerup', (e) => { if (drag && drag.moved < 4) { const r = box.getBoundingClientRect(); pt.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(pt, cam); const h = ray.intersectObjects(parts.filter((p) => p.visible), true)[0]; if (h) { let o = h.object; while (o && !o.userData.l) o = o.parent; if (o) { auto = false; chosen = chosen === o.userData.l.id ? null : o.userData.l.id; apply(); } } else if (chosen) { chosen = null; apply(); } } drag = null; });
  function size() { const w = box.clientWidth || 1, h = box.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w < 560 ? 52 : 34; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(box); size(); renderChips(); setK('deep'); if (REDUCE) goTo(list().length - 1, 1);
  let vis = true, raf = 0, last = performance.now();
  function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (!drag && !REDUCE) yaw += dt * .12;
    if (auto) { g += dt / 1.5; if (g >= 1) { g = 1; if (step < list().length - 1) { step++; g = 0; } else auto = false; } apply(); }
    pivot.rotation.set(.18, 0, Math.PI / 2); scene.rotation.y = yaw; scene.updateMatrixWorld(true);
    // фронт шару: площина в локальних координатах кабелю, у світі її треба перерахувати щокадру
    const L = list(), cur = L[step]; AX.set(0, 1, 0).transformDirection(pivot.matrixWorld);
    LAY.forEach((l) => { const part = parts[LAY.indexOf(l)], full = l !== cur || g >= 1, top = -part.userData.off + l.len / 2 + .02, bot = -part.userData.off - l.len / 2, yy = full ? top + 1 : bot + (top - bot) * g; PT.set(0, yy, 0); pivot.localToWorld(PT); l.plane.normal.copy(AX).negate(); l.plane.constant = AX.dot(PT); });
    const part = parts[LAY.indexOf(cur)]; part.rotation.y = cur.how === 'wind' && g < 1 ? (1 - g) * -3.4 : 0;
    const off = part.userData.off, moving = g > 0 && g < 1 && cur.id !== 'fib'; head.visible = moving; if (moving) { head.position.y = -off - cur.len / 2 + cur.len * g; const rr = (cur.r || 1) * S * 1.08; head.scale.set(rr, rr, 1); }
    R.render(scene, cam); raf = vis ? requestAnimationFrame(frame) : 0; }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !started && !REDUCE && es[0].intersectionRatio > .4) { started = true; goTo(0, 0); auto = true; updPlay(); } if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }, { threshold: [0, .45] }).observe(box);
  window.__ocCable = (i, gg, k) => { started = true; auto = false; if (k) { kind = k; renderChips(); btns.forEach((b) => b.classList.toggle('on', b.dataset.k === k)); } if (i !== undefined) goTo(i, gg === undefined ? 1 : gg); return { kind, step, g, parts: parts.filter((p) => p.visible).length, mm: mm.textContent }; };
}
