import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStore } from '../../../store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import HostStalenessCard from '../HostStalenessCard';

describe('Table Renders', () => {
  it('Renders table with two tabs and three drop downs on each tab', () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={getStore()}>
          <HostStalenessCard />
        </Provider>
      </MemoryRouter>
    );
    expect(container.querySelector('#HostTitle')).toContainHTML(
      'Organization level system staleness and culling'
    );
    expect(container.querySelector('#HostTabs')).toContainHTML(
      'Conventional (RPM-DNF)'
    );
    expect(container.querySelector('#HostTabs')).toContainHTML(
      'Immutable (OSTree)'
    );
  });
});
