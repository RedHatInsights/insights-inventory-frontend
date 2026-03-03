import { test as base } from '@playwright/test';
import fs from 'fs';
import { closePopupsIfExist } from './loginHelpers';
import { GLOBAL_DATA_PATH } from './constants';
import { System } from './uploadArchive';

type SystemsTestData = {
  packageSystems: System[];
  bootcSystems: System[];
  workspaceSystems: System[];
  deleteSystems: System[];
  deleteSystemsPrefix: string;
};

/**
 * Safely loads and validates the global test data file.
 */
function loadGlobalSystemsData(path: string): SystemsTestData {
  if (!fs.existsSync(path)) {
    throw new Error(`Global data file missing at "${path}".`);
  }

  try {
    const rawData = fs.readFileSync(path, 'utf-8');
    return JSON.parse(rawData) as SystemsTestData;
  } catch (err) {
    throw new Error(`Failed to parse JSON at "${path}".`);
  }
}

export const test = base.extend<{
  systems: SystemsTestData;
}>({
  page: async ({ page }, use) => {
    await closePopupsIfExist(page);
    await use(page);
  },

  systems: async ({}, use) => {
    const data = loadGlobalSystemsData(GLOBAL_DATA_PATH);
    await use(data);
  },
});
