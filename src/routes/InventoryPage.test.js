/* eslint-disable react/display-name */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AccountStatContext } from '../Routes';
import InventoryPage from './InventoryPage';

jest.mock('./InventoryComponents/HybridInventory', () => () => (
  <div data-testid="HybridInventory" />
));
jest.mock('./InventoryComponents/BifrostTable', () => () => (
  <div data-testid="BifrostTable" />
));
jest.mock('../Utilities/useFeatureFlag', () => () => true);
const defaultContextValues = {
  hasConventionalSystems: true,
  hasEdgeDevices: true,
  hasBootcImages: true,
};

const mountWithContext = (contextValues = defaultContextValues) => {
  render(
    <AccountStatContext.Provider value={{ ...contextValues }}>
      <InventoryPage />
    </AccountStatContext.Provider>
  );
};

describe('Inventory', () => {
  test('renders initial default main content correctly', () => {
    mountWithContext();
    expect(screen.getByTestId('HybridInventory')).toBeInTheDocument();
  });

  test('changes main content when toggle is clicked', async () => {
    mountWithContext();
    const bifrostToggle = screen.getByLabelText('Bifrost');

    await userEvent.click(bifrostToggle);

    expect(screen.getByTestId('BifrostTable')).toBeInTheDocument();
  });
});
