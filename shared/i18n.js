/* Переклад текстів, які малюють скрипти статей (canvas, схеми, панелі), для мов, де статичний текст лежить у data-<мова> (lang.js).
   SK_I18N(мова, словник): працює лише коли PMP_LANG === мова. Canvas — fillText/strokeText/measureText перекладають рядок
   (ширини рахуються вже з перекладом); DOM — текстові вузли й підказки (title, alt, aria-label, placeholder) після появи.
   Складені рядки перекладаються частинами: спершу точний збіг, далі — відомі фрагменти від найдовших, лише цілими словами
   (фрагменти з 1–2 символів — тільки точним збігом). Словники: i18n-en.js (стаття 36), i18n-pl.js (стаття 34). */
window.SK_I18N = function (LANG, D) {
  if (window.PMP_LANG !== LANG) return;
  var CY = /[Ѐ-ӿ]/, cache = Object.create(null);
  // фрагменти — від найдовших; двосимвольні лише з пробілом попереду (одиниці після числа: « с», « м»)
  var keys = Object.keys(D).filter(function (k) { return k.length >= 3 || (k.length === 2 && k[0] === ' '); }).sort(function (a, b) { return b.length - a.length; });
  function tr(s) {
    if (typeof s !== 'string' || !CY.test(s)) return s;
    if (D[s] !== undefined) return D[s];
    var t = s.trim(); if (D[t] !== undefined) return s.replace(t, D[t]);
    if (cache[s] !== undefined) return cache[s];
    // лише цілими словами: фрагмент не може починатись чи закінчуватись посеред українського слова («файл» ≠ «файли»)
    var r = s; for (var i = 0; i < keys.length && CY.test(r); i++) if (r.indexOf(keys[i]) >= 0) r = r.replace(rx(keys[i]), function () { return D[keys[i]]; });
    if (!CY.test(r)) r = r.replace(/«/g, '“').replace(/»/g, '”');   // українські лапки → англійські, коли рядок уже перекладено
    return (cache[s] = r);
  }
  // межа слова перевіряється лише там, де фрагмент сам починається чи закінчується літерою
  var RX = Object.create(null), LET = /[\u0400-\u04FF]/; function rx(k) { if (RX[k]) return RX[k]; var e = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (RX[k] = new RegExp((LET.test(k[0]) ? '(?<![\\u0400-\\u04FF’\'])' : '') + e + (LET.test(k[k.length - 1]) ? '(?![\\u0400-\\u04FF])' : ''), 'g')); }
  window.SK_TR = tr;
  // canvas: переклад рядка перед малюванням і виміром
  var C2 = CanvasRenderingContext2D.prototype;
  ['fillText', 'strokeText', 'measureText'].forEach(function (m) { var f = C2[m]; C2[m] = function (s) { var a = Array.prototype.slice.call(arguments); a[0] = tr(String(s)); return f.apply(this, a); }; });
  // DOM: текстові вузли й підказки
  var ATTR = ['title', 'alt', 'aria-label', 'placeholder', 'data-tip'];
  function fixEl(el) { for (var i = 0; i < ATTR.length; i++) { var v = el.getAttribute && el.getAttribute(ATTR[i]); if (v && CY.test(v)) { var w = tr(v); if (w !== v) el.setAttribute(ATTR[i], w); } } }
  function walk(n) {
    if (n.nodeType === 3) { if (CY.test(n.nodeValue)) { var v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } return; }
    if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return; fixEl(n);
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  var mo = new MutationObserver(function (L) { L.forEach(function (m) { if (m.type === 'characterData') walk(m.target); else if (m.type === 'attributes') fixEl(m.target); else m.addedNodes.forEach(walk); }); });
  function start() { walk(document.body); if (CY.test(document.title)) document.title = tr(document.title);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR }); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
};
