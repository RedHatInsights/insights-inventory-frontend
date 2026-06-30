import { expect } from '@playwright/test';
import { type Page, type Locator } from '@playwright/test';
import { parseLastSeenToDays } from './filterHelpers';

const NOT_AVAILABLE = 'N/A';

// Default columns from inventory/columnDefinitions.tsx
export const defaultInventoryColumns = [
  'Name',
  'Workspace',
  'Tags',
  'OS',
  'Last seen',
];
// Total columns includes checkbox (first) and per-row actions (last)
export const totalDefaultColumns = defaultInventoryColumns.length + 2;

export const inventoryColumns = [
  'Created',
  'Workload',
  'Status',
  'Vendor',
  'Infrastructure',
];

export const advisorColumns = [
  'Recommendations',
  'Incidents',
  'Critical',
  'Important',
  'Moderate',
  'Low',
];

export const complianceColumns = ['Last compliance scan', 'Policies'];

export const patchColumns = ['Installable advisories', 'Template'];

export const malwareColumns = [
  'Last malware status',
  'Total malware matches',
  'Last malware scan',
];

export const vulnerabilityColumns = [
  'Total CVEs',
  'Important CVEs',
  'Critical CVEs',
  'CVEs with security rules',
  'CVEs with known exploits',
];

export const allColumns = [
  ...advisorColumns,
  ...complianceColumns,
  ...patchColumns,
  ...malwareColumns,
  ...inventoryColumns,
  ...vulnerabilityColumns,
];

/**
 * Opens the 'Manage columns' modal from the systems view toolbar.
 * Wraps the action in toPass to handle loading skeletons and dropdown rendering.
 * Verifies the dialog is visible before returning.
 *  @param {Page}   page      - The Playwright page instance.
 *  @param {number} [timeout] - Optional timeout for the toPass block.
 */
export async function openManageColumnsModal(page: Page, timeout = 45000) {
  await expect(async () => {
    // 1. Wait for the loading table skeleton to disappear
    await expect(
      page.locator('[data-ouia-component-id="SkeletonTable"]'),
    ).toBeHidden();

    // 2. Locate, verify, and click the toolbar actions dropdown
    const toolbarActionsButton = page.locator(
      "[data-ouia-component-id='systems-view-toolbar-actions-menu-dropdown-toggle']",
    );
    await expect(toolbarActionsButton).toBeVisible();
    await expect(toolbarActionsButton).toBeEnabled();
    await toolbarActionsButton.click();

    // 3. Locate, verify, and click the 'Manage columns' button inside the dropdown
    const manageColumnsButton = page
      .locator('button')
      .filter({ hasText: 'Manage columns' });
    await expect(manageColumnsButton).toBeEnabled();
    await manageColumnsButton.click();

    // 4. Verify the column management dialog is visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  }).toPass({ timeout });
}

/**
 * Checks if the systems table is horizontally scrollable.
 *  @param   {Page}             page - The Playwright page instance.
 *  @returns {Promise<boolean>}      - True if the table is scrollable, false otherwise.
 */
export async function isTableHorizontallyScrollable(
  page: Page,
): Promise<boolean> {
  return await page.evaluate(() => {
    const scrollContainer = document.querySelector(
      '.ins-c-systems-view-table-scroll',
    );
    if (!scrollContainer) return false;
    return scrollContainer.scrollWidth > scrollContainer.clientWidth;
  });
}

/**
 * Checks if an element is actually visible in the viewport (not just in the DOM).
 *  @param   {Locator}          element - The element locator to check.
 *  @returns {Promise<boolean>}         - True if the element is visible in the viewport.
 */
export async function isVisibleInViewport(element: Locator): Promise<boolean> {
  return await element.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const scrollContainer = document.querySelector(
      '.ins-c-systems-view-table-scroll',
    );
    if (!scrollContainer) return false;

    const containerRect = scrollContainer.getBoundingClientRect();

    // Check if element is within the visible viewport of the scroll container
    return (
      rect.top >= containerRect.top &&
      rect.left >= containerRect.left &&
      rect.bottom <= containerRect.bottom &&
      rect.right <= containerRect.right
    );
  });
}

/**
 * Scrolls the table horizontally to a specific position.
 *  @param {Page}   page     - The Playwright page instance.
 *  @param {number} position - Position to scroll to (0 = left, 0.5 = middle, 1 = right).
 */
