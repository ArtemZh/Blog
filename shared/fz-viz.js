/* Стаття 37 «Flipper Zero»: усі сцени й «екрани» малюються кодом на canvas; без банера, без звуку, без 3D.
   Освітня подача: як працюють ІЧ/Sub-GHz/RFID/NFC концептуально, з погляду захисту. Без інструкцій обходу. */
(function () {
  'use strict';
  var ACC = '#e8641f', TEAL = '#16867c', BLUE = '#3a6fd8', GREEN = '#23843d', RED = '#d23b40', AMBER = '#a87a10',
      INK = '#15181d', DIM = '#6b7486', LINE = '#cfd5de', BG = '#ffffff', BOX = '#f4f5f7';
  var SCR_BG = '#ff9b2e', SCR_INK = '#1a1205';   // бурштиновий екран Flipper
  var MONO = '"Roboto Mono", ui-monospace, monospace', SANS = 'Inter, system-ui, sans-serif';
  function rr(x, X, Y, w, h, r) { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); }

  // мінікадр на canvas: height фіксована; реагує на зміну ширини вікна (без ResizeObserver-циклів)
  function mount(id, height, opt) {
    var host = document.getElementById(id); if (!host) return null;
    var cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;display:block;height:' + height + 'px';
    if (opt.click) cv.style.cursor = 'pointer';
    host.appendChild(cv);
    var ctx = cv.getContext('2d'), w = 0, h = height;
    function size() { var dpr = Math.min(2, window.devicePixelRatio || 1); w = host.clientWidth || 600; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    var api = { ctx: ctx, get w() { return w; }, get h() { return h; }, cv: cv, size: size };
    size();
    var lastW = w;
    window.addEventListener('resize', function () { if (host.clientWidth !== lastW) { lastW = host.clientWidth; size(); opt.draw && opt.draw(api); } });
    if (opt.click) cv.addEventListener('click', function (e) { var r = cv.getBoundingClientRect(); try { opt.click((e.clientX - r.left), (e.clientY - r.top), api); } catch (err) {} });
    try { opt.draw && opt.draw(api); } catch (err) {}
    return api;
  }
  // тло сцени — сама світла панель (.fz-panel), canvas прозорий: без «картки в картці»
  function clear(a) { a.ctx.clearRect(0, 0, a.w, a.h); }
  function T(x, s, X, Y, sz, col, al, wt, f) { x.font = (wt || 500) + ' ' + sz + 'px ' + (f || SANS); x.fillStyle = col; x.textAlign = al || 'left'; x.textBaseline = 'middle'; x.fillText(s, X, Y); }

  // ── герой: корпус Flipper, намальований кодом (не банер), і радіохвилі від його верхнього краю ──
  (function () {
    var cv = document.getElementById('fzWaves'); if (!cv) return; var x = cv.getContext('2d'), w, h;
    function size() { var dpr = Math.min(2, window.devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener('resize', size);
    var DOL = ['   ####    ', '  #    ##  ', ' #  o    # ', '#        ##', ' #  \\__/ # ', '  ##    #  ', '    ####   '];
    function device(cx, cy, bw, t) {
      var bh = bw * 0.4, X = cx - bw / 2, Y = cy - bh / 2, r = bh * 0.22;
      // корпус: білий, лівий край скошений, м'яка тінь
      x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = bw * 0.08; x.shadowOffsetY = bw * 0.03;
      x.beginPath(); x.moveTo(X + bw * 0.1, Y); x.lineTo(X + bw - r, Y); x.quadraticCurveTo(X + bw, Y, X + bw, Y + r); x.lineTo(X + bw, Y + bh - r); x.quadraticCurveTo(X + bw, Y + bh, X + bw - r, Y + bh);
      x.lineTo(X + bw * 0.1, Y + bh); x.lineTo(X, Y + bh * 0.68); x.lineTo(X, Y + bh * 0.32); x.closePath();
      var g = x.createLinearGradient(0, Y, 0, Y + bh); g.addColorStop(0, '#f6f6f7'); g.addColorStop(1, '#d9dadd'); x.fillStyle = g; x.fill(); x.restore();
      // екран: бурштиновий, із дельфіном
      var sw = bw * 0.36, sh = sw * 0.5, sx = X + bw * 0.14, sy = cy - sh / 2 - bh * 0.04;
      x.fillStyle = '#1c1c1e'; rr(x, sx - 5, sy - 5, sw + 10, sh + 10, 6); x.fill();
      x.fillStyle = '#ff9b2e'; x.fillRect(sx, sy, sw, sh);
      var px = sw / 64; x.fillStyle = '#1a1205';
      DOL.forEach(function (row, j) { for (var i = 0; i < row.length; i++) if (row[i] !== ' ') x.fillRect(sx + sw * 0.3 + i * px * 2, sy + sh * 0.22 + j * px * 2, px * 2, px * 2); });
      if ((t * 1.2) % 1 < 0.5) x.fillRect(sx + sw * 0.08, sy + sh * 0.12, px * 2, px * 2);
      // хрестовина й кнопка «назад»
      var dr = bh * 0.3, dx = X + bw * 0.7, dy = cy;
      x.fillStyle = '#f07a30'; x.beginPath(); x.arc(dx, dy, dr, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#e2661c'; x.beginPath(); x.arc(dx, dy, dr * 0.42, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#f07a30'; x.beginPath(); x.arc(X + bw * 0.88, cy + bh * 0.24, dr * 0.32, 0, Math.PI * 2); x.fill();
      x.font = '800 ' + Math.round(bh * 0.13) + 'px ' + SANS; x.fillStyle = '#f07a30'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FLIPPER', X + bw * 0.52, Y + bh * 0.86);
      return { ax: X + bw * 0.22, ay: Y };   // ІЧ-віконце — на верхньому краю
    }
    var t0 = performance.now();
    function frame(t) { if (document.hidden) { requestAnimationFrame(frame); return; }
      var tt = (t - t0) / 1000; x.clearRect(0, 0, w, h);
      var narrow = w < 720, bw = narrow ? Math.min(w * 0.62, 300) : Math.min(w * 0.34, 470), cx = narrow ? w * 0.5 : w * 0.73, cy = narrow ? h * 0.3 : h * 0.56;
      var ant = { ax: cx - bw / 2 + bw * 0.22, ay: cy - bw * 0.2 };
      for (var i = 0; i < 5; i++) { var p = (tt * 0.3 + i / 5) % 1, rad = 20 + p * Math.max(w, h) * 0.75;
        x.beginPath(); x.arc(ant.ax, ant.ay, rad, Math.PI * 1.05, Math.PI * 1.95); x.strokeStyle = 'rgba(240,122,48,' + (0.42 * (1 - p)).toFixed(3) + ')'; x.lineWidth = 2; x.stroke(); }
      device(cx, cy + Math.sin(tt * 1.3) * 3, bw, tt);
      requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  })();

  // ══ 01 · модульна мапа (HTML-чипи) ══
  (function () {
    var chips = document.getElementById('fzChips'), expl = document.getElementById('fzExpl'); if (!chips || !expl) return;
    var M = [
      ['Sub-GHz 433/868 МГц', 'Радіо', 'Чип CC1101 слухає й передає в діапазонах 300–928 МГц: брелоки шлагбаумів, бездротові дзвінки, давачі погоди, старі автосигналізації. Передавання обмежене регіоном і малою потужністю.'],
      ['NFC 13,56 МГц', 'Безконтакт', 'Чип ST25R3916: банківські картки, сучасні пропуски, транспортні картки. Тут криптографія — секретний ключ не залишає картку, тож проста копія не працює.'],
      ['RFID 125 кГц', 'Безконтакт', 'Окрема котушка для старих міток (EM4100, HID Prox). Такі мітки передають лише незмінний номер — тому історично їх і копіювали, і тому замінюють на захищені.'],
      ['Інфрачервоний', 'Світло', 'Приймач і потужний діод (940 нм). Записує й повторює пульти телевізорів, кондиціонерів, проєкторів. Діє лише в прямій видимості.'],
      ['iButton 1-Wire', 'Контакт', 'Контактні «таблетки» Dallas на дверях під\'їздів: торкнувся — прочитав ID. Теж здебільшого статичний номер.'],
      ['GPIO', 'Піни', '13 програмованих виводів 3,3 В: підключення зовнішніх модулів і давачів. Перетворює Flipper на платформу для електроніки.'],
      ['Bluetooth LE 5.4', 'Радіо', 'Зв\'язок із телефоном (застосунок), емуляція клавіатури/миші. Окреме радіоядро M0+ у тому ж чипі STM32WB55.'],
      ['USB-C', 'Дріт', 'Живлення, оновлення прошивки, доступ із комп\'ютера. Може прикидатися клавіатурою (BadUSB) — захист простий: блокуйте екран і не лишайте сесій відкритими.']
    ];
    M.forEach(function (m, i) { var b = document.createElement('button'); b.className = 'fz-chip'; b.textContent = m[0];
      b.addEventListener('click', function () { sel(i); }); chips.appendChild(b); });
    function sel(i) { [].forEach.call(chips.children, function (c, j) { c.classList.toggle('on', j === i); });
      expl.innerHTML = '<span class="f">' + M[i][1] + '</span><h4>' + M[i][0] + '</h4><p>' + M[i][2] + '</p>'; }
    sel(0);
  })();

  // ══ 02 · інфрачервоний NEC ══
  (function () {
    var host = document.getElementById('fzIr'); if (!host) return;
    var bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px';
    [['Power', 0x45], ['Vol +', 0x40], ['Канал 7', 0x07]].forEach(function (b) { var btn = document.createElement('button');
      btn.className = 'fz-chip'; btn.textContent = b[0]; btn.addEventListener('click', function () { play(b[1]); mark(btn); }); bar.appendChild(btn); });
    host.appendChild(bar);
    function mark(btn) { [].forEach.call(bar.children, function (c) { c.classList.toggle('on', c === btn); }); }
    var cmd = 0x45, segs = buildSegs(0x45), anim = null;
    var a = mount('fzIr', 200, { draw: function (a) { render(a, cmd, 1e9); } });
    function buildSegs(c) { // NEC: lead 9000/4500, 32 біти (addr/~addr/cmd/~cmd), 560 burst
      var s = [[9000, 1], [4500, 0]], bits = [], addr = 0x00;
      function push(byte) { for (var i = 0; i < 8; i++) bits.push((byte >> i) & 1); }
      push(addr); push((~addr) & 255); push(c); push((~c) & 255);
      bits.forEach(function (b) { s.push([560, 1]); s.push([b ? 1690 : 560, 0]); }); s.push([560, 1]);
      return s;
    }
    function play(c) { cmd = c; segs = buildSegs(c); var t0 = performance.now(), dur = 2600;
      if (anim) cancelAnimationFrame(anim);
      (function step(t) { var k = Math.min(1, (t - t0) / dur); render(a, c, k * 71000); if (k < 1) anim = requestAnimationFrame(step); else render(a, c, 1e9); })(performance.now());
    }
    function render(a, c, tcur) {
      clear(a); var x = a.ctx, w = a.w, pad = 16, y = 54, H = 40, total = 71000, sx = pad, scale = (w - pad * 2) / total;
      T(x, 'Протокол NEC · кнопка «' + (c === 0x45 ? 'Power' : c === 0x40 ? 'Vol +' : 'Канал 7') + '» · код 0x' + ('0' + c.toString(16)).slice(-2).toUpperCase(), pad, 22, 14, INK, 'left', 600, MONO);
      // сигнальна лінія: burst (ACC) / пауза (dim)
      var acc = 0, lampOn = false;
      for (var i = 0; i < segs.length; i++) { var len = segs[i][0], hi = segs[i][1], x0 = sx + acc * scale, ww = len * scale;
        var passed = tcur >= acc, within = tcur >= acc && tcur < acc + len;
        x.fillStyle = hi ? (passed ? ACC : 'rgba(232,100,31,.22)') : 'transparent';
        if (hi) { rr(x, x0, y, Math.max(1, ww), H, 2); x.fill(); }
        else { x.strokeStyle = 'rgba(133,145,166,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(x0, y + H); x.lineTo(x0 + ww, y + H); x.stroke(); }
        if (within && hi) lampOn = true; acc += len; }
      // діод-лампа
      var lx = w - 40, ly = 140; x.beginPath(); x.arc(lx, ly, 16, 0, Math.PI * 2);
      x.fillStyle = lampOn ? ACC : '#efe4da'; x.fill(); if (lampOn) { x.shadowColor = ACC; x.shadowBlur = 20; x.fill(); x.shadowBlur = 0; }
      T(x, 'ІЧ-діод', lx, ly + 28, 12.5, DIM, 'center', 500, MONO);
      // підпис частин
      T(x, '9 мс старт', pad, y + H + 20, 12, DIM, 'left', 500, MONO);
      T(x, '32 біти: адреса + команда (кожен з інверсією)', pad + 100, y + H + 20, 12, DIM, 'left', 500, MONO);
      T(x, 'вузький імпульс = 0 · широкий = 1 · несуча 38 кГц', pad, 178, 12.5, TEAL, 'left', 500, MONO);
    }
  })();

  // ══ 03 · Sub-GHz: фіксований проти плаваючого ══
  (function () {
    var host = document.getElementById('fzSub'); if (!host) return;
    var bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center';
    var tgl = document.createElement('div'); tgl.className = 'fz-seg';
    ['Старий брелок', 'Сучасний брелок'].forEach(function (lbl, i) { var b = document.createElement('button'); b.className = 'fz-chip';
      b.textContent = lbl; b.addEventListener('click', function () { mode = i ? 'roll' : 'fix'; st(b); reset(); }); tgl.appendChild(b); });
    bar.appendChild(tgl);
    function st(b) { [].forEach.call(tgl.children, function (c) { c.classList.toggle('on', c === b); }); }
    function btn(lbl, fn) { var b = document.createElement('button'); b.className = 'fz-chip'; b.textContent = lbl; b.addEventListener('click', fn); bar.appendChild(b); return b; }
    btn('Брелок власника', function () { press(); }); btn('Flipper: записати', function () { record(); }); btn('Flipper: повторити', function () { replay(); });
    host.appendChild(bar);
    var mode = 'fix', counter = 100, lastAir = null, recorded = null, gate = 0, msg = 'Оберіть тип брелока й натисніть «Брелок власника».', msgCol = DIM;
    tgl.children[0].classList.add('on');
    var a = mount('fzSub', 210, { draw: draw });
    function reset() { counter = 100; lastAir = null; recorded = null; gate = 0; msg = mode === 'fix' ? 'Фіксований код: той самий сигнал щоразу.' : 'Плаваючий код: щоразу новий одноразовий код.'; msgCol = DIM; draw(a); }
    function press() { if (mode === 'fix') { lastAir = 'C0DE'; } else { counter++; lastAir = 'рол#' + counter; } open(); msg = 'Брелок відкрив шлагбаум' + (mode === 'roll' ? ' (код #' + counter + ')' : '') + '.'; msgCol = GREEN; draw(a); }
    function record() { if (!lastAir) { msg = 'Спершу натисніть «Брелок власника» — Flipper чує сигнал.'; msgCol = AMBER; return draw(a); } recorded = lastAir; msg = 'Flipper записав сигнал: ' + recorded + '.'; msgCol = BLUE; draw(a); }
    function replay() { if (!recorded) { msg = 'Нема що повторювати — спершу «записати».'; msgCol = AMBER; return draw(a); }
      if (mode === 'fix') { open(); msg = '✓ Відкрито: фіксований код не змінюється, повтор спрацював.'; msgCol = RED; }
      else { msg = '✗ Відхилено: код #' + recorded.slice(4) + ' уже використано, приймач чекає новіший.'; msgCol = GREEN; }
      draw(a); }
    var gv = 0; function open() { gate = 1; gv = 1; (function fall() { gv *= 0.9; if (gv > 0.02) requestAnimationFrame(fall); else { gate = 0; gv = 0; } draw(a); })(); }
    function draw(a) { clear(a); var x = a.ctx, w = a.w; var fob = 70, flip = w / 2, g = w - 80, y = 70;
      // брелок
      x.fillStyle = BOX; rr(x, fob - 22, y - 26, 44, 52, 8); x.fill(); x.strokeStyle = LINE; x.stroke();
      x.fillStyle = ACC; x.beginPath(); x.arc(fob, y - 4, 7, 0, Math.PI * 2); x.fill(); T(x, 'брелок', fob, y + 44, 12.5, DIM, 'center', 500, MONO);
      // flipper
      x.fillStyle = BOX; rr(x, flip - 28, y - 28, 56, 56, 8); x.fill(); x.strokeStyle = LINE; x.stroke();
      x.fillStyle = SCR_BG; rr(x, flip - 20, y - 18, 40, 24, 3); x.fill(); T(x, recorded || '— — —', flip, y - 6, 10, SCR_INK, 'center', 600, MONO);
      T(x, 'Flipper', flip, y + 44, 12.5, DIM, 'center', 500, MONO);
      // шлагбаум
      x.strokeStyle = DIM; x.lineWidth = 3; x.beginPath(); x.moveTo(g, y + 20); x.lineTo(g, y - 20); x.stroke();
      x.save(); x.translate(g, y - 20); x.rotate(gate ? -Math.PI / 2.1 * gv - 0.0 : 0); x.fillStyle = gv > 0.3 ? GREEN : '#9aa6b8';
      rr(x, 0, -5, 60, 10, 3); x.fill(); x.restore(); T(x, 'шлагбаум', g, y + 44, 12.5, DIM, 'center', 500, MONO);
      // хвиля брелок→flipper і flipper→шлагбаум
      x.strokeStyle = 'rgba(133,145,166,.3)'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(fob + 24, y); x.lineTo(flip - 30, y); x.moveTo(flip + 30, y); x.lineTo(g - 10, y); x.stroke(); x.setLineDash([]);
      // лічильник (rolling)
      if (mode === 'roll') T(x, 'лічильник приймача: #' + counter, w - 16, 26, 12.5, DIM, 'right', 500, MONO);
      T(x, mode === 'fix' ? 'Фіксований код' : 'Плаваючий код (rolling)', 16, 26, 14, mode === 'fix' ? AMBER : TEAL, 'left', 600, MONO);
      T(x, msg, 16, a.h - 18, 14, msgCol, 'left', 600, SANS);
    }
    reset();
  })();

  // ══ 04 · RFID / NFC: чому копіюється або ні ══
  (function () {
    var host = document.getElementById('fzRfid'); if (!host) return;
    var bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px';
    var tgl = document.createElement('div'); tgl.className = 'fz-seg';
    ['125 кГц (стара мітка)', '13,56 МГц (картка)'].forEach(function (lbl, i) { var b = document.createElement('button'); b.className = 'fz-chip';
      b.textContent = lbl; b.addEventListener('click', function () { hf = !!i; sel(b); run(); }); tgl.appendChild(b); });
    bar.appendChild(tgl); var rb = document.createElement('button'); rb.className = 'fz-chip'; rb.textContent = 'Піднести ще раз'; rb.addEventListener('click', run); bar.appendChild(rb);
    host.appendChild(bar); tgl.children[0].classList.add('on');
    function sel(b) { [].forEach.call(tgl.children, function (c) { c.classList.toggle('on', c === b); }); }
    var hf = false, pkts = [], msg = '', msgCol = DIM, nonce = 0, prog = 1;
    function hex(n) { return ('000' + (n & 0xffff).toString(16).toUpperCase()).slice(-4); }
    var a = mount('fzRfid', 210, { draw: draw }), anim = null;
    function run() {
      pkts = []; if (anim) cancelAnimationFrame(anim);
      if (!hf) { pkts = [{ dir: 1, s: '?', col: DIM }, { dir: -1, s: 'ID: 1A2B3C', col: ACC }];
        msg = 'Мітка проказала незмінний номер — Flipper його записав. Повтор спрацює.'; msgCol = RED; }
      else { nonce = (Math.random() * 0xffff) | 0; var resp = hex((nonce * 40503) ^ 0x9E3B);
        pkts = [{ dir: 1, s: 'запит ' + hex(nonce), col: BLUE }, { dir: -1, s: 'відповідь ' + resp, col: TEAL }];
        msg = 'Відповідь порахована з секретним ключем і щоразу нова. Копія не підійде.'; msgCol = GREEN; }
      var t0 = performance.now(); (function step(t) { prog = Math.min(1, (t - t0) / 1600); draw(a); if (prog < 1) anim = requestAnimationFrame(step); })(performance.now());
    }
    function draw(a) { clear(a); var x = a.ctx, w = a.w, rx = 80, cx = w - 80, y = 78;
      T(x, hf ? '13,56 МГц · криптографія (запит → відповідь)' : '125 кГц · просте число', 16, 24, 14, hf ? TEAL : AMBER, 'left', 600, MONO);
      // зчитувач (Flipper) і картка
      x.fillStyle = BOX; rr(x, rx - 26, y - 30, 52, 60, 8); x.fill(); x.strokeStyle = LINE; x.stroke(); T(x, 'Flipper', rx, y + 48, 12.5, DIM, 'center', 500, MONO);
      x.fillStyle = BOX; rr(x, cx - 30, y - 22, 60, 44, 6); x.fill(); x.strokeStyle = LINE; x.stroke(); T(x, hf ? 'картка' : 'мітка', cx, y + 40, 12.5, DIM, 'center', 500, MONO);
      // пакети рухаються по лінії
      x.strokeStyle = 'rgba(133,145,166,.25)'; x.beginPath(); x.moveTo(rx + 28, y); x.lineTo(cx - 32, y); x.stroke();
      var span = (cx - 32) - (rx + 28);
      pkts.forEach(function (p, i) { var ph = Math.max(0, Math.min(1, prog * pkts.length - i)); if (ph <= 0) return;
        var from = p.dir > 0 ? rx + 28 : cx - 32, px = from + p.dir * span * ph;
        x.fillStyle = p.col; rr(x, px - 3, y - 3, 6, 6, 2); x.fill();
        T(x, p.s, (rx + cx) / 2, y - 18 - i * 0, 13, p.col, 'center', 600, MONO); });
      // підсумок
      if (!hf) { T(x, 'Flipper зберіг: 1A2B3C', rx, y + 66, 12, ACC, 'center', 500, MONO); T(x, '→ копія можлива', cx, y + 56, 12, RED, 'center', 600, MONO); }
      else { T(x, 'ключ лишається в картці', cx, y + 56, 12, GREEN, 'center', 500, MONO); }
      T(x, msg, 16, a.h - 18, 14, msgCol, 'left', 600, SANS);
    }
    run();
  })();

  // ══ 05 · таблиця прошивок ══
  (function () {
    var tb = document.querySelector('#fzFw tbody'), box = document.getElementById('fzFwx'); if (!tb || !box) return;
    var y = '<span class="y">так</span>', n = '<span class="n">ні</span>', p = '<span class="p">частк.</span>';
    var FW = [
      ['Офіційна', 'Flipper Devices · 1.5.1', n, n, p + ' (App Catalog)', '<span class="y">висока</span>',
        '<b>Офіційна прошивка.</b> Регіональний лок на передачу й свідома відмова надсилати захоплені плаваючі коди (лише список) — із правових міркувань. Натомість — стабільність, каталог застосунків, скрипти на JavaScript (із версії 1.0), 89 Sub-GHz протоколів. Рекомендована більшості.'],
      ['Unleashed', 'DarkFlippers', y, p, y, '<span class="y">висока</span>',
        '<b>Unleashed.</b> Знімає регіональний лок, додає частоти й протоколи, фаззери й аналізатор частот, дозволяє перейменувати пристрій. Позиціонує себе як найстабільніша кастомна. Зняття локу — на власний ризик і подекуди незаконне.'],
      ['Momentum', 'на базі Unleashed · mntm-012', y, p, y, '<span class="p">середня</span>',
        '<b>Momentum.</b> Акцент на вигляді й зручності: 8 стилів меню, центр керування, менеджер файлів, набори ассетів (анімації, іконки, шрифти) без перекомпіляції, JS-модулі, інструменти пошуку пристрою. База — Unleashed/Xtreme.'],
      ['RogueMaster', 'усе й одразу', y, p, y + ' (максимум)', '<span class="n">змінна</span>',
        '<b>RogueMaster.</b> «Кухонна раковина»: максимум плагінів, ігор, експериментальних функцій. За це платить стабільністю — падає найчастіше, тож не найкращий вибір для пристрою, який носиш щодня.']
    ];
    FW.forEach(function (r, i) { var tr = document.createElement('tr');
      tr.innerHTML = '<th>' + r[0] + '<small>' + r[1] + '</small></th><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + r[4] + '</td><td>' + r[5] + '</td>';
      tr.addEventListener('click', function () { [].forEach.call(tb.children, function (c) { c.classList.remove('on'); }); tr.classList.add('on'); box.innerHTML = r[6]; });
      tb.appendChild(tr); });
    tb.children[0].classList.add('on'); box.innerHTML = FW[0][6];
  })();

  // ══ 06 · міфи ══
  (function () {
    var ul = document.getElementById('fzMyth'); if (!ul) return;
    var MY = [
      ['«Краде гроші з банківських карток»', 'myth', 'Міф.', 'Платіжна картка відповідає криптографічно й щоразу по-новому (стандарт EMV). Flipper бачить лише службові дані — тип картки, іноді маскований номер. Цього замало, щоб провести платіж чи клонувати картку.'],
      ['«Відкриває будь-яке авто»', 'myth', 'Міф (для сучасних).', 'Сучасні брелоки — плаваючий код: записаний сигнал удруге не спрацьовує. Офіційна прошивка навмисно не надсилає захоплені rolling-коди. Історично вразливі лише старі авто з фіксованим кодом — тому їх і замінили.'],
      ['«Відкриває зарядний порт Tesla»', 'truth', 'Правда — але це не злом.', 'Flipper просто повторює той самий сигнал 315 МГц, який штатно випромінюють зарядні станції Tesla, щоб відкрити лючок. Це зручнісна функція без захисту, а не вразливість.'],
      ['«Зчитує пароль Wi-Fi і зламує мережі»', 'myth', 'Міф для базового пристрою.', 'У Flipper немає Wi-Fi-радіо взагалі. Окремі інструменти працюють лише із зовнішньою платою-модулем, і навіть тоді пароль «з повітря» не дістається.'],
      ['«Клонує будь-який пропуск»', 'part', 'Частково.', 'Старі безконтактні картки 125 кГц, що передають незмінний номер, історично копіюються. Сучасні захищені на 13,56 МГц із криптографією — ні. Саме тому організації переходять на другі.']
    ];
    MY.forEach(function (m) { var li = document.createElement('li');
      var lbl = m[1] === 'truth' ? 'правда' : m[1] === 'part' ? 'частково' : 'міф';
      li.innerHTML = '<div class="fz-myth__h"><span class="badge ' + m[1] + '">' + lbl + '</span><span class="q">' + m[0] + '</span><span class="mk">+</span></div>' +
        '<div class="fz-myth__b"><div><b>' + m[2] + '</b> ' + m[3] + '</div></div>';
      var h = li.querySelector('.fz-myth__h'), b = li.querySelector('.fz-myth__b');
      h.addEventListener('click', function () { var open = li.classList.toggle('on'); b.style.maxHeight = open ? b.scrollHeight + 'px' : 0; });
      ul.appendChild(li); });
  })();

  // ══ 07 · екран Flipper (з чого почати) ══
  (function () {
    var host = document.getElementById('fzScreen'); if (!host) return;
    // корпус Flipper: екран ліворуч, хрестовина й «назад» праворуч — кнопки на самому пристрої
    var dev = document.createElement('div'); dev.className = 'fz-dev'; host.appendChild(dev);
    var SW = 128, SH = 64, SC = 2.4, cv = document.createElement('canvas');
    cv.width = SW * SC * 2; cv.height = SH * SC * 2; cv.style.width = (SW * SC) + 'px'; cv.style.background = SCR_BG;
    var x = cv.getContext('2d'); x.scale(SC * 2, SC * 2); dev.appendChild(cv);
    var ctl = document.createElement('div'); ctl.className = 'fz-ctl'; dev.appendChild(ctl);
    var pad = document.createElement('div'); pad.className = 'fz-dpad'; ctl.appendChild(pad);
    [['u', '▲', 'Вгору', up], ['d', '▼', 'Вниз', down], ['ok', 'OK', 'Вибрати', ok]].forEach(function (b) { var btn = document.createElement('button');
      btn.className = b[0]; btn.textContent = b[1]; btn.setAttribute('aria-label', b[2]); btn.addEventListener('click', b[3]); pad.appendChild(btn); });
    var bk = document.createElement('button'); bk.className = 'fz-back'; bk.textContent = '↩'; bk.setAttribute('aria-label', 'Назад'); bk.addEventListener('click', back); ctl.appendChild(bk);
    var hint = document.createElement('p'); hint.className = 'fz-hint'; hint.textContent = 'OK — увійти · ▲▼ — гортати · ↩ — назад'; host.appendChild(hint);
    var MENU = ['Sub-GHz', '125 kHz RFID', 'NFC', 'Infrared', 'GPIO', 'iButton', 'Bad USB', 'Applications', 'Settings'];
    var IR = ['Universal Remotes', 'Learn New Remote', 'Saved Remotes'];
    var IRTV = ['TV', 'Audio', 'Projector', 'Air Conditioner'];
    var screen = 'desktop', sel = 3, top = 0, selIr = 0, dolphin = 0;
    function px(c) { x.fillStyle = c; }
    function pset(X, Y, w, h) { x.fillRect(X, Y, w || 1, h || 1); }
    function text(s, X, Y, inv) { x.font = '7px ' + MONO; x.textBaseline = 'top'; x.textAlign = 'left'; x.fillStyle = inv ? SCR_BG : SCR_INK; x.fillText(s, X, Y); }
    function clearS() { x.fillStyle = SCR_BG; x.fillRect(0, 0, SW, SH); }
    function header(t) { px(SCR_INK); pset(0, 0, SW, 11); text(t, 3, 2, true); }
    function dolphinArt(X, Y) { px(SCR_INK); // простий піксель-дельфін
      var rows = ['   ####    ', '  #    ##  ', ' #  o    # ', '#        ##', ' #  \\__/ # ', '  ##    #  ', '    ####   '];
      rows.forEach(function (r, j) { for (var i = 0; i < r.length; i++) if (r[i] !== ' ') pset(X + i * 2, Y + j * 2, 2, 2); }); }
    function list(items, s, t, hdr) { clearS(); header(hdr); var rows = 5;
      for (var i = 0; i < rows && t + i < items.length; i++) { var idx = t + i, yy = 13 + i * 10, inv = idx === s;
        if (inv) { px(SCR_INK); pset(0, yy - 1, SW - 4, 10); } text(items[idx], 4, yy, inv); }
      // скролбар
      px(SCR_INK); pset(SW - 3, 12, 2, SH - 13); var th = (SH - 14) * rows / items.length, ty = 12 + (SH - 14) * t / items.length;
      px(SCR_BG); pset(SW - 3, ty, 2, Math.max(4, th)); }
    function render() {
      if (screen === 'desktop') { clearS(); dolphinArt(44, 18); text('Flipper', 4, 2); text('23:07', SW - 32, 2); text('OK - меню', 30, 54); }
      else if (screen === 'menu') list(MENU, sel, top, 'Main Menu');
      else if (screen === 'ir') list(IR, selIr, 0, 'Infrared');
      else if (screen === 'irtv') { list(IRTV, selIr, 0, 'Universal Remote'); }
      else if (screen === 'tv') { clearS(); header('TV Remote'); text('> надсилаю Power', 6, 20); text('наведіть на свій', 6, 34); text('телевізор', 6, 44); }
    }
    function up() { if (screen === 'menu') { sel = (sel - 1 + MENU.length) % MENU.length; top = Math.min(top, sel); if (sel < top) top = sel; if (sel === MENU.length - 1) top = Math.max(0, MENU.length - 5); }
      else if (screen === 'ir') selIr = (selIr - 1 + IR.length) % IR.length; else if (screen === 'irtv') selIr = (selIr - 1 + IRTV.length) % IRTV.length; render(); }
    function down() { if (screen === 'menu') { sel = (sel + 1) % MENU.length; if (sel > top + 4) top = sel - 4; if (sel === 0) top = 0; }
      else if (screen === 'ir') selIr = (selIr + 1) % IR.length; else if (screen === 'irtv') selIr = (selIr + 1) % IRTV.length; render(); }
    function ok() { if (screen === 'desktop') { screen = 'menu'; }
      else if (screen === 'menu') { if (MENU[sel] === 'Infrared') { screen = 'ir'; selIr = 0; } }
      else if (screen === 'ir') { if (selIr === 0) { screen = 'irtv'; selIr = 0; } }
      else if (screen === 'irtv') { if (selIr === 0) screen = 'tv'; }
      render(); }
    function back() { screen = screen === 'tv' ? 'irtv' : screen === 'irtv' ? 'ir' : screen === 'ir' ? 'menu' : 'desktop'; render(); }
    render();
  })();
})();
