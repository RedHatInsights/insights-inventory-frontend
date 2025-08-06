import { test, expect } from '@playwright/test';

import { navigateToInventoryFunc } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/loginHelpers';

test('User can navigate to the inventory page', async ({ page }) => {
  // Optionally close any modals/popups before navigating
  await closePopupsIfExist(page);
  // Navigate directly to the inventory page
  await navigateToInventoryFunc(page);
});


test('User can navigate to the Staleness and Deletion page via the menu', async ({ page }) => {
  // Optionally close any modals/popups before navigating
  await closePopupsIfExist(page);
 
  // Navigate directly to the inventory page
  await navigateToInventoryFunc(page);

  const sysConfigParent = page.locator('text=System Configuration').locator('..');
  await sysConfigParent.click();
 
  const stalenessLink = page.locator('text=Staleness and Deletion');
  await stalenessLink.click();

  await expect(page.getByRole('heading', { name: 'Staleness and Deletion' })).toBeVisible({ timeout: 90000 });

});


test('User can navigate to the workspaces page via the menu', async ({ page }) => {
  // Optionally close any modals/popups before navigating
  await closePopupsIfExist(page);
 
  // Navigate directly to the inventory page
  await navigateToInventoryFunc(page);
  // await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible({ timeout: 20000 });

  const WorkspacesParam = page.locator('text=Workspaces').locator('..');
  await WorkspacesParam.click();

  await expect(page.getByRole('heading', { name: 'Workspaces' })).toBeVisible({ timeout: 90000 });

});
