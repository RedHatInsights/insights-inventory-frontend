import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const isCI = !!process.env.CI;
const useCtrf = isCI && !!process.env.USE_CTRF; // toggle CTRF explicitly in CI

const setupAdminProject = {
  name: 'setup-admin',
  testMatch: /auth\.setup\.ts/,
  grep: /@admin-setup/,
};
const setupRbacProject = {
  name: 'setup-rbac',
  testMatch: /auth\.setup\.ts/,
  grep: /@rbac-setup/,
};

export default defineConfig({
  testDir: './_playwright-tests/',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
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
  globalTimeout: 35 * 60 * 1000, // 35 min
  timeout: 90_000,
  globalSetup: './_playwright-tests/helpers/globalSetup',
  globalTeardown: './_playwright-tests/helpers/globalTeardown',
  use: {
    actionTimeout: 90_000,
    navigationTimeout: 90_000,
    headless: true,
    baseURL: process.env.BASE_URL,
    launchOptions: { args: ['--disable-http-cache'] },
    video: 'retain-on-failure',
    trace: 'on',
    ignoreHTTPSErrors: true,
    viewport: null,
    ...(process.env.INTEGRATION === 'true'
      ? {
          ...(process.env.PROXY
            ? {
                proxy: {
                  server: process.env.PROXY,
                },
              }
            : {}),
        }
      : {}),
  },
  projects: [
    setupAdminProject,
    setupRbacProject,
    {
      name: 'E2E',
      testIgnore: '**/rbac/**',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin_user.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'E2E RBAC',
      testDir: './_playwright-tests/rbac/',
      testMatch:
        /test_(viewer_role_access|granular_access|no_access)\.test\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup-rbac'],
    },
  ],
});
