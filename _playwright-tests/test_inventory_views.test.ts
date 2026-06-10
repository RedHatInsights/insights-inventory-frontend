import { expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';

test.describe('Inventory Views default columns', () => {
  test('User should see only default columns when navigating to Systems page', async ({
    page,
  }) => {
    await test.step('Navigate to Inventory → Systems', async () => {
      await navigateToInventorySystemsFunc(page);
    });

    await test.step(`Verify only default columns are displayed`, async () => {
      // Default columns from inventory/columnDefinitions.tsx
      const defaultContentColumns = [
        'Name',
        'Workspace',
        'Tags',
        'OS',
        'Last seen',
      ];
      // Total columns includes checkbox (first) and per-row actions (last)
      const totalExpectedColumns = defaultContentColumns.length + 2;
      const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
      await expect(visibleHeaders).toHaveCount(totalExpectedColumns);

      for (const columnName of defaultContentColumns) {
        await expect(
          page.locator('th').filter({ hasText: new RegExp(columnName) }),
        ).toBeVisible({ timeout: 10000 });
      }
    });
  });
});
