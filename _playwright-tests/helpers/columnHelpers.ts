import { expect } from '@playwright/test';
import { type Page, type Locator } from '@playwright/test';
import { parseLastSeenToDays } from './filterHelpers';
import { columnManagementModal } from './columnManagementModal';

export { columnManagementModal } from './columnManagementModal';

const NOT_AVAILABLE = '--';

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

/**
 * Returns visible inventory column header names in left-to-right table order.
 */
export async function getVisibleInventoryColumnOrder(
  page: Page,
): Promise<string[]> {
  const headerTexts = (await page.locator('th').allTextContents()).map((text) =>
    text.trim(),
  );

  return headerTexts
    .map((text, index) => ({
      index,
      column: defaultInventoryColumns.find((name) =>
        new RegExp(name).test(text),
      ),
    }))
    .filter(
      (item): item is { index: number; column: string } =>
        item.column !== undefined,
    )
    .sort((a, b) => a.index - b.index)
    .map((item) => item.column);
}

/**
 * Asserts a column is hidden and the table has one fewer visible header than default.
 * Retries via toPass to allow persisted column prefs to load after navigation/reload.
 */
export async function expectInventoryColumnHidden(
  page: Page,
  columnName: string,
) {
  const visibleHeaders = page.locator('th').filter({ hasText: /.+/ });
  const columnHeader = page
    .locator('th')
    .filter({ hasText: new RegExp(`^${columnName}$`) });

  await expect(async () => {
    await expect(columnHeader).toBeHidden();
    await expect(visibleHeaders).toHaveCount(totalDefaultColumns - 1);
  }).toPass({ timeout: 30000 });
}

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

/** @deprecated Use columnManagementModal(page).open() */
export const openManageColumnsModal = (page: Page, timeout = 45000) =>
  columnManagementModal(page).open(timeout);

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
 *  @param {Locator} element - The element to scroll into view (column header button or table cell).
 */
export async function scrollColumnIntoView(element: Locator) {
  await element.evaluate((el) => {
    const cell = el.closest('th') || el.closest('td');
    const scrollContainer = document.querySelector(
      '.ins-c-systems-view-table-scroll',
    );
    if (!cell || !scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();

    // Effective left boundary: right edge of the sticky-left border column (Name column).
    // Without this, scrolling right can push the target cell behind the sticky Name column.
    const stickyLeftCell = scrollContainer.querySelector(
      '.pf-v6-c-table__sticky-cell.pf-m-border-right',
    );
    const leftBound = stickyLeftCell
      ? stickyLeftCell.getBoundingClientRect().right
      : containerRect.left;

    // Effective right boundary: left edge of the sticky-right action column.
    const stickyRightCell = scrollContainer.querySelector(
      '.pf-v6-c-table__action.pf-v6-c-table__sticky-cell',
    );
    const rightBound = stickyRightCell
      ? stickyRightCell.getBoundingClientRect().left
      : containerRect.right;

    const MARGIN = 20;

    // Step 1: scroll right if cell's right edge overflows the effective right boundary.
    const rightOverflow =
      cell.getBoundingClientRect().right - rightBound + MARGIN;
    if (rightOverflow > 0) {
      scrollContainer.scrollLeft += rightOverflow;
    }

    // Step 2: after the potential right-scroll, check if the cell's left edge is still
    // hidden behind the sticky left column. getBoundingClientRect() forces a reflow so
    // the value reflects the updated scrollLeft.
    const leftUnderflow =
      leftBound - cell.getBoundingClientRect().left + MARGIN;
    if (leftUnderflow > 0) {
      scrollContainer.scrollLeft -= leftUnderflow;
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
