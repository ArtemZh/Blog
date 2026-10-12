/* Схема 3 — що де лежить: тека проєкту на диску · база · чого в системі немає.
   Дріт від бази до диска — це шлях до файла замість його вмісту. Нижня смуга —
   тихий контекст без дротів: відсутність зв'язку тут і є фактом, тому ці вузли
   перелічено в loners перевірки, а не приховано. Смуги не згортаються. */
window.STORE = {
  width: 1240,
  cols: 4,
  key: [],
  bands: [
    { id: 'disk', groups: [
      { id: 'd0', label: false, nodes: ['d-meet', 'd-inbox'] },
      { id: 'd1', label: false, nodes: ['d-tool'] },
      { id: 'd2', label: false, nodes: ['d-out'] },
      { id: 'd3', label: false, nodes: ['d-plan'] },
    ] },
    { id: 'base', groups: [
      { id: 'b0', label: false, nodes: ['b-meet'] },
      { id: 'b1', label: false, nodes: ['b-tool'] },
      { id: 'b2', label: false, nodes: ['b-rec', 'b-journal'] },
      { id: 'b3', label: false, nodes: ['b-link'] },
    ] },
    { id: 'none', groups: [
      { id: 'n0', label: false, nodes: ['n-cloud'] },
      { id: 'n1', label: false, nodes: ['n-ai'] },
      { id: 'n2', label: false, nodes: ['n-net'] },
      { id: 'n3', label: false, nodes: ['n-direct'] },
    ] },
  ],
  edges: [
    { id: 'meet-path', from: 'b-meet', to: 'd-meet', api: 'path' },
    { id: 'tool-path', from: 'b-tool', to: 'd-tool', api: 'path' },
    { id: 'rec-out', from: 'b-rec', to: 'd-out', api: 'builds' },
    { id: 'link-plan', from: 'b-link', to: 'd-plan', api: 'planid' },
    { id: 'inbox-rec', from: 'd-inbox', to: 'b-rec', api: 'proposed' },
    { id: 'rec-journal', from: 'b-rec', to: 'b-journal', api: 'logs' },
  ],
};

window.STORE_FLOWS = [
  { id: 'st-meeting', steps: [
    { nodes: ['d-meet'], edges: [] },
    { nodes: ['b-meet', 'd-meet'], edges: ['meet-path'] },
    { nodes: ['d-inbox', 'b-rec', 'b-journal'], edges: ['inbox-rec', 'rec-journal'] },
  ] },
  { id: 'st-doc', steps: [
    { nodes: ['b-rec', 'd-out'], edges: ['rec-out'] },
    { nodes: ['b-tool', 'd-tool'], edges: ['tool-path'] },
    { nodes: ['b-link', 'd-plan'], edges: ['link-plan'] },
  ] },
];

window.STORE_INFO = {};
