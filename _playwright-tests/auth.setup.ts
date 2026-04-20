import { expect, test as setup } from '@playwright/test';
import {
  ensureNotInPreview,
  enableSystemsViewAndKessel,
  logInWithUser1,
  storeStorageStateAndToken,
  throwIfMissingEnvVariables,
  closePopupsIfExist,
  closeCookieBanner,
} from './helpers/loginHelpers';
import { isSystemsViewEnabled } from './helpers/constants';

setup.describe('Setup', async () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure needed ENV variables exist', async () => {
    expect(() => throwIfMissingEnvVariables()).not.toThrow();
  });

  setup('Authenticate', async ({ page }) => {
    setup.setTimeout(120_000);

    if (isSystemsViewEnabled) {
      await enableSystemsViewAndKessel(page);
    }

    await closePopupsIfExist(page);
    await logInWithUser1(page);
    await closeCookieBanner(page);
    await ensureNotInPreview(page);
    await storeStorageStateAndToken(page);
  });
});
