/* Покриття ландшафту вендорами. Не рейтинг: лише «є продукт у портфелі»
   (full) чи «частково / через партнерів» (part).
   Канали й мережа — контекст: їх не підсвічуємо, про обладнання каже картка. Продукти — у copy.csv
   за ключами vendor.<id>.*. Джерела — PLAN-CONTEXT.md §7. */
window.VENDORS = [
  { id: 'ericsson',
    full: ['catalog', 'order', 'pinv', 'charging', 'billing', 'som', 'sinv', 'act', 'fault', 'perf', 'sprob', 'rinv', 'med'],
    part: ['crm', 'payments'] },
  { id: 'nokia',
    full: ['som', 'sinv', 'act', 'fault', 'perf', 'sprob', 'rinv'],
    part: [] },
  { id: 'huawei',
    full: ['catalog', 'crm', 'order', 'pinv', 'charging', 'billing', 'payments', 'som', 'act', 'fault', 'perf', 'sprob', 'rinv'],
    part: ['sinv', 'med'] },
  { id: 'amdocs',
    full: ['catalog', 'crm', 'order', 'pinv', 'charging', 'billing', 'payments', 'som', 'sinv', 'act', 'sprob', 'rinv', 'med'],
    part: ['fault', 'perf'] },
  { id: 'netcracker',
    full: ['catalog', 'crm', 'order', 'pinv', 'charging', 'billing', 'payments', 'som', 'sinv', 'act', 'sprob', 'perf', 'rinv', 'med'],
    part: ['fault'] },
];
