/* Стаття 35, розділ 06: бочка нафти, «надрукована» грубими штрихами туші на папері — за ідеєю Ink Object з Canvas UI
   (canvasui.dev, David Haz; MIT + Commons Clause), переписано з нуля на three.js: власний шейдер штрихування.
   Тон поверхні (освітлення) → кілька шарів штрихів під різними кутами; шум рве лінії, як від ручного валика; контур — по нормалі до погляду.
   Бочка повільно пливе й обертається; клік — підкидає й показує обсяг. Модель — процедурна: циліндр із двома обручами. */
import * as THREE from 'three';

const host = document.getElementById('rcInk');
if (host) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: false }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); host.prepend(R.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 50); cam.position.set(0, .6, 6.2); cam.lookAt(0, 0, 0);
  const L = new THREE.Vector3(-.8, .5, .3).normalize();
  const U = { uL: { value: L }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uInk: { value: new THREE.Color(0x1d1a17) }, uPaper: { value: new THREE.Color(0xf3ecdf) }, uAcc: { value: 0 } };
  const ink = new THREE.ShaderMaterial({ uniforms: U,
    vertexShader: `varying vec3 vN, vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uL, uInk, uPaper; uniform float uT, uAcc; uniform vec2 uRes; varying vec3 vN, vV;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      // один шар штрихів: смуги під кутом a, товщина залежить від темряви; шум рве лінії й гне їх, «тремтить» раз на 0,25 с — як друк
      float hatch(vec2 p, float a, float dark, float k){ vec2 q = mat2(cos(a),-sin(a),sin(a),cos(a))*p; float j = floor(uT*4.);
        q.y += (n(q*.02 + j)*2. - 1.)*3.; float s = abs(fract(q.y/k) - .5)*2.; float w = dark*1.15; float br = smoothstep(.35,.6, n(q*vec2(.06,.6) + j*7.));
        return (1. - smoothstep(w - .15, w + .05, s)) * mix(.4, 1., br); }
      void main(){ vec3 N = normalize(vN), V = normalize(vV), Lv = normalize((viewMatrix*vec4(uL,0.)).xyz);
        float d = clamp(dot(N, Lv)*.5 + .5, 0., 1.), tone = 1. - d;   // 0 — світло, 1 — тінь
        vec2 p = gl_FragCoord.xy;
        float m = hatch(p, .7, smoothstep(.05, .7, tone), 6.);
        m = max(m, hatch(p, -.6, smoothstep(.35, .9, tone), 5.));
        m = max(m, hatch(p, 1.57, smoothstep(.6, 1., tone), 4.));
        float rim = smoothstep(.42, .15, abs(dot(N, V)));               // контур — де поверхня стає ребром до погляду
        m = max(m, rim * (.75 + .25*n(p*.3 + floor(uT*4.))));
        vec3 inkC = mix(uInk, vec3(.75,.16,.08), uAcc*.8);               // клік — на мить червоне чорнило
        gl_FragColor = vec4(mix(uPaper, inkC, clamp(m, 0., 1.)), 1.); }` });
  // бочка: циліндр + два обручі (тор) + кришка
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, 1.7, 64, 1), ink));
  [-.42, .42].forEach((y) => { const t = new THREE.Mesh(new THREE.TorusGeometry(.63, .035, 12, 64), ink); t.rotation.x = Math.PI / 2; t.position.y = y; g.add(t); });
  [-.85, .85].forEach((y) => { const t = new THREE.Mesh(new THREE.TorusGeometry(.6, .03, 10, 64), ink); t.rotation.x = Math.PI / 2; t.position.y = y; g.add(t); });
  const cap = new THREE.Mesh(new THREE.CircleGeometry(.12, 24), ink); cap.position.set(.25, .851, .1); cap.rotation.x = -Math.PI / 2; g.add(cap);
  g.rotation.z = .18; scene.add(g);
  scene.background = new THREE.Color(0xf3ecdf);
  const lab = host.querySelector('.rc-ink__lab');
  function size() { const w = host.clientWidth || 1, h = host.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); U.uRes.value.set(w, h); }
  let vis = false, raf = 0, t = 0, last = 0, jump = 0, spin = 0;
  function frame(now) { const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; t += dt; U.uT.value = t;
    jump = Math.max(0, jump - dt); const j = Math.sin(Math.min(1, (1.2 - jump) / 1.2) * Math.PI) * (jump > 0 ? 1 : 0);
    g.position.y = (REDUCE ? 0 : Math.sin(t * .8) * .08) + j * .5; spin += dt * (.35 + 4 * j); g.rotation.y = spin; g.rotation.z = .18 + Math.sin(t * .5) * .05;
    U.uAcc.value = j; R.render(scene, cam); raf = vis ? requestAnimationFrame(frame) : 0; }
  host.addEventListener('click', () => { jump = 1.2; if (lab) { lab.classList.remove('on'); void lab.offsetWidth; lab.classList.add('on'); } if (window.RC_SND) RC_SND.fx('thud'); if (!raf && vis) raf = requestAnimationFrame(frame); });
  new ResizeObserver(size).observe(host); size();
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis && !raf) { last = 0; raf = requestAnimationFrame(frame); } }, { threshold: .1 }).observe(host);
  if (REDUCE) { size(); R.render(scene, cam); }
}
