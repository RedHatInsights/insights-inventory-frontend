import { expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';
import { columnManagementModal } from './helpers/columnManagementModal';
import {
  totalDefaultColumns,
  defaultInventoryColumns,
  getVisibleInventoryColumnOrder,
  expectInventoryColumnHidden,
  expectDefaultInventoryColumnsVisible,
} from './helpers/columnHelpers';

test.describe('Column Management Modal', { tag: ['@inventory-views'] }, () => {
  test.beforeEach(async ({ page }) => {
    await navigateToInventorySystemsFunc(page);

    const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
    await expect(visibleHeaders).toHaveCount(totalDefaultColumns);
  });

  test('open Manage Columns modal', async ({ page }) => {
    const modal = columnManagementModal(page);

    await modal.open();

    await expect(modal.root).toBeVisible();
    await expect(
      modal.root.getByRole('heading', { name: 'Manage columns' }),
    ).toBeVisible();
  });

  test('Name column is checked and cannot be toggled off', async ({ page }) => {
    const modal = columnManagementModal(page);

    await modal.open();

    const nameColumn = modal.root.getByLabel('Name', { exact: true });

    await expect(nameColumn).toBeChecked();
    await expect(nameColumn).toBeDisabled();
  });

  test('disable a default column and save', async ({ page }) => {
    const columnToDisable = 'Tags';
    const modal = columnManagementModal(page);

    await modal.open();

    await modal.disableColumn(columnToDisable);

    await modal.save();

    await expectInventoryColumnHidden(page, columnToDisable);
  });

  test('cancel button disregards column changes', async ({ page }) => {
    const columnToDisable = 'Tags';
    const modal = columnManagementModal(page);

    await modal.open();

    await modal.disableColumn(columnToDisable);

    await modal.cancel();

    await expectDefaultInventoryColumnsVisible(page);
  });

  test('close button disregards column changes', async ({ page }) => {
    const columnToDisable = 'Tags';
    const modal = columnManagementModal(page);

    await modal.open();

    await modal.disableColumn(columnToDisable);

    await modal.close();

    await expectDefaultInventoryColumnsVisible(page);
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

  test('reset button restores default column state', async ({ page }) => {
    const columnToEnable = 'Status';
    const modal = columnManagementModal(page);

    await modal.open();

    const defaultModalColumns = await modal.columns;

    await modal.enableColumn(columnToEnable);
    await modal.dragColumnTo('Workspace', 'Tags');
    await expect(modal.saveButton).toBeEnabled();
    await expect(
      modal.root.getByLabel(columnToEnable, { exact: true }),
    ).toBeChecked();
    expect(await modal.columns).not.toEqual(defaultModalColumns);

    await modal.resetButton.click();

    await expect(
      modal.root.getByLabel(columnToEnable, { exact: true }),
    ).not.toBeChecked();

    expect(await modal.columns).toEqual(defaultModalColumns);
    await expect(modal.saveButton).toBeDisabled();
    await expectDefaultInventoryColumnsVisible(page);
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

  test('bulk select toggles all toggleable columns', async ({ page }) => {
    const modal = columnManagementModal(page);

    await modal.open();

    await expect(modal.selectedCount).toHaveText(
      `${defaultInventoryColumns.length} selected`,
    );

    await modal.bulkSelectCheckbox.check();

    await expect(modal.bulkSelectCheckbox).toBeChecked();
    expect((await modal.columns).every(([, isEnabled]) => isEnabled)).toBe(
      true,
    );

    await modal.bulkSelectCheckbox.uncheck();

    // every column but 'Name' should be disabled
    expect(
      (await modal.columns).every(
        ([columnName, isEnabled]) => isEnabled === (columnName === 'Name'),
      ),
    ).toBe(true);

    await expect(modal.saveButton).toBeEnabled();
  });
});
