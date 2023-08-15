import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStore } from '../../../store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import NoGroupsEmptyState from '../NoGroupsEmptyState';

describe('NoGroupsEmptyState', () => {
  it('renders title and icon', () => {
    const { getByRole, container } = render(
      <MemoryRouter>
        <Provider store={getStore()}>
          <NoGroupsEmptyState />
        </Provider>
      </MemoryRouter>
    );
    // toHaveTextContent is a part of @testing-library/jest-dom
    expect(getByRole('heading')).toHaveTextContent('No inventory groups');
    expect(container.querySelector('.pf-c-empty-state__icon')).not.toBe(null);
  });

  it('has primary and link buttons', () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={getStore()}>
          <NoGroupsEmptyState />
        </Provider>
      </MemoryRouter>
    );
    expect(container.querySelector('.pf-m-primary')).toHaveTextContent(
      'Create group'
    );
  });
});
