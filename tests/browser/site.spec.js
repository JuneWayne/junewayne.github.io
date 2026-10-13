import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { site } from '../../assets/js/content.js';

test('pages load without errors, fit every viewport, and pass accessibility checks', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['index.html', 'teaching.html', 'cv.html', 'cat.html']) {
      await page.goto(`/${path}`);
      await expect(page.locator('nav [aria-current="page"]')).toHaveCount(1);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('img[src]').evaluateAll((images) => Promise.all(images.map((image) => {
        image.loading = 'eager';
        return image.decode();
      })));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 390 || width === 1440) {
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(result.violations, `${path} at ${width}px`).toEqual([]);
        await page.screenshot({ path: `/tmp/ethan-site-${path.replace('.html', '')}-${width}.png`, fullPage: path !== 'cat.html' });
      }
    }
  }
  expect(errors).toEqual([]);
});

test('navigation exposes the profile, research, and guest lecture', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#profile-bio')).toContainText('fourth-year undergraduate');
  await expect(page.getByRole('link', { name: 'ethan128@me.com' })).toHaveAttribute('href', 'mailto:ethan128@me.com');
  await expect(page.getByRole('link', { name: 'wkt7ne@virginia.edu' })).toHaveAttribute('href', 'mailto:wkt7ne@virginia.edu');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Teaching' }).click();
  await expect(page.getByRole('heading', { name: 'Marketing Analytics and Big Data' })).toBeVisible();
  await expect(page.locator('.teaching-role').first()).toContainText('Guest Lecturer');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'CV' }).click();
  await expect(page.getByRole('heading', { name: 'Cisco Systems' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Cat' }).click();
  await expect(page.getByRole('heading', { name: 'Meet Layla.' })).toBeVisible();
});

test('the trimmed Cat gallery, keyboard photo navigation, and focus restoration work', async ({ page }) => {
  await page.goto('/cat.html');
  await expect(page.locator('.photo-open')).toHaveCount(site.cat.photos.length);
  await expect(page.locator('#cat-filters')).toBeHidden();
  await expect(page.locator('.cat-photo figcaption p, #lightbox-description')).toHaveCount(0);
  await expect(page.locator('#cat-gallery img[src*="duck"], #cat-gallery img[src$="layla2.jpg"], #cat-gallery img[src$="layla3.jpg"], #cat-gallery img[src$="laylaandmaomi.jpg"]')).toHaveCount(0);
  const first = page.locator('.photo-open').first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#lightbox-close')).toBeFocused();
  await expect(page.locator('#lightbox-count')).toHaveText('1 / 8');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-count')).toHaveText('8 / 8');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-count')).toHaveText('1 / 8');
  await expect(page.locator('#lightbox-image')).toHaveJSProperty('naturalWidth', 1280);
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.querySelector('#photo-dialog').contains(document.activeElement))).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(first).toBeFocused();
});

