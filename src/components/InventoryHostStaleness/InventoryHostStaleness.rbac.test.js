/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import InventoryHostStaleness from './InventoryHostStaleness';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import {
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
} from './constants';
import {
  GENERAL_HOSTS_READ_PERMISSIONS,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../constants';

jest.mock('../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: false, isOrgAdmin: false })),
}));

jest.mock('./HostStalenessCard', () => ({
  __esModule: true,
  default: ({ canModifyHostStaleness }) => (
    <div
      data-testid="host-staleness-card"
      data-can-modify={String(canModifyHostStaleness)}
    />
  ),
}));

const MODIFY_PERMISSIONS = [
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOSTS_READ_PERMISSIONS,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
];

describe('InventoryHostStaleness RBAC v1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires all staleness and hosts read/write permissions to allow editing', () => {
    useConditionalRBAC.mockReturnValue({
      hasAccess: true,
      isOrgAdmin: false,
    });

    render(<InventoryHostStaleness />);

    expect(useConditionalRBAC).toHaveBeenCalledWith(MODIFY_PERMISSIONS, true);
  });

  it('passes canModifyHostStaleness false when write permissions are missing', () => {
    useConditionalRBAC.mockReturnValue({
      hasAccess: false,
      isOrgAdmin: false,
    });

    render(<InventoryHostStaleness />);

    expect(screen.getByTestId('host-staleness-card')).toHaveAttribute(
      'data-can-modify',
      'false',
    );
  });

  it('passes canModifyHostStaleness true when all modify permissions are granted', () => {
    useConditionalRBAC.mockReturnValue({
      hasAccess: true,
      isOrgAdmin: false,
    });

    render(<InventoryHostStaleness />);

    expect(screen.getByTestId('host-staleness-card')).toHaveAttribute(
      'data-can-modify',
      'true',
    );
  });

  it('uses Kessel edit override instead of RBAC when provided', () => {
    useConditionalRBAC.mockReturnValue({
      hasAccess: true,
      isOrgAdmin: false,
    });

    render(
      <InventoryHostStaleness
        kesselCanModifyHostStaleness={false}
        editDisabledTooltip="Kessel read-only"
      />,
    );

    expect(screen.getByTestId('host-staleness-card')).toHaveAttribute(
      'data-can-modify',
      'false',
    );
  });
});
