/* Структура розділів без полотна. Тексти — у copy.csv за ключами. */

/* 01 — чотири складові агента */
window.PARTS = ['model', 'tools', 'context', 'limits'];

/* 02 — рівні автономності TM Forum */
window.LEVELS = ['l0', 'l1', 'l2', 'l3', 'l4', 'l5'];

/* 04 — протоколи */
window.PROTOCOLS = ['mcp', 'a2a', 'a2at', 'tmf921'];

/* 05 — покриття стеку вендорами (орієнтовно, за відкритими матеріалами).
   full — є продукт або заявлена можливість; part — частково / через партнерів. */
window.AGENT_VENDORS = [
  { id: 'ericsson', full: ['netagent', 'simagent', 'careagent', 'intentagent', 'netdata', 'custdata'], part: ['mcpnet', 'mcpbss', 'intentapi'] },
  { id: 'nokia', full: ['netagent', 'simagent', 'netdata'], part: ['intentagent', 'gate'] },
  { id: 'huawei', full: ['netagent', 'careagent', 'netdata'], part: ['intentagent', 'custdata'] },
  { id: 'amdocs', full: ['netagent', 'careagent', 'intentagent', 'mcpnet', 'mcpbss', 'ontology', 'twin', 'custdata'], part: ['gate', 'audit', 'netdata'] },
  { id: 'netcracker', full: ['netagent', 'careagent', 'intentagent', 'mcpnet', 'mcpbss', 'gate', 'audit', 'netdata', 'custdata'], part: ['ontology'] },
];

/* 05 — кейси операторів. mode: observe | recommend | act | assist | infra. single — одне джерело. */
window.CASES = [
  { id: 'dt', mode: 'act' },
  { id: 'vodafone', mode: 'infra' },
  { id: 'telenor', mode: 'observe' },
  { id: 'bell', mode: 'act', single: true },
  { id: 'superloop', mode: 'assist', single: true },
];

/* 06 — матриця повноважень: приклад політики, не стандарт. */
window.AUTHORITY = [
  { id: 'read', level: 'auto' },
  { id: 'explain', level: 'auto' },
  { id: 'ticket', level: 'auto' },
  { id: 'tune', level: 'confirm' },
  { id: 'comp', level: 'confirm' },
  { id: 'tariff', level: 'confirm' },
  { id: 'identity', level: 'deny' },
  { id: 'core', level: 'deny' },
  { id: 'delete', level: 'deny' },
];
window.AUTHORITY_LEVELS = ['auto', 'confirm', 'deny'];
