import {
  type ApiHostViewsGetHostViewsIncidentStatusEnum,
  type ApiHostViewsGetHostViewsParams,
  type ApiHostViewsGetHostViewsRecommendationSeverityEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { FilterCatalog } from '../catalog';
import type { BoundFilter } from '../types';
import {
  incidentStatusSpec,
  recommendationSeveritySpec,
} from './filterDefinitions';

/**
 * Advisor app-data filters bound to `/hosts/views` `updateFilterParams`
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound Advisor filters in toolbar order
 */
export const bindAdvisorFilters = (
  catalog: FilterCatalog,
): BoundFilter<ApiHostViewsGetHostViewsParams>[] => [
  catalog.custom(recommendationSeveritySpec, {
    updateFilterParams: (params, value: string[]) => ({
      ...params,
      ...(value?.length && {
        recommendationSeverity:
          value as ApiHostViewsGetHostViewsRecommendationSeverityEnum[],
      }),
    }),
  }),
  catalog.custom(incidentStatusSpec, {
    updateFilterParams: (params, value: string[]) => ({
      ...params,
      ...(value?.length && {
        incidentStatus: value[0] as ApiHostViewsGetHostViewsIncidentStatusEnum,
      }),
    }),
  }),
];