export async function scrollTableToPosition(page: Page, position: number) {
  await page.evaluate((pos) => {
    const scrollContainer = document.querySelector(
      '.ins-c-systems-view-table-scroll',
    );
    if (scrollContainer) {
      scrollContainer.scrollLeft = scrollContainer.scrollWidth * pos;
    }
  }, position);
}

/**
 * Scrolls the table horizontally to bring a column into view, avoiding sticky column interference.
 *  @param {Locator} columnHeader - The column header button locator.
 */
export async function scrollColumnIntoView(columnHeader: Locator) {
  await columnHeader.evaluate((button) => {
    const th = button.closest('th');
    const scrollContainer = document.querySelector(
      '.ins-c-systems-view-table-scroll',
    );
    if (th && scrollContainer) {
      const thRect = th.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollNeeded = thRect.right - containerRect.right + 100;
      if (scrollNeeded > 0) {
        scrollContainer.scrollLeft += scrollNeeded;
      }
    }
  });
}

/**
 * Validates that the column is sorted in the expected direction.
 *  @param {Page}    page         - The Playwright page instance.
 *  @param {Locator} columnHeader - The column header button locator.
 *  @param {string}  direction    - Expected sort direction ('ascending' or 'descending').
 */
export async function validateSortDirection(
  page: Page,
  columnHeader: Locator,
  direction: 'ascending' | 'descending',
) {
  await expect(page).toHaveURL(/order_by=|sort=/);
  await expect(async () => {
    const finalSort = await columnHeader
      .locator('..')
      .getAttribute('aria-sort');
    expect(finalSort).toBe(direction);
  }).toPass({ timeout: 5000 });
}

/**
 * Column validation type - defines how to validate a column's sort order.
 */
type ColumnValidationType = 'status' | 'date' | 'numeric';

/**
 * Column validation configuration.
 */
interface ColumnValidationConfig {
  type: ColumnValidationType;
  expectedOrder?: string[]; // For 'status' type
  ignoreValues?: string[]; // Values to skip (e.g., NOT_AVAILABLE)
}

/**
 * Column validation configurations for different columns.
 */
