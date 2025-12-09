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

  test('User can filter systems by OS major version option', async ({
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
});
