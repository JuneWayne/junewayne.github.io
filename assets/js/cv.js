import { site } from './content.js?v=20261021-research-title';

function node(tag, className = '', text = '') {
  const result = document.createElement(tag);
  result.className = className;
  result.textContent = text;
  return result;
}

function resource({ label, url, download = false }) {
  const anchor = node('a', '', label);
  anchor.href = url;
  if (download) anchor.download = '';
  else if (/^https?:|\.pdf(?:[?#]|$)/i.test(url)) {
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  }
  return anchor;
}

function experienceCard(experience, headingTag = 'h3') {
  const item = node('li', 'experience-item');
  item.dataset.category = experience.category;
  const card = node('article', 'experience-card');
  card.id = experience.id;
  card.setAttribute('aria-labelledby', `${experience.id}-title`);
  const copy = node('div', 'experience-copy');
  const meta = node('div', 'experience-meta');
  if (experience.dates) meta.append(node('p', 'experience-dates', experience.dates));
  const heading = node(headingTag, '', experience.organization);
  heading.id = `${experience.id}-title`;
  const destination = experience.links?.find(link => !link.download);
  if (destination) {
    const anchor = resource({ ...destination, label: experience.organization });
    anchor.className = 'experience-title-link card-title-link';
    heading.replaceChildren(anchor);
    card.classList.add('clickable-card');
  }
  let title = heading;
  if (experience.logo) {
    title = node('div', 'experience-company');
    const logo = node('img', 'experience-logo');
    Object.assign(logo, { src: experience.logo, alt: '', width: 72, height: 44, decoding: 'async' });
    title.append(logo, heading);
  }
  copy.append(meta, title, node('p', 'experience-role', experience.role));
  if (experience.summary) copy.append(node('p', 'experience-summary', experience.summary));
  if (experience.highlights?.length) {
    const details = node('details', 'experience-details');
    details.append(node('summary', '', 'Contributions'));
    const list = node('ul');
    experience.highlights.forEach((text) => list.append(node('li', '', text)));
    details.append(list);
    copy.append(details);
    if (!destination) {
      const toggle = node('button', 'card-title-button', experience.organization);
      toggle.type = 'button';
      details.id = `${experience.id}-contributions`;
      toggle.setAttribute('aria-controls', details.id);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', () => { details.open = !details.open; });
      details.addEventListener('toggle', () => toggle.setAttribute('aria-expanded', String(details.open)));
      heading.replaceChildren(toggle);
      card.classList.add('clickable-card');
    }
  }
  const extraLinks = experience.links?.filter(link => link !== destination);
  if (extraLinks?.length) {
    const links = node('div', 'experience-links');
    extraLinks.forEach((link) => links.append(resource(link)));
    copy.append(links);
  }
  card.append(copy);
  if (experience.photo) {
    const figure = node('figure', experience.photo.wide ? 'experience-photo experience-photo-wide' : 'experience-photo');
    const anchor = resource({ label: '', url: experience.photo.src });
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', `Open ${experience.organization} photo`);
    const image = node('img');
    const { src, alt, width, height } = experience.photo;
    Object.assign(image, { src, alt, width, height, loading: 'lazy', decoding: 'async' });
    anchor.append(image);
    figure.append(anchor);
    card.append(figure);
  }
  item.append(card);
  return item;
}

export function renderCV() {
  const content = document.querySelector('#cv-content');
  if (!content) return;
  const sectionHeading = content.closest('#cv') ? 'h3' : 'h2';
  const cardHeading = content.closest('#cv') ? 'h4' : 'h3';
  const data = site.cv;
  const actions = document.querySelector('#resume-actions');
  actions.replaceChildren();
  if (data.url) actions.append(
    resource({ label: 'View resume (PDF)', url: data.url }),
    resource({ label: 'Download resume', url: data.url, download: true }),
  );

  const list = document.querySelector('#experience-list');
  list.replaceChildren(...(data.experiences || []).map(experience => experienceCard(experience, cardHeading)));
  const filters = document.querySelector('#experience-filters');
  const status = document.querySelector('#experience-status');
  const categories = [...new Set((data.experiences || []).map((item) => item.category))];
  const defaultCategory = categories.includes('Industry') ? 'Industry' : categories[0];
  function selectCategory(category, announce = false) {
    filters.querySelectorAll('button').forEach((control) => control.setAttribute('aria-pressed', String(control.textContent === category)));
    let count = 0;
    list.querySelectorAll('.experience-item').forEach((item) => {
      item.hidden = item.dataset.category !== category;
      if (!item.hidden) count++;
    });
    if (announce) status.textContent = `${count} ${count === 1 ? 'experience' : 'experiences'} shown.`;
  }
  filters.hidden = categories.length < 2;
  filters.replaceChildren(...categories.map((category) => {
    const button = node('button', '', category);
    button.type = 'button';
    button.addEventListener('click', () => selectCategory(category, true));
    return button;
  }));
  selectCategory(defaultCategory);

  document.querySelector('#education-list').replaceChildren(...(data.education || []).map((entry) => {
    const card = node('article', 'education-card');
    card.append(node(cardHeading, '', entry.degree), node('p', 'education-institution', entry.institution), node('p', '', entry.detail), node('p', 'education-status', entry.status));
    return card;
  }));
  const coursework = document.querySelector('#cv-coursework');
  coursework.replaceChildren();
  if (data.coursework?.length) {
    const heading = node(sectionHeading, '', 'Coursework');
    heading.id = 'coursework-heading';
    coursework.append(heading);
    data.coursework.forEach((group, index) => {
      const section = node('details', 'coursework-group');
      section.open = index === 0;
      section.dataset.category = group.title;
      section.append(node('summary', '', group.title));
      const list = node('ul', 'coursework-list');
      group.courses.forEach((course) => {
        const item = node('li', 'coursework-item');
        const title = node('div', 'coursework-title');
        title.append(node('strong', 'coursework-code', course.code), ' · ', node('span', '', course.title));
        item.append(title);
        if (course.description) item.append(node('p', 'coursework-description', course.description));
        list.append(item);
      });
      section.append(list);
      coursework.append(section);
    });
  }
  document.querySelector('#skills-list').replaceChildren(...(data.skills || []).map((group) => {
    const block = node('div', 'skill-group');
    const list = node('ul');
    group.items.forEach((skill) => list.append(node('li', '', skill)));
    block.append(node(cardHeading, '', group.title), list);
    return block;
  }));

  const preview = document.querySelector('#resume-preview');
  preview.hidden = !data.url;
  if (data.url) preview.querySelector('a').href = data.url;
  preview.querySelector('iframe')?.remove();
  preview.addEventListener('toggle', () => {
    if (!preview.open || preview.querySelector('iframe')) return;
    const frame = node('iframe', 'cv-frame');
    frame.title = `${site.name}’s resume`;
    frame.src = data.url;
    preview.append(frame);
  });
}
