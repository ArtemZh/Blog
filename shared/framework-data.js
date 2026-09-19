/* Данные схемы Delivery Framework.
 *
 * Три независимых измерения, и они намеренно не пересекаются:
 *   EDITIONS  — верхний слой дисциплин: шестое издание (ваш оригинал) или восьмое;
 *   ITERATION — внутренность цикла поставки: подход к доставке;
 *   PRESALE   — дорожка до проекта, с условной вставкой discovery.
 * Переключение одного не трогает остальные — иначе непонятно, что от чего зависит. */


/* ── шкала ──────────────────────────────────────────────────────────
   В исходной диаграмме смысл несут ширина и горизонтальное смещение:
   элемент занимает ровно тот отрезок жизненного цикла, на котором живёт.
   Поэтому колонок нет — есть непрерывная шкала, а координаты взяты из Miro
   (единицы фрейма 460…2994) и переводятся в проценты.

   Главное следствие: Scope, Schedule, Cost и прочие дисциплины намеренно
   висят на стыке Planning и Executing — они там планируются и там же
   контролируются. Ни в одну колонку они не попадают и не должны. */
window.SCALE = { min: 460, max: 2994 };

window.SPANS = {
  /* фазы */
  init:   [460, 850],
  plan:   [890, 1313],
  exec:   [1338, 2569],
  close:  [2609, 2994],

  /* сквозные дисциплины */
  crossAll:  [460, 2569],
  crossPlan: [890, 2569],
  /* Governance — єдиний домен із процесом у Closing (Close Project or Phase) */
  crossGov:  [460, 2994],

  /* уровень проекта */
  requirements: [890, 1218],
  mcWork:       [1750, 2570],
  backlog:      [890, 1218],
  disciplines:  [1383, 2083],
  picc:         [2249, 2569],
  relBacklog:   [859, 1249],
  relMgmt:      [2249, 2569],
  transition:   [2609, 2994],
  iteration:    [1183, 2426],

  /* колонки слоя артефактов */
  artI:   [460, 850],
  artP1:  [890, 1313],
  artP2:  [890, 1313],
  artE0:  [1338, 1721],
  artE1:  [1752, 2143],
  artE2:  [2183, 2574],
  artC:   [2609, 2994],
  artAll: [460, 2994],
  artPE:  [460, 2574]
};

/* Слой артефактов повторяет ту же шкалу: шесть колонок — по одной под
   Initiating и Closing, одна под Planning, три под Executing и Monitoring and Controlling:
   первая — исполнение, две следующие — мониторинг и контроль. */
window.ARTEFACTS = {
  cols: [
    { seg: 'artI', items: [
      ['Contract / Agreement Document', 'a-any'], ['Business case', 'a-senior'],
      ['Project charter', 'a-senior'], ['Kick-Off (supervision by Senior PM)', 'a-any'],
      ['Communications plan', 'a-any'], ['Stakeholder register', 'a-any'],
      ['Assumption log', 'a-any'] ] },
    /* Planning — одна колонка: від структури робіт до базових планів і домовленостей команди. */
    { seg: 'artP1', items: [
      ['Work breakdown structure', 'a-senior'], ['Requirements traceability matrix', 'a-senior'],
      ['Gantt chart', 'a-senior'], ['Resource breakdown structure', 'a-senior'],
      ['Budget', 'a-senior'], ['Performance measurement baseline', 'a-senior'],
      ['Risk register', 'a-senior'], ['Responsibility assignment matrix', 'a-senior'],
      ['Stakeholder engagement assessment matrix', 'a-any'], ['Team charter', 'a-any'],
      ['Roadmap', 'a-any'] ] },
    /* Перша колонка під Executing — робочі журнали виконання. */
    { seg: 'artE0', items: [
      ['Tracking tools', 'a-senior'], ['Issue log', 'a-any'], ['Lessons learned register', 'a-any'] ] },
    /* Дві наступні — Monitoring and Controlling: метрики потоку, потім звіти й контроль змін. */
    { seg: 'artE1', items: [
      ['Burn chart', 'a-senior'], ['Velocity chart', 'a-senior'],
      ['Cycle time chart', 'a-senior'], ['Cumulative flow diagram', 'a-senior'] ] },
    { seg: 'artE2', items: [
      ['Project Health Status', 'a-any'], ['Risk report', 'a-senior'],
      ['Change log', 'a-senior'], ['Employee Risk Reduction report', 'a-any'] ] },
    { seg: 'artC', items: [ ['Final report', 'a-any'] ] }
  ],
  rows: [
    { seg: 'artAll', t: 'Account overview', grade: 'a-any' },
    { seg: 'artAll', t: 'Feedback from clients', grade: 'a-any' },
    { seg: 'artAll', t: 'Meeting notes (past meeting recordings or notes)', grade: 'a-any' },
    { seg: 'artPE', t: 'Team management (1-2-1 meeting, 1-2-1 notes)', grade: 'a-any' },
    { seg: 'artPE', t: 'Finance performance: P&L, invoices', grade: 'a-any' },
    { seg: 'artPE', t: 'Project Audit (supervision by Senior PM)', grade: 'a-any' }
  ]
};

