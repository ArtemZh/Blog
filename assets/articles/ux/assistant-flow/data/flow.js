/* Схема 2 — потік асистента: джерела → приймання → розбір людиною → записи → виходи.
   Смуги йдуть згори вниз. «Приймання» читається зліва направо, «Розбір» — справа
   наліво (змійкою): так імпорт стоїть просто над сторінкою, де пропозиції розбирають,
   і довгого дроту-повернення через усе полотно немає.
   Праві колонки — місток до плану: файл плану, зв'язки записів із його задачами
   й ризиками, коментарі до його об'єктів, «Артефакти» як спільний зміст.
   Позиції рахує рушій; порядок дротів задає доріжки в жолобах. Смуги не згортаються. */
window.FLOW = {
  width: 1560,
  cols: 5,
  key: ['i-agent', 'h-save'],
  bands: [
    { id: 'src', groups: [
      { id: 's0', label: false, nodes: ['s-meet', 's-doc'] },
      { id: 's1', label: false, nodes: ['s-mail', 's-chat'] },
      { id: 's3', label: false, col: 3, nodes: ['s-jira'] },
      { id: 's4', label: false, col: 4, nodes: ['s-plan'] },
    ] },
    { id: 'intake', groups: [
      { id: 'i1', label: false, col: 1, nodes: ['i-pickup'] },
      { id: 'i2', label: false, col: 2, nodes: ['i-agent'] },
      { id: 'i3', label: false, col: 3, nodes: ['i-draft'] },
      { id: 'i4', label: false, col: 4, nodes: ['i-import', 'i-jira'] },
    ] },
    { id: 'review', groups: [
      { id: 'h0', label: false, nodes: ['h-rest'] },
      { id: 'h1', label: false, nodes: ['h-save'] },
      { id: 'h2', label: false, nodes: ['h-switch', 'h-fix'] },
      { id: 'h3', label: false, nodes: ['h-groups'] },
      { id: 'h4', label: false, nodes: ['h-meeting', 'h-inbox'] },
    ] },
    { id: 'rec', groups: [
      { id: 'r0', label: false, nodes: ['r-m'] },
      { id: 'r1', label: false, nodes: ['r-q', 'r-p'] },
      { id: 'r2', label: false, nodes: ['r-d', 'r-t', 'r-r'] },
      { id: 'r3', label: false, nodes: ['r-c', 'r-j'] },
      { id: 'r4', label: false, nodes: ['r-jira', 'r-links'] },
    ] },
    { id: 'out', groups: [
      { id: 'o0', label: false, nodes: ['o-agenda', 'o-tool'] },
      { id: 'o2', label: false, col: 2, nodes: ['o-today'] },
      { id: 'o3', label: false, col: 3, nodes: ['o-check'] },
      { id: 'o4', label: false, col: 4, nodes: ['o-doc', 'o-art'] },
    ] },
  ],
  edges: [
    // джерела → приймання
    { id: 'meet-pickup', from: 's-meet', to: 'i-pickup', api: 'moves' },
    { id: 'pickup-agent', from: 'i-pickup', to: 'i-agent', api: 'reads' },
    { id: 'mail-agent', from: 's-mail', to: 'i-agent', api: 'readonly' },
    { id: 'chat-agent', from: 's-chat', to: 'i-agent', api: 'readonly' },
    { id: 'doc-agent', from: 's-doc', to: 'i-agent', api: 'reads' },
    { id: 'agent-draft', from: 'i-agent', to: 'i-draft', api: 'writes' },
    { id: 'draft-import', from: 'i-draft', to: 'i-import', api: 'checks' },
    { id: 'jira-import', from: 's-jira', to: 'i-jira', api: 'csv' },
    // приймання → розбір
    { id: 'import-meeting', from: 'i-import', to: 'h-meeting', api: 'proposed' },
    { id: 'import-inbox', from: 'i-import', to: 'h-inbox', api: 'proposed' },
    { id: 'meeting-groups', from: 'h-meeting', to: 'h-groups', api: 'shows' },
    { id: 'inbox-groups', from: 'h-inbox', to: 'h-groups', api: 'shows' },
    { id: 'groups-switch', from: 'h-groups', to: 'h-switch', api: 'choice' },
    { id: 'groups-fix', from: 'h-groups', to: 'h-fix', api: 'edits' },
    { id: 'switch-save', from: 'h-switch', to: 'h-save', api: 'once' },
    { id: 'save-rest', from: 'h-save', to: 'h-rest', api: 'keepdrop' },
    // розбір → записи
    { id: 'save-q', from: 'h-save', to: 'r-q', api: 'creates' },
    { id: 'save-d', from: 'h-save', to: 'r-d', api: 'creates' },
    { id: 'save-t', from: 'h-save', to: 'r-t', api: 'creates' },
    { id: 'save-r', from: 'h-save', to: 'r-r', api: 'creates' },
    { id: 'save-p', from: 'h-save', to: 'r-p', api: 'creates' },
    { id: 'save-j', from: 'h-save', to: 'r-j', api: 'logs' },
    { id: 'fix-q', from: 'h-fix', to: 'r-q', api: 'discuss' },
    { id: 'pickup-m', from: 'i-pickup', to: 'r-m', api: 'awaiting' },
    { id: 'jira-mirror', from: 'i-jira', to: 'r-jira', api: 'mirror' },
    // питання → рішення й задачі
    { id: 'q-d', from: 'r-q', to: 'r-d', api: 'resolve' },
    { id: 'q-t', from: 'r-q', to: 'r-t', api: 'qtask' },
    // місток «план ↔ база»
    { id: 'plan-links', from: 's-plan', to: 'r-links', api: 'link' },
    { id: 'plan-c', from: 's-plan', to: 'r-c', api: 'plancomment' },
    { id: 'plan-art', from: 's-plan', to: 'o-art', api: 'registers' },
    // записи → виходи
    { id: 'q-tool', from: 'r-q', to: 'o-tool', api: 'onrequest' },
    { id: 'q-agenda', from: 'r-q', to: 'o-agenda', api: 'openq' },
    { id: 'm-agenda', from: 'r-m', to: 'o-agenda', api: 'nextmeeting' },
    { id: 't-today', from: 'r-t', to: 'o-today', api: 'due' },
    { id: 'q-today', from: 'r-q', to: 'o-today', api: 'waiting' },
    { id: 'd-check', from: 'r-d', to: 'o-check', api: 'allowed' },
    { id: 't-check', from: 'r-t', to: 'o-check', api: 'allowed' },
    { id: 'r-check', from: 'r-r', to: 'o-check', api: 'allowed' },
    { id: 'm-check', from: 'r-m', to: 'o-check', api: 'summary' },
    { id: 'check-doc', from: 'o-check', to: 'o-doc', api: 'issues' },
    { id: 'doc-art', from: 'o-doc', to: 'o-art', api: 'listed' },
  ],
};

