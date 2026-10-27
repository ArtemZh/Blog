/* Стаття 36, розділ 07 «За лаштунками»: як Claude відкриває скіл. Дані — знімок справжніх файлів (shared/sk-back-data.js).
   Запит власника → тригер в описі (опис завжди в контексті) → потрібні рядки SKILL.md → лише один довідник, якщо треба.
   Маршрут іде сам, по запиту що кілька секунд; клік по запиту — зупинка на ньому; ▶ — знову по колу.
   Лічильник показує, скільки слів скіла насправді потрапило в контекст для цього запиту. */
(function () {
  const s = document.getElementById('sk-back'), D = window.SK_BACK; if (!s || !D) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (k, a) => { if (window.SK_SND) SK_SND.fx(k, a); };
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const REFS = Object.keys(D.files).filter((f) => f !== 'SKILL.md');
  const TOTAL = D.descWords + Object.values(D.files).reduce((a, f) => a + f.words, 0);
  const SEC = [['Overview', 8], ['Owner protocol', 20], ['Pipeline', 28], ['Rules that came from mistakes', 42], ['Common mistakes', 65]];
  const secOf = (n) => SEC.reduce((a, x) => (n >= x[1] ? x[0] : a), SEC[0][0]);
  const nf = (n) => n.toLocaleString('uk-UA').replace(/ /g, ' ');

  const box = document.createElement('div'); box.className = 'skb';
  box.innerHTML = `<div class="skb-asks"><span class="skb-k">запит власника</span>${D.req.map((r, i) => `<button type="button" class="skb-ask" data-i="${i}">«${r.ask}»</button>`).join('')}<button type="button" class="rc-btn skb-auto" data-play>▶ по колу</button></div>
    <div class="skb-flow">
      <div class="skb-col" data-c="0"><span class="skb-k">завжди в контексті</span><div class="skb-card skb-desc"><b>опис · frontmatter</b><small>${D.descWords} слів</small><p translate="no"></p></div></div>
      <div class="skb-col" data-c="1"><span class="skb-k">коли запит збігся з описом</span><div class="skb-card skb-skill"><b>SKILL.md</b><small>${D.files['SKILL.md'].lines} рядків · ${nf(D.files['SKILL.md'].words)} слів</small>
        <ol>${SEC.map(([h, n]) => `<li data-s="${h}"><i>${n}</i>${h}</li>`).join('')}</ol></div></div>
      <div class="skb-col" data-c="2"><span class="skb-k">лише потрібний довідник</span>${REFS.map((f) => `<div class="skb-card skb-ref" data-f="${f}"><b>${f}</b><small>${D.files[f].lines} рядків · ${D.files[f].words} слів</small></div>`).join('')}</div>
      <i class="skb-dot" aria-hidden="true"></i>
    </div>
    <div class="skb-meter"><span class="skb-k">у контексті</span><div class="skb-bar"><i class="a"></i><i class="b"></i><i class="c"></i></div><b class="skb-num"></b></div>
    <div class="skb-code"><div class="skb-code__bar"><span>${D.dir}</span><em></em></div><pre translate="no"></pre></div>
    <p class="skb-cap">${window.PMP_LANG === 'en' ? 'Lines from the skill files as of' : 'Рядки — з файлів скіла на'} ${D.date.split('-').reverse().join('.')}${window.PMP_LANG === 'en' ? '; the skill is written in English, as Claude reads it.' : '; скіл написаний англійською, як його читає Claude.'}</p>`;
  s.appendChild(box);
  const asks = [...box.querySelectorAll('.skb-ask')], auto = box.querySelector('.skb-auto'), flow = box.querySelector('.skb-flow'), dot = box.querySelector('.skb-dot');
  const descP = box.querySelector('.skb-desc p'), lis = [...box.querySelectorAll('.skb-skill li')], refs = [...box.querySelectorAll('.skb-ref')];
  const cols = [...box.querySelectorAll('.skb-col')], pre = box.querySelector('.skb-code pre'), codeTag = box.querySelector('.skb-code__bar em');
  const bar = box.querySelectorAll('.skb-bar i'), num = box.querySelector('.skb-num');
  let cur = -1, timer = 0, typer = 0, hops = [];

  function descHtml(trig) { let h = esc(D.desc); if (trig) { const t = esc(trig), k = h.indexOf(t); if (k >= 0) h = h.slice(0, k) + `<mark>${t}</mark>` + h.slice(k + t.length); } return h; }
  // точка біжить від картки до картки: опис → SKILL.md → довідник
  function fly(path) { hops.forEach(clearTimeout); hops = []; const fr = flow.getBoundingClientRect();
    path.forEach((el, i) => hops.push(setTimeout(() => { if (!el) return; const r = el.getBoundingClientRect(); dot.style.transform = `translate(${r.left - fr.left + r.width / 2 - 6}px,${r.top - fr.top + 14}px)`; dot.classList.add('on');
      if (i === path.length - 1) hops.push(setTimeout(() => dot.classList.remove('on'), 900)); }, REDUCE ? 0 : i * 520))); }
  function type(lines) { clearInterval(typer); pre.innerHTML = ''; let i = 0;
    const put = () => { const [f, n, t] = lines[i]; const row = document.createElement('div'); row.className = 'ln' + (f !== 'SKILL.md' ? ' ref' : '');
      row.innerHTML = n == null ? `<span class="sep">${esc(t)}</span>` : `<i>${n}</i><span>${md(t) || ' '}</span>`; pre.appendChild(row); i++; };
    if (REDUCE) { while (i < lines.length) put(); return; }
    typer = setInterval(() => { if (i >= lines.length) { clearInterval(typer); return; } put(); }, 140); }

  function show(i) {
    cur = i; const r = D.req[i];
    asks.forEach((b, j) => b.classList.toggle('on', j === i));
    descP.innerHTML = descHtml(r.trig);
    const secs = new Set(r.skill.map(([n]) => secOf(n)));
    lis.forEach((li) => li.classList.toggle('on', secs.has(li.dataset.s)));
    refs.forEach((c) => { c.classList.toggle('on', c.dataset.f === r.ref); c.classList.toggle('off', !!r.ref && c.dataset.f !== r.ref); c.classList.toggle('none', !r.ref); });
    cols[2].classList.toggle('idle', !r.ref);
    // лічильник: опис + SKILL.md + довідник
    const a = D.descWords, b = D.files['SKILL.md'].words, c = r.ref ? D.files[r.ref].words : 0;
    bar[0].style.width = a / TOTAL * 100 + '%'; bar[1].style.width = b / TOTAL * 100 + '%'; bar[2].style.width = c / TOTAL * 100 + '%';
    num.innerHTML = `${nf(a + b + c)} <small>${window.PMP_LANG === 'en' ? 'of' : 'з'} ${nf(TOTAL)} ${window.PMP_LANG === 'en' ? 'words' : 'слів'} · ${r.ref ? 'опис + SKILL.md + 1 довідник' : 'опис + SKILL.md, довідник не потрібен'}</small>`;
    codeTag.textContent = r.ref ? `SKILL.md → ${r.ref}` : 'SKILL.md';
    const L = r.skill.map(([n, t]) => ['SKILL.md', n, t]);
    if (r.ref) L.push(['', null, `── ${r.ref} ──`], ...r.refLines.map(([n, t]) => [r.ref, n, t]));
    type(L);
    fly([box.querySelector('.skb-desc'), lis.find((li) => li.classList.contains('on')), r.ref ? refs.find((c) => c.dataset.f === r.ref) : null]);
    SND('station', i);
  }
  function stop() { clearInterval(timer); timer = 0; auto.classList.remove('on'); auto.textContent = '▶ по колу'; }
  function go() { auto.classList.add('on'); auto.textContent = '❚❚ пауза'; timer = setInterval(() => show((cur + 1) % D.req.length), REDUCE ? 4000 : 6500); }
  asks.forEach((b) => b.addEventListener('click', () => { stop(); show(+b.dataset.i); }));
  auto.addEventListener('click', () => { if (timer) stop(); else { show((cur + 1) % D.req.length); go(); } });
  // маршрут стартує сам, коли розділ на екрані; поза екраном — пауза
  let seen = false;
  new IntersectionObserver((es) => { const v = es[0].isIntersecting;
    if (v && !seen) { seen = true; show(0); if (!REDUCE) go(); } else if (!v && timer) stop(); }, { threshold: .35 }).observe(box);
  addEventListener('resize', () => { if (cur >= 0) fly([null]); });
})();
