/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HostStaleness from './InventoryHostStaleness';
import { useConditionalRBAC } from '../Utilities/hooks/useConditionalRBAC';
import { useHostStalenessKesselAccess } from '../Utilities/hooks/useHostStalenessKesselAccess';
import { GENERAL_HOST_STALENESS_READ_PERMISSION } from '../components/InventoryHostStaleness/constants';
import { GENERAL_HOSTS_READ_PERMISSIONS } from '../constants';

jest.mock('../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: false, isOrgAdmin: false })),
}));

jest.mock('../Utilities/hooks/useHostStalenessKesselAccess', () => ({
  useHostStalenessKesselAccess: jest.fn(() => ({ mode: 'rbac' })),
}));

jest.mock('../components/InventoryHostStaleness', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="inventory-host-staleness-content">Staleness settings</div>
  ),
}));

jest.mock('../components/OutageAlert', () => ({
  OutageAlert: () => null,
}));

describe('HostStaleness route (RBAC v1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useHostStalenessKesselAccess.mockReturnValue({ mode: 'rbac' });
  });

  it('requests staleness read and inventory hosts read with checkAll', () => {
    useConditionalRBAC.mockReturnValue({
      hasAccess: true,
      isOrgAdmin: false,
    });

    render(<HostStaleness />);

    expect(useConditionalRBAC).toHaveBeenCalledWith(
      [GENERAL_HOST_STALENESS_READ_PERMISSION, GENERAL_HOSTS_READ_PERMISSIONS],
      true,
    );
  });

  it('shows no access when RBAC read permissions are missing', () => {
    useConditionalRBAC.mockReturnValue({
      hasAccess: false,
      isOrgAdmin: false,
    });

    render(<HostStaleness />);

    expect(
      screen.getByRole('heading', { name: /access permissions needed/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('inventory-host-staleness-content'),
    ).not.toBeInTheDocument();
  });

  it('renders staleness content when RBAC read permissions are granted', () => {
    useConditionalRBAC.mockReturnValue({
      hasAccess: true,
      isOrgAdmin: false,
    });

    render(<HostStaleness />);

    expect(
      screen.getByTestId('inventory-host-staleness-content'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /access permissions needed/i }),
    ).not.toBeInTheDocument();
  });
});

describe('HostStaleness route (Kessel)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConditionalRBAC.mockReturnValue({
      hasAccess: true,
      isOrgAdmin: false,
    });
  });

  it('shows a permission spinner while Kessel access is loading', () => {
    useHostStalenessKesselAccess.mockReturnValue({
      mode: 'kessel',
      isLoading: true,
      canViewPage: false,
      canEditStaleness: false,
    });

    render(<HostStaleness />);

    expect(screen.getByLabelText('Loading permissions')).toBeInTheDocument();
    expect(
      screen.queryByTestId('inventory-host-staleness-content'),
    ).not.toBeInTheDocument();
  });

  it('shows no access when Kessel denies page view', () => {
    useHostStalenessKesselAccess.mockReturnValue({
      mode: 'kessel',
      isLoading: false,
      canViewPage: false,
      canEditStaleness: false,
    });

    render(<HostStaleness />);

    expect(
      screen.getByRole('heading', { name: /access permissions needed/i }),
    ).toBeInTheDocument();
  });
});
