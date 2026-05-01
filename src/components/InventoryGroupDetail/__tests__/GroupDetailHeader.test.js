import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GroupDetailHeader from '../GroupDetailHeader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import userEvent from '@testing-library/user-event';
import { useKesselMigrationFeatureFlag } from '../../../Utilities/hooks/useKesselMigrationFeatureFlag';

jest.mock('../../../Utilities/useFeatureFlag');
jest.mock('../../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: jest.fn(() => false),
}));

const mockUseSelector = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => mockUseSelector(selector),
  useDispatch: () => () => {},
}));

jest.mock('@redhat-cloud-services/frontend-components-utilities/RBACHook');

const defaultGroupDetailState = {
  uninitialized: false,
  loading: false,
  data: {
    results: [
      {
        name: 'group-name-1',
      },
    ],
  },
};

const renderHeader = (props = {}) =>
  render(
    <MemoryRouter>
      <GroupDetailHeader groupId="group-id-2" {...props} />
    </MemoryRouter>,
  );

describe('group detail header', () => {
  beforeEach(() => {
    mockUseSelector.mockImplementation(() => defaultGroupDetailState);
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
    useKesselMigrationFeatureFlag.mockReturnValue(false);
  });

  it('renders title', () => {
    renderHeader();

    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('renders the actions dropdown', async () => {
    renderHeader();

    screen.getByRole('button', {
      name: /actions/i,
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: /actions/i,
      }),
    );

    expect(screen.getAllByRole('menuitem')).toHaveLength(2);

    expect(
      screen.getByRole('menuitem', {
        name: /rename/i,
      }),
    ).toBeVisible();

    expect(
      screen.getByRole('menuitem', {
        name: /delete/i,
      }),
    ).toBeVisible();
  });

  it('disables the Actions toggle when RBAC denies workspace modify (Kessel migration off)', () => {
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: false }));

    renderHeader();

    expect(screen.getByRole('button', { name: /actions/i })).toBeDisabled();
  });

  it('disables the Actions toggle when Kessel workspace edit is denied', () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);

    renderHeader({
      workspaceAccess: {
        gateActive: true,
        canEdit: false,
        isLoading: false,
      },
    });

    expect(screen.getByRole('button', { name: /actions/i })).toBeDisabled();
  });

  it('disables the Actions toggle while Kessel workspace permissions are loading', () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);

    renderHeader({
      workspaceAccess: {
        gateActive: true,
        canEdit: true,
        isLoading: true,
      },
    });

    expect(screen.getByRole('button', { name: /actions/i })).toBeDisabled();
  });

  it('opens the actions menu when Kessel workspace edit is allowed', async () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);

    renderHeader({
      workspaceAccess: {
        gateActive: true,
        canEdit: true,
        isLoading: false,
      },
    });

    const toggle = screen.getByRole('button', { name: /actions/i });
    expect(toggle).toBeEnabled();

    await userEvent.click(toggle);

    expect(screen.getByRole('menuitem', { name: /rename/i })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeVisible();
  });

  it('disables rename and delete menu items for the ungrouped hosts workspace while keeping Actions enabled', async () => {
    mockUseSelector.mockImplementation(() => ({
      ...defaultGroupDetailState,
      data: {
        results: [
          {
            name: 'group-name-1',
            ungrouped: true,
          },
        ],
      },
    }));

    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: /actions/i }));

    expect(screen.getByRole('menuitem', { name: /rename/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('menuitem', { name: /delete/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});
