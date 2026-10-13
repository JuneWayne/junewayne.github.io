/** Flat, top-down letter vortex. Native links still work without JavaScript. */
const DURATION = 480;
const MIDPOINT = 210;
const TURN = Math.PI * 2 * 1.05;
const supportedPages = new Set(['index.html', 'teaching.html', 'cv.html', 'cat.html']);
const pageKey = (url) => new URL(url).pathname.replace(/\/$/, '/index.html');

function capture(main) {
  const particles = [];
  const limit = innerWidth < 700 ? 650 : 1200;
  const visible = (rect) => rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!node.textContent.trim() || parent.closest('.sr-only, [aria-hidden="true"], noscript, script, style')) continue;
    if (!visible(parent.getBoundingClientRect())) continue;
    const style = getComputedStyle(parent);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    for (let i = 0; i < node.length; i++) {
      if (/\s/.test(node.textContent[i])) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (!visible(rect)) continue;
      particles.push({ text: node.textContent[i], font, color: style.color, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
    }
  }
  // Sample evenly, keeping long research pages within a predictable frame budget.
  const sampled = particles.length > limit ? Array.from({ length: limit }, (_, i) => particles[Math.floor(i * particles.length / limit)]) : particles;
  for (const image of main.querySelectorAll('img')) {
    const rect = image.getBoundingClientRect();
    if (!visible(rect) || !image.complete || !image.naturalWidth) continue;
    // Small photo tiles join the letters, rather than spinning a large rectangle.
    const style = getComputedStyle(image);
    const cover = style.objectFit === 'cover';
    const ratio = cover ? Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight) : Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const [px, py] = style.objectPosition.split(' ').map((value) => parseFloat(value) / 100);
    const sourceWidth = rect.width / ratio;
    const sourceHeight = rect.height / ratio;
    const offsetX = Math.max(0, (image.naturalWidth - sourceWidth) * (px || 0));
    const offsetY = Math.max(0, (image.naturalHeight - sourceHeight) * (py || 0));
    for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
      sampled.push({ image, sx: offsetX + col * sourceWidth / 4, sy: offsetY + row * sourceHeight / 4, sw: sourceWidth / 4, sh: sourceHeight / 4,
        width: rect.width / 4, height: rect.height / 4, x: rect.left + (col + .5) * rect.width / 4, y: rect.top + (row + .5) * rect.height / 4 });
    }
  }
  return sampled.map((particle, index) => ({ ...particle, seed: (index * .61803398875) % 1 }));
}

