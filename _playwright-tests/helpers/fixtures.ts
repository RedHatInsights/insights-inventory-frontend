import { test as base } from '@playwright/test';
import fs from 'fs';
import { closePopupsIfExist } from './loginHelpers';
import { GLOBAL_DATA_PATH, WORKSPACE_WITH_SYSTEMS } from './constants';
import { System, createSystem } from './uploadArchive';
import {
  getOrCreateWorkspace,
  getHostIdByHostname,
  addHostToWorkspace,
} from './apiHelpers';

type SystemsTestData = {
  packageSystems: System[];
  bootcSystems: System[];
  workspaceSystems: System[];
  deleteSystems: System[];
  deleteSystemsPrefix: string;
};

/**
 * Data provided by the workspaceWithSystem fixture.
 */
export type WorkspaceWithSystemFixture = {
  workspaceId: string;
  workspaceName: string;
  system: System;
  hostId: string;
};

/**
 * Safely loads and validates the global test data file.
 *  @param path
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
  workspaceWithSystem: WorkspaceWithSystemFixture;
}>({
  page: async ({ page }, use) => {
    await closePopupsIfExist(page);
    await use(page);
  },

  systems: async ({}, use) => {
    const data = loadGlobalSystemsData(GLOBAL_DATA_PATH);
    await use(data);
  },

  /**
   * Fixture that ensures WORKSPACE_WITH_SYSTEMS exists and has a dedicated
   * system for this test. Each test gets its own unique system to avoid
   * conflicts in parallel execution.
   *  @param use
   *  @param testInfo
   */
  workspaceWithSystem: async ({}, use, testInfo) => {
    // Create a unique system for this test
    const uniquePrefix = `ws-sys-${testInfo.workerIndex}`;
    console.log(`Creating system with prefix "${uniquePrefix}" for test...`);
    const system = await createSystem(undefined, uniquePrefix);
    console.log(`System created: ${system.hostname}`);

    // Ensure workspace exists
    const workspaceId = await getOrCreateWorkspace(WORKSPACE_WITH_SYSTEMS);
    console.log(`Workspace "${WORKSPACE_WITH_SYSTEMS}" ready: ${workspaceId}`);

    // Wait for system to appear in inventory and get its ID
    const hostId = await getHostIdByHostname(system.hostname);
    console.log(`Host ID resolved: ${hostId}`);

    // Add system to workspace
    await addHostToWorkspace(workspaceId, hostId);
    console.log(`System added to workspace "${WORKSPACE_WITH_SYSTEMS}"`);

    // Provide fixture data to test
    await use({
      workspaceId,
      workspaceName: WORKSPACE_WITH_SYSTEMS,
      system,
      hostId,
    });

    // No cleanup - systems expire naturally via staleness policy
  },
});
