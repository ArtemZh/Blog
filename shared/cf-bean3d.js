/* Стаття 38: банер — процедурні 3D-зерна кави (three.js, без моделей ззовні).
   Два «героя» праворуч: арабіка — довша, овальна, борозна вигнута S-подібно; робуста — кругліша, борозна майже пряма
   (так їх розрізняють на око). Довкола повільно летять дрібніші зерна. Клік по зерну-герою — воно перевертається плоским боком
   з борозною до глядача. prefers-reduced-motion — статичний кадр. */
import * as THREE from 'three';

const host = document.getElementById('cf-hero3d');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  host.appendChild(R.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 2, .1, 60); cam.position.set(0, 0, 14);
  scene.add(new THREE.HemisphereLight(0xffe6c8, 0x1a0e08, .9));
  const key = new THREE.DirectionalLight(0xffd2a0, 2.4); key.position.set(4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8a4a, 1.6); rim.position.set(-6, 2, -4); scene.add(rim);

  // зерно: сфера → еліпсоїд; одна сторона пласка; борозна вздовж (S-подібна для арабіки)
  function beanGeo(len, wid, sCurve) {
    const g = new THREE.SphereGeometry(1, 96, 64), p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); let x = v.x * len, y = v.y * wid, z = v.z * .62;
      if (z < 0) z *= .42;                                                        // пласкіший бік
      const along = x / len, cy = sCurve * Math.sin(along * Math.PI) * wid * .5;   // вісь борозни
      const d = Math.abs(y - cy) / wid;
      if (z < 0) { const groove = Math.exp(-Math.pow(d / .07, 2)) * (1 - Math.pow(Math.abs(along), 6)); z += groove * .16; }   // заглиблення на пласкому боці
      else { const crest = Math.exp(-Math.pow(d / .5, 2)); z *= .9 + .1 * crest; }
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals(); return g;
  }
  const mat = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: .42, clearcoat: .55, clearcoatRoughness: .35, sheen: .3, sheenColor: new THREE.Color(0x8a4a22) });
  const ARA = beanGeo(1.22, .82, .55), CAN = beanGeo(1.0, .9, .08);
  const heroA = new THREE.Mesh(ARA, mat(0x6b3a1e)), heroC = new THREE.Mesh(CAN, mat(0x4e2b17));
  heroA.position.set(2.2, .55, 0); heroC.position.set(4.5, -.9, -.4); heroA.scale.setScalar(1.15); heroC.scale.setScalar(1.05);
  heroA.userData = { flip: 0, goal: 0, base: [ .5, -.4, .3 ] }; heroC.userData = { flip: 0, goal: 0, base: [ -.3, .6, -.5 ] };
  scene.add(heroA, heroC);
  // дрібні зерна-«пил»
  const small = [];
  for (let i = 0; i < 26; i++) { const h = (n) => { const s = Math.sin((i + 1) * n * 12.9898) * 43758.5453; return s - Math.floor(s); };
    const m = new THREE.Mesh(i % 2 ? ARA : CAN, mat(i % 3 ? 0x5a311a : 0x7a4423)); m.scale.setScalar(.18 + h(1) * .22);
    m.position.set(-3 + h(2) * 10, -3 + h(3) * 6, -6 + h(4) * 5); m.rotation.set(h(5) * 6, h(6) * 6, h(7) * 6); m.userData = { s: .1 + h(8) * .3, ph: h(9) * 6 }; small.push(m); scene.add(m); }

  function size() { const w = host.clientWidth || 1, h = host.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h;
    // на вузькому екрані герої зсуваються в центр і менші
    const narrow = w < 700; heroA.position.x = narrow ? -1.0 : 2.2; heroC.position.x = narrow ? 1.6 : 4.5; heroA.position.y = narrow ? -1.6 : .55; heroC.position.y = narrow ? -2.6 : -.9;
    cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(host); size();

  // клік: промінь → герой перевертається
  const ray = new THREE.Raycaster(), nd = new THREE.Vector2();
  host.addEventListener('click', (e) => { const r = host.getBoundingClientRect(); nd.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(nd, cam); const h = ray.intersectObjects([heroA, heroC])[0]; if (!h) return; const u = h.object.userData; u.goal = u.goal ? 0 : 1;
    if (window.CF_SND) CF_SND.fx('bean', h.object === heroA ? 'EN' : 'LC');
    const cap = document.querySelector(h.object === heroA ? '.cf-hero__lab.a' : '.cf-hero__lab.c'); if (cap) { cap.classList.add('on'); setTimeout(() => cap.classList.remove('on'), 2600); } });
  host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); nd.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(nd, cam); host.style.cursor = ray.intersectObjects([heroA, heroC]).length ? 'pointer' : ''; });

  let vis = true, raf = 0, last = performance.now(), t = 0;
  function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (!REDUCE) t += dt;
    [heroA, heroC].forEach((m, i) => { const u = m.userData; u.flip += (u.goal - u.flip) * Math.min(1, dt * 4);
      m.rotation.set(u.base[0] + Math.sin(t * .4 + i) * .12 + u.flip * Math.PI, u.base[1] + t * .18 * (i ? -1 : 1), u.base[2] + Math.sin(t * .3 + i * 2) * .08);
      m.position.y += (Math.sin(t * .8 + i * 1.7) * .0025); });
    small.forEach((m) => { const u = m.userData; m.rotation.x += dt * u.s; m.rotation.y += dt * u.s * .7; m.position.y += Math.sin(t * .5 + u.ph) * .0015; });
    R.render(scene, cam); raf = vis && !REDUCE ? requestAnimationFrame(frame) : 0; }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(host);
  frame(performance.now());
  window.__cfHero = () => ({ ok: true, flipA: +heroA.userData.flip.toFixed(2), flipC: +heroC.userData.flip.toFixed(2) });
}
