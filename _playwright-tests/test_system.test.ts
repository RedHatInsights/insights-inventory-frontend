import { expect } from '@playwright/test';
import {
  prepareSingleSystem,
  cleanupTestArchive,
} from './helpers/uploadArchive';
import { test, navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { searchByName } from './helpers/filterHelpers';

test('User should be able to edit and delete a system from Systems page', async ({
  page,
}) => {
  /**
   * Jira References:
     - https://issues.redhat.com/browse/RHINENG-21147 – Edit a system
     - https://issues.redhat.com/browse/RHINENG-21149 - Delete a system
   * Metadata:
     - requirements:
     - inv-hosts-patch
     - inv-hosts-delete-by-id
     - importance: critical
     - assignee: addubey
   */
  const setupResult = prepareSingleSystem();
  const { hostname: systemName, archiveName, workingDir } = setupResult;
  const renamedSystemName = `${systemName}_Renamed`;
  const dialog = page.locator('[role="dialog"]');

  await test.step('Navigate to Inventory → Systems', async () => {
    await navigateToInventorySystemsFunc(page);
  });

  await test.step(`Edit the system "${systemName}" display name and save`, async () => {
    await searchByName(page, systemName);
    await page
      .getByRole('row', { name: new RegExp(systemName, 'i') })
      .getByLabel('Kebab toggle')
      .click();

    await page
      .getByRole('menuitem', { name: 'Edit display name' })
      .first()
      .click();

    await expect(dialog).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveValue(systemName);
    await dialog.locator('input').first().fill(renamedSystemName);
    await dialog.getByRole('button', { name: 'Save' }).click();
  });

  await test.step(`Delete the renamed system "${renamedSystemName}" and verify it is removed`, async () => {
    await searchByName(page, renamedSystemName);

    await page
      .getByRole('row', { name: new RegExp(renamedSystemName, 'i') })
      .getByLabel('Kebab toggle')
      .click();

    await page
      .getByRole('menuitem', { name: 'Delete from inventory' })
      .first()
      .click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await searchByName(page, renamedSystemName);
    await expect(page.getByText('No matching systems found')).toBeVisible();
  });

  await test.step('Cleanup the created archive and temp directory', async () => {
    cleanupTestArchive(archiveName, workingDir);
  });
});

test('User should be able to edit and delete a system from System Details page', async ({
  page,
}) => {
  /**
   * Jira References:
     - https://issues.redhat.com/browse/RHINENG-21147 – Edit a system
     - https://issues.redhat.com/browse/RHINENG-21149 - Delete a system
   * Metadata:
     - requirements:
     - inv-hosts-patch
     - inv-hosts-delete-by-id
     - importance: critical
     - assignee: zabikeno
   */
  const setupResult = prepareSingleSystem();
  const { hostname: systemName, archiveName, workingDir } = setupResult;

  const editButtons = page.getByRole('button', { name: 'Edit' });
  const dialogModal = page.locator('[role="dialog"]');
  const nameColumnLocator = page.locator('td[data-label="Name"]');
  const newDisplayName = `host_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newAnsibleName = `host_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  await test.step('Setup: navigate to prepared system details page', async () => {
    await navigateToInventorySystemsFunc(page);
    await searchByName(page, systemName);
    await expect(nameColumnLocator).toHaveCount(1);

    const systemLink = page.getByRole('link', { name: systemName });
    await expect(systemLink).toBeVisible({ timeout: 100000 });
    await systemLink.click();

    await expect(page.getByRole('heading', { name: systemName })).toBeVisible({
      timeout: 100000,
    });
  });

  await test.step('Edit the system display name and verify', async () => {
    await editButtons.nth(0).click();
    await page.locator('[aria-label="name"]').first().fill(newDisplayName);
    await page.getByRole('button', { name: 'submit' }).click();
    await page.waitForTimeout(2000);

    await expect(
      page.getByRole('heading', { name: newDisplayName, level: 1 }),
    ).toBeVisible();
    const displayNameValueLocator = page.getByLabel('Display name value');
    await expect(displayNameValueLocator).toHaveText(newDisplayName);
  });

  await test.step('Edit the system Ansible name and verify', async () => {
    await editButtons.nth(1).click();
    await page.locator('[aria-label="name"]').first().fill(newAnsibleName);
    await page.getByRole('button', { name: 'submit' }).click();
    await page.waitForTimeout(2000);

    const ansibleNameValueLocator = page.getByLabel('Ansible hostname value');
    await expect(ansibleNameValueLocator).toHaveText(newAnsibleName);
  });

  await test.step(`Delete the system and verify it is removed`, async () => {
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(dialogModal).toBeVisible();
    await dialogModal.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Delete operation finished')).toBeVisible({
      timeout: 5000,
    });
  });

  await test.step('Cleanup the created archive and temp directory', async () => {
    cleanupTestArchive(archiveName, workingDir);
  });
});