window.EDITIONS = {
  6: {
    title: 'PMBOK 6',
    note: 'Ten knowledge areas. The slide as originally drawn.',
    /* сквозные полосы: from/to — колонки фокус-областей, 1..4 */
    bands: [
      { id: 'b-stake',  t: 'Stakeholder engagement management', from: 1, to: 5, grade: 'g-any' },
      { id: 'b-comms',  t: 'Communications management',         from: 1, to: 4, grade: 'g-any' },
      { id: 'b-res',    t: 'Resource management (allocation)',  from: 1, to: 4, grade: 'g-any' },
      { id: 'b-people', t: 'People management',                 from: 2, to: 4, grade: 'g-any' },
      { id: 'b-team',   t: 'Team management',                   from: 2, to: 4, grade: 'g-any' },
      { id: 'b-risk',   t: 'Risk management',                   from: 1, to: 4, grade: 'g-senior' }
    ],
    disciplines: [
      { id: 'd-scope', t: 'Scope management',       grade: 'g-senior' },
      { id: 'd-sched', t: 'Schedule management',    grade: 'g-senior' },
      { id: 'd-cost',  t: 'Cost management',        grade: 'g-senior' },
      { id: 'd-qual',  t: 'Quality management',     grade: 'g-senior' },
      { id: 'd-proc',  t: 'Procurement management', grade: 'g-senior' }
    ],
    /* Требования — процесс стандарта, а не наша формулировка: номер тот же,
       что на карте процессов, чтобы две схемы ссылались друг на друга. */
    requirements: { num: '5.3', t: 'Collect Requirements' },
    changes:      { t: 'Perform Integrated Change Control' }
  },

  8: {
    title: 'PMBOK 8',
    note: 'Seven performance domains. Quality is no longer a discipline of its own — ' +
          'it lives in the Governance band and in Verify quality inside the delivery cycle.',
    bands: [
      { id: 'b-gov',    t: 'Governance',                                  from: 1, to: 5, grade: 'g-senior' },
      { id: 'b-stake',  t: 'Stakeholder engagement and communications',   from: 1, to: 5, grade: 'g-any' },
      { id: 'b-res',    t: 'Resource management (allocation)',            from: 1, to: 4, grade: 'g-any' },
      { id: 'b-people', t: 'People management',                           from: 2, to: 4, grade: 'g-any' },
      { id: 'b-team',   t: 'Team management',                             from: 2, to: 4, grade: 'g-any' },
      { id: 'b-risk',   t: 'Risk management',                             from: 1, to: 4, grade: 'g-senior' }
    ],
    disciplines: [
      { id: 'd-scope', t: 'Scope management',    grade: 'g-senior' },
      { id: 'd-sched', t: 'Schedule management', grade: 'g-senior' },
      { id: 'd-cost',  t: 'Finance management',  grade: 'g-senior' },
      { id: 'd-proc',  t: 'Sourcing strategy',   grade: 'g-senior' }
    ],
    requirements: { num: '5.4', t: 'Elicit and Analyze Requirements' },
    changes:      { t: 'Assess and Implement Changes' }
  }
};

