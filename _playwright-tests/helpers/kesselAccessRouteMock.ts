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

const WORKSPACE_RESOURCE_TYPE = 'workspace';
const WORKSPACE_RELATION_VIEW = 'view';
const WORKSPACE_RELATION_EDIT = 'edit';

/** Root-workspace staleness page relations (see `useHostStalenessKesselAccess`). */
const STALENESS_WORKSPACE_RELATION_VIEW = 'staleness_staleness_view';
const STALENESS_WORKSPACE_RELATION_UPDATE = 'staleness_staleness_update';
const HOST_WORKSPACE_RELATION_VIEW = 'inventory_host_view';
const HOST_WORKSPACE_RELATION_UPDATE = 'inventory_host_update';

const STALENESS_VIEW_RELATIONS = new Set([
  STALENESS_WORKSPACE_RELATION_VIEW,
  HOST_WORKSPACE_RELATION_VIEW,
]);

const STALENESS_UPDATE_RELATIONS = new Set([
  STALENESS_WORKSPACE_RELATION_UPDATE,
  HOST_WORKSPACE_RELATION_UPDATE,
]);

function isStalenessRelationItem(
  item: CheckSelfBulkRequestItem,
  relations: Set<string>,
): boolean {
  return relations.has(item.relation ?? '');
}

function isWorkspaceRelationItem(
  item: CheckSelfBulkRequestItem,
  relation: string,
): boolean {
  return (
    item.object?.resourceType === WORKSPACE_RESOURCE_TYPE &&
    item.relation === relation
  );
}

/**
 * Denies only workspace **view** self-access; all other bulk items (including
 * workspace **edit**) are allowed. Use on workspace details to assert the
 * AccessDenied path while keeping list/create flows workable.
 *
 *  @param page - Playwright page to install route mock on
 */
export async function installKesselCheckSelfBulkDenyView(
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
      item: {
        allowed: isWorkspaceRelationItem(item, WORKSPACE_RELATION_VIEW)
          ? 'ALLOWED_FALSE'
          : 'ALLOWED_TRUE',
      },
    }));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ pairs }),
    });
  });
}

/**
 * Denies only workspace **edit** self-access; **view** and all other items
 * stay allowed. Workspace details should still load Systems while header
 * Actions stay disabled.
 *
 *  @param page - Playwright page to install route mock on
 */
/**
 * Allows Root-workspace staleness **view** self-access (`staleness_staleness_view`,
 * `inventory_host_view`) and denies **update** relations. Use for Inventory Viewer
 * E2E when stage Kessel policy has not yet migrated those permissions to the Root
 * workspace (RHINENG-25942).
 *  @param page
 */
export async function installKesselStalenessViewOnly(
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
      item: {
        allowed: isStalenessRelationItem(item, STALENESS_UPDATE_RELATIONS)
          ? 'ALLOWED_FALSE'
          : isStalenessRelationItem(item, STALENESS_VIEW_RELATIONS)
            ? 'ALLOWED_TRUE'
            : 'ALLOWED_TRUE',
      },
    }));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ pairs }),
    });
  });
}

export async function installKesselCheckSelfBulkDenyEdit(
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
      item: {
        allowed: isWorkspaceRelationItem(item, WORKSPACE_RELATION_EDIT)
          ? 'ALLOWED_FALSE'
          : 'ALLOWED_TRUE',
      },
    }));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ pairs }),
    });
  });
}
