import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the blog has a scrollable PDF and only an Open PDF action', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/blog/prompt-injection-data-curation.html');
  await expect(page.locator('#document-reader')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.pdfViewer .page')).toHaveCount(28);
  await expect(page.locator('.page[data-page-number="1"] .textLayer')).toContainText('Readers');
  await expect(page.locator('.document-links a')).toHaveText(['Open PDF']);
  await expect(page.locator('#document-controls, input, select')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Previous version' })).toHaveCount(0);
  await page.locator('.page[data-page-number="7"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.page[data-page-number="7"] .textLayer')).toContainText('Training Objective');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect((await new AxeBuilder({ page }).exclude('#pdf-pages').analyze()).violations).toEqual([]);
  const pdf = await request.get('/assets/blog/lesswrong-2026-11-05/better-data-curation.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  expect(errors).toEqual([]);
});

test('Open PDF is available without JavaScript', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/blog/prompt-injection-data-curation.html');
  await expect(page.locator('#document-reader')).toBeHidden();
  const link = page.getByRole('link', { name: 'Open PDF', exact: true });
  await expect(link).toBeVisible();
  const url = await link.getAttribute('href');
  expect((await request.get(new URL(url, page.url()).href)).ok()).toBe(true);
  await context.close();
});