/* Сценарії. human — крок, де рішення за людиною (позначка словом на картці). */
window.FLOW_FLOWS = [
  { id: 'meeting', steps: [
    { nodes: ['s-meet', 'i-pickup'], edges: ['meet-pickup'], human: ['i-pickup'] },
    { nodes: ['i-pickup', 'r-m'], edges: ['pickup-m'] },
    { nodes: ['i-pickup', 'i-agent', 'i-draft'], edges: ['pickup-agent', 'agent-draft'] },
    { nodes: ['i-draft', 'i-import', 'h-meeting'], edges: ['draft-import', 'import-meeting'] },
    { nodes: ['h-meeting', 'h-groups', 'h-switch'], edges: ['meeting-groups', 'groups-switch'], human: ['h-switch'] },
    { nodes: ['h-switch', 'h-save', 'h-rest'], edges: ['switch-save', 'save-rest'], human: ['h-save'] },
    { nodes: ['h-save', 'r-d', 'r-t', 'r-q', 'r-r', 'r-j'], edges: ['save-d', 'save-t', 'save-q', 'save-r', 'save-j'] },
  ] },
  { id: 'mail', steps: [
    { nodes: ['s-mail', 's-chat', 's-doc', 'i-agent'], edges: ['mail-agent', 'chat-agent', 'doc-agent'] },
    { nodes: ['i-agent', 'i-draft', 'i-import'], edges: ['agent-draft', 'draft-import'] },
    { nodes: ['i-import', 'h-inbox', 'h-groups'], edges: ['import-inbox', 'inbox-groups'] },
    { nodes: ['h-groups', 'h-switch', 'h-fix'], edges: ['groups-switch', 'groups-fix'], human: ['h-switch', 'h-fix'] },
    { nodes: ['h-switch', 'h-save', 'r-d', 'r-t', 'r-p'], edges: ['switch-save', 'save-d', 'save-t', 'save-p'], human: ['h-save'] },
  ] },
  { id: 'question', steps: [
    { nodes: ['h-fix', 'r-q'], edges: ['fix-q'], human: ['h-fix'] },
    { nodes: ['r-q', 'r-m', 'o-agenda'], edges: ['q-agenda', 'm-agenda'] },
    { nodes: ['r-q', 'o-tool'], edges: ['q-tool'] },
    { nodes: ['r-q', 'r-d'], edges: ['q-d'], human: ['r-d'] },
    { nodes: ['r-q', 'r-t', 'o-today'], edges: ['q-t', 't-today'] },
  ] },
  { id: 'client', steps: [
    { nodes: ['r-d', 'r-t', 'o-check'], edges: ['d-check', 't-check'] },
    { nodes: ['o-check'], edges: [] },
    { nodes: ['o-check', 'o-doc'], edges: ['check-doc'] },
    { nodes: ['o-doc', 'o-art'], edges: ['doc-art'], human: ['o-art'] },
  ] },
  { id: 'bridge', steps: [
    { nodes: ['s-plan', 'r-links'], edges: ['plan-links'], human: ['r-links'] },
    { nodes: ['s-plan', 'r-c'], edges: ['plan-c'] },
    { nodes: ['s-plan', 'o-art', 'o-doc'], edges: ['plan-art', 'doc-art'] },
    { nodes: ['s-jira', 'i-jira', 'r-jira'], edges: ['jira-import', 'jira-mirror'] },
  ] },
  { id: 'roles', steps: [
    { nodes: ['i-agent', 'i-draft', 'i-import'], edges: ['agent-draft', 'draft-import'] },
    { nodes: ['i-agent', 'o-tool'], edges: [] },
    { nodes: ['i-pickup', 'h-switch', 'h-fix', 'h-save'], edges: [], human: ['i-pickup', 'h-switch', 'h-fix', 'h-save'] },
    { nodes: ['r-q', 'r-d'], edges: ['q-d'], human: ['r-d'] },
    { nodes: ['o-check', 'o-doc'], edges: ['check-doc'] },
  ] },
];

