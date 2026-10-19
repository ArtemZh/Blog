/* Стаття 33 «Задача трьох тіл»: фізика (спільна для 3D-сцени), хаос, точки Лагранжа.
   Одиниці умовні: G = 1. Інтегратор — RK4 зі змінним кроком: крок зменшується біля
   тісних зближень, а похибку енергії видно завжди (SCHEMA-PRINCIPLES: перевірка, а не віра). */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const EN = window.PMP_LANG === 'en', _t = (uk, en) => (EN ? en : uk);
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  /* ── фізика ─────────────────────────────────────────────────── */
  // стан: масив тіл {m, p:[x,y,z], v:[x,y,z]}
  function acc(bodies, P) {
    const n = bodies.length, a = bodies.map(() => [0, 0, 0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1], dz = P[j][2] - P[i][2];
      const r2 = dx * dx + dy * dy + dz * dz, r3 = r2 * Math.sqrt(r2);
      const fi = bodies[j].m / r3, fj = bodies[i].m / r3;
      a[i][0] += dx * fi; a[i][1] += dy * fi; a[i][2] += dz * fi;
      a[j][0] -= dx * fj; a[j][1] -= dy * fj; a[j][2] -= dz * fj;
    }
    return a;
  }
  function rk4(bodies, h) {
    const P0 = bodies.map((b) => b.p), V0 = bodies.map((b) => b.v);
    const add = (X, D, s) => X.map((x, i) => [x[0] + D[i][0] * s, x[1] + D[i][1] * s, x[2] + D[i][2] * s]);
    const a1 = acc(bodies, P0), v1 = V0;
    const P2 = add(P0, v1, h / 2), V2 = add(V0, a1, h / 2), a2 = acc(bodies, P2);
    const P3 = add(P0, V2, h / 2), V3 = add(V0, a2, h / 2), a3 = acc(bodies, P3);
    const P4 = add(P0, V3, h), V4 = add(V0, a3, h), a4 = acc(bodies, P4);
    bodies.forEach((b, i) => {
      for (let k = 0; k < 3; k++) {
        b.p[k] += h / 6 * (v1[i][k] + 2 * V2[i][k] + 2 * V3[i][k] + V4[i][k]);
        b.v[k] += h / 6 * (a1[i][k] + 2 * a2[i][k] + 2 * a3[i][k] + a4[i][k]);
      }
    });
  }
  // крок: менший з «часів зближення» пар — так тісні проходи не ламають розрахунок
  function stepSize(bodies, eta) {
    let h = Infinity;
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const A = bodies[i], B = bodies[j];
      const r = Math.hypot(A.p[0] - B.p[0], A.p[1] - B.p[1], A.p[2] - B.p[2]);
      const v = Math.hypot(A.v[0] - B.v[0], A.v[1] - B.v[1], A.v[2] - B.v[2]) + 1e-12;
      h = Math.min(h, r / v, Math.sqrt(r * r * r / (A.m + B.m)));
    }
    return eta * h;
  }
  function advance(bodies, T, eta, maxSteps) {   // просуваємо на час T (або доки не вичерпано кроки)
    let t = 0, n = 0;
    while (t < T && n < maxSteps) { const h = Math.min(stepSize(bodies, eta), T - t); rk4(bodies, h); t += h; n++; }
    return { t, n };
  }
  function energy(bodies) {
    let K = 0, U = 0;
    bodies.forEach((b) => { K += .5 * b.m * (b.v[0] ** 2 + b.v[1] ** 2 + b.v[2] ** 2); });
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const A = bodies[i], B = bodies[j]; U -= A.m * B.m / Math.hypot(A.p[0] - B.p[0], A.p[1] - B.p[1], A.p[2] - B.p[2]);
    }
    return K + U;
  }
  const B = (m, p, v) => ({ m, p: p.concat(p.length < 3 ? [0] : []), v: v.concat(v.length < 3 ? [0] : []) });
  function zeroMomentum(bodies) {
    const M = bodies.reduce((s, b) => s + b.m, 0);
    for (let k = 0; k < 3; k++) {
      const pc = bodies.reduce((s, b) => s + b.m * b.p[k], 0) / M, vc = bodies.reduce((s, b) => s + b.m * b.v[k], 0) / M;
      bodies.forEach((b) => { b.p[k] -= pc; b.v[k] -= vc; });
    }
    return bodies;
  }
  // невеликий детермінований генератор: «випадковий старт» можна повторити
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const PRESETS = {
    fig8: () => { const v3 = [-0.93240737, -0.86473146];
      return [B(1, [0.97000436, -0.24308753], [-v3[0] / 2, -v3[1] / 2]), B(1, [-0.97000436, 0.24308753], [-v3[0] / 2, -v3[1] / 2]), B(1, [0, 0], v3)]; },
    lagrange: () => { const w = Math.pow(3, -0.25);
      return [90, 210, 330].map((d) => { const a = d * Math.PI / 180; return B(1, [Math.cos(a), Math.sin(a)], [-Math.sin(a) * w, Math.cos(a) * w]); }); },
    euler: () => { const v = Math.sqrt(1.25); return [B(1, [-1, 0], [0, -v]), B(1, [0, 0], [0, 0]), B(1, [1, 0], [0, v])]; },
    pyth: () => [B(3, [1, 3], [0, 0]), B(4, [-2, -1], [0, 0]), B(5, [1, -1], [0, 0])],
    hier: () => zeroMomentum([B(1, [0, 0], [0, 0]), B(0.01, [1, 0], [0, 1.005]), B(0.0001, [1.06, 0], [0, 1.005 + Math.sqrt(0.01 / 0.06)])]),
    random: (seed) => { const R = rng(seed || 7);
      return zeroMomentum([0, 1, 2].map(() => B(1, [R() * 2 - 1, R() * 2 - 1, (R() - .5) * .4], [(R() - .5) * .5, (R() - .5) * .5, (R() - .5) * .1]))); },
  };
  window.TB = { acc, rk4, advance, stepSize, energy, PRESETS, zeroMomentum };

  /* ── 03 хаос: дві копії піфагорової задачі ──────────────────── */
  (function chaos() {
    const cv = $('#chaos'), gr = $('#chaosGraph'); if (!cv) return;
    const st = { A: null, B: null, t: 0, hist: [], run: false, raf: 0 };
    const dpr = Math.min(2, devicePixelRatio || 1);
    function fit(c) { const w = c.clientWidth, h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return { x, w, h }; }
    const trails = { A: [[], [], []], B: [[], [], []] };
    function reset() {
      st.A = PRESETS.pyth(); st.B = PRESETS.pyth(); st.B[0].p[0] += 1e-9; st.t = 0; st.hist = []; trails.A = [[], [], []]; trails.B = [[], [], []];
      $('#chaosT').textContent = '0';
    }
    function sep() { let d = 0; st.A.forEach((a, i) => { const b = st.B[i]; d = Math.max(d, Math.hypot(a.p[0] - b.p[0], a.p[1] - b.p[1])); }); return d; }
    function draw() {
      const { x, w, h } = fit(cv), S = Math.min(w, h) / 9, cx = w / 2, cy = h / 2;
      x.clearRect(0, 0, w, h);
      [['A', css('--ink')], ['B', css('--act')]].forEach(([k, col]) => {
        trails[k].forEach((tr) => { x.strokeStyle = col; x.globalAlpha = k === 'A' ? .45 : .7; x.lineWidth = 1.2; x.beginPath();
          tr.forEach((p, i) => (i ? x.lineTo(cx + p[0] * S, cy - p[1] * S) : x.moveTo(cx + p[0] * S, cy - p[1] * S))); x.stroke(); });
        x.globalAlpha = 1; st[k].forEach((b) => { x.fillStyle = col; x.beginPath(); x.arc(cx + b.p[0] * S, cy - b.p[1] * S, (k === 'A' ? 3 : 1.6) + Math.cbrt(b.m) * 2, 0, 7); x.fill(); });
      });
      const g = fit(gr), L = 44, R = 10, T = 10, Bm = 26, W = g.w, H = g.h, tMax = 70, lo = -10, hi = 1;
      const X = (t) => L + t / tMax * (W - L - R), Y = (v) => T + (hi - v) / (hi - lo) * (H - T - Bm);
      g.x.clearRect(0, 0, W, H); g.x.font = '11px "Roboto Mono", monospace'; g.x.fillStyle = css('--ink-3'); g.x.strokeStyle = css('--rule');
      for (let v = lo; v <= hi; v += 2) { const y = Math.round(Y(v)) + .5; g.x.beginPath(); g.x.moveTo(L, y); g.x.lineTo(W - R, y); g.x.stroke(); g.x.textAlign = 'right'; g.x.fillText('10^' + v, L - 6, y + 4); }
      g.x.textAlign = 'center'; [0, 35, 70].forEach((t) => g.x.fillText('t=' + t, X(t), H - 8));
      g.x.strokeStyle = css('--act'); g.x.lineWidth = 2; g.x.beginPath();
      st.hist.forEach(([t, d], i) => { const v = Math.max(lo, Math.log10(d)); i ? g.x.lineTo(X(t), Y(v)) : g.x.moveTo(X(t), Y(v)); }); g.x.stroke();
    }
    function loop() {
      if (!st.run) return;
      for (let k = 0; k < 4; k++) {
        advance(st.A, .02, .02, 4000); advance(st.B, .02, .02, 4000); st.t += .02;
        ['A', 'B'].forEach((key) => st[key].forEach((b, i) => { const tr = trails[key][i]; tr.push([b.p[0], b.p[1]]); if (tr.length > 260) tr.shift(); }));
        st.hist.push([st.t, Math.max(1e-12, sep())]);
      }
      $('#chaosT').textContent = st.t.toFixed(1); $('#chaosD').textContent = sep().toExponential(1);
      draw();
      if (st.t >= 70) { st.run = false; $('#chaosGo').textContent = _t('▶ ще раз', "▶ again"); return; }
      st.raf = requestAnimationFrame(loop);
    }
    $('#chaosGo').addEventListener('click', () => { if (st.run) { st.run = false; $('#chaosGo').textContent = _t('▶ продовжити', "▶ continue"); return; }
      if (st.t >= 70) reset(); st.run = true; $('#chaosGo').textContent = _t('❚❚ пауза', "❚❚ pause"); loop(); });
    $('#chaosReset').addEventListener('click', () => { st.run = false; reset(); draw(); $('#chaosGo').textContent = _t('▶ запустити', "▶ run"); });
    reset(); draw(); addEventListener('resize', draw);
    window.TB.chaos = st;
  })();

  /* ── 05 точки Лагранжа: ефективний потенціал в системі, що обертається ── */
  (function lagrange() {
    const cv = $('#lag');
    const st = { mu: 0.0121505, pts: [], geom: null };
    const phi = (x, y, mu) => { const r1 = Math.hypot(x + mu, y), r2 = Math.hypot(x - 1 + mu, y); return -(1 - mu) / r1 - mu / r2 - (x * x + y * y) / 2; };
    const dphix = (x, mu) => { const h = 1e-7; return (phi(x + h, 0, mu) - phi(x - h, 0, mu)) / (2 * h); };
    function root(a, b, mu) { let fa = dphix(a, mu); for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = dphix(m, mu); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } } return (a + b) / 2; }
    function points(mu) {
      const x2 = 1 - mu, x1 = -mu;
      return [
        { id: 'L1', x: root(x1 + 1e-6, x2 - 1e-6, mu), y: 0 },   // між тілами корінь рівно один
        { id: 'L2', x: root(x2 + 1e-6, 2.5, mu), y: 0 },
        { id: 'L3', x: root(-2.5, x1 - 1e-6, mu), y: 0 },
        { id: 'L4', x: .5 - mu, y: Math.sqrt(3) / 2 }, { id: 'L5', x: .5 - mu, y: -Math.sqrt(3) / 2 },
      ];
    }
    window.TB.lag = { points, phi };          // 3D-сцена точок Лагранжа бере розрахунок звідси
    if (!cv) return;
    const NOTE = {
      L1: _t('між тілами; нестійка. Сонце — Земля: обсерваторія SOHO дивиться на Сонце без затемнень.', "between the bodies; unstable. Sun — Earth: the SOHO observatory watches the Sun without eclipses."),
      L2: _t('за меншим тілом; нестійка. Сонце — Земля: телескоп «Джеймс Вебб», раніше — Gaia.', "behind the smaller body; unstable. Sun — Earth: the James Webb telescope, formerly Gaia."),
      L3: _t('з протилежного боку від більшого тіла; нестійка, апаратів там немає.', "on the opposite side of the larger body; unstable, there are no spacecraft there."),
      L4: _t('попереду меншого тіла на його орбіті; стійка, якщо менше тіло легше за ~4% загальної маси. Тут троянські астероїди Юпітера.', "ahead of the smaller body on its orbit; stable if the smaller body is lighter than ~4% of the total mass. Jupiter's Trojan asteroids are here."),
      L5: _t('позаду меншого тіла; так само стійка за малої маси. Друга група троянців Юпітера.', "behind the smaller body; likewise stable when its mass is small. The second group of Jupiter's Trojans."),
    };
    const dpr = Math.min(2, devicePixelRatio || 1);
    function draw() {
      $('#lagMu').textContent = st.mu < .001 ? st.mu.toExponential(2) : st.mu.toFixed(4);     // повзунок видно і в 3D
      $('#lagStab').textContent = st.mu < 0.0385 ? _t('L4 і L5 стійкі', "L4 and L5 are stable") : _t('L4 і L5 вже нестійкі (μ > 0,0385)', "L4 and L5 are no longer stable (μ > 0.0385)");
      if (!cv.clientWidth) return;                    // карта схована (вигляд 3D) — намалюємо, коли відкриють
      const w = cv.clientWidth, h = Math.round(w * .62); cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
      const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mu = st.mu, S = Math.min(w / 3.4, h / 2.4), cx = w / 2, cy = h / 2;
      const img = x.createImageData(Math.ceil(w * dpr), Math.ceil(h * dpr)), D = img.data, pts = points(mu);
      // діапазон рівнів — від трохи нижче L1 до трохи вище L4: так видно «перевали» біля точок
      const lowC = phi(pts[0].x, 0, mu) - .45, hiC = phi(pts[3].x, pts[3].y, mu) + .015;
      const ink = [21, 24, 29], paper = [250, 250, 251];
      for (let py = 0; py < img.height; py++) for (let px = 0; px < img.width; px++) {
        const X = (px / dpr - cx) / S, Y = -(py / dpr - cy) / S;
        let v = phi(X, Y, mu); v = Math.max(lowC, Math.min(hiC, v));
        const f = (v - lowC) / (hiC - lowC);                    // 0 — глибока яма, 1 — «вершина»
        const band = Math.floor(f * 12) / 12;                   // смуги — рівні потенціалу
        const t = .5 + .5 * band, i = (py * img.width + px) * 4; // найтемніше — половина тону
        for (let k = 0; k < 3; k++) D[i + k] = Math.round(paper[k] * t + ink[k] * (1 - t));
        D[i + 3] = 255;
      }
      x.putImageData(img, 0, 0); x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const P = (X, Y) => [cx + X * S, cy - Y * S];
      st.geom = { w, h, S, cx, cy };
      [[-mu, 1 - mu, 9], [1 - mu, mu, 5]].forEach(([X, m, r], i) => { const [a, b] = P(X, 0); x.fillStyle = css('--ink'); x.beginPath(); x.arc(a, b, i ? 4 + 4 * Math.sqrt(m) : r, 0, 7); x.fill(); });
      x.font = '600 12px "Roboto Mono", monospace'; x.textAlign = 'center';
      st.pts = pts.map((p) => { const [a, b] = P(p.x, p.y); x.fillStyle = css('--act'); x.beginPath(); x.arc(a, b, 5, 0, 7); x.fill();
        x.fillStyle = css('--ink'); x.fillText(p.id, a, b - 10); return { ...p, sx: a, sy: b }; });
      $('#lagMu').textContent = mu < .001 ? mu.toExponential(2) : mu.toFixed(4);
      $('#lagStab').textContent = mu < 0.0385 ? _t('L4 і L5 стійкі', "L4 and L5 are stable") : _t('L4 і L5 вже нестійкі (μ > 0,0385)', "L4 and L5 are no longer stable (μ > 0.0385)");
    }
    const sl = $('#lagSl'), lin = (v) => Math.pow(10, -4 + v / 100 * Math.log10(0.5 / 1e-4));
    sl.addEventListener('input', () => { st.mu = lin(+sl.value); draw(); });
    document.querySelectorAll('#lagPre button').forEach((b) => b.addEventListener('click', () => {
      st.mu = +b.dataset.mu; sl.value = Math.round((Math.log10(st.mu) + 4) / Math.log10(0.5 / 1e-4) * 100); draw(); }));
    const tip = $('#lagTip');
    cv.addEventListener('mousemove', (e) => { const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      const p = st.pts.find((q) => Math.hypot(q.sx - mx, q.sy - my) < 14);
      if (!p) { tip.style.display = 'none'; return; }
      tip.style.display = 'block'; tip.innerHTML = `<b>${p.id}</b> — ${NOTE[p.id]}`; tip.style.left = Math.min(r.width - 140, Math.max(140, p.sx)) + 'px'; tip.style.top = p.sy + 'px'; });
    cv.addEventListener('mouseleave', () => (tip.style.display = 'none'));
    draw(); let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 150); });
    // маленька статична карта для кута 3D-сцени: той самий рельєф, без підписів
    function mini(c, mu) {
      const w = c.clientWidth || 220, h = c.clientHeight || 140; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const x = c.getContext('2d'), img = x.createImageData(c.width, c.height), Dd = img.data, pts = points(mu);
      const S2 = Math.min(w / 3.4, h / 2.4), cx = w / 2, cy = h / 2;
      const lowC = phi(pts[0].x, 0, mu) - .45, hiC = phi(pts[3].x, pts[3].y, mu) + .015, ink = [21, 24, 29], paper = [250, 250, 251];
      for (let py = 0; py < img.height; py++) for (let px = 0; px < img.width; px++) {
        const X = (px / dpr - cx) / S2, Y = -(py / dpr - cy) / S2;
        const f = (Math.max(lowC, Math.min(hiC, phi(X, Y, mu))) - lowC) / (hiC - lowC), t = .5 + .5 * Math.floor(f * 12) / 12, i = (py * img.width + px) * 4;
        for (let k = 0; k < 3; k++) Dd[i + k] = Math.round(paper[k] * t + ink[k] * (1 - t)); Dd[i + 3] = 255; }
      x.putImageData(img, 0, 0); x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.fillStyle = css('--ink'); [[-mu, 4], [1 - mu, 2.5]].forEach(([X, r]) => { x.beginPath(); x.arc(cx + X * S2, cy, r, 0, 7); x.fill(); });
      x.fillStyle = css('--act'); pts.forEach((p) => { x.beginPath(); x.arc(cx + p.x * S2, cy - p.y * S2, 2.6, 0, 7); x.fill(); });
    }
    function setMu(mu) { st.mu = mu; sl.value = Math.round((Math.log10(mu) + 4) / Math.log10(0.5 / 1e-4) * 100); draw(); }
    window.TB.lag = { st, points, phi, NOTE, mini, setMu, draw };
  })();

  /* ── зміст у шапці ───────────────────────────────────────────── */
  (function toc() {
    const links = [...document.querySelectorAll('#toc a')], items = links.map((a) => ({ a, el: document.getElementById(a.getAttribute('href').slice(1)) }));
    let tick = false;
    const paint = () => { tick = false; let cur = items[0]; items.forEach((it) => { if (it.el && it.el.getBoundingClientRect().top <= 90) cur = it; }); links.forEach((a) => a.classList.toggle('on', a === cur.a)); };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true }); paint();
  })();
})();
