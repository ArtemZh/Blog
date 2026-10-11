/* Друга схема: панель «Плану» сьогодні.
   На екрані панель — один ряд зліва направо. Рушій кладе смуги згори донизу,
   тому смуга тут — це група панелі, а порядок смуг згори донизу повторює
   порядок груп зліва направо. Усередині смуги контроли стоять у тому порядку,
   як на екрані: кожен у своїй колонці. Колонка змісту не несе.
   Останні три картки нижньої смуги — не кнопки, а вміст меню «Ще».
   Дроти — лише справжні зв'язки: що куди ховається, коли панель не влазить
   (порядок ховання — у підписі дроту), що відкриває меню і де одна іконка
   означає дві команди. Решта контролів дротів не має: крім місця в групі,
   зв'язків у них немає (місце в групі показує смуга).
   Жодна смуга не згортається — стан у схеми один. */
window.BAR = {
  width: 1560,
  cols: 5,
  key: ['tb-add'],
  bands: [
    { id: 'g1', groups: [{ id: 'a0', label: false, nodes: ['tb-add'] }] },
    { id: 'g2', groups: [
      { id: 'b0', label: false, nodes: ['tb-out'] },
      { id: 'b1', label: false, nodes: ['tb-in'] },
      { id: 'b2', label: false, nodes: ['tb-link'] },
      { id: 'b3', label: false, nodes: ['tb-ptask'] },
      { id: 'b4', label: false, nodes: ['tb-pload'] },
    ] },
    { id: 'g3', groups: [
      { id: 'c0', label: false, nodes: ['tb-undo'] },
      { id: 'c1', label: false, nodes: ['tb-redo'] },
    ] },
    { id: 'g4', groups: [
      { id: 'd0', label: false, nodes: ['tb-scale'] },
      { id: 'd1', label: false, nodes: ['tb-fit'] },
      { id: 'd2', label: false, nodes: ['tb-today'] },
    ] },
    { id: 'g5', groups: [
      { id: 'e0', label: false, nodes: ['tb-view'] },
      { id: 'e1', label: false, nodes: ['tb-rows'] },
      { id: 'e2', label: false, nodes: ['tb-opt'] },
    ] },
    { id: 'g6', groups: [
      { id: 'f0', label: false, nodes: ['tb-crit'] },
      { id: 'f1', label: false, nodes: ['tb-base'] },
    ] },
    { id: 'g7', groups: [
      { id: 'h0', label: false, nodes: ['tb-search'] },
      { id: 'h1', label: false, nodes: ['tb-filter'] },
    ] },
    { id: 'g8', groups: [
      { id: 'i0', label: false, nodes: ['tb-export'] },
      { id: 'i1', label: false, nodes: ['tb-more'] },
      { id: 'inmore', nodes: ['m-plan'] },
      { id: 'i3', label: false, nodes: ['m-over'] },
      { id: 'i4', label: false, nodes: ['m-gen'] },
    ] },
  ],
  edges: [
    // меню «Ще» і його три частини
    { id: 'more-plan', from: 'tb-more', to: 'm-plan', api: 'opens' },
    { id: 'more-over', from: 'tb-more', to: 'm-over', api: 'opens' },
    { id: 'more-gen', from: 'tb-more', to: 'm-gen', api: 'opens' },
    // переповнення: що ховається в «Ще», коли панель не влазить (1-й, 2-й, 4-й крок)
    { id: 'hide-fit', from: 'tb-fit', to: 'm-over', api: 'hide1' },
    { id: 'hide-today', from: 'tb-today', to: 'm-over', api: 'hide1' },
    { id: 'hide-link', from: 'tb-link', to: 'm-over', api: 'hide2' },
    { id: 'hide-in', from: 'tb-in', to: 'm-over', api: 'hide2' },
    { id: 'hide-out', from: 'tb-out', to: 'm-over', api: 'hide2' },
    { id: 'hide-ptask', from: 'tb-ptask', to: 'm-over', api: 'hide4' },
    { id: 'hide-pload', from: 'tb-pload', to: 'm-over', api: 'hide4' },
    // одна іконка — дві команди
    { id: 'same-fit-opt', from: 'tb-fit', to: 'tb-opt', api: 'sameicon' },
  ],
};

/* Сценарії. «Часте» й «Рідкісне» — припущення (поділ варіанта П1), а не замір:
   так і підписано в назві сценарію й у тексті кроків. */
