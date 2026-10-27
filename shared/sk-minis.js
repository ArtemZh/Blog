/* Стаття 36: галерея мініатюр із Blender у стилі Masonry (ідея React Bits — переписано з нуля, без React і GSAP).
   Плитки різної висоти розкладаються «в найкоротшу колонку» (3 / 2 / 1 колонки за шириною); коли галерея з’являється
   на екрані, плитки по черзі випливають знизу з розмиття в різкість; при наведенні плитка трохи зменшується, кадр у ній
   ледь наближається, а підпис проступає. Висота плитки — частка ширини колонки, тож кадр 16:9 обрізається по-різному.
   prefers-reduced-motion — без польоту й розмиття. */
(function () {
  const box = document.getElementById('sk-minis'); if (!box) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...box.querySelectorAll('figure')];
  // висота плитки = ширина колонки × частка; чергування дає «цеглу» різної висоти
  const RATIO = [1.15, 0.62, 0.9, 1.25, 0.7, 1.0, 0.8];
  const GAP = 14;
  box.classList.add('is-masonry');
  function layout() {
    const W = box.clientWidth, cols = W >= 900 ? 3 : W >= 560 ? 2 : 1, cw = (W - GAP * (cols - 1)) / cols, colH = Array(cols).fill(0);
    items.forEach((f, i) => {
      const c = colH.indexOf(Math.min(...colH)), h = Math.round(cw * (cols === 1 ? 0.62 : RATIO[i % RATIO.length]));
      f.style.width = `${cw}px`; f.style.height = `${h}px`; f.style.left = `${c * (cw + GAP)}px`; f.style.top = `${colH[c]}px`;
      colH[c] += h + GAP;
    });
    box.style.height = `${Math.max(...colH) - GAP}px`;
  }
  new ResizeObserver(layout).observe(box); layout();
  if (REDUCE) { items.forEach((f) => f.classList.add('in')); return; }
  // поява: знизу, з розмиття, по черзі (крок 70 мс) — один раз, коли галерея вперше на екрані
  new IntersectionObserver((es, io) => { if (!es[0].isIntersecting) return; io.disconnect();
    items.forEach((f, i) => setTimeout(() => f.classList.add('in'), 120 + i * 70)); }, { threshold: 0.15 }).observe(box);
})();
