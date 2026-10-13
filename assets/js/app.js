import { site } from './content.js';
import { setupNavigation } from './transition.js';
import { renderCV } from './cv.js';

/** Small DOM helpers keep all editable content as text, never executable HTML. */
function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function link({ label, url, download = false }) {
  const anchor = element('a', '', label);
  anchor.href = url;
  if (download) anchor.download = '';
  else if (/^https?:\/\//i.test(url) || /\.pdf(?:[?#]|$)/i.test(url)) {
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
  list.replaceChildren(...site.research.map((project) => {
    const row = element('article', 'research-row');
    if (project.id) row.id = project.id;
    if (project.image) {
      const image = element('img', 'research-thumbnail');
      image.src = project.image;
      image.alt = project.imageAlt || '';
      image.width = 380;
      image.height = 238;
      image.loading = 'lazy';
      image.decoding = 'async';
      row.append(image);
    }
    const copy = element('div', 'research-copy');
    copy.append(element('h3', '', project.title), element('p', 'research-summary', project.summary));
    if (project.organization) {
      const context = [project.organization, project.location, project.role, project.dates].filter(Boolean).join(' · ');
      copy.insertBefore(element('p', 'research-context', context), copy.querySelector('.research-summary'));
    }
    if (project.details?.length || project.highlights?.length) {
      const details = element('details', 'research-details');
      details.append(element('summary', '', 'Details'));
      project.details?.forEach((paragraph) => details.append(element('p', '', paragraph)));
      if (project.highlights?.length) {
        const list = element('ul');
        project.highlights.forEach((text) => list.append(element('li', '', text)));
        details.append(list);
      }
      copy.append(details);
    }
    const meta = element('div', 'research-meta');
    if (project.year) meta.append(element('p', '', project.year));
    if (project.links?.length) meta.append(links(project.links, 'research-links'));
    row.append(copy, meta);
    return row;
  }));
}

function courseRow(course, full = false) {
  const row = element('article', full ? 'teaching-row' : 'teaching-card');
  if (course.id) row.id = full ? course.id : `${course.id}-preview`;
  if (!full && course.photo) {
    const anchor = element('a', 'teaching-photo');
    anchor.href = `./teaching.html${course.id ? `#${course.id}` : ''}`;
    anchor.setAttribute('aria-label', `View ${course.code || course.title} teaching details`);
    const image = element('img');
    const { src, alt, width, height, position } = course.photo;
    Object.assign(image, { src, alt, width, height, loading: 'lazy', decoding: 'async' });
    if (position) image.style.objectPosition = position;
    anchor.append(image);
    row.append(anchor);
  }
  const title = element('div');
  if (course.code) title.append(element('span', 'teaching-code', course.code));
  title.append(element(full ? 'h2' : 'h3', '', course.title));
  if (full && course.links?.length) title.append(links(course.links));
  const role = element('div', 'teaching-role', course.role || 'Teaching Assistant');
  row.append(title, role);
  if (course.term) row.append(element('p', 'teaching-term', course.term));
  if (full && course.description) row.append(element('p', 'teaching-description lecture-description', course.description));
  if (full && course.materials?.length) {
    const materials = element('div', 'lecture-materials');
    const list = element('ol');
    course.materials.forEach((resource) => {
      const item = element('li');
      item.append(link({ label: `${resource.title} (.ipynb)`, url: resource.url, download: true }));
      list.append(item);
    });
    materials.append(list);
    row.append(materials);
  }
  if (full && course.photo) {
    const image = element('img', 'lecture-photo');
    const { src, alt, width, height } = course.photo;
    Object.assign(image, { src, alt, width, height, loading: 'lazy', decoding: 'async' });
    row.append(image);
  }
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
  const cat = document.querySelector('main').dataset.cat === 'blake' ? site.blake : site.cat;
  document.querySelector('#cat-title').replaceChildren(`Meet ${cat.name}`, element('span', 'soft-period', '.'));
  document.querySelector('#cat-bio').textContent = cat.bio;
  document.querySelector('#cat-description').textContent = cat.description;
  const loves = document.querySelector('#cat-loves');
  loves.setAttribute('aria-label', `Things ${cat.name} loves`);
  loves.hidden = !cat.loves.length;
  document.querySelector('#cat-description').hidden = !cat.description;
  loves.replaceChildren(...cat.loves.map((item) => element('li', '', item)));
  const hero = document.querySelector('.cat-hero-photo img');
  hero.src = cat.hero;
  hero.alt = cat.heroAlt;

  const dialog = document.querySelector('#photo-dialog');
  const image = document.querySelector('#lightbox-image');
  const title = document.querySelector('#lightbox-title');
  const count = document.querySelector('#lightbox-count');
  const close = document.querySelector('#lightbox-close');
  const previous = document.querySelector('#lightbox-prev');
  const next = document.querySelector('#lightbox-next');
  const status = document.querySelector('#lightbox-status');
  const galleryStatus = document.querySelector('#gallery-status');
  let selected = cat.photos;
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
    selected = category === 'All photos' ? cat.photos : cat.photos.filter((photo) => photo.category === category);
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

  const categories = ['All photos', ...new Set(cat.photos.map((photo) => photo.category))];
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
