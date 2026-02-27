import { expect } from '@playwright/test';
import { type Page } from '@playwright/test';
import {
  navigateToInventorySystemsFunc,
  navigateToWorkspacesFunc,
} from './helpers/navHelpers';
import {
  filterSystemsWithConditionalFilter,
  expectAllRowsHaveText,
  searchByName,
} from './helpers/filterHelpers';
import { test } from './helpers/fixtures';
import { WORKSPACE_UNGROUPED_HOSTS } from './helpers/constants';

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
   */

  await test.step(`Filter systems by ${WORKSPACE_UNGROUPED_HOSTS} workspace in Systems page`, async () => {
    await navigateToInventorySystemsFunc(page);
    await filterSystemsWithConditionalFilter(
      page,
      'Workspace',
      'Ungrouped hosts',
    );
    const workspaceCell = page.locator('td[data-label="Workspace"]');
    await page.waitForTimeout(3000);
    await expectAllRowsHaveText(workspaceCell, WORKSPACE_UNGROUPED_HOSTS);
  });

  await test.step(`Search for ${WORKSPACE_UNGROUPED_HOSTS} workspace in Workspaces page`, async () => {
    await navigateToWorkspacesFunc(page);
    await searchByName(page, WORKSPACE_UNGROUPED_HOSTS);
    const nameCell = page.locator('td[data-label="Name"]');
    await expect(nameCell).toHaveCount(1);
    await expect(nameCell).toHaveText(WORKSPACE_UNGROUPED_HOSTS);
  });

  await test.step(`Navigate to ${WORKSPACE_UNGROUPED_HOSTS} workspace from Workspaces page`, async () => {
    const workspaceLink = page.getByRole('link', {
      name: WORKSPACE_UNGROUPED_HOSTS,
    });
    await expect(workspaceLink).toBeVisible({ timeout: 100000 });
    await workspaceLink.click();
    await expect(
      page.getByRole('heading', { name: WORKSPACE_UNGROUPED_HOSTS }),
    ).toBeVisible({ timeout: 100000 });
  });
});
