/* Три наскрізні потоки eTOM: Fulfillment, Assurance, Billing.
   Кожен крок — вузли й дроти, які на ньому працюють. Текст кроку —
   flow.<id>.<n> у copy.csv. */
window.FLOWS = [
  { id: 'o2a', steps: [
    { nodes: ['web', 'catalog'], edges: ['web-catalog'] },
    { nodes: ['web', 'order'], edges: ['web-order'] },
    { nodes: ['order', 'som'], edges: ['order-som'] },
    { nodes: ['som', 'sinv', 'act'], edges: ['som-sinv', 'som-act'] },
    { nodes: ['act', 'core', 'ran', 'rinv'], edges: ['act-core', 'act-ran', 'act-rinv'] },
    { nodes: ['som', 'order', 'pinv', 'charging'], edges: ['som-order', 'order-pinv', 'order-charging'] },
    { nodes: ['order', 'web'], edges: ['order-web'] },
  ] },
  { id: 't2r', steps: [
    { nodes: ['ran', 'fault', 'perf'], edges: ['ran-fault', 'ran-perf'] },
    { nodes: ['fault', 'perf', 'sprob'], edges: ['fault-sprob', 'perf-sprob'] },
    { nodes: ['sprob', 'sinv'], edges: ['sprob-sinv'] },
    { nodes: ['sprob', 'crm'], edges: ['sprob-crm'] },
    { nodes: ['crm', 'web'], edges: ['crm-web'] },
    { nodes: ['sprob', 'som'], edges: ['sprob-som'] },
  ] },
  { id: 'u2c', steps: [
    { nodes: ['core', 'charging'], edges: ['core-charging'] },
    { nodes: ['charging', 'web'], edges: ['charging-web'] },
    { nodes: ['core', 'med', 'billing'], edges: ['core-med', 'med-billing'] },
    { nodes: ['charging', 'billing'], edges: ['charging-billing'] },
    { nodes: ['billing', 'web'], edges: ['billing-web'] },
    { nodes: ['web', 'payments', 'billing'], edges: ['web-payments', 'payments-billing'] },
  ] },
];
