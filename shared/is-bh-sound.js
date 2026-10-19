/* Стаття 34, розділ 02: фоновий гул чорної діри — лише за кнопкою, за замовчуванням вимкнено.
   Звук синтезується на льоту (Web Audio), тож точки повтору немає й нема чому клацати: низькі тони з повільним биттям,
   «грім» із коричневого шуму (буфер зациклено з перехресним згасанням кінця в початок) і тихий свист, що повільно плаває.
   Вхід і вихід — плавні (2 с). Коли блок поза екраном або вкладка схована — затихає. */
(function () {
  const view = document.getElementById('bhView'), box = document.getElementById('bh'); if (!view || !box) return;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bh-snd'; btn.setAttribute('aria-pressed', 'false');
  btn.textContent = 'Звук діри'; view.after(btn);
  let ac = null, master = null, on = false, seen = false;
  const LEVEL = .32;
  function build() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0;
    const comp = ac.createDynamicsCompressor(); master.connect(comp).connect(ac.destination);
    // низькі тони: дві пари з малою розстройкою — повільне биття, як «дихання» діри
    [[36.7, .2], [37.05, .2], [55, .09], [55.4, .08], [73.4, .04]].forEach(([f, g]) => {
      const o = ac.createOscillator(), gn = ac.createGain(); o.frequency.value = f; gn.gain.value = g; o.connect(gn).connect(master); o.start(); });
    // коричневий шум; щоб повтор буфера був безшовним, останні F зразків перехресно змішуємо з першими
    const L = ac.sampleRate * 8, F = ac.sampleRate * 1, raw = new Float32Array(L + F); let b = 0;
    for (let i = 0; i < raw.length; i++) { b = (b + .02 * (Math.random() * 2 - 1)) / 1.02; raw[i] = b * 3.5; }
    const buf = ac.createBuffer(1, L, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < L; i++) d[i] = raw[i];
    for (let i = 0; i < F; i++) { const k = i / F; d[i] = raw[i] * k + raw[L + i] * (1 - k); }   // кінець плавно перетікає в початок
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140; lp.Q.value = .4;
    const ng = ac.createGain(); ng.gain.value = .55; src.connect(lp).connect(ng).connect(master); src.start();
    // повільне «накочування» грому (0,06 Гц) і свист, що плаває частотою (0,03 Гц)
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .06; lg.gain.value = .25; lfo.connect(lg).connect(ng.gain); lfo.start();
    const src2 = ac.createBufferSource(); src2.buffer = buf; src2.loop = true; src2.playbackRate.value = 1.7;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 6;
    const hg = ac.createGain(); hg.gain.value = .05; src2.connect(bp).connect(hg).connect(master); src2.start(4.3);
    const lfo2 = ac.createOscillator(), lg2 = ac.createGain(); lfo2.frequency.value = .03; lg2.gain.value = 160; lfo2.connect(lg2).connect(bp.frequency); lfo2.start();
  }
  function level() {
    if (!ac) return; const t = ac.currentTime, want = on && seen && !document.hidden ? LEVEL : 0;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(want, t + 2);
    if (want) ac.resume(); else setTimeout(() => { if (ac && !(on && seen && !document.hidden)) ac.suspend(); }, 2100);
  }
  btn.addEventListener('click', () => { on = !on; if (on && !ac) build(); btn.setAttribute('aria-pressed', String(on)); btn.classList.toggle('on', on); level(); });
  new IntersectionObserver((es) => { seen = es[0].isIntersecting; level(); }, { threshold: .15 }).observe(box);
  document.addEventListener('visibilitychange', level);
})();
