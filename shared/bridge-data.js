/* Розділ «Аутсорс і продукт» — два кадри однієї історії.
 *
 * A. Процес feature request у продуктовій компанії: етапи, три гейти, три
 *    повернення. Схема з домашки Busy Bar, узята як є.
 * B. Життєвий цикл продукту і місце проєкту в ньому: усередині PLC живуть
 *    проєкти, і один із них віддається вендору. Саме там починається все,
 *    що описує схема 13: пресейл, договір, цикл поставки, приймання.
 *
 * Дві мови лежать поруч і обираються за window.PMP_LANG. */

var UK = {
  flow: {
    bands: { st: 'ЕТАПИ', gt: 'ГЕЙТИ', rt: 'ПОВЕРНЕННЯ' },
    stages: [
      { id: 'req',    t: 'Запит',      s: 'ідея або саппорт',      o: 'власник · Продукт' },
      { id: 'triage', t: 'Тріаж',      s: 'цінність і пріоритет',  o: 'власник · Продукт' },
      { id: 'disc',   t: 'Discovery',  s: 'код, ролі, заміри',     o: 'власник · TPM' },
      { id: 'doc',    t: 'Design doc', s: 'цей документ',          o: 'власник · TPM' },
      { id: 'sprint', t: 'Спринти',    s: 'усі ролі паралельно',   o: 'власник · команда' },
      { id: 'integ',  t: 'Інтеграція', s: 'на пристрої',           o: 'власник · QA + TPM' },
      { id: 'rel',    t: 'Реліз',      s: 'і метрики після',       o: 'власник · Продукт' }
    ],
    gates: [
      { under: 'triage', t: 'Гейт 1 · Берем?',       s: 'цінність і місце в кварталі' },
      { under: 'doc',    t: 'Гейт 2 · Специфікації', s: 'kick-off, оцінки, DoR' },
      { under: 'integ',  t: 'Гейт 3 · Приймання',    s: 'усі AC на живому пристрої' }
    ],
    returns: [
      { from: 'sprint', to: 'doc',   kind: 'mus', lane: 0, t1: 'зміна специфікації', t2: 'або скоупу' },
      { from: 'integ',  to: 'sprint', kind: 'sg',  lane: 1, t1: 'баг із приймання: знайшов QA', t2: 'повертає у спринт' },
      { from: 'rel',    to: 'req',   kind: 'sg',  lane: 2, t1: 'дефект із прода: сплив у користувача,', t2: 'заводиться заново і проходить тріаж' }
    ]
  },

  plc: {
    bands: { plc: 'ПРОДУКТ', prj: 'ПРОЄКТИ', ven: 'ВЕНДОР' },
    axis: [
      { at: 0,  t: 'Q1 25' }, { at: 3,  t: 'Q2 25' }, { at: 6,  t: 'Q3 25' }, { at: 9,  t: 'Q4 25' },
      { at: 12, t: 'Q1 26' }, { at: 15, t: 'Q2 26' }, { at: 18, t: 'Q3 26' }, { at: 21, t: 'Q4 26' }
    ],
    span: 24,
    phases: [
      { id: 'concept', from: 0,  to: 3,  t: 'Задум',     s: 'гіпотеза і бізнес-кейс' },
      { id: 'build',   from: 3,  to: 9,  t: 'Розробка',  s: 'MVP і перші релізи' },
      { id: 'launch',  from: 9,  to: 12, t: 'Запуск',    s: 'вихід на ринок' },
      { id: 'growth',  from: 12, to: 18, t: 'Зростання', s: 'нові сегменти й функції' },
      { id: 'mature',  from: 18, to: 22, t: 'Зрілість',  s: 'утримання і вартість володіння' },
      { id: 'sunset',  from: 22, to: 24, t: 'Згортання', s: 'вивід' }
    ],
    projects: [
      { id: 'p1', from: 1,  to: 9,  t: 'MVP пристрою', s: 'внутрішня команда',
        plc: [ { from: 1, to: 2.6, t: 'Initiating' }, { from: 2.6, to: 4, t: 'Planning' },
               { from: 4, to: 7.6, t: 'Executing', t2: 'Monitoring and Controlling' }, { from: 7.6, to: 9, t: 'Closing' } ] },
      { id: 'p2', from: 8,  to: 13, t: 'Мобільний клієнт', s: 'внутрішня команда' },
      { id: 'p3', from: 12, to: 20, t: 'Інтеграція платежів', s: 'віддано вендору', vendor: true },
      { id: 'p4', from: 17, to: 23, t: 'Міграція платформи', s: 'внутрішня команда' }
    ],
    vendor: [
      { from: 11, to: 12.6, t: 'Пресейл',   s: 'RFP, оцінка' },
      { from: 12.6, to: 13.6, t: 'Договір', s: 'SOW і обсяг' },
      { from: 13.6, to: 18,  t: 'Поставка', s: 'цикл, інкремент, демо' },
      { from: 18, to: 19,    t: 'Приймання', s: 'AC замовника' },
      { from: 19, to: 20.6,  t: 'Гарантія', s: 'передача і підтримка' }
    ],
    down: 'обсяг передано назовні',
    up: 'інкремент повертається у продукт',
    note13: 'схема 13 описує саме цю доріжку',
    plcNote: 'усередині кожного проєкту — свій цикл'
  },

  pmi: [
    ['Project Charter', 'Формальний устав із підписом спонсора', 'Півсторінки feature brief плюс design doc'],
    ['Stakeholder Register', 'Реєстр із матрицею впливу й планом залучення', 'Таблиця відкритих питань із власником і датою'],
    ['Scope Baseline', 'Затверджений WBS із процедурою змін', 'Розділ вимог у design doc; зміна обсягу повертає до Гейта 2'],
    ['Risk Register', 'Реєстр із ймовірністю, впливом і резервами', 'Розділ ризиків: тільки те, що має власника і дію'],
    ['Quality Management Plan', 'Окремий план якості', 'DoR і DoD у Jira плюс тест-план на приймання']
  ],

  reqs: {
    note: 'У аутсорсі невідоме знімає клариф-дзвінок і лог допущень. У продукті — той самий прийом усередині user story: кожне допущення позначене [A], має власника і перевіряється до старту розробки.',
    items: [
      ['US-1 · Бачити доступність пристрою', 'Історія закрита раніше; тримаємо як умову для інших, у скоуп і оцінку не входить. [A] Перевіряємо допущення до старту — якщо ознаки десь немає, історія повертається в обсяг разом з оцінкою.'],
      ['US-2 · Змінити статус', 'Пристрій офлайн: сервер зберігає одне цільове значення, нова команда затирає попередню. Черги немає. [A] Склад набору статусів підтверджує продукт.'],
      ['US-3 · Підтвердження зміни', 'Підтвердження показуємо після відповіді пристрою, не сервера. Повторна відправка тієї самої команди не створює другого запису.']
    ]
  }
};

