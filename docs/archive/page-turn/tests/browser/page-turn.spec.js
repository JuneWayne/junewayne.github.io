import { test, expect } from '@playwright/test';

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
