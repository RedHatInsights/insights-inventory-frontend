import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PropTypes from 'prop-types';

export const mountWithRouter = (Component, initialEntries) => {
  const wrapper = mount(
    <MemoryRouter initialEntriest={initialEntries}>{Component}</MemoryRouter>
  );

  return wrapper;
};

export const RouterWrapper = ({
  children,
  routerProps = { initialEntries: ['/'] },
  path,
}) => (
  <MemoryRouter {...routerProps}>
    {path ? (
      <Routes>
        <Route path={path} element={children} />
      </Routes>
    ) : (
      children
    )}
  </MemoryRouter>
);

RouterWrapper.propTypes = {
  children: PropTypes.any.isRequired,
  routerProps: PropTypes.shape({
    initialEntries: PropTypes.arrayOf(PropTypes.string),
  }),
  path: PropTypes.string,
};
