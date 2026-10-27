/* Стаття 36, нові розділи: помітки походження (ai slop) — демо і перемикач для всієї статті;
   ролик → відео (покадровий рендер); той самий підхід для клієнта (документи, показ, PPTX із редагованим текстом). */
(function () {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const SND = (k, a) => { if (window.SK_SND) SK_SND.fx(k, a); };

  /* ═════ Помітки походження (ai slop) ═════ */
  const TY = { fact: ['Перевірено', '#1E968C'], hyp: ['Гіпотеза', '#4678DC'], mine: ['Мій висновок', '#8a63d2'], todo: ['Доробити', '#D9A21B'], redo: ['Переробити · ai slop', '#E0532A'], del: ['Видалити', '#7a7f8c'], dir: ['Коментар режисера', '#EA5212'] };
  const ORDER = ['redo', 'fact', 'hyp', 'mine', 'todo', 'del', 'dir'];
  (function () {
    const s = $('sk-prov'); if (!s) return;
    const B = [['redo', 'Скіл економить час уже з другої статті.', 'додай цифру: скільки повідомлень менше'],
      ['fact', '35 зроблено за один вечір: дослідження, дані FRED, 11 розділів, ролик і звук.', ''],
      ['mine', 'Хороший скіл — стисла історія помилок конкретної команди.', ''],
      ['redo', 'Gemini пише краще за всіх інших помічників.', 'це не так — прибери або позначи як моє'],
      ['hyp', 'Той самий підхід спрацює для навчальних курсів.', '']];
    const box = el('div', 'sk-prov');
    box.innerHTML = `<div class="sk-prov__doc">${B.map(([t, x2, c], i) => `<div class="sk-pb" data-t="${t}" data-i="${i}"><button type="button" class="sk-pb__rail" title="змінити помітку"></button><p>${x2}</p>${c ? `<div class="sk-pb__note">${c}</div>` : ''}</div>`).join('')}</div>
      <div class="sk-prov__side"><div class="sk-prov__cnt"></div><button type="button" class="rc-btn" data-act>опрацюй зауваження</button><div class="sk-prov__log"></div>
      <div class="sk-prov__leg">${ORDER.map((k) => `<span><i style="background:${TY[k][1]}"></i>${TY[k][0]}</span>`).join('')}</div></div>`;
    s.appendChild(box);
    const blocks = [...box.querySelectorAll('.sk-pb')], cnt = box.querySelector('.sk-prov__cnt'), log = box.querySelector('.sk-prov__log');
    function paint() { blocks.forEach((b) => { const t = b.dataset.t; b.style.setProperty('--c', TY[t][1]); b.querySelector('.sk-pb__rail').textContent = TY[t][0]; });
      const left = blocks.filter((b) => ['redo', 'todo', 'del'].includes(b.dataset.t)).length; cnt.innerHTML = `до здачі лишилось: <b>${left}</b>`; cnt.classList.toggle('ok', !left); }
    box.addEventListener('click', (e) => { const r = e.target.closest('.sk-pb__rail'); if (!r) return; const b = r.parentElement; b.dataset.t = ORDER[(ORDER.indexOf(b.dataset.t) + 1) % ORDER.length]; SND('mark', b.dataset.t); paint(); });
    box.querySelector('[data-act]').addEventListener('click', () => { const out = [];
      blocks.forEach((b) => { const n = b.querySelector('.sk-pb__note'); if (!n) return; const i = +b.dataset.i, p = b.querySelector('p');
        if (i === 0) { p.textContent = 'Скіл економить час уже з другої статті: правок на 35 — удвічі менше, ніж на 34.'; b.dataset.t = 'hyp'; out.push(['додай цифру', 'додано оцінку; позначено «гіпотеза», бо точного підрахунку немає']); }
        if (i === 3) { b.dataset.t = 'del'; out.push(['це не так', 'блок позначено «видалити»']); setTimeout(() => { b.classList.add('gone'); }, 500); }
        n.remove(); });
      log.innerHTML = '<b>просив → зробив</b>' + out.map(([a, c]) => `<div><span>${a}</span> → ${c}</div>`).join(''); SND('chime'); paint(); });
    paint();
  })();
  // перемикач «показати помітки» для всієї статті: блоки з data-prov отримують рейку
  (function () {
    const btn = $('skProvToggle'); if (!btn) return;
    const blocks = [...document.querySelectorAll('[data-prov]')];
    btn.addEventListener('click', () => { const on = !document.body.classList.contains('sk-prov-on'); document.body.classList.toggle('sk-prov-on', on); btn.classList.toggle('on', on); SND('click');
      blocks.forEach((b) => { b.style.setProperty('--c', TY[b.dataset.prov][1]); b.dataset.provL = TY[b.dataset.prov][0]; });
      const n = {}; blocks.forEach((b) => { n[b.dataset.prov] = (n[b.dataset.prov] || 0) + 1; });
      $('skProvSum').textContent = on ? ORDER.filter((k) => n[k]).map((k) => `${TY[k][0]}: ${n[k]}`).join(' · ') : ''; });
  })();

  /* ═════ Ролик → відео ═════ */
  (function () {
    const s = $('sk-video'); if (!s) return;
    const box = el('div', 'sk-vid');
    box.innerHTML = `<canvas aria-label="Покадровий рендер ролика"></canvas><div class="sk-vid__bar"><button type="button" class="rc-btn" data-play>▶ відрендерити</button>
      <label>кадрів/с <select><option>30</option><option>60</option></select></label><span class="sk-vid__st"></span></div>`;
    s.appendChild(box);
    const cv = box.querySelector('canvas'), x = cv.getContext('2d'), st = box.querySelector('.sk-vid__st'), sel = box.querySelector('select'), play = box.querySelector('[data-play]');
    let W = 1, H = 1, p = 0, raf = 0, run = false;
    function size() { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = Math.round(W * d); cv.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0); }
    function draw() {
      const fps = +sel.value, total = 90 * fps, fr = Math.round(p * total), S = W / 900;
      x.fillStyle = '#070a12'; x.fillRect(0, 0, W, H);
      // 1) сценарій у тактах
      x.font = `600 ${11 * S + 2}px "Roboto Mono",monospace`; x.fillStyle = 'rgba(233,237,245,.5)'; x.textAlign = 'left'; x.fillText('сценарій · 45 тактів по 2 с (120 уд/хв)', 20, 24);
      for (let b = 0; b < 45; b++) { const X = 20 + b * (W - 40) / 45; x.fillStyle = b / 45 < p ? '#E0532A' : 'rgba(255,255,255,.12)'; x.fillRect(X, 34, (W - 40) / 45 - 2, 10); }
      // 2) кадри-мініатюри
      x.fillStyle = 'rgba(233,237,245,.5)'; x.fillText('seek(t) → знімок вікна (PNG)', 20, 72);
      for (let i = 0; i < 12; i++) { const X = 20 + i * (W - 40) / 12, k = Math.floor(p * 12 * 4) - i * 4, on = k >= 0; x.fillStyle = on ? `hsl(${20 + i * 3},70%,${30 + 30 * Math.sin(i + p * 20) ** 2}%)` : 'rgba(255,255,255,.06)'; x.fillRect(X, 82, (W - 40) / 12 - 6, 50); }
      // 3) звук
      x.fillStyle = 'rgba(233,237,245,.5)'; x.fillText('OfflineAudioContext → WAV 48 кГц', 20, 158);
      x.strokeStyle = '#9fe3b8'; x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i < W - 40; i += 3) { const u = i / (W - 40), a = u < p ? Math.sin(i * .2) * Math.sin(i * .013) * 14 : 0; i ? x.lineTo(20 + i, 180 + a) : x.moveTo(20, 180); } x.stroke();
      // 4) склейка
      x.fillStyle = 'rgba(233,237,245,.5)'; x.fillText('ffmpeg: H.264 · CRF 17 · AAC 192 кбіт/с → MP4', 20, 222);
      x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(20, 232, W - 40, 12); x.fillStyle = p >= 1 ? '#1E968C' : '#E0532A'; x.fillRect(20, 232, (W - 40) * p, 12);
      st.textContent = `кадр ${fr} / ${total} · ${p >= 1 ? 'готово: ролик.mp4' : run ? `≈ ${Math.round((1 - p) * total / 1.8 / 60)} хв лишилось на ноутбуці` : 'стоїть'}`;
    }
    function loop(now) { if (!run) return; p = Math.min(1, p + (REDUCE ? 1 : .0035)); if (Math.floor(p * 60) !== Math.floor((p - .0035) * 60)) SND('shutter'); draw(); if (p >= 1) { run = false; play.textContent = '↻ ще раз'; play.classList.remove('on'); SND('chime'); return; } raf = requestAnimationFrame(loop); }
    play.addEventListener('click', () => { if (run) { run = false; play.textContent = '▶ продовжити'; play.classList.remove('on'); return; } if (p >= 1) p = 0; run = true; play.textContent = '❚❚ пауза'; play.classList.add('on'); raf = requestAnimationFrame(loop); });
    sel.addEventListener('change', draw);
    new ResizeObserver(() => { size(); draw(); }).observe(cv);
  })();

  /* ═════ Для клієнта: документи → показ → PPTX ═════ */
  (function () {
    const s = $('sk-client'); if (!s) return;
    const D = [['Спека', 'джерело, не редагується'], ['План збірки', 'лише технічні рішення'], ['Тексти', 'copy.md → copy.js, ~690 ключів'], ['HANDOFF', 'що працює, пастки, що далі']];
    const box = el('div', 'sk-cl');
    box.innerHTML = `<div class="sk-cl__docs">${D.map(([a, b], i) => `<div class="sk-doc" style="--i:${i}"><b>${a}</b><span>${b}</span></div>`).join('<i>→</i>')}</div>
      <div class="sk-cl__pp"><div class="sk-slide"><div class="sk-slide__plate"><div class="ph"></div><div class="dots"><i></i><i></i><i></i></div></div>
        <div class="sk-slide__txt"><b class="t1">Ваш каталог і ваша каса</b><span class="t2">Один профіль гостя для всіх послуг</span><span class="t3">Проксіміті · без стеження</span></div></div>
        <div><button type="button" class="rc-btn" data-play>▶ дві зйомки</button><p class="sk-cl__cap">Слайд знімається двічі: спершу координати текстів, потім «плита» з прозорим текстом. У PPTX плита — картинкою, написи — редагованими блоками поверх.</p></div></div>`;
    s.appendChild(box);
    const sl = box.querySelector('.sk-slide'), btn = box.querySelector('[data-play]');
    btn.addEventListener('click', () => { const on = !sl.classList.contains('split'); sl.classList.toggle('split', on); btn.textContent = on ? '↺ зібрати назад' : '▶ дві зйомки'; SND(on ? 'shutter' : 'click'); });
    new IntersectionObserver((es) => { if (es[0].isIntersecting) box.querySelectorAll('.sk-doc').forEach((d) => d.classList.add('in')); }, { threshold: .3 }).observe(box);
  })();
})();
