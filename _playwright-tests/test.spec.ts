import { test, expect } from '@playwright/test';

import { navigateToInventoryFunc } from './helpers/navHelpers';
import { closePopupsIfExist } from './helpers/loginHelpers';

test('User can navigate to the inventory page', async ({ page }) => {
  // Optionally close any modals/popups before navigating
  await closePopupsIfExist(page);
  // Navigate directly to the inventory page
  await navigateToInventoryFunc(page);
  await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible();
});