/* Структура розділів без полотна. Тексти — у copy.js. */

/* 02 — чотири роботи кольору */
window.JOBS = ['state', 'act', 'cat', 'mag'];

/* 03 — скільки барв дають готові палітри */
window.COUNTS = ['stone', 'pajamas', 'few', 'carbon'];

/* 04 — три критерії WCAG, три оцінки частки людей, чим дублювати колір */
window.WCAG = ['141', '143', '1411'];
window.SHARE = ['okabe', 'nei', 'few'];
window.DUP = ['okabe', 'atlassian', 'pajamas'];

/* 05 — відстані між ролями, ΔE (CIELAB, 1976), світла тема.
   Власні розрахунки автора. a, b — ключі з COLORS. */
window.DIST = [
  { id: 'crit-act', a: 'crit', b: 'signal', sky: 117, calm: 15 },
  { id: 'crit-err', a: 'crit', b: 'err', sky: 27, calm: 25 },
  { id: 'act-err', a: 'signal', b: 'err', sky: 102, calm: 39 },
  { id: 'act-clay', a: 'signal', b: 'p:clay', sky: 101, calm: 16 },
  { id: 'crit-clay', a: 'crit', b: 'p:clay', sky: 24, calm: 15 },
  { id: 'bar-slate', a: 'bar', b: 'p:slate', sky: 28, calm: 7 },
  { id: 'warn-gold', a: 'warn', b: 'p:gold', sky: 27, calm: 24 },
  { id: 'zone14', a: 'zone1', b: 'zone4', sky: 115, calm: 116 },
];

/* 05 — конфлікти, місця з єдиним носієм, відкриті питання */
window.CONFLICTS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9'];
/* ok: true — колір уже продубльовано іншою ознакою */
window.SOLE = [
  { id: 'stake' }, { id: 'rbs' }, { id: 'sprint' }, { id: 'idle' }, { id: 'late' },
  { id: 'crit', ok: true }, { id: 'risk', ok: true },
];
window.QUESTIONS = { q1: ['a', 'b', 'c', 'd'], q2: ['a', 'b', 'c', 'd'], q3: ['a', 'b', 'c', 'd', 'e'] };

/* 06 — принципи простоти й два приклади */
window.PRINCIPLES = ['disclose', 'overview', 'clutter', 'modes', 'primary', 'empty'];
window.EXAMPLES = ['header', 'toolbar'];

/* 07 — кнопки: порядок у діалозі, орієнтири для панелі, розмір цілі,
   кількість варіантів, небезпечні дії, три схожі контроли */
window.OK_ORDER = ['win', 'apple', 'carbon-d', 'carbon-p', 'atl', 'govuk', 'nng'];
window.BAR_COUNTS = ['apple', 'carbon', 'winui', 'split'];
window.SIZES = ['w258', 'w255', 'plat'];
window.NUMBERS = ['hick', 'miller', 'myth', 'depth'];
window.DANGER = ['rare', 'apart', 'default'];
window.CONTROLS = ['tabs', 'seg', 'tg'];

/* 08 — розбір кнопок і панелей: що добре, знахідки, розмір цілей
   (v: ok — проходить за розміром, dist — за винятком «відстань», edge — на
   межі, bad — імовірно ні; усе за стилями, без вимірювання в браузері),
   де стоять «скасувати / повторити», варіанти складу */
window.GOOD = ['dialogs', 'icons', 'undo'];
window.FINDINGS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'];
window.TARGETS = [
  { id: 'z1', v: 'ok' }, { id: 'z2', v: 'dist' }, { id: 'z3', v: 'dist' },
  { id: 'z4', v: 'edge' }, { id: 'z5', v: 'bad' },
];
window.UNDO_PLACES = ['plan', 'wbs', 'add', 'none'];
/* mark — літера варіанта: Ш1–Ш3 для шапки, П1–П3 для панелі */
window.VARIANTS = { hd: { mark: 'Ш', list: ['1', '2', '3'] }, tb: { mark: 'П', list: ['1', '2', '3'] } };

/* 09 — як це роблять інші */
window.OTHERS = ['bars', 'figma', 'ribbon'];

/* 10 — чекліст із двох частин; номери наскрізні */
window.CHECK = [{ id: 'color', from: 1, to: 12 }, { id: 'place', from: 13, to: 22 }];

/* 11 — джерела: лише ті, на які є виноска в тексті. Номер виноски = місце в списку.
   Нові джерела дописуються в кінець, щоб номери наявних виносок не зсувались. */
