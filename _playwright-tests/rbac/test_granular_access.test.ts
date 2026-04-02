import { test } from '../helpers/fixtures';

test.use({ storageState: '.auth/granular_user.json' });

test.describe('RBAC @rbac', () => {
  test('granular role', async ({ page }) => {
    await page.goto('/insights/inventory/');
  });
});
