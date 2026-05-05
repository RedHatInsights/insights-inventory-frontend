import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GroupDetailHeader from '../GroupDetailHeader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import userEvent from '@testing-library/user-event';
import { useKesselMigrationFeatureFlag } from '../../../Utilities/hooks/useKesselMigrationFeatureFlag';
import { NO_EDIT_WORKSPACE_KESSEL_TOOLTIP_MESSAGE } from '../../../constants';

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

  it('marks the Actions toggle aria-disabled when RBAC denies workspace modify (Kessel migration off)', () => {
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: false }));

    renderHeader();

    expect(screen.getByRole('button', { name: /actions/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('marks the Actions toggle aria-disabled when Kessel workspace edit is denied', () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);

    renderHeader({
      workspaceAccess: {
        gateActive: true,
        canEdit: false,
        isLoading: false,
      },
    });

    expect(screen.getByRole('button', { name: /actions/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('shows a tooltip on Actions when Kessel workspace edit is denied', async () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);

    renderHeader({
      workspaceAccess: {
        gateActive: true,
        canEdit: false,
        isLoading: false,
      },
    });

    await userEvent.hover(
      screen.getByTestId('group-detail-header-actions-tooltip-trigger'),
    );

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible();
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      NO_EDIT_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
    );
  });

  it('does not show a tooltip on Actions when Kessel workspace edit is allowed', async () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);

    renderHeader({
      workspaceAccess: {
        gateActive: true,
        canEdit: true,
        isLoading: false,
      },
    });

    await userEvent.hover(screen.getByRole('button', { name: /actions/i }));

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('marks the Actions toggle aria-disabled while Kessel workspace permissions are loading', () => {
    useKesselMigrationFeatureFlag.mockReturnValue(true);

    renderHeader({
      workspaceAccess: {
        gateActive: true,
        canEdit: true,
        isLoading: true,
      },
    });

    expect(screen.getByRole('button', { name: /actions/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
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
