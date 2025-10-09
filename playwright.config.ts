import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const isCI = !!process.env.CI;
const useCtrf = isCI && !!process.env.USE_CTRF; // toggle CTRF explicitly in CI

export default defineConfig({
  testDir: './_playwright-tests/',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 2,
  reporter: isCI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        useCtrf
          ? [
              'playwright-ctrf-json-reporter',
              {
                outputDir: 'playwright-ctrf',
                outputFile: 'playwright-ctrf.json',
              },
            ]
          : ['json', { outputFile: 'playwright-ctrf/playwright-ctrf.json' }],
        ['@currents/playwright'],
      ]
    : 'list',
  timeout: 120_000,
  use: {
    actionTimeout: 120_000,
    navigationTimeout: 120_000,
    headless: true,
    baseURL: process.env.BASE_URL,
    video: 'retain-on-failure',
    trace: 'on',
    ignoreHTTPSErrors: true,
    viewport: null,
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
