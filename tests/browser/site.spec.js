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
    for (const path of ['index.html', 'teaching.html', 'cv.html', 'cat.html', 'blake.html']) {
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
  await expect(page.locator('#lightbox-count')).toHaveText('1 / 9');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-count')).toHaveText('9 / 9');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-count')).toHaveText('1 / 9');
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
  await expect(page.locator('#animals-list img')).toHaveCount(2);
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
  await page.getByText('Details', { exact: true }).click();
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

test('a full-page book turn reveals the destination underneath and preserves history', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-nav=teaching]').click();
  await expect(page.locator('.book-turn')).toHaveAttribute('data-state', 'turning');
  await expect(page.locator('.book-turn')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.evaluate(() => document.querySelector('.book-front').shadowRoot.querySelector('#profile-name').textContent)).toContain('Ethan');
  expect(await page.evaluate(() => document.querySelector('main h1').textContent)).toBe('Teaching');
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.locator('[data-nav=cat]').click();
  await expect(page).toHaveURL(/cat.html$/);
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await expect(page.locator('.photo-open')).toHaveCount(9);
  await page.goBack();
  await expect(page.locator('body')).toHaveAttribute('data-page', 'teaching');
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await page.goForward();
  await expect(page.locator('body')).toHaveAttribute('data-page', 'cat');
  await page.locator('.photo-open').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('quick repeated tab clicks resolve to the last destination on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-nav=cat]').click();
  await expect(page.locator('.book-turn')).toHaveCount(1);
  await page.locator('[data-nav=teaching]').click();
  await page.locator('[data-nav=cv]').click();
  await expect(page).toHaveURL(/cv.html$/);
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.locator('nav [aria-current=page]')).toHaveText('CV');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion skips the page turn and failed page fetches use native navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    window.canvasesAdded = 0;
    new MutationObserver((changes) => {
      for (const change of changes) for (const node of change.addedNodes) if (node.matches?.('.book-turn')) window.canvasesAdded++;
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
  await expect(page.locator('.book-turn')).toHaveCount(0);
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
  await expect(page.locator('.teaching-term')).toHaveCount(3);
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

test('page turns always move right to left regardless of tab order', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  for (const tab of ['cat', 'teaching', 'profile']) {
    await page.locator(`[data-nav=${tab}]`).click();
    await expect(page.locator('.book-turn')).toHaveAttribute('data-state', 'turning');
    const positions = await page.evaluate(async () => {
      const animation = document.querySelector('.book-sheet').getAnimations()[0];
      animation.pause();
      animation.currentTime = 0;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const before = document.querySelector('.book-paper').getBoundingClientRect().right;
      animation.currentTime = 715;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const after = document.querySelector('.book-paper').getBoundingClientRect().right;
      const hand = document.querySelector('.book-hand-atlas');
      await hand.decode();
      return { before, after, handWidth: hand.naturalWidth };
    });
    expect(positions.after).toBeLessThan(positions.before * .8);
    expect(positions.after).toBeGreaterThan(0);
    expect(positions.handWidth).toBeGreaterThan(0);
    if (tab === 'teaching') await page.screenshot({ path: '/tmp/ethan-book-turn.png' });
    await page.evaluate(() => document.querySelector('.book-sheet').getAnimations()[0].play());
    await expect(page.locator('.book-turn')).toHaveCount(0);
  }
});

test('CV experiences filter, expand, link to research, and offer the supplied resume', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cv.html');
  await expect(page.locator('.experience-item')).toHaveCount(7);
  await expect(page.getByText('Charlottesville Debate League')).toHaveCount(0);
  await expect(page.locator('#tencent')).toContainText('May – August 2024');
  await expect(page.locator('#tencent')).toContainText('Data Analyst Intern');
  await expect(page.locator('#tencent')).toContainText('Shenzhen, China');
  await page.locator('#tencent summary').click();
  await expect(page.locator('#tencent details')).toContainText('10,000+ survey respondents');
  await expect(page.locator('#tencent details')).toContainText('retention by 14%');
  await expect(page.locator('#tencent details')).toContainText('satisfaction by 21%');
  await expect(page.locator('#tencent details')).toContainText('Riot Games');
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
  await expect(sarc).toContainText('January – April 2025');
  await expect(sarc.locator('img')).toHaveAttribute('src', './assets/images/experience/sarc-5400.jpeg');
  await expect(page.locator('#comm-4351')).toContainText('September – December 2025');
  const cdl = page.locator('.teaching-row').filter({ hasText: 'Charlottesville Debate League' });
  await expect(cdl).toContainText('Tournament Chair');
  await expect(cdl).toContainText('middle school students');
  await expect(cdl).toContainText('January 2024 – Present');
  await expect(cdl.locator('img')).toHaveAttribute('src', './assets/images/experience/cdl-team.jpg');
});

