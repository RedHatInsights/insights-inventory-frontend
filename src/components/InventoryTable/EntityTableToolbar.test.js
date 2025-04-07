import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import debounce from 'lodash/debounce';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { availableVersions } from '../../Utilities/__mocks__/OperatingSystemFilterHelpers.fixtures';
import { mock } from '../../__mocks__/hostApi';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import useFetchOperatingSystems from '../../Utilities/hooks/useFetchOperatingSystems';
import { buildOperatingSystems } from '../../__factories__/operatingSystems';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

import EntityTableToolbar from './EntityTableToolbar';
import TitleColumn from './TitleColumn';
import entities from '../../store/entities';

jest.mock('lodash/debounce');
jest.mock('../../Utilities/useFeatureFlag');

jest.mock('../../Utilities/constants', () => ({
  ...jest.requireActual('../../Utilities/constants'),
  lastSeenFilterItems: jest.fn().mockReturnValue([]),
}));

jest.mock('../../Utilities/hooks/useFetchOperatingSystems');
jest.mock('../../Utilities/hooks/useFetchBatched');

jest.mock('@redhat-cloud-services/frontend-components-utilities/interceptors');

const expectDefaultFiltersVisible = async () => {
  const DEFAULT_FILTERS = [
    'Name',
    'Status',
    'Operating system',
    'Data collector',
    'RHC status',
    'Last seen',
  ];

  await userEvent.click(
    screen.getByRole('button', {
      name: /conditional filter toggle/i,
    })
  );
  DEFAULT_FILTERS.forEach((filterName) =>
    expect(screen.getByRole('menuitem', { name: filterName })).toBeVisible()
  );
};

const expectPagerDisabled = (perPageEnabled = true) => {
  expect(
    screen.getByRole('navigation', {
      name: /pagination/i,
    })
  ).toBeVisible();
  if (perPageEnabled) {
    expect(
      screen.getByRole('button', {
        name: /items per page/i,
      })
    ).toBeEnabled();
  } else {
    expect(
      screen.getByRole('button', {
        name: /items per page/i,
      })
    ).toBeDisabled();
  }
  expect(
    screen.getByRole('button', {
      name: /go to previous page/i,
    })
  ).toBeDisabled();
  expect(
    screen.getByRole('button', {
      name: /go to next page/i,
    })
  ).toBeDisabled();
};

