import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { site } from '../assets/js/content.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'teaching.html', 'cv.html', 'cat.html', 'blake.html'];
let checked = 0;
async function reference(url, from = root) {
  assert.equal(typeof url, 'string', 'URLs must be strings');
  assert.ok(url.length > 0, 'URLs cannot be empty');
  if (/^(https:\/\/|mailto:|#)/.test(url)) return;
  assert.ok(!/^[a-z]+:|^\/\//i.test(url), `Unsupported URL: ${url}`);
  const path = resolve(from, decodeURIComponent(url.split(/[?#]/)[0]));
  assert.ok(path.startsWith(root + sep), `Path must stay inside the site: ${url}`);
  await access(path).catch(() => { throw new Error(`Missing file: ${url}`); });
  checked++;
}
async function links(items = []) {
  for (const item of items) {
    assert.ok(item.label?.trim(), 'Links need a visible label');
    await reference(item.url);
  }
}

assert.ok(site.name?.trim(), 'The profile needs a name');
assert.ok(site.bio.length && site.bio.every((text) => typeof text === 'string' && text.trim()), 'The biography needs text');
await links(site.links);
if (site.portrait) { await reference(site.portrait); assert.ok(site.portraitAlt?.trim()); }
if (site.cv.url) await reference(site.cv.url);
const experienceIDs = new Set();
for (const experience of site.cv.experiences || []) {
  assert.ok(experience.id && !experienceIDs.has(experience.id), 'Experience IDs must be unique');
  experienceIDs.add(experience.id);
  assert.ok(experience.organization?.trim() && experience.role?.trim() && experience.category?.trim(), 'Experience needs an organization, role, and category');
  if (experience.photo) {
    await reference(experience.photo.src);
    assert.ok(experience.photo.alt?.trim() && experience.photo.width > 0 && experience.photo.height > 0, 'Experience photos need alt text and dimensions');
  }
  await links(experience.links);
}
for (const project of site.research) {
  assert.ok(project.title?.trim() && project.summary?.trim(), 'Research entries need a title and summary');
  if (project.image) { await reference(project.image); assert.ok(project.imageAlt?.trim(), 'Research images need alternative text'); }
  await links(project.links);
}
for (const course of site.teaching) {
  assert.ok(course.title?.trim() && course.role?.trim(), 'Courses need a title and role');
  await links(course.links);
  if (course.photo) {
    await reference(course.photo.src);
    assert.ok(course.photo.alt?.trim() && course.photo.width > 0 && course.photo.height > 0, 'Teaching photos need alt text and dimensions');
  }
  for (const resource of course.materials || []) {
    assert.ok(resource.title?.trim(), 'Lecture materials need a title');
    await reference(resource.url);
    if (resource.url.endsWith('.ipynb')) {
      const notebook = JSON.parse(await readFile(resolve(root, decodeURIComponent(resource.url)), 'utf8'));
      assert.ok(notebook.nbformat === 4 && notebook.cells.length, 'Lecture notebooks must have readable cells');
    }
  }
}
for (const animal of site.animals) {
  assert.ok(animal.title?.trim() && animal.alt?.trim(), 'Animals need a title and alternative text');
  assert.ok(animal.width > 0 && animal.height > 0, 'Animal photos need dimensions');
  await reference(animal.src);
  await reference(animal.url);
}
for (const cat of [site.cat, site.blake]) {
  await reference(cat.hero);
  assert.ok(cat.heroAlt?.trim(), 'The cat portrait needs alternative text');
  const ids = new Set();
  for (const photo of cat.photos) {
    assert.ok(photo.id && !ids.has(photo.id), 'Photo IDs must be unique');
    ids.add(photo.id);
    assert.ok(photo.alt?.trim() && photo.title?.trim() && photo.category?.trim(), 'Photos need alt text, a title, and category');
    assert.ok(photo.width > 0 && photo.height > 0, 'Photos need dimensions');
    await reference(photo.src);
  }
}
for (const page of pages) {
  const html = await readFile(resolve(root, page), 'utf8');
  assert.ok(html.includes('lang="en"') && html.includes('name="viewport"'), `${page} needs language and viewport metadata`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page} needs one main heading`);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"\s]+)"/g)) await reference(url.replaceAll('&amp;', '&'));
}
const css = await readFile(resolve(root, 'assets/css/style.css'), 'utf8');
for (const [, url] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) await reference(url, resolve(root, 'assets/css'));
for (const script of ['assets/js/app.js', 'assets/js/content.js', 'assets/js/cv.js', 'assets/js/page-turn.js', 'assets/js/transition.js', 'scripts/serve.mjs']) execFileSync(process.execPath, ['--check', resolve(root, script)]);
console.log(`Site checks passed: ${pages.length} pages, ${checked} local references, ${site.cat.photos.length + site.blake.photos.length} photos, JavaScript syntax.`);
