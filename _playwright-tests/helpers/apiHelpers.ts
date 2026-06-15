import axios, { type AxiosInstance } from 'axios';
import fs from 'fs';
import https from 'https';
import { HttpsProxyAgent } from 'hpagent';
import path from 'path';
import * as hostInventoryApi from '../../src/api/hostInventoryApi';
export { INVENTORY_API_BASE } from '../../src/api/hostInventoryApi';

const ADMIN_STORAGE_STATE = path.join(__dirname, '../../.auth/admin_user.json');

/**
 * Resolves the API Bearer token: explicit TOKEN, then TOKEN_ADMIN from auth
 * setup (same process), then cs_jwt from saved storage (setup runs in another
 * worker process than dependent tests).
 */
function resolvePlaywrightApiToken(): string {
  if (process.env.TOKEN) {
    return process.env.TOKEN;
  }
  if (process.env.TOKEN_ADMIN) {
    return process.env.TOKEN_ADMIN;
  }
  if (fs.existsSync(ADMIN_STORAGE_STATE)) {
    const raw = fs.readFileSync(ADMIN_STORAGE_STATE, 'utf-8');
    const state = JSON.parse(raw) as {
      cookies?: { name: string; value: string }[];
    };
    const jwt = state.cookies?.find((c) => c.name === 'cs_jwt')?.value;
    if (jwt) {
      return jwt.startsWith('Bearer ') ? jwt : `Bearer ${jwt}`;
    }
  }
  throw new Error(
    'TOKEN must be set (run setup first), or .auth/admin_user.json must contain cs_jwt.',
  );
}

function resolveProxyUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const url = raw.includes('://') ? raw : `http://${raw}`;
  try {
    return new URL(url).hostname ? url : null;
  } catch {
    return null;
  }
}

function getPlaywrightApiClient(): AxiosInstance {
  const baseURL = process.env.BASE_URL;
  const proxyUrl = process.env.PROXY;
  const token = resolvePlaywrightApiToken();
  if (!baseURL) {
    throw new Error('BASE_URL must be set (run setup first).');
  }

  const needsProxy = process.env.INTEGRATION === 'true';
  const resolvedProxy = needsProxy ? resolveProxyUrl(proxyUrl) : null;
  const httpsAgent = resolvedProxy
    ? new HttpsProxyAgent({
        proxy: resolvedProxy,
        rejectUnauthorized: false,
      })
    : new https.Agent({ rejectUnauthorized: false });

  return axios.create({
    baseURL,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    httpsAgent,
    proxy: false,
  });
}

export const deleteStaleness = async () => {
  return hostInventoryApi.deleteStaleness({
    options: { axios: getPlaywrightApiClient() },
  });
};

/**
 * Deletes a workspace (group) by its ID via the inventory API.
 * Silently ignores 404 (already deleted).
 *  @param groupId
 */
export const deleteWorkspaceById = async (groupId: string) => {
  const client = getPlaywrightApiClient();
  try {
    await client.delete(`/api/inventory/v1/groups/${groupId}`);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return;
    }
    throw err;
  }
};

/**
 * Searches for workspaces matching a name prefix and deletes them all.
 * Useful for cleaning up test-created workspaces on failure.
 *  @param prefix
 */
export const deleteWorkspacesByPrefix = async (prefix: string) => {
  const client = getPlaywrightApiClient();
  try {
    const response = await client.get(
      `/api/inventory/v1/groups?name=${encodeURIComponent(prefix)}`,
    );
    const groups = response.data?.results || [];
    for (const group of groups) {
      if (group.id && group.name?.startsWith(prefix)) {
        await deleteWorkspaceById(group.id);
      }
    }
  } catch (err) {
    console.warn(`Workspace cleanup for prefix "${prefix}" failed:`, err);
  }
};

/**
 * Gets a workspace (group) by exact name.
 * Returns the workspace ID if found, null otherwise.
 *  @param name - Exact workspace name to find
 */
export const getWorkspaceByName = async (
  name: string,
): Promise<string | null> => {
  const client = getPlaywrightApiClient();
  try {
    const response = await client.get(
      `/api/inventory/v1/groups?name=${encodeURIComponent(name)}`,
    );
    const groups = response.data?.results || [];
    const exactMatch = groups.find(
      (g: { name: string; id: string }) => g.name === name,
    );
    return exactMatch?.id || null;
  } catch (err) {
    console.warn(`Failed to get workspace "${name}":`, err);
    return null;
  }
};

/**
 * Creates a new workspace (group) via API.
 * Returns the workspace ID.
 *  @param name - Name for the new workspace
 */
export const createWorkspaceViaApi = async (name: string): Promise<string> => {
  const client = getPlaywrightApiClient();
  const response = await client.post('/api/inventory/v1/groups', { name });
  return response.data.id;
};

/**
 * Gets or creates a workspace by name.
 * Returns the workspace ID.
 *  @param name - Workspace name
 */
export const getOrCreateWorkspace = async (name: string): Promise<string> => {
  const existingId = await getWorkspaceByName(name);
  if (existingId) {
    return existingId;
  }
  return await createWorkspaceViaApi(name);
};

/**
 * Gets a host ID by hostname, with retry logic to wait for system to appear.
 *  @param hostname   - The hostname to search for
 *  @param maxRetries - Maximum retry attempts (default 10)
 *  @param delayMs    - Delay between retries in ms (default 3000)
 */
export const getHostIdByHostname = async (
  hostname: string,
  maxRetries: number = 10,
  delayMs: number = 3000,
): Promise<string> => {
  const client = getPlaywrightApiClient();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.get(
        `/api/inventory/v1/hosts?display_name=${encodeURIComponent(hostname)}`,
      );
      const hosts = response.data?.results || [];
      const host = hosts.find(
        (h: { display_name: string; id: string }) =>
          h.display_name === hostname,
      );
      if (host?.id) {
        return host.id;
      }
    } catch (err) {
      console.warn(`Attempt ${attempt}: Failed to query host "${hostname}"`);
    }

    if (attempt < maxRetries) {
      console.log(
        `Host "${hostname}" not found, retrying in ${delayMs}ms (${attempt}/${maxRetries})...`,
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error(
    `Host "${hostname}" not found after ${maxRetries} attempts. System may not have been ingested yet.`,
  );
};

/**
 * Adds a host to a workspace (group) via API.
 *  @param workspaceId - The workspace/group ID
 *  @param hostId      - The host ID to add
 */
export const addHostToWorkspace = async (
  workspaceId: string,
  hostId: string,
): Promise<void> => {
  const client = getPlaywrightApiClient();
  await client.post(`/api/inventory/v1/groups/${workspaceId}/hosts`, [hostId]);
};
