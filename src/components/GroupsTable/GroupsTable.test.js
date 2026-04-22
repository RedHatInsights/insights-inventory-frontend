/* eslint-disable jsdoc/check-tag-names */
/**
 * @jest-environment jsdom
 */
/* eslint-disable react/prop-types -- inline ActionWithRBAC stubs */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import GroupsTable from './GroupsTable';

jest.mock('../../store/inventory-actions', () => ({
  fetchGroups: jest.fn(() => ({ type: 'MOCK_GROUPS_FETCH' })),
}));

const mockUseWorkspaceActionPermissions = jest.fn();

jest.mock('./useGroupsTableWorkspaceActionPermissions', () => ({
  useGroupsTableWorkspaceActionPermissions: (...args) =>
    mockUseWorkspaceActionPermissions(...args),
}));

jest.mock('lodash/debounce', () => ({
  __esModule: true,
  default: (fn) => {
    const wrapped = (...args) => fn(...args);
    wrapped.cancel = jest.fn();
    return wrapped;
  },
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('../../Utilities/hooks/useFetchBatched', () => ({
  __esModule: true,
  default: () => ({ fetchBatched: jest.fn() }),
}));

jest.mock('../InventoryTable/ActionWithRBAC', () => ({
  ActionButton: ({
    children,
    onClick,
    isAriaDisabled,
    noAccessTooltip,
    override,
    ouiaId,
  }) => (
    <button
      type="button"
      data-ouia-component-id={ouiaId}
      data-testid={ouiaId}
      aria-disabled={isAriaDisabled || undefined}
      data-tooltip={noAccessTooltip}
      data-override={override === undefined ? 'undefined' : String(override)}
      onClick={onClick}
    >
      {children}
    </button>
  ),
  ActionDropdownItem: ({
    children,
    onClick,
    isAriaDisabled,
    noAccessTooltip,
    override,
  }) => (
    <button
      type="button"
      role="menuitem"
      aria-disabled={isAriaDisabled || undefined}
      data-tooltip={noAccessTooltip}
      data-override={override === undefined ? 'undefined' : String(override)}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

const defaultWorkspacePerms = () => ({
  getRowWorkspaceMenuItemProps: () => ({
    isAriaDisabled: false,
    noAccessTooltip: '',
    override: undefined,
  }),
  bulkDeleteMenuItemProps: {
    noAccessTooltip: '',
    override: undefined,
    isKesselGateBusy: false,
  },
  createWorkspaceButtonProps: {
    noAccessTooltip: '',
    override: undefined,
    isAriaDisabled: false,
  },
});

const mockGroups = [
  {
    id: 'group-1',
    name: 'Workspace One',
    host_count: 2,
    updated: '2024-01-01',
  },
];

const buildFulfilledGroupsState = () => ({
  groups: {
    uninitialized: false,
    loading: false,
    fulfilled: true,
    rejected: false,
    data: { results: mockGroups, total: 1, count: 1 },
  },
});

const renderTable = (storeState, props = {}) => {
  const store = configureStore([])(storeState);
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Provider store={store}>
        <GroupsTable
          onCreateGroupClick={props.onCreateGroupClick ?? jest.fn()}
        />
      </Provider>
    </MemoryRouter>,
  );
};

describe('GroupsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWorkspaceActionPermissions.mockImplementation(() =>
      defaultWorkspacePerms(),
    );
  });

  it('calls workspace action permissions hook with groups from the store', () => {
    renderTable(buildFulfilledGroupsState());

    expect(mockUseWorkspaceActionPermissions).toHaveBeenCalledWith({
      groups: mockGroups,
      selectedIds: [],
    });
  });

  it('renders workspace name and Create workspace when data is loaded', () => {
    renderTable(buildFulfilledGroupsState());

    const link = screen.getByRole('link', { name: 'Workspace One' });
    expect(link).toHaveAttribute('href', expect.stringMatching(/group-1$/));
    expect(
      screen.getByRole('button', { name: /create workspace/i }),
    ).toBeInTheDocument();
  });

  it('forwards createWorkspaceButtonProps onto the Create workspace button', () => {
    mockUseWorkspaceActionPermissions.mockReturnValue({
      ...defaultWorkspacePerms(),
      createWorkspaceButtonProps: {
        noAccessTooltip: 'Cannot create',
        override: false,
        isAriaDisabled: true,
      },
    });

    renderTable(buildFulfilledGroupsState());

    const btn = screen.getByTestId('CreateGroupButton');
    expect(btn).toHaveAttribute('data-tooltip', 'Cannot create');
    expect(btn).toHaveAttribute('data-override', 'false');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('invokes onCreateGroupClick when Create workspace is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();
    renderTable(buildFulfilledGroupsState(), { onCreateGroupClick: onCreate });

    await user.click(screen.getByRole('button', { name: /create workspace/i }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('invokes getRowWorkspaceMenuItemProps for rename and delete when the table renders rows', () => {
    const getRow = jest.fn(() => ({
      isAriaDisabled: false,
      noAccessTooltip: '',
      override: undefined,
    }));
    mockUseWorkspaceActionPermissions.mockReturnValue({
      ...defaultWorkspacePerms(),
      getRowWorkspaceMenuItemProps: getRow,
    });

    renderTable(buildFulfilledGroupsState());

    expect(getRow).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: 'group-1',
        groupName: 'Workspace One',
      }),
      'rename',
    );
    expect(getRow).toHaveBeenCalledWith(
      expect.objectContaining({ groupId: 'group-1' }),
      'delete',
    );
  });
});
