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
  const wspcFilter = page.getByRole('textbox', { name: 'Type to filter' });
  await wspcFilter.click();
  await wspcFilter.fill('Workspace_with');
  const wspcOption = page.getByText('Workspace_with_systems', { exact: true });
  await expect(wspcOption).toBeVisible({ timeout: 100000 });
  await wspcOption.click();

  // Wait for the table to refresh: at least one Workspace cell has the expected value
  const workspaceCellWithValue = page.locator(
    'table tbody td[data-label="Workspace"]',
    {
      hasText: 'Workspace_with_systems',
    },
  );
  await expect(workspaceCellWithValue.first()).toBeVisible({ timeout: 30000 });

  // 2. Verify only systems from the workspace are displayed
  // All cells from the "Workspace" column
  const workspaceCells = page.locator('table tbody td[data-label="Workspace"]');
  const count = await workspaceCells.count();
  await expect(workspaceCells).toHaveText(
    Array(count).fill('Workspace_with_systems'),
  );
});
