import axios, { type AxiosInstance } from 'axios';
import https from 'https';
import * as hostInventoryApi from '../../src/api/hostInventoryApi';

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
