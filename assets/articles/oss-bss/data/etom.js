/* Операційна частина eTOM, спрощено: чотири горизонталі × чотири вертикалі.
   sys — хто зазвичай це реалізує (одна змінна для підсвітки).
   api — типові Open API клітинки. Назви процесів L2 — у copy.csv:
   etom.<row>.<col>. */
window.ETOM = {
  cols: ['osr', 'f', 'a', 'b'],
  rows: [
    { id: 'crm', cells: {
      osr: { sys: 'bss', api: ['TMF629', 'TMF632'] },
      f: { sys: 'bss', api: ['TMF620', 'TMF622', 'TMF679'] },
      a: { sys: 'bss', api: ['TMF621', 'TMF681'] },
      b: { sys: 'bss', api: ['TMF678', 'TMF676', 'TMF666'] },
    } },
    { id: 'sm', cells: {
      osr: { sys: 'oss', api: ['TMF633'] },
      f: { sys: 'oss', api: ['TMF641', 'TMF640', 'TMF638'] },
      a: { sys: 'oss', api: ['TMF656', 'TMF657'] },
      b: { sys: 'bss oss', api: ['TMF635'] },
    } },
    { id: 'rm', cells: {
      osr: { sys: 'oss', api: ['TMF634'] },
      f: { sys: 'oss', api: ['TMF652', 'TMF702', 'TMF639'] },
      a: { sys: 'oss', api: ['TMF642', 'TMF628'] },
      b: { sys: 'oss', api: ['TMF635'] },
    } },
    { id: 'sp', cells: {
      osr: { sys: 'bss', api: ['TMF668', 'TMF632'] },
      f: { sys: 'bss', api: ['TMF622'] },
      a: { sys: 'bss oss', api: ['TMF621'] },
      b: { sys: 'bss', api: ['TMF635', 'TMF678'] },
    } },
  ],
};

/* Шари ODA: від «що робимо» до «як запускаємо». */
window.ODA = ['etom', 'sid', 'tam', 'api', 'comp', 'ctk'];
