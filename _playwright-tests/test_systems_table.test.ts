import { test, expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';

test('User can filter systems by workspace', async ({ page }) => {
/** 
 * Metadata:
    - requirements:
      - inv-hosts-filter-by-group_name
    - assignee: oezr
    - importance: critical
 */

  await navigateToInventorySystemsFunc(page);

  // 1. Filter by workspace
  await page.getByRole('button', { name: 'Conditional filter toggle' }).click();
  // wait for the dropdown to open - otherwise we type too soon and the search is not applied
  await page.waitForTimeout(1000);
  await page.getByRole('menuitem', { name: 'Workspace' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill('Workspace_with');
  const workspaceOption = page.getByText('Workspace_with_systems', { exact: true });
  await expect(workspaceOption).toBeVisible({ timeout: 100000 });
  await workspaceOption.click();

  // 2. Verify there is only the single system assigned to the workspace
  // TODO: improve the check for the system name - to make extra sure the filter worked
  const tableRows = page.locator('table tbody tr');
  await expect(tableRows).toHaveCount(3, { timeout: 100000 });

  // All cells from the "Workspace" column
  const workspaceCells = page.locator('table tbody td[data-label="Workspace"]');
  const count = await workspaceCells.count();
  await expect(workspaceCells).toHaveText(Array(count).fill('Workspace_with_systems'));
});
