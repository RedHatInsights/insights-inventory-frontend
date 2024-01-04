/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Routes } from './Routes';
import useFeatureFlag from './Utilities/useFeatureFlag';
import { inventoryHasConventionalSystems } from './Utilities/conventional';
import { inventoryHasEdgeSystems } from './Utilities/edge';

jest.mock('./Utilities/useFeatureFlag');
jest.mock('./routes/InventoryOrEdgeComponent', () => () => (
  <span>Groups component</span>
));
jest.mock('./Utilities/conventional');
jest.mock('./Utilities/edge');
jest.mock(
  '@redhat-cloud-services/frontend-components/AsyncComponent',
  () => () => <span>Zero state</span>
);
jest.mock('./Utilities/Wrapper', () => () => <span>Route component</span>);

const TestWrapper = ({ route }) => (
  <MemoryRouter initialEntries={[route]}>
    <Suspense fallback="Loading">
      <Routes />
    </Suspense>
  </MemoryRouter>
);

describe('routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  useFeatureFlag.mockReturnValue({
    'edgeParity.inventory-list': true, // to be removed once feature flag is gone
  });

  describe('/groups', () => {
    inventoryHasConventionalSystems.mockReturnValue(true);
    inventoryHasEdgeSystems.mockReturnValue(true);

    it('renders fallback on lazy load first', async () => {
      render(<TestWrapper route={'/groups'} />);

      await waitFor(() => {
        expect(screen.getByText('Loading')).toBeVisible();
      });
    });

    it('renders the groups route', async () => {
      render(<TestWrapper route={'/groups'} />);

      await waitFor(() => {
        expect(screen.getByText('Groups component')).toBeVisible(); // mocked
      });
    });
  });

  describe('zero state', () => {
    it('renderes zero state when there are no systems', async () => {
      inventoryHasConventionalSystems.mockReturnValue(false);
      inventoryHasEdgeSystems.mockReturnValue(false);
      render(<TestWrapper route={'/'} />);

      await waitFor(() => {
        expect(screen.getByText('Zero state')).toBeVisible();
      });
    });

    it('renders a route when there are some conventional systems', async () => {
      inventoryHasConventionalSystems.mockReturnValue(true);
      inventoryHasEdgeSystems.mockReturnValue(false);
      render(<TestWrapper route={'/'} />);

      await waitFor(() => {
        expect(screen.getByText('Route component')).toBeVisible();
      });
    });

    it('renders a route when there are some edge systems', async () => {
      inventoryHasConventionalSystems.mockReturnValue(false);
      inventoryHasEdgeSystems.mockReturnValue(true);
      render(<TestWrapper route={'/'} />);

      await waitFor(() => {
        expect(screen.getByText('Route component')).toBeVisible();
      });
    });

    it('renders spinner before any route', async () => {
      render(<TestWrapper route={'/'} />);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeVisible();
      });
    });
  });
});
