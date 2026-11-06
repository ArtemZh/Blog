/* Стаття 41, «А ще…»: вісім історій — вісім «експонатів» (порада ChatGPT 04.11: одна історія — одна візуальна думка).
   Текст береться з наявного списку (українська в розмітці, англійська — data-en; мова застосовується до цього скрипта), нічого не сховано за кліком.
   Числа на схемах — лише ті, що є в тексті пункту; схеми умовні (Żabka — не карта, а кластери точок). Лінії промальовуються один раз, коли картка з'являється на екрані. */
(function () {
  const sec = document.getElementById('more'); if (!sec) return;
  const ul = sec.querySelector('ul.src29'); if (!ul) return;
  const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk);
  const num = (v) => v.toLocaleString(EN ? 'en-GB' : 'uk-UA');
  const C = { bg: '#0b1622', ink: '#e9f1f3', dim: 'rgba(233,241,243,.55)', faint: 'rgba(233,241,243,.18)', teal: '#5fe8dc', warm: '#ffd29a', red: '#e0735d' };
  const W = 320, H = 168;
  const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.c || C.ink}" font-size="${o.n || 11}" font-weight="${o.w || 500}" text-anchor="${o.a || 'start'}"${o.mono ? ' font-family="Roboto Mono, monospace"' : ''}>${s}</text>`;
  const arrow = (x1, y1, x2, y2, c, dash) => { const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 7 * Math.cos(a), hy = y2 - 7 * Math.sin(a), n = [Math.sin(a) * 4, -Math.cos(a) * 4];
    return `<line class="dr" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.6"${dash ? ' stroke-dasharray="4 4"' : ''}/><polygon points="${x2},${y2} ${hx + n[0]},${hy + n[1]} ${hx - n[0]},${hy - n[1]}" fill="${c}"/>`; };

  const V = [
    // 01 Walmart ⇄ Symbotic: хто кому що передає
    { k: L('угода', 'deal'), svg: () => `<rect x="14" y="52" width="78" height="60" rx="8" fill="none" stroke="${C.ink}" stroke-opacity=".5"/>${t(53, 87, 'Walmart', { a: 'middle', w: 700, n: 12 })}
      <rect x="228" y="52" width="78" height="60" rx="8" fill="none" stroke="${C.ink}" stroke-opacity=".5"/>${t(267, 87, 'Symbotic', { a: 'middle', w: 700, n: 12 })}
      ${arrow(96, 40, 224, 40, C.ink)}${t(160, 33, L('підрозділ роботів', 'robotics unit'), { a: 'middle', c: C.dim, n: 10 })}
      ${arrow(224, 70, 96, 70, C.teal)}${t(160, 64, L('200 млн $ + до 350 млн $', '$200m + up to $350m'), { a: 'middle', c: C.teal, n: 10 })}
      ${arrow(96, 98, 224, 98, C.warm)}${t(160, 92, L('520 млн $ на розробку', '$520m for development'), { a: 'middle', c: C.warm, n: 10 })}
      ${arrow(224, 126, 96, 126, C.teal, 1)}${t(160, 120, L('400 систем — якщо виконають показники', '400 systems, if targets are met'), { a: 'middle', c: C.teal, n: 10 })}
      ${t(160, 156, L('договір на 12 років, технологія ексклюзивна', '12-year contract, technology exclusive'), { a: 'middle', c: C.dim, n: 10, mono: 1 })}` },
    // 02 IFR: гостинність проти логістики, у масштабі
    { k: L('ринок', 'market'), svg: () => { const X = (v) => 110 + v / 110 * 190;
      return `${t(14, 22, L('продажі 2024, тис. шт. (IFR)', '2024 sales, thousand units (IFR)'), { c: C.dim, n: 10, mono: 1 })}
      ${t(14, 50, L('гостинність', 'hospitality'), { n: 11 })}<rect class="gr" x="110" y="39" width="${X(42) - 110}" height="16" rx="3" fill="${C.red}"/>${t(X(42) + 6, 51, L('≈42 · −11 %', '≈42 · −11%'), { c: C.red, n: 10.5, w: 700 })}
      ${t(14, 82, L('логістика', 'logistics'), { n: 11 })}<rect class="gr" x="110" y="71" width="${X(102.9) - 110}" height="16" rx="3" fill="${C.teal}"/>${t(X(102.9) - 6, 83, L('102,9 · +14 %', '102.9 · +14%'), { c: C.bg, n: 10.5, w: 700, a: 'end' })}
      <circle cx="44" cy="130" r="22" fill="none" stroke="${C.faint}" stroke-width="9"/><circle class="dr" cx="44" cy="130" r="22" fill="none" stroke="${C.teal}" stroke-width="9" stroke-dasharray="${(2 * Math.PI * 22 * .47).toFixed(1)} 999" transform="rotate(-90 44 130)"/>
      ${t(44, 134, '47 %', { a: 'middle', n: 11, w: 700 })}${t(80, 124, L('2025: логістика +21 %,', '2025: logistics +21%,'), { n: 11 })}${t(80, 140, L('47 % усіх продажів', '47% of all sales'), { n: 11, c: C.dim })}`; } },
    // 03 Żabka Nano: 25 точок у 6 містах (кластери, не карта) + магазин на заводі
    { k: L('Європа', 'Europe'), svg: () => { const cl = [[52, 52, 7], [118, 98, 5], [62, 120, 4], [180, 46, 4], [150, 140, 3], [218, 104, 2]]; let d = '';
      cl.forEach(([x, y, n], ci) => { for (let i = 0; i < n; i++) { const a = i / n * 6.283 + ci, r = n > 1 ? 9 + (i % 2) * 5 : 0; d += `<circle cx="${(x + r * Math.cos(a)).toFixed(1)}" cy="${(y + r * Math.sin(a)).toFixed(1)}" r="3.4" fill="${C.teal}"/>`; } });
      return `${d}${t(14, 160, L('2022: 25 точок у 6 містах (схема, не карта)', '2022: 25 sites in 6 cities (diagram, not a map)'), { c: C.dim, n: 10 })}
      <rect x="236" y="30" width="54" height="40" fill="none" stroke="${C.warm}"/><path d="M236 30 l12 -10 v10 l12 -10 v10 l12 -10 v10" fill="none" stroke="${C.warm}"/><circle cx="263" cy="52" r="3.4" fill="${C.teal}"/>
      ${t(263, 88, L('2025: усередині', '2025: inside'), { a: 'middle', n: 10, c: C.warm })}${t(263, 101, L('заводу Michelin', 'a Michelin plant'), { a: 'middle', n: 10, c: C.warm })}
      ${t(263, 126, L('450–1 500', '450–1,500'), { a: 'middle', n: 12, w: 700 })}${t(263, 139, L('позицій', 'products'), { a: 'middle', n: 10, c: C.dim })}`; } },
    // 04 Just Walk Out: 44 магазини Fresh, у 27 технологію прибрали; лишилось там, де кошик малий
    { k: L('формат', 'format'), svg: () => { let g = ''; for (let i = 0; i < 44; i++) { const x = 16 + (i % 11) * 13, y = 34 + Math.floor(i / 11) * 13, on = i < 27; g += `<rect x="${x}" y="${y}" width="10" height="10" rx="2" fill="${on ? C.red : 'none'}" stroke="${on ? C.red : C.faint}"/>`; }
      return `${t(14, 22, L('великі Fresh у США, 2024', 'large US Fresh stores, 2024'), { c: C.dim, n: 10, mono: 1 })}${g}
      ${t(14, 104, L('27 з ≈44 — Just Walk Out прибрали,', '27 of ≈44: Just Walk Out removed,'), { n: 10.5, c: C.red })}${t(14, 118, L('замість нього — візки Dash Cart', 'Dash Cart smart carts instead'), { n: 10.5, c: C.dim })}
      ${arrow(170, 70, 200, 70, C.teal)}${t(206, 46, L('лишився:', 'stayed:'), { n: 10.5, c: C.dim })}${t(206, 64, 'Amazon Go', { n: 11, w: 700, c: C.teal })}${t(206, 80, L('малі Fresh у Британії', 'small UK Fresh'), { n: 10.5, c: C.teal })}
      ${t(206, 98, L('130+ точок інших', '130+ sites of other'), { n: 10.5, c: C.teal })}${t(206, 112, L('компаній: аеропорти,', 'companies: airports,'), { n: 10.5, c: C.dim })}${t(206, 126, L('стадіони, кампуси', 'stadiums, campuses'), { n: 10.5, c: C.dim })}
      ${t(14, 156, L('великий кошик рахує візок, швидку покупку — камери', 'a big basket suits the cart, a quick grab suits cameras'), { n: 10, c: C.dim })}`; } },
    // 05 RFID: хвилі проходять крізь стопку одягу; без мітки товар не видно
    { k: L('одяг', 'apparel'), svg: () => { let g = '', w = ''; for (let i = 0; i < 6; i++) { const x = 150 + i * 26, tag = i !== 4;
        g += `<line x1="${x + 10}" y1="34" x2="${x + 10}" y2="44" stroke="${C.dim}"/><path d="M${x} 50 l10 -6 l10 6 v52 h-20 z" fill="${tag ? '#1d3440' : 'none'}" stroke="${tag ? C.ink : C.faint}" stroke-opacity=".6"${tag ? '' : ' stroke-dasharray="3 3"'}/>${tag ? `<rect x="${x + 6}" y="84" width="8" height="6" fill="${C.warm}"/>` : ''}`; }
      for (let r = 1; r <= 4; r++) w += `<path class="dr" d="M${70 + r * 16} ${74 - r * 14} a${r * 16} ${r * 16} 0 0 1 0 ${r * 28}" fill="none" stroke="${C.warm}" stroke-opacity="${1 - r * .18}"/>`;
      return `<line x1="140" y1="34" x2="310" y2="34" stroke="${C.dim}"/>${g}<rect x="34" y="40" width="34" height="78" rx="10" fill="#e9f1f3" fill-opacity=".85"/><rect x="58" y="62" width="10" height="24" fill="${C.warm}"/>${w}
      ${t(14, 140, L('мітку не треба бачити — робот читає стопку на ходу', 'no line of sight: the robot reads a stack in passing'), { n: 10.5 })}${t(14, 156, L('без мітки (пунктир) товар для робота не існує', 'untagged (dashed) items do not exist for the robot'), { n: 10, c: C.dim, mono: 1 })}`; } },
    // 06 LoweBot: від пілоту до прототипу
    { k: L('прототип', 'prototype'), svg: () => `<line class="dr" x1="30" y1="96" x2="296" y2="96" stroke="${C.faint}" stroke-width="2"/>
      ${[[36, '2014', 'OSHbot', L('пілот', 'pilot')], [120, '2016', 'LoweBot', L('11 магазинів', '11 stores')], [250, L('зараз', 'now'), L('прототип', 'prototype'), L('ідея — у цифрових двійниках', 'idea lives on in digital twins')]].map(([x, y, a, b], i) => `<circle cx="${x}" cy="96" r="6" fill="${i === 2 ? C.bg : C.ink}" stroke="${i === 2 ? C.red : C.ink}" stroke-width="2"/>${t(x, 84, y, { a: 'middle', n: 10, c: C.dim, mono: 1 })}${t(x, 118, a, { a: 'middle', n: 11.5, w: 700, c: i === 2 ? C.red : C.ink })}${t(i === 2 ? 312 : x, 133, b, { a: i === 2 ? 'end' : 'middle', n: 10, c: C.dim })}`).join('')}
      <g opacity=".7"><rect x="102" y="22" width="36" height="46" rx="12" fill="none" stroke="${C.ink}" stroke-dasharray="3 3"/><rect x="110" y="32" width="20" height="12" rx="2" fill="none" stroke="${C.ink}" stroke-dasharray="2 2"/></g>
      <rect x="208" y="34" width="84" height="22" rx="3" fill="none" stroke="${C.red}" stroke-width="1.6" transform="rotate(-6 250 45)"/>${t(250, 50, L('ПРОТОТИП', 'PROTOTYPE'), { a: 'middle', n: 11, w: 700, c: C.red, mono: 1 })}
      ${t(14, 158, L('«де шурупи» тепер відповідає застосунок у телефоні', '“where are the screws” is now answered by a phone app'), { n: 10, c: C.dim })}` },
    // 07 Knightscope: маршрут по парковці, не в залі; підписка
    { k: L('бізнес-модель', 'business model'), svg: () => { let p = ''; for (let i = 0; i < 7; i++) p += `<rect x="${34 + i * 24}" y="76" width="18" height="30" fill="none" stroke="${C.faint}"/><rect x="${34 + i * 24}" y="116" width="18" height="30" fill="none" stroke="${C.faint}"/>`;
      return `<rect x="24" y="16" width="180" height="40" fill="#16242e" stroke="${C.dim}"/>${t(114, 40, L('магазини-орендарі', 'retail tenants'), { a: 'middle', n: 10.5, c: C.dim })}${p}
      <path class="dr" d="M28 66 H206 V156 H28 Z" fill="none" stroke="${C.teal}" stroke-width="1.6" stroke-dasharray="5 4"/><circle cx="206" cy="110" r="6" fill="${C.teal}"/>
      <circle cx="268" cy="72" r="26" fill="none" stroke="${C.faint}" stroke-width="9"/><circle class="dr" cx="268" cy="72" r="26" fill="none" stroke="${C.warm}" stroke-width="9" stroke-dasharray="${(2 * Math.PI * 26 * .7).toFixed(1)} 999" transform="rotate(-90 268 72)"/>
      ${t(268, 76, '≈70 %', { a: 'middle', n: 11, w: 700 })}${t(268, 116, L('сервісні доходи', 'service revenue'), { a: 'middle', n: 10, c: C.warm })}${t(268, 130, L('8 млн $ у 2025', '$8m in 2025'), { a: 'middle', n: 10.5, w: 700 })}${t(268, 146, L('підписка', 'subscription'), { a: 'middle', n: 10, c: C.dim })}`; } },
    // 08 Ринок: дві оцінки одного «ринку», у масштабі від нуля
    { k: L('цифри', 'numbers'), svg: () => { const X = (v) => 20 + v / 34 * 280;
      return `${t(14, 22, L('«автоматизація рітейлу», 2026, млрд $', '“retail automation”, 2026, $bn'), { c: C.dim, n: 10, mono: 1 })}
      ${t(14, 48, 'Straits Research', { n: 11 })}<rect class="gr" x="20" y="54" width="${X(24) - 20}" height="18" rx="3" fill="${C.ink}" fill-opacity=".55"/>${t(X(24) + 6, 67, '≈24', { n: 12, w: 700 })}
      ${t(14, 94, 'Fortune Business Insights', { n: 11 })}<rect class="gr" x="20" y="100" width="${X(31) - 20}" height="18" rx="3" fill="${C.ink}" fill-opacity=".55"/>${t(X(31) + 6, 113, '31', { n: 12, w: 700 })}
      <rect x="${X(24)}" y="96" width="${X(31) - X(24)}" height="26" fill="${C.warm}" fill-opacity=".25" stroke="${C.warm}" stroke-dasharray="3 3"/>
      ${t(14, 146, L('методики не показані — межу «ринку» кожен проводить сам', 'no methods shown: each firm draws the “market” its own way'), { n: 10, c: C.dim })}`; } }];

  // перебудова: кожен пункт списку → картка «експонат» зі схемою зверху й повним текстом нижче
  const items = [...ul.children];
  if (items.length !== V.length) return;
  const ol = document.createElement('ol'); ol.className = 'rr-ex';
  items.forEach((li, i) => { const b = li.querySelector('b'), title = b ? b.textContent.trim() : '';
    if (b) b.remove(); const body = li.innerHTML.trim();
    const c = document.createElement('li'); c.className = 'rr-ex__c';
    c.innerHTML = `<div class="rr-ex__v"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${title.replace(/"/g, '&quot;')}" font-family="Inter, system-ui, sans-serif">${V[i].svg()}</svg></div>
      <div class="rr-ex__t"><span class="rr-ex__k">${String(i + 1).padStart(2, '0')} · ${V[i].k}</span><h4>${title}</h4><p>${body}</p></div>`;
    ol.appendChild(c); });
  ul.replaceWith(ol);
  // промальовування — один раз, коли картка на екрані; без анімації, якщо користувач її вимкнув
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .35 });
  ol.querySelectorAll('.rr-ex__c').forEach((c) => io.observe(c));
  const T = window.__rr = window.__rr || {}; T.more = { n: ol.children.length };
})();
