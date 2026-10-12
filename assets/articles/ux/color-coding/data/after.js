/* Розділ 10 «Що стало після»: дві схеми на тому самому рушії й структура
   таблиць. Тексти — у copy.js.

   Перша схема — та сама сцена, що в розділі 5 (роль → токен → місця), у стані
   після переробки. Колонки ті самі: роль · токен · місця за призначенням ·
   місця, що раніше брали чужий колір, · записаний виняток. Смуга «Ролі немає»
   зникла: її місця або отримали роль (нова смуга «Вибране»), або втратили
   колір зовсім. Пунктиром лишилось лише те, що справді лишилось: К6, К7,
   виняток для навчальних підсвіток і збіг значень у блакитному оформленні.
   Порядок смуг: «Величина» стоїть одразу під «Станом» — дріт К7 іде між ними
   без обходу; токен зон — верхній у своїй колонці.
   Порядок дротів має значення: рушій роздає доріжки в жолобі за чергою. */
window.AFTER = {
  width: 1560,
  cols: 5,
  key: ['at-signal'],
  bands: [
    { id: 'a-act', groups: [
      { id: 'role', nodes: ['ar-act'] },
      { id: 'token', nodes: ['at-signal'] },
      { id: 'own', nodes: ['ap-btn', 'ap-focus', 'ap-tab'] },
      { id: 'a-was', col: 3, nodes: [] },
      { id: 'a-exc', col: 4, nodes: ['ap-learn'] },
    ] },
    { id: 'a-sel', groups: [
      { id: 'e0', label: false, nodes: ['ar-sel'] },
      { id: 'e1', label: false, nodes: ['at-sel', 'at-link'] },
      { id: 'e2', label: false, nodes: ['ap-row', 'ap-check', 'ap-link'] },
      { id: 'e3', label: false, col: 3, nodes: ['ap-cansel', 'ap-arrow'] },
    ] },
    { id: 'a-state', groups: [
      { id: 's0', label: false, nodes: ['ar-crit', 'ar-state', 'ar-run'] },
      { id: 's1', label: false, nodes: ['at-crit', 'at-state', 'at-run'] },
      { id: 's2', label: false, nodes: ['ap-critbar', 'ap-states', 'ap-run'] },
      { id: 's3', label: false, col: 3, nodes: ['ap-health'] },
    ] },
    { id: 'a-mag', groups: [
      { id: 'm0', label: false, nodes: ['ar-zone', 'ar-data'] },
      { id: 'm1', label: false, nodes: ['at-zone', 'at-data'] },
      { id: 'm2', label: false, nodes: ['ap-zones', 'ap-progress'] },
      { id: 'm3', label: false, col: 3, nodes: ['ap-hire', 'ap-dirty'] },
    ] },
    { id: 'a-cat', groups: [
      { id: 'c0', label: false, nodes: ['ar-person'] },
      { id: 'c1', label: false, nodes: ['at-c'] },
      { id: 'c2', label: false, nodes: ['ap-person'] },
      { id: 'c3', label: false, col: 3, nodes: ['ap-taskcolor'] },
    ] },
  ],
  edges: [
    // дія: три місця (середнє — першим: пряма лінія займає нульову доріжку)
    { id: 'a-signal-focus', from: 'at-signal', to: 'ap-focus', api: 'paints' },
    { id: 'a-signal-btn', from: 'at-signal', to: 'ap-btn', api: 'paints' },
    { id: 'a-signal-tab', from: 'at-signal', to: 'ap-tab', api: 'paints' },
    { id: 'a-act-signal', from: 'ar-act', to: 'at-signal', api: 'token' },
    // записаний виняток
    { id: 'x-learn', from: 'at-signal', to: 'ap-learn', api: 'exc' },
    // вибране й посилання: нова нейтральна роль
    { id: 'a-sel-t', from: 'ar-sel', to: 'at-sel', api: 'token' },
    { id: 'a-sel-link', from: 'ar-sel', to: 'at-link', api: 'token' },
    { id: 'a-sel-row', from: 'at-sel', to: 'ap-row', api: 'paints' },
    { id: 'a-sel-check', from: 'at-sel', to: 'ap-check', api: 'paints' },
    { id: 'a-link-link', from: 'at-link', to: 'ap-link', api: 'paints' },
    { id: 'w2-cansel', from: 'at-sel', to: 'ap-cansel', api: 'was2' },
    { id: 'w2-arrow', from: 'at-sel', to: 'ap-arrow', api: 'was2' },
    // стан
    { id: 'a-crit-t', from: 'ar-crit', to: 'at-crit', api: 'token' },
    { id: 'a-state-t', from: 'ar-state', to: 'at-state', api: 'token' },
    { id: 'a-run-t', from: 'ar-run', to: 'at-run', api: 'token' },
    { id: 'a-crit-bar', from: 'at-crit', to: 'ap-critbar', api: 'paints' },
    { id: 'a-state-p', from: 'at-state', to: 'ap-states', api: 'paints' },
    { id: 'w5-run', from: 'at-run', to: 'ap-run', api: 'was5' },
    // величина
    { id: 'a-zone-t', from: 'ar-zone', to: 'at-zone', api: 'token' },
    { id: 'a-data-t', from: 'ar-data', to: 'at-data', api: 'token' },
    { id: 'a-zone-zones', from: 'at-zone', to: 'ap-zones', api: 'paints' },
    { id: 'a-data-progress', from: 'at-data', to: 'ap-progress', api: 'paints' },
    { id: 'w1-hire', from: 'at-data', to: 'ap-hire', api: 'was1' },
    { id: 'w4-dirty', from: 'at-data', to: 'ap-dirty', api: 'was4' },
    // категорія
    { id: 'a-person-c', from: 'ar-person', to: 'at-c', api: 'token' },
    { id: 'a-c-person', from: 'at-c', to: 'ap-person', api: 'paints' },
    // що лишилось: К6, К7 і збіг значень у блакитному оформленні
    { id: 'k6-taskcolor2', from: 'at-c', to: 'ap-taskcolor', api: 'k6' },
    { id: 'k7-health2', from: 'at-zone', to: 'ap-health', api: 'k7' },
    { id: 'same-data-signal', from: 'at-data', to: 'at-signal', api: 'same' },
  ],
};

