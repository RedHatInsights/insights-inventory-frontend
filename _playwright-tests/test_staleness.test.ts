import { expect } from '@playwright/test';
import { test, navigateToStalenessPageFunc } from './helpers/navHelpers';
import { deleteStaleness } from './helpers/apiHelpers';
import axios from 'axios';
import { Response } from '@playwright/test';

const customDateSettings = {
  fresh: '5 days',
  stale: '14 days',
  deletion: '21 days',
};
const defaultDateSettings = {
  fresh: '1 day',
  stale: '7 days',
  deletion: '30 days',
};

const isStalenessResponse = async (res: Response) => {
  return (
    res.url().includes('/account/staleness') && res.request().method() === 'GET'
  );
};

test.afterAll(async () => {
  try {
    await deleteStaleness();
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      // staleness already deleted
    } else {
      console.error(err);
    }
  }
});

test('User can apply custom Staleness setting', async ({ page }) => {
  await test.step('Navigate to Staleness and Deletion page', async () => {
    await navigateToStalenessPageFunc(page);
  });

  const editButton = page.getByRole('button', { name: 'Edit' });
  const freshMenu = page.locator(
    '[data-ouia-component-id="SystemStalenessDropdown"]',
  );
  const staleMenu = page.locator(
    '[data-ouia-component-id="SystemStaleWarningDropdown"]',
  );
  const deletionMenu = page.locator(
    '[data-ouia-component-id="SystemDeletionDropdown"]',
  );
  const dialog = page.locator('[role="dialog"]');

  await test.step('Apply custom staleness setting', async () => {
    await editButton.click();
    await expect(editButton).toBeHidden();

    await freshMenu.click();
    await page.getByRole('option', { name: customDateSettings.fresh }).click();
    await staleMenu.click();
    await page.getByRole('option', { name: customDateSettings.stale }).click();
    await deletionMenu.click();
    await page
      .getByRole('option', { name: customDateSettings.deletion })
      .click();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeVisible();
    await Promise.all([
      dialog.getByRole('button', { name: 'Update' }).click(),
      page.waitForResponse(isStalenessResponse),
    ]);
  });

  await test.step('Verify new custom setting is applied', async () => {
    await expect(editButton).toBeEnabled();
    await expect(freshMenu).toHaveText(customDateSettings.fresh);
    await expect(staleMenu).toHaveText(customDateSettings.stale);
    await expect(deletionMenu).toHaveText(customDateSettings.deletion);
  });

  await test.step('Set staleness setting to deafult values', async () => {
    await editButton.click();
    await page
      .getByRole('button', { name: 'Reset to default setting' })
      .click();

    await expect(freshMenu).toHaveText(defaultDateSettings.fresh);
    await expect(staleMenu).toHaveText(defaultDateSettings.stale);
    await expect(deletionMenu).toHaveText(defaultDateSettings.deletion);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeVisible();
    await Promise.all([
      dialog.getByRole('button', { name: 'Update' }).click(),
      page.waitForResponse(isStalenessResponse),
    ]);
  });

  await test.step('Verify default setting is applied', async () => {
    await expect(editButton).toBeVisible();
    await expect(freshMenu).toHaveText(defaultDateSettings.fresh);
    await expect(staleMenu).toHaveText(defaultDateSettings.stale);
    await expect(deletionMenu).toHaveText(defaultDateSettings.deletion);
  });
});
