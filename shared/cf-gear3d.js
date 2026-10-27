/* Стаття 38, розділ 07 «Чим мелють і варять» — дві моделі (GLB, Draco): ручний млинок і гейзерна кавоварка-мока.
   Модель повільно обертається; тягніть, щоб покрутити; кнопки перемикають модель. prefers-reduced-motion — без автоповороту. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const host = document.getElementById('cf-gear3d');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const box = host.querySelector('.cf-gear__3d'), btns = [...host.querySelectorAll('[data-gear]')], cap = host.querySelector('.cf-gear__cap');
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
  box.appendChild(R.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1.6, .05, 50); cam.position.set(0, .5, 4.2); cam.lookAt(0, 0, 0);
  // метал (мока) без оточення відбиває чорне — даємо «кімнату» для відблисків
  scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture;
  scene.add(new THREE.HemisphereLight(0xfff0dc, 0x2a1a10, 1.1));
  const key = new THREE.DirectionalLight(0xffe2c0, 2.6); key.position.set(3, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff9a5a, 1.8); rim.position.set(-4, 2, -3); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(.95, 64), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.82; scene.add(floor);
  const pivot = new THREE.Group(); scene.add(pivot);

  const draco = new DRACOLoader().setDecoderPath('assets/draco/'), loader = new GLTFLoader().setDRACOLoader(draco), cache = {};
  const INFO = {
    grinder: 'Ручний млинок із жорнами: зерно мелеться між двома конусами, а не рубається ножем — частинки виходять рівнішими, тож кава екстрагується рівномірніше.',
    moka: 'Гейзерна кавоварка (мока): вода в нижній камері закипає, тиск пари (≈1–1,5 бар) жене її крізь мелену каву вгору. Це не еспресо — там 9 бар.'
  };
  let cur = null, yaw = .6, vel = REDUCE ? 0 : .35, drag = null;

  function fit(obj) { const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const k = 1.6 / Math.max(s.x, s.y, s.z); obj.scale.setScalar(k); obj.position.set(-c.x * k, -.8 + s.y * k / 2 - c.y * k, -c.z * k); }
  function show(name) {
    btns.forEach((b) => b.classList.toggle('on', b.dataset.gear === name)); if (cap) cap.textContent = INFO[name] || '';
    if (window.CF_SND) CF_SND.fx('tick');
    const put = (m) => { if (cur) pivot.remove(cur); cur = m; pivot.add(m); host.classList.remove('wait'); };
    if (cache[name]) return put(cache[name]);
    host.classList.add('wait');
    loader.load(`assets/coffee/3d/${name}.glb?v=20261027`, (g) => { const m = g.scene; fit(m);
      // у моки Tripo запік «дзеркальний» метал (шорсткість ≈ 0) — у вебі він відбиває темряву; робимо матовий алюміній
      if (name === 'moka') m.traverse((o) => { if (o.isMesh) { o.material.roughnessMap = o.material.metalnessMap = null; o.material.roughness = .34; o.material.metalness = .8; o.material.needsUpdate = true; } }); cache[name] = m; put(m); }, undefined, () => host.classList.remove('wait'));
  }
  btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.gear)));

  box.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, yaw }; box.setPointerCapture(e.pointerId); host.classList.add('touched'); });
  box.addEventListener('pointermove', (e) => { if (drag) yaw = drag.yaw + (e.clientX - drag.x) * .012; });
  box.addEventListener('pointerup', () => { drag = null; });

  function size() { const w = box.clientWidth || 1, h = box.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(box); size();

  let vis = true, raf = 0, last = performance.now();
  function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!drag) yaw += vel * dt; pivot.rotation.y = yaw; R.render(scene, cam);
    raf = vis ? requestAnimationFrame(frame) : 0; }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(box);
  show('grinder');
  window.__cfGear = () => ({ ok: !!cur, name: btns.find((b) => b.classList.contains('on'))?.dataset.gear });
}
