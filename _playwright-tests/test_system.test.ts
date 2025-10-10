import { expect } from '@playwright/test';
import { test, navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { uploadArchive } from './helpers/uploadArchive';
import { searchByName } from './helpers/filterHelpers';

test('User should be able to edit and delete a system', async ({ page }) => {
    /** 
     * Jira References:
        - https://issues.redhat.com/browse/RHINENG-21146 – Create a system
        - https://issues.redhat.com/browse/RHINENG-21147 – Edit a system
        - https://issues.redhat.com/browse/RHINENG-21149 - Delete a system
    * Metadata:
        - requirements:
            - inv-hosts-patch
            - inv-hosts-delete-by-id
        - importance: critical
        - assignee: addubey
    */
    const rhel94Vm = 'iqe-vm-cli-80196d0a-2704-4b38-bad0-8eacc6feda7d';
    const rhel94VmRenamed = `${rhel94Vm}_Renamed`;
    const dialog = page.locator('[role="dialog"]');

    await test.step('Upload the archive required for the test', async () => {
        uploadArchive('rhel94_core_collect.tar.gz');
    });

    await test.step('Navigate to Inventory → Systems', async () => {
        await navigateToInventorySystemsFunc(page);
    });

    await test.step(`Search for the system "${rhel94Vm}"`, async () => {
        await searchByName(page, rhel94Vm);
    });

    await test.step('Open kebab menu and select "Edit display name"', async () => {
        await page
        .getByRole('row', { name: new RegExp(rhel94Vm, 'i') })
        .getByLabel('Kebab toggle')
        .click();

        await page.getByRole('menuitem', { name: 'Edit display name' }).first().click();
    });

    await test.step('Edit the system display name and save', async () => {
        await expect(dialog).toBeVisible();
        await expect(page.getByRole('textbox')).toHaveValue(rhel94Vm);
        await dialog.locator('input').first().fill(rhel94VmRenamed);
        await dialog.getByRole('button', { name: 'Save' }).click();
    });

    await test.step(`Delete the renamed system and verify it is removed`, async () => {
        await searchByName(page, rhel94VmRenamed);

        await page
        .getByRole('row', { name: new RegExp(rhel94VmRenamed, 'i') })
        .getByLabel('Kebab toggle')
        .click();

        await page.getByRole('menuitem', { name: 'Delete from inventory' }).first().click();
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Delete' }).click();

        await searchByName(page, rhel94VmRenamed);
        await expect(page.getByText('No matching systems found')).toBeVisible();
  });
});
