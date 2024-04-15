import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

import InventoryPageHeader from './InventoryPageHeader';

jest.mock('../../Utilities/useFeatureFlag');

const user = userEvent.setup();
describe('InventoryContentToggle', () => {
  test('renders toggle items with correct labels and icons', () => {
    const changeMainContentMock = jest.fn();
    const mainContent = 'bifrost';
    useFeatureFlag.mockReturnValue(true);

    render(
      <InventoryPageHeader
        changeMainContent={changeMainContentMock}
        mainContent={mainContent}
      />
    );

    expect(screen.getByLabelText('Hybrid inventory')).toBeInTheDocument();
    expect(screen.getByLabelText('Bifrost')).toBeInTheDocument();
    expect(screen.getByLabelText('Bifrost')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('calls changeMainContent with correct content key when Bifrost is clicked', async () => {
    const changeMainContentMock = jest.fn();
    const mainContent = 'someContent';

    render(
      <InventoryPageHeader
        changeMainContent={changeMainContentMock}
        mainContent={mainContent}
      />
    );

    await user.click(screen.getByLabelText('Bifrost'));

    expect(changeMainContentMock).toHaveBeenCalledWith('bifrost');
    expect(changeMainContentMock).toHaveBeenCalledTimes(1);
  });

  test('calls changeMainContent with correct content key when Hybrid inventory is clicked', async () => {
    const changeMainContentMock = jest.fn();
    const mainContent = 'someContent';

    render(
      <InventoryPageHeader
        changeMainContent={changeMainContentMock}
        mainContent={mainContent}
      />
    );

    await user.click(screen.getByLabelText('Hybrid inventory'));

    expect(changeMainContentMock).toHaveBeenCalledWith('hybridInventory');
    expect(changeMainContentMock).toHaveBeenCalledTimes(1);
  });
});
