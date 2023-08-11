import React from 'react';
import { MemoryRouter } from 'react-router-dom';
export const mountWithRouter = (Component, initialEntriest) => {
  const wrapper = mount(
    <MemoryRouter initialEntriest={initialEntriest}>{Component}</MemoryRouter>
  );

  return wrapper;
};
