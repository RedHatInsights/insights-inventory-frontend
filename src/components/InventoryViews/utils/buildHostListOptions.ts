import qs from 'qs';
import type { SystemProfileFilter } from './buildSystemProfileFilters';

export const hostQueryParamsSerializer = (params: Record<string, unknown>) =>
  qs.stringify(params, { arrayFormat: 'brackets' });

/*
 * Builds Axios `options` for host list and host-view API clients.
 *
 * Uses bracket notation because the backend requires it for `fields` and
 * `filter`. App-data filter params (e.g. the Advisor filters) are modeled
 * by the generated client as named params and serialize natively as
 * repeated params without brackets.
 */
export const buildHostQueryOptions = (
  systemProfileFields: readonly string[],
  systemProfileFilter: SystemProfileFilter | undefined,
) => ({
  paramsSerializer: hostQueryParamsSerializer,
  params: {
    fields: {
      system_profile: [...systemProfileFields],
    },
    ...(systemProfileFilter && {
      filter: {
        system_profile: systemProfileFilter,
      },
    }),
  },
});
