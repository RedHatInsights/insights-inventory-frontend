import { test, expect } from '@playwright/test';
import { type Locator, type Page } from '@playwright/test';
import { navigateToInventoryFunc, navigateToWorkspacesFunc } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/loginHelpers';
import { filterSystemsWithConditionalFilter, expectAllRowsHaveText, searchByName } from './helpers/filterHelpers';

test('User can filter, search and see deatils of "Ungrouped Hosts" workspace', async ({ page }) => {
/** 
 * The ungroued workspace is unique workspace that can be only 1 in the account:
 * - user can't remove ungrouped workspace
 * - user not able to add systems to ungrouped workspace
 * - user not able to remove systems from ungrouped workspace
 
 * Metadata:
     - requirements: 
        - inv-hosts-filter-by-group_name
        - inv-kessel-ungrouped
     - importance: critical
     - assignee: zabikeno

 */
  const ungroupedWorkspaceName = "Ungrouped Hosts";
  await closePopupsIfExist(page);

  await test.step('Filter systems by "Ungrouped Hosts" workspace in Systems page', async () => {
    await navigateToInventoryFunc(page);
    await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible();

    await filterSystemsWithConditionalFilter(page, "Workspace", "Ungrouped hosts");
    const workspaceColumnLocator = page.locator('td[data-label="Workspace"]');
    await expectAllRowsHaveText(workspaceColumnLocator, ungroupedWorkspaceName);
    await expectDisabledUngroupedWorkspaceActions(page, "Systems");
  });

  await test.step('Search for "Ungrouped Hosts" workspace in Workspaces page', async () => {
    await navigateToWorkspacesFunc(page);
    await searchByName(page, "Ungrouped Hosts");
    const nameColumnLocator = page.locator('td[data-label="Name"]');
    await expectAllRowsHaveText(nameColumnLocator, ungroupedWorkspaceName);
    await expectDisabledUngroupedWorkspaceActions(page, "Workspaces");
  });

  await test.step('Navigate to "Ungrouped Hosts" workspace from Workspaces page', async () => {
    const workspaceLink = page.getByRole('link', { name: ungroupedWorkspaceName });
    await expect(workspaceLink).toBeVisible({ timeout: 100000 });
    await workspaceLink.click();
    await expect(page.getByRole('heading', { name: ungroupedWorkspaceName })).toBeVisible({ timeout: 100000 });
    await expectDisabledUngroupedWorkspaceActions(page, "Workspace's details");
  });
});



/**
 * Asserts that the action buttons related to ungrouped workspace are disabled depending on the current page context.
 * * This function handles conditional assertions for different UI views:
 * - 'Systems': Checks that the 'Remove from workspace' button is disabled.
 * - 'Workspaces': Checks that the 'Delete workspace' and 'Rename workspace' buttons are disabled.
 * - 'Workspace's details': Checks that 'Remove from workspace', 'Delete workspace', 
 * and 'Rename workspace' buttons are all disabled (requiring an extra toggle click).
 * @param page The Playwright Page object for interaction.
 * @param pageName The name of the current page context ('Systems', 'Workspaces', or "Workspace's details").
 * @returns A promise that resolves when all expected assertions are complete.
 */
const expectDisabledUngroupedWorkspaceActions = async (
    page: Page,
    pageName: string,
) => {
  const rowMenuToggle = page.locator('button[aria-label="Kebab toggle"]').first();
  await rowMenuToggle.click();

  if (pageName === "Systems") {
    const removeFromWorkspaceButton = page.getByRole('button', { name: 'Remove from workspace' });
    await expect(removeFromWorkspaceButton).toBeDisabled();
  } else if (pageName === "Workspaces") {
    const deleteWorkspaceButton = page.getByRole('button', { name: 'Delete workspace' });
    await expect(deleteWorkspaceButton).toBeDisabled();
    const renameWorkspaceButton = page.getByRole('button', { name: 'Rename workspace' });
    await expect(renameWorkspaceButton).toBeDisabled();
  } else if (pageName === "Workspace's details") {
    const removeFromWorkspaceButton = page.getByRole('button', { name: 'Remove from workspace' });
    await expect(removeFromWorkspaceButton).toBeDisabled();
    const actionMenuToggle = page.locator('button[data-ouia-component-id="group-actions-dropdown-toggle"]');

    await actionMenuToggle.click();
    const deleteWorkspaceButton = page.getByRole('button', { name: 'Delete workspace' });
    await expect(deleteWorkspaceButton).toBeDisabled();
    const renameWorkspaceButton = page.getByRole('button', { name: 'Rename workspace' });
    await expect(renameWorkspaceButton).toBeDisabled();
  };
};
