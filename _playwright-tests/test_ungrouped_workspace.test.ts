import { expect } from '@playwright/test';
import { type Page } from '@playwright/test';
import {
  test,
  navigateToInventorySystemsFunc,
  navigateToWorkspacesFunc,
} from './helpers/navHelpers';
import {
  filterSystemsWithConditionalFilter,
  expectAllRowsHaveText,
  searchByName,
} from './helpers/filterHelpers';

test('User can filter, search and see details of "Ungrouped Hosts" workspace', async ({
  page,
}: {
  page: Page;
}) => {
  /**
   * The 'ungroued' workspace is an unique workspace introduced by Kessel/Management Fabric team: 
   * - It's limited to one per account.
   * - Workspace actions are disabled within it.
   * - Systems stored here can be moved to any other workspace
    
   * Metadata:
     - requirements: 
     - inv-hosts-filter-by-group_name
     - inv-kessel-ungrouped
     - importance: critical
     - assignee: zabikeno
    
   */
  const ungroupedWorkspaceName: string = 'Ungrouped Hosts';
  await test.step('Filter systems by "Ungrouped Hosts" workspace in Systems page', async () => {
    await navigateToInventorySystemsFunc(page);
    await filterSystemsWithConditionalFilter(
      page,
      'Workspace',
      'Ungrouped hosts',
    );
    const workspaceColumnLocator = page.locator('td[data-label="Workspace"]');
    await page.waitForTimeout(3000);
    await expectAllRowsHaveText(workspaceColumnLocator, ungroupedWorkspaceName);
  });

  await test.step('Search for "Ungrouped Hosts" workspace in Workspaces page', async () => {
    await navigateToWorkspacesFunc(page);
    await searchByName(page, ungroupedWorkspaceName);
    const nameColumnLocator = page.locator('td[data-label="Name"]');
    await expect(nameColumnLocator).toHaveCount(1);
    await expect(nameColumnLocator).toHaveText(ungroupedWorkspaceName);
  });

  await test.step('Navigate to "Ungrouped Hosts" workspace from Workspaces page', async () => {
    const workspaceLink = page.getByRole('link', {
      name: ungroupedWorkspaceName,
    });
    await expect(workspaceLink).toBeVisible({ timeout: 10000 });
    await workspaceLink.click();
    await expect(
      page.getByRole('heading', { name: ungroupedWorkspaceName }),
    ).toBeVisible({ timeout: 10000 });
  });
});
