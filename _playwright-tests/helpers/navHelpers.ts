import { type Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

export const navigateToInventoryFunc = async (page: Page) => {
  await page.goto('/insights/inventory/', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible({ timeout: 100000 });
};

export const navigateToWorkspacesFunc = async (page: Page) => {
  await page.goto('/insights/inventory/workspaces', { timeout: 100000 });
  await expect(page.getByRole('heading', { name: 'Workspaces' })).toBeVisible({ timeout: 100000 });
};

export const navigateToSystemDetails = async (page: Page, uuid: string) => {
  await page.goto(`/insights/inventory/${uuid}`);
  await expect(page.getByText(uuid)).toBeVisible();
  await expect(page.getByText('System not found')).not.toBeVisible();
}
