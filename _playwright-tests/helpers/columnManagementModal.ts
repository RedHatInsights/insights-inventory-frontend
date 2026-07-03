import { expect, type Locator, type Page } from '@playwright/test';

const DEFAULT_OUIA_ID = 'ColumnManagementModal';

export type ColumnManagementModal = {
  root: Locator;
  saveButton: Locator;
  cancelButton: Locator;
  resetButton: Locator;
  closeButton: Locator;
  columnList: Locator;
  bulkSelectCheckbox: Locator;
  selectedCount: Locator;
  open: (timeout?: number) => Promise<void>;
};

/**
 * Locators for the ColumnManagementModal on the Systems view.
 *
 * @example
 * const modal = columnManagementModal(page);
 * await modal.open();
 * await modal.root.getByLabel('Status', { exact: true }).check();
 * await modal.saveButton.click();
 * await expect(modal.root).toBeHidden();
 */
export function columnManagementModal(
  page: Page,
  ouiaId: string | number = DEFAULT_OUIA_ID,
): ColumnManagementModal {
  const root = page.locator(`[data-ouia-component-id="${ouiaId}"]`);

  return {
    root,
    saveButton: page.locator(
      `[data-ouia-component-id="${ouiaId}-save-button"]`,
    ),
    cancelButton: page.locator(
      `[data-ouia-component-id="${ouiaId}-cancel-button"]`,
    ),
    resetButton: page.locator(
      `[data-ouia-component-id="${ouiaId}-reset-button"]`,
    ),
    closeButton: root.getByRole('button', { name: 'Close' }),
    columnList: page.locator(
      `[data-ouia-component-id="${ouiaId}-column-list"]`,
    ),
    bulkSelectCheckbox: root.locator(
      '[data-ouia-component-id="BulkSelect-checkbox"]',
    ),
    selectedCount: root.locator('[data-ouia-component-id="BulkSelect-text"]'),

    /**
     * Opens the modal from the Systems view toolbar overflow menu.
     * Retries via toPass to handle loading skeletons and dropdown rendering.
     */
    async open(timeout = 45000) {
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

        await expect(root).toBeVisible();
      }).toPass({ timeout });
    },
  };
}
