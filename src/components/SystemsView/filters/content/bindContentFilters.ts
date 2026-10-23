import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { FilterCatalog } from '../catalog';
import type { BoundFilter } from '../types';
import {
  contentTemplateSpec,
  installableAdvisoryTypeSpec,
} from './filterDefinitions';

// TODO: remove once backend is ready
export type ContentInstallableAdvisoryType =
  'security_advisories' | 'bug_fixes' | 'enhancements' | 'other';

export type ContentTemplate = 'assigned' | 'not_assigned';

export type ContentHostViewsParams = {
  installableAdvisoryType?: ContentInstallableAdvisoryType[];
  contentTemplate?: ContentTemplate;
};

/** Single cast point for the params the client cannot type yet. */
const withContentParams = (
  params: ApiHostViewsGetHostViewsParams,
  contentParams: ContentHostViewsParams,
): ApiHostViewsGetHostViewsParams =>
  ({ ...params, ...contentParams }) as ApiHostViewsGetHostViewsParams;

/**
 * Content app-data filters bound to `/hosts/views` `updateFilterParams`
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound Content filters in toolbar order
 */
export const bindContentFilters = (
  catalog: FilterCatalog,
): BoundFilter<ApiHostViewsGetHostViewsParams>[] => [
  catalog.custom(installableAdvisoryTypeSpec, {
    updateFilterParams: (
      params: ApiHostViewsGetHostViewsParams,
      value: string[],
    ) =>
      value?.length
        ? withContentParams(params, {
            installableAdvisoryType: value as ContentInstallableAdvisoryType[],
          })
        : params,
  }),
  catalog.custom(contentTemplateSpec, {
    updateFilterParams: (
      params: ApiHostViewsGetHostViewsParams,
      value: string[],
    ) =>
      value?.length
        ? withContentParams(params, {
            contentTemplate: value[0] as ContentTemplate,
          })
        : params,
  }),
];
