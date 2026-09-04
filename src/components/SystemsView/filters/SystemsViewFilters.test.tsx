import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, jest } from '@jest/globals';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import {
  TestWrapper,
  createTestQueryClient,
} from '../../../Utilities/TestingUtilities';
import { DataViewFiltersProvider } from '../DataViewFiltersContext';
import { SystemsViewFilters } from './SystemsViewFilters';
import {
  hostnameSpec,
  lastSeenSpec,
  statusSpec,
} from './inventory/filterDefinitions';
import type { FilterSpec } from './types';

jest.mock('../../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: true, isOrgAdmin: false })),
}));

jest.mock('../../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}));

function FiltersToolbarHarness({
  resolvedFilters,
}: {
  resolvedFilters: readonly FilterSpec[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <DataViewFiltersProvider
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      resolvedFilters={resolvedFilters}
    >
      <DataViewToolbar filters={<SystemsViewFilters />} />
    </DataViewFiltersProvider>
  );
}

const renderFiltersToolbar = (
  resolvedFilters: readonly FilterSpec[],
  initialRoute = '/',
) =>
  render(
    <TestWrapper
      client={createTestQueryClient()}
      routerProps={{ initialEntries: [initialRoute] }}
    >
      <FiltersToolbarHarness resolvedFilters={resolvedFilters} />
    </TestWrapper>,
  );

describe('SystemsViewFilters', () => {
  it('renders only the passed specs, in array order', async () => {
    renderFiltersToolbar([statusSpec, hostnameSpec]);

    const user = userEvent.setup();
    // Attribute toggle label is the first spec's title (`DataViewFilters`).
    await user.click(screen.getByRole('button', { name: 'Status' }));

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.map((item) => item.textContent)).toEqual([
      'Status',
      'Name',
    ]);
    expect(
      screen.queryByRole('menuitem', { name: 'Tags' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Workspace' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Last seen' }),
    ).not.toBeInTheDocument();
  });

  it('omits the last-seen date range when that spec is not in the list', () => {
    renderFiltersToolbar([hostnameSpec], '/?last_seen=custom');

    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument();
  });

  it('shows the last-seen date range when that spec is present and custom is selected', () => {
    renderFiltersToolbar([hostnameSpec, lastSeenSpec], '/?last_seen=custom');

    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
  });
});
