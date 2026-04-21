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
    timeout: 120000,
  });
  if (options?.waitForEditableHeader) {
    await expect(workspaceHeaderActionsToggle(page)).toBeEnabled({
      timeout: 120000,
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
  // 1. Click the "Create Workspace" button
  await page.click('button:has-text("Create workspace")');
  // 2. Wait for dialog to appear and fill in the workspace name
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 100000 });
  await dialog.locator('input').first().fill(name);
  await dialog.getByRole('button', { name: 'Create' }).click();
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
