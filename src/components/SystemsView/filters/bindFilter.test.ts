import { bindFilter } from './bindFilter';
import { filterCatalog } from './catalog';
import { buildFilterParams } from './buildFilterParams';
import type { BoundFilter, FilterSpec } from './types';

type HostQuery = {
  hostnameOrId?: string;
  tags?: string[];
};
type PatchQuery = { hostname?: string };

const nameSpec: FilterSpec = {
  type: 'text',
  filterId: 'hostname_or_id',
  title: 'Name',
  defaultValue: '',
};

describe('bindFilter', () => {
  it('merges spec identity with a consumer updateFilterParams', () => {
    const filter = bindFilter(nameSpec, {
      updateFilterParams: (params: HostQuery, value: string) => ({
        ...params,
        ...(value && { hostnameOrId: value }),
      }),
    });

    expect(filter.filterId).toBe('hostname_or_id');
    expect(filter.updateFilterParams({}, 'host-a')).toEqual({
      hostnameOrId: 'host-a',
    });
  });

  it('allows mixing bindings of the same TFilterParams in one array', () => {
    const filters: BoundFilter<HostQuery>[] = [
      bindFilter(nameSpec, {
        updateFilterParams: (params, value: string) => ({
          ...params,
          ...(value && { hostnameOrId: value }),
        }),
      }),
      filterCatalog.tags({
        updateFilterParams: (params, value) => ({
          ...params,
          ...(value.length && { tags: value }),
        }),
      }),
    ];

    expect(filters).toHaveLength(2);
    expect(
      buildFilterParams(
        filters,
        { hostname_or_id: 'host-a', tags: ['env/prod'] },
        { lastSeenCustomRange: null },
        {},
      ),
    ).toEqual({ hostnameOrId: 'host-a', tags: ['env/prod'] });
  });
});

const hostFilter: BoundFilter<HostQuery> = bindFilter(nameSpec, {
  updateFilterParams: (params, value: string) => ({
    ...params,
    ...(value && { hostnameOrId: value }),
  }),
});

export const boundHostFilters: BoundFilter<HostQuery>[] = [hostFilter];

// @ts-expect-error PatchQuery is not assignable as HostQuery binding
export const invalidHostFilter: BoundFilter<HostQuery> = bindFilter(nameSpec, {
  updateFilterParams: (params: PatchQuery, value: string) => ({
    ...params,
    hostname: value,
  }),
});
