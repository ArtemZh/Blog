/* Зоря для симуляції статті 33: поверхня з грануляцією й плямами, корона зі струменями, м'яке сяйво.
   Ті самі шейдери, що й Сонце у розділі про точки Лагранжа, але колір задається параметром —
   щоб показати зорі різної температури (біло-блакитна, жовта, червона). */
const NOISE = `
  vec3 h3(vec3 p){ p=fract(p*vec3(.1031,.103,.0973)); p+=dot(p,p.yxz+33.33); return fract((p.xxy+p.yxx)*p.zyx)*2.-1.; }
  float n3(vec3 p){ vec3 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
    return mix(mix(mix(dot(h3(i),f),dot(h3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(h3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(h3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
               mix(mix(dot(h3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(h3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(h3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(h3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }`;

// палітри за температурою: ядро диска, край диска, плями, корона (біля краю → у струменях)
export const STAR_TINTS = {
  hot: { core: [.86, .93, 1], edge: [.42, .58, 1], spot: [.45, .52, .85], c1: [.32, .5, 1], c2: [.75, .86, 1] },
  sun: { core: [1, .93, .8], edge: [.98, .45, .14], spot: [.85, .30, .26], c1: [1, .42, .12], c2: [1, .78, .45] },
  red: { core: [1, .66, .42], edge: [.78, .2, .06], spot: [.5, .1, .06], c1: [1, .26, .06], c2: [1, .52, .26] },
};

let glowTex = null;
function glow(THREE) {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(.4, 'rgba(255,255,255,.07)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return (glowTex = new THREE.CanvasTexture(c));
}

export function makeStar(THREE, r, tint, seed = 0) {
  const v3 = (a) => new THREE.Vector3(...a);
  const U = { uT: { value: 0 }, uSeed: { value: seed * 17.3 }, uCore: { value: v3(tint.core) }, uEdge: { value: v3(tint.edge) }, uSpot: { value: v3(tint.spot) },
    uC1: { value: v3(tint.c1) }, uC2: { value: v3(tint.c2) } };
  const g = new THREE.Group();
  const surf = new THREE.ShaderMaterial({ uniforms: U,
    vertexShader: 'varying vec3 vP; varying vec3 vN; void main(){ vP = position; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vP; varying vec3 vN; uniform float uT, uSeed; uniform vec3 uCore, uEdge, uSpot;` + NOISE + `
      void main(){ vec3 p = normalize(vP) + uSeed;
        float gran = n3(p*38.+uT*.12)*.5 + n3(p*80.-uT*.2)*.25;
        float act = smoothstep(-.1,.3, n3(p*2.2+3.));
        float spot = smoothstep(.22,.48, n3(p*9.+vec3(uT*.01))) * act * smoothstep(.1,.4, n3(p*24.+7.)+.3);
        float mu = max(dot(vN, vec3(0,0,1)),0.);
        vec3 c = mix(uEdge, uCore, pow(mu,.8));
        c *= .93 + gran*.12;
        c = mix(c, uSpot, spot*.85);
        gl_FragColor = vec4(c*.82, 1.); }` });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 64, 40), surf));
  // корона — площина 5 радіусів, повернута до камери; край диска на .4
  const cor = new THREE.Mesh(new THREE.PlaneGeometry(r * 5, r * 5), new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv*2.-1.; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec2 vU; uniform float uT, uSeed; uniform vec3 uC1, uC2;` + NOISE + `
      float fbm(vec3 p){ float s=0., a=.5; for(int k=0;k<5;k++){ s+=a*n3(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }
      void main(){ float r = length(vU); if (r < .4) { gl_FragColor = vec4(0.); return; }
        vec2 dir = vU / r; float d = r - .4;
        float f1 = fbm(vec3(dir*3.2 + uSeed, d*5. - uT*.18)) * .5 + .5;
        float f2 = fbm(vec3(dir*7.5 + 4. + uSeed, d*9. - uT*.32)) * .5 + .5;
        float streak = pow(f1*f2, 2.6) * 6.;
        float fade = exp(-d*4.2), rim = exp(-d*55.) * .9, halo = exp(-d*4.) * .14;
        vec3 col = mix(uC1, uC2, clamp(rim + streak*fade*.5, 0., 1.));
        float a = clamp(streak*fade*1.1 + rim + halo, 0., 1.);
        gl_FragColor = vec4(col*a, a); }` }));
  g.add(cor);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(THREE), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    color: new THREE.Color(...tint.c2) }));
  s.scale.setScalar(r * 4.5); g.add(s);
  g.userData.update = (t, camera) => { U.uT.value = t; cor.quaternion.copy(camera.quaternion); };
  g.userData.dispose = () => g.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return g;
}
