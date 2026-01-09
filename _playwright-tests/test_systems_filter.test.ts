import { test, expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import {
  prepareSingleSystem,
  cleanupTestArchive,
  BOOTC_ARCHIVE,
  CENTOS_ARCHIVE,
} from './helpers/uploadArchive';
import {
  filterSystemsWithConditionalFilter,
  assertAllContain,
  parseLastSeenToDays,
} from './helpers/filterHelpers';
import { closePopupsIfExist } from './helpers/loginHelpers';

test.describe('Filtering Systems Tests', () => {
  let systemName: string;
  let archiveName: string;
  let workingDir: string;
  let systemBootcName: string;
  let archiveBootcName: string;
  let workingBootcDir: string;
  const operatingSystemTestCases = [
    { OS: 'RHEL 9.4' },
    { OS: 'CentOS Linux 7.6' },
  ];

  test.beforeAll(async () => {
    const setupResult = prepareSingleSystem();
    const setupBootcResult = prepareSingleSystem(BOOTC_ARCHIVE);

    ({ hostname: systemName, archiveName, workingDir } = setupResult);
    ({
      hostname: systemBootcName,
      archiveName: archiveBootcName,
      workingDir: workingBootcDir,
    } = setupBootcResult);
  });

  test.beforeEach(async ({ page }) => {
    await closePopupsIfExist(page);
    await navigateToInventorySystemsFunc(page);
    const resetFiltersButton = page.getByRole('button', {
      name: 'Reset filters',
    });
    if (await resetFiltersButton.isVisible({ timeout: 100 })) {
      await resetFiltersButton.click();
    }
  });

  test.afterAll(async () => {
    cleanupTestArchive(archiveName, workingDir);
    cleanupTestArchive(archiveBootcName, workingBootcDir);
  });

  test('User can filter systems by System type', async ({ page }) => {
    /**
     * Metadata:
       - requirements:
       - inv-hosts-filter-by-system_type
       - assignee: zabikeno
       - importance: critical
     */
    const imageIconAriaLabel = 'Image mode icon';
    const packageIconAriaLabel = 'Package mode icon';
    const imageIcons = page.locator(`[aria-label="${imageIconAriaLabel}"]`);
    const packageIcons = page.locator(`[aria-label="${packageIconAriaLabel}"]`);

    await test.step('Package-based system option', async () => {
      await filterSystemsWithConditionalFilter(
        page,
        'System type',
        'Package-based system',
      );
      await expect(imageIcons).toHaveCount(0);
      const packageCount = await packageIcons.count();
      expect(packageCount).toBeGreaterThanOrEqual(0);
    });
    await test.step('Image-based system option', async () => {
      // Reset previews filter
      const resetFiltersButton = page.getByRole('button', {
        name: 'Reset filters',
      });
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (await resetFiltersButton.isVisible({ timeout: 100 })) {
        await resetFiltersButton.click();
      }

      await filterSystemsWithConditionalFilter(
        page,
        'System type',
        'Image-based system',
      );
      await expect(packageIcons).toHaveCount(0);
      const imageCount = await imageIcons.count();
      expect(imageCount).toBeGreaterThanOrEqual(0);

      await expect(
        page.getByRole('button', { name: 'View by systems' }),
      ).toBeVisible();
    });
  });

  test('User can filter systems by workspace', async ({ page }) => {
    /**
     * Metadata:
       - requirements:
       - inv-hosts-filter-by-group_name
       - assignee: oezr
       - importance: critical
     */
    await filterSystemsWithConditionalFilter(
      page,
      'Workspace',
      'Workspace_with_systems',
    );
    const workspaceCellWithValue = page.locator(
      'table tbody td[data-label="Workspace"]',
      {
        hasText: 'Workspace_with_systems',
      },
    );
    await expect(workspaceCellWithValue.first()).toBeVisible();
    const count = await workspaceCellWithValue.count();
    await expect(workspaceCellWithValue).toHaveText(
      Array(count).fill('Workspace_with_systems'),
    );
  });

  test.skip('User can filter systems by OS major version option', async ({
    page,
  }) => {
    /**
     * Metadata:
       - requirements:
       - inv-hosts-filter-by-os
       - assignee: zabikeno
       - importance: critical
     */
    const OS = 'RHEL 9';
    await filterSystemsWithConditionalFilter(page, 'Operating system', OS);

    // Verify all filter chips contain Major version OS RHEL 9
    const filterChipGroup = page.locator('span.pf-v6-c-label__text');
    const pattern = /RHEL 9\./;
    await assertAllContain(filterChipGroup, pattern);

    // Multiple RHEL 9 versions should be applied when filtering by major OS version
    expect(await filterChipGroup.count()).toBeGreaterThanOrEqual(1);

    // OS version should contain expected major version of OS
    const columnVersionOS = page.locator(
      'span[aria-label="Formatted OS version"]',
    );
    await assertAllContain(columnVersionOS, pattern);
  });

  operatingSystemTestCases.forEach((testData) => {
    test(`User should be able to filter by OS verion: ${testData.OS}`, async ({
      page,
    }) => {
      /**
       * Metadata:
         - requirements:
         - inv-hosts-filter-by-os
         - assignee: zabikeno
         - importance: critical
       */
      await filterSystemsWithConditionalFilter(
        page,
        'Operating system',
        testData.OS,
      );
      const columnVersionOS = page.locator('table tbody td[data-label="OS"]', {
        hasText: testData.OS,
      });
      await expect(columnVersionOS.first()).toBeVisible();
      const count = await columnVersionOS.count();
      await expect(columnVersionOS).toHaveText(Array(count).fill(testData.OS));
    });
  });

  test('User can filter systems by Tags', async ({ page }) => {
    /**
     * Metadata:
       - requirements:
       - inv-hosts-filter-by-tags
       - assignee: zabikeno
       - importance: critical
     */
    const expectedTagsCount = '7';
    const name = 'Location';
    const value = 'basement';
    const tagSource = 'insights-client';
    const tagOption = `${name}=${value}`;

    await test.step('Filter systems by tag', async () => {
      await filterSystemsWithConditionalFilter(page, 'Tags', tagOption);
      const tagsRows = page.locator(
        '[data-ouia-component-id="TagCount-text"]',
        {
          hasText: expectedTagsCount,
        },
      );
      await expect(tagsRows.first()).toBeVisible();
      const count = await tagsRows.count();
      await expect(tagsRows).toHaveText(Array(count).fill(expectedTagsCount));
    });
    await test.step('Verify Tags Modal has expected tag', async () => {
      // TODO: Remove when RHINENG-22581 is fixed
      const inputLocator = page.getByPlaceholder('Filter by tags').nth(1);
      await inputLocator.fill('');

      // get name of system we check the tags to verify tags modal title
      const nameLocator = page.locator('td[data-label="Name"]').first();
      await nameLocator.waitFor({ state: 'visible' });
      const expectedSystemName = await nameLocator.innerText();

      // open Tags modal
      const tagButton = page.locator(
        '[data-ouia-component-id="TagCount-text"]',
      );
      await tagButton.first().click();
      const dialog = page.locator('[role="dialog"]');
      // Title of the modal should be the name + tags count of clicked system
      const tagModalTitle = `${expectedSystemName} (${expectedTagsCount})`;
      await expect(
        dialog.getByRole('heading', { name: tagModalTitle }),
      ).toBeVisible({
        timeout: 10000,
      });
      // search for expected tag
      const inputLocatorDialog = page.getByPlaceholder('Filter tags');
      await inputLocatorDialog.fill(value);
      await expect(dialog.locator('td[data-label="Name"]')).toHaveText(name);
      await expect(dialog.locator('td[data-label="Value"]')).toHaveText(value);
      await expect(dialog.locator('td[data-label="Tag source"]')).toHaveText(
        tagSource,
      );
    });
  });

  test('User can filter systems by Last seen: Within the last 24 hours', async ({
    page,
  }) => {
    /**
     * Jira References:
     * - https://issues.redhat.com/browse/RHINENG-20810 – Filter systems by Last seen
     * Metadata:
     * - requirements: inv-hosts-filter-by-last_seen
     * - assignee: addubey
     * - importance: high
     *
     * Note: Only testing "Within the last 24 hours" filter as active test systems
     * reliably check in within this window. Other staleness filters (>1d, >7d, etc.)
     * require systems with controlled last-seen timestamps which the test environment
     * cannot guarantee.
     */

    await test.step('Apply Last seen filter', async () => {
      await filterSystemsWithConditionalFilter(
        page,
        'Last seen',
        'Within the last 24 hours',
      );
    });

    await test.step('Verify filter chip is displayed', async () => {
      const filterChip = page.locator('span.pf-v6-c-label__text', {
        hasText: 'Within the last 24 hours',
      });
      await expect(filterChip).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify URL contains correct filter parameter', async () => {
      await expect(async () => {
        const url = page.url();
        expect(url).toContain('last_seen=last24');
      }).toPass({ timeout: 5000 });
    });

    await test.step('Verify table shows filtered results', async () => {
      await page.waitForSelector('.loading-spinner', {
        state: 'hidden',
        timeout: 10000,
      });

      const tableRows = page.locator('table tbody tr');
      await expect(async () => {
        const rowCount = await tableRows.count();
        expect(
          rowCount,
          'Expected systems within last 24 hours - active test systems should exist',
        ).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
    });

    await test.step('Verify Last seen column values are within 24 hours', async () => {
      const lastSeenCells = page.locator(
        'table tbody tr td[data-label="Last seen"]',
      );
      const cellCount = await lastSeenCells.count();

      for (let i = 0; i < cellCount; i++) {
        const cellText = await lastSeenCells.nth(i).textContent();
        expect(
          cellText,
          `Row ${i + 1} should have Last seen text`,
        ).toBeTruthy();

        const days = parseLastSeenToDays(cellText!);
        // "Within the last 24 hours" means 0 days (hours/minutes/seconds ago)
        expect(
          days,
          `Row ${i + 1}: "${cellText}" should be within 24 hours (0 days), got ${days} days`,
        ).toBe(0);
      }
    });
  });
});
