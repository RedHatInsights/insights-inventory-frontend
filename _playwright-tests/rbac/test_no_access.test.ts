import { test } from '../helpers/fixtures';
import { expect } from '@playwright/test';
import {
  NO_ACCESS_STALENESS,
  NO_ACCESS_INVENTORY,
  NO_ACCESS_WORKSPACES,
} from './constants';

test.use({ storageState: '.auth/no_access_user.json' });

test.describe('No access:', { tag: ['@rbac'] }, () => {
  test('Systems page - no access is displayed', async ({ page }) => {
    await page.goto('/insights/inventory/', { timeout: 100000 });

    const emptyState = page.locator(
      '[data-ouia-component-id="UnauthorizedAccess"]',
    );
    await expect(emptyState).toBeVisible({ timeout: 100000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_INVENTORY);
  });

  test('Workspaces page - no access is displayed', async ({ page }) => {
    await page.goto('/insights/inventory/workspaces', { timeout: 100000 });

    const emptyState = page.locator('.pf-v6-c-empty-state');
    await expect(emptyState).toBeVisible({ timeout: 100000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_WORKSPACES);
  });

  test('Staleness and Deletion page - no access is displayed', async ({
    page,
  }) => {
    await page.goto('/insights/inventory/staleness-and-deletion', {
      timeout: 100000,
    });

    const emptyState = page.locator('.pf-v6-c-empty-state');
    await expect(emptyState).toBeVisible({ timeout: 100000 });

    const heading = page.getByRole('heading', { level: 5 }).first();
    await expect(heading).toContainText(NO_ACCESS_STALENESS);
  });
});