window.SOURCES = [
  { id: 'apple', by: 'Apple', title: 'Human Interface Guidelines: Color', url: 'https://developer.apple.com/design/human-interface-guidelines/color' },
  { id: 'msproject', by: 'Microsoft Support', title: 'Show the critical path of your project in Project', url: 'https://support.microsoft.com/en-us/office/show-the-critical-path-of-your-project-in-project-ad6e3b08-7748-4231-afc4-a2046207fd86' },
  { id: 'pajamas', by: 'GitLab Pajamas', title: 'Product foundations: Color', url: 'https://design.gitlab.com/product-foundations/color' },
  { id: 'carbon-status', by: 'IBM Carbon', title: 'Status indicators (pattern)', url: 'https://carbondesignsystem.com/patterns/status-indicator-pattern/' },
  { id: 'm3', by: 'Google, Android Developers', title: 'Material Design 3 in Compose', url: 'https://developer.android.com/develop/ui/compose/designsystems/material3' },
  { id: 'atlassian', by: 'Atlassian Design System', title: 'Foundations: Color', url: 'https://atlassian.design/foundations/color' },
  { id: 'brewer', by: 'C. Brewer, ColorBrewer', title: 'Color scheme types', url: 'https://colorbrewer2.org/learnmore/schemes_full.html' },
  { id: 'few', by: 'S. Few, Perceptual Edge', title: 'Practical Rules for Using Color in Charts (2008)', url: 'https://www.perceptualedge.com/articles/visual_business_intelligence/rules_for_using_color.pdf' },
  { id: 'stone', by: 'M. Stone', title: 'Choosing Colors for Data Visualization (2006)', url: 'https://www.makinggood.ac.nz/media/1277/stone_2007_choosing_colors.pdf', note: 'stone' },
  { id: 'pajamas-viz', by: 'GitLab Pajamas', title: 'Data visualization: Color', url: 'https://design.gitlab.com/data-visualization/color' },
  { id: 'carbon-viz', by: 'IBM Carbon', title: 'Data visualization: Color palettes', url: 'https://carbondesignsystem.com/data-visualization/color-palettes/' },
  { id: 'healey', by: 'C. Healey, NC State University', title: 'Perception in Visualization', url: 'https://www.csc2.ncsu.edu/faculty/healey/PP/' },
  { id: 'wcag141', by: 'W3C WAI', title: 'Understanding SC 1.4.1 Use of Color (WCAG 2.2)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html' },
  { id: 'wcag143', by: 'W3C WAI', title: 'Understanding SC 1.4.3 Contrast (Minimum)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html' },
  { id: 'wcag1411', by: 'W3C WAI', title: 'Understanding SC 1.4.11 Non-text Contrast', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html' },
  { id: 'nei', by: 'National Eye Institute', title: 'Color Blindness', url: 'https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness' },
  { id: 'okabe', by: 'M. Okabe, K. Ito', title: 'Color Universal Design (2002, оновл. 2008)', url: 'https://jfly.uni-koeln.de/color/' },
  { id: 'heuristics', by: 'J. Nielsen, NN/g', title: '10 Usability Heuristics for User Interface Design (1994, оновл. 2020)', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/' },
  { id: 'nielsen-pd', by: 'J. Nielsen, NN/g', title: 'Progressive Disclosure (2006)', url: 'https://www.nngroup.com/articles/progressive-disclosure/' },
  { id: 'shneiderman', by: 'B. Shneiderman', title: 'The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations (1996)', url: 'https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf' },
  { id: 'kaplan', by: 'K. Kaplan, NN/g', title: '8 Design Guidelines for Complex Applications (2020)', url: 'https://www.nngroup.com/articles/complex-application-design/' },
  { id: 'modes', by: 'P. Laubheimer, NN/g', title: 'Modes in User Interfaces (2019)', url: 'https://www.nngroup.com/articles/modes/' },
  { id: 'carbon-button', by: 'IBM Carbon', title: 'Button: Usage', url: 'https://carbondesignsystem.com/components/button/usage/' },
  { id: 'empty', by: 'K. Kaplan, NN/g', title: 'Designing Empty States in Complex Applications (2021)', url: 'https://www.nngroup.com/articles/empty-state-interface-design/' },
  { id: 'ribbons', by: 'Microsoft Learn', title: 'Ribbons (Windows UX guidelines)', url: 'https://learn.microsoft.com/en-us/windows/win32/uxguide/cmd-ribbons' },
  { id: 'jira', by: 'Atlassian Support', title: 'Change color of work item schedule bars on your timeline', url: 'https://support.atlassian.com/jira-software-cloud/docs/change-color-of-issue-schedule-bars-on-your-roadmap/' },
  { id: 'figma', by: 'Figma Blog', title: 'Inside the redesigned Figma (2024)', url: 'https://www.figma.com/blog/behind-our-redesign-ui3/', note: 'figma' },
  // ── розташування й кількість елементів керування ──
  { id: 'okcancel', by: 'J. Nielsen, NN/g', title: 'OK–Cancel or Cancel–OK? The Trouble With Buttons (2008)', url: 'https://www.nngroup.com/articles/ok-cancel-or-cancel-ok/' },
  { id: 'win-dialog', by: 'Microsoft Learn', title: 'Dialog Boxes (Windows 7 UX guide)', url: 'https://learn.microsoft.com/en-us/windows/win32/uxguide/win-dialog-box', note: 'win7' },
  { id: 'win-cmdbar', by: 'Microsoft Learn', title: 'Command bar (Windows apps)', url: 'https://learn.microsoft.com/en-us/windows/apps/design/controls/command-bar' },
  { id: 'apple-alerts', by: 'Apple', title: 'Human Interface Guidelines: Alerts', url: 'https://developer.apple.com/design/human-interface-guidelines/alerts' },
  { id: 'carbon-modal', by: 'IBM Carbon', title: 'Modal: Usage', url: 'https://carbondesignsystem.com/components/modal/usage/' },
  { id: 'atl-modal', by: 'Atlassian Design System', title: 'Modal dialog: Usage', url: 'https://atlassian.design/components/modal-dialog/usage' },
  { id: 'govuk-button', by: 'GOV.UK Design System', title: 'Button', url: 'https://design-system.service.gov.uk/components/button/' },
  { id: 'win-toolbars', by: 'Microsoft Learn', title: 'Toolbars (Windows 7 UX guide)', url: 'https://learn.microsoft.com/en-us/windows/win32/uxguide/cmd-toolbars', note: 'win7' },
  { id: 'apple-toolbars', by: 'Apple', title: 'Human Interface Guidelines: Toolbars', url: 'https://developer.apple.com/design/human-interface-guidelines/toolbars' },
  { id: 'carbon-table', by: 'IBM Carbon', title: 'Data table: Usage', url: 'https://carbondesignsystem.com/components/data-table/usage/' },
  { id: 'split', by: 'P. Laubheimer, NN/g', title: 'Split Buttons: Definition (2019)', url: 'https://www.nngroup.com/articles/split-buttons/' },
  { id: 'ctxmenu', by: 'K. Kaplan, NN/g', title: 'Designing Effective Contextual Menus: 10 Guidelines (2025)', url: 'https://www.nngroup.com/articles/contextual-menus-guidelines/' },
  { id: 'accel', by: 'R. Krause, A. Harley, NN/g', title: 'Accelerators Maximize Efficiency in User Interfaces (2024)', url: 'https://www.nngroup.com/articles/ui-accelerators/' },
  { id: 'mackenzie', by: 'I. S. MacKenzie', title: 'Fitts\' law as a research and design tool in human-computer interaction. Human-Computer Interaction, 7, 91–139 (1992)', url: 'https://www.yorku.ca/mack/hci1992.html' },
  { id: 'fitts', by: 'R. Budiu, NN/g', title: 'Fitts\'s Law and Its Applications in UX (2022)', url: 'https://www.nngroup.com/articles/fitts-law/' },
  { id: 'wcag258', by: 'W3C WAI', title: 'Understanding SC 2.5.8 Target Size (Minimum), WCAG 2.2', url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html' },
  { id: 'wcag255', by: 'W3C WAI', title: 'Understanding SC 2.5.5 Target Size (Enhanced)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html' },
  { id: 'apple-buttons', by: 'Apple', title: 'Human Interface Guidelines: Buttons', url: 'https://developer.apple.com/design/human-interface-guidelines/buttons' },
  { id: 'apple-a11y', by: 'Apple', title: 'Human Interface Guidelines: Accessibility', url: 'https://developer.apple.com/design/human-interface-guidelines/accessibility' },
  { id: 'android', by: 'Google, Android Developers', title: 'Make apps more accessible', url: 'https://developer.android.com/guide/topics/ui/accessibility/apps' },
  { id: 'win-target', by: 'Microsoft Learn', title: 'Targeting (Windows apps)', url: 'https://learn.microsoft.com/en-us/windows/apps/design/input/guidelines-for-targeting' },
  { id: 'win-spacing', by: 'Microsoft Learn', title: 'Content layout and spacing (Windows apps)', url: 'https://learn.microsoft.com/en-us/windows/apps/design/basics/content-basics' },
  { id: 'hick-wiki', by: 'Wikipedia', title: 'Hick\'s law', url: 'https://en.wikipedia.org/wiki/Hick%27s_law', note: 'illus' },
  { id: 'liu', by: 'W. Liu, J. Gori, O. Rioul, M. Beaudouin-Lafon, Y. Guiard', title: 'How Relevant is Hick\'s Law for HCI? CHI 2020', url: 'https://researchportal.ip-paris.fr/en/publications/how-relevant-is-hicks-law-for-hci/', note: 'abstract' },
  { id: 'miller', by: 'G. A. Miller', title: 'The Magical Number Seven, Plus or Minus Two. Psychological Review, 63, 81–97 (1956)', url: 'http://psychclassics.yorku.ca/Miller/' },
  { id: 'cowan', by: 'N. Cowan', title: 'The magical number 4 in short-term memory. Behavioral and Brain Sciences, 24(1), 87–114 (2001)', url: 'https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/magical-number-4-in-shortterm-memory-a-reconsideration-of-mental-storage-capacity/44023F1147D4A1D44BDC0AD226838496', note: 'abstract' },
  { id: 'stm', by: 'J. Nielsen, NN/g', title: 'Short-Term Memory and Web Usability (2009)', url: 'https://www.nngroup.com/articles/short-term-memory-and-web-usability/' },
  { id: 'dix', by: 'A. Dix', title: 'Menu breadth — not a case of Miller\'s 7±2 (додаток до підручника «Human–Computer Interaction»)', url: 'https://hcibook.com/e3/online/menu-breadth' },
  { id: 'menus', by: 'P. Laubheimer, NN/g', title: 'Menu-Design Checklist: 17 UX Guidelines (2024)', url: 'https://www.nngroup.com/articles/menu-design/' },
  { id: 'apple-menus', by: 'Apple', title: 'Human Interface Guidelines: Menus', url: 'https://developer.apple.com/design/human-interface-guidelines/menus' },
  { id: 'confirm', by: 'J. Nielsen, NN/g', title: 'Confirmation Dialogs Can Prevent User Errors — If Not Overused (2018)', url: 'https://www.nngroup.com/articles/confirmation-dialog/' },
  { id: 'win-confirm', by: 'Microsoft Learn', title: 'Confirmations (Windows 7 UX guide)', url: 'https://learn.microsoft.com/en-us/windows/win32/uxguide/mess-confirm', note: 'win7' },
  { id: 'wcag334', by: 'W3C WAI', title: 'Understanding SC 3.3.4 Error Prevention (Legal, Financial, Data)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html' },
  { id: 'cancel-close', by: 'A. Harley, NN/g', title: 'Cancel vs Close: Design to Distinguish the Difference (2019)', url: 'https://www.nngroup.com/articles/cancel-vs-close/' },
  { id: 'icons', by: 'A. Harley, NN/g', title: 'Icon Usability (2014)', url: 'https://www.nngroup.com/articles/icon-usability/' },
  { id: 'tooltips', by: 'A. Kendrick, NN/g', title: 'Tooltip Guidelines (2019)', url: 'https://www.nngroup.com/articles/tooltip-guidelines/' },
  { id: 'wcag253', by: 'W3C WAI', title: 'Understanding SC 2.5.3 Label in Name', url: 'https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html' },
  { id: 'wcag324', by: 'W3C WAI', title: 'Understanding SC 3.2.4 Consistent Identification', url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html' },
  { id: 'proximity', by: 'A. Harley, NN/g', title: 'Proximity Principle in Visual Design (2020)', url: 'https://www.nngroup.com/articles/gestalt-proximity/' },
  { id: 'region', by: 'A. Harley, NN/g', title: 'The Principle of Common Region (2020)', url: 'https://www.nngroup.com/articles/common-region/' },
  { id: 'wcag323', by: 'W3C WAI', title: 'Understanding SC 3.2.3 Consistent Navigation', url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html' },
  { id: 'carbon-tabs', by: 'IBM Carbon', title: 'Tabs: Usage', url: 'https://carbondesignsystem.com/components/tabs/usage/' },
  { id: 'tabs', by: 'E. Sunwall, NN/g', title: 'Tabs, Used Right (2024; оновлення статті 2007 року)', url: 'https://www.nngroup.com/articles/tabs-used-right/' },
  { id: 'carbon-switcher', by: 'IBM Carbon', title: 'Content switcher: Usage', url: 'https://carbondesignsystem.com/components/content-switcher/usage/' },
  { id: 'apple-seg', by: 'Apple', title: 'Human Interface Guidelines: Segmented controls', url: 'https://developer.apple.com/design/human-interface-guidelines/segmented-controls' },
  { id: 'toggle', by: 'A. Kendrick, NN/g', title: 'Toggle-Switch Guidelines (2018)', url: 'https://www.nngroup.com/articles/toggle-switch-guidelines/' },
  { id: 'govuk-tabs', by: 'GOV.UK Design System', title: 'Tabs', url: 'https://design-system.service.gov.uk/components/tabs/' },
  { id: 'tables', by: 'P. Laubheimer, NN/g', title: 'Data Tables: Four Major User Tasks (2022)', url: 'https://www.nngroup.com/articles/data-tables/' },
];
