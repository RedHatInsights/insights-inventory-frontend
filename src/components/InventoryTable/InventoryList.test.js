import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import InventoryList from './InventoryList';

jest.mock('../../Utilities/useFeatureFlag.js');
jest.mock('../../store/actions', () => {
  const actions = jest.requireActual('../../store/actions');
  const { ACTION_TYPES } = jest.requireActual('../../store/action-types');
  return {
    __esModule: true,
    ...actions,
    loadEntities: () => ({
      type: ACTION_TYPES.LOAD_ENTITIES,
      payload: () => Promise.resolve([]),
    }),
  };
});

describe('InventoryList', () => {
  let initialState;
  let mockStore;
  let ref;
  let onRefreshData;

  beforeEach(() => {
    ref = { current: undefined };
    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
      entities: {
        activeFilters: [{}],
        loaded: true,
        rows: [],
        columns: [{ key: 'one', title: 'One' }],
        page: 1,
        perPage: 50,
        total: 500,
      },
    };
    onRefreshData = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [], total: 0 }));
  });

  it('should render correctly', () => {
    const store = mockStore(initialState);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <InventoryList
            ref={ref}
            onRefreshData={onRefreshData}
            loaded
            hasAccess={true}
          />
        </Provider>
      </MemoryRouter>
    );

    screen.getByRole('columnheader', {
      name: /one/i,
    });
    screen.getByRole('grid', {
      name: /host inventory/i,
    });
    screen.getByRole('heading', {
      name: /no matching systems found/i,
    });
    screen.getByText(/to continue, edit your filter settings and try again/i);
  });

  it('should render correctly - with no access', () => {
    const store = mockStore(initialState);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <InventoryList
            hasAccess={false}
            ref={ref}
            onRefreshData={onRefreshData}
            loaded
          />
        </Provider>
      </MemoryRouter>
    );

    screen.getByRole('heading', {
      name: /you do not have access to inventory/i,
    });
    screen.getByText(
      /to view your systems, you must be granted inventory access from your organization administrator\./i
    );
  });

  describe('API', () => {
    beforeEach(() => {
      onRefreshData.mockClear();
    });

    it('should fire refresh calling it from ref', () => {
      const store = mockStore(initialState);
      const Cmp = (props) => (
        <MemoryRouter>
          <Provider store={store}>
            <InventoryList
              {...props}
              ref={ref}
              onRefreshData={onRefreshData}
              loaded
              hasAccess={true}
            />
          </Provider>
        </MemoryRouter>
      );
      render(
        <Cmp
          items={[
            { children: () => <div>test</div>, isOpen: false, id: 'fff' },
          ]}
          hasItems
          hasAccess={true}
        />
      );

      ref.current.onRefreshData();
      expect(onRefreshData).toHaveBeenCalledTimes(1);
    });
  });
});
