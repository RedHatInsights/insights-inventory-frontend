/* eslint-disable react/display-name */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import TagWithDialog from './TagWithDialog';

jest.mock('../store/actions', () => {
  const actions = jest.requireActual('../store/actions');
  const ACTION_TYPES = jest.requireActual('../store/action-types');
  return {
    __esModule: true,
    ...actions,
    loadTags: () => ({
      type: ACTION_TYPES.LOAD_TAGS,
      payload: () => Promise.resolve([]),
    }),
  };
});

describe('EntityTable', () => {
  let mockStore;
  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware()]);
  });

  describe('DOM', () => {
    it('should render with count', () => {
      const store = mockStore({});
      const view = render(<TagWithDialog store={store} count={10} />);

      expect(
        screen.getByRole('button', {
          name: '10',
        })
      ).toBeVisible();
      expect(view.asFragment()).toMatchSnapshot();
    });
  });

  describe('API', () => {
    it('should NOT call actions', async () => {
      const store = mockStore({});
      render(<TagWithDialog store={store} count={10} />);

      await userEvent.click(
        screen.getByRole('button', {
          name: '10',
        })
      );
      const actions = store.getActions();
      expect(actions.length).toBe(0);
    });

    it('should call actions', async () => {
      const store = mockStore({});
      render(<TagWithDialog store={store} count={10} systemId="something" />);

      await userEvent.click(
        screen.getByRole('button', {
          name: '10',
        })
      );
      const actions = store.getActions();
      expect(actions.length).toBe(3);
    });
  });
});
