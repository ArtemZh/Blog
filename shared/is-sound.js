/* Стаття 34: звук усієї сторінки — один перемикач (на банері + плаваюча кнопка), за замовчуванням вимкнено.
   Увімкнули — грає музика сторінки (власні треки, Suno) по колу: кінець перетікає в початок за 6 с, без клацання.
   Три теми за місцем на сторінці: до тесеракта — «The Pocket Watch Tick», у розділі 08 — «The Final Tick»,
   після нього — «A-Minor Fading»; між ними — плавний перехід за 4 с;
   і вмикаються всі звуки розділів (гул діри в 02, цокання в 03, Морзе в 08). Коли звучить щось із них, тема стихає до чверті.
   Розділи спілкуються через window.IS_SOUND: on, duck(id, active), morse(c, i), fx(kind) і подію 'is-sound' {on}.
   Вкладку сховано — усе затихає. Без localStorage: вибір живе лише до перезавантаження. */
(function () {
  const S = window.IS_SOUND = { on: false, ctx: null, duck, morse, fx, wind };
  let master = null, music = null, verb = null, zone = 'main';
  const ducks = new Map();
  const A = 'assets/interstellar/audio/', XF = 6, SW = 4, LEVEL = .55, DUCKED = .14;
  const TR = { main: { url: A + 'main.m4a' }, tess: { url: A + 'tess.m4a' }, after: { url: A + 'theme.m4a' } };

  /* кнопки: одна в банері (під підзаголовком), друга — плаваюча, з'являється, коли банер прокручено */
  const css = document.createElement('style');
  css.textContent = `
    .snd-all{position:absolute;z-index:5;left:clamp(20px,5vw,72px);bottom:26px;display:inline-flex;align-items:center;gap:8px;font:600 13px/1 var(--sans);padding:10px 14px;border-radius:999px;cursor:pointer;
      border:1px solid rgba(255,255,255,.35);background:rgba(8,10,16,.45);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
    .snd-all.on{background:var(--act);border-color:var(--act)}
    .snd-fab{position:fixed;right:18px;bottom:76px;z-index:30;width:44px;height:44px;border-radius:50%;border:1px solid var(--rule-2);background:var(--ground);
      box-shadow:0 4px 18px rgba(0,0,0,.18);cursor:pointer;font-size:18px;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none}
    .snd-fab.show{opacity:1;transform:none;pointer-events:auto}
    .snd-fab.on{background:var(--act);border-color:var(--act)}
    @media(max-width:1080px){.snd-fab{bottom:86px;right:12px}}`;
  document.head.appendChild(css);
  const hero = document.querySelector('.hero3');                              // кнопка — над лінзою банера (у неї z-index 4)
  const b1 = document.createElement('button'); b1.type = 'button'; b1.className = 'snd-all'; if (hero) hero.appendChild(b1);
  const b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'snd-fab'; document.body.appendChild(b2);
  const paint = () => { b1.innerHTML = S.on ? '🔊 Звук статті увімкнено' : '🔇 Увімкнути звук статті'; b2.textContent = S.on ? '🔊' : '🔇';
    b2.title = S.on ? 'Вимкнути звук статті' : 'Увімкнути звук статті'; [b1, b2].forEach((b) => { b.classList.toggle('on', S.on); b.setAttribute('aria-pressed', String(S.on)); }); };
  paint();
  const heroEl = document.querySelector('.hero3');
  if (heroEl) new IntersectionObserver((es) => b2.classList.toggle('show', !es[0].isIntersecting)).observe(heroEl); else b2.classList.add('show');
  [b1, b2].forEach((b) => b.addEventListener('click', () => set(!S.on)));

  function ctx() {
    if (S.ctx) return S.ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    S.ctx = new AC(); master = S.ctx.createGain(); master.gain.value = 0; master.connect(S.ctx.destination);
    music = S.ctx.createGain(); music.gain.value = LEVEL; music.connect(master);
    // реверберація для Морзе й ефектів: імпульс із згасаючого шуму (2,4 с)
    const n = Math.round(S.ctx.sampleRate * 2.4), ir = S.ctx.createBuffer(2, n, S.ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    verb = S.ctx.createConvolver(); verb.buffer = ir; const vg = S.ctx.createGain(); vg.gain.value = .55; verb.connect(vg).connect(master);
    return S.ctx;
  }
  function load(k) {
    const T = TR[k]; if (T.p) return T.p;
    T.p = fetch(T.url).then((r) => r.arrayBuffer()).then((a) => new Promise((ok, no) => S.ctx.decodeAudioData(a, ok, no))).then((b) => { T.buf = b; return b; }).catch(() => null);
    return T.p;
  }
  /* кожна тема — своє безшовне коло (новий прохід стартує за XF с до кінця попереднього) і свій гейн, щоб перемикати темами плавно */
  function play(k, at) {
    const T = TR[k]; if (!T.buf || !S.on || !T.on) return;
    const c = S.ctx, s = c.createBufferSource(), g = c.createGain(); s.buffer = T.buf; s.connect(g).connect(T.g);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + XF);
    const end = at + T.buf.duration; g.gain.setValueAtTime(1, end - XF); g.gain.linearRampToValueAtTime(0, end);
    s.start(at); s.stop(end + .05); T.srcs.push(s); s.onended = () => { T.srcs = T.srcs.filter((x) => x !== s); };
    clearTimeout(T.loopT); T.loopT = setTimeout(() => play(k, end - XF), Math.max(0, (end - XF - c.currentTime - 1) * 1000));
  }
  function startTrack(k) {
    const T = TR[k], c = S.ctx; if (!T.g) { T.g = c.createGain(); T.g.gain.value = 0; T.g.connect(music); T.srcs = []; }
    T.on = true; T.g.gain.cancelScheduledValues(c.currentTime); T.g.gain.setValueAtTime(T.g.gain.value, c.currentTime); T.g.gain.linearRampToValueAtTime(1, c.currentTime + SW);
    load(k).then(() => { if (T.on && S.on && !T.srcs.length) play(k, c.currentTime + .1); });
  }
  function stopTrack(k, fade = SW) {
    const T = TR[k], c = S.ctx; if (!T.g || !T.on) return; T.on = false; clearTimeout(T.loopT);
    T.g.gain.cancelScheduledValues(c.currentTime); T.g.gain.setValueAtTime(T.g.gain.value, c.currentTime); T.g.gain.linearRampToValueAtTime(0, c.currentTime + fade);
    setTimeout(() => { if (!T.on) { T.srcs.forEach((s) => { try { s.stop(); } catch (e) {} }); T.srcs = []; } }, fade * 1000 + 100);
  }
  function stopMusic() { Object.keys(TR).forEach((k) => stopTrack(k, .6)); }
  /* де читач: до розділу 08 — main, поки 08 на екрані — tess, після — after */
  const tess = document.getElementById('tess');
  function where() { if (!tess) return 'main'; const r = tess.getBoundingClientRect(), h = innerHeight; return r.top > h * .6 ? 'main' : r.bottom < h * .4 ? 'after' : 'tess'; }
  function rezone() { const z = where(); if (z === zone) return; const old = zone; zone = z; if (!S.on || !S.ctx) return; stopTrack(old); startTrack(z); }
  let zr = 0; addEventListener('scroll', () => { if (!zr) zr = requestAnimationFrame(() => { zr = 0; rezone(); }); }, { passive: true });

  function set(on) {
    S.on = on; paint();
    if (on) {
      const c = ctx(); if (!c) return; c.resume();
      master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(master.gain.value, c.currentTime); master.gain.linearRampToValueAtTime(1, c.currentTime + 1.5);
      clearTimeout(ambT); ambT = setTimeout(ambient, 20000 + Math.random() * 15000);   // перший випадковий звук — за 20–35 с
      zone = where(); startTrack(zone); Object.keys(TR).forEach((k) => { if (k !== zone) setTimeout(() => load(k), 4000); });   // інші теми — у фоні, наперед
    } else if (S.ctx) {
      const c = S.ctx; master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(master.gain.value, c.currentTime); master.gain.linearRampToValueAtTime(0, c.currentTime + .8);
      clearTimeout(ambT); setTimeout(() => { if (!S.on) { stopMusic(); c.suspend(); } }, 900);
    }
    dispatchEvent(new CustomEvent('is-sound', { detail: { on } }));
  }
  document.addEventListener('visibilitychange', () => { if (!S.ctx || !S.on) return; document.hidden ? S.ctx.suspend() : S.ctx.resume(); });

  /* приглушення теми: будь-який розділ каже duck(id, true/false); тема — чверть гучності, поки хоч один активний */
  function duck(id, active) {
    if (active) ducks.set(id, true); else ducks.delete(id);
    if (!music) return; const c = S.ctx, want = ducks.size ? DUCKED : LEVEL;
    music.gain.cancelScheduledValues(c.currentTime); music.gain.setValueAtTime(music.gain.value, c.currentTime); music.gain.setTargetAtTime(want, c.currentTime, ducks.size ? .25 : 1.2);
  }

  /* Морзе як мелодія: кожен елемент — нота ля-мінорної пентатоніки (A C D E G), крапка — коротка й вища, тире — довша й нижча;
     м'який тембр (синус + тихий трикутник), трохи реверберації. i — номер елемента, щоб мелодія не стояла на одній ноті */
  const SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880];
  function morse(c, i) {
    if (!S.on || !S.ctx) return; const x = S.ctx, t = x.currentTime + .01, dot = c === '.', f = SCALE[(i * 3 + (dot ? 2 : 0)) % SCALE.length] * (dot ? 1 : .5), len = dot ? .16 : .42;
    const g = x.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .012); g.gain.setTargetAtTime(0, t + len * .6, len * .35);
    [['sine', 1, 1], ['triangle', 2, .18]].forEach(([type, m, a]) => { const o = x.createOscillator(), ga = x.createGain(); o.type = type; o.frequency.value = f * m; ga.gain.value = a;
      o.connect(ga).connect(g); o.start(t); o.stop(t + len + 1.2); });
    g.connect(master); g.connect(verb);
    duck('morse', true); clearTimeout(morse.t); morse.t = setTimeout(() => duck('morse', false), 1600);
  }
  /* вітер для Пилової чаші: безперервний коричневий шум через фільтр; level 0…1 — і гучність, і «яскравість» (буря ближче — шум вищий і густіший).
     Буфер шуму зациклено з перехресним згасанням, тож повтору не чути */
  let wnd = null;
  function wind(level) {
    if (!S.on || !S.ctx) { if (wnd) wnd.g.gain.setTargetAtTime(0, S.ctx ? S.ctx.currentTime : 0, .3); return; }
    const x = S.ctx;
    if (!wnd) {
      const L = x.sampleRate * 6, F = x.sampleRate, raw = new Float32Array(L + F); let b = 0;
      for (let i = 0; i < raw.length; i++) { b = (b + .02 * (Math.random() * 2 - 1)) / 1.02; raw[i] = b * 3.2; }
      const buf2 = x.createBuffer(1, L, x.sampleRate), d = buf2.getChannelData(0); for (let i = 0; i < L; i++) d[i] = raw[i]; for (let i = 0; i < F; i++) { const k = i / F; d[i] = raw[i] * k + raw[L + i] * (1 - k); }
      const src = x.createBufferSource(); src.buffer = buf2; src.loop = true;
      const lp = x.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; lp.Q.value = .7;
      const g = x.createGain(); g.gain.value = 0; src.connect(lp).connect(g).connect(master); src.start();
      const lfo = x.createOscillator(), lg = x.createGain(); lfo.frequency.value = .23; lg.gain.value = 120; lfo.connect(lg).connect(lp.frequency); lfo.start();   // пориви
      wnd = { g, lp };
    }
    const t = x.currentTime; wnd.g.gain.setTargetAtTime(.05 + .5 * level, t, .4); wnd.lp.frequency.setTargetAtTime(250 + 1500 * level, t, .6);
    duck('wind', level > .15);
  }
  wind.off = () => { if (wnd && S.ctx) wnd.g.gain.setTargetAtTime(0, S.ctx.currentTime, .4); duck('wind', false); };

  /* випадкові звуки кімнати й світу: раз на 25–60 с, тихо, з випадковим місцем у панорамі. Усе синтезовано, без файлів:
     тіки годинника, скрип дверей, скрип дощок, стук книжки (STAY з полиці Мерф), порив вітру з пилом, потріскування ефіру з писком Морзе, далекий грім */
  function noiseBuf(x, sec) { const b = x.createBuffer(1, Math.round(x.sampleRate * sec), x.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function out(x, pan, v) { const g = x.createGain(), p = x.createStereoPanner ? x.createStereoPanner() : null; g.gain.value = v; if (p) { p.pan.value = pan; g.connect(p); p.connect(master); p.connect(verb); } else { g.connect(master); g.connect(verb); } return g; }
  const AMB = {
    ticks(x, t, o) { const n = 3 + (Math.random() * 4 | 0); for (let i = 0; i < n; i++) { const s = t + i * .5, src = x.createBufferSource(), bp = x.createBiquadFilter(), g = x.createGain();
      src.buffer = noiseBuf(x, .03); bp.type = 'bandpass'; bp.frequency.value = i % 2 ? 3200 : 2600; bp.Q.value = 3; g.gain.setValueAtTime(.5, s); g.gain.exponentialRampToValueAtTime(.001, s + .03); src.connect(bp).connect(g).connect(o); src.start(s); } },
    door(x, t, o) { const len = 1.4 + Math.random(), osc = x.createOscillator(), bp = x.createBiquadFilter(), g = x.createGain(), lfo = x.createOscillator(), lg = x.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(140, t); osc.frequency.linearRampToValueAtTime(95 + Math.random() * 40, t + len);
      lfo.frequency.value = 18 + Math.random() * 10; lg.gain.value = 25; lfo.connect(lg).connect(osc.frequency);   // нерівне «тертя» петлі
      bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 6; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .15); g.gain.linearRampToValueAtTime(.08, t + len * .7); g.gain.linearRampToValueAtTime(0, t + len);
      osc.connect(bp).connect(g).connect(o); osc.start(t); lfo.start(t); osc.stop(t + len); lfo.stop(t + len); },
    floor(x, t, o) { [0, .35].forEach((d) => { const s = t + d, osc = x.createOscillator(), g = x.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(70 + Math.random() * 30, s); osc.frequency.linearRampToValueAtTime(55, s + .25);
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(.18, s + .04); g.gain.exponentialRampToValueAtTime(.001, s + .3); osc.connect(g).connect(o); osc.start(s); osc.stop(s + .32); }); },
    book(x, t, o) { const osc = x.createOscillator(), g = x.createGain(), src = x.createBufferSource(), lp = x.createBiquadFilter(), g2 = x.createGain();
      osc.frequency.setValueAtTime(110, t); osc.frequency.exponentialRampToValueAtTime(48, t + .15); g.gain.setValueAtTime(.45, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); osc.connect(g).connect(o); osc.start(t); osc.stop(t + .3);
      src.buffer = noiseBuf(x, .12); lp.type = 'lowpass'; lp.frequency.value = 1200; g2.gain.setValueAtTime(.25, t); g2.gain.exponentialRampToValueAtTime(.001, t + .12); src.connect(lp).connect(g2).connect(o); src.start(t); },
    gust(x, t, o) { const len = 3.5, src = x.createBufferSource(), bp = x.createBiquadFilter(), g = x.createGain(); src.buffer = noiseBuf(x, len); bp.type = 'bandpass'; bp.Q.value = .8;
      bp.frequency.setValueAtTime(250, t); bp.frequency.linearRampToValueAtTime(900, t + len * .5); bp.frequency.linearRampToValueAtTime(300, t + len);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14, t + len * .45); g.gain.linearRampToValueAtTime(0, t + len); src.connect(bp).connect(g).connect(o); src.start(t); },
    radio(x, t, o) { const len = 2.6, src = x.createBufferSource(), hp = x.createBiquadFilter(), g = x.createGain(); src.buffer = noiseBuf(x, len); hp.type = 'highpass'; hp.frequency.value = 2500;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.04, t + .3); g.gain.linearRampToValueAtTime(0, t + len); src.connect(hp).connect(g).connect(o); src.start(t);
      [0, .18, .36, .9].forEach((d, i) => { const s = t + .6 + d, osc = x.createOscillator(), gg = x.createGain(), L = i === 3 ? .3 : .09; osc.frequency.value = 760; gg.gain.setValueAtTime(0, s); gg.gain.linearRampToValueAtTime(.05, s + .01); gg.gain.setValueAtTime(.05, s + L); gg.gain.linearRampToValueAtTime(0, s + L + .02); osc.connect(gg).connect(o); osc.start(s); osc.stop(s + L + .05); }); },
    thunder(x, t, o) { const len = 4.5, src = x.createBufferSource(), lp = x.createBiquadFilter(), g = x.createGain(); src.buffer = noiseBuf(x, len); lp.type = 'lowpass'; lp.frequency.value = 160;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.55, t + .5); g.gain.exponentialRampToValueAtTime(.001, t + len); src.connect(lp).connect(g).connect(o); src.start(t); },
  };
  let ambT = 0;
  function ambient() {
    clearTimeout(ambT); ambT = setTimeout(ambient, 25000 + Math.random() * 35000);
    if (!S.on || !S.ctx || document.hidden || S.ctx.state !== 'running') return;
    const keys = Object.keys(AMB), k = keys[Math.random() * keys.length | 0], x = S.ctx;
    AMB[k](x, x.currentTime + .05, out(x, Math.random() * 1.4 - .7, .55));
  }
  S.ambient = AMB;

  /* ефекти: 'whoosh\' — шелест-наплив (шум через фільтр, що їде вгору), 'chime' — тихий дзвіночок (дві чисті ноти) */
  function fx(kind) {
    if (!S.on || !S.ctx) return; const x = S.ctx, t = x.currentTime + .01;
    if (kind === 'whoosh') {
      const n = x.createBufferSource(), len = 1.6, b = x.createBuffer(1, Math.round(x.sampleRate * len), x.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      n.buffer = b; const bp = x.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(2400, t + len);
      const g = x.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + len * .55); g.gain.linearRampToValueAtTime(0, t + len);
      n.connect(bp).connect(g); g.connect(master); g.connect(verb); n.start(t);
    } else if (kind === 'chime') {
      [880, 1318.5].forEach((f, k) => { const o = x.createOscillator(), g = x.createGain(); o.frequency.value = f; const s = t + k * .12;
        g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(.09, s + .01); g.gain.setTargetAtTime(0, s + .05, .5); o.connect(g); g.connect(master); g.connect(verb); o.start(s); o.stop(s + 3); });
    }
  }
})();
