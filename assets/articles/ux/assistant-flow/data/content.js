/* Структура розділів без полотна. Тексти — у copy.js. Усі приклади — з вигаданого
   демо-проєкту «Запуск сайту»: справжніх людей, клієнтів і чисел тут немає. */

/* 01 — три етапи проєкту в планувальнику */
window.STAGES = ['presale', 'contract', 'delivery'];

/* 03 — три правила, на яких тримається асистент */
window.RULES = ['append', 'human', 'narrow'];

/* 04 — шлях однієї зустрічі: кроки й п'ять пропозицій із неї.
   level — рівень доступу пропозиції, як його поставлено в чернетці демо. */
window.MEETING_STEPS = 8;
window.PROPOSALS = [
  { id: 'd', level: 'client' },
  { id: 't1', level: 'team' },
  { id: 't2', level: 'team' },
  { id: 'q', level: 'client' },
  { id: 'r', level: 'team' },
];

/* 05 — чим відрізняються питання, рішення, задача й ризик */
window.KINDS = ['q', 'd', 't', 'r'];

/* 06 — хто що може: дія · асистент · людина. v — хто робить: a — асистент сам,
   h — лише людина, ah — асистент лише за прямою вказівкою людини для названого запису. */
window.WHO = [
  { id: 'read', v: 'a' }, { id: 'draft', v: 'a' }, { id: 'import', v: 'a' }, { id: 'note', v: 'a' },
  { id: 'answer', v: 'a' }, { id: 'tool', v: 'ah' }, { id: 'pickup', v: 'ah' }, { id: 'comment', v: 'ah' },
  { id: 'approve', v: 'h' }, { id: 'resolve', v: 'ah' }, { id: 'widen', v: 'ah' }, { id: 'send', v: 'h' },
];

/* 08 — рівні доступу (від найширшого до найвужчого), чотири режими документів,
   три «ніколи» */
window.LEVELS = ['client', 'team', 'internal', 'personal'];
window.MODES = ['client', 'team', 'internal', 'personal'];
window.NEVER = ['client', 'team', 'talk'];

/* 09 — чого система свідомо не робить; 10 — що ще не зроблено */
window.NOTS = ['ai', 'send', 'cloud', 'net', 'direct', 'rewrite', 'clean'];
window.OPEN = ['sync', 'lock', 'qdocs', 'manual', 'onlytxt', 'edits', 'observe'];

/* 11 — словник: планувальник і асистент окремо */
window.GLOSS_PLAN = ['critical', 'slack', 'pert', 'mc', 'baseline', 'evm', 'reserve', 'limits', 'change', 'planb'];
window.GLOSS_AST = ['question', 'proposal', 'source', 'level', 'digest', 'tool', 'draft', 'summary', 'journal', 'link', 'mirror', 'awaiting'];

/* 12 — звідки це відомо: що саме читали (без адрес: репозиторій продукту закритий) */
window.REFS = ['readme', 'astreadme', 'format', 'rules', 'model', 'astcode', 'screens', 'demo'];
