import axios, { type AxiosInstance } from 'axios';
import https from 'https';
import * as hostInventoryApi from '../../src/api/hostInventoryApi';
export { INVENTORY_API_BASE } from '../../src/api/hostInventoryApi';

function getPlaywrightApiClient(): AxiosInstance {
  const baseURL = process.env.BASE_URL;
  const token = process.env.TOKEN;
  if (!baseURL) {
    throw new Error('BASE_URL must be set (run setup first).');
  }
  if (!token) {
    throw new Error('TOKEN must be set (run setup first).');
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
