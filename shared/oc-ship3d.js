/* Стаття 39, розділ 02: «Грейт Істерн» (GLB, Draco, Tripo). Модель повільно обертається; тягніть, щоб покрутити. Навіщо: побачити, чому кабель 1865–66 вмістився лише на одному кораблі. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const host = document.getElementById('oc-ship3d');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches, box = host.querySelector('.oc-3d__v');
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; box.appendChild(R.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(26, 1.6, .05, 50); cam.position.set(0, .42, 3.4); cam.lookAt(0, .05, 0);
  scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture;
  scene.add(new THREE.HemisphereLight(0xdff4ff, 0x06202c, 1)); const key = new THREE.DirectionalLight(0xfff2dd, 2.4); key.position.set(3, 4, 4); scene.add(key);
  const pivot = new THREE.Group(); scene.add(pivot); let yaw = .7, drag = null;
  new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('assets/draco/')).load('assets/cables/3d/great-eastern.glb?v=20261031', (g) => { const m = g.scene, b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()), k = 2.3 / Math.max(s.x, s.y, s.z); m.scale.setScalar(k); m.position.set(-c.x * k, -c.y * k, -c.z * k); pivot.add(m); host.classList.remove('wait'); }, undefined, () => host.classList.remove('wait'));
  box.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, yaw }; box.setPointerCapture(e.pointerId); }); box.addEventListener('pointermove', (e) => { if (drag) yaw = drag.yaw + (e.clientX - drag.x) * .012; }); box.addEventListener('pointerup', () => { drag = null; });
  function size() { const w = box.clientWidth || 1, h = box.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } new ResizeObserver(size).observe(box); size();
  let vis = true, raf = 0, last = performance.now(); function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (!drag && !REDUCE) yaw += dt * .25; pivot.rotation.y = yaw; R.render(scene, cam); raf = vis ? requestAnimationFrame(frame) : 0; }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(box);
}