var EN = {
  flow: {
    bands: { st: 'STAGES', gt: 'GATES', rt: 'RETURNS' },
    stages: [
      { id: 'req',    t: 'Request',    s: 'idea or support',        o: 'owner · Product' },
      { id: 'triage', t: 'Triage',     s: 'value and priority',     o: 'owner · Product' },
      { id: 'disc',   t: 'Discovery',  s: 'code, roles, measurements', o: 'owner · TPM' },
      { id: 'doc',    t: 'Design doc', s: 'this document',          o: 'owner · TPM' },
      { id: 'sprint', t: 'Sprints',    s: 'all roles in parallel',  o: 'owner · team' },
      { id: 'integ',  t: 'Integration', s: 'on the device',         o: 'owner · QA + TPM' },
      { id: 'rel',    t: 'Release',    s: 'and metrics after',      o: 'owner · Product' }
    ],
    gates: [
      { under: 'triage', t: 'Gate 1 · Do we take it?', s: 'value and a place in the quarter' },
      { under: 'doc',    t: 'Gate 2 · Specifications', s: 'kick-off, estimates, DoR' },
      { under: 'integ',  t: 'Gate 3 · Acceptance',     s: 'all AC on live hardware' }
    ],
    returns: [
      { from: 'sprint', to: 'doc',    kind: 'mus', lane: 0, t1: 'change of specification', t2: 'or scope' },
      { from: 'integ',  to: 'sprint', kind: 'sg',  lane: 1, t1: 'defect found at acceptance by QA', t2: 'goes back into the sprint' },
      { from: 'rel',    to: 'req',    kind: 'sg',  lane: 2, t1: 'defect from production: surfaced for a user,', t2: 'raised again and goes through triage' }
    ]
  },

  plc: {
    bands: { plc: 'PRODUCT', prj: 'PROJECTS', ven: 'VENDOR' },
    axis: [
      { at: 0,  t: 'Q1 25' }, { at: 3,  t: 'Q2 25' }, { at: 6,  t: 'Q3 25' }, { at: 9,  t: 'Q4 25' },
      { at: 12, t: 'Q1 26' }, { at: 15, t: 'Q2 26' }, { at: 18, t: 'Q3 26' }, { at: 21, t: 'Q4 26' }
    ],
    span: 24,
    phases: [
      { id: 'concept', from: 0,  to: 3,  t: 'Concept',  s: 'hypothesis and business case' },
      { id: 'build',   from: 3,  to: 9,  t: 'Build',    s: 'MVP and first releases' },
      { id: 'launch',  from: 9,  to: 12, t: 'Launch',   s: 'go to market' },
      { id: 'growth',  from: 12, to: 18, t: 'Growth',   s: 'new segments and features' },
      { id: 'mature',  from: 18, to: 22, t: 'Maturity', s: 'retention and cost of ownership' },
      { id: 'sunset',  from: 22, to: 24, t: 'Sunset',   s: 'withdrawal' }
    ],
    projects: [
      { id: 'p1', from: 1,  to: 9,  t: 'Device MVP', s: 'in-house team',
        plc: [ { from: 1, to: 2.6, t: 'Initiating' }, { from: 2.6, to: 4, t: 'Planning' },
               { from: 4, to: 7.6, t: 'Executing', t2: 'Monitoring and Controlling' }, { from: 7.6, to: 9, t: 'Closing' } ] },
      { id: 'p2', from: 8,  to: 13, t: 'Mobile client', s: 'in-house team' },
      { id: 'p3', from: 12, to: 20, t: 'Payments integration', s: 'given to a vendor', vendor: true },
      { id: 'p4', from: 17, to: 23, t: 'Platform migration', s: 'in-house team' }
    ],
    vendor: [
      { from: 11, to: 12.6, t: 'Pre-sale',  s: 'RFP, estimate' },
      { from: 12.6, to: 13.6, t: 'Contract', s: 'SOW and scope' },
      { from: 13.6, to: 18,  t: 'Delivery',  s: 'cycle, increment, demo' },
      { from: 18, to: 19,    t: 'Acceptance', s: 'client AC' },
      { from: 19, to: 20.6,  t: 'Warranty',  s: 'handover and support' }
    ],
    down: 'scope handed outside',
    up: 'increment returns to the product',
    note13: 'diagram 13 describes exactly this lane',
    plcNote: 'each project runs its own life cycle inside'
  },

  pmi: [
    ['Project Charter', 'A formal charter signed by the sponsor', 'Half a page of feature brief plus the design doc'],
    ['Stakeholder Register', 'A register with an influence matrix and engagement plan', 'A table of open questions with an owner and a date'],
    ['Scope Baseline', 'An approved WBS with a change procedure', 'The requirements section of the design doc; a scope change returns it to Gate 2'],
    ['Risk Register', 'A register with probability, impact and reserves', 'A risk section: only what has an owner and an action'],
    ['Quality Management Plan', 'A separate quality plan', 'DoR and DoD in Jira plus an acceptance test plan']
  ],

  reqs: {
    note: 'In outsourcing the unknown is removed by the clarification call and the assumption log. In product the same move happens inside the user story: every assumption is marked [A], has an owner and is checked before development starts.',
    items: [
      ['US-1 · See device availability', 'The story was closed earlier; we keep it as a precondition for the others, it is not in scope or in the estimate. [A] The assumption is checked before the start — if the flag is missing anywhere, the story returns to scope together with its estimate.'],
      ['US-2 · Change the status', 'Device offline: the server stores a single target value, a new command overwrites the previous one. There is no queue. [A] The set of statuses is confirmed by product.'],
      ['US-3 · Confirmation of the change', 'The confirmation is shown after the device answers, not the server. Sending the same command twice does not create a second record.']
    ]
  }
};

window.BRIDGE = window.PMP_LANG === 'en' ? EN : UK;
