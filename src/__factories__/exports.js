import { faker } from '@faker-js/faker';
import {
  EXPORT_SERVICE_APPLICATON,
  EXPORT_SERVICE_RESOURCE,
} from '../components/InventoryTable/hooks/useInventoryExport/constants';

const exportObject = ({ format, status } = {}) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words({ min: 1, max: 1 }),
  created_at: faker.date.past({ years: 2 }).toISOString(),
  completed_at: faker.date.past({ years: 1 }).toISOString(),
  expires_at: faker.date.future({ years: 1 }).toISOString(),
  format,
  status,
  sources: [
    {
      application: EXPORT_SERVICE_APPLICATON,
      resource: EXPORT_SERVICE_RESOURCE,
      filters: {},
      id: faker.string.uuid(),
      status,
    },
  ],
});

export default (count = 1, properties = {}) =>
  [...Array(count)].map(() => exportObject(properties));
