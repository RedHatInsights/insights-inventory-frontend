import { expect } from '@playwright/test';
import {
  prepareTestArchive,
  uploadArchive,
  cleanupTestArchive,
} from './helpers/uploadArchive';
import { test, navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { searchByName } from './helpers/filterHelpers';

test('User should be able to edit and delete a system', async ({ page }) => {
  const dialog = page.locator('[role="dialog"]');

  const {
    hostname: systemName,
    archiveName,
    workingDir,
  } = await test.step('Prepare and upload the archive', async () => {
    const result = prepareTestArchive();
    uploadArchive(result.archiveName);
    return result;
  });

  const renamedSystemName = `${systemName}_Renamed`;

  await test.step('Navigate to Inventory → Systems', async () => {
    await navigateToInventorySystemsFunc(page);
  });

  await test.step(`Search for the system "${systemName}"`, async () => {
    await searchByName(page, systemName);
  });

  await test.step('Open kebab menu and select "Edit display name"', async () => {
    await page
      .getByRole('row', { name: new RegExp(systemName, 'i') })
      .getByLabel('Kebab toggle')
      .click();

    await page
      .getByRole('menuitem', { name: 'Edit display name' })
      .first()
      .click();
  });

  await test.step('Edit the system display name and save', async () => {
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
