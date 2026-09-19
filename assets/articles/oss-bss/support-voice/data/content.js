/* Структура розділів без полотна. Тексти — у copy.csv. */

/* 01 — чат проти голосу */
window.COMPARE = ['pace', 'bargein', 'input', 'identity', 'length', 'consent'];

/* 02 — дві архітектури */
window.ARCHS = ['rt', 'pipe'];

/* 04 — межі дій бота: приклад політики, не стандарт. */
window.AUTHORITY_LEVELS = ['auto', 'confirm', 'deny'];
window.AUTHORITY = [
  { id: 'disclose', level: 'auto' },
  { id: 'read', level: 'auto' },
  { id: 'ticket', level: 'auto' },
  { id: 'tariff', level: 'confirm' },
  { id: 'comp', level: 'confirm' },
  { id: 'transfer', level: 'confirm' },
  { id: 'codes', level: 'deny' },
  { id: 'sim', level: 'deny' },
  { id: 'number', level: 'deny' },
];
window.SAFETY = ['disclosure', 'identity', 'recording', 'data', 'social'];

/* 05 — якість голосу */
window.QUALITY = ['latency', 'turn', 'bargein', 'noise', 'brevity', 'voice'];

/* 06 — етапи й метрики */
window.ROLLOUT = ['prep', 'eval', 'pilot', 'expand', 'run'];
window.METRICS = ['containment', 'handoff', 'repeat', 'csat', 'ttr', 'accuracy', 'security', 'ttfa', 'interrupts', 'reprompt', 'abandon', 'earlyxfer'];
