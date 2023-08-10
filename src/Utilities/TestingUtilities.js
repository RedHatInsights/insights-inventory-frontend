import React from 'react';
import { MemoryRouter } from 'react-router-dom';
export const mountWithRouter = (Component) => {
  const wrapper = mount(<MemoryRouter>{Component}</MemoryRouter>);

  return wrapper;
};
