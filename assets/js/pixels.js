/** A short wave of actual page pixels. Only the visible content is sampled. */
let renderer;
const clamp = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => value * value * (3 - 2 * value);

async function snapshot(main) {
  renderer ||= import('./vendor/html2canvas.esm.js').then((module) => module.default);
  const render = await renderer;
  const rect = main.getBoundingClientRect();
  const top = Math.max(0, rect.top, document.querySelector('.site-header').getBoundingClientRect().bottom);
  const height = Math.min(innerHeight, rect.bottom) - top;
  if (height <= 0 || rect.width <= 0) return null;
  const bitmap = await render(main, {
    backgroundColor: null, scale: 1, logging: false, imageTimeout: 180,
    x: 0, y: top - rect.top, width: rect.width, height,
    scrollX, scrollY, removeContainer: true,
    ignoreElements: (node) => node.matches('.page-pixels, .page-vortex, .page-wave, iframe'),
    onclone: (clone) => {
      const copy = clone.querySelector('main');
      copy.classList.remove('vortex-hidden');
      copy.style.opacity = '1';
      copy.style.filter = 'none';
      copy.style.maskImage = 'none';
    },
  });
  const context = bitmap.getContext('2d', { willReadFrequently: true });
  const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
  // Adapt the tile size to keep large viewports within a fixed drawing budget.
  const size = Math.max(6, Math.ceil(Math.sqrt(bitmap.width * bitmap.height / 12000)));
  const tiles = [];
  for (let y = 0; y < bitmap.height; y += size) for (let x = 0; x < bitmap.width; x += size) {
    const w = Math.min(size, bitmap.width - x);
    const h = Math.min(size, bitmap.height - y);
    let visible = false;
    for (let py = y; py < y + h && !visible; py++) for (let px = x; px < x + w; px++) {
      const index = (py * bitmap.width + px) * 4;
      if (pixels[index + 3] > 8 && Math.min(pixels[index], pixels[index + 1], pixels[index + 2]) < 247) { visible = true; break; }
    }
    if (visible) tiles.push({ x, y, w, h, seed: ((x * 13 + y * 7) * .61803398875) % 1 });
  }
  return { bitmap, tiles, left: rect.left, top, width: rect.width };
}

export function makePixels(main) {
  const canvas = document.createElement('canvas');
  canvas.className = 'page-pixels';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d');
  if (!context) return null;
  const width = innerWidth;
  const height = innerHeight;
  const density = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * density;
  canvas.height = height * density;
  context.scale(density, density);
  context.imageSmoothingEnabled = false;
  let source = null;
  let current = main;
  let ended = false;
  let revision = 0;
  const originals = new Map();
  function remember(node) {
    originals.set(node, node.style.opacity);
    node.setAttribute('aria-busy', 'true');
  }
  function restore(node) {
    node.classList.remove('vortex-hidden');
    node.style.opacity = originals.get(node) || '';
    node.removeAttribute('aria-busy');
  }
  const ready = snapshot(main).then((result) => {
    if (ended) return false;
    source = result;
    return Boolean(source?.tiles.length);
  }).catch(() => false);

  return {
    ready,
    activate() {
      if (ended || !source) return;
      remember(current);
      current.classList.add('vortex-hidden');
      canvas.dataset.tiles = String(source.tiles.length);
      document.body.append(canvas);
    },
    draw(progress, incoming = false) {
      context.clearRect(0, 0, width, height);
      const t = clamp(progress);
      if (!source) {
        // If an incoming image is still loading, reveal the live page on schedule.
        current.style.opacity = String(ease(t));
        return;
      }
      for (const tile of source.tiles) {
        const local = clamp((t - .23 * tile.x / source.width) / .77);
        const opacity = incoming ? ease(local) : 1 - ease(local);
        if (opacity < .01) continue;
        const lift = Math.sin(Math.PI * local);
        const dx = Math.round(lift * (tile.seed - .5) * 18);
        const dy = Math.round(-lift * (18 + tile.seed * 14));
        context.globalAlpha = opacity;
        context.drawImage(source.bitmap, tile.x, tile.y, tile.w, tile.h,
          source.left + tile.x + dx, source.top + tile.y + dy, tile.w, tile.h);
      }
      context.globalAlpha = 1;
    },
    reassemble(nextMain) {
      restore(current);
      current = nextMain;
      remember(current);
      source = null;
      current.style.opacity = '0';
      const version = ++revision;
      snapshot(current).then((result) => {
        if (ended || version !== revision || !result?.tiles.length) return;
        source = result;
        current.classList.add('vortex-hidden');
        canvas.dataset.tiles = String(source.tiles.length);
      }).catch(() => { /* The live-page fade remains available if sampling fails. */ });
    },
    finish() {
      ended = true;
      revision++;
      if (originals.has(current)) restore(current);
      source = null;
      canvas.remove();
      canvas.width = canvas.height = 0;
    },
  };
}
