/* Стаття 34: чорна діра й червоточина на three.js — промені світла рахуються у фрагментному шейдері.
   Чорна діра: невращаюча (Шварцшильд), одиниці — радіус горизонту r_s = 1. Промінь іде кроками,
   прискорення a = −1,5·h²·r/|r|⁵ (h — момент імпульсу променя) дає точну форму світлових траєкторій.
   Диск — тонкий, у площині y = 0, від 3 до 12 r_s, з шуму. Режим «насправді» додає доплерівське
   підсилення й гравітаційне почервоніння; «як у фільмі» — без них, як вирішила команда Нолана.
   Червоточина — схема за статтею James et al. 2015: усередині кулі видно інше небо, біля краю — лінзування. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { makeSky } from './space-bg.js?v=20261019083324';
import { gradePass } from './is-post.js?v=20261019083324';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const COMMON = `
  uniform vec2 uRes; uniform float uT; uniform vec3 uCam; uniform mat3 uRot; uniform float uFov; uniform samplerCube uSky; uniform samplerCube uSky2;
  vec3 h3(vec3 p){ p=fract(p*vec3(.1031,.103,.0973)); p+=dot(p,p.yxz+33.33); return fract((p.xxy+p.yxx)*p.zyx)*2.-1.; }
  float n3(vec3 p){ vec3 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
    return mix(mix(mix(dot(h3(i),f),dot(h3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(h3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(h3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
               mix(mix(dot(h3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(h3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(h3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(h3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }
  float fbm(vec3 p){ float s=0., a=.5; for(int k=0;k<5;k++){ s+=a*n3(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }
  float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
  // небо: зорі (сітка напрямків) і слабка туманність; tint — щоб «інше небо» за червоточиною відрізнялося
  vec3 sky(vec3 d, vec3 tint, float seed){
    vec3 col = vec3(0.);
    for (int l=0; l<3; l++){ float sc = 60. + float(l)*70.;
      vec3 q = d*sc + seed*13.1; vec3 id = floor(q), f = fract(q)-.5;
      float h = hash(id + float(l)*7.3);
      if (h > .965) { vec3 off = (vec3(hash(id+1.3),hash(id+2.7),hash(id+4.1))-.5)*.6;
        float s = smoothstep(.09, 0., length(f-off)) * (h-.965)*28.;
        col += s * mix(vec3(.75,.85,1.), vec3(1.,.85,.65), hash(id+9.));
      } }
    float neb = smoothstep(.0,.6, fbm(d*2.2 + seed)) * (.4 + .6*exp(-pow(dot(d, normalize(vec3(.3,.9,.2))),2.)*3.));
    col += tint * pow(neb, 1.6) * .35;
    return col;
  }
  vec3 rayDir(){ vec2 uv = (gl_FragCoord.xy - .5*uRes) / uRes.y; return normalize(uRot * vec3(uv * uFov, -1.)); }
`;

const BH = `
  uniform float uReal;     // 0 — як у фільмі, 1 — насправді
  // параметри диска — з панелі налаштувань
  uniform float uSwirl, uNoise, uRelief, uRamp1, uRamp2, uEmis, uAbs, uThick, uOuter, uFlow, uPlume, uPatch; uniform vec3 uCol1, uCol2, uGlow;
  // об'ємний диск: густина газу — гаусіан по висоті, товщина росте з радіусом; з краю — пухнасті «клапті»
  float dens(vec3 p, float r, out float ang){
    ang = atan(p.z, p.x);
    float H = .03 + uThick*r;
    float rim = smoothstep(2.6, 3.4, r) * smoothstep(uOuter, uOuter - 5., r);
    // викиди: подекуди газ здіймається клубами над і під площиною; клуби пливуть по орбіті (кутова швидкість ∝ r^-1,5)
    float a = ang + uT*uFlow*.6*pow(3./r, 1.5);
    vec3 pc = vec3(cos(a)*1.4, sin(a)*1.4, r*.55);                       // кут — по колу в просторі шуму, без шва
    float P = n3(pc*1.7)*.5 + .5;
    float plume = pow(smoothstep(.42, .9, P), 1.4) * uPlume;
    float Hl = H * (1. + plume*7.);
    // рваний край: шум уздовж висоти — пасма, витягнуті вгору
    float edge = n3(vec3(pc.xy*5., p.y*4.5/(1. + plume*2.) - uT*.08)) * .5 + .5;
    float fluff = .55 + .9*edge;
    float y = abs(p.y) / (Hl*fluff);
    return exp(-y*y*(1. - .55*plume) - y*.35*plume) * rim;
  }
  void main(){
    vec3 d = rayDir(), p = uCam;
    vec3 h = cross(p, d); float h2 = dot(h, h);
    vec3 col = vec3(0.); float tr = 1.;              // tr — скільки світла ще проходить крізь газ
    bool hole = false;
    bool done = false;
    // jitter (як у singularity): кожен піксель стартує з випадковим зсувом на частку кроку — замість смуг-«сходинок»
    // від однакових кроків маємо дрібне зерно, яке ховає сяйво й грейд
    float jit = hash(vec3(gl_FragCoord.xy, 7.));                        // сталий для пікселя: без мерехтіння країв від кадру до кадру
    for (int i=0; i<520; i++){
      float r = length(p);
      if (r < 1.) { hole = true; break; }
      if (r > 70. && dot(p, d) > 0.) { done = true; break; }
      float dt = clamp(.07*r, .02, 1.5);
      float rq = length(p.xz);
      if (rq > 2.4 && rq < 14.5) dt = min(dt, max(.03, abs(p.y)*.35 + .025));   // біля диска — дрібний крок
      dt *= .75 + .5*fract(jit + float(i)*.618034);                        // довжина кожного кроку трохи «гуляє»
      vec3 acc = -1.5*h2*p/pow(r, 5.);
      if (rq > 2.4 && rq < 14.5 && abs(p.y) < 1.2) {
        float ang; float rho = dens(p, rq, ang);
        if (rho > .002) {
          // завихрення: шум читаємо в координатах, повернутих на кут, що росте з радіусом, — газ закручується спіраллю
          // струмені вздовж орбіти: шум у полярних координатах (кут — по колу в просторі шуму, щоб не було шва),
          // кут зсунутий на радіус — газ закручується спіраллю; по радіусу шум частіший, ніж по колу, — клуби витягнуті
          float an = ang - rq*uSwirl + uT*uFlow*pow(3./rq, 1.5);
          vec3 pp = vec3(cos(an)*1.7, sin(an)*1.7, rq*uNoise*4.);
          float N  = n3(pp + vec3(0., 0., p.y*.8))*.5 + n3(pp*vec3(2.,2.,2.6) + 5.)*.3 + n3(pp*vec3(4.,4.,6.) + 9.)*.2;
          vec3 pq = pp + vec3(0., 0., .025);
          float N2 = n3(pq + vec3(0., 0., p.y*.8))*.5 + n3(pq*vec3(2.,2.,2.6) + 5.)*.3 + n3(pq*vec3(4.,4.,6.) + 9.)*.2;
          // шкала кольору: значення = радіус + шум + «рельєф» (різниця двох близьких зразків шуму дає тіні між клубами)
          float v = (rq - 3.)/11. + (N - .05)*.45 + (N - N2)*uRelief;
          vec3 c = v < uRamp1 ? uCol1 : v < uRamp2 ? mix(uCol1, uCol2, (v-uRamp1)/(uRamp2-uRamp1)) : mix(uCol2, vec3(0.), clamp((v-uRamp2)/(1.-uRamp2), 0., 1.));
          float heat = pow(3./rq, 1.5);
          float E = uEmis * (.1 + .9*heat*heat);
          // нерівномірність: великі ділянки пекучі, інші тьмяні — як у живого диска
          float bigN = n3(vec3(cos(an)*.9, sin(an)*.9, rq*.22 + uT*.01))*.5 + .5;
          E *= mix(1., .2 + 2.2*bigN*bigN*bigN, uPatch);                 // внутрішній край розпечений, зовнішній — тьмяний
          c = mix(c, vec3(1., .9, .72), smoothstep(.45, 1., heat) * .4);   // біля діри газ біло-гарячий
          if (uReal > .5) {
            // g = √(1 − r_s/r) / (γ(1 − v·n)); v = √(r_s / 2(r − r_s)), n = −d
            vec3 vdir = normalize(vec3(-p.z, 0., p.x)); float vv = sqrt(.5/(rq-1.)), gam = 1./sqrt(1.-vv*vv);
            float g = sqrt(1. - 1./rq) / (gam*(1. + vv*dot(vdir, d)));
            E *= pow(g, 3.);
            c = mix(c*vec3(1.,.7,.5), c*vec3(.78,.88,1.2), smoothstep(.75, 1.25, g));
          }
          c += uGlow;                                         // слабке власне світіння навіть темного газу
          rho *= smoothstep(-.25, .25, N + .1);                                  // рвані краї хмар
          float a = rho * dt * uAbs;                                             // газ щільний: видно поверхню хмар                                           // поглинання: зовнішній холодний газ — темна смуга
          col += tr * c * E * rho * dt;
          tr *= exp(-a);
        }
      }
      p += d*dt; d = normalize(d + acc*dt);
      if (tr < .01) break;
    }
    if (!hole && done) col += tr * textureCube(uSky, d).rgb;   // промінь, що так і не вирвався (крутився біля фотонної сфери), — чорний          // небо статті 33, зігнуте діркою
    gl_FragColor = vec4(col, 1.);
  }`;

const WH = `
  uniform float uA;        // радіус «горла» на сцені
  uniform float uSide;     // 0 — ми біля Сатурна, 1 — після стрибка: по той бік горла (небеса поміняно місцями, Сатурн — за горлом)
  // Сатурн: куля з поясами і кільця, освітлені збоку
  vec4 saturn(vec3 ro, vec3 rd){
    vec3 c = vec3(-34., 7., -58.); float R = 5.;
    vec4 res = vec4(0.); float tS = 1e9;
    vec3 oc = ro - c; float b = dot(oc, rd), q = dot(oc, oc) - R*R, D = b*b - q;
    if (D > 0.) { tS = -b - sqrt(D);
      if (tS > 0.) { vec3 n = normalize(ro + rd*tS - c); float lat = n.y;
        vec3 base = mix(vec3(.85,.72,.5), vec3(.95,.86,.68), .5+.5*sin(lat*26. + n3(n*5.)*2.));
        float lam = max(dot(n, normalize(vec3(1.,.3,.4))), 0.);
        res = vec4(base*(.04 + lam*.95), 1.); } else tS = 1e9; }
    // кільця в площині, нахиленій до нас
    vec3 rn = normalize(vec3(.12, 1., .32)); float den = dot(rd, rn);
    if (abs(den) > 1e-4) { float tr = dot(c - ro, rn)/den;
      if (tr > 0.) { vec3 pr = ro + rd*tr - c; float rr = length(pr);
        if (rr > R*1.25 && rr < R*2.3) { float band = .5 + .5*sin(rr*9.) * n3(vec3(rr*3.,0.,0.));
          float shade = (tr < tS) ? 1. : 0.;
          vec4 ring = vec4(vec3(.9,.82,.68)*(.25+.6*band), .75*band + .2);
          if (tr < tS) res = vec4(mix(res.rgb, ring.rgb, ring.a), max(res.a, ring.a));
          else if (res.a < 1.) res = vec4(ring.rgb*ring.a, ring.a); } } }
    return res;
  }
  // інше небо: ті самі туманності, перефарбовані в пурпурово-бузкові — інша галактика
  vec3 far(vec3 dd) { vec3 o = textureCube(uSky2, dd).rgb;
    vec3 c = vec3(o.r*1.7 + o.b*.5, o.g*.8 + o.b*.3, o.b*1.5 + o.r*.2) * 1.9;
    return c + vec3(.55,.25,.7) * pow(max(fbm(dd*1.4 + 3.), 0.), 2.) * .9; }        // додаткова густа туманність по той бік
  void main(){
    vec3 d = rayDir(), ro = uCam;
    // прицільна відстань променя до центру червоточини (центр у 0)
    float tc = -dot(ro, d); vec3 cp = ro + d*tc; float b = length(cp);
    vec3 col;
    if (tc > 0. && b < uA) {
      // промінь пройшов крізь горло: інше небо, розвернуте тим сильніше, чим ближче до краю
      float k = b/uA; vec3 ax = normalize(cross(d, cp + vec3(1e-4)));
      float ang = 3.14159 * pow(k, 3.);
      vec3 dd = d*cos(ang) + cross(ax, d)*sin(ang) + ax*dot(ax, d)*(1.-cos(ang));
      if (uSide < .5) col = far(dd);
      else { col = textureCube(uSky, dd).rgb * 1.6; vec4 s = saturn(vec3(-34.,7.,-58.) + normalize(uCam)*62., dd); col = mix(col, s.rgb, s.a); }   // після стрибка крізь горло видно наш дім: наше небо й Сатурн
      col *= smoothstep(1., .9, k) * .9 + .1;
      col += vec3(.75,.85,1.) * pow(k, 9.) * .35;                                      // край горла світлішає — те саме кільце зсередини
    } else {
      // наше небо, лінзоване біля краю: відхилення ~ a²/b
      float bend = (tc > 0.) ? uA*uA/(b*b+1e-3) * .9 : 0.;
      vec3 out_ = normalize(d - normalize(cp)*bend*.6);
      col = uSide < .5 ? textureCube(uSky, out_).rgb : far(out_) * .8;
      if (uSide < .5) { vec4 s = saturn(ro, out_); col = mix(col, s.rgb, s.a); }
      if (tc > 0.) { col += vec3(.65,.8,1.) * exp(-pow((b-uA)/(uA*.035), 2.)) * .9;   // тонкий світлий обідок — кільце Ейнштейна
        col += vec3(.45,.6,1.) * exp(-(b-uA)/(uA*.22)) * .07; }                        // м'яке сяйво назовні від кільця
    }
    gl_FragColor = vec4(col, 1.);
  }`;

function scene(box, frag, extra, opt) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: false }); } catch (e) { renderer = null; }
  if (!renderer) { box.insertAdjacentHTML('beforeend', '<div class="fail">Сцена не запустилась: браузер не дав доступу до WebGL. Решта статті працює без неї.</div>'); return null; }
  const scale = opt.scale || .75;
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1) * scale);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = opt.exposure ?? 1;   // як у прикладі singularity
  box.insertBefore(renderer.domElement, box.firstChild);
  const U = Object.assign({ uRes: { value: new THREE.Vector2() }, uT: { value: 0 }, uCam: { value: new THREE.Vector3() },
    uRot: { value: new THREE.Matrix3() }, uFov: { value: .9 } }, extra);
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: COMMON + frag, depthTest: false, depthWrite: false });
  // небо — те саме, що в статті 33 (space-bg.js), один раз знімаємо в кубічну текстуру; шейдер бере з неї колір уздовж зігнутого променя
  const cube = (o) => { const ss = new THREE.Scene(); ss.add(makeSky(THREE, o)); const rt = new THREE.WebGLCubeRenderTarget(1024);
    new THREE.CubeCamera(.1, 3000, rt).update(renderer, ss); return rt.texture; };
  // наше небо — з Чумацьким Шляхом (смуга проходить навскіс через кадр біля кулі/діри); за горлом — інша галактика, під іншим кутом і в бузкових тонах
  U.uSky = { value: cube({ spikes: 12, spikeSize: .26, stars: 9000, galaxy: { amount: .3, normal: [.6, .8, 0], core: [-.56, .42, -.7] } }) };   // фон майже чорний, як у singularity
  U.uSky2 = { value: opt.sky2 ? cube({ seed: 11.3, starSeed: 7, spikes: 16, spikeSize: .3, amount: 1.5, stars: 9000,
    galaxy: { amount: 1.3, normal: [-.3, .9, .3], core: [.6, .2, -.77], edge: [.6, .45, .95], coreCol: [1, .7, .95] } }) : U.uSky.value };
  const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(sc, cam));
  // звичайна 3D-сцена поверх променевої (корабель): та сама камера, кут огляду як у шейдері — 2·atan(uFov/2)
  const fg = new THREE.Scene(), pcam = new THREE.PerspectiveCamera(2 * Math.atan(.45) * 180 / Math.PI, 1, .05, 500);
  const fgPass = new RenderPass(fg, pcam); fgPass.clear = false; fgPass.clearDepth = true; composer.addPass(fgPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), opt.bloom ?? .9, .3, .82); composer.addPass(bloom); composer.addPass(new OutputPass());
  // кіноплівка: віньєтка, зерно, хроматична аберація по краях
  const grade = gradePass(opt.grade || {}); composer.addPass(grade);
  // камера на сфері навколо центру: тягнути мишею — обертати, колесо — відстань
  const st = { yaw: opt.yaw ?? 0, pitch: opt.pitch ?? .12, dist: opt.dist ?? 22, drag: null, auto: !reduce };
  function resize() { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); composer.setSize(w, h);
    const v = new THREE.Vector2(); renderer.getDrawingBufferSize(v); U.uRes.value.copy(v); pcam.aspect = w / h; pcam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(box); resize();
  const el = renderer.domElement;
  let down = null;                                                     // клік = короткий дотик без зсуву (інакше — обертання)
  el.addEventListener('pointerdown', (e) => { st.drag = [e.clientX, e.clientY]; down = [e.clientX, e.clientY, performance.now()]; st.auto = false; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => { if (!st.drag) return; st.yaw -= (e.clientX - st.drag[0]) * .006; st.pitch = Math.max(-1.4, Math.min(1.4, st.pitch + (e.clientY - st.drag[1]) * .006)); st.drag = [e.clientX, e.clientY]; });
  el.addEventListener('pointerup', (e) => { st.drag = null;
    if (down && opt.onClick && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 6 && performance.now() - down[2] < 400) { const r = el.getBoundingClientRect(); opt.onClick((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1), pcam); }
    down = null; });
  el.addEventListener('wheel', (e) => { e.preventDefault(); st.dist = Math.max(opt.min || 6, Math.min(opt.max || 45, st.dist * (1 + Math.sign(e.deltaY) * .08))); }, { passive: false });
  let visible = false, last = performance.now(), t = 0;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: .02 }).observe(box);
  const m4 = new THREE.Matrix4(), eye = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), O = new THREE.Vector3();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (visible) {
      if (!reduce) t += dt;
      if (st.auto) st.yaw += dt * (opt.spin ?? .03);
      // «дихання» камери: ледь помітний повільний наїзд і погойдування, як у ручної камери на штативі з головою
      const br = (st.auto && !reduce) ? 1 : 0, bd = 1 + .025 * Math.sin(t * .21) * br, bp = .012 * Math.sin(t * .17 + 1.3) * br;
      eye.set(Math.sin(st.yaw) * Math.cos(st.pitch + bp), Math.sin(st.pitch + bp), Math.cos(st.yaw) * Math.cos(st.pitch + bp)).multiplyScalar(st.dist * bd);
      grade.tick(t, U.uRes.value.x, U.uRes.value.y);
      m4.lookAt(eye, O, up); U.uRot.value.setFromMatrix4(m4); U.uCam.value.copy(eye); U.uT.value = t;
      pcam.position.copy(eye); pcam.lookAt(O); if (opt.onFrame) opt.onFrame(t, dt, pcam);
      composer.render();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  st.quality = scale; const setQuality = (q) => { renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1) * q); resize(); };
  return { U, st, renderer, fg, bloom, grade, composer, setQuality, skyTex: U.uSky.value, pcam };
}

/* корабель (модель: ChatGPT → Tripo → Blender) — летить перед діркою; світло на нього — від диска. Лінзування його не торкається */
let ship = null, shipPiv = null;
// корабель тримаємо в кадрі: ліворуч унизу перед камерою, наче він летить поруч із глядачем
const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3();
function addShip(fg, s) {
  fg.add(new THREE.HemisphereLight(0xffe2c0, 0x0a1020, .5));
  const key = new THREE.DirectionalLight(0xffd0a0, 3.2); key.position.set(.2, .15, -1); fg.add(key);     // від диска за кораблем — тепле контрове світло
  const rim = new THREE.DirectionalLight(0xdfe8ff, .5); rim.position.set(-1, .8, 1.2); fg.add(rim);     // холодний відблиск зір
  try { const pm = new THREE.PMREMGenerator(s.renderer); fg.environment = pm.fromCubemap(s.skyTex).texture; fg.environmentIntensity = .35; } catch (e) {}
  const dl = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
  new GLTFLoader().setDRACOLoader(dl).load('assets/interstellar/ship.glb', (g) => {
    ship = g.scene; const b = new THREE.Box3().setFromObject(ship), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    ship.position.sub(c); const spin = new THREE.Group(); spin.add(ship); const k = 1.15 / Math.max(sz.x, sz.y, sz.z); const piv = new THREE.Group(); piv.add(spin); piv.scale.setScalar(k);
    piv.rotation.set(0, 0, -Math.PI / 2); fg.add(piv); ship = spin; shipPiv = piv;     // вісь хаба в моделі — X (перевірено в Blender: уздовж X найбільше вершин біля осі)
  }, undefined, () => {});
}

