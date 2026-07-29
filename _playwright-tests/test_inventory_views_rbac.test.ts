import { expect } from '@playwright/test';
import { test } from './helpers/fixtures';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { columnManagementModal } from './helpers/columnManagementModal';
import {
  vulnerabilityColumns,
  complianceColumns,
  advisorColumns,
} from './helpers/columnHelpers';
import {
  installDeniedServicesMock,
  uninstallDeniedServicesMock,
} from './helpers/inventoryViewsRbacMock';

test.use({ storageState: '.auth/admin_user.json' });

test.describe('Per-service RBAC column gating', () => {
  test.describe.configure({ retries: 3 });

  test('denied columns show lock icons in table cells', async ({
    page,
    systems,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hbi.inventory-views-rbac', 'true');
      localStorage.setItem('ui.systems-view', 'true');
      localStorage.setItem('ui.inventory-views', 'true');
    });
    await installDeniedServicesMock(page, ['vulnerability', 'compliance']);

    try {
      await navigateToInventorySystemsFunc(page);

      // Enable denied + allowed columns so they're visible
      const modal = columnManagementModal(page);
      await modal.open();
      for (const col of vulnerabilityColumns) {
        await modal.enableColumn(col);
      }
      for (const col of complianceColumns) {
        await modal.enableColumn(col);
      }
      for (const col of advisorColumns) {
        await modal.enableColumn(col);
      }
      await modal.save();

      // Denied columns: lock icons with tooltip
      const vulnLockCells = page.locator(
        'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
      );
      await expect(vulnLockCells.first()).toBeVisible();

      const complianceLockCells = page.locator(
        'td span[aria-label*="do not have the necessary Compliance permissions"]',
      );
      await expect(complianceLockCells.first()).toBeVisible();

      // Allowed columns: real data (advisor columns should NOT have lock icons)
      const advisorLockCells = page.locator(
        'td span[aria-label*="do not have the necessary Advisor permissions"]',
      );
      await expect(advisorLockCells).toHaveCount(0);
    } finally {
      await uninstallDeniedServicesMock(page);
    }
  });

  test('column modal shows lock icons for denied columns', async ({
    page,
    systems,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hbi.inventory-views-rbac', 'true');
      localStorage.setItem('ui.systems-view', 'true');
      localStorage.setItem('ui.inventory-views', 'true');
    });
    await installDeniedServicesMock(page, ['vulnerability', 'compliance']);

    try {
      await navigateToInventorySystemsFunc(page);

      const modal = columnManagementModal(page);
      await modal.open();

      // Lock icons should be visible next to denied column names
      const modalRoot = modal.root;
      const vulnLock = modalRoot.locator(
        'span[aria-label*="do not have the necessary Vulnerability permissions"]',
      );
      await expect(vulnLock.first()).toBeVisible();

      const complianceLock = modalRoot.locator(
        'span[aria-label*="do not have the necessary Compliance permissions"]',
      );
      await expect(complianceLock.first()).toBeVisible();

      // Advisor columns should NOT have lock icons
      const advisorLock = modalRoot.locator(
        'span[aria-label*="do not have the necessary Advisor permissions"]',
      );
      await expect(advisorLock).toHaveCount(0);

      await modal.cancel();
    } finally {
      await uninstallDeniedServicesMock(page);
    }
  });

  test('denied columns cannot be sorted', async ({ page, systems }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hbi.inventory-views-rbac', 'true');
      localStorage.setItem('ui.systems-view', 'true');
      localStorage.setItem('ui.inventory-views', 'true');
    });
    await installDeniedServicesMock(page, ['vulnerability']);

    try {
      await navigateToInventorySystemsFunc(page);

      // Enable a vulnerability column that is normally sortable
      const modal = columnManagementModal(page);
      await modal.open();
      await modal.enableColumn('Total CVEs');
      await modal.save();

      // The denied column header should not have a sort button
      const totalCvesHeader = page.getByRole('columnheader', {
        name: 'Total CVEs',
      });
      await expect(totalCvesHeader).toBeVisible();
      await expect(totalCvesHeader).not.toHaveAttribute('aria-sort');

      // Click the header — sort should NOT activate
      await totalCvesHeader.click();
      await expect(totalCvesHeader).not.toHaveAttribute('aria-sort');

      // An allowed sortable column should still work
      const nameHeader = page.getByRole('columnheader', { name: 'Name' });
      await nameHeader.click();
      await expect(nameHeader).toHaveAttribute('aria-sort');
    } finally {
      await uninstallDeniedServicesMock(page);
    }
  });

  test('sort falls back to display_name when sorted column becomes denied', async ({
    page,
    systems,
  }) => {
    // First load: no denials, sort by a vulnerability column
    await page.addInitScript(() => {
      localStorage.setItem('hbi.inventory-views-rbac', 'true');
      localStorage.setItem('ui.systems-view', 'true');
      localStorage.setItem('ui.inventory-views', 'true');
    });

    try {
      await navigateToInventorySystemsFunc(page);

      const modal = columnManagementModal(page);
      await modal.open();
      await modal.enableColumn('Total CVEs');
      await modal.save();

      // Sort by Total CVEs
      const totalCvesHeader = page.getByRole('columnheader', {
        name: 'Total CVEs',
      });
      await totalCvesHeader.click();
      await expect(totalCvesHeader).toHaveAttribute('aria-sort');

      // Now reload with vulnerability denied
      await installDeniedServicesMock(page, ['vulnerability']);
      await page.reload();

      // Sort should have fallen back to Name (display_name)
      const nameHeader = page.getByRole('columnheader', { name: 'Name' });
      await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

      // Total CVEs should no longer be sorted
      const totalCvesHeaderAfter = page.getByRole('columnheader', {
        name: 'Total CVEs',
      });
      await expect(totalCvesHeaderAfter).not.toHaveAttribute('aria-sort');
    } finally {
      await uninstallDeniedServicesMock(page);
    }
  });

  test('no lock icons when denied_services is empty', async ({
    page,
    systems,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hbi.inventory-views-rbac', 'true');
      localStorage.setItem('ui.systems-view', 'true');
      localStorage.setItem('ui.inventory-views', 'true');
    });
    await installDeniedServicesMock(page, []);

    try {
      await navigateToInventorySystemsFunc(page);

      const modal = columnManagementModal(page);
      await modal.open();
      for (const col of vulnerabilityColumns) {
        await modal.enableColumn(col);
      }
      await modal.save();

      const lockIcons = page.locator(
        'td span[aria-label*="do not have the necessary"]',
      );
      await expect(lockIcons).toHaveCount(0);
    } finally {
      await uninstallDeniedServicesMock(page);
    }
  });

  test('table is still functional when all non-inventory services are denied', async ({
    page,
    systems,
  }) => {
    const allDenied = [
      'advisor',
      'compliance',
      'patch',
      'malware',
      'vulnerability',
    ];
    await page.addInitScript(() => {
      localStorage.setItem('hbi.inventory-views-rbac', 'true');
      localStorage.setItem('ui.systems-view', 'true');
      localStorage.setItem('ui.inventory-views', 'true');
    });
    await installDeniedServicesMock(page, allDenied);

    try {
      await navigateToInventorySystemsFunc(page);

      // Enable some denied columns
      const modal = columnManagementModal(page);
      await modal.open();
      for (const col of vulnerabilityColumns) {
        await modal.enableColumn(col);
      }
      for (const col of advisorColumns) {
        await modal.enableColumn(col);
      }
      await modal.save();

      // All enabled app_data columns should show lock icons
      const vulnLocks = page.locator(
        'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
      );
      await expect(vulnLocks.first()).toBeVisible();

      const advisorLocks = page.locator(
        'td span[aria-label*="do not have the necessary Advisor permissions"]',
      );
      await expect(advisorLocks.first()).toBeVisible();

      // Inventory columns (Name, OS, etc.) should still show real data
      const nameHeader = page.getByRole('columnheader', { name: 'Name' });
      await expect(nameHeader).toBeVisible();

      // Table should still be interactive — Name column is sortable
      await nameHeader.click();
      await expect(nameHeader).toHaveAttribute('aria-sort');
    } finally {
      await uninstallDeniedServicesMock(page);
    }
  });

  test.describe('State transitions', () => {
    test('columns show lock icons after losing permission on reload', async ({
      page,
      systems,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('hbi.inventory-views-rbac', 'true');
        localStorage.setItem('ui.systems-view', 'true');
        localStorage.setItem('ui.inventory-views', 'true');
      });

      try {
        // First load: no denials
        await navigateToInventorySystemsFunc(page);

        const modal = columnManagementModal(page);
        await modal.open();
        for (const col of vulnerabilityColumns) {
          await modal.enableColumn(col);
        }
        await modal.save();

        // Verify vulnerability columns show real data (no lock icons)
        const locksBefore = page.locator(
          'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
        );
        await expect(locksBefore).toHaveCount(0);

        // Lose permission: install mock and reload
        await installDeniedServicesMock(page, ['vulnerability']);
        await page.reload();

        // Vulnerability columns should now show lock icons
        const locksAfter = page.locator(
          'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
        );
        await expect(locksAfter.first()).toBeVisible();
      } finally {
        await uninstallDeniedServicesMock(page);
      }
    });

    test('columns show data after gaining permission on reload', async ({
      page,
      systems,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('hbi.inventory-views-rbac', 'true');
        localStorage.setItem('ui.systems-view', 'true');
        localStorage.setItem('ui.inventory-views', 'true');
      });
      await installDeniedServicesMock(page, ['vulnerability']);

      try {
        await navigateToInventorySystemsFunc(page);

        const modal = columnManagementModal(page);
        await modal.open();
        for (const col of vulnerabilityColumns) {
          await modal.enableColumn(col);
        }
        await modal.save();

        // Verify lock icons are present
        const locksBefore = page.locator(
          'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
        );
        await expect(locksBefore.first()).toBeVisible();

        // Gain permission: remove mock (real response has no denied_services) and reload
        await uninstallDeniedServicesMock(page);
        await installDeniedServicesMock(page, []);
        await page.reload();

        // Lock icons should be gone — columns show real data
        const locksAfter = page.locator(
          'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
        );
        await expect(locksAfter).toHaveCount(0);
      } finally {
        await uninstallDeniedServicesMock(page);
      }
    });

    test('persisted column selection survives permission changes', async ({
      page,
      systems,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('hbi.inventory-views-rbac', 'true');
        localStorage.setItem('ui.systems-view', 'true');
        localStorage.setItem('ui.inventory-views', 'true');
      });

      try {
        // Step 1: Select vulnerability columns with full access
        await navigateToInventorySystemsFunc(page);

        const modal = columnManagementModal(page);
        await modal.open();
        for (const col of vulnerabilityColumns) {
          await modal.enableColumn(col);
        }
        await modal.save();

        // Verify columns are visible with real data
        const locksBefore = page.locator(
          'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
        );
        await expect(locksBefore).toHaveCount(0);

        // Step 2: Lose permission and reload
        await installDeniedServicesMock(page, ['vulnerability']);
        await page.reload();

        // Columns should still be in the table (persisted) but show lock icons
        const locksLocked = page.locator(
          'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
        );
        await expect(locksLocked.first()).toBeVisible();

        // Step 3: Regain permission and reload
        await uninstallDeniedServicesMock(page);
        await installDeniedServicesMock(page, []);
        await page.reload();

        // Columns should show real data again without re-selecting
        const locksUnlocked = page.locator(
          'td span[aria-label*="do not have the necessary Vulnerability permissions"]',
        );
        await expect(locksUnlocked).toHaveCount(0);

        // Verify columns are still visible (not removed from selection)
        const totalCvesHeader = page.getByRole('columnheader', {
          name: 'Total CVEs',
        });
        await expect(totalCvesHeader).toBeVisible();
      } finally {
        await uninstallDeniedServicesMock(page);
      }
    });
  });

  test.describe('Flag disabled', () => {
    test('no lock icons when flag is off even with denied_services in response', async ({
      page,
      systems,
    }) => {
      // Explicitly ensure flag is NOT set
      await page.addInitScript(() => {
        localStorage.removeItem('hbi.inventory-views-rbac');
        localStorage.setItem('ui.systems-view', 'true');
        localStorage.setItem('ui.inventory-views', 'true');
      });
      await installDeniedServicesMock(page, ['vulnerability', 'compliance']);

      try {
        await navigateToInventorySystemsFunc(page);

        const modal = columnManagementModal(page);
        await modal.open();
        for (const col of vulnerabilityColumns) {
          await modal.enableColumn(col);
        }
        await modal.save();

        // No lock icons should appear anywhere
        const lockIcons = page.locator(
          'td span[aria-label*="do not have the necessary"]',
        );
        await expect(lockIcons).toHaveCount(0);
      } finally {
        await uninstallDeniedServicesMock(page);
      }
    });
  });
});
