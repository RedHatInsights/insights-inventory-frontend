import { test, expect } from '@playwright/test';
import { type Locator, type Page } from '@playwright/test';
import { isLegacyInventoryTableEnabled } from './constants';

const SKELETON_TABLE = '[data-ouia-component-id="SkeletonTable"]';

/** Pass as the `option` to pick whatever the first available choice happens to be. */
export const FIRST_AVAILABLE = '__first_available__';

/** Picks one option for an already-active filter attribute. */
type SelectFilterOption = (page: Page, option: string) => Promise<void>;

/**
 * Checkbox and single-select filters all render through DataViewSelectFilter,
 * so one routine drives every one of them. Only the active attribute's control
 * is mounted, which is what makes the shared default ouiaIds unambiguous.
 */
const chooseFromSelectMenu: SelectFilterOption = async (page, option) => {
  await page
    .getByRole('button', { name: 'Options menu' })
    .or(
      page.locator(
        '[data-ouia-component-id="DataViewCheckboxFilter-toggle"], [data-ouia-component-id="DataViewSingleSelectFilter-toggle"]',
      ),
    )
    .click();
  const menuOption = page
    .locator('[role="menu"]:visible')
    .getByText(option, { exact: true })
    .first();
  await expect(menuOption).toBeVisible({ timeout: 10000 });
  await menuOption.click();
};

const typeIntoNameFilter: SelectFilterOption = async (page, option) => {
  const input = page.getByPlaceholder('Filter by name');
  await expect(input).toBeVisible({ timeout: 10000 });
  await input.fill(option);
};

const chooseWorkspace: SelectFilterOption = async (page, option) => {
  const search = page.getByPlaceholder('Filter by workspace');
  await search.click();

  const workspaceOption = page.locator(
    '[data-ouia-component-id="FilterByGroupOption"]',
  );
  if (option !== 'Ungrouped hosts' && option !== FIRST_AVAILABLE) {
    await search.fill(option);
    await expect(workspaceOption).toHaveCount(1);
  }

  await expect(workspaceOption.first()).toBeVisible({ timeout: 100000 });
  await workspaceOption.first().click();
};

const chooseTag: SelectFilterOption = async (page, option) => {
  const input = page.getByPlaceholder('Filter by tags');
  await input.click();

  if (option === FIRST_AVAILABLE) {
    const firstTag = page
      .locator('[role="menuitem"]')
      .filter({
        has: page.locator('input[type="checkbox"]:not([aria-disabled="true"])'),
      })
      .first();
    await expect(firstTag).toBeVisible({ timeout: 100000 });
    await firstTag.getByRole('checkbox').check();
    return;
  }

  await input.fill(option);
  const tagOption = page.getByText(option, { exact: true }).first();
  await expect(tagOption).toBeVisible({ timeout: 100000 });
  await tagOption.click();
};

const chooseOperatingSystem: SelectFilterOption = async (page, option) => {
  await page
    .getByRole('button', { name: 'Group filter' })
    .or(
      page.locator(
        '[data-ouia-component-id="SystemsViewOperatingSystemsFilter"]',
      ),
    )
    .click();

  if (option !== FIRST_AVAILABLE) {
    await page.getByRole('checkbox', { name: option, exact: true }).check();
    return;
  }

  const firstVersion = page.locator('li[role="option"].pf-v6-u-pl-lg').first();
  await expect(firstVersion).toBeVisible({ timeout: 30000 });
  await firstVersion.getByRole('checkbox').check();
};

const chooseLastSeen: SelectFilterOption = async (page, option) => {
  const toggle = page.locator('button', { hasText: 'Filter by last seen' });
  await expect(toggle).toBeVisible({ timeout: 10000 });
  await toggle.click();

  const preset = page.getByRole('option', { name: option });
  await expect(preset).toBeVisible({ timeout: 10000 });
  await preset.click();
};

/**
 * Keys are the filter titles shown in the attribute dropdown.
 */
const FILTER_OPTION_SELECTORS: Record<string, SelectFilterOption> = {
  Name: typeIntoNameFilter,
  Status: chooseFromSelectMenu,
  'Operating system': chooseOperatingSystem,
  'Data collector': chooseFromSelectMenu,
  'System type': chooseFromSelectMenu,
  Workspace: chooseWorkspace,
  'Last seen': chooseLastSeen,
  Tags: chooseTag,
  Workload: chooseFromSelectMenu,
  'Recommendation severity': chooseFromSelectMenu,
  Incidents: chooseFromSelectMenu,
  'CVE severity': chooseFromSelectMenu,
  'Known exploit': chooseFromSelectMenu,
  'CVEs with security rules': chooseFromSelectMenu,
};

