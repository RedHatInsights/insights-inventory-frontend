import { hosts, tags } from '../api/api';
import MockAdapter from 'axios-mock-adapter';

export const mock = new MockAdapter(hosts.axios, { onNoMatch: 'throwException' });
export const mockTags = new MockAdapter(tags.axios, { onNoMatch: 'throwException' });
