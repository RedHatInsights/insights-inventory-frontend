import { test } from '../helpers/fixtures';
import { expect } from '@playwright/test';

test.use({ storageState: '.auth/no_access_user.json' });

const NO_ACCESS_INVENTORY = 'This application requires Inventory permissions';
const NO_ACCESS_STALENESS = 'Access permissions needed';

test.describe('No access: @rbac', () => {
  test('Systems page', async ({ page }) => {
    await page.goto('/insights/inventory/', { timeout: 10000 });

    const emptyState = page.locator(
      '[data-ouia-component-id="UnauthorizedAccess"]',
    );
    await expect(emptyState).toBeVisible({ timeout: 10000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_INVENTORY);
  });

  test('Workspaces page', async ({ page }) => {
    await page.goto('/insights/inventory/workspaces', { timeout: 10000 });
    const heading = page.getByRole('heading', { level: 4 }).first();
    await expect(heading).toContainText('No workspaces');
    // TODO: uncomment when RBAC v2 check is resolved
    // const emptyState = page.locator(
    //   '[data-ouia-component-id="UnauthorizedAccess"]',
    // );
    // await expect(emptyState).toBeVisible();

    // const heading = page.getByRole('heading', { level: 5 }).first();
    // await expect(heading).toContainText(NO_ACCESS_INVENTORY);
  });

  test('Staleness and Deletion page', async ({ page }) => {
    await page.goto('/insights/inventory/staleness-and-deletion', {
      timeout: 10000,
    });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_STALENESS);
  });
});
