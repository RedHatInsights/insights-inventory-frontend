import { operatingSystemSpec } from './inventory/filterDefinitions';
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

describe('filterCatalog.operatingSystem', () => {
  it('forwards showCentosOptions onto the filter component', () => {
    const shown = filterCatalog.operatingSystem({
      updateFilterParams: (params) => params,
      filterProps: { showCentosOptions: false },
    });
    const hiddenByDefault = filterCatalog.operatingSystem({
      updateFilterParams: (params) => params,
    });

    expect(shown.type).toBe('custom');
    expect(hiddenByDefault.type).toBe('custom');
    if (shown.type !== 'custom' || hiddenByDefault.type !== 'custom') {
      return;
    }

    expect(shown.filterComponent).toBe(operatingSystemSpec.filterComponent);
    expect(shown.filterProps).toEqual({ showCentosOptions: false });
    expect(hiddenByDefault.filterComponent).toBe(
      operatingSystemSpec.filterComponent,
    );
    expect(hiddenByDefault.filterProps).toBeUndefined();
  });
});

describe('filterCatalog.custom', () => {
  it('is bindFilter', () => {
    expect(filterCatalog.custom).toBe(bindFilter);
  });

  it('binds an ad-hoc spec and can mix with named factories', () => {
    const filters: BoundFilter<HostQuery>[] = [
      filterCatalog.tags({
        updateFilterParams: (params, value) => ({
          ...params,
          extra: value.join(','),
        }),
      }),
      filterCatalog.custom(nameSpec, {
        updateFilterParams: (params, value: string) => ({
          ...params,
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
      ),
    ).toEqual({ hostnameOrId: 'host-a', extra: 'a,b' });
  });
});

const hostFilter: BoundFilter<HostQuery> = filterCatalog.custom(nameSpec, {
  updateFilterParams: (params, value: string) => ({
    ...params,
    ...(value && { hostnameOrId: value }),
  }),
});

export const customHostFilters: BoundFilter<HostQuery>[] = [hostFilter];

// @ts-expect-error PatchQuery is not assignable as HostQuery binding
export const invalidCustomFilter: BoundFilter<HostQuery> = filterCatalog.custom(
  nameSpec,
  {
    updateFilterParams: (params: PatchQuery, value: string) => ({
      ...params,
      hostname: value,
    }),
  },
);
