/* Небо для 3D-сцен статті 33: туманності з шуму у шейдері (синьо-фіолетові хмари й
   помаранчевий пил), три шари зір різної яскравості й кольору, найяскравіші — з променями.
   Усе процедурне: жодних картинок неба, тож нічого не треба вантажити. */
export function makeSky(THREE, opts = {}) {
  const R = opts.radius || 900, group = new THREE.Group();

  /* ── туманності: сфера зсередини, колір рахується з напрямку погляду ── */
  const neb = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uSeed: { value: opts.seed || 3.7 }, uAmt: { value: opts.amount ?? 1 }, uCore: { value: opts.core ?? 1 } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec3 vDir; uniform float uSeed; uniform float uAmt; uniform float uCore;
      vec3 hash3(vec3 p){ p = fract(p*vec3(.1031,.1030,.0973)); p += dot(p, p.yxz+33.33); return fract((p.xxy+p.yxx)*p.zyx)*2.-1.; }
      float noise(vec3 p){ vec3 i=floor(p), f=fract(p); vec3 u=f*f*(3.-2.*f);
        return mix(mix(mix(dot(hash3(i),f), dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                       mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)), dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
                   mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)), dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                       mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)), dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }
      float fbm(vec3 p){ float s=0., a=.5; for(int k=0;k<6;k++){ s+=a*noise(p); p*=2.03; a*=.5; } return s; }
      void main(){
        vec3 d = vDir + uSeed;
        float band = exp(-pow(dot(vDir, normalize(vec3(.35,.25,.9))), 2.) * 3.2);   // «молочний шлях» — смуга через небо
        float c = fbm(d*1.6), c2 = fbm(d*3.1 + 7.);
        float blue = smoothstep(.0, .55, c) * (.35 + .65*band) * mix(.75, 1., uCore);
        float dust = pow(smoothstep(.15, .6, c2), 2.) * band;
        float dark = smoothstep(.1, .45, fbm(d*4.3 - 3.)) * band;                 // темні пилові прожилки
        // насичений синій і вищий контраст: темне тло темніше, ядра хмар яскравіші
        blue = smoothstep(.08, .9, blue);
        vec3 col = vec3(.003,.004,.012);
        col += vec3(.05,.12,.62) * pow(blue, 1.35) * .95;
        col += vec3(.22,.42,1.0) * pow(blue, 3.5) * .65 * uCore;            // яскраві ядра хмар (у симуляції вимкнені)
        col += vec3(.32,.10,.42) * pow(blue, 2.2) * .22;
        col += vec3(.60,.25,.06) * dust * .34;
        col *= 1. - dark * .72;
        gl_FragColor = vec4(col * uAmt, 1.);
      }` }));
  neb.renderOrder = -10; group.add(neb);

  /* ── зорі: три шари. Розмір і яскравість — атрибути точки ── */
  const rnd = (s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(opts.starSeed || 99);
  const N = 5200, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N);
  const tint = [[.75, .85, 1], [1, 1, 1], [1, .93, .8], [1, .78, .6]];
  for (let i = 0; i < N; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), r = R * .92;
    let x = s * Math.cos(th), y = s * Math.sin(th), z = u;
    // частину зір стягуємо до смуги — небо виходить неоднорідним, як справжнє
    if (rnd() < .45) { const n = [.35, .25, .9], l = Math.hypot(...n), k = (x * n[0] + y * n[1] + z * n[2]) / l * .75; x -= n[0] / l * k; y -= n[1] / l * k; z -= n[2] / l * k; const m = Math.hypot(x, y, z); x /= m; y /= m; z /= m; }
    pos.set([x * r, y * r, z * r], i * 3);
    const t = tint[Math.floor(rnd() * tint.length)], b = Math.pow(rnd(), 3) * .9 + .1;
    col.set([t[0] * b, t[1] * b, t[2] * b], i * 3); size[i] = 1 + Math.pow(rnd(), 6) * 3.5;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const stars = new THREE.Points(g, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uPx: { value: Math.min(2, window.devicePixelRatio || 1) } },
    vertexShader: 'attribute float size; varying vec3 vC; uniform float uPx; void main(){ vC = color; gl_PointSize = size * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vC; void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,0.,d); gl_FragColor = vec4(vC*a, a); }' }));
  group.add(stars);

  /* ── яскраві зорі з променями (спрайти) ── */
  const spike = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g2 = x.createRadialGradient(64, 64, 0, 64, 64, 40); g2.addColorStop(0, 'rgba(255,255,255,1)'); g2.addColorStop(.12, 'rgba(255,255,255,.8)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g2; x.fillRect(0, 0, 128, 128);
    x.globalCompositeOperation = 'lighter';
    [[0, 1], [1, 0]].forEach(([a, b]) => { const lg = x.createLinearGradient(64 - 64 * a, 64 - 64 * b, 64 + 64 * a, 64 + 64 * b);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, 'rgba(255,255,255,.85)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = lg; if (a) x.fillRect(0, 63, 128, 2); else x.fillRect(63, 0, 2, 128); });
    return new THREE.CanvasTexture(c); })();
  for (let i = 0; i < (opts.spikes ?? 26); i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), r = R * .9;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: spike, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      color: new THREE.Color().setHSL(rnd() < .5 ? .6 : .08, .45, .8) }));
    sp.position.set(s * Math.cos(th) * r, s * Math.sin(th) * r, u * r); sp.scale.setScalar(R * (opts.spikeSize || 1) * (.012 + rnd() * .02)); group.add(sp);
  }
  return group;
}
