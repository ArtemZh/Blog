/* Схема 1 — потік планувальника: вхід → модель плану → розрахунки → екрани → виходи.
   Смуги йдуть згори вниз у порядку, в якому рухаються дані; колонки — теми
   (розклад · гроші · ризики · факт · контракт), тож більшість дротів коротка
   й лишається у своїй колонці. Позиції рахує рушій із lane/row — руками нічого
   не розставлено. Порядок дротів має значення: рушій роздає доріжки в жолобі
   за чергою. Смуги не згортаються — стан у схеми один. */
window.PLANNER = {
  width: 1560,
  cols: 5,
  key: ['c-sched'],
  bands: [
    { id: 'p-in', groups: [
      { id: 'pi0', label: false, nodes: ['p-file'] },
      { id: 'pi1', label: false, nodes: ['p-import'] },
      { id: 'pi2', label: false, nodes: ['p-tpl'] },
      { id: 'pi3', label: false, nodes: ['p-hand'] },
    ] },
    { id: 'p-model', groups: [
      { id: 'pm0', label: false, nodes: ['m-tasks', 'm-cal'] },
      { id: 'pm1', label: false, nodes: ['m-people', 'm-est'] },
      { id: 'pm2', label: false, nodes: ['m-risks', 'm-fact'] },
      { id: 'pm3', label: false, nodes: ['m-base'] },
      { id: 'pm4', label: false, nodes: ['m-limits', 'm-changes'] },
    ] },
    { id: 'p-calc', groups: [
      { id: 'pc0', label: false, nodes: ['c-sched'] },
      { id: 'pc1', label: false, nodes: ['c-cost'] },
      { id: 'pc2', label: false, nodes: ['c-mc'] },
      { id: 'pc3', label: false, nodes: ['c-evm'] },
      { id: 'pc4', label: false, nodes: ['c-price'] },
    ] },
    { id: 'p-view', groups: [
      { id: 'pv0', label: false, nodes: ['v-plan'] },
      { id: 'pv1', label: false, nodes: ['v-budget'] },
      { id: 'pv2', label: false, nodes: ['v-analysis'] },
      { id: 'pv3', label: false, nodes: ['v-evm'] },
      { id: 'pv4', label: false, nodes: ['v-art'] },
    ] },
    { id: 'p-out', groups: [
      { id: 'po0', label: false, nodes: ['x-export'] },
      { id: 'po1', label: false, nodes: ['x-viewer'] },
      { id: 'po3', label: false, col: 3, nodes: ['x-report'] },
      { id: 'po4', label: false, col: 4, nodes: ['x-prop'] },
    ] },
  ],
  edges: [
    // вхід → модель
    { id: 'file-tasks', from: 'p-file', to: 'm-tasks', api: 'opens' },
    { id: 'import-tasks', from: 'p-import', to: 'm-tasks', api: 'imports' },
    { id: 'tpl-tasks', from: 'p-tpl', to: 'm-tasks', api: 'starts' },
    { id: 'hand-fact', from: 'p-hand', to: 'm-fact', api: 'fact' },
    { id: 'hand-est', from: 'p-hand', to: 'm-est', api: 'estimate' },
    // модель → розрахунки
    { id: 'tasks-sched', from: 'm-tasks', to: 'c-sched', api: 'links' },
    { id: 'cal-sched', from: 'm-cal', to: 'c-sched', api: 'workdays' },
    { id: 'est-sched', from: 'm-est', to: 'c-sched', api: 'duration' },
    { id: 'people-cost', from: 'm-people', to: 'c-cost', api: 'rates' },
    { id: 'sched-cost', from: 'c-sched', to: 'c-cost', api: 'hours' },
    { id: 'est-mc', from: 'm-est', to: 'c-mc', api: 'spread' },
    { id: 'risks-mc', from: 'm-risks', to: 'c-mc', api: 'chance' },
    { id: 'fact-evm', from: 'm-fact', to: 'c-evm', api: 'done' },
    { id: 'base-evm', from: 'm-base', to: 'c-evm', api: 'planned' },
    { id: 'risks-price', from: 'm-risks', to: 'c-price', api: 'reserve' },
    { id: 'people-price', from: 'm-people', to: 'c-price', api: 'rates' },
    { id: 'price-limits', from: 'c-price', to: 'm-limits', api: 'contract' },
    { id: 'changes-limits', from: 'm-changes', to: 'm-limits', api: 'shifts' },
    { id: 'changes-base', from: 'm-changes', to: 'm-base', api: 'shifts' },
    // розрахунки → екрани
    { id: 'sched-plan', from: 'c-sched', to: 'v-plan', api: 'dates' },
    { id: 'cost-budget', from: 'c-cost', to: 'v-budget', api: 'money' },
    { id: 'mc-analysis', from: 'c-mc', to: 'v-analysis', api: 'p80' },
    { id: 'evm-view', from: 'c-evm', to: 'v-evm', api: 'indices' },
    { id: 'changes-art', from: 'm-changes', to: 'v-art', api: 'register' },
    // екрани й розрахунки → виходи
    { id: 'plan-export', from: 'v-plan', to: 'x-export', api: 'exports' },
    { id: 'sched-viewer', from: 'c-sched', to: 'x-viewer', api: 'frozen' },
    { id: 'evm-report', from: 'v-evm', to: 'x-report', api: 'status' },
    { id: 'analysis-report', from: 'v-analysis', to: 'x-report', api: 'toprisks' },
    { id: 'price-prop', from: 'c-price', to: 'x-prop', api: 'priceout' },
    { id: 'mc-prop', from: 'c-mc', to: 'x-prop', api: 'p80' },
  ],
};

