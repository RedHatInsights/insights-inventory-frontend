// _playwright-tests/helpers/globalSetup.ts
import { FullConfig } from '@playwright/test';
import fs from 'fs';
import { setupMultipleSystems } from './uploadArchive';
import {
  BOOTC_ARCHIVE,
  GLOBAL_DATA_PATH,
  DELETE_HOSTS_PREFIX,
  PACKAGE_BASED_ARCHIVE,
} from './constants';

async function globalSetup(config: FullConfig) {
  console.log('\n--- Starting Global Setup ---');
  try {
    // systems for testing filtering, sorting, exporting, tags and staleness settings
    const packageSystems = await setupMultipleSystems(
      Array(3).fill(PACKAGE_BASED_ARCHIVE),
    );
    // systems for testing image-based specific metadata and filtering
    const bootcSystems = await setupMultipleSystems(
      Array(2).fill(BOOTC_ARCHIVE),
    );
    // systems for testing workspace-specific actions
    const workspaceSystems = await setupMultipleSystems(
      Array(3).fill(PACKAGE_BASED_ARCHIVE),
    );
    // systems specifically for bulk host deletion tests
    const deleteSystems = await setupMultipleSystems(
      Array(3).fill(PACKAGE_BASED_ARCHIVE),
      DELETE_HOSTS_PREFIX,
    );

    const systems = {
      packageSystems,
      bootcSystems,
      workspaceSystems,
      deleteSystems,
      deleteSystemsPrefix: DELETE_HOSTS_PREFIX,
    };

    fs.writeFileSync(GLOBAL_DATA_PATH, JSON.stringify(systems, null, 2));

    console.log(`--- Global Setup Completed: All systems are online. ---`);
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
