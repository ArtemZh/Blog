/* Стаття 36, розділ «Хто що робить»: команда як схема — тим самим скілом і в тому самому вигляді, що схема платформи
   даних у статті «Дані та керування ними» (24-dwh; скіл designing-explorable-system-diagrams):
   • смуги (lane) — колонки: «Помічники» (вкладені групи: картинки й 3D, текст і звук, дані) · «Власник і Claude» · «Сторінка»;
   • позиції рахуються з lane/row, лінії — з ідентифікаторів; лінії лише між сусідніми смугами або сусідніми рядками —
     тож жодна не ріже чужу картку;
   • «+» розгортає блок у складові, усе нижче в смузі зсувається; відкритий — один;
   • вигляд — як у DWH: картки HTML над полотном ліній, смуги, підписи моношрифтом, точки на кінцях ліній, смуга-підказка;
   • наведення на блок підсвічує його зв’язки й показує пояснення в смузі-підказці; клік — закріпити;
   • сценарії — покроково, як в OSS/BSS: лінія кроку малюється до наступного блоку, по ній біжить точка, на лінії — що
     передається, у смузі-підказці — пояснення кроку; кроки йдуть самі, стрілки ← → гортають; знизу — смуга правил скіла.
   Мітки 3D-верстата над схемою викликають SK_ROLES.focus(id). */
