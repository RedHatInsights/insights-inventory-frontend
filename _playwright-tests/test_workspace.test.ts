import { expect } from '@playwright/test';
import { test,navigateToWorkspacesFunc } from './helpers/navHelpers';


test('User can create, rename, and delete a workspace', async ({ page }) => {
  /** 
   * Jira References:
       - https://issues.redhat.com/browse/ESSNTL-3871 – Create workspace
       - https://issues.redhat.com/browse/ESSNTL-4370 – Rename workspace
       - https://issues.redhat.com/browse/ESSNTL-4370 – Delete workspace
   * Metadata:
       - requirements:
           - inv-groups-post
           - inv-groups-patch
           - inv-groups-delete
       - importance: critical
       - assignee: addubey
   */

  await test.step('Navigate to Workspaces page', async () => {
    await navigateToWorkspacesFunc(page);
  });

  const WorkspaceName = `Workspace_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const RenamedWorkspace = `${WorkspaceName}_Renamed`;

  await test.step('Create a new workspace', async () => {
    await page.click('button:has-text("Create workspace")');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 100000 });
    await dialog.locator('input').first().fill(WorkspaceName);
    await dialog.getByRole('button', { name: 'Create' }).click();
  });

  await test.step('Search and open newly created workspace', async () => {
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await expect(searchInput).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill(WorkspaceName);

    const workspaceLink = page.getByRole('link', { name: WorkspaceName });
    await expect(workspaceLink).toBeVisible({ timeout: 100000 });
    await workspaceLink.click();
  });

  await test.step('Rename the workspace', async () => {
    const actionsButton = page.getByRole('button', { name: 'Actions' });
    await expect(actionsButton).toBeVisible();
    await actionsButton.click();

    await page.getByRole('menuitem', { name: 'Rename workspace' }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.locator('input').first().fill(RenamedWorkspace);
    await dialog.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Delete the renamed workspace', async () => {
    await expect(page.getByRole('heading', { name: RenamedWorkspace })).toBeVisible();
    const actionsButton = page.getByRole('button', { name: 'Actions' });
    await expect(actionsButton).toBeVisible();
    await actionsButton.click();

    await page.getByRole('menuitem', { name: 'Delete workspace' }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
<<<<<<< HEAD
=======

    // search for the deleted workspace to confirm deletion worked
    const resetFiltersButton = page.getByRole('button', { name: 'Reset filters' });
    await resetFiltersButton.click();
    await searchByName(page, renamedWorkspace);
    const deletedWorkspaceLocator = page.locator(`text=${renamedWorkspace}`);
    await expect(deletedWorkspaceLocator).toHaveCount(0, { timeout: 60000 });
    await expect(page.locator('text=No matching workspaces found')).toBeVisible();
>>>>>>> f2c5885 (test(RHINENG-21087-1): Add E2E test to rename and delete workpsce from Workpsaces page)
  });

  await test.step('Verify workspace deletion', async () => {
    await navigateToWorkspacesFunc(page);
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await searchInput.fill(RenamedWorkspace);
    await expect(page.locator('text=No matching workspaces found')).toBeVisible();
  });
});


test('User cannot delete a workspace with systems', async ({ page }) => {
  /** 
   * Jira References:
       - https://issues.redhat.com/browse/ESSNTL-4370 – Delete workspace with systems
   * Metadata:
       - requirements:
           - inv-groups-delete
       - importance: critical
       - negative: true
       - assignee: addubey
   */

  const WorkspaceName = "Workspace_with_systems";

  await test.step('Navigate to Workspaces', async () => {
    await navigateToWorkspacesFunc(page);
  });

  await test.step('Search and open workspace with systems', async () => {
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await expect(searchInput).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill(WorkspaceName);

    const workspaceLink = page.getByRole('link', { name: WorkspaceName });
    await expect(workspaceLink).toBeVisible({ timeout: 100000 });
    await workspaceLink.click();
  });

  await test.step('Attempt to delete workspace with systems and verify warning', async () => {
    const actionsButton = page.getByRole('button', { name: 'Actions' });
    await expect(actionsButton).toBeVisible();
    await actionsButton.click();

    await page.getByRole('menuitem', { name: 'Delete' }).first().click();

    await expect(page.locator('text=Cannot delete workspace at this time')).toBeVisible();
  });
});


test('User able to bulk delete empty workspaces', async ({ page }) => {
  /** 
   * Jira References:
       - https://issues.redhat.com/browse/ESSNTL-4367 – Bulk deletion of empty workspaces
   * Metadata:
       - requirements:
           - inv-groups-delete
       - importance: critical
       - assignee: addubey
   */

  await test.step('Navigate to Workspaces', async () => {
    await navigateToWorkspacesFunc(page);
  });

  const dialog = page.locator('[role="dialog"]');

  await test.step('Create 3 empty workspaces', async () => {
    for (let i = 1; i <= 3; i++) {
      const workspaceName = `empty_${Date.now()}_${i}`;
      await page.click('button:has-text("Create workspace")');
      await expect(dialog).toBeVisible({ timeout: 10000 });
      await dialog.locator('input').first().fill(workspaceName);
      await dialog.getByRole('button', { name: 'Create' }).click();
      await page.reload({ waitUntil: 'networkidle' });
    }
  });

  await test.step('Search for empty workspaces and bulk delete', async () => {
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await expect(searchInput).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill("empty");

    const bulkSelectCheckbox = page.locator('[data-ouia-component-id="BulkSelectCheckbox"]');
    await expect(bulkSelectCheckbox).toBeVisible();
    await bulkSelectCheckbox.click();
    await expect(bulkSelectCheckbox).toBeChecked();

    const bulkActionsToggle = page.locator('[data-ouia-component-id="BulkActionsToggle"]');
    await expect(bulkActionsToggle).toBeVisible();
    await bulkActionsToggle.click();

    await page.getByRole('menuitem', { name: 'Delete workspaces' }).first().click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  await test.step('Verify all empty workspaces are deleted', async () => {
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill("empty");
    await expect(page.locator('text=No matching workspaces found')).toBeVisible();
  });
});