window.PRESALE = {
  stages: [
    {
      id: 'st-qual', t: 'Qualification',
      steps: [
        { id: 'p-lead',  t: 'Lead / RFP intake',           grade: 'r-sales' },
        { id: 'p-pot',   t: 'Client potential assessment', grade: 'r-sales' },
        { id: 'p-go',    t: 'Go / no-go decision',         grade: 'r-sales' }
      ]
    },
    {
      id: 'st-est', t: 'Solution & estimation',
      steps: [
        { id: 'p-call',  t: 'Clarification call with the client', grade: 'g-senior' },
        { id: 'p-tech',  t: 'Technical questions & assumptions',  grade: 'g-po' },
        { id: 'p-est',   t: 'Rough estimate + WBS',               grade: 'g-senior' },
        { id: 'p-team',  t: 'Team composition & rates',           grade: 'g-senior' },
        { id: 'p-risk',  t: 'Assumption & risk log',              grade: 'g-senior' }
      ]
    },
    {
      id: 'st-deal', t: 'Deal & hand-over',
      steps: [
        { id: 'p-prop',  t: 'Commercial proposal — T&M / FP / Dedicated', grade: 'r-sales' },
        { id: 'p-nego',  t: 'Negotiation & scope trade-offs',             grade: 'r-sales' },
        { id: 'p-hand',  t: 'Hand-over to delivery: estimate, assumptions, team, risks', grade: 'g-senior' }
      ]
    }
  ],

  artefacts: [
    { t: 'RFP / RFI from the client',   grade: 'a-any' },
    { t: 'Client potential report',     grade: 'a-any' },
    { t: 'Clarification questions list',grade: 'a-any' },
    { t: 'Estimate & WBS draft',        grade: 'a-senior' },
    { t: 'Team composition & rate card',grade: 'a-senior' },
    { t: 'Commercial proposal',         grade: 'a-any' }
  ],

  /* Дискавери — не этап, а альтернативная ветка. Поэтому ромб решения,
     пунктирный контур и возврат обратно в оценку, а не проход насквозь. */
  gate: {
    id: 'p-gate', t: 'Estimate confidence gate',
    triggers: [
      'Estimate spread wider than ±30% — the number cannot be traded on',
      'More assumptions than confirmed requirements',
      'Scope does not decompose down to a WBS',
      'Integrations, legacy or data quality on the client side unknown',
      'No access to end users or to the people who decide',
      'Domain new to the team',
      'Client asks for fixed price while any of the above holds'
    ]
  },

  discovery: {
    id: 'p-disc', t: 'Discovery',
    cadence: '2–6 weeks, separate fixed-price engagement',
    steps: [
      { id: 'dc-sow',   t: 'Discovery SOW & kick-off',        grade: 'g-senior' },
      { id: 'dc-int',   t: 'Stakeholder interviews',          grade: 'g-po' },
      { id: 'dc-asis',  t: 'As-is analysis: systems, data, integrations', grade: 'g-po' },
      { id: 'dc-ws',    t: 'Requirements workshop',           grade: 'g-po' },
      { id: 'dc-arch',  t: 'Solution options & architecture outline', grade: 'r-tech' },
      { id: 'dc-spike', t: 'Technical spike on the riskiest assumption', grade: 'r-tech' },
      { id: 'dc-re',    t: 'Re-estimate — narrow the range',  grade: 'g-senior' },
      { id: 'dc-rep',   t: 'Discovery report & decision gate',grade: 'g-senior' }
    ],
    outcomes: [
      'Narrowed estimate → proposal',
      'Uncertainty remains → T&M instead of fixed price',
      'Walk away from the deal'
    ],
    artefacts: [
      { t: 'Discovery SOW',            grade: 'a-senior' },
      { t: 'Interview notes',          grade: 'a-any' },
      { t: 'As-is map',                grade: 'a-any' },
      { t: 'Solution vision',          grade: 'a-senior' },
      { t: 'Refined backlog & WBS',    grade: 'a-senior' },
      { t: 'Narrowed estimate range',  grade: 'a-senior' },
      { t: 'Assumption & risk log v2', grade: 'a-any' },
      { t: 'Discovery report',         grade: 'a-senior' }
    ]
  }
};

/* Цикл поставки. У кожного підходу своя форма, а не ті самі десять плашок
   з іншими підписами: Scrum — петля спринту, Kanban — потік без петлі з
   каденціями під ним, SAFe — цикл ітерації всередині PI, інкрементний
   waterfall — лінійні фази, що повторюються інкрементами.
   Вузол: c/r — колонка й рядок усередині блоку (з 1), cs — скільки колонок.
   Ребро: [звідки, куди, маршрут, fa, fb] — fa/fb частка ширини, де лінія
   виходить і входить (щоб дві стрілки не зливались в одну точку).
   entry — куди входить Release Backlog, exit — що віддається в Release management. */