test('Profile and Research share navigation; photos load and reduced-motion navigation is instant', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ethan (Yisong) Cao', exact: true })).toBeVisible();
  await expect(page.locator('#profile-bio')).toContainText('actively seeking graduate opportunities and internships');
  await expect(page.locator('#profile-role, .section-note, .site-footer, .motion-toggle')).toHaveCount(0);
  expect(await page.locator('.ambient-field').evaluate((node) => getComputedStyle(node).animationName)).toBe('none');
  await page.locator('#animals').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Animals', exact: true })).toBeVisible();
  await expect(page.locator('#animals-list img')).toHaveCount(1);
  await expect(page.locator('#animals-list img').first()).toHaveJSProperty('naturalWidth', 1280);
  expect(await page.evaluate(() => document.querySelector('#animals').compareDocumentPosition(document.querySelector('.home-teaching')) & Node.DOCUMENT_POSITION_PRECEDING)).toBeTruthy();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.reveal, .will-reveal')).toHaveCount(0);
  await expect(page.locator('nav [data-nav]')).toHaveText(['Profile', 'Research', 'Teaching', 'CV', 'Cat']);
  await expect(page.locator('nav [data-nav=profile]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('nav [data-nav=cv]')).toHaveText('CV');
  await expect(page.locator('nav [data-nav=cv] span')).toHaveCount(0);
  await expect(page.locator('#profile-portrait')).toHaveJSProperty('naturalWidth', 1276);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Research' }).click();
  await expect(page.locator('nav [data-nav=research]')).toHaveAttribute('aria-current', 'page');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Profile' }).click();
  await expect(page.locator('nav [data-nav=profile]')).toHaveAttribute('aria-current', 'page');
  await page.locator('#animals-list').getByRole('link', { name: 'Layla' }).click();
  await expect(page.getByRole('heading', { name: 'Meet Layla.' })).toBeVisible();
});

test('supplied content renders a portrait, research story, teaching details, and PDF controls', async ({ page }) => {
  const content = structuredClone(site);
  content.portrait = './assets/images/cats/layla.jpg';
  content.portraitAlt = 'Test portrait';
  content.research = [{ title: 'Test research project', summary: 'A summary supplied through the content file.', year: '2026', kind: 'Research', image: './assets/images/cats/layla3.jpg', imageAlt: 'Test project image', details: ['A longer explanation of the research question and findings.'], links: [{ label: 'Code', url: 'https://github.com/JuneWayne' }] }];
  content.teaching = [{ title: 'Test course', code: 'TEST 101', institution: 'University of Virginia', role: 'Teaching Assistant', term: 'Fall 2026', description: 'Helped students understand course material.' }];
  content.cv = { url: './assets/documents/test-cv.pdf', updated: 'October 2026' };
  await page.route('**/assets/js/content.js', (route) => route.fulfill({ contentType: 'text/javascript', body: `export const site = ${JSON.stringify(content)};` }));
  await page.route('**/assets/documents/test-cv.pdf', (route) => route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.4\n%%EOF' }));
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'Test portrait' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Test research project' })).toBeVisible();
  await page.getByText('The story behind the work').click();
  await expect(page.getByText('A longer explanation of the research question and findings.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Test course' })).toBeVisible();
  await page.goto('/teaching.html');
  await expect(page.getByText('Helped students understand course material.')).toBeVisible();
  await page.goto('/cv.html');
  await expect(page.getByRole('link', { name: 'View resume (PDF)' })).toHaveAttribute('href', './assets/documents/test-cv.pdf');
  await page.locator('#resume-preview summary').click();
  await expect(page.locator('iframe')).toHaveAttribute('title', 'Ethan (Yisong) Cao’s resume');
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('profile and navigation remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByRole('heading', { name: 'Ethan (Yisong) Cao', exact: true })).toBeVisible();
  await expect(page.locator('#profile-bio')).toContainText('University of Virginia');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Cat' }).click();
  await expect(page.getByRole('heading', { name: 'Meet Layla.' })).toBeVisible();
  await context.close();
});

test('actual pixel tiles lift and fade across the page, then navigation settles and browser history works', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.addEventListener('click', () => { window.navigationStart = performance.now(); }, { once: true });
    new MutationObserver(() => {
      if (window.navigationStart && !document.querySelector('.page-pixels, .page-vortex')) window.navigationElapsed = performance.now() - window.navigationStart;
    }).observe(document.body, { childList: true });
  });
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Teaching' }).click();
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveCount(1);
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveAttribute('aria-hidden', 'true');
  expect(Number(await page.locator('.page-pixels').getAttribute('data-tiles'))).toBeGreaterThan(100);
  await expect(page.locator('main')).toHaveCSS('opacity', '0');
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveCount(0);
  expect(await page.evaluate(() => window.navigationElapsed)).toBeLessThan(1500);
  expect(await page.evaluate(() => window.navigationElapsed)).toBeGreaterThan(800);
  await expect(page.locator('main')).toHaveCSS('filter', 'none');
  await expect(page.locator('main')).toHaveCSS('mask-image', 'none');
  await expect(page).toHaveURL(/teaching.html$/);
  await expect(page).toHaveTitle(/Teaching/);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Cat' }).click();
  await expect(page).toHaveURL(/cat.html$/);
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveCount(0);
  await expect(page.locator('.photo-open')).toHaveCount(8);
  await page.goBack();
  await expect(page.locator('body')).toHaveAttribute('data-page', 'teaching');
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveCount(0);
  await page.goForward();
  await expect(page.locator('body')).toHaveAttribute('data-page', 'cat');
  await page.locator('.photo-open').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
});

