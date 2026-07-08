import { expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';
import { columnManagementModal } from './helpers/columnManagementModal';
import {
  totalDefaultColumns,
  getVisibleInventoryColumnOrder,
  expectInventoryColumnHidden,
} from './helpers/columnHelpers';

test.describe('Column Management Modal', { tag: ['@inventory-views'] }, () => {
  test.beforeEach(async ({ page }) => {
    await navigateToInventorySystemsFunc(page);

    const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
    await expect(visibleHeaders).toHaveCount(totalDefaultColumns);
  });

  test('column changes persist after page reload', async ({ page }) => {
    const columnToDisable = 'Tags';
    const modal = columnManagementModal(page);

    await modal.open();

    await modal.disableColumn(columnToDisable);

    await modal.save();

    await expectInventoryColumnHidden(page, columnToDisable);

    await page.reload({ waitUntil: 'load' });
    await expect(
      page.locator('[data-ouia-component-id="SkeletonTable"]'),
    ).toBeHidden();

    await expectInventoryColumnHidden(page, columnToDisable);
  });

  test('drag and drop a column and save', async ({ page }) => {
    const modal = columnManagementModal(page);

    await modal.open();

    const initialModalColumns = await modal.columns;
    const enabledColumnNames = initialModalColumns
      .filter(([, isEnabled]) => isEnabled)
      .map(([columnName]) => columnName);

    const sourceColumn = enabledColumnNames[1];
    const targetColumn = enabledColumnNames[2];
    const reorderedColumnNames = [...enabledColumnNames];
    [reorderedColumnNames[1], reorderedColumnNames[2]] = [
      reorderedColumnNames[2],
      reorderedColumnNames[1],
    ];

    await modal.dragColumnTo(sourceColumn, targetColumn);

    await expect(modal.saveButton).toBeEnabled();
    await modal.save();

    expect(await getVisibleInventoryColumnOrder(page)).toEqual(
      reorderedColumnNames,
    );
  });
});
