import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

// Keep the HTML fallback in sync with the content rendered by JavaScript.
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/tmp/ethan-site-browsers';
const { chromium } = await import('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5174';
const server = process.argv[2] ? null : spawn(process.execPath, ['scripts/serve.mjs', '--port', '5174'], { stdio: 'pipe' });
const ids = ['profile-bio', 'profile-links', 'profile-resume', 'cv-resume', 'experience-list', 'education-list', 'cv-coursework', 'skills-list', 'research-list', 'teaching-preview', 'teaching-list'];
const browser = await chromium.launch();
try {
  if (server) await new Promise((resolve, reject) => {
    server.stdout.once('data', resolve);
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Preview server exited: ${code}`)));
  });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const file of ['index.html', 'cv.html', 'research.html', 'teaching.html']) {
    await page.goto(`${base}/${file}`);
    await page.waitForFunction(() => document.querySelector('#research-list article, #experience-list article, #teaching-list article'));
    const rendered = await page.evaluate(ids => ids.flatMap(id => {
      const original = document.getElementById(id);
      if (!original) return [];
      const copy = original.cloneNode(true);
      copy.querySelector('.teaching-gallery-controls')?.remove();
      copy.querySelectorAll('.experience-item').forEach(item => { item.hidden = false; });
      copy.querySelectorAll('.card-title-button').forEach(button => {
        button.closest('.clickable-card')?.classList.remove('clickable-card');
        button.replaceWith(document.createTextNode(button.textContent));
      });
      copy.querySelectorAll('picture source').forEach(source => {
        source.parentElement.querySelector('img').setAttribute('src', source.getAttribute('srcset'));
      });
      return [{ id, html: copy.outerHTML }];
    }), ids);
    let source = await readFile(file, 'utf8');
    for (const { id, html } of rendered) {
      const opening = new RegExp(`<([a-z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>`, 'i').exec(source);
      if (!opening) throw new Error(`Missing ${id} in ${file}`);
      const tags = new RegExp(`</?${opening[1]}\\b[^>]*>`, 'gi');
      tags.lastIndex = opening.index + opening[0].length;
      let depth = 1;
      for (let tag; depth && (tag = tags.exec(source));) depth += tag[0].startsWith('</') ? -1 : 1;
      if (depth) throw new Error(`Unclosed ${id} in ${file}`);
      source = source.slice(0, opening.index) + html + source.slice(tags.lastIndex);
    }
    await writeFile(file, source);
    console.log(`Updated ${file}`);
  }
} finally {
  await browser.close();
  server?.kill();
}
