import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, jest } from '@jest/globals';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import {
  TestWrapper,
  createTestQueryClient,
} from '../../../Utilities/TestingUtilities';
import { t_global_font_size_body_sm } from '@patternfly/react-tokens';
import { DataViewFiltersProvider } from '../DataViewFiltersContext';
import { SystemsViewFilters } from './SystemsViewFilters';
import {
  hostnameSpec,
  lastSeenSpec,
  statusSpec,
} from './inventory/filterDefinitions';
import { recommendationSeveritySpec } from './advisor/filterDefinitions';
import {
  cveSeveritySpec,
  knownExploitSpec,
} from './vulnerability/filterDefinitions';
import { filterCatalog } from './catalog';
import { selectLegacyInventoryFilters } from '../../InventoryViews/selectLegacyInventoryFilters';
import type { FilterSpec } from './types';

jest.mock('../../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: true, isOrgAdmin: false })),
}));

function FiltersToolbarHarness({
  resolvedFilters,
  showFilterGroups,
}: {
  resolvedFilters: readonly FilterSpec[];
  showFilterGroups?: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <DataViewFiltersProvider
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      resolvedFilters={resolvedFilters}
    >
      <DataViewToolbar
        filters={<SystemsViewFilters showFilterGroups={showFilterGroups} />}
      />
    </DataViewFiltersProvider>
  );
}

const renderFiltersToolbar = (
  resolvedFilters: readonly FilterSpec[],
  initialRoute = '/',
  showFilterGroups = false,
) =>
  render(
    <TestWrapper
      client={createTestQueryClient()}
      routerProps={{ initialEntries: [initialRoute] }}
    >
      <FiltersToolbarHarness
        resolvedFilters={resolvedFilters}
        showFilterGroups={showFilterGroups}
      />
    </TestWrapper>,
  );

/** Grouping is opt-in; these specs come from several services. */
const renderGroupedToolbar = (
  resolvedFilters: readonly FilterSpec[],
  initialRoute = '/',
) => renderFiltersToolbar(resolvedFilters, initialRoute, true);

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

  it('hides a control when that factory is dropped from the inventory selector', async () => {
    renderFiltersToolbar(
      selectLegacyInventoryFilters(filterCatalog).filter(
        (filter) => filter.filterId !== 'tags',
      ),
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(screen.getByRole('menuitem', { name: 'Name' })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Status' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Tags' }),
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

  describe('app grouping in the attribute dropdown', () => {
    // Deliberately interleaved so a passing assertion proves regrouping, not
    // just that the input order was preserved.
    const mixedSpecs = [
      cveSeveritySpec,
      hostnameSpec,
      recommendationSeveritySpec,
      statusSpec,
      knownExploitSpec,
    ];

    const openAttributeMenu = async () => {
      const user = userEvent.setup();
      // Toggle label is the first spec's title, which grouping does not change.
      await user.click(screen.getByRole('button', { name: 'CVE severity' }));
      return user;
    };

    it('stays off by default, so other pages keep the plain list', async () => {
      // Same multi-service specs, without opting in.
      renderFiltersToolbar(mixedSpecs);
      await openAttributeMenu();

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
      // Every filter is still listed, just unheaded.
      expect(screen.getAllByRole('menuitem')).toHaveLength(mixedSpecs.length);
    });

    it('heads each service group and orders them by APP_GROUP_ORDER', async () => {
      renderGroupedToolbar(mixedSpecs);
      await openAttributeMenu();

      expect(
        screen.getAllByRole('heading').map((heading) => heading.textContent),
      ).toEqual(['Inventory', 'Advisor', 'Vulnerability']);
    });

    it('lists each service its own filters, keeping within-service order', async () => {
      renderGroupedToolbar(mixedSpecs);
      await openAttributeMenu();

      expect(
        screen.getAllByRole('menuitem').map((item) => item.textContent),
      ).toEqual([
        'Name',
        'Status',
        'Recommendation severity',
        'CVE severity',
        'Known exploit',
      ]);
    });

    it('draws a divider between groups but not above the first', async () => {
      renderGroupedToolbar(mixedSpecs);
      await openAttributeMenu();

      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });

    it('omits headings a view binds no filters for', async () => {
      renderGroupedToolbar([hostnameSpec, statusSpec]);

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Name' }));

      expect(
        screen.getAllByRole('heading').map((heading) => heading.textContent),
      ).toEqual(['Inventory']);
      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('selecting a grouped filter shows that filter control', async () => {
      renderGroupedToolbar(mixedSpecs);
      const user = await openAttributeMenu();

      await user.click(
        screen.getByRole('menuitem', { name: 'Recommendation severity' }),
      );

      expect(
        screen.getByRole('button', { name: 'Recommendation severity' }),
      ).toBeInTheDocument();
    });

    it('tells same-titled filters from two services apart', async () => {
      // No shipped title collides today, and this is not a proposal to change
      // one — titles are UX copy. It is a guard: nothing makes `title` unique,
      // so this pins the toolbar's behaviour if two ever do match. The title
      // here is deliberately synthetic; the placeholders only exist to tell
      // the two controls apart in the assertions.
      const advisorSpec = {
        ...recommendationSeveritySpec,
        title: 'Shared title',
        placeholder: 'Advisor control',
      };
      const vulnerabilitySpec = {
        ...cveSeveritySpec,
        title: 'Shared title',
        placeholder: 'Vulnerability control',
      };
      renderGroupedToolbar([advisorSpec, vulnerabilitySpec]);

      // First spec is active on mount, so only its control is in the toolbar.
      expect(
        screen.getByRole('button', { name: 'Advisor control' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Vulnerability control' }),
      ).not.toBeInTheDocument();

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Shared title' }));
      // Advisor leads Vulnerability in APP_GROUP_ORDER, so [1] is the CVE one.
      await user.click(
        screen.getAllByRole('menuitem', { name: 'Shared title' })[1],
      );

      // Matching on title instead of filterId would show both at once here.
      expect(
        screen.getByRole('button', { name: 'Vulnerability control' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Advisor control' }),
      ).not.toBeInTheDocument();
    });

    it('leaves the applied-filter chip free of the group name', async () => {
      renderGroupedToolbar(mixedSpecs, '/?hostname_or_id=web-01');

      // Chip reads the filter's own chipTitle ("Display name"), not "Inventory".
      expect(screen.getByText('Display name')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /close web-01/i }),
      ).toBeInTheDocument();
      expect(screen.queryByText('Inventory')).not.toBeInTheDocument();
    });
  });

  it('lets chip-X remove a Name chip when that spec has a stamped defaultValue', async () => {
    renderFiltersToolbar(
      [{ ...hostnameSpec, defaultValue: 'web-01' }],
      '/?hostname_or_id=web-01',
    );

    expect(screen.getByDisplayValue('web-01')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /close web-01/i }));

    await waitFor(() => {
      expect(screen.queryByDisplayValue('web-01')).not.toBeInTheDocument();
    });
  });
});
