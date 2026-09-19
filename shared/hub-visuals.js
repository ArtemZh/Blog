// Мініатюри плиток головної: SVG вставляються в a.card за href.
// Кольори — лише токени через класи (стилі в index.html, блок .hv).
(function () {
  // Короткі хелпери для однакової мови оформлення
  const S = (body) => '<svg class="hv" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  const r = (x, y, w, h, c, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx == null ? 3 : rx}" class="${c}"/>`;
  const t = (x, y, s, c) => `<text x="${x}" y="${y}" class="t ${c || ''}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c || 'k'}"/>`;
  const ci = (x, y, rr, c) => `<circle cx="${x}" cy="${y}" r="${rr}" class="${c}"/>`;
  const p = (d, c) => `<path d="${d}" class="${c || 'k'}"/>`;

  const V = {
    // CV: хронологія кар'єри — відрізки ролей на шкалі років, поточна роль — акцент
    '18-cv.html': S(
      ln(20, 70, 280, 70) +
      r(20, 52, 70, 10, 'f-blue') + r(92, 40, 50, 10, 'f-teal') + r(144, 52, 10, 10, 'f-purple') +
      r(156, 40, 30, 10, 'f-clay') + r(188, 52, 20, 10, 'f-green') + r(210, 40, 70, 10, 'acc') +
      t(20, 88, '2006') + t(92, 88, '2013') + t(156, 88, '2019') + t(250, 88, 'now') +
      ci(280, 70, 3, 'acc')),

    // Delivery Framework: пресейл → discovery → петля ітерацій, під нею шар артефактів
    '13-delivery-framework.html': S(
      r(14, 30, 56, 24, 'o') + t(22, 46, 'Presale') + ln(70, 42, 86, 42) +
      r(86, 30, 64, 24, 'o') + t(92, 46, 'Discovery') + ln(150, 42, 170, 42) +
      '<ellipse cx="226" cy="42" rx="54" ry="20" class="k acc-s"/>' +
      p('M270 30 l10 12 l-12 2', 'acc-s') + t(206, 46, 'Sprint', 'acc-t') +
      r(14, 78, 266, 16, 'f-s', 3) +
      [30, 70, 110, 150, 190, 230].map(x => r(x, 82, 26, 8, 'f-rule', 2)).join('')),

    // Портфель: ряд акаунтів з маржою (міні-бари) + лінія виручки з маркерами подій
    '16a-portfolio-accounts.html': S(
      [28, 40, 22, 34, 46, 18, 30, 38, 26, 42, 20, 36].map((h, i) =>
        r(18 + i * 22, 112 - h, 14, h, i === 4 ? 'acc' : 'f-blue', 2)).join('') +
      p('M18 50 L60 44 L100 46 L140 30 L180 34 L220 22 L282 16', 'k-ink') +
      ci(140, 30, 4, 'acc') + ci(220, 22, 4, 'f-teal') + ci(60, 44, 4, 'f-teal')),

    // Jira: таймлайн проєктів — done / in progress / To Do, червона лінія «сьогодні»
    '16-jira-dashboard.html': S(
      [[20, 18, 90, 40, 60], [40, 40, 70, 60, 50], [30, 62, 40, 50, 100], [60, 84, 30, 30, 120]].map(([x, y, d, ip, td]) =>
        r(x, y, d, 12, 'f-green', 2) + r(x + d, y, ip, 12, 'f-blue', 2) + r(x + d + ip, y, td, 12, 'f-rule', 2)).join('') +
      ln(150, 8, 150, 108, 'acc-l') + t(154, 112, 'today', 'acc-t')),

    // Аутсорс і продукт: одна вісь етапів, дві доріжки розходяться, три ворота-капсули
    '15-outsourcing-product.html': S(
      ln(16, 60, 110, 60, 'k-ink') +
      p('M110 60 C150 60 160 28 284 28', 'k-teal') + p('M110 60 C150 60 160 92 284 92', 'k-clay') +
      [60, 180, 250].map((x, i) => r(x - 8, 50 + (i ? (i === 1 ? -26 : -32) : 0), 16, 20, i === 1 ? 'acc' : 'o', 8)).join('') +
      r(242, 82, 16, 20, 'o', 8) + r(172, 76, 16, 20, 'o', 8) +
      t(226, 16, 'outsource') + t(232, 114, 'product')),

    // PMBOK Process Map: сітка домени × фази з плашками процесів
    '14-pmbok8-map.html': S(
      ['gov', 'scope', 'sched', 'fin', 'stake', 'res', 'risk'].map((d, i) =>
        r(14, 10 + i * 14.5, 6, 11, 'd-' + d, 1) +
        [0, 1, 2, 3, 4].map(j => ((i * 3 + j * 2) % 5 < 3 ?
          r(30 + j * 52, 10 + i * 14.5, 44, 11, (i === 2 && j === 2) ? 'acc' : 'dd-' + d, 2) : '')).join('')).join('')),

    // PMBOK Focus View: одна виділена картка, вхідні (teal) і вихідні (clay) зв'язки
    '14d-pmbok8-focus.html': S(
      [24, 60, 96].map(y => r(14, y - 9, 60, 18, 'o') + p(`M74 ${y} C110 ${y} 110 60 120 60`, 'k-teal')).join('') +
      [24, 60, 96].map(y => r(226, y - 9, 60, 18, 'o') + p(`M180 60 C190 60 190 ${y} 226 ${y}`, 'k-clay')).join('') +
      r(120, 40, 60, 40, 'acc-box', 6)),

    // Дані: джерела → шар DWH → вітрини/споживачі
    '24-dwh.html': S(
      [22, 50, 78, 98].map(y => r(14, y - 8, 44, 14, 'f-s', 3) + ln(58, y - 1, 118, 60)).join('') +
      r(118, 22, 64, 76, 'acc-box', 6) + t(136, 64, 'DWH', 'acc-t') +
      [34, 60, 86].map(y => ln(182, 60, 230, y) + r(230, y - 9, 56, 18, 'f-teal-s', 3)).join('')),

    // OSS / BSS: два контури з обміном між ними
    '19-oss-bss.html': S(
      r(16, 18, 110, 84, 'c-blue', 10) + t(52, 64, 'OSS') +
      r(174, 18, 110, 84, 'c-purple', 10) + t(212, 64, 'BSS') +
      p('M126 46 L174 46 M168 41 L174 46 L168 51', 'acc-s') +
      p('M174 74 L126 74 M132 69 L126 74 L132 79', 'k-ink')),

    // Агентний AI: сходинки автономії L0–L5, L4 виділено
    '20-agentic-ai.html': S(
      [0, 1, 2, 3, 4, 5].map(i => r(18 + i * 45, 100 - (i + 1) * 14, 40, (i + 1) * 14, i === 4 ? 'acc' : 'f-s', 3)).join('') +
      [0, 1, 2, 3, 4, 5].map(i => t(30 + i * 45, 114, 'L' + i, i === 4 ? 'acc-t' : '')).join('')),

    // Чат-бот: бульбашки чату + маршрут до агентів
    '21-support-chat.html': S(
      r(14, 16, 90, 20, 'f-s', 10) + r(44, 44, 90, 20, 'f-blue-s', 10) + r(14, 72, 70, 20, 'f-s', 10) +
      p('M134 54 L180 54', 'k-ink') + ci(186, 54, 6, 'acc') +
      p('M192 54 L226 26 M192 54 L226 54 M192 54 L226 82', 'k') +
      [26, 54, 82].map((y, i) => ci(242, y, 10, i === 1 ? 'f-teal' : 'o')).join('') + t(258, 58, 'agent')),

    // Голосовий бот: хвиля голосу → текст → агент
    '22-support-voice.html': S(
      Array.from({ length: 14 }, (_, i) => {
        const h = [8, 18, 30, 16, 40, 24, 12, 34, 20, 44, 26, 14, 22, 10][i];
        return r(14 + i * 7, 60 - h / 2, 4, h, 'f-blue', 2);
      }).join('') +
      p('M118 60 L140 60', 'k-ink') +
      [0, 1, 2].map(i => r(146, 44 + i * 12, [60, 48, 54][i], 6, 'f-rule', 2)).join('') +
      p('M214 60 L236 60', 'k-ink') + ci(256, 60, 14, 'acc') + t(238, 94, 'agent')),

    // Реліз: вікна релізів на шкалі, blackout, Go/No-Go
    '23-release.html': S(
      ln(14, 70, 286, 70, 'k-ink') +
      [30, 90, 214, 268].map(x => r(x, 56, 18, 28, 'f-teal-s', 3)).join('') +
      r(130, 40, 60, 60, 'hatch', 3) + t(134, 110, 'blackout') +
      '<polygon points="99,26 107,34 99,42 91,34" class="acc"/>' + t(76, 20, 'Go/No-Go', 'acc-t')),

    // AI slop helper: абзаци з кольоровими рейками походження
    '17-ai.html': S(
      [[16, 'f-blue', 3], [48, 'acc', 2], [80, 'f-teal', 3]].map(([y, c, n]) =>
        r(16, y, 4, 8 * n + (n - 1) * 3, c, 2) +
        Array.from({ length: n }, (_, k) => r(28, y + k * 11, k === n - 1 ? 170 : 250, 7, 'f-rule', 2)).join('')).join('')),

    // Be like Sheldon: відкриті дані — мапа з лінією поїзда між станціями, час у дорозі
    'https://artemzh.github.io/Be_like_Sheldon/': S(
      p('M18 60 C40 22 88 16 128 26 C170 36 200 18 244 28 C276 36 288 70 270 94 C240 108 170 104 120 100 C70 96 30 98 18 60 Z', 'k') +
      p('M46 72 L96 52 L150 66 L196 44 L248 62', 'acc-s') +
      [[46, 72], [96, 52], [150, 66], [196, 44]].map(([x, y]) => ci(x, y, 4, 'o')).join('') +
      ci(248, 62, 5, 'acc') + t(206, 86, '≤ 24 h', 'acc-t')),
  };

  document.querySelectorAll('a.card').forEach(a => {
    const svg = V[a.getAttribute('href')];
    if (svg) a.insertAdjacentHTML('afterbegin', '<div class="hv-wrap">' + svg + '</div>');
  });
  // Колаж першого екрана: ті самі мініатюри, ключ — data-hv
  document.querySelectorAll('[data-hv]').forEach(el => {
    const svg = V[el.dataset.hv] || V[el.getAttribute('href')];
    if (svg) el.insertAdjacentHTML('afterbegin', '<div class="hv-wrap">' + svg + '</div>');
  });
})();
