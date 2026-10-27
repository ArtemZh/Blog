/* Стаття 36: табло цифр зйомок статті 35 і монтажний таймлайн «без скіла / зі скілом» (сесія 34 проти сесії 35).
   Усі числа — з журналу сесії 20.10.2026, розрахунок: ship-pipeline/prod-36/extract.py → data.json. Тексти повідомлень не зберігаються,
   лише хвилина активного часу, тип правки й ворота. Стилі — у sk-prod.css. */
(function () {
  const slot = document.getElementById('sk-board'); if (!slot) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.SK_SND) SK_SND.fx(k, a); };

  // Табло: статті 35 від теми до прем’єри
  const N = [[6, 'повідомлень власника за всю статтю'], [3, 'правки: 2 — вигляд, 1 — процес'], [52, 'хвилини від теми до прем’єри'],
    [31, 'пошуковий запит у дослідженні'], [13, 'самовиправлень Claude після власних перевірок']];

  // Доріжки: «хвилина тип ворота» (тип: v вигляд, f факти, s звук, t текст, p процес, g без правки; велика літера — повторна правка)
  const A34 = '0g2 14t1 18p 19v1 35g 36g 36v 38v 41v 43v 44v 45t 47t 48v 48v 51v 55v21 68t 70s21 73v1 74s 91p 94p 94p 96t 108fp 119g 127v 130p 131v 134v 136g1 137v 142v 142v 144v21 148f2 149p 150v2 152v2 152v 154v21 164v1 165s 167v 167v 168g1 169v1 171v 173v 174p 175f 181f2 187v 190v 192v 193v 194v 194g1 198g 199v1 200v 201V 202v 202v1 203v 204p 205v 207s1 209s 209g1 209v 212v 212v 212v1 216v1 218v 220v1 220tp 220v1 221v1 222t 224g1 225v 226V 226v1 229v 233v1 243F2 245pp 248v1 251v 252v 253g 253g1 255v1 256v1 260s 261v 265f1 270p 271p 272p 273v 273g 274v 275V 278v 279s 282g 284v 285v21 288v 295V 298v 300v 301v 303v 304v 308g 310t 310v 311v1 328p 331v 332g1 334s 336v 337v 337v 339s 340s 342s 354s 362s 371v 374v 375s 376s 376v 387v 399v 402s 403gp 404v 404v 406g 410t 414t 418s 419t1 420v1 420s 421v 424t 426v 427v 428g 428v 430v 430s2p 433v 435v1 437v 437g1 444v 447v2 448g 450g1 452V 458gp 466v 467v1 467v 478v1 488v 501g1 503gp';
  const A35 = '0g2 17p1 34g1 38vp 45v 52gp';
  // Нумеровані питання Claude в чаті: «хвилина×кількість»
  const Q34 = '1x3 208x1 226x1 236x1 252x2 261x2 271x1 273x3 284x1 304x1 311x2 340x2 343x1 355x2 418x1 428x1', Q35 = '4x3 32x2';
  const parse = (s) => s.split(' ').map((x) => { const m = x.match(/^(\d+)([a-zA-Z])(\w*)$/); return { m: +m[1], k: m[2], g: m[3] }; });
  const parseQ = (s) => s.split(' ').map((x) => x.split('x').map(Number));
  const SIDE = [
    { id: 34, name: 'до скіла · стаття 34', len: 503, hours: '8,4 год', msgs: 178, edits: 153, rep: 6, tr: parse(A34), q: parseQ(Q34),
      asks: '25 нумерованих питань у 16 повідомленнях — по ходу зйомки: «Назва?», «Перемикач робимо одразу чи потім?», «Додати взаємні посилання?»…' },
    { id: 35, name: 'підхід, що став скілом · стаття 35', len: 52, hours: '52 хв', msgs: 6, edits: 3, rep: 0, tr: parse(A35), q: parseQ(Q35),
      asks: '9 питань одним списком у плані, до «11»: назва, номер, головна сцена, бейджі, живі дані, 3D, музика, тексти, чи ховати сторінку. У чаті — ще 5.' }];
  const KIND = { v: 'вигляд', f: 'факти', s: 'звук', t: 'текст', p: 'процес' };

  const box = document.createElement('div'); box.className = 'skb';
  box.innerHTML = `<div class="skb-nums">${N.map(([v, l]) => `<div class="skb-n"><b data-v="${v}">${REDUCE ? v : 0}</b><span>${l}</span></div>`).join('')}</div>
    <p class="skb-src">з журналу сесії, 20.10.2026 · стаття 35 «Рецесія в США»</p>
    <div class="skb-ed"><div class="skb-ed__h"><b>Той самий жанр — до скіла і з підходом, що став скілом</b>
      <label class="skb-sw"><span data-s="0">34</span><input type="range" min="0" max="100" value="0" aria-label="До скіла — з підходом, що став скілом"><span data-s="1">35</span></label></div>
      <div class="skb-tl">
        <em>власник</em><div class="skb-lane" data-l="msg"></div>
        <em>ворота</em><div class="skb-lane" data-l="gate"></div>
        <em>питання</em><div class="skb-lane" data-l="q"></div>
        <em>тривалість</em><div class="skb-dur"><i></i></div>
      </div>
      <div class="skb-leg"><span><i style="background:#4678DC"></i>вигляд</span><span><i style="background:#1E968C"></i>факти</span><span><i style="background:#8C64F0"></i>звук</span><span><i style="background:#B4823C"></i>текст</span><span><i style="background:#4B515C"></i>процес</span><span><i style="background:var(--act)"></i>повторна правка</span><span><i style="background:var(--ink-3)"></i>без правки</span></div>
      <div class="skb-stats"></div><p class="skb-asks"></p>
      <p class="skb-note">Ліворуч — справжня сесія 34 (18–20.10), праворуч — 35 (20.10). 35 знято тим підходом, який одразу після неї записано у скіл. Правки 34 розкладено за ключовими словами — це оцінка; 35 — вручну. Доріжки розтягнуто на свою тривалість, справжню довжину показує смуга; активний час — без перерв, довших за 15 хв.</p></div>`;
  slot.appendChild(box);

  // Монтажні доріжки обох сесій: шари одне над одним, повзунок змішує прозорість
  const lanes = {}; box.querySelectorAll('.skb-lane').forEach((l) => { lanes[l.dataset.l] = l; });
  const layers = SIDE.map((S) => {
    const pct = (m) => (Math.min(m, S.len) / S.len * 96 + 2).toFixed(2) + '%';
    const L = {};
    L.msg = document.createElement('div');
    L.msg.innerHTML = S.tr.map((c) => `<i class="skb-clip ${c.k.toLowerCase()}${c.k !== c.k.toLowerCase() ? ' rep' : ''}" style="left:${pct(c.m)}" title="${KIND[c.k.toLowerCase()] || 'без правки'}${c.k !== c.k.toLowerCase() ? ' · повторна' : ''}"></i>`).join('');
    L.gate = document.createElement('div');
    L.gate.innerHTML = S.tr.filter((c) => c.g).map((c) => `<span class="skb-gt${c.m / S.len > .8 ? ' r' : ''}" style="left:${pct(c.m)}">${S.id === 35 ? `<i>${c.g.replace('2', '22 ').replace('1', '11 ').replace('p', 'пуш').trim()}</i>` : ''}</span>`).join('');
    L.q = document.createElement('div');
    L.q.innerHTML = S.q.map(([m, n]) => `<span class="skb-q" style="left:${pct(m)}" title="${n} пит."></span>`).join('');
    Object.keys(L).forEach((k) => lanes[k].appendChild(L[k]));
    return L;
  });
  const dur = box.querySelector('.skb-dur i'), stats = box.querySelector('.skb-stats'), asks = box.querySelector('.skb-asks');
  const inp = box.querySelector('input'), sl = [...box.querySelectorAll('.skb-sw span')];
  let side = -1;
  function paint() {
    const v = inp.value / 100;
    layers.forEach((L, j) => { const o = j ? v : 1 - v; Object.values(L).forEach((d) => { d.style.opacity = o.toFixed(2); d.style.pointerEvents = o > .5 ? '' : 'none'; }); });
    dur.style.width = ((1 - v) * 100 + v * (52 / 503 * 100)).toFixed(1) + '%';
    const s = v < .5 ? 0 : 1; if (s === side) return; side = s; const S = SIDE[s];
    sl.forEach((x, j) => x.classList.toggle('on', j === s));
    stats.innerHTML = `<div><b>${S.msgs}</b>повідомлень власника</div><div><b>${S.edits}</b>правок${s ? '' : ' (оцінка)'}</div><div><b>${S.rep}</b>повторних правок</div><div><b>${S.hours}</b>активного часу</div>`;
    asks.innerHTML = `<b>питання Claude</b>${S.asks}`;
  }
  inp.addEventListener('input', paint);
  inp.addEventListener('change', () => SND('station', side ? 3 : 0));
  paint();

  // Числа набігають, коли табло з’являється
  const bs = [...box.querySelectorAll('.skb-n b')];
  if (!REDUCE) {
    const io = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; io.disconnect(); const t0 = performance.now();
      (function tick(now) { const k = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
        bs.forEach((b) => { b.textContent = Math.round(+b.dataset.v * e); }); if (k < 1) requestAnimationFrame(tick); })(t0); }, { threshold: .4 });
    io.observe(box.querySelector('.skb-nums'));
  }
})();
