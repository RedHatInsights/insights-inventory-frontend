import { expect } from '@playwright/test';
import { test, navigateToWorkspacesFunc } from './helpers/navHelpers';
import { searchByName } from './helpers/filterHelpers';
import {
  generateUniqueWorkspaceName,
  createNewWorkspace,
} from './helpers/workspaceHelpers';

test('User can create, rename, and delete a workspace from Workspace Details page', async ({
  page,
}) => {
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

  const workspaceName = await generateUniqueWorkspaceName();
  const renamedWorkspace = `${workspaceName}_Renamed`;

  await test.step('Create a new workspace', async () => {
    await page.click('button:has-text("Create workspace")');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 100000 });
    await dialog.locator('input').first().fill(workspaceName);
    await dialog.getByRole('button', { name: 'Create' }).click();
  });

  await test.step('Search and open newly created workspace', async () => {
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await expect(searchInput).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill(workspaceName);

    const workspaceLink = page.getByRole('link', { name: workspaceName });
    await expect(workspaceLink).toBeVisible({ timeout: 100000 });
    await workspaceLink.click();
  });

  await test.step('Rename the workspace', async () => {
    const actionsButton = page.getByRole('button', { name: 'Actions' });
    await expect(actionsButton).toBeVisible();
    await actionsButton.click();

    await page
      .getByRole('menuitem', { name: 'Rename workspace' })
      .first()
      .click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.locator('input').first().fill(renamedWorkspace);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('heading', { name: renamedWorkspace }),
    ).toBeVisible();
  });

  await test.step('Delete the renamed workspace', async () => {
    const actionsButton = page.getByRole('button', { name: 'Actions' });
    await expect(actionsButton).toBeVisible();
    await actionsButton.click();

    await page
      .getByRole('menuitem', { name: 'Delete workspace' })
      .first()
      .click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  await test.step('Verify workspace deletion', async () => {
    await navigateToWorkspacesFunc(page);
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await searchInput.fill(renamedWorkspace);
    await expect(
      page.locator('text=No matching workspaces found'),
    ).toBeVisible();
  });
});

test('User cannot delete a workspace with systems from Workspace Details page', async ({
  page,
}) => {
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

  const workspaceName = 'Workspace_with_systems';

  await test.step('Navigate to Workspaces', async () => {
    await navigateToWorkspacesFunc(page);
  });

  await test.step('Search and open workspace with systems', async () => {
    const searchInput = page.locator('input[placeholder="Filter by name"]');
    await expect(searchInput).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill(workspaceName);

    const workspaceLink = page.getByRole('link', { name: workspaceName });
    await expect(workspaceLink).toBeVisible({ timeout: 100000 });
    await workspaceLink.click();
  });

  await test.step('Attempt to delete workspace with systems and verify warning', async () => {
    const actionsButton = page.getByRole('button', { name: 'Actions' });
    await expect(actionsButton).toBeVisible();
    await actionsButton.click();

    await page.getByRole('menuitem', { name: 'Delete' }).first().click();

    await expect(
      page.locator('text=Cannot delete workspace at this time'),
    ).toBeVisible();
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
  const searchInput = page.locator('input[placeholder="Filter by name"]');

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
    await expect(searchInput).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill('empty');
    await expect(page.getByRole('row')).not.toHaveCount(0);

    const bulkSelectCheckbox = page.locator(
      '[data-ouia-component-id="BulkSelectCheckbox"]',
    );
    await expect(bulkSelectCheckbox).toBeVisible();
    await bulkSelectCheckbox.click();
    await expect(bulkSelectCheckbox).toBeChecked();

    const bulkActionsToggle = page.locator(
      '[data-ouia-component-id="BulkActionsToggle"]',
    );
    await expect(bulkActionsToggle).toBeVisible();
    await bulkActionsToggle.click();

    await page
      .getByRole('menuitem', { name: 'Delete workspaces' })
      .first()
      .click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  await test.step('Verify all empty workspaces are deleted', async () => {
    await page.reload({ waitUntil: 'networkidle' });
    await searchInput.fill('empty');
    await expect(
      page.locator('text=No matching workspaces found'),
    ).toBeVisible();
  });
});

test('User can create, rename and delete a workspace from Workspaces page', async ({
  page,
}) => {
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
     - assignee: zabikeno
   */
  const workspaceName = await generateUniqueWorkspaceName();
  const renamedWorkspace = `${workspaceName}_Renamed`;
  const dialogModal = page.locator('[data-ouia-component-id="group-modal"]');
  const perRowKebabButton = page.getByRole('button', { name: 'Kebab toggle' });
  const perRowMenu = page.locator('[class="pf-v6-c-menu"]');
  const nameColumnLocator = page.locator('td[data-label="Name"]');

  await test.step('Test setup: navigate to Workspaces page, create workspace to work with', async () => {
    await navigateToWorkspacesFunc(page);
    await createNewWorkspace(page, workspaceName);
    // search for workspace and via 'Name' column make sure only 1 workspace is found
    await searchByName(page, workspaceName);
    await expect(nameColumnLocator).toHaveCount(1);
    await expect(nameColumnLocator).toHaveText(workspaceName);
  });

  await test.step('Rename workspace via per-row action from Workspaces page and verify renaming via search', async () => {
    await perRowKebabButton.click();
    await expect(perRowMenu).toBeVisible();
    const renameWorkspaceButton = page
      .getByRole('menuitem', { name: 'Rename workspace' })
      .first();
    await renameWorkspaceButton.click();

    await expect(dialogModal).toBeVisible();
    await dialogModal.locator('input').first().fill(renamedWorkspace);
    await dialogModal.getByRole('button', { name: 'Save' }).click();

    // search for the new name to confirm rename worked
    await searchByName(page, renamedWorkspace);
    await expect(nameColumnLocator).toHaveCount(1);
    await expect(nameColumnLocator).toHaveText(renamedWorkspace);
  });

  await test.step('Delete workspace via per-row action from Workspaces page and verify deletion via search', async () => {
    await searchByName(page, renamedWorkspace);
    await perRowKebabButton.click();
    await expect(perRowMenu).toBeVisible();
    await page
      .getByRole('menuitem', { name: 'Delete workspace' })
      .first()
      .click();

    await expect(dialogModal).toBeVisible();
    await dialogModal.getByRole('button', { name: 'Delete' }).click();

    // search for the workspace to confirm workspace is removed
    await searchByName(page, renamedWorkspace);
    await expect(
      page.locator('text=No matching workspaces found'),
    ).toBeVisible();
  });
});
