/** A crisp DOM page turns right-to-left over the already-rendered destination. */
export const TURN_DURATION = 820;

export function makePageTurn() {
  const layer = document.createElement('div');
  layer.className = 'book-turn';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  layer.style.setProperty('--book-perspective', `${Math.max(innerWidth * 2.5, 1400)}px`);
  const shadow = document.createElement('div');
  shadow.className = 'book-shadow';
  const sheet = document.createElement('div');
  sheet.className = 'book-sheet';
  const front = document.createElement('div');
  front.className = 'book-front';
  const back = document.createElement('div');
  back.className = 'book-back';
  const shade = document.createElement('div');
  shade.className = 'book-shade';
  const root = front.attachShadow({ mode: 'open' });
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('../css/style.css', import.meta.url).href;
  const copy = document.body.cloneNode(true);
  copy.removeAttribute('aria-busy');
  copy.querySelectorAll('script, dialog, .skip-link, .book-turn').forEach((node) => node.remove());
  copy.style.width = `${document.documentElement.clientWidth}px`;
  copy.style.margin = '0';
  copy.style.transform = `translateY(${-scrollY}px)`;
  // Retain the old tab's appearance without exposing duplicate navigation controls.
  copy.querySelectorAll('[data-nav]').forEach((node) => node.removeAttribute('data-nav'));
  copy.querySelectorAll('[aria-current="page"]').forEach((node) => {
    node.classList.add('book-current');
    node.removeAttribute('aria-current');
  });
  const originals = [...document.querySelectorAll('.site-header, .cv-outline, .ambient-field')];
  const frozen = [...copy.querySelectorAll('.site-header, .cv-outline, .ambient-field')];
  const positions = originals.map((node) => node.getBoundingClientRect());
  const images = [...document.images];
  copy.querySelectorAll('img').forEach((image, index) => {
    const rect = images[index]?.getBoundingClientRect();
    if (rect && rect.bottom > 0 && rect.top < innerHeight) image.loading = 'eager';
  });
  let ended = false;
  let active = false;
  let timer;
  let resolveReady;
  const animations = [];
  const originalBusy = document.body.getAttribute('aria-busy');
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
    const complete = (loaded) => {
      clearTimeout(timer);
      if (ended || !loaded) { resolve(false); return; }
      // Freeze sticky/fixed elements at their exact on-screen positions, even mid-scroll.
      frozen.forEach((node, index) => {
        const before = positions[index];
        const after = node.getBoundingClientRect();
        node.style.translate = `${before.left - after.left}px ${before.top - after.top}px`;
      });
      resolve(true);
    };
    stylesheet.addEventListener('load', () => complete(true), { once: true });
    stylesheet.addEventListener('error', () => complete(false), { once: true });
    timer = setTimeout(() => complete(false), 240);
  });
  root.append(stylesheet, copy);
  // The shade lives outside the shadow tree so its compositor animation stays simple.
  sheet.append(front, back, shade);
  layer.append(shadow, sheet);
  document.body.append(layer);

  return {
    ready,
    show() {
      if (ended) return;
      active = true;
      layer.dataset.state = 'turning';
      document.body.setAttribute('aria-busy', 'true');
    },
    play(done) {
      if (ended) return;
      const options = { duration: TURN_DURATION, easing: 'cubic-bezier(.35, 0, .35, 1)', fill: 'forwards' };
      const turn = sheet.animate([
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(-108deg)' },
      ], options);
      animations.push(turn,
        shade.animate([{ opacity: 0 }, { opacity: .24 }], options),
        shadow.animate([
          { opacity: 0, transform: 'scaleX(1)' },
          { opacity: .8, transform: 'scaleX(.65)', offset: .45 },
          { opacity: 0, transform: 'scaleX(0)' },
        ], options),
      );
      turn.finished.then(done, () => {});
    },
    finish() {
      if (ended) return;
      ended = true;
      resolveReady(false);
      clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
      layer.remove();
      if (active) {
        if (originalBusy === null) document.body.removeAttribute('aria-busy');
        else document.body.setAttribute('aria-busy', originalBusy);
      }
    },
  };
}