/* бокова панель налаштувань (lil-gui), згорнута; закрита за замовчуванням */
async function panel(s) {
  let GUI; try { ({ default: GUI } = await import('https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/+esm')); } catch (e) { return; }
  const U = s.U, g = new GUI({ container: bhBox, title: 'Налаштування' }); g.domElement.classList.add('bh-gui'); g.close();
  const r = g.addFolder('Рендер');
  r.add(s.renderer, 'toneMappingExposure', .3, 3, .01).name('Експозиція');
  r.add(s.st, 'quality', .4, 1.2, .05).name('Якість (роздільність)').onChange((v) => s.setQuality(v));
  r.add(s.grade.uniforms.uVig, 'value', 0, .8, .01).name('Віньєтка'); r.add(s.grade.uniforms.uGrain, 'value', 0, .15, .005).name('Зерно'); r.add(s.grade.uniforms.uCA, 'value', 0, 4, .05).name('Аберація');
  r.add(s.bloom, 'strength', 0, 3, .01).name('Bloom: сила'); r.add(s.bloom, 'radius', 0, 1, .01).name('Bloom: радіус'); r.add(s.bloom, 'threshold', 0, 1, .01).name('Bloom: поріг');
  const d = g.addFolder('Диск');
  const add = (k, a, b, st, n) => d.add(U[k], 'value', a, b, st).name(n);
  add('uSwirl', 0, 1.5, .01, 'Закрут'); add('uFlow', 0, .6, .01, 'Швидкість потоку'); add('uNoise', .05, 2, .01, 'Частота клубів');
  add('uRelief', 0, 80, .5, 'Рельєф клубів'); add('uEmis', 0, 40, .1, 'Світіння'); add('uAbs', 0, 20, .1, 'Щільність');
  add('uThick', 0, .08, .001, 'Товщина'); add('uOuter', 8, 20, .1, 'Зовнішній радіус');
  add('uPlume', 0, 2, .01, 'Висота викидів'); add('uPatch', 0, 1, .01, 'Нерівномірність');
  add('uRamp1', 0, .4, .005, 'Шкала: світле до'); add('uRamp2', .1, .9, .005, 'Шкала: темне до');
  const col = (k, n) => { const o = { c: '#' + new THREE.Color(...U[k].value.toArray()).getHexString() };
    d.addColor(o, 'c').name(n).onChange((v) => { const c = new THREE.Color(v); U[k].value.set(c.r, c.g, c.b); }); };
  col('uCol1', 'Колір 1 (гарячий)'); col('uCol2', 'Колір 2 (холодний)'); col('uGlow', 'Власне світіння');
  const c = g.addFolder('Камера'); c.add(s.st, 'dist', 5, 60, .1).name('Відстань').listen(); c.add(s.st, 'pitch', -1.4, 1.4, .01).name('Нахил').listen(); c.add(s.st, 'auto').name('Оберт').listen();
}