test('the homepage shows all three teaching photos with closer crops and the fluid-dynamics work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#teaching-preview .teaching-photo img')).toHaveCount(3);
  await page.locator('#teaching-preview img').evaluateAll((images) => Promise.all(images.map((image) => {
    image.loading = 'eager';
    return image.decode();
  })));
  await expect(page.locator('#teaching-preview .teaching-term')).toHaveText(site.teaching.map((course) => course.term));
  await expect(page.locator('.research-thumbnail-placeholder, .experience-category')).toHaveCount(0);
  const fluid = page.locator('#fluid-dynamics');
  await expect(fluid).toContainText('Visual Intelligence Lab');
  await fluid.locator('summary').click();
  await expect(fluid).toContainText('Research Assistant');
  await expect(fluid.locator('details')).toContainText('67%+');
  await expect(fluid.locator('details')).toContainText('8+ hours to 6+ minutes');
  await expect(fluid.locator('details')).toContainText('81%+');
  await expect(fluid.locator('details')).toContainText('zero time derivatives');
  await page.locator('#sarc-5400-preview .teaching-photo').click();
  await expect(page).toHaveURL(/teaching.html#sarc-5400$/);
  await expect(page.locator('#sarc-5400')).toBeInViewport();
});

test('page turning preserves the pinned header after scrolling and respects motion changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => { scrollTo(0, 600); return document.fonts.ready; });
  const original = await page.locator('.site-header').boundingBox();
  await page.locator('[data-nav=teaching]').click();
  await expect(page.locator('.book-turn')).toHaveAttribute('data-state', 'turning');
  const frozen = await page.evaluate(() => {
    const animation = document.querySelector('.book-sheet').getAnimations()[0];
    animation.pause(); animation.currentTime = 0;
    return document.querySelector('.book-front').shadowRoot.querySelector('.site-header').getBoundingClientRect().toJSON();
  });
  expect(Math.abs(frozen.y - original.y)).toBeLessThan(1);
  expect(Math.abs(frozen.x - original.x)).toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page).toHaveURL(/teaching.html$/);
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await expect(page.locator('.site-shell')).toHaveCSS('opacity', '1');
  await expect(page.locator('body')).not.toHaveAttribute('aria-busy');
});

test('visible text stays at readable sizes on every page, including small phones', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 844 });
  for (const path of ['index.html', 'teaching.html', 'cv.html', 'cat.html', 'blake.html']) {
    await page.goto('/' + path);
    const smallText = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const results = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!node.textContent.trim() || parent.closest('.sr-only, script, style, [aria-hidden="true"]') || !parent.getBoundingClientRect().width) continue;
        if (parseFloat(getComputedStyle(parent).fontSize) < 16) results.push(node.textContent.trim());
      }
      return results;
    });
    expect(smallText, path).toEqual([]);
  }
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

test('unavailable animation and mid-transition resize leave a readable destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => { Element.prototype.animate = undefined; });
  await page.locator('[data-nav=cv]').click();
  await expect(page).toHaveURL(/cv.html$/);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await page.goto('/');
  await page.locator('[data-nav=teaching]').click();
  await expect(page.locator('.book-turn')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveURL(/teaching.html$/);
  await expect(page.locator('.book-turn')).toHaveCount(0);
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('heading', { name: 'Data Visualization' })).toBeVisible();
  await expect(page.locator('body')).not.toHaveAttribute('aria-busy');
});

