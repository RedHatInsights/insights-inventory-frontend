import '@testing-library/jest-dom';
import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { bindFilter } from './bindFilter';
import { getFilterComponent } from './getFilterComponent';
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
      ),
    ).toEqual({ hostnameOrId: 'host-a', tags: ['env/prod'] });
  });

  it('keeps the custom filter component type when the binding is rebuilt', async () => {
    const user = userEvent.setup();
    const SpecFilter = ({
      showCentosOptions = true,
    }: {
      showCentosOptions?: boolean;
      value?: string[];
      onChange?: (event?: React.MouseEvent, values?: string[]) => void;
      placeholder?: string;
      filterId?: string;
    }) => {
      const [query, setQuery] = useState('');
      return (
        <input
          aria-label="os search"
          value={query}
          data-centos={String(showCentosOptions)}
          onChange={(event) => setQuery(event.target.value)}
        />
      );
    };
    const spec: FilterSpec = {
      type: 'custom',
      filterId: 'operating_system',
      title: 'Operating system',
      defaultValue: [],
      filterComponent: SpecFilter,
      createLabel: () => [],
    };

    const Harness = () => {
      const [showCentosOptions, setShowCentosOptions] = useState(true);
      const bound = bindFilter(spec, {
        updateFilterParams: (params: HostQuery) => params,
        filterProps: { showCentosOptions },
      });
      return (
        <>
          <button type="button" onClick={() => setShowCentosOptions(false)}>
            rebind
          </button>
          {getFilterComponent(bound)}
        </>
      );
    };

    render(<Harness />);
    await user.type(screen.getByRole('textbox', { name: 'os search' }), 'rhel');
    expect(screen.getByRole('textbox', { name: 'os search' })).toHaveValue(
      'rhel',
    );

    await user.click(screen.getByRole('button', { name: 'rebind' }));

    expect(screen.getByRole('textbox', { name: 'os search' })).toHaveValue(
      'rhel',
    );
    expect(screen.getByRole('textbox', { name: 'os search' })).toHaveAttribute(
      'data-centos',
      'false',
    );
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
