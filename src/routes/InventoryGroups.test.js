import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import InventoryGroups from './InventoryGroups';

describe('inventory groups route', () => {
  it('renders header and table wrapper', () => {
    const { container } = render(<InventoryGroups />);

    expect(container.querySelector('h1')).toHaveTextContent('Groups');
    expect(
      container.querySelector('[data-ouia-component-id="groups-table-wrapper"]')
    ).toBeInTheDocument();
  });
});
