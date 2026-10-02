/* Шлях сертифікації PCI DSS від меж до щорічного підтвердження. Смуги — етапи
   згори донизу. У перших чотирьох колонки — потоки робіт: інфраструктура · софт ·
   безпека. Далі, де команда працює разом: робота · перевірка · результат.
   Чотири сценарії йдуть тією самою схемою (SCHEMA-PRINCIPLES §10). */
window.PATH = {
  width: 1440,
  cols: 3,
  key: ['scopesign', 'gonogo', 'roc'],
  bands: [
    { id: 'scope', groups: [
      { id: 'infra', nodes: ['inventory'] },
      { id: 'dev', nodes: ['dataflow'] },
      { id: 'sec', nodes: ['scopesign'] },
    ] },
    { id: 'gap', expandable: true, groups: [
      { id: 'g1', label: false, nodes: ['gapinfra'] },
      { id: 'g2', label: false, nodes: ['gapdev'] },
      { id: 'g3', label: false, nodes: ['gapsec'] },
    ] },
    { id: 'pm', strip: true },
    { id: 'fix', expandable: true, groups: [
      { id: 'f1', label: false, nodes: ['landing', 'migrate'] },
      { id: 'f2', label: false, nodes: ['token', 'sdlc'] },
      { id: 'f3', label: false, nodes: ['policy', 'monitor'] },
    ] },
    { id: 'proof', expandable: true, groups: [
      { id: 'p1', label: false, nodes: ['scans', 'pentest'] },
      { id: 'p2', label: false, nodes: ['codeev'] },
      { id: 'p3', label: false, nodes: ['tracker'] },
    ] },
    { id: 'ready', expandable: true, groups: [
      { id: 'work', nodes: ['fixfind'] },
      { id: 'check', nodes: ['preaudit'] },
      { id: 'result', nodes: ['gonogo'] },
    ] },
    { id: 'audit', expandable: true, groups: [
      { id: 'a1', label: false, nodes: ['findings'] },
      { id: 'a2', label: false, nodes: ['onsite'] },
      { id: 'a3', label: false, nodes: ['roc'] },
    ] },
    { id: 'run', groups: [
      { id: 'o1', label: false, nodes: ['calendar'] },
      { id: 'o2', label: false, nodes: ['rescope'] },
      { id: 'o3', label: false, nodes: ['bank'] },
    ] },
  ],
  edges: [
    // межі
    { id: 'inv-flow', from: 'inventory', to: 'dataflow', api: 'systems' },
    { id: 'flow-scope', from: 'dataflow', to: 'scopesign', api: 'where' },
    // аналіз розривів
    { id: 'scope-gapinfra', from: 'scopesign', to: 'gapinfra', api: 'scope' },
    { id: 'scope-gapdev', from: 'scopesign', to: 'gapdev', api: 'scope' },
    { id: 'scope-gapsec', from: 'scopesign', to: 'gapsec', api: 'scope' },
    // виправлення: хмара → софт → безпека
    { id: 'gapinfra-landing', from: 'gapinfra', to: 'landing', api: 'gaps' },
    { id: 'gapdev-token', from: 'gapdev', to: 'token', api: 'gaps' },
    { id: 'gapsec-policy', from: 'gapsec', to: 'policy', api: 'gaps' },
    { id: 'landing-token', from: 'landing', to: 'token', api: 'keys' },
    { id: 'token-migrate', from: 'token', to: 'migrate', api: 'nopan' },
    { id: 'policy-sdlc', from: 'policy', to: 'sdlc', api: 'rules' },
    { id: 'migrate-monitor', from: 'migrate', to: 'monitor', api: 'logs' },
    // докази
    { id: 'migrate-scans', from: 'migrate', to: 'scans', api: 'env' },
    { id: 'sdlc-codeev', from: 'sdlc', to: 'codeev', api: 'records' },
    { id: 'monitor-tracker', from: 'monitor', to: 'tracker', api: 'journals' },
    { id: 'scans-tracker', from: 'scans', to: 'tracker', api: 'reports' },
    { id: 'pentest-tracker', from: 'pentest', to: 'tracker', api: 'reports' },
    { id: 'codeev-tracker', from: 'codeev', to: 'tracker', api: 'records' },
    // готовність
    { id: 'tracker-preaudit', from: 'tracker', to: 'preaudit', api: 'evidence' },
    { id: 'preaudit-fixfind', from: 'preaudit', to: 'fixfind', api: 'holes' },
    { id: 'fixfind-tracker', from: 'fixfind', to: 'tracker', api: 'newev' },
    { id: 'preaudit-gonogo', from: 'preaudit', to: 'gonogo', api: 'ready' },
    // аудит
    { id: 'gonogo-onsite', from: 'gonogo', to: 'onsite', api: 'go' },
    { id: 'onsite-findings', from: 'onsite', to: 'findings', api: 'notin' },
    { id: 'findings-roc', from: 'findings', to: 'roc', api: 'closed' },
    { id: 'onsite-roc', from: 'onsite', to: 'roc', api: 'inplace' },
    // підтримка
    { id: 'roc-bank', from: 'roc', to: 'bank', api: 'aoc' },
    { id: 'roc-calendar', from: 'roc', to: 'calendar', api: 'rhythm' },
    { id: 'calendar-rescope', from: 'calendar', to: 'rescope', api: 'changes' },
    { id: 'calendar-scans', from: 'calendar', to: 'scans', api: 'schedule' },
    { id: 'rescope-scope', from: 'rescope', to: 'scopesign', api: 'newscope' },
  ],
};

