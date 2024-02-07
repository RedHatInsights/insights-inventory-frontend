import PropTypes from 'prop-types';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

export const TestWrapper = ({
  children,
  routerProps = { initialEntries: ['/'] },
  path,
  store = mockStore(),
}) => {
  return (
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
  );
};

TestWrapper.propTypes = {
  children: PropTypes.any.isRequired,
  routerProps: PropTypes.shape({
    initialEntries: PropTypes.arrayOf(PropTypes.string),
  }),
  path: PropTypes.string,
  store: PropTypes.any,
};
