import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import InventoryGroups from './InventoryGroups';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    ...jest.requireActual(
      '@redhat-cloud-services/frontend-components-utilities/RBACHook'
    ),
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);

describe('inventory groups route', () => {
  it('renders header and table wrapper', () => {
    const { container } = render(<InventoryGroups />);

    expect(container.querySelector('h1')).toHaveTextContent('Groups');
    expect(
      container.querySelector('[data-ouia-component-id="groups-table-wrapper"]')
    ).toBeInTheDocument();
  });

  it('should contain get help expandable', () => {
    const { getByText } = render(<InventoryGroups />);
    expect(getByText('Help get started with new features')).toBeInTheDocument();
    expect(getByText('Create an Inventory group')).toBeInTheDocument();
    expect(
      getByText('Configure User Access for your Inventory groups')
    ).toBeInTheDocument();
  });
});
