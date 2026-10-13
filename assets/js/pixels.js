/** A gentle, concentric ripple across a snapshot of the whole visible page. */
let renderer;
const clamp = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => value * value * (3 - 2 * value);

async function snapshot() {
  renderer ||= import('./vendor/html2canvas.esm.js').then((module) => module.default);
  const render = await renderer;
  const bitmap = await render(document.body, {
    backgroundColor: '#ffffff', scale: 1, logging: false, imageTimeout: 180,
    x: 0, y: scrollY, width: innerWidth, height: innerHeight,
    scrollX, scrollY, removeContainer: true,
    ignoreElements: (node) => node.matches('.page-pixels, .page-vortex, iframe, .skip-link'),
    onclone: (clone) => {
      clone.body.classList.remove('page-rippling');
      clone.body.style.removeProperty('--ripple-opacity');
      clone.querySelector('main').classList.remove('vortex-hidden');
    },
  });
  const context = bitmap.getContext('2d', { willReadFrequently: true });
  const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
  const size = Math.max(6, Math.ceil(Math.sqrt(bitmap.width * bitmap.height / 22000)));
  const tiles = [];
  const cx = bitmap.width / 2;
  const cy = bitmap.height / 2;
  for (let y = 0; y < bitmap.height; y += size) for (let x = 0; x < bitmap.width; x += size) {
    const w = Math.min(size, bitmap.width - x);
    const h = Math.min(size, bitmap.height - y);
    let visible = false;
    for (let py = y; py < y + h && !visible; py++) for (let px = x; px < x + w; px++) {
      const index = (py * bitmap.width + px) * 4;
      if (pixels[index + 3] > 8 && Math.min(pixels[index], pixels[index + 1], pixels[index + 2]) < 250) { visible = true; break; }
    }
    if (visible) {
      const dx = x + w / 2 - cx;
      const dy = y + h / 2 - cy;
      const radius = Math.hypot(dx, dy);
      tiles.push({ x, y, w, h, radius, ux: radius ? dx / radius : 0, uy: radius ? dy / radius : 0 });
    }
  }
  // A small mosaic blends in only at the ripple crest, keeping the rest sharp.
  const mosaic = document.createElement('canvas');
  mosaic.width = Math.ceil(bitmap.width / 3);
  mosaic.height = Math.ceil(bitmap.height / 3);
  mosaic.getContext('2d').drawImage(bitmap, 0, 0, mosaic.width, mosaic.height);
  return { bitmap, mosaic, tiles, maxRadius: Math.hypot(cx, cy) };
}

export function makePixels() {
  const canvas = document.createElement('canvas');
  canvas.className = 'page-pixels';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.pattern = 'radial';
  canvas.dataset.scope = 'viewport';
  const context = canvas.getContext('2d');
  if (!context) return null;
  const width = innerWidth;
  const height = innerHeight;
  const density = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * density;
  canvas.height = height * density;
  context.scale(density, density);
  const frame = document.createElement('canvas');
  frame.width = width;
  frame.height = height;
  const paint = frame.getContext('2d');
  let source = null;
  let ended = false;
  let active = false;
  let revision = 0;
  const body = document.body;
  const originalOpacity = body.style.getPropertyValue('--ripple-opacity');
  const originalBusy = body.getAttribute('aria-busy');
  const ready = snapshot().then((result) => {
    if (ended) return false;
    source = result;
    return Boolean(source?.tiles.length);
  }).catch(() => false);

  return {
    ready,
    activate() {
      if (ended || !source) return;
      active = true;
      body.classList.add('page-rippling');
      body.style.setProperty('--ripple-opacity', '0');
      body.setAttribute('aria-busy', 'true');
      canvas.dataset.tiles = String(source.tiles.length);
      document.body.append(canvas);
    },
    draw(progress, incoming = false) {
      context.clearRect(0, 0, width, height);
      const t = clamp(progress);
      const opacity = incoming ? ease(t) : 1 - ease(t);
      if (!source) {
        // Image loading never extends the transition: the whole live page fades in.
        body.style.setProperty('--ripple-opacity', String(opacity));
        return;
      }
      const front = (t * 1.35 - .15) * source.maxRadius;
      const band = Math.max(70, Math.min(width, height) * .12);
      const envelope = Math.sin(Math.PI * t);
      paint.globalAlpha = 1;
      paint.fillStyle = '#ffffff';
      paint.fillRect(0, 0, width, height);
      for (const tile of source.tiles) {
        const distance = tile.radius - front;
        const crest = Math.exp(-((distance / band) ** 2)) * envelope;
        const displacement = Math.sin(distance / 27) * crest * 4;
        const x = tile.x + tile.ux * displacement;
        const y = tile.y + tile.uy * displacement;
        // Neighboring tiles follow the same smooth radial field, without scattering.
        paint.globalAlpha = 1;
        paint.imageSmoothingEnabled = true;
        paint.drawImage(source.bitmap, tile.x, tile.y, tile.w, tile.h,
          x, y, tile.w + .25, tile.h + .25);
        if (crest > .01) {
          paint.globalAlpha = crest * .3;
          paint.imageSmoothingEnabled = false;
          const sx = tile.x * source.mosaic.width / width;
          const sy = tile.y * source.mosaic.height / height;
          paint.drawImage(source.mosaic, sx, sy, tile.w * source.mosaic.width / width, tile.h * source.mosaic.height / height,
            x, y, tile.w + .25, tile.h + .25);
        }
      }
      // Fade the assembled frame once, avoiding dark seams between small tiles.
      context.globalAlpha = opacity;
      context.drawImage(frame, 0, 0);
      context.globalAlpha = 1;
    },
    reassemble() {
      source = null;
      body.style.setProperty('--ripple-opacity', '0');
      const version = ++revision;
      snapshot().then((result) => {
        if (ended || version !== revision || !result?.tiles.length) return;
        source = result;
        body.style.setProperty('--ripple-opacity', '0');
        canvas.dataset.tiles = String(source.tiles.length);
      }).catch(() => { /* Keep the live-page fade when a snapshot is unavailable. */ });
    },
    finish() {
      ended = true;
      revision++;
      if (active) {
        body.classList.remove('page-rippling');
        if (originalOpacity) body.style.setProperty('--ripple-opacity', originalOpacity);
        else body.style.removeProperty('--ripple-opacity');
        if (originalBusy !== null) body.setAttribute('aria-busy', originalBusy);
        else body.removeAttribute('aria-busy');
      }
      source = null;
      canvas.remove();
      canvas.width = canvas.height = 0;
      frame.width = frame.height = 0;
    },
  };
}