function makeVortex(main) {
  const canvas = document.createElement('canvas');
  canvas.className = 'page-vortex';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d');
  if (!context) return null;
  const width = innerWidth;
  const height = innerHeight;
  const density = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * density;
  canvas.height = height * density;
  context.scale(density, density);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const cx = width / 2;
  const cy = height / 2;
  let particles = capture(main);
  let hiddenMain = main;
  main.classList.add('vortex-hidden');
  main.setAttribute('aria-busy', 'true');
  document.body.append(canvas);

  function draw(progress, incoming = false) {
    context.clearRect(0, 0, width, height);
    const t = Math.max(0, Math.min(1, progress));
    const travel = incoming ? 1 - (1 - t) ** 2 : t ** 1.7;
    for (const particle of particles) {
      const dx = particle.x - cx;
      const dy = particle.y - cy;
      const sourceRadius = Math.hypot(dx, dy);
      const shrink = (incoming ? travel : 1 - travel) ** (1 + particle.seed * .35);
      const radius = sourceRadius * shrink;
      const sourceAngle = Math.atan2(dy, dx);
      // Two curved arms pull each letter independently into a flat whirlpool.
      // The warp vanishes at both ends, restoring the exact text baselines.
      const warp = Math.sin(Math.PI * travel) * .9;
      const armAngle = Math.log1p(sourceRadius / 35) * 2.2 + (particle.seed > .5 ? Math.PI : 0);
      const armDifference = Math.atan2(Math.sin(armAngle - sourceAngle), Math.cos(armAngle - sourceAngle));
      const angle = sourceAngle + armDifference * warp + (incoming ? -TURN * (1 - travel) : TURN * travel);
      const scale = .08 + .92 * shrink;
      context.save();
      context.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      context.rotate(incoming ? -TURN * .35 * (1 - travel) : TURN * .35 * travel);
      context.scale(scale, scale);
      context.globalAlpha = .25 + .75 * shrink;
      if (particle.image) {
        context.drawImage(particle.image, particle.sx, particle.sy, particle.sw, particle.sh, -particle.width / 2, -particle.height / 2, particle.width, particle.height);
      } else {
        context.font = particle.font;
        context.fillStyle = particle.color;
        context.fillText(particle.text, 0, 0);
      }
      context.restore();
    }
  }
  return {
    draw,
    reassemble(nextMain) {
      hiddenMain.classList.remove('vortex-hidden');
      hiddenMain.removeAttribute('aria-busy');
      hiddenMain = nextMain;
      particles = capture(nextMain);
      nextMain.classList.add('vortex-hidden');
      nextMain.setAttribute('aria-busy', 'true');
    },
    finish() {
      hiddenMain.classList.remove('vortex-hidden');
      hiddenMain.removeAttribute('aria-busy');
      canvas.remove();
    },
  };
}

export function setupNavigation({ renderPage, updateNavigation }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
    // Preserve skip links and same-page anchors; only the two homepage tabs spiral.
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
    cancelAnimationFrame(pending.frame);
    clearTimeout(pending.watchdog);
    pending.vortex?.finish();
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
    let failed = false;
    if (differentPage) load(url).then((page) => { parsed = page; ready = true; }, () => { failed = true; });
    const animate = !historyNavigation && !reducedMotion.matches && !forcedColors.matches && !document.hidden;
    const vortex = animate ? makeVortex(document.querySelector('main')) : null;
    const start = performance.now();
    let swapped = false;
    pending = { frame: 0, vortex, watchdog: 0 };

    function fallback() {
      stop();
      if (historyNavigation) location.reload();
      else location.assign(url.href);
    }

    function finish() {
      vortex?.finish();
      clearTimeout(pending.watchdog);
      pending = null;
      if (keyboard) {
        const target = document.querySelector(url.hash === '#research' ? '#research' : 'main');
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }

    function settle() {
      if (!ready || failed) { fallback(); return; }
      if (!swapped) swap(url, parsed, historyNavigation);
      finish();
      generation++;
    }
    pending.settle = settle;

    function frame(now) {
      if (token !== generation) return;
      const elapsed = now - start;
      if (failed || (!ready && elapsed >= (vortex ? MIDPOINT : 250))) { fallback(); return; }
      if (!swapped && ready && (!vortex || elapsed >= MIDPOINT)) {
        swap(url, parsed, historyNavigation);
        swapped = true;
        if (!vortex) { finish(); return; }
        vortex.reassemble(document.querySelector('main'));
      }
      if (vortex) {
        if (swapped) vortex.draw((elapsed - MIDPOINT) / (DURATION - MIDPOINT), true);
        else vortex.draw(elapsed / MIDPOINT);
        if (swapped && elapsed >= DURATION) { finish(); return; }
      }
      pending.frame = requestAnimationFrame(frame);
    }
    pending.frame = requestAnimationFrame(frame);
    // A backgrounded tab or interrupted frame must never leave content invisible.
    pending.watchdog = setTimeout(() => {
      if (token !== generation) return;
      if (!swapped) fallback();
      else finish();
    }, 700);
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
    cancelAnimationFrame(pending.frame);
    pending.settle();
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches || !pending) return;
    cancelAnimationFrame(pending.frame);
    pending.settle();
  });
}
