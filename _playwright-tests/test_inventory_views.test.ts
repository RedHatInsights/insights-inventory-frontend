import { expect } from '@playwright/test';
import { createSystem } from './helpers/uploadArchive';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';
import { searchByName, waitForTableKebabReady } from './helpers/filterHelpers';
import { isSystemsViewEnabled } from './helpers/constants';

test.describe('Inventory Views default columns', () => {
  test('User should see default columns when navigating to Systems page', async ({
    page,
  }) => {
    /**Requirement for Inventory Views Phase 1*/

    await test.step('Navigate to Inventory → Systems', async () => {
      await navigateToInventorySystemsFunc(page);
    });

    await test.step(`Verify only default columns are displayed`, async () => {
      // Default columns from inventory/columnDefinitions.tsx
      const defaultColumns = ['Name', 'Workspace', 'Tags', 'OS', 'Last seen'];
      // Get all visible table headers (excluding checkbox/per-row action columns)
      const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });

      await expect(visibleHeaders).toHaveCount(defaultColumns.length);
      for (const columnName of defaultColumns) {
        await expect(
          page.locator('th').filter({ hasText: new RegExp(columnName) }),
        ).toBeVisible({ timeout: 10000 });
      }
    });
  });
});
