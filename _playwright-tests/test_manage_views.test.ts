import { expect } from '@playwright/test';
import { navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { test } from './helpers/fixtures';
import { columnManagementModal } from './helpers/views/columnManagementModal';
import {
  totalDefaultColumns,
  malwareColumns,
  vulnerabilityColumns,
  allSystemsColumns,
} from './helpers/views/columnHelpers';
import { randomUUID } from 'crypto';
import {
  filterSystemsWithConditionalFilter,
  toolbarFilterHelper,
} from './helpers/filterHelpers';
import { manageViewHelper } from './helpers/views/manageViewsHelper';

const DEFAULT_PREFIX = 'automated-test';
const ALL_SYSTEMS_VIEW = 'All systems';

test.describe(
  'Inventory Views: Manage views CRUD operations',
  {
    tag: ['@inventory-views'],
    annotation: {
      type: 'jira',
      description: 'https://redhat.atlassian.net/browse/RHINENG-28042',
    },
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await navigateToInventorySystemsFunc(page);
    });

    test('User creates a new view, renames it, and deletes it', async ({
      page,
    }) => {
      const viewName = `${DEFAULT_PREFIX}-${randomUUID()}`;
      const renamedView = `${viewName}-renamed`;
      const manageView = manageViewHelper(page);

      await test.step(`Creates new view`, async () => {
        await manageView.saveAs(viewName);
        await manageView.verifyActiveView(viewName);
      });

      await test.step(`Renames the view`, async () => {
        await manageView.rename(renamedView);
        await manageView.verifyActiveView(renamedView);
      });

      await test.step(`Deletes active view`, async () => {
        await manageView.delete(renamedView);
      });

      await test.step(`Verifies active view now is default view after deletion`, async () => {
        await expect(manageView.selectedView).toContainText(ALL_SYSTEMS_VIEW);
      });
    });
  },
);

