import { type Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { closePopupsIfExist } from './loginHelpers';

/**
 * Navigates the browser to the Systems inventory page and waits for the
 * main 'Systems' heading to become visible.
 *  @param {Page} page - The Playwright page object
 */
export const navigateToInventorySystemsFunc = async (page: Page) => {
  await page.goto('/insights/inventory/', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible({
    timeout: 100000,
  });

  // Wait for pagination controls to appear, indicating data is loaded
  await expect(page.locator('#options-menu-bottom-toggle')).toBeVisible({
    timeout: 90000,
  });
};

/**
 * Navigates the browser to the Workspaces inventory page and waits for the
 * main 'Workspaces' heading to become visible.
 *  @param {Page} page - The Playwright page object
 */
export const navigateToWorkspacesFunc = async (page: Page) => {
  await page.goto('/insights/inventory/workspaces', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Workspaces' })).toBeVisible({
    timeout: 100000,
  });
  await expect(
    page.locator('#pagination-options-menu-bottom-bottom-toggle'),
  ).toBeVisible();
};

/**
 * Navigates the browser to the Staleness and Deletion page and waits for the
 * main 'Staleness and Deletion' heading to become visible.
 *  @param {Page} page - The Playwright page object
 */
export const navigateToStalenessPageFunc = async (page: Page) => {
  await page.goto('/insights/inventory/staleness-and-deletion', {
    timeout: 100000,
  });

  // Check if there's an error page and retry if needed
  const errorHeading = page.locator('text=Something went wrong');
  const isError = await errorHeading.isVisible().catch(() => false);

  if (isError) {
    // Retry navigation if we hit an error
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  }

  await expect(
    page.getByRole('heading', { name: 'Staleness and Deletion', exact: true }),
  ).toBeVisible({
    timeout: 100000,
  });
  await expect(
    page.getByText('Organization level system staleness and deletion'),
  ).toBeVisible({ timeout: 30000 });
};

export const test = base.extend({
  page: async ({ page }, use) => {
    await closePopupsIfExist(page); // Run before each test
    await use(page); // Pass control to the test
  },
});

/**
 * Navigates the browser to the System's details page and waits for the
 * main 'UUID' to become visible.
 *  @param {Page}   page - The Playwright page object
 *  @param {string} uuid - The system UUID to navigate to
 */
export const navigateToSystemDetails = async (page: Page, uuid: string) => {
  await page.goto(`/insights/inventory/${uuid}`);
  await expect(page.getByText(uuid)).toBeVisible();
  await expect(page.getByText('System not found')).toBeHidden();
};
