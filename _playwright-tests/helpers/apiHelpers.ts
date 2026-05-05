import axios, { type AxiosInstance } from 'axios';
import fs from 'fs';
import https from 'https';
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

function getPlaywrightApiClient(): AxiosInstance {
  const baseURL = process.env.BASE_URL;
  const token = resolvePlaywrightApiToken();
  if (!baseURL) {
    throw new Error('BASE_URL must be set (run setup first).');
  }
  return axios.create({
    baseURL,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
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
