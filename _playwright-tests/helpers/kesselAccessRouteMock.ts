import type { Page, Route } from '@playwright/test';

/**
 * Matches Kessel CheckSelfBulk calls from the Kessel access-check SDK
 * (`Inventory` uses `apiPath` `/api/kessel/v1beta2` on `AccessCheck.Provider`).
 */
export const KESSEL_CHECKSELFBULK_ROUTE_GLOB =
  '**/api/kessel/v1beta2/checkselfbulk**';

type CheckSelfBulkRequestItem = {
  object?: {
    resourceId?: string;
    resourceType?: string;
    reporter?: { type?: string };
  };
  relation?: string;
};

type CheckSelfBulkBody = {
  items?: CheckSelfBulkRequestItem[];
};

/**
 * Fulfills Kessel `POST …/checkselfbulk` with `ALLOWED_TRUE` for every item so
 * workspace (and any other) self-access checks succeed in E2E without relying
 * on stage Kessel policy for the Playwright user.
 *
 * Pair with `uninstallKesselCheckSelfBulkMock` in `afterEach` so handlers do
 * not accumulate across tests.
 *
 *  @param page - Playwright page
 */
export async function installKesselCheckSelfBulkAllowAll(
  page: Page,
): Promise<void> {
  await page.route(KESSEL_CHECKSELFBULK_ROUTE_GLOB, async (route: Route) => {
    const req = route.request();
    if (req.method() !== 'POST') {
      await route.continue();
      return;
    }

    let body: CheckSelfBulkBody;
    try {
      body = req.postDataJSON() as CheckSelfBulkBody;
    } catch {
      await route.continue();
      return;
    }

    const items = body?.items ?? [];
    const pairs = items.map((item) => ({
      request: item,
      item: { allowed: 'ALLOWED_TRUE' },
    }));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ pairs }),
    });
  });
}

/**
 *  @param page - Playwright page
 */
export async function uninstallKesselCheckSelfBulkMock(
  page: Page,
): Promise<void> {
  await page.unroute(KESSEL_CHECKSELFBULK_ROUTE_GLOB);
}
