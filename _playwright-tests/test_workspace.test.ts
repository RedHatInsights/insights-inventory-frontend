import { test, expect } from '@playwright/test';

import { navigateToWorkspacesFunc } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/loginHelpers';

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

  // Close any modals/popups before navigating
  await closePopupsIfExist(page);

  // Navigate to the Workspaces page
  await navigateToWorkspacesFunc(page);

  // Generate a unique workspace name
  const WorkspaceName = `Workspace_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const RenamedWorkspace = `${WorkspaceName}_Renamed`;

  // 1. Click the "Create Workspace" button
  await page.click('button:has-text("Create workspace")');

  // 2. Wait for dialog to appear and fill in the workspace name
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 100000 });
  await dialog.locator('input').first().fill(WorkspaceName);
  await dialog.getByRole('button', { name: 'Create' }).click();

  // 3. Use the search bar to filter by workspace name
  const searchInput = page.locator('input[placeholder="Filter by name"]');
  await expect(searchInput).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' }); 
  await searchInput.fill(WorkspaceName);

  const workspaceLink = page.getByRole('link', { name: WorkspaceName });
  await expect(workspaceLink).toBeVisible({ timeout: 100000 });
  await workspaceLink.click();


  const actionsButton = page.getByRole('button', { name: 'Actions' });
  await expect(actionsButton).toBeVisible();
  await actionsButton.click();

  // 5. Click "Rename workspace" from the dropdown
  await page.getByRole('menuitem', { name: 'Rename' }).first().click();

  // 6. Rename dialog appears fill in new name
  await expect(dialog).toBeVisible();
  await dialog.locator('input').first().fill(RenamedWorkspace);
  await dialog.getByRole('button', { name: 'Save' }).click();

  // 7. Search for the new name to confirm rename worked
  await navigateToWorkspacesFunc(page);
  await searchInput.fill(RenamedWorkspace);
  await expect(page.locator(`text=${RenamedWorkspace}`)).toBeVisible();

  // 8. Delete the renamed workspace
  const RenamedworkspaceLink = page.getByRole('link', { name: RenamedWorkspace });
  await expect(RenamedworkspaceLink).toBeVisible({ timeout: 100000 });
  await RenamedworkspaceLink.click();

  await expect(actionsButton).toBeVisible();
  await actionsButton.click();

  await page.getByRole('menuitem', { name: 'Delete' }).first().click();
  await expect(dialog).toBeVisible();
  await dialog.locator('input[type="checkbox"]').first().check();
  await page.getByRole('button', { name: 'Delete' }).click();


  // 9. Verify deletion
  await navigateToWorkspacesFunc(page);
  await searchInput.fill(RenamedWorkspace);
  await expect(page.locator('text=No matching workspaces found')).toBeVisible();
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
    
      const WorkspaceName = "Workspace_with_systems" 
      // Close any modals/popups before navigating
      await closePopupsIfExist(page);
    
      // Navigate to the Workspaces page
      await navigateToWorkspacesFunc(page);
    
      // 3. Use the search bar to filter by workspace name
      const searchInput = page.locator('input[placeholder="Filter by name"]');
      await expect(searchInput).toBeVisible();
      await page.reload({ waitUntil: 'networkidle' }); 
      await searchInput.fill(WorkspaceName);
    
      const workspaceLink = page.getByRole('link', { name: WorkspaceName });
      await expect(workspaceLink).toBeVisible({ timeout: 100000 });
      await workspaceLink.click();
    
    
      const actionsButton = page.getByRole('button', { name: 'Actions' });
      await expect(actionsButton).toBeVisible();
      await actionsButton.click();
    
      await page.getByRole('menuitem', { name: 'Delete' }).first().click();
    
      await expect(page.locator('text=Cannot delete workspace at this time')).toBeVisible();
    });
