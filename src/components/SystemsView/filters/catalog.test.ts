import { bindFilter } from './bindFilter';
import { filterCatalog } from './catalog';
import { buildFilterParams } from './buildFilterParams';
import type { BoundFilter, FilterSpec } from './types';

type HostQuery = {
  hostnameOrId?: string;
  extra?: string;
};
type PatchQuery = { hostname?: string };

const nameSpec: FilterSpec = {
  type: 'text',
  filterId: 'hostname_or_id',
  title: 'Name',
  defaultValue: '',
};

describe('filterCatalog.custom', () => {
  it('is bindFilter', () => {
    expect(filterCatalog.custom).toBe(bindFilter);
  });

  it('binds an ad-hoc spec and can mix with named factories', () => {
    const filters: BoundFilter<HostQuery>[] = [
      filterCatalog.tags({
        updateQuery: (query, value) => ({
          ...query,
          extra: value.join(','),
        }),
      }),
      filterCatalog.custom(nameSpec, {
        updateQuery: (query, value: string) => ({
          ...query,
          ...(value && { hostnameOrId: value }),
        }),
      }),
    ];

    expect(filters).toHaveLength(2);
    expect(filters[1].filterId).toBe('hostname_or_id');
    expect(
      buildFilterParams(
        filters,
        { hostname_or_id: 'host-a', tags: ['a', 'b'] },
        { lastSeenCustomRange: null },
        {},
      ),
    ).toEqual({ hostnameOrId: 'host-a', extra: 'a,b' });
  });
});

const hostFilter: BoundFilter<HostQuery> = filterCatalog.custom(nameSpec, {
  updateQuery: (query, value: string) => ({
    ...query,
    ...(value && { hostnameOrId: value }),
  }),
});

export const customHostFilters: BoundFilter<HostQuery>[] = [hostFilter];

// @ts-expect-error PatchQuery is not assignable as HostQuery binding
export const invalidCustomFilter: BoundFilter<HostQuery> = filterCatalog.custom(
  nameSpec,
  {
    updateQuery: (query: PatchQuery, value: string) => ({
      ...query,
      hostname: value,
    }),
  },
);
