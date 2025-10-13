import { expect } from '@playwright/test';
import { test,navigateToInventorySystemsFunc } from './helpers/navHelpers';

test('User can navigate to the inventory page', async ({ page }) => {
  await test.step('Navigate to Inventory page', async () => {
    await navigateToInventorySystemsFunc(page);
  });
});


test('User can navigate to the Staleness and Deletion page via the menu', async ({ page }) => {
  await test.step('Navigate to Inventory page', async () => {
    await navigateToInventorySystemsFunc(page);
  });

  await test.step('Open System Configuration menu and click Staleness and Deletion', async () => {
    const sysConfigParent = page.locator('[data-quickstart-id="System-Configuration"]');
    await sysConfigParent.click();

    const stalenessLink = page.locator('[data-quickstart-id="insights_inventory_staleness-and-deletion"]');
    await stalenessLink.click();
  });

  await test.step('Verify Staleness and Deletion page is visible', async () => {
    await expect(
      page.getByRole('heading', { name: 'Staleness and Deletion' })
    ).toBeVisible({ timeout: 90000 });
    await page.waitForSelector('text=Organization level system staleness and deletion', { state: 'visible' });
  });
});


test('User can navigate to the workspaces page via the menu', async ({ page }) => {
  await test.step('Navigate to Inventory page', async () => {
    await navigateToInventorySystemsFunc(page);
  });

  await test.step('Click on Workspaces menu item and reload page', async () => {
    const WorkspacesParam = page.locator('[data-quickstart-id="insights_inventory_workspaces"]');
    await WorkspacesParam.click();
  });

  await test.step('Verify Workspaces page is visible', async () => {
    await expect(
      page.getByRole('heading', { name: 'Workspaces' })
    ).toBeVisible({ timeout: 90000 });
    await page.waitForSelector('#pagination-options-menu-bottom-bottom-toggle', { state: 'visible' });

  });
});