window.ITERATION = {
  approaches: [
    { id: 'universal', title: 'Universal',  cadence: 'One delivery cycle',
      cols: 5, lanes: ['Management', 'Engineering'], entry: 'u-select', exit: 'u-release',
      nodes: [
        { id: 'u-select',  t: 'Select work',        c: 1, r: 1, grade: 'g-senior' },
        { id: 'u-commit',  t: 'Fix cycle scope',    c: 2, r: 1, grade: 'g-senior' },
        { id: 'u-track',   t: 'Track progress',     c: 3, r: 1, grade: 'g-any' },
        { id: 'u-accept',  t: 'Accept result',      c: 4, r: 1, grade: 'g-senior' },
        { id: 'u-improve', t: 'Improve process',    c: 5, r: 1, grade: 'g-any' },
        { id: 'u-ready',   t: 'Readiness criteria', c: 1, r: 2, grade: 'g-po' },
        { id: 'u-build',   t: 'Build increment',    c: 2, r: 2, grade: 'g-any' },
        { id: 'u-verify',  t: 'Verify quality',     c: 3, r: 2, grade: 'g-any' },
        { id: 'u-validate',t: 'Validate with users',c: 4, r: 2, grade: 'g-any' },
        { id: 'u-release', t: 'Release increment',  c: 5, r: 2, grade: 'g-senior' }
      ],
      edges: [
        ['u-select', 'u-commit', 'h'], ['u-commit', 'u-track', 'h'], ['u-track', 'u-accept', 'h'],
        ['u-accept', 'u-improve', 'h'], ['u-improve', 'u-select', 'over', 0.5, 0.7],
        ['u-ready', 'u-build', 'h'], ['u-build', 'u-verify', 'h'], ['u-verify', 'u-validate', 'h'],
        ['u-validate', 'u-release', 'h'],
        ['u-commit', 'u-ready', 'dn', 0.5, 0.5], ['u-validate', 'u-accept', 'v']
      ] },

    { id: 'scrum', title: 'Scrum', cadence: 'Sprint of one month or less',
      cols: 5, lanes: ['Events', 'Artifacts', 'Release'], entry: 's-plan', exit: 's-release',
      nodes: [
        { id: 's-plan',    t: 'Sprint Planning',      s: 'why · what · how',        c: 1, r: 1, grade: 'g-senior' },
        { id: 's-daily',   t: 'Daily Scrum',          s: '15 min, every day',       c: 2, r: 1, cs: 2, grade: 'g-any' },
        { id: 's-review',  t: 'Sprint Review',        s: 'inspect the outcome',     c: 4, r: 1, grade: 'g-senior' },
        { id: 's-retro',   t: 'Sprint Retrospective', s: 'inspect how we work',     c: 5, r: 1, grade: 'g-any' },
        { id: 's-sbl',     t: 'Sprint Backlog',       s: 'Sprint Goal',             c: 2, r: 2, grade: 'g-any' },
        { id: 's-inc',     t: 'Increment',            s: 'Definition of Done',      c: 3, r: 2, grade: 'g-any' },
        { id: 's-refine',  t: 'Product Backlog refinement', s: 'ongoing · Product Goal', c: 4, r: 2, grade: 'g-po' },
        { id: 's-release', t: 'Deliver the Increment', s: 'any time it is Done',    c: 3, r: 3, grade: 'g-senior' }
      ],
      edges: [
        ['s-plan', 's-daily', 'h'], ['s-daily', 's-review', 'h'], ['s-review', 's-retro', 'h'],
        ['s-retro', 's-plan', 'over', 0.5, 0.7],
        ['s-plan', 's-sbl', 'dside', 0.5],
        ['s-daily', 's-sbl', 'v'],
        ['s-sbl', 's-inc', 'h'],
        ['s-inc', 's-review', 'up', 0.5, 0.3],
        ['s-review', 's-refine', 'v', 0.7, 0.7],
        ['s-refine', 's-plan', 'floor', 0.5, 0.25],
        ['s-inc', 's-release', 'v']
      ] },

    { id: 'kanban', title: 'Kanban', cadence: 'Continuous flow — no iteration',
      cols: 5, lanes: ['Flow', 'Cadences'], entry: 'k-options', exit: 'k-done',
      nodes: [
        { id: 'k-options', t: 'Options',            s: 'upstream, not committed',  c: 1, r: 1, grade: 'g-po' },
        { id: 'k-commit',  t: 'Commitment point',   s: 'pulled into the system',   c: 2, r: 1, grade: 'g-senior' },
        { id: 'k-wip',     t: 'In progress',        s: 'WIP limits per column',    c: 3, r: 1, grade: 'g-any' },
        { id: 'k-ready',   t: 'Delivery point',     s: 'ready to deliver',         c: 4, r: 1, grade: 'g-any' },
        { id: 'k-done',    t: 'Delivered',          s: 'lead time stops',          c: 5, r: 1, grade: 'g-senior' },
        { id: 'k-strat',   t: 'Strategy & Risk Review', s: 'quarterly · monthly',  c: 1, r: 2, grade: 'g-senior' },
        { id: 'k-repl',    t: 'Replenishment',      s: 'weekly',                   c: 2, r: 2, grade: 'g-po' },
        { id: 'k-daily',   t: 'Kanban Meeting',     s: 'daily, 15 min',            c: 3, r: 2, grade: 'g-any' },
        { id: 'k-dplan',   t: 'Delivery Planning',  s: 'per delivery',             c: 4, r: 2, grade: 'g-senior' },
        { id: 'k-sdr',     t: 'Service Delivery Review', s: 'bi-weekly',           c: 5, r: 2, grade: 'g-senior' }
      ],
      edges: [
        ['k-options', 'k-commit', 'h'], ['k-commit', 'k-wip', 'h'], ['k-wip', 'k-ready', 'h'], ['k-ready', 'k-done', 'h'],
        ['k-strat', 'k-options', 'v'], ['k-repl', 'k-commit', 'v'], ['k-daily', 'k-wip', 'v'],
        ['k-dplan', 'k-ready', 'v'], ['k-sdr', 'k-done', 'v']
      ] },

    { id: 'safe', title: 'SAFe', cadence: 'PI of 8–12 weeks: 4–5 iterations + IP',
      cols: 6, lanes: ['ART', 'Team', 'Pipeline'], entry: 'f-pi', exit: 'f-rod',
      nodes: [
        { id: 'f-pi',     t: 'PI Planning',       s: '2 days, whole ART',         c: 1, r: 1, grade: 'g-senior' },
        { id: 'f-iters',  t: 'Iterations',        s: '4–5 × 2 weeks',             c: 2, r: 1, cs: 3, grade: 'g-any' },
        { id: 'f-ip',     t: 'IP iteration',      s: 'innovation & planning',     c: 5, r: 1, grade: 'g-any' },
        { id: 'f-ia',     t: 'Inspect & Adapt',   s: 'end of PI',                 c: 6, r: 1, grade: 'g-senior' },
        { id: 'f-itp',    t: 'Iteration Planning',s: 'team',                      c: 2, r: 2, grade: 'g-any' },
        { id: 'f-sync',   t: 'Team Sync',         s: 'daily',                     c: 3, r: 2, grade: 'g-any' },
        { id: 'f-itr',    t: 'Iteration Review & Retro', s: 'team',               c: 4, r: 2, grade: 'g-any' },
        { id: 'f-demo',   t: 'System Demo',       s: 'after every iteration',     c: 5, r: 2, grade: 'g-senior' },
        { id: 'f-cdp',    t: 'Continuous Delivery Pipeline', s: 'explore · integrate · deploy', c: 2, r: 3, cs: 3, grade: 'r-tech' },
        { id: 'f-rod',    t: 'Release on Demand', s: 'business decides when',     c: 6, r: 3, grade: 'g-senior' }
      ],
      edges: [
        ['f-pi', 'f-iters', 'h'], ['f-iters', 'f-ip', 'h'], ['f-ip', 'f-ia', 'h'],
        ['f-ia', 'f-pi', 'over', 0.5, 0.7],
        ['f-iters', 'f-itp', 'v', 0.4, 0.4],
        ['f-itp', 'f-sync', 'h'], ['f-sync', 'f-itr', 'h'],
        ['f-itr', 'f-itp', 'gap', 0.5, 0.75],
        ['f-itr', 'f-demo', 'h'],
        ['f-demo', 'f-ia', 'up', 0.5, 0.5],
        ['f-sync', 'f-cdp', 'v'],
        ['f-cdp', 'f-rod', 'h']
      ] },

    { id: 'hybrid', title: 'Incremental waterfall', cadence: 'Sequential phases; the next increment starts over',
      cols: 6, lanes: ['Increment'], entry: 'w-req1', exit: 'w-rel1',
      nodes: [
        { id: 'w-req1',  t: 'Requirements',     c: 1, r: 1, grade: 'g-po' },
        { id: 'w-des1',  t: 'Design',           c: 2, r: 1, grade: 'r-tech' },
        { id: 'w-build1',t: 'Build',            c: 3, r: 1, grade: 'g-any' },
        { id: 'w-test1', t: 'Test',             c: 4, r: 1, grade: 'g-any' },
        { id: 'w-gate1', t: 'Acceptance gate',  c: 5, r: 1, grade: 'g-senior' },
        { id: 'w-rel1',  t: 'Release',          c: 6, r: 1, grade: 'g-senior' }
      ],
      edges: [
        ['w-req1', 'w-des1', 'h'], ['w-des1', 'w-build1', 'h'], ['w-build1', 'w-test1', 'h'],
        ['w-test1', 'w-gate1', 'h'], ['w-gate1', 'w-rel1', 'h'],
        ['w-rel1', 'w-req1', 'over', 0.5, 0.7]
      ] }
  ]
};
