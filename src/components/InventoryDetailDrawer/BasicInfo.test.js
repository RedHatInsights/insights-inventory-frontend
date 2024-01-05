import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import BasicInfo from './BasicInfo';

describe('BasicInfo', () => {
  let initialState;
  let mockStore;
  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
      entityDetails: {
        entity: {
          display_name: 'something',
          id: 'some-id',
          tags: [
            { namespace: 'one', key: 'key', value: 'value' },
            { key: 'key', value: 'value' },
            { namespace: 'one', key: 'key' },
            { key: 'key' },
          ],
        },
      },
    };
  });

  it('should render without data', () => {
    const store = mockStore({
      entityDetails: {},
    });
    render(
      <Provider store={store}>
        <BasicInfo />
      </Provider>
    );

    expect(
      screen.queryByRole('heading', {
        name: /something/i,
      })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /open in inventory/i,
      })
    ).toBeVisible();
  });

  it('should render with data', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <BasicInfo />
      </Provider>
    );

    expect(
      screen.getByRole('heading', {
        name: /something/i,
      })
    ).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: /open in inventory/i,
      })
    ).toBeVisible();
  });

  it('should render with no inv link', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <BasicInfo hideInvLink />
      </Provider>
    );

    expect(
      screen.getByRole('heading', {
        name: /something/i,
      })
    ).toBeVisible();
    expect(
      screen.queryByRole('link', {
        name: /open in inventory/i,
      })
    ).not.toBeInTheDocument();
  });

  it('should render with tags', () => {
    const store = mockStore(initialState);
    const view = render(
      <Provider store={store}>
        <BasicInfo showTags />
      </Provider>
    );

    expect(view.asFragment()).toMatchSnapshot();
  });
});
