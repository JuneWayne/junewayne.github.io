import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the updated blog renders the original PDF, supports search and zoom, and links to the archive', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/blog/prompt-injection-data-curation.html');
  await expect(page.locator('#document-reader')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#document-count')).toHaveText('of 28');
  await expect(page.locator('.pdfViewer .page')).toHaveCount(28);
  await expect(page.locator('.page[data-page-number="1"] .textLayer')).toContainText('Readers');
  await page.locator('#document-page').fill('16');
  await page.locator('#document-page').press('Enter');
  await expect(page.locator('.page[data-page-number="16"] canvas')).toBeVisible();
  await page.locator('#document-zoom').selectOption('1.5');
  await expect(page.locator('.page[data-page-number="16"]')).toHaveCSS('width', '1224px');
  await page.locator('#document-search').fill('References');
  await page.locator('#find-next').click();
  await expect(page.locator('#find-status')).toContainText('matches');
  await expect(page.locator('.textLayer .highlight.selected')).toHaveCount(1);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('#document-zoom').selectOption('page-width');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator('#document-page').fill('1');
  await page.locator('#document-page').press('Enter');
  await page.screenshot({ path: '/tmp/lesswrong-reader-desktop.png' });
  expect((await new AxeBuilder({ page }).exclude('#pdf-pages').analyze()).violations).toEqual([]);
  const pdf = await request.get('/assets/blog/lesswrong-2026-11-05/better-data-curation.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await page.getByRole('link', { name: 'Previous version' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Towards curating effective data');
  await expect(page.locator('.katex').first()).toBeVisible();
  await page.locator('#benchmark').selectOption('agentdojo');
  await expect(page.locator('#chart-agentdojo')).toBeVisible();
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
  await page.getByRole('link', { name: 'Read the updated article.' }).click();
  await expect(page).toHaveURL(/\/blog\/prompt-injection-data-curation.html$/);
  expect(errors).toEqual([]);
});

test('the updated blog provides the original PDF without JavaScript', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/blog/prompt-injection-data-curation.html');
  await expect(page.getByRole('link', { name: 'Read the complete article as a PDF.' })).toBeVisible();
  await expect(page.locator('#document-reader')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Previous version' })).toBeVisible();
  const url = await page.getByRole('link', { name: 'Read the complete article as a PDF.' }).getAttribute('href');
  expect((await request.get(new URL(url, page.url()).href)).ok()).toBe(true);
  await context.close();
});
