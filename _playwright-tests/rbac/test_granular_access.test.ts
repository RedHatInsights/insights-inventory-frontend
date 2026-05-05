import { test } from '../helpers/fixtures';
import { expect } from '@playwright/test';
import {
  navigateToInventorySystemsFunc,
  navigateToStalenessPageFunc,
  navigateToWorkspacesFunc,
} from '../helpers/navHelpers';
import {
  GRANULAR_WORKPSACE_R,
  GRANULAR_WORKPSACE_RW,
  NO_ACCESS_STALENESS,
} from './constants';

test.use({ storageState: '.auth/granular_user.json' });

test.describe('Granular access: 2 workspaces only @rbac', () => {
  test('Systems page', async ({ page }) => {
    await navigateToInventorySystemsFunc(page);
    const rows = page
      .locator('[data-ouia-component-id="systems-view-table-td-0-1"]')
      .or(page.locator('td[data-label="Workspace"]'));
    await expect(rows.first()).toBeVisible({ timeout: 20000 });

    await test.step('User has access only to hosts from 2 workspaces', async () => {
      const texts = await rows.allInnerTexts();
      for (const text of texts) {
        const isMatch =
          text.includes(GRANULAR_WORKPSACE_RW) ||
          text.includes(GRANULAR_WORKPSACE_R);
        expect(isMatch).toBe(true);
      }
    });
  });

  test('Bulk actions should be disabled when hosts with different permissons are selected', async ({
    page,
  }) => {
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

    const rows = page.locator('td[data-label="Name"]');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });

    await test.step('User has access only to 2 workspaces', async () => {
      await expect(rows).toHaveCount(2);
      const texts = await rows.allInnerTexts();
      for (const text of texts) {
        const isMatch =
          text.includes(GRANULAR_WORKPSACE_RW) ||
          text.includes(GRANULAR_WORKPSACE_R);
        expect(isMatch).toBe(true);
      }
    });
  });

  test('Staleness and Deletion page', async ({ page }) => {
    await page.goto('/insights/inventory/staleness-and-deletion', {
      timeout: 100000,
    });

    const emptyState = page.locator('.pf-v6-c-empty-state');
    await expect(emptyState).toBeVisible({ timeout: 100000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_STALENESS);

    // TODO: uncomment when RBAC v2 check is resolved
    // const editButton = page.getByRole('button', { name: 'Edit' });
    // await expect(editButton).toBeDisabled();
  });
});
