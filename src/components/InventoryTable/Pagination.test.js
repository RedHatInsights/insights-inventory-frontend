/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import React from 'react';
import Pagination from './Pagination';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.mock('../../store/actions', () => {
  const actions = jest.requireActual('../../store/actions');
  const { ACTION_TYPES } = jest.requireActual('../../store/action-types');
  return {
    __esModule: true,
    ...actions,
    loadEntities: () => ({
      type: ACTION_TYPES.LOAD_ENTITIES,
      payload: () => Promise.resolve({}),
      meta: { showTags: undefined },
    }),
  };
});

describe('Pagination', () => {
  let initialState;
  let mockStore;
  let onRefreshData;

  let WrappedPagination;

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
      entities: {
        activeFilters: [{}],
        loaded: true,
      },
    };
    onRefreshData = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [], total: 0 }));

    // eslint-disable-next-line react/display-name
    WrappedPagination = ({ store, ...props }) => (
      <Provider store={store}>
        <Pagination loaded {...props} onRefreshData={onRefreshData} />
      </Provider>
    );
  });

  describe('render', () => {
    it('should render correctly - no data', () => {
      const store = mockStore({ entities: {} });
      const view = render(<WrappedPagination store={store} loaded={false} />);

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('should render correctly with data', () => {
      const store = mockStore(initialState);
      const view = render(<WrappedPagination store={store} />);

      expect(view.asFragment()).toMatchSnapshot();
      expect(
        screen.getByRole('button', {
          name: /go to first page/i,
        })
      ).toBeDisabled();
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
      expect(
        screen.getByRole('button', {
          name: /go to last page/i,
        })
      ).toBeDisabled();
    });

    it('should render correctly - with no access', () => {
      const store = mockStore(initialState);
      const view = render(
        <WrappedPagination store={store} hasAccess={false} />
      );

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('should render correctly with data and props', () => {
      const store = mockStore(initialState);
      const view = render(
        <WrappedPagination store={store} page={1} perPage={50} total={500} />
      );

      expect(view.asFragment()).toMatchSnapshot();
      expect(
        screen.getByRole('button', {
          name: /go to first page/i,
        })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {
          name: /go to previous page/i,
        })
      ).toBeDisabled();
    });

    it('should render correctly with data and isFull', () => {
      const store = mockStore(initialState);
      const view = render(
        <WrappedPagination
          store={store}
          page={1}
          perPage={50}
          total={500}
          isFull
        />
      );

      expect(view.asFragment()).toMatchSnapshot();
      expect(
        screen.getByRole('button', {
          name: /go to first page/i,
        })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {
          name: /go to previous page/i,
        })
      ).toBeDisabled();
    });
  });

  describe('API', () => {
    it('should call perPage change', async () => {
      const store = mockStore(initialState);
      render(
        <WrappedPagination store={store} page={1} perPage={50} total={500} />
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
      expect(onRefreshData).toHaveBeenCalledWith({ page: 1, per_page: 10 });
    });

    it('should call onSetPage change without', async () => {
      const store = mockStore(initialState);
      render(
        <WrappedPagination store={store} page={1} perPage={50} total={500} />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /go to next page/i,
        })
      );
      expect(onRefreshData).toHaveBeenCalledWith({ page: 2 });
    });
  });
});
