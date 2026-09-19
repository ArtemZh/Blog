/* Структура розділів без полотна. Тексти — у copy.csv. */

/* 02 — життєві цикли: кожен — своя схема (form) і кроки в описі */
window.LIFECYCLES = [
  { id: 'fpr', form: 'line', steps: ['request', 'docs', 'build', 'beta', 'deploy'] },
  { id: 'da', form: 'explore', steps: ['envision', 'build', 'deploy', 'observe', 'productize'] },
  { id: 'devops', form: 'infinity', steps: ['plan', 'design', 'code', 'test', 'deploy', 'operate', 'support', 'monitor'] },
  { id: 'itil', form: 'wheel', steps: ['strategy', 'design', 'transition', 'operation', 'csi'] },
];

/* 02 — підходи: що це і де в ньому реліз */
window.APPROACHES = ['pmbok', 'prince2', 'da', 'safe', 'devops', 'sre', 'itil', 'iso', 'cobit'];

/* 03 — хто робить роботу реліз-менеджера */
window.ROLE_METHODS = ['scrum', 'kanban', 'safe', 'da', 'predictive', 'itil'];

/* 04 — календар: тижні 1–9, відрізки на доріжках */
window.CAL_WEEKS = 9;
window.CALENDAR = [
  { id: 'dev', lane: 0, from: 1, to: 5 },
  { id: 'freeze', lane: 1, from: 5, to: 7 },
  { id: 'uat', lane: 0, from: 5, to: 7 },
  { id: 'rrr', lane: 2, from: 6, to: 7 },
  { id: 'gonogo', lane: 2, from: 7, to: 8 },
  { id: 'window', lane: 1, from: 7, to: 8 },
  { id: 'hyper', lane: 0, from: 7, to: 9 },
  { id: 'blackout', lane: 1, from: 8, to: 10 },
];

/* 05 — SemVer: зміна → правильна цифра */
window.SEMVER = [
  { id: 'bug', ans: 'patch' },
  { id: 'field', ans: 'minor' },
  { id: 'remove', ans: 'major' },
  { id: 'sec', ans: 'patch' },
  { id: 'format', ans: 'major' },
];

/* 05 — стратегії. slider: що означає повзунок */
window.STRATEGIES = [
  { id: 'rolling', slider: true, def: 3 },
  { id: 'bluegreen', slider: false },
  { id: 'canary', slider: true, def: 1 },
  { id: 'flags', slider: true, def: 2 },
  { id: 'ab', slider: false },
];

/* 06 — готовність */
window.READY = ['freeze', 'alpha', 'beta', 'uat', 'rrr', 'gonogo'];
window.TEST_LEVELS = ['unit', 'integration', 'system', 'acceptance'];
window.TEST_TYPES = ['regression', 'load', 'security', 'usability', 'compat', 'l10n'];

/* 08 — документи за етапом */
window.DOCS = {
  before: ['fpr', 'spec', 'plan', 'scope', 'risk', 'rollback', 'people', 'comms'],
  during: ['runbook', 'checklist', 'gonogo', 'status'],
  after: ['notes', 'changelog', 'report', 'postmortem', 'known'],
};

/* 09 — DORA: дві групи */
window.DORA = {
  throughput: ['leadtime', 'deployfreq', 'recovery'],
  instability: ['cfr', 'rework'],
};

/* 10 — кейси */
window.CASES = ['crowdstrike', 'knight', 'chrome', 'inovytec'];

/* 11 — діяльність і інструменти */
window.ACTIVITY = ['facilitate', 'change', 'stakeholders', 'incident', 'improve', 'teach'];
window.TOOLS = ['ci', 'cd', 'iac', 'flags', 'observe', 'track', 'comms'];
