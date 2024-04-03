import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { TestWrapper } from '../../Utilities/TestingUtilities';
import { defaultColumns } from '../../store/entities';
import EntityTable from './EntityTable';
import TitleColumn from './TitleColumn';

jest.mock('../../Utilities/useFeatureFlag');

const expectTableBasicComponents = (
  columnsNumber,
  rowsNumber,
  columnNames,
  shouldRenderSelectAllCheckbox = true,
  shouldRenderSelectCheckboxes = true,
  ariaLabel = 'Host inventory',
  shouldRenderPerRowActions = false
) => {
  expect(screen.getByRole('grid', { name: ariaLabel })).toBeVisible();
  expect(screen.getAllByRole('columnheader')).toHaveLength(columnsNumber);
  expect(screen.getAllByRole('row')).toHaveLength(rowsNumber + 1); // + 1 to count in header row

  if (columnNames !== undefined) {
    screen.getAllByRole('columnheader').forEach((columnHeader, index) => {
      expect(columnHeader).toHaveTextContent(columnNames[index]);
    });
  }

  expect(
    screen.queryAllByRole('cell', {
      name: 'Select all rows',
    })
  ).toHaveLength(shouldRenderSelectAllCheckbox ? 1 : 0);

  expect(
    screen.queryAllByRole('cell', {
      name: /select row/i,
    })
  ).toHaveLength(shouldRenderSelectCheckboxes ? rowsNumber : 0);

  expect(
    screen.queryAllByRole('button', {
      name: /kebab toggle/i,
    })
  ).toHaveLength(shouldRenderPerRowActions ? rowsNumber : 0);
};

