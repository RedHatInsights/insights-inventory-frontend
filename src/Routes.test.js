/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Routes } from './Routes';
import useFeatureFlag from './Utilities/useFeatureFlag';
import InventoryGroups from './components/InventoryGroups';
import { inventoryHasConventionalSystems } from './Utilities/conventional';
import { inventoryHasEdgeSystems } from './Utilities/edge';

jest.mock('./Utilities/useFeatureFlag');
jest.mock('./components/InventoryGroups');
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

describe('/groups', () => {
  InventoryGroups.mockReturnValue(<div>Inventory groups component</div>);

  useFeatureFlag.mockImplementation(
    (flag) =>
      ({
        'edgeParity.inventory-list': false,
      }[flag])
  );

  it('renders fallback on lazy load first', async () => {
    render(<TestWrapper route={'/groups'} />);

    await waitFor(() => {
      expect(screen.getByText('Loading')).toBeVisible();
    });
  });

  it('renders the groups page content', async () => {
    render(<TestWrapper route={'/groups'} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Groups' })).toBeVisible();
      expect(
        screen.getByLabelText('Open Inventory groups popover')
      ).toBeVisible();
      expect(screen.getByText('Inventory groups component')).toBeVisible(); // mocked
    });
  });
});

describe('zero state', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
});
