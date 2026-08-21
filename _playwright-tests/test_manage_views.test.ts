/* eslint-disable prettier/prettier */
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
import { randomUUID } from 'crypto';
import { filterSystemsWithConditionalFilter } from './helpers/filterHelpers';

const DEFAULT_PREFIX = 'automated-test';
const DEFAULT_VIEW = 'All systems';

test.describe(
  'Inventory Views: Manage views CRUD operations',
  { tag: ['@inventory-views'] },
  () => {
    const newViewName = `${DEFAULT_PREFIX}-${randomUUID()}`;
    const newName = `${newViewName}-renamed`;

    test('User can create a new view, rename it, and delete it', async ({
      page,
    }) => {
      await navigateToInventorySystemsFunc(page);
      const manageViewButton = page.getByTestId('manage-view-toggle');

      await test.step(`Create new view`, async () => {
        await expect(manageViewButton).toBeVisible();
        await manageViewButton.click();
        await page.getByRole('menuitem', { name: 'Save as' }).click();

        const saveAsDialog = page.getByRole('dialog', { name: 'Save as' });
        await expect(saveAsDialog).toBeVisible();

        await saveAsDialog.getByLabel('View name').fill(newViewName);
        await saveAsDialog.getByRole('button', { name: 'Save' }).click();

        await expect(saveAsDialog).toBeHidden();
      });

      await test.step(`Verify the new view is selected`, async () => {
        await expect(
          page.getByTestId('manage-view-select-view'),
        ).toContainText(newViewName);
      });

      await test.step(`Rename the view`, async () => {
        await manageViewButton.click();
        await page.getByRole('menuitem', { name: 'Rename' }).click();

        const renameDialog = page.getByRole('dialog', { name: 'Rename view' });
        await expect(renameDialog).toBeVisible();

        await renameDialog.getByLabel('View name').fill(newName);
        await renameDialog.getByRole('button', { name: 'Save' }).click();

        await expect(renameDialog).toBeHidden();
      });

      await test.step(`Verify the renamed view is selected`, async () => {
        await expect(
          page.getByTestId('manage-view-select-view'),
        ).toContainText(newName);
      });

      await test.step(`Delete the view`, async () => {
        await manageViewButton.click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();

        const deleteDialog = page.getByRole('dialog', { name: 'Delete view' });
        await expect(deleteDialog).toBeVisible();
        
        await deleteDialog.getByRole('button', { name: 'Delete' }).click();
        await expect(deleteDialog).toBeHidden();
      });

      await test.step(`Verify the view is deleted and default view is selected`, async () => {
        await expect(
          page.getByTestId('manage-view-select-view'),
        ).toContainText(DEFAULT_VIEW);
      }); 
    },  
  );
});

test.describe(
  'Inventory Views: Custom view',
  { tag: ['@inventory-views'] },
  () => {
    const newViewName = `${DEFAULT_PREFIX}-${randomUUID()}`;
    const newName = `${newViewName}-renamed`;

    test('User can create custom view with own configuration', async ({
      page,
    }) => {
      await navigateToInventorySystemsFunc(page);
      const manageViewButton = page.getByTestId('manage-view-toggle');

      await test.step(`Apply custom configuration: columns and filters`, async () => {
        await expect(
          page.getByTestId('manage-view-select-view'),
        ).toContainText(DEFAULT_VIEW);

        // Open column management modal and apply Vulnerability columns
        const modal = columnManagementModal(page);
        await modal.open();
        for (const column of vulnerabilityColumns) {
          await modal.enableColumn(column);
        }
        await modal.save();

        // Apply filter
        await filterSystemsWithConditionalFilter(
          page,
          'System type',
          'Package-based system',
        );
      });

      //// WIP
    });
  },
);
