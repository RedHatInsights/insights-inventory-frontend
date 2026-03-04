import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import SystemsViewToggle from './SystemsViewToggle';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { View } from '../../routes/InventoryViews';

const setView = jest.fn();

beforeEach(() => {
  setView.mockClear();
});

const getSystemsButton = () =>
  screen.getByRole('button', { name: 'View by systems' });
const getImagesButton = () =>
  screen.getByRole('button', { name: 'View by images' });

const renderToggle = (view: View) => {
  render(<SystemsViewToggle view={view} setView={setView} />);
};

describe('SystemsViewToggle', () => {
  test('shows all elements', () => {
    renderToggle('systems');
    expect(screen.getByText('View by')).toBeVisible();
    expect(getSystemsButton()).toBeVisible();
    expect(getImagesButton()).toBeVisible();
  });

  test('shows systems toggle selected when "systems" are passed in', () => {
    renderToggle('systems');
    expect(getSystemsButton()).toHaveAttribute('aria-pressed', 'true');
    expect(getImagesButton()).toHaveAttribute('aria-pressed', 'false');
  });

  test('shows images toggle selected when "images" are passed in', () => {
    renderToggle('images');
    expect(getSystemsButton()).toHaveAttribute('aria-pressed', 'false');
    expect(getImagesButton()).toHaveAttribute('aria-pressed', 'true');
  });

  test('calls setView with "systems" when systems toggle is selected', async () => {
    renderToggle('images');
    await userEvent.click(getSystemsButton());
    expect(setView).toHaveBeenCalledWith('systems');
  });

  test('calls setView with "images" when images toggle is selected', async () => {
    renderToggle('systems');
    await userEvent.click(getImagesButton());
    expect(setView).toHaveBeenCalledWith('images');
  });
});
