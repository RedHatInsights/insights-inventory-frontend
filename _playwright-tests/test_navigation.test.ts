import { expect } from '@playwright/test';
import { test } from './helpers/navHelpers';
import {
  BOOTC_ARCHIVE,
  prepareSingleSystem,
  cleanupTestArchive,
} from './helpers/uploadArchive';

test.describe('Navigate to Inventory pages via side Navigation bar', () => {
  const setupBootcResult = prepareSingleSystem(BOOTC_ARCHIVE);

  test.beforeEach(async ({ page }) => {
    await page.goto('/insights/inventory/');
    await page.locator('[data-quickstart-id="Inventory"]').isVisible();
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
    const systemsPageNav = page
      .locator('li[data-ouia-component-id="Systems"]')
      .locator('a[data-quickstart-id="insights_inventory"]');
    await systemsPageNav.click();
    await expect(page).toHaveURL(new RegExp(expectedURL));
  });

  test('User can switch to the Images view in Inventory page', async ({
    page,
  }) => {
    const systemsPageNav = page
      .locator('li[data-ouia-component-id="Systems"]')
      .locator('a[data-quickstart-id="insights_inventory"]');
    await systemsPageNav.click();

    await test.step('Switch to Images view', async () => {
      const imagesViewButton = page.getByRole('button', {
        name: 'View by images',
      });
      await imagesViewButton.click();
    });

    await test.step('Verify Images view is visible', async () => {
      await expect(
        page.getByRole('columnheader', { name: 'Image name' }),
      ).toBeVisible({ timeout: 10000 });
    });

    cleanupTestArchive(
      setupBootcResult.archiveName,
      setupBootcResult.workingDir,
    );
  });

  test('Use can navigate to Workspaces page', async ({ page }) => {
    const expectedURL = '/insights/inventory/workspaces';
    await page
      .locator('[data-quickstart-id="insights_inventory_workspaces"]')
      .click();
    await expect(page).toHaveURL(new RegExp(expectedURL));
  });
});
