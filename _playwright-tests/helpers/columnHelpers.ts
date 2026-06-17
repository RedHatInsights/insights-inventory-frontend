import { expect } from '@playwright/test';
import { type Page } from '@playwright/test';

// Default columns from inventory/columnDefinitions.tsx
export const defaultInventoryColumns = [
  'Name',
  'Workspace',
  'Tags',
  'OS',
  'Last seen',
];
// Total columns includes checkbox (first) and per-row actions (last)
export const totalDefaultColumns = defaultInventoryColumns.length + 2;

export const inventoryColumns = [
  'Created',
  'Workload',
  'Status',
  'Vendor',
  'Infrastructure',
];

export const advisorColumns = [
  'Recommendations',
  'Incidents',
  'Critical',
  'Important',
  'Moderate',
  'Low',
];

export const complianceColumns = ['Last compliance scan', 'Policies'];

export const patchColumns = ['Installable advisories', 'Template'];

export const malwareColumns = [
  'Last malware status',
  'Total malware matches',
  'Last malware scan',
];

/**
 * Opens the 'Manage columns' modal from the systems view toolbar.
 * Wraps the action in toPass to handle loading skeletons and dropdown rendering.
 * Verifies the dialog is visible before returning.
 *  @param {Page}   page      - The Playwright page instance.
 *  @param {number} [timeout] - Optional timeout for the toPass block.
 */
export async function openManageColumnsModal(page: Page, timeout = 45000) {
  await expect(async () => {
    // 1. Wait for the loading table skeleton to disappear
    await expect(
      page.locator('[data-ouia-component-id="SkeletonTable"]'),
    ).toBeHidden();

    // 2. Locate, verify, and click the toolbar actions dropdown
    const toolbarActionsButton = page.locator(
      "[data-ouia-component-id='systems-view-toolbar-actions-menu-dropdown-toggle']",
    );
    await expect(toolbarActionsButton).toBeVisible();
    await expect(toolbarActionsButton).toBeEnabled();
    await toolbarActionsButton.click();

    // 3. Locate, verify, and click the 'Manage columns' button inside the dropdown
    const manageColumnsButton = page
      .locator('button')
      .filter({ hasText: 'Manage columns' });
    await expect(manageColumnsButton).toBeEnabled();
    await manageColumnsButton.click();

    // 4. Verify the column management dialog is visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  }).toPass({ timeout });
}