describe('EntityTable', () => {
  let initialState;
  let mockStore;
  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
      entities: {
        activeFilters: [{}],
        loaded: true,
        rows: [
          {
            id: 'testing-id',
            one: 'data',
            system_profile: {},
          },
        ],
        columns: [
          {
            key: 'one',
            sortKey: 'one',
            title: 'One',
            renderFunc: (display_name, id, item, props) => (
              <TitleColumn {...{ ...props, id, item }}>
                {display_name}
              </TitleColumn>
            ),
          },
          {
            key: 'system_profile',
            sortKey: 'system_profile',
            title: 'OS',
            renderFunc: () => <span>some version</span>,
          },
        ],
        page: 1,
        perPage: 50,
        total: 500,
      },
    };
  });

  describe('DOM', () => {
    it('should render correctly - loading', () => {
      const store = mockStore({
        entities: {
          loaded: false,
          columns: initialState.entities.columns,
        },
      });

      render(
        <TestWrapper store={store}>
          <EntityTable disableDefaultColumns loaded={false} />
        </TestWrapper>
      );

      expectTableBasicComponents(2, 15, undefined, false, false, 'Loading');
    });

    it('should render correctly - no rows', () => {
      const store = mockStore({
        entities: {
          loaded: true,
          columns: [{ key: 'one', title: 'One' }],
          rows: [],
        },
      });

      render(
        <TestWrapper store={store}>
          <EntityTable disableDefaultColumns loaded />
        </TestWrapper>
      );

      expectTableBasicComponents(1, 1, ['One'], false, false);
      expect(
        screen.getByRole('heading', { name: 'No matching systems found' })
      ).toBeVisible();
      expect(
        screen.getByText('To continue, edit your filter settings and try again')
      ).toBeVisible();
    });

    it('should render correctly - with customNoSystemsTable', () => {
      const store = mockStore({
        entities: {
          loaded: true,
          columns: [{ key: 'one', title: 'One' }],
          rows: [],
        },
      });

      render(
        <TestWrapper store={store}>
          <EntityTable loaded noSystemsTable={<div>NO SYSTEMS</div>} />
        </TestWrapper>
      );

      expectTableBasicComponents(1, 1, ['One'], false, false);
      expect(screen.getByText('NO SYSTEMS')).toBeVisible();
      expect(
        screen.queryByRole('heading', { name: 'No matching systems found' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          'To continue, edit your filter settings and try again'
        )
      ).not.toBeInTheDocument();
    });

    it('should render correctly - grid breakpoints', () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          columns: [...new Array(6)].map(() => ({
            key: 'one',
            sortKey: 'one',
            title: 'One',
          })),
        },
      });

      render(
        <TestWrapper store={store}>
          <EntityTable loaded disableDefaultColumns />
        </TestWrapper>
      );

      expectTableBasicComponents(
        6,
        1,
        [...new Array(6)].map(() => 'One'),
        true,
        true
      );
      expect(screen.getAllByRole('cell', { name: 'data' })).toHaveLength(6);
    });

    it('should render correctly - without checkbox', () => {
      const store = mockStore(initialState);

      render(
        <TestWrapper store={store}>
          <EntityTable loaded hasCheckbox={false} disableDefaultColumns />
        </TestWrapper>
      );

      expectTableBasicComponents(2, 1, ['One', 'OS'], false, false);
    });

    it('should render correctly - is expandable', () => {
      const store = mockStore(initialState);

      render(
        <TestWrapper store={store}>
          <EntityTable loaded expandable disableDefaultColumns />
        </TestWrapper>
      );

      expectTableBasicComponents(3, 1, ['', 'One', 'OS'], true, true);
    });

    it('should render correctly - with actions', () => {
      const store = mockStore(initialState);

      render(
        <TestWrapper store={store}>
          <EntityTable loaded actions={['action 1']} disableDefaultColumns />
        </TestWrapper>
      );

      expectTableBasicComponents(
        2,
        1,
        ['One', 'OS'],
        true,
        true,
        undefined,
        true
      );
    });

    describe('sort by', () => {
      it('should render correctly', () => {
        const store = mockStore(initialState);

        render(
          <TestWrapper store={store}>
            <EntityTable
              loaded
              disableDefaultColumns
              sortBy={{
                key: 'one',
                sortKey: 'one',
                directions: 'asc',
              }}
            />
          </TestWrapper>
        );

        expectTableBasicComponents(2, 1, ['One', 'OS'], true, true);
        expect(
          screen.getByRole('columnheader', {
            name: 'One',
          })
        ).toHaveClass('pf-v5-c-table__sort pf-m-selected');
        // eslint-disable-next-line testing-library/no-node-access
        const sortIndicator = document.querySelectorAll(
          '.pf-v5-c-table__sort-indicator'
        );
        expect(sortIndicator).toHaveLength(2);
      });

      it('should render correctly - without checkbox', () => {
        const store = mockStore(initialState);

        render(
          <TestWrapper store={store}>
            <EntityTable
              loaded
              hasCheckbox={false}
              disableDefaultColumns
              sortBy={{
                key: 'one',
                directions: 'asc',
              }}
            />
          </TestWrapper>
        );

        expectTableBasicComponents(2, 1, ['One', 'OS'], false, false);
        expect(
          screen.getByRole('columnheader', {
            name: 'One',
          })
        ).toHaveClass('pf-v5-c-table__sort pf-m-selected');
        // eslint-disable-next-line testing-library/no-node-access
        const sortIndicator = document.querySelectorAll(
          '.pf-v5-c-table__sort-indicator'
        );
        expect(sortIndicator).toHaveLength(2);
      });

      it('should render correctly - is expandable', () => {
        const store = mockStore(initialState);

        render(
          <TestWrapper store={store}>
            <EntityTable
              loaded
              expandable
              disableDefaultColumns
              sortBy={{
                key: 'one',
                directions: 'asc',
              }}
            />
          </TestWrapper>
        );

        expectTableBasicComponents(3, 1, ['', 'One', 'OS'], true, true);
        expect(
          screen.getByRole('columnheader', {
            name: 'One',
          })
        ).toHaveClass('pf-v5-c-table__sort pf-m-selected');
        // eslint-disable-next-line testing-library/no-node-access
        const sortIndicator = document.querySelectorAll(
          '.pf-v5-c-table__sort-indicator'
        );
        expect(sortIndicator).toHaveLength(2);
      });

      it('should mark OS column as sorted in Asc order', () => {
        const store = mockStore(initialState);

        render(
          <TestWrapper store={store}>
            <EntityTable
              loaded
              expandable
              disableDefaultColumns
              sortBy={{
                key: 'system_profile',
                direction: 'asc',
              }}
            />
          </TestWrapper>
        );

        expectTableBasicComponents(3, 1, ['', 'One', 'OS'], true, true);
        expect(
          screen.getByRole('columnheader', {
            name: 'OS',
          })
        ).toHaveClass('pf-v5-c-table__sort pf-m-selected');
        // eslint-disable-next-line testing-library/no-node-access
        const sortIndicator = document.querySelectorAll(
          '.pf-v5-c-table__sort-indicator'
        );
        expect(sortIndicator).toHaveLength(2);
      });

      it('should mark OS column as sorted in Desc order', () => {
        const store = mockStore(initialState);

        render(
          <TestWrapper store={store}>
            <EntityTable
              loaded
              expandable
              disableDefaultColumns
              sortBy={{
                key: 'system_profile',
                direction: 'desc',
              }}
            />
          </TestWrapper>
        );

        expectTableBasicComponents(3, 1, ['', 'One', 'OS'], true, true);
        expect(
          screen.getByRole('columnheader', {
            name: 'OS',
          })
        ).toHaveClass('pf-v5-c-table__sort pf-m-selected');
        // eslint-disable-next-line testing-library/no-node-access
        const sortIndicator = document.querySelectorAll(
          '.pf-v5-c-table__sort-indicator'
        );
        expect(sortIndicator).toHaveLength(2);
      });
    });

    it('should render correctly - compact', () => {
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable loaded disableDefaultColumns variant="compact" />
        </TestWrapper>
      );

      expectTableBasicComponents(2, 1, ['One', 'OS'], true, true);
      expect(screen.getByRole('grid', { name: 'Host inventory' })).toHaveClass(
        'pf-m-compact'
      );
    });

    it('should render correctly with has items', () => {
      const store = mockStore(initialState);

      render(
        <TestWrapper store={store}>
          <EntityTable loaded disableDefaultColumns hasItems />
        </TestWrapper>
      );

      expectTableBasicComponents(2, 1, ['One', 'OS'], true, true);
      screen
        .getAllByRole('columnheader')
        .forEach((header) =>
          expect(header).not.toHaveClass('pf-v5-c-table__sort')
        );
      // eslint-disable-next-line testing-library/no-node-access
      const sortIndicator = document.querySelectorAll(
        '.pf-v5-c-table__sort-indicator'
      );
      expect(sortIndicator).toHaveLength(0);
    });

    it('should render correctly - disabled insights icon', () => {
      initialState = {
        entities: {
          ...initialState.entities,
          columns: defaultColumns(),
          rows: [
            {
              id: 'testing-id',
              system_profile: {},
            },
            {
              id: 'testing-id-1',
              system_profile: {},
              per_reporter_staleness: {
                puptoo: {
                  stale_timestamp: '2022-07-07T18:22:04.663407+00:00',
                },
              },
            },
          ],
        },
      };

      const store = mockStore(initialState);

      render(
        <TestWrapper store={store}>
          <EntityTable loaded disableDefaultColumns />
        </TestWrapper>
      );

      expectTableBasicComponents(
        5,
        2,
        ['Name', 'Group', 'Tags', 'OS', 'Last seen'],
        true,
        true
      );
      expect(screen.getByLabelText('Disconnected indicator')).toBeVisible();
    });

    it('should render correctly - custom columns via props', () => {
      initialState = {
        entities: {
          ...initialState.entities,
          rows: [
            {
              id: 'testing-id',
              insights_id: null,
              secret_attribute: 'super_secret_1',
              display_name: 'name_1',
              system_profile: {},
            },
            {
              id: 'testing-id-1',
              insights_id: 'some-id-herse',
              secret_attribute: 'super_secret_2',
              display_name: 'name_2',
              system_profile: {},
            },
          ],
        },
      };

      // eslint-disable-next-line react/prop-types
      const CustomCell = ({ children }) => (
        <h1 data-testid="custom-cell">{children}</h1>
      );
      const store = mockStore(initialState);

      render(
        <TestWrapper store={store}>
          <EntityTable
            loaded
            columns={[
              {
                key: 'display_name',
                renderFunc: (name) => <CustomCell>{name}</CustomCell>,
              },
              {
                key: 'secret_attribute',
                title: 'Secret attribute',
                renderFunc: (secret_attribute) => (
                  <CustomCell>{secret_attribute}</CustomCell>
                ),
              },
            ]}
          />
        </TestWrapper>
      );

      expectTableBasicComponents(
        5,
        2,
        ['Name', 'Group', 'OS', 'Last seen', 'Secret attribute'],
        true,
        true
      );
      expect(screen.getAllByTestId('custom-cell')).toHaveLength(4);
      screen
        .getAllByTestId('custom-cell')
        .forEach((cell, index) =>
          expect(cell).toHaveTextContent(
            ['name_1', 'super_secret_1', 'name_2', 'super_secret_2'][index]
          )
        );
    });

    it('should render correctly - custom columns via prop function', () => {
      initialState = {
        entities: {
          ...initialState.entities,
          rows: [
            {
              id: 'testing-id',
              insights_id: null,
              secret_attribute: 'super_secret_1',
              display_name: 'name_1',
              system_profile: {},
            },
          ],
        },
      };

      // eslint-disable-next-line react/prop-types
      const CustomCell = ({ children }) => (
        <h1 data-testid="custom-cell">{children}</h1>
      );

      const getColumns = jest.fn().mockImplementation(() => [
        {
          key: 'display_name',
          title: 'Display name',
          renderFunc: (name) => <CustomCell>{name}</CustomCell>,
        },
        {
          key: 'secret_attribute',
          title: 'Secret attribute',
          renderFunc: (secret_attribute) => (
            <CustomCell>{secret_attribute}</CustomCell>
          ),
        },
      ]);

      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable loaded columns={getColumns} />
        </TestWrapper>
      );

      expectTableBasicComponents(
        2,
        1,
        ['Display name', 'Secret attribute'],
        true,
        true
      );
      expect(screen.getAllByTestId('custom-cell')).toHaveLength(2);
      screen
        .getAllByTestId('custom-cell')
        .forEach((cell, index) =>
          expect(cell).toHaveTextContent(['name_1', 'super_secret_1'][index])
        );
      expect(getColumns).toHaveBeenCalledTimes(1);
    });

    it('control columns function prop via columnsCounter', async () => {
      initialState = {
        entities: {
          ...initialState.entities,
          rows: [
            {
              id: 'testing-id',
              insights_id: null,
              secret_attribute: 'super_secret_1',
              display_name: 'name_1',
              system_profile: {},
            },
          ],
        },
      };

      // eslint-disable-next-line react/prop-types
      const CustomCell = ({ children }) => <h1>{children}</h1>;

      const getColumns = jest.fn().mockImplementation(() => [
        {
          key: 'display_name',
          title: 'Display name',
          renderFunc: (name) => <CustomCell>{name}</CustomCell>,
        },
      ]);

      const store = mockStore(initialState);

      const Dummy = (props) => (
        <TestWrapper store={store}>
          <EntityTable loaded columns={getColumns} {...props} />
        </TestWrapper>
      );

      const { rerender } = render(<Dummy />);

      expect(getColumns).toHaveBeenCalledTimes(1);
      rerender(<Dummy some_prop={'1'} />);
      expect(getColumns).toHaveBeenCalledTimes(1);
      rerender(<Dummy columnsCounter={1} />);
      expect(getColumns).toHaveBeenCalledTimes(2);
      rerender(<Dummy columnsCounter={2} />);
      expect(getColumns).toHaveBeenCalledTimes(3);
    });

    it('should disable just one default column', () => {
      jest.mock('../../Utilities/useFeatureFlag');
      initialState = {
        entities: {
          ...initialState.entities,
          rows: [
            {
              id: 'testing-id',
              insights_id: null,
              secret_attribute: 'super_secret_1',
              display_name: 'name_1',
              system_profile: {},
            },
          ],
        },
      };
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable
            loaded
            columns={[]}
            disableDefaultColumns={['display_name']}
          />
        </TestWrapper>
      );

      expectTableBasicComponents(
        3,
        1,
        ['Group', 'OS', 'Last seen'],
        true,
        true
      );
    });

    it('should disable just one default column + showTags', () => {
      initialState = {
        entities: {
          ...initialState.entities,
          columns: undefined,
          rows: [
            {
              id: 'testing-id',
              insights_id: null,
              secret_attribute: 'super_secret_1',
              display_name: 'name_1',
              system_profile: {},
            },
          ],
        },
      };
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable
            loaded
            columns={[]}
            disableDefaultColumns={['display_name']}
            showTags
          />
        </TestWrapper>
      );

      expectTableBasicComponents(
        4,
        1,
        ['Group', 'Tags', 'OS', 'Last seen'],
        true,
        true
      );
    });
  });

  describe('API', () => {
    jest.mock('../../Utilities/useFeatureFlag');

    it('should call onRowClick', async () => {
      const onRowClick = jest.fn();
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable loaded disableDefaultColumns onRowClick={onRowClick} />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByRole('link', {
          name: 'data',
        })
      );
      await waitFor(() => {
        expect(onRowClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should call on expand click', async () => {
      const onExpand = jest.fn();
      const store = mockStore({
        entities: {
          ...initialState.entities,
          rows: [
            {
              one: 'data',
              children: () => <div>something</div>,
            },
          ],
        },
      });
      render(
        <TestWrapper store={store}>
          <EntityTable
            loaded
            disableDefaultColumns
            expandable
            onExpandClick={onExpand}
          />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Details',
        })
      );
      await waitFor(() => {
        expect(onExpand).toHaveBeenCalledTimes(1);
      });
    });

    it('should call dispatch select action', async () => {
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable loaded expandable disableDefaultColumns />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /select row 0/i,
        })
      );
      const actions = store.getActions();
      expect(actions.length).toBe(1);
      expect(actions[0]).toMatchObject({
        payload: { id: 'testing-id', selected: true },
        type: 'SELECT_ENTITY',
      });
    });

    it('should dispatch select all action', async () => {
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable loaded disableDefaultColumns />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /select all rows/i,
        })
      );
      const actions = store.getActions();
      expect(actions.length).toBe(1);
      expect(actions[0]).toMatchObject({
        payload: { id: 0, selected: true },
        type: 'SELECT_ENTITY',
      });
    });

    it('should dispatch set sort action', async () => {
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable loaded disableDefaultColumns />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: 'One',
        })
      );
      const actions = store.getActions();
      expect(actions.length).toBe(1);
      expect(actions[0]).toMatchObject({
        payload: { direction: 'asc', index: 1, key: 'one' },
        type: 'CHANGE_SORT',
      });
    });

    it('should call onSort function', async () => {
      const onSort = jest.fn();
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <EntityTable loaded onSort={onSort} disableDefaultColumns />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: 'One',
        })
      );
      await waitFor(() => {
        expect(onSort).toHaveBeenCalledTimes(1);
      });
    });

    it('should NOT dispatch set sort action', async () => {
      const onSort = jest.fn();
      const store = mockStore({
        entities: {
          ...initialState.entities,
          columns: [{ key: 'health', sortKey: 'health', title: 'Health' }],
        },
      });
      render(
        <TestWrapper store={store}>
          <EntityTable loaded onSort={onSort} disableDefaultColumns />
        </TestWrapper>
      );
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Health',
        })
      );
      const actions = store.getActions();
      expect(actions.length).toBe(0);
    });
  });
});