const COLUMN_VALIDATIONS: Record<string, ColumnValidationConfig> = {
  Status: {
    type: 'status',
    expectedOrder: ['Stale warning', 'Stale', 'Fresh'],
  },
  'Last malware scan': {
    type: 'date',
    ignoreValues: [NOT_AVAILABLE],
  },
  'Last compliance scan': {
    type: 'date',
    ignoreValues: [NOT_AVAILABLE],
  },
  Recommendations: {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
  Incidents: {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
  'Installable advisories': {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
  'Total CVEs': {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
  'Critical CVEs': {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
  'Important CVEs': {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
  'CVEs with security rules': {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
  'CVEs with known exploits': {
    type: 'numeric',
    ignoreValues: [NOT_AVAILABLE],
  },
};

/**
 * Validates column sorting order based on column type.
 *  @param {Page}   page       - The Playwright page instance.
 *  @param {string} columnName - The name of the column to validate.
 *  @param {string} direction  - Sort direction ('ascending' or 'descending').
 */
export async function validateDataColumnSortOrder(
  page: Page,
  columnName: string,
  direction: 'ascending' | 'descending',
) {
  const config = COLUMN_VALIDATIONS[columnName];
  if (!config) {
    console.warn(`No validation config for column: ${columnName}`);
    return;
  }

  // Wait for table to update after sort (skeleton disappears when data is loaded)
  await expect(
    page.locator('[data-ouia-component-id="SkeletonTable"]'),
  ).toBeHidden();

  // Find the index of the column
  const headers = await page.locator('th').all();
  let columnIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    const headerText = await headers[i].textContent();
    if (headerText?.includes(columnName)) {
      columnIndex = i;
      break;
    }
  }

  expect(columnIndex).toBeGreaterThan(-1);

  // Get all rows
  const rows = await page.locator('tbody tr').all();
  const columnValues: string[] = [];

  for (const row of rows) {
    const cells = await row.locator('td').all();
    if (cells.length > columnIndex) {
      const cellText = await cells[columnIndex].textContent();
      if (cellText) {
        const trimmedText = cellText.trim();
        // Skip ignored values like NOT_AVAILABLE
        if (
          !config.ignoreValues ||
          !config.ignoreValues.includes(trimmedText)
        ) {
          columnValues.push(trimmedText);
        }
      }
    }
  }

  // Validate based on column type
  if (config.type === 'status') {
    validateStatusOrder(columnValues, config.expectedOrder!, direction);
  } else if (config.type === 'date') {
    validateDateOrder(columnValues, direction);
  } else if (config.type === 'numeric') {
    if (columnName === 'Installable advisories') {
      validateInstallableAdvisoriesOrder(columnValues, direction);
    } else {
      validateNumericOrder(columnValues, direction);
    }
  }
}

/**
 * Validates status column order.
 *  @param {string[]} values        - Array of status values from the table.
 *  @param {string[]} expectedOrder - Expected order of status values.
 *  @param {string}   direction     - Sort direction ('ascending' or 'descending').
 */
function validateStatusOrder(
  values: string[],
  expectedOrder: string[],
  direction: 'ascending' | 'descending',
) {
  const orderToValidate =
    direction === 'descending' ? [...expectedOrder].reverse() : expectedOrder;

  let lastSeen = '';
  let currentOrderIndex = 0;

  for (const value of values) {
    if (value !== lastSeen) {
      const valueIndex = orderToValidate.indexOf(value);
      expect(valueIndex).toBeGreaterThanOrEqual(currentOrderIndex);
      currentOrderIndex = valueIndex;
      lastSeen = value;
    }
  }
}

/**
 * Validates date column order (ascending = oldest first, descending = newest first).
 *  @param {string[]} values    - Array of date values from the table.
 *  @param {string}   direction - Sort direction ('ascending' or 'descending').
 */
function validateDateOrder(
  values: string[],
  direction: 'ascending' | 'descending',
) {
  let previousDays: number | null = null;

  for (const value of values) {
    const days = parseLastSeenToDays(value);

    if (days === -1) {
      console.warn(`Unable to parse date: "${value}"`);
      continue;
    }

    if (previousDays !== null) {
      if (direction === 'ascending') {
        // Ascending: oldest first (higher day values first)
        expect(days).toBeLessThanOrEqual(previousDays);
      } else {
        // Descending: newest first (lower day values first)
        expect(days).toBeGreaterThanOrEqual(previousDays);
      }
    }

    previousDays = days;
  }
}

/**
 * Validates numeric column order.
 *  @param {string[]} values    - Array of numeric values from the table.
 *  @param {string}   direction - Sort direction ('ascending' or 'descending').
 */
function validateNumericOrder(
  values: string[],
  direction: 'ascending' | 'descending',
) {
  let previousValue: number | null = null;

  for (const value of values) {
    const numericValue = parseInt(value, 10);

    if (isNaN(numericValue)) {
      console.warn(`Unable to parse number: "${value}"`);
      continue;
    }

    if (previousValue !== null) {
      if (direction === 'ascending') {
        // Ascending: smallest first
        expect(numericValue).toBeGreaterThanOrEqual(previousValue);
      } else {
        // Descending: largest first
        expect(numericValue).toBeLessThanOrEqual(previousValue);
      }
    }

    previousValue = numericValue;
  }
}

/**
 * Parses Installable advisories text to extract RHSA (security) count.
 * The column sorts by security advisories count (patch:advisories_rhsa_installable).
 *  @param   {string} text - Text from the cell (e.g., "No installable advisories" or "Security advisories 5 Bug fixes 3").
 *  @returns {number}      - RHSA count, or 0 if "No installable advisories"
 */
function parseInstallableAdvisories(text: string): number {
  const trimmedText = text.trim();

  // "No installable advisories" means 0 security advisories
  if (trimmedText === 'No installable advisories') {
    return 0;
  }

  // Extract the first number that appears in the text (RHSA count is first when present)
  // The cell shows icons with counts, e.g., "Security advisories 5 Bug fixes 3"
  const match = trimmedText.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }

  console.warn(`Unable to parse Installable advisories: "${text}"`);
  return -1;
}

/**
 * Validates Installable advisories column order.
 * This column sorts by RHSA (security advisories) count.
 *  @param {string[]} values    - Array of values from the table.
 *  @param {string}   direction - Sort direction ('ascending' or 'descending').
 */
function validateInstallableAdvisoriesOrder(
  values: string[],
  direction: 'ascending' | 'descending',
) {
  let previousValue: number | null = null;

  for (const value of values) {
    const rhsaCount = parseInstallableAdvisories(value);

    if (rhsaCount === -1) {
      continue;
    }

    if (previousValue !== null) {
      if (direction === 'ascending') {
        // Ascending: smallest first
        expect(rhsaCount).toBeGreaterThanOrEqual(previousValue);
      } else {
        // Descending: largest first
        expect(rhsaCount).toBeLessThanOrEqual(previousValue);
      }
    }

    previousValue = rhsaCount;
  }
}
