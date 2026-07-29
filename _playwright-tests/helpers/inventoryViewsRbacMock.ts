import { type Page, type Route } from '@playwright/test';

const HOSTS_VIEW_ROUTE_GLOB = '**/inventory/*/hosts-view*';

/**
 * Intercept the hosts-view API response and inject a `denied_services` array.
 * The real request is forwarded to the server; only the response is modified.
 */
export const installDeniedServicesMock = async (
  page: Page,
  deniedServices: string[],
) => {
  await page.route(HOSTS_VIEW_ROUTE_GLOB, async (route: Route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.denied_services = deniedServices;
    if (json.results) {
      for (const host of json.results) {
        for (const service of deniedServices) {
          delete host[service];
        }
      }
    }
    await route.fulfill({
      response,
      body: JSON.stringify(json),
    });
  });
};

export const uninstallDeniedServicesMock = async (page: Page) => {
  await page.unroute(HOSTS_VIEW_ROUTE_GLOB);
};
