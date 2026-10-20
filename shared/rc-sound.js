/* Стаття 35: звук сторінки — один перемикач (на банері + плаваюча кнопка), за замовчуванням вимкнено. Без файлів: усе синтезується (Web Audio).
   Фон — тиха генеративна тема: м'який акорд-пад (ля мінор → фа → до → соль, по 8 с) і поодинокі «фортепіанні» ноти пентатоніки.
   Ефекти розділів — через window.RC_SND.fx(kind, arg): тік місяців і дзвін подій у 03, глухий удар/легкий клік у 02 (рецесія чи ні),
   сигнал приладу в 05 (висота за кольором), гудок танкера й тривога блокади в 06, «будівництво» вежі в 07, акорд сценарію в 10, шурхіт у 01.
   Коли звучить ефект, фон ненадовго стихає. Вкладку сховано — усе затихає. Без localStorage. */
(function () {
  const S = window.RC_SND = { on: false, fx };
  let ac = null, master = null, bed = null, fxBus = null, verb = null, padT = 0, noteT = 0, step = 0, duckT = 0;
  const LEVEL = .5, BED = .5;

  const css = document.createElement('style');
  css.textContent = `
    .snd-all{position:absolute;z-index:5;left:clamp(20px,5vw,72px);bottom:26px;display:inline-flex;align-items:center;gap:8px;font:600 13px/1 var(--sans);padding:10px 14px;border-radius:999px;cursor:pointer;
      border:1px solid rgba(255,255,255,.35);background:rgba(8,10,16,.45);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
    .snd-all.on{background:var(--act);border-color:var(--act)}
    .snd-fab{position:fixed;right:18px;bottom:76px;z-index:30;width:44px;height:44px;border-radius:50%;border:1px solid var(--rule-2);background:var(--ground);
      box-shadow:0 4px 18px rgba(0,0,0,.18);cursor:pointer;font-size:18px;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none}
    .snd-fab.show{opacity:1;transform:none;pointer-events:auto}
    .snd-fab.on{background:var(--act);border-color:var(--act)}
    @media(max-width:1080px){.snd-fab{bottom:86px;right:12px}}
    @media(max-width:860px){.snd-all{left:auto;right:14px;bottom:auto;top:14px;padding:8px 12px;font-size:12px}}`;
  document.head.appendChild(css);
  const hero = document.querySelector('.hero3');
  const b1 = document.createElement('button'); b1.type = 'button'; b1.className = 'snd-all'; if (hero) hero.appendChild(b1);
  const b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'snd-fab'; document.body.appendChild(b2);
  const paint = () => { b1.innerHTML = S.on ? '🔊 Звук статті увімкнено' : '🔇 Увімкнути звук статті'; b2.textContent = S.on ? '🔊' : '🔇';
    b2.title = S.on ? 'Вимкнути звук статті' : 'Увімкнути звук статті'; [b1, b2].forEach((b) => { b.classList.toggle('on', S.on); b.setAttribute('aria-pressed', String(S.on)); }); };
  paint();
  if (hero) new IntersectionObserver((es) => b2.classList.toggle('show', !es[0].isIntersecting)).observe(hero); else b2.classList.add('show');
  [b1, b2].forEach((b) => b.addEventListener('click', () => set(!S.on)));

  function init() {
    if (ac) return ac; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); master = ac.createGain(); master.gain.value = 0;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; master.connect(comp).connect(ac.destination);
    bed = ac.createGain(); bed.gain.value = BED; bed.connect(master);
    fxBus = ac.createGain(); fxBus.gain.value = 1; fxBus.connect(master);
    // реверберація: імпульс із згасаючого шуму (3 с)
    const n = Math.round(ac.sampleRate * 3), ir = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.4); }
    verb = ac.createConvolver(); verb.buffer = ir; const vg = ac.createGain(); vg.gain.value = .5; verb.connect(vg).connect(master);
    return ac;
  }
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // акорди (MIDI): Am, F, C, G — у низькому регістрі, тихо
  const CH = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [36, 43, 48, 52, 55], [43, 50, 55, 59, 62]];
  const PENTA = [69, 72, 74, 76, 79, 81, 84];
  function pad(at) {
    const ch = CH[step % 4]; step++;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(380, at); lp.frequency.linearRampToValueAtTime(900, at + 4); lp.frequency.linearRampToValueAtTime(420, at + 9); lp.Q.value = .6;
    const g = ac.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.05, at + 3); g.gain.setValueAtTime(.05, at + 6.5); g.gain.linearRampToValueAtTime(0, at + 10);
    lp.connect(g); g.connect(bed); g.connect(verb);
    ch.forEach((m) => [-6, 6].forEach((dt) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = dt; const og = ac.createGain(); og.gain.value = .22; o.connect(og).connect(lp); o.start(at); o.stop(at + 10.2); }));
  }
  function pluck(m, at, v = .06, dest) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = hz(m); o2.frequency.value = hz(m) * 2;
    const g2 = ac.createGain(); g2.gain.value = .25; o2.connect(g2).connect(g); o.connect(g);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .008); g.gain.setTargetAtTime(0, at + .02, .6);
    g.connect(dest || bed); g.connect(verb); o.start(at); o2.start(at); o.stop(at + 3); o2.stop(at + 3);
  }
  function loop() {
    if (!S.on || !ac) return; const now = ac.currentTime;
    if (now + 1 > padT) { pad(Math.max(now + .05, padT)); padT = Math.max(now + .05, padT) + 8; }
    if (now > noteT) { pluck(PENTA[(Math.random() * PENTA.length) | 0] - 12 * (Math.random() < .4), now + .05, .035); noteT = now + 2 + Math.random() * 4; }
    setTimeout(loop, 400);
  }
  function duck() { if (!ac) return; const t = ac.currentTime; bed.gain.cancelScheduledValues(t); bed.gain.setValueAtTime(bed.gain.value, t); bed.gain.linearRampToValueAtTime(BED * .3, t + .15);
    clearTimeout(duckT); duckT = setTimeout(() => { const t2 = ac.currentTime; bed.gain.cancelScheduledValues(t2); bed.gain.setValueAtTime(bed.gain.value, t2); bed.gain.linearRampToValueAtTime(BED, t2 + 2); }, 1400); }
  function noise(len, at, f0, f1, v, q = 1.2) {
    const b = ac.createBuffer(1, Math.round(ac.sampleRate * len), ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, at); bp.frequency.exponentialRampToValueAtTime(f1, at + len);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + len * .4); g.gain.linearRampToValueAtTime(0, at + len);
    s.connect(bp).connect(g); g.connect(fxBus); g.connect(verb); s.start(at);
  }
  function tone(f, at, len, v, type = 'sine', dest) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .01); g.gain.setTargetAtTime(0, at + len * .3, len * .35); o.connect(g); g.connect(dest || fxBus); g.connect(verb); o.start(at); o.stop(at + len * 2.5); return o; }
  let lastTick = 0;
  function fx(kind, arg) {
    if (!S.on || !ac) return; const t = ac.currentTime + .01;
    if (kind === 'tick') { if (t - lastTick < .06) return; lastTick = t; tone(2400, t, .03, .025, 'square'); return; }      // тік місяця, без приглушення фону
    duck();
    if (kind === 'event') { const m = 72 + ((arg || 0) * 5) % 12; pluck(m, t, .09, fxBus); pluck(m + 7, t + .09, .06, fxBus); }
    else if (kind === 'whoosh') noise(1.1, t, 300, 2200, .1);
    else if (kind === 'thud') { const o = tone(70, t, .6, .3); o.frequency.exponentialRampToValueAtTime(38, t + .5); noise(.4, t, 200, 80, .06, .7); }
    else if (kind === 'click') tone(1320, t, .08, .05, 'triangle');
    else if (kind === 'gauge') { const f = arg === 'g' ? 880 : arg === 'y' ? 660 : 440; tone(f, t, .25, .07); tone(f * 1.5, t + .07, .25, .04); }
    else if (kind === 'horn') { [55, 55.6, 110].forEach((f, i) => { const o = tone(f, t, 1.6, i < 2 ? .12 : .05, 'sawtooth'); }); }
    else if (kind === 'alarm') { for (let i = 0; i < 3; i++) { tone(330, t + i * .45, .2, .06, 'triangle'); tone(277, t + i * .45 + .2, .2, .05, 'triangle'); } }
    else if (kind === 'build') { const n = Math.min(6, arg || 3); for (let i = 0; i < n; i++) tone(hz(60 + i * 2), t + i * .09, .12, .035, 'square'); }
    else if (kind === 'chord') { const C2 = arg === 'soft' ? [60, 64, 67, 72] : arg === 'stag' ? [57, 60, 64, 69] : [59, 62, 65, 68]; C2.forEach((m, i) => pluck(m, t + i * .06, .06, fxBus)); }
    else if (kind === 'blip') tone(hz(76 + (arg || 0)), t, .1, .05, 'sine');
  }
  function set(on) {
    if (on && !init()) return; S.on = on; paint();
    if (ac) { const t = ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(on ? LEVEL : 0, t + (on ? 1.5 : .6));
      if (on) { ac.resume(); padT = ac.currentTime + .1; noteT = ac.currentTime + 3; loop(); } else setTimeout(() => { if (!S.on) ac.suspend(); }, 700); }
    dispatchEvent(new CustomEvent('rc-sound', { detail: { on } }));
  }
  document.addEventListener('visibilitychange', () => { if (!ac || !S.on) return; document.hidden ? ac.suspend() : ac.resume(); });
})();
