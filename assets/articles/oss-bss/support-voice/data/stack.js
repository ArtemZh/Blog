/* Шлях дзвінка через голосового бота першої лінії. Згори — абонент і
   оператор, знизу — системи. Голосовий шар має два взаємовиключні шляхи:
   rt — «голос у голос» (Realtime API), pipe — ланцюжок розпізнавання,
   агента й синтезу. Перемикач вимикає інший шлях, не рухаючи вузли.
   Підпис дроту: номер API як є або ключ api.<id> у copy.csv. */
window.STACK = {
  width: 1440,
  cols: 3,
  key: ['trunk', 'router'],
  paths: { realtime: 'rt', stt: 'pipe', tts: 'pipe' },
  bands: [
    { id: 'people', groups: [
      { id: 'p1', label: false, nodes: ['subscriber'] },
      { id: 'p2', label: false, nodes: ['sms'] },
      { id: 'p3', label: false, nodes: ['operator'] },
    ] },
    { id: 'tel', expandable: true, groups: [
      { id: 'tl1', label: false, nodes: ['trunk'] },
      { id: 'tl2', label: false, nodes: ['record'] },
      { id: 'tl3', label: false, nodes: ['queue'] },
    ] },
    { id: 'voice', expandable: true, groups: [
      { id: 'rt', nodes: ['realtime'] },
      { id: 'pipe', nodes: ['stt', 'tts'] },
      { id: 'turns', nodes: ['turn'] },
    ] },
    { id: 'orch', expandable: true, groups: [
      { id: 'o1', label: false, nodes: ['auth'] },
      { id: 'o2', label: false, nodes: ['session', 'traces'] },
      { id: 'o3', label: false, nodes: ['handoff'] },
    ] },
    { id: 'agents', expandable: true, groups: [
      { id: 'bill', nodes: ['billagent'] },
      { id: 'tech', nodes: ['router', 'techagent'] },
      { id: 'tariff', nodes: ['tariffagent'] },
    ] },
    { id: 'guard', strip: true },
    { id: 'tools', expandable: true, groups: [
      { id: 't1', label: false, nodes: ['billtools'] },
      { id: 't2', label: false, nodes: ['nettools'] },
      { id: 't3', label: false, nodes: ['tarifftools', 'smstool'] },
    ] },
    { id: 'systems', groups: [
      { id: 's1', label: false, nodes: ['bss'] },
      { id: 's2', label: false, nodes: ['oss'] },
      { id: 's3', label: false, nodes: ['crm'] },
    ] },
  ],
  edges: [
    // вхід дзвінка
    { id: 'subscriber-trunk', from: 'subscriber', to: 'trunk', api: 'call' },
    { id: 'trunk-record', from: 'trunk', to: 'record', api: 'notice' },
    { id: 'trunk-auth', from: 'trunk', to: 'auth', api: 'number' },
    { id: 'auth-session', from: 'auth', to: 'session', api: 'verified' },
    // голос → агенти
    { id: 'trunk-realtime', from: 'trunk', to: 'realtime', api: 'SIP', path: 'rt' },
    { id: 'realtime-router', from: 'realtime', to: 'router', api: 'realtimeagent', path: 'rt' },
    { id: 'trunk-stt', from: 'trunk', to: 'stt', api: 'audio', path: 'pipe' },
    { id: 'stt-session', from: 'stt', to: 'session', api: 'text', path: 'pipe' },
    { id: 'session-router', from: 'session', to: 'router', api: 'request', path: 'pipe' },
    // агенти → голос
    { id: 'billagent-realtime', from: 'billagent', to: 'realtime', api: 'reply', path: 'rt' },
    { id: 'techagent-realtime', from: 'techagent', to: 'realtime', api: 'reply', path: 'rt' },
    { id: 'tariffagent-realtime', from: 'tariffagent', to: 'realtime', api: 'reply', path: 'rt' },
    { id: 'billagent-tts', from: 'billagent', to: 'tts', api: 'reply', path: 'pipe' },
    { id: 'techagent-tts', from: 'techagent', to: 'tts', api: 'reply', path: 'pipe' },
    { id: 'tariffagent-tts', from: 'tariffagent', to: 'tts', api: 'reply', path: 'pipe' },
    { id: 'realtime-trunk', from: 'realtime', to: 'trunk', api: 'voice', path: 'rt' },
    { id: 'tts-trunk', from: 'tts', to: 'trunk', api: 'voice', path: 'pipe' },
    { id: 'trunk-subscriber', from: 'trunk', to: 'subscriber', api: 'voice' },
    // перебивання
    { id: 'trunk-turn', from: 'trunk', to: 'turn', api: 'bargein' },
    { id: 'turn-realtime', from: 'turn', to: 'realtime', api: 'stop', path: 'rt' },
    { id: 'turn-tts', from: 'turn', to: 'tts', api: 'stop', path: 'pipe' },
    // маршрутизація й дані
    { id: 'router-billagent', from: 'router', to: 'billagent', api: 'handoff' },
    { id: 'router-techagent', from: 'router', to: 'techagent', api: 'handoff' },
    { id: 'router-tariffagent', from: 'router', to: 'tariffagent', api: 'handoff' },
    { id: 'billagent-billtools', from: 'billagent', to: 'billtools', api: 'tool' },
    { id: 'billtools-bss', from: 'billtools', to: 'bss', api: 'TMF637 · TMF678' },
    { id: 'techagent-nettools', from: 'techagent', to: 'nettools', api: 'tool' },
    { id: 'nettools-oss', from: 'nettools', to: 'oss', api: 'TMF642 · TMF656' },
    { id: 'tariffagent-billtools', from: 'tariffagent', to: 'billtools', api: 'usage' },
    { id: 'tariffagent-tarifftools', from: 'tariffagent', to: 'tarifftools', api: 'tool' },
    { id: 'tarifftools-bss', from: 'tarifftools', to: 'bss', api: 'TMF620 · TMF622' },
    { id: 'tariffagent-smstool', from: 'tariffagent', to: 'smstool', api: 'tool' },
    { id: 'smstool-sms', from: 'smstool', to: 'sms', api: 'terms' },
    // людина й журнал
    { id: 'techagent-handoff', from: 'techagent', to: 'handoff', api: 'escalate' },
    { id: 'handoff-queue', from: 'handoff', to: 'queue', api: 'summary' },
    { id: 'queue-operator', from: 'queue', to: 'operator', api: 'transfer' },
    { id: 'billagent-traces', from: 'billagent', to: 'traces', api: 'trace' },
    { id: 'tariffagent-traces', from: 'tariffagent', to: 'traces', api: 'trace' },
  ],
};

