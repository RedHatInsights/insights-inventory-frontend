import { test, expect } from '@playwright/test';

test('Test ESLint Playwright plugin rules', async ({ page }) => {
  // This should trigger playwright/no-page-pause rule
  await page.pause();
  
  // This should trigger playwright/prefer-strict-equal rule
  expect(1).toBe(1); // Should be toStrictEqual instead
  
  // This should trigger playwright/prefer-lowercase-title if we had uppercase
  // but our test title is already lowercase, so this is fine
  
  // This should trigger playwright/expect-expect if we don't have any expects
  // but we do have expects, so this is fine
  
  await page.goto('https://example.com');
  
  // This should trigger playwright/no-restricted-matchers if we use restricted matchers
  // but we're not using any restricted matchers here
});
