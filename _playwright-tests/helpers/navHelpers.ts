import { type Page } from '@playwright/test';

export const navigateToInventoryFunc = async (page: Page) => {
  await page.goto('/insights/inventory/', { timeout: 60000 });
};


