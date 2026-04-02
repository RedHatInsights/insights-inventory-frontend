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