/** Names accepted by `filterSystemsWithConditionalFilter`. */
export const SUPPORTED_FILTERS = Object.keys(FILTER_OPTION_SELECTORS);

/** Makes `filterName` the active attribute, revealing its value control. */
const activateFilterAttribute = async (page: Page, filterName: string) => {
  await page
    .locator(
      '[data-ouia-component-id="DataViewFilters"] button.pf-v6-c-menu-toggle',
    )
    .first()
    .or(page.getByRole('button', { name: 'Conditional filter toggle' }))
    .click();

  const attribute = page.getByRole('menuitem', { name: filterName });
  await attribute.waitFor({ state: 'visible' });
  await attribute.click();
};

/**
 * Applies a toolbar filter to the systems list.
 *
 * The toolbar is an attribute-value control: an attribute dropdown chooses
 * which filter is active, and only that filter renders a value control. So
 * this selects the attribute, then delegates to that filter's own routine.
 *
 *  @param page       - The Playwright Page object representing the browser page.
 *  @param filterName - Filter title as shown in the attribute dropdown (e.g. "Status").
 *  @param option     - Value to select (e.g. "Stale"), or `FIRST_AVAILABLE` to take whatever is offered.
 *  @returns          - A promise that resolves once the table has re-filtered.
 *  @throws {Error}    If `filterName` is not a filter this helper knows how to drive.
 *
 * @example
 * await filterSystemsWithConditionalFilter(page, 'Workspace', 'My Workspace');
 * await filterSystemsWithConditionalFilter(page, 'Tags', FIRST_AVAILABLE);
 */
export const filterSystemsWithConditionalFilter = async (
  page: Page,
  filterName: string,
  option: string,
) => {
  const selectOption = FILTER_OPTION_SELECTORS[filterName];
  if (!selectOption) {
    throw new Error(
      `No option selector for filter "${filterName}". ` +
        `Supported filters: ${SUPPORTED_FILTERS.join(', ')}.`,
    );
  }

  await activateFilterAttribute(page, filterName);
  await selectOption(page, option);

  await page.mouse.click(0, 0); // make sure the menu is closed
  await page
    .locator(SKELETON_TABLE)
    .waitFor({ state: 'hidden', timeout: 10000 });
};

/**
 * Asserts that all elements found by the provided locator have the exact expected text.
 *
 * This function dynamically retrieves the number of elements matched by the locator,
 * builds an array with the expected text repeated for each element,
 * and verifies that every element has the expected value.
 * TODO: Add check if we excpect to find 0 rows
 *
 *  @param rowLocator   - A Playwright Locator representing a group of elements to check (e.g., all 'td[data-label="Workspace"]').
 *  @param expectedText - The exact text expected in each matching element (e.g., system name "rhel_test", OS "RHEL 9.5").
 *  @returns            - A promise that resolves when the assertion passes or rejects if any element's text does not match.
 *
 * @example
 * await expectAllRowsHaveText(page.locator('td[data-label="Name"]'), 'test_host');
 */
export const expectAllRowsHaveText = async (
  rowLocator: Locator,
  expectedText: string,
) => {
  const expectedCount = await rowLocator.count();
  for (let i = 0; i < expectedCount; i++) {
    const row = rowLocator.nth(i);
    await expect(row).toHaveText(expectedText);
  }
};

/**
 * Searches for an item on the page by entering its name into the "Filter by name" input field.
 *
 * This function ensures the search input is visible, reloads the page to guarantee a clean state
 * (waiting for the network to be idle), and then fills the specified name into the input field.
 *
 *  @param page - The Playwright Page object to interact with.
 *  @param name - The name to enter into the "Filter by name" input field.
 *  @returns    A promise that resolves once the name has been filled in.
 *
 * @example
 * await searchByName(page, 'my-system-name');
 */
export const searchByName = async (page: Page, name: string): Promise<void> => {
  const searchInput = page.locator('input[placeholder="Filter by name"]');
  await page.reload({
    waitUntil: isLegacyInventoryTableEnabled ? 'networkidle' : 'load',
  });
  await expect(searchInput).toBeVisible({ timeout: 30000 });
  await searchInput.fill(name);
  const skeleton = page.locator(SKELETON_TABLE);
  await skeleton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  await skeleton.waitFor({ state: 'hidden', timeout: 30000 });
};

export const waitForTableKebabReady = async (
  page: Page,
  rowNameMatch: RegExp,
): Promise<Locator> => {
  const row = page.getByRole('row', { name: rowNameMatch });
  const kebab = row.getByLabel('Kebab toggle');

  await expect(async () => {
    await expect(page.locator(SKELETON_TABLE)).toBeHidden();
    await expect(row).toBeVisible();
    await expect(kebab).toBeVisible();
    await expect(kebab).toBeEnabled();
  }).toPass({ timeout: 45000 });

  return kebab;
};

