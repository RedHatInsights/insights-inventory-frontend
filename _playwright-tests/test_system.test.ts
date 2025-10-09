import { expect } from '@playwright/test';
import { test, navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { uploadArchive } from './helpers/uploadArchive';
import { searchByName } from './helpers/filterHelpers';

test('User should be able to edit and delete a system from Systems page', async ({ page }) => {
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
    const rhel94VM = 'iqe-vm-cli-80196d0a-2704-4b38-bad0-8eacc6feda7d';
    const rhel94VMRenamed = `${rhel94VM}_Renamed`;
    const dialog = page.locator('[role="dialog"]');
    

    await test.step('Upload the archive required for the test', async () => {
        uploadArchive('rhel94_core_collect.tar.gz');
    });

    await test.step('Navigate to Inventory → Systems', async () => {
        await navigateToInventorySystemsFunc(page);
    });

    await test.step(`Search for the system "${rhel94VM}"`, async () => {
        await searchByName(page, rhel94VM);
    });

    await test.step('Edit the system display name and save', async () => {
        await page
        .getByRole('row', { name: new RegExp(rhel94VM, 'i') })
        .getByLabel('Kebab toggle')
        .click();
        await page.getByRole('menuitem', { name: 'Edit display name' }).first().click();

        await expect(dialog).toBeVisible();
        await dialog.locator('input').first().fill(rhel94VMRenamed);
        await dialog.getByRole('button', { name: 'Save' }).click();
    });

    await test.step(`Delete the renamed system and verify it is removed`, async () => {
        await searchByName(page, rhel94VMRenamed);

        await page
        .getByRole('row', { name: new RegExp(rhel94VMRenamed, 'i') })
        .getByLabel('Kebab toggle')
        .click();

        await page.getByRole('menuitem', { name: 'Delete from inventory' }).first().click();
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Delete' }).click();

        await searchByName(page, rhel94VMRenamed);
        await expect(page.getByText('No matching systems found')).toBeVisible();
  });
});


test('User should be able to edit and delete a system from System Details page', async ({ page }) => {
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
    const hostName = 'iqe-vm-cli-80196d0a-2704-4b38-bad0-8eacc6feda7d';
    const editButtons = page.getByRole('button', { name: 'Edit' });
    const newDisplayName = `host_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newAnsibleName = `host_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const dialogModal = page.locator('[role="dialog"]');

    await test.step('Setup: upload the archive required for the test and navigate to system', async () => {
        uploadArchive('rhel94_core_collect.tar.gz');
        await navigateToInventorySystemsFunc(page);
        await searchByName(page, hostName);

        const systemLink = page.getByRole('link', { name: hostName });
        await expect(systemLink).toBeVisible({ timeout: 100000 });
        await systemLink.click();
        await expect(page.getByRole('heading', { name: hostName })).toBeVisible({ timeout: 100000 });
    });

    await test.step('Edit the system display name and verify', async () => {
        await editButtons.nth(0).click();
        await page.locator('[aria-label="name"]').first().fill(newDisplayName);
        await page.getByRole('button', { name: 'submit' }).click();

        await expect(page.getByRole('heading', { name: newDisplayName })).toBeVisible();
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

    await test.step(`Delete the renamed system and verify it is removed`, async () => {
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(dialogModal).toBeVisible();
        await dialogModal.getByRole('button', { name: 'Delete' }).click();

        await navigateToInventorySystemsFunc(page);
        await searchByName(page, newDisplayName);
        await expect(page.getByText('No matching systems found')).toBeVisible();
  });
});
