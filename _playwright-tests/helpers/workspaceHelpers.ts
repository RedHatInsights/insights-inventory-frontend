import { Response, expect, type Page } from '@playwright/test';
import { INVENTORY_API_BASE } from './apiHelpers';

/**
 * Locator for the workspace details page header "Actions" menu toggle (not table bulk Actions).
 *
 *  @param page - Playwright page on workspace details
 *  @returns    Locator for the header Actions toggle
 */
export const workspaceHeaderActionsToggle = (page: Page) =>
  page.locator('#group-dropdown-toggle');

/**
 * Reads the workspace UUID from the Workspaces list row link after search.
 *
 *  @param page          - Playwright page on `/insights/inventory/workspaces`
 *  @param workspaceName - Exact visible name of the workspace link
 *  @returns             Workspace (group) id from the link href
 */
export const getWorkspaceIdFromWorkspacesListLink = async (
  page: Page,
  workspaceName: string,
): Promise<string> => {
  const workspaceLink = page.getByRole('link', { name: workspaceName });
  await expect(workspaceLink).toBeVisible({ timeout: 30000 });
  const href = await workspaceLink.getAttribute('href');
  if (!href) {
    throw new Error(`Workspace link for "${workspaceName}" is missing href`);
  }
  const fromPath = href.match(/\/workspaces\/([^/?#]+)/);
  if (fromPath?.[1]) {
    return fromPath[1];
  }
  const trimmed = href.replace(/\/$/, '');
  const lastSegment = trimmed.split('/').pop();
  if (lastSegment && !lastSegment.includes('.')) {
    return lastSegment;
  }
  throw new Error(`Could not parse workspace id from href: ${href}`);
};

export type WaitForWorkspaceDetailOptions = {
  /**
   * Also wait until the header Actions menu is enabled (group detail fetch
   * finished and workspace-edit checks passed). Required for rename/delete
   * from the header; the Systems tab can appear before this is true.
   */
  waitForEditableHeader?: boolean;
};

/**
 * Waits until workspace details main UI is ready (Systems tab visible).
 * Optionally waits until the header Actions toggle is enabled.
 *
 *  @param page    - Playwright page on workspace details
 *  @param options - When `waitForEditableHeader` is true, waits for `#group-dropdown-toggle` to be enabled
 *  @returns       Resolves when ready conditions are met
 */
export const waitForWorkspaceDetailPageReady = async (
  page: Page,
  options?: WaitForWorkspaceDetailOptions,
) => {
  await expect(page.getByRole('tab', { name: 'Systems' })).toBeVisible({
    timeout: 45000,
  });
  if (options?.waitForEditableHeader) {
    await expect(workspaceHeaderActionsToggle(page)).toBeEnabled({
      timeout: 45000,
    });
  }
};

/**
 *  @returns randomized workspace name
 */
export const generateUniqueWorkspaceName = async () => {
  return `Workspace_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Help function to create a new workspace via the UI modal
 *
 *  @param                   page - The Playwright Page object for interaction.
 *  @param                   name - The unique name to be given to the new workspace.
 *  @returns {Promise<void>}
 */
export const createNewWorkspace = async (page: Page, name: string) => {
  await page.click('button:has-text("Create workspace")');
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 30000 });
  await dialog.locator('input').first().fill(name);
  await Promise.all([
    dialog.getByRole('button', { name: 'Create' }).click(),
    page.waitForResponse(
      (res) =>
        res.url().includes(`${INVENTORY_API_BASE}/groups`) &&
        res.request().method() === 'POST' &&
        res.ok(),
    ),
  ]);
  await expect(dialog).toBeHidden({ timeout: 10000 });
};

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH';

/**
 * Predicate for waitForResponse: matches /groups responses with res.ok().
 *  @param method - Optional HTTP method
 *  @returns      Predicate to pass to page.waitForResponse().
 */
export const isWorkspaceResponse =
  (method?: Method) => async (res: Response) => {
    return (
      res.url().includes(`${INVENTORY_API_BASE}/groups`) &&
      (method === undefined || res.request().method() === method) &&
      res.ok()
    );
  };