/**
 * Checks if all elements matched by a locator have text that matches a given pattern.
 *
 *  @param locator - Playwright Locator object (must point to multiple elements).
 *  @param pattern - Regular expression to test against each element's text.
 *  @returns       - A promise that resolves when the assertion passes.
 */
export async function assertAllContain(
  locator: Locator,
  pattern: RegExp,
): Promise<void> {
  // Wait for at least one element to be visible
  await expect(locator.first()).toBeVisible({ timeout: 10000 });

  // Wait for all elements to match the pattern (retry until stable)
  await expect(async () => {
    const count = await locator.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Wait for all elements to be visible before reading text
    for (let i = 0; i < count; i++) {
      await expect(locator.nth(i)).toBeVisible({ timeout: 5000 });
    }

    const allTexts = await locator.allTextContents();
    const allMatch = allTexts.every((text) => pattern.test(text));
    expect(allMatch).toBe(true);
  }).toPass({ timeout: 15000, intervals: [1000, 2000, 5000] });
}

/**
 * Parses relative time text (e.g., "3 hours ago", "5 days ago") to approximate days.
 *
 *  @param text - The relative time text to parse.
 *  @returns    - The number of days represented by the text, or -1 if unknown format.
 *
 * @example
 * parseLastSeenToDays('3 hours ago'); // returns 0
 * parseLastSeenToDays('5 days ago'); // returns 5
 * parseLastSeenToDays('2 weeks ago'); // returns 14
 */
export const parseLastSeenToDays = (text: string): number => {
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

/**
 * Reads every applied filter chip off the toolbar, keyed by filter category.
 *
 *  @param page - The Playwright Page object.
 *  @returns    Applied values per category, each sorted for stable comparison.
 */
export const getAppliedFilterChips = async (
  page: Page,
): Promise<Record<string, string[]>> => {
  const groups = page.locator('.pf-v6-c-toolbar__group .pf-v6-c-label-group');
  const applied: Record<string, string[]> = {};

  for (let i = 0; i < (await groups.count()); i++) {
    const group = groups.nth(i);
    const category = (
      await group.locator('.pf-v6-c-label-group__label').innerText()
    ).trim();
    const values = (
      await group.locator('.pf-v6-c-label__text').allInnerTexts()
    ).map((text) => text.trim());
    applied[category] = values.sort();
  }

  return applied;
};

export type ToolbarFilterHelper = {
  filterToolbarGroup: Locator;
  verifyFilterApplied: (category: string, value: string) => Promise<void>;
  verifyFilterValues: (category: string, values: string[]) => Promise<void>;
  verifyFiltersApplied: (
    expectedFilters: Record<string, string | string[]>,
  ) => Promise<void>;
};
/**
 * Helper for verifying toolbar filters in the Inventory UI.
 * @example * const filters = toolbarFilterHelper(page);
 * await filters.verifyFilterApplied('Status', 'Stale');
 *  await filters.verifyFiltersApplied({ 'Operating system': ['RHEL 9.6', 'RHEL 9.4'] });
 */
export function toolbarFilterHelper(page: Page): ToolbarFilterHelper {
  const filterToolbarGroup = page.locator('.pf-v6-c-toolbar__group');
  const verifyFilterApplied = async (
    category: string,
    value: string,
  ): Promise<void> => {
    const categoryGroup = filterToolbarGroup
      .locator('.pf-v6-c-label-group')
      .filter({
        has: page.locator('.pf-v6-c-label-group__label', { hasText: category }),
      });
    await expect(categoryGroup).toBeVisible();
    const chipValue = categoryGroup.locator('.pf-v6-c-label__text', {
      hasText: value,
    });
    await expect(chipValue).toBeVisible();
  };
  const verifyFilterValues = async (
    category: string,
    values: string[],
  ): Promise<void> => {
    for (const value of values) {
      await verifyFilterApplied(category, value);
    }
  };
  return {
    filterToolbarGroup,
    verifyFilterApplied,
    verifyFilterValues,
    /**
     * Validates multiple active filters in one call. Each category maps to either
     * a single expected value or an array of expected values.
     * Example: await verifyFiltersApplied({ 'Operating system': ['RHEL 9.6', 'RHEL 9.4'], 'Status': 'Stale' });
     */
    async verifyFiltersApplied(
      expectedFilters: Record<string, string | string[]>,
    ): Promise<void> {
      for (const [category, value] of Object.entries(expectedFilters)) {
        if (Array.isArray(value)) {
          await verifyFilterValues(category, value);
        } else {
          await verifyFilterApplied(category, value);
        }
      }
    },
  };
}
