/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PropTypes from 'prop-types';
import RenderWrapper from './Wrapper';
import { useKesselMigrationFeatureFlag } from './hooks/useKesselMigrationFeatureFlag';
import { useConditionalRBAC } from './hooks/useConditionalRBAC';
import { useCanFetchHostsWhenKessel } from './hooks/useCanFetchHostsWhenKessel';

const MockChild = ({ hasAccess }) => (
  <div data-testid="mock-inventory-child">
    {hasAccess === true && (
      <span data-testid="systems-visible">Systems visible</span>
    )}
    {hasAccess === false && (
      <span data-testid="no-access">
        This application requires Inventory permissions
      </span>
    )}
    {hasAccess === undefined && (
      <span data-testid="access-undefined">Access undefined</span>
    )}
  </div>
);
MockChild.propTypes = {
  hasAccess: PropTypes.bool,
};

jest.mock('./hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: jest.fn(() => false),
}));

jest.mock('./hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: true, isOrgAdmin: false })),
}));

jest.mock('./hooks/useCanFetchHostsWhenKessel', () => ({
  useCanFetchHostsWhenKessel: jest.fn(() => null),
}));

const renderWrapper = (props = {}) =>
  render(<RenderWrapper cmp={MockChild} {...props} />);

describe('RenderWrapper access gating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useKesselMigrationFeatureFlag.mockReturnValue(false);
    useConditionalRBAC.mockReturnValue({ hasAccess: true, isOrgAdmin: false });
    useCanFetchHostsWhenKessel.mockReturnValue(null);
  });

  describe('when Kessel flag is OFF (RBAC path)', () => {
    it('passes hasAccess true to child when user has RBAC access', () => {
      useConditionalRBAC.mockReturnValue({
        hasAccess: true,
        isOrgAdmin: false,
      });

      renderWrapper();

      expect(screen.getByTestId('systems-visible')).toBeInTheDocument();
      expect(screen.getByTestId('mock-inventory-child')).toBeInTheDocument();
      expect(screen.queryByTestId('no-access')).not.toBeInTheDocument();
    });

    it('passes hasAccess false to child when user does not have RBAC access (no access state)', () => {
      useConditionalRBAC.mockReturnValue({
        hasAccess: false,
        isOrgAdmin: false,
      });

      renderWrapper();

      expect(screen.getByTestId('no-access')).toBeInTheDocument();
      expect(
        screen.getByText(/This application requires Inventory permissions/),
      ).toBeInTheDocument();
      expect(screen.queryByTestId('systems-visible')).not.toBeInTheDocument();
    });
  });

  describe('when Kessel flag is ON (Kessel path)', () => {
    beforeEach(() => {
      useKesselMigrationFeatureFlag.mockReturnValue(true);
    });

    it('passes hasAccess undefined to child while Kessel probe is in progress', () => {
      useCanFetchHostsWhenKessel.mockReturnValue({
        hasAccess: undefined,
        isLoading: true,
      });

      renderWrapper();

      expect(screen.getByTestId('mock-inventory-child')).toBeInTheDocument();
      expect(screen.getByTestId('access-undefined')).toBeInTheDocument();
      expect(screen.getByText(/Access undefined/)).toBeInTheDocument();
    });

    it('passes hasAccess true to child when user can fetch hosts (Kessel allows)', () => {
      useCanFetchHostsWhenKessel.mockReturnValue({
        hasAccess: true,
        isLoading: false,
      });

      renderWrapper();

      expect(screen.getByTestId('systems-visible')).toBeInTheDocument();
      expect(screen.queryByTestId('no-access')).not.toBeInTheDocument();
    });

    it('passes hasAccess false to child when user cannot fetch hosts (no access state)', () => {
      useCanFetchHostsWhenKessel.mockReturnValue({
        hasAccess: false,
        isLoading: false,
      });

      renderWrapper();

      expect(screen.getByTestId('no-access')).toBeInTheDocument();
      expect(
        screen.getByText(/This application requires Inventory permissions/),
      ).toBeInTheDocument();
      expect(screen.queryByTestId('systems-visible')).not.toBeInTheDocument();
    });
  });

  describe('loadChromelessInventory override', () => {
    it('grants access when tableProps.envContext.loadChromeless is true (Kessel on, no Kessel access)', () => {
      useKesselMigrationFeatureFlag.mockReturnValue(true);
      useCanFetchHostsWhenKessel.mockReturnValue({
        hasAccess: false,
        isLoading: false,
      });

      renderWrapper({
        tableProps: {
          envContext: { loadChromeless: true },
        },
      });

      expect(screen.getByTestId('systems-visible')).toBeInTheDocument();
    });

    it('grants access when tableProps.envContext.loadChromeless is true (RBAC no access)', () => {
      useConditionalRBAC.mockReturnValue({
        hasAccess: false,
        isOrgAdmin: false,
      });

      renderWrapper({
        tableProps: {
          envContext: { loadChromeless: true },
        },
      });

      expect(screen.getByTestId('systems-visible')).toBeInTheDocument();
    });
  });
});
