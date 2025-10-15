import { type Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { closePopupsIfExist } from './loginHelpers';

/**
 * Navigates the browser to the Systems inventory page and waits for the
 * main 'Systems' heading to become visible.
 *  @param page
 */
export const navigateToInventorySystemsFunc = async (page: Page) => {
  await page.goto('/insights/inventory/', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible({
    timeout: 100000,
  });
  await page.waitForSelector('#options-menu-bottom-toggle', {
    state: 'visible',
  });
};

/**
 * Navigates the browser to the Workspaces inventory page and waits for the
 * main 'Workspaces' heading to become visible.
 *  @param page
 */
export const navigateToWorkspacesFunc = async (page: Page) => {
  await page.goto('/insights/inventory/workspaces', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Workspaces' })).toBeVisible({
    timeout: 100000,
  });
  await page.waitForSelector('#pagination-options-menu-bottom-bottom-toggle', {
    state: 'visible',
  });
};

export const test = base.extend({
  page: async ({ page }, use) => {
    await closePopupsIfExist(page); // Run before each test
    await use(page); // Pass control to the test
  },
});
export const navigateToSystemDetails = async (page: Page, uuid: string) => {
  await page.goto(`/insights/inventory/${uuid}`);
  await expect(page.getByText(uuid)).toBeVisible();
  await expect(page.getByText('System not found')).toBeHidden();
};