const bhBox = document.getElementById('bh');
if (bhBox) {
  const V = (v) => ({ value: v }), C3 = (r, g, b) => ({ value: new THREE.Vector3(r, g, b) });
  let probe = null;
  const s = scene(bhBox, BH, { uReal: V(0), uSwirl: V(.35), uFlow: V(.12), uNoise: V(.45), uRelief: V(26), uEmis: V(14), uAbs: V(4.5), uThick: V(.012), uOuter: V(14), uPlume: V(.3), uPatch: V(.7),
    uRamp1: V(.05), uRamp2: V(.42), uCol1: C3(1, .64, .32), uCol2: C3(.16, .045, .015), uGlow: C3(.02, .018, .012) }, { dist: 19, pitch: .035, bloom: .55, scale: innerWidth < 700 ? .6 : .7, exposure: 1.1, spin: .02, min: 5, max: 60, grade: { vignette: .42, grain: .05, ca: 1.6, sat: 1.18, tint: [1, .97, .92] }, onClick: (x, y, cam) => { if (!probe) probe = probes(s, bhBox); probe(x, y, cam); }, onFrame: (t, dt, cam) => { if (probes.step) probes.step(dt); if (!ship) return; if (!reduce) { ship.rotation.x = t * .3; shipPiv.rotation.x = .009 * Math.sin(t * .4); }     // вісь хаба (у моделі X) повернута вертикально: кільце паралельне диску, як у гіроскопа на екваторіальній орбіті; ледь помітне погойдування ±0,5°
    cam.getWorldDirection(_f); _r.crossVectors(_f, cam.up).normalize(); _u.crossVectors(_r, _f);
    shipPiv.position.copy(cam.position).addScaledVector(_f, 10).addScaledVector(_r, -3.1).addScaledVector(_u, -1.1); } });   // перед діркою, ліворуч, трохи нижче смуги диска — на темному тлі
  if (s) {
    const set = (v) => { s.U.uReal.value = v === 'real' ? 1 : 0;
      document.querySelectorAll('#bhMode button').forEach((b) => b.classList.toggle('on', b.dataset.m === v));
      document.querySelectorAll('.bhnote').forEach((n) => n.hidden = n.dataset.m !== v); };
    document.querySelectorAll('#bhMode button').forEach((b) => b.addEventListener('click', () => set(b.dataset.m)));
    document.querySelectorAll('#bhView button').forEach((b) => b.addEventListener('click', () => {
      s.st.pitch = +b.dataset.p; s.st.auto = false; document.querySelectorAll('#bhView button').forEach((x) => x.classList.toggle('on', x === b)); }));
    window.BH = s;
    panel(s);
    addShip(s.fg, s);
  }
}
/* ── 02: клік по сцені — «пробний промінь». Світло запускається з точки кліку (у площині, що проходить через діру поперек погляду)
   вбік, і летить за тим самим рівнянням, що й промені в шейдері: d²x/dλ² = −1,5·h²·x/r⁵ (r_s = 1). Видно, як воно згинається,
   обертається навколо діри (фотонна сфера — 1,5 r_s) або падає за горизонт. ── */
