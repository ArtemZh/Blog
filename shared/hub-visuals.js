// Мініатюри плиток головної — піктограми під реальний розмір плитки (~90×65 px):
// полотно 140×100, 3–6 крупних елементів, одна ідея на плитку, товсті лінії, без дрібного тексту.
// Кольори — токени через класи (стилі в index.html, блок .hv). Анімації a-* грають при наведенні.
(function () {
  const S = (body) => '<svg class="hv" viewBox="0 0 140 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  const A = (a, d) => (a ? ' ' + a : '') + '"' + (d != null ? ` style="animation-delay:${d}s"` : '');
  const r = (x, y, w, h, c, rx, a, d) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx == null ? 4 : rx}" class="${c}${A(a, d)}/>`;
  const t = (x, y, s, c, a, d) => `<text x="${x}" y="${y}" class="t ${c || ''}${A(a, d)}>${s}</text>`;
  const ci = (x, y, rr, c, a, d) => `<circle cx="${x}" cy="${y}" r="${rr}" class="${c}${A(a, d)}/>`;
  const p = (dd, c, a, d) => `<path d="${dd}" class="${c || 'k'}${A(a, d)} pathLength="1"/>`;
  const arrow = (x, y, dir, c) => p(dir === 'r' ? `M${x - 6} ${y - 5} L${x} ${y} L${x - 6} ${y + 5}` : `M${x + 6} ${y - 5} L${x} ${y} L${x + 6} ${y + 5}`, c);
  const range = (n) => Array.from({ length: n }, (_, i) => i);

  const V = {
    // CV: сходинки кар'єри, остання — поточна роль
    '18-cv.html': S(
      range(4).map(i => r(14 + i * 29, 74 - i * 16, 26, 14 + i * 16, i === 3 ? 'acc' : 'f-s', 3, 'a-grow', i * .08)).join('') +
      ci(117, 18, 6, 'acc', 'a-pulse')),

    // Delivery Framework: пресейл → discovery → петля спринтів
    '13-delivery-framework.html': S(
      r(8, 38, 26, 24, 'o', 5) + p('M36 50 L48 50', 'k-ink', 'a-draw') + arrow(50, 50, 'r', 'k-ink') +
      r(52, 38, 26, 24, 'o', 5) + p('M80 50 L90 50', 'k-ink', 'a-draw', .15) + arrow(92, 50, 'r', 'k-ink') +
      '<circle cx="112" cy="50" r="18" class="k acc-s a-flow" pathLength="1"/>' +
      p('M126 38 L131 47 L121 48', 'acc-s') + ci(112, 50, 5, 'acc', 'a-pulse') +
      r(8, 76, 124, 8, 'f-s', 4) + r(8, 76, 70, 8, 'acc', 4, 'a-grow', .2)),

    // Аутсорс і продукт: спільний старт, дві доріжки розходяться
    '15-outsourcing-product.html': S(
      p('M10 50 L52 50', 'k-ink', 'a-draw') +
      p('M52 50 C76 50 80 22 124 22', 'k-teal', 'a-draw', .15) + p('M52 50 C76 50 80 78 124 78', 'k-clay', 'a-draw', .15) +
      ci(52, 50, 6, 'acc', 'a-pulse') + ci(124, 22, 8, 'f-teal', 'a-pop', .45) + ci(124, 78, 8, 'f-clay', 'a-pop', .5)),

    // Карта PMBOK 8: домени рядами, процеси — плашки
    '14-pmbok8-map.html': S(
      ['gov', 'scope', 'sched', 'fin', 'stake', 'res', 'risk'].map((d, i) =>
        r(10, 10 + i * 12, 8, 9, 'd-' + d, 2) + range(3).map(j => ((i + j) % 3 ? r(24 + j * 36, 10 + i * 12, 30, 9, (i === 3 && j === 1) ? 'acc' : 'dd-' + d, 2, 'a-pop', (i + j) * .03) : '')).join('')).join('')),

    // Focus View: процес у центрі, входи зліва, виходи справа
    '14d-pmbok8-focus.html': S(
      [22, 50, 78].map(y => r(6, y - 7, 22, 14, 'o', 3) + p(`M28 ${y} C44 ${y} 42 50 52 50`, 'k-teal', 'a-flow')).join('') +
      [32, 68].map(y => r(112, y - 7, 22, 14, 'o', 3) + p(`M88 50 C98 50 96 ${y} 112 ${y}`, 'k-clay', 'a-flow')).join('') +
      r(52, 34, 36, 32, 'acc-box', 7, 'a-pulse') + r(60, 44, 20, 5, 'acc', 2) + r(60, 53, 14, 4, 'f-s', 2)),

    // Портфель: маржа акаунтів барами і лінія виручки
    '16a-portfolio-accounts.html': S(
      [34, 50, 28, 58, 40, 64].map((h, i) => r(14 + i * 20, 90 - h, 13, h, i === 5 ? 'acc' : 'f-blue', 3, 'a-grow', i * .06)).join('') +
      p('M12 44 L40 38 L62 42 L86 26 L112 20 L130 12', 'k-ink', 'a-draw') + ci(130, 12, 4, 'acc', 'a-pop', .5)),

    // Jira: таймлайн робіт — зроблено / в роботі / попереду, «сьогодні»
    '16-jira-dashboard.html': S(
      [[10, 14, 44, 26, 30], [22, 36, 30, 34, 36], [14, 58, 24, 30, 58], [34, 80, 14, 22, 58]].map(([x, y, d, ip, td], i) =>
        r(x, y, d, 11, 'f-green', 3, 'a-slide', i * .06) + r(x + d, y, ip, 11, 'f-blue', 3, 'a-slide', i * .06 + .08) + r(x + d + ip, y, td, 11, 'f-rule', 3)).join('') +
      p('M76 6 L76 96', 'acc-l', 'a-blink')),

    // Дані: джерела → сховище → споживачі
    '24-dwh.html': S(
      [20, 50, 80].map(y => ci(14, y, 6, 'f-s') + p(`M20 ${y} C36 ${y} 36 50 50 50`, 'k', 'a-flow')).join('') +
      '<ellipse cx="70" cy="30" rx="20" ry="7" class="acc-box"/>' + r(50, 30, 40, 40, 'acc-box', 0) +
      '<ellipse cx="70" cy="70" rx="20" ry="7" class="acc-box"/>' + '<ellipse cx="70" cy="30" rx="20" ry="7" class="acc-box"/>' +
      r(58, 44, 24, 5, 'acc', 2, 'a-grow', .15) + r(58, 54, 18, 5, 'acc', 2, 'a-grow', .25) +
      [30, 70].map((y, i) => p(`M90 50 C104 50 104 ${y} 114 ${y}`, 'k', 'a-flow') + r(114, y - 9, 20, 18, 'f-teal-s', 4, 'a-pop', .3 + i * .1)).join('')),

    // OSS і BSS: два контури й обмін між ними
    '19-oss-bss.html': S(
      r(8, 20, 46, 60, 'c-blue', 10) + r(86, 20, 46, 60, 'c-purple', 10) +
      t(17, 55, 'OSS', 'big') + t(95, 55, 'BSS', 'big') +
      p('M56 40 L82 40', 'acc-s', 'a-flow') + arrow(84, 40, 'r', 'acc-s') +
      p('M84 62 L58 62', 'k-ink', 'a-flow') + arrow(56, 62, 'l', 'k-ink')),

    // Агентний AI: сходинки автономії, одна підсвічена
    '20-agentic-ai.html': S(
      range(5).map(i => r(10 + i * 25, 82 - (i + 1) * 14, 21, (i + 1) * 14, i === 3 ? 'acc' : 'f-s', 3, 'a-grow', i * .07)).join('') +
      ci(95.5, 14, 6, 'acc', 'a-pulse')),

    // Чат-бот: бульбашки діалогу і бот, що відповідає
    '21-support-chat.html': S(
      r(8, 14, 60, 18, 'f-s', 9) + p('M16 32 L14 40 L24 32', 'f-s') +
      r(36, 44, 60, 18, 'f-blue-s', 9, 'a-pop', .15) +
      r(8, 72, 48, 18, 'f-s', 9, 'a-pop', .3) +
      ci(118, 50, 15, 'acc-box', 'a-pulse') + ci(113, 47, 2.5, 'acc') + ci(123, 47, 2.5, 'acc') + p('M112 55 Q118 59 124 55', 'acc-s')),

    // Голосовий бот: хвиля голосу → бот
    '22-support-voice.html': S(
      [14, 30, 46, 24, 56, 34, 20, 42, 28].map((h, i) => r(8 + i * 9, 50 - h / 2, 5, h, 'f-blue', 2.5, 'a-wave', i * .06)).join('') +
      p('M92 50 L104 50', 'k-ink', 'a-flow') + ci(118, 50, 14, 'acc', 'a-pulse')),

    // Реліз: вікна на шкалі, заборонений період, точка Go / No-Go
    '23-release.html': S(
      p('M6 60 L134 60', 'k-ink') +
      [14, 36].map((x, i) => r(x, 46, 14, 28, 'f-teal-s', 3, 'a-pop', i * .08)).join('') +
      r(58, 38, 34, 44, 'hatch', 4) +
      r(106, 46, 14, 28, 'f-teal-s', 3, 'a-pop', .2) +
      '<polygon points="43,14 53,24 43,34 33,24" class="acc a-spin"/>'),

    // AI slop helper: текст із рейками походження, один абзац — на перевірці
    '17-ai.html': S(
      r(10, 8, 120, 84, 'o', 6) +
      [[18, 'f-blue'], [44, 'acc'], [70, 'f-teal']].map(([y, c], k) =>
        r(18, y, 5, 18, c, 2, 'a-grow', k * .1) + r(28, y + 2, 92, 5, 'f-rule', 2) + r(28, y + 11, 64, 5, 'f-rule', 2)).join('') +
      r(14, 40, 112, 26, 'acc-box', 5, 'a-blink')),

    // PMBOK 7 → 8: дві сторінки поруч і стрілка «як стало»
    '26-competencies.html': S(
      r(8, 16, 50, 68, 'o', 6) + t(22, 60, '7', 'huge') +
      p('M62 50 L76 50', 'acc-s', 'a-draw') + arrow(80, 50, 'r', 'acc-s') +
      r(82, 16, 50, 68, 'acc-box', 6, 'a-pop', .2) + t(96, 60, '8', 'huge acc-t')),

    // Лекція з ризиків: матриця 3×3 теплових зон, точка ризику переїжджає в зелену
    '27-risk-lecture.html': S(
      range(3).map(i => range(3).map(j => {
        const sc = (3 - i) + j;
        return r(30 + j * 28, 8 + i * 28, 25, 25, sc >= 4 ? 'f-clay' : sc >= 3 ? 'f-gold' : 'f-green-s', 4);
      }).join('')).join('') +
      ci(98.5, 20.5, 7, 'acc-dot', 'a-move')),

    // Be like Sheldon: маршрут поїзда між станціями
    'https://artemzh.github.io/Be_like_Sheldon/': S(
      p('M10 50 C18 18 48 12 70 20 C92 28 110 12 126 26 C138 38 132 76 114 84 C90 94 52 90 28 84 C14 80 8 66 10 50 Z', 'k') +
      p('M26 64 L50 42 L76 56 L100 34 L120 50', 'acc-s', 'a-draw') +
      [[26, 64], [50, 42], [76, 56], [100, 34]].map(([x, y], i) => ci(x, y, 4, 'o', 'a-pop', i * .1)).join('') +
      ci(120, 50, 6, 'acc', 'a-pulse')),
  };

  document.querySelectorAll('[data-hv]').forEach(el => {
    const svg = V[el.dataset.hv] || V[el.getAttribute('href')];
    if (svg) el.insertAdjacentHTML('afterbegin', '<div class="hv-wrap">' + svg + '</div>');
  });
})();
