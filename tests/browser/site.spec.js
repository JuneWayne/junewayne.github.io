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

test('navigation exposes the real profile and empty sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#profile-bio')).toContainText('fourth-year undergraduate');
  await expect(page.getByRole('link', { name: 'ethan128@me.com' })).toHaveAttribute('href', 'mailto:ethan128@me.com');
  await expect(page.getByRole('link', { name: 'wkt7ne@virginia.edu' })).toHaveAttribute('href', 'mailto:wkt7ne@virginia.edu');
  await page.getByRole('navigation').getByRole('link', { name: 'Teaching' }).click();
  await expect(page.getByRole('heading', { name: 'The course list is coming soon.' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'CV' }).click();
  await expect(page.getByRole('heading', { name: 'The CV is on its way.' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Cat' }).click();
  await expect(page.getByRole('heading', { name: 'Meet Layla.' })).toBeVisible();
});

test('Cat filtering, keyboard photo navigation, and focus restoration work', async ({ page }) => {
  await page.goto('/cat.html');
  await expect(page.locator('.photo-open')).toHaveCount(site.cat.photos.length);
  await page.getByRole('button', { name: 'Her world', exact: true }).click();
  await expect(page.locator('.photo-open')).toHaveCount(2);
  await expect(page.locator('#gallery-status')).toHaveText('2 photos shown.');
  await page.getByRole('button', { name: 'Layla', exact: true }).click();
  await expect(page.locator('.photo-open')).toHaveCount(site.cat.photos.filter((photo) => photo.category === 'Layla').length);
  const first = page.locator('.photo-open').first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#lightbox-close')).toBeFocused();
  await expect(page.locator('#lightbox-count')).toHaveText('1 / 11');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-count')).toHaveText('11 / 11');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-count')).toHaveText('1 / 11');
  await expect(page.locator('#lightbox-image')).toHaveJSProperty('naturalWidth', 1280);
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.querySelector('#photo-dialog').contains(document.activeElement))).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(first).toBeFocused();
});

test('Profile and Research share navigation; photos load and page changes are instant', async ({ page }) => {
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
  await expect(page.locator('#profile-portrait')).toHaveJSProperty('naturalWidth', 1279);
  await page.getByRole('navigation').getByRole('link', { name: 'Research' }).click();
  await expect(page.locator('nav [data-nav=research]')).toHaveAttribute('aria-current', 'page');
  await page.getByRole('navigation').getByRole('link', { name: 'Profile' }).click();
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
  await expect(page.getByRole('link', { name: 'Open CV (PDF)' })).toHaveAttribute('href', './assets/documents/test-cv.pdf');
  await expect(page.locator('iframe')).toHaveAttribute('title', 'Ethan (Yisong) Cao’s curriculum vitae');
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
  await page.getByRole('navigation').getByRole('link', { name: 'Cat' }).click();
  await expect(page.getByRole('heading', { name: 'Meet Layla.' })).toBeVisible();
  await context.close();
});
