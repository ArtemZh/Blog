/* Стаття 39 «43 мілісекунди» (на основі cf-sound.js): звук сторінки — один перемикач (банер + плаваюча кнопка), за замовчуванням вимкнено, без localStorage.
   Фон: трек Suno assets/cables/audio/bed.m4a у петлі (тихо, гучність ≈ 0,38, під ефектами стихає); поки файлу немає —
   синтез у браузері: низькі глибоководні акорди по 8 с і поодинокі далекі ноти.
   Ролик (shared/oc-reel.js) грає власний трек assets/cables/audio/reel.m4a синхронно з кадром через OC_SND.reel(on, t); фон тим часом мовчить.
   Ефекти — window.OC_SND.fx(kind, arg): тік, морзе, пробій, згасання, обрив, гудок, сигнал. */
(function () {
  const S = window.OC_SND = { on: false, fx, reel };
  let ac = null, master = null, bed = null, fxBus = null, verb = null, padT = 0, noteT = 0, step = 0, duckT = 0;
  const LEVEL = .5, BED = .5, TRK = .38, A = 'assets/cables/audio/';
  let bedSrc = null, bedBuf = null, reelSrc = null, reelBuf = null, reelOn = false, tried = false;

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
  const hero = document.querySelector('.oc-hero');
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
  // акорди (MIDI): Dmaj7, Bm7, Em7, A7 — теплі, тихо
  const CH = [[38, 45, 50, 57, 60], [36, 43, 48, 55, 62], [41, 48, 53, 57, 60], [33, 40, 45, 52, 60]];
  const PENTA = [74, 76, 79, 81, 84, 86];
  function pad(at) {
    const ch = CH[step % 4]; step++;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(380, at); lp.frequency.linearRampToValueAtTime(900, at + 4); lp.frequency.linearRampToValueAtTime(420, at + 9); lp.Q.value = .6;
    const g = ac.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.05, at + 3); g.gain.setValueAtTime(.05, at + 6.5); g.gain.linearRampToValueAtTime(0, at + 10);
    lp.connect(g); g.connect(bed); g.connect(verb);
    ch.forEach((m) => [-6, 6].forEach((dt) => { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(m); o.detune.value = dt; const og = ac.createGain(); og.gain.value = .22; o.connect(og).connect(lp); o.start(at); o.stop(at + 10.2); }));
  }
  function pluck(m, at, v = .06, dest) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = hz(m); o2.frequency.value = hz(m) * 2;
    const g2 = ac.createGain(); g2.gain.value = .25; o2.connect(g2).connect(g); o.connect(g);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .008); g.gain.setTargetAtTime(0, at + .02, .6);
    g.connect(dest || bed); g.connect(verb); o.start(at); o2.start(at); o.stop(at + 3); o2.stop(at + 3);
  }
  function loop() {
    if (!S.on || !ac) return; const now = ac.currentTime;
    if (bedSrc || reelOn) { setTimeout(loop, 400); return; }
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
    if (kind === 'tick') { if (t - lastTick < .06) return; lastTick = t; tone(1800 + (arg || 0) * 20, t, .03, .02, 'square'); return; }      // тік термометра, без приглушення фону
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
    else if (kind === 'morse') { [0, .1, .32, .54].forEach((d, i) => tone(740, t + d, i === 2 ? .18 : .06, .035, 'square')); }
    else if (kind === 'zap') { noise(.25, t, 5000, 1200, .12, .8); tone(90, t, .3, .1, 'sawtooth'); }
    else if (kind === 'fade') { const o = tone(740, t, 1.8, .05, 'square'); o.frequency.exponentialRampToValueAtTime(220, t + 1.6); }
    else if (kind === 'snap') { noise(.08, t, 2600, 900, .14, 1.4); tone(58 - (arg || 0) * 2, t, .5, .22); }
    else if (kind === 'send') { tone(hz(84), t, .1, .05); tone(hz(91), t + .09, .18, .05); }
  }
  // доріжки Suno: фон у петлі; якщо файлу немає — лишається синтез
  const load = (f) => fetch(A + f + '?v=1').then((r) => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then((b) => ac.decodeAudioData(b)).catch(() => null);
  async function bedOn() { if (bedSrc || reelOn || !S.on) return; if (!tried) { tried = true; bedBuf = await load('bed.m4a'); } if (!bedBuf || bedSrc || reelOn || !S.on) return;
    bedSrc = ac.createBufferSource(); bedSrc.buffer = bedBuf; bedSrc.loop = true; const g = ac.createGain(); g.gain.value = TRK / BED; bedSrc.connect(g).connect(bed); bedSrc.start(); }
  function bedOff() { if (bedSrc) { try { bedSrc.stop(); } catch (e) {} bedSrc = null; } }
  // ролик: свій трек із позиції t; фон мовчить, поки ролик грає
  async function reel(on, t = 0) { reelOn = on; if (reelSrc) { try { reelSrc.stop(); } catch (e) {} reelSrc = null; }
    if (!S.on || !ac) return; if (!on) { bedOn(); return; } bedOff();
    if (!reelBuf) reelBuf = await load('reel.m4a'); if (!reelBuf || !reelOn) return;
    reelSrc = ac.createBufferSource(); reelSrc.buffer = reelBuf; const g = ac.createGain(); g.gain.value = .55; reelSrc.connect(g).connect(master); reelSrc.start(ac.currentTime + .02, Math.min(t, reelBuf.duration - .05)); }
  function set(on) {
    if (on && !init()) return; S.on = on; paint();
    if (ac) { const t = ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(on ? LEVEL : 0, t + (on ? 1.5 : .6));
      if (on) { ac.resume(); padT = ac.currentTime + .1; noteT = ac.currentTime + 3; loop(); bedOn(); } else { bedOff(); setTimeout(() => { if (!S.on) ac.suspend(); }, 700); } }
    dispatchEvent(new CustomEvent('oc-sound', { detail: { on } }));
  }
  document.addEventListener('visibilitychange', () => { if (!ac || !S.on) return; document.hidden ? ac.suspend() : ac.resume(); });
})();
