/* Стаття 41, розділ «Родовід»: звідки взялися роботи магазину, 1953–2026. Шість гілок (склад, прибирання, полиця, консультант, доставка, гуманоїди),
   колір кінця гілки — лише статус: працює масово / пілоти / згорнуто. Вісь часу стиснута до 2000 року. Дати й числа — з джерел у «Що відомо» (перевірено 04.11.2026);
   «стовбур» 2000-х (автономна навігація, камери, дешеві обчислення) — наше спрощення. Стан — window.__rr.tree. */
(function () {
  const s = document.getElementById('rr-tree'); if (!s) return;
  const EN = window.PMP_LANG === 'en', L = (uk, en) => (EN ? en : uk), T = window.__rr = window.__rr || {};
  const SND = (k) => { if (window.RR_SND) RR_SND.fx(k); };
  const LANES = [
    [L('Склад', 'Warehouse'), 'mass'], [L('Прибирання залу', 'Floor cleaning'), 'mass'], [L('Полиця', 'Shelf'), 'pilot'],
    [L('Консультант і гід', 'Guide and assistant'), 'down'], [L('Доставка', 'Delivery'), 'mass'], [L('Гуманоїди', 'Humanoids'), 'pilot']];
  const SC = { mass: 'go', pilot: 'try', down: 'back' };
  const ST = { mass: L('працює масово', 'at scale'), pilot: L('пілоти', 'pilots'), down: L('згорнуто', 'rolled back') };
  // [лейн, рік, підпис, текст, джерело, вниз-подія]
  const N = [
    [0, 1953, 'Guide-O-Matic', L('Barrett Electronics переробляє тягач так, що він їде за дротом під стелею продуктового складу. Це перший безпілотний візок (AGV); частина джерел дає 1954 рік.', 'Barrett Electronics converts a tow tractor to follow a wire under the ceiling of a grocery warehouse: the first driverless vehicle (AGV). Some sources say 1954.'), 'Savant Automation; Robotics 24/7'],
    [0, 2005, 'AutoStore', L('Ідея 1990-х: ящики стоять стовпцями в сітці, роботи їздять згори й подають ящик людині. Компанію засновано 1996 року, першу установку в іншої компанії зроблено 2005-го в Норвегії.', 'An idea from the 1990s: bins stacked in a grid, robots running on top and bringing a bin to a person. The company was founded in 1996; the first installation at another company was in 2005 in Norway.'), 'AutoStore; NZ Herald'],
    [0, 2012, 'Amazon × Kiva', L('Amazon купує Kiva Systems приблизно за 775 млн $. Роботи підвозять стелаж до людини, а не людина ходить до полиці.', 'Amazon buys Kiva Systems for about $775m. Robots bring the shelf to the person instead of the person walking to the shelf.'), 'IEEE Spectrum, 2012'],
    [0, 2025.05, 'Walmart × Symbotic', L('Січень 2025: Walmart продає свій підрозділ роботів компанії Symbotic і замовляє 400 систем видачі онлайн-замовлень у магазинах — якщо вони виконають показники.', 'January 2025: Walmart sells its robotics unit to Symbotic and orders 400 in-store order pickup systems, provided they meet targets.'), 'Supply Chain Dive, 2025'],
    [0, 2025.5, L('Amazon: 1 млн', 'Amazon: 1m'), L('Липень 2025: Amazon ставить мільйонного робота й запускає модель DeepFleet, яка, за словами компанії, скорочує час у дорозі на 10 %.', 'July 2025: Amazon deploys its millionth robot and launches DeepFleet, which the company says cuts travel time by 10%.'), 'Digital Commerce 360, 2025'],
    [1, 2002.7, 'Roomba', L('17 вересня 2002 року iRobot випускає Roomba — перший масовий домашній робот: машина сама об’їжджає меблі в приміщенні, де живуть люди.', 'On 17 September 2002 iRobot releases the Roomba, the first mass-market home robot: a machine that steers round furniture in a room where people live.'), 'iRobot; Smithsonian'],
    [1, 2019.3, L('Walmart: мийники', 'Walmart: scrubbers'), L('Квітень 2019: Walmart додає 1 500 автономних мийників підлоги з ПЗ Brain Corp, парк зростає до приблизно 1 860 машин. За словами Brain Corp, раніше миття забирало в працівника близько двох годин на день.', 'April 2019: Walmart adds 1,500 autonomous floor scrubbers running Brain Corp software, taking the fleet to about 1,860. Brain Corp says scrubbing used to take a worker about two hours a day.'), 'Brain Corp; Chain Store Age, 2019'],
    [2, 2015.85, 'Simbe Tally', L('Листопад 2015: Simbe показує Tally — автономного робота, що перевіряє полиці й цінники (за словами компанії, перший такий). 2016 року Target тестує його в Сан-Франциско.', 'November 2015: Simbe unveils Tally, an autonomous robot that checks shelves and labels (the first, the company says). In 2016 Target tests it in San Francisco.'), 'Simbe, 2015; Fortune, 2016'],
    [2, 2017.3, 'Walmart × Bossa Nova', L('Walmart ставить сканери Bossa Nova; до 2020 року — близько 500 магазинів. У листопаді 2020 контракт розірвано: люди простішими засобами давали схожий результат.', 'Walmart deploys Bossa Nova scanners, about 500 stores by 2020. In November 2020 the contract ends: people with simpler tools got similar results.'), 'AP / TechXplore, 2020', 1],
    [2, 2019.05, 'Badger «Marty»', L('Січень 2019: Badger Technologies ставить роботів Marty майже в 500 магазинів Giant/Martin’s і Stop & Shop. Спершу вони шукають розливи на підлозі, згодом перевіряють і залишки.', 'January 2019: Badger Technologies puts Marty robots in nearly 500 Giant/Martin’s and Stop & Shop stores. First they look for spills, later they also check stock.'), 'Supermarket News, 2019; Business Wire, 2023'],
    [2, 2025.6, L('Європа', 'Europe'), L('2025–2026: Morrisons, SPAR Austria і Tesco тестують Tally; SPAR розширює пілот після п’яти місяців.', '2025–2026: Morrisons, SPAR Austria and Tesco test Tally; SPAR extends its pilot after five months.'), L('див. розділ 02', 'see section 02')],
    [3, 2014.45, 'Pepper', L('Червень 2014: SoftBank показує Pepper — робота, що вітає покупців у магазинах. Випустили близько 27 тис.; 2020 року виробництво зупинили, а 2021-го це визнали публічно.', 'June 2014: SoftBank unveils Pepper, a robot that greets shoppers. About 27,000 were built; production stopped in 2020 and this became public in 2021.'), 'IEEE Spectrum; Fortune, 2021', 1],
    [3, 2016.6, 'LoweBot', L('2016: Lowe’s ставить 22 роботи LoweBot в 11 магазинів біля Сан-Франциско. Згодом Lowe’s називає його прототипом.', '2016: Lowe’s puts 22 LoweBots in 11 stores near San Francisco. Later Lowe’s calls it a prototype.'), 'Retail Dive, 2016', 1],
    [4, 2014.6, 'Starship', L('2014: засновники Skype запускають Starship — шестиколісного робота, що везе замовлення тротуаром.', '2014: Skype’s co-founders start Starship, a six-wheeled robot that carries orders along the pavement.'), 'Starship'],
    [4, 2025.8, L('9 млн доставок', '9m deliveries'), L('Листопад 2025: понад 9 млн доставок у семи країнах і договір з Uber Eats — з грудня роботи возять замовлення в Лідсі. Навесні 2026 — понад 10 млн.', 'November 2025: over 9 million deliveries in seven countries and a deal with Uber Eats, with robots delivering in Leeds from December. Spring 2026: over 10 million.'), 'Business Wire, 2025'],
    [5, 1961, 'Unimate', L('1961: перша промислова рука стає на конвеєр General Motors у Нью-Джерсі. Від неї — маніпулятори, які сьогодні пробують поставити на ноги.', '1961: the first industrial arm joins a General Motors line in New Jersey. Its descendants are the manipulators now being put on legs.'), 'The Henry Ford; Guinness'],
    [5, 2024.5, 'Digit × GXO', L('Червень 2024: GXO підписує з Agility Robotics багаторічний договір на гуманоїдів Digit як сервіс — за словами компаній, перший такий. Склад біля Атланти, роботи перекладають ящики; скільки їх, не розкрито.', 'June 2024: GXO signs a multi-year deal with Agility Robotics for Digit humanoids as a service, the first such deal, the companies say. A warehouse near Atlanta, moving totes; the number of robots is not disclosed.'), 'GXO / Agility, 2024']
  ];
  const VW = 1000, LY0 = 70, LH = 62, VH = LY0 + LH * 6 + 44, TR = 2000;
  const X = (y) => (y < TR ? 150 + (y - 1950) / 50 * 150 : 300 + (y - TR) / 26.6 * 590);
  const Y = (l) => LY0 + l * LH;
  const b = document.createElement('div'); b.className = 'oc-sc rr-sc'; s.appendChild(b);
  b.innerHTML = `<div class="rr-seg" role="group" aria-label="${L('Гілка', 'Branch')}" data-f><small>${L('Гілка', 'Branch')}</small><button type="button" class="on" data-l="-1">${L('усі', 'all')}</button>${LANES.map((l, i) => `<button type="button" data-l="${i}">${l[0]}</button>`).join('')}</div>
    <div class="rr-tree" data-svg></div>
    <ol class="rr-log">${LANES.map((l, li) => `<li class="rr-log__g" data-g="${li}">${l[0]} <span class="rr-st ${SC[l[1]]}">${ST[l[1]]}</span></li>` + N.map((n, i) => [n, i]).filter((q) => q[0][0] === li).sort((p, q) => p[0][1] - q[0][1]).map(([n, i]) => `<li data-i="${i}" data-g="${li}"><div class="rr-log__h"><span class="rr-log__k">${Math.floor(n[1])}</span><b>${n[2]}</b></div><p>${n[3]}<small>${L('джерело', 'source')}: ${n[4]}</small></p></li>`).join('')).join('')}</ol>`;
  const host = b.querySelector('[data-svg]');
  let lane = -1, sel = -1;
  function draw() {
    const dim = (l) => lane >= 0 && l !== lane;
    // місце підпису задано вручну (перевірено скриптом T.tree.check): u — над вузлом, d — під ним, u2 — вище, коли поруч три вузли
    const SLOT = { 4: 'd', 8: 'd', 9: 'u2', 12: 'd' };
    const pos = N.map((n, i) => ({ x: X(n[1]), y: Y(n[0]), s: SLOT[i] || 'u' }));
    const ticks = [1950, 1975, 2000, 2005, 2010, 2015, 2020, 2025];
    host.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${L('Родовід роботів у рітейлі, 1953–2026', 'Family tree of retail robots, 1953–2026')}">
      ${ticks.map((t) => `<line x1="${X(t)}" x2="${X(t)}" y1="${LY0 - 34}" y2="${VH - 40}" class="rr-tree__grid"/><text x="${X(t)}" y="${VH - 22}" class="rr-tree__y" text-anchor="middle">${t}</text>`).join('')}
      <rect x="${X(1999.3)}" y="${LY0 - 30}" width="${X(2000.7) - X(1999.3)}" height="${LH * 5 + 60}" rx="4" class="rr-tree__trunk"/>
      <text x="${X(2000) + 10}" y="${LY0 - 40}" class="rr-tree__tl">${L('2000-ні: навігація, камери, дешеві обчислення', '2000s: navigation, cameras, cheap compute')}</text>
      <text x="${X(1950)}" y="${VH - 0}" class="rr-tree__tl">${L('шкала до 2000 стиснута', 'scale before 2000 is compressed')}</text>
      ${LANES.map((l, i) => { const ns = N.filter((n) => n[0] === i), x0 = Math.min(X(ns[0][1]), X(TR)), x1 = 905;
        return `<g class="rr-tree__lane${dim(i) ? ' dim' : ''}"><text x="12" y="${Y(i) + 4}" class="rr-tree__ln">${l[0]}</text>
          <line x1="${x0}" x2="${x1}" y1="${Y(i)}" y2="${Y(i)}" class="rr-tree__w"/>
          ${X(ns[0][1]) > X(TR) ? `<line x1="${X(TR)}" x2="${X(ns[0][1])}" y1="${Y(i)}" y2="${Y(i)}" class="rr-tree__w dash"/>` : ''}
          <rect x="${x1}" y="${Y(i) - 11}" width="84" height="22" rx="11" class="rr-tree__st ${l[1]}"/><text x="${x1 + 42}" y="${Y(i) + 4}" text-anchor="middle" class="rr-tree__stt">${ST[l[1]]}</text></g>`; }).join('')}
      ${N.map((n, i) => { const p = pos[i];
        return `<g class="rr-tree__n${n[5] ? ' dn' : ''}${i === sel ? ' on' : ''}${dim(n[0]) ? ' dim' : ''}" data-i="${i}" tabindex="0" role="button"><circle cx="${p.x}" cy="${p.y}" r="7"/>
          <text x="${p.x}" y="${p.s === 'd' ? p.y + 23 : p.s === 'u2' ? p.y - 29 : p.y - 13}" text-anchor="middle">${n[2]}</text></g>`; }).join('')}
    </svg>`;
    host.querySelectorAll('[data-i]').forEach((g) => { const go = () => { sel = +g.dataset.i; draw(); SND('tick'); host.classList.add('used'); };
      g.addEventListener('click', go); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    // список під деревом відкритий: фільтр гілки ховає чужі рядки, клік лише підсвічує пару «вузол — рядок»
    b.querySelectorAll('.rr-log li').forEach((r) => { r.hidden = lane >= 0 && +r.dataset.g !== lane; if (r.dataset.i) r.classList.toggle('on', +r.dataset.i === sel); });
    T.tree = { sel, lane, n: N.length };
  }
  b.querySelector('[data-f]').addEventListener('click', (e) => { const t = e.target.closest('[data-l]'); if (!t) return; lane = +t.dataset.l;
    b.querySelectorAll('[data-l]').forEach((x) => x.classList.toggle('on', x === t)); draw(); SND('tick'); });
  b.querySelectorAll('.rr-log [data-i]').forEach((r) => r.addEventListener('click', () => { sel = +r.dataset.i; draw(); SND('tick'); }));
  draw();
  T.tree.check = () => { const bx = [...host.querySelectorAll('.rr-tree__n text, .rr-tree__ln, .rr-tree__stt')].map((t) => t.getBBox()); let hit = 0;
    for (let i = 0; i < bx.length; i++) for (let j = i + 1; j < bx.length; j++) { const a = bx[i], c = bx[j]; if (a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height) hit++; } return { labels: bx.length, overlaps: hit }; };
})();