/* Сценарії. Кроки називають вузли й дроти обох шляхів: рушій підсвічує
   лише те, що належить вибраному. human — оператор, client — згода абонента. */
const IN = { nodes: ['trunk', 'realtime', 'stt', 'session', 'router'], edges: ['trunk-realtime', 'realtime-router', 'trunk-stt', 'stt-session', 'session-router'] };
const OUT = (agent) => ({
  nodes: [agent, 'realtime', 'tts', 'trunk', 'subscriber'],
  edges: [`${agent}-realtime`, `${agent}-tts`, 'realtime-trunk', 'tts-trunk', 'trunk-subscriber'],
});
const ENTRY = { nodes: ['subscriber', 'trunk', 'record', 'auth', 'session'], edges: ['subscriber-trunk', 'trunk-record', 'trunk-auth', 'auth-session'] };

window.VOICE_FLOWS = [
  { id: 'balance', steps: [
    ENTRY,
    IN,
    { nodes: ['router', 'billagent'], edges: ['router-billagent'] },
    { nodes: ['billagent', 'billtools', 'bss'], edges: ['billagent-billtools', 'billtools-bss'] },
    OUT('billagent'),
    { nodes: ['billagent', 'traces'], edges: ['billagent-traces'] },
  ] },
  { id: 'internet', steps: [
    ENTRY,
    IN,
    { nodes: ['router', 'techagent'], edges: ['router-techagent'] },
    { nodes: ['techagent', 'nettools', 'oss'], edges: ['techagent-nettools', 'nettools-oss'] },
    OUT('techagent'),
    { nodes: ['subscriber', 'trunk', 'turn', 'realtime', 'tts'], edges: ['subscriber-trunk', 'trunk-turn', 'turn-realtime', 'turn-tts'] },
    { nodes: ['techagent', 'handoff', 'queue', 'operator'], edges: ['techagent-handoff', 'handoff-queue', 'queue-operator'], human: ['operator'] },
  ] },
  { id: 'tariff', steps: [
    ENTRY,
    { nodes: IN.nodes.concat('tariffagent'), edges: IN.edges.concat('router-tariffagent') },
    { nodes: ['tariffagent', 'billtools', 'tarifftools', 'bss'], edges: ['tariffagent-billtools', 'billtools-bss', 'tariffagent-tarifftools', 'tarifftools-bss'] },
    OUT('tariffagent'),
    { nodes: ['subscriber', 'trunk', 'realtime', 'stt', 'tariffagent'], edges: ['subscriber-trunk', 'trunk-realtime', 'trunk-stt'], client: ['subscriber'] },
    { nodes: ['tariffagent', 'tarifftools', 'bss'], edges: ['tariffagent-tarifftools', 'tarifftools-bss'] },
    { nodes: ['tariffagent', 'smstool', 'sms', 'traces'], edges: ['tariffagent-smstool', 'smstool-sms', 'tariffagent-traces'] },
  ] },
];