window.BAR_FLOWS = [
  { id: 'often', steps: [
    { nodes: ['tb-add', 'tb-undo', 'tb-redo'], edges: [] },
    { nodes: ['tb-out', 'tb-in', 'tb-link', 'm-over'], edges: ['hide-out', 'hide-in', 'hide-link'] },
    { nodes: ['tb-view', 'tb-scale', 'tb-search', 'tb-filter'], edges: [] },
    { nodes: ['tb-opt', 'tb-export'], edges: [] },
  ] },
  { id: 'view', steps: [
    { nodes: ['tb-scale', 'tb-view', 'tb-rows'], edges: [] },
    { nodes: ['tb-crit', 'tb-base', 'tb-ptask', 'tb-pload'], edges: [] },
    { nodes: ['tb-fit', 'tb-today', 'tb-opt'], edges: ['same-fit-opt'] },
    { nodes: ['tb-more', 'm-plan'], edges: ['more-plan'] },
  ] },
  { id: 'rare', steps: [
    { nodes: ['tb-rows', 'tb-crit', 'tb-base'], edges: [] },
    { nodes: ['tb-fit', 'tb-today', 'tb-ptask', 'tb-pload', 'm-over'], edges: ['hide-fit', 'hide-today', 'hide-ptask', 'hide-pload'] },
    { nodes: ['tb-more', 'm-plan', 'm-gen'], edges: ['more-plan', 'more-gen'] },
  ] },
  { id: 'danger', steps: [
    { nodes: ['tb-undo', 'tb-redo'], edges: [] },
    { nodes: ['tb-opt'], edges: [] },
    { nodes: ['tb-base'], edges: [] },
  ] },
];

/* Додаток до хмарки: size — розмір за стилями (без вимірювання в браузері),
   ref — де це в коді (коротко). Пояснення словами — у copy.js (node.<id>.b). */
window.BAR_INFO = {
  'tb-add': { size: 'висота 26 px', ref: 'Toolbar.tsx:45, :160–189' },
  'tb-out': { size: '28×28 px', ref: 'Toolbar.tsx:49–64' },
  'tb-in': { size: '28×28 px', ref: 'Toolbar.tsx:49–64' },
  'tb-link': { size: '28×28 px', ref: 'Toolbar.tsx:49–64' },
  'tb-ptask': { size: '28×28 px', ref: 'Toolbar.tsx:56' },
  'tb-pload': { size: '28×28 px', ref: 'Toolbar.tsx:57–64' },
  'tb-undo': { size: '28×28 px', ref: 'Toolbar.tsx:68–69' },
  'tb-redo': { size: '28×28 px', ref: 'Toolbar.tsx:68–69' },
  'tb-scale': { size: 'висота 22 px', ref: 'Toolbar.tsx:71–82, :126–151' },
  'tb-fit': { size: '28×28 px', ref: 'Toolbar.tsx:80 · OptimizeDialog.tsx:46' },
  'tb-today': { size: '28×28 px', ref: 'Toolbar.tsx:81 · Requirements.tsx:198' },
  'tb-view': { size: 'висота 22 px', ref: 'Toolbar.tsx:84–86' },
  'tb-rows': { size: 'висота 22 px', ref: 'Toolbar.tsx:84–86' },
  'tb-opt': { size: 'висота 26 px', ref: 'Toolbar.tsx:84–86 · OptimizeDialog.tsx:104' },
  'tb-crit': { size: 'повзунок 30×18 px', ref: 'Toolbar.tsx:88–92' },
  'tb-base': { ref: 'Toolbar.tsx:88–92 · BaselinesDialog.tsx:35' },
  'tb-search': { size: 'поле 28 px · очистити 20×20', ref: 'Toolbar.tsx:94 · app.css:754, :758' },
  'tb-filter': { ref: 'Toolbar.tsx:95 · FilterBar.tsx:29–77' },
  'tb-export': { ref: 'Toolbar.tsx:97' },
  'tb-more': { ref: 'Toolbar.tsx:98 · MoreMenu.tsx:42–88' },
  'm-plan': { size: 'пункт від 32 px', ref: 'MoreMenu.tsx:42–88' },
  'm-over': { ref: 'Toolbar.tsx:38–39' },
  'm-gen': { size: 'пункт від 32 px', ref: 'MoreMenu.tsx:69–87' },
};
