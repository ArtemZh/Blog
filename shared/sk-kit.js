/* Стаття 36, розділ «Хто що робить»: sci-fi верстат-друкарня статей (ChatGPT, 4 види → Tripo HD → Blender: повна сітка без спрощення, текстури 2K, Draco з точними нормалями).
   Чотири змінні модулі спереду — ролі команди: пензель — ChatGPT, камертон — Suno, кристал — Tripo, лінза — ai slop helper.
   Верстат повільно обертається; тягніть — крутити; мітки над модулями (клік — підсвітити роль на схемі команди вище). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const host = document.getElementById('sk-kit');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1; host.prepend(R.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .05, 50);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8a50, 1.6); rim.position.set(-3, 1.5, -3); scene.add(rim);
  const piv = new THREE.Group(); scene.add(piv);
  const pins = [['ChatGPT', 'художник', -.28], ['Suno', 'композитор', -.09], ['Tripo', 'скульптор', .1], ['ai slop', 'детектор правди', .29]].map(([n, r, fx]) => {
    const e = document.createElement('button'); e.type = 'button'; e.className = 'sk-kit__pin'; e.innerHTML = `<b>${n}</b><span>${r}</span>`; host.appendChild(e);
    e.addEventListener('click', () => { const id = { ChatGPT: 'gpt', Suno: 'suno', 'ai slop': 'slop', Tripo: 'tripo' }[n]; if (window.SK_ROLES) SK_ROLES.focus(id); if (window.SK_SND) SK_SND.fx('click'); });
    return { e, fx, p: new THREE.Vector3() }; });
  let box = null;
  const dr = new DRACOLoader().setDecoderPath('assets/draco/');
  new GLTFLoader().setDRACOLoader(dr).load('assets/skill/press.glb?v=2', (g) => {
    const m = g.scene; m.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3()), k = 2 / Math.max(s.x, s.y, s.z);
    m.position.sub(c); piv.add(m); piv.scale.setScalar(k); box = { w: s.x, h: s.y, d: s.z }; host.classList.add('ready');
  });
  let yaw = -.35, pitch = .18, drag = null, auto = true, vis = false, raf = 0, last = 0;
  host.addEventListener('pointerdown', (e) => { if (e.target.closest('.sk-kit__pin')) return; drag = [e.clientX, e.clientY]; auto = false; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', (e) => { if (!drag) return; yaw += (e.clientX - drag[0]) * .008; pitch = Math.max(-.2, Math.min(.7, pitch + (e.clientY - drag[1]) * .005)); drag = [e.clientX, e.clientY]; });
  host.addEventListener('pointerup', () => { drag = null; });
  function size() { const w = host.clientWidth || 1, h = host.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(host); size();
  const V = new THREE.Vector3();
  function frame(now) { const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    if (auto && !REDUCE) yaw = -.35 + Math.sin(now / 1000 * .35) * .6;
    piv.rotation.set(0, yaw, 0); cam.position.set(0, .3 + pitch * 2.2, 3.4); cam.lookAt(0, -.04, 0);
    rim.intensity = 1.4 + .4 * Math.sin(now / 600);
    if (box) pins.forEach((p) => { V.set(p.fx * box.w, box.h * .02, box.d * .5).applyMatrix4(piv.matrixWorld); V.project(cam);
      const front = Math.cos(yaw) > .25; p.e.style.transform = `translate(${((V.x + 1) / 2 * host.clientWidth).toFixed(1)}px, ${((1 - V.y) / 2 * host.clientHeight).toFixed(1)}px)`; p.e.classList.toggle('hide', !front); });
    R.render(scene, cam); raf = vis ? requestAnimationFrame(frame) : 0; }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = 0; raf = requestAnimationFrame(frame); } }, { threshold: .1 }).observe(host);
}
