import { test } from '../helpers/fixtures';
import { expect } from '@playwright/test';
import {
  navigateToInventorySystemsFunc,
  navigateToStalenessPageFunc,
  navigateToWorkspacesFunc,
} from '../helpers/navHelpers';

test.use({ storageState: '.auth/viewer_user.json' });

test.describe('Viewer: read permissions only @rbac', () => {
  test('Systems page', async ({ page }) => {
    await navigateToInventorySystemsFunc(page);
    const nameCell = page.locator('td[data-label="Name"]');
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

    await test.step('Bulk actions should be disabled', async () => {
      await page.locator('[data-ouia-component-id="BulkSelect"]').click();
      await page.getByRole('menuitem', { name: 'Select page' }).click();

      const bulkDeleteBtn = page.locator(
        '[data-ouia-component-id="bulk-delete-button"]',
      );
      await expect(bulkDeleteBtn).toBeDisabled();

      await page
        .locator('[data-ouia-component-id="BulkActionsToggle"]')
        .click();
      const menu = page.locator('[data-ouia-component-id="BulkActionsList"]');
      const items = menu.locator('button.inventory__action-menu-item');
      await expect(items.nth(0)).toHaveAttribute('aria-disabled', 'true'); // Add to workspace
      await expect(items.nth(1)).toHaveAttribute('aria-disabled', 'true'); // Remove from workspace
    });
  });

  test('System Details page', async ({ page }) => {
    const NAME_ID = 'centos';
    const URL_DETAILS =
      '/insights/inventory/b7b2f60b-d80e-47a6-9a07-110aba29e90c';

    await test.step("Navigate to system's details page", async () => {
      await page.goto(URL_DETAILS, { timeout: 100000 });
      const heading = page.getByRole('heading', { level: 1 }).first();
      await expect(heading).toBeVisible({ timeout: 100000 });
      await expect(heading).toContainText(NAME_ID);
    });

    await test.step('Delete and Edit buttons should be disbaled', async () => {
      const deleteButton = page.getByRole('button', { name: 'Delete' });
      await expect(deleteButton).toBeDisabled();

      const allEditButtons = page.getByRole('button', { name: 'Edit' });
      await expect(allEditButtons).toHaveCount(2);

      for (const button of await allEditButtons.all()) {
        await expect(button).toBeDisabled();
      }
    });
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