const RADS = 5;
{ const css = document.createElement('style'); css.textContent = '.bhprobe{position:absolute;left:14px;bottom:34px;max-width:min(460px,80%);font:500 12px/1.4 var(--mono);color:#cfe2ff;text-shadow:0 1px 4px #000;pointer-events:none;opacity:0;transition:opacity .4s}.bhprobe.on{opacity:1}';
  document.head.appendChild(css); }   // підпис-результат для 02 і 07
function probes(s, box) {
  const lines = [], V = (x, y, z) => new THREE.Vector3(x, y, z);
  const hud = document.createElement('span'); hud.className = 'bhprobe'; box.appendChild(hud);
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d'), gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, '#fff'); gr.addColorStop(.25, 'rgba(190,225,255,.8)'); gr.addColorStop(1, 'rgba(120,180,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false, blending: THREE.AdditiveBlending }));   // м'яка кругла «голівка» фотона
  function trace(p, d) {
    const pts = [p.clone()], x = p.clone(), v = d.clone().normalize(), a = new THREE.Vector3(); let rmin = 1e9, fate = 'out';
    for (let i = 0; i < 6000; i++) { const r = x.length(); rmin = Math.min(rmin, r); if (r < 1.01) { fate = 'in'; break; } if (r > 45 && x.dot(v) > 0) break;
      const h2 = a.crossVectors(x, v).lengthSq(), dl = Math.min(.25, Math.max(.01, .03 * r)); a.copy(x).multiplyScalar(-1.5 * h2 / Math.pow(r, 5));
      v.addScaledVector(a, dl).normalize(); x.addScaledVector(v, dl); if (i % 3 === 0) pts.push(x.clone()); }
    pts.push(x.clone()); return { pts, rmin, fate, out: v.clone() };
  }
  // анімація: промінь «біжить» ~1,6 с, потім згасає за 3 с
  probes.step = (dt) => { for (let i = lines.length - 1; i >= 0; i--) { const o = lines[i]; o.t += dt; const k = Math.min(1, o.t / 1.6), c = Math.max(2, Math.floor(o.n * k));
    o.g.setDrawRange(0, (c - 1) * RADS * 6); o.hd.position.copy(o.pts[Math.min(o.n - 1, c - 1)]); o.hd.material.opacity = k < 1 ? 1 : 0;
    o.m.opacity = o.t < 2 ? 1 : Math.max(0, 1 - (o.t - 2) / 3); if (o.t > 5) { kill(o); lines.splice(i, 1); } } };
  return function (nx, ny, cam) {
    const dir = V(nx, ny, .5).unproject(cam).sub(cam.position).normalize(), n = cam.position.clone().normalize();
    const t = -cam.position.dot(n) / dir.dot(n), p = cam.position.clone().addScaledVector(dir, t);   // перетин з площиною через діру поперек погляду
    if (p.length() < 2.2) p.setLength(2.2);
    const d0 = V().crossVectors(n, p).normalize();                                                    // вбік, поперек радіуса — промінь пролітає повз діру
    const tr = trace(p.clone().addScaledVector(d0, -14), d0);                                          // стартуємо здалеку, щоб було видно підліт
    // тонка трубка замість лінії (лінія завжди 1 px — на ретині її не видно); малюємо її поступово через drawRange по сегментах
    const SEG = tr.pts.length - 1, RAD = RADS, g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tr.pts), SEG, .045, RAD, false);
    const m = new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, depthTest: false, blending: THREE.AdditiveBlending });
    const ln = new THREE.Mesh(g, m); ln.renderOrder = 5; s.fg.add(ln); g.setDrawRange(0, 0);
    const hd = head.clone(); hd.material = head.material.clone(); hd.scale.setScalar(1.1); s.fg.add(hd);
    lines.push({ ln, g, m, hd, n: tr.pts.length, pts: tr.pts, t: 0 }); if (lines.length > 3) kill(lines.shift());
    const defl = Math.acos(Math.max(-1, Math.min(1, tr.out.dot(d0)))) * 180 / Math.PI;
    hud.textContent = tr.fate === 'in' ? `промінь підійшов ближче за 1,5 r_s — фотонну сферу — і впав за горизонт` :
      tr.rmin < 2 ? `пройшов на ${tr.rmin.toFixed(2).replace(".", ",")} r_s — майже біля фотонної сфери; повернув на ${Math.round(defl)}°` : `пройшов на ${tr.rmin.toFixed(1).replace(".", ",")} r_s від центру й відхилився на ${Math.round(defl)}°`;
    hud.classList.add('on'); clearTimeout(hud.t); hud.t = setTimeout(() => hud.classList.remove('on'), 5000);
  };
  function kill(o) { s.fg.remove(o.ln); s.fg.remove(o.hd); o.g.dispose(); o.m.dispose(); }
}

