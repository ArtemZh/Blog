/* Структура розділів без полотна. Тексти — у copy.csv. */

/* 01 — 6 цілей і 12 вимог стандарту */
window.GOALS = [
  { id: 'net', reqs: [1, 2] },
  { id: 'data', reqs: [3, 4] },
  { id: 'vuln', reqs: [5, 6] },
  { id: 'access', reqs: [7, 8, 9] },
  { id: 'test', reqs: [10, 11] },
  { id: 'policy', reqs: [12] },
];

/* 02 — межі перевірки. Стан системи: in — у межах, conn — підключена
   або впливає на безпеку (теж у межах), out — поза межами. */
window.SCOPE_STATES = ['flat', 'seg', 'token'];
window.SCOPE_SYSTEMS = [
  { id: 'gateway', flat: 'in', seg: 'in', token: 'in' },
  { id: 'vault', flat: 'in', seg: 'in', token: 'in' },
  { id: 'txdb', flat: 'in', seg: 'in', token: 'conn' },
  { id: 'backoffice', flat: 'in', seg: 'in', token: 'out' },
  { id: 'dwh', flat: 'in', seg: 'in', token: 'out' },
  { id: 'crm', flat: 'in', seg: 'conn', token: 'out' },
  { id: 'cicd', flat: 'conn', seg: 'conn', token: 'conn' },
  { id: 'logs', flat: 'conn', seg: 'conn', token: 'conn' },
  { id: 'devpc', flat: 'conn', seg: 'out', token: 'out' },
  { id: 'office', flat: 'conn', seg: 'out', token: 'out' },
];

/* 03 — хто веде вимогу: L — веде, H — допомагає. cloud: P — закриває
   провайдер хмари, S — спільно, O — повністю ми. */
window.ROLES = ['infra', 'dev', 'sec', 'pm'];
window.MATRIX = [
  { n: 1, infra: 'L', sec: 'H', cloud: 'S' },
  { n: 2, infra: 'L', dev: 'H', sec: 'H', cloud: 'S' },
  { n: 3, dev: 'L', infra: 'H', sec: 'H', cloud: 'S' },
  { n: 4, infra: 'L', dev: 'H', cloud: 'S' },
  { n: 5, infra: 'L', sec: 'H', cloud: 'O' },
  { n: 6, dev: 'L', infra: 'H', sec: 'H', cloud: 'S' },
  { n: 7, sec: 'L', infra: 'H', dev: 'H', cloud: 'O' },
  { n: 8, infra: 'L', sec: 'H', dev: 'H', cloud: 'S' },
  { n: 9, sec: 'L', cloud: 'P' },
  { n: 10, sec: 'L', infra: 'H', dev: 'H', cloud: 'S' },
  { n: 11, sec: 'L', infra: 'H', dev: 'H', cloud: 'S' },
  { n: 12, sec: 'L', pm: 'H', cloud: 'O' },
];

/* 04 — порядок робіт: шість етапів, чотири доріжки. crit — критичний шлях. */
window.ORDER_COLS = 6;
window.ORDER = [
  { id: 'inv', lane: 0, from: 1, to: 2 },
  { id: 'landing', lane: 0, from: 3, to: 3, crit: true },
  { id: 'migrate', lane: 0, from: 4, to: 4, crit: true },
  { id: 'scan', lane: 0, from: 5, to: 5, crit: true },
  { id: 'flow', lane: 1, from: 1, to: 2 },
  { id: 'token', lane: 1, from: 3, to: 4, crit: true },
  { id: 'sdlc', lane: 1, from: 5, to: 5 },
  { id: 'qsa', lane: 2, from: 1, to: 1 },
  { id: 'policy', lane: 2, from: 2, to: 4 },
  { id: 'monitor', lane: 2, from: 5, to: 5, crit: true },
  { id: 'pentest', lane: 2, from: 6, to: 6, crit: true },
  { id: 'scope', lane: 3, from: 1, to: 2, crit: true },
  { id: 'plan', lane: 3, from: 3, to: 3 },
  { id: 'tracker', lane: 3, from: 4, to: 5 },
  { id: 'audit', lane: 3, from: 6, to: 6, crit: true },
];

/* 06 — три потоки робіт */
window.STREAMS = {
  infra: ['landing', 'segment', 'keys', 'access', 'logs', 'patch'],
  dev: ['nosad', 'pan', 'nolog', 'sdlc', 'web', 'env'],
  sec: ['policy', 'risk', 'monitor', 'tests', 'people', 'tpsp'],
};

/* 07 — види доказів, «годинник доказів», календар відповідності */
window.EVIDENCE = ['doc', 'config', 'record', 'talk'];
window.CLOCK = ['asv', 'internal', 'segtest', 'fw', 'access', 'pentest', 'logs'];
window.RHYTHM = [
  { id: 'daily', items: ['logreview'] },
  { id: 'weekly', items: ['tamper'] },
  { id: 'monthly', items: ['patch'] },
  { id: 'quarter', items: ['asv', 'internal', 'people'] },
  { id: 'half', items: ['fw', 'access', 'segtest', 'scope'] },
  { id: 'year', items: ['pentest', 'ir', 'train', 'tpsp', 'roc'] },
  { id: 'change', items: ['change'] },
];

/* 08 — аудит */
window.AUDIT = ['kickoff', 'docs', 'tech', 'people', 'gaps', 'report'];
window.OUTCOMES = ['inplace', 'comp', 'custom'];

/* 09 — ризики PM */
window.RISKS = ['creep', 'lateqsa', 'tpsp', 'noproof', 'oneman', 'drift'];

/* 10 — кейси */
window.CASES = ['target', 'ba', 'heartland'];
