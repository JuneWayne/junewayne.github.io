import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const results = JSON.parse(readFileSync(new URL('../../assets/blog/injection-defense/results.json', import.meta.url)));
const path = '/blog/prompt-injection-data-curation.html';

test('subliminal learning is presented as a proposed experiment', async ({ page }) => {
  await page.goto(`${path}#subliminal-learning`);
  await expect(page.locator('#subliminal-learning')).toBeVisible();
  await expect(page.locator('#limitations')).toContainText('this dataset was not used to fine-tune the eight Qwen2.5-7B adapters');
  await expect(page.locator('#limitations')).toContainText('These remain questions for a separate experiment');
  await expect(page.locator('#ref-subliminal a').first()).toHaveAttribute('href', 'https://www.nature.com/articles/s41586-026-10319-8');
});

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
  await expect(page.locator('#tldr')).toContainText('five of seven external benchmark comparisons');
  await panel.screenshot({ path: '/tmp/agentdojo-final-chart.png' });
});

test('LaTeX equations render with accessible math and local fonts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await page.goto(path);
  await expect(page.locator('.math-display .katex-display')).toHaveCount(4);
  await expect(page.locator('.katex-error, .math:not(:has(.katex))')).toHaveCount(0);
  expect(await page.locator('.math').count()).toBeGreaterThan(20);
  expect(await page.locator('math').count()).toBe(await page.locator('.math').count());
  await expect(page.locator('.math-display').last().locator('annotation')).toContainText('\\sum_{t=1}^{T}');
  expect(await page.locator('mfrac').count()).toBeGreaterThanOrEqual(4);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('16px KaTeX_Main'))).toBe(true);
  expect(await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => new URL(entry.name).origin !== location.origin).map(entry => entry.name))).toEqual([]);
  expect(errors).toEqual([]);
});

test('equations fit desktop and scroll within their boxes on small screens', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('details.explanation').evaluateAll(items => items.forEach(item => { item.open = true; }));
    const formulas = page.locator('.math-display');
    for (let index = 0; index < await formulas.count(); index++) {
      const formula = formulas.nth(index);
      const layout = await formula.evaluate(element => {
        const box = element.getBoundingClientRect();
        const math = element.querySelector('.katex-display').getBoundingClientRect();
        return { left: box.left, right: box.right, mathLeft: math.left, overflow: element.scrollWidth > element.clientWidth };
      });
      expect(layout.left).toBeGreaterThanOrEqual(0);
      expect(layout.right).toBeLessThanOrEqual(width);
      expect(layout.mathLeft).toBeGreaterThanOrEqual(layout.left);
      if (width === 1440) expect(layout.overflow).toBe(false);
      await formula.locator('..').screenshot({ path: `/tmp/blog-equation-${index}-${width}.png` });
    }
  }
});

test('figures have stable numbers and matching references', async ({ page }) => {
  await page.goto(path);
  const figures = await page.locator('.blog-article figure').evaluateAll(items => items.map(figure => ({
    id: figure.id,
    number: Number(figure.dataset.figureNumber),
    caption: figure.querySelector('.figure-number')?.textContent,
  })));
  expect(figures).toHaveLength(16);
  expect(new Set(figures.map(figure => figure.id)).size).toBe(16);
  for (const [index, figure] of figures.entries()) {
    expect(figure.number).toBe(index + 1);
    expect(figure.caption).toBe(`Figure ${index + 1}.`);
    const reference = page.locator(`.figure-reference[href="#${figure.id}"]`);
    await expect(reference).toHaveText(`Figure ${index + 1}`);
    await expect(reference.locator('..')).toContainText('According to the figure above');
  }
  await expect(page.locator('#training')).toContainText('90% of the previous center with 10% of the new average');
  await expect(page.locator('#training')).toContainText('separately initialized adapters');
  await expect(page.locator('.blog-article')).not.toContainText('fresh adapter');
  await expect(page.locator('.pipeline')).toHaveCount(0);
});

test('figure links open the requested benchmark', async ({ page }) => {
  await page.goto(`${path}#figure-agentdojo`);
  await expect(page.locator('#benchmark')).toHaveValue('agentdojo');
  await expect(page.locator('#chart-agentdojo')).toBeVisible();
  // The hash can stay the same when another benchmark is selected manually
  await page.locator('#benchmark').selectOption('fipi');
  await page.evaluate(() => document.querySelector('a[href="#figure-agentdojo"]').click());
  await expect(page.locator('#chart-agentdojo')).toBeVisible();
  await page.evaluate(() => { location.hash = 'figure-bipia'; });
  await expect(page.locator('#benchmark')).toHaveValue('bipia');
  await expect(page.locator('#chart-bipia')).toBeVisible();
});

