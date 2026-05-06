import { test } from '../helpers/fixtures';
import { expect } from '@playwright/test';
import {
  navigateToInventorySystemsFunc,
  navigateToStalenessPageFunc,
  navigateToWorkspacesFunc,
} from '../helpers/navHelpers';
import { searchByName } from '../helpers/filterHelpers';

test.use({ storageState: '.auth/viewer_user.json' });

test.describe('Viewer: read permissions only @rbac', () => {
  test('Systems page', async ({ page }) => {
    await navigateToInventorySystemsFunc(page);
    const nameCell = page
      .locator('[data-ouia-component-id="systems-view-table-td-0-0"]')
      .or(page.locator('td[data-label="Name"]'));
    await expect(nameCell.first()).toBeVisible({ timeout: 20000 });

    await test.step('Per-row actions should be disabled', async () => {
      await page.getByRole('button', { name: 'Kebab toggle' }).first().click();
      const menuItems = page
        .locator('button.inventory__action-menu-item')
        .getByRole('menuitem');

      for (const item of await menuItems.all()) {
        await expect(item).toHaveAttribute('aria-disabled', 'true');
      }
    });
  });

  test('Bulk actions should be disabled', async ({ page }) => {
    test.fixme(true, 'https://redhat.atlassian.net/browse/RHINENG-25746');
    await page.locator('[data-ouia-component-id="BulkSelect"]').click();
    await page.getByRole('menuitem', { name: 'Select page' }).click();

    const bulkDeleteBtn = page.locator(
      '[data-ouia-component-id="bulk-delete-button"]',
    );
    await expect(bulkDeleteBtn).toBeDisabled();

    await page.locator('[data-ouia-component-id="BulkActionsToggle"]').click();
    const menu = page.locator('[data-ouia-component-id="BulkActionsList"]');
    const items = menu.locator('button.inventory__action-menu-item');
    await expect(items.nth(0)).toHaveAttribute('aria-disabled', 'true'); // Add to workspace
    await expect(items.nth(1)).toHaveAttribute('aria-disabled', 'true'); // Remove from workspace
  });

  test('Workspaces page', async ({ page }) => {
    await navigateToWorkspacesFunc(page);

    // Create Workpsace button is disbaled for Non admin users
    const createButton = page.locator(
      '[data-ouia-component-id="CreateGroupButton"]',
    );
    await expect(createButton).toBeDisabled();

    await test.step('Per-row actions should be disabled', async () => {
      const nameCell = page.locator('td[data-label="Name"]');
      await expect(nameCell.first()).toBeVisible({ timeout: 20000 });

      await page.getByRole('button', { name: 'Kebab toggle' }).first().click();
      const menuItems = page
        .locator('button.inventory__action-menu-item')
        .getByRole('menuitem');

      for (const item of await menuItems.all()) {
        await expect(item).toHaveAttribute('aria-disabled', 'true');
      }
    });
  });

  test('Staleness and Deletion page', async ({ page }) => {
    await navigateToStalenessPageFunc(page);

    const editButton = page.getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeDisabled();
  });
});
