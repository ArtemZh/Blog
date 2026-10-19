/* Стаття 34: ефекти поверх сторінки (ідеї — з колекції html-in-canvas ефектів, код свій).
   1) Лінза чорної діри на банері: за курсором ходить маленька діра, банер і заголовок згинаються за
      рівнянням точкової гравітаційної лінзи β = θ − θE²·θ/|θ|² (θ — де бачимо, β — звідки насправді світло).
   2) Пилова буря: смуга пилу між розділами, вітер розганяє її навколо курсора.
   3) Морзе: над тесерактом падають потоки крапок і тире; заголовок розділу «розшифровується» з Морзе. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const css = document.createElement('style');
  css.textContent = `
    .fx-lens{position:absolute;inset:0;z-index:4;width:100%;height:100%;opacity:0;transition:opacity .35s;pointer-events:none;display:block}
    .fx-lens.on{opacity:1}
    .fx-band{position:relative;height:150px;margin:var(--sp-md) 0;border-radius:var(--r-lg);overflow:hidden;background:#1a130c}
    .fx-band canvas{display:block;width:100%;height:100%}
    .fx-band .fx-cap{position:absolute;left:14px;bottom:10px;font:500 11px/1.3 var(--mono);color:rgba(255,236,210,.75);pointer-events:none;text-shadow:0 1px 6px rgba(0,0,0,.6)}
    .fx-morse{height:110px;background:#070a12}
    .fx-grid{height:440px;background:#05060c}
    @media(max-width:620px){.fx-band.fx-grid{height:340px}}
    .fx-morse .fx-cap{color:rgba(190,210,255,.7)}
    .fx-dec{font-variant-ligatures:none}
    @media(max-width:620px){.fx-band{height:120px}}`;
  document.head.appendChild(css);

  function gl2(canvas) { return canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false }); }
  function prog(gl, fs) {
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }'));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, 'precision highp float;\n' + fs)); gl.linkProgram(p); gl.useProgram(p);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; return { p, u: (n) => U[n] ?? (U[n] = gl.getUniformLocation(p, n)) };
  }
  const visible = (el, cb) => new IntersectionObserver((es) => cb(es[0].isIntersecting), { rootMargin: '80px' }).observe(el);

  /* ── 1. лінза чорної діри на банері ── */
  (function lens() {
    const hero = document.querySelector('.hero3'), img = hero && hero.querySelector('.hero3__img');
    if (!hero || !img || !hover || reduce) return;
    const cv = document.createElement('canvas'); cv.className = 'fx-lens'; cv.setAttribute('aria-hidden', 'true'); hero.appendChild(cv);
    const gl = gl2(cv); if (!gl) return;
    let P; try { P = prog(gl, `
      uniform sampler2D tex; uniform vec2 uRes, uM; uniform float uRE, uK;
      void main(){ vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
        vec2 d = p - uM; float r = max(length(d), 1e-3);
        float re = uRE * uK, rs = re * .52;                         // тінь діри — трохи більше половини радіуса Ейнштейна
        vec2 dfl = d * (re*re) / (r*r);                             // рівняння точкової лінзи: β = θ − θE²·θ/|θ|²
        float ab = .035 * smoothstep(re*2.5, rs, r);                // кольорова облямівка біля кільця (як у кіно-лінзи)
        vec3 c = vec3(texture2D(tex, clamp((p - dfl*(1.+ab)) / uRes, 0., 1.)).r,
                      texture2D(tex, clamp((p - dfl) / uRes, 0., 1.)).g,
                      texture2D(tex, clamp((p - dfl*(1.-ab)) / uRes, 0., 1.)).b);
        float ring = exp(-pow((r - rs) / (1.6 + .02*re), 2.));      // тонке фотонне кільце на краю тіні
        c = mix(c, vec3(0.), smoothstep(rs + 1., rs - 1., r));
        c += vec3(1., .82, .58) * ring * .9 * uK;
        gl_FragColor = vec4(c, 1.); }`); } catch (e) { return; }
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const off = document.createElement('canvas'), ox = off.getContext('2d');
    // лінії орбіт (SVG) — у знімок теж: копія з уже обчисленими стилями → картинка
    const orb = hero.querySelector('.hero3__orb'); let orbImg = null;
    function orbSnap() { if (!orb) return; const c = orb.cloneNode(true), src = orb.querySelectorAll('ellipse'), dst = c.querySelectorAll('ellipse');
      src.forEach((e, i) => { const st = getComputedStyle(e); ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity'].forEach((k) => dst[i].setAttribute(k, st.getPropertyValue(k))); dst[i].setAttribute('vector-effect', 'non-scaling-stroke'); });
      const b = orb.getBoundingClientRect(); c.setAttribute('width', b.width); c.setAttribute('height', b.height); c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const im = new Image(); im.onload = () => { orbImg = im; ready = false; }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c)); }
    let dpr = 1, W = 0, H = 0, ready = false;
    // знімок банера: картинка (object-fit: cover, як у CSS) + тексти, по словах на тих самих місцях, що в DOM
    function snap() {
      const r = hero.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
      if (!W || !H || !img.complete) return;
      cv.width = off.width = Math.round(W * dpr); cv.height = off.height = Math.round(H * dpr);
      ox.setTransform(dpr, 0, 0, dpr, 0, 0); ox.fillStyle = '#04050a'; ox.fillRect(0, 0, W, H);
      const ir = img.getBoundingClientRect(), cs = getComputedStyle(img), iw = img.naturalWidth, ih = img.naturalHeight;
      const k = Math.max(ir.width / iw, ir.height / ih), dw = iw * k, dh = ih * k;
      const [px, py] = cs.objectPosition.split(' ').map((v, i) => v.endsWith('%') ? parseFloat(v) / 100 : v === 'right' || v === 'bottom' ? 1 : v === 'center' ? .5 : 0);
      ox.drawImage(img, ir.left - r.left + (ir.width - dw) * (isNaN(px) ? 1 : px), ir.top - r.top + (ir.height - dh) * (isNaN(py) ? .5 : py), dw, dh);
      const grad = getComputedStyle(hero, '::after').backgroundImage;      // затемнення зліва, як у CSS
      if (grad && grad !== 'none') { const g = ox.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(4,5,10,.55)'); g.addColorStop(.45, 'rgba(4,5,10,.15)'); g.addColorStop(.6, 'rgba(4,5,10,0)'); ox.fillStyle = g; ox.fillRect(0, 0, W, H); }
      if (orbImg) { const sr = orb.getBoundingClientRect(); ox.drawImage(orbImg, sr.left - r.left, sr.top - r.top, sr.width, sr.height); }
      hero.querySelectorAll('.hero3__kick, h1, .hero3__sub').forEach((el) => {
        const s = getComputedStyle(el); ox.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`; ox.fillStyle = s.color; ox.textBaseline = 'middle';
        ox.shadowColor = 'rgba(0,0,0,.5)'; ox.shadowBlur = el.tagName === 'H1' ? 24 : 0;
        if ('letterSpacing' in ox) ox.letterSpacing = s.letterSpacing === 'normal' ? '0px' : s.letterSpacing;
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
        while ((n = tw.nextNode())) { const t = s.textTransform === 'uppercase' ? n.textContent.toUpperCase() : n.textContent;
          const re = /\S+/g; let m;
          while ((m = re.exec(n.textContent))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
            const b = rg.getBoundingClientRect(); ox.fillText(t.slice(m.index, m.index + m[0].length), b.left - r.left, b.top - r.top + b.height / 2); } }
        ox.shadowBlur = 0; });
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off); ready = true;
    }
    let mx = 0, my = 0, tx = 0, ty = 0, k = 0, kt = 0, raf = 0;
    function draw() {
      tx += (mx - tx) * .18; ty += (my - ty) * .18; k += (kt - k) * .12;
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(P.u('uRes'), cv.width, cv.height); gl.uniform2f(P.u('uM'), tx * dpr, ty * dpr);
      gl.uniform1f(P.u('uRE'), Math.min(110, Math.max(60, W * .06)) * dpr); gl.uniform1f(P.u('uK'), k);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (kt > 0 || k > .01) raf = requestAnimationFrame(draw); else { raf = 0; cv.classList.remove('on'); }
    }
    hero.addEventListener('pointerenter', (e) => { if (!ready) snap(); if (!ready) return; const r = hero.getBoundingClientRect(); tx = mx = e.clientX - r.left; ty = my = e.clientY - r.top; kt = 1; cv.classList.add('on'); if (!raf) raf = requestAnimationFrame(draw); });
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { kt = 0; });
    const resnap = () => { ready = false; orbSnap(); };
    setTimeout(orbSnap, 2600);                                       // після анімації появи орбіт
    addEventListener('resize', resnap); document.fonts && document.fonts.ready.then(resnap); img.complete || img.addEventListener('load', resnap);
  })();

  /* ── 1б. політ камери на прокрутці: поки гортаєш перший екран, банер наближається до діри ── */
  (function fly() {
    const hero = document.querySelector('.hero3'), img = hero && hero.querySelector('.hero3__img'), orb = hero && hero.querySelector('.hero3__orb');
    if (!hero || !img || reduce) return; img.style.transformOrigin = '72% 50%'; if (orb) orb.style.transformOrigin = '72% 50%';
    let raf = 0;
    const upd = () => { raf = 0; const r = hero.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      const k = 1 + p * .35, tr = 'scale(' + k.toFixed(4) + ')'; img.style.transform = tr; if (orb) orb.style.transform = tr; };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); upd();
  })();

  /* ── 2. пилова буря — перенесено в окрему макросцену shared/is-dust.js ── */

  /* ── 3. Морзе: дощ крапок і тире над тесерактом + заголовок, що розшифровується ── */
  (function morse() {
    const sec = document.getElementById('tess'), slot = document.getElementById('viz-tess'); if (!sec || !slot) return;
    const box = document.createElement('div'); box.className = 'fx-band fx-morse'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<canvas></canvas><span class="fx-cap">повідомлення крізь час — крапки й тире · наведіть, і потік пожвавиться</span>';
    slot.before(box);
    const cv = box.querySelector('canvas'), x = cv.getContext('2d');
    const CODE = ['•', '—'], cols = [];
    let W = 0, H = 0, dpr = 1, mx = -999, on = false, raf = 0, last = performance.now();
    function fit() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols.length = 0; for (let c = 0; c < Math.ceil(W / 16); c++) cols.push({ y: Math.random() * H, v: 18 + Math.random() * 40, s: [] }); }
    function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now;
      x.fillStyle = 'rgba(7,10,18,.28)'; x.fillRect(0, 0, W, H);
      x.font = '600 13px "Roboto Mono", monospace'; x.textAlign = 'center';
      cols.forEach((c, i) => { const cx = i * 16 + 8, near = Math.exp(-Math.pow((cx - mx) / 70, 2));
        c.y += c.v * (1 + near * 3) * dt; if (c.y > H + 20) { c.y = -10; c.v = 18 + Math.random() * 40; }
        if (Math.random() < .25) { const g = CODE[Math.random() < .5 ? 0 : 1];
          x.fillStyle = near > .2 ? `rgba(234,${120 + 60 * near | 0},60,${.6 + .4 * near})` : 'rgba(150,180,255,.75)'; x.fillText(g, cx, c.y); } });
      raf = on ? requestAnimationFrame(frame) : 0; }
    box.addEventListener('pointermove', (e) => { mx = e.clientX - box.getBoundingClientRect().left; });
    box.addEventListener('pointerleave', () => { mx = -999; });
    addEventListener('resize', fit);
    if (reduce) { fit(); for (let k = 0; k < 40; k++) frame(performance.now()); return; }
    visible(box, (v) => { on = v; if (v && !raf) { if (!W) fit(); last = performance.now(); raf = requestAnimationFrame(frame); } });

    // заголовок: спершу — Морзе, потім літера за літерою стає текстом (при появі й при наведенні)
    const h2 = sec.querySelector('h2'), node = [...h2.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!node) return; const text = node.textContent, span = document.createElement('span'); span.className = 'fx-dec'; span.textContent = text; node.replaceWith(span);
    let busy = false;
    function decode() { if (busy || reduce) return; busy = true; let i = 0;
      const step = () => { span.textContent = text.slice(0, i) + [...text.slice(i)].map((ch) => ch === ' ' ? ' ' : CODE[Math.random() < .5 ? 0 : 1]).join('');
        if (i++ <= text.length) setTimeout(step, 28); else { span.textContent = text; busy = false; } }; step(); }
    new IntersectionObserver((es) => { if (es[0].isIntersecting) decode(); }, { threshold: .6 }).observe(h2);
    h2.addEventListener('pointerenter', decode);
  })();

  /* ── 4. простір-час під курсором: вкладення Фламма для діри без обертання ──
     Поверхня z(r) = 2·√(r_s·(r − r_s)) — точна «форма» простору в площині екватора; колір ліній —
     сповільнення часу √(1 − r_s/r): біля горизонту червоні. Камера згори-навскіс (~38°); діра стоїть
     точно під курсором: промінь із камери крізь курсор перетинаємо з площиною. Тач — тягнути пальцем. */
  (function grid() {
    const sec = document.getElementById('time'); if (!sec) return;
    const anchor = sec.querySelector('.ctl'); if (!anchor) return;
    const box = document.createElement('div'); box.className = 'fx-band fx-grid'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<canvas></canvas><span class="fx-cap">простір навколо діри — вкладення Фламма (точна форма) · колір — у скільки разів повільніше йде час · ведіть курсором або пальцем</span>';
    anchor.before(box);
    const cv = box.querySelector('canvas'), x = cv.getContext('2d');
    const RS = .55, EXT = 7, N = 44, K = .95;                 // радіус горизонту, півширина пластини, ліній, масштаб глибини; пластина висить посередині кадру з полями
    const zf = (r) => 2 * Math.sqrt(RS * Math.max(0, r - RS));
    const ZE = zf(8.4), SW = .6;                              // далі ≈ 8 r — простір майже плаский, сітку там плавно вирівнюємо (м'який перехід ±SW)
    const drop = (r) => { const d = ZE - zf(r); return d > SW ? d : d < -SW ? 0 : (d + SW) * (d + SW) / (4 * SW); };
    let W = 0, H = 0, dpr = 1, F = 1, OX = 0, OY = 0, mx = 0, mz = 1, tx = 0, tz = 1, on = false, raf = 0;
    const C = [0, 6, -9.5], f = norm([0 - C[0], -3.4 - C[1], 1.8 - C[2]]), R = [-1, 0, 0], U = norm(cross(R, f));   // камера дивиться на +z: праворуч — −x, «вгору» — +y (вирва йде вниз, як має)
    function norm(v) { const l = Math.hypot(...v); return v.map((a) => a / l); }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    function proj(P) { const r = [P[0] - C[0], P[1] - C[1], P[2] - C[2]], d = dot(r, f); if (d < .1) return null; return [OX + W / 2 + dot(r, R) / d * F, OY + H / 2 - dot(r, U) / d * F]; }
    function pick(px, py) { const sx = (px - W / 2 - OX) / F, sy = (H / 2 + OY - py) / F, d = [f[0] + sx * R[0] + sy * U[0], f[1] + sx * R[1] + sy * U[1], f[2] + sx * R[2] + sy * U[2]];
      if (d[1] >= -1e-3) return null; const y0 = (zf(RS * 1.002) - ZE) * K * .8, t = (y0 - C[1]) / d[1]; return [C[0] + d[0] * t, C[2] + d[2] * t]; }   // ловимо на глибині дна вирви — діра рівно під курсором
    function fit() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      // вписуємо пластину в кадр: кути площини й дно вирви в центрі — у рамку з полями ~8 % по ширині й ~10 % по висоті
      F = 1; OX = OY = 0; const pw = W, ph = H; W = H = 0; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      [[-EXT, 0, -EXT + 1.2], [EXT, 0, -EXT + 1.2], [-EXT, 0, EXT + 1.2], [EXT, 0, EXT + 1.2], [0, -ZE * K, 1.2]].forEach((P) => { const q = proj(P); if (!q) return;
        x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
      W = pw; H = ph; F = Math.min(W * .84 / (x1 - x0), H * .8 / (y1 - y0)); OX = -(x0 + x1) / 2 * F; OY = -(y0 + y1) / 2 * F; }
    const height = (X, Z) => { const r = Math.hypot(X - mx, Z - mz); return r <= RS * 1.001 ? null : -drop(r) * K; };
    function line(pts) { // pts: [X,Z] — фарбуємо відрізки за сповільненням часу
      let prev = null, pr = 0;
      for (const [X, Z] of pts) { const h = height(X, Z); const q = h === null ? null : proj([X, h, Z]); const r = Math.hypot(X - mx, Z - mz);
        if (q && prev) { const hot = Math.min(1, (1 - Math.sqrt(Math.max(0, 1 - RS / Math.min(r, pr)))) * 3.2);
          x.strokeStyle = `rgba(${140 + 115 * hot | 0},${175 - 120 * hot | 0},${255 - 210 * hot | 0},${.22 + .6 * hot})`;
          x.lineWidth = .8 + hot * .9; x.beginPath(); x.moveTo(prev[0], prev[1]); x.lineTo(q[0], q[1]); x.stroke(); }
        prev = q; pr = r; } }
    function frame() {
      mx += (tx - mx) * .16; mz += (tz - mz) * .16;
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04050b'); g.addColorStop(1, '#0a0d18'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      const S = 140;
      for (let i = 0; i <= N; i++) { const a = -EXT + 2 * EXT * i / N, A = [], B = [];
        for (let k = 0; k <= S; k++) { const b = -EXT + 2 * EXT * k / S; A.push([a, b + 1.2]); B.push([b, a + 1.2]); }
        line(A); line(B); }
      // горизонт: чорне коло на дні вирви + тонке світле кільце
      const hz = (zf(RS * 1.002) - ZE) * K, ring = [];
      for (let k = 0; k <= 48; k++) { const t = k / 48 * 6.283; const q = proj([mx + Math.cos(t) * RS, hz, mz + Math.sin(t) * RS]); if (q) ring.push(q); }
      const inside = Math.abs(mx) < EXT + RS && mz > -EXT + 1.2 - RS && mz < EXT + 1.2 + RS;   // за пластиною дірку не малюємо — там сітки немає
      if (inside && ring.length > 3) { x.fillStyle = '#000'; x.beginPath(); ring.forEach((q, k) => k ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(255,190,120,.8)'; x.lineWidth = 1.4; x.stroke(); }
      raf = on && (Math.abs(tx - mx) > .002 || Math.abs(tz - mz) > .002) ? requestAnimationFrame(frame) : 0;
    }
    // діру можна винести за пластину — тоді видно поле без викривлення
    function move(e) { const r = box.getBoundingClientRect(), p = pick(e.clientX - r.left, e.clientY - r.top); if (!p) return;
      tx = Math.max(-3 * EXT, Math.min(3 * EXT, p[0])); tz = Math.max(-EXT - 4, Math.min(3 * EXT, p[1])); if (!raf) raf = requestAnimationFrame(frame); }
    box.addEventListener('pointermove', move); box.addEventListener('pointerdown', move);
    box.style.touchAction = 'pan-y';
    addEventListener('resize', () => { fit(); frame(); });
    visible(box, (v) => { on = v; if (v) { fit(); frame(); } });
  })();

  /* ── 5. стрибок на світловій швидкості: перед червоточиною зорі тягнуться в смуги, що швидше гортаєш ── */
  (function warp() {
    const sec = document.getElementById('worm'), wh = document.getElementById('wh'); if (!sec || !wh) return;
    const box = document.createElement('div'); box.className = 'fx-band fx-warp'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<canvas></canvas><span class="fx-cap">до Сатурна й крізь горло — гортайте швидше, і зорі витягнуться в смуги</span>';
    wh.before(box);
    const cv = box.querySelector('canvas'), x = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, on = false, raf = 0, sp = 0, lastY = scrollY, lastT = performance.now();
    const S = Array.from({ length: 420 }, () => ({ a: Math.random() * 6.283, r: Math.random(), z: Math.random() }));
    function fit() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) { const dt = Math.min(.05, (now - lastT) / 1000) || .016; lastT = now;
      const v = Math.abs(scrollY - lastY) / Math.max(dt, .001); lastY = scrollY;
      sp += (Math.min(1, v / 2500) - sp) * .1;
      x.fillStyle = `rgba(4,5,10,${.55 - .4 * sp})`; x.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.hypot(cx, cy);
      S.forEach((s) => { s.z -= dt * (.04 + sp * 1.6); if (s.z <= .02) { s.z = 1; s.a = Math.random() * 6.283; s.r = Math.random(); }
        const k = (.15 + s.r) / s.z, px = cx + Math.cos(s.a) * k * R * .25, py = cy + Math.sin(s.a) * k * R * .25 * .55;
        const len = sp * 60 * (1 - s.z) + 1, dx = Math.cos(s.a) * len, dy = Math.sin(s.a) * len * .55;
        x.strokeStyle = `rgba(${200 + 55 * sp | 0},${215 + 30 * sp | 0},255,${.35 + .6 * (1 - s.z)})`; x.lineWidth = .8 + (1 - s.z) * 1.2;
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + dx, py + dy); x.stroke(); });
      raf = on && !reduce ? requestAnimationFrame(frame) : 0; }
    addEventListener('resize', fit);
    visible(box, (v) => { on = v; if (v && !raf) { fit(); lastT = performance.now(); lastY = scrollY; raf = requestAnimationFrame(frame); } });
  })();
})();
