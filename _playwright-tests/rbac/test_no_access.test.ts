import { test } from '../helpers/fixtures';

test.use({ storageState: '.auth/no_access_user.json' });

test.describe('RBAC @rbac', () => {
  test('no access role', async ({ page }) => {
    await page.goto('/insights/inventory/');
  });
});