window.AFTER_FLOWS = [
  { id: 'a3', steps: [
    { nodes: ['ar-act', 'at-signal'], edges: ['a-act-signal'] },
    { nodes: ['at-signal', 'ap-btn', 'ap-focus', 'ap-tab'], edges: ['a-signal-btn', 'a-signal-focus', 'a-signal-tab'] },
    { nodes: ['at-signal', 'ap-learn'], edges: ['x-learn'] },
  ] },
  { id: 'asel', steps: [
    { nodes: ['ar-sel', 'at-sel', 'at-link'], edges: ['a-sel-t', 'a-sel-link'] },
    { nodes: ['at-sel', 'at-link', 'ap-row', 'ap-check', 'ap-link'], edges: ['a-sel-row', 'a-sel-check', 'a-link-link'] },
    { nodes: ['at-sel', 'ap-cansel', 'ap-arrow'], edges: ['w2-cansel', 'w2-arrow'] },
  ] },
  { id: 'amoved', steps: [
    { nodes: ['at-data', 'ap-hire'], edges: ['w1-hire'] },
    { nodes: ['at-sel', 'ap-cansel', 'ap-arrow'], edges: ['w2-cansel', 'w2-arrow'] },
    { nodes: ['at-data', 'ap-dirty'], edges: ['w4-dirty'] },
    { nodes: ['ar-run', 'at-run', 'ap-run'], edges: ['a-run-t', 'w5-run'] },
  ] },
  { id: 'aleft', steps: [
    { nodes: ['at-c', 'ap-taskcolor'], edges: ['k6-taskcolor2'] },
    { nodes: ['at-zone', 'ap-health'], edges: ['k7-health2'] },
    { nodes: ['at-data', 'at-signal'], edges: ['same-data-signal'] },
    { nodes: ['at-signal', 'at-crit'], edges: [] },
  ] },
];

/* Колір вибраного (світла тема) — для зразків у хмарці. */
Object.assign(window.COLORS.sky, { sel: '#132230' });
Object.assign(window.COLORS.calm, { sel: '#15181D' });