test('Blake has a separate album and lightbox, accessible from the homepage and Cat tab', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#animals-list').getByRole('link', { name: 'Blake' }).click();
  await expect(page).toHaveURL(/blake.html$/);
  await expect(page.getByRole('heading', { name: 'Meet Blake.' })).toBeVisible();
  await expect(page.locator('#cat-bio')).toHaveText('I met Blake in North Carolina during my internship.');
  await expect(page.locator('.photo-open')).toHaveCount(6);
  await expect(page.locator('#cat-gallery img[src*=layla]')).toHaveCount(0);
  await page.locator('.photo-open').first().click();
  await expect(page.locator('#lightbox-count')).toHaveText('1 / 6');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-count')).toHaveText('6 / 6');
  await expect(page.locator('#lightbox-image')).toHaveAttribute('src', /blake-glasses/);
  await page.keyboard.press('Escape');
  await page.getByRole('navigation', { name: 'Cat albums' }).getByRole('link', { name: 'Layla' }).click();
  await expect(page.locator('.photo-open')).toHaveCount(9);
  await page.getByRole('navigation', { name: 'Cat albums' }).getByRole('link', { name: 'Blake' }).click();
  await expect(page.locator('.photo-open')).toHaveCount(6);
  await page.locator('[data-nav=teaching]').click();
  await expect(page.locator('#teaching-list')).not.toContainText('University of Virginia');
  for (const role of await page.locator('.teaching-role').all()) {
    expect(await role.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(20);
  }
});

test('Tencent and UVA teaching CV photos sit compactly to the right of their text', async ({ page }) => {
  await page.goto('/cv.html');
  for (const id of ['tencent', 'guest-lecture']) {
    const card = page.locator(`#${id}`);
    const image = await card.locator('.experience-photo').boundingBox();
    const copy = await card.locator('.experience-copy').boundingBox();
    expect(image.width).toBeLessThanOrEqual(180);
    expect(image.x).toBeGreaterThan(copy.x + copy.width);
    expect(Math.abs(image.y - copy.y)).toBeLessThan(1);
  }
});

test('the page turn plays all ten hand poses through approach, grip, turn, and release', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(async () => {
    const { HAND_SPRITE_URL } = await import('/assets/js/page-turn.js');
    const image = new Image(); image.src = HAND_SPRITE_URL; await image.decode();
    window.handFrames = new Set(); window.handPhases = new Set();
    new MutationObserver(() => {
      const hand = document.querySelector('.book-hand');
      if (hand) { window.handFrames.add(Number(hand.dataset.frame)); window.handPhases.add(hand.dataset.phase); }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-frame', 'data-phase'] });
  });
  await page.locator('[data-nav=teaching]').click();
  await expect(page.locator('.book-hand')).toHaveAttribute('data-frame-count', '10');
  await expect(page.locator('.book-hand .book-hand-frame')).toHaveCount(2);
  await expect(page.locator('.book-turn')).toHaveCount(0);
  expect(await page.evaluate(() => [...window.handFrames].sort((a,b) => a-b))).toEqual([1,2,3,4,5,6,7,8,9,10]);
  expect(await page.evaluate(() => [...window.handPhases])).toEqual(['approach','grip','turn','release','withdraw']);
  await expect(page.locator('body')).not.toHaveAttribute('aria-busy');
});

test('the hand grabs promptly and travels beyond the left edge without dropping', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const { makePageTurn, TURN_DURATION } = await import('/assets/js/page-turn.js');
      const preview = makePageTurn(); await preview.ready; preview.show(); preview.play(() => {});
      const animation = document.querySelector('.book-sheet').getAnimations()[0];
      animation.pause();
      const seek = async (time) => {
        animation.currentTime = time;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      };
      await seek(200);
      const earlyProgress = Number(document.querySelector('.book-turn').dataset.progress);
      const samples = [];
      for (const progress of [.35, .40, .45, .50, .55, .60, .65, .70]) {
        await seek(TURN_DURATION * progress);
        const hand = document.querySelector('.book-hand');
        const transform = new DOMMatrixReadOnly(getComputedStyle(hand).transform);
        samples.push({ right: hand.getBoundingClientRect().right, y: transform.m42 });
      }
      preview.finish();
      return { earlyProgress, samples };
    });
    expect(result.earlyProgress).toBeGreaterThanOrEqual(.01);
    for (let i = 1; i < result.samples.length; i++) expect(result.samples[i].right).toBeLessThan(result.samples[i - 1].right);
    expect(result.samples.at(-1).right).toBeLessThan(0);
    const heights = result.samples.map(sample => sample.y);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(35);
  }
});
