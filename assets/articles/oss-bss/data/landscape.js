/* Ландшафт оператора: смуги, групи, вузли й зв'язки.
   Тексти вузлів — у copy.csv за ключами node.<id>.t / .s / .b.
   Порядок вузлів у колонці — інструмент: те, що веде далі по потоку,
   стоїть ближче до сусідньої смуги (SCHEMA-PRINCIPLES §6). */
window.LANDSCAPE = {
  width: 1440,
  cols: 3,
  key: ['order', 'som'],
  bands: [
    { id: 'channels', groups: [
      { id: 'c1', label: false, nodes: ['web'] },
      { id: 'c2', label: false, nodes: ['store'] },
      { id: 'c3', label: false, nodes: ['partner'] },
    ] },
    { id: 'bss', expandable: true, groups: [
      { id: 'engage', nodes: ['catalog', 'crm'] },
      { id: 'commerce', nodes: ['order', 'pinv'] },
      { id: 'money', nodes: ['charging', 'billing', 'payments'] },
    ] },
    { id: 'bus', strip: true },
    { id: 'oss', expandable: true, groups: [
      { id: 'fulfil', nodes: ['som', 'sinv', 'act'] },
      { id: 'assure', nodes: ['sprob', 'fault', 'perf'] },
      { id: 'invent', nodes: ['rinv', 'med'] },
    ] },
    { id: 'net', groups: [
      { id: 'n1', label: false, nodes: ['ran'] },
      { id: 'n2', label: false, nodes: ['core'] },
      { id: 'n3', label: false, nodes: ['transport'] },
    ] },
  ],
  edges: [
    // продаж
    { id: 'web-catalog', from: 'web', to: 'catalog', api: 'TMF620' },
    { id: 'web-order', from: 'web', to: 'order', api: 'TMF622' },
    { id: 'store-crm', from: 'store', to: 'crm', api: 'TMF629' },
    { id: 'crm-order', from: 'crm', to: 'order', api: 'TMF622' },
    { id: 'partner-order', from: 'partner', to: 'order', api: 'TMF622' },
    { id: 'order-pinv', from: 'order', to: 'pinv', api: 'TMF637' },
    { id: 'order-charging', from: 'order', to: 'charging', api: 'provisioning' },
    { id: 'order-web', from: 'order', to: 'web', api: 'TMF688' },
    // доставка
    { id: 'order-som', from: 'order', to: 'som', api: 'TMF641' },
    { id: 'som-sinv', from: 'som', to: 'sinv', api: 'TMF638' },
    { id: 'som-act', from: 'som', to: 'act', api: 'TMF640' },
    { id: 'act-rinv', from: 'act', to: 'rinv', api: 'TMF639' },
    { id: 'act-core', from: 'act', to: 'core', api: 'TMF702' },
    { id: 'act-ran', from: 'act', to: 'ran', api: 'TMF702' },
    { id: 'som-order', from: 'som', to: 'order', api: 'TMF688' },
    // контроль
    { id: 'ran-fault', from: 'ran', to: 'fault', api: 'TMF642' },
    { id: 'transport-fault', from: 'transport', to: 'fault', api: 'TMF642' },
    { id: 'ran-perf', from: 'ran', to: 'perf', api: 'TMF628' },
    { id: 'fault-sprob', from: 'fault', to: 'sprob', api: 'TMF656' },
    { id: 'perf-sprob', from: 'perf', to: 'sprob', api: 'TMF657' },
    { id: 'sprob-sinv', from: 'sprob', to: 'sinv', api: 'TMF638' },
    { id: 'sprob-crm', from: 'sprob', to: 'crm', api: 'TMF621' },
    { id: 'sprob-som', from: 'sprob', to: 'som', api: 'TMF641' },
    { id: 'crm-web', from: 'crm', to: 'web', api: 'TMF681' },
    // гроші
    { id: 'core-charging', from: 'core', to: 'charging', api: 'Nchf' },
    { id: 'core-med', from: 'core', to: 'med', api: 'CDR' },
    { id: 'med-billing', from: 'med', to: 'billing', api: 'TMF635' },
    { id: 'charging-billing', from: 'charging', to: 'billing', api: 'TMF635' },
    { id: 'charging-web', from: 'charging', to: 'web', api: 'TMF654' },
    { id: 'billing-web', from: 'billing', to: 'web', api: 'TMF678' },
    { id: 'web-payments', from: 'web', to: 'payments', api: 'TMF676' },
    { id: 'payments-billing', from: 'payments', to: 'billing', api: 'TMF676' },
  ],
};
