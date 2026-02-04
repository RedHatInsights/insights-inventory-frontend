import { expect, type Page } from '@playwright/test';
import path from 'path';

// This file can only contain functions that are referenced by authentication.

export const logout = async (page: Page) => {
  const button = page.locator(
    'div.pf-v6-c-toolbar__item.pf-m-hidden.pf-m-visible-on-lg.pf-v6-u-mr-0 > button',
  );

  await button.click();

  await expect(async () =>
    page.getByRole('menuitem', { name: 'Log out' }).isVisible(),
  ).toPass();

  await page.getByRole('menuitem', { name: 'Log out' }).click();

  await expect(async () => {
    expect(page.url()).not.toBe('/insights/inventory');
  }).toPass();
  await expect(async () =>
    expect(page.getByText('Log in to your Red Hat account')).toBeVisible(),
  ).toPass();
};

export const logInWithUsernameAndPassword = async (
  page: Page,
  username?: string,
  password?: string,
) => {
  if (!username || !password) {
    throw new Error('Username or password not found');
  }

  await page.goto('/insights/inventory', { timeout: 90000 });

  await expect(page.getByText('Log in to your Red Hat account')).toBeVisible({
    timeout: 15000,
  });

  const login = page.getByRole('textbox');
  await login.fill(username);
  await login.press('Enter');
  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.fill(password);
  await passwordField.press('Enter');

  await expect(async () => {
    expect(page.url()).toContain(`${process.env.BASE_URL}/insights/inventory`);

    const cookies = await page.context().cookies();
    const found = cookies.find((cookie) => cookie.name === 'cs_jwt');
    expect(found).not.toBe(undefined);
  }).toPass({
    intervals: [1_000],
    timeout: 30_000,
  });
};

const getPlaywrightPassword = (): string => {
  const envVarName =
    process.env.PROD === 'true'
      ? 'PROD_PLAYWRIGHT_PASSWORD'
      : 'PLAYWRIGHT_PASSWORD';

  const password = process.env[envVarName];

  if (!password) {
    throw new Error(
      `Missing required environment variable ${envVarName} for Playwright login`,
    );
  }

  return password;
};

export const logInWithUser1 = async (page: Page) => {
  const password = getPlaywrightPassword();

  await logInWithUsernameAndPassword(
    page,
    process.env.PLAYWRIGHT_USER,
    password,
  );
};

export const closeCookieBanner = async (page: Page) => {
  const iframeLocator = page.locator(
    'iframe[title="TrustArc Cookie Consent Manager"]',
  );

  try {
    await iframeLocator.waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    return;
  }

  const frame = page.frameLocator(
    'iframe[title="TrustArc Cookie Consent Manager"]',
  );

  await frame
    .getByRole('button', { name: 'Proceed with Required Cookies only' })
    .click();
  await iframeLocator.waitFor({ state: 'hidden', timeout: 5000 });
};

export const storeStorageStateAndToken = async (page: Page) => {
  const { cookies } = await page.context().storageState({
    path: path.join(__dirname, '../../.auth/admin_user.json'),
  });
  process.env.TOKEN = `Bearer ${cookies.find((cookie) => cookie.name === 'cs_jwt')?.value}`;
  await page.waitForTimeout(100);
};

export const throwIfMissingEnvVariables = () => {
  const ManditoryEnvVariables = [
    'PLAYWRIGHT_USER',
    process.env.PROD === 'true'
      ? 'PROD_PLAYWRIGHT_PASSWORD'
      : 'PLAYWRIGHT_PASSWORD',
    'BASE_URL',

    ...(process.env.INTEGRATION ? ['PROXY'] : []),
  ];

  const missing: string[] = [];
  ManditoryEnvVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error('Missing env variables:' + missing.join(','));
  }
};

export const ensureNotInPreview = async (page: Page) => {
  const toggle = page
    .locator('div')
    .filter({ hasText: 'Preview mode' })
    .getByRole('switch');
  if ((await toggle.isVisible()) && (await toggle.isChecked())) {
    await toggle.click();
  }
};

export const ensureInPreview = async (page: Page) => {
  const toggle = page
    .locator('div')
    .filter({ hasText: 'Preview mode' })
    .getByRole('switch');
  await expect(toggle).toBeVisible();
  if (!(await toggle.isChecked())) {
    await toggle.click();
  }
  const turnOnButton = page.getByRole('button', { name: 'Turn on' });
  if (await turnOnButton.isVisible()) {
    await turnOnButton.click();
  }
  await expect(toggle).toBeChecked();
};

/**
 * Registers Playwright `addLocatorHandler` listeners to automatically close
 * common intrusive pop-ups, such as toast notifications, Pendo guides,
 * and consent banners, before test actions proceed.
 *
 *  @param {Page} page - The Playwright Page object.
 */
export const closePopupsIfExist = async (page: Page) => {
  const locatorsToCheck = [
    page.locator(`button[id^="pendo-close-guide-"]`), // This closes the pendo guide pop-up
    page.locator(`button[id="truste-consent-button"]`), // This closes the trusted consent pop-up
  ];

  for (const locator of locatorsToCheck) {
    await page.addLocatorHandler(locator, async () => {
      try {
        await page
          .getByRole('dialog')
          .waitFor({ state: 'hidden', timeout: 1000 });
        await locator.first().click({ timeout: 10_000, noWaitAfter: true }); // There can be multiple toast pop-ups
      } catch {
        return;
      }
    });
  }
};
