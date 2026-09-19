/* Мова сторінки. Словник — window.COPY зі згенерованого copy.js.
   Порожня клітинка в мові падає на українську: переклад іде окремим
   проходом, і недописаний ключ не має ламати сторінку. */
(function () {
  const FALLBACK = 'uk';
  const listeners = [];
  let lang = pick();

  function pick() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && window.COPY[q]) return q;
    try {
      const s = localStorage.getItem('ossbss.lang');
      if (s && window.COPY[s]) return s;
    } catch (e) { /* приватне вікно — не страшно */ }
    return FALLBACK;
  }

  function t(key) {
    const d = window.COPY[lang] || {};
    return d[key] || window.COPY[FALLBACK][key] || key;
  }

  /* data-i18n — текст, data-i18n-html — з розміткою (<b>, <a>), бо в
     абзацах є виділення. HTML приходить лише з нашого CSV. */
  function apply(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    (root || document).querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    (root || document).querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    document.documentElement.lang = lang;
    document.title = t('ui.title');
  }

  function set(next) {
    if (!window.COPY[next] || next === lang) return;
    lang = next;
    try { localStorage.setItem('ossbss.lang', lang); } catch (e) {}
    apply();
    listeners.forEach((fn) => fn(lang));
  }

  window.I18N = {
    t, apply, set,
    get lang() { return lang; },
    onChange(fn) { listeners.push(fn); },
  };
})();
