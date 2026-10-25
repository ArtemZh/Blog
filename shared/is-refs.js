/* Стаття 34, розділ 10 «Відсилки й пасхалки»: кожна відсилка — рядок на всю ширину, текст і жива сцена навпіл,
   сторони чергуються (на телефоні — одне під одним). Сцени рахують справжню фізику або йдуть за історичними даними.
   Фони (Пилова чаша, телескопи й червоточина, згасаюча зоря, крига Ведделла) — власні згенеровані зображення;
   3D: станція (ship.glb, та сама, що в розділі 02), шхуна «Ендьюренс» і скибка хліба (Tripo → Blender).
   Без кадрів із фільмів, облич і логотипів. Кожна сцена працює лише коли видна. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const slot = document.getElementById('viz-refs');
if (slot) init(slot);

function init(slot) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(2, devicePixelRatio || 1);
  const A = 'assets/interstellar/refs/';
  const st = document.createElement('style');
  st.textContent = `
    .rr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:clamp(18px,3vw,40px);align-items:center;margin:clamp(28px,5vw,56px) 0}
    .rr:nth-child(even) .rr-t{order:2}
    .rr-t h3{font-size:clamp(19px,2.2vw,24px);margin:8px 0 10px}
    .rr-t p{font-size:15px}
    .rr-v{position:relative;height:clamp(300px,34vw,440px);border-radius:var(--r-lg);overflow:hidden;background:#06070c;color:#fff;touch-action:pan-y}
    .rr-v canvas{display:block;width:100%;height:100%}
    .rr-bg{position:absolute;inset:0;background-size:cover;background-position:center;transform-origin:72% 30%;will-change:transform}
    .rr-cv{position:absolute;inset:0}
    .rr-hud{position:absolute;left:14px;top:12px;font:500 11px/1.4 var(--mono);color:rgba(255,255,255,.75);pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,.7)}
    .rr-hud b{display:block;font:700 22px/1.15 var(--mono);color:#fff}
    .rr-cap{position:absolute;left:14px;bottom:10px;right:14px;font:500 11px/1.35 var(--mono);color:rgba(255,255,255,.6);pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,.8)}
    .rr-ctl{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-top:12px;font-size:13px;color:var(--ink-3)}
    .rr-ctl label{display:flex;align-items:center;gap:8px}
    .rr-ctl input[type=range]{accent-color:var(--act);width:150px}
    .rr-ctl b{font-family:var(--mono);color:var(--ink)}
    .rr-out{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:10px}
    .rr-out div{border:1px solid var(--rule);border-radius:var(--r-md);padding:8px 10px;background:var(--ground)}
    .rr-out span{display:block;font-size:11px;color:var(--ink-3)}
    .rr-out b{font:600 15px/1.2 var(--mono);color:var(--ink)}
    .rr-out b.bad{color:var(--act)} .rr-out b.ok{color:var(--c-teal,#1E968C)}
    .rr-btn{font:600 12.5px/1 var(--sans);padding:8px 12px;border:1px solid var(--rule-2);border-radius:var(--r-md);background:var(--ground);cursor:pointer;color:var(--ink-2)}
    .rr-btn:hover{border-color:var(--act);color:var(--act)}
    .rr-kind{display:inline-block;font:600 10px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:4px 7px;border-radius:5px}
    .rr-kind.sci{background:color-mix(in srgb,var(--c-teal,#1E968C) 14%,transparent);color:var(--c-teal,#1E968C)}
    .rr-kind.fic{background:var(--act-soft);color:var(--act)}
    .rr-kind.set{background:color-mix(in srgb,var(--c-blue,#4678DC) 14%,transparent);color:var(--c-blue,#4678DC)}
    .rr-end .rr-v{height:clamp(380px,44vw,560px)}
    .rr-end .rr-photo{position:absolute;left:0;right:0;top:0;height:42%;background:url(${A}G-weddell.jpg) center 62%/cover}
    .rr-end .rr-map{position:absolute;left:0;right:0;bottom:0;top:42%}
    .rr-v canvas.rr-ins{position:absolute;right:12px;top:12px;left:auto;bottom:auto;width:150px;height:150px}
    @media(max-width:860px){.rr{grid-template-columns:1fr}.rr:nth-child(even) .rr-t{order:0}.rr-v{height:340px}.rr-end .rr-v{height:460px}}`;
  document.head.appendChild(st);

  const K = (k, l) => `<span class="rr-kind ${k}">${l}</span>`;
  const ROWS = [
    { id: 'mono', kind: K('fic', 'кіно'), t: '«Космічна одіссея 2001 року»',
      p: 'Роботи TARS і CASE візуально складаються з плит, нагадуючи культовий моноліт із творінь Стенлі Кубріка та Артура Кларка. Пропорції оригінального об\'єкта підпорядковані суворій математичній послідовності перших трьох квадратів — 1 : 4 : 9. Обертове кільце корабля для штучної гравітації також відсилає до класичної космічної естетики. На кадрі поруч — власна ілюстрація за мотивами: лаконічний моноліт, робот із пластин і кільце станції над обрієм.',
      ctl: '<button type="button" class="rr-btn" data-act="fold">сховати розміри</button>' },
    { id: 'spin', kind: K('sci', 'фізика'), t: 'Кільце, що дає вагу',
      p: 'Кільце «Ендьюренса», що обертається заради штучного тяжіння, — теж поклін «Одіссеї». Фізика проста: на підлозі кільця відчувається прискорення a = ω²r. Проте занадто компактне кільце мусить крутитися швидко, і тоді голова й ноги «важать» по-різному, а відпущений предмет летить кривою (сила Коріоліса). Багатьом людям стає зле вже понад 2–4 оберти за хвилину.',
      ctl: '<label>радіус <input type="range" min="5" max="250" value="32" data-r> <b data-rv></b></label><label>оберти <input type="range" min="0.5" max="10" step="0.1" value="5.3" data-w> <b data-wv></b></label>',
      out: true },
    { id: 'contact', kind: K('sci', 'наука'), t: '«Контакт», Саган і Торн',
      p: 'Працюючи над романом «Контакт», астроном і письменник Карл Саган звернувся до Кіпа Торна з питанням про реальність переміщень крізь червоточини. Наукова консультація переросла у фундаментальну статтю 1988 року про прохідні тунелі, яка стала прямим концептуальним пращуром «Інтерстеллара». Головну роль у кіноекранізації «Контакту» 1997 року виконав Метью Макконагі. Гортайте — сцена наближається до червоточини, рік за роком.' },
    { id: 'dust', kind: K('sci', 'історія'), t: 'Пилова чаша 1930-х',
      p: 'Пилові бурі у фільмі мають реальний прообраз — Dust Bowl, епоху пилових бур на Великих рівнинах США 1930-х. Найруйнівніша, «Чорна неділя», 14 квітня 1935 року накрила Додж-Сіті (Канзас) близько 14:40, а Амарилло (Техас) — близько 19:20: фронт мчав зі швидкістю ≈ 70 км/год. Спогади літніх людей у фільмі навіяні справжніми інтерв’ю з документального фільму Кена Бернса «The Dust Bowl» (2012). А кукурудзяне поле для зйомок — справжнє, близько 500 акрів.',
      ctl: '<label>час <input type="range" min="780" max="1260" value="840" data-tm data-nohint> <b data-tmv></b></label>' },
    { id: 'endur', cls: 'rr-end', kind: K('sci', 'історія'), t: '«Ендьюренс» Шеклтона',
      p: 'Корабель фільму названо на честь легендарної шхуни антарктичної експедиції Ернеста Шеклтона. Справжній «Ендьюренс» вийшов з Південної Георгії 5 грудня 1914 року, у січні 1915-го вмерз у кригу моря Ведделла, дрейфував десять місяців і в листопаді затонув. Люди жили просто на кризі, на шлюпках дісталися острова Елефант, а Шеклтон на шлюпці «Джеймс Керд» перетнув океан до Південної Георгії по допомогу. 30 серпня 1916 року — через 634 дні від виходу — врятували всіх 28. Уламки корабля знайшли 2022 року на глибині понад 3 км.',
      ctl: '<label>день <input type="range" min="0" max="634" value="0" data-d data-nohint> <b data-dv></b></label><button type="button" class="rr-btn" data-act="play">▶ дрейф</button>' },
    { id: 'toast', kind: K('fic', 'сюжет'), t: 'Закон Мерфі й бутерброд',
      p: 'Мерф названа на честь закону Мерфі: «усе, що здатне піти шкереберть, обов\'язково піде шкереберть». Купер пояснює доньці, що цей принцип означає не невідворотність невдач, а просту ймовірність здійснення будь-якої події. Найпопулярнішим побутовим доказом вважається бутерброд, що падає маслом донизу. Фізик Роберт Метьюз (1995) показав, що справа зовсім не у злій удачі, а в банальній механіці: скибка зісковзує зі столу і за стандартної висоти встигає виконати лише півоберту. Перевірте цей розрахунок, змінивши висоту поверхні.',
      ctl: '<label>висота столу <input type="range" min="0.4" max="3.5" step="0.05" value="0.75" data-h> <b data-hv></b></label><button type="button" class="rr-btn" data-act="drop">↻ кинути ще раз</button>',
      out: true },
    { id: 'poem', kind: K('set', 'лейтмотив'), t: 'Ділан Томас, 1951',
      p: 'Крізь увесь фільм червоною ниткою проходить вірш валлійського поета Ділана Томаса «Do not go gentle into that good night» (1951) — про опір згасанню. Це віланела: 19 рядків, де два рефрени чергуються, доки у фінальному чотиривірші не стануть поруч. Тут — лише будова вірша: рядки стали смугами світла, рефрени — двома нитками, а зоря спалахує щоразу, коли рефрен повертається.' },
  ];
  slot.innerHTML = ROWS.map((r) => `<div class="rr ${r.cls || ''}" data-id="${r.id}"><div class="rr-t">${r.kind}<h3>${r.t}</h3><p>${r.p}</p>` +
    (r.ctl ? `<div class="rr-ctl">${r.ctl}</div>` : '') + (r.out ? '<div class="rr-out"></div>' : '') + `</div><div class="rr-v"></div></div>`).join('') +
    '<p class="chint">Зображення тла — власні згенеровані ілюстрації, не кадри з фільмів. Карта дрейфу — схема з приблизними координатами за щоденниками експедиції; карта Рівнин — схема. Механіка бутерброда — модель Метьюза: тонка пластина обертається навколо краю столу, доки не зісковзне (виступ центру мас 6 мм, тертя 0,6), далі — вільне падіння.</p>';
  const row = (id) => slot.querySelector(`.rr[data-id="${id}"]`);
  const V = (id) => row(id).querySelector('.rr-v');
  const $r = (id, s) => row(id).querySelector(s);
  const fmt = (x, d = 0) => x.toLocaleString('uk', { maximumFractionDigits: d, minimumFractionDigits: d });
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const draco = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
  const gltf = (url, cb) => new GLTFLoader().setDRACOLoader(draco).load(url, cb, undefined, () => {});

  /* живий цикл для кожної сцени: крутиться, лише коли рядок видно; кадр планується рівно один */
  function live(el, step) {
    let on = false, raf = 0, last = 0;
    const loop = (now) => { raf = 0; const dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now; step(dt, now / 1000); if (on && !raf) raf = requestAnimationFrame(loop); };
    new IntersectionObserver((es) => { on = es[0].isIntersecting; if (on && !raf) { last = 0; raf = requestAnimationFrame(loop); } }, { rootMargin: '120px' }).observe(el);
    return { kick: () => { if (on && !raf) raf = requestAnimationFrame(loop); } };
  }
  function gl3(el, fov = 40) {
    const R = new THREE.WebGLRenderer({ antialias: true }); R.setPixelRatio(DPR); R.outputColorSpace = THREE.SRGBColorSpace;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.domElement.className = 'rr-cv'; el.appendChild(R.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(fov, 1, .01, 2000);
    const fit = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(fit).observe(el); fit();
    return { R, scene, cam };
  }
  function stars(n, r) {
    const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, s = Math.sqrt(1 - u * u); p.set([s * Math.cos(a) * r, u * r, s * Math.sin(a) * r], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: .8 }));
  }
  function hud(el, html) { const d = document.createElement('div'); d.className = 'rr-hud'; d.innerHTML = html; el.appendChild(d); return d; }
  function cap(el, text) { const d = document.createElement('div'); d.className = 'rr-cap'; d.textContent = text; el.appendChild(d); return d; }
  function canvas2d(el) { const cv = document.createElement('canvas'); cv.className = 'rr-cv'; el.appendChild(cv); const x = cv.getContext('2d');
    return { cv, x, size() { const W = el.clientWidth, H = el.clientHeight; if (cv.width !== Math.round(W * DPR) || cv.height !== Math.round(H * DPR)) { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); } x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, W, H); return [W, H]; } }; }

  /* ── 1. кадр: моноліт, робот із чотирьох плит і кільце станції; поверх — розмірні лінії 1 : 4 : 9 і легкий паралакс ── */
  (function () {
    const el = V('mono'), bg = document.createElement('div'); bg.className = 'rr-bg'; bg.style.backgroundImage = `url(${A}A-monolith.jpg)`; bg.style.inset = '-3%'; el.appendChild(bg);
    const C2 = canvas2d(el), x = C2.x, IW = 1672, IH = 941;
    // точки на зображенні (у пікселях оригіналу 1672 × 941): лицьова грань моноліта, робот, кільце
    const M = { l: 1045, r: 1218, t: 67, b: 704 }, B = { l: 1318, r: 1390, t: 592, b: 717 };
    const h = hud(el, 'моноліт<b>1 : 4 : 9</b>'); cap(el, '1 : 4 : 9 = 1² : 2² : 3² · ведіть мишею — легкий паралакс');
    let show = 0, want = 1, mx = 0, my = 0, tx = 0, ty = 0, seen = 0;
    const btn = $r('mono', '[data-act="fold"]'); btn.textContent = 'сховати розміри';
    btn.addEventListener('click', () => { want = want ? 0 : 1; btn.textContent = want ? 'сховати розміри' : 'показати розміри'; L.kick(); });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; L.kick(); });
    el.addEventListener('pointerleave', () => { mx = my = 0; });
    // клік: по грані моноліта пробігає відблиск, над верхнім краєм — спалах (як у кадрі з вирівнюванням світил), і тихий гул, якщо звук статті увімкнено
    let gl = -1; el.style.cursor = 'pointer';
    el.addEventListener('click', () => { gl = 0; L.kick(); window.IS_SOUND && IS_SOUND.fx && IS_SOUND.fx('hum'); });
    const L = live(el, (dt) => {
      seen = Math.min(1, seen + dt * .5); show += (want * sm(.2, 1, seen) - show) * Math.min(1, dt * 3);
      tx += (mx - tx) * Math.min(1, dt * 4); ty += (my - ty) * Math.min(1, dt * 4);
      bg.style.transform = `translate(${(-tx * 1.6).toFixed(2)}%, ${(-ty * 1.2).toFixed(2)}%)`;
      const [W, H] = C2.size(), bw = W * 1.06, bh = H * 1.06, k = Math.max(bw / IW, bh / IH), ox = (bw - IW * k) / 2 - W * .03 - tx * .016 * W, oy = (bh - IH * k) / 2 - H * .03 - ty * .012 * H;
      const X = (u) => ox + u * k, Y = (v) => oy + v * k;
      if (gl >= 0) { gl += dt; const u = gl / 1.8;
        if (u > 1) gl = -1; else {
          const yb = Y(M.t) + (Y(M.b) - Y(M.t)) * (u * 1.3 - .15), band = (Y(M.b) - Y(M.t)) * .16;      // смуга світла ковзає грань згори донизу
          x.save(); x.beginPath(); x.rect(X(M.l), Y(M.t), X(M.r) - X(M.l), Y(M.b) - Y(M.t)); x.clip();
          const g = x.createLinearGradient(0, yb - band, 0, yb + band); g.addColorStop(0, 'rgba(255,236,200,0)'); g.addColorStop(.5, 'rgba(255,236,200,.38)'); g.addColorStop(1, 'rgba(255,236,200,0)');
          x.fillStyle = g; x.fillRect(X(M.l), yb - band, X(M.r) - X(M.l), band * 2); x.restore();
          const fl = Math.sin(Math.min(1, u * 1.6) * Math.PI), fx0 = (X(M.l) + X(M.r)) / 2, fy0 = Y(M.t) - 4, R0 = 70 * fl;   // спалах над верхнім краєм
          if (R0 > 1) { const rg = x.createRadialGradient(fx0, fy0, 0, fx0, fy0, R0); rg.addColorStop(0, `rgba(255,248,230,${.9 * fl})`); rg.addColorStop(1, 'rgba(255,220,170,0)');
            x.fillStyle = rg; x.fillRect(fx0 - R0, fy0 - R0, R0 * 2, R0 * 2); x.fillStyle = `rgba(255,250,240,${.7 * fl})`; x.fillRect(fx0 - R0 * 1.6, fy0 - .75, R0 * 3.2, 1.5); }
          L.kick(); } }
      if (show < .01) return;
      x.globalAlpha = show; x.strokeStyle = 'rgba(255,214,160,.9)'; x.fillStyle = '#fff'; x.lineWidth = 1.2; x.font = '600 13px ui-monospace,monospace'; x.textAlign = 'center';
      x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 6;
      const tick = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
      const vx = X(M.l) - 18, dh = (Y(M.b) - Y(M.t)) * sm(0, 1, show);            // висота «9» ліворуч від моноліта
      tick(vx, Y(M.b), vx, Y(M.b) - dh); tick(vx - 5, Y(M.t), vx + 5, Y(M.t)); tick(vx - 5, Y(M.b), vx + 5, Y(M.b));
      x.fillText('9', vx - 14, (Y(M.t) + Y(M.b)) / 2);
      const hy = Y(M.b) + 16; tick(X(M.l), hy, X(M.r), hy); tick(X(M.l), hy - 5, X(M.l), hy + 5); tick(X(M.r), hy - 5, X(M.r), hy + 5);   // ширина «4»
      x.fillText('4', (X(M.l) + X(M.r)) / 2, hy + 16);
      x.fillText('товщина 1', X(M.r) + 44, Y(M.t) + 18);
      x.strokeStyle = 'rgba(159,179,216,.9)'; tick(X(B.l), Y(B.t) - 10, X(B.r), Y(B.t) - 10);                                            // робот: чотири плити поруч
      x.fillStyle = 'rgba(220,230,255,.95)'; x.font = '500 11px ui-monospace,monospace'; x.fillText('4 плити', (X(B.l) + X(B.r)) / 2, Y(B.t) - 16);
      x.shadowBlur = 0; x.globalAlpha = 1; x.textAlign = 'left';
    });
  })();

  /* ── 2. кільце зі штучним тяжінням: a = ω²r, перепад голова/ноги, Коріоліс для відпущеного м'ячика ── */
  (function () {
    const el = V('spin'), { R, scene, cam } = gl3(el, 38);
    scene.background = new THREE.Color(0x04050a); scene.add(stars(2500, 400));
    scene.add(new THREE.HemisphereLight(0xffe6c8, 0x0a1020, .55));
    const key = new THREE.DirectionalLight(0xffe0bc, 3); key.position.set(3, 2, 4); scene.add(key);
    const piv = new THREE.Group(), spin = new THREE.Group(); piv.add(spin); scene.add(piv);
    gltf('assets/interstellar/ship.glb', (g) => { const s = g.scene, b = new THREE.Box3().setFromObject(s), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      s.position.sub(c); spin.add(s); piv.scale.setScalar(2.2 / Math.max(sz.x, sz.y, sz.z)); L.kick(); });
    piv.rotation.set(0, -.75, .25);                                        // вісь хаба (у моделі X) — навскіс до камери, видно колесо
    cam.position.set(-.6, .4, 6); cam.lookAt(-.6, 0, 0);
    // врізка: кільце збоку — траєкторія м'ячика, відпущеного на висоті 1,5 м, у системі станції
    const ins = document.createElement('canvas'); ins.className = 'rr-ins'; el.appendChild(ins); const ix = ins.getContext('2d'); ins.width = ins.height = 150 * DPR;
    const sr = $r('spin', '[data-r]'), sw = $r('spin', '[data-w]'), out = $r('spin', '.rr-out');
    hud(el, 'штучна вага'); cap(el, 'праворуч угорі — м’ячик, відпущений на висоті 1,5 м: у кільці він падає не під руку, а позаду (висоту на схемі збільшено)');
    let ang = 0;
    function calc() {
      const r = +sr.value, rpm = +sw.value, w = rpm * 2 * Math.PI / 60, a = w * w * r, g = a / 9.81, hh = 1.5;
      // у нерухомій системі м'ячик летить прямо з дотичною швидкістю ω(r−h); зсув від точки під рукою не залежить від ω
      const rh = r - hh, s = Math.sqrt(Math.max(0, r * r - rh * rh)), tf = s / Math.max(1e-6, w * rh), off = r * (s / rh - Math.atan(s / rh));
      $r('spin', '[data-rv]').textContent = fmt(r) + ' м'; $r('spin', '[data-wv]').textContent = fmt(rpm, 1) + ' об/хв';
      const sick = rpm > 4 ? 'bad' : rpm > 2 ? '' : 'ok';
      out.innerHTML = `<div><span>вага на підлозі</span><b class="${g > 1.3 || g < .3 ? 'bad' : 'ok'}">${fmt(g, 2)} g</b></div>` +
        `<div><span>голова «легша» за ноги</span><b>${fmt(1.8 / r * 100, 1)} %</b></div>` +
        `<div><span>м’ячик з 1,5 м упаде позаду на</span><b>${fmt(off * 100, 0)} см</b></div>` +
        `<div><span>оберти й нудота</span><b class="${sick}">${rpm > 4 ? 'погано багатьом' : rpm > 2 ? 'треба звикати' : 'комфортно'}</b></div>`;
      // врізка: кільце радіуса Rr пікселів; висоту відпускання показуємо щонайменше 40 % радіуса (інакше на великому кільці не видно)
      const W = 150, c = W / 2, Rr = 62, x = ix; x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, W, W);
      x.fillStyle = 'rgba(6,8,14,.78)'; x.beginPath(); x.arc(c, c, 72, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; x.beginPath(); x.arc(c, c, Rr, 0, 7); x.stroke();
      const hp = Math.max(hh / r, .4) * Rr, rhs = Rr - hp, ss = Math.sqrt(Rr * Rr - rhs * rhs), N = 40;
      x.fillStyle = '#9fb3d8'; x.beginPath(); x.arc(c, c + rhs, 2.6, 0, 7); x.fill();       // рука (точка відпускання) — над підлогою внизу
      x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(c - 1, c + Rr - 2, 2, 6);            // точка під рукою на підлозі
      x.strokeStyle = '#ffb27a'; x.lineWidth = 1.6; x.beginPath();
      for (let i = 0; i <= N; i++) { const X = ss * i / N, phi = -X / rhs;                  // поворот станції за той самий час: ωt = X/(ω·rhs)·ω
        const xr = X * Math.cos(phi) + rhs * Math.sin(phi), yr = -X * Math.sin(phi) + rhs * Math.cos(phi);
        i ? x.lineTo(c + xr, c + yr) : x.moveTo(c + xr, c + yr); }
      x.stroke(); x.font = '500 9.5px ui-monospace,monospace'; x.fillStyle = 'rgba(255,255,255,.75)'; x.textAlign = 'center'; x.fillText(`падає ${fmt(tf, 2)} с`, c, c - 6);
      return w;
    }
    let w = calc(); const on = () => { w = calc(); L.kick(); }; sr.addEventListener('input', on); sw.addEventListener('input', on);
    const L = live(el, (dt) => { if (!reduce) ang += dt * w * .6; spin.rotation.x = ang; R.render(scene, cam); });
  })();

  /* ── 3. «Контакт»: гортання наближає червоточину, роки спалахують по черзі ── */
  (function () {
    const el = V('contact'), bg = document.createElement('div'); bg.className = 'rr-bg'; bg.style.backgroundImage = `url(${A}E-wormhole.jpg)`; el.appendChild(bg);
    const C2 = canvas2d(el), x = C2.x;
    const E = [[1985, 'роман Сагана «Контакт»; Саган питає Торна про червоточину'], [1988, 'Морріс і Торн: прохідні червоточини'], [1997, 'фільм «Контакт»'], [2014, '«Інтерстеллар»: Торн — науковий консультант']];
    cap(el, 'гортайте сторінку — наближення до червоточини');
    let p = 0, q = 0;
    const upd = () => { const r = el.getBoundingClientRect(), vh = innerHeight; p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))); L.kick(); };
    const L = live(el, (dt) => {
      q += (p - q) * Math.min(1, dt * 6);
      bg.style.transform = `scale(${(1 + q * .55).toFixed(3)})`;
      const [W, H] = C2.size(), cx = W * .72, cy = H * .3;                   // центр червоточини на зображенні
      E.forEach(([y, t], i) => { const a = sm(.2 + i * .14, .3 + i * .14, q); if (a <= 0) return;
        const rr = (W * .1) * (1 + i * .5) * (1 + q * .4);
        x.strokeStyle = `rgba(255,214,160,${(.6 * a).toFixed(3)})`; x.lineWidth = 1.4; x.beginPath(); x.ellipse(cx, cy, rr, rr * .92, 0, 0, 7); x.stroke();
        const lx = 18, ly = H * .2 + i * 54; x.globalAlpha = a;
        x.font = '700 22px ui-monospace,monospace'; x.fillStyle = '#fff'; x.shadowColor = 'rgba(0,0,0,.85)'; x.shadowBlur = 8; x.fillText(y, lx, ly);
        x.font = '500 12.5px system-ui,sans-serif'; x.fillStyle = 'rgba(255,255,255,.88)'; x.fillText(t, lx, ly + 18); x.shadowBlur = 0; x.globalAlpha = 1; });
    });
    addEventListener('scroll', upd, { passive: true }); upd();
  })();

  /* ── 4. Пилова чаша: стіна пилу насувається на ферму; врізка — фронт «Чорної неділі» на схемі Рівнин ── */
  (function () {
    const el = V('dust'), bg = document.createElement('div'); bg.className = 'rr-bg'; bg.style.backgroundImage = `url(${A}D-dustbowl.jpg)`; bg.style.transformOrigin = '30% 70%'; el.appendChild(bg);
    const C2 = canvas2d(el), x = C2.x;
    const tm = $r('dust', '[data-tm]'), tv = $r('dust', '[data-tmv]');
    const h = hud(el, ''); cap(el, 'врізка — схема: штати й міста приблизно; фронт іде лінією Додж-Сіті → Амарилло');
    const box = { lo0: -104, lo1: -94, la0: 33.3, la1: 40.3 }, DC = [-100.02, 37.75], AM = [-101.83, 35.22];
    const P = Array.from({ length: 420 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() }));
    // сам іде по колу: 13:00 → 21:00 за ~48 с (10 хв доби за секунду), повзунок у руках — автохід на 6 с стає на паузу
    let hold = 0, vis = false, cur = +tm.value; tm.addEventListener('pointerdown', () => { hold = 6; });
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (!vis && window.IS_SOUND) IS_SOUND.wind.off(); }, { threshold: .3 }).observe(el);
    const L = live(el, (dt) => {
      const [W, H] = C2.size();
      if (hold > 0) { hold -= dt; cur = +tm.value; } else if (!reduce) { cur += dt * 10; if (cur > 1260) cur = 780; tm.value = String(Math.round(cur)); }   // повзунок цілочисельний — час рахуємо окремо
      const mins = Math.round(cur), hh = Math.floor(mins / 60), mm = mins % 60; tv.textContent = hh + ':' + String(mm).padStart(2, '0');
      h.innerHTML = '14 квітня 1935<b>' + tv.textContent + '</b>';
      // 14:40 — фронт у Додж-Сіті, 19:20 — в Амарилло; ферма на картинці умовно між ними — темніє, коли фронт поряд
      const u = (mins - 880) / (1160 - 880), dark = sm(.35, .75, u);
      if (vis && window.IS_SOUND && IS_SOUND.on) IS_SOUND.wind(dark * .9 + .1 * sm(-.2, .35, u));   // вітер густішає, поки фронт підходить
      bg.style.filter = `brightness(${(1 - .7 * dark).toFixed(3)}) saturate(${(1 - .3 * dark).toFixed(3)})`;
      bg.style.transform = `scale(${(1.04 + .06 * dark).toFixed(3)})`;
      x.fillStyle = 'rgba(150,110,70,.35)';                                 // пил летить справа наліво, густішає з фронтом
      P.forEach((p) => { if (!reduce) p.x -= dt * (.04 + .12 * p.s) * (.3 + dark); if (p.x < 0) { p.x = 1; p.y = Math.random(); } if (p.s > .25 + .7 * dark) return;
        x.beginPath(); x.arc(p.x * W, p.y * H, 1 + 2.5 * p.s, 0, 7); x.fill(); });
      const mw = Math.min(210, W * .36), mh = mw * .78, mx = W - mw - 14, my = H - mh - 34;
      const X = (lo) => mx + (lo - box.lo0) / (box.lo1 - box.lo0) * mw, Y = (la) => my + (box.la1 - la) / (box.la1 - box.la0) * mh;
      x.fillStyle = 'rgba(8,8,10,.66)'; x.fillRect(mx - 6, my - 6, mw + 12, mh + 12);
      x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 1;
      x.strokeRect(X(-102.05), Y(40), X(-94.6) - X(-102.05), Y(37) - Y(40));                                                                                // Канзас
      x.beginPath(); [[-103, 37], [-94.6, 37], [-94.4, 33.7], [-100, 34.5], [-100, 36.5], [-103, 36.5]].forEach(([a, b], i) => i ? x.lineTo(X(a), Y(b)) : x.moveTo(X(a), Y(b))); x.closePath(); x.stroke();   // Оклахома з «ручкою»
      x.beginPath(); x.moveTo(X(-103), Y(33.4)); x.lineTo(X(-103), Y(36.5)); x.moveTo(X(-100), Y(34.5)); x.lineTo(X(-99), Y(33.4)); x.stroke();                // Техас (північ)
      x.font = '500 9px ui-monospace,monospace'; x.fillStyle = 'rgba(255,255,255,.6)'; x.textAlign = 'left';
      x.fillText('КАНЗАС', X(-99.5), Y(38.6)); x.fillText('ОКЛАХОМА', X(-98.4), Y(35.6)); x.fillText('ТЕХАС', X(-102.7), Y(34));
      [[DC, 'Додж-Сіті 14:40'], [AM, 'Амарилло 19:20']].forEach(([c, n]) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(X(c[0]), Y(c[1]), 2.5, 0, 7); x.fill(); x.fillText(n, X(c[0]) + 5, Y(c[1]) - 4); });
      const fu = Math.max(-.6, Math.min(1.4, u)), fx = DC[0] + (AM[0] - DC[0]) * fu, fy = DC[1] + (AM[1] - DC[1]) * fu;
      const dx = AM[0] - DC[0], dy = AM[1] - DC[1], nl = Math.hypot(dx, dy), nx = -dy / nl * 4, ny = dx / nl * 4;
      x.save(); x.beginPath(); x.rect(mx - 6, my - 6, mw + 12, mh + 12); x.clip();
      x.fillStyle = 'rgba(201,138,74,.2)'; x.beginPath(); x.moveTo(X(fx - nx), Y(fy - ny)); x.lineTo(X(fx + nx), Y(fy + ny)); x.lineTo(X(fx + nx - dx * 3), Y(fy + ny - dy * 3)); x.lineTo(X(fx - nx - dx * 3), Y(fy - ny - dy * 3)); x.closePath(); x.fill();
      x.strokeStyle = '#d99a5a'; x.lineWidth = 3; x.beginPath(); x.moveTo(X(fx - nx), Y(fy - ny)); x.lineTo(X(fx + nx), Y(fy + ny)); x.stroke(); x.restore();
    });
    tm.addEventListener('input', () => { hold = 6; cur = +tm.value; L.kick(); });
  })();

  /* ── 5. «Ендьюренс»: зверху атмосфера (крига), знизу 3D-карта дрейфу; шхуна йде маршрутом за датами ── */
  (function () {
    const el = V('endur'); const ph = document.createElement('div'); ph.className = 'rr-photo'; el.appendChild(ph);
    const mp = document.createElement('div'); mp.className = 'rr-map'; el.appendChild(mp);
    const { R, scene, cam } = gl3(mp, 34);
    scene.background = new THREE.Color(0x0b1220);
    // маршрут: [день від 5.12.1914, широта, довгота, подія] — приблизні точки за щоденниками експедиції
    const D0 = Date.UTC(1914, 11, 5), day = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - D0) / 864e5);
    const RT = [[0, -54.28, -36.5, 'вихід з Південної Георгії'], [day(1915, 1, 19), -76.57, -31.5, 'вмерз у кригу'], [day(1915, 5, 1), -75.3, -41.0, 'полярна ніч, дрейф'],
      [day(1915, 8, 1), -72.4, -46.6, 'дрейф на північний захід'], [day(1915, 10, 27), -69.08, -51.5, 'корабель покинуто'], [day(1915, 11, 21), -68.65, -52.43, 'затонув'],
      [day(1916, 4, 9), -61.9, -53.9, 'шлюпки на воді'], [day(1916, 4, 15), -61.1, -54.86, 'острів Елефант'], [day(1916, 5, 10), -54.17, -37.4, '«Джеймс Керд» дійшов до Південної Георгії'],
      [day(1916, 8, 30), -61.1, -54.86, 'усіх 28 врятовано']];
    const LO0 = -64, LO1 = -24, LA0 = -79, LA1 = -52, MW = 10, MH = MW * (LA1 - LA0) / (LO1 - LO0) * 1.6;
    const mx = (lo) => (lo - LO0) / (LO1 - LO0) * MW - MW / 2, mz = (la) => (LA1 - la) / (LA1 - LA0) * MH - MH / 2;
    // текстура карти: схема — континент і кригові шельфи (приблизно), півострів, острови, сітка
    const tc = document.createElement('canvas'); tc.width = 1024; tc.height = Math.round(1024 * MH / MW); const t = tc.getContext('2d');
    const TX = (lo) => (lo - LO0) / (LO1 - LO0) * tc.width, TY = (la) => (LA1 - la) / (LA1 - LA0) * tc.height;
    t.fillStyle = '#16304a'; t.fillRect(0, 0, tc.width, tc.height);
    t.strokeStyle = 'rgba(255,255,255,.12)'; t.lineWidth = 1; for (let lo = -60; lo <= -25; lo += 5) { t.beginPath(); t.moveTo(TX(lo), 0); t.lineTo(TX(lo), tc.height); t.stroke(); } for (let la = -78; la <= -52; la += 2) { t.beginPath(); t.moveTo(0, TY(la)); t.lineTo(tc.width, TY(la)); t.stroke(); }
    const poly = (pts, c) => { t.fillStyle = c; t.beginPath(); pts.forEach(([la, lo], i) => i ? t.lineTo(TX(lo), TY(la)) : t.moveTo(TX(lo), TY(la))); t.closePath(); t.fill(); };
    poly([[-79, -64], [-79, -24], [-77.5, -24], [-76.6, -28], [-77.6, -34], [-78, -40], [-77.6, -48], [-75.5, -60], [-74, -64]], '#e8eef4');
    poly([[-74, -64], [-70, -61.5], [-66, -61], [-64, -59], [-63.2, -57], [-63.5, -56.5], [-65, -59], [-69, -62], [-74, -64]], '#e8eef4');
    poly([[-54, -38.2], [-54.6, -36.2], [-54.9, -35.9], [-54.4, -38.0]], '#cfd8e2');
    poly([[-61.0, -55.4], [-61.25, -54.6], [-61.2, -54.4], [-60.95, -55.1]], '#cfd8e2');
    t.font = '600 22px system-ui,sans-serif'; t.fillStyle = 'rgba(255,255,255,.55)'; t.fillText('МОРЕ ВЕДДЕЛЛА', TX(-46), TY(-70)); t.fillStyle = 'rgba(20,40,60,.55)'; t.fillText('АНТАРКТИДА', TX(-44), TY(-78.3));
    t.fillStyle = 'rgba(255,255,255,.55)'; t.fillText('Півд. Георгія', TX(-41), TY(-53.2)); t.fillText('о. Елефант', TX(-63), TY(-60.2));
    const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshStandardMaterial({ map: tex, roughness: .9 })); plane.rotation.x = -Math.PI / 2; scene.add(plane);
    const pts = RT.map((r) => new THREE.Vector3(mx(r[2]), .02, mz(r[1])));
    const lineAll = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0x9fb3d8, dashSize: .12, gapSize: .08, transparent: true, opacity: .55 })); lineAll.computeLineDistances(); scene.add(lineAll);
    const done = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xff7a3a })); scene.add(done);
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x203040, .9)); const sun = new THREE.DirectionalLight(0xfff2e0, 1.6); sun.position.set(-3, 6, 4); scene.add(sun);
    const ship = new THREE.Group(); scene.add(ship);
    gltf(A + 'endurance.glb', (g) => { const s = g.scene; s.scale.setScalar(1.25); s.rotation.y = Math.PI / 2; ship.add(s); L.kick(); });
    // камера вписує всю карту: від Південної Георгії (північ) до шельфу (південь); відстань — від розміру карти й вертикального поля зору
    const camT = new THREE.Vector3(pts[0].x, 0, pts[0].z), camOv = new THREE.Vector3(); let camF = 0;
    const fitMap = () => { const k = Math.max(1, 1.5 / cam.aspect); camOv.set(0, 10.5 * k, 9.6 * k); cam.position.copy(camOv); cam.lookAt(0, 0, .2); };
    new ResizeObserver(fitMap).observe(mp); fitMap();
    const dIn = $r('endur', '[data-d]'), dV = $r('endur', '[data-dv]'), bP = $r('endur', '[data-act="play"]');
    const h = hud(mp, ''); let play = false, dd = 0, auto = false;
    new IntersectionObserver((es) => { if (es[0].isIntersecting && !auto) { auto = true; play = true; bP.textContent = '❚❚ пауза'; L.kick(); } }, { threshold: .45 }).observe(el);   // дрейф стартує сам, щойно рядок видно
    bP.addEventListener('click', () => { play = !play; if (play && dd >= 634) dd = 0; bP.textContent = play ? '❚❚ пауза' : '▶ дрейф'; L.kick(); });
    dIn.addEventListener('input', () => { dd = +dIn.value; play = false; bP.textContent = '▶ дрейф'; L.kick(); });
    const V3 = new THREE.Vector3(), V4 = new THREE.Vector3();
    const L = live(el, (dt, T) => {
      if (play) { dd += dt * 40; if (dd >= 634) { dd = 634; play = false; bP.textContent = '▶ дрейф'; } dIn.value = String(Math.round(dd)); }
      let k = 0; while (k + 1 < RT.length - 1 && dd >= RT[k + 1][0]) k++;
      const a = RT[k], b = RT[k + 1], u = Math.min(1, Math.max(0, (dd - a[0]) / (b[0] - a[0])));
      V3.copy(pts[k]).lerp(pts[k + 1], u); V4.copy(pts[k + 1]).sub(pts[k]);
      // до затоплення — шхуна; після — маленька шлюпка-крапка (сама шхуна йде під воду за 3 дні)
      const sd = RT[5][0], sunk = dd >= sd;
      ship.visible = dd < sd + 3; ship.position.copy(V3); if (V4.lengthSq() > 1e-6 && !sunk) ship.rotation.y = Math.atan2(V4.x, V4.z) - Math.PI / 2;
      ship.position.y = sunk ? -.25 * Math.min(1, (dd - sd) / 3) : .02 + (reduce ? 0 : .01 * Math.sin(T * 2));
      boat.visible = sunk; boat.position.set(V3.x, .05, V3.z);
      done.geometry.setDrawRange(0, k + 2); done.geometry.attributes.position.setXYZ(k + 1, V3.x, .03, V3.z); done.geometry.attributes.position.needsUpdate = true;
      const date = new Date(D0 + dd * 864e5), ev = dd >= b[0] && k === RT.length - 2 ? b[3] : a[3];
      dV.textContent = Math.round(dd) + ' з 634';
      h.innerHTML = date.toLocaleDateString(window.PMP_LANG === 'pl' ? 'pl' : 'uk', { day: 'numeric', month: 'long', year: 'numeric' }) + '<b>' + ev + '</b>';
      // камера-супровід: близько за кораблем (видно модель), карта довкола; до старту й після порятунку — загальний план усієї карти
      const follow = (play || (dd > 0 && dd < 634)) ? 1 : 0; camF += (follow - camF) * Math.min(1, dt * 1.5);
      camT.lerp(V3, Math.min(1, dt * 3));
      if (camF > .01) { const k = Math.max(1, 1.5 / cam.aspect); V4.set(camT.x + .8, 2.6 * k, camT.z + 3.4 * k);
        cam.position.copy(camOv).lerp(V4, camF); V4.copy(camT).multiplyScalar(camF); cam.lookAt(V4.x, 0, V4.z + .2 * (1 - camF)); }
      else { cam.position.copy(camOv); cam.lookAt(0, 0, .2); }
      R.render(scene, cam);
    });
    const boat = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff7a3a })); boat.visible = false; scene.add(boat);
  })();

  /* ── 6. бутерброд Метьюза: обертання навколо краю столу до зісковзування, далі вільне падіння ── */
  (function () {
    const el = V('toast'), { R, scene, cam } = gl3(el, 30);
    scene.background = new THREE.Color(0x2a241e);
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a2e24, 1.6)); const key = new THREE.DirectionalLight(0xfff0dc, 2.2); key.position.set(-2, 4, 3); scene.add(key);
    const wood = new THREE.MeshStandardMaterial({ color: 0x7a5432, roughness: .7 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(.8, .03, .6), wood); scene.add(top);
    const legG = new THREE.BoxGeometry(.04, 1, .04), legs = [[-.36, -.26], [-.36, .26], [.3, -.26], [.3, .26]].map(([x, z]) => { const l = new THREE.Mesh(legG, wood); l.position.set(x, 0, z); scene.add(l); return l; });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x3a3029, roughness: .95 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const toast = new THREE.Group(), body = new THREE.Group(); toast.add(body); scene.add(toast);
    const fallback = new THREE.Mesh(new THREE.BoxGeometry(.11, .014, .1), new THREE.MeshStandardMaterial({ color: 0xd9a35a })); body.add(fallback);
    gltf(A + 'toast.glb', (g) => { body.remove(fallback); body.add(g.scene); L.kick(); });
    const hIn = $r('toast', '[data-h]'), hV = $r('toast', '[data-hv]'), out = $r('toast', '.rr-out');
    const g0 = 9.81, a = .11, d = .006, mu = .6, I = a * a / 12 + d * d, EX = .4;
    let S = null;
    function sim(H) {   // θ'' = g·d·cosθ / I навколо краю; зісковзує, коли сила вздовж скибки перевищує тертя (|R_r| > μ·R_t)
      let th = 0, w = 0; const dt = 2e-5;
      for (let i = 0; i < 2e5; i++) { const al = g0 * d * Math.cos(th) / I; w += al * dt; th += w * dt;
        const Rr = g0 * Math.sin(th) - d * w * w, Rt = g0 * Math.cos(th) - d * al; if (Math.abs(Rr) > mu * Rt || Rt <= 0 || th > Math.PI / 2) break; }
      const vy = w * d * Math.cos(th), tf = (-vy + Math.sqrt(vy * vy + 2 * g0 * H)) / g0;
      return { thS: th, w, tf, thF: th + w * tf, vy, H };
    }
    function setH() {
      const H = +hIn.value; hV.textContent = fmt(H, 2) + ' м'; top.position.set(0, H - .015, 0); legs.forEach((l) => { l.scale.y = H - .03; l.position.y = (H - .03) / 2; });
      S = sim(H); S.t = -.5;
      const deg = S.thF * 180 / Math.PI, down = Math.cos(S.thF) < 0;
      out.innerHTML = `<div><span>оберт на краю, поки не зісковзне</span><b>${fmt(S.thS * 180 / Math.PI, 0)}°</b></div><div><span>кутова швидкість</span><b>${fmt(S.w, 1)} рад/с</b></div>` +
        `<div><span>повернувся за падіння</span><b>${fmt(deg, 0)}°</b></div><div><span>упав</span><b class="${down ? 'bad' : 'ok'}">${down ? 'маслом донизу' : 'маслом догори'}</b></div>`;
      // камера: увесь стіл і підлога в кадрі за будь-якої висоти — відстань від вертикального поля зору (fov 30°)
      const dist = Math.max(1.25, (H + .35) / (2 * Math.tan(15 * Math.PI / 180)) * 1.08), dir = new THREE.Vector3(.42, .12, 1).normalize();
      cam.position.set(EX, H * .48, 0).addScaledVector(dir, dist); cam.lookAt(EX, H * .48, 0); if (L) L.kick();
    }
    $r('toast', '[data-act="drop"]').addEventListener('click', () => { if (S) S.t = -.5; L.kick(); });
    hIn.addEventListener('input', setH);
    cap(el, 'сповільнено вдвічі: скибка висувається за край, обертається навколо нього, зісковзує й падає');
    const L = live(el, (dt) => {
      if (!S) return; S.t += reduce ? 9 : dt * .5;
      // група скибки — у центрі мас (COM). Скибка лежить на столі (COM на висоті H + товщина/2), висувається, доки COM не вийде на 6 мм за край,
      // обертається навколо краю (COM по колу радіуса d), зісковзує й падає; на підлозі не заходить під неї й лягає пласко
      const T2 = .0135, half = (th) => Math.abs(Math.sin(th)) * a / 2 + Math.abs(Math.cos(th)) * T2;
      let th, px, py;
      if (S.t < 0) { th = 0; px = EX + d - .09 * (-S.t / .5); py = S.H + T2; }
      else if (S.t < .22) { th = S.thS * (S.t / .22); px = EX + d * Math.cos(th); py = S.H + T2 - d * Math.sin(th); }   // показ обертання стиснуто
      else {
        const tt = S.t - .22, vx = S.w * d * Math.sin(S.thS), x0 = EX + d * Math.cos(S.thS), y0 = S.H + T2 - d * Math.sin(S.thS);
        if (tt < S.tf) { th = S.thS + S.w * tt; px = x0 + vx * tt; py = Math.max(half(th), y0 - S.vy * tt - g0 * tt * tt / 2); }
        else {                                                               // удар: за 0,15 с лягає на найближчу пласку сторону
          const thF = S.thF, flat = Math.round(thF / Math.PI) * Math.PI, k = sm(0, .15, tt - S.tf);
          th = thF + (flat - thF) * k; px = x0 + vx * S.tf; py = half(th);
        }
      }
      toast.position.set(px, py, 0); toast.rotation.set(0, 0, -th);
      R.render(scene, cam);
    });
    setH();
  })();

  /* ── 7. віланела: 19 рядків, два рефрени-нитки; зоря спалахує на рефренах ── */
  (function () {
    const el = V('poem'), bg = document.createElement('div'); bg.className = 'rr-bg'; bg.style.backgroundImage = `url(${A}F-star.jpg)`; bg.style.transformOrigin = '30% 46%'; el.appendChild(bg);
    const C2 = canvas2d(el), x = C2.x;
    cap(el, 'будова віланели: рефрен 1 — рядки 1, 6, 12, 18; рефрен 2 — 3, 9, 15, 19');
    const A1 = [1, 6, 12, 18], A2 = [3, 9, 15, 19];
    let t = 0, sel = 0, selT = 0, Yf = null, x0f = 0;
    /* клік по рядку: якщо це рефрен — підсвічуються всі місця, де він повертається; інакше — підпис, яку риму рядок тримає */
    const tip = document.createElement('span'); tip.className = 'rr-hud'; tip.style.cssText = 'top:auto;bottom:30px;opacity:0;transition:opacity .35s'; el.appendChild(tip);
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => { if (!Yf) return; const r = el.getBoundingClientRect(), y = e.clientY - r.top;
      let best = 1, bd = 1e9; for (let i = 1; i <= 19; i++) { const d = Math.abs(Yf(i) - y); if (d < bd) { bd = d; best = i; } }
      sel = best; selT = 0; t = Math.max(t, 19 * 1.1);                                                      // показуємо одразу весь вірш
      const st = Math.min(6, Math.ceil(best / 3)), inSt = best > 18 ? 4 : (best - 1) % 3 + 1;
      tip.innerHTML = A1.includes(best) ? `рядок ${best} — <b style="color:#ff9a5a;font-size:15px;display:inline">рефрен 1</b>: повертається в рядках ${A1.join(', ')}`
        : A2.includes(best) ? `рядок ${best} — <b style="color:#8fb6ff;font-size:15px;display:inline">рефрен 2</b>: повертається в рядках ${A2.join(', ')}`
        : `рядок ${best}, строфа ${st}: ${inSt === 2 ? 'середній рядок — друга рима (b), що проходить крізь усі строфи' : 'рима a — та сама, що в рефренах'}`;
      tip.style.opacity = 1; clearTimeout(tip.t); tip.t = setTimeout(() => { tip.style.opacity = 0; sel = 0; }, 6000); L.kick(); });
    const L = live(el, (dt) => {
      t = (t + (reduce ? 30 : dt)) % 26; if (sel) { t = Math.max(t, 19 * 1.1); selT += dt; }
      const [W, H] = C2.size(), shown = Math.min(19, Math.floor(t / 1.1) + 1), x0 = W * .56, x1 = W - 22, y0 = 26, gap = (H - 64) / 19.6;
      const Y = (i) => y0 + (i - 1) * gap + Math.min(5, Math.floor((i - 1) / 3)) * gap * .12;     // між строфами — невеликий проміжок
      Yf = Y; x0f = x0;
      let pulse = 0;
      const grp = sel ? (A1.includes(sel) ? A1 : A2.includes(sel) ? A2 : [sel]) : [];
      if (grp.length) { const c = A1.includes(sel) ? '255,154,90' : A2.includes(sel) ? '143,182,255' : '255,255,255';
        grp.forEach((i, k) => { const a = Math.max(0, Math.min(1, (selT - k * .18) * 3)); x.fillStyle = `rgba(${c},${.22 * a})`; x.fillRect(x0 - 8, Y(i) - gap * .32, x1 - x0 + 14, gap * .64 + 3);
          x.fillStyle = `rgba(${c},${a})`; x.font = '600 10px ui-monospace,monospace'; x.textAlign = 'right'; x.fillText(String(i), x0 - 40, Y(i) + 4); });
        x.textAlign = 'left'; if (grp.length > 1) pulse = Math.max(0, 1 - ((selT % 1.2) / .6)) * .8; }
      for (let i = 1; i <= 19; i++) {
        const r1 = A1.includes(i), r2 = A2.includes(i), on = i <= shown, len = (r1 || r2) ? 1 : .55 + .35 * ((i * 37) % 10) / 10;
        x.globalAlpha = on ? 1 : .16; x.fillStyle = r1 ? '#ff9a5a' : r2 ? '#8fb6ff' : 'rgba(255,255,255,.6)';
        x.fillRect(x0, Y(i), (x1 - x0) * len, r1 || r2 ? 4 : 2.5);
        if (on && i === shown && (r1 || r2)) pulse = 1 - (t / 1.1 - Math.floor(t / 1.1));
      }
      x.globalAlpha = .85;
      [[A1, '#ff9a5a', 14], [A2, '#8fb6ff', 24]].forEach(([L2, c, o]) => { x.strokeStyle = c; x.lineWidth = 1.6; x.beginPath();
        L2.filter((i) => i <= shown).forEach((i, k) => { const y = Y(i) + 2, xx = x0 - o; k ? x.quadraticCurveTo(xx - 46, y - gap * 2.2, xx, y) : x.moveTo(xx, y); }); x.stroke(); });
      x.globalAlpha = 1;
      bg.style.filter = `brightness(${(1 + .55 * pulse).toFixed(3)})`; bg.style.transform = `scale(${(1.02 + .03 * pulse).toFixed(3)})`;
    });
  })();
}
