// TODO Move serialisers.js within SystemsTable directory
import {
  filtersSerialiser,
  sortSerialiser,
  paginationSerialiser,
} from '../../serialisers';

export const DEFAULT_OPTIONS = {
  // FIXME: remove debug
  debug: true,
  perPage: 50,
  serialisers: {
    pagination: paginationSerialiser,
    sort: sortSerialiser,
    filters: filtersSerialiser,
  },
};