/* Додаток до хмарки: who — хто це робить (ключ тексту pop.who.*). */
window.FLOW_INFO = {
  's-meet': { who: 'human' }, 's-mail': { who: 'human' }, 's-chat': { who: 'human' }, 's-doc': { who: 'human' },
  's-jira': { who: 'human' }, 's-plan': { who: 'app' },
  'i-pickup': { who: 'human' }, 'i-agent': { who: 'agent' }, 'i-draft': { who: 'agent' }, 'i-import': { who: 'agent' }, 'i-jira': { who: 'both' },
  'h-meeting': { who: 'human' }, 'h-inbox': { who: 'human' }, 'h-groups': { who: 'app' }, 'h-switch': { who: 'human' },
  'h-fix': { who: 'human' }, 'h-save': { who: 'human' }, 'h-rest': { who: 'app' },
  'r-q': { who: 'base' }, 'r-d': { who: 'base' }, 'r-t': { who: 'base' }, 'r-r': { who: 'base' }, 'r-m': { who: 'base' },
  'r-p': { who: 'base' }, 'r-c': { who: 'base' }, 'r-j': { who: 'base' }, 'r-jira': { who: 'base' }, 'r-links': { who: 'base' },
  'o-tool': { who: 'agent' }, 'o-agenda': { who: 'app' }, 'o-today': { who: 'app' }, 'o-check': { who: 'app' },
  'o-doc': { who: 'app' }, 'o-art': { who: 'human' },
};