/* human — рішення людини на кроці. */
window.PCI_FLOWS = [
  { id: 'first', steps: [
    { nodes: ['inventory', 'dataflow'], edges: ['inv-flow'] },
    { nodes: ['dataflow', 'scopesign'], edges: ['flow-scope'], human: ['scopesign'] },
    { nodes: ['scopesign', 'gapinfra', 'gapdev', 'gapsec'], edges: ['scope-gapinfra', 'scope-gapdev', 'scope-gapsec'] },
    { nodes: ['gapinfra', 'landing', 'gapsec', 'policy'], edges: ['gapinfra-landing', 'gapsec-policy'] },
    { nodes: ['landing', 'gapdev', 'token', 'policy', 'sdlc'], edges: ['landing-token', 'gapdev-token', 'policy-sdlc'] },
    { nodes: ['token', 'migrate', 'monitor'], edges: ['token-migrate', 'migrate-monitor'] },
    { nodes: ['migrate', 'scans', 'pentest', 'sdlc', 'codeev', 'monitor', 'tracker'], edges: ['migrate-scans', 'sdlc-codeev', 'monitor-tracker'] },
    { nodes: ['scans', 'pentest', 'codeev', 'tracker', 'preaudit'], edges: ['scans-tracker', 'pentest-tracker', 'codeev-tracker', 'tracker-preaudit'] },
    { nodes: ['preaudit', 'fixfind', 'tracker', 'gonogo'], edges: ['preaudit-fixfind', 'fixfind-tracker', 'preaudit-gonogo'], human: ['gonogo'] },
    { nodes: ['gonogo', 'onsite', 'roc'], edges: ['gonogo-onsite', 'onsite-roc'] },
    { nodes: ['roc', 'bank', 'calendar'], edges: ['roc-bank', 'roc-calendar'] },
  ] },
  { id: 'narrow', steps: [
    { nodes: ['inventory', 'dataflow'], edges: ['inv-flow'] },
    { nodes: ['dataflow', 'scopesign'], edges: ['flow-scope'], human: ['scopesign'] },
    { nodes: ['scopesign', 'gapdev', 'token'], edges: ['scope-gapdev', 'gapdev-token'] },
    { nodes: ['token', 'migrate'], edges: ['token-migrate'] },
    { nodes: ['migrate', 'scans', 'pentest', 'tracker'], edges: ['migrate-scans', 'scans-tracker', 'pentest-tracker'] },
    { nodes: ['tracker', 'preaudit', 'gonogo'], edges: ['tracker-preaudit', 'preaudit-gonogo'] },
  ] },
  { id: 'finding', steps: [
    { nodes: ['gonogo', 'onsite'], edges: ['gonogo-onsite'] },
    { nodes: ['onsite', 'findings'], edges: ['onsite-findings'] },
    { nodes: ['findings'], edges: [], human: ['findings'] },
    { nodes: ['findings', 'roc'], edges: ['findings-roc'] },
    { nodes: ['roc', 'bank', 'calendar'], edges: ['roc-bank', 'roc-calendar'] },
  ] },
  { id: 'annual', steps: [
    { nodes: ['calendar', 'scans', 'pentest'], edges: ['calendar-scans'] },
    { nodes: ['calendar', 'rescope'], edges: ['calendar-rescope'] },
    { nodes: ['rescope', 'scopesign'], edges: ['rescope-scope'], human: ['scopesign'] },
    { nodes: ['scans', 'pentest', 'tracker', 'preaudit'], edges: ['scans-tracker', 'pentest-tracker', 'tracker-preaudit'] },
    { nodes: ['preaudit', 'gonogo', 'onsite'], edges: ['preaudit-gonogo', 'gonogo-onsite'], human: ['gonogo'] },
    { nodes: ['onsite', 'roc', 'bank'], edges: ['onsite-roc', 'roc-bank'] },
  ] },
];
