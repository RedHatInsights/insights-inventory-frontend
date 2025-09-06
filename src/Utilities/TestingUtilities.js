import PropTypes from 'prop-types';
import React from 'react';
import { act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockStore = configureStore();

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        cacheTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  });

export const flushPromises = async () =>
  act(async () => {
    await Promise.resolve();
  });

export const QueryClientWrapper = ({
  client = createTestQueryClient(),
  children,
}) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
QueryClientWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  client: PropTypes.object,
};

export const TestWrapper = ({
  children,
  routerProps = { initialEntries: ['/'] },
  path,
  store = mockStore(),
  client = createTestQueryClient(),
}) => {
  return (
    <QueryClientWrapper client={client}>
      <MemoryRouter {...routerProps}>
        <Provider store={store}>
          {path ? (
            <Routes>
              <Route path={path} element={children} />
            </Routes>
          ) : (
            children
          )}
        </Provider>
      </MemoryRouter>
    </QueryClientWrapper>
  );
};

TestWrapper.propTypes = {
  children: PropTypes.any.isRequired,
  routerProps: PropTypes.shape({
    initialEntries: PropTypes.arrayOf(PropTypes.string),
  }),
  path: PropTypes.string,
  store: PropTypes.any,
  client: PropTypes.object,
};
