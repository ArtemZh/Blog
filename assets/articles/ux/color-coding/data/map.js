/* Схема «роль кольору → токен → місця в інтерфейсі».
   Смуги — чотири роботи кольору (дія, стан, категорія, величина) і смуга місць,
   у яких власної ролі немає. Колонки зліва направо: роль · токен · місця за
   призначенням · дві колонки місць, що взяли чужий колір. Таке місце стоїть у
   смузі тієї роботи, яку воно виконує насправді, тому дріт запозичення завжди
   виходить за межі своєї смуги (SCHEMA-PRINCIPLES §3, §8).
   Порядок смуг і рядків підібрано під рушій: згорнута смуга з'єднується із
   сусідньою прямою вертикаллю, тому пари «звідки взяли → куди» стоять поруч
   (величина ↔ стан, категорія ↔ «ролі немає»), токен зон — верхній у своїй
   колонці, а «Категорія», як і «Дія», не згортається.
   Порядок дротів має значення: рушій роздає доріжки в жолобі за чергою. */
window.MAP = {
  width: 1560,
  cols: 5,
  key: ['t-signal'],
  bands: [
    { id: 'act', groups: [
      { id: 'role', nodes: ['r-act'] },
      { id: 'token', nodes: ['t-signal'] },
      { id: 'own', nodes: ['p-btn', 'p-focus', 'p-sel'] },
      { id: 'lent', col: 3, nodes: [] },
    ] },
    { id: 'state', expandable: true, groups: [
      { id: 's0', label: false, nodes: ['r-crit', 'r-err', 'r-warn', 'r-ok'] },
      { id: 's1', label: false, nodes: ['t-crit', 't-err', 't-warn', 't-ok'] },
      { id: 's2', label: false, nodes: ['p-critbar', 'p-late', 'p-sprint', 'p-done'] },
      { id: 's3', label: false, col: 3, nodes: ['p-run', 'p-health'] },
      { id: 's4', label: false, col: 4, nodes: ['p-dirty'] },
    ] },
    { id: 'mag', expandable: true, groups: [
      { id: 'm0', label: false, nodes: ['r-zone', 'r-data'] },
      { id: 'm1', label: false, nodes: ['t-zone', 't-data'] },
      { id: 'm2', label: false, nodes: ['p-zones', 'p-progress'] },
      { id: 'm3', label: false, col: 3, nodes: ['p-hire'] },
      { id: 'm4', label: false, col: 4, nodes: ['p-step'] },
    ] },
    { id: 'cat', groups: [
      { id: 'c0', label: false, nodes: ['r-person'] },
      { id: 'c1', label: false, nodes: ['t-c'] },
      { id: 'c2', label: false, nodes: ['p-person'] },
    ] },
    { id: 'none', expandable: true, groups: [
      { id: 'n3', label: false, col: 3, nodes: ['p-taskcolor', 'p-audit'] },
      { id: 'n4', label: false, col: 4, nodes: ['p-cansel', 'p-arrow', 'p-about'] },
    ] },
  ],
  edges: [
    // дія: за призначенням (середнє місце — першим: пряма лінія займає нульову доріжку)
    { id: 'signal-focus', from: 't-signal', to: 'p-focus', api: 'paints' },
    { id: 'signal-btn', from: 't-signal', to: 'p-btn', api: 'paints' },
    { id: 'signal-sel', from: 't-signal', to: 'p-sel', api: 'paints' },
    // дія: запозичення К1–К5
    { id: 'k5-run', from: 't-signal', to: 'p-run', api: 'k5' },
    { id: 'k1-hire', from: 't-signal', to: 'p-hire', api: 'k1' },
    { id: 'k4-dirty', from: 't-signal', to: 'p-dirty', api: 'k4' },
    { id: 'k4-step', from: 't-signal', to: 'p-step', api: 'k4' },
    { id: 'k2-cansel', from: 't-signal', to: 'p-cansel', api: 'k2' },
    { id: 'k2-arrow', from: 't-signal', to: 'p-arrow', api: 'k2' },
    { id: 'k3-about', from: 't-signal', to: 'p-about', api: 'k3' },
    { id: 'act-signal', from: 'r-act', to: 't-signal', api: 'token' },
    // стан
    { id: 'crit-t', from: 'r-crit', to: 't-crit', api: 'token' },
    { id: 'err-t', from: 'r-err', to: 't-err', api: 'token' },
    { id: 'warn-t', from: 'r-warn', to: 't-warn', api: 'token' },
    { id: 'ok-t', from: 'r-ok', to: 't-ok', api: 'token' },
    { id: 'crit-bar', from: 't-crit', to: 'p-critbar', api: 'paints' },
    { id: 'err-late', from: 't-err', to: 'p-late', api: 'paints' },
    { id: 'warn-sprint', from: 't-warn', to: 'p-sprint', api: 'paints' },
    { id: 'ok-done', from: 't-ok', to: 'p-done', api: 'paints' },
    { id: 'err-sprint', from: 't-err', to: 'p-sprint', api: 'paints' },
    // категорія
    { id: 'person-c', from: 'r-person', to: 't-c', api: 'token' },
    { id: 'c-person', from: 't-c', to: 'p-person', api: 'paints' },
    { id: 'k6-taskcolor', from: 't-c', to: 'p-taskcolor', api: 'k6' },
    { id: 'k6-audit', from: 't-c', to: 'p-audit', api: 'k6' },
    // величина
    { id: 'data-t', from: 'r-data', to: 't-data', api: 'token' },
    { id: 'zone-t', from: 'r-zone', to: 't-zone', api: 'token' },
    { id: 'data-progress', from: 't-data', to: 'p-progress', api: 'paints' },
    { id: 'zone-zones', from: 't-zone', to: 'p-zones', api: 'paints' },
    { id: 'k7-health', from: 't-zone', to: 'p-health', api: 'k7' },
  ],
};

