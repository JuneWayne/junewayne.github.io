import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const results = JSON.parse(readFileSync(new URL('../../assets/blog/injection-defense/results.json', import.meta.url)));
const path = '/blog/prompt-injection-data-curation.html';

test('published counts reproduce the source percentages', () => {
  for (const rows of Object.values(results.benchmarks)) {
    expect(rows).toHaveLength(9);
    for (const row of rows) {
      expect(row.cases - row.scored).toBe(row.unresolved);
      expect(100 * row.successes / row.scored).toBeCloseTo(row.asr, 8);
    }
  }
});

test('all eight charts and exact counts are available', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await page.goto(path);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.chart-panel')).toHaveCount(8);
  await expect(page.locator('.chart-panel:visible')).toHaveAttribute('id', 'chart-llmail');
  for (const [name, rows] of Object.entries(results.benchmarks)) {
    const slug = name.toLowerCase().replaceAll(' ', '-');
    await page.locator('#benchmark').selectOption(slug);
    const panel = page.locator(`#chart-${slug}`);
    await expect(panel).toBeVisible();
    await panel.locator('img').evaluate(image => image.decode());
    await panel.locator('summary').click();
    for (const row of rows) {
      const tableRow = panel.locator('tbody tr').filter({ hasText: results.methods[row.method] });
      if (row.status === 'complete') {
        await expect(tableRow).toContainText(`${row.successes} / ${row.scored}`);
        await expect(tableRow).toContainText(`${row.asr.toFixed(2)}%`);
      } else {
        await expect(tableRow).toContainText('Pending');
      }
    }
  }
  expect(await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash))).toEqual([]);
  expect(errors).toEqual([]);
});

test('article layout and accessibility work on desktop and mobile', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(report.violations).toEqual([]);
    await page.screenshot({ path: `/tmp/injection-blog-top-${width}.png` });
    await page.locator('#results').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/injection-blog-results-${width}.png` });
  }
});

test('profile and research pages link to the blog', async ({ page }) => {
  for (const source of ['/', '/research.html']) {
    await page.goto(source);
    const link = page.locator('#prompt-injection').getByRole('link', { name: 'Read the blog' });
    await expect(link).toHaveAttribute('href', './blog/prompt-injection-data-curation.html');
    await link.click();
    await expect(page).toHaveURL(new RegExp('blog/prompt-injection-data-curation.html$'));
    await expect(page.locator('h1')).toContainText('Curating Robust Prompt Injection');
  }
});

test('AgentDojo includes the final adapter result and no pending notice', async ({ page }) => {
  const rows = results.benchmarks.AgentDojo;
  expect(rows.every(row => row.status === 'complete' && row.generated_cases === 1046)).toBe(true);
  expect(rows.find(row => row.method === 'jlens_synthetic')).toMatchObject({ successes: 49, scored: 903, unresolved: 46 });
  await page.goto(path);
  await page.locator('#benchmark').selectOption('agentdojo');
  const panel = page.locator('#chart-agentdojo');
  await panel.locator('img').evaluate(image => image.decode());
  await expect(page.locator('.blog-article')).not.toContainText('pending');
  await expect(page.locator('#tldr')).toContainText('five of the seven external benchmark comparisons');
  await panel.screenshot({ path: '/tmp/agentdojo-final-chart.png' });
});
