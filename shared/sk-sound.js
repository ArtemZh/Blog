/* Стаття 36: звук сторінки — один перемикач (банер + плаваюча кнопка), за замовчуванням УВІМКНЕНО (оживає з першим дотиком чи клавішею —
   так вимагає браузер), без localStorage. Трек — окремо: програвач у банері поруч із перемикачем, ▶ натискає читач (рішення власника 24.10).
   Фон — тема Suno «Protocol Underscore» (мінімалістична електроніка в дусі техно-трилера) (assets/skill/audio/ambient.m4a) по колу: кінець перетікає в початок за 6 с.
   Трейлер v6: SK_SND.trailer(true, t, { end, voice, sec, hits, risers, push, cut, ticks, vv }) — трейлерна музика синтезується в Web Audio з моменту t
   (120 уд/хв, детерміновано від t, шина з компресором і лімітером), голос (jarvis-0N.m4a) — за тим самим годинником; фон тим часом стихає; trailer(false) зупиняє все.
   v6: окрема тема «Пуш» у C-мажорі (арп запуску 1/8 → 1/16 → 1/32, висхідний shepard-тон, хор-пед) і звук пост-кредиту
   (тріск передавача, шипіння, гул флотів, цокання міни, удар).
   Гучність музики — тихо: 0,38 (правило скіла після 34). Ефекти синтезуються: клавіатура, затвор, удари на межах тактів,
   станції конвеєра, клацання поміток, перевертання карток. Рідкісні звуки майстерні раз на 25–60 с: шелест паперу, далекий друк, клацання миші. */
