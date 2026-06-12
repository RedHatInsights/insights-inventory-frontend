import { expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';

test.describe(
  'Inventory Views default columns',
  { tag: ['@inventory-views'] },
  () => {
    test('User should see only default columns when navigating to Systems page', async ({
      page,
    }) => {
      await test.step('Navigate to Inventory → Systems', async () => {
        await navigateToInventorySystemsFunc(page);
      });

      await test.step(`Verify only default columns are displayed`, async () => {
        // Total columns includes checkbox (first) and per-row actions (last)
        const totalExpectedColumns = totalDefaultColumns;
        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(totalExpectedColumns);

        for (const columnName of defaultContentColumns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(columnName) }),
          ).toBeVisible({ timeout: 10000 });
        }
      });
    },
  );
});

test.describe('Inventory Views application columns', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToInventorySystemsFunc(page);
    // Ensure we're starting with default columns only
    const totalExpectedColumns = defaultContentColumns.length + 2;
    const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
    await expect(visibleHeaders).toHaveCount(totalExpectedColumns);
  });

  test(
    'User can enable Advisor columns via Manage Columns',
    { tag: ['@inventory-views'] },
    async ({ page }) => {
      await test.step(`Open Manage Columns and apply Advisor columns`, async () => {
        await expect(async () => {
          await expect(
            page.locator('[data-ouia-component-id="SkeletonTable"]'),
          ).toBeHidden();

          const toolbarActionsButton = page.locator(
            "[data-ouia-component-id='systems-view-toolbar-actions-menu-dropdown-toggle']",
          );
          await expect(toolbarActionsButton).toBeVisible();
          await expect(toolbarActionsButton).toBeEnabled();
          await toolbarActionsButton.click();

          const manageColumnsButton = page
            .locator('button')
            .filter({ hasText: 'Manage columns' });
          await expect(manageColumnsButton).toBeEnabled();
          await manageColumnsButton.click();
        }).toPass({ timeout: 45000 });

        await page.getByLabel('Recommendations').check();

        await page.pause();
        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(totalDefaultColumns);

        for (const columnName of defaultContentColumns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(columnName) }),
          ).toBeVisible({ timeout: 10000 });
        }
      });
    },
  );
});
