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
  it('merges spec identity with a consumer updateQuery', () => {
    const filter = bindFilter(nameSpec, {
      updateQuery: (query: HostQuery, value: string) => ({
        ...query,
        ...(value && { hostnameOrId: value }),
      }),
    });

    expect(filter.filterId).toBe('hostname_or_id');
    expect(filter.updateQuery({}, 'host-a')).toEqual({
      hostnameOrId: 'host-a',
    });
  });

  it('allows mixing bindings of the same TQuery in one array', () => {
    const filters: BoundFilter<HostQuery>[] = [
      bindFilter(nameSpec, {
        updateQuery: (query, value: string) => ({
          ...query,
          ...(value && { hostnameOrId: value }),
        }),
      }),
      filterCatalog.tags({
        updateQuery: (query, value) => ({
          ...query,
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
  updateQuery: (query, value: string) => ({
    ...query,
    ...(value && { hostnameOrId: value }),
  }),
});

export const boundHostFilters: BoundFilter<HostQuery>[] = [hostFilter];

// @ts-expect-error PatchQuery is not assignable as HostQuery binding
export const invalidHostFilter: BoundFilter<HostQuery> = bindFilter(nameSpec, {
  updateQuery: (query: PatchQuery, value: string) => ({
    ...query,
    hostname: value,
  }),
});