describe('EntityTableToolbar', () => {
  let initialState;
  let stateWithActiveFilter;
  let mockStore;
  let onRefreshData;
  let onRefreshDataFn;
  const operatingSystems = [
    ...buildOperatingSystems(10, { osName: 'RHEL', major: 8 }),
    ...buildOperatingSystems(5, { osName: 'RHEL', major: 9 }),
    ...buildOperatingSystems(20, { osName: 'CentOS', major: 7 }),
    ...buildOperatingSystems(20, { osName: 'CentOS Linux', major: 7 }),
  ];

  beforeEach(() => {
    mock.onGet().reply(200, { results: [] });
    // Force debounce time to 0
    debounce.mockImplementation(
      jest.fn((fn, _delay, ...args) =>
        jest.requireActual('lodash/debounce')(fn, 0, ...args)
      )
    );

    onRefreshDataFn = jest.fn();

    onRefreshData = {
      defaultOnRefreshData: debounce(onRefreshDataFn, 1),
      debouncedOnRefreshData: debounce(onRefreshDataFn, 1),
    };

    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
      entities: {
        activeFilters: [{}],
        loaded: true,
        rows: [
          {
            id: 'testing-id',
            one: 'data',
          },
        ],
        columns: [
          {
            key: 'one',
            title: 'One',
            renderFunc: (display_name, id, item, props) => (
              <TitleColumn {...{ ...props, id, item }}>
                {display_name}
              </TitleColumn>
            ),
          },
        ],
        page: 1,
        perPage: 50,
        total: 1,
        allTags: [
          {
            name: 'something',
            tags: [
              {
                count: 5,
                tag: {
                  namespace: 'something',
                  key: 'some key',
                  value: 'some value',
                },
              },
              {
                count: 2,
                tag: {
                  namespace: 'something',
                  key: 'some key',
                  value: null,
                },
              },
            ],
          },
          {
            name: 'null',
            tags: [
              {
                count: 2,
                tag: {
                  namespace: null,
                  key: 'some key',
                  value: null,
                },
              },
            ],
          },
        ],
        operatingSystems: availableVersions,
        operatingSystemsLoaded: true,
      },
    };
    stateWithActiveFilter = {
      entities: {
        ...initialState.entities,
        loaded: true,
        activeFilters: [{ value: 'hostname_or_id', filter: 'test' }],
      },
    };

    useFetchBatched.mockReturnValue({
      fetchBatched: () =>
        new Promise((resolve) => resolve([{ results: [{ name: 'group-1' }] }])),
    });

    useFetchOperatingSystems.mockReturnValue({
      operatingSystems,
      operatingSystemsLoaded: true,
    });
  });

  describe('DOM', () => {
    it('should render correctly - not loaded', async () => {
      const store = mockStore({
        entities: {
          loaded: false,
        },
      });
      render(
        <Provider store={store}>
          <EntityTableToolbar onRefreshData={onRefreshData} loaded={false} />
        </Provider>
      );

      await expectDefaultFiltersVisible();
      expect(
        screen.getByRole('textbox', {
          name: 'text input',
        })
      ).toBeVisible();
      expect(
        screen.queryByRole('navigation', {
          name: /pagination/i,
        })
      ).not.toBeInTheDocument();
    });

    it('should render correctly - loaded', async () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar onRefreshData={onRefreshData} loaded total={1} />
        </Provider>
      );

      await expectDefaultFiltersVisible();
      expect(
        screen.getByRole('textbox', {
          name: 'text input',
        })
      ).toBeVisible();
      expectPagerDisabled();
    });

    it('should render correctly - with tags', async () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            showTags
            onRefreshData={onRefreshData}
            loaded
            total={1}
          />
        </Provider>
      );
      await expectDefaultFiltersVisible();
      expect(
        screen.getByRole('menuitem', {
          name: /tags/i,
        })
      ).toBeVisible();
    });

    it('should render correctly - with no access', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            hasAccess={false}
            onRefreshData={onRefreshData}
            loaded
          />
        </Provider>
      );

      expect(
        screen.getByRole('button', {
          name: /conditional filter/i,
        })
      ).toBeDisabled();
      expect(
        screen.getByRole('textbox', {
          name: /text input/i,
        })
      ).toBeDisabled();
      expectPagerDisabled(false);
    });

    it('should render correctly - with items', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            hasItems
            onRefreshData={onRefreshData}
            loaded
            total={1}
          />
        </Provider>
      );

      expect(
        screen.queryByRole('textbox', {
          name: 'text input',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: /items per page/i,
        })
      ).toBeEnabled();
    });

    it('should render correctly - with custom filters', async () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            onRefreshData={onRefreshData}
            loaded
            filterConfig={{
              items: [{ label: 'Filter by text', type: 'custom' }],
            }}
            total={1}
          />
        </Provider>
      );

      await expectDefaultFiltersVisible();
      expect(
        screen.getByRole('button', {
          name: /conditional filter/i,
        })
      ).toHaveTextContent('Filter by text');
      expect(
        screen.getByRole('menuitem', {
          name: /filter by text/i,
        })
      ).toBeVisible();
    });

    it('should render correctly - with custom activeFilters', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            onRefreshData={onRefreshData}
            loaded
            activeFiltersConfig={{
              filters: [
                {
                  category: 'Some',
                  chips: [
                    {
                      name: 'something',
                    },
                    {
                      name: 'something 2',
                    },
                  ],
                },
              ],
            }}
            showTags
            total={1}
          />
        </Provider>
      );

      const category = screen.getByRole('group', { name: 'Some' });
      expect(category).toBeVisible();
      expect(category).toContainElement(screen.getByText('something'));
      expect(category).toContainElement(screen.getByText('something 2'));
    });

    it('should render correctly - with default filters', () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          activeFilters: [{ staleFilter: ['fresh'] }],
        },
      });
      render(
        <Provider store={store}>
          <EntityTableToolbar onRefreshData={onRefreshData} loaded total={1} />
        </Provider>
      );

      const category = screen.getByRole('group', { name: 'Status' });
      expect(category).toBeVisible();
      expect(category).toContainElement(screen.getByText('Fresh'));
    });

    it('should render correctly - with default tag filter', () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          activeFilters: [
            {
              tagFilters: [
                {
                  type: 'tags',
                  key: 'something',
                  category: 'something',
                  values: [
                    {
                      key: 'some key',
                      group: {
                        label: 'Some tag',
                      },
                      value: 'some value',
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
      render(
        <Provider store={store}>
          <EntityTableToolbar
            onRefreshData={onRefreshData}
            loaded
            showTags
            total={1}
          />
        </Provider>
      );

      const category = screen.getByRole('group', { name: 'something' });
      expect(category).toBeVisible();
      expect(category).toContainElement(
        // TODO: fix improper store mocking
        screen.getByText(/undefined=some value/i)
      );
    });

    it('should render correctly - with disabled default tag filter', () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          activeFilters: [
            {
              tagFilters: [
                {
                  type: 'tags',
                  key: 'something',
                  category: 'something',
                  values: [
                    {
                      key: 'some key',
                      group: {
                        label: 'Some tag',
                      },
                      value: 'some value',
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
      render(
        <Provider store={store}>
          <EntityTableToolbar onRefreshData={onRefreshData} loaded total={1} />
        </Provider>
      );

      const category = screen.queryByRole('group', { name: 'something' });
      expect(category).not.toBeInTheDocument();
      expect(
        // TODO: fix improper store mocking
        screen.queryByText(/undefined=some value/i)
      ).not.toBeInTheDocument();
    });

    it('should render correctly - with children', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar onRefreshData={onRefreshData} loaded total={1}>
            <div>something</div>
          </EntityTableToolbar>
        </Provider>
      );

      expect(screen.getByText(/something/i)).toBeVisible();
    });

    it('should render correctly', () => {
      const store = mockStore(initialState);
      const { container } = render(
        <Provider store={store}>
          <EntityTableToolbar
            page={1}
            total={500}
            perPage={50}
            onRefreshData={onRefreshData}
            loaded
          />
        </Provider>
      );

      expect(
        // TODO: improve PrimaryToolbar and Pagination accessibility
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        container.querySelector('.pf-v5-c-pagination__total-items')
      ).toHaveTextContent('1 - 50 of 500');
    });

    it('should render correctly - with customFilters', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            onRefreshData={onRefreshData}
            loaded
            customFilters={{
              filters: [
                {
                  rhcdFilter: ['not_nil'],
                },
              ],
            }}
            showTags
          />
        </Provider>
      );

      const category = screen.getByRole('group', { name: 'RHC status' });
      expect(category).toBeVisible();
      expect(category).toContainElement(screen.getByText('Active'));
      expect(
        screen.getByRole('button', {
          name: /close active/i,
        })
      ).toBeVisible();
      expect(
        screen.getByRole('button', {
          name: /clear filters/i,
        })
      ).toBeVisible();
    });
  });

  describe('API', () => {
    describe('pagination', () => {
      it('should set page ', async () => {
        const store = mockStore(initialState);
        render(
          <Provider store={store}>
            <EntityTableToolbar
              page={1}
              total={500}
              perPage={50}
              onRefreshData={onRefreshData}
              loaded
            />
          </Provider>
        );

        await userEvent.click(
          screen.getByRole('button', {
            name: /go to next page/i,
          })
        );

        expect(onRefreshDataFn).toHaveBeenCalledWith({ page: 2 });
      });

      it('should set per page ', async () => {
        const store = mockStore(initialState);
        render(
          <Provider store={store}>
            <EntityTableToolbar
              page={1}
              total={500}
              perPage={50}
              onRefreshData={onRefreshData}
              loaded
            />
          </Provider>
        );

        await userEvent.click(
          screen.getByRole('button', {
            name: /items per page/i,
          })
        );
        await userEvent.click(
          screen.getByRole('menuitem', {
            name: /10 per page/i,
          })
        );
        expect(onRefreshDataFn).toHaveBeenCalledWith({ page: 1, per_page: 10 });
      });
    });

    describe('delete filter', () => {
      it('should dispatch action on delete filter', async () => {
        const store = mockStore(stateWithActiveFilter);
        render(
          <Provider store={store}>
            <EntityTableToolbar
              page={1}
              total={500}
              perPage={50}
              onRefreshData={onRefreshData}
              loaded
            />
          </Provider>
        );

        await userEvent.click(
          screen.getByRole('button', {
            name: /close test/i,
          })
        );
        expect(onRefreshDataFn).toHaveBeenCalledWith({
          filters: [{ filter: '', value: 'hostname_or_id' }],
          page: 1,
          perPage: 50,
        });
      });

      it('should remove textual filter', async () => {
        const store = mockStore({
          entities: {
            ...initialState.entities,
            loaded: true,
            activeFilters: [{ value: 'hostname_or_id', filter: 'test' }],
          },
        });
        render(
          <Provider store={store}>
            <EntityTableToolbar
              page={1}
              total={500}
              perPage={50}
              onRefreshData={onRefreshData}
              loaded
            />
          </Provider>
        );

        await userEvent.click(
          screen.getByRole('button', {
            name: /close test/i,
          })
        );
        expect(onRefreshDataFn).toHaveBeenCalledWith({
          filters: [{ filter: '', value: 'hostname_or_id' }],
          page: 1,
          perPage: 50,
        });
      });

      it('should remove tag filter', async () => {
        const store = mockStore({
          entities: {
            ...initialState.entities,
            activeFilters: [
              {
                tagFilters: [
                  {
                    type: 'tags',
                    key: 'something',
                    category: 'something',
                    values: [
                      {
                        key: 'some key',
                        group: {
                          label: 'Some tag',
                        },
                        value: 'some value',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        });
        render(
          <Provider store={store}>
            <EntityTableToolbar
              page={1}
              total={500}
              perPage={50}
              showTags
              onRefreshData={onRefreshData}
              loaded
            />
          </Provider>
        );

        // TODO: fix improper store mocking
        await userEvent.click(
          screen.getByRole('button', {
            name: /close undefined=some value/i,
          })
        );
        expect(onRefreshDataFn).toHaveBeenCalledWith({
          filters: [
            { filter: '', value: 'hostname_or_id' },
            { tagFilters: [] },
          ],
          page: 1,
          perPage: 50,
        });
      });

      it('should dispatch action on delete all filters', async () => {
        const store = mockStore(stateWithActiveFilter);
        render(
          <Provider store={store}>
            <EntityTableToolbar
              page={2}
              total={500}
              perPage={50}
              onRefreshData={onRefreshData}
              loaded
            />
          </Provider>
        );

        await userEvent.click(
          screen.getByRole('button', {
            name: /clear filters/i,
          })
        );
        const actions = store.getActions();
        console.log(
          'should sispatch action on delete all filters: all actions',
          actions
        );
        expect(actions.length).toBe(1);
        expect(actions[0]).toMatchObject({
          type: 'CLEAR_FILTERS',
        });
        expect(store.getState().entities.page).toEqual(1);
        expect(store.getState().entities.activeFilters).toEqual([
          { value: 'hostname_or_id', filter: '' },
        ]);
      });

      it('should call function on delete filter', async () => {
        const onDelete = jest.fn();
        const store = mockStore(stateWithActiveFilter);
        render(
          <Provider store={store}>
            <EntityTableToolbar
              page={1}
              total={500}
              perPage={50}
              activeFiltersConfig={{
                onDelete,
              }}
              onRefreshData={onRefreshData}
              loaded
            />
          </Provider>
        );

        await userEvent.click(
          screen.getByRole('button', {
            name: /close test/i,
          })
        );
        expect(onDelete).toHaveBeenCalled();
      });
    });

    it('trim leading/trailling whitespace ', async () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            hideFilters={{ all: true, name: false, group: true }}
            page={1}
            total={500}
            perPage={50}
            onRefreshData={onRefreshData}
            loaded
          />
        </Provider>
      );

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /text input/i,
        }),
        '   some-value   '
      );
      const state = store.getState();
      expect(state.entities.activeFilters).toMatchObject([
        {},
        { filter: 'some-value', value: 'hostname_or_id' },
      ]);
    });
  });

  describe('customization with activeFilterConfig', () => {
    it('renders custom deleteTitle when provided', () => {
      const onDelete = jest.fn();
      const store = mockStore(stateWithActiveFilter);
      render(
        <Provider store={store}>
          <EntityTableToolbar
            page={1}
            total={500}
            perPage={50}
            activeFiltersConfig={{
              onDelete,
              deleteTitle: 'Test Reset Filters',
            }}
            onRefreshData={onRefreshData}
            loaded
          />
        </Provider>
      );

      expect(
        screen.getByRole('button', {
          name: /test reset filters/i,
        })
      ).toBeVisible();
      expect(
        screen.queryByRole('button', {
          name: /clear filters/i,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe('system update method filter', () => {
    it('should hide the filter when flag is disabled', async () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <EntityTableToolbar onRefreshData={onRefreshData} loaded />
        </Provider>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /conditional filter/i,
        })
      );
      expect(
        screen.queryByRole('menuitem', {
          name: /system update method/i,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe('export', () => {
    it('it should not override a passed in exportConfig', async () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          activeFilters: [],
        },
      });
      const onSelectMock = jest.fn(async () => {});

      render(
        <Provider store={store}>
          <EntityTableToolbar
            onRefreshData={onRefreshData}
            loaded
            enableExport
            exportConfig={{
              onSelect: onSelectMock,
            }}
          />
        </Provider>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Export',
        })
      );

      await userEvent.click(
        screen.queryByRole('menuitem', {
          name: 'Export to JSON',
        })
      );

      expect(onSelectMock).toHaveBeenCalled();
    });

    it('should call the exports API', async () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          activeFilters: [],
        },
      });
      const axiosPostMock = jest.fn(async () => {});

      useAxiosWithPlatformInterceptors.mockImplementation(() => ({
        post: axiosPostMock,
      }));

      render(
        <Provider store={store}>
          <EntityTableToolbar
            onRefreshData={onRefreshData}
            loaded
            enableExport
          />
        </Provider>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Export',
        })
      );

      await userEvent.click(
        screen.queryByRole('menuitem', {
          name: 'Export all systems to CSV',
        })
      );

      expect(axiosPostMock).toHaveBeenCalled();
    });
  });
});