(function () {
  const host = document.getElementById('sk-roles'); if (!host) return;
  const CW = 250, CH = 46, GAP = 10, X0 = 24, COL = 342, TOP = 52, SUBH = 26;
  // смуги: [назва, групи: [назва групи або '', [вузли]]]; вузол: [id, назва, тег, складові для «+», пояснення]
  const LANES = [
    ['Помічники', [
      ['Картинки й 3D', [
        ['gpt', 'ChatGPT', 'банер · вставки · 4 види', null, 'Малює ілюстрації за промптом зі скіла, а для 3D — чотири види предмета. Картинки — атмосфера, не дані: графіки й сцени малює код.'],
        ['tripo', 'Tripo', '4 види → модель', null, 'Збирає 3D-модель із чотирьох видів ChatGPT. Генерацію запускаю лише за командою власника — вона коштує кредити.'],
        ['blend', 'Blender', 'чистка · рендер', null, 'Полегшує модель і стискає її для сторінки (Draco), ставить мініатюри на стіл і рендерить кадри в Cycles.']]],
      ['Текст і звук', [
        ['gem', 'Gemini', 'стиль текстів', null, 'Править мову блоками з мітками. Його «зауваження до фактів» — лише сигнал: кожне перевіряється, хибні відхиляються.'],
        ['suno', 'Suno', 'музика', null, 'Тема статті й фон сторінки — за описом настрою, тихо (рівень 0,38). Ефекти синтезуються в браузері.'],
        ['slop', 'ai slop helper', 'помітки походження', ['Перевірено', 'Гіпотеза', 'Мій висновок', 'Доробити · Видалити'], 'Помітки на кожному блоці: що перевірено, що гіпотеза, що слово власника, а що асистент вигадав. Зауваження на полях замість переказу в чаті.']]],
      ['Дані', [
        ['src', 'Першоджерела', 'FRED · BLS · статті', null, 'Кожне число — значення, дата й джерело. Агрегатори й блоги — лише підказка, куди дивитися.']]]]],
    ['Власник і Claude', [
      ['Власник', [
        ['own-ok', 'Рішення й правки', 'тема · прийняти · відхилити', null, 'Обирає тему, читає сторінку, лишає зауваження на полях, приймає або відхиляє результат. Його правки стають правилами скіла.'],
        ['own-cmd', 'Команди', '22 · 11 · пуш', ['22 — лише план', '11 — виконуємо', 'пуш — публікуємо'], 'Три слова керують усім: «22» — лише план, «11» — виконати план, «пуш» — опублікувати. Без них Claude нічого не змінює.']]],
      ['Claude · диригент', [
        ['plan', 'План і завдання', 'PLAN.md · промпти', null, 'Пише план, промпти для помічників і завдання для субагентів. Відкриті питання — нумеровані, одним рядом.'],
        ['code', 'Код сторінки', 'HTML · Canvas · three.js', null, 'Збирає сторінку: сцени, що рахують за формулами й даними, схеми, ролик, звук. Усе — власним кодом.'],
        ['sub', 'Субагенти', 'великі задачі', ['трейлер', 'мініатюри в Blender', 'дослідження'], 'Великі задачі Claude віддає субагентам за файлом-завданням і сам перевіряє результат, перш ніж показати власнику.'],
        ['res', 'Дослідження й дані', 'джерела · знімок даних', null, 'Шукає першоджерела, знімає дані файлом із датою, звіряє цифри перед тим, як вони потраплять у сцену.'],
        ['chk', 'Перевірка', 'від найдешевшої', ['node --check', 'консоль', 'скрипт схеми', 'знімок у Chrome'], 'Від дешевого до дорогого: синтаксис, консоль, скрипт схеми, знімок у браузері. Повна регресія — лише на запит.']]]]],
    ['Сторінка', [['', [
      ['p-hero', 'Банер і картинки', 'атмосфера', null, 'Банер із тихою лівою частиною під заголовок, вставки між розділами.'],
      ['p-scene', 'Сцени й схеми', 'рахують з даних', null, 'Кожен розділ — коротко, сцена й примітка. Сцена — модель, яку можна зачепити.'],
      ['p-3d', '3D-моделі', 'GLB · Draco', null, 'Моделі на сторінці крутяться й мають мітки; мініатюри — кадри з Blender.'],
      ['p-reel', 'Ролик і звук', 'кадр — функція від часу', null, 'Ролик малюється кодом і перемотується; звук вимкнено, доки читач сам не ввімкне.'],
      ['p-prov', 'Помітки походження', 'що перевірено', null, 'Перемикач показує над кожним блоком, звідки він: факт, гіпотеза, слово власника.'],
      ['p-map', 'Карта статті', 'залежності', null, 'Наприкінці — схема того, як усе в статті пов’язано, з маршрутами.']]]]]];
  // зв’язки: [звідки, куди]
  const EDGES = [['gpt', 'tripo'], ['tripo', 'blend'], ['gpt', 'plan'], ['gem', 'plan'], ['suno', 'plan'], ['blend', 'code'], ['slop', 'chk'], ['src', 'res'],
    ['own-ok', 'own-cmd'], ['own-cmd', 'plan'], ['plan', 'code'], ['code', 'sub'], ['res', 'chk'],
    ['code', 'p-hero'], ['code', 'p-scene'], ['code', 'p-3d'], ['sub', 'p-reel'], ['res', 'p-scene'], ['chk', 'p-prov'], ['plan', 'p-map']];
  const CTRL_T = 'Скіл: правила для всіх';
  const CTRL = ['SKILL.md · правила', 'Скіл схем DWH', 'Журнал уроків', 'Перевірка', 'Пам’ять власника'];
  // сценарії: кроки [звідки, куди, що передається, пояснення]
  const FLOWS = {
    'Банер: промпт → сторінка': [
      ['own-cmd', 'plan', '«11»', 'Власник дає «11»: план затверджено, можна робити.'],
      ['plan', 'gpt', 'промпт', 'Claude пише промпт зі скіла: тиха ліва частина під заголовок, без тексту, логотипів і облич.'],
      ['gpt', 'plan', 'картинка', 'ChatGPT повертає картинку. Claude спершу дивиться її сам, а вже потім показує власнику.'],
      ['plan', 'code', 'файл', 'Затверджена картинка стискається й лягає в assets сторінки.'],
      ['code', 'p-hero', 'банер', 'На сторінці — банер під заголовком.']],
    '3D: чотири види → модель': [
      ['own-cmd', 'plan', '«11»', 'Власник погоджує ідею моделі й дає «11» на генерацію.'],
      ['plan', 'gpt', '4 види', 'ChatGPT малює предмет спереду, зліва, справа й ззаду — на однаковому тлі.'],
      ['gpt', 'tripo', '4 картинки', 'Tripo збирає з чотирьох видів 3D-модель із текстурою.'],
      ['tripo', 'blend', 'GLB', 'Blender чистить модель, стискає текстури й геометрію (Draco).'],
      ['blend', 'code', 'GLB · Draco', 'Claude ставить модель на сторінку: світло, обертання, мітки.'],
      ['code', 'p-3d', 'модель', 'На сторінці — модель, яку можна крутити.']],
    'Факт: джерело → помітка': [
      ['src', 'res', 'число · дата', 'Кожне число береться з першоджерела: значення, дата, посилання.'],
      ['res', 'chk', 'знімок даних', 'Дані знімаються файлом із датою, перевірка звіряє їх із текстом.'],
      ['chk', 'slop', 'текст', 'ai slop helper розмічає блоки: що перевірено, що гіпотеза, що слово власника.'],
      ['slop', 'chk', 'помітки', 'Сумнівне повертається на перевірку або на доробку.'],
      ['chk', 'p-prov', '«Перевірено»', 'Читач бачить над кожним блоком, звідки він.']],
    'Ролик: задача → субагент': [
      ['own-cmd', 'plan', '«22 · 11»', '«22» — спершу сценарій файлом, «11» — робимо.'],
      ['plan', 'suno', 'настрій', 'Для музики — опис настрою в Suno, або синтез у браузері.'],
      ['plan', 'code', 'сценарій', 'Сценарій стає таблицею сцен і тактів.'],
      ['code', 'sub', 'TASK.md', 'Великий ролик Claude віддає субагенту за файлом-завданням.'],
      ['sub', 'p-reel', 'ролик', 'Claude сам перевіряє кадри, мерехтіння й консоль — і лише тоді показує.']] };

  // ── модель: вузли з lane, group, row; позиції — лише з них ──
  const N = {}, ORDER = [];
  LANES.forEach(([, groups], li) => { groups.forEach(([gn, nodes], gi) => { nodes.forEach(([id, t, tag, sub, d]) => { N[id] = { id, t, tag, sub, d, lane: li, group: gi }; ORDER.push(id); }); }); });
  let open = null, focus = null, pin = null, flow = null, step = -1, timer = 0, raf = 0;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function layout() {
    const P = {}; let maxY = 0;
    LANES.forEach(([, groups], li) => {
      let y = TOP; const x = X0 + li * COL;
      groups.forEach(([gn, nodes]) => {
        if (gn) y += 26;
        nodes.forEach(([id]) => { const n = N[id], h = id === open ? CH + n.sub.length * (SUBH + 5) + 6 : CH; P[id] = { x: x + (gn ? 12 : 0), y, w: CW - (gn ? 24 : 0), h }; y += h + GAP; });
        if (gn) y += 14;
      });
      maxY = Math.max(maxY, y);
    });
    return { P, maxY };
  }
  // лінія від блоку a до блоку b (з напрямком): між смугами — S-крива між боковими краями; у смузі — вертикаль
  function wire(a, b) {
    if (a.x + a.w < b.x - 4) { const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2, d = (x2 - x1) / 2; return `M${x1},${y1}C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`; }
    if (b.x + b.w < a.x - 4) { const x1 = a.x, y1 = a.y + a.h / 2, x2 = b.x + b.w, y2 = b.y + b.h / 2, d = (x1 - x2) / 2; return `M${x1},${y1}C${x1 - d},${y1} ${x2 + d},${y2} ${x2},${y2}`; }
    const cx = a.x + a.w / 2, cx2 = b.x + b.w / 2; return a.y < b.y ? `M${cx},${a.y + a.h}L${cx2},${b.y}` : `M${cx},${a.y}L${cx2},${b.y + b.h}`;
  }
  const ends = (a, b) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', wire(a, b)); const L = p.getTotalLength(); return [p.getPointAtLength(0), p.getPointAtLength(L)]; };

  const box = document.createElement('div'); box.className = 'skr';
  box.innerHTML = `<div class="skr__flows">${Object.keys(FLOWS).map((k) => `<button type="button" data-f="${k}"><span class="ico">▶</span>${k}</button>`).join('')}</div>
    <div class="skr__fit"><div class="skr__stage"><svg class="skr__wires"></svg><div class="skr__nodes"></div>
      <div class="skr__hint"><span class="skr__key">як читати</span><span class="skr__text"></span><span class="skr__nav"><button type="button" data-s="-1" aria-label="Попередній крок">←</button><button type="button" data-s="1" aria-label="Наступний крок">→</button></span></div></div></div>`;
  host.appendChild(box);
  const fit = box.querySelector('.skr__fit'), stage = box.querySelector('.skr__stage'), svg = box.querySelector('svg'), nodesEl = box.querySelector('.skr__nodes');
  const hKey = box.querySelector('.skr__key'), hText = box.querySelector('.skr__text');
  const HINT = 'Наведіть на будь-який блок — побачите його зв’язки й пояснення. Клік закріплює; «+» розгортає блок у складові. Сценарії згори проходять шлях від команди до сторінки крок за кроком.';
  const W = X0 * 2 + (LANES.length - 1) * COL + CW;
  let H = 600, P = {};

  function draw() {
    const L = layout(); P = L.P; const stripY = L.maxY + 34; H = stripY + 76 + 96;
    stage.style.width = `${W}px`; stage.style.height = `${H}px`; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    const chain = focus && !flow ? new Set([focus, ...EDGES.filter((e) => e.includes(focus)).flat()]) : null;
    let s = '';
    LANES.forEach(([ln, groups], li) => {
      const ids = groups.flatMap((g) => g[1].map((n) => n[0])), x = X0 + li * COL - 10, y1 = TOP - 34, y2 = Math.max(...ids.map((id) => P[id].y + P[id].h)) + 12;
      s += `<rect class="band" x="${x}" y="${y1}" width="${CW + 20}" height="${y2 - y1}" rx="12"/><text class="band-label" x="${x + 12}" y="${y1 + 18}">${ln}</text>`;
      groups.forEach(([gn, nodes]) => { if (!gn) return; const g = nodes.map((n) => P[n[0]]), gy = Math.min(...g.map((p) => p.y)) - 24, gb = Math.max(...g.map((p) => p.y + p.h)) + 8;
        s += `<rect class="grp" x="${x + 8}" y="${gy}" width="${CW + 4}" height="${gb - gy}" rx="9"/><text class="grp-label" x="${x + 18}" y="${gy + 15}">${gn}</text>`; });
    });
    LANES.forEach((_, li) => { const x = X0 + li * COL + CW / 2; s += `<path class="wire--ctrl" d="M${x},${L.maxY + 4}V${stripY}"/>`; });
    EDGES.forEach(([a, b]) => { const on = chain && (a === focus || b === focus); const [p0, p1] = ends(P[a], P[b]);
      s += `<path class="wire${on ? ' is-chain' : ''}" d="${wire(P[a], P[b])}"/><circle class="dot${on ? ' dot--hot' : ''}" cx="${p0.x}" cy="${p0.y}" r="2.6"/><circle class="dot${on ? ' dot--hot' : ''}" cx="${p1.x}" cy="${p1.y}" r="2.6"/>`; });
    s += `<rect class="band" x="${X0 - 10}" y="${stripY}" width="${W - 2 * X0 + 20}" height="76" rx="12"/><text class="band-label" x="${X0 + 2}" y="${stripY + 18}">${CTRL_T}</text>`;
    s += '<g class="skr__flow"></g>';
    svg.innerHTML = s;
    const cw = (W - 2 * X0 - 4 * 12) / 5;
    nodesEl.innerHTML = ORDER.map((id) => { const n = N[id], p = P[id], dim = chain && !chain.has(id);
      return `<div class="node${n.sub ? ' node--exp' : ''}${id === open ? ' is-exp' : ''}${id === focus ? ' is-open' : ''}${dim ? ' is-dim' : ''}" data-id="${id}" tabindex="0" style="left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px">
        <b>${n.t}</b><i>${n.tag}</i>${id === open ? `<div class="subs">${n.sub.map((u) => `<span>${u}</span>`).join('')}</div>` : ''}</div>`; }).join('')
      + CTRL.map((t, i) => `<div class="node node--soft node--ctrl" style="left:${X0 + i * (cw + 12)}px;top:${stripY + 30}px;width:${cw}px"><b>${t}</b></div>`).join('');
    const hb = box.querySelector('.skr__hint'); hb.style.top = `${stripY + 76 + 18}px`;
    if (flow && step >= 0) paintFlow(false); else if (!flow) { hKey.textContent = focus ? N[focus].t : 'як читати'; hText.textContent = focus ? N[focus].d : HINT; }
    box.classList.toggle('is-flow', !!flow);
    size();
  }
  // масштаб полотна під ширину колонки (як stage-fit у DWH)
  function size() { const k = Math.min(1, fit.clientWidth / W); stage.style.transform = `scale(${k})`; fit.style.height = `${H * k}px`; }
  new ResizeObserver(size).observe(fit);

  // ── сценарій покроково ──
  function paintFlow(animate) {
    const steps = FLOWS[flow], g = svg.querySelector('.skr__flow'); g.innerHTML = '';
    const lit = new Set();
    steps.slice(0, step + 1).forEach(([a, b, what], i) => {
      lit.add(a); lit.add(b);
      const cur = i === step, p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', wire(P[a], P[b])); p.setAttribute('class', `fwire${cur ? ' is-cur' : ''}`); g.appendChild(p);
      if (!cur) return;
      const Lp = p.getTotalLength(), mid = p.getPointAtLength(Lp / 2), end = p.getPointAtLength(Lp), pre = p.getPointAtLength(Math.max(0, Lp - 9));
      // наконечник стрілки — свій трикутник (marker-end масштабується зі штрихом і зникає)
      const ang = Math.atan2(end.y - pre.y, end.x - pre.x), hx = (r, k) => end.x - Math.cos(ang + r) * k, hy = (r, k) => end.y - Math.sin(ang + r) * k;
      const head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); head.setAttribute('class', 'fhead');
      head.setAttribute('points', `${end.x},${end.y} ${hx(0.45, 9)},${hy(0.45, 9)} ${hx(-0.45, 9)},${hy(-0.45, 9)}`); g.appendChild(head);
      const tw = what.length * 6.4 + 16, vert = Math.abs(end.x - p.getPointAtLength(0).x) < 6; if (vert) mid.x += tw / 2 + 10;
      const lab = document.createElementNS('http://www.w3.org/2000/svg', 'g'); lab.setAttribute('class', 'flab');
      lab.innerHTML = `<rect x="${mid.x - tw / 2}" y="${mid.y - 10}" width="${tw}" height="20" rx="10"/><text x="${mid.x}" y="${mid.y + 4}">${what}</text>`; g.appendChild(lab);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('class', 'fdot'); dot.setAttribute('r', 4.5); g.appendChild(dot);
      if (animate && !REDUCE) {
        p.style.strokeDasharray = Lp; p.style.strokeDashoffset = Lp; head.style.opacity = 0; lab.style.opacity = 0;
        const t0 = performance.now(); cancelAnimationFrame(raf);
        const run = (now) => { const u = Math.min(1, (now - t0) / 520), e = u * (2 - u), q = p.getPointAtLength(Lp * e);
          p.style.strokeDashoffset = Lp * (1 - e); dot.setAttribute('cx', q.x); dot.setAttribute('cy', q.y);
          if (u > 0.55) lab.style.opacity = 1;
          if (u < 1) raf = requestAnimationFrame(run); else { head.style.opacity = 1; nodesEl.querySelector(`[data-id="${b}"]`)?.classList.add('is-hot'); } };
        raf = requestAnimationFrame(run);
      } else { dot.setAttribute('cx', end.x); dot.setAttribute('cy', end.y); }
    });
    nodesEl.querySelectorAll('.node[data-id]').forEach((el) => { const id = el.dataset.id, cur = steps[step];
      el.classList.toggle('is-hot', lit.has(id) && (!animate || id !== cur[1])); el.classList.toggle('is-cur', id === cur[0] || id === cur[1]); });
    hKey.textContent = `${flow.split(':')[0]} · ${step + 1}/${steps.length}`; hText.textContent = steps[step][3];
  }
  function go(i, auto) {
    const steps = FLOWS[flow]; step = Math.max(0, Math.min(steps.length - 1, i)); paintFlow(true); if (window.SK_SND) SK_SND.fx('click');
    clearTimeout(timer); if (auto && step < steps.length - 1) timer = setTimeout(() => go(step + 1, true), 1900);
    else if (auto) box.querySelector(`[data-f="${flow}"]`).classList.add('done');
  }
  function stopFlow() { clearTimeout(timer); cancelAnimationFrame(raf); flow = null; step = -1; box.querySelectorAll('[data-f]').forEach((b) => b.classList.remove('on', 'done')); draw(); }

  nodesEl.addEventListener('pointerover', (e) => { const g = e.target.closest('.node[data-id]'); if (g && !flow && focus !== g.dataset.id) { focus = g.dataset.id; draw(); } });
  nodesEl.addEventListener('pointerleave', () => { if (!flow && focus !== pin) { focus = pin; draw(); } });
  nodesEl.addEventListener('focusin', (e) => { const g = e.target.closest('.node[data-id]'); if (g && !flow && focus !== g.dataset.id) { focus = g.dataset.id; draw(); } });
  nodesEl.addEventListener('click', (e) => { const g = e.target.closest('.node[data-id]'); if (!g) return; const id = g.dataset.id;
    if (flow) stopFlow();
    if (N[id].sub) open = open === id ? null : id;
    pin = pin === id && !N[id].sub ? null : id; focus = pin; draw(); if (window.SK_SND) SK_SND.fx('click'); });
  box.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]'), s = e.target.closest('[data-s]');
    if (f) { const k = f.dataset.f; if (flow === k) { stopFlow(); return; } stopFlow(); flow = k; focus = pin = null; open = null; f.classList.add('on'); draw(); go(0, true); }
    if (s && flow) go(step + +s.dataset.s, false);
  });
  document.addEventListener('keydown', (e) => { if (!flow) return; if (e.key === 'ArrowRight') go(step + 1, false); else if (e.key === 'ArrowLeft') go(step - 1, false); else if (e.key === 'Escape') stopFlow(); });
  // для міток 3D-верстата: підсвітити роль і прокрутити до схеми
  window.SK_ROLES = { focus(id) { if (!N[id]) return; if (flow) stopFlow(); pin = focus = id; draw(); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } };
  draw();
})();
