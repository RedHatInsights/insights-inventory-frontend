import React from 'react';
import { MemoryRouter } from 'react-router-dom';
export const mountWithRouter = (Component, initialEntries) => {
  const wrapper = mount(
    <MemoryRouter initialEntriest={initialEntries}>{Component}</MemoryRouter>
  );

  return wrapper;
};
