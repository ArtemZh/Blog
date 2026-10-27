/* Стаття 36, розділ «Чотири сестри»: перші екрани статей 33–36 на справжніх 3D-моделях iPhone та iPad
   (ідея Center Stage з React Bits, пресети «Tilt shift» і «Focus pull»; переписано з нуля на three.js).
   Моделі: iPhone 15 Pro Max — polyman Studio (CC BY), iPad Pro — DatSketch (CC BY-NC), Sketchfab; стиснуто gltf-transform.
   Дві сцени поруч, обидві живуть самі, поки їх видно:
   1) «Тілт-шифт» — два телефони й планшет лежать на білій площині, камера під кутом, справжня глибина різкості:
      різка лише смуга, яка повільно «гуляє» столом, камера нерухома;
   2) «Перевід фокуса» — вікно браузера з сайтом Itspired під кутом, над ним плаваючі вікна з портфоліо (панель Jira,
      статті «Інтерстеллар» і «Рецесія»); фокус плавно переходить з ближнього краю на дальній і назад (по 6 с), камера нерухома.
   v2 (26.10.2026): план крупніший, камера повільно наїжджає; різкість не пливе, а «стрибає» з цілі на ціль, як у фокус-пуллера
   (тримає ~1,4 с, переводить ~0,5 с). Клік по сцені — автоматика зупиняється, різкість і камера наводяться в точку кліку
   (Raycaster); кнопка «▶ авто» повертає режим.
   Розмиття — BokehPass за глибиною кадру. prefers-reduced-motion — статичний кадр. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const host = document.getElementById('sk-stage');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D2R = Math.PI / 180;
  host.innerHTML = `<div class="sk-stage2">
    <figure class="sk-sc sk-sc--tilt"><div class="sk-sc__view"></div><figcaption>Тілт-шифт: різкість переходить з пристрою на пристрій · клік — навести</figcaption><button type="button" class="sk-sc__auto" hidden>▶ авто</button></figure>
    <figure class="sk-sc sk-sc--pull"><div class="sk-sc__view"></div><figcaption>Перевід фокуса: різкість стрибає з вікна на вікно · клік — навести</figcaption><button type="button" class="sk-sc__auto" hidden>▶ авто</button></figure></div>`;
  const [vTilt, vPull] = host.querySelectorAll('.sk-sc__view');

  // ── моделі: один раз завантажити, далі клонувати ──
  const dr = new DRACOLoader().setDecoderPath('assets/draco/');
  const loader = new GLTFLoader().setDRACOLoader(dr);
  const load = (u) => new Promise((ok, no) => loader.load(u, (g) => ok(g.scene), undefined, no));
  const texL = new THREE.TextureLoader();
  const shot = (n, k) => { const t = texL.load(`assets/skill/shot-${n}-${k}.jpg`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (k === 'tb') { t.center.set(0.5, 0.5); t.rotation = Math.PI; } return t; };
  // матеріал екрана iPhone у моделі має службову назву; у iPad — «screen»
  const SCREEN = { ph: 'pIJKfZsazmcpEiU', tb: 'screen' };
  // реальна висота корпусу, м: iPhone 15 Pro Max 16,0 см, iPad Pro 11″ 24,8 см
  const HEIGHT = { ph: 0.16, tb: 0.248 };

  // пристрій екраном догори, верх екрана — від камери (−z); розмір — реальний
  function device(src, k, tex) {
    const m = src.clone(true);
    const drop = [];
    m.traverse((o) => { if (o.isMesh && /pencil|Line_|Text_|logo\.001/i.test(o.name)) drop.push(o); });
    drop.forEach((o) => o.parent.remove(o));
    m.traverse((o) => { if (!o.isMesh) return; o.castShadow = true;
      if (o.material.name === SCREEN[k]) o.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); });
    const inner = new THREE.Group(); inner.add(m);
    // iPhone у моделі дивиться екраном у −z, iPad — у +z; зводимо обидва до +z
    if (k === 'ph') inner.rotation.y = Math.PI;
    inner.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(inner), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const sc = HEIGHT[k] / s.y; m.position.sub(c); inner.scale.setScalar(sc);
    const g = new THREE.Group(); g.add(inner); g.rotation.x = -Math.PI / 2;
    const w = new THREE.Group(); w.add(g); w.position.y = s.z * sc / 2; return w;
  }

  // ── спільна «студія»: рендерер, світло, підлога з м'якою тінню, композер із глибиною різкості ──
  function studio(view, bg, floorShadow) {
    const R = new THREE.WebGLRenderer({ antialias: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1;
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.VSMShadowMap; view.appendChild(R.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(bg);
    const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(24, 1.6, 0.02, 4);
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-0.3, 1.2, 0.4); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 14; key.shadow.blurSamples = 16;
    Object.assign(key.shadow.camera, { left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 3 }); scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: floorShadow }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const comp = new EffectComposer(R); comp.addPass(new RenderPass(scene, cam));
    const bokeh = new BokehPass(scene, cam, { focus: 0.5, aperture: 0.05, maxblur: 0.01 }); comp.addPass(bokeh); comp.addPass(new OutputPass());
    function size() { const w = view.clientWidth || 1, h = view.clientHeight || 1; R.setSize(w, h, false); comp.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    new ResizeObserver(size).observe(view); size();
    return { R, scene, cam, comp, bokeh };
  }

  const ez = (v) => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
  const V = new THREE.Vector3();
  // камера: точка, на яку дивимось, кут над підлогою (elev), поворот навколо (yaw), відстань
  function aim(cam, tgt, elev, yaw, dist) {
    cam.position.set(tgt.x + Math.sin(yaw) * Math.cos(elev) * dist, tgt.y + Math.sin(elev) * dist, tgt.z + Math.cos(yaw) * Math.cos(elev) * dist);
    cam.lookAt(tgt);
  }

  // «вікно»: заокруглена рамка з рядком заголовка (крапки, назва або адреса) і скріншотом; м'яка тінь позаду
  const SHADOW = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 40; g.fillStyle = '#000'; g.fillRect(56, 56, 144, 144); const t = new THREE.CanvasTexture(c); return t; })();
  function panel(name, W, H, title, url, lift) {
    const c = document.createElement('canvas'), S = 1600; c.width = S; c.height = Math.round(S * H / W);
    const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const img = new Image(); img.src = `assets/skill/${name}.jpg`;
    img.onload = () => {
      const r = 34, bar = 64, w = c.width, h = c.height;
      g.clearRect(0, 0, w, h); g.save(); g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, r); g.clip();
      g.fillStyle = '#17181d'; g.fillRect(0, 0, w, h);
      // скріншот під рядком заголовка: на всю ширину, верх сторінки
      const k = w / img.width; g.drawImage(img, 0, bar, w, img.height * k);
      g.fillStyle = '#202128'; g.fillRect(0, 0, w, bar); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, bar - 1, w, 1);
      ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => { g.fillStyle = lift ? 'rgba(255,255,255,.22)' : col; g.beginPath(); g.arc(34 + i * 26, bar / 2, 8, 0, 7); g.fill(); });
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (url) { g.fillStyle = '#2b2c34'; g.beginPath(); g.roundRect(w / 2 - 230, 14, 460, 36, 18); g.fill(); g.fillStyle = '#c9cbd3'; g.font = '500 22px ui-monospace, Menlo, monospace'; g.fillText(url, w / 2, bar / 2 + 1); }
      else { g.fillStyle = '#a7a9b3'; g.font = '600 24px ui-sans-serif, system-ui, sans-serif'; g.fillText(title, w / 2, bar / 2 + 1); }
      g.restore(); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 3; g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, r); g.stroke();
      tex.needsUpdate = true; };
    const grp = new THREE.Group();
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.6, H * 1.9), new THREE.MeshBasicMaterial({ map: SHADOW, transparent: true, opacity: lift ? 0.75 : 0.5, depthWrite: false }));
    sh.position.set(0.02, -0.03, -0.012); grp.add(sh);
    grp.add(new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, toneMapped: false })));
    return grp;
  }

  Promise.all([load('assets/skill/dev/iphone.glb?v=1'), load('assets/skill/dev/ipad.glb?v=1')]).then(([ph, tb]) => {
    // ── 1. тілт-шифт: білий стіл, телефон · планшет · телефон, як у пресеті «Tilt shift» ──
    const A = studio(vTilt, 0xf1f1f1, 0.22);
    const aL = device(ph, 'ph', shot(35, 'ph')), aT = device(tb, 'tb', shot(36, 'tb')), aR = device(ph, 'ph', shot(34, 'ph'));
    aT.rotation.y = -0.3;
    aL.position.set(-0.19, aL.position.y, 0.07); aL.rotation.y = -0.3;
    aR.position.set(0.19, aR.position.y, -0.08); aR.rotation.y = -0.3;
    A.scene.add(aL, aT, aR);
    A.bokeh.uniforms.aperture.value = 0.09; A.bokeh.uniforms.maxblur.value = 0.012;

    // ── 2. перевід фокуса: вікно браузера з сайтом Itspired, над ним плаваючі вікна з портфоліо (як у пресеті «Focus pull») ──
    const B = studio(vPull, 0x0b0b0f, 0);
    B.scene.traverse((o) => { if (o.material && o.material.isShadowMaterial) o.visible = false; });
    const root = new THREE.Group(); root.rotation.set(-0.28, -0.4, 0); B.scene.add(root);
    root.add(panel('win-itspired', 1.0, 0.66, '', 'itspired.com', 0));
    const wj = panel('win-jira', 0.42, 0.279, 'Jira — панель звітів', '', 1); wj.position.set(-0.27, -0.15, 0.05);
    const wt = panel('win-34', 0.4, 0.269, 'Фізика «Інтерстеллара»', '', 1); wt.position.set(0.28, 0.13, 0.07);
    const wd = panel('win-35', 0.34, 0.229, 'Рецесія в США', '', 1); wd.position.set(0.24, -0.2, 0.1);
    root.add(wj, wt, wd);
    B.bokeh.uniforms.aperture.value = 0.05; B.bokeh.uniforms.maxblur.value = 0.016;
    const near = new THREE.Vector3(), far = new THREE.Vector3();

    // ── керування: автоматичний фокус-пуллер або точка кліку ──
    let raf = 0, vis = 0; const t0 = performance.now();
    const ray = new THREE.Raycaster(), NDC = new THREE.Vector2();
    // цілі фокуса: tilt — центри пристроїв; pull — вікна (у координатах root)
    const tiltT = [aL, aT, aR].map((o) => { const v = new THREE.Vector3(); new THREE.Box3().setFromObject(o).getCenter(v); v.y = 0.01; return v; });
    const pullT = [[-0.27, -0.15, 0.05], [0, 0.05, 0], [0.28, 0.13, 0.07], [0.24, -0.2, 0.1], [-0.4, 0.2, 0]].map((p) => new THREE.Vector3(...p));
    const mk = (S, look, dist) => ({ S, auto: true, f: 0, look: look.clone(), lookT: look.clone(), look0: look.clone(), dist, distT: dist, dist0: dist, hit: null });
    const sA = mk(A, new THREE.Vector3(-0.02, 0, 0.02), 0.66), sB = mk(B, new THREE.Vector3(0.04, -0.02, 0), 1.32);
    // розклад пуллера: тримати HOLD с, переводити MOVE с; повертає [індекс з, індекс до, частка переходу]
    const HOLD = 1.4, MOVE = 0.5, sched = (t, n) => { const k = Math.floor(t / (HOLD + MOVE)), u = (t % (HOLD + MOVE)) - HOLD; return [k % n, (k + 1) % n, u > 0 ? ez(u / MOVE) : 0]; };
    let last = performance.now();
    function frame(now) {
      const t = REDUCE ? 3 : Math.max(0, now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000), kk = Math.min(1, dt * 7); last = now;
      if (vis & 1) {
        const st = sA, c = A.cam;
        if (st.auto) { const [i, j, u] = sched(t, 3); V.copy(tiltT[i]).lerp(tiltT[j], u); st.distT = st.dist0 - 0.06 * (0.5 + 0.5 * Math.sin(t * 0.35)); st.lookT.copy(st.look0); }
        else V.copy(st.hit);
        st.look.lerp(st.lookT, kk); st.dist += (st.distT - st.dist) * kk;
        aim(c, st.look, 38 * D2R, -14 * D2R, st.dist); c.fov = 20; c.updateProjectionMatrix();
        const fd = c.position.distanceTo(V); st.f = st.f ? st.f + (fd - st.f) * Math.min(1, dt * 12) : fd; A.bokeh.uniforms.focus.value = st.f;
        A.comp.render();
      }
      if (vis & 2) {
        const st = sB, c = B.cam; root.updateMatrixWorld();
        if (st.auto) { const [i, j, u] = sched(t + 0.7, pullT.length); V.copy(pullT[i]).lerp(pullT[j], u).applyMatrix4(root.matrixWorld);
          st.distT = st.dist0 - 0.12 * (0.5 + 0.5 * Math.sin(t * 0.3)); st.lookT.copy(st.look0); }
        else V.copy(st.hit);
        st.look.lerp(st.lookT, kk); st.dist += (st.distT - st.dist) * kk;
        c.position.set(st.look.x, st.look.y, st.look.z + st.dist); c.lookAt(st.look); c.fov = 24; c.updateProjectionMatrix();
        const fd = c.position.distanceTo(V); st.f = st.f ? st.f + (fd - st.f) * Math.min(1, dt * 12) : fd; B.bokeh.uniforms.focus.value = st.f;
        B.comp.render();
      }
      raf = vis && !REDUCE ? requestAnimationFrame(frame) : 0;
    }
    // клік: промінь у сцену → точка; різкість туди, камера трохи підводиться до неї; автоматика стоп
    function bindClick(view, st, objs) {
      const btn = view.parentElement.querySelector('.sk-sc__auto');
      view.addEventListener('click', (e) => { const r = view.getBoundingClientRect(); NDC.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(NDC, st.S.cam); const h = ray.intersectObjects(objs, true).find((x) => x.object.visible);
        if (!h) return; st.hit = h.point.clone(); st.auto = false; st.lookT.copy(st.look0).lerp(st.hit, 0.45); st.distT = st.dist0 * 0.78; btn.hidden = false;
        if (window.SK_SND) SK_SND.fx('station', 2); if (REDUCE) frame(performance.now()); });
      btn.addEventListener('click', () => { st.auto = true; st.hit = null; btn.hidden = true; });
    }
    bindClick(vTilt, sA, [aL, aT, aR, A.scene.children.find((o) => o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry')].filter(Boolean));
    bindClick(vPull, sB, [root]);
    window.__skStage = () => ({ tilt: { auto: sA.auto, f: +sA.f.toFixed(3), dist: +sA.dist.toFixed(3) }, pull: { auto: sB.auto, f: +sB.f.toFixed(3), dist: +sB.dist.toFixed(3) } });
    const io = new IntersectionObserver((es) => { es.forEach((e) => { const bit = e.target === vTilt ? 1 : 2; vis = e.isIntersecting ? vis | bit : vis & ~bit; });
      if (vis && !raf) raf = requestAnimationFrame(frame); }, { threshold: 0.1 });
    io.observe(vTilt); io.observe(vPull);
    host.classList.add('ready');
  }).catch((e) => { console.warn('sk-stage: моделі не завантажились', e); });
}
