/* eslint-disable prettier/prettier */
import { Page, Locator, expect } from '@playwright/test';

export type ManageViewHelper = {
  manageViewToggle: Locator;
  selectedView: Locator;
  selectedViewMenu: Locator;
  selectView: (view: string) => Promise<void>;
  saveAs: (view: string) => Promise<void>;
  save: (view: string) => Promise<void>;
  rename: (newName: string) => Promise<void>;
  delete: (view: string) => Promise<void>;
  verifyActiveView: (expectedViewName: string, options?: { timeout?: number }) => Promise<void>;
};

/**
 * Helper for managing views in the Inventory UI.
 *
 * @example
 * const views = manageViewHelper(page);
 * await views.saveAs('my-view');
 * await views.rename('my-view-renamed');
 * await views.delete('my-view-renamed');
 */
export function manageViewHelper(page: Page): ManageViewHelper {
  const manageViewToggle = page.getByTestId('manage-view-toggle');
  const selectedView = page.getByTestId('manage-view-select-view');
  const selectedViewMenu = page.getByTestId('manage-view-select-view-dropdown');

  const verifyActiveView = async (
    expectedViewName: string,
    { timeout = 5000 }: { timeout?: number } = {},
  ): Promise<void> => {
    await expect(selectedView).toContainText(expectedViewName, {
      timeout,
    });
  };

  return {
    manageViewToggle,
    selectedView,
    selectedViewMenu,

    /**
     * Opens the views dropdown and selects a view by its visible text name.
     */
    async selectView(view: string): Promise<void> {
      await expect(selectedView).toBeVisible();
      await selectedView.click();

      await expect(selectedViewMenu).toBeVisible();

      // Locates the specific option matching the target view name
      const optionToSelect = selectedViewMenu
        .getByRole('option')
        .filter({ hasText: view })
        .first();

      await expect(optionToSelect).toBeVisible();
      await optionToSelect.click();

      // Verify the dropdown closed and the view is selected
      await expect(selectedViewMenu).toBeHidden();
      await verifyActiveView(view);
    },

    /**
     * Saves the current view under a new name.
     */
    async saveAs(view: string): Promise<void> {
      await expect(manageViewToggle).toBeVisible();
      await manageViewToggle.click();
      await page.getByRole('menuitem', { name: 'Save as' }).click();

      const dialog = page.getByRole('dialog', { name: 'Save as' });
      await expect(dialog).toBeVisible();

      await dialog.getByLabel('View name').fill(view);
      await dialog.getByRole('button', { name: 'Save' }).click();

      await expect(dialog).toBeHidden();
    },

    /**
     * Updates the current view's configuration.
     */
    async save(view: string): Promise<void> {
      await verifyActiveView(view);
      await expect(manageViewToggle).toBeVisible();
      await manageViewToggle.click();
      await page
        .getByRole('menuitem', { name: 'Save', exact: true })
        .click();
    },

    /**
     * Renames the currently active view.
     */
    async rename(newName: string): Promise<void> {
      await manageViewToggle.click();
      await page.getByRole('menuitem', { name: 'Rename' }).click();

      const dialog = page.getByRole('dialog', { name: 'Rename view' });
      await expect(dialog).toBeVisible();

      await dialog.getByLabel('View name').fill(newName);
      await dialog.getByRole('button', { name: 'Save' }).click();

      await expect(dialog).toBeHidden();
    },

    /**
     * Deletes the active view.
     */
    async delete(view: string): Promise<void> {
      await verifyActiveView(view);
      await manageViewToggle.click();
      await page.getByRole('menuitem', { name: 'Delete' }).click();

      const dialog = page.getByRole('dialog', { name: 'Delete view' });
      await expect(dialog).toBeVisible();

      await dialog.getByRole('button', { name: 'Delete' }).click();
      await expect(dialog).toBeHidden();

      // The UI falls back to another view after deletion; the title can take a
      // moment to update, so give this a longer timeout than the default.
      await expect(selectedView).not.toContainText(view, {
        timeout: 10000,
      });
    },

    verifyActiveView,
  };
}
