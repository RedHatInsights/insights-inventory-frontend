import MockAdapter from 'axios-mock-adapter';
import { hostInventoryApi } from '../api/hostInventoryApi';

export const mock = new MockAdapter(hostInventoryApi().axios, {
  onNoMatch: 'throwException',
});
