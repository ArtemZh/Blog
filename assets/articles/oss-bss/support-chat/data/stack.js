/* Архітектура текстового бота підтримки. Згори — канали й люди, знизу —
   системи оператора. Три колонки наскрізь = три сценарії:
   рахунки · техпідтримка · тарифи (SCHEMA-PRINCIPLES §3).
   Підпис дроту: номер API як є або ключ api.<id> у copy.csv. */
window.STACK = {
  width: 1440,
  cols: 3,
  key: ['router', 'session'],
  bands: [
    { id: 'channels', groups: [
      { id: 'c1', label: false, nodes: ['client'] },
      { id: 'c2', label: false, nodes: ['messenger'] },
      { id: 'c3', label: false, nodes: ['operator'] },
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
      { id: 't2', label: false, nodes: ['nettools', 'kb'] },
      { id: 't3', label: false, nodes: ['tarifftools', 'tickettool'] },
    ] },
    { id: 'systems', groups: [
      { id: 's1', label: false, nodes: ['bss'] },
      { id: 's2', label: false, nodes: ['oss', 'kbdocs'] },
      { id: 's3', label: false, nodes: ['crm'] },
    ] },
  ],
  edges: [
    // вхід і маршрутизація — спільні для всіх сценаріїв
    { id: 'client-auth', from: 'client', to: 'auth', api: 'session' },
    { id: 'messenger-auth', from: 'messenger', to: 'auth', api: 'otp' },
    { id: 'auth-session', from: 'auth', to: 'session', api: 'verified' },
    { id: 'session-router', from: 'session', to: 'router', api: 'request' },
    // A — рахунки
    { id: 'router-billagent', from: 'router', to: 'billagent', api: 'handoff' },
    { id: 'billagent-billtools', from: 'billagent', to: 'billtools', api: 'tool' },
    { id: 'billtools-bss', from: 'billtools', to: 'bss', api: 'TMF678 · TMF635' },
    { id: 'billagent-client', from: 'billagent', to: 'client', api: 'answer' },
    { id: 'billagent-handoff', from: 'billagent', to: 'handoff', api: 'threshold' },
    { id: 'handoff-operator', from: 'handoff', to: 'operator', api: 'context' },
    // рішення людини повертається тим самим шляхом — у чат, звідки питали
    { id: 'operator-handoff', from: 'operator', to: 'handoff', api: 'decision' },
    { id: 'handoff-billagent', from: 'handoff', to: 'billagent', api: 'decision' },
    { id: 'billagent-traces', from: 'billagent', to: 'traces', api: 'trace' },
    // B — техпідтримка
    { id: 'router-techagent', from: 'router', to: 'techagent', api: 'handoff' },
    { id: 'techagent-nettools', from: 'techagent', to: 'nettools', api: 'tool' },
    { id: 'nettools-oss', from: 'nettools', to: 'oss', api: 'TMF642 · TMF656' },
    { id: 'techagent-kb', from: 'techagent', to: 'kb', api: 'filesearch' },
    { id: 'kb-kbdocs', from: 'kb', to: 'kbdocs', api: 'vector' },
    { id: 'techagent-messenger', from: 'techagent', to: 'messenger', api: 'steps' },
    { id: 'techagent-tickettool', from: 'techagent', to: 'tickettool', api: 'tool' },
    { id: 'tickettool-crm', from: 'tickettool', to: 'crm', api: 'TMF621' },
    { id: 'techagent-handoff', from: 'techagent', to: 'handoff', api: 'escalate' },
    { id: 'handoff-techagent', from: 'handoff', to: 'techagent', api: 'reply' },
    // C — тарифи
    { id: 'router-tariffagent', from: 'router', to: 'tariffagent', api: 'handoff' },
    { id: 'tariffagent-billtools', from: 'tariffagent', to: 'billtools', api: 'usage' },
    { id: 'tariffagent-tarifftools', from: 'tariffagent', to: 'tarifftools', api: 'tool' },
    { id: 'tarifftools-bss', from: 'tarifftools', to: 'bss', api: 'TMF620 · TMF622' },
    { id: 'tariffagent-client', from: 'tariffagent', to: 'client', api: 'offer' },
    { id: 'tariffagent-handoff', from: 'tariffagent', to: 'handoff', api: 'approve' },
    { id: 'handoff-tariffagent', from: 'handoff', to: 'tariffagent', api: 'decision' },
    { id: 'client-tariffagent', from: 'client', to: 'tariffagent', api: 'consent' },
    { id: 'tariffagent-traces', from: 'tariffagent', to: 'traces', api: 'trace' },
  ],
};

