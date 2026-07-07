import { expect, type Locator, type Page } from '@playwright/test';

const DEFAULT_OUIA_ID = 'ColumnManagementModal';

export type ColumnListEntry = [columnName: string, isEnabled: boolean];

export type ColumnManagementModal = {
  root: Locator;
  saveButton: Locator;
  cancelButton: Locator;
  resetButton: Locator;
  closeButton: Locator;
  columnList: Locator;
  bulkSelectCheckbox: Locator;
  selectedCount: Locator;
  readonly columns: Promise<ColumnListEntry[]>;
  open: (timeout?: number) => Promise<void>;
  close: () => Promise<void>;
  save: () => Promise<void>;
  cancel: () => Promise<void>;
  enableColumn: (columnName: string) => Promise<void>;
  disableColumn: (columnName: string) => Promise<void>;
  dragColumnTo: (sourceColumn: string, targetColumn: string) => Promise<void>;
};

/**
 * Locators for the ColumnManagementModal on the Systems view.
 *
 * @example
 * const modal = columnManagementModal(page);
 * await modal.open();
 * await modal.enableColumn('Status');
 * await modal.save();
 */
export function columnManagementModal(
  page: Page,
  ouiaId: string | number = DEFAULT_OUIA_ID,
): ColumnManagementModal {
  const root = page.locator(`[data-ouia-component-id="${ouiaId}"]`);
  const columnList = page.locator(
    `[data-ouia-component-id="${ouiaId}-column-list"]`,
  );
  const saveButton = page.locator(
    `[data-ouia-component-id="${ouiaId}-save-button"]`,
  );
  const cancelButton = page.locator(
    `[data-ouia-component-id="${ouiaId}-cancel-button"]`,
  );
  const resetButton = page.locator(
    `[data-ouia-component-id="${ouiaId}-reset-button"]`,
  );
  const closeButton = root.getByRole('button', { name: 'Close' });
  const columnCheckbox = (columnName: string) =>
    root.getByLabel(columnName, { exact: true });

  return {
    root,
    saveButton,
    cancelButton,
    resetButton,
    closeButton,
    columnList,
    bulkSelectCheckbox: root.locator(
      '[data-ouia-component-id="BulkSelect-checkbox"]',
    ),
    selectedCount: root.locator('[data-ouia-component-id="BulkSelect-text"]'),

    /**
     * Each list item as [columnName, isEnabled] in display order.
     */
    get columns(): Promise<ColumnListEntry[]> {
      return (async () => {
        const rows = columnList.locator('li');
        const count = await rows.count();
        const entries: ColumnListEntry[] = [];

        for (let index = 0; index < count; index++) {
          const row = rows.nth(index);
          const columnName = (
            await row
              .locator('[data-ouia-component-id$="-label"] label')
              .textContent()
          )?.trim();
          const isEnabled = await row.getByRole('checkbox').isChecked();
          entries.push([columnName ?? '', isEnabled]);
        }

        return entries;
      })();
    },

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

    /**
     * Closes the modal via the header close button and verifies it is hidden.
     */
    async close() {
      await closeButton.click();
      await expect(root).toBeHidden();
    },

    /**
     * Saves column changes and verifies the modal is hidden.
     */
    async save() {
      await saveButton.click();
      await expect(root).toBeHidden();
    },

    /**
     * Cancels column changes and verifies the modal is hidden.
     */
    async cancel() {
      await cancelButton.click();
      await expect(root).toBeHidden();
    },

    /**
     * Enables a column and verifies its checkbox is checked.
     */
    async enableColumn(columnName: string) {
      const checkbox = columnCheckbox(columnName);
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    },

    /**
     * Disables a column and verifies its checkbox is unchecked.
     */
    async disableColumn(columnName: string) {
      const checkbox = columnCheckbox(columnName);
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    },

    /**
     * Reorders a column by dragging its handle onto another column's row.
     */
    async dragColumnTo(sourceColumn: string, targetColumn: string) {
      const columnRow = (columnName: string) =>
        columnCheckbox(columnName).locator('xpath=ancestor::li[1]');

      const source = columnRow(sourceColumn).getByRole('button', {
        name: 'Drag button',
      });
      const target = columnRow(targetColumn);

      await expect(source).toBeVisible();
      await expect(target).toBeVisible();
      await source.dragTo(target, { steps: 20 });
    },
  };
}
