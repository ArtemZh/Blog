/* Сторінка 32 «Past tenses in French»: часова вісь, дієслова з être, конструктор
   passé composé, генератор imparfait, тест. Схема — окремо, shared/comp.js. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SVG = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p, txt) => { const n = document.createElementNS(SVG, tag); for (const k in a) n.setAttribute(k, a[k]); if (txt != null) n.textContent = txt; if (p) p.appendChild(n); return n; };

  /* ── 03 історія на часовій осі. from/to — частки осі (0 — давно, 1 — тепер) ── */
  const STORY = [
    { k: 'imp', fr: 'Il pleuvait.', en: 'It was raining — background, lasts the whole evening.', from: .28, to: .72, row: 0, lab: 'pleuvait' },
    { k: 'pqp', fr: "J'avais oublié mes clés au bureau.", en: 'I had left my keys at the office — before the evening.', at: .14, row: 1, lab: 'avais oublié' },
    { k: 'pc', fr: 'Je suis rentré à minuit.', en: 'I got home at midnight — an event.', at: .5, row: 1, lab: 'suis rentré' },
    { k: 'imp', fr: 'Mon voisin dormait.', en: 'My neighbour was sleeping — a state at that moment.', from: .38, to: .66, row: 2, lab: 'dormait' },
    { k: 'pc', fr: "J'ai sonné chez lui.", en: 'I rang his bell — the next event.', at: .58, row: 3, lab: 'ai sonné' },
    { k: 'rec', fr: 'Je viens de les retrouver dans ma poche.', en: 'I have just found them in my pocket — just before now.', at: .95, row: 4, lab: 'viens de retrouver' },
  ];
  (function timeline() {
    const svg = $('#tline'), list = $('#story'), W = 760, L = 30, R = 30, T = 30, RH = 46;
    const X = (f) => L + f * (W - L - R);
    el('line', { x1: L, x2: W - R, y1: 270, y2: 270, class: 'ax' }, svg);
    el('text', { x: L, y: 290 }, svg, 'earlier');
    el('text', { x: W - R, y: 290, 'text-anchor': 'end' }, svg, 'now');
    el('line', { x1: X(1), x2: X(1), y1: 20, y2: 276, stroke: 'var(--act)', 'stroke-width': 3 }, svg);
    el('text', { x: X(.5), y: 290, 'text-anchor': 'middle' }, svg, 'last night');
    const items = STORY.map((s, i) => {
      const g = el('g', { class: 'it', 'data-i': i }, svg), y = T + s.row * RH;
      if (s.k === 'imp') { el('rect', { x: X(s.from), y: y - 7, width: X(s.to) - X(s.from), height: 14, rx: 7, class: 'band' }, g);
        el('text', { x: X(s.from), y: y - 12, class: 'lbl' }, g, s.lab); }
      else { const c = s.k === 'pqp' ? 'ring' : 'dot';
        el('circle', { cx: X(s.at), cy: y, r: 7, class: c }, g);
        if (s.k === 'rec') el('line', { x1: X(s.at), x2: X(1), y1: y, y2: y, stroke: 'var(--act)', 'stroke-width': 2, 'stroke-dasharray': '3 3' }, g);
        el('text', { x: X(s.at) + (s.at > .8 ? -12 : 12), y: y + 4, class: 'lbl', 'text-anchor': s.at > .8 ? 'end' : 'start' }, g, s.lab); }
      el('line', { x1: X(s.at != null ? s.at : s.from), x2: X(s.at != null ? s.at : s.from), y1: y + 8, y2: 266, stroke: 'var(--rule)', 'stroke-dasharray': '2 3' }, g);
      return g;
    });
    const name = { imp: 'imparfait', pc: 'passé composé', pqp: 'plus-que-parfait', rec: 'passé récent' };
    STORY.forEach((s, i) => { const li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      b.innerHTML = `<b>${esc(s.fr)}</b><span>${esc(name[s.k])} · ${esc(s.en)}</span>`;
      b.addEventListener('click', () => { const on = !b.classList.contains('on');
        list.querySelectorAll('button').forEach((x) => x.classList.remove('on')); items.forEach((g) => g.classList.remove('on'));
        svg.classList.toggle('sel', on); if (on) { b.classList.add('on'); items[i].classList.add('on'); } });
      li.appendChild(b); list.appendChild(li); });
  })();

  /* ── 04 шістнадцять дієслів з être ───────────────────────────── */
  const ETRE = [
    ['Devenir', 'devenu', 'Elle est devenue médecin.', 'She became a doctor.'],
    ['Revenir', 'revenu', 'Ils sont revenus hier.', 'They came back yesterday.'],
    ['Monter', 'monté', 'Je suis monté au grenier.', 'I went up to the attic.'],
    ['Rester', 'resté', 'Nous sommes restés à la maison.', 'We stayed at home.'],
    ['Sortir', 'sorti', 'Tu es sorti ce soir ?', 'Did you go out tonight?'],
    ['Venir', 'venu', 'Elles sont venues en train.', 'They came by train.'],
    ['Aller', 'allé', 'Je suis allé à Paris.', 'I went to Paris.'],
    ['Naître', 'né', 'Victor Hugo est né en 1802.', 'Victor Hugo was born in 1802.'],
    ['Descendre', 'descendu', 'Elle est descendue du bus.', 'She got off the bus.'],
    ['Entrer', 'entré', 'Il est entré sans frapper.', 'He came in without knocking.'],
    ['Rentrer', 'rentré', 'Je suis rentré tard.', 'I got home late.'],
    ['Tomber', 'tombé', 'L’enfant est tombé.', 'The child fell.'],
    ['Retourner', 'retourné', 'Nous sommes retournés en Italie.', 'We went back to Italy.'],
    ['Arriver', 'arrivé', 'Le train est arrivé à l’heure.', 'The train arrived on time.'],
    ['Mourir', 'mort', 'Molière est mort en 1673.', 'Molière died in 1673.'],
    ['Partir', 'parti', 'Elles sont parties tôt.', 'They left early.'],
  ];
  (function etre() {
    const box = $('#etre'), out = $('#etreEx');
    const show = (v) => { out.innerHTML = `<span class="fr">${esc(v[2])}</span>${esc(v[0].toLowerCase())} → ${esc(v[1])} · ${esc(v[3])}`; };
    ETRE.forEach((v, i) => { const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = `<b>${v[0][0]}</b>${esc(v[0].slice(1).toLowerCase())}`; b.title = v[3];
      b.addEventListener('click', () => { box.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); show(v); });
      box.appendChild(b); if (i === 6) { b.classList.add('on'); show(v); } });
    out.insertAdjacentHTML('afterend', '<p class="chint" style="margin-top:6px">The first letters spell DR MRS VANDERTRAMP. <i>Passer</i> is often added: <i>je suis passé chez toi</i> — I dropped by your place.</p>');
  })();

  /* ── 04 конструктор passé composé ─────────────────────────────── */
  const VERBS = [
    { inf: 'aller', pp: 'allé', aux: 'e' }, { inf: 'partir', pp: 'parti', aux: 'e' }, { inf: 'naître', pp: 'né', aux: 'e' },
    { inf: 'tomber', pp: 'tombé', aux: 'e' }, { inf: 'se lever', pp: 'levé', aux: 'r' }, { inf: 's’habiller', pp: 'habillé', aux: 'r' },
    { inf: 'manger', pp: 'mangé', aux: 'a' }, { inf: 'finir', pp: 'fini', aux: 'a' }, { inf: 'prendre', pp: 'pris', aux: 'a' },
    { inf: 'écrire', pp: 'écrit', aux: 'a' }, { inf: 'avoir', pp: 'eu', aux: 'a' }, { inf: 'être', pp: 'été', aux: 'a' },
  ];
  // особа: займенник, форма avoir, форма être, зворотний займенник, рід, число
  const WHO = [
    { t: 'je (man)', p: 'je', a: 'ai', e: 'suis', r: 'me', f: 0, pl: 0 }, { t: 'je (woman)', p: 'je', a: 'ai', e: 'suis', r: 'me', f: 1, pl: 0 },
    { t: 'tu (man)', p: 'tu', a: 'as', e: 'es', r: 'te', f: 0, pl: 0 }, { t: 'il', p: 'il', a: 'a', e: 'est', r: 'se', f: 0, pl: 0 },
    { t: 'elle', p: 'elle', a: 'a', e: 'est', r: 'se', f: 1, pl: 0 }, { t: 'nous (men or mixed)', p: 'nous', a: 'avons', e: 'sommes', r: 'nous', f: 0, pl: 1 },
    { t: 'vous (one woman, polite)', p: 'vous', a: 'avez', e: 'êtes', r: 'vous', f: 1, pl: 0 }, { t: 'ils', p: 'ils', a: 'ont', e: 'sont', r: 'se', f: 0, pl: 1 },
    { t: 'elles', p: 'elles', a: 'ont', e: 'sont', r: 'se', f: 1, pl: 1 },
  ];
  const vowel = (s) => /^[aeéèêiîouyh]/i.test(s);
  const agree = (pp, f, pl) => pp + (f ? 'e' : '') + (pl && !/s$/.test(pp + (f ? 'e' : '')) ? 's' : '');
  function buildPC(v, w) {
    let aux, pp = v.pp, why, pron = w.p;
    if (v.aux === 'a') { aux = w.a; why = `<b>Avoir</b>: ${esc(v.inf)} is not one of the être verbs. With avoir the participle does not agree with the subject.`; }
    else { aux = w.e; pp = agree(v.pp, w.f, w.pl);
      const change = pp !== v.pp ? ` It agrees with the subject: ${w.f ? 'feminine' : 'masculine'}${w.pl ? ' plural' : ' singular'}, so <i>${esc(v.pp)}</i> → <i>${esc(pp)}</i>.` : ' Masculine singular subject — no ending added.';
      why = (v.aux === 'r' ? `<b>Être</b>: a reflexive verb always takes être.` : `<b>Être</b>: ${esc(v.inf)} is one of the sixteen être verbs.`) + change; }
    let refl = '';
    if (v.aux === 'r') refl = (w.r === 'me' || w.r === 'te' || w.r === 'se') && vowel(aux) ? w.r[0] + '’' : w.r + ' ';
    let subj = pron;
    if (pron === 'je' && !refl && vowel(aux)) subj = 'j’'; else subj += ' ';
    if (v.inf === 'avoir' || v.inf === 'être') why += v.inf === 'être' ? ' Note: être itself takes avoir — <i>j’ai été</i>.' : '';
    return { fr: `${subj}${refl}${aux} ${pp}`, why };
  }
  (function pc() {
    const sv = $('#pcVerb'), sw = $('#pcWho');
    VERBS.forEach((v, i) => sv.add(new Option(v.inf + (v.aux === 'a' ? ' (avoir)' : v.aux === 'e' ? ' (être)' : ' (reflexive)'), i)));
    WHO.forEach((w, i) => sw.add(new Option(w.t, i)));
    sv.value = 0; sw.value = 8;
    const draw = () => { const r = buildPC(VERBS[sv.value], WHO[sw.value]); $('#pcOut').innerHTML = `<span class="fr">${esc(r.fr)}</span><div class="why">${r.why}</div>`; };
    sv.addEventListener('change', draw); sw.addEventListener('change', draw); draw();
    window.FRPAST = Object.assign(window.FRPAST || {}, { buildPC, VERBS, WHO });
  })();

  /* ── 05 imparfait ─────────────────────────────────────────────── */
  // a — основа перед a (-ais, -ait, -aient), i — перед i (-ions, -iez)
  const IMP = [
    { inf: 'parler', nous: 'parlons', a: 'parl', i: 'parl' }, { inf: 'finir', nous: 'finissons', a: 'finiss', i: 'finiss' },
    { inf: 'prendre', nous: 'prenons', a: 'pren', i: 'pren' }, { inf: 'faire', nous: 'faisons', a: 'fais', i: 'fais' },
    { inf: 'avoir', nous: 'avons', a: 'av', i: 'av' }, { inf: 'aller', nous: 'allons', a: 'all', i: 'all' },
    { inf: 'voir', nous: 'voyons', a: 'voy', i: 'voy' }, { inf: 'lire', nous: 'lisons', a: 'lis', i: 'lis' },
    { inf: 'écrire', nous: 'écrivons', a: 'écriv', i: 'écriv' },
    { inf: 'manger', nous: 'mangeons', a: 'mange', i: 'mang', note: 'Keeps the <i>e</i> before <i>a</i> so the g stays soft: mangeais — but mangions, mangiez.' },
    { inf: 'commencer', nous: 'commençons', a: 'commenç', i: 'commenc', note: 'Takes <i>ç</i> before <i>a</i> so the c stays soft: commençais — but commencions, commenciez.' },
    { inf: 'être', nous: 'sommes', a: 'ét', i: 'ét', note: 'The one exception: the stem is <i>ét-</i>, not taken from <i>nous sommes</i>.' },
  ];
  const PERS = [['je', 'ais'], ['tu', 'ais'], ['il / elle', 'ait'], ['nous', 'ions'], ['vous', 'iez'], ['ils / elles', 'aient']];
  function impForm(v, k) { const end = PERS[k][1], stem = end[0] === 'a' ? v.a : v.i; return { stem, end, word: stem + end }; }
  (function imp() {
    const s = $('#impVerb'); IMP.forEach((v, i) => s.add(new Option(v.inf, i)));
    const draw = () => { const v = IMP[s.value];
      $('#impOut').innerHTML = `<div class="note2">nous ${esc(v.nous)} → stem <b>${esc(v.inf === 'être' ? 'ét-' : v.a + '-')}</b>${v.note ? ' · ' + v.note : ''}</div>` +
        PERS.map((p, k) => { const f = impForm(v, k); const pr = p[0] === 'je' && /^[aeéèêiîouyh]/.test(f.word) ? 'j’' : p[0] + ' ';
          return `<div><i>${esc(pr.trim())}</i>${esc(f.stem)}<u>${esc(f.end)}</u></div>`; }).join(''); };
    s.addEventListener('change', draw); draw();
    window.FRPAST = Object.assign(window.FRPAST || {}, { impForm, IMP });
  })();

  /* ── 09 тест ──────────────────────────────────────────────────── */
  const Q = [
    { q: 'Quand j’étais petit, je ___ au parc tous les dimanches.', h: 'aller', o: ['suis allé', 'allais', 'étais allé'], a: 1,
      e: '“Tous les dimanches” is a habit in the past: imparfait.' },
    { q: 'Hier, nous ___ un film génial.', h: 'voir', o: ['voyions', 'avons vu', 'avions vu'], a: 1,
      e: 'A single completed event, “hier”: passé composé with avoir.' },
    { q: 'Il ___ quand le téléphone a sonné.', h: 'dormir', o: ['dormait', 'a dormi', 'avait dormi'], a: 0,
      e: 'An action in progress, interrupted by an event: imparfait.' },
    { q: 'Quand je suis arrivé, le train ___ déjà ___.', h: 'partir', o: ['est … parti', 'partait …', 'était … parti'], a: 2,
      e: 'The train left before I arrived — the past before the past: plus-que-parfait.' },
    { q: 'Elle ___ née en 1990.', h: 'auxiliary', o: ['a', 'est'], a: 1,
      e: 'Naître is one of the sixteen être verbs.' },
    { q: 'Ils ___ la valise dans la voiture.', h: 'monter', o: ['sont montés', 'ont monté'], a: 1,
      e: 'Monter takes a direct object here (la valise), so it switches to avoir.' },
    { q: 'Les lettres que j’ai ___ sont sur la table.', h: 'écrire', o: ['écrit', 'écrite', 'écrits', 'écrites'], a: 3,
      e: 'Avoir, and the direct object (que = les lettres, feminine plural) comes before the verb: écrites.' },
    { q: 'Marie et Sophie sont ___ à Paris.', h: 'aller', o: ['allé', 'allée', 'allés', 'allées'], a: 3,
      e: 'Être: agreement with the subject, two women — feminine plural.' },
    { q: 'Elles se sont ___ les mains.', h: 'laver', o: ['lavé', 'lavées'], a: 0,
      e: 'The direct object is “les mains”, placed after the verb; “se” is only the indirect object. No agreement.' },
    { q: 'Je ___ de finir mes devoirs.', h: 'I have just finished', o: ['viens', 'venais', 'suis venu'], a: 0,
      e: 'Passé récent: venir in the present + de + infinitive.' },
    { q: 'Il faisait beau et les oiseaux ___.', h: 'chanter', o: ['ont chanté', 'chantaient', 'avaient chanté'], a: 1,
      e: 'Scenery and background: imparfait, like “il faisait beau”.' },
    { q: 'Soudain, quelqu’un ___ à la porte.', h: 'frapper', o: ['frappait', 'a frappé', 'avait frappé'], a: 1,
      e: '“Soudain” marks a sudden event: passé composé.' },
    { q: 'In a novel you read “Il fut surpris”. “Fut” is a form of…', h: 'passé simple', o: ['faire', 'être', 'falloir'], a: 1,
      e: 'Être → il fut. Faire → il fit, falloir → il fallut.' },
    { q: 'How would you say “Elle entra dans la pièce” in conversation?', h: 'spoken equivalent', o: ['Elle entrait dans la pièce.', 'Elle est entrée dans la pièce.', 'Elle a entré dans la pièce.'], a: 1,
      e: 'The passé simple of a single event becomes the passé composé; entrer takes être, so the participle agrees: entrée.' },
    { q: 'Je ___ toujours mes devoirs avant le dîner.', h: 'finir', o: ['finis', 'finissais', 'finirais'], a: 1,
      e: 'A past habit (toujours): imparfait, built on nous finissons → finiss- + ais.' },
    { q: 'Si j’___ su, je serais venu.', h: 'avoir', o: ['avais', 'aurais', 'ai'], a: 0,
      e: 'A regret about the past: si + plus-que-parfait, then the past conditional. Never “si j’aurais”.' },
  ];
  const KEY = 'frpast-best';
  const quiz = { order: [], i: 0, score: 0, picked: [] };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const best = () => { try { return +(localStorage.getItem(KEY) || 0); } catch (e) { return 0; } };
  function start() { quiz.order = shuffle(Q.map((_, i) => i)); quiz.i = 0; quiz.score = 0; quiz.picked = []; drawQ(); }
  function drawQ() {
    const box = $('#quiz');
    if (quiz.i >= Q.length) return drawResult();
    const q = Q[quiz.order[quiz.i]];
    box.innerHTML = `<div class="qhead"><span>Question ${quiz.i + 1} of ${Q.length}</span><span>Score ${quiz.score}</span></div>
      <div class="qbar"><i style="width:${quiz.i / Q.length * 100}%"></i></div>
      <p class="qtext"><span class="fr">${esc(q.q)}</span></p><p class="qhint">${esc(q.h)}</p>
      <div class="qopts">${q.o.map((o, k) => `<button type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div><div class="qfb"></div><div class="qnav"></div>`;
    box.querySelectorAll('.qopts button').forEach((b) => b.addEventListener('click', () => answer(+b.dataset.k)));
  }
  function answer(k) {
    const box = $('#quiz'), q = Q[quiz.order[quiz.i]], ok = k === q.a;
    if (ok) quiz.score++;
    quiz.picked.push({ q: quiz.order[quiz.i], k, ok });
    box.querySelectorAll('.qopts button').forEach((b) => { const j = +b.dataset.k; b.disabled = true; if (j === q.a) b.classList.add('ok'); else if (j === k) b.classList.add('no'); });
    $('.qfb', box).innerHTML = `<b>${ok ? 'Correct.' : 'Not quite — the answer is “' + esc(q.o[q.a]) + '”.'}</b> ${esc(q.e)}`;
    $('.qhead span:last-child', box).textContent = 'Score ' + quiz.score;
    const n = document.createElement('button'); n.type = 'button'; n.className = 'qbtn';
    n.textContent = quiz.i === Q.length - 1 ? 'See the result' : 'Next question';
    n.addEventListener('click', () => { quiz.i++; drawQ(); }); $('.qnav', box).appendChild(n); n.focus({ preventScroll: true });
  }
  function drawResult() {
    const b = Math.max(best(), quiz.score); try { localStorage.setItem(KEY, b); } catch (e) {}
    const wrong = quiz.picked.filter((p) => !p.ok);
    const verdict = quiz.score >= 14 ? 'Excellent — you know your past tenses.' : quiz.score >= 10 ? 'Good. Look at the questions below and the sections they come from.' : 'Worth another read of sections 4–7, then try again.';
    $('#quiz').innerHTML = `<div class="qhead"><span>Result</span><span>Best in this browser: ${b} / ${Q.length}</span></div>
      <div class="qbar"><i style="width:100%"></i></div><div class="qres">${quiz.score} / ${Q.length}</div><p>${verdict}</p>
      ${wrong.length ? '<b>To review:</b><ol class="qlist">' + wrong.map((p) => { const q = Q[p.q]; return `<li><span class="fr">${esc(q.q)}</span> — ${esc(q.o[q.a])}. ${esc(q.e)}</li>`; }).join('') + '</ol>' : ''}
      <div class="qnav"><button type="button" class="qbtn" id="qAgain">Try again — new order</button></div>`;
    $('#qAgain').addEventListener('click', start);
  }
  start();
  window.FRPAST = Object.assign(window.FRPAST || {}, { Q, quiz, answer, start });

  /* ── зміст у шапці ───────────────────────────────────────────── */
  (function toc() {
    const links = [...document.querySelectorAll('#toc a')], items = links.map((a) => ({ a, el: document.getElementById(a.getAttribute('href').slice(1)) }));
    let tick = false;
    const paint = () => { tick = false; let cur = items[0]; items.forEach((it) => { if (it.el.getBoundingClientRect().top <= 90) cur = it; }); links.forEach((a) => a.classList.toggle('on', a === cur.a)); };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true }); paint();
  })();
})();
