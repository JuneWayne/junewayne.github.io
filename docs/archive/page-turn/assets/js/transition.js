/** Internal navigation uses a single, forward book-page turn. */
import { makePageTurn, TURN_DURATION, HAND_SPRITE_URL } from './page-turn.js';
const supportedPages = new Set(['index.html', 'teaching.html', 'cv.html', 'cat.html', 'blake.html']);
const pageKey = (url) => new URL(url).pathname.replace(/\/$/, '/index.html');

export function setupNavigation({ renderPage, updateNavigation }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches) {
    const hand = new Image();
    hand.src = HAND_SPRITE_URL;
    hand.decode().catch(() => {});
  }
  const forcedColors = matchMedia('(forced-colors: active)');
  const cache = new Map();
  const allowedPaths = new Set([...supportedPages].map((name) => new URL(name, location.href).pathname));
  let displayedURL = new URL(location.href);
  let pending = null;
  let generation = 0;
  let scrollFrame = 0;
  history.scrollRestoration = 'manual';

  function targetFor(anchor) {
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return null;
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || !allowedPaths.has(pageKey(url))) return null;
    // Preserve document anchors and skip links; Profile and Research are page turns.
    if (pageKey(url) === pageKey(displayedURL) && url.hash && !anchor.matches('[data-nav]')) return null;
    return url;
  }

  function load(url) {
    const key = pageKey(url);
    if (!cache.has(key)) {
      cache.set(key, fetch(key, { signal: AbortSignal.timeout(3000) }).then((response) => {
        if (!response.ok) throw new Error('Page unavailable');
        return response.text();
      }).then((html) => {
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        if (!parsed.querySelector('main') || !parsed.body.dataset.page) throw new Error('Invalid page');
        return parsed;
      }).catch((error) => { cache.delete(key); throw error; }));
    }
    return cache.get(key);
  }

  function stop() {
    generation++;
    if (!pending) return;
    clearTimeout(pending.watchdog);
    pending.turn?.finish();
    pending = null;
  }

  function scrollToTarget(url, restore) {
    const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (restore) scrollTo({ top: restore.y || 0, left: 0, behavior: 'instant' });
    else if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    else scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  function swap(url, parsed, historyNavigation) {
    if (parsed) {
      document.querySelector('main').replaceWith(document.importNode(parsed.querySelector('main'), true));
      document.querySelector('#photo-dialog')?.remove();
      const dialog = parsed.querySelector('#photo-dialog');
      if (dialog) document.body.append(document.importNode(dialog, true));
      document.body.dataset.page = parsed.body.dataset.page;
      document.title = parsed.title;
      document.querySelector('meta[name="description"]').content = parsed.querySelector('meta[name="description"]').content;
    }
    if (!historyNavigation) {
      history.replaceState({ ...history.state, y: scrollY }, '', location.href);
      history.pushState({ y: 0 }, '', url.href);
    }
    displayedURL = url;
    if (parsed) renderPage();
    else updateNavigation();
    scrollToTarget(url, historyNavigation ? history.state : null);
  }

  function navigate(url, { historyNavigation = false, keyboard = false } = {}) {
    stop();
    const token = generation;
    const differentPage = pageKey(url) !== pageKey(displayedURL);
    let ready = !differentPage;
    let parsed = null;
    let swapped = false;
    const animate = !historyNavigation && !reducedMotion.matches && !forcedColors.matches && !document.hidden && Element.prototype.animate;
    const turn = animate ? makePageTurn() : null;
    pending = { turn, watchdog: 0 };

    function fallback() {
      if (token !== generation) return;
      stop();
      if (historyNavigation) location.reload();
      else location.assign(url.href);
    }

    function finish() {
      if (token !== generation || !pending) return;
      turn?.finish();
      clearTimeout(pending.watchdog);
      pending = null;
      if (keyboard) {
        const target = (url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)))) || document.querySelector('main');
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }

    pending.settle = () => {
      if (!ready) { fallback(); return; }
      if (!swapped) swap(url, parsed, historyNavigation);
      finish();
      generation++;
    };
    // Leave the current page readable while fetching; slow links retain native navigation.
    pending.watchdog = setTimeout(fallback, 500);
    const page = differentPage ? load(url).then((result) => { parsed = result; ready = true; }) : Promise.resolve();
    Promise.all([page, turn?.ready ?? false]).then(([, prepared]) => {
      if (token !== generation || !pending) return;
      clearTimeout(pending.watchdog);
      if (prepared) turn.show();
      else turn?.finish();
      // Mount the destination underneath the old sheet before its first animation frame.
      swap(url, parsed, historyNavigation);
      swapped = true;
      if (!prepared) { finish(); return; }
      turn.play(finish);
      pending.watchdog = setTimeout(finish, TURN_DURATION + 200);
    }).catch(fallback);
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href]');
    const url = targetFor(anchor);
    if (!url) return;
    event.preventDefault();
    if (pageKey(url) === pageKey(displayedURL) && url.hash === displayedURL.hash && !pending) return;
    navigate(url, { keyboard: event.detail === 0 });
  });
  // Warm the tiny HTML documents on intent; fonts, scripts and photos stay cached.
  for (const eventName of ['pointerover', 'focusin']) document.addEventListener(eventName, (event) => {
    const url = targetFor(event.target.closest('a[href]'));
    if (url && pageKey(url) !== pageKey(displayedURL)) load(url).catch(() => {});
  });
  window.addEventListener('popstate', () => navigate(new URL(location.href), { historyNavigation: true }));
  window.addEventListener('hashchange', () => { displayedURL = new URL(location.href); });
  window.addEventListener('scroll', () => {
    if (pending || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      history.replaceState({ ...history.state, y: scrollY }, '', location.href);
    });
  }, { passive: true });
  for (const eventName of ['resize', 'visibilitychange']) window.addEventListener(eventName, () => {
    if (!pending) return;
    pending.settle();
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches || !pending) return;
    pending.settle();
  });
}
