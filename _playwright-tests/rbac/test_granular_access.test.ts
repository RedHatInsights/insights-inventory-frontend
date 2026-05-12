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

test.describe('@rbac Granular access:', () => {
  test('Systems page - only expected workpsaces are displayed', async ({
    page,
  }) => {
    test.fixme(true, 'https://redhat.atlassian.net/browse/RHINENG-25746');
    await navigateToInventorySystemsFunc(page);
    const firstWorkspace = page.getByRole('cell', {
      name: GRANULAR_WORKPSACE_RW,
    });
    await expect(firstWorkspace).toBeVisible({ timeout: 100000 });

    await test.step('User has access only to hosts from 2 workspaces', async () => {
      const rows = page
        .locator('[data-ouia-component-id="systems-view-table-td-0-1"]')
        .or(page.locator('td[data-label="Workspace"]'));
      await expect(rows.first()).toBeVisible({ timeout: 20000 });

      const texts = await rows.allInnerTexts();
      console.log('Workspace cells found:', texts);
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

  test('Workspaces page - only expected workpsaces are displayed', async ({
    page,
  }) => {
    await navigateToWorkspacesFunc(page);

    // Create Workpsace button is disbaled for Non admin users
    const createButton = page.locator(
      '[data-ouia-component-id="CreateGroupButton"]',
    );
    await expect(createButton).toBeDisabled();

    await test.step('User has access only to 2 workspaces', async () => {
      const firstWorkspace = page.getByRole('link', {
        name: GRANULAR_WORKPSACE_RW,
      });
      await expect(firstWorkspace).toBeVisible({ timeout: 100000 });

      const secondWorkspace = page.getByRole('link', {
        name: GRANULAR_WORKPSACE_R,
      });
      await expect(secondWorkspace).toBeVisible({ timeout: 100000 });

      const rows = page.locator('td[data-label="Name"]');
      await expect(rows.first()).toBeVisible({ timeout: 20000 });
      await expect(rows).toHaveCount(2);
    });
  });

  test('Staleness and Deletion page: no access is displayed', async ({
    page,
  }) => {
    await page.goto('/insights/inventory/staleness-and-deletion', {
      timeout: 100000,
    });

    const emptyState = page.locator('.pf-v6-c-empty-state');
    await expect(emptyState).toBeVisible({ timeout: 100000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_STALENESS);
  });
});
