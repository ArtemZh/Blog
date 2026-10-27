/* Стаття 36, розділ 08 «Фінальні титри»: «Спробуйте самі» — перший запит до Claude Code для своєї статті.
   Тема вводиться в поле або обирається з прикладів; запит складається наживо й копіюється однією кнопкою.
   Нижче — що відбувається після кожного слова власника («22», «11», «пуш») — за протоколом скіла (SKILL.md, Owner protocol і Pipeline). */
(function () {
  const s = document.getElementById('sk-try'); if (!s) return;
  const EN = window.PMP_LANG === 'en';
  const EX = EN ? ['the physics of “Dune”', 'why the Kyiv metro is so deep', 'how a PM estimates a project', 'the Chernobyl reactor, step by step']
    : ['фізика «Дюни»', 'чому київське метро таке глибоке', 'як PM оцінює проєкт', 'реактор Чорнобиля крок за кроком'];
  const PROMPT = (t) => EN ? `a new article in the same style as 35, topic — ${t}. Do an extended research 22` : `нова стаття в такому ж вигляді, як 35, тема — ${t}. Зроби розширений ресерч 22`;
  const STEPS = EN ? [
    ['22', 'plan only', 'Claude studies the previous article, searches several queries at once and writes PLAN-NN.md: concept, sections, one scene per section, data sources and numbered questions at the end. The code is not touched.'],
    ['you', 'answers in one line', '“1 yes 2 no 3 later 11” — answers to all questions at once. Whatever is not clear is asked before work starts, not halfway.'],
    ['11', 'the whole plan to the end', 'Data snapshot, images, page, scenes, reel and sound — without check-ins after each stage. The page is checked (syntax, console, 375 px) before you see it. One short report at the end.'],
    ['push', 'publication', 'Commit, push, waiting for the GitHub Pages build, a link. The new page stays hidden: it is not in the menu until you say otherwise.']]
    : [['22', 'лише план', 'Claude вивчає попередню статтю, шукає кількома запитами одночасно й пише PLAN-NN.md: концепція, розділи, по одній сцені на розділ, джерела даних і нумеровані питання наприкінці. Код не чіпає.'],
      ['ви', 'відповідаєте одним рядком', '«1 так 2 ні 3 потім 11» — відповіді на всі питання разом. Що незрозуміло — питають до початку роботи, а не посередині.'],
      ['11', 'увесь план до кінця', 'Знімок даних, картинки, сторінка, сцени, ролик і звук — без смикання після кожного етапу. Сторінку перевірено (синтаксис, консоль, 375 px) ще до того, як ви її побачите. Один короткий звіт наприкінці.'],
      ['пуш', 'публікація', 'Коміт, пуш, очікування збірки GitHub Pages, посилання. Нова сторінка схована: її немає в меню, доки ви не скажете інакше.']];
  const box = document.createElement('div'); box.className = 'skt';
  box.innerHTML = `<div class="skt-in"><label class="skt-k" for="sktTopic">${EN ? 'your topic' : 'ваша тема'}</label>
      <input id="sktTopic" type="text" value="${EX[0]}" autocomplete="off" spellcheck="false">
      <div class="skt-ex">${EX.map((e) => `<button type="button" data-t="${e}">${e}</button>`).join('')}</div></div>
    <div class="skt-prompt"><div class="skt-bar"><span>Claude Code</span><button type="button" class="rc-btn skt-copy">${EN ? 'copy' : 'скопіювати'}</button></div><p translate="no"></p></div>
    <ol class="skt-steps">${STEPS.map(([w, h, d]) => `<li><b>${EN ? '“' + w + '”' : '«' + w + '»'}</b><div><em>${h}</em><p>${d}</p></div></li>`).join('')}</ol>`;
  s.appendChild(box);
  const inp = box.querySelector('input'), out = box.querySelector('.skt-prompt p'), copy = box.querySelector('.skt-copy');
  const render = () => { const t = inp.value.trim() || (EN ? '…' : '…'); out.innerHTML = PROMPT(`<mark>${t.replace(/</g, '&lt;')}</mark>`).replace(/ 22$/, ' <b>22</b>'); };
  inp.addEventListener('input', render);
  box.querySelectorAll('.skt-ex button').forEach((b) => b.addEventListener('click', () => { inp.value = b.dataset.t; render(); out.parentElement.classList.remove('pop'); void out.offsetWidth; out.parentElement.classList.add('pop'); }));
  copy.addEventListener('click', async () => { const txt = PROMPT(inp.value.trim() || '…');
    try { await navigator.clipboard.writeText(txt); } catch (e) { const r = document.createRange(); r.selectNodeContents(out); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    copy.textContent = EN ? 'copied ✓' : 'скопійовано ✓'; setTimeout(() => { copy.textContent = EN ? 'copy' : 'скопіювати'; }, 1800); });
  render();
  // кроки з'являються по черзі, коли блок на екрані
  const lis = [...box.querySelectorAll('.skt-steps li')];
  new IntersectionObserver((es, io) => { if (!es[0].isIntersecting) return; io.disconnect(); lis.forEach((li, i) => setTimeout(() => li.classList.add('in'), 250 + i * 380)); }, { threshold: .25 }).observe(box);
})();
