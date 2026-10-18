/* Стаття 33, розділ 05: точки Лагранжа в 3D. Система відліку обертається разом із двома
   важкими тілами, тож вони стоять на місці, а точки L1–L5 — нерухомі позначки.
   Розрахунок точок — window.TB.lag (shared/threebody.js). Троянці Юпітера рахуються за
   справжніми рівняннями обмеженої задачі трьох тіл у системі, що обертається.
   Розміри тіл збільшено, інакше їх не видно; де збільшено й відстані — сказано в підписі. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeSky } from './space-bg.js?v=20261018205354';

const box = document.getElementById('lag3'), card = document.getElementById('lagCard'), cap = document.getElementById('lagScale');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = 10;                                   // відстань між важкими тілами в одиницях сцени
const TEX = 'assets/threebody/tex/';

const SYS = {
  se: { name: 'Сонце — Земля', mu: 3.003e-6, big: 'sun', small: 'earth', bigR: 1.15, smallR: .48, exag: 2.6,
    craft: { L1: 'SOHO', L2: '«Джеймс Вебб»' },
    about: 'μ ≈ 3·10⁻⁶: Земля в 333 тисячі разів легша за Сонце. L1 і L2 лежать приблизно за 1,5 млн км від Землі — у сто разів ближче, ніж до Сонця.',
    scale: 'Розміри тіл збільшено, а відстань від Землі до L1 і L2 на сцені — у кілька разів більша, ніж насправді, інакше точки сховались би за Землею.' },
  em: { name: 'Земля — Місяць', mu: 0.0121505, big: 'earth', small: 'moon', bigR: .78, smallR: .22,
    craft: { L2: '«Цюецяо»' },
    about: 'μ ≈ 0,012: Місяць у 81 раз легший за Землю. L1 — приблизно за 326 тисяч км від Землі, за 58 тисяч км від Місяця.',
    scale: 'Розміри Землі й Місяця збільшено; відстані між тілами й точками — у масштабі.' },
  sj: { name: 'Сонце — Юпітер', mu: 0.000954, big: 'sun', small: 'jupiter', bigR: 1.15, smallR: .46, trojans: true,
    craft: {},
    about: 'μ ≈ 0,001: Юпітер у тисячу разів легший за Сонце. У L4 і L5 зібралися понад десять тисяч відомих троянських астероїдів; рух рою нижче порахований за законом тяжіння.',
    scale: 'Розміри Сонця й Юпітера збільшено; положення точок і рух троянців — у масштабі. Нахил орбіт астероїдів показано умовно.' },
};
const NOTE = {
  L1: { t: 'L1 — між тілами', b: 'Тут притягання двох тіл і відцентрова сила врівноважуються на прямій між ними. Точка нестійка: апарати літають навколо неї й регулярно підправляють орбіту.' },
  L2: { t: 'L2 — за меншим тілом', b: 'Теж на прямій, але з зовнішнього боку. Нестійка. Для телескопів зручна тим, що Сонце, Земля й Місяць завжди з одного боку — їх легко затулити одним щитом.' },
  L3: { t: 'L3 — по той бік більшого тіла', b: 'Майже на орбіті меншого тіла, але навпроти нього. Нестійка й далека; апаратів тут немає.' },
  L4: { t: 'L4 — попереду на орбіті', b: 'Вершина рівностороннього трикутника з двома тілами. Стійка, якщо менше тіло легше за ~4% загальної маси: тіло, що звідси зісковзує, сила Коріоліса заводить на петлю навколо точки.' },
  L5: { t: 'L5 — позаду на орбіті', b: 'Дзеркальна до L4 і так само стійка за малої маси меншого тіла.' },
};
const CRAFT = {
  SOHO: 'Сонячна обсерваторія ESA і NASA, з 1996 року в околі L1: бачить Сонце безперервно, без затемнень.',
  '«Джеймс Вебб»': 'Інфрачервоний телескоп NASA, ESA і CSA, з 2022 року на гало-орбіті навколо L2.',
  '«Цюецяо»': 'Китайський супутник-ретранслятор (2018) на гало-орбіті навколо L2 системи Земля — Місяць: тримає зв’язок із апаратами на зворотному боці Місяця.',
};

let started = false;
new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; init(); } }, { rootMargin: '400px' }).observe(box);

function init() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { renderer = null; }
  if (!renderer) { box.insertAdjacentHTML('beforeend', '<div class="fail">Тривимірна сцена не запустилась: браузер не дав доступу до WebGL.</div>'); window.LAG3 = { ok: false }; return; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  box.insertBefore(renderer.domElement, box.firstChild);
  const labels = new CSS2DRenderer(); labels.domElement.className = 'lag3__labels'; box.appendChild(labels.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .05, 3000);
  scene.background = new THREE.Color('#04050a');
  const controls = new OrbitControls(camera, labels.domElement);
  controls.enableDamping = true; controls.dampingFactor = .08; controls.autoRotateSpeed = .25;
  scene.add(makeSky(THREE, { seed: 9.1, starSeed: 41 }));
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .5, .35, .7); composer.addPass(bloom); composer.addPass(new OutputPass());
  scene.add(new THREE.AmbientLight(0xffffff, .06));

  const loader = new THREE.TextureLoader(), tex = {};
  const T = (n) => tex[n] || (tex[n] = loader.load(TEX + n + '.jpg', (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; }));

  // Сонце: шейдер із рухомою грануляцією + сяйво
  const sunMat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 } },
    vertexShader: 'varying vec3 vP; varying vec3 vN; void main(){ vP = position; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vP; varying vec3 vN; uniform float uT;
      vec3 h3(vec3 p){ p=fract(p*vec3(.1031,.103,.0973)); p+=dot(p,p.yxz+33.33); return fract((p.xxy+p.yxx)*p.zyx)*2.-1.; }
      float n3(vec3 p){ vec3 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(mix(dot(h3(i),f),dot(h3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(h3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(h3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
                   mix(mix(dot(h3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(h3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(h3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(h3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }
      void main(){ vec3 p = normalize(vP)*5.;
        float g = n3(p*2.+uT*.15)*.6 + n3(p*5.-uT*.25)*.3 + n3(p*11.+uT*.4)*.15;
        float spots = smoothstep(.35,.55, n3(p*1.3+vec3(uT*.02)));
        float limb = pow(max(dot(vN, vec3(0,0,1)),0.), .45);
        vec3 c = mix(vec3(1.,.42,.08), vec3(1.,.86,.55), .55+g);
        c *= 1. - spots*.45; c *= .55 + .65*limb;
        gl_FragColor = vec4(c*1.2, 1.); }` });
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,200,130,.55)'); g.addColorStop(.25, 'rgba(255,150,60,.16)'); g.addColorStop(1, 'rgba(255,120,30,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
  const ringTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.strokeStyle = 'rgba(234,82,18,1)'; x.lineWidth = 7; x.beginPath(); x.arc(64, 64, 46, 0, 7); x.stroke();
    x.fillStyle = 'rgba(234,82,18,1)'; x.beginPath(); x.arc(64, 64, 9, 0, 7); x.fill(); return new THREE.CanvasTexture(c); })();

  function body(kind, r) {
    const g = new THREE.Group();
    if (kind === 'sun') {
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), sunMat));
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(r * 4.2); g.add(s);
      const L = new THREE.PointLight(0xfff1dc, 3.2, 0, 0); g.add(L); g.userData.light = L;
    } else if (kind === 'earth') {
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), new THREE.MeshPhongMaterial({ map: T('earth_daymap'), emissiveMap: T('earth_nightmap'),
        emissive: new THREE.Color('#ffc580'), emissiveIntensity: .35, shininess: 12, specular: new THREE.Color('#223355') })));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.015, 64, 48), new THREE.MeshPhongMaterial({ alphaMap: T('earth_clouds'), color: 0xffffff, transparent: true, depthWrite: false, opacity: .9 })));
      // тонка атмосфера по краю
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 48, 32), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
        fragmentShader: 'varying vec3 vN; void main(){ float a = pow(.75 - dot(vN, vec3(0,0,1)), 3.); gl_FragColor = vec4(.35,.6,1.,1.)*a*.9; }' })));
    } else {
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), new THREE.MeshPhongMaterial({ map: T(kind), shininess: 4 })));
    }
    g.rotation.x = Math.PI / 2;                  // текстура: полюси вгору (вісь z — «вгору» сцени)
    return g;
  }

  const world = new THREE.Group(); scene.add(world);
  const S = { sys: 'se', mode: 'space', sel: null, troj: null, crafts: [], t: 0 };

  function label(text, cls, onClick) {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'lag3__lbl ' + (cls || ''); el.textContent = text;
    el.addEventListener('pointerdown', (e) => e.stopPropagation()); el.addEventListener('click', (e) => { e.stopPropagation(); onClick && onClick(); });
    return new CSS2DObject(el);
  }

  function build() {
    world.clear(); S.crafts = []; S.troj = null;
    const cfg = SYS[S.sys], mu = cfg.mu, pts = window.TB.lag.points(mu);
    const xBig = -mu * D, xSmall = (1 - mu) * D;
    const big = body(cfg.big, cfg.bigR); big.position.set(xBig, 0, 0); world.add(big);
    const small = body(cfg.small, cfg.smallR); small.position.set(xSmall, 0, 0); world.add(small);
    S.spin = [big, small];
    if (cfg.big !== 'sun') {            // без Сонця в кадрі — світло здалеку
      const dl = new THREE.DirectionalLight(0xfff1dc, 2.6); dl.position.set(-30, 18, 6); world.add(dl);
    }
    world.add(label(cfg.big === 'sun' ? 'Сонце' : 'Земля', 'is-body')); world.children[world.children.length - 1].position.set(xBig, 0, -(cfg.bigR + .45));
    world.add(label({ earth: 'Земля', moon: 'Місяць', jupiter: 'Юпітер' }[cfg.small], 'is-body')); world.children[world.children.length - 1].position.set(xSmall, 0, -(cfg.smallR + .4));
    // орбіта меншого тіла — тонке коло
    const orb = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 257 }, (_, i) => { const a = i / 256 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * xSmall, Math.sin(a) * xSmall, 0); }));
    const ol = new THREE.Line(orb, new THREE.LineDashedMaterial({ color: 0x8a90a0, dashSize: .25, gapSize: .25, transparent: true, opacity: .35 })); ol.computeLineDistances(); world.add(ol);
    // точки Лагранжа: у системі Сонце — Земля L1 і L2 відсунуто від Землі, щоб їх було видно
    S.L = {};
    pts.forEach((p) => {
      let x = p.x * D, y = p.y * D;
      if (cfg.exag && (p.id === 'L1' || p.id === 'L2')) x = xSmall + Math.sign(x - xSmall) * cfg.exag;
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, depthTest: false })); m.scale.setScalar(.42); m.position.set(x, y, 0); world.add(m);
      const lb = label(p.id, 'is-pt', () => select(p.id)); lb.position.set(x, y, .45); world.add(lb);
      S.L[p.id] = new THREE.Vector3(x, y, 0);
    });
    // апарати на гало-орбітах (схематично: петля навколо точки поперек площини)
    Object.entries(cfg.craft).forEach(([pid, name], k) => {
      const c = S.L[pid], a = .55, b = .38;
      const loop = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 97 }, (_, i) => { const t = i / 96 * Math.PI * 2; return new THREE.Vector3(c.x, c.y + a * Math.cos(t), b * Math.sin(t)); }));
      world.add(new THREE.Line(loop, new THREE.LineBasicMaterial({ color: 0x9fc4ff, transparent: true, opacity: .45 })));
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 8), new THREE.MeshBasicMaterial({ color: 0xdfeaff })); world.add(dot);
      const lb = label(name, 'is-craft', () => select(pid, name)); world.add(lb);
      lb.visible = false; S.crafts.push({ c, a, b, dot, lb, ph: k * 2, pid });
    });
    if (cfg.trojans) makeTrojans(mu);
    cap.textContent = cfg.scale;
    select(S.sel && S.L[S.sel] ? S.sel : null);
    document.querySelectorAll('#lgSys button').forEach((b) => b.classList.toggle('on', b.dataset.s === S.sys));
  }

  /* ── троянці: обмежена задача трьох тіл у системі, що обертається (одиниці: D = 1, n = 1) ── */
  function makeTrojans(mu) {
    const N = 1600, st = new Float64Array(N * 4), z = new Float32Array(N), pos = new Float32Array(N * 3);
    let s = 12345; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < N; i++) {
      const side = i % 2 ? 1 : -1, phi = side * (Math.PI / 3) + (R() - .5) * .55, r = 1 + (R() - .5) * .025;
      st[i * 4] = r * Math.cos(phi) - mu; st[i * 4 + 1] = r * Math.sin(phi);          // старт поруч із L4 / L5, у спокої відносно системи
      z[i] = (R() - .5) * .9;                                                         // нахил орбіт — умовно, лише для об'єму
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xd9b48a, size: .07, transparent: true, opacity: .85, depthWrite: false })); world.add(pm);
    S.troj = { N, st, z, g, mu };
  }
  function trojStep(dt) {
    const T = S.troj; if (!T) return;
    const { N, st, mu } = T, f = (x, y, vx, vy, o) => {
      const r1 = Math.hypot(x + mu, y), r2 = Math.hypot(x - 1 + mu, y), a = (1 - mu) / (r1 * r1 * r1), b = mu / (r2 * r2 * r2);
      o[0] = vx; o[1] = vy; o[2] = 2 * vy + x - a * (x + mu) - b * (x - 1 + mu); o[3] = -2 * vx + y - a * y - b * y; };
    const k1 = [0, 0, 0, 0], k2 = [0, 0, 0, 0], k3 = [0, 0, 0, 0], k4 = [0, 0, 0, 0];
    for (let i = 0; i < N; i++) {
      const j = i * 4, x = st[j], y = st[j + 1], vx = st[j + 2], vy = st[j + 3];
      f(x, y, vx, vy, k1); f(x + k1[0] * dt / 2, y + k1[1] * dt / 2, vx + k1[2] * dt / 2, vy + k1[3] * dt / 2, k2);
      f(x + k2[0] * dt / 2, y + k2[1] * dt / 2, vx + k2[2] * dt / 2, vy + k2[3] * dt / 2, k3);
      f(x + k3[0] * dt, y + k3[1] * dt, vx + k3[2] * dt, vy + k3[3] * dt, k4);
      for (let k = 0; k < 4; k++) st[j + k] += dt / 6 * (k1[k] + 2 * k2[k] + 2 * k3[k] + k4[k]);
    }
  }
  function trojDraw() {
    const T = S.troj; if (!T) return; const p = T.g.attributes.position.array;
    for (let i = 0; i < T.N; i++) { p[i * 3] = T.st[i * 4] * D; p[i * 3 + 1] = T.st[i * 4 + 1] * D; p[i * 3 + 2] = T.z[i]; }
    T.g.attributes.position.needsUpdate = true;
  }

  function select(id, craft) {
    S.sel = id;
    box.querySelectorAll('.lag3__lbl.is-pt').forEach((e) => e.classList.toggle('on', e.textContent === id));
    S.crafts.forEach((c) => { c.lb.visible = c.pid === id; });
    const cfg = SYS[S.sys];
    let h = `<span class="k">${cfg.name}</span><p>${cfg.about}</p>`;
    if (id) { const n = NOTE[id]; h += `<b>${n.t}</b><p>${n.b}</p>`; const cr = craft || cfg.craft[id]; if (cr) h += `<p><b>${cr}.</b> ${CRAFT[cr]}</p>`;
      if (cfg.trojans && (id === 'L4' || id === 'L5')) h += '<p><b>Троянці.</b> Рій навколо точки — справжні рівняння руху: астероїди не стоять, а повільно гойдаються навколо точки витягнутими петлями.</p>'; }
    else h += '<p class="chint">Клікніть L1–L5 на сцені, щоб прочитати про точку.</p>';
    card.innerHTML = h;
  }

  function frame() {
    camera.position.set(-2, -21, 10.5); controls.target.set(D * .18, 0, 0); camera.up.set(0, 0, 1);
  }
  function resize() { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); composer.setSize(w, h); labels.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(box);

  let visible = true, last = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: .02 }).observe(box);
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (visible) {
      S.t += dt; sunMat.uniforms.uT.value = S.t;
      if (!reduce) S.spin.forEach((g, i) => { g.children[0].rotation.y += dt * (i ? .25 : .05); if (g.children[1] && g.children[1].isMesh) g.children[1].rotation.y += dt * .3; });
      S.crafts.forEach((c) => { const t = S.t * .6 + c.ph; c.dot.position.set(c.c.x, c.c.y + c.a * Math.cos(t), c.c.z + c.b * Math.sin(t)); c.lb.position.copy(c.dot.position).add(new THREE.Vector3(0, 0, .35)); });
      if (S.troj && !reduce) { for (let k = 0; k < 4; k++) trojStep(.02); }
      trojDraw();
      controls.autoRotate = !reduce; controls.update();
      composer.render(); labels.render(scene, camera);
    }
    requestAnimationFrame(loop);
  }
  document.querySelectorAll('#lgSys button').forEach((b) => b.addEventListener('click', () => { S.sys = b.dataset.s; build(); }));
  // стан з адреси — для знімків і посилань: ?lag=sj
  const q = new URLSearchParams(location.search);
  if (SYS[q.get('lag')]) S.sys = q.get('lag');
  resize(); frame(); build(); requestAnimationFrame(loop);
  window.LAG3 = { ok: true, S, build, scene, trojStep };
}
