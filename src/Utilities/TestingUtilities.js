import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

export const mountWithRouter = (Component, initialEntries) => {
  const wrapper = mount(
    <MemoryRouter initialEntriest={initialEntries}>{Component}</MemoryRouter>
  );

  return wrapper;
};

export const TestWrapper = ({
  children,
  routerProps = { initialEntries: ['/'] },
  path,
  store = {},
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