/* Сценарії. human — рішення оператора, client — згода самого клієнта. */
window.CHAT_FLOWS = [
  { id: 'bill', level: 'L2', steps: [
    { nodes: ['client', 'auth'], edges: ['client-auth'] },
    { nodes: ['auth', 'session', 'router'], edges: ['auth-session', 'session-router'] },
    { nodes: ['router', 'billagent'], edges: ['router-billagent'] },
    { nodes: ['billagent', 'billtools', 'bss'], edges: ['billagent-billtools', 'billtools-bss'] },
    { nodes: ['billagent', 'client'], edges: ['billagent-client'] },
    { nodes: ['billagent', 'handoff', 'operator'], edges: ['billagent-handoff', 'handoff-operator'], human: ['operator'] },
    { nodes: ['billagent', 'traces'], edges: ['billagent-traces'] },
    // оператор вирішує, відповідь — у той самий чат застосунку
    { nodes: ['operator', 'handoff', 'billagent', 'client'], edges: ['operator-handoff', 'handoff-billagent', 'billagent-client'], human: ['operator'] },
  ] },
  { id: 'tech', level: 'L2', steps: [
    { nodes: ['messenger', 'auth'], edges: ['messenger-auth'] },
    { nodes: ['auth', 'session', 'router'], edges: ['auth-session', 'session-router'] },
    { nodes: ['router', 'techagent'], edges: ['router-techagent'] },
    { nodes: ['techagent', 'nettools', 'oss'], edges: ['techagent-nettools', 'nettools-oss'] },
    { nodes: ['techagent', 'kb', 'kbdocs', 'messenger'], edges: ['techagent-kb', 'kb-kbdocs', 'techagent-messenger'] },
    { nodes: ['techagent', 'tickettool', 'crm'], edges: ['techagent-tickettool', 'tickettool-crm'] },
    { nodes: ['techagent', 'handoff', 'operator'], edges: ['techagent-handoff', 'handoff-operator'], human: ['operator'] },
    // оператор пише живцем у той самий чат месенджера, не телефоном
    { nodes: ['operator', 'handoff', 'techagent', 'messenger'], edges: ['operator-handoff', 'handoff-techagent', 'techagent-messenger'], human: ['operator'] },
  ] },
  { id: 'tariff', level: 'L3', steps: [
    { nodes: ['client', 'auth', 'session', 'router'], edges: ['client-auth', 'auth-session', 'session-router'] },
    { nodes: ['router', 'tariffagent'], edges: ['router-tariffagent'] },
    { nodes: ['tariffagent', 'billtools', 'bss'], edges: ['tariffagent-billtools', 'billtools-bss'] },
    { nodes: ['tariffagent', 'tarifftools', 'bss'], edges: ['tariffagent-tarifftools', 'tarifftools-bss'] },
    { nodes: ['tariffagent', 'client'], edges: ['tariffagent-client'] },
    { nodes: ['client', 'tariffagent'], edges: ['client-tariffagent'], client: ['client'] },
    // зміну погоджує людина (оператор / бек-офіс)
    { nodes: ['tariffagent', 'handoff', 'operator'], edges: ['tariffagent-handoff', 'handoff-operator', 'operator-handoff', 'handoff-tariffagent'], human: ['operator'] },
    { nodes: ['tariffagent', 'tarifftools', 'bss', 'traces'], edges: ['tariffagent-tarifftools', 'tarifftools-bss', 'tariffagent-traces'] },
    // результат — у той самий чат застосунку
    { nodes: ['tariffagent', 'client'], edges: ['tariffagent-client'] },
  ] },
  /* L4 — напрям, не поточна практика: бот сам виправляє переплату в межах
     політики, без людини в контурі. future: true — на схемі пунктиром. */
  { id: 'auto', level: 'L4', future: true, steps: [
    { nodes: ['tariffagent', 'billtools', 'bss'], edges: ['tariffagent-billtools', 'billtools-bss'] },
    { nodes: ['tariffagent', 'tarifftools', 'bss'], edges: ['tariffagent-tarifftools', 'tarifftools-bss'] },
    { nodes: ['tariffagent'], edges: [] },
    { nodes: ['tariffagent', 'tarifftools', 'bss'], edges: ['tariffagent-tarifftools', 'tarifftools-bss'] },
    { nodes: ['tariffagent', 'traces'], edges: ['tariffagent-traces'] },
    { nodes: ['tariffagent', 'client'], edges: ['tariffagent-client'] },
  ] },
];
