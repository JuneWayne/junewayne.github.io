import { site } from './content.js';

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

function experienceCard(experience) {
  const item = node('li', 'experience-item');
  item.dataset.category = experience.category;
  const card = node('article', 'experience-card');
  card.id = experience.id;
  card.setAttribute('aria-labelledby', `${experience.id}-title`);
  const copy = node('div', 'experience-copy');
  const meta = node('div', 'experience-meta');
  meta.append(node('span', 'experience-category', experience.category));
  if (experience.dates) meta.append(node('p', 'experience-dates', experience.dates));
  const heading = node('h3', '', experience.organization);
  heading.id = `${experience.id}-title`;
  copy.append(meta, heading, node('p', 'experience-role', experience.role));
  if (experience.location) copy.append(node('p', 'experience-location', experience.location));
  if (experience.summary) copy.append(node('p', 'experience-summary', experience.summary));
  if (experience.highlights?.length) {
    const details = node('details', 'experience-details');
    details.append(node('summary', '', 'Contributions'));
    const list = node('ul');
    experience.highlights.forEach((text) => list.append(node('li', '', text)));
    details.append(list);
    copy.append(details);
  }
  if (experience.links?.length) {
    const links = node('div', 'experience-links');
    experience.links.forEach((link) => links.append(resource(link)));
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
  const data = site.cv;
  const actions = document.querySelector('#resume-actions');
  actions.replaceChildren();
  if (data.url) actions.append(
    resource({ label: 'View resume (PDF)', url: data.url }),
    resource({ label: 'Download resume', url: data.url, download: true }),
  );

  const list = document.querySelector('#experience-list');
  list.replaceChildren(...(data.experiences || []).map(experienceCard));
  const filters = document.querySelector('#experience-filters');
  const status = document.querySelector('#experience-status');
  const categories = ['All experience', ...new Set((data.experiences || []).map((item) => item.category))];
  filters.hidden = categories.length < 3;
  filters.replaceChildren(...categories.map((category, index) => {
    const button = node('button', '', category);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach((control) => control.setAttribute('aria-pressed', String(control === button)));
      let count = 0;
      list.querySelectorAll('.experience-item').forEach((item) => {
        item.hidden = category !== 'All experience' && item.dataset.category !== category;
        if (!item.hidden) count++;
      });
      status.textContent = `${count} ${count === 1 ? 'experience' : 'experiences'} shown.`;
    });
    return button;
  }));

  document.querySelector('#education-list').replaceChildren(...(data.education || []).map((entry) => {
    const card = node('article', 'education-card');
    card.append(node('h3', '', entry.degree), node('p', 'education-institution', entry.institution), node('p', '', entry.detail), node('p', 'education-status', entry.status));
    return card;
  }));
  const coursework = document.querySelector('#cv-coursework');
  coursework.replaceChildren();
  if (data.coursework?.length) coursework.append(node('h3', '', 'Relevant coursework'), node('p', '', data.coursework.join(' · ')));
  document.querySelector('#skills-list').replaceChildren(...(data.skills || []).map((group) => {
    const block = node('div', 'skill-group');
    const list = node('ul');
    group.items.forEach((skill) => list.append(node('li', '', skill)));
    block.append(node('h3', '', group.title), list);
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
