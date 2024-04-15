/* eslint-disable react/display-name */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import InventoryPage from './InventoryPage';

jest.mock('./InventoryComponents/HybridInventory', () => () => (
  <div data-testid="HybridInventory" />
));
jest.mock('./InventoryComponents/BifrostTable', () => () => (
  <div data-testid="BifrostTable" />
));
jest.mock('../Utilities/useFeatureFlag', () => () => true);

describe('Inventory', () => {
  test('renders without crashing', () => {
    render(<InventoryPage />);
  });

  test('renders initial default main content correctly', () => {
    render(<InventoryPage />);
    expect(screen.getByTestId('HybridInventory')).toBeInTheDocument();
  });

  test('changes main content when toggle is clicked', async () => {
    render(<InventoryPage />);
    const bifrostToggle = screen.getByLabelText('Bifrost');

    await userEvent.click(bifrostToggle);

    expect(screen.getByTestId('BifrostTable')).toBeInTheDocument();
  });
});
