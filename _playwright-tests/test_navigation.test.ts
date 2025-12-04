import { expect } from '@playwright/test';
import { test } from './helpers/navHelpers';

test.describe('Navigate to Inventry pages via side Navigation bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/insights/dashboard/');
    await page.locator('[data-quickstart-id="Inventory"]').click();
  });

  test('Use can navigate to Staleness and Deletion page', async ({ page }) => {
    const expectedURL = '/insights/inventory/staleness-and-deletion';
    await page.locator('[data-quickstart-id="System-Configuration"]').click();
    const stalenessLink = page.locator(
      '[data-quickstart-id="insights_inventory_staleness-and-deletion"]',
    );
    await stalenessLink.click();
    await expect(page).toHaveURL(new RegExp(expectedURL));
  });

  test('Use can navigate to Inventory Systems page', async ({ page }) => {
    const expectedURL = '/insights/inventory';
    await page.locator('[data-quickstart-id="insights_inventory"]').click();
    await expect(page).toHaveURL(new RegExp(expectedURL));
  });

  test('Use can navigate to Workspaces page', async ({ page }) => {
    const expectedURL = '/insights/inventory/workspaces';
    await page
      .locator('[data-quickstart-id="insights_inventory_workspaces"]')
      .click();
    await expect(page).toHaveURL(new RegExp(expectedURL));
  });
});
