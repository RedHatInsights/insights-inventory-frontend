import { expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';
import {
  totalDefaultColumns,
  defaultInventoryColumns,
  openManageColumnsModal,
  advisorColumns,
  complianceColumns,
  patchColumns,
  malwareColumns,
  inventoryColumns,
} from './helpers/columnHelpers';

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

      await test.step(`Verify only default appColumns are displayed`, async () => {
        // Total appColumns includes checkbox (first) and per-row actions (last)
        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(totalDefaultColumns);

        for (const columnName of defaultInventoryColumns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(columnName) }),
          ).toBeVisible({ timeout: 10000 });
        }
      });
    });
  },
);

test.describe('Inventory Views application columns', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToInventorySystemsFunc(page);
    // Ensure we're starting with default columns only
    const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
    await expect(visibleHeaders).toHaveCount(totalDefaultColumns);
  });

  const columnTestCases = [
    { name: 'Advisor', appColumns: advisorColumns },
    { name: 'Compliance', appColumns: complianceColumns },
    { name: 'Patch', appColumns: patchColumns },
    { name: 'Malware', appColumns: malwareColumns },
    { name: 'Inventory', appColumns: inventoryColumns },
  ];

  const columnSortableTestCases = [
    {
      name: 'Advisor',
      appColumns: [{ name: 'Recommendations' }, { name: 'Incidents' }],
    },
    {
      name: 'Compliance',
      appColumns: [{ name: 'Last compliance scan' }],
    },
    {
      name: 'Patch',
      appColumns: [{ name: 'Installable advisories' }],
    },
    {
      name: 'Malware',
      appColumns: [{ name: 'Last malware scan' }],
    },
    {
      name: 'Inventory',
      appColumns: [{ name: 'Status' }],
    },
  ];

  for (const { name, appColumns } of columnTestCases) {
    test(
      `User can enable ${name} columns via Manage Columns`,
      { tag: ['@inventory-views'] },
      async ({ page }) => {
        const dialog = page.locator(
          '[data-ouia-component-id="ColumnManagementModal"]',
        );

        await test.step(`Open Manage Columns and apply ${name} columns`, async () => {
          await openManageColumnsModal(page);

          for (const columnName of appColumns) {
            await dialog.getByLabel(columnName, { exact: true }).check();
            await expect(
              dialog.getByLabel(columnName, { exact: true }),
            ).toBeChecked();
          }
          // Verify it is applied by checking the "X selected" text in the dialog
          const selected = dialog.locator(
            '[data-ouia-component-id="BulkSelect-text"]',
          );
          const totalModifiedColumns =
            defaultInventoryColumns.length + appColumns.length;
          await expect(selected).toHaveText(`${totalModifiedColumns} selected`);
        });

        await test.step(`Verify ${name} columns are applied on systems table`, async () => {
          await dialog.getByRole('button', { name: 'Save' }).click();
          await expect(dialog).toBeHidden();

          const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
          await expect(visibleHeaders).toHaveCount(
            totalDefaultColumns + appColumns.length,
          );

          for (const columnName of [
            ...defaultInventoryColumns,
            ...appColumns,
          ]) {
            await expect(
              page.locator('th').filter({ hasText: new RegExp(columnName) }),
            ).toBeVisible({ timeout: 10000 });
          }
        });
      },
    );
  }

  for (const { name, appColumns } of columnSortableTestCases) {
    test(
      `User can sort by ${name} columns`,
      { tag: ['@inventory-views'] },
      async ({ page }) => {
        const dialog = page.locator(
          '[data-ouia-component-id="ColumnManagementModal"]',
        );

        await test.step(`Open Manage Columns and apply ${name} columns`, async () => {
          await openManageColumnsModal(page);

          // For Inventory columns, unselect some default columns to reduce table width
          const columnsToUnselect = ['OS', 'Last seen', 'Tags', 'Workspace'];
          for (const columnName of columnsToUnselect) {
            await dialog.getByLabel(columnName, { exact: true }).uncheck();
            await expect(
              dialog.getByLabel(columnName, { exact: true }),
            ).not.toBeChecked();
          }

          for (const column of appColumns) {
            await dialog.getByLabel(column.name, { exact: true }).check();
            await expect(
              dialog.getByLabel(column.name, { exact: true }),
            ).toBeChecked();
          }

          await dialog.getByRole('button', { name: 'Save' }).click();
          await expect(dialog).toBeHidden();

          const expectedColumnCount =
            totalDefaultColumns + appColumns.length - 4; // -4 for unselected columns

          const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
          await expect(visibleHeaders).toHaveCount(expectedColumnCount);
        });

        // Test sorting for each column in the app
        for (const column of appColumns) {
          await test.step(`Sort by ${column.name} in ascending order`, async () => {
            const columnHeader = page
              .locator('button.pf-v6-c-table__button')
              .filter({ hasText: new RegExp(`^${column.name}$`) });
            await expect(columnHeader).toBeVisible();

            // Click until we reach ascending sort (max 3 clicks)
            for (let attempt = 0; attempt < 3; attempt++) {
              const currentSort = await columnHeader
                .locator('..')
                .getAttribute('aria-sort');

              if (currentSort === 'ascending') {
                break;
              }

              await columnHeader.click();
              await expect(page).toHaveURL(/order_by=|sort=/);
            }

            // Verify we reached ascending sort
            await expect(async () => {
              const finalSort = await columnHeader
                .locator('..')
                .getAttribute('aria-sort');
              expect(finalSort).toBe('ascending');
            }).toPass({ timeout: 5000 });
          });

          await test.step(`Sort by ${column.name} in descending order`, async () => {
            const columnHeader = page
              .locator('button.pf-v6-c-table__button')
              .filter({ hasText: new RegExp(`^${column.name}$`) });

            await columnHeader.click();
            await expect(page).toHaveURL(/order_by=|sort=/);

            // Verify descending sort
            await expect(async () => {
              const finalSort = await columnHeader
                .locator('..')
                .getAttribute('aria-sort');
              expect(finalSort).toBe('descending');
            }).toPass({ timeout: 5000 });
          });
        }
      },
    );
  }
});
