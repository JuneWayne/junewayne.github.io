import { defineConfig } from '@playwright/test';

// A temporary browser location keeps downloads outside the source tree.
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/tmp/ethan-site-browsers';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
});
