import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import InventoryGroups from './InventoryGroups';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    usePermissionsWithContext: jest.fn(),
  })
);

describe('inventory groups route', () => {
  it('renders empty state when access forbidden', () => {
    usePermissionsWithContext.mockImplementation(() => ({
      hasAccess: false,
    }));

    const { container, getByText } = render(<InventoryGroups />);

    expect(container.querySelector('h1')).toHaveTextContent('Groups');
    expect(
      getByText('Inventory group access permissions needed')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-ouia-component-id="groups-table-wrapper"]')
    ).not.toBeInTheDocument();
  });

  it('renders table wrapper when access allowed', () => {
    usePermissionsWithContext.mockImplementation(() => ({
      hasAccess: true,
    }));

    const { container } = render(<InventoryGroups />);

    expect(container.querySelector('h1')).toHaveTextContent('Groups');
    expect(
      container.querySelector('[data-ouia-component-id="groups-table-wrapper"]')
    ).toBeInTheDocument();
  });
});
