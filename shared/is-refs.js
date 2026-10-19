/* Стаття 34, блок «Відсилки й пасхалки»: картки з маленькими живими візуалізаціями.
   Без кадрів із фільмів, облич і логотипів; карти — схеми, підписані як схеми. */
(function () {
  const slot = document.getElementById('viz-refs'); if (!slot) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = document.createElement('style');
  st.textContent = `
    .rf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px;margin:var(--sp-sm) 0}
    .rf{border:1px solid var(--rule);border-radius:var(--r-lg);background:var(--ground);overflow:hidden;display:flex;flex-direction:column}
    .rf__viz{height:170px;background:#0a0c12;position:relative;display:flex;align-items:center;justify-content:center}
    .rf__viz svg{width:100%;height:100%;display:block}
    .rf__b{padding:12px 14px 14px}
    .rf__b h3{font-size:15px;margin:6px 0 6px}
    .rf__b p{font-size:13.5px;margin:0;color:var(--ink-2)}
    .rf__kind{display:inline-block;font:600 10px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:4px 7px;border-radius:5px}
    .rf__kind.sci{background:color-mix(in srgb,var(--c-teal,#1E968C) 14%,transparent);color:var(--c-teal,#1E968C)}
    .rf__kind.fic{background:var(--act-soft);color:var(--act)}
    .rf__kind.set{background:color-mix(in srgb,var(--c-blue,#4678DC) 14%,transparent);color:var(--c-blue,#4678DC)}
    .rf__ctl{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px;color:var(--ink-3)}
    .rf__ctl input{accent-color:var(--act);width:110px}
    .rf__ctl b{font-family:var(--mono);color:var(--ink)}
    .rf-tl circle{cursor:pointer}
    .rf-mur{font:500 13px/1.4 var(--sans);color:#e8ecf4;padding:18px;text-align:center}
    .rf-btn{font:500 12px/1 var(--sans);padding:7px 10px;border:1px solid var(--rule);border-radius:var(--r-md);background:var(--ground);cursor:pointer}
    .rf-btn:hover{border-color:var(--act);color:var(--act)}`;
  document.head.appendChild(st);

  const C = (kind, label) => `<span class="rf__kind ${kind}">${label}</span>`;
  const cards = [
    { id: 'mono', kind: C('fic', 'кіно'), t: '«Космічна одіссея 2001 року»',
      p: 'Роботи-плити нагадують моноліт Кубрика й Кларка з пропорціями 1 : 4 : 9 — квадрати перших трьох чисел. Кільце корабля, що крутиться заради штучного тяжіння, — теж поклін «Одіссеї».',
      ctl: '<label>радіус кільця <input type="range" min="5" max="200" value="30" data-r></label> <span>оберт за <b data-T></b></span>' },
    { id: 'contact', kind: C('sci', 'наука'), t: '«Контакт», Саган і Торн',
      p: 'Для роману «Контакт» Карл Саган попросив Кіпа Торна перевірити, чи можна подорожувати крізь червоточину. Відповідь Торна виросла в статтю 1988 року про прохідні червоточини — прямого предка червоточини «Інтерстеллара». Головну роль в екранізації «Контакту» (1997) теж зіграв Метью Макконагі.' },
    { id: 'dust', kind: C('sci', 'історія'), t: 'Пилові бурі 1930-х',
      p: 'Пилові бурі фільму мають реальний прототип — Dust Bowl на Великих рівнинах США. Найсильніша, «Чорна неділя», накрила рівнини 14 квітня 1935 року. Спогади старих людей у фільмі навіяні справжніми інтерв’ю з документального фільму Кена Бернса «The Dust Bowl» (2012).' },
    { id: 'endur', kind: C('sci', 'історія'), t: '«Ендюранс» Шеклтона',
      p: 'Корабель фільму має ім’я судна антарктичної експедиції Ернеста Шеклтона 1914–1917 років. Справжній «Ендюранс» затиснули й розчавили криги в морі Ведделла (1915), але всі 28 людей урятувалися. Уламки знайшли 2022 року на глибині понад 3 км.' },
    { id: 'murph', kind: C('fic', 'сюжет'), t: 'Закон Мерфі',
      p: 'Мерф названа на честь закону Мерфі: «усе, що може піти не так, піде не так». Купер пояснює доньці, що закон не про невдачі, а про те, що статися може будь-що.', ctl: '<button type="button" class="rf-btn" data-m>що може піти не так?</button>' },
    { id: 'corn', kind: C('set', 'зйомки'), t: '500 акрів кукурудзи',
      p: 'Для зйомок Нолан виростив справжнє кукурудзяне поле площею близько 500 акрів, а потім урожай продали. 500 акрів ≈ 202 га — це приблизно 280 футбольних полів 105 × 68 м.' },
    { id: 'poem', kind: C('set', 'лейтмотив'), t: 'Ділан Томас, 1951',
      p: 'Крізь фільм проходить вірш валлійського поета Ділана Томаса «Do not go gentle into that good night», опублікований 1951 року, — про опір згасанню. У фільмі його читає професор Бренд.' },
  ];
  slot.innerHTML = '<div class="rf-grid">' + cards.map((c) => `<article class="rf" data-id="${c.id}"><div class="rf__viz"></div><div class="rf__b">${c.kind}<h3>${c.t}</h3><p>${c.p}</p>${c.ctl ? '<div class="rf__ctl">' + c.ctl + '</div>' : ''}</div></article>`).join('') + '</div>' +
    '<p class="chint">Карти — схеми, не в масштабі. Факти про зйомки й історію — з відкритих джерел, позначено окремо від фізики.</p>';
  const V = (id) => slot.querySelector(`[data-id="${id}"] .rf__viz`);
  const NS = 'http://www.w3.org/2000/svg';

  /* 1. моноліт 1:4:9 і кільце зі штучним тяжінням: період T = 2π√(R/g) */
  (function () { const v = V('mono');
    v.innerHTML = `<svg viewBox="0 0 300 170"><g transform="translate(70 85)"><g data-slab><rect x="-10" y="-45" width="20" height="90" fill="#111418" stroke="#4a5160"/><rect x="-10" y="-45" width="4.4" height="90" fill="#22262e"/></g>
      <text x="0" y="66" fill="#8a93a6" font-size="9" text-anchor="middle" font-family="monospace">1 : 4 : 9</text></g>
      <g transform="translate(205 85)"><circle r="52" fill="none" stroke="#c9ced8" stroke-width="7"/><g data-ring stroke="#c9ced8" stroke-width="2"><line x1="-52" y1="0" x2="52" y2="0"/><line x1="0" y1="-52" x2="0" y2="52"/></g><circle r="9" fill="#9aa3b5"/>
      <circle data-dot r="3.5" fill="#EA5212" cx="0" cy="-52"/></g></svg>`;
    const r = v.parentNode.querySelector('[data-r]'), T = v.parentNode.querySelector('[data-T]'), ring = v.querySelector('[data-ring]'), dot = v.querySelector('[data-dot]'), slab = v.querySelector('[data-slab]');
    const per = () => 2 * Math.PI * Math.sqrt(+r.value / 9.81);
    const upd = () => { T.textContent = per().toFixed(1).replace('.', ',') + ' с (1 g на ободі, R = ' + r.value + ' м)'; }; r.addEventListener('input', upd); upd();
    let a = 0, last = performance.now();
    (function f(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) a += dt * 2 * Math.PI / per();
      ring.setAttribute('transform', `rotate(${a * 180 / Math.PI})`); dot.setAttribute('transform', `rotate(${a * 180 / Math.PI})`);
      slab.setAttribute('transform', `scale(${(Math.cos(now / 1600) * .5 + .5) * .7 + .3} 1)`); requestAnimationFrame(f); })(last);
  })();

  /* 2. часова лінія Саган → Торн → «Інтерстеллар» */
  (function () { const v = V('contact');
    const E = [[1985, 'Роман «Контакт» Сагана; лист Торну про подорож крізь червоточину'], [1988, 'Морріс і Торн: «Червоточини в просторі-часі та їх використання для міжзоряних подорожей»'], [1997, 'Фільм «Контакт»'], [2014, '«Інтерстеллар»: Торн — науковий консультант']];
    const X = (y) => 30 + (y - 1983) / (2016 - 1983) * 240;
    v.innerHTML = `<svg viewBox="0 0 300 170" class="rf-tl"><line x1="20" y1="70" x2="280" y2="70" stroke="#3a4152" stroke-width="2"/>` +
      E.map(([y], i) => `<g data-i="${i}"><circle cx="${X(y)}" cy="70" r="7" fill="${i === 1 ? '#1E968C' : '#4678DC'}"/><text x="${X(y)}" y="${i % 2 ? 98 : 52}" fill="#c8cfdc" font-size="10" text-anchor="middle" font-family="monospace">${y}</text></g>`).join('') +
      `<foreignObject x="10" y="112" width="280" height="56"><div xmlns="http://www.w3.org/1999/xhtml" data-tx style="font:12px/1.35 Inter,sans-serif;color:#e6eaf2;text-align:center">${E[1][1]}</div></foreignObject></svg>`;
    const tx = v.querySelector('[data-tx]');
    v.querySelectorAll('[data-i]').forEach((g) => { const f = () => { tx.textContent = E[+g.dataset.i][1]; }; g.addEventListener('pointerenter', f); g.addEventListener('click', f); });
  })();

  /* 3. схема Великих рівнин: пилова хмара котиться з півночі на південь, як «Чорна неділя» */
  (function () { const v = V('dust'), cv = document.createElement('canvas'); v.appendChild(cv); const x = cv.getContext('2d');
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = v.clientWidth * d; cv.height = v.clientHeight * d; cv.style.width = '100%'; cv.style.height = '100%'; x.setTransform(d, 0, 0, d, 0, 0); };
    fit(); addEventListener('resize', fit);
    const P = Array.from({ length: 260 }, () => ({ x: Math.random(), y: Math.random() * .25, s: Math.random() }));
    let t = 0, last = performance.now();
    (function f(now) { const W = v.clientWidth, H = v.clientHeight, dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      x.fillStyle = '#14100b'; x.fillRect(0, 0, W, H);
      // контур штатів (схема): прямокутники Канзасу, Оклахоми з «ручкою», Техасу, Колорадо, Нью-Мексико
      x.strokeStyle = 'rgba(220,190,140,.35)'; x.lineWidth = 1;
      [[.32, .12, .3, .22, 'KS'], [.06, .12, .26, .22, 'CO'], [.06, .34, .22, .3, 'NM'], [.28, .34, .34, .14, 'OK'], [.28, .48, .36, .38, 'TX']].forEach(([a, b, c, d, n]) => { x.strokeRect(a * W, b * H, c * W, d * H); x.fillStyle = 'rgba(220,190,140,.45)'; x.font = '9px monospace'; x.fillText(n, a * W + 4, b * H + 11); });
      x.fillStyle = 'rgba(234,82,18,.12)'; x.fillRect(.18 * W, .26 * H, .34 * W, .3 * H);
      const front = ((t * .06) % 1.3) - .2;
      P.forEach((p) => { const y = (p.y + front) * H, xx = (p.x + Math.sin(t * .5 + p.s * 6) * .01) * W;
        if (y < 0 || y > H) return; x.fillStyle = `rgba(150,110,70,${.25 + .35 * p.s})`; x.beginPath(); x.arc(xx, y, 3 + p.s * 9, 0, 7); x.fill(); });
      x.fillStyle = '#f0d9b5'; x.font = '600 10px monospace'; x.fillText('14.04.1935 · «Чорна неділя»', 8, H - 8);
      requestAnimationFrame(f); })(last);
  })();

  /* 4. схема маршруту «Ендюранса»: дрейф у кризі моря Ведделла → загибель корабля → о. Елефант → Південна Джорджія */
  (function () { const v = V('endur');
    v.innerHTML = `<svg viewBox="0 0 300 170"><path d="M40 150 C 90 120, 200 120, 290 150 L 290 170 L 40 170 Z" fill="#dfe6ef" opacity=".85"/>
      <text x="160" y="162" fill="#3a4152" font-size="9" text-anchor="middle" font-family="monospace">Антарктида (схема)</text>
      <path data-route d="M250 30 C 230 60, 200 100, 175 112 C 160 104, 150 95, 145 88 C 130 70, 110 60, 95 48 C 120 40, 170 30, 230 22" fill="none" stroke="#EA5212" stroke-width="2" stroke-dasharray="4 4"/>
      <circle cx="175" cy="112" r="4" fill="#EA5212"/><text x="182" y="116" fill="#e6eaf2" font-size="8.5" font-family="monospace">корабель затонув, 1915</text>
      <circle cx="95" cy="48" r="3.5" fill="#4678DC"/><text x="88" y="38" fill="#e6eaf2" font-size="8.5" text-anchor="end" font-family="monospace">о. Елефант</text>
      <circle cx="230" cy="22" r="3.5" fill="#1E968C"/><text x="224" y="14" fill="#e6eaf2" font-size="8.5" text-anchor="end" font-family="monospace">Пд. Джорджія · порятунок 1916</text>
      <circle data-ship r="3" fill="#fff"/></svg>`;
    const path = v.querySelector('[data-route]'), ship = v.querySelector('[data-ship]'), L = path.getTotalLength(); let t = 0, last = performance.now();
    (function f(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t = (t + dt * .06) % 1; const p = path.getPointAtLength(t * L); ship.setAttribute('cx', p.x); ship.setAttribute('cy', p.y); requestAnimationFrame(f); })(last);
  })();

  /* 5. закон Мерфі: що може піти не так (події з сюжету без спойлерів фіналу) */
  (function () { const v = V('murph'), d = document.createElement('div'); d.className = 'rf-mur'; v.appendChild(d);
    const L = ['хвиля-гора приходить саме тоді, коли модуль ще у воді', 'година на планеті коштує сім років на Землі', 'пил вкриває все — навіть книжкову полицю', 'стикування з кораблем, що обертається', 'дані, які потрібні, — всередині чорної діри'];
    let i = 0; const show = () => { d.textContent = '«' + L[i % L.length] + '»'; i++; }; show();
    slot.querySelector('[data-m]').addEventListener('click', show);
  })();

  /* 6. 500 акрів = ~283 поля 105×68 м: сітка, що заповнюється */
  (function () { const v = V('corn'), N = 283, cols = 24;
    v.innerHTML = `<svg viewBox="0 0 300 170">${Array.from({ length: N }, (_, k) => `<rect x="${12 + (k % cols) * 11.5}" y="${12 + Math.floor(k / cols) * 12.5}" width="9.5" height="10" rx="1" fill="#3d6b2c" opacity="0" data-k="${k}"/>`).join('')}
      <text x="150" y="164" fill="#d8e4cf" font-size="9.5" text-anchor="middle" font-family="monospace">500 акрів ≈ 202 га ≈ 283 футбольні поля</text></svg>`;
    const R = v.querySelectorAll('rect'); let k = 0;
    const tick = () => { if (k < N) { R[k].setAttribute('opacity', '1'); k++; setTimeout(tick, reduce ? 0 : 12); } };
    new IntersectionObserver((es) => { if (es[0].isIntersecting && k === 0) tick(); }).observe(v);
  })();

  /* 7. Ділан Томас: типографічна картка (без цитування тексту вірша) */
  (function () { const v = V('poem');
    v.innerHTML = `<svg viewBox="0 0 300 170"><text x="150" y="70" fill="#e6eaf2" font-size="17" text-anchor="middle" font-family="Georgia,serif" font-style="italic">Do not go gentle…</text>
      <text x="150" y="96" fill="#8a93a6" font-size="10" text-anchor="middle" font-family="monospace">Dylan Thomas · 1951 · вілланель</text>
      <circle cx="150" cy="128" r="10" fill="#EA5212" opacity=".85"><animate attributeName="r" values="10;5;10" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".85;.25;.85" dur="4s" repeatCount="indefinite"/></circle></svg>`;
  })();
})();
