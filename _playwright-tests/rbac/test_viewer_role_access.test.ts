import { test } from '../helpers/fixtures';

test.use({ storageState: '.auth/viewer_user.json' });

test.describe('RBAC @rbac', () => {
  test('viewer role', async ({ page }) => {
    await page.goto('/insights/inventory/');
  });
});
