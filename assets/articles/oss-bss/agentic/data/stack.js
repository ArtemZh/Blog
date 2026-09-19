/* Стек агента в операторі — від людей згори до систем знизу.
   Три колонки наскрізь: мережа · клієнт · намір. Колонка = сценарій,
   тому дроти сценарію здебільшого вертикальні (SCHEMA-PRINCIPLES §3, §5).
   Підпис дроту: номер API як є або ключ api.<id> у copy.csv. */
window.STACK = {
  width: 1440,
  cols: 3,
  key: ['netagent', 'careagent', 'intentagent'],
  bands: [
    { id: 'people', groups: [
      { id: 'p1', label: false, nodes: ['engineer'] },
      { id: 'p2', label: false, nodes: ['customer', 'supervisor'] },
      { id: 'p3', label: false, nodes: ['productmgr'] },
    ] },
    { id: 'gov', expandable: true, groups: [
      { id: 'g1', label: false, nodes: ['gate'] },
      { id: 'g2', label: false, nodes: ['human'] },
      { id: 'g3', label: false, nodes: ['audit'] },
    ] },
    { id: 'agents', expandable: true, groups: [
      { id: 'net', nodes: ['netagent', 'simagent'] },
      { id: 'cust', nodes: ['careagent'] },
      { id: 'intent', nodes: ['intentagent'] },
    ] },
    { id: 'coord', strip: true },
    { id: 'tools', expandable: true, groups: [
      { id: 't1', label: false, nodes: ['mcpnet'] },
      { id: 't2', label: false, nodes: ['mcpbss'] },
      { id: 't3', label: false, nodes: ['intentapi'] },
    ] },
    { id: 'data', expandable: true, groups: [
      { id: 'd1', label: false, nodes: ['netdata'] },
      { id: 'd2', label: false, nodes: ['custdata'] },
      { id: 'd3', label: false, nodes: ['twin', 'ontology'] },
    ] },
    { id: 'systems', groups: [
      { id: 's1', label: false, nodes: ['oss'] },
      { id: 's2', label: false, nodes: ['bss'] },
      { id: 's3', label: false, nodes: ['orch'] },
    ] },
  ],
  edges: [
    // A — агент аварій
    { id: 'oss-netdata', from: 'oss', to: 'netdata', api: 'TMF642 · TMF628' },
    { id: 'netdata-netagent', from: 'netdata', to: 'netagent', api: 'anomaly' },
    { id: 'netagent-mcpnet', from: 'netagent', to: 'mcpnet', api: 'MCP' },
    { id: 'mcpnet-netdata', from: 'mcpnet', to: 'netdata', api: 'TMF639' },
    { id: 'netagent-simagent', from: 'netagent', to: 'simagent', api: 'A2A-T' },
    { id: 'simagent-twin', from: 'simagent', to: 'twin', api: 'whatif' },
    { id: 'netagent-gate', from: 'netagent', to: 'gate', api: 'policy' },
    { id: 'gate-engineer', from: 'gate', to: 'engineer', api: 'recommend' },
    { id: 'mcpnet-oss', from: 'mcpnet', to: 'oss', api: 'action' },
    { id: 'netagent-careagent', from: 'netagent', to: 'careagent', api: 'A2A-T' },
    { id: 'netagent-audit', from: 'netagent', to: 'audit', api: 'log' },
    // B — агент клієнта
    { id: 'customer-careagent', from: 'customer', to: 'careagent', api: 'request' },
    { id: 'careagent-mcpbss', from: 'careagent', to: 'mcpbss', api: 'MCP' },
    { id: 'mcpbss-bss', from: 'mcpbss', to: 'bss', api: 'TMF678 · TMF635' },
    { id: 'custdata-careagent', from: 'custdata', to: 'careagent', api: 'context' },
    { id: 'careagent-human', from: 'careagent', to: 'human', api: 'threshold' },
    { id: 'human-supervisor', from: 'human', to: 'supervisor', api: 'confirm' },
    { id: 'human-careagent', from: 'human', to: 'careagent', api: 'allow' },
    { id: 'careagent-customer', from: 'careagent', to: 'customer', api: 'answer' },
    { id: 'careagent-audit', from: 'careagent', to: 'audit', api: 'log' },
    // C — агент наміру
    { id: 'productmgr-intentagent', from: 'productmgr', to: 'intentagent', api: 'intent' },
    { id: 'intentagent-ontology', from: 'intentagent', to: 'ontology', api: 'knowledge' },
    { id: 'intentagent-intentapi', from: 'intentagent', to: 'intentapi', api: 'TMF921' },
    { id: 'intentapi-twin', from: 'intentapi', to: 'twin', api: 'feasibility' },
    { id: 'intentapi-orch', from: 'intentapi', to: 'orch', api: 'TMF641' },
    { id: 'netdata-intentagent', from: 'netdata', to: 'intentagent', api: 'KPI' },
    { id: 'intentagent-gate', from: 'intentagent', to: 'gate', api: 'policy' },
    { id: 'intentagent-productmgr', from: 'intentagent', to: 'productmgr', api: 'report' },
  ],
};

/* Сценарії. human — вузли, де рішення за людиною. */
window.AGENT_FLOWS = [
  { id: 'incident', steps: [
    { nodes: ['oss', 'netdata'], edges: ['oss-netdata'] },
    { nodes: ['netdata', 'netagent'], edges: ['netdata-netagent'] },
    { nodes: ['netagent', 'mcpnet', 'netdata'], edges: ['netagent-mcpnet', 'mcpnet-netdata'] },
    { nodes: ['netagent', 'simagent', 'twin'], edges: ['netagent-simagent', 'simagent-twin'] },
    { nodes: ['netagent', 'gate'], edges: ['netagent-gate'] },
    { nodes: ['gate', 'engineer', 'mcpnet', 'oss'], edges: ['gate-engineer', 'mcpnet-oss'], human: ['engineer'] },
    { nodes: ['netagent', 'careagent', 'audit'], edges: ['netagent-careagent', 'netagent-audit'] },
  ] },
  { id: 'customer', steps: [
    { nodes: ['customer', 'careagent'], edges: ['customer-careagent'] },
    { nodes: ['careagent', 'custdata', 'mcpbss', 'bss'], edges: ['custdata-careagent', 'careagent-mcpbss', 'mcpbss-bss'] },
    { nodes: ['careagent', 'customer'], edges: ['careagent-customer'] },
    { nodes: ['careagent', 'human'], edges: ['careagent-human'] },
    { nodes: ['human', 'supervisor'], edges: ['human-supervisor'], human: ['supervisor'] },
    { nodes: ['human', 'careagent', 'mcpbss', 'bss'], edges: ['human-careagent', 'careagent-mcpbss', 'mcpbss-bss'] },
    { nodes: ['careagent', 'customer', 'audit'], edges: ['careagent-customer', 'careagent-audit'] },
  ] },
  { id: 'intent', steps: [
    { nodes: ['productmgr', 'intentagent'], edges: ['productmgr-intentagent'] },
    { nodes: ['intentagent', 'ontology'], edges: ['intentagent-ontology'] },
    { nodes: ['intentagent', 'intentapi', 'twin'], edges: ['intentagent-intentapi', 'intentapi-twin'] },
    { nodes: ['intentagent', 'gate'], edges: ['intentagent-gate'] },
    { nodes: ['intentapi', 'orch'], edges: ['intentapi-orch'] },
    { nodes: ['netdata', 'intentagent'], edges: ['netdata-intentagent'] },
    { nodes: ['intentagent', 'productmgr'], edges: ['intentagent-productmgr'], human: ['productmgr'] },
  ] },
];
