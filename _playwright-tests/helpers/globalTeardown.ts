// _playwright-tests/helpers/globalTeardown.ts
import { FullConfig } from '@playwright/test';
import {
  cleanupAllArchives,
  cleanupGlobalTestData,
  cleanupSessionWorkspaces,
} from './cleanup';

async function globalTeardown(config: FullConfig) {
  console.log('\n--- Starting Global Teardown ---');

  await cleanupSessionWorkspaces();
  cleanupAllArchives();
  cleanupGlobalTestData();

  console.log('--- Global Teardown Complete ---');
}

export default globalTeardown;