/* Додаток до хмарки: sw — зразки, ref — коротко, де це в коді або як пораховано. */
window.AFTER_INFO = {
  'at-signal': { sw: ['signal'], ref: '68 правил: 5 кнопка · 50 фокус · 2 вкладка · 11 виняток' },
  'ap-btn': { sw: ['signal'], ref: '5 правил' },
  'ap-focus': { sw: ['signal'], ref: '50 правил' },
  'ap-tab': { ref: '2 правила' },
  'ap-learn': { sw: ['signal'], ref: '11 правил · записано в дизайн-системі' },
  'at-sel': { sw: ['sel'], ref: 'tokens.css · 6 блоків' },
  'at-link': { sw: ['sel'], ref: 'tokens.css · 6 блоків' },
  'ap-row': { sw: ['sel'] },
  'ap-check': { sw: ['sel'] },
  'ap-link': { sw: ['sel'] },
  'ap-cansel': { sw: ['sel'], ref: 'draw.ts' },
  'ap-arrow': { sw: ['sel'], ref: 'draw.ts' },
  'at-crit': { sw: ['crit'] },
  'at-state': { sw: ['err', 'warn', 'ok'] },
  'ap-critbar': { sw: ['crit'] },
  'ap-states': { sw: ['err', 'warn', 'ok'] },
  'ap-health': { sw: ['zone1', 'zone2', 'zone3', 'zone4'], k: 'К7' },
  'at-zone': { sw: ['zone1', 'zone2', 'zone3', 'zone4'] },
  'at-data': { sw: ['data'] },
  'ap-zones': { sw: ['zone1', 'zone2', 'zone3', 'zone4'] },
  'ap-progress': { sw: ['data'] },
  'ap-hire': { sw: ['data'], ref: 'draw.ts' },
  'ap-dirty': { sw: ['data'] },
  'at-c': { people: true },
  'ap-person': { people: true },
  'ap-taskcolor': { people: true, k: 'К6' },
};

/* Друга схема — панель «Плану» після переробки. Як і в розділі 8: смуга — це
   група панелі, порядок смуг згори донизу повторює порядок груп зліва направо;
   число в назві — скільки в групі контролів (разом 19). Дві смуги — не ряд,
   а вміст меню: «Вигляд» і те, що лишилось у «Ще», поруч із меню застосунку
   в шапці. Дроти — лише справжні зв'язки: що відкриває меню і що ховається,
   коли панель не влазить. Жодна смуга не згортається. */
window.BAR2 = {
  width: 1560,
  cols: 5,
  key: ['nb-add'],
  bands: [
    { id: 'n1', groups: [{ id: 'na0', label: false, nodes: ['nb-add'] }] },
    { id: 'n2', groups: [
      { id: 'nb0', label: false, nodes: ['nb-out'] },
      { id: 'nb1', label: false, nodes: ['nb-in'] },
      { id: 'nb2', label: false, nodes: ['nb-link'] },
    ] },
    { id: 'n3', groups: [
      { id: 'nc0', label: false, nodes: ['nb-undo'] },
      { id: 'nc1', label: false, nodes: ['nb-redo'] },
    ] },
    { id: 'n4', groups: [
      { id: 'nd0', label: false, nodes: ['nb-scale'] },
      { id: 'nd1', label: false, nodes: ['nb-view'] },
      { id: 'nd2', label: false, nodes: ['nb-crit'] },
      { id: 'nd3', label: false, nodes: ['nb-base'] },
    ] },
    { id: 'n5', groups: [
      { id: 'ne0', label: false, nodes: ['nv-chart'] },
      { id: 'ne1', label: false, nodes: ['nv-rows'] },
      { id: 'ne2', label: false, nodes: ['nv-panels'] },
      { id: 'ne3', label: false, nodes: ['nv-show'] },
      { id: 'ne4', label: false, nodes: ['nv-screen'] },
    ] },
    { id: 'n6', groups: [
      { id: 'nf0', label: false, nodes: ['nb-search'] },
      { id: 'nf1', label: false, nodes: ['nb-filter'] },
      { id: 'nf2', label: false, nodes: ['nb-export'] },
      { id: 'nf3', label: false, nodes: ['nb-more'] },
      { id: 'nf4', label: false, nodes: ['nb-howto'] },
    ] },
    { id: 'n7', groups: [
      { id: 'ng3', label: false, col: 3, nodes: ['nm-plan'] },
      { id: 'ng4', label: false, col: 4, nodes: ['nm-app'] },
    ] },
  ],
  edges: [
    // меню «Вигляд» і його п'ять розділів
    { id: 'v-panels', from: 'nb-view', to: 'nv-panels', api: 'opens' },
    { id: 'v-rows', from: 'nb-view', to: 'nv-rows', api: 'opens' },
    { id: 'v-chart', from: 'nb-view', to: 'nv-chart', api: 'opens' },
    { id: 'v-show', from: 'nb-view', to: 'nv-show', api: 'opens' },
    { id: 'v-screen', from: 'nb-view', to: 'nv-screen', api: 'opens' },
    // меню «Ще»
    { id: 'more-plan2', from: 'nb-more', to: 'nm-plan', api: 'opens' },
    // переповнення: єдине, що тепер ховається в «Ще», — трійка структури
    { id: 'hide2-link', from: 'nb-link', to: 'nm-plan', api: 'hide1' },
    { id: 'hide2-in', from: 'nb-in', to: 'nm-plan', api: 'hide1' },
    { id: 'hide2-out', from: 'nb-out', to: 'nm-plan', api: 'hide1' },
  ],
};

