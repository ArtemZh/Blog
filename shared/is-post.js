/* Стаття 34: спільний «кіноплівковий» прохід постобробки для three.js-сцен.
   Віньєтка, дрібне зерно, легка хроматична аберація по краях, тон і насиченість.
   Ставиться останнім у EffectComposer (після OutputPass — працює вже з готовим sRGB-кадром). */
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export const GRADE_GLSL = `
  float gh(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  // c — колір кадру, uv — 0…1, res — розмір у пікселях, t — час; vig — сила віньєтки, grain — зерно, sat — насиченість, tint — відтінок
  vec3 grade(vec3 c, vec2 uv, vec2 res, float t, float vig, float grain, float sat, vec3 tint){
    vec2 q = uv - .5; float r2 = dot(q, q) * 2.;
    c *= mix(1., 1. - vig, smoothstep(.08, .95, r2));
    float l = dot(c, vec3(.299,.587,.114));
    c = mix(vec3(l), c, sat) * tint;
    float n = gh(floor(uv*res) + fract(t*7.31)*vec2(13.7, 9.1)) - .5;
    c += n * grain * (.35 + .65*(1. - l));
    return c;
  }`;

export function gradePass(opts = {}) {
  const p = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
      uVig: { value: opts.vignette ?? .38 }, uGrain: { value: opts.grain ?? .045 }, uCA: { value: opts.ca ?? 1.4 },
      uSat: { value: opts.sat ?? 1.05 }, uTint: { value: new THREE.Vector3(...(opts.tint || [1, 1, 1])) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uT, uVig, uGrain, uCA, uSat; uniform vec2 uRes; uniform vec3 uTint; varying vec2 vUv;
      ${GRADE_GLSL}
      void main(){
        vec2 q = vUv - .5; vec2 off = q * dot(q, q) * uCA * .012;      // хроматична аберація: лише по краях
        vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        gl_FragColor = vec4(grade(c, vUv, uRes, uT, uVig, uGrain, uSat, uTint), 1.);
      }` });
  p.tick = (t, w, h) => { p.uniforms.uT.value = t; p.uniforms.uRes.value.set(w, h); };
  return p;
}
