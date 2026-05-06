import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import EditButton from './EditButton';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    __esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: false }),
  }),
);

jest.mock('../../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  __esModule: true,
  useKesselMigrationFeatureFlag: jest.fn(() => false),
}));

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

const { useKesselMigrationFeatureFlag } = jest.requireMock(
  '../../../Utilities/hooks/useKesselMigrationFeatureFlag',
);

const checkDisabledEditButton = async (expectedTooltipSubstring) => {
  const button = await screen.findByRole('button', { name: /edit/i });
  await userEvent.hover(button);
  await waitFor(() => {
    expect(screen.queryByRole('tooltip')).toBeVisible();
  });
  expect(screen.queryByRole('tooltip')).toHaveTextContent(
    expectedTooltipSubstring,
  );
  expect(button).toHaveAttribute('aria-disabled', 'true');
};

describe('EditButton with no access', () => {
  let onClick;

  beforeEach(() => {
    onClick = jest.fn();
    useKesselMigrationFeatureFlag.mockReturnValue(false);
  });

  it('disables with no permission', async () => {
    render(<EditButton onClick={onClick} />);
    await checkDisabledEditButton(
      'You do not have the necessary permissions to modify this host.',
    );
  });

  it('disables with no permission - write permissions set to false', async () => {
    render(<EditButton onClick={onClick} writePermissions={false} />);
    await checkDisabledEditButton(
      'You do not have the necessary permissions to modify this host.',
    );
  });

  it('uses Kessel denial tooltip when Kessel migration is on and write permissions are false', async () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);
    render(<EditButton onClick={onClick} writePermissions={false} />);
    await checkDisabledEditButton(
      'You do not have permission to edit this host.',
    );
  });

  it('enables when write permissions are set to true', () => {
    render(<EditButton onClick={onClick} writePermissions={true} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
  });
});
