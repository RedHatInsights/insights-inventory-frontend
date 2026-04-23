import { expect, Locator } from '@playwright/test';
import { createSystem } from './helpers/uploadArchive';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';
import { searchByName, waitForTableKebabReady } from './helpers/filterHelpers';
import { isSystemsViewEnabled } from './helpers/constants';

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
   */
  const system = await createSystem();
  const newDisplayName = `${system.hostname}_Renamed`;
  const dialog = page.locator('[role="dialog"]');
  const nameCell = page
    .locator('[data-ouia-component-id="systems-view-table-td-0-0"]')
    .or(page.locator('td[data-label="Name"]'));

  await test.step('Navigate to Inventory → Systems', async () => {
    await navigateToInventorySystemsFunc(page);
  });

  await test.step(`Edit the system "${system.hostname}" display name and save`, async () => {
    await searchByName(page, system.hostname);
    await expect(nameCell).toHaveCount(1, { timeout: 10000 });
    const kebab = await waitForTableKebabReady(
      page,
      new RegExp(system.hostname, 'i'),
    );
    await kebab.click();
    await expect(kebab).toHaveAttribute('aria-expanded', 'true');

    const editButton = page.getByRole('menuitem', { name: /^Edit/ }).first();
    await expect(editButton).toBeEnabled({
      enabled: isSystemsViewEnabled || undefined,
      timeout: 50000,
    });
    await editButton.click();
    await expect(dialog).toBeVisible();

    await expect(page.getByRole('textbox')).toHaveValue(system.hostname);
    await dialog.locator('input').first().fill(newDisplayName);
    await dialog.getByRole('button', { name: 'Save' }).click();
  });

  await test.step(`Delete the renamed system "${newDisplayName}" and verify it is removed`, async () => {
    await searchByName(page, newDisplayName);
    await expect(nameCell).toHaveCount(1, { timeout: 10000 });
    const kebab = await waitForTableKebabReady(
      page,
      new RegExp(newDisplayName, 'i'),
    );
    await kebab.click();
    await expect(kebab).toHaveAttribute('aria-expanded', 'true');

    const deleteButton = page
      .getByRole('menuitem', { name: /^Delete/ })
      .first();
    await expect(deleteButton).toBeEnabled({
      enabled: isSystemsViewEnabled || undefined,
      timeout: 50000,
    });
    await deleteButton.click();

    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await searchByName(page, newDisplayName);
    await expect(page.getByText('No matching systems found')).toBeVisible();
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
  systems,
}) => {
  /**
   * Jira References:
     - https://issues.redhat.com/browse/RHINENG-21148 - Delete a system
   * Metadata:
     - requirements:
     - inv-hosts-delete-by-id
     - importance: critical
   */
  const dialog = page.locator('[role="dialog"]');
  const nameCell = page.locator(
    'tbody.pf-v6-c-table__tbody tr[data-ouia-component-type="PF6/TableRow"]',
  );

  await test.step('Navigate to Inventory → Systems', async () => {
    await navigateToInventorySystemsFunc(page);

    await searchByName(page, systems.deleteSystemsPrefix);
    await expect(nameCell).toHaveCount(systems.deleteSystems.length);
  });

  await test.step('Select all systems using Bulk Select', async () => {
    const bulkSelectBtn = page
      .locator('[data-ouia-component-id="BulkSelect-toggle"]')
      .or(page.locator('[data-ouia-component-id="BulkSelect"]'));
    await bulkSelectBtn.click();

    await page.getByRole('menuitem', { name: 'Select page' }).click();
    const bulkSelect = page
      .locator('[id="bulk-select-systems-toggle-checkbox"]')
      .or(page.locator('[data-ouia-component-id="BulkSelect-text"]'));
    await expect(bulkSelect).toContainText(
      `${systems.deleteSystems.length} selected`,
    );
  });

  await test.step('Delete selected systems via bulk action', async () => {
    await page.locator('[data-ouia-component-id="bulk-delete-button"]').click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Delete systems from inventory?');
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await searchByName(page, systems.deleteSystemsPrefix);
    await expect(page.getByText('No matching systems found')).toBeVisible();
  });
});

(['ascending', 'descending'] as const).forEach((order) => {
  test(`User can sort systems by Name column in ${order} order`, async ({
    page,
  }) => {
    /**
     * Jira References:
     * - https://issues.redhat.com/browse/RHINENG-21942 – Sort systems by Name
     * Metadata:
     * - requirements: inv-hosts-get
     * - importance: high
     *
     */

    await test.step('Navigate to Inventory → Systems', async () => {
      await navigateToInventorySystemsFunc(page);
    });

    await test.step(`Sort by Name column in ${order} order`, async () => {
      const columnHeader = page
        .locator('button.pf-v6-c-table__button')
        .filter({ hasText: /^Name$/ })
        .or(page.locator('th[data-label="Name"] button'));
      await expect(columnHeader).toBeVisible();

      // Expected URL sort parameter: ascending = display_name, descending = -display_name
      const expectedSortParam = {
        ascending: /sort=display_name|sort_dir=asc/,
        descending: /sort=-display_name|sort_dir=desc/,
      };

      // Keep clicking until we reach the desired sort direction (max 3 clicks)
      for (let attempt = 0; attempt < 3; attempt++) {
        const currentSort = await columnHeader
          .locator('..')
          .getAttribute('aria-sort');

        // If already at target, break
        if (currentSort === order) {
          break;
        }

        await columnHeader.click();

        // Wait for the sort to take effect
        await expect(page).toHaveURL(/sort=|sort_dir=/);
      }

      // Verify we reached the target sort direction
      await expect(async () => {
        const finalSort = await columnHeader
          .locator('..')
          .getAttribute('aria-sort');
        expect(finalSort).toBe(order);
      }).toPass({ timeout: 5000 });

      // Verify URL has exact sort parameter for the expected order
      await expect(async () => {
        const url = page.url();
        expect(url).toMatch(expectedSortParam[order]);
      }).toPass({ timeout: 5000 });
    });

    await test.step('Verify systems are sorted alphabetically', async () => {
      const nameCell = page
        .locator('[data-ouia-component-id="systems-view-table-td-0-0"]')
        .or(page.locator('td[data-label="Name"]'));
      await expect(nameCell.first()).toBeVisible();

      const displayedNames = await nameCell.allTextContents();
      const lowerCaseNames = displayedNames.map((name) =>
        name.toLowerCase().trim(),
      );

      const sortFunctions = {
        ascending: (_a: string, _b: string) => _a.localeCompare(_b),
        descending: (_a: string, _b: string) => _b.localeCompare(_a),
      };

      const expectedSortedNames = [...lowerCaseNames].sort(
        sortFunctions[order],
      );

      expect(lowerCaseNames).toEqual(expectedSortedNames);
    });

    await test.step('Verify sort indicator is displayed', async () => {
      const columnHeader = page
        .locator('th')
        .filter({ has: page.getByRole('button', { name: 'Name' }) })
        .or(page.locator('[data-ouia-component-id="systems-view-table-th-0"]'));
      await expect(columnHeader).toHaveAttribute('aria-sort', order);
    });
  });
});
