import { expect, test as setup } from '@playwright/test';
import {
  ensureNotInPreview,
  enableSystemsView,
  logInAsRole,
  throwIfMissingAdminEnvVariables,
  throwIfMissingRbacEnvVariables,
  closePopupsIfExist,
  closeCookieBanner,
  getAdminUserForSetup,
  getRbacUsersForSetup,
} from './helpers/loginHelpers';
import { isSystemsViewEnabled } from './helpers/constants';

setup.describe('Setup (admin)', { tag: '@admin-setup' }, () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure needed ENV variables exist', async () => {
    expect(() => throwIfMissingAdminEnvVariables()).not.toThrow();
  });

  setup('Authenticate as admin', async ({ page }) => {
    setup.setTimeout(120_000);
    const admin = getAdminUserForSetup();
    if (!admin) {
      throw new Error('No admin UserConfig for current PROD/stage mode');
    }

    if (isSystemsViewEnabled) {
      await enableSystemsView(page);
    }
    await closePopupsIfExist(page);
    await logInAsRole(page, admin);
    await closeCookieBanner(page);
    await ensureNotInPreview(page);
  });
});

setup.describe('Setup (RBAC)', { tag: '@rbac-setup' }, () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure needed ENV variables exist', async () => {
    expect(() => throwIfMissingRbacEnvVariables()).not.toThrow();
  });

  for (const user of getRbacUsersForSetup()) {
    setup(`Authenticate as ${user.role}`, async ({ page }) => {
      setup.setTimeout(120_000);

      await enableSystemsView(page);
      await closePopupsIfExist(page);
      await logInAsRole(page, user);
      await closeCookieBanner(page);
      await ensureNotInPreview(page);
    });
  }
});
