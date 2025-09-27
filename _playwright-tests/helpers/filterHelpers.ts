import { test, expect} from '@playwright/test';
import { type Locator, type Page } from '@playwright/test';

/**
 * Filters a list of systems using a conditional filter.
 * @param page The Playwright Page object.
 * @param filterName The name of the filter (e.g., 'Status', 'Type').
 * @param option The option value to select (e.g., 'Active', 'Development'). Can be null/undefined if filtering by checkbox only.
 * @async
 */
export const filterSystemsWithConditionalFilter = async (
    page: Page,
    filterName: string,
    option: string,
) => {
//   let filterOption: Locator | undefined = undefined;
  // 1. SELECT FILER 
  await page.getByRole('button', { name: 'Conditional filter toggle' }).click();
  // wait for the dropdown to open - otherwise we type too soon and the search is not applied
  await page.waitForTimeout(1000);
  await page.getByRole('menuitem', { name: filterName }).click();

  // 2. SELECT OPTION
  if (filterName === "Workspace") {
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    // TODO: uncomment when issue is resolved https://issues.redhat.com/browse/RHINENG-20990
    // await page.getByRole('textbox', { name: 'Type to filter' }).fill(option);
    const filterOption = page.getByText(option, { exact: true });
    await expect(filterOption).toBeVisible({ timeout: 100000 });
    await filterOption.click();
  } else if (filterName === "Data collector") {
    // TODO: Implement logic to select the Data Collector filter option.
    // Logic not implemented yet. Test continues without filtering.
  } else if (filterName === "Status") {
    // TODO: Implement logic to select the Status filter option.
    // Logic not implemented yet. Test continues without filtering.
  } else if (filterName === "Tags") {
    // TODO: Implement logic to select the Tags filter option.
    // Logic not implemented yet. Test continues without filtering.
  } else if (filterName === "System type") {
    // TODO: Implement logic to select the System type filter option.
    // Logic not implemented yet. Test continues without filtering.
  } else if (filterName === "Operating system") {
    // TODO: Implement logic to select the Operating system filter option.
    // Logic not implemented yet. Test continues without filtering.
  }
};


/**
 * Asserts that all elements found by the provided locator have the exact text.
 * This function dynamically gets the count of elements found by the locator and creates an 
 * array of expected text strings to ensure a simultaneous and robust check on all elements.
 * @param rowsLocator The Playwright Locator representing the group of table rows to check (e.g., all 'td[data-label="Workspace"]') 
 * @param expectedText The expected string in the row (e.g., system's name "rhel_test", OS "RHEL 9.5").
 * @async
 */
export const expectAllRowsHaveText = async (rowsLocator: Locator, expectedText: string) => {
    
  // 1. Get the current number of elements found by the locator.
  const expectedCount = await rowsLocator.count();    
  if (expectedCount === 0) {
      console.warn("Locator found zero elements.");
      return; 
  }    
  // 2. Create an array where expectedText is repeated 'expectedCount' times.
  const expectedTextsArray = Array(expectedCount).fill(expectedText);     
  // 3. Assert that ALL elements found by the locator have the corresponding text.
  // Playwright automatically waits and retries until all elements match the array.
  await expect(rowsLocator).toHaveText(expectedTextsArray); 
};


/**
 * Searches for an item on the page by filling its name into the filter input field.
 *
 * It first verifies that the search input is visible, reloads the page to ensure a clean state
 * (waiting for network to be idle), and then fills the provided name into the input.
 *
 * @param page The Playwright Page object to interact with.
 * @param name The string value to fill into the 'Filter by name' input field.
 * @returns A promise that resolves when the search input has been filled.
 * @async
 */
export const searchByName = async (page: Page, name: string): Promise<void> => {
  const searchInput = page.locator('input[placeholder="Filter by name"]');
  await expect(searchInput).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await searchInput.fill(name);
};