test('explanatory figures stay readable at narrow and wide widths', async ({ page }) => {
  const ids = ['data-selection', 'selection-score', 'jlens-readout', 'injection-center', 'reference-training', 'token-loss'];
  for (const width of [390, 720, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('details.explanation').evaluateAll(items => items.forEach(item => { item.open = true; }));
    for (const id of ids) {
      const figure = page.locator(`#figure-${id}`);
      expect(await figure.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await figure.screenshot({ path: `/tmp/blog-figure-${id}-${width}.png` });
    }
  }
});


test('tool evidence and equation definitions match the edited article', async ({ page }) => {
  const examples = JSON.parse(readFileSync(new URL('../../assets/blog/injection-defense/examples.json', import.meta.url)));
  await page.goto(path);
  const article = page.locator('.blog-article');
  await expect(article).not.toContainText('insert an example');
  await expect(article).not.toContainText('Rahman');
  await expect(page.locator('#evaluator-example')).toHaveText('How the evaluator catches an unauthorized action');
  await expect(page.locator('#example .attack-action')).toHaveCount(5);
  await expect(page.locator('#results .evaluator-match')).toHaveCount(4);
  expect(examples.business.score.attacker_goal_reached).toBe(true);
  expect(examples.business.score.repetition).toBe(false);
  expect(examples.business.replayed_tool_results[0].accepted).toBe(true);
  const toolBox = page.locator('#example .prompt-example').last().locator('pre');
  await expect(toolBox).toHaveText(examples.business.tool_request);
  for (const selector of ['base', 'reference_only_update_256']) {
    await expect(page.locator('#training pre').filter({ hasText: examples.fipi[selector].response })).toHaveCount(1);
  }
  await expect(page.locator('.equation')).toHaveCount(4);
  for (const equation of await page.locator('.equation').all()) {
    expect(await equation.locator('.definition').count()).toBeGreaterThan(1);
    for (const definition of await equation.locator('.definition').all()) {
      await expect(definition.locator('.math')).toHaveCount(1);
      expect(await definition.evaluate(element => getComputedStyle(element).display)).toBe('block');
    }
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('#evaluator-example').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/blog-evaluator-${width}.png` });
    await page.locator('#benchmark').selectOption('agentdojo');
    await page.locator('#chart-agentdojo').screenshot({ path: `/tmp/blog-main-chart-${width}.png` });
  }
});

test('charts have a main title without the previous visible subtitle', () => {
  for (const slug of ['fipi', 'llmail', 'synthetic-business', 'bipia', 'agentdyn', 'agentlab', 'injecagent', 'agentdojo', 'selection-example', 'detector-accuracy', 'training-objectives']) {
    const svg = readFileSync(new URL(`../../assets/blog/injection-defense/${slug}.svg`, import.meta.url), 'utf8');
    expect(svg).not.toContain('<text x="20" y="60"');
    expect(svg).toContain('<title id="title">');
    expect(svg).toContain('<desc id="desc">');
  }
});


test('plain labels, original prompts, and optional objective explanations', async ({ page }) => {
  await page.goto(path);
  const article = page.locator('.blog-article');
  const prose = await article.innerText();
  expect(prose).not.toMatch(/legitimate\s+user instruction|supplied\s+content/i);
  await expect(page.locator('#fipi')).toContainText('Our experiment uses their FIPI dataset, not the Rennervate defense');
  await expect(page.locator('#fipi-original-prompt pre')).toContainText('A herculean task lies ahead');
  for (const id of ['explain-injection-center', 'explain-reference-training']) {
    await expect(page.locator(`#${id}`)).not.toHaveAttribute('open');
    await page.locator(`#${id} > summary`).click();
    await expect(page.locator(`#${id}`)).toHaveAttribute('open');
    await page.locator(`#${id} > summary`).click();
  }
  await expect(page.locator('#the-controlled-objective-comparison')).toBeVisible();
  await page.goto(`${path}#figure-token-loss`);
  await expect(page.locator('#explain-reference-training')).toHaveAttribute('open');
  await expect(page.locator('#figure-token-loss')).toBeVisible();
  await page.goto(`${path}#business-original-prompt`);
  await expect(page.locator('#business-original-prompt')).toHaveAttribute('open');
  await expect(page.locator('#business-original-prompt')).toContainText('As requested, we have successfully terminated');
  expect(await page.locator('#business-original-prompt').innerText()).not.toMatch(/@cisco|@telefonica|Pedro|Hoxha|Macarrone/);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${path}#training`);
    await page.reload();
    await expect(page.locator('#explain-reference-training')).not.toHaveAttribute('open');
    await page.locator('#explain-injection-center').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/blog-objective-disclosures-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
