/* eslint-disable react/prop-types */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Routes } from './Routes';
import useFeatureFlag from './Utilities/useFeatureFlag';
import InventoryGroups from './components/InventoryGroups';

jest.mock('./Utilities/useFeatureFlag');
jest.mock('./components/InventoryGroups');
jest.mock('./Utilities/conventional');

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
        'hbi.ui.inventory-groups': true,
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
