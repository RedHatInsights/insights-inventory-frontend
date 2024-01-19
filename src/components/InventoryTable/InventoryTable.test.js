/**
 * Data for hosts is not static and mocked with '../../__factories__/hosts'.
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { map, zip } from 'lodash';
import React from 'react';
import configureStore from 'redux-mock-store';
import { TestWrapper } from '../../Utilities/TestingUtilities';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { buildHosts, buildHostsPayload } from '../../__factories__/hosts';
import * as api from '../../api/api';
import * as groupsApi from '../InventoryGroups/utils/api';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import useFetchOperatingSystems from '../../Utilities/hooks/useFetchOperatingSystems';
import { buildOperatingSystems } from '../../__factories__/operatingSystems';

import InventoryTable from './InventoryTable';
import { shouldDispatch, shouldNotDispatch } from '../../Utilities/testUtils';

jest.mock('../../Utilities/hooks/useFetchOperatingSystems');
jest.mock('../../Utilities/hooks/useFetchBatched');

const TABLE_HEADERS = ['Name', 'Group', 'OS', 'Last seen'];
const TABLE_HEADERS_SORTING_KEYS = [
  'display_name',
  'group_name',
  'operating_system',
  'last_seen',
];
const DEFAULT_FILTER_NAMES = [
  'Name',
  'Status',
  'Operating System',
  'Data Collector',
  'RHC status',
  'Last seen',
  'Group',
];

const renderTable = (store, props) => {
  const view = render(
    <TestWrapper store={store}>
      <InventoryTable {...props} />
    </TestWrapper>
  );

  return {
    ...view,
    rerender: (
      // overriding `rerender` in order to preserve TestWrapper
      props
    ) =>
      view.rerender(
        <TestWrapper store={store}>
          <InventoryTable {...props} />
        </TestWrapper>
      ),
  };
};

jest.mock('../../Utilities/useFeatureFlag');

const expectMainComponents = () => {
  try {
    screen.getByTestId('inventory-table-top-toolbar');
    screen.getByTestId('inventory-table-list');
    screen.getByTestId('inventory-table-bottom-toolbar');
  } catch (error) {
    throw new Error(
      `Not all of the main InventoryTable components were found.\n\n${error}`
    );
  }
};

const expectFilters = async (filterNames) => {
  await userEvent.click(
    screen.getByRole('button', {
      name: /conditional filter/i,
    })
  );

  filterNames.forEach((name) => {
    screen.getByRole('menuitem', {
      name: name,
    });
  });
};

const checkRowsContent = (hostsData) => {
  screen
    .getAllByRole('row')
    .slice(1) // don't count in header
    .forEach((row, index) => {
      try {
        expect(row).toHaveTextContent(hostsData[index].display_name);
        expect(row).toHaveTextContent(
          hostsData[index].groups?.[0]?.name || 'No group'
        );
        const os = hostsData[index].system_profile.operating_system;
        expect(row).toHaveTextContent(`${os.name} ${os.major}.${os.minor}`);
      } catch (error) {
        throw new Error(
          `The row ${index} does not match the expected content.\n\n${error}`
        );
      }
    });
};

const checkPagination = (perPage, page, total) => {
  try {
    const currentRange =
      total === 0
        ? '0 - 0'
        : `${perPage * (page - 1) + 1} - ${Math.min(perPage * page, total)}`;
    expect(
      screen.queryByTestId('inventory-table-top-toolbar')
    ).toHaveTextContent(`${currentRange} of ${total}`);
    expect(
      screen.queryByTestId('inventory-table-bottom-toolbar')
    ).toHaveTextContent(`${currentRange} of ${total}`);
  } catch (error) {
    throw new Error(`Failed verifying pagination.\n\n${error}`);
  }
};

const mockStore = configureStore([]);

const initialState = {
  entities: {
    loaded: false,
    tagsLoaded: false,
    allTagsLoaded: false,
    operatingSystems: [],
    operatingSystemsLoaded: false,
    groups: [],
    invConfig: {},
    sortBy: { key: 'updated', direction: 'desc' },
  },
};

const emptyState = {
  entities: {
    ...initialState.entities,
    activeFilters: [],
    loaded: true,
    rows: [],
    page: 1,
    perPage: 20,
    count: 0,
    total: 0,
  },
};

const hostsPayload = buildHostsPayload();

const loadedState = {
  entities: {
    ...initialState.entities,
    activeFilters: [],
    loaded: true,
    ...{
      ...hostsPayload,
      rows: hostsPayload.results,
    },
  },
};

const errorState = {
  entities: {
    ...initialState.entities,
    error: new Error('Loading error'),
  },
};

describe('InventoryTable', () => {
  const operatingSystems = [
    ...buildOperatingSystems(20, { osName: 'RHEL', major: 8 }),
    ...buildOperatingSystems(20, { osName: 'CentOS Linux', major: 7 }),
  ];
  useFeatureFlag.mockReturnValue(false);
  useFetchOperatingSystems.mockReturnValue({
    operatingSystems,
    operatingSystemsLoaded: true,
  });

  useFetchBatched.mockReturnValue({
    fetchBatched: () =>
      new Promise((resolve) => resolve([{ results: [{ name: 'group-1' }] }])),
  });

  const getGroupsSpied = jest
    .spyOn(groupsApi, 'getGroups')
    .mockReturnValue(new Promise(() => {}));

  const getEntitiesSpied = jest
    .spyOn(api, 'getEntities')
    .mockReturnValue(new Promise(() => {}));

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('renders all table components', () => {
      renderTable(mockStore(initialState));

      expectMainComponents();
    });

    it('fetches entities', async () => {
      const store = mockStore(initialState);
      renderTable(store);

      await waitFor(() => {
        shouldDispatch(store, { type: 'LOAD_ENTITIES' });
        expect(getEntitiesSpied).toBeCalled();
      });
    });

    it('fetches operating system versions', async () => {
      const store = mockStore(initialState);
      renderTable(store);

      await waitFor(() => {
        expect(useFetchOperatingSystems).toBeCalled();
      });
    });

    it('has empty skeleton rows', () => {
      renderTable(mockStore(initialState));

      screen
        .getAllByRole('row')
        .slice(1)
        .every((row) => expect(row).toHaveTextContent(''));
    });

    it('renders four headers', () => {
      renderTable(mockStore(initialState));

      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      TABLE_HEADERS.forEach((title) => {
        expect(
          screen.getByRole('columnheader', {
            name: title,
          })
        ).toBeVisible();
      });
    });

    it('does not sort by any column', () => {
      renderTable(mockStore(initialState));

      screen.getAllByRole('columnheader').forEach((col) => {
        expect(col).not.toHaveAttribute('aria-sort');
      });
    });

    it('provides default filters', async () => {
      renderTable(mockStore(initialState));

      await expectFilters(DEFAULT_FILTER_NAMES);
    });

    it('name filter is selected by default', () => {
      renderTable(mockStore(initialState));

      screen.getByRole('textbox', {
        name: /text input/i,
      });
    });

    it('fetches groups for the group filter', () => {
      renderTable(mockStore(initialState));

      expect(getGroupsSpied).toBeCalled();
    });
  });

  describe('loaded non-empty state', () => {
    it('renders all table components', () => {
      renderTable(mockStore(loadedState));

      expectMainComponents();
    });

    it('renders rows available from store', () => {
      renderTable(mockStore(loadedState));

      checkRowsContent(hostsPayload.results);
    });

    it('spinbutton should show the correct page number', () => {
      renderTable(mockStore(loadedState));

      expect(
        screen.getByRole('spinbutton', {
          name: /current page/i,
        })
      ).toHaveValue(1);
    });

    it('should render correct pagination values', () => {
      renderTable(mockStore(loadedState));

      checkPagination(
        loadedState.entities.per_page,
        loadedState.entities.page,
        loadedState.entities.total
      );
    });

    it('sorts by last seen', () => {
      renderTable(mockStore(loadedState));

      expect(
        screen.getByRole('columnheader', {
          name: /last seen/i,
        })
      ).toHaveAttribute('aria-sort', 'descending');
    });

    describe('sorting', () => {
      zip(TABLE_HEADERS, TABLE_HEADERS_SORTING_KEYS).map(
        ([header, sortKey], index) =>
          it(`sorting by ${header.toLowerCase()} dispatches action`, async () => {
            const store = mockStore(loadedState);
            renderTable(store);

            await userEvent.click(
              screen.getByRole('button', {
                name: header,
              })
            );
            await waitFor(() => {
              shouldDispatch(store, {
                type: 'CHANGE_SORT',
                index: index + 1,
                key: sortKey,
              });
            });
          })
      );
    });

    it('changing name filter triggers new request', async () => {
      const store = mockStore(loadedState);
      renderTable(store);

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /text input/i,
        }),
        'test'
      );
      await waitFor(() => {
        expect(getEntitiesSpied).toBeCalledWith(
          [],
          expect.objectContaining({ filters: { hostnameOrId: 'test' } }),
          undefined,
          expect.anything()
        );
      });
    });

    it('selecting a row dispatches action', async () => {
      const store = mockStore(loadedState);
      renderTable(store);

      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /select row 0/i,
        })
      );
      await waitFor(() => {
        shouldDispatch(store, {
          type: 'SELECT_ENTITY',
          payload: { id: hostsPayload.results[0].id, selected: true },
        });
      });
    });

    it('selecting all rows dispatches action', async () => {
      const store = mockStore(loadedState);
      renderTable(store);

      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /select all rows/i,
        })
      );
      await waitFor(() => {
        shouldDispatch(store, {
          type: 'SELECT_ENTITY',
          payload: { id: 0, selected: true },
        });
      });
    });
  });

  describe('loaded empty state', () => {
    it('renders all table components', () => {
      renderTable(mockStore(emptyState));

      expectMainComponents();
    });

    it('should inform about no matching systems', () => {
      renderTable(mockStore(emptyState));

      screen.getByRole('heading', {
        name: /no matching systems found/i,
      });
      screen.getByText(/to continue, edit your filter settings and try again/i);
    });

    it('renders unsortable default headers', () => {
      renderTable(mockStore(emptyState));

      TABLE_HEADERS.forEach((title) => {
        expect(
          screen.getByRole('columnheader', {
            name: title,
          })
        ).not.toHaveAttribute('aria-sort');
      });
    });
  });

  describe('other parameters', () => {
    it('false hasAccess renders empty state', () => {
      renderTable(mockStore(loadedState), {
        hasAccess: false,
      });

      screen.getByTestId('inventory-table-top-toolbar');
      screen.getByTestId('inventory-table-bottom-toolbar');
      screen.getByRole('heading', {
        name: /you do not have access to inventory/i,
      });
      expect(screen.queryByRole('row')).not.toBeInTheDocument();
    });

    it('full view renders no toolbars or lists', () => {
      renderTable(mockStore(loadedState), {
        hasAccess: false,
        isFullView: true,
      });

      screen.getByRole('heading', {
        name: /this application requires inventory permissions/i,
      });
      screen.getByRole('link', {
        name: /go to landing page/i,
      });
      expect(
        screen.queryByTestId('inventory-table-top-toolbar')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('inventory-table-list')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('inventory-table-bottom-toolbar')
      ).not.toBeInTheDocument();
    });

    describe('with items provided', () => {
      it('requests specific ids', () => {
        const items = buildHosts(2);
        renderTable(mockStore(emptyState), {
          items,
          page: 1,
          perPage: 2,
          count: 2,
          total: 2,
        });

        expect(getEntitiesSpied).toBeCalledWith(
          map(items, 'id'),
          expect.anything(),
          undefined,
          expect.anything()
        );
      });

      it('uses pagination given by props', () => {
        const items = buildHosts(2);
        renderTable(mockStore(emptyState), {
          items,
          page: 1,
          perPage: 2,
          count: 2,
          total: 2,
        });

        checkPagination(2, 1, 2);
      });
    });

    describe('autoRefresh', () => {
      it('should not reload on customFilters', async () => {
        const store = mockStore(initialState);
        const { rerender } = renderTable(store);

        await waitFor(() => {
          shouldDispatch(store, { type: 'LOAD_ENTITIES' });
          expect(getEntitiesSpied).toBeCalled();
        });
        store.clearActions();
        rerender({ customFilters: { system_profile: { sap_ids: ['id1'] } } });
        shouldNotDispatch(store, { type: 'LOAD_ENTITIES' });
      });

      it('should reload on customFilters', async () => {
        const store = mockStore(initialState);
        const { rerender } = renderTable(store, { autoRefresh: true });

        await waitFor(() => {
          shouldDispatch(store, { type: 'LOAD_ENTITIES' });
          expect(getEntitiesSpied).toBeCalled();
        });
        store.clearActions();
        rerender({
          autoRefresh: true, // from initial props
          customFilters: {
            system_profile: { sap_ids: ['id1'] },
          },
        });
        await waitFor(() => {
          shouldDispatch(store, { type: 'LOAD_ENTITIES' });
        });
      });
    });

    describe('hideFilters', () => {
      it('should disable all filters', () => {
        const store = mockStore(loadedState);
        renderTable(store, { hideFilters: { all: true } });

        expect(
          screen.queryByRole('button', {
            name: /conditional filter/i,
          })
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('textbox', {
            name: /text input/i,
          })
        ).not.toBeInTheDocument();
      });

      it('should disable only one filter', async () => {
        const store = mockStore(loadedState);
        renderTable(store, { hideFilters: { name: true } });

        await expectFilters(
          DEFAULT_FILTER_NAMES.filter((name) => name !== 'Name')
        );
      });

      it('should disable all and enable name filter', () => {
        const store = mockStore(loadedState);
        renderTable(store, { hideFilters: { all: true, name: false } });

        expect(
          screen.queryByRole('button', {
            name: /conditional filter/i,
          })
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('textbox', {
            name: /text input/i,
          })
        ).toBeVisible();
      });
    });
  });

  describe('error state', () => {
    it('should render default error', () => {
      renderTable(mockStore(errorState));

      screen.getByRole('heading', {
        name: /something went wrong/i,
      });
      screen.getByRole('link', {
        name: /go to home page/i,
      });
    });

    it('should render correctly with custom error', () => {
      renderTable(mockStore(errorState), {
        errorState: <div>Custom error</div>,
      });

      screen.getByText(/custom error/i);
      expect(
        screen.queryByRole('heading', {
          name: /something went wrong/i,
        })
      ).not.toBeInTheDocument();
    });
  });
});
