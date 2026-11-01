/* Стаття 39, розділ 09: карта залежностей на весь екран. Рушій comp.js не змінюється: той самий вузол .cbox стає шаром на все вікно.
   Масштаб колесом, щипком і кнопками, перетягування, картка вузла збоку. Вихід кнопкою й Esc; сторінка лишається там, де була. */
(function () {
  const host = document.querySelector('.cbox[data-comp="oc"]'); if (!host) return;
  const stage = host.querySelector('.cstage'); if (!stage) return;
  const fit = stage.parentElement, bar = host.querySelector('.cscen'), W = parseFloat(stage.style.width), H = parseFloat(stage.style.height);
  const ui = document.createElement('div'); ui.className = 'oc-fs__ui';
  ui.innerHTML = `<button type="button" class="rc-btn oc-glow" data-fs>⛶ На весь екран</button><span data-z hidden><button type="button" class="rc-btn" data-zo aria-label="Зменшити">−</button><button type="button" class="rc-btn" data-zi aria-label="Збільшити">+</button><button type="button" class="rc-btn" data-z0>Уся карта</button></span>`;
  host.insertBefore(ui, host.firstChild);
  const leg = document.createElement('p'); leg.className = 'oc-fs__leg'; leg.innerHTML = '<i class="a"></i>шлях сигналу<i class="b"></i>від чого залежить'; host.insertBefore(leg, ui.nextSibling);
  const card = document.createElement('div'); card.className = 'oc-fs__card'; card.hidden = true; host.appendChild(card);
  const btn = ui.querySelector('[data-fs]'), zs = ui.querySelector('[data-z]');
  let open = false, z = 1, pts = new Map(), d0 = 0, z0 = 1, drag = null, moved = 0;
  const setZ = (v, cx, cy) => { const r = fit.getBoundingClientRect(), ax = cx === undefined ? r.width / 2 : cx - r.left, ay = cy === undefined ? r.height / 2 : cy - r.top, wx = (fit.scrollLeft + ax) / z, wy = (fit.scrollTop + ay) / z; z = Math.max(.35, Math.min(3, v)); stage.style.zoom = z; fit.scrollLeft = wx * z - ax; fit.scrollTop = wy * z - ay; };
  const fitAll = () => { const r = fit.getBoundingClientRect(); setZ(Math.min(2, Math.min((r.width - 16) / W, (r.height - 16) / H))); fit.scrollLeft = 0; fit.scrollTop = 0; };
  function toggle(v) {
    open = v; host.classList.toggle('is-fs', v); document.documentElement.classList.toggle('oc-noscroll', v); zs.hidden = !v; btn.textContent = v ? '✕ Вийти' : '⛶ На весь екран'; btn.classList.remove('oc-glow');
    if (v) { fit.classList.add('oc-fs__view'); requestAnimationFrame(() => { fitAll(); if (innerWidth < 620) { setZ(.66); fit.scrollLeft = 0; fit.scrollTop = 0; } }); btn.focus(); } else { fit.classList.remove('oc-fs__view'); stage.style.zoom = ''; z = 1; card.hidden = true; }
    if (window.OC_SND) OC_SND.fx('click');
  }
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(!open); });
  ui.querySelector('[data-zi]').addEventListener('click', (e) => { e.stopPropagation(); setZ(z * 1.25); });
  ui.querySelector('[data-zo]').addEventListener('click', (e) => { e.stopPropagation(); setZ(z / 1.25); });
  ui.querySelector('[data-z0]').addEventListener('click', (e) => { e.stopPropagation(); fitAll(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) toggle(false); });
  addEventListener('resize', () => { if (open) fitAll(); });
  fit.addEventListener('wheel', (e) => { if (!open) return; e.preventDefault(); setZ(z * Math.exp(-e.deltaY * .0016), e.clientX, e.clientY); }, { passive: false });
  fit.addEventListener('pointerdown', (e) => { if (!open) return; pts.set(e.pointerId, e); moved = 0; if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, l: fit.scrollLeft, t: fit.scrollTop }; if (pts.size === 2) { const [a, b] = [...pts.values()]; d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); z0 = z; drag = null; } });
  fit.addEventListener('pointermove', (e) => { if (!open || !pts.has(e.pointerId)) return; pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; setZ(z0 * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / (d0 || 1), (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); moved = 9; } else if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); fit.scrollLeft = drag.l - dx; fit.scrollTop = drag.t - dy; } });
  const up = (e) => { pts.delete(e.pointerId); if (!pts.size) drag = null; };
  fit.addEventListener('pointerup', up); fit.addEventListener('pointercancel', up);
  // після перетягування клік по вузлу не спрацьовує
  stage.addEventListener('click', (e) => { if (open && moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);
  // картка: текст уже перекладений у списку під схемою
  stage.addEventListener('click', (e) => { if (!open) return; const n = e.target.closest('.cnode'); if (!n) { card.hidden = true; return; } const id = n.id.slice(2), dat = (window.COMP_DATA.oc.nodes || []), i = dat.findIndex((a) => a.id === id); const dts = document.querySelectorAll('.clist dt'), dds = document.querySelectorAll('.clist dd'), order = window.COMP_DATA.oc.lanes.flatMap((l) => dat.filter((a) => a.lane === l.id)), k = order.findIndex((a) => a.id === id); if (i < 0 || k < 0 || !dts[k]) return; card.innerHTML = `<b>${dts[k].innerHTML}</b><p>${dds[k].innerHTML}</p>`; card.hidden = false; });
  window.__ocFs = { toggle, z: () => z };
})();
