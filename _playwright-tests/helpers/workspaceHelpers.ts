import { Response, expect, type Page } from '@playwright/test';
import { INVENTORY_API_BASE } from './apiHelpers';

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