test.describe(
  'Inventory Views: Custom view',
  {
    tag: ['@inventory-views'],
    annotation: {
      type: 'jira',
      description: 'https://redhat.atlassian.net/browse/RHINENG-28042',
    },
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await navigateToInventorySystemsFunc(page);
    });

    const viewA = `${DEFAULT_PREFIX}-${randomUUID()}`;
    const viewB = `${DEFAULT_PREFIX}-${randomUUID()}`;
    const viewC = `${DEFAULT_PREFIX}-${randomUUID()}`;

    const configurationA = {
      columns: [...vulnerabilityColumns, ...allSystemsColumns],
      columnsCount: vulnerabilityColumns.length + totalDefaultColumns - 1, // tags columns currenlty not be able to be added to custom view
      filters: [
        {
          filter: 'System type',
          value: 'Package-based system',
        },
      ],
    };
    const configurationB = {
      columns: [
        ...vulnerabilityColumns,
        ...malwareColumns,
        ...allSystemsColumns,
      ],
      columnsCount:
        vulnerabilityColumns.length +
        malwareColumns.length +
        totalDefaultColumns -
        1, // tags columns currenlty not be able to be added to custom view
      filters: [],
    };

    const configurationC = {
      columns: vulnerabilityColumns,
      columnsCount: vulnerabilityColumns.length + 3, // +3 for checkbox, name and per-row actions
      filters: [
        {
          filter: 'System type',
          value: 'Image-based system',
        },
      ],
    };

    const configurationUpdatedC = {
      columns: [...vulnerabilityColumns, ...malwareColumns],
      columnsCount: vulnerabilityColumns.length + malwareColumns.length + 3, // +3 for checkbox, name and per-row actions
    };

    test('User creates custom views with own configuration', async ({
      page,
    }) => {
      const manageView = manageViewHelper(page);
      const manageColumnsModal = columnManagementModal(page);

      await test.step(`Creates view ${viewA} with custom configuration`, async () => {
        await manageView.verifyActiveView(ALL_SYSTEMS_VIEW);

        // Open column management modal and apply Vulnerability columns
        await manageColumnsModal.open();
        for (const column of configurationA.columns) {
          await manageColumnsModal.enableColumn(column);
        }
        await manageColumnsModal.save();

        // Apply filter
        await filterSystemsWithConditionalFilter(
          page,
          configurationA.filters[0].filter,
          configurationA.filters[0].value,
        );

        await manageView.saveAs(viewA);
        await manageView.verifyActiveView(viewA);
      });

      await test.step(`Modifies current view ${viewA} and saves as ${viewB}`, async () => {
        await manageView.verifyActiveView(viewA);

        // Open column management modal and apply Malware columns
        await manageColumnsModal.open();
        for (const column of malwareColumns) {
          await manageColumnsModal.enableColumn(column);
        }
        await manageColumnsModal.save();

        const resetFiltersButton = page.getByRole('button', {
          name: 'Clear filters',
        });
        await expect(resetFiltersButton).toBeVisible();
        await resetFiltersButton.click();

        await manageView.saveAs(viewB);
        await manageView.verifyActiveView(viewB);
      });

      await test.step(`Verifies ${ALL_SYSTEMS_VIEW} view has no custom configuration`, async () => {
        await manageView.selectView(ALL_SYSTEMS_VIEW);
        // All systems view should have no custom configutaion,
        // so all default columns should be visible and no filters applied
        await manageView.verifyActiveView(ALL_SYSTEMS_VIEW);

        for (const column of allSystemsColumns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(column) }),
          ).toBeVisible({ timeout: 10000 });
        }

        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(totalDefaultColumns, {
          timeout: 10000,
        });
      });

      await test.step(`Navigate to view ${viewB} and verify its configuration persists`, async () => {
        await manageView.selectView(viewB);
        await manageView.verifyActiveView(viewB);

        // Verify expected columns are visible
        for (const column of configurationB.columns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(column) }),
          ).toBeVisible({ timeout: 10000 });
        }

        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(configurationB.columnsCount, {
          timeout: 10000,
        });

        // Verify no filters are applied
        const resetFiltersButton = page.getByRole('button', {
          name: 'Clear filters',
        });
        await expect(resetFiltersButton).toBeHidden();
      });

      await test.step(`Navigate to view ${viewA} and verify its configuration persists`, async () => {
        await manageView.selectView(viewA);
        await manageView.verifyActiveView(viewA);
        const filterToolbar = toolbarFilterHelper(page);

        // Verify expected columns are visible
        for (const column of configurationA.columns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(column) }),
          ).toBeVisible({ timeout: 10000 });
        }

        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(configurationA.columnsCount, {
          timeout: 10000,
        });

        await filterToolbar.verifyFiltersApplied({
          [configurationA.filters[0].filter]: configurationA.filters[0].value,
        });
      });

      await test.step(`Cleans up test view`, async () => {
        await manageView.selectView(viewA);
        await manageView.delete(viewA);

        await manageView.selectView(viewB);
        await manageView.delete(viewB);
      });
    });

    test('User updates custom view with new configuration', async ({
      page,
    }) => {
      const manageView = manageViewHelper(page);
      const manageColumnsModal = columnManagementModal(page);

      await test.step(`Creates view ${viewC} with custom configuration`, async () => {
        // selects columns for viewC
        await manageColumnsModal.open();
        for (const column of configurationA.columns) {
          await manageColumnsModal.enableColumn(column);
        }
        for (const column of ['Workspace', 'Tags', 'OS', 'Last seen']) {
          await manageColumnsModal.disableColumn(column);
        }
        await manageColumnsModal.save();

        // Applies filter
        await filterSystemsWithConditionalFilter(
          page,
          configurationC.filters[0].filter,
          configurationC.filters[0].value,
        );

        await manageView.saveAs(viewC);
        await manageView.verifyActiveView(viewC);
      });

      await test.step(`Switches between views and verifies ${viewC} has expected configuration`, async () => {
        await manageView.selectView(ALL_SYSTEMS_VIEW);
        await manageView.verifyActiveView(ALL_SYSTEMS_VIEW);

        await manageView.selectView(viewC);
        await manageView.verifyActiveView(viewC);

        // Verify expected columns are visible
        for (const column of configurationC.columns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(column) }),
          ).toBeVisible({ timeout: 10000 });
        }

        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(configurationC.columnsCount, {
          timeout: 10000,
        });

        const filterToolbar = toolbarFilterHelper(page);
        await filterToolbar.verifyFiltersApplied({
          [configurationC.filters[0].filter]: configurationC.filters[0].value,
        });
      });

      await test.step(`Modify current view ${viewC} and update its configuration`, async () => {
        // selects new columns for viewC
        await manageColumnsModal.open();
        for (const column of malwareColumns) {
          await manageColumnsModal.enableColumn(column);
        }
        await manageColumnsModal.save();

        await manageView.save(viewC);
        await manageView.verifyActiveView(viewC);
      });

      await test.step(`Switches between views and verifies ${viewC} has new configuration`, async () => {
        await manageView.selectView(ALL_SYSTEMS_VIEW);
        await manageView.verifyActiveView(ALL_SYSTEMS_VIEW);

        await manageView.selectView(viewC);
        await manageView.verifyActiveView(viewC);

        // new columns should be visible after update
        for (const column of configurationUpdatedC.columns) {
          await expect(
            page.locator('th').filter({ hasText: new RegExp(column) }),
          ).toBeVisible({ timeout: 10000 });
        }

        const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
        await expect(visibleHeaders).toHaveCount(
          configurationUpdatedC.columnsCount,
          { timeout: 10000 },
        );

        // filter should be same after update
        const filterToolbar = toolbarFilterHelper(page);
        await filterToolbar.verifyFiltersApplied({
          [configurationC.filters[0].filter]: configurationC.filters[0].value,
        });
      });

      await test.step(`Cleans up test view`, async () => {
        await manageView.selectView(viewC);
        await manageView.delete(viewC);
      });
    });
  },
);
