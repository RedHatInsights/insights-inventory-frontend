import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { KESSEL_API_PATH } from '../constants';
import InventoryGroups from './InventoryGroups';

const accessCheckWrapper = ({ children }) => (
  <AccessCheck.Provider
    baseUrl={
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost'
    }
    apiPath={KESSEL_API_PATH}
  >
    {children}
  </AccessCheck.Provider>
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    ...jest.requireActual(
      '@redhat-cloud-services/frontend-components-utilities/RBACHook',
    ),
    usePermissionsWithContext: () => ({ hasAccess: true }),
  }),
);
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    quickStarts: {
      activateQuickstart: () => {},
    },
  }),
}));
jest.mock('../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn((flag) =>
    flag === 'inventory-frontend.kessel-enabled' ? false : true,
  ),
  useFeatureVariant: jest.fn(() => ({
    isEnabled: false,
  })),
}));

describe('workspaces route', () => {
  it('renders header and table wrapper', () => {
    render(<InventoryGroups />, { wrapper: accessCheckWrapper });

    screen.getByRole('heading', {
      name: /workspaces/i,
    });
    screen.getByTestId('groups-table-wrapper');
  });

  it('should contain get help expandable', async () => {
    render(<InventoryGroups />, { wrapper: accessCheckWrapper });

    await userEvent.click(
      screen.getByText(/help get started with new features/i),
    );
    screen.getByRole('button', {
      name: /create a workspace/i,
    });
    screen.getByRole('button', {
      name: /configure user access for your workspaces/i,
    });
  });
});
