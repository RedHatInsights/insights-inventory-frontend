import { expect, test as setup } from '@playwright/test';
import {
  ensureNotInPreview,
  enableSystemsView,
  logInAsRole,
  throwIfMissingEnvVariables,
  closePopupsIfExist,
  closeCookieBanner,
  getUsersForAuthSetup,
} from './helpers/loginHelpers';
import { isSystemsViewEnabled } from './helpers/constants';

setup.describe('Setup', () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure needed ENV variables exist', async () => {
    expect(() => throwIfMissingEnvVariables()).not.toThrow();
  });

  for (const user of getUsersForAuthSetup()) {
    setup(`Authenticate as ${user.role}`, async ({ page }) => {
      setup.setTimeout(120_000);

      if (isSystemsViewEnabled) {
        await enableSystemsView(page);
      }
      // 1. Handle common UI popups before login
      await closePopupsIfExist(page);

      // 2. Perform login using the updated dynamic helper
      // This helper now saves state to .auth/[role]_user.json
      await logInAsRole(page, user);

      // 3. Handle post-login UI cleanup
      await closeCookieBanner(page);
      await ensureNotInPreview(page);
    });
  }
});
