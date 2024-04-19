import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { AccountStatContext } from '../../Routes';
import InventoryPageHeader from './InventoryPageHeader';

jest.mock('../../Utilities/useFeatureFlag');

const defaultContextValues = {
  hasConventionalSystems: true,
  hasEdgeDevices: true,
  hasBootcImages: true,
};

const defaultProps = {
  changeMainContent: jest.fn(() => () => {}),
  mainContent: 'bifrost',
};

const mountWithContext = (
  props = defaultProps,
  contextValues = defaultContextValues
) => {
  render(
    <AccountStatContext.Provider value={{ ...contextValues }}>
      <InventoryPageHeader {...props} />
    </AccountStatContext.Provider>
  );
};
const user = userEvent.setup();

afterEach(() => {
  jest.clearAllMocks();
});
describe('InventoryContentToggle', () => {
  test('renders toggle items with correct labels and icons', () => {
    useFeatureFlag.mockReturnValue(true);

    mountWithContext();
    expect(screen.getByLabelText('Hybrid inventory')).toBeVisible();
    expect(screen.getByLabelText('Bifrost')).toBeVisible();
    expect(screen.getByLabelText('Bifrost')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('hides toggle items when there is no bootc images', () => {
    useFeatureFlag.mockReturnValue(true);

    mountWithContext(defaultProps, {
      ...defaultContextValues,
      hasBootcImages: false,
    });
    expect(screen.queryByLabelText('Hybrid inventory')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Bifrost')).not.toBeInTheDocument();
    expect(screen.getByText('Systems')).toBeVisible();
  });

  test('calls changeMainContent with correct content key when Bifrost is clicked', async () => {
    mountWithContext();

    await user.click(screen.getByLabelText('Bifrost'));

    expect(defaultProps.changeMainContent).toHaveBeenCalledWith('bifrost');
    expect(defaultProps.changeMainContent).toHaveBeenCalledTimes(1);
  });

  test('calls changeMainContent with correct content key when Hybrid inventory is clicked', async () => {
    mountWithContext();

    await user.click(screen.getByLabelText('Hybrid inventory'));

    expect(defaultProps.changeMainContent).toHaveBeenCalledWith(
      'hybridInventory'
    );
    expect(defaultProps.changeMainContent).toHaveBeenCalledTimes(1);
  });
});
