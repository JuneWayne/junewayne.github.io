const base = document.querySelector('#slide-viewer').dataset.slidesBase;
const stage = document.querySelector('#slide-stage');
const select = document.querySelector('#slide-select');
const previous = document.querySelector('#slide-previous');
const next = document.querySelector('#slide-next');
const counter = document.querySelector('#slide-counter');
const transcript = document.querySelector('#slide-transcript');
const fullscreen = document.querySelector('#slide-fullscreen');
const viewer = document.querySelector('#slide-viewer');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let slides = [];
let current = 0;

function show(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  const slide = slides[current];
  select.value = String(current);
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  counter.textContent = `${current + 1} / ${slides.length}`;
  stage.setAttribute('aria-label', `Slide ${current + 1}: ${slide.title}`);
  document.querySelector('#slide-title').textContent = slide.title;
  transcript.replaceChildren(...slide.text.split('\n\n').map(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
  const background = document.createElement('img');
  background.className = 'slide-background';
  background.src = base + slide.background;
  background.alt = `${slide.title}. Full slide text is available below.`;
  background.width = 1920;
  background.height = 1080;
  background.addEventListener('error', () => {
    if (stage.contains(background)) counter.textContent = 'Slide could not load. Try reloading or download the PowerPoint.';
  });
  const layers = [background];
  const overlays = [...slide.animations, ...(slide.foregrounds || [])];
  if (!motion.matches) for (const [index, animation] of overlays.entries()) {
    const frame = document.createElement('div');
    const animated = index < slide.animations.length;
    frame.className = animated ? 'slide-animation' : 'slide-foreground';
    Object.assign(frame.style, {
      left: `${animation.x}%`, top: `${animation.y}%`,
      width: `${animation.width}%`, height: `${animation.height}%`,
      transform: `rotate(${animation.rotation}deg)`,
    });
    const image = document.createElement('img');
    image.src = base + animation.src;
    image.alt = animated ? `${slide.title}: animated simulation ${index + 1}` : '';
    const [left, top, right, bottom] = animation.crop;
    const width = 1 - left - right;
    const height = 1 - top - bottom;
    Object.assign(image.style, { width: `${100 / width}%`, height: `${100 / height}%`, left: `${-100 * left / width}%`, top: `${-100 * top / height}%` });
    image.addEventListener('error', () => frame.remove()); // The rendered first frame remains underneath.
    frame.append(image);
    layers.push(frame);
  }
  stage.replaceChildren(...layers);
}

function hashIndex() {
  const match = /^#slide-(\d+)$/.exec(location.hash);
  return match ? Number(match[1]) - 1 : 0;
}
function navigate(index) {
  const bounded = Math.max(0, Math.min(slides.length - 1, index));
  if (bounded === current) return;
  location.hash = `slide-${bounded + 1}`;
}
previous.addEventListener('click', () => navigate(current - 1));
next.addEventListener('click', () => navigate(current + 1));
select.addEventListener('change', () => navigate(Number(select.value)));
addEventListener('hashchange', () => { if (slides.length) show(hashIndex()); });
motion.addEventListener('change', () => { if (slides.length) show(current); });
addEventListener('keydown', event => {
  if (!slides.length || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, select, textarea, button, a, summary')) return;
  const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
  if (event.key in destinations) {
    event.preventDefault();
    navigate(destinations[event.key]);
  }
});
if (document.fullscreenEnabled) {
  fullscreen.hidden = false;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewer.requestFullscreen();
    } catch { fullscreen.hidden = true; }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  });
}
try {
  const response = await fetch(base + 'slides.json');
  if (!response.ok) throw new Error('Slide manifest unavailable');
  const deck = await response.json();
  slides = deck.slides;
  stage.style.aspectRatio = deck.aspectRatio;
  select.replaceChildren(...slides.map((slide, index) => new Option(`${index + 1}. ${slide.title}`, index)));
  select.disabled = false;
  show(hashIndex());
} catch {
  counter.textContent = 'The slides could not load. Reload this page or download the PowerPoint below.';
}
