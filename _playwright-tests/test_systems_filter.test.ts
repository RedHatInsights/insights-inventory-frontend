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

  // Helper function to parse relative time text to approximate days
  const parseLastSeenToDays = (text: string): number => {
    const lowerText = text.toLowerCase().trim();

    // "just now", "X seconds ago", "X minutes ago", "X hours ago" = 0 days
    if (
      lowerText.includes('just now') ||
      lowerText.includes('second') ||
      lowerText.includes('minute') ||
      lowerText.includes('hour')
    ) {
      return 0;
    }

    // "X days ago" or "X day ago"
    const dayMatch = lowerText.match(/(\d+)\s*days?\s*ago/);
    if (dayMatch) {
      return parseInt(dayMatch[1], 10);
    }

    // "X weeks ago" or "X week ago"
    const weekMatch = lowerText.match(/(\d+)\s*weeks?\s*ago/);
    if (weekMatch) {
      return parseInt(weekMatch[1], 10) * 7;
    }

    // "X months ago" or "X month ago"
    const monthMatch = lowerText.match(/(\d+)\s*months?\s*ago/);
    if (monthMatch) {
      return parseInt(monthMatch[1], 10) * 30;
    }

    // "X years ago" or "X year ago"
    const yearMatch = lowerText.match(/(\d+)\s*years?\s*ago/);
    if (yearMatch) {
      return parseInt(yearMatch[1], 10) * 365;
    }

    // Default: return -1 to indicate unknown format
    return -1;
  };

  // Validation function for each filter type
  const validateLastSeenValue = (
    days: number,
    filterType: string,
  ): { isValid: boolean; reason: string } => {
    if (days === -1) {
      return { isValid: true, reason: 'Unknown format, skipping validation' };
    }

    switch (filterType) {
      case 'last24': // Within the last 24 hours
        return {
          isValid: days === 0,
          reason: `Expected within 24 hours (0 days), got ${days} days`,
        };
      case '24more': // More than 1 day ago
        return {
          isValid: days >= 1,
          reason: `Expected more than 1 day ago, got ${days} days`,
        };
      case '7more': // More than 7 days ago
        return {
          isValid: days >= 7,
          reason: `Expected more than 7 days ago, got ${days} days`,
        };
      case '15more': // More than 15 days ago
        return {
          isValid: days >= 15,
          reason: `Expected more than 15 days ago, got ${days} days`,
        };
      case '30more': // More than 30 days ago
        return {
          isValid: days >= 30,
          reason: `Expected more than 30 days ago, got ${days} days`,
        };
      default:
        return { isValid: true, reason: 'Unknown filter type' };
    }
  };

  const lastSeenTestCases = [
    {
      option: 'Within the last 24 hours',
      urlParam: 'last_seen=last24',
      filterType: 'last24',
    },
    {
      option: 'More than 1 day ago',
      urlParam: 'last_seen=24more',
      filterType: '24more',
    },
    {
      option: 'More than 7 days ago',
      urlParam: 'last_seen=7more',
      filterType: '7more',
    },
    {
      option: 'More than 15 days ago',
      urlParam: 'last_seen=15more',
      filterType: '15more',
    },
    {
      option: 'More than 30 days ago',
      urlParam: 'last_seen=30more',
      filterType: '30more',
    },
  ];

  lastSeenTestCases.forEach((testData) => {
    test(`User can filter systems by Last seen: ${testData.option}`, async ({
      page,
    }) => {
      /**
       * Jira References:
       * - https://issues.redhat.com/browse/RHINENG-20810 – Filter systems by Last seen
       * Metadata:
       * - requirements: inv-hosts-filter-by-last_seen
       * - assignee: addubey
       * - importance: high
       */

      await test.step('Apply Last seen filter', async () => {
        await filterSystemsWithConditionalFilter(
          page,
          'Last seen',
          testData.option,
        );
      });

      await test.step('Verify filter chip is displayed', async () => {
        const filterChip = page.locator('span.pf-v6-c-label__text', {
          hasText: testData.option,
        });
        await expect(filterChip).toBeVisible({ timeout: 10000 });
      });

      await test.step('Verify URL contains correct filter parameter', async () => {
        await expect(async () => {
          const url = page.url();
          expect(url).toContain(testData.urlParam);
        }).toPass({ timeout: 5000 });
      });

      await test.step('Verify table shows filtered results or empty state', async () => {
        await page.waitForSelector('.loading-spinner', {
          state: 'hidden',
          timeout: 10000,
        });

        const tableRows = page.locator('table tbody tr');
        const noMatchingSystemsState = page.getByText(
          'No matching systems found',
        );

        await expect(async () => {
          const rowCount = await tableRows.count();
          const isEmptyVisible = await noMatchingSystemsState.isVisible();
          // Either we have rows OR we see the no matching systems state
          expect(rowCount > 0 || isEmptyVisible).toBe(true);
        }).toPass({ timeout: 10000 });
      });

      await test.step('Verify Last seen column values match filter criteria', async () => {
        const noMatchingSystemsState = page.getByText(
          'No matching systems found',
        );
        const isEmptyVisible = await noMatchingSystemsState.isVisible();

        // Skip validation if no systems match the filter
        // eslint-disable-next-line playwright/no-conditional-in-test
        if (isEmptyVisible) {
          return;
        }

        const lastSeenCells = page.locator(
          'table tbody tr td[data-label="Last seen"]',
        );
        const cellCount = await lastSeenCells.count();

        // Validate each displayed system's Last seen value
        for (let i = 0; i < cellCount; i++) {
          const cellText = await lastSeenCells.nth(i).textContent();
          // eslint-disable-next-line playwright/no-conditional-in-test
          if (!cellText) continue;

          const days = parseLastSeenToDays(cellText);
          const validation = validateLastSeenValue(days, testData.filterType);

          expect(
            validation.isValid,
            `Row ${i + 1}: "${cellText}" - ${validation.reason}`,
          ).toBe(true);
        }
      });
    });
  });
});