test('quick repeated tab clicks resolve to the last destination on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-nav=cat]').click();
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveCount(1);
  await page.locator('[data-nav=teaching]').click();
  await page.locator('[data-nav=cv]').click();
  await expect(page).toHaveURL(/cv.html$/);
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveCount(0);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.locator('nav [aria-current=page]')).toHaveText('CV');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion skips the canvas and failed page fetches use native navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    window.canvasesAdded = 0;
    new MutationObserver((changes) => {
      for (const change of changes) for (const node of change.addedNodes) if (node.matches?.('.page-pixels, .page-vortex')) window.canvasesAdded++;
    }).observe(document.body, { childList: true });
  });
  await page.locator('[data-nav=teaching]').click();
  await expect(page).toHaveURL(/teaching.html$/);
  expect(await page.evaluate(() => window.canvasesAdded)).toBe(0);
  await page.route('**/cat.html', (route) => route.request().resourceType() === 'fetch' ? route.abort() : route.continue());
  await page.locator('[data-nav=cat]').click();
  await expect(page).toHaveURL(/cat.html$/);
  await expect(page.getByRole('heading', { name: 'Meet Layla.' })).toBeVisible();
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.locator('.page-pixels, .page-vortex')).toHaveCount(0);
});

test('research resources and guest lecture notebooks are readable and downloadable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#research-list h3')).toHaveText(site.research.map((project) => project.title));
  await expect(page.getByRole('link', { name: 'Interactive demo' })).toHaveAttribute('href', 'https://junewayne.github.io/Verbalizing-LLMs-For-AI-Defense/?model=antares-1b');
  const name = await page.locator('#profile-name').boundingBox();
  const portrait = await page.locator('#profile-portrait').boundingBox();
  expect(name.y + name.height).toBeLessThan(portrait.y);
  expect(Math.abs(name.x - portrait.x)).toBeLessThan(1);
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
  for (const project of site.research) for (const resource of project.links) {
    if (resource.url.startsWith('https:')) continue;
    const response = await page.request.get(resource.url.replace('./', '/'));
    expect(response.ok()).toBe(true);
    const data = await response.body();
    expect(data.subarray(0, resource.url.endsWith('.pdf') ? 4 : 2).toString()).toBe(resource.url.endsWith('.pdf') ? '%PDF' : 'PK');
  }
  await page.goto('/teaching.html');
  await expect(page.locator('.lecture-materials li')).toHaveCount(3);
  await expect(page.locator('.teaching-term')).toHaveCount(1);
  for (const resource of site.teaching[0].materials) {
    const response = await page.request.get(resource.url.replace('./', '/'));
    expect(response.ok()).toBe(true);
    const notebook = await response.json();
    expect(notebook.nbformat).toBe(4);
    expect(notebook.cells.some((cell) => cell.cell_type === 'code')).toBe(true);
    expect(notebook.cells.every((cell) => !cell.outputs?.length)).toBe(true);
  }
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'APIs and Chatbots (.ipynb)' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('APIs_&_Chatbot.ipynb');
});

test('the slower spiral remains available for comparison', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?transition=spiral');
  await page.locator('[data-nav=teaching]').click();
  await expect(page.locator('.page-vortex')).toHaveCount(1);
  await expect(page.locator('.page-wave')).toHaveCount(0);
  await expect(page).toHaveURL(/teaching.html\?transition=spiral$/);
  await expect(page.locator('.page-vortex')).toHaveCount(0);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
});