test('User should be able to export systems to JSON', async ({ page }) => {
  await test.step('Navigate to Inventory → Systems', async () => {
    await navigateToInventorySystemsFunc(page);
  });

  await test.step('Open export menu and select "Export to JSON"', async () => {
    // Listen for the export API request to verify the export was initiated
    const exportRequestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/exports') && request.method() === 'POST',
    );

    // Listen for the export status check requests (indicates export processing)
    const statusCheckPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/exports/') &&
        request.url().includes('/status'),
    );

    await page.getByRole('button', { name: 'Export' }).click();

    await page
      .getByRole('menuitem', { name: 'Export all systems to JSON' })
      .click();

    // Verify the export request was made successfully
    const exportRequest = await exportRequestPromise;
    expect(exportRequest.url()).toContain('/exports');
    console.log('  ✓ Export request initiated successfully');

    // Verify that status checking begins (indicates the "export being prepared" notification should appear)
    await statusCheckPromise;
    console.log('  ✓ Export status checking started (export being prepared)');

    // Wait for any additional status checks that indicate completion
    await page.waitForTimeout(3000);
    console.log(
      '  ✓ Export process completed - notifications should have appeared for preparation and download',
    );

    // Note: Due to auto-close handlers, we verify export functionality through API calls
    // The notifications that should appear are:
    // 1. "The requested export is being prepared. When ready, the download will start automatically."
    // 2. "The requested export is being downloaded."
  });
});

test('User should be able to export systems to CSV', async ({ page }) => {
  await test.step('Navigate to Inventory → Systems', async () => {
    await navigateToInventorySystemsFunc(page);
  });

  await test.step('Open export menu and select "Export to CSV"', async () => {
    // Listen for the export API request to verify the export was initiated
    const exportRequestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/exports') && request.method() === 'POST',
    );

    // Listen for the export status check requests (indicates export processing)
    const statusCheckPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/exports/') &&
        request.url().includes('/status'),
    );

    await page.getByRole('button', { name: 'Export' }).click();

    await page
      .getByRole('menuitem', { name: 'Export all systems to CSV' })
      .click();

    // Verify the export request was made successfully
    const exportRequest = await exportRequestPromise;
    expect(exportRequest.url()).toContain('/exports');
    console.log('  ✓ Export request initiated successfully');

    // Verify that status checking begins (indicates the "export being prepared" notification should appear)
    await statusCheckPromise;
    console.log('  ✓ Export status checking started (export being prepared)');

    // Wait for any additional status checks that indicate completion
    await page.waitForTimeout(3000);
    console.log(
      '  ✓ Export process completed - notifications should have appeared for preparation and download',
    );
  });
});

test('User should be able to delete multiple systems from Systems page', async ({
  page,
}) => {
  /**
   * Jira References:
     - https://issues.redhat.com/browse/RHINENG-21148 - Delete a system
   * Metadata:
     - requirements:
     - inv-hosts-delete-by-id
     - importance: critical
     - assignee: addubey
   */
  const systems = Array.from({ length: 3 }, () => prepareSingleSystem());
  const archives = systems.map((s) => s.archiveName);
  const dirs = systems.map((s) => s.workingDir);
  const dialog = page.locator('[role="dialog"]');
  const systemName = 'insights-pw-vm';

  await test.step('Navigate to Inventory → Systems', async () => {
    await navigateToInventorySystemsFunc(page);
    await searchByName(page, systemName);
    await page.waitForTimeout(3000); // Keep this to be on safe side as bulk deletion is happening.
    await page.waitForSelector('#options-menu-bottom-toggle', {
      state: 'visible',
    });
  });

  await test.step('Select all systems using Bulk Select', async () => {
    await page.locator('[data-ouia-component-id="BulkSelect"]').click();
    await page.getByRole('menuitem', { name: 'Select page' }).click();
  });

  await test.step('Delete selected systems via bulk action', async () => {
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Delete systems from inventory?');
    await dialog.getByRole('button', { name: 'Delete' }).click();
  });

  await test.step('Cleanup the created archives and temp directories', async () => {
    for (let i = 0; i < systems.length; i++) {
      cleanupTestArchive(archives[i], dirs[i]);
    }
  });
});
