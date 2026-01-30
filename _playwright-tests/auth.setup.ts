import { expect, test as setup } from '@playwright/test';
import {
  ensureNotInPreview,
  logInWithUser1,
  storeStorageStateAndToken,
  throwIfMissingEnvVariables,
  closePopupsIfExist,
  closeCookieBanner,
} from './helpers/loginHelpers';

setup.describe('Setup', async () => {
  setup.describe.configure({ retries: 3 });

  setup('Ensure needed ENV variables exist', async () => {
    expect(() => throwIfMissingEnvVariables()).not.toThrow();
  });

  setup('Authenticate', async ({ page }) => {
    setup.setTimeout(120_000);

    await closePopupsIfExist(page);
    await logInWithUser1(page);
    await closeCookieBanner(page);
    await storeStorageStateAndToken(page);

    await ensureNotInPreview(page);
  });
});