const whBox = document.getElementById('wh');
/* ── 07: клік — короткий «стрибок» крізь горло: камера пірнає в горло (спалах, хроматичне розщеплення), виринає по той бік
   і дивиться назад — тепер у горлі видно наш дім (Сатурн), а навколо — чуже небо. Ще клік — назад. ── */
function jumper(s, box) {
  const hud = document.createElement('span'); hud.className = 'bhprobe'; box.appendChild(hud);
  let busy = false;
  return function () { if (busy) return; busy = true; const d0 = s.st.dist, t0 = performance.now(), b0 = s.bloom.strength, ca0 = s.grade.uniforms?.uCA?.value;
    window.IS_SOUND && IS_SOUND.fx && IS_SOUND.fx('whoosh'); let flipped = false;
    (function f(now) { const u = Math.min(1, (now - t0) / 2600), dive = u < .5 ? u / .5 : (1 - u) / .5, e = dive * dive * (3 - 2 * dive);
      s.st.dist = u < .5 ? d0 + (.4 - d0) * e : .4 + (d0 - .4) * (1 - e);
      s.bloom.strength = b0 + 2.2 * e; if (ca0 != null) s.grade.uniforms.uCA.value = ca0 + 9 * e;
      if (u >= .5 && !flipped) { flipped = true; s.U.uSide.value = 1 - s.U.uSide.value; s.st.yaw += Math.PI;
        hud.textContent = s.U.uSide.value ? 'ви по той бік: у горлі — наш Сатурн, навколо — чужа галактика. Клік — назад' : 'знову біля Сатурна'; hud.classList.add('on');
        clearTimeout(hud.t); hud.t = setTimeout(() => hud.classList.remove('on'), 5000); }
      if (u < 1) requestAnimationFrame(f); else { s.st.dist = d0; s.bloom.strength = b0; if (ca0 != null) s.grade.uniforms.uCA.value = ca0; busy = false; } })(t0);
  };
}
let jump = null;
if (whBox) { const s = scene(whBox, WH, { uA: { value: 3 }, uSide: { value: 0 } }, { onClick: () => { if (!jump) jump = jumper(window.WH, whBox); jump(); }, dist: 16, pitch: .05, yaw: .35, bloom: .75, spin: .025, min: 5, max: 40, sky2: true, grade: { vignette: .4, grain: .045, ca: 1.8, sat: 1.1, tint: [.97, .98, 1.03] } }); if (s) window.WH = s; }
