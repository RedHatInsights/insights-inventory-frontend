import axios, { type AxiosInstance } from 'axios';
import https from 'https';
import * as hostInventoryApi from '../../src/api/hostInventoryApi';

function getPlaywrightApiClient(): AxiosInstance {
  const baseURL = process.env.BASE_URL;
  const token = process.env.TOKEN;
  if (!baseURL || !token) {
    throw new Error('BASE_URL and TOKEN must be set (run setup first).');
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
