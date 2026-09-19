/* Шлях релізу від обсягу до розбору. Смуги — етапи згори донизу, три колонки
   наскрізь: що змінюється · чим перевіряємо · хто вирішує (SCHEMA-PRINCIPLES §3).
   Три сценарії йдуть тією самою схемою: звичайний реліз, hotfix, регульований. */
window.PATH = {
  width: 1440,
  cols: 3,
  key: ['gonogo'],
  bands: [
    { id: 'plan', groups: [
      { id: 'what', nodes: ['scope'] },
      { id: 'check', nodes: ['window'] },
      { id: 'decide', nodes: ['deps'] },
    ] },
    { id: 'build', expandable: true, groups: [
      { id: 'b1', label: false, nodes: ['branch', 'hotfix'] },
      { id: 'b2', label: false, nodes: ['ci'] },
      { id: 'b3', label: false, nodes: ['freeze'] },
    ] },
    { id: 'test', expandable: true, groups: [
      { id: 't1', label: false, nodes: ['systest'] },
      { id: 't2', label: false, nodes: ['nonfunc'] },
      { id: 't3', label: false, nodes: ['uat'] },
    ] },
    { id: 'ready', expandable: true, groups: [
      { id: 'r1', label: false, nodes: ['notes', 'evidence'] },
      { id: 'r2', label: false, nodes: ['rrr'] },
      { id: 'r3', label: false, nodes: ['gonogo'] },
    ] },
    { id: 'rollback', strip: true },
    { id: 'deploy', expandable: true, groups: [
      { id: 'd1', label: false, nodes: ['deploy'] },
      { id: 'd2', label: false, nodes: ['canary'] },
      { id: 'd3', label: false, nodes: ['release'] },
    ] },
    { id: 'run', groups: [
      { id: 'o1', label: false, nodes: ['monitor'] },
      { id: 'o2', label: false, nodes: ['incident'] },
      { id: 'o3', label: false, nodes: ['review'] },
    ] },
  ],
  edges: [
    // звичайний реліз
    { id: 'scope-branch', from: 'scope', to: 'branch', api: 'scope' },
    { id: 'window-freeze', from: 'window', to: 'freeze', api: 'date' },
    { id: 'deps-rrr', from: 'deps', to: 'rrr', api: 'risks' },
    { id: 'branch-ci', from: 'branch', to: 'ci', api: 'commit' },
    { id: 'ci-freeze', from: 'ci', to: 'freeze', api: 'build' },
    { id: 'freeze-systest', from: 'freeze', to: 'systest', api: 'rc' },
    { id: 'systest-nonfunc', from: 'systest', to: 'nonfunc', api: 'pass' },
    { id: 'nonfunc-uat', from: 'nonfunc', to: 'uat', api: 'pass' },
    { id: 'uat-rrr', from: 'uat', to: 'rrr', api: 'signoff' },
    { id: 'notes-rrr', from: 'notes', to: 'rrr', api: 'docs' },
    { id: 'rrr-gonogo', from: 'rrr', to: 'gonogo', api: 'ready' },
    { id: 'gonogo-deploy', from: 'gonogo', to: 'deploy', api: 'go' },
    { id: 'deploy-canary', from: 'deploy', to: 'canary', api: 'flagoff' },
    { id: 'canary-release', from: 'canary', to: 'release', api: 'metrics' },
    { id: 'canary-incident', from: 'canary', to: 'incident', api: 'rollback' },
    { id: 'release-monitor', from: 'release', to: 'monitor', api: 'live' },
    { id: 'monitor-review', from: 'monitor', to: 'review', api: 'dora' },
    // hotfix
    { id: 'monitor-incident', from: 'monitor', to: 'incident', api: 'alert' },
    { id: 'incident-hotfix', from: 'incident', to: 'hotfix', api: 'fix' },
    { id: 'hotfix-ci', from: 'hotfix', to: 'ci', api: 'commit' },
    { id: 'ci-systest', from: 'ci', to: 'systest', api: 'smoke' },
    { id: 'systest-gonogo', from: 'systest', to: 'gonogo', api: 'regress' },
    { id: 'incident-review', from: 'incident', to: 'review', api: 'postmortem' },
    // регульований реліз
    { id: 'ci-evidence', from: 'ci', to: 'evidence', api: 'static' },
    { id: 'uat-evidence', from: 'uat', to: 'evidence', api: 'records' },
    { id: 'evidence-rrr', from: 'evidence', to: 'rrr', api: 'dossier' },
  ],
};

/* human — рішення людини на кроці. */
window.RELEASE_FLOWS = [
  { id: 'normal', steps: [
    { nodes: ['scope', 'window', 'deps'], edges: [] },
    { nodes: ['scope', 'branch', 'ci'], edges: ['scope-branch', 'branch-ci'] },
    { nodes: ['window', 'ci', 'freeze'], edges: ['window-freeze', 'ci-freeze'] },
    { nodes: ['freeze', 'systest', 'nonfunc', 'uat'], edges: ['freeze-systest', 'systest-nonfunc', 'nonfunc-uat'] },
    { nodes: ['uat', 'notes', 'deps', 'rrr'], edges: ['uat-rrr', 'notes-rrr', 'deps-rrr'] },
    { nodes: ['rrr', 'gonogo'], edges: ['rrr-gonogo'], human: ['gonogo'] },
    { nodes: ['gonogo', 'deploy', 'canary'], edges: ['gonogo-deploy', 'deploy-canary'] },
    { nodes: ['canary', 'release', 'incident'], edges: ['canary-release', 'canary-incident'], human: ['release'] },
    { nodes: ['release', 'monitor', 'review'], edges: ['release-monitor', 'monitor-review'] },
  ] },
  { id: 'hotfix', steps: [
    { nodes: ['monitor', 'incident'], edges: ['monitor-incident'] },
    { nodes: ['incident', 'hotfix'], edges: ['incident-hotfix'], human: ['incident'] },
    { nodes: ['hotfix', 'ci', 'systest'], edges: ['hotfix-ci', 'ci-systest'] },
    { nodes: ['systest', 'gonogo'], edges: ['systest-gonogo'], human: ['gonogo'] },
    { nodes: ['gonogo', 'deploy', 'canary', 'release'], edges: ['gonogo-deploy', 'deploy-canary', 'canary-release'] },
    { nodes: ['release', 'monitor'], edges: ['release-monitor'] },
    { nodes: ['incident', 'review'], edges: ['incident-review'] },
  ] },
  { id: 'regulated', steps: [
    { nodes: ['scope', 'window', 'deps'], edges: [] },
    { nodes: ['scope', 'branch', 'ci', 'evidence'], edges: ['scope-branch', 'branch-ci', 'ci-evidence'] },
    { nodes: ['ci', 'freeze', 'systest', 'nonfunc', 'uat'], edges: ['ci-freeze', 'freeze-systest', 'systest-nonfunc', 'nonfunc-uat'] },
    { nodes: ['uat', 'evidence'], edges: ['uat-evidence'] },
    { nodes: ['evidence', 'notes', 'rrr'], edges: ['evidence-rrr', 'notes-rrr'] },
    { nodes: ['rrr', 'gonogo'], edges: ['rrr-gonogo'], human: ['gonogo'] },
    { nodes: ['gonogo', 'deploy', 'canary', 'release'], edges: ['gonogo-deploy', 'deploy-canary', 'canary-release'] },
    { nodes: ['release', 'monitor', 'review'], edges: ['release-monitor', 'monitor-review'] },
  ] },
];
