/** A rolling paper fold travels over live HTML, with a hand following its free edge. */
export const TURN_DURATION = 1300;

export const HAND_SPRITE_URL = new URL('../images/motion/page-turn-left-hand-10.png', import.meta.url).href;
export const HAND_FRAME_COUNT = 10;

export function makePageTurn() {
  const layer = document.createElement('div');
  layer.className = 'book-turn';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  const width = document.documentElement.clientWidth;
  const height = innerHeight;
  const sheet = document.createElement('div');
  sheet.className = 'book-sheet';
  const front = document.createElement('div');
  front.className = 'book-front';
  const svgNS = 'http://www.w3.org/2000/svg';
  const curl = document.createElementNS(svgNS, 'svg');
  curl.classList.add('book-curl');
  curl.setAttribute('viewBox', `0 0 ${width} ${height}`);
  // The noise is confined to the paper back; the actual page text stays crisp.
  curl.innerHTML = `<defs>
    <linearGradient id="paper-light" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#eeede7"/><stop offset=".2" stop-color="#fffef9"/>
      <stop offset=".66" stop-color="#faf9f4"/><stop offset=".9" stop-color="#e5e3db"/>
      <stop offset="1" stop-color="#c6c4bb"/>
    </linearGradient>
    <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed="7" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope=".065"/></feComponentTransfer>
      <feComposite in2="SourceGraphic" operator="in"/>
      <feBlend in2="SourceGraphic" mode="multiply"/>
    </filter>
    <filter id="fold-shadow" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  <path class="book-cast-shadow" fill="#292720" opacity=".16" filter="url(#fold-shadow)"/>
  <path class="book-paper" fill="url(#paper-light)" filter="url(#paper-grain)"/>
  <path class="book-edge" fill="none" stroke="#fffef9" stroke-width="1.2"/>`;
  const paper = curl.querySelector('.book-paper');
  const shadow = curl.querySelector('.book-cast-shadow');
  const edge = curl.querySelector('.book-edge');
  const light = curl.querySelector('#paper-light');
  const hand = document.createElement('div');
  hand.className = 'book-hand';
  hand.dataset.frameCount = HAND_FRAME_COUNT;
  const atlas = document.createElement('img');
  atlas.className = 'book-hand-atlas';
  atlas.hidden = true;
  atlas.alt = '';
  atlas.src = HAND_SPRITE_URL;
  atlas.decoding = 'async';
  const overlay = document.createElement('div');
  overlay.className = 'book-hand-top';
  const makePoses = (className = '') => [0, 1].map(() => {
    const pose = document.createElement('div');
    pose.className = `book-hand-frame ${className}`.trim();
    pose.style.backgroundImage = `url("${HAND_SPRITE_URL}")`;
    return pose;
  });
  const poses = makePoses();
  const thumbs = makePoses('book-thumb');
  const released = makePoses('book-released-hand');
  hand.append(atlas, ...poses);
  overlay.append(...thumbs, ...released);
  const handSize = Math.min(400, Math.max(285, width * .30));
  for (const part of [hand, overlay]) part.style.width = part.style.height = `${handSize}px`;
  // Each mask follows only the thumb in that sprite cell. The rest of the hand
  // is drawn behind the paper, so the sheet genuinely occludes the supporting fingers.
  const thumbContours = [
    [[84,22],[93,21],[98,27],[92,39],[82,53],[68,61],[58,52],[73,40]],
    [[85,22],[94,23],[98,30],[92,40],[81,53],[67,60],[58,51],[74,39]],
    [[78,11],[85,12],[88,19],[84,28],[78,40],[67,53],[57,51],[69,34],[75,21]],
    [[77,11],[84,12],[87,19],[83,28],[77,40],[66,53],[56,51],[68,34],[74,21]],
    [[77,11],[85,12],[88,19],[84,28],[78,40],[67,53],[57,51],[69,34],[75,21]],
    [[73,7],[81,8],[85,16],[80,29],[75,40],[65,54],[55,51],[65,34],[71,20]],
    [[74,12],[82,12],[86,20],[82,30],[76,42],[66,54],[56,52],[66,36],[72,23]],
    [[78,12],[86,13],[90,20],[85,31],[78,44],[66,56],[56,53],[69,36],[75,24]],
    [[85,23],[93,23],[97,31],[91,43],[81,55],[67,62],[58,54],[74,41]],
    [[87,27],[95,27],[99,34],[93,46],[82,59],[68,65],[59,56],[75,44]],
  ];
  const poseTimes = [0, .09, .18, .25, .33, .43, .55, .68, .83, 1];
  const smooth = (t) => t * t * (3 - 2 * t);
  function showPose(raw) {
    let current = 0;
    while (current < HAND_FRAME_COUNT - 2 && raw >= poseTimes[current + 1]) current++;
    const blend = smooth(Math.max(0, Math.min(1, (raw - poseTimes[current]) / (poseTimes[current + 1] - poseTimes[current]))));
    // Lift the entire hand back above the paper only as the grip opens to release.
    const open = smooth(Math.max(0, Math.min(1, (raw - .60) / .15)));
    poses.forEach((pose, offset) => {
      const index = current + offset;
      const position = `${(index % 5) * 25}% ${Math.floor(index / 5) * 100}%`;
      const weight = offset ? blend : 1 - blend;
      for (const part of [pose, thumbs[offset], released[offset]]) part.style.backgroundPosition = position;
      pose.style.opacity = String(weight);
      thumbs[offset].style.clipPath = `polygon(${thumbContours[index].map(([x,y]) => `${x}% ${y}%`).join(',')})`;
      thumbs[offset].style.opacity = String(weight * (1 - open));
      released[offset].style.opacity = String(weight * open);
    });
    hand.dataset.frame = String(current + (blend >= .5 ? 2 : 1));
    hand.dataset.phase = raw < .22 ? 'approach' : raw < .34 ? 'grip' : raw < .58 ? 'turn' : raw < .84 ? 'release' : 'withdraw';
  }
  let frame = 0;
  let clock;

  function paint(raw) {
    // Minimum-jerk timing: still at contact/release, gently accelerating in between.
    const t = Math.max(0, Math.min(1, (raw - .22) / .73));
    const p = t * t * t * (10 + t * (-15 + 6 * t));
    const lift = Math.sin(Math.PI * p);
    const fold = width * (1 - p);
    const bend = Math.min(100, width * .09) * lift;
    const radius = Math.min(85, width * .08) * lift;
    const free = width * (1 - 2 * p);
    const top = fold + bend * .55;
    const bottom = fold - bend * .65;
    const freeTop = free + bend * .9;
    const freeBottom = free - bend * .9;
    const inset = Math.min(32, height * .04) * lift;
    const crease = `M ${top} 0 C ${top + radius} ${height * .28}, ${bottom + radius} ${height * .7}, ${bottom} ${height}`;
    const shape = `${crease} Q ${(bottom + freeBottom) / 2} ${height - inset * 2}, ${freeBottom} ${height - inset}
      C ${freeBottom - radius * .22} ${height * .7}, ${freeTop - radius * .22} ${height * .25}, ${freeTop} ${inset}
      Q ${(top + freeTop) / 2} ${inset * 2}, ${top} 0 Z`;
    front.style.clipPath = `path('M 0 0 L ${top} 0 C ${top + radius} ${height * .28}, ${bottom + radius} ${height * .7}, ${bottom} ${height} L 0 ${height} Z')`;
    paper.setAttribute('d', shape);
    shadow.setAttribute('d', shape);
    shadow.setAttribute('transform', `translate(${10 * lift} ${7 * lift})`);
    shadow.setAttribute('opacity', String(.19 * lift));
    edge.setAttribute('d', `${crease} M ${freeBottom} ${height - inset} C ${freeBottom - radius * .22} ${height * .7}, ${freeTop - radius * .22} ${height * .25}, ${freeTop} ${inset}`);
    light.setAttribute('x1', free);
    light.setAttribute('x2', Math.max(free + 1, fold + radius * .6));
    light.setAttribute('y1', height * .5);
    light.setAttribute('y2', height * .5);
    // Keep contact while holding; release near the left edge and let the paper settle.
    const gripY = height * .84 - Math.min(35, height * .03) * lift;
    const u = gripY / height;
    const edgeX = (1-u)**3 * freeTop + 3*(1-u)**2*u*(freeTop-radius*.22)
      + 3*(1-u)*u*u*(freeBottom-radius*.22) + u**3*freeBottom;
    const approach = 1 - smooth(Math.min(1, raw / .22));
    const release = smooth(Math.max(0, Math.min(1, (raw - .58) / .42)));
    const gripX = Math.max(width * .08, edgeX) - handSize * .3 * release;
    const angle = 5 - 17 * lift + 12 * release;
    hand.style.transform = `translate3d(${gripX - handSize * .78 + approach * handSize * .35}px, ${gripY - handSize * .30 + approach * handSize * .16 + release * height * .38}px, 0) rotate(${-angle}deg) scale(${1 + lift * .025})`;
    hand.style.opacity = String(Math.min(1, raw / .07, (1 - raw) / .08));
    overlay.style.transform = hand.style.transform;
    overlay.style.opacity = hand.style.opacity;
    showPose(raw);
    layer.dataset.progress = p.toFixed(3);
  }
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
  const freezeStyles = document.createElement('style');
  freezeStyles.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
  root.append(stylesheet, freezeStyles, copy);
  // Decorative paper and hand stay outside the cloned, inert document.
  sheet.append(front);
  layer.append(sheet, hand, curl, overlay);
  paint(0);
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
      // A native animation supplies a pauseable clock; only the fold paths and hand move.
      clock = sheet.animate([{ opacity: 1 }, { opacity: 1 }], { duration: TURN_DURATION, fill: 'forwards' });
      animations.push(clock);
      const tick = () => {
        if (ended) return;
        paint(Math.min(1, (clock.currentTime || 0) / TURN_DURATION));
        frame = requestAnimationFrame(tick);
      };
      tick();
      clock.finished.then(done, () => {});
    },
    finish() {
      if (ended) return;
      ended = true;
      resolveReady(false);
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      layer.remove();
      if (active) {
        if (originalBusy === null) document.body.removeAttribute('aria-busy');
        else document.body.setAttribute('aria-busy', originalBusy);
      }
    },
  };
}
