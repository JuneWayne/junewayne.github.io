import { site } from './content.js';
import { setupNavigation } from './transition.js';

/** Small DOM helpers keep all editable content as text, never executable HTML. */
function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function link({ label, url }) {
  const anchor = element('a', '', label);
  anchor.href = url;
  if (/^https?:\/\//i.test(url)) {
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  }
  const arrow = element('span', '', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  anchor.append(' ', arrow);
  return anchor;
}

function links(items, extraClass = '') {
  const group = element('div', `text-links ${extraClass}`.trim());
  items.forEach((item) => group.append(link(item)));
  return group;
}

function renderProfile() {
  document.querySelectorAll('[data-name]').forEach((node) => { node.textContent = site.name; });
  if (!document.querySelector('#profile-bio')) return;
  document.querySelector('#profile-bio').replaceChildren(...site.bio.map((text) => element('p', '', text)));
  document.querySelector('#profile-links').replaceChildren(...site.links.map(link));
  const portrait = document.querySelector('#profile-portrait');
  if (site.portrait) {
    const image = element('img', 'profile-portrait');
    image.src = site.portrait;
    image.alt = site.portraitAlt;
    image.id = "profile-portrait";
    image.width = site.portraitWidth;
    image.height = site.portraitHeight;
    image.fetchPriority = 'high';
    portrait.replaceWith(image);
  } else {
    portrait.setAttribute('aria-label', `Portrait placeholder for ${site.name}`);
  }
}

function renderResearch() {
  const list = document.querySelector('#research-list');
  if (!list || !site.research.length) return;
  list.replaceChildren(...site.research.map((project, index) => {
    const row = element('article', 'research-row');
    if (project.image) {
      const image = element('img', 'research-thumbnail');
      image.src = project.image;
      image.alt = project.imageAlt || '';
      image.width = 380;
      image.height = 238;
      image.loading = 'lazy';
      image.decoding = 'async';
      row.append(image);
    } else {
      const placeholder = element('div', 'research-thumbnail research-thumbnail-placeholder', String(index + 1).padStart(2, '0'));
      placeholder.setAttribute('aria-hidden', 'true');
      row.append(placeholder);
    }
    const copy = element('div', 'research-copy');
    copy.append(element('h3', '', project.title), element('p', 'research-summary', project.summary));
    if (project.details?.length) {
      const details = element('details', 'research-details');
      details.append(element('summary', '', 'The story behind the work'));
      project.details.forEach((paragraph) => details.append(element('p', '', paragraph)));
      copy.append(details);
    }
    const meta = element('div', 'research-meta');
    const metadata = [project.year, project.kind].filter(Boolean).join(' · ');
    if (metadata) meta.append(element('p', '', metadata));
    if (project.links?.length) meta.append(links(project.links, 'research-links'));
    row.append(copy, meta);
    return row;
  }));
}

function courseRow(course, full = false) {
  const row = element('article', 'teaching-row');
  const title = element('div');
  if (course.code) title.append(element('span', 'teaching-code', course.code));
  title.append(element('h3', '', course.title));
  if (full && course.description) title.append(element('p', 'teaching-description', course.description));
  if (full && course.links?.length) title.append(links(course.links));
  const role = element('div', 'teaching-role', course.role || 'Teaching Assistant');
  if (course.institution) role.append(element('p', 'teaching-description', course.institution));
  row.append(title, role, element('p', 'teaching-term', course.term));
  return row;
}

function renderTeaching() {
  if (!site.teaching.length) return;
  document.querySelector('#teaching-preview')?.replaceChildren(...site.teaching.slice(0, 3).map((course) => courseRow(course)));
  const list = document.querySelector('#teaching-list');
  if (list) {
    list.classList.add('teaching-full');
    list.replaceChildren(...site.teaching.map((course) => courseRow(course, true)));
  }
}

function renderCV() {
  const content = document.querySelector('#cv-content');
  if (!content || !site.cv.url) return;
  const toolbar = element('div', 'cv-toolbar');
  if (site.cv.updated) toolbar.append(element('p', '', `Updated ${site.cv.updated}`));
  const download = link({ label: 'Open CV (PDF)', url: site.cv.url });
  download.className = 'cv-download';
  download.target = '_blank';
  download.rel = 'noopener noreferrer';
  toolbar.append(download);
  const frame = element('iframe', 'cv-frame');
  frame.title = `${site.name}’s curriculum vitae`;
  frame.src = site.cv.url;
  const fallback = element('p', 'cv-fallback', 'If the preview does not load, ');
  fallback.append(link({ label: 'open the PDF', url: site.cv.url }), '.');
  content.replaceChildren(toolbar, frame, fallback);
}

function renderAnimals() {
  const list = document.querySelector('#animals-list');
  if (!list) return;
  list.replaceChildren(...site.animals.map((animal) => {
    const figure = element('figure', 'animal-photo');
    const anchor = element('a');
    anchor.href = animal.url;
    const image = element('img');
    image.src = animal.src;
    image.alt = animal.alt;
    image.width = animal.width;
    image.height = animal.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    if (animal.position) image.style.objectPosition = animal.position;
    anchor.append(image, element('span', '', animal.title));
    figure.append(anchor);
    return figure;
  }));
}

function setupCatGallery() {
  const gallery = document.querySelector('#cat-gallery');
  if (!gallery) return;
  document.querySelector('#cat-title').replaceChildren(`Meet ${site.cat.name}`, element('span', 'soft-period', '.'));
  document.querySelector('#cat-bio').textContent = site.cat.bio;
  document.querySelector('#cat-description').textContent = site.cat.description;
  const loves = document.querySelector('#cat-loves');
  loves.setAttribute('aria-label', `Things ${site.cat.name} loves`);
  loves.replaceChildren(...site.cat.loves.map((item) => element('li', '', item)));
  const hero = document.querySelector('.cat-hero-photo img');
  hero.src = site.cat.hero;
  hero.alt = site.cat.heroAlt;

  const dialog = document.querySelector('#photo-dialog');
  const image = document.querySelector('#lightbox-image');
  const title = document.querySelector('#lightbox-title');
  const count = document.querySelector('#lightbox-count');
  const close = document.querySelector('#lightbox-close');
  const previous = document.querySelector('#lightbox-prev');
  const next = document.querySelector('#lightbox-next');
  const status = document.querySelector('#lightbox-status');
  const galleryStatus = document.querySelector('#gallery-status');
  let selected = site.cat.photos;
  let currentIndex = 0;
  let trigger = null;

  function showPhoto(index) {
    currentIndex = (index + selected.length) % selected.length;
    const photo = selected[currentIndex];
    image.src = photo.src;
    image.alt = photo.alt;
    image.width = photo.width;
    image.height = photo.height;
    title.textContent = photo.title;
    count.textContent = `${currentIndex + 1} / ${selected.length}`;
    status.textContent = `${photo.title}. Photo ${currentIndex + 1} of ${selected.length}.`;
    previous.disabled = next.disabled = selected.length < 2;
  }

  function openPhoto(index, button) {
    trigger = button;
    showPhoto(index);
    dialog.showModal();
    close.focus();
  }

  function render(category = 'All photos', announce = false) {
    selected = category === 'All photos' ? site.cat.photos : site.cat.photos.filter((photo) => photo.category === category);
    gallery.replaceChildren(...selected.map((photo, index) => {
      const figure = element('figure', photo.width > photo.height ? 'cat-photo is-landscape' : 'cat-photo');
      const button = element('button', 'photo-open');
      button.type = 'button';
      button.setAttribute('aria-label', `View photo: ${photo.title}`);
      const thumbnail = element('img');
      thumbnail.src = photo.src;
      thumbnail.alt = photo.alt;
      thumbnail.width = photo.width;
      thumbnail.height = photo.height;
      thumbnail.loading = 'lazy';
      thumbnail.decoding = 'async';
      if (photo.position) thumbnail.style.objectPosition = photo.position;
      const zoom = element('span', 'photo-zoom', '↗');
      zoom.setAttribute('aria-hidden', 'true');
      button.append(thumbnail, zoom);
      button.addEventListener('click', () => openPhoto(index, button));
      const caption = element('figcaption');
      caption.append(element('h3', '', photo.title));
      figure.append(button, caption);
      return figure;
    }));
    if (!selected.length) gallery.append(element('p', 'quiet-empty', 'More photos are on their way.'));
    if (announce) galleryStatus.textContent = `${selected.length} ${selected.length === 1 ? 'photo' : 'photos'} shown.`;
  }

  const categories = ['All photos', ...new Set(site.cat.photos.map((photo) => photo.category))];
  const filters = document.querySelector('#cat-filters');
  filters.hidden = categories.length < 3;
  filters.replaceChildren(...categories.map((category, index) => {
    const button = element('button', '', category);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      render(category, true);
    });
    return button;
  }));

  close.addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => showPhoto(currentIndex - 1));
  next.addEventListener('click', () => showPhoto(currentIndex + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href]')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    trigger?.focus();
  });
  render();
}

function updateNavigation() {
  const page = document.body.dataset.page;
  const active = page === 'profile' && location.hash === '#research' ? 'research' : page;
  document.querySelectorAll('[data-nav]').forEach((anchor) => {
    if (anchor.dataset.nav === active) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  });
}
function renderPage() {
  updateNavigation();
  renderProfile();
  renderResearch();
  renderTeaching();
  renderCV();
  setupCatGallery();
  renderAnimals();
}

renderPage();
window.addEventListener('hashchange', updateNavigation);
setupNavigation({ renderPage, updateNavigation });