window.BAR2_FLOWS = [
  { id: 'brow', steps: [
    { nodes: ['nb-add', 'nb-undo', 'nb-redo'], edges: [] },
    { nodes: ['nb-out', 'nb-in', 'nb-link', 'nm-plan'], edges: ['hide2-out', 'hide2-in', 'hide2-link'] },
    { nodes: ['nb-scale', 'nb-view', 'nb-crit', 'nb-base'], edges: [] },
    { nodes: ['nb-search', 'nb-filter', 'nb-export', 'nb-more', 'nb-howto'], edges: [] },
  ] },
  { id: 'bview', steps: [
    { nodes: ['nb-view', 'nv-chart', 'nv-rows'], edges: ['v-chart', 'v-rows'] },
    { nodes: ['nb-view', 'nv-panels', 'nv-show', 'nv-screen'], edges: ['v-panels', 'v-show', 'v-screen'] },
    { nodes: ['nb-scale', 'nb-crit', 'nb-base'], edges: [] },
  ] },
  { id: 'bmenu', steps: [
    { nodes: ['nb-more', 'nm-plan'], edges: ['more-plan2'] },
    { nodes: ['nm-app'], edges: [] },
    { nodes: ['nb-howto'], edges: [] },
  ] },
  { id: 'bleft', steps: [
    { nodes: ['nb-crit', 'nb-base'], edges: [] },
    { nodes: ['nb-out', 'nb-in', 'nb-link'], edges: [] },
    { nodes: ['nb-scale', 'nb-view'], edges: [] },
  ] },
];

/* Хмарка другої схеми додатка не має: усе сказано в тексті вузла. */
window.BAR2_INFO = {};

/* Таблиця «було → стало»: рядки. was / now — числа, пораховані автором на двох
   знімках коду продукту (до й після переробки); як саме — у copy.js (num.<id>.how). */
window.AFTER_NUMS = [
  { id: 'rules', was: '186', now: '68' },
  { id: 'other', was: '123', now: '0' },
  { id: 'canvas', was: '22', now: '0' },
  { id: 'bar', was: '27', now: '19' },
  { id: 'segs', was: '3 · 3 · 2', now: '1 · 1 · 1' },
  { id: 'prim', was: '11 з 15', now: '0 з 16' },
  { id: 'primmax', was: '3', now: '1' },
  { id: 'total', was: '159', now: '155' },
  { id: 'add', was: '4', now: '0' },
  { id: 'cards', was: '0', now: '5' },
  { id: 'tests', was: '2 087', now: '2 535' },
  { id: 'tcolor', was: '154', now: '244' },
  { id: 'tbtn', was: '0', now: '15' },
  { id: 'tentry', was: '0', now: '26' },
];

/* Що стало з трьома відкритими питаннями розділу 5 і двома варіантами складу з розділу 8. */
window.AFTER_CHOICES = ['q1', 'q2', 'q3', 'hd', 'tb'];

/* Чесний підрозділ: що не вийшло або лишилось. */
window.AFTER_LEFT = ['total', 'sky', 'calm', 'wire', 'cvd', 'cols', 'course', 'unproven', 'small'];

/* Три уроки. */
window.AFTER_LESSONS = ['test', 'render', 'value'];
