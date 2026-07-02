import { expect, test as setup, type Page } from '@playwright/test';
import {
  ensureNotInPreview,
  enableSystemsView,
  enableInventoryViews,
  enableInventoryTable,
  logInAsRole,
  throwIfMissingAdminEnvVariables,
  throwIfMissingRbacEnvVariables,
  closePopupsIfExist,
  closeCookieBanner,
  getAdminUserForSetup,
  getRbacUsersForSetup,
  type UserConfig,
} from './helpers/loginHelpers';
import {
  isSystemsViewEnabled,
  isInventoryViewsEnabled,
  forceLegacyInventoryTable,
} from './helpers/constants';

async function authenticateUser(page: Page, user: UserConfig) {
  if (isSystemsViewEnabled) {
    await enableSystemsView(page);
  }
  if (isInventoryViewsEnabled) {
    await enableInventoryViews(page);
  }
  if (forceLegacyInventoryTable) {
    await enableInventoryTable(page);
  }
  await closePopupsIfExist(page);
  await logInAsRole(page, user);
  await closeCookieBanner(page);
  await ensureNotInPreview(page);
}

const isProd = process.env.PROD === 'true';

setup.describe('Setup', () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure admin ENV variables exist', async () => {
    expect(() => throwIfMissingAdminEnvVariables()).not.toThrow();
  });

  setup('Authenticate as admin', async ({ page }) => {
    setup.setTimeout(120_000);
    const admin = getAdminUserForSetup();
    if (!admin) {
      throw new Error('No admin UserConfig for current PROD/stage mode');
    }
    await authenticateUser(page, admin);
  });

  if (!isProd) {
    setup('Ensure RBAC ENV variables exist', async () => {
      expect(() => throwIfMissingRbacEnvVariables()).not.toThrow();
    });

    for (const user of getRbacUsersForSetup()) {
      setup(`Authenticate as ${user.role}`, async ({ page }) => {
        setup.setTimeout(120_000);
        await authenticateUser(page, user);
      });
    }
  }
});