/* Сценарії: один іменований шлях, решта схеми тьмяніє. */
window.COLOR_FLOWS = [
  { id: 'act', steps: [
    { nodes: ['r-act', 't-signal'], edges: ['act-signal'] },
    { nodes: ['t-signal', 'p-btn', 'p-focus', 'p-sel'], edges: ['signal-btn', 'signal-focus', 'signal-sel'] },
  ] },
  { id: 'crit', steps: [
    { nodes: ['r-crit', 't-crit'], edges: ['crit-t'] },
    { nodes: ['t-crit', 'p-critbar'], edges: ['crit-bar'] },
    { nodes: ['t-crit', 't-signal', 'p-hire', 'p-arrow'], edges: ['k1-hire', 'k2-arrow'] },
  ] },
  { id: 'state', steps: [
    { nodes: ['r-err', 'r-warn', 'r-ok', 't-err', 't-warn', 't-ok'], edges: ['err-t', 'warn-t', 'ok-t'] },
    { nodes: ['t-err', 't-warn', 't-ok', 'p-late', 'p-sprint', 'p-done'], edges: ['err-late', 'err-sprint', 'warn-sprint', 'ok-done'] },
    { nodes: ['t-signal', 'p-run', 'p-dirty'], edges: ['k5-run', 'k4-dirty'] },
    { nodes: ['t-zone', 'p-health'], edges: ['k7-health'] },
  ] },
  { id: 'person', steps: [
    { nodes: ['r-person', 't-c'], edges: ['person-c'] },
    { nodes: ['t-c', 'p-person'], edges: ['c-person'] },
    { nodes: ['t-c', 'p-taskcolor', 'p-audit'], edges: ['k6-taskcolor', 'k6-audit'] },
  ] },
  { id: 'conf', steps: [
    { nodes: ['t-signal', 'p-hire'], edges: ['k1-hire'] },
    { nodes: ['t-signal', 'p-cansel', 'p-arrow'], edges: ['k2-cansel', 'k2-arrow'] },
    { nodes: ['t-signal', 'p-about'], edges: ['k3-about'] },
    { nodes: ['t-signal', 'p-step', 'p-dirty'], edges: ['k4-step', 'k4-dirty'] },
    { nodes: ['t-signal', 'p-run'], edges: ['k5-run'] },
    { nodes: ['t-c', 'p-taskcolor', 'p-audit'], edges: ['k6-taskcolor', 'k6-audit'] },
    { nodes: ['t-zone', 'p-health'], edges: ['k7-health'] },
  ] },
];

