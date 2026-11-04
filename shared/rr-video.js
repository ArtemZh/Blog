/* Стаття 41, ролик «Одна доба магазину за півтори хвилини» — готове відео (MP4), відрендерене покадрово з rr-reel.js (ship-pipeline/render-reel-41.mjs).
   Дві якості: HD 1080p і легка 540p (за замовчуванням на вузьких екранах і при «економії даних»), перемикач HD / Lite; кнопка «на весь екран».
   Розділи на смузі — ті самі межі, що в коді ролика (0/16/32/56/76/88 с). Під час відео фонова музика сторінки замовкає. Стан — window.__rr.reel. */
(function () {
  const box = document.getElementById('rr-reel'); if (!box || /[?&]reel=render/.test(location.search)) return;
  const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk), LANG = EN ? 'en' : 'uk', DUR = 96, V = '20261104';
  const src = (q) => `assets/retail-robots/video/reel-${LANG}-${q}.mp4?v=${V}`;
  const net = navigator.connection || {}, small = innerWidth < 900 || net.saveData || /2g/.test(net.effectiveType || '');
  let q = small ? 'lite' : 'hd';
  const CH = [[0, L('ніч', 'night')], [16, L('ранок', 'morning')], [32, L('день', 'day')], [56, L('вечір', 'evening')], [76, L('рік', 'year')], [88, L('висновок', 'takeaway')]];
  box.innerHTML = `<div class="rr-reel__stage"><video playsinline preload="metadata" src="${src(q)}"></video>
    <button type="button" class="rr-reel__cover" data-cover><span class="rr-reel__play">▶</span><b>${L('Одна доба магазину за півтори хвилини', 'A store’s day in a minute and a half')}</b><small>${L('96 с · спершу подивіться, потім грайтеся зі сценами', '96 s · watch first, then play with the scenes')}</small></button></div>
    <div class="rr-reel__ctl"><button type="button" data-pp aria-label="${L('Відтворити', 'Play')}">▶</button><div class="rr-reel__bar"><input type="range" data-t min="0" max="${DUR}" step="0.1" value="0" aria-label="${L('Час ролика', 'Reel time')}"><div class="rr-reel__ch">${CH.map((c) => `<span style="left:${c[0] / DUR * 100}%">${c[1]}</span>`).join('')}</div></div><output data-o>0:00</output>
      <button type="button" class="rr-reel__q" data-q title="${L('Якість відео', 'Video quality')}"></button><button type="button" data-fs aria-label="${L('На весь екран', 'Full screen')}" title="${L('На весь екран', 'Full screen')}">⛶</button></div>
    <p class="oc-note">${L('Маршрути роботів на карті — справжні пішохідні маршрути OpenStreetMap у Таллінні, але умовні й прискорені: це ілюстрація, не дані Starship. Карта © OpenStreetMap, OpenFreeMap.', 'Robot routes on the map are real OpenStreetMap walking routes in Tallinn, but illustrative and sped up, not Starship data. Map © OpenStreetMap, OpenFreeMap.')}</p>`;
  const $ = (s) => box.querySelector(s), v = $('video'), cover = $('[data-cover]'), pp = $('[data-pp]'), sl = $('[data-t]'), out = $('[data-o]'), qb = $('[data-q]'), fs = $('[data-fs]');
  const hold = (on) => { if (window.RR_SND && RR_SND.hold) RR_SND.hold(on); };
  const T = window.__rr = window.__rr || {};
  function show() { const t = v.currentTime || 0; sl.value = t; out.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; T.reel = { t: +t.toFixed(2), playing: !v.paused, q }; }
  const paintQ = () => { qb.textContent = q === 'hd' ? 'HD' : 'Lite'; qb.setAttribute('aria-label', L('Якість: ', 'Quality: ') + qb.textContent); };
  function play() { cover.hidden = true; if (v.ended) v.currentTime = 0; v.play().catch(() => {}); }
  cover.addEventListener('click', play);
  pp.addEventListener('click', () => (v.paused ? play() : v.pause()));
  v.addEventListener('click', () => (v.paused ? play() : v.pause()));
  v.addEventListener('play', () => { pp.textContent = '❚❚'; hold(true); show(); });
  v.addEventListener('pause', () => { pp.textContent = '▶'; hold(false); show(); });
  v.addEventListener('timeupdate', show);
  sl.addEventListener('input', () => { cover.hidden = true; v.currentTime = +sl.value; show(); });
  // якість: міняємо файл, зберігаючи місце й стан відтворення
  qb.addEventListener('click', () => { const t = v.currentTime, was = !v.paused; q = q === 'hd' ? 'lite' : 'hd'; paintQ(); v.src = src(q);
    v.addEventListener('loadedmetadata', () => { v.currentTime = t; if (was) v.play().catch(() => {}); show(); }, { once: true }); });
  // на весь екран — саме відео; на iPhone працює лише вбудований повноекранний плеєр
  fs.addEventListener('click', () => { cover.hidden = true;
    if (v.requestFullscreen) v.requestFullscreen().then(() => { if (v.paused) play(); }).catch(() => {}); else if (v.webkitEnterFullscreen) { v.webkitEnterFullscreen(); if (v.paused) play(); } });
  document.addEventListener('fullscreenchange', () => { v.controls = document.fullscreenElement === v; });
  // поза екраном — пауза
  new IntersectionObserver((e) => { if (!e[0].isIntersecting && !v.paused && document.fullscreenElement !== v) v.pause(); }, { threshold: 0 }).observe(v);
  paintQ(); show();
})();