(function () {
  const S = window.SK_SND = { on: true, track: false, fx, trailer };
  const A = 'assets/skill/audio/', XF = 6, LEVEL = .38, DUCK = 0, FXV = .9;   // під трейлером фон глушиться повністю (прохання власника)
  let trkAt = 0, trkDur = 0, trkOff = 0, ambSrc = [], ac = null, master = null, music = null, fxBus = null, verb = null, voiceSend = null, amb = null, tr = null, ambT = 0, rndT = 0, duckN = 0;
  const css = document.createElement('style');
  css.textContent = `.snd-all{position:absolute;z-index:5;left:clamp(20px,5vw,72px);bottom:26px;display:inline-flex;align-items:center;gap:8px;font:600 13px/1 var(--sans);padding:10px 14px;border-radius:999px;cursor:pointer;
      border:1px solid rgba(255,255,255,.35);background:rgba(8,10,16,.45);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
    .snd-all.on{background:var(--act);border-color:var(--act)}
    .snd-fab{position:fixed;right:18px;bottom:76px;z-index:30;width:44px;height:44px;border-radius:50%;border:1px solid var(--rule-2);background:var(--ground);box-shadow:0 4px 18px rgba(0,0,0,.18);cursor:pointer;font-size:18px;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none}
    .snd-fab.show{opacity:1;transform:none;pointer-events:auto} .snd-fab.on{background:var(--act);border-color:var(--act)}
    .snd-bar{position:absolute;z-index:5;left:clamp(20px,5vw,72px);bottom:26px;display:flex;align-items:center;gap:10px;flex-wrap:wrap} .snd-bar .snd-all{position:static}
    .snd-trk{display:inline-flex;align-items:center;gap:10px;font:600 13px/1 var(--sans);padding:5px 14px 5px 5px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(8,10,16,.45);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
    .snd-trk button{width:30px;height:30px;border-radius:50%;border:0;background:#fff;color:#0b0d12;font-size:12px;line-height:30px;cursor:pointer;padding:0}
    .snd-trk.on button{background:var(--act);color:#fff} .snd-trk i{font-style:normal;opacity:.85;white-space:nowrap}
    .snd-trk .bar{position:relative;width:90px;height:3px;border-radius:2px;background:rgba(255,255,255,.25);overflow:hidden} .snd-trk .bar b{position:absolute;inset:0 auto 0 0;width:0;background:#fff}
    .snd-trk time{font:500 12px/1 var(--mono,ui-monospace,monospace);opacity:.75;min-width:76px}
    @media(max-width:1080px){.snd-fab{bottom:86px;right:12px}} @media(max-width:860px){.snd-all{left:auto;right:14px;bottom:auto;top:14px;padding:8px 12px;font-size:12px} .snd-bar{left:auto;right:14px;top:14px;bottom:auto;flex-direction:column;align-items:flex-end;gap:6px} .snd-trk{padding:3px 10px 3px 3px;gap:8px} .snd-trk button{width:26px;height:26px;line-height:26px} .snd-trk .bar{width:56px} .snd-trk i{display:none}}`;
  document.head.appendChild(css);
  const hero = document.querySelector('.hero3');
  const b1 = document.createElement('button'); b1.type = 'button'; b1.className = 'snd-all'; const bar = document.createElement('div'); bar.className = 'snd-bar'; bar.appendChild(b1);
  // програвач треку: ▶ / ❚❚, назва, смужка, час — трек вмикає лише читач
  const pl = document.createElement('div'); pl.className = 'snd-trk';
  pl.innerHTML = '<button type="button" aria-label="Грати трек">▶</button><i>Protocol Underscore</i><span class="bar"><b></b></span><time>0:00 / —:—</time>';
  bar.appendChild(pl); if (hero) hero.appendChild(bar);
  const pb = pl.querySelector('button'), pf = pl.querySelector('.bar b'), pt = pl.querySelector('time');
  const b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'snd-fab'; document.body.appendChild(b2);
  const paint = () => { b1.innerHTML = S.on ? '🔊 Звук статті увімкнено' : '🔇 Увімкнути звук статті'; b2.textContent = S.on ? '🔊' : '🔇'; [b1, b2].forEach((b) => { b.classList.toggle('on', S.on); b.setAttribute('aria-pressed', String(S.on)); }); };
  paint(); if (hero) new IntersectionObserver((es) => b2.classList.toggle('show', !es[0].isIntersecting)).observe(hero); else b2.classList.add('show');
  [b1, b2].forEach((b) => b.addEventListener('click', () => set(!S.on)));
  const mmss = (v) => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
  let pIv = 0;
  function paintTrk() { pb.textContent = S.track ? '❚❚' : '▶'; pb.setAttribute('aria-label', S.track ? 'Пауза' : 'Грати трек'); pl.classList.toggle('on', S.track);
    const e = !trkDur ? 0 : S.track && ac ? Math.max(0, Math.min(trkDur, ac.currentTime - trkAt)) : trkOff; pf.style.width = trkDur ? `${e / trkDur * 100}%` : '0';
    pt.textContent = `${mmss(e)} / ${trkDur ? mmss(trkDur) : '—:—'}`; }
  pb.addEventListener('click', () => track(!S.track));
  // звук за замовчуванням увімкнено: браузер дає запустити аудіо лише після жесту — оживаємо з першим дотиком чи клавішею
  const wake = () => { removeEventListener('pointerdown', wake, true); removeEventListener('keydown', wake, true); if (S.on && !ac) set(true); };
  addEventListener('pointerdown', wake, true); addEventListener('keydown', wake, true);

  function init() {
    if (ac) return ac; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    music = ac.createGain(); music.gain.value = LEVEL; music.connect(master);
    fxBus = ac.createGain(); fxBus.gain.value = FXV; fxBus.connect(master);
    const n = Math.round(ac.sampleRate * 2.4), ir = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    verb = ac.createConvolver(); verb.buffer = ir; const vg = ac.createGain(); vg.gain.value = .4; verb.connect(vg).connect(master);
    // голос трейлера: трохи кімнати зі спільної реверберації
    voiceSend = ac.createGain(); voiceSend.gain.value = .16; voiceSend.connect(verb);
    return ac;
  }
  const bufs = {};
  const load = (k, v = 2) => bufs[k] || (bufs[k] = fetch(A + k + '.m4a?v=' + v).then((r) => r.arrayBuffer()).then((a) => new Promise((ok, no) => ac.decodeAudioData(a, ok, no))).catch(() => null));
  // фон: безшовне коло, кожен прохід стартує за XF до кінця попереднього
  function ambient(at, first, off = 0) { load('ambient').then((b) => { if (!b || !S.on || !S.track || amb === 'off') return; at = Math.max(at, ac.currentTime + .02); const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; s.connect(g).connect(music);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + (first ? .8 : XF)); off = Math.min(off, b.duration - XF - 1) > 0 ? off : 0; trkAt = at - off; trkDur = b.duration; s.g = g; const end = at + b.duration - off; g.gain.setValueAtTime(1, end - XF); g.gain.linearRampToValueAtTime(0, end);
    s.start(at, off); s.stop(end + .05); amb = s; ambSrc.push(s); s.onended = () => { ambSrc = ambSrc.filter((z) => z !== s); }; clearTimeout(ambT); ambT = setTimeout(() => ambient(end - XF), Math.max(0, (end - XF - ac.currentTime - 1) * 1000)); }); }
  function musicTo(v, sec) { if (!ac) return; const t = ac.currentTime; music.gain.cancelScheduledValues(t); music.gain.setValueAtTime(music.gain.value, t); music.gain.linearRampToValueAtTime(v, t + sec); }
  // ── трейлер v5: гібридний оркестрово-електронний трейлерний саунд, синтез у Web Audio, детерміновано від t ──
  // SK_SND.trailer(true, t, opt) — музика з моменту t; голос Джарвіса — за тим самим годинником; фон сторінки тим часом стихає; trailer(false) зупиняє все.
  // opt (партитура задається в sk-trailer.js): end — кінець ролика; voice — [[с, файл, тривалість]]; sec — [[с, рівні шарів]];
  //   hits — [[с, сила]] глибокі удари; risers — [[с удару, довжина, сила]]; motif — [[с, транспозиція, 'bell'|'big', рівень]] лейтмотив;
  //   fast — з цієї секунди акорди міняються щодва такти (до неї — щочотири); mod — модуляція на тон угору (v5); cut — обрив (титр);
  //   push — [a, z] тема «Пуш»: C-мажор I–V–vi–IV по такту; шари секцій pa/pr (арп запуску й ділення 8 · 16 · 32), shep (shepard-тон), choir (хор-пед);
  //   пост-кредит: шари crk (тріск передавача), hiss (шипіння), hum (гул флотів); ticks — [с] цокання міни; vv — версія файлів голосу.
  // Шари: дрон (розстроєні пилки + сабсинус, НЧ-фільтр) · «струнний» пед (акорд із плавним голосоведенням, широке стерео) ·
  //   остинато «струнне стакато» 1/8 або 1/16 · лейтмотив із 6 нот (дзвін; у кульмінації — «мідь» октавами) · riser (шум + пилка вгору) ·
  //   удари (саб-удар + низький шум + довга темна реверберація; без «braam» і без металу) · низькі барабани · цифровий глітч (клацання,
  //   «біт-крашер»-хвости, швидкі арпеджіо 1/32) · тихе «хакерське» арпеджіо. Стерео — панорамування шарів; шина: компресор → лімітер.
  const BEAT = .5, ST = BEAT / 4, CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];   // i – VI – III – VII: Am – F – C – G
  const CP = [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]];   // «Пуш», відносний мажор: I – V – vi – IV: C – G – Am – F
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12), h01 = (n) => { const v = Math.sin(n * 91.7 + 17.3) * 43758.5453; return v - Math.floor(v); };
  // лейтмотив: [доля від початку, MIDI, тривалість у долях] — A C E D C B, два такти
  const MOTIF = [[0, 69, 1], [1, 72, 1], [2, 76, 2], [4, 74, 1], [5, 72, 1], [6, 71, 2]];
  const ex = (a, b, f) => a * Math.pow(b / a, Math.max(0, Math.min(1, f)));
  const IRC = {};
  // темна довга реверберація 4,5 с (детермінований шум через однополюсний НЧ-фільтр)
  function darkIR(c) { const k = c.sampleRate; if (IRC[k]) return IRC[k]; const n = Math.round(k * 4.5), b = c.createBuffer(2, n, k);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { lp += ((h01(i * 1.37 + ch * 7777.7) * 2 - 1) - lp) * .3; d[i] = lp * 1.8 * Math.pow(1 - i / n, 3.2); } }
    return (IRC[k] = b); }
  // c — AudioContext або OfflineAudioContext, out — куди; live — реальний час (інакше zero = −t0). Повертає { src, pump(горизонт), vDuck }
  function score(c, out, t0, opt, live) {
    const FAST = opt.fast == null ? 0 : opt.fast, MOT = opt.motif || [], end = opt.end || 1e9, SEC = opt.sec && opt.sec.length ? opt.sec : [[0, { drone: .6 }]], HITS = opt.hits || [], RIS = opt.risers || [], MOD = opt.mod == null ? 1e9 : opt.mod, CUT = opt.cut == null ? 1e9 : opt.cut, PU = opt.push || [1e9, 1e9], TK = opt.ticks || [];
    const me = { src: [] }, zero = (live ? c.currentTime + .06 : 0) - t0, T0 = zero + t0;
    // шина: сума → компресор → лімітер → «дак» під голос → загальна гучність → вихід
    const bus = c.createGain(), comp = c.createDynamicsCompressor(), lim = c.createDynamicsCompressor(), dk = c.createGain(), og = c.createGain();
    comp.threshold.value = -18; comp.knee.value = 8; comp.ratio.value = 3.5; comp.attack.value = .006; comp.release.value = .25;
    lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .08;
    bus.connect(comp).connect(lim).connect(dk).connect(og).connect(out);
    // реверберація: на вході зрізано низ (< 140 Гц), щоб хвости не каламутили бас
    const rvIn = c.createBiquadFilter(); rvIn.type = 'highpass'; rvIn.frequency.value = 140; const rv = c.createConvolver(); rv.buffer = darkIR(c); const rvg = c.createGain(); rvg.gain.value = .6; rvIn.connect(rv); rv.connect(rvg).connect(bus);
    const room = c.createGain(); room.gain.value = .14; room.connect(rvIn);
    // загальна гучність: наплив 0,4 с, згасання за останні 1,5 с
    const L = LEVEL * 1.5; og.gain.setValueAtTime(0, T0); og.gain.linearRampToValueAtTime(L, T0 + .4);
    if (end < 1e9 && end - 1.5 > t0 + .4) { og.gain.setValueAtTime(L, zero + end - 1.5); og.gain.linearRampToValueAtTime(0, zero + end); }
    // музика тихішає на 5 дБ під репліками
    dk.gain.setValueAtTime(1, T0); (opt.voice || []).forEach(([a, , d]) => { if (!d || a + d < t0) return; const s = Math.max(T0, zero + a - .08); dk.gain.setTargetAtTime(.55, s, .04); dk.gain.setTargetAtTime(1, zero + a + d, .25); });
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = h01(i) * 2 - 1;
    // «біт-крашер»-буфер: шум, утриманий по 10 відліків і квантований до 3 біт
    const cb = c.createBuffer(1, c.sampleRate, c.sampleRate), cd = cb.getChannelData(0); for (let i = 0; i < cd.length; i++) cd[i] = Math.round((h01(Math.floor(i / 10) * 3.1) * 2 - 1) * 4) / 4;
    const lvAt = (t) => { let v = SEC[0][1]; for (const s of SEC) { if (s[0] <= t + 1e-6) v = s[1]; else break; } return v; };
    const chordAt = (t) => { const bar = Math.floor(t / 2 + 1e-6); if (t >= PU[0] && t < PU[1]) return CP[Math.floor((t - PU[0]) / 2 + 1e-6) % 4]; if (t >= CUT) return CH[0]; if (t >= MOD) return CH[Math.floor((bar - Math.round(MOD / 2)) / 2) % 4].map((m) => m + 2); return t >= FAST ? CH[Math.floor(bar / 2) % 4] : CH[Math.floor(bar / 4) % 4]; };
    const pan = (node, p) => { if (!p || !c.createStereoPanner) return node; const s = c.createStereoPanner(); s.pan.value = p; node.connect(s); return s; };
    const env = (node, at, a, peak, d, sends = [], p = 0) => { const e = c.createGain(); e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(peak, at + a); e.gain.exponentialRampToValueAtTime(.0005, at + a + d); node.connect(e); pan(e, p).connect(bus); sends.forEach(([n, g]) => { const s = c.createGain(); s.gain.value = g; e.connect(s).connect(n); }); return e; };
    const osc = (type, f, at, len) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.start(at); o.stop(at + len); return o; };
    const nsrc = (buf, at, len, off = 0) => { const s = c.createBufferSource(); s.buffer = buf; s.start(at, off, len + .05); return s; };
    // ── дрон: 4 пилки (корінь −12 ±9 центів, квінта, корінь тихо) через НЧ-фільтр + сабсинус на 2 октави нижче ──
    const dlp = c.createBiquadFilter(), dg = c.createGain(), sg = c.createGain(); dlp.type = 'lowpass'; dlp.Q.value = .9; dlp.connect(dg); dg.connect(bus); dg.connect(room); sg.connect(bus);
    const DV = [[-12, -9, .5, -.6], [-12, 9, .5, .6], [-5, 4, .32, -.3], [0, -4, .14, .3]], c0 = chordAt(t0), dos = [];
    DV.forEach(([st, cent, g, p]) => { const o = c.createOscillator(), og2 = c.createGain(); o.type = 'sawtooth'; o.detune.value = cent; o.frequency.value = hz(c0[0] + st); og2.gain.value = g; pan(o.connect(og2), p).connect(dlp); o.start(T0); if (end < 1e9) o.stop(zero + end + .1); me.src.push(o); dos.push([o, st]); });
    const so = c.createOscillator(); so.type = 'sine'; so.frequency.value = hz(c0[0] - 24); so.connect(sg); so.start(T0); if (end < 1e9) so.stop(zero + end + .1); me.src.push(so);
    // зміни акордів — заздалегідь, на межах тактів
    for (let b = Math.floor(t0 / 2) + 1; b * 2 < end; b++) { const t = b * 2, p = chordAt(t - .001), q = chordAt(t); if (p[0] === q[0]) continue;
      dos.forEach(([o, st]) => o.frequency.setTargetAtTime(hz(q[0] + st), zero + t, .05)); so.frequency.setTargetAtTime(hz(q[0] - 24), zero + t, .05); }
    // рівень і фільтр дрона за секціями; обрив (lv.cut) — за 20 мс
    const dset = (v, at, tc, first) => { const gD = .085 * v.drone || 0, gS = .11 * (v.sub == null ? v.drone || 0 : v.sub), f = 150 + 1300 * Math.pow(v.drone || 0, 1.6) + (v.open || 0) * 1800;
      if (first) { dg.gain.setValueAtTime(0, at); dg.gain.linearRampToValueAtTime(gD, at + .4); sg.gain.setValueAtTime(0, at); sg.gain.linearRampToValueAtTime(gS, at + .4); dlp.frequency.setValueAtTime(f, at); return; }
      dg.gain.setTargetAtTime(gD, at, tc); sg.gain.setTargetAtTime(gS, at, tc); dlp.frequency.setTargetAtTime(f, at, tc * 1.5); };
    dset(lvAt(t0), T0, 0, true); SEC.forEach(([t, v]) => { if (t > t0 + 1e-6 && t < end) dset(v, zero + t, v.cut ? .02 : .3); });
    // ── пост-кредит: шипіння передавача (смуговий шум) і гул флотів (низькі пилки через НЧ-фільтр із повільним биттям) ──
    const hsG = c.createGain(), hsF = c.createBiquadFilter(), hmG = c.createGain(), hmF = c.createBiquadFilter(); hsF.type = 'bandpass'; hsF.frequency.value = 2600; hsF.Q.value = .7; hsF.connect(hsG).connect(bus);
    hmF.type = 'lowpass'; hmF.frequency.value = 260; hmF.Q.value = 1.4; hmF.connect(hmG); hmG.connect(bus); hmG.connect(room);
    const anyL = (k) => SEC.some(([, v]) => v[k]);
    if (anyL('hiss')) { const n = c.createBufferSource(); n.buffer = nb; n.loop = true; n.connect(hsF); n.start(T0); if (end < 1e9) n.stop(zero + end + .1); me.src.push(n); }
    if (anyL('hum')) [[41.2, -6, -.4], [41.2, 7, .4], [61.7, 3, -.2], [82.4, -4, .2]].forEach(([f, cent, p]) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = cent; pan(o, p).connect(hmF); o.start(T0); if (end < 1e9) o.stop(zero + end + .1); me.src.push(o); });
    // v8.1: дощ міста — шум 900–6500 Гц, повільно «дихає» по стерео
    const rnG = c.createGain(), rnH = c.createBiquadFilter(), rnL = c.createBiquadFilter(); rnH.type = 'highpass'; rnH.frequency.value = 900; rnL.type = 'lowpass'; rnL.frequency.value = 6500; rnH.connect(rnL).connect(rnG); rnG.connect(bus); rnG.connect(room); rnG.gain.value = 0;
    if (anyL('rain')) { const n = c.createBufferSource(); n.buffer = nb; n.loop = true; n.connect(rnH); n.start(T0); if (end < 1e9) n.stop(zero + end + .1); me.src.push(n); }
    const lset = (v, at, tc, first) => { const a = .05 * (v.hiss || 0), b = .16 * (v.hum || 0), r2 = .07 * (v.rain || 0); if (first) { hsG.gain.setValueAtTime(a, at); hmG.gain.setValueAtTime(b, at); rnG.gain.setValueAtTime(r2, at); return; } hsG.gain.setTargetAtTime(a, at, tc); hmG.gain.setTargetAtTime(b, at, tc); rnG.gain.setTargetAtTime(r2, at, tc); };
    lset(lvAt(t0), T0, 0, true); SEC.forEach(([t, v]) => { if (t > t0 + 1e-6 && t < end) lset(v, zero + t, v.cut ? .02 : .4); });
    // ── нота остинато: дві розстроєні пилки, фільтр і гучність з короткою огинаючою ──
    function ost(at, m, v, d, br) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4; f.frequency.setValueAtTime(320 + 2600 * br, at); f.frequency.exponentialRampToValueAtTime(220, at + d);
      [-7, 7].forEach((cent) => { const o = osc('sawtooth', hz(m), at, d + .05); o.detune.value = cent; pan(o, cent > 0 ? .35 : -.35).connect(f); }); env(f, at, .003, v, d, [[room, .6]]); }
    // ── низький барабан: синус 74 → 44 Гц + приглушений шум ──
    function tom(at, v) { const o = osc('sine', 74, at, .5); o.frequency.setValueAtTime(74, at); o.frequency.exponentialRampToValueAtTime(44, at + .18); env(o, at, .002, .5 * v, .38, [[room, .5]]);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 190; nsrc(nb, at, .12, h01(at * 3) * 1.5).connect(f); env(f, at, .001, .25 * v, .1); }
    // ── удар: саб-удар з пітч-дропом 95 → 36 Гц, тіло-трикутник, низький шум 320 → 90 Гц; усе — у довгу темну реверберацію ──
    // v8.1: удари різних типів, щоб бас не повторювався: deep — глибокий (лише ключові моменти), snap — короткий з висотою p (півтони),
    //   glitch — цифровий, whoosh — повітря (рух камери, стерео-проліт), chime — дзвін каменя (нота 76 + p)
    function hitK(at, s, kind, p = 0) {
      if (kind === 'snap') { const f0 = 150 * Math.pow(2, p / 12), o = osc('sine', f0, at, .4); o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f0 * .42, at + .14); env(o, at, .002, .55 * s, .26, [[room, .5]]);
        const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2200; nsrc(nb, at, .06, h01(at * 7) * 1.5).connect(f); env(f, at, .001, .22 * s, .05, [[rvIn, .3]], (h01(at) - .5) * .8); return; }
      if (kind === 'glitch') { const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.value = 1500 * Math.pow(2, p / 12); nsrc(cb, at, .12, h01(at * 3) * .8).connect(f); env(f, at, .001, .16 * s, .11, [[room, .4]], (h01(at * 2) - .5));
        const o = osc('square', 900, at, .1); o.frequency.setValueAtTime(900 * Math.pow(2, p / 12), at); o.frequency.exponentialRampToValueAtTime(2600, at + .08); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; o.connect(lp); env(lp, at, .001, .05 * s, .07); return; }
      if (kind === 'whoosh') { const n = c.createBufferSource(); n.buffer = nb; n.loop = true; const bp = c.createBiquadFilter(), g = c.createGain(); bp.type = 'bandpass'; bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(380, at); bp.frequency.exponentialRampToValueAtTime(3200, at + .55); bp.frequency.exponentialRampToValueAtTime(900, at + 1.1);
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.13 * s, at + .5); g.gain.linearRampToValueAtTime(0, at + 1.15); n.connect(bp).connect(g);
        if (c.createStereoPanner) { const sp = c.createStereoPanner(); sp.pan.setValueAtTime(-.7, at); sp.pan.linearRampToValueAtTime(.7, at + 1.1); g.connect(sp).connect(bus); } else g.connect(bus); g.connect(room); n.start(at); n.stop(at + 1.2); me.src.push(n); return; }
      if (kind === 'chime') { bell(at, 76 + p, .7, .1 * s, ((p % 7) / 7 - .5) * .8); return; }
      hit(at, s); }
    function hit(at, s) { const o = osc('sine', 95, at, 2.6); o.frequency.setValueAtTime(95, at); o.frequency.exponentialRampToValueAtTime(36, at + .7); env(o, at, .004, .9 * s, 2.2, [[rvIn, .35]]);
      const o2 = osc('triangle', 52, at, 1.4); o2.frequency.setValueAtTime(52, at); o2.frequency.exponentialRampToValueAtTime(33, at + .9); env(o2, at, .003, .22 * s, 1.1, [[rvIn, .4]]);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = .7; f.frequency.setValueAtTime(320, at); f.frequency.exponentialRampToValueAtTime(90, at + .8);
      nsrc(nb, at, 1.2, h01(at) * .7).connect(f); env(f, at, .002, .42 * s, .95, [[rvIn, 1.1]]); }
    // ── riser: смуговий шум 300 → 6000 Гц і пилка на дві октави вгору; обрив точно на ударі ──
    function riser(tEnd, len, s, from) { const a = tEnd - len, f0 = Math.max(0, (from - a) / len), st = zero + Math.max(a, from), en = zero + tEnd, ch = chordAt(a), rem = en - st; if (rem < .15) return;
      const n = c.createBufferSource(); n.buffer = nb; n.loop = true; const bp = c.createBiquadFilter(), ng = c.createGain(); bp.type = 'bandpass'; bp.Q.value = 1.6;
      bp.frequency.setValueAtTime(ex(300, 6000, f0), st); bp.frequency.exponentialRampToValueAtTime(6000, en); ng.gain.setValueAtTime(.0008 + .11 * s * f0 * f0, st); ng.gain.linearRampToValueAtTime(.11 * s, en - .02); ng.gain.linearRampToValueAtTime(0, en + .02);
      n.connect(bp).connect(ng); ng.connect(bus); ng.connect(room); n.start(st); n.stop(en + .05); me.src.push(n);
      const o = c.createOscillator(), lp = c.createBiquadFilter(), og3 = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(ex(hz(ch[0] - 12), hz(ch[0] + 12), f0), st); o.frequency.exponentialRampToValueAtTime(hz(ch[0] + 12), en);
      lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(ex(200, 4200, f0), st); lp.frequency.exponentialRampToValueAtTime(4200, en);
      og3.gain.setValueAtTime(.0005 + .05 * s * f0, st); og3.gain.linearRampToValueAtTime(.05 * s, en - .02); og3.gain.linearRampToValueAtTime(0, en + .02); o.connect(lp).connect(og3).connect(bus); o.start(st); o.stop(en + .05); me.src.push(o); }
    // ── «струнний» пед: акорд у середньому регістрі (найближчі до попереднього звуки), кожен звук — дві пилки ліворуч/праворуч ──
    const voicing = (ch) => { const out = []; ch.concat([ch[0] + 12]).forEach((m) => { let v = m; while (v < 55) v += 12; while (v >= 70) v -= 12; out.push(v); }); return out; };
    function pad(a, z, ch, lv, hard) { const st = zero + a, en = zero + z, at = hard ? .03 : .6, rl = hard ? .05 : .9;
      const f = c.createBiquadFilter(), g = c.createGain(); f.type = 'lowpass'; f.Q.value = .4; f.frequency.value = 650 + 1700 * lv; f.connect(g); g.connect(bus); g.connect(room);
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(.05 * lv, st + at); g.gain.setValueAtTime(.05 * lv, en); g.gain.linearRampToValueAtTime(0, en + rl);
      voicing(ch).forEach((m, i) => [-9, 9].forEach((cent) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cent + (i - 1.5) * 2; pan(o, (cent > 0 ? .55 : -.55) * (.6 + .15 * i)).connect(f); o.start(st); o.stop(en + rl + .05); me.src.push(o); })); }
    // відрізки педа: межі акордів і секцій
    const PSEG = []; { const cuts = new Set([t0]); for (let b = Math.floor(t0 / 2) + 1; b * 2 < end; b++) { const t = b * 2; if (chordAt(t - .001)[0] !== chordAt(t)[0]) cuts.add(t); } SEC.forEach(([t]) => { if (t > t0 && t < end) cuts.add(t); });
      const L2 = [...cuts].sort((p, q) => p - q).concat([end]); for (let i = 0; i < L2.length - 1; i++) { const v = lvAt(L2[i]); if (v.pad) PSEG.push([L2[i], L2[i + 1], chordAt(L2[i]), v.pad, !!(lvAt(L2[i + 1]) || {}).cut]); } }
    // ── лейтмотив: дзвін (синус + октава + тихий трикутник, довге згасання) і «мідь» (три пилки, фільтр розкривається) ──
    function bell(at, m, d, v, p) { const f = hz(m); [[1, 'sine', 1], [2, 'sine', .3], [3, 'triangle', .1]].forEach(([h, ty, g]) => env(osc(ty, f * h, at, d + 2.2), at, .005, v * g, 1.4 + d * .5, [[rvIn, .5]], p)); }
    function brass(at, m, d, v, p) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2; lp.frequency.setValueAtTime(380, at); lp.frequency.linearRampToValueAtTime(2300, at + .14); lp.frequency.setTargetAtTime(1300, at + .2, .4);
      [-12, 0, 12].forEach((cent) => osc('sawtooth', hz(m), at, d + .5).connect(lp)); const e = c.createGain(); e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(v, at + .06); e.gain.setValueAtTime(v * .85, at + d * .8); e.gain.linearRampToValueAtTime(0, at + d + .35);
      lp.connect(e); pan(e, p).connect(bus); const s = c.createGain(); s.gain.value = .45; e.connect(s).connect(rv); }
    function motif(t, tr, kind, lv) { MOTIF.forEach(([b0, m, d], i) => { const at = zero + t + b0 * BEAT, len = d * BEAT, p = i % 2 ? .25 : -.25; if (t + b0 * BEAT < t0) return;
      if (kind === 'big') { brass(at, m + tr - 12, len, .07 * lv, -.3); brass(at, m + tr, len, .055 * lv, .3); bell(at, m + tr + 12, len, .05 * lv, p); }
      else bell(at, m + tr, len, .07 * lv, p); }); }
    // ── «Пуш»: хор-пед — акорд, кожен звук — три розстроєні пилки з легким вібрато через форманти голосного «а» (730 · 1090 · 2440 Гц) ──
    function choir(a, z, ch, lv, hard) { const st = zero + a, en = zero + z, rl = hard ? .06 : .9, sum = c.createGain(), g = c.createGain(); sum.gain.value = .5;
      [[730, 6, 1], [1090, 8, .7], [2440, 10, .3]].forEach(([f, q, k]) => { const bp = c.createBiquadFilter(), fg = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; fg.gain.value = k * 3; sum.connect(bp).connect(fg).connect(g); });
      g.connect(bus); const sd = c.createGain(); sd.gain.value = .5; g.connect(sd).connect(rvIn);
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(.05 * lv, st + .5); g.gain.setValueAtTime(.05 * lv, en); g.gain.linearRampToValueAtTime(0, en + rl);
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.1; lg.gain.value = 9; lfo.connect(lg); lfo.start(st); lfo.stop(en + rl + .05); me.src.push(lfo);
      voicing(ch).concat([voicing(ch)[1] + 12]).forEach((m, i) => [-7, 0, 7].forEach((cent) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cent + i; lg.connect(o.detune); pan(o, cent / 14 + (i - 1.5) * .12).connect(sum); o.start(st); o.stop(en + rl + .05); me.src.push(o); })); }
    // ── «Пуш»: висхідний shepard-тон — 6 синусів через октаву, кожен піднімається на октаву за 1,7 с і переходить униз, коли тихий ──
    function shepard(a, z) { const P = 1.7, N = 6, F0 = 55, from = Math.max(a, t0), g = c.createGain(); g.connect(bus); g.connect(room);
      g.gain.setValueAtTime(0, zero + from); SEC.forEach(([t, v]) => { if (t >= a && t < z) g.gain.setTargetAtTime(.032 * (v.shep || 0), zero + Math.max(from, t), .3); }); g.gain.setTargetAtTime(0, zero + z, .02);
      for (let j = 0; j < N; j++) { const o = c.createOscillator(), og4 = c.createGain(); o.type = 'sine'; o.connect(og4).connect(g); o.start(zero + from); o.stop(zero + z + .1); me.src.push(o);
        let s0 = from; while (s0 < z - .01) { let ph = ((s0 - a) / (N * P) + j / N) % 1; if (ph > 1 - 1e-4) ph = 0; const s1 = Math.min(z, s0 + (1 - ph) * N * P), ph1 = ph + (s1 - s0) / (N * P);
          if (s1 - s0 < .03) { s0 = s1; continue; }
          o.frequency.setValueAtTime(F0 * Math.pow(2, N * ph), zero + s0); o.frequency.exponentialRampToValueAtTime(F0 * Math.pow(2, N * Math.min(ph1, .9999)), zero + s1);
          const cv = new Float32Array(24); for (let q = 0; q < 24; q++) { const pp = ph + (ph1 - ph) * q / 23; cv[q] = Math.pow(Math.sin(Math.PI * Math.min(1, pp)), 2); }
          og4.gain.setValueCurveAtTime(cv, zero + s0, Math.max(.01, s1 - s0 - .004)); s0 = s1; } } }
    // ── цокання міни: короткий «дерев'яний» тик і клацання; гучнішає до вибуху ──
    function tick(at, k) { const o = osc('triangle', 2100, at, .05); env(o, at, .001, .05 + .05 * k, .028, [[room, .3]]);
      const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500; nsrc(nb, at, .006, h01(at * 7) * 1.5).connect(f); env(f, at, .0005, .06 + .05 * k, .005); }
    // ── одна шістнадцята: k — номер від початку ролика ──
    function step(k, at) {
      const t = k * ST, v = lvAt(t), ch = chordAt(t), beat = k % 4 === 0, r = ch[0] - 12;
      // v8.3: годинник «тік-так» (tick: 1 — восьмі, 2 — шістнадцяті, .5 — чверті); пульс суб-баса восьмими (pulse) — як у трейлерах Нолана
      if (v.tick) { const div = v.tick >= 2 ? 1 : v.tick >= 1 ? 2 : 4; if (k % div === 0) { const tock = (k / div) % 2, f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 6; f.frequency.value = tock ? 2300 : 3100;
        nsrc(nb, at, .012, h01(k * .7) * 1.5).connect(f); env(f, at, .0005, .11 * (beat ? 1.25 : 1), .02, [[room, .5]], tock ? .25 : -.25); env(osc('sine', tock ? 1180 : 1560, at, .05), at, .001, .035, .03, [[room, .3]]); } }
      if (v.pulse && k % 2 === 0) { const o = osc('sawtooth', hz(r - 12), at, .2), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(420, at); lp.frequency.exponentialRampToValueAtTime(90, at + .16); o.connect(lp); env(lp, at, .004, .2 * v.pulse * (beat ? 1.3 : 1), .17); }
      // v8.1: «біти» — цифрове цвірінькання даних (короткі квадратні сигнали на випадкових високих тонах)
      if (v.bits) for (let j = 0; j < 2; j++) if (h01(k * 9.13 + j * 3.7 + .21) < .2 + .55 * v.bits) { const a2 = at + j * ST / 2, f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 3; f.frequency.value = 1800 + 3200 * h01(k * 3.3 + j);
        osc('square', 1600 + 2600 * h01(k * 5.1 + j * 1.9), a2, .03).connect(f); env(f, a2, .001, .035 * v.bits, .022, [[room, .25]], h01(k * 7.7 + j) * 1.6 - .8); }
      // остинато: 1/8 (o16 = false) або 1/16; малюнок на тонах акорду
      if (v.ost && (v.o16 || k % 2 === 0)) { const P8 = [0, 0, 2, 0, 3, 0, 2, 1], P16 = [0, 0, 2, 0, 3, 0, 2, 0, 0, 0, 2, 0, 1, 0, 2, 3], n = v.o16 ? P16[k % 16] : P8[(k / 2) % 8], m = n === 3 ? r + 12 : r + (ch[n] - ch[0]);
        ost(at, m, .09 * v.ost * (beat ? 1.35 : 1), v.o16 ? .085 : .12, .25 + .6 * v.ost); }
      // низькі барабани: на чверті; на повному рівні — ще й тихі восьмі між ними
      if (v.drum && (beat || (v.drum >= .9 && k % 2 === 0))) tom(at, v.drum * (beat ? (k % 16 === 0 ? 1.15 : 1) : .38));
      // цифровий глітч: клацання, «біт-крашер»-хвости, швидкі арпеджіо 1/32
      if (v.gl && h01(k * 3.7 + .5) < .05 + .3 * v.gl) { const y = h01(k * 1.9 + .2);
        if (y < .6) { const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 4500; nsrc(nb, at, .006, h01(k) * 1.5).connect(f); env(f, at, .0005, .07 * v.gl, .005, [], h01(k * 4.4) * 1.4 - .7); }
        else if (y < .85) { const f = c.createBiquadFilter(), d = .06 + .08 * h01(k * 5.1); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.value = 1200 + 3000 * h01(k * 2.3); nsrc(cb, at, d, h01(k * 7) * .8).connect(f); env(f, at, .001, .05 * v.gl, d, [[room, .5]], h01(k * 6.6) * 1.2 - .6); }
        else if (v.gl > .5) for (let j = 0; j < 4; j++) { const a2 = at + j * ST / 2, f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500; osc('square', hz(ch[j % 3] + 24 + (j === 3 ? 12 : 0)), a2, .06).connect(f); env(f, a2, .002, .028 * v.gl, .05, [], j % 2 ? .5 : -.5); } }
      // «Пуш»: арп запуску на тонах C-мажору, що прискорюється: 1/8 → 1/16 → 1/32
      if (v.pa) { const r = v.pr || 8, U = [0, 1, 2, 3, 4, 5, 6, 7], note = (q) => { const n = U[q % 8]; return ch[n % 3] + 12 * (1 + Math.floor(n / 3)); };
        const one = (a2, q, len) => { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(1400 + 3200 * v.pa, a2); f.frequency.exponentialRampToValueAtTime(500, a2 + len);
          osc(q % 2 ? 'sawtooth' : 'square', hz(note(q)), a2, len + .05).connect(f); env(f, a2, .002, .042 * v.pa * (q % 4 === 0 ? 1.3 : 1), len, [[room, .35]], q % 2 ? .35 : -.35); };
        if (r === 8) { if (k % 2 === 0) one(at, k / 2, .12); } else if (r === 16) one(at, k, .08); else { one(at, k * 2, .05); one(at + ST / 2, k * 2 + 1, .05); } }
      // пост-кредит: тріск передавача — клацання й короткі «біт-крашер»-сплески
      if (v.crk && h01(k * 5.3 + .7) < .2 + .5 * v.crk) { const y = h01(k * 2.7 + .1), a2 = at + h01(k * 8.1) * ST;
        if (y < .75) { const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2000 + 3000 * h01(k * 3.9); nsrc(nb, a2, .004, h01(k * 1.3) * 1.5).connect(f); env(f, a2, .0004, (.04 + .08 * h01(k * 6.2)) * v.crk, .004, [], h01(k * 4.4) * 1.2 - .6); }
        else { const f = c.createBiquadFilter(), d = .04 + .09 * h01(k * 5.7); f.type = 'bandpass'; f.Q.value = .9; f.frequency.value = 900 + 2500 * h01(k * 2.1); nsrc(cb, a2, d, h01(k * 7.3) * .8).connect(f); env(f, a2, .002, .05 * v.crk, d, [[room, .3]], h01(k * 6.9) - .5); } }
      // «хакерське» арпеджіо 1/16 (квадрат/пилка, фільтр)
      if (v.arp) { const pat = [0, 1, 2, 1, 3, 2, 1, 2], n = pat[k % 8], m = (n === 3 ? ch[0] + 12 : ch[n]) + 12, f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 5; f.frequency.value = 700 + 2600 * v.arp;
        osc(k % 2 ? 'sawtooth' : 'square', hz(m), at, .2).connect(f); env(f, at, .003, .035 * v.arp * (k % 4 === 2 ? 1.25 : 1), .13, [[room, .4]], k % 2 ? .4 : -.4); }
    }
    // планувальник: шістнадцяті, удари й райзери в межах горизонту
    let k = Math.ceil(t0 / ST - 1e-6); const shd = new Set(), hd = new Set(), rd = new Set(), pd = new Set(), md = new Set(), td = new Set(), cd2 = new Set(); let shp = false;
    // відрізки хор-педа (як у педа: межі акордів і секцій)
    const CSEG = PSEG.length >= 0 ? (() => { const out = [], cuts = new Set([t0]); for (let b = Math.floor(t0 / 2) + 1; b * 2 < end; b++) { const t = b * 2; if (chordAt(t - .001)[0] !== chordAt(t)[0]) cuts.add(t); } SEC.forEach(([t]) => { if (t > t0 && t < end) cuts.add(t); });
      const L2 = [...cuts].sort((p, q) => p - q).concat([end]); for (let i = 0; i < L2.length - 1; i++) { const v = lvAt(L2[i]); if (v.choir) out.push([L2[i], L2[i + 1], chordAt(L2[i]), v.choir, !!(lvAt(L2[i + 1]) || {}).cut]); } return out; })() : [];
    me.pump = (h) => { while (zero + k * ST < h && k * ST < end) { step(k, zero + k * ST); k++; }
      HITS.forEach(([t, s, kind, p, roll], i) => { if (hd.has(i) || zero + t - (roll ? 1.6 : 0) >= h) return; hd.add(i); if (t >= t0 - .01 && t < end) {
        // дріб: низькі барабани шістнадцятими за 1,5 с до удару, гучнішають; обриваються за 0,5 с (там — «стоп»-тиша)
        if (roll) for (let q = 0; q < 8; q++) { const at2 = zero + t - 1.5 + q * ST; if (at2 >= zero + t0) tom(at2, .35 + .65 * q / 7); }
        hitK(zero + t, s, kind, p); } });
      PSEG.forEach(([a, z, ch, lv, hard], i) => { if (pd.has(i) || zero + a >= h) return; pd.add(i); pad(a, z, ch, lv, hard); });
      CSEG.forEach(([a, z, ch, lv, hard], i) => { if (cd2.has(i) || zero + a >= h) return; cd2.add(i); choir(a, z, ch, lv, hard); });
      (opt.sheps || [PU]).forEach(([a2, z2], i) => { if (shd.has(i) || !(a2 < end) || zero + Math.max(a2, t0) >= h || t0 >= z2) return; shd.add(i); shepard(a2, z2); });
      TK.forEach((t, i) => { if (td.has(i) || zero + t >= h) return; td.add(i); if (t >= t0 && t < end) tick(zero + t, i / Math.max(1, TK.length - 1)); });
      MOT.forEach(([t, tr, kind, lv], i) => { if (md.has(i) || zero + t >= h) return; md.add(i); motif(t, tr, kind, lv); });
      RIS.forEach(([t, len, s], i) => { if (rd.has(i) || zero + t - len >= h) return; rd.add(i); if (t > t0 && t <= end) riser(t, len, s == null ? 1 : s, Math.max(t0, t - len)); }); };
    return me;
  }
  const c2g = () => ac.createGain();
  function trailer(on, t0 = 0, opt = {}) {
    if (tr) { const s = tr; tr = null; clearInterval(s.iv); try { const n = ac.currentTime; [s.m, s.v].forEach((g) => { g.gain.cancelScheduledValues(n); g.gain.setTargetAtTime(0, n, .08); }); s.src.forEach((z) => { try { z.stop(n + .5); } catch (e) {} }); } catch (e) {} }
    if (!S.on || !ac) return;
    if (!on) { musicTo(LEVEL, 2); return; }
    musicTo(DUCK, 1);
    const me = tr = { src: [], m: ac.createGain(), v: ac.createGain(), iv: 0 }, V = opt.voice || [];
    me.v.gain.value = .7; me.m.connect(master); me.v.connect(master); me.v.connect(voiceSend);
    const sc = score(ac, me.m, t0, opt, true), zero = ac.currentTime + .06 - t0; me.src = sc.src;
    const pump = () => { if (tr !== me) return; sc.pump(ac.currentTime + .4); };
    pump(); me.iv = setInterval(pump, 100);
    // v8.5: готовий трек (opt.track = { f, at, lv }) замість синтезованої музики основної частини; стихає під репліками
    // v10: готові доріжки (opt.tracks = [{ f, at, off, lv, until }]) замість синтезованої партитури; стихають під репліками
    (opt.tracks || (opt.track ? [opt.track] : [])).forEach((T) => load(T.f, opt.vv || 5).then((b) => { if (!b || !S.on || tr !== me) return; const g = c2g(), now = ac.currentTime, tt = now - zero, off = T.off || 0, dur = Math.min(b.duration - off, (T.until || 1e9) - T.at);
      g.gain.setValueAtTime(T.lv, now); V.forEach(([a2, , d]) => { if (!d || a2 + d < tt || a2 < T.at || a2 > T.at + dur) return; const st2 = Math.max(now, zero + a2 - .1); g.gain.setTargetAtTime(T.lv * .5, st2, .05); g.gain.setTargetAtTime(T.lv, zero + a2 + d, .3); });
      const s2 = ac.createBufferSource(); s2.buffer = b; s2.connect(g).connect(me.m);
      if (tt < T.at) s2.start(zero + T.at, off, dur); else if (tt - T.at < dur) s2.start(now, off + tt - T.at, dur - (tt - T.at)); else return; me.src.push(s2); }));
    // репліки Джарвіса: з’являються з того самого моменту, що й музика
    Promise.all(V.map(([, f]) => load(f, opt.vv || 5))).then((vb) => { if (!S.on || tr !== me) return; const now = ac.currentTime, t = now - zero;
      V.forEach(([at], i) => { const b = vb[i]; if (!b || at + b.duration <= t) return; const s = ac.createBufferSource(); s.buffer = b; s.connect(me.v);
        if (at >= t + .02) s.start(zero + at); else s.start(now, t - at); me.src.push(s); }); });
  }
  // рендер у MP4: офлайн-копія trailer() — партитура, готові доріжки (стихають під репліками), голос із кімнатою; { sr, ch }
  S.renderTrailerMix = async (t0, t1, opt) => { const SR = 48000, oc = new OfflineAudioContext(2, Math.ceil((t1 - t0) * SR), SR), V = opt.voice || [];
    const mst = oc.createGain(); mst.connect(oc.destination); const n = Math.round(SR * 2.4), ir = oc.createBuffer(2, n, SR);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (h01(i * 1.91 + c * 5311.3) * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    const rv = oc.createConvolver(); rv.buffer = ir; const rg = oc.createGain(); rg.gain.value = .4; rv.connect(rg).connect(mst);
    const m = oc.createGain(), v = oc.createGain(), vs = oc.createGain(); v.gain.value = .7; vs.gain.value = .16; m.connect(mst); v.connect(mst); v.connect(vs).connect(rv);
    const sc = score(oc, m, t0, opt, false); sc.pump(t1 - t0 + 1);
    const dec = async (k) => { try { return await oc.decodeAudioData(await (await fetch(A + k + '.m4a?v=' + (opt.vv || 5))).arrayBuffer()); } catch (e) { return null; } };
    for (const T of opt.tracks || (opt.track ? [opt.track] : [])) { const b = await dec(T.f); if (!b) continue; const off = T.off || 0, dur = Math.min(b.duration - off, (T.until || 1e9) - T.at), g = oc.createGain();
      g.gain.setValueAtTime(T.lv, 0); V.forEach(([a2, , d]) => { if (!d || a2 < T.at || a2 > T.at + dur) return; g.gain.setTargetAtTime(T.lv * .5, Math.max(0, a2 - .1 - t0), .05); g.gain.setTargetAtTime(T.lv, Math.max(0, a2 + d - t0), .3); });
      const s2 = oc.createBufferSource(); s2.buffer = b; s2.connect(g).connect(m); if (t0 < T.at) s2.start(T.at - t0, off, dur); else if (t0 - T.at < dur) s2.start(0, off + t0 - T.at, dur - (t0 - T.at)); }
    for (const [at, k] of V) { const b = await dec(k); if (!b || at + b.duration <= t0 || at > t1) continue; const s3 = oc.createBufferSource(); s3.buffer = b; s3.connect(v); if (at >= t0) s3.start(at - t0); else s3.start(0, t0 - at); }
    const buf = await oc.startRendering(); return { sr: SR, ch: [buf.getChannelData(0), buf.getChannelData(1)] }; };
  // перевірка без прослуховування: офлайн-рендер відрізка [t0, t1] з голосом → { sr, ch: [Float32Array, …] } (лише для скриптів перевірки)
  S.renderTrailer = async (t0, t1, opt) => { const oc = new OfflineAudioContext(2, Math.ceil((t1 - t0) * 44100), 44100), sc = score(oc, oc.destination, t0, opt, false);
    sc.pump(t1 - t0 + 1); const vg = oc.createGain(); vg.gain.value = .7; vg.connect(oc.destination);
    for (const [at, f] of opt.voice || []) { if (at < t0 || at > t1) continue; try { const a = await (await fetch(A + f + '.m4a?v=' + (opt.vv || 5))).arrayBuffer(), b = await oc.decodeAudioData(a), s = oc.createBufferSource(); s.buffer = b; s.connect(vg); s.start(at - t0); } catch (e) {} }
    const buf = await oc.startRendering(); return { sr: buf.sampleRate, ch: [buf.getChannelData(0), buf.getChannelData(1)] }; };
  function noise(len, at, f0, f1, v, q = 1.2, type = 'bandpass') {
    const b = ac.createBuffer(1, Math.round(ac.sampleRate * len), ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, at); f.frequency.exponentialRampToValueAtTime(f1, at + len);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + Math.min(.01, len * .2)); g.gain.exponentialRampToValueAtTime(.0005, at + len); s.connect(f).connect(g); g.connect(fxBus); g.connect(verb); s.start(at); }
  function tone(fq, at, len, v, type = 'sine') { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = fq; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .008); g.gain.setTargetAtTime(0, at + len * .3, len * .35); o.connect(g); g.connect(fxBus); g.connect(verb); o.start(at); o.stop(at + len * 3); return o; }
  function fx(kind, arg) {
    if (!S.on || !ac) return; const t = ac.currentTime + .005;
    if (kind === 'key') { noise(.04, t, 3000 + Math.random() * 1500, 1800, .05, 2); }                      // клавіша
    else if (kind === 'shutter') { noise(.03, t, 5000, 2000, .07, 1.5); noise(.05, t + .045, 2500, 900, .05, 1.2); }   // затвор камери
    else if (kind === 'hit') {   // «брааам» трейлера: низькі розстроєні пили через фільтр, що відкривається й закривається, + удар і шум
      const lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(120, t); lp.frequency.exponentialRampToValueAtTime(900, t + .25); lp.frequency.exponentialRampToValueAtTime(150, t + 2.2);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .06); g.gain.setTargetAtTime(0, t + .6, .7); lp.connect(g); g.connect(fxBus); g.connect(verb);
      [43.65, 43.9, 87.3, 65.4].forEach((f2) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f2; o.connect(lp); o.start(t); o.stop(t + 3.5); });
      const o = tone(55, t, 1.2, .3); o.frequency.exponentialRampToValueAtTime(30, t + 1); noise(.8, t, 400, 50, .1, .6); }
    else if (kind === 'station') { tone(440 * Math.pow(2, ((+arg || 0) % 5) * 2 / 12), t, .25, .05, 'triangle'); }
    else if (kind === 'mark') { tone(arg === 'fact' ? 1046 : arg === 'redo' ? 523 : 784, t, .12, .06, 'sine'); }
    else if (kind === 'flip') { noise(.18, t, 900, 3000, .05, .9); }
    else if (kind === 'click') { tone(1400, t, .06, .04, 'triangle'); }
    else if (kind === 'chime') { [880, 1318.5].forEach((f2, i) => tone(f2, t + i * .1, .5, .05)); }
  }
  // рідкісні звуки майстерні
  function ambientRandom() { clearTimeout(rndT); rndT = setTimeout(() => { if (S.on && !document.hidden && ac) { const t = ac.currentTime + .05, k = Math.floor(Math.random() * 3);
      if (k === 0) { for (let i = 0; i < 3; i++) noise(.35, t + i * .22, 1800, 3500, .025, .6, 'highpass'); }                 // шелест паперу
      else if (k === 1) { for (let i = 0; i < 10; i++) noise(.05, t + i * .11, 900, 600, .02, 3); }                             // далекий принтер
      else { noise(.02, t, 2500, 1500, .03, 2); noise(.02, t + .14, 2500, 1500, .03, 2); } }                                     // подвійний клік миші
    ambientRandom(); }, (25 + Math.random() * 35) * 1000); }
  function set(on) {
    if (on && !init()) return; S.on = on; paint();
    if (!ac) return; const t = ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(on ? 1 : 0, t + (on ? 1.5 : .6));
    if (on) { ac.resume(); ambientRandom(); } else { clearTimeout(rndT); trailer(false); if (S.track) track(false); setTimeout(() => { if (!S.on) ac.suspend(); }, 700); }
    dispatchEvent(new CustomEvent('sk-sound', { detail: { on } }));
  }
  // трек: окремо від перемикача звуку; ▶ при вимкненому звуці вмикає й звук
  function track(on) {
    S.track = on;
    if (on) { if (!S.on || !ac) set(true); if (!ac) { S.track = false; paintTrk(); return; } ac.resume(); amb = null; ambient(ac.currentTime + .05, true, trkOff); clearInterval(pIv); pIv = setInterval(paintTrk, 250); }
    else { clearTimeout(ambT); amb = 'off'; clearInterval(pIv); if (ac) { const n = ac.currentTime; trkOff = trkDur ? (n - trkAt) % trkDur : 0; ambSrc.forEach((z) => { try { z.g.gain.cancelScheduledValues(n); z.g.gain.setValueAtTime(z.g.gain.value, n); z.g.gain.linearRampToValueAtTime(0, n + .4); z.stop(n + .45); } catch (e) {} }); ambSrc = []; } }
    paintTrk();
  }
  paintTrk();
  document.addEventListener('visibilitychange', () => { if (!ac || !S.on) return; document.hidden ? ac.suspend() : ac.resume(); });
})();
