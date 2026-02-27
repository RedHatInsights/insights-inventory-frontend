// _playwright-tests/helpers/globalTeardown.ts
import { FullConfig } from '@playwright/test';
import { cleanupAllArchives, cleanupGlobalTestData } from './cleanup';

async function globalTeardown(config: FullConfig) {
  console.log('\n--- Starting Global Teardown ---');

  cleanupAllArchives();
  cleanupGlobalTestData();

  console.log('--- Global Teardown Complete ---');
}

export default globalTeardown;
