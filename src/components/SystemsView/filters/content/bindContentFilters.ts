import type {
  ApiHostViewsGetHostViewsInstallableAdvisoryTypeEnum,
  ApiHostViewsGetHostViewsParams,
  ApiHostViewsGetHostViewsTemplateEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { FilterCatalog } from '../catalog';
import type { BoundFilter } from '../types';
import { installableAdvisoryTypeSpec, templateSpec } from './filterDefinitions';

/**
 * Content filters bound to `/hosts/views` `updateFilterParams`.
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound Content filters in toolbar order
 */
export const bindContentFilters = (
  catalog: FilterCatalog,
): BoundFilter<ApiHostViewsGetHostViewsParams>[] => [
  catalog.custom(installableAdvisoryTypeSpec, {
    updateFilterParams: (params, value: string[]) => ({
      ...params,
      ...(value?.length && {
        installableAdvisoryType:
          value as ApiHostViewsGetHostViewsInstallableAdvisoryTypeEnum[],
      }),
    }),
  }),
  catalog.custom(templateSpec, {
    // Single-select, but the toolbar bag still holds an array, and the API
    // takes a scalar — so unwrap rather than passing the list through.
    updateFilterParams: (params, value: string[]) => ({
      ...params,
      ...(value?.length && {
        template: value[0] as ApiHostViewsGetHostViewsTemplateEnum,
      }),
    }),
  }),
];
