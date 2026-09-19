/* Структура розділів без полотна. Тексти — у copy.csv. */

/* 01 — теми звернень за тим, що бот робить. mode: answer | explain | confirm | human */
window.TOPIC_MODES = ['answer', 'explain', 'confirm', 'human'];
window.TOPICS = [
  { id: 'balance', mode: 'answer' },
  { id: 'terms', mode: 'answer' },
  { id: 'charges', mode: 'explain' },
  { id: 'internet', mode: 'explain' },
  { id: 'change', mode: 'confirm' },
  { id: 'comp', mode: 'confirm' },
  { id: 'sim', mode: 'human' },
];

/* 04 — межі дій бота: приклад політики, не стандарт. */
window.AUTHORITY_LEVELS = ['auto', 'confirm', 'deny'];
window.AUTHORITY = [
  { id: 'read', level: 'auto' },
  { id: 'kb', level: 'auto' },
  { id: 'ticket', level: 'auto' },
  { id: 'tariff', level: 'confirm' },
  { id: 'comp', level: 'confirm' },
  { id: 'addon', level: 'confirm' },
  { id: 'sim', level: 'deny' },
  { id: 'owner', level: 'deny' },
  { id: 'unauth', level: 'deny' },
];

/* 04 — чотири картки безпеки */
window.SAFETY = ['identity', 'injection', 'guardrails', 'data'];

/* 05 — етапи впровадження */
window.ROLLOUT = ['prep', 'eval', 'pilot', 'expand', 'run'];

/* 06 — метрики */
window.METRICS = ['containment', 'handoff', 'repeat', 'csat', 'ttr', 'accuracy', 'security'];