/* Значення токенів світлої теми у двох оформленнях. Потрібні лише для
   зразків-квадратиків у хмарці й у таблиці відстаней: вузли ними не фарбуємо. */
window.COLORS = {
  sky: {
    signal: '#007BBB', crit: '#EE4F24', err: '#D6283F', warn: '#F0961A', ok: '#1E9E5E',
    data: '#007BBB', bar: '#0099DB', zone1: '#1E9E5E', zone2: '#E9C22E', zone3: '#F0961A', zone4: '#D6283F',
  },
  calm: {
    signal: '#CF4508', crit: '#C22F1F', err: '#D4234E', warn: '#E6A300', ok: '#1E9E5E',
    data: '#5B7FA6', bar: '#5B7FA6', zone1: '#1E9E5E', zone2: '#D8CF3A', zone3: '#E6A300', zone4: '#D4234E',
  },
  // кольори людей спільні для обох оформлень
  people: {
    blue: '#3F6AC0', teal: '#1A9C8B', purple: '#50259B', clay: '#AC4010', green: '#548532',
    magenta: '#972960', gold: '#B08A22', indigo: '#2B36C0', slate: '#5F7A95', brown: '#6E3E22',
  },
};

/* Додаток до хмарки: sw — які зразки показати, ref — де це в коді (коротко),
   k — номер конфлікту. Пояснення словами — у copy.js (node.<id>.b). */
window.MAP_INFO = {
  't-signal': { sw: ['signal'], ref: 'tokens.css · 43 правила в app.css' },
  'p-btn': { sw: ['signal'], ref: 'app.css:29' },
  'p-focus': { sw: ['signal'], ref: 'app.css:67, :81' },
  'p-sel': { sw: ['signal'], ref: 'app.css · 44 правила' },
  't-crit': { sw: ['crit'], ref: 'tokens.css:48, :195' },
  't-err': { sw: ['err'], ref: 'tokens.css:45, :192' },
  't-warn': { sw: ['warn'], ref: 'tokens.css:44, :191' },
  't-ok': { sw: ['ok'], ref: 'tokens.css:44, :191' },
  'p-critbar': { sw: ['crit'], ref: 'draw.ts:303, :334, :378' },
  'p-late': { sw: ['err'], ref: 'draw.ts:407' },
  'p-sprint': { sw: ['warn', 'err'], ref: 'app.css:2828–2829' },
  'p-done': { sw: ['ok'], ref: 'app.css:104, :1605' },
  'p-run': { sw: ['signal'], ref: 'app.css:103 · pm.css:70', k: 'К5' },
  'p-health': { sw: ['zone1', 'zone2', 'zone3', 'zone4'], ref: 'app.css:3011–3022', k: 'К7' },
  'p-dirty': { sw: ['signal'], ref: 'app.css:213', k: 'К4' },
  't-c': { people: true, ref: 'tokens.css:63–66' },
  'p-person': { people: true, ref: 'draw.ts:85 · People.tsx:296' },
  't-data': { sw: ['data'], ref: 'tokens.css:72–74' },
  't-zone': { sw: ['zone1', 'zone2', 'zone3', 'zone4'], ref: 'tokens.css' },
  'p-progress': { sw: ['data'], ref: 'app.css:1145, :1286, :2818' },
  'p-zones': { sw: ['zone1', 'zone2', 'zone3', 'zone4'], ref: 'app.css:826–843 · draw.ts:468' },
  'p-hire': { sw: ['signal'], ref: 'draw.ts:856', k: 'К1' },
  'p-step': { sw: ['signal'], ref: 'app.css:2046, :187, :1813', k: 'К4' },
  'p-taskcolor': { people: true, ref: 'TaskPanel.tsx:173 · draw.ts:316', k: 'К6' },
  'p-audit': { people: true, ref: 'app.css:3112–3114', k: 'К6' },
  'p-cansel': { sw: ['signal'], ref: 'draw.ts:302–303, :430, :551, :582, :864', k: 'К2' },
  'p-arrow': { sw: ['signal'], ref: 'draw.ts:302–303, :430, :551, :582, :864', k: 'К2' },
  'p-about': { sw: ['signal'], ref: 'app.css:2000', k: 'К3' },
};
