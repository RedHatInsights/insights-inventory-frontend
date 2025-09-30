import { type Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { closePopupsIfExist } from './loginHelpers';

export const navigateToInventoryFunc = async (page: Page) => {
  await page.goto('/insights/inventory/', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible({ timeout: 100000 });
};

export const navigateToWorkspacesFunc = async (page: Page) => {
  await page.goto('/insights/inventory/workspaces', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Workspaces' })).toBeVisible({ timeout: 100000 });
};

export const test = base.extend({
  page: async ({ page }, use) => {
    await closePopupsIfExist(page); // Run before each test
    await use(page); // Pass control to the test
  },
});
