import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import InventoryGroups from './InventoryGroups';
import useWorkspaceFeatureFlag from '../Utilities/hooks/useWorkspaceFeatureFlag';

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
jest.mock('../Utilities/hooks/useWorkspaceFeatureFlag');

describe('inventory groups route', () => {
  beforeEach(() => {
    useWorkspaceFeatureFlag.mockReturnValue(false);
  });

  it('renders header and table wrapper', () => {
    render(<InventoryGroups />);

    screen.getByRole('heading', {
      name: /groups/i,
    });
    screen.getByTestId('groups-table-wrapper');
  });

  it('should contain get help expandable', async () => {
    render(<InventoryGroups />);

    await userEvent.click(
      screen.getByText(/help get started with new features/i)
    );
    screen.getByRole('button', {
      name: /create an inventory group/i,
    });
    screen.getByRole('button', {
      name: /configure user access for your inventory groups/i,
    });
  });
});
