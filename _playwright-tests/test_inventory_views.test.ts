import { expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';
import { columnManagementModal } from './helpers/columnManagementModal';
import {
  totalDefaultColumns,
  defaultInventoryColumns,
  advisorColumns,
  complianceColumns,
  patchColumns,
  malwareColumns,
  inventoryColumns,
  vulnerabilityColumns,
  validateDataColumnSortOrder,
  validateSortDirection,
  scrollColumnIntoView,
  scrollTableToPosition,
  isTableHorizontallyScrollable,
  allColumns,
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
    { name: 'Vulnerability', appColumns: vulnerabilityColumns },
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
    {
      name: 'Vulnerability',
      appColumns: [
        { name: 'Total CVEs' },
        { name: 'Critical CVEs' },
        { name: 'Important CVEs' },
      ],
    },
  ];

  for (const { name, appColumns } of columnTestCases) {
    test(
      `User can enable ${name} columns via Manage Columns`,
      { tag: ['@inventory-views'] },
      async ({ page }) => {
        const modal = columnManagementModal(page);

        await test.step(`Open Manage Columns and apply ${name} columns`, async () => {
          await modal.open();

          for (const columnName of appColumns) {
            await modal.root.getByLabel(columnName, { exact: true }).check();
            await expect(
              modal.root.getByLabel(columnName, { exact: true }),
            ).toBeChecked();
          }
          // Verify it is applied by checking the "X selected" text in the dialog
          const selected = modal.root.locator(
            '[data-ouia-component-id="BulkSelect-text"]',
          );
          const totalModifiedColumns =
            defaultInventoryColumns.length + appColumns.length;
          await expect(selected).toHaveText(`${totalModifiedColumns} selected`);
        });

        await test.step(`Verify ${name} columns are applied on systems table`, async () => {
          await modal.saveButton.click();
          await expect(modal.root).toBeHidden();

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
        const modal = columnManagementModal(page);

        await test.step(`Open Manage Columns and apply ${name} columns`, async () => {
          await modal.open();

          // For Inventory columns, unselect some default columns to reduce table width
          const columnsToUnselect = ['OS', 'Last seen', 'Tags', 'Workspace'];
          for (const columnName of columnsToUnselect) {
            await modal.root.getByLabel(columnName, { exact: true }).uncheck();
            await expect(
              modal.root.getByLabel(columnName, { exact: true }),
            ).not.toBeChecked();
          }

          for (const column of appColumns) {
            await modal.root.getByLabel(column.name, { exact: true }).check();
            await expect(
              modal.root.getByLabel(column.name, { exact: true }),
            ).toBeChecked();
          }

          await modal.saveButton.click();
          await expect(modal.root).toBeHidden();

          const expectedColumnCount =
            totalDefaultColumns + appColumns.length - 4; // -4 for unselected columns

          const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
          await expect(visibleHeaders).toHaveCount(expectedColumnCount);
        });

        // Test sorting for each column in the app
        for (const column of appColumns) {
          await test.step(`Sort by ${column.name} in ascending order and validate`, async () => {
            const columnHeader = page
              .locator('button.pf-v6-c-table__button')
              .filter({ hasText: new RegExp(`^${column.name}$`) });
            await expect(columnHeader).toBeVisible();

            // Scroll table horizontally to bring column into view
            await scrollColumnIntoView(columnHeader);

            // Click until we reach ascending sort (max 3 clicks)
            for (let attempt = 0; attempt < 3; attempt++) {
              const currentSort = await columnHeader
                .locator('..')
                .getAttribute('aria-sort');

              if (currentSort === 'ascending') {
                break;
              }

              // Use JavaScript click to bypass sticky column interference
              await columnHeader.evaluate((button) =>
                (button as HTMLElement).click(),
              );

              // Wait for skeleton table to disappear after sort
              await expect(
                page.locator('[data-ouia-component-id="SkeletonTable"]'),
              ).toBeHidden({ timeout: 10000 });
            }

            await validateSortDirection(page, columnHeader, 'ascending');
            await validateDataColumnSortOrder(page, column.name, 'ascending');
          });

          await test.step(`Sort by ${column.name} in descending order and validate`, async () => {
            const columnHeader = page
              .locator('button.pf-v6-c-table__button')
              .filter({ hasText: new RegExp(`^${column.name}$`) });

            // Scroll table horizontally to bring column into view
            await scrollColumnIntoView(columnHeader);

            // Use JavaScript click to bypass sticky column interference
            await columnHeader.evaluate((button) =>
              (button as HTMLElement).click(),
            );

            // Wait for skeleton table to disappear after sort
            await expect(
              page.locator('[data-ouia-component-id="SkeletonTable"]'),
            ).toBeHidden({ timeout: 10000 });

            await validateSortDirection(page, columnHeader, 'descending');
            await validateDataColumnSortOrder(page, column.name, 'descending');
          });
        }
      },
    );
  }

  test(
    'Sticky columns remain visible during horizontal scroll',
    { tag: ['@inventory-views'] },
    async ({ page }) => {
      const modal = columnManagementModal(page);

      // Locators for sticky columns - declared once and reused throughout the test
      const checkboxHeader = page.locator('th').first();
      const nameHeader = page
        .locator('th')
        .filter({ hasText: new RegExp('^Name$') });
      const actionsHeader = page
        .locator('th')
        .filter({ hasText: /Actions/ })
        .last();

      // Locator for a non-sticky column to verify actual scrolling
      // Using "OS" which is a default column that should scroll out when we scroll right
      const nonStickyColumn = page
        .locator('th')
        .filter({ hasText: new RegExp('^OS$') });

      await test.step('Enable all columns via Bulk Select to create horizontal scroll', async () => {
        await modal.open();

        await modal.root
          .locator('[data-ouia-component-id="BulkSelect-checkbox"]')
          .check();
        for (const columnName of allColumns) {
          await expect(
            modal.root.getByLabel(columnName, { exact: true }),
          ).toBeChecked();
        }

        await modal.saveButton.click();
        await expect(modal.root).toBeHidden();

        // Wait for table to load
        await expect(
          page.locator('[data-ouia-component-id="SkeletonTable"]'),
        ).toBeHidden({ timeout: 10000 });
      });

      await test.step('Verify table is horizontally scrollable', async () => {
        const isScrollable = await isTableHorizontallyScrollable(page);
        expect(isScrollable).toBe(true);
      });

      await test.step('Scroll to maximum right and verify sticky columns still visible', async () => {
        // Scroll to the far right
        await scrollTableToPosition(page, 1);

        // All sticky columns should still be visible in viewport
        await expect(checkboxHeader).toBeInViewport();
        await expect(nameHeader).toBeInViewport();
        await expect(actionsHeader).toBeInViewport();

        // The left non-sticky column should still be out of viewport
        // (proving scroll position maintained and didn't reset)
        await expect(nonStickyColumn).toBeVisible(); // Exists in DOM
        await expect(nonStickyColumn).not.toBeInViewport(); // But not in viewport
      });
    },
  );
});
