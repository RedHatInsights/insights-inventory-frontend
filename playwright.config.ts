import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './_playwright-tests/',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-ctrf/playwright-ctrf.json' }],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  timeout: 90_000,
  use: {
    actionTimeout: 90_000,
    navigationTimeout: 90_000,
    headless: true,
    baseURL: process.env.BASE_URL,
    video: 'retain-on-failure',
    trace: 'on',
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin_user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
