import { expect } from '@playwright/test';
import { test, navigateToStalenessPageFunc } from './helpers/navHelpers';

test('User can apply custom Staleness setting', async ({ page }) => {
  await test.step('Navigate to Staleness and Deletion page', async () => {
    await navigateToStalenessPageFunc(page);
  });

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
    // while editing setting 'Edit' button should be disbaled
    await expect(editButton).toBeDisabled();

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
    await dialog.getByRole('button', { name: 'Update' }).click();
  });

  await test.step('Verify new custom setting is applied', async () => {
    await editButton.isEnabled();
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
    await dialog.getByRole('button', { name: 'Update' }).click();
  });

  await test.step('Verify default setting is applied', async () => {
    await editButton.isEnabled();
    await expect(freshMenu).toHaveText(defaultDateSettings.fresh);
    await expect(staleMenu).toHaveText(defaultDateSettings.stale);
    await expect(deletionMenu).toHaveText(defaultDateSettings.deletion);
  });
});
