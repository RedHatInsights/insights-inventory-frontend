import { expect } from '@playwright/test';
import { test } from '../helpers/fixtures';
import { navigateToInventorySystemsFunc } from '../helpers/navHelpers';
import { columnManagementModal } from '../helpers/columnManagementModal';
import { vulnerabilityColumns } from '../helpers/columnHelpers';

test.use({ storageState: '.auth/viewer_user.json' });

test.describe(
  'Inventory Views per-service RBAC',
  { tag: ['@inventory-views'] },
  () => {
    test.describe.configure({ retries: 3 });

    test('denied columns show lock icons in table cells', async ({
      page,
      systems,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('ui.inventory-views', 'true');
      });

      await navigateToInventorySystemsFunc(page);

      const modal = columnManagementModal(page);
      await modal.open();
      for (const col of vulnerabilityColumns) {
        await modal.enableColumn(col);
      }
      await modal.save();

      // Viewer account has no vulnerability access — expect lock icons
      const lockCells = page.locator(
        'td span[aria-label*="request Vulnerability read access"]',
      );
      await expect(lockCells.first()).toBeVisible();
    });

    test('column modal shows lock icons for denied columns', async ({
      page,
      systems,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('ui.inventory-views', 'true');
      });

      await navigateToInventorySystemsFunc(page);

      const modal = columnManagementModal(page);
      await modal.open();

      const vulnLock = modal.root.locator(
        'span[aria-label*="request Vulnerability read access"]',
      );
      await expect(vulnLock.first()).toBeVisible();

      await modal.cancel();
    });

    test('denied columns cannot be sorted', async ({ page, systems }) => {
      await page.addInitScript(() => {
        localStorage.setItem('ui.inventory-views', 'true');
      });

      await navigateToInventorySystemsFunc(page);

      const modal = columnManagementModal(page);
      await modal.open();
      await modal.enableColumn('Total CVEs');
      await modal.save();

      const totalCvesHeader = page.getByRole('columnheader', {
        name: 'Total CVEs',
      });
      await expect(totalCvesHeader).toBeVisible();
      await expect(totalCvesHeader).not.toHaveAttribute('aria-sort');

      await totalCvesHeader.click();
      await expect(totalCvesHeader).not.toHaveAttribute('aria-sort');
    });
  },
);
