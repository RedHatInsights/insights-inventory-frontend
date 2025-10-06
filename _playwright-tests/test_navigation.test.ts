import { expect } from '@playwright/test';
import { test,navigateToInventoryFunc } from './helpers/navHelpers';

test('User can navigate to the inventory page', async ({ page }) => {
  await test.step('Navigate to Inventory page', async () => {
    await navigateToInventoryFunc(page);
  });
});


test('User can navigate to the Staleness and Deletion page via the menu', async ({ page }) => {
  await test.step('Navigate to Inventory page', async () => {
    await navigateToInventoryFunc(page);
  });

  await test.step('Open System Configuration menu and click Staleness and Deletion', async () => {
    const sysConfigParent = page.locator('text=System Configuration').locator('..');
    await sysConfigParent.click();

    const stalenessLink = page.locator('text=Staleness and Deletion');
    await stalenessLink.click();
  });

  await test.step('Verify Staleness and Deletion page is visible', async () => {
    await expect(
      page.getByRole('heading', { name: 'Staleness and Deletion' })
    ).toBeVisible({ timeout: 90000 });
  });
});


test('User can navigate to the workspaces page via the menu', async ({ page }) => {
  await test.step('Navigate to Inventory page', async () => {
    await navigateToInventoryFunc(page);
  });

  await test.step('Click on Workspaces menu item and reload page', async () => {
    const WorkspacesParam = page.locator('[data-ouia-component-id="Workspaces"]');
    await WorkspacesParam.click();
    await page.reload({ waitUntil: 'networkidle' });
  });

  await test.step('Verify Workspaces page is visible', async () => {
    await expect(
      page.getByRole('heading', { name: 'Workspaces' })
    ).toBeVisible({ timeout: 90000 });
  });
});
