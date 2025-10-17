import { expect } from '@playwright/test';
import {
  prepareSingleSystem,
  cleanupTestArchive,
} from './helpers/uploadArchive';
import { test, navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { searchByName } from './helpers/filterHelpers';

const BUG_URL = `https://issues.redhat.com/browse/RHINENG-21302`;

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

  await test.step('Setup: navigate to prepeared system details page', async () => {
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

  await test.step('Edit the system display name and verify', async (step) => {
    step.skip(true, `Editing display name is blocked by bug: ${BUG_URL}.`);
    await editButtons.nth(0).click();
    await page.locator('[aria-label="name"]').first().fill(newDisplayName);
    await page.getByRole('button', { name: 'submit' }).click();

    await expect(
      page.getByRole('heading', { name: newDisplayName }),
    ).toBeVisible();
    const displayNameValueLocator = page.getByLabel('Display name value');
    await expect(displayNameValueLocator).toHaveText(newDisplayName);
  });

  await test.step('Edit the system Ansible name and verify', async () => {
    await editButtons.nth(1).click();
    await page.locator('[aria-label="name"]').first().fill(newAnsibleName);
    await page.getByRole('button', { name: 'submit' }).click();

    const ansibleNameValueLocator = page.getByLabel('Ansible hostname value');
    await expect(ansibleNameValueLocator).toHaveText(newAnsibleName);
  });

  await test.step(`Delete the system and verify it is removed`, async () => {
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(dialogModal).toBeVisible();
    await dialogModal.getByRole('button', { name: 'Delete' }).click();

    await page.reload();
    await expect(page.getByText('System not found')).toBeVisible();
  });

  await test.step('Cleanup the created archive and temp directory', async () => {
    cleanupTestArchive(archiveName, workingDir);
  });
});