test('CV experiences filter, expand, link to research, and offer the supplied resume', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cv.html');
  await expect(page.locator('.experience-item')).toHaveCount(7);
  await expect(page.getByText('Charlottesville Debate League')).toHaveCount(0);
  await expect(page.locator('#tencent')).toContainText('May – August 2024');
  await expect(page.locator('#tencent img')).toHaveAttribute('src', './assets/images/experience/tencent-internship.jpg');
  const filters = page.getByRole('group', { name: 'Filter experience' });
  for (const [category, count] of [['Industry', 3], ['Research', 3], ['Teaching', 1], ['All experience', 7]]) {
    await filters.getByRole('button', { name: category, exact: true }).click();
    await expect(page.locator('.experience-item:visible')).toHaveCount(count);
    await expect(filters.getByRole('button', { name: category, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#experience-status')).toContainText(`${count} ${count === 1 ? 'experience' : 'experiences'} shown`);
  }
  await page.locator('#cisco summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#cisco details')).toHaveAttribute('open', '');
  await expect(page.locator('#cisco details')).toContainText('Jacobian-lens');
  await expect(page.locator('#education-list')).toContainText('Admitted · Expected August 2028');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.locator('#resume-preview summary').click();
  await expect(page.locator('iframe')).toHaveAttribute('src', site.cv.url);
  const response = await page.request.get(site.cv.url.replace('./', '/'));
  expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download resume' }).click();
  expect((await downloadEvent).suggestedFilename()).toBe('Ethan Cao Resume.pdf');
  await page.locator('#cisco').getByRole('link', { name: /Related research/ }).click();
  await expect(page).toHaveURL(/index.html#prompt-injection$/);
  await expect(page.locator('#prompt-injection')).toBeInViewport();
  expect((await page.locator('#prompt-injection').boundingBox()).y).toBeGreaterThanOrEqual((await page.locator('.site-header').boundingBox()).height);
});

test('Teaching includes SARC 5400, Natasha Foutz, and CDL with the supplied photos', async ({ page }) => {
  await page.goto('/teaching.html');
  await expect(page.locator('#teaching-list .teaching-row')).toHaveCount(3);
  await expect(page.locator('#teaching-list')).toContainText('Professor Natasha Foutz');
  const sarc = page.locator('.teaching-row').filter({ hasText: 'SARC 5400' });
  await expect(sarc).toContainText('Data Visualization');
  await expect(sarc).toContainText('Teaching Assistant');
  const cdl = page.locator('.teaching-row').filter({ hasText: 'Charlottesville Debate League' });
  await expect(cdl).toContainText('Tournament Chair');
  await expect(cdl).toContainText('middle school students');
  await expect(cdl.locator('img')).toHaveAttribute('src', './assets/images/experience/cdl-team.jpg');
});

test('navigation stays pinned and research anchors clear it on desktop and phones', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() => scrollTo(0, 500));
    await expect.poll(async () => (await page.locator('.site-header').boundingBox()).y).toBe(0);
    await page.locator('[data-nav=research]').click();
    await expect(page.locator('#research')).toBeInViewport();
    const top = (await page.locator('#research').boundingBox()).y;
    const header = await page.locator('.site-header').boundingBox();
    expect(top).toBeGreaterThanOrEqual(header.height);
    expect(top).toBeLessThan(header.height + 80);
    await page.locator('[data-nav=cv]').click();
    await page.getByRole('navigation', { name: 'CV sections' }).getByRole('link', { name: 'Education' }).click();
    expect((await page.locator('#education').boundingBox()).y).toBeGreaterThanOrEqual(header.height);
  }
});

test('CV and Teaching remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/cv.html');
  await expect(page.locator('.experience-item')).toHaveCount(7);
  await expect(page.getByText('Charlottesville Debate League')).toHaveCount(0);
  await expect(page.locator('#tencent')).toContainText('May – August 2024');
  await expect(page.locator('#experience-filters')).toBeHidden();
  await page.locator('#cisco summary').click();
  await expect(page.locator('#cisco details ul')).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Teaching' }).click();
  await expect(page.locator('#teaching-list')).toContainText('Professor Natasha Foutz');
  await expect(page.locator('#teaching-list')).toContainText('SARC 5400');
  await expect(page.locator('#teaching-list')).toContainText('Tournament Chair');
  await context.close();
});

test('pixel sampling failure and mid-transition resize always leave a readable destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/vendor/html2canvas.esm.js', (route) => route.abort());
  await page.goto('/');
  await page.locator('[data-nav=cv]').click();
  await expect(page).toHaveURL(/cv.html$/);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.locator('.page-pixels')).toHaveCount(0);
  await page.unroute('**/vendor/html2canvas.esm.js');
  await page.goto('/');
  await page.locator('[data-nav=teaching]').click();
  await expect(page.locator('.page-pixels')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveURL(/teaching.html$/);
  await expect(page.locator('.page-pixels')).toHaveCount(0);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('heading', { name: 'Data Visualization' })).toBeVisible();
});
