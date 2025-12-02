import { test, expect } from '@playwright/test';
import { type Locator, type Page } from '@playwright/test';

/**
 * Applies a conditional filter to the systems list in the UI.
 *
 * Opens the "Conditional filter" menu, selects the specified filter category,
 * and applies the given filter option. Some filters may not yet be implemented.
 *
 *  @param   {Page}          page       - The Playwright Page object representing the browser page.
 *  @param   {string}        filterName - The name of the filter to apply (e.g., "Status", "System type").
 *  @param   {string}        option     - The value to select for the given filter (e.g., "Active", "Package-based").
 *  @returns {Promise<void>}            - A promise that resolves when the filter is applied.
 *
 * @example
 * await filterSystemsWithConditionalFilter(page, 'Workspace', 'My Workspace');
 */
export const filterSystemsWithConditionalFilter = async (
  page: Page,
  filterName: string,
  option: string,
) => {
  let optionCheckbox: Locator | undefined = undefined;
  // 1. SELECT FILER
  await page.getByRole('button', { name: 'Conditional filter toggle' }).click();
  // Wait for the filter menu to be visible before proceeding
  await page
    .getByRole('menuitem', { name: filterName })
    .waitFor({ state: 'visible' });
  await page.getByRole('menuitem', { name: filterName }).click();

  // 2. SELECT OPTION
  if (filterName === 'Workspace') {
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    // TODO: uncomment when issue is resolved https://issues.redhat.com/browse/RHINENG-20990
    if (!(option === 'Ungrouped hosts')) {
      await page.getByRole('textbox', { name: 'Type to filter' }).fill(option);
      await page.waitForTimeout(100);
    }
    optionCheckbox = page.getByText(option, { exact: true }).first();
    await expect(optionCheckbox).toBeVisible({ timeout: 10000 });
    await optionCheckbox.click();
  } else if (filterName === 'Data collector') {
    // TODO: Implement logic to select the Data Collector filter option.
    // Logic not implemented yet. Test continues without filtering.
  } else if (filterName === 'Status') {
    // TODO: Implement logic to select the Status filter option.
    // Logic not implemented yet. Test continues without filtering.
  } else if (filterName === 'Tags') {
    // TODO: Implement logic to select the Tags filter option.
    // Logic not implemented yet. Test continues without filtering.
  } else if (filterName === 'System type') {
    await page.getByRole('button', { name: 'Options menu' }).click();
    optionCheckbox = page.getByText(option, { exact: true });
    await expect(optionCheckbox).toBeVisible({ timeout: 10000 });
    await optionCheckbox.click();
  } else if (filterName === 'Operating system') {
    await page.getByRole('button', { name: 'Group filter' }).nth(1).click();
    await page.getByRole('checkbox', { name: option, exact: true }).check();
  }
  // wait for table to be filtered
  await page.locator('body').click(); //to make sure menu is closed
  await page.waitForSelector('.loading-spinner', { state: 'hidden' });
  await page.waitForTimeout(100);
};

/**
 * Asserts that all elements found by the provided locator have the exact expected text.
 *
 * This function dynamically retrieves the number of elements matched by the locator,
 * builds an array with the expected text repeated for each element,
 * and verifies that every element has the expected value.
 * TODO: Add check if we excpect to find 0 rows
 *
 *  @param   {Locator}       rowLocator   - A Playwright Locator representing a group of elements to check (e.g., all 'td[data-label="Workspace"]').
 *  @param   {string}        expectedText - The exact text expected in each matching element (e.g., system name "rhel_test", OS "RHEL 9.5").
 *  @returns {Promise<void>}              - A promise that resolves when the assertion passes or rejects if any element's text does not match.
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
 *  @param   {Page}          page - The Playwright Page object to interact with.
 *  @param   {string}        name - The name to enter into the "Filter by name" input field.
 *  @returns {Promise<void>}      A promise that resolves once the name has been filled in.
 *
 * @example
 * await searchByName(page, 'my-system-name');
 */
export const searchByName = async (page: Page, name: string): Promise<void> => {
  const searchInput = page.locator('input[placeholder="Filter by name"]');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(searchInput).toBeVisible();
  await searchInput.fill(name);
};

/**
 * Checks if all elements matched by a locator have text that matches a given pattern.
 *  @param locator Playwright Locator object (must point to multiple elements).
 *  @param pattern Regular expression to test against each element's text.
 */
export async function assertAllContain(
  locator: Locator,
  pattern: RegExp,
): Promise<void> {
  // Wait for at least one element to be visible
  await expect(locator.first()).toBeVisible({ timeout: 10000 });
  // Wait for all elements to be visible before reading text
  const count = await locator.count();
  expect(count).toBeGreaterThanOrEqual(1);
  for (let i = 0; i < count; i++) {
    await expect(locator.nth(i)).toBeVisible({ timeout: 5000 });
  }
  const allTexts = await locator.allTextContents();
  const allMatch = allTexts.every((text) => pattern.test(text));
  expect(allMatch).toBe(true);
}
