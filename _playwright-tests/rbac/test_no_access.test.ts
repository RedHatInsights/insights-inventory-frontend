import { test } from '../helpers/fixtures';
import { expect } from '@playwright/test';
import { NO_ACCESS_STALENESS, NO_ACCESS_INVENTORY } from './constants';

test.use({ storageState: '.auth/no_access_user.json' });

test.describe('No access: @rbac', () => {
  test('Systems page', async ({ page }) => {
    await page.goto('/insights/inventory/', { timeout: 100000 });

    const emptyState = page.locator(
      '[data-ouia-component-id="UnauthorizedAccess"]',
    );
    await expect(emptyState).toBeVisible({ timeout: 100000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_INVENTORY);
  });

  test('Workspaces page', async ({ page }) => {
    await page.goto('/insights/inventory/workspaces', { timeout: 100000 });

    const createButton = page.locator(
      '[data-ouia-component-id="CreateGroupButton"]',
    );
    await expect(createButton).toBeVisible({ timeout: 100000 });

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
      timeout: 100000,
    });

    const emptyState = page.locator('.pf-v6-c-empty-state');
    await expect(emptyState).toBeVisible({ timeout: 100000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_STALENESS);
  });
});