/* Сценарії: один іменований шлях, решта схеми тьмяніє. */
window.PLANNER_FLOWS = [
  { id: 'open', steps: [
    { nodes: ['p-file', 'p-import', 'p-tpl', 'm-tasks'], edges: ['file-tasks', 'import-tasks', 'tpl-tasks'] },
    { nodes: ['m-tasks', 'm-cal', 'c-sched'], edges: ['tasks-sched', 'cal-sched'] },
    { nodes: ['c-sched', 'v-plan'], edges: ['sched-plan'] },
    { nodes: ['v-plan', 'c-sched', 'x-export', 'x-viewer'], edges: ['plan-export', 'sched-viewer'] },
  ] },
  { id: 'offer', steps: [
    { nodes: ['p-hand', 'm-est'], edges: ['hand-est'] },
    { nodes: ['m-tasks', 'm-cal', 'm-est', 'c-sched'], edges: ['tasks-sched', 'cal-sched', 'est-sched'] },
    { nodes: ['c-sched', 'm-people', 'c-cost', 'v-budget'], edges: ['sched-cost', 'people-cost', 'cost-budget'] },
    { nodes: ['m-est', 'm-risks', 'c-mc'], edges: ['est-mc', 'risks-mc'] },
    { nodes: ['m-risks', 'm-people', 'c-price'], edges: ['risks-price', 'people-price'] },
    { nodes: ['c-price', 'c-mc', 'x-prop'], edges: ['price-prop', 'mc-prop'] },
    { nodes: ['c-price', 'm-limits'], edges: ['price-limits'], human: ['m-limits'] },
  ] },
  { id: 'status', steps: [
    { nodes: ['p-hand', 'm-fact'], edges: ['hand-fact'] },
    { nodes: ['m-fact', 'm-base', 'c-evm'], edges: ['fact-evm', 'base-evm'] },
    { nodes: ['c-evm', 'v-evm'], edges: ['evm-view'] },
    { nodes: ['v-evm', 'v-analysis', 'x-report'], edges: ['evm-report', 'analysis-report'] },
  ] },
  { id: 'risk', steps: [
    { nodes: ['m-risks'], edges: [] },
    { nodes: ['m-risks', 'm-est', 'c-mc'], edges: ['risks-mc', 'est-mc'] },
    { nodes: ['c-mc', 'v-analysis'], edges: ['mc-analysis'] },
    { nodes: ['m-risks', 'c-price'], edges: ['risks-price'] },
  ] },
  { id: 'change', steps: [
    { nodes: ['m-changes'], edges: [], human: ['m-changes'] },
    { nodes: ['m-changes', 'm-limits', 'm-base'], edges: ['changes-limits', 'changes-base'] },
    { nodes: ['m-changes', 'v-art'], edges: ['changes-art'] },
  ] },
];

/* Додаток до хмарки: де це в коді продукту (лише назва модуля, без шляхів). */
window.PLANNER_INFO = {
  'p-file': { ref: 'model/project' },
  'p-import': { ref: 'io · MS Project XML, CSV' },
  'p-tpl': { ref: 'model/templates · model/demo' },
  'm-tasks': { ref: 'model/wbs · model/types' },
  'm-cal': { ref: 'model/calendar' },
  'm-est': { ref: 'model/pert · model/estimate' },
  'm-people': { ref: 'model/cost · model/margin' },
  'm-risks': { ref: 'model/risk · model/planb' },
  'm-fact': { ref: 'model/evm' },
  'm-base': { ref: 'model/baseline' },
  'm-limits': { ref: 'model/constraints · model/stage' },
  'm-changes': { ref: 'model/changelog' },
  'c-sched': { ref: 'model/scheduler' },
  'c-cost': { ref: 'model/cost' },
  'c-mc': { ref: 'model/montecarlo' },
  'c-evm': { ref: 'model/evm' },
  'c-price': { ref: 'model/contract' },
  'x-viewer': { ref: 'model/viewer' },
  'x-report': { ref: 'model/report' },
  'x-prop': { ref: 'model/proposal' },
};
